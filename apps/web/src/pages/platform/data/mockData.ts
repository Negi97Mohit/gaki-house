// Platform type definitions and constants
// ZERO mock data — all real data comes from Supabase/Firebase

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

export interface PlatformMeta {
  label: string;
  color: string;
  textColor: string;
  category: "major" | "gaming" | "professional" | "selfhosted" | "asia";
}

export interface StreamDestination {
  platform: PlatformType;
  isLive: boolean;
  externalUrl?: string;
  externalViewers?: number;
}

export interface GakiStreamer {
  uid: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  isLive: boolean;
  streamTitle: string;
  category: string;
  startedAt: string;
  viewerCount: number;
  thumbnailUrl: string;
  destinations: StreamDestination[];
  tags: string[];
  isVerified: boolean;
  followers: number;
}

export const PLATFORM_META: Record<PlatformType, PlatformMeta> = {
  youtube: { label: "YouTube", color: "#FF0000", textColor: "#fff", category: "major" },
  twitch: { label: "Twitch", color: "#9146FF", textColor: "#fff", category: "major" },
  facebook: { label: "Facebook Live", color: "#1877F2", textColor: "#fff", category: "major" },
  tiktok: { label: "TikTok Live", color: "#000000", textColor: "#fff", category: "major" },
  instagram: { label: "Instagram Live", color: "#E4405F", textColor: "#fff", category: "major" },
  x: { label: "X Live", color: "#000000", textColor: "#fff", category: "major" },
  linkedin: { label: "LinkedIn Live", color: "#0A66C2", textColor: "#fff", category: "major" },
  kick: { label: "Kick", color: "#53FC18", textColor: "#000", category: "gaming" },
  rumble: { label: "Rumble", color: "#85C742", textColor: "#000", category: "gaming" },
  dlive: { label: "DLive", color: "#FFD300", textColor: "#000", category: "gaming" },
  trovo: { label: "Trovo", color: "#19D65C", textColor: "#fff", category: "gaming" },
  bilibili: { label: "Bilibili", color: "#00A1D6", textColor: "#fff", category: "asia" },
  nimotv: { label: "Nimo TV", color: "#EE3C49", textColor: "#fff", category: "asia" },
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
  owncast: { label: "Owncast", color: "#7C3AED", textColor: "#fff", category: "selfhosted" },
  peertube: { label: "PeerTube", color: "#F1680D", textColor: "#fff", category: "selfhosted" },
  nginx: { label: "NGINX-RTMP", color: "#009639", textColor: "#fff", category: "selfhosted" },
  wowzaserver: { label: "Wowza Server", color: "#F37021", textColor: "#fff", category: "selfhosted" },
  antmedia: { label: "Ant Media", color: "#00D4FF", textColor: "#000", category: "selfhosted" },
  red5: { label: "Red5", color: "#D32F2F", textColor: "#fff", category: "selfhosted" },
  mediasoup: { label: "MediaSoup", color: "#4CAF50", textColor: "#fff", category: "selfhosted" },
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
  chingari: { label: "Chingari", color: "#A83636", textColor: "#fff", category: "asia" },
};

export const PLATFORM_CATEGORY_LABELS: Record<string, string> = {
  major: "Popular",
  gaming: "Gaming",
  professional: "Professional",
  selfhosted: "Self-Hosted",
  asia: "Asia & Regional",
};

export function formatViewerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
