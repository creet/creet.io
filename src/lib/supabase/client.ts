"use client";

import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a singleton Supabase client for use in browser environments (client components).
 * This ensures that the same client instance is used across the application,
 * correctly managing the user's session and authentication state.
 *
 * @see https://supabase.com/docs/guides/auth/nextjs
 */

let client: ReturnType<typeof createBrowserClient> | undefined

function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return client
}

export const createClient = () => {
    return getSupabaseBrowserClient();
}

