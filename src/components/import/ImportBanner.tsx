/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPORT BANNER COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Centered modal for quick URL imports with brand icon
 * Features: Auto-focus, ESC key support, click-outside to close
 * 
 * Usage:
 *   <ImportBanner
 *     isOpen={isOpen}
 *     onClose={handleClose}
 *     sourceName="LinkedIn"
 *     sourceId="linkedin"
 *     placeholder="https://linkedin.com/..."
 *     onSubmit={handleSubmit}
 *   />
 */

"use client";

import { X, ArrowRight, Link as LinkIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { BrandIcon } from "@/lib/brands";

export interface ImportBannerProps {
    /** Whether the banner is visible */
    isOpen: boolean;
    /** Callback when banner should close */
    onClose: () => void;
    /** Source name (e.g., "LinkedIn") */
    sourceName: string;
    /** Source ID for icon (e.g., "linkedin") */
    sourceId: string;
    /** Placeholder text for input */
    placeholder?: string;
    /** Callback when form is submitted */
    onSubmit?: (url: string) => void;
}

export default function ImportBanner({
    isOpen,
    onClose,
    sourceName,
    sourceId,
    placeholder,
    onSubmit,
}: ImportBannerProps) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input when banner opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Reset input when closed
    useEffect(() => {
        if (!isOpen) {
            setInputValue("");
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSubmit?.(inputValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl animate-in zoom-in-95 fade-in duration-200"
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden relative">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 z-10 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Content */}
                    <div className="p-8">
                        {/* Header with brand */}
                        <div className="flex items-center gap-4 mb-6">
                            <BrandIcon
                                brandId={sourceId}
                                size={48}
                                variant="rounded"
                                showBackground
                            />
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    Import from {sourceName}
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    Paste the URL to your testimonial or review page
                                </p>
                            </div>
                        </div>

                        {/* Input form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-zinc-400 block mb-3 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" />
                                    URL
                                </label>
                                <input
                                    ref={inputRef}
                                    type="url"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={placeholder || `https://${sourceName.toLowerCase()}.com/...`}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]/50 transition-all font-mono text-sm"
                                />
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-300 rounded-xl text-sm font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-[var(--color-accent)]/30 flex items-center gap-2"
                                >
                                    Import testimonials
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
