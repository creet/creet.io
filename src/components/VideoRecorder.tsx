import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings2,
    X,
    Play,
    Pause,
    Square,
    Pencil,
    ChevronDown,
    Check,
    Sun,
    RotateCcw, // Retake icon
    ArrowRight, // Continue icon
    Upload // Upload icon
} from 'lucide-react';
import { getPrimaryButtonStyles } from '@/lib/design-tokens';
import { VIDEO_LIMITS, getVideoDuration } from '@/lib/constants/limits';

interface VideoRecorderProps {
    onCancel: () => void;
    onComplete: (videoBlob: Blob) => void;
    onLightModeChange?: (isLightMode: boolean) => void;
    theme?: { primaryColor?: string };
    isUploading?: boolean;  // Show upload overlay when true
    initialVideoUrl?: string;  // If provided, start in preview mode with this video URL
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onCancel, onComplete, onLightModeChange, theme, isUploading = false, initialVideoUrl }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chunksRef = useRef<Blob[]>([]);
    const animationFrameRef = useRef<number | undefined>(undefined);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [devices, setDevices] = useState<{ audio: MediaDeviceInfo[], video: MediaDeviceInfo[] }>({ audio: [], video: [] });
    const [selectedDevices, setSelectedDevices] = useState<{ audio: string, video: string }>({ audio: '', video: '' });

    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    // If initialVideoUrl provided, start in preview mode
    const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl || null);
    // Track if we have a pre-existing video (from context)
    const [hasPreexistingVideo, setHasPreexistingVideo] = useState(!!initialVideoUrl);

    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);

    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showInitialHint, setShowInitialHint] = useState(true);
    const [lightMode, setLightMode] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    // Motivational messages for countdown
    const countdownMessages: { [key: number]: string } = {
        3: "Get ready! 🎬",
        2: "Smile! 😊",
        1: "You got this! ✨"
    };

    // Notify parent when light mode changes
    useEffect(() => {
        onLightModeChange?.(lightMode);
    }, [lightMode, onLightModeChange]);

    // Hide initial hint after a delay or when recording starts
    useEffect(() => {
        const timer = setTimeout(() => setShowInitialHint(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    // Clean up video URL on unmount
    useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
        };
    }, [videoUrl]);

    useEffect(() => {
        if (isRecording) setShowInitialHint(false);
    }, [isRecording]);

    // Initialize camera
    const startCamera = useCallback(async (audioId?: string, videoId?: string) => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const constraints: MediaStreamConstraints = {
                audio: audioId ? { deviceId: { exact: audioId } } : true,
                video: videoId ? { deviceId: { exact: videoId } } : { facingMode: 'user' }
            };

            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            setPermissionError(null);

            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }

            // Audio analysis
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(newStream);
            microphone.connect(analyser);
            analyser.fftSize = 64;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateAudioLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setAudioLevel(average);
                animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            };

            updateAudioLevel();

        } catch (err: any) {
            console.error("Error accessing media devices:", err);

            // Try to determine which permission is missing
            try {
                // Test camera only
                await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                // Camera works, so it's a microphone issue
                setPermissionError("Please allow access to your microphone.");
            } catch (videoErr) {
                try {
                    // Test microphone only
                    await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    // Microphone works, so it's a camera issue
                    setPermissionError("Please allow access to your camera.");
                } catch (audioErr) {
                    // Both failed
                    setPermissionError("Please allow access to both camera and microphone.");
                }
            }
        }
    }, []);

    // Get devices on mount
    useEffect(() => {
        const getDevices = async () => {
            try {
                const dev = await navigator.mediaDevices.enumerateDevices();
                setDevices({
                    audio: dev.filter(d => d.kind === 'audioinput'),
                    video: dev.filter(d => d.kind === 'videoinput')
                });
                // Only start camera if we don't have a pre-existing video to show
                if (!initialVideoUrl) {
                    startCamera();
                }
            } catch (err) {
                console.error(err);
            }
        };
        getDevices();

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    // Timer & Auto-stop
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording && !isPaused) {
            interval = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= VIDEO_LIMITS.MAX_DURATION_SECONDS) {
                        // Stop recording automatically
                        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                            mediaRecorderRef.current.stop();
                        }
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording, isPaused]);

    // Handle auto-stop state change
    useEffect(() => {
        if (recordingTime >= VIDEO_LIMITS.MAX_DURATION_SECONDS && isRecording) {
            setIsRecording(false);
            setIsPaused(false);
        }
    }, [recordingTime, isRecording]);

    // Setup Review Mode
    useEffect(() => {
        if (recordedBlob && videoRef.current) {
            // Stop camera stream tracks to stop the "recording" light/resource usage
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const url = URL.createObjectURL(recordedBlob);
            setVideoUrl(url);

            videoRef.current.srcObject = null;
            videoRef.current.src = url;
            videoRef.current.load();
            videoRef.current.play().catch(e => console.error("Play failed", e));
            setIsPlaying(true);
        }
    }, [recordedBlob]);

    // Setup preview mode from initialVideoUrl (when navigating back with existing video)
    useEffect(() => {
        if (initialVideoUrl && videoRef.current && !recordedBlob) {
            // Stop camera if running
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            // Set up video preview with the URL
            videoRef.current.srcObject = null;
            videoRef.current.src = initialVideoUrl;
            videoRef.current.load();
            // Don't auto-play for pre-existing videos
        }
    }, [initialVideoUrl]);

    const handleRetake = async () => {
        // Only revoke if it's a blob URL (starts with blob:), not a cloudflare URL
        if (videoUrl && videoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(videoUrl);
        }
        setVideoUrl(null);
        setRecordedBlob(null);
        setHasPreexistingVideo(false);
        setIsPlaying(false);
        setRecordingTime(0);

        // Clear video src
        if (videoRef.current) {
            videoRef.current.src = "";
            videoRef.current.srcObject = null;
        }

        // Restart camera
        await startCamera(selectedDevices.audio, selectedDevices.video);
    };

    const handleContinue = () => {
        if (recordedBlob) {
            onComplete(recordedBlob);
        } else if (hasPreexistingVideo) {
            // For pre-existing videos (navigating back), just call onNext/onComplete
            // The video is already saved in context, so we don't need to do anything
            // Just navigate forward
            onCancel(); // This will close the video mode and go back to options, then user can click Continue
        }
    };

    const togglePlayback = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate Size
            if (file.size > VIDEO_LIMITS.MAX_FILE_SIZE_BYTES) {
                setValidationError(`Video file is too large. Max size is ${VIDEO_LIMITS.MAX_FILE_SIZE_DISPLAY}.`);
                // Clear input
                e.target.value = "";
                return;
            }

            // Validate Duration
            try {
                const duration = await getVideoDuration(file);
                if (duration > VIDEO_LIMITS.MAX_DURATION_SECONDS) {
                    setValidationError(`Video is too long. Max duration is ${VIDEO_LIMITS.MAX_DURATION_DISPLAY}.`);
                    e.target.value = "";
                    return;
                }
            } catch (err) {
                console.warn("Could not validate video duration", err);
                // Proceed if only metadata fails, but size is ok? 
                // Let's be lenient on metadata failure but strict on explicit duration violations.
            }

            setValidationError(null);
            setRecordedBlob(file);
        }
    };

    const actuallyStartRecording = () => {
        if (!stream) return;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            setRecordedBlob(blob);
        };

        mediaRecorder.start();
        setIsRecording(true);
        setIsPaused(false);
    };

    const startRecording = () => {
        if (!stream || countdown !== null) return;

        // Start countdown
        setCountdown(3);
        setShowInitialHint(false);

        // Countdown timer
        let count = 3;
        const countdownInterval = setInterval(() => {
            count -= 1;
            if (count > 0) {
                setCountdown(count);
            } else {
                clearInterval(countdownInterval);
                setCountdown(null);
                actuallyStartRecording();
            }
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
    };

    const togglePause = () => {
        if (!mediaRecorderRef.current) return;
        if (isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
        } else {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Are we in preview mode? (either from recording or pre-existing video)
    const isInPreviewMode = !!recordedBlob || hasPreexistingVideo;
    const isIframe = videoUrl && (videoUrl.includes('/iframe') || videoUrl.includes('iframe.'));

    return (
        <div className={`flex flex-col items-center justify-center w-full h-full p-6 md:p-10 transition-colors duration-500 ${lightMode ? 'bg-white' : ''}`}>

            {/* Main Video Container */}
            <div className={`relative w-full max-w-2xl aspect-[4/3] rounded-[28px] overflow-hidden shadow-2xl transition-all duration-500 ${lightMode ? 'ring-4 ring-white shadow-[0_0_80px_40px_rgba(255,255,255,0.9)]' : 'bg-gradient-to-br from-zinc-900 to-black ring-1 ring-white/5'}`}>
                {isIframe ? (
                    <iframe
                        src={videoUrl!}
                        className="w-full h-full bg-black"
                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <video
                        ref={videoRef}
                        src={hasPreexistingVideo && videoUrl ? videoUrl : undefined}
                        autoPlay={!isInPreviewMode}
                        playsInline
                        muted={!isInPreviewMode}
                        controls={isInPreviewMode}
                        onEnded={() => setIsPlaying(false)}
                        className={`w-full h-full object-cover transform transition-transform duration-500 ${isInPreviewMode ? '' : 'scale-x-[-1.25] scale-y-[1.20]'}`}
                    />
                )}

                {/* Permission Error Overlay */}
                {(permissionError || validationError) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 rounded-[28px]">
                        <div className="text-center p-8 max-w-sm">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                                <X className="w-8 h-8 text-red-400" />
                            </div>
                            <p className="text-white font-semibold text-lg mb-1">
                                {validationError ? 'Upload Error' :
                                    permissionError?.includes('microphone') && !permissionError?.includes('camera')
                                        ? 'Microphone Access Required'
                                        : permissionError?.includes('camera') && !permissionError?.includes('microphone')
                                            ? 'Camera Access Required'
                                            : 'Camera & Microphone Access Required'}
                            </p>
                            <p className="text-sm text-gray-400">{validationError || permissionError}</p>

                            {validationError && (
                                <button
                                    onClick={() => setValidationError(null)}
                                    className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Upload in Progress Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 rounded-[28px]">
                        <div className="text-center p-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${theme?.primaryColor || '#A855F7'}20` }}>
                                <svg className="animate-spin w-8 h-8" style={{ color: theme?.primaryColor || '#A855F7' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <p className="text-white font-semibold text-lg mb-1">Uploading your video...</p>
                            <p className="text-sm text-gray-400">Please wait while we process your testimonial</p>
                        </div>
                    </div>
                )}

                {/* Countdown Overlay */}
                <AnimatePresence>
                    {countdown !== null && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-50"
                        >
                            <motion.div
                                key={countdown}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="text-center"
                            >
                                <div className="text-8xl md:text-9xl font-bold text-white drop-shadow-2xl">
                                    {countdown}
                                </div>
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-xl md:text-2xl text-white/90 mt-4 font-medium"
                                >
                                    {countdownMessages[countdown]}
                                </motion.p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Subtle Initial Hint (Fades after a few seconds) - Only during recording mode */}
                {!isInPreviewMode && (
                    <AnimatePresence>
                        {showInitialHint && !isRecording && !permissionError && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                            >
                                <p className="text-white/60 text-sm font-medium tracking-wide" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>
                                    Center yourself and press record when ready
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* Notes Overlay - Only during recording mode */}
                {!isInPreviewMode && (
                    <AnimatePresence>
                        {showNotes && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 bg-gradient-to-b from-black/25 via-transparent to-black/25 p-6 md:p-10 flex flex-col items-center justify-center"
                            >
                                <textarea
                                    autoFocus
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Type your notes..."
                                    className="w-full h-full max-w-lg bg-transparent border-none text-white text-lg md:text-xl font-medium text-center placeholder-white/30 focus:outline-none resize-none overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* Top Bar: Close & Settings - Only during recording mode */}
                {!isInPreviewMode && (
                    <div className="absolute top-0 left-0 right-0 p-5 z-30 flex justify-between items-start">
                        <button
                            onClick={onCancel}
                            className="p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white/80 hover:text-white transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2">
                            {/* Light Mode Toggle */}
                            <button
                                onClick={() => setLightMode(!lightMode)}
                                className={`p-2 rounded-full backdrop-blur-sm transition-all ${lightMode ? 'bg-amber-400 text-amber-900 shadow-lg shadow-amber-400/50' : 'bg-black/30 hover:bg-black/50 text-white/80 hover:text-white'}`}
                                aria-label="Toggle Light Mode"
                            >
                                <Sun className="w-5 h-5" />
                            </button>

                            {/* Settings */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white/80 hover:text-white transition-all"
                                >
                                    <Settings2 className="w-5 h-5" />
                                </button>

                                <AnimatePresence>
                                    {showSettings && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-56 p-3 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-40 origin-top-right text-left"
                                        >
                                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 px-1">Sources</p>
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <select
                                                        value={selectedDevices.video}
                                                        onChange={(e) => {
                                                            setSelectedDevices(p => ({ ...p, video: e.target.value }));
                                                            startCamera(selectedDevices.audio, e.target.value);
                                                        }}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs text-white appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                                                    >
                                                        {devices.video.map(d => (
                                                            <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-2.5 top-2.5 w-3 h-3 text-gray-500 pointer-events-none" />
                                                </div>
                                                <div className="relative">
                                                    <select
                                                        value={selectedDevices.audio}
                                                        onChange={(e) => {
                                                            setSelectedDevices(p => ({ ...p, audio: e.target.value }));
                                                            startCamera(e.target.value, selectedDevices.video);
                                                        }}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-xs text-white appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                                                    >
                                                        {devices.audio.map(d => (
                                                            <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-2.5 top-2.5 w-3 h-3 text-gray-500 pointer-events-none" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Controls Bar - Only during recording mode */}
                {!isInPreviewMode && (
                    <div className="absolute bottom-0 inset-x-0 z-30">
                        <div className="flex items-center justify-between p-5">
                            {/* Left: Timer & Audio Visualizer */}
                            <div className="flex items-center gap-3 min-w-[100px] px-3 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
                                <div className="flex items-end gap-0.5 h-4">
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className={`w-[3px] rounded-full ${isRecording && !isPaused ?
                                                (recordingTime > VIDEO_LIMITS.MAX_DURATION_SECONDS - 30 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]')
                                                : 'bg-white/70'}`}
                                            animate={{
                                                height: Math.max(3, Math.min(16, audioLevel * (Math.random() * 0.6 + 0.4) * 0.4))
                                            }}
                                            transition={{ ease: "easeOut", duration: 0.08 }}
                                        />
                                    ))}
                                </div>
                                <span className={`font-mono text-sm font-semibold tracking-wider ${isRecording && !isPaused ?
                                    (recordingTime > VIDEO_LIMITS.MAX_DURATION_SECONDS - 30 ? 'text-red-500 drop-shadow-md animate-pulse' : 'text-rose-500 drop-shadow-md')
                                    : 'text-white drop-shadow-md'}`}>
                                    {formatTime(recordingTime)}
                                </span>
                            </div>

                            {/* Center: Main Record Controls */}
                            <div className="flex items-center justify-center gap-4">
                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        disabled={!!permissionError}
                                        className="group relative cursor-pointer transform transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Start Recording"
                                    >
                                        <div className="w-[60px] h-[60px] rounded-full border-[3px] border-white flex items-center justify-center bg-black/30 backdrop-blur-sm shadow-xl group-hover:border-white transition-colors">
                                            <div className="w-[48px] h-[48px] bg-gradient-to-tr from-rose-600 to-rose-500 rounded-full group-hover:scale-105 transition-transform shadow-md" />
                                        </div>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={togglePause}
                                            className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all transform hover:scale-105 shadow-lg border ${isPaused ? 'bg-white text-rose-500 border-white/20' : 'bg-black/40 border-white/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300'}`}
                                            aria-label={isPaused ? "Resume" : "Pause"}
                                        >
                                            {isPaused ? <Play className="w-5 h-5 fill-current ml-0.5" /> : <Pause className="w-5 h-5 fill-current" />}
                                        </button>

                                        <button
                                            onClick={stopRecording}
                                            className="group cursor-pointer transform transition-transform active:scale-90"
                                            aria-label="Stop Recording"
                                        >
                                            <div className="w-[64px] h-[64px] rounded-full border-[3px] border-white/30 flex items-center justify-center bg-black/30 backdrop-blur-md group-hover:bg-black/40 transition-colors shadow-xl">
                                                <div className="w-7 h-7 bg-rose-500 rounded-[6px] shadow-sm group-hover:bg-rose-400 transition-colors" />
                                            </div>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Right: Notes Toggle */}
                            <div className="flex justify-end min-w-[100px]">
                                <button
                                    onClick={() => setShowNotes(!showNotes)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all shadow-lg border ${showNotes ? 'bg-purple-500/40 text-white border-purple-400/40' : 'bg-black/40 border-white/10 text-white/90 hover:bg-black/50 hover:text-white'}`}
                                    aria-label="Toggle Notes"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>Notes</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons BELOW the video - Only in review mode */}
            {isInPreviewMode && (
                <div className="w-full max-w-2xl mt-6 flex items-center justify-between gap-4">
                    <button
                        onClick={handleRetake}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retake</span>
                    </button>

                    <button
                        onClick={handleContinue}
                        className="group flex items-center gap-2 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all"
                        style={getPrimaryButtonStyles(theme?.primaryColor)}
                    >
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            )}

            {/* Upload Button - Show only when not recording and not reviewing */}
            {!isInPreviewMode && !isRecording && (
                <div className="mt-6">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`group flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all ${lightMode
                            ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white'
                            }`}
                    >
                        <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        <span className="text-sm font-medium">Upload a video instead</span>
                    </button>
                </div>
            )}

        </div>
    );
};

export default VideoRecorder;
