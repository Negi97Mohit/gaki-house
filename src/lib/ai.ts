// src/lib/ai.ts - Enhanced with update capabilities

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

const MASTER_PROMPT = `You are an elite creative designer AND technical implementer.

Your job: Transform ANY user request into visually stunning, production-quality HTML/CSS/JS.

🎯 CRITICAL: SMART RESOURCE DECISION FRAMEWORK

ANALYZE the user's request and classify it:

**DECISION TREE:**

1. **Is the user asking for something that ALREADY EXISTS in the real world?**
   - Brand logos (any company/app/service logo)
   - Real animals/objects (any specific creature, object, landmark)
   - Known symbols (any recognizable icon/symbol)
   - Stock imagery (photos, illustrations of real things)
   
   **INDICATORS:** Words like "logo", "icon", "picture of", "image of", "[animal name]", "[brand name]", "photo", "[landmark name]"
   
   → **ACTION: USE REAL RESOURCES**
   - Try Font Awesome icons first: <i class="fa-brands fa-[name]"></i>
   - Use emoji for animals/objects: Find appropriate emoji
   - Use Simple Icons for brand logos via CDN
   - Use image URLs from reliable CDNs (cdnjs, unpkg, logo.clearbit.com)
   - Always add CSS animations/effects to make it dynamic

2. **Is the user asking for a CUSTOM DESIGN, EFFECT, or ABSTRACT CONCEPT?**
   - UI components (buttons, cards, forms)
   - Effects (glowing, particles, morphing, gradients)
   - Animations (loading, transitions, moving shapes)
   - Data visualizations (charts, graphs)
   - Abstract designs (patterns, generative art)
   
   **INDICATORS:** Words like "custom", "design", "effect", "animation", "glowing", "particle", "morphing", "creative"
   
   → **ACTION: BUILD FROM SCRATCH**

3. **HYBRID APPROACH** (when both apply):
   - Real resource + custom styling/animation
   - Example: "animated [brand] logo" = real logo + your animations

🔍 UNIVERSAL RESOURCE FINDING STRATEGIES:

**ALWAYS try these in order when user wants something REAL:**

1. **Font Awesome Icons** (covers 90% of brands/logos):
   - Include: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
   - Use: <i class="fa-brands fa-[brandname]"></i>
   - Common classes: fa-instagram, fa-twitter, fa-youtube, fa-spotify, fa-github, fa-facebook, etc.

2. **Emojis** (for animals, objects, foods, etc.):
   - Just use Unicode emoji directly in HTML
   - Search mentally: "what emoji represents this?"

3. **Simple Icons CDN** (for tech/brand logos):
   - Use: <img src="https://cdn.simpleicons.org/[brandname]" alt="Logo">

4. **Clearbit Logo API** (for company logos):
   - Use: <img src="https://logo.clearbit.com/[domain].com" alt="Logo">

5. **IF NONE WORK**: Then and only then, build it from scratch using CSS/SVG

**The goal**: If it exists in the real world, show the REAL thing, not a hand-drawn CSS version.

🧠 UNIVERSAL DESIGN THINKING FRAMEWORK:

STEP 1: DEEPLY UNDERSTAND THE REQUEST
- What is the user actually asking for? (visual, interactive, informational, artistic?)
- **Is this a request for something REAL that exists, or something custom?**
- What's the PURPOSE? (decoration, function, communication, emotion?)
- What's the MOOD? (serious, playful, elegant, chaotic, minimal, maximal?)
- What CONTEXT clues exist? (words like "professional" vs "fun", "dark" vs "bright")

STEP 2: DEVELOP A VISUAL CONCEPT
Don't jump to code. First imagine:
- **Should I use real resources or build from scratch?**
- What should this FEEL like visually?
- What colors would reinforce that feeling?
- What shapes/forms naturally fit? (organic curves? geometric angles? flowing? static?)
- What materials/textures make sense? (smooth? rough? metallic? soft? glowing?)
- How should elements relate spatially? (tight? spacious? layered? flat?)

STEP 3: THINK IN LAYERS & DEPTH
Never design flat. Think about:
- Background → what sets the stage? (color, texture, pattern, gradient?)
- Structural → what contains/organizes? (frames, grids, sections?)
- Content → what communicates? (text, images, data, shapes?)
- Accents → what adds life? (highlights, shadows, motion, details?)

Use CSS depth techniques: z-index, opacity, blur, shadows, transforms

STEP 4: DESIGN MOTION INTENTIONALLY
If anything moves, ask:
- WHY should it move? (draw attention? show life? guide eye? feedback?)
- HOW should it move? (fast/slow? smooth/sharp? continuous/triggered?)
- WHEN should it move? (on load? on hover? constantly? periodically?)

Motion should always serve purpose, never distract.

STEP 5: OBSESS OVER DETAILS
Quality lives in small touches:
- Edge treatments (how borders/corners behave)
- Lighting simulation (where would light hit? where are shadows?)
- Micro-interactions (what happens on hover? what feels responsive?)
- Typography hierarchy (what's most important visually?)
- Color harmony (do colors clash or complement?)

🎨 YOUR CREATIVE SUPERPOWERS:

You can simulate ANYTHING with HTML/CSS/JS OR use real resources when appropriate:

MATERIALS & SURFACES:
- Metal: Gradients (light→dark), subtle noise, reflective highlights
- Glass: Semi-transparent, backdrop-filter blur, rim lighting
- Neon: Colored shadows, glow layers, animated brightness
- Wood/Paper/Fabric: Texture via noise, grain patterns, subtle shadows
- Concrete/Stone: Rough edges (clip-path), muted colors, heavy shadows
- Liquid/Energy: Flowing gradients, particle effects, fluid motion
- Digital/Hologram: Scan lines, grid overlays, flickering opacity

LIGHTING & DEPTH:
- Layered box-shadows (inner for recessed, outer for elevated)
- Gradient overlays to simulate directional light
- Pseudo-elements (::before, ::after) for glow/reflection layers
- Transform with perspective for 3D depth
- Filter: brightness/contrast for light zones

SHAPES & FORMS:
- clip-path for custom shapes (polygons, curves, organic forms)
- SVG for precise vector graphics and complex paths
- Border-radius for soft edges, sharp for hard edges
- Transform: rotate, skew, scale for dynamic angles
- CSS shapes for text wrapping around custom forms

MOTION & LIFE:
- @keyframes for sequenced animations
- Cubic-bezier for natural easing (fast-in-slow-out, bouncy, sharp)
- Staggered animations (animation-delay) for choreography
- Transform + opacity (GPU optimized)
- CSS variables + calc() for reactive/parametric motion
- Hover/focus states for interactivity

ADVANCED EFFECTS:
- filter: blur, contrast, saturate, hue-rotate
- mix-blend-mode for color blending (screen, multiply, overlay)
- backdrop-filter for glassmorphism
- SVG filters (noise, turbulence, displacement)
- Canvas for particles, generative art, complex animations
- Gradient animations via background-position

📐 TECHNICAL REQUIREMENTS:

1. TRANSPARENCY HANDLING:
   - Check if user mentions: "transparent", "overlay", "see through", or similar
   - If YES: Set html { background: transparent !important; } body { background: transparent !important; }
   - If NO or UNCLEAR: Decide based on design (decorative = transparent, standalone page = colored)

2. COMPLETE HTML STRUCTURE:
   - Full page: <html>, <head>, <body>, <style>, <script>
   - Include meaningful <title> tag describing what you made
   - All CSS inside <style> tags
   - All JavaScript inside <script> tags
   - NO markdown code fences, NO explanatory text, ONLY runnable code

3. RESPONSIVE & ADAPTIVE:
   - Use relative units: vw, vh, %, em, rem (NOT fixed px for main dimensions)
   - Dynamic sizing: calc(), min(), max(), clamp()
   - Scale proportionally across screen sizes
   - For Canvas: Resize on window events
   - For SVG: Use viewBox with preserveAspectRatio

4. CODE QUALITY:
   - Clean, semantic HTML
   - Organized CSS (group related styles)
   - Efficient JavaScript (no unnecessary loops/operations)
   - Comments only for complex logic
   - No console.logs in production code

**REMEMBER**: 
- If it's a REAL thing (logo, animal, object) → Use real resources (Font Awesome, emoji, CDN images)
- If it's a CUSTOM design/effect → Build from scratch
- Always make it visually stunning and production-ready
- Output ONLY the complete HTML code, no explanations or markdown fences`;

