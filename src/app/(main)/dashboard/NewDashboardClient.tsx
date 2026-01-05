"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, Upload, ListFilter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { CustomDateRangeDropdown } from "@/components/customdatepicker";
import { TestimonialTable } from "@/components/dashboard/TestimonialTable";
import { cn } from "@/lib/utils";
import { BulkActionsFloatingBar } from "@/components/dashboard/BulkActionsFloatingBar";
import { FilterSidebar, FilterState } from "@/components/dashboard/FilterSidebar";

export interface Testimonial {
    id: number | string;
    customer_id?: string | null;  // Direct FK for customer navigation
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
    raw?: any;
}

import { getTestimonials, updateTestimonialStatus, deleteTestimonial, updateTestimonialContent, GetTestimonialsOptions } from "@/lib/actions/testimonials";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


interface NewDashboardClientProps {
    projectId: string | null;
}

export default function NewDashboardClient({ projectId }: NewDashboardClientProps) {
    const router = useRouter();

    // ===================== PAGINATION STATE ===================== //
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(25);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // ===================== FILTER STATE ===================== //
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [date, setDate] = useState<DateRange | undefined>();
    const [sortBy, setSortBy] = useState("newest");

    // Edit States
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [testimonialToDelete, setTestimonialToDelete] = useState<string | number | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

    // Filter Sidebar State
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        sources: [],
        stars: [],
        statuses: [],
        types: []
    });

    const availableSources = Array.from(new Set(testimonials.map(t => t.source || 'Unknown'))).sort();

    const [, startTransition] = useTransition();

    // ===================== DEBOUNCE SEARCH ===================== //
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ===================== FETCH TESTIMONIALS ===================== //
    const fetchTestimonials = useCallback(async () => {
        if (!projectId) {
            setTestimonials([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Build options from current state
            const options: GetTestimonialsOptions = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearch || undefined,
                sortBy: sortBy === 'newest' || sortBy === 'oldest' ? 'created_at' : sortBy === 'rating-high' || sortBy === 'rating-low' ? 'rating' : 'created_at',
                sortOrder: sortBy === 'oldest' || sortBy === 'rating-low' ? 'asc' : 'desc',
                filterType: filters.types.length === 1 ? filters.types[0] as 'text' | 'video' : 'all',
                filterSource: filters.sources.length === 1 ? filters.sources[0] : undefined,
                projectId: projectId,
            };

            const result = await getTestimonials(options);

            if (result.data) {
                // Map API response to Testimonial interface
                const mapped: Testimonial[] = result.data.map((t: any) => ({
                    id: t.id,
                    customer_id: t.customer_id || null,  // Include customer_id for direct navigation
                    type: t.type || 'text',
                    reviewer: t.author_name || 'Anonymous',
                    email: t.raw?.data?.customer_email || '',
                    profession: t.author_title || '',
                    rating: t.rating ?? 5,
                    text: t.content || t.text || '',
                    source: t.source || 'MANUAL',
                    status: t.status || 'Public',
                    date: new Date(t.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                    }),
                    avatar: t.author_avatar_url || '',
                    attachments: t.attachments || [],
                    videoThumbnail: t.video_thumbnail,
                    trimStart: t.trim_start,
                    trimEnd: t.trim_end,
                    raw: t,
                }));
                setTestimonials(mapped);
                setTotalItems(result.pagination.total);
                setTotalPages(result.pagination.totalPages);
            } else {
                setTestimonials([]);
            }
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
            setTestimonials([]);
        } finally {
            setIsLoading(false);
        }
    }, [projectId, currentPage, itemsPerPage, debouncedSearch, sortBy, filters.types, filters.sources]);

    // Refetch when filters change
    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, sortBy, filters, activeTab]);

    // Client-side filtering for status tabs (still useful for quick tab switching)
    // Note: Most filtering is now server-side, but status tabs are client-side for UX
    const displayTestimonials = testimonials.filter(t => {
        // Tab Filter (status filtering on current page)
        if (activeTab !== "All" && activeTab !== "Filters") {
            if (activeTab === "Public" && t.status.toLowerCase() !== "public") return false;
            if (activeTab === "Hidden" && t.status.toLowerCase() !== "hidden") return false;
            if (activeTab === "Pending" && t.status.toLowerCase() !== "pending") return false;
        }
        return true;
    });

    // Pagination Page Numbers Logic (uses server-provided totalPages)
    const pageNumbers = (() => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, currentPage + 2);
        if (currentPage <= 3) { start = 1; end = Math.min(5, totalPages); }
        if (currentPage >= totalPages - 2) { start = Math.max(1, totalPages - 4); end = totalPages; }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    })();

    const handleSelect = (id: string | number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(displayTestimonials.map((t: Testimonial) => t.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleStatusChange = (id: string | number) => {
        const t = testimonials.find(x => x.id === id);
        if (!t) return;

        // Values in DB are: public, hidden, pending
        // UI uses: Public, Hidden, Pending

        let newStatus = 'public';
        if (t.status === 'Public') newStatus = 'hidden';
        else if (t.status === 'Hidden') newStatus = 'public';
        else if (t.status === 'Pending') newStatus = 'public'; // Approve pending to public

        // Optimistic update
        setTestimonials(prev => prev.map(item =>
            item.id === id ? { ...item, status: newStatus === 'public' ? 'Public' : 'Hidden' } : item
        ));

        if (projectId) {
            startTransition(async () => {
                try {
                    await updateTestimonialStatus(id, newStatus);
                } catch (e) {
                    console.error(e);
                    // Revert if failed? For MVP we just alert or log
                }
            });
        }
    };

    const handleDelete = (id: string | number) => {
        setTestimonialToDelete(id);
        setDeleteDialogOpen(true);
    };



    const handleEdit = (id: string | number) => {
        const t = testimonials.find(x => x.id === id);
        if (t) {
            setEditingTestimonial({ ...t });
            setIsEditDialogOpen(true);
        }
    };

    const handleSaveEdit = () => {
        if (editingTestimonial) {
            // Optimistic
            setTestimonials(prev => prev.map(t => t.id === editingTestimonial.id ? editingTestimonial : t));
            setIsEditDialogOpen(false);

            if (projectId) {
                startTransition(async () => {
                    // Map UI fields back to DB JSON structure expected by updateTestimonialContent
                    const updateData = {
                        customer_name: editingTestimonial.reviewer,
                        customer_email: editingTestimonial.email,
                        message: editingTestimonial.text
                    };
                    try {
                        await updateTestimonialContent(editingTestimonial.id, updateData);
                    } catch (e) {
                        console.error(e);
                        alert("Failed to save changes");
                    }
                    setEditingTestimonial(null);
                });
            } else {
                setEditingTestimonial(null);
            }
        }
    };



    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast here
    };

    const handleBulkStatusChange = (status: 'Public' | 'Hidden') => {
        // Optimistic
        setTestimonials(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, status } : t));
        setSelectedIds(new Set()); // Clear selection after action

        if (projectId) {
            startTransition(async () => {
                try {
                    // We need to iterate or have a bulk update API. Assuming iterative for now or a bulk wrapper.
                    // Ideally, we'd add updateTestimonialStatusBulk(ids, status) to actions.
                    // For MVP stability:
                    const ids = Array.from(selectedIds);
                    await Promise.all(ids.map(id => updateTestimonialStatus(id, status.toLowerCase())));
                } catch (e) {
                    console.error(e);
                }
            });
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        setTestimonialToDelete('bulk'); // Use a special flag or handle differently
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (testimonialToDelete === 'bulk') {
            // Bulk Delete
            // Optimistic
            setTestimonials(prev => prev.filter(t => !selectedIds.has(t.id)));

            if (projectId) {
                startTransition(async () => {
                    const ids = Array.from(selectedIds);
                    try {
                        await Promise.all(ids.map(id => deleteTestimonial(id)));
                    } catch (e) {
                        alert("Failed to delete some items");
                    }
                });
            }
            setSelectedIds(new Set());
        } else if (testimonialToDelete) {
            // Single Delete
            // Optimistic
            setTestimonials(prev => prev.filter(t => t.id !== testimonialToDelete));

            if (projectId) {
                startTransition(async () => {
                    try {
                        await deleteTestimonial(testimonialToDelete);
                    } catch (e) {
                        alert("Failed to delete");
                    }
                });
            }
        }

        setDeleteDialogOpen(false);
        setTestimonialToDelete(null);
    };

    return (
        <div className={cn("flex-1 relative w-full transition-all duration-300 flex flex-col", showFilters && "lg:mr-[20rem]")}>
            {/* Header Section with gradient accent */}
            <div className="relative mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Testimonials</h1>
                        <p className="text-zinc-400 text-sm">Organize the testimonials you have received or imported.</p>
                    </div>
                    <Link href="/import">
                        <Button className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black shadow-lg shadow-[var(--color-accent)]/20 rounded-xl px-6 h-11 font-medium transition-all duration-300 hover:shadow-[var(--color-accent)]/40 hover:scale-[1.02]">
                            <Upload className="size-4 mr-2" />
                            Import Testimonials
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="space-y-6 flex-1 flex flex-col">
                {/* Filters Bar - Only show when there are testimonials or loading */}
                {(testimonials.length > 0 || isLoading) && (
                    <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
                        <div className="flex items-center gap-3 overflow-x-auto pb-1 xl:pb-0 scrollbar-hide">
                            <div className="flex p-1 bg-zinc-900/70 border border-zinc-800/80 rounded-lg backdrop-blur-sm">
                                {["All", "Public", "Hidden", "Pending"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-300",
                                            activeTab === tab
                                                ? "bg-gradient-to-r from-zinc-700/90 to-zinc-800/90 text-white shadow-sm shadow-black/20"
                                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <Button variant="outline" onClick={() => setShowFilters(prev => !prev)} className={cn("bg-zinc-900/70 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 text-xs rounded-lg transition-all duration-200", showFilters && "bg-zinc-800 text-white border-zinc-700")}>
                                <Filter className="size-3.5 mr-1.5" />
                                Filters
                            </Button>
                        </div>
                    </div>
                )}

                {/* Search & Sorting Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <Input
                            placeholder="Search testimonials by name, email, or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-zinc-900/50 border-zinc-800/80 pl-11 h-12 focus:ring-indigo-500/30 focus:border-indigo-500/50 rounded-xl text-sm w-full placeholder:text-zinc-600 transition-all duration-200"
                        />
                    </div>
                    <div className="sm:w-auto flex flex-wrap items-center gap-3">
                        <CustomDateRangeDropdown dateRange={date} onChange={setDate} />
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-12 px-4 w-[140px] justify-start text-left font-normal bg-[#18181B] border border-white/[0.08] hover:border-white/[0.15] hover:bg-[#1f1f23] text-zinc-300 focus:ring-0 focus:ring-offset-0 rounded-xl transition-all duration-200" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}>
                                <ListFilter className="mr-2 h-4 w-4 text-zinc-400 shrink-0" />
                                <span className="truncate">
                                    {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'rating-high' ? 'Highest' : 'Lowest'}
                                </span>
                            </SelectTrigger>
                            <SelectContent className="bg-[#1C1C1F] border-white/[0.08] text-zinc-300 rounded-xl" style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.08)' }}>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="rating-high">Highest Rating</SelectItem>
                                <SelectItem value="rating-low">Lowest Rating</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Unified Table and Pagination Section */}
                <div className="flex flex-col flex-1">
                    <div className="z-10 flex-1 flex flex-col">
                        <TestimonialTable
                            testimonials={displayTestimonials}
                            selectedIds={selectedIds}
                            onSelect={handleSelect}
                            onSelectAll={handleSelectAll}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onCopy={handleCopy}
                            className="flex-1"
                            hasData={testimonials.length > 0 || isLoading}
                            hasFooter={totalItems > 0}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Pagination Footer */}
                    {totalItems > 0 && (
                        <div className="bg-zinc-950/70 border border-t-0 border-zinc-800/40 rounded-b-xl px-3 py-1.5 flex items-center justify-between backdrop-blur-sm -mt-[1px] relative z-0">
                            {/* Left: Result summary */}
                            <p className="text-xs text-zinc-500">
                                <span className="text-zinc-400">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}</span>
                                <span className="mx-1">of</span>
                                <span className="text-zinc-400">{totalItems}</span>
                            </p>

                            {/* Right: Controls */}
                            <div className="flex items-center gap-0.5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded text-zinc-500 hover:text-white hover:bg-zinc-800/60 disabled:opacity-30"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="size-3.5" />
                                </Button>

                                {/* Page Numbers - Desktop only */}
                                <div className="hidden sm:flex items-center gap-0.5 px-1">
                                    {pageNumbers.map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={cn(
                                                "h-6 min-w-[1.5rem] px-1.5 rounded text-xs font-medium transition-all",
                                                currentPage === pageNum
                                                    ? "bg-indigo-600/80 text-white"
                                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                                            )}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>

                                {/* Compact indicator on mobile */}
                                <span className="sm:hidden px-1.5 text-xs text-zinc-500">
                                    {currentPage}/{totalPages}
                                </span>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded text-zinc-500 hover:text-white hover:bg-zinc-800/60 disabled:opacity-30"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    aria-label="Next page"
                                >
                                    <ChevronRight className="size-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Sidebar */}
            <FilterSidebar
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                setFilters={setFilters}
                availableSources={availableSources}
            />

            {/* Edit Dialog */}
            {editingTestimonial && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-50">
                        <DialogHeader>
                            <DialogTitle>Edit Testimonial</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right text-zinc-400">Name</Label>
                                <Input id="name" value={editingTestimonial.reviewer} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, reviewer: e.target.value })} className="col-span-3 bg-zinc-900 border-zinc-800" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right text-zinc-400">Email</Label>
                                <Input id="email" value={editingTestimonial.email} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, email: e.target.value })} className="col-span-3 bg-zinc-900 border-zinc-800" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="text" className="text-right text-zinc-400">Message</Label>
                                <Textarea id="text" value={editingTestimonial.text} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })} className="col-span-3 bg-zinc-900 border-zinc-800 min-h-[100px]" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => {
                                // Use customer_id directly from testimonial (no extra DB call!)
                                if (editingTestimonial.customer_id) {
                                    router.push(`/customer/${editingTestimonial.customer_id}`);
                                } else {
                                    router.push(`/dashboard/Edit-Testimonial/${editingTestimonial.id}`);
                                }
                            }} variant="outline" className="sm:mr-auto border-indigo-500/30 bg-indigo-500/5 text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 hover:border-indigo-500/50 transition-all">Full Edit</Button>
                            <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleSaveEdit} className="bg-indigo-600 hover:bg-indigo-500 text-white">Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-50">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Would you like to proceed with delete? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} className="hover:bg-zinc-900 border border-transparent hover:border-zinc-800">
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} className="bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-900">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>



            <BulkActionsFloatingBar
                selectedCount={selectedIds.size}
                onClearSelection={() => setSelectedIds(new Set())}
                onMakePublic={() => handleBulkStatusChange('Public')}
                onMakeHidden={() => handleBulkStatusChange('Hidden')}
                onDelete={handleBulkDelete}
            />

        </div >
    );
}
