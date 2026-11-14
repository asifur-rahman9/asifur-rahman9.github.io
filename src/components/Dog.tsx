import { useEffect, useRef, useState } from 'react';

type Mood = 'idle' | 'pet' | 'sleep';

// Pixel dog that strolls along the hero. Click to pet; ignore him and he naps.
export default function Dog() {
  const [mood, setMood] = useState<Mood>('idle');
  const moodT = useRef<number>();
  const sleepT = useRef<number>();

  const sleepSoon = () => {
    clearTimeout(sleepT.current);
    sleepT.current = window.setTimeout(() => setMood('sleep'), 9000);
  };
  const pet = () => {
    clearTimeout(moodT.current);
    clearTimeout(sleepT.current);
    setMood('pet');
    moodT.current = window.setTimeout(() => { setMood('idle'); sleepSoon(); }, 2400);
  };

  useEffect(() => {
    sleepSoon();
    window.addEventListener('pet-dog', pet); // fired by the terminal "pet" command
    return () => { window.removeEventListener('pet-dog', pet); clearTimeout(moodT.current); clearTimeout(sleepT.current); };
  }, []);

  const sleeping = mood === 'sleep';
  return (
    <button id="dog" type="button" aria-label="Pet the dog" className={mood !== 'idle' ? 'stop' : ''} onClick={pet}>
      <span className="flip" aria-hidden="true">
        <span className="shadow abs" />
        <span className="body abs">
          <svg width="80" height="60" viewBox="0 0 16 12" shapeRendering="crispEdges" style={{ display: 'block', overflow: 'visible' }}>
            <g className="tail"><rect x="0" y="1" width="1" height="2" fill="#B07A45" /><rect x="1" y="2" width="1" height="3" fill="#B07A45" /></g>
            <rect x="2" y="5" width="9" height="4" fill="#B07A45" /><rect x="4" y="5" width="4" height="1" fill="#8F5F33" /><rect x="4" y="8" width="5" height="1" fill="#EAD7B7" />
            <g className="legA"><rect x="3" y="9" width="1" height="3" fill="#B07A45" /><rect x="5" y="9" width="1" height="3" fill="#B07A45" /><rect x="8" y="9" width="1" height="3" fill="#B07A45" /><rect x="10" y="9" width="1" height="3" fill="#B07A45" /></g>
            <g className="legB" style={{ opacity: 0 }}><rect x="2" y="9" width="1" height="3" fill="#B07A45" /><rect x="4" y="9" width="1" height="2" fill="#B07A45" /><rect x="9" y="9" width="1" height="2" fill="#B07A45" /><rect x="11" y="9" width="1" height="3" fill="#B07A45" /></g>
            <rect x="9" y="3" width="1" height="3" fill="#B07A45" /><rect x="10" y="1" width="5" height="4" fill="#B07A45" /><rect x="10" y="1" width="2" height="3" fill="#6B4423" />
            <rect x="14" y="3" width="2" height="2" fill="#EAD7B7" /><rect x="15" y="3" width="1" height="1" fill="#111" />
            <rect x="9" y="5" width="2" height="1" fill="#7AA2F7" />
            <g style={{ opacity: sleeping ? 0 : 1 }}><rect x="12" y="2" width="1" height="1" fill="#0B0F14" /><rect x="13" y="2" width="2" height="1" fill="#0B0F14" /><rect x="13" y="2" width="1" height="1" fill="#5CC8FF" /></g>
            <rect x="13" y="2" width="2" height="1" fill="#3B2414" opacity={sleeping ? 1 : 0} />
            <rect x="14" y="4" width="1" height="1" fill="#3B2414" />
          </svg>
        </span>
      </span>
      <span aria-hidden="true">
        {mood === 'pet' &&
          [[40, -14, 18, 0], [62, -4, 14, 0.45], [20, -2, 12, 0.9]].map(([l, t, s, d], i) => (
            <span key={i} className="fx acc" style={{ left: l, top: t, fontSize: s, animationDelay: `${d}s` }}>♥</span>
          ))}
        {sleeping && (
          <>
            <span className="fx mono zz" style={{ left: 60, top: -10 }}>z</span>
            <span className="fx mono zz" style={{ left: 74, top: -20, fontSize: 12, animationDelay: '1.2s' }}>z</span>
          </>
        )}
      </span>
    </button>
  );
}
