import { useQuery } from "@tanstack/react-query";
import { fetchAllStreams } from "../services/streamService";
import type { StreamChannel, PlatformType } from "../data/mockData";

const STREAMS_QUERY_KEY = ["platform-streams"];
const STALE_TIME = 4 * 60 * 1000;
const REFETCH_INTERVAL = 5 * 60 * 1000;

export function useStreams() {
  return useQuery<StreamChannel[]>({
    queryKey: STREAMS_QUERY_KEY,
    queryFn: fetchAllStreams,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
  });
}

export function useFeaturedStream() {
  const { data: streams, ...rest } = useStreams();
  const featured =
    streams && streams.length > 0
      ? streams.reduce((max, ch) => (ch.viewers > max.viewers ? ch : max), streams[0])
      : null;
  return { data: featured, ...rest };
}

export function useStreamsByPlatform(platform: PlatformType) {
  const { data: streams, ...rest } = useStreams();
  const filtered = (streams || []).filter((ch) => ch.platform === platform);
  return { data: filtered, ...rest };
}
