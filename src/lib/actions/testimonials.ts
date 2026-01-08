"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ===================== PAGINATION OPTIONS ===================== //
export interface GetTestimonialsOptions {
    page?: number;           // 1-indexed page number
    limit?: number;          // Items per page (default 25)
    search?: string;         // Search query (searches name, content)
    sortBy?: 'created_at' | 'rating' | 'author_name';  // Sort field
    sortOrder?: 'asc' | 'desc';  // Sort direction
    filterType?: 'all' | 'text' | 'video';  // Filter by testimonial type
    filterSource?: string;   // Filter by source (e.g., 'TWITTER', 'MANUAL')
    projectId: string;       // REQUIRED: Filter by project ID (all data belongs to a project)
}

export interface PaginatedTestimonialsResult {
    data: any[] | null;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export async function getTestimonials(options: GetTestimonialsOptions): Promise<PaginatedTestimonialsResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            data: null,
            error: "Unauthorized",
            pagination: { page: 1, limit: 25, total: 0, totalPages: 0 }
        };
    }

    // Defaults
    const page = options.page || 1;
    const limit = options.limit || 25;
    const sortBy = options.sortBy || 'created_at';
    const sortOrder = options.sortOrder || 'desc';
    const filterType = options.filterType || 'all';
    const search = options.search?.trim() || '';
    const filterSource = options.filterSource || '';
    const projectId = options.projectId;

    // Calculate offset
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let query = supabase
        .from("testimonials")
        .select("*", { count: 'exact' });  // Get total count for pagination

    // Project ID is REQUIRED - all data belongs to a project
    if (!projectId) {
        return {
            data: null,
            error: "Project ID is required",
            pagination: { page: 1, limit: 25, total: 0, totalPages: 0 }
        };
    }

    // Verify user owns/has access to this project
    const { data: project } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();

    if (!project || project.user_id !== user.id) {
        return {
            data: null,
            error: "Unauthorized project access",
            pagination: { page: 1, limit: 25, total: 0, totalPages: 0 }
        };
    }

    query = query.eq("project_id", projectId);

    // Apply type filter
    if (filterType !== 'all') {
        query = query.eq("type", filterType);
    }

    // Apply source filter
    if (filterSource) {
        query = query.filter('data->>source', 'eq', filterSource);
    }

    // Apply search (searches customer_name and message in JSONB 'data' column)
    if (search) {
        // Use ilike for case-insensitive search on JSONB fields
        query = query.or(`data->>customer_name.ilike.%${search}%,data->>message.ilike.%${search}%`);
    }

    // Apply sorting
    if (sortBy === 'rating') {
        // Sort by rating in JSONB data
        query = query.order('data->rating', { ascending: sortOrder === 'asc', nullsFirst: false });
    } else if (sortBy === 'author_name') {
        // Sort by customer_name in JSONB data
        query = query.order('data->customer_name', { ascending: sortOrder === 'asc', nullsFirst: false });
    } else {
        // Default: sort by created_at
        query = query.order('created_at', { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching testimonials:", error);
        return {
            data: null,
            error: error.message,
            pagination: { page, limit, total: 0, totalPages: 0 }
        };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Transform raw DB data to the Testimonial interface expected by the app
    const transformedData = data.map(t => {
        // Build attachments array from available image sources
        const attachments: { type: 'image' | 'video', url: string }[] = [];

        // Add company logo if available
        if (t.data?.company?.logo_url) {
            attachments.push({ type: 'image', url: t.data.company.logo_url });
        } else if (t.data?.company_logo_url) {
            attachments.push({ type: 'image', url: t.data.company_logo_url });
        }

        // For video testimonials, add thumbnail as an attachment too
        if (t.type === 'video') {
            const thumbnail = t.data?.thumbnails?.[t.data?.selected_thumbnail_index || 0];
            if (thumbnail) {
                attachments.push({ type: 'image', url: thumbnail });
            }
            // Add video URL to attachments so TestimonialRowCard can find it
            const videoUrl = t.data?.media?.video_url || t.data?.video_url;
            if (videoUrl) {
                attachments.push({ type: 'video', url: videoUrl });
            }
        }

        // Add generic attachments if they exist in data
        if (t.data?.attachments && Array.isArray(t.data.attachments)) {
            t.data.attachments.forEach((att: any) => {
                if (typeof att === 'string') {
                    attachments.push({ type: 'image', url: att });
                } else if (att?.url) {
                    attachments.push({ type: att.type || 'image', url: att.url });
                }
            });
        }

        return {
            id: t.id,
            user_id: t.user_id,
            customer_id: t.customer_id || null,
            type: t.type || 'text',
            author_name: t.data?.customer_name || 'Anonymous',
            author_title: t.data?.profession || t.data?.customer_headline || t.data?.company?.job_title || '',
            author_avatar_url: t.data?.customer_avatar_url || t.data?.media?.avatar_url || null,
            rating: t.data?.rating ?? null,
            text: t.data?.message || '',
            content: t.data?.message || '',
            title: t.data?.title || '',
            source: t.data?.source || 'MANUAL',
            video_url: t.data?.media?.video_url || null,
            video_thumbnail: t.data?.thumbnails?.[t.data?.selected_thumbnail_index || 0] || null,
            trim_start: t.data?.trim_start,
            trim_end: t.data?.trim_end,
            attachments,
            created_at: t.created_at,
            updated_at: t.updated_at || t.created_at,
            status: t.status || 'public',
        };
    });

    return {
        data: transformedData,
        error: null,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };
}

/**
 * Fetch testimonials by specific IDs
 * Used for loading saved Wall of Love selections efficiently
 */
export async function getTestimonialsByIds(ids: string[]) {
    if (!ids || ids.length === 0) {
        return { data: [], error: null };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Unauthorized" };
    }

    // Fetch all testimonials in a single query (no ordering - we'll order by input array)
    const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("user_id", user.id)
        .in("id", ids);

    if (error) {
        console.error("Error fetching testimonials by IDs:", error);
        return { data: null, error: error.message };
    }

    // Transform raw DB data (same transformation as getTestimonials)
    const transformedData = data.map(t => {
        const attachments: { type: 'image' | 'video', url: string }[] = [];

        if (t.data?.company?.logo_url) {
            attachments.push({ type: 'image', url: t.data.company.logo_url });
        } else if (t.data?.company_logo_url) {
            attachments.push({ type: 'image', url: t.data.company_logo_url });
        }

        if (t.type === 'video') {
            const thumbnail = t.data?.thumbnails?.[t.data?.selected_thumbnail_index || 0];
            if (thumbnail) {
                attachments.push({ type: 'image', url: thumbnail });
            }
            // Add video URL to attachments so TestimonialRowCard can find it
            const videoUrl = t.data?.media?.video_url || t.data?.video_url;
            if (videoUrl) {
                attachments.push({ type: 'video', url: videoUrl });
            }
        }

        if (t.data?.attachments && Array.isArray(t.data.attachments)) {
            t.data.attachments.forEach((att: any) => {
                if (typeof att === 'string') {
                    attachments.push({ type: 'image', url: att });
                } else if (att?.url) {
                    attachments.push({ type: att.type || 'image', url: att.url });
                }
            });
        }

        return {
            id: t.id,
            user_id: t.user_id,
            customer_id: t.customer_id || null,
            type: t.type || 'text',
            author_name: t.data?.customer_name || 'Anonymous',
            author_title: t.data?.profession || t.data?.customer_headline || t.data?.company?.job_title || '',
            author_avatar_url: t.data?.customer_avatar_url || t.data?.media?.avatar_url || null,
            rating: t.data?.rating ?? null,
            text: t.data?.message || '',
            content: t.data?.message || '',
            title: t.data?.title || '',
            source: t.data?.source || 'MANUAL',
            video_url: t.data?.media?.video_url || null,
            video_thumbnail: t.data?.thumbnails?.[t.data?.selected_thumbnail_index || 0] || null,
            attachments,
            created_at: t.created_at,
            updated_at: t.updated_at || t.created_at,
            status: t.status || 'public',
        };
    });

    // Reorder to match input array order (preserves user's custom ordering)
    const orderedData = ids
        .map(id => transformedData.find(t => t.id === id))
        .filter((t): t is NonNullable<typeof t> => t !== undefined);

    return { data: orderedData, error: null };
}

/**
 * Fetch ALL testimonials for the user's active project
 * Used when client components need all testimonials (e.g., for selection modals)
 * without needing to know the projectId upfront.
 * 
 * This function auto-detects the active project from the user's profile.
 */
export async function getAllTestimonialsForActiveProject() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: [], error: "Unauthorized" };
    }

    // Get user's active project from profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("active_project_id")
        .eq("id", user.id)
        .single();

    let projectId = profile?.active_project_id;

    // If no active project, try to get the first project
    if (!projectId) {
        const { data: projects } = await supabase
            .from("projects")
            .select("id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        projectId = projects?.[0]?.id;
    }

    if (!projectId) {
        return { data: [], error: "No project found" };
    }

    // Fetch all testimonials for this project
    const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching all testimonials:", error);
        return { data: [], error: error.message };
    }

    if (!data || data.length === 0) {
        return { data: [], error: null };
    }

    // Transform raw DB data (same transformation as other functions)
    const transformedData = data.map(t => {
        const attachments: { type: 'image' | 'video', url: string }[] = [];

        if (t.data?.company?.logo_url) {
            attachments.push({ type: 'image', url: t.data.company.logo_url });
        } else if (t.data?.company_logo_url) {
            attachments.push({ type: 'image', url: t.data.company_logo_url });
        }

        if (t.type === 'video') {
            const thumbnail = t.data?.thumbnails?.[t.data?.selected_thumbnail_index || 0];
            if (thumbnail) {
                attachments.push({ type: 'image', url: thumbnail });
            }
        }

        if (t.data?.attachments && Array.isArray(t.data.attachments)) {
            t.data.attachments.forEach((att: any) => {
                if (typeof att === 'string') {
                    attachments.push({ type: 'image', url: att });
                } else if (att?.url) {
                    attachments.push({ type: att.type || 'image', url: att.url });
                }
            });
        }

        return {
            id: t.id,
            user_id: t.user_id,
            customer_id: t.customer_id || null,
            type: t.type || 'text',
            author_name: t.data?.customer_name || 'Anonymous',
            author_title: t.data?.profession || t.data?.customer_headline || t.data?.company?.job_title || '',
            author_avatar_url: t.data?.customer_avatar_url || t.data?.media?.avatar_url || null,
            rating: t.data?.rating ?? null,
            text: t.data?.message || '',
            content: t.data?.message || '',
            title: t.data?.title || '',
            source: t.data?.source || 'MANUAL',
            video_url: t.data?.media?.video_url || null,
            video_thumbnail: t.data?.thumbnails?.[t.data?.selected_thumbnail_index || 0] || null,
            attachments,
            created_at: t.created_at,
            updated_at: t.updated_at || t.created_at,
            status: t.status || 'public',
        };
    });

    return { data: transformedData, error: null };
}

