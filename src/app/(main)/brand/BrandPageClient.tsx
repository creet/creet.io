"use client";

import React, { useState, useTransition, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProjectBrand } from "@/lib/actions/projects";
import { uploadImageToStorage } from "@/lib/storage";
import { toast } from "sonner";
import { Loader2, Palette, Globe, Type, Save, Upload, X, Sparkles, Info } from "lucide-react";
import { ModernFontPicker } from "@/components/ui/modern-font-picker";

interface BrandSettings {
    logoUrl: string;
    brandName: string;
    websiteUrl: string;
    primaryColor: string;
    textColor: string;
    ratingColor: string;
    headingFont: string;
    bodyFont: string;
}

const DEFAULT_SETTINGS: BrandSettings = {
    logoUrl: "",
    brandName: "",
    websiteUrl: "",
    primaryColor: "#BFFF00", // Brand lime
    textColor: "#E4E4E7",    // Zinc-200
    ratingColor: "#fbbf24",  // amber-400
    headingFont: "Satoshi",
    bodyFont: "Inter",
};

const MAX_LOGO_SIZE_MB = 2;
const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_MB * 1024 * 1024;

// Design system shadow presets
const shadows = {
    level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
    level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
    glowLime: '0 0 20px rgba(191,255,0,0.15)',
};

