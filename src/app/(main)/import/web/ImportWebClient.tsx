"use client";

import { useState } from "react";
import { BrandIcon } from "@/lib/brands";
import ImportBanner from "@/components/import/ImportBanner";
import { notifyWebImportAction } from "@/lib/actions/import-notify";
import { toast } from "sonner";

type Source = {
    id: string;
    label: string;
    image: string; // Kept for prop compatibility but unused
};

interface ImportWebClientProps {
    sources: Source[];
}

export default function ImportWebClient({ sources }: ImportWebClientProps) {
    const [selectedSource, setSelectedSource] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedSourceData = sources.find(s => s.id === selectedSource);

    const handleImport = async (url: string) => {
        if (!selectedSourceData) return;

        setIsSubmitting(true);
        try {
            const result = await notifyWebImportAction(selectedSourceData.id, url);

            if (result.success) {
                toast.success("Import request received!", {
                    description: "We'll process your import and notify you when it's ready.",
                });
            } else {
                toast.error("Failed to submit import request", {
                    description: result.message,
                });
            }
        } catch (error) {
            console.error("Import error:", error);
            toast.error("Something went wrong", {
                description: "Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
            setSelectedSource(null);
        }
    };

    const filteredSources = sources.filter((source) =>
        source.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-full relative">
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-semibold text-white">Import from web</h1>
                <span className="bg-zinc-800 text-zinc-400 text-xs font-medium px-2 py-0.5 rounded-md">
                    {sources.length} sources
                </span>
            </div>
            <p className="text-zinc-500 text-sm mb-6">
                Paste a URL and Creet will import your proof.
            </p>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search sources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]/50 transition-all text-sm"
                />
            </div>

            <ImportBanner
                isOpen={!!selectedSource && !!selectedSourceData}
                onClose={() => setSelectedSource(null)}
                sourceName={selectedSourceData?.label || ''}
                sourceId={selectedSource || ''}
                placeholder={`https://${selectedSourceData?.label.toLowerCase()}.com/...`}
                onSubmit={handleImport}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 mb-8 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pb-4">
                {filteredSources.map((source) => {
                    const isSelected = selectedSource === source.id;

                    return (
                        <button
                            key={source.id}
                            onClick={() => setSelectedSource(isSelected ? null : source.id)}
                            className={`group relative flex items-center gap-3 p-3 w-full rounded-xl transition-all duration-200 border text-left
                                ${isSelected
                                    ? "bg-zinc-800 border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/50"
                                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80"
                                }`}
                            aria-label={`Import from ${source.label}`}
                            aria-pressed={isSelected}
                        >
                            <BrandIcon
                                brandId={source.id}
                                size={32}
                                variant="rounded"
                                showBackground
                            />
                            <span className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                {source.label}
                            </span>
                        </button>
                    );
                })}
            </div>


        </div>
    );
}
