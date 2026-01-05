import { toPng, toSvg, toJpeg } from 'html-to-image';

export type ExportFormat = 'png' | 'svg' | 'jpeg';

export const downloadWidgetImage = async (widgetId: string, format: ExportFormat, targetWidth?: number) => {
    const element = document.getElementById('widget-export-container');
    if (!element) {
        console.error('Widget container not found');
        return;
    }

    try {
        let dataUrl = '';

        // Calculate dimensions to ensure full content is captured
        const padding = 60;
        const width = element.scrollWidth + (padding * 2);
        const height = element.scrollHeight + (padding * 2);

        // Calculate pixelRatio for target width or default to 2 (Retina)
        let pixelRatio = 2;
        if (targetWidth) {
            pixelRatio = targetWidth / width;
        }

        const commonOptions = {
            quality: 0.95,
            pixelRatio: pixelRatio,
            width: width,
            height: height,
            style: {
                padding: `${padding}px`,
                background: 'linear-gradient(135deg, #1a1a20 0%, #09090b 100%)',
                // Ensure full visibility
                height: 'auto',
                maxHeight: 'none',
                overflow: 'visible',
                margin: '0',
                boxSizing: 'border-box'
            }
        };

        switch (format) {
            case 'png':
                dataUrl = await toPng(element, commonOptions);
                break;
            case 'svg':
                dataUrl = await toSvg(element, commonOptions);
                break;
            case 'jpeg':
                // JPEG requires a background color as it doesn't support transparency
                dataUrl = await toJpeg(element, {
                    ...commonOptions,
                    backgroundColor: '#09090b'
                });
                break;
        }

        const link = document.createElement('a');
        link.download = `creet-widget-${widgetId}.${format}`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Failed to export image:', err);
        throw err; // Re-throw to handle loading state in UI
    }
};
