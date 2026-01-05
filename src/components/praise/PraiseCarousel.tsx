"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type CarouselProps<T> = {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  ariaLabel?: string
  autoplayMs?: number
  className?: string
}

export function PraiseCarousel<T>({
  items,
  renderItem,
  ariaLabel = "Testimonials carousel",
  autoplayMs = 6000,
  className,
}: CarouselProps<T>) {
  const [index, setIndex] = React.useState(0)
  const itemCount = items.length
  const containerRef = React.useRef<HTMLDivElement>(null)
  const autoplayRef = React.useRef<number | null>(null)

  const goTo = React.useCallback((nextIndex: number) => {
    setIndex(((nextIndex % itemCount) + itemCount) % itemCount)
  }, [itemCount])

  const goNext = React.useCallback(() => goTo(index + 1), [goTo, index])
  const goPrev = React.useCallback(() => goTo(index - 1), [goTo, index])

  React.useEffect(() => {
    if (autoplayMs <= 0 || itemCount <= 1) return
    if (autoplayRef.current) window.clearInterval(autoplayRef.current)
    autoplayRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % itemCount)
    }, autoplayMs)
    return () => {
      if (autoplayRef.current) window.clearInterval(autoplayRef.current)
    }
  }, [autoplayMs, itemCount])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      goNext()
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      goPrev()
    }
  }

  const percentage = itemCount ? (index / itemCount) * 100 : 0

  return (
    <div className={cn("group relative", className)}>
      <div
        ref={containerRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        aria-live="polite"
        onKeyDown={onKeyDown}
        className="overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${index * 100}%)`, width: `${itemCount * 100}%` }}
        >
          {items.map((item, i) => (
            <div key={i} className="w-full shrink-0 grow-0 basis-full">
              <div className="p-1 sm:p-2">
                {renderItem(item, i)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {itemCount > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous"
            className="bg-background/70 hover:bg-background absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border p-2 shadow-sm backdrop-blur transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring opacity-0 group-hover:opacity-100"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next"
            className="bg-background/70 hover:bg-background absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border p-2 shadow-sm backdrop-blur transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring opacity-0 group-hover:opacity-100"
          >
            <ChevronRightIcon />
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-2">
            <div className="bg-muted relative h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary absolute left-0 top-0 h-full transition-[width] duration-500"
                style={{ width: `${percentage}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  )
}
function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

export default PraiseCarousel



