"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Edit2, Mail, Trash2, Video, MessageSquare, Twitter, Linkedin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface TestimonialRowCardProps {
    testimonial: {
        id: number | string;
        customer_id?: string | null;  // Direct FK - no extra DB call needed
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
    };
    onStatusChange: (id: string | number) => void;
    onDelete: (id: string | number) => void;
    onEdit: (id: string | number) => void;
    onCopy: (text: string) => void;
    selected: boolean;
    onSelect: () => void;
}

const getSourceName = (source: string): string => {
    const s = source.toLowerCase();
    if (s.includes("twitter") || s.includes("x")) return "Twitter";
    if (s.includes("linkedin")) return "LinkedIn";
    if (s.includes("video")) return "Video";
    if (s.includes("email")) return "Email";
    if (s.includes("manual")) return "Manual";
    if (s.includes("facebook")) return "Facebook";
    if (s.includes("google")) return "Google";
    if (s.includes("airbnb")) return "Airbnb";
    if (s.includes("amazon")) return "Amazon";
    if (s.includes("app-store") || s.includes("appstore")) return "App Store";
    if (s.includes("chrome")) return "Chrome Web Store";
    if (s.includes("google-play") || s.includes("playstore")) return "Google Play";
    // Return capitalized version if no match
    return source.charAt(0).toUpperCase() + source.slice(1);
};

import { getBrandIcon, BRAND_ICONS } from "@/lib/brands/icons";

const SourceIcon = ({ source }: { source: string }) => {
    const s = source.toLowerCase();

    // Fallbacks for generic types (Manual, Video, Email) - Keep existing behavior as requested
    if (s.includes("manual")) return <MessageSquare className="size-4" />;
    if (s.includes("video")) return <Video className="size-4" />;
    if (s.includes("email")) return <Mail className="size-4" />;

    // Try to get a brand icon
    // We normalize locally to check existence, similar to getBrandIcon logic
    const normalized = s.trim().replace(/[\s-]/g, '_');
    const isKnownBrand = (normalized in BRAND_ICONS) || normalized === 'twitter' || normalized === 'x';

    if (isKnownBrand) {
        const Icon = getBrandIcon(source);
        return <Icon className="size-5" />;
    }

    // Default fallback
    return <MessageSquare className="size-4" />;
};

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

const getSourceStyles = (source: string): string => {
    const s = source.toLowerCase();
    if (s.includes("twitter") || s.includes("x")) return "bg-sky-500/10 border-sky-500/20 text-sky-500 hover:bg-sky-500/20 hover:border-sky-500/30";
    if (s.includes("linkedin")) return "bg-blue-600/10 border-blue-600/20 text-blue-500 hover:bg-blue-600/20 hover:border-blue-600/30";
    // Video/Email colors
    if (s.includes("video")) return "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/30";
    if (s.includes("email")) return "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/30";

    return "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700";
};

// Use the reusable VideoPlayer component
import { VideoPlayer } from "@/components/ui/VideoPlayer";

