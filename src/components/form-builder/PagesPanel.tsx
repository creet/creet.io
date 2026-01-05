"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { type FormBlock, FormBlockType } from '@/types/form-config';

// Human-readable labels for page types
const PAGE_LABELS: Record<FormBlockType, string> = {
    [FormBlockType.Welcome]: 'Welcome Screen',
    [FormBlockType.Rating]: 'Rating Stars',
    [FormBlockType.NegativeFeedback]: 'Improvement Tips',
    [FormBlockType.Question]: 'Question',
    [FormBlockType.PrivateFeedback]: 'Private Note',
    [FormBlockType.Consent]: 'Permissions',
    [FormBlockType.AboutYou]: 'Your Details',
    [FormBlockType.AboutCompany]: 'Company Info',
    [FormBlockType.ReadyToSend]: 'Review & Send',
    [FormBlockType.ThankYou]: 'Thank You',
};

// Friendly descriptions for each page type
const PAGE_DESCRIPTIONS: Record<FormBlockType, string> = {
    [FormBlockType.Welcome]: 'First impression for your audience',
    [FormBlockType.Rating]: 'Quick star rating from 1-5',
    [FormBlockType.NegativeFeedback]: 'Gather constructive feedback',
    [FormBlockType.Question]: 'Collect written or video stories',
    [FormBlockType.PrivateFeedback]: 'Confidential feedback only you see',
    [FormBlockType.Consent]: 'Permission to use their words',
    [FormBlockType.AboutYou]: 'Name, photo & contact info',
    [FormBlockType.AboutCompany]: 'Title, company & logo',
    [FormBlockType.ReadyToSend]: 'Final review before submitting',
    [FormBlockType.ThankYou]: 'Celebration & next steps',
};

