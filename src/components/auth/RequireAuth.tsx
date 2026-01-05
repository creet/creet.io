"use server"

import { redirect } from "next/navigation"
import { getUserProfileWithProjects } from "@/lib/auth/server-auth"

interface RequireAuthProps {
    children: React.ReactNode
    redirectTo?: string
}

/**
 * Server Component wrapper that protects pages
 * 
 * Usage:
 * ```tsx
 * export default async function ProtectedPage() {
 *   return (
 *     <RequireAuth>
 *       <YourPageContent />
 *     </RequireAuth>
 *   )
 * }
 * ```
 */
export async function RequireAuth({
    children,
    redirectTo = "/login"
}: RequireAuthProps) {
    const result = await getUserProfileWithProjects()

    if (!result?.user) {
        redirect(redirectTo)
    }

    return <>{children}</>
}
