"use client";

import { useState } from "react";
import { Globe, FileSpreadsheet, PenTool, Chrome, ExternalLink } from "lucide-react";
import Link from "next/link";
import { BrandIcon } from "@/lib/brands";
import ImportModal from "@/components/import/ImportModal";
import { notifySpreadsheetImportAction } from "@/lib/actions/import-notify";
import { toast } from "sonner";

export default function ImportPage() {
    const [showSpreadsheetModal, setShowSpreadsheetModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSpreadsheetUpload = async (file: string | File) => {
        if (!(file instanceof File)) {
            console.error("Expected a File but received:", file);
            return;
        }

        setIsSubmitting(true);
        try {
            // Create FormData to send file to server action
            const formData = new FormData();
            formData.append('file', file);

            const result = await notifySpreadsheetImportAction(formData);

            if (result.success) {
                toast.success("Spreadsheet upload received!", {
                    description: "We'll process your import and notify you when it's ready.",
                });
            } else {
                toast.error("Failed to submit import request", {
                    description: result.message,
                });
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Something went wrong", {
                description: "Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
            setShowSpreadsheetModal(false);
        }
    };
    return (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Add proof to your account</h1>
                <p className="text-zinc-400">Import your proof from 30 sources.</p>
            </div>

            {/* Cards Grid - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">

                {/* Import from Web Card */}
                <Link href="/import/web" className="block group">
                    <div className="bg-zinc-900/70 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 h-full transition-all duration-200 flex flex-col">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                            <Globe className="w-5 h-5 text-blue-400" />
                        </div>

                        {/* Title */}
                        <h3 className="text-white font-semibold text-base mb-2">Import from web</h3>

                        {/* Description */}
                        <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                            Paste a URL and Creet will import your proof.
                        </p>

                        {/* Brand Logos Grid - 2 rows of 4 */}
                        <div className="grid grid-cols-4 gap-x-1.5 gap-y-2 mt-auto">
                            <BrandIcon brandId="airbnb" size={32} variant="rounded" showBackground />
                            <BrandIcon brandId="play_store" size={32} variant="rounded" showBackground />
                            <BrandIcon brandId="facebook" size={32} variant="rounded" showBackground />
                            <BrandIcon brandId="linkedin" size={32} variant="rounded" showBackground />
                            <BrandIcon brandId="google" size={32} variant="rounded" showBackground />
                            <BrandIcon brandId="amazon" size={32} variant="rounded" showBackground />
                            <BrandIcon brandId="app_store" size={32} variant="rounded" showBackground />
                            <BrandIcon brandId="x" size={32} variant="rounded" showBackground />
                        </div>
                    </div>
                </Link>

                {/* Upload Spreadsheet Card */}
                <button onClick={() => setShowSpreadsheetModal(true)} className="block group text-left w-full">
                    <div className="bg-zinc-900/70 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 h-full transition-all duration-200 flex flex-col">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mb-6">
                            <FileSpreadsheet className="w-5 h-5 text-red-400" />
                        </div>

                        {/* Title */}
                        <h3 className="text-white font-semibold text-base mb-2">Upload spreadsheet</h3>

                        {/* Description */}
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            Upload a CSV, XLS or XLSX file and Creet will import your proof.
                        </p>
                    </div>
                </button>

                {/* Manual Import Card */}
                <Link href="/import/manual" className="block group">
                    <div className="bg-zinc-900/70 hover:bg-zinc-800/70 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 h-full transition-all duration-200 flex flex-col">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6">
                            <PenTool className="w-5 h-5 text-emerald-400" />
                        </div>

                        {/* Title */}
                        <h3 className="text-white font-semibold text-base mb-2">Manual import</h3>

                        {/* Description */}
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            Manually add video, text or screengrab proof to your account. Creet will transcribe your videos and screengrabs.
                        </p>
                    </div>
                </Link>

            </div>



            {/* Spreadsheet Upload Modal */}
            {showSpreadsheetModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <ImportModal
                        isOpen={showSpreadsheetModal}
                        onClose={() => setShowSpreadsheetModal(false)}
                        title="Upload Spreadsheet"
                        description="Upload a CSV, XLS, or XLSX file with your testimonials. Make sure your file includes columns for name, testimonial text, and any other relevant information."
                        inputType="file"
                        placeholder="CSV, XLS, or XLSX (max 10MB)"
                        buttonText="Upload and Import"
                        onSubmit={handleSpreadsheetUpload}
                    />
                </div>
            )}
        </div>
    );
}
