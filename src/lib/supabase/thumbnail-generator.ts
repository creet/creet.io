/**
 * Generates a thumbnail Blob from a video File using client-side Canvas API.
 * @param videoFile The video file object.
 * @param seekTime Optional timestamp in seconds to capture (or percentage 0-1). Default: 1.0s
 * @returns Promise resolving to the thumbnail Blob (image/webp)
 */
export const generateVideoThumbnail = async (videoFile: File, seekTime: number = 1.0): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const url = URL.createObjectURL(videoFile);
        video.src = url;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";
        video.preload = "metadata";

        const onMetadata = () => {
            let time = seekTime;
            // Heuristic: If seekTime is small float < 1.0, treat as percentage
            // unless duration is tiny, but < 1s video is rare testimonial.
            if (seekTime > 0 && seekTime < 1.0 && video.duration && isFinite(video.duration)) {
                time = video.duration * seekTime;
            }
            // Ensure we don't seek past end
            if (video.duration) {
                time = Math.min(time, video.duration - 0.1);
            }
            video.currentTime = time;
        };

        const onSeeked = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    throw new Error("Could not get canvas context");
                }

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Thumbnail blob creation failed"));
                    }
                    cleanup();
                }, 'image/webp', 0.85); // High quality WebP

            } catch (error) {
                cleanup();
                reject(error);
            }
        };

        const onError = (e: any) => {
            cleanup();
            reject(new Error("Video loading error: " + (e?.message || "Unknown error")));
        };

        const cleanup = () => {
            video.removeEventListener('loadedmetadata', onMetadata);
            video.removeEventListener('seeked', onSeeked);
            video.removeEventListener('error', onError);
            URL.revokeObjectURL(url);
            video.remove();
        };

        video.addEventListener('loadedmetadata', onMetadata);
        video.addEventListener('seeked', onSeeked);
        video.addEventListener('error', onError);

        video.load();
    });
};
