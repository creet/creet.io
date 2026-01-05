import { createClient } from "@/lib/supabase/server";
import { getUserProfileWithProjects } from "@/lib/auth/server-auth";
import FormsPageClient from "@/components/FormsPageClient";
import { redirect } from "next/navigation";
import type { Form } from "@/types/form-config";

const FormsPage = async () => {
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

  const supabase = await createClient();

  // If no project, return empty
  if (!activeProjectId) {
    return <FormsPageClient initialForms={[]} />;
  }

  const { data: forms, error } = await supabase
    .from("forms")
    .select(
      `
      *,
      project:projects!inner(id, name)
    `
    )
    .eq("project_id", activeProjectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching forms:", error);
    return <FormsPageClient initialForms={[]} />;
  }

  return <FormsPageClient initialForms={forms as Form[]} />;
};

export default FormsPage;
