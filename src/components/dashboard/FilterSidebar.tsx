"use client";

import { X, Star, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FilterState {
    sources: string[];
    stars: number[];
    statuses: string[];
    types: string[];
}

interface FilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    availableSources: string[];
}

export function FilterSidebar({ isOpen, onClose, filters, setFilters, availableSources }: FilterSidebarProps) {
    // If not open, we still render it but off-screen or hidden? 
    // Usually conditional render is better for performance, but for animation we might need it present.
    // However, the current implementation in Parent conditionally renders based on isOpen?
    // No, Parent renders: <FilterSidebar isOpen={showFilters} ... />
    // And component returns null if !isOpen.
    // This breaks 'animate-out'. But user didn't ask for animate-out.
    // I'll stick to existing logic.
    if (!isOpen) return null;

    const toggleFilter = (key: keyof FilterState, value: string | number) => {
        setFilters(prev => {
            const current = prev[key] as (string | number)[];
            const isSelected = current.includes(value as never);

            let newValues;
            if (isSelected) {
                newValues = current.filter(item => item !== value);
            } else {
                newValues = [...current, value];
            }

            return {
                ...prev,
                [key]: newValues
            };
        });
    };

    const clearFilters = () => {
        setFilters({
            sources: [],
            stars: [],
            statuses: [],
            types: []
        });
    };

    const totalActiveFilters = filters.sources.length + filters.stars.length + filters.statuses.length + filters.types.length;

    return (
        // Right-sided sidebar with improved styling
        <div className="fixed inset-y-0 right-0 w-[20rem] bg-[#09090b] border-l border-zinc-800/60 z-50 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl shadow-black">

            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-800/40 flex items-center justify-between bg-zinc-900/10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                        <Filter className="size-4" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-base text-zinc-100">Filters</h2>
                        <p className="text-xs text-zinc-500">Refine your view</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                    <X className="size-4" />
                </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">

                {/* Status Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</h3>
                        {filters.statuses.length > 0 && <span className="text-[10px] font-medium bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">{filters.statuses.length}</span>}
                    </div>
                    <div className="space-y-1">
                        {['Public', 'Hidden', 'Pending'].map(status => (
                            <label
                                key={status}
                                className={cn(
                                    "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent",
                                    filters.statuses.includes(status) ? "bg-zinc-900 border-zinc-800/60" : "hover:bg-zinc-900/50"
                                )}
                            >
                                <span className={cn("text-sm font-medium", filters.statuses.includes(status) ? "text-zinc-200" : "text-zinc-400")}>
                                    {status}
                                </span>
                                <Checkbox
                                    checked={filters.statuses.includes(status)}
                                    onCheckedChange={() => toggleFilter('statuses', status)}
                                    className="border-zinc-700 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 rounded-sm size-4"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-zinc-800/40" />

                {/* Type Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</h3>
                        {filters.types.length > 0 && <span className="text-[10px] font-medium bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">{filters.types.length}</span>}
                    </div>
                    <div className="space-y-1">
                        {[
                            { value: 'text', label: 'Text' },
                            { value: 'video', label: 'Video' }
                        ].map(type => (
                            <label
                                key={type.value}
                                className={cn(
                                    "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent",
                                    filters.types.includes(type.value) ? "bg-zinc-900 border-zinc-800/60" : "hover:bg-zinc-900/50"
                                )}
                            >
                                <span className={cn("text-sm font-medium", filters.types.includes(type.value) ? "text-zinc-200" : "text-zinc-400")}>
                                    {type.label}
                                </span>
                                <Checkbox
                                    checked={filters.types.includes(type.value)}
                                    onCheckedChange={() => toggleFilter('types', type.value)}
                                    className="border-zinc-700 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 rounded-sm size-4"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-zinc-800/40" />

                {/* Rating Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rating</h3>
                        {filters.stars.length > 0 && <span className="text-[10px] font-medium bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">{filters.stars.length}</span>}
                    </div>
                    <div className="space-y-1">
                        {[5, 4, 3, 2, 1].map(star => (
                            <label
                                key={star}
                                className={cn(
                                    "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent",
                                    filters.stars.includes(star) ? "bg-zinc-900 border-zinc-800/60" : "hover:bg-zinc-900/50"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "size-3",
                                                    i < star ? "fill-amber-500 text-amber-500" : "fill-zinc-800 text-zinc-800"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className={cn("text-sm", filters.stars.includes(star) ? "text-zinc-300" : "text-zinc-500")}>
                                        {star} Stars
                                    </span>
                                </div>
                                <Checkbox
                                    checked={filters.stars.includes(star)}
                                    onCheckedChange={() => toggleFilter('stars', star)}
                                    className="border-zinc-700 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded-sm size-4"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-zinc-800/40" />

                {/* Source Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Source</h3>
                        {filters.sources.length > 0 && <span className="text-[10px] font-medium bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">{filters.sources.length}</span>}
                    </div>

                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {availableSources.length === 0 && <div className="py-4 text-center text-xs text-zinc-600 italic border border-dashed border-zinc-800 rounded-lg">No sources found</div>}
                        {availableSources.map(source => (
                            <label
                                key={source}
                                className={cn(
                                    "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border border-transparent",
                                    filters.sources.includes(source) ? "bg-zinc-900 border-zinc-800/60" : "hover:bg-zinc-900/50"
                                )}
                            >
                                <span className={cn("text-sm capitalize truncate max-w-[180px]", filters.sources.includes(source) ? "text-zinc-200 font-medium" : "text-zinc-400")}>
                                    {source === 'twitter' ? 'Twitter / X' : source}
                                </span>
                                <Checkbox
                                    checked={filters.sources.includes(source)}
                                    onCheckedChange={() => toggleFilter('sources', source)}
                                    className="border-zinc-700 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 rounded-sm size-4"
                                />
                            </label>
                        ))}
                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-800/60 bg-zinc-900/20 backdrop-blur-sm">
                <Button
                    variant="outline"
                    className={cn(
                        "w-full h-10 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all",
                        totalActiveFilters > 0 ? "text-zinc-200 border-zinc-700 bg-zinc-900" : "text-zinc-500"
                    )}
                    onClick={clearFilters}
                    disabled={totalActiveFilters === 0}
                >
                    Clear all filters
                    {totalActiveFilters > 0 && <span className="ml-2 bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-400 border border-zinc-700">{totalActiveFilters}</span>}
                </Button>
            </div>
        </div>
    );
}
