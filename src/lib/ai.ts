// src/lib/ai.ts - Gemini-powered overlay generation

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

const MASTER_PROMPT = `You are an elite UI/UX designer and frontend developer specializing in stream overlays, video content creation tools, and interactive web components.

🎯 YOUR MISSION:
Transform user requests into production-ready, visually stunning HTML/CSS/JS overlays that work perfectly in OBS, streaming software, and web apps.

🎨 DESIGN PHILOSOPHY:

**Understand Intent, Not Just Words:**
- "modern" = clean lines, ample whitespace, subtle shadows, contemporary colors
- "gaming" = bold colors, sharp angles, neon accents, high contrast
- "minimal" = plenty of breathing room, monochrome or limited palette, simple shapes
- "professional" = muted colors, clear hierarchy, trustworthy fonts, subtle animations
- "fun/playful" = bright colors, bouncy animations, rounded corners, dynamic movement

**Visual Hierarchy:**
- Most important element = largest, highest contrast, most animated
- Supporting elements = smaller, softer, less animated
- Background = texture/pattern that doesn't compete with foreground

**Color Theory:**
- Complementary = high energy (blue/orange, purple/yellow)
- Analogous = harmonious (blue/blue-green/green)
- Monochrome = sophisticated (shades of one color)
- Always consider contrast ratios for readability

**Motion Design:**
- Entrance animations: 0.3-0.5s (quick enough to feel responsive)
- Looping animations: 2-4s (slow enough to not be distracting)
- Exit animations: 0.2-0.3s (faster than entrance)
- Use easing: ease-out for entrances, ease-in for exits, ease-in-out for loops

🛠️ TECHNICAL REQUIREMENTS:

**1. RESOURCE STRATEGY:**

When user asks for REAL things (logos, icons, images):
- **Font Awesome First**: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  - Brands: fa-brands fa-[name] (twitter, youtube, instagram, discord, etc.)
  - Icons: fa-solid fa-[name] (heart, star, bell, etc.)
- **Google Fonts**: <link href="https://fonts.googleapis.com/css2?family=[FontName]&display=swap">
- **Simple Icons CDN**: https://cdn.simpleicons.org/[brandname]
- **Emojis**: Use directly for objects/animals (🔥 ⚡ 🎮 🎵 etc.)
- **ONLY if none work**: Build with CSS/SVG

**2. STRUCTURE:**

Always output COMPLETE, RUNNABLE HTML:
\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Descriptive Name]</title>
    <!-- External resources here -->
    <style>
        /* All CSS here */
    </style>
</head>
<body>
    <!-- All HTML here -->
    <script>
        // All JavaScript here
    </script>
</body>
</html>
\`\`\`

**3. TRANSPARENCY:**

CRITICAL: Detect if user wants transparency:
- Keywords: "transparent", "overlay", "see-through", "OBS", "streaming"
- If YES or UNCLEAR (streaming context): 
  \`\`\`css
  html, body {
      background: transparent !important;
  }
  \`\`\`
- If NO (standalone page): Use appropriate background

**4. RESPONSIVE:**

- Use relative units: vw, vh, %, em, rem
- Scale text: clamp(minSize, preferredSize, maxSize)
- Media queries for breakpoints: 768px (tablet), 1024px (desktop)
- Test at multiple sizes mentally

**5. PERFORMANCE:**

- Animate transform and opacity (GPU accelerated)
- Avoid animating: width, height, top, left (causes reflow)
- Use CSS animations over JavaScript when possible
- Debounce resize/scroll events if needed

📦 COMMON OVERLAY TYPES & BEST PRACTICES:

**Countdown Timer:**
- Large, legible numbers (minimum 48px)
- High contrast against background
- Optional: flip animation between numbers
- Include milliseconds only if user requests

**Alert/Notification:**
- Slide in from side (translateX) or top (translateY)
- Stay for 3-5 seconds
- Slide out or fade out
- Include icon/image area + text area
- Sound indicator (visual) optional

**Chat Box:**
- Messages stack vertically
- Auto-scroll to bottom
- Fade in new messages
- Optional: fade out old messages after time
- Avatar + username + message layout

**Subscriber/Follower Button:**
- Clear call-to-action text
- Hover state (scale 1.05 + glow)
- Click animation (scale 0.95 briefly)
- High contrast colors
- Optional: particle effects on hover

**Donation/Goal Tracker:**
- Progress bar (clear empty vs filled state)
- Current amount vs goal clearly labeled
- Animate progress changes smoothly
- Optional: milestone markers

**Social Media Links:**
- Icon + label or icon only
- Hover grows/glows
- Arranged horizontally or vertically
- Consistent spacing (gap: 1rem)

🔧 CODE QUALITY:

- Clean, semantic HTML (use proper tags: header, main, section, etc.)
- Organized CSS (group by component, then by property type)
- Commented JavaScript (only for complex logic)
- No console.logs
- No external dependencies unless necessary (prefer vanilla JS)

🚫 NEVER:

- Use placeholder text like "Lorem ipsum" (use context-appropriate text)
- Create broken/incomplete code
- Use deprecated HTML/CSS
- Forget viewport meta tag
- Ignore accessibility (add aria-labels, alt text)

✅ ALWAYS:

- Make it visually impressive
- Ensure it works immediately (no setup required)
- Match the vibe of the request
- Add subtle, tasteful animations
- Consider the use case (streaming overlay vs standalone page)

OUTPUT: Only the complete HTML code. No explanations before or after. No markdown code fences (the system will handle formatting).`;

