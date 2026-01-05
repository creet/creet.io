// ================================================================= //
//                       WIDGET CONFIGURATION                        //
// ================================================================= //
// This file defines the structure for widget properties.
// Pattern: BaseWidget (Common) -> Extended Widgets (Specific)
// ================================================================= //

// ----------------------------------------------------------------- //
// 1. BASE WIDGET CONFIGURATION                                      //
// ----------------------------------------------------------------- //
// These properties are shared by ALL widgets. 
// Every new widget MUST extend this interface.

export interface BaseWidgetConfig {
    // Identity
    id: string;
    name: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;

    // Theme (Common to all)
    primaryColor: string;
    ratingColor: string;
    accentColor: string;
    textColor: string;
    colorScheme: 'light' | 'dark' | 'auto';
    fontFamily: string;
    borderRadius: number;
    maxWidth: number;

    // Visibility (Common toggles)
    showRating: boolean;
    showDate: boolean;
    showSourceIcon: boolean;
    showVerifiedBadge: boolean;
    showAuthorAvatar: boolean;
}

// ----------------------------------------------------------------- //
// 2. EXTENDED WIDGET CONFIGURATIONS                                 //
// ----------------------------------------------------------------- //
// Specific widget types extend the base config and add their own props.

// --- Card Widgets (Social Card, Minimal Card) ---
export interface CardWidgetConfig extends BaseWidgetConfig {
    type: 'social-card' | 'minimal-card' | 'quote-card';

    // Card-specific props - RESTRICTED TO 3 THEMES
    cardStyle: 'minimal' | 'modern' | 'brutal';
    maxLines: number;
    showNavigation: boolean;
}

// --- Collection Widgets (List Feed, Grid, Carousel) ---
export interface CollectionWidgetConfig extends BaseWidgetConfig {
    type: 'list-feed' | 'grid' | 'masonry' | 'carousel';

    // Collection-specific props
    columns: 1 | 2 | 3 | 4;
    gap: number;
    itemsPerPage: number;
    navigationType: 'arrows' | 'dots' | 'none';
}

// --- Badge Widgets (Rating Badge) ---
export interface BadgeWidgetConfig extends BaseWidgetConfig {
    type: 'rating-badge' | 'trust-badge';

    // Badge-specific props
    size: 'small' | 'medium' | 'large';
    layout: 'row' | 'column';
}

// --- Wall of Love Widgets ---
export interface WallOfLoveWidgetConfig extends BaseWidgetConfig {
    type: 'wall-glassmorphism' | 'wall-brutalist' | 'wall-cinematic' | 'wall-classic';

    // Wall-specific props
    wallStyle: 'glassmorphism' | 'brutalist' | 'cinematic' | 'classic';
    headerTitle: string;
    headerSubtitle: string;
    showHeader: boolean;
    columns: 2 | 3 | 4 | 5;
}

// ----------------------------------------------------------------- //
// 3. MAIN WIDGET CONFIG TYPE                                        //
// ----------------------------------------------------------------- //
// The union of all possible widget configurations.

export type WidgetConfig =
    | CardWidgetConfig
    | CollectionWidgetConfig
    | BadgeWidgetConfig
    | WallOfLoveWidgetConfig;

export type WidgetType = WidgetConfig['type'];

// ----------------------------------------------------------------- //
// 4. HELPER FUNCTIONS & DEFAULTS                                    //
// ----------------------------------------------------------------- //

const BASE_DEFAULTS = {
    primaryColor: '#5454d4',
    ratingColor: '#fbbf24',
    accentColor: '#6366f1',
    textColor: '#ffffff',
    colorScheme: 'dark' as const,
    fontFamily: 'Inter',
    borderRadius: 16,
    maxWidth: 1200,
    showRating: true,
    showDate: true,
    showSourceIcon: true,
    showVerifiedBadge: true,
    showAuthorAvatar: true,
};

// Type Guards to narrow down the config type in usage
export const isCardWidget = (config: WidgetConfig): config is CardWidgetConfig => {
    return ['social-card', 'minimal-card', 'quote-card'].includes(config.type);
};

export const isCollectionWidget = (config: WidgetConfig): config is CollectionWidgetConfig => {
    return ['list-feed', 'grid', 'masonry', 'carousel'].includes(config.type);
};

export const isBadgeWidget = (config: WidgetConfig): config is BadgeWidgetConfig => {
    return ['rating-badge', 'trust-badge'].includes(config.type);
};

export const isWallOfLoveWidget = (config: WidgetConfig): config is WallOfLoveWidgetConfig => {
    return ['wall-glassmorphism', 'wall-brutalist', 'wall-cinematic', 'wall-classic'].includes(config.type);
};

// Factory function to create a config with strict typing
// Accepts optional brandSettings to override defaults (from project brand_settings)
export function createWidgetConfig(
    type: WidgetType,
    partial: { id: string; name: string; projectId: string },
    brandSettings?: {
        primaryColor?: string;
        textColor?: string;
        ratingColor?: string;
        fontFamily?: string;
    }
): WidgetConfig {
    const now = new Date().toISOString();

    // Merge brand settings into base defaults
    const baseWithBrand = {
        ...BASE_DEFAULTS,
        ...(brandSettings?.primaryColor && { primaryColor: brandSettings.primaryColor }),
        ...(brandSettings?.textColor && { textColor: brandSettings.textColor }),
        ...(brandSettings?.ratingColor && { ratingColor: brandSettings.ratingColor }),
        ...(brandSettings?.fontFamily && { fontFamily: brandSettings.fontFamily }),
    };

    const base = { ...partial, ...baseWithBrand, createdAt: now, updatedAt: now };

    if (['social-card', 'minimal-card', 'quote-card'].includes(type)) {
        return {
            ...base,
            type: type as CardWidgetConfig['type'],
            cardStyle: 'minimal',
            maxLines: 4,
            showNavigation: true,
        };
    }

    if (['list-feed', 'grid', 'masonry', 'carousel'].includes(type)) {
        return {
            ...base,
            type: type as CollectionWidgetConfig['type'],
            columns: 1,
            gap: 16,
            itemsPerPage: 10,
            navigationType: 'arrows',
        };
    }

    if (['wall-glassmorphism', 'wall-brutalist', 'wall-cinematic', 'wall-classic'].includes(type)) {
        const wallStyleMap: Record<string, WallOfLoveWidgetConfig['wallStyle']> = {
            'wall-glassmorphism': 'glassmorphism',
            'wall-brutalist': 'brutalist',
            'wall-cinematic': 'cinematic',
            'wall-classic': 'classic',
        };
        return {
            ...base,
            type: type as WallOfLoveWidgetConfig['type'],
            wallStyle: wallStyleMap[type] || 'glassmorphism',
            headerTitle: 'Wall of Love',
            headerSubtitle: "We're loved by entrepreneurs, creators, freelancers and agencies from all over the world.",
            showHeader: true,
            columns: 5,
        };
    }

    // Default to badge
    return {
        ...base,
        type: type as BadgeWidgetConfig['type'],
        size: 'medium',
        layout: 'row',
    };
}
