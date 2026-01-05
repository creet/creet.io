# Thumbnail Generation Code Breakdown

This document provides the complete source code and detailed explanations for the thumbnail generation system.

## Part 1: Core Generation Module
**File:** `src/app/(main)/dashboard/Edit-Testimonial/[id]/edit/createthumbnailpage.ts`

This module is responsible for the low-level image processing tasks: extracting frames from video and manipulating images.

### Full Code
```typescript
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Configurable path for the play icon
const DEFAULT_PLAY_ICON_PATH = path.join(process.cwd(), 'public', 'play-icon.png');

interface GenerateThumbnailOptions {
    input: string | Buffer;
    /** Standard output width, defaults to 1280 (720p 16:9) */
    width?: number;
    /** Standard output height, defaults to 720 */
    height?: number;
    /** Custom path to play icon, otherwise defaults to public/play-icon.png */
    playIconPath?: string;
    /** Percentage of duration to seek to (0.0 to 1.0), default 0.2 */
    seekPercentage?: number;
}

/**
 * Robustly generates a thumbnail from a video file/buffer.
 */
export async function generateThumbnail(options: GenerateThumbnailOptions): Promise<Buffer> {
    const {
        input,
        width = 1280,
        height = 720,
        playIconPath = DEFAULT_PLAY_ICON_PATH,
        seekPercentage = 0.2
    } = options;

    let tempInputPath: string | null = null;
    const tempScreenshotPath = path.join(os.tmpdir(), `thumb_${Date.now()}_${Math.random().toString(36).substring(7)}.png`);

    try {
        // 1. Handle Input: Validate and ensure file path
        let inputPath = '';
        if (Buffer.isBuffer(input)) {
            tempInputPath = path.join(os.tmpdir(), `video_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`);
            await fs.promises.writeFile(tempInputPath, input);
            inputPath = tempInputPath;
        } else {
            if (!fs.existsSync(input)) {
                throw new Error(`Input file not found: ${input}`);
            }
            inputPath = input;
        }

        // 2. Probe Video Duration
        const duration = await new Promise<number>((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) return reject(new Error(`FFprobe failed: ${err.message}`));
                const durationSec = metadata.format.duration || 0;
                resolve(durationSec);
            });
        });

        if (!duration) {
            throw new Error('Could not determine video duration.');
        }

        // 3. Calculate Seek Time
        const seekTimestamp = duration * seekPercentage;

        // 4. Extract Frame using FFmpeg
        await new Promise<void>((resolve, reject) => {
            ffmpeg(inputPath)
                .screenshots({
                    timestamps: [seekTimestamp],
                    filename: path.basename(tempScreenshotPath),
                    folder: path.dirname(tempScreenshotPath),
                    size: `${width}x${height}` // Let ffmpeg handle initial resize/aspect retrieval
                })
                .on('end', () => resolve())
                .on('error', (err) => reject(new Error(`FFmpeg screenshot failed: ${err.message}`)));
        });

        // 5. Process Image with Sharp (Overlay + WebP conversion)
        const frameBuffer = await fs.promises.readFile(tempScreenshotPath);
        let pipeline = sharp(frameBuffer)
            .resize(width, height, { fit: 'cover', position: 'center' }); // Ensure solid 16:9 fill

        // Overlay Play Icon if exists
        if (fs.existsSync(playIconPath)) {
            pipeline = pipeline.composite([{
                input: playIconPath,
                gravity: 'center'
            }]);
        } else {
            console.warn(`[generateThumbnail] Play icon not found at ${playIconPath}. Skipping overlay.`);
        }

        const outputBuffer = await pipeline
            .webp({ quality: 80, effort: 4 }) // Effort 4 is balanced
            .toBuffer();

        return outputBuffer;

    } catch (error: any) {
        console.error('[generateThumbnail] Error:', error);
        throw new Error(`Thumbnail generation failed: ${error.message}`);
    } finally {
        // Cleanup Temp Files
        const cleanup = async (p: string) => {
            try {
                if (fs.existsSync(p)) await fs.promises.unlink(p);
            } catch (e) { /* ignore */ }
        };

        if (tempInputPath) await cleanup(tempInputPath);
        await cleanup(tempScreenshotPath);
    }
}
```

