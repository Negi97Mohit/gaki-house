/**
 * AudioMixerEngine — Web Audio API based mixer for the compositor pipeline.
 *
 * Captures audio from multiple HTMLVideoElement sources (camera, screen, media),
 * routes them through individual GainNodes (for volume/mute control),
 * computes real-time RMS/peak levels using AnalyserNodes,
 * and mixes them into a single MediaStreamAudioDestinationNode for the final output.
 */

import { AudioLevel, SourceAudioConfig } from '@/types/compositor';

export interface AudioMixerOptions {
  /** Target sample rate (e.g., 48000) */
  sampleRate?: number;
  /** Initial master volume */
  masterVolume?: number;
}

interface AudioSourceNode {
  id: string;
  sourceNode: MediaElementAudioSourceNode;
  gainNode: GainNode;
  analyserNode: AnalyserNode;
  config: SourceAudioConfig;
}

export class AudioMixerEngine {
  private ctx: AudioContext;
  private destNode: MediaStreamAudioDestinationNode;
  private masterGain: GainNode;
  private masterAnalyser: AnalyserNode;
  private sources = new Map<string, AudioSourceNode>();
  
  // Track state corresponding to sceneCollection.store
  private masterMuted = false;

  constructor(options: AudioMixerOptions = {}) {
    this.ctx = new AudioContext({
      latencyHint: 'interactive',
      sampleRate: options.sampleRate ?? 48000,
    });

    // Destination for MediaStream output
    this.destNode = this.ctx.createMediaStreamDestination();

    // Master Stage
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = options.masterVolume ?? 1.0;
    
    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 256;
    this.masterAnalyser.smoothingTimeConstant = 0.8;

    // Route: Master Gain -> Master Analyser -> Destination
    this.masterGain.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.destNode);
  }

  /**
   * Returns the final mixed audio MediaStream Track
   */
  getMixedAudioTrack(): MediaStreamTrack | null {
    const tracks = this.destNode.stream.getAudioTracks();
    return tracks.length > 0 ? tracks[0] : null;
  }

  /**
   * Resume AudioContext (must be called after a user gesture)
   */
  async resume(): Promise<void> {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  /**
   * Shutdown engine
   */
  destroy(): void {
    this.sources.forEach(s => this.unregisterSource(s.id));
    this.sources.clear();
    this.ctx.close();
  }

  // ─── Source Registration ───────────────────────────────────────────────────

  /**
   * Register a new video/audio element into the mixer
   */
  registerSource(sourceId: string, element: HTMLMediaElement, config: SourceAudioConfig): void {
    // MediaElements can only be piped to one AudioContext source
    // Ensure we aren't re-registering
    if (this.sources.has(sourceId)) {
      this.updateSourceConfig(sourceId, config);
      return;
    }
    
    // We MUST handle CORS/cross-origin media carefully, or Web Audio will mute it.
    // ensure element.crossOrigin is set if needed before this point.

    try {
      const sourceNode = this.ctx.createMediaElementSource(element);
      const gainNode = this.ctx.createGain();
      const analyserNode = this.ctx.createAnalyser();
      
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;

      // Initial state
      gainNode.gain.value = config.muted ? 0 : config.volume;

      // Route: Source -> Gain -> Analyser -> Master Gain
      sourceNode.connect(gainNode);
      gainNode.connect(analyserNode);
      analyserNode.connect(this.masterGain);

      this.sources.set(sourceId, {
        id: sourceId,
        sourceNode,
        gainNode,
        analyserNode,
        config: { ...config }
      });
      
    } catch (e) {
      console.warn(`[AudioMixer] Failed to register source ${sourceId}:`, e);
      // Usually happens if createMediaElementSource is called twice on the same element
    }
  }

  /**
   * Remove a source from the mixer
   */
  unregisterSource(sourceId: string): void {
    const s = this.sources.get(sourceId);
    if (!s) return;

    try {
      s.sourceNode.disconnect();
      s.gainNode.disconnect();
      s.analyserNode.disconnect();
    } catch(e) { /* ignore */ }
    
    this.sources.delete(sourceId);
  }

  // ─── Settings Updates ──────────────────────────────────────────────────────

  updateSourceConfig(sourceId: string, config: SourceAudioConfig): void {
    const s = this.sources.get(sourceId);
    if (!s) return;

    s.config = { ...config };
    // Smooth transition to prevent clicks (using setTargetAtTime)
    const targetGain = config.muted ? 0 : config.volume;
    s.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.015);
  }

  setMasterVolume(volume: number): void {
    const target = this.masterMuted ? 0 : volume;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.015);
  }

  setMasterMuted(muted: boolean): void {
    this.masterMuted = muted;
    // Current value of masterVolume is lost if we just hit 0,
    // so we rely on the caller sending `setMasterVolume` after unmute, 
    // or we could track it internally. Let's just hard set for now.
    if (muted) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.015);
    }
  }

  // ─── Metering ──────────────────────────────────────────────────────────────

  /**
   * Calculates RMS and Peak levels for a given AnalyserNode.
   */
  private getLevels(analyser: AnalyserNode): AudioLevel {
    const dataArray = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(dataArray);

    let sumSquares = 0;
    let peak = 0;
    for (let i = 0; i < dataArray.length; i++) {
        const val = dataArray[i];
        sumSquares += val * val;
        const absVal = Math.abs(val);
        if (absVal > peak) peak = absVal;
    }
    
    // RMS = sqrt(average of squares)
    const rms = Math.sqrt(sumSquares / dataArray.length);
    
    return {
      rms: Math.min(1, rms * Math.SQRT2), // normalize 
      peak: Math.min(1, peak)
    };
  }

  /**
   * Get all current levels (channels + master).
   * Intended to be polled by the UI at ~60Hz via requestAnimationFrame.
   */
  getAllLevels(): Record<string, AudioLevel> {
    const levels: Record<string, AudioLevel> = {};
    
    // Per-source levels
    this.sources.forEach((s) => {
      levels[s.id] = this.getLevels(s.analyserNode);
    });

    // Master level
    levels['master'] = this.getLevels(this.masterAnalyser);

    return levels;
  }
}
