import { Search } from "lucide-react";
import { TestimonialRowCard } from "./TestimonialRowCard";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyTestimonialsState } from "./EmptyTestimonialsState";

interface Testimonial {
    id: number | string;
    type: string;
    reviewer: string;
    email: string;
    profession: string;
    rating: number;
    text: string;
    source: string;
    status: string;
    date: string;
    avatar: string;
    attachments?: { type: 'image' | 'video', url: string }[];
    videoThumbnail?: string;
    trimStart?: number;
    trimEnd?: number;
}

interface TestimonialTableProps {
    testimonials: Testimonial[];
    onStatusChange: (id: string | number) => void;
    onDelete: (id: string | number) => void;
    onEdit: (id: string | number) => void;
    onCopy: (text: string) => void;
    selectedIds: Set<string | number>;
    onSelect: (id: string | number) => void;
    onSelectAll: (checked: boolean) => void;
    className?: string;
    hasData?: boolean;
    hasFooter?: boolean;
}

export function TestimonialTable({
    testimonials,
    onStatusChange,
    onDelete,
    onEdit,
    onCopy,
    selectedIds,
    onSelect,
    onSelectAll,
    className,
    hasData = true,
    hasFooter = false,
    isLoading = false
}: TestimonialTableProps & { isLoading?: boolean }) {
    const allSelected = testimonials.length > 0 && testimonials.every(t => selectedIds.has(t.id));
    const someSelected = testimonials.some(t => selectedIds.has(t.id));
    const isIndeterminate = someSelected && !allSelected;

    return (
        <div className={`bg-gradient-to-b from-zinc-950/80 to-zinc-950/50 border border-zinc-800/60 rounded-t-2xl ${hasFooter ? 'rounded-b-none' : 'rounded-b-2xl'} overflow-x-auto shadow-xl shadow-black/30 backdrop-blur-sm ${className} flex flex-col`}>
            <table className="w-full border-collapse flex-none">
                {/* Table Header */}
                <thead className="bg-zinc-900/40 border-b border-zinc-800/60">
                    <tr className="flex items-center text-left">
                        {/* Checkbox Column Header */}
                        <th className="p-0 font-normal w-[60px]">
                            <div className="h-full flex items-center justify-center px-4 py-4">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={(checked) => onSelectAll(checked === true)}
                                    disabled={isLoading}
                                />
                            </div>
                        </th>

                        {/* Reviewer Column Header */}
                        <th className="p-0 font-normal">
                            <div className="w-[220px] px-4 py-4">
                                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                    Reviewer
                                </span>
                            </div>
                        </th>

                        {/* Vertical Divider */}
                        <th className="p-0 font-normal">
                            <div className="w-px h-5 bg-zinc-800/50 block" />
                        </th>

                        {/* Testimonial Column Header */}
                        <th className="block p-0 font-normal flex-1 min-w-0">
                            <div className="px-4 py-4 w-full min-w-[300px]">
                                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                    Testimonial
                                </span>
                            </div>
                        </th>

                        {/* Vertical Divider */}
                        <th className="p-0 font-normal">
                            <div className="w-px h-5 bg-zinc-800/50 block" />
                        </th>

                        {/* Meta Columns Header */}
                        <th className="p-0 font-normal">
                            <div className="flex items-center gap-2 flex-shrink-0 px-4 py-4">
                                {/* Source */}
                                <div className="w-[60px] flex justify-center block">
                                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                        Source
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="w-[80px] flex justify-center">
                                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                        Status
                                    </span>
                                </div>

                                {/* Date */}
                                <div className="w-[100px] flex justify-center block">
                                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                        Date
                                        <svg className="size-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="w-[100px] flex justify-center items-center">
                                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                        Actions
                                    </span>
                                </div>
                            </div>
                        </th>
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-zinc-800/40">
                    {isLoading ? (
                        // Skeleton State
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="flex items-center border-b border-zinc-800/50 w-full animate-pulse">
                                {/* Checkbox Skeleton */}
                                <td className="p-0 w-[60px] flex-shrink-0">
                                    <div className="flex items-center justify-center px-4 py-10">
                                        <div className="size-4 rounded bg-zinc-800/50" />
                                    </div>
                                </td>

                                {/* Reviewer Skeleton */}
                                <td className="p-0">
                                    <div className="flex items-start gap-4 w-[220px] px-4 py-8">
                                        <div className="size-10 rounded-full bg-zinc-800/50 flex-shrink-0" />
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="h-4 w-3/4 bg-zinc-800/50 rounded" />
                                            <div className="h-3 w-1/2 bg-zinc-800/50 rounded" />
                                            <div className="h-3 w-2/3 bg-zinc-800/50 rounded" />
                                        </div>
                                    </div>
                                </td>

                                {/* Vertical Divider */}
                                <td className="p-0">
                                    <div className="w-px h-28 bg-zinc-800/50 block" />
                                </td>

                                {/* Content Skeleton */}
                                <td className="block p-0 self-stretch flex-1 min-w-0">
                                    <div className="px-4 py-8 h-full flex flex-col justify-start min-w-[250px] gap-3">
                                        <div className="h-4 w-full bg-zinc-800/50 rounded" />
                                        <div className="h-4 w-5/6 bg-zinc-800/50 rounded" />
                                    </div>
                                </td>

                                {/* Vertical Divider */}
                                <td className="p-0">
                                    <div className="w-px h-28 bg-zinc-800/50 block" />
                                </td>

                                {/* Meta Skeleton */}
                                <td className="p-0">
                                    <div className="flex items-center gap-2 flex-shrink-0 px-4 py-8">
                                        <div className="w-[60px] flex justify-center">
                                            <div className="size-8 rounded-lg bg-zinc-800/50" />
                                        </div>
                                        <div className="w-[80px] flex justify-center">
                                            <div className="w-16 h-6 rounded-full bg-zinc-800/50" />
                                        </div>
                                        <div className="w-[100px] flex justify-center">
                                            <div className="w-16 h-4 rounded bg-zinc-800/50" />
                                        </div>
                                        <div className="w-[100px] flex justify-center gap-1">
                                            <div className="size-8 rounded-lg bg-zinc-800/50" />
                                            <div className="size-8 rounded-lg bg-zinc-800/50" />
                                            <div className="size-8 rounded-lg bg-zinc-800/50" />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (testimonials.length > 0 || hasData) ? (
                        testimonials.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-zinc-500 block">
                                    <div className="size-14 rounded-full bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                                        <Search className="size-6 text-zinc-600" />
                                    </div>
                                    <h3 className="text-zinc-300 font-semibold text-base mb-1">
                                        No testimonials found
                                    </h3>
                                    <p className="text-zinc-500 text-sm">
                                        Try adjusting your filters or search query.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            testimonials.map((t) => (
                                <TestimonialRowCard
                                    key={t.id}
                                    testimonial={t}
                                    selected={selectedIds.has(t.id)}
                                    onSelect={() => onSelect(t.id)}
                                    onStatusChange={onStatusChange}
                                    onDelete={onDelete}
                                    onEdit={onEdit}
                                    onCopy={onCopy}
                                />
                            ))
                        )
                    ) : null}
                </tbody>
            </table>

            {/* Empty State - Rendered OUTSIDE table to maintain full layout control */}
            {testimonials.length === 0 && !hasData && !isLoading && (
                <div className="flex-1 w-full min-h-0">
                    <EmptyTestimonialsState />
                </div>
            )}
        </div>
    );
}
