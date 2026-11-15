import { useEffect, useRef } from 'react';
import { mountGame } from '../lib/game';

// Canvas runner game. Hydrated with client:visible so its JS loads only when scrolled near.
export default function DuckGame() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? mountGame(ref.current) : undefined), []);
  return (
    <div ref={ref} className="game" role="button" tabIndex={0}
      aria-label="Duck runner game. Press Space or click to jump, press again in the air to flap.">
      <canvas aria-hidden="true" />
      <span className="game-fallback">loading game…</span>
    </div>
  );
}
