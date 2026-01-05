(function () {
    function initEmbeds() {
        const widgets = document.querySelectorAll('.creet-widget');
        widgets.forEach(function (container) {
            // Prevent double-rendering
            if (container.dataset.rendered) return;

            const widgetId = container.getAttribute('data-id');
            if (!widgetId) return;

            // Determine the base URL from the script source
            // This allows the embed to work in Localhost and Production automatically
            let baseUrl = 'https://creet.io';
            const script = document.querySelector('script[src*="/embed.js"]');
            if (script && script.src) {
                try {
                    baseUrl = new URL(script.src).origin;
                } catch (e) { }
            }

            // Create the iframe
            const iframe = document.createElement('iframe');
            iframe.src = `${baseUrl}/w/${widgetId}`;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.minHeight = '600px'; // Default minimum height
            iframe.style.border = 'none';
            iframe.style.overflow = 'hidden';
            iframe.title = 'Creet Widget';
            iframe.setAttribute('loading', 'lazy');

            // Listen for resize messages from the widget
            window.addEventListener('message', function (e) {
                // Verify origin matches our base URL
                if (e.origin !== baseUrl) return;

                try {
                    const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                    if (data.type === 'creet-resize' && data.height) {
                        iframe.style.height = data.height + 'px';
                    }
                } catch (err) {
                    // Ignore parse errors from other sources
                }
            });

            container.innerHTML = '';
            container.appendChild(iframe);
            container.dataset.rendered = 'true';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmbeds);
    } else {
        initEmbeds();
    }
})();
