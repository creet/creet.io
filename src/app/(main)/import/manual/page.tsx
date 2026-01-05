"use client";

import { useState } from "react";
import { FileText, Video } from "lucide-react";
import { TextTestimonialForm } from "./TextTestimonialForm";
import { VideoTestimonialForm } from "./VideoTestimonialForm";

// Reusable shadow presets from Creed Design System v2.2
const shadows = {
    level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
    level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
};

export default function ManualImportPage() {
    const [importType, setImportType] = useState<"text" | "video">("text");
    const [rating, setRating] = useState(0);

    return (
        <div className="h-full flex justify-center items-start py-6 px-4 md:px-8 bg-[#09090B] overflow-hidden">
            <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 h-full">

                {/* Left Sidebar - Type Selection */}
                <div
                    className="lg:w-64 shrink-0 h-fit bg-[#0F0F11] border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden"
                    style={{ boxShadow: shadows.level1 }}
                >
                    {/* Subtle gradient overlay for warmth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#BFFF00]/[0.02] via-transparent to-transparent pointer-events-none rounded-2xl" />

                    <div className="relative space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-lg font-semibold text-white tracking-[-0.01em]">Manual Import</h1>
                            <p className="text-xs text-zinc-500 mt-1">Add testimonials directly</p>
                        </div>

                        {/* Type Selection */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Type</p>

                            {/* Text Testimonial Option */}
                            <button
                                onClick={() => setImportType("text")}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group ${importType === "text"
                                    ? "bg-[#BFFF00]/10 border-[#BFFF00]/30 text-white"
                                    : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.04] hover:border-white/[0.1] hover:text-zinc-200"
                                    }`}
                                style={importType === "text" ? { boxShadow: '0 0 20px rgba(191,255,0,0.08)' } : {}}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${importType === "text"
                                    ? "bg-[#BFFF00] text-black"
                                    : "bg-white/[0.04] text-zinc-500 group-hover:text-zinc-300"
                                    }`}>
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium">Text</p>
                                    <p className="text-[10px] text-zinc-500">Written review</p>
                                </div>
                                {importType === "text" && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-[#BFFF00]" />
                                )}
                            </button>

                            {/* Video Testimonial Option */}
                            <button
                                onClick={() => setImportType("video")}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group ${importType === "video"
                                    ? "bg-[#BFFF00]/10 border-[#BFFF00]/30 text-white"
                                    : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.04] hover:border-white/[0.1] hover:text-zinc-200"
                                    }`}
                                style={importType === "video" ? { boxShadow: '0 0 20px rgba(191,255,0,0.08)' } : {}}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${importType === "video"
                                    ? "bg-[#BFFF00] text-black"
                                    : "bg-white/[0.04] text-zinc-500 group-hover:text-zinc-300"
                                    }`}>
                                    <Video className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium">Video</p>
                                    <p className="text-[10px] text-zinc-500">Video recording</p>
                                </div>
                                {importType === "video" && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-[#BFFF00]" />
                                )}
                            </button>
                        </div>

                        {/* Info Card */}
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                                Import testimonials you've received through email, social media, or other channels.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form Content */}
                <div
                    className="flex-1 bg-[#0F0F11] border border-white/[0.06] rounded-2xl overflow-hidden relative flex flex-col h-full"
                    style={{ boxShadow: shadows.level2 }}
                >
                    {/* Subtle gradient overlay for warmth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#BFFF00]/[0.01] via-transparent to-transparent pointer-events-none rounded-2xl" />

                    {/* Form Header - Minimal */}
                    <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] relative flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${importType === "text" ? "bg-[#BFFF00]/10" : "bg-[#BFFF00]/10"
                                }`}>
                                {importType === "text" ? (
                                    <FileText className="w-4 h-4 text-[#BFFF00]" />
                                ) : (
                                    <Video className="w-4 h-4 text-[#BFFF00]" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-base font-medium text-white">
                                    {importType === "text" ? "Text Testimonial" : "Video Testimonial"}
                                </h2>
                                <p className="text-xs text-zinc-500">Fill in the details below</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 relative flex flex-col overflow-hidden">
                        {importType === "text" ? (
                            <TextTestimonialForm rating={rating} setRating={setRating} />
                        ) : (
                            <VideoTestimonialForm rating={rating} setRating={setRating} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
