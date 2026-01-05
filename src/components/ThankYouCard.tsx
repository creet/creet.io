"use client";

import React, { useEffect, useState } from 'react';
import { FormCardProps } from '@/components/form-builder/FormCard';
import { FormCard } from '@/components/form-builder/FormCard';
import AppBar from '@/components/ui/app-bar';
import { ThankYouBlockConfig, RewardsConfig } from '@/types/form-config';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormDataSafe } from '@/components/public-form/FormDataContext';
import { WhatsAppIcon, XIcon, FacebookIcon, LinkedInIcon } from '@/lib/brands/icons';

// ═══════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════



const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// DECORATIVE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// Animated confetti particles
const Confetti = ({ primaryColor }: { primaryColor?: string }) => {
    const colors = ['#22c55e', '#10b981', '#14b8a6', '#06b6d4', primaryColor || '#A855F7', '#ec4899', '#f59e0b'];
    const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-sm"
                    style={{
                        left: `${particle.x}%`,
                        top: -20,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        rotate: particle.rotation,
                    }}
                    initial={{ y: -20, opacity: 1 }}
                    animate={{
                        y: '100vh',
                        opacity: [1, 1, 0],
                        rotate: particle.rotation + 720,
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        ease: 'linear',
                        repeat: Infinity,
                        repeatDelay: 1,
                    }}
                />
            ))}
        </div>
    );
};

// Animated success checkmark - Responsive sizing
const SuccessCheckmark = () => (
    <motion.div
        className="relative w-14 h-14 cq-lg:w-16 cq-lg:h-16 cq-xl:w-20 cq-xl:h-20 mx-auto mb-5 cq-lg:mb-6 cq-xl:mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
    >
        {/* Outer glow ring */}
        <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-500/20"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Main circle */}
        <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30 flex items-center justify-center">
            {/* Checkmark */}
            <motion.svg
                className="w-6 h-6 cq-lg:w-7 cq-lg:h-7 cq-xl:w-9 cq-xl:h-9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <motion.path
                    d="M20 6L9 17L4 12"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                />
            </motion.svg>
        </div>
    </motion.div>
);

