// High-tech Cyber SFX Synthesizer using native Web Audio API (Zero external dependencies)
let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export const isSoundEnabled = () => soundEnabled;

export const toggleSound = () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    playCyberBleep(880, 0.08, 'sine');
  }
  return soundEnabled;
};

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

function getAudioContext(): AudioContext | null {
  if (!soundEnabled) return null;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playCyberBleep(freq = 600, duration = 0.07, type: OscillatorType = 'sine') {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Graceful fallback if blocked by browser policy
  }
}

export function playHoverSfx() {
  playCyberBleep(740, 0.04, 'sine');
}

let lastEsportsHoverTime = 0;
export function playEsportsCardHoverSound() {
  if (!soundEnabled) return;
  const nowMs = performance.now();
  if (nowMs - lastEsportsHoverTime < 45) return;
  lastEsportsHoverTime = nowMs;

  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;

    // High-frequency cyber click (2800Hz -> 1500Hz in 22ms)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2800, now);
    osc.frequency.exponentialRampToValueAtTime(1500, now + 0.022);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.022);

    // Tactile micro-tick harmonic (3600Hz -> 2200Hz in 12ms)
    const tick = ctx.createOscillator();
    const tickGain = ctx.createGain();
    tick.type = 'triangle';
    tick.frequency.setValueAtTime(3600, now);
    tick.frequency.exponentialRampToValueAtTime(2200, now + 0.012);

    tickGain.gain.setValueAtTime(0.02, now);
    tickGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.012);

    osc.connect(gain);
    gain.connect(ctx.destination);

    tick.connect(tickGain);
    tickGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.022);
    tick.start(now);
    tick.stop(now + 0.012);
  } catch {
    // Graceful fallback
  }
}

export function playClickSfx() {
  playCyberBleep(920, 0.09, 'triangle');
}

export function playSuccessSfx() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.05, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.13);
    });
  } catch {
    // Ignore audio context errors
  }
}
