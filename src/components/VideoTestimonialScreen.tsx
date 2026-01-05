'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VideoRecorder from './VideoRecorder';
import { QuestionBlockConfig, FormTheme } from '@/types/form-config';
import { DEFAULT_TESTIMONIAL_TIPS } from '@/lib/default-form-config';
import { CheckCircle2 } from 'lucide-react';

interface VideoTestimonialScreenProps {
    /** The question block configuration */
    config: QuestionBlockConfig;
    /** Optional theme for styling */
    theme?: FormTheme;
    /** Callback when recording is complete */
    onComplete: (videoBlob: Blob) => void;
    /** Callback to go back/cancel */
    onCancel: () => void;
    /** Optional logo URL override */
    logoUrl?: string;
}

/**
 * A dedicated full-screen video testimonial recording component.
 * The video is centered for uniform lighting when light mode is enabled.
 * Question/description at top, tips on the left side.
 */
const VideoTestimonialScreen: React.FC<VideoTestimonialScreenProps> = ({
    config,
    theme,
    onComplete,
    onCancel,
    logoUrl,
}) => {
    const [lightMode, setLightMode] = useState(false);
    const tips = config.props.tips || DEFAULT_TESTIMONIAL_TIPS;

    return (
        <div className={`fixed inset-0 z-50 flex flex-col transition-all duration-700 ${lightMode ? 'bg-white' : 'bg-[#0A0A0A]'}`}>

            {/* Top Section: Logo + Question + Description */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0 px-8 pt-6 pb-4"
            >
                {/* Logo (optional) */}
                {(logoUrl || theme?.logoUrl) && (
                    <div className="mb-4">
                        <img
                            src={logoUrl || theme?.logoUrl}
                            alt="Logo"
                            className="h-6 object-contain mx-auto"
                        />
                    </div>
                )}

                {/* Question & Description - Centered */}
                <div className="text-center max-w-2xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className={`text-xl md:text-2xl font-bold leading-tight tracking-tight mb-2 transition-colors duration-500 ${lightMode ? 'text-gray-900' : 'text-white'}`}
                    >
                        {config.props.question}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className={`text-sm leading-relaxed transition-colors duration-500 ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                        {config.props.description}
                    </motion.p>
                </div>
            </motion.header>

            {/* Main Content: Tips on Left, Video in Center */}
            <div className="flex-grow flex items-center justify-center relative px-8 pb-8">

                {/* Tips - Positioned on the Left */}
                {tips.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="absolute left-8 top-1/2 -translate-y-1/2 w-56 hidden lg:block"
                    >
                        <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-4 transition-colors duration-500 ${lightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Tips for a great video
                        </h3>
                        <div className="space-y-3">
                            {tips.map((tip, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                                    className="flex items-start gap-2.5"
                                >
                                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-colors duration-500 ${lightMode ? 'text-emerald-600' : 'text-emerald-500'}`} />
                                    <p className={`text-xs leading-relaxed transition-colors duration-500 ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {tip}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Video Recorder - Centered */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-full max-w-3xl"
                >
                    <VideoRecorder
                        onCancel={onCancel}
                        onComplete={onComplete}
                        onLightModeChange={setLightMode}
                    />
                </motion.div>

                {/* Optional: Right side could have additional info or be empty for symmetry */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 w-56 hidden lg:block">
                    {/* Empty for now - creates visual balance */}
                    {/* Could add: timer, recording status, or other info */}
                </div>
            </div>

            {/* Bottom: Subtle footer note */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className={`flex-shrink-0 text-center py-4 transition-colors duration-500 ${lightMode ? 'text-gray-400' : 'text-gray-600'}`}
            >
                <p className="text-xs">
                    Your testimonial will be reviewed before publishing
                </p>
            </motion.footer>
        </div>
    );
};

export default VideoTestimonialScreen;
