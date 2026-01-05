/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BRANDS MODULE - Public API
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Central export point for all brand-related functionality.
 * 
 * Usage:
 *   import { BrandIcon, getBrand, LinkedInIcon } from '@/lib/brands';
 */

// Brand configuration
export {
    BRANDS,
    getBrand,
    getAllBrandIds,
    getAllBrands,
    type BrandConfig
} from './brand-config';

// Individual icon components (for direct import)
export {
    AirbnbIcon,
    AmazonIcon,
    AppStoreIcon,
    AppSumoIcon,
    ApplePodcastsIcon,
    CapterraIcon,
    ChromeWebStoreIcon,
    FacebookIcon,
    FiverrIcon,
    G2Icon,
    GoogleIcon,
    InstagramIcon,
    LinkedInIcon,
    PlayStoreIcon,
    ProductHuntIcon,
    RedditIcon,
    SkillshareIcon,
    TikTokIcon,
    TrustpilotIcon,
    UdemyIcon,
    WhopIcon,
    WordPressIcon,
    XIcon,
    YelpIcon,
    YouTubeIcon,
    WhatsAppIcon,
    ManualIcon,
    FormIcon,
    BRAND_ICONS,
    getBrandIcon,
    type BrandIconProps,
} from './icons';

// Main component
export { BrandIcon, useBrand } from './BrandIcon';
