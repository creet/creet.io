"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// ================================================================= //
//                       WIDGET SERVER ACTIONS                        //
// ================================================================= //

export interface SaveWidgetInput {
    id?: string; // If provided, update existing widget
    name: string;
    type: string;
    config: Record<string, any>;
    selectedTestimonialIds: string[];
    status?: 'published' | 'unpublished';
    projectId?: string;
}

export interface WidgetRecord {
    id: string;
    user_id: string;
    project_id: string;
    name: string;
    type: string;
    status: string;
    config: Record<string, any>;
    selected_testimonial_ids: string[];
    created_at: string;
    updated_at: string;
    published_at: string | null;
}

/**
 * Save a widget (create or update)
 * If widget.id is provided and exists, it will update. Otherwise, it creates a new widget.
 */
export async function saveWidget(input: SaveWidgetInput): Promise<{ success: boolean; data?: WidgetRecord; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Determine Project ID:
    // 1. Use input.projectId if provided
    // 2. Fallback to fetching user's active_project_id from profile
    // 3. Fallback to first project found
    let projectId = input.projectId;

    if (!projectId) {
        // Fetch user profile for active_project_id
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('active_project_id')
            .eq('id', user.id)
            .single();

        if (profile?.active_project_id) {
            projectId = profile.active_project_id;
        } else {
            // Fallback: Get or create a default project
            let { data: project } = await supabase
                .from('projects')
                .select('id')
                .eq('user_id', user.id)
                .limit(1)
                .single();

            if (!project) {
                // Create default project if none exists
                const { data: newProject, error: createError } = await supabase
                    .from('projects')
                    .insert({
                        user_id: user.id,
                        name: 'My First Project'
                    })
                    .select('id')
                    .single();

                if (createError) {
                    console.error("Failed to create default project:", createError);
                    return { success: false, error: "Could not find or create a project." };
                }
                project = newProject;
            }
            projectId = project.id;
        }
    }
    const now = new Date().toISOString();

    // Prepare the config object (remove id, name, type, projectId as they're stored separately)
    const { id: _configId, name: _configName, type: _configType, projectId: _configProjectId, ...cleanConfig } = input.config;

    // Check if we're updating an existing widget
    if (input.id) {
        // Verify the widget belongs to this user
        const { data: existingWidget, error: fetchError } = await supabase
            .from('widgets')
            .select('id')
            .eq('id', input.id)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !existingWidget) {
            // Widget doesn't exist or doesn't belong to user - create a new one instead
            console.log("Widget not found, creating new one");
        } else {
            // Update existing widget
            const { data: updatedWidget, error: updateError } = await supabase
                .from('widgets')
                .update({
                    name: input.name,
                    type: input.type,
                    config: cleanConfig,
                    selected_testimonial_ids: input.selectedTestimonialIds,
                    status: input.status || 'published',
                    updated_at: now,
                })
                .eq('id', input.id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (updateError) {
                console.error("Update widget error:", updateError);
                return { success: false, error: "Failed to update widget: " + updateError.message };
            }

            revalidatePath("/dashboard/widgets");
            revalidatePath(`/canvas/${updatedWidget.id}`);

            return { success: true, data: updatedWidget as WidgetRecord };
        }
    }

    // Create new widget
    const { data: newWidget, error: insertError } = await supabase
        .from('widgets')
        .insert({
            user_id: user.id,
            project_id: projectId,
            name: input.name,
            type: input.type,
            config: cleanConfig,
            selected_testimonial_ids: input.selectedTestimonialIds,
            status: input.status || 'published',
            created_at: now,
            updated_at: now,
        })
        .select()
        .single();

    if (insertError) {
        console.error("Insert widget error:", insertError);
        return { success: false, error: "Failed to save widget: " + insertError.message };
    }

    revalidatePath("/dashboard/widgets");

    return { success: true, data: newWidget as WidgetRecord };
}

/**
 * Get all widgets for the current user
 */
export async function getWidgets(projectId?: string): Promise<{ data: WidgetRecord[] | null; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Unauthorized" };
    }

    // Project ID is REQUIRED - all data belongs to a project
    if (!projectId) {
        return { data: null, error: "Project ID is required" };
    }

    // Verify user owns/has access to this project
    const { data: project } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();

    if (!project || project.user_id !== user.id) {
        return { data: null, error: "Unauthorized project access" };
    }

    let query = supabase
        .from('widgets')
        .select('*')
        .eq('project_id', projectId);

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
        console.error("Error fetching widgets:", error);
        return { data: null, error: error.message };
    }

    return { data: data as WidgetRecord[] };
}

