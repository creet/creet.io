"use client"

import * as React from "react"
import Logo from "@/components/ui/Logo"
import { WallCard } from "@/components/WallCard"
import { Testimonial } from "@/components/widgets/SelectTestimonialsModal"

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
    {
        id: "modern",
        cardBg: "bg-[#18181b]",
        cardBorder: "border border-white/10 hover:border-cyan-500/50 transition-colors duration-300 shadow-xl shadow-black/50 hover:shadow-cyan-500/20",
    },
]

// Get card theme config
function getCardThemeConfig(cardThemeId: string) {
    const theme = CARD_THEMES.find(t => t.id === cardThemeId)
    const isDark = cardThemeId === 'cinematic' || cardThemeId === 'modern'

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
                {/* Header - Conditional Rendering based on Style */}
                {config.showHeader !== false && (
                    config.style === 'modern' ? (
                        /* MODERN HEADER STYLE */
                        <div className="relative pt-20 pb-12 text-center px-6">
                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* Logo (Centered for Modern) */}
                                {config.logoUrl && (
                                    <div className="flex justify-center mb-8">
                                        <img
                                            src={config.logoUrl}
                                            alt="Brand Logo"
                                            className="object-contain"
                                            style={{ width: (config.logoSize || 60), height: (config.logoSize || 60) }}
                                        />
                                    </div>
                                )}

                                {/* Modern Title with Gradient Highlight */}
                                <h1
                                    className="text-5xl md:text-7xl font-bold tracking-tight"
                                    style={{ color: config.textColor, fontFamily }}
                                >
                                    {config.headerTitle.includes('thousands') ? (
                                        <>
                                            {config.headerTitle.split('thousands')[0]}
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] via-[#0ea5e9] to-[#3b82f6]">
                                                thousands
                                            </span>
                                            {config.headerTitle.split('thousands')[1]}
                                        </>
                                    ) : (
                                        config.headerTitle
                                    )}
                                </h1>

                                {/* Modern Subtitle */}
                                <p
                                    className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
                                    style={{ fontFamily }}
                                >
                                    {config.headerSubtitle}
                                </p>

                                {/* Modern CTA */}
                                {config.showCta && (
                                    <div className="pt-6">
                                        <a
                                            href={config.ctaUrl || `/wall/${wall.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-sm bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
                                        >
                                            {config.ctaText || 'Visit our website'}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* CLASSIC HEADER STYLE (Hero Banner) */
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
                                    {config.headerSubtitle || 'See what our customers have to say about their experience. Real reviews from real people who trust us.'}
                                </p>

                                {/* CTA Button */}
                                {config.showCta && (
                                    <div className="pt-4">
                                        <a
                                            href={config.ctaUrl || `/wall/${wall.id}`}
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
                    )
                )}

                {/* Testimonials Masonry Grid - matching design studio exactly */}
                <div className="px-6 pb-8 pt-10">
                    <div
                        className="gap-4 space-y-4 max-w-7xl mx-auto"
                        style={{
                            columnCount: config.columns || 3,
                            columnGap: '1rem'
                        }}
                    >
                        {testimonials.map((t: any) => {
                            // Map snake_case database fields to Testimonial interface
                            const testimonial: Testimonial = {
                                id: t.id,
                                type: t.type || 'text',
                                authorName: t.author_name || 'Anonymous',
                                authorTitle: t.author_title || '',
                                authorAvatarUrl: t.author_avatar_url,
                                rating: t.rating || 0,
                                content: t.content || '',
                                source: t.source || 'MANUAL',
                                date: t.date || new Date().toLocaleDateString(),
                                videoUrl: t.video_url,
                                videoThumbnail: t.video_thumbnail,
                                attachments: t.attachments || []
                            };

                            return (
                                <WallCard
                                    key={t.id}
                                    testimonial={testimonial}
                                    config={config as any}
                                    theme={cardTheme}
                                />
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}
