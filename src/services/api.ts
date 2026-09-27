import { TweetData, BatchItem } from '../types/tweet';

export async function extractTweet(url: string): Promise<{ success: boolean; data?: TweetData; warning?: string; error?: string }> {
  try {
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim() })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return {
        success: false,
        error: json.error || 'Failed to extract video from this link. Make sure the post contains a video or GIF.'
      };
    }

    return {
      success: true,
      data: json.data,
      warning: json.warning
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to extraction engine.'
    };
  }
}

export async function fetchSamples(): Promise<TweetData[]> {
  try {
    const res = await fetch('/api/samples');
    const json = await res.json();
    return json.samples || [];
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

    const json = await res.json();
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
