/**
 * Creed.io Design Tokens v2.2
 * 
 * Philosophy: "The Design Studio"
 * - Dark canvas to let user content shine
 * - White for utility (focus rings, toggles, checkboxes)
 * - Electric Lime for destiny (primary CTAs only)
 * 
 * Usage:
 * import { shadows, colors, componentStyles } from '@/lib/design-tokens';
 * 
 * <div style={{ boxShadow: shadows.level2 }}>...</div>
 * <button className={componentStyles.buttonPrimary.className} style={componentStyles.buttonPrimary.style}>
 */

// ============================================================================
// ELEVATION SHADOWS
// ============================================================================
// Each level includes:
// - Multiple shadow layers for depth
// - Inner highlight (inset) for physical presence
// - Border ring for definition in darkness

export const shadows = {
  /** No shadow - flat, static content */
  level0: 'none',

  /** Cards, containers, raised surfaces */
  level1: '0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.04)',

  /** Dropdowns, popovers, command palettes */
  level2: '0 4px 8px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',

  /** Modals, dialogs, critical overlays */
  level3: '0 8px 16px rgba(0,0,0,0.5), 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 0 rgba(255,255,255,0.1)',

  /** Primary button glow (Lime) */
  glowLime: '0 0 20px rgba(191,255,0,0.15)',

  /** Subtle glow for hover states */
  glowLimeSubtle: '0 0 12px rgba(191,255,0,0.1)',

  /** Input field inner shadow */
  insetInput: 'inset 0 2px 4px rgba(0,0,0,0.1)',
} as const;

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Brand
  accent: '#BFFF00',         // Electric Lime - primary CTAs only
  accentHover: '#D4FF50',    // Lime hover state
  accentMuted: 'rgba(191,255,0,0.1)',  // Lime backgrounds (badges)
  accentBorder: 'rgba(191,255,0,0.2)', // Lime borders

  // Backgrounds (Surface Scale)
  bgBase: '#09090B',         // The Void - page background
  bgSurface1: '#0F0F11',     // Panels, sidebars
  bgSurface2: '#18181B',     // Cards, elevated surfaces
  bgSurface3: '#27272A',     // Highest elevation, overlays
  bgSurface4: '#1C1C1F',     // Modal backgrounds

  // Text
  textPrimary: '#FAFAFA',    // White - headlines, important text
  textSecondary: '#E4E4E7',  // Zinc-200 - body text
  textMuted: '#A1A1AA',      // Zinc-400 - captions, labels
  textSubtle: '#71717A',     // Zinc-500 - hints, placeholders
  textDisabled: '#52525B',   // Zinc-600 - disabled states

  // Borders
  borderDefault: 'rgba(255,255,255,0.04)',  // Subtle
  borderSubtle: 'rgba(255,255,255,0.06)',   // Cards
  borderMedium: 'rgba(255,255,255,0.08)',   // Hover
  borderStrong: 'rgba(255,255,255,0.10)',   // Focus
  borderWhite: 'rgba(255,255,255,0.20)',    // High contrast

  // Semantic
  success: '#BFFF00',        // Matches brand
  error: '#EF4444',          // Red-500
  warning: '#F59E0B',        // Amber-500
  info: '#FFFFFF',           // White (neutral info)
} as const;

// ============================================================================
// TYPOGRAPHY (Legacy support + new structure)
// ============================================================================

export const typography = {
  // Font families (defined in layout.tsx)
  fontHeading: 'var(--font-heading)',  // Satoshi
  fontBody: 'var(--font-sans)',        // Inter
  fontMono: 'var(--font-mono)',        // Mono

  // Tracking (letter-spacing)
  trackingTighter: '-0.03em',  // Display XL
  trackingTight: '-0.02em',    // Display L/M
  trackingNormal: '-0.01em',   // Body
  trackingWide: '0.05em',      // Labels (uppercase)
  trackingWidest: '0.1em',     // Micro labels
} as const;

// ============================================================================
// ANIMATION
// ============================================================================

