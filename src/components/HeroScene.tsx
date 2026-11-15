import { useEffect, useRef, useState } from 'react';
import { MUG, SIT_SIZE, WALK, WALK_SIZE, sitRects, type Rect, type SitPose } from '../lib/sprites';

/*
 * Pixel scene along the bottom of the hero.
 * A developer walks in with a MacBook, sits down with a coffee and codes. The dog wakes up,
 * runs over, and he keeps throwing a stick that the dog fetches and brings back.
 * Click the dog (or run `pet` in the terminal) to pet it; it pauses, hearts, then carries on.
 * One requestAnimationFrame loop drives a small state machine; reduced motion shows the end state.
 */

const PX = 4; // screen pixels per sprite pixel
const FLOOR = 12; // floor strip height
const Sprite = ({ rects, w, h, children }: { rects: Rect[]; w: number; h: number; children?: React.ReactNode }) => (
  <svg width={w * PX} height={h * PX} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" style={{ display: 'block', overflow: 'visible' }}>
    {children}
    {rects.map(([x, y, rw, f], i) => <rect key={i} x={x} y={y} width={rw} height={1} fill={f} />)}
  </svg>
);

// dog palette + parts (16 x 12 grid)
const FUR = '#B07A45', FUR_D = '#8F5F33', BELLY = '#EAD7B7', EAR = '#6B4423', STICK = '#8B5A2B';
type R = [number, number, number, number, string];
const r = (list: R[]) => list.map(([x, y, w, h, f], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={f} />);
const LEGS_A: R[] = [[3, 9, 1, 3, FUR], [5, 9, 1, 3, FUR], [8, 9, 1, 3, FUR], [10, 9, 1, 3, FUR]];
const LEGS_B: R[] = [[2, 9, 1, 3, FUR], [4, 9, 1, 2, FUR], [9, 9, 1, 2, FUR], [11, 9, 1, 3, FUR]];
const LEGS_SIT: R[] = [[3, 9, 2, 3, FUR], [8, 10, 1, 2, FUR], [10, 10, 1, 2, FUR]];

function DogSprite({ legs, asleep, carrying, wag }: { legs: 'a' | 'b' | 'sit'; asleep: boolean; carrying: boolean; wag: boolean }) {
  return (
    <svg width="64" height="48" viewBox="0 0 16 12" shapeRendering="crispEdges" style={{ display: 'block', overflow: 'visible' }}>
      <g className={wag ? 'tail wag' : 'tail'}>{r([[0, 1, 1, 2, FUR], [1, 2, 1, 3, FUR]])}</g>
      {r([[2, 5, 9, 4, FUR], [4, 5, 4, 1, FUR_D], [4, 8, 5, 1, BELLY], ...(legs === 'b' ? LEGS_B : legs === 'sit' ? LEGS_SIT : LEGS_A),
        [9, 3, 1, 3, FUR], [10, 1, 5, 4, FUR], [10, 1, 2, 3, EAR], [14, 3, 2, 2, BELLY], [15, 3, 1, 1, '#111'],
        [9, 5, 2, 1, '#8AB4FF'], [14, 4, 1, 1, '#3B2414']])}
      {asleep
        ? <rect x="13" y="2" width="2" height="1" fill="#3B2414" />
        : r([[12, 2, 1, 1, '#0B0F14'], [13, 2, 2, 1, '#0B0F14'], [13, 2, 1, 1, '#5CC8FF']])}
      {carrying && <rect x="13" y="4" width="6" height="1" fill={STICK} />}
    </svg>
  );
}

type DogMode = 'sleep' | 'toGuy' | 'sit' | 'wait' | 'fetch' | 'pickup' | 'return';
type GuyMode = 'walk' | 'settle' | 'code' | 'windup' | 'release';
type Flight = { x0: number; x1: number; t0: number; dur: number };

const DOG_W = 64, GUY_SPEED = 62, DOG_RUN = 260, DOG_CARRY = 200, ARC = 90;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const GLYPHS = ['{ }', '</>', 'git push', 'fn()', '200 OK', 'npm test', ';'];

export default function HeroScene() {
  const box = useRef<HTMLDivElement>(null);
  const s = useRef({
    t: 0, w: 1200,
    guyX: -70, guyMode: 'walk' as GuyMode, guyT: 0,
    dogX: 900, dogDir: -1, dogMode: 'sleep' as DogMode, wakeAt: Infinity, until: 0,
    carrying: false, flight: null as Flight | null, stickGround: null as number | null,
    petUntil: 0, petKey: 0, sipUntil: 0,
  });
  const [, render] = useState(0);

  // Keep the scene inside the page's content column (.wrap: max 1200px, padding clamp(20px, 5vw, 64px)).
  const inset = () => { const w = s.current.w; return Math.max(0, (w - 1200) / 2) + Math.min(64, Math.max(20, w * 0.05)); };
  const right = () => s.current.w - inset(); // right edge of the content column
  const home = () => inset() + 8;
  const rest = () => home() + SIT_SIZE.w * PX + 18;

  const pet = () => { const st = s.current; st.petUntil = st.t + 1.8; st.petKey++; render((n) => n + 1); };

  useEffect(() => {
    const st = s.current;
    const measure = () => { st.w = box.current?.offsetWidth ?? st.w; };
    measure();
    st.dogX = right() - DOG_W - 8;
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    window.addEventListener('pet-dog', pet); // terminal "pet" command
    const sip = () => { st.sipUntil = st.t + 1.8; render((n) => n + 1); };
    window.addEventListener('sip-coffee', sip); // terminal "coffee" command

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Object.assign(st, { t: 10, guyX: home(), guyMode: 'code', dogX: rest(), dogMode: 'sit', dogDir: -1 });
      render((n) => n + 1);
      return () => { ro.disconnect(); window.removeEventListener('pet-dog', pet); window.removeEventListener('sip-coffee', sip); };
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
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('pet-dog', pet); window.removeEventListener('sip-coffee', sip); };
  }, []);

  function moveDog(x: number, speed: number, dt: number) {
    const st = s.current, d = x - st.dogX;
    if (Math.abs(d) <= speed * dt) { st.dogX = x; return true; }
    st.dogDir = Math.sign(d);
    st.dogX += Math.sign(d) * speed * dt;
    return false;
  }

  function update(dt: number) {
    const st = s.current, t = st.t;

    // the developer
    switch (st.guyMode) {
      case 'walk':
        st.guyX += Math.max(GUY_SPEED, (home() + 70) / 4.5) * dt; // arrive in ~4.5s on any width
        if (st.guyX >= home()) { st.guyX = home(); st.guyMode = 'settle'; st.guyT = t; }
        break;
      case 'settle': // sits down, opens the laptop, screen glow fades in
        if (t - st.guyT > 0.7) { st.guyMode = 'code'; st.wakeAt = t + 0.6; }
        break;
      case 'windup':
        if (t - st.guyT > 0.32) {
          st.guyMode = 'release'; st.guyT = t;
          const x1 = rand(Math.max(rest() + 160, st.w * 0.45), right() - 40);
          st.flight = { x0: home() + 16 * PX, x1, t0: t, dur: 0.55 + (x1 - home()) / 950 };
          st.dogMode = 'wait'; st.until = t + 0.2;
        }
        break;
      case 'release':
        if (t - st.guyT > 0.3) st.guyMode = 'code';
        break;
    }
    if (st.guyMode !== 'walk') st.guyX = home();

    if (st.flight && t >= st.flight.t0 + st.flight.dur) { st.stickGround = st.flight.x1; st.flight = null; }

    // the dog (frozen while being petted)
    if (t < st.petUntil) return;
    switch (st.dogMode) {
      case 'sleep':
        if (t > st.wakeAt) st.dogMode = 'toGuy';
        break;
      case 'toGuy':
      case 'return':
        if (moveDog(rest(), st.dogMode === 'return' ? DOG_CARRY : DOG_RUN, dt)) {
          if (st.carrying) { st.carrying = false; st.stickGround = st.dogX - 10; }
          st.dogDir = -1;
          st.dogMode = 'sit';
          st.until = t + rand(2.2, 4);
        }
        break;
      case 'sit':
        if (t > st.until && st.guyMode === 'code') { st.guyMode = 'windup'; st.guyT = t; st.stickGround = null; }
        break;
      case 'wait':
        if (t > st.until) st.dogMode = 'fetch';
        break;
      case 'fetch': {
        const target = (st.flight?.x1 ?? st.stickGround ?? st.dogX) - 56;
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
  const dogLegs = running ? (Math.floor(t / 0.09) % 2 ? 'b' : 'a') : st.dogMode === 'sleep' ? 'a' : 'sit';

  const sitting = st.guyMode !== 'walk';
  const sipping = t < st.sipUntil && (st.guyMode === 'code' || st.guyMode === 'settle');
  const pose: SitPose = sipping ? 'sip' : st.guyMode === 'windup' ? 'windup' : st.guyMode === 'release' ? 'release'
    : st.guyMode === 'settle' ? 'typeA' : (Math.floor(t * 7) % 2 ? 'typeA' : 'typeB');
  const blink = t % 3.7 < 0.14;
  const walkFrame = Math.floor(t / 0.2) % 2;
  const headBob = st.guyMode === 'code' && Math.floor(t / 0.9) % 4 === 0 ? 1 : 0; // occasional nod to the beat

  let flying: { x: number; y: number; r: number } | null = null;
  if (st.flight && t >= st.flight.t0) {
    const p = Math.min(1, (t - st.flight.t0) / st.flight.dur);
    flying = { x: st.flight.x0 + (st.flight.x1 - st.flight.x0) * p, y: 70 + 4 * ARC * p * (1 - p) - (70 - FLOOR) * p, r: p * 720 };
  }
  const glyphKey = Math.floor(t / 1.3);

  return (
    <div className="scene" ref={box}>
      <div className="floor" aria-hidden="true" />

      {sitting && !sipping && (
        <span className="mug" style={{ left: st.guyX - 34 }} aria-hidden="true">
          <i className="steam" /><i className="steam s2" />
          <Sprite rects={MUG} w={7} h={5} />
        </span>
      )}

      <div className="guy" style={{ left: st.guyX, transform: !sitting && walkFrame ? 'translateY(-4px)' : headBob ? 'translateY(1px)' : undefined }} aria-hidden="true">
        {sitting ? (
          <Sprite rects={sitRects(pose, blink)} w={SIT_SIZE.w} h={SIT_SIZE.h}>
            <rect className={`glow ${st.guyMode === 'settle' ? '' : 'on'}`} x="16" y="9" width="2" height="6" fill="#8AB4FF" />
          </Sprite>
        ) : (
          <Sprite rects={WALK[walkFrame]} w={WALK_SIZE.w} h={WALK_SIZE.h} />
        )}
        {st.guyMode === 'code' && <span key={glyphKey} className="glyph">{GLYPHS[glyphKey % GLYPHS.length]}</span>}
      </div>

      {flying && <span className="stick" style={{ left: flying.x, bottom: flying.y, transform: `rotate(${flying.r}deg)` }} />}
      {st.stickGround !== null && <span className="stick" style={{ left: st.stickGround, bottom: FLOOR }} />}

      <button type="button" className="dog-btn" aria-label="Pet the dog" style={{ left: st.dogX }} onClick={pet}>
        <span className="shadow" />
        <span className="dog-body" style={{ transform: `scaleX(${st.dogDir})` }}>
          <DogSprite legs={dogLegs} asleep={st.dogMode === 'sleep' && !petting} carrying={st.carrying}
            wag={petting || st.dogMode === 'sit' || st.dogMode === 'wait'} />
        </span>
        {petting && [[30, -14, 18, 0], [48, -4, 14, 0.45], [14, -2, 12, 0.9]].map(([l, tp, sz, d], i) => (
          <span key={`${st.petKey}-${i}`} className="fx heart" style={{ left: l, top: tp, fontSize: sz, animationDelay: `${d}s` }}>♥</span>
        ))}
        {st.dogMode === 'sleep' && !petting && (
          <>
            <span className="fx zz" style={{ left: 48, top: -10 }}>z</span>
            <span className="fx zz" style={{ left: 60, top: -20, fontSize: 10, animationDelay: '1.2s' }}>z</span>
          </>
        )}
      </button>
    </div>
  );
}
