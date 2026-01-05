"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { WIDGET_MODELS } from "@/lib/widget-models"
import { PraiseWidget } from "@/components/praise/PraiseWidget"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Monitor, Smartphone, Tablet, Share2, Star, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Save, Pencil, ListFilter, Loader2, Check, ArrowLeft, Code } from "lucide-react"
import Link from "next/link"
import {
  WidgetConfig,
  WidgetType,
  isCardWidget,
  isCollectionWidget,
  isBadgeWidget,
  createWidgetConfig
} from "@/types/widget-config"
import { SocialCard } from "@/components/widgets/SocialCard"
import { MinimalCard } from "@/components/widgets/MinimalCard"
import { RatingBadge } from "@/components/widgets/RatingBadge"
import { ModernFontPicker } from "@/components/ui/modern-font-picker"
import { ShareWidgetPanel } from "@/components/widgets/Sharewidgetpanel/ShareWidgetPanel"
import { SelectTestimonialsModal, Testimonial } from "@/components/widgets/SelectTestimonialsModal"
import { saveWidget, getWidgetById } from "@/lib/actions/widgets"
import { getTestimonialsPreview, getTestimonialsByIds, getAllTestimonialsForActiveProject } from "@/lib/actions/testimonials"
// Brand settings import removed - widgets no longer inherit brand colors on creation
import { toast } from "sonner"


// Re-export the Testimonial type for use elsewhere
export type WidgetTestimonial = Testimonial;

// ===================== DEFAULT DEMO TESTIMONIALS ===================== //
// Shown when user has no testimonials selected (fallback)
const DEFAULT_DEMO_TESTIMONIALS: WidgetTestimonial[] = [
  {
    id: "demo-1",
    authorName: "Sarah Chen",
    authorTitle: "Senior FE Engineer",
    rating: 5,
    content: "This widget builder is an absolute game-changer. I used to spend hours custom-coding testimonials for every landing page. Now I just tweak a few sliders and copy the embed code.",
    source: "TWITTER",
    date: "Oct 15, 2023"
  },
  {
    id: "demo-2",
    authorName: "Mike Ross",
    authorTitle: "Product Designer",
    rating: 5,
    content: "The widget builder is an absolute game-changer. I used to spend hours custom-coding testimonials for every landing page.",
    source: "TWITTER",
    date: "Oct 14, 2023"
  },
  {
    id: "demo-3",
    authorName: "Amanda Lee",
    authorTitle: "Startup Founder",
    rating: 4,
    content: "This widget builder is an absolute game-changer. Great for quick prototyping.",
    source: "LINKEDIN",
    date: "Oct 13, 2023"
  },
];



// ===================== REUSABLE COLOR PICKER FIELD ===================== //
// A single color swatch + hex input field for any color property
interface ColorPickerFieldProps {
  label: string
  value: string
  onChange: (newValue: string) => void
}

function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Ensure value is always a string to prevent crashes
  const safeValue = value || "#000000"

  const handleColorClick = () => {
    inputRef.current?.click()
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hex = e.target.value
    // Allow input even without #
    if (!hex.startsWith('#') && hex.length > 0) {
      hex = '#' + hex
    }
    // Basic validation: only update if it looks like a valid hex
    if (/^#([0-9A-Fa-f]{0,6})$/.test(hex) || hex === '') {
      onChange(hex || '#000000')
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-zinc-400">{label}</Label>
      <div className="flex items-center gap-3">
        {/* Hidden native color picker */}
        <input
          ref={inputRef}
          type="color"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        {/* Visible color swatch (clickable) */}
        <button
          type="button"
          onClick={handleColorClick}
          className="h-8 w-8 rounded-lg border border-zinc-700 cursor-pointer transition-transform hover:scale-105 shrink-0"
          style={{ backgroundColor: safeValue }}
          aria-label={`Pick ${label}`}
        />
        {/* Hex text input */}
        <Input
          type="text"
          value={safeValue.toUpperCase()}
          onChange={handleHexChange}
          placeholder="#FFFFFF"
          className="h-8 w-28 bg-zinc-900 border-zinc-700 text-white text-xs font-mono uppercase"
        />
      </div>
    </div>
  )
}


