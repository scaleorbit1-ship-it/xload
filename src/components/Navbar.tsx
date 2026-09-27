import { History, Layers } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onOpenBatch: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export function Navbar({ onOpenBatch, onOpenHistory, historyCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-3 pb-2 transition-all">
      <div className="max-w-7xl mx-auto liquid-glass rounded-2xl px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between shadow-[0_10px_35px_rgba(0,0,0,0.4)]">
        
        {/* Zone 1: Unique SVG Brand Logo with Liquid Glass styling */}
        <a href="/" className="flex items-center gap-2 group focus:outline-none">
          <AppLogo size={36} />
        </a>

        {/* Zone 2: Navigation Links (Clean desktop navigation) */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
          <a href="#downloader" className="hover:text-white transition-colors">
            Downloader
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
          <button
            onClick={onOpenBatch}
            className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Batch Queue</span>
          </button>
        </nav>

        {/* Zone 3: Apple Liquid Glass Interactive Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* PWA Install Button for ChromeOS & Mobile */}
          <PWAInstallButton />

          {/* Batch Button for mobile view */}
          <button
            onClick={onOpenBatch}
            className="md:hidden liquid-glass-btn p-2 rounded-xl text-white cursor-pointer"
            aria-label="Open Batch Queue"
            title="Batch Queue"
          >
            <Layers className="w-4 h-4 text-[#38bdf8]" />
          </button>

          {/* History Drawer Trigger Button */}
          <button
            onClick={onOpenHistory}
            className="liquid-glass-btn flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium text-white cursor-pointer"
            aria-label="Open Download History"
          >
            <History className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-[#38bdf8] text-slate-950 font-bold text-[10px] rounded-full tabular-nums shadow-sm">
                {historyCount}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
}
