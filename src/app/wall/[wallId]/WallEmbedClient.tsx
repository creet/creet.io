"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Star, Twitter, Linkedin, Facebook, MessageSquare, Play, Pause } from "lucide-react"
import { VideoPlayer } from "@/components/ui/VideoPlayer"
import Logo from "@/components/ui/Logo"

interface WallEmbedClientProps {
    wall: {
        id: string
        name: string
        config: Record<string, any>
    }
    testimonials: any[]
}

// Card theme definitions - matching design studio
const CARD_THEMES = [
    {
        id: "glassmorphism",
        cardBg: "bg-white/70 backdrop-blur-md",
        cardBorder: "border border-white/50",
    },
    {
        id: "cinematic",
        cardBg: "bg-[#13131a]",
        cardBorder: "border border-purple-500/20",
    },
    {
        id: "brutalist",
        cardBg: "bg-white",
        cardBorder: "border-2 border-black",
    },
]

// Brand logos for source icons
const BRAND_LOGOS: Record<string, string> = {
    'G2': 'https://yswhnelglqwuvsbjpigy.supabase.co/storage/v1/object/public/Brands//g2.png',
    'CAPTERRA': 'https://yswhnelglqwuvsbjpigy.supabase.co/storage/v1/object/public/Brands//capterra-logo.png',
    'TRUSTPILOT': 'https://yswhnelglqwuvsbjpigy.supabase.co/storage/v1/object/public/Brands//trustpilot.png',
    'INSTAGRAM': 'https://yswhnelglqwuvsbjpigy.supabase.co/storage/v1/object/public/Brands//instagram-logo.png',
    'YOUTUBE': 'https://yswhnelglqwuvsbjpigy.supabase.co/storage/v1/object/public/Brands//youtube-logo.png',
    'TIKTOK': 'https://yswhnelglqwuvsbjpigy.supabase.co/storage/v1/object/public/Brands//tiktok-logo.png',
    'PRODUCTHUNT': 'https://yswhnelglqwuvsbjpigy.supabase.co/storage/v1/object/public/Brands//ph-logo.png',
    'PRODUCT_HUNT': 'https://yswhnelglqwuvsbjpigy.supabase.co/storage/v1/object/public/Brands//ph-logo.png',
}

// Source icon helper
function getSourceIcon(source: string) {
    const s = (source || '').toUpperCase().trim()

    // Check for brand logo first
    const logoUrl = BRAND_LOGOS[s]
    if (logoUrl) {
        return { icon: null, color: 'text-white', bg: 'bg-zinc-100', isImage: true, imageUrl: logoUrl }
    }

    if (s.includes('TWITTER') || s === 'X') {
        return { icon: Twitter, color: 'text-white', bg: 'bg-black' }
    }
    if (s.includes('LINKEDIN')) {
        return { icon: Linkedin, color: 'text-white', bg: 'bg-[#0A66C2]' }
    }
    if (s.includes('FACEBOOK')) {
        return { icon: Facebook, color: 'text-white', bg: 'bg-[#1877F2]' }
    }
    if (s.includes('PLAYSTORE') || s.includes('PLAY STORE') || s.includes('GOOGLE')) {
        return { icon: null, color: 'text-white', bg: 'bg-gradient-to-br from-green-400 via-blue-500 to-red-500', text: 'G' }
    }
    if (s.includes('EMAIL')) {
        return { icon: null, color: 'text-white', bg: 'bg-zinc-700', text: '@' }
    }
    return { icon: MessageSquare, color: 'text-white', bg: 'bg-zinc-700' }
}

// Get card theme config
function getCardThemeConfig(cardThemeId: string) {
    const theme = CARD_THEMES.find(t => t.id === cardThemeId)
    const isDark = cardThemeId === 'cinematic'

    if (theme) {
        return {
            cardBg: theme.cardBg,
            cardBorder: theme.cardBorder,
            textColor: isDark ? 'text-white' : 'text-black',
            subtitleColor: isDark ? 'text-zinc-400' : 'text-zinc-600',
        }
    }
    // Default to glassmorphism
    return {
        cardBg: 'bg-white/70 backdrop-blur-md',
        cardBorder: 'border border-white/50',
        textColor: 'text-black',
        subtitleColor: 'text-zinc-600',
    }
}

// ExpandableContent component - matching design studio
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
    // Limit to 200 chars as in design studio
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

