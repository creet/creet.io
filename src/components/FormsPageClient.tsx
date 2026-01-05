"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import Link from "next/link";
import {
    PlusIcon,
    MoreHorizontal,
    FileText,
    Calendar,
    Users,
    ArrowRight,
    Trash2,
    PenLine,
    LayoutTemplate,
    Share2,
    Check,
    Copy,
    AlertCircle,
    Sparkles
} from "lucide-react";
import type { Form } from '@/types/form-config';
import { formatDistanceToNow } from 'date-fns';

// Design system shadow presets
const shadows = {
    level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
    level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
    level3: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.1)',
    glowLime: '0 0 20px rgba(191,255,0,0.15)',
};

// ---------------------------------------------------------------- //
//                               Utils                              //
// ---------------------------------------------------------------- //

const getGradientClass = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    const gradients = [
        'from-violet-600 via-purple-600 to-indigo-600',
        'from-blue-600 via-cyan-600 to-teal-600',
        'from-rose-600 via-pink-600 to-fuchsia-600',
        'from-emerald-600 via-green-600 to-lime-600',
        'from-orange-500 via-amber-500 to-yellow-500',
        'from-pink-600 via-red-500 to-orange-500',
    ];

    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

// ---------------------------------------------------------------- //
//                           Components                             //
// ---------------------------------------------------------------- //

function EmptyState({ onCreate, isCreating }: { onCreate: () => void, isCreating: boolean }) {
    return (
        <div
            className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02]"
        >
            <div
                className="size-20 rounded-2xl bg-[#0F0F11] border border-white/[0.06] flex items-center justify-center mb-6"
                style={{ boxShadow: shadows.level1 }}
            >
                <FileText className="size-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                No forms created yet
            </h3>
            <p className="text-zinc-400 max-w-sm mb-8 leading-relaxed">
                Start collecting testimonials by creating your first form. It's quick and easy.
            </p>
            {/* Secondary CTA - white */}
            <button
                onClick={onCreate}
                disabled={isCreating}
                className="h-11 px-6 bg-white text-black font-medium text-sm rounded-lg hover:bg-zinc-100 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
                {isCreating ? (
                    <><div className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>Creating...</>
                ) : (
                    <><PlusIcon className="size-5" />Create First Form</>
                )}
            </button>
        </div>
    );
}

