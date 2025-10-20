// src/lib/ai.ts - Gemini-powered overlay generation

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

const MASTER_PROMPT = `You are an expert UI/UX designer and frontend developer specializing in creating beautiful, functional web overlays and interactive components.

🧠 CORE PRINCIPLE: INTELLIGENT INTERPRETATION

Your job is to understand what the user MEANS, not just what they say. Think critically about:
- What is the user trying to achieve?
- What would make this visually compelling?
- What's the intended use case?
- What elements would complete this design naturally?

However, always stay true to the user's PRIMARY request. If they ask for "neon lines", the main element must be neon lines - but you can make intelligent decisions about layout, animation style, quantity, arrangement, etc.

🎯 REQUEST ANALYSIS FRAMEWORK

**1. Identify the Core Request:**
- What is the PRIMARY element? (border, button, timer, animation, layout, etc.)
- What is the PRIMARY purpose? (aesthetic, functional, informational, etc.)

**2. Understand the Context:**
- Style keywords: "modern", "gaming", "minimal", "retro", "professional", "fun"
- Technical context: "overlay", "streaming", "website", "dashboard"
- Behavioral keywords: "animated", "interactive", "static", "responsive"

**3. Make Smart Decisions:**
- If user says "social media buttons" but doesn't specify which platforms → choose popular ones (Twitter, YouTube, Instagram, Discord)
- If user says "border" without color → choose a color that fits the implied style
- If user says "timer" without format → choose appropriate format (countdown, stopwatch, clock)
- If user asks for "lines" → decide on quantity, arrangement, and style based on context

**4. Add Thoughtful Enhancements:**
- Animations should feel natural and purposeful
- Colors should be harmonious
- Spacing should be balanced
- Typography should be readable

🎨 INTELLIGENT DESIGN PATTERNS

**Style Interpretation:**
- "modern" → Clean, sans-serif fonts, subtle shadows, smooth animations, contemporary color palettes (blues, purples, teals)
- "gaming" → Bold, angular designs, high contrast, neon accents, energetic animations, RGB color schemes
- "minimal" → Maximum whitespace, limited color palette (1-2 colors), simple shapes, subtle or no animations
- "professional" → Conservative colors (navy, gray, white), clear hierarchy, trustworthy fonts (like sans-serif), gentle animations
- "retro" → Vintage colors, pixel fonts or serif fonts, nostalgic elements, CRT effects
- "cyberpunk" → Neon colors, glitch effects, angular shapes, tech-inspired elements
- "elegant" → Serif fonts, gold/silver accents, smooth transitions, sophisticated color palette

**Element Interpretation:**
- "border" → Could mean: decorative frame, outline around content, separating lines, or edge decoration. Choose based on context.
- "lines" → Could mean: horizontal separators, connecting elements, decorative patterns, or data visualization. Infer from context.
- "buttons" → Should be clickable-looking with hover states and appropriate call-to-action text
- "timer/countdown" → Infer format from context (event countdown, stopwatch, clock, etc.)
- "background" → Consider transparency needs, complementary patterns, gradients, or solid colors

**Animation Intelligence:**
- "pulsating" → Rhythmic scale or opacity changes
- "glowing" → Box-shadow or text-shadow animation
- "smooth" → Ease-in-out transitions
- "energetic" → Bouncy, quick animations
- "subtle" → Slow, gentle effects
- Default: Add tasteful, non-distracting animations that enhance the design

🛠️ TECHNICAL EXCELLENCE

**Complete HTML Structure:**
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Descriptive, Context-Appropriate Title]</title>
    <!-- External resources when needed -->
    <style>
        /* Organized, clean CSS */
    </style>
</head>
<body>
    <!-- Semantic, accessible HTML -->
    <script>
        // Clean JavaScript when needed
    </script>
</body>
</html>
\`\`\`

**Smart Resource Usage:**
- Font Awesome for icons: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
  - Use when icons/logos are needed: <i class="fa-brands fa-twitter"></i>
- Google Fonts for typography: https://fonts.googleapis.com/css2?family=FontName&display=swap
  - Choose fonts that match the style (Roboto=modern, Orbitron=gaming, Playfair=elegant)
- Simple Icons CDN: https://cdn.simpleicons.org/[brand]
  - For brand logos as images
- Emojis for quick visual elements: 🔥 ⚡ 🎮 ⭐ 💎

**Transparency Intelligence:**
Automatically use transparent backgrounds when context suggests overlay usage:
- Keywords: "overlay", "OBS", "streaming", "transparent", "video"
- Default for streaming/broadcast contexts
\`\`\`css
html, body {
    background: transparent;
}
\`\`\`

Otherwise, choose appropriate background (gradients, solids, patterns) that enhance the design.

**Responsive & Performance:**
- Use relative units (vw, vh, %, rem) for scalability
- Animate only transform and opacity (GPU-accelerated)
- Use CSS animations over JavaScript when possible
- Include mobile-friendly breakpoints when appropriate

🎯 COMMON USE CASES & SMART DEFAULTS

**Timer/Countdown:**
- Large, highly legible numbers
- Choose format based on context (countdown to event, elapsed time, current time)
- Add labels if purpose isn't obvious
- Include smooth number transitions

**Alerts/Notifications:**
- Clear hierarchy (icon → title → message)
- Slide-in animation (from relevant side)
- Auto-dismiss or close button based on type
- Choose alert style based on context (success, warning, info, error)

**Social Media Elements:**
- If platforms not specified → popular ones (YouTube, Twitter, Instagram, TikTok, Discord)
- Icon + label or icon-only based on space
- Hover effects (scale, glow, color change)
- Consider the audience (gaming = Discord/Twitch, professional = LinkedIn)

**Decorative Elements:**
- "Lines" → create visually interesting pattern or separation
- "Border" → frame the important content
- "Particles" → subtle background animation
- Choose quantity and arrangement that looks balanced

**Interactive Elements:**
- Buttons should have clear hover/active states
- Forms should have proper focus states
- Interactive elements should give visual feedback
- Add cursor: pointer where appropriate

🎨 COLOR INTELLIGENCE

Choose colors that work well together:
- Complementary: High energy, maximum contrast
- Analogous: Harmonious, cohesive feel
- Triadic: Balanced, vibrant
- Monochrome: Sophisticated, minimal

Default palettes by style:
- Modern: #3B82F6 (blue), #8B5CF6 (purple), #06B6D4 (cyan)
- Gaming: #FF006E (magenta), #00F5FF (cyan), #39FF14 (neon green)
- Professional: #1E40AF (navy), #64748B (slate), #FFFFFF (white)
- Minimal: #000000, #FFFFFF, one accent color
- Elegant: #1F2937 (charcoal), #D4AF37 (gold), #F9FAFB (off-white)

💡 CREATIVE PROBLEM-SOLVING

When requests are ambiguous or incomplete:
1. Infer the most likely intent from context
2. Make design decisions that enhance the user's vision
3. Add complementary elements that complete the design
4. Ensure visual balance and harmony
5. Prioritize usability and aesthetics

Examples:
- "make a button" → What style? Look for context clues. Default to modern, clean design.
- "add social icons" → Which platforms? Consider the apparent use case (streaming vs business).
- "create border" → What thickness, color, style? Match the overall aesthetic.
- "pulsating effect" → On what element? Apply to the most prominent element.

🚫 ANTI-PATTERNS TO AVOID

- Don't be random or arbitrary - every decision should have reasoning
- Don't ignore the core request - always build what was asked for first
- Don't over-complicate - sometimes simple is better
- Don't use placeholder content - make it realistic and contextual
- Don't forget accessibility - proper contrast, semantic HTML, ARIA labels

✅ SUCCESS CRITERIA

Before outputting, verify:
□ Does this fulfill the user's PRIMARY request?
□ Are design decisions intentional and justified?
□ Is the code complete, clean, and functional?
□ Does it look visually appealing?
□ Would this work well in its intended context?
□ Is it production-ready?

🎯 OUTPUT FORMAT

Return ONLY the complete HTML code. No explanations, no markdown fences, just pure HTML that's ready to run.`;

