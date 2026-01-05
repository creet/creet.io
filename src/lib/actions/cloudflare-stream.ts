"use server";

export async function getCloudflareUploadUrl() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
        throw new Error("Missing Cloudflare credentials");
    }

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                maxDurationSeconds: 3600, // 1 hour max
                creator: "creet-app",
            }),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Cloudflare API Error: ${error.errors?.[0]?.message || "Unknown"}`);
    }

    const data = await response.json();
    return {
        id: data.result.uid,
        uploadUrl: data.result.uploadURL,
    };
}

/**
 * Delete a video from Cloudflare Stream
 * @param videoUid - The Cloudflare Stream video UID
 * @returns Success status
 */
export async function deleteCloudflareVideo(videoUid: string): Promise<{ success: boolean; error?: string }> {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
        console.error("Missing Cloudflare credentials for deletion");
        return { success: false, error: "Missing Cloudflare credentials" };
    }

    if (!videoUid || typeof videoUid !== 'string') {
        console.error("Invalid video UID for deletion");
        return { success: false, error: "Invalid video UID" };
    }

    try {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoUid}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error("Cloudflare delete error:", error);
            return {
                success: false,
                error: error.errors?.[0]?.message || "Failed to delete video from Cloudflare"
            };
        }

        console.log(`Successfully deleted video ${videoUid} from Cloudflare Stream`);
        return { success: true };
    } catch (err) {
        console.error("Failed to delete Cloudflare video:", err);
        return { success: false, error: String(err) };
    }
}
