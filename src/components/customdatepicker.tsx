"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, isWithinInterval, isBefore, isAfter } from "date-fns";
import { DateRange } from "react-day-picker";

// Design system shadow presets
const shadows = {
    level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
    level3: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.08)',
};

interface CustomDateRangeDropdownProps {
    dateRange: DateRange | undefined;
    onChange: (range: DateRange | undefined) => void;
}

// Quick preset options
const presets = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
    { label: "All time", days: 0 },
];

export function CustomDateRangeDropdown({ dateRange, onChange }: CustomDateRangeDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectingStart, setSelectingStart] = useState(true);
    const [tempRange, setTempRange] = useState<DateRange | undefined>(dateRange);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Sync temp range with prop
    useEffect(() => {
        setTempRange(dateRange);
    }, [dateRange]);

    const handlePreset = (days: number) => {
        if (days === 0) {
            onChange(undefined);
            setTempRange(undefined);
        } else {
            const to = new Date();
            const from = new Date();
            from.setDate(from.getDate() - days);
            const newRange = { from, to };
            onChange(newRange);
            setTempRange(newRange);
        }
        setIsOpen(false);
    };

    const handleDayClick = (day: Date) => {
        if (selectingStart) {
            // Starting a new selection
            setTempRange({ from: day, to: undefined });
            setSelectingStart(false);
        } else {
            // Completing the selection
            if (tempRange?.from && isBefore(day, tempRange.from)) {
                // If clicked day is before start, swap
                setTempRange({ from: day, to: tempRange.from });
            } else {
                setTempRange({ from: tempRange?.from ?? day, to: day });
            }
            setSelectingStart(true);
        }
    };

    const handleApply = () => {
        if (tempRange?.from && tempRange?.to) {
            onChange(tempRange);
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        onChange(undefined);
        setTempRange(undefined);
        setIsOpen(false);
    };

    // Get days for current month - only show days in current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate starting day offset (0 = Sunday)
    const startDayOfWeek = monthStart.getDay();

    // Format display text
    const getDisplayText = () => {
        if (!dateRange?.from) return "Select dates";
        if (!dateRange.to) return format(dateRange.from, "MMM d, yyyy");
        return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    };

    // Shorter display for mobile
    const getMobileDisplayText = () => {
        if (!dateRange?.from) return "Dates";
        return "Filtered";
    };

    const isDayInRange = (day: Date) => {
        if (!tempRange?.from) return false;
        if (!tempRange.to) return isSameDay(day, tempRange.from);
        return isWithinInterval(day, { start: tempRange.from, end: tempRange.to });
    };

    const isDayStart = (day: Date) => tempRange?.from && isSameDay(day, tempRange.from);
    const isDayEnd = (day: Date) => tempRange?.to && isSameDay(day, tempRange.to);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-12 px-3 sm:px-4 flex items-center gap-2 rounded-xl bg-[#18181B] border border-white/[0.08] hover:border-white/[0.15] hover:bg-[#1f1f23] text-sm transition-all duration-200"
                style={{ boxShadow: shadows.level1 }}
            >
                <Calendar className="size-4 text-zinc-400" />
                {/* Full text on sm and up, short on mobile */}
                <span className="text-zinc-300 hidden sm:inline">{getDisplayText()}</span>
                <span className="text-zinc-300 sm:hidden">{getMobileDisplayText()}</span>
                {dateRange?.from && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                        className="ml-1 p-0.5 rounded hover:bg-white/[0.1] text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="size-3.5" />
                    </button>
                )}
            </button>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Dropdown - Fixed centered on mobile, absolute dropdown on desktop */}
            {isOpen && (
                <div
                    className="
                        z-50 rounded-xl overflow-hidden
                        fixed inset-x-4 top-1/2 -translate-y-1/2
                        md:absolute md:inset-auto md:top-full md:right-0 md:mt-2 md:translate-y-0
                    "
                    style={{
                        backgroundColor: '#1C1C1F',
                        boxShadow: shadows.level3,
                    }}
                >
                    {/* Subtle gradient warmth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#BFFF00]/[0.02] via-transparent to-transparent pointer-events-none rounded-xl" />

                    <div className="relative flex flex-col md:flex-row">
                        {/* Left: Presets - Hidden on mobile to save space */}
                        <div className="hidden md:block w-36 p-3 border-r border-white/[0.06] bg-black/20">
                            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2 px-2">Quick Select</p>
                            <div className="space-y-1">
                                {presets.map((preset) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handlePreset(preset.days)}
                                        className="w-full text-left px-2 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Calendar - Full width on mobile */}
                        <div className="p-4 w-full md:w-72">
                            {/* Mobile Presets - Horizontal row on mobile only */}
                            <div className="md:hidden flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
                                {presets.map((preset) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handlePreset(preset.days)}
                                        className="flex-shrink-0 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-md transition-colors whitespace-nowrap border border-white/[0.06]"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                                >
                                    <ChevronLeft className="size-4" />
                                </button>
                                <span className="text-sm font-semibold text-white">
                                    {format(currentMonth, "MMMM yyyy")}
                                </span>
                                <button
                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                                    <div key={day} className="text-center text-[10px] font-medium text-zinc-500 py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {/* Empty cells for offset */}
                                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                                    <div key={`empty-${i}`} className="h-8" />
                                ))}

                                {/* Actual days */}
                                {daysInMonth.map((day) => {
                                    const inRange = isDayInRange(day);
                                    const isStart = isDayStart(day);
                                    const isEnd = isDayEnd(day);
                                    const isTodayDate = isToday(day);

                                    return (
                                        <button
                                            key={day.toISOString()}
                                            onClick={() => handleDayClick(day)}
                                            className={`
                                                h-8 text-xs font-medium rounded-md transition-all duration-150
                                                ${inRange && !isStart && !isEnd ? 'bg-[#BFFF00]/10 text-white' : ''}
                                                ${isStart || isEnd ? 'bg-[#BFFF00] text-black font-semibold' : ''}
                                                ${!inRange && !isStart && !isEnd ? 'text-zinc-400 hover:bg-white/[0.06] hover:text-white' : ''}
                                                ${isTodayDate && !inRange && !isStart && !isEnd ? 'ring-1 ring-inset ring-zinc-600' : ''}
                                            `}
                                        >
                                            {format(day, "d")}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Selection Hint */}
                            <div className="mt-4 pt-3 border-t border-white/[0.06]">
                                <p className="text-[11px] text-zinc-500 text-center">
                                    {!tempRange?.from
                                        ? "Tap to select start date"
                                        : !tempRange?.to
                                            ? "Tap to select end date"
                                            : `${format(tempRange.from, "MMM d")} → ${format(tempRange.to, "MMM d")}`
                                    }
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={handleClear}
                                    className="flex-1 h-9 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={!tempRange?.from || !tempRange?.to}
                                    className="flex-1 h-9 text-xs font-semibold bg-[#BFFF00] text-black rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-[#d4ff50]"
                                    style={{ boxShadow: tempRange?.from && tempRange?.to ? '0 0 12px rgba(191,255,0,0.2)' : 'none' }}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
