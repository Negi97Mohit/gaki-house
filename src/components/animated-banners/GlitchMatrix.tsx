// src/components/animated-banners/GlitchMatrix.tsx
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface GlitchMatrixProps {
  color?: string;
  intensity?: number;
}

export const GlitchMatrix: React.FC<GlitchMatrixProps> = ({
  color = "#00ff00",
  intensity = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const dropsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fontSize = 14;

    // Function to initialize drops based on width
    const initDrops = (width: number) => {
      const columns = Math.ceil(width / fontSize);
      // Only re-initialize if the number of columns has changed to avoid resetting active drops unnecessarily
      if (dropsRef.current.length !== columns) {
        // Initialize drops at random y positions above the canvas for a staggered start
        dropsRef.current = new Array(columns)
          .fill(1)
          .map(() => Math.random() * -100);
      }
    };

    const render = () => {
      // Create fading trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      const chars =
        "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";

      for (let i = 0; i < dropsRef.current.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = dropsRef.current[i] * fontSize;

        // Randomly color characters white for a "spark" effect
        ctx.fillStyle = Math.random() > 0.95 ? "#ffffff" : color;
        ctx.fillText(text, x, y);

        // Reset drop to top randomly after it crosses the bottom
        if (y > canvas.height && Math.random() > 0.975) {
          dropsRef.current[i] = 0;
        }

        dropsRef.current[i]++;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    // Handle Resize
    const handleResize = () => {
      if (container && canvas) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        initDrops(canvas.width);
      }
    };

    // Initialize
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Start Animation Loop
    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [color]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-black"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block opacity-80"
      />

      {/* Glitch overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0, intensity * 0.3, 0, intensity * 0.5, 0],
          x: [-2, 2, -1, 1, 0],
        }}
        transition={{
          duration: 0.2,
          repeat: Infinity,
          repeatDelay: 2 + Math.random() * 3,
        }}
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}20 50%, transparent 100%)`,
          mixBlendMode: "screen",
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
            rgba(0, 0, 0, 0.5) 2px,
            rgba(0, 0, 0, 0.5) 4px
          )`,
        }}
      />
    </div>
  );
};
