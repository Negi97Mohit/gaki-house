// src/components/animated-banners/BannerBackgroundRenderer.tsx
import React from "react";
import { motion } from "framer-motion";
import type { AnimatedBannerDesign } from "@caption-cam/core/types/animatedBanner";
import { GlitchMatrix } from "./GlitchMatrix";
import { EsportsHUD } from "./EsportsHUD";
import { InkFlow } from "./InkFlow";
import { VTuberFrameOverlay } from "./VTuberFrame";
import {
  SimpleParticles,
  AnimatedRings,
  AuroraEffect,
  FlameEffect,
  CrystalEffect,
  CyberGrid,
  RetroWaveEffect,
  HologramScan,
  OceanCaustics,
  LightningEffect,
  SakuraPetals,
  RainEffect,
} from "./BannerBackgroundEffects";

interface BannerBackgroundRendererProps {
  design: AnimatedBannerDesign;
}

export const BannerBackgroundRenderer: React.FC<
  BannerBackgroundRendererProps
> = ({ design }) => {
  switch (design.id) {
    case "cosmic-swarm":
      return (
        <SimpleParticles
          color={design.particleSettings?.color || "#a855f7"}
          count={30}
        />
      );
    case "neon-rings":
      return <AnimatedRings colors={["#00ffff", "#ff00ff", "#00ff88"]} />;
    case "liquid-chrome":
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-20 h-20 rounded-full"
            style={{
              background: "linear-gradient(135deg, #888, #fff, #888)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              borderRadius: ["50%", "40%", "50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      );
    case "aurora-flow":
      return <AuroraEffect colors={["#00ff88", "#00aaff", "#ff00aa"]} />;
    case "glitch-matrix":
      return <GlitchMatrix color="#00ff00" />;
    case "vtuber-frame":
      return (
        <>
          <SimpleParticles color="#ff66aa" count={15} />
          <VTuberFrameOverlay />
        </>
      );
    case "esports-hud":
      return <EsportsHUD primaryColor="#ff4444" />;
    case "ink-flow":
      return <InkFlow primaryColor="#1a1a2e" secondaryColor="#d4af37" />;
    case "crystal-prism":
      return <CrystalEffect color="#ffffff" />;
    case "phoenix-flame":
      return (
        <FlameEffect
          primary={design.particleSettings?.color || "#ff4400"}
          secondary={design.particleSettings?.colorVariant || "#ffaa00"}
        />
      );
    case "cyber-pulse":
      return (
        <>
          <CyberGrid color="#00ffcc" />
          <SimpleParticles color="#ff00ff" count={25} />
        </>
      );
    case "nebula-drift":
      return (
        <>
          <AuroraEffect colors={["#ff66aa", "#6666ff", "#aa66ff"]} />
          <SimpleParticles color="#ffffff" count={40} />
        </>
      );
    case "retro-wave":
      return <RetroWaveEffect />;
    case "hologram-scan":
      return (
        <>
          <HologramScan color="#00ffff" />
          <SimpleParticles color="#00ffff" count={15} />
        </>
      );
    case "forest-spirits":
      return <SimpleParticles color="#88ff88" count={40} />;
    case "ocean-depths":
      return (
        <>
          <OceanCaustics />
          <SimpleParticles color="#66ccff" count={50} />
        </>
      );
    case "electric-storm":
      return <LightningEffect />;
    case "sakura-petals":
      return <SakuraPetals />;
    case "neon-city":
      return (
        <>
          <RainEffect />
          <SimpleParticles color="#ff66aa" count={30} />
        </>
      );
    case "golden-particles":
      return <SimpleParticles color="#ffd700" count={60} />;
    default:
      return (
        <SimpleParticles
          color={design.particleSettings?.color || "#a855f7"}
          count={20}
        />
      );
  }
};
