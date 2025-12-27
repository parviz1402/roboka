import axios from 'axios';

const GRAPH_API_URL = 'https://graph.facebook.com/v19.0';

export async function getUserPosts(accessToken: string, instagramUserId: string) {
  const url = `${GRAPH_API_URL}/${instagramUserId}/media`;
  const params = {
    fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username',
    access_token: accessToken,
  };

  try {
    const response = await axios.get(url, { params });
    // Filter for images and videos only, as stories/reels might not be suitable
    const suitableMedia = response.data.data.filter(
      (item: any) => item.media_type === 'IMAGE' || item.media_type === 'VIDEO' || item.media_type === 'CAROUSEL_ALBUM'
    );
    return suitableMedia;
  } catch (error) {
    console.error('[instagram]: Error fetching user posts:', error.response?.data);
    throw new Error('Failed to fetch Instagram posts');
  }
}

export async function replyToComment(accessToken: string, commentId: string, replyText: string) {
  const url = `${GRAPH_API_URL}/${commentId}/replies`;
  const params = {
    message: replyText,
    access_token: accessToken,
  };

  try {
    const response = await axios.post(url, {}, { params });
    console.log('[instagram]: Successfully replied to comment:', commentId);
    return response.data;
  } catch (error) {
    console.error('[instagram]: Error replying to comment:', error.response?.data);
    throw new Error('Failed to reply to comment');
  }
}

export async function getInstagramAccountId(accessToken: string) {
  try {
    // 1. Get the user's Facebook Pages
    const pagesUrl = `${GRAPH_API_URL}/me/accounts`;
    const pagesResponse = await axios.get(pagesUrl, {
      params: { access_token: accessToken },
    });

    const pages = pagesResponse.data.data;
    if (!pages || pages.length === 0) {
      throw new Error('No Facebook pages found for this user.');
    }
    const pageId = pages[0].id; // Use the first page

    // 2. Get the Instagram Business Account connected to that page
    const igAccountUrl = `${GRAPH_API_URL}/${pageId}`;
    const igAccountResponse = await axios.get(igAccountUrl, {
      params: {
        fields: 'instagram_business_account',
        access_token: accessToken,
      },
    });

    const instagramAccountId = igAccountResponse.data?.instagram_business_account?.id;
    if (!instagramAccountId) {
      throw new Error('No Instagram Business Account linked to the Facebook page.');
    }

    console.log(`[instagram]: Found Instagram Account ID: ${instagramAccountId}`);
    return instagramAccountId;
  } catch (error) {
    console.error('[instagram]: Error fetching Instagram Account ID:', error.response?.data || error.message);
    throw new Error('Failed to fetch Instagram Account ID');
  }
}

export async function getPostCaption(accessToken: string, mediaId: string): Promise<string> {
  const url = `${GRAPH_API_URL}/${mediaId}`;
  try {
    const response = await axios.get(url, {
      params: {
        fields: 'caption',
        access_token: accessToken,
      },
    });
    return response.data.caption || ''; // Return caption or empty string if not present
  } catch (error) {
    console.error(`[instagram]: Error fetching caption for media ${mediaId}:`, error.response?.data);
    throw new Error('Failed to fetch post caption');
  }
}
