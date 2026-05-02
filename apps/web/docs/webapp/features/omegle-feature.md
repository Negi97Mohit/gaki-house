# Omegle Feature (Random Chat)

→ Back to [Index](../../INDEX.md) | [Features](./README.md)

---

## Overview

The Omegle feature provides **random video chat** matching, similar to Omegle/Chatroulette. Users can connect with random strangers for video conversations, with interest-based matching.

## Feature Module

```
src/features/omegle/
├── api/             — Matching API client
├── data/            — Interest categories, prompts
├── hooks/           — Matching and chat lifecycle hooks
├── services/        — Signaling service for WebRTC
└── ui/              — Chat UI (video display, controls, text chat)
```

## Architecture

```
User clicks "Start Matching"
    │
    ▼
Matching Service → Find available peer
    │
    ▼
WebRTC Signaling → Exchange SDP offers/answers
    │
    ▼
PeerJS connection established
    │
    ├── Local camera stream → Remote peer
    └── Remote camera stream → Local display
    │
    ▼
Chat active (video + optional text)
    │
    ▼
User clicks "Next" or "Stop"
    │
    ▼
Disconnect → Match next or return to lobby
```

## Store

→ Source: [omegle.store.ts](file:///c:/Users/Dell/Desktop/gaki/src/stores/omegle.store.ts)

The `useOmegleStore` manages matching state:
- Connection status
- Current peer info
- Interest filters
- Chat history
- Skip/next controls

## Types

```typescript
// src/types/omegle.ts
interface OmegleState {
  status: 'idle' | 'searching' | 'connected' | 'disconnected';
  interests: string[];
  currentPeer: PeerInfo | null;
  messages: ChatMessage[];
}
```

## Alternative Implementation

`src/features/random-chat/` contains an alternative random chat implementation.
