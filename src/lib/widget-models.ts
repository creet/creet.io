import { List, Star, CreditCard, LayoutTemplate } from "lucide-react"

export type WidgetModel = {
  id: string
  name: string
  description: string
  icon: React.ElementType
  type: string
  color: string
  activeBorder: string
  iconColor: string
  tag?: string
}

export const WIDGET_MODELS: WidgetModel[] = [
  {
    id: "social-card",
    name: "Social Card",
    description: "Single card with navigation",
    icon: CreditCard,
    type: "carousel",
    color: "from-indigo-500/20 to-purple-500/20",
    activeBorder: "border-indigo-500",
    iconColor: "text-indigo-400",
    tag: "New"
  },
  {
    id: "minimal-card",
    name: "Minimal Card",
    description: "Clean, high-impact testimonial",
    icon: LayoutTemplate,
    type: "card",
    color: "from-zinc-500/20 to-stone-500/20",
    activeBorder: "border-zinc-500",
    iconColor: "text-zinc-400"
  },
  {
    id: "list-feed",
    name: "List Feed",
    description: "Vertical list layout",
    icon: List,
    type: "list",
    color: "from-blue-500/20 to-cyan-500/20",
    activeBorder: "border-blue-500",
    iconColor: "text-blue-400"
  },
  {
    id: "rating-badge",
    name: "Rating Badge",
    description: "Compact badge with stars",
    icon: Star,
    type: "badge",
    color: "from-yellow-500/20 to-amber-500/20",
    activeBorder: "border-yellow-500",
    iconColor: "text-yellow-400"
  },
]

