import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeConfig } from './diceConfig';
import { createFaceTextures } from './faceTextures';
import { createDiceSounds } from './diceSounds';

// BoxGeometry material order is +X, -X, +Y, -Y, +Z, -Z. Opposite faces add up to 7.
const FACE_VALUES = [3, 4, 1, 6, 2, 5];
const FACE_NORMALS = {
  3: new THREE.Vector3(1, 0, 0),
  4: new THREE.Vector3(-1, 0, 0),
  1: new THREE.Vector3(0, 1, 0),
  6: new THREE.Vector3(0, -1, 0),
  2: new THREE.Vector3(0, 0, 1),
  5: new THREE.Vector3(0, 0, -1),
};
const UP = new THREE.Vector3(0, 1, 0);
// The 4 directions the dice can tip towards on the floor.
const FLOOR_DIRECTIONS = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
];
// Part of the throw spent flying; the rest are bounces on the floor.
const FLIGHT = 0.55;
const ISO_DIRECTION = new THREE.Vector3(1, 1, 1).normalize();

const clamp = (v, min, max) => (min > max ? (min + max) / 2 : Math.min(max, Math.max(min, v)));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
// Tipping over: a push to start, then it accelerates as it falls onto the next face.
const easeTip = (t) => t * (0.35 + 0.65 * t);
const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

// Rest orientation showing `value` on top, snapped to a 90deg yaw so the
// isometric silhouette is always the same.
function restQuaternion(value) {
  const tilt = new THREE.Quaternion().setFromUnitVectors(FACE_NORMALS[value], UP);
  const yaw = new THREE.Quaternion().setFromAxisAngle(UP, randomInt(0, 3) * (Math.PI / 2));
  return yaw.multiply(tilt);
}

function randomQuaternion() {
  const u = Math.random(), v = Math.random(), w = Math.random();
  return new THREE.Quaternion(
    Math.sqrt(1 - u) * Math.sin(2 * Math.PI * v),
    Math.sqrt(1 - u) * Math.cos(2 * Math.PI * v),
    Math.sqrt(u) * Math.sin(2 * Math.PI * w),
    Math.sqrt(u) * Math.cos(2 * Math.PI * w),
  );
}

function randomAxis() {
  return new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
}

