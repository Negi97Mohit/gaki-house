export interface TriToneConfig {
  shadowColor: string;
  midColor: string;
  highlightColor: string;
  skinColor: string;
  lowThreshold: number;
  highThreshold: number;
  detailSensitivity?: number;
  edgeThreshold?: number;
  skinDetectionStrength?: number;
}

let AnimeStyles: Record<string, TriToneConfig> = {};

export { AnimeStyles };

export const updateAnimeStyles = (newStyles: Record<string, TriToneConfig>) => {
  AnimeStyles = { ...AnimeStyles, ...newStyles };
};
