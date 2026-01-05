import React, { useState, useEffect } from 'react';
import { FormCardProps, FormCard } from '@/components/form-builder/FormCard';
import ContentContainer from '@/components/ui/content-container';
import AppBar from '@/components/ui/app-bar';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { QuestionBlockConfig } from '@/types/form-config';
import VideoRecorder from './VideoRecorder';
import MobileVideoCapture from './MobileVideoCapture';
import { DEFAULT_TESTIMONIAL_TIPS } from '@/lib/default-form-config';
import { uploadVideo, uploadPublicVideo } from '@/lib/video-upload';
import type { FormContext } from '@/components/public-form/FormRenderer';
import { getPrimaryButtonStyles, getContrastColor } from '@/lib/design-tokens';
import { useFormDataSafe, TestimonialData } from '@/components/public-form/FormDataContext';

// ═══════════════════════════════════════════════════════════════════════════
// ICONS - Feature/option icons (w-6 h-6 → lg:w-7 lg:h-7)
// ═══════════════════════════════════════════════════════════════════════════

const VideoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m22 8-6 4 6 4V8Z" />
        <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
    </svg>
);

const TypeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// HELPER HOOK
// ═══════════════════════════════════════════════════════════════════════════

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT TESTIMONIAL INPUT - Premium Apple/Figma-style text input
// ═══════════════════════════════════════════════════════════════════════════

interface TextTestimonialInputProps {
    theme?: { logoUrl?: string; primaryColor?: string };
    onNext: () => void;
    rightPanelVariants: Variants;
    onSaveTestimonial?: (data: TestimonialData) => void;
    initialText?: string;
}