const UPDATE_PROMPT = `You are a code modification expert. Analyze existing HTML/CSS/JS and user's update request.

Return ONLY a JSON object (no markdown, no code fences):

{
  "approach": "precise" | "regenerate",
  "changes": [
    {
      "type": "css" | "html" | "js",
      "operation": "update" | "add" | "remove",
      "selector": "specific selector or element id",
      "property": "CSS property or attribute name",
      "oldValue": "current value (if updating)",
      "newValue": "new value",
      "reason": "why this change is needed"
    }
  ],
  "summary": "brief description of what changed"
}

Use "precise" approach for small changes (color, size, text, single element).
Use "regenerate" approach for structural changes (layout, multiple elements, complete redesign).

Be specific with selectors. Use IDs when available, classes second, element tags last.`;

interface GenerationResult {
  name: string;
  htmlContent: string;
}

interface UpdateChange {
  type: 'css' | 'html' | 'js';
  operation: 'update' | 'add' | 'remove';
  selector: string;
  property?: string;
  oldValue?: string;
  newValue?: string;
  reason: string;
}

interface UpdateAnalysis {
  approach: 'precise' | 'regenerate';
  changes: UpdateChange[];
  summary: string;
}

async function callGemini(prompt: string, systemPrompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is missing. Add it to your .env file.");
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
            parts: [
              { text: systemPrompt },
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
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

export async function processCommandWithAgent(prompt: string): Promise<GenerationResult> {
  try {
    let content = await callGemini(prompt, MASTER_PROMPT);

    // Clean up markdown if present (shouldn't be, but just in case)
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
      `.trim()
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

USER REQUEST:
${updatePrompt}

Analyze and return update instructions as JSON.`;

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
      if (change.type === 'css') {
        updatedHtml = applyCSSChange(updatedHtml, change);
      } else if (change.type === 'html') {
        updatedHtml = applyHTMLChange(updatedHtml, change);
      } else if (change.type === 'js') {
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

  if (change.operation === 'update' && change.property && change.newValue) {
    // Update specific property in selector
    const selectorRegex = new RegExp(
      `(${escapeRegex(change.selector)}\\s*{[^}]*?)(${escapeRegex(change.property)}\\s*:[^;]+;)`,
      'i'
    );
    
    if (selectorRegex.test(styles)) {
      styles = styles.replace(
        selectorRegex,
        `$1${change.property}: ${change.newValue};`
      );
    } else {
      // Property doesn't exist, add it to the selector
      const addPropertyRegex = new RegExp(
        `(${escapeRegex(change.selector)}\\s*{[^}]*)(})`,
        'i'
      );
      styles = styles.replace(
        addPropertyRegex,
        `$1  ${change.property}: ${change.newValue};\n$2`
      );
    }
  } else if (change.operation === 'add' && change.newValue) {
    // Add new CSS rule
    styles += `\n${change.newValue}`;
  } else if (change.operation === 'remove') {
    // Remove selector or property
    if (change.property) {
      const propRegex = new RegExp(
        `${escapeRegex(change.property)}\\s*:[^;]+;`,
        'gi'
      );
      styles = styles.replace(propRegex, '');
    } else {
      const selectorRegex = new RegExp(
        `${escapeRegex(change.selector)}\\s*{[^}]*}`,
        'gi'
      );
      styles = styles.replace(selectorRegex, '');
    }
  }

  return html.replace(match[0], `<style>${styles}</style>`);
}

function applyHTMLChange(html: string, change: UpdateChange): string {
  if (change.operation === 'update' && change.oldValue && change.newValue) {
    return html.replace(change.oldValue, change.newValue);
  } else if (change.operation === 'add' && change.newValue) {
    // Add before closing body tag
    return html.replace(/<\/body>/, `${change.newValue}\n</body>`);
  } else if (change.operation === 'remove' && change.selector) {
    // Remove element by selector
    const patterns = [
      new RegExp(`<[^>]*id=["']${escapeRegex(change.selector)}["'][^>]*>[\\s\\S]*?<\\/[^>]+>`, 'gi'),
      new RegExp(`<[^>]*class=["'][^"']*${escapeRegex(change.selector)}[^"']*["'][^>]*>[\\s\\S]*?<\\/[^>]+>`, 'gi'),
    ];
    
    for (const pattern of patterns) {
      html = html.replace(pattern, '');
    }
  }
  
  return html;
}

function applyJSChange(html: string, change: UpdateChange): string {
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/i;
  const match = html.match(scriptRegex);
  
  if (!match) return html;
  
  let script = match[1];

  if (change.operation === 'update' && change.oldValue && change.newValue) {
    script = script.replace(change.oldValue, change.newValue);
  } else if (change.operation === 'add' && change.newValue) {
    script += `\n${change.newValue}`;
  } else if (change.operation === 'remove' && change.oldValue) {
    script = script.replace(change.oldValue, '');
  }

  return html.replace(match[0], `<script>${script}</script>`);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function updateOverlay(
  existingHtml: string,
  updatePrompt: string
): Promise<GenerationResult> {
  try {
    const analysis = await analyzeUpdateRequest(existingHtml, updatePrompt);
    
    console.log('Update Analysis:', analysis);

    let updatedHtml: string;

    if (analysis.approach === 'regenerate') {
      // For major changes, regenerate from scratch with context
      const regeneratePrompt = `Based on this existing overlay:

${existingHtml}

User wants to: ${updatePrompt}

Create an updated version that incorporates the user's request while maintaining the good parts of the existing design.`;
      
      const result = await processCommandWithAgent(regeneratePrompt);
      updatedHtml = result.htmlContent;
    } else {
      // For small changes, apply precise updates
      updatedHtml = applyUpdateInstructions(existingHtml, analysis);
    }

    // Extract name
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