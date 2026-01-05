import {
    FormConfig,
    FormBlockType,
    WelcomeBlockConfig,
    RatingBlockConfig,
    QuestionBlockConfig,
    NegativeFeedbackBlockConfig,
    PrivateFeedbackBlockConfig,
    ConsentBlockConfig,
    AboutYouBlockConfig,
    AboutCompanyBlockConfig,
    ReadyToSendBlockConfig,
    ThankYouBlockConfig,
} from '@/types/form-config';
import { UUID, randomUUID } from 'crypto';

// Brand settings from project configuration
type BrandSettings = {
    logoUrl?: string;
    brandName?: string;
    websiteUrl?: string;
    primaryColor?: string;
    textColor?: string;
    ratingColor?: string;
    headingFont?: string;
    bodyFont?: string;
};

type DefaultConfigOptions = {
    projectId: UUID;
    formId?: UUID;
    name?: string;
    brandSettings?: BrandSettings | null;
};

export const DEFAULT_TESTIMONIAL_TIPS = [
    'Share specific results',
    'Mention your timeline',
    'Highlight a favorite feature',
];

// Default logo used when brand settings are not configured
const DEFAULT_LOGO_URL = '/logo.svg';

// Default theme values used when brand settings are not configured
const DEFAULT_THEME = {
    backgroundColor: '#0A0A0A',
    logoUrl: DEFAULT_LOGO_URL,
    primaryColor: '#BFFF00', // Brand lime (matches Brand page defaults)
    ratingColor: '#fbbf24',  // Amber-400 for star ratings
    headingFont: 'Satoshi',
    bodyFont: 'Inter',
};

