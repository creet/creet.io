import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDefaultFormConfig } from '@/lib/default-form-config';

// GET all forms for the current user
export async function GET() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all forms for the user's projects
  const { data: forms, error } = await supabase
    .from('forms')
    .select(`
      *,
      project:projects!inner(id, name, user_id)
    `)
    .eq('project.user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(forms);
}

// POST - Create a new form
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, projectId } = body;

  if (!name) {
    return NextResponse.json({ error: 'Form name is required' }, { status: 400 });
  }

  // Get or create a default project for the user
  let finalProjectId = projectId;
  let brandSettings = null;

  if (!finalProjectId) {
    // First, try to get the user's ACTIVE project from their profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('active_project_id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    // If user has an active project set, use it
    if (profile?.active_project_id) {
      const { data: activeProject, error: activeProjectError } = await supabase
        .from('projects')
        .select('id, brand_settings')
        .eq('id', profile.active_project_id)
        .eq('user_id', user.id) // Ensure it belongs to this user
        .single();

      if (!activeProjectError && activeProject) {
        finalProjectId = activeProject.id;
        brandSettings = activeProject.brand_settings;
      }
    }

    // Fallback: If no active project found, get the most recently created project
    if (!finalProjectId) {
      const { data: existingProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id, brand_settings')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (projectsError) {
        return NextResponse.json({ error: projectsError.message }, { status: 500 });
      }

      if (existingProjects && existingProjects.length > 0) {
        finalProjectId = existingProjects[0].id;
        brandSettings = existingProjects[0].brand_settings;
      }
    }

    // If still no project found, create one
    if (!finalProjectId) {
      // Create a default project with default brand settings
      const defaultBrandSettings = {
        logoUrl: "",
        brandName: "My First Project",
        websiteUrl: "",
        primaryColor: "#BFFF00", // Brand lime
        textColor: "#E4E4E7",    // Zinc-200
        ratingColor: "#fbbf24",  // Amber-400
        headingFont: "Satoshi",
        bodyFont: "Inter",
      };

      const { data: newProject, error: createProjectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: 'My First Project',
          brand_settings: defaultBrandSettings,
        })
        .select('id, brand_settings')
        .single();

      if (createProjectError || !newProject) {
        console.error('Failed to create project:', createProjectError);
        return NextResponse.json(
          { error: 'Failed to create project' },
          { status: 500 }
        );
      }

      finalProjectId = newProject.id;
      brandSettings = newProject.brand_settings;
    }
  } else {
    // If projectId was provided, fetch its brand settings
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('brand_settings')
      .eq('id', finalProjectId)
      .single();

    if (!projectError && project) {
      brandSettings = project.brand_settings;
    }
  }

  // Create default form configuration with brand settings from the project
  const defaultConfig = createDefaultFormConfig({
    projectId: finalProjectId,
    brandSettings: brandSettings,
  });

  // Create the form with default settings
  const { data: form, error: createError } = await supabase
    .from('forms')
    .insert({
      project_id: finalProjectId,
      name: name,
      settings: {
        ...defaultConfig,
        name: name,
      },
    })
    .select()
    .single();

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  return NextResponse.json(form);
}

