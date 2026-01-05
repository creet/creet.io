"use client";

import React from 'react';

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

import { type FormBlock, FormBlockType, type FormTheme, type FormSettings } from '@/types/form-config';
import { useFontLoader } from '@/lib/fonts';

export interface FormCardProps {
    config: FormBlock;
    currentPage: number;
    totalPages: number;
    onNext: () => void;
    onPrevious: () => void;
    onFieldFocus: (blockId: string, fieldPath: string) => void;
    theme: FormTheme;
    isPreview?: boolean;
    formSettings?: FormSettings;
    onNavigateToBlockType?: (blockType: FormBlockType) => void;
}

export const FormCard: React.FC<React.PropsWithChildren<Omit<FormCardProps, 'config' | 'onFieldFocus'>>> = ({
    children,
    currentPage,
    totalPages,
    onNext,
    onPrevious,
    isPreview = false,
    theme,
}) => {
    // Load selected fonts dynamically
    useFontLoader([theme?.headingFont, theme?.bodyFont]);

    const containerClass = isPreview
        ? "form-card-container w-full h-full bg-gray-950 overflow-hidden flex flex-col"
        : "form-card-container w-[96%] max-w-[1400px] 2xl:max-w-[1600px] h-[70vh] min-h-[600px] max-h-[700px] mx-auto bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-gray-800/50 flex flex-col";

    return (
        <div className={containerClass} style={{ fontFamily: theme?.bodyFont }}>
            {!isPreview && (
                <div className="relative px-8 py-3 border-b border-gray-800/50 flex items-center flex-none">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="bg-green-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center flex-none">
                            {currentPage}
                        </span>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                        <button
                            onClick={onPrevious}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-gray-700/50 hover:bg-gray-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Previous page"
                        >
                            <ArrowLeftIcon className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-1.5 px-2">
                            <span className="text-xs font-semibold text-white">{currentPage}</span>
                            <span className="text-xs text-gray-600">/</span>
                            <span className="text-xs text-gray-400">{totalPages}</span>
                        </div>
                        <button
                            onClick={onNext}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-gray-700/50 hover:bg-gray-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Next page"
                        >
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-1 justify-end">
                    </div>
                </div>
            )}
            {children}
        </div>
    );
};
