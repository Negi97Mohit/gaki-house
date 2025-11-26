// src/lib/animationGenerator.ts
import { AnimationPreset } from "@/types/animation";

export function generateHtmlFromPreset(preset: AnimationPreset): string {
  const { defaultContent, baseStyle, animationConfig } = preset;

  // Helper to construct background with opacity
  const bg = baseStyle.backgroundColor || "transparent";
  // If it's a hex code and we have opacity, we might want to handle it (simplified here)
  const bgStyle =
    baseStyle.backgroundOpacity !== undefined
      ? `rgba(0,0,0, ${baseStyle.backgroundOpacity})` // Fallback/Simplified logic
      : bg;

  const cssVariables = `
    :root {
      --font-family: '${baseStyle.fontFamily}', sans-serif;
      --base-font-size: ${baseStyle.fontSize}px;
      --color: ${baseStyle.color};
      --accent-color: ${baseStyle.accentColor || "#000"};
      --bg-color: ${bg};
      
      /* New Visual Styles */
      --text-shadow: ${baseStyle.textShadow || "none"};
      --backdrop-filter: ${
        baseStyle.backgroundBlur
          ? `blur(${baseStyle.backgroundBlur}px)`
          : "none"
      };
      --gradient: ${baseStyle.gradient || "none"};
      --bg-opacity: ${baseStyle.backgroundOpacity ?? 0};

      --align-items: ${
        baseStyle.alignment === "left"
          ? "flex-start"
          : baseStyle.alignment === "right"
          ? "flex-end"
          : "center"
      };
      --text-align: ${baseStyle.alignment};
      --duration: ${animationConfig.duration}s;
      --delay-step: ${animationConfig.delay || 0}s;
      --easing: ${
        animationConfig.easing === "bouncy"
          ? "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
          : animationConfig.easing === "smooth"
          ? "cubic-bezier(0.4, 0, 0.2, 1)"
          : animationConfig.easing === "elastic"
          ? "cubic-bezier(0.68, -0.6, 0.32, 1.6)"
          : "ease-out"
      };
    }
  `;

  // ... (Keyframes logic remains the same, omitted for brevity, copy from Phase 6) ...
  // [KEEP THE KEYFRAMES LOGIC HERE]
  let keyframes = "";
  if (preset.category === "Reveal") {
    if (animationConfig.direction === "up")
      keyframes = `@keyframes anim { 0% { opacity: 0; transform: translateY(100%); } 100% { opacity: 1; transform: translateY(0); } }`;
    else if (animationConfig.direction === "down")
      keyframes = `@keyframes anim { 0% { opacity: 0; transform: translateY(-100%); } 100% { opacity: 1; transform: translateY(0); } }`;
    else
      keyframes = `@keyframes anim { 0% { opacity: 0; } 100% { opacity: 1; } }`;
  } else {
    keyframes = `@keyframes anim { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }`;
  }

  const contentLines = Object.entries(defaultContent)
    .map(([key, text], index) => {
      const isMain = ["heading", "title", "value"].includes(key);
      const fontSize = isMain
        ? "var(--base-font-size)"
        : "calc(var(--base-font-size) * 0.5)";
      const fontWeight = isMain ? "800" : "400";
      const delayCalc = `calc(${index * 0.15}s + var(--delay-step))`;

      // Handle Gradient Text
      const gradientStyle = baseStyle.gradient
        ? `background: ${baseStyle.gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: transparent;`
        : "";

      return `
      <div class="anim-line" style="
        font-size: ${fontSize};
        font-weight: ${fontWeight};
        opacity: 0; 
        animation-delay: ${delayCalc};
        ${gradientStyle}
      ">
        ${text}
      </div>
    `;
    })
    .join("\n");

  // Runtime Script (Keep same as Phase 6)
  const runtimeScript = `
    <script>
      const wrapper = document.querySelector('.wrapper');
      const lines = document.querySelectorAll('.anim-line');
      
      const loop = ${animationConfig.loop || false};
      if (loop) {
        const totalTime = ${animationConfig.duration * 1000} + ${
    (animationConfig.loopDelay || 0) * 1000
  } + 1500;
        setInterval(() => {
          lines.forEach(line => {
             line.style.animation = 'none';
             line.offsetHeight; 
             line.style.animation = ''; 
          });
        }, totalTime);
      }

      // Scale Logic
      const REFERENCE_WIDTH = 800; 
      new ResizeObserver(entries => {
        for (let entry of entries) {
           const { width } = entry.contentRect;
           if(width === 0) return;
           const scale = width / REFERENCE_WIDTH;
           wrapper.style.transform = \`scale(\${scale})\`;
           wrapper.style.width = \`\${100 / scale}%\`;
        }
      }).observe(document.body);
    </script>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=${baseStyle.fontFamily.replace(
    / /g,
    "+"
  )}:wght@300;400;700;900&display=swap" rel="stylesheet">
  <style>
    ${cssVariables}
    ${keyframes}

    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
    
    body {
      background: transparent;
      font-family: var(--font-family);
      color: var(--color);
      display: flex;
      flex-direction: column;
      align-items: center; 
      justify-content: center;
    }

    .wrapper {
      transform-origin: center center;
      display: flex;
      flex-direction: column;
      align-items: center; 
      justify-content: center;
      width: 100%;
      transition: transform 0.1s linear;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 0.3em;
      padding: 2rem;
      width: 100%;
      align-items: var(--align-items);
      text-align: var(--text-align);
      box-sizing: border-box;
      
      /* Glassmorphism / Background Support */
      background-color: var(--bg-color);
      backdrop-filter: var(--backdrop-filter);
      -webkit-backdrop-filter: var(--backdrop-filter);
      border-radius: 16px;
      
      /* Apply text shadow globally to container or specific lines? Container is safer for now */
      text-shadow: var(--text-shadow);
    }

    .anim-line {
      display: block;
      line-height: 1.1;
      opacity: 0;
      animation: anim var(--duration) var(--easing) forwards;
      will-change: transform, opacity;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${contentLines}
    </div>
  </div>
  ${runtimeScript}
</body>
</html>
  `.trim();
}
