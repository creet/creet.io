"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TESTIMONIALS CORE - Shared logic for all testimonial operations
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file contains the core business logic for testimonial operations.
 * Both authenticated (dashboard) and public (form) paths use these functions.
 * 
 * Security: Uses service role to bypass RLS, but callers MUST verify
 * authorization before calling these functions.
 */

// ═══════════════════════════════════════════════════════════════════════════
// SUPABASE ADMIN CLIENT (Internal - not exported)
// ═══════════════════════════════════════════════════════════════════════════

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TestimonialInput {
    type: 'text' | 'video';
    rating?: number;
    title?: string;
    message?: string;
    source?: string;  // 'manual', 'form', 'import', etc.
    formId?: string;  // If submitted via form
    // Customer info
    customerName?: string;
    customerEmail?: string;
    customerHeadline?: string;  // Job title/profession
    customerAvatarUrl?: string;
    // Company info
    companyName?: string;
    companyTitle?: string;  // Job title at company
    companyWebsite?: string;
    companyLogoUrl?: string;
    // Video specific
    videoUrl?: string;
    thumbnails?: string[];
    selectedThumbnailIndex?: number;
    // Metadata
    testimonialDate?: string;
    originalPostUrl?: string;
    tags?: string[];
    // Consent (for public forms)
    consent?: {
        public?: boolean;
        nameAndPhoto?: boolean;
    };
}

