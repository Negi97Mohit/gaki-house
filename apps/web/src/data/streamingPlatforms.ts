// src/data/streamingPlatforms.ts

export interface StreamingPlatform {
  id: string;
  name: string;
  category: 'major' | 'gaming' | 'professional' | 'selfhosted';
  color: string;
  icon: string; // SVG path or component
  rtmpUrl?: string;
  requiresOAuth?: boolean;
  comingSoon?: boolean;
}

export const STREAMING_PLATFORMS: StreamingPlatform[] = [
  // GAKI (This App)
  {
    id: 'gaki',
    name: 'GAKI',
    category: 'major',
    color: '#8B5CF6',
    icon: 'gaki',
    rtmpUrl: 'rtmp://live.gaki.app/stream/',
  },
  // Major Platforms
  {
    id: 'youtube',
    name: 'YouTube Live',
    category: 'major',
    color: '#FF0000',
    icon: 'youtube',
    requiresOAuth: true,
    rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    category: 'major',
    color: '#9146FF',
    icon: 'twitch',
    requiresOAuth: true,
    rtmpUrl: 'rtmp://live.twitch.tv/app/',
  },
  {
    id: 'facebook',
    name: 'Facebook Live',
    category: 'major',
    color: '#1877F2',
    icon: 'facebook',
    requiresOAuth: true,
    rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
  },
  {
    id: 'tiktok',
    name: 'TikTok Live',
    category: 'major',
    color: '#000000',
    icon: 'tiktok',
    requiresOAuth: true,
  },
  {
    id: 'instagram',
    name: 'Instagram Live',
    category: 'major',
    color: '#E4405F',
    icon: 'instagram',
    requiresOAuth: true,
    rtmpUrl: 'rtmps://live-upload.instagram.com:443/rtmp/',
  },
  {
    id: 'x',
    name: 'X Live',
    category: 'major',
    color: '#000000',
    icon: 'x',
    requiresOAuth: true,
    rtmpUrl: 'rtmps://va.pscp.tv:443/x/',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Live',
    category: 'major',
    color: '#0A66C2',
    icon: 'linkedin',
    requiresOAuth: true,
  },

  // Gaming Platforms
  {
    id: 'kick',
    name: 'Kick',
    category: 'gaming',
    color: '#53FC18',
    icon: 'kick',
    requiresOAuth: true,
  },
  {
    id: 'rumble',
    name: 'Rumble Live',
    category: 'gaming',
    color: '#85C742',
    icon: 'rumble',
    rtmpUrl: 'rtmp://live.rumble.com/live/',
    requiresOAuth: true,
  },
  {
    id: 'dlive',
    name: 'DLive',
    category: 'gaming',
    color: '#FFD300',
    icon: 'dlive',
    rtmpUrl: 'rtmp://stream.dlive.tv/live/',
    requiresOAuth: true,
  },
  {
    id: 'trovo',
    name: 'Trovo Live',
    category: 'gaming',
    color: '#19D65C',
    icon: 'trovo',
    rtmpUrl: 'rtmp://livepush.trovo.live/live/',
    requiresOAuth: true,
  },
  {
    id: 'bilibili',
    name: 'Bilibili Live',
    category: 'gaming',
    color: '#00A1D6',
    icon: 'bilibili',
    requiresOAuth: true,
    rtmpUrl: 'rtmp://live-push.bilivideo.com/live/',
  },
  {
    id: 'nimotv',
    name: 'Nimo TV',
    category: 'gaming',
    color: '#EE3C49',
    icon: 'nimotv',
    requiresOAuth: true,
  },

  // Professional Platforms
  {
    id: 'vimeo',
    name: 'Vimeo Live',
    category: 'professional',
    color: '#1AB7EA',
    icon: 'vimeo',
    requiresOAuth: true,
    rtmpUrl: 'rtmps://rtmp-global.cloud.vimeo.com/live',
  },
  {
    id: 'vk',
    name: 'VK Live',
    category: 'professional',
    color: '#0077FF',
    icon: 'vk',
    requiresOAuth: true,
    rtmpUrl: 'rtmp://ovsu.mycdn.me/input/',
  },
  {
    id: 'mixcloud',
    name: 'Mixcloud Live',
    category: 'professional',
    color: '#5000FF',
    icon: 'mixcloud',
    requiresOAuth: true,
    rtmpUrl: 'rtmp://rtmp.mixcloud.com/broadcast',
  },
  {
    id: 'brightcove',
    name: 'Brightcove',
    category: 'professional',
    color: '#FF6B00',
    icon: 'brightcove',
    requiresOAuth: true,
  },
  {
    id: 'jwplayer',
    name: 'JW Player',
    category: 'professional',
    color: '#FF0046',
    icon: 'jwplayer',
    requiresOAuth: true,
  },
  {
    id: 'kaltura',
    name: 'Kaltura',
    category: 'professional',
    color: '#00B4E8',
    icon: 'kaltura',
    requiresOAuth: true,
  },
  {
    id: 'ibm',
    name: 'IBM Video',
    category: 'professional',
    color: '#054ADA',
    icon: 'ibm',
    requiresOAuth: true,
  },
  {
    id: 'wowza',
    name: 'Wowza Cloud',
    category: 'professional',
    color: '#F37021',
    icon: 'wowza',
    requiresOAuth: true,
  },
  {
    id: 'mux',
    name: 'Mux Live',
    category: 'professional',
    color: '#FF2D55',
    icon: 'mux',
    requiresOAuth: true,
    rtmpUrl: 'rtmps://global-live.mux.com:443/app',
  },
  {
    id: 'aws',
    name: 'Amazon IVS',
    category: 'professional',
    color: '#FF9900',
    icon: 'aws',
    requiresOAuth: true,
  },

  // Self-Hosted
  {
    id: 'owncast',
    name: 'Owncast',
    category: 'selfhosted',
    color: '#7C3AED',
    icon: 'owncast',
  },
  {
    id: 'peertube',
    name: 'PeerTube',
    category: 'selfhosted',
    color: '#F1680D',
    icon: 'peertube',
  },
  {
    id: 'nginx',
    name: 'NGINX-RTMP',
    category: 'selfhosted',
    color: '#009639',
    icon: 'nginx',
  },
  {
    id: 'wowzaserver',
    name: 'Wowza Server',
    category: 'selfhosted',
    color: '#F37021',
    icon: 'wowza',
  },
  {
    id: 'antmedia',
    name: 'Ant Media',
    category: 'selfhosted',
    color: '#00D4FF',
    icon: 'antmedia',
  },
  {
    id: 'red5',
    name: 'Red5',
    category: 'selfhosted',
    color: '#D32F2F',
    icon: 'red5',
  },
  {
    id: 'mediasoup',
    name: 'MediaSoup',
    category: 'selfhosted',
    color: '#4CAF50',
    icon: 'mediasoup',
  },
];

export const PLATFORM_CATEGORIES = [
  { id: 'major', name: 'Popular' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'professional', name: 'Professional' },
  { id: 'selfhosted', name: 'Self-Hosted' },
] as const;
