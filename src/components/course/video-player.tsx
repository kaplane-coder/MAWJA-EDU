"use client";

import * as React from "react";
import {
  Play,
  Pause,
  SpeakerHigh,
  SpeakerNone,
  CornersOut,
  CornersIn,
  ArrowCounterClockwise,
  ArrowClockwise,
  Warning,
  CircleNotch,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { saveLessonProgressAction } from "@/actions/learning";

interface VideoPlayerProps {
  lessonId: string;
  videoUrl: string | null;
  title: string;
  posterUrl?: string | null;
  initialProgressSeconds?: number;
  onProgressUpdate?: (progressSeconds: number, completed: boolean) => void;
  className?: string;
}

export function VideoPlayer({
  lessonId,
  videoUrl,
  title,
  posterUrl,
  initialProgressSeconds = 0,
  onProgressUpdate,
  className,
}: VideoPlayerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);

  const lastSavedTimeRef = React.useRef<number>(0);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Resume time
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsLoading(false);
      if (initialProgressSeconds > 0 && initialProgressSeconds < (video.duration || 0) - 5) {
        video.currentTime = initialProgressSeconds;
        setCurrentTime(initialProgressSeconds);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [initialProgressSeconds, videoUrl]);

  // 2. Throttled progress persister
  const persistProgress = React.useCallback(
    async (seconds: number, forceComplete = false) => {
      const rounded = Math.floor(seconds);
      if (!forceComplete && Math.abs(rounded - lastSavedTimeRef.current) < 8) {
        return;
      }
      lastSavedTimeRef.current = rounded;

      const isCompleted = forceComplete || (duration > 0 && rounded >= duration * 0.9);
      if (onProgressUpdate) {
        onProgressUpdate(rounded, isCompleted);
      }

      await saveLessonProgressAction({
        lesson_id: lessonId,
        progress_seconds: rounded,
        completed: isCompleted,
      });
    },
    [lessonId, duration, onProgressUpdate]
  );

  // 3. Time update handler
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Save every ~10s
    if (Math.abs(Math.floor(current) - lastSavedTimeRef.current) >= 10) {
      persistProgress(current);
    }
  };

  // 4. Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      persistProgress(videoRef.current.currentTime);
    } else {
      videoRef.current.play().catch(() => setHasError(true));
      setIsPlaying(true);
    }
  };

  // 5. Seek bar handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  // 6. Volume handler
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
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // 7. Playback Speed handler
  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  // 8. Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // 9. Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, duration);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
        }
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const total = Math.floor(secs);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!videoUrl) {
    return (
      <div className="relative aspect-video w-full rounded-2xl bg-black/90 flex flex-col items-center justify-center p-8 text-center text-white space-y-3 shadow-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <Play className="h-7 w-7 opacity-70" />
        </div>
        <h4 className="text-base font-bold">{title}</h4>
        <p className="text-xs text-white/60 max-w-sm">
          لم يتم رفع ملف الفيديو التدريبي لهذا الدرس بعد من قِبل المدرب.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-2xl bg-black select-none shadow-2xl transition-all",
        className
      )}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          persistProgress(duration, true);
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onClick={togglePlay}
        className="h-full w-full object-contain cursor-pointer"
        playsInline
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
          <CircleNotch className="h-10 w-10 text-primary animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-6 text-center space-y-2">
          <Warning className="h-10 w-10 text-warning mb-1" />
          <h4 className="text-sm font-bold">تعذر تشغيل الفيديو</h4>
          <p className="text-xs text-white/70 max-w-xs">
            قد يكون رابط الفيديو غير متاح حالياً أو انتهت صلاحية الجلسة.
          </p>
        </div>
      )}

      {/* Overlay Play Button (when paused) */}
      {!isPlaying && !isLoading && !hasError && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
          aria-label="تشغيل الفيديو"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-110 active:scale-95">
            <Play className="h-8 w-8 fill-current ml-1" />
          </div>
        </button>
      )}

      {/* Video Control Bar */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 space-y-2.5",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Seek Track */}
        <div className="relative flex items-center group/track cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="h-1.5 w-full appearance-none rounded-full bg-white/20 accent-primary cursor-pointer transition-all group-hover/track:h-2"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left Controls: Play/Pause, Rewind, Forward, Volume, Time */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 hover:text-primary transition-colors"
              aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
                }
              }}
              className="p-1 hover:text-primary transition-colors text-white/80"
              title="تراجع 10 ثوانٍ"
            >
              <ArrowCounterClockwise className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
                }
              }}
              className="p-1 hover:text-primary transition-colors text-white/80"
              title="تقديم 10 ثوانٍ"
            >
              <ArrowClockwise className="h-4 w-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/volume">
              <button
                onClick={toggleMute}
                className="p-1 hover:text-primary transition-colors text-white/80"
                aria-label={isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
              >
                {isMuted ? <SpeakerNone className="h-4 w-4" /> : <SpeakerHigh className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 h-1 appearance-none rounded-full bg-white/20 accent-primary cursor-pointer hidden group-hover/volume:inline-block"
              />
            </div>

            {/* Time Stamp */}
            <span className="font-mono text-[11px] text-white/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls: Speed, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="rounded px-2 py-1 text-xs font-semibold hover:bg-white/10 transition-colors"
                title="سرعة التشغيل"
              >
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-24 rounded-xl border border-white/10 bg-black/90 backdrop-blur-md p-1.5 shadow-2xl text-center space-y-1 z-50">
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={cn(
                        "w-full rounded-lg px-2 py-1 text-xs font-semibold transition-colors",
                        playbackRate === rate
                          ? "bg-primary text-primary-foreground font-bold"
                          : "text-white/80 hover:bg-white/10"
                      )}
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
              className="p-1.5 hover:text-primary transition-colors text-white/80"
              aria-label={isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}
            >
              {isFullscreen ? <CornersIn className="h-4 w-4" /> : <CornersOut className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
