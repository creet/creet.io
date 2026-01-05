import { getCloudflareUploadUrl } from "./actions/cloudflare-stream";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VIDEO UPLOAD - Cloudflare Stream Only
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * All video uploads go through Cloudflare Stream.
 * Videos are stored as Cloudflare UIDs, not URLs.
 */

export type VideoUploadResult = {
    type: 'cloudflare';
    uid: string;
    preview: string;
};

export type VideoUploadContext =
    | { type: 'authenticated' }      // Authenticated user upload
    | { type: 'project'; projectId: string }     // Project-based upload
    | { type: 'public'; formId: string };        // Public form submission

/**
 * Upload a video file to Cloudflare Stream.
 * 
 * @param file - The video file to upload
 * @param _context - Upload context (kept for API compatibility, not used for Cloudflare)
 */
export async function uploadVideo(
    file: File,
    _context: VideoUploadContext = { type: 'authenticated' }
): Promise<VideoUploadResult> {
    const { id, uploadUrl } = await getCloudflareUploadUrl();

    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
    });

    if (!uploadResponse.ok) {
        throw new Error("Cloudflare upload failed");
    }

    return {
        type: 'cloudflare',
        uid: id,
        preview: `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN}.cloudflarestream.com/${id}/iframe`
    };
}

/**
 * Convenience function for public video uploads.
 */
export async function uploadPublicVideo(file: File, formId: string): Promise<VideoUploadResult> {
    return uploadVideo(file, { type: 'public', formId });
}


