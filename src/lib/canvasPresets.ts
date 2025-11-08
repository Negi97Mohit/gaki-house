// src/lib/canvasPresets.ts
import { CanvasPreset } from "@/types/canvasPreset";

export const CANVAS_PRESETS: CanvasPreset[] = [
  {
    id: "vogue-frame-noir",
    name: "Vogue Frame Noir",
    styleTags: ["fashion", "minimal", "luxury", "editorial"],
    background: {
      blankCanvasColor: "#0A0A0A",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 35, height: 60 },
      pipBorder: { color: "#D4AF37", width: 3 },
      pipShadow: { blur: 25, color: "rgba(212, 175, 55, 0.4)" },
      responsive: {
        mobile: {
          pipPosition: { x: 50, y: 55 },
          pipSize: { width: 70, height: 75 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "EDITORIAL",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 64,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textShadow: "0px 4px 12px rgba(0,0,0,0.6)",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 12 },
          size: { width: 80, height: 8 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 48 },
            layout: {
              position: { x: 50, y: 8 },
              size: { width: 90, height: 10 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "brightness(1.05) contrast(1.1)",
      isBeautifyEnabled: true,
    },
  },
  {
    id: "cinematic-gradient-split",
    name: "Cinematic Gradient Split",
    styleTags: ["cinematic", "dramatic", "split", "modern"],
    background: {
      blankCanvasColor:
        "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)",
      backgroundEffect: "blur",
    },
    pip: {
      layoutMode: "split-vertical",
      cameraShape: "rectangle",
      splitRatio: 0.6,
      pipBorder: { color: "rgba(255,255,255,0.2)", width: 2 },
      responsive: {
        mobile: {
          layoutMode: "pip",
          pipPosition: { x: 50, y: 60 },
          pipSize: { width: 85, height: 50 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "CINEMATIC\nMOMENT",
        style: {
          fontFamily: "Montserrat",
          fontSize: 56,
          color: "#FFFFFF",
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(10px)",
          textAlign: "left",
          textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
        },
        layout: {
          position: { x: 25, y: 50 },
          size: { width: 35, height: 15 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 36, textAlign: "center" },
            layout: {
              position: { x: 50, y: 15 },
              size: { width: 85, height: 12 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.15) saturate(1.2)",
      isNeonEdgeEnabled: false,
    },
  },
  {
    id: "soft-pastel-focus",
    name: "Soft Pastel Focus",
    styleTags: ["lifestyle", "soft", "minimal", "clean"],
    background: {
      blankCanvasColor: "#FFF5F7",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "circle",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 40, height: 40 },
      pipBorder: { color: "#FFB6C1", width: 4 },
      pipShadow: { blur: 30, color: "rgba(255, 182, 193, 0.5)" },
      responsive: {
        mobile: {
          pipSize: { width: 75, height: 75 },
          pipPosition: { x: 50, y: 45 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "gentle moments",
        style: {
          fontFamily: "Quicksand",
          fontSize: 42,
          color: "#8B6F8E",
          backgroundColor: "transparent",
          textAlign: "center",
          textShadow: "0px 2px 6px rgba(139, 111, 142, 0.2)",
        },
        layout: {
          position: { x: 50, y: 88 },
          size: { width: 60, height: 8 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 32 },
            layout: {
              position: { x: 50, y: 90 },
              size: { width: 80, height: 7 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "brightness(1.1) saturate(0.9)",
      isBeautifyEnabled: true,
    },
  },
  {
    id: "editorial-left-bar",
    name: "Editorial Left Bar",
    styleTags: ["editorial", "modern", "asymmetric", "bold"],
    background: {
      blankCanvasColor: "#F8F8F8",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "split-vertical",
      cameraShape: "rectangle",
      splitRatio: 0.35,
      pipBorder: { color: "#000000", width: 1 },
      responsive: {
        mobile: {
          layoutMode: "pip",
          pipPosition: { x: 50, y: 65 },
          pipSize: { width: 90, height: 55 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "MODERN\nDESIGN",
        style: {
          fontFamily: "Helvetica",
          fontSize: 52,
          color: "#000000",
          backgroundColor: "transparent",
          textAlign: "left",
          fontWeight: "900",
        },
        layout: {
          position: { x: 68, y: 30 },
          size: { width: 50, height: 15 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 38, textAlign: "center" },
            layout: {
              position: { x: 50, y: 12 },
              size: { width: 85, height: 12 },
            },
          },
        },
      },
      {
        id: "preset-text-subtitle",
        content: "Minimalist aesthetics for modern storytelling",
        style: {
          fontFamily: "Helvetica",
          fontSize: 18,
          color: "#666666",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 68, y: 42 },
          size: { width: 45, height: 6 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            layout: {
              position: { x: 50, y: 20 },
              size: { width: 80, height: 5 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "none",
    },
  },
  {
    id: "tech-blue-circuit",
    name: "Tech Blue Circuit",
    styleTags: ["tech", "futuristic", "neon", "cyberpunk"],
    background: {
      blankCanvasColor: "#0A0E27",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 70, y: 50 },
      pipSize: { width: 38, height: 55 },
      pipBorder: { color: "#00D9FF", width: 3 },
      pipShadow: { blur: 35, color: "rgba(0, 217, 255, 0.6)" },
      responsive: {
        mobile: {
          pipPosition: { x: 50, y: 55 },
          pipSize: { width: 80, height: 65 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "TECH\nVISION",
        style: {
          fontFamily: "Orbitron",
          fontSize: 58,
          color: "#00D9FF",
          backgroundColor: "rgba(0, 217, 255, 0.05)",
          border: "2px solid #00D9FF",
          backdropFilter: "blur(5px)",
          textAlign: "left",
          textShadow: "0px 0px 20px rgba(0, 217, 255, 0.8)",
        },
        layout: {
          position: { x: 25, y: 50 },
          size: { width: 35, height: 18 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 44, textAlign: "center" },
            layout: {
              position: { x: 50, y: 15 },
              size: { width: 85, height: 15 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.2) saturate(1.3) brightness(0.95)",
      isNeonEdgeEnabled: true,
      neonColor: "cyan",
      neonIntensity: 35,
    },
  },
  {
    id: "lifestyle-glow-center",
    name: "Lifestyle Glow Center",
    styleTags: ["lifestyle", "warm", "inviting", "centered"],
    background: {
      blankCanvasColor: "#FFEFD5",
      backgroundEffect: "blur",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rounded",
      pipPosition: { x: 50, y: 45 },
      pipSize: { width: 50, height: 60 },
      pipBorder: { color: "#FFD700", width: 4 },
      pipShadow: { blur: 40, color: "rgba(255, 215, 0, 0.4)" },
      responsive: {
        mobile: {
          pipSize: { width: 85, height: 70 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "Live Your Story",
        style: {
          fontFamily: "Lora",
          fontSize: 46,
          color: "#8B4513",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(8px)",
          textAlign: "center",
          textShadow: "0px 2px 4px rgba(139, 69, 19, 0.2)",
        },
        layout: {
          position: { x: 50, y: 90 },
          size: { width: 70, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 34 },
            layout: { size: { width: 85, height: 8 } },
          },
        },
      },
    ],
    effects: {
      videoFilter: "brightness(1.08) saturate(1.15) sepia(0.1)",
      isBeautifyEnabled: true,
    },
  },
  {
    id: "luxury-gold-accent",
    name: "Luxury Gold Accent",
    styleTags: ["luxury", "premium", "elegant", "gold"],
    background: {
      blankCanvasColor: "#1A1A1A",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 65, y: 50 },
      pipSize: { width: 42, height: 58 },
      pipBorder: { color: "#FFD700", width: 5 },
      pipShadow: { blur: 30, color: "rgba(255, 215, 0, 0.5)" },
      responsive: {
        mobile: {
          pipPosition: { x: 50, y: 50 },
          pipSize: { width: 80, height: 70 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "PRESTIGE",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 68,
          color: "#FFD700",
          backgroundColor: "transparent",
          textAlign: "left",
          textShadow: "0px 4px 15px rgba(255, 215, 0, 0.6)",
        },
        layout: {
          position: { x: 22, y: 35 },
          size: { width: 40, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 48, textAlign: "center" },
            layout: {
              position: { x: 50, y: 12 },
              size: { width: 85, height: 10 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "brightness(1.05) contrast(1.1)",
      isBeautifyEnabled: true,
    },
  },
  {
    id: "minimal-white-space",
    name: "Minimal White Space",
    styleTags: ["minimal", "clean", "modern", "spacious"],
    background: {
      blankCanvasColor: "#FFFFFF",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 45, height: 50 },
      pipBorder: { color: "#000000", width: 1 },
      pipShadow: { blur: 20, color: "rgba(0, 0, 0, 0.1)" },
      responsive: {
        mobile: {
          pipSize: { width: 85, height: 60 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "SIMPLICITY",
        style: {
          fontFamily: "Inter",
          fontSize: 48,
          color: "#000000",
          backgroundColor: "transparent",
          textAlign: "center",
          fontWeight: "300",
        },
        layout: {
          position: { x: 50, y: 10 },
          size: { width: 60, height: 8 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 36 },
            layout: { size: { width: 80, height: 7 } },
          },
        },
      },
    ],
    effects: {
      videoFilter: "none",
    },
  },
  {
    id: "neon-magenta-pulse",
    name: "Neon Magenta Pulse",
    styleTags: ["neon", "vibrant", "cyberpunk", "energetic"],
    background: {
      blankCanvasColor: "#0D0221",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rounded",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 40, height: 55 },
      pipBorder: { color: "#FF006E", width: 4 },
      pipShadow: { blur: 45, color: "rgba(255, 0, 110, 0.7)" },
      responsive: {
        mobile: {
          pipSize: { width: 80, height: 70 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "NEON\nPULSE",
        style: {
          fontFamily: "Rajdhani",
          fontSize: 62,
          color: "#FF006E",
          backgroundColor: "rgba(255, 0, 110, 0.08)",
          border: "3px solid #FF006E",
          textAlign: "center",
          textShadow: "0px 0px 25px rgba(255, 0, 110, 0.9)",
        },
        layout: {
          position: { x: 50, y: 15 },
          size: { width: 40, height: 16 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 48 },
            layout: { size: { width: 70, height: 14 } },
          },
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.25) saturate(1.4)",
      isNeonEdgeEnabled: true,
      neonColor: "magenta",
      neonIntensity: 40,
    },
  },
  {
    id: "natural-earth-tone",
    name: "Natural Earth Tone",
    styleTags: ["natural", "organic", "warm", "earthy"],
    background: {
      blankCanvasColor: "#8B7355",
      backgroundEffect: "blur",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "circle",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 45, height: 45 },
      pipBorder: { color: "#F4E8C1", width: 5 },
      pipShadow: { blur: 35, color: "rgba(139, 115, 85, 0.5)" },
      responsive: {
        mobile: {
          pipSize: { width: 70, height: 70 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "organic moments",
        style: {
          fontFamily: "Merriweather",
          fontSize: 44,
          color: "#F4E8C1",
          backgroundColor: "rgba(139, 115, 85, 0.6)",
          backdropFilter: "blur(6px)",
          textAlign: "center",
          textShadow: "0px 2px 8px rgba(0, 0, 0, 0.4)",
        },
        layout: {
          position: { x: 50, y: 88 },
          size: { width: 65, height: 9 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 34 },
            layout: { size: { width: 85, height: 8 } },
          },
        },
      },
    ],
    effects: {
      videoFilter: "sepia(0.3) brightness(1.05) saturate(0.9)",
    },
  },
  {
    id: "asymmetric-diagonal",
    name: "Asymmetric Diagonal",
    styleTags: ["modern", "asymmetric", "dynamic", "bold"],
    background: {
      blankCanvasColor: "#2C2C2C",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 35, y: 60 },
      pipSize: { width: 42, height: 48 },
      pipBorder: { color: "#FFFFFF", width: 2 },
      pipShadow: { blur: 25, color: "rgba(255, 255, 255, 0.2)" },
      responsive: {
        mobile: {
          pipPosition: { x: 50, y: 55 },
          pipSize: { width: 85, height: 60 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "DYNAMIC",
        style: {
          fontFamily: "Anton",
          fontSize: 72,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "right",
          textShadow: "3px 3px 0px #FF3366",
        },
        layout: {
          position: { x: 70, y: 25 },
          size: { width: 50, height: 12 },
          zIndex: 15,
          rotation: -5,
        },
        responsive: {
          mobile: {
            style: { fontSize: 52, textAlign: "center" },
            layout: {
              position: { x: 50, y: 12 },
              size: { width: 85, height: 10 },
              rotation: 0,
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.15)",
    },
  },
  {
    id: "retro-vhs-aesthetic",
    name: "Retro VHS Aesthetic",
    styleTags: ["retro", "vintage", "nostalgic", "80s"],
    background: {
      blankCanvasColor: "#1A0F2E",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 50, height: 58 },
      pipBorder: { color: "#FF6B9D", width: 3 },
      pipShadow: { blur: 20, color: "rgba(255, 107, 157, 0.4)" },
      responsive: {
        mobile: {
          pipSize: { width: 88, height: 68 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "RETRO\nWAVE",
        style: {
          fontFamily: "Press Start 2P",
          fontSize: 38,
          color: "#00FFFF",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          border: "2px solid #FF6B9D",
          textAlign: "center",
          textShadow: "2px 2px 0px #FF6B9D, 4px 4px 0px #00FFFF",
        },
        layout: {
          position: { x: 50, y: 10 },
          size: { width: 45, height: 14 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 28 },
            layout: { size: { width: 75, height: 12 } },
          },
        },
      },
    ],
    effects: {
      videoFilter: "saturate(1.5) hue-rotate(10deg) brightness(0.9)",
    },
  },
  {
    id: "corporate-split-screen",
    name: "Corporate Split Screen",
    styleTags: ["corporate", "professional", "clean", "business"],
    background: {
      blankCanvasColor: "#F0F4F8",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "split-horizontal",
      cameraShape: "rectangle",
      splitRatio: 0.55,
      pipBorder: { color: "#2563EB", width: 2 },
      responsive: {
        mobile: {
          layoutMode: "pip",
          pipPosition: { x: 50, y: 60 },
          pipSize: { width: 90, height: 50 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "PROFESSIONAL\nPRESENTATION",
        style: {
          fontFamily: "Roboto",
          fontSize: 38,
          color: "#1E3A8A",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          border: "1px solid #2563EB",
          textAlign: "center",
          fontWeight: "700",
        },
        layout: {
          position: { x: 50, y: 25 },
          size: { width: 85, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 28 },
            layout: {
              position: { x: 50, y: 15 },
              size: { width: 90, height: 10 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "brightness(1.03) contrast(1.05)",
    },
  },
  {
    id: "artistic-frame-gallery",
    name: "Artistic Frame Gallery",
    styleTags: ["artistic", "creative", "gallery", "elegant"],
    background: {
      blankCanvasColor: "#E8DDD3",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 48, height: 62 },
      pipBorder: { color: "#3E2723", width: 8 },
      pipShadow: { blur: 30, color: "rgba(62, 39, 35, 0.4)" },
      responsive: {
        mobile: {
          pipSize: { width: 82, height: 75 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "gallery space",
        style: {
          fontFamily: "Cormorant Garamond",
          fontSize: 52,
          color: "#3E2723",
          backgroundColor: "transparent",
          textAlign: "center",
          fontWeight: "400",
          textShadow: "0px 1px 2px rgba(62, 39, 35, 0.2)",
        },
        layout: {
          position: { x: 50, y: 8 },
          size: { width: 60, height: 8 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 40 },
            layout: { size: { width: 80, height: 7 } },
          },
        },
      },
    ],
    effects: {
      videoFilter: "sepia(0.15) brightness(1.05)",
    },
  },
  {
    id: "dark-mode-centered",
    name: "Dark Mode Centered",
    styleTags: ["dark", "modern", "minimal", "centered"],
    background: {
      blankCanvasColor: "#000000",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rounded",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 55, height: 65 },
      pipBorder: { color: "#FFFFFF", width: 1 },
      pipShadow: { blur: 40, color: "rgba(255, 255, 255, 0.15)" },
      responsive: {
        mobile: {
          pipSize: { width: 90, height: 80 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "FOCUS",
        style: {
          fontFamily: "Space Grotesk",
          fontSize: 56,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
          fontWeight: "700",
          textShadow: "0px 4px 12px rgba(255, 255, 255, 0.3)",
        },
        layout: {
          position: { x: 50, y: 12 },
          size: { width: 50, height: 9 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 42 },
            layout: { size: { width: 70, height: 8 } },
          },
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.1)",
    },
  },
  {
    id: "gradient-overlay-modern",
    name: "Gradient Overlay Modern",
    styleTags: ["gradient", "modern", "vibrant", "overlay"],
    background: {
      blankCanvasColor:
        "linear-gradient(to bottom right, #667eea 0%, #764ba2 100%)",
      backgroundEffect: "blur",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 52, height: 58 },
      pipBorder: { color: "rgba(255, 255, 255, 0.3)", width: 2 },
      pipShadow: { blur: 35, color: "rgba(0, 0, 0, 0.3)" },
      responsive: {
        mobile: {
          pipSize: { width: 85, height: 70 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "VIBRANT",
        style: {
          fontFamily: "Poppins",
          fontSize: 64,
          color: "#FFFFFF",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(10px)",
          border: "2px solid rgba(255, 255, 255, 0.4)",
          textAlign: "center",
          fontWeight: "800",
          textShadow: "0px 4px 16px rgba(0, 0, 0, 0.5)",
        },
        layout: {
          position: { x: 50, y: 10 },
          size: { width: 60, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 48 },
            layout: { size: { width: 80, height: 9 } },
          },
        },
      },
    ],
    effects: {
      videoFilter: "saturate(1.2) brightness(1.05)",
    },
  },
  {
    id: "podcast-interview-setup",
    name: "Podcast Interview Setup",
    styleTags: ["podcast", "interview", "professional", "warm"],
    background: {
      blankCanvasColor: "#2D1B1B",
      backgroundEffect: "blur",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "circle",
      pipPosition: { x: 30, y: 50 },
      pipSize: { width: 35, height: 35 },
      pipBorder: { color: "#D4A574", width: 4 },
      pipShadow: { blur: 30, color: "rgba(212, 165, 116, 0.4)" },
      responsive: {
        mobile: {
          pipPosition: { x: 50, y: 40 },
          pipSize: { width: 65, height: 65 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "IN CONVERSATION",
        style: {
          fontFamily: "Libre Baskerville",
          fontSize: 42,
          color: "#D4A574",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)",
          textAlign: "left",
          fontWeight: "700",
        },
        layout: {
          position: { x: 65, y: 35 },
          size: { width: 50, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 32, textAlign: "center" },
            layout: {
              position: { x: 50, y: 75 },
              size: { width: 85, height: 9 },
            },
          },
        },
      },
      {
        id: "preset-text-subtitle",
        content: "Deep discussions, authentic stories",
        style: {
          fontFamily: "Libre Baskerville",
          fontSize: 18,
          color: "#D4A574",
          backgroundColor: "transparent",
          textAlign: "left",
          fontWeight: "400",
        },
        layout: {
          position: { x: 65, y: 42 },
          size: { width: 45, height: 5 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { textAlign: "center" },
            layout: {
              position: { x: 50, y: 82 },
              size: { width: 80, height: 4 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "brightness(1.05) contrast(1.08) saturate(0.95)",
    },
  },
  {
    id: "fashion-runway-vertical",
    name: "Fashion Runway Vertical",
    styleTags: ["fashion", "vertical", "elegant", "runway"],
    background: {
      blankCanvasColor: "#F5F5F5",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 32, height: 72 },
      pipBorder: { color: "#000000", width: 2 },
      pipShadow: { blur: 25, color: "rgba(0, 0, 0, 0.2)" },
      responsive: {
        mobile: {
          pipSize: { width: 75, height: 80 },
          pipPosition: { x: 50, y: 50 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "RUNWAY",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 58,
          color: "#000000",
          backgroundColor: "transparent",
          textAlign: "center",
          fontWeight: "400",
        },
        layout: {
          position: { x: 50, y: 10 },
          size: { width: 50, height: 8 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 44 },
            layout: { size: { width: 70, height: 7 } },
          },
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.12) brightness(1.03)",
      isBeautifyEnabled: true,
    },
  },
  {
    id: "gaming-stream-overlay",
    name: "Gaming Stream Overlay",
    styleTags: ["gaming", "stream", "energetic", "neon"],
    background: {
      blankCanvasColor: "#1A0033",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rounded",
      pipPosition: { x: 15, y: 15 },
      pipSize: { width: 22, height: 28 },
      pipBorder: { color: "#00FF88", width: 3 },
      pipShadow: { blur: 35, color: "rgba(0, 255, 136, 0.6)" },
      responsive: {
        mobile: {
          pipPosition: { x: 50, y: 20 },
          pipSize: { width: 45, height: 50 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "LIVE",
        style: {
          fontFamily: "Oswald",
          fontSize: 68,
          color: "#00FF88",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          border: "3px solid #00FF88",
          backdropFilter: "blur(5px)",
          textAlign: "center",
          fontWeight: "700",
          textShadow: "0px 0px 20px rgba(0, 255, 136, 0.8)",
        },
        layout: {
          position: { x: 70, y: 85 },
          size: { width: 35, height: 12 },
          zIndex: 15,
          rotation: -3,
        },
        responsive: {
          mobile: {
            style: { fontSize: 48 },
            layout: {
              position: { x: 50, y: 75 },
              size: { width: 60, height: 10 },
              rotation: 0,
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.2) saturate(1.35)",
      isNeonEdgeEnabled: true,
      neonColor: "green",
      neonIntensity: 30,
    },
  },
  {
    id: "minimalist-top-corner",
    name: "Minimalist Top Corner",
    styleTags: ["minimal", "corner", "subtle", "modern"],
    background: {
      blankCanvasColor: "#FAFAFA",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "circle",
      pipPosition: { x: 85, y: 15 },
      pipSize: { width: 18, height: 18 },
      pipBorder: { color: "#666666", width: 2 },
      pipShadow: { blur: 15, color: "rgba(0, 0, 0, 0.15)" },
      responsive: {
        mobile: {
          pipPosition: { x: 50, y: 20 },
          pipSize: { width: 40, height: 40 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "PRESENTER",
        style: {
          fontFamily: "Inter",
          fontSize: 52,
          color: "#333333",
          backgroundColor: "transparent",
          textAlign: "left",
          fontWeight: "600",
        },
        layout: {
          position: { x: 25, y: 50 },
          size: { width: 50, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 38, textAlign: "center" },
            layout: {
              position: { x: 50, y: 60 },
              size: { width: 85, height: 9 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "brightness(1.02)",
    },
  },
  {
    id: "colorful-pop-art",
    name: "Colorful Pop Art",
    styleTags: ["colorful", "pop-art", "vibrant", "playful"],
    background: {
      blankCanvasColor: "#FFE66D",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 46, height: 54 },
      pipBorder: { color: "#4ECDC4", width: 6 },
      pipShadow: { blur: 0, color: "rgba(0, 0, 0, 0)" },
      responsive: {
        mobile: {
          pipSize: { width: 82, height: 68 },
        },
      },
    },
    textOverlays: [
      {
        id: "preset-text-title",
        content: "POP!",
        style: {
          fontFamily: "Fredoka One",
          fontSize: 78,
          color: "#FF6B6B",
          backgroundColor: "#4ECDC4",
          border: "4px solid #000000",
          textAlign: "center",
          textShadow: "4px 4px 0px #000000",
        },
        layout: {
          position: { x: 50, y: 12 },
          size: { width: 35, height: 12 },
          zIndex: 15,
          rotation: -2,
        },
        responsive: {
          mobile: {
            style: { fontSize: 58 },
            layout: { size: { width: 55, height: 10 }, rotation: 0 },
          },
        },
      },
    ],
    effects: {
      videoFilter: "saturate(1.4) contrast(1.2)",
    },
  },
  {
    id: "modern-geometric-grid",
    name: "Modern Geometric Grid",
    styleTags: ["modern", "grid", "geometric", "professional"],
    background: {
      blankCanvasColor: "#0F172A",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 25, y: 50 },
      pipSize: { width: 38, height: 48 },
      pipBorder: { color: "#6366F1", width: 2 },
      pipShadow: { blur: 20, color: "rgba(99, 102, 241, 0.3)" },
      responsive: {
        mobile: {
          layoutMode: "pip",
          pipPosition: { x: 50, y: 60 },
          pipSize: { width: 70, height: 50 },
        },
      },
    },
    textOverlays: [
      {
        id: "grid-title",
        content: "MODERN\nGRID",
        style: {
          fontFamily: "Inter",
          fontSize: 42,
          color: "#E2E8F0",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          border: "1px solid #6366F1",
          textAlign: "center",
          fontWeight: "700",
        },
        layout: {
          position: { x: 75, y: 30 },
          size: { width: 30, height: 15 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 32 },
            layout: {
              position: { x: 50, y: 15 },
              size: { width: 70, height: 12 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.1) saturate(1.05)",
    },
  },
  {
    id: "gradient-morph-overlay",
    name: "Gradient Morph Overlay",
    styleTags: ["gradient", "overlay", "vibrant", "modern"],
    background: {
      blankCanvasColor: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
      backgroundEffect: "blur",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rounded",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 60, height: 70 },
      pipBorder: { color: "rgba(255,255,255,0.3)", width: 1 },
      pipShadow: { blur: 40, color: "rgba(0,0,0,0.2)" },
      responsive: {
        mobile: {
          pipSize: { width: 85, height: 60 },
        },
      },
    },
    textOverlays: [
      {
        id: "morph-title",
        content: "CREATIVE\nSPACE",
        style: {
          fontFamily: "Poppins",
          fontSize: 56,
          color: "#FFFFFF",
          backgroundColor: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          textAlign: "center",
          fontWeight: "800",
          textShadow: "0 2px 10px rgba(0,0,0,0.3)",
        },
        layout: {
          position: { x: 50, y: 20 },
          size: { width: 70, height: 12 },
          zIndex: 25,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 42 },
            layout: {
              size: { width: 85, height: 10 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "brightness(1.05) saturate(1.1)",
      isBeautifyEnabled: true,
    },
  },
  {
    id: "minimal-corner-floating",
    name: "Minimal Corner Floating",
    styleTags: ["minimal", "corner", "floating", "clean"],
    background: {
      blankCanvasColor: "#F8FAFC",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "circle",
      pipPosition: { x: 85, y: 20 },
      pipSize: { width: 15, height: 15 },
      pipBorder: { color: "#475569", width: 2 },
      pipShadow: { blur: 15, color: "rgba(71, 85, 105, 0.2)" },
      responsive: {
        mobile: {
          pipPosition: { x: 50, y: 25 },
          pipSize: { width: 40, height: 40 },
        },
      },
    },
    textOverlays: [
      {
        id: "corner-subtitle",
        content: "Live Presentation",
        style: {
          fontFamily: "Inter",
          fontSize: 14,
          color: "#475569",
          backgroundColor: "transparent",
          textAlign: "right",
          fontWeight: "500",
        },
        layout: {
          position: { x: 85, y: 35 },
          size: { width: 25, height: 5 },
          zIndex: 15,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 12, textAlign: "center" },
            layout: {
              position: { x: 50, y: 40 },
              size: { width: 60, height: 4 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "none",
    },
  },
  {
    id: "bold-diagonal-split",
    name: "Bold Diagonal Split",
    styleTags: ["bold", "diagonal", "dynamic", "modern"],
    background: {
      blankCanvasColor: "#1E293B",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 70, y: 30 },
      pipSize: { width: 50, height: 60 },
      pipBorder: { color: "#F59E0B", width: 3 },
      pipShadow: { blur: 25, color: "rgba(245, 158, 11, 0.3)" },
      responsive: {
        mobile: {
          layoutMode: "pip",
          pipPosition: { x: 50, y: 50 },
          pipSize: { width: 80, height: 60 },
        },
      },
    },
    textOverlays: [
      {
        id: "diagonal-title",
        content: "DYNAMIC\nANGLE",
        style: {
          fontFamily: "Anton",
          fontSize: 64,
          color: "#F59E0B",
          backgroundColor: "transparent",
          textAlign: "left",
          fontWeight: "400",
          textShadow: "2px 2px 0px #1E293B",
        },
        layout: {
          position: { x: 20, y: 60 },
          size: { width: 40, height: 15 },
          zIndex: 15,
          rotation: -5,
        },
        responsive: {
          mobile: {
            style: { fontSize: 48, textAlign: "center" },
            layout: {
              position: { x: 50, y: 15 },
              size: { width: 80, height: 12 },
              rotation: 0,
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.15) brightness(1.05)",
    },
  },
  {
    id: "glass-morphism-elegant",
    name: "Glass Morphism Elegant",
    styleTags: ["glass", "modern", "elegant", "frosted"],
    background: {
      blankCanvasColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      backgroundEffect: "blur",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rounded",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 45, height: 55 },
      pipBorder: { color: "rgba(255,255,255,0.5)", width: 1 },
      pipShadow: { blur: 30, color: "rgba(255,255,255,0.1)" },
      responsive: {
        mobile: {
          pipSize: { width: 80, height: 65 },
        },
      },
    },
    textOverlays: [
      {
        id: "glass-title",
        content: "FROSTED\nELEGANCE",
        style: {
          fontFamily: "Inter",
          fontSize: 48,
          color: "#FFFFFF",
          backgroundColor: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.2)",
          textAlign: "center",
          fontWeight: "600",
          textShadow: "0 2px 8px rgba(0,0,0,0.2)",
        },
        layout: {
          position: { x: 50, y: 15 },
          size: { width: 60, height: 12 },
          zIndex: 20,
          rotation: 0,
        },
        responsive: {
          mobile: {
            style: { fontSize: 36 },
            layout: {
              size: { width: 80, height: 10 },
            },
          },
        },
      },
    ],
    effects: {
      videoFilter: "brightness(1.08) contrast(1.05)",
      isBeautifyEnabled: true,
    },
  }, // <-- Add comma here // <-- ADD THIS COMMA
  // ============================================
  // MAGAZINE COVER INSPIRED PRESETS (20 NEW)
  // ============================================

  // 1. Spencer Magazine (Elegant Serif)
  {
    id: "spencer-magazine",
    name: "Spencer Magazine",
    styleTags: ["magazine", "elegant", "serif", "luxury"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#1A1A1A",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 85, height: 85 },
      pipBorder: { color: "#D4AF37", width: 4 },
      pipShadow: { blur: 30, color: "rgba(212, 175, 55, 0.3)" },
    },
    textOverlays: [
      {
        id: "spencer-issue",
        content: "ISSUE 10",
        style: {
          fontFamily: "Inter",
          fontSize: 12,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 8 },
          size: { width: 80, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "spencer-title",
        content: "SPENCER",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 84,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 15 },
          size: { width: 80, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "spencer-subtitle",
        content: "MAGAZINE",
        style: {
          fontFamily: "Inter",
          fontSize: 14,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 24 },
          size: { width: 80, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "spencer-feature",
        content: "FRESH<br>SUMMER<br>FASHION",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 52,
          color: "#D4AF37",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 18, y: 78 },
          size: { width: 60, height: 18 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "grayscale(1) contrast(1.2)",
    },
  },

  // 13. Reset Miller (Soft Editorial)
  {
    id: "reset-miller",
    name: "Reset Miller",
    styleTags: ["magazine", "soft", "editorial", "feminine"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#C4B5A0",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 85, height: 85 },
    },
    textOverlays: [
      {
        id: "rm-faucet",
        content: "FAUCET",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 82,
          color: "#F5F0E8",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 12 },
          size: { width: 80, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "rm-trends",
        content: "SUMMER TRENDS",
        style: {
          fontFamily: "Inter",
          fontSize: 14,
          color: "#F5F0E8",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 20 },
          size: { width: 80, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "rm-name",
        content: "RESET MILLER",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 56,
          color: "#F5F0E8",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 85 },
          size: { width: 80, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "sepia(0.15) brightness(1.05)",
    },
  },

  // 14. April Fashion (Minimalist Black & White)
  {
    id: "april-fashion",
    name: "April Fashion",
    styleTags: ["magazine", "minimal", "bw", "clean"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#FFFFFF",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 85, height: 85 },
      pipBorder: { color: "#000000", width: 1 },
    },
    textOverlays: [
      {
        id: "april-issue",
        content: "#12 — 03/03/2025 — #12",
        style: {
          fontFamily: "Inter",
          fontSize: 11,
          color: "#666666",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 8 },
          size: { width: 80, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "april-title",
        content: "APRIL",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 92,
          color: "#000000",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 14 },
          size: { width: 80, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "april-interview",
        content: "Interview with<br>Olivia Wilson",
        style: {
          fontFamily: "Inter",
          fontSize: 16,
          color: "#333333",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 23 },
          size: { width: 70, height: 6 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "grayscale(1) contrast(1.1)",
    },
  },

  // 15. Volume 17 (Bold Number)
  {
    id: "volume-seventeen",
    name: "Volume 17",
    styleTags: ["magazine", "bold", "number", "fashion"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#1A1A1A",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 88, height: 88 },
    },
    textOverlays: [
      {
        id: "v17-fashion",
        content: "FASHION",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 68,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 12 },
          size: { width: 80, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "v17-mag",
        content: "MAGAZINE COVER",
        style: {
          fontFamily: "Inter",
          fontSize: 14,
          color: "#AAAAAA",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 19 },
          size: { width: 80, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "v17-volume",
        content: "VOLUME<br>17",
        style: {
          fontFamily: "Anton",
          fontSize: 72,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "right",
        },
        layout: {
          position: { x: 75, y: 20 },
          size: { width: 40, height: 15 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.15)",
    },
  },

  // 16. Adora Montminy (Sidebar Layout)
  {
    id: "adora-sidebar",
    name: "Adora Sidebar",
    styleTags: ["magazine", "sidebar", "modern", "editorial"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#1A1A1A",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 60, y: 50 },
      pipSize: { width: 65, height: 75 },
    },
    textOverlays: [
      {
        id: "adora-fashion",
        content: "FASHION",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 52,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 18, y: 15 },
          size: { width: 30, height: 8 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "adora-magazine",
        content: "MAGAZINE",
        style: {
          fontFamily: "Inter",
          fontSize: 12,
          color: "#AAAAAA",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 18, y: 21 },
          size: { width: 30, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "adora-name",
        content: "ADORA<br>MONTMINY",
        style: {
          fontFamily: "Anton",
          fontSize: 38,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 18, y: 78 },
          size: { width: 30, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.1)",
    },
  },

  // 17. Woman Lifestyle (Warm Golden)
  {
    id: "woman-lifestyle",
    name: "Woman Lifestyle",
    styleTags: ["magazine", "lifestyle", "warm", "beauty"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#3A3530",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 88, height: 88 },
    },
    textOverlays: [
      {
        id: "wl-beauty",
        content: "BEAUTY",
        style: {
          fontFamily: "Anton",
          fontSize: 86,
          color: "#FFD700",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 14 },
          size: { width: 80, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "wl-sub",
        content: "WOMAN<br>LIFESTYLE",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 42,
          color: "#FFD700",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 80 },
          size: { width: 70, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "saturate(1.15) brightness(1.05)",
    },
  },

  // 18. 10 Trends (Number Focus)
  {
    id: "ten-trends",
    name: "10 Trends",
    styleTags: ["magazine", "trends", "bold", "modern"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#2A2420",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 85, height: 85 },
      pipBorder: { color: "#FFFFFF", width: 1 },
    },
    textOverlays: [
      {
        id: "tt-larana",
        content: "LARANA",
        style: {
          fontFamily: "Anton",
          fontSize: 68,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "right",
        },
        layout: {
          position: { x: 75, y: 10 },
          size: { width: 40, height: 8 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "tt-fashion",
        content: "FASHION MAGAZINE",
        style: {
          fontFamily: "Inter",
          fontSize: 12,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "right",
        },
        layout: {
          position: { x: 75, y: 16 },
          size: { width: 40, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "tt-ten",
        content: "10",
        style: {
          fontFamily: "Anton",
          fontSize: 112,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "right",
        },
        layout: {
          position: { x: 82, y: 19 },
          size: { width: 30, height: 14 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "tt-trends",
        content: "FASHION<br>TRENDS IN<br>2024",
        style: {
          fontFamily: "Inter",
          fontSize: 13,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "right",
        },
        layout: {
          position: { x: 78, y: 30 },
          size: { width: 35, height: 8 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.1)",
    },
  },

  // 19. Classic Barcode (Professional)
  {
    id: "classic-barcode",
    name: "Classic Barcode",
    styleTags: ["magazine", "professional", "classic", "barcode"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#F5F5F5",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 50 },
      pipSize: { width: 88, height: 80 },
    },
    textOverlays: [
      {
        id: "cb-title",
        content: "FASHION",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 76,
          color: "#1A1A1A",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 11 },
          size: { width: 80, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "cb-magazine",
        content: "MAGAZINE",
        style: {
          fontFamily: "Inter",
          fontSize: 14,
          color: "#666666",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 18 },
          size: { width: 80, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "cb-barcode",
        content: "|||||||||||||||||||||||",
        style: {
          fontFamily: "Courier New",
          fontSize: 32,
          color: "#1A1A1A",
          backgroundColor: "transparent",
          textAlign: "right",
        },
        layout: {
          position: { x: 75, y: 88 },
          size: { width: 40, height: 5 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "brightness(1.05)",
    },
  },

  // 20. Premium Edition (Gold Accent)
  {
    id: "premium-edition",
    name: "Premium Edition",
    styleTags: ["magazine", "premium", "gold", "luxury"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#0A0A0A",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 88, height: 88 },
      pipBorder: { color: "#D4AF37", width: 3 },
      pipShadow: { blur: 25, color: "rgba(212, 175, 55, 0.4)" },
    },
    textOverlays: [
      {
        id: "pe-premium",
        content: "PREMIUM",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 68,
          color: "#D4AF37",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 12 },
          size: { width: 80, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "pe-edition",
        content: "EDITION",
        style: {
          fontFamily: "Inter",
          fontSize: 16,
          color: "#D4AF37",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 19 },
          size: { width: 80, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "brightness(1.05) contrast(1.1)",
    },
  },

  // 2. Fashion Magazine (Black & White Dramatic)
  {
    id: "fashion-bw-dramatic",
    name: "Fashion B&W Dramatic",
    styleTags: ["magazine", "dramatic", "monochrome", "fashion"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#000000",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 88, height: 88 },
      pipBorder: { color: "#FFFFFF", width: 2 },
    },
    textOverlays: [
      {
        id: "fbw-fashion",
        content: "FASHION",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 88,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 18 },
          size: { width: 85, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "fbw-magazine",
        content: "MAGAZINE",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 88,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 26 },
          size: { width: 85, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "grayscale(1) contrast(1.2)",
    },
  },

  // 3. Larana Blue (Vibrant Color)
  {
    id: "larana-blue",
    name: "Larana Blue",
    styleTags: ["magazine", "vibrant", "colorful", "modern"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#FFF5F7",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 85, height: 85 },
    },
    textOverlays: [
      {
        id: "larana-title",
        content: "LARANA",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 96,
          color: "#4A90E2",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 12 },
          size: { width: 85, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "larana-sub",
        content: "FASHION MAGAZINE",
        style: {
          fontFamily: "Inter",
          fontSize: 14,
          color: "#333333",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 20 },
          size: { width: 85, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "larana-feature",
        content: "Effortless<br>Elegance",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 54,
          color: "#4A90E2",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 18, y: 78 },
          size: { width: 60, height: 16 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "saturate(1.2) brightness(1.1)",
    },
  },

  // 4. Monochrome Grid (4-Photo Layout)
  {
    id: "monochrome-grid",
    name: "Monochrome Grid",
    styleTags: ["magazine", "grid", "monochrome", "editorial"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#000000",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 40 },
      pipSize: { width: 85, height: 45 },
      pipBorder: { color: "#FFFFFF", width: 3 },
    },
    textOverlays: [
      {
        id: "mono-mag",
        content: "LARANA MAGAZINE",
        style: {
          fontFamily: "Inter",
          fontSize: 14,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 8 },
          size: { width: 85, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "mono-title",
        content: "MONOCHROME",
        style: {
          fontFamily: "Anton",
          fontSize: 72,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 14 },
          size: { width: 85, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "mono-date",
        content: "20 JUNE 2025",
        style: {
          fontFamily: "Inter",
          fontSize: 12,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 22 },
          size: { width: 85, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "mono-desc",
        content: "Celebrating the Strength, Grace and Individuality",
        style: {
          fontFamily: "Inter",
          fontSize: 11,
          color: "#CCCCCC",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 70 },
          size: { width: 80, height: 8 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "grayscale(1) contrast(1.15)",
    },
  },

  // 5. Modern Style Tips (Dark Theme)
  {
    id: "modern-style-tips",
    name: "Modern Style Tips",
    styleTags: ["magazine", "modern", "dark", "editorial"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#1A1A1A",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 40 },
      pipSize: { width: 85, height: 50 },
    },
    textOverlays: [
      {
        id: "mst-fashion",
        content: "FASHION",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 64,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 18, y: 10 },
          size: { width: 70, height: 8 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "mst-magazine",
        content: "MAGAZINE",
        style: {
          fontFamily: "Inter",
          fontSize: 16,
          color: "#AAAAAA",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 18, y: 16 },
          size: { width: 70, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "mst-tips",
        content: "MODERN<br>STYLE TIPS",
        style: {
          fontFamily: "Inter",
          fontSize: 18,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 18, y: 20 },
          size: { width: 50, height: 8 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "mst-name",
        content: "ADORA<br>MONTMINY",
        style: {
          fontFamily: "Anton",
          fontSize: 48,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 18, y: 72 },
          size: { width: 70, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.1)",
    },
  },

  // 6. Beauty Magazine (Golden Yellow)
  {
    id: "beauty-golden",
    name: "Beauty Golden",
    styleTags: ["magazine", "beauty", "luxury", "golden"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#2A2A2A",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 88, height: 88 },
    },
    textOverlays: [
      {
        id: "beauty-mag",
        content: "Larana Magazine",
        style: {
          fontFamily: "Inter",
          fontSize: 14,
          color: "#FFD700",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 8 },
          size: { width: 80, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "beauty-title",
        content: "BEAUTY",
        style: {
          fontFamily: "Anton",
          fontSize: 92,
          color: "#FFD700",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 14 },
          size: { width: 80, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "beauty-sub",
        content: "Woman & Lifestyle",
        style: {
          fontFamily: "Inter",
          fontSize: 16,
          color: "#FFD700",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 23 },
          size: { width: 80, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "saturate(1.2) brightness(1.05)",
    },
  },

  // 7. Olivia Wilson (Red Accent)
  {
    id: "olivia-red",
    name: "Olivia Red",
    styleTags: ["magazine", "red", "bold", "fashion"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#2A2420",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 85, height: 85 },
      pipBorder: { color: "#FFFFFF", width: 2 },
    },
    textOverlays: [
      {
        id: "olivia-larana",
        content: "LARANA",
        style: {
          fontFamily: "Anton",
          fontSize: 72,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "right",
        },
        layout: {
          position: { x: 75, y: 12 },
          size: { width: 40, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "olivia-sub",
        content: "FASHION MAGAZINE",
        style: {
          fontFamily: "Inter",
          fontSize: 12,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "right",
        },
        layout: {
          position: { x: 75, y: 19 },
          size: { width: 40, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "olivia-issue",
        content: "10",
        style: {
          fontFamily: "Anton",
          fontSize: 96,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "right",
        },
        layout: {
          position: { x: 82, y: 22 },
          size: { width: 30, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.15) saturate(1.1)",
    },
  },

  // 8. Alabas Nature (Outdoor Editorial)
  {
    id: "alabas-nature",
    name: "Alabas Nature",
    styleTags: ["magazine", "nature", "editorial", "outdoor"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#E8E4DC",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 45 },
      pipSize: { width: 88, height: 70 },
    },
    textOverlays: [
      {
        id: "alabas-title",
        content: "ALABAS",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 88,
          color: "#2A2A2A",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 12 },
          size: { width: 80, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "alabas-sub",
        content: "MAGAZINE",
        style: {
          fontFamily: "Inter",
          fontSize: 14,
          color: "#2A2A2A",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 88 },
          size: { width: 80, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "sepia(0.2) brightness(1.05)",
    },
  },

  // 9. Fashion Best Edition (Luxury Black)
  {
    id: "fashion-best-edition",
    name: "Fashion Best Edition",
    styleTags: ["magazine", "luxury", "black", "premium"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#0A0A0A",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 88, height: 88 },
    },
    textOverlays: [
      {
        id: "fbe-fashion",
        content: "FASHION",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 72,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 12 },
          size: { width: 80, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "fbe-mag",
        content: "MAGAZINE COVER",
        style: {
          fontFamily: "Inter",
          fontSize: 14,
          color: "#AAAAAA",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 19 },
          size: { width: 80, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "fbe-style",
        content: "STYLE",
        style: {
          fontFamily: "Anton",
          fontSize: 96,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
          textShadow: "0 0 20px rgba(255,255,255,0.3)",
        },
        layout: {
          position: { x: 15, y: 50 },
          size: { width: 25, height: 40 },
          zIndex: 15,
          rotation: -90,
        },
      },
    ],
    effects: {
      videoFilter: "contrast(1.2)",
    },
  },

  // 10. Faucet Summer (Beige Minimal)
  {
    id: "faucet-summer",
    name: "Faucet Summer",
    styleTags: ["magazine", "minimal", "summer", "beige"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#B8AEA0",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 55 },
      pipSize: { width: 85, height: 85 },
    },
    textOverlays: [
      {
        id: "faucet-title",
        content: "FAUCET",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 82,
          color: "#F5F0E8",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 12 },
          size: { width: 80, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "faucet-trends",
        content: "SUMMER<br>TRENDS",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 38,
          color: "#F5F0E8",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 18, y: 22 },
          size: { width: 50, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "brightness(1.08) saturate(0.9)",
    },
  },

  // 11. Fashion Magazine Grid (Multi-photo)
  {
    id: "fashion-photo-grid",
    name: "Fashion Photo Grid",
    styleTags: ["magazine", "grid", "modern", "editorial"],
    canvasAspectRatio: "9:16",
    background: {
      blankCanvasColor: "#000000",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "pip",
      cameraShape: "rectangle",
      pipPosition: { x: 50, y: 38 },
      pipSize: { width: 85, height: 42 },
      pipBorder: { color: "#FFFFFF", width: 2 },
    },
    textOverlays: [
      {
        id: "fpg-fashion",
        content: "FASHION",
        style: {
          fontFamily: "Anton",
          fontSize: 78,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 12 },
          size: { width: 80, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "fpg-magazine",
        content: "MAGAZINE",
        style: {
          fontFamily: "Inter",
          fontSize: 16,
          color: "#FFFFFF",
          backgroundColor: "transparent",
          textAlign: "center",
        },
        layout: {
          position: { x: 50, y: 20 },
          size: { width: 80, height: 3 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "grayscale(1) contrast(1.1)",
    },
  },

  // --- ADDED: Magazine Cover (Modern) ---
  {
    id: "modern-fashion-cover",
    name: "Modern Fashion",
    styleTags: ["fashion", "modern", "minimal", "magazine"],
    canvasAspectRatio: "9:16", // Portrait Mode
    background: {
      blankCanvasColor: "#FFFFFF",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "solo", // Use video to fill the whole canvas
      cameraShape: "rectangle",
    },
    textOverlays: [
      {
        id: "mfc-style",
        content: "STYLE",
        style: {
          fontFamily: "Anton",
          fontSize: 88,
          color: "#111111",
          backgroundColor: "transparent",
          textAlign: "left",
          fontWeight: "900",
        },
        layout: {
          position: { x: 18, y: 70 },
          size: { width: 30, height: 10 },
          zIndex: 15,
          rotation: -90,
        },
      },
      {
        id: "mfc-fashion",
        content: "FASHION",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 72,
          color: "#111111",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 60, y: 20 },
          size: { width: 70, height: 10 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "mfc-magazine",
        content: "MAGAZINE COVER",
        style: {
          fontFamily: "Inter",
          fontSize: 14,
          color: "#333333",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 60, y: 28 },
          size: { width: 70, height: 5 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "grayscale(1) contrast(1.1)",
      isBeautifyEnabled: true,
    },
  },
  // --- ADDED: Magazine Cover (Elegant) ---
  {
    id: "elegant-magazine-cover",
    name: "Elegant Magazine",
    styleTags: ["fashion", "elegant", "lifestyle", "magazine"],
    canvasAspectRatio: "9:16", // Portrait Mode
    background: {
      blankCanvasColor: "#FFFFFF",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "solo", // Video fills the canvas
      cameraShape: "rectangle",
    },
    textOverlays: [
      {
        id: "emc-title",
        content: "LARANA",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 96,
          color: "#222222",
          backgroundColor: "transparent",
          textAlign: "center",
          fontWeight: "700",
        },
        layout: {
          position: { x: 50, y: 18 },
          size: { width: 90, height: 12 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "emc-subtitle",
        content: "Effortless<br>Elegance",
        style: {
          fontFamily: "Playfair Display",
          fontSize: 48,
          color: "#333333",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 30, y: 55 },
          size: { width: 50, height: 20 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {
      videoFilter: "saturate(1.2) brightness(1.1)",
    },
  },
  // --- ADDED: Split Screen (Bold) ---
  {
    id: "bold-trends-split",
    name: "Bold Trends Split",
    styleTags: ["modern", "bold", "split", "magazine"],
    canvasAspectRatio: "16:9", // Wide Mode
    background: {
      blankCanvasColor: "#FFFFFF",
      backgroundEffect: "none",
    },
    pip: {
      layoutMode: "split-horizontal", // Vertical split
      cameraShape: "rectangle",
      splitRatio: 0.4, // 40% for text
    },
    textOverlays: [
      {
        id: "bts-1",
        content: "TRENDS",
        style: {
          fontFamily: "Anton",
          fontSize: 96,
          color: "#000000",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 20, y: 25 },
          size: { width: 38, height: 15 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "bts-2",
        content: "TRENDS",
        style: {
          fontFamily: "Anton",
          fontSize: 96,
          color: "#000000",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 20, y: 50 },
          size: { width: 38, height: 15 },
          zIndex: 15,
          rotation: 0,
        },
      },
      {
        id: "bts-3",
        content: "TRENDS",
        style: {
          fontFamily: "Anton",
          fontSize: 96,
          color: "#000000",
          backgroundColor: "transparent",
          textAlign: "left",
        },
        layout: {
          position: { x: 20, y: 75 },
          size: { width: 38, height: 15 },
          zIndex: 15,
          rotation: 0,
        },
      },
    ],
    effects: {},
  },
];

export const CANVAS_PRESET_CATEGORIES = [
  { id: "all", name: "All Designs", icon: "LayoutGrid" },
  { id: "luxury", name: "Luxury", icon: "Crown" },
  { id: "modern", name: "Modern", icon: "Zap" },
  { id: "minimal", name: "Minimal", icon: "Minus" },
  { id: "tech", name: "Tech", icon: "Cpu" },
  { id: "cinematic", name: "Cinematic", icon: "Film" },
  { id: "fashion", name: "Fashion", icon: "Shirt" },
  { id: "vintage", name: "Vintage", icon: "Clock" },
];
