"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, LayoutGrid, Save, Heart, Play, Star, Trash2, Pencil, Loader2 } from "lucide-react"
import { WIDGET_MODELS } from "@/lib/widget-models"
import { cn } from "@/lib/utils"
import { getWidgets, deleteWidget, WidgetRecord } from "@/lib/actions/widgets"
import { getWalls, deleteWall, WallRecord } from "@/lib/actions/walls"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Demo testimonials for Wall of Love previews
const DEMO_TESTIMONIALS = [
  { name: "Joe Rogan", title: "Entrepreneur & Podcaster", content: "We solve web and mobile design problems with clarity and precision." },
  { name: "Celia Tinson", title: "Founder @ SQUAD", content: "Pretty much everyone who approaches for frontend work is extremely talented." },
  { name: "Steve Deno", title: "Animator", content: "This is really useful. Had to share this with everyone at my company." },
  { name: "Marc Cooper", title: "Designer at DevLabs", content: "This was like a whole project for the team but this widget made it so easy." },
  { name: "Nitish Singh", title: "Product Lead", content: "Congrats on the launch! amazing product. This is amazing and saving lots." },
  { name: "John Smith", title: "CEO @ StartupCo", content: "Have the ops for revenues, bumping your latest project on us." },
]

// Wall of Love template - Only Classic
const WALL_TEMPLATES = [
  {
    id: "classic",
    styleId: "classic",
    name: "Classic",
    description: "Create a beautiful, shareable Wall of Love with your best testimonials",
    bgColor: "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50",
    cardBg: "bg-white",
    textColor: "text-zinc-900",
    accentColor: "text-purple-500",
    borderColor: "border-zinc-200",
  },
]

// Mini testimonial card for preview
function MiniTestimonialCard({
  testimonial,
  template,
  isSmall = false
}: {
  testimonial: typeof DEMO_TESTIMONIALS[0]
  template: typeof WALL_TEMPLATES[0]
  isSmall?: boolean
}) {
  return (
    <div className={cn(
      "rounded-lg p-2 transition-all border",
      template.cardBg,
      template.borderColor
    )}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold text-white shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
          {testimonial.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="min-w-0">
          <p className={cn("text-[7px] font-semibold truncate leading-tight", template.textColor)}>
            {testimonial.name}
          </p>
          <p className={cn("text-[5px] truncate opacity-60", template.textColor)}>
            {testimonial.title}
          </p>
        </div>
      </div>
      <div className="flex gap-0.5 mb-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={cn("w-2 h-2 fill-current", template.accentColor)} />
        ))}
      </div>
      {!isSmall && (
        <p className={cn("text-[6px] line-clamp-2 leading-relaxed opacity-80", template.textColor)}>
          {testimonial.content}
        </p>
      )}
    </div>
  )
}

