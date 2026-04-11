# Features

→ Back to [Index](../../INDEX.md) | [Web App](../README.md)

---

Feature modules live in `src/features/` and follow a **domain-driven** structure:

```
src/features/<feature-name>/
├── hooks/      — Feature-specific React hooks
├── ui/         — Feature-specific UI components
├── lib/        — Feature-specific utilities
├── services/   — Feature-specific API clients
├── data/       — Feature-specific static data
├── api/        — Feature-specific API definitions
└── index.ts    — Barrel export
```

## Feature Index

| Feature | Directory | Status | Document |
|---|---|---|---|
| AI Assistant | `ai-assistant/` | ✅ Active | [AI Engine](./ai-engine.md) |
| Animation | `animation/` | ✅ Active | [Animation System](./animation-system.md) |
| Assets | `assets/` | ✅ Active | [Asset Library](./asset-library.md) |
| Auth | `auth/` | ✅ Active | [Auth](./auth.md) |
| Banners | `banners/` | ✅ Active | Part of animation system |
| Canvas | `canvas/` | ✅ Active | [Canvas System](./canvas-system.md) |
| Caption | `caption/` | ✅ Active | [Caption System](./caption-system.md) |
| Layouts | `layouts/` | ✅ Active | Part of [Scene Management](./scene-management.md) |
| Omegle | `omegle/` | ✅ Active | [Omegle Feature](./omegle-feature.md) |
| Random Chat | `random-chat/` | 🔄 Alternative | Alternative chat implementation |
| Stream | `stream/` | ✅ Active | [Streaming Feature](./streaming-feature.md) |
| Studio | `studio/` | ✅ Active | Part of [Studio Page](../pages/studio-page.md) |
| Theme | `theme/` | ✅ Active | [Theme System](./theme-system.md) |
| Vault | `vault/` | ✅ Active | [Vault](./vault.md) |
