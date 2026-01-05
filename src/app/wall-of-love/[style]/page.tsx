"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { getAllTestimonialsForActiveProject, getTestimonialsByIds, getTestimonialsPreview } from "@/lib/actions/testimonials"
// Brand settings import removed - walls no longer inherit brand colors on creation
import {
    Star,
    ArrowLeft,
    Pencil,
    Menu,
    Code,
    Twitter,
    Linkedin,
    Facebook,
    Loader2,
    MessageSquare,
    Video,
    Play,
    Pause,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShareWallOfLoveSidebar } from "@/components/ShareWallOfLoveSidebar"
import { WallDesignStudioSidebar, TabType } from "@/components/WallDesignStudioSidebar"
import { SelectTestimonialsModal, Testimonial } from "@/components/widgets/SelectTestimonialsModal"
import Logo from "@/components/ui/Logo"
import { WallConfig, DEFAULT_WALL_CONFIG, UpdateConfigFn } from "@/types/wall-config"
import { VideoPlayer } from "@/components/ui/VideoPlayer"
import { saveWall, getWallById } from "@/lib/actions/walls"
import { toast, Toaster } from "sonner"

// ===================== TESTIMONIALS DATA ===================== //
// Static demo testimonials for Wall of Love template preview when no real testimonials exist
const DEMO_TESTIMONIALS: Testimonial[] = [
    {
        id: 'demo-1',
        type: 'text' as const,
        authorName: 'Sarah Johnson',
        authorTitle: 'Product Manager at TechCorp',
        authorAvatarUrl: undefined,
        rating: 5,
        content: 'This product has completely transformed our workflow. The team collaboration features are incredible, and the customer support is top-notch. Highly recommend to anyone looking for a reliable solution!',
        source: 'LINKEDIN',
        date: 'Dec 15, 2024',
        videoUrl: null,
        videoThumbnail: null,
        attachments: []
    },
    {
        id: 'demo-2',
        type: 'text' as const,
        authorName: 'Michael Chen',
        authorTitle: 'Startup Founder',
        authorAvatarUrl: undefined,
        rating: 5,
        content: 'After trying dozens of tools, this is the one that stuck. Simple, powerful, and beautiful. My team adopted it instantly.',
        source: 'TWITTER',
        date: 'Dec 10, 2024',
        videoUrl: null,
        videoThumbnail: null,
        attachments: []
    },
    {
        id: 'demo-3',
        type: 'text' as const,
        authorName: 'Emily Rodriguez',
        authorTitle: 'Marketing Director',
        authorAvatarUrl: undefined,
        rating: 5,
        content: 'The best investment we made this year. ROI was visible within the first month. Cannot imagine going back to our old process.',
        source: 'G2',
        date: 'Dec 8, 2024',
        videoUrl: null,
        videoThumbnail: null,
        attachments: []
    },
    {
        id: 'demo-4',
        type: 'text' as const,
        authorName: 'James Wilson',
        authorTitle: 'CTO at InnovateLabs',
        authorAvatarUrl: undefined,
        rating: 5,
        content: 'Outstanding platform with exceptional attention to detail. The onboarding experience was seamless, and the features exceed our expectations. Our engineering team loves working with it daily.',
        source: 'PRODUCT_HUNT',
        date: 'Dec 5, 2024',
        videoUrl: null,
        videoThumbnail: null,
        attachments: []
    },
    {
        id: 'demo-5',
        type: 'text' as const,
        authorName: 'Lisa Anderson',
        authorTitle: 'Small Business Owner',
        authorAvatarUrl: undefined,
        rating: 4,
        content: 'Finally, a tool that gets it right! Easy to use, affordable, and packed with features. Perfect for small businesses like mine.',
        source: 'GOOGLE',
        date: 'Dec 1, 2024',
        videoUrl: null,
        videoThumbnail: null,
        attachments: []
    },
    {
        id: 'demo-6',
        type: 'text' as const,
        authorName: 'David Kim',
        authorTitle: 'Head of Operations',
        authorAvatarUrl: undefined,
        rating: 5,
        content: 'Game-changer for our operations. Saved us countless hours every week. The automation features alone are worth every penny.',
        source: 'CAPTERRA',
        date: 'Nov 28, 2024',
        videoUrl: null,
        videoThumbnail: null,
        attachments: []
    },
]

