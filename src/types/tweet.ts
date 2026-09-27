export interface VideoVariant {
  quality: string;
  resolution: string;
  bitrate: number;
  sizeBytes: number;
  formattedSize: string;
  format: string;
  url: string;
}

export interface AudioVariant {
  quality: string;
  bitrate: number;
  sizeBytes: number;
  formattedSize: string;
  format: string;
  url: string;
}

export interface MediaItem {
  type: 'video' | 'gif' | 'photo';
  thumbnail: string;
  duration?: number;
  aspectRatio?: string;
  variants: VideoVariant[];
  audioVariant?: AudioVariant;
}

export interface TweetAuthor {
  name: string;
  screen_name: string;
  avatar: string;
  verified: boolean;
}

export interface TweetData {
  id: string;
  url: string;
  text: string;
  author: TweetAuthor;
  likes: number;
  retweets: number;
  replies: number;
  views: string | number;
  created_at: string;
  media: MediaItem[];
}

export interface HistoryItem {
  id: string;
  tweetId: string;
  url: string;
  title: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  thumbnail: string;
  duration: number;
  mediaType: 'video' | 'gif' | 'audio';
  quality: string;
  downloadUrl: string;
  downloadedAt: number;
  fileSize: string;
}

export interface BatchItem {
  id: string;
  url: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  data?: TweetData;
}
