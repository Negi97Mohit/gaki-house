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
  // --- MAJOR PLATFORMS ---

  // YouTube Live
  {
    id: "yt-live-lofigirl",
    username: "Lofi Girl",
    displayName: "Lofi Girl",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_k2D-SdcWzGqf9y9c9qgD_4b4d_5e5f5g6h=s176-c-k-c0x00ffffff-no-rj",
    title: "lofi hip hop radio 📚 - beats to relax/study to",
    category: "Music",
    categorySlug: "music",
    viewers: 45000,
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
    viewers: 12000,
    thumbnail: "https://i.ytimg.com/vi/21X5lGlDOfg/maxresdefault.jpg",
    isLive: true,
    tags: ["Space", "Educational"],
    platform: "youtube",
    streamUrl: "https://www.youtube.com/watch?v=21X5lGlDOfg"
  },
  {
    id: "yt-live-eurovision",
    username: "Eurovision",
    displayName: "Eurovision Song Contest",
    avatar: "https://yt3.googleusercontent.com/ytc/AIdro_k2D-SdcWzGqf9y9c9qgD_4b4d_5e5f5g6h=s176-c-k-c0x00ffffff-no-rj",
    title: "Eurovision Song Contest 2024 - Grand Final",
    category: "Music",
    categorySlug: "music",
    viewers: 150000,
    thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Music", "Event"],
    platform: "youtube",
    streamUrl: "https://www.youtube.com/watch?v=HuW3c4A5_9c"
  },


  // Twitch
  {
    id: "tw-twitchgaming",
    username: "twitchgaming",
    displayName: "twitchgaming",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/075421df-6e99-4c12-a8d2-45e0d7c71f92-profile_image-70x70.png",
    title: "Weekly Gaming Show",
    category: "Gaming",
    categorySlug: "gaming",
    viewers: 15000,
    thumbnail: "https://static-cdn.jtvnw.net/jtv_user_pictures/075421df-6e99-4c12-a8d2-45e0d7c71f92-profile_image-300x300.png",
    isLive: true,
    tags: ["Gaming", "Talk"],
    platform: "twitch",
    streamUrl: "https://www.twitch.tv/twitchgaming"
  },
  {
    id: "tw-riotgames",
    username: "riotgames",
    displayName: "Riot Games",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/riotgames-profile_image-4238599298-70x70.jpeg",
    title: "LCS Spring Split 2025",
    category: "League of Legends",
    categorySlug: "league-of-legends",
    viewers: 85000,
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Esports", "LoL"],
    platform: "twitch",
    streamUrl: "https://www.twitch.tv/riotgames"
  },

  // Facebook Gaming
  {
    id: "fb-gaming-1",
    username: "FacebookGaming",
    displayName: "Facebook Gaming",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=fb",
    title: "Level Up: Creator Showcase",
    category: "Gaming",
    categorySlug: "gaming",
    viewers: 5000,
    thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Gaming", "Creator"],
    platform: "facebook",
    streamUrl: "https://www.facebook.com/Gaming/videos/123456789"
  },
  {
    id: "fb-gaming-2",
    username: "StoneMountain64",
    displayName: "StoneMountain64",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=stone",
    title: "Warzone Victory Lap",
    category: "Call of Duty: Warzone",
    categorySlug: "cod-warzone",
    viewers: 12000,
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["FPS", "Battle Royale"],
    platform: "facebook",
    streamUrl: "https://www.facebook.com/StoneMountain64/live"
  },


  // TikTok Live
  {
    id: "tt-live-1",
    username: "tiktok-live-us",
    displayName: "TikTok Live US",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=tt",
    title: "Trending NOW: Dance Challenge",
    category: "Just Chatting",
    categorySlug: "just-chatting",
    viewers: 25000,
    thumbnail: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Mobile", "Vertical"],
    platform: "tiktok",
    streamUrl: "https://www.tiktok.com/@tiktoklive_us/live"
  },

  // X (Twitter)
  {
    id: "x-live-space",
    username: "SpaceX",
    displayName: "SpaceX",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=x",
    title: "Starship Flight Test Launch",
    category: "Science & Technology",
    categorySlug: "science",
    viewers: 200000,
    thumbnail: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Space", "Launch"],
    platform: "x",
    streamUrl: "https://twitter.com/i/broadcasts/123456789"
  },

  // --- GAMING PLATFORMS ---

  // Kick
  {
    id: "kick-xqc",
    username: "xqc",
    displayName: "xQc",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=xqc",
    title: "JUICED | GIVING AWAY 100K | !GIVEAWAY",
    category: "Just Chatting",
    categorySlug: "just-chatting",
    viewers: 45000,
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Variety", "Reaction"],
    platform: "kick",
    streamUrl: "https://kick.com/xqc"
  },
  {
    id: "kick-train",
    username: "trainwreckstv",
    displayName: "Trainwreckstv",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=train",
    title: "High Rollers Table | !gamble",
    category: "Slots",
    categorySlug: "slots",
    viewers: 25000,
    thumbnail: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Gambling", "Slots"],
    platform: "kick",
    streamUrl: "https://kick.com/trainwreckstv"
  },

  // Rumble
  {
    id: "rumble-gaming",
    username: "rumblegaming",
    displayName: "Rumble Gaming",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=rumble",
    title: "Rumble Exclusives: Speedruns",
    category: "Gaming",
    categorySlug: "gaming",
    viewers: 5000,
    thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Speedrun", "Retro"],
    platform: "rumble",
    streamUrl: "https://rumble.com/embed/v12345/"
  },

  // Trovo
  {
    id: "trovo-pubg",
    username: "TrovoPUBG",
    displayName: "Trovo PUBG Mobile",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=trovo",
    title: "PUBG Mobile Pro League",
    category: "PUBG Mobile",
    categorySlug: "pubg-mobile",
    viewers: 15000,
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Mobile", "Battle Royale"],
    platform: "trovo",
    streamUrl: "https://trovo.live/TrovoPUBG"
  },

  // DLive
  {
    id: "dlive-crypto",
    username: "CryptoDaily",
    displayName: "Crypto Daily",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=dlive",
    title: "Market Analysis: BTC & ETH",
    category: "Crypto & Finance",
    categorySlug: "crypto",
    viewers: 2000,
    thumbnail: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Finance", "Blockchain"],
    platform: "dlive",
    streamUrl: "https://dlive.tv/CryptoDaily"
  },


  // --- PROFESSIONAL PLATFORMS ---

  // Vimeo
  {
    id: "vimeo-staffpick-1",
    username: "vimeo-staff",
    displayName: "Vimeo Staff Picks",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=vimeo",
    title: "Best of the Month: Animation",
    category: "Art",
    categorySlug: "art",
    viewers: 800,
    thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop",
    isLive: false,
    tags: ["Creative", "Animation"],
    platform: "vimeo",
    streamUrl: "https://vimeo.com/channels/staffpicks"
  },

  // IBM Video
  {
    id: "ibm-ustream",
    username: "nasa-iss",
    displayName: "ISS HD Earth Viewing",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=ibm",
    title: "ISS HD Earth Viewing Experiment",
    category: "Science & Technology",
    categorySlug: "science",
    viewers: 2500,
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Space", "Earth"],
    platform: "ibm",
    streamUrl: "https://video.ibm.com/channel/iss-hdev-payload"
  },


  // --- ASIA & REGIONAL ---
  // Bilibili
  {
    id: "bilibili-anime",
    username: "bilibili-official",
    displayName: "Bilibili Official",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=bili",
    title: "New Anime Season Trailers",
    category: "Anime",
    categorySlug: "art",
    viewers: 340000,
    thumbnail: "https://images.unsplash.com/photo-1578357078586-491fab1488ce?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Anime", "China"],
    platform: "bilibili",
    streamUrl: "https://www.bilibili.com/video/BV1xx411c7X7"
  },

  // Douyu
  {
    id: "douyu-lpl",
    username: "douyu-lpl",
    displayName: "LPL Official",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=douyu",
    title: "LPL: JDG vs BLG",
    category: "League of Legends",
    categorySlug: "league-of-legends",
    viewers: 1200000,
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Esports", "China"],
    platform: "douyu",
    streamUrl: "https://www.douyu.com/288016"
  },

  // Niconico
  {
    id: "nico-official",
    username: "nicovideo",
    displayName: "Niconico Official",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=nico",
    title: "Niconico Chokaigi 2024",
    category: "Events",
    categorySlug: "just-chatting",
    viewers: 56000,
    thumbnail: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Event", "Japan"],
    platform: "niconico",
    streamUrl: "https://www.nicovideo.jp/"
  },

  // AfreecaTV
  {
    id: "afreeca-lck",
    username: "lck-korea",
    displayName: "LCK Official",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=afreeca",
    title: "LCK Spring: T1 vs Gen.G",
    category: "League of Legends",
    categorySlug: "league-of-legends",
    viewers: 450000,
    thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Esports", "Korea"],
    platform: "afreecatv",
    streamUrl: "https://play.afreecatv.com/lck"
  },


  // --- SELF-HOSTED ---
  {
    id: "owncast-demo",
    username: "owncast-demo",
    displayName: "Owncast Demo",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=own",
    title: "Owncast Feature Showcase",
    category: "Technology",
    categorySlug: "science",
    viewers: 45,
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop",
    isLive: true,
    tags: ["Self-Hosted", "Open Source"],
    platform: "owncast",
    streamUrl: "https://watch.owncast.online/"
  },
  {
    id: "peertube-blender",
    username: "blender-foundation",
    displayName: "Blender Foundation",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=peer",
    title: "Blender Open Movies",
    category: "Art",
    categorySlug: "art",
    viewers: 120,
    thumbnail: "https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=800&h=450&fit=crop",
    isLive: false,
    tags: ["3D", "Open Source"],
    platform: "peertube",
    streamUrl: "https://video.blender.org/"
  }
];

export const FEATURED_STREAM = null;

export function formatViewerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
