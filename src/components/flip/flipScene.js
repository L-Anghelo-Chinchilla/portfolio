// three.js "game stage" drawn behind the page while it jumps between tabs:
// a moving neon grid floor with stars and a horizon glow (perspective camera), plus a
// pixel-space layer (orthographic camera) with the page's shadow, dust and sparkles.
import * as THREE from 'three';

const BG = 0x0d2f3a;           // matches the overlay's CSS gradient near the horizon
const GRID_MAIN = 0x7ff5d0;
const GRID_SUB = 0x2f9c84;
const CELL = 2;                // grid cell size, used to loop the scrolling floor
const SPARKLE_COLORS = [0xfff6a8, 0x9ff3d6, 0xffffff, 0xffb3e6];

function radialTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createFlipScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;

  // ---- World: grid floor, stars, horizon glow ---------------------------------------
  const world = new THREE.Scene();
  world.fog = new THREE.Fog(BG, 8, 55);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 3, 10);
  camera.lookAt(0, 1.2, -10);

  const grid = new THREE.GridHelper(160, 80, GRID_MAIN, GRID_SUB);
  grid.material.transparent = true;
  grid.material.opacity = 0.75;
  world.add(grid);

  const glowTex = radialTexture('rgba(127,245,208,0.9)', 'rgba(127,245,208,0)');
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, transparent: true, opacity: 0.55, fog: false, depthWrite: false,
  }));
  glow.position.set(0, 0, -60);
  glow.scale.set(140, 40, 1);
  world.add(glow);

  const STAR_COUNT = 260;
  const starPos = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 180;
    starPos[i * 3 + 1] = 3 + Math.random() * 60;
    starPos[i * 3 + 2] = -70 - Math.random() * 20;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const dotTex = radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)');
  const starMat = new THREE.PointsMaterial({
    map: dotTex, size: 0.9, transparent: true, opacity: 0.9, fog: false, depthWrite: false,
  });
  const stars = new THREE.Points(starGeo, starMat);
  world.add(stars);

  // ---- HUD layer in screen pixels (x right, y down -> three y = -y) -----------------
  const hud = new THREE.Scene();
  const ortho = new THREE.OrthographicCamera(0, 1, 0, -1, -10, 10);

  const shadowTex = radialTexture('rgba(0,0,0,0.85)', 'rgba(0,0,0,0)');
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
  );
  hud.add(shadow);

  const particles = [];
  for (let i = 0; i < 140; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: dotTex, transparent: true, depthWrite: false,
    }));
    sprite.visible = false;
    hud.add(sprite);
    particles.push({ sprite, life: 0, max: 1, vx: 0, vy: 0, size: 1, grow: 1, gravity: 0, drag: 0, alpha: 1 });
  }
  let nextParticle = 0;

  function spawn(opts) {
    const p = particles[nextParticle];
    nextParticle = (nextParticle + 1) % particles.length;
    Object.assign(p, opts, { life: 0 });
    p.sprite.material.color.setHex(opts.color);
    p.sprite.position.set(opts.x, -opts.y, 0);
    p.sprite.visible = true;
  }

  let width = 1;
  let height = 1;
  function resize(w, h) {
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    ortho.right = w;
    ortho.bottom = -h;
    ortho.updateProjectionMatrix();
  }

  let time = 0;
  let floorZ = 0;

  return {
    resize,

    // Dust kicked up along the bottom edge of the page (takeoff and landing).
    burst(x, y, w, strength = 1) {
      const n = Math.round(30 * strength);
      for (let i = 0; i < n; i++) {
        const x0 = x + (Math.random() - 0.5) * w;
        const side = x0 < x ? -1 : 1;
        spawn({
          x: x0,
          y: y - Math.random() * 6,
          vx: side * (60 + Math.random() * 320) * strength,
          vy: -(20 + Math.random() * 140) * strength,
          size: 14 + Math.random() * 26,
          grow: 2.6,
          gravity: 160,
          drag: 3.2,
          max: 0.55 + Math.random() * 0.5,
          alpha: 0.75,
          color: 0xe6fff6,
        });
      }
    },

    // Small sparkles thrown off the spinning edges.
    sparkle(x, y, dir) {
      spawn({
        x,
        y,
        vx: dir * (80 + Math.random() * 220),
        vy: (Math.random() - 0.7) * 160,
        size: 6 + Math.random() * 10,
        grow: 0.1,
        gravity: 260,
        drag: 1.2,
        max: 0.35 + Math.random() * 0.45,
        alpha: 1,
        color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
      });
    },

    // state: { bottom, cx, cardW, lift, H, air, alpha }
    update(dt, state) {
      if (canvas.clientWidth !== width || canvas.clientHeight !== height) {
        resize(canvas.clientWidth, canvas.clientHeight);
      }
      time += dt;

      // The floor rushes towards the camera, faster while the page is in the air.
      floorZ = (floorZ + dt * (state.air ? 14 : 4)) % CELL;
      grid.position.z = floorZ;
      starMat.opacity = 0.65 + 0.3 * Math.sin(time * 3.1);
      glow.material.opacity = 0.45 + 0.12 * Math.sin(time * 1.7);

      // Shadow stays on the floor and shrinks/fades as the page rises.
      const h = Math.min(1, state.lift / state.H);
      shadow.position.set(state.cx, -state.bottom, 0);
      shadow.scale.set(state.cardW * (1.15 - 0.55 * h), 46 * (1 - 0.5 * h), 1);
      shadow.material.opacity = state.alpha * (0.75 - 0.5 * h);

      for (const p of particles) {
        if (!p.sprite.visible) continue;
        p.life += dt;
        if (p.life >= p.max) { p.sprite.visible = false; continue; }
        const damp = Math.exp(-p.drag * dt);
        p.vx *= damp;
        p.vy = p.vy * damp + p.gravity * dt;
        p.sprite.position.x += p.vx * dt;
        p.sprite.position.y -= p.vy * dt;
        const k = p.life / p.max;
        const s = p.size * (1 + (p.grow - 1) * k);
        p.sprite.scale.set(s, s, 1);
        p.sprite.material.opacity = p.alpha * (1 - k) * state.alpha;
      }

      renderer.clear();
      renderer.render(world, camera);
      renderer.clearDepth();
      renderer.render(hud, ortho);
    },

    clear() {
      for (const p of particles) p.sprite.visible = false;
      renderer.clear();
    },
  };
}