// Wall of Love template preview card
function WallTemplateCard({ template }: { template: typeof WALL_TEMPLATES[0] }) {
  return (
    <Link
      href={`/wall-of-love/${template.styleId}`}
      className="group block"
    >
      <div className="relative rounded-xl overflow-hidden border border-zinc-800 transition-all duration-300 hover:border-zinc-600 hover:shadow-xl hover:-translate-y-1">
        {/* Play button */}
        <button className="absolute top-3 left-3 z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center border border-zinc-600/50 group-hover:bg-violet-600 transition-colors">
          <Play className="w-3 h-3 text-white fill-white" />
        </button>

        {/* Preview area */}
        <div className={cn("p-4 min-h-[200px]", template.bgColor)}>
          {/* Header */}
          <div className="text-center mb-3">
            <h3 className={cn("text-sm font-bold", template.textColor)}>Testimonials for Bungee</h3>
            <p className={cn("text-[8px] opacity-60 mt-0.5", template.textColor)}>
              We're loved by entrepreneurs, creators, freelancers and agencies from all over the world.
            </p>
            <button className={cn(
              "mt-2 px-3 py-1 text-[8px] font-medium rounded-full",
              template.id === "brutalist"
                ? "bg-black text-white"
                : "bg-violet-600 text-white"
            )}>
              Get back home
            </button>
          </div>

          {/* Testimonial grid */}
          <div className="grid grid-cols-3 gap-2">
            {DEMO_TESTIMONIALS.slice(0, 6).map((testimonial, i) => (
              <MiniTestimonialCard
                key={i}
                testimonial={testimonial}
                template={template}
                isSmall={i > 2}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

// Saved Widget Card Component
function SavedWidgetCard({
  widget,
  onDelete
}: {
  widget: WidgetRecord
  onDelete: (id: string) => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const widgetModel = WIDGET_MODELS.find(w => w.id === widget.type)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteWidget(widget.id)
      if (result.success) {
        onDelete(widget.id)
        setIsDeleteDialogOpen(false)
      } else {
        console.error('Failed to delete widget:', result.error)
        alert('Failed to delete widget')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete widget')
    } finally {
      setIsDeleting(false)
    }
  }

  const IconComponent = widgetModel?.icon || LayoutGrid
  const iconColor = widgetModel?.iconColor || "text-zinc-500"

  return (
    <>
      <Link href={`/canvas/${widget.id}`} className="group block h-full">
        <div className="h-full bg-[#111] border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:-translate-y-1 relative">
          {/* Action buttons */}
          <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDeleteDialogOpen(true)
              }}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Status badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className={cn(
              "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border",
              widget.status === 'published'
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            )}>
              {widget.status}
            </span>
          </div>

          {/* Preview Area */}
          <div className="aspect-[4/3] bg-[#0c0c0e] relative p-6 flex items-center justify-center group-hover:bg-[#151518] transition-colors">
            <IconComponent className={cn("h-16 w-16 opacity-20 transition-all group-hover:opacity-100 group-hover:scale-110", iconColor)} />
          </div>

          {/* Content */}
          <div className="p-4 border-t border-zinc-800 bg-[#111]">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-zinc-200 truncate">{widget.name}</h3>
              <Pencil className="h-3.5 w-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-zinc-500 line-clamp-1">
              {widgetModel?.name || widget.type} • Updated {new Date(widget.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Widget</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete "{widget.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="hover:bg-zinc-800 hover:text-white text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-900/50 hover:bg-red-900/70 text-red-200 border border-red-900"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Saved Wall Card Component
function SavedWallCard({
  wall,
  onDelete
}: {
  wall: WallRecord
  onDelete: (id: string) => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteWall(wall.id)
      if (result.success) {
        onDelete(wall.id)
        setIsDeleteDialogOpen(false)
      } else {
        console.error('Failed to delete wall:', result.error)
        alert('Failed to delete wall')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete wall')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Link href={`/wall-of-love/${wall.id}`} className="group block h-full">
        <div className="h-full bg-[#111] border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:-translate-y-1 relative">
          {/* Action buttons */}
          <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDeleteDialogOpen(true)
              }}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Status badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className={cn(
              "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border",
              wall.is_published
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            )}>
              {wall.is_published ? 'published' : 'draft'}
            </span>
          </div>

          {/* Preview Area */}
          <div className="aspect-[4/3] bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative p-6 flex items-center justify-center group-hover:from-purple-900/30 group-hover:to-pink-900/30 transition-colors">
            <Heart className="h-16 w-16 text-pink-500 opacity-20 transition-all group-hover:opacity-100 group-hover:scale-110" />
          </div>

          {/* Content */}
          <div className="p-4 border-t border-zinc-800 bg-[#111]">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-zinc-200 truncate">{wall.name}</h3>
              <Pencil className="h-3.5 w-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-zinc-500 line-clamp-1">
              Wall of Love • Updated {new Date(wall.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Wall of Love</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete "{wall.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="hover:bg-zinc-800 hover:text-white text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-900/50 hover:bg-red-900/70 text-red-200 border border-red-900"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function WidgetsPage() {
  const [activeTab, setActiveTab] = useState<"saved" | "widgets" | "walls-of-love">("widgets")
  const [savedWidgets, setSavedWidgets] = useState<WidgetRecord[]>([])
  const [savedWalls, setSavedWalls] = useState<WallRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Fetch saved widgets and walls when "Saved" tab is active
  useEffect(() => {
    if (activeTab === "saved") {
      fetchSavedItems()
    }
  }, [activeTab])

  const fetchSavedItems = async () => {
    setIsLoading(true)
    try {
      // Fetch both widgets and walls in parallel
      const [widgetsResult, wallsResult] = await Promise.all([
        getWidgets(),
        getWalls()
      ])

      if (widgetsResult.data) {
        setSavedWidgets(widgetsResult.data)
      } else {
        console.error('Failed to fetch widgets:', widgetsResult.error)
      }

      if (wallsResult.data) {
        setSavedWalls(wallsResult.data)
      } else {
        console.error('Failed to fetch walls:', wallsResult.error)
      }
    } catch (error) {
      console.error('Error fetching saved items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWidgetDelete = (id: string) => {
    setSavedWidgets(prev => prev.filter(w => w.id !== id))
  }

  const handleWallDelete = (id: string) => {
    setSavedWalls(prev => prev.filter(w => w.id !== id))
  }

  const tabs = [
    { label: "Saved", icon: Save, id: "saved" as const, active: activeTab === "saved" },
    { label: "Widgets", icon: LayoutGrid, id: "widgets" as const, active: activeTab === "widgets" },
    { label: "Walls of Love", icon: Heart, id: "walls-of-love" as const, active: activeTab === "walls-of-love" },
  ]

  return (
    <div className="min-h-full bg-[#09090b] text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Social Proof Studio</h1>
            <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="text-zinc-400">What would you like to create?</p>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {tabs.map((tab) => (
              <Button
                key={tab.label}
                variant="ghost"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "h-10 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 gap-2 rounded-lg px-4",
                  tab.active && "border-zinc-700 bg-zinc-800 text-white shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === "saved" && (savedWidgets.length + savedWalls.length) > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-violet-500/20 text-violet-400 rounded">
                    {savedWidgets.length + savedWalls.length}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Saved Widgets Section */}
        {activeTab === "saved" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Saved Widgets</h2>
              <p className="text-zinc-500 text-sm">
                Your saved widget configurations. Click to edit.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
              </div>
            ) : (savedWidgets.length === 0 && savedWalls.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Save className="h-12 w-12 text-zinc-700 mb-4" />
                <h3 className="text-lg font-medium text-zinc-400 mb-2">No saved widgets yet</h3>
                <p className="text-zinc-500 text-sm max-w-md mb-6">
                  Create your first widget by selecting a template from the Widgets tab.
                </p>
                <Button
                  onClick={() => setActiveTab("widgets")}
                  className="bg-violet-600 hover:bg-violet-500"
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Browse Widgets
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Saved Walls */}
                {savedWalls.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      Walls of Love ({savedWalls.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {savedWalls.map((wall) => (
                        <SavedWallCard key={wall.id} wall={wall} onDelete={handleWallDelete} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Saved Widgets */}
                {savedWidgets.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4 text-violet-500" />
                      Widgets ({savedWidgets.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {savedWidgets.map((widget) => (
                        <SavedWidgetCard
                          key={widget.id}
                          widget={widget}
                          onDelete={handleWidgetDelete}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Widgets Section */}
        {activeTab === "widgets" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Widgets</h2>
              <p className="text-zinc-500 text-sm">
                Embed testimonials on your website without code.
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {WIDGET_MODELS.map((widget) => (
                <Link key={widget.id} href={`/canvas/${widget.id}`} className="group block h-full">
                  <div className="h-full bg-[#111] border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-zinc-700 hover:shadow-lg hover:-translate-y-1">

                    {/* Preview Area */}
                    <div className="aspect-[4/3] bg-[#0c0c0e] relative p-6 flex items-center justify-center group-hover:bg-[#151518] transition-colors">
                      <widget.icon className={cn("h-16 w-16 opacity-20 transition-all group-hover:opacity-100 group-hover:scale-110", widget.iconColor)} />

                      {widget.tag && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-500/20">
                          {widget.tag}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 border-t border-zinc-800 bg-[#111]">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-zinc-200">{widget.name}</h3>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-1">{widget.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Walls of Love Section */}
        {activeTab === "walls-of-love" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Walls of Love</h2>
              <p className="text-zinc-500 text-sm">
                Create a beautiful, shareable Wall of Love with your best testimonials
              </p>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WALL_TEMPLATES.map((template) => (
                <WallTemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
