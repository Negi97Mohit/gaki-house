// Mock data for the streaming platform
// Covers ALL streaming platforms the app supports

export type PlatformType =
  // Major
  | "youtube" | "twitch" | "facebook" | "tiktok" | "instagram" | "x" | "linkedin"
  // Gaming
  | "kick" | "rumble" | "dlive" | "trovo" | "bilibili" | "nimotv"
  // Professional
  | "vimeo" | "vk" | "mixcloud" | "brightcove" | "jwplayer" | "kaltura" | "ibm" | "wowza" | "mux" | "aws"
  // Self-Hosted
  | "owncast" | "peertube" | "nginx" | "wowzaserver" | "antmedia" | "red5" | "mediasoup";

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
  color: string;
  textColor: string;
  category: "major" | "gaming" | "professional" | "selfhosted";
}

export const PLATFORM_META: Record<PlatformType, PlatformMeta> = {
  // Major
  youtube: { label: "YouTube", color: "#FF0000", textColor: "#fff", category: "major" },
  twitch: { label: "Twitch", color: "#9146FF", textColor: "#fff", category: "major" },
  facebook: { label: "Facebook Live", color: "#1877F2", textColor: "#fff", category: "major" },
  tiktok: { label: "TikTok Live", color: "#000000", textColor: "#fff", category: "major" },
  instagram: { label: "Instagram Live", color: "#E4405F", textColor: "#fff", category: "major" },
  x: { label: "X Live", color: "#000000", textColor: "#fff", category: "major" },
  linkedin: { label: "LinkedIn Live", color: "#0A66C2", textColor: "#fff", category: "major" },
  // Gaming
  kick: { label: "Kick", color: "#53FC18", textColor: "#000", category: "gaming" },
  rumble: { label: "Rumble", color: "#85C742", textColor: "#000", category: "gaming" },
  dlive: { label: "DLive", color: "#FFD300", textColor: "#000", category: "gaming" },
  trovo: { label: "Trovo", color: "#19D65C", textColor: "#fff", category: "gaming" },
  bilibili: { label: "Bilibili", color: "#00A1D6", textColor: "#fff", category: "gaming" },
  nimotv: { label: "Nimo TV", color: "#EE3C49", textColor: "#fff", category: "gaming" },
  // Professional
  vimeo: { label: "Vimeo", color: "#1AB7EA", textColor: "#fff", category: "professional" },
  vk: { label: "VK Live", color: "#0077FF", textColor: "#fff", category: "professional" },
  mixcloud: { label: "Mixcloud", color: "#5000FF", textColor: "#fff", category: "professional" },
  brightcove: { label: "Brightcove", color: "#FF6B00", textColor: "#fff", category: "professional" },
  jwplayer: { label: "JW Player", color: "#FF0046", textColor: "#fff", category: "professional" },
  kaltura: { label: "Kaltura", color: "#00B4E8", textColor: "#fff", category: "professional" },
  ibm: { label: "IBM Video", color: "#054ADA", textColor: "#fff", category: "professional" },
  wowza: { label: "Wowza Cloud", color: "#F37021", textColor: "#fff", category: "professional" },
  mux: { label: "Mux Live", color: "#FF2D55", textColor: "#fff", category: "professional" },
  aws: { label: "Amazon IVS", color: "#FF9900", textColor: "#000", category: "professional" },
  // Self-Hosted
  owncast: { label: "Owncast", color: "#7C3AED", textColor: "#fff", category: "selfhosted" },
  peertube: { label: "PeerTube", color: "#F1680D", textColor: "#fff", category: "selfhosted" },
  nginx: { label: "NGINX-RTMP", color: "#009639", textColor: "#fff", category: "selfhosted" },
  wowzaserver: { label: "Wowza Server", color: "#F37021", textColor: "#fff", category: "selfhosted" },
  antmedia: { label: "Ant Media", color: "#00D4FF", textColor: "#000", category: "selfhosted" },
  red5: { label: "Red5", color: "#D32F2F", textColor: "#fff", category: "selfhosted" },
  mediasoup: { label: "MediaSoup", color: "#4CAF50", textColor: "#fff", category: "selfhosted" },
};

export const PLATFORM_CATEGORY_LABELS: Record<string, string> = {
  major: "Popular",
  gaming: "Gaming",
  professional: "Professional",
  selfhosted: "Self-Hosted",
};

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

export const MOCK_CHANNELS: StreamChannel[] = [];

export const FEATURED_STREAM = null;

export function formatViewerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

