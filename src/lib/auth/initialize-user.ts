import type { SupabaseClient, User } from "@supabase/supabase-js";

const DEFAULT_PLAN = "hacker";

type GenericClient = SupabaseClient<any, "public", any>;

/**
 * Initialize user resources on first signup.
 * Creates the user profile. Project creation is handled by the onboarding flow.
 */
export const initializeUserResources = async (
  supabase: GenericClient,
  user: User | null
) => {
  if (!user?.id) {
    console.warn("initializeUserResources called without user");
    return;
  }

  try {
    const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    // Get avatar URL from Google OAuth metadata (or other OAuth providers)
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      plan: DEFAULT_PLAN,
      full_name: fullName,
      avatar_url: avatarUrl, // Store the Google profile picture
      active_project_id: null, // Will be set during onboarding
    });

    // 23505 = duplicate key error (profile already exists)
    if (profileError && profileError.code !== "23505") {
      console.error("Failed to create user profile:", profileError);
      // Don't throw - allow the flow to continue even if profile creation fails
      // The user can still potentially access the app
      return;
    }

    if (profileError?.code === "23505") {
      console.log("Profile already exists for user:", user.id);
    } else {
      console.log("Profile created successfully for user:", user.id);
    }
  } catch (error) {
    console.error("Unexpected error in initializeUserResources:", error);
    // Don't throw - fail gracefully
  }
};
