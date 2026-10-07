import type { StreamChannel } from "../data/mockData";

/**
 * Stream aggregator — currently disabled.
 * Will be replaced with GAKI-native stream fetching from Supabase.
 *
 * The old external platform fetchers (YouTube, Twitch, Kick, etc.) are
 * preserved in their individual service files for future enrichment use,
 * but are not called here until the GAKI-first model is built.
 */
export async function fetchAllStreams(): Promise<StreamChannel[]> {
  return [];
}

export function hasAnyApiKeys(): boolean {
  return !!(import.meta.env.VITE_YOUTUBE_API_KEY || import.meta.env.VITE_TWITCH_CLIENT_ID);
}
