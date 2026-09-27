import { useEffect, useRef } from 'react';
import { ADS_CONFIG } from '../config/ads';
import { Sparkles } from 'lucide-react';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
  label?: string;
}

export function AdBanner({
  slotId = ADS_CONFIG.slots.topBanner,
  format = 'auto',
  className = '',
  label = 'Advertisement'
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  const hasLiveClient = ADS_CONFIG.enabled && ADS_CONFIG.adClient.trim().length > 0;

  useEffect(() => {
    if (!hasLiveClient || isLoaded.current) return;

    try {
      // Inject AdSense script once if not already present
      if (!document.querySelector(`script[src*="pagead2.googlesyndication.com"]`)) {
        const script = document.createElement('script');
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.adClient}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      isLoaded.current = true;
    } catch (e) {
      console.warn('AdSense push error:', e);
    }
  }, [hasLiveClient]);

  if (!ADS_CONFIG.enabled) {
    return null;
  }

  return (
    <div className={`w-full max-w-4xl mx-auto my-4 sm:my-6 px-4 ${className}`}>
      {/* Subtle Ad Disclaimer Header */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 px-1">
        <span>{label}</span>
        <span className="text-slate-600">Sponsored</span>
      </div>

      {/* Liquid Glass Ad Container */}
      <div
        ref={adRef}
        className="w-full min-h-[90px] sm:min-h-[100px] rounded-2xl liquid-glass border border-white/10 p-2 sm:p-3 flex items-center justify-center overflow-hidden relative"
      >
        {hasLiveClient ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', textAlign: 'center' }}
            data-ad-client={ADS_CONFIG.adClient}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        ) : (
          /* Apple Liquid Glass Placeholder Slot (Shows until live ad ID is inserted) */
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 py-4 px-6 text-center text-xs text-slate-400 font-medium">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#38bdf8] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-300 font-medium">
                Ad Slot Active ({format === 'horizontal' ? '728x90' : 'Responsive'})
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ready for Google AdSense / network tags. Connect your Publisher ID in <code className="text-[#38bdf8] font-mono">src/config/ads.ts</code>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
