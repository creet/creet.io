/**
 * Database types for the application
 * These types represent the structure of data as stored and used within the app
 */

export interface Testimonial {
    id: string;
    user_id: string;
    type?: 'text' | 'video';
    author_name: string;
    author_title?: string;
    author_avatar_url?: string;
    rating?: number;
    content?: string;
    text?: string;
    title?: string;
    source?: string;
    video_url?: string;
    video_thumbnail?: string;
    attachments?: Array<{ type: 'image' | 'video'; url: string }>;
    created_at: string;
    updated_at?: string;
}

export interface CreateTestimonialInput {
    author_name: string;
    author_title?: string;
    author_avatar_url?: string;
    rating?: number;
    content: string;
    source?: string;
    type?: 'text' | 'video';
    video_url?: string;
}

export interface UpdateTestimonialInput {
    id: string;
    author_name?: string;
    author_title?: string;
    author_avatar_url?: string;
    rating?: number;
    content?: string;
    source?: string;
}

export interface UserData {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    active_project_id?: string;
    created_at: string;
    updated_at?: string;
}
