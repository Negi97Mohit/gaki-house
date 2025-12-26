// src/lib/fonts.ts
import fontsData from "@/data/fonts.json";

export const ALL_FONTS: string[] = fontsData as string[];

/**
 * Checks if a font is already loaded in the document.
 * @param fontName The font-family name (e.g., "Inter").
 * @returns boolean
 */
export const isFontLoaded = (fontName: string): boolean => {
    return document.fonts.check(`12px "${fontName}"`);
};

/**
 * Preloads a font by forcing the browser to load it via the FontFace API or document.fonts.load.
 * This is useful for Canvas usage to prevent FOUT.
 * @param fontName The font-family name.
 * @param text Optional text to use for loading (default: "Text").
 */
export const preloadFont = async (fontName: string, text = "Text"): Promise<void> => {
    if (isFontLoaded(fontName)) return;

    try {
        // This triggers the browser to download the font if it's defined in @font-face (HTML link tag)
        await document.fonts.load(`1em "${fontName}"`, text);
        console.log(`[FontLoader] Loaded "${fontName}"`);
    } catch (err) {
        console.warn(`[FontLoader] Failed to load "${fontName}"`, err);
    }
};

