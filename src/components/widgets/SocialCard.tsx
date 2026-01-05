
import * as React from "react"
import { ChevronLeft, ChevronRight, Star, Play, Pause } from "lucide-react"
import { Stream } from "@cloudflare/stream-react"
import { cn } from "@/lib/utils"
import { CardWidgetConfig } from "@/types/widget-config"

interface SocialCardProps {
    config: CardWidgetConfig
    testimonial: {
        id: string
        type?: 'text' | 'video'
        authorName: string
        authorTitle: string
        authorAvatarUrl?: string
        rating: number
        content: string
        source: string
        date: string
        videoUrl?: string | null
        videoThumbnail?: string | null
    }
    handleNextCard?: () => void
    handlePrevCard?: () => void
    isDarkMode?: boolean
}

export function SocialCard({
    config,
    testimonial,
    handleNextCard,
    handlePrevCard,
    isDarkMode = true
}: SocialCardProps) {
    const getContainerStyles = () => {
        const baseStyles: React.CSSProperties = {
            position: 'relative',
        }

        switch (config.cardStyle) {
            case 'minimal':
                return {
                    className: cn("shadow-sm border transition-colors duration-300", isDarkMode ? "bg-black border-zinc-800" : "bg-white border-zinc-200"),
                    style: { ...baseStyles, borderRadius: `${config.borderRadius}px` }
                }
            case 'modern':
                return {
                    className: cn("border-y border-r border-border/50 shadow-md transition-colors duration-300", isDarkMode ? "bg-[#18181b]" : "bg-white border-l-4"),
                    style: {
                        ...baseStyles,
                        borderRadius: `${config.borderRadius}px`,
                        borderLeft: `4px solid ${config.primaryColor}`
                    }
                }
            case 'brutal':
                return {
                    className: cn("shadow-[6px_6px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] hover:scale-[1.005] transition-all duration-200 ease-in-out border-2 border-black", isDarkMode ? "bg-[#111]" : "bg-white"),
                    style: { ...baseStyles, borderRadius: '0px' }
                }
            default:
                return {
                    className: "bg-card border border-border/50 shadow-sm",
                    style: { ...baseStyles, borderRadius: `${config.borderRadius}px` }
                }
        }
    }

    const { className: styleClass, style: styleObject } = getContainerStyles()

    // Video state and helpers
    const isVideo = testimonial.type === 'video' && testimonial.videoUrl
    const [isPlaying, setIsPlaying] = React.useState(false)
    const streamRef = React.useRef<any>(null)
    const videoRef = React.useRef<HTMLVideoElement>(null)

    // Check if Cloudflare UID
    const isCloudflare = testimonial.videoUrl &&
        !testimonial.videoUrl.includes('/') &&
        !testimonial.videoUrl.startsWith('http') &&
        !testimonial.videoUrl.startsWith('blob:')

    const togglePlayPause = () => {
        if (isCloudflare && streamRef.current) {
            if (isPlaying) {
                streamRef.current.pause()
            } else {
                streamRef.current.play()
            }
        } else if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
        }
    }

    return (
        <div
            className={
                cn(
                    "w-full mx-auto overflow-hidden transition-all duration-300 flex flex-col text-card-foreground",
                    styleClass
                )
            }
            style={{ ...styleObject, fontFamily: config.fontFamily }}
        >
            <div
                className={cn(
                    "h-28 relative px-6 flex items-center justify-between",
                    config.cardStyle === 'brutal' && "border-b-2 border-black"
                )}
                style={{ backgroundColor: config.primaryColor }}
            >
                <div className="absolute right-0 top-0 h-40 w-40 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="flex items-center gap-4 z-10">
                    <div className={cn(
                        "h-12 w-12 flex items-center justify-center text-white text-sm font-medium tracking-wide shrink-0",
                        config.cardStyle === 'brutal' ? "bg-[#111113] border-2 border-black rounded-[4px]" : "rounded-full bg-[#111113]"
                    )}>
                        {(testimonial.authorName || 'A').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-[16px] leading-tight">{testimonial.authorName || 'Anonymous'}</span>
                        <span className="text-white/80 text-[13px] font-normal">{testimonial.authorTitle}</span>
                    </div>
                </div>
                {config.showNavigation && (
                    <div className="flex items-center gap-2 z-10">
                        <button onClick={handlePrevCard} className={cn(
                            "h-8 w-8 flex items-center justify-center text-white backdrop-blur-sm transition-colors cursor-pointer",
                            config.cardStyle === 'brutal'
                                ? "bg-[#111113] border border-black hover:bg-zinc-800 rounded-[2px]"
                                : "rounded-full bg-black/20 hover:bg-black/30"
                        )}>
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={handleNextCard} className={cn(
                            "h-8 w-8 flex items-center justify-center text-white transition-colors cursor-pointer",
                            config.cardStyle === 'brutal'
                                ? "bg-[#111113] border border-black hover:bg-zinc-800 rounded-[2px]"
                                : "rounded-full bg-[#111113] hover:bg-black"
                        )}>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className={cn("p-6 pb-8 space-y-4 flex-1 transition-colors duration-300", isDarkMode ? "bg-[#111113]" : "bg-white")}>
                <div className="flex items-center justify-between">
                    {config.showRating && (
                        <div className="flex gap-1" style={{ color: config.ratingColor }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={cn("fill-current w-4 h-4", i < testimonial.rating ? "" : "text-zinc-800 fill-zinc-800", config.cardStyle === 'brutal' ? "stroke-0" : "")} style={i < testimonial.rating ? { color: config.ratingColor } : {}} />
                            ))}
                        </div>
                    )}
                    {config.showSourceIcon && (
                        <span
                            className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold tracking-widest uppercase"
                            style={{ backgroundColor: `${config.primaryColor}20`, color: config.primaryColor }}
                        >
                            {testimonial.source}
                        </span>
                    )}
                </div>

                {/* Show video player for video testimonials, text for text testimonials */}
                {isVideo && testimonial.videoUrl ? (
                    <div
                        className="relative bg-black group overflow-hidden rounded-lg"
                        style={{ height: '30vh', width: '30vw', minHeight: '200px', minWidth: '200px' }}
                    >
                        {isCloudflare ? (
                            <Stream
                                src={testimonial.videoUrl}
                                poster={testimonial.videoThumbnail || undefined}
                                streamRef={streamRef}
                                controls={false}
                                responsive={true}
                                className="w-full h-full"
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                src={testimonial.videoUrl}
                                poster={testimonial.videoThumbnail || undefined}
                                className="w-full h-full object-cover"
                                playsInline
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />
                        )}
                        {/* Play/Pause button overlay */}
                        <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer transition-colors"
                            style={{ backgroundColor: isPlaying ? 'transparent' : 'rgba(0,0,0,0.2)' }}
                            onClick={togglePlayPause}
                        >
                            <div className={cn(
                                "w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-all",
                                isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100 hover:scale-110"
                            )}>
                                {isPlaying ? (
                                    <Pause className="w-6 h-6 text-black" fill="currentColor" />
                                ) : (
                                    <Play className="w-6 h-6 text-black ml-0.5" fill="currentColor" />
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <p
                            className="text-[15px] leading-[1.5] font-normal transition-colors duration-300"
                            style={{
                                color: config.textColor,
                                display: 'block',
                                maxHeight: `calc(1.5em * ${config.maxLines})`,
                                overflow: 'hidden',
                                lineHeight: '1.5em'
                            }}
                        >
                            {testimonial.content}
                        </p>
                        <button className="text-sm font-medium hover:underline mt-1 block" style={{ color: config.accentColor }}>
                            Read more
                        </button>
                    </div>
                )}

                {config.showDate && (
                    <div className="pt-2 text-zinc-500 text-[13px]">
                        {testimonial.date}
                    </div>
                )}
            </div>
        </div >
    )
}

