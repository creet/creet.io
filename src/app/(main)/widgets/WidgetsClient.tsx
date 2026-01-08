"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, LayoutGrid, Save, Trash2, Pencil, Loader2, X } from "lucide-react"
import { WIDGET_MODELS } from "@/lib/widget-models"
import { cn } from "@/lib/utils"
import { getWidgets, deleteWidget, saveWidget, WidgetRecord } from "@/lib/actions/widgets"
import { getTestimonials } from "@/lib/actions/testimonials"
import { createWidgetConfig, WidgetType } from "@/types/widget-config"

// Design system shadow presets
const shadows = {
    level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
    level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
    level3: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.1)',
}

// Saved Widget Card Component
function SavedWidgetCard({
    widget,
    onDelete
}: {
    widget: WidgetRecord
    onDelete: (id: string) => void
}) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const widgetModel = WIDGET_MODELS.find(w => w.id === widget.type)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteWidget(widget.id)
            if (result.success) {
                onDelete(widget.id)
                setIsDeleteDialogOpen(false)
            } else {
                console.error('Failed to delete widget:', result.error)
                alert('Failed to delete widget')
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert('Failed to delete widget')
        } finally {
            setIsDeleting(false)
        }
    }

    const IconComponent = widgetModel?.icon || LayoutGrid
    const iconColor = widgetModel?.iconColor || "text-zinc-500"

    return (
        <>
            <Link href={`/canvas/${widget.id}`} className="group block h-full">
                <div
                    className="h-full bg-[#0F0F11] border border-white/[0.04] rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/[0.08] hover:-translate-y-1 relative"
                    style={{ boxShadow: shadows.level1 }}
                >
                    {/* Subtle gradient overlay for warmth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />

                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsDeleteDialogOpen(true)
                            }}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className={cn(
                            "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border",
                            widget.status === 'published'
                                ? "bg-[#BFFF00]/10 text-[#BFFF00] border-[#BFFF00]/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                            {widget.status}
                        </span>
                    </div>

                    {/* Preview Area */}
                    <div className="aspect-[4/3] bg-[#09090B] relative p-6 flex items-center justify-center group-hover:bg-[#0F0F11] transition-colors">
                        <IconComponent className={cn("h-16 w-16 opacity-20 transition-all group-hover:opacity-60 group-hover:scale-110", iconColor)} />
                    </div>

                    {/* Content */}
                    <div className="p-4 border-t border-white/[0.04] bg-[#0F0F11]">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-zinc-200 truncate">{widget.name}</h3>
                            <Pencil className="h-3.5 w-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1">
                            {widgetModel?.name || widget.type} • Updated {new Date(widget.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </Link>

            {/* Delete Dialog - Level 3 Elevation (Modal) */}
            {isDeleteDialogOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-[#1C1C1F] border border-white/[0.08] rounded-2xl w-full max-w-[425px] p-6"
                        style={{ boxShadow: shadows.level3 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-white tracking-tight mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                            Delete Widget
                        </h3>
                        <p className="text-sm text-zinc-400 mb-6">
                            Are you sure you want to delete "{widget.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isDeleting}
                                className="h-10 px-4 text-zinc-400 font-medium text-sm rounded-lg hover:text-white hover:bg-white/[0.04] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="h-10 px-4 bg-red-900/50 hover:bg-red-900/70 text-red-200 font-medium text-sm rounded-lg border border-red-900 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

interface WidgetsClientProps {
    projectId: string | null;
}

export default function WidgetsClient({ projectId }: WidgetsClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<"saved" | "templates">("templates")
    const [savedWidgets, setSavedWidgets] = useState<WidgetRecord[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Create Widget Dialog State
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<typeof WIDGET_MODELS[0] | null>(null)
    const [newWidgetName, setNewWidgetName] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    // Handle template click - open dialog
    const handleTemplateClick = (template: typeof WIDGET_MODELS[0]) => {
        setSelectedTemplate(template)
        setNewWidgetName("My Widget")
        setIsCreateDialogOpen(true)
    }

    // Handle create widget
    const handleCreateWidget = async () => {
        if (!newWidgetName.trim() || !selectedTemplate) return

        setIsCreating(true)
        try {
            // Fetch top 3 latest testimonials to pre-populate widget
            let initialSelectedIds: string[] = []
            if (projectId) {
                try {
                    const { data } = await getTestimonials({
                        projectId,
                        limit: 3,
                        sortBy: 'created_at',
                        sortOrder: 'desc'
                    })
                    if (data && data.length > 0) {
                        initialSelectedIds = data.map((t: any) => t.id)
                    }
                } catch (err) {
                    console.error("Failed to fetch initial testimonials", err)
                }
            }

            // Create widget with full default config to ensure colors/theme are correct from start
            const initialConfig = createWidgetConfig(
                selectedTemplate.id as WidgetType,
                {
                    id: 'new', // Placeholder, will be replaced by backend
                    name: newWidgetName.trim(),
                    projectId: 'tbd' // Placeholder
                }
            )

            const result = await saveWidget({
                name: newWidgetName.trim(),
                type: selectedTemplate.id,
                config: initialConfig,
                selectedTestimonialIds: initialSelectedIds,
                status: 'published',
                projectId: projectId || undefined,
            })

            if (result.success && result.data) {
                // Navigate to the widget editor with the new widget ID and new=true flag
                router.push(`/canvas/${result.data.id}?new=true`)
            } else {
                console.error('Failed to create widget:', result.error)
                alert('Failed to create widget. Please try again.')
            }
        } catch (error) {
            console.error('Error creating widget:', error)
            alert('Failed to create widget. Please try again.')
        } finally {
            setIsCreating(false)
        }
    }

    // Fetch saved widgets
    useEffect(() => {
        if (projectId) {
            fetchSavedWidgets()
        }
    }, [projectId])

    const fetchSavedWidgets = async () => {
        setIsLoading(true)
        try {
            const result = await getWidgets(projectId || undefined)
            if (result.data) {
                setSavedWidgets(result.data)
            } else {
                console.error('Failed to fetch widgets:', result.error)
            }
        } catch (error) {
            console.error('Error fetching widgets:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleWidgetDelete = (id: string) => {
        setSavedWidgets(prev => prev.filter(w => w.id !== id))
    }

    const tabs = [
        { label: "Templates", icon: LayoutGrid, id: "templates" as const, active: activeTab === "templates" },
        { label: "Saved", icon: Save, id: "saved" as const, active: activeTab === "saved", count: savedWidgets.length },
    ]

    return (
        <div className="min-h-full bg-[#09090b] text-white font-sans">
            <div className="w-full space-y-10">

                {/* Header Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="h-6 w-6 text-white" />
                        <h1 className="text-2xl font-bold tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)' }}>
                            Widgets
                        </h1>
                        <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    </div>
                    <p className="text-zinc-400">Embed testimonials on your website without code.</p>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.label}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "h-10 px-4 border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] text-zinc-400 font-medium text-sm rounded-lg flex items-center gap-2 transition-all",
                                    tab.active && "border-white/10 bg-white/[0.06] text-white"
                                )}
                                style={tab.active ? { boxShadow: shadows.level1 } : undefined}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-white/10 text-zinc-300 rounded">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Templates Section */}
                {activeTab === "templates" && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Widget Templates
                            </h2>
                            <p className="text-zinc-500 text-sm">
                                Choose a template to get started. Customize it to match your brand.
                            </p>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {WIDGET_MODELS.map((widget) => (
                                <button
                                    key={widget.id}
                                    onClick={() => handleTemplateClick(widget)}
                                    className="group block h-full w-full text-left"
                                >
                                    <div
                                        className="h-full bg-[#0F0F11] border border-white/[0.04] rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/[0.08] hover:-translate-y-1 relative"
                                        style={{ boxShadow: shadows.level1 }}
                                    >
                                        {/* Subtle gradient overlay for warmth */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />

                                        {/* Preview Area */}
                                        <div className="aspect-[4/3] bg-[#09090B] relative p-6 flex items-center justify-center group-hover:bg-[#0F0F11] transition-colors">
                                            <widget.icon className={cn("h-16 w-16 opacity-20 transition-all group-hover:opacity-60 group-hover:scale-110", widget.iconColor)} />

                                            {widget.tag && (
                                                <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#BFFF00]/10 text-[#BFFF00] text-[10px] font-bold uppercase tracking-wider rounded border border-[#BFFF00]/20">
                                                    {widget.tag}
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 border-t border-white/[0.04] bg-[#0F0F11]">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-medium text-zinc-200">{widget.name}</h3>
                                            </div>
                                            <p className="text-xs text-zinc-500 line-clamp-1">{widget.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Saved Widgets Section */}
                {activeTab === "saved" && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Saved Widgets
                            </h2>
                            <p className="text-zinc-500 text-sm">
                                Your saved widget configurations. Click to edit.
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-full bg-[#0F0F11] border border-white/[0.04] rounded-2xl overflow-hidden relative">
                                        {/* Preview Area Skeleton */}
                                        <div className="aspect-[4/3] bg-zinc-900/50 relative flex items-center justify-center animate-pulse">
                                            <div className="h-16 w-16 bg-zinc-800/50 rounded-xl" />
                                        </div>
                                        {/* Content Skeleton */}
                                        <div className="p-4 border-t border-white/[0.04] bg-[#0F0F11] space-y-2">
                                            <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse" />
                                            <div className="h-3 w-1/2 bg-zinc-800/80 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : savedWidgets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Save className="h-12 w-12 text-zinc-700 mb-4" />
                                <h3 className="text-lg font-medium text-zinc-400 mb-2">No saved widgets yet</h3>
                                <p className="text-zinc-500 text-sm max-w-md mb-6">
                                    Create your first widget by selecting a template from the Templates tab.
                                </p>
                                {/* Secondary button - white, not lime */}
                                <button
                                    onClick={() => setActiveTab("templates")}
                                    className="h-10 px-5 bg-white text-black font-medium text-sm rounded-lg hover:bg-zinc-100 active:scale-[0.98] transition-all flex items-center gap-2"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    Browse Templates
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {savedWidgets.map((widget) => (
                                    <SavedWidgetCard
                                        key={widget.id}
                                        widget={widget}
                                        onDelete={handleWidgetDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ===================== CREATE WIDGET DIALOG ===================== */}
            {isCreateDialogOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="bg-[#1C1C1F] border border-white/[0.08] rounded-2xl w-full max-w-[425px] p-6"
                        style={{ boxShadow: shadows.level3 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setIsCreateDialogOpen(false)}
                            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-white/[0.04] rounded-lg transition-all"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                {selectedTemplate && (
                                    <selectedTemplate.icon className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                    Create Widget
                                </h3>
                                <p className="text-sm text-zinc-400">
                                    {selectedTemplate?.name} template
                                </p>
                            </div>
                        </div>

                        {/* Name Input */}
                        <div className="mb-6">
                            <label htmlFor="widget-name" className="text-sm font-medium text-zinc-200 block mb-2">
                                Widget Name
                            </label>
                            <input
                                id="widget-name"
                                type="text"
                                value={newWidgetName}
                                onChange={(e) => setNewWidgetName(e.target.value)}
                                placeholder="My Awesome Widget"
                                autoFocus
                                onFocus={(e) => {
                                    const val = e.target.value;
                                    e.target.setSelectionRange(val.length, val.length);
                                }}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]/50 transition-all text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newWidgetName.trim()) {
                                        handleCreateWidget()
                                    }
                                    if (e.key === 'Escape') {
                                        setIsCreateDialogOpen(false)
                                    }
                                }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsCreateDialogOpen(false)}
                                disabled={isCreating}
                                className="h-10 px-4 text-zinc-400 font-medium text-sm rounded-lg hover:text-white hover:bg-white/[0.04] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateWidget}
                                disabled={isCreating || !newWidgetName.trim()}
                                className="h-10 px-5 bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-semibold text-sm rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(191,255,0,0.15)]"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <LayoutGrid className="h-4 w-4" />
                                        Create Widget
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
