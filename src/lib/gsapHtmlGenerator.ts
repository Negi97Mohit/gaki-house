// src/lib/gsapHtmlGenerator.ts
// Generates standalone HTML with embedded GSAP animations

import { GSAPPreset, GSAPAnimationConfig, splitTextToChars } from "@/features/animation/lib/gsapAnimations";

// Effect types that use particle/canvas animations
const PARTICLE_EFFECT_TYPES = [
  "fire-effect",
  "water-effect",
  "snow-effect",
  "confetti-effect",
  "graffiti-effect",
  "neon-particles-effect",
  "electric-effect",
  "glitch-blocks-effect",
  "rainbow-burst-effect",
  "pulse-rings-effect",
  "bounce-balls-effect",
  "shake-debris-effect",
  "glow-orbs-effect",
  "float-bubbles-effect",
  "flame-sparks-effect",
  "ice-crystals-effect",
];

export function generateGSAPHtml(
  preset: GSAPPreset,
  text: string,
  subtext?: string,
  options?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    textAlign?: "left" | "center" | "right";
  }
): string {
  const config = preset.config;
  const fontFamily = options?.fontFamily || "Inter";
  const fontSize = options?.fontSize || 48;
  const color = options?.color || "#FFFFFF";
  const backgroundColor = options?.backgroundColor || "transparent";
  const textAlign = options?.textAlign || "center";

  // Check if this is a particle effect animation
  const isParticleEffect = PARTICLE_EFFECT_TYPES.includes(config.type);

  if (isParticleEffect) {
    return generateParticleEffectHtml(preset, text, {
      fontFamily,
      fontSize,
      color,
      backgroundColor,
      textAlign,
    });
  }

  // Check if this animation needs split text
  const needsSplitText = [
    "cinematic-reveal",
    "stagger-wave",
    "typewriter",
    "scramble",
    "magnetic-pull",
    "shatter",
  ].includes(config.type);

  const mainTextHtml = needsSplitText ? splitTextToChars(text) : text;
  const subTextHtml = subtext
    ? needsSplitText
      ? splitTextToChars(subtext)
      : subtext
    : "";

  // Generate the animation JavaScript
  const animationScript = generateAnimationScript(config, !!subtext);

  return `
  < !DOCTYPE html >
    <html>
    <head>
    <meta charset="UTF-8" >
      <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, " + ")}:wght@300;400;700;900&display=swap" rel = "stylesheet" >
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" > </script>
          <style>
          * { margin: 0; padding: 0; box- sizing: border - box; }
html, body {
  width: 100 %;
  height: 100 %;
  overflow: hidden;
  background: transparent;
}
    body {
  display: flex;
  flex - direction: column;
  align - items: ${textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center"};
  justify - content: center;
  font - family: '${fontFamily}', sans - serif;
  padding: 20px;
}
    .main - text {
  font - size: ${fontSize} px;
  font - weight: 700;
  color: ${color};
  line - height: 1.1;
  text - align: ${textAlign};
  perspective: 1000px;
  transform - style: preserve - 3d;
}
    .sub - text {
  font - size: ${Math.round(fontSize * 0.5)} px;
  font - weight: 400;
  color: ${color};
  opacity: 0.8;
  margin - top: 10px;
  text - align: ${textAlign};
  perspective: 1000px;
  transform - style: preserve - 3d;
}
    .char {
  display: inline - block;
  will - change: transform, opacity;
}
</style>
  </head>
  < body style = "background: ${backgroundColor};" >
    <div class="main-text" > ${mainTextHtml} </div>
  ${subtext ? `<div class="sub-text">${subTextHtml}</div>` : ""}

<script>
  ${animationScript}
</script>
  </body>
  </html>
    `.trim();
}

