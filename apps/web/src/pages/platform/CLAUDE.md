# Platform Page (`/platform`) — CLAUDE.md

## 🗺️ What This Is
The GAKI Platform page at `https://gaki.netlify.app/platform` — the public-facing discovery surface where viewers browse live streamers. Currently shows live streams aggregated from external platforms (YouTube, Twitch, Kick, etc.). **Being revamped** to instead show GAKI platform streamers and which external platforms they are simultaneously broadcasting to using GAKI's multi-platform streaming.

## 🔴🔴🔴 HARD RULE: ZERO MOCK DATA 🔴🔴🔴
**No mock data anywhere in this app.** All data must come from real backend sources (Supabase, Firebase). If no data exists, show proper empty states — never fake it. The file `data/mockData.ts` will be gutted to keep only type definitions and `PLATFORM_META` constants. All `MOCK_CHANNELS`, `MOCK_CATEGORIES`, and `FEATURED_STREAM` exports will be removed. Every consumer must be updated to handle empty arrays gracefully.

## 📁 Directory Map
```
apps/web/src/pages/platform/
├── PlatformLayout.tsx          — Shell layout: TopNav + Sidebar + Outlet
├── components/
│   ├── AuthModal.tsx           — Login/register modal (Firebase Auth)
│   ├── CategoryCard.tsx        — Category thumbnail card
│   ├── ChatBadge.tsx           — Chat badge renderer
│   ├── DefaultAvatar.tsx       — Fallback avatar component
│   ├── EmotePicker.tsx         — Chat emote picker
│   ├── ImageWithFallback.tsx   — Image with error fallback
│   ├── LiveStreamCarousel.tsx  — Hero carousel of featured streams (→ refactor for GAKI streamers)
│   ├── PipMiniPlayer.tsx       — Picture-in-Picture mini player
│   ├── PlatformMobileNav.tsx   — Mobile bottom navigation
│   ├── PlatformSidebar.tsx     — Desktop sidebar (followed channels)
│   ├── PlatformTopNav.tsx      — Top navigation bar
│   ├── SkeletonStreamCard.tsx  — Loading skeleton for stream cards
│   ├── StreamCard.tsx          — Stream preview card
│   ├── StreamCardHover.tsx     — Hover-enhanced stream card wrapper
│   ├── StreamChatEmbed.tsx     — Embedded platform chat
│   ├── StreamComments.tsx      — Stream comment section
│   ├── StreamPlayer.tsx        — Video player (iframe/embed)
│   └── UserMenu.tsx            — User dropdown menu
├── context/
│   ├── AuthContext.tsx          — Firebase auth context provider
│   └── PipContext.tsx           — PiP state context
├── data/
│   └── mockData.ts             — ⚠️ TO PURGE: Keep ONLY types + PLATFORM_META. Remove all mock arrays.
├── hooks/
│   ├── useStreams.ts            — React Query hooks (→ refactor to remove mock fallback)
│   └── useGakiStreams.ts        — NEW: React Query hook for GAKI-native streams from Supabase
├── pages/
│   ├── BrowsePage.tsx          — Browse categories/streams
│   ├── ClipsPage.tsx           — Clips page
│   ├── DashboardPage.tsx       — Streamer dashboard
│   ├── FollowingPage.tsx       — Following feed
│   ├── HomePage.tsx            — Main landing page (→ revamp for GAKI-first)
│   ├── ProfilePage.tsx         — User profile page
│   ├── SearchPage.tsx          — Search results
│   ├── SettingsPage.tsx        — User settings
│   └── StreamPage.tsx          — Individual stream viewer
└── services/
    ├── gakiStreamService.ts    — NEW: Fetches live GAKI streamers from Supabase
    ├── streamService.ts        — Aggregator (→ refactor: GAKI primary, external secondary)
    ├── dliveService.ts         — DLive API client (keep for enrichment)
    ├── kickService.ts          — Kick API client (keep for enrichment)
    ├── rumbleService.ts        — Rumble scraper (keep for enrichment)
    ├── trovoService.ts         — Trovo API client (keep for enrichment)
    ├── twitchService.ts        — Twitch API client (keep for enrichment)
    └── youtubeService.ts       — YouTube Data API client (keep for enrichment)
```

## 🔴 Current Status: REVAMP PLANNED

### What exists now (OLD model — being replaced)
The platform page currently aggregates live streams **from** external platforms:
- Fetches live streams from YouTube, Twitch, Kick, DLive, Trovo, Rumble APIs
- Falls back to hardcoded `MOCK_CHANNELS` when APIs return nothing
- Displays them in a grid with platform badges
- Users can watch embedded streams from those external platforms
- **Problem**: Makes GAKI look like a stream aggregator, not its own platform
- **Problem**: Relies on mock/fake data — violates production standards