// `released`: the initial throw waits (dice hidden) until this is true. LazyDice
// holds it back while the browser blocks sound, until the visitor clicks/taps.
function Dice3D({ config: userConfig, released = true }) {
  const containerRef = useRef(null);
  const config = useMemo(() => mergeConfig(userConfig), [userConfig]);
  // Rebuild the scene only when a serialisable option actually changes.
  const configKey = JSON.stringify(config);
  const onResultRef = useRef(config.onResult);
  onResultRef.current = config.onResult;
  const releasedRef = useRef(released);
  releasedRef.current = released;
  const tossRef = useRef(null); // starts the waiting throw; set by the scene effect

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const cfg = JSON.parse(configKey);
    const { scope } = cfg;
    const reducedMotion = cfg.respectReducedMotion
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- Renderer / scene / isometric camera ------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cfg.pixelRatioCap));
    renderer.shadowMap.enabled = cfg.shadow.enabled;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    let pmrem = null;
    if (cfg.environment.enabled) {
      pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = cfg.environment.intensity;
    }

    // 1 world unit == 1 CSS pixel, so bounds can be computed in pixels.
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 10000);
    camera.position.copy(ISO_DIRECTION).multiplyScalar(4000);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const camRight = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const camUp = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const camBack = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 2);

    // ---- Lights ------------------------------------------------------------
    const { lights } = cfg;
    scene.add(new THREE.AmbientLight(lights.ambient.color, lights.ambient.intensity));
    const key = new THREE.DirectionalLight(lights.key.color, lights.key.intensity);
    key.position.fromArray(lights.key.position).normalize().multiplyScalar(2000);
    key.castShadow = cfg.shadow.enabled;
    key.shadow.mapSize.set(cfg.shadow.mapSize, cfg.shadow.mapSize);
    key.shadow.radius = cfg.shadow.blur;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 5000;
    key.shadow.bias = -0.0005;
    scene.add(key, key.target);
    const fill = new THREE.DirectionalLight(lights.fill.color, lights.fill.intensity);
    fill.position.fromArray(lights.fill.position).normalize().multiplyScalar(2000);
    scene.add(fill);

    // ---- Invisible floor that only shows the dice's shadow ------------------
    const floorGeometry = new THREE.PlaneGeometry(1, 1);
    const floorMaterial = new THREE.ShadowMaterial({
      color: cfg.shadow.color,
      opacity: cfg.shadow.opacity,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.visible = cfg.shadow.enabled;
    scene.add(floor);

    // ---- The dice ------------------------------------------------------------
    const a = cfg.size;
    const geometry = new RoundedBoxGeometry(a, a, a, cfg.bevelSegments, cfg.bevelRadius * a);
    const textures = createFaceTextures(cfg);
    const { body } = cfg;
    const materials = FACE_VALUES.map((value) => new THREE.MeshPhysicalMaterial({
      map: textures[value],
      color: '#ffffff', // the texture already carries the body color
      roughness: body.roughness,
      metalness: body.metalness,
      clearcoat: body.clearcoat,
      clearcoatRoughness: body.clearcoatRoughness,
      sheen: body.sheen,
      sheenColor: new THREE.Color(body.sheenColor),
      transmission: body.transmission,
      thickness: body.transmission > 0 ? a : 0,
      transparent: body.opacity < 1,
      opacity: body.opacity,
      emissive: new THREE.Color(body.emissive),
      emissiveIntensity: body.emissiveIntensity,
    }));
    const dice = new THREE.Mesh(geometry, materials);
    dice.castShadow = true;
    scene.add(dice);

    const sounds = createDiceSounds(cfg.sound);
    // Distance from the center to the axis of a rounded bottom edge (horizontally and
    // vertically). Tipping rotates around that axis, so the edge stays on the floor.
    const edge = a / 2 - Math.min(cfg.bevelRadius * a, a / 2);

    // ---- Layout: scope size and bounds ------------------------------------------
    // Screen coordinates are pixels relative to the scope center, y pointing up.
    const R = (a * Math.sqrt(3)) / 2; // projected radius of the cube, whatever its rotation
    const upY = camUp.y; // how much 1 unit of world height moves the dice up on screen
    let W = 0;
    let H = 0;

    const bounds = (s = 1) => {
      const r = R * s;
      return {
        xMin: -W / 2 + scope.padding.left + r,
        xMax: W / 2 - scope.padding.right - r,
        yMin: -H / 2 + scope.padding.bottom + r,
        yMax: H / 2 - scope.padding.top - r,
      };
    };
    const fitScale = () => Math.max(1, Math.min(
      (W - scope.padding.left - scope.padding.right) / (2 * R),
      (H - scope.padding.top - scope.padding.bottom) / (2 * R),
    ));

    // Screen point -> point on the floor (y = 0) that projects there.
    const floorPoint = (sx, sy, out) => {
      out.copy(camRight).multiplyScalar(sx).addScaledVector(camUp, sy);
      return out.addScaledVector(camBack, -out.y / camBack.y);
    };

    // ---- Dice state (all in screen space) ----------------------------------------
    const state = {
      x: 0,        // screen x of the dice center
      y: 0,        // screen y of the dice center (resting)
      height: 0,   // extra lift above the floor, world units
      scale: 1,
      quat: new THREE.Quaternion(),
      value: randomInt(1, 6),
      anim: null,
      pending: false,
      waiting: false,    // hidden, waiting for the first click to be tossed
      worldCenter: null, // set while tipping (position comes from the pivot edge)
    };
    // Hover spin state (see "Hover" below); declared early because rolls check it.
    const hoverSpin = {
      active: false,
      phase: 'idle', // 'rising' -> 'spinning' -> 'stopping' -> 'dropping'
      t: 0,          // progress of rising / dropping (0..1)
      angle: 0,      // spin around the vertical body diagonal
      speed: 0,
      target: 0,
      precession: 0, // wobble direction
      q0: new THREE.Quaternion(),
      c0: new THREE.Vector3(),       // resting center
      pivot: new THREE.Vector3(),    // center of the rounded corner touching the floor
      diagonal: new THREE.Vector3(), // corner -> center, in the resting pose
      tiltAxis: new THREE.Vector3(),
      tiltAngle: 0,
    };

    const tmp = new THREE.Vector3();
    const spin = new THREE.Quaternion();
    let dirty = true;

    // World position of the resting center for screen point (x, y) at scale s.
    const restCenter = (x, y, s, out) => {
      floorPoint(x, y - (a * s * 0.5) * upY, out);
      out.y = (a * s) / 2;
      return out;
    };

    const applyState = () => {
      const s = state.scale;
      const P = dice.position;
      if (state.worldCenter) {
        P.copy(state.worldCenter);
      } else {
        restCenter(state.x, state.y, s, P);
        P.y += state.height;
      }
      // Clamp the *rendered* center so the dice can never leave the scope.
      const b = bounds(s);
      const sx = P.dot(camRight);
      const sy = P.dot(camUp);
      P.addScaledVector(camRight, clamp(sx, b.xMin, b.xMax) - sx);
      P.addScaledVector(camUp, clamp(sy, b.yMin, b.yMax) - sy);
      dice.scale.setScalar(s);
      dice.quaternion.copy(state.quat);
      // Shadow fades while the dice is "close to the viewer".
      floorMaterial.opacity = cfg.shadow.opacity * clamp(1.6 - s * 0.6, 0, 1);
      dirty = true;
    };

    const randomSpot = () => {
      const b = bounds(1);
      return { x: lerp(b.xMin, b.xMax, Math.random()), y: lerp(b.yMin, b.yMax, Math.random()) };
    };

    // Value of the face currently pointing up for orientation `q`.
    const topValue = (q) => {
      let best = state.value;
      let bestDot = -Infinity;
      Object.keys(FACE_NORMALS).forEach((v) => {
        const d = tmp.copy(FACE_NORMALS[v]).applyQuaternion(q).y;
        if (d > bestDot) { bestDot = d; best = Number(v); }
      });
      return best;
    };

    // A roll tips the dice 90deg over one bottom edge, so the new top face is
    // always adjacent to the old one and the isometric alignment is kept.
    // Picks one of the 4 floor directions whose landing spot stays in the scope.
    const planRoll = () => {
      const b = bounds(1);
      const travel = 2 * edge; // the center goes from behind the pivot edge to in front of it
      const options = FLOOR_DIRECTIONS.map((dir) => {
        const x = state.x + dir.dot(camRight) * travel;
        const y = state.y + dir.dot(camUp) * travel;
        const overflow = Math.max(0, b.xMin - x, x - b.xMax) + Math.max(0, b.yMin - y, y - b.yMax);
        return { dir, x, y, overflow };
      });
      const good = options.filter((o) => o.overflow === 0);
      const pick = good.length
        ? good[randomInt(0, good.length - 1)]
        : options.reduce((m, o) => (o.overflow < m.overflow ? o : m));
      const axis = new THREE.Vector3().crossVectors(UP, pick.dir).normalize();
      const q1 = new THREE.Quaternion()
        .setFromAxisAngle(axis, Math.PI / 2)
        .multiply(state.quat)
        .normalize();
      const center = restCenter(state.x, state.y, 1, new THREE.Vector3());
      const pivot = center.clone().addScaledVector(pick.dir, edge);
      pivot.y = a / 2 - edge; // axis of the rounded bottom edge
      return {
        to: { x: pick.x, y: pick.y },
        axis,
        q1,
        pivot,
        offset: center.sub(pivot), // center relative to the pivot edge
        value: topValue(q1),
      };
    };

    const settle = () => {
      state.anim = null;
      state.worldCenter = null;
      state.height = 0;
      state.scale = 1;
      applyState();
      if (typeof onResultRef.current === 'function') onResultRef.current(state.value);
      if (state.pending) {
        state.pending = false;
        startRoll();
      }
      scheduleIdleRoll();
    };

    // ---- Idle: tip over on its own after a random pause --------------------------
    // Every settle restarts the countdown, so it never fires right after a scroll roll.
    let idleTimer = null;
    function scheduleIdleRoll() {
      clearTimeout(idleTimer);
      if (!cfg.idle.enabled || reducedMotion) return;
      const delay = lerp(cfg.idle.minDelay, cfg.idle.maxDelay, Math.random());
      idleTimer = setTimeout(() => {
        // Skip while the tab is hidden or the dice is already moving; try again later.
        if (document.hidden || state.anim) scheduleIdleRoll();
        else startRoll();
      }, delay);
    }

    // ---- Animations ------------------------------------------------------------------
    // Faces with several images pick a new one while the dice is moving.
    const shuffleFaces = () => {
      Object.values(textures).forEach((t) => t.userData.shuffle && t.userData.shuffle());
    };

    const startThrow = () => {
      shuffleFaces();
      const target = randomSpot();
      const s0 = Math.min(cfg.throw.startScale, fitScale() * 0.98);
      const b0 = bounds(s0);
      state.anim = {
        type: 'throw',
        start: performance.now(),
        duration: cfg.throw.duration,
        from: { x: (b0.xMin + b0.xMax) / 2, y: b0.yMin, scale: s0 },
        to: target,
        q0: randomQuaternion(),
        q1: restQuaternion(state.value),
        axis: randomAxis(),
        spins: cfg.throw.spins,
        impacts: throwImpacts(),
      };
    };

    // Moments (0..1 of the throw) where the dice hits the floor, with their loudness.
    function throwImpacts() {
      const n = Math.max(1, cfg.throw.bounces);
      const list = [{ t: FLIGHT, strength: 1 }];
      for (let i = 0; i < n; i++) {
        list.push({ t: FLIGHT + ((i + 1) / n) * (1 - FLIGHT), strength: 0.8 * Math.pow(0.55, i + 1) });
      }
      return list;
    }

    function startRoll() {
      if (state.waiting) return;
      if (state.anim || hoverSpin.active) { state.pending = true; return; }
      shuffleFaces();
      const plan = planRoll();
      state.value = plan.value;
      state.anim = {
        type: 'roll',
        start: performance.now(),
        duration: cfg.roll.duration,
        to: plan.to,
        q0: state.quat.clone(),
        q1: plan.q1,
        axis: plan.axis,
        pivot: plan.pivot,
        offset: plan.offset,
        center: new THREE.Vector3(),
      };
    }

    const stepAnimation = (now) => {
      const anim = state.anim;
      if (!anim) return;
      const t = Math.min(1, (now - anim.start) / anim.duration);

      if (anim.type === 'throw') {
        const flight = FLIGHT;
        while (anim.impacts.length && t >= anim.impacts[0].t) {
          sounds.play('toss', anim.impacts.shift().strength);
        }
        const move = easeOutCubic(t);
        state.x = lerp(anim.from.x, anim.to.x, move);
        state.y = lerp(anim.from.y, anim.to.y, move);
        if (t < flight) {
          const u = t / flight;
          state.scale = lerp(anim.from.scale, 1, easeOutCubic(u));
          state.height = Math.sin(Math.PI * u) * a * 1.2;
        } else {
          // Decaying bounces on the floor.
          state.scale = 1;
          const n = Math.max(1, cfg.throw.bounces);
          const u = ((t - flight) / (1 - flight)) * n;
          const i = Math.min(n - 1, Math.floor(u));
          state.height = Math.sin(Math.PI * (u - i)) * a * 0.9 * Math.pow(0.4, i + 1);
        }
        const r = easeOutCubic(Math.min(1, t / 0.9));
        spin.setFromAxisAngle(anim.axis, anim.spins * Math.PI * 2 * r);
        state.quat.slerpQuaternions(anim.q0, anim.q1, r).premultiply(spin);
      } else {
        // Rotate around the bottom edge: that edge stays on the floor.
        spin.setFromAxisAngle(anim.axis, (Math.PI / 2) * easeTip(t));
        state.quat.copy(anim.q0).premultiply(spin);
        state.worldCenter = anim.center.copy(anim.offset).applyQuaternion(spin).add(anim.pivot);
        state.scale = 1;
      }

      applyState();
      if (t >= 1) {
        state.quat.copy(anim.q1);
        state.x = anim.to.x;
        state.y = anim.to.y;
        if (anim.type === 'roll') sounds.play('land');
        settle();
      }
    };

    // ---- Sizing --------------------------------------------------------------------
    const resize = () => {
      W = Math.min(scope.width, window.innerWidth);
      H = window.innerHeight;
      container.style.width = `${W}px`;
      container.style.display = window.innerWidth < scope.hideBelowWidth ? 'none' : 'block';
      renderer.setSize(W, H);
      camera.left = -W / 2;
      camera.right = W / 2;
      camera.top = H / 2;
      camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
      const span = Math.max(W, H) * 2;
      floor.scale.set(span, span, 1);
      const sc = key.shadow.camera;
      sc.left = -span / 2; sc.right = span / 2; sc.top = span / 2; sc.bottom = -span / 2;
      sc.updateProjectionMatrix();
      // Keep the resting spot inside the (possibly smaller) scope.
      const b = bounds(1);
      state.x = clamp(state.x, b.xMin, b.xMax);
      state.y = clamp(state.y, b.yMin, b.yMax);
      if (state.anim && state.anim.to) {
        state.anim.to.x = clamp(state.anim.to.x, b.xMin, b.xMax);
        state.anim.to.y = clamp(state.anim.to.y, b.yMin, b.yMax);
      }
      applyState();
    };
    resize();

    // ---- Start ---------------------------------------------------------------------
    // Until `released`, the dice stays hidden (see the prop).
    tossRef.current = () => {
      if (!state.waiting) return;
      state.waiting = false;
      dice.visible = true;
      startThrow();
      stepAnimation(state.anim.start);
    };
    if (cfg.throw.enabled && !reducedMotion) {
      state.waiting = true;
      dice.visible = false;
      if (releasedRef.current) tossRef.current();
    } else {
      const spot = randomSpot();
      state.x = spot.x;
      state.y = spot.y;
      state.quat.copy(restQuaternion(state.value));
      settle();
    }

    // ---- Scroll -> roll (exactly one roll per scroll gesture) ------------------
    // A wheel notch or swipe fires many scroll events; they count as one gesture
    // until the page has been still for `scrollIdle` ms.
    //
    // Only the visitor's own scrolling counts: when something above the view changes
    // height (e.g. an auto-playing carousel), the browser shifts the page to keep the
    // view steady, which also fires 'scroll'. So a gesture can only start shortly after
    // real input (wheel, touch, key, click or scrollbar drag).
    const USER_INPUT = ['wheel', 'touchstart', 'touchmove', 'keydown', 'mousedown', 'pointerdown'];
    const INPUT_WINDOW_MS = 1000;
    let lastInput = -Infinity;
    const onUserInput = () => { lastInput = performance.now(); };
    let lastScrollY = window.scrollY;
    let gestureDistance = 0;
    let gestureRolled = false;
    let gestureTimer = null;
    const onScroll = () => {
      const y = window.scrollY;
      const moved = Math.abs(y - lastScrollY);
      lastScrollY = y;
      if (gestureTimer === null && performance.now() - lastInput > INPUT_WINDOW_MS) return;
      gestureDistance += moved;
      clearTimeout(gestureTimer);
      gestureTimer = setTimeout(() => {
        gestureTimer = null;
        gestureDistance = 0;
        gestureRolled = false;
      }, cfg.roll.scrollIdle);
      if (!cfg.roll.enabled || gestureRolled || gestureDistance < cfg.roll.scrollThreshold) return;
      gestureRolled = true;
      if (reducedMotion) {
        const plan = planRoll();
        state.value = plan.value;
        state.x = plan.to.x;
        state.y = plan.to.y;
        state.quat.copy(plan.q1);
        settle();
      } else {
        startRoll();
      }
    };
    USER_INPUT.forEach((e) => window.addEventListener(e, onUserInput, { passive: true, capture: true }));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);

    // ---- Hover: stand on the bottom corner and spin like a top ---------------------
    // The scope has pointer-events: none (it never blocks clicks), so hover is
    // detected from the cursor position instead of DOM events.
    //
    // The bottom corner facing the screen is the one touching the floor nearest the
    // viewer. The dice tips up around that corner until its body diagonal is vertical,
    // spins around it (with a slight wobble, like a top), and when the cursor leaves it
    // slows down to the next 120deg step and drops back. Every 120deg around the
    // diagonal the cube maps onto itself, so it lands axis-aligned in the same spot and
    // the isometric view is restored (the top face may change to a neighbour).
    const STEP = (Math.PI * 2) / 3;
    const hoverQuat = new THREE.Quaternion();
    const tiltQuat = new THREE.Quaternion();
    const wobbleQuat = new THREE.Quaternion();
    const wobbleAxis = new THREE.Vector3();
    const hoverCenter = new THREE.Vector3();
    let pointer = null;

    const onPointerMove = (e) => { pointer = { x: e.clientX, y: e.clientY }; };
    const onPointerOut = (e) => { if (!e.relatedTarget) pointer = null; };

    const isHovered = () => {
      if (!pointer || !cfg.hover.enabled || reducedMotion) return false;
      const rect = container.getBoundingClientRect();
      const P = dice.position;
      const cx = rect.left + W / 2 + P.dot(camRight);
      const cy = rect.top + H / 2 - P.dot(camUp);
      return Math.hypot(pointer.x - cx, pointer.y - cy) <= R * state.scale * cfg.hover.hitRadius;
    };

    const startHover = () => {
      const h = hoverSpin;
      h.active = true;
      h.phase = 'rising';
      h.t = 0;
      h.angle = 0;
      h.speed = 0;
      h.q0.copy(state.quat);
      restCenter(state.x, state.y, 1, h.c0);
      // Bottom corner closest to the camera (camera looks along -ISO_DIRECTION).
      h.pivot.set(Math.sign(ISO_DIRECTION.x) * edge, -edge, Math.sign(ISO_DIRECTION.z) * edge).add(h.c0);
      h.diagonal.subVectors(h.c0, h.pivot).normalize();
      h.tiltAxis.crossVectors(h.diagonal, UP).normalize();
      h.tiltAngle = h.diagonal.angleTo(UP);
    };

    // Pose: spin `angle` around the body diagonal, then tilt `theta` around the floor
    // corner (plus wobble while standing). The corner never leaves the floor.
    const applyHoverPose = (theta, wobble) => {
      const h = hoverSpin;
      hoverQuat.setFromAxisAngle(h.diagonal, h.angle);
      tiltQuat.setFromAxisAngle(h.tiltAxis, theta);
      hoverQuat.premultiply(tiltQuat);
      if (wobble > 0) {
        wobbleAxis.set(Math.cos(h.precession), 0, Math.sin(h.precession));
        wobbleQuat.setFromAxisAngle(wobbleAxis, wobble);
        hoverQuat.premultiply(wobbleQuat);
      }
      state.quat.copy(h.q0).premultiply(hoverQuat);
      state.worldCenter = hoverCenter.subVectors(h.c0, h.pivot).applyQuaternion(hoverQuat).add(h.pivot);
      applyState();
    };

    const stepHover = (dt) => {
      const h = hoverSpin;
      const hovered = isHovered();
      if (!h.active) {
        if (hovered && !state.anim && !state.waiting) startHover();
        else return;
      }
      const maxSpeed = cfg.hover.speed * Math.PI * 2;
      if (h.phase === 'stopping' && hovered) h.phase = 'spinning';
      if (h.phase === 'spinning' && !hovered) {
        h.phase = 'stopping';
        h.target = Math.max(STEP, Math.ceil(h.angle / STEP) * STEP);
      }
      const spinning = h.phase === 'rising' || h.phase === 'spinning';

      if (spinning) {
        h.speed = Math.min(maxSpeed, h.speed + cfg.hover.acceleration * Math.PI * 2 * dt);
        h.angle += h.speed * dt;
      } else if (h.phase === 'stopping') {
        // Slow down smoothly so it stops exactly on a 120deg step.
        const remaining = h.target - h.angle;
        h.speed = Math.max(1, Math.min(h.speed, remaining * 6));
        h.angle = Math.min(h.target, h.angle + h.speed * dt);
      }
      h.precession += h.speed * 0.3 * dt;

      let theta = h.tiltAngle;
      if (h.phase === 'rising') {
        h.t = Math.min(1, h.t + (dt * 1000) / cfg.hover.riseDuration);
        theta = h.tiltAngle * easeOutCubic(h.t);
        if (h.t >= 1) h.phase = 'spinning';
      } else if (h.phase === 'dropping') {
        h.t = Math.min(1, h.t + (dt * 1000) / cfg.hover.dropDuration);
        theta = h.tiltAngle * (1 - h.t * h.t); // falls faster and faster, like gravity
      }
      // A top wobbles more when it spins slowly; no wobble while tipping up or down.
      const standing = h.phase === 'spinning' || h.phase === 'stopping';
      // Capped: past ~35deg a neighbouring corner would sink into the floor.
      const maxWobble = Math.min(Math.max(cfg.hover.wobble, 0), 0.5);
      const wobble = standing ? maxWobble * (1 - 0.7 * (h.speed / maxSpeed)) : 0;
      applyHoverPose(theta, wobble);

      if (h.phase === 'stopping' && h.angle >= h.target) {
        h.phase = 'dropping';
        h.t = 0;
      } else if (h.phase === 'dropping' && h.t >= 1) {
        h.active = false;
        h.phase = 'idle';
        state.quat.normalize();
        state.value = topValue(state.quat);
        sounds.play('land');
        settle();
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerout', onPointerOut);

    // ---- Loop (renders only when something changed) --------------------------------
    let last = performance.now();
    let frame = requestAnimationFrame(function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      stepAnimation(now);
      stepHover(dt);
      if (dirty) {
        renderer.render(scene, camera);
        dirty = false;
      }
      frame = requestAnimationFrame(loop);
    });

    return () => {
      tossRef.current = null;
      cancelAnimationFrame(frame);
      clearTimeout(gestureTimer);
      clearTimeout(idleTimer);
      USER_INPUT.forEach((e) => window.removeEventListener(e, onUserInput, { capture: true }));
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', onPointerOut);
      geometry.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();
      materials.forEach((m) => m.dispose());
      Object.values(textures).forEach((t) => t.dispose());
      if (scene.environment) scene.environment.dispose();
      if (pmrem) pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [configKey]);

  useEffect(() => {
    if (released && tossRef.current) tossRef.current();
  }, [released]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        [config.scope.side === 'left' ? 'left' : 'right']: 0,
        width: `${config.scope.width}px`,
        maxWidth: '100vw',
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none', // never blocks clicks on the page
        zIndex: config.scope.zIndex,
      }}
    />
  );
}

export default Dice3D;
