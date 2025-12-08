// src/types/animatedBanner.ts

export interface ParticleSettings {
  count: number;
  speed: number;
  noise: number;
  size: number;
  color: string;
  colorVariant?: string;
}

export interface ShaderEffect {
  name: string;
  uniforms?: Record<string, unknown>;
}

export interface MotionSystem {
  timelines?: string[];
  shaders?: string[];
  particles?: boolean;
  objects3D?: string[];
  postprocessing?: string[];
}

export interface AnimatedBannerDesign {
  id: string;
  name: string;
  description: string;
  preview: string;
  layout: "horizontal" | "vertical" | "compact" | "card" | "frame";
  theme: "cosmic" | "cyber" | "organic" | "ethereal" | "vtuber" | "esports" | "cinematic";
  technologiesUsed: string[];
  motionSystem: MotionSystem;
  animatedBehaviors: string[];
  layers: {
    foreground?: string;
    midground?: string;
    background: string;
  };
  shaderEffects: ShaderEffect[];
  particleSettings?: ParticleSettings;
  colorVariants: string[];
  recommendedUseCases: string[];
  showAvatar: boolean;
  showTagline: boolean;
  maxLinks: number;
}

export const ANIMATED_BANNER_DESIGNS: AnimatedBannerDesign[] = [
  {
    id: "cosmic-swarm",
    name: "Cosmic Swarm",
    description: "Ethereal particle swarm with gravitational pull around the banner frame",
    preview: "linear-gradient(135deg, #0a0015 0%, #1a0a30 50%, #0f051a 100%)",
    layout: "horizontal",
    theme: "cosmic",
    technologiesUsed: ["react-three-fiber", "drei", "simplex-noise", "postprocessing"],
    motionSystem: {
      particles: true,
      shaders: ["cosmic-glow", "nebula-fog"],
      postprocessing: ["bloom", "chromatic-aberration"]
    },
    animatedBehaviors: ["orbital-particles", "pulsing-glow", "nebula-drift"],
    layers: {
      background: "deep-space",
      midground: "nebula-clouds",
      foreground: "star-particles"
    },
    shaderEffects: [
      { name: "bloom", uniforms: { intensity: 2.5, threshold: 0.2 } },
      { name: "chromatic-aberration", uniforms: { offset: 0.002 } }
    ],
    particleSettings: {
      count: 500,
      speed: 0.3,
      noise: 0.5,
      size: 0.02,
      color: "#a855f7",
      colorVariant: "#3b82f6"
    },
    colorVariants: ["purple-blue", "pink-cyan", "orange-red"],
    recommendedUseCases: ["vtuber", "cosmic-streamer", "space-games"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "neon-rings",
    name: "Neon Rings",
    description: "Rotating 3D holographic rings with scanning line effects",
    preview: "linear-gradient(135deg, #000000 0%, #0a1628 50%, #001a1a 100%)",
    layout: "horizontal",
    theme: "cyber",
    technologiesUsed: ["react-three-fiber", "drei", "gsap", "postprocessing"],
    motionSystem: {
      objects3D: ["torus-ring-large", "torus-ring-medium", "torus-ring-small"],
      shaders: ["hologram-scan", "grid-pulse"],
      postprocessing: ["bloom", "scanlines"]
    },
    animatedBehaviors: ["ring-rotation", "scan-sweep", "pulse-sync"],
    layers: {
      background: "cyber-grid",
      midground: "rotating-rings",
      foreground: "scan-lines"
    },
    shaderEffects: [
      { name: "hologram", uniforms: { scanSpeed: 2.0, glitchIntensity: 0.1 } }
    ],
    particleSettings: {
      count: 100,
      speed: 0.5,
      noise: 0.2,
      size: 0.01,
      color: "#00ffff"
    },
    colorVariants: ["cyan-magenta", "green-yellow", "blue-purple"],
    recommendedUseCases: ["tech-streams", "cyberpunk", "futuristic"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "liquid-chrome",
    name: "Liquid Chrome",
    description: "Morphing metallic liquid simulation with reflective surfaces",
    preview: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)",
    layout: "horizontal",
    theme: "cinematic",
    technologiesUsed: ["react-three-fiber", "drei", "custom-shaders"],
    motionSystem: {
      shaders: ["metallic-distortion", "environment-reflection"],
      timelines: ["morph-sequence"]
    },
    animatedBehaviors: ["liquid-morph", "chrome-reflection", "surface-ripple"],
    layers: {
      background: "dark-gradient",
      midground: "chrome-surface",
      foreground: "reflection-highlights"
    },
    shaderEffects: [
      { name: "metallic", uniforms: { roughness: 0.1, metalness: 1.0 } },
      { name: "distortion", uniforms: { amplitude: 0.3, frequency: 2.0 } }
    ],
    colorVariants: ["silver", "gold", "rose-gold", "iridescent"],
    recommendedUseCases: ["luxury-brand", "music", "premium-content"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "aurora-flow",
    name: "Aurora Flow",
    description: "Flowing aurora borealis with dynamic color waves",
    preview: "linear-gradient(135deg, #001a1a 0%, #002233 50%, #001122 100%)",
    layout: "horizontal",
    theme: "ethereal",
    technologiesUsed: ["react-three-fiber", "simplex-noise", "postprocessing"],
    motionSystem: {
      shaders: ["aurora-wave", "color-blend"],
      particles: true,
      postprocessing: ["bloom"]
    },
    animatedBehaviors: ["wave-flow", "color-shift", "shimmer"],
    layers: {
      background: "arctic-sky",
      midground: "aurora-bands",
      foreground: "star-dust"
    },
    shaderEffects: [
      { name: "aurora", uniforms: { waveSpeed: 0.5, colorMix: 0.7 } },
      { name: "bloom", uniforms: { intensity: 1.5 } }
    ],
    particleSettings: {
      count: 200,
      speed: 0.1,
      noise: 0.8,
      size: 0.01,
      color: "#00ff88",
      colorVariant: "#ff00aa"
    },
    colorVariants: ["green-pink", "blue-purple", "cyan-orange"],
    recommendedUseCases: ["nature", "ambient", "meditation"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "glitch-matrix",
    name: "Glitch Matrix",
    description: "Digital glitch effects with falling matrix code",
    preview: "linear-gradient(135deg, #000000 0%, #001100 50%, #000a00 100%)",
    layout: "horizontal",
    theme: "cyber",
    technologiesUsed: ["gsap", "canvas-2d", "custom-shaders"],
    motionSystem: {
      shaders: ["glitch-displacement", "rgb-split"],
      timelines: ["glitch-sequence", "code-fall"]
    },
    animatedBehaviors: ["random-glitch", "code-rain", "flicker"],
    layers: {
      background: "matrix-void",
      midground: "falling-code",
      foreground: "glitch-overlay"
    },
    shaderEffects: [
      { name: "glitch", uniforms: { intensity: 0.15, speed: 5.0 } },
      { name: "rgb-split", uniforms: { amount: 3 } }
    ],
    colorVariants: ["matrix-green", "cyber-blue", "warning-red"],
    recommendedUseCases: ["hacker-aesthetic", "tech", "cybersecurity"],
    showAvatar: false,
    showTagline: true,
    maxLinks: 4
  },
  {
    id: "vtuber-frame",
    name: "VTuber Frame",
    description: "Animated broadcast frame with orbiting decorative elements",
    preview: "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #0f051a 100%)",
    layout: "frame",
    theme: "vtuber",
    technologiesUsed: ["react-three-fiber", "gsap", "framer-motion"],
    motionSystem: {
      objects3D: ["decorative-gems", "floating-stars"],
      timelines: ["bounce-loop", "sparkle-sequence"],
      particles: true
    },
    animatedBehaviors: ["gem-orbit", "star-twinkle", "frame-pulse"],
    layers: {
      background: "gradient-void",
      midground: "ornate-frame",
      foreground: "floating-elements"
    },
    shaderEffects: [
      { name: "glow", uniforms: { color: "#ff69b4", intensity: 2.0 } }
    ],
    particleSettings: {
      count: 50,
      speed: 0.2,
      noise: 0.3,
      size: 0.03,
      color: "#ffb6c1",
      colorVariant: "#87ceeb"
    },
    colorVariants: ["pink-blue", "purple-gold", "mint-coral"],
    recommendedUseCases: ["vtuber", "anime", "kawaii"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 4
  },
  {
    id: "esports-hud",
    name: "Esports HUD",
    description: "High-tech esports overlay with animated data streams",
    preview: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f1a 100%)",
    layout: "horizontal",
    theme: "esports",
    technologiesUsed: ["gsap", "framer-motion", "canvas-2d"],
    motionSystem: {
      timelines: ["data-stream", "pulse-indicators"],
      shaders: ["tech-grid", "energy-flow"]
    },
    animatedBehaviors: ["data-pulse", "border-sweep", "indicator-blink"],
    layers: {
      background: "tech-grid",
      midground: "hud-elements",
      foreground: "data-overlays"
    },
    shaderEffects: [
      { name: "energy-pulse", uniforms: { speed: 1.5, color: "#ff4444" } }
    ],
    colorVariants: ["red-black", "blue-white", "green-dark"],
    recommendedUseCases: ["esports", "competitive-gaming", "tournaments"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 4
  },
  {
    id: "ink-flow",
    name: "Ink Flow",
    description: "Fluid ink simulation with organic spreading motion",
    preview: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)",
    layout: "horizontal",
    theme: "organic",
    technologiesUsed: ["webgl", "custom-shaders", "simplex-noise"],
    motionSystem: {
      shaders: ["fluid-simulation", "ink-spread"],
      timelines: ["flow-sequence"]
    },
    animatedBehaviors: ["ink-spread", "color-bleed", "organic-motion"],
    layers: {
      background: "paper-texture",
      midground: "ink-flow",
      foreground: "splatter-accents"
    },
    shaderEffects: [
      { name: "fluid", uniforms: { viscosity: 0.3, diffusion: 0.5 } }
    ],
    colorVariants: ["black-gold", "indigo-coral", "teal-magenta"],
    recommendedUseCases: ["artistic", "calligraphy", "creative"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "crystal-prism",
    name: "Crystal Prism",
    description: "Rotating crystal with light refraction and rainbow dispersion",
    preview: "linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)",
    layout: "horizontal",
    theme: "ethereal",
    technologiesUsed: ["react-three-fiber", "drei", "postprocessing"],
    motionSystem: {
      objects3D: ["crystal-main", "crystal-shards"],
      shaders: ["refraction", "rainbow-dispersion"],
      postprocessing: ["bloom", "depth-of-field"]
    },
    animatedBehaviors: ["crystal-rotation", "light-refraction", "shard-orbit"],
    layers: {
      background: "void-gradient",
      midground: "crystal-formation",
      foreground: "light-rays"
    },
    shaderEffects: [
      { name: "refraction", uniforms: { ior: 2.4, dispersion: 0.05 } },
      { name: "bloom", uniforms: { intensity: 2.0 } }
    ],
    particleSettings: {
      count: 30,
      speed: 0.1,
      noise: 0.2,
      size: 0.02,
      color: "#ffffff"
    },
    colorVariants: ["diamond", "amethyst", "emerald", "ruby"],
    recommendedUseCases: ["luxury", "jewelry", "premium"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "phoenix-flame",
    name: "Phoenix Flame",
    description: "Epic fire and ember particles with rising phoenix silhouette",
    preview: "linear-gradient(135deg, #1a0500 0%, #2d0a00 50%, #0f0300 100%)",
    layout: "horizontal",
    theme: "cinematic",
    technologiesUsed: ["react-three-fiber", "simplex-noise", "postprocessing"],
    motionSystem: {
      particles: true,
      shaders: ["fire-shader", "heat-distortion"],
      postprocessing: ["bloom", "color-grading"]
    },
    animatedBehaviors: ["flame-flicker", "ember-rise", "heat-wave"],
    layers: {
      background: "ash-gradient",
      midground: "flame-core",
      foreground: "ember-particles"
    },
    shaderEffects: [
      { name: "fire", uniforms: { intensity: 1.5, turbulence: 2.0 } },
      { name: "bloom", uniforms: { intensity: 3.0, threshold: 0.3 } }
    ],
    particleSettings: {
      count: 300,
      speed: 0.8,
      noise: 0.6,
      size: 0.015,
      color: "#ff4400",
      colorVariant: "#ffaa00"
    },
    colorVariants: ["orange-red", "blue-flame", "green-fire"],
    recommendedUseCases: ["epic-gaming", "fantasy", "action"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "cyber-pulse",
    name: "Cyber Pulse",
    description: "Pulsing neon grid with data streams and circuit patterns",
    preview: "linear-gradient(135deg, #0a0014 0%, #1a0033 50%, #0d001a 100%)",
    layout: "horizontal",
    theme: "cyber",
    technologiesUsed: ["framer-motion", "canvas-2d"],
    motionSystem: {
      timelines: ["pulse-sequence", "data-flow"],
      shaders: ["grid-glow"]
    },
    animatedBehaviors: ["grid-pulse", "line-trace", "node-blink"],
    layers: {
      background: "cyber-void",
      midground: "circuit-grid",
      foreground: "data-nodes"
    },
    shaderEffects: [
      { name: "neon-glow", uniforms: { intensity: 1.8 } }
    ],
    particleSettings: {
      count: 50,
      speed: 0.4,
      noise: 0.3,
      size: 0.02,
      color: "#00ffcc",
      colorVariant: "#ff00ff"
    },
    colorVariants: ["cyan-magenta", "green-purple", "blue-orange"],
    recommendedUseCases: ["tech-streams", "programming", "cyberpunk"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "nebula-drift",
    name: "Nebula Drift",
    description: "Slow-moving cosmic nebula clouds with star field",
    preview: "linear-gradient(135deg, #0a0020 0%, #200040 50%, #100030 100%)",
    layout: "horizontal",
    theme: "cosmic",
    technologiesUsed: ["framer-motion", "css-animations"],
    motionSystem: {
      shaders: ["nebula-blend", "star-twinkle"],
      particles: true
    },
    animatedBehaviors: ["cloud-drift", "star-pulse", "depth-parallax"],
    layers: {
      background: "deep-space",
      midground: "nebula-layers",
      foreground: "star-dust"
    },
    shaderEffects: [
      { name: "gaussian-blur", uniforms: { radius: 8 } }
    ],
    particleSettings: {
      count: 100,
      speed: 0.1,
      noise: 0.6,
      size: 0.01,
      color: "#ff66aa",
      colorVariant: "#6666ff"
    },
    colorVariants: ["pink-blue", "purple-orange", "cyan-red"],
    recommendedUseCases: ["space-content", "ambient", "asmr"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "retro-wave",
    name: "Retro Wave",
    description: "80s synthwave aesthetic with neon grid and sun",
    preview: "linear-gradient(180deg, #1a0033 0%, #330066 40%, #ff6600 100%)",
    layout: "horizontal",
    theme: "cinematic",
    technologiesUsed: ["framer-motion", "gsap", "css-animations"],
    motionSystem: {
      timelines: ["grid-scroll", "sun-pulse"],
      shaders: ["scanlines", "crt-warp"]
    },
    animatedBehaviors: ["grid-perspective", "sun-glow", "palm-sway"],
    layers: {
      background: "sunset-gradient",
      midground: "perspective-grid",
      foreground: "silhouette-elements"
    },
    shaderEffects: [
      { name: "chromatic-aberration", uniforms: { offset: 0.003 } }
    ],
    colorVariants: ["sunset-purple", "midnight-blue", "neon-pink"],
    recommendedUseCases: ["synthwave", "retro-gaming", "music"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "hologram-scan",
    name: "Hologram Scan",
    description: "Futuristic holographic display with scanning effects",
    preview: "linear-gradient(135deg, #001a1a 0%, #003333 50%, #001a2a 100%)",
    layout: "horizontal",
    theme: "cyber",
    technologiesUsed: ["framer-motion", "canvas-2d"],
    motionSystem: {
      shaders: ["hologram-flicker", "scan-sweep"],
      timelines: ["glitch-random"]
    },
    animatedBehaviors: ["line-scan", "static-flicker", "depth-shift"],
    layers: {
      background: "dark-tech",
      midground: "hologram-frame",
      foreground: "scan-overlay"
    },
    shaderEffects: [
      { name: "hologram", uniforms: { opacity: 0.9, scanSpeed: 1.5 } }
    ],
    particleSettings: {
      count: 30,
      speed: 0.2,
      noise: 0.1,
      size: 0.015,
      color: "#00ffff"
    },
    colorVariants: ["cyan-white", "green-white", "blue-white"],
    recommendedUseCases: ["sci-fi", "tech-reviews", "futuristic"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 4
  },
  {
    id: "forest-spirits",
    name: "Forest Spirits",
    description: "Mystical forest with floating light orbs and fireflies",
    preview: "linear-gradient(180deg, #0a1a0a 0%, #1a3320 50%, #0a1510 100%)",
    layout: "horizontal",
    theme: "organic",
    technologiesUsed: ["framer-motion", "css-animations"],
    motionSystem: {
      particles: true,
      timelines: ["firefly-dance"]
    },
    animatedBehaviors: ["orb-float", "leaf-fall", "mist-drift"],
    layers: {
      background: "forest-depth",
      midground: "tree-silhouettes",
      foreground: "light-particles"
    },
    shaderEffects: [
      { name: "soft-glow", uniforms: { intensity: 1.2 } }
    ],
    particleSettings: {
      count: 40,
      speed: 0.15,
      noise: 0.7,
      size: 0.025,
      color: "#88ff88",
      colorVariant: "#ffff88"
    },
    colorVariants: ["green-gold", "blue-silver", "purple-pink"],
    recommendedUseCases: ["nature", "fantasy", "cozy-gaming"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    description: "Deep underwater scene with caustic light and bubbles",
    preview: "linear-gradient(180deg, #001a33 0%, #002244 50%, #001122 100%)",
    layout: "horizontal",
    theme: "ethereal",
    technologiesUsed: ["framer-motion", "canvas-2d"],
    motionSystem: {
      shaders: ["caustics", "water-distortion"],
      particles: true
    },
    animatedBehaviors: ["bubble-rise", "light-caustics", "seaweed-sway"],
    layers: {
      background: "deep-blue",
      midground: "water-volume",
      foreground: "bubble-particles"
    },
    shaderEffects: [
      { name: "caustics", uniforms: { scale: 2.0, speed: 0.5 } }
    ],
    particleSettings: {
      count: 60,
      speed: 0.3,
      noise: 0.4,
      size: 0.02,
      color: "#66ccff",
      colorVariant: "#ffffff"
    },
    colorVariants: ["ocean-blue", "tropical-teal", "deep-purple"],
    recommendedUseCases: ["ocean-content", "relaxation", "aquarium"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "electric-storm",
    name: "Electric Storm",
    description: "Dynamic lightning strikes with electric plasma arcs",
    preview: "linear-gradient(135deg, #0a0a1a 0%, #1a1a33 50%, #0a0a20 100%)",
    layout: "horizontal",
    theme: "cinematic",
    technologiesUsed: ["canvas-2d", "framer-motion"],
    motionSystem: {
      timelines: ["lightning-flash", "thunder-rumble"],
      shaders: ["electric-arc"]
    },
    animatedBehaviors: ["bolt-strike", "plasma-crackle", "cloud-surge"],
    layers: {
      background: "storm-clouds",
      midground: "rain-sheets",
      foreground: "lightning-bolts"
    },
    shaderEffects: [
      { name: "bloom", uniforms: { intensity: 3.0, threshold: 0.1 } }
    ],
    particleSettings: {
      count: 80,
      speed: 1.0,
      noise: 0.2,
      size: 0.01,
      color: "#aaccff",
      colorVariant: "#ffffff"
    },
    colorVariants: ["blue-white", "purple-pink", "red-orange"],
    recommendedUseCases: ["dramatic", "action", "weather"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 4
  },
  {
    id: "sakura-petals",
    name: "Sakura Petals",
    description: "Gentle falling cherry blossom petals with soft glow",
    preview: "linear-gradient(180deg, #1a0a15 0%, #2a1525 50%, #150a10 100%)",
    layout: "horizontal",
    theme: "vtuber",
    technologiesUsed: ["framer-motion", "css-animations"],
    motionSystem: {
      particles: true,
      timelines: ["petal-cascade"]
    },
    animatedBehaviors: ["petal-fall", "wind-gust", "soft-glow"],
    layers: {
      background: "twilight-pink",
      midground: "branch-silhouettes",
      foreground: "falling-petals"
    },
    shaderEffects: [
      { name: "soft-bloom", uniforms: { intensity: 1.0 } }
    ],
    particleSettings: {
      count: 50,
      speed: 0.2,
      noise: 0.5,
      size: 0.04,
      color: "#ffaacc",
      colorVariant: "#ffffff"
    },
    colorVariants: ["pink-white", "purple-lavender", "red-coral"],
    recommendedUseCases: ["anime", "vtuber", "aesthetic"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "neon-city",
    name: "Neon City",
    description: "Cyberpunk cityscape with rain and neon reflections",
    preview: "linear-gradient(180deg, #0a0a15 0%, #151530 50%, #0a0a20 100%)",
    layout: "horizontal",
    theme: "cyber",
    technologiesUsed: ["canvas-2d", "framer-motion"],
    motionSystem: {
      particles: true,
      timelines: ["rain-fall", "sign-flicker"],
      shaders: ["wet-surface-reflection"]
    },
    animatedBehaviors: ["rain-stream", "neon-pulse", "car-lights"],
    layers: {
      background: "city-skyline",
      midground: "building-lights",
      foreground: "rain-overlay"
    },
    shaderEffects: [
      { name: "rain-distortion", uniforms: { intensity: 0.5 } }
    ],
    particleSettings: {
      count: 200,
      speed: 1.5,
      noise: 0.1,
      size: 0.005,
      color: "#66aaff",
      colorVariant: "#ff66aa"
    },
    colorVariants: ["blue-pink", "purple-cyan", "orange-teal"],
    recommendedUseCases: ["cyberpunk", "lofi", "night-streams"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  },
  {
    id: "golden-particles",
    name: "Golden Particles",
    description: "Elegant floating gold dust with premium shimmer effect",
    preview: "linear-gradient(135deg, #1a1510 0%, #2a2015 50%, #151008 100%)",
    layout: "horizontal",
    theme: "cinematic",
    technologiesUsed: ["framer-motion", "css-animations"],
    motionSystem: {
      particles: true,
      shaders: ["metallic-shimmer"]
    },
    animatedBehaviors: ["dust-float", "light-catch", "gentle-swirl"],
    layers: {
      background: "warm-dark",
      midground: "ambient-glow",
      foreground: "gold-particles"
    },
    shaderEffects: [
      { name: "metallic-sheen", uniforms: { roughness: 0.2 } }
    ],
    particleSettings: {
      count: 80,
      speed: 0.1,
      noise: 0.6,
      size: 0.015,
      color: "#ffd700",
      colorVariant: "#ffaa00"
    },
    colorVariants: ["gold", "silver", "rose-gold", "bronze"],
    recommendedUseCases: ["luxury", "awards", "premium-content"],
    showAvatar: true,
    showTagline: true,
    maxLinks: 5
  }
];
