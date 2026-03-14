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
  | "owncast" | "peertube" | "nginx" | "wowzaserver" | "antmedia" | "red5" | "mediasoup"
  // Asia & Regional
  | "douyu" | "huya" | "kuaishou" | "douyin" | "yy" // China
  | "afreecatv" | "navernow" | "kakaotv" // Korea
  | "niconico" | "showroom" | "mirrativ" // Japan
  | "bigo" | "cubetv" | "rooter" | "loco" | "chingari"; // SEA/India

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
  category: "major" | "gaming" | "professional" | "selfhosted" | "asia";
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
  bilibili: { label: "Bilibili", color: "#00A1D6", textColor: "#fff", category: "asia" }, // Moved to Asia
  nimotv: { label: "Nimo TV", color: "#EE3C49", textColor: "#fff", category: "asia" },   // Moved to Asia
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

  // Asia & Regional
  douyu: { label: "Douyu", color: "#FF5900", textColor: "#fff", category: "asia" },
  huya: { label: "Huya", color: "#FFD800", textColor: "#000", category: "asia" },
  kuaishou: { label: "Kuaishou", color: "#FF2B00", textColor: "#fff", category: "asia" },
  douyin: { label: "Douyin", color: "#000000", textColor: "#fff", category: "asia" },
  yy: { label: "YY Live", color: "#FADC1E", textColor: "#000", category: "asia" },

  afreecatv: { label: "AfreecaTV", color: "#3B72F2", textColor: "#fff", category: "asia" },
  navernow: { label: "Naver NOW", color: "#03C75A", textColor: "#fff", category: "asia" },
  kakaotv: { label: "KakaoTV", color: "#FEE500", textColor: "#000", category: "asia" },

  niconico: { label: "Niconico", color: "#252525", textColor: "#fff", category: "asia" },
  showroom: { label: "SHOWROOM", color: "#F05A75", textColor: "#fff", category: "asia" },
  mirrativ: { label: "Mirrativ", color: "#F32C52", textColor: "#fff", category: "asia" },

  bigo: { label: "BIGO Live", color: "#00A0FF", textColor: "#fff", category: "asia" },
  cubetv: { label: "Cube TV", color: "#8E44AD", textColor: "#fff", category: "asia" },
  rooter: { label: "Rooter", color: "#2ECC71", textColor: "#000", category: "asia" },
  loco: { label: "Loco", color: "#FFD700", textColor: "#000", category: "asia" },
  chingari: { label: "Chingari", color: "#A83636", textColor: "#fff", category: "asia" }
};

export const PLATFORM_CATEGORY_LABELS: Record<string, string> = {
  major: "Popular",
  gaming: "Gaming",
  professional: "Professional",
  selfhosted: "Self-Hosted",
  asia: "Asia & Regional",
};

