// React Query hooks for dynamic stream data
import { useQuery } from "@tanstack/react-query";
import { fetchAllStreams } from "../services/streamService";
import { StreamChannel, MOCK_CHANNELS, PlatformType } from "../data/mockData";

const STREAMS_QUERY_KEY = ["platform-streams"];
const STALE_TIME = 2 * 60 * 1000; // 2 minutes
const REFETCH_INTERVAL = 3 * 60 * 1000; // Auto-refetch every 3 minutes

/**
 * Primary hook — fetches all live streams from APIs + mock fallback.
 * Returns loading/error states for skeleton UI.
 */
export function useStreams() {
    return useQuery<StreamChannel[]>({
        queryKey: STREAMS_QUERY_KEY,
        queryFn: fetchAllStreams,
        staleTime: STALE_TIME,
        refetchInterval: REFETCH_INTERVAL,
        refetchOnWindowFocus: true,
        placeholderData: MOCK_CHANNELS, // Show mock data while first fetch is loading
    });
}

/**
 * Returns the featured (highest viewer count) live stream.
 */
export function useFeaturedStream() {
    const { data: streams, ...rest } = useStreams();
    const featured = streams && streams.length > 0
        ? streams.reduce((max, ch) => (ch.viewers > max.viewers ? ch : max), streams[0])
        : MOCK_CHANNELS[0];

    return { data: featured, ...rest };
}

/**
 * Returns streams filtered by platform.
 */
export function useStreamsByPlatform(platform: PlatformType) {
    const { data: streams, ...rest } = useStreams();
    const filtered = (streams || []).filter((ch) => ch.platform === platform);
    return { data: filtered, ...rest };
}
