import React, { useState, useEffect } from 'react';
import { FormCard, FormCardProps } from '@/components/form-builder/FormCard';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import AppBar from '@/components/ui/app-bar';
import { NegativeFeedbackBlockConfig } from '@/types/form-config';
import { getPrimaryButtonStyles } from '@/lib/design-tokens';
import { FormContext, SubmitTestimonialHandler, SubmissionData } from '@/components/public-form/FormRenderer';
import { useFormDataSafe } from '@/components/public-form/FormDataContext';

// ═══════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════



const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const PenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
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
// DEFAULT TIPS FOR CONSTRUCTIVE FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_FEEDBACK_TIPS = [
    'Be specific about the issue you faced',
    'Describe what you expected to happen',
    'Let us know how we can improve',
];

// ═══════════════════════════════════════════════════════════════════════════
// FEEDBACK TEXT INPUT - Premium Apple/Figma-style text input
// ═══════════════════════════════════════════════════════════════════════════

interface FeedbackTextInputProps {
    config: NegativeFeedbackBlockConfig;
    onSubmit: (feedbackText: string) => Promise<void>;
    isSubmitting: boolean;
    rightPanelVariants: Variants;
    onFieldFocus: (fieldPath: string) => void;
    theme?: { primaryColor?: string };
}

