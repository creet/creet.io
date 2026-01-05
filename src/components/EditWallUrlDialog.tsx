"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditWallUrlDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    initialUrl: string
}

export function EditWallUrlDialog({ isOpen, onOpenChange, initialUrl }: EditWallUrlDialogProps) {
    // Parse URL to separate slug and base
    const getUrlParts = (url: string) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://creet.io'
        const defaultBase = `${origin}/wall/`

        try {
            const lastSlashIndex = url.lastIndexOf('/')
            if (lastSlashIndex !== -1) {
                return {
                    base: url.substring(0, lastSlashIndex + 1),
                    slug: url.substring(lastSlashIndex + 1)
                }
            }
            return { base: defaultBase, slug: 'my-wall' }
        } catch (e) {
            return { base: defaultBase, slug: 'my-wall' }
        }
    }

    const urlParts = React.useMemo(() => getUrlParts(initialUrl), [initialUrl])
    const [slug, setSlug] = React.useState(urlParts.slug)

    // Reset slug when URL changes or dialog opens
    React.useEffect(() => {
        setSlug(urlParts.slug)
    }, [urlParts.slug, isOpen])

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] p-0 flex flex-col gap-0 overflow-hidden bg-[#1C1C1F] border-white/10 text-white">
                <DialogHeader className="px-8 pt-8 pb-4 space-y-2">
                    <DialogTitle className="text-xl font-bold tracking-tight text-white">Edit Wall of Love URL</DialogTitle>
                    <DialogDescription className="text-zinc-400 text-[15px] leading-normal pt-1">
                        Edit the display URL of your Wall of Love. Changing this will break any links you&apos;ve already shared.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-8 pb-8 space-y-6">
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        To edit the first part of this URL, <button className="text-[#BFFF00] font-medium hover:underline focus:outline-none">change your project&apos;s slug</button> or <button className="text-[#BFFF00] font-medium hover:underline focus:outline-none">add a custom domain</button>.
                    </p>

                    <div className="space-y-2.5">
                        <Label className="text-sm font-medium text-zinc-200">Edit Slug</Label>
                        <div className="flex rounded-lg shadow-sm">
                            <div className="flex items-center px-4 bg-zinc-900/50 border border-r-0 border-zinc-800 rounded-l-lg text-zinc-500 text-[15px] select-none">
                                {urlParts.base}
                            </div>
                            <div className="flex-1 relative">
                                <Input
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="rounded-l-none h-11 border-l-0 text-[15px] bg-zinc-900/50 border-zinc-800 text-zinc-300 focus-visible:ring-2 focus-visible:ring-[#BFFF00]/20 focus-visible:border-[#BFFF00]/50"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-semibold h-11 rounded-lg text-[15px] shadow-sm mt-2"
                        onClick={() => onOpenChange(false)}
                    >
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
