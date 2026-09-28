import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is this X / Twitter video downloader completely free?",
      a: "Yes, 100% free with unlimited downloads. You do not need to register an account, install any third-party extensions, or pay fees."
    },
    {
      q: "How do I download Twitter / X videos in 1080p Full HD?",
      a: "When a creator uploads a video in 1080p or higher, our extraction engine automatically identifies and extracts the highest bitrate 1080p stream variant. Simply select the 1080p option and click 'Download MP4'."
    },
    {
      q: "Can I extract only the audio (MP3) from an X video?",
      a: "Yes! Switch to the 'Audio (MP3)' tab inside the result card. You can preview and download the isolated audio stream directly as an MP3/M4A file with high bitrate."
    },
    {
      q: "Where do downloaded Twitter videos get saved on iPhone / iOS?",
      a: "When using Safari on iPhone or iPad, the file will download to your iCloud Drive 'Downloads' folder or local 'Files' app. You can tap Share and select 'Save Video' to move it to your Photos camera roll."
    },
    {
      q: "Can I save individual high-res frame snapshots from a video?",
      a: "Yes! While previewing any video, you can pause or scrub to any frame and click the 'Snapshot Frame' camera icon to capture and download that exact video frame as a full-resolution PNG image."
    },
    {
      q: "Are the downloaded videos watermark-free?",
      a: "Yes. All downloaded MP4 files are direct source bitstreams without any added overlays, logos, or watermarks."
    }
  ];

  return (
    /* Hidden on mobile to keep mobile experience compact and focused */
    <section id="faq" className="hidden md:block py-16 lg:py-24 border-t border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/15 text-[#38bdf8] text-xs font-medium mb-3 shadow-inner">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-slate-400 text-xs sm:text-sm font-medium">
            Everything you need to know about downloading X & Twitter media.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl liquid-glass-card overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <span className="font-medium text-white text-sm sm:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#38bdf8]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-white/10 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
