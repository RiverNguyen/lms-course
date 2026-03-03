"use client";

import { useConstructUrl } from "@/hooks/use-construct-url";
import { Lock, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const PREVIEW_SECONDS = 120; // 2 phút

interface PreviewVideoPlayerProps {
  videoKey: string;
  thumbnailKey: string | null;
  lessonTitle?: string;
}

export function PreviewVideoPlayer({
  videoKey,
  thumbnailKey,
  lessonTitle,
}: PreviewVideoPlayerProps) {
  const videoUrl = useConstructUrl(videoKey);
  const thumbnailUrl = thumbnailKey ? useConstructUrl(thumbnailKey) : undefined;
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
  const [isLoading, setIsLoading] = useState(true);
  const [previewEnded, setPreviewEnded] = useState(false);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const maxTime = Math.min(PREVIEW_SECONDS, duration || PREVIEW_SECONDS);
  const progressPercent = maxTime > 0 ? (currentTime / maxTime) * 100 : 0;

  const togglePlay = () => {
    if (previewEnded) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        if (currentTime >= PREVIEW_SECONDS) {
          videoRef.current.currentTime = PREVIEW_SECONDS - 0.5;
          videoRef.current.pause();
          setPreviewEnded(true);
          return;
        }
        videoRef.current.play();
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (previewEnded || !videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = Math.min(pos * maxTime, PREVIEW_SECONDS - 0.5);
    videoRef.current.currentTime = Math.max(0, seekTime);
    setCurrentTime(seekTime);
    if (seekTime >= PREVIEW_SECONDS - 0.5) setPreviewEnded(true);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, pos));
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      const t = video.currentTime;
      setCurrentTime(t);
      if (t >= PREVIEW_SECONDS) {
        video.pause();
        video.currentTime = PREVIEW_SECONDS;
        setCurrentTime(PREVIEW_SECONDS);
        setPreviewEnded(true);
      }
    };
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => setPreviewEnded(true);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
    };
  }, [shouldLoad]);

  if (!videoKey) return null;

  return (
    <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
      {shouldLoad && (
        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          preload="metadata"
          playsInline
          controls={false}
          poster={thumbnailUrl}
          onClick={togglePlay}
          onError={(e) => {
            const err = e.currentTarget.error;
            setError(err ? "Không thể tải video." : "Không thể tải video.");
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          Trình duyệt không hỗ trợ phát video.
        </video>
      )}

      {!shouldLoad && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-20 bg-cover bg-center"
          style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
          onClick={() => setShouldLoad(true)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 rounded-full p-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Play className="w-12 h-12" />
          </div>
          <p className="relative z-10 mt-3 text-white text-sm font-medium">
            Xem thử 2 phút đầu
          </p>
        </div>
      )}

      {isLoading && shouldLoad && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/80">
          <p className="text-white text-sm">{error}</p>
        </div>
      )}

      {/* Overlay hết phần xem thử */}
      {previewEnded && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 p-6 text-center">
          <div className="rounded-full p-4 bg-amber-500/20 text-amber-400 mb-4">
            <Lock className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Hết phần xem thử
          </h3>
          <p className="text-sm text-white/90 max-w-xs mb-6">
            Bạn đã xem 2 phút đầu. Đăng ký hoặc mua khóa học để xem toàn bộ nội dung.
          </p>
        </div>
      )}

      {/* Badge "Xem thử 2 phút" */}
      <div className="absolute top-3 left-3 z-20 rounded-md bg-amber-500 px-2 py-1 text-xs font-medium text-black">
        Xem thử 2 phút đầu
      </div>

      {/* Controls */}
      {shouldLoad && !error && (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 to-transparent p-4 pt-8">
          {lessonTitle && (
            <p className="text-white/90 text-xs mb-2 truncate">{lessonTitle}</p>
          )}
          <div
            ref={progressRef}
            className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer mb-3"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              disabled={previewEnded}
              className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
              aria-label={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>
            <span className="text-white text-sm font-mono min-w-[100px]">
              {formatTime(currentTime)} / {formatTime(maxTime)}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label={isMuted ? "Bật tiếng" : "Tắt tiếng"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
              <div
                ref={volumeRef}
                className="w-16 h-1 bg-white/20 rounded-full cursor-pointer"
                onClick={handleVolumeClick}
              >
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click to play overlay when paused and not ended */}
      {shouldLoad && !isPlaying && !previewEnded && !error && !isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={togglePlay}
          aria-hidden
        >
          <div className="rounded-full p-4 bg-black/50 hover:bg-black/70 transition-colors">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
