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

      case "ring":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border-2"
                style={{
                  width: `${30 + i * 20}%`,
                  height: `${30 + i * 20}%`,
                  borderColor: ambient.colors[i % ambient.colors.length],
                  opacity: 0.4,
                }}
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{
                  rotate: { duration: 20 / ambient.speed + i * 5, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
                }}
              />
            ))}
          </div>
        );

      case "hexagon":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(ambient.colors[0])}' fill-opacity='0.15'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: "40%", height: "40%",
                  left: i === 0 ? "10%" : "50%", top: i === 0 ? "20%" : "40%",
                  background: `radial-gradient(circle, ${ambient.colors[i + 1]}50 0%, transparent 70%)`,
                  filter: "blur(40px)",
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 6 / ambient.speed, repeat: Infinity, ease: "easeInOut", delay: i }}
              />
            ))}
          </div>
        );

      case "prism":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {ambient.colors.map((color, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${i * 16}%`, top: 0, width: "20%", height: "100%",
                  background: `linear-gradient(180deg, transparent, ${color}60, transparent)`,
                  filter: "blur(20px)",
                }}
                animate={{ x: ["-50%", "50%", "-50%"], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 8 / ambient.speed, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
              />
            ))}
          </div>
        );

      case "nebula":
      case "crystal":
      case "quantum":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {ambient.colors.slice(0, 4).map((color, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${35 + i * 10}%`, height: `${35 + i * 10}%`,
                  left: `${10 + i * 20}%`, top: `${15 + (i % 2) * 30}%`,
                  background: `radial-gradient(circle, ${color}70 0%, ${color}30 50%, transparent 70%)`,
                  filter: "blur(60px)",
                }}
                animate={{ scale: [1, 1.2, 1], x: ["-5%", "5%", "-5%"], y: ["-5%", "5%", "-5%"] }}
                transition={{ duration: 10 / ambient.speed + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              />
            ))}
          </div>
        );

      case "matrix":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, ${ambient.colors[0]}10 0px, transparent 1px, transparent 20px)`,
              }}
              animate={{ backgroundPosition: ["0 0", "0 100px"] }}
              transition={{ duration: 2 / ambient.speed, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse at center, ${ambient.colors[0]}30 0%, transparent 70%)` }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "liquid":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${ambient.colors[0]}40, ${ambient.colors[1]}40, ${ambient.colors[2]}40)`,
                backgroundSize: "200% 200%",
              }}
              animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
              transition={{ duration: 10 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "flare":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            <motion.div
              className="absolute"
              style={{
                width: "60%", height: "60%",
                background: `radial-gradient(circle, ${ambient.colors[0]}80 0%, ${ambient.colors[1]}50 30%, ${ambient.colors[2]}30 60%, transparent 70%)`,
                filter: "blur(40px)",
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "abyss":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${ambient.colors[0]}20 0%, ${ambient.colors[1]}60 100%)` }} />
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: "8px", height: "8px",
                  left: `${20 + i * 30}%`, top: `${30 + i * 20}%`,
                  background: ambient.colors[3],
                  boxShadow: `0 0 20px ${ambient.colors[3]}, 0 0 40px ${ambient.colors[3]}`,
                }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              />
            ))}
          </div>
        );

      // COSMIC RING VARIATIONS
      case "ringPulse":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border-4"
                style={{
                  width: `${20 + i * 15}%`,
                  height: `${20 + i * 15}%`,
                  borderColor: ambient.colors[i % ambient.colors.length],
                  boxShadow: `0 0 30px ${ambient.colors[i % ambient.colors.length]}80, inset 0 0 30px ${ambient.colors[i % ambient.colors.length]}40`,
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{
                  duration: 2 / ambient.speed,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        );

      case "ringDouble":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {/* First ring system */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`a-${i}`}
                className="absolute rounded-full border-2"
                style={{
                  width: `${35 + i * 15}%`,
                  height: `${35 + i * 15}%`,
                  borderColor: ambient.colors[i % ambient.colors.length],
                  transform: "rotateX(70deg)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 15 / ambient.speed + i * 3, repeat: Infinity, ease: "linear" }}
              />
            ))}
            {/* Second ring system - perpendicular */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`b-${i}`}
                className="absolute rounded-full border-2"
                style={{
                  width: `${30 + i * 12}%`,
                  height: `${30 + i * 12}%`,
                  borderColor: ambient.colors[(i + 1) % ambient.colors.length],
                  transform: "rotateY(70deg)",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 12 / ambient.speed + i * 2, repeat: Infinity, ease: "linear" }}
              />
            ))}
          </div>
        );

      case "ringSpiral":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: `${10 + i * 8}%`,
                  height: `${10 + i * 8}%`,
                  border: `2px solid ${ambient.colors[i % ambient.colors.length]}`,
                  borderRadius: "50%",
                  borderTopColor: "transparent",
                  borderLeftColor: "transparent",
                }}
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{
                  rotate: { duration: 8 / ambient.speed + i, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 },
                }}
              />
            ))}
            {/* Center glow */}
            <motion.div
              className="absolute w-16 h-16 rounded-full"
              style={{
                background: `radial-gradient(circle, ${ambient.colors[0]}80 0%, transparent 70%)`,
                filter: "blur(10px)",
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "ringEclipse":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {/* Dark core */}
            <div className="absolute w-32 h-32 rounded-full bg-black z-10" />
            {/* Corona rings */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${35 + i * 10}%`,
                  height: `${35 + i * 10}%`,
                  border: `${3 - i * 0.4}px solid ${ambient.colors[i % ambient.colors.length]}`,
                  boxShadow: `0 0 ${40 - i * 5}px ${ambient.colors[i % ambient.colors.length]}`,
                  opacity: 1 - i * 0.12,
                }}
                animate={{
                  scale: [1, 1.02, 1],
                  opacity: [0.8 - i * 0.1, 1 - i * 0.1, 0.8 - i * 0.1],
                }}
                transition={{
                  duration: 4 / ambient.speed,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        );

      case "ringAurora":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {/* Aurora bands wrapping around rings */}
            {ambient.colors.map((color, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${40 + i * 12}%`,
                  height: `${40 + i * 12}%`,
                  background: `conic-gradient(from ${i * 45}deg, transparent, ${color}60, transparent, ${color}40, transparent)`,
                  filter: "blur(15px)",
                }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 20 / ambient.speed + i * 5, repeat: Infinity, ease: "linear" }}
              />
            ))}
            {/* Inner rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute rounded-full border"
                style={{
                  width: `${25 + i * 10}%`,
                  height: `${25 + i * 10}%`,
                  borderColor: `${ambient.colors[i]}80`,
                }}
                animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                transition={{
                  rotate: { duration: 15 / ambient.speed, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                }}
              />
            ))}
          </div>
        );

      // HEX GRID VARIATIONS
      case "hexHoneycomb":
        return (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'%3E%3Cpath fill='${encodeURIComponent(ambient.colors[0])}' fill-opacity='0.25' d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100'/%3E%3Cpath fill='none' stroke='${encodeURIComponent(ambient.colors[1])}' stroke-opacity='0.4' d='M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34'/%3E%3C/svg%3E")`,
              }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Honey drip effect */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: "30%", height: "30%",
                  left: `${15 + i * 25}%`, top: `${20 + i * 15}%`,
                  background: `radial-gradient(circle, ${ambient.colors[3]}70 0%, ${ambient.colors[0]}40 50%, transparent 70%)`,
                  filter: "blur(30px)",
                }}
                animate={{ y: ["0%", "10%", "0%"], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 5 / ambient.speed, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              />
            ))}
          </div>
        );

      case "hexCyber":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Glowing hex grid */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(ambient.colors[0])}' fill-opacity='0.2'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Scanning lines */}
            <motion.div
              className="absolute left-0 right-0 h-1"
              style={{
                background: `linear-gradient(90deg, transparent, ${ambient.colors[0]}, transparent)`,
                boxShadow: `0 0 20px ${ambient.colors[0]}`,
              }}
              animate={{ top: ["-5%", "105%"] }}
              transition={{ duration: 3 / ambient.speed, repeat: Infinity, ease: "linear" }}
            />
            {/* Neural nodes */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: `${20 + i * 20}%`, top: `${25 + (i % 2) * 40}%`,
                  background: ambient.colors[i % ambient.colors.length],
                  boxShadow: `0 0 15px ${ambient.colors[i % ambient.colors.length]}`,
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
              />
            ))}
          </div>
        );

      case "hexNeon":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Neon hex pattern */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg stroke='${encodeURIComponent(ambient.colors[0])}' stroke-width='2' fill='none'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                filter: `drop-shadow(0 0 5px ${ambient.colors[0]})`,
              }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Neon glow spots */}
            {ambient.colors.slice(0, 3).map((color, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: "25%", height: "25%",
                  left: `${10 + i * 30}%`, top: `${20 + i * 20}%`,
                  background: `radial-gradient(circle, ${color}80 0%, transparent 70%)`,
                  filter: "blur(40px)",
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2 / ambient.speed, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
              />
            ))}
          </div>
        );

      case "hexOrbit":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {/* Orbital hex stations */}
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="absolute"
                style={{ width: `${50 + ring * 20}%`, height: `${50 + ring * 20}%` }}
                animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 30 / ambient.speed + ring * 10, repeat: Infinity, ease: "linear" }}
              >
                {[0, 1, 2, 3, 4, 5].map((hex) => (
                  <div
                    key={hex}
                    className="absolute w-4 h-4"
                    style={{
                      left: `${50 + 45 * Math.cos((hex * Math.PI * 2) / 6)}%`,
                      top: `${50 + 45 * Math.sin((hex * Math.PI * 2) / 6)}%`,
                      transform: "translate(-50%, -50%)",
                      background: ambient.colors[hex % ambient.colors.length],
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      boxShadow: `0 0 10px ${ambient.colors[hex % ambient.colors.length]}`,
                    }}
                  />
                ))}
              </motion.div>
            ))}
            {/* Center station */}
            <motion.div
              className="absolute w-8 h-8"
              style={{
                background: ambient.colors[4] || ambient.colors[0],
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                boxShadow: `0 0 30px ${ambient.colors[4] || ambient.colors[0]}`,
              }}
              animate={{ scale: [1, 1.2, 1], rotate: 360 }}
              transition={{
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              }}
            />
          </div>
        );

      case "hexVortex":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {/* Vortex layers */}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: `${80 - i * 10}%`,
                  height: `${80 - i * 10}%`,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(ambient.colors[i % ambient.colors.length])}' fill-opacity='${0.3 - i * 0.04}'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360, scale: [1, 1.1, 1] }}
                transition={{
                  rotate: { duration: 10 / ambient.speed + i * 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 },
                }}
              />
            ))}
            {/* Center pull */}
            <motion.div
              className="absolute w-24 h-24 rounded-full"
              style={{
                background: `radial-gradient(circle, ${ambient.colors[0]}90 0%, ${ambient.colors[1]}60 40%, transparent 70%)`,
                filter: "blur(20px)",
              }}
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      // NEW ANIMATED EFFECTS
      case "plasmaStorm":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Chaotic plasma blobs */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${40 + i * 10}%`,
                  height: `${40 + i * 10}%`,
                  left: `${10 + (i % 3) * 20}%`,
                  top: `${5 + (i % 2) * 30}%`,
                  background: `radial-gradient(circle, ${ambient.colors[i % ambient.colors.length]}90 0%, transparent 70%)`,
                  filter: "blur(40px)",
                }}
                animate={{
                  x: ["-20%", "20%", "-10%", "15%", "-20%"],
                  y: ["-10%", "15%", "-15%", "10%", "-10%"],
                  scale: [1, 1.3, 0.9, 1.2, 1],
                }}
                transition={{
                  duration: 4 / ambient.speed + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
            {/* Electric discharges */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(${Math.random() * 360}deg, transparent, ${ambient.colors[0]}30, transparent)`,
              }}
              animate={{ opacity: [0, 0.8, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 2 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "laserGrid":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Horizontal lasers */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={`h-${i}`}
                className="absolute left-0 right-0 h-[2px]"
                style={{
                  top: `${20 + i * 20}%`,
                  background: `linear-gradient(90deg, transparent, ${ambient.colors[i % ambient.colors.length]}, transparent)`,
                  boxShadow: `0 0 20px ${ambient.colors[i % ambient.colors.length]}, 0 0 40px ${ambient.colors[i % ambient.colors.length]}`,
                }}
                animate={{ scaleX: [0, 1, 0], x: ["-100%", "0%", "100%"] }}
                transition={{
                  duration: 3 / ambient.speed,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.3,
                }}
              />
            ))}
            {/* Vertical lasers */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 w-[2px]"
                style={{
                  left: `${20 + i * 20}%`,
                  background: `linear-gradient(180deg, transparent, ${ambient.colors[(i + 2) % ambient.colors.length]}, transparent)`,
                  boxShadow: `0 0 20px ${ambient.colors[(i + 2) % ambient.colors.length]}`,
                }}
                animate={{ scaleY: [0, 1, 0], y: ["-100%", "0%", "100%"] }}
                transition={{
                  duration: 2.5 / ambient.speed,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.25,
                }}
              />
            ))}
            {/* Intersection glows */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`glow-${i}`}
                className="absolute w-8 h-8 rounded-full"
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${30 + i * 15}%`,
                  background: `radial-gradient(circle, ${ambient.colors[0]}ff 0%, transparent 70%)`,
                }}
                animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
          </div>
        );

      case "particleNova":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {/* Radiating particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ambient.colors[i % ambient.colors.length],
                  boxShadow: `0 0 15px ${ambient.colors[i % ambient.colors.length]}`,
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI * 2) / 12) * 200, 0],
                  y: [0, Math.sin((i * Math.PI * 2) / 12) * 200, 0],
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3 / ambient.speed,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.1,
                }}
              />
            ))}
            {/* Central burst */}
            <motion.div
              className="absolute w-32 h-32 rounded-full"
              style={{
                background: `radial-gradient(circle, ${ambient.colors[0]}ff 0%, ${ambient.colors[1]}80 40%, transparent 70%)`,
                filter: "blur(10px)",
              }}
              animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 2 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "waveformPulse":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center">
            {/* Waveform lines */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1"
                style={{
                  left: `${i * 5}%`,
                  background: `linear-gradient(180deg, transparent, ${ambient.colors[i % ambient.colors.length]}, transparent)`,
                  boxShadow: `0 0 10px ${ambient.colors[i % ambient.colors.length]}`,
                }}
                animate={{
                  height: ["20%", `${30 + Math.sin(i * 0.5) * 40}%`, "20%"],
                  top: ["40%", `${35 - Math.sin(i * 0.5) * 20}%`, "40%"],
                }}
                transition={{
                  duration: 1.5 / ambient.speed,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.05,
                }}
              />
            ))}
            {/* Bass glow */}
            <motion.div
              className="absolute inset-x-0 h-1/3 top-1/3"
              style={{
                background: `linear-gradient(180deg, transparent, ${ambient.colors[0]}40, transparent)`,
              }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 0.5 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "holographicShift":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Shifting holographic planes */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(${45 + i * 60}deg, ${ambient.colors[i]}40, transparent 50%, ${ambient.colors[(i + 2) % ambient.colors.length]}40)`,
                  mixBlendMode: "screen",
                }}
                animate={{
                  opacity: [0.5, 0.9, 0.5],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 5 / ambient.speed + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
            {/* Iridescent shimmer */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `conic-gradient(from 0deg, ${ambient.colors.join(", ")}, ${ambient.colors[0]})`,
                opacity: 0.15,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20 / ambient.speed, repeat: Infinity, ease: "linear" }}
            />
          </div>
        );

      case "starfieldWarp":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {/* Warp stars */}
            {Array.from({ length: 30 }).map((_, i) => {
              const angle = (i * Math.PI * 2) / 30;
              return (
                <motion.div
                  key={i}
                  className="absolute w-1 rounded-full"
                  style={{
                    height: "2px",
                    background: ambient.colors[i % ambient.colors.length],
                    boxShadow: `0 0 5px ${ambient.colors[i % ambient.colors.length]}`,
                    left: "50%",
                    top: "50%",
                    transformOrigin: "left center",
                    rotate: `${(angle * 180) / Math.PI}deg`,
                  }}
                  animate={{
                    width: ["0px", "150px", "0px"],
                    opacity: [0, 1, 0],
                    x: [0, Math.cos(angle) * 100, Math.cos(angle) * 300],
                    y: [0, Math.sin(angle) * 100, Math.sin(angle) * 300],
                  }}
                  transition={{
                    duration: 2 / ambient.speed,
                    repeat: Infinity,
                    ease: "easeIn",
                    delay: i * 0.08,
                  }}
                />
              );
            })}
            {/* Center glow */}
            <motion.div
              className="absolute w-16 h-16 rounded-full"
              style={{
                background: `radial-gradient(circle, ${ambient.colors[2]}80 0%, transparent 70%)`,
              }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "electricArc":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Lightning bolts */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + i * 25}%`,
                  top: 0,
                  width: "4px",
                  height: "100%",
                  background: `linear-gradient(180deg, ${ambient.colors[i % ambient.colors.length]}, transparent, ${ambient.colors[i % ambient.colors.length]}, transparent, ${ambient.colors[i % ambient.colors.length]})`,
                  filter: `blur(2px)`,
                  boxShadow: `0 0 30px ${ambient.colors[i % ambient.colors.length]}, 0 0 60px ${ambient.colors[i % ambient.colors.length]}`,
                }}
                animate={{
                  opacity: [0, 1, 0, 0.8, 0],
                  scaleX: [1, 2, 1, 1.5, 1],
                  x: ["-10px", "10px", "-5px", "8px", "-10px"],
                }}
                transition={{
                  duration: 0.5 / ambient.speed,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.2,
                }}
              />
            ))}
            {/* Ambient charge */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 50% 50%, ${ambient.colors[0]}30 0%, transparent 50%)`,
              }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "fluidDynamics":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Flowing fluid blobs */}
            {ambient.colors.slice(0, 4).map((color, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: "60%",
                  height: "60%",
                  left: `${i * 15}%`,
                  top: `${10 + (i % 2) * 20}%`,
                  background: `radial-gradient(ellipse, ${color}80 0%, transparent 70%)`,
                  filter: "blur(50px)",
                  borderRadius: "40% 60% 60% 40% / 60% 30% 70% 40%",
                }}
                animate={{
                  borderRadius: [
                    "40% 60% 60% 40% / 60% 30% 70% 40%",
                    "60% 40% 30% 70% / 40% 60% 40% 60%",
                    "30% 70% 70% 30% / 50% 50% 50% 50%",
                    "40% 60% 60% 40% / 60% 30% 70% 40%",
                  ],
                  x: ["-5%", "5%", "-3%", "4%", "-5%"],
                  y: ["-3%", "4%", "-5%", "3%", "-3%"],
                }}
                transition={{
                  duration: 10 / ambient.speed + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );

      case "fractalBloom":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {/* Fractal layers */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: `${70 - i * 10}%`,
                  height: `${70 - i * 10}%`,
                  border: `2px solid ${ambient.colors[i % ambient.colors.length]}`,
                  borderRadius: `${30 + i * 5}% ${70 - i * 5}% ${40 + i * 3}% ${60 - i * 3}% / ${50 + i * 4}% ${50 - i * 4}% ${50 + i * 2}% ${50 - i * 2}%`,
                  opacity: 0.6 - i * 0.08,
                }}
                animate={{
                  rotate: i % 2 === 0 ? 360 : -360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 20 / ambient.speed + i * 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
                }}
              />
            ))}
            {/* Central bloom */}
            <motion.div
              className="absolute w-20 h-20 rounded-full"
              style={{
                background: `radial-gradient(circle, ${ambient.colors[0]}90 0%, ${ambient.colors[1]}50 50%, transparent 70%)`,
                filter: "blur(15px)",
              }}
              animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "gravitationalLens":
        return (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {/* Warped light rings */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${50 + i * 15}%`,
                  height: `${30 + i * 10}%`,
                  border: `1px solid ${ambient.colors[i % ambient.colors.length]}`,
                  opacity: 0.5 - i * 0.1,
                  transform: `perspective(500px) rotateX(${60 - i * 10}deg)`,
                }}
                animate={{
                  rotateZ: i % 2 === 0 ? 360 : -360,
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  rotateZ: { duration: 30 / ambient.speed + i * 5, repeat: Infinity, ease: "linear" },
                  scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                }}
              />
            ))}
            {/* Singularity */}
            <motion.div
              className="absolute w-24 h-24 rounded-full"
              style={{
                background: `radial-gradient(circle, ${ambient.colors[0]} 0%, ${ambient.colors[1]}80 30%, transparent 70%)`,
                boxShadow: `0 0 60px ${ambient.colors[2]}, 0 0 100px ${ambient.colors[1]}`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                boxShadow: [
                  `0 0 60px ${ambient.colors[2]}, 0 0 100px ${ambient.colors[1]}`,
                  `0 0 100px ${ambient.colors[3]}, 0 0 150px ${ambient.colors[2]}`,
                  `0 0 60px ${ambient.colors[2]}, 0 0 100px ${ambient.colors[1]}`,
                ],
              }}
              transition={{ duration: 4 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Lensed background streaks */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`streak-${i}`}
                className="absolute w-full h-2"
                style={{
                  top: `${40 + i * 10}%`,
                  background: `linear-gradient(90deg, transparent, ${ambient.colors[4]}40, transparent)`,
                  filter: "blur(3px)",
                }}
                animate={{
                  scaleY: [1, 3, 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3 / ambient.speed,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        );

      // NEW VOGUE & CHIC MINIMALIST EFFECTS
      case "marbleVeins":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Base marble texture */}
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${ambient.colors[0]}20, ${ambient.colors[3]}40, ${ambient.colors[0]}20)`,
              }}
            />
            {/* Flowing veins */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: "200%",
                  height: "2px",
                  left: "-50%",
                  top: `${20 + i * 20}%`,
                  background: `linear-gradient(90deg, transparent, ${ambient.colors[2]}60, ${ambient.colors[2]}80, ${ambient.colors[2]}60, transparent)`,
                  filter: "blur(1px)",
                  transformOrigin: "center",
                }}
                animate={{
                  x: ["-20%", "20%", "-20%"],
                  rotate: [-2 + i, 2 - i, -2 + i],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 15 / ambient.speed + i * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
            {/* Subtle shimmer spots */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`shimmer-${i}`}
                className="absolute rounded-full"
                style={{
                  width: "30%",
                  height: "30%",
                  left: `${15 + i * 25}%`,
                  top: `${20 + i * 20}%`,
                  background: `radial-gradient(circle, ${ambient.colors[2]}20 0%, transparent 70%)`,
                  filter: "blur(40px)",
                }}
                animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
                transition={{ duration: 8 / ambient.speed, repeat: Infinity, delay: i * 2 }}
              />
            ))}
          </div>
        );

      case "silkRipple":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Silk waves */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: "120%",
                  height: `${25 + i * 5}%`,
                  left: "-10%",
                  top: `${i * 20}%`,
                  background: `linear-gradient(180deg, transparent, ${ambient.colors[i % ambient.colors.length]}50, transparent)`,
                  filter: "blur(30px)",
                  borderRadius: "50%",
                }}
                animate={{
                  x: ["-5%", "5%", "-5%"],
                  y: ["-2%", "2%", "-2%"],
                  scaleY: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8 / ambient.speed + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>
        );

      case "moireElegance":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* First line pattern */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, ${ambient.colors[0]}30 0px, transparent 1px, transparent 8px)`,
              }}
              animate={{ rotate: [0, 3, 0] }}
              transition={{ duration: 20 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Second overlapping pattern */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${ambient.colors[1]}25 0px, transparent 1px, transparent 8px)`,
              }}
              animate={{ rotate: [0, -3, 0] }}
              transition={{ duration: 25 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Third diagonal pattern */}
            <motion.div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, ${ambient.colors[2]}20 0px, transparent 1px, transparent 12px)`,
              }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 15 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "goldLeaf":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Gold fragments */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: `${15 + Math.random() * 20}%`,
                  height: `${10 + Math.random() * 15}%`,
                  left: `${(i % 4) * 25}%`,
                  top: `${Math.floor(i / 4) * 50 + 10}%`,
                  background: `linear-gradient(${45 + i * 20}deg, ${ambient.colors[i % 3]}60, ${ambient.colors[(i + 1) % 3]}30, transparent)`,
                  filter: "blur(20px)",
                  borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  rotate: [-5, 5, -5],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 6 / ambient.speed + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />
            ))}
            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, transparent 30%, ${ambient.colors[0]}15 50%, transparent 70%)`,
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 8 / ambient.speed, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        );

      case "inkWash":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Ink blobs */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: "80%",
                  height: "50%",
                  left: `${-20 + i * 30}%`,
                  top: `${10 + i * 25}%`,
                  background: `radial-gradient(ellipse, ${ambient.colors[i]}70 0%, ${ambient.colors[i]}40 30%, transparent 70%)`,
                  filter: "blur(60px)",
                }}
                animate={{
                  x: ["-10%", "10%", "-10%"],
                  y: ["-5%", "5%", "-5%"],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 20 / ambient.speed + i * 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
            {/* Water edge effect */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1/3"
              style={{
                background: `linear-gradient(0deg, ${ambient.colors[0]}40 0%, transparent 100%)`,
              }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 10 / ambient.speed, repeat: Infinity }}
            />
          </div>
        );

      case "pearlEssence":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Iridescent layers */}
            {ambient.colors.map((color, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(${i * 72}deg, transparent 40%, ${color}25 50%, transparent 60%)`,
                  mixBlendMode: "overlay",
                }}
                animate={{
                  rotate: [i * 30, i * 30 + 15, i * 30],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 12 / ambient.speed + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
            {/* Soft glow center */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 50% 50%, ${ambient.colors[0]}30 0%, transparent 70%)`,
              }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 8 / ambient.speed, repeat: Infinity }}
            />
          </div>
        );

      case "velvetNight":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Deep velvet texture */}
            <div 
              className="absolute inset-0"
              style={{ background: `linear-gradient(180deg, ${ambient.colors[0]} 0%, ${ambient.colors[1]} 100%)` }}
            />
            {/* Subtle depth variations */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: "50%",
                  height: "50%",
                  left: `${i * 15}%`,
                  top: `${10 + (i % 2) * 30}%`,
                  background: `radial-gradient(circle, ${ambient.colors[(i + 2) % ambient.colors.length]}30 0%, transparent 70%)`,
                  filter: "blur(50px)",
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 10 / ambient.speed + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );

      case "crystalFacets":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Crystal planes */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: "60%",
                  height: "40%",
                  left: `${(i % 3) * 20}%`,
                  top: `${Math.floor(i / 3) * 40}%`,
                  background: `linear-gradient(${60 * i}deg, transparent, ${ambient.colors[i % ambient.colors.length]}40, transparent)`,
                  clipPath: `polygon(${20 + i * 5}% 0%, 100% ${30 + i * 5}%, ${80 - i * 5}% 100%, 0% ${70 - i * 5}%)`,
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  duration: 8 / ambient.speed + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              />
            ))}
            {/* Light refraction */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `conic-gradient(from 0deg at 50% 50%, transparent, ${ambient.colors[0]}20, transparent, ${ambient.colors[2]}20, transparent)`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 30 / ambient.speed, repeat: Infinity, ease: "linear" }}
            />
          </div>
        );

      case "linearGrace":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Parallel lines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: "120%",
                  height: "1px",
                  left: "-10%",
                  top: `${8 + i * 8}%`,
                  background: `linear-gradient(90deg, transparent 10%, ${ambient.colors[i % ambient.colors.length]}${40 + (i % 3) * 20} 50%, transparent 90%)`,
                }}
                animate={{
                  x: i % 2 === 0 ? ["-5%", "5%", "-5%"] : ["5%", "-5%", "5%"],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 10 / ambient.speed + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        );

      case "zenGarden":
        return (
          <div className="absolute inset-0 overflow-hidden">
            {/* Sand base */}
            <div 
              className="absolute inset-0"
              style={{ background: `linear-gradient(180deg, ${ambient.colors[0]} 0%, ${ambient.colors[1]}30 100%)` }}
            />
            {/* Raked sand lines */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: "100%",
                  height: "2px",
                  left: 0,
                  top: `${12 + i * 12}%`,
                  background: `linear-gradient(90deg, transparent 5%, ${ambient.colors[2]}40 50%, transparent 95%)`,
                  borderRadius: "50%",
                }}
                animate={{
                  scaleX: [0.95, 1, 0.95],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 15 / ambient.speed,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}
            {/* Stone accent */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: "8%",
                height: "8%",
                right: "25%",
                top: "40%",
                background: `radial-gradient(circle, ${ambient.colors[3]} 0%, ${ambient.colors[4]} 100%)`,
                boxShadow: `10px 10px 30px ${ambient.colors[4]}40`,
              }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Concentric ripples around stone */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`ripple-${i}`}
                className="absolute rounded-full border"
                style={{
                  width: `${12 + i * 6}%`,
                  height: `${12 + i * 6}%`,
                  right: `${22 - i * 3}%`,
                  top: `${37 - i * 3}%`,
                  borderColor: `${ambient.colors[2]}30`,
                }}
                animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 12, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}
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
