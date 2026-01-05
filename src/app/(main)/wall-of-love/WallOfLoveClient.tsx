"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Sparkles, Heart, Save, Play, Star, Trash2, Pencil, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getWalls, deleteWall, saveWall, WallRecord } from "@/lib/actions/walls"

// Design system shadow presets
const shadows = {
    level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',
    level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
    level3: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.1)',
}

// Demo testimonials for Wall of Love previews
const DEMO_TESTIMONIALS = [
    { name: "Joe Rogan", title: "Entrepreneur & Podcaster", content: "We solve web and mobile design problems with clarity and precision." },
    { name: "Celia Tinson", title: "Founder @ SQUAD", content: "Pretty much everyone who approaches for frontend work is extremely talented." },
    { name: "Steve Deno", title: "Animator", content: "This is really useful. Had to share this with everyone at my company." },
    { name: "Marc Cooper", title: "Designer at DevLabs", content: "This was like a whole project for the team but this widget made it so easy." },
    { name: "Nitish Singh", title: "Product Lead", content: "Congrats on the launch! amazing product. This is amazing and saving lots." },
    { name: "John Smith", title: "CEO @ StartupCo", content: "Have the ops for revenues, bumping your latest project on us." },
]

// Wall of Love template - Only Classic
const WALL_TEMPLATES = [
    {
        id: "classic",
        styleId: "classic",
        name: "Classic",
        description: "Create a beautiful, shareable Wall of Love with your best testimonials",
        bgColor: "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50",
        cardBg: "bg-white",
        textColor: "text-zinc-900",
        accentColor: "text-purple-500",
        borderColor: "border-zinc-200",
        previewImage: "/classicwall.png",
        // previewImage: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/Walls/classicwall.png`,
    },
]

// Mini testimonial card for preview
function MiniTestimonialCard({
    testimonial,
    template,
    isSmall = false
}: {
    testimonial: typeof DEMO_TESTIMONIALS[0]
    template: typeof WALL_TEMPLATES[0]
    isSmall?: boolean
}) {
    return (
        <div className={cn(
            "rounded-lg p-2 transition-all border",
            template.cardBg,
            template.borderColor
        )}>
            <div className="flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold text-white shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                    <p className={cn("text-[7px] font-semibold truncate leading-tight", template.textColor)}>
                        {testimonial.name}
                    </p>
                    <p className={cn("text-[5px] truncate opacity-60", template.textColor)}>
                        {testimonial.title}
                    </p>
                </div>
            </div>
            <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-2 h-2 fill-current", template.accentColor)} />
                ))}
            </div>
            {!isSmall && (
                <p className={cn("text-[6px] line-clamp-2 leading-relaxed opacity-80", template.textColor)}>
                    {testimonial.content}
                </p>
            )}
        </div>
    )
}

// Wall of Love template preview card
function WallTemplateCard({
    template,
    onClick
}: {
    template: typeof WALL_TEMPLATES[0]
    onClick: (template: typeof WALL_TEMPLATES[0]) => void
}) {
    return (
        <button
            onClick={() => onClick(template)}
            className="group block text-left w-full"
        >
            <div
                className="relative rounded-2xl overflow-hidden border border-white/[0.04] transition-all duration-300 hover:border-white/[0.08] hover:-translate-y-1"
                style={{ boxShadow: shadows.level1 }}
            >
                {/* Subtle gradient overlay for warmth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl z-20" />

                {/* Play button */}
                <div className="absolute top-3 left-3 z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                    <Play className="w-3 h-3 text-white fill-white" />
                </div>

                {/* Preview image */}
                <div className="relative overflow-hidden">
                    <img
                        src={template.previewImage}
                        alt={`${template.name} Wall of Love Template`}
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Gradient overlay at bottom for text */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Template name badge */}
                <div className="absolute bottom-3 left-3 z-10">
                    <span className="px-2 py-1 text-xs font-medium text-white bg-black/40 backdrop-blur-sm rounded-md border border-white/10">
                        {template.name}
                    </span>
                </div>
            </div>
        </button>
    )
}

