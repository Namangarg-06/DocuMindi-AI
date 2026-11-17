/**
 * Web Audio API Synthesizer for DocuMindi-AI
 * Creates rich, futuristic sci-fi startup chimes and audio effects
 * with zero external mp3/wav dependencies (100% locally synthesized in browser).
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a cinematic futuristic startup swell & chime
 */
export function playStartupSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.35, now + 0.4);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
    masterGain.connect(ctx.destination);

    // Filter sweep (lowpass moving up for sci-fi awakening feel)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 1.2);
    filter.connect(masterGain);

    // Chord Frequencies: C3, G3, C4, E4, B4 (Major 9th futuristic harmony)
    const frequencies = [130.81, 196.00, 261.63, 329.63, 493.88];

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      
      // Slight pitch glide for high-tech holographic feel
      osc.frequency.exponentialRampToValueAtTime(freq * 1.01, now + 1.5);

      oscGain.gain.setValueAtTime(0.18 / frequencies.length, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc.connect(oscGain);
      oscGain.connect(filter);

      osc.start(now + index * 0.05);
      osc.stop(now + 2.2);
    });

  } catch (err) {
    console.debug('Audio autoplay was restricted by browser policy:', err);
  }
}

/**
 * Play completion crystal chime when neural engine hits 100%
 */
export function playCompletionChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chimeGain = ctx.createGain();
    chimeGain.gain.setValueAtTime(0.001, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
    chimeGain.connect(ctx.destination);

    // High crystalline frequencies (C5, G5, C6)
    const chimeFreqs = [523.25, 783.99, 1046.50];

    chimeFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      osc.connect(chimeGain);
      osc.start(now + idx * 0.06);
      osc.stop(now + 1.5);
    });

  } catch (err) {
    console.debug('Audio error:', err);
  }
}
