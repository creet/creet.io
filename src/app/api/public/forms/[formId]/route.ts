import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/public/forms/[formId]
 * Get a specific form for PUBLIC access (no authentication required)
 * This is used by the public testimonial form page (/t/[id])
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ formId: string }> },
) {
    const { formId } = await params;

    try {
        const supabase = await createClient();

        // Fetch the form with project info (no auth required for public forms)
        const { data: form, error } = await supabase
            .from('forms')
            .select(`
                id,
                name,
                project_id,
                settings,
                projects (
                    name,
                    brand_settings
                )
            `)
            .eq('id', formId)
            .single();

        if (error || !form) {
            console.error('Public form fetch failed - formId:', formId);
            console.error('Supabase error:', error?.message, error?.details, error?.hint);
            return NextResponse.json({ error: 'Form not found', details: error?.message }, { status: 404 });
        }

        // TODO: Uncomment this when you have a 'status' field in your forms table
        // Check if form is published
        // if (form.status !== 'published') {
        //   return NextResponse.json({ error: 'Form not available' }, { status: 404 });
        // }

        // Placeholder function for future published status check
        const isFormPubliclyAccessible = (form: any): boolean => {
            // For now, all forms are accessible
            // Later, add checks like:
            // - form.status === 'published'
            // - form.is_active === true
            // - form.expires_at > new Date()
            return true;
        };

        if (!isFormPubliclyAccessible(form)) {
            return NextResponse.json({ error: 'Form not available' }, { status: 404 });
        }

        // Extract brand name from project
        const project = form.projects as any;
        const brandName = project?.brand_settings?.brandName || project?.name || '';

        // Return only the data needed for the public form
        // Don't expose sensitive information
        return NextResponse.json({
            id: form.id,
            name: form.name,
            project_id: form.project_id,
            settings: form.settings,
            brandName: brandName, // Include brand name for social sharing
        });
    } catch (e) {
        console.error('Error fetching public form:', e);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