// Source icon helper - returns icon info for various testimonial sources
const BRAND_LOGOS: Record<string, string> = {
    'airbnb': 'airbnb.svg',
    'amazon': 'amazon.svg',
    'app store': 'app-store.svg',
    'app_store': 'app-store.svg',
    'apple podcasts': 'apple-podcasts.svg',
    'apple_podcasts': 'apple-podcasts.svg',
    'appsumo': 'appsumo.svg',
    'capterra': 'capterra.svg',
    'chrome web store': 'chrome-web-store.svg',
    'chrome_web_store': 'chrome-web-store.svg',
    'facebook': 'facebook.svg',
    'fiverr': 'fiverr.svg',
    'g2': 'g2.svg',
    'google': 'google.svg',
    'homestars': 'homestars.svg',
    'instagram': 'instagram.svg',
    'linkedin': 'linkedin.svg',
    'play store': 'play-store.svg',
    'play_store': 'play-store.svg',
    'product hunt': 'product-hunt.svg',
    'product_hunt': 'product-hunt.svg',
    'realtor': 'realtor.svg',
    'reddit': 'reddit.svg',
    'skillshare': 'skillshare.svg',
    'sourceforge': 'sourceforge.svg',
    'tiktok': 'tiktok.svg',
    'trustpilot': 'trustpilot.svg',
    'twitter': 'twitter-x.svg',
    'twitter x': 'twitter-x.svg',
    'udemy': 'udemy.svg',
    'whop': 'whop.svg',
    'wordpress': 'wordpress.svg',
    'yelp': 'yelp.svg',
    'youtube': 'youtube.svg',
    'zillow': 'zillow.svg'
};

const getBrandLogoUrl = (source: string): string | null => {
    const s = source.toLowerCase().trim();
    if (BRAND_LOGOS[s]) {
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/Brands/${BRAND_LOGOS[s]}`;
    }
    const normalized = s.replace(/[-_]/g, ' ');
    if (BRAND_LOGOS[normalized]) {
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/Brands/${BRAND_LOGOS[normalized]}`;
    }
    return null;
};

// Source icon helper - returns icon info for various testimonial sources
const getSourceIcon = (source: string) => {
    const s = (source || '').toUpperCase().trim();
    const imageUrl = getBrandLogoUrl(source);

    if (imageUrl) {
        // Return image URL with a white background style standard for logos
        return { imageUrl, bg: 'bg-white', isImage: true };
    }

    // Twitter/X (Fallback if not in map, though map handles it)
    if (s.includes('TWITTER') || s === 'X') {
        return { icon: Twitter, color: 'text-white', bg: 'bg-black' }
    }
    // LinkedIn
    if (s.includes('LINKEDIN')) {
        return { icon: Linkedin, color: 'text-white', bg: 'bg-[#0A66C2]' }
    }
    // Facebook
    if (s.includes('FACEBOOK')) {
        return { icon: Facebook, color: 'text-white', bg: 'bg-[#1877F2]' }
    }
    // Email
    if (s.includes('EMAIL')) {
        return { icon: null, color: 'text-white', bg: 'bg-zinc-700', text: '@' }
    }
    // Manual / Other - Use chat bubble icon like dashboard
    return { icon: MessageSquare, color: 'text-white', bg: 'bg-zinc-700' }
}

// ===================== TEMPLATE CONFIGURATIONS ===================== //
// Only Classic as the template
const TEMPLATES = [
    {
        id: "classic",
        name: "Classic",
        subtitle: "Modular Layout",
        preview: "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50",
        previewImage: "/classicwall.png",
        // previewImage: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/Walls/classicwall.png`,
    },
]

// Card themes - text only, no preview images
const CARD_THEMES = [
    {
        id: "glassmorphism",
        name: "Minimal",
        cardBg: "bg-white/70 backdrop-blur-md",
        cardBorder: "border border-white/50",
        cardShadow: "shadow-lg shadow-purple-500/5",
    },
    {
        id: "cinematic",
        name: "Dark",
        cardBg: "bg-[#13131a]",
        cardBorder: "border border-purple-500/20",
        cardShadow: "shadow-lg shadow-purple-500/10",
    },
    {
        id: "brutalist",
        name: "Bold",
        cardBg: "bg-white",
        cardBorder: "border-2 border-black",
        cardShadow: "shadow-[4px_4px_0px_0px_#000]",
    },
]

// ===================== HELPER COMPONENTS ===================== //

const ExpandableContent = ({
    content,
    fontFamily,
    textColorClass,
    subtitleColorClass
}: {
    content: string
    fontFamily?: string
    textColorClass: string
    subtitleColorClass: string
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false)
    // Limit to 200 chars as requested
    const shouldTruncate = content.length > 200

    if (!shouldTruncate) {
        return (
            <p
                className={cn("text-sm leading-relaxed break-words whitespace-pre-wrap", textColorClass)}
                style={{ fontFamily }}
            >
                {content}
            </p>
        )
    }

    return (
        <div>
            <p
                className={cn(
                    "text-sm leading-relaxed break-words whitespace-pre-wrap",
                    textColorClass,
                    !isExpanded && "line-clamp-6"
                )}
                style={{ fontFamily }}
            >
                {content}
            </p>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                }}
                className={cn(
                    "text-xs font-medium mt-2 hover:underline focus:outline-none flex items-center gap-1",
                    subtitleColorClass
                )}
            >
                {isExpanded ? "Read Less" : "Read More"}
            </button>
        </div>
    )
}


