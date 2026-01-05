import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernFontPicker } from '@/components/ui/modern-font-picker';
import { uploadImageToStorage } from '@/lib/storage';
import { toast } from 'sonner';
import { FormConfig, FormTheme } from '@/types/form-config';

// --- Icons ---
const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const BoldIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
    </svg>
);

const ItalicIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="19" y1="4" x2="10" y2="4"></line>
        <line x1="14" y1="20" x2="5" y2="20"></line>
        <line x1="15" y1="4" x2="9" y2="20"></line>
    </svg>
);

const UnderlineIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M6 4v6a6 6 0 0 0 12 0V4"></path>
        <line x1="4" y1="20" x2="20" y2="20"></line>
    </svg>
);

const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
);

const TypeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="4 7 4 4 20 4 20 7"></polyline>
        <line x1="9" y1="20" x2="15" y2="20"></line>
        <line x1="12" y1="4" x2="12" y2="20"></line>
    </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

// --- Constants & Helpers ---
const PRIMARY_COLOR_PRESETS = ['#A855F7', '#6366F1', '#22C55E', '#F97316', '#EC4899', '#0EA5E9', '#FACC15', '#111827'];
const RATING_COLOR_PRESETS = ['#FBBF24', '#F59E0B', '#FCD34D', '#EF4444', '#F97316', '#84CC16', '#22C55E', '#14B8A6'];
const FONT_SIZE_PRESETS = [16, 20, 24, 32];

const clampColorValue = (value: number) => Math.min(255, Math.max(0, value));

const adjustColor = (hex: string, amount: number) => {
    if (!hex) return hex;
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
        clean = clean.split('').map((char) => `${char}${char}`).join('');
    }
    if (clean.length !== 6) {
        return hex;
    }
    const numeric = parseInt(clean, 16);
    const r = clampColorValue((numeric >> 16) + amount);
    const g = clampColorValue(((numeric >> 8) & 0xff) + amount);
    const b = clampColorValue((numeric & 0xff) + amount);
    const toHex = (value: number) => value.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const createGradient = (color: string) => {
    const light = adjustColor(color, 35);
    return `linear-gradient(135deg, ${light}, ${color})`;
};

// --- Component ---

interface GlobalSettingsPanelProps {
    formConfig: FormConfig;
    setFormConfig: React.Dispatch<React.SetStateAction<FormConfig | null>>;
    defaultTheme: FormTheme;
    onConfigChange?: () => void;
}

