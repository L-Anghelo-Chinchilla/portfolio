// Dice sound effects.
//
// A sound is an audio file URL (or an array of URLs, one is picked at random),
// or 'synth' for a wooden knock generated in code with ZzFX
// (MIT, https://github.com/KilledByAPixel/ZzFX), which needs no files.
//
// Browsers only allow audio after the visitor interacts with the page (click,
// tap or key press), so sounds stay silent until then.

let zzfxPromise = null;
let ZZFX = null;

// ZzFX creates an AudioContext when imported, so load it lazily (keeps tests/SSR safe).
function loadZzfx() {
  if (!zzfxPromise) {
    zzfxPromise = import('zzfx')
      .then((m) => {
        ZZFX = m.ZZFX;
        ZZFX.volume = 1; // volume is handled per sound
        const unlock = () => {
          if (ZZFX.audioContext.state !== 'running') ZZFX.audioContext.resume();
        };
        ['pointerdown', 'keydown', 'touchend'].forEach((e) =>
          window.addEventListener(e, unlock, { passive: true }));
        unlock();
        return ZZFX;
      })
      .catch(() => null);
  }
  return zzfxPromise;
}

const ready = () => ZZFX && ZZFX.audioContext.state === 'running';

// One impact of a wooden die on a wooden table: a dry "tok".
// Wood rings at a few inharmonic partials that die out fast, over a soft low thump.
function synthWoodKnock(volume) {
  const r = 0.92 + Math.random() * 0.16; // every hit sounds slightly different
  // Parameter order: volume, randomness, frequency, attack, sustain, release, shape,
  // shapeCurve, slide, deltaSlide, pitchJump, pitchJumpTime, repeatTime, noise,
  // modulation, bitCrush, delay, sustainVolume, decay, tremolo, filter
  // contact transient: very short band of noise, high-passed
  ZZFX.play(volume * 0.35, 0.1, 1800 * r, 0, 0, 0.012, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1200);
  // main wood resonance, with a slight pitch drop
  ZZFX.play(volume, 0.05, 780 * r, 0, 0, 0.055, 0, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0);
  // upper inharmonic partial (about 2.6x), shorter
  ZZFX.play(volume * 0.3, 0.05, 2030 * r, 0, 0, 0.028, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0);
  // body thump of the table
  ZZFX.play(volume * 0.45, 0.05, 150 * r, 0, 0.003, 0.07, 0, 1, -2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0);
}

const bufferCache = new Map();

function loadBuffer(url) {
  if (!bufferCache.has(url)) {
    bufferCache.set(url, fetch(url)
      .then((r) => r.arrayBuffer())
      .then((data) => ZZFX.audioContext.decodeAudioData(data))
      .catch(() => null));
  }
  return bufferCache.get(url);
}

function playFile(urls, volume) {
  const list = Array.isArray(urls) ? urls : [urls];
  const url = list[Math.floor(Math.random() * list.length)];
  loadBuffer(url).then((buffer) => {
    if (!buffer || !ready()) return;
    const ctx = ZZFX.audioContext;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    // Small random pitch change so repeated hits don't sound identical.
    source.playbackRate.value = 0.92 + Math.random() * 0.16;
    gain.gain.value = volume;
    source.connect(gain).connect(ctx.destination);
    source.start();
  });
}

function isSynth(spec) {
  return spec === 'synth';
}

// spec: 'synth' | url | [urls] | null. strength scales the volume (0..1).
export function createDiceSounds(soundConfig) {
  if (!soundConfig || !soundConfig.enabled) return { play: () => {} };
  loadZzfx().then(() => {
    // Warm up file sounds so the first play is not delayed.
    [soundConfig.toss, soundConfig.land].forEach((spec) => {
      if (spec && !isSynth(spec)) (Array.isArray(spec) ? spec : [spec]).forEach(loadBuffer);
    });
  });

  return {
    play(kind, strength = 1) {
      const spec = soundConfig[kind];
      if (!spec || !ready()) return;
      const volume = soundConfig.volume * strength;
      if (isSynth(spec)) synthWoodKnock(volume);
      else playFile(spec, volume);
    },
  };
}
