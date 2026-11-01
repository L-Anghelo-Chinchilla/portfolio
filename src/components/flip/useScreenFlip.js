// Video-game style tab switch: the whole screen shrinks into a card, crouches, jumps,
// spins around in the air (the back side is the other tab), lands and grows back.
//
// The page itself is animated with CSS 3D transforms, so it stays sharp and
// interactive content is real (no screenshots). three.js (flipScene.js, lazy loaded)
// draws the stage behind it: grid floor, stars, shadow, dust and sparkles.
import { useCallback, useEffect, useRef } from 'react';
import { playSynth, preloadSynth } from '../dice/diceSounds';

const MIN_SCALE = 0.5;       // size of the page while it jumps
const JUMP_HEIGHT = 0.28;    // fraction of the viewport height
const T = { shrink: 450, crouch: 170, air: 900, land: 280, grow: 480 }; // ms
const A = T.shrink;
const B = A + T.crouch;
const C = B + T.air;
const D = C + T.land;
const TOTAL = D + T.grow;

// ZzFX params: volume, randomness, frequency, attack, sustain, release, shape, shapeCurve,
// slide, deltaSlide, pitchJump, pitchJumpTime, repeatTime, noise, modulation, bitCrush,
// delay, sustainVolume, decay, tremolo, filter
const SFX = {
  shrink: [[0.3, 0.05, 520, 0, 0.03, 0.12, 1, 1, -12]],
  jump: [[0.4, 0.05, 190, 0.01, 0.08, 0.16, 1, 1.5, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0.02]],
  whoosh: [[0.22, 0, 700, 0.12, 0.12, 0.28, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7, 0, 0, -1800]],
  land: [
    [0.6, 0.05, 110, 0, 0.01, 0.2, 0, 1, -6],
    [0.3, 0, 300, 0, 0, 0.09, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, -900],
  ],
  grow: [[0.3, 0, 660, 0, 0.05, 0.22, 1, 1, 0, 0, 330, 0.06]],
};

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Pose of the page at time ms. rot goes 0 -> 180 while in the air.
function poseAt(ms, H) {
  const p = { phase: 'done', s: 1, sx: 1, sy: 1, lift: 0, rot: 180, tilt: 0, backdrop: 0 };
  if (ms < A) {
    const k = easeInOut(ms / T.shrink);
    return { ...p, phase: 'shrink', s: 1 - (1 - MIN_SCALE) * k, rot: 0, backdrop: k };
  }
  if (ms < B) {
    // Crouch: squash down, anticipating the jump.
    const k = Math.sin(((ms - A) / T.crouch) * Math.PI / 2);
    return { ...p, phase: 'crouch', s: MIN_SCALE, sx: 1 + 0.08 * k, sy: 1 - 0.14 * k, rot: 0, backdrop: 1 };
  }
  if (ms < C) {
    // Airborne: parabola, stretched near the ground, spinning in the middle.
    const t = (ms - B) / T.air;
    const stretch = Math.pow(1 - Math.sin(Math.PI * t), 2) * 0.1;
    return {
      ...p,
      phase: 'air',
      s: MIN_SCALE,
      sx: 1 - stretch * 0.6,
      sy: 1 + stretch,
      lift: 4 * H * t * (1 - t),
      rot: 180 * easeInOut(clamp01((t - 0.08) / 0.84)),
      tilt: Math.sin(Math.PI * t) * 5,
      backdrop: 1,
    };
  }
  if (ms < D) {
    // Landing: squash on impact, then a damped wobble.
    const t = (ms - C) / T.land;
    const k = Math.exp(-5 * t) * Math.cos(t * Math.PI * 2.5);
    return { ...p, phase: 'land', s: MIN_SCALE, sx: 1 + 0.1 * k, sy: 1 - 0.16 * k, backdrop: 1 };
  }
  if (ms < TOTAL) {
    const k = easeInOut((ms - D) / T.grow);
    return { ...p, phase: 'grow', s: MIN_SCALE + (1 - MIN_SCALE) * k, backdrop: 1 - k };
  }
  return p;
}

// ---- Shared backdrop (one overlay + one WebGL context for the whole app) -------------
let overlay = null;
let canvas = null;
let scene = null;
let scenePromise = null;

function getOverlay() {
  if (!overlay) {
    overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '100001', // above the dice and the navbar, below the flipping page
      display: 'none',
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 50% 35%, #1d6b5f 0%, #0d2f3a 55%, #061820 100%)',
    });
    canvas = document.createElement('canvas');
    Object.assign(canvas.style, { width: '100%', height: '100%', display: 'block' });
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);
  }
  return overlay;
}

