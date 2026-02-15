// Aggregator — merges API data with mock fallback
import { StreamChannel, MOCK_CHANNELS, PlatformType } from "../data/mockData";
import { fetchYouTubeLiveStreams } from "./youtubeService";
import { fetchTwitchLiveStreams } from "./twitchService";
import { fetchKickLiveStreams } from "./kickService";

/**
 * Fetches live streams from all configured platform APIs.
 * For platforms without API support, returns mock data.
 *
 * Flow:
 * 1. Call YouTube + Twitch + Kick APIs in parallel
 * 2. For platforms with API results, replace mock data for that platform
 * 3. For platforms without APIs (or on failure), keep mock data
 */
export async function fetchAllStreams(): Promise<StreamChannel[]> {
    const hasYouTubeKey = !!import.meta.env.VITE_YOUTUBE_API_KEY;
    const hasTwitchKey = !!import.meta.env.VITE_TWITCH_CLIENT_ID;

    // Always fetch Kick (via proxy), as it doesn't need a key in this dev setup
    // But we treat it as "optional" if it fails

    // Fetch from available APIs in parallel
    const [youtubeStreams, twitchStreams, kickStreams] = await Promise.all([
        hasYouTubeKey ? fetchYouTubeLiveStreams(12) : Promise.resolve([]),
        hasTwitchKey ? fetchTwitchLiveStreams(12) : Promise.resolve([]),
        fetchKickLiveStreams(),
    ]);

    // Determine which platforms have live API data
    const apiPlatforms = new Set<PlatformType>();
    if (youtubeStreams.length > 0) apiPlatforms.add("youtube");
    if (twitchStreams.length > 0) apiPlatforms.add("twitch");
    if (kickStreams.length > 0) apiPlatforms.add("kick");

    // Keep mock data for unsupported platforms/failed APIs
    // NOTE: If Kick API returns 0 streams (e.g. proxy blocked), we fall back to mock data
    const mockFallback = MOCK_CHANNELS.filter(
        (ch) => !ch.platform || !apiPlatforms.has(ch.platform)
    );

    // Merge: API data first (sorted by viewers desc), then mock fallback
    const apiStreams = [...youtubeStreams, ...twitchStreams, ...kickStreams].sort(
        (a, b) => b.viewers - a.viewers
    );

    return [...apiStreams, ...mockFallback];
}

/**
 * Check if any platform APIs are configured.
 * Useful for showing "using mock data" warnings in UI.
 */
export function hasAnyApiKeys(): boolean {
    return !!(
        import.meta.env.VITE_YOUTUBE_API_KEY ||
        import.meta.env.VITE_TWITCH_CLIENT_ID
    );
}