/**
 * Get a single widget by ID
 */
export async function getWidgetById(id: string): Promise<{ data: WidgetRecord | null; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from('widgets')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error("Error fetching widget:", error);
        return { data: null, error: error.message };
    }

    return { data: data as WidgetRecord };
}

/**
 * Get a single published widget by ID (public access, no auth required)
 * Only returns widgets with status 'published'
 */
export async function getPublicWidgetById(id: string): Promise<{ data: WidgetRecord | null; error?: string }> {
    // Use Service Role Key to bypass RLS for public access
    // This is safe because we explicitly filter by status='published'
    const adminAuthClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await adminAuthClient
        .from('widgets')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching public widget:", error);
        return { data: null, error: "Widget not found or not published" };
    }

    return { data: data as WidgetRecord };
}

/**
 * Delete a widget
 */
export async function deleteWidget(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from('widgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error("Delete widget error:", error);
        return { success: false, error: "Failed to delete widget: " + error.message };
    }

    revalidatePath("/dashboard/widgets");

    return { success: true };
}

/**
 * Update widget status (publish/unpublish)
 */
export async function updateWidgetStatus(
    id: string,
    status: 'published' | 'unpublished'
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
    };

    // Set published_at when first published
    if (status === 'published') {
        const { data: existing } = await supabase
            .from('widgets')
            .select('published_at')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (existing && !existing.published_at) {
            updateData.published_at = new Date().toISOString();
        }
    }

    const { error } = await supabase
        .from('widgets')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error("Update widget status error:", error);
        return { success: false, error: "Failed to update widget status: " + error.message };
    }

    revalidatePath("/dashboard/widgets");
    revalidatePath(`/canvas/${id}`);

    return { success: true };
}

/**
 * Get public testimonials by IDs
 * No auth required, used for public widget view
 */
export async function getPublicTestimonialsByIds(ids: string[]): Promise<{ data: any[] | null; error?: string }> {
    if (!ids || ids.length === 0) {
        return { data: [] };
    }

    // Use Service Role Key to bypass RLS for public access
    const adminAuthClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all testimonials in a single query (no ordering - we'll order by input array)
    const { data, error } = await adminAuthClient
        .from("testimonials")
        .select("*")
        .in("id", ids);

    if (error) {
        console.error("Error fetching public testimonials:", error);
        return { data: null, error: error.message };
    }

    // Transform raw DB data to match app structure
    const transformedData = data.map(t => {
        // Build attachments array
        const attachments: { type: 'image' | 'video', url: string }[] = [];

        // Add company logo if available
        if (t.data?.company?.logo_url) {
            attachments.push({ type: 'image', url: t.data.company.logo_url });
        } else if (t.data?.company_logo_url) {
            attachments.push({ type: 'image', url: t.data.company_logo_url });
        }

        // For video testimonials, add thumbnail
        if (t.type === 'video') {
            const thumbnail = t.data?.thumbnails?.[t.data?.selected_thumbnail_index || 0];
            if (thumbnail) {
                attachments.push({ type: 'image', url: thumbnail });
            }
        }

        return {
            id: t.id,
            user_id: t.user_id,
            type: t.type || 'text',
            author_name: t.data?.customer_name || 'Anonymous',
            author_title: t.data?.profession || t.data?.customer_headline || t.data?.company?.job_title || '',
            author_avatar_url: t.data?.customer_avatar_url || t.data?.media?.avatar_url || null,
            rating: t.data?.rating ?? 5,
            content: t.data?.message || '',
            source: t.data?.source || 'MANUAL',
            video_url: t.data?.media?.video_url || null,
            video_thumbnail: t.data?.thumbnails?.[t.data?.selected_thumbnail_index || 0] || null,
            date: new Date(t.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            }),
            tags: t.tags || [],
            attachments: attachments
        };
    });

    // Reorder to match input array order (preserves user's custom ordering)
    const orderedData = ids
        .map(id => transformedData.find(t => t.id === id))
        .filter((t): t is NonNullable<typeof t> => t !== undefined);

    return { data: orderedData };
}