export const createDefaultFormConfig = ({
    projectId,
    formId = randomUUID(),
    name = 'My First Form',
    brandSettings,
}: DefaultConfigOptions): FormConfig => {
    // Build theme by merging brand settings with defaults
    // Brand settings take priority if they exist and have values
    const theme = {
        backgroundColor: DEFAULT_THEME.backgroundColor,
        logoUrl: brandSettings?.logoUrl || DEFAULT_THEME.logoUrl,
        primaryColor: brandSettings?.primaryColor || DEFAULT_THEME.primaryColor,
        ratingColor: brandSettings?.ratingColor || DEFAULT_THEME.ratingColor,
        headingFont: brandSettings?.headingFont || DEFAULT_THEME.headingFont,
        bodyFont: brandSettings?.bodyFont || DEFAULT_THEME.bodyFont,
    };

    return {
        id: formId,
        name,
        projectId,
        createdAt: new Date().toISOString(),
        theme,
        settings: {
            // If rating is strictly below this value (1, 2), show Improvement Tips
            // If rating is at or above this value (3, 4, 5), go directly to Question
            lowRatingThreshold: 3,
            // Initialize brand name from brand settings
            brandName: brandSettings?.brandName || '',
        },
        blocks: [
            {
                id: 'welcome_1',
                type: FormBlockType.Welcome,
                enabled: true,
                props: {
                    title: 'Leave us a Testimonial',
                    description: 'Testimonials help us getting discovered by others. We appreciate every single one and read them all!',
                    buttonText: 'Continue',
                    timingMessage: 'Takes less than 3 minutes',
                    consentMessage: "You control what's shared",
                    titleColor: '#FFFFFF',
                    descriptionColor: '#9CA3AF',
                    buttonBgColor: '#89fe65',
                    buttonTextColor: '#000000',
                },
            },
            {
                id: 'rating_1',
                type: FormBlockType.Rating,
                enabled: true,
                props: {
                    title: `How was your experience with ${brandSettings?.brandName || 'us'}?`,
                    description: 'Your feedback helps us improve',
                    titleColor: '#FFFFFF',
                    descriptionColor: '#9CA3AF',
                    buttonText: 'Continue',
                },
            },
            {
                id: 'question_1',
                type: FormBlockType.Question,
                enabled: true,
                props: {
                    question: `What do you like the most about ${brandSettings?.brandName || 'us'}?`,
                    description: 'Be specific and honest. Your feedback will help us improve our product.',
                    questionColor: '#FFFFFF',
                    descriptionColor: '#9CA3AF',
                    enableTextTestimonial: true,
                    enableVideoTestimonial: true,
                    videoOptionTitle: 'Record a video',
                    videoOptionDescription: '2-minute video testimonial',
                    textOptionTitle: 'Write your story',
                    textOptionDescription: 'Text testimonial',
                    tips: [
                        'Share specific results',
                        'Mention your timeline',
                        'Highlight a favorite feature',
                    ],
                },
            },
            {
                id: 'negative_feedback_1',
                type: FormBlockType.NegativeFeedback,
                enabled: true,
                props: {
                    title: 'What can we do better?',
                    description: 'We are sorry to hear that you had a bad experience. Please let us know what we can do to improve.',
                    buttonText: 'Submit Feedback',
                    feedbackQuestion: 'Your feedback',
                    feedbackPlaceholder: 'Please share as much detail as possible...',
                    feedbackHelperText: 'We value your feedback and review every submission carefully.',
                    titleColor: '#FFFFFF',
                    descriptionColor: '#9CA3AF',
                    tips: [
                        'Be specific about the issue you faced',
                        'Describe what you expected to happen',
                        'Let us know how we can improve',
                    ],
                },
            },
            {
                id: 'private_feedback_1',
                type: FormBlockType.PrivateFeedback,
                enabled: false,
                props: {
                    title: 'Share private feedback',
                    description: 'Your feedback helps us improve. This stays private and will not be published.',
                    placeholder: 'Type your message...',
                    buttonText: 'Send Private Feedback',
                    titleColor: '#FFFFFF',
                },
            },
            {
                id: 'consent_1',
                type: FormBlockType.Consent,
                enabled: true,
                props: {
                    title: 'How can we share your testimonial?',
                    description: 'Your feedback means the world to us. Please select how you\'d like us to use your testimonial.',
                    publicOptionTitle: 'Share it publicly',
                    publicOptionDescription: 'Display on our website, social media, and marketing materials to inspire others.',
                    privateOptionTitle: 'Keep it private',
                    privateOptionDescription: 'Only for internal use to help us improve. We won\'t share it publicly.',
                    checkboxLabel: 'I consent to my testimonial being used publicly.',
                    buttonText: 'Continue',
                    trustNote: 'Your privacy is important to us. We\'ll always respect your choice.',
                    titleColor: '#FFFFFF',
                    descriptionColor: '#9CA3AF',
                },
            },
            {
                id: 'about_you_1',
                type: FormBlockType.AboutYou,
                enabled: true,
                props: {
                    title: 'Tell us a bit about yourself',
                    description: 'Share a little more about yourself.',
                    buttonText: 'Continue',
                    titleColor: '#FFFFFF',
                    fields: {
                        name: { enabled: true, required: true, label: 'Full Name', placeholder: 'John Doe' },
                        email: { enabled: true, required: false, label: 'Email', placeholder: 'john@example.com' },
                        company: { enabled: false, required: false, label: 'Company', placeholder: 'Example.com' },
                        avatar: { enabled: true, required: false, label: 'Upload your photo' },
                    },
                },
            },
            {
                id: 'about_company_1',
                type: FormBlockType.AboutCompany,
                enabled: true,
                props: {
                    title: 'Tell us about your company',
                    description: 'Help us understand your business better.',
                    buttonText: 'Continue',
                    titleColor: '#FFFFFF',
                    fields: {
                        companyName: { enabled: true, required: true, label: 'Company Name', placeholder: 'Acme Inc.' },
                        jobTitle: { enabled: true, required: true, label: 'Your Title', placeholder: 'CEO, Founder, Manager...' },
                        companyWebsite: { enabled: true, required: false, label: 'Company Website', placeholder: 'https://example.com' },
                        companyLogo: { enabled: true, required: false, label: 'Company Logo' },
                    },
                },
            },
            {
                id: 'ready_to_send_1',
                type: FormBlockType.ReadyToSend,
                enabled: true,
                props: {
                    title: 'Ready to send?',
                    description: 'Thank you for your valuable feedback!',
                    buttonText: 'Submit Testimonial',
                    titleColor: '#FFFFFF',
                    descriptionColor: '#9CA3AF',
                },
            },
            {
                id: 'thank_you_1',
                type: FormBlockType.ThankYou,
                enabled: true,
                props: {
                    title: 'Thank you for your testimonial!',
                    description: 'We will review it and let you know when it is published.',
                    showSocials: true,
                    showAnimations: true,
                    titleColor: '#FFFFFF',
                    descriptionColor: '#9CA3AF',
                },
            },
        ] as FormConfig['blocks'],
    };
};
