import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { initializeUserResources } from "@/lib/auth/initialize-user";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    console.log("No code in callback, redirecting to dashboard");
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
  }

  console.log("OAuth callback received code");

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server component can't set cookies during render
            console.log("Cookie set attempted:", name);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            console.log("Cookie remove attempted:", name);
          }
        },
      },
    }
  );

  try {
    console.log("Exchanging code for session...");
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    console.log("Session exchanged successfully");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user after session exchange");
      return NextResponse.redirect(`${requestUrl.origin}/login?error=no_user`);
    }

    console.log("User authenticated:", user.id);

    // Initialize user resources (create profile)
    await initializeUserResources(supabase, user);

    // Check if user has projects to determine redirect
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (projectsError) {
      console.error("Error checking projects:", projectsError);
    }

    // Check for 'next' param (e.g. from password reset)
    const next = requestUrl.searchParams.get("next");
    if (next) {
      console.log(`Redirecting to next: ${next}`);
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }

    // New users go to onboarding, existing users to dashboard
    const hasProjects = projects && projects.length > 0;
    const redirectUrl = hasProjects
      ? `${requestUrl.origin}/dashboard`
      : `${requestUrl.origin}/onboarding`;

    console.log(`Redirecting to: ${hasProjects ? 'dashboard' : 'onboarding'}`);

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=callback_failed`
    );
  }
}
