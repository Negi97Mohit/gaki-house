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

export const MOCK_CHANNELS: StreamChannel[] = [
  // ═══════════════════════════════════════
  //  MAJOR PLATFORMS
  // ═══════════════════════════════════════

  // ── YouTube ──
  {
    id: "1", username: "amplified", displayName: "Amplified", avatar: `${avatarBase}amplified`,
    title: "🔴 Late Night Chill Stream | !links !throne", category: "Just Chatting", categorySlug: "just-chatting",
    viewers: 198, thumbnail: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=640&h=360&fit=crop",
    isLive: true, tags: ["english", "vtuber", "gaming"], isVerified: true, followers: 42300,
    bio: "Full-time streamer. Gaming & chatting every day.",
    streamUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk", platform: "youtube"
  },
  {
    id: "2", username: "nasa", displayName: "NASA", avatar: `${avatarBase}nasa`,
    title: "Official NASA Stream 🚀", category: "Education", categorySlug: "education",
    viewers: 12500, thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&h=360&fit=crop",
    isLive: true, tags: ["science", "space", "official"], followers: 5800000,
    bio: "Exploring the secrets of the universe.",
    streamUrl: "https://www.youtube.com/watch?v=21X5lGlDOfg", platform: "youtube"
  },
  {
    id: "7", username: "eurogamer", displayName: "Eurogamer", avatar: `${avatarBase}eurogamer`,
    title: "Latest Game Reviews & News", category: "Just Chatting", categorySlug: "just-chatting",
    viewers: 1200, thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=640&h=360&fit=crop",
    isLive: true, tags: ["news", "reviews", "discussion"], isVerified: true, followers: 89000,
    bio: "Video game reviews, news, previews.",
    streamUrl: "https://www.youtube.com/watch?v=9Auq9mYxFEE", platform: "youtube"
  },
  {
    id: "8", username: "bloomberg", displayName: "Bloomberg TV", avatar: `${avatarBase}bloomberg`,
    title: "Global Financial News", category: "Podcasts", categorySlug: "podcasts",
    viewers: 5600, thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=640&h=360&fit=crop",
    isLive: true, tags: ["news", "finance", "business"], isVerified: true, followers: 2300000,
    bio: "Global business and financial news.",
    streamUrl: "https://www.youtube.com/watch?v=dp8PhLsUcFE", platform: "youtube"
  },

  // ── Twitch ──
  {
    id: "3", username: "monstercat", displayName: "Monstercat", avatar: `${avatarBase}monstercat`,
    title: "Monstercat Radio - 24/7 Music 🎵", category: "Music", categorySlug: "music",
    viewers: 2200, thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=640&h=360&fit=crop",
    isLive: true, tags: ["music", "edm", "radio"], isVerified: true, followers: 850000,
    bio: "Non-stop electronic music radio.",
    streamUrl: "https://www.twitch.tv/monstercat", platform: "twitch"
  },
  {
    id: "4", username: "chess", displayName: "Chess", avatar: `${avatarBase}chess`,
    title: "International Chess Championship", category: "Sports", categorySlug: "sports",
    viewers: 15400, thumbnail: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=640&h=360&fit=crop",
    isLive: true, tags: ["strategy", "tournament", "official"], followers: 1200000,
    bio: "Official broadcast of top-level chess.",
    streamUrl: "https://www.twitch.tv/chess", platform: "twitch"
  },
  {
    id: "5", username: "riotgames", displayName: "Riot Games", avatar: `${avatarBase}riot`,
    title: "LCS - League Championship Series", category: "League of Legends", categorySlug: "league-of-legends",
    viewers: 86000, thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop",
    isLive: true, tags: ["esports", "tournament", "official"], isVerified: true, followers: 6400000,
    bio: "The official home of LoL Esports.",
    streamUrl: "https://www.twitch.tv/riotgames", platform: "twitch"
  },
  {
    id: "6", username: "shroud", displayName: "shroud", avatar: `${avatarBase}shroud`,
    title: "Just chilling in Valorant", category: "VALORANT", categorySlug: "valorant",
    viewers: 32000, thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=640&h=360&fit=crop",
    isLive: true, tags: ["fps", "pro", "english"], isVerified: true, followers: 10800000,
    bio: "FPS Legend.", streamUrl: "https://www.twitch.tv/shroud", platform: "twitch"
  },

  // ── Facebook Live ──
  {
    id: "17", username: "fbcorinna", displayName: "Corinna Kopf", avatar: `${avatarBase}corinna`,
    title: "Fortnite w/ Friends 🎮", category: "Fortnite", categorySlug: "fortnite",
    viewers: 19200, thumbnail: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=640&h=360&fit=crop",
    isLive: true, tags: ["gaming", "battle royale", "english"], isVerified: true, followers: 4200000,
    bio: "Gamer, creator, vibes.", platform: "facebook"
  },
  {
    id: "18", username: "fbcomedyhub", displayName: "Comedy Hub", avatar: `${avatarBase}comedy`,
    title: "Stand-Up Open Mic Night 😂", category: "Comedy", categorySlug: "comedy",
    viewers: 6700, thumbnail: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=640&h=360&fit=crop",
    isLive: true, tags: ["comedy", "entertainment", "live"], followers: 320000,
    bio: "Laughs every single night.", platform: "facebook"
  },

  // ── TikTok Live ──
  {
    id: "30", username: "tiktoklive_dj", displayName: "DJ Frequencies", avatar: `${avatarBase}tikdj`,
    title: "🎧 Live DJ Set — EDM Party", category: "Music", categorySlug: "music",
    viewers: 41000, thumbnail: "https://images.unsplash.com/photo-1571266028243-d220cd703426?w=640&h=360&fit=crop",
    isLive: true, tags: ["music", "dj", "edm"], isVerified: true, followers: 9800000,
    bio: "Live DJ sets from around the world.", platform: "tiktok"
  },
  {
    id: "31", username: "tiktok_cook", displayName: "Chef Mama", avatar: `${avatarBase}chefmama`,
    title: "Quick 15-Min Recipes LIVE 🍳", category: "Cooking", categorySlug: "cooking",
    viewers: 28000, thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640&h=360&fit=crop",
    isLive: true, tags: ["cooking", "food", "recipes"], followers: 5400000,
    bio: "Easy meals, fast and fresh.", platform: "tiktok"
  },

  // ── Instagram Live ──
  {
    id: "32", username: "igfitpro", displayName: "FitPro Sarah", avatar: `${avatarBase}fitpro`,
    title: "Morning Yoga & Stretch 🧘‍♀️", category: "Fitness & Health", categorySlug: "fitness",
    viewers: 15600, thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&h=360&fit=crop",
    isLive: true, tags: ["fitness", "yoga", "health"], isVerified: true, followers: 3200000,
    bio: "Daily live workouts.", platform: "instagram"
  },
  {
    id: "33", username: "igartist", displayName: "ArtFlow Studio", avatar: `${avatarBase}artflow`,
    title: "Painting a Sunset — Live Art 🎨", category: "Art", categorySlug: "art",
    viewers: 4800, thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=640&h=360&fit=crop",
    isLive: true, tags: ["art", "creative", "painting"], followers: 890000,
    bio: "Live art sessions daily.", platform: "instagram"
  },

  // ── X Live ──
  {
    id: "20", username: "elonx", displayName: "Elon Musk", avatar: `${avatarBase}elon`,
    title: "SpaceX Starship Test Flight 🚀", category: "Education", categorySlug: "education",
    viewers: 245000, thumbnail: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=640&h=360&fit=crop",
    isLive: true, tags: ["space", "tech", "live"], isVerified: true, followers: 170000000,
    bio: "Mars, and beyond.", platform: "x"
  },
  {
    id: "21", username: "xnewslive", displayName: "X News Live", avatar: `${avatarBase}xnews`,
    title: "Breaking News — 24/7 Coverage", category: "Podcasts", categorySlug: "podcasts",
    viewers: 18400, thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=640&h=360&fit=crop",
    isLive: true, tags: ["news", "breaking", "live"], isVerified: true, followers: 5600000,
    bio: "News as it happens.", platform: "x"
  },

  // ── LinkedIn Live ──
  {
    id: "34", username: "linkedinbiz", displayName: "StartupGrind", avatar: `${avatarBase}startup`,
    title: "How to Raise Seed Funding in 2024 💼", category: "Education", categorySlug: "education",
    viewers: 3200, thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=640&h=360&fit=crop",
    isLive: true, tags: ["business", "startup", "education"], isVerified: true, followers: 1200000,
    bio: "Weekly live fireside chats with founders.", platform: "linkedin"
  },
  {
    id: "35", username: "linkedinhr", displayName: "HR Insider", avatar: `${avatarBase}hrinsider`,
    title: "Hiring Trends 2024 Panel Discussion", category: "Podcasts", categorySlug: "podcasts",
    viewers: 1800, thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&h=360&fit=crop",
    isLive: true, tags: ["hr", "careers", "panel"], followers: 450000,
    bio: "Your insider view into modern HR.", platform: "linkedin"
  },

  // ═══════════════════════════════════════
  //  GAMING PLATFORMS
  // ═══════════════════════════════════════

  // ── Kick ──
  {
    id: "11", username: "adin", displayName: "Adin Ross", avatar: `${avatarBase}adin`,
    title: "W STREAM 🔥 | Reacting & Gaming", category: "Just Chatting", categorySlug: "just-chatting",
    viewers: 62000, thumbnail: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=640&h=360&fit=crop",
    isLive: true, tags: ["entertainment", "reactions", "english"], isVerified: true, followers: 8900000,
    bio: "Content creator & streamer.", platform: "kick"
  },
  {
    id: "12", username: "trainwreck", displayName: "Trainwreck", avatar: `${avatarBase}trainwreck`,
    title: "Late Night Podcast & Chatting", category: "Podcasts", categorySlug: "podcasts",
    viewers: 28500, thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=640&h=360&fit=crop",
    isLive: true, tags: ["podcast", "talk show", "english"], isVerified: true, followers: 2100000,
    bio: "Real talk, no filter.", platform: "kick"
  },

  // ── Rumble ──
  {
    id: "14", username: "russellbrand", displayName: "Russell Brand", avatar: `${avatarBase}russell`,
    title: "Stay Free — Daily Discussion", category: "Podcasts", categorySlug: "podcasts",
    viewers: 34000, thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=640&h=360&fit=crop",
    isLive: true, tags: ["discussion", "english"], isVerified: true, followers: 3500000,
    bio: "Awakening through conversation.", platform: "rumble"
  },
  {
    id: "16", username: "rumblefitness", displayName: "FitStream", avatar: `${avatarBase}fitstream`,
    title: "Morning HIIT Workout 💪", category: "Fitness & Health", categorySlug: "fitness",
    viewers: 7800, thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640&h=360&fit=crop",
    isLive: true, tags: ["fitness", "workout", "health"], followers: 280000,
    bio: "Daily live workouts for everyone.", platform: "rumble"
  },

  // ── DLive ──
  {
    id: "36", username: "dlivepewds", displayName: "PewDiePie Archive", avatar: `${avatarBase}pewds`,
    title: "Minecraft Survival Marathon 🌍", category: "Minecraft", categorySlug: "minecraft",
    viewers: 8400, thumbnail: "https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?w=640&h=360&fit=crop",
    isLive: true, tags: ["minecraft", "gaming", "survival"], followers: 2100000,
    bio: "Gaming marathon streams.", platform: "dlive"
  },
  {
    id: "37", username: "dlivecrypto", displayName: "CryptoLive", avatar: `${avatarBase}cryptolive`,
    title: "Live Market Analysis — BTC & ETH", category: "Education", categorySlug: "education",
    viewers: 3200, thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&h=360&fit=crop",
    isLive: true, tags: ["crypto", "finance", "analysis"], followers: 340000,
    bio: "Your live crypto desk.", platform: "dlive"
  },

  // ── Trovo ──
  {
    id: "38", username: "trovogamer", displayName: "TrovoElite", avatar: `${avatarBase}trovoelite`,
    title: "Dota 2 Ranked Grind 🏆", category: "Dota 2", categorySlug: "dota-2",
    viewers: 5600, thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=640&h=360&fit=crop",
    isLive: true, tags: ["dota2", "moba", "ranked"], followers: 180000,
    bio: "Trovo's top Dota 2 player.", platform: "trovo"
  },
  {
    id: "39", username: "trovoirl", displayName: "Trovo IRL", avatar: `${avatarBase}trovoirl`,
    title: "Street Food Tour — Bangkok 🍜", category: "Travel & Outdoors", categorySlug: "travel",
    viewers: 2100, thumbnail: "https://images.unsplash.com/photo-1488646472560-ec4b578e2e5b?w=640&h=360&fit=crop",
    isLive: true, tags: ["irl", "travel", "food"], followers: 95000,
    bio: "Exploring cities around the world.", platform: "trovo"
  },

  // ── Bilibili ──
  {
    id: "40", username: "bligenshin", displayName: "Genshin Impact CN", avatar: `${avatarBase}genshin`,
    title: "Genshin Impact — New Patch Showcase", category: "IRL", categorySlug: "irl",
    viewers: 45000, thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&h=360&fit=crop",
    isLive: true, tags: ["gaming", "rpg", "genshin"], isVerified: true, followers: 7800000,
    bio: "Official Genshin Impact community stream.", platform: "bilibili"
  },
  {
    id: "41", username: "blianime", displayName: "Anime Hour", avatar: `${avatarBase}animehour`,
    title: "Anime Discussion & Reactions 🎌", category: "Just Chatting", categorySlug: "just-chatting",
    viewers: 12600, thumbnail: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=640&h=360&fit=crop",
    isLive: true, tags: ["anime", "discussion", "reactions"], followers: 1400000,
    bio: "Your daily anime discussion.", platform: "bilibili"
  },

  // ── Nimo TV ──
  {
    id: "42", username: "nimomobile", displayName: "MobileKing", avatar: `${avatarBase}mobileking`,
    title: "Mobile Legends Live Ranked 📱", category: "IRL", categorySlug: "irl",
    viewers: 18000, thumbnail: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=640&h=360&fit=crop",
    isLive: true, tags: ["mobile gaming", "moba", "ranked"], isVerified: true, followers: 3400000,
    bio: "Top Mobile Legends player.", platform: "nimotv"
  },
  {
    id: "43", username: "nimocodm", displayName: "CODM Pro", avatar: `${avatarBase}codmpro`,
    title: "Call of Duty Mobile — Tournament", category: "VALORANT", categorySlug: "valorant",
    viewers: 9500, thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop",
    isLive: true, tags: ["fps", "mobile", "tournament"], followers: 890000,
    bio: "CODM esports content.", platform: "nimotv"
  },

  // ═══════════════════════════════════════
  //  PROFESSIONAL PLATFORMS
  // ═══════════════════════════════════════

  // ── Vimeo ──
  {
    id: "44", username: "vimeofilm", displayName: "IndieFest", avatar: `${avatarBase}indiefest`,
    title: "Indie Film Showcase 2024 🎬", category: "Art", categorySlug: "art",
    viewers: 4200, thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=640&h=360&fit=crop",
    isLive: true, tags: ["film", "indie", "creative"], isVerified: true, followers: 560000,
    bio: "Showcasing independent films.", platform: "vimeo"
  },

  // ── VK Live ──
  {
    id: "45", username: "vkmusic", displayName: "VK Music Stage", avatar: `${avatarBase}vkmusic`,
    title: "Live Concert — Russian Pop 🎤", category: "Music", categorySlug: "music",
    viewers: 22000, thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=640&h=360&fit=crop",
    isLive: true, tags: ["music", "concert", "live"], followers: 4500000,
    bio: "Live concerts from VK.", platform: "vk"
  },

  // ── Mixcloud ──
  {
    id: "46", username: "mixdeep", displayName: "DeepHouse FM", avatar: `${avatarBase}deephouse`,
    title: "Deep House Radio — Chill Vibes 🎶", category: "Music", categorySlug: "music",
    viewers: 3800, thumbnail: "https://images.unsplash.com/photo-1571266028243-d220cd703426?w=640&h=360&fit=crop",
    isLive: true, tags: ["music", "deep house", "radio"], followers: 280000,
    bio: "24/7 deep house music.", platform: "mixcloud"
  },

  // ── Brightcove ──
  {
    id: "47", username: "bcwebinar", displayName: "TechSummit", avatar: `${avatarBase}techsummit`,
    title: "Enterprise AI Strategy Webinar", category: "Education", categorySlug: "education",
    viewers: 1500, thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=640&h=360&fit=crop",
    isLive: true, tags: ["tech", "enterprise", "ai"], isVerified: true, followers: 120000,
    bio: "Enterprise tech events.", platform: "brightcove"
  },

  // ── JW Player ──
  {
    id: "48", username: "jwsports", displayName: "LiveSports HD", avatar: `${avatarBase}jwsports`,
    title: "UEFA Match Day Highlights ⚽", category: "Sports", categorySlug: "sports",
    viewers: 8900, thumbnail: "https://images.unsplash.com/photo-1461896836934-bd45ba0c2064?w=640&h=360&fit=crop",
    isLive: true, tags: ["sports", "football", "live"], followers: 670000,
    bio: "Live sports streaming.", platform: "jwplayer"
  },

  // ── Kaltura ──
  {
    id: "49", username: "kalturalms", displayName: "EduStream", avatar: `${avatarBase}lmsstream`,
    title: "University Lecture — Computer Science", category: "Education", categorySlug: "education",
    viewers: 820, thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=640&h=360&fit=crop",
    isLive: true, tags: ["education", "lecture", "cs"], followers: 45000,
    bio: "Live university lectures.", platform: "kaltura"
  },

  // ── IBM Video ──
  {
    id: "50", username: "ibmcloud", displayName: "IBM Think", avatar: `${avatarBase}ibmthink`,
    title: "IBM Think Conference — Keynote", category: "Education", categorySlug: "education",
    viewers: 6200, thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=640&h=360&fit=crop",
    isLive: true, tags: ["tech", "conference", "enterprise"], isVerified: true, followers: 890000,
    bio: "IBM conference streams.", platform: "ibm"
  },

  // ── Wowza Cloud ──
  {
    id: "51", username: "wowzacorp", displayName: "CorporateLive", avatar: `${avatarBase}corpstream`,
    title: "Annual Investor Meeting", category: "Podcasts", categorySlug: "podcasts",
    viewers: 540, thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&h=360&fit=crop",
    isLive: true, tags: ["business", "corporate", "meeting"], followers: 12000,
    bio: "Corporate event streaming.", platform: "wowza"
  },

  // ── Mux Live ──
  {
    id: "52", username: "muxdevstream", displayName: "DevStream", avatar: `${avatarBase}devstream`,
    title: "Building a Video Platform — Live 💻", category: "Programming", categorySlug: "programming",
    viewers: 2400, thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=640&h=360&fit=crop",
    isLive: true, tags: ["programming", "dev", "video"], followers: 78000,
    bio: "Live coding with Mux.", platform: "mux"
  },

  // ── Amazon IVS ──
  {
    id: "53", username: "awstwitch", displayName: "AWS re:Invent", avatar: `${avatarBase}awsreinvent`,
    title: "AWS re:Invent Keynote Live 🌩️", category: "Education", categorySlug: "education",
    viewers: 35000, thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&h=360&fit=crop",
    isLive: true, tags: ["aws", "cloud", "conference"], isVerified: true, followers: 2800000,
    bio: "AWS conference live streams.", platform: "aws"
  },

  // ═══════════════════════════════════════
  //  SELF-HOSTED PLATFORMS
  // ═══════════════════════════════════════

  // ── Owncast ──
  {
    id: "54", username: "owncastcommunity", displayName: "LibreStream", avatar: `${avatarBase}librestream`,
    title: "Open Source Dev Night 🐧", category: "Programming", categorySlug: "programming",
    viewers: 340, thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=640&h=360&fit=crop",
    isLive: true, tags: ["opensource", "linux", "dev"], followers: 12000,
    bio: "Self-hosted open source streams.", platform: "owncast"
  },

  // ── PeerTube ──
  {
    id: "55", username: "peertubehost", displayName: "Federated TV", avatar: `${avatarBase}fedtv`,
    title: "Decentralized Web — Panel Discussion", category: "Education", categorySlug: "education",
    viewers: 480, thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&h=360&fit=crop",
    isLive: true, tags: ["decentralized", "web3", "panel"], followers: 8500,
    bio: "Federated streaming for everyone.", platform: "peertube"
  },

  // ── NGINX-RTMP ──
  {
    id: "56", username: "nginxdemos", displayName: "HomeLabTV", avatar: `${avatarBase}homelab`,
    title: "Setting Up RTMP from Scratch 🔧", category: "Programming", categorySlug: "programming",
    viewers: 220, thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=640&h=360&fit=crop",
    isLive: true, tags: ["devops", "streaming", "tutorial"], followers: 4500,
    bio: "Self-hosted streaming tutorials.", platform: "nginx"
  },

  // ── Wowza Server ──
  {
    id: "57", username: "wowzaengineer", displayName: "MediaOps", avatar: `${avatarBase}mediaops`,
    title: "Wowza Server Configuration Live", category: "Programming", categorySlug: "programming",
    viewers: 180, thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=640&h=360&fit=crop",
    isLive: true, tags: ["infra", "streaming", "devops"], followers: 3200,
    bio: "Enterprise streaming ops.", platform: "wowzaserver"
  },

  // ── Ant Media ──
  {
    id: "58", username: "antmedialive", displayName: "AntMedia Demo", avatar: `${avatarBase}antdemo`,
    title: "Low-Latency WebRTC Demo 📡", category: "Programming", categorySlug: "programming",
    viewers: 290, thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=640&h=360&fit=crop",
    isLive: true, tags: ["webrtc", "lowlatency", "demo"], followers: 6700,
    bio: "Ant Media Server demonstrations.", platform: "antmedia"
  },

  // ── Red5 ──
  {
    id: "59", username: "red5labs", displayName: "Red5 Labs", avatar: `${avatarBase}red5lab`,
    title: "Red5 Pro — Scalability Deep Dive", category: "Education", categorySlug: "education",
    viewers: 150, thumbnail: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=640&h=360&fit=crop",
    isLive: true, tags: ["streaming", "enterprise", "tech"], followers: 2800,
    bio: "Red5 platform demos.", platform: "red5"
  },

  // ── MediaSoup ──
  {
    id: "60", username: "mediasoupdev", displayName: "MediaSoup Dev", avatar: `${avatarBase}msdev`,
    title: "SFU Architecture — Live Coding 🖥️", category: "Programming", categorySlug: "programming",
    viewers: 410, thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=640&h=360&fit=crop",
    isLive: true, tags: ["mediasoup", "sfu", "webrtc"], followers: 9200,
    bio: "MediaSoup live dev sessions.", platform: "mediasoup"
  },
];

export const FEATURED_STREAM = MOCK_CHANNELS[0];

export function formatViewerCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
