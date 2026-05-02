import React, { useEffect, useId } from "react";
import {
  TextDesignLayer,
  TextLayer,
  TextDesignPreset,
} from "@gaki/core/types/textDesign";

interface MultiLayerTextRendererProps {
  text: string;
  layers: TextDesignLayer[];
  scale?: number;
  animation?: TextDesignPreset["animation"];
  animationCSS?: string;
  fontSize?: number; // Override
  color?: string; // Override
  letterSpacing?: string; // Override (e.g., "10px")
}

// Helper function to generate CSS for a single layer
const getLayerStyle = (
  layer: TextDesignLayer,
  scale: number = 1,
  overrideFontSize?: number,
  overrideColor?: string,
  overrideLetterSpacing?: string
): React.CSSProperties => {
  const style: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    overflow: "visible",
    pointerEvents: "none",
  };

  const layerFontSize = overrideFontSize || (layer as any).fontSize || 60;

  switch (layer.type) {
    case "text":
      style.fontFamily = layer.fontFamily;
      style.fontSize = `${layerFontSize * scale}px`;

      // LETTER SPACING OVERRIDE
      if (overrideLetterSpacing) {
        const spacingVal = parseFloat(overrideLetterSpacing);
        style.letterSpacing = `${spacingVal * scale}px`;
      } else if (layer.letterSpacing) {
        style.letterSpacing = `${
          parseFloat(layer.letterSpacing as string) * scale
        }px`;
      }

      // COLOR OVERRIDE
      if (overrideColor && overrideColor !== layer.color) {
        style.color = overrideColor;
        // Reset gradient backgrounds if solid color is enforced
        style.background = "none";
        style.backgroundClip = "border-box";
        style.WebkitBackgroundClip = "border-box";
        style.WebkitTextFillColor = "currentColor";
      } else {
        if (layer.color) {
          style.color = layer.color;
        }
        if (layer.gradient) {
          style.background = layer.gradient;
          style.backgroundClip = "text";
          style.WebkitBackgroundClip = "text";
          style.WebkitTextFillColor = "transparent";
        }
      }
      break;

    case "stroke":
      style.WebkitTextStroke = `${layer.width * scale}px ${layer.color}`;
      style.color = "transparent";
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = layer.fontFamily;
      break;

    case "glow":
    case "outer-glow":
      style.textShadow = `0 0 ${layer.blur * scale}px ${layer.color}`;
      style.color = "transparent";
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "shadow":
    case "inner-shadow":
      style.textShadow = `${layer.offsetX * scale}px ${
        layer.offsetY * scale
      }px ${layer.blur * scale}px ${layer.color}`;
      style.color = "transparent";
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "extrude":
      const shadows = [];
      const depth = Math.max(1, Math.round(layer.depth * scale));
      for (let i = 1; i <= depth; i++) {
        const x = Math.cos(layer.angle * (Math.PI / 180)) * i;
        const y = Math.sin(layer.angle * (Math.PI / 180)) * i;
        shadows.push(`${x.toFixed(1)}px ${y.toFixed(1)}px 0 ${layer.color}`);
      }
      style.textShadow = shadows.join(", ");
      style.color = "transparent";
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "texture":
      style.backgroundImage = `url(${layer.src})`;
      style.backgroundSize = "cover";
      style.backgroundClip = "text";
      style.WebkitBackgroundClip = "text";
      style.WebkitTextFillColor = "transparent";
      style.opacity = layer.opacity;
      style.mixBlendMode = layer.blendMode;
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "offset-layer":
      style.color = layer.color;
      style.transform = `translate(${layer.offsetX * scale}px, ${
        layer.offsetY * scale
      }px)`;
      style.mixBlendMode = "screen";
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "specular-highlight":
    case "gloss":
      style.background = `linear-gradient(180deg, rgba(255,255,255,${layer.strength}) 0%, rgba(255,255,255,0) 50%)`;
      style.backgroundClip = "text";
      style.WebkitBackgroundClip = "text";
      style.WebkitTextFillColor = "transparent";
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "inner-core":
      if ("color" in layer) {
        style.textShadow = `0 0 ${2 * scale}px ${layer.color}, 0 0 ${
          5 * scale
        }px ${layer.color}`;
      }
      style.color = "transparent";
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "ambient-bloom":
      if ("color" in layer && "opacity" in layer) {
        style.textShadow = `0 0 ${45 * scale}px ${layer.color}`;
        style.opacity = layer.opacity;
      }
      style.color = "transparent";
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "bloom":
      if ("color" in layer) {
        style.textShadow = `0 0 ${45 * scale}px ${
          layer.color || "rgba(255,255,255,0.5)"
        }`;
      }
      style.color = "transparent";
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "fog":
      if ("opacity" in layer) {
        style.textShadow = `0 0 ${45 * scale}px rgba(255,255,255,0.5)`;
        style.opacity = layer.opacity;
      }
      style.color = "transparent";
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "refraction":
    case "prism-shift":
    case "rgb-shift":
      style.textShadow = `${2 * scale}px ${2 * scale}px 0px #ff0000, -${
        2 * scale
      }px -${2 * scale}px 0px #00ffff`;
      style.color = "transparent";
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "3d-puff":
    case "jelly-3d":
    case "puff":
      style.textShadow = `0px ${2 * scale}px ${5 * scale}px rgba(0,0,0,0.3)`;
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "grain":
      style.backgroundImage = `url(/textures/grain.png)`;
      style.mixBlendMode = "overlay";
      style.opacity = layer.opacity;
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "scanlines":
      style.backgroundImage = `url(/textures/scanlines.png)`;
      style.mixBlendMode = "multiply";
      style.opacity = layer.opacity;
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "dust":
      style.backgroundImage = `url(/textures/dust.png)`;
      style.mixBlendMode = "screen";
      style.opacity = layer.opacity;
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "gold-foil":
      style.backgroundImage = `url(${
        layer.texture || "/textures/gold_foil.jpg"
      })`;
      style.backgroundSize = "cover";
      style.backgroundClip = "text";
      style.WebkitBackgroundClip = "text";
      style.WebkitTextFillColor = "transparent";
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;

    case "speedlines":
    case "halftone":
    case "drip":
    case "splatter":
    case "diamond-facets":
    case "sparkle":
    case "rimlight":
    case "dot-grid":
    case "emboss":
    case "chrome":
      style.opacity = 0.8;
      style.fontSize = `${layerFontSize * scale}px`;
      style.fontFamily = (layer as any).fontFamily;
      break;
  }
  return style;
};

