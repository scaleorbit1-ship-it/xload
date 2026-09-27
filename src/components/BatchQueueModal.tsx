import { useState } from 'react';
import {
  X,
  Layers,
  Sparkles,
  Download,
  AlertCircle,
  Trash2,
  Plus
} from 'lucide-react';
import { BatchItem, VideoVariant } from '../types/tweet';
import { processBatchUrls, getProxyDownloadUrl, triggerDownload } from '../services/api';

interface BatchQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (tweet: any) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export function BatchQueueModal({ isOpen, onClose, onSelectResult, onShowToast }: BatchQueueModalProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [items, setItems] = useState<BatchItem[]>([]);

  if (!isOpen) return null;

  const handleStartBatch = async () => {
    const urls = inputText
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length === 0) {
      onShowToast('error', 'No Links Provided', 'Please enter at least one X or Twitter link.');
      return;
    }

    if (urls.length > 10) {
      onShowToast('info', 'Batch Limit', 'Extracting first 10 URLs in this batch.');
    }

    setIsProcessing(true);
    try {
      const results = await processBatchUrls(urls.slice(0, 10));
      setItems(results);
      onShowToast('success', 'Batch Extracted', `Processed ${results.length} links successfully.`);
    } catch (err: any) {
      onShowToast('error', 'Batch Error', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadItem = (item: BatchItem) => {
    if (!item.data) return;
    const media = item.data.media[0];
    const topVariant: VideoVariant = media?.variants[0];
    if (!topVariant) return;

    const filename = `x_batch_${item.data.author.screen_name}_${Date.now()}.mp4`;
    const downloadUrl = getProxyDownloadUrl(topVariant.url, filename, 'video');

    triggerDownload(downloadUrl, filename);
    onShowToast('success', 'Downloading', `${item.data.author.name}'s video queued.`);
  };

  const handleDownloadAll = () => {
    const validItems = items.filter((i) => i.status === 'success' && i.data);
    if (validItems.length === 0) {
      onShowToast('info', 'No Ready Videos', 'No videos ready to download in queue.');
      return;
    }

    validItems.forEach((item, index) => {
      setTimeout(() => {
        handleDownloadItem(item);
      }, index * 800);
    });

    onShowToast('success', 'Bulk Download Started', `Triggering ${validItems.length} downloads...`);
  };

  const clearBatch = () => {
    setItems([]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl liquid-glass-card rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl p-[1px] bg-gradient-to-b from-white/30 to-white/5 flex items-center justify-center bg-[#11192e] text-[#38bdf8]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium text-white text-base">Batch Video Queue</h3>
              <p className="text-xs text-slate-400 font-medium">Paste multiple Twitter / X URLs (one per line, up to 10)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          
          {items.length === 0 ? (
            <div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="https://x.com/SpaceX/status/...&#10;https://x.com/NatureGeog/status/...&#10;https://x.com/username/status/..."
                rows={6}
                className="w-full p-3.5 bg-black/40 border border-white/15 rounded-2xl text-white text-xs sm:text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/30 transition-all font-medium"
                disabled={isProcessing}
              />

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400 font-medium">
                  {inputText.split('\n').filter((l) => l.trim()).length} URLs detected
                </span>

                <button
                  onClick={handleStartBatch}
                  disabled={isProcessing || !inputText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 liquid-glass-btn-primary disabled:opacity-40 text-slate-950 font-medium text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing Batch...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Extract All Links</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
                <span>{items.length} Items in Queue</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearBatch}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Queue</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {items.map((item) => {
                  if (item.status === 'success' && item.data) {
                    const topVariant = item.data.media[0]?.variants[0];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-3 bg-white/[0.04] border border-white/10 rounded-2xl hover:border-white/20 transition-all"
                      >
                        <img
                          src={item.data.media[0]?.thumbnail || item.data.author.avatar}
                          alt="Thumb"
                          className="w-12 h-12 rounded-xl object-cover bg-black shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">
                            {item.data.author.name} (@{item.data.author.screen_name})
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                            {item.data.text}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-medium">
                            <span className="text-[#38bdf8] font-mono">{topVariant?.quality || 'HD'}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{topVariant?.formattedSize || 'MP4'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              onSelectResult(item.data);
                              onClose();
                            }}
                            className="liquid-glass-btn px-2.5 py-1.5 text-xs text-slate-200 rounded-xl cursor-pointer"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => handleDownloadItem(item)}
                            className="liquid-glass-btn-primary p-2 text-slate-950 rounded-xl cursor-pointer shadow-sm"
                            title="Download this video"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-rose-950/20 border border-rose-500/20 rounded-2xl text-xs text-rose-300 font-medium"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="truncate flex-1 font-mono">{item.url}</span>
                      <span className="text-[10px] text-rose-400">Failed</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>

          {items.length > 0 && (
            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 liquid-glass-btn-primary text-slate-950 font-medium text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download All Ready MP4s</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
