// src/components/AmbientBackground.tsx
import React, { useEffect, useRef } from "react";

// Minimal Simplex Noise implementation to avoid external dependencies
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

  dot(g: Float32Array, x: number, y: number) {
    return g[0] * x + g[1] * y;
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
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }
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

interface Circle {
  x: number;
  y: number;
  r: number; // radius
  xOff: number;
  yOff: number;
  step: number;
}

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noise = new SimplexNoise();
    let width = 0;
    let height = 0;
    let circles: Circle[] = [];

    // --- Configuration ---
    const circleCount = 10;
    const baseRadius = 200;
    const speed = 0.0015; // Movement speed
    const colorSpeed = 0.002; // Color shift speed

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
        });
      }
    };

    const resize = () => {
      if (!container) return;
      width = container.offsetWidth;
      height = container.offsetHeight;

      // Update canvas dimensions to match container
      canvas.width = width;
      canvas.height = height;

      // Re-distribute circles to fit new size
      initCircles();
    };

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += colorSpeed;

      // Clear the canvas
      ctx.clearRect(0, 0, width, height);

      circles.forEach((c) => {
        // Update position with noise
        c.xOff += speed;
        c.yOff += speed;

        const vx = noise.noise2D(c.xOff, c.xOff) * 2;
        const vy = noise.noise2D(c.yOff, c.yOff) * 2;

        c.x += vx;
        c.y += vy;

        // Wrap around screen
        if (c.x < -c.r) c.x = width + c.r;
        if (c.x > width + c.r) c.x = -c.r;
        if (c.y < -c.r) c.y = height + c.r;
        if (c.y > height + c.r) c.y = -c.r;

        // --- UPDATED COLOR SCHEME ---
        // Strictly #2596be (hsl: 196, 67%, 45%)
        const h = 196;
        const s = "67%";

        // Optional: Slight lightness breathe to keep the "organic" feel
        const lightNoise = noise.noise2D(c.step, c.step + time);
        const l = `${45 + lightNoise * 5}%`;

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);

        // Gradient from color to transparent (soft blob)
        gradient.addColorStop(0, `hsla(${h}, ${s}, ${l}, 0.8)`);
        gradient.addColorStop(1, `hsla(${h}, ${s}, ${l}, 0)`);

        ctx.fillStyle = gradient;
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    // --- NEW: ResizeObserver Logic ---
    // This detects when the CONTAINER changes size (PiP, Grid, etc.)
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });

    resizeObserver.observe(container);

    // Initial call
    resize();
    render();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-black"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ filter: "blur(80px)" }}
      />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        // style={{ backgroundImage: 'url("...")' }} // optional noise
      />
    </div>
  );
};
