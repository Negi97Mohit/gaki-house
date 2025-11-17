// src/lib/textDesigns.ts
import { TextDesignPreset } from "@/types/textDesign";

let cachedDesigns: TextDesignPreset[] | null = null;

export async function loadTextDesigns(): Promise<TextDesignPreset[]> {
  if (cachedDesigns) {
    return cachedDesigns;
  }

  try {
    const response = await fetch("/textDesigns.json");
    if (!response.ok) {
      throw new Error("Failed to load text designs");
    }
    const designs = await response.json(); // This could be an array OR an object

    // --- FIX: Handle both array and object formats ---
    if (Array.isArray(designs)) {
      // It's already an array
      cachedDesigns = designs;
    } else if (designs && Array.isArray(designs.presets)) {
      // It's an object { presets: [...] }
      cachedDesigns = designs.presets;
    } else {
      // It's something else, or empty
      cachedDesigns = [];
    }

    return cachedDesigns;
  } catch (error) {
    console.error("Error loading text designs:", error);
    return [];
  }
}

export function getDesignsByCategory(
  designs: TextDesignPreset[],
  category: string
): TextDesignPreset[] {
  if (category === "all") {
    return designs;
  }
  return designs.filter((design) => design.category === category);
}

export function getDesignById(
  designs: TextDesignPreset[],
  id: string
): TextDesignPreset | undefined {
  return designs.find((design) => design.id === id);
}