### What we're building (NEW model — GAKI-first)
The platform page will show **GAKI streamers** and where they're simultaneously broadcasting:
- Shows streamers who are **live on GAKI** as the primary experience
- Each streamer card shows which other platforms they're also streaming to (via GAKI's multi-platform output)
- The value prop becomes: "See who's live on GAKI and discover their multi-platform reach"
- External platform badges become **secondary indicators**, not the primary content source
- When nobody is live → show a clean empty state, never fake data

## 🏗️ Revamp Plan

### Phase 0: Purge Mock Data (Prerequisite)
**Status: ⚫ TODO**

Remove all mock data from the entire app. This is the first step before any other work.

| Task | Files Affected |
|---|---|
| Remove `MOCK_CHANNELS`, `MOCK_CATEGORIES`, `FEATURED_STREAM` from `mockData.ts` | `data/mockData.ts` |
| Keep `PlatformType`, `StreamChannel`, `Category`, `PlatformMeta`, `PLATFORM_META`, `PLATFORM_CATEGORY_LABELS`, `formatViewerCount` | `data/mockData.ts` |
| Remove `placeholderData: MOCK_CHANNELS` from `useStreams.ts` | `hooks/useStreams.ts` |
| Remove `MOCK_CHANNELS` fallback from `streamService.ts` | `services/streamService.ts` |
| Update all consumers to handle empty arrays (no crashes on `[]`) | All pages + components importing mock data |
| Audit Mobile pages for mock data imports and remove those too | `pages/Mobile/**/*.tsx` |
| Add proper empty states where data was previously faked | All affected pages |

**Files that import mock data (all need updating):**
- `pages/platform/pages/HomePage.tsx` — uses `MOCK_CATEGORIES`
- `pages/platform/pages/BrowsePage.tsx`
- `pages/platform/pages/StreamPage.tsx`
- `pages/platform/pages/DashboardPage.tsx`
- `pages/platform/pages/ProfilePage.tsx`
- `pages/platform/pages/SearchPage.tsx`
- `pages/platform/pages/ClipsPage.tsx`
- `pages/platform/components/LiveStreamCarousel.tsx`
- `pages/platform/components/StreamCardHover.tsx`
- `pages/platform/components/StreamCard.tsx`
- `pages/platform/components/PlatformSidebar.tsx`
- `pages/platform/components/PlatformTopNav.tsx`
- `pages/platform/components/StreamChatEmbed.tsx`
- `pages/platform/components/StreamComments.tsx`
- `pages/platform/components/StreamPlayer.tsx`
- `pages/platform/components/CategoryCard.tsx`
- `pages/platform/context/PipContext.tsx`
- `pages/platform/hooks/useStreams.ts`
- `pages/platform/services/streamService.ts` + all platform services
- `pages/Mobile/components/MobileReelsCard.tsx`
- `pages/Mobile/components/MobileStoryBar.tsx`
- `pages/Mobile/components/MobileStreamCard.tsx`
- `pages/Mobile/pages/MobileBrowsePage.tsx`
- `pages/Mobile/pages/MobileClipsPage.tsx`
- `pages/Mobile/pages/MobileHomePage.tsx`
- `pages/Mobile/pages/MobileProfilePage.tsx`
- `pages/Mobile/pages/MobileSearchPage.tsx`
- `pages/Mobile/pages/MobileStreamPage.tsx`

### Phase 1: Data Model (Foundation)
**Status: ⚫ TODO**

Create new Supabase-backed types for GAKI-native streamers:

```typescript
// New: A GAKI platform streamer (backed by Supabase gaki_streams table)
interface GakiStreamer {
  uid: string;                    // Firebase UID / Supabase profiles.id
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  isLive: boolean;
  streamTitle: string;
  category: string;
  startedAt: string;             // ISO timestamp
  viewerCount: number;           // GAKI platform viewers
  thumbnailUrl: string;
  destinations: StreamDestination[];  // Where else they're live
  tags: string[];
  isVerified: boolean;
  followers: number;
}

// A platform this streamer is simultaneously broadcasting to
interface StreamDestination {
  platform: PlatformType;
  isLive: boolean;               // Confirmed live on that platform
  externalUrl?: string;          // Link to their stream on that platform
  externalViewers?: number;      // Viewer count on that platform
}
```

