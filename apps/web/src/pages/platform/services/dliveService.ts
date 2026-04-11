// DLive GraphQL API — fetch live streams
// Uses the public GraphQL endpoint (no API key required)
import { StreamChannel, PlatformType } from "../data/mockData";

// Use Vite dev proxy (/api/dlive) to bypass CORS in development
// On Netlify deploy, this routes via the redirect rule in netlify.toml
const DLIVE_GRAPHQL_URL = "/api/dlive";

// GraphQL query to fetch top live streams
const LIVESTREAMS_QUERY = `
  query LivestreamsPage($first: Int!, $after: String) {
    livestreams(
      input: {
        order: TRENDING
        first: $first
        after: $after
      }
    ) {
      pageInfo {
        endCursor
        hasNextPage
      }
      list {
        ... on Livestream {
          id
          title
          totalReward
          watchingCount
          thumbnailUrl
          language {
            language
          }
          category {
            title
            imgUrl
            backendID
          }
          creator {
            username
            displayname
            avatar
            followers {
              totalCount
            }
            about
            partnerStatus
          }
        }
      }
    }
  }
`;

interface DLiveCreator {
  username: string;
  displayname: string;
  avatar: string;
  followers?: {
    totalCount?: number;
  };
  about?: string;
  partnerStatus?: string;
}

interface DLiveLivestream {
  id: string;
  title: string;
  totalReward: string;
  watchingCount: number;
  thumbnailUrl: string;
  language?: {
    language: string;
  };
  category?: {
    title: string;
    imgUrl: string;
    backendID: number;
  };
  creator: DLiveCreator;
}

// Maps DLive category IDs to our slugs
function mapDLiveCategory(category?: { title: string; backendID: number }): { name: string; slug: string } {
  if (!category) return { name: "Just Chatting", slug: "just-chatting" };

  const title = category.title.toLowerCase();
  if (title.includes("gaming") || title.includes("game")) return { name: category.title, slug: "just-chatting" };
  if (title.includes("music")) return { name: "Music", slug: "music" };
  if (title.includes("art") || title.includes("creative")) return { name: "Art", slug: "art" };
  if (title.includes("irl")) return { name: "IRL", slug: "irl" };
  if (title.includes("sport")) return { name: "Sports", slug: "sports" };
  if (title.includes("education")) return { name: "Education", slug: "education" };
  if (title.includes("crypto") || title.includes("bitcoin")) return { name: "Crypto", slug: "just-chatting" };
  return { name: category.title || "Just Chatting", slug: "just-chatting" };
}

export async function fetchDLiveLiveStreams(
  maxResults = 12
): Promise<StreamChannel[]> {
  try {
    const res = await fetch(DLIVE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: LIVESTREAMS_QUERY,
        variables: {
          first: maxResults,
          after: null,
        },
      }),
    });

    if (!res.ok) {
      console.error("[DLiveService] API error:", res.status);
      return [];
    }

    const json = await res.json();
    const streams: DLiveLivestream[] = json.data?.livestreams?.list || [];

    console.log(`[DLiveService] Found ${streams.length} live streams.`);

    if (streams.length === 0) return [];

    return streams.map((stream): StreamChannel => {
      const creator = stream.creator;
      const category = mapDLiveCategory(stream.category);
      const followers = creator.followers?.totalCount || 0;

      return {
        id: `dlive-${stream.id}`,
        username: creator.username,
        displayName: creator.displayname || creator.username,
        avatar: creator.avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=dlive-${creator.username}`,
        title: stream.title,
        category: category.name,
        categorySlug: category.slug,
        viewers: stream.watchingCount,
        thumbnail: stream.thumbnailUrl || "",
        isLive: true,
        tags: stream.category ? [stream.category.title] : ["live"],
        isVerified: creator.partnerStatus === "VERIFIED" || followers > 10000,
        followers: followers || undefined,
        bio: creator.about?.slice(0, 120) || undefined,
        streamUrl: `https://dlive.tv/${creator.username}`,
        platform: "dlive" as PlatformType,
      };
    });
  } catch (err) {
    console.error("[DLiveService] Failed to fetch live streams:", err);
    return [];
  }
}
