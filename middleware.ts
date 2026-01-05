import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js Middleware - Runs at the Edge
 * 
 * This middleware runs BEFORE every request to protected routes.
 * It's the first line of defense for authentication.
 * 
 * What it does:
 * 1. Refreshes the user's session automatically
 * 2. Protects /dashboard/* routes
 * 3. Redirects unauthenticated users to /login
 * 4. Redirects authenticated users away from /login and /signup
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

