import React, { useEffect, useRef, useMemo } from "react";
import { useThemeStore, themes } from "@/features/theme/model/theme.store";
import { motion } from "framer-motion";

// Minimal Simplex Noise implementation
class SimplexNoise {
  private p: Uint8Array;
  private perm: Uint8Array;
  private permMod12: Uint8Array;
  private grad3: Float32Array;

  constructor() {
    this.grad3 = new Float32Array([
      1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1,
      0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1,
    ]);
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256);
    }
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  noise2D(xin: number, yin: number) {
    let n0, n1, n2;
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; } 
    else { i1 = 0; j1 = 1; }
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.permMod12[ii + this.perm[jj]] * 3;
    const t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0.0;
    else {
      const t0_sq = t0 * t0;
      n0 = t0_sq * t0_sq * (this.grad3[gi0] * x0 + this.grad3[gi0 + 1] * y0);
    }
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]] * 3;
    const t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0.0;
    else {
      const t1_sq = t1 * t1;
      n1 = t1_sq * t1_sq * (this.grad3[gi1] * x1 + this.grad3[gi1 + 1] * y1);
    }
    const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]] * 3;
    const t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0.0;
    else {
      const t2_sq = t2 * t2;
      n2 = t2_sq * t2_sq * (this.grad3[gi2] * x2 + this.grad3[gi2 + 1] * y2);
    }
    return 70.0 * (n0 + n1 + n2);
  }
}

// Convert hex to HSL components
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

interface Circle {
  x: number;
  y: number;
  r: number;
  xOff: number;
  yOff: number;
  step: number;
  colorIndex: number;
}

interface AmbientBackgroundProps {
  className?: string;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ className = "" }) => {
  const { theme, mode } = useThemeStore();
  const themeConfig = useMemo(() => themes[theme], [theme]);
  const { ambient } = themeConfig;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Canvas-based animation for particles/blobs
  useEffect(() => {
    if (ambient.type !== "particles" && ambient.type !== "gradient") return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noise = new SimplexNoise();
    let width = 0;
    let height = 0;
    let circles: Circle[] = [];

    const circleCount = 10;
    const baseRadius = 200;
    const speed = 0.0015 * ambient.speed;
    const colorSpeed = 0.002 * ambient.speed;

    const initCircles = () => {
      circles = [];
      for (let i = 0; i < circleCount; i++) {
        circles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: baseRadius + Math.random() * 100,
          xOff: Math.random() * 1000,
          yOff: Math.random() * 1000,
          step: Math.random() * 1000,
          colorIndex: i % ambient.colors.length,
        });
      }
    };

    const resize = () => {
      if (!container) return;
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = width;
      canvas.height = height;
      initCircles();
    };

    let time = 0;

    const render = () => {
      time += colorSpeed;
      ctx.clearRect(0, 0, width, height);

      circles.forEach((c) => {
        c.xOff += speed;
        c.yOff += speed;

        const vx = noise.noise2D(c.xOff, c.xOff) * 2;
        const vy = noise.noise2D(c.yOff, c.yOff) * 2;

        c.x += vx;
        c.y += vy;

        if (c.x < -c.r) c.x = width + c.r;
        if (c.x > width + c.r) c.x = -c.r;
        if (c.y < -c.r) c.y = height + c.r;
        if (c.y > height + c.r) c.y = -c.r;

        // Use theme colors
        const color = ambient.colors[c.colorIndex];
        const hsl = hexToHsl(color);
        const lightNoise = noise.noise2D(c.step, c.step + time);
        const l = hsl.l + lightNoise * 10;

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        // Increased intensity for better visibility
        const adjustedIntensity = Math.min(ambient.intensity * 2, 1);
        gradient.addColorStop(0, `hsla(${hsl.h}, ${hsl.s}%, ${l}%, ${adjustedIntensity})`);
        gradient.addColorStop(0.5, `hsla(${hsl.h}, ${hsl.s}%, ${l}%, ${adjustedIntensity * 0.5})`);
        gradient.addColorStop(1, `hsla(${hsl.h}, ${hsl.s}%, ${l}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      });

      animationRef.current = requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    resize();
    render();

    return () => {
      resizeObserver.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [ambient, theme]);

  // Render different ambient effects based on type
  const renderAmbientEffect = () => {
    switch (ambient.type) {
      case "particles":
      case "gradient":
        return (
          <canvas
            ref={canvasRef}
            className="block w-full h-full"
            style={{ filter: "blur(80px)" }}
          />
        );

      case "waves":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(${90 + i * 30}deg, ${ambient.colors[i % ambient.colors.length]}60, transparent, ${ambient.colors[(i + 1) % ambient.colors.length]}60)`,
                }}
                animate={{
                  x: ["-10%", "10%", "-10%"],
                  y: ["-5%", "5%", "-5%"],
                }}
                transition={{
                  duration: 8 / ambient.speed + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );

      case "aurora":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {ambient.colors.map((color, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${i * 20}%`,
                  top: "-50%",
                  width: "60%",
                  height: "200%",
                  background: `linear-gradient(180deg, transparent 0%, ${color}70 30%, ${color}90 50%, ${color}70 70%, transparent 100%)`,
                  filter: "blur(60px)",
                  transformOrigin: "center",
                }}
                animate={{
                  x: ["-20%", "20%", "-20%"],
                  scaleX: [1, 1.2, 1],
                  opacity: [0.5, 0.9, 0.5],
                }}
                transition={{
                  duration: 10 / ambient.speed + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>
        );

      case "mesh":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse 80% 80% at 20% 20%, ${ambient.colors[0]}60 0%, transparent 50%),
                  radial-gradient(ellipse 60% 60% at 80% 30%, ${ambient.colors[1]}60 0%, transparent 50%),
                  radial-gradient(ellipse 70% 70% at 30% 80%, ${ambient.colors[2]}60 0%, transparent 50%),
                  radial-gradient(ellipse 50% 50% at 70% 70%, ${ambient.colors[3] || ambient.colors[0]}60 0%, transparent 50%)
                `,
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 15 / ambient.speed,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(${ambient.colors[0]}25 1px, transparent 1px), linear-gradient(90deg, ${ambient.colors[0]}25 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
                opacity: 0.5,
              }}
            />
          </div>
        );

      case "glow":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: "50%",
                  height: "50%",
                  left: `${15 + i * 25}%`,
                  top: `${25 + (i % 2) * 20}%`,
                  background: `radial-gradient(circle, ${ambient.colors[i % ambient.colors.length]}80 0%, ${ambient.colors[i % ambient.colors.length]}40 40%, transparent 70%)`,
                  filter: "blur(50px)",
                }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 1, 0.6],
                  x: ["-10%", "10%", "-10%"],
                }}
                transition={{
                  duration: 6 / ambient.speed + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.8,
                }}
              />
            ))}
          </div>
        );

      case "noise":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${ambient.colors[0]}50 0%, transparent 50%, ${ambient.colors[1]}50 100%)`,
              }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{
                duration: 8 / ambient.speed,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div 
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full overflow-hidden transition-colors duration-500 ${className}`}
      style={{ backgroundColor: mode === "dark" ? "#0a0a0a" : "#f5f5f5" }}
    >
      {renderAmbientEffect()}
      
      {/* Softer vignette that doesn't obscure the effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, ${mode === "dark" ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.15)"} 100%)`,
        }}
      />
    </div>
  );
};
