"use client";

import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Star,
    Lock,
    Facebook,
    Twitter,
    Linkedin,
    ChevronLeft,
    Download,
    Pencil,
    Check,
    X
} from "lucide-react";

import { useRouter } from "next/navigation";
import { EditVideoTestimonialForm } from "./testimonial-edit/EditVideoTestimonialForm";
import { EditTextTestimonialForm } from "./testimonial-edit/EditTextTestimonialForm";
import { updateTestimonialContent } from "@/lib/actions/testimonials";
import { TestimonialToolbar } from "@/components/dashboard/TestimonialToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { VideoTestimonialComponent, TextTestimonialComponent } from "../../dashboard/TestimonialComponents";

interface Customer {
    id: string;
    email: string;
    fullName: string;
    headline: string;
    avatarUrl: string;
    companyDetails: any;
    socialProfiles: any;
    projectId: string;
    createdAt: string;
}

interface CustomerContentWrapperProps {
    customer: Customer;
    testimonials: any[];
}

export function CustomerContentWrapper({ customer, testimonials: initialTestimonials }: CustomerContentWrapperProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'testimonials' | 'invites' | 'feedback' | 'user-details'>('testimonials');

    // Local state for testimonials
    const [testimonials, setTestimonials] = useState<any[]>(initialTestimonials);

    // Track which testimonial is being edited (by ID)
    const [editingId, setEditingId] = useState<string | number | null>(null);

    // Track which testimonial has trim modal open
    const [trimOpenId, setTrimOpenId] = useState<string | number | null>(null);

    // User Details Edit State
    const [isEditingUserDetails, setIsEditingUserDetails] = useState(false);
    const [editName, setEditName] = useState(customer.fullName || "");
    const [editEmail, setEditEmail] = useState(customer.email || "");
    const [editHeadline, setEditHeadline] = useState(customer.headline || "");
    const [editCompanyName, setEditCompanyName] = useState(customer.companyDetails?.name || "");
    const [editCompanyWebsite, setEditCompanyWebsite] = useState(customer.companyDetails?.website || "");
    const [isSavingUserDetails, setIsSavingUserDetails] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);

    // Get avatar from customer or first testimonial
    const avatarUrl = customer.avatarUrl || testimonials[0]?.avatar || "";

    // Callback to add a new duplicate to local state
    const handleAddDuplicate = (newTestimonial: any, tempId?: number) => {
        setTestimonials(prev => {
            if (tempId) {
                const exists = prev.some(t => t.id === tempId);
                if (exists) {
                    return prev.map(t => t.id === tempId ? newTestimonial : t);
                }
            }
            return [...prev, newTestimonial];
        });
    };

    // Callback to update a testimonial in local state
    const handleUpdateTestimonial = (updatedTestimonial: any) => {
        setTestimonials(prev => prev.map(t => t.id === updatedTestimonial.id ? { ...t, ...updatedTestimonial } : t));
    };

    const [isRedirecting, setIsRedirecting] = useState(false);

    // Callback to remove a testimonial from local state
    const handleRemoveTestimonial = (id: string | number) => {
        setTestimonials(prev => {
            const newState = prev.filter(t => t.id !== id);

            // If we just deleted the last testimonial, redirect to dashboard
            if (newState.length === 0) {
                // Wrap in timeout to avoid "Cannot update component while rendering" error
                // This pushes the state update/navigation to the next event loop tick
                setTimeout(() => {
                    setIsRedirecting(true);
                    router.push("/dashboard");
                }, 0);
            }

            return newState;
        });
    };

    const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
    const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Handle Save User Details - updates the first testimonial (or could update customer table)
    const handleSaveUserDetails = async () => {
        if (testimonials.length === 0) {
            toast.error("No testimonials to update");
            return;
        }

        setIsSavingUserDetails(true);
        setEmailError(null);

        try {
            let finalAvatarUrl = customer.avatarUrl || testimonials[0]?.avatar;

            // Upload new avatar if selected
            if (editAvatarFile) {
                const { uploadImageToStorage } = await import("@/lib/storage");
                const res = await uploadImageToStorage({
                    file: editAvatarFile,
                    context: {
                        type: 'user',
                        userId: customer.id || testimonials[0].user_id, // Use customer ID if available or testimonial user_id
                        namespace: 'avatars'
                    },
                    bucket: 'assets'
                });
                finalAvatarUrl = res.url;
            }

            // Update the first testimonial's user details
            const result: any = await updateTestimonialContent(testimonials[0].id, {
                customer_name: editName,
                customer_email: editEmail,
                customer_headline: editHeadline,
                customer_avatar_url: finalAvatarUrl,
                company: {
                    ...testimonials[0].raw?.data?.company,
                    name: editCompanyName,
                    website: editCompanyWebsite
                }
            });

            if (result && !result.success && result.error) {
                if (result.error.toLowerCase().includes('email')) {
                    setEmailError(result.error);
                    emailInputRef.current?.focus();
                } else {
                    toast.error(result.error);
                }
                return;
            }

            toast.success("User details updated!");
            setIsEditingUserDetails(false);
            setEditAvatarFile(null); // Reset file
            setPreviewAvatarUrl(null); // Reset preview
            router.refresh();
        } catch (err: any) {
            toast.error("Failed to save: " + (err.message || "Unknown error"));
        } finally {
            setIsSavingUserDetails(false);
        }
    };

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditAvatarFile(file);
            setPreviewAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleCancelUserDetailsEdit = () => {
        setEditName(customer.fullName || "");
        setEditEmail(customer.email || "");
        setEditHeadline(customer.headline || "");
        setEditCompanyName(customer.companyDetails?.name || "");
        setEditCompanyWebsite(customer.companyDetails?.website || "");
        setEmailError(null);
        setPreviewAvatarUrl(null);
        setEditAvatarFile(null);
        setIsEditingUserDetails(false);
    };

    const handleSaveTrim = async (testimonialId: string | number, start: number, end: number) => {
        setTrimOpenId(null);
        toast.loading("Saving trim...");
        try {
            await updateTestimonialContent(testimonialId, {
                trim_start: start,
                trim_end: end
            });
            toast.dismiss();
            toast.success("Trim saved successfully!");
            router.refresh();
        } catch (err: any) {
            toast.dismiss();
            toast.error("Failed to save trim: " + err.message);
        }
    };

    // Get company logo from first testimonial if available
    const companyLogo = testimonials[0]?.attachments?.find((a: any) => a.type === 'image')?.url;

    return (
        <div className="relative h-screen flex flex-col bg-[#09090b] text-zinc-50 font-sans overflow-hidden">
            {/* Top Bar / Header */}
            <div className="flex-shrink-0 border-b border-zinc-800 px-6 py-4 flex flex-col gap-6 bg-[#09090b]">
                {/* User Info Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="size-6" />
                        </button>
                        <Avatar className="size-12 bg-zinc-800 ring-2 ring-zinc-800/50">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold text-lg">
                                {customer.fullName?.charAt(0) || "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-white">{customer.fullName}</h1>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                <span>{customer.headline || "Customer"}</span>
                                <div className="flex items-center gap-2">
                                    <Facebook className="size-3 fill-current opacity-60 hover:opacity-100 cursor-pointer" />
                                    <Twitter className="size-3 fill-current opacity-60 hover:opacity-100 cursor-pointer" />
                                    <Linkedin className="size-3 fill-current opacity-60 hover:opacity-100 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white h-9 gap-2 transition-all">
                            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                            Invite to Form
                        </Button>
                        <Button variant="outline" className="bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white h-9 gap-2 transition-all">
                            <Download className="size-4" />
                            Import
                        </Button>
                    </div>
                </div>

                {/* Tabs Row */}
                <div className="flex items-center gap-6 text-sm font-medium pt-2 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'testimonials', label: 'Testimonials', count: testimonials.length },
                        { id: 'invites', label: 'Invites' },
                        { id: 'feedback', label: 'Feedback' },
                        { id: 'user-details', label: 'User Details' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "pb-3 border-b-2 transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "text-white border-white"
                                    : "text-zinc-500 hover:text-zinc-300 border-transparent hover:border-zinc-700"
                            )}
                        >
                            {tab.label} {tab.count ? `(${tab.count})` : ''}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
                {activeTab === 'testimonials' && (
                    <div className="max-w-[1400px] mx-auto space-y-8">
                        {isRedirecting ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 animate-pulse">
                                <div className="size-8 rounded-full border-2 border-zinc-800 border-t-zinc-400 animate-spin" />
                                <p className="text-zinc-500">Redirecting to dashboard...</p>
                            </div>
                        ) : testimonials.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                                <div className="bg-zinc-900 p-4 rounded-full ring-1 ring-zinc-800">
                                    <Lock className="size-8 text-zinc-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Testimonials Yet</h3>
                                    <p className="text-zinc-500 max-w-sm">
                                        This customer hasn&apos;t provided any testimonials yet.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            testimonials.map((testimonial, index) => {
                                const isVideo = testimonial.type === 'video' || testimonial.attachments?.some((a: any) => a.type === 'video');
                                const videoUrl = testimonial.attachments?.find((a: any) => a.type === 'video')?.url || testimonial.video_url || testimonial.videoUrl;
                                const isEditing = testimonial.id === editingId;
                                const isTrimOpen = testimonial.id === trimOpenId;

                                return (
                                    <div key={testimonial.id}>
                                        <div className="bg-[#18181b] border border-zinc-800/50 shadow-xl rounded-xl overflow-hidden text-zinc-50">
                                            {/* Card Header */}
                                            <div className="p-6 pb-4 flex items-start justify-between border-b border-zinc-800/30">
                                                <div className="flex items-center gap-3">
                                                    {!isEditing && (
                                                        <div className="flex gap-1 text-amber-500">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star key={i} className={`size-5 ${i < testimonial.rating ? "fill-current" : "text-zinc-700 fill-zinc-700"}`} />
                                                            ))}
                                                        </div>
                                                    )}
                                                    {isVideo ? (
                                                        <Badge className="bg-[#2E2335] text-[#D8B4FE] hover:bg-[#3E2F46] border border-purple-500/10 font-medium px-2.5 py-0.5 rounded-full">
                                                            Video
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-[#1E293B] text-[#93C5FD] hover:bg-[#1E3A5F] border border-blue-500/10 font-medium px-2.5 py-0.5 rounded-full">
                                                            Text
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-zinc-500 text-sm">Collected {testimonial.date}</span>
                                            </div>

                                            {/* Card Content */}
                                            <div className="px-6 py-6">
                                                {isEditing ? (
                                                    <div className="w-full animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {isVideo ? (
                                                            <EditVideoTestimonialForm
                                                                testimonial={testimonial}
                                                                onClose={() => setEditingId(null)}
                                                                isEmbedded={true}
                                                                onUpdate={handleUpdateTestimonial}
                                                            />
                                                        ) : (
                                                            <EditTextTestimonialForm
                                                                testimonial={testimonial}
                                                                onClose={() => setEditingId(null)}
                                                                isEmbedded={true}
                                                                onUpdate={handleUpdateTestimonial}
                                                            />
                                                        )}
                                                    </div>
                                                ) : (
                                                    isVideo ? (
                                                        <VideoTestimonialComponent
                                                            testimonial={testimonial}
                                                            videoUrl={videoUrl}
                                                            isTrimOpen={isTrimOpen}
                                                            setIsTrimOpen={(open) => setTrimOpenId(open ? testimonial.id : null)}
                                                            handleSaveTrim={(start, end) => handleSaveTrim(testimonial.id, start, end)}
                                                            attachments={testimonial.attachments}
                                                        />
                                                    ) : (
                                                        <TextTestimonialComponent
                                                            testimonial={testimonial}
                                                            attachments={testimonial.attachments}
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* Toolbar - Only visible when NOT editing */}
                                        {!isEditing && (
                                            <div className="bg-[#18181b] border border-t-0 border-zinc-800/50 rounded-b-xl overflow-hidden">
                                                <TestimonialToolbar
                                                    testimonialId={testimonial.id}
                                                    isVideo={isVideo}
                                                    onEdit={() => setEditingId(testimonial.id)}
                                                    onTrim={isVideo ? () => setTrimOpenId(testimonial.id) : undefined}
                                                    onDuplicate={handleAddDuplicate}
                                                    onDelete={handleRemoveTestimonial}
                                                    testimonialData={testimonial}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'invites' && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-20">
                        <div className="bg-zinc-900 p-4 rounded-full ring-1 ring-zinc-800">
                            <Lock className="size-8 text-zinc-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Invites Coming Soon</h3>
                            <p className="text-zinc-500 max-w-sm">
                                We&apos;re working on bringing you powerful invite management features. Stay tuned!
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-20">
                        <div className="bg-zinc-900 p-4 rounded-full ring-1 ring-zinc-800">
                            <Lock className="size-8 text-zinc-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Feedback Coming Soon</h3>
                            <p className="text-zinc-500 max-w-sm">
                                Advanced feedback collection and analytics are on the way.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'user-details' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-white">User Information</h3>
                                {!isEditingUserDetails ? (
                                    <button
                                        onClick={() => setIsEditingUserDetails(true)}
                                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                        title="Edit user details"
                                    >
                                        <Pencil className="size-4" />
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleCancelUserDetailsEdit}
                                            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                            title="Cancel"
                                        >
                                            <X className="size-4" />
                                        </button>
                                        <button
                                            onClick={handleSaveUserDetails}
                                            disabled={isSavingUserDetails}
                                            className="p-2 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
                                            title="Save changes"
                                        >
                                            <Check className="size-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-6 pb-2">
                                <div className="relative group">
                                    <Avatar className={cn(
                                        "size-20 bg-zinc-800 ring-2 ring-zinc-700 transition-all",
                                        isEditingUserDetails && "ring-indigo-500 cursor-pointer hover:ring-indigo-400 opacity-90 hover:opacity-100"
                                    )}
                                        onClick={() => isEditingUserDetails && avatarInputRef.current?.click()}
                                    >
                                        <AvatarImage src={previewAvatarUrl || avatarUrl} className="object-cover" />
                                        <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold text-2xl">
                                            {customer.fullName?.charAt(0) || "?"}
                                        </AvatarFallback>

                                        {isEditingUserDetails && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                                <Pencil className="size-6 text-white" />
                                            </div>
                                        )}
                                    </Avatar>
                                    <input
                                        type="file"
                                        ref={avatarInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarFileChange}
                                    />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-zinc-500 mb-1">Profile Picture</div>
                                    <div className="text-xs text-zinc-600">
                                        {isEditingUserDetails ? "Click to change photo" : "This image will be displayed with the testimonial."}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 border-t border-zinc-800/50 pt-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500">Full Name</label>
                                    {isEditingUserDetails ? (
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="bg-zinc-900 border-zinc-700 text-zinc-200"
                                            placeholder="Enter full name"
                                        />
                                    ) : (
                                        <div className="text-zinc-200 font-medium">{customer.fullName}</div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500">Email</label>
                                    {isEditingUserDetails ? (
                                        <div className="space-y-1">
                                            <Input
                                                ref={emailInputRef}
                                                value={editEmail}
                                                onChange={(e) => {
                                                    setEditEmail(e.target.value);
                                                    if (emailError) setEmailError(null);
                                                }}
                                                className={cn(
                                                    "bg-zinc-900 border-zinc-700 text-zinc-200",
                                                    emailError && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                )}
                                                placeholder="Enter email"
                                                type="email"
                                            />
                                            {emailError && (
                                                <p className="text-xs text-red-400 flex items-center gap-1">
                                                    <span className="inline-block size-1 rounded-full bg-red-400"></span>
                                                    {emailError}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-zinc-200">{customer.email || ""}</div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500">Headline / Job Title</label>
                                    {isEditingUserDetails ? (
                                        <Input
                                            value={editHeadline}
                                            onChange={(e) => setEditHeadline(e.target.value)}
                                            className="bg-zinc-900 border-zinc-700 text-zinc-200"
                                            placeholder="Enter headline or job title"
                                        />
                                    ) : (
                                        <div className="text-zinc-200">{customer.headline || ""}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-white">Company Information</h3>
                                {!isEditingUserDetails && (
                                    <button
                                        onClick={() => setIsEditingUserDetails(true)}
                                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                        title="Edit company details"
                                    >
                                        <Pencil className="size-4" />
                                    </button>
                                )}
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500">Company Name</label>
                                    {isEditingUserDetails ? (
                                        <Input
                                            value={editCompanyName}
                                            onChange={(e) => setEditCompanyName(e.target.value)}
                                            className="bg-zinc-900 border-zinc-700 text-zinc-200"
                                            placeholder="Enter company name"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {companyLogo && (
                                                <div className="size-6 rounded bg-zinc-800 overflow-hidden flex items-center justify-center">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={companyLogo} alt="Company Logo" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="text-zinc-200">{customer.companyDetails?.name || ""}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-500">Website</label>
                                    {isEditingUserDetails ? (
                                        <Input
                                            value={editCompanyWebsite}
                                            onChange={(e) => setEditCompanyWebsite(e.target.value)}
                                            className="bg-zinc-900 border-zinc-700 text-zinc-200"
                                            placeholder="https://example.com"
                                            type="url"
                                        />
                                    ) : (
                                        <a href={customer.companyDetails?.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline block truncate transition-colors">
                                            {customer.companyDetails?.website || ""}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