**Supabase tables needed:**
- `gaki_streams` — Active/recent streams with `user_id`, `title`, `category`, `started_at`, `is_live`, `thumbnail_url`
- `stream_destinations` — Foreign key to `gaki_streams`, stores `platform`, `external_url`, `is_live`, `external_viewers`
- Joins to existing `profiles` table for `username`, `display_name`, `avatar_url`, `bio`

### Phase 2: Service Layer
**Status: ⚫ TODO**

| Task | File |
|---|---|
| Create `gakiStreamService.ts` — queries `gaki_streams` + `stream_destinations` + `profiles` from Supabase | `services/gakiStreamService.ts` |
| Create `useGakiStreams.ts` — React Query hook wrapping `gakiStreamService` | `hooks/useGakiStreams.ts` |
| Refactor `streamService.ts` — GAKI streams become primary, external APIs become optional enrichment | `services/streamService.ts` |
| Keep existing platform services (Kick, Twitch, YouTube, etc.) for enrichment only | `services/*.ts` |

### Phase 3: UI Components
**Status: ⚫ TODO**

| Task | File |
|---|---|
| `GakiStreamCard` — new card with streamer info + destination badges | `components/GakiStreamCard.tsx` |
| `DestinationBadges` — compact row of platform icons showing where they're also live | `components/DestinationBadges.tsx` |
| `GakiStreamGrid` — responsive grid of GAKI streamers | `components/GakiStreamGrid.tsx` |
| `FeaturedGakiStream` — hero section for top GAKI streamer | `components/FeaturedGakiStream.tsx` |
| `EmptyLiveState` — clean empty state when nobody is live | `components/EmptyLiveState.tsx` |
| Update `LiveStreamCarousel` — feature GAKI streamers | `components/LiveStreamCarousel.tsx` |
| Update skeletons for new card shape | `components/SkeletonStreamCard.tsx` |

### Phase 4: Page Assembly
**Status: ⚫ TODO**

| Task | File |
|---|---|
| Revamp `HomePage.tsx` — GAKI streamers first, proper empty state | `pages/HomePage.tsx` |
| Update `StreamPage.tsx` — multi-platform destination indicators | `pages/StreamPage.tsx` |
| Update `BrowsePage.tsx` — categories from Supabase, not hardcoded | `pages/BrowsePage.tsx` |
| Update `DashboardPage.tsx` — real streamer analytics | `pages/DashboardPage.tsx` |

### Phase 5: Polish & Production
**Status: ⚫ TODO**

- Loading skeletons for all new components
- Error states with clear error messaging (not silent failures)
- Empty state when no GAKI streamers are live (must look intentional, not broken)
- Mobile responsiveness
- Update all CLAUDE.md status markers

## 🧠 Business Logic That Isn't Obvious
- **Stream destinations come from the GAKI studio** — When a user goes live via the GAKI studio (`apps/web`), they select which platforms to multicast to via `useStreamStore.destinations`. This data should be written to Supabase `stream_destinations` when the stream starts.
- **External viewer counts are optional enrichment** — We can try to fetch viewer counts from external APIs, but the primary viewer count is GAKI-native.
- **The `useRtmpStream` hook in `apps/web`** is where streaming starts — `streamService.startStreaming(targets)` sends to the destinations. This is where we'd also write to Supabase to mark the user as live.

## 🚫 What NOT to Touch (during revamp)
- `AuthContext.tsx` — Auth flow is working, don't break it
- `PipContext.tsx` — PiP functionality is separate and working
- Platform service files (keep them for enrichment) — don't delete, just deprioritize
- `PlatformLayout.tsx` shell — TopNav + Sidebar + Outlet structure stays

## ⚡ Key Dependencies
- `@tanstack/react-query` — Data fetching and caching
- Supabase client — `@/integrations/supabase/client.ts` (existing tables: `profiles`, `follows`, `user_roles`)
- Firebase Auth — `@/pages/platform/context/AuthContext.tsx`
- Platform icons — `@/features/banners/ui/banner/PlatformIcons.tsx`
- Theme store — `@/features/theme` (controls `platformLayout`)
- Stream store — `@/stores/stream.store.ts` (has `destinations` array for multicast)

---

> [2026-10-06] Created platform page CLAUDE.md with full revamp plan. Status: 🟡 IN PROGRESS. Agent: Antigravity.
> [2026-10-06] Updated CLAUDE.md: Added HARD RULE for zero mock data. Added Phase 0 (purge mock data) with complete file audit. Updated all phases to reference real Supabase/Firebase data only. Agent: Antigravity.
