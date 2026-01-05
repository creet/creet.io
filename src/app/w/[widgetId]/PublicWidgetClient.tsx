"use client"

import * as React from "react"
import { WidgetRecord } from "@/lib/actions/widgets"
import { SocialCard } from "@/components/widgets/SocialCard"
import { MinimalCard } from "@/components/widgets/MinimalCard"
import { RatingBadge } from "@/components/widgets/RatingBadge"
import { PraiseWidget } from "@/components/praise/PraiseWidget"
import {
    WidgetConfig,
    isCardWidget,
    isCollectionWidget,
    isBadgeWidget
} from "@/types/widget-config"
import {
    Star,
    Twitter,
    Linkedin,
    Facebook,
    Loader2
} from "lucide-react"
import { VideoPlayer } from "@/components/ui/VideoPlayer"
import { cn } from "@/lib/utils"
// import Logo from "@/components/ui/Logo" // Assuming Logo is available or we use <img>

// ... (existing imports)



interface PublicWidgetClientProps {
    widget: WidgetRecord
    testimonials?: any[]
}

// Demo testimonials for widgets without selected testimonials
const DEMO_TESTIMONIALS = [
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
]

// ===================== HELPER COMPONENTS (Duplicated from WallOfLovePage for standalone rendering) ===================== //

