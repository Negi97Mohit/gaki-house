// Mock data for the streaming platform

export interface StreamChannel {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  title: string;
  category: string;
  categorySlug: string;
  viewers: number;
  thumbnail: string;
  isLive: boolean;
  tags: string[];
  isVerified?: boolean;
  followers?: number;
  bio?: string;
  streamUrl?: string;
  platform?: "youtube" | "twitch" | "kick" | "rumble"; // New field
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  viewers: number;
  thumbnail: string;
  tags: string[];
}

export const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Just Chatting", slug: "just-chatting", viewers: 96500, thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=400&fit=crop", tags: ["IRL", "Casual"] },
  { id: "2", name: "IRL", slug: "irl", viewers: 64500, thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=400&fit=crop", tags: ["IRL", "Adventure"] },
  { id: "3", name: "Grand Theft Auto V", slug: "gta-v", viewers: 61800, thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=400&fit=crop", tags: ["Shooter", "Action"] },
  { id: "4", name: "VALORANT", slug: "valorant", viewers: 52100, thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=400&fit=crop", tags: ["Shooter", "FPS"] },
  { id: "5", name: "League of Legends", slug: "league-of-legends", viewers: 30200, thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&h=400&fit=crop", tags: ["MOBA", "Action"] },
  { id: "6", name: "Dota 2", slug: "dota-2", viewers: 30800, thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&h=400&fit=crop", tags: ["MOBA", "Action"] },
  { id: "7", name: "Minecraft", slug: "minecraft", viewers: 28100, thumbnail: "https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?w=300&h=400&fit=crop", tags: ["Sandbox", "Adventure"] },
  { id: "8", name: "Fortnite", slug: "fortnite", viewers: 45200, thumbnail: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=300&h=400&fit=crop", tags: ["Battle Royale", "Shooter"] },
  { id: "9", name: "Counter-Strike 2", slug: "cs2", viewers: 11600, thumbnail: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=400&fit=crop", tags: ["Shooter", "Tactical"] },
  { id: "10", name: "Music", slug: "music", viewers: 18300, thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=400&fit=crop", tags: ["Creative", "IRL"] },
  { id: "11", name: "Art", slug: "art", viewers: 9200, thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&h=400&fit=crop", tags: ["Creative", "IRL"] },
  { id: "12", name: "Cooking", slug: "cooking", viewers: 7500, thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=400&fit=crop", tags: ["IRL", "Food"] },
];

const avatarBase = "https://api.dicebear.com/9.x/adventurer/svg?seed=";

export const MOCK_CHANNELS: StreamChannel[] = [
  {
    id: "1", username: "amplified", displayName: "Amplified", avatar: `${avatarBase}amplified`,
    title: "🔴 Late Night Chill Stream | !links !throne", category: "Just Chatting", categorySlug: "just-chatting",
    viewers: 198, thumbnail: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=640&h=360&fit=crop",
    isLive: true, tags: ["english", "vtuber", "gaming"], isVerified: true, followers: 42300,
    bio: "Full-time streamer. Gaming & chatting every day.",
    streamUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk", // Lofi Girl
    platform: "youtube"
  },
  {
    id: "2", username: "nasa", displayName: "NASA", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=nasa",
    title: "Official NASA Stream 🚀", category: "Science", categorySlug: "science",
    viewers: 12500, thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&h=360&fit=crop",
    isLive: true, tags: ["science", "space", "official"], followers: 5800000,
    bio: "Exploring the secrets of the universe for the benefit of all.",
    streamUrl: "https://www.youtube.com/watch?v=21X5lGlDOfg", // NASA Live
    platform: "youtube"
  },
  {
    id: "3", username: "monstercat", displayName: "Monstercat", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=monstercat",
    title: "Monstercat Radio - 24/7 Music 🎵", category: "Music", categorySlug: "music",
    viewers: 2200, thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=640&h=360&fit=crop",
    isLive: true, tags: ["music", "edm", "radio"], isVerified: true, followers: 850000,
    bio: "Non-stop electronic music radio.",
    streamUrl: "https://www.twitch.tv/monstercat",
    platform: "twitch"
  },
  {
    id: "4", username: "chess", displayName: "Chess", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=chess",
    title: "International Chess Championship", category: "Chess", categorySlug: "chess",
    viewers: 15400, thumbnail: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=640&h=360&fit=crop",
    isLive: true, tags: ["strategy", "tournament", "official"], followers: 1200000,
    bio: "Official broadcast of top-level chess tournaments.",
    streamUrl: "https://www.twitch.tv/chess",
    platform: "twitch"
  },
  {
    id: "5", username: "riotgames", displayName: "Riot Games", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=riot",
    title: "LCS - League Championship Series", category: "League of Legends", categorySlug: "league-of-legends",
    viewers: 86000, thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop",
    isLive: true, tags: ["esports", "tournament", "official"], isVerified: true, followers: 6400000,
    bio: "The official home of LoL Esports.",
    streamUrl: "https://www.twitch.tv/riotgames",
    platform: "twitch"
  },
  {
    id: "6", username: "shroud", displayName: "shroud", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=shroud",
    title: "Just chilling in Valorant", category: "VALORANT", categorySlug: "valorant",
    viewers: 32000, thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=640&h=360&fit=crop",
    isLive: true, tags: ["fps", "pro", "english"], isVerified: true, followers: 10800000,
    bio: "FPS Legend.",
    streamUrl: "https://www.twitch.tv/shroud",
    platform: "twitch"
  },
  {
    id: "7", username: "eurogamer", displayName: "Eurogamer", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=eurogamer",
    title: "Latest Game Reviews & News", category: "Gaming News", categorySlug: "gaming-news",
    viewers: 1200, thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=640&h=360&fit=crop",
    isLive: true, tags: ["news", "reviews", "discussion"], isVerified: true, followers: 89000,
    bio: "Video game reviews, news, previews and more.",
    streamUrl: "https://www.youtube.com/watch?v=9Auq9mYxFEE", // Sky News Live (Placeholder for 24/7 news source)
    platform: "youtube"
  },
  {
    id: "8", username: "bloomberg", displayName: "Bloomberg TV", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=bloomberg",
    title: "Global Financial News", category: "News", categorySlug: "news",
    viewers: 5600, thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=640&h=360&fit=crop",
    isLive: true, tags: ["news", "finance", "business"], isVerified: true, followers: 2300000,
    bio: "Global business and financial news.",
    streamUrl: "https://www.youtube.com/watch?v=dp8PhLsUcFE",
    platform: "youtube"
  },
  {
    id: "9", username: "techlinked", displayName: "TechLinked", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=tech",
    title: "Tech News Daily", category: "Technology", categorySlug: "technology",
    viewers: 2800, thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=640&h=360&fit=crop",
    isLive: true, tags: ["tech", "news", "gadgets"], followers: 1800000,
    bio: "Your daily dose of tech news.",
    platform: "youtube"
  },
  {
    id: "10", username: "animalplanet", displayName: "Animal Planet", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=animal",
    title: "Wild Animals Live 🦁", category: "Animals", categorySlug: "animals",
    viewers: 940, thumbnail: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=640&h=360&fit=crop",
    isLive: true, tags: ["nature", "animals", "documentary"], followers: 340000,
    bio: "The world of animals.",
    platform: "twitch"
  },
];

export const FEATURED_STREAM = MOCK_CHANNELS[2]; // Classybeef with 2.2K viewers

export function formatViewerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
