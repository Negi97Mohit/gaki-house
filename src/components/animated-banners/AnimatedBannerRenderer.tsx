// src/components/animated-banners/AnimatedBannerRenderer.tsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ParticleField } from './ParticleField';
import { NeonRings } from './NeonRings';
import { CrystalPrism } from './CrystalPrism';
import { FlameEmbers } from './FlameEmbers';
import { AuroraWaves } from './AuroraWaves';
import { GlitchMatrix } from './GlitchMatrix';
import { LiquidChrome } from './LiquidChrome';
import { FloatingGems, StarSparkles, VTuberFrameOverlay } from './VTuberFrame';
import { EsportsHUD } from './EsportsHUD';
import { InkFlow } from './InkFlow';
import type { AnimatedBannerDesign } from '@/types/animatedBanner';

interface AnimatedBannerRendererProps {
  design: AnimatedBannerDesign;
  className?: string;
}

export const AnimatedBannerRenderer: React.FC<AnimatedBannerRendererProps> = ({
  design,
  className = ''
}) => {
  const render3DContent = () => {
    switch (design.id) {
      case 'cosmic-swarm':
        return (
          <>
            <ParticleField 
              count={design.particleSettings?.count || 500}
              color={design.particleSettings?.color}
              colorVariant={design.particleSettings?.colorVariant}
            />
            <EffectComposer>
              <Bloom intensity={2} luminanceThreshold={0.2} />
            </EffectComposer>
          </>
        );
      case 'neon-rings':
        return (
          <>
            <NeonRings colors={['#00ffff', '#ff00ff', '#00ff88']} />
            <EffectComposer>
              <Bloom intensity={1.5} luminanceThreshold={0.1} />
            </EffectComposer>
          </>
        );
      case 'liquid-chrome':
        return <LiquidChrome />;
      case 'aurora-flow':
        return (
          <>
            <AuroraWaves />
            <EffectComposer>
              <Bloom intensity={1} luminanceThreshold={0.3} />
            </EffectComposer>
          </>
        );
      case 'vtuber-frame':
        return (
          <>
            <FloatingGems count={8} color="#ff69b4" />
            <StarSparkles count={30} />
            <EffectComposer>
              <Bloom intensity={1.2} luminanceThreshold={0.2} />
            </EffectComposer>
          </>
        );
      case 'crystal-prism':
        return (
          <>
            <CrystalPrism />
            <EffectComposer>
              <Bloom intensity={2} luminanceThreshold={0.15} />
            </EffectComposer>
          </>
        );
      case 'phoenix-flame':
        return (
          <>
            <FlameEmbers 
              count={design.particleSettings?.count || 300}
              colorPrimary={design.particleSettings?.color}
              colorSecondary={design.particleSettings?.colorVariant}
            />
            <EffectComposer>
              <Bloom intensity={3} luminanceThreshold={0.2} />
            </EffectComposer>
          </>
        );
      default:
        return <ParticleField count={200} />;
    }
  };

  const render2DOverlay = () => {
    switch (design.id) {
      case 'glitch-matrix':
        return <GlitchMatrix color="#00ff00" />;
      case 'esports-hud':
        return <EsportsHUD primaryColor="#ff4444" />;
      case 'ink-flow':
        return <InkFlow primaryColor="#1a1a2e" secondaryColor="#d4af37" />;
      case 'vtuber-frame':
        return <VTuberFrameOverlay />;
      default:
        return null;
    }
  };

  const needs3D = ['cosmic-swarm', 'neon-rings', 'liquid-chrome', 'aurora-flow', 'vtuber-frame', 'crystal-prism', 'phoenix-flame'].includes(design.id);
  const needs2D = ['glitch-matrix', 'esports-hud', 'ink-flow', 'vtuber-frame'].includes(design.id);

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: design.preview }}
    >
      {needs3D && (
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          className="absolute inset-0"
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            {render3DContent()}
          </Suspense>
          <ambientLight intensity={0.3} />
        </Canvas>
      )}
      
      {needs2D && render2DOverlay()}
    </div>
  );
};
