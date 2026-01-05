"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;

    if (!name || name.trim().length === 0) {
        throw new Error("Project name is required");
    }

    // Default brand settings - same as Brand page defaults
    const defaultBrandSettings = {
        logoUrl: "",
        brandName: name.trim(),
        websiteUrl: "",
        primaryColor: "#BFFF00", // Brand lime
        textColor: "#E4E4E7",    // Zinc-200
        ratingColor: "#fbbf24",  // Amber-400
        headingFont: "Satoshi",
        bodyFont: "Inter",
    };

    const { data: project, error } = await supabase
        .from('projects')
        .insert({
            user_id: user.id,
            name: name.trim(),
            brand_settings: defaultBrandSettings,
        })
        .select()
        .single();

    if (error) {
        console.error("Failed to create project:", error);
        throw new Error("Failed to create project: " + error.message);
    }

    // Set as active project
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ active_project_id: project.id })
        .eq('id', user.id);

    if (profileError) {
        console.error("Failed to set active project:", profileError);
        // Don't throw here, as project was created successfully.
        // The user might just need to manually switch or refresh.
    }

    revalidatePath("/dashboard");
    return { success: true, project };
}

export async function switchProject(projectId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // Verify project belongs to user
    const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

    if (!project) {
        throw new Error("Project not found or unauthorized");
    }

    // Update active project in profile
    const { error } = await supabase
        .from('profiles')
        .update({ active_project_id: projectId })
        .eq('id', user.id);

    if (error) {
        console.error("Failed to switch project:", error);
        throw new Error("Failed to switch project");
    }

    revalidatePath("/dashboard");
    return { success: true };
}

export async function updateProjectBrand(projectId: string, brandSettings: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verify ownership
    const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('id', projectId)
        .eq('user_id', user.id);

    if (count === 0) throw new Error("Unauthorized");

    const updateData: any = { brand_settings: brandSettings };

    // Sync brand name to project name if present
    if (brandSettings.brandName && typeof brandSettings.brandName === 'string' && brandSettings.brandName.trim().length > 0) {
        updateData.name = brandSettings.brandName.trim();
    }

    const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

    if (error) {
        throw new Error("Failed to update brand settings: " + error.message);
    }

    revalidatePath("/brand");
    revalidatePath("/form-builder");
    return { success: true };
}

/**
 * Get brand settings for the user's active project
 * Used to set defaults when creating new widgets/walls
 */
export async function getActiveBrandSettings(): Promise<{
    data: {
        primaryColor: string;
        textColor: string;
        ratingColor: string;
        headingFont: string;
        bodyFont: string;
        logoUrl?: string;
        brandName?: string;
    } | null;
    error?: string;
}> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { data: null, error: "Unauthorized" };
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
        // Return defaults if no project exists
        return {
            data: {
                primaryColor: "#BFFF00",
                textColor: "#E4E4E7",
                ratingColor: "#fbbf24",
                headingFont: "Satoshi",
                bodyFont: "Inter",
            }
        };
    }

    // Fetch brand settings from project
    const { data: project, error } = await supabase
        .from("projects")
        .select("brand_settings, name")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

    if (error || !project) {
        return {
            data: {
                primaryColor: "#BFFF00",
                textColor: "#E4E4E7",
                ratingColor: "#fbbf24",
                headingFont: "Satoshi",
                bodyFont: "Inter",
            }
        };
    }

    const settings = project.brand_settings || {};

    return {
        data: {
            primaryColor: settings.primaryColor || "#BFFF00",
            textColor: settings.textColor || "#E4E4E7",
            ratingColor: settings.ratingColor || "#fbbf24",
            headingFont: settings.headingFont || "Satoshi",
            bodyFont: settings.bodyFont || "Inter",
            logoUrl: settings.logoUrl,
            brandName: settings.brandName || project.name,
        }
    };
}

/**
 * Get the active project ID for the current user.
 * Returns null if no project is found.
 */
export async function getActiveProjectId(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Get active project from profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("active_project_id")
        .eq("id", user.id)
        .single();

    let projectId = profile?.active_project_id;

    if (!projectId) {
        // Fallback to first project
        const { data: projects } = await supabase
            .from("projects")
            .select("id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        projectId = projects?.[0]?.id;
    }

    return projectId || null;
}