export function WallEmbedClient({ wall, testimonials }: WallEmbedClientProps) {
    const config = wall.config || {}
    const cardTheme = getCardThemeConfig(config.cardTheme || 'glassmorphism')

    // Extract common values with fallbacks
    const fontFamily = config.fontFamily || "Inter"
    const accentColor = config.accentColor || "#8b5cf6"

    return (
        <>
            {/* Hide scrollbar globally for this page */}
            <style jsx global>{`
                html, body {
                    scrollbar-width: none; /* Firefox */
                    -ms-overflow-style: none; /* IE and Edge */
                }
                html::-webkit-scrollbar, body::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                }
            `}</style>
            <div
                className="min-h-screen w-full"
                style={{
                    backgroundColor: config.backgroundColor || "#f0f4ff",
                    fontFamily: fontFamily
                }}
            >
                {/* Header - Hero Banner matching Design Studio - Responsive */}
                {config.showHeader !== false && (
                    <div className="w-full relative overflow-hidden text-center py-12 sm:py-16 md:py-20 px-4 sm:px-6 shadow-2xl">
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
                        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
                            {config.logoUrl ? (
                                <img
                                    src={config.logoUrl}
                                    alt="Brand Logo"
                                    className="object-contain"
                                    style={{ width: config.logoSize || 50, height: config.logoSize || 50 }}
                                />
                            ) : (
                                <Logo size={config.logoSize || 50} color="#bfff00" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center justify-center space-y-4 sm:space-y-6 max-w-7xl mx-auto px-2">

                            {/* Title - Responsive */}
                            <h1
                                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-sm"
                                style={{ fontFamily }}
                            >
                                {config.headerTitle || 'Wall of Love'}
                            </h1>

                            {/* Subtitle - Responsive */}
                            <p
                                className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium px-2"
                                style={{ fontFamily }}
                            >
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
                )}

                {/* Testimonials Masonry Grid - matching design studio exactly */}
                <div className="px-6 pb-8 pt-10">
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                        {testimonials.map((t) => (
                            <div
                                key={t.id}
                                className={cn(
                                    "relative break-inside-avoid rounded-xl overflow-hidden transition-transform duration-200 hover:scale-[1.02]",
                                    cardTheme.cardBg,
                                    cardTheme.cardBorder
                                )}
                                style={{
                                    boxShadow: config.shadowIntensity > 0
                                        ? `0 4px 20px rgba(0, 0, 0, ${(config.shadowIntensity || 50) / 100 * 0.3}), 0 2px 8px rgba(0, 0, 0, ${(config.shadowIntensity || 50) / 100 * 0.15})`
                                        : 'none',
                                }}
                            >
                                {/* Video Testimonial Layout - Overlay Style */}
                                {t.type === 'video' && t.video_url ? (
                                    <div className="h-full flex flex-col">
                                        <div className="relative group overflow-hidden rounded-lg bg-zinc-900 border border-white/10 shadow-sm ring-1 ring-black/5">
                                            {/* Video Player - Full Cover */}
                                            <div className="aspect-video relative">
                                                <VideoPlayer
                                                    url={t.video_url}
                                                    poster={t.video_thumbnail}
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
                                                                        {config.showRating !== false && t.rating > 0 && (
                                                                            <div className="flex gap-1 mb-1.5">
                                                                                {Array.from({ length: t.rating }).map((_, i) => (
                                                                                    <Star
                                                                                        key={i}
                                                                                        className="w-3.5 h-3.5 fill-current"
                                                                                        style={{
                                                                                            color: accentColor || "#fbbf24"
                                                                                        }}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {/* Name */}
                                                                        <p className="font-semibold text-white text-base leading-tight drop-shadow-sm">
                                                                            {t.author_name}
                                                                        </p>

                                                                        {/* Title */}
                                                                        <p className="text-xs text-white/80 mt-0.5 font-medium drop-shadow-sm">
                                                                            {t.author_title}
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

                                        {/* Optional text content below video */}
                                        {t.content && (
                                            <div className="pt-3 px-1 bg-inherit">
                                                <ExpandableContent
                                                    content={t.content}
                                                    fontFamily={fontFamily}
                                                    textColorClass={cardTheme.textColor === 'text-white' ? 'text-zinc-300' : 'text-black'}
                                                    subtitleColorClass={cardTheme.subtitleColor}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Text Testimonial Layout */
                                    <div className="p-5">
                                        {/* Author row with Source Icon */}
                                        <div className="flex items-center justify-between mb-3">
                                            {/* Author Info */}
                                            <div className="flex items-center gap-3">
                                                {t.author_avatar_url ? (
                                                    <img
                                                        src={t.author_avatar_url}
                                                        alt={t.author_name}
                                                        className="w-10 h-10 rounded-full object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                                                        {t.author_name?.charAt(0) || "?"}
                                                    </div>
                                                )}
                                                <div>
                                                    <p
                                                        className={cn("font-semibold text-sm", cardTheme.textColor)}
                                                        style={{ fontFamily }}
                                                    >
                                                        {t.author_name}
                                                    </p>
                                                    <p
                                                        className={cn("text-xs", cardTheme.subtitleColor)}
                                                        style={{ fontFamily }}
                                                    >
                                                        {t.author_title}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Source Icon - respect config.showSourceIcon */}
                                            {config.showSourceIcon !== false && t.source && t.source.toUpperCase() !== 'MANUAL' && (() => {
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

                                        {/* Rating - only show if exists and showRating is not false */}
                                        {config.showRating !== false && t.rating > 0 && (
                                            <div className="flex gap-0.5 mb-3">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className="w-4 h-4"
                                                        style={{
                                                            fill: i < t.rating ? accentColor : "#e4e4e7",
                                                            color: i < t.rating ? accentColor : "#e4e4e7",
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {/* Content */}
                                        {t.content && (
                                            <ExpandableContent
                                                content={t.content}
                                                fontFamily={fontFamily}
                                                textColorClass={cardTheme.textColor}
                                                subtitleColorClass={cardTheme.subtitleColor}
                                            />
                                        )}

                                        {/* Date - only show if exists and config allows */}
                                        {config.showDate !== false && t.date && (
                                            <p className={cn("text-xs mt-3", cardTheme.subtitleColor)}>
                                                {t.date}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