const FeedbackTextInput = ({ config, onSubmit, isSubmitting, rightPanelVariants, onFieldFocus, theme }: FeedbackTextInputProps) => {
    const [feedbackText, setFeedbackText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const characterCount = feedbackText.length;
    const hasContent = characterCount > 0;
    const canSubmit = hasContent && !isSubmitting;

    return (
        <motion.div
            key="feedback"
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
                        <span
                            className="text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-400 transition-colors"
                            onClick={() => onFieldFocus('props.feedbackQuestion')}
                            data-field="props.feedbackQuestion"
                        >
                            {config.props.feedbackQuestion || 'Your feedback'}
                        </span>
                    </div>
                    <div
                        className={`relative flex-1 min-h-[240px] cq-lg:min-h-[320px] rounded-2xl cq-lg:rounded-3xl transition-all duration-500 
                            ${isFocused
                                ? 'ring-2 bg-zinc-900/90 shadow-2xl'
                                : 'bg-zinc-900/40 hover:bg-zinc-900/60'
                            } 
                            border ${isFocused ? '' : 'border-zinc-800/50 hover:border-zinc-700/50'}`}
                        style={isFocused ? {
                            '--tw-ring-color': `${theme?.primaryColor || '#A855F7'}66`,
                            borderColor: `${theme?.primaryColor || '#A855F7'}33`,
                            boxShadow: `0 25px 50px -12px ${theme?.primaryColor || '#A855F7'}0D`
                        } as React.CSSProperties : undefined}
                    >
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={config.props.feedbackPlaceholder || 'Please share as much detail as possible...'}
                            className="w-full h-full min-h-[240px] cq-lg:min-h-[320px] bg-transparent p-6 cq-lg:p-8 
                                text-base cq-lg:text-lg text-white placeholder-zinc-600 
                                focus:outline-none resize-none leading-relaxed tracking-wide"
                            style={{ caretColor: theme?.primaryColor || '#A855F7' }}
                            onClick={() => onFieldFocus('props.feedbackPlaceholder')}
                            data-field="props.feedbackPlaceholder"
                        />

                        {/* Subtle corner decoration */}
                        <div className="absolute bottom-4 right-4 pointer-events-none opacity-30">
                            <PenIcon className="w-5 h-5 cq-lg:w-6 cq-lg:h-6 text-zinc-600" />
                        </div>
                    </div>

                    {/* Footer - Clean and minimal */}
                    <div className="mt-6 cq-lg:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Helper text and character count */}
                        <div className="order-2 sm:order-1 text-center sm:text-left">
                            <p
                                className="text-xs text-zinc-500 mb-1 cursor-pointer hover:text-zinc-400 transition-colors"
                                onClick={() => onFieldFocus('props.feedbackHelperText')}
                                data-field="props.feedbackHelperText"
                            >
                                {config.props.feedbackHelperText || 'We value your feedback and review every submission carefully.'}
                            </p>
                            <span className={`text-xs font-mono transition-all duration-300 ${hasContent ? 'text-zinc-400' : 'text-zinc-700'}`}>
                                {characterCount.toLocaleString()} characters
                            </span>
                        </div>

                        {/* Submit Button - Always enabled, elegant */}
                        <button
                            onClick={() => onSubmit(feedbackText)}
                            disabled={!canSubmit}
                            className={`order-1 sm:order-2 w-full sm:min-w-[180px] px-8 h-12 cq-lg:h-14 rounded-xl font-semibold text-sm cq-lg:text-base 
                                whitespace-nowrap transition-all duration-300 
                                ${canSubmit
                                    ? 'shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                                    : 'bg-zinc-800/80 text-zinc-500 cursor-not-allowed'
                                }`}
                            style={canSubmit ? getPrimaryButtonStyles(theme?.primaryColor) : undefined}
                            data-field="props.buttonText"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </span>
                            ) : (
                                config.props.buttonText || 'Submit Feedback'
                            )}
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

interface NegativeFeedbackCardProps extends FormCardProps {
    config: NegativeFeedbackBlockConfig;
    onFieldFocus: (blockId: string, fieldPath: string) => void;
    formContext?: FormContext;
    onSubmitTestimonial?: SubmitTestimonialHandler;
}

const NegativeFeedbackCard: React.FC<NegativeFeedbackCardProps> = ({ config, onFieldFocus, theme, formContext, onSubmitTestimonial, ...props }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Get form data context (safe version returns null if not in provider)
    const formDataContext = useFormDataSafe();

    // Handle feedback submission
    const handleSubmit = async (feedbackText: string) => {
        // If no submission handler, just navigate (preview mode)
        if (!onSubmitTestimonial || !formContext) {
            props.onNext();
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Get rating from context (fallback to 1 for low rating path)
            const rating = formDataContext?.data.rating ?? 1;

            // Build submission data - marked as private feedback
            const submissionData: SubmissionData = {
                type: 'text',
                rating: rating,
                testimonialText: feedbackText,
                consentPublic: false, // Private feedback, not for public display
                consentNameAndPhoto: false,
            };

            // Call the submission handler
            const result = await onSubmitTestimonial(submissionData);

            if (result.success) {
                // Reset context data
                formDataContext?.reset();
                props.onNext(); // Navigate to Thank You page
            } else {
                setSubmitError(result.error || 'Failed to submit feedback');
            }
        } catch (error: any) {
            console.error('[NegativeFeedbackCard] Submission error:', error);
            setSubmitError(error.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const tips = config.props.tips || DEFAULT_FEEDBACK_TIPS;

    const handleFieldClick = (fieldPath: string) => {
        onFieldFocus(config.id, fieldPath);
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

    return (
        <FormCard {...props} theme={theme}>
            {/* 
              SPLIT LAYOUT STRUCTURE (Same as QuestionCard):
              - Mobile: Stacked (full width each)
              - Desktop: Side-by-side (40% / 60%)
            */}
            <div className="flex-grow flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative custom-scrollbar">

                {/* 
                  LEFT PANEL: "The Empathy" - Title, Description, Tips
                  
                  RESPONSIVE:
                  - Padding: px-6 sm:px-8 lg:px-12
                  - Width: 100% mobile → 40% desktop
                */}
                <motion.div
                    animate={{
                        width: isDesktop ? '40%' : '100%'
                    }}
                    transition={panelMotionProps}
                    className="w-full cq-lg:w-2/5 flex flex-col shrink-0 cq-lg:overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#242424] to-[#1A1A1A]"
                >
                    {/* App Bar with Logo and Back Button */}
                    <div className="flex-shrink-0">
                        <AppBar
                            maxWidthClass="max-w-md cq-lg:max-w-lg"
                            paddingXClass="px-6 sm:px-8 cq-lg:px-12"
                            logoUrl={theme?.logoUrl}
                            showBackButton={!!props.onPrevious}
                            onBack={props.onPrevious || undefined}
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
                              Title & Description Section
                              RESPONSIVE TITLE: text-xl → sm:text-2xl → lg:text-3xl
                              RESPONSIVE DESC: text-sm → lg:text-base
                              Gap: space-y-3 → lg:space-y-4
                            */}
                            <div className="mb-6 cq-lg:mb-8 space-y-3 cq-lg:space-y-4">
                                <h1
                                    className="text-xl sm:text-2xl cq-lg:text-3xl font-bold text-white leading-tight tracking-tight"
                                    style={{ color: config.props.titleColor, fontFamily: theme?.headingFont }}
                                    onClick={() => handleFieldClick('props.title')}
                                    data-field="props.title"
                                >
                                    {config.props.title}
                                </h1>
                                <p
                                    className="text-sm cq-lg:text-base text-gray-400 leading-relaxed"
                                    style={{ color: config.props.descriptionColor }}
                                    onClick={() => handleFieldClick('props.description')}
                                    data-field="props.description"
                                >
                                    {config.props.description}
                                </p>
                            </div>

                            {/* 
                              Guidance Section - Tips for constructive feedback
                              RESPONSIVE HEADER: text-xs (uppercase, stays small)
                              RESPONSIVE TIPS: text-xs → lg:text-sm
                              RESPONSIVE ICONS: w-4 h-4 → lg:w-5 lg:h-5
                            */}
                            {tips.length > 0 && (
                                <div className="space-y-3 cq-lg:space-y-4">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Help us understand:
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
                                                    <CheckCircleIcon className="text-amber-500 w-4 h-4 cq-lg:w-5 cq-lg:h-5 flex-shrink-0" />
                                                </div>
                                                <p className="text-xs cq-lg:text-sm leading-relaxed text-gray-300">
                                                    <span className="font-medium text-white">
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
                                <div className="h-px w-16 cq-lg:w-20 bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Visual Divider between sections on mobile */}
                <div className="cq-lg:hidden w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

                {/* 
                  RIGHT PANEL: "The Feedback" - Text input area
                  
                  RESPONSIVE:
                  - Width: 100% mobile → 60% desktop
                  - Contains the feedback text input (similar to QuestionCard's text testimonial input)
                */}
                <motion.div
                    animate={{
                        width: isDesktop ? '60%' : '100%'
                    }}
                    transition={panelMotionProps}
                    className="w-full cq-lg:w-3/5 flex flex-col justify-center items-center shrink-0 relative cq-lg:overflow-hidden 
                        min-h-[400px] cq-lg:min-h-0 py-6 cq-lg:py-0 
                        bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F]"
                >
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:32px_32px]" />

                    <AnimatePresence mode="wait">
                        <FeedbackTextInput
                            config={config}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            rightPanelVariants={rightPanelVariants}
                            onFieldFocus={handleFieldClick}
                            theme={theme}
                        />
                    </AnimatePresence>
                </motion.div>
            </div>
        </FormCard>
    );
};

export default NegativeFeedbackCard;
