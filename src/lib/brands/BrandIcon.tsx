/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BRAND ICON COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Reusable component that renders a brand icon with optional circular background.
 * Uses inline SVGs for instant rendering (0 network requests).
 * 
 * Usage:
 *   <BrandIcon brandId="linkedin" size={32} />
 *   <BrandIcon brandId="airbnb" size={24} showBackground />
 *   <BrandIcon brandId="google" size={40} variant="circle" />
 */

import React from 'react';
import { getBrand, type BrandConfig } from './brand-config';
import { getBrandIcon, type BrandIconProps } from './icons';

export interface BrandIconComponentProps {
    /** Brand ID (e.g., 'linkedin', 'airbnb', 'google') */
    brandId: string;
    /** Icon size in pixels */
    size?: number;
    /** Show circular colored background */
    showBackground?: boolean;
    /** Display variant */
    variant?: 'default' | 'circle' | 'rounded';
    /** Additional CSS classes for the icon */
    className?: string;
    /** Additional CSS classes for the container */
    containerClassName?: string;
}

/**
 * Renders a brand icon with optional styled background
 * 
 * @example
 * // Simple icon
 * <BrandIcon brandId="linkedin" size={24} />
 * 
 * @example
 * // With circular background
 * <BrandIcon brandId="airbnb" size={32} showBackground variant="circle" />
 * 
 * @example
 * // Rounded square background
 * <BrandIcon brandId="google" size={40} showBackground variant="rounded" />
 */
export function BrandIcon({
    brandId,
    size = 24,
    showBackground = false,
    variant = 'default',
    className = '',
    containerClassName = '',
}: BrandIconComponentProps) {
    const brand = getBrand(brandId);
    const IconComponent = getBrandIcon(brandId);

    // If icon is self-contained (like Instagram or Fiverr), render it directly without wrapper
    // We pass the brand color as 'color' style, which currentColor-using SVGs (like Fiverr) will use
    if (showBackground && brand.selfContained) {
        return <IconComponent size={size} className={className} style={{ color: brand.color }} />;
    }

    // If no background, just render the icon
    if (!showBackground) {
        return <IconComponent size={size} className={className} />;
    }

    // Calculate container and icon sizes
    const containerSize = size;
    const iconSize = Math.round(size * 0.75); // Icon fills most of the container

    // Determine border radius based on variant
    const borderRadius = variant === 'circle'
        ? '50%'
        : variant === 'rounded'
            ? '8px'
            : '4px';

    // Determine background color
    const bgColor = brand.needsLightBg ? '#FFFFFF' : brand.color;
    const iconColor = brand.needsLightBg ? brand.color : '#FFFFFF';

    return (
        <div
            className={`flex items-center justify-center flex-shrink-0 ${containerClassName}`}
            style={{
                width: containerSize,
                height: containerSize,
                borderRadius,
                backgroundColor: bgColor,
            }}
        >
            <IconComponent
                size={iconSize}
                className={className}
                style={{ color: iconColor }}
            />
        </div>
    );
}

/**
 * Get brand info for display (name, color, etc.)
 */
export function useBrand(brandId: string): BrandConfig {
    return getBrand(brandId);
}

export default BrandIcon;
