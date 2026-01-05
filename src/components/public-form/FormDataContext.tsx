"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TestimonialData {
    type: 'text' | 'video';
    text?: string;
    videoUrl?: string;  // Cloudflare Stream video ID or full URL
}

export interface ConsentData {
    consentPublic: boolean;
    consentNameAndPhoto: boolean;
}

export interface AboutYouData {
    name: string;
    email: string;
    avatarUrl: string | null;
}

export interface AboutCompanyData {
    companyName: string;
    jobTitle: string;
    companyWebsite?: string;
    companyLogoUrl?: string;
}

export interface FormData {
    rating: number | null;
    shouldShowImprovementTips: boolean;
    testimonial: TestimonialData | null;
    consent: ConsentData | null;
    aboutYou: AboutYouData | null;
    aboutCompany: AboutCompanyData | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

interface FormDataContextValue {
    data: FormData;
    setRating: (rating: number, shouldShowImprovementTips: boolean) => void;
    setTestimonial: (testimonial: TestimonialData) => void;
    setConsent: (consent: ConsentData) => void;
    setAboutYou: (aboutYou: AboutYouData) => void;
    setAboutCompany: (aboutCompany: AboutCompanyData) => void;
    reset: () => void;
}

const initialFormData: FormData = {
    rating: null,
    shouldShowImprovementTips: false,
    testimonial: null,
    consent: null,
    aboutYou: null,
    aboutCompany: null,
};

const FormDataContext = createContext<FormDataContextValue | null>(null);

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

export const FormDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<FormData>(initialFormData);

    const setRating = useCallback((rating: number, shouldShowImprovementTips: boolean) => {
        setData(prev => ({ ...prev, rating, shouldShowImprovementTips }));
    }, []);

    const setTestimonial = useCallback((testimonial: TestimonialData) => {
        setData(prev => ({ ...prev, testimonial }));
    }, []);

    const setConsent = useCallback((consent: ConsentData) => {
        setData(prev => ({ ...prev, consent }));
    }, []);

    const setAboutYou = useCallback((aboutYou: AboutYouData) => {
        setData(prev => ({ ...prev, aboutYou }));
    }, []);

    const setAboutCompany = useCallback((aboutCompany: AboutCompanyData) => {
        setData(prev => ({ ...prev, aboutCompany }));
    }, []);

    const reset = useCallback(() => {
        setData(initialFormData);
    }, []);

    const value: FormDataContextValue = {
        data,
        setRating,
        setTestimonial,
        setConsent,
        setAboutYou,
        setAboutCompany,
        reset,
    };

    return (
        <FormDataContext.Provider value={value}>
            {children}
        </FormDataContext.Provider>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export const useFormData = (): FormDataContextValue => {
    const context = useContext(FormDataContext);
    if (!context) {
        throw new Error('useFormData must be used within a FormDataProvider');
    }
    return context;
};

// Optional: A safe version that returns null instead of throwing (for preview mode flexibility)
export const useFormDataSafe = (): FormDataContextValue | null => {
    return useContext(FormDataContext);
};
