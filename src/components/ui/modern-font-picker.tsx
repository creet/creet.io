"use client";

import React, {
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type ModernFontPickerProps = {
    value: string;
    onChange: (fontFamily: string) => void;
    className?: string;
    placeholder?: string;
    /** Compact mode for tight spaces like sidebars */
    compact?: boolean;
    /** Optional label to show above the picker */
    label?: string;
};

import {
    CURATED_FONTS,
    GOOGLE_FONTS,
    ensureFontLoaded,
} from "@/lib/fonts";

// Outside click hook
const useClickOutside = (
    ref: React.RefObject<HTMLElement | null>,
    handler: () => void
) => {
    useEffect(() => {
        const listener = (e: MouseEvent) => {
            if (!ref.current || ref.current.contains(e.target as Node)) return;
            handler();
        };
        document.addEventListener("mousedown", listener);
        return () => document.removeEventListener("mousedown", listener);
    }, [ref, handler]);
};

// Individual font option
const FontOption: React.FC<{
    font: string;
    isSelected: boolean;
    onSelect: () => void;
    index: number;
}> = ({ font, isSelected, onSelect, index }) => {
    useEffect(() => {
        ensureFontLoaded(font);
    }, [font]);

    return (
        <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.015, duration: 0.15 }}
            onClick={onSelect}
            className={`
        group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left
        transition-colors duration-150 outline-none
        ${isSelected
                    ? "bg-white/10 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }
      `}
            style={{ fontFamily: font }}
        >
            <span className="text-[14px] truncate">{font}</span>
            {isSelected && (
                <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 text-[#BFFF00] shrink-0 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </motion.svg>
            )}
        </motion.button>
    );
};

