// src/components/stream-scenes/AnimatedStreamScene.tsx
// Individual animated scene components with GSAP animations

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { StreamSceneType, StreamStyleTheme } from "@caption-cam/core/types/streamStyle";
import { cn } from "@caption-cam/core/lib/utils";

interface AnimatedStreamSceneProps {
  sceneType: StreamSceneType;
  theme: StreamStyleTheme;
  isEditing?: boolean;
  onTextChange?: (text: string) => void;
  customText?: string;
  className?: string;
}

export const AnimatedStreamScene: React.FC<AnimatedStreamSceneProps> = ({
  sceneType,
  theme,
  isEditing = false,
  onTextChange,
  customText,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !isAnimating) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1 } });

      tl.from('.animate-fade-up', {
        opacity: 0,
        y: 40,
        stagger: 0.15
      })
      .from('.animate-scale', {
        scale: 0.8,
        opacity: 0
      }, '-=0.8')
      .to('.animate-glow', {
        textShadow: `0 0 20px ${theme.colors.glow}, 0 0 40px ${theme.colors.glow}`,
        duration: 0.6
      }, '-=0.6');
    }, containerRef);

    return () => ctx.revert();
  }, [sceneType, theme, isAnimating]);

  // Render based on theme category
  if (theme.category === 'anime') {
    return (
      <SakuraScene
        ref={containerRef}
        sceneType={sceneType}
        theme={theme}
        isEditing={isEditing}
        customText={customText}
        onTextChange={onTextChange}
        className={className}
      />
    );
  }

  if (theme.category === 'neon') {
    return (
      <NeonScene
        ref={containerRef}
        sceneType={sceneType}
        theme={theme}
        isEditing={isEditing}
        customText={customText}
        onTextChange={onTextChange}
        className={className}
      />
    );
  }

  // Default gaming scene
  return (
    <GamingScene
      ref={containerRef}
      sceneType={sceneType}
      theme={theme}
      isEditing={isEditing}
      customText={customText}
      onTextChange={onTextChange}
      className={className}
    />
  );
};

