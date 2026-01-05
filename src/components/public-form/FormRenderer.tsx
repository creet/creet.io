"use client";

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormConfig, FormBlock, FormBlockType, FormTheme } from '@/types/form-config';
import { FormDataProvider, useFormData } from './FormDataContext';

// Import all card components
import WelcomeCard from '@/components/WelcomeCard';
import RatingCard from '@/components/RatingCard';
import QuestionCard from '@/components/QuestionCard';
import NegativeFeedbackCard from '@/components/NegativeFeedbackCard';
import PrivateFeedbackCard from '@/components/PrivateFeedbackCard';
import ConsentCard from '@/components/ConsentCard';
import AboutYouCard from '@/components/AboutYouCard';
import AboutCompanyCard from '@/components/AboutCompanyCard';
import ReadyToSendCard from '@/components/ReadyToSendCard';
import ThankYouCard from '@/components/ThankYouCard';

// Form context for submission
export interface FormContext {
    formId: string;
    projectId: string;
}

// Submission handler type
export type SubmitTestimonialHandler = (data: SubmissionData) => Promise<{ success: boolean; error?: string }>;

// Data passed to submission handler
export interface SubmissionData {
    type: 'text' | 'video';
    rating?: number;
    testimonialText?: string;
    videoUrl?: string;
    customerName?: string;
    customerEmail?: string;
    customerTitle?: string;
    customerAvatarUrl?: string;
    companyName?: string;
    companyWebsite?: string;
    companyLogoUrl?: string;
    consentPublic?: boolean;
    consentNameAndPhoto?: boolean;
}

interface FormRendererProps {
    formConfig: FormConfig;
    formContext?: FormContext;  // Required for actual submission (public form)
    onSubmitTestimonial?: SubmitTestimonialHandler;  // Handler for form submission
    onComplete?: (responses: FormResponses) => void;
    isPreview?: boolean; // True in form builder preview, false in public form
}

// Type for collecting user responses
export interface FormResponses {
    rating?: number;
    testimonialType?: 'text' | 'video';
    testimonialText?: string;
    testimonialVideo?: Blob;
    privateFeedback?: string;
    userInfo?: {
        name?: string;
        email?: string;
        title?: string;
        company?: string;
        avatar?: string;
    };
    consent?: {
        useTestimonial: boolean;
        useNameAndPhoto: boolean;
    };
}