function FormCard({ form, index, onRequestDelete }: { form: Form, index: number, onRequestDelete: (form: Form) => void }) {
    const gradient = getGradientClass(form.id);
    const [hasCopied, setHasCopied] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();

    const handleCopyLink = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/t/${form.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Public link copied to clipboard");
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleCardClick = () => {
        router.push(`/form-builder?id=${form.id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="group relative flex flex-col bg-[#0F0F11] border border-white/[0.04] hover:border-white/[0.08] rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            style={{
                boxShadow: shadows.level1,
                animationDelay: `${index * 50}ms`
            }}
        >
            {/* Subtle gradient overlay for warmth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl z-10" />

            {/* Card Preview / Header - Keep colorful gradients for user content */}
            <div className="h-40 relative rounded-t-2xl">
                {/* Background Layer - Isolated for overflow:hidden */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} overflow-hidden rounded-t-2xl group-hover:brightness-110 transition-all duration-500`}>
                    {/* Abstract pattern overlay */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay"></div>
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none group-hover:bg-white/20 transition-colors duration-500"></div>
                </div>

                {/* Content Layer - Overlay with no overflow restriction so dropdowns can appear on top */}
                <div className="relative z-20 h-full p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start z-10">
                        {/* Status badge - using lime for active/published */}
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-black/30 backdrop-blur-md border border-white/20 text-white">
                            Active
                        </span>

                        {/* Dropdown Menu - positioned relative to header but renders above everything */}
                        <div className="relative" style={{ zIndex: 100 }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(!isMenuOpen);
                                }}
                                className="size-8 rounded-lg bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                            >
                                <MoreHorizontal className="size-4" />
                            </button>

                            {/* Backdrop - closes menu on click outside */}
                            <div
                                className={`fixed inset-0 transition-opacity duration-150 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                style={{ zIndex: 99 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsMenuOpen(false);
                                }}
                            />

                            {/* Dropdown content with smooth animation */}
                            <div
                                className={`absolute right-0 top-10 w-56 bg-[#18181B] border border-white/[0.06] rounded-xl p-1.5 transition-all duration-200 origin-top-right ${isMenuOpen
                                    ? 'opacity-100 scale-100 translate-y-0'
                                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                                    }`}
                                style={{ boxShadow: shadows.level2, zIndex: 100 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Link
                                    href={`/form-builder?id=${form.id}`}
                                    className="flex items-center w-full px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.04] hover:text-white rounded-lg transition-colors"
                                >
                                    <PenLine className="mr-2.5 size-4" /> Edit Form
                                </Link>
                                <button
                                    onClick={handleCopyLink}
                                    className="flex items-center w-full px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.04] hover:text-white rounded-lg transition-colors"
                                >
                                    <Copy className="mr-2.5 size-4" /> Copy Link
                                </button>
                                <div className="h-px bg-white/[0.06] my-1" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMenuOpen(false);
                                        onRequestDelete(form);
                                    }}
                                    className="flex items-center w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                                >
                                    <Trash2 className="mr-2.5 size-4" /> Delete Form
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="z-10 relative">
                        <div className="size-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-300">
                            <LayoutTemplate className="size-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col gap-3 bg-[#0F0F11] relative rounded-b-2xl">
                <div>
                    <h3 className="font-semibold text-zinc-100 text-lg mb-1 truncate group-hover:text-white transition-colors tracking-tight">
                        {form.name}
                    </h3>
                    <p className="text-zinc-500 text-sm line-clamp-1 leading-relaxed">
                        Collect testimonials, ratings, and feedback from your customers.
                    </p>
                </div>

                {/* Stats - inline for compactness */}
                <div className="flex items-center gap-4 py-3 border-t border-white/[0.04] text-sm">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Users className="size-3.5" />
                        <span className="font-medium text-zinc-300">0</span>
                        <span className="text-zinc-500">responses</span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Calendar className="size-3.5" />
                        <span className="text-zinc-500">{formatDate(form.created_at)}</span>
                    </div>
                </div>

                <div className="mt-auto flex items-center gap-2">
                    {/* Secondary button for form cards */}
                    <button className="flex-1 h-10 bg-white text-black font-medium text-sm rounded-lg flex items-center justify-center gap-2 pointer-events-none">
                        Open Builder
                        <ArrowRight className="size-4 opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
                    </button>

                    <button
                        onClick={handleCopyLink}
                        className="size-10 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white rounded-lg transition-all flex items-center justify-center hover:scale-105 active:scale-95 z-30 relative"
                        title="Copy Public Link"
                    >
                        {hasCopied ? <Check className="size-4 text-[#BFFF00]" /> : <Share2 className="size-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------- //
//                        Main Component                            //
// ---------------------------------------------------------------- //

interface FormsPageClientProps {
    initialForms: Form[];
}

export default function FormsPageClient({ initialForms }: FormsPageClientProps) {
    const router = useRouter();
    const [forms, setForms] = useState<Form[]>(initialForms);
    const [isCreating, setIsCreating] = useState(false);

    // Deletion State
    const [formToDelete, setFormToDelete] = useState<Form | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCreateForm = async () => {
        setIsCreating(true);
        try {
            const response = await fetch('/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Untitled Form' }),
            });

            if (!response.ok) throw new Error('Failed to create form');

            const newForm = await response.json();
            toast.success('Form created successfully!');
            router.push(`/form-builder?id=${newForm.id}`);
        } catch (error) {
            console.error('Error creating form:', error);
            toast.error('Failed to create form');
            setIsCreating(false);
        }
    };

    const confirmDelete = async () => {
        if (!formToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/forms/${formToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `Failed to delete form (${response.status})`;
                throw new Error(errorMessage);
            }

            setForms(forms.filter(f => f.id !== formToDelete.id));
            toast.success('Form deleted successfully');
        } catch (error: any) {
            console.error('Error deleting form:', error);
            toast.error(error.message || 'Failed to delete form');
        } finally {
            setIsDeleting(false);
            setFormToDelete(null);
        }
    };

    return (
        <main className="flex-1 w-full min-h-screen bg-[#09090b] text-white">


            <div className="w-full space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.04] pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <FileText className="h-6 w-6 text-white" />
                            <h1 className="text-2xl font-bold tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)' }}>
                                Your Forms
                            </h1>
                            <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        </div>
                        <p className="text-zinc-400 text-base max-w-xl leading-relaxed">
                            Manage your testimonial forms, customize their look, and share them with your customers to start collecting feedback.
                        </p>
                    </div>

                    {forms.length > 0 && (
                        /* Primary CTA - THE SIGNAL (Lime) */
                        <button
                            onClick={handleCreateForm}
                            disabled={isCreating}
                            className="h-10 px-5 bg-[#BFFF00] text-black font-semibold text-sm rounded-lg hover:bg-[#D4FF50] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ boxShadow: shadows.glowLime }}
                        >
                            {isCreating ? (
                                <><div className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>Creating...</>
                            ) : (
                                <><PlusIcon className="size-5" />New Form</>
                            )}
                        </button>
                    )}
                </div>

                {/* Content Section */}
                {forms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {forms.map((form, index) => (
                            <FormCard
                                key={form.id}
                                form={form}
                                index={index}
                                onRequestDelete={setFormToDelete}
                            />
                        ))}

                        {/* Quick Add Card */}
                        <button
                            onClick={handleCreateForm}
                            disabled={isCreating}
                            className="group flex flex-col items-center justify-center p-8 bg-white/[0.02] border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.04] rounded-2xl transition-all duration-300 h-full min-h-[300px]"
                        >
                            <div
                                className="size-16 rounded-2xl bg-[#0F0F11] group-hover:bg-[#18181B] flex items-center justify-center mb-5 transition-all duration-300 border border-white/[0.06] group-hover:border-white/10 group-hover:scale-110"
                                style={{ boxShadow: shadows.level1 }}
                            >
                                <PlusIcon className="size-7 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
                            </div>
                            <span className="font-semibold text-lg text-zinc-300 group-hover:text-white transition-colors">Create New Form</span>
                            <span className="text-sm text-zinc-500 mt-1 max-w-[200px] text-center">Start fresh with a new testimonial collection form</span>
                        </button>
                    </div>
                ) : (
                    <EmptyState onCreate={handleCreateForm} isCreating={isCreating} />
                )}
            </div>

            {/* Delete Confirmation Dialog - Level 3 Elevation (Modal) */}
            {formToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-[#1C1C1F] border border-white/[0.08] rounded-2xl w-full max-w-md overflow-hidden"
                        style={{ boxShadow: shadows.level3 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                                    <AlertCircle className="size-6 text-red-500" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                        Delete "{formToDelete?.name}"?
                                    </h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        Are you sure you want to delete this form? This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="px-6 py-4 bg-white/[0.02] border-y border-white/[0.04]">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-[#BFFF00] mt-1.5 shrink-0" />
                                <p className="text-sm text-zinc-300">
                                    <span className="font-medium text-zinc-100">Safe to delete:</span> Responses collected from this form will <span className="text-[#BFFF00]">NOT</span> be deleted. They are stored separately.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 flex justify-end gap-3">
                            <button
                                onClick={() => setFormToDelete(null)}
                                className="h-10 px-4 text-zinc-400 font-medium text-sm rounded-lg hover:text-white hover:bg-white/[0.04] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="h-10 px-4 bg-red-900/50 hover:bg-red-900/70 text-red-200 font-medium text-sm rounded-lg border border-red-900 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? "Deleting..." : "Delete Form"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