// Saved Wall Card Component
function SavedWallCard({
    wall,
    onDelete
}: {
    wall: WallRecord
    onDelete: (id: string) => void
}) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteWall(wall.id)
            if (result.success) {
                onDelete(wall.id)
                setIsDeleteDialogOpen(false)
            } else {
                console.error('Failed to delete wall:', result.error)
                alert('Failed to delete wall')
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert('Failed to delete wall')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <Link href={`/wall-of-love/${wall.id}`} className="group block h-full">
                <div
                    className="h-full bg-[#0F0F11] border border-white/[0.04] rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/[0.08] hover:-translate-y-1 relative"
                    style={{ boxShadow: shadows.level1 }}
                >
                    {/* Subtle gradient overlay for warmth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />

                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            wall.is_published
                                ? "bg-[#BFFF00]/10 text-[#BFFF00] border-[#BFFF00]/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                            {wall.is_published ? 'published' : 'draft'}
                        </span>
                    </div>

                    {/* Preview Area */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-purple-900/10 to-pink-900/10 relative p-6 flex items-center justify-center group-hover:from-purple-900/20 group-hover:to-pink-900/20 transition-colors">
                        <Heart className="h-16 w-16 text-pink-500 opacity-20 transition-all group-hover:opacity-60 group-hover:scale-110" />
                    </div>

                    {/* Content */}
                    <div className="p-4 border-t border-white/[0.04] bg-[#0F0F11]">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-zinc-200 truncate">{wall.name}</h3>
                            <Pencil className="h-3.5 w-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1">
                            Wall of Love • Updated {new Date(wall.updated_at).toLocaleDateString()}
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
                            Delete Wall of Love
                        </h3>
                        <p className="text-sm text-zinc-400 mb-6">
                            Are you sure you want to delete "{wall.name}"? This action cannot be undone.
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

interface WallOfLoveClientProps {
    projectId: string | null;
}

export default function WallOfLoveClient({ projectId }: WallOfLoveClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<"saved" | "templates">("templates")
    const [savedWalls, setSavedWalls] = useState<WallRecord[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Create Wall Dialog State
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<typeof WALL_TEMPLATES[0] | null>(null)
    const [newWallName, setNewWallName] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    // Fetch saved walls
    useEffect(() => {
        if (projectId) {
            fetchSavedWalls()
        }
    }, [projectId])

    const fetchSavedWalls = async () => {
        setIsLoading(true)
        try {
            const result = await getWalls(projectId || undefined)
            if (result.data) {
                setSavedWalls(result.data)
            } else {
                console.error('Failed to fetch walls:', result.error)
            }
        } catch (error) {
            console.error('Error fetching walls:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleWallDelete = (id: string) => {
        setSavedWalls(prev => prev.filter(w => w.id !== id))
    }

    // Handle template click - open dialog
    const handleTemplateClick = (template: typeof WALL_TEMPLATES[0]) => {
        setSelectedTemplate(template)
        setNewWallName("")
        setIsCreateDialogOpen(true)
    }

    // Handle create wall
    const handleCreateWall = async () => {
        if (!newWallName.trim() || !selectedTemplate) return

        setIsCreating(true)
        try {
            // Generate a slug from the name
            const slug = newWallName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '') + '-' + Date.now().toString(36)

            // Create wall with default config based on template
            const result = await saveWall({
                name: newWallName.trim(),
                slug,
                config: {
                    style: selectedTemplate.styleId,
                    backgroundColor: "#f5f5f7",
                    cardBackground: "#ffffff",
                    textColor: "#09090b",
                    accentColor: "#fbbf24",
                    borderRadius: 16,
                    showRatings: true,
                    showDates: false,
                    showSources: true,
                    columns: 3,
                    layout: "masonry",
                    cardStyle: "shadow",
                    headerTitle: "Wall of Love",
                    headerSubtitle: "See what our customers are saying",
                    showHeader: true,
                    showCta: true,
                    ctaText: "Visit our website",
                    ctaUrl: "#",
                    headerBackground: 'linear-gradient(to right, #18181b, #27272a)',
                },
                selectedTestimonialIds: [],
                isPublished: false, // Start as draft
                projectId: projectId || undefined,
            })

            if (result.success && result.data) {
                // Navigate to the wall editor with the new wall ID and new=true flag
                router.push(`/wall-of-love/${result.data.id}?new=true`)
            } else {
                console.error('Failed to create wall:', result.error)
                alert('Failed to create wall. Please try again.')
            }
        } catch (error) {
            console.error('Error creating wall:', error)
            alert('Failed to create wall. Please try again.')
        } finally {
            setIsCreating(false)
        }
    }

    const tabs = [
        { label: "Templates", icon: Heart, id: "templates" as const, active: activeTab === "templates" },
        { label: "Saved", icon: Save, id: "saved" as const, active: activeTab === "saved", count: savedWalls.length },
    ]

    return (
        <div className="min-h-full bg-[#09090b] text-white font-sans">
            <div className="w-full space-y-10">

                {/* Header Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Heart className="h-6 w-6 text-pink-500" />
                        <h1 className="text-2xl font-bold tracking-[-0.02em]" style={{ fontFamily: 'var(--font-heading)' }}>
                            Wall of Love
                        </h1>
                        <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    </div>
                    <p className="text-zinc-400">Create a beautiful, shareable Wall of Love with your best testimonials.</p>

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
                                Wall Templates
                            </h2>
                            <p className="text-zinc-500 text-sm">
                                Choose a template to get started. Customize it to match your brand.
                            </p>
                        </div>

                        {/* Template Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {WALL_TEMPLATES.map((template) => (
                                <WallTemplateCard
                                    key={template.id}
                                    template={template}
                                    onClick={handleTemplateClick}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Saved Walls Section */}
                {activeTab === "saved" && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Saved Walls
                            </h2>
                            <p className="text-zinc-500 text-sm">
                                Your saved Wall of Love configurations. Click to edit.
                            </p>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-full bg-[#0F0F11] border border-white/[0.04] rounded-2xl overflow-hidden relative">
                                        {/* Preview Area Skeleton */}
                                        <div className="aspect-[4/3] bg-zinc-900/50 relative animate-pulse" />
                                        {/* Content Skeleton */}
                                        <div className="p-4 border-t border-white/[0.04] bg-[#0F0F11] space-y-2">
                                            <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse" />
                                            <div className="h-3 w-1/2 bg-zinc-800/80 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : savedWalls.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Save className="h-12 w-12 text-zinc-700 mb-4" />
                                <h3 className="text-lg font-medium text-zinc-400 mb-2">No saved walls yet</h3>
                                <p className="text-zinc-500 text-sm max-w-md mb-6">
                                    Create your first Wall of Love by selecting a template from the Templates tab.
                                </p>
                                {/* Secondary button - white, not colored */}
                                <button
                                    onClick={() => setActiveTab("templates")}
                                    className="h-10 px-5 bg-white text-black font-medium text-sm rounded-lg hover:bg-zinc-100 active:scale-[0.98] transition-all flex items-center gap-2"
                                >
                                    <Heart className="h-4 w-4" />
                                    Browse Templates
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {savedWalls.map((wall) => (
                                    <SavedWallCard key={wall.id} wall={wall} onDelete={handleWallDelete} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ===================== CREATE WALL DIALOG ===================== */}
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
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                    Create Wall of Love
                                </h3>
                                <p className="text-sm text-zinc-400">
                                    {selectedTemplate?.name} template
                                </p>
                            </div>
                        </div>

                        {/* Name Input */}
                        <div className="mb-6">
                            <label htmlFor="wall-name" className="text-sm font-medium text-zinc-200 block mb-2">
                                Wall Name
                            </label>
                            <input
                                id="wall-name"
                                type="text"
                                value={newWallName}
                                onChange={(e) => setNewWallName(e.target.value)}
                                placeholder="My Awesome Wall"
                                autoFocus
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]/50 transition-all text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newWallName.trim()) {
                                        handleCreateWall()
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
                                onClick={handleCreateWall}
                                disabled={isCreating || !newWallName.trim()}
                                className="h-10 px-5 bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-semibold text-sm rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(191,255,0,0.15)]"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Heart className="h-4 w-4" />
                                        Create Wall
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
