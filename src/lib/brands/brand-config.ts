/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BRAND CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Centralized configuration for all brand/source icons used across the app.
 * 
 * Used in:
 * - Wall of Love (public, speed-critical)
 * - Widgets (public, speed-critical)
 * - Import page (internal)
 * - Widget/Wall editors (internal)
 * - Dashboard (internal)
 */

export interface BrandConfig {
    id: string;
    name: string;
    /** Primary brand color (for circular backgrounds) */
    color: string;
    /** Optional secondary color */
    colorSecondary?: string;
    /** Whether the icon needs a white background for visibility */
    needsLightBg?: boolean;
    /** Whether the icon is self-contained (has its own background) and shouldn't be wrapped */
    selfContained?: boolean;
}

/**
 * All supported brand configurations
 * Icons are stored separately in ./icons/ for tree-shaking
 */
export const BRANDS: Record<string, BrandConfig> = {
    airbnb: {
        id: 'airbnb',
        name: 'Airbnb',
        color: '#FF5A5F',
    },
    amazon: {
        id: 'amazon',
        name: 'Amazon',
        color: '#FF9900',
        needsLightBg: true,
    },
    app_store: {
        id: 'app_store',
        name: 'App Store',
        color: '#0D96F6',
    },
    appsumo: {
        id: 'appsumo',
        name: 'AppSumo',
        color: '#FFE500',
        needsLightBg: true,
    },
    apple_podcasts: {
        id: 'apple_podcasts',
        name: 'Apple Podcasts',
        color: '#9933CC',
    },
    capterra: {
        id: 'capterra',
        name: 'Capterra',
        color: '#FF9D28',
    },
    chrome_web_store: {
        id: 'chrome_web_store',
        name: 'Chrome Web Store',
        color: '#4285F4',
    },
    facebook: {
        id: 'facebook',
        name: 'Facebook',
        color: '#1877F2',
    },
    fiverr: {
        id: 'fiverr',
        name: 'Fiverr',
        color: '#1DBF73',
        selfContained: true,
    },
    g2: {
        id: 'g2',
        name: 'G2',
        color: '#FF492C',
    },
    google: {
        id: 'google',
        name: 'Google',
        color: '#4285F4',
        needsLightBg: true,
    },
    instagram: {
        id: 'instagram',
        name: 'Instagram',
        color: '#E4405F',
        colorSecondary: '#FCAF45',
        selfContained: true,
    },
    linkedin: {
        id: 'linkedin',
        name: 'LinkedIn',
        color: '#0A66C2',
        selfContained: true,
    },
    play_store: {
        id: 'play_store',
        name: 'Play Store',
        color: '#34A853',
        needsLightBg: true,
    },
    product_hunt: {
        id: 'product_hunt',
        name: 'Product Hunt',
        color: '#DA552F',
    },
    reddit: {
        id: 'reddit',
        name: 'Reddit',
        color: '#FF4500',
    },
    skillshare: {
        id: 'skillshare',
        name: 'Skillshare',
        color: '#00FF84',
        needsLightBg: true,
    },
    tiktok: {
        id: 'tiktok',
        name: 'TikTok',
        color: '#000000',
        needsLightBg: true,
    },
    trustpilot: {
        id: 'trustpilot',
        name: 'Trustpilot',
        color: '#00B67A',
    },
    udemy: {
        id: 'udemy',
        name: 'Udemy',
        color: '#A435F0',
    },
    whop: {
        id: 'whop',
        name: 'Whop',
        color: '#FF6243',
    },
    wordpress: {
        id: 'wordpress',
        name: 'WordPress',
        color: '#21759B',
    },
    x: {
        id: 'x',
        name: 'X',
        color: '#000000',
        needsLightBg: true,
    },
    yelp: {
        id: 'yelp',
        name: 'Yelp',
        color: '#D32323',
        needsLightBg: true,
    },
    youtube: {
        id: 'youtube',
        name: 'YouTube',
        color: '#FF0000',
    },
    whatsapp: {
        id: 'whatsapp',
        name: 'WhatsApp',
        color: '#25D366',
        selfContained: true,
    },
    // Special: Manual source (no external platform)
    manual: {
        id: 'manual',
        name: 'Manual',
        color: '#6B7280',
    },
    // Special: Form submission
    form: {
        id: 'form',
        name: 'Form',
        color: '#8B5CF6',
    },
};

/** Get brand config by ID, with fallback to manual */
export function getBrand(id: string): BrandConfig {
    return BRANDS[id.toLowerCase()] || BRANDS.manual;
}

/** Get all brand IDs as an array */
export function getAllBrandIds(): string[] {
    return Object.keys(BRANDS);
}

/** Get all brands as an array */
export function getAllBrands(): BrandConfig[] {
    return Object.values(BRANDS);
}