export interface TestimonialResult {
    success: boolean;
    testimonialId?: string;
    error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a testimonial - Core function used by both authenticated and public paths
 * 
 * SECURITY: Caller MUST verify authorization before calling this function.
 * This function uses service role and bypasses RLS.
 * 
 * @param userId - The user ID who owns this testimonial (dashboard user, NOT the customer)
 * @param projectId - The project this testimonial belongs to
 * @param input - Testimonial data
 */
export async function createTestimonialCore(
    userId: string,
    projectId: string,
    input: TestimonialInput
): Promise<TestimonialResult> {
    const supabase = getAdminClient();

    // Step 1: Upsert customer FIRST to get customer_id
    const customerId = await upsertCustomer(supabase, projectId, {
        email: input.customerEmail,
        fullName: input.customerName,
        headline: input.customerHeadline,
        avatarUrl: input.customerAvatarUrl,
        companyName: input.companyName,
        companyTitle: input.companyTitle,
        companyWebsite: input.companyWebsite,
        companyLogoUrl: input.companyLogoUrl,
    });

    // Prepare the data structure (matches existing database schema)
    const testimonialData = {
        type: input.type,
        rating: input.rating,
        title: input.title,
        message: input.message,
        source: input.source || 'manual',
        form_id: input.formId,
        customer_name: input.customerName || 'Anonymous',
        customer_email: input.customerEmail,
        profession: input.customerHeadline,
        testimonial_date: input.testimonialDate,
        original_post_url: input.originalPostUrl,
        tags: input.tags || [],
        company: {
            name: input.companyName,
            job_title: input.companyTitle,
            website: input.companyWebsite,
            logo_url: input.companyLogoUrl,
        },
        media: {
            avatar_url: input.customerAvatarUrl,
            video_url: input.type === 'video' ? input.videoUrl : undefined,
        },
        thumbnails: input.thumbnails,
        selected_thumbnail_index: input.selectedThumbnailIndex ?? 0,
        consent: input.consent,
    };

    // Step 2: Insert testimonial WITH customer_id reference
    const { data: newTestimonial, error: insertError } = await supabase
        .from('testimonials')
        .insert({
            type: input.type,
            user_id: userId,
            project_id: projectId,
            customer_id: customerId, // Link to customer record (can be null)
            data: testimonialData,
            status: 'hidden', // New submissions start as hidden for review
        })
        .select('id')
        .single();

    if (insertError) {
        console.error('[createTestimonialCore] Insert failed:', insertError);
        return { success: false, error: 'Failed to save testimonial: ' + insertError.message };
    }

    console.log(`[createTestimonialCore] Created testimonial ${newTestimonial.id} for user ${userId}${customerId ? ` with customer ${customerId}` : ''}`);

    return { success: true, testimonialId: newTestimonial.id };
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMER UPSERT LOGIC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Customer data for upsert operations
 */
interface CustomerData {
    email?: string;
    fullName?: string;
    headline?: string;
    avatarUrl?: string;
    companyName?: string;
    companyTitle?: string;
    companyWebsite?: string;
    companyLogoUrl?: string;
}

/**
 * Upsert customer - Creates or finds existing customer record
 * 
 * Logic:
 * 1. If no "about you" or "company" details provided → return null
 * 2. If email is provided → check for existing customer with that email
 *    - If found → return existing customer_id
 *    - If not found → create new customer and return customer_id
 * 3. If no email → create a new customer anyway (anonymous) and return customer_id
 * 
 * @param supabase - Supabase admin client
 * @param projectId - Project ID
 * @param customer - Customer data
 * @returns customer_id or null if no details provided
 */
async function upsertCustomer(
    supabase: ReturnType<typeof getAdminClient>,
    projectId: string,
    customer: CustomerData
): Promise<string | null> {
    // Check if there are ANY customer details provided
    const hasAboutYouDetails = !!(customer.fullName || customer.email || customer.headline || customer.avatarUrl);
    const hasCompanyDetails = !!(customer.companyName || customer.companyTitle || customer.companyWebsite || customer.companyLogoUrl);

    // Rule 1: If no details at all, return null (no customer to create)
    if (!hasAboutYouDetails && !hasCompanyDetails) {
        console.log('[upsertCustomer] No customer details provided, skipping customer creation');
        return null;
    }

    try {
        // Rule 2: If email is provided, check for existing customer
        if (customer.email) {
            const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('project_id', projectId)
                .eq('email', customer.email)
                .single();

            if (existingCustomer) {
                console.log(`[upsertCustomer] Found existing customer ${existingCustomer.id} for email ${customer.email}`);
                return existingCustomer.id;
            }
        }

        // Rule 3: Create new customer (either email not provided, or no existing customer found)
        const { data: newCustomer, error: insertError } = await supabase
            .from('customers')
            .insert({
                project_id: projectId,
                email: customer.email || null,
                full_name: customer.fullName || 'Anonymous',
                headline: customer.headline,
                avatar_url: customer.avatarUrl,
                company_details: {
                    name: customer.companyName,
                    job_title: customer.companyTitle,
                    website: customer.companyWebsite,
                    logo_url: customer.companyLogoUrl,
                },
                social_profiles: {},
            })
            .select('id')
            .single();

        if (insertError) {
            console.error('[upsertCustomer] Failed to create customer:', insertError);
            return null;
        }

        console.log(`[upsertCustomer] Created new customer ${newCustomer.id} for project ${projectId}`);
        return newCustomer.id;

    } catch (error) {
        // Don't fail the testimonial creation if customer upsert fails
        console.error('[upsertCustomer] Error during customer upsert:', error);
        return null;
    }
}

/**
 * Get or create a default project for a user
 * Used by authenticated path when user doesn't have a project yet
 * 
 * Priority:
 * 1. User's active_project_id from their profile
 * 2. Any existing project for the user
 * 3. Create a new default project
 */
export async function getOrCreateDefaultProject(userId: string): Promise<string> {
    const supabase = getAdminClient();

    // First, try to get the user's ACTIVE project from their profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('active_project_id')
        .eq('id', userId)
        .single();

    if (profile?.active_project_id) {
        // Verify the project exists and belongs to this user
        const { data: activeProject } = await supabase
            .from('projects')
            .select('id')
            .eq('id', profile.active_project_id)
            .eq('user_id', userId)
            .single();

        if (activeProject) {
            return activeProject.id;
        }
    }

    // Fallback: Try to get ANY existing project for the user
    const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (project) {
        return project.id;
    }

    // Create default project
    const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({
            user_id: userId,
            name: 'My First Project'
        })
        .select('id')
        .single();

    if (createError) {
        console.error('[getOrCreateDefaultProject] Failed to create project:', createError);
        throw new Error('Could not find or create a project.');
    }

    console.log(`[getOrCreateDefaultProject] Created default project ${newProject.id} for user ${userId}`);
    return newProject.id;
}

/**
 * Get user ID from form (for public submissions)
 * Looks up the form's project owner
 */
export async function getUserIdFromForm(formId: string): Promise<{ userId: string; projectId: string } | null> {
    const supabase = getAdminClient();

    const { data: form, error } = await supabase
        .from('forms')
        .select('id, project_id, projects(user_id)')
        .eq('id', formId)
        .single();

    if (error || !form) {
        console.error('[getUserIdFromForm] Form lookup failed:', error);
        return null;
    }

    const userId = (form.projects as any)?.user_id;
    if (!userId) {
        console.error('[getUserIdFromForm] Could not determine form owner');
        return null;
    }

    return { userId, projectId: form.project_id };
}

// ═══════════════════════════════════════════════════════════════════════════
// STORAGE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Upload an image to Supabase Storage using service role
 * Works for avatars, company logos, etc.
 * 
 * @param file - Image file to upload
 * @param storagePath - Path prefix (e.g., "users/{userId}/avatars")
 */
export async function uploadImageToStorageCore(
    file: File,
    storagePath: string
): Promise<{ url: string; path: string }> {
    const supabase = getAdminClient();

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine extension
    const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
    const contentType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;

    // Generate full path
    const fullPath = `${storagePath}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fullPath, buffer, {
            contentType,
            cacheControl: '3600',
            upsert: true,
        });

    if (uploadError) {
        console.error('[uploadImageToStorageCore] Upload failed:', uploadError);
        throw new Error('Failed to upload image: ' + uploadError.message);
    }

    // Get public URL
    const { data } = supabase.storage.from('assets').getPublicUrl(fullPath);

    return {
        url: data.publicUrl,
        path: fullPath,
    };
}
