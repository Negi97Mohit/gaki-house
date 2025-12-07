// src/lib/gsapAnimations.ts
// Professional-grade GSAP animation presets inspired by Canva, CapCut, After Effects

import gsap from "gsap";

export type GSAPAnimationType =
  | "cinematic-reveal"
  | "kinetic-type"
  | "morph-glitch"
  | "elastic-bounce"
  | "stagger-wave"
  | "split-text"
  | "perspective-flip"
  | "liquid-fill"
  | "neon-flicker"
  | "typewriter"
  | "scramble"
  | "magnetic-pull"
  | "particle-burst"
  | "rubber-band"
  | "shatter"
  | "ink-reveal"
  | "spotlight"
  | "parallax-depth"
  | "whip-pan"
  | "zoom-punch"
  // New effect-based animations
  | "fire-effect"
  | "water-effect"
  | "snow-effect"
  | "confetti-effect"
  | "graffiti-effect"
  | "neon-particles-effect"
  | "electric-effect"
  | "glitch-blocks-effect"
  | "rainbow-burst-effect"
  | "pulse-rings-effect"
  | "bounce-balls-effect"
  | "shake-debris-effect"
  | "glow-orbs-effect"
  | "float-bubbles-effect"
  | "flame-sparks-effect"
  | "ice-crystals-effect";

export interface GSAPAnimationConfig {
  type: GSAPAnimationType;
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
  loop?: boolean;
  loopDelay?: number;
  intensity?: number;
  direction?: "up" | "down" | "left" | "right" | "center";
  color?: string;
  fontFamily?: string;
  fontSize?: number;
}

export interface GSAPPreset {
  id: string;
  name: string;
  category: "reveal" | "kinetic" | "glitch" | "stylized" | "3d" | "text" | "effects";
  description: string;
  config: GSAPAnimationConfig;
  preview?: string;
  particleEffect?: string; // Links to EffectType from particleEffects.ts
}

// =====================================================
// ANIMATION DEFINITIONS
// =====================================================

export const createCinematicReveal = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const chars = element.querySelectorAll(".char");
  const words = element.querySelectorAll(".word");
  const lines = element.querySelectorAll(".line");

  // If we have split text, animate each piece
  if (chars.length > 0) {
    tl.set(chars, { opacity: 0, y: 100, rotationX: -90 });
    tl.to(chars, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: config.duration || 1.2,
      stagger: config.stagger || 0.03,
      ease: config.ease || "power4.out",
    });
  } else {
    // Fallback for non-split text
    tl.fromTo(
      element,
      { opacity: 0, y: 50, clipPath: "inset(100% 0% 0% 0%)" },
      {
        opacity: 1,
        y: 0,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: config.duration || 1,
        ease: config.ease || "power3.out",
      }
    );
  }

  return tl;
};

export const createKineticType = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const intensity = config.intensity || 1;

  tl.fromTo(
    element,
    {
      scale: 0,
      rotation: -180 * intensity,
      opacity: 0,
    },
    {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: config.duration || 0.8,
      ease: "back.out(2.5)",
    }
  );

  // Add a subtle bounce at the end
  tl.to(element, {
    scale: 1.05,
    duration: 0.15,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut",
  });

  return tl;
};

export const createMorphGlitch = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const intensity = config.intensity || 1;

  // Initial glitch effect
  tl.set(element, { opacity: 1 });

  // Create glitch frames
  for (let i = 0; i < 5; i++) {
    const offset = (Math.random() - 0.5) * 20 * intensity;
    tl.to(element, {
      x: offset,
      skewX: offset * 0.5,
      duration: 0.05,
      ease: "none",
    });
    tl.set(element, {
      textShadow: `${offset}px 0 cyan, ${-offset}px 0 magenta`,
    });
  }

  // Settle
  tl.to(element, {
    x: 0,
    skewX: 0,
    textShadow: "none",
    duration: 0.3,
    ease: "power2.out",
  });

  return tl;
};

export const createElasticBounce = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const direction = config.direction || "up";

  const fromVars: gsap.TweenVars = {
    opacity: 0,
    scale: 0.3,
  };

  switch (direction) {
    case "up":
      fromVars.y = 100;
      break;
    case "down":
      fromVars.y = -100;
      break;
    case "left":
      fromVars.x = 100;
      break;
    case "right":
      fromVars.x = -100;
      break;
  }

  tl.fromTo(element, fromVars, {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    duration: config.duration || 1,
    ease: "elastic.out(1, 0.5)",
  });

  return tl;
};

