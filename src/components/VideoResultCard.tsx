import { useState } from 'react';
import {
  Download,
  ExternalLink,
  Copy,
  Music,
  Image as ImageIcon,
  Check,
  Heart,
  Repeat2,
  MessageCircle,
  Eye,
  Bookmark,
  Share2,
  FileVideo,
  Film,
  Sparkles
} from 'lucide-react';
import { TweetData, VideoVariant } from '../types/tweet';
import { CustomPlayer } from './CustomPlayer';
import { getProxyDownloadUrl, triggerDownload } from '../services/api';

interface VideoResultCardProps {
  tweet: TweetData;
  onSaveHistory: (tweet: TweetData, variant: VideoVariant | null, mediaType: 'video' | 'gif' | 'audio') => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export function VideoResultCard({ tweet, onSaveHistory, onShowToast }: VideoResultCardProps) {
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'snapshot'>('video');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [customSnapshot, setCustomSnapshot] = useState<string | null>(null);

  const currentMedia = tweet.media[selectedMediaIdx] || tweet.media[0];
  const defaultVideoUrl = currentMedia?.variants[0]?.url || '';

  const handleDownloadVariant = (variant: VideoVariant) => {
    const filename = `x_${tweet.author.screen_name}_${variant.resolution.replace('x', '_')}_${Date.now()}.mp4`;
    const downloadUrl = getProxyDownloadUrl(variant.url, filename, 'video');

    setDownloadingId(variant.quality);
    onShowToast('info', 'Starting Download', `Fetching ${variant.quality} (${variant.formattedSize})...`);

    try {
      triggerDownload(downloadUrl, filename);
      onSaveHistory(tweet, variant, currentMedia.type === 'gif' ? 'gif' : 'video');
      
      setTimeout(() => {
        setDownloadingId(null);
        onShowToast('success', 'Download Initiated', `${filename} is saving to your downloads.`);
      }, 1500);
    } catch {
      setDownloadingId(null);
      onShowToast('error', 'Download Failed', 'Please try copying the direct link instead.');
    }
  };

  const handleDownloadAudio = () => {
    if (!currentMedia.audioVariant) return;
    const filename = `x_audio_${tweet.author.screen_name}_${Date.now()}.mp3`;
    const downloadUrl = getProxyDownloadUrl(currentMedia.audioVariant.url, filename, 'audio');

    setDownloadingId('audio');
    onShowToast('info', 'Extracting Audio Track', 'Preparing high quality audio MP3...');

    try {
      triggerDownload(downloadUrl, filename);
      onSaveHistory(tweet, null, 'audio');
      setTimeout(() => {
        setDownloadingId(null);
        onShowToast('success', 'Audio Downloaded', `${filename} ready.`);
      }, 1500);
    } catch {
      setDownloadingId(null);
      onShowToast('error', 'Audio Extraction Failed', 'Please try again.');
    }
  };

  const handleDownloadThumbnail = () => {
    const targetUrl = customSnapshot || currentMedia.thumbnail;
    const filename = `x_cover_${tweet.author.screen_name}_${Date.now()}.jpg`;
    
    if (customSnapshot) {
      // Direct base64 download
      const link = document.createElement('a');
      link.href = customSnapshot;
      link.download = `x_frame_capture_${Date.now()}.png`;
      link.click();
      onShowToast('success', 'Frame Saved', 'Video snapshot saved as PNG.');
      return;
    }

    const downloadUrl = getProxyDownloadUrl(targetUrl, filename, 'image');
    triggerDownload(downloadUrl, filename);
    onShowToast('success', 'Thumbnail Downloaded', 'High resolution cover image saved.');
  };

  const handleCopyLink = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    onShowToast('success', 'Link Copied', `${label} direct stream link copied to clipboard.`);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Format Tweet text with hashtag & mention highlighting
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-[#1d9bf0] font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-sky-400 font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('http://') || part.startsWith('https://')) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1d9bf0] hover:underline"
          >
            {part.length > 28 ? part.slice(0, 25) + '...' : part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 sm:my-8 liquid-glass-card rounded-2xl sm:rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.6)] overflow-hidden">
      
      {/* Header Bar: Author & Tweet Metadata */}
      <div className="p-4 sm:p-6 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Author lockup */}
        <div className="flex items-center gap-3">
          <img
            src={tweet.author.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
            alt={tweet.author.name}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-white/20 bg-slate-800 shrink-0 shadow-md"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-white text-sm sm:text-base leading-tight">
                {tweet.author.name}
              </span>
              {tweet.author.verified && (
                <svg className="w-4 h-4 text-[#38bdf8] fill-current" viewBox="0 0 24 24">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.146 2.018-2.146 3.6 0 1.49.776 2.784 1.933 3.446-.114.4-.176.82-.176 1.254 0 2.208 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.434-.062-.855-.176-1.254 1.157-.662 1.933-1.956 1.933-3.446zm-11.8 4.2-3.6-3.6 1.4-1.4 2.2 2.2 5.7-5.7 1.4 1.4-7.1 7.1z" />
                </svg>
              )}
            </div>
            
            {/* Zero-Pill Unboxed Metadata with · separator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5 font-medium">
              <span>@{tweet.author.screen_name}</span>
              <span aria-hidden="true">·</span>
              <span>
                {tweet.created_at ? new Date(tweet.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{currentMedia.type}</span>
            </div>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSaveHistory(tweet, currentMedia.variants[0] || null, currentMedia.type === 'gif' ? 'gif' : 'video')}
            className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white rounded-xl cursor-pointer"
            title="Bookmark this post"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <a
            href={tweet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white rounded-xl"
          >
            <span>Open on X</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

      {/* Tweet Body Content */}
      <div className="p-4 sm:p-6 pb-2">
        <p className="text-xs sm:text-base text-slate-100 leading-relaxed break-words whitespace-pre-line font-medium">
          {renderFormattedText(tweet.text)}
        </p>

        {/* Engagement Stats: Tabular Numerals */}
        <div className="flex items-center gap-5 mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-mono tabular-nums font-medium text-slate-200">{Number(tweet.likes).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Repeat2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono tabular-nums font-medium text-slate-200">{Number(tweet.retweets).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono tabular-nums font-medium text-slate-200">{Number(tweet.replies).toLocaleString()}</span>
          </div>
          {tweet.views && (
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-mono tabular-nums font-medium text-slate-200">{tweet.views}</span>
            </div>
          )}
        </div>
      </div>

      {/* Multi-video switcher if tweet contains multiple items */}
      {tweet.media.length > 1 && (
        <div className="px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto border-t border-white/10">
          <span className="text-xs text-slate-400 font-medium shrink-0">Videos in Tweet:</span>
          {tweet.media.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedMediaIdx(idx)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
                selectedMediaIdx === idx
                  ? 'liquid-glass-btn-primary shadow-sm'
                  : 'liquid-glass-btn text-slate-300'
              }`}
            >
              Video {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Media Player Section */}
      <div className="p-3 sm:p-6 bg-black/40 border-y border-white/10">
        <CustomPlayer
          src={defaultVideoUrl}
          poster={currentMedia.thumbnail}
          onSnapshot={(dataUrl) => {
            setCustomSnapshot(dataUrl);
            setActiveTab('snapshot');
            onShowToast('success', 'Frame Captured', 'Snapshot ready for download.');
          }}
        />
      </div>

      {/* Interactive Tabs: Video Qualities / Audio Extraction / Thumbnail Snapshot */}
      <div className="p-4 sm:p-6">
        
        {/* Tab Switcher - Liquid Glass Segmented Pill */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.05] rounded-2xl border border-white/10 mb-6 max-w-md shadow-inner">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'liquid-glass-btn-primary shadow-sm text-slate-950 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileVideo className="w-4 h-4" />
            <span>Video (MP4)</span>
          </button>

          {currentMedia.audioVariant && (
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === 'audio'
                  ? 'liquid-glass-btn-primary shadow-sm text-slate-950 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Audio (MP3)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('snapshot')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === 'snapshot'
                ? 'liquid-glass-btn-primary shadow-sm text-slate-950 font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Snapshot</span>
          </button>
        </div>

        {/* TAB 1: VIDEO QUALITIES LIST */}
        {activeTab === 'video' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
              <span>Resolution Streams</span>
              <span>Fast Download</span>
            </div>

            <div className="grid gap-2">
              {currentMedia.variants.map((variant, index) => {
                const isDownloading = downloadingId === variant.quality;
                const isCopied = copiedUrl === variant.url;

                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/25 flex items-center justify-center shrink-0 shadow-inner">
                        <Film className="w-5 h-5 text-[#38bdf8]" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">
                            {variant.quality}
                          </span>
                          <span className="text-[11px] font-mono text-[#38bdf8] bg-[#38bdf8]/15 px-2 py-0.5 rounded-md border border-[#38bdf8]/25">
                            {variant.resolution}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-medium">
                          <span className="font-mono tabular-nums">{variant.formattedSize}</span>
                          <span aria-hidden="true">·</span>
                          <span>{variant.format}</span>
                          {variant.bitrate > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">{Math.round(variant.bitrate / 1000)} kbps</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLink(variant.url, variant.quality)}
                        className="liquid-glass-btn p-2 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                        title="Copy direct stream URL"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDownloadVariant(variant)}
                        disabled={isDownloading}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 liquid-glass-btn-primary disabled:opacity-50 text-slate-950 font-medium text-xs rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        {isDownloading ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download MP4</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: AUDIO EXTRACTION */}
        {activeTab === 'audio' && currentMedia.audioVariant && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-sky-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg">
                  <Music className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-white">
                    {currentMedia.audioVariant.quality}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                    Extract crystal clear sound from the tweet into high-bitrate MP3/M4A.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5 font-mono tabular-nums font-medium">
                    <span>Size: {currentMedia.audioVariant.formattedSize}</span>
                    <span aria-hidden="true">·</span>
                    <span>192 kbps MP3</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleCopyLink(currentMedia.audioVariant!.url, 'Audio')}
                  className="liquid-glass-btn p-2.5 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                  title="Copy Audio Stream Link"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDownloadAudio}
                  disabled={downloadingId === 'audio'}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 liquid-glass-btn-primary disabled:opacity-50 text-slate-950 font-medium text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Audio (.mp3)</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: SNAPSHOT & THUMBNAIL */}
        {activeTab === 'snapshot' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <div className="flex flex-col md:flex-row items-center gap-5">
              
              <div className="w-full md:w-52 h-32 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0 relative group">
                <img
                  src={customSnapshot || currentMedia.thumbnail}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                {customSnapshot && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium bg-[#38bdf8] text-slate-950 rounded-md">
                    Captured Frame
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h4 className="text-sm sm:text-base font-medium text-white">
                  {customSnapshot ? 'Custom Video Snapshot (Frame Grab)' : 'High Resolution Video Cover'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">
                  {customSnapshot
                    ? 'Captured at full native video resolution. Save this exact video frame as PNG.'
                    : 'Download the official post thumbnail and cover art.'}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleDownloadThumbnail}
                    className="inline-flex items-center gap-2 px-4 py-2 liquid-glass-btn-primary text-slate-950 font-medium text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{customSnapshot ? 'Download Captured PNG' : 'Download Cover Image'}</span>
                  </button>

                  {customSnapshot && (
                    <button
                      onClick={() => setCustomSnapshot(null)}
                      className="liquid-glass-btn px-3 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                    >
                      Reset to Cover
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
