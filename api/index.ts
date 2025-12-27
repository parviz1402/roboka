import express from 'express';
import dotenv from 'dotenv';
import { openDb } from './database.ts';
import { getFacebookLoginUrl, exchangeCodeForToken } from './auth.ts';
import { getUserPosts, replyToComment, getInstagramAccountId, getPostCaption } from './instagram.ts';
import { generateCampaignReply } from './geminiService.ts';

dotenv.config();

const app = express();
app.use(express.json());

// --- Database Initialization ---
let db;
openDb().then(database => {
  db = database;
  console.log('[database]: DB connection ready.');
}).catch(console.error);

// --- Helper Function to Get Current User ---
async function getCurrentUser() {
  if (!db) return null;
  return await db.get('SELECT * FROM users ORDER BY createdAt DESC LIMIT 1');
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

  const user = await getCurrentUser();
  if (!user) {
    console.error('[webhook]: Cannot process webhook, no authenticated user found.');
    return res.status(500).send('No user configured');
  }

  for (const entry of req.body.entry) {
    for (const change of entry.changes) {
      if (change.field === 'comments') {
        const { id: commentId, media: { id: mediaId }, text: commentText } = change.value;

        console.log(`[webhook]: New comment: "${commentText}" on media ${mediaId}`);

        try {
          const campaign = await db.get('SELECT * FROM campaigns WHERE postId = ? AND status = "active"', mediaId);

          if (campaign && commentText.includes(campaign.keyword)) {
            console.log(`[webhook]: Keyword "${campaign.keyword}" matched. Generating AI reply...`);

            const postCaption = await getPostCaption(user.accessToken, mediaId);

            const aiResponse = await generateCampaignReply(commentText, campaign.keyword, postCaption, campaign.tone);

            if (aiResponse.publicReply) {
              await replyToComment(user.accessToken, commentId, aiResponse.publicReply);
            }
          }
        } catch (error) {
          console.error('[webhook]: Error processing comment:', error);
        }
      }
    }
  }

  res.status(200).send('EVENT_RECEIVED');
});


// --- API for Frontend ---
app.get('/api/posts', async (req, res) => {
  const user = await getCurrentUser();
  if (!user) return res.status(401).send('Not authenticated');

  try {
    const posts = await getUserPosts(user.accessToken, user.instagramAccountId);
    res.json(posts);
  } catch (e) { res.status(500).send('Failed to fetch posts'); }
});

app.get('/api/campaigns', async (req, res) => {
  if (!db) return res.status(500).send('DB not ready');
  res.json(await db.all('SELECT * FROM campaigns'));
});

app.post('/api/campaigns', async (req, res) => {
  if (!db) return res.status(500).send('DB not ready');
  const { id, postId, keyword, tone, status, repliesCount } = req.body;
  await db.run('INSERT INTO campaigns (id, postId, keyword, tone, status, repliesCount) VALUES (?, ?, ?, ?, ?, ?)', [id, postId, keyword, tone, status, repliesCount]);
  res.status(201).json(req.body);
});

app.delete('/api/campaigns/:id', async (req, res) => {
    if (!db) return res.status(500).send('DB not ready');
    await db.run('DELETE FROM campaigns WHERE id = ?', req.params.id);
    res.status(204).send();
});

// Export the app instance for Vercel
export default app;