interface WallOfLovePageProps {
    params: Promise<{ style: string }>
}

export default function WallOfLovePage({ params }: WallOfLovePageProps) {
    const resolvedParams = React.use(params)
    const router = useRouter()
    const searchParams = useSearchParams()


    // Check if we are in "Edit Mode" (saved wall) or "Create Mode" (new template)
    const isEditMode = React.useMemo(() =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedParams.style),
        [resolvedParams.style]
    );

    // Initial load state to prevent flash of default content
    const [isInitializing, setIsInitializing] = React.useState(true);

    // ===================== CONFIG STATE (Single Source of Truth) ===================== //
    const [config, setConfig] = React.useState<WallConfig>(DEFAULT_WALL_CONFIG)

    // Config updater function
    const updateConfig: UpdateConfigFn = React.useCallback((key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }))
    }, [])

    // ===================== UI STATE ===================== //
    const [sidebarOpen, setSidebarOpen] = React.useState(true)
    const [activeTab, setActiveTab] = React.useState<TabType>('templates')
    const [embedSidebarOpen, setEmbedSidebarOpen] = React.useState(false)
    const [isSelectTestimonialsOpen, setIsSelectTestimonialsOpen] = React.useState(false)

    // Wall ID state for saving/updating
    const [wallId, setWallId] = React.useState<string | null>(null)
    const [isSaving, setIsSaving] = React.useState(false)

    // Wall name state (metadata, not config)
    const [wallName, setWallName] = React.useState('My Wall of Love')
    const [isEditingName, setIsEditingName] = React.useState(false)
    const nameInputRef = React.useRef<HTMLInputElement>(null)

    // Handle Save
    const handleSave = async (silent = false, openEmbed = false) => {
        setIsSaving(true)
        try {
            // Generate a simple slug from name
            const baseSlug = wallName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const slug = wallId ? baseSlug : `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

            const result = await saveWall({
                id: wallId || undefined,
                name: wallName,
                slug: slug,
                config: config,
                // Only save IDs of testimonials that actually exist (auto-cleanup)
                selectedTestimonialIds: selectedTestimonials.map(t => t.id),
                isPublished: true
            })

            if (result.success && result.data) {
                setWallId(result.data.id)
                if (!silent) toast.success("Wall saved successfully!")

                // Use pushState to update URL without triggering Next.js re-fetch/remount
                // This ensures a smooth "Local Update" feel
                window.history.pushState(null, '', `/wall-of-love/${result.data.id}`)

                return result.data.id
            } else {
                toast.error(result.error || "Failed to save wall")
                return null
            }
        } catch (error) {
            console.error(error)
            toast.error("An unexpected error occurred")
            return null
        } finally {
            setIsSaving(false)
        }
    }

    const handleEmbedClick = async () => {
        // Walls are now always pre-created, so wallId should always exist
        if (wallId) {
            setEmbedSidebarOpen(true)
        } else {
            // Fallback for edge cases - show toast
            toast.error("Please save your wall first")
        }
    }

    // Effect: Handle URL actions (like opening sidebar after save redirect)
    React.useEffect(() => {
        if (searchParams.get('action') === 'embed') {
            setEmbedSidebarOpen(true)
            // Cleanup param to avoid reopening on refresh (Optional, but clean)
            // router.replace(...) - skipping for now to keep history simple
        }
    }, [searchParams])

    // ===================== OPTIMIZED TESTIMONIAL STATE ===================== //
    // selectedTestimonialIds: IDs of testimonials selected for this wall
    // selectedTestimonials: The actual testimonial data for selected IDs (fetched on load for edit mode)
    // allTestimonials: Full list of all user testimonials (fetched only when modal opens)
    const [selectedTestimonialIds, setSelectedTestimonialIds] = React.useState<string[]>([])
    const [selectedTestimonials, setSelectedTestimonials] = React.useState<Testimonial[]>([])
    const [allTestimonials, setAllTestimonials] = React.useState<Testimonial[] | null>(null)
    const [isLoadingSelected, setIsLoadingSelected] = React.useState(false)
    const [isLoadingAll, setIsLoadingAll] = React.useState(false)
    const [hasFetchedAll, setHasFetchedAll] = React.useState(false)

    // Helper to map DB records to Testimonial interface
    const mapToTestimonial = React.useCallback((t: any): Testimonial => ({
        id: t.id,
        type: t.type || 'text',
        authorName: t.author_name || 'Anonymous',
        authorTitle: t.author_title || '',
        authorAvatarUrl: t.author_avatar_url,
        rating: t.rating ?? null,
        content: t.content || '',
        source: t.source || 'MANUAL',
        date: new Date(t.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        }),
        videoUrl: t.video_url,
        videoThumbnail: t.video_thumbnail,
        attachments: t.attachments || []
    }), [])

    // Fetch existing wall data and its selected testimonials (EDIT MODE ONLY)
    React.useEffect(() => {
        const loadWall = async () => {
            // Skip for new walls - handled by loadPreviewTestimonials effect
            if (!isEditMode) return;

            const styleParam = resolvedParams.style;
            setIsLoadingSelected(true);

            try {
                const { data } = await getWallById(styleParam);
                if (data) {
                    setWallId(data.id);
                    setWallName(data.name);

                    // Load config
                    if (data.config) {
                        setConfig({ ...DEFAULT_WALL_CONFIG, ...(data.config as any) });
                    }

                    // Get saved testimonial IDs
                    let savedIds: string[] = [];
                    if ((data.config as any)?.selectedTestimonialIds?.length > 0) {
                        savedIds = (data.config as any).selectedTestimonialIds;
                    } else if (data.selected_testimonial_ids?.length > 0) {
                        savedIds = data.selected_testimonial_ids;
                    }

                    if (savedIds.length > 0) {
                        // Fetch ONLY the selected testimonials by their IDs
                        const { data: testimonialData } = await getTestimonialsByIds(savedIds);

                        if (testimonialData && testimonialData.length > 0) {
                            const mapped = testimonialData.map(mapToTestimonial);
                            setSelectedTestimonials(mapped);
                            // Only set IDs for testimonials that actually exist (auto-cleanup of deleted ones)
                            setSelectedTestimonialIds(mapped.map(t => t.id));
                        } else {
                            // All saved testimonials were deleted
                            setSelectedTestimonials([]);
                            setSelectedTestimonialIds([]);
                        }
                    } else if (searchParams.get('new') === 'true') {
                        // NEW wall with no selection: Auto-select top 6 recent testimonials
                        try {
                            const { data: recent } = await getTestimonialsPreview(6);
                            if (recent && recent.length > 0) {
                                const mapped = recent.map(mapToTestimonial);
                                setSelectedTestimonials(mapped);
                                setSelectedTestimonialIds(mapped.map(t => t.id));
                            } else {
                                // No testimonials found - will fallback to Demo in displayTestimonials
                                setSelectedTestimonials([]);
                                setSelectedTestimonialIds([]);
                            }
                        } catch (e) {
                            console.error("Failed to auto-select testimonials", e);
                        }
                    }
                } else {
                    console.error("Wall ID not found");
                }
            } catch (error) {
                console.error("Failed to load wall:", error);
            } finally {
                setIsLoadingSelected(false);
                setIsInitializing(false);
            }
        };

        loadWall();
    }, [isEditMode, resolvedParams.style, mapToTestimonial]);

    // For NEW walls: Fetch first 10 recent testimonials automatically
    React.useEffect(() => {
        const loadPreviewTestimonials = async () => {
            // Only for new walls (not edit mode)
            if (isEditMode) return;

            setIsLoadingSelected(true);
            try {
                const { data } = await getTestimonialsPreview(10);
                if (data && data.length > 0) {
                    // User has testimonials - show them
                    const mapped = data.map(mapToTestimonial);
                    setSelectedTestimonials(mapped);
                    setSelectedTestimonialIds(mapped.map(t => t.id));
                }
                // If no testimonials, selectedTestimonials stays empty
                // and displayTestimonials will use DEMO_TESTIMONIALS
            } catch (error) {
                console.error("Failed to load preview testimonials:", error);
            } finally {
                setIsLoadingSelected(false);
                setIsInitializing(false);
            }
        };

        loadPreviewTestimonials();
    }, [isEditMode, mapToTestimonial]);

    // Fetch ALL testimonials when modal opens (lazy loading)
    const fetchAllTestimonials = React.useCallback(async () => {
        if (hasFetchedAll || isLoadingAll) return;

        setIsLoadingAll(true);
        try {
            const { data } = await getAllTestimonialsForActiveProject();
            if (data && data.length > 0) {
                const mapped = data.map(mapToTestimonial);
                setAllTestimonials(mapped);
            } else {
                setAllTestimonials([]);
            }
            setHasFetchedAll(true);
        } catch (err) {
            console.error("Failed to fetch all testimonials:", err);
            setAllTestimonials([]);
        } finally {
            setIsLoadingAll(false);
        }
    }, [hasFetchedAll, isLoadingAll, mapToTestimonial]);

    // Handle opening the Select Testimonials modal
    const handleOpenSelectModal = React.useCallback(() => {
        fetchAllTestimonials();
        setIsSelectTestimonialsOpen(true);
    }, [fetchAllTestimonials]);

    // Handle selection change from modal
    const handleSelectionChange = React.useCallback((newIds: string[]) => {
        setSelectedTestimonialIds(newIds);
        // Update selectedTestimonials based on new selection
        if (allTestimonials) {
            const selected = allTestimonials.filter(t => newIds.includes(t.id));
            setSelectedTestimonials(selected);
        }
    }, [allTestimonials]);

    // Transform testimonials to the format expected by SelectTestimonialsModal
    // Logic: ONLY show user testimonials in the modal. If none, modal list is empty.
    const modalTestimonials: Testimonial[] = allTestimonials || []

    // Handle name editing
    const handleNameClick = () => {
        setIsEditingName(true)
        setTimeout(() => nameInputRef.current?.focus(), 0)
    }

    const handleNameBlur = () => {
        setIsEditingName(false)
        if (!wallName.trim()) {
            setWallName('My Wall of Love')
        }
    }

    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditingName(false)
        }
    }

    const getStyleConfig = () => {
        switch (config.style) {
            case 'glassmorphism':
                return {
                    containerBg: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50',
                    cardBg: 'bg-white/70 backdrop-blur-md',
                    cardBorder: 'border border-white/50',
                    cardShadow: 'shadow-lg shadow-purple-500/5',
                    cardRadius: 'rounded-2xl',
                    textColor: 'text-zinc-800',
                    subtitleColor: 'text-zinc-500',
                    styleName: 'Modern Masonry Glassmorphism',
                }
            case 'brutalist':
                return {
                    containerBg: 'bg-[#fffef0]',
                    cardBg: 'bg-white',
                    cardBorder: 'border-2 border-black',
                    cardShadow: 'shadow-[4px_4px_0px_0px_#000]',
                    cardRadius: 'rounded-none',
                    textColor: 'text-black',
                    subtitleColor: 'text-zinc-700',
                    styleName: 'Neo-Brutalist',
                }
            case 'cinematic':
                return {
                    containerBg: 'bg-[#0a0a0f]',
                    cardBg: 'bg-[#13131a]',
                    cardBorder: 'border border-purple-500/20',
                    cardShadow: 'shadow-lg shadow-purple-500/10',
                    cardRadius: 'rounded-xl',
                    textColor: 'text-white',
                    subtitleColor: 'text-zinc-400',
                    styleName: 'Cinematic Dark Mode',
                }
            case 'classic':
            default:
                return {
                    containerBg: 'bg-slate-50',
                    cardBg: 'bg-white',
                    cardBorder: 'border border-slate-200',
                    cardShadow: 'shadow-sm',
                    cardRadius: 'rounded-xl',
                    textColor: 'text-zinc-900',
                    subtitleColor: 'text-zinc-500',
                    styleName: 'Classic Layout',
                }
        }
    }

    // Get current card theme styling - matches embed page exactly
    const getCardThemeConfig = () => {
        const theme = CARD_THEMES.find(t => t.id === config.cardTheme)
        const isDarkTheme = config.cardTheme === 'cinematic'

        if (theme) {
            return {
                cardBg: theme.cardBg,
                cardBorder: theme.cardBorder,
                cardShadow: theme.cardShadow,
                textColor: isDarkTheme ? 'text-white' : 'text-black',
                subtitleColor: isDarkTheme ? 'text-zinc-400' : 'text-zinc-600',
            }
        }
        // Default fallback
        return {
            cardBg: 'bg-white',
            cardBorder: 'border border-zinc-200',
            cardShadow: 'shadow-sm',
            textColor: 'text-black',
            subtitleColor: 'text-zinc-600',
        }
    }

    // Brand settings are no longer applied to new walls - they use default config colors

    const styleConfig = getStyleConfig()
    const cardTheme = getCardThemeConfig()


    // Count is derived directly from selectedTestimonials (always accurate)
    const selectedCount = selectedTestimonials.length

    // Display logic with demo fallback (only for new walls)
    const displayTestimonials = React.useMemo(() => {
        // If loading saved testimonials in edit mode, show spinner
        if (isLoadingSelected) return []

        // If testimonials are selected, show them
        if (selectedTestimonials.length > 0) {
            return selectedTestimonials
        }

        // NEW wall (not saved yet): show DEMO testimonials as template preview
        // SAVED wall with deleted testimonials: show empty (not demo)
        // SAVED wall with deleted testimonials: show empty (not demo)
        // EXCEPTION: IF ?new=true is present (just created), show demos if empty
        if (!isEditMode || (searchParams.get('new') === 'true' && selectedTestimonials.length === 0)) {
            return DEMO_TESTIMONIALS
        }

        // Edit mode with no testimonials - show empty
        return []
    }, [selectedTestimonials, isLoadingSelected, isEditMode])

    if (isInitializing) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        )
    }

    return (
        <div className="h-[100vh] w-[100vw] flex flex-col bg-[#09090b] overflow-hidden" style={{ backgroundColor: '#09090b' }}>
            {/* ===================== SIMPLE TOP HEADER ===================== */}
            <div className="h-14 bg-[#09090B] border-b border-white/[0.06] flex items-center justify-between px-6 shrink-0" style={{ backgroundColor: '#09090B' }}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-zinc-400 hover:text-white"
                        aria-label="Go back"
                        style={{ backgroundColor: 'transparent' }}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-white font-semibold text-lg">Wall of Love Design Studio</h1>
                </div>
                <div className="flex items-center gap-4">
                    {/* Editable Wall Name - Ghost/Inline Style */}
                    <div
                        className={cn(
                            "group flex items-center gap-2 px-2 py-1 rounded-md cursor-text transition-all",
                            isEditingName
                                ? "bg-[#18181B] border border-white/10 ring-1 ring-white/20"
                                : "hover:bg-white/[0.04]"
                        )}
                        onClick={handleNameClick}
                    >
                        {isEditingName ? (
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={wallName}
                                onChange={(e) => setWallName(e.target.value)}
                                onBlur={handleNameBlur}
                                onKeyDown={handleNameKeyDown}
                                className="text-sm font-medium text-white bg-transparent outline-none min-w-[120px]"
                                style={{ backgroundColor: 'transparent' }}
                            />
                        ) : (
                            <>
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{wallName}</span>
                                <Pencil className="h-3 w-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </>
                        )}
                    </div>

                    {/* Embed Code Button */}
                    <Button
                        variant="ghost"
                        className={cn(
                            "h-9 gap-2 bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-white/10"
                        )}
                        onClick={handleEmbedClick}
                        disabled={isSaving}
                        title={!wallId ? "Save to get embed code" : "Get embed code"}
                        style={{ backgroundColor: 'transparent' }}
                    >
                        <Code className="h-4 w-4" />
                        Embed Code
                    </Button>

                    {/* Save Button - Primary Lime */}
                    <Button
                        onClick={() => handleSave()}
                        disabled={isSaving}
                        className="h-9 bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-semibold px-5 shadow-sm transition-all"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>

                    {/* Sidebar Toggle (Hamburger) - Only shows when sidebar is closed */}
                    {!sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-zinc-400 hover:text-white"
                            aria-label="Open sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* ===================== MAIN CONTENT ===================== */}
            <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>
                {/* ===================== PREVIEW AREA ===================== */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                    {/* Preview Canvas - The "Stage" */}
                    <div className="flex-1 overflow-auto bg-[#09090b]" style={{ backgroundColor: '#09090b' }}>
                        {/* The Wall Page Itself */}
                        <div
                            className="min-h-full w-full bg-white overflow-hidden transition-all duration-300"
                            style={{ backgroundColor: config.backgroundColor }}
                        >
                            {/* Wall Header */}
                            {/* Wall Header - Full Width Hero Banner */}
                            {/* Wall Header - Hero Banner Card */}
                            <div>
                                <div className="w-full relative overflow-hidden text-center py-20 px-6 shadow-2xl">
                                    {/* Gradient Background */}
                                    <div
                                        className="absolute inset-0 opacity-100"
                                        style={{
                                            backgroundImage: config.headerBackground || 'linear-gradient(to right, #3b82f6, #2563eb)'
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-black/10" />
                                    </div>

                                    {/* Logo (Top Left Corner) */}
                                    <div className="absolute top-6 left-6 z-20">
                                        {config.logoUrl ? (
                                            <img
                                                src={config.logoUrl}
                                                alt="Brand Logo"
                                                className="object-contain"
                                                style={{ width: (config.logoSize || 50), height: (config.logoSize || 50) }}
                                            />
                                        ) : (
                                            <Logo size={config.logoSize || 50} color="#bfff00" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10 flex flex-col items-center justify-center space-y-6 max-w-7xl mx-auto">

                                        {/* Title */}
                                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-sm">
                                            {config.headerTitle || 'Wall of Love'}
                                        </h1>

                                        {/* Subtitle */}
                                        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
                                            {config.headerSubtitle || 'See what our customers are saying about us'}
                                        </p>

                                        {/* CTA Button */}
                                        {config.showCta && (
                                            <div className="pt-4">
                                                <a
                                                    href={config.ctaUrl || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-sm bg-black text-white hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl"
                                                >
                                                    {config.ctaText || 'Visit our website'}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Testimonials Masonry Grid */}
                            <div className="px-6 pb-8 pt-10">
                                {isLoadingSelected ? (
                                    <div className="flex justify-center items-center py-20">
                                        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                                    </div>
                                ) : (
                                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                                        {displayTestimonials.map((t: Testimonial, index: number) => {


                                            return (
                                                <div
                                                    key={t.id}
                                                    className={cn(
                                                        "relative break-inside-avoid rounded-xl overflow-hidden transition-transform duration-200 hover:scale-[1.02]",
                                                        cardTheme.cardBg,
                                                        cardTheme.cardBorder
                                                    )}
                                                    style={{
                                                        boxShadow: config.shadowIntensity > 0
                                                            ? `0 4px 20px rgba(0, 0, 0, ${config.shadowIntensity / 100 * 0.3}), 0 2px 8px rgba(0, 0, 0, ${config.shadowIntensity / 100 * 0.15})`
                                                            : 'none'
                                                    }}
                                                >
                                                    {/* Video Testimonial Layout - Matching text testimonial structure */}
                                                    {(t as any).type === 'video' && (t as any).videoUrl ? (
                                                        <div className="h-full flex flex-col">
                                                            <div className="relative group overflow-hidden rounded-lg bg-zinc-900 border border-white/10 shadow-sm ring-1 ring-black/5">
                                                                {/* Video Player - Full Cover */}
                                                                <div className="aspect-video relative">
                                                                    <VideoPlayer
                                                                        url={(t as any).videoUrl}
                                                                        poster={(t as any).videoThumbnail}
                                                                        showControls={true}
                                                                        showPlayPauseButton={false} // Use custom overlay button
                                                                        showDurationBadge={false}
                                                                        className="w-full h-full object-cover"
                                                                        customOverlay={({ isPlaying, togglePlayback }) => (
                                                                            <>
                                                                                {/* Gradient Overlay - deeper and taller for premium look */}
                                                                                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                                                                                {/* Overlay Content Container */}
                                                                                <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
                                                                                    <div className="flex items-end justify-between w-full gap-4">
                                                                                        {/* Left Side: Profile Info */}
                                                                                        <div className="text-left">
                                                                                            {/* Rating Stars - Only if > 0 */}
                                                                                            {t.rating > 0 && (
                                                                                                <div className="flex gap-1 mb-1.5">
                                                                                                    {Array.from({ length: t.rating }).map((_, i) => (
                                                                                                        <Star
                                                                                                            key={i}
                                                                                                            className="w-3.5 h-3.5 fill-current"
                                                                                                            style={{
                                                                                                                color: config.accentColor || "#fbbf24"
                                                                                                            }}
                                                                                                        />
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}

                                                                                            {/* Name */}
                                                                                            <p className="font-semibold text-white text-base leading-tight drop-shadow-sm">
                                                                                                {t.authorName}
                                                                                            </p>

                                                                                            {/* Title */}
                                                                                            <p className="text-xs text-white/80 mt-0.5 font-medium drop-shadow-sm">
                                                                                                {(t as any).company || (t as any).authorTitle}
                                                                                            </p>
                                                                                        </div>

                                                                                        {/* Right Side: Play/Pause Button */}
                                                                                        <button
                                                                                            onClick={togglePlayback}
                                                                                            aria-label={isPlaying ? "Pause" : "Play"}
                                                                                            className="rounded-full p-2 text-white duration-200 hover:bg-white/20 hover:backdrop-blur-sm mb-0.5 shrink-0 opacity-0 group-hover/video:opacity-100 transition-all scale-95 hover:scale-100"
                                                                                        >
                                                                                            {isPlaying ? (
                                                                                                <Pause className="w-6 h-6 fill-current" />
                                                                                            ) : (
                                                                                                <Play className="w-6 h-6 fill-current" />
                                                                                            )}
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    />


                                                                </div>
                                                            </div>

                                                            {/* Optional text content below video - Matching text testimonial style */}
                                                            {t.content && (
                                                                <div className="pt-3 px-1 bg-inherit">
                                                                    <ExpandableContent
                                                                        content={t.content}
                                                                        fontFamily={config.fontFamily}
                                                                        textColorClass={cardTheme.textColor}
                                                                        subtitleColorClass={cardTheme.subtitleColor}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        /* Text Testimonial Layout - Original */
                                                        <div className="p-5">
                                                            {/* Author row with Source Icon */}
                                                            <div className="flex items-center justify-between mb-3">
                                                                {/* Author Info */}
                                                                <div className="flex items-center gap-3">
                                                                    {(t as any).authorAvatarUrl ? (
                                                                        <img
                                                                            src={(t as any).authorAvatarUrl}
                                                                            alt={t.authorName}
                                                                            className="w-10 h-10 rounded-full object-cover shrink-0"
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className={cn(
                                                                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0",
                                                                                (t as any).avatarBg || "bg-violet-600"
                                                                            )}
                                                                        >
                                                                            {t.authorName.charAt(0)}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <p
                                                                            className={cn("font-semibold text-sm", cardTheme.textColor)}
                                                                            style={{ fontFamily: config.fontFamily }}
                                                                        >
                                                                            {t.authorName}
                                                                        </p>
                                                                        <p
                                                                            className={cn("text-xs", cardTheme.subtitleColor)}
                                                                            style={{ fontFamily: config.fontFamily }}
                                                                        >
                                                                            {(t as any).company || (t as any).authorTitle}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Source Icon */}
                                                                {/* Source Icon */}
                                                                {config.showSourceIcon && (() => {
                                                                    // Do not show logo for manual testimonials
                                                                    if ((t.source || '').toUpperCase() === 'MANUAL') return null

                                                                    const sourceInfo = getSourceIcon(t.source)
                                                                    const IconComponent = sourceInfo.icon
                                                                    return (
                                                                        <div className={cn(
                                                                            "w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden",
                                                                            sourceInfo.bg
                                                                        )}>
                                                                            {(sourceInfo as any).isImage ? (
                                                                                <img
                                                                                    src={(sourceInfo as any).imageUrl}
                                                                                    alt={t.source}
                                                                                    className="w-4 h-4 object-contain"
                                                                                />
                                                                            ) : IconComponent ? (
                                                                                <IconComponent className={cn("w-4 h-4", sourceInfo.color)} />
                                                                            ) : (
                                                                                <span className={cn("text-xs font-bold", sourceInfo.color)}>
                                                                                    {sourceInfo.text}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })()}
                                                            </div>

                                                            <div className="flex gap-0.5 mb-3">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className="w-4 h-4"
                                                                        style={{
                                                                            fill: i < t.rating ? config.accentColor : (config.cardTheme === 'cinematic' ? '#52525b' : '#e4e4e7'),
                                                                            color: i < t.rating ? config.accentColor : (config.cardTheme === 'cinematic' ? '#52525b' : '#e4e4e7'),
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>

                                                            <ExpandableContent
                                                                content={t.content}
                                                                fontFamily={config.fontFamily}
                                                                textColorClass={cardTheme.textColor}
                                                                subtitleColorClass={cardTheme.subtitleColor}
                                                            />

                                                            {/* Attachments (Text Testimonials) */}
                                                            {config.showAttachments && (t as any).attachments && (t as any).attachments.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-4">
                                                                    {(t as any).attachments.map((att: any, i: number) => (
                                                                        <div
                                                                            key={i}
                                                                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200/20 bg-zinc-900/5 dark:bg-white/5 ring-1 ring-inset ring-black/5 group"
                                                                        >
                                                                            {att.type === 'video' ? (
                                                                                <div className="flex items-center justify-center w-full h-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                                                                    <Video className="w-6 h-6" />
                                                                                </div>
                                                                            ) : (
                                                                                <img
                                                                                    src={att.url}
                                                                                    alt="Attachment"
                                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                                                    loading="lazy"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Powered By Branding - Only show when sidebar is closed */}
                            {!sidebarOpen && (
                                <div className="fixed bottom-6 right-6 z-10">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-lg border border-zinc-200">
                                        <span className="text-xs text-zinc-500">Powered by</span>
                                        <span className="text-xs font-semibold text-zinc-900">TestimonialLogo</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===================== RIGHT SIDEBAR ===================== */}
                <WallDesignStudioSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    config={config}
                    updateConfig={updateConfig}
                    templates={TEMPLATES}
                    cardThemes={CARD_THEMES}
                    onSelectTestimonials={handleOpenSelectModal}
                    selectedTestimonialsCount={selectedCount}
                />
            </div>

            {/* ===================== EMBED CODE SIDEBAR ===================== */}
            <ShareWallOfLoveSidebar
                isOpen={embedSidebarOpen}
                onClose={() => setEmbedSidebarOpen(false)}
                shareableLink={wallId ? `/wall/${wallId}` : undefined}
            />

            {/* ===================== SELECT TESTIMONIALS MODAL ===================== */}
            <SelectTestimonialsModal
                isOpen={isSelectTestimonialsOpen}
                onClose={() => setIsSelectTestimonialsOpen(false)}
                testimonials={modalTestimonials}
                selectedIds={selectedTestimonialIds}
                onSelectionChange={handleSelectionChange}
                isLoading={isLoadingAll}
            />


            {/* Toast notifications */}
            <Toaster position="bottom-right" theme="dark" richColors />
        </div>
    )
}
