import express from 'express';
import dotenv from 'dotenv';
import { sql } from '@vercel/postgres';
import { createTables } from './database.ts';
import { getFacebookLoginUrl, exchangeCodeForToken } from './auth.ts';
import { getUserPosts, replyToComment, getInstagramAccountId, getPostCaption } from './instagram.ts';
import { generateCampaignReply } from './geminiService.ts';

dotenv.config();
const app = express();
app.use(express.json());

// Initialize tables on the first request
let tablesCreated = false;
app.use(async (req, res, next) => {
  if (!tablesCreated) {
    try {
      await createTables();
      tablesCreated = true;
    } catch (error) {
      return res.status(500).send('Database initialization failed.');
    }
  }
  next();
});

// --- Helper Function to Get Current User ---
async function getCurrentUser() {
  const { rows } = await sql`SELECT * FROM users ORDER BY "createdAt" DESC LIMIT 1`;
  return rows[0] || null;
}

// --- AUTH ---
app.get('/auth/facebook', (req, res) => {
  res.redirect(getFacebookLoginUrl());
});

app.get('/auth/facebook/callback', async (req, res) => {
  const { code } = req.query;
  if (typeof code !== 'string') {
    return res.status(400).send('Authorization code is missing.');
  }
  try {
    const accessToken = await exchangeCodeForToken(code);
    const instagramAccountId = await getInstagramAccountId(accessToken);

    const userId = 'singleton_user';
    await sql`
      INSERT INTO users (id, "accessToken", "instagramAccountId")
      VALUES (${userId}, ${accessToken}, ${instagramAccountId})
      ON CONFLICT (id) DO UPDATE SET
        "accessToken" = EXCLUDED."accessToken",
        "instagramAccountId" = EXCLUDED."instagramAccountId";
    `;

    console.log(`[auth]: Authentication successful.`);
    res.redirect('/');
  } catch (error) {
    console.error('[auth]: Authentication failed:', error);
    res.status(500).send('Authentication failed.');
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
      console.error('[webhook]: No authenticated user found.');
      return res.status(500).send('No user configured');
    }

    for (const entry of req.body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'comments') {
          const { id: commentId, media: { id: mediaId }, text: commentText } = change.value;
          console.log(`[webhook]: New comment on media ${mediaId}`);

          const { rows: campaigns } = await sql`
            SELECT * FROM campaigns WHERE "postId" = ${mediaId} AND status = 'active'
          `;
          const campaign = campaigns[0];

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
  } catch (error) {
    console.error('[webhook]: Error processing webhook:', error);
  } finally {
    res.status(200).send('EVENT_RECEIVED');
  }
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
  const { rows } = await sql`SELECT * FROM campaigns`;
  res.json(rows);
});

app.post('/api/campaigns', async (req, res) => {
  const { id, postId, keyword, tone, status, repliesCount } = req.body;
  await sql`
    INSERT INTO campaigns (id, "postId", keyword, tone, status, "repliesCount")
    VALUES (${id}, ${postId}, ${keyword}, ${tone}, ${status}, ${repliesCount});
  `;
  res.status(201).json(req.body);
});

app.delete('/api/campaigns/:id', async (req, res) => {
  await sql`DELETE FROM campaigns WHERE id = ${req.params.id}`;
  res.status(204).send();
});

export default app;
