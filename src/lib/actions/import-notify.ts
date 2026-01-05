"use server";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPORT NOTIFICATION SERVER ACTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Server actions to notify via email when users attempt web or spreadsheet
 * imports. This handles user authentication, file uploads to Supabase storage,
 * and sending notifications to the API.
 *
 * API Endpoint: https://creet.io/api/notify
 */

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const NOTIFY_API_URL = "https://www.creet.io/api/notify";

// Admin client for storage uploads (bypasses RLS)
function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export type ImportType = "web_import" | "spreadsheet_import";

export interface NotifyResponse {
    success: boolean;
    message: string;
}

interface UserInfo {
    userId: string;
    email: string;
    fullName?: string;
}

/**
 * Get current user info for notifications
 */
async function getCurrentUserInfo(): Promise<UserInfo | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Get full name from profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    return {
        userId: user.id,
        email: user.email || 'unknown',
        fullName: profile?.full_name,
    };
}

/**
 * Upload spreadsheet file to Supabase storage and get public URL
 */
async function uploadSpreadsheetToStorage(
    file: File,
    userId: string
): Promise<string> {
    const supabase = getAdminClient();

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine extension
    const extension = file.name.split('.').pop()?.toLowerCase() || 'csv';

    // Generate full path with timestamp to avoid collisions
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fullPath = `imports/${userId}/${timestamp}_${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fullPath, buffer, {
            contentType: file.type || 'application/octet-stream',
            cacheControl: '3600',
            upsert: true,
        });

    if (uploadError) {
        console.error('[uploadSpreadsheetToStorage] Upload failed:', uploadError);
        throw new Error('Failed to upload file: ' + uploadError.message);
    }

    // Get public URL
    const { data } = supabase.storage.from('assets').getPublicUrl(fullPath);

    return data.publicUrl;
}

/**
 * Server action to notify about web import
 */
export async function notifyWebImportAction(
    source: string,
    url: string
): Promise<NotifyResponse> {
    // Get current user info
    const userInfo = await getCurrentUserInfo();

    if (!userInfo) {
        return {
            success: false,
            message: "User not authenticated",
        };
    }

    const payload = {
        type: "web_import" as ImportType,
        source,
        data: {
            url,
            source,
        },
        timestamp: new Date().toISOString(),
        userInfo: {
            userId: userInfo.userId,
            email: userInfo.email,
            name: userInfo.fullName,
        },
    };

    return sendNotification(payload);
}

/**
 * Server action to notify about spreadsheet import
 * Uploads file to Supabase storage and sends the URL
 */
export async function notifySpreadsheetImportAction(
    formData: FormData
): Promise<NotifyResponse> {
    // Get current user info
    const userInfo = await getCurrentUserInfo();

    if (!userInfo) {
        return {
            success: false,
            message: "User not authenticated",
        };
    }

    const file = formData.get('file') as File;
    if (!file) {
        return {
            success: false,
            message: "No file provided",
        };
    }

    try {
        // Upload file to Supabase storage
        const fileUrl = await uploadSpreadsheetToStorage(file, userInfo.userId);

        const payload = {
            type: "spreadsheet_import" as ImportType,
            source: "spreadsheet",
            data: {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type || "unknown",
                fileUrl, // Include the actual file URL
            },
            timestamp: new Date().toISOString(),
            userInfo: {
                userId: userInfo.userId,
                email: userInfo.email,
                name: userInfo.fullName,
            },
        };

        return sendNotification(payload);
    } catch (error) {
        console.error('[notifySpreadsheetImportAction] Error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to process file",
        };
    }
}

/**
 * Send notification to the API
 */
async function sendNotification(payload: Record<string, unknown>): Promise<NotifyResponse> {
    try {
        console.log('[sendNotification] Sending notification:', JSON.stringify(payload, null, 2));

        const response = await fetch(NOTIFY_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error("Notification API error:", response.status, response.statusText);
            return {
                success: false,
                message: `API error: ${response.status} ${response.statusText}`,
            };
        }

        const data = await response.json();
        return {
            success: true,
            message: data.message || "Notification sent successfully",
        };
    } catch (error) {
        console.error("Failed to send import notification:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}
