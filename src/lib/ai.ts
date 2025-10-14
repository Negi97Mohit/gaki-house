// src/lib/ai.ts

import { GeneratedOverlay } from "@/types/caption";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// --- MODIFIED: Removed the instruction to remember and combine prompts ---
const MASTER_PROMPT = `You are a versatile live streamer overlay AI. The user will give you an instruction for an overlay.
You MUST produce a FULL HTML page with <html>, <head>, <body>, <style>, and <script> sections.

CRITICAL REQUIREMENTS:
- Set body background to transparent: background: transparent !important;
- Set html background to transparent: background: transparent !important;
- Do NOT use white, black, or solid colors as backgrounds unless specifically requested
- Make sure the body has no padding/margin that creates a solid background
- Use SVG for vector graphics, Canvas for dynamic pixel animations, WebGL for 3D, and standard HTML/CSS for layouts and text.

Do NOT include markdown fences, explanations, or comments. Only return the raw, runnable HTML code.`;

// Unchanged retry logic
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

// --- MODIFIED: Removed 'promptHistory' parameter ---
export async function processCommandWithAgent(
  prompt: string
): Promise<string> {
  if (!API_KEY) {
    console.error("API Key Missing");
    return `<div style="background:red;color:white;padding:1rem;border-radius:8px;"><strong>Error:</strong> VITE_GROQ_API_KEY is missing.</div>`;
  }

  // --- MODIFIED: Simplified system prompt assignment ---
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
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from API");
    }

    return content;

  } catch (err) {
    const errorMessage = (err as Error).message || "Unknown error";
    console.error("processCommandWithAgent error:", err);
    return `<div style="background:red;color:white;padding:1rem;border-radius:8px;"><strong>AI Error:</strong> ${errorMessage}</div>`;
  }
}