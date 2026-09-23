// Default configuration for <Dice3D />.
// Override any of these by passing a (partial) `config` prop:
//   <Dice3D config={{ body: { color: '#1e3a8a' }, pips: { color: '#fff' } }} />
// Nested objects are merged, so you only need to set what you want to change.

const WOODBLOCK = `${process.env.PUBLIC_URL}/sounds/woodblock-3.mp3`;

const diceConfig = {
  // ---- Scope (the area the dice lives in) --------------------------------
  scope: {
    width: 500,          // px, horizontal scope. Clamped to the viewport width.
    side: 'right',       // 'right' | 'left'
    zIndex: 99999,       // below the navbar (100000) so the dice goes under it
    padding: { top: 70, bottom: 16, left: 16, right: 16 }, // px kept free inside the scope
    hideBelowWidth: 0,   // px, hide the dice on screens narrower than this (0 = never hide)
  },

  // ---- Geometry ------------------------------------------------------------
  size: 70,              // px, edge length of the cube
  bevelRadius: 0.14,     // 0 = sharp cube, 0.5 = very round (relative to size)
  bevelSegments: 5,      // smoothness of the rounded edges

  // ---- Surface / material ----------------------------------------------------
  body: {
    color: '#fdfdfd',
    roughness: 0.35,     // 0 = mirror-like, 1 = matte
    metalness: 0.0,
    clearcoat: 0.6,      // lacquer layer on top (0..1)
    clearcoatRoughness: 0.2,
    sheen: 0,            // velvet-like sheen (0..1)
    sheenColor: '#ffffff',
    transmission: 0,     // 0 = opaque, 1 = glass-like (try with roughness ~0.1)
    opacity: 1,
    emissive: '#000000',
    emissiveIntensity: 0,
  },

  // ---- Faces -------------------------------------------------------------------
  pips: {
    style: 'dots',       // 'dots' | 'numbers'
    color: '#1b2b34',
    oneColor: '#c0392b', // color for the single pip on face 1 (null = same as `color`)
    radius: 0.09,        // dot radius relative to the face (dots style)
    font: 'bold 600px Georgia, serif', // numbers style ("600px" is scaled to the texture)
    border: { width: 0, color: '#1b2b34' }, // optional square outline on every face (relative 0..0.1)
    textureSize: 512,    // px per face texture (higher = sharper, more memory)
    // Optional: fully custom face images. Map of value -> image URL, e.g. { 1: logo }.
    images: null,
  },

  // ---- Lighting ------------------------------------------------------------------
  lights: {
    ambient: { color: '#ffffff', intensity: 0.9 },
    key: { color: '#ffffff', intensity: 2.2, position: [-0.3, 1, 0.5] }, // also casts the shadow
    fill: { color: '#bfe9ff', intensity: 0.6, position: [1, 0.2, -0.3] },
  },

  // Soft studio reflections (makes clearcoat / metalness visible).
  environment: { enabled: true, intensity: 0.35 },

  // ---- Shadow (cast by the key light onto an invisible floor) -----------------
  shadow: {
    enabled: true,
    color: '#003a2c',
    opacity: 0.3,
    blur: 6,             // shadow edge softness
    mapSize: 2048,       // shadow texture resolution
  },

  // ---- Initial throw animation ---------------------------------------------------
  throw: {
    enabled: true,
    duration: 1900,      // ms
    startScale: 4,       // how "close to the viewer" the dice starts (auto-limited to fit the scope)
    spins: 3,            // full extra turns while flying
    bounces: 2,
  },

  // ---- Scroll rolls ----------------------------------------------------------------
  // Each roll tips the dice over one bottom edge (the edge stays on the floor), so it
  // lands on an adjacent face and moves exactly one tip over.
  roll: {
    enabled: true,
    duration: 260,       // ms per tip (lower = faster)
    scrollThreshold: 8,  // px a scroll gesture must travel before it rolls the dice
    scrollIdle: 180,     // ms without scrolling that ends a gesture (1 gesture = 1 roll)
  },

  // ---- Idle moves ----------------------------------------------------------------
  // When nothing happens, the dice tips over by itself after a random pause.
  idle: {
    enabled: true,       // false = only move on scroll
    minDelay: 4000,      // ms, shortest pause between idle tips
    maxDelay: 9000,      // ms, longest pause between idle tips
  },

  // ---- Sound -------------------------------------------------------------------------
  // An audio file URL / array of URLs (one is picked at random), 'synth' for a wooden
  // knock generated in code with ZzFX (MIT), or null to turn that sound off.
  // Default: "WoodBlock 3" by Geoff Bremner, https://freesound.org/s/870350/
  // (CC BY-NC 4.0: keep the credit in the footer, non-commercial use only).
  // Browsers keep audio muted until the visitor clicks/taps/presses a key once.
  sound: {
    enabled: true,
    volume: 0.5,         // 0..1
    toss: WOODBLOCK,     // played on every bounce of the initial throw (quieter each time)
    land: WOODBLOCK,     // played at the end of every tip
  },

  // ---- Misc ------------------------------------------------------------------------
  // Which face counts as the result: the one pointing up in the isometric scene.
  // Rest orientation is snapped to 90deg steps so the isometric look never changes.
  respectReducedMotion: true,
  pixelRatioCap: 2,
  onResult: null,        // (value) => void, called whenever the dice settles
};

export default diceConfig;