// Generate HTML with canvas-based particle effects
function generateParticleEffectHtml(
  preset: GSAPPreset,
  text: string,
  options: {
    fontFamily: string;
    fontSize: number;
    color: string;
    backgroundColor: string;
    textAlign: string;
  }
): string {
  const { fontFamily, fontSize, color, backgroundColor, textAlign } = options;
  const effectType = preset.config.type.replace("-effect", "");
  const intensity = preset.config.intensity || 1;
  const loop = preset.config.loop !== false;
  const effectColor = preset.config.color || color;

  return `
  < !DOCTYPE html >
    <html>
    <head>
    <meta charset="UTF-8" >
      <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, " + ")}:wght@300;400;700;900&display=swap" rel = "stylesheet" >
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" > <\/script>
          <style>
          * { margin: 0; padding: 0; box- sizing: border - box; }
html, body {
  width: 100 %;
  height: 100 %;
  overflow: hidden;
  background: transparent!important;
}
    body {
  position: relative;
  background: transparent!important;
}
#particle - canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100 %;
  height: 100 %;
  pointer - events: none;
  z - index: 2;
}
    .text - container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100 %;
  height: 100 %;
  display: flex;
  flex - direction: column;
  align - items: ${textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center"};
  justify - content: center;
  font - family: '${fontFamily}', sans - serif;
  padding: 20px;
  z - index: 1;
}
    .main - text {
  font - size: ${fontSize} px;
  font - weight: 700;
  color: ${color};
  line - height: 1.1;
  text - align: ${textAlign};
  text - shadow: ${getTextShadowForEffect(effectType, effectColor)};
  animation: textPulse 2s ease -in -out infinite;
}
@keyframes textPulse {
  0 %, 100 % { transform: scale(1); }
  50 % { transform: scale(1.02); }
}
</style>
  </head>
  < body style = "background: transparent !important;" >
    <canvas id="particle-canvas" > </canvas>
      < div class="text-container" >
        <div class="main-text" > ${text} </div>
          </div>

            <script>
            (function () {
      ${generateParticleScript(effectType, intensity, loop, effectColor)}

              // Add text animation with GSAP
              const textEl = document.querySelector('.main-text');
              if (textEl && typeof gsap !== 'undefined') {
                gsap.fromTo(textEl,
                  { opacity: 0, scale: 0.8, y: 20 },
                  { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" }
                );
              }
            })();
<\/script>
  </body>
  </html>
    `.trim();
}

function getTextShadowForEffect(effectType: string, customColor?: string): string {
  const shadows: Record<string, string> = {
    "fire": `0 0 20px #ff4500, 0 0 40px #ff6600, 0 0 60px #ff8800, 0 0 80px ${customColor || '#ff4500'} `,
    "water": `0 0 20px #00bfff, 0 0 40px #1e90ff, 0 0 60px #4169e1, 0 0 80px ${customColor || '#00bfff'} `,
    "snow": `0 0 15px #ffffff, 0 0 30px #e0ffff, 0 0 50px ${customColor || '#ffffff'} `,
    "confetti": `0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px ${customColor || '#ffff00'} `,
    "graffiti": `3px 3px 0 #ff00ff, -3px - 3px 0 #00ffff, 0 0 20px ${customColor || '#ff00ff'} `,
    "neon-particles": `0 0 20px #ff00ff, 0 0 40px #8000ff, 0 0 60px ${customColor || '#ff00ff'} `,
    "electric": `0 0 20px #00ffff, 0 0 40px #0080ff, 0 0 60px #ffffff, 0 0 80px ${customColor || '#00ffff'} `,
    "glitch-blocks": `2px 0 #ff0000, -2px 0 #00ffff, 0 0 10px ${customColor || '#ff0000'} `,
    "rainbow-burst": `0 0 20px #ff0000, 0 0 30px #ffff00, 0 0 40px #00ff00, 0 0 50px ${customColor || '#ff00ff'} `,
    "pulse-rings": `0 0 30px rgba(255, 255, 255, 0.8), 0 0 50px ${customColor || '#ffffff'} `,
    "bounce-balls": `0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px ${customColor || '#ff4444'} `,
    "shake-debris": `0 0 10px rgba(255, 200, 100, 0.8), 0 0 20px ${customColor || '#8b4513'} `,
    "glow-orbs": `0 0 30px #ffff00, 0 0 60px #ff8800, 0 0 80px ${customColor || '#ffff00'} `,
    "float-bubbles": `0 0 15px rgba(100, 200, 255, 0.8), 0 0 30px ${customColor || '#00bfff'} `,
    "flame-sparks": `0 0 20px #ff4400, 0 0 40px #ffaa00, 0 0 60px ${customColor || '#ff4400'} `,
    "ice-crystals": `0 0 20px #88ffff, 0 0 40px #4488ff, 0 0 60px ${customColor || '#88ffff'} `,
  };
  return shadows[effectType] || `0 0 20px ${customColor || '#ffffff'} `;
}

