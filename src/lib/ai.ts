// src/lib/ai.ts

import { GeneratedOverlay } from "@/types/caption";

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
): Promise<string> {
  if (!API_KEY) {
    console.error("API Key Missing");
    return `<div style="background:red;color:white;padding:1rem;border-radius:8px;font-family:system-ui;"><strong>Error:</strong> VITE_GROQ_API_KEY is missing.</div>`;
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

    return content;

  } catch (err) {
    const errorMessage = (err as Error).message || "Unknown error";
    console.error("processCommandWithAgent error:", err);
    return `<div style="background:red;color:white;padding:1rem;border-radius:8px;font-family:system-ui;"><strong>AI Error:</strong> ${errorMessage}</div>`;
  }
}