const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({ formConfig, setFormConfig, defaultTheme, onConfigChange }) => {
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [showAdvancedBrand, setShowAdvancedBrand] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const updateTheme = (updater: (theme: FormTheme) => FormTheme) => {
        setFormConfig((prev) => {
            if (!prev) return prev;
            const currentTheme = { ...defaultTheme, ...(prev.theme ?? {}) };
            return { ...prev, theme: updater(currentTheme) };
        });
        onConfigChange?.();
    };

    const updateSettings = (updates: Partial<FormConfig['settings']>) => {
        setFormConfig((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                settings: {
                    ...prev.settings,
                    ...updates,
                },
            };
        });
        onConfigChange?.();
    };

    const currentTheme = { ...defaultTheme, ...(formConfig.theme ?? {}) };

    const handleCopyColor = async (value: string) => {
        if (!value) return;
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
                toast.success('Color copied to clipboard');
            }
        } catch {
            toast.error('Unable to copy color');
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!formConfig.projectId) {
            toast.error('Unable to upload logo: missing project context.');
            return;
        }

        setIsUploadingLogo(true);
        try {
            const uploadResult = await uploadImageToStorage({
                file,
                context: {
                    type: 'project',
                    projectId: formConfig.projectId,
                    namespace: 'form-assets/logos',
                },
            });

            updateTheme((theme) => ({ ...theme, logoUrl: uploadResult.url }));
            toast.success('Logo uploaded successfully');
        } catch (uploadError: any) {
            toast.error(uploadError.message || 'Failed to upload logo');
        } finally {
            setIsUploadingLogo(false);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };



    return (
        <div className="w-full max-w-3xl space-y-6">
            {/* Header */}
            <div className="pt-4 pb-2">
                <h2 className="text-3xl font-bold text-white mb-3 font-heading tracking-tight">Global Settings</h2>
                <p className="text-zinc-400">Configure branding and styling for your entire form</p>
            </div>

            {/* Brand Identity Section */}
            <section
                className="bg-[#0F0F11] border border-white/[0.06] rounded-2xl overflow-visible"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
            >
                <div className="p-5 border-b border-white/[0.06]">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center">
                            <TypeIcon className="w-3.5 h-3.5 text-zinc-300" />
                        </div>
                        Brand Logo
                    </h3>
                </div>

                <div className="p-6">
                    <div className="flex flex-col items-center justify-center gap-6">
                        {/* Logo Upload */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-xl bg-[#18181B] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all hover:border-white/30 cursor-pointer">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={handleLogoUpload}
                                    />
                                    <img
                                        src={currentTheme.logoUrl || '/logo.svg'}
                                        alt="Logo"
                                        className="w-14 h-14 object-contain"
                                    />
                                    {isUploadingLogo && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                            <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider font-medium text-zinc-500 whitespace-nowrap group-hover:text-white transition-colors">
                                    Upload Logo
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brand Name Section */}
            <section
                className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.10] transition-all duration-200"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
            >
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <label className="text-sm font-medium text-zinc-200 block">Brand Name</label>
                        <p className="text-xs text-zinc-500 mt-1">Used in card titles &amp; social sharing</p>
                    </div>
                </div>
                <input
                    type="text"
                    value={formConfig.settings?.brandName || ''}
                    onChange={(e) => updateSettings({ brandName: e.target.value })}
                    placeholder="e.g., Acme Corp"
                    className="w-full h-11 px-4 rounded-lg bg-[#18181B] border border-white/10 text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all"
                />
                <p className="text-xs text-zinc-500 mt-2">
                    This will appear in messages like "How was your experience with <span className="text-zinc-300">{formConfig.settings?.brandName || 'your brand'}</span>?"
                </p>
            </section>

            {/* Colors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Primary Color */}
                <div
                    className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.10] transition-all duration-200"
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <label className="text-sm font-medium text-zinc-200 block">Primary Color</label>
                            <p className="text-xs text-zinc-500 mt-1">Brand accents & CTAs</p>
                        </div>
                        <button
                            onClick={() => handleCopyColor(currentTheme.primaryColor)}
                            className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
                            aria-label="Copy primary color"
                        >
                            <CopyIcon />
                        </button>
                    </div>
                    <div className="grid grid-cols-[auto,1fr] gap-3 items-center">
                        <label className="relative w-12 h-12 rounded-xl shadow-inner overflow-hidden">
                            <input
                                type="color"
                                value={currentTheme.primaryColor}
                                onChange={(e) => updateTheme((t) => ({ ...t, primaryColor: e.target.value }))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <span
                                className="absolute inset-0 rounded-xl border border-white/10"
                                style={{ background: createGradient(currentTheme.primaryColor) }}
                            ></span>
                        </label>
                        <input
                            type="text"
                            value={currentTheme.primaryColor}
                            onChange={(e) => updateTheme((t) => ({ ...t, primaryColor: e.target.value }))}
                            className="bg-[#18181B] border border-white/10 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:border-white focus:ring-1 focus:ring-white/20 transition-all"
                        />
                    </div>
                    <div className="mt-3">
                        <div className="flex flex-wrap gap-1.5">
                            {PRIMARY_COLOR_PRESETS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => updateTheme((t) => ({ ...t, primaryColor: color }))}
                                    className={`w-7 h-7 rounded-full border transition-all duration-200 ${currentTheme.primaryColor === color
                                        ? 'border-white ring-2 ring-white/30'
                                        : 'border-transparent hover:scale-105'
                                        }`}
                                    style={{ background: createGradient(color) }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Rating Color */}
                <div
                    className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.10] transition-all duration-200"
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <label className="text-sm font-medium text-zinc-200 block">Rating Color</label>
                            <p className="text-xs text-zinc-500 mt-1">Star ratings & feedback</p>
                        </div>
                        <button
                            onClick={() => handleCopyColor(currentTheme.ratingColor)}
                            className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
                        >
                            <CopyIcon />
                        </button>
                    </div>
                    <div className="grid grid-cols-[auto,1fr] gap-3 items-center">
                        <label className="relative w-12 h-12 rounded-xl shadow-inner overflow-hidden">
                            <input
                                type="color"
                                value={currentTheme.ratingColor}
                                onChange={(e) => updateTheme((t) => ({ ...t, ratingColor: e.target.value }))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <span
                                className="absolute inset-0 rounded-xl border border-white/10"
                                style={{ background: createGradient(currentTheme.ratingColor) }}
                            ></span>
                        </label>
                        <input
                            type="text"
                            value={currentTheme.ratingColor}
                            onChange={(e) => updateTheme((t) => ({ ...t, ratingColor: e.target.value }))}
                            className="bg-[#18181B] border border-white/10 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:border-white focus:ring-1 focus:ring-white/20 transition-all"
                        />
                    </div>
                    <div className="mt-3">
                        <div className="flex flex-wrap gap-1.5">
                            {RATING_COLOR_PRESETS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => updateTheme((t) => ({ ...t, ratingColor: color }))}
                                    className={`w-7 h-7 rounded-full border transition-all duration-200 ${currentTheme.ratingColor === color
                                        ? 'border-white ring-2 ring-white/30'
                                        : 'border-transparent hover:scale-105'
                                        }`}
                                    style={{ background: createGradient(color) }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fonts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Heading Font */}
                <div
                    className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.10] transition-all duration-200 overflow-visible relative z-40"
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
                >
                    <label className="text-sm font-medium text-zinc-200 mb-3 block">Heading Font</label>
                    <ModernFontPicker
                        value={currentTheme.headingFont}
                        onChange={(value) => updateTheme((t) => ({ ...t, headingFont: value }))}
                        compact
                    />
                </div>

                {/* Body Font */}
                <div
                    className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.10] transition-all duration-200 overflow-visible relative z-30"
                    style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
                >
                    <label className="text-sm font-medium text-zinc-200 mb-3 block">Body Font</label>
                    <ModernFontPicker
                        value={currentTheme.bodyFont}
                        onChange={(value) => updateTheme((t) => ({ ...t, bodyFont: value }))}
                        compact
                    />
                </div>
            </div>

            {/* Form Settings - Compact */}
            <div
                className="bg-[#0F0F11] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.10] transition-all duration-200"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)' }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-zinc-200">Low Rating Threshold</label>
                        <div className="group relative">
                            <svg className="w-4 h-4 text-zinc-500 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[#1C1C1F] border border-white/[0.08] rounded-xl text-xs text-zinc-300 z-50" style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4)' }}>
                                Ratings below this value show the &quot;Improvement Tips&quot; page. Ratings at or above continue to the testimonial.
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={formConfig.settings?.lowRatingThreshold || 3}
                            onChange={(e) => updateSettings({ lowRatingThreshold: parseInt(e.target.value) as 2 | 3 | 4 | 5 })}
                            className="appearance-none bg-[#18181B] border border-white/10 rounded-lg pl-3 pr-9 py-2.5 text-white text-sm focus:border-white focus:ring-1 focus:ring-white/20 transition-all cursor-pointer outline-none min-w-[80px]"
                        >
                            <option value={2}>★ 2</option>
                            <option value={3}>★ 3</option>
                            <option value={4}>★ 4</option>
                            <option value={5}>★ 5</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalSettingsPanel;
