import { getPublicWidgetById, getPublicTestimonialsByIds } from "@/lib/actions/widgets"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import PublicWidgetClient from "./PublicWidgetClient"

interface PageProps {
    params: Promise<{
        widgetId: string
    }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { widgetId } = await params
    const { data: widget } = await getPublicWidgetById(widgetId)

    if (!widget) {
        return {
            title: "Widget Not Found | Creet",
        }
    }

    return {
        title: `${widget.name} | Creet Widget`,
        description: `View testimonials widget: ${widget.name}`,
    }
}

export default async function PublicWidgetPage({ params }: PageProps) {
    const { widgetId } = await params
    const { data: widget, error } = await getPublicWidgetById(widgetId)

    if (!widget || error) {
        notFound()
    }

    // Fetch testimonials if any are selected
    let testimonials: any[] = []
    if (widget.selected_testimonial_ids && widget.selected_testimonial_ids.length > 0) {
        const { data } = await getPublicTestimonialsByIds(widget.selected_testimonial_ids)
        if (data) {
            testimonials = data
        }
    }

    return <PublicWidgetClient widget={widget} testimonials={testimonials} />
}
