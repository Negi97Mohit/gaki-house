// Mock data for the streaming platform

export type PlatformType = "youtube" | "twitch" | "kick" | "rumble" | "facebook" | "x";

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
  platform?: PlatformType;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  viewers: number;
  thumbnail: string;
  tags: string[];
}

// Platform metadata for badges, colors
export interface PlatformMeta {
  label: string;
  color: string;      // badge background
  textColor: string;   // badge text
}

export const PLATFORM_META: Record<PlatformType, PlatformMeta> = {
  youtube: { label: "YouTube", color: "#FF0000", textColor: "#fff" },
  twitch: { label: "Twitch", color: "#9146FF", textColor: "#fff" },
  kick: { label: "Kick", color: "#53FC18", textColor: "#000" },
  rumble: { label: "Rumble", color: "#85C742", textColor: "#000" },
  facebook: { label: "Facebook Gaming", color: "#1877F2", textColor: "#fff" },
  x: { label: "X (Twitter)", color: "#000000", textColor: "#fff" },
};

export const MOCK_CATEGORIES: Category[] = [
  // Original categories
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
  // New categories
  { id: "13", name: "Fitness & Health", slug: "fitness", viewers: 14200, thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=400&fit=crop", tags: ["IRL", "Fitness"] },
  { id: "14", name: "Podcasts", slug: "podcasts", viewers: 22400, thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&h=400&fit=crop", tags: ["Talk Show", "IRL"] },
  { id: "15", name: "Travel & Outdoors", slug: "travel", viewers: 11800, thumbnail: "https://images.unsplash.com/photo-1488646472560-ec4b578e2e5b?w=300&h=400&fit=crop", tags: ["IRL", "Adventure"] },
  { id: "16", name: "Education", slug: "education", viewers: 8900, thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=400&fit=crop", tags: ["Educational", "Talk Show"] },
  { id: "17", name: "Sports", slug: "sports", viewers: 38600, thumbnail: "https://images.unsplash.com/photo-1461896836934-bd45ba0c2064?w=300&h=400&fit=crop", tags: ["Sports", "IRL"] },
  { id: "18", name: "Comedy", slug: "comedy", viewers: 19500, thumbnail: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=300&h=400&fit=crop", tags: ["Entertainment", "IRL"] },
  { id: "19", name: "ASMR", slug: "asmr", viewers: 6300, thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=400&fit=crop", tags: ["Relaxation", "Creative"] },
  { id: "20", name: "Programming", slug: "programming", viewers: 12700, thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=400&fit=crop", tags: ["Educational", "Tech"] },
];

const avatarBase = "https://api.dicebear.com/9.x/adventurer/svg?seed=";

export const MOCK_CHANNELS: StreamChannel[] = [
  // ── YouTube ──
  {
    id: "1", username: "amplified", displayName: "Amplified", avatar: `${avatarBase}amplified`,
    title: "🔴 Late Night Chill Stream | !links !throne", category: "Just Chatting", categorySlug: "just-chatting",
    viewers: 198, thumbnail: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=640&h=360&fit=crop",
    isLive: true, tags: ["english", "vtuber", "gaming"], isVerified: true, followers: 42300,
    bio: "Full-time streamer. Gaming & chatting every day.",
    streamUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    platform: "youtube"
  },
  {
    id: "2", username: "nasa", displayName: "NASA", avatar: `${avatarBase}nasa`,
    title: "Official NASA Stream 🚀", category: "Education", categorySlug: "education",
    viewers: 12500, thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&h=360&fit=crop",
    isLive: true, tags: ["science", "space", "official"], followers: 5800000,
    bio: "Exploring the secrets of the universe for the benefit of all.",
    streamUrl: "https://www.youtube.com/watch?v=21X5lGlDOfg",
    platform: "youtube"
  },
  {
    id: "7", username: "eurogamer", displayName: "Eurogamer", avatar: `${avatarBase}eurogamer`,
    title: "Latest Game Reviews & News", category: "Just Chatting", categorySlug: "just-chatting",
    viewers: 1200, thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=640&h=360&fit=crop",
    isLive: true, tags: ["news", "reviews", "discussion"], isVerified: true, followers: 89000,
    bio: "Video game reviews, news, previews and more.",
    streamUrl: "https://www.youtube.com/watch?v=9Auq9mYxFEE",
    platform: "youtube"
  },
  {
    id: "8", username: "bloomberg", displayName: "Bloomberg TV", avatar: `${avatarBase}bloomberg`,
    title: "Global Financial News", category: "Podcasts", categorySlug: "podcasts",
    viewers: 5600, thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=640&h=360&fit=crop",
    isLive: true, tags: ["news", "finance", "business"], isVerified: true, followers: 2300000,
    bio: "Global business and financial news.",
    streamUrl: "https://www.youtube.com/watch?v=dp8PhLsUcFE",
    platform: "youtube"
  },
  {
    id: "9", username: "techlinked", displayName: "TechLinked", avatar: `${avatarBase}tech`,
    title: "Tech News Daily", category: "Education", categorySlug: "education",
    viewers: 2800, thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=640&h=360&fit=crop",
    isLive: true, tags: ["tech", "news", "gadgets"], followers: 1800000,
    bio: "Your daily dose of tech news.",
    platform: "youtube"
  },

  // ── Twitch ──
  {
    id: "3", username: "monstercat", displayName: "Monstercat", avatar: `${avatarBase}monstercat`,
    title: "Monstercat Radio - 24/7 Music 🎵", category: "Music", categorySlug: "music",
    viewers: 2200, thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=640&h=360&fit=crop",
    isLive: true, tags: ["music", "edm", "radio"], isVerified: true, followers: 850000,
    bio: "Non-stop electronic music radio.",
    streamUrl: "https://www.twitch.tv/monstercat",
    platform: "twitch"
  },
  {
    id: "4", username: "chess", displayName: "Chess", avatar: `${avatarBase}chess`,
    title: "International Chess Championship", category: "Sports", categorySlug: "sports",
    viewers: 15400, thumbnail: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=640&h=360&fit=crop",
    isLive: true, tags: ["strategy", "tournament", "official"], followers: 1200000,
    bio: "Official broadcast of top-level chess tournaments.",
    streamUrl: "https://www.twitch.tv/chess",
    platform: "twitch"
  },
  {
    id: "5", username: "riotgames", displayName: "Riot Games", avatar: `${avatarBase}riot`,
    title: "LCS - League Championship Series", category: "League of Legends", categorySlug: "league-of-legends",
    viewers: 86000, thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop",
    isLive: true, tags: ["esports", "tournament", "official"], isVerified: true, followers: 6400000,
    bio: "The official home of LoL Esports.",
    streamUrl: "https://www.twitch.tv/riotgames",
    platform: "twitch"
  },
  {
    id: "6", username: "shroud", displayName: "shroud", avatar: `${avatarBase}shroud`,
    title: "Just chilling in Valorant", category: "VALORANT", categorySlug: "valorant",
    viewers: 32000, thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=640&h=360&fit=crop",
    isLive: true, tags: ["fps", "pro", "english"], isVerified: true, followers: 10800000,
    bio: "FPS Legend.",
    streamUrl: "https://www.twitch.tv/shroud",
    platform: "twitch"
  },
  {
    id: "10", username: "animalplanet", displayName: "Animal Planet", avatar: `${avatarBase}animal`,
    title: "Wild Animals Live 🦁", category: "IRL", categorySlug: "irl",
    viewers: 940, thumbnail: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=640&h=360&fit=crop",
    isLive: true, tags: ["nature", "animals", "documentary"], followers: 340000,
    bio: "The world of animals.",
    platform: "twitch"
  },

  // ── Kick ──
  {
    id: "11", username: "adin", displayName: "Adin Ross", avatar: `${avatarBase}adin`,
    title: "W STREAM 🔥 | Reacting & Gaming", category: "Just Chatting", categorySlug: "just-chatting",
    viewers: 62000, thumbnail: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=640&h=360&fit=crop",
    isLive: true, tags: ["entertainment", "reactions", "english"], isVerified: true, followers: 8900000,
    bio: "Content creator & streamer.",
    platform: "kick"
  },
  {
    id: "12", username: "trainwreck", displayName: "Trainwreck", avatar: `${avatarBase}trainwreck`,
    title: "Late Night Podcast & Chatting", category: "Podcasts", categorySlug: "podcasts",
    viewers: 28500, thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=640&h=360&fit=crop",
    isLive: true, tags: ["podcast", "talk show", "english"], isVerified: true, followers: 2100000,
    bio: "Real talk, no filter.",
    platform: "kick"
  },
  {
    id: "13", username: "kickfighter", displayName: "FightNight", avatar: `${avatarBase}fightnight`,
    title: "MMA Watch Party 🥊", category: "Sports", categorySlug: "sports",
    viewers: 18900, thumbnail: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=640&h=360&fit=crop",
    isLive: true, tags: ["sports", "mma", "live"], followers: 450000,
    bio: "Your home for fight reactions.",
    platform: "kick"
  },

  // ── Rumble ──
  {
    id: "14", username: "russellbrand", displayName: "Russell Brand", avatar: `${avatarBase}russell`,
    title: "Stay Free — Daily Discussion", category: "Podcasts", categorySlug: "podcasts",
    viewers: 34000, thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=640&h=360&fit=crop",
    isLive: true, tags: ["politics", "discussion", "english"], isVerified: true, followers: 3500000,
    bio: "Awakening through conversation.",
    platform: "rumble"
  },
  {
    id: "15", username: "outdoorchef", displayName: "Outdoor Chef Life", avatar: `${avatarBase}outdoorchef`,
    title: "Campfire Cooking in the Wild 🏕️", category: "Cooking", categorySlug: "cooking",
    viewers: 4200, thumbnail: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=640&h=360&fit=crop",
    isLive: true, tags: ["cooking", "outdoors", "adventure"], followers: 120000,
    bio: "Cooking wild, eating free.",
    platform: "rumble"
  },
  {
    id: "16", username: "rumblefitness", displayName: "FitStream", avatar: `${avatarBase}fitstream`,
    title: "Morning HIIT Workout — Join Live 💪", category: "Fitness & Health", categorySlug: "fitness",
    viewers: 7800, thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&h=360&fit=crop",
    isLive: true, tags: ["fitness", "workout", "health"], followers: 280000,
    bio: "Daily live workouts for everyone.",
    platform: "rumble"
  },

  // ── Facebook Gaming ──
  {
    id: "17", username: "fbcorinna", displayName: "Corinna Kopf", avatar: `${avatarBase}corinna`,
    title: "Fortnite w/ Friends 🎮", category: "Fortnite", categorySlug: "fortnite",
    viewers: 19200, thumbnail: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=640&h=360&fit=crop",
    isLive: true, tags: ["gaming", "battle royale", "english"], isVerified: true, followers: 4200000,
    bio: "Gamer, creator, vibes.",
    platform: "facebook"
  },
  {
    id: "18", username: "fbcomedyhub", displayName: "Comedy Hub", avatar: `${avatarBase}comedy`,
    title: "Stand-Up Open Mic Night 😂", category: "Comedy", categorySlug: "comedy",
    viewers: 6700, thumbnail: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=640&h=360&fit=crop",
    isLive: true, tags: ["comedy", "entertainment", "live"], followers: 320000,
    bio: "Laughs every single night.",
    platform: "facebook"
  },
  {
    id: "19", username: "fbmcbuilds", displayName: "MC Builds", avatar: `${avatarBase}mcbuilds`,
    title: "Building a Medieval Castle 🏰", category: "Minecraft", categorySlug: "minecraft",
    viewers: 3100, thumbnail: "https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?w=640&h=360&fit=crop",
    isLive: true, tags: ["sandbox", "creative", "gaming"], followers: 95000,
    bio: "Epic Minecraft builds daily.",
    platform: "facebook"
  },

  // ── X (Twitter) ──
  {
    id: "20", username: "elonx", displayName: "Elon Musk", avatar: `${avatarBase}elon`,
    title: "SpaceX Starship Test Flight 🚀", category: "Education", categorySlug: "education",
    viewers: 245000, thumbnail: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=640&h=360&fit=crop",
    isLive: true, tags: ["space", "tech", "live"], isVerified: true, followers: 170000000,
    bio: "Mars, and beyond.",
    platform: "x"
  },
  {
    id: "21", username: "xnewslive", displayName: "X News Live", avatar: `${avatarBase}xnews`,
    title: "Breaking News — 24/7 Coverage", category: "Podcasts", categorySlug: "podcasts",
    viewers: 18400, thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=640&h=360&fit=crop",
    isLive: true, tags: ["news", "breaking", "live"], isVerified: true, followers: 5600000,
    bio: "News as it happens.",
    platform: "x"
  },
  {
    id: "22", username: "xcodewithme", displayName: "CodeWithMe", avatar: `${avatarBase}codewith`,
    title: "Building a SaaS in 24 Hours ⌨️", category: "Programming", categorySlug: "programming",
    viewers: 8200, thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=640&h=360&fit=crop",
    isLive: true, tags: ["programming", "coding", "tech"], followers: 420000,
    bio: "Live coding, real projects.",
    platform: "x"
  },
];

export const FEATURED_STREAM = MOCK_CHANNELS[0];

export function formatViewerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
