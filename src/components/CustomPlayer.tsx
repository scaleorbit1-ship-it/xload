import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Camera,
  Settings,
  Sparkles
} from 'lucide-react';

interface CustomPlayerProps {
  src: string;
  poster?: string;
  onSnapshot?: (dataUrl: string) => void;
}

export function CustomPlayer({ src, poster, onSnapshot }: CustomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [src]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const toggleLoop = () => {
    if (!videoRef.current) return;
    videoRef.current.loop = !isLooping;
    setIsLooping(!isLooping);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        if (onSnapshot) {
          onSnapshot(dataUrl);
        }
      }
    } catch (e) {
      console.warn('Cannot snapshot cross-origin video frame directly', e);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative group rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl flex flex-col justify-center items-center">
      
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        className="w-full max-h-[480px] object-contain cursor-pointer"
        playsInline
      />

      {/* Center Big Play Button Overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute z-10 w-16 h-16 rounded-full bg-[#1d9bf0]/90 text-slate-950 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
          aria-label="Play video"
        >
          <Play className="w-7 h-7 fill-current ml-1" />
        </button>
      )}

      {/* Buffering state */}
      {isBuffering && (
        <div className="absolute z-10 p-3 rounded-full bg-slate-900/80 backdrop-blur-sm pointer-events-none">
          <Sparkles className="w-6 h-6 text-sky-400 animate-spin" />
        </div>
      )}

      {/* Custom Control Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 flex flex-col gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
        
        {/* Scrubber track */}
        <div className="relative flex items-center w-full group/scrub">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-lg appearance-none cursor-pointer accent-[#1d9bf0] transition-all"
          />
        </div>

        {/* Bottom controls row */}
        <div className="flex items-center justify-between text-white text-xs">
          
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1 hover:text-[#1d9bf0] transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="p-1 hover:text-[#1d9bf0] transition-colors cursor-pointer">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#1d9bf0]"
              />
            </div>

            {/* Time Stamp */}
            <span className="font-mono tabular-nums text-slate-300 text-[11px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Snapshot */}
            <button
              onClick={handleCaptureSnapshot}
              className="p-1.5 hover:text-[#1d9bf0] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Capture Frame Snapshot"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Loop Toggle */}
            <button
              onClick={toggleLoop}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLooping ? 'text-[#1d9bf0] bg-[#1d9bf0]/20' : 'hover:text-[#1d9bf0] hover:bg-white/10'
              }`}
              title={isLooping ? 'Loop is On' : 'Loop is Off'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-mono bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                title="Playback Speed"
              >
                <span>{playbackRate}x</span>
                <Settings className="w-3 h-3 ml-0.5" />
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-8 right-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1 z-30 flex flex-col gap-0.5 min-w-[70px]">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={`px-2 py-1 text-left text-xs font-mono rounded hover:bg-[#1d9bf0]/20 transition-colors ${
                        playbackRate === rate ? 'text-[#1d9bf0] font-bold' : 'text-slate-300'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-[#1d9bf0] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