const UPDATE_PROMPT = `You are a code update analyzer. Your job is to understand what changes need to be made to existing HTML/CSS/JS code.

Analyze the user's request and return a JSON object with precise update instructions.

Return format:
{
  "updateType": "style" | "html" | "script" | "multiple",
  "changes": [
    {
      "operation": "update" | "add" | "remove" | "replace",
      "target": "selector or element identifier",
      "section": "style" | "body" | "script",
      "oldValue": "exact code to replace (if applicable)",
      "newValue": "new code (if applicable)",
      "description": "what this change does"
    }
  ],
  "preserveTransparency": true/false,
  "reasoning": "why these changes accomplish the user's request"
}`;

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 429) throw new Error("Rate limit exceeded.");
      if (response.status >= 400 && response.status < 500) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API Error: ${response.status}`);
      }
      lastError = new Error(`API error: ${response.status}`);
    } catch (error) {
      lastError = error as Error;
      if (lastError.message.includes("Rate limit exceeded")) break;
    }
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw lastError || new Error("Max retries exceeded");
}

export async function processCommandWithAgent(
  prompt: string
): Promise<{ name: string; htmlContent: string }> {
  if (!API_KEY) {
    console.error("API Key Missing");
    return {
        name: "AI Error",
        htmlContent: `<div style="background:red;color:white;padding:1rem;border-radius:8px;font-family:system-ui;"><strong>Error:</strong> VITE_GROQ_API_KEY is missing.</div>`
    };
  }

  const systemPrompt = MASTER_PROMPT;

  try {
    const response = await fetchWithRetry(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    const data = await response.json();
    let content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from API");
    }

    // Clean up markdown if present
    if (content.includes("```html")) {
      content = content.split("```html")[1].split("```")[0].trim();
    } else if (content.includes("```")) {
      content = content.split("```")[1].split("```")[0].trim();
    }
    
    // Extract the title to use as the overlay name
    let name = "AI Generated Overlay";
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
        name = titleMatch[1].trim();
    }

    return { name, htmlContent: content };

  } catch (err) {
    const errorMessage = (err as Error).message || "Unknown error";
    console.error("processCommandWithAgent error:", err);
    return {
        name: "AI Error",
        htmlContent: `<div style="background:red;color:white;padding:1rem;border-radius:8px;font-family:system-ui;"><strong>AI Error:</strong> ${errorMessage}</div>`
    };
  }
}

