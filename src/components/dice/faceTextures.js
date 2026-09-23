import * as THREE from 'three';

// Pip layout on a 3x3 grid, coordinates in [-1, 1].
const PIPS = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

function drawFace(value, bodyColor, pips) {
  const size = pips.textureSize;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bodyColor;
  ctx.fillRect(0, 0, size, size);

  if (pips.border && pips.border.width > 0) {
    const w = pips.border.width * size;
    ctx.strokeStyle = pips.border.color;
    ctx.lineWidth = w;
    ctx.strokeRect(size * 0.12, size * 0.12, size * 0.76, size * 0.76);
  }

  const color = value === 1 && pips.oneColor ? pips.oneColor : pips.color;
  ctx.fillStyle = color;

  if (pips.style === 'numbers') {
    const px = Math.round(size * 0.6);
    ctx.font = pips.font.replace(/\d+px/, `${px}px`);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(value), size / 2, size / 2 + px * 0.04);
  } else {
    // Pips sit inside the flat part of the face; the bevel takes the outer ring.
    const spread = size * 0.26;
    const r = pips.radius * size;
    PIPS[value].forEach(([x, y]) => {
      const cx = size / 2 + x * spread;
      const cy = size / 2 + y * spread;
      // Slight inner shading so the pips look carved.
      const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      g.addColorStop(0, shade(color, 0.25));
      g.addColorStop(1, color);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, value === 1 && pips.oneColor ? r * 1.35 : r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// Lighten a CSS color by `amount` (0..1).
function shade(color, amount) {
  const c = new THREE.Color(color);
  c.lerp(new THREE.Color('#ffffff'), amount);
  return `#${c.getHexString()}`;
}

// Returns { 1: Texture, ..., 6: Texture }. Custom images load in the background.
export function createFaceTextures(config) {
  const loader = new THREE.TextureLoader();
  const out = {};
  for (let v = 1; v <= 6; v++) {
    const url = config.pips.images && config.pips.images[v];
    if (url) {
      out[v] = loader.load(url);
      out[v].colorSpace = THREE.SRGBColorSpace;
    } else {
      out[v] = drawFace(v, config.body.color, config.pips);
    }
  }
  return out;
}
