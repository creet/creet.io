export const VIDEO_LIMITS = {
    MAX_DURATION_SECONDS: 300, // 5 minutes
    MAX_DURATION_DISPLAY: "5 minutes",
    MAX_FILE_SIZE_BYTES: 200 * 1024 * 1024, // 200MB
    MAX_FILE_SIZE_DISPLAY: "200MB",
    // video/quicktime is for .mov (iPhone default), x-msvideo for .avi
    ALLOWED_FORMATS: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'],
    ALLOWED_EXTENSIONS: ['.mp4', '.mov', '.webm', '.avi']
};

export const IMAGE_LIMITS = {
    MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
    MAX_FILE_SIZE_DISPLAY: "5MB",
    // image/jpeg covers .jpg and .jpeg. Added image/heic for explicitly allowing iPhone raw format if needed, 
    // though browsers often convert strict file inputs.
    ALLOWED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif']
};

// Helper to get video duration
export const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            resolve(video.duration);
        };
        video.onerror = () => {
            URL.revokeObjectURL(video.src);
            reject("Could not load video metadata");
        };
        video.src = URL.createObjectURL(file);
    });
};
