// src/components/animated-banners/EsportsHUD.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface EsportsHUDProps {
  primaryColor?: string;
  accentColor?: string;
}

export const EsportsHUD: React.FC<EsportsHUDProps> = ({
  primaryColor = '#ff4444',
  accentColor = '#ffffff'
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Tech grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(${primaryColor}33 1px, transparent 1px),
            linear-gradient(90deg, ${primaryColor}33 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />
      
      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` }}
        animate={{ top: ['0%', '100%'] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Corner brackets */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
        <motion.div
          key={corner}
          className={`absolute w-8 h-8 border-2 ${
            corner.includes('top') ? 'top-2' : 'bottom-2'
          } ${corner.includes('left') ? 'left-2' : 'right-2'}`}
          style={{
            borderColor: primaryColor,
            borderTopWidth: corner.includes('top') ? '2px' : '0',
            borderBottomWidth: corner.includes('bottom') ? '2px' : '0',
            borderLeftWidth: corner.includes('left') ? '2px' : '0',
            borderRightWidth: corner.includes('right') ? '2px' : '0',
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />
      ))}
      
      {/* Data stream bars */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="h-1 rounded-full"
            style={{ background: primaryColor }}
            animate={{
              width: ['20px', `${30 + Math.random() * 40}px`, '20px'],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      
      {/* Left data stream */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-end">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="h-1 rounded-full"
            style={{ background: primaryColor }}
            animate={{
              width: ['15px', `${25 + Math.random() * 35}px`, '15px'],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 0.6 + Math.random() * 0.4,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      
      {/* Status indicators */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: primaryColor }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      
      {/* Hexagon pattern accents */}
      <svg className="absolute bottom-2 right-12 w-16 h-16 opacity-30">
        <motion.polygon
          points="24,0 48,14 48,38 24,52 0,38 0,14"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1"
          animate={{
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </svg>
    </div>
  );
};
