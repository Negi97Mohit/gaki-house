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
    bio: "Full-time streamer. Gaming & chatting every day."
  },
  {
    id: "2", username: "boneclinks", displayName: "Boneclinks", avatar: `${avatarBase}boneclinks`,
    title: "IRL Adventures in Tokyo 🗼", category: "IRL", categorySlug: "irl",
    viewers: 463, thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=640&h=360&fit=crop",
    isLive: true, tags: ["IRL", "travel", "japan"], followers: 128000,
    bio: "IRL streamer exploring the world."
  },
  {
    id: "3", username: "classybeef", displayName: "Classybeef", avatar: `${avatarBase}classybeef`,
    title: "High Stakes Tournament Finals 🏆", category: "VALORANT", categorySlug: "valorant",
    viewers: 2200, thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop",
    isLive: true, tags: ["competitive", "fps", "esports"], isVerified: true, followers: 350000,
    bio: "Pro VALORANT player. Competing at the highest level."
  },
  {
    id: "4", username: "thefreddymc", displayName: "TheFreddyMC", avatar: `${avatarBase}thefreddymc`,
    title: "Minecraft Survival Day 365! 🎂", category: "Minecraft", categorySlug: "minecraft",
    viewers: 107, thumbnail: "https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?w=640&h=360&fit=crop",
    isLive: true, tags: ["minecraft", "survival", "building"], followers: 67000,
    bio: "Minecraft content creator."
  },
  {
    id: "5", username: "cct_cs2", displayName: "CCT_CS2", avatar: `${avatarBase}cct_cs2`,
    title: "CCT Season 2 - Playoffs Day 3", category: "Counter-Strike 2", categorySlug: "cs2",
    viewers: 86, thumbnail: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=640&h=360&fit=crop",
    isLive: true, tags: ["esports", "tournament", "cs2"], isVerified: true, followers: 210000,
    bio: "Official CCT tournament broadcast."
  },
  {
    id: "6", username: "healingwhisperer", displayName: "TheHealingWhisperer", avatar: `${avatarBase}healingwhisperer`,
    title: "Escape From Tarkov - Zero to Hero Challenge", category: "Escape From Tarkov", categorySlug: "eft",
    viewers: 76, thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=640&h=360&fit=crop",
    isLive: true, tags: ["hardcore", "fps", "survival"], followers: 23000,
    bio: "FPS enthusiast and variety streamer."
  },
  {
    id: "7", username: "frankdimes", displayName: "FrankDimes", avatar: `${avatarBase}frankdimes`,
    title: "Art stream - Drawing your requests! 🎨", category: "Art", categorySlug: "art",
    viewers: 2000, thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=640&h=360&fit=crop",
    isLive: true, tags: ["art", "creative", "drawing"], isVerified: true, followers: 890000,
    bio: "Digital artist and illustrator."
  },
  {
    id: "8", username: "mando", displayName: "Mando", avatar: `${avatarBase}mando`,
    title: "Late night vibes 🌙 | !socials", category: "Just Chatting", categorySlug: "just-chatting",
    viewers: 1300, thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=640&h=360&fit=crop",
    isLive: true, tags: ["chatting", "chill", "music"], followers: 156000,
    bio: "Just vibing."
  },
  {
    id: "9", username: "drchubzdpt", displayName: "DrChubzDPT", avatar: `${avatarBase}drchubz`,
    title: "Ranked Grind to Immortal | Day 42", category: "VALORANT", categorySlug: "valorant",
    viewers: 1200, thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=640&h=360&fit=crop",
    isLive: true, tags: ["ranked", "fps", "grind"], followers: 45000,
    bio: "Doctor by day, gamer by night."
  },
  {
    id: "10", username: "johnnywhatsgoinon", displayName: "JohnnyWhatsGoingOn", avatar: `${avatarBase}johnny`,
    title: "Cooking Stream - Italian Night 🍝", category: "Cooking", categorySlug: "cooking",
    viewers: 223, thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=360&fit=crop",
    isLive: true, tags: ["cooking", "IRL", "food"], followers: 34000,
    bio: "Home chef sharing recipes live."
  },
];

export const FEATURED_STREAM = MOCK_CHANNELS[2]; // Classybeef with 2.2K viewers

export function formatViewerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
