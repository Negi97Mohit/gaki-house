// src/lib/preview.ts
import * as htmlToImage from 'html-to-image';

/**
 * Generates a PNG data URL preview of a given HTML element.
 * @param element The HTML element to capture.
 * @returns A promise that resolves to a base64 encoded PNG data URL.
 */
export const generatePreview = async (element: HTMLElement): Promise<string> => {
  try {
    // Ensure the element is visible and has dimensions before capturing
    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      console.warn("Attempted to capture a zero-sized element for preview.");
      return "";
    }

    // --- START OF FIX ---
    // 1. Fetch and embed the font CSS to avoid CORS errors.
    //    This utility from the library reads the fonts used by the element
    //    and provides them as a string for the renderer.
    const fontEmbedCss = await htmlToImage.getFontEmbedCss(element);
    // --- END OF FIX ---

    const dataUrl = await htmlToImage.toPng(element, { 
        cacheBust: true,
        pixelRatio: 1,
        // --- START OF FIX ---
        // 2. Pass the embedded font styles directly to the renderer.
        fontEmbedCss,
        // --- END OF FIX ---
     });
    return dataUrl;
  } catch (error) {
    // --- START OF FIX ---
    // 3. Add robust error handling to prevent app crashes.
    console.error('Failed to generate overlay preview:', error);
    return ""; // Return an empty string on failure to prevent uncaught errors.
    // --- END OF FIX ---
  }
};