export const createStaggerWave = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const chars = element.querySelectorAll(".char");

  if (chars.length > 0) {
    tl.set(chars, { opacity: 0, y: 30 });
    tl.to(chars, {
      opacity: 1,
      y: 0,
      duration: config.duration || 0.6,
      stagger: {
        each: config.stagger || 0.05,
        from: "start",
        ease: "sine.inOut",
      },
      ease: "power2.out",
    });
  } else {
    tl.fromTo(
      element,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: config.duration || 0.6, ease: "power2.out" }
    );
  }

  return tl;
};

export const createPerspectiveFlip = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const direction = config.direction || "up";

  gsap.set(element.parentElement, { perspective: 1000 });

  const rotationProp = direction === "up" || direction === "down" ? "rotationX" : "rotationY";
  const rotationValue = direction === "up" || direction === "left" ? 90 : -90;

  tl.fromTo(
    element,
    {
      opacity: 0,
      [rotationProp]: rotationValue,
      transformOrigin: direction === "up" ? "bottom center" : direction === "down" ? "top center" : direction === "left" ? "right center" : "left center",
    },
    {
      opacity: 1,
      [rotationProp]: 0,
      duration: config.duration || 1,
      ease: "power3.out",
    }
  );

  return tl;
};

export const createLiquidFill = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });

  tl.fromTo(
    element,
    {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      opacity: 1,
    },
    {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: config.duration || 1.2,
      ease: "power2.inOut",
    }
  );

  return tl;
};

