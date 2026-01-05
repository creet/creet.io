
import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { BadgeWidgetConfig } from "@/types/widget-config"

interface RatingBadgeProps {
    config: BadgeWidgetConfig
    isDarkMode: boolean
}

export function RatingBadge({ config, isDarkMode }: RatingBadgeProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-8 border mx-auto max-w-xs transition-colors duration-300",
                isDarkMode ? "border-zinc-800" : "border-zinc-200"
            )}
            style={{
                borderRadius: `${config.borderRadius}px`,
                backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                fontFamily: config.fontFamily,
            }}
        >
            <div
                className="text-4xl font-bold"
                style={{ color: config.textColor }}
            >
                5.0
            </div>
            <div className="flex gap-1 my-2" style={{ color: config.ratingColor }}>
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="fill-current w-6 h-6" />)}
            </div>
            <div
                className="text-sm"
                style={{ color: config.accentColor }}
            >
                from 24 testimonials
            </div>
        </div>
    )
}
