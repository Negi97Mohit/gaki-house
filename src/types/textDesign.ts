// src/types/textDesign.ts

export interface TextDesignPreset {
  id: string;
  name: string;
  category: string;
  thumbnail: string; // CSS gradient or color for preview
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    backgroundColor: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    textShadow?: string;
    outline: boolean;
    shadow: boolean;
    gradient?: string;
    border: boolean;
    borderColor: string;
    borderWidth: number;
  };
}

export type TextDesignCategory =
  | "all"
  | "headlines"
  | "modern"
  | "elegant"
  | "fun"
  | "effects"
  | "retro"
  | "vintage"
  | "tech"
  | "soft";
