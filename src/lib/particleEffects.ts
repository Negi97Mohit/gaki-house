// src/lib/particleEffects.ts
// Real visual particle effects for fire, water, snow, confetti, etc.

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
  shape?: 'circle' | 'square' | 'triangle' | 'star' | 'snowflake' | 'drop' | 'spark';
}

export type EffectType = 
  | 'fire' 
  | 'water' 
  | 'snow' 
  | 'confetti' 
  | 'graffiti' 
  | 'neon-particles'
  | 'electric' 
  | 'glitch-blocks'
  | 'rainbow-burst'
  | 'pulse-rings'
  | 'bounce-balls'
  | 'shake-debris'
  | 'glow-orbs'
  | 'float-bubbles'
  | 'flame-sparks'
  | 'ice-crystals';

interface EffectConfig {
  particleCount: number;
  colors: string[];
  gravity: number;
  spread: number;
  speed: number;
  lifetime: number;
  shape: Particle['shape'];
  continuous: boolean;
  emitRate?: number;
}

export const EFFECT_CONFIGS: Record<EffectType, EffectConfig> = {
  fire: {
    particleCount: 50,
    colors: ['#ff4500', '#ff6b35', '#ffa500', '#ffcc00', '#fff44f'],
    gravity: -0.15,
    spread: 30,
    speed: 3,
    lifetime: 60,
    shape: 'circle',
    continuous: true,
    emitRate: 3,
  },
  water: {
    particleCount: 40,
    colors: ['#00bfff', '#1e90ff', '#4169e1', '#87ceeb', '#b0e0e6'],
    gravity: 0.2,
    spread: 50,
    speed: 2,
    lifetime: 80,
    shape: 'drop',
    continuous: true,
    emitRate: 2,
  },
  snow: {
    particleCount: 60,
    colors: ['#ffffff', '#f0f8ff', '#e6f3ff', '#d4edff'],
    gravity: 0.05,
    spread: 100,
    speed: 1,
    lifetime: 150,
    shape: 'snowflake',
    continuous: true,
    emitRate: 2,
  },
  confetti: {
    particleCount: 100,
    colors: ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#00ffff', '#ffff00'],
    gravity: 0.1,
    spread: 180,
    speed: 5,
    lifetime: 120,
    shape: 'square',
    continuous: false,
  },
  graffiti: {
    particleCount: 30,
    colors: ['#ff1493', '#00ff00', '#ffff00', '#ff4500', '#9400d3', '#00ffff'],
    gravity: 0,
    spread: 360,
    speed: 4,
    lifetime: 40,
    shape: 'circle',
    continuous: true,
    emitRate: 5,
  },
  'neon-particles': {
    particleCount: 40,
    colors: ['#ff00ff', '#00ffff', '#ff0080', '#80ff00'],
    gravity: 0,
    spread: 360,
    speed: 2,
    lifetime: 100,
    shape: 'circle',
    continuous: true,
    emitRate: 2,
  },
  electric: {
    particleCount: 25,
    colors: ['#00ffff', '#ffffff', '#87ceeb', '#00bfff'],
    gravity: 0,
    spread: 360,
    speed: 8,
    lifetime: 15,
    shape: 'spark',
    continuous: true,
    emitRate: 4,
  },
  'glitch-blocks': {
    particleCount: 20,
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#00ffff'],
    gravity: 0,
    spread: 180,
    speed: 3,
    lifetime: 20,
    shape: 'square',
    continuous: true,
    emitRate: 3,
  },
  'rainbow-burst': {
    particleCount: 80,
    colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
    gravity: 0.08,
    spread: 360,
    speed: 6,
    lifetime: 80,
    shape: 'circle',
    continuous: false,
  },
  'pulse-rings': {
    particleCount: 8,
    colors: ['#ffffff', '#ff00ff', '#00ffff'],
    gravity: 0,
    spread: 0,
    speed: 3,
    lifetime: 60,
    shape: 'circle',
    continuous: true,
    emitRate: 0.5,
  },
  'bounce-balls': {
    particleCount: 15,
    colors: ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#a55eea'],
    gravity: 0.3,
    spread: 120,
    speed: 5,
    lifetime: 200,
    shape: 'circle',
    continuous: false,
  },
  'shake-debris': {
    particleCount: 30,
    colors: ['#8b4513', '#a0522d', '#d2691e', '#cd853f', '#deb887'],
    gravity: 0.25,
    spread: 180,
    speed: 4,
    lifetime: 60,
    shape: 'square',
    continuous: false,
  },
  'glow-orbs': {
    particleCount: 20,
    colors: ['#ffd700', '#ffec8b', '#fff8dc', '#fffacd'],
    gravity: -0.02,
    spread: 360,
    speed: 1,
    lifetime: 150,
    shape: 'circle',
    continuous: true,
    emitRate: 1,
  },
  'float-bubbles': {
    particleCount: 25,
    colors: ['rgba(135,206,250,0.6)', 'rgba(176,224,230,0.6)', 'rgba(173,216,230,0.5)'],
    gravity: -0.08,
    spread: 60,
    speed: 1.5,
    lifetime: 120,
    shape: 'circle',
    continuous: true,
    emitRate: 1,
  },
  'flame-sparks': {
    particleCount: 35,
    colors: ['#ff4500', '#ff6347', '#ffd700', '#ffffff'],
    gravity: -0.2,
    spread: 40,
    speed: 4,
    lifetime: 40,
    shape: 'spark',
    continuous: true,
    emitRate: 4,
  },
  'ice-crystals': {
    particleCount: 30,
    colors: ['#e0ffff', '#b0e0e6', '#87ceeb', '#add8e6', '#ffffff'],
    gravity: 0.02,
    spread: 80,
    speed: 1.5,
    lifetime: 100,
    shape: 'snowflake',
    continuous: true,
    emitRate: 2,
  },
};

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
    this.ctx = canvas.getContext('2d')!;
    this.config = EFFECT_CONFIGS[effectType];
    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;
  }

  private createParticle(): Particle {
    const angle = (Math.random() * this.config.spread - this.config.spread / 2) * (Math.PI / 180);
    const speed = this.config.speed * (0.5 + Math.random() * 0.5);
    
    return {
      x: this.centerX + (Math.random() - 0.5) * 20,
      y: this.centerY + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle - Math.PI / 2) * speed,
      vy: Math.sin(angle - Math.PI / 2) * speed,
      size: 3 + Math.random() * 8,
      color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
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
    this.ctx.rotate((p.rotation || 0) * Math.PI / 180);
    this.ctx.globalAlpha = p.opacity;

    switch (p.shape) {
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = p.size * 2;
        this.ctx.fill();
        break;

      case 'square':
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        break;

      case 'drop':
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.bezierCurveTo(p.size, 0, p.size, p.size, 0, p.size);
        this.ctx.bezierCurveTo(-p.size, p.size, -p.size, 0, 0, -p.size);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
        break;

      case 'snowflake':
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          this.ctx.save();
          this.ctx.rotate((i * 60) * Math.PI / 180);
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

      case 'spark':
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

      case 'star':
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 72 - 90) * Math.PI / 180;
          const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
          if (i === 0) {
            this.ctx.moveTo(Math.cos(angle) * p.size, Math.sin(angle) * p.size);
          } else {
            this.ctx.lineTo(Math.cos(angle) * p.size, Math.sin(angle) * p.size);
          }
          this.ctx.lineTo(Math.cos(innerAngle) * p.size * 0.5, Math.sin(innerAngle) * p.size * 0.5);
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
      p.opacity = 1 - (p.life / p.maxLife);

      // Add some horizontal drift for certain effects
      if (this.config.shape === 'snowflake' || this.config.shape === 'drop') {
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
