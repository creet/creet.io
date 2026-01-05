"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ================================================================= //
//                       WALL SERVER ACTIONS                          //
// ================================================================= //

export interface SaveWallInput {
    id?: string; // If provided, update existing wall
    name: string;
    slug: string; // Unique URL slug for the wall
    config: Record<string, any>;
    selectedTestimonialIds: string[];
    isPublished?: boolean;
    projectId?: string;
}

export interface WallRecord {
    id: string;
    user_id: string;
    project_id: string;
    name: string;
    slug: string;
    is_published: boolean;
    config: Record<string, any>;
    selected_testimonial_ids: string[];
    created_at: string;
    updated_at: string;
}

/**
 * Save a Wall of Love (create or update)
 */
export async function saveWall(input: SaveWallInput): Promise<{ success: boolean; data?: WallRecord; error?: string }> {
    console.log("=== saveWall called ===");
    console.log("Input:", JSON.stringify(input, null, 2));

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log("User:", user?.id || "NOT AUTHENTICATED");

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Get or create a default project for the user
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

    const projectId = project.id;
    const now = new Date().toISOString();

    // Check if we're updating an existing wall
    if (input.id) {
        // Verify the wall belongs to this user
        const { data: existingWall, error: fetchError } = await supabase
            .from('walls')
            .select('id, slug, project_id')
            .eq('id', input.id)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !existingWall) {
            console.log("Wall not found, creating new one");
        } else {
            // Update existing wall - keep existing slug to avoid breaking links
            const configWithTestimonials = {
                ...input.config,
                selectedTestimonialIds: input.selectedTestimonialIds
            };

            const { data: updatedWall, error: updateError } = await supabase
                .from('walls')
                .update({
                    name: input.name,
                    config: configWithTestimonials,
                    is_published: input.isPublished ?? true,
                    updated_at: now,
                })
                .eq('id', input.id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (updateError) {
                console.error("Update wall error:", updateError);
                return { success: false, error: "Failed to update wall: " + updateError.message };
            }

            revalidatePath("/dashboard/walls");

            return { success: true, data: updatedWall as WallRecord };
        }
    }

    // Determine Project ID:
    // 1. Use input.projectId if provided
    // 2. Fallback to fetching user's active_project_id from profile
    // 3. Fallback to first project found
    let targetProjectId = input.projectId;

    if (!targetProjectId) {
        // Fetch user profile for active_project_id
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('active_project_id')
            .eq('id', user.id)
            .single();

        if (profile?.active_project_id) {
            targetProjectId = profile.active_project_id;
        } else {
            // Fallback: Get or create a default project
            let { data: project } = await supabase
                .from('projects')
                .select('id')
                .eq('user_id', user.id)
                .limit(1)
                .single();

            if (!project) {
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
            targetProjectId = project!.id;
        }
    }

    // Create new wall
    const configWithTestimonials = {
        ...input.config,
        selectedTestimonialIds: input.selectedTestimonialIds
    };

    const { data: newWall, error: insertError } = await supabase
        .from('walls')
        .insert({
            user_id: user.id,
            project_id: targetProjectId,
            name: input.name,
            slug: input.slug,
            config: configWithTestimonials,
            is_published: input.isPublished ?? true,
            created_at: now,
            updated_at: now,
        })
        .select()
        .single();

    if (insertError) {
        console.error("Insert wall error:", insertError);
        return { success: false, error: "Failed to save wall: " + insertError.message };
    }

    revalidatePath("/dashboard/walls");

    return { success: true, data: newWall as WallRecord };
}

/**
 * Get all walls for the current user
 */
export async function getWalls(projectId?: string): Promise<{ data: WallRecord[] | null; error?: string }> {
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
        .from('walls')
        .select('*')
        .eq('project_id', projectId);

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
        console.error("Error fetching walls:", error);
        return { data: null, error: error.message };
    }

    return { data: data as WallRecord[] };
}

/**
 * Delete a wall by ID
 */
export async function deleteWall(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from('walls')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error("Error deleting wall:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/walls");
    revalidatePath("/design");

    return { success: true };
}

/**
 * Get a single wall by ID
 */
export async function getWallById(id: string): Promise<{ data: WallRecord | null; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from('walls')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error("Error fetching wall:", error);
        return { data: null, error: error.message };
    }

    return { data: data as WallRecord };
}

/**
 * Get a single published wall by ID (public access, no auth required)
 * Only returns walls with is_published=true
 */
export async function getWallByIdPublic(id: string): Promise<{ data: WallRecord | null; error?: string }> {
    // Use Service Role Key to bypass RLS for public access
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");

    const adminAuthClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await adminAuthClient
        .from('walls')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

    if (error) {
        console.error("Error fetching public wall:", error);
        return { data: null, error: "Wall not found or not published" };
    }

    return { data: data as WallRecord };
}
