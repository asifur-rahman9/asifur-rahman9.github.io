import { useEffect, useRef, useState } from 'react';

/*
 * Pixel scene along the bottom of the hero.
 * Story: a guy walks in carrying a MacBook, sits down and codes. The dog wakes up,
 * runs over, and the guy keeps throwing a stick that the dog fetches and brings back.
 * Visitors can click the dog to pet it at any time (it pauses, hearts, then carries on).
 * Everything is driven by one requestAnimationFrame loop over a small state machine.
 */

type Px = [number, number, number, number, string]; // x, y, w, h, fill (in sprite pixels)
const rects = (list: Px[]) => list.map(([x, y, w, h, f], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={f} />);

// palette
const HAIR = '#2B1D14', SKIN = '#D9A47A', HOOD = '#4F6BA8', HOOD_D = '#3E5690', PANTS = '#2A3240',
  SHOE = '#E5E7EB', MAC = '#C9CED6', MAC_D = '#9AA1AB', GLOW = '#7AA2F7', EYE = '#1A1A1A',
  FUR = '#B07A45', FUR_D = '#8F5F33', BELLY = '#EAD7B7', EAR = '#6B4423', STICK = '#8B5A2B';

const HEAD: Px[] = [[3, 0, 6, 2, HAIR], [3, 2, 6, 4, SKIN], [3, 2, 1, 3, HAIR], [8, 2, 1, 1, HAIR], [7, 3, 1, 1, EYE]];

function GuyWalk({ frame }: { frame: number }) {
  const legs: Px[] = frame
    ? [[4, 13, 2, 5, PANTS], [6, 13, 2, 5, PANTS], [4, 18, 3, 1, SHOE], [6, 18, 3, 1, SHOE]]
    : [[2, 13, 2, 5, PANTS], [8, 13, 2, 5, PANTS], [2, 18, 3, 1, SHOE], [8, 18, 3, 1, SHOE]];
  return (
    <svg width="48" height="76" viewBox="0 0 12 19" shapeRendering="crispEdges" style={{ display: 'block', overflow: 'visible' }}>
      {rects([...HEAD, [2, 6, 8, 7, HOOD], [2, 6, 1, 7, HOOD_D], [6, 7, 2, 4, HOOD_D],
        [5, 10, 7, 1, MAC], [5, 11, 7, 1, MAC_D], [7, 10, 1, 1, SKIN], ...legs])}
    </svg>
  );
}

function GuySit({ typing, throwing }: { typing: number; throwing: boolean }) {
  const arms: Px[] = throwing
    ? [[8, 0, 1, 6, HOOD_D], [8, -1, 1, 1, SKIN], [10, 9, 1, 1, SKIN]]
    : [[6, 8, 3, 1, HOOD_D], ...(typing ? [[9, 9, 1, 1, SKIN], [11, 9, 1, 1, SKIN]] : [[10, 9, 1, 1, SKIN], [12, 9, 1, 1, SKIN]]) as Px[]];
  return (
    <svg width="64" height="56" viewBox="0 0 16 14" shapeRendering="crispEdges" style={{ display: 'block', overflow: 'visible' }}>
      <rect x="12" y="5" width="1" height="5" fill={GLOW} opacity="0.35" />
      {rects([...HEAD, [8, 4, 1, 1, GLOW], [2, 6, 7, 5, HOOD], [2, 6, 1, 5, HOOD_D],
        [1, 11, 12, 2, PANTS], [0, 12, 2, 1, SHOE], [12, 12, 2, 1, SHOE],
        [8, 10, 6, 1, MAC], [13, 5, 1, 5, MAC], ...arms])}
    </svg>
  );
}

function DogSprite({ run, frame, asleep, carrying, wag }: { run: boolean; frame: number; asleep: boolean; carrying: boolean; wag: boolean }) {
  const legsA: Px[] = [[3, 9, 1, 3, FUR], [5, 9, 1, 3, FUR], [8, 9, 1, 3, FUR], [10, 9, 1, 3, FUR]];
  const legsB: Px[] = [[2, 9, 1, 3, FUR], [4, 9, 1, 2, FUR], [9, 9, 1, 2, FUR], [11, 9, 1, 3, FUR]];
  return (
    <svg width="80" height="60" viewBox="0 0 16 12" shapeRendering="crispEdges" style={{ display: 'block', overflow: 'visible' }}>
      <g className={wag ? 'tail wag' : 'tail'}>{rects([[0, 1, 1, 2, FUR], [1, 2, 1, 3, FUR]])}</g>
      {rects([[2, 5, 9, 4, FUR], [4, 5, 4, 1, FUR_D], [4, 8, 5, 1, BELLY],
        ...(run && frame ? legsB : legsA),
        [9, 3, 1, 3, FUR], [10, 1, 5, 4, FUR], [10, 1, 2, 3, EAR], [14, 3, 2, 2, BELLY], [15, 3, 1, 1, '#111'],
        [9, 5, 2, 1, GLOW], [14, 4, 1, 1, '#3B2414']])}
      {asleep
        ? <rect x="13" y="2" width="2" height="1" fill="#3B2414" />
        : rects([[12, 2, 1, 1, '#0B0F14'], [13, 2, 2, 1, '#0B0F14'], [13, 2, 1, 1, '#5CC8FF']])}
      {carrying && <rect x="13" y="4" width="6" height="1" fill={STICK} />}
    </svg>
  );
}

type DogMode = 'sleep' | 'toGuy' | 'sit' | 'wait' | 'fetch' | 'pickup' | 'return';
type GuyMode = 'walk' | 'code' | 'throw';
type Flight = { x0: number; x1: number; t0: number; dur: number };

const DOG_W = 80, GUY_SPEED = 70, DOG_RUN = 270, DOG_CARRY = 210, ARC = 90;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const GLYPHS = ['{ }', '</>', '=>', 'git push', 'fn()', '200 OK', ';'];

export default function HeroScene() {
  const box = useRef<HTMLDivElement>(null);
  const s = useRef({
    t: 0, w: 1200,
    guyX: -70, guyMode: 'walk' as GuyMode, guyT: 0,
    dogX: 900, dogDir: -1, dogMode: 'sleep' as DogMode, wakeAt: Infinity, until: 0,
    carrying: false, flight: null as Flight | null, stickGround: null as number | null,
    petUntil: 0, petKey: 0,
  });
  const [, render] = useState(0);

  const home = () => Math.max(24, Math.min(s.current.w * 0.08, 140));
  const rest = () => home() + 96;

  useEffect(() => {
    const st = s.current;
    const measure = () => { st.w = box.current?.offsetWidth ?? st.w; };
    measure();
    st.dogX = st.w - DOG_W - 40;
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);

    const pet = () => { st.petUntil = st.t + 1.8; st.petKey++; render((n) => n + 1); };
    window.addEventListener('pet-dog', pet); // terminal "pet" command

    // Reduced motion: skip the story, show the end state.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Object.assign(st, { guyX: home(), guyMode: 'code', dogX: rest(), dogMode: 'sit', dogDir: -1 });
      render((n) => n + 1);
      return () => { ro.disconnect(); window.removeEventListener('pet-dog', pet); };
    }

    let raf = 0, last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      st.t += dt;
      update(dt);
      render((n) => n + 1);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('pet-dog', pet); };
  }, []);

  // Move the dog toward x; returns true on arrival.
  function moveDog(x: number, speed: number, dt: number) {
    const st = s.current, d = x - st.dogX;
    if (Math.abs(d) <= speed * dt) { st.dogX = x; return true; }
    st.dogDir = Math.sign(d);
    st.dogX += Math.sign(d) * speed * dt;
    return false;
  }

  function update(dt: number) {
    const st = s.current, t = st.t;

    // guy
    if (st.guyMode === 'walk') {
      st.guyX += GUY_SPEED * dt;
      if (st.guyX >= home()) { st.guyX = home(); st.guyMode = 'code'; st.wakeAt = t + 0.8; }
    } else {
      st.guyX = home(); // keep pinned on resize
      if (st.guyMode === 'throw' && t - st.guyT > 0.35) st.guyMode = 'code';
    }

    // stick landing
    if (st.flight && t >= st.flight.t0 + st.flight.dur) { st.stickGround = st.flight.x1; st.flight = null; }

    // dog (frozen while being petted)
    if (t < st.petUntil) return;
    switch (st.dogMode) {
      case 'sleep':
        if (t > st.wakeAt) st.dogMode = 'toGuy';
        break;
      case 'toGuy':
      case 'return':
        if (moveDog(rest(), st.dogMode === 'return' ? DOG_CARRY : DOG_RUN, dt)) {
          if (st.carrying) { st.carrying = false; st.stickGround = st.dogX - 14; }
          st.dogDir = -1; // face the guy
          st.dogMode = 'sit';
          st.until = t + rand(2.2, 4);
        }
        break;
      case 'sit':
        if (t > st.until && st.guyMode === 'code') {
          // throw
          st.guyMode = 'throw'; st.guyT = t; st.stickGround = null;
          const x1 = rand(Math.max(rest() + 160, st.w * 0.45), st.w - 60);
          st.flight = { x0: home() + 34, x1, t0: t + 0.15, dur: 0.6 + (x1 - home()) / 900 };
          st.dogMode = 'wait'; st.until = t + 0.3;
        }
        break;
      case 'wait':
        if (t > st.until) st.dogMode = 'fetch';
        break;
      case 'fetch': {
        const target = (st.flight?.x1 ?? st.stickGround ?? st.dogX) - 72;
        if (moveDog(target, DOG_RUN, dt) && st.stickGround !== null) { st.dogMode = 'pickup'; st.until = t + 0.35; }
        break;
      }
      case 'pickup':
        if (t > st.until) { st.carrying = true; st.stickGround = null; st.dogMode = 'return'; }
        break;
    }
  }

  const st = s.current, t = st.t;
  const petting = t < st.petUntil;
  const running = !petting && ['toGuy', 'fetch', 'return'].includes(st.dogMode);
  const runFrame = Math.floor(t / 0.09) % 2;

  // stick position while flying (parabola)
  let flying: { x: number; y: number; r: number } | null = null;
  if (st.flight && t >= st.flight.t0) {
    const p = Math.min(1, (t - st.flight.t0) / st.flight.dur);
    flying = { x: st.flight.x0 + (st.flight.x1 - st.flight.x0) * p, y: 40 + 4 * ARC * p * (1 - p) - 26 * p, r: p * 720 };
  }
  const glyphKey = Math.floor(t / 1.3);

  return (
    <div className="scene" ref={box} aria-hidden="false">
      {/* the guy */}
      <div className="guy" style={{ left: st.guyX }}>
        {st.guyMode === 'walk'
          ? <GuyWalk frame={Math.floor(t / 0.22) % 2} />
          : <GuySit typing={Math.floor(t * 6) % 2} throwing={st.guyMode === 'throw'} />}
        {st.guyMode === 'code' && (
          <span key={glyphKey} className="glyph mono">{GLYPHS[glyphKey % GLYPHS.length]}</span>
        )}
      </div>

      {/* stick: flying or lying on the ground */}
      {flying && <span className="stick" style={{ left: flying.x, bottom: flying.y, transform: `rotate(${flying.r}deg)` }} />}
      {st.stickGround !== null && <span className="stick" style={{ left: st.stickGround, bottom: 14 }} />}

      {/* the dog */}
      <button
        type="button"
        className="dog-btn"
        aria-label="Pet the dog"
        style={{ left: st.dogX }}
        onClick={() => { st.petUntil = st.t + 1.8; st.petKey++; }}
      >
        <span className="shadow" />
        <span className="dog-body" style={{ transform: `scaleX(${st.dogDir})` }}>
          <DogSprite run={running} frame={runFrame} asleep={st.dogMode === 'sleep' && !petting}
            carrying={st.carrying} wag={petting || st.dogMode === 'sit' || st.dogMode === 'wait'} />
        </span>
        {petting && [[40, -14, 18, 0], [62, -4, 14, 0.45], [20, -2, 12, 0.9]].map(([l, tp, sz, d], i) => (
          <span key={`${st.petKey}-${i}`} className="fx acc" style={{ left: l, top: tp, fontSize: sz, animationDelay: `${d}s` }}>♥</span>
        ))}
        {st.dogMode === 'sleep' && !petting && (
          <>
            <span className="fx mono zz" style={{ left: 60, top: -10 }}>z</span>
            <span className="fx mono zz" style={{ left: 74, top: -20, fontSize: 12, animationDelay: '1.2s' }}>z</span>
          </>
        )}
      </button>
    </div>
  );
}
