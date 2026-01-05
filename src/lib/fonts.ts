
import { useEffect, useRef } from 'react';

// Curated list of beautiful, popular fonts
export const CURATED_FONTS: string[] = [
    "Satoshi",
    "Inter",
    "DM Sans",
    "Outfit",
    "Poppins",
];

// Extended Google Fonts list
export const GOOGLE_FONTS: string[] = [
    "ABeeZee", "Abel", "Abril Fatface", "Alegreya", "Alegreya Sans", "Aleo",
    "Alfa Slab One", "Alice", "Almarai", "Amaranth", "Amatic SC", "Amiri",
    "Anton", "Archivo", "Arimo", "Assistant", "Atkinson Hyperlegible",
    "Bai Jamjuree", "Barlow", "Bebas Neue", "Bitter", "Bodoni Moda",
    "Bricolage Grotesque", "Cabin", "Cairo", "Cantarell", "Cardo", "Catamaran",
    "Caveat", "Chakra Petch", "Chivo", "Cinzel", "Cormorant",
    "Cormorant Garamond", "Courgette", "Crimson Pro", "DM Mono", "DM Serif Display",
    "DM Serif Text", "Dancing Script", "Darker Grotesque", "Domine", "Dosis",
    "EB Garamond", "Encode Sans", "Epilogue", "Exo", "Figtree", "Fira Sans",
    "Fraunces", "Gabarito", "Gelasio", "Geist", "Gentium Book Plus", "Hanken Grotesk",
    "Heebo", "IBM Plex Mono", "IBM Plex Sans", "IBM Plex Serif", "Inter Tight",
    "Inria Sans", "Instrument Sans", "Instrument Serif", "Jost", "Josefin Sans",
    "Karla", "Khand", "Kumbh Sans", "Lato", "League Spartan", "Lexend",
    "Libre Baskerville", "Libre Franklin", "Lobster", "Lusitana", "M PLUS 1",
    "Merriweather Sans", "Montserrat", "Mulish", "Noto Sans", "Noto Serif",
    "Nunito Sans", "Open Sans", "Overpass", "Public Sans", "Quicksand", "Raleway",
    "Readex Pro", "Red Hat Display", "Reddit Sans", "Roboto", "Roboto Condensed",
    "Roboto Mono", "Roboto Serif", "Roboto Slab", "Rokkitt", "Rubik", "Sen",
    "Signika", "Source Code Pro", "Source Sans 3", "Source Serif 4", "Space Mono",
    "Spectral", "Titillium Web", "Ubuntu", "Urbanist", "Work Sans",
    "Yanone Kaffeesatz", "Ysabeau", "Young Serif"
];

// Fontshare fonts require different URLs
export const FONTSHARE_FONTS: Record<string, string> = {
    "Satoshi": "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap",
};

// Font loading utility
const loadedFonts = new Set<string>();

export const ensureFontLoaded = (family: string) => {
    if (!family || loadedFonts.has(family)) return;
    loadedFonts.add(family);

    const link = document.createElement("link");
    link.rel = "stylesheet";

    // Check if it's a Fontshare font
    if (FONTSHARE_FONTS[family]) {
        link.href = FONTSHARE_FONTS[family];
    } else {
        // Default to Google Fonts
        link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, "+")}:wght@400;500;600&display=swap`;
    }

    document.head.appendChild(link);
};

export const useFontLoader = (fonts: (string | undefined)[]) => {
    const loadedRefs = useRef(new Set<string>());

    useEffect(() => {
        fonts.forEach(font => {
            if (font && !loadedRefs.current.has(font)) {
                ensureFontLoaded(font);
                loadedRefs.current.add(font);
            }
        });
    }, [fonts]);
};
