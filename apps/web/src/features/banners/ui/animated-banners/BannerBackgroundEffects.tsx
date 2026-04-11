// src/components/animated-banners/BannerBackgroundEffects.tsx
import React from "react";
import { motion } from "framer-motion";

// Simple particle background for preview
export const SimpleParticles: React.FC<{ color: string; count?: number }> = ({
  color,
  count = 20,
}) => (
  <div className="absolute inset-0 overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full"
        style={{
          background: color,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          boxShadow: `0 0 6px ${color}`,
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, Math.random() * 20 - 10, 0],
          opacity: [0.3, 1, 0.3],
          scale: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// Animated rings
export const AnimatedRings: React.FC<{ colors: string[] }> = ({ colors }) => (
  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
    {colors.map((color, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border-2"
        style={{
          borderColor: color,
          width: `${60 + i * 30}%`,
          height: `${120 + i * 40}%`,
          boxShadow: `0 0 20px ${color}40, inset 0 0 20px ${color}20`,
        }}
        animate={{
          rotate: i % 2 === 0 ? 360 : -360,
          scale: [1, 1.05, 1],
        }}
        transition={{
          rotate: {
            duration: 10 + i * 5,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />
    ))}
  </div>
);

// Flame effect
export const FlameEffect: React.FC<{ primary: string; secondary: string }> = ({
  primary,
  secondary,
}) => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2"
      style={{
        background: `radial-gradient(ellipse at bottom, ${primary}60, transparent 70%)`,
      }}
      animate={{
        opacity: [0.6, 1, 0.6],
        scaleY: [1, 1.1, 1],
      }}
      transition={{
        duration: 0.3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    {Array.from({ length: 30 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full"
        style={{
          background: i % 2 === 0 ? primary : secondary,
          left: `${30 + Math.random() * 40}%`,
          bottom: "0%",
          boxShadow: `0 0 4px ${i % 2 === 0 ? primary : secondary}`,
        }}
        animate={{
          y: [0, -80 - Math.random() * 40],
          x: [0, (Math.random() - 0.5) * 30],
          opacity: [1, 0],
          scale: [1, 0.3],
        }}
        transition={{
          duration: 1 + Math.random(),
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: "easeOut",
        }}
      />
    ))}
  </div>
);

// Aurora waves
export const AuroraEffect: React.FC<{ colors: string[] }> = ({ colors }) => (
  <div className="absolute inset-0 overflow-hidden">
    {colors.map((color, i) => (
      <motion.div
        key={i}
        className="absolute w-[200%] h-16"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
          top: `${20 + i * 20}%`,
          left: "-50%",
          filter: "blur(8px)",
        }}
        animate={{
          x: ["-25%", "25%", "-25%"],
          scaleY: [1, 1.5, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 8 + i * 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.5,
        }}
      />
    ))}
  </div>
);

// Crystal effect
export const CrystalEffect: React.FC<{ color: string }> = ({ color }) => (
  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
    <motion.div
      className="relative"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      {/* Main crystal */}
      <motion.div
        className="w-16 h-16"
        style={{
          background: `linear-gradient(135deg, ${color}80, transparent, ${color}40)`,
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          boxShadow: `0 0 30px ${color}60`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
    {/* Orbiting shards */}
    {Array.from({ length: 6 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-4 h-4"
        style={{
          background: `linear-gradient(135deg, ${color}60, transparent)`,
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 8 + i,
          repeat: Infinity,
          ease: "linear",
        }}
        initial={{
          x: Math.cos((i / 6) * Math.PI * 2) * 50,
          y: Math.sin((i / 6) * Math.PI * 2) * 50,
        }}
      />
    ))}
  </div>
);

// Cyber Grid effect
export const CyberGrid: React.FC<{ color: string }> = ({ color }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: `
          linear-gradient(${color}33 1px, transparent 1px),
          linear-gradient(90deg, ${color}33 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
    <motion.div
      className="absolute left-0 right-0 h-[2px]"
      style={{
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }}
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// Retro Wave effect
export const RetroWaveEffect: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Sun */}
    <motion.div
      className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full"
      style={{
        background: "linear-gradient(180deg, #ff6600 0%, #ff0066 100%)",
        boxShadow: "0 0 60px #ff006680",
      }}
      animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    {/* Grid lines */}
    <div
      className="absolute bottom-0 left-0 right-0 h-1/2"
      style={{
        background: `
          linear-gradient(transparent 0%, #ff006620 100%),
          repeating-linear-gradient(90deg, #ff006640 0px, transparent 1px, transparent 40px),
          repeating-linear-gradient(180deg, #ff006640 0px, transparent 1px, transparent 20px)
        `,
        transform: "perspective(200px) rotateX(60deg)",
        transformOrigin: "bottom",
      }}
    />
  </div>
);

// Hologram Scan effect
export const HologramScan: React.FC<{ color: string }> = ({ color }) => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Scan lines */}
    <div
      className="absolute inset-0 opacity-30"
      style={{
        background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${color}20 2px, ${color}20 4px)`,
      }}
    />
    {/* Moving scan bar */}
    <motion.div
      className="absolute left-0 right-0 h-8"
      style={{
        background: `linear-gradient(180deg, transparent, ${color}60, transparent)`,
      }}
      animate={{ top: ["-10%", "110%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
    {/* Glitch flicker */}
    <motion.div
      className="absolute inset-0"
      style={{ background: color }}
      animate={{ opacity: [0, 0.1, 0, 0.05, 0] }}
      transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
    />
  </div>
);

// Ocean Caustics effect
export const OceanCaustics: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-full h-full"
        style={{
          background: `radial-gradient(ellipse at ${30 + i * 10}% ${
            40 + i * 5
          }%, #66ccff30 0%, transparent 50%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: ["-5%", "5%", "-5%"],
        }}
        transition={{
          duration: 4 + i,
          repeat: Infinity,
          delay: i * 0.5,
        }}
      />
    ))}
  </div>
);

// Lightning Effect
export const LightningEffect: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Background flash */}
    <motion.div
      className="absolute inset-0 bg-white"
      animate={{ opacity: [0, 0, 0.3, 0, 0, 0] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        times: [0, 0.4, 0.42, 0.44, 0.5, 1],
      }}
    />
    {/* Lightning bolt */}
    <motion.div
      className="absolute top-0 left-1/2 w-1 h-1/2"
      style={{
        background: "linear-gradient(180deg, #ffffff, #aaccff)",
        boxShadow: "0 0 20px #aaccff, 0 0 40px #aaccff",
        clipPath:
          "polygon(50% 0%, 60% 30%, 55% 30%, 65% 60%, 45% 60%, 55% 100%, 40% 50%, 50% 50%, 40% 20%, 50% 20%)",
      }}
      animate={{
        opacity: [0, 0, 1, 1, 0, 0],
        scaleY: [0.8, 0.8, 1, 1, 0.8, 0.8],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        times: [0, 0.39, 0.4, 0.45, 0.46, 1],
      }}
    />
  </div>
);

// Sakura Petals
export const SakuraPetals: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-3 h-3 rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, #ffaacc, #ff88aa)`,
          left: `${Math.random() * 100}%`,
          top: "-5%",
          borderRadius: "50% 0 50% 50%",
          transform: `rotate(${Math.random() * 360}deg)`,
        }}
        animate={{
          y: ["0vh", "110vh"],
          x: [0, Math.sin(i) * 50],
          rotate: [0, 360],
          opacity: [0.8, 0.6],
        }}
        transition={{
          duration: 6 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: "linear",
        }}
      />
    ))}
  </div>
);

// Rain Effect
export const RainEffect: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 50 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-[1px] h-4 bg-gradient-to-b from-transparent to-blue-300/50"
        style={{
          left: `${Math.random() * 100}%`,
          top: "-10%",
        }}
        animate={{
          y: ["0vh", "110vh"],
        }}
        transition={{
          duration: 0.5 + Math.random() * 0.3,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: "linear",
        }}
      />
    ))}
  </div>
);
