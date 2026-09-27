import { useState, useEffect } from 'react';
import {
  X,
  History,
  Download,
  Trash2,
  Search,
  ExternalLink,
  Film,
  Music,
  ArrowRight,
  Clock
} from 'lucide-react';
import { HistoryItem } from '../types/tweet';
import { triggerDownload } from '../services/api';

interface HistorySideNavProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onSelectUrl: (url: string) => void;
}

export function HistorySideNav({
  isOpen,
  onClose,
  items,
  onClearHistory,
  onDeleteItem,
  onSelectUrl,
}: HistorySideNavProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'gif' | 'audio'>('all');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.authorName?.toLowerCase().includes(search.toLowerCase()) ||
      item.authorHandle?.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'all' || item.mediaType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <>
      {/* Backdrop scrim */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-over Liquid Glass Side Navigation Drawer */}
      <aside
        aria-label="Download History"
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] max-w-full bg-[#080c18]/85 backdrop-blur-3xl border-l border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_1px_0_1px_rgba(255,255,255,0.25)] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Apple Liquid Glass Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl p-[1px] bg-gradient-to-b from-white/30 to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] flex items-center justify-center bg-[#11192e]">
              <History className="w-4 h-4 text-[#38bdf8]" />
            </div>
            <div>
              <h2 className="font-medium text-white text-base leading-tight">
                Download History
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Saved offline on this device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition-colors cursor-pointer"
            aria-label="Close history sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Liquid Glass Search & Filter Controls */}
        <div className="p-4 border-b border-white/10 bg-white/[0.02] flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved clips & creators..."
              className="w-full pl-9 pr-3 py-2 bg-white/[0.06] border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/30 transition-all font-medium"
            />
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.05] rounded-xl border border-white/10">
            {(['all', 'video', 'audio', 'gif'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                  filterType === type
                    ? 'liquid-glass-btn-primary shadow-sm text-slate-950 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* List of Saved Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-500">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-200">No downloads found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Videos, GIFs, and MP3 tracks you download will appear here for fast replay and re-download.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-200 flex items-center gap-3"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/10 shrink-0">
                  <img
                    src={item.thumbnail || item.authorAvatar}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/70 backdrop-blur-sm rounded text-[9px] font-mono text-white/90">
                    {item.mediaType === 'audio' ? <Music className="w-2.5 h-2.5 inline" /> : <Film className="w-2.5 h-2.5 inline" />}
                  </div>
                </div>

                {/* Content info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-medium text-white truncate">
                      {item.authorName}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      @{item.authorHandle}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 truncate mt-0.5 font-medium">
                    {item.title}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span className="text-[#38bdf8] font-mono font-medium uppercase">{item.quality}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{item.fileSize}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(item.downloadedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      onSelectUrl(item.url);
                      onClose();
                    }}
                    className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 rounded-xl border border-white/10 transition-colors cursor-pointer"
                    title="Load in downloader"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => triggerDownload(item.downloadUrl, `x_download_${item.tweetId}.mp4`)}
                    className="p-2 liquid-glass-btn-primary rounded-xl transition-all cursor-pointer shadow-sm"
                    title="Download Again"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-xl border border-white/10 transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Apple Liquid Glass Drawer Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </span>

          {items.length > 0 && (
            <button
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/20 rounded-xl transition-colors cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
