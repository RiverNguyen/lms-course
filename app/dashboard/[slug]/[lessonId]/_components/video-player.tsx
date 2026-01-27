"use client"

import { useConstructUrl } from "@/hooks/use-construct-url";
import { useVideoCache } from "@/hooks/use-video-cache";
import { BookIcon, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  thumbnailKey: string;
  videoKey: string;
  onVideoEnd?: () => void;
}

export const VideoPlayer = ({ thumbnailKey, videoKey, onVideoEnd }: VideoPlayerProps) => {
  const originalVideoUrl = useConstructUrl(videoKey);
  const thumbnailUrl = useConstructUrl(thumbnailKey);
  const { videoUrl, isLoading: isCacheLoading, isCached } = useVideoCache(videoKey, originalVideoUrl);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format time
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Handle progress bar hover
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const clampedPos = Math.max(0, Math.min(1, pos));
    const time = clampedPos * duration;
    setHoverTime(time);
    setHoverPosition(clampedPos * 100);
  };

  const handleProgressLeave = () => {
    setHoverTime(null);
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  // Handle volume change
  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, pos));
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Show controls on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setShouldLoad(true), 100);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => {
      setIsPlaying(true);
      setHasPlayedOnce(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = async () => {
      setIsLoading(false);
      // Auto-play when video is ready (only first time)
      if (!hasPlayedOnce) {
        try {
          await video.play();
        } catch (error) {
          // Auto-play might fail due to browser policies
          // User will need to click play manually
          console.log("Auto-play prevented by browser policy");
        }
      }
    };
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    const handleEnded = () => {
      if (onVideoEnd) {
        onVideoEnd();
      }
    };

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [shouldLoad, hasPlayedOnce, onVideoEnd]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  if (!videoKey) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center flex-col justify-center">
        <BookIcon className="size-16 text-primary mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">This lesson does not have a video</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="aspect-video bg-black rounded-lg relative overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }}
    >
      {/* Thumbnail background - show when video is not playing */}
      {!isPlaying && thumbnailUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
      )}
      
      {/* HTML5 video */}
      {shouldLoad && (
        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          preload="metadata"
          playsInline
          controls={false}
          poster={thumbnailUrl || undefined}
          onClick={togglePlay}
          onError={(e) => {
            const video = e.currentTarget;
            const error = video.error;
            let errorMsg = "Failed to load video.";
            if (error) {
              switch (error.code) {
                case error.MEDIA_ERR_ABORTED:
                  errorMsg = "Video loading aborted.";
                  break;
                case error.MEDIA_ERR_NETWORK:
                  errorMsg = "Network error while loading video.";
                  break;
                case error.MEDIA_ERR_DECODE:
                  errorMsg = "Video decoding error.";
                  break;
                case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                  errorMsg = "Video format not supported or URL invalid.";
                  break;
              }
            }
            console.error("Video error:", error, "URL:", videoUrl);
            setError(errorMsg);
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Loading indicator */}
      {(isLoading || isCacheLoading) && shouldLoad && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            {isCached && (
              <p className="text-white text-sm">Loading from cache...</p>
            )}
          </div>
        </div>
      )}
      
      {/* Custom Controls */}
      {shouldLoad && !error && (
        <div 
          className={`absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
          onClick={(e) => {
            // Only toggle play/pause when clicking on the video area (not on controls)
            if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'VIDEO') {
              togglePlay();
            }
          }}
        >
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="relative w-full h-2 bg-white/20 cursor-pointer group/progress hover:h-3 transition-all"
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={handleProgressLeave}
          >
            <div 
              className="h-full bg-primary transition-all group-hover/progress:bg-primary/90"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
            
            {/* Hover Preview Tooltip */}
            {hoverTime !== null && duration > 0 && (
              <div
                className="absolute -top-10 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded pointer-events-none z-30"
                style={{ left: `${hoverPosition}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-2 p-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Time Display */}
            <div className="text-white text-sm font-mono min-w-[100px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
              <div 
                ref={volumeRef}
                className="w-20 h-1 bg-white/20 cursor-pointer hover:h-2 transition-all group/volume"
                onClick={handleVolumeChange}
              >
                <div 
                  className="h-full bg-white transition-all group-hover/volume:bg-white/90"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/80">
          <div className="text-center p-4">
            <p className="text-white mb-2">Error loading video</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setShouldLoad(false);
                setTimeout(() => setShouldLoad(true), 100);
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Play button overlay - show when not loaded yet */}
      {!shouldLoad && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
          onClick={() => {
            setShouldLoad(true);
          }}
        >
          <div className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
      )}
      
      {/* Play button overlay - show when video is loaded and paused */}
      {shouldLoad && !isPlaying && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
          onClick={togglePlay}
        >
          <div className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};