interface UpdateChange {
  operation: 'update' | 'add' | 'remove' | 'replace';
  target: string;
  section: 'style' | 'body' | 'script';
  oldValue?: string;
  newValue?: string;
  description: string;
}

interface UpdateInstructions {
  updateType: 'style' | 'html' | 'script' | 'multiple';
  changes: UpdateChange[];
  preserveTransparency: boolean;
  reasoning: string;
}

export async function analyzeUpdateRequest(
  existingHtml: string,
  updatePrompt: string
): Promise<UpdateInstructions> {
  if (!API_KEY) {
    throw new Error("API Key Missing");
  }

  const systemPrompt = UPDATE_PROMPT;
  const userPrompt = `EXISTING OVERLAY CODE:
${existingHtml}

USER UPDATE REQUEST:
${updatePrompt}

Analyze the existing code and provide JSON update instructions following the specified format.`;

  try {
    const response = await fetchWithRetry(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();
    let content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from API");
    }

    // Clean up markdown if present
    if (content.includes("```json")) {
      content = content.split("```json")[1].split("```")[0].trim();
    } else if (content.includes("```")) {
      content = content.split("```")[1].split("```")[0].trim();
    }

    const instructions: UpdateInstructions = JSON.parse(content);
    return instructions;

  } catch (err) {
    const errorMessage = (err as Error).message || "Unknown error";
    console.error("analyzeUpdateRequest error:", err);
    throw new Error(`Failed to analyze update: ${errorMessage}`);
  }
}

export function applyUpdateInstructions(
  existingHtml: string,
  instructions: UpdateInstructions
): string {
  let updatedHtml = existingHtml;

  for (const change of instructions.changes) {
    try {
      switch (change.operation) {
        case 'update':
        case 'replace':
          if (change.oldValue && change.newValue) {
            // Precise replacement using oldValue as anchor
            if (updatedHtml.includes(change.oldValue)) {
              updatedHtml = updatedHtml.replace(change.oldValue, change.newValue);
            } else {
              // Fallback: try to find and replace by pattern
              updatedHtml = smartReplace(updatedHtml, change);
            }
          }
          break;

        case 'add':
          if (change.newValue) {
            updatedHtml = smartAdd(updatedHtml, change);
          }
          break;

        case 'remove':
          if (change.oldValue) {
            updatedHtml = updatedHtml.replace(change.oldValue, '');
          } else {
            updatedHtml = smartRemove(updatedHtml, change);
          }
          break;
      }
    } catch (err) {
      console.warn(`Failed to apply change: ${change.description}`, err);
    }
  }

  return updatedHtml;
}

