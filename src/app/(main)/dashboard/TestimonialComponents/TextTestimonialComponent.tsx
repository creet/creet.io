"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Attachment {
    type: string;
    url: string;
}

interface TextTestimonialComponentProps {
    testimonial: any;
    attachments?: Attachment[];
}

export function TextTestimonialComponent({
    testimonial,
    attachments,
}: TextTestimonialComponentProps) {
    // Filter image attachments
    const imageAttachments = attachments?.filter((a) => a.type === 'image') || [];

    // Preview modal state
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    return (
        <>
            <div className="flex flex-col min-h-[150px] h-full">
                {/* Main Content */}
                <div className="space-y-4 flex-1">
                    {/* Testimonial Title - Show if present */}
                    {testimonial.raw?.data?.title && (
                        <h3 className="text-lg font-semibold text-white">{testimonial.raw.data.title}</h3>
                    )}

                    {/* Testimonial Text Content - Simple display */}
                    <p className="text-zinc-200 text-base leading-relaxed">
                        <span className="text-zinc-500 text-lg">"</span>
                        {testimonial.text}
                        <span className="text-zinc-500 text-lg">"</span>
                    </p>

                    {/* Attachments - Compact display, only if present */}
                    {imageAttachments.length > 0 && (
                        <div className="flex items-center gap-2 pt-2">
                            {imageAttachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    className="size-10 rounded-md bg-zinc-800 overflow-hidden flex items-center justify-center ring-1 ring-zinc-700 cursor-pointer hover:ring-zinc-500 transition-all"
                                    onClick={() => setPreviewUrl(attachment.url)}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={attachment.url}
                                        alt={`Attachment ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                            {testimonial.raw?.data?.company?.name && (
                                <span className="text-xs text-zinc-500">{testimonial.raw.data.company.name}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Source and Date - Just above divider */}
                {(testimonial.source || testimonial.date) && (
                    <div className="flex items-center gap-3 text-xs text-zinc-500 pt-4">
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

            {/* Attachment Preview Modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setPreviewUrl(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] p-4">
                        <button
                            onClick={() => setPreviewUrl(null)}
                            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                        >
                            <X className="size-5" />
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewUrl}
                            alt="Attachment Preview"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

