// Dice sound effects.
//
// A sound is an audio file URL (or an array of URLs, one is picked at random),
// or 'synth' for a wooden knock generated in code with ZzFX
// (MIT, https://github.com/KilledByAPixel/ZzFX), which needs no files.
//
// Autoplay rules: every browser (Chrome, Edge, Firefox, Safari) keeps audio muted
// until the visitor has clicked, tapped or pressed a key on the page at least once.
// Chrome sometimes skips this for sites you visit a lot (like your own localhost),
// which is why sounds may play there without a click but not in Edge/Firefox.
// This module unlocks audio on the first such interaction, including one that
// happened before the dice finished loading.

const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
let ctx = null;

// Created lazily: a context made before any interaction starts out suspended.
function getContext() {
  if (!ctx && AudioCtx) ctx = new AudioCtx();
  return ctx;
}

// ---- Unlocking ---------------------------------------------------------------------
// Different browsers accept different events as a "user gesture", so listen to all
// of them (capture phase, so page handlers that stop propagation can't hide them).
const GESTURES = ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'keydown'];
let unlockInstalled = false;

function unlock() {
  const c = getContext();
  if (!c) return;
  if (c.state !== 'running') c.resume().catch(() => {});
  // Safari/iOS only fully unlocks output after a sound is started inside the gesture.
  try {
    const source = c.createBufferSource();
    source.buffer = c.createBuffer(1, 1, 22050);
    source.connect(c.destination);
    source.start(0);
  } catch (e) { /* ignore */ }
  if (c.state === 'running') removeUnlock();
}

function removeUnlock() {
  GESTURES.forEach((e) => window.removeEventListener(e, unlock, true));
}

function installUnlock() {
  if (unlockInstalled || !AudioCtx) return;
  unlockInstalled = true;
  GESTURES.forEach((e) => window.addEventListener(e, unlock, true));
  // The visitor may already have clicked before the dice loaded ("sticky" activation).
  if (navigator.userActivation && navigator.userActivation.hasBeenActive) unlock();
}

// Runs `play` only if audio can start right now. A request made while audio is still
// locked is dropped instead of queued, so there is no burst of old knocks later.
function whenRunning(play) {
  const c = getContext();
  if (!c) return;
  if (c.state === 'running') { play(c); return; }
  const requested = performance.now();
  c.resume()
    .then(() => { if (c.state === 'running' && performance.now() - requested < 150) play(c); })
    .catch(() => {});
}

// ---- File sounds -----------------------------------------------------------------
const rawCache = new Map();     // url -> Promise<ArrayBuffer>, fetched early
const decodedCache = new Map(); // url -> Promise<AudioBuffer | null>

function prefetch(url) {
  if (!rawCache.has(url)) {
    rawCache.set(url, fetch(url).then((r) => r.arrayBuffer()).catch(() => null));
  }
}

function decoded(url, c) {
  if (!decodedCache.has(url)) {
    prefetch(url);
    decodedCache.set(url, rawCache.get(url)
      .then((data) => (data ? c.decodeAudioData(data) : null))
      .catch(() => null));
  }
  return decodedCache.get(url);
}

function playFile(urls, volume) {
  const list = Array.isArray(urls) ? urls : [urls];
  const url = list[Math.floor(Math.random() * list.length)];
  whenRunning((c) => {
    decoded(url, c).then((buffer) => {
      if (!buffer) return;
      const source = c.createBufferSource();
      const gain = c.createGain();
      source.buffer = buffer;
      // Small random pitch change so repeated hits don't sound identical.
      source.playbackRate.value = 0.92 + Math.random() * 0.16;
      gain.gain.value = volume;
      source.connect(gain).connect(c.destination);
      source.start();
    });
  });
}

// ---- Synth sound (ZzFX, only loaded if a sound is set to 'synth') ----------------------
let zzfxPromise = null;
let ZZFX = null;

function loadZzfx() {
  if (!zzfxPromise) {
    zzfxPromise = import('zzfx')
      .then((m) => {
        ZZFX = m.ZZFX;
        ZZFX.volume = 1; // volume is handled per sound
        return ZZFX;
      })
      .catch(() => null);
  }
  return zzfxPromise;
}

// One impact of a wooden die on a wooden table: a dry "tok".
// Wood rings at a few inharmonic partials that die out fast, over a soft low thump.
function synthWoodKnock(volume) {
  if (!ZZFX) return;
  whenRunning((c) => {
    ZZFX.audioContext = c; // play through the shared, unlocked context
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
  });
}

function isSynth(spec) {
  return spec === 'synth';
}

// Resolves true if audio can play right now (autoplay allowed, or already unlocked by
// an earlier interaction). A locked context's resume() stays pending until a gesture,
// so it is raced against a short timeout. Also starts listening for the unlocking
// click, so it can be called at page load, before the dice itself loads.
export function canPlaySound() {
  if (!AudioCtx) return Promise.resolve(true);
  installUnlock();
  const c = getContext();
  if (!c || c.state === 'running') return Promise.resolve(true);
  return Promise.race([
    c.resume().then(() => c.state === 'running').catch(() => false),
    new Promise((resolve) => setTimeout(() => resolve(c.state === 'running'), 300)),
  ]);
}

// spec: 'synth' | url | [urls] | null. strength scales the volume (0..1).
export function createDiceSounds(soundConfig) {
  if (!soundConfig || !soundConfig.enabled || !AudioCtx) {
    return { play: () => {} };
  }
  installUnlock();
  [soundConfig.toss, soundConfig.land].forEach((spec) => {
    if (!spec) return;
    if (isSynth(spec)) loadZzfx();
    else (Array.isArray(spec) ? spec : [spec]).forEach(prefetch); // download early
  });

  return {
    play(kind, strength = 1) {
      const spec = soundConfig[kind];
      if (!spec) return;
      const volume = soundConfig.volume * strength;
      if (isSynth(spec)) synthWoodKnock(volume);
      else playFile(spec, volume);
    },
  };
}
