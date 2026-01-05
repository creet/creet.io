import { getWallByIdPublic } from "@/lib/actions/walls"
import { getPublicTestimonialsByIds } from "@/lib/actions/widgets"
import { WallEmbedClient } from "./WallEmbedClient"

interface PageProps {
    params: Promise<{
        wallId: string
    }>
}

export default async function WallEmbedPage({ params }: PageProps) {
    const { wallId } = await params

    // Fetch wall data
    const wallResult = await getWallByIdPublic(wallId)

    if (!wallResult.data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Wall Not Found</h1>
                    <p className="text-zinc-400">This Wall of Love does not exist or is not published.</p>
                </div>
            </div>
        )
    }

    const wall = wallResult.data

    // Get selected testimonial IDs from config
    const selectedIds = wall.config?.selectedTestimonialIds || []

    // Fetch testimonials (ordered by created_at desc, id asc)
    let testimonials: any[] = []
    if (selectedIds.length > 0) {
        const testimonialsResult = await getPublicTestimonialsByIds(selectedIds)
        if (testimonialsResult.data) {
            testimonials = testimonialsResult.data
        }
    }

    return <WallEmbedClient wall={wall} testimonials={testimonials} />
}
