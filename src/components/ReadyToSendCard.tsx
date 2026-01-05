"use client";

import React, { useState } from 'react';
import { FormCardProps, FormCard } from '@/components/form-builder/FormCard';
import AppBar from '@/components/ui/app-bar';
import BackButton from '@/components/ui/back-button';
import { ReadyToSendBlockConfig } from '@/types/form-config';
import { motion, AnimatePresence } from 'framer-motion';
import { FormContext, SubmitTestimonialHandler, SubmissionData } from '@/components/public-form/FormRenderer';
import { getPrimaryButtonStyles } from '@/lib/design-tokens';
import { useFormDataSafe } from '@/components/public-form/FormDataContext';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

interface ReadyToSendCardProps extends FormCardProps {
    config: ReadyToSendBlockConfig;
    onFieldFocus: (blockId: string, fieldPath: string) => void;
    formContext?: FormContext;
    onSubmitTestimonial?: SubmitTestimonialHandler;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// Navigation arrow buttons - Responsive sizing
const ArrowButton = ({ direction, onClick, disabled, primaryColor }: { direction: 'left' | 'right'; onClick: () => void; disabled?: boolean; primaryColor?: string }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 cq-lg:p-2.5 cq-xl:p-3 rounded-full border transition-all duration-200 
            ${disabled
                ? 'border-gray-800 bg-gray-900/30 text-gray-700 cursor-not-allowed'
                : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:text-white'
            }`}
        style={!disabled ? {
            '--hover-border-color': `${primaryColor || '#A855F7'}80`,
            '--hover-bg-color': `${primaryColor || '#A855F7'}1A`,
        } as React.CSSProperties : undefined}
        onMouseEnter={(e) => {
            if (!disabled) {
                e.currentTarget.style.borderColor = `${primaryColor || '#A855F7'}80`;
                e.currentTarget.style.backgroundColor = `${primaryColor || '#A855F7'}1A`;
            }
        }}
        onMouseLeave={(e) => {
            if (!disabled) {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.backgroundColor = '';
            }
        }}
        aria-label={direction === 'left' ? 'Previous testimonial' : 'Next testimonial'}
    >
        <svg className="w-5 h-5 cq-lg:w-6 cq-lg:h-6 cq-xl:w-7 cq-xl:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {direction === 'left' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            )}
        </svg>
    </button>
);

// Decorative sparkle elements
const FloatingSparkles = ({ primaryColor }: { primaryColor?: string }) => {
    const sparkles = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: 15 + (i * 14),
        y: 15 + Math.random() * 70,
        delay: i * 0.4,
        size: 12 + Math.random() * 8,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {sparkles.map((sparkle) => (
                <motion.div
                    key={sparkle.id}
                    className="absolute"
                    style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 0.4, 0],
                        scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 3,
                        delay: sparkle.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <svg width={sparkle.size} height={sparkle.size} viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2L13.09 8.26L19 7L14.74 11.5L19 16L13.09 15.26L12 22L10.91 15.26L5 16L9.26 11.5L5 7L10.91 8.26L12 2Z"
                            fill={primaryColor || '#A855F7'}
                            fillOpacity="0.6"
                        />
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};

// Star rating display - Responsive sizing
const StarRating = ({ rating = 5, ratingColor }: { rating?: number; ratingColor?: string }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
            <motion.svg
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`w-3.5 h-3.5 cq-lg:w-4 cq-lg:h-4 cq-xl:w-5 cq-xl:h-5 ${i >= rating ? 'text-gray-600' : ''}`}
                style={i < rating ? { color: ratingColor || '#FBBF24' } : undefined}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </motion.svg>
        ))}
    </div>
);

// Single testimonial preview card - Responsive sizing
// Single testimonial preview card - Responsive sizing
const TestimonialPreviewCard = ({
    type = 'text',
    text = '',
    videoUrl = '',
    rating = 5,
    primaryColor,
    ratingColor
}: {
    type?: 'text' | 'video';
    text?: string;
    videoUrl?: string;
    rating?: number;
    primaryColor?: string;
    ratingColor?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm cq-lg:max-w-lg cq-xl:max-w-xl mx-auto h-auto min-h-[11rem] cq-lg:min-h-[14rem]"
    >
        <div className={`relative w-full h-full overflow-hidden rounded-xl cq-lg:rounded-2xl cq-xl:rounded-3xl shadow-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group 
            ${type === 'video' ? 'bg-gray-900 aspect-video' : 'bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-black/80 backdrop-blur-md'}`}>

            {/* Content */}
            {type === 'video' ? (
                // Video Mode: Full bleed background
                <div className="absolute inset-0 w-full h-full group">
                    {/* Video Player (Using Cloudflare Stream iframe) */}
                    {videoUrl ? (
                        <iframe
                            src={videoUrl.includes('/') ? videoUrl : `https://iframe.videodelivery.net/${videoUrl}?autoplay=false`}
                            className="w-full h-full"
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-500 text-sm">
                            Video preview unavailable
                        </div>
                    )}

                    {/* Stars Overlay - Top Right */}
                    <div className="absolute top-3 right-3 cq-lg:top-4 cq-lg:right-4 cq-xl:top-5 cq-xl:right-5 bg-black/40 backdrop-blur-sm px-2 py-1 cq-xl:px-3 cq-xl:py-1.5 rounded-full border border-white/10 z-10 pointer-events-none">
                        <StarRating rating={rating} ratingColor={ratingColor} />
                    </div>

                    {/* Video Badge - Top Left */}
                    <div className="absolute top-3 left-3 cq-lg:top-4 cq-lg:left-4 cq-xl:top-5 cq-xl:left-5 flex items-center gap-1.5 px-2 py-1 cq-xl:px-3 cq-xl:py-1.5 bg-black/40 backdrop-blur-sm rounded-full border border-white/10 text-[10px] cq-lg:text-xs cq-xl:text-sm text-white/90 font-medium z-10 pointer-events-none">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="m22 8-6 4 6 4V8Z" />
                            <rect x="2" y="6" width="14" height="12" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <span>Video</span>
                    </div>
                </div>
            ) : (
                // Text Mode: Padded content
                <div className="relative p-5 cq-lg:p-6 cq-xl:p-8 h-full flex flex-col">
                    {/* Decorative glow */}
                    <div
                        className="absolute -inset-0.5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl pointer-events-none"
                        style={{ background: `linear-gradient(to bottom right, ${primaryColor || '#A855F7'}0D, ${primaryColor || '#A855F7'}0D)` }}
                    />

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col h-full justify-between"
                    >
                        <div className="relative">
                            {/* Decorative Quote Mark */}
                            <div
                                className="absolute -top-1 -left-1 text-4xl cq-lg:text-5xl cq-xl:text-6xl font-serif leading-none select-none pointer-events-none"
                                style={{ color: `${primaryColor || '#A855F7'}1A` }}
                            >"</div>

                            <p className="text-gray-200 leading-relaxed relative z-10 italic text-sm cq-lg:text-[15px] cq-xl:text-base pt-2 pl-2">
                                "{text || "No testimonial text provided."}"
                            </p>
                        </div>

                        <div className="flex justify-end items-center pt-3 cq-lg:pt-4">
                            <StarRating rating={rating} ratingColor={ratingColor} />
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ReadyToSendCard: React.FC<ReadyToSendCardProps> = ({ config, onFieldFocus, theme, formContext, onSubmitTestimonial, ...props }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Get form data from context
    const formDataContext = useFormDataSafe();
    const contextData = formDataContext?.data;

    // Use context data directly
    const testimonialData = contextData?.testimonial;
    const rating = contextData?.rating ?? 5;

    const handleFieldClick = (fieldPath: string) => {
        onFieldFocus(config.id, fieldPath);
    };

    // Handle form submission
    const handleSubmit = async () => {
        // If no submission handler, just navigate (preview mode)
        if (!onSubmitTestimonial || !formContext) {
            // Reset context data in preview mode
            formDataContext?.reset();
            props.onNext();
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Get all data from context
            const aboutYouData = contextData?.aboutYou;
            const aboutCompanyData = contextData?.aboutCompany;
            const consentData = contextData?.consent;

            // Build submission data
            const submissionData: SubmissionData = {
                type: testimonialData?.type || 'text',
                rating: rating,
                testimonialText: testimonialData?.type === 'text' ? testimonialData.text : undefined,
                videoUrl: testimonialData?.type === 'video' ? testimonialData.videoUrl : undefined,
                customerName: aboutYouData?.name,
                customerEmail: aboutYouData?.email,
                customerAvatarUrl: aboutYouData?.avatarUrl || undefined,
                customerTitle: aboutCompanyData?.jobTitle,
                companyName: aboutCompanyData?.companyName,
                companyWebsite: aboutCompanyData?.companyWebsite,
                companyLogoUrl: aboutCompanyData?.companyLogoUrl,
                consentPublic: consentData?.consentPublic ?? true,
                consentNameAndPhoto: consentData?.consentNameAndPhoto ?? true,
            };

            // Call the submission handler
            const result = await onSubmitTestimonial(submissionData);

            if (result.success) {
                // Note: We keep testimonial data for ThankYouCard sharing feature
                // The context will be fully reset when the form component unmounts
                props.onNext();
            } else {
                setSubmitError(result.error || 'Failed to submit testimonial');
            }
        } catch (error: any) {
            console.error('[ReadyToSendCard] Submission error:', error);
            setSubmitError(error.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormCard {...props} theme={theme}>
            {/* 
              Layout: Centered content with decorative elements
              
              RESPONSIVE STRATEGY:
              - Form Builder (~800-1000px container): Uses base/sm styles
              - Preview/Public (full viewport): lg: breakpoints trigger for larger sizing
              
              Padding scales: px-6 → sm:px-8 → lg:px-12
            */}
            <div className="flex-grow flex flex-col overflow-hidden relative">

                {/* Back Button */}
                {props.onPrevious && <BackButton onClick={props.onPrevious} />}

                {/* Floating decorative elements */}
                <FloatingSparkles primaryColor={theme?.primaryColor} />

                {/* 
                  AppBar with Logo
                  RESPONSIVE PADDING: px-6 → sm:px-8 → lg:px-12
                */}
                <div className="flex-shrink-0">
                    <AppBar
                        maxWidthClass="max-w-xl cq-lg:max-w-2xl"
                        paddingXClass="px-6 sm:px-8 cq-lg:px-12"
                        logoUrl={theme?.logoUrl}
                    />
                </div>

                {/* Main scrollable content - Vertically centered */}
                <div className="flex-1 flex flex-col justify-center overflow-y-auto px-6 sm:px-8 cq-lg:px-12 cq-xl:px-16 py-6 cq-lg:py-8 relative z-10 scrollbar-hide">
                    <div className="w-full max-w-lg cq-lg:max-w-2xl cq-xl:max-w-3xl mx-auto flex flex-col items-center text-center space-y-5 cq-lg:space-y-6 cq-xl:space-y-8">

                        {/* 
                          Header Section
                          RESPONSIVE TITLE: text-xl → sm:text-2xl → cq-lg:text-3xl
                          RESPONSIVE DESC: text-sm → cq-lg:text-base
                        */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-2 cq-lg:space-y-3"
                        >
                            <h1
                                className="text-xl sm:text-2xl cq-lg:text-3xl cq-xl:text-4xl font-bold leading-tight tracking-tight bg-gradient-to-r from-white via-emerald-100 to-green-200 bg-clip-text text-transparent"
                                style={{ color: config.props.titleColor, fontFamily: theme?.headingFont }}
                                onClick={() => handleFieldClick('props.title')}
                                data-field="props.title"
                            >
                                {config.props.title}
                            </h1>
                            <p
                                className="text-sm cq-lg:text-base cq-xl:text-lg text-gray-400 max-w-sm cq-lg:max-w-md cq-xl:max-w-lg mx-auto leading-relaxed"
                                style={{ color: config.props.descriptionColor }}
                                onClick={() => handleFieldClick('props.description')}
                                data-field="props.description"
                            >
                                {config.props.description}
                            </p>
                        </motion.div>

                        {/* Testimonial Preview */}
                        <div className="w-full relative px-2 sm:px-4">
                            <TestimonialPreviewCard
                                type={testimonialData?.type}
                                text={testimonialData?.text}
                                videoUrl={testimonialData?.videoUrl}
                                rating={rating}
                                primaryColor={theme?.primaryColor}
                                ratingColor={theme?.ratingColor}
                            />
                        </div>

                        {/* 
                          Submit Button
                          STANDARD HEIGHT: h-11 → lg:h-12
                          Using decorative gradient border style for this celebratory card
                        */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="w-full max-w-sm cq-lg:max-w-md cq-xl:max-w-lg"
                        >
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`group relative w-full h-11 cq-lg:h-12 cq-xl:h-14 overflow-hidden rounded-xl 
                                    shadow-lg transition-all duration-300 active:scale-[0.98]
                                    ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                style={getPrimaryButtonStyles(theme?.primaryColor)}
                                data-field="props.buttonText"
                            >
                                {/* Button content */}
                                <div className="flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4 cq-lg:w-5 cq-lg:h-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-sm cq-lg:text-base cq-xl:text-lg font-semibold text-current">Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm cq-lg:text-base cq-xl:text-lg font-semibold text-current">
                                                {config.props.buttonText}
                                            </span>
                                            <svg
                                                className="w-4 h-4 cq-lg:w-5 cq-lg:h-5 group-hover:translate-x-1 transition-transform"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </div>
                            </button>
                        </motion.div>

                        {/* Trust message - Responsive sizing */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex items-center justify-center gap-1.5 cq-lg:gap-2 text-[11px] cq-lg:text-xs cq-xl:text-sm text-gray-500 pb-4"
                        >
                            <svg
                                className="w-3.5 h-3.5 cq-lg:w-4 cq-lg:h-4 cq-xl:w-5 cq-xl:h-5 flex-shrink-0 text-emerald-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>You control what's shared publicly</span>
                        </motion.div>
                    </div>
                </div>
            </div>
        </FormCard>
    );
};

export default ReadyToSendCard;