### Task Breakdown

1.  **Preparation**:
    *   Imports `fluent-ffmpeg` for video handling and `sharp` for image manipulation.
    *   Defines `DEFAULT_PLAY_ICON_PATH` to efficiently locate the overlay asset.

2.  **Input Standardization**:
    *   Accepts either a file path (`string`) or raw data (`Buffer`).
    *   **Crucial Step**: If a `Buffer` is provided, it writes it to a temporary file (`os.tmpdir()`). This is required because FFmpeg works most reliably with physical files on disk.

3.  **Video Probing**:
    *   Uses `ffmpeg.ffprobe` to read the metadata of the video file.
    *   Extracts the total `duration` in seconds. This is essential for calculating the correct "percentage" timestamp (e.g., seek to 20%).

4.  **Frame Extraction**:
    *   Calculates the `seekTimestamp` (Duration * percentage).
    *   Uses `ffmpeg.screenshots()` to capture a single frame at that exact second.
    *   The frame is saved as a temporary PNG file.

5.  **Image Optimization (Sharp)**:
    *   Reads the extracted PNG frame.
    *   **Resize**: Forces the image to 1280x720 (16:9), using `fit: 'cover'` to crop properly without distortion.
    *   **Overlay**: Composites the `play-icon.png` in the `center` of the image.
    *   **Format Conversion**: Converts the final result to `WebP` format with 80% quality, which offers superior compression for the web compared to JPEG or PNG.

6.  **Cleanup**:
    *   The `finally` block ensures that all temporary files (video copy and screenshot) are deleted from the disk, preventing storage leaks on the server.

---

## Part 2: Integration Logic
**File:** `src/lib/actions/testimonials.ts` (Helper Function)

This helper function orchestrates the entire process: downloading the video, generating multiple thumbnails, and uploading them to cloud storage.

### Full Code
```typescript
async function processVideoThumbnails(videoUrl: string, userId: string, supabase: any) {
    const uploadedThumbUrls: string[] = [];
    try {
        console.log("Generating thumbnails for:", videoUrl);
        const videoRes = await fetch(videoUrl);
        if (videoRes.ok) {
            const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
            const thumbsToGenerate = [0.2, 0.5]; // Generate at 20% and 50%

            for (const seekPct of thumbsToGenerate) {
                try {
                    const thumbBuffer = await generateThumbnail({
                        input: videoBuffer,
                        seekPercentage: seekPct
                    });

                    const fileName = `generated_thumb_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
                    const filePath = `users/${userId}/thumbnails/${fileName}`;
                    
                    const { error: uploadError } = await supabase.storage
                        .from('assets')
                        .upload(filePath, thumbBuffer, { contentType: 'image/webp' });
                    
                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(filePath);
                        uploadedThumbUrls.push(publicUrl);
                    }
                } catch (genErr) {
                    console.error("Single thumbnail generation failed:", genErr);
                }
            }
        }
    } catch (e) {
        console.error("Thumbnail generation workflow failed:", e);
    }
    return uploadedThumbUrls;
}
```

### Task Breakdown

1.  **Fetching Resource**:
    *   Takes the public `videoUrl`.
    *   Uses `fetch()` to download the video file from the internet (Supabase Storage).
    *   Converts the response to a `Buffer`. This keeps the video in memory for processing (efficient for short/medium videos).

2.  **Batch Processing**:
    *   Defines `thumbsToGenerate = [0.2, 0.5]`. This triggers the logic twice: once at the 20% mark and once at the 50% mark, providing variety for the user to choose from.

3.  **Calling Core Module**:
    *   Calls `generateThumbnail` with the video buffer and the specfic `seekPercentage`.

4.  **Cloud Upload**:
    *   Generates a unique filename for the thumbnail.
    *   Uploads the generated WebP buffer back to Supabase Storage (`assets` bucket) under the user's thumbnail folder.
    *   Retrieves the public URL of the uploaded image.

5.  **Result**:
    *   Returns an array of strings (URLs) to be saved in the database.