const TextTestimonialInput = ({ theme, onNext, rightPanelVariants, onSaveTestimonial, initialText = '' }: TextTestimonialInputProps) => {
    const [testimonialText, setTestimonialText] = useState(initialText);
    const [isFocused, setIsFocused] = useState(false);

    const characterCount = testimonialText.length;
    const hasContent = characterCount > 0;

    return (
        <motion.div
            key="text"
            variants={rightPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full h-full flex flex-col justify-center"
        >
            {/* Spacious centered container */}
            <div className="flex-grow flex flex-col justify-center px-8 sm:px-12 cq-lg:px-14 py-10 cq-lg:py-12 max-w-2xl mx-auto w-full">

                {/* Textarea Container - Elegant and spacious */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Subtle label */}
                    <div className="mb-3 cq-lg:mb-4">
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            Your testimonial
                        </span>
                    </div>
                    <div
                        className={`relative flex-1 min-h-[240px] cq-lg:min-h-[320px] rounded-2xl cq-lg:rounded-3xl transition-all duration-500 
                            ${isFocused
                                ? 'ring-2 bg-zinc-900/90 shadow-2xl'
                                : 'bg-zinc-900/40 hover:bg-zinc-900/60'
                            } 
                            border ${isFocused ? 'border-opacity-20' : 'border-zinc-800/50 hover:border-zinc-700/50'}`}
                        style={{
                            ...(isFocused && {
                                '--tw-ring-color': `${theme?.primaryColor || '#A855F7'}66`,
                                borderColor: `${theme?.primaryColor || '#A855F7'}33`,
                                boxShadow: `0 25px 50px -12px ${theme?.primaryColor || '#A855F7'}0D`
                            } as React.CSSProperties)
                        }}
                    >
                        <textarea
                            value={testimonialText}
                            onChange={(e) => setTestimonialText(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Start writing your testimonial here..."
                            className="w-full h-full min-h-[240px] cq-lg:min-h-[320px] bg-transparent p-6 cq-lg:p-8 
                                text-base cq-lg:text-lg text-white placeholder-zinc-600 
                                focus:outline-none resize-none leading-relaxed tracking-wide"
                            style={{ caretColor: theme?.primaryColor || '#A855F7' }}
                        />

                        {/* Subtle corner decoration */}
                        <div className="absolute bottom-4 right-4 pointer-events-none opacity-30">
                            <TypeIcon className="w-5 h-5 cq-lg:w-6 cq-lg:h-6 text-zinc-600" />
                        </div>
                    </div>

                    {/* Footer - Clean and minimal */}
                    <div className="mt-6 cq-lg:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Character count - Subtle */}
                        <div className="order-2 sm:order-1">
                            <span className={`text-xs font-mono transition-all duration-300 ${hasContent ? 'text-zinc-400' : 'text-zinc-700'}`}>
                                {characterCount.toLocaleString()} characters
                            </span>
                        </div>

                        {/* Submit Button - Always enabled, elegant */}
                        <button
                            type="button"
                            onClick={() => {
                                // Save to context
                                if (onSaveTestimonial) {
                                    onSaveTestimonial({ type: 'text', text: testimonialText });
                                }
                                onNext();
                            }}
                            disabled={!hasContent}
                            className={`order-1 sm:order-2 w-full sm:w-auto px-8 h-12 cq-lg:h-14 rounded-xl font-semibold text-sm cq-lg:text-base 
                                transition-all duration-300 
                                ${hasContent
                                    ? 'shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                                    : 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed'
                                }`}
                            style={hasContent ? getPrimaryButtonStyles(theme?.primaryColor) : undefined}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface QuestionCardProps extends Omit<FormCardProps, 'onFieldFocus'> {
    config: QuestionBlockConfig;
    onFieldFocus?: (blockId: string, fieldPath: string) => void;
    formContext?: FormContext;  // Present when used in public form
}

const QuestionCard = ({
    config,
    onFieldFocus,
    theme,
    formContext,
    ...cardProps
}: QuestionCardProps) => {

    // Determine initial mode based on what's enabled
    const enableVideo = config.props.enableVideoTestimonial ?? true;
    const enableText = config.props.enableTextTestimonial ?? true;
    const tips = config.props.tips || DEFAULT_TESTIMONIAL_TIPS;

    // Get form data context (safe version returns null if not in provider)
    const formDataContext = useFormDataSafe();

    const getInitialVideoUrl = () => {
        const testimonial = formDataContext?.data.testimonial;
        if (testimonial?.type !== 'video') return undefined;

        // Use Cloudflare iframe URL for reliable playback
        const url = testimonial.videoUrl;
        if (!url) return undefined;

        // If it's already a full URL, use as-is; otherwise build the Cloudflare iframe URL
        return url.includes('/') ? url : `https://iframe.videodelivery.net/${url}`;
    };

    // If only one option is enabled, start in that mode
    // Also restore from context if user has already selected a mode
    const getInitialMode = (): 'options' | 'text' | 'video' => {
        // If there's saved testimonial data, show that mode
        if (formDataContext?.data.testimonial) {
            return formDataContext.data.testimonial.type === 'video' ? 'video' : 'text';
        }
        // Otherwise, default based on what's enabled
        if (enableVideo && enableText) return 'options';
        if (enableText && !enableVideo) return 'text';
        return 'options';
    };

    const [mode, setMode] = useState<'options' | 'text' | 'video'>(getInitialMode);
    const [lightMode, setLightMode] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const isDesktop = useMediaQuery('(min-width: 1024px)');


    // Helper to save testimonial data
    const saveTestimonial = (data: TestimonialData) => {
        if (formDataContext) {
            formDataContext.setTestimonial(data);
        }
    };

    const handleFieldClick = (fieldPath: string) => {
        onFieldFocus?.(config.id, fieldPath);
    };

    // Animation variants for right panel transitions
    const rightPanelVariants: Variants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: "easeIn" } }
    };

    const panelMotionProps = {
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    };

    // Handle video button click - switches to inline video mode
    const handleVideoClick = () => {
        setMode('video');
    };

    const handleVideoComplete = async (blob: Blob) => {
        // Start uploading
        setIsUploadingVideo(true);
        setUploadError(null);

        try {
            // Convert blob to File for upload
            const videoFile = new File([blob], `testimonial_${Date.now()}.webm`, {
                type: blob.type || 'video/webm'
            });

            // Upload the video - always goes to Cloudflare Stream
            // - If formContext exists (public form): use public upload with formId
            // - If no formContext (form builder preview): use authenticated upload
            let result;
            if (formContext?.formId) {
                // Public form - use public upload
                result = await uploadPublicVideo(videoFile, formContext.formId);
            } else {
                // Authenticated context or preview - use regular upload
                result = await uploadVideo(videoFile);
            }

            // Store Cloudflare UID
            const videoUrl = result.uid;

            // Save to context with Cloudflare video ID
            saveTestimonial({ type: 'video', videoUrl: videoUrl });

            // Navigate to next step
            cardProps.onNext();
        } catch (error: any) {
            console.error('[QuestionCard] Video upload failed:', error);
            setUploadError(error.message || 'Failed to upload video. Please try again.');
            // Don't save on error - user can retry
        } finally {
            setIsUploadingVideo(false);
        }
    };

    const handleVideoCancel = () => {
        setMode('options');
    };

    const handleTextClick = () => {
        setMode('text');
    };

    return (
        <FormCard
            {...cardProps}
            theme={theme}
        >
            {/* 
              SPLIT LAYOUT STRUCTURE:
              - Mobile: Stacked (full width each)
              - Desktop: Side-by-side (50/50 or 33/67 based on mode)
              
              Mode affects panel widths:
              - options: 50% / 50%
              - text: 33% / 67%
              - video: 33% / 67%
            */}
            <div className="flex-grow flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative custom-scrollbar">

                {/* 
                  LEFT PANEL: "The Ask" - Question, Description, Tips
                  
                  RESPONSIVE:
                  - Padding: px-6 sm:px-8 lg:px-12
                  - Width animates based on mode (desktop only)
                  - Background changes with lightMode (for video recording)
                */}
                <motion.div
                    animate={{
                        width: isDesktop
                            ? (mode === 'options' ? '50%' : '40%')
                            : '100%'
                    }}
                    transition={panelMotionProps}
                    className={`w-full cq-lg:w-1/2 flex flex-col shrink-0 cq-lg:overflow-hidden transition-colors duration-500 
                        ${lightMode ? 'bg-white' : 'bg-gradient-to-br from-[#1A1A1A] via-[#242424] to-[#1A1A1A]'}`}
                >
                    {/* App Bar with Logo and Back Button on right */}
                    <div className="flex-shrink-0">
                        <AppBar
                            maxWidthClass="max-w-md cq-lg:max-w-lg"
                            paddingXClass="px-6 sm:px-8 cq-lg:px-12"
                            logoUrl={theme?.logoUrl}
                            showBackButton={
                                mode === 'video' ||
                                (mode === 'text' && enableVideo) ||
                                !!cardProps.onPrevious
                            }
                            onBack={
                                mode === 'video' ? () => setMode('options') :
                                    mode === 'text' && enableVideo ? () => setMode('options') :
                                        cardProps.onPrevious || undefined
                            }
                        />
                    </div>

                    {/* Left Panel Content */}
                    <div className="flex-grow cq-lg:overflow-y-auto px-6 sm:px-8 cq-lg:px-12 pb-8 cq-lg:pb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="w-full max-w-md cq-lg:max-w-lg mx-auto pt-8 cq-lg:pt-10"
                        >
                            {/* 
                              Question Section
                              RESPONSIVE TITLE: text-xl → sm:text-2xl → lg:text-3xl
                              RESPONSIVE DESC: text-sm → lg:text-base
                              Gap: space-y-3 → lg:space-y-4
                            */}
                            <div className="mb-6 cq-lg:mb-8 space-y-3 cq-lg:space-y-4">
                                <h1
                                    className={`text-xl sm:text-2xl cq-lg:text-3xl font-bold leading-tight tracking-tight transition-colors duration-500 
                                        ${lightMode ? 'text-gray-900' : 'text-white'}`}
                                    style={{ color: lightMode ? undefined : config.props.questionColor, fontFamily: theme?.headingFont }}
                                    onClick={() => handleFieldClick('props.question')}
                                    data-field="props.question"
                                >
                                    {config.props.question}
                                </h1>
                                <p
                                    className={`text-sm cq-lg:text-base leading-relaxed transition-colors duration-500 
                                        ${lightMode ? 'text-gray-600' : 'text-gray-400'}`}
                                    style={{ color: lightMode ? undefined : config.props.descriptionColor }}
                                    onClick={() => handleFieldClick('props.description')}
                                    data-field="props.description"
                                >
                                    {config.props.description}
                                </p>
                            </div>

                            {/* 
                              Guidance Section - Tips
                              RESPONSIVE HEADER: text-xs → lg:text-xs (uppercase, stays small)
                              RESPONSIVE TIPS: text-xs → lg:text-sm
                              RESPONSIVE ICONS: w-4 h-4 → lg:w-5 lg:h-5
                            */}
                            {tips.length > 0 && (
                                <div className="space-y-3 cq-lg:space-y-4">
                                    <h3 className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-500 
                                        ${lightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        Tips for great testimonials:
                                    </h3>
                                    <motion.div
                                        className="space-y-2 cq-lg:space-y-3"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                    >
                                        {tips.map((tip, index) => (
                                            <div key={index} className="flex items-start gap-2 cq-lg:gap-3 group">
                                                <div className="mt-0.5">
                                                    <CheckCircleIcon className="text-emerald-500 w-4 h-4 cq-lg:w-5 cq-lg:h-5 flex-shrink-0" />
                                                </div>
                                                <p className={`text-xs cq-lg:text-sm leading-relaxed transition-colors duration-500 
                                                    ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                                                    <span className={`font-medium transition-colors duration-500 
                                                        ${lightMode ? 'text-gray-800' : 'text-white'}`}>
                                                        {tip}
                                                    </span>
                                                </p>
                                            </div>
                                        ))}
                                    </motion.div>
                                </div>
                            )}

                            {/* Decorative Divider */}
                            <div className="mt-6 cq-lg:mt-8 flex justify-center">
                                <div className={`h-px w-16 cq-lg:w-20 bg-gradient-to-r from-transparent to-transparent transition-colors duration-500 
                                    ${lightMode ? 'via-gray-300' : 'via-gray-600'}`} />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Visual Divider between sections on mobile */}
                <div className="cq-lg:hidden w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

                {/* 
                  RIGHT PANEL: "The Answer" - Options, Text Input, or Video
                  
                  RESPONSIVE:
                  - Width animates based on mode (desktop only)
                  - Contains three possible views: options, text, video
                */}
                <motion.div
                    animate={{
                        width: isDesktop
                            ? (mode === 'options' ? '50%' : '60%')
                            : '100%'
                    }}
                    transition={panelMotionProps}
                    className={`w-full cq-lg:w-1/2 flex flex-col justify-center items-center shrink-0 relative cq-lg:overflow-hidden transition-colors duration-500 
                        min-h-[400px] cq-lg:min-h-0 py-6 cq-lg:py-0 
                        ${lightMode ? 'bg-white' : 'bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F]'}`}
                >
                    {/* Subtle background pattern (not in video mode) */}
                    {mode !== 'video' && (
                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
                    )}

                    <AnimatePresence mode="wait">
                        {/* 
                          OPTIONS MODE - Video and Text option cards
                          
                          RESPONSIVE:
                          - Option cards: p-5 lg:p-6
                          - Icon containers: w-12 h-12 lg:w-14 lg:h-14
                          - Icons: w-6 h-6 lg:w-7 lg:h-7
                          - Option title: text-base lg:text-lg
                          - Option description: text-xs lg:text-sm
                        */}
                        {mode === 'options' && (
                            <motion.div
                                key="options"
                                variants={rightPanelVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="w-full max-w-sm cq-lg:max-w-md mx-auto space-y-3 cq-lg:space-y-4 relative z-10 px-6 pb-6 cq-lg:pb-0"
                            >
                                {/* Section Header */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-center mb-3 cq-lg:mb-4"
                                >
                                    <h3 className="text-xs cq-lg:text-sm font-medium text-gray-500 uppercase tracking-wider">
                                        {enableVideo && enableText ? 'Choose how to share' : 'Share your experience'}
                                    </h3>
                                </motion.div>

                                {/* Video Option Card */}
                                {enableVideo && (() => {
                                    const primaryColor = theme?.primaryColor || '#A855F7';
                                    const textColor = getContrastColor(primaryColor);
                                    const isDarkColor = textColor === '#FFFFFF';

                                    // For dark colors, use white accents for visibility
                                    const iconColor = isDarkColor ? '#FFFFFF' : primaryColor;
                                    const borderColor = isDarkColor ? 'rgba(255,255,255,0.2)' : `${primaryColor}4D`;
                                    const bgColor = isDarkColor ? 'rgba(255,255,255,0.05)' : `${primaryColor}1A`;
                                    const hoverBorderColor = isDarkColor ? 'rgba(255,255,255,0.4)' : `${primaryColor}80`;
                                    const hoverBgColor = isDarkColor ? 'rgba(255,255,255,0.1)' : `${primaryColor}26`;
                                    const glowColor = isDarkColor ? 'rgba(255,255,255,0.15)' : `${primaryColor}33`;
                                    const iconBgColor = isDarkColor ? 'rgba(255,255,255,0.1)' : `${primaryColor}26`;
                                    const iconBorderColor = isDarkColor ? 'rgba(255,255,255,0.15)' : `${primaryColor}33`;

                                    return (
                                        <div
                                            className="group relative p-5 cq-lg:p-6 rounded-xl text-center cursor-pointer transition-all duration-300 
                                                hover:scale-[1.02] hover:shadow-2xl"
                                            style={{
                                                backgroundColor: bgColor,
                                                border: `1px solid ${borderColor}`,
                                            }}
                                            onClick={handleVideoClick}
                                            role="button"
                                            tabIndex={0}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = hoverBorderColor;
                                                e.currentTarget.style.backgroundColor = hoverBgColor;
                                                e.currentTarget.style.boxShadow = `0 25px 50px -12px ${glowColor}`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = borderColor;
                                                e.currentTarget.style.backgroundColor = bgColor;
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {/* Subtle Glow Effect */}
                                            <div
                                                className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"
                                                style={{ backgroundColor: glowColor }}
                                            />

                                            <div className="relative">
                                                <div
                                                    className="mx-auto w-12 h-12 cq-lg:w-14 cq-lg:h-14 rounded-full flex items-center justify-center mb-3 transition-colors"
                                                    style={{
                                                        backgroundColor: iconBgColor,
                                                        border: `1px solid ${iconBorderColor}`,
                                                    }}
                                                >
                                                    <VideoIcon
                                                        className="transition-colors w-6 h-6 cq-lg:w-7 cq-lg:h-7"
                                                        style={{ color: iconColor }}
                                                    />
                                                </div>
                                                <h3 className="text-base cq-lg:text-lg font-semibold text-white transition-colors">
                                                    {config.props.videoOptionTitle || 'Record a video'}
                                                </h3>
                                                <p className="mt-1.5 text-xs cq-lg:text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                                    {config.props.videoOptionDescription || '2-minute video testimonial'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* OR Divider */}
                                {enableVideo && enableText && (
                                    <div className="relative py-1">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-700" />
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-3 bg-gradient-to-r from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F] text-gray-500">OR</span>
                                        </div>
                                    </div>
                                )}

                                {/* Text Option Card */}
                                {enableText && (
                                    <div
                                        className="group relative p-5 cq-lg:p-6 bg-zinc-400/[0.03]  
                                            border border-zinc-700/50 rounded-xl text-center cursor-pointer transition-all duration-300 
                                            hover:border-zinc-500 hover:bg-zinc-400/[0.08]
                                            hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/5"
                                        onClick={handleTextClick}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        {/* Subtle Glow Effect */}
                                        <div className="absolute -inset-2 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />

                                        <div className="relative">
                                            <div className="mx-auto w-12 h-12 cq-lg:w-14 cq-lg:h-14 bg-zinc-800/80 rounded-full flex items-center justify-center mb-3 group-hover:bg-zinc-700 transition-colors border border-zinc-700 group-hover:border-zinc-500/50">
                                                <TypeIcon className="text-zinc-400 group-hover:text-zinc-100 transition-colors w-6 h-6 cq-lg:w-7 cq-lg:h-7" />
                                            </div>
                                            <h3 className="text-base cq-lg:text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                                {config.props.textOptionTitle || 'Write your story'}
                                            </h3>
                                            <p className="mt-1.5 text-xs cq-lg:text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                                {config.props.textOptionDescription || 'Text testimonial'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* 
                          TEXT MODE - Beautiful, Apple-style text testimonial input
                          
                          Features:
                          - Large, comfortable textarea with proper state
                          - Character counter
                          - Subtle focus states
                          - Premium dark aesthetic
                        */}
                        {mode === 'text' && (
                            <TextTestimonialInput
                                theme={theme}
                                onNext={cardProps.onNext}
                                rightPanelVariants={rightPanelVariants}
                                onSaveTestimonial={saveTestimonial}
                                initialText={formDataContext?.data.testimonial?.type === 'text' ? formDataContext.data.testimonial.text || '' : ''}
                            />
                        )}

                        {/* 
                          VIDEO MODE - Video recorder (desktop) or native camera (mobile)
                        */}
                        {mode === 'video' && (
                            <motion.div
                                key="video"
                                variants={rightPanelVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="w-full h-full flex flex-col"
                            >
                                {isDesktop ? (
                                    <VideoRecorder
                                        onCancel={handleVideoCancel}
                                        onComplete={handleVideoComplete}
                                        onLightModeChange={setLightMode}
                                        theme={theme}
                                        isUploading={isUploadingVideo}
                                        initialVideoUrl={getInitialVideoUrl()}
                                    />
                                ) : (
                                    <MobileVideoCapture
                                        onCancel={handleVideoCancel}
                                        onComplete={handleVideoComplete}
                                        theme={theme}
                                        isUploading={isUploadingVideo}
                                        initialVideoUrl={getInitialVideoUrl()}
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </FormCard>
    );
};

export default QuestionCard;