/**
 * Fetch first N recent testimonials (preview for new Wall of Love)
 * Used for displaying initial testimonials on new walls before user saves
 * Filters by the user's ACTIVE PROJECT to avoid showing testimonials from other projects
 */
export async function getTestimonialsPreview(limit: number = 10) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: [], error: "Unauthorized" };
    }

    // Get user's active project from profile (same as getAllTestimonialsForActiveProject)
    const { data: profile } = await supabase
        .from("profiles")
        .select("active_project_id")
        .eq("id", user.id)
        .single();

    let projectId = profile?.active_project_id;

    // If no active project, try to get the first project
    if (!projectId) {
        const { data: projects } = await supabase
            .from("projects")
            .select("id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        projectId = projects?.[0]?.id;
    }

    if (!projectId) {
        return { data: [], error: "No project found" };
    }

    // Fetch testimonials for this specific project only
    const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("user_id", user.id)
        .eq("project_id", projectId)  // Filter by active project!
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .limit(limit);

    if (error) {
        console.error("Error fetching testimonials preview:", error);
        return { data: [], error: error.message };
    }

    if (!data || data.length === 0) {
        return { data: [], error: null };
    }

    // Transform raw DB data (same transformation as getTestimonialsByIds)
    const transformedData = data.map(t => {
        const attachments: { type: 'image' | 'video', url: string }[] = [];

        if (t.data?.company?.logo_url) {
            attachments.push({ type: 'image', url: t.data.company.logo_url });
        } else if (t.data?.company_logo_url) {
            attachments.push({ type: 'image', url: t.data.company_logo_url });
        }

        if (t.type === 'video') {
            const thumbnail = t.data?.thumbnails?.[t.data?.selected_thumbnail_index || 0];
            if (thumbnail) {
                attachments.push({ type: 'image', url: thumbnail });
            }
            // Add video URL to attachments so TestimonialRowCard can find it
            const videoUrl = t.data?.media?.video_url || t.data?.video_url;
            if (videoUrl) {
                attachments.push({ type: 'video', url: videoUrl });
            }
        }

        if (t.data?.attachments && Array.isArray(t.data.attachments)) {
            t.data.attachments.forEach((att: any) => {
                if (typeof att === 'string') {
                    attachments.push({ type: 'image', url: att });
                } else if (att?.url) {
                    attachments.push({ type: att.type || 'image', url: att.url });
                }
            });
        }

        return {
            id: t.id,
            user_id: t.user_id,
            customer_id: t.customer_id || null,
            type: t.type || 'text',
            author_name: t.data?.customer_name || 'Anonymous',
            author_title: t.data?.profession || t.data?.customer_headline || t.data?.company?.job_title || '',
            author_avatar_url: t.data?.customer_avatar_url || t.data?.media?.avatar_url || null,
            rating: t.data?.rating ?? null,
            text: t.data?.message || '',
            content: t.data?.message || '',
            title: t.data?.title || '',
            source: t.data?.source || 'MANUAL',
            video_url: t.data?.media?.video_url || null,
            video_thumbnail: t.data?.thumbnails?.[t.data?.selected_thumbnail_index || 0] || null,
            attachments,
            created_at: t.created_at,
            updated_at: t.updated_at || t.created_at,
            status: t.status || 'public',
        };
    });

    return { data: transformedData, error: null };
}