export const ModernFontPicker: React.FC<ModernFontPickerProps> = ({
    value = "Inter",
    onChange,
    className = "",
    placeholder = "Select font",
    compact = false,
    label,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    useClickOutside(containerRef, () => setIsOpen(false));

    // Determine if dropdown should open upward
    const calculatePlacement = useCallback(() => {
        if (!triggerRef.current) return false;
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 400; // Approximate dropdown height

        // Open upward if not enough space below but enough above
        return spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    }, []);

    // Handle opening with placement detection
    const handleOpen = useCallback(() => {
        setIsOpen(prev => {
            if (!prev) {
                setOpenUpward(calculatePlacement());
            }
            return !prev;
        });
    }, [calculatePlacement]);

    // Load selected font
    useEffect(() => {
        ensureFontLoaded(value);
    }, [value]);

    // Focus search on open + recalculate placement on resize
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);

            // Recalculate on resize/scroll
            const recalc = () => setOpenUpward(calculatePlacement());
            window.addEventListener('resize', recalc);
            window.addEventListener('scroll', recalc, true);
            return () => {
                window.removeEventListener('resize', recalc);
                window.removeEventListener('scroll', recalc, true);
            };
        } else {
            setSearch("");
            setActiveIndex(-1);
        }
    }, [isOpen, calculatePlacement]);

    // All fonts with curated first
    const allFonts = useMemo(() => {
        const googleFiltered = GOOGLE_FONTS.filter(
            (f) => !CURATED_FONTS.includes(f)
        );
        return [...CURATED_FONTS, ...googleFiltered];
    }, []);

    // Filtered fonts
    const filteredFonts = useMemo(() => {
        if (!search.trim()) return allFonts;
        const q = search.toLowerCase();
        return allFonts.filter((f) => f.toLowerCase().includes(q));
    }, [search, allFonts]);

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setActiveIndex((prev) =>
                        prev < filteredFonts.length - 1 ? prev + 1 : 0
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setActiveIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredFonts.length - 1
                    );
                    break;
                case "Enter":
                    e.preventDefault();
                    if (activeIndex >= 0 && filteredFonts[activeIndex]) {
                        onChange(filteredFonts[activeIndex]);
                        setIsOpen(false);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    setIsOpen(false);
                    break;
            }
        },
        [filteredFonts, activeIndex, onChange]
    );

    // Scroll active item into view
    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const item = listRef.current.children[activeIndex] as HTMLElement;
            item?.scrollIntoView({ block: "nearest" });
        }
    }, [activeIndex]);

    const handleSelect = useCallback(
        (font: string) => {
            onChange(font);
            setIsOpen(false);
        },
        [onChange]
    );

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Optional Label */}
            {label && (
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <button
                ref={triggerRef}
                type="button"
                onClick={handleOpen}
                className={`
                    w-full flex items-center justify-between gap-2
                    ${compact ? 'px-3 py-2 rounded-lg' : 'px-4 py-3 rounded-xl'}
                    bg-[#111113] border border-gray-800/60
                    hover:border-gray-700 hover:bg-[#151517]
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-[#BFFF00]/20 focus:border-[#BFFF00]/40
                `}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
            >
                <span
                    className={`${compact ? 'text-[13px]' : 'text-[15px]'} text-white truncate`}
                    style={{ fontFamily: value }}
                >
                    {value || placeholder}
                </span>
                <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-500 shrink-0`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </motion.svg>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: openUpward ? 8 : -8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`absolute z-50 left-0 right-0 ${openUpward ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'}`}
                    >
                        <div
                            className="
                bg-[#0E0E10] border border-gray-800/80
                rounded-xl shadow-2xl shadow-black/40
                overflow-hidden
              "
                            onKeyDown={handleKeyDown}
                        >
                            {/* Search Input - Sticky */}
                            <div className="sticky top-0 z-10 p-3 border-b border-gray-800/60 bg-[#0E0E10]">
                                <div className="relative">
                                    <svg
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setActiveIndex(-1);
                                        }}
                                        placeholder="Search fonts..."
                                        className="
                      w-full pl-10 pr-4 py-2.5 rounded-lg
                      bg-[#18181B] border border-gray-800/60
                      text-white text-[14px] placeholder:text-gray-500
                      focus:outline-none focus:border-gray-700 focus:bg-[#1C1C1F]
                      transition-colors duration-150
                    "
                                    />
                                </div>
                            </div>

                            {/* Font List */}
                            <div
                                ref={listRef}
                                id={listboxId}
                                role="listbox"
                                className="max-h-[320px] overflow-y-auto p-2 scrollbar-hide"
                            >
                                {/* Curated Section */}
                                {!search.trim() && (
                                    <>
                                        <div className="px-3 py-2">
                                            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                                                Popular
                                            </span>
                                        </div>
                                        {CURATED_FONTS.map((font, index) => (
                                            <FontOption
                                                key={font}
                                                font={font}
                                                isSelected={value === font}
                                                onSelect={() => handleSelect(font)}
                                                index={index}
                                            />
                                        ))}
                                        <div className="my-2 mx-3 border-t border-gray-800/50" />
                                        <div className="px-3 py-2">
                                            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                                                All Fonts
                                            </span>
                                        </div>
                                        {GOOGLE_FONTS.filter((f) => !CURATED_FONTS.includes(f)).map(
                                            (font, index) => (
                                                <FontOption
                                                    key={font}
                                                    font={font}
                                                    isSelected={value === font}
                                                    onSelect={() => handleSelect(font)}
                                                    index={index + CURATED_FONTS.length}
                                                />
                                            )
                                        )}
                                    </>
                                )}

                                {/* Filtered Results */}
                                {search.trim() && (
                                    <>
                                        {filteredFonts.length > 0 ? (
                                            filteredFonts.map((font, index) => (
                                                <FontOption
                                                    key={font}
                                                    font={font}
                                                    isSelected={value === font || activeIndex === index}
                                                    onSelect={() => handleSelect(font)}
                                                    index={index}
                                                />
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-gray-500 text-sm">
                                                No fonts found
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModernFontPicker;