function generateParticleScript(effectType: string, intensity: number, loop: boolean, customColor?: string): string {
  return `
const canvas = document.getElementById('particle-canvas');
if (!canvas) return;
const ctx = canvas.getContext('2d');
if (!ctx) return;
let particles = [];
let animationId;
let isRunning = true;

function resize() {
  canvas.width = canvas.offsetWidth || window.innerWidth;
  canvas.height = canvas.offsetHeight || window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Force initial resize after a brief delay
setTimeout(resize, 100);

const effectConfigs = {
  fire: { colors: ['#ff4500', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00'], gravity: -0.15, speed: 3, size: 8, spread: 0.8, life: 60 },
  water: { colors: ['#00bfff', '#1e90ff', '#4169e1', '#87ceeb', '#b0e0e6'], gravity: 0.2, speed: 2, size: 6, spread: 1.2, life: 80 },
  snow: { colors: ['#ffffff', '#f0f8ff', '#e0ffff', '#f5f5f5'], gravity: 0.05, speed: 1, size: 5, spread: 2, life: 150 },
  confetti: { colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'], gravity: 0.08, speed: 4, size: 10, spread: 2, life: 100 },
  graffiti: { colors: ['#ff00ff', '#00ffff', '#ffff00', '#ff4400', '#00ff00'], gravity: 0, speed: 5, size: 12, spread: 1.5, life: 40 },
  'neon-particles': { colors: ['#ff00ff', '#8000ff', '#ff0080', '#00ffff', '#ff00aa'], gravity: -0.02, speed: 1.5, size: 6, spread: 1, life: 100 },
  electric: { colors: ['#00ffff', '#ffffff', '#0080ff', '#80ffff'], gravity: 0, speed: 8, size: 3, spread: 0.5, life: 15 },
  'glitch-blocks': { colors: ['#ff0000', '#00ff00', '#0000ff', '#ffffff'], gravity: 0, speed: 0, size: 20, spread: 0, life: 10 },
  'rainbow-burst': { colors: ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff'], gravity: 0.1, speed: 6, size: 8, spread: 2, life: 60 },
  'pulse-rings': { colors: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)'], gravity: 0, speed: 3, size: 50, spread: 0, life: 40 },
  'bounce-balls': { colors: ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff'], gravity: 0.3, speed: 5, size: 15, spread: 1.5, life: 200 },
  'shake-debris': { colors: ['#8b4513', '#a0522d', '#d2691e', '#cd853f', '#f4a460'], gravity: 0.4, speed: 6, size: 8, spread: 2, life: 50 },
  'glow-orbs': { colors: ['#ffff00', '#ff8800', '#ff4400', '#ffffff'], gravity: -0.03, speed: 0.8, size: 20, spread: 0.5, life: 120 },
  'float-bubbles': { colors: ['rgba(100,200,255,0.6)', 'rgba(150,220,255,0.4)', 'rgba(200,240,255,0.3)'], gravity: -0.08, speed: 1, size: 15, spread: 1, life: 150 },
  'flame-sparks': { colors: ['#ff4400', '#ff6600', '#ffaa00', '#ffcc00', '#ffffff'], gravity: -0.2, speed: 4, size: 4, spread: 0.6, life: 40 },
  'ice-crystals': { colors: ['#88ffff', '#ffffff', '#4488ff', '#aaddff'], gravity: 0.03, speed: 1.5, size: 8, spread: 1.5, life: 100 }
};

const config = effectConfigs['${effectType}'] || effectConfigs.fire;
const particleCount = Math.floor(50 * ${intensity});

function createParticle() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  return {
    x: centerX + (Math.random() - 0.5) * canvas.width * 0.5,
    y: centerY + (Math.random() - 0.5) * canvas.height * 0.3,
    vx: (Math.random() - 0.5) * config.speed * config.spread,
    vy: (Math.random() - 0.5) * config.speed,
    size: config.size * (0.5 + Math.random() * 0.5) * ${intensity},
  color: config.colors[Math.floor(Math.random() * config.colors.length)],
    life: config.life * (0.5 + Math.random() * 0.5),
      maxLife: config.life,
        rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2
};
    }

// Initialize particles
for (let i = 0; i < particleCount; i++) {
  particles.push(createParticle());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += config.gravity;
    p.life--;
    p.rotation += p.rotationSpeed;

    const alpha = Math.min(1, p.life / (p.maxLife * 0.3));

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = alpha;

    // Draw based on effect type
    if ('${effectType}' === 'pulse-rings') {
      const progress = 1 - (p.life / p.maxLife);
      const radius = p.size * (1 + progress * 3);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3 * (1 - progress);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if ('${effectType}' === 'glitch-blocks') {
      ctx.fillStyle = p.color;
      const w = p.size * (0.5 + Math.random());
      const h = p.size * 0.3;
      ctx.fillRect(-w / 2, -h / 2, w, h);
    } else if ('${effectType}' === 'electric') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let j = 0; j < 3; j++) {
        ctx.lineTo((Math.random() - 0.5) * 30, (j + 1) * 10);
      }
      ctx.stroke();
    } else if ('${effectType}' === 'ice-crystals') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      for (let j = 0; j < 6; j++) {
        const angle = (j / 6) * Math.PI * 2;
        const x = Math.cos(angle) * p.size;
        const y = Math.sin(angle) * p.size;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Add glow for certain effects
      if (['fire', 'neon-particles', 'glow-orbs', 'flame-sparks'].includes('${effectType}')) {
        ctx.shadowBlur = p.size * 2;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // Respawn dead particles
    if (p.life <= 0 && ${loop}) {
    particles[i] = createParticle();
  }
});

// Remove dead particles if not looping
if (!${loop}) {
  particles = particles.filter(p => p.life > 0);
}

if (particles.length > 0 || ${loop}) {
  animationId = requestAnimationFrame(animate);
}
    }

animate();
`;
}

