"use client"

import * as React from "react"
import { Star, Play, Quote } from "lucide-react"
import { cn } from "@/lib/utils"
import { WallOfLoveWidgetConfig } from "@/types/widget-config"

// ===================== TYPES ===================== //
export interface Testimonial {
    id: string
    authorName: string
    authorTitle: string
    authorAvatarUrl?: string
    rating: number
    content: string
    source: string
    date: string
    isVideo?: boolean
    videoThumbnail?: string
}

interface WallOfLoveProps {
    config: WallOfLoveWidgetConfig
    testimonials: Testimonial[]
    className?: string
}

// ===================== STYLE CONFIGURATIONS ===================== //
const getStyleConfig = (wallStyle: WallOfLoveWidgetConfig['wallStyle']) => {
    switch (wallStyle) {
        case 'glassmorphism':
            return {
                containerBg: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900',
                cardBg: 'bg-white/70 dark:bg-white/5 backdrop-blur-xl',
                cardBorder: 'border border-white/50 dark:border-white/10',
                cardShadow: 'shadow-xl shadow-purple-500/5',
                cardRadius: 'rounded-2xl',
                cardHover: 'hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 hover:border-purple-200/50 dark:hover:border-purple-500/30',
                textColor: 'text-zinc-800 dark:text-zinc-100',
                subtitleColor: 'text-zinc-500 dark:text-zinc-400',
                headerGradient: 'from-purple-600 via-pink-500 to-orange-400',
            }
        case 'brutalist':
            return {
                containerBg: 'bg-[#fffef0]',
                cardBg: 'bg-yellow-300',
                cardBorder: 'border-[3px] border-black',
                cardShadow: 'shadow-[6px_6px_0px_0px_#000]',
                cardRadius: 'rounded-none',
                cardHover: 'hover:shadow-[3px_3px_0px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px]',
                textColor: 'text-black',
                subtitleColor: 'text-zinc-700',
                headerGradient: 'from-yellow-400 via-orange-500 to-red-500',
                altCardColors: ['bg-yellow-300', 'bg-lime-300', 'bg-cyan-300', 'bg-pink-300', 'bg-zinc-900 text-white'],
            }
        case 'cinematic':
            return {
                containerBg: 'bg-[#0a0a0f]',
                cardBg: 'bg-[#13131a]',
                cardBorder: 'border border-purple-500/20',
                cardShadow: 'shadow-lg shadow-purple-500/10',
                cardRadius: 'rounded-xl',
                cardHover: 'hover:border-purple-500/40 hover:shadow-purple-500/20 hover:-translate-y-0.5',
                textColor: 'text-white',
                subtitleColor: 'text-zinc-400',
                headerGradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
                accentGlow: 'shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]',
            }
        case 'classic':
        default:
            return {
                containerBg: 'bg-slate-50 dark:bg-zinc-950',
                cardBg: 'bg-white dark:bg-zinc-900',
                cardBorder: 'border border-slate-200 dark:border-zinc-800',
                cardShadow: 'shadow-sm',
                cardRadius: 'rounded-xl',
                cardHover: 'hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700',
                textColor: 'text-zinc-900 dark:text-zinc-100',
                subtitleColor: 'text-zinc-500 dark:text-zinc-400',
                headerGradient: 'from-slate-700 via-slate-600 to-slate-500',
            }
    }
}

// ===================== TESTIMONIAL CARD COMPONENT ===================== //
interface TestimonialCardProps {
    testimonial: Testimonial
    config: WallOfLoveWidgetConfig
    styleConfig: ReturnType<typeof getStyleConfig>
    index: number
    isFeatured?: boolean
}

