import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { mergeConfig } from './diceConfig';
import { canPlaySound } from './diceSounds';
import DicePrompt from './DicePrompt';

// three.js is big (~600 KB), so the dice lives in its own chunk that is only
// downloaded after the page and all its images have finished loading, and the
// browser is idle. This keeps it from delaying the portfolio's images.
const Dice3D = lazy(() => import('./Dice3D'));

// Safety net in case the load event takes very long (e.g. a stuck image).
const MAX_WAIT_MS = 10000;

function LazyDice(props) {
  const [ready, setReady] = useState(false);
  // The initial throw waits for this; see the sound check below.
  const [released, setReleased] = useState(false);
  // "Cast the dice" bubble: null | 'shown' | 'hiding'.
  const [prompt, setPrompt] = useState(null);
  const config = useMemo(() => mergeConfig(props.config), [props.config]);
  const throwEnabled = config.throw.enabled;
  const soundEnabled = config.sound.enabled;
  const respectReducedMotion = config.respectReducedMotion;

  useEffect(() => {
    let done = false;
    let idleId = null;
    const whenIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback || clearTimeout;

    const start = () => {
      if (done) return;
      done = true;
      idleId = whenIdle(() => setReady(true), { timeout: 2000 });
    };

    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    const fallback = setTimeout(start, MAX_WAIT_MS);

    return () => {
      window.removeEventListener('load', start);
      clearTimeout(fallback);
      if (idleId !== null) cancelIdle(idleId);
    };
  }, []);

  // Sound check, done with the page (not when the dice has loaded): if the browser
  // blocks sound, the throw is held back and a bubble asks for a click/tap. That click
  // unlocks audio and tosses the dice, loading it right away if it isn't yet.
  useEffect(() => {
    const reducedMotion = respectReducedMotion
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!throwEnabled || !soundEnabled || reducedMotion) {
      setReleased(true);
      return undefined;
    }
    let cancelled = false;
    const removeListeners = () => {
      window.removeEventListener('click', onGesture, true);
      window.removeEventListener('keydown', onGesture, true);
    };
    function onGesture() {
      removeListeners();
      setPrompt('hiding');
      setReleased(true);
      setReady(true);
    }
    canPlaySound().then((ok) => {
      if (cancelled) return;
      if (ok) { setReleased(true); return; }
      setPrompt('shown');
      window.addEventListener('click', onGesture, true);
      window.addEventListener('keydown', onGesture, true);
    });
    return () => {
      cancelled = true;
      removeListeners();
    };
  }, [throwEnabled, soundEnabled, respectReducedMotion]);

  return (
    <>
      {prompt && (
        <DicePrompt
          visible={prompt === 'shown'}
          onHidden={() => setPrompt(null)}
          side={config.scope.side === 'left' ? 'left' : 'right'}
          scope={config.scope}
        />
      )}
      {ready && (
        <Suspense fallback={null}>
          <Dice3D {...props} released={released} />
        </Suspense>
      )}
    </>
  );
}

export default LazyDice;
