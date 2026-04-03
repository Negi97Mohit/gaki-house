# Routing

→ Back to [Index](../INDEX.md) | [Architecture](./README.md)

> Last Updated: 2026-04-03

---

## Router Selection

The application dynamically selects its router based on the runtime environment:

```typescript
// App.tsx
const Router = isElectron ? HashRouter : BrowserRouter;
```

- **Web:** `BrowserRouter` — uses HTML5 history API (`/platform/browse`)
- **Electron:** `HashRouter` — uses hash routing (`#/platform/browse`) because Electron loads from `file://`

---

## Route Map

All routes are defined in `App.tsx` with lazy-loaded page components.

### Studio Routes

| Path | Component | Description |
|---|---|---|
| `/` | `Index` | Main studio / canvas workspace |
| `/remote-cam` | `RemoteCamera` | Phone-as-camera WebRTC page |

### Platform Routes (nested under `/platform`)

| Path | Component | Description |
|---|---|---|
| `/platform` | `PlatformHome` | Home feed with live streams |
| `/platform/browse` | `PlatformBrowse` | Browse categories |
| `/platform/browse/:category` | `PlatformBrowse` | Browse specific category |
| `/platform/stream/:username` | `PlatformStream` | Watch a stream |
| `/platform/profile/:username` | `PlatformProfile` | User profile page |
| `/platform/following` | `PlatformFollowing` | Following feed |
| `/platform/search` | `PlatformSearch` | Search results |
| `/platform/settings` | `PlatformSettings` | User settings |
| `/platform/clips` | `PlatformClips` | Clips page |
| `/platform/dashboard` | `PlatformDashboard` | Creator dashboard |

All platform routes are wrapped in `PlatformLayout` which provides the shared sidebar navigation.

### Mobile Routes (nested under `/m`)

| Path | Component | Description |
|---|---|---|
| `/m` | `MobileHome` | Mobile home feed |
| `/m/browse` | `MobileBrowse` | Mobile browse |
| `/m/browse/:category` | `MobileBrowse` | Mobile category browse |
| `/m/stream/:username` | `MobileStream` | Mobile stream viewer |
| `/m/studio` | `MobileStudio` | Mobile studio |
| `/m/following` | `MobileFollowing` | Mobile following |
| `/m/clips` | `MobileClips` | Mobile clips |
| `/m/profile/:username` | `MobileProfile` | Mobile profile |
| `/m/search` | `MobileSearch` | Mobile search |
| `/m/settings` | `MobileSettings` | Mobile settings |

All mobile routes are wrapped in `MobileLayout` which provides a bottom-tab navigation.

### Fallback

| Path | Component | Description |
|---|---|---|
| `*` | `NotFound` | 404 page for all unmatched routes |

---

## Provider Hierarchy

```
QueryClientProvider
  └── LogProvider
       └── DebugProvider
            └── StyleSync (caption style syncer)
            └── ThemeInitializer (theme CSS applicator)
            └── Loader (splash screen)
            └── TooltipProvider
                 └── Toaster (shadcn)
                 └── Sonner (sonner)
                 └── Router (BrowserRouter | HashRouter)
                      └── AuthProvider
                           └── Suspense (with Loader fallback)
                                └── Routes
```

→ See [State Management](./state-management.md) for provider details
