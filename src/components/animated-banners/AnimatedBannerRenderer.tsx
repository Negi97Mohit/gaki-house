// src/components/animated-banners/AnimatedBannerRenderer.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { GlitchMatrix } from './GlitchMatrix';
import { EsportsHUD } from './EsportsHUD';
import { InkFlow } from './InkFlow';
import { VTuberFrameOverlay } from './VTuberFrame';
import type { AnimatedBannerDesign } from '@/types/animatedBanner';

export interface BannerContentData {
  name?: string;
  tagline?: string;
  avatarUrl?: string;
  links?: { platform: string; url: string }[];
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
}

interface AnimatedBannerRendererProps {
  design: AnimatedBannerDesign;
  className?: string;
  contentData?: BannerContentData;
  isEditing?: boolean;
  onContentChange?: (field: keyof BannerContentData, value: any) => void;
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

// Cyber Grid effect
const CyberGrid: React.FC<{ color: string }> = ({ color }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: `
          linear-gradient(${color}33 1px, transparent 1px),
          linear-gradient(90deg, ${color}33 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    />
    <motion.div
      className="absolute left-0 right-0 h-[2px]"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      animate={{ top: ['0%', '100%'] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

// Retro Wave effect
const RetroWaveEffect: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Sun */}
    <motion.div
      className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full"
      style={{
        background: 'linear-gradient(180deg, #ff6600 0%, #ff0066 100%)',
        boxShadow: '0 0 60px #ff006680',
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
        transform: 'perspective(200px) rotateX(60deg)',
        transformOrigin: 'bottom',
      }}
    />
  </div>
);

// Hologram Scan effect
const HologramScan: React.FC<{ color: string }> = ({ color }) => (
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
      animate={{ top: ['-10%', '110%'] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
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
const OceanCaustics: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-full h-full"
        style={{
          background: `radial-gradient(ellipse at ${30 + i * 10}% ${40 + i * 5}%, #66ccff30 0%, transparent 50%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: ['-5%', '5%', '-5%'],
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
const LightningEffect: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Background flash */}
    <motion.div
      className="absolute inset-0 bg-white"
      animate={{ opacity: [0, 0, 0.3, 0, 0, 0] }}
      transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.42, 0.44, 0.5, 1] }}
    />
    {/* Lightning bolt */}
    <motion.div
      className="absolute top-0 left-1/2 w-1 h-1/2"
      style={{
        background: 'linear-gradient(180deg, #ffffff, #aaccff)',
        boxShadow: '0 0 20px #aaccff, 0 0 40px #aaccff',
        clipPath: 'polygon(50% 0%, 60% 30%, 55% 30%, 65% 60%, 45% 60%, 55% 100%, 40% 50%, 50% 50%, 40% 20%, 50% 20%)',
      }}
      animate={{ opacity: [0, 0, 1, 1, 0, 0], scaleY: [0.8, 0.8, 1, 1, 0.8, 0.8] }}
      transition={{ duration: 4, repeat: Infinity, times: [0, 0.39, 0.4, 0.45, 0.46, 1] }}
    />
  </div>
);

// Sakura Petals
const SakuraPetals: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-3 h-3 rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, #ffaacc, #ff88aa)`,
          left: `${Math.random() * 100}%`,
          top: '-5%',
          borderRadius: '50% 0 50% 50%',
          transform: `rotate(${Math.random() * 360}deg)`,
        }}
        animate={{
          y: ['0vh', '110vh'],
          x: [0, Math.sin(i) * 50],
          rotate: [0, 360],
          opacity: [0.8, 0.6],
        }}
        transition={{
          duration: 6 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: 'linear',
        }}
      />
    ))}
  </div>
);

// Rain Effect
const RainEffect: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 50 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-[1px] h-4 bg-gradient-to-b from-transparent to-blue-300/50"
        style={{
          left: `${Math.random() * 100}%`,
          top: '-10%',
        }}
        animate={{
          y: ['0vh', '110vh'],
        }}
        transition={{
          duration: 0.5 + Math.random() * 0.3,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: 'linear',
        }}
      />
    ))}
  </div>
);

