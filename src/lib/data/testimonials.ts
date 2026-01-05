import { createClient } from "@/lib/supabase/server";

// ===================== SHARED TRANSFORM HELPER ===================== //
// Single source of truth for transforming DB testimonial to UI shape
function transformTestimonial(t: any) {
    return {
        id: t.id,
        customerId: t.customer_id || null,
        type: t.type,
        reviewer: t.data.customer_name || "Anonymous",
        email: t.data.customer_email || "",
        profession: t.data.profession || t.data.customer_headline || t.data.company?.job_title || "",
        rating: t.data.rating || 0,
        text: t.data.message || "",
        source: t.data.source || "Manual",
        status: t.status === 'public' ? 'Public' : (t.status === 'hidden' ? 'Hidden' : 'Pending'),
        date: new Date(t.data.testimonial_date || t.created_at).toLocaleDateString(),
        avatar: t.data.customer_avatar_url || t.data.media?.avatar_url || "",
        attachments: [
            t.data.company?.logo_url ? { type: 'image', url: t.data.company.logo_url } : null,
            t.data.media?.video_url ? { type: 'video', url: t.data.media.video_url } : null,
            ...(t.data.attachments?.map((a: any) => ({
                type: a.type || 'image',
                url: typeof a === 'string' ? a : a.url
            })) || [])
        ].filter(Boolean) as { type: 'image' | 'video', url: string }[],
        videoThumbnail: t.data.thumbnails?.[t.data.selected_thumbnail_index || 0] || "",
        trimStart: t.data.trim_start,
        trimEnd: t.data.trim_end,
        raw: t
    };
}

// ===================== PROJECT-LEVEL QUERIES ===================== //

export async function getTestimonialsForProject(projectId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching testimonials:", error);
        return [];
    }

    return data.map(transformTestimonial);
}

// ===================== SINGLE TESTIMONIAL QUERIES ===================== //

export async function getTestimonialById(id: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error("Error fetching testimonial:", JSON.stringify(error, null, 2));
        return null;
    }

    if (!data) return null;

    return transformTestimonial(data);
}

// ===================== CUSTOMER-CENTRIC QUERIES ===================== //

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Get all testimonials for a customer by their customer_id
 * OPTIMIZED: Uses direct FK instead of JSONB email search
 */
export async function getTestimonialsByCustomerId(customerId: string, excludeId?: string) {
    if (!customerId || !UUID_REGEX.test(customerId)) return [];

    const supabase = await createClient();

    let query = supabase
        .from("testimonials")
        .select("*")
        .eq("customer_id", customerId)  // Direct FK lookup - fast!
        .order("created_at", { ascending: false });

    if (excludeId) {
        query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
        // Improved error logging
        console.error("Error fetching testimonials by customer_id:", JSON.stringify(error, null, 2));
        return [];
    }

    return data.map(transformTestimonial);
}

/**
 * Get customer by ID
 */
export async function getCustomerById(customerId: string) {
    if (!customerId || !UUID_REGEX.test(customerId)) return null;

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();

    if (error) {
        console.error("Error fetching customer:", error);
        return null;
    }

    return {
        id: data.id,
        email: data.email,
        fullName: data.full_name || "Anonymous",
        headline: data.headline || "",
        avatarUrl: data.avatar_url || "",
        companyDetails: data.company_details || {},
        socialProfiles: data.social_profiles || {},
        projectId: data.project_id,
        createdAt: data.created_at,
    };
}

