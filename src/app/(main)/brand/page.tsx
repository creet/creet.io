import { requireAuth, getUserProfileWithProjects } from "@/lib/auth/server-auth";
import BrandPageClient from "./BrandPageClient";
import { redirect } from "next/navigation";

export default async function BrandPage() {
    await requireAuth();
    const data = await getUserProfileWithProjects();

    if (!data) {
        redirect("/login");
    }

    const { projects, profile } = data;
    const activeProjectId = profile?.active_project_id;

    // Find active project or fallback to first one
    const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

    if (!activeProject) {
        // If no projects, redirect to dashboard which presumably handles onboarding or empty state
        redirect("/dashboard");
    }

    return <BrandPageClient project={activeProject} />;
}
