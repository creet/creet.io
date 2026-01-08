import * as React from "react"
import { cn } from "@/lib/utils"
import { Star, Play, Pause, Video, Mail, Image as ImageIcon } from "lucide-react"
import { VideoPlayer } from "@/components/ui/VideoPlayer"
import { BrandIcon } from "@/lib/brands/BrandIcon"
import { WallConfig } from "@/types/wall-config"
import { Testimonial } from "@/components/widgets/SelectTestimonialsModal"

// ===================== HELPER COMPONENTS ===================== //

export const ExpandableContent = ({
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

// ===================== WALL CARD COMPONENT ===================== //

export interface WallCardProps {
    testimonial: Testimonial
    config: WallConfig
    theme: {
        cardBg: string
        cardBorder: string
        textColor: string
        subtitleColor: string
    }
}

export function WallCard({ testimonial: t, config, theme: cardTheme }: WallCardProps) {
    return (
        <div
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
            {t.type === 'video' && t.videoUrl ? (
                <div className="h-full flex flex-col">
                    <div className="relative group overflow-hidden rounded-lg bg-zinc-900 border border-white/10 shadow-sm ring-1 ring-black/5">
                        {/* Video Player - Full Cover */}
                        <div className="aspect-video relative">
                            <VideoPlayer
                                url={t.videoUrl}
                                poster={t.videoThumbnail || undefined}
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
                                                        {t.authorTitle}
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
                            {t.authorAvatarUrl ? (
                                <img
                                    src={t.authorAvatarUrl}
                                    alt={t.authorName}
                                    className="w-10 h-10 rounded-full object-cover shrink-0"
                                />
                            ) : (
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 bg-violet-600"
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
                                    {t.authorTitle}
                                </p>
                            </div>
                        </div>

                        {/* Source Icon */}
                        {config.showSourceIcon && (() => {
                            const s = t.source.toLowerCase();
                            const isManual = s.includes("manual");

                            // Do not show logo for manual testimonials
                            if (isManual) return null;

                            const isVideo = s.includes("video");
                            const isEmail = s.includes("email");

                            if (isVideo || isEmail) {
                                return (
                                    <div className={cn(
                                        "size-6 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-default bg-white",
                                        isVideo ? "border-purple-200 text-purple-600" :
                                            "border-indigo-200 text-indigo-500"
                                    )}>
                                        {isVideo && <Video className="w-[75%] h-[75%]" />}
                                        {isEmail && <Mail className="w-[75%] h-[75%]" />}
                                    </div>
                                );
                            }

                            return (
                                <BrandIcon
                                    brandId={t.source}
                                    size={24}
                                    showBackground
                                    variant="rounded"
                                />
                            );
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
                    {config.showAttachments && t.attachments && t.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {t.attachments.map((att, i: number) => (
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
}
