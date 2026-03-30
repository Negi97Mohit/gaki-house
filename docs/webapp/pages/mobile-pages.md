# Mobile Pages

→ Back to [Index](../../INDEX.md) | [Pages](./README.md)

---

## Overview

The mobile section (`/m/*`) provides **mobile-responsive** versions of the platform pages. All routes are wrapped in `MobileLayout` which provides **bottom tab navigation** optimized for touch devices.

## Pages

| Page | Path | Component |
|---|---|---|
| Home | `/m` | `MobileHomePage` |
| Browse | `/m/browse` | `MobileBrowsePage` |
| Browse Category | `/m/browse/:category` | `MobileBrowsePage` |
| Stream | `/m/stream/:username` | `MobileStreamPage` |
| Studio | `/m/studio` | `MobileStudioPage` |
| Following | `/m/following` | `MobileFollowingPage` |
| Clips | `/m/clips` | `MobileClipsPage` |
| Profile | `/m/profile/:username` | `MobileProfilePage` |
| Search | `/m/search` | `MobileSearchPage` |
| Settings | `/m/settings` | `MobileSettingsPage` |

## Directory Structure

```
src/pages/Mobile/
├── MobileLayout.tsx         — Bottom tab navigation layout
└── pages/                   — Individual mobile pages
    ├── MobileHomePage.tsx
    ├── MobileBrowsePage.tsx
    ├── MobileStreamPage.tsx
    ├── MobileStudioPage.tsx
    ├── MobileFollowingPage.tsx
    ├── MobileClipsPage.tsx
    ├── MobileProfilePage.tsx
    ├── MobileSearchPage.tsx
    └── MobileSettingsPage.tsx
```

## Design Differences from Desktop

- **Bottom tab navigation** instead of sidebar
- **Touch-optimized** interactions (larger tap targets)
- **Simplified layouts** — fewer panels visible simultaneously
- **Mobile Studio** — streamlined version of the studio workspace

→ See [Platform Pages](./platform-pages.md) for the desktop version
