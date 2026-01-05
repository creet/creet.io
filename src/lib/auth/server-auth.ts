import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Server-Side Auth Utilities
 * 
 * These functions are for Server Components and API Routes.
 * They handle authentication and authorization on the server.
 */

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 * 
 * Use this when you want to check auth but not force a redirect
 */
export const getUser = async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
};

/**
 * Require authentication - redirect to login if not authenticated
 * 
 * Use this in Server Components that require auth.
 * It will automatically redirect to /login if user is not authenticated.
 * 
 * @returns The authenticated user
 */
export const requireAuth = async (): Promise<User> => {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
};

/**
 * Get user with their projects
 * Returns the user and their projects
 * 
 * Use this in dashboard pages to get both user and their projects
 */
export const getUserWithProjects = async () => {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return { user, projects: [] };
  }

  return { user, projects: projects || [] };
};

export const getUserProfileWithProjects = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const [{ data: profile, error: profileError }, { data: projects, error: projectsError }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, plan, active_project_id, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
  }

  return {
    user,
    profile: profile ?? null,
    projects: projects ?? [],
  };
};

/**
 * Verify if a user owns a specific project
 * 
 * Use this in API routes to authorize resource access
 * 
 * @param projectId - The project ID to check
 * @param userId - The user ID to verify ownership
 * @returns true if user owns the project, false otherwise
 */
export const verifyProjectOwnership = async (
  projectId: string,
  userId: string
): Promise<boolean> => {
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .single();

  return project?.user_id === userId;
};

/**
 * Verify if a user owns a form (through its project)
 * 
 * Use this in API routes to authorize form access
 * 
 * @param formId - The form ID to check
 * @param userId - The user ID to verify ownership
 * @returns true if user owns the form's project, false otherwise
 */
export const verifyFormOwnership = async (
  formId: string,
  userId: string
): Promise<boolean> => {
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("project_id")
    .eq("id", formId)
    .single();

  if (!form) return false;

  return verifyProjectOwnership(form.project_id, userId);
};