export const animation = {
  // Durations
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',

  // Easings
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ============================================================================
// COMPONENT STYLES (Pre-built class + style combinations)
// ============================================================================

export const componentStyles = {
  /** Card with Level 1 elevation */
  card: {
    className: 'rounded-2xl bg-[#0F0F11] border border-white/[0.04] transition-all',
    style: { boxShadow: shadows.level1 } as React.CSSProperties,
  },

  /** Card hover variant */
  cardHover: {
    className: 'rounded-2xl bg-[#0F0F11] border border-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer',
    style: { boxShadow: shadows.level1 } as React.CSSProperties,
  },

  /** Dropdown/Popover with Level 2 elevation */
  dropdown: {
    className: 'rounded-xl bg-[#18181B] border border-white/[0.06]',
    style: { boxShadow: shadows.level2 } as React.CSSProperties,
  },

  /** Modal with Level 3 elevation */
  modal: {
    className: 'rounded-2xl bg-[#1C1C1F] border border-white/[0.08]',
    style: { boxShadow: shadows.level3 } as React.CSSProperties,
  },

  /** Primary button (Lime) - THE SIGNAL */
  buttonPrimary: {
    className: 'bg-[#BFFF00] text-black font-semibold rounded-lg hover:bg-[#D4FF50] active:scale-[0.98] transition-all',
    style: { boxShadow: shadows.glowLime } as React.CSSProperties,
  },

  /** Secondary button (White) - THE FOCUS */
  buttonSecondary: {
    className: 'bg-white text-black font-medium rounded-lg hover:bg-zinc-100 active:scale-[0.98] transition-all',
    style: {} as React.CSSProperties,
  },

  /** Tertiary button (Outlined) */
  buttonTertiary: {
    className: 'bg-transparent border border-white/10 text-white font-medium rounded-lg hover:bg-white/[0.04] hover:border-white/20 active:scale-[0.98] transition-all',
    style: {} as React.CSSProperties,
  },

  /** Ghost button (Text only) */
  buttonGhost: {
    className: 'text-zinc-400 font-medium rounded-lg hover:text-white hover:bg-white/[0.04] transition-all',
    style: {} as React.CSSProperties,
  },

  /** Text input */
  input: {
    className: 'w-full bg-[#18181B] border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all',
    style: { boxShadow: shadows.insetInput } as React.CSSProperties,
  },

  /** Active nav item */
  navItemActive: {
    className: 'bg-white/[0.06] text-white',
    style: {} as React.CSSProperties,
  },

  /** Inactive nav item */
  navItemInactive: {
    className: 'text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all',
    style: {} as React.CSSProperties,
  },

  /** Toast notification */
  toast: {
    className: 'rounded-xl bg-[#18181B] border border-white/[0.06]',
    style: { boxShadow: shadows.level2 } as React.CSSProperties,
  },

  /** Badge - Active/Success (Lime) */
  badgeActive: {
    className: 'px-2 py-1 rounded-md bg-[#BFFF00]/10 text-[#BFFF00] text-[10px] font-semibold uppercase tracking-wide border border-[#BFFF00]/20',
    style: {} as React.CSSProperties,
  },

  /** Badge - Neutral */
  badgeNeutral: {
    className: 'px-2 py-1 rounded-md bg-white/[0.04] text-zinc-400 text-[10px] font-semibold uppercase tracking-wide border border-white/[0.06]',
    style: {} as React.CSSProperties,
  },

  /** Badge - Archived/Muted */
  badgeMuted: {
    className: 'px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 text-[10px] font-semibold uppercase tracking-wide border border-zinc-700',
    style: {} as React.CSSProperties,
  },
} as const;

// ============================================================================
// LEGACY SUPPORT - Original designTokens structure
// ============================================================================

export const designTokens = {
  typography: {
    heading: {
      name: "Satoshi",
      stack: "'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    body: {
      name: "Inter",
      stack: "'Inter', sans-serif",
    },
    monospace: {
      name: "JetBrains Mono",
      stack: "'JetBrains Mono', monospace",
    },
  },
  palette: {
    primary: {
      studioBlack: {
        name: "Studio Black",
        hex: "#09090B",
        description: "The Room — Primary dark background (Zinc-950)",
      },
      glassGray: {
        name: "Glass Gray",
        hex: "#27272A",
        description: "The Tools — Navigation, footer, surfaces (Zinc-800)",
      },
      mistWhite: {
        name: "Mist White",
        hex: "#E4E4E7",
        description: "The Content — Body text (Zinc-200)",
      },
      canvasWhite: {
        name: "Canvas White",
        hex: "#FFFFFF",
        description: "The Pivot — ONLY for testimonial card backgrounds",
      },
    },
    accent: {
      electricLime: {
        name: "Electric Lime",
        hex: "#BFFF00",
        description: "The Trust Seal — Verified badge, primary CTA, logo icon ONLY",
      },
    },
    feedback: {
      infoBlue: {
        name: "Info Blue",
        hex: "#3B82F6",
        description: "Informational messages (Blue-500)",
      },
      warningAmber: {
        name: "Warning Amber",
        hex: "#F59E0B",
        description: "Non-critical warnings (Amber-500)",
      },
      dangerRed: {
        name: "Danger Red",
        hex: "#EF4444",
        description: "Errors and destructive actions (Red-500)",
      },
    },
  },
} as const;

export type DesignTokens = typeof designTokens;
export type Shadows = typeof shadows;
export type Colors = typeof colors;
export type ComponentStyles = typeof componentStyles;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Apply shadow to style prop */
export function withShadow(level: keyof typeof shadows): React.CSSProperties {
  return { boxShadow: shadows[level] };
}

/** Get component style props (className + style) */
export function getComponentStyle(component: keyof typeof componentStyles) {
  return componentStyles[component];
}

/**
 * Calculate the relative luminance of a hex color.
 * Based on WCAG 2.1 formula: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getLuminance(hex: string): number {
  // Remove # if present and handle shorthand
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }

  if (cleanHex.length !== 6) {
    return 0.5; // Default to mid-gray for invalid colors
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);

  // Calculate relative luminance using WCAG formula
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Get the optimal contrast text color (black or white) for a given background color.
 * Uses WCAG luminance calculation to determine the best contrast.
 * 
 * @param backgroundColor - Hex color string (with or without #)
 * @param options - Optional configuration
 * @returns '#000000' for dark text on light backgrounds, '#FFFFFF' for light text on dark backgrounds
 */
export function getContrastColor(
  backgroundColor: string,
  options?: { threshold?: number }
): '#000000' | '#FFFFFF' {
  // Default threshold of 0.5 provides good accessibility
  // Higher values favor white text, lower values favor black text
  const threshold = options?.threshold ?? 0.5;

  const luminance = getLuminance(backgroundColor);

  // If the background is light (high luminance), use black text
  // If the background is dark (low luminance), use white text
  return luminance > threshold ? '#000000' : '#FFFFFF';
}

/**
 * Generates consistent styles for primary action buttons.
 * Handles text contrast, background color, and visibility (shadows/borders)
 * to ensure buttons pop against dark app backgrounds.
 */
export function getPrimaryButtonStyles(primaryColor?: string): React.CSSProperties {
  const color = primaryColor || '#A855F7'; // Default to purple if missing
  const textColor = getContrastColor(color);
  const isDarkColor = textColor === '#FFFFFF'; // If text is white, background is dark

  // Base styles
  const styles: React.CSSProperties = {
    backgroundColor: color,
    color: textColor,
  };

  if (isDarkColor) {
    // DARK BUTTONS (e.g. Black, Dark Blue)
    // Need a light border/glow to separate from the dark app background
    styles.boxShadow = `
      0 0 0 1px rgba(255, 255, 255, 0.15), 
      0 4px 12px rgba(0, 0, 0, 0.5),
      0 0 0 0 transparent
    `;
    // Add a subtle white inner tint to give it dimension
    styles.border = '1px solid rgba(255, 255, 255, 0.1)';
  } else {
    // LIGHT/BRIGHT BUTTONS (e.g. Lime, Cyan, White)
    // Use the color itself for a nice glow
    styles.boxShadow = `
      0 0 0 1px rgba(0, 0, 0, 0.05),
      0 4px 12px -2px ${color}66, 
      0 0 20px -5px ${color}33
    `;
    styles.border = '1px solid rgba(0, 0, 0, 0.05)';
  }

  return styles;
}