export const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Just Chatting", slug: "just-chatting", viewers: 245000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/509658-285x380.jpg", tags: ["IRL", "Casual"] },
  { id: "2", name: "Grand Theft Auto V", slug: "gta-v", viewers: 185000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/32982_IGDB-285x380.jpg", tags: ["Shooter", "Action"] },
  { id: "3", name: "League of Legends", slug: "league-of-legends", viewers: 162000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/21779-285x380.jpg", tags: ["MOBA", "Esports"] },
  { id: "4", name: "VALORANT", slug: "valorant", viewers: 145000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/516575-285x380.jpg", tags: ["FPS", "Shooter"] },
  { id: "5", name: "Dota 2", slug: "dota-2", viewers: 89000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/29595-285x380.jpg", tags: ["MOBA", "Strategy"] },
  { id: "6", name: "Minecraft", slug: "minecraft", viewers: 76000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/27471_IGDB-285x380.jpg", tags: ["Sandbox", "Survival"] },
  { id: "7", name: "Counter-Strike 2", slug: "cs2", viewers: 68000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/32399_IGDB-285x380.jpg", tags: ["FPS", "Tactical"] },
  { id: "8", name: "Fortnite", slug: "fortnite", viewers: 62000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/33214-285x380.jpg", tags: ["Battle Royale", "Shooter"] },
  { id: "9", name: "Apex Legends", slug: "apex-legends", viewers: 45000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/511224-285x380.jpg", tags: ["FPS", "Sci-Fi"] },
  { id: "10", name: "Music", slug: "music", viewers: 34000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/26936-285x380.jpg", tags: ["Performance", "DJ"] },
  { id: "11", name: "Software Development", slug: "software-development", viewers: 21000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/1469308723-285x380.jpg", tags: ["Coding", "Tech"] },
  { id: "12", name: "Art", slug: "art", viewers: 18000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/509660-285x380.jpg", tags: ["Creative", "Drawing"] },
  { id: "13", name: "Talk Shows & Podcasts", slug: "podcasts", viewers: 15000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/417752-285x380.jpg", tags: ["Discussion", "News"] },
  { id: "14", name: "ASMR", slug: "asmr", viewers: 12000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/509659-285x380.jpg", tags: ["Relaxation", "IRL"] },
  { id: "15", name: "Sports", slug: "sports", viewers: 11000, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/518203-285x380.jpg", tags: ["Live", "Competition"] },
  { id: "16", name: "Travel & Outdoors", slug: "travel", viewers: 9500, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/116747788-285x380.jpg", tags: ["Adventure", "IRL"] },
  { id: "17", name: "Retro Gaming", slug: "retro", viewers: 8500, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/27284-285x380.jpg", tags: ["Classics", "Nostalgia"] },
  { id: "18", name: "Crypto & Finance", slug: "crypto", viewers: 7500, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/498566-285x380.jpg", tags: ["Investing", "Analysis"] },
  { id: "19", name: "Science & Technology", slug: "science", viewers: 6500, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/509670-285x380.jpg", tags: ["Educational", "Innovation"] },
  { id: "20", name: "Food & Drink", slug: "food", viewers: 5500, thumbnail: "https://static-cdn.jtvnw.net/ttv-boxart/509667-285x380.jpg", tags: ["Cooking", "Dining"] },
];

const avatarBase = "https://api.dicebear.com/9.x/adventurer/svg?seed=";

export const MOCK_CHANNELS: StreamChannel[] = [
  // 24/7 reliable YouTube livestreams for fallback
  {
    id: "yt-live-lofigirl",
    username: "Lofi Girl",
    displayName: "Lofi Girl",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_k2D-SdcWzGqf9y9c9qgD_4b4d_5e5f5g6h=s176-c-k-c0x00ffffff-no-rj",
    title: "lofi hip hop radio 📚 - beats to relax/study to",
    category: "Music",
    categorySlug: "music",
    viewers: 32000,
    thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
    isLive: true,
    tags: ["Lofi", "Music", "Chill"],
    platform: "youtube",
    streamUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
  },
  {
    id: "yt-live-nasa",
    username: "NASA",
    displayName: "NASA Live",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_k2D-SdcWzGqf9y9c9qgD_4b4d_5e5f5g6h=s176-c-k-c0x00ffffff-no-rj",
    title: "NASA Live: Official Stream of NASA TV",
    category: "Science & Technology",
    categorySlug: "science",
    viewers: 8500,
    thumbnail: "https://i.ytimg.com/vi/21X5lGlDOfg/maxresdefault.jpg",
    isLive: true,
    tags: ["Space", "Educational"],
    platform: "youtube",
    streamUrl: "https://www.youtube.com/watch?v=21X5lGlDOfg"
  },
  {
    id: "tw-live-monstercat",
    username: "tw-monstercat",
    displayName: "Monstercat",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/monstercat-profile_image-3e109d75f8413319-300x300.jpeg",
    title: "Monstercat TV - 24/7 Electronic Music",
    category: "Music",
    categorySlug: "music",
    viewers: 1200,
    thumbnail: "https://static-cdn.jtvnw.net/previews-ttv/live_user_monstercat-640x360.jpg",
    isLive: true,
    tags: ["Music", "EDM", "24/7"],
    platform: "twitch",
    streamUrl: "https://www.twitch.tv/monstercat"
  }
];

export const FEATURED_STREAM = MOCK_CHANNELS[0];

export function formatViewerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
