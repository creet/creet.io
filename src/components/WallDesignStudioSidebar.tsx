"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, Upload, Trash2, Globe, MousePointerClick, Paperclip, ChevronDown, ArrowRight, ArrowLeft, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ModernFontPicker } from "@/components/ui/modern-font-picker"
import { Switch } from "@/components/ui/switch"
import Logo from "@/components/ui/Logo"
import { WallConfig, UpdateConfigFn } from "@/types/wall-config"

// ================================================================= //
//                           TYPES                                   //
// ================================================================= //

export type WallStyle = WallConfig['style']
export type TabType = 'templates' | 'style'

export interface TemplateConfig {
    id: string
    name: string
    subtitle: string
    preview: string
    previewImage?: string
}

export interface CardThemeConfig {
    id: string
    name: string
    cardBg: string
    cardBorder: string
    cardShadow: string
}

// ================================================================= //
//                         PROPS INTERFACE                           //
// ================================================================= //

interface WallDesignStudioSidebarProps {
    // Sidebar UI state
    isOpen: boolean
    onClose: () => void
    activeTab: TabType
    setActiveTab: (tab: TabType) => void

    // Configuration (single config object)
    config: WallConfig
    updateConfig: UpdateConfigFn

    // Template data (passed from parent)
    templates: TemplateConfig[]
    cardThemes: CardThemeConfig[]

    // Testimonial selection
    onSelectTestimonials?: () => void
    onReorderTestimonials?: () => void
    selectedTestimonialsCount?: number

    // Template
    onApplyTemplate?: (templateId: string) => void
}

// ================================================================= //
//                         COMPONENT                                 //
// ================================================================= //

