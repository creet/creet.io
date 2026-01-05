"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { WALL_OF_LOVE_MODELS } from "@/lib/wall-of-love-models"
import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WallsOfLovePage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Walls of Love</h1>
                <p className="text-zinc-400 mt-1">
                    Create beautiful testimonial showcase pages with different styles.
                </p>
            </div>

            {/* Style Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {WALL_OF_LOVE_MODELS.map((model) => (
                    <div
                        key={model.id}
                        className={cn(
                            "group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition-all hover:border-zinc-700 hover:shadow-xl"
                        )}
                    >
                        {/* Preview Area */}
                        <div className={cn(
                            "h-48 flex items-center justify-center bg-gradient-to-br",
                            model.color
                        )}>
                            <model.icon className={cn("h-16 w-16", model.iconColor)} />
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-1">
                                {model.name}
                            </h3>
                            <p className="text-sm text-zinc-400 mb-4">
                                {model.description}
                            </p>

                            <div className="flex items-center gap-3">
                                <Link href={`/wall-of-love/${model.style}`}>
                                    <Button className="gap-2 bg-violet-600 hover:bg-violet-500 text-white">
                                        Customize
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href={`/wall-of-love/${model.style}`} target="_blank">
                                    <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                                        Preview
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
