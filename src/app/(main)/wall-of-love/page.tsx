import { Suspense } from "react";
import WallOfLoveClient from "./WallOfLoveClient";
import { getUserProfileWithProjects } from "@/lib/auth/server-auth";
import { redirect } from "next/navigation";

export default async function WallOfLovePage() {
    const result = await getUserProfileWithProjects();

    if (!result?.user) {
        redirect("/login");
    }

    const { profile, projects } = result;

    // Determine active project
    let activeProjectId = profile?.active_project_id;

    if (!activeProjectId && projects.length > 0) {
        activeProjectId = projects[0].id;
    }

    // Pass projectId to client
    return (
        <WallOfLoveClient projectId={activeProjectId || null} />
    );
}
