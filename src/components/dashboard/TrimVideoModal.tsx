"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Stream } from "@cloudflare/stream-react";
import { Play, Pause, Scissors, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrimVideoModalProps {
    videoUrl: string;
    poster?: string;
    isOpen: boolean; // Acts as "Is Trim Mode Active"
    onClose: () => void;
    onSave: (start: number, end: number) => Promise<void>;
    startTime?: number;
    endTime?: number;
}

export function TrimVideoModal({ videoUrl, poster, isOpen, onClose, onSave, startTime = 0, endTime }: TrimVideoModalProps) {
    // Check if Cloudflare UID
    const isCloudflare = videoUrl && !videoUrl.includes('/') && !videoUrl.startsWith('http') && !videoUrl.startsWith('blob:');

    const [duration, setDuration] = useState<number>(0);
    const [range, setRange] = useState<[number, number]>([0, 0]); // Start with 0,0 and update when duration loads
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isLoadingDuration, setIsLoadingDuration] = useState(true);

    const streamRef = useRef<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const rangeRef = useRef<[number, number]>([0, 0]);

    // Keep rangeRef in sync with range state
    useEffect(() => {
        rangeRef.current = range;
    }, [range]);

    // Helper to update duration and range
    const updateDurationAndRange = (d: number) => {
        if (d > 0 && duration === 0) {
            setDuration(d);
            setIsLoadingDuration(false);
            // Set range based on saved values (both modes use saved values)
            // In Trim Mode: shows saved selection for editing
            // In View Mode: enforces playback within saved selection
            const effectiveStart = startTime || 0;
            const effectiveEnd = endTime || d;
            setRange([effectiveStart, effectiveEnd]);
        }
    };

    // Sync state when props change (ONLY after duration is loaded)
    useEffect(() => {
        if (duration === 0) return; // Wait for duration to load

        // Both Trim Mode and View Mode use saved values
        // Trim Mode: slider handles at saved positions, timeline spans 0 to duration
        // View Mode: playback enforced within saved range
        const effectiveStart = startTime || 0;
        const effectiveEnd = endTime || duration;
        setRange([effectiveStart, effectiveEnd]);
    }, [isOpen, startTime, endTime, duration]);

    // Poll for duration from player refs (fallback mechanism)
    useEffect(() => {
        if (duration > 0) return; // Already have duration

        const pollDuration = setInterval(() => {
            let d = 0;
            if (isCloudflare && streamRef.current) {
                d = streamRef.current.duration || 0;
            } else if (videoRef.current) {
                d = videoRef.current.duration || 0;
            }
            if (d > 0 && !isNaN(d) && isFinite(d)) {
                updateDurationAndRange(d);
                clearInterval(pollDuration);
            }
        }, 300);

        return () => clearInterval(pollDuration);
    }, [duration, isCloudflare, isOpen, startTime, endTime]);


    // Fetch video duration from Cloudflare (Only runs once ideally)
    useEffect(() => {
        if (isCloudflare && videoUrl && duration === 0) {
            const fetchDuration = async () => {
                try {
                    // Try lifecycle API
                    const lifecycleResponse = await fetch(`https://videodelivery.net/${videoUrl}/lifecycle`);
                    if (lifecycleResponse.ok) {
                        const data = await lifecycleResponse.json();
                        if (data.duration && data.duration > 0) {
                            updateDurationAndRange(data.duration);
                            return;
                        }
                    }
                    // Fallback to Meta
                    const metaResponse = await fetch(`https://videodelivery.net/${videoUrl}/meta`);
                    if (metaResponse.ok) {
                        const metaData = await metaResponse.json();
                        if (metaData.duration) {
                            updateDurationAndRange(metaData.duration);
                            return;
                        }
                    }
                    // Fallback to local api
                    try {
                        const response = await fetch(`/api/cloudflare/video-info?uid=${videoUrl}`);
                        if (response.ok) {
                            const data = await response.json();
                            if (data.duration && data.duration > 0) {
                                updateDurationAndRange(data.duration);
                                return;
                            }
                        }
                    } catch (apiErr) { }
                } catch (err) {
                    // console.error("Failed to fetch video duration:", err);
                }
            };
            fetchDuration();
        }
    }, [isCloudflare, videoUrl, duration]);


    // Playback Controls
    const togglePlayback = () => {
        if (isCloudflare && streamRef.current) {
            if (isPlaying) {
                streamRef.current.pause();
            } else {
                handlePlayStart();
                streamRef.current.play();
            }
        } else if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                handlePlayStart();
                videoRef.current.play();
            }
        }
    };

    const handlePlayStart = () => {
        // Enforce trim range logic
        let startFrom = currentTime;
        // If outside range, snap to start
        if (startFrom < range[0] || startFrom >= range[1] - 0.1) {
            startFrom = range[0];
        }
        seekTo(startFrom);
    };

    const seekTo = (time: number) => {
        if (isCloudflare && streamRef.current) {
            streamRef.current.currentTime = time;
        } else if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
        setCurrentTime(time);
    };

    // Called by player on time update
    const handleTimeUpdate = (e: any) => {
        let time = 0;
        if (isCloudflare) {
            time = e.detail?.currentTime ?? streamRef.current?.currentTime ?? 0;
        } else {
            time = videoRef.current?.currentTime || 0;
        }
        setCurrentTime(time);

        // Check Loop/Stop condition
        // Use rangeRef to get latest range without closure staleness
        const [start, end] = rangeRef.current;

        // Ensure strictly respecting the end time (don't rely on isPlaying state which may be stale)
        if (end > 0 && time >= end) {
            if (isCloudflare && streamRef.current) {
                streamRef.current.pause();
                streamRef.current.currentTime = start;
            }
            if (!isCloudflare && videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = start;
            }
            setIsPlaying(false);
        }
    };

    const handleLoadedMetadata = (e: any) => {
        let d = 0;
        if (isCloudflare) {
            d = e?.detail?.duration || 0;
        } else {
            d = videoRef.current?.duration || 0;
        }

        if (d > 0 && duration === 0) {
            updateDurationAndRange(d);

            // If initial load and we have a start time, seek to it
            if (startTime > 0 && currentTime < 0.1) {
                seekTo(startTime);
            }
        }
    }

    const handleSaveTrim = async () => {
        await onSave(range[0], range[1]);
        onClose();
    };

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);


    return (
        <div className={cn(
            "transition-all duration-300 ease-in-out bg-black overflow-hidden",
            isOpen ? "fixed inset-0 z-50 flex flex-col bg-[#09090b]" : "relative w-full h-full rounded-lg border border-zinc-800"
        )}>
            {/* Header - Visible Only in Trim Mode */}
            {isOpen && (
                <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#09090b] shrink-0 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <h1 className="font-semibold text-lg text-white">Trim Video</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={onClose}>Cancel</Button>
                        <Button
                            onClick={handleSaveTrim}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium"
                        >
                            <Scissors className="size-4" />
                            Trim & Save
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className={cn(
                "flex-1 flex flex-col items-center justify-center overflow-hidden",
                isOpen ? "p-8 gap-6" : "p-0"
            )}>

                {/* Video Container */}
                <div className={cn(
                    "relative overflow-hidden shrink-0 transition-all duration-300",
                    isOpen ? "w-full max-w-3xl aspect-video rounded-lg shadow-2xl ring-1 ring-zinc-800 bg-black group" : "w-full h-full bg-black group"
                )}>
                    {/* Check if video has a trim (for showing custom controls in view mode) */}
                    {(() => {
                        const hasTrim = !isOpen && startTime !== undefined && endTime !== undefined && (startTime > 0 || endTime < duration);
                        const trimmedDuration = hasTrim ? (endTime || duration) - (startTime || 0) : duration;
                        const relativeTime = hasTrim ? Math.max(0, currentTime - (startTime || 0)) : currentTime;

                        return (
                            <>
                                {isCloudflare ? (
                                    <Stream
                                        src={videoUrl}
                                        poster={poster}
                                        streamRef={streamRef}
                                        controls={false}
                                        responsive={true}
                                        className="w-full h-full"
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onTimeUpdate={handleTimeUpdate}
                                        onLoadedMetaData={handleLoadedMetadata}
                                        startTime={!isOpen && startTime && startTime > 0 ? startTime : undefined}
                                    />
                                ) : (
                                    <video
                                        ref={videoRef}
                                        src={videoUrl}
                                        poster={poster}
                                        className="w-full h-full object-cover"
                                        controls={false}
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onTimeUpdate={handleTimeUpdate}
                                        onLoadedMetadata={handleLoadedMetadata}
                                    />
                                )}

                                {/* Custom Controls for View Mode - Alway show regardless of trim */}
                                {!isOpen && (
                                    <div className="absolute inset-0 flex flex-col">
                                        {/* Click to play/pause overlay */}
                                        <div
                                            className="flex-1 flex items-center justify-center cursor-pointer"
                                            onClick={togglePlayback}
                                        >
                                            {!isPlaying && (
                                                <div className="size-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110">
                                                    <Play className="size-6 text-white fill-white ml-0.5" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom controls bar */}
                                        <div className="bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
                                            {/* Progress bar - draggable */}
                                            <div
                                                className="h-2 bg-zinc-700 rounded-full mb-2 cursor-pointer touch-none"
                                                onPointerDown={(e) => {
                                                    const bar = e.currentTarget;
                                                    const rect = bar.getBoundingClientRect();
                                                    bar.setPointerCapture(e.pointerId);

                                                    const seek = (clientX: number) => {
                                                        const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                                                        const t = (startTime || 0) + p * trimmedDuration;
                                                        seekTo(Math.min(Math.max(t, startTime || 0), endTime || duration));
                                                    };

                                                    seek(e.clientX); // Seek immediately on click

                                                    const move = (ev: PointerEvent) => seek(ev.clientX);
                                                    const up = () => {
                                                        document.removeEventListener('pointermove', move);
                                                        document.removeEventListener('pointerup', up);
                                                    };
                                                    document.addEventListener('pointermove', move);
                                                    document.addEventListener('pointerup', up);
                                                }}
                                            >
                                                <div
                                                    className="h-full bg-purple-500 rounded-full"
                                                    style={{ width: `${trimmedDuration > 0 ? (relativeTime / trimmedDuration) * 100 : 0}%` }}
                                                />
                                            </div>

                                            {/* Time display */}
                                            <div className="flex items-center justify-between text-white text-xs font-mono">
                                                <span>{formatTime(relativeTime, false)}</span>
                                                <span>{formatTime(trimmedDuration, false)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Custom Play/Pause Overlay - Only in Trim Mode */}
                                {isOpen && (
                                    <div
                                        className={`absolute inset-0 z-20 flex items-center justify-center cursor-pointer transition-colors duration-200 ${isPlaying ? 'bg-transparent hover:bg-black/20' : 'bg-transparent hover:bg-black/10'}`}
                                        onClick={togglePlayback}
                                    >
                                        <div className={`size-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 hover:bg-white/30`}>
                                            {isPlaying ? (
                                                <Pause className="size-8 text-white fill-white" />
                                            ) : (
                                                <Play className="size-8 text-white fill-white ml-1" />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>

                {/* Controls Panel - Only in Trim Mode */}
                {isOpen && (
                    <div className="w-full max-w-3xl bg-[#121214] rounded-xl border border-zinc-800/50 p-6 flex flex-col gap-6 shadow-xl shrink-0 animate-in fade-in slide-in-from-bottom-4">

                        {/* Time Row */}
                        <div className="flex items-center justify-between px-2">
                            <div className="text-zinc-500 font-mono text-xs">{formatTime(range[0])}</div>
                            <div className="flex gap-16">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Start Time</span>
                                    <span className="text-xl font-medium font-mono text-zinc-200">{formatTime(range[0])}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">End Time</span>
                                    <span className="text-xl font-medium font-mono text-zinc-200">{formatTime(range[1])}</span>
                                </div>
                            </div>
                            <div className="text-zinc-500 font-mono text-xs">{formatTime(duration)}</div>
                        </div>

                        {/* Slider */}
                        <div className="relative h-24 w-full flex items-center select-none rounded-lg bg-gradient-to-b from-zinc-900/50 to-zinc-950/50 border border-zinc-800/30">
                            {/* Waveform Grey */}
                            <div className="absolute inset-x-6 h-14 flex items-end justify-between gap-[1px] pointer-events-none">
                                {Array.from({ length: 120 }).map((_, i) => (
                                    <div key={i} className="flex-1 min-w-[2px] rounded-t-full bg-gradient-to-t from-zinc-800 via-zinc-700 to-zinc-600" style={{ height: `${Math.max(20, Math.sin(i * 0.25) * 25 + Math.cos(i * 0.15) * 20 + 30)}%`, opacity: 0.4 }} />
                                ))}
                            </div>
                            {/* Waveform Blue */}
                            <div className="absolute inset-x-6 h-14 flex items-end justify-between gap-[1px] pointer-events-none" style={{ clipPath: `inset(0 ${100 - (range[1] / duration) * 100}% 0 ${(range[0] / duration) * 100}%)` }}>
                                {Array.from({ length: 120 }).map((_, i) => (
                                    <div key={i} className="flex-1 min-w-[2px] rounded-t-full bg-gradient-to-t from-blue-600 via-blue-400 to-cyan-300" style={{ height: `${Math.max(20, Math.sin(i * 0.25) * 25 + Math.cos(i * 0.15) * 20 + 30)}%` }} />
                                ))}
                            </div>

                            {/* Selection Border */}
                            <div className="absolute h-full pointer-events-none z-10" style={{ left: `calc(${(range[0] / duration) * 100}% + 24px)`, right: `calc(${100 - (range[1] / duration) * 100}% + 24px)`, borderTop: '2px solid rgba(59, 130, 246, 0.5)', borderBottom: '2px solid rgba(59, 130, 246, 0.5)' }} />

                            {/* Handles Container */}
                            <div className="absolute inset-x-6 h-full" id="slider-track">
                                {/* Start Handle */}
                                <div className="absolute top-1 bottom-1 w-3 rounded-md z-50 flex items-center justify-center cursor-ew-resize touch-none group"
                                    style={{ left: `calc(${duration > 0 ? (range[0] / duration) * 100 : 0}% - 6px)`, background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
                                    onPointerDown={(e) => {
                                        const track = e.currentTarget.parentElement?.getBoundingClientRect();
                                        if (!track) return;
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        const move = (ev: PointerEvent) => {
                                            const p = Math.max(0, Math.min((ev.clientX - track.left) / track.width, 1));
                                            const t = Math.max(0, Math.min(p * duration, range[1] - 0.5)); // min gap
                                            setRange([t, range[1]]);
                                            if (currentTime < t) seekTo(t);
                                        };
                                        const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
                                        document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
                                    }}
                                ><div className="w-1 h-3 bg-white/50 rounded-full" /></div>

                                {/* End Handle */}
                                <div className="absolute top-1 bottom-1 w-3 rounded-md z-50 flex items-center justify-center cursor-ew-resize touch-none group"
                                    style={{ left: `calc(${(range[1] / duration) * 100}% - 6px)`, background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
                                    onPointerDown={(e) => {
                                        const track = e.currentTarget.parentElement?.getBoundingClientRect();
                                        if (!track) return;
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        const move = (ev: PointerEvent) => {
                                            const p = Math.max(0, Math.min((ev.clientX - track.left) / track.width, 1));
                                            const t = Math.min(duration, Math.max(p * duration, range[0] + 0.5));
                                            setRange([range[0], t]);
                                            if (currentTime > t) seekTo(t);
                                        };
                                        const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
                                        document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
                                    }}
                                ><div className="w-1 h-3 bg-white/50 rounded-full" /></div>

                                {/* Playhead - visuals with pointer-events-none to not block handles */}
                                <div className="absolute top-0 bottom-0 z-[60] pointer-events-none"
                                    style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 1px)` }}
                                >
                                    {/* Timestamp - draggable but lower z than slider handles so handles take precedence */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-40 pointer-events-auto cursor-ew-resize"
                                        onPointerDown={(e) => {
                                            const track = document.getElementById('slider-track')?.getBoundingClientRect();
                                            if (!track) return;
                                            e.currentTarget.setPointerCapture(e.pointerId);
                                            const move = (ev: PointerEvent) => {
                                                const p = Math.max(0, Math.min((ev.clientX - track.left) / track.width, 1));
                                                const t = Math.max(range[0], Math.min(range[1], p * duration));
                                                seekTo(t);
                                            };
                                            const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
                                            document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
                                        }}
                                    >
                                        <div className="text-purple-400 text-[10px] font-mono font-bold whitespace-nowrap drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] bg-zinc-950/80 px-1.5 py-0.5 rounded">
                                            {formatTime(currentTime, false)}
                                        </div>
                                    </div>

                                    {/* Pointer Head (Triangle) */}
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-purple-500 filter drop-shadow-lg" />

                                    {/* Line */}
                                    <div className="w-[2px] h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                                </div>

                                {/* Playhead Drag Area - lower z-index so handles take precedence */}
                                <div className="absolute top-0 bottom-0 w-4 z-30 cursor-ew-resize flex justify-center touch-none"
                                    style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 8px)` }}
                                    onPointerDown={(e) => {
                                        const track = e.currentTarget.parentElement?.getBoundingClientRect();
                                        if (!track) return;
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        const move = (ev: PointerEvent) => {
                                            const p = Math.max(0, Math.min((ev.clientX - track.left) / track.width, 1));
                                            const t = Math.max(range[0], Math.min(range[1], p * duration));
                                            seekTo(t);
                                        };
                                        const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
                                        document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <Button variant="secondary" onClick={togglePlayback} className="bg-zinc-800 text-white w-32">{isPlaying ? "Pause" : "Play"}</Button>
                            <Button variant="ghost" onClick={() => { setRange([0, duration]); seekTo(0); if (isCloudflare && streamRef.current) streamRef.current.pause(); setIsPlaying(false); }} className="text-zinc-500 hover:text-white"><RotateCcw className="size-4 mr-2" /> Reset</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatTime(seconds: number, showMs = true) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${min}:${sec.toString().padStart(2, '0')}${showMs ? `.${ms}` : ''}`;
}
