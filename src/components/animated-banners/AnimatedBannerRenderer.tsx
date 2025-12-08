// src/components/animated-banners/AnimatedBannerRenderer.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { GlitchMatrix } from './GlitchMatrix';
import { EsportsHUD } from './EsportsHUD';
import { InkFlow } from './InkFlow';
import { VTuberFrameOverlay } from './VTuberFrame';
import type { AnimatedBannerDesign } from '@/types/animatedBanner';

interface AnimatedBannerRendererProps {
  design: AnimatedBannerDesign;
  className?: string;
}

// Simple particle background for preview
const SimpleParticles: React.FC<{ color: string; count?: number }> = ({ 
  color, 
  count = 20 
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
          boxShadow: `0 0 6px ${color}`
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
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

// Animated rings
const AnimatedRings: React.FC<{ colors: string[] }> = ({ colors }) => (
  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
    {colors.map((color, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full border-2"
        style={{
          borderColor: color,
          width: `${60 + i * 30}%`,
          height: `${120 + i * 40}%`,
          boxShadow: `0 0 20px ${color}40, inset 0 0 20px ${color}20`
        }}
        animate={{
          rotate: i % 2 === 0 ? 360 : -360,
          scale: [1, 1.05, 1],
        }}
        transition={{
          rotate: {
            duration: 10 + i * 5,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />
    ))}
  </div>
);

// Flame effect
const FlameEffect: React.FC<{ primary: string; secondary: string }> = ({ 
  primary, 
  secondary 
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
        ease: "easeInOut"
      }}
    />
    {Array.from({ length: 30 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full"
        style={{
          background: i % 2 === 0 ? primary : secondary,
          left: `${30 + Math.random() * 40}%`,
          bottom: '0%',
          boxShadow: `0 0 4px ${i % 2 === 0 ? primary : secondary}`
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
          ease: "easeOut"
        }}
      />
    ))}
  </div>
);

// Aurora waves
const AuroraEffect: React.FC<{ colors: string[] }> = ({ colors }) => (
  <div className="absolute inset-0 overflow-hidden">
    {colors.map((color, i) => (
      <motion.div
        key={i}
        className="absolute w-[200%] h-16"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
          top: `${20 + i * 20}%`,
          left: '-50%',
          filter: 'blur(8px)',
        }}
        animate={{
          x: ['-25%', '25%', '-25%'],
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
const CrystalEffect: React.FC<{ color: string }> = ({ color }) => (
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
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          boxShadow: `0 0 30px ${color}60`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
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
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
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

export const AnimatedBannerRenderer: React.FC<AnimatedBannerRendererProps> = ({
  design,
  className = ''
}) => {
  const renderContent = () => {
    switch (design.id) {
      case 'cosmic-swarm':
        return <SimpleParticles color={design.particleSettings?.color || '#a855f7'} count={30} />;
      case 'neon-rings':
        return <AnimatedRings colors={['#00ffff', '#ff00ff', '#00ff88']} />;
      case 'liquid-chrome':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-20 h-20 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #888, #fff, #888)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                borderRadius: ['50%', '40%', '50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        );
      case 'aurora-flow':
        return <AuroraEffect colors={['#00ff88', '#00aaff', '#ff00aa']} />;
      case 'glitch-matrix':
        return <GlitchMatrix color="#00ff00" />;
      case 'vtuber-frame':
        return (
          <>
            <SimpleParticles color="#ff69b4" count={15} />
            <VTuberFrameOverlay />
          </>
        );
      case 'esports-hud':
        return <EsportsHUD primaryColor="#ff4444" />;
      case 'ink-flow':
        return <InkFlow primaryColor="#1a1a2e" secondaryColor="#d4af37" />;
      case 'crystal-prism':
        return <CrystalEffect color="#ffffff" />;
      case 'phoenix-flame':
        return (
          <FlameEffect 
            primary={design.particleSettings?.color || '#ff4400'}
            secondary={design.particleSettings?.colorVariant || '#ffaa00'}
          />
        );
      default:
        return <SimpleParticles color="#a855f7" count={20} />;
    }
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: design.preview }}
    >
      {renderContent()}
    </div>
  );
};