const getSourceIcon = (source: string) => {
    switch (source) {
        case 'TWITTER':
            return { icon: Twitter, color: 'text-sky-500', bg: 'bg-sky-500/10' }
        case 'LINKEDIN':
            return { icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-600/10' }
        case 'FACEBOOK':
            return { icon: Facebook, color: 'text-blue-500', bg: 'bg-blue-500/10' }
        case 'PLAYSTORE':
            return { icon: null, color: 'text-green-600', bg: 'bg-green-600/10', text: '▶' }
        default:
            return { icon: null, color: 'text-zinc-500', bg: 'bg-zinc-500/10', text: '●' }
    }
}

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

// ... (existing helper code in PublicWidgetClient)

export default function PublicWidgetClient({ widget, testimonials: initialTestimonials = [] }: PublicWidgetClientProps) {
    // Reconstruct the config
    const config: WidgetConfig = React.useMemo(() => ({
        id: widget.id,
        name: widget.name,
        type: widget.type,
        projectId: widget.project_id,
        createdAt: widget.created_at,
        updatedAt: widget.updated_at,
        ...widget.config,
    } as WidgetConfig), [widget])

    const isDarkMode = config.colorScheme === 'dark' || config.colorScheme === 'auto'

    // Map testimonials to the format expected by the components
    // The backend format is slightly different from what the components expect
    const testimonials = React.useMemo(() => {
        if (initialTestimonials.length > 0) {
            return initialTestimonials.map(t => ({
                id: t.id,
                authorName: t.author_name,
                authorTitle: t.author_title,
                authorAvatar: t.author_avatar_url, // For SocialCard/MinimalCard
                authorAvatarUrl: t.author_avatar_url, // For PraiseWidget
                rating: t.rating,
                content: t.content,
                source: t.source,
                date: t.date,
                type: t.type,
                videoUrl: t.video_url,
                videoThumbnail: t.video_thumbnail,
                attachments: t.attachments
            }))
        }
        return DEMO_TESTIMONIALS
    }, [initialTestimonials])

    const [activeCardIndex, setActiveCardIndex] = React.useState(0)
    const activeTestimonial = testimonials[activeCardIndex % testimonials.length]

    const handleNextCard = () => {
        setActiveCardIndex((prev) => (prev + 1) % testimonials.length)
    }

    const handlePrevCard = () => {
        setActiveCardIndex((prev) => {
            const len = testimonials.length || 1
            return (prev - 1 + len) % len
        })
    }


    // Helper to get card theme config (duplicated logic)
    const getCardThemeConfig = () => {
        // We might not have the full CARD_THEMES array here, so we implement the logic directly based on config.cardTheme
        // Defaults to 'classic' (white card)
        const themeId = (config as any).cardTheme || 'classic'

        if (themeId === 'cinematic') {
            return {
                cardBg: "bg-[#13131a]",
                cardBorder: "border border-purple-500/20",
                cardShadow: "shadow-lg shadow-purple-500/10",
                textColor: 'text-white',
                subtitleColor: 'text-zinc-400',
            }
        }
        if (themeId === 'glassmorphism') {
            return {
                cardBg: "bg-white/70 backdrop-blur-md",
                cardBorder: "border border-white/50",
                cardShadow: "shadow-lg shadow-purple-500/5",
                textColor: 'text-zinc-800',
                subtitleColor: 'text-zinc-500',
            }
        }
        if (themeId === 'brutalist') {
            return {
                cardBg: "bg-white",
                cardBorder: "border-2 border-black",
                cardShadow: "shadow-[4px_4px_0px_0px_#000]",
                textColor: 'text-black',
                subtitleColor: 'text-zinc-700',
            }
        }

        // Default / Classic
        return {
            cardBg: 'bg-white',
            cardBorder: 'border border-zinc-200',
            cardShadow: 'shadow-sm',
            textColor: 'text-zinc-900',
            subtitleColor: 'text-zinc-500',
        }
    }

    const cardTheme = getCardThemeConfig()

    return (
        <div
            className="min-h-screen flex flex-col items-center p-8"
            style={{
                backgroundColor: (config as any).type === 'wall-of-love' ? ((config as any).backgroundColor || '#f5f5f7') : (isDarkMode ? '#09090b' : '#f5f5f7'),
                fontFamily: (config as any).fontFamily
            }}
        >
            {/* Widget Container */}
            <div
                className="w-full"
                style={{
                    maxWidth: (config as any).type === 'wall-of-love' ? '100%' : `${(config as any).maxWidth}px`,
                    fontFamily: (config as any).fontFamily
                }}
            >
                {/* Render based on widget type */}

                {/* 1. Wall of Love Type */}
                {(config.type as string) === 'wall-of-love' && (
                    <div className="w-full max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="py-10 px-4 flex flex-col items-center justify-center text-center mb-8">
                            {(config as any).logoUrl && (
                                <img
                                    src={(config as any).logoUrl}
                                    alt="Project Logo"
                                    className="object-contain mb-4"
                                    style={{
                                        width: (config as any).logoSize || 48,
                                        height: (config as any).logoSize || 48,
                                        maxWidth: 'none'
                                    }}
                                />
                            )}
                            <h2
                                className="text-4xl font-bold"
                                style={{
                                    fontFamily: (config as any).fontFamily,
                                    color: (config as any).textColor || '#000',
                                    backgroundColor: 'transparent'
                                }}
                            >
                                Wall of Love
                            </h2>
                        </div>

                        {/* Masonry Grid */}
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 px-4 pb-12">
                            {testimonials.map((t: any, index) => {
                                return (
                                    <div
                                        key={t.id}
                                        className={cn(
                                            "relative break-inside-avoid rounded-xl p-5 mb-4",
                                            cardTheme.cardBg,
                                            cardTheme.cardBorder,
                                            cardTheme.cardShadow
                                        )}
                                    >
                                        {/* Source Icon */}
                                        <div className="absolute top-4 right-4">
                                            {(() => {
                                                const sourceInfo = getSourceIcon(t.source)
                                                const IconComponent = sourceInfo.icon
                                                return (
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center",
                                                        sourceInfo.bg
                                                    )}>
                                                        {IconComponent ? (
                                                            <IconComponent className={cn("w-3.5 h-3.5", sourceInfo.color)} />
                                                        ) : (
                                                            <span className={cn("text-xs font-bold", sourceInfo.color)}>
                                                                {sourceInfo.text}
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            })()}
                                        </div>

                                        {/* Author */}
                                        <div className="flex items-center gap-3 mb-3">
                                            {t.authorAvatarUrl ? (
                                                <img
                                                    src={t.authorAvatarUrl}
                                                    alt={t.authorName}
                                                    className="w-10 h-10 rounded-full object-cover shrink-0"
                                                />
                                            ) : (
                                                <div
                                                    className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500"
                                                    )}
                                                >
                                                    {t.authorName?.charAt(0)}
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
                                                    {t.authorTitle || "Customer"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-0.5 mb-3">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className="w-4 h-4"
                                                    style={{
                                                        fill: i < (t.rating || 5) ? (config.accentColor || '#fbbf24') : ((config as any).cardTheme === 'cinematic' ? '#52525b' : '#e4e4e7'),
                                                        color: i < (t.rating || 5) ? (config.accentColor || '#fbbf24') : ((config as any).cardTheme === 'cinematic' ? '#52525b' : '#e4e4e7'),
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        {/* Video Player */}
                                        {t.videoUrl && (
                                            <div className="mb-4 rounded-lg overflow-hidden border border-zinc-200/10 shadow-sm aspect-video bg-black">
                                                <VideoPlayer
                                                    url={t.videoUrl}
                                                    poster={t.videoThumbnail}
                                                    showControls={true}
                                                    showPlayPauseButton={true}
                                                    className="w-full h-full"
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <ExpandableContent
                                            content={t.content || ""}
                                            fontFamily={config.fontFamily}
                                            textColorClass={cardTheme.textColor === 'text-white' ? 'text-zinc-300' : 'text-zinc-700'}
                                            subtitleColorClass={cardTheme.subtitleColor}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* 2. Other Widget Types */}
                {config.type === "social-card" && isCardWidget(config) && (
                    <SocialCard
                        config={config}
                        testimonial={activeTestimonial}
                        handleNextCard={handleNextCard}
                        handlePrevCard={handlePrevCard}
                        isDarkMode={isDarkMode}
                    />
                )}
// ... (rest of the file)

                {config.type === "minimal-card" && isCardWidget(config) && (
                    <MinimalCard
                        config={config}
                        testimonial={activeTestimonial}
                        isDarkMode={isDarkMode}
                    />
                )}

                {config.type === "rating-badge" && isBadgeWidget(config) && (
                    <RatingBadge
                        config={config}
                        isDarkMode={isDarkMode}
                    />
                )}

                {isCollectionWidget(config) && (
                    <PraiseWidget
                        testimonials={testimonials}
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
                )}
            </div>


        </div>
    )
}
