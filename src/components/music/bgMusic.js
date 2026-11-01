// Background music for the portfolio.
//
// - Off until the visitor opens the Drawings tab for the first time; it starts (with
//   a fade in) once the jump transition has finished.
// - On the Drawings tab it sounds normal. On the Programming tab it sounds like it's
//   playing in the room next door: highs cut by the "wall", a bit more bass, some
//   echo of the other room and lower volume. The change is smooth both ways.
//
// The song is streamed from an <audio> element and routed through Web Audio:
//   audio -> bass shelf -> low-pass ("wall") -> master
//                                     \-> room echo -> wet ----^
// Put your song in public/music/ and set MUSIC.url (same origin, so no CORS needed).
import { getAudioContext } from '../dice/diceSounds';

export const MUSIC = {
  // "8 Bit Battle Loop" by Wolfgang_ (Theodore Kerr), CC0:
  // https://opengameart.org/content/8-bit-battle-loop
  url: `${process.env.PUBLIC_URL}/music/8bit-battle-loop.ogg`,
  volume: 0.5,      // normal volume (0..1)
  fadeIn: 2.5,      // seconds of fade in when it starts
  change: 0.8,      // seconds to go through / out of the wall
  open: { cutoff: 20000, bass: 0, echo: 0, volume: 1 },
  // Next door: cutoff in Hz (lower = thicker wall), bass boost in dB, echo 0..1,
  // volume relative to `volume`.
  wall: { cutoff: 380, bass: 6, echo: 0.35, volume: 0.45 },
};

let audio = null;
let nodes = null;
let started = false;
let failed = false;
let muted = false;
let room = 'open';
const listeners = new Set();

const notify = () => listeners.forEach((cb) => cb(getMusicState()));

export function getMusicState() {
  return { playing: started && !failed, muted };
}

export function onMusicChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function createAudio() {
  if (audio) return;
  audio = new Audio();
  audio.src = MUSIC.url;
  audio.loop = true;
  audio.preload = 'auto';
  audio.addEventListener('error', () => { failed = true; notify(); }); // e.g. no file yet
}

// Call inside the click that opens Drawings: Safari only lets an <audio> element play
// later if it was started once during a user gesture, so it is started muted and
// paused right away.
export function primeMusic() {
  if (audio || typeof Audio === 'undefined') return;
  createAudio();
  audio.muted = true;
  const p = audio.play();
  const restore = () => {
    if (!started) { audio.pause(); audio.currentTime = 0; }
    audio.muted = false;
  };
  if (p && p.then) p.then(restore, restore);
  else restore();
}

// Short decaying noise burst = the echo of a small room.
function roomImpulse(c, seconds) {
  const length = Math.floor(c.sampleRate * seconds);
  const buffer = c.createBuffer(2, length, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
  }
  return buffer;
}

function buildGraph() {
  const c = getAudioContext();
  if (!c) return null;
  const source = c.createMediaElementSource(audio);
  const bass = c.createBiquadFilter();
  bass.type = 'lowshelf';
  bass.frequency.value = 140;
  const wall = c.createBiquadFilter();
  wall.type = 'lowpass';
  wall.Q.value = 0.7;
  const echo = c.createConvolver();
  echo.buffer = roomImpulse(c, 0.7);
  const wet = c.createGain();
  const master = c.createGain();
  master.gain.value = 0;

  source.connect(bass).connect(wall);
  wall.connect(master);
  wall.connect(echo).connect(wet).connect(master);
  master.connect(c.destination);
  return { c, bass, wall, wet, master };
}

function targetVolume() {
  return muted ? 0 : MUSIC.volume * MUSIC[room].volume;
}

// Moves every effect to the current room's values over `seconds`.
function apply(seconds) {
  if (!nodes) return;
  const { c, bass, wall, wet, master } = nodes;
  const t = c.currentTime;
  const k = Math.max(0.01, seconds / 3); // setTargetAtTime reaches ~95% in 3 time constants
  const r = MUSIC[room];
  wall.frequency.setTargetAtTime(r.cutoff, t, k);
  bass.gain.setTargetAtTime(r.bass, t, k);
  wet.gain.setTargetAtTime(r.echo, t, k);
  master.gain.cancelScheduledValues(t);
  master.gain.setTargetAtTime(targetVolume(), t, k);
}

// Starts the music (once). Call when the transition to Drawings has finished.
export function startMusic() {
  if (started || typeof Audio === 'undefined') return;
  started = true;
  createAudio();
  if (!nodes) nodes = buildGraph();
  if (nodes) {
    const { c, bass, wall, wet, master } = nodes;
    if (c.state !== 'running') c.resume().catch(() => {});
    const r = MUSIC[room];
    const t = c.currentTime;
    wall.frequency.setValueAtTime(r.cutoff, t);
    bass.gain.setValueAtTime(r.bass, t);
    wet.gain.setValueAtTime(r.echo, t);
    master.gain.setValueAtTime(0, t);
    master.gain.linearRampToValueAtTime(targetVolume(), t + MUSIC.fadeIn);
  }
  const p = audio.play();
  if (p && p.catch) p.catch(() => { failed = true; notify(); });
  notify();
}

// 'open' (Drawings) or 'wall' (Programming, the song is next door).
export function setMusicRoom(next) {
  if (next === room) return;
  room = next;
  apply(MUSIC.change);
}

export function setMusicMuted(value) {
  muted = value;
  apply(0.3);
  notify();
}