export default function BrandPageClient({ project }: { project: any }) {
    const [settings, setSettings] = useState<BrandSettings>({
        ...DEFAULT_SETTINGS,
        brandName: project.name || "",
        ...(project.brand_settings || {}),
    });
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateProjectBrand(project.id, settings);
                toast.success("Brand settings saved successfully");
            } catch (error) {
                toast.error("Failed to save brand settings");
                console.error(error);
            }
        });
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_LOGO_SIZE_BYTES) {
            toast.error(`Logo must be less than ${MAX_LOGO_SIZE_MB}MB`);
            return;
        }

        const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a valid image (PNG, JPG, WebP, GIF, or SVG)");
            return;
        }

        setIsUploading(true);
        try {
            const result = await uploadImageToStorage({
                file,
                context: {
                    type: 'project',
                    projectId: project.id,
                    namespace: 'brand/logos',
                },
            });
            setSettings(prev => ({ ...prev, logoUrl: result.url }));
            toast.success("Logo uploaded successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to upload logo");
            console.error(error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveLogo = () => {
        setSettings(prev => ({ ...prev, logoUrl: '' }));
    };

    const ColorInput = ({
        label,
        value,
        onChange,
        tooltip
    }: {
        label: string;
        value: string;
        onChange: (val: string) => void;
        tooltip?: string;
    }) => (
        <div className="space-y-3">
            <div className="flex items-center gap-1.5">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{label}</label>
                {tooltip && (
                    <div className="relative group/tooltip">
                        <Info className="size-3.5 text-zinc-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 w-56 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 shadow-xl z-50">
                            {tooltip}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-800" />
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3">
                <div className="relative group">
                    <div
                        className="size-10 rounded-lg border border-white/10 transition-transform group-hover:scale-105 cursor-pointer"
                        style={{
                            backgroundColor: value,
                            boxShadow: shadows.level1
                        }}
                    />
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="font-mono text-sm w-28 h-10 px-3 bg-[#18181B] border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                    style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-full bg-[#09090b] text-white font-sans">

            <div className="w-full space-y-10">

                {/* Header Section */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Palette className="h-6 w-6 text-white" />
                            <h1 className="text-2xl font-bold tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)' }}>
                                Brand Kit
                            </h1>
                            <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        </div>

                        {/* Primary CTA - THE SIGNAL */}
                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className="h-10 px-5 bg-[#BFFF00] text-black font-semibold text-sm rounded-lg hover:bg-[#D4FF50] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ boxShadow: shadows.glowLime }}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-zinc-400">
                        Manage your brand identity across all your forms and widgets.
                    </p>
                </div>

                <div className="space-y-6">

                    {/* General Information Card */}
                    <div
                        className="rounded-2xl bg-[#0F0F11] border border-white/[0.04] overflow-hidden relative max-w-2xl mx-auto"
                        style={{ boxShadow: shadows.level1 }}
                    >
                        {/* Subtle gradient overlay for warmth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#BFFF00]/[0.02] via-transparent to-transparent pointer-events-none" />

                        {/* Card Header */}
                        <div className="relative border-b border-white/[0.04] px-6 py-4 bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <Globe className="size-5 text-white" />
                                <h3 className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                    General Information
                                </h3>
                            </div>
                            <p className="text-sm text-zinc-500 mt-1">Basic details about your brand.</p>
                        </div>

                        {/* Card Content */}
                        <div className="relative p-6 space-y-6">
                            {/* Brand Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-300">Brand Name</label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={settings.brandName}
                                        onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                                        placeholder="Acme Inc."
                                        className="w-full h-10 pl-9 pr-4 bg-[#18181B] border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                                        style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}
                                    />
                                </div>
                            </div>

                            {/* Website URL */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-300">Website URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={settings.websiteUrl}
                                        onChange={(e) => setSettings({ ...settings, websiteUrl: e.target.value })}
                                        placeholder="https://acme.com"
                                        className="w-full h-10 pl-9 pr-4 bg-[#18181B] border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                                        style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}
                                    />
                                </div>
                            </div>

                            {/* Logo Upload Section */}
                            <div className="space-y-3">
                                <label className="text-xs font-medium text-zinc-300">Brand Logo</label>

                                {settings.logoUrl ? (
                                    // Logo Preview
                                    <div className="flex items-center gap-4">
                                        <div className="relative group">
                                            <div
                                                className="size-20 rounded-xl border border-white/10 bg-[#18181B] p-2 flex items-center justify-center overflow-hidden"
                                                style={{ boxShadow: shadows.level1 }}
                                            >
                                                <img
                                                    src={settings.logoUrl}
                                                    alt="Brand Logo"
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </div>
                                            <button
                                                onClick={handleRemoveLogo}
                                                className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500/90 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                                                style={{ boxShadow: shadows.level2 }}
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-[#BFFF00]" />
                                                <span className="text-sm text-zinc-200">Logo uploaded successfully</span>
                                            </div>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-sm text-zinc-400 hover:text-white transition-colors"
                                            >
                                                Replace logo
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Upload Zone
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl p-8 transition-all cursor-pointer group bg-white/[0.02] hover:bg-white/[0.04]"
                                    >
                                        <div className="flex flex-col items-center gap-3 text-center">
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="size-10 text-[#BFFF00] animate-spin" />
                                                    <p className="text-sm text-zinc-400">Uploading...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        className="size-12 rounded-xl bg-[#18181B] flex items-center justify-center group-hover:bg-[#27272A] transition-colors border border-white/[0.06]"
                                                        style={{ boxShadow: shadows.level1 }}
                                                    >
                                                        <Upload className="size-6 text-zinc-400 group-hover:text-[#BFFF00] transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-zinc-300">
                                                            Click to upload your logo
                                                        </p>
                                                        <p className="text-xs text-zinc-600 mt-1">
                                                            PNG, JPG, SVG or WebP (max {MAX_LOGO_SIZE_MB}MB)
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                                <p className="text-[10px] text-zinc-600">Use a transparent PNG or SVG for best results.</p>
                            </div>
                        </div>
                    </div>

                    {/* Style & Theme Card */}
                    <div
                        className="rounded-2xl bg-[#0F0F11] border border-white/[0.04] overflow-visible relative max-w-2xl mx-auto"
                        style={{ boxShadow: shadows.level1 }}
                    >
                        {/* Subtle gradient overlay for warmth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] via-transparent to-transparent pointer-events-none rounded-2xl" />

                        {/* Card Header */}
                        <div className="relative border-b border-white/[0.04] px-6 py-4 bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <Palette className="size-5 text-white" />
                                <h3 className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                    Style & Theme
                                </h3>
                            </div>
                            <p className="text-sm text-zinc-500 mt-1">Customize colors and typography.</p>
                        </div>

                        {/* Card Content */}
                        <div className="relative p-6 space-y-8">
                            {/* Colors */}
                            <div>
                                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-6">Color Palette</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <ColorInput
                                        label="Primary Color"
                                        value={settings.primaryColor}
                                        onChange={(c) => setSettings({ ...settings, primaryColor: c })}
                                    />
                                    <ColorInput
                                        label="Text Color"
                                        value={settings.textColor}
                                        onChange={(c) => setSettings({ ...settings, textColor: c })}
                                        tooltip="This will be the default text color for new Widgets and Walls of Love you create."
                                    />
                                    <ColorInput
                                        label="Rating Color"
                                        value={settings.ratingColor}
                                        onChange={(c) => setSettings({ ...settings, ratingColor: c })}
                                    />
                                </div>
                            </div>

                            {/* Fonts */}
                            <div className="pt-6 border-t border-white/[0.04]">
                                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-6">Typography</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Heading Font</label>
                                        <ModernFontPicker
                                            value={settings.headingFont}
                                            onChange={(font) => setSettings({ ...settings, headingFont: font })}
                                            placeholder="Select heading font"
                                        />
                                        <p className="text-[10px] text-zinc-600">Used for titles and headings</p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Body Font</label>
                                        <ModernFontPicker
                                            value={settings.bodyFont}
                                            onChange={(font) => setSettings({ ...settings, bodyFont: font })}
                                            placeholder="Select body font"
                                        />
                                        <p className="text-[10px] text-zinc-600">Used for body text and paragraphs</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
