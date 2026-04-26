import { z } from 'zod';
import rawShots from './cinematicShots.json';

const KeyframeSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  scale: z.number().optional(),
  rotate: z.number().optional()
});

const TransformSchema = z.object({
  property: z.string(),
  keyframes: z.array(KeyframeSchema),
  duration: z.number(),
  easing: z.string(),
  loop: z.boolean()
});

const HardwareConstraintSchema = z.object({
  capability: z.enum(['zoom', 'pan', 'tilt', 'focusMode', 'exposureMode']),
  value: z.union([z.number(), z.string()])
});

const CinematicShotSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  color: z.string(),
  category: z.string(),
  dynamic: z.boolean().optional(),
  combines: z.array(z.string()).optional(),
  preview: z.string().optional(),
  style: z.object({
    color: z.string()
  }).optional(),
  
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  fallbackTier: z.union([z.literal(2), z.literal(3)]).optional(),
  hardwareConstraint: HardwareConstraintSchema.optional(),
  transform: TransformSchema.optional(),
  shader: z.string().optional(),
  cropFactor: z.number().optional()
});

// For development, we validate the schema to catch JSON errors early.
// In production, we assume the JSON is valid to save runtime parsing cost if necessary,
// but for safety we'll parse it here.
export const CINEMATIC_PRESETS = import.meta.env?.DEV 
  ? rawShots.map(s => CinematicShotSchema.parse(s))
  : rawShots as z.infer<typeof CinematicShotSchema>[];

export type CinematicPreset = z.infer<typeof CinematicShotSchema>;
export type CinematicEffect = CinematicPreset["id"] | "none";

export const CINEMATIC_CATEGORIES = [
  { id: "all", name: "All" },
  { id: "camera-movement", name: "Camera Movement" },
  { id: "dynamic", name: "Dynamic" },
  { id: "shot-type", name: "Shot Type" },
  { id: "angle", name: "Angle" },
  { id: "framing", name: "Framing" },
  { id: "lens", name: "Lens" },
  { id: "focus", name: "Focus" },
  { id: "time", name: "Time" },
  { id: "overlay", name: "Overlay" },
  { id: "combination", name: "Combination" },
];
