"use client";

import { Button } from "@/components/ui/button";
import { Copy, Pencil, Scissors, Share2, Trash2 } from "lucide-react";
import { deleteTestimonial, duplicateTestimonial } from "@/lib/actions/testimonials";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface TestimonialToolbarProps {
    testimonialId: string | number;
    testimonialData?: any;
    isVideo: boolean;
    onEdit?: () => void;
    onTrim?: () => void;
    onDuplicate?: (newTestimonial: any, tempId?: number) => void;
    onDelete?: (id: string | number) => void;
}

export function TestimonialToolbar({ testimonialId, testimonialData, isVideo, onEdit, onTrim, onDuplicate, onDelete }: TestimonialToolbarProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const result = await deleteTestimonial(testimonialId);
                if (onDelete) {
                    // Other testimonials exist for this email OR we are in a text context where we handle deletion manually (Customer Page)
                    if (onDelete) {
                        onDelete(testimonialId);
                    } else {
                        router.refresh();
                    }
                    toast.success("Testimonial deleted successfully");
                } else {
                    // No other testimonials for this email - navigate to dashboard
                    router.push("/dashboard");
                }
            } catch (error) {
                console.error("Failed to delete", error);
                toast.error("Failed to delete testimonial");
            }
        });
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    const handleDuplicate = async () => {
        setIsDuplicating(true);
        const tempId = Date.now(); // Temporary ID for optimistic update

        // Optimistic Update
        if (testimonialData && onDuplicate) {
            const optimisticTestimonial = {
                ...testimonialData,
                id: tempId,
                title: (testimonialData.title || "") + " (Copy)",
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                created_at: new Date().toISOString(),
                video_url: testimonialData.video_url || testimonialData.media?.video_url || testimonialData.videoUrl || null,
                // Ensure attachments are preserved/copied correctly for the optimistic update
                attachments: testimonialData.attachments ? [...testimonialData.attachments] : []
            };
            onDuplicate(optimisticTestimonial, tempId);
        }

        try {
            const result = await duplicateTestimonial(testimonialId);
            if (result.success && result.newTestimonial) {
                // Replace optimistic item with real server data
                if (onDuplicate) {
                    onDuplicate(result.newTestimonial, tempId);
                }
                toast.success("Testimonial duplicated successfully!");
            }
        } catch (error) {
            console.error("Failed to duplicate", error);
            toast.error("Failed to duplicate testimonial");
            // Ideally we should remove the optimistic item here if it failed, 
            // but for now relying on refresh/manual delete is acceptable for MVP simplicity
        } finally {
            setIsDuplicating(false);
        }
    };

    return (
        <>
            <div className="border-t border-zinc-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-[#18181b]">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            if (onEdit) {
                                onEdit();
                            } else {
                                // Use customer_id directly from testimonialData (no extra DB call!)
                                if (testimonialData?.customer_id) {
                                    router.push(`/customer/${testimonialData.customer_id}`);
                                } else {
                                    router.push(`/dashboard/Edit-Testimonial/${testimonialId}`);
                                }
                            }
                        }}
                        className="h-10 px-4 gap-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700/50 rounded-xl transition-all duration-200"
                    >
                        <Pencil className="size-4" />
                        <span className="font-medium">Edit</span>
                    </Button>

                    {isVideo && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (onTrim) onTrim();
                                else router.push(`/dashboard/Trim-Video/${testimonialId}`);
                            }}
                            className="h-10 px-4 gap-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700/50 rounded-xl transition-all duration-200"
                        >
                            <Scissors className="size-4" />
                            <span className="font-medium">Trim</span>
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        onClick={handleDuplicate}
                        disabled={isDuplicating}
                        className="h-10 px-4 gap-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700/50 rounded-xl transition-all duration-200"
                    >
                        <Copy className="size-4" />
                        <span className="font-medium">{isDuplicating ? "Duplicating..." : "Duplicate"}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="h-10 px-4 gap-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all duration-200"
                    >
                        <Trash2 className="size-4" />
                        <span className="font-medium">Delete</span>
                    </Button>
                </div>

                {/* <Button
                    onClick={handleShare}
                    className="bg-zinc-50 hover:bg-white text-zinc-950 h-10 px-6 gap-2.5 rounded-xl font-semibold shadow-lg shadow-zinc-950/20 hover:shadow-zinc-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-transparent"
                >
                    <Share2 className="size-4" />
                    Share
                </Button> */}
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-50 sm:max-w-[425px] p-6 gap-6 shadow-2xl shadow-black/50">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-xl font-semibold">Delete Testimonial?</DialogTitle>
                        <DialogDescription className="text-zinc-400 text-base leading-relaxed">
                            Are you sure you want to permanently delete this testimonial?
                            This action cannot be undone and will remove it from all walls.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="gap-3 sm:gap-0 mt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="h-11 px-6 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl font-medium transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="h-11 px-6 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-xl font-medium transition-all shadow-none"
                        >
                            {isPending ? "Deleting..." : "Delete Permanently"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
