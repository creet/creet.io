"use client"

import { AuthProvider } from "@/contexts/AuthContext"

/**
 * App Providers
 * 
 * This component wraps all client-side providers in the correct order.
 * AuthProvider provides auth state for UI/UX purposes on client components.
 * 
 * Note: Application data (testimonials, projects, etc.) flows from server
 * components to client components via props - not through a global context.
 * This follows Next.js 15 best practices for data fetching.
 */

interface ProvidersProps {
    children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    )
}
