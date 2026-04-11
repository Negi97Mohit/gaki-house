// src/types/streamStyle.ts

export type StreamSceneType = 
  | 'starting-soon'
  | 'live'
  | 'brb'
  | 'intermission'
  | 'ending'
  | 'offline';

export interface StreamSceneConfig {
  id: StreamSceneType;
  name: string;
  description: string;
  hasCamera: boolean;
  cameraPosition?: { x: number; y: number };
  cameraSize?: { width: number; height: number };
  defaultText: string;
  subText?: string;
}

export interface StreamStyleTheme {
  id: string;
  name: string;
  description: string;
  category: 'anime' | 'neon' | 'minimal' | 'gaming' | 'professional';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    glow?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  effects: {
    particles?: boolean;
    glow?: boolean;
    gradients?: boolean;
    scanlines?: boolean;
    noise?: boolean;
  };
}

export interface StreamStylePreset {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  theme: StreamStyleTheme;
  scenes: StreamSceneConfig[];
}

// Default scene configurations
export const DEFAULT_STREAM_SCENES: StreamSceneConfig[] = [
  {
    id: 'starting-soon',
    name: 'Starting Soon',
    description: 'Displayed before stream starts',
    hasCamera: false,
    defaultText: 'Starting Soon',
    subText: 'Stream will be'
  },
  {
    id: 'live',
    name: 'Live',
    description: 'Main streaming scene with camera',
    hasCamera: true,
    cameraPosition: { x: 70, y: 70 },
    cameraSize: { width: 25, height: 30 },
    defaultText: 'LIVE'
  },
  {
    id: 'brb',
    name: 'Be Right Back',
    description: 'Short break screen',
    hasCamera: false,
    defaultText: 'Be Right Back',
    subText: 'Stream will be'
  },
  {
    id: 'intermission',
    name: 'Intermission',
    description: 'Longer break with content display area',
    hasCamera: true,
    cameraPosition: { x: 50, y: 50 },
    cameraSize: { width: 60, height: 50 },
    defaultText: 'Intermission'
  },
  {
    id: 'ending',
    name: 'Ending Soon',
    description: 'Stream ending screen',
    hasCamera: false,
    defaultText: 'Ending Soon',
    subText: 'Stream will be'
  },
  {
    id: 'offline',
    name: 'Offline',
    description: 'Channel offline screen',
    hasCamera: false,
    defaultText: 'Offline',
    subText: 'Stream is'
  }
];

// Sakura Theme (inspired by the pink/purple Japanese aesthetic)
export const SAKURA_THEME: StreamStyleTheme = {
  id: 'sakura',
  name: 'Sakura Dreams',
  description: 'Peaceful Japanese aesthetic with cherry blossoms',
  category: 'anime',
  colors: {
    primary: 'hsl(340, 80%, 75%)',
    secondary: 'hsl(280, 60%, 65%)',
    accent: 'hsl(45, 90%, 85%)',
    background: 'hsl(20, 50%, 85%)',
    text: 'hsl(0, 0%, 100%)',
    glow: 'hsl(340, 80%, 85%)'
  },
  fonts: {
    heading: 'Satisfy, cursive',
    body: 'Inter, sans-serif'
  },
  effects: {
    particles: true,
    glow: true,
    gradients: true
  }
};

// Cyberpunk Neon Theme (inspired by the neon city aesthetic)
export const CYBERPUNK_THEME: StreamStyleTheme = {
  id: 'cyberpunk',
  name: 'Neon City',
  description: 'Vibrant cyberpunk neon aesthetic',
  category: 'neon',
  colors: {
    primary: 'hsl(180, 100%, 60%)',
    secondary: 'hsl(300, 100%, 65%)',
    accent: 'hsl(280, 100%, 70%)',
    background: 'hsl(260, 40%, 12%)',
    text: 'hsl(0, 0%, 100%)',
    glow: 'hsl(180, 100%, 70%)'
  },
  fonts: {
    heading: 'Orbitron, sans-serif',
    body: 'Inter, sans-serif'
  },
  effects: {
    particles: true,
    glow: true,
    scanlines: true,
    noise: true
  }
};

// Gaming Theme
export const GAMING_THEME: StreamStyleTheme = {
  id: 'gaming',
  name: 'Pro Gamer',
  description: 'Bold esports-inspired design',
  category: 'gaming',
  colors: {
    primary: 'hsl(150, 100%, 50%)',
    secondary: 'hsl(200, 100%, 50%)',
    accent: 'hsl(45, 100%, 60%)',
    background: 'hsl(220, 30%, 10%)',
    text: 'hsl(0, 0%, 100%)',
    glow: 'hsl(150, 100%, 60%)'
  },
  fonts: {
    heading: 'Rajdhani, sans-serif',
    body: 'Inter, sans-serif'
  },
  effects: {
    particles: true,
    glow: true,
    gradients: true
  }
};

export const STREAM_STYLE_PRESETS: StreamStylePreset[] = [
  {
    id: 'sakura-dreams',
    name: 'Sakura Dreams',
    description: 'Peaceful Japanese aesthetic with animated cherry blossoms',
    theme: SAKURA_THEME,
    scenes: DEFAULT_STREAM_SCENES
  },
  {
    id: 'neon-city',
    name: 'Neon City',
    description: 'Vibrant cyberpunk neon aesthetic with glitch effects',
    theme: CYBERPUNK_THEME,
    scenes: DEFAULT_STREAM_SCENES
  },
  {
    id: 'pro-gamer',
    name: 'Pro Gamer',
    description: 'Bold esports-inspired design with dynamic animations',
    theme: GAMING_THEME,
    scenes: DEFAULT_STREAM_SCENES
  }
];