function TestimonialCard({ testimonial, config, styleConfig, index, isFeatured }: TestimonialCardProps) {
    const isAltColor = config.wallStyle === 'brutalist' && 'altCardColors' in styleConfig
    const cardBgClass = isAltColor
        ? (styleConfig as any).altCardColors[index % (styleConfig as any).altCardColors.length]
        : styleConfig.cardBg

    const isDarkCard = config.wallStyle === 'brutalist' && cardBgClass?.includes('zinc-900')

    return (
        <div
            className={cn(
                "p-5 transition-all duration-300 group",
                cardBgClass,
                styleConfig.cardBorder,
                styleConfig.cardShadow,
                styleConfig.cardRadius,
                styleConfig.cardHover,
                isFeatured && config.wallStyle === 'cinematic' && "row-span-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10",
                isFeatured && config.wallStyle === 'classic' && "col-span-2 row-span-2",
            )}
        >
            {/* Video Indicator */}
            {testimonial.isVideo && (
                <div className={cn(
                    "mb-4 aspect-video rounded-lg flex items-center justify-center relative overflow-hidden",
                    config.wallStyle === 'brutalist' ? "border-2 border-black bg-black" : "bg-zinc-900"
                )}>
                    {testimonial.videoThumbnail && (
                        <img
                            src={testimonial.videoThumbnail}
                            alt="Video thumbnail"
                            className="absolute inset-0 w-full h-full object-cover opacity-50"
                        />
                    )}
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center z-10",
                        config.wallStyle === 'brutalist'
                            ? "bg-yellow-300 border-2 border-black"
                            : "bg-white/20 backdrop-blur-sm"
                    )}>
                        <Play className={cn("h-5 w-5", config.wallStyle === 'brutalist' ? "text-black" : "text-white")} fill="currentColor" />
                    </div>
                </div>
            )}

            {/* Quote Icon for Glassmorphism */}
            {config.wallStyle === 'glassmorphism' && (
                <div className="mb-3 opacity-30">
                    <Quote className="h-6 w-6" style={{ color: config.primaryColor }} />
                </div>
            )}

            {/* Author Info */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            "w-10 h-10 flex items-center justify-center text-xs font-semibold shrink-0",
                            config.wallStyle === 'brutalist'
                                ? cn("rounded-none border-2 border-black", isDarkCard ? "bg-yellow-300 text-black" : "bg-black text-white")
                                : "rounded-full",
                            config.wallStyle === 'cinematic' && "ring-2 ring-purple-500/50 bg-gradient-to-br from-purple-500 to-pink-500 text-white",
                            config.wallStyle === 'glassmorphism' && "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg",
                            config.wallStyle === 'classic' && "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        )}
                    >
                        {testimonial.authorAvatarUrl ? (
                            <img
                                src={testimonial.authorAvatarUrl}
                                alt={testimonial.authorName}
                                className={cn("w-full h-full object-cover", config.wallStyle === 'brutalist' ? "" : "rounded-full")}
                            />
                        ) : (
                            testimonial.authorName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                        )}
                    </div>
                    <div>
                        <p className={cn(
                            "font-semibold text-sm leading-tight",
                            isDarkCard ? "text-white" : styleConfig.textColor
                        )}>
                            {testimonial.authorName}
                        </p>
                        <p className={cn(
                            "text-xs",
                            isDarkCard ? "text-zinc-400" : styleConfig.subtitleColor,
                            config.wallStyle === 'brutalist' && "font-mono"
                        )}>
                            {testimonial.authorTitle}
                        </p>
                    </div>
                </div>

                {/* Source Badge */}
                {config.showSourceIcon && (
                    <div className={cn(
                        "text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded",
                        config.wallStyle === 'cinematic' && "bg-purple-500/20 text-purple-400",
                        config.wallStyle === 'brutalist' && cn("border-2 border-black", isDarkCard ? "bg-yellow-300 text-black" : "bg-black text-white"),
                        config.wallStyle === 'glassmorphism' && "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400",
                        config.wallStyle === 'classic' && "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                    )}>
                        {testimonial.source.charAt(0)}
                    </div>
                )}
            </div>

            {/* Rating Stars - Only show when rating is greater than 0 */}
            {config.showRating && testimonial.rating > 0 && (
                <div className="flex gap-0.5 mb-3" style={{ color: config.ratingColor }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                "fill-current w-4 h-4",
                                i >= testimonial.rating && "opacity-30",
                                config.wallStyle === 'brutalist' && "stroke-black stroke-1"
                            )}
                        />
                    ))}
                </div>
            )}

            {/* Content */}
            <p className={cn(
                "text-sm leading-relaxed",
                isFeatured ? "line-clamp-none" : "line-clamp-4",
                isDarkCard ? "text-zinc-200" : styleConfig.textColor,
                config.wallStyle === 'brutalist' && "font-medium"
            )}>
                {testimonial.content}
            </p>

            {/* Date - Not shown for video testimonials */}
            {config.showDate && !testimonial.isVideo && (
                <p className={cn(
                    "text-xs mt-3 pt-3 border-t",
                    isDarkCard ? "text-zinc-500 border-zinc-700" : styleConfig.subtitleColor,
                    config.wallStyle === 'brutalist' ? "border-black" : "border-current/10",
                    config.wallStyle === 'brutalist' && "font-mono text-[10px]"
                )}>
                    {testimonial.date}
                </p>
            )}
        </div>
    )
}