export const AnimatedBannerRenderer: React.FC<AnimatedBannerRendererProps> = ({
  design,
  className = '',
  contentData,
  isEditing = false,
  onContentChange
}) => {
  const data = contentData || {
    name: 'Your Name',
    tagline: 'Creator • Streamer',
    primaryColor: design.particleSettings?.color || '#a855f7',
    secondaryColor: design.particleSettings?.colorVariant || '#3b82f6',
    backgroundColor: design.preview,
  };
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
      case 'cyber-pulse':
        return (
          <>
            <CyberGrid color="#00ffcc" />
            <SimpleParticles color="#ff00ff" count={25} />
          </>
        );
      case 'nebula-drift':
        return (
          <>
            <AuroraEffect colors={['#ff66aa', '#6666ff', '#aa66ff']} />
            <SimpleParticles color="#ffffff" count={40} />
          </>
        );
      case 'retro-wave':
        return <RetroWaveEffect />;
      case 'hologram-scan':
        return (
          <>
            <HologramScan color="#00ffff" />
            <SimpleParticles color="#00ffff" count={15} />
          </>
        );
      case 'forest-spirits':
        return <SimpleParticles color="#88ff88" count={40} />;
      case 'ocean-depths':
        return (
          <>
            <OceanCaustics />
            <SimpleParticles color="#66ccff" count={50} />
          </>
        );
      case 'electric-storm':
        return <LightningEffect />;
      case 'sakura-petals':
        return <SakuraPetals />;
      case 'neon-city':
        return (
          <>
            <RainEffect />
            <SimpleParticles color="#ff66aa" count={30} />
          </>
        );
      case 'golden-particles':
        return <SimpleParticles color="#ffd700" count={60} />;
      default:
        return <SimpleParticles color={design.particleSettings?.color || '#a855f7'} count={20} />;
    }
  };

  // Social icon helper
  const getSocialIcon = (platform: string) => {
    const icons: Record<string, string> = {
      twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
      youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
      twitch: 'M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z',
      discord: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z',
      instagram: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z',
    };
    return icons[platform.toLowerCase()] || icons.twitter;
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: data.backgroundColor || design.preview }}
    >
      {/* Animated background effects */}
      {renderContent()}
      
      {/* Banner content overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="flex items-center gap-4 px-6 py-4 max-w-full">
          {/* Avatar */}
          {design.showAvatar && (
            <motion.div
              className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white/30"
              style={{ 
                background: `linear-gradient(135deg, ${data.primaryColor || '#667eea'}, ${data.secondaryColor || '#764ba2'})`,
                boxShadow: `0 0 20px ${data.primaryColor || '#667eea'}40`
              }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {data.avatarUrl ? (
                <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Text content */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <motion.span
              className="text-white font-bold text-sm sm:text-lg md:text-xl truncate"
              style={{ 
                textShadow: `0 0 10px ${data.primaryColor || '#667eea'}80`,
              }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => onContentChange?.('name', e.currentTarget.textContent)}
            >
              {data.name || 'Your Name'}
            </motion.span>
            {design.showTagline && (
              <motion.span
                className="text-white/80 text-xs sm:text-sm truncate"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => onContentChange?.('tagline', e.currentTarget.textContent)}
              >
                {data.tagline || 'Creator • Streamer'}
              </motion.span>
            )}
          </div>
          
          {/* Social links */}
          {data.links && data.links.length > 0 && (
            <div className="flex gap-2 flex-shrink-0">
              {data.links.slice(0, design.maxLinks).map((link, i) => (
                <motion.a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  animate={{ 
                    boxShadow: [
                      `0 0 10px ${data.primaryColor || '#667eea'}40`,
                      `0 0 20px ${data.primaryColor || '#667eea'}60`,
                      `0 0 10px ${data.primaryColor || '#667eea'}40`
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d={getSocialIcon(link.platform)} />
                  </svg>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