function loadScene() {
  if (!scenePromise) {
    scenePromise = import('./flipScene')
      .then((m) => {
        getOverlay();
        try { scene = m.createFlipScene(canvas); } catch (e) { scene = null; } // no WebGL
        return scene;
      })
      .catch(() => { scenePromise = null; return null; });
  }
  return scenePromise;
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function runFlip(stage, content, onSwap) {
  return new Promise((resolve) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const H = vh * JUMP_HEIGHT;
    const perspective = Math.max(vw, vh) * 2.2;
    const root = document.documentElement;
    const prevOverflowY = root.style.overflowY;
    const prevStageCss = stage.style.cssText;
    const prevContentCss = content.style.cssText;

    // Freeze the page where it is: the stage becomes a fixed, viewport-sized card and
    // the content inside is offset by the current scroll position.
    const scrollY = window.scrollY;
    root.style.overflowY = 'scroll'; // keep the scrollbar so the width doesn't jump
    Object.assign(stage.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      zIndex: '100002',
      transformOrigin: '50% 50%',
      willChange: 'transform',
      pointerEvents: 'none',
      backgroundColor: 'rgb(113, 214, 182)',
    });
    content.style.transform = `translateY(${-scrollY}px)`;

    const ov = getOverlay();
    ov.style.opacity = '0';
    ov.style.display = 'block';
    loadScene();

    const start = performance.now();
    let last = start;
    let swapped = false;
    let phase = '';
    let whooshed = false;
    playSynth(...SFX.shrink);

    const swap = () => {
      if (swapped) return;
      swapped = true;
      onSwap();
      content.style.transform = 'translateY(0px)'; // the new tab starts at its top
    };

    const finish = () => {
      swap();
      stage.style.cssText = prevStageCss;
      content.style.cssText = prevContentCss;
      ov.style.display = 'none';
      if (scene) scene.clear();
      root.style.overflowY = prevOverflowY;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      resolve();
    };

    const frame = (now) => {
      const ms = now - start;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (ms >= TOTAL) { finish(); return; }

      const p = poseAt(ms, H);
      if (p.rot > 90) swap();

      const bottom = vh / 2 + (vh * p.s) / 2; // the floor line
      const cardH = vh * p.s * p.sy;
      const cardW = vw * p.s * p.sx;
      const centerY = bottom - cardH / 2 - p.lift;
      const face = p.rot <= 90 ? p.rot : p.rot - 180; // the back side is not mirrored
      const framed = (1 - p.s) / (1 - MIN_SCALE); // 0 at full size, 1 while jumping

      stage.style.transform = `perspective(${perspective}px) translateY(${centerY - vh / 2}px) `
        + `rotateY(${face}deg) rotateZ(${p.tilt}deg) scale(${p.s * p.sx}, ${p.s * p.sy})`;
      stage.style.borderRadius = `${(36 * framed) / p.s}px`;
      stage.style.boxShadow = `0 0 0 ${(10 * framed) / p.s}px rgba(255,255,255,0.92), `
        + `0 0 ${(60 * framed) / p.s}px rgba(127,245,208,${0.5 * framed})`;
      ov.style.opacity = String(p.backdrop);

      if (p.phase !== phase) {
        phase = p.phase;
        if (phase === 'air') {
          playSynth(...SFX.jump);
          if (scene) scene.burst(vw / 2, bottom, cardW, 0.8);
        } else if (phase === 'land') {
          playSynth(...SFX.land);
          if (scene) scene.burst(vw / 2, bottom, cardW, 1.3);
        } else if (phase === 'grow') {
          playSynth(...SFX.grow);
        }
      }
      if (!whooshed && p.rot > 20) {
        whooshed = true;
        playSynth(...SFX.whoosh);
      }

      if (scene) {
        if (phase === 'air' && p.rot > 5 && p.rot < 175) {
          // Sparkles fly off the two vertical edges of the spinning page.
          const half = (cardW / 2) * Math.abs(Math.cos((face * Math.PI) / 180));
          for (let i = 0; i < 2; i++) {
            const y = centerY + (Math.random() - 0.5) * cardH;
            scene.sparkle(vw / 2 - half, y, -1);
            scene.sparkle(vw / 2 + half, y, 1);
          }
        }
        scene.update(dt, {
          cx: vw / 2, bottom, cardW, lift: p.lift, H, air: phase === 'air', alpha: p.backdrop,
        });
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

// stageRef: element wrapping everything that should jump (navbar + content).
// contentRef: the scrolling content inside it.
// Returns flip(onSwap, onDone): runs the animation and calls onSwap (which must render
// the new tab synchronously, e.g. with flushSync) when the page is edge-on, and onDone
// when the transition has finished. Returns false if a flip is already running.
export default function useScreenFlip(stageRef, contentRef) {
  const busy = useRef(false);

  // Download three.js + the scene and the synth while the browser is idle, so the
  // first click is instant.
  useEffect(() => {
    const whenIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
    const preload = () => whenIdle(() => { loadScene(); preloadSynth(); });
    if (document.readyState === 'complete') preload();
    else window.addEventListener('load', preload, { once: true });
    return () => window.removeEventListener('load', preload);
  }, []);

  return useCallback((onSwap, onDone) => {
    if (busy.current) return false;
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content || prefersReducedMotion()) {
      onSwap();
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (onDone) onDone();
      return true;
    }
    busy.current = true;
    runFlip(stage, content, onSwap).then(() => {
      busy.current = false;
      if (onDone) onDone();
    });
    return true;
  }, [stageRef, contentRef]);
}
