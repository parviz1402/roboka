import express from 'express';
import dotenv from 'dotenv';
import { getDb } from './database.ts';
import { getFacebookLoginUrl, exchangeCodeForToken } from './auth.ts';
import { getUserPosts, replyToComment, getInstagramAccountId, getPostCaption } from './instagram.ts';
import { generateCampaignReply } from './geminiService.ts';

dotenv.config();

const app = express();
app.use(express.json());

// --- Helper Function to Get Current User ---
async function getCurrentUser() {
  const db = await getDb();
  return db.get('SELECT * FROM users ORDER BY createdAt DESC LIMIT 1');
}

// --- AUTH ---
app.get('/auth/facebook', (req, res) => {
  res.redirect(getFacebookLoginUrl());
});

app.get('/auth/facebook/callback', async (req, res) => {
  const { code } = req.query;
  if (typeof code !== 'string') {
    return res.status(400).send('Authorization code is missing or invalid.');
  }
  try {
    const accessToken = await exchangeCodeForToken(code);
    const instagramAccountId = await getInstagramAccountId(accessToken);

    const db = await getDb();
    const userId = 'singleton_user';
    await db.run(
      'INSERT OR REPLACE INTO users (id, accessToken, instagramAccountId) VALUES (?, ?, ?)',
      [userId, accessToken, instagramAccountId]
    );

    console.log(`[auth]: Authentication successful. User data stored.`);
    res.redirect('/');
  } catch (error) {
    console.error('[auth]: Authentication failed:', error);
    res.status(500).send('Failed to authenticate with Facebook.');
  }
});

// --- WEBHOOK ---
app.post('/webhook', async (req, res) => {
  if (req.body.object !== 'instagram') {
    return res.sendStatus(404);
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      console.error('[webhook]: Cannot process webhook, no authenticated user found.');
      return res.status(500).send('No user configured');
    }

    const db = await getDb();
    for (const entry of req.body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'comments') {
          const { id: commentId, media: { id: mediaId }, text: commentText } = change.value;
          console.log(`[webhook]: New comment: "${commentText}" on media ${mediaId}`);

          const campaign = await db.get('SELECT * FROM campaigns WHERE postId = ? AND status = "active"', mediaId);
          if (campaign && commentText.includes(campaign.keyword)) {
            console.log(`[webhook]: Keyword matched. Generating reply...`);
            const postCaption = await getPostCaption(user.accessToken, mediaId);
            const aiResponse = await generateCampaignReply(commentText, campaign.keyword, postCaption, campaign.tone);
            if (aiResponse.publicReply) {
              await replyToComment(user.accessToken, commentId, aiResponse.publicReply);
            }
          }
        }
      }
    }
  } catch(error) {
    console.error('[webhook]: Error processing webhook:', error);
  } finally {
    res.status(200).send('EVENT_RECEIVED');
  }
});


// --- API for Frontend ---
app.get('/api/posts', async (req, res) => {
  try {
    const user = await getCurrentUser();
    if (!user) return res.status(401).send('Not authenticated');

    const posts = await getUserPosts(user.accessToken, user.instagramAccountId);
    res.json(posts);
  } catch (e) {
    console.error('[api/posts]:', e);
    res.status(500).send('Failed to fetch posts');
  }
});

app.get('/api/campaigns', async (req, res) => {
  const db = await getDb();
  res.json(await db.all('SELECT * FROM campaigns'));
});

app.post('/api/campaigns', async (req, res) => {
  const db = await getDb();
  const { id, postId, keyword, tone, status, repliesCount } = req.body;
  await db.run('INSERT INTO campaigns (id, postId, keyword, tone, status, repliesCount) VALUES (?, ?, ?, ?, ?, ?)', [id, postId, keyword, tone, status, repliesCount]);
  res.status(201).json(req.body);
});

app.delete('/api/campaigns/:id', async (req, res) => {
  const db = await getDb();
  await db.run('DELETE FROM campaigns WHERE id = ?', req.params.id);
  res.status(204).send();
});

// Export the app instance for Vercel
export default app;