// Beautiful icons for each page type
const PageIcon = ({ type, active = false }: { type: FormBlockType; active?: boolean }) => {
    const iconColor = active ? 'text-white' : 'text-gray-400';

    const icons: Record<FormBlockType, React.ReactNode> = {
        [FormBlockType.Welcome]: (
            <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
                <path d="M18.36 6.64a9 9 0 0 1 1.5 5.36c-.06 3.85-3.1 7-6.9 7A7 7 0 0 1 12 5" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <path d="M9 9h.01" /><path d="M15 9h.01" />
            </svg>
        ),
        [FormBlockType.Rating]: (
            <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ),
        [FormBlockType.NegativeFeedback]: (
            <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M8 10h8" />
            </svg>
        ),
        [FormBlockType.Question]: (
            <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
        [FormBlockType.PrivateFeedback]: (
            <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        ),
        [FormBlockType.Consent]: (
            <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
            </svg>
        ),
        [FormBlockType.AboutYou]: (
            <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        [FormBlockType.AboutCompany]: (
            <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                <path d="M9 22v-4h6v4" />
                <path d="M8 6h.01" />
                <path d="M16 6h.01" />
                <path d="M12 6h.01" />
                <path d="M12 10h.01" />
                <path d="M12 14h.01" />
                <path d="M16 10h.01" />
                <path d="M16 14h.01" />
                <path d="M8 10h.01" />
                <path d="M8 14h.01" />
            </svg>
        ),
        [FormBlockType.ReadyToSend]: (
            <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
        ),
        [FormBlockType.ThankYou]: (
            <svg className={`w-5 h-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        ),
    };

    return icons[type] || null;
};

// Color schemes for each page type
const PAGE_COLORS: Record<FormBlockType, { bg: string; gradient: string; ring: string }> = {
    [FormBlockType.Welcome]: { bg: 'bg-emerald-500/20', gradient: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-500/50' },
    [FormBlockType.Rating]: { bg: 'bg-amber-500/20', gradient: 'from-amber-400 to-orange-500', ring: 'ring-amber-500/50' },
    [FormBlockType.NegativeFeedback]: { bg: 'bg-rose-500/20', gradient: 'from-rose-500 to-pink-500', ring: 'ring-rose-500/50' },
    [FormBlockType.Question]: { bg: 'bg-violet-500/20', gradient: 'from-violet-500 to-purple-500', ring: 'ring-violet-500/50' },
    [FormBlockType.PrivateFeedback]: { bg: 'bg-slate-500/20', gradient: 'from-slate-500 to-gray-500', ring: 'ring-slate-500/50' },
    [FormBlockType.Consent]: { bg: 'bg-blue-500/20', gradient: 'from-blue-500 to-indigo-500', ring: 'ring-blue-500/50' },
    [FormBlockType.AboutYou]: { bg: 'bg-cyan-500/20', gradient: 'from-cyan-500 to-sky-500', ring: 'ring-cyan-500/50' },
    [FormBlockType.AboutCompany]: { bg: 'bg-indigo-500/20', gradient: 'from-indigo-500 to-purple-500', ring: 'ring-indigo-500/50' },
    [FormBlockType.ReadyToSend]: { bg: 'bg-green-500/20', gradient: 'from-green-500 to-emerald-500', ring: 'ring-green-500/50' },
    [FormBlockType.ThankYou]: { bg: 'bg-pink-500/20', gradient: 'from-pink-500 to-rose-400', ring: 'ring-pink-500/50' },
};



// Toggle switch component
const Toggle = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
        onClick={(e) => { e.stopPropagation(); if (!disabled) onChange(); }}
        className={`relative w-10 h-5 rounded-full transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${checked ? 'bg-[#BFFF00]' : 'bg-zinc-700'}`}
        aria-label={checked ? 'Disable page' : 'Enable page'}
    >
        <motion.div
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`absolute top-0.5 w-4 h-4 rounded-full shadow-md ${checked ? 'left-5 bg-black' : 'left-0.5 bg-white'
                }`}
        />
    </button>
);

// Static page item component (for non-question pages)
interface StaticPageItemProps {
    block: FormBlock;
    enabledIndex: number;
    isActive: boolean;
    onSelect: () => void;
    onToggle: () => void;
    showToggle: boolean;
}

const StaticPageItem = ({
    block,
    enabledIndex,
    isActive,
    onSelect,
    onToggle,
    showToggle,
}: StaticPageItemProps) => {
    const colors = PAGE_COLORS[block.type];
    const label = PAGE_LABELS[block.type] || block.type;
    const description = PAGE_DESCRIPTIONS[block.type] || '';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => block.enabled && onSelect()}
            className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 ${isActive
                ? 'bg-white/[0.08] border border-white/20 shadow-sm'
                : block.enabled
                    ? 'bg-[#0F0F11] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.10]'
                    : 'bg-[#0F0F11]/50 border border-white/[0.04]'
                } ${!block.enabled ? 'opacity-50' : ''}`}
            style={isActive ? undefined : { boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
        >
            {/* Connection line to next item */}
            <div
                className="absolute left-8 -bottom-3 w-0.5 h-3 bg-gradient-to-b from-zinc-700 to-transparent pointer-events-none"
            />

            <div className="flex items-center gap-4">
                {/* Spacer to align with draggable items */}
                <div className="w-[14px]" />

                {/* Icon with number badge */}
                <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${colors.bg}`}>
                        <PageIcon type={block.type} active={false} />
                    </div>
                    <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${block.enabled
                        ? isActive
                            ? 'bg-white text-black'
                            : 'bg-zinc-700 text-zinc-300'
                        : 'bg-zinc-800 text-zinc-500'
                        }`}>
                        {block.enabled ? enabledIndex + 1 : '–'}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold truncate transition-colors text-zinc-200">
                        {label}
                    </h3>
                    <p className="text-sm truncate mt-1 transition-colors text-zinc-500">
                        {description}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Toggle - only show for optional pages */}
                    {showToggle && (
                        <Toggle
                            checked={block.enabled}
                            onChange={onToggle}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
};



// Define the fixed order of page types (Questions will be inserted in the middle)
const PRE_QUESTION_TYPES = [
    FormBlockType.Welcome,
    FormBlockType.Rating,
    FormBlockType.NegativeFeedback,
];

const POST_QUESTION_TYPES = [
    FormBlockType.PrivateFeedback,
    FormBlockType.Consent,
    FormBlockType.AboutYou,
    FormBlockType.AboutCompany,
    FormBlockType.ReadyToSend,
    FormBlockType.ThankYou,
];

// Mandatory page types (no toggle shown)
const MANDATORY_TYPES = [
    FormBlockType.Welcome,
    FormBlockType.Rating,
    FormBlockType.Question,
    FormBlockType.AboutYou,
    FormBlockType.ReadyToSend,
    FormBlockType.ThankYou,
];

// Main PagesPanel component
interface PagesPanelProps {
    blocks: FormBlock[];
    enabledBlocks: FormBlock[];
    currentPageIndex: number;
    onPageClick: (index: number) => void;
    onTogglePage: (blockId: string) => void;
}

const PagesPanel: React.FC<PagesPanelProps> = ({
    blocks,
    enabledBlocks,
    currentPageIndex,
    onPageClick,
    onTogglePage,
}) => {
    // Separate blocks into three sections
    const { preQuestionBlocks, questionBlocks, postQuestionBlocks } = useMemo(() => {
        const preQuestionBlocks: FormBlock[] = [];
        const questionBlocks: FormBlock[] = [];
        const postQuestionBlocks: FormBlock[] = [];

        blocks.forEach(block => {
            if (block.type === FormBlockType.Question) {
                questionBlocks.push(block);
            } else if (PRE_QUESTION_TYPES.includes(block.type)) {
                preQuestionBlocks.push(block);
            } else if (POST_QUESTION_TYPES.includes(block.type)) {
                postQuestionBlocks.push(block);
            }
        });

        // Sort pre-question blocks by their defined order
        preQuestionBlocks.sort((a, b) =>
            PRE_QUESTION_TYPES.indexOf(a.type) - PRE_QUESTION_TYPES.indexOf(b.type)
        );

        // Sort post-question blocks by their defined order
        postQuestionBlocks.sort((a, b) =>
            POST_QUESTION_TYPES.indexOf(a.type) - POST_QUESTION_TYPES.indexOf(b.type)
        );

        return { preQuestionBlocks, questionBlocks, postQuestionBlocks };
    }, [blocks]);



    const isToggleShown = (blockType: FormBlockType) => !MANDATORY_TYPES.includes(blockType);

    // Calculate display numbers based on visual order
    // This is the order shown in the panel: pre-question → questions → post-question
    const getDisplayNumber = useMemo(() => {
        const visualOrder = [
            ...preQuestionBlocks.filter(b => b.enabled),
            ...questionBlocks.filter(b => b.enabled),
            ...postQuestionBlocks.filter(b => b.enabled),
        ];

        const displayNumberMap = new Map<string, number>();
        visualOrder.forEach((block, index) => {
            displayNumberMap.set(block.id, index + 1);
        });

        return (blockId: string) => displayNumberMap.get(blockId) ?? 0;
    }, [preQuestionBlocks, questionBlocks, postQuestionBlocks]);

    return (
        <div className="flex flex-col h-full">
            {/* Pages List - Extra bottom padding ensures last item is fully visible */}
            <div className="flex-1 overflow-y-auto px-4 pt-5 pb-36 space-y-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {/* Pre-question static pages */}
                    {preQuestionBlocks.map((block) => {
                        const enabledIndex = enabledBlocks.findIndex(b => b.id === block.id);
                        const isActive = enabledIndex === currentPageIndex && block.enabled;
                        const displayNumber = getDisplayNumber(block.id);

                        return (
                            <StaticPageItem
                                key={block.id}
                                block={block}
                                enabledIndex={displayNumber - 1}
                                isActive={isActive}
                                onSelect={() => onPageClick(enabledIndex)}
                                onToggle={() => onTogglePage(block.id)}
                                showToggle={isToggleShown(block.type)}
                            />
                        );
                    })}

                    {/* Question pages - Now rendered as static items (single question only) */}
                    {questionBlocks.map((block) => {
                        const enabledIndex = enabledBlocks.findIndex(b => b.id === block.id);
                        const isActive = enabledIndex === currentPageIndex && block.enabled;
                        const displayNumber = getDisplayNumber(block.id);

                        return (
                            <StaticPageItem
                                key={block.id}
                                block={block}
                                enabledIndex={displayNumber - 1}
                                isActive={isActive}
                                onSelect={() => onPageClick(enabledIndex)}
                                onToggle={() => onTogglePage(block.id)}
                                showToggle={isToggleShown(block.type)}
                            />
                        );
                    })}

                    {/* Post-question static pages */}
                    {postQuestionBlocks.map((block) => {
                        const enabledIndex = enabledBlocks.findIndex(b => b.id === block.id);
                        const isActive = enabledIndex === currentPageIndex && block.enabled;
                        const displayNumber = getDisplayNumber(block.id);

                        return (
                            <StaticPageItem
                                key={block.id}
                                block={block}
                                enabledIndex={displayNumber - 1}
                                isActive={isActive}
                                onSelect={() => onPageClick(enabledIndex)}
                                onToggle={() => onTogglePage(block.id)}
                                showToggle={isToggleShown(block.type)}
                            />
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PagesPanel;
