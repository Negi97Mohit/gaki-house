import { useState, useCallback } from "react";

export type OpacityPattern =
  | "none"
  | "uniform"
  | "left-to-right"
  | "right-to-left"
  | "top-to-bottom"
  | "bottom-to-top"
  | "center-to-edge"
  | "edge-to-center"
  | "diagonal-tl-br"
  | "diagonal-tr-bl";

export interface CameraOpacityState {
  isEnabled: boolean;
  opacity: number; // 0–100
  pattern: OpacityPattern;
}

const PATTERN_LABELS: Record<OpacityPattern, string> = {
  none: "No Gradient",
  uniform: "Uniform",
  "left-to-right": "Left → Right",
  "right-to-left": "Right → Left",
  "top-to-bottom": "Top → Bottom",
  "bottom-to-top": "Bottom → Top",
  "center-to-edge": "Center → Edge",
  "edge-to-center": "Edge → Center",
  "diagonal-tl-br": "Diagonal ↘",
  "diagonal-tr-bl": "Diagonal ↙",
};

export { PATTERN_LABELS };

export const useCameraOpacity = () => {
  const [state, setState] = useState<CameraOpacityState>({
    isEnabled: false,
    opacity: 50,
    pattern: "none",
  });

  const toggle = useCallback(() => {
    setState((s) => ({ ...s, isEnabled: !s.isEnabled }));
  }, []);

  const setOpacity = useCallback((opacity: number) => {
    setState((s) => ({ ...s, opacity }));
  }, []);

  const setPattern = useCallback((pattern: OpacityPattern) => {
    setState((s) => ({ ...s, pattern }));
  }, []);

  return { ...state, toggle, setOpacity, setPattern };
};
