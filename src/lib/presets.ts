import { CaptionTemplate } from "@/types/caption";
import presetTemplatesData from "@/data/presetTemplates.json";

// This array holds the definitions for the predefined caption style templates.
// The LeftSidebar component maps over this array to display the preview images.
export const PRESET_TEMPLATES: CaptionTemplate[] =
  presetTemplatesData as unknown as CaptionTemplate[];
