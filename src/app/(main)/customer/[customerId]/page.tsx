import { getCustomerById, getTestimonialsByCustomerId, getTestimonialById } from "@/lib/data/testimonials";
import { notFound } from "next/navigation";
import { CustomerContentWrapper } from "./CustomerContentWrapper";

export default async function CustomerPage({ params }: { params: Promise<{ customerId: string }> }) {
    const { customerId } = await params;

    let customer, testimonials;

    if (customerId.startsWith('t-')) {
        // Handle single orphaned testimonial view
        const testimonialId = customerId.substring(2);
        const testimonial = await getTestimonialById(testimonialId);

        if (!testimonial) {
            notFound();
        }

        testimonials = [testimonial];
        // Create temporary customer object from testimonial data
        customer = {
            id: `temp-${testimonial.id}`,
            email: testimonial.email || "",
            fullName: testimonial.reviewer || "Anonymous",
            headline: testimonial.profession || "",
            avatarUrl: testimonial.avatar || "",
            companyDetails: testimonial.raw?.data?.company || {},
            socialProfiles: {},
            projectId: testimonial.raw?.project_id || "",
            createdAt: testimonial.date
        };
    } else {
        // Fetch customer and testimonials in parallel
        ([customer, testimonials] = await Promise.all([
            getCustomerById(customerId),
            getTestimonialsByCustomerId(customerId)
        ]));
    }

    if (!customer) {
        notFound();
    }

    return <CustomerContentWrapper customer={customer} testimonials={testimonials} />;
}
