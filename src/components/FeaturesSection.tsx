import {
  Sparkles,
  Zap,
  ShieldCheck,
  Music2,
  Film,
  Smartphone,
  CheckCircle2
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Film className="w-5 h-5 text-[#38bdf8]" />,
      title: "Crystal Clear 1080p & 720p HD",
      description:
        "Extracts original source stream bitrates without re-compression degradation. Choose 1080p Full HD, 720p, 480p SD, or mobile sizes."
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      title: "Direct Streaming Download",
      description:
        "Pipes raw video data directly to your browser's download manager with native Content-Disposition headers to bypass CORS restrictions."
    },
    {
      icon: <Music2 className="w-5 h-5 text-purple-400" />,
      title: "Audio & Speech Extraction",
      description:
        "Separate background tracks, speech, interviews, and music from any X video post into clean, high-bitrate MP3/M4A audio files."
    },
    {
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      title: "Zero Watermarks & Clean MP4",
      description:
        "Downloads are 100% clean and watermark-free, preserving authentic metadata, aspect ratios, and full framerates."
    },
    {
      icon: <Smartphone className="w-5 h-5 text-indigo-400" />,
      title: "Universal Device Compatibility",
      description:
        "Works seamlessly across iOS Safari, Android Chrome, macOS, Windows, and Linux without installing extensions or apps."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
      title: "Privacy First & No Log Retention",
      description:
        "Your URL requests and downloads are never tracked or permanently logged on our servers. 100% private and secure."
    }
  ];

  return (
    /* Hidden on mobile to keep mobile experience compact and focused */
    <section id="features" className="hidden md:block py-16 lg:py-24 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
            Engineered for Highest Quality Downloads
          </h2>
          <p className="mt-2.5 text-slate-300 text-sm leading-relaxed font-medium">
            The most reliable and responsive way to save media from X (Twitter) directly to your camera roll or desktop.
          </p>
        </div>

        {/* Feature Grid with Apple Liquid Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl liquid-glass-card hover:bg-white/[0.08] transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center mb-3.5">
                  {feat.icon}
                </div>
                <h3 className="text-base font-medium text-white mb-1.5">
                  {feat.title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  {feat.description}
                </p>
              </div>

              <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Verified Fast Delivery</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
