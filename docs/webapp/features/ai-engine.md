# AI Engine

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

The AI Engine generates complete HTML/CSS/JS overlays from natural language prompts using Google Gemini. Users can type or speak commands like *"create a neon countdown timer"* and get a fully functional interactive overlay rendered live on the canvas.

## Architecture

```
User Input (text or voice)
    │
    ├─ Text: AICommandPopover.tsx → onProcessTranscript
    └─ Voice: useDeepgramSpeech → handleFinalTranscript → onProcessTranscript
           │
           ▼
    lib/ai.ts → processCommandWithAgent(prompt)
           │
           ├── Builds system prompt (MASTER_PROMPT)
           ├── Includes: canvas dimensions, existing overlays context
           │
           ▼
    callGemini(userPrompt, systemPrompt)
           │
           ├── POST to Gemini API
           ├── Parse response: candidates[0].content.parts[0].text
           │
           ▼
    Returns HTML string
           │
           ▼
    Index.tsx → adds GeneratedOverlay to scene
           │
           ▼
    VideoCanvas → DraggableOverlay → HtmlOverlayRenderer
           │
           ▼
    Sandboxed <iframe srcdoc={html}>
```

## Key Source Files

| File | Purpose |
|---|---|
| `src/lib/ai.ts` | Core AI logic: prompts, API calls, response parsing |
| `src/features/ai-assistant/hooks/` | AI-specific hooks |
| `src/features/ai-assistant/ui/` | AICommandPopover and related UI |
| `src/lib/gsapHtmlGenerator.ts` | GSAP-based HTML animation generator |

## System Prompts

### MASTER_PROMPT
Defines the AI agent's capabilities and constraints:
- Target canvas dimensions and coordinate system
- Available HTML/CSS/JS features
- Style guidelines (dark theme, glassmorphism, animations)
- Output format (single HTML string with embedded CSS/JS)
- Forbidden patterns (no external resources, no `document.write`)

### UPDATE_PROMPT
Used when modifying an existing overlay:
- Receives the current HTML as context
- User describes the desired modification
- AI returns the complete updated HTML

## Generation Flow

### New Overlay
1. `processCommandWithAgent(prompt)` calls Gemini with `MASTER_PROMPT`
2. Returns HTML string
3. Creates `GeneratedOverlay` object with unique ID, position, dimensions
4. Added to `scene.activeOverlays[]`

### Update Existing Overlay
1. `updateOverlay(existingHtml, prompt)` calls Gemini with `UPDATE_PROMPT`
2. Returns modified HTML string
3. Replaces the `html` field of the existing `GeneratedOverlay`

### Analysis
1. `analyzeUpdateRequest(prompt)` determines if the user wants to create new or update existing
2. Returns `{ isUpdate: boolean, targetOverlayId?: string }`

## Rendering

AI overlays render in sandboxed iframes via `HtmlOverlayRenderer`:

```tsx
<iframe
  srcdoc={overlay.html}
  sandbox="allow-scripts"
  style={{ border: 'none', width: '100%', height: '100%' }}
/>
```

The iframe is wrapped in a `DraggableOverlay` (using `react-rnd`) for drag, resize, and rotation.

## Security Considerations

- Overlays are sandboxed with `allow-scripts` (no `allow-same-origin`)
- No access to parent window's DOM or JavaScript context
- No external network requests from within the iframe
- **Gap:** No Content Security Policy headers applied

→ See [Integrations](../../architecture/integrations.md) for Gemini API details  
→ See [Draggable Elements](./draggable-elements.md) for overlay rendering