// Floating hearts/stars decoration
const FloatingElements = () => {
    const elements = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        emoji: ['✨', '💚', '⭐', '🎉'][i % 4],
        x: 10 + (i * 12),
        y: 20 + Math.random() * 60,
        delay: i * 0.3,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {elements.map((el) => (
                <motion.div
                    key={el.id}
                    className="absolute text-xl cq-lg:text-2xl cq-xl:text-3xl opacity-60"
                    style={{ left: `${el.x}%`, top: `${el.y}%` }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: [0, 0.6, 0],
                        y: [20, -20, 20],
                    }}
                    transition={{
                        duration: 4,
                        delay: el.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    {el.emoji}
                </motion.div>
            ))}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ThankYouCardProps extends FormCardProps {
    config: ThankYouBlockConfig;
    onFieldFocus: (blockId: string, fieldPath: string) => void;
    rewards?: RewardsConfig;
    testimonialType?: 'video' | 'text'; // To determine reward eligibility
    // Props for conditional social sharing
    userRating?: number; // The rating the user gave (1-5)
    ratingThreshold?: number; // The threshold from form settings (lowRatingThreshold)
    testimonialText?: string; // The actual text testimonial content
    brandName?: string; // Company/brand name for social sharing
}

const ThankYouCard: React.FC<ThankYouCardProps> = ({
    config,
    onFieldFocus,
    theme,
    rewards,
    testimonialType,
    userRating,
    ratingThreshold = 3, // Default threshold
    testimonialText,
    brandName,
    ...props
}) => {
    const [showConfetti, setShowConfetti] = useState(true);
    const [copied, setCopied] = useState(false);

    // Get form data from context
    const formDataContext = useFormDataSafe();
    const contextData = formDataContext?.data;

    // Read testimonial data from context, with props as fallback
    const localTestimonialType = contextData?.testimonial?.type || testimonialType;
    const localTestimonialText = contextData?.testimonial?.text || testimonialText;
    const localRating = contextData?.rating || userRating;

    const handleFieldClick = (fieldPath: string) => {
        onFieldFocus(config.id, fieldPath);
    };

    // Determine if social panel should be shown
    // Simply check if showSocials is enabled in config
    const shouldShowSocialPanel = () => {
        return config.props.showSocials ?? false;
    };

    // Generate share message based on testimonial type
    const getShareMessage = () => {
        // Use local values (from sessionStorage) or props
        const type = localTestimonialType || testimonialType;
        const text = localTestimonialText || testimonialText;

        // Build the brand mention
        const brandMention = brandName ? `for ${brandName}` : '';

        if (type === 'text' && text) {
            // Truncate testimonial if too long for social share
            const truncatedText = text.length > 180
                ? text.substring(0, 177) + '...'
                : text;
            return `I just shared a testimonial ${brandMention}! ✨\n\n"${truncatedText}"`;
        }
        // Video testimonial
        if (type === 'video') {
            return `I just shared a video testimonial ${brandMention}! 🎥✨`;
        }
        // Default for preview mode
        return `I just shared a testimonial ${brandMention}! ✨`;
    };


    // Determine if reward should be shown based on eligibility
    const shouldShowReward = () => {
        const type = localTestimonialType || testimonialType;
        if (!rewards?.enabled) return false;
        if (rewards.eligibleTypes === 'all') return true;
        if (rewards.eligibleTypes === 'video' && type === 'video') return true;
        if (rewards.eligibleTypes === 'text' && type === 'text') return true;
        // Default to showing if testimonialType is undefined (form builder preview)
        if (!type) return true;
        return false;
    };

    const handleCopyCode = async () => {
        if (rewards?.couponCode) {
            await navigator.clipboard.writeText(rewards.couponCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Stop confetti after a few seconds for performance
    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 8000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <FormCard {...props} theme={theme}>
            {/* 
              Layout: Celebration screen with optional social sharing panel
              
              RESPONSIVE STRATEGY:
              - Form Builder (~800-1000px container): Uses base/sm styles
              - Preview/Public (full viewport): lg: breakpoints trigger for larger sizing
              
              Padding scales: px-6 → sm:px-8 → lg:px-12
            */}
            <div className="flex-grow flex overflow-hidden relative bg-black">

                {/* Confetti (only for a few seconds, when animations enabled) */}
                <AnimatePresence>
                    {showConfetti && (config.props.showAnimations ?? true) && <Confetti primaryColor={theme?.primaryColor} />}
                </AnimatePresence>

                {/* Floating decorative elements (when animations enabled) */}
                {(config.props.showAnimations ?? true) && <FloatingElements />}

                {/* 
                  Main Content Area
                  Left side when socials shown, Centered when alone
                  Structure: flex-col -> AppBar (top) + Content (flex-grow + centered)
                */}
                <div className={`flex-grow flex flex-col items-center overflow-hidden relative z-10 
                    ${shouldShowSocialPanel() ? 'lg:w-1/2' : 'w-full justify-center'}`}>

                    {/* AppBar only when socials are shown */}
                    {shouldShowSocialPanel() && (
                        <div className="w-full lg:absolute lg:top-0 lg:left-0 z-20">
                            <AppBar
                                maxWidthClass="max-w-xl cq-lg:max-w-2xl"
                                paddingXClass="px-6 sm:px-8 cq-lg:px-12"
                                logoUrl={theme?.logoUrl}
                            />
                        </div>
                    )}

                    {/* Content Container - Flex grow to take available space and center content */}
                    <div className={`w-full flex-grow flex flex-col justify-center px-6 sm:px-8 cq-lg:px-12 cq-xl:px-16 
                        ${shouldShowSocialPanel() ? 'py-6 cq-lg:py-0' : 'py-8 cq-lg:py-12'}`}>
                        <div className="mx-auto flex w-full max-w-xl cq-lg:max-w-2xl cq-xl:max-w-3xl flex-col items-center text-center">

                            {/* Success Checkmark Animation */}
                            <SuccessCheckmark />

                            {/* 
                              Title with Gradient
                              RESPONSIVE: text-xl → sm:text-2xl → lg:text-3xl
                            */}
                            <motion.h1
                                className="text-xl sm:text-2xl cq-lg:text-3xl cq-xl:text-4xl font-bold leading-tight tracking-tight bg-gradient-to-r from-white via-green-100 to-emerald-200 bg-clip-text text-transparent"
                                style={{ color: config.props.titleColor, fontFamily: theme?.headingFont }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                onClick={() => handleFieldClick('props.title')}
                                data-field="props.title"
                            >
                                {config.props.title}
                            </motion.h1>

                            {/* 
                              Description
                              RESPONSIVE: text-sm → lg:text-base
                            */}
                            <motion.p
                                className="mt-2 cq-lg:mt-3 cq-xl:mt-4 text-sm cq-lg:text-base cq-xl:text-lg text-gray-300 leading-relaxed max-w-sm cq-lg:max-w-md cq-xl:max-w-lg"
                                style={{ color: config.props.descriptionColor }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                onClick={() => handleFieldClick('props.description')}
                                data-field="props.description"
                            >
                                {config.props.description}
                            </motion.p>

                            {/* 
                              Promo Code Button - Only show if rewards enabled
                              RESPONSIVE: h-11 → lg:h-12 for the button
                            */}
                            {shouldShowReward() && rewards && (
                                <motion.div
                                    className="my-5 cq-lg:my-6 w-full max-w-xs cq-lg:max-w-sm"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <button
                                        onClick={handleCopyCode}
                                        className="group w-full h-11 cq-lg:h-12 flex items-center justify-center gap-2 
                                            rounded-xl border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm 
                                            text-sm cq-lg:text-base cq-xl:text-lg tracking-wider text-gray-300 font-mono 
                                            hover:bg-gray-800/70 transition-all duration-300"
                                        style={{
                                            '--hover-border-color': `${theme?.primaryColor || '#A855F7'}4D`
                                        } as React.CSSProperties}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = `${theme?.primaryColor || '#A855F7'}4D`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '';
                                        }}
                                    >
                                        <span style={{ color: theme?.primaryColor || '#A855F7' }} className="font-semibold">
                                            {rewards.couponCode}
                                        </span>
                                        {copied ? (
                                            <svg className="w-4 h-4 cq-lg:w-5 cq-lg:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <CopyIcon
                                                className="w-4 h-4 cq-lg:w-5 cq-lg:h-5 cq-xl:w-6 cq-xl:h-6 text-gray-500 group-hover:transition-colors"
                                                style={{ '--group-hover-color': theme?.primaryColor || '#A855F7' } as React.CSSProperties}
                                            />
                                        )}
                                    </button>
                                    <p className="text-[11px] cq-lg:text-xs cq-xl:text-sm text-gray-500 mt-1.5 cq-lg:mt-2">
                                        {rewards.description}
                                    </p>
                                    {rewards.expiryMessage && (
                                        <p className="text-[10px] cq-lg:text-[11px] text-gray-600 mt-1">
                                            {rewards.expiryMessage}
                                        </p>
                                    )}
                                </motion.div>
                            )}

                            {/* Celebration message when no socials */}
                            {!shouldShowSocialPanel() && (
                                <motion.div
                                    className="mt-2 cq-lg:mt-4 flex flex-col items-center gap-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                >
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <span className="w-10 cq-lg:w-12 h-px bg-gradient-to-r from-transparent to-gray-600" />
                                        <span className="text-xs cq-lg:text-sm cq-xl:text-base">You're awesome!</span>
                                        <span className="w-10 cq-lg:w-12 h-px bg-gradient-to-l from-transparent to-gray-600" />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 
                  Social Sharing Panel (when enabled)
                  RESPONSIVE: Full width on mobile, 50% on lg
                */}
                {shouldShowSocialPanel() && (
                    <motion.div
                        className="flex-none w-full lg:w-1/2 bg-gray-900/80 backdrop-blur-md border-l border-gray-800 overflow-hidden flex flex-col justify-center"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex w-full flex-col p-5 cq-lg:p-6 cq-xl:p-8">
                            <div className="mx-auto my-2 flex max-w-sm cq-lg:max-w-md cq-xl:max-w-lg flex-col items-center gap-4 cq-xl:gap-6 text-center">

                                {/* Share header */}
                                <div className="font-sans mb-2 flex items-center gap-3 cq-lg:gap-4 cq-xl:gap-5 text-center text-[11px] cq-lg:text-xs cq-xl:text-sm font-medium text-gray-500 w-full">
                                    <hr className="w-full border-gray-700" />
                                    <div
                                        className="flex flex-none items-center gap-2 whitespace-nowrap"
                                        onClick={() => handleFieldClick('props.showSocials')}
                                        data-field="props.showSocials"
                                    >
                                        Share Your Story
                                    </div>
                                    <hr className="w-full border-gray-700" />
                                </div>

                                {/* Testimonial Preview Card */}
                                <div className="group relative mx-auto flex w-full items-start gap-3 cq-lg:gap-4 cq-xl:gap-5 rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 cq-xl:p-6 text-left text-sm text-white shadow-lg hover:border-gray-600 transition-colors">
                                    <div className="flex flex-1 flex-wrap items-start justify-start">
                                        <div className="w-full">
                                            <p className="content whitespace-pre-line text-xs cq-lg:text-sm text-gray-300 leading-relaxed">
                                                {getShareMessage()}
                                            </p>
                                        </div>

                                        {/* Share on X Button */}
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareMessage())}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 w-full h-10 cq-lg:h-11 cq-xl:h-12 rounded-lg overflow-hidden shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 transition-shadow flex items-center justify-center gap-2 text-sm cq-xl:text-base font-semibold bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 transition-colors text-white"
                                        >
                                            <XIcon className="w-4 h-4 cq-xl:w-5 cq-xl:h-5" />
                                            Share on X
                                        </a>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="font-sans flex items-center gap-3 cq-lg:gap-4 cq-xl:gap-5 text-center text-[11px] cq-lg:text-xs cq-xl:text-sm font-medium text-gray-500 w-full">
                                    <hr className="w-full border-gray-700" />
                                    <div className="flex-none">OR</div>
                                    <hr className="w-full border-gray-700" />
                                </div>

                                {/* Share buttons */}
                                <div className="flex flex-col items-center gap-3 cq-lg:gap-4 cq-xl:gap-5 rounded-xl border border-gray-700/50 bg-gray-800/30 px-4 cq-lg:px-5 cq-xl:px-6 py-4 cq-xl:py-6 w-full">
                                    <p className="text-sm cq-xl:text-base font-medium text-gray-300">Share on other platforms</p>

                                    {/* Social icons - Responsive sizing */}
                                    <div className="flex w-full justify-center gap-2 cq-lg:gap-3 cq-xl:gap-4">
                                        <a
                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareMessage())}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 cq-lg:w-10 cq-lg:h-10 cq-xl:w-12 cq-xl:h-12 flex items-center justify-center rounded-full text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                                            aria-label="Share on X"
                                        >
                                            <XIcon className="w-4 h-4 cq-xl:w-5 cq-xl:h-5" />
                                        </a>
                                        <a
                                            href={`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(getShareMessage())}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 cq-lg:w-10 cq-lg:h-10 cq-xl:w-12 cq-xl:h-12 flex items-center justify-center rounded-full text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                                            aria-label="Share on Facebook"
                                        >
                                            <FacebookIcon className="w-4 h-4 cq-xl:w-5 cq-xl:h-5" />
                                        </a>
                                        <a
                                            href={`https://www.linkedin.com/shareArticle?mini=true&title=${encodeURIComponent('My Experience')}&summary=${encodeURIComponent(getShareMessage())}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 cq-lg:w-10 cq-lg:h-10 cq-xl:w-12 cq-xl:h-12 flex items-center justify-center rounded-full text-white bg-sky-600 hover:bg-sky-500 transition-colors"
                                            aria-label="Share on LinkedIn"
                                        >
                                            <LinkedInIcon className="w-4 h-4 cq-xl:w-5 cq-xl:h-5" />
                                        </a>
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(getShareMessage())}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 cq-lg:w-10 cq-lg:h-10 cq-xl:w-12 cq-xl:h-12 flex items-center justify-center rounded-full text-white bg-green-600 hover:bg-green-500 transition-colors"
                                            aria-label="Share on WhatsApp"
                                        >
                                            <WhatsAppIcon
                                                size={16}
                                            />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </FormCard>
    );
};

export default ThankYouCard;