// Sakura/Anime themed scene
const SakuraScene = React.forwardRef<HTMLDivElement, AnimatedStreamSceneProps>(
  ({ sceneType, theme, isEditing, customText, onTextChange, className }, ref) => {
    const petalsRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const ctx = gsap.context(() => {
        // Floating text animation
        if (textRef.current) {
          gsap.to(textRef.current, {
            y: 8,
            duration: 3,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut'
          });
        }
      });

      // Create falling petals
      if (petalsRef.current) {
        createSakuraPetals(petalsRef.current);
      }

      return () => ctx.revert();
    }, [sceneType]);

    const getText = () => {
      if (customText) return customText;
      const texts: Record<StreamSceneType, string> = {
        'starting-soon': 'Starting Soon',
        'live': 'LIVE',
        'brb': 'Be Right Back',
        'intermission': 'Intermission',
        'ending': 'Ending Soon',
        'offline': 'Offline'
      };
      return texts[sceneType];
    };

    const getSubText = () => {
      const subTexts: Record<StreamSceneType, string> = {
        'starting-soon': 'STREAM WILL BE',
        'live': '',
        'brb': 'STREAM WILL BE',
        'intermission': 'TAKING A BREAK',
        'ending': 'STREAM WILL BE',
        'offline': 'STREAM IS'
      };
      return subTexts[sceneType];
    };

    return (
      <div
        ref={ref}
        className={cn('relative w-full h-full overflow-hidden', className)}
        style={{
          background: `linear-gradient(135deg, 
            hsl(340, 60%, 82%) 0%, 
            hsl(25, 60%, 85%) 35%, 
            hsl(280, 45%, 75%) 70%, 
            hsl(340, 55%, 80%) 100%
          )`
        }}
      >
        {/* Sun glow */}
        <div
          className="absolute animate-scale"
          style={{
            width: '500px',
            height: '500px',
            top: '35%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, hsla(45, 100%, 95%, 0.9) 0%, hsla(45, 100%, 90%, 0.5) 30%, transparent 70%)',
            filter: 'blur(20px)'
          }}
        />

        {/* Mountain and landscape SVG */}
        <svg
          className="absolute bottom-0 w-full h-3/5"
          viewBox="0 0 1920 600"
          preserveAspectRatio="xMidYMax slice"
        >
          {/* Mount Fuji */}
          <path
            d="M1350,600 L1550,150 L1620,200 L1750,180 L1920,600 Z"
            fill="hsl(280, 35%, 60%)"
            className="animate-fade-up"
          />
          <path
            d="M1520,200 L1550,150 L1580,185 L1560,200 Z"
            fill="white"
            opacity="0.95"
          />
          
          {/* Back hills */}
          <path
            d="M0,600 Q200,450 400,500 T800,420 T1200,480 T1600,400 L1920,600 Z"
            fill="hsl(280, 40%, 55%)"
            opacity="0.7"
            className="animate-fade-up"
          />
          
          {/* Front hills */}
          <path
            d="M0,600 Q300,500 600,540 T1200,500 T1920,600 Z"
            fill="hsl(280, 35%, 40%)"
            className="animate-fade-up"
          />

          {/* Torii gate */}
          <g transform="translate(910, 350)" className="animate-scale">
            <rect x="20" y="50" width="12" height="180" fill="hsl(340, 45%, 45%)" />
            <rect x="128" y="50" width="12" height="180" fill="hsl(340, 45%, 45%)" />
            <rect x="0" y="35" width="160" height="18" fill="hsl(340, 40%, 40%)" rx="4" />
            <rect x="10" y="75" width="140" height="10" fill="hsl(340, 50%, 55%)" />
          </g>
        </svg>

        {/* Cherry blossom branches */}
        <svg
          className="absolute top-0 left-0 w-1/2 h-1/3"
          viewBox="0 0 400 200"
        >
          <path
            d="M-20,20 Q80,40 180,90 Q250,130 320,160"
            stroke="hsl(340, 15%, 25%)"
            strokeWidth="6"
            fill="none"
          />
          {[
            { x: 60, y: 30 }, { x: 100, y: 50 }, { x: 140, y: 70 },
            { x: 180, y: 90 }, { x: 220, y: 110 }, { x: 260, y: 130 }
          ].map((pos, i) => (
            <g key={i} transform={`translate(${pos.x}, ${pos.y})`} className="animate-scale">
              <circle r="10" fill="hsl(340, 85%, 88%)" />
              <circle r="5" fill="hsl(340, 80%, 80%)" />
            </g>
          ))}
        </svg>

        {/* Right branch */}
        <svg
          className="absolute top-0 right-0 w-1/3 h-1/4 transform scale-x-[-1]"
          viewBox="0 0 300 150"
        >
          <path
            d="M-10,0 Q60,30 140,70 Q200,100 280,120"
            stroke="hsl(340, 15%, 25%)"
            strokeWidth="5"
            fill="none"
          />
          {[
            { x: 80, y: 40 }, { x: 140, y: 70 }, { x: 200, y: 95 }, { x: 250, y: 110 }
          ].map((pos, i) => (
            <g key={i} transform={`translate(${pos.x}, ${pos.y})`} className="animate-scale">
              <circle r="8" fill="hsl(340, 85%, 88%)" />
              <circle r="4" fill="hsl(340, 80%, 80%)" />
            </g>
          ))}
        </svg>

        {/* Falling petals container */}
        <div ref={petalsRef} className="absolute inset-0 pointer-events-none overflow-hidden" />

        {/* Text content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {getSubText() && (
            <div
              className="animate-fade-up text-sm md:text-lg tracking-[0.4em] text-white/90 mb-4"
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              {getSubText()}
            </div>
          )}
          <div
            ref={textRef}
            className="animate-fade-up animate-glow text-5xl md:text-7xl lg:text-8xl font-bold text-white"
            style={{
              fontFamily: "'Satisfy', cursive",
              textShadow: '2px 4px 8px rgba(0,0,0,0.2), 0 0 40px hsla(340, 80%, 75%, 0.5)'
            }}
          >
            {getText()}
          </div>
        </div>

        {/* Camera placeholder for intermission */}
        {sceneType === 'intermission' && (
          <div
            className="absolute animate-scale rounded-2xl border-4 overflow-hidden"
            style={{
              width: '55%',
              height: '45%',
              top: '8%',
              left: '5%',
              borderColor: 'hsla(340, 60%, 75%, 0.8)',
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 0 0 8px hsla(340, 60%, 85%, 0.3)'
            }}
          >
            <div className="flex items-center justify-center h-full text-gray-400">
              Camera Feed
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Neon/Cyberpunk themed scene
const NeonScene = React.forwardRef<HTMLDivElement, AnimatedStreamSceneProps>(
  ({ sceneType, theme, isEditing, customText, onTextChange, className }, ref) => {
    const textRef = useRef<HTMLDivElement>(null);
    const glitchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const ctx = gsap.context(() => {
        // Neon flicker effect
        if (textRef.current) {
          gsap.to(textRef.current, {
            keyframes: [
              { textShadow: `0 0 10px ${theme.colors.primary}, 0 0 20px ${theme.colors.primary}, 0 0 40px ${theme.colors.secondary}` },
              { textShadow: `0 0 20px ${theme.colors.primary}, 0 0 40px ${theme.colors.primary}, 0 0 80px ${theme.colors.secondary}` },
              { textShadow: `0 0 10px ${theme.colors.primary}, 0 0 20px ${theme.colors.primary}, 0 0 40px ${theme.colors.secondary}` }
            ],
            duration: 2,
            repeat: -1,
            ease: 'sine.inOut'
          });
        }

        // Random glitch effect
        if (glitchRef.current) {
          const glitchInterval = setInterval(() => {
            gsap.to(glitchRef.current, {
              keyframes: [
                { x: 0 },
                { x: -5 },
                { x: 5 },
                { x: -2 },
                { x: 0 }
              ],
              duration: 0.1,
              ease: 'steps(4)'
            });
          }, 3000 + Math.random() * 2000);

          return () => clearInterval(glitchInterval);
        }
      });

      return () => ctx.revert();
    }, [sceneType, theme]);

    const getText = () => {
      if (customText) return customText;
      const texts: Record<StreamSceneType, string> = {
        'starting-soon': 'STARTING SOON',
        'live': 'LIVE',
        'brb': 'RIGHT BACK',
        'intermission': 'INTERMISSION',
        'ending': 'ENDING SOON',
        'offline': 'OFFLINE'
      };
      return texts[sceneType];
    };

    const getSubText = () => {
      const subTexts: Record<StreamSceneType, string> = {
        'starting-soon': 'Stream will be',
        'live': '',
        'brb': 'Stream will be',
        'intermission': '',
        'ending': 'Stream will be',
        'offline': 'Stream is'
      };
      return subTexts[sceneType];
    };

    return (
      <div
        ref={ref}
        className={cn('relative w-full h-full overflow-hidden', className)}
        style={{
          background: `linear-gradient(135deg, 
            hsl(260, 50%, 8%) 0%, 
            hsl(280, 60%, 12%) 50%, 
            hsl(260, 50%, 8%) 100%
          )`
        }}
      >
        {/* Neon glow spots */}
        <div
          className="absolute animate-scale"
          style={{
            width: '300px',
            height: '300px',
            top: '20%',
            right: '10%',
            background: `radial-gradient(circle, ${theme.colors.secondary}50 0%, transparent 70%)`,
            filter: 'blur(60px)'
          }}
        />
        <div
          className="absolute animate-scale"
          style={{
            width: '400px',
            height: '400px',
            bottom: '10%',
            left: '5%',
            background: `radial-gradient(circle, ${theme.colors.primary}40 0%, transparent 70%)`,
            filter: 'blur(80px)'
          }}
        />

        {/* City elements */}
        <svg
          className="absolute bottom-0 w-full h-2/3"
          viewBox="0 0 1920 600"
          preserveAspectRatio="xMidYMax slice"
        >
          {/* Buildings silhouettes */}
          <rect x="1600" y="100" width="120" height="500" fill="hsl(260, 40%, 15%)" />
          <rect x="1650" y="50" width="40" height="50" fill="hsl(260, 40%, 12%)" />
          <rect x="1550" y="200" width="80" height="400" fill="hsl(260, 40%, 12%)" />
          
          {/* Neon signs */}
          <rect x="1610" y="150" width="60" height="30" fill={theme.colors.secondary} opacity="0.8" className="animate-glow" />
          <text x="1640" y="172" fill="white" fontSize="14" textAnchor="middle">本の</text>
          
          {/* Right side building */}
          <rect x="1100" y="300" width="300" height="300" fill="hsl(260, 35%, 18%)" />
          <rect x="1120" y="320" width="100" height="80" fill="hsl(280, 50%, 35%)" opacity="0.6" />
          <rect x="1240" y="320" width="100" height="80" fill="hsl(280, 50%, 35%)" opacity="0.4" />
          
          {/* Coffee shop sign */}
          <text x="1200" y="280" fill={theme.colors.secondary} fontSize="36" fontFamily="cursive" className="animate-glow">
            Coffee Inn
          </text>
        </svg>

        {/* Grid floor */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/4"
          style={{
            perspective: '500px'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `
                linear-gradient(${theme.colors.primary}30 1px, transparent 1px),
                linear-gradient(90deg, ${theme.colors.primary}30 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'rotateX(65deg)',
              transformOrigin: 'center bottom'
            }}
          />
        </div>

        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)'
          }}
        />

        {/* Text content */}
        <div
          ref={glitchRef}
          className="absolute inset-0 flex flex-col items-start justify-center z-10 pl-12 md:pl-20"
        >
          {getSubText() && (
            <div
              className="animate-fade-up text-lg md:text-2xl tracking-wider mb-2"
              style={{
                color: theme.colors.secondary,
                fontFamily: 'cursive',
                textShadow: `0 0 10px ${theme.colors.secondary}`
              }}
            >
              {getSubText()}
            </div>
          )}
          <div
            ref={textRef}
            className="animate-fade-up text-5xl md:text-7xl lg:text-8xl font-black"
            style={{
              color: theme.colors.primary,
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '0.05em',
              textShadow: `0 0 20px ${theme.colors.primary}, 0 0 40px ${theme.colors.primary}, 0 0 60px ${theme.colors.secondary}`
            }}
          >
            {getText()}
          </div>
        </div>

        {/* Camera placeholder for intermission */}
        {sceneType === 'intermission' && (
          <div
            className="absolute animate-scale rounded-lg border-2 overflow-hidden"
            style={{
              width: '55%',
              height: '50%',
              top: '5%',
              left: '5%',
              borderColor: theme.colors.primary,
              background: 'rgba(255,255,255,0.98)',
              boxShadow: `0 0 30px ${theme.colors.primary}60, 0 0 60px ${theme.colors.secondary}30`
            }}
          >
            <div className="flex items-center justify-center h-full text-gray-500">
              Camera Feed
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Gaming themed scene (default)
const GamingScene = React.forwardRef<HTMLDivElement, AnimatedStreamSceneProps>(
  ({ sceneType, theme, isEditing, customText, onTextChange, className }, ref) => {
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const ctx = gsap.context(() => {
        if (textRef.current) {
          // Pulse glow effect
          gsap.to(textRef.current, {
            keyframes: [
              { textShadow: `0 0 20px ${theme.colors.primary}, 0 0 40px ${theme.colors.primary}` },
              { textShadow: `0 0 40px ${theme.colors.primary}, 0 0 80px ${theme.colors.secondary}` },
              { textShadow: `0 0 20px ${theme.colors.primary}, 0 0 40px ${theme.colors.primary}` }
            ],
            duration: 2.5,
            repeat: -1,
            ease: 'power1.inOut'
          });
        }
      });

      return () => ctx.revert();
    }, [theme]);

    const getText = () => {
      if (customText) return customText;
      const texts: Record<StreamSceneType, string> = {
        'starting-soon': 'STARTING SOON',
        'live': 'LIVE',
        'brb': 'BE RIGHT BACK',
        'intermission': 'INTERMISSION',
        'ending': 'ENDING SOON',
        'offline': 'OFFLINE'
      };
      return texts[sceneType];
    };

    return (
      <div
        ref={ref}
        className={cn('relative w-full h-full overflow-hidden', className)}
        style={{
          background: `linear-gradient(135deg, 
            ${theme.colors.background} 0%, 
            hsl(220, 40%, 15%) 50%,
            ${theme.colors.background} 100%
          )`
        }}
      >
        {/* Dynamic background shapes */}
        <div
          className="absolute animate-scale"
          style={{
            width: '600px',
            height: '600px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: `conic-gradient(from 0deg, ${theme.colors.primary}20, ${theme.colors.secondary}20, ${theme.colors.accent}20, ${theme.colors.primary}20)`,
            borderRadius: '50%',
            filter: 'blur(100px)'
          }}
        />

        {/* Geometric accents */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1920 1080">
          <polygon
            points="0,0 400,0 200,200 0,100"
            fill={theme.colors.primary}
            opacity="0.1"
            className="animate-fade-up"
          />
          <polygon
            points="1920,1080 1520,1080 1720,880 1920,980"
            fill={theme.colors.secondary}
            opacity="0.1"
            className="animate-fade-up"
          />
        </svg>

        {/* Main text */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            ref={textRef}
            className="animate-fade-up text-6xl md:text-8xl lg:text-9xl font-black uppercase"
            style={{
              color: theme.colors.text,
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: '0.1em',
              textShadow: `0 0 30px ${theme.colors.primary}, 0 0 60px ${theme.colors.secondary}`
            }}
          >
            {getText()}
          </div>
        </div>
      </div>
    );
  }
);

// Helper function to create sakura petals using GSAP
function createSakuraPetals(container: HTMLDivElement) {
  container.innerHTML = '';
  
  for (let i = 0; i < 25; i++) {
    const petal = document.createElement('div');
    petal.innerHTML = '🌸';
    petal.style.cssText = `
      position: absolute;
      font-size: ${12 + Math.random() * 10}px;
      left: ${Math.random() * 100}%;
      top: -30px;
      opacity: 0;
      pointer-events: none;
    `;
    container.appendChild(petal);

    const duration = 5 + Math.random() * 5;
    const delay = Math.random() * 8;

    gsap.to(petal, {
      y: window.innerHeight + 100,
      x: `+=${-150 + Math.random() * 300}`,
      rotation: -180 + Math.random() * 360,
      opacity: 0.9,
      duration: duration,
      delay: delay,
      repeat: -1,
      ease: 'none',
      onRepeat: () => {
        gsap.set(petal, { y: -30, x: 0, opacity: 0 });
      }
    });

    // Fade in/out
    gsap.to(petal, {
      keyframes: [
        { opacity: 0, duration: 0 },
        { opacity: 0.9, duration: duration * 0.1 },
        { opacity: 0.9, duration: duration * 0.8 },
        { opacity: 0, duration: duration * 0.1 }
      ],
      delay: delay,
      repeat: -1
    });
  }
}

SakuraScene.displayName = 'SakuraScene';
NeonScene.displayName = 'NeonScene';
GamingScene.displayName = 'GamingScene';

export default AnimatedStreamScene;
