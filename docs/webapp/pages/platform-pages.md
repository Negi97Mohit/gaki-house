# Platform Pages

→ Back to [Index](../../INDEX.md) | [Pages](./README.md)

---

## Overview

The platform section (`/platform/*`) is a **Twitch/Kick-like streaming platform** UI. It provides a social streaming experience with browse, search, profiles, following, and live viewing.

All platform pages are wrapped in `PlatformLayout` which provides a persistent **sidebar navigation** with links to Home, Browse, Following, Clips, and user-specific sections.

→ Source: [PlatformLayout.tsx](file:///c:/Users/Dell/Desktop/caption-cam/src/pages/platform/PlatformLayout.tsx)

## Pages

| Page | Path | Component | Description |
|---|---|---|---|
| Home | `/platform` | `HomePage` | Feed of live and recommended streams |
| Browse | `/platform/browse` | `BrowsePage` | Browse by category |
| Browse Category | `/platform/browse/:category` | `BrowsePage` | Filtered category view |
| Stream | `/platform/stream/:username` | `StreamPage` | Watch a live stream |
| Profile | `/platform/profile/:username` | `ProfilePage` | User profile with VODs |
| Following | `/platform/following` | `FollowingPage` | Streams from followed users |
| Search | `/platform/search` | `SearchPage` | Search results |
| Settings | `/platform/settings` | `SettingsPage` | User settings |
| Clips | `/platform/clips` | `ClipsPage` | Clip browser |
| Dashboard | `/platform/dashboard` | `DashboardPage` | Creator dashboard |

## Directory Structure

```
src/pages/platform/
├── PlatformLayout.tsx       — Shared layout with sidebar
├── pages/                   — Individual page components
│   ├── HomePage.tsx
│   ├── BrowsePage.tsx
│   ├── StreamPage.tsx
│   ├── ProfilePage.tsx
│   ├── FollowingPage.tsx
│   ├── SearchPage.tsx
│   ├── SettingsPage.tsx
│   ├── ClipsPage.tsx
│   └── DashboardPage.tsx
├── components/              — Shared platform UI components
│   ├── (StreamCard, CategoryCard, etc.)
├── context/
│   └── AuthContext.tsx      — Platform auth state
├── hooks/                   — Platform-specific hooks
├── services/                — API service clients
└── data/                    — Mock/seed data
```

## Data Sources

The platform fetches live stream data from multiple sources (bypassing CORS):
- **YouTube** — InnerTube API (via Netlify function / Vite dev plugin)
- **Kick** — Kick API (via Vite proxy / Electron hidden BrowserWindow)
- **DLive** — GraphQL API (via Vite proxy)

→ See [Integrations](../../architecture/integrations.md)

## Auth Integration

The platform uses `AuthContext` for user authentication state:
- Firebase Auth (Google Sign-In)
- Electron uses custom OAuth flow

→ See [Auth](../features/auth.md)
