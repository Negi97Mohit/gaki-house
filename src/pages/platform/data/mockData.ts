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

export const MOCK_CHANNELS: StreamChannel[] = [
  // China
  {
    id: "bilibili-1",
    username: "BV1xx411c7X7", // Example Bilibili Video ID
    displayName: "Bilibili Gaming",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=bili",
    title: "Genshin Impact Version 4.0 Trailer",
    category: "Gaming",
    categorySlug: "gaming",
    viewers: 154200,
    thumbnail: "https://images.unsplash.com/photo-1578357078586-491fab1488ce?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Anime", "RPG"],
    platform: "bilibili",
    streamUrl: "//player.bilibili.com/player.html?bvid=BV1xx411c7X7"
  },
  {
    id: "douyu-1",
    username: "douyu-123",
    displayName: "Douyu Star",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=douyu",
    title: "League of Legends LPL Spring Split",
    category: "League of Legends",
    categorySlug: "league-of-legends",
    viewers: 520000,
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Esports", "LPL"],
    platform: "douyu",
    streamUrl: "https://www.douyu.com/123"
  },
  {
    id: "huya-1",
    username: "huya-456",
    displayName: "Huya Top",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=huya",
    title: "Honor of Kings Championship",
    category: "Mobile Games",
    categorySlug: "gaming",
    viewers: 340000,
    thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Mobile", "MOBA"],
    platform: "huya",
    streamUrl: "https://www.huya.com/456"
  },

  // Japan
  {
    id: "nico-1",
    username: "sm9", // Classic placeholder
    displayName: "Niconico User",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=nico",
    title: "Lets Play! Super Mario",
    category: "Retro",
    categorySlug: "gaming",
    viewers: 12000,
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Retro", "Mario"],
    platform: "niconico",
    streamUrl: "https://www.nicovideo.jp/watch/sm9"
  },
  {
    id: "showroom-1",
    username: "showroom-live",
    displayName: "Idol Room",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=show",
    title: "Live Concert & Chat",
    category: "Music",
    categorySlug: "music",
    viewers: 8500,
    thumbnail: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Idol", "Music"],
    platform: "showroom",
    streamUrl: "https://www.showroom-live.com/"
  },

  // Korea
  {
    id: "afreeca-1",
    username: "afreeca-best",
    displayName: "Pro Gamer KR",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=afreeca",
    title: "StarCraft Remastered Ladder",
    category: "StarCraft",
    categorySlug: "gaming",
    viewers: 45000,
    thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["RTS", "Korean"],
    platform: "afreecatv",
    streamUrl: "https://play.afreecatv.com/"
  },
  {
    id: "naver-1",
    username: "naver-now",
    displayName: "K-Pop Now",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=naver",
    title: "Exclusive Interview with BTS",
    category: "Music",
    categorySlug: "music",
    viewers: 890000,
    thumbnail: "https://images.unsplash.com/photo-1493224272406-fa4ec81bd436?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["K-Pop", "Interview"],
    platform: "navernow",
    streamUrl: "https://now.naver.com/"
  },

  // SEA / India
  {
    id: "nimo-1",
    username: "nimo-gta",
    displayName: "Nimo Gamer",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=nimo",
    title: "GTA V Roleplay Server",
    category: "GTA V",
    categorySlug: "gta-v",
    viewers: 25000,
    thumbnail: "https://images.unsplash.com/photo-1596727147705-54a7156f0ae3?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["RP", "SEA"],
    platform: "nimotv",
    streamUrl: "https://www.nimo.tv/"
  },
  {
    id: "rooter-1",
    username: "rooter-bgmi",
    displayName: "Rooter Esports",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=rooter",
    title: "BGMI Tournament Finals",
    category: "Mobile Games",
    categorySlug: "gaming",
    viewers: 110000,
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["BGMI", "India"],
    platform: "rooter",
    streamUrl: "https://www.rooter.gg/"
  },
  {
    id: "loco-1",
    username: "loco-stream",
    displayName: "Loco Legends",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=loco",
    title: "Valorant India Cup",
    category: "Valorant",
    categorySlug: "valorant",
    viewers: 35000,
    thumbnail: "https://images.unsplash.com/photo-1624138784181-dc7f5b75e52e?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["FPS", "Tournament"],
    platform: "loco",
    streamUrl: "https://loco.gg/"
  }
];

export const FEATURED_STREAM = null;

export function formatViewerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
