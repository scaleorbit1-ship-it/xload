import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroInput } from './components/HeroInput';
import { VideoResultCard } from './components/VideoResultCard';
import { FeaturesSection } from './components/FeaturesSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { BatchQueueModal } from './components/BatchQueueModal';
import { HistorySideNav } from './components/HistorySideNav';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ReflectGridGlow } from './components/ReflectGridGlow';
import { AdBanner } from './components/AdBanner';
import { ADS_CONFIG } from './config/ads';
import { TweetData, VideoVariant, HistoryItem } from './types/tweet';
import { extractTweet, fetchSamples, getProxyDownloadUrl } from './services/api';

const HISTORY_STORAGE_KEY = 'x_downloader_history_v1';

export default function App() {
  const [activeTweet, setActiveTweet] = useState<TweetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [samples, setSamples] = useState<TweetData[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const resultRef = useRef<HTMLDivElement>(null);

  // Load history & sample fixtures on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
    }

    fetchSamples().then((data) => {
      if (data && data.length > 0) {
        setSamples(data);
      }
    });
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSearch = async (url: string) => {
    if (!url.trim()) return;

    setIsLoading(true);
    addToast('info', 'Connecting to X', 'Analyzing media streams and quality bitrates...');

    const res = await extractTweet(url);
    setIsLoading(false);

    if (res.success && res.data) {
      setActiveTweet(res.data);
      addToast('success', 'Media Extracted', `Found ${res.data.media[0]?.variants.length || 1} video resolutions ready for download.`);
      
      if (res.warning) {
        addToast('info', 'Proxy Stream', res.warning);
      }

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      addToast('error', 'Extraction Failed', res.error || 'Could not parse media from this link.');
    }
  };

  const handleSelectSample = (sample: TweetData) => {
    setActiveTweet(sample);
    addToast('success', 'Sample Loaded', `Loaded ${sample.author.name}'s video.`);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSaveHistory = (tweet: TweetData, variant: VideoVariant | null, mediaType: 'video' | 'gif' | 'audio') => {
    const media = tweet.media[0];
    const topVar = variant || media.variants[0];
    const targetUrl = mediaType === 'audio' && media.audioVariant
      ? media.audioVariant.url
      : (topVar?.url || '');

    const newItem: HistoryItem = {
      id: `hist-${Date.now()}`,
      tweetId: tweet.id,
      url: tweet.url,
      title: tweet.text.slice(0, 70) + (tweet.text.length > 70 ? '...' : ''),
      authorName: tweet.author.name,
      authorHandle: tweet.author.screen_name,
      authorAvatar: tweet.author.avatar,
      thumbnail: media.thumbnail,
      duration: media.duration || 0,
      mediaType,
      quality: mediaType === 'audio' ? 'Audio MP3' : (topVar?.quality || 'HD'),
      downloadUrl: getProxyDownloadUrl(targetUrl, `x_saved_${tweet.id}.mp4`, mediaType === 'audio' ? 'audio' : 'video'),
      downloadedAt: Date.now(),
      fileSize: mediaType === 'audio' && media.audioVariant ? media.audioVariant.formattedSize : (topVar?.formattedSize || 'HD')
    };

    setHistory((prev) => {
      // Remove duplicate if same tweet ID already exists
      const filtered = prev.filter((item) => item.tweetId !== tweet.id);
      const updated = [newItem, ...filtered].slice(0, 50); // keep up to 50
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save history to storage', e);
      }
      return updated;
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    addToast('info', 'Item Removed', 'Deleted from local history.');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    addToast('info', 'History Cleared', 'All download records have been cleared.');
  };

  return (
    <div className="relative min-h-screen flex flex-col text-slate-100 font-medium selection:bg-[#1d9bf0]/30 selection:text-[#70c7ff]">
      {/* Interactive WebGL Shader Canvas Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <ReflectGridGlow
          className="w-full h-full"
          glowColor="#1d9bf0"
          coreColor="#e0f2fe"
          glowHeight={0.34}
          coreIntensity={1.5}
          gridScale={24.0}
          gridOpacity={0.24}
          columnWidth={0.50}
          blockActivity={1.0}
        />
      </div>

      {/* Top Bar Navigation */}
      <Navbar
        onOpenBatch={() => setIsBatchOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      <main className="flex-1">
        {/* Hero & Search Input Section */}
        <HeroInput
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {/* Top Responsive Ad Banner */}
        <AdBanner
          slotId={ADS_CONFIG.slots.topBanner}
          format="horizontal"
          label="Advertisement"
        />

        {/* Dynamic Video Extraction Result */}
        {activeTweet && (
          <div ref={resultRef} className="px-4 sm:px-6 lg:px-8 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <VideoResultCard
              tweet={activeTweet}
              onSaveHistory={handleSaveHistory}
              onShowToast={addToast}
            />
            {/* Post-Download In-Content Ad Slot */}
            <AdBanner
              slotId={ADS_CONFIG.slots.resultBanner}
              format="auto"
              label="Sponsored"
            />
          </div>
        )}

        {/* Feature Highlights Section */}
        <FeaturesSection />

        {/* Frequently Asked Questions */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <BatchQueueModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        onSelectResult={(tweet) => {
          setActiveTweet(tweet);
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }}
        onShowToast={addToast}
      />

      {/* Side Nav History Drawer */}
      <HistorySideNav
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onClearHistory={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
        onSelectUrl={(url) => {
          handleSearch(url);
        }}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
