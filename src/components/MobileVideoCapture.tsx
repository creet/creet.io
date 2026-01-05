import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Upload, RotateCcw, ArrowRight, X, Play } from 'lucide-react';
import { getPrimaryButtonStyles } from '@/lib/design-tokens';
import { VIDEO_LIMITS, getVideoDuration } from '@/lib/constants/limits';

interface MobileVideoCaptureProps {
    onCancel: () => void;
    onComplete: (videoBlob: Blob) => void;
    theme?: { primaryColor?: string };
    isUploading?: boolean;  // Show upload overlay when true
    initialVideoUrl?: string;  // If provided, start in preview mode with this video URL
}

const MobileVideoCapture: React.FC<MobileVideoCaptureProps> = ({ onCancel, onComplete, theme, isUploading = false, initialVideoUrl }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [capturedVideo, setCapturedVideo] = useState<File | null>(null);
    // If initialVideoUrl provided, start in preview mode
    const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl || null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    // Track if we have a pre-existing video (from context)
    const [hasPreexistingVideo] = useState(!!initialVideoUrl);
    const isIframe = videoUrl && (videoUrl.includes('/iframe') || videoUrl.includes('iframe.'));

    // Clean up video URL on unmount (only for blob URLs)
    useEffect(() => {
        return () => {
            if (videoUrl && videoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [videoUrl]);

    // Handle file selection from native camera
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate Size
            if (file.size > VIDEO_LIMITS.MAX_FILE_SIZE_BYTES) {
                setValidationError(`Video file is too large. Max size is ${VIDEO_LIMITS.MAX_FILE_SIZE_DISPLAY}.`);
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
            }

            setValidationError(null);
            setCapturedVideo(file);
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
        }
    };

    // Trigger file input (opens native camera)
    const handleOpenCamera = () => {
        fileInputRef.current?.click();
    };

    // Retake - clear the captured video and open camera again
    const handleRetake = () => {
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoUrl(null);
        setCapturedVideo(null);
        setIsPlaying(false);

        // Reset the file input so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Open camera again
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 100);
    };

    // Continue - pass the video blob to parent
    const handleContinue = () => {
        if (capturedVideo) {
            onComplete(capturedVideo);
        } else if (hasPreexistingVideo) {
            // For pre-existing videos (navigating back), just call cancel to go back
            // The video is already saved in context
            onCancel();
        }
    };

    // Toggle video playback
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

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 relative">
            {/* Validation Error Overlay */}
            <AnimatePresence>
                {validationError && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
                    >
                        <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-6 text-center max-w-sm w-full shadow-2xl">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                                <X className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Upload Error</h3>
                            <p className="text-sm text-gray-400 mb-6">{validationError}</p>
                            <button
                                onClick={() => setValidationError(null)}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload in Progress Overlay */}
            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
                    >
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 text-center max-w-sm w-full shadow-2xl">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${theme?.primaryColor || '#A855F7'}20` }}>
                                <svg className="animate-spin w-8 h-8" style={{ color: theme?.primaryColor || '#A855F7' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Uploading your video...</h3>
                            <p className="text-sm text-gray-400">Please wait while we process your testimonial</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden file input for native camera capture */}
            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />

            <AnimatePresence mode="wait">
                {!capturedVideo && !hasPreexistingVideo ? (
                    // Initial state - Show capture options
                    <motion.div
                        key="capture-options"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md text-center"
                    >
                        {/* Close button */}
                        <div className="flex justify-start mb-6">
                            <button
                                onClick={onCancel}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Icon */}
                        <div
                            className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 border"
                            style={{
                                background: `linear-gradient(to bottom right, ${theme?.primaryColor || '#A855F7'}33, ${theme?.primaryColor || '#A855F7'}33)`,
                                borderColor: `${theme?.primaryColor || '#A855F7'}4D`
                            }}
                        >
                            <Video className="w-12 h-12" style={{ color: theme?.primaryColor || '#A855F7' }} />
                        </div>

                        {/* Title & Description */}
                        <h2 className="text-xl font-semibold text-white mb-2">Record Your Testimonial</h2>
                        <p className="text-sm text-gray-400 mb-8">
                            Tap the button below to open your camera and record a short video testimonial.
                        </p>

                        {/* Record Button */}
                        <button
                            onClick={handleOpenCamera}
                            className="w-full py-4 px-6 font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
                            style={getPrimaryButtonStyles(theme?.primaryColor)}
                        >
                            <Video className="w-5 h-5" />
                            <span>Open Camera to Record</span>
                        </button>

                        {/* Alternative: Upload existing video */}
                        <div className="mt-4">
                            <button
                                onClick={() => {
                                    // Remove capture attribute to allow file selection
                                    if (fileInputRef.current) {
                                        fileInputRef.current.removeAttribute('capture');
                                        fileInputRef.current.click();
                                        // Restore capture attribute after click
                                        setTimeout(() => {
                                            fileInputRef.current?.setAttribute('capture', 'environment');
                                        }, 100);
                                    }
                                }}
                                className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 font-semibold rounded-xl transition-all flex items-center justify-center gap-3"
                            >
                                <Upload className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium">Upload Video File</span>
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    // Preview state - Show captured video
                    <motion.div
                        key="video-preview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md"
                    >
                        {/* Video Preview */}
                        <div className="relative w-full aspect-[9/16] max-h-[50vh] rounded-2xl overflow-hidden bg-black shadow-2xl mb-6">
                            {isIframe ? (
                                <iframe
                                    src={videoUrl!}
                                    className="w-full h-full"
                                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video
                                    ref={videoRef}
                                    src={videoUrl || undefined}
                                    className="w-full h-full object-contain"
                                    playsInline
                                    controls
                                    onEnded={() => setIsPlaying(false)}
                                />
                            )}
                        </div>

                        {/* Preview Label */}
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-400">
                                Preview your video. You can retake if needed.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={handleRetake}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Retake</span>
                            </button>

                            <button
                                onClick={handleContinue}
                                className="flex-1 group flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
                                style={getPrimaryButtonStyles(theme?.primaryColor)}
                            >
                                <span>Continue</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileVideoCapture;
