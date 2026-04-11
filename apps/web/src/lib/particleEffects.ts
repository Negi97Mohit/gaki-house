// src/lib/particleEffects.ts
// Real visual particle effects for fire, water, snow, confetti, etc.
import effectConfigsData from "@/data/particleEffects.json";

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  rotation?: number;
  rotationSpeed?: number;
  shape?:
    | "circle"
    | "square"
    | "triangle"
    | "star"
    | "snowflake"
    | "drop"
    | "spark";
}

export type EffectType =
  | "fire"
  | "water"
  | "snow"
  | "confetti"
  | "graffiti"
  | "neon-particles"
  | "electric"
  | "glitch-blocks"
  | "rainbow-burst"
  | "pulse-rings"
  | "bounce-balls"
  | "shake-debris"
  | "glow-orbs"
  | "float-bubbles"
  | "flame-sparks"
  | "ice-crystals";

interface EffectConfig {
  particleCount: number;
  colors: string[];
  gravity: number;
  spread: number;
  speed: number;
  lifetime: number;
  shape: Particle["shape"];
  continuous: boolean;
  emitRate?: number;
}

export const EFFECT_CONFIGS: Record<EffectType, EffectConfig> =
  effectConfigsData as unknown as Record<EffectType, EffectConfig>;

export class ParticleSystem {
  private particles: Particle[] = [];
  private config: EffectConfig;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private emitCounter = 0;
  private centerX: number;
  private centerY: number;

  constructor(canvas: HTMLCanvasElement, effectType: EffectType) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.config = EFFECT_CONFIGS[effectType];
    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;
  }

  private createParticle(): Particle {
    const angle =
      (Math.random() * this.config.spread - this.config.spread / 2) *
      (Math.PI / 180);
    const speed = this.config.speed * (0.5 + Math.random() * 0.5);

    return {
      x: this.centerX + (Math.random() - 0.5) * 20,
      y: this.centerY + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle - Math.PI / 2) * speed,
      vy: Math.sin(angle - Math.PI / 2) * speed,
      size: 3 + Math.random() * 8,
      color:
        this.config.colors[
          Math.floor(Math.random() * this.config.colors.length)
        ],
      opacity: 1,
      life: 0,
      maxLife: this.config.lifetime * (0.5 + Math.random() * 0.5),
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: this.config.shape,
    };
  }

  private drawParticle(p: Particle) {
    this.ctx.save();
    this.ctx.translate(p.x, p.y);
    this.ctx.rotate(((p.rotation || 0) * Math.PI) / 180);
    this.ctx.globalAlpha = p.opacity;

    switch (p.shape) {
      case "circle":
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = p.size * 2;
        this.ctx.fill();
        break;

      case "square":
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        break;

      case "drop":
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.bezierCurveTo(p.size, 0, p.size, p.size, 0, p.size);
        this.ctx.bezierCurveTo(-p.size, p.size, -p.size, 0, 0, -p.size);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
        break;

      case "snowflake":
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          this.ctx.save();
          this.ctx.rotate((i * 60 * Math.PI) / 180);
          this.ctx.beginPath();
          this.ctx.moveTo(0, 0);
          this.ctx.lineTo(0, -p.size);
          this.ctx.moveTo(0, -p.size * 0.5);
          this.ctx.lineTo(-p.size * 0.3, -p.size * 0.7);
          this.ctx.moveTo(0, -p.size * 0.5);
          this.ctx.lineTo(p.size * 0.3, -p.size * 0.7);
          this.ctx.stroke();
          this.ctx.restore();
        }
        break;

      case "spark":
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.lineTo(p.size * 0.2, 0);
        this.ctx.lineTo(0, p.size);
        this.ctx.lineTo(-p.size * 0.2, 0);
        this.ctx.closePath();
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = p.size;
        this.ctx.fill();
        break;

      case "star":
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = ((i * 72 - 90) * Math.PI) / 180;
          const innerAngle = ((i * 72 + 36 - 90) * Math.PI) / 180;
          if (i === 0) {
            this.ctx.moveTo(Math.cos(angle) * p.size, Math.sin(angle) * p.size);
          } else {
            this.ctx.lineTo(Math.cos(angle) * p.size, Math.sin(angle) * p.size);
          }
          this.ctx.lineTo(
            Math.cos(innerAngle) * p.size * 0.5,
            Math.sin(innerAngle) * p.size * 0.5
          );
        }
        this.ctx.closePath();
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
        break;

      default:
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
    }

    this.ctx.restore();
  }

  private update() {
    // Emit new particles for continuous effects
    if (this.config.continuous && this.config.emitRate) {
      this.emitCounter += this.config.emitRate;
      while (this.emitCounter >= 1) {
        this.particles.push(this.createParticle());
        this.emitCounter--;
      }
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += this.config.gravity;
      p.rotation = (p.rotation || 0) + (p.rotationSpeed || 0);
      p.opacity = 1 - p.life / p.maxLife;

      // Add some horizontal drift for certain effects
      if (this.config.shape === "snowflake" || this.config.shape === "drop") {
        p.vx += (Math.random() - 0.5) * 0.1;
      }

      // Remove dead particles
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      this.drawParticle(p);
    }
  }

  public burst() {
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  public start() {
    if (!this.config.continuous) {
      this.burst();
    }

    const animate = () => {
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public updateCenter(x: number, y: number) {
    this.centerX = x;
    this.centerY = y;
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.centerX = width / 2;
    this.centerY = height / 2;
  }
}
