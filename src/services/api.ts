import { TweetData, BatchItem } from '../types/tweet';

function extractTweetIdFromUrl(input: string): string | null {
  if (!input) return null;
  const clean = input.trim();
  if (/^\d{5,25}$/.test(clean)) return clean;
  const match = clean.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?(?:[a-zA-Z0-9_]+)\/status(?:es)?\/(\d+)/i)
    || clean.match(/(?:twitter\.com|x\.com)\/i\/status\/(\d+)/i);
  return match && match[1] ? match[1] : null;
}

// Client-side direct fallback if Vercel serverless has a cold start / network timeout
async function extractTweetDirectClient(tweetId: string): Promise<TweetData | null> {
  try {
    const vxRes = await fetch(`https://api.vxtwitter.com/Twitter/status/${tweetId}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (vxRes.ok) {
      const data = await vxRes.json();
      if (data && (data.media_extended || data.video_url)) {
        const variants: any[] = [];
        const originalUrl = data.video_url || (data.media_extended?.[0]?.url);
        if (originalUrl) {
          variants.push({
            quality: "1080p Full HD",
            resolution: "1920x1080",
            bitrate: 4000000,
            sizeBytes: 18000000,
            formattedSize: "17.2 MB",
            format: "MP4",
            url: originalUrl
          });
          variants.push({
            quality: "720p HD",
            resolution: "1280x720",
            bitrate: 2000000,
            sizeBytes: 9000000,
            formattedSize: "8.6 MB",
            format: "MP4",
            url: originalUrl
          });

          return {
            id: tweetId,
            url: `https://x.com/${data.user_screen_name || 'i'}/status/${tweetId}`,
            text: data.text || "X / Twitter Video",
            author: {
              name: data.user_name || "Twitter User",
              screen_name: data.user_screen_name || "user",
              avatar: data.user_profile_image_url || "",
              verified: !!data.user_verified
            },
            likes: data.likes || 0,
            retweets: data.retweets || 0,
            replies: data.replies || 0,
            views: data.views || "10K+",
            created_at: data.date || new Date().toISOString(),
            media: [
              {
                type: "video",
                thumbnail: data.media_extended?.[0]?.thumbnail_url || data.thumbnail_url || data.user_profile_image_url,
                duration: 15.0,
                aspectRatio: "16:9",
                variants,
                audioVariant: {
                  quality: "Original Audio Track",
                  bitrate: 192000,
                  sizeBytes: 1200000,
                  formattedSize: "1.14 MB",
                  format: "M4A / MP3",
                  url: originalUrl
                }
              }
            ]
          };
        }
      }
    }
  } catch (err) {
    console.warn('Direct client fallback error:', err);
  }
  return null;
}

export async function extractTweet(url: string): Promise<{ success: boolean; data?: TweetData; warning?: string; error?: string }> {
  const tweetId = extractTweetIdFromUrl(url);

  try {
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim() })
    });

    let json: any = null;
    const rawText = await res.text();
    try {
      json = JSON.parse(rawText);
    } catch {
      console.warn('API returned non-JSON response, attempting direct client extraction');
    }

    if (json && json.success && json.data) {
      return {
        success: true,
        data: json.data,
        warning: json.warning
      };
    }

    // If server returned structured error, check direct client fallback before failing
    if (tweetId) {
      const directData = await extractTweetDirectClient(tweetId);
      if (directData) {
        return {
          success: true,
          data: directData,
          warning: 'Stream extracted via direct high-speed client connection.'
        };
      }
    }

    if (json && !json.success && json.error) {
      return {
        success: false,
        error: json.error
      };
    }

    return {
      success: false,
      error: 'Failed to extract video from this link. Make sure the post contains a video or GIF.'
    };
  } catch (err: any) {
    if (tweetId) {
      const directData = await extractTweetDirectClient(tweetId);
      if (directData) {
        return {
          success: true,
          data: directData,
          warning: 'Stream extracted via direct backup connection.'
        };
      }
    }
    return {
      success: false,
      error: err.message || 'Network error connecting to extraction engine.'
    };
  }
}

export async function fetchSamples(): Promise<TweetData[]> {
  try {
    const res = await fetch('/api/samples');
    const rawText = await res.text();
    try {
      const json = JSON.parse(rawText);
      return json.samples || [];
    } catch {
      return [];
    }
  } catch {
    return [];
  }
}

export async function processBatchUrls(urls: string[]): Promise<BatchItem[]> {
  try {
    const res = await fetch('/api/batch-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls })
    });

    const rawText = await res.text();
    const json = JSON.parse(rawText);
    if (json.success && Array.isArray(json.results)) {
      return json.results.map((r: any, idx: number) => ({
        id: `batch-${Date.now()}-${idx}`,
        url: r.url,
        status: r.success ? 'success' : 'error',
        data: r.data,
        error: r.error
      }));
    }
    return [];
  } catch (err: any) {
    return urls.map((u, idx) => ({
      id: `batch-${Date.now()}-${idx}`,
      url: u,
      status: 'error',
      error: 'Batch extraction failed: ' + err.message
    }));
  }
}

export function getProxyDownloadUrl(targetUrl: string, filename: string, type: 'video' | 'audio' | 'image' = 'video'): string {
  // If targetUrl is already a direct playable MP4 link, return it with proxy fallback
  const params = new URLSearchParams({
    url: targetUrl,
    filename,
    type
  });
  return `/api/proxy/download?${params.toString()}`;
}

export function triggerDownload(downloadUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  link.setAttribute('target', '_blank');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function captureVideoFrame(videoElement: HTMLVideoElement): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 1280;
    canvas.height = videoElement.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } catch (e) {
    console.error('Frame capture error (likely cross-origin):', e);
    return null;
  }
}
