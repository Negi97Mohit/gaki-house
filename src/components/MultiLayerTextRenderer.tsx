// src/components/MultiLayerTextRenderer.tsx
import React from "react";
import { TextDesignLayer, TextLayer } from "@/types/textDesign";

interface MultiLayerTextRendererProps {
  text: string;
  layers: TextDesignLayer[];
}

// Helper function to generate CSS for a single layer
const getLayerStyle = (layer: TextDesignLayer): React.CSSProperties => {
  const style: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "pre-wrap",
    breakWord: "break-word",
    pointerEvents: "none",
  };

  switch (layer.type) {
    case "text":
      style.fontFamily = layer.fontFamily;
      style.fontSize = `${layer.fontSize}px`;
      style.letterSpacing = layer.letterSpacing;
      if (layer.color) {
        style.color = layer.color;
      }
      if (layer.gradient) {
        style.background = layer.gradient;
        style.backgroundClip = "text";
        style.WebkitBackgroundClip = "text";
        style.WebkitTextFillColor = "transparent";
      }
      break;

    case "stroke":
      style.WebkitTextStroke = `${layer.width}px ${layer.color}`;
      style.color = "transparent";
      break;

    case "glow":
    case "outer-glow":
      style.textShadow = `0 0 ${layer.blur}px ${layer.color}`;
      style.color = "transparent";
      break;

    case "shadow":
      style.textShadow = `${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.color}`;
      style.color = "transparent";
      break;

    case "inner-shadow":
      // This is trickier and often requires a pseudo-element,
      // but a simple text-shadow can fake it.
      style.textShadow = `${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.color}`;
      style.color = "transparent";
      break;

    case "extrude":
      // Fake 3D extrude using multiple text-shadows
      const shadows = [];
      for (let i = 1; i <= layer.depth; i++) {
        // Simple angle logic (can be improved)
        const x = Math.cos(layer.angle * (Math.PI / 180)) * i;
        const y = Math.sin(layer.angle * (Math.PI / 180)) * i;
        shadows.push(`${x.toFixed(0)}px ${y.toFixed(0)}px 0 ${layer.color}`);
      }
      style.textShadow = shadows.join(", ");
      style.color = "transparent";
      break;

    case "texture":
      style.backgroundImage = `url(${layer.src})`;
      style.backgroundSize = "cover";
      style.backgroundClip = "text";
      style.WebkitBackgroundClip = "text";
      style.WebkitTextFillColor = "transparent";
      style.opacity = layer.opacity;
      style.mixBlendMode = layer.blendMode;
      break;

    case "offset-layer":
      style.color = layer.color;
      style.transform = `translate(${layer.offsetX}px, ${layer.offsetY}px)`;
      style.mixBlendMode = "screen"; // Common for chromatic aberration
      break;

    case "specular-highlight":
    case "gloss":
      // This is a complex effect, often faked with a gradient overlay
      style.background = `linear-gradient(180deg, rgba(255,255,255,${layer.strength}) 0%, rgba(255,255,255,0) 50%)`;
      style.backgroundClip = "text";
      style.WebkitBackgroundClip = "text";
      style.WebkitTextFillColor = "transparent";
      break;

    // --- PLACEHOLDERS FOR NEW ADVANCED EFFECTS ---
    case "inner-core":
      style.textShadow = `0 0 2px ${layer.color}, 0 0 5px ${layer.color}`;
      style.color = "transparent";
      break;
    case "ambient-bloom":
    case "bloom":
    case "fog":
      style.textShadow = `0 0 45px ${layer.color || "rgba(255,255,255,0.5)"}`;
      style.opacity = layer.opacity;
      style.color = "transparent";
      break;
    case "refraction":
    case "prism-shift":
    case "rgb-shift":
      style.textShadow = `2px 2px 0px #ff0000, -2px -2px 0px #00ffff`;
      style.color = "transparent";
      break;
    case "3d-puff":
    case "jelly-3d":
    case "puff":
      // Fake puff with a soft, inset shadow
      style.textShadow = `0px 2px 5px rgba(0,0,0,0.3)`;
      break;
    case "grain":
      style.backgroundImage = `url(/textures/grain.png)`; // You will need to add this texture
      style.mixBlendMode = "overlay";
      style.opacity = layer.opacity;
      break;
    case "scanlines":
      style.backgroundImage = `url(/textures/scanlines.png)`; // You will need to add this texture
      style.mixBlendMode = "multiply";
      style.opacity = layer.opacity;
      break;
    case "dust":
      style.backgroundImage = `url(/textures/dust.png)`; // You will need to add this texture
      style.mixBlendMode = "screen";
      style.opacity = layer.opacity;
      break;
    case "gold-foil":
      style.backgroundImage = `url(${
        layer.texture || "/textures/gold_foil.jpg"
      })`;
      style.backgroundSize = "cover";
      style.backgroundClip = "text";
      style.WebkitBackgroundClip = "text";
      style.WebkitTextFillColor = "transparent";
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
      // Generic placeholder for complex effects
      style.opacity = 0.8; // Just to show it's doing *something*
      break;
  }
  return style;
};

export const MultiLayerTextRenderer: React.FC<MultiLayerTextRendererProps> = ({
  text,
  layers,
}) => {
  // Find the base text layer to set font size for the container
  const baseTextLayer = layers.find((l) => l.type === "text") as
    | TextLayer
    | undefined;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    fontFamily: baseTextLayer?.fontFamily || "Inter",
    fontSize: `${baseTextLayer?.fontSize || 32}px`,
    fontWeight: "bold", // Most designs are bold
    textAlign: "center", // Default to center
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // Find the base text layer to render (it must be part of the stack)
  const baseText =
    layers.find((l): l is TextLayer => l.type === "text") ||
    (layers[0] as TextLayer);
  if (!baseText) return null; // No layers, render nothing

  return (
    <div style={containerStyle}>
      {/* Invisible spacer to define the size */}
      <span
        style={{
          ...getLayerStyle(baseText),
          position: "relative",
          visibility: "hidden",
        }}
      >
        {text}
      </span>

      {/* Render all layers, absolutely positioned */}
      {layers.map((layer, index) => (
        <div key={index} style={getLayerStyle(layer)}>
          {text}
        </div>
      ))}
    </div>
  );
};
