"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { TranscriptEditor } from "../../customer/[customerId]/testimonial-edit/TranscriptEditor";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { TrimVideoModal } from "@/components/dashboard/TrimVideoModal";

interface Attachment {
    type: string;
    url: string;
}

interface VideoTestimonialComponentProps {
    testimonial: any;
    videoUrl: string | undefined;
    isTrimOpen: boolean;
    setIsTrimOpen: (open: boolean) => void;
    handleSaveTrim: (start: number, end: number) => Promise<void>;
    attachments?: Attachment[];
}

export function VideoTestimonialComponent({
    testimonial,
    videoUrl,
    isTrimOpen,
    setIsTrimOpen,
    handleSaveTrim,
    attachments,
}: VideoTestimonialComponentProps) {
    // Filter image attachments (excluding video)
    const imageAttachments = attachments?.filter((a) => a.type === 'image') || [];

    // State for image preview modal
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <div className="flex flex-col min-h-[200px] h-full">
            <div className="space-y-4 flex-1">
                {/* Testimonial Title - Show if present */}
                {testimonial.raw?.data?.title && (
                    <h3 className="text-lg font-semibold text-white">{testimonial.raw.data.title}</h3>
                )}

                <div className="flex flex-col md:flex-row gap-4">
                    {/* Video Player */}
                    {videoUrl ? (
                        <div className="w-full md:w-[40%] rounded-lg overflow-hidden bg-black aspect-video relative group shadow-lg ring-1 ring-zinc-800">
                            {isTrimOpen ? (
                                <TrimVideoModal
                                    videoUrl={videoUrl}
                                    poster={testimonial.videoThumbnail}
                                    isOpen={isTrimOpen}
                                    onClose={() => setIsTrimOpen(false)}
                                    onSave={handleSaveTrim}
                                    startTime={testimonial.raw?.data?.trim_start}
                                    endTime={testimonial.raw?.data?.trim_end}
                                />
                            ) : (
                                <VideoPlayer
                                    url={videoUrl}
                                    poster={testimonial.videoThumbnail}
                                    trimStart={testimonial.raw?.data?.trim_start}
                                    trimEnd={testimonial.raw?.data?.trim_end}
                                    showControls={false}
                                    showPlayPauseButton={true}
                                    overlayOnHoverOnly={false}
                                    showDurationBadge={true}
                                    showProgressBar={true}
                                    showVolumeControl={true}
                                    showFullscreenButton={true}
                                    className="w-full h-full"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="w-full md:w-[40%] aspect-video bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-600">
                            No Video Content
                        </div>
                    )}

                    {/* Transcript */}
                    <div className="flex-1 space-y-2">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">TRANSCRIPT</h4>
                        <TranscriptEditor
                            initialText={testimonial.text}
                            testimonialId={testimonial.id}
                        />
                    </div>
                </div>

                {/* Attachments Section - Only show if image attachments exist */}
                {imageAttachments.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">ATTACHMENTS</h4>
                        <div className="flex items-center gap-3 flex-wrap">
                            {imageAttachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedImage(attachment.url)}
                                    className="size-16 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center ring-1 ring-zinc-700 hover:ring-zinc-500 hover:scale-105 transition-all cursor-pointer"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={attachment.url}
                                        alt={`Attachment ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Source and Date */}
                {(testimonial.source || testimonial.date) && (
                    <div className="flex items-center gap-3 text-xs text-zinc-500 pt-2">
                        {testimonial.source && (
                            <span className="flex items-center gap-1.5">
                                <span className="text-zinc-600">Source:</span>
                                <span className="text-zinc-400">{testimonial.source}</span>
                            </span>
                        )}
                        {testimonial.date && (
                            <span className="text-zinc-600">• {testimonial.date}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Image Preview Popup */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative bg-zinc-900 rounded-xl p-2 shadow-2xl border border-zinc-700 max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors border border-zinc-600"
                        >
                            <X className="size-4" />
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={selectedImage}
                            alt="Full size attachment"
                            className="max-w-full max-h-[400px] object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
