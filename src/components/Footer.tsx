import { AppLogo } from './AppLogo';

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-white/10 bg-[#060810]/70 backdrop-blur-2xl py-8 sm:py-10 text-slate-400 text-xs font-medium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          
          <div className="flex items-center gap-3">
            <AppLogo size={28} />
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-medium text-[11px] sm:text-xs">
              Ultra HD Media Tool
            </span>
          </div>

          <div className="flex items-center gap-5 text-slate-400 text-xs font-medium">
            <a href="#downloader" className="hover:text-white transition-colors">
              Downloader
            </a>
            <a href="#features" className="hover:text-white transition-colors hidden md:inline">
              Features
            </a>
            <a href="#faq" className="hover:text-white transition-colors hidden md:inline">
              FAQ
            </a>
          </div>

        </div>

        <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px] font-medium text-center sm:text-left">
          <p>
            Independent web utility. Not affiliated with or endorsed by X Corp.
          </p>
          <p className="tabular-nums">
            PWA Enabled · 2026
          </p>
        </div>

      </div>
    </footer>
  );
}
