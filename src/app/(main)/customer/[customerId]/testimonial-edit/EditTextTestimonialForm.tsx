"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calendar, Star, Upload, Link as LinkIcon, Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { updateTestimonialContent } from "@/lib/actions/testimonials";
import { uploadImageToStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface EditTextTestimonialFormProps {
    testimonial: any;
    onClose: () => void;
    isEmbedded?: boolean;
}

export function EditTextTestimonialForm({ testimonial, onClose, isEmbedded = false }: EditTextTestimonialFormProps) {
    const router = useRouter();
    // Prioritize top level, then raw data
    const [title, setTitle] = useState(testimonial.title || testimonial.raw?.data?.title || "");
    const [rating, setRating] = useState(testimonial.rating || 5);
    // Use text (from getTestimonialById) or fallback paths
    const [content, setContent] = useState(testimonial.text || testimonial.content || testimonial.excerpt || testimonial.raw?.data?.message || "");
    const [isSaving, setIsSaving] = useState(false);

    // New Fields
    const [postUrl, setPostUrl] = useState("");
    const [source, setSource] = useState(testimonial.source?.toLowerCase() || "manual");

    // Date handling
    // Date handling
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Attachments
    const [attachments, setAttachments] = useState<string[]>(testimonial.raw?.data?.attachments || []);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for project ID (Project-First Storage)
    const [projectId, setProjectId] = useState<string | null>(null);

    // Fetch active project ID on mount
    // Note: We could also use testimonial.project_id if avail, but fetching active ensures safety for new edits
    // However, for editing EXISTING testimonial, we should try to put new assets in SAME project as testimonial.
    // Let's prioritize testimonial.project_id if available.
    const effectiveProjectId = testimonial.project_id || projectId;

    if (!projectId) {
        // Auto-fetch active project only if not already have specific testimonial project
        // Actually, fetching it is safer as backup
        import("@/lib/actions/projects").then(({ getActiveProjectId }) => {
            getActiveProjectId().then(id => { if (id) setProjectId(id); });
        });
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (attachments.length >= 3) {
            toast.error("Maximum 3 attachments allowed");
            event.target.value = ""; // Reset input
            return;
        }

        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const userId = testimonial.user_id || testimonial.raw?.user_id;

            // Determine Context: Project > User
            const context: any = effectiveProjectId
                ? { type: 'project', projectId: effectiveProjectId }
                : (userId ? { type: 'user', userId } : null);

            if (!context) throw new Error("Could not determine upload context (No Project or User ID)");

            // Use existing upload utility
            const result = await uploadImageToStorage({
                file,
                context,
                bucket: 'assets'
            });

            setAttachments(prev => [...prev, result.url]);
            toast.success("Attachment uploaded");
        } catch (error: any) {
            console.error("Upload failed:", error);
            toast.error("Upload failed: " + error.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveAttachment = (indexToRemove: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const userId = testimonial.user_id || testimonial.raw?.user_id;
            if (!userId) {
                // Should not happen if data is consistent
                throw new Error("User ID missing. Cannot save.");
            }

            toast.loading("Saving changes...");

            const updateData = {
                title,
                rating,
                message: content,
                original_post_url: postUrl,
                source,
                testimonial_date: date,
                attachments: attachments, // Save simple array of URLs
            };

            await updateTestimonialContent(testimonial.id, updateData);

            toast.dismiss();
            toast.success("Testimonial updated successfully!");
            router.refresh();
            onClose();

        } catch (error: any) {
            console.error(error);
            toast.dismiss();
            toast.error("Failed to save: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={cn(
            "flex flex-col h-auto w-full mx-auto animate-in fade-in zoom-in-95 duration-200 text-zinc-50 relative", // Added text-zinc-50 back
            isEmbedded
                ? "bg-transparent"
                : "bg-[#09090b] border border-zinc-800 shadow-2xl rounded-xl overflow-hidden min-h-[50vh] max-h-[85vh] max-w-[95vw] md:max-w-[60vw]"
        )}>
            {/* Header */}
            <div className={cn(
                "flex-shrink-0 flex items-center justify-end",
                isEmbedded
                    ? "absolute top-0 right-0 z-10 p-0"
                    : "px-4 md:px-6 py-3 md:py-4 border-b border-zinc-800/50 bg-[#09090b]"
            )}>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800">
                    <X className="size-5" />
                </Button>
            </div>

            {/* Main Content - Single Column */}
            <div className={cn(
                "flex-1 overflow-y-auto scrollbar-hide",
                isEmbedded ? "bg-transparent p-1" : "bg-[#09090b] p-4 md:p-8"
            )}>
                <div className="space-y-4 w-full max-w-4xl mx-auto">

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="ex. Amazing tool. I can't live without it!"
                            className="bg-zinc-900/50 border-zinc-800 h-10 text-zinc-200 placeholder:text-zinc-600 focus:ring-zinc-700 rounded-lg"
                        />
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Rating</label>
                        <div className="flex items-center gap-1.5 h-10">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-all hover:scale-110 active:scale-95 group"
                                >
                                    <Star
                                        className={`size-6 transition-colors ${star <= rating
                                            ? "fill-amber-500 text-amber-500 drop-shadow-sm"
                                            : "fill-zinc-800/50 text-zinc-700 group-hover:text-zinc-500"
                                            }`}
                                        strokeWidth={star <= rating ? 0 : 1.5}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message / Content */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Message</label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write the testimonial content here..."
                            className="bg-zinc-900/50 border-zinc-800 min-h-[150px] text-zinc-200 placeholder:text-zinc-600 focus:ring-zinc-700 resize-none rounded-lg text-base leading-relaxed"
                        />
                    </div>

                    {/* Metadata Grid: Post URL & Source */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Post URL */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Post URL</label>
                            <div className="relative">
                                <Input
                                    value={postUrl}
                                    onChange={(e) => setPostUrl(e.target.value)}
                                    placeholder="https://creet.com"
                                    className="bg-zinc-900/50 border-zinc-800 h-10 pl-9 text-zinc-200 placeholder:text-zinc-600 focus:ring-zinc-700 rounded-lg"
                                />
                                <LinkIcon className="absolute left-3 top-2.5 size-4 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Source */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Source</label>
                            <Select value={source} onValueChange={setSource}>
                                <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-800 h-10 text-zinc-200 rounded-lg">
                                    <SelectValue placeholder="Select Source" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 [&_[data-radix-select-viewport]]:max-h-[200px]">
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="airbnb">Airbnb</SelectItem>
                                    <SelectItem value="amazon">Amazon</SelectItem>
                                    <SelectItem value="app_store">App Store</SelectItem>
                                    <SelectItem value="apple_podcasts">Apple Podcasts</SelectItem>
                                    <SelectItem value="appsumo">AppSumo</SelectItem>
                                    <SelectItem value="capterra">Capterra</SelectItem>
                                    <SelectItem value="chrome_web_store">Chrome Web Store</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                    <SelectItem value="fiverr">Fiverr</SelectItem>
                                    <SelectItem value="g2">G2</SelectItem>
                                    <SelectItem value="google">Google</SelectItem>
                                    <SelectItem value="homestars">HomeStars</SelectItem>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                                    <SelectItem value="play_store">Play Store</SelectItem>
                                    <SelectItem value="product_hunt">Product Hunt</SelectItem>
                                    <SelectItem value="realtor">Realtor</SelectItem>
                                    <SelectItem value="reddit">Reddit</SelectItem>
                                    <SelectItem value="skillshare">Skillshare</SelectItem>
                                    <SelectItem value="sourceforge">SourceForge</SelectItem>
                                    <SelectItem value="tiktok">TikTok</SelectItem>
                                    <SelectItem value="trustpilot">Trustpilot</SelectItem>
                                    <SelectItem value="twitter">Twitter / X</SelectItem>
                                    <SelectItem value="udemy">Udemy</SelectItem>
                                    <SelectItem value="whop">Whop</SelectItem>
                                    <SelectItem value="wordpress">WordPress</SelectItem>
                                    <SelectItem value="yelp">Yelp</SelectItem>
                                    <SelectItem value="youtube">YouTube</SelectItem>
                                    <SelectItem value="zillow">Zillow</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Attachments (Middle) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Attachments</label>
                        <div className="flex flex-wrap gap-3">
                            {attachments.map((urlParam, idx) => {
                                // Handle if attachment is object { type, url } or string
                                const url = typeof urlParam === 'object' && urlParam !== null && 'url' in urlParam
                                    ? (urlParam as any).url
                                    : urlParam;

                                return (
                                    <div key={idx} className="relative w-24 h-24 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden group">
                                        <img src={url} alt="Attachment" className="w-full h-full object-contain p-1" />
                                        <button
                                            onClick={() => handleRemoveAttachment(idx)}
                                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-zinc-700 text-white rounded-full transition-all"
                                            title="Remove"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                );
                            })}
                            {attachments.length < 3 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-24 h-24 rounded-lg bg-zinc-900/50 border border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 transition-all cursor-pointer flex flex-col items-center justify-center text-zinc-500 gap-1"
                                >
                                    {isUploading ? (
                                        <Loader2 className="size-5 animate-spin text-zinc-400" />
                                    ) : (
                                        <>
                                            <Upload className="size-5" />
                                            <span className="text-[10px]">Upload</span>
                                        </>
                                    )}
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>

                    {/* Date (Bottom) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Date</label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-zinc-900/50 border-zinc-800 h-10 pl-9 text-zinc-200 placeholder:text-zinc-600 focus:ring-zinc-700 rounded-lg [color-scheme:dark]"
                                />
                                <Calendar className="absolute left-3 top-2.5 size-4 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>


                    {/* Save Button */}
                    <div className="pt-6">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full bg-white text-black hover:bg-zinc-200 h-12 font-bold rounded-lg shadow-lg shadow-zinc-950/20 transition-all disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}
