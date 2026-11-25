export const FUTURISTIC_TYPES = [
    "eventHorizon",
    "silkFilaments",
    "orbitalGlobe",
    "hypercube",
    "halftoneTide",
    "turingBloom",
    "radialSpectrum",
    "liquidMetaballs",
    "torusKnot",
    "shapeMorph",
    "harmonograph",
    "flowField",
    "plexusDrift",
    "spectralCurtains",
    "prismBeams",
    "inkBloom",
    "brushStrokes",
    "ditherField",
    "stainedGlass",
    "livePen",
    "grainMesh",
    "glitchScan",
    "kaleidoscope",
    "paperLayers",
    "contourTopo",
    "pendulumWave",
    "moireRings",
    "bokehDrift",
    "warpGrid",
    "ridgeline",
    "phyllotaxis",
    "colorField",
    "rippleRain",
    "glyphField",
    "stringArt",
    "chatCascade",
    "viewerPulse",
    "heartsFloat",
    "hypeTrain",
    "pixelInvaders",
    "radarSweep",
    "checkerRun",
    "lootPillars",
    "trackLanes",
    "bounceArcs",
    "floodlights",
    "runway",
    "satinDrape",
    "stitchPattern",
    "archLight",
    "isoBlocks",
    "blueprintDraft",
    "lidarScan",
    "goldenSpiral",
] as const;
export type FuturisticType = (typeof FUTURISTIC_TYPES)[number];

export type Ctx = CanvasRenderingContext2D;
export interface Opts {
    colors: string[];
    intensity: number;
    dark: boolean;
    bg: string;
}
export type Frame = (t: number) => void;
export type Factory = (ctx: Ctx, w: number, h: number, o: Opts) => Frame;
