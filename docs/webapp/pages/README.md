# Pages

→ Back to [Index](../../INDEX.md) | [Web App](../README.md)

---

## Route Structure

The application has four page groups:

| Group | Base Path | Layout | Description |
|---|---|---|---|
| **Studio** | `/` | None (full-screen) | Main studio workspace |
| **Platform** | `/platform/*` | `PlatformLayout` (sidebar) | Streaming platform |
| **Mobile** | `/m/*` | `MobileLayout` (bottom tabs) | Mobile-responsive platform |
| **Utility** | `/remote-cam` | None | Phone-as-camera page |

## Pages

| Page | Path | Document |
|---|---|---|
| Studio (Index) | `/` | [Studio Page](./studio-page.md) |
| Platform Home | `/platform` | [Platform Pages](./platform-pages.md) |
| Platform Browse | `/platform/browse` | [Platform Pages](./platform-pages.md) |
| Platform Stream | `/platform/stream/:username` | [Platform Pages](./platform-pages.md) |
| Mobile Home | `/m` | [Mobile Pages](./mobile-pages.md) |
| Remote Camera | `/remote-cam` | Standalone WebRTC camera page |
| 404 | `*` | Simple error page |

→ See [Routing](../../architecture/routing.md) for the complete route map and provider hierarchy