function generateAnimationScript(config: GSAPAnimationConfig, hasSubtext: boolean): string {
  const duration = config.duration || 1;
  const delay = config.delay || 0;
  const stagger = config.stagger || 0.03;
  const intensity = config.intensity || 1;
  const direction = config.direction || "up";
  const color = config.color || "#00ffff";
  const loop = config.loop || false;
  const loopDelay = config.loopDelay || 2;

  // Base animation functions
  const animations: Record<string, string> = {
    "cinematic-reveal": `
function animateElement(el, delay) {
  const chars = el.querySelectorAll('.char');
  if (chars.length > 0) {
    gsap.set(chars, { opacity: 0, y: 100, rotationX: -90 });
    gsap.to(chars, {
      opacity: 1, y: 0, rotationX: 0,
      duration: ${duration},
      stagger: ${stagger},
      delay: delay,
      ease: "power4.out"
          });
} else {
  gsap.fromTo(el,
    { opacity: 0, y: 50, clipPath: "inset(100% 0% 0% 0%)" },
    { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: ${duration}, delay: delay, ease: "power3.out" }
          );
        }
      }
`,

    "kinetic-type": `
function animateElement(el, delay) {
  gsap.fromTo(el,
    { scale: 0, rotation: -180 * ${intensity}, opacity: 0 },
{ scale: 1, rotation: 0, opacity: 1, duration: ${duration}, delay: delay, ease: "back.out(2.5)" }
        );
gsap.to(el, { scale: 1.05, duration: 0.15, delay: delay + ${duration}, yoyo: true, repeat: 1, ease: "power2.inOut" });
      }
`,

    "morph-glitch": `
function animateElement(el, delay) {
  const tl = gsap.timeline({ delay: delay });
  tl.set(el, { opacity: 1 });
  for (let i = 0; i < 5; i++) {
    const offset = (Math.random() - 0.5) * 20 * ${intensity};
    tl.to(el, { x: offset, skewX: offset * 0.5, duration: 0.05, ease: "none" });
    tl.set(el, { textShadow: offset + "px 0 cyan, " + (-offset) + "px 0 magenta" });
  }
  tl.to(el, { x: 0, skewX: 0, textShadow: "none", duration: 0.3, ease: "power2.out" });
}
`,

    "elastic-bounce": `
function animateElement(el, delay) {
  const fromVars = { opacity: 0, scale: 0.3, ${direction === "up" || direction === "down" ? "y" : "x"
      }: ${direction === "up" || direction === "left" ? 100 : -100} };
gsap.fromTo(el, fromVars, {
  opacity: 1, scale: 1, x: 0, y: 0,
  duration: ${duration}, delay: delay,
  ease: "elastic.out(1, 0.5)"
        });
      }
`,

    "stagger-wave": `
function animateElement(el, delay) {
  const chars = el.querySelectorAll('.char');
  if (chars.length > 0) {
    gsap.set(chars, { opacity: 0, y: 30 });
    gsap.to(chars, {
      opacity: 1, y: 0,
      duration: ${duration},
      stagger: { each: ${stagger}, from: "start", ease: "sine.inOut" },
  delay: delay,
    ease: "power2.out"
});
        } else {
  gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: ${duration}, delay: delay, ease: "power2.out" });
        }
      }
`,

    "perspective-flip": `
function animateElement(el, delay) {
  const rotationProp = "${direction === "up" || direction === "down" ? "rotationX" : "rotationY"}";
  const rotationValue = ${direction === "up" || direction === "left" ? 90 : -90
      };
gsap.set(el.parentElement, { perspective: 1000 });
gsap.fromTo(el,
  { opacity: 0, [rotationProp]: rotationValue },
  { opacity: 1, [rotationProp]: 0, duration: ${duration}, delay: delay, ease: "power3.out" }
);
      }
`,

    "liquid-fill": `
function animateElement(el, delay) {
  gsap.fromTo(el,
    { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", opacity: 1 },
    { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: ${duration}, delay: delay, ease: "power2.inOut" }
        );
      }
`,

    "neon-flicker": `
function animateElement(el, delay) {
  const color = "${color}";
  const tl = gsap.timeline({ delay: delay });
  tl.set(el, { opacity: 0 });
  const pattern = [0.1, 0.05, 0.1, 0.05, 0.2, 0.05, 0.3];
  pattern.forEach((dur, i) => {
    tl.to(el, {
      opacity: i % 2 === 0 ? 1 : 0.3,
      textShadow: i % 2 === 0
        ? "0 0 10px " + color + ", 0 0 20px " + color + ", 0 0 40px " + color
        : "0 0 5px " + color,
      duration: dur,
      ease: "none"
    });
  });
  tl.to(el, { opacity: 1, textShadow: "0 0 10px " + color + ", 0 0 20px " + color + ", 0 0 40px " + color, duration: 0.3, ease: "power2.out" });
}
`,

    "typewriter": `
function animateElement(el, delay) {
  const chars = el.querySelectorAll('.char');
  if (chars.length > 0) {
    gsap.set(chars, { opacity: 0 });
    gsap.to(chars, { opacity: 1, duration: 0.01, stagger: ${stagger}, delay: delay, ease: "none" });
}
      }
`,

    "scramble": `
function animateElement(el, delay) {
  const chars = el.querySelectorAll('.char');
  const scrambleChars = "!<>-_\\\\/[]{}—=+*^?#________";
  chars.forEach((char, i) => {
    const originalText = char.textContent || "";
    let iterations = 0;
    gsap.to(char, {
      duration: ${duration},
      delay: delay + i * ${stagger},
      onUpdate: function () {
        iterations++;
        if (iterations < 10) {
          char.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        } else {
          char.textContent = originalText;
        }
      }
          });
});
      }
`,

    "magnetic-pull": `
function animateElement(el, delay) {
  const chars = el.querySelectorAll('.char');
  if (chars.length > 0) {
    gsap.set(chars, {
      opacity: 0,
      x: () => (Math.random() - 0.5) * 200,
      y: () => (Math.random() - 0.5) * 200,
      rotation: () => (Math.random() - 0.5) * 180
    });
    gsap.to(chars, {
      opacity: 1, x: 0, y: 0, rotation: 0,
      duration: ${duration}, stagger: ${stagger}, delay: delay,
      ease: "back.out(1.5)"
          });
}
      }
`,

    "rubber-band": `
function animateElement(el, delay) {
  const tl = gsap.timeline({ delay: delay });
  tl.fromTo(el, { scaleX: 1, scaleY: 1, opacity: 0 }, { opacity: 1, duration: 0.1 })
    .to(el, { scaleX: 1.25, scaleY: 0.75, duration: 0.15, ease: "power2.out" })
    .to(el, { scaleX: 0.75, scaleY: 1.25, duration: 0.15, ease: "power2.out" })
    .to(el, { scaleX: 1.15, scaleY: 0.85, duration: 0.1, ease: "power2.out" })
    .to(el, { scaleX: 0.95, scaleY: 1.05, duration: 0.1, ease: "power2.out" })
    .to(el, { scaleX: 1, scaleY: 1, duration: 0.1, ease: "power2.out" });
}
`,

    "shatter": `
function animateElement(el, delay) {
  const chars = el.querySelectorAll('.char');
  if (chars.length > 0) {
    const tl = gsap.timeline({ delay: delay });
    tl.set(chars, { opacity: 1, x: 0, y: 0, rotation: 0 });
    tl.to(chars, {
      x: () => (Math.random() - 0.5) * 300,
      y: () => (Math.random() - 0.5) * 300,
      rotation: () => (Math.random() - 0.5) * 360,
      opacity: 0,
      duration: ${duration}, stagger: ${stagger},
      ease: "power4.in"
          });
  tl.to(chars, {
    x: 0, y: 0, rotation: 0, opacity: 1,
    duration: ${duration}, stagger: ${stagger},
    ease: "power4.out"
          });
        }
      }
`,

    "ink-reveal": `
function animateElement(el, delay) {
  gsap.fromTo(el,
    { clipPath: "circle(0% at 50% 50%)", opacity: 1 },
    { clipPath: "circle(150% at 50% 50%)", duration: ${duration}, delay: delay, ease: "power2.out" }
        );
      }
`,

    "whip-pan": `
function animateElement(el, delay) {
  const prop = "${direction === "left" || direction === "right" ? "x" : "y"}";
  const sign = ${direction === "left" || direction === "up" ? 1 : -1
      };
gsap.fromTo(el,
  { [prop]: sign * -100 + "%", opacity: 1, filter: "blur(10px)" },
  { [prop]: 0, filter: "blur(0px)", duration: ${duration}, delay: delay, ease: "power4.out" }
);
      }
`,

    "zoom-punch": `
function animateElement(el, delay) {
  gsap.fromTo(el,
    { scale: 3 * ${intensity}, opacity: 0, filter: "blur(20px)" },
{ scale: 1, opacity: 1, filter: "blur(0px)", duration: ${duration}, delay: delay, ease: "power4.out" }
        );
gsap.to(el, { scale: 0.95, duration: 0.1, delay: delay + ${duration}, ease: "power2.inOut" });
gsap.to(el, { scale: 1, duration: 0.1, delay: delay + ${duration} + 0.1, ease: "power2.out" });
      }
`,
  };

  const animFn = animations[config.type] || animations["elastic-bounce"];

  // Loop logic
  const loopScript = loop
    ? `
function runAnimation() {
  animateElement(document.querySelector('.main-text'), ${delay});
      ${hasSubtext ? `animateElement(document.querySelector('.sub-text'), ${delay + 0.3});` : ""}
}
runAnimation();
setInterval(() => {
  runAnimation();
}, ${(duration + loopDelay) * 1000});
`
    : `
animateElement(document.querySelector('.main-text'), ${delay});
    ${hasSubtext ? `animateElement(document.querySelector('.sub-text'), ${delay + 0.3});` : ""}
`;

  return `
    ${animFn}
    ${loopScript}
`;
}
