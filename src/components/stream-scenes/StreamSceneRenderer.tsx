// src/components/stream-scenes/StreamSceneRenderer.tsx

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { StreamSceneType, StreamStyleTheme } from '@/types/streamStyle';
import { cn } from '@/lib/utils';

interface StreamSceneRendererProps {
  sceneType: StreamSceneType;
  theme: StreamStyleTheme;
  customText?: string;
  customSubText?: string;
  showCamera?: boolean;
  className?: string;
}

export const StreamSceneRenderer: React.FC<StreamSceneRendererProps> = ({
  sceneType,
  theme,
  customText,
  customSubText,
  showCamera = false,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const subTextRef = useRef<HTMLDivElement>(null);

  // Scene-specific text defaults
  const getSceneText = () => {
    const texts: Record<StreamSceneType, { main: string; sub?: string }> = {
      'starting-soon': { main: 'Starting Soon', sub: 'Stream will be' },
      'live': { main: 'LIVE', sub: undefined },
      'brb': { main: 'Be Right Back', sub: 'Stream will be' },
      'intermission': { main: 'Intermission', sub: 'Taking a break' },
      'ending': { main: 'Ending Soon', sub: 'Stream will be' },
      'offline': { main: 'Offline', sub: 'Stream is' }
    };
    return {
      main: customText || texts[sceneType].main,
      sub: customSubText || texts[sceneType].sub
    };
  };

  const { main: mainText, sub: subText } = getSceneText();

  // Initialize animations
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate main text
      if (textRef.current) {
        gsap.fromTo(textRef.current, 
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'expo.out' }
        );

        // Add floating animation
        gsap.to(textRef.current, {
          y: 5,
          duration: 3,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });

        // Glow pulse for neon themes
        if (theme.effects.glow) {
          gsap.to(textRef.current, {
            keyframes: [
              { textShadow: `0 0 20px ${theme.colors.glow}, 0 0 40px ${theme.colors.glow}` },
              { textShadow: `0 0 40px ${theme.colors.glow}, 0 0 80px ${theme.colors.glow}` },
              { textShadow: `0 0 20px ${theme.colors.glow}, 0 0 40px ${theme.colors.glow}` }
            ],
            duration: 2,
            repeat: -1,
            ease: 'sine.inOut'
          });
        }
      }

      // Animate sub text
      if (subTextRef.current) {
        gsap.fromTo(subTextRef.current,
          { opacity: 0, y: 20 },
          { opacity: 0.8, y: 0, duration: 1, delay: 0.3, ease: 'expo.out' }
        );
      }

      // Create particles
      if (theme.effects.particles && particlesRef.current) {
        createParticles(particlesRef.current, theme);
      }
    }, containerRef);

    return () => ctx.revert();
  }, [sceneType, theme]);

  // Get background based on theme
  const getBackground = () => {
    if (theme.category === 'anime') {
      return `linear-gradient(135deg, 
        hsl(340, 60%, 80%) 0%, 
        hsl(20, 50%, 85%) 30%, 
        hsl(280, 50%, 75%) 70%, 
        hsl(340, 60%, 80%) 100%
      )`;
    } else if (theme.category === 'neon') {
      return `linear-gradient(135deg, 
        hsl(260, 40%, 8%) 0%, 
        hsl(280, 50%, 15%) 50%, 
        hsl(260, 40%, 8%) 100%
      )`;
    }
    return `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.secondary}40 100%)`;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden',
        className
      )}
      style={{
        background: getBackground(),
        fontFamily: theme.fonts.body
      }}
    >
      {/* Animated background elements */}
      {theme.category === 'anime' && <SakuraBackground />}
      {theme.category === 'neon' && <NeonBackground theme={theme} />}

      {/* Particles container */}
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 1 }}
      />

      {/* Scanlines for neon theme */}
      {theme.effects.scanlines && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
            zIndex: 10
          }}
        />
      )}

      {/* Main content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full">
        {/* Sub text (above main) */}
        {subText && (
          <div
            ref={subTextRef}
            className="text-lg md:text-xl tracking-[0.3em] uppercase mb-4 opacity-0"
            style={{
              color: theme.colors.text,
              fontFamily: theme.fonts.body,
              textShadow: theme.effects.glow 
                ? `0 0 10px ${theme.colors.glow}40` 
                : 'none'
            }}
          >
            {subText}
          </div>
        )}

        {/* Main text */}
        <div
          ref={textRef}
          className="text-6xl md:text-8xl lg:text-9xl font-bold opacity-0"
          style={{
            fontFamily: theme.fonts.heading,
            color: theme.colors.text,
            textShadow: theme.category === 'neon' 
              ? `0 0 20px ${theme.colors.primary}, 0 0 40px ${theme.colors.primary}, 0 0 60px ${theme.colors.secondary}`
              : `2px 2px 4px rgba(0,0,0,0.3), 0 4px 20px ${theme.colors.primary}60`
          }}
        >
          {mainText}
        </div>

        {/* Camera placeholder for intermission/live scenes */}
        {showCamera && sceneType === 'intermission' && (
          <div
            className="absolute rounded-xl border-4 overflow-hidden"
            style={{
              width: '60%',
              height: '50%',
              top: '15%',
              left: '5%',
              borderColor: theme.colors.primary,
              background: 'rgba(0,0,0,0.3)',
              boxShadow: theme.effects.glow 
                ? `0 0 30px ${theme.colors.glow}50, inset 0 0 20px ${theme.colors.glow}20`
                : '0 10px 40px rgba(0,0,0,0.3)'
            }}
          >
            <div className="flex items-center justify-center h-full text-white/50">
              Camera Feed
            </div>
          </div>
        )}
      </div>

      {/* Bottom decorative elements */}
      {theme.category === 'anime' && (
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
          <svg viewBox="0 0 1920 200" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,200 Q480,100 960,150 T1920,100 L1920,200 Z"
              fill={theme.colors.secondary}
              opacity="0.4"
            />
            <path
              d="M0,200 Q480,150 960,180 T1920,120 L1920,200 Z"
              fill={theme.colors.primary}
              opacity="0.3"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

// Helper to create particles with GSAP
function createParticles(container: HTMLDivElement, theme: StreamStyleTheme) {
  container.innerHTML = '';

  const particleCount = theme.category === 'anime' ? 30 : 20;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'stream-particle';
    
    if (theme.category === 'anime') {
      // Sakura petals
      particle.innerHTML = '🌸';
      particle.style.fontSize = `${Math.random() * 16 + 12}px`;
    } else if (theme.category === 'neon') {
      // Neon dots
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.borderRadius = '50%';
      particle.style.background = Math.random() > 0.5 ? theme.colors.primary : theme.colors.secondary;
      particle.style.boxShadow = `0 0 10px ${theme.colors.glow}`;
    } else {
      // Generic particles
      particle.style.width = '4px';
      particle.style.height = '4px';
      particle.style.borderRadius = '50%';
      particle.style.background = theme.colors.accent;
    }

    particle.style.position = 'absolute';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = '-20px';
    particle.style.opacity = '0';

    container.appendChild(particle);

    const duration = 4 + Math.random() * 4;
    const delay = Math.random() * 5;

    // Animate each particle
    gsap.to(particle, {
      y: window.innerHeight + 100,
      x: `+=${-100 + Math.random() * 200}`,
      rotation: -360 + Math.random() * 720,
      duration: duration,
      delay: delay,
      repeat: -1,
      ease: 'none'
    });

    // Opacity animation
    gsap.to(particle, {
      keyframes: [
        { opacity: 0, duration: 0 },
        { opacity: 0.8, duration: duration * 0.15 },
        { opacity: 0.8, duration: duration * 0.7 },
        { opacity: 0, duration: duration * 0.15 }
      ],
      delay: delay,
      repeat: -1
    });
  }
}

// Sakura-themed animated background
const SakuraBackground: React.FC = () => {
  const sunRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sun glow animation
      if (sunRef.current) {
        gsap.to(sunRef.current, {
          scale: 1.05,
          opacity: 1,
          duration: 4,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="absolute inset-0">
      {/* Radial glow */}
      <div
        ref={sunRef}
        className="absolute"
        style={{
          width: '400px',
          height: '400px',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, hsla(45, 100%, 90%, 0.8) 0%, transparent 70%)',
          filter: 'blur(20px)',
          opacity: 0.8
        }}
      />

      {/* Mountain silhouettes */}
      <svg
        className="absolute bottom-0 w-full h-1/2"
        viewBox="0 0 1920 400"
        preserveAspectRatio="none"
      >
        {/* Back mountain */}
        <path
          d="M1400,400 L1600,100 L1700,150 L1920,400 Z"
          fill="hsl(280, 40%, 60%)"
          opacity="0.5"
        />
        {/* Snow cap */}
        <path
          d="M1580,140 L1600,100 L1620,130 L1610,140 Z"
          fill="white"
          opacity="0.9"
        />
        
        {/* Hills */}
        <path
          d="M0,400 Q200,300 400,350 T800,300 T1200,350 T1600,300 L1920,400 Z"
          fill="hsl(280, 35%, 45%)"
          opacity="0.6"
        />
        <path
          d="M0,400 Q300,350 600,380 T1200,360 T1920,400 Z"
          fill="hsl(280, 30%, 35%)"
          opacity="0.7"
        />
      </svg>

      {/* Torii gate silhouette */}
      <div
        className="absolute bottom-[20%] left-1/2 -translate-x-1/2"
        style={{ width: '120px', height: '150px' }}
      >
        <svg viewBox="0 0 120 150" className="w-full h-full">
          <rect x="15" y="30" width="8" height="120" fill="hsl(340, 50%, 50%)" />
          <rect x="97" y="30" width="8" height="120" fill="hsl(340, 50%, 50%)" />
          <rect x="0" y="20" width="120" height="12" fill="hsl(340, 50%, 45%)" rx="2" />
          <rect x="5" y="50" width="110" height="8" fill="hsl(340, 50%, 55%)" />
        </svg>
      </div>

      {/* Animated cherry blossom branches */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3">
        <CherryBlossomBranch side="left" />
      </div>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 transform scale-x-[-1]">
        <CherryBlossomBranch side="right" />
      </div>
    </div>
  );
};

// Cherry blossom branch component
const CherryBlossomBranch: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
  const branchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (branchRef.current) {
        gsap.to(branchRef.current, {
          rotation: side === 'left' ? 2 : -2,
          duration: 4,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });
      }
    });

    return () => ctx.revert();
  }, [side]);

  return (
    <div ref={branchRef} className="w-full h-full">
      <svg viewBox="0 0 300 200" className="w-full h-full">
        <path
          d="M0,20 Q100,40 200,80 T280,120"
          stroke="hsl(340, 20%, 25%)"
          strokeWidth="4"
          fill="none"
        />
        {/* Blossoms */}
        {[
          { x: 80, y: 35 },
          { x: 140, y: 55 },
          { x: 180, y: 75 },
          { x: 220, y: 95 },
          { x: 260, y: 115 }
        ].map((pos, i) => (
          <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
            <circle r="8" fill="hsl(340, 80%, 85%)" />
            <circle r="4" fill="hsl(340, 80%, 75%)" />
          </g>
        ))}
      </svg>
    </div>
  );
};

