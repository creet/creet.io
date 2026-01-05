"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Play, Pause } from "lucide-react"
import { Stream } from "@cloudflare/stream-react"

export type PraiseTestimonial = {
  id: string
  type?: 'text' | 'video'
  authorName: string
  authorTitle?: string
  authorAvatarUrl?: string
  rating?: number
  content: string
  source?: string
  date?: string
  videoUrl?: string | null
  videoThumbnail?: string | null
}

// Color config for theming
export type ColorConfig = {
  primaryColor?: string
  ratingColor?: string
  accentColor?: string
  textColor?: string
  fontFamily?: string
}

type Props = React.ComponentProps<typeof Card> & {
  testimonial: PraiseTestimonial
  showRating?: boolean
  showSource?: boolean
  compact?: boolean
  colorConfig?: ColorConfig
}

export function PraiseTestimonialCard({
  testimonial,
  className,
  showRating = true,
  showSource = true,
  compact = false,
  colorConfig,
  ...props
}: Props) {
  const initials = getInitials(testimonial.authorName)
  const stars = typeof testimonial.rating === "number" ? clamp(testimonial.rating, 0, 5) : undefined
  const isVideo = testimonial.type === 'video' && testimonial.videoUrl

  // Video playback state
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
    <Card
      role="article"
      aria-label={`Testimonial by ${testimonial.authorName}`}
      className={cn(
        "h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden",
        compact ? "p-0" : "p-0",
        className
      )}
      style={colorConfig?.fontFamily ? { fontFamily: colorConfig.fontFamily } : undefined}
      {...props}
    >
      <CardContent className={cn("grid gap-4", compact ? "p-4 gap-3" : "p-6 gap-4")}>
        {showRating && stars !== undefined ? (
          <div
            className="flex items-center gap-1"
            role="img"
            aria-label={`${stars} out of 5 stars`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} filled={i < stars} color={colorConfig?.ratingColor} />
            ))}
          </div>
        ) : null}

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
          <blockquote
            className={cn("text-balance text-sm leading-6 md:text-base md:leading-7", compact && "line-clamp-6 md:line-clamp-5")}
            aria-label="Testimonial content"
            style={colorConfig?.textColor ? { color: colorConfig.textColor } : undefined}
          >
            <span className="text-muted-foreground">"</span>
            {testimonial.content}
            <span className="text-muted-foreground">"</span>
          </blockquote>
        )}

        <div className="flex items-center gap-3">
          <Avatar className={compact ? "size-8" : "size-10"}>
            {testimonial.authorAvatarUrl ? (
              <AvatarImage src={testimonial.authorAvatarUrl} alt={`${testimonial.authorName}'s avatar`} />
            ) : null}
            <AvatarFallback aria-hidden="true">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{testimonial.authorName}</p>
            {(testimonial.authorTitle || (showSource && testimonial.source)) ? (
              <p
                className="truncate text-xs"
                style={colorConfig?.accentColor ? { color: colorConfig.accentColor } : undefined}
              >
                {testimonial.authorTitle}
                {testimonial.authorTitle && showSource && testimonial.source ? " · " : ""}
                {showSource && testimonial.source}
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Star({ filled, color }: { filled: boolean; color?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="transition-colors"
      style={{
        fill: filled ? (color || '#facc15') : '#3f3f46',
        color: filled ? (color || '#facc15') : '#3f3f46',
      }}
    >
      <path d="M12 .587l3.668 7.568L24 9.75l-6 5.848 1.416 8.26L12 19.771 4.584 23.858 6 15.598 0 9.75l8.332-1.595z" />
    </svg>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (!parts.length) return "?"
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : ""
  return (first + last).toUpperCase()
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export default PraiseTestimonialCard
