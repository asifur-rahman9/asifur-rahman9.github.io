import { useEffect, useRef } from 'react';
import { mountGame } from '../lib/game';

// React wrapper around the canvas-free runner game. Hydrated with client:visible,
// so its JS only loads once the visitor scrolls near it.
export default function DogGame() {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => (ref.current ? mountGame(ref.current) : undefined), []);
  return (
    <button ref={ref} className="game" type="button" aria-label="Dog runner game. Press Space or click to jump.">
      <span className="game-fallback">loading game…</span>
    </button>
  );
}
