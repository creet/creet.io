"use server";

import { getCloudflareUploadUrl } from "./cloudflare-stream";
import {
    createTestimonialCore,
    getUserIdFromForm,
    uploadImageToStorageCore,
    TestimonialInput
} from "./testimonials-core";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PUBLIC TESTIMONIAL ACTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Server actions for public (unauthenticated) form submissions.
 * Uses shared core functions from testimonials-core.ts
 * 
 * Video uploads go through Cloudflare Stream.
 */

// Re-export for client-side use
export { getCloudflareUploadUrl };

/**
 * Upload an image for public form submissions (avatar, company logo)
 * Uses shared core function
 */
export async function uploadPublicImage(
    file: File,
    formId: string,
    namespace: 'avatars' | 'logos' = 'avatars'
): Promise<{ url: string; path: string }> {
    const storagePath = `forms/${formId}/${namespace}`;
    return uploadImageToStorageCore(file, storagePath);
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC TESTIMONIAL SUBMISSION
// ═══════════════════════════════════════════════════════════════════════════

export interface PublicTestimonialInput {
    formId: string;
    projectId: string;
    type: 'text' | 'video';
    rating?: number;
    testimonialText?: string;
    videoUrl?: string;
    thumbnails?: string[];
    customerName?: string;
    customerEmail?: string;
    customerTitle?: string;
    customerAvatarUrl?: string;
    companyName?: string;
    companyWebsite?: string;
    companyLogoUrl?: string;
    consentPublic?: boolean;
    consentNameAndPhoto?: boolean;
}

/**
 * Submit a testimonial from the public form
 * Uses shared createTestimonialCore function
 */
export async function submitPublicTestimonial(
    input: PublicTestimonialInput
): Promise<{ success: boolean; testimonialId?: string; error?: string }> {

    // Validate required fields
    if (!input.formId || !input.projectId) {
        return { success: false, error: 'Missing form or project ID' };
    }

    if (!input.type) {
        return { success: false, error: 'Testimonial type is required' };
    }

    if (input.type === 'text' && !input.testimonialText) {
        return { success: false, error: 'Testimonial text is required for text testimonials' };
    }

    if (input.type === 'video' && !input.videoUrl) {
        return { success: false, error: 'Video is required for video testimonials' };
    }

    // Get user ID from form (the form owner)
    const formOwner = await getUserIdFromForm(input.formId);
    if (!formOwner) {
        return { success: false, error: 'Form not found or could not determine owner' };
    }

    // Map to TestimonialInput
    const testimonialInput: TestimonialInput = {
        type: input.type,
        rating: input.rating,
        message: input.testimonialText,
        source: 'form',
        formId: input.formId,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerHeadline: input.customerTitle,
        customerAvatarUrl: input.customerAvatarUrl,
        companyName: input.companyName,
        companyWebsite: input.companyWebsite,
        companyLogoUrl: input.companyLogoUrl,
        videoUrl: input.videoUrl,
        thumbnails: input.thumbnails,
        consent: {
            public: input.consentPublic ?? true,
            nameAndPhoto: input.consentNameAndPhoto ?? true,
        },
    };

    // Call shared core function
    return createTestimonialCore(formOwner.userId, formOwner.projectId, testimonialInput);
}

