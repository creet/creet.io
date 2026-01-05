"use client"
import { QRCodeCanvas } from "qrcode.react";
import * as React from "react"
import { ArrowLeft, Code, Link2, Image, Copy, Check, ExternalLink, Download, Sparkles, FileImage } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { downloadWidgetImage, ExportFormat } from "./export-utils"

// ===================== PLATFORM ICONS ===================== //
const WordPressIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zM3.443 12c0-1.156.232-2.26.646-3.266l3.558 9.748A8.563 8.563 0 013.443 12zm8.557 8.557c-.934 0-1.834-.151-2.674-.43l2.84-8.249 2.908 7.97c.019.046.042.088.065.13a8.549 8.549 0 01-3.139.579zm1.218-12.576c.57-.03 1.083-.089 1.083-.089.51-.06.45-.81-.06-.78 0 0-1.533.12-2.523.12-.929 0-2.493-.12-2.493-.12-.51-.03-.57.75-.06.78 0 0 .483.06 1.003.09l1.49 4.08-2.09 6.27-3.48-10.35c.57-.03 1.083-.089 1.083-.089.51-.06.45-.81-.06-.78 0 0-1.533.12-2.523.12-.177 0-.387-.005-.607-.014A8.533 8.533 0 0112 3.443c2.332 0 4.453.93 6.006 2.438-.038-.003-.076-.008-.116-.008-1.141 0-1.952 1.002-1.952 2.077 0 .965.556 1.782 1.147 2.748.446.776.966 1.773.966 3.211 0 .996-.381 2.151-.887 3.758l-1.163 3.883-4.216-12.549z" />
    </svg>
)

const WixIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.904 9.143l-2.072 5.714-2.072-5.714h-2.549l-2.072 5.714-2.072-5.714H7.518l3.596 9.714h2.549l2.072-5.143 2.072 5.143h2.549l3.596-9.714h-3.048z" />
    </svg>
)

const ShopifyIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.337 3.415c-.193-.016-.386-.016-.58-.016-.58 0-1.16.048-1.724.145a4.505 4.505 0 00-.87.258c-.29.113-.565.258-.821.419-.257.161-.498.338-.725.532-.226.193-.436.402-.629.612a6.15 6.15 0 00-.516.645 5.73 5.73 0 00-.403.661c-.113.226-.209.452-.29.678L9.586 7.027l-.193.678a6.118 6.118 0 00-.129.677c-.032.226-.048.436-.064.645-.016.21-.016.403-.016.581 0 .177.016.354.032.516.016.161.048.322.08.468l.129.419c.048.129.097.242.161.354l.08.145.081.129.097.113.097.081c.032.016.064.032.097.032s.064-.016.097-.032l.097-.081.097-.113.081-.129.08-.145c.065-.113.113-.226.162-.354l.128-.419.081-.468.032-.516v-.58l-.064-.646-.13-.677-.192-.678-.29-.678-.403-.661a6.15 6.15 0 00-.516-.645c-.193-.21-.403-.419-.63-.612l-.724-.532-.821-.419-.87-.258A7.413 7.413 0 008.564 3.4c-.193 0-.386 0-.58.016l-.58.08-.548.13-.516.177c-.161.064-.322.145-.468.226l-.419.274-.37.322-.323.37c-.096.13-.177.274-.258.42l-.193.467-.129.517-.064.564c0 .193-.016.402-.016.612v9.282c0 .21 0 .419.016.612l.064.564.129.516.193.468c.08.145.161.29.258.419l.322.37.371.323.419.274c.145.08.306.161.468.226l.516.177.548.129.58.08c.193.016.386.016.58.016s.386 0 .58-.016l.58-.08.548-.13.516-.177c.161-.064.322-.145.468-.226l.419-.274.37-.322.323-.371c.096-.129.177-.274.258-.419l.193-.468.129-.516.064-.564.016-.612V6.851l4.35-1.45v12.456c0 .21 0 .419.017.612l.064.564.129.516.193.468c.08.145.161.29.258.419l.322.37.371.323.419.274c.145.08.306.161.468.226l.516.177.548.129.58.08c.193.016.386.016.58.016z" />
    </svg>
)

const CarrdIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
)

const NotionIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.934-.56.934-1.166V6.354c0-.606-.233-.933-.746-.887l-15.177.887c-.56.047-.748.327-.748.934zm14.337.653c.093.42 0 .84-.42.886l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.935l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.22.186c-.094-.187 0-.653.327-.746l.84-.233V9.845L7.822 9.7c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.513.28-.886.747-.933l3.222-.186z" />
    </svg>
)

const WebflowIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.802 8.56s-1.946 6.027-2.048 6.33c-.034-.258-1.254-6.33-1.254-6.33h-4.29s-1.254 6.072-1.288 6.33c-.102-.303-2.048-6.33-2.048-6.33H2.5l4.12 11.088h4.392l1.22-5.778 1.22 5.778h4.392L22 8.56h-4.198z" />
    </svg>
)

// ===================== TYPES ===================== //
type ShareTab = 'embed' | 'link' | 'export'

export interface ShareWidgetPanelProps {
    isOpen: boolean
    onClose: () => void
    widgetId: string
    widgetName?: string
}

// ===================== MAIN COMPONENT ===================== //
export function ShareWidgetPanel({ isOpen, onClose, widgetId, widgetName }: ShareWidgetPanelProps) {
    const [activeTab, setActiveTab] = React.useState<ShareTab>('link')
    const [copiedEmbed, setCopiedEmbed] = React.useState(false)
    const [copiedLink, setCopiedLink] = React.useState(false)
    const [copiedQR, setCopiedQR] = React.useState(false)


    const [isExporting, setIsExporting] = React.useState(false)
    const [exportWidth, setExportWidth] = React.useState(1200)

    const handleExport = async (format: ExportFormat) => {
        setIsExporting(true)
        try {
            await downloadWidgetImage(widgetId, format, exportWidth)
            toast.success(`Exported as ${format.toUpperCase()}`)
        } catch (e) {
            toast.error("Failed to export image")
        } finally {
            setIsExporting(false)
        }
    }

    // Generate embed code based on widget ID
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://creet.io'
    const embedCode = `<script src="${origin}/embed.js" async></script>
<div class="creet-widget" data-id="${widgetId}"></div>`

    const widgetLink = `${origin}/w/${widgetId}`


    const handleCopy = async (text: string, setCopied: (v: boolean) => void) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleDownloadQR = () => {
        const canvas = document.querySelector("#qr-code-wrapper canvas") as HTMLCanvasElement;
        if (!canvas) return;

        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `widget-${widgetId}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
    };

    const handleCopyQR = () => {
        const canvas = document.querySelector("#qr-code-wrapper canvas") as HTMLCanvasElement;
        if (!canvas) return;

        try {
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                setCopiedQR(true);
                setTimeout(() => setCopiedQR(false), 2000);
            }, 'image/png');
        } catch (err) {
            console.error('Failed to copy QR image:', err);
        }
    };

    const platforms = [
        { name: 'WordPress', icon: WordPressIcon },
        { name: 'Wix', icon: WixIcon },
        { name: 'Shopify', icon: ShopifyIcon },
        { name: 'Carrd', icon: CarrdIcon },
        { name: 'Notion', icon: NotionIcon },
        { name: 'Webflow', icon: WebflowIcon },
    ]

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Side Panel - 70vw width, responsive */}
            <div className="fixed top-0 right-0 h-full w-[70vw] min-w-[400px] max-w-[1000px] bg-[#0f0f12] border-l border-zinc-800/50 z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-8 pt-6 pb-5">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm mb-5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                    <h2 className="text-2xl font-semibold text-white">Share your widget</h2>
                </div>

                {/* Content Area - Tabs on left, Content on right */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Tabs */}
                    <div className="w-[200px] shrink-0 py-2 px-4">
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveTab('embed')}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                    activeTab === 'embed'
                                        ? "bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-400 shadow-sm shadow-violet-500/10"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                                )}
                            >
                                <Code className="h-4 w-4" />
                                Embed code
                            </button>
                            <button
                                onClick={() => setActiveTab('link')}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                    activeTab === 'link'
                                        ? "bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-400 shadow-sm shadow-violet-500/10"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                                )}
                            >
                                <Link2 className="h-4 w-4" />
                                Link
                            </button>
                            <button
                                onClick={() => setActiveTab('export')}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                    activeTab === 'export'
                                        ? "bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-400 shadow-sm shadow-violet-500/10"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                                )}
                            >
                                <Image className="h-4 w-4" />
                                Export as image
                            </button>
                        </div>
                    </div>

                    {/* Right Content - Fixed min-height for consistent layout */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[500px]">
                        {/* Embed Code Tab */}
                        {activeTab === 'embed' && (
                            <div className="space-y-8">
                                {/* Embed Code Section */}
                                <div>
                                    <h3 className="text-base font-semibold text-white mb-1.5">Embed code</h3>
                                    <p className="text-sm text-zinc-500 mb-4">
                                        Paste this code snippet where you want to display the embed on your site.
                                    </p>
                                    <div className="relative rounded-xl bg-[#1a1a24] border border-zinc-800/60 overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/50 border-b border-zinc-800/50">
                                            <span className="text-xs text-zinc-500 font-mono">console</span>
                                            <button
                                                onClick={() => handleCopy(embedCode, setCopiedEmbed)}
                                                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                                            >
                                                {copiedEmbed ? (
                                                    <>
                                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                                        <span className="text-green-500">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3.5 w-3.5" />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <pre className="p-4 text-sm font-mono overflow-x-auto leading-relaxed">
                                            <code>
                                                <span className="text-pink-400">&lt;script</span>
                                                <span className="text-white"> </span>
                                                <span className="text-cyan-400">src</span>
                                                <span className="text-white">=</span>
                                                <span className="text-emerald-400">{`"${origin}/embed.js"`}</span>
                                                <span className="text-white"> </span>
                                                <span className="text-cyan-400">async</span>
                                                <span className="text-pink-400">&gt;&lt;/script&gt;</span>
                                                {"\n"}
                                                <span className="text-pink-400">&lt;div</span>
                                                <span className="text-white"> </span>
                                                <span className="text-cyan-400">class</span>
                                                <span className="text-white">=</span>
                                                <span className="text-emerald-400">{`"creet-widget"`}</span>
                                                <span className="text-white"> </span>
                                                <span className="text-cyan-400">data-id</span>
                                                <span className="text-white">=</span>
                                                <span className="text-emerald-400">{`"${widgetId}"`}</span>
                                                <span className="text-pink-400">&gt;&lt;/div&gt;</span>
                                            </code>
                                        </pre>
                                    </div>
                                </div>



                                {/* Instructions Section */}
                                <div>
                                    <h3 className="text-base font-semibold text-white mb-1.5">Instructions</h3>
                                    <p className="text-sm text-zinc-500 mb-4">
                                        Click to see instructions for different website builders.
                                    </p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {platforms.map((platform) => (
                                            <button
                                                key={platform.name}
                                                className="flex items-center justify-between px-4 py-3.5 bg-zinc-900/50 border border-zinc-700/50 rounded-xl hover:bg-zinc-800 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-zinc-400 group-hover:text-white transition-colors">
                                                        <platform.icon />
                                                    </span>
                                                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors font-medium">
                                                        {platform.name}
                                                    </span>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Link Tab */}
                        {activeTab === 'link' && (
                            <div className="space-y-6">
                                {/* Your widget link - Card Container */}
                                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
                                    <h3 className="text-base font-semibold text-white mb-1.5">Your widget link</h3>
                                    <p className="text-sm text-zinc-500 mb-4">
                                        Share this link to display your widget on any platform. Anyone with this link can view your widget.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 px-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl overflow-hidden">
                                            <span className="text-sm text-zinc-300 font-mono truncate block">
                                                {typeof window !== 'undefined' ? `${window.location.origin}/w/${widgetId}` : `/w/${widgetId}`}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(`${typeof window !== 'undefined' ? window.location.origin : ''}/w/${widgetId}`, setCopiedLink)}
                                            className="p-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all duration-200"
                                            title="Copy link"
                                        >
                                            {copiedLink ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </button>
                                        <a
                                            href={`/w/${widgetId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-white transition-all duration-200"
                                            title="Open in new tab"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-3">
                                        💡 Save your widget first to get a permanent link
                                    </p>
                                </div>

                                {/* Share your widget's QR code - Card Container */}
                                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
                                    <div className="flex gap-6">
                                        {/* Left Content */}
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-white mb-1.5">Share your widget{"'"}s QR code</h3>
                                            <p className="text-sm text-zinc-500 mb-5">
                                                Scan this QR code to access a widget that to code in your widget.
                                            </p>
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={handleDownloadQR}
                                                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/50 gap-2 font-medium rounded-xl px-5 py-2.5 transition-all duration-200">
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </Button>
                                                <Button
                                                    onClick={handleCopyQR}
                                                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/50 gap-2 font-medium rounded-xl px-5 py-2.5 transition-all duration-200"
                                                >
                                                    {copiedQR ? (
                                                        <>
                                                            <Check className="h-4 w-4 text-green-500" />
                                                            Copied!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-4 w-4" />
                                                            Copy to Clipboard
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Right QR Code */}
                                        <div className="shrink-0">
                                            <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center p-2 shadow-lg">
                                                {/* QR Code placeholder - replace with actual QR code library */}
                                                <div
                                                    id="qr-code-wrapper"
                                                    className="w-full h-full text-black bg-white flex items-center justify-center overflow-hidden"
                                                >
                                                    <QRCodeCanvas
                                                        size={256}
                                                        style={{ width: "100%", height: "auto" }}
                                                        value={typeof window !== 'undefined' ? `${window.location.origin}/w/${widgetId}` : `/w/${widgetId}`}
                                                        fgColor="#000000"
                                                        bgColor="#FFFFFF"
                                                        includeMargin={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Export Tab */}
                        {activeTab === 'export' && (
                            <div className="space-y-8">
                                {/* Image Settings - First */}
                                <div>
                                    <h3 className="text-base font-semibold text-white mb-1.5">Image Settings</h3>
                                    <p className="text-sm text-zinc-500 mb-4">
                                        Customize the exported image width.
                                    </p>
                                    <div className="max-w-[200px]">
                                        <label className="text-xs text-zinc-400 mb-2 block">Width (px)</label>
                                        <input
                                            type="number"
                                            value={exportWidth}
                                            onChange={(e) => setExportWidth(Number(e.target.value))}
                                            min={400}
                                            max={3000}
                                            step={100}
                                            className="w-full px-4 py-2.5 bg-zinc-900/60 border-2 border-violet-500/50 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                                        />
                                    </div>
                                </div>

                                {/* Export as Image - Second */}
                                <div>
                                    <h3 className="text-base font-semibold text-white mb-1.5">Export as Image</h3>
                                    <p className="text-sm text-zinc-500 mb-4">
                                        Download your widget as a high-quality image file.
                                    </p>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => handleExport('png')}
                                            disabled={isExporting}
                                            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/50 gap-2.5 font-medium py-5 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-200">
                                            {isExporting ? <Sparkles className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                            {isExporting ? 'Exporting...' : 'Download as PNG'}
                                        </Button>
                                        <Button
                                            onClick={() => handleExport('svg')}
                                            disabled={isExporting}
                                            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/50 gap-2.5 font-medium py-5 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-200">
                                            {isExporting ? <Sparkles className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                            {isExporting ? 'Exporting...' : 'Download as SVG'}
                                        </Button>
                                        <Button
                                            onClick={() => handleExport('jpeg')}
                                            disabled={isExporting}
                                            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700/50 gap-2.5 font-medium py-5 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-200">
                                            {isExporting ? <Sparkles className="h-4 w-4 animate-spin" /> : <FileImage className="h-4 w-4" />}
                                            {isExporting ? 'Exporting...' : 'Download as JPG'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ShareWidgetPanel
