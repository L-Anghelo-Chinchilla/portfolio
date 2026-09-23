import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';

// "Cast the dice" speech bubble, shown while the browser blocks sound: the click/tap
// it asks for unlocks audio and tosses the dice. Lives outside the lazy dice chunk so
// it appears with the page instead of waiting for three.js to download.
// It sits right of the hero drawing with its tail pointing at it; on narrow screens
// there is no room there, so it goes below it.
const BUBBLE_BG = 'rgb(212, 212, 212)';
const BUBBLE_CSS = `
@keyframes dice-prompt-in { from { opacity: 0; } to { opacity: 1; } }
.dice-bubble {
  position: absolute;
  left: calc(100% + 16px);
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 14px;
  border-radius: 14px;
  background: ${BUBBLE_BG};
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  color: #707070;
  font: 600 13px/1.35 system-ui, sans-serif;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 500ms ease;
}
.dice-bubble-tail {
  position: absolute;
  right: 100%;
  top: 50%;
  width: 12px;
  height: 16px;
  margin-top: -8px;
  background: inherit;
  backdrop-filter: inherit;
  -webkit-backdrop-filter: inherit;
  clip-path: polygon(100% 0, 0 50%, 100% 100%);
}
@media (max-width: 600px) {
  .dice-bubble { left: 50%; top: calc(100% + 16px); transform: translateX(-50%); }
  .dice-bubble-tail {
    right: auto; left: 50%; top: auto; bottom: 100%;
    width: 16px; height: 12px; margin: 0 0 0 -8px;
    clip-path: polygon(0 100%, 50% 0, 100% 100%);
  }
}`;

// Puts the bubble into the anchor next to the hero drawing (see Presentation.js).
// Without that anchor (e.g. another tab is open) it floats in the middle of the scope.
function place(bubble, side, scope) {
  const anchor = document.getElementById('dice-prompt-anchor');
  if (anchor && anchor.offsetParent) return createPortal(bubble, anchor);
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      [side]: `min(${scope.width / 2}px, 50vw)`,
      width: 0,
      height: 0,
      zIndex: scope.zIndex,
    }}
    >
      {bubble}
    </div>
  );
}

// visible: true fades it in, false fades it out; onHidden runs when it's gone.
function DicePrompt({ visible, onHidden, side, scope }) {
  const isTouch = useMemo(() => window.matchMedia
    && window.matchMedia('(hover: none) and (pointer: coarse)').matches, []);
  return place(
    <div
      role="status"
      className="dice-bubble"
      onTransitionEnd={() => { if (!visible) onHidden(); }}
      style={{
        opacity: visible ? 1 : 0,
        animation: visible ? 'dice-prompt-in 500ms ease' : undefined,
      }}
    >
      <style>{BUBBLE_CSS}</style>
      <span className="dice-bubble-tail" />
      cast the dice!
      <br />
      {isTouch ? 'tap' : 'click'} anywhere!
    </div>,
    side,
    scope,
  );
}

export default DicePrompt;
