
export interface InstagramAccount {
  username: string;
  avatar?: string;
  followers: number;
  following: number;
  status: 'connected' | 'disconnected' | 'connecting';
}

export interface Target {
  id: string;
  type: 'hashtag' | 'location' | 'user';
  value: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'like' | 'follow' | 'unfollow' | 'comment' | 'direct';
  target: string;
  status: 'success' | 'failed' | 'pending';
}
