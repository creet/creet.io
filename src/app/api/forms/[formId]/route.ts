import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/forms/[formId]
 * Get a specific form with authentication and authorization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
) {
  const { formId } = await params;

  try {
    const supabase = await createClient();

    // 1. Authenticate: Check if user is logged in
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Authorize: Verify user owns this form through its project
    const { data: form, error } = await supabase
      .from('forms')
      .select(`
        *,
        project:projects!inner(user_id)
      `)
      .eq('id', formId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Check ownership
    if (form.project.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Execute: Return the form settings with metadata
    return NextResponse.json({
      id: form.id,
      name: form.name,
      project_id: form.project_id,
      settings: form.settings,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

/**
 * PUT /api/forms/[formId]
 * Update a form with authentication and authorization
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
) {
  const { formId } = await params;
  try {
    const supabase = await createClient();

    // 1. Authenticate: Check if user is logged in
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Authorize: Verify user owns this form through its project
    const { data: existingForm, error: fetchError } = await supabase
      .from('forms')
      .select(`
        id,
        project:projects!inner(user_id)
      `)
      .eq('id', formId)
      .single();

    if (fetchError || !existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Check ownership
    if ('user_id' in existingForm.project && existingForm.project.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Execute: Update the form
    const body = await request.json();

    const { data, error } = await supabase
      .from('forms')
      .update({
        name: body.name,
        settings: body,
      })
      .eq('id', formId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

/**
 * DELETE /api/forms/[formId]
 * Delete a form with authentication and authorization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
) {
  const { formId } = await params;

  try {
    const supabase = await createClient();

    // 1. Authenticate: Check if user is logged in
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Authorize: Verify user owns this form through its project
    const { data: existingForm, error: fetchError } = await supabase
      .from('forms')
      .select(`
        id,
        project:projects!inner(user_id)
      `)
      .eq('id', formId)
      .single();

    if (fetchError || !existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Check ownership
    // Type checking workaround for the nested join
    const userId = (existingForm.project as any)?.user_id;

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Execute: Delete the form
    const { error: deleteError } = await supabase
      .from('forms')
      .delete()
      .eq('id', formId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