export const createNeonFlicker = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const color = config.color || "#00ffff";

  // Initial state
  tl.set(element, { opacity: 0 });

  // Flicker sequence
  const flickerPattern = [0.1, 0.05, 0.1, 0.05, 0.2, 0.05, 0.3];
  flickerPattern.forEach((duration, i) => {
    tl.to(element, {
      opacity: i % 2 === 0 ? 1 : 0.3,
      textShadow:
        i % 2 === 0
          ? `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}, 0 0 80px ${color}`
          : `0 0 5px ${color}`,
      duration,
      ease: "none",
    });
  });

  // Final glow
  tl.to(element, {
    opacity: 1,
    textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}`,
    duration: 0.3,
    ease: "power2.out",
  });

  return tl;
};

export const createTypewriter = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const chars = element.querySelectorAll(".char");

  if (chars.length > 0) {
    tl.set(chars, { opacity: 0 });
    tl.to(chars, {
      opacity: 1,
      duration: 0.01,
      stagger: config.stagger || 0.08,
      ease: "none",
    });
  }

  return tl;
};

export const createScramble = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const chars = element.querySelectorAll(".char");
  const scrambleChars = "!<>-_\\/[]{}—=+*^?#________";

  if (chars.length > 0) {
    chars.forEach((char, i) => {
      const originalText = char.textContent || "";
      let iterations = 0;

      tl.to(
        char,
        {
          duration: config.duration || 0.8,
          onUpdate: function () {
            iterations++;
            if (iterations < 10) {
              (char as HTMLElement).textContent =
                scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            } else {
              (char as HTMLElement).textContent = originalText;
            }
          },
        },
        i * (config.stagger || 0.05)
      );
    });
  }

  return tl;
};

export const createMagneticPull = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const chars = element.querySelectorAll(".char");

  if (chars.length > 0) {
    // Scatter chars
    tl.set(chars, {
      opacity: 0,
      x: () => (Math.random() - 0.5) * 200,
      y: () => (Math.random() - 0.5) * 200,
      rotation: () => (Math.random() - 0.5) * 180,
    });

    // Pull to center
    tl.to(chars, {
      opacity: 1,
      x: 0,
      y: 0,
      rotation: 0,
      duration: config.duration || 1,
      stagger: config.stagger || 0.02,
      ease: "back.out(1.5)",
    });
  }

  return tl;
};

export const createRubberBand = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });

  tl.fromTo(
    element,
    { scaleX: 1, scaleY: 1, opacity: 0 },
    { opacity: 1, duration: 0.1 }
  )
    .to(element, { scaleX: 1.25, scaleY: 0.75, duration: 0.15, ease: "power2.out" })
    .to(element, { scaleX: 0.75, scaleY: 1.25, duration: 0.15, ease: "power2.out" })
    .to(element, { scaleX: 1.15, scaleY: 0.85, duration: 0.1, ease: "power2.out" })
    .to(element, { scaleX: 0.95, scaleY: 1.05, duration: 0.1, ease: "power2.out" })
    .to(element, { scaleX: 1, scaleY: 1, duration: 0.1, ease: "power2.out" });

  return tl;
};

export const createShatter = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const chars = element.querySelectorAll(".char");

  if (chars.length > 0) {
    // Start assembled
    tl.set(chars, { opacity: 1, x: 0, y: 0, rotation: 0 });

    // Shatter outward
    tl.to(chars, {
      x: () => (Math.random() - 0.5) * 300,
      y: () => (Math.random() - 0.5) * 300,
      rotation: () => (Math.random() - 0.5) * 360,
      opacity: 0,
      duration: config.duration || 0.8,
      stagger: config.stagger || 0.02,
      ease: "power4.in",
    });

    // Reassemble
    tl.to(chars, {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      duration: config.duration || 0.8,
      stagger: config.stagger || 0.02,
      ease: "power4.out",
    });
  }

  return tl;
};

export const createInkReveal = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });

  // Create a unique mask effect
  const maskId = `ink-mask-${Date.now()}`;

  tl.fromTo(
    element,
    {
      clipPath: "circle(0% at 50% 50%)",
      opacity: 1,
    },
    {
      clipPath: "circle(150% at 50% 50%)",
      duration: config.duration || 1.5,
      ease: "power2.out",
    }
  );

  return tl;
};

export const createSpotlight = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });

  tl.set(element, {
    backgroundImage: "radial-gradient(circle at 0% 50%, transparent 0%, black 0%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
  });

  tl.to(element, {
    backgroundImage: "radial-gradient(circle at 100% 50%, transparent 100%, black 100%)",
    duration: config.duration || 1.5,
    ease: "power2.inOut",
  });

  // Reset to normal
  tl.set(element, {
    backgroundImage: "none",
    backgroundClip: "border-box",
    WebkitBackgroundClip: "border-box",
    color: config.color || "inherit",
  });

  return tl;
};

export const createWhipPan = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const direction = config.direction || "left";
  const distance = direction === "left" || direction === "right" ? "100vw" : "100vh";
  const prop = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "left" || direction === "up" ? 1 : -1;

  tl.fromTo(
    element,
    {
      [prop]: `${sign * -100}%`,
      opacity: 1,
    },
    {
      [prop]: 0,
      duration: config.duration || 0.4,
      ease: "power4.out",
    }
  );

  // Motion blur effect simulation
  tl.fromTo(
    element,
    { filter: "blur(10px)" },
    { filter: "blur(0px)", duration: 0.2 },
    "<"
  );

  return tl;
};

export const createZoomPunch = (
  element: HTMLElement,
  config: GSAPAnimationConfig
) => {
  const tl = gsap.timeline({ delay: config.delay || 0 });
  const intensity = config.intensity || 1;

  tl.fromTo(
    element,
    {
      scale: 3 * intensity,
      opacity: 0,
      filter: "blur(20px)",
    },
    {
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      duration: config.duration || 0.5,
      ease: "power4.out",
    }
  );

  // Subtle overshoot
  tl.to(element, {
    scale: 0.95,
    duration: 0.1,
    ease: "power2.inOut",
  }).to(element, {
    scale: 1,
    duration: 0.1,
    ease: "power2.out",
  });

  return tl;
};

// =====================================================
// PRESET LIBRARY
// =====================================================

export const GSAP_PRESETS: GSAPPreset[] = [
  {
    id: "cinematic-reveal",
    name: "Cinematic Reveal",
    category: "reveal",
    description: "Hollywood-style dramatic text reveal with 3D rotation",
    config: {
      type: "cinematic-reveal",
      duration: 1.2,
      stagger: 0.03,
      ease: "power4.out",
    },
  },
  {
    id: "kinetic-pop",
    name: "Kinetic Pop",
    category: "kinetic",
    description: "Explosive rotation and scale with elastic overshoot",
    config: {
      type: "kinetic-type",
      duration: 0.8,
      intensity: 1,
    },
  },
  {
    id: "glitch-morph",
    name: "Glitch Morph",
    category: "glitch",
    description: "Cyberpunk-style RGB split and jitter effect",
    config: {
      type: "morph-glitch",
      duration: 0.5,
      intensity: 1,
    },
  },
  {
    id: "elastic-drop",
    name: "Elastic Drop",
    category: "kinetic",
    description: "Bouncy entrance with elastic physics",
    config: {
      type: "elastic-bounce",
      duration: 1,
      direction: "up",
    },
  },
  {
    id: "wave-stagger",
    name: "Wave Stagger",
    category: "text",
    description: "Characters animate in a flowing wave pattern",
    config: {
      type: "stagger-wave",
      duration: 0.6,
      stagger: 0.05,
    },
  },
  {
    id: "3d-flip",
    name: "3D Flip",
    category: "3d",
    description: "Perspective-based 3D rotation entrance",
    config: {
      type: "perspective-flip",
      duration: 1,
      direction: "up",
    },
  },
  {
    id: "liquid-rise",
    name: "Liquid Rise",
    category: "reveal",
    description: "Smooth liquid-like fill from bottom to top",
    config: {
      type: "liquid-fill",
      duration: 1.2,
    },
  },
  {
    id: "neon-buzz",
    name: "Neon Buzz",
    category: "stylized",
    description: "Flickering neon sign effect with glow",
    config: {
      type: "neon-flicker",
      duration: 0.8,
      color: "#00ffff",
    },
  },
  {
    id: "typewriter-classic",
    name: "Typewriter",
    category: "text",
    description: "Classic character-by-character typing effect",
    config: {
      type: "typewriter",
      stagger: 0.08,
    },
  },
  {
    id: "hacker-scramble",
    name: "Hacker Scramble",
    category: "glitch",
    description: "Matrix-style character scrambling reveal",
    config: {
      type: "scramble",
      duration: 0.8,
      stagger: 0.05,
    },
  },
  {
    id: "magnetic-assemble",
    name: "Magnetic Assemble",
    category: "kinetic",
    description: "Scattered letters magnetically pull together",
    config: {
      type: "magnetic-pull",
      duration: 1,
      stagger: 0.02,
    },
  },
  {
    id: "rubber-squash",
    name: "Rubber Squash",
    category: "kinetic",
    description: "Cartoon-style squash and stretch entrance",
    config: {
      type: "rubber-band",
      duration: 0.6,
    },
  },
  {
    id: "shatter-reform",
    name: "Shatter & Reform",
    category: "kinetic",
    description: "Text explodes apart then reassembles",
    config: {
      type: "shatter",
      duration: 0.8,
      stagger: 0.02,
      loop: true,
      loopDelay: 3,
    },
  },
  {
    id: "ink-splash",
    name: "Ink Splash",
    category: "reveal",
    description: "Circular ink splash reveal effect",
    config: {
      type: "ink-reveal",
      duration: 1.5,
    },
  },
  {
    id: "whip-entrance",
    name: "Whip Entrance",
    category: "kinetic",
    description: "Fast whip-pan style entrance with motion blur",
    config: {
      type: "whip-pan",
      duration: 0.4,
      direction: "left",
    },
  },
  {
    id: "zoom-impact",
    name: "Zoom Impact",
    category: "kinetic",
    description: "Dramatic zoom-in punch with blur",
    config: {
      type: "zoom-punch",
      duration: 0.5,
      intensity: 1,
    },
  },
  // =====================================================
  // NEW PARTICLE EFFECT ANIMATIONS (16 effects)
  // =====================================================
  {
    id: "fire-blaze",
    name: "🔥 Fire Blaze",
    category: "effects",
    description: "Realistic fire particles rising with heat shimmer",
    config: {
      type: "fire-effect",
      duration: 1,
      loop: true,
    },
    particleEffect: "fire",
  },
  {
    id: "water-splash",
    name: "💧 Water Splash",
    category: "effects",
    description: "Water droplets cascading down with physics",
    config: {
      type: "water-effect",
      duration: 1,
      loop: true,
    },
    particleEffect: "water",
  },
  {
    id: "snow-fall",
    name: "❄️ Snowfall",
    category: "effects",
    description: "Gentle snowflakes drifting with wind",
    config: {
      type: "snow-effect",
      duration: 1,
      loop: true,
    },
    particleEffect: "snow",
  },
  {
    id: "confetti-party",
    name: "🎉 Confetti Party",
    category: "effects",
    description: "Colorful confetti explosion celebration",
    config: {
      type: "confetti-effect",
      duration: 1.5,
    },
    particleEffect: "confetti",
  },
  {
    id: "graffiti-spray",
    name: "🎨 Graffiti Spray",
    category: "effects",
    description: "Street art spray paint splatter effect",
    config: {
      type: "graffiti-effect",
      duration: 1,
      loop: true,
    },
    particleEffect: "graffiti",
  },
  {
    id: "neon-glow",
    name: "💜 Neon Particles",
    category: "effects",
    description: "Glowing neon particles floating around",
    config: {
      type: "neon-particles-effect",
      duration: 1,
      loop: true,
      color: "#ff00ff",
    },
    particleEffect: "neon-particles",
  },
  {
    id: "electric-storm",
    name: "⚡ Electric Storm",
    category: "effects",
    description: "Crackling electric sparks and lightning",
    config: {
      type: "electric-effect",
      duration: 0.8,
      loop: true,
    },
    particleEffect: "electric",
  },
  {
    id: "glitch-matrix",
    name: "📺 Glitch Blocks",
    category: "effects",
    description: "Digital glitch blocks with RGB split",
    config: {
      type: "glitch-blocks-effect",
      duration: 0.5,
      loop: true,
    },
    particleEffect: "glitch-blocks",
  },
  {
    id: "rainbow-explosion",
    name: "🌈 Rainbow Burst",
    category: "effects",
    description: "Spectacular rainbow color explosion",
    config: {
      type: "rainbow-burst-effect",
      duration: 1.5,
    },
    particleEffect: "rainbow-burst",
  },
  {
    id: "pulse-wave",
    name: "〰️ Pulse Rings",
    category: "effects",
    description: "Expanding pulse rings radiating outward",
    config: {
      type: "pulse-rings-effect",
      duration: 1,
      loop: true,
    },
    particleEffect: "pulse-rings",
  },
  {
    id: "bouncy-balls",
    name: "🏀 Bounce Balls",
    category: "effects",
    description: "Bouncing balls with realistic physics",
    config: {
      type: "bounce-balls-effect",
      duration: 2,
    },
    particleEffect: "bounce-balls",
  },
  {
    id: "shake-impact",
    name: "💥 Shake Debris",
    category: "effects",
    description: "Explosive debris shaking and scattering",
    config: {
      type: "shake-debris-effect",
      duration: 1,
    },
    particleEffect: "shake-debris",
  },
  {
    id: "glow-fireflies",
    name: "✨ Glow Orbs",
    category: "effects",
    description: "Magical floating glowing orbs",
    config: {
      type: "glow-orbs-effect",
      duration: 1,
      loop: true,
    },
    particleEffect: "glow-orbs",
  },
  {
    id: "bubble-float",
    name: "🫧 Float Bubbles",
    category: "effects",
    description: "Dreamy bubbles floating upward",
    config: {
      type: "float-bubbles-effect",
      duration: 1,
      loop: true,
    },
    particleEffect: "float-bubbles",
  },
  {
    id: "flame-ember",
    name: "🔶 Flame Sparks",
    category: "effects",
    description: "Hot embers and sparks rising from flames",
    config: {
      type: "flame-sparks-effect",
      duration: 1,
      loop: true,
    },
    particleEffect: "flame-sparks",
  },
  {
    id: "ice-frost",
    name: "🧊 Ice Crystals",
    category: "effects",
    description: "Frozen ice crystals forming and drifting",
    config: {
      type: "ice-crystals-effect",
      duration: 1,
      loop: true,
    },
    particleEffect: "ice-crystals",
  },
];

// =====================================================
// ANIMATION EXECUTOR
// =====================================================

export const executeGSAPAnimation = (
  element: HTMLElement,
  config: GSAPAnimationConfig
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
      return gsap.timeline().fromTo(
        element,
        { opacity: 0 },
        { opacity: 1, duration: config.duration || 0.5 }
      );
  }
};

// =====================================================
// TEXT SPLITTING UTILITY
// =====================================================

export const splitTextToChars = (text: string): string => {
  return text
    .split("")
    .map((char) =>
      char === " " ? '<span class="char">&nbsp;</span>' : `<span class="char">${char}</span>`
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