const VideoPreview = ({ url, poster, trimStart, trimEnd }: { url: string; poster?: string; trimStart?: number; trimEnd?: number }) => {
    return (
        <VideoPlayer
            url={url}
            poster={poster}
            trimStart={trimStart}
            trimEnd={trimEnd}
            showControls={false}
            showPlayPauseButton={true}
            overlayOnHoverOnly={false}
            showDurationBadge={true}
            showRelativeTime={true}
            className="rounded-xl border border-zinc-800 bg-black/40 w-[140px] aspect-video flex-shrink-0"
        />
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const s = status.toLowerCase();

    if (s === 'public' || s === 'approved') {
        return (
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium shadow-[0_0_10px_-3px_rgba(74,222,128,0.3)]">
                Public
            </span>
        );
    }
    if (s === 'hidden' || s === 'rejected') {
        return (
            <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-medium">
                Hidden
            </span>
        );
    }
    if (s === 'pending') {
        return (
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">
                Pending
            </span>
        );
    }
    return (
        <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium">
            {status}
        </span>
    );
};

export function TestimonialRowCard({ testimonial, onStatusChange, onDelete, onEdit, onCopy, selected, onSelect }: TestimonialRowCardProps) {
    const router = useRouter();

    const handleRowClick = () => {
        // Use customer_id directly from testimonial data (no extra DB call needed!)
        if (testimonial.customer_id) {
            router.push(`/customer/${testimonial.customer_id}`);
        } else {
            // Fallback: if no customer found, navigate to specific testimonial view
            router.push(`/customer/t-${testimonial.id}`);
        }
    };

    return (
        <tr
            className={cn(
                "group flex items-center border-b border-zinc-800/50 last:border-0 transition-all duration-200 w-full cursor-pointer",
                selected ? "bg-indigo-900/20 hover:bg-indigo-900/30" : "bg-zinc-950/30 hover:bg-zinc-900/40"
            )}
            onClick={handleRowClick}
        >
            {/* Checkbox Column */}
            <td className="p-0 w-[60px] flex-shrink-0">
                <div className="flex items-center justify-center px-4 py-10" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={selected}
                        onCheckedChange={() => onSelect()}
                        id={`select-${testimonial.id}`}
                    />
                </div>
            </td>
            {/* Reviewer Info */}
            <td className="p-0">
                <div className="flex items-start gap-4 w-[220px] px-4 py-8">
                    <Avatar className="size-10 rounded-full ring-2 ring-zinc-800/50 group-hover:ring-zinc-700/70 transition-all">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback className="font-bold text-sm text-[#5b6bf9]" style={{ backgroundColor: '#1634f92e' }}>
                            {getInitials(testimonial.reviewer)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                        <h3 className="font-bold text-zinc-100 text-sm leading-tight truncate">{testimonial.reviewer}</h3>
                        <p className="text-xs text-zinc-500 leading-tight truncate">{testimonial.email}</p>
                        <p className="text-xs text-zinc-400 font-medium leading-tight truncate">{testimonial.profession}</p>

                        <div className="flex gap-0.5 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "size-3 flex-shrink-0",
                                        i < testimonial.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-800 text-zinc-800"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </td>

            {/* Vertical Divider */}
            <td className="p-0">
                <div className="w-px h-28 bg-zinc-800/50 block" />
            </td>

            {/* Content Section */}
            {/* Content Section */}
            <td className="block p-0 self-stretch flex-1 min-w-0">
                <div className="px-4 py-8 h-full flex flex-col justify-start min-w-[250px]">
                    <p className="text-zinc-300 text-sm leading-relaxed line-clamp-2 w-full break-words">
                        {testimonial.text}
                    </p>

                    {/* Attachments Container */}
                    <div className="flex flex-wrap items-end gap-3 mt-3">
                        {/* Video Preview - Larger Display */}
                        {(testimonial.type.toLowerCase() === 'video' || testimonial.attachments?.some(a => a.type === 'video')) && (
                            (() => {
                                const vid = testimonial.attachments?.find(a => a.type === 'video');
                                if (vid) {
                                    return (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <VideoPreview url={vid.url} poster={testimonial.videoThumbnail} trimStart={testimonial.trimStart} trimEnd={testimonial.trimEnd} />
                                        </div>
                                    );
                                }
                                return null;
                            })()
                        )}

                        {/* Other Attachments */}
                        {testimonial.attachments && testimonial.attachments.length > 0 && (
                            <div className="flex items-center gap-2">
                                {testimonial.attachments.filter(a => testimonial.type.toLowerCase() !== 'video' || a.type !== 'video').map((att, i) => (
                                    <div key={i} className="size-9 rounded-lg border border-zinc-800 bg-zinc-900/50 flex items-center justify-center overflow-hidden relative group/attachment">
                                        {att.type === 'image' ? (
                                            <img src={att.url} alt="Attachment" className="w-full h-full object-contain p-1" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                                <Video className="size-3 text-zinc-500" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </td>

            {/* Vertical Divider */}
            <td className="p-0">
                <div className="w-px h-24 bg-zinc-800/50 block" />
            </td>

            {/* Meta Section */}
            <td className="p-0">
                <div className="flex items-center gap-2 flex-shrink-0 px-4 py-8">
                    {/* Source */}
                    <div className="flex items-center justify-center w-[60px]">
                        <div className="relative group/tooltip">
                            <div className={cn(
                                "size-8 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-default",
                                getSourceStyles(testimonial.source)
                            )}>
                                <SourceIcon source={testimonial.source} />
                            </div>
                            <div className="absolute bottom-full right-[-50%] translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-zinc-900 border border-zinc-800 rounded-md shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {getSourceName(testimonial.source)}
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="w-[80px] flex justify-center cursor-pointer" onClick={(e) => { e.stopPropagation(); onStatusChange(testimonial.id); }}>
                        <StatusBadge status={testimonial.status} />
                    </div>

                    {/* Date */}
                    <span className="text-xs text-zinc-500 font-mono w-[100px] flex justify-center block">
                        {testimonial.date}
                    </span>

                    {/* Actions */}
                    <div className="w-[100px] flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onCopy(testimonial.text)}
                            className="size-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                        >
                            <Copy className="size-3.5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onEdit(testimonial.id)}
                            className="size-8 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        >
                            <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(testimonial.id)}
                            className="size-8 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </div>
                </div>
            </td>
        </tr>
    );
}
