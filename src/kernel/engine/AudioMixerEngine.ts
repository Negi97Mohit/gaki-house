// Single responsibility: Safely acquire and mix audio inputs (Mic + Desktop)
// into a single MediaStream destination. Gracefully handles permission failures.

export class AudioMixerEngine {
  private audioContext: AudioContext | null = null;
  private audioDestination: MediaStreamAudioDestinationNode | null = null;
  private micStream: MediaStream | null = null;
  private systemStream: MediaStream | null = null;

  async start(): Promise<MediaStream | null> {
    console.log("[AudioMixerEngine] Initializing audio context...");
    this.audioContext = new window.AudioContext();
    this.audioDestination = this.audioContext.createMediaStreamDestination();

    // 1. Try to get microphone audio (Graceful failure required)
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      if (this.micStream.getAudioTracks().length > 0) {
        const micSource = this.audioContext.createMediaStreamSource(this.micStream);
        const micGain = this.audioContext.createGain();
        micGain.gain.value = 1.0;
        micSource.connect(micGain);
        micGain.connect(this.audioDestination);
        console.log("[AudioMixerEngine] Microphone connected");
      }
    } catch (e) {
      console.warn("[AudioMixerEngine] Mic access denied/failed, broadcasting silent/video-only", e);
    }

    // 2. We can add systemStream loopback logic here in the future via electron IPC
    // For now, return what we have (even if it's empty, MediaRecorder can still process it, or just return null if empty)
    
    if (!this.micStream && !this.systemStream) {
      console.log("[AudioMixerEngine] No audio devices initialized (video only)");
    }
    
    return this.audioDestination.stream;
  }

  destroy() {
    console.log("[AudioMixerEngine] Destroying audio pipeline");
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.systemStream) {
      this.systemStream.getTracks().forEach((t) => t.stop());
      this.systemStream = null;
    }
    this.audioDestination?.disconnect();
    this.audioDestination = null;

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch((e) => console.warn("AudioContext close failed", e));
    }
    this.audioContext = null;
  }
}
