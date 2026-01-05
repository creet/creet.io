"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
    X,
    Copy,
    Check,
    Link,
} from "lucide-react"
import { BrandIcon } from "@/lib/brands/BrandIcon"
import { EditWallUrlDialog } from "@/components/EditWallUrlDialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ShareWallOfLoveSidebarProps {
    isOpen: boolean
    onClose: () => void
    shareableLink?: string
}

export function ShareWallOfLoveSidebar({
    isOpen,
    onClose,
    shareableLink,
}: ShareWallOfLoveSidebarProps) {
    const [currentLink, setCurrentLink] = React.useState("")
    const [linkCopied, setLinkCopied] = React.useState(false)
    const [codeCopied, setCodeCopied] = React.useState(false)
    const [editUrlOpen, setEditUrlOpen] = React.useState(false)

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            if (shareableLink) {
                // If shareableLink is provided, ensure it has the full origin
                if (shareableLink.startsWith('/')) {
                    setCurrentLink(window.location.origin + shareableLink)
                } else {
                    setCurrentLink(shareableLink)
                }
            } else {
                // Fallback: Extract wall ID from current URL and construct public URL
                const currentPath = window.location.pathname
                // Match UUID pattern in the URL (for saved walls)
                const uuidMatch = currentPath.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)
                if (uuidMatch) {
                    // Use /wall/ path (public page) instead of /wall-of-love/ (design studio)
                    setCurrentLink(`${window.location.origin}/wall/${uuidMatch[1]}`)
                } else {
                    // Wall not saved yet - show design studio URL as placeholder
                    setCurrentLink(window.location.href.split('?')[0])
                }
            }
        }
    }, [shareableLink, isOpen])

    // Generate embed code
    const embedCode = `<iframe 
    id="wall-of-love" 
    src="${currentLink}?embed=true" 
    style="width:100%; height:100vh; border:none;"
    loading="lazy"
></iframe>`

    // Copy to clipboard handlers
    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(currentLink)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
    }

    const handleCopyCode = async () => {
        await navigator.clipboard.writeText(embedCode)
        setCodeCopied(true)
        setTimeout(() => setCodeCopied(false), 2000)
    }

    if (!isOpen) return null

    return (
        <>
            <EditWallUrlDialog
                isOpen={editUrlOpen}
                onOpenChange={setEditUrlOpen}
                initialUrl={currentLink}
            />

            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Sidebar Panel - Responsive width using viewport units */}
            <div
                className="fixed right-0 top-0 h-full bg-[#0F0F11] border-l border-white/[0.06] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300"
                style={{ width: 'clamp(360px, 30vw, 480px)' }}
            >
                {/* Header */}
                <div className="bg-[#09090B] border-b border-white/[0.06] p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            Share your Wall of Love
                            <span className="text-xl">🎉</span>
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-white/[0.04] transition-colors text-zinc-400 hover:text-white"
                            aria-label="Close embed sidebar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm text-zinc-400">
                        Share your Wall of Love with your potential customers.
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Copy the link */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-zinc-200">Copy the link</Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                {/* Using simple text or icon if needed, but input handles it */}
                            </div>
                            <Input
                                value={currentLink}
                                readOnly
                                className="pr-10 pl-4 h-11 text-sm bg-[#18181B] border-white/10 rounded-xl text-zinc-300 focus-visible:ring-zinc-500 placeholder:text-zinc-600"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {/* Edit button removed as per user request */}
                                <button
                                    onClick={handleCopyLink}
                                    className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors group"
                                    aria-label="Copy link"
                                >
                                    {linkCopied ? (
                                        <Check className="w-4 h-4 text-[#BFFF00]" />
                                    ) : (
                                        <Link className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Social Share Icons */}
                        <div className="flex items-center gap-3 pt-1">
                            {/* Twitter / X */}
                            <button
                                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentLink)}&text=${encodeURIComponent("Check out our Wall of Love! 🎉")}`, '_blank')}
                                className="group transition-transform hover:scale-110"
                                title="Share on X (Twitter)"
                            >
                                <BrandIcon brandId="x" size={32} variant="circle" showBackground />
                            </button>

                            {/* Facebook */}
                            <button
                                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentLink)}`, '_blank')}
                                className="group transition-transform hover:scale-110"
                                title="Share on Facebook"
                            >
                                <BrandIcon brandId="facebook" size={32} variant="circle" showBackground />
                            </button>

                            {/* LinkedIn */}
                            <button
                                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentLink)}`, '_blank')}
                                className="group transition-transform hover:scale-110"
                                title="Share on LinkedIn"
                            >
                                <BrandIcon brandId="linkedin" size={32} variant="circle" showBackground />
                            </button>

                            {/* WhatsApp */}
                            <button
                                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out our Wall of Love! 🎉 ${currentLink}`)}`, '_blank')}
                                className="group transition-transform hover:scale-110"
                                title="Share on WhatsApp"
                            >
                                <BrandIcon brandId="whatsapp" size={32} variant="circle" showBackground />
                            </button>
                        </div>
                    </div>



                    {/* Embed it on your website */}
                    <div className="space-y-3 pt-2">
                        <Label className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                            Embed it on your website
                            <span className="text-[10px] bg-[#BFFF00]/10 text-[#BFFF00] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-[#BFFF00]/20">New</span>
                        </Label>

                        {/* Code Preview */}
                        <div className="relative group">
                            <div className="bg-[#1e1e2e] rounded-xl p-6 min-h-[160px] overflow-hidden shadow-xl shadow-indigo-900/5 ring-1 ring-black/5 flex flex-col justify-center">
                                <div className="flex items-center justify-between mb-0 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                                    <button
                                        onClick={handleCopyCode}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors backdrop-blur-sm"
                                    >
                                        {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <pre className="text-[13px] font-mono leading-loose overflow-x-auto text-zinc-300 custom-scrollbar pb-1">
                                    <code>
                                        <span className="text-[#fca7ea]">&lt;iframe</span>{" "}
                                        <span className="text-[#8bcdef]">id</span>=
                                        <span className="text-[#a6e3a1]">"wall-of-love"</span>{" "}
                                        <span className="text-[#8bcdef]">src</span>=
                                        <span className="text-[#a6e3a1]">"{currentLink}?embed=true"</span>{" "}
                                        <span className="text-[#8bcdef]">style</span>=
                                        <span className="text-[#a6e3a1]">"width:100%; height:100vh; border:none;"</span>
                                        <span className="text-[#fca7ea]">&gt;&lt;/iframe&gt;</span>
                                    </code>
                                </pre>
                            </div>
                        </div>

                        <p className="text-xs text-zinc-500">
                            We&apos;ll hide the navigation and logo for you.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-2 pb-8 bg-[#0F0F11]/80 backdrop-blur-sm border-t border-white/[0.04]">
                    <Button
                        onClick={onClose}
                        className="w-full bg-[#BFFF00] hover:bg-[#D4FF50] text-black font-semibold h-12 rounded-xl text-base shadow-[0_0_20px_rgba(191,255,0,0.15)] transition-all active:scale-[0.99]"
                    >
                        Done
                    </Button>
                </div>
            </div>
        </>
    )
}
