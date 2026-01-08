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

  // Fetch forms and response counts in parallel for efficiency
  const [formsResult, countsResult] = await Promise.all([
    // Query 1: Get all forms for the project
    supabase
      .from("forms")
      .select(`
        *,
        project:projects!inner(id, name)
      `)
      .eq("project_id", activeProjectId)
      .order("created_at", { ascending: false }),

    // Query 2: Get response counts grouped by form_id
    // This uses json column access: data->>'form_id' contains the form UUID
    supabase
      .from("testimonials")
      .select("id, data->form_id")
      .eq("project_id", activeProjectId)
      .not("data->form_id", "is", null)
  ]);

  if (formsResult.error) {
    console.error("Error fetching forms:", formsResult.error);
    return <FormsPageClient initialForms={[]} />;
  }

  // Build a count map from testimonials
  const countMap: Record<string, number> = {};
  if (countsResult.data) {
    for (const t of countsResult.data) {
      const formId = (t as any).form_id;
      if (formId) {
        countMap[formId] = (countMap[formId] || 0) + 1;
      }
    }
  }

  // Merge counts into forms
  const formsWithCounts = (formsResult.data || []).map((form: any) => ({
    ...form,
    response_count: countMap[form.id] || 0,
  }));

  return <FormsPageClient initialForms={formsWithCounts as Form[]} />;
};

export default FormsPage;