export function WallDesignStudioSidebar({
    isOpen,
    onClose,
    activeTab,
    setActiveTab,
    config,
    updateConfig,
    templates,
    cardThemes,
    onSelectTestimonials,
    onReorderTestimonials,
    selectedTestimonialsCount,
    onApplyTemplate
}: WallDesignStudioSidebarProps) {

    // State for collapsible sections
    const [openSections, setOpenSections] = React.useState<{ advanced: boolean }>({
        advanced: false
    })

    const [headerBgPage, setHeaderBgPage] = React.useState(0)

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const advancedRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (openSections.advanced && advancedRef.current) {
            // Use requestAnimationFrame to ensure the DOM update has fully settled before scrolling
            requestAnimationFrame(() => {
                advancedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            })
        }
    }, [openSections.advanced])

    if (!isOpen) return null

    // ===================== HANDLERS ===================== //

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            updateConfig('logoUrl', url)
        }
    }

    const handleRemoveLogo = () => {
        updateConfig('logoUrl', null)
    }

    // ===================== RENDER ===================== //

    return (
        <div
            className="bg-zinc-900 border-l border-zinc-800 flex flex-col shrink-0 overflow-hidden transition-all duration-300"
            style={{ width: 'clamp(280px, 22vw, 360px)' }}
        >
            {/* ===================== HEADER ===================== */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-white font-semibold">Studio Controls</h3>
                <button
                    onClick={onClose}
                    className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-zinc-800"
                    aria-label="Close sidebar"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* ===================== TABS ===================== */}
            <div className="flex border-b border-zinc-800">
                {(['templates', 'style'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-all capitalize",
                            activeTab === tab
                                ? "text-violet-400 border-b-2 border-violet-400"
                                : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        {tab === 'templates' ? 'Templates' : 'Style'}
                    </button>
                ))}
            </div>

            {/* ===================== TAB CONTENT ===================== */}
            <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

                {/* =================== TEMPLATES TAB =================== */}
                {activeTab === 'templates' && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => {
                                        // If an onApplyTemplate prop exists, use it
                                        if (onApplyTemplate) {
                                            onApplyTemplate(template.id)
                                        } else {
                                            // Fallback for types (though we should update parent)
                                            updateConfig('style', template.id as any)
                                        }
                                    }}
                                    className={cn(
                                        "rounded-xl overflow-hidden transition-all border-2",
                                        config.style === template.id
                                            ? "border-violet-500 ring-2 ring-violet-500/30"
                                            : "border-zinc-700 hover:border-zinc-600"
                                    )}
                                >
                                    <div className={cn("h-56 relative w-full overflow-hidden", !template.previewImage && template.preview)}>
                                        {template.previewImage ? (
                                            /* Show preview image with text overlay */
                                            <>
                                                <img
                                                    src={template.previewImage}
                                                    alt={`${template.name} template preview`}
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Text overlay on top of image */}
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                                    <p className="text-xs font-medium text-white">{template.name}</p>
                                                    <p className="text-[10px] text-white/80">{template.subtitle}</p>
                                                </div>
                                            </>
                                        ) : (
                                            /* Fallback: Masonry Layout Simulation */
                                            <>
                                                <div className="grid grid-cols-3 gap-2 p-4 w-full h-full items-start opacity-80">
                                                    {/* Column 1 */}
                                                    <div className="flex flex-col gap-2">
                                                        <div className={cn(
                                                            "w-full rounded-md shadow-sm",
                                                            template.id === 'cinematic' ? 'bg-zinc-800' :
                                                                template.id === 'brutalist' ? 'bg-white border-2 border-black rounded-none shadow-[2px_2px_0_0_black]' :
                                                                    'bg-white'
                                                        )} style={{ height: '60px' }} />
                                                        <div className={cn(
                                                            "w-full rounded-md shadow-sm",
                                                            template.id === 'cinematic' ? 'bg-zinc-800' :
                                                                template.id === 'brutalist' ? 'bg-white border-2 border-black rounded-none shadow-[2px_2px_0_0_black]' :
                                                                    'bg-white'
                                                        )} style={{ height: '40px' }} />
                                                    </div>

                                                    {/* Column 2 */}
                                                    <div className="flex flex-col gap-2 pt-4">
                                                        <div className={cn(
                                                            "w-full rounded-md shadow-sm",
                                                            template.id === 'cinematic' ? 'bg-zinc-800' :
                                                                template.id === 'brutalist' ? 'bg-white border-2 border-black rounded-none shadow-[2px_2px_0_0_black]' :
                                                                    'bg-white'
                                                        )} style={{ height: '40px' }} />
                                                        <div className={cn(
                                                            "w-full rounded-md shadow-sm",
                                                            template.id === 'cinematic' ? 'bg-zinc-800' :
                                                                template.id === 'brutalist' ? 'bg-white border-2 border-black rounded-none shadow-[2px_2px_0_0_black]' :
                                                                    'bg-white'
                                                        )} style={{ height: '60px' }} />
                                                    </div>

                                                    {/* Column 3 */}
                                                    <div className="flex flex-col gap-2">
                                                        <div className={cn(
                                                            "w-full rounded-md shadow-sm",
                                                            template.id === 'cinematic' ? 'bg-zinc-800' :
                                                                template.id === 'brutalist' ? 'bg-white border-2 border-black rounded-none shadow-[2px_2px_0_0_black]' :
                                                                    'bg-white'
                                                        )} style={{ height: '50px' }} />
                                                        <div className={cn(
                                                            "w-full rounded-md shadow-sm",
                                                            template.id === 'cinematic' ? 'bg-zinc-800' :
                                                                template.id === 'brutalist' ? 'bg-white border-2 border-black rounded-none shadow-[2px_2px_0_0_black]' :
                                                                    'bg-white'
                                                        )} style={{ height: '50px' }} />
                                                    </div>
                                                </div>
                                                {/* Text overlay for fallback */}
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-zinc-800">
                                                    <p className="text-xs font-medium text-white">{template.name}</p>
                                                    <p className="text-[10px] text-zinc-400">{template.subtitle}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* =================== STYLE TAB =================== */}
                {activeTab === 'style' && (
                    <div className="space-y-8">
                        <div className="space-y-6">



                            {/* Card Theme */}
                            <div className="space-y-3">
                                <Label className="text-xs text-zinc-400">Card Theme</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {cardThemes.map((theme) => (
                                        <button
                                            key={theme.id}
                                            onClick={() => updateConfig('cardTheme', theme.id as WallConfig['cardTheme'])}
                                            className={cn(
                                                "py-2.5 px-2 rounded-lg border transition-all text-center text-xs font-medium",
                                                config.cardTheme === theme.id
                                                    ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                                                    : "bg-zinc-800/30 border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                                            )}
                                        >
                                            {theme.name}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            {/* Typography */}
                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-400">Typography</Label>
                                <ModernFontPicker
                                    value={config.fontFamily}
                                    onChange={(font) => updateConfig('fontFamily', font)}
                                />
                            </div>

                            {/* Shadow Intensity */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs text-zinc-400">Shadow Intensity</Label>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={config.shadowIntensity}
                                    onChange={(e) => updateConfig('shadowIntensity', Number(e.target.value))}
                                    className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-violet-500"
                                />
                            </div>

                            {/* Header Gradient Picker */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs text-zinc-400">Header Background</Label>
                                    <span className="text-[10px] text-zinc-500">{headerBgPage + 1}/2</span>
                                </div>
                                <div className="flex gap-2">
                                    {[
                                        'linear-gradient(to right, #3b82f6, #2563eb)', // Blue (Default)
                                        'linear-gradient(to right, #8b5cf6, #6366f1)', // Purple/Indigo
                                        'linear-gradient(to right, #ec4899, #d946ef)', // Pink/Fuchsia
                                        'linear-gradient(to right, #f97316, #ea580c)', // Orange
                                        'linear-gradient(to right, #10b981, #059669)', // Emerald
                                        'linear-gradient(to right, #06b6d4, #0891b2)', // Cyan
                                        'linear-gradient(to right, #1e293b, #0f172a)', // Slate
                                        'linear-gradient(to right, #be123c, #9f1239)', // Rose
                                        'linear-gradient(to right, #4338ca, #3730a3)', // Indigo
                                        'linear-gradient(to right, #18181b, #27272a)', // Zinc
                                    ].slice(headerBgPage * 5, (headerBgPage + 1) * 5).map((gradient) => (
                                        <button
                                            key={gradient}
                                            onClick={() => updateConfig('headerBackground', gradient)}
                                            className={cn(
                                                "w-9 h-9 shrink-0 rounded-lg transition-all border-2",
                                                config.headerBackground === gradient
                                                    ? "border-white scale-110 shadow-md"
                                                    : "border-transparent hover:scale-105"
                                            )}
                                            style={{ background: gradient }}
                                            aria-label="Select header gradient"
                                        />
                                    ))}

                                    <button
                                        onClick={() => setHeaderBgPage(prev => prev === 0 ? 1 : 0)}
                                        className="w-9 h-9 shrink-0 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                                        title={headerBgPage === 0 ? "Next colors" : "Previous colors"}
                                    >
                                        {headerBgPage === 0 ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Column Layout */}
                            <div className="space-y-3">
                                <Label className="text-xs text-zinc-400">Column Layout</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {([2, 3, 4] as const).map((cols) => (
                                        <button
                                            key={cols}
                                            onClick={() => updateConfig('columns', cols)}
                                            className={cn(
                                                "py-2.5 px-2 rounded-lg border transition-all text-center text-xs font-medium",
                                                config.columns === cols
                                                    ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                                                    : "bg-zinc-800/30 border-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                                            )}
                                        >
                                            {cols} Columns
                                        </button>
                                    ))}
                                </div>
                            </div>




                            {/* Rating Color (Picker) */}
                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-400">Rating Color</Label>
                                <div className="flex gap-3">
                                    <div className="relative w-10 h-10 shrink-0">
                                        <input
                                            type="color"
                                            value={config.accentColor}
                                            onChange={(e) => updateConfig('accentColor', e.target.value)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div
                                            className="w-full h-full rounded border border-zinc-700 shadow-sm"
                                            style={{ backgroundColor: config.accentColor }}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={config.accentColor}
                                        onChange={(e) => updateConfig('accentColor', e.target.value)}
                                        className="flex-1 px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-zinc-300 text-xs font-mono focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Display Options - Enhanced Look */}
                            <div className="space-y-3 pt-2">
                                <Label className="text-xs text-zinc-400">Display Settings</Label>
                                <div className="group flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all duration-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                                            <Globe className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium text-zinc-200">Source Icons</span>
                                            <span className="text-[10px] text-zinc-500">Show platform logos on cards</span>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={config.showSourceIcon}
                                        onCheckedChange={(checked) => updateConfig('showSourceIcon', checked)}
                                        className="data-[state=checked]:bg-violet-600"
                                    />
                                </div>



                                {/* CTA Button Toggle */}
                                <div className="space-y-3">
                                    <div className="group flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all duration-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                                                <MousePointerClick className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium text-zinc-200">Call to Action</span>
                                                <span className="text-[10px] text-zinc-500">Add a primary button</span>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={config.showCta}
                                            onCheckedChange={(checked) => updateConfig('showCta', checked)}
                                            className="data-[state=checked]:bg-violet-600"
                                        />
                                    </div>

                                    {/* CTA Configuration Inputs (Conditional) */}
                                    {config.showCta && (
                                        <div className="mt-2 p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/50 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] uppercase tracking-wide text-zinc-400 font-bold ml-1">CTA Title</Label>
                                                <div className="relative group/input">
                                                    <input
                                                        type="text"
                                                        value={config.ctaText}
                                                        onChange={(e) => updateConfig('ctaText', e.target.value)}
                                                        placeholder="e.g. Visit our website"
                                                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700/50 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder:text-zinc-600 shadow-sm"
                                                    />
                                                    <div className="absolute left-3 top-2.5 text-zinc-400 group-focus-within/input:text-violet-400 transition-colors">
                                                        <MousePointerClick className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] uppercase tracking-wide text-zinc-400 font-bold ml-1">CTA URL</Label>
                                                <div className="relative group/input">
                                                    <input
                                                        type="url"
                                                        value={config.ctaUrl}
                                                        onChange={(e) => updateConfig('ctaUrl', e.target.value)}
                                                        placeholder="https://your-site.com"
                                                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700/50 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder:text-zinc-600 font-mono text-xs shadow-sm"
                                                    />
                                                    <div className="absolute left-3 top-2.5 text-zinc-400 group-focus-within/input:text-violet-400 transition-colors">
                                                        <Globe className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>


                            {/* ============= BRANDING SECTION ============= */}
                            <div className="pt-6 border-t border-zinc-800 space-y-4">
                                <Label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Branding</Label>
                                <Label className="text-xs text-zinc-400 block -mt-2">Logo</Label>

                                {/* Logo Upload Card */}
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                                    {/* Logo Preview Area */}
                                    <div className="h-32 flex items-center justify-center bg-zinc-900/80 relative">
                                        {config.logoUrl ? (
                                            <div className="relative group">
                                                <img
                                                    src={config.logoUrl}
                                                    alt="Logo"
                                                    className="max-h-20 max-w-[80%] object-contain"
                                                />
                                                <button
                                                    onClick={handleRemoveLogo}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Logo size={48} color="#bfff00" />
                                        )}
                                    </div>

                                    {/* Upload Button Area */}
                                    <div className="p-3 bg-zinc-800/20 border-t border-zinc-800">
                                        <label className="cursor-pointer block">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleLogoUpload}
                                            />
                                            <div className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-all text-xs font-medium text-zinc-300">
                                                <Upload className="w-3.5 h-3.5" />
                                                Upload
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Logo Size Slider - Only show if logo exists */}
                                {/* Keeping this as it's useful functionality, even if not explicitly in the static screenshot, 
                                    or removing if strict adherence is required. The screenshot cuts off at the bottom. 
                                    I'll keep it for utility but styling it typically. */}
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-400">Logo Size</span>
                                        <span className="text-xs text-zinc-500">{config.logoSize || 50}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="20"
                                        max="150"
                                        value={config.logoSize || 50}
                                        onChange={(e) => updateConfig('logoSize', Number(e.target.value))}
                                        className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-violet-500"
                                    />
                                </div>
                            </div>
                        </div>



                        {/* ============= ADVANCED SETTINGS (Collapsible) ============= */}
                        <div ref={advancedRef} className="pt-6 border-t border-zinc-800 space-y-4">
                            <button
                                type="button"
                                onClick={() => toggleSection('advanced')}
                                className="w-full flex items-center justify-between group"
                            >
                                <Label className="text-xs text-zinc-500 font-bold uppercase tracking-wider cursor-pointer group-hover:text-zinc-300 transition-colors">Advanced Settings</Label>
                                <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform duration-200", openSections.advanced ? "rotate-180" : "")} />
                            </button>

                            {openSections.advanced && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">


                                    {/* Divider */}
                                    <div className="h-px bg-zinc-800" />

                                    {/* Attachments Toggle */}
                                    <div className="group flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all duration-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                                                <Paperclip className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium text-zinc-200">Attachments</span>
                                                <span className="text-[10px] text-zinc-500">Show images and videos</span>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={config.showAttachments}
                                            onCheckedChange={(checked) => updateConfig('showAttachments', checked)}
                                            className="data-[state=checked]:bg-violet-600"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ===================== FOOTER ===================== */}
            <div className="p-4 border-t border-zinc-800 space-y-2">
                <Button
                    onClick={onSelectTestimonials}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium"
                >
                    Select Testimonials {selectedTestimonialsCount !== undefined && `(${selectedTestimonialsCount})`}
                </Button>
                {selectedTestimonialsCount !== undefined && selectedTestimonialsCount > 1 && (
                    <Button
                        onClick={onReorderTestimonials}
                        variant="outline"
                        className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        Reorder Testimonials
                    </Button>
                )}
            </div>
        </div>
    )
}



