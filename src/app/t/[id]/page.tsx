import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import PublicFormClient from './PublicFormClient';
import { FormConfig } from '@/types/form-config';
import { headers } from 'next/headers';

// Props for the page
interface PublicFormPageProps {
    params: Promise<{
        id: string;
    }>;
}

// Helper to get base URL
async function getBaseUrl(): Promise<string> {
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    return `${protocol}://${host}`;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PublicFormPageProps): Promise<Metadata> {
    const { id } = await params;

    try {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/api/public/forms/${id}`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            return {
                title: 'Form Not Found',
            };
        }

        const data = await response.json();
        const formName = data.name || 'Share Your Feedback';

        return {
            title: formName,
            description: 'We\'d love to hear about your experience!',
            openGraph: {
                title: formName,
                description: 'Share your testimonial with us',
                type: 'website',
            },
        };
    } catch {
        return {
            title: 'Share Your Feedback',
        };
    }
}

// Fetch form data (Server-side)
async function getFormConfig(id: string): Promise<{ formConfig: FormConfig; projectId: string } | null> {
    try {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/api/public/forms/${id}`, {
            cache: 'no-store', // Always fetch fresh data for forms
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        // TODO: Add published status check here
        // if (data.status !== 'published') {
        //     return null;
        // }

        // Merge settings into FormConfig structure
        // Note: data.settings contains: { blocks, theme, settings (nested with lowRatingThreshold), rewards }
        const formConfig: FormConfig = {
            id: data.id ?? id,
            name: data.name ?? 'Feedback Form',
            projectId: data.project_id,
            createdAt: new Date().toISOString(),
            // Extract blocks from settings
            blocks: data.settings?.blocks ?? [],
            // Form-level brandName takes priority, then settings.settings.brandName, then project-level, then empty
            brandName: data.settings?.settings?.brandName || data.settings?.brandName || data.brandName || '',
            // Form settings (lowRatingThreshold, etc.)
            settings: {
                lowRatingThreshold: data.settings?.settings?.lowRatingThreshold ?? 3,
                brandName: data.settings?.settings?.brandName || data.brandName || '',
            },
            // Rewards config
            rewards: data.settings?.rewards,
            // Theme with defaults
            theme: {
                backgroundColor: '#0A0A0A',
                logoUrl: '',
                primaryColor: '#A855F7',
                ratingColor: '#FBBF24', // Amber-400 for star ratings
                headingFont: 'Satoshi',
                bodyFont: 'Inter',
                ...(data.settings?.theme ?? {}),
            },
        };

        return {
            formConfig,
            projectId: data.project_id
        };
    } catch (error) {
        console.error('Error fetching form config:', error);
        return null;
    }
}

// Public Form Page Component
export default async function PublicFormPage({ params }: PublicFormPageProps) {
    const { id } = await params;
    const result = await getFormConfig(id);

    if (!result) {
        notFound();
    }

    const { formConfig, projectId } = result;

    // Build form context for submission
    const formContext = {
        formId: id,
        projectId: projectId,
    };

    return (
        <main className="w-full h-screen overflow-hidden bg-gray-950">
            <PublicFormClient
                formConfig={formConfig}
                formContext={formContext}
            />
        </main>
    );
}

