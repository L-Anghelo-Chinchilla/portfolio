// Two-screen spiral carousel for the drawings.
//
// The carousel is two screens tall. On screen 1 the drawings go down the right half
// like a staircase, from the biggest one at the right edge towards the center; then the
// path continues on screen 2 down the left half, from the biggest at the left edge
// towards the center, where the tiniest one fades away. The free half of each screen
// is for text (see Drawings.js). The list is cyclic.
//
// Drawings never overlap: each one gets its own column inside its half (sized from the
// drawing's real proportions, everything scaled down together if needed). Every
// `interval` ms they move one step as a chain reaction from the end of the path, so a
// drawing only moves into space that has already been freed:
//   1. the tiniest fades out, 2. screen 2 shifts, 3. one drawing crosses from screen 1
//   to screen 2 (shrinks away and grows in its new spot, like a portal), 4. screen 1
//   shifts and a new drawing slides in as the biggest. Only one group moves at a time.
import React, { useEffect, useRef, useState } from 'react';

// Per screen: which half the drawings use, the vertical position of the first and the
// last drawing's center (fraction of the screen height) and their heights (same unit).
export const SCREENS = [
  { side: 'right', y: [0.36, 0.7], size: [0.62, 0.4] },
  { side: 'left', y: [0.36, 0.7], size: [0.56, 0.34] },
];
const MOVE_MS = 2200;         // one whole step (all four parts of the chain reaction)
const NARROW = 900;           // below this width the drawings use the full width
const GAP = 16;               // minimum space between two drawings (px)
const DEFAULT_ASPECT = 0.75;  // width / height until a drawing has loaded

// When each part of a step happens, as fractions of MOVE_MS.
const PHASES = { exit: [0, 0.18], screen2: [0.18, 0.46], cross: [0.46, 0.73], screen1: [0.73, 1] };

const mod = (n, m) => ((n % m) + m) % m;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// How many of the `count` slots each screen gets (screen 1 gets the extra one).
function slotScreens(count) {
  const result = [];
  SCREENS.forEach((_, i) => {
    const m = Math.floor(count / SCREENS.length) + (i < count % SCREENS.length ? 1 : 0);
    for (let k = 0; k < m; k++) result.push(i);
  });
  return result;
}

// Resting layout: { x, y (centers, px), w, h } for each slot 0..count-1, given the
// aspect ratio of the drawing in each slot.
function layout(aspects, W, screenH) {
  const narrow = W < NARROW;
  const screens = slotScreens(aspects.length);
  const out = [];
  SCREENS.forEach((cfg, s) => {
    const idx = screens.map((sc, i) => (sc === s ? i : -1)).filter((i) => i >= 0);
    const m = idx.length;
    if (!m) return;
    const outer = W * 0.03;
    const inner = narrow ? outer : W * 0.02;
    const left = narrow || cfg.side === 'left' ? outer : W / 2 + inner;
    const right = narrow || cfg.side === 'right' ? W - outer : W / 2 - inner;
    const avail = right - left;
    // On narrow screens the text sits at the top, so the drawings use the lower part.
    const bandTop = (narrow ? 0.42 : 0.05) * screenH;
    const bandBottom = 0.96 * screenH;

    const t = (k) => (m > 1 ? k / (m - 1) : 0);
    const rel = idx.map((_, k) => lerp(cfg.size[0], cfg.size[1], t(k)) * screenH);
    const natural = idx.reduce((sum, i, k) => sum + rel[k] * aspects[i], 0);
    const f = Math.min(
      1,
      (avail - GAP * (m - 1)) / natural,
      (bandBottom - bandTop) / rel[0],
    );
    const ws = idx.map((i, k) => rel[k] * f * aspects[i]);
    const spare = avail - ws.reduce((a, b) => a + b, 0);
    const gap = m > 1 ? Math.min(spare / (m - 1), W * 0.06) : 0;

    // Biggest at the outer edge, the rest stepping towards the center.
    let cursor = cfg.side === 'right' || narrow ? right : left;
    const dir = cfg.side === 'right' || narrow ? -1 : 1;
    idx.forEach((i, k) => {
      const w = ws[k];
      const h = rel[k] * f;
      const x = cursor + (dir * w) / 2;
      cursor += dir * (w + gap);
      const yWanted = narrow
        ? lerp(bandTop + h / 2, bandBottom - h / 2, t(k))
        : lerp(cfg.y[0], cfg.y[1], t(k)) * screenH;
      const y = Math.min(Math.max(yWanted, bandTop + h / 2), bandBottom - h / 2);
      out[i] = { x, y: y + s * screenH, w, h, screen: s };
    });
  });
  return out;
}