// ===================== MAIN WALL OF LOVE COMPONENT ===================== //
export function WallOfLove({ config, testimonials, className }: WallOfLoveProps) {
    const styleConfig = getStyleConfig(config.wallStyle)

    const columnClass =
        config.columns === 2 ? 'md:columns-2' :
            config.columns === 3 ? 'md:columns-2 lg:columns-3' :
                config.columns === 4 ? 'md:columns-2 lg:columns-3 xl:columns-4' :
                    'md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5'

    // For classic layout, use grid instead of masonry columns
    const isClassicGrid = config.wallStyle === 'classic'

    return (
        <div className={cn("w-full min-h-screen transition-colors duration-300", styleConfig.containerBg, className)}>
            {/* Header */}
            {config.showHeader && (
                <div className={cn(
                    "py-16 px-8 text-center",
                    config.wallStyle === 'cinematic' && (styleConfig as any).accentGlow
                )}>
                    <h1 className={cn(
                        "text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r",
                        styleConfig.headerGradient,
                        config.wallStyle === 'brutalist' && "text-black bg-none [-webkit-text-fill-color:black] uppercase tracking-tight"
                    )}>
                        {config.headerTitle}
                    </h1>
                    <p className={cn(
                        "text-lg max-w-2xl mx-auto",
                        styleConfig.subtitleColor,
                        config.wallStyle === 'brutalist' && "font-mono text-sm border-2 border-black px-4 py-2 inline-block bg-white"
                    )}>
                        {config.headerSubtitle}
                    </p>

                    {/* Decorative elements */}
                    {config.wallStyle === 'glassmorphism' && (
                        <div className="flex justify-center gap-3 mt-6">
                            {['All', 'Video', 'Text'].map((filter) => (
                                <button
                                    key={filter}
                                    className="px-4 py-2 text-sm font-medium rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-white/50 dark:border-white/20 text-zinc-700 dark:text-zinc-300 hover:bg-white/80 dark:hover:bg-white/20 transition-all"
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    )}

                    {config.wallStyle === 'cinematic' && (
                        <div className="flex justify-center gap-2 mt-6">
                            {['All Reviews', 'Video', 'Written'].map((filter, i) => (
                                <button
                                    key={filter}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                                        i === 0
                                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                                            : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10"
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Testimonials Grid/Masonry */}
            <div className={cn(
                "px-6 pb-16",
                isClassicGrid
                    ? cn(
                        "grid gap-4",
                        config.columns === 2 && "md:grid-cols-2",
                        config.columns === 3 && "md:grid-cols-2 lg:grid-cols-3",
                        config.columns === 4 && "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                        config.columns === 5 && "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                    )
                    : cn("columns-1 gap-4 space-y-4", columnClass)
            )}>
                {testimonials.map((testimonial, index) => (
                    <div
                        key={testimonial.id}
                        className={cn(!isClassicGrid && "break-inside-avoid")}
                    >
                        <TestimonialCard
                            testimonial={testimonial}
                            config={config}
                            styleConfig={styleConfig}
                            index={index}
                            isFeatured={index === 0 && isClassicGrid}
                        />
                    </div>
                ))}
            </div>

            {/* Footer CTA */}
            {config.wallStyle === 'glassmorphism' && (
                <div className="text-center pb-16">
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-full shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all">
                        Share Your Experience
                    </button>
                </div>
            )}

            {config.wallStyle === 'brutalist' && (
                <div className="text-center pb-16">
                    <button className="px-8 py-4 bg-black text-white font-bold uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_0px_#fbbf24] hover:shadow-[2px_2px_0px_0px_#fbbf24] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                        Leave a Review →
                    </button>
                </div>
            )}

            {config.wallStyle === 'cinematic' && (
                <div className="text-center pb-16">
                    <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 transition-all border border-purple-400/30">
                        ✨ Add Your Story
                    </button>
                </div>
            )}
        </div>
    )
}

export default WallOfLove