// ===================== PROPS INTERFACE ===================== //
interface WidgetEditorClientProps {
  widgetId: string;
}

export function WidgetEditorClient({ widgetId }: WidgetEditorClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewWidget = searchParams.get('new') === 'true'
  // Preview testimonials for canvas display - start empty, fetch will populate
  const [previewTestimonials, setPreviewTestimonials] = React.useState<WidgetTestimonial[]>([])
  const [isLoadingPreviewTestimonials, setIsLoadingPreviewTestimonials] = React.useState(true)

  // All testimonials for modal (lazy-loaded when modal opens)
  const [allTestimonials, setAllTestimonials] = React.useState<WidgetTestimonial[]>([])
  const [isLoadingAllTestimonials, setIsLoadingAllTestimonials] = React.useState(false)
  const [hasFetchedAllTestimonials, setHasFetchedAllTestimonials] = React.useState(false)

  // Transform DB testimonials to WidgetTestimonial format
  const mapToWidgetTestimonial = React.useCallback((t: any): WidgetTestimonial => ({
    id: t.id,
    type: t.type || 'text',
    authorName: t.author_name || t.authorName || 'Anonymous',
    authorTitle: t.author_title || t.authorTitle || '',
    authorAvatarUrl: t.author_avatar_url || t.authorAvatarUrl,
    rating: t.rating ?? 5,
    content: t.content || t.text || '',
    source: t.source || 'MANUAL',
    date: new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    videoUrl: t.video_url || t.videoUrl || null,
    videoThumbnail: t.video_thumbnail || t.videoThumbnail || null,
    attachments: t.attachments || [],
  }), [])

  // Fetch all testimonials for modal (lazy-loaded)
  const fetchAllTestimonials = React.useCallback(async () => {
    if (hasFetchedAllTestimonials || isLoadingAllTestimonials) return

    setIsLoadingAllTestimonials(true)
    try {
      const { data } = await getAllTestimonialsForActiveProject()
      if (data && data.length > 0) {
        const mapped = data.map(mapToWidgetTestimonial)
        setAllTestimonials(mapped)
      } else {
        setAllTestimonials([])
      }
      setHasFetchedAllTestimonials(true)
    } catch (err) {
      console.error("Failed to fetch all testimonials:", err)
      setAllTestimonials([])
    } finally {
      setIsLoadingAllTestimonials(false)
    }
  }, [hasFetchedAllTestimonials, isLoadingAllTestimonials, mapToWidgetTestimonial])

  // Helper to check if widgetId is a UUID (saved widget) vs widget type
  const isUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  const isSavedWidget = isUUID(widgetId)

  // Initialize config using the helper from widget-config.ts
  // For new widgets (widget type), create default config
  // For saved widgets (UUID), we'll load from DB in useEffect
  const [config, setConfig] = React.useState<WidgetConfig>(() => {
    if (isSavedWidget) {
      // Placeholder config while loading - will be replaced by DB data
      return createWidgetConfig('social-card' as WidgetType, {
        id: widgetId,
        name: "Loading...",
        projectId: "loading"
      })
    }
    return createWidgetConfig(widgetId as WidgetType, {
      id: "draft_widget",
      name: "My Widget",
      projectId: "draft"
    })
  })

  // Loading state for saved widgets
  const [isLoadingWidget, setIsLoadingWidget] = React.useState(isSavedWidget)

  // Brand settings are no longer applied to new widgets - they use default config colors


  const [device, setDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop")
  const [expandedSections, setExpandedSections] = React.useState<string[]>(["appearance"])
  const [isEditingName, setIsEditingName] = React.useState(false)
  const [isSelectTestimonialsOpen, setIsSelectTestimonialsOpen] = React.useState(false)
  const [isSharePanelOpen, setIsSharePanelOpen] = React.useState(false)
  // Initialize with empty array - will be populated when testimonials load
  const [selectedTestimonialIds, setSelectedTestimonialIds] = React.useState<string[]>([])
  const nameInputRef = React.useRef<HTMLInputElement>(null)

  // Saving state
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [savedWidgetId, setSavedWidgetId] = React.useState<string | null>(isSavedWidget ? widgetId : null)



  // Load saved widget from database
  React.useEffect(() => {
    if (isSavedWidget) {
      loadSavedWidget()
    }
  }, [widgetId])

  const loadSavedWidget = async () => {
    setIsLoadingWidget(true)
    try {
      const result = await getWidgetById(widgetId)
      if (result.data) {
        const savedWidget = result.data
        // Reconstruct full config from saved data
        const fullConfig: WidgetConfig = {
          id: savedWidget.id,
          name: savedWidget.name,
          type: savedWidget.type as WidgetType,
          projectId: savedWidget.project_id,
          createdAt: savedWidget.created_at,
          updatedAt: savedWidget.updated_at,
          ...savedWidget.config,
        } as WidgetConfig

        setConfig(fullConfig)
        setSavedWidgetId(savedWidget.id)

        // Load selected testimonials by IDs (same pattern as Wall of Love)
        if (savedWidget.selected_testimonial_ids && savedWidget.selected_testimonial_ids.length > 0) {
          // Fetch ONLY the selected testimonials by their IDs
          const { data: testimonialData } = await getTestimonialsByIds(
            savedWidget.selected_testimonial_ids
          )

          if (testimonialData && testimonialData.length > 0) {
            const mapped = testimonialData.map(mapToWidgetTestimonial)
            setPreviewTestimonials(mapped)
            // Only set IDs for testimonials that actually exist (auto-cleanup of deleted ones)
            setSelectedTestimonialIds(mapped.map(t => t.id))
          } else {
            // All saved testimonials were deleted - show empty (not demo)
            setPreviewTestimonials([])
            setSelectedTestimonialIds([])
          }

          hasInitializedSelection.current = true
        } else if (isNewWidget && !hasInitializedSelection.current) {
          // New widget with no selection: Auto-select the first available testimonial
          // or fallback to Sarah Chen demo
          setIsLoadingPreviewTestimonials(true)
          try {
            // Fetch just 1 testimonial
            const { data: recent } = await getTestimonialsPreview(1)

            if (recent && recent.length > 0) {
              const mapped = recent.map(mapToWidgetTestimonial)
              setPreviewTestimonials(mapped)
              setSelectedTestimonialIds(mapped.map(t => t.id))
            } else {
              // No testimonials found - use first demo (Sarah Chen)
              setPreviewTestimonials([DEFAULT_DEMO_TESTIMONIALS[0]])
              setSelectedTestimonialIds([])
            }
          } catch (error) {
            console.error("Failed to fetch initial testimonial:", error)
            setPreviewTestimonials([DEFAULT_DEMO_TESTIMONIALS[0]])
          } finally {
            setIsLoadingPreviewTestimonials(false)
            hasInitializedSelection.current = true
          }
        }
      } else {
        console.error('Failed to load widget:', result.error)
        // Redirect to design page if widget not found
        router.push('/design')
      }
    } catch (error) {
      console.error('Error loading widget:', error)
      router.push('/design')
    } finally {
      setIsLoadingWidget(false)
      setIsLoadingPreviewTestimonials(false) // Also turn off preview loading for saved widgets
    }
  }

  // For NEW widgets: Fetch first 3 recent testimonials
  const hasInitializedSelection = React.useRef(false)
  React.useEffect(() => {
    const loadPreviewTestimonials = async () => {
      // Skip if already initialized or if this is a saved widget (handled separately)
      if (hasInitializedSelection.current || isSavedWidget) return

      setIsLoadingPreviewTestimonials(true)
      try {
        const { data } = await getTestimonialsPreview(3)
        if (data && data.length > 0) {
          // User has testimonials - show them
          const mapped = data.map(mapToWidgetTestimonial)
          setPreviewTestimonials(mapped)
          setSelectedTestimonialIds(mapped.map(t => t.id))
        } else {
          // No testimonials - show demo (but don't store demo IDs)
          setPreviewTestimonials(DEFAULT_DEMO_TESTIMONIALS)
          setSelectedTestimonialIds([])
        }
        hasInitializedSelection.current = true
      } catch (error) {
        console.error("Failed to load preview testimonials:", error)
        setPreviewTestimonials(DEFAULT_DEMO_TESTIMONIALS)
        setSelectedTestimonialIds([])
      } finally {
        setIsLoadingPreviewTestimonials(false)
      }
    }

    loadPreviewTestimonials()
  }, [isSavedWidget, mapToWidgetTestimonial])

  React.useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [isEditingName])

  const handleNameSave = () => {
    if (config.name.trim() === "") {
      updateConfig("name", "My Widget")
    }
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave()
    }
  }

  // Local state for interactions (not persisted)
  const [activeCardIndex, setActiveCardIndex] = React.useState(0)

  // ===================== Config Update Helpers ===================== //
  // These update the flat config object directly

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value, updatedAt: new Date().toISOString() } as WidgetConfig
      console.log('📦 Config Updated:', JSON.stringify(newConfig, null, 2))
      return newConfig
    })
  }

  const handleWidgetChange = (newWidgetId: string) => {
    // PRESERVE all existing settings from the current config.
    // Only update the 'type' and add type-specific defaults if not already present.

    const newType = newWidgetId as WidgetType
    const now = new Date().toISOString()

    // Start with the EXISTING config (preserving all user settings)
    let updatedConfig: WidgetConfig = {
      ...config,
      type: newType,
      updatedAt: now,
    } as WidgetConfig

    // Add type-specific defaults ONLY if they don't exist on the current config
    if (['social-card', 'minimal-card', 'quote-card'].includes(newType)) {
      updatedConfig = {
        ...updatedConfig,
        cardStyle: (config as any).cardStyle ?? 'minimal',
        maxLines: (config as any).maxLines ?? 4,
        showNavigation: (config as any).showNavigation ?? true,
      } as WidgetConfig
    } else if (['list-feed', 'grid', 'masonry', 'carousel'].includes(newType)) {
      updatedConfig = {
        ...updatedConfig,
        columns: (config as any).columns ?? 1,
        gap: (config as any).gap ?? 16,
        itemsPerPage: (config as any).itemsPerPage ?? 10,
        navigationType: (config as any).navigationType ?? 'arrows',
      } as WidgetConfig
    } else if (['rating-badge', 'trust-badge'].includes(newType)) {
      updatedConfig = {
        ...updatedConfig,
        size: (config as any).size ?? 'medium',
        layout: (config as any).layout ?? 'row',
      } as WidgetConfig
    } else if (['wall-glassmorphism', 'wall-brutalist', 'wall-cinematic', 'wall-classic'].includes(newType)) {
      const wallStyleMap: Record<string, string> = {
        'wall-glassmorphism': 'glassmorphism',
        'wall-brutalist': 'brutalist',
        'wall-cinematic': 'cinematic',
        'wall-classic': 'classic',
      }
      updatedConfig = {
        ...updatedConfig,
        wallStyle: (config as any).wallStyle ?? wallStyleMap[newType] ?? 'glassmorphism',
        headerTitle: (config as any).headerTitle ?? 'Wall of Love',
        headerSubtitle: (config as any).headerSubtitle ?? "We're loved by entrepreneurs, creators, freelancers and agencies from all over the world.",
        showHeader: (config as any).showHeader ?? true,
        columns: (config as any).columns ?? 5,
      } as WidgetConfig
    }

    console.log('🔄 Widget Changed:', newType, JSON.stringify(updatedConfig, null, 2))
    setConfig(updatedConfig)
    // NOTE: We do NOT navigate. The config.type IS the source of truth.
    // The URL widgetId is only used for initial load.
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  // @ts-ignore
  const isDarkMode = config.colorScheme === 'dark' || config.colorScheme === 'auto'

  // Display testimonials - use previewTestimonials directly (already fetched/filtered)
  const displayTestimonials = React.useMemo(() => {
    // While loading for new widgets, return empty (loading state will handle display)
    if (isLoadingPreviewTestimonials && !isSavedWidget) {
      return []
    }

    // If we have testimonials, show them
    if (previewTestimonials.length > 0) {
      return previewTestimonials
    }

    // NEW widget (not saved yet): show DEMO testimonials as template preview
    // SAVED widget with deleted testimonials: show empty (not demo)
    if (!isSavedWidget && !savedWidgetId) {
      return DEFAULT_DEMO_TESTIMONIALS
    }

    // Saved widget with no testimonials - show empty
    return []
  }, [previewTestimonials, isSavedWidget, savedWidgetId, isLoadingPreviewTestimonials])

  // Count of selected testimonials (selectedTestimonialIds never contains demo IDs)
  const realSelectedCount = selectedTestimonialIds.length

  const activeTestimonial = displayTestimonials[activeCardIndex % displayTestimonials.length] || displayTestimonials[0]

  const handleNextCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % displayTestimonials.length)
  }

  const handlePrevCard = () => {
    setActiveCardIndex((prev) => {
      const len = displayTestimonials.length || 1
      return (prev - 1 + len) % len
    })
  }

  // ===================== Save Widget Handler ===================== //
  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('saving')

    try {
      // selectedTestimonialIds is already clean (never contains demo IDs)
      const result = await saveWidget({
        id: savedWidgetId || undefined, // Pass existing ID if we've saved before
        name: config.name.trim(),
        type: config.type,
        config: config as Record<string, any>,
        selectedTestimonialIds: selectedTestimonialIds,
        status: 'published',
      })

      if (result.success && result.data) {
        setSavedWidgetId(result.data.id)
        setSaveStatus('saved')
        toast.success('Widget saved successfully!')

        // Update URL to reflect the saved widget ID (without full page reload)
        // This allows subsequent saves to update the same widget
        if (!savedWidgetId) {
          // First save - update the URL
          window.history.replaceState({}, '', `/canvas/${result.data.id}`)
        }

        // Reset status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000)
        return result.data.id
      } else {
        console.error('Save failed:', result.error)
        toast.error(result.error || 'Failed to save widget. Please try again.')
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
        return null
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('An unexpected error occurred. Please try again.')
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return null
    } finally {
      setIsSaving(false)
    }
  }

  // Handle save button click
  const handleSaveClick = () => {
    handleSave()
  }

  // Handle embed button click - just open the panel (auto-save removed)
  const handleEmbedClick = () => {
    setIsSharePanelOpen(true)
  }

  // Show loading state while fetching saved widget
  if (isLoadingWidget) {
    return (
      <div className="flex flex-col h-screen bg-[#09090b] text-white items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
        <p className="text-zinc-400">Loading widget...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-white overflow-hidden font-sans">
      {/* TOP HEADER - Matching Wall of Love Design */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-[#09090b] shrink-0">
        {/* Left Side: Back Button + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-zinc-400 hover:text-white"
            aria-label="Go back"
            style={{ backgroundColor: 'transparent' }}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-white font-semibold text-lg">Widget Builder</h1>
        </div>

        {/* Right Side: Editable Name + Buttons */}
        <div className="flex items-center gap-4">
          {/* Editable Widget Name - Ghost/Inline Style */}
          <div
            className={cn(
              "group flex items-center gap-2 px-2 py-1 rounded-md cursor-text transition-all",
              isEditingName
                ? "bg-[#18181B] border border-white/10 ring-1 ring-white/20"
                : "hover:bg-white/[0.04]"
            )}
            onClick={() => !isEditingName && setIsEditingName(true)}
          >
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={config.name}
                onChange={(e) => updateConfig("name", e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleNameKeyDown}
                className="text-sm font-medium text-white bg-transparent outline-none min-w-[120px]"
                style={{ backgroundColor: 'transparent' }}
              />
            ) : (
              <>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{config.name}</span>
                <Pencil className="h-3 w-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </div>

          {/* Embed Code Button - Tertiary/Outlined */}
          <Button
            onClick={handleEmbedClick}
            variant="ghost"
            className="h-9 px-4 bg-transparent border border-white/10 text-white font-medium text-sm rounded-lg hover:bg-white/[0.04] hover:border-white/20 active:scale-[0.98] transition-all gap-2"
          >
            <Code className="h-4 w-4" />
            Embed Code
          </Button>

          {/* Save Button - Primary Lime */}
          <Button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="h-9 px-4 bg-[#BFFF00] text-black font-semibold text-sm rounded-lg hover:bg-[#D4FF50] active:scale-[0.98] transition-all gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR - DESIGN LIBRARY */}
        <div className="w-[280px] flex flex-col border-r border-zinc-800 bg-[#0c0c0e] shrink-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            <div className="pb-2 px-1">
              <Link href="/dashboard/widgets" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-medium uppercase tracking-wide">
                Design Library
              </Link>
            </div>
            {WIDGET_MODELS.map((widget) => {
              const isActive = config.type === widget.id
              return (
                <button
                  key={widget.id}
                  onClick={() => handleWidgetChange(widget.id)}
                  className={cn(
                    "w-full text-left rounded-xl border transition-all duration-200 overflow-hidden group relative flex flex-col",
                    isActive
                      ? "border-transparent bg-zinc-900/50 ring-1 ring-indigo-500"
                      : "border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40"
                  )}
                >
                  <div className={cn(
                    "h-28 flex items-center justify-center transition-colors w-full",
                    isActive ? `bg-gradient-to-br ${widget.color}` : "bg-zinc-900/40 group-hover:bg-zinc-800/60"
                  )}>
                    <widget.icon className={cn(
                      "h-8 w-8 transition-colors",
                      isActive ? widget.iconColor : "text-zinc-600 group-hover:text-zinc-500"
                    )} />
                  </div>
                  <div className="p-3 bg-[#0c0c0e]/50 w-full border-t border-zinc-800/50">
                    <h4 className={cn("text-sm font-medium mb-0.5", isActive ? "text-white" : "text-zinc-300")}>
                      {widget.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 line-clamp-1 leading-relaxed">
                      {widget.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Select Testimonials - Moved here */}
          <div className="p-4 border-t border-zinc-800">
            <Button
              onClick={() => {
                fetchAllTestimonials()
                setIsSelectTestimonialsOpen(true)
              }}
              className="w-full h-10 bg-[#7C3AED] hover:bg-[#7C3AED] hover:opacity-90 text-white gap-2 font-medium transition-opacity"
            >
              <ListFilter className="h-4 w-4" />
              Select Testimonials ({realSelectedCount})
            </Button>
          </div>
        </div>

        {/* CENTER - CANVAS */}
        <div className={cn("flex-1 flex flex-col min-w-0 relative transition-colors duration-300", isDarkMode ? "bg-[#09090b]" : "bg-[#fafafa]")}>
          {/* Canvas Area */}
          <div className={cn(
            "flex-1 overflow-auto relative flex items-start justify-center p-8 pt-12 transition-colors duration-300",
            isDarkMode ? "bg-[#09090b]" : "bg-[#fafafa]"
          )}>
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(${isDarkMode ? '#27272a' : '#e4e4e7'} 1px, transparent 1px), linear-gradient(90deg, ${isDarkMode ? '#27272a' : '#e4e4e7'} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                opacity: 0.8
              }}
            />

            <div
              className={cn(
                "transition-all duration-300 mx-auto z-10",
                device === "mobile" ? "w-[375px]" : device === "tablet" ? "w-[768px]" : "w-full"
              )}
              style={{
                maxWidth: device === "desktop" ? `${config.maxWidth}px` : undefined,
                fontFamily: config.fontFamily
              }}
            >
              <div className="min-h-[400px] flex flex-col justify-start items-center relative">
                <div id="widget-export-container" className={cn("w-full", isDarkMode ? "dark" : "")} style={{ fontFamily: config.fontFamily }}>

                  {/* LOADING STATE - When fetching testimonials for new widgets */}
                  {isLoadingPreviewTestimonials && !isSavedWidget && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-4" />
                      <p className="text-sm text-zinc-500">Loading testimonials...</p>
                    </div>
                  )}

                  {/* EMPTY STATE - When no testimonials available (after loading) */}
                  {!isLoadingPreviewTestimonials && displayTestimonials.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="text-zinc-500 mb-4">
                        <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-zinc-400 mb-2">No Testimonials Selected</h3>
                      <p className="text-sm text-zinc-500 max-w-xs mb-4">
                        The selected testimonials have been deleted. Click "Select Testimonials" to choose new ones.
                      </p>
                    </div>
                  )}

                  {/* RENDER BASED ON CONFIG TYPE */}
                  {displayTestimonials.length > 0 && config.type === "social-card" && isCardWidget(config) && (
                    <SocialCard
                      config={config}
                      testimonial={activeTestimonial}
                      handleNextCard={handleNextCard}
                      handlePrevCard={handlePrevCard}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {displayTestimonials.length > 0 && config.type === "minimal-card" && isCardWidget(config) && (
                    <MinimalCard
                      config={config}
                      testimonial={activeTestimonial}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {displayTestimonials.length > 0 && config.type === "rating-badge" && isBadgeWidget(config) && (
                    <RatingBadge
                      config={config}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {displayTestimonials.length > 0 && isCollectionWidget(config) && (
                    <div className={cn("transition-all duration-300", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>
                      <PraiseWidget
                        testimonials={displayTestimonials}
                        // @ts-ignore - Temporary mapping
                        layout={config.type === "grid" ? "grid" : config.type === "list-feed" ? "list" : "carousel"}
                        columns={config.columns}
                        showRating={config.showRating}
                        showSource={config.showSourceIcon}
                        compact={false}
                        colorConfig={{
                          primaryColor: config.primaryColor,
                          ratingColor: config.ratingColor,
                          accentColor: config.accentColor,
                          textColor: config.textColor,
                          fontFamily: config.fontFamily,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - DESIGN & SETTINGS */}
        <div className="w-[340px] flex flex-col border-l border-zinc-800 bg-[#09090b] shrink-0 font-sans">
          <div className="h-20 flex flex-col justify-center px-6 border-b border-zinc-800/50">
            <h2 className="font-semibold text-base text-white">Design Settings</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Customize your design</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Appearance Section */}
            <div className="border-b border-zinc-800/50">
              <button
                onClick={() => toggleSection('appearance')}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-200">Appearance</span>
                </div>
                {expandedSections.includes('appearance') ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </button>

              {expandedSections.includes('appearance') && (
                <div className="px-4 pb-6 space-y-6">

                  {/* Card Style (Card widgets only) */}
                  {isCardWidget(config) && (
                    <div className="space-y-3">
                      <Label className="text-xs font-medium text-zinc-400">Card Style</Label>
                      <div className="grid grid-cols-3 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                        {(["minimal", "modern", "brutal"] as const).map((style) => (
                          <button
                            key={style}
                            onClick={() => updateConfig('cardStyle', style)}
                            className={cn(
                              "px-2 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                              config.cardStyle === style ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50"
                            )}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ========== COLOR SETTINGS ========== */}
                  <ColorPickerField
                    label="Primary Color"
                    value={config.primaryColor}
                    onChange={(v) => updateConfig('primaryColor', v)}
                  />
                  <ColorPickerField
                    label="Rating Color"
                    value={config.ratingColor}
                    onChange={(v) => updateConfig('ratingColor', v)}
                  />
                  <ColorPickerField
                    label="Accent Color"
                    value={config.accentColor}
                    onChange={(v) => updateConfig('accentColor', v)}
                  />
                  <ColorPickerField
                    label="Text Color"
                    value={config.textColor}
                    onChange={(v) => updateConfig('textColor', v)}
                  />

                  {/* Border Radius */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-zinc-400">Border Radius</Label>
                      <span className="text-xs text-zinc-500 font-mono">{config.borderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={config.borderRadius}
                      onChange={(e) => updateConfig('borderRadius', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>

                  {/* Color Scheme */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-zinc-400">Color Scheme</Label>
                    <div className="grid grid-cols-3 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                      {(["light", "dark", "auto"] as const).map((scheme) => (
                        <button
                          key={scheme}
                          onClick={() => updateConfig('colorScheme', scheme)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                            config.colorScheme === scheme ? "bg-zinc-800 text-white shadow-sm border border-zinc-700" : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50"
                          )}
                        >
                          {scheme}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max Width */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-zinc-400">Max Width</Label>
                      <span className="text-xs text-zinc-500 font-mono">{config.maxWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="300"
                      max="1400"
                      step="10"
                      value={config.maxWidth}
                      onChange={(e) => updateConfig('maxWidth', Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                    />
                  </div>

                  {/* Columns (Collection only) */}
                  {isCollectionWidget(config) && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-zinc-400">Columns</Label>
                        <span className="text-xs text-zinc-500 font-mono">{config.columns}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        value={config.columns}
                        onChange={(e) => updateConfig('columns', Number(e.target.value) as 1 | 2 | 3 | 4)}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="border-b border-zinc-800/50">
              <button
                onClick={() => toggleSection('content')}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-200">Content</span>
                </div>
                {expandedSections.includes('content') ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </button>

              {expandedSections.includes('content') && (
                <div className="px-4 pb-6 space-y-4">
                  {/* Font Family */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-400">Font Family</Label>
                    <ModernFontPicker
                      value={config.fontFamily}
                      onChange={(font) => updateConfig('fontFamily', font)}
                      compact
                    />
                  </div>

                  {isCardWidget(config) && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-white">Max Lines</Label>
                        <span className="text-xs text-zinc-500 font-mono">{config.maxLines} lines</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={config.maxLines}
                        onChange={(e) => updateConfig('maxLines', Number(e.target.value))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                      <p className="text-[10px] text-zinc-500">Text exceeding this limit will show "Read more".</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Visibility Section */}
            <div className="border-b border-zinc-800/50">
              <button
                onClick={() => toggleSection('visibility')}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-200">Visibility</span>
                </div>
                {expandedSections.includes('visibility') ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </button>

              {expandedSections.includes('visibility') && (
                <div className="px-4 pb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-zinc-300">Show Date</Label>
                    <Switch checked={config.showDate} onCheckedChange={(c) => updateConfig('showDate', c)} className="data-[state=checked]:bg-white scale-75" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-zinc-300">Show Source Icon</Label>
                    <Switch checked={config.showSourceIcon} onCheckedChange={(c) => updateConfig('showSourceIcon', c)} className="data-[state=checked]:bg-white scale-75" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-zinc-300">Show Rating Stars</Label>
                    <Switch checked={config.showRating} onCheckedChange={(c) => updateConfig('showRating', c)} className="data-[state=checked]:bg-white scale-75" />
                  </div>
                  {config.type === 'social-card' && (
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-zinc-300">Show Navigation</Label>
                      <Switch checked={config.showNavigation} onCheckedChange={(c) => updateConfig('showNavigation', c)} className="data-[state=checked]:bg-white scale-75" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Select Testimonials Modal */}
      <SelectTestimonialsModal
        isOpen={isSelectTestimonialsOpen}
        onClose={() => setIsSelectTestimonialsOpen(false)}
        testimonials={allTestimonials}
        selectedIds={selectedTestimonialIds}
        onSelectionChange={(newIds) => {
          setSelectedTestimonialIds(newIds)
          // Update preview testimonials based on new selection
          const selected = allTestimonials.filter(t => newIds.includes(t.id))
          if (selected.length > 0) {
            setPreviewTestimonials(selected)
          } else {
            setPreviewTestimonials(DEFAULT_DEMO_TESTIMONIALS)
          }
        }}
      />

      {/* Share Widget Panel */}
      <ShareWidgetPanel
        isOpen={isSharePanelOpen}
        onClose={() => setIsSharePanelOpen(false)}
        widgetId={savedWidgetId || widgetId}
        widgetName={config.name}
      />
    </div>
  )
}