// Animation keyframes (Kept same as provided)
const ANIMATION_KEYFRAMES: Record<string, string> = {
  fire: `
    @keyframes fire-flicker {
      0%, 100% { filter: brightness(1) drop-shadow(0 0 5px #ff6600) drop-shadow(0 -5px 10px #ff3300); }
      25% { filter: brightness(1.1) drop-shadow(0 0 8px #ff8800) drop-shadow(0 -8px 15px #ff4400); }
      50% { filter: brightness(0.95) drop-shadow(0 0 6px #ff5500) drop-shadow(0 -6px 12px #ff2200); }
      75% { filter: brightness(1.05) drop-shadow(0 0 10px #ff7700) drop-shadow(0 -10px 18px #ff3300); }
    }
  `,
  water: `
    @keyframes water-wave {
      0%, 100% { transform: translateY(0) scaleY(1); filter: drop-shadow(0 0 8px #00bfff); }
      25% { transform: translateY(-2px) scaleY(1.02); filter: drop-shadow(0 0 12px #0099ff); }
      50% { transform: translateY(0) scaleY(0.98); filter: drop-shadow(0 0 6px #00ddff); }
      75% { transform: translateY(2px) scaleY(1.01); filter: drop-shadow(0 0 10px #00aaff); }
    }
  `,
  snow: `
    @keyframes snow-sparkle {
      0%, 100% { filter: brightness(1) drop-shadow(0 0 5px #ffffff) drop-shadow(0 0 10px #e0f0ff); }
      50% { filter: brightness(1.2) drop-shadow(0 0 15px #ffffff) drop-shadow(0 0 20px #c0e0ff); }
    }
  `,
  confetti: `
    @keyframes confetti-bounce {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-5px) rotate(-2deg); }
      50% { transform: translateY(0) rotate(0deg); }
      75% { transform: translateY(-3px) rotate(2deg); }
    }
  `,
  graffiti: `
    @keyframes graffiti-shake {
      0%, 100% { transform: translateX(0); }
      10% { transform: translateX(-2px) rotate(-0.5deg); }
      20% { transform: translateX(2px) rotate(0.5deg); }
      30% { transform: translateX(-1px); }
      40% { transform: translateX(1px); }
      50% { transform: translateX(0); }
    }
  `,
  neon: `
    @keyframes neon-pulse {
      0%, 100% { filter: drop-shadow(0 0 5px currentColor) drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor); opacity: 1; }
      50% { filter: drop-shadow(0 0 2px currentColor) drop-shadow(0 0 5px currentColor) drop-shadow(0 0 10px currentColor); opacity: 0.9; }
    }
  `,
  electric: `
    @keyframes electric-zap {
      0%, 100% { filter: brightness(1) drop-shadow(0 0 5px #00ffff); transform: skewX(0deg); }
      10% { filter: brightness(1.5) drop-shadow(0 0 15px #00ffff); transform: skewX(-1deg); }
      20% { filter: brightness(1) drop-shadow(0 0 5px #00ffff); transform: skewX(1deg); }
      30% { filter: brightness(1.3) drop-shadow(0 0 20px #ffffff); transform: skewX(0deg); }
    }
  `,
  glitch: `
    @keyframes glitch-effect {
      0%, 100% { transform: translate(0); filter: hue-rotate(0deg); }
      10% { transform: translate(-2px, 1px); filter: hue-rotate(90deg); }
      20% { transform: translate(2px, -1px); filter: hue-rotate(-90deg); }
      30% { transform: translate(0); clip-path: inset(40% 0 40% 0); }
      40% { transform: translate(0); clip-path: none; }
    }
  `,
  rainbow: `
    @keyframes rainbow-shift {
      0% { filter: hue-rotate(0deg) drop-shadow(0 0 10px currentColor); }
      100% { filter: hue-rotate(360deg) drop-shadow(0 0 10px currentColor); }
    }
  `,
  pulse: `
    @keyframes text-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.9; }
    }
  `,
  bounce: `
    @keyframes text-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,
  shake: `
    @keyframes text-shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px); }
      75% { transform: translateX(3px); }
    }
  `,
  glow: `
    @keyframes glow-pulse {
      0%, 100% { filter: drop-shadow(0 0 5px currentColor) drop-shadow(0 0 10px currentColor); }
      50% { filter: drop-shadow(0 0 20px currentColor) drop-shadow(0 0 40px currentColor); }
    }
  `,
  float: `
    @keyframes text-float {
      0%, 100% { transform: translateY(0) rotate(-1deg); }
      50% { transform: translateY(-8px) rotate(1deg); }
    }
  `,
  flame: `
    @keyframes flame-dance {
      0%, 100% { transform: scaleY(1) translateY(0); filter: brightness(1); }
      25% { transform: scaleY(1.02) translateY(-2px); filter: brightness(1.1); }
      50% { transform: scaleY(0.98) translateY(1px); filter: brightness(0.95); }
      75% { transform: scaleY(1.01) translateY(-1px); filter: brightness(1.05); }
    }
  `,
  ice: `
    @keyframes ice-shimmer {
      0%, 100% { filter: brightness(1) drop-shadow(0 0 5px #a0d8ef); }
      50% { filter: brightness(1.15) drop-shadow(0 0 15px #c0e8ff) drop-shadow(0 0 25px #80c8df); }
    }
  `,
};

export const MultiLayerTextRenderer: React.FC<MultiLayerTextRendererProps> = ({
  text,
  layers,
  scale = 1,
  animation,
  animationCSS,
  fontSize,
  color,
  letterSpacing,
}) => {
  const uniqueId = useId();
  const animationName = animation?.type || "";
  const keyframes = animationCSS || ANIMATION_KEYFRAMES[animationName] || "";

  useEffect(() => {
    if (!keyframes) return;
    const styleId = `text-anim-${uniqueId.replace(/:/g, "-")}`;
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = keyframes;
    return () => {
      styleEl?.remove();
    };
  }, [keyframes, uniqueId]);

  const baseTextLayer = layers.find((l) => l.type === "text") as
    | TextLayer
    | undefined;
  const finalFontSize = fontSize || baseTextLayer?.fontSize || 32;

  const getAnimationStyle = (): React.CSSProperties => {
    if (!animation?.type) return {};
    return {
      animation: `${animation.type} ${animation.duration || 1}s ease-in-out ${
        animation.infinite !== false ? "infinite" : "1"
      }`,
    };
  };

  const containerStyle: React.CSSProperties = {
    position: "relative",
    fontFamily: baseTextLayer?.fontFamily || "Inter",
    fontSize: `${finalFontSize * scale}px`,
    fontWeight: "bold",
    textAlign: "center",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    ...getAnimationStyle(),
  };

  const baseText =
    layers.find((l): l is TextLayer => l.type === "text") ||
    (layers[0] as TextLayer);
  if (!baseText) return null;

  return (
    <div style={containerStyle}>
      <span
        style={{
          ...getLayerStyle(baseText, scale, fontSize, color, letterSpacing),
          position: "relative",
          visibility: "hidden",
        }}
      >
        {text}
      </span>
      {layers.map((layer, index) => (
        <div
          key={index}
          style={getLayerStyle(layer, scale, fontSize, color, letterSpacing)}
        >
          {text}
        </div>
      ))}
    </div>
  );
};
