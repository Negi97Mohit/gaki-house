import React, { useEffect, useRef } from "react";
import { FUTURISTIC_TYPES, type FuturisticType, type Frame, type Factory, type Opts } from "./futuristic-canvas/types";
import { mix } from "./futuristic-canvas/helpers";
import {
    eventHorizon,
    silkFilaments,
    orbitalGlobe,
    hypercube,
    halftoneTide,
    harmonograph,
    flowField,
    plexusDrift,
    spectralCurtains,
    prismBeams,
} from "./futuristic-canvas/effects-cosmic";
import {
    inkBloom,
    brushStrokes,
    ditherField,
    stainedGlass,
    livePen,
    grainMesh,
    glitchScan,
    kaleidoscope,
    paperLayers,
    contourTopo,
} from "./futuristic-canvas/effects-artistic";
import {
    pendulumWave,
    moireRings,
    bokehDrift,
    warpGrid,
    ridgeline,
    phyllotaxis,
    colorField,
    rippleRain,
    glyphField,
    stringArt,
} from "./futuristic-canvas/effects-waves";
import {
    chatCascade,
    viewerPulse,
    heartsFloat,
    hypeTrain,
    pixelInvaders,
    radarSweep,
    checkerRun,
    lootPillars,
    trackLanes,
} from "./futuristic-canvas/effects-social";
import {
    bounceArcs,
    floodlights,
    runway,
    satinDrape,
    stitchPattern,
    archLight,
    isoBlocks,
    blueprintDraft,
    lidarScan,
    goldenSpiral,
    turingBloom,
    radialSpectrum,
    liquidMetaballs,
    torusKnot,
    shapeMorph,
} from "./futuristic-canvas/effects-geometry";

export { FUTURISTIC_TYPES, type FuturisticType };

const FACTORIES: Record<FuturisticType, Factory> = {
    eventHorizon,
    silkFilaments,
    chatCascade,
    viewerPulse,
    heartsFloat,
    turingBloom,
    radialSpectrum,
    liquidMetaballs,
    torusKnot,
    shapeMorph,
    hypeTrain,
    pixelInvaders,
    radarSweep,
    checkerRun,
    lootPillars,
    trackLanes,
    bounceArcs,
    floodlights,
    runway,
    satinDrape,
    stitchPattern,
    archLight,
    isoBlocks,
    blueprintDraft,
    lidarScan,
    goldenSpiral,
    orbitalGlobe,
    hypercube,
    halftoneTide,
    harmonograph,
    flowField,
    plexusDrift,
    spectralCurtains,
    prismBeams,
    inkBloom,
    brushStrokes,
    ditherField,
    stainedGlass,
    livePen,
    grainMesh,
    glitchScan,
    kaleidoscope,
    paperLayers,
    contourTopo,
    pendulumWave,
    moireRings,
    bokehDrift,
    warpGrid,
    ridgeline,
    phyllotaxis,
    colorField,
    rippleRain,
    glyphField,
    stringArt,
};

interface Props {
    type: FuturisticType;
    colors: string[];
    intensity: number;
    speed: number;
    dark: boolean;
}

export const FuturisticCanvas: React.FC<Props> = ({
    type,
    colors,
    intensity,
    speed,
    dark,
}) => {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        const parent = canvas?.parentElement;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !parent || !ctx) return;

        const reduced = window.matchMedia?.(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        const sp = speed * (reduced ? 0.2 : 1);
        const o: Opts = {
            colors: dark ? colors : colors.map((c) => mix(c, "#14141c", 0.45)),
            intensity,
            dark,
            bg: dark ? "#0a0a0a" : "#f5f5f5",
        };

        let raf = 0,
            frame: Frame = () => {};
        const start = performance.now();

        const setup = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = parent.clientWidth,
                h = parent.clientHeight;
            if (!w || !h) return;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.fillStyle = o.bg;
            ctx.fillRect(0, 0, w, h);
            frame = FACTORIES[type](ctx, w, h, o);
        };
        const loop = (now: number) => {
            frame(((now - start) / 1000) * sp);
            raf = requestAnimationFrame(loop);
        };

        const ro = new ResizeObserver(setup);
        ro.observe(parent);
        setup();
        raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, [type, colors, intensity, speed, dark]);

    return (
        <canvas ref={ref} className="absolute inset-0 block w-full h-full" />
    );
};