const UPDATE_PROMPT = `You are an expert at understanding code modification requests and determining the best approach.

Analyze the existing code and the user's request. Think critically:
- Is this a small tweak (change color, adjust size, modify text)?
- Is this adding something new to existing design?
- Is this a major redesign or structural change?

Return ONLY a JSON object:

{
  "approach": "precise" | "regenerate",
  "reasoning": "explain WHY you chose this approach",
  "changes": [
    {
      "type": "css" | "html" | "js",
      "operation": "update" | "add" | "remove",
      "selector": "specific selector",
      "property": "property name if applicable",
      "oldValue": "current value if updating",
      "newValue": "new value",
      "reason": "what this accomplishes"
    }
  ],
  "summary": "user-friendly description of changes"
}

**Approach Guidelines:**
- "precise": Small changes affecting 1-3 elements (colors, sizes, text, single element additions)
- "regenerate": Major changes (multiple elements, layout changes, style overhauls, adding complex features)

Be intelligent about selectors - use the most specific one that makes sense.`;

interface GenerationResult {
  name: string;
  htmlContent: string;
}

interface UpdateChange {
  type: "css" | "html" | "js";
  operation: "update" | "add" | "remove";
  selector: string;
  property?: string;
  oldValue?: string;
  newValue?: string;
  reason: string;
}

