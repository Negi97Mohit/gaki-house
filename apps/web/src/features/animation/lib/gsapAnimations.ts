import gsap from "gsap";
import type { GSAPAnimationType, GSAPAnimationConfig, GSAPPreset } from "./gsap/types";
import {
  createCinematicReveal,
  createKineticType,
  createMorphGlitch,
  createElasticBounce,
  createStaggerWave,
  createPerspectiveFlip,
  createLiquidFill,
  createNeonFlicker,
} from "./gsap/creators-motion";
import {
  createTypewriter,
  createScramble,
  createMagneticPull,
  createRubberBand,
  createShatter,
  createInkReveal,
  createSpotlight,
  createWhipPan,
  createZoomPunch,
} from "./gsap/creators-fx";
import { GSAP_PRESETS } from "./gsap/presets";

export type { GSAPAnimationType, GSAPAnimationConfig, GSAPPreset };
export {
  createCinematicReveal,
  createKineticType,
  createMorphGlitch,
  createElasticBounce,
  createStaggerWave,
  createPerspectiveFlip,
  createLiquidFill,
  createNeonFlicker,
  createTypewriter,
  createScramble,
  createMagneticPull,
  createRubberBand,
  createShatter,
  createInkReveal,
  createSpotlight,
  createWhipPan,
  createZoomPunch,
  GSAP_PRESETS,
};

export const executeGSAPAnimation = (
  element: HTMLElement,
  config: GSAPAnimationConfig,
): gsap.core.Timeline => {
  switch (config.type) {
    case "cinematic-reveal":
      return createCinematicReveal(element, config);
    case "kinetic-type":
      return createKineticType(element, config);
    case "morph-glitch":
      return createMorphGlitch(element, config);
    case "elastic-bounce":
      return createElasticBounce(element, config);
    case "stagger-wave":
      return createStaggerWave(element, config);
    case "perspective-flip":
      return createPerspectiveFlip(element, config);
    case "liquid-fill":
      return createLiquidFill(element, config);
    case "neon-flicker":
      return createNeonFlicker(element, config);
    case "typewriter":
      return createTypewriter(element, config);
    case "scramble":
      return createScramble(element, config);
    case "magnetic-pull":
      return createMagneticPull(element, config);
    case "rubber-band":
      return createRubberBand(element, config);
    case "shatter":
      return createShatter(element, config);
    case "ink-reveal":
      return createInkReveal(element, config);
    case "whip-pan":
      return createWhipPan(element, config);
    case "zoom-punch":
      return createZoomPunch(element, config);
    default:
      // Fallback: simple fade
      return gsap
        .timeline()
        .fromTo(
          element,
          { opacity: 0 },
          { opacity: 1, duration: config.duration || 0.5 },
        );
  }
};

// TEXT SPLITTING UTILITY

export const splitTextToChars = (text: string): string => {
  return text
    .split("")
    .map((char) =>
      char === " "
        ? '<span class="char">&nbsp;</span>'
        : `<span class="char">${char}</span>`,
    )
    .join("");
};

export const splitTextToWords = (text: string): string => {
  return text
    .split(" ")
    .map((word) => `<span class="word">${word}</span>`)
    .join(" ");
};

export const splitTextToLines = (text: string): string => {
  return text
    .split("\n")
    .map((line) => `<span class="line">${line}</span>`)
    .join("");
};
