// src/components/animated-banners/VTuberFrame.tsx
import React from 'react';
import { motion } from 'framer-motion';

// 2D Frame overlay component - pure CSS/Framer Motion, no Three.js
export const VTuberFrameOverlay: React.FC<{
  primaryColor?: string;
  secondaryColor?: string;
}> = ({
  primaryColor = '#ff69b4',
  secondaryColor = '#87ceeb'
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${primaryColor}15 0%, transparent 70%)`,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Corner decorations */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
        <motion.div
          key={corner}
          className={`absolute w-16 h-16 ${corner.includes('top') ? 'top-2' : 'bottom-2'} ${corner.includes('left') ? 'left-2' : 'right-2'}`}
          animate={{
            scale: [1, 1.1, 1],
            rotate: corner.includes('right') ? [0, 5, 0] : [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id={`gradient-${corner}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={primaryColor} />
                <stop offset="100%" stopColor={secondaryColor} />
              </linearGradient>
            </defs>
            <path
              d={corner.includes('left') 
                ? (corner.includes('top') ? 'M0,50 L0,0 L50,0' : 'M0,50 L0,100 L50,100')
                : (corner.includes('top') ? 'M50,0 L100,0 L100,50' : 'M50,100 L100,100 L100,50')
              }
              stroke={`url(#gradient-${corner})`}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      ))}
      
      {/* Floating hearts/stars */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${10 + i * 11}%`,
            top: i % 2 === 0 ? '-20px' : 'auto',
            bottom: i % 2 === 1 ? '-20px' : 'auto',
            color: i % 2 === 0 ? primaryColor : secondaryColor,
          }}
          animate={{
            y: i % 2 === 0 ? [0, 15, 0] : [0, -15, 0],
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.1, 0.8],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2.5 + i * 0.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        >
          {i % 3 === 0 ? '✦' : i % 3 === 1 ? '♡' : '★'}
        </motion.div>
      ))}

      {/* Sparkle particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
            boxShadow: `0 0 6px ${i % 2 === 0 ? primaryColor : secondaryColor}`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Side ribbons */}
      <motion.div
        className="absolute left-0 top-1/4 w-1 h-1/2 rounded-r-full"
        style={{
          background: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})`,
        }}
        animate={{
          scaleY: [1, 1.1, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute right-0 top-1/4 w-1 h-1/2 rounded-l-full"
        style={{
          background: `linear-gradient(to bottom, ${secondaryColor}, ${primaryColor})`,
        }}
        animate={{
          scaleY: [1, 1.1, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.5,
        }}
      />
    </div>
  );
};

export default VTuberFrameOverlay;
