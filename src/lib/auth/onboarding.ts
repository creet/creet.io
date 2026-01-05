import { createClient } from "@/lib/supabase/server";

/**
 * Check if user needs onboarding (has no projects yet).
 * Returns true if user needs to complete onboarding.
 */
export async function needsOnboarding(): Promise<boolean> {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return false; // Not authenticated, let auth middleware handle it
    }

    // Check if user has any projects
    const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

    if (projectsError) {
        console.error("Error checking projects:", projectsError);
        return false; // Fail open to avoid blocking user
    }

    // User needs onboarding if they have no projects
    return !projects || projects.length === 0;
}

/**
 * Check if user has completed profile setup.
 * Returns true if profile exists.
 */
export async function hasProfile(): Promise<boolean> {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return false;
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    return !!profile;
}
