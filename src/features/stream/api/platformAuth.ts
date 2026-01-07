export interface PlatformCredentials {
  rtmpUrl: string;
  streamKey: string;
}

export const PlatformAuth = {
  connect: async (platformId: string): Promise<PlatformCredentials> => {
    // Simulate API network request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // MOCK RESPONSE
    console.log(`[Mock Auth] Connected to ${platformId}`);

    switch (platformId) {
      case "youtube":
        return {
          rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
          streamKey: "abcd-1234-efgh-5678",
        };
      case "twitch":
        return {
          rtmpUrl: "rtmp://live.twitch.tv/app/",
          streamKey: "live_12345678_tokentoken",
        };
      case "facebook":
        return {
          rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp/",
          streamKey: "FB-1234567890",
        };
      case "kick":
        return {
          rtmpUrl: "rtmps://fa723fc1b171.global-contribute.live-video.net/app/",
          streamKey: "sk_us-west-12345",
        };
      default:
        // Fallback for others or throw error
        return { rtmpUrl: "", streamKey: "" };
    }
  },
};