export async function createTestimonial(formData: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Get or create project
    const { getOrCreateDefaultProject } = await import('./testimonials-core');
    const projectId = await getOrCreateDefaultProject(user.id);

    // Trim email to handle whitespace-only input
    const emailTrimmed = formData.customer_email?.trim() || '';
    const hasEmail = emailTrimmed.length > 0;

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Handle customer (Create customer record if needed)
    // ═══════════════════════════════════════════════════════════════════════
    let customerId: string | null = null;



    if (hasEmail) {
        // Check if customer with this email already exists
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('project_id', projectId)
            .eq('email', emailTrimmed)
            .maybeSingle();

        if (existingCustomer) {
            customerId = existingCustomer.id;
        }
    }

    // If customer doesn't exist (or no email provided), create new customer
    if (!customerId) {
        // Create new customer
        const { data: newCustomer, error: createError } = await supabase
            .from('customers')
            .insert({
                project_id: projectId,
                email: hasEmail ? emailTrimmed : null,
                full_name: formData.customer_name || 'Anonymous',
                headline: formData.customer_headline,
                avatar_url: formData.customer_avatar_url,
                company_details: {
                    name: formData.company_name,
                    job_title: formData.company_title,
                    website: formData.company_website,
                    logo_url: formData.company_logo_url,
                },
                social_profiles: {},
            })
            .select('id')
            .single();

        if (createError) {
            console.error('[createTestimonial] Customer creation failed:', createError);
            // Don't fail - continue without customer_id
        } else {
            customerId = newCustomer.id;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Build testimonial data with attachments
    // ═══════════════════════════════════════════════════════════════════════

    // Build attachments array
    const attachments: { type: string; url: string }[] = [];
    if (formData.attachment_url) {
        attachments.push({
            type: formData.attachment_type || 'image',
            url: formData.attachment_url
        });
    }

    const testimonialData = {
        type: formData.type,
        rating: formData.rating,
        title: formData.testimonial_title,
        message: formData.testimonial_message,
        source: formData.source || 'manual',
        customer_name: formData.customer_name || 'Anonymous',
        customer_email: hasEmail ? emailTrimmed : null,
        profession: formData.customer_headline,
        testimonial_date: formData.testimonial_date,
        original_post_url: formData.original_post_url,
        tags: formData.tags || [],
        company: {
            name: formData.company_name,
            job_title: formData.company_title,
            website: formData.company_website,
            logo_url: formData.company_logo_url,
        },
        media: {
            avatar_url: formData.customer_avatar_url,
            video_url: formData.type === 'video' ? formData.video_url : undefined,
        },
        thumbnails: formData.thumbnails,
        selected_thumbnail_index: 0,
        attachments: attachments,  // Include attachments
    };

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Insert testimonial (single DB call)
    // ═══════════════════════════════════════════════════════════════════════
    const { error: insertError } = await supabase
        .from('testimonials')
        .insert({
            type: formData.type,
            user_id: user.id,
            project_id: projectId,
            customer_id: customerId,
            data: testimonialData,
            status: 'hidden',
        });

    if (insertError) {
        console.error('[createTestimonial] Insert failed:', insertError);
        throw new Error('Failed to save testimonial: ' + insertError.message);
    }

    console.log(`[createTestimonial] Created testimonial for user ${user.id}${customerId ? ` with customer ${customerId}` : ' (orphan)'}`);

    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/import/manual");

    return { success: true };
}


export async function updateTestimonialStatus(id: string | number, status: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('testimonials')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error("Update status error:", error);
        throw new Error("Failed to update status: " + error.message);
    }

    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteTestimonial(id: string | number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Fetch data to identify files and customer email
    const { data: record } = await supabase
        .from('testimonials')
        .select('data, project_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    // Store customer email and project_id for cleanup later
    const customerEmail = record?.data?.customer_email;
    const projectId = record?.project_id;

    if (record?.data) {
        const pathsToDelete: string[] = [];
        const d = record.data;

        // Helper to check if a string is a Cloudflare UID (alphanumeric, no slashes, not a URL)
        const isCloudflareUid = (value: string): boolean => {
            if (!value || typeof value !== 'string') return false;
            // Cloudflare UIDs are typically 32 character alphanumeric strings
            // They don't contain slashes, dots, or http
            return !value.includes('/') &&
                !value.includes('.') &&
                !value.startsWith('http') &&
                !value.startsWith('blob:') &&
                value.length > 10; // UIDs are typically 32 chars
        };

        const extractPath = (url: string) => {
            if (!url || typeof url !== 'string') return null;
            try {
                if (url.includes('/storage/v1/object/public/assets/')) {
                    const parts = url.split('/public/assets/');
                    return parts[1];
                }
                return null;
            } catch { return null; }
        };

        // Check for Cloudflare video UID and delete from Cloudflare
        const videoUrl = d.media?.video_url || d.video_url;
        if (videoUrl && isCloudflareUid(videoUrl)) {
            console.log(`Detected Cloudflare video UID: ${videoUrl}, checking if still in use...`);

            // Check if any OTHER testimonials in this project use the same video
            const { count: otherUsageCount, error: countError } = await supabase
                .from('testimonials')
                .select('id', { count: 'exact', head: true })
                .eq('project_id', projectId)
                .eq('user_id', user.id)
                .neq('id', id)
                .or(`data->media->video_url.eq.${videoUrl},data->video_url.eq.${videoUrl}`);

            if (countError) {
                console.error("Error checking video usage:", countError);
            }

            // Only delete from Cloudflare if no other testimonials use this video
            if (!countError && otherUsageCount === 0) {
                console.log(`No other testimonials use this video. Proceeding with Cloudflare deletion...`);
                try {
                    // Dynamically import to avoid circular dependencies
                    const { deleteCloudflareVideo } = await import('./cloudflare-stream');
                    const result = await deleteCloudflareVideo(videoUrl);
                    if (result.success) {
                        console.log(`Successfully deleted Cloudflare video: ${videoUrl}`);
                    } else {
                        console.error(`Failed to delete Cloudflare video: ${result.error}`);
                    }
                } catch (cfError) {
                    console.error("Error deleting Cloudflare video:", cfError);
                    // Continue with deletion even if Cloudflare delete fails
                }
            } else {
                console.log(`Skipping Cloudflare deletion: ${otherUsageCount} other testimonial(s) still use this video`);
            }
        }

        const potentialUrls = [
            d.customer_avatar_url,
            d.media?.avatar_url,
            d.company_logo_url,
            d.company?.logo_url,
            d.media?.video_url,
            ...(Array.isArray(d.thumbnails) ? d.thumbnails.map((t: any) => typeof t === 'string' ? t : t?.url) : [])
        ];

        potentialUrls.forEach(url => {
            const path = extractPath(url);
            if (path) pathsToDelete.push(path);
        });

        if (pathsToDelete.length > 0) {
            const { error: storageError } = await supabase.storage
                .from('assets')
                .remove(pathsToDelete);

            if (storageError) {
                console.error("Failed to delete associated files:", storageError);
            }
        }
    }

    // 2. Delete the testimonial
    const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error("Delete error:", error);
        throw new Error("Failed to delete testimonial: " + error.message);
    }

    revalidatePath("/dashboard");
    return { success: true };
}

export async function updateTestimonialContent(id: string | number, data: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Fetch existing testimonial (1 DB call)
    // ═══════════════════════════════════════════════════════════════════════
    const { data: existing, error: fetchError } = await supabase
        .from('testimonials')
        .select('data, project_id, customer_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (fetchError || !existing) throw new Error("Testimonial not found");

    const projectId = existing.project_id;
    const originalEmail = existing.data?.customer_email;
    const newEmail = data.customer_email?.trim() || null;  // Trim to handle whitespace-only input
    const isEmailChanging = newEmail && newEmail !== originalEmail;
    const isOrphan = !existing.customer_id;

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Handle customer linking/updating
    // ═══════════════════════════════════════════════════════════════════════
    let customerIdToLink: string | null = existing.customer_id;

    if (isEmailChanging && projectId) {
        // First, check if newEmail is already used by ANOTHER customer
        const { data: emailOwner, error: lookupError } = await supabase
            .from('customers')
            .select('id')
            .eq('project_id', projectId)
            .eq('email', newEmail)
            .maybeSingle();

        if (lookupError) {
            console.error("Customer lookup error:", lookupError);
        }

        if (isOrphan) {
            // ─────────────────────────────────────────────────────────────────
            // ORPHAN TESTIMONIAL: No customer_id yet
            // ─────────────────────────────────────────────────────────────────
            if (emailOwner) {
                // Email already exists → BLOCK (prevent accidental adoption)
                return { success: false, error: "This email already exists. Please use a unique email." };
            }

            // New email → Create new customer
            const { data: newCustomer, error: createError } = await supabase
                .from('customers')
                .insert({
                    project_id: projectId,
                    email: newEmail,
                    full_name: data.customer_name || existing.data?.customer_name || 'Anonymous',
                    headline: data.customer_headline || existing.data?.customer_headline,
                    company_details: data.company || existing.data?.company || {},
                    social_profiles: {}
                })
                .select('id')
                .single();

            if (createError) {
                if (createError.code === '23505') {
                    return { success: false, error: "This email was just taken" };
                }
                console.error("Customer creation error:", createError);
                throw new Error("Failed to create customer record");
            }
            customerIdToLink = newCustomer.id;
        } else {
            // ─────────────────────────────────────────────────────────────────
            // NON-ORPHAN TESTIMONIAL: Already has a customer_id
            // ─────────────────────────────────────────────────────────────────
            if (emailOwner && emailOwner.id !== existing.customer_id) {
                // newEmail belongs to a DIFFERENT customer → Block
                return { success: false, error: "This email already exists for another customer" };
            }

            // newEmail is unique OR belongs to this same customer
            // → Update the existing customer's email (don't create new)
            const { error: updateEmailError } = await supabase
                .from('customers')
                .update({ email: newEmail })
                .eq('id', existing.customer_id);

            if (updateEmailError) {
                if (updateEmailError.code === '23505') {
                    return { success: false, error: "This email was just taken" };
                }
                console.error("Failed to update customer email:", updateEmailError);
            }
            // customerIdToLink stays the same (existing.customer_id)
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Single atomic update for testimonial (1 DB call)
    // ═══════════════════════════════════════════════════════════════════════
    const mergedData = {
        ...existing.data,
        ...data,
        company: data.company
            ? { ...existing.data?.company, ...data.company }
            : existing.data?.company
    };

    const updatePayload: { data: any; customer_id?: string } = { data: mergedData };
    if (customerIdToLink && customerIdToLink !== existing.customer_id) {
        updatePayload.customer_id = customerIdToLink;
    }

    const { error: updateError } = await supabase
        .from('testimonials')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', user.id);

    if (updateError) {
        console.error("Testimonial update error:", updateError);
        throw new Error("Failed to update testimonial: " + updateError.message);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Sync other customer details (fire-and-forget)
    // ═══════════════════════════════════════════════════════════════════════
    if (customerIdToLink && (data.customer_name || data.customer_headline || data.company)) {
        supabase
            .from('customers')
            .update({
                full_name: data.customer_name || mergedData.customer_name,
                headline: data.customer_headline || mergedData.customer_headline,
                company_details: mergedData.company || {}
            })
            .eq('id', customerIdToLink)
            .then(({ error }) => {
                if (error) console.error("Customer sync error:", error);
            });
    }

    revalidatePath("/dashboard");
    return { success: true, customerId: customerIdToLink };
}

export async function duplicateTestimonial(id: string | number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Fetch the existing testimonial
    const { data: existing, error: fetchError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (fetchError || !existing) {
        console.error("Error fetching testimonial for duplication:", fetchError);
        throw new Error("Testimonial not found");
    }

    // Create an exact copy of the data (no "(Copy)" suffix)
    const duplicatedData = {
        ...existing.data,
    };

    // Insert the duplicated testimonial
    const { data: newTestimonial, error: insertError } = await supabase
        .from('testimonials')
        .insert({
            type: existing.type,
            user_id: user.id,
            project_id: existing.project_id,
            customer_id: existing.customer_id,
            data: duplicatedData,
            status: existing.status
        })
        .select('*')  // Select all fields to return full data
        .single();

    if (insertError) {
        console.error("Error duplicating testimonial:", insertError);
        throw new Error("Failed to duplicate testimonial: " + insertError.message);
    }

    // Format the testimonial for UI consumption (same format as getTestimonials)
    const formattedTestimonial = {
        id: newTestimonial.id,
        type: newTestimonial.type,
        reviewer: duplicatedData.customer_name || 'Anonymous',
        email: duplicatedData.customer_email || '',
        profession: duplicatedData.customer_headline || duplicatedData.profession || '',
        text: duplicatedData.message || duplicatedData.transcript || '',
        content: duplicatedData.message || duplicatedData.transcript || '',
        destination_url: duplicatedData.original_post_url || '',
        excerpt: duplicatedData.message || duplicatedData.transcript || '',
        title: duplicatedData.title || '',
        rating: duplicatedData.rating ?? 0,
        source: duplicatedData.source || 'Manual',
        date: new Date(newTestimonial.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        }),
        video_url: duplicatedData.media?.video_url || duplicatedData.video_url || null,
        attachments: [
            ...(duplicatedData.company?.logo_url ? [{ type: 'image', url: duplicatedData.company.logo_url }] : []),
            ...(Array.isArray(duplicatedData.attachments) ? duplicatedData.attachments.map((att: any) =>
                typeof att === 'string' ? { type: 'image', url: att } : { type: att.type || 'image', url: att.url }
            ) : []),
            ...(newTestimonial.type === 'video' && duplicatedData.thumbnails?.[duplicatedData.selected_thumbnail_index || 0] ? [{
                type: 'image',
                url: duplicatedData.thumbnails[duplicatedData.selected_thumbnail_index || 0]
            }] : []),
            ...(newTestimonial.type === 'video' && duplicatedData.media?.video_url ? [{
                type: 'video',
                url: duplicatedData.media.video_url
            }] : [])
        ],
        videoThumbnail: duplicatedData.thumbnails?.[duplicatedData.selected_thumbnail_index || 0] || '',
        avatar: duplicatedData.media?.avatar_url || duplicatedData.customer_avatar_url || '',
        status: newTestimonial.status === 'public' ? 'Public' : (newTestimonial.status === 'hidden' ? 'Hidden' : 'Pending'),
        customerId: newTestimonial.customer_id || null,
        raw: newTestimonial
    };

    revalidatePath("/dashboard");

    return { success: true, newId: newTestimonial?.id, newTestimonial: formattedTestimonial };
}

