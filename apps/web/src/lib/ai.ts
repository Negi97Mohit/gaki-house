// src/lib/ai.ts - Gemini-powered overlay generation

import { MASTER_PROMPT, UPDATE_PROMPT } from "./ai/prompts";
import { GenerationResult, UpdateAnalysis, UpdateChange } from "@caption-cam/core/types/ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

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
          temperature: 0.8,
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

    if (content.includes("```html")) {
      content = content.split("```html")[1].split("```")[0].trim();
    } else if (content.includes("```")) {
      content = content.split("```")[1].split("```")[0].trim();
    }

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
        body { margin: 0; padding: 2rem; font-family: sans-serif; background: #1a1a1a; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .error-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 12px; max-width: 500px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        h2 { margin-top: 0; }
        code { background: rgba(0,0,0,0.3); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="error-box">
        <h2>⚠️ AI Generation Error</h2>
        <p><strong>Error:</strong> <code>${errorMessage}</code></p>
        <p>Please check your Gemini API key and try again.</p>
    </div>
</body>
</html>`.trim(),
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
        )}["'][^>]*>[\\s\S]*?<\\/[^>]+>`,
        "gi"
      ),
      new RegExp(
        `<[^>]*class=["'][^"']*${escapeRegex(
          change.selector
        )}[^"']*["'][^>]*>[\\s\S]*?<\\/[^>]+>`,
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
