import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Client for Server Components, API Routes, and Server Actions (Security)
 * 
 * Use this in:
 * - Server Components (to protect pages and fetch data securely)
 * - API Routes (to authenticate and authorize requests)
 * - Server Actions (to validate user permissions)
 * 
 * This handles the SECURITY layer of authentication.
 * It runs on the server before any code reaches the browser.
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

