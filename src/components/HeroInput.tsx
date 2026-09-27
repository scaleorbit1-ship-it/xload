import { useState, useRef } from 'react';
import { Search, Clipboard, X, Loader2, ArrowRight } from 'lucide-react';

interface HeroInputProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
}

export function HeroInput({ onSearch, isLoading }: HeroInputProps) {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSearch(url.trim());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        if (text.includes('twitter.com') || text.includes('x.com') || text.includes('t.co') || /^\d+$/.test(text.trim())) {
          onSearch(text.trim());
        }
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setUrl('');
    inputRef.current?.focus();
  };

  return (
    <section id="downloader" className="relative pt-8 pb-12 sm:pt-14 sm:pb-20 overflow-hidden">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Editorial Heading: Pure White, Medium Weight */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white max-w-3xl mx-auto leading-[1.18] text-balance">
          Download X & Twitter Videos in Ultra HD 1080p
        </h1>

        <p className="mt-3 sm:mt-4 text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance font-medium">
          Paste any post link to extract high-bitrate MP4 videos, animated GIFs, or studio-clean MP3 audio tracks instantly. Zero watermark, zero registration.
        </p>

        {/* Apple Liquid Glass Input Bar */}
        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 max-w-2xl mx-auto">
          <div className="liquid-glass-card p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-center gap-2 shadow-[0_16px_40px_rgba(0,0,0,0.5)] focus-within:border-white/40 transition-all">
            
            <div className="relative flex-1 w-full flex items-center min-w-0 px-2 sm:px-3">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 ml-1 mr-2.5 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste X / Twitter post link..."
                className="w-full bg-transparent text-xs sm:text-base text-white placeholder-slate-400 focus:outline-none py-2 sm:py-2.5 font-sans font-medium truncate"
                disabled={isLoading}
              />
              
              {url && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer mr-1"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handlePaste}
                className="liquid-glass-btn flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-white transition-all cursor-pointer shrink-0"
              >
                <Clipboard className="w-3 h-3 text-[#38bdf8]" />
                <span className="hidden sm:inline">Paste</span>
              </button>
            </div>

            {/* Apple Liquid Glass Primary Download CTA */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 liquid-glass-btn-primary disabled:opacity-40 disabled:cursor-not-allowed rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium shadow-md transition-all cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <span>Download Video</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </section>
  );
}