function SpiralCarousel({ images, count = 6, interval = 7000, style }) {
  const shown = Math.max(1, Math.min(count, images.length));
  const ref = useRef(null);
  const [box, setBox] = useState({ W: 0, H: 0 });
  const [aspects, setAspects] = useState({}); // src -> width / height
  // `head` is the sequence number of the biggest drawing; it only ever grows, so React
  // keeps each drawing's element while it travels along the path.
  const [head, setHead] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 while moving one step

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setBox({ W: el.clientWidth, H: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Real proportions of every drawing, so the columns fit them exactly.
  useEffect(() => {
    let alive = true;
    Array.from(new Set(images)).forEach((src) => {
      const img = new Image();
      img.onload = () => {
        if (alive && img.naturalHeight) {
          setAspects((a) => ({ ...a, [src]: img.naturalWidth / img.naturalHeight }));
        }
      };
      img.src = src;
    });
    return () => { alive = false; };
  }, [images]);

  useEffect(() => {
    const reduced = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = null;
    const step = () => {
      if (document.hidden) return; // don't pile up steps in a background tab
      if (reduced) { setHead((h) => h + 1); return; }
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / MOVE_MS);
        if (t < 1) {
          setProgress(t);
          raf = requestAnimationFrame(tick);
        } else {
          setHead((h) => h + 1);
          setProgress(0);
        }
      };
      raf = requestAnimationFrame(tick);
    };
    const timer = setInterval(step, interval);
    return () => {
      clearInterval(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [interval]);

  const { W, H } = box;
  const screenH = H / SCREENS.length;
  const srcOf = (n) => images[mod(n, images.length)];
  const aspectOf = (n) => aspects[srcOf(n)] || DEFAULT_ASPECT;
  const seqAt = (h) => Array.from({ length: shown }, (_, k) => h - k); // slot k -> seq
  const now = W > 0 ? layout(seqAt(head).map(aspectOf), W, screenH) : [];
  const next = W > 0 && progress > 0 ? layout(seqAt(head + 1).map(aspectOf), W, screenH) : now;
  const screens = slotScreens(shown);
  const phase = (name) => {
    const [a, b] = PHASES[name];
    return easeInOut(clamp01((progress - a) / (b - a)));
  };

  const cards = [];
  if (W > 0) {
    for (let n = head + 1; n >= head - (shown - 1); n--) {
      const from = head - n;  // slot now (-1: about to enter)
      const to = from + 1;    // slot after this step (shown: leaving)
      let p;
      if (from < 0) {
        if (progress === 0) continue; // nothing entering at rest
        const B = next[0];
        const t = phase('screen1');
        // Slides in from beyond the right edge.
        p = { ...B, x: lerp(W + B.w / 2 + GAP, B.x, t), opacity: t };
      } else if (to >= shown) {
        const A = now[from];
        const t = phase('exit');
        p = { ...A, w: A.w * (1 - 0.5 * t), h: A.h * (1 - 0.5 * t), opacity: 1 - t };
      } else if (screens[from] !== screens[to]) {
        // Crossing to the next screen, like a portal: shrinks away in its own spot,
        // then grows in its new (already empty) spot, so it never passes over another.
        const t = phase('cross');
        const k = t < 0.5 ? t * 2 : (t - 0.5) * 2;
        const C = t < 0.5 ? now[from] : next[to];
        const s = t < 0.5 ? 1 - 0.5 * k : 0.5 + 0.5 * k;
        p = { ...C, w: C.w * s, h: C.h * s, opacity: t < 0.5 ? 1 - k : k };
      } else {
        const A = now[from];
        const B = next[to];
        const t = phase(screens[from] === 0 ? 'screen1' : 'screen2');
        p = {
          x: lerp(A.x, B.x, t), y: lerp(A.y, B.y, t), w: lerp(A.w, B.w, t), h: lerp(A.h, B.h, t), opacity: 1,
        };
      }
      cards.push({ n, from, src: srcOf(n), ...p });
    }
  }

  return (
    <div
      ref={ref}
      style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none', ...style }}
    >
      {cards.map((c) => (
        <img
          key={c.n}
          src={c.src}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            boxSizing: 'border-box',
            width: `${c.w}px`,
            height: `${c.h}px`,
            objectFit: 'cover',
            border: '5px solid white',
            borderRadius: '4px',
            boxShadow: '-8px 10px 14px rgba(0, 0, 0, 0.39)',
            transform: `translate(${c.x - c.w / 2}px, ${c.y - c.h / 2}px)`,
            opacity: c.opacity,
            zIndex: shown + 1 - c.from,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}

export default SpiralCarousel;
