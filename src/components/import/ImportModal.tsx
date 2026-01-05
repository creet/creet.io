/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPORT MODAL COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Reusable modal for different import types (URL, file upload, etc.)
 * 
 * Usage:
 *   <ImportModal
 *     isOpen={isOpen}
 *     onClose={handleClose}
 *     title="Import from LinkedIn"
 *     description="Paste the URL to your LinkedIn post"
 *     inputType="url"
 *     placeholder="https://linkedin.com/..."
 *     buttonText="Import testimonials"
 *     onSubmit={handleSubmit}
 *   />
 */

"use client";

import { X, Upload, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

export interface ImportModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal should close */
    onClose: () => void;
    /** Modal title */
    title: string;
    /** Description text below title */
    description?: string;
    /** Type of input field */
    inputType?: "url" | "file" | "text";
    /** Placeholder text for input */
    placeholder?: string;
    /** Submit button text */
    buttonText?: string;
    /** Callback when form is submitted */
    onSubmit?: (value: string | File) => void;
    /** Optional icon to display */
    icon?: React.ReactNode;
    /** Custom content to render instead of default input */
    children?: React.ReactNode;
}

export default function ImportModal({
    isOpen,
    onClose,
    title,
    description,
    inputType = "url",
    placeholder,
    buttonText = "Import",
    onSubmit,
    icon,
    children,
}: ImportModalProps) {
    const [inputValue, setInputValue] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    if (!isOpen) return null;

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (inputType === "file" && selectedFile) {
            onSubmit?.(selectedFile);
        } else if (inputValue.trim()) {
            onSubmit?.(inputValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    return (
        <div 
            className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200"
            onKeyDown={handleKeyDown}
        >
            <div className="border border-zinc-800/80 bg-zinc-900/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 z-10 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                    aria-label="Close modal"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Content wrapper */}
                <div className="p-8">
                    {/* Icon */}
                    {icon && (
                        <div className="mb-6">
                            {icon}
                        </div>
                    )}

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white mb-3">
                        {title}
                    </h2>

                    {/* Description */}
                    {description && (
                        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                            {description}
                        </p>
                    )}

                    {/* Custom content or default input */}
                    {children ? (
                        <div className="mb-8">{children}</div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mb-8">
                            {inputType === "file" ? (
                                <div>
                                    <label
                                        htmlFor="file-upload"
                                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-zinc-800 border-dashed rounded-xl cursor-pointer bg-zinc-950/30 hover:bg-zinc-950/50 hover:border-zinc-700 transition-all group"
                                    >
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center mb-4 group-hover:bg-zinc-800 transition-colors">
                                                <Upload className="w-6 h-6 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                                            </div>
                                            <p className="mb-2 text-sm text-zinc-400">
                                                <span className="font-semibold text-zinc-300">Click to upload</span> or drag and drop
                                            </p>
                                            {selectedFile ? (
                                                <p className="text-sm text-[var(--color-accent)] font-medium">
                                                    {selectedFile.name}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-zinc-600">
                                                    {placeholder || "CSV, XLS, or XLSX"}
                                                </p>
                                            )}
                                        </div>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept=".csv,.xls,.xlsx"
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="import-input" className="text-sm font-medium text-zinc-400 block mb-3 flex items-center gap-2">
                                        {inputType === "url" && <LinkIcon className="w-4 h-4" />}
                                        {inputType === "url" ? "URL" : "Input"}
                                    </label>
                                    <input
                                        type="text"
                                        id="import-input"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={placeholder || "Enter value..."}
                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]/50 transition-all font-mono text-sm"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </form>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 bg-transparent hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-300 rounded-xl text-sm font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleSubmit()}
                            disabled={inputType === "file" ? !selectedFile : !inputValue.trim()}
                            className="px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-[var(--color-accent)]/30"
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


