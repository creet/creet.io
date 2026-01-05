"use client";

import { useState, useRef, useEffect } from "react";
import { Stream } from "@cloudflare/stream-react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
    url: string;
    poster?: string;
    trimStart?: number;
    trimEnd?: number;
    showControls?: boolean; // Show native player controls
    showPlayPauseButton?: boolean; // Show custom play/pause button overlay
    showDurationBadge?: boolean; // Show duration badge
    showProgressBar?: boolean; // Show custom progress bar with scrubber
    showRelativeTime?: boolean; // Show time starting from 0 for trimmed videos
    showVolumeControl?: boolean; // Show volume control slider
    showFullscreenButton?: boolean; // Show fullscreen toggle button
    overlayOnHoverOnly?: boolean; // Only show play/pause button on hover
    className?: string;
    onPlay?: () => void;
    onPause?: () => void;
    onTimeUpdate?: (currentTime: number, relativeTime: number) => void;
    onDurationLoad?: (duration: number, trimmedDuration: number) => void;
    customOverlay?: (props: { isPlaying: boolean; togglePlayback: (e: React.MouseEvent) => void }) => React.ReactNode;
}

export function VideoPlayer({
    url,
    poster,
    trimStart,
    trimEnd,
    showControls = false,
    showPlayPauseButton = true,
    showDurationBadge = true,
    showProgressBar = false,
    showRelativeTime = true,
    showVolumeControl = false,
    showFullscreenButton = false,
    overlayOnHoverOnly = false,
    className,
    onPlay,
    onPause,
    onTimeUpdate,
    onDurationLoad,
    customOverlay,
}: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragPercent, setDragPercent] = useState<number | null>(null);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<any>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const wasPlayingRef = useRef(false);

    // Detect if URL is a Cloudflare Stream UID
    const isCloudflare = url && !url.includes('/') && !url.startsWith('http') && !url.startsWith('blob:');

    // Calculate trim boundaries
    const effectiveStart = trimStart || 0;
    const effectiveEnd = trimEnd || duration;
    const hasTrim = (trimStart !== undefined && trimStart > 0) || (trimEnd !== undefined && trimEnd > 0 && duration > 0 && trimEnd < duration);
    const trimmedDuration = hasTrim ? effectiveEnd - effectiveStart : duration;
    const relativeTime = hasTrim && showRelativeTime ? Math.max(0, currentTime - effectiveStart) : currentTime;
    const progressPercent = trimmedDuration > 0 ? (relativeTime / trimmedDuration) * 100 : 0;

    // Format time as M:SS
    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Seek to time
    const seekTo = (time: number) => {
        if (isCloudflare && streamRef.current) {
            streamRef.current.currentTime = time;
        } else if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
        setCurrentTime(time);
    };

    // Handle play
    const handlePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (isCloudflare && streamRef.current) {
            if (trimStart && trimStart > 0 && currentTime < trimStart) {
                streamRef.current.currentTime = trimStart;
            }
            streamRef.current.play();
        } else if (videoRef.current) {
            if (trimStart && trimStart > 0 && currentTime < trimStart) {
                videoRef.current.currentTime = trimStart;
            }
            // Add a small delay/promise catch to handle potential race conditions or playback failures
            videoRef.current.play().catch(err => console.error("Playback failed:", err));
        }
        setIsPlaying(true);
        onPlay?.();
    };

    // Handle pause
    const handlePause = () => {
        if (isCloudflare && streamRef.current) {
            streamRef.current.pause();
        } else if (videoRef.current) {
            videoRef.current.pause();
        }
        setIsPlaying(false);
        onPause?.();
    };

    // Toggle playback
    const togglePlayback = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying) {
            handlePause();
        } else {
            handlePlay(e);
        }
    };

    // Handle Volume
    const handleVolumeChange = (newVolume: number) => {
        const v = Math.max(0, Math.min(1, newVolume));
        setVolume(v);
        setIsMuted(v === 0);

        if (isCloudflare && streamRef.current) {
            streamRef.current.volume = v;
        } else if (videoRef.current) {
            videoRef.current.volume = v;
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newMuted = !isMuted;
        setIsMuted(newMuted);

        const v = newMuted ? 0 : (volume || 1);
        if (isCloudflare && streamRef.current) {
            streamRef.current.volume = v;
        } else if (videoRef.current) {
            videoRef.current.volume = v;
        }
        if (!newMuted && volume === 0) setVolume(1);
    };

    // Handle Fullscreen
    const toggleFullscreen = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            try {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } catch (err) {
                console.error("Error attempting to enable fullscreen:", err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Handle fullscreen change events (e.g. user pressing Escape)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Handle time update from player
    const handleTimeUpdate = (e: any) => {
        if (isDragging) return; // Don't update if user is dragging
        let time = 0;
        if (isCloudflare) {
            // For Cloudflare Stream, read currentTime from streamRef, not event
            time = streamRef.current?.currentTime ?? 0;
        } else if (videoRef.current) {
            time = videoRef.current.currentTime;
        }
        setCurrentTime(time);

        const relTime = hasTrim && showRelativeTime ? Math.max(0, time - effectiveStart) : time;
        onTimeUpdate?.(time, relTime);

        // Stop at trim end
        if (trimEnd && trimEnd > 0 && time >= trimEnd) {
            if (isCloudflare && streamRef.current) {
                streamRef.current.pause();
                streamRef.current.currentTime = effectiveStart;
            } else if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = effectiveStart;
            }
            setIsPlaying(false);
            onPause?.();
        }
    };

    // Handle metadata load
    const handleLoadedMetadata = (e: any) => {
        let d = 0;
        if (isCloudflare) {
            // For Cloudflare Stream, read duration from streamRef
            d = streamRef.current?.duration || e?.detail?.duration || 0;
        } else if (videoRef.current) {
            d = videoRef.current.duration;
            // Native video elements can report Infinity for streams/unloaded media
            if (!isFinite(d)) d = 0;
        }

        // If we have a valid, finite duration > 0, we trust it absolutely.
        if (d > 0) {
            setDuration(d);
            const trimDur = (trimStart !== undefined && trimStart > 0) || (trimEnd !== undefined && trimEnd > 0 && trimEnd < d)
                ? (trimEnd || d) - (trimStart || 0)
                : d;
            onDurationLoad?.(d, trimDur);
        } else {
            // Fallback: If duration is still 0 (e.g. metadata hasn't fully loaded or failed),
            // and we rely on a known trimEnd (rare logic, but existing fallback), we use that.
            if (trimEnd && trimEnd > 0) {
                setDuration(trimEnd);
                const trimDur = trimEnd - (trimStart || 0);
                onDurationLoad?.(trimEnd, trimDur);
            }
        }
    };

    // Handle progress bar click/drag
    const handleProgressInteraction = (clientX: number, shouldSeek: boolean = true) => {
        if (!progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 100;

        // Update visual position immediately
        setDragPercent(percent);

        // Seek video if requested
        if (shouldSeek) {
            const newTime = effectiveStart + (percent / 100) * trimmedDuration;
            const targetTime = Math.min(Math.max(newTime, effectiveStart), effectiveEnd);
            seekTo(targetTime);
        }
    };

    // Use drag percent during drag, otherwise use calculated progress
    const displayPercent = dragPercent !== null ? dragPercent : progressPercent;

    return (
        <div ref={containerRef} className={cn("relative overflow-hidden bg-black group/video", className)}>
            {/* Video Player */}
            {isCloudflare ? (
                <Stream
                    src={url}
                    poster={poster}
                    streamRef={streamRef}
                    controls={showControls && !showProgressBar}
                    responsive={true}
                    className="w-full h-full"
                    onPlay={() => { setIsPlaying(true); onPlay?.(); }}
                    onPause={() => { setIsPlaying(false); onPause?.(); }}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetaData={(e) => {
                        handleLoadedMetadata(e);
                        // Ensure visual start point matches trim
                        if (trimStart && trimStart > 0 && streamRef.current) {
                            streamRef.current.currentTime = trimStart;
                            setCurrentTime(trimStart);
                        }
                    }}
                    startTime={trimStart && trimStart > 0 ? trimStart : undefined}
                />
            ) : (
                <video
                    ref={videoRef}
                    src={url}
                    poster={poster}
                    className="w-full h-full object-cover"
                    controls={showControls && !showProgressBar}
                    playsInline
                    preload="metadata"
                    onPlay={() => { setIsPlaying(true); onPlay?.(); }}
                    onPause={() => { setIsPlaying(false); onPause?.(); }}
                    onEnded={() => { setIsPlaying(false); onPause?.(); }}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={(e) => {
                        handleLoadedMetadata(e);
                        // Ensure we start at the trim start point visually
                        if (trimStart && trimStart > 0 && videoRef.current) {
                            videoRef.current.currentTime = trimStart;
                            setCurrentTime(trimStart);
                        }
                    }}
                    onClick={togglePlayback}
                />
            )}

            {/* Duration Badge - only when not showing progress bar */}
            {showDurationBadge && !showProgressBar && !isPlaying && trimmedDuration > 0 && (
                <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-1.5 py-0.5 rounded z-20">
                    {formatTime(trimmedDuration)}
                </div>
            )}

            {/* Custom Control Bar */}
            {(showProgressBar || showVolumeControl || showFullscreenButton) && (
                <div
                    className={cn(
                        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 py-2 z-30 transition-opacity",
                        !isPlaying ? "opacity-100" : "opacity-0 group-hover/video:opacity-100"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Progress Bar Row */}
                    {showProgressBar && (
                        <div className="mb-2 relative">
                            {/* Progress Track */}
                            <div
                                ref={progressRef}
                                className="h-1.5 bg-zinc-600/50 rounded-full cursor-pointer relative touch-none group/progress"
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();

                                    // Capture playing state and pause
                                    wasPlayingRef.current = isPlaying;
                                    if (isPlaying) {
                                        if (isCloudflare && streamRef.current) streamRef.current.pause();
                                        else if (videoRef.current) videoRef.current.pause();
                                        setIsPlaying(false);
                                    }

                                    setIsDragging(true);
                                    progressRef.current?.setPointerCapture(e.pointerId);

                                    // Seek immediately on click
                                    handleProgressInteraction(e.clientX, true);

                                    const onMove = (ev: PointerEvent) => {
                                        ev.preventDefault();
                                        // Live scrub
                                        handleProgressInteraction(ev.clientX, true);
                                    };

                                    const onUp = (ev: PointerEvent) => {
                                        handleProgressInteraction(ev.clientX, true);
                                        setIsDragging(false);
                                        setDragPercent(null);

                                        // Resume if it was playing
                                        if (wasPlayingRef.current) {
                                            if (isCloudflare && streamRef.current) streamRef.current.play();
                                            else if (videoRef.current) videoRef.current.play();
                                            setIsPlaying(true);
                                        }

                                        document.removeEventListener('pointermove', onMove);
                                        document.removeEventListener('pointerup', onUp);
                                    };
                                    document.addEventListener('pointermove', onMove);
                                    document.addEventListener('pointerup', onUp);
                                }}
                            >
                                {/* Progress Fill */}
                                <div
                                    className={cn(
                                        "absolute top-0 left-0 h-full bg-purple-500 rounded-full",
                                        !isDragging && "transition-all duration-75"
                                    )}
                                    style={{ width: `${displayPercent}%` }}
                                />

                                {/* Scrubber Circle */}
                                <div
                                    className={cn(
                                        "absolute top-1/2 -translate-y-1/2 size-4 rounded-full shadow hover:scale-125 data-[dragging=true]:scale-125 z-50",
                                        !isDragging && "transition-transform"
                                    )}
                                    data-dragging={isDragging}
                                    style={{
                                        left: `calc(${displayPercent}% - 8px)`,
                                        backgroundColor: '#ffffff',
                                        border: '2px solid #ffffff'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Controls Row */}
                    <div className="flex items-center justify-between gap-3 text-white">
                        <div className="flex items-center gap-3">
                            {/* Play/Pause Small Button */}
                            <button onClick={togglePlayback} className="hover:text-purple-400 transition-colors">
                                {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
                            </button>

                            {/* Volume Control */}
                            {showVolumeControl && (
                                <div className="flex items-center gap-2 group/volume">
                                    <button onClick={toggleMute} className="hover:text-purple-400 transition-colors">
                                        {isMuted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                                    </button>
                                    <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 ease-in-out">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={isMuted ? 0 : volume}
                                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                            className="w-20 h-1 accent-purple-500 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Time Display */}
                            {showProgressBar && (
                                <div className="text-[10px] font-mono text-white/80">
                                    <span>{formatTime(relativeTime)}</span>
                                    <span className="mx-1">/</span>
                                    <span>{formatTime(trimmedDuration)}</span>
                                </div>
                            )}
                        </div>

                        {/* Fullscreen Button */}
                        {showFullscreenButton && (
                            <button onClick={toggleFullscreen} className="hover:text-purple-400 transition-colors">
                                {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Play/Pause Button Overlay - Only if no custom overlay */}
            {showPlayPauseButton && !customOverlay && (
                <div
                    onClick={togglePlayback}
                    className={cn(
                        "absolute inset-0 flex items-center justify-center transition-all cursor-pointer z-10",
                        overlayOnHoverOnly
                            ? "opacity-0 group-hover/video:opacity-100 bg-black/20"
                            : isPlaying
                                ? "opacity-0 group-hover/video:opacity-100 bg-black/20"
                                : "opacity-100 bg-black/30 group-hover/video:bg-black/40"
                    )}
                >
                    <div className={cn(
                        "rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-transform",
                        isPlaying ? "scale-100" : "scale-100 group-hover/video:scale-110",
                        "size-10" // Slightly smaller size for better fit in previews
                    )}>
                        {isPlaying ? (
                            <Pause className="size-5 text-white fill-white" />
                        ) : (
                            <Play className="size-5 text-white fill-white ml-0.5" />
                        )}
                    </div>
                </div>
            )}

            {/* Custom Overlay - Renders custom UI with access to player state */}
            {customOverlay && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Allow pointer events on children */}
                    <div className="w-full h-full [&>*]:pointer-events-auto">
                        {customOverlay({ isPlaying, togglePlayback })}
                    </div>
                </div>
            )}
        </div>
    );
}

