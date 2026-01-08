"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, Play, Plus, Calendar, Star } from "lucide-react";
import { toast } from "sonner";
import { uploadImageToStorage, deleteImageFromStorage } from "@/lib/storage";
import { updateTestimonialContent } from "@/lib/actions/testimonials";
import { cn } from "@/lib/utils";
import { VideoPlayer } from "@/components/ui/VideoPlayer";

interface EditVideoTestimonialFormProps {
    testimonial: any;
    onClose: () => void;
    isEmbedded?: boolean;
    onUpdate?: (updatedData: any) => void;
}

export function EditVideoTestimonialForm({ testimonial, onClose, isEmbedded = false, onUpdate }: EditVideoTestimonialFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState(testimonial.title || "");
    const [rating, setRating] = useState(testimonial.rating || 0);
    const [message, setMessage] = useState(testimonial.raw?.data?.message || "");

    const initialVideoUrl = testimonial.attachments?.find((a: any) => a.type === 'video')?.url ||
        (testimonial.type === 'video' ? testimonial.video_url : null);

    const initialThumbnailUrls = (testimonial.raw?.data?.thumbnails || []) as string[];

    const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [thumbnails, setThumbnails] = useState<{ url: string; file?: File }[]>(
        (testimonial.raw?.data?.thumbnails || []).map((url: any) => ({ url: String(url) }))
    );
    const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState<number>(
        testimonial.raw?.data?.selected_thumbnail_index || 0
    );

    // New Fields State
    const [postUrl, setPostUrl] = useState(testimonial.raw?.data?.original_post_url || "");
    const [source, setSource] = useState(testimonial.source?.toLowerCase() || testimonial.raw?.data?.source || "creet");

    // Date initialization
    const initialDate = testimonial.raw?.data?.testimonial_date
        ? new Date(testimonial.raw.data.testimonial_date).toISOString().split('T')[0]
        : testimonial.created_at
            ? new Date(testimonial.created_at).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(initialDate);

    // Get trim values from testimonial data - Ignore if replacing video
    const trimStart = videoFile ? undefined : testimonial.raw?.data?.trim_start;
    const trimEnd = videoFile ? undefined : testimonial.raw?.data?.trim_end;


    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);



    useEffect(() => {
        // Auto-generate Cloudflare thumbnails if videoUrl is a UID
        // Ensure it's not a URL (http/https) and not a blob
        const isUid = videoUrl && !videoUrl.includes('/') && !videoUrl.startsWith('http') && !videoUrl.startsWith('blob:');

        if (isUid) {
            const cfThumb1 = `https://videodelivery.net/${videoUrl}/thumbnails/thumbnail.jpg?height=600`;
            const cfThumb2 = `https://videodelivery.net/${videoUrl}/thumbnails/thumbnail.jpg?time=4s&height=600`;

            setThumbnails(prev => {
                // Check if we need to update to avoid infinite loops
                if (prev[0]?.url === cfThumb1 && prev[1]?.url === cfThumb2) return prev;

                const newThumbs = [...prev];
                // Update 0 and 1
                newThumbs[0] = { url: cfThumb1 };
                newThumbs[1] = { url: cfThumb2 };

                return newThumbs;
            });
        }
    }, [videoUrl]); // Only depend on videoUrl, not selectedThumbnailIndex

    const handleThumbnailClick = () => {
        thumbnailInputRef.current?.click();
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setThumbnails(prev => {
                if (prev.length < 3) {
                    return [...prev, { url, file }];
                } else {
                    // Replace the 3rd item (index 2)
                    const newItems = [...prev];
                    newItems[2] = { url, file };
                    return newItems;
                }
            });
            e.target.value = "";
        }
    };





    const handleReplaceVideo = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
            setVideoFile(file);
            setIsPlaying(false);

            // Clear old thumbnails - Cloudflare will auto-generate new ones once video is uploaded
            // The useEffect will populate thumbnails after we get the Cloudflare UID
            setThumbnails([]);
            setSelectedThumbnailIndex(0);
            e.target.value = "";
        }
    };



    const handleSave = async () => {
        setIsSaving(true);
        try {
            const userId = testimonial.raw?.user_id;
            if (!userId) {
                throw new Error("User ID missing. Cannot save.");
            }

            let finalVideoUrl = videoUrl;

            // 1. Upload new video if selected
            if (videoFile) {
                toast.loading("Uploading video...");

                const { uploadVideo } = await import("@/lib/video-upload");
                const result = await uploadVideo(videoFile);

                // Always Cloudflare - use the UID
                finalVideoUrl = result.uid;

                // 2. Delete old video if replaced and it was a Supabase storage URL
                if (initialVideoUrl && initialVideoUrl !== finalVideoUrl && initialVideoUrl.includes('/public/assets/')) {
                    try {
                        const urlObj = new URL(initialVideoUrl);
                        // Extract path from public URL. Assumes 'assets' bucket.
                        const pathParts = urlObj.pathname.split('/public/assets/');
                        if (pathParts[1]) {
                            await deleteImageFromStorage(pathParts[1]);
                        }
                    } catch (err) {
                        console.error("Failed to cleanup old video", err);
                    }
                }
            }

            // 3. Upload Thumbnails
            const finalThumbnails = await Promise.all(thumbnails.map(async (t) => {
                if (t.file) {
                    toast.loading("Uploading thumbnail...");
                    const res = await uploadImageToStorage({
                        file: t.file,
                        context: {
                            type: 'user',
                            userId: userId,
                            namespace: 'thumbnails'
                        }
                    });
                    return res.url;
                }
                return t.url;
            }));

            // 4. Cleanup orphaned thumbnails
            if (initialThumbnailUrls && initialThumbnailUrls.length > 0) {
                const orphanUrls = initialThumbnailUrls.filter(url => !finalThumbnails.includes(url));
                if (orphanUrls.length > 0) {
                    await Promise.all(orphanUrls.map(async (url) => {
                        try {
                            const urlObj = new URL(url);
                            const pathParts = urlObj.pathname.split('/public/assets/');
                            if (pathParts[1]) {
                                await deleteImageFromStorage(pathParts[1]);
                            }
                        } catch (e) {
                            console.error("Cleanup thumb failed", e);
                        }
                    }));
                }
            }

            // 5. Update DB
            toast.dismiss();
            toast.loading("Saving changes...");

            const updateData: any = {
                title,
                rating,
                message: message,
                original_post_url: postUrl,
                source,
                testimonial_date: date,
                thumbnails: finalThumbnails,
                selected_thumbnail_index: selectedThumbnailIndex,
                media: {
                    ...(testimonial.raw?.data?.media || {}),
                    video_url: finalVideoUrl
                }
            };

            // If we replaced the video, clear the old trim values
            if (videoFile) {
                updateData.trim_start = null;
                updateData.trim_end = null;
            }

            await updateTestimonialContent(testimonial.id, updateData);

            if (onUpdate) {
                onUpdate({
                    ...testimonial,
                    title: title,
                    rating: rating,
                    text: message, // Map message -> text for UI
                    content: message,
                    source: source,
                    video_url: finalVideoUrl,
                    video_thumbnail: finalThumbnails[selectedThumbnailIndex],
                    created_at: date ? new Date(date).toISOString() : testimonial.created_at,
                    raw: {
                        ...testimonial.raw,
                        data: {
                            ...testimonial.raw?.data,
                            ...updateData,
                            trim_start: updateData.trim_start !== undefined ? updateData.trim_start : testimonial.raw?.data?.trim_start,
                            trim_end: updateData.trim_end !== undefined ? updateData.trim_end : testimonial.raw?.data?.trim_end
                        }
                    },
                    // Update attachments list for UI (include video & thumbnails)
                    attachments: [
                        ...finalThumbnails.map(url => ({ type: 'image', url })),
                        ...(finalVideoUrl ? [{ type: 'video', url: finalVideoUrl }] : [])
                    ]
                });
            }


            toast.dismiss();
            toast.success("Testimonial updated successfully!");
            router.refresh(); // Still refresh to ensure consistency
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
            "flex flex-col h-auto w-full mx-auto animate-in fade-in zoom-in-95 duration-200 text-zinc-50 relative",
            isEmbedded
                ? "bg-transparent"
                : "bg-[#09090b] border border-zinc-800 shadow-2xl rounded-xl overflow-hidden min-h-[50vh] max-h-[85vh] md:max-h-[80vh] max-w-[98vw] md:max-w-[95vw]"
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

            {/* Main Content Split View */}
            <div className={cn(
                "flex-1 overflow-y-auto md:overflow-hidden grid grid-cols-1 lg:grid-cols-12 scrollbar-hide",
                isEmbedded ? "rounded-xl border border-zinc-800/50 overflow-hidden" : ""
            )}>

                {/* Left Panel: Media (Thumbnails + Video) */}
                <div className={cn(
                    "lg:col-span-5 space-y-4 md:space-y-6 lg:border-r border-zinc-800/50 bg-[#0c0c0e] lg:overflow-y-auto scrollbar-hide",
                    isEmbedded ? "p-8" : "p-8 md:p-10"
                )}>
                    {/* Thumbnails */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-400">Thumbnail</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[0, 1, 2].map((i) => {
                                const thumbnail = thumbnails[i];
                                const hasThumbnail = !!thumbnail?.url && thumbnail.url.length > 0;
                                const isFrame3 = i === 2;
                                const canUpload = isFrame3 && !hasThumbnail;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            if (hasThumbnail) {
                                                setSelectedThumbnailIndex(i);
                                            } else if (canUpload) {
                                                handleThumbnailClick();
                                            }
                                        }}
                                        className={cn(
                                            "relative aspect-video bg-zinc-800 rounded-md border overflow-hidden transition-all group",
                                            hasThumbnail ? "cursor-pointer border-zinc-700/50" : canUpload ? "cursor-pointer border-dashed border-zinc-600 hover:border-indigo-500 hover:bg-zinc-700/50" : "cursor-default opacity-50 border-zinc-700/50",
                                            selectedThumbnailIndex === i && hasThumbnail ? 'ring-2 ring-indigo-500' : hasThumbnail ? 'hover:ring-2 hover:ring-indigo-500' : ''
                                        )}
                                    >
                                        {hasThumbnail ? (
                                            <img src={thumbnail.url} alt={`Frame ${i + 1}`} className="w-full h-full object-cover rounded-md" />
                                        ) : (
                                            <div className={cn(
                                                "absolute inset-0 flex flex-col items-center justify-center text-[10px] p-1 text-center leading-tight",
                                                canUpload ? "text-zinc-400 bg-zinc-800/80" : "text-zinc-600 bg-zinc-900"
                                            )}>
                                                {canUpload ? (
                                                    <>
                                                        <Upload className="size-3 mb-1" />
                                                        <span>Upload<br />Thumbnail</span>
                                                    </>
                                                ) : (
                                                    `Frame ${i + 1}`
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div
                                onClick={handleThumbnailClick}
                                className="aspect-video bg-zinc-900/50 border border-zinc-800 border-dashed rounded-md flex items-center justify-center cursor-pointer hover:bg-zinc-800/50 hover:text-white text-zinc-500 transition-all"
                            >
                                <Upload className="size-4" />
                            </div>
                            <input
                                type="file"
                                ref={thumbnailInputRef}
                                onChange={handleThumbnailChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Video Player */}
                    <div className="space-y-2 md:space-y-3">
                        <label className="text-sm font-medium text-zinc-400">Video</label>
                        <div className="w-full aspect-video bg-black rounded-lg border border-zinc-800 relative group overflow-hidden">
                            {videoUrl ? (
                                <VideoPlayer
                                    key={`${videoUrl}-${selectedThumbnailIndex}`} // Reset player when URL or thumbnail changes
                                    url={videoUrl}
                                    poster={thumbnails[selectedThumbnailIndex]?.url}
                                    trimStart={trimStart}
                                    trimEnd={trimEnd}
                                    showControls={false}
                                    showPlayPauseButton={true}
                                    overlayOnHoverOnly={false}
                                    showDurationBadge={true}
                                    showProgressBar={true}
                                    showVolumeControl={true}
                                    showFullscreenButton={true}
                                    className="w-full h-full"
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-700">No Video</div>
                            )}
                        </div>
                    </div>

                    {/* Replace Button */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="video/*"
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        onClick={handleReplaceVideo}
                        className="w-full bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white h-10 gap-2 rounded-lg"
                    >
                        <Upload className="size-4" />
                        Replace Video
                    </Button>
                </div>

                <div className={cn(
                    "lg:col-span-7 lg:overflow-y-auto scrollbar-hide bg-[#09090b]",
                    isEmbedded ? "p-10" : "p-10 md:p-12"
                )}>
                    <div className="space-y-4 md:space-y-6 w-full">

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Testimonial Title</label>
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
                                            className={`size-6 transition-colors ${rating > 0 && star <= rating
                                                ? "fill-amber-500 text-amber-500 drop-shadow-sm"
                                                : "fill-zinc-800/50 text-zinc-700 group-hover:text-zinc-500"
                                                }`}
                                            strokeWidth={rating > 0 && star <= rating ? 0 : 1.5}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Message</label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your testimonial message here..."
                                className="bg-zinc-900/50 border-zinc-800 min-h-[100px] text-zinc-200 placeholder:text-zinc-600 focus:ring-zinc-700 resize-none rounded-lg"
                            />
                            <p className="text-xs text-zinc-500 flex items-center gap-1">
                                <span className="inline-block size-1 bg-zinc-600 rounded-full" />
                                Enter the testimonial message. Tip: Select text to highlight your favorite parts.
                            </p>
                        </div>



                        {/* Source Row */}
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-5 space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Testimonial Source</label>
                                <Select value={source} onValueChange={setSource}>
                                    <SelectTrigger className="w-full h-10 bg-zinc-900 border-zinc-800 text-zinc-300 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <SelectValue placeholder="Source" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300 [&_[data-radix-select-viewport]]:max-h-[200px]">
                                        <SelectItem value="creet">
                                            <div className="flex items-center gap-2">
                                                <img src="/logo.svg" alt="Logo" className="size-4" />
                                                <span>Creet</span>
                                            </div>
                                        </SelectItem>
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
                            <div className="col-span-7 space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Source URL</label>
                                <Input
                                    value={postUrl}
                                    onChange={(e) => setPostUrl(e.target.value)}
                                    placeholder="https://creet.com"
                                    className="w-full bg-zinc-900 border-zinc-800 h-10 text-zinc-200 placeholder:text-zinc-600 focus:ring-zinc-700 rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Date</label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="bg-zinc-900 border-zinc-800 h-10 text-zinc-200 placeholder:text-zinc-600 focus:ring-zinc-700 pl-4 rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full bg-white text-black hover:bg-zinc-200 h-11 font-bold rounded-lg shadow-lg shadow-zinc-950/20 transition-all disabled:opacity-50"
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
