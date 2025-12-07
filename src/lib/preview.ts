// src/lib/preview.ts
import { toPng } from "html-to-image";

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


    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 1,
      skipFonts: true, // Skip font embedding to avoid CORS issues with Google Fonts
    });

    return dataUrl;
  } catch (error) {
    console.error("Failed to generate overlay preview:", error);
    return ""; // Return an empty string on failure.
  }
};
