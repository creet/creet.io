import { Sparkles, Zap, Film, LayoutGrid } from "lucide-react"

export interface WallOfLoveModel {
    id: string
    name: string
    description: string
    style: 'glassmorphism' | 'brutalist' | 'cinematic' | 'classic'
    icon: typeof Sparkles
    iconColor: string
    color: string
}

export const WALL_OF_LOVE_MODELS: WallOfLoveModel[] = [
    {
        id: "wall-glassmorphism",
        name: "Modern Masonry",
        description: "Glassmorphism with blur effects",
        style: "glassmorphism",
        icon: Sparkles,
        iconColor: "text-purple-400",
        color: "from-purple-500/20 to-pink-500/20",
    },
    {
        id: "wall-classic",
        name: "Classic",
        description: "Clean modular grid layout",
        style: "classic",
        icon: LayoutGrid,
        iconColor: "text-blue-400",
        color: "from-blue-500/20 to-cyan-500/20",
    },
    {
        id: "wall-cinematic",
        name: "Cinematic Dark",
        description: "Dark mode with neon accents",
        style: "cinematic",
        icon: Film,
        iconColor: "text-violet-400",
        color: "from-violet-500/20 to-purple-500/20",
    },
    {
        id: "wall-brutalist",
        name: "Neo-Brutalist",
        description: "Bold, blocky design",
        style: "brutalist",
        icon: Zap,
        iconColor: "text-yellow-400",
        color: "from-yellow-500/20 to-orange-500/20",
    },
]
