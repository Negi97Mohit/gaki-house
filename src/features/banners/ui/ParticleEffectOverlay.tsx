// src/components/ParticleEffectOverlay.tsx
import React, { useEffect, useRef, useCallback } from "react";
import { ParticleSystem, EffectType } from "@/lib/particleEffects";

interface ParticleEffectOverlayProps {
  effectType: EffectType;
  playing?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ParticleEffectOverlay: React.FC<ParticleEffectOverlayProps> = ({
  effectType,
  playing = true,
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef<ParticleSystem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const initSystem = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    if (systemRef.current) {
      systemRef.current.stop();
    }

    systemRef.current = new ParticleSystem(canvas, effectType);
    
    if (playing) {
      systemRef.current.start();
    }
  }, [effectType, playing]);

  useEffect(() => {
    initSystem();

    const handleResize = () => {
      if (canvasRef.current && containerRef.current && systemRef.current) {
        systemRef.current.resize(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (systemRef.current) {
        systemRef.current.stop();
      }
    };
  }, [initSystem]);

  useEffect(() => {
    if (systemRef.current) {
      if (playing) {
        systemRef.current.start();
      } else {
        systemRef.current.stop();
      }
    }
  }, [playing]);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ 
        position: 'absolute', 
        inset: 0, 
        pointerEvents: 'none',
        overflow: 'hidden',
        ...style 
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default ParticleEffectOverlay;
