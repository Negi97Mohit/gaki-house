// Rumble Service
// Note: Rumble does not have a public API for fetching live streams dynamically without an account/API key.
// This service is a placeholder for future integration or manual stream addition.

import { StreamChannel, PlatformType } from "../data/mockData";

// Helper to extract Rumble Video ID from URL or use raw ID
export function getRumbleVideoId(urlOrId: string): string {
    // Example: https://rumble.com/v28kx6w-some-video.html -> v28kx6w
    const match = urlOrId.match(/rumble\.com\/([a-z0-9]+)-/);
    if (match && match[1]) {
        return match[1];
    }
    return urlOrId;
}

export async function fetchRumbleLiveStreams(): Promise<StreamChannel[]> {
    // Currently returns empty list as there is no public "Top Live" endpoint
    // accessible without scraping or API keys.
    // In a real app, you might fetch from your own backend that curates these.
    return [];
}
