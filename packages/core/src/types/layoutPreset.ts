// src/types/layoutPreset.ts
import { CaptionStyle, LayoutState, GeneratedOverlay, FileOverlayState, BrowserOverlayState } from "./caption";

export interface LayoutPreset {
  id: string;
  name: string;
  thumbnail?: string;
  createdAt: number;
  
  // Caption & text settings
  captionStyle: CaptionStyle;
  dynamicStyle: string;
  
  // Layout settings
  layoutState: LayoutState;
  
  // Video effects
  videoFilter: string;
  backgroundEffect: "none" | "blur" | "image";
  backgroundImageUrl: string | null;
  
  // Active overlays (HTML, file, browser)
  htmlOverlays: GeneratedOverlay[];
  fileOverlays: FileOverlayState[];
  browserOverlays: BrowserOverlayState[];
}
