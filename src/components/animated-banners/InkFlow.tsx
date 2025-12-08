// src/components/animated-banners/InkFlow.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { createNoise2D } from 'simplex-noise';

interface InkFlowProps {
  primaryColor?: string;
  secondaryColor?: string;
}

export const InkFlow: React.FC<InkFlowProps> = ({
  primaryColor = '#1a1a2e',
  secondaryColor = '#d4af37'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const noise2D = useRef(createNoise2D());
  
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const t = time * 0.001;
    
    // Clear with slight fade
    ctx.fillStyle = 'rgba(10, 10, 10, 0.02)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw flowing ink
    const numStrokes = 5;
    for (let s = 0; s < numStrokes; s++) {
      ctx.beginPath();
      
      const strokeOffset = s * 0.5;
      const startX = canvas.width * 0.1;
      const startY = canvas.height * (0.3 + s * 0.1);
      
      ctx.moveTo(startX, startY);
      
      for (let x = startX; x < canvas.width * 0.9; x += 5) {
        const normalizedX = x / canvas.width;
        const noiseVal = noise2D.current(normalizedX * 2 + strokeOffset, t * 0.3 + strokeOffset);
        const y = startY + noiseVal * 50 + Math.sin(normalizedX * 4 + t + strokeOffset) * 20;
        ctx.lineTo(x, y);
      }
      
      const gradient = ctx.createLinearGradient(startX, 0, canvas.width * 0.9, 0);
      gradient.addColorStop(0, `${primaryColor}00`);
      gradient.addColorStop(0.2, primaryColor);
      gradient.addColorStop(0.5, secondaryColor);
      gradient.addColorStop(0.8, primaryColor);
      gradient.addColorStop(1, `${primaryColor}00`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3 + Math.sin(t + s) * 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    
    // Add ink splatter
    const splatters = 3;
    for (let i = 0; i < splatters; i++) {
      const splatterTime = (t * 0.5 + i * 2) % 10;
      if (splatterTime < 0.5) {
        const x = canvas.width * (0.2 + Math.random() * 0.6);
        const y = canvas.height * (0.3 + Math.random() * 0.4);
        const radius = 2 + Math.random() * 5;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? primaryColor : secondaryColor;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    
    animationRef.current = requestAnimationFrame(animate);
  }, [primaryColor, secondaryColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
      }
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
      {/* Paper texture background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.8 }}
      />
    </div>
  );
};
