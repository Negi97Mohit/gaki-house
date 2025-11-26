// src/lib/animationLibrary.ts
import { AnimationPreset, AnimationCategory } from "@/types/animation";

export const ANIMATION_CATEGORIES: AnimationCategory[] = [
  "All",
  "Reveal",
  "Morph",
  "Glitch",
  "Data",
  "Kinetic",
  "Social",
  "UI",
];

export const ANIMATION_LIBRARY: AnimationPreset[] = [
  // --- REVEAL & SLIDE ---
  {
    id: "sliding-text-reveal",
    name: "Sliding Text Reveal",
    category: "Reveal",
    defaultContent: {
      heading: "Sliding Text",
      subheading: "Reveal Effect",
    },
    baseStyle: {
      fontFamily: "Inter",
      fontSize: 64,
      color: "#FFFFFF",
      alignment: "left",
    },
    animationConfig: {
      duration: 0.8,
      direction: "up",
      easing: "smooth",
      loop: true,
      loopDelay: 3,
    },
  },
  {
    id: "glide-title",
    name: "Glide",
    category: "Reveal",
    defaultContent: {
      heading: "Smooth Glide",
      subheading: "Cinematic Entrance",
    },
    baseStyle: {
      fontFamily: "Playfair Display",
      fontSize: 72,
      color: "#F5E5C5",
      alignment: "center",
    },
    animationConfig: {
      duration: 1.5,
      direction: "up",
      easing: "smooth",
    },
  },
  {
    id: "editorial-tagline",
    name: "The Edit: Tagline",
    category: "Reveal",
    defaultContent: {
      tag: "[ NEW COLLECTION ]",
      heading: "SUMMER 2025",
    },
    baseStyle: {
      fontFamily: "Montserrat",
      fontSize: 48,
      color: "#FFFFFF",
      alignment: "center",
    },
    animationConfig: {
      duration: 1.0,
      delay: 0.2,
      direction: "down",
      easing: "smooth",
    },
  },

  // --- KINETIC & BOUNCY ---
  {
    id: "zero-gravity",
    name: "Zero Gravity",
    category: "Kinetic",
    defaultContent: {
      word1: "Bounce",
      word2: "Higher",
    },
    baseStyle: {
      fontFamily: "Bebas Neue",
      fontSize: 96,
      color: "#FFD700",
      alignment: "center",
    },
    animationConfig: {
      duration: 0.6,
      delay: 0.1,
      easing: "bouncy",
      loop: true,
      loopDelay: 2,
    },
  },
  {
    id: "bouncy-period",
    name: "Bouncy Period",
    category: "Kinetic",
    defaultContent: {
      heading: "Make a Statement.",
    },
    baseStyle: {
      fontFamily: "Poppins",
      fontSize: 56,
      color: "#FFFFFF",
      accentColor: "#FF0055",
      alignment: "left",
    },
    animationConfig: {
      duration: 0.8,
      easing: "elastic",
      loop: true,
      loopDelay: 4,
    },
  },
  {
    id: "wow-rotate-scale",
    name: "Wow: Rotate & Scale",
    category: "Kinetic",
    defaultContent: {
      heading: "HUGE SALE!",
      subheading: "50% OFF",
    },
    baseStyle: {
      fontFamily: "Anton",
      fontSize: 80,
      color: "#FF0055",
      alignment: "center",
    },
    animationConfig: {
      duration: 0.5,
      direction: "up",
      easing: "bouncy",
      loop: true,
      loopDelay: 3,
    },
  },

  // --- GLITCH & TECH ---
  {
    id: "glitch-reveal-1",
    name: "Glitch Reveal",
    category: "Glitch",
    defaultContent: {
      heading: "SYSTEM_FAILURE",
      subheading: "Rebooting...",
    },
    baseStyle: {
      fontFamily: "Courier New",
      fontSize: 42,
      color: "#00FF00",
      alignment: "left",
    },
    animationConfig: {
      duration: 0.3,
      delay: 0.05,
      easing: "linear",
      loop: true,
      loopDelay: 5,
    },
  },
  {
    id: "cyber-title",
    name: "Cyber Title",
    category: "Glitch",
    defaultContent: {
      heading: "CYBERPUNK",
      status: "CONNECTED",
    },
    baseStyle: {
      fontFamily: "Orbitron",
      fontSize: 64,
      color: "#00FFFF",
      alignment: "center",
    },
    animationConfig: {
      duration: 0.8,
      direction: "left",
      easing: "smooth",
    },
  },

  // --- DATA & SOCIAL ---
  {
    id: "counter-stat",
    name: "Statistic Counter",
    category: "Data",
    defaultContent: {
      value: "$1,000,000",
      label: "Revenue Generated",
    },
    baseStyle: {
      fontFamily: "Inter",
      fontSize: 72,
      color: "#4ADE80",
      alignment: "center",
    },
    animationConfig: {
      duration: 2.0,
      easing: "smooth",
    },
  },
  {
    id: "social-message",
    name: "Social Message",
    category: "Social",
    defaultContent: {
      user: "@alex_design",
      message: "This tool is absolutely mind-blowing! 🚀",
    },
    baseStyle: {
      fontFamily: "Inter",
      fontSize: 24,
      color: "#000000",
      backgroundColor: "#FFFFFF",
      alignment: "left",
    },
    animationConfig: {
      duration: 0.6,
      direction: "up",
      easing: "bouncy",
    },
  },

  // --- UI ELEMENTS ---
  {
    id: "card-feature",
    name: "Feature Card",
    category: "UI",
    defaultContent: {
      title: "Smart AI",
      desc: "Generates layouts instantly.",
    },
    baseStyle: {
      fontFamily: "Inter",
      fontSize: 32,
      color: "#FFFFFF",
      backgroundColor: "rgba(255,255,255,0.1)",
      alignment: "left",
    },
    animationConfig: {
      duration: 0.8,
      direction: "up",
      easing: "smooth",
    },
  },
  {
    id: "lower-third-clean",
    name: "Clean Lower Third",
    category: "UI",
    defaultContent: {
      name: "Sarah Jenkins",
      role: "Product Designer",
    },
    baseStyle: {
      fontFamily: "Inter",
      fontSize: 28,
      color: "#FFFFFF",
      alignment: "left",
    },
    animationConfig: {
      duration: 1.0,
      direction: "left",
      easing: "smooth",
    },
  },
];