// Inner component that uses the context
const FormRendererInner: React.FC<FormRendererProps> = ({
    formConfig,
    formContext,
    onSubmitTestimonial,
    onComplete,
    isPreview = false,
}) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [responses, setResponses] = useState<FormResponses>({});

    // Get form data from context
    const { data: formData } = useFormData();

    // Smart block filtering based on rating path
    const enabledBlocks = formConfig.blocks.filter(b => {
        if (!b.enabled) return false;

        // Only filter when user has made a rating decision
        if (formData.rating !== null) {
            if (formData.shouldShowImprovementTips) {
                // Low Rating Path: Hide positive flow blocks
                const positiveFlowBlocks = [
                    FormBlockType.Question,
                    FormBlockType.Consent,
                    FormBlockType.AboutYou,
                    FormBlockType.AboutCompany,
                    FormBlockType.ReadyToSend
                ];
                return !positiveFlowBlocks.includes(b.type);
            } else {
                // High Rating Path: Hide NegativeFeedback
                return b.type !== FormBlockType.NegativeFeedback;
            }
        }

        // Before rating is selected, show all blocks (for preview navigation)
        return true;
    });

    // Keep a ref to the latest enabledBlocks for use in callbacks
    const enabledBlocksRef = useRef(enabledBlocks);
    enabledBlocksRef.current = enabledBlocks;

    const totalPages = enabledBlocks.length;
    // Clamp index to prevent out of bounds if list shrinks
    const safeIndex = Math.min(currentPageIndex, Math.max(0, totalPages - 1));
    const currentBlock = enabledBlocks[safeIndex];

    // Navigation handlers - use refs to always get latest values (avoid stale closures)
    const handleNext = useCallback(() => {
        const blocks = enabledBlocksRef.current;
        const total = blocks.length;
        setCurrentPageIndex(prev => {
            if (prev < total - 1) {
                return prev + 1;
            } else {
                // Form completed - stay on last page
                onComplete?.(responses);
                return prev;
            }
        });
    }, [onComplete, responses]);

    const handlePrevious = useCallback(() => {
        setCurrentPageIndex(prev => Math.max(prev - 1, 0));
    }, []);

    // No-op field focus handler (only used in editor)
    const handleFieldFocus = useCallback(() => { }, []);

    // Update responses (will be connected to individual card callbacks)
    const updateResponses = useCallback((update: Partial<FormResponses>) => {
        setResponses(prev => ({ ...prev, ...update }));
    }, []);

    // Navigate to a specific block type (used for conditional navigation like rating-based routing)
    // Uses ref to always get the latest enabledBlocks (avoids stale closure bug)
    const handleNavigateToBlockType = useCallback((blockType: FormBlockType) => {
        const blocks = enabledBlocksRef.current;
        const targetIndex = blocks.findIndex(b => b.type === blockType);
        if (targetIndex !== -1) {
            setCurrentPageIndex(targetIndex);
        } else {
            // If target block type not found (disabled), fall back to next index
            setCurrentPageIndex(prev => prev + 1);
        }
    }, []);

    if (!currentBlock) {
        return null;
    }

    // Common props for all cards
    const cardProps = {
        config: currentBlock,
        currentPage: safeIndex + 1,
        totalPages,
        onNext: handleNext,
        onPrevious: handlePrevious,
        onFieldFocus: handleFieldFocus,
        theme: formConfig.theme,
        isPreview: true, // Always true to get full-screen layout
    };

    // Render the appropriate card based on block type
    const renderCard = () => {
        switch (currentBlock.type) {
            case FormBlockType.Welcome:
                return <WelcomeCard key={currentBlock.id} {...cardProps} config={currentBlock as any} />;
            case FormBlockType.Rating:
                return (
                    <RatingCard
                        key={currentBlock.id}
                        {...cardProps}
                        config={currentBlock as any}
                        formSettings={formConfig.settings}
                        onNavigateToBlockType={handleNavigateToBlockType}
                    />
                );
            case FormBlockType.Question:
                return (
                    <QuestionCard
                        key={currentBlock.id}
                        {...cardProps}
                        config={currentBlock as any}
                        formContext={formContext}
                    />
                );
            case FormBlockType.NegativeFeedback:
                return (
                    <NegativeFeedbackCard
                        key={currentBlock.id}
                        {...cardProps}
                        config={currentBlock as any}
                        formContext={formContext}
                        onSubmitTestimonial={onSubmitTestimonial}
                    />
                );
            case FormBlockType.PrivateFeedback:
                return <PrivateFeedbackCard key={currentBlock.id} {...cardProps} config={currentBlock as any} />;
            case FormBlockType.Consent:
                return <ConsentCard key={currentBlock.id} {...cardProps} config={currentBlock as any} />;
            case FormBlockType.AboutYou:
                return <AboutYouCard key={currentBlock.id} {...cardProps} config={currentBlock as any} />;
            case FormBlockType.AboutCompany:
                return <AboutCompanyCard key={currentBlock.id} {...cardProps} config={currentBlock as any} />;
            case FormBlockType.ReadyToSend:
                return (
                    <ReadyToSendCard
                        key={currentBlock.id}
                        {...cardProps}
                        config={currentBlock as any}
                        formContext={formContext}
                        onSubmitTestimonial={onSubmitTestimonial}
                    />
                );
            case FormBlockType.ThankYou:
                return (
                    <ThankYouCard
                        key={currentBlock.id}
                        {...cardProps}
                        config={currentBlock as any}
                        rewards={formConfig.rewards}
                        brandName={formConfig.brandName}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div
            className="w-full h-full"
            style={{ backgroundColor: formConfig.theme.backgroundColor }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentBlock.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="w-full h-full"
                >
                    {renderCard()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// Wrapper component that provides the context
const FormRenderer: React.FC<FormRendererProps> = (props) => {
    return (
        <FormDataProvider>
            <FormRendererInner {...props} />
        </FormDataProvider>
    );
};

export default FormRenderer;
