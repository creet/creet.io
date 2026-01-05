"use client";

import React, { useCallback } from 'react';
import FormRenderer, { FormContext, SubmissionData } from '@/components/public-form/FormRenderer';
import { FormConfig } from '@/types/form-config';
import { submitPublicTestimonial } from '@/lib/actions/public-testimonials';

interface PublicFormClientProps {
    formConfig: FormConfig;
    formContext: FormContext;
}

export default function PublicFormClient({ formConfig, formContext }: PublicFormClientProps) {
    // Handler for testimonial submission
    const handleSubmitTestimonial = useCallback(async (data: SubmissionData): Promise<{ success: boolean; error?: string }> => {
        try {
            console.log('[PublicFormClient] Submitting testimonial:', data);

            const result = await submitPublicTestimonial({
                formId: formContext.formId,
                projectId: formContext.projectId,
                type: data.type,
                rating: data.rating,
                testimonialText: data.testimonialText,
                videoUrl: data.videoUrl,
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerTitle: data.customerTitle,
                customerAvatarUrl: data.customerAvatarUrl,
                companyName: data.companyName,
                companyWebsite: data.companyWebsite,
                companyLogoUrl: data.companyLogoUrl,
                consentPublic: data.consentPublic,
                consentNameAndPhoto: data.consentNameAndPhoto,
            });

            if (result.success) {
                console.log('[PublicFormClient] Testimonial submitted successfully:', result.testimonialId);
            } else {
                console.error('[PublicFormClient] Submission failed:', result.error);
            }

            return result;
        } catch (error: any) {
            console.error('[PublicFormClient] Submission error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    }, [formContext]);

    return (
        <FormRenderer
            formConfig={formConfig}
            formContext={formContext}
            onSubmitTestimonial={handleSubmitTestimonial}
        />
    );
}
