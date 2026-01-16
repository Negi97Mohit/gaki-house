import React, { useEffect, useRef } from 'react';
import { useThemeStore, themes } from '../model/theme.store';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life?: number;
  maxLife?: number;
  char?: string;
  angle?: number;
  speed?: number;
  z?: number;
}

type AmbientEffectType = typeof themes[keyof typeof themes]['ambient']['type'];

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const theme = useThemeStore((s) => s.theme);
  const config = themes[theme];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const effect = config.ambient.type;
    initParticles(effect, canvas.width, canvas.height);

    let time = 0;
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      switch (effect) {
        case 'auroraWaves':
          renderAuroraWaves(ctx, canvas.width, canvas.height, time);
          break;
        case 'neonRain':
          renderNeonRain(ctx, canvas.width, canvas.height);
          break;
        case 'particleNebula':
          renderParticleNebula(ctx, canvas.width, canvas.height, time);
          break;
        case 'geometricPulse':
          renderGeometricPulse(ctx, canvas.width, canvas.height, time);
          break;
        case 'electricStorm':
          renderElectricStorm(ctx, canvas.width, canvas.height, time);
          break;
        case 'floatingOrbs':
          renderFloatingOrbs(ctx, canvas.width, canvas.height, time);
          break;
        case 'fireflies':
          renderFireflies(ctx, canvas.width, canvas.height, time);
          break;
        case 'waveformAudio':
          renderWaveformAudio(ctx, canvas.width, canvas.height, time);
          break;
        case 'plasmaField':
          renderPlasmaField(ctx, canvas.width, canvas.height, time);
          break;
        case 'starfield':
          renderStarfield(ctx, canvas.width, canvas.height);
          break;
        case 'matrix':
          renderMatrixCode(ctx, canvas.width, canvas.height);
          break;
        case 'liquid':
          renderLiquidMetal(ctx, canvas.width, canvas.height, time);
          break;
        default:
          // For other ambient types, render a simple gradient or particles
          renderDefaultAmbient(ctx, canvas.width, canvas.height, time, config.ambient.colors);
          break;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [theme, config.ambient.type]);

  const initParticles = (effect: AmbientEffectType, width: number, height: number) => {
    particlesRef.current = [];
    const count = effect === 'matrix' ? 100 : effect === 'neonRain' ? 150 : effect === 'starfield' ? 200 : 60;

    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: effect === 'neonRain' || effect === 'matrix' ? Math.random() * 5 + 2 : (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 2,
        opacity: Math.random() * 0.5 + 0.3,
        color: getRandomColor(effect),
        life: 0,
        maxLife: Math.random() * 200 + 100,
        char: String.fromCharCode(0x30A0 + Math.random() * 96),
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
        z: Math.random() * 1000,
      });
    }
  };

  const getRandomColor = (effect: AmbientEffectType): string => {
    const colors: Record<string, string[]> = {
      auroraWaves: ['#00ff88', '#00ffcc', '#00ccff', '#8800ff', '#ff00ff'],
      neonRain: ['#00ffff', '#ff00ff', '#00ff00', '#ffff00'],
      particleNebula: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96c93d', '#f9ca24'],
      geometricPulse: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
      electricStorm: ['#00d4ff', '#7b2cbf', '#e0aaff', '#ffffff'],
      floatingOrbs: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffeaa7', '#dfe6e9'],
      matrix: ['#00ff00', '#00cc00', '#00ff44', '#44ff00'],
      fireflies: ['#ffd700', '#ffec8b', '#fff8dc', '#fffacd'],
      waveformAudio: ['#667eea', '#764ba2', '#00d4ff', '#f5576c'],
      plasmaField: ['#ff6b35', '#f7931e', '#ffcc00', '#00ff88', '#00ccff'],
      starfield: ['#ffffff', '#e0e0e0', '#c0c0c0', '#88ccff'],
      liquid: ['#c0c0c0', '#a8a8a8', '#e8e8e8', '#d0d0d0'],
    };
    const palette = colors[effect as string] || config.ambient.colors;
    return palette[Math.floor(Math.random() * palette.length)];
  };

  const renderAuroraWaves = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, height * 0.5);
      
      for (let x = 0; x <= width; x += 10) {
        const y = height * 0.5 + 
          Math.sin(x * 0.005 + time + i) * 50 +
          Math.sin(x * 0.01 + time * 1.5 + i * 2) * 30;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(0, height * 0.3, 0, height);
      const hue = (time * 20 + i * 40) % 360;
      gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.1)`);
      gradient.addColorStop(0.5, `hsla(${hue + 40}, 100%, 50%, 0.05)`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  };

  const renderNeonRain = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    particlesRef.current.forEach((p) => {
      p.y += p.vy;
      if (p.y > height) {
        p.y = -10;
        p.x = Math.random() * width;
      }

      const gradient = ctx.createLinearGradient(p.x, p.y - 20, p.x, p.y);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(1, p.color);
      
      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.moveTo(p.x, p.y - 20);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  };

  const renderParticleNebula = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    particlesRef.current.forEach((p, i) => {
      p.angle = (p.angle || 0) + (p.speed || 0.01);
      p.x += Math.cos(p.angle) * 0.5;
      p.y += Math.sin(p.angle * 1.5) * 0.5;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      const pulse = Math.sin(time * 2 + i) * 0.5 + 0.5;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + pulse * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity * (0.5 + pulse * 0.5);
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });
  };

  const renderGeometricPulse = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < 8; i++) {
      const radius = 100 + i * 50 + Math.sin(time + i) * 20;
      const rotation = time * 0.5 + i * 0.2;
      const sides = 4 + (i % 3);
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      
      ctx.beginPath();
      for (let j = 0; j <= sides; j++) {
        const angle = (j / sides) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      
      const hue = (time * 30 + i * 45) % 360;
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${0.3 - i * 0.03})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.restore();
    }
  };

  const renderLiquidMetal = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    for (let i = 0; i < 5; i++) {
      const x = width * 0.2 + (i * width * 0.15);
      const y = height * 0.5 + Math.sin(time + i * 2) * 100;
      const radius = 60 + Math.sin(time * 2 + i) * 20;
      
      const gradient = ctx.createRadialGradient(
        x - radius * 0.3, y - radius * 0.3, 0,
        x, y, radius
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.3, 'rgba(200, 200, 200, 0.6)');
      gradient.addColorStop(0.7, 'rgba(150, 150, 150, 0.4)');
      gradient.addColorStop(1, 'rgba(100, 100, 100, 0.2)');
      
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius * 0.8, Math.sin(time + i) * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  };

  const renderElectricStorm = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    if (Math.random() > 0.97) {
      const startX = Math.random() * width;
      let x = startX;
      let y = 0;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      while (y < height) {
        x += (Math.random() - 0.5) * 50;
        y += Math.random() * 30 + 10;
        ctx.lineTo(x, y);
      }
      
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 2 + 1;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224, 170, 255, ${Math.random() * 0.5})`;
      ctx.shadowColor = '#e0aaff';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  const renderFloatingOrbs = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    particlesRef.current.forEach((p, i) => {
      p.x += Math.sin(time + i) * 0.5;
      p.y += Math.cos(time * 0.7 + i) * 0.3;

      if (p.x < -50) p.x = width + 50;
      if (p.x > width + 50) p.x = -50;
      if (p.y < -50) p.y = height + 50;
      if (p.y > height + 50) p.y = -50;

      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(0.5, p.color + '4D');
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  };

  const renderMatrixCode = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.font = '14px monospace';
    
    particlesRef.current.forEach((p) => {
      p.y += p.vy;
      if (p.y > height) {
        p.y = -20;
        p.x = Math.random() * width;
        p.char = String.fromCharCode(0x30A0 + Math.random() * 96);
      }

      if (Math.random() > 0.95) {
        p.char = String.fromCharCode(0x30A0 + Math.random() * 96);
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.shadowColor = '#00ff00';
      ctx.shadowBlur = 5;
      ctx.fillText(p.char || '0', p.x, p.y);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });
  };

  const renderFireflies = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    particlesRef.current.forEach((p, i) => {
      p.x += Math.sin(time * 2 + i * 0.5) * 1;
      p.y += Math.cos(time * 1.5 + i * 0.7) * 0.8;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      const flicker = Math.sin(time * 10 + i * 3) * 0.5 + 0.5;
      const glowSize = p.size * (2 + flicker * 2);
      
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
      gradient.addColorStop(0, `rgba(255, 215, 0, ${0.8 * flicker})`);
      gradient.addColorStop(0.5, `rgba(255, 236, 139, ${0.4 * flicker})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 200, ${flicker})`;
      ctx.fill();
    });
  };

  const renderWaveformAudio = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const bars = 64;
    const barWidth = width / bars;
    const centerY = height / 2;

    for (let i = 0; i < bars; i++) {
      const frequency = Math.sin(time * 3 + i * 0.2) * 0.5 + 
                       Math.sin(time * 5 + i * 0.1) * 0.3 +
                       Math.sin(time * 7 + i * 0.3) * 0.2;
      const barHeight = Math.abs(frequency) * height * 0.4;
      
      const hue = (i / bars) * 120 + time * 50;
      const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
      gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.8)`);
      gradient.addColorStop(0.5, `hsla(${hue + 30}, 80%, 50%, 0.6)`);
      gradient.addColorStop(1, `hsla(${hue}, 80%, 60%, 0.8)`);
      
      ctx.fillStyle = gradient;
      ctx.shadowColor = `hsl(${hue}, 80%, 60%)`;
      ctx.shadowBlur = 10;
      
      ctx.fillRect(i * barWidth + 2, centerY - barHeight, barWidth - 4, barHeight * 2);
    }
    ctx.shadowBlur = 0;
  };

  const renderPlasmaField = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const imageData = ctx.createImageData(width / 4, height / 4);
    const data = imageData.data;

    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const px = x / imageData.width;
        const py = y / imageData.height;
        
        const v1 = Math.sin(px * 10 + time);
        const v2 = Math.sin(10 * (px * Math.sin(time / 2) + py * Math.cos(time / 3)) + time);
        const v3 = Math.sin(Math.sqrt((px - 0.5) ** 2 + (py - 0.5) ** 2) * 20 - time * 2);
        const v = (v1 + v2 + v3) / 3;

        const i = (y * imageData.width + x) * 4;
        data[i] = Math.floor((Math.sin(v * Math.PI) + 1) * 127);
        data[i + 1] = Math.floor((Math.cos(v * Math.PI) + 1) * 100);
        data[i + 2] = Math.floor((Math.sin(v * Math.PI + 2) + 1) * 127);
        data[i + 3] = 100;
      }
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(imageData, 0, 0);
    
    ctx.drawImage(tempCanvas, 0, 0, width, height);
  };

  const renderStarfield = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    particlesRef.current.forEach((p) => {
      p.z = (p.z || 1000) - 10;
      
      if (p.z <= 0) {
        p.x = (Math.random() - 0.5) * width * 2;
        p.y = (Math.random() - 0.5) * height * 2;
        p.z = 1000;
      }

      const scale = 500 / p.z;
      const screenX = centerX + p.x * scale;
      const screenY = centerY + p.y * scale;
      const size = Math.max(0.5, (1 - p.z / 1000) * 3);

      if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - p.z / 1000})`;
        ctx.fill();
        
        // Draw trail
        const trailLength = size * 5;
        const gradient = ctx.createLinearGradient(
          screenX, screenY,
          screenX - (screenX - centerX) * 0.1,
          screenY - (screenY - centerY) * 0.1
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${(1 - p.z / 1000) * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = size * 0.5;
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(
          screenX - (screenX - centerX) * 0.05,
          screenY - (screenY - centerY) * 0.05
        );
        ctx.stroke();
      }
    });
  };

  const renderDefaultAmbient = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number, colors: string[]) => {
    // Simple gradient animation for non-special effects
    const gradient = ctx.createRadialGradient(
      width / 2 + Math.sin(time) * 100,
      height / 2 + Math.cos(time) * 100,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.7
    );
    
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color + '20');
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default AmbientBackground;