// Neon city background
const NeonBackground: React.FC<{ theme: StreamStyleTheme }> = ({ theme }) => {
  const neonSignRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (neonSignRef.current) {
        const flickerElements = neonSignRef.current.querySelectorAll('.neon-flicker');
        gsap.to(flickerElements, {
          opacity: 0.6,
          duration: 0.15,
          stagger: 0.05,
          yoyo: true,
          repeat: -1,
          ease: 'steps(1)'
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={neonSignRef} className="absolute inset-0">
      {/* City gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, 
            transparent 0%, 
            ${theme.colors.background} 60%
          )`
        }}
      />

      {/* Neon glow spots */}
      <div
        className="absolute neon-flicker"
        style={{
          width: '200px',
          height: '200px',
          top: '20%',
          right: '15%',
          background: `radial-gradient(circle, ${theme.colors.secondary}40 0%, transparent 70%)`,
          filter: 'blur(40px)'
        }}
      />
      <div
        className="absolute neon-flicker"
        style={{
          width: '300px',
          height: '300px',
          bottom: '30%',
          left: '10%',
          background: `radial-gradient(circle, ${theme.colors.primary}30 0%, transparent 70%)`,
          filter: 'blur(50px)'
        }}
      />

      {/* Grid floor */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${theme.colors.background} 100%)`,
          perspective: '500px'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `
              linear-gradient(${theme.colors.primary}20 1px, transparent 1px),
              linear-gradient(90deg, ${theme.colors.primary}20 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            transform: 'rotateX(60deg)',
            transformOrigin: 'center top'
          }}
        />
      </div>
    </div>
  );
};

export default StreamSceneRenderer;
