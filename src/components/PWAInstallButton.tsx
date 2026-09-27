import { useState } from 'react';
import { Download, Smartphone, X, Check, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppLogo } from './AppLogo';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as installed standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / ChromeOS / Desktop Flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="liquid-glass-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-white cursor-pointer group"
        title="Install XloadHD on ChromeOS, Android, or PC"
      >
        <div className="w-4 h-4 rounded-full bg-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8] group-hover:scale-110 transition-transform">
          <Download className="w-2.5 h-2.5" />
        </div>
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  // iOS Safari Flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl liquid-glass-card p-6 shadow-2xl relative border border-white/20">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <AppLogo size={42} showText={false} />
                <div>
                  <h3 className="text-base font-medium text-white">Install XloadHD</h3>
                  <p className="text-xs text-slate-400">Add to your iPhone or iPad home screen</p>
                </div>
              </div>

              <div className="space-y-3 my-5 text-xs text-slate-200">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#38bdf8] text-slate-950 font-bold flex items-center justify-center text-[11px] shrink-0 font-mono">1</span>
                  <p>In Safari, tap the <strong className="text-white">Share</strong> button at the bottom toolbar.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#38bdf8] text-slate-950 font-bold flex items-center justify-center text-[11px] shrink-0 font-mono">2</span>
                  <p>Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl liquid-glass-btn-primary text-xs font-medium cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback ChromeOS / Desktop badge if beforeinstallprompt has not fired yet or browser allows generic install prompt
  return (
    <button
      onClick={() => {
        // Trigger manual guidance if browser didn't emit beforeinstallprompt
        alert('To install on ChromeOS or Desktop, click the Install icon (⤓) in your browser address bar.');
      }}
      className="hidden md:inline-flex liquid-glass-btn items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white cursor-pointer group"
      title="Install as ChromeOS PWA or desktop app"
    >
      <Laptop className="w-3.5 h-3.5 text-[#38bdf8] group-hover:scale-110 transition-transform" />
      <span>Install PWA</span>
    </button>
  );
}
