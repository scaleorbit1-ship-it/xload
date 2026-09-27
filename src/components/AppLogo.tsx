interface AppLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function AppLogo({ size = 38, className = '', showText = true }: AppLogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Liquid Glass Apple-Style Squircle Icon Container */}
      <div
        style={{ width: size, height: size }}
        className="relative rounded-[12px] p-[1px] bg-gradient-to-b from-white/35 via-white/10 to-transparent shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-2xl flex items-center justify-center overflow-hidden shrink-0 group transition-all duration-300"
      >
        {/* Deep frosted glass inner canvas */}
        <div className="w-full h-full rounded-[11px] bg-[#0c1220]/85 flex items-center justify-center relative overflow-hidden">
          
          {/* Subtle specular rim light */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

          {/* Unique SVG Mark: Intersecting Cyber X + Velocity Downward Stream */}
          <svg
            viewBox="0 0 100 100"
            className="w-[74%] h-[74%] transition-transform duration-300 group-hover:scale-105"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logoCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="logoEmeraldGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
              <linearGradient id="logoCoreGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#7dd3fc" />
              </linearGradient>
              <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Wing 1: Diagonal Backslash top-left & bottom-right */}
            <path
              d="M 24 22 L 40 44 L 32 54 L 18 36 C 15 32 16 26 21 23 Z"
              fill="url(#logoCyanGrad)"
            />
            <path
              d="M 68 78 L 52 56 L 60 46 L 74 64 C 77 68 76 74 71 77 Z"
              fill="url(#logoCyanGrad)"
            />

            {/* Wing 2: Top-right slash */}
            <path
              d="M 76 23 C 81 26 82 32 79 36 L 56 66 L 46 66 L 36 50 C 33 46 34 40 39 37 L 45 32 C 49 28 55 28 59 32 L 67 42 L 72 24 C 73 23 74 22 76 23 Z"
              fill="url(#logoEmeraldGrad)"
            />

            {/* Central Aerodynamic Down Arrow Core with Specular Tip */}
            <path
              d="M 46 34 L 54 34 C 56 34 58 36 58 38 L 58 58 L 68 58 C 71 58 72 62 70 64 L 52 82 C 51 83 49 83 48 82 L 30 64 C 28 62 29 58 32 58 L 42 58 L 42 38 C 42 36 44 34 46 34 Z"
              fill="url(#logoCoreGrad)"
              filter="url(#logoGlow)"
            />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      {showText && (
        <span className="font-medium tracking-tight text-lg text-white font-sans flex items-center gap-0.5">
          <span>Xload</span>
          <span className="text-[#38bdf8] font-semibold">HD</span>
        </span>
      )}
    </div>
  );
}