function smartReplace(html: string, change: UpdateChange): string {
  const { section, target, newValue } = change;

  if (section === 'style') {
    // Find CSS rule for target selector
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
    const match = html.match(styleRegex);
    
    if (match && newValue) {
      let styles = match[1];
      // Try to find the selector block
      const selectorRegex = new RegExp(`(${escapeRegex(target)}\\s*{[^}]*})`, 'gi');
      
      if (selectorRegex.test(styles)) {
        styles = styles.replace(selectorRegex, newValue);
        html = html.replace(match[0], `<style>${styles}</style>`);
      } else {
        // Selector not found, add it
        styles += `\n${newValue}`;
        html = html.replace(match[0], `<style>${styles}</style>`);
      }
    }
  } else if (section === 'body') {
    // Try to find element by ID, class, or tag
    const patterns = [
      new RegExp(`(<[^>]*id=["']${escapeRegex(target)}["'][^>]*>[\\s\\S]*?<\\/[^>]+>)`, 'i'),
      new RegExp(`(<[^>]*class=["'][^"']*${escapeRegex(target)}[^"']*["'][^>]*>[\\s\\S]*?<\\/[^>]+>)`, 'i'),
      new RegExp(`(<${escapeRegex(target)}[^>]*>[\\s\\S]*?<\\/${escapeRegex(target)}>)`, 'i'),
    ];

    for (const pattern of patterns) {
      if (pattern.test(html) && newValue) {
        html = html.replace(pattern, newValue);
        break;
      }
    }
  } else if (section === 'script') {
    // Find and replace in script section
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/i;
    const match = html.match(scriptRegex);
    
    if (match && newValue) {
      let script = match[1];
      // Try to find variable or function by name
      const targetRegex = new RegExp(`(${escapeRegex(target)}[^;]*;?)`, 'g');
      
      if (targetRegex.test(script)) {
        script = script.replace(targetRegex, newValue);
        html = html.replace(match[0], `<script>${script}</script>`);
      }
    }
  }

  return html;
}

function smartAdd(html: string, change: UpdateChange): string {
  const { section, newValue } = change;

  if (!newValue) return html;

  if (section === 'style') {
    // Add to style section
    html = html.replace(/<\/style>/, `${newValue}\n</style>`);
  } else if (section === 'body') {
    // Add before closing body tag
    html = html.replace(/<\/body>/, `${newValue}\n</body>`);
  } else if (section === 'script') {
    // Add to script section
    html = html.replace(/<\/script>/, `${newValue}\n</script>`);
  }

  return html;
}

function smartRemove(html: string, change: UpdateChange): string {
  const { section, target } = change;

  if (section === 'style') {
    // Remove CSS rule
    const selectorRegex = new RegExp(`${escapeRegex(target)}\\s*{[^}]*}`, 'gi');
    html = html.replace(selectorRegex, '');
  } else if (section === 'body') {
    // Remove element
    const patterns = [
      new RegExp(`<[^>]*id=["']${escapeRegex(target)}["'][^>]*>[\\s\\S]*?<\\/[^>]+>`, 'gi'),
      new RegExp(`<[^>]*class=["'][^"']*${escapeRegex(target)}[^"']*["'][^>]*>[\\s\\S]*?<\\/[^>]+>`, 'gi'),
    ];

    for (const pattern of patterns) {
      html = html.replace(pattern, '');
    }
  } else if (section === 'script') {
    // Remove variable/function
    const targetRegex = new RegExp(`${escapeRegex(target)}[^;]*;?`, 'g');
    html = html.replace(targetRegex, '');
  }

  return html;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function updateOverlay(
  existingHtml: string,
  updatePrompt: string
): Promise<{ name: string; htmlContent: string }> {
  try {
    // Step 1: Analyze what needs to be updated
    const instructions = await analyzeUpdateRequest(existingHtml, updatePrompt);
    
    console.log('Update Instructions:', instructions);

    // Step 2: Apply the updates
    const updatedHtml = applyUpdateInstructions(existingHtml, instructions);

    // Step 3: Extract name from updated HTML
    let name = "Updated Overlay";
    const titleMatch = updatedHtml.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      name = titleMatch[1].trim();
    }

    return { name, htmlContent: updatedHtml };

  } catch (err) {
    const errorMessage = (err as Error).message || "Unknown error";
    console.error("updateOverlay error:", err);
    throw new Error(`Failed to update overlay: ${errorMessage}`);
  }
}