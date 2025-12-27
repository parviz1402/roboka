import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export function getFacebookLoginUrl() {
  const appId = process.env.FACEBOOK_APP_ID;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
  const scope = [
    'instagram_basic',
    'instagram_manage_comments',
    'pages_show_list',
    'pages_read_engagement'
  ].join(',');

  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  return url;
}

export async function exchangeCodeForToken(code) {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

  const url = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`;

  try {
    const response = await axios.get(url);
    return response.data.access_token;
  } catch (error) {
    console.error('[auth]: Error exchanging code for token:', error.response?.data);
    throw new Error('Failed to exchange code for token');
  }
}
