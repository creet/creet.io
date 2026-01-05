"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { PraiseTestimonial, PraiseTestimonialCard, ColorConfig } from "@/components/praise/PraiseTestimonialCard"
import { PraiseCarousel } from "@/components/praise/PraiseCarousel"

export type PraiseWidgetLayout = "grid" | "list" | "carousel"

export type PraiseWidgetProps = {
  testimonials: PraiseTestimonial[]
  layout?: PraiseWidgetLayout
  columns?: 1 | 2 | 3 | 4
  showRating?: boolean
  showSource?: boolean
  compact?: boolean
  className?: string
  ariaLabel?: string
  colorConfig?: ColorConfig
}

export function PraiseWidget({
  testimonials,
  layout = "grid",
  columns = 3,
  showRating = true,
  showSource = true,
  compact = false,
  className,
  ariaLabel = "Creet testimonials",
  colorConfig,
}: PraiseWidgetProps) {
  if (!testimonials?.length) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)} role="status" aria-live="polite">
        No testimonials to display.
      </div>
    )
  }

  if (layout === "carousel") {
    return (
      <PraiseCarousel
        items={testimonials}
        ariaLabel={ariaLabel}
        renderItem={(t) => (
          <PraiseTestimonialCard testimonial={t} showRating={showRating} showSource={showSource} compact={compact} colorConfig={colorConfig} />
        )}
        className={className}
      />
    )
  }

  if (layout === "list") {
    return (
      <ul className={cn("grid gap-4", className)} aria-label={ariaLabel}>
        {testimonials.map((t) => (
          <li key={t.id} className="list-none">
            <PraiseTestimonialCard testimonial={t} showRating={showRating} showSource={showSource} compact={compact} colorConfig={colorConfig} />
          </li>
        ))}
      </ul>
    )
  }

  const columnClasses: Record<1 | 2 | 3 | 4, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }

  return (
    <ul className={cn("grid gap-4", columnClasses[columns ?? 3], className)} aria-label={ariaLabel}>
      {testimonials.map((t) => (
        <li key={t.id} className="list-none">
          <PraiseTestimonialCard testimonial={t} showRating={showRating} showSource={showSource} compact={compact} colorConfig={colorConfig} />
        </li>
      ))}
    </ul>
  )
}

export default PraiseWidget
