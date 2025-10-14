// src/lib/ai.ts - Enhanced with update capabilities

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

const MASTER_PROMPT = `You are a versatile live streamer overlay AI. The user will give you an instruction for an overlay.
You MUST produce a FULL HTML page with <html>, <head>, <body>, <style>, and <script> sections.

CRITICAL REQUIREMENTS:
1. TRANSPARENCY RULES (MOST IMPORTANT):
   - If user explicitly says "transparent background" or "transparent": ALWAYS set background: transparent !important; on BOTH html and body. DO NOT override this.
   - NEVER add solid backgrounds, gradients, or colors to html/body when transparency is requested
   - When transparency is requested, ensure elements inside have their own styling but the container is fully transparent
   - If user does NOT mention transparency: You decide based on the design (decorative → transparent, functional → opaque)

2. TRANSPARENCY ENFORCEMENT:
   - Search for these keywords in the prompt: "transparent", "transparent background", "overlay", "see through"
   - If found: Set BOTH elements to transparent: html { background: transparent !important; } body { background: transparent !important; margin: 0; padding: 0; }
   - Do NOT add any background colors or images that would block transparency
   - All visual elements should be positioned absolutely or use flexbox/grid, NOT rely on body background

3. IMPLEMENTATION:
   - Use SVG for vector graphics (flames, particles, shapes)
   - Use Canvas for dynamic pixel animations
   - Use WebGL for 3D effects
   - Use standard HTML/CSS for layouts and text
   - For colored backgrounds: Only use when user doesn't request transparency

4. CODE QUALITY:
   - Return ONLY raw, runnable HTML code
   - Do NOT include markdown fences, explanations, or comments
   - Ensure all CSS is in <style> tags
   - Ensure all JS is in <script> tags
   - Make code production-ready
   - Inside the <head> of the HTML, you MUST include a <title> tag containing a short, descriptive name for the overlay (e.g., "<title>Animated Scoreboard</title>").

5. STYLING & RESPONSIVENESS:
   - Use responsive design with percentage widths and viewport units (vw, vh, %)
   - Set html and body to: width: 100%; height: 100%; overflow: hidden;
   - Use flexbox or CSS Grid for layouts that adapt to container size
   - Use calc(), min(), max() for dynamic sizing
   - Add smooth animations where appropriate
   - Ensure text is readable with proper contrast
   - Use modern CSS features (gradients, shadows, transforms)
   - Elements should use relative sizing (%, vw, vh) NOT fixed pixel sizes
   - Use font-size with clamp() or viewport units for scalable text
   - Ensure all elements scale proportionally when container is resized

6. RESIZE ADAPTATION:
   - Use CSS media queries or viewport units for responsive behavior
   - Use window.addEventListener('resize', ...) in JavaScript if dynamic recalculation is needed
   - Canvas elements should use: context.canvas.width = window.innerWidth; context.canvas.height = window.innerHeight;
   - SVG should use: viewBox and preserveAspectRatio="xMidYMid meet" for scaling
   - All layouts must adapt smoothly when the overlay container is resized

GOLDEN RULE: If user says "transparent background" → html and body backgrounds MUST stay transparent. No exceptions.
RESIZE RULE: Overlays MUST be fully responsive and adapt to any container size without breaking layout.`;

const UPDATE_PROMPT = `You are an expert HTML/CSS/JS code editor AI. The user has an EXISTING overlay and wants to make SPECIFIC changes to it.

YOUR TASK: Analyze the existing code and the user's update request, then provide SURGICAL updates.

CRITICAL UPDATE RULES:
1. PRESERVE EVERYTHING NOT MENTIONED: Only modify what the user explicitly asks to change
2. IDENTIFY THE TARGET: Determine exactly which element(s), style(s), or script(s) need updating
3. MAINTAIN STRUCTURE: Keep the overall HTML structure, class names, IDs, and functionality intact
4. PRECISE CHANGES: Make minimal, targeted modifications

UPDATE ANALYSIS PROCESS:
Step 1: Parse the user's request to identify:
   - What element(s) to target (e.g., "the timer", "background color", "font size")
   - What operation to perform (update, add, remove, replace)
   - What the new value/content should be

Step 2: Locate the target in the existing code:
   - Search for relevant selectors, IDs, classes
   - Identify the code section (HTML, CSS, JavaScript)
   - Find the exact line(s) or block(s) to modify

Step 3: Generate the update instructions in this JSON format:
{
  "updateType": "style|html|script|multiple",
  "changes": [
    {
      "operation": "update|add|remove|replace",
      "target": "CSS selector or code identifier",
      "section": "style|body|script",
      "oldValue": "existing code to find (for precision)",
      "newValue": "new code to replace with",
      "description": "what this change does"
    }
  ],
  "preserveTransparency": true/false,
  "reasoning": "brief explanation of changes"
}

COMMON UPDATE PATTERNS:
- "change the color to X" → update CSS color property
- "make it bigger/smaller" → update font-size, width, height
- "move it to the left/right" → update position or margin
- "add a shadow" → add CSS box-shadow or text-shadow
- "remove the animation" → remove/comment out animation CSS
- "change the text to X" → update innerHTML or textContent
- "make it faster/slower" → update animation-duration or interval timing
- "add a new element X" → insert new HTML element with styling

RESPONSE FORMAT:
You MUST respond with ONLY valid JSON (no markdown, no explanations outside JSON).
The JSON structure above is your ONLY allowed response format.

EXAMPLE USER REQUESTS:
- "change the timer color to red" → update CSS for .timer class color
- "make the font bigger" → increase font-size in relevant selector
- "add a glow effect" → add text-shadow or box-shadow CSS
- "remove the background" → set background to transparent
- "change speed of animation" → update animation-duration value
- "add a new score display" → insert new HTML element with styling`;

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
\`\`\`html
${existingHtml}
\`\`\`

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