interface UpdateAnalysis {
  approach: "precise" | "regenerate";
  reasoning?: string;
  changes: UpdateChange[];
  summary: string;
}

async function callGemini(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      "VITE_GEMINI_API_KEY is missing. Add it to your .env file."
    );
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }, { text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.8, // Slightly higher for more creativity
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `API Error: ${response.status}`
      );
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("Empty response from Gemini API");
    }

    return content;
  } catch (err) {
    console.error("Gemini API Error:", err);
    throw err;
  }
}

export async function processCommandWithAgent(
  prompt: string
): Promise<GenerationResult> {
  try {
    let content = await callGemini(prompt, MASTER_PROMPT);

    // Clean up markdown if present
    if (content.includes("```html")) {
      content = content.split("```html")[1].split("```")[0].trim();
    } else if (content.includes("```")) {
      content = content.split("```")[1].split("```")[0].trim();
    }

    // Extract title for overlay name
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
      htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Error</title>
    <style>
        body {
            margin: 0;
            padding: 2rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #1a1a1a;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .error-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 2rem;
            border-radius: 12px;
            max-width: 500px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        h2 { margin-top: 0; }
        code {
            background: rgba(0,0,0,0.3);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="error-box">
        <h2>⚠️ AI Generation Error</h2>
        <p><strong>Error:</strong> <code>${errorMessage}</code></p>
        <p>Please check your Gemini API key and try again.</p>
    </div>
</body>
</html>
      `.trim(),
    };
  }
}

export async function analyzeUpdateRequest(
  existingHtml: string,
  updatePrompt: string
): Promise<UpdateAnalysis> {
  try {
    const prompt = `EXISTING CODE:
${existingHtml}

USER'S REQUEST:
${updatePrompt}

Think about what the user wants to change and determine the best approach.`;

    let content = await callGemini(prompt, UPDATE_PROMPT);

    // Clean up markdown
    if (content.includes("```json")) {
      content = content.split("```json")[1].split("```")[0].trim();
    } else if (content.includes("```")) {
      content = content.split("```")[1].split("```")[0].trim();
    }

    const analysis: UpdateAnalysis = JSON.parse(content);
    return analysis;
  } catch (err) {
    console.error("analyzeUpdateRequest error:", err);
    throw new Error(`Failed to analyze update: ${(err as Error).message}`);
  }
}

export function applyUpdateInstructions(
  existingHtml: string,
  analysis: UpdateAnalysis
): string {
  let updatedHtml = existingHtml;

  for (const change of analysis.changes) {
    try {
      if (change.type === "css") {
        updatedHtml = applyCSSChange(updatedHtml, change);
      } else if (change.type === "html") {
        updatedHtml = applyHTMLChange(updatedHtml, change);
      } else if (change.type === "js") {
        updatedHtml = applyJSChange(updatedHtml, change);
      }
    } catch (err) {
      console.warn(`Failed to apply change: ${change.reason}`, err);
    }
  }

  return updatedHtml;
}

function applyCSSChange(html: string, change: UpdateChange): string {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
  const match = html.match(styleRegex);

  if (!match) return html;

  let styles = match[1];

  if (change.operation === "update" && change.property && change.newValue) {
    const selectorRegex = new RegExp(
      `(${escapeRegex(change.selector)}\\s*{[^}]*?)(${escapeRegex(
        change.property
      )}\\s*:[^;]+;)`,
      "i"
    );

    if (selectorRegex.test(styles)) {
      styles = styles.replace(
        selectorRegex,
        `$1${change.property}: ${change.newValue};`
      );
    } else {
      const addPropertyRegex = new RegExp(
        `(${escapeRegex(change.selector)}\\s*{[^}]*)(})`,
        "i"
      );
      styles = styles.replace(
        addPropertyRegex,
        `$1  ${change.property}: ${change.newValue};\n$2`
      );
    }
  } else if (change.operation === "add" && change.newValue) {
    styles += `\n${change.newValue}`;
  } else if (change.operation === "remove") {
    if (change.property) {
      const propRegex = new RegExp(
        `${escapeRegex(change.property)}\\s*:[^;]+;`,
        "gi"
      );
      styles = styles.replace(propRegex, "");
    } else {
      const selectorRegex = new RegExp(
        `${escapeRegex(change.selector)}\\s*{[^}]*}`,
        "gi"
      );
      styles = styles.replace(selectorRegex, "");
    }
  }

  return html.replace(match[0], `<style>${styles}</style>`);
}

function applyHTMLChange(html: string, change: UpdateChange): string {
  if (change.operation === "update" && change.oldValue && change.newValue) {
    return html.replace(change.oldValue, change.newValue);
  } else if (change.operation === "add" && change.newValue) {
    return html.replace(/<\/body>/, `${change.newValue}\n</body>`);
  } else if (change.operation === "remove" && change.selector) {
    const patterns = [
      new RegExp(
        `<[^>]*id=["']${escapeRegex(
          change.selector
        )}["'][^>]*>[\\s\\S]*?<\\/[^>]+>`,
        "gi"
      ),
      new RegExp(
        `<[^>]*class=["'][^"']*${escapeRegex(
          change.selector
        )}[^"']*["'][^>]*>[\\s\\S]*?<\\/[^>]+>`,
        "gi"
      ),
    ];

    for (const pattern of patterns) {
      html = html.replace(pattern, "");
    }
  }

  return html;
}

function applyJSChange(html: string, change: UpdateChange): string {
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/i;
  const match = html.match(scriptRegex);

  if (!match) return html;

  let script = match[1];

  if (change.operation === "update" && change.oldValue && change.newValue) {
    script = script.replace(change.oldValue, change.newValue);
  } else if (change.operation === "add" && change.newValue) {
    script += `\n${change.newValue}`;
  } else if (change.operation === "remove" && change.oldValue) {
    script = script.replace(change.oldValue, "");
  }

  return html.replace(match[0], `<script>${script}</script>`);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function updateOverlay(
  existingHtml: string,
  updatePrompt: string
): Promise<GenerationResult> {
  try {
    const analysis = await analyzeUpdateRequest(existingHtml, updatePrompt);

    console.log("Update Analysis:", analysis);

    let updatedHtml: string;

    if (analysis.approach === "regenerate") {
      const regeneratePrompt = `You're updating an existing design. The user wants to modify it, NOT start from scratch.

EXISTING DESIGN:
${existingHtml}

USER WANTS TO: ${updatePrompt}

IMPORTANT:
- Keep the existing structure and elements unless the user explicitly wants them changed/removed
- Only modify what the user requested
- Maintain the overall design aesthetic
- Think about what makes sense to keep vs. change

Create the updated version that intelligently incorporates their request.`;

      const result = await processCommandWithAgent(regeneratePrompt);
      updatedHtml = result.htmlContent;
    } else {
      updatedHtml = applyUpdateInstructions(existingHtml, analysis);
    }

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
