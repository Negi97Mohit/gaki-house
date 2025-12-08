// src/components/animated-banners/GlitchMatrix.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface GlitchMatrixProps {
  color?: string;
  intensity?: number;
}

export const GlitchMatrix: React.FC<GlitchMatrixProps> = ({
  color = '#00ff00',
  intensity = 0.5
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Initialize drops if not exists
    if (!canvas.dataset.drops) {
      const drops = new Array(columns).fill(1).map(() => Math.random() * -100);
      canvas.dataset.drops = JSON.stringify(drops);
    }
    
    const drops = JSON.parse(canvas.dataset.drops);
    
    // Fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px monospace`;
    
    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      
      // Brighter leading character
      if (Math.random() > 0.5) {
        ctx.fillStyle = '#ffffff';
        ctx.fillText(char, x, y);
        ctx.fillStyle = color;
      } else {
        ctx.fillText(char, x, y);
      }
      
      // Reset drop
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    
    canvas.dataset.drops = JSON.stringify(drops);
    animationRef.current = requestAnimationFrame(animate);
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />
      
      {/* Glitch overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0, intensity, 0, intensity * 0.5, 0],
          x: [-2, 2, -1, 1, 0],
        }}
        transition={{
          duration: 0.2,
          repeat: Infinity,
          repeatDelay: 2 + Math.random() * 3,
        }}
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}20 50%, transparent 100%)`,
        }}
      />
      
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.3) 2px,
            rgba(0, 0, 0, 0.3) 4px
          )`,
        }}
      />
    </div>
  );
};
