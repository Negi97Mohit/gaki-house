/**
 * Pure Web Audio DSP graph builders for StreamService.
 * NOTE: Audio DSP constants (-48/-40 dBFS, attack/release times, notch/HPF, limiter)
 * are production-tuned and frozen — see docs/decisions/audio-dsp-no-touch.md.
 */

export function createAudioGate(
  ctx: AudioContext,
  gateIntervals: ReturnType<typeof setInterval>[],
  thresholdDb: number, // e.g. -48 for mic, -40 for system audio
  attackTc: number,    // seconds  (e.g. 0.010)
  releaseTc: number,   // seconds  (e.g. 0.120)
): { input: AnalyserNode; output: GainNode } {
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  const rmsBuffer = new Float32Array(analyser.frequencyBinCount);

  const gateGain = ctx.createGain();
  gateGain.gain.value = 0; // closed by default

  // The analyser node acts as both the measurement tap AND the audio passthrough
  // to gateGain — the gate gain controls whether audio flows out.
  analyser.connect(gateGain);

  let gateOpen = false;
  const id = setInterval(() => {
    if (ctx.state === "closed") return;
    analyser.getFloatTimeDomainData(rmsBuffer);
    const rms = Math.sqrt(
      rmsBuffer.reduce((sum, v) => sum + v * v, 0) / rmsBuffer.length,
    );
    const dbFS = 20 * Math.log10(Math.max(rms, 1e-10));
    const shouldOpen = dbFS > thresholdDb;

    if (shouldOpen && !gateOpen) {
      gateGain.gain.setTargetAtTime(1, ctx.currentTime, attackTc);
      gateOpen = true;
    } else if (!shouldOpen && gateOpen) {
      gateGain.gain.setTargetAtTime(0, ctx.currentTime, releaseTc);
      gateOpen = false;
    }
  }, 16);

  gateIntervals.push(id);

  return { input: analyser, output: gateGain };
}

export function createMicFilterChain(
  ctx: AudioContext,
  micSource: MediaStreamAudioSourceNode,
  gateIntervals: ReturnType<typeof setInterval>[],
  thresholdDb: number = -48,
): GainNode {
  // 60Hz notch — kills electrical ground-loop hum
  const notch = ctx.createBiquadFilter();
  notch.type = "notch";
  notch.frequency.value = 60; // change to 50 for EU power grids
  notch.Q.value = 10;

  // 80Hz high-pass — kills low rumble / keyboard / desk thuds
  const hpf = ctx.createBiquadFilter();
  hpf.type = "highpass";
  hpf.frequency.value = 80;
  hpf.Q.value = 0.707; // Butterworth — flat response above cutoff

  // Noise gate via the shared helper
  const gate = createAudioGate(ctx, gateIntervals, thresholdDb, 0.010, 0.120);

  // Wire: micSource → notch → hpf → gate.input ; gate.output returned
  micSource.connect(notch);
  notch.connect(hpf);
  hpf.connect(gate.input);

  return gate.output;
}

export function createPeakLimiter(ctx: AudioContext): DynamicsCompressorNode {
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -1.0; // 1 dBFS below digital ceiling
  limiter.knee.value = 0;         // hard knee — true limiting behaviour
  limiter.ratio.value = 20;       // 20:1 ≈ brick-wall
  limiter.attack.value = 0.001;   // 1ms — catches transients before they clip
  limiter.release.value = 0.1;    // 100ms
  return limiter;
}
