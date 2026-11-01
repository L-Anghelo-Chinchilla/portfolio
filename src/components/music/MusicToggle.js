// Small round button to mute/unmute the background music. Only shown once the
// music has started.
import React, { useEffect, useState } from 'react';
import { getMusicState, onMusicChange, setMusicMuted } from './bgMusic';

function MusicToggle() {
  const [state, setState] = useState(getMusicState);
  useEffect(() => onMusicChange(setState), []);
  if (!state.playing) return null;

  return (
    <button
      type="button"
      onClick={() => setMusicMuted(!state.muted)}
      aria-label={state.muted ? 'Unmute music' : 'Mute music'}
      title={state.muted ? 'Unmute music' : 'Mute music'}
      style={{
        position: 'fixed',
        left: '16px',
        bottom: '16px',
        zIndex: 99998,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '2px solid white',
        backgroundColor: 'rgb(63, 164, 132)',
        color: 'white',
        fontSize: '20px',
        lineHeight: 1,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        cursor: 'pointer',
      }}
    >
      {state.muted ? '🔇' : '🔊'}
    </button>
  );
}

export default MusicToggle;
