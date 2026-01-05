"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Video, Upload, ChevronDown, Star, Calendar, Check, Loader2, User, Image as ImageIcon, X } from "lucide-react";
import { uploadImageToStorage } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createTestimonial, updateTestimonialContent } from "@/lib/actions/testimonials";
import { VIDEO_LIMITS, IMAGE_LIMITS, getVideoDuration } from "@/lib/constants/limits";

// Email validation helper
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

interface VideoTestimonialFormProps {
    rating: number;
    setRating: (rating: number) => void;
    initialData?: any;
    testimonialId?: string | number;
    isEditing?: boolean;
    onSuccess?: () => void;
}

export function VideoTestimonialForm({ rating, setRating, initialData, testimonialId, isEditing, onSuccess }: VideoTestimonialFormProps) {
    const [isPending, startTransition] = useTransition();
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showCompanyDetails, setShowCompanyDetails] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [name, setName] = useState(initialData?.customer_name || "");
    const [tagline, setTagline] = useState(initialData?.customer_headline || initialData?.profession || "");
    const [email, setEmail] = useState(initialData?.customer_email || "");
    const [company, setCompany] = useState(initialData?.company?.name || initialData?.company_name || "");
    const [message, setMessage] = useState(initialData?.message || initialData?.testimonial_message || "");
    const [date, setDate] = useState(initialData?.testimonial_date || initialData?.date || new Date().toISOString().split('T')[0]);
    const [originalPostUrl, setOriginalPostUrl] = useState(initialData?.original_post_url || "");
    const [source, setSource] = useState(initialData?.source || "manual");

    // File Upload States
    const [videoUrl, setVideoUrl] = useState(initialData?.video_url || initialData?.media?.video_url || "");
    const [avatarUrl, setAvatarUrl] = useState(initialData?.customer_avatar_url || initialData?.avatar_url || initialData?.media?.avatar_url || "");
    const [companyLogoUrl, setCompanyLogoUrl] = useState(initialData?.company_logo_url || initialData?.company?.logo_url || "");
    const [localVideoPreview, setLocalVideoPreview] = useState<string | null>(null);

    // State for project ID (Project-First Storage)
    const [projectId, setProjectId] = useState<string | null>(null);

    // Fetch active project ID on mount
    useEffect(() => {
        import("@/lib/actions/projects").then(({ getActiveProjectId }) => {
            getActiveProjectId().then(id => {
                if (id) setProjectId(id);
            });
        });
    }, []);

    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const videoInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'avatar' | 'logo') => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (type === 'video') setIsUploadingVideo(true);
        else if (type === 'avatar') setIsUploadingAvatar(true);
        else setIsUploadingLogo(true);

        try {
            if (type === 'video') {
                // Validate Video Limits
                if (file.size > VIDEO_LIMITS.MAX_FILE_SIZE_BYTES) {
                    throw new Error(`Video file too large. Max size is ${VIDEO_LIMITS.MAX_FILE_SIZE_DISPLAY}.`);
                }

                // Check duration
                try {
                    const duration = await getVideoDuration(file);
                    if (duration > VIDEO_LIMITS.MAX_DURATION_SECONDS) {
                        throw new Error(`Video is too long. Max duration is ${VIDEO_LIMITS.MAX_DURATION_DISPLAY}.`);
                    }
                } catch (e: any) {
                    // If we can't determine duration (e.g. format issue), we might still let it pass if size is ok,
                    // or strictly block it. Since size limit is generous, let's strictly block if we are sure it's too long.
                    // But if getVideoDuration fails, it might be a format issue.
                    if (e === "Could not load video metadata") {
                        console.warn("Could not check video duration, proceeding with size check only.");
                    } else {
                        throw e;
                    }
                }

                const { uploadVideo } = await import("@/lib/video-upload");

                // Use Project ID if available (New Architecture), else fallback to authenticated
                const uploadContext: any = projectId
                    ? { type: 'project', projectId: projectId }
                    : { type: 'authenticated' };

                const result = await uploadVideo(file, uploadContext);

                // Store Cloudflare UID for form submission
                setVideoUrl(result.uid);

                // Set local preview to avoid waiting for Cloudflare processing
                const objectUrl = URL.createObjectURL(file);
                setLocalVideoPreview(objectUrl);

            } else {
                // Validate Image Limits
                if (file.size > IMAGE_LIMITS.MAX_FILE_SIZE_BYTES) {
                    throw new Error(`Image file too large. Max size is ${IMAGE_LIMITS.MAX_FILE_SIZE_DISPLAY}.`);
                }

                // Images still go to Supabase
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                const uploadContext: any = projectId
                    ? { type: 'project', projectId: projectId }
                    : (user ? { type: 'user', userId: user.id } : null);

                if (uploadContext) {
                    const result = await uploadImageToStorage({
                        file,
                        context: uploadContext,
                        bucket: 'assets'
                    });
                    if (type === 'avatar') setAvatarUrl(result.url);
                    else setCompanyLogoUrl(result.url);
                }
            }

        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.message || "Upload failed. Please try again.");
            // Don't show preview on failure if it was a validation error
            if (error.message && (error.message.includes("too large") || error.message.includes("too long"))) {
                // clear input
                if (event.target) event.target.value = "";
                return;
            }

            // Fallback preview logic for non-validation errors (e.g. network)
            // But if validation failed, better not to show preview.
            // The original code was very resilient, showing preview even on failure. 
            // I will keep resilient behavior ONLY for network errors, not validation errors.

            // Actually, original code showed preview on ANY error.
            // If I throw "File too large", I definitely shouldn't show it.
            // So I returned early above.

            // For other errors (upload failed), show preview?
            // alert says "Upload failed. Showing preview instead."
            // ok.

            setErrorMessage("Upload failed. Showing preview instead.");
            const objectUrl = URL.createObjectURL(file);
            if (type === 'video') {
                setVideoUrl(objectUrl);
            }
            else if (type === 'avatar') setAvatarUrl(objectUrl);
            else setCompanyLogoUrl(objectUrl);
        } finally {
            if (type === 'video') setIsUploadingVideo(false);
            else if (type === 'avatar') setIsUploadingAvatar(false);
            else setIsUploadingLogo(false);
        }
    };

    const handleSubmit = () => {
        if (!videoUrl) {
            setErrorMessage("Please upload a video. Video is required for video testimonials.");
            return;
        }

        if (!name) {
            setErrorMessage("Please enter a customer name.");
            return;
        }



        if (email && !isValidEmail(email)) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        if (avatarUrl && (avatarUrl.startsWith("blob:") || avatarUrl.startsWith("data:"))) {
            setErrorMessage("Avatar image failed to upload properly. Please try uploading again.");
            return;
        }

        if (companyLogoUrl && (companyLogoUrl.startsWith("blob:") || companyLogoUrl.startsWith("data:"))) {
            setErrorMessage("Company logo failed to upload properly. Please try uploading again.");
            return;
        }

        startTransition(async () => {
            try {
                if (isEditing && testimonialId) {
                    const updateData = {
                        rating,
                        customer_name: name,
                        customer_headline: tagline,
                        customer_email: email,
                        customer_avatar_url: avatarUrl,
                        company: {
                            name: company,
                            logo_url: companyLogoUrl
                        },
                        message,
                        testimonial_date: date,
                        original_post_url: originalPostUrl,
                        source: source.toLowerCase(),
                        video_url: videoUrl
                    };
                    await updateTestimonialContent(testimonialId, updateData);
                    if (onSuccess) onSuccess();
                } else {
                    const formData = {
                        type: 'video',
                        rating,
                        customer_name: name,
                        customer_headline: tagline,
                        customer_email: email,
                        customer_avatar_url: avatarUrl,
                        company_name: company,
                        company_title: "",
                        company_logo_url: companyLogoUrl,
                        testimonial_message: message,
                        testimonial_date: date,
                        original_post_url: originalPostUrl,
                        source: source.toLowerCase(),
                        tags: [],
                        video_url: videoUrl
                    };

                    await createTestimonial(formData);
                    setShowSuccessDialog(true);
                    // Reset form
                    setName("");
                    setTagline("");
                    setEmail("");
                    setCompany("");
                    setMessage("");
                    setRating(0);
                    setDate(new Date().toISOString().split('T')[0]);
                    setOriginalPostUrl("");
                    setSource("manual");

                    // Clear media states
                    setVideoUrl("");
                    setAvatarUrl("");
                    setCompanyLogoUrl("");
                    setLocalVideoPreview(null);

                    // Reset file inputs
                    if (videoInputRef.current) videoInputRef.current.value = "";
                    if (avatarInputRef.current) avatarInputRef.current.value = "";
                    if (logoInputRef.current) logoInputRef.current.value = "";
                }
            } catch (error: any) {
                console.error(error);
                setErrorMessage("Failed to " + (isEditing ? "update" : "import") + ": " + (error.message || "Unknown error"));
            }
        });
    };

    return (
        <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar space-y-6">
            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="bg-[#1C1C1F] border-white/[0.08] text-zinc-50 sm:max-w-sm" style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.1)' }}>
                    <DialogHeader className="flex flex-col items-center justify-center text-center sm:text-center gap-4 py-4">
                        <div className="size-12 rounded-full bg-[#BFFF00]/10 border border-[#BFFF00]/30 flex items-center justify-center">
                            <Check className="size-6 text-[#BFFF00]" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-xl">Import Successful</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                The video testimonial has been added to your collection.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button
                            onClick={() => setShowSuccessDialog(false)}
                            className="bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-semibold min-w-[120px]"
                            style={{ boxShadow: '0 0 20px rgba(191,255,0,0.15)' }}
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Error Dialog */}
            <Dialog open={!!errorMessage} onOpenChange={(open) => !open && setErrorMessage(null)}>
                <DialogContent className="bg-[#1C1C1F] border-red-500/20 text-zinc-50 sm:max-w-sm" style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(220, 38, 38, 0.2), inset 0 1px 0 0 rgba(255,255,255,0.05)' }}>
                    <DialogHeader className="flex flex-col items-center justify-center text-center sm:text-center gap-4 py-4">
                        <div className="size-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                            <X className="size-6 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-xl">Action Required</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                {errorMessage}
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button
                            onClick={() => setErrorMessage(null)}
                            className="bg-white/10 hover:bg-white/20 text-white font-semibold min-w-[120px]"
                        >
                            Okay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Video Upload Section */}
            <div className="space-y-6 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Video Upload</h2>
                </div>

                <div className="space-y-2">
                    <Label className="text-zinc-400 font-medium">Video File <span className="text-red-500">*</span></Label>
                    <input
                        type="file"
                        ref={videoInputRef}
                        className="hidden"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'video')}
                    />
                    <div
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full h-48 border-2 border-dashed border-white/10 rounded-xl bg-[#18181B] flex flex-col items-center justify-center group hover:border-[#BFFF00]/30 hover:bg-[#BFFF00]/5 transition-all cursor-pointer relative overflow-hidden"
                    >
                        {isUploadingVideo ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-[#BFFF00] animate-spin" />
                                <span className="text-zinc-400 text-sm">Uploading video...</span>
                            </div>
                        ) : (localVideoPreview || videoUrl) ? (
                            <div className="relative w-full h-full bg-black flex items-center justify-center">
                                {
                                    localVideoPreview ? (
                                        <video src={localVideoPreview} className="max-h-full max-w-full" controls playsInline />
                                    ) :
                                        (videoUrl.startsWith('http') || videoUrl.startsWith('blob:')) ? (
                                            <video src={videoUrl} className="max-h-full max-w-full" controls playsInline />
                                        ) : (
                                            <iframe
                                                src={`https://iframe.videodelivery.net/${videoUrl}`}
                                                className="w-full h-full"
                                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                                allowFullScreen
                                            ></iframe>
                                        )
                                }
                                <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full cursor-pointer hover:bg-black/80 transition-colors" onClick={(e) => { e.stopPropagation(); videoInputRef.current?.click(); }}>
                                    <Upload className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Video className="w-5 h-5 text-zinc-500 group-hover:text-[#BFFF00]" />
                                </div>
                                <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 mb-1">Click to upload or drag & drop</span>
                                <span className="text-xs text-zinc-600">MP4, MOV, AVI (Max {VIDEO_LIMITS.MAX_FILE_SIZE_DISPLAY}, {VIDEO_LIMITS.MAX_DURATION_DISPLAY})</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-6 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Customer Info</h2>
                </div>

                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-zinc-400 font-medium">Full Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={name} onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Sarah Connor"
                                className="bg-[#18181B] border-white/10 focus:border-white/30 text-zinc-200 placeholder:text-zinc-600 h-10 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400 font-medium">Email Address</Label>
                            <Input
                                type="email"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="sarah@example.com"
                                className="bg-[#18181B] border-white/10 focus:border-white/30 text-zinc-200 placeholder:text-zinc-600 h-10"
                            />
                        </div>
                    </div>

                    {/* Avatar Upload - Compact Row */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-zinc-400 font-medium">Profile Photo</Label>
                        <div className="flex items-center gap-3">
                            <input
                                ref={avatarInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'avatar')}
                            />
                            <Avatar className="w-12 h-12 border border-white/10 shadow-sm rounded-full">
                                {avatarUrl ? (
                                    <AvatarImage src={avatarUrl} alt="Avatar" className="object-cover" />
                                ) : (
                                    <AvatarFallback className="bg-[#18181B] text-zinc-500">
                                        <User className="w-6 h-6" />
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => avatarInputRef.current?.click()}
                                className="bg-[#18181B] border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white h-10"
                            >
                                {isUploadingAvatar ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : null}
                                {avatarUrl ? 'Change image' : 'Pick an image'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Company Details */}
            <div className="space-y-6 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Company Details</h2>
                    <div className="flex items-center gap-3 bg-white/[0.02] px-3 py-1.5 rounded-full border border-white/[0.06] hover:border-white/[0.1] transition-colors">
                        <Label htmlFor="company-details-toggle" className="text-xs text-zinc-400 font-medium cursor-pointer select-none">
                            {showCompanyDetails ? "Details Visible" : "Add Details"}
                        </Label>
                        <Switch
                            id="company-details-toggle"
                            checked={showCompanyDetails}
                            onCheckedChange={setShowCompanyDetails}
                            className="data-[state=checked]:bg-zinc-600 data-[state=unchecked]:bg-zinc-700 border-transparent h-5 w-9 ring-0 focus-visible:ring-2 focus-visible:ring-white/50"
                        />
                    </div>
                </div>

                {showCompanyDetails && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-zinc-400 font-medium">Title</Label>
                                <Input
                                    value={tagline} onChange={(e) => setTagline(e.target.value)}
                                    placeholder="e.g. CMO"
                                    className="bg-[#18181B] border-white/10 focus:border-white/20 text-zinc-200 placeholder:text-zinc-600 h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400 font-medium">Company Name</Label>
                                <Input
                                    value={company} onChange={(e) => setCompany(e.target.value)}
                                    placeholder="TechCorp Inc."
                                    className="bg-[#18181B] border-white/10 focus:border-white/20 text-zinc-200 placeholder:text-zinc-600 h-10"
                                />
                            </div>
                        </div>

                        {/* Company Logo Upload - Compact Row */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-zinc-400 font-medium">Company Logo</Label>
                            <div className="flex items-center gap-3">
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'logo')}
                                />
                                <Avatar className="w-12 h-12 border border-white/10 shadow-sm rounded-lg">
                                    {companyLogoUrl ? (
                                        <AvatarImage src={companyLogoUrl} alt="Logo" className="object-contain p-1" />
                                    ) : (
                                        <AvatarFallback className="bg-[#18181B] text-zinc-500 rounded-lg">
                                            <ImageIcon className="w-6 h-6" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => logoInputRef.current?.click()}
                                    className="bg-[#18181B] border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white h-10"
                                >
                                    {isUploadingLogo ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : null}
                                    {companyLogoUrl ? 'Change logo' : 'Upload logo'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Testimonial Content */}
            <div className="space-y-6 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Testimonial Content</h2>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-zinc-400 font-medium">Rating</Label>
                        <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setRating(s)}
                                    onMouseEnter={() => setHoverRating(s)}
                                    className="focus:outline-none hover:scale-110 active:scale-95 transition-transform p-1 hover:bg-white/5 rounded-md"
                                >
                                    <Star className={`w-6 h-6 ${s <= (hoverRating || rating) ? "fill-amber-400 text-amber-400 drop-shadow-md" : "text-zinc-700 fill-zinc-800"}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-400 font-medium">Summary / Key Quote</Label>
                        <Textarea
                            value={message} onChange={(e) => setMessage(e.target.value)}
                            placeholder="Brief summary or key quote from the video..."
                            className="bg-[#18181B] border-white/10 focus:border-white/20 text-zinc-200 placeholder:text-zinc-600 resize-none min-h-[100px]"
                        />
                        <p className="text-[10px] text-zinc-500">Optional. Add a brief text summary or memorable quote from the video.</p>
                    </div>
                </div>
            </div>

            {/* Verification & Metadata */}
            <div className="space-y-6 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Verification & Metadata</h2>
                </div>

                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-zinc-400 font-medium">Source</Label>
                            <Select value={source} onValueChange={setSource}>
                                <SelectTrigger className="w-full bg-[#18181B] border-white/10 rounded-md h-10 px-3 text-sm text-zinc-200 focus:border-white/30 transition-colors">
                                    <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent position="popper" side="bottom" align="start" avoidCollisions={false} className="bg-[#1C1C1F] border-white/[0.08] text-zinc-200 max-h-[200px]">
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                                    <SelectItem value="tiktok">TikTok</SelectItem>
                                    <SelectItem value="twitter">Twitter / X</SelectItem>
                                    <SelectItem value="youtube">YouTube</SelectItem>
                                    <SelectItem value="zoom">Zoom Recording</SelectItem>
                                    <SelectItem value="loom">Loom</SelectItem>
                                    <SelectItem value="vimeo">Vimeo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-400 font-medium">Date</Label>
                            <Input
                                type="date"
                                value={date} onChange={(e) => setDate(e.target.value)}
                                className="bg-[#18181B] border-white/10 focus:border-white/20 text-zinc-200 placeholder:text-zinc-600 h-10 pl-4 [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-400 font-medium">Original Post URL</Label>
                        <Input
                            value={originalPostUrl} onChange={(e) => setOriginalPostUrl(e.target.value)}
                            placeholder="https://..."
                            className="bg-[#18181B] border-white/10 focus:border-white/20 text-zinc-200 placeholder:text-zinc-600 h-10"
                        />
                        <p className="text-[10px] text-zinc-500">Link to the original video post for verification.</p>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-6 flex justify-end gap-3">
                <Button
                    onClick={handleSubmit}
                    disabled={isPending || isUploadingVideo || isUploadingAvatar || isUploadingLogo}
                    className="bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-semibold px-8"
                    style={{ boxShadow: '0 0 20px rgba(191,255,0,0.15)' }}
                >
                    {isPending ? "Importing..." : (isUploadingVideo || isUploadingAvatar || isUploadingLogo) ? "Uploading..." : "Import Testimonial"}
                </Button>
            </div>
        </div>
    );
}
