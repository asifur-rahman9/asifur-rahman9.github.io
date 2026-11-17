import { useEffect, useRef, useState } from 'react';
import { EVENTS, listen } from '../lib/events';
import { rand } from '../lib/random';
import { DUCK_SIZE, FURNITURE, PX, RELEASE_HAND, SEAT_SIZE, WALK, WALK_SIZE, duckRects, sitRects, type DuckFrame, type Rect, type SitPose } from '../lib/sprites';

/*
 * Pixel scene along the bottom of the hero.
 * A developer walks in with a MacBook, sits down at his desk (armchair, table, coffee) and codes. A white call duck
 * wakes up, waddles over, and he keeps tossing a stick that the duck flap-runs after and
 * brings back in its beak. Click the duck (or run `pet` in the terminal) to pet it.
 * One requestAnimationFrame loop drives a small state machine; reduced motion shows the end state.
 */

const FLOOR = 12; // floor strip height
const Sprite = ({ rects, w, h, children }: { rects: Rect[]; w: number; h: number; children?: React.ReactNode }) => (
  <svg width={w * PX} height={h * PX} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" style={{ display: 'block', overflow: 'visible' }}>
    {children}
    {rects.map(([x, y, rw, f], i) => <rect key={i} x={x} y={y} width={rw} height={1} fill={f} />)}
  </svg>
);

type DuckMode = 'sleep' | 'toGuy' | 'sit' | 'wait' | 'fetch' | 'pickup' | 'return';
type GuyMode = 'walk' | 'settle' | 'code' | 'windup' | 'release';
type Flight = { x0: number; x1: number; t0: number; dur: number };

const DUCK_W = DUCK_SIZE.w * PX, GUY_SPEED = 62, DUCK_RUN = 230, DUCK_CARRY = 170, DUCK_WADDLE = 120, ARC = 90;
const GLYPHS = ['{ }', '</>', 'git push', 'fn()', '200 OK', 'npm test', ';'];
const QUACKS = ['quack!', 'quack', 'qwak!', '!!'];

export default function HeroScene() {
  const box = useRef<HTMLDivElement>(null);
  const s = useRef({
    t: 0, w: 1200, left: 60, right: 1140, // scene width and the content column's edges inside it
    guyX: -70, guyMode: 'walk' as GuyMode, guyT: 0,
    duckX: 900, duckDir: -1, duckMode: 'sleep' as DuckMode, wakeAt: Infinity, until: 0, modeT: 0,
    carrying: false, flight: null as Flight | null, stickGround: null as number | null,
    petUntil: 0, petKey: 0, sipUntil: 0, quackUntil: 0, quack: 'quack!', hopT: -9,
  });
  const [, render] = useState(0);

  // The scene spans the full section; characters stay inside the page's content column.
  const right = () => s.current.right;
  const home = () => s.current.left + 8; // left edge of the chair + desk
  const seatX = () => home() + 2 * PX; // where he stops walking, in front of the chair
  const rest = () => home() + SEAT_SIZE.w * PX + 14; // duck waits just past the table

  const quack = (text?: string) => {
    const st = s.current;
    st.quack = text ?? QUACKS[Math.floor(Math.random() * QUACKS.length)];
    st.quackUntil = st.t + 0.9;
  };
  const pet = () => {
    const st = s.current;
    st.petUntil = st.t + 1.8; st.hopT = st.t; st.petKey++;
    quack('quack!');
    render((n) => n + 1);
  };

  useEffect(() => {
    const st = s.current;
    // measure the hero's .wrap (minus its padding) so the column always matches the CSS
    const measure = () => {
      const el = box.current;
      if (!el) return;
      st.w = el.offsetWidth;
      const wrap = el.closest('section')?.querySelector<HTMLElement>('.wrap');
      if (!wrap) { st.left = 0; st.right = st.w; return; }
      const scene = el.getBoundingClientRect(), col = wrap.getBoundingClientRect(), css = getComputedStyle(wrap);
      st.left = col.left - scene.left + parseFloat(css.paddingLeft);
      st.right = col.right - scene.left - parseFloat(css.paddingRight);
    };
    measure();
    st.duckX = right() - DUCK_W - 8;
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    const sip = () => { st.sipUntil = st.t + 1.8; render((n) => n + 1); };
    const unPet = listen(EVENTS.petDuck, pet); // terminal "pet" command
    const unSip = listen(EVENTS.sipCoffee, sip); // terminal "coffee" command
    const cleanup = () => { ro.disconnect(); unPet(); unSip(); };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Object.assign(st, { t: 10, guyX: home(), guyMode: 'code', duckX: rest(), duckMode: 'sit', duckDir: -1 });
      render((n) => n + 1);
      return cleanup;
    }

    let raf = 0, last = performance.now();
    const step = (now: number) => {
      // rAF timestamps can predate performance.now() on the first frame; never step backwards
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
      last = now;
      st.t += dt;
      update(dt);
      render((n) => n + 1);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); cleanup(); };
  }, []);

  function moveDuck(x: number, speed: number, dt: number) {
    const st = s.current, d = x - st.duckX;
    if (Math.abs(d) <= speed * dt) { st.duckX = x; return true; }
    st.duckDir = Math.sign(d);
    st.duckX += Math.sign(d) * speed * dt;
    return false;
  }
  const setMode = (m: DuckMode) => { const st = s.current; st.duckMode = m; st.modeT = st.t; };

  function update(dt: number) {
    const st = s.current, t = st.t;

    // the developer
    switch (st.guyMode) {
      case 'walk':
        st.guyX += Math.max(GUY_SPEED, (seatX() + 70) / 4.5) * dt; // arrive in ~4.5s on any width
        if (st.guyX >= seatX()) { st.guyX = seatX(); st.guyMode = 'settle'; st.guyT = t; }
        break;
      case 'settle':
        if (t - st.guyT > 0.7) { st.guyMode = 'code'; st.wakeAt = t + 0.6; }
        break;
      case 'windup':
        if (t - st.guyT > 0.32) {
          st.guyMode = 'release'; st.guyT = t;
          const x1 = rand(Math.max(rest() + 160, st.w * 0.45), right() - 40);
          st.flight = { x0: home() + RELEASE_HAND.x * PX, x1, t0: t, dur: 0.55 + (x1 - home()) / 950 };
          setMode('wait'); st.until = t + 0.2;
        }
        break;
      case 'release':
        if (t - st.guyT > 0.3) st.guyMode = 'code';
        break;
    }
    if (st.guyMode !== 'walk') st.guyX = home();

    if (st.flight && t >= st.flight.t0 + st.flight.dur) { st.stickGround = st.flight.x1; st.flight = null; }

    // the duck (frozen while being petted)
    if (t < st.petUntil) return;
    switch (st.duckMode) {
      case 'sleep':
        if (t > st.wakeAt) { setMode('toGuy'); quack('!'); st.hopT = t; }
        break;
      case 'toGuy':
      case 'return':
        if (moveDuck(rest(), st.duckMode === 'return' ? DUCK_CARRY : DUCK_WADDLE, dt)) {
          if (st.carrying) { st.carrying = false; st.stickGround = st.duckX - 10; if (Math.random() < 0.6) quack(); }
          st.duckDir = -1;
          setMode('sit');
          st.until = t + rand(2.4, 4.2);
        }
        break;
      case 'sit':
        if (t > st.until && st.guyMode === 'code') { st.guyMode = 'windup'; st.guyT = t; st.stickGround = null; }
        break;
      case 'wait':
        if (t > st.until) { setMode('fetch'); st.hopT = t; }
        break;
      case 'fetch': {
        const target = (st.flight?.x1 ?? st.stickGround ?? st.duckX) - (DUCK_W - 6);
        if (moveDuck(target, DUCK_RUN, dt) && st.stickGround !== null) { setMode('pickup'); st.until = t + 0.45; st.hopT = t; }
        break;
      }
      case 'pickup':
        if (t > st.until) { st.carrying = true; st.stickGround = null; setMode('return'); }
        break;
    }
  }

  const st = s.current, t = st.t;
  const petting = t < st.petUntil;

  // ---- duck pose and motion ----
  const m = st.duckMode;
  const moving = !petting && (m === 'toGuy' || m === 'fetch' || m === 'return');
  const sinceMode = t - st.modeT;
  const stepRate = m === 'fetch' ? 11 : 7; // steps per second
  const phase = Math.sin(t * stepRate * Math.PI);
  const flapFast = Math.floor(t / 0.08) % 2 === 0;
  const stretching = m === 'sit' && !petting && (t % 6.5) > 5.9; // wing stretch every few seconds
  const duck: DuckFrame = {
    feet: moving ? (phase > 0 ? 'stepA' : 'stepB') : (m === 'sleep' || m === 'sit') && !petting ? 'none' : 'stand',
    wing: (moving && m === 'fetch' && flapFast) || (petting && Math.floor(t / 0.12) % 2 === 0) || (stretching && flapFast) ? 'up' : 'folded',
    eyes: m === 'sleep' && !petting ? 'sleep' : petting ? 'happy' : 'open',
    stick: st.carrying || (m === 'pickup' && sinceMode > 0.2),
  };
  const hopAge = t - st.hopT;
  const hop = hopAge < 0.32 ? Math.sin((hopAge / 0.32) * Math.PI) * 10 : 0;
  const waddleTilt = moving ? phase * (m === 'fetch' ? 9 : 7) : 0;
  const bob = moving ? -Math.abs(phase) * 2 : 0;
  const breathe = m === 'sleep' && !petting ? 1 + Math.sin(t * 2.2) * 0.025 : 1;
  const settled = (m === 'sit' || m === 'sleep') && !petting ? 4 : 0; // sitting ducks hide their feet and drop a little
  const duckTransform = `translateY(${bob - hop + settled}px) rotate(${waddleTilt}deg) scaleY(${breathe})`;

  // ---- developer pose ----
  const sitting = st.guyMode !== 'walk';
  const sipping = t < st.sipUntil && (st.guyMode === 'code' || st.guyMode === 'settle');
  const pose: SitPose = sipping ? 'sip' : st.guyMode === 'windup' ? 'windup' : st.guyMode === 'release' ? 'release'
    : st.guyMode === 'settle' ? 'typeA' : (Math.floor(t * 7) % 2 ? 'typeA' : 'typeB');
  const blink = t % 3.7 < 0.14;
  const walkFrame = Math.floor(t / 0.2) % 2;

  let flying: { x: number; y: number; r: number } | null = null;
  if (st.flight && t >= st.flight.t0) {
    const p = Math.min(1, (t - st.flight.t0) / st.flight.dur);
    const y0 = FLOOR + (SEAT_SIZE.h - RELEASE_HAND.y) * PX; // leaves his raised hand
    flying = { x: st.flight.x0 + (st.flight.x1 - st.flight.x0) * p, y: y0 + 4 * ARC * p * (1 - p) - (y0 - FLOOR) * p, r: p * 720 };
  }
  const glyphKey = Math.floor(t / 1.3);

  return (
    <div className="scene" ref={box}>
      <div className="floor" aria-hidden="true" />

      {/* desk: chair, table and mug are always there; once he sits, the seated sprite includes them */}
      <div className="desk" style={{ left: home() }} aria-hidden="true">
        {sitting ? (
          <Sprite rects={sitRects(pose, blink)} w={SEAT_SIZE.w} h={SEAT_SIZE.h}>
            <rect className={`glow ${st.guyMode === 'settle' ? '' : 'on'}`} x="23" y="11" width="1" height="5" fill="#8AB4FF" />
          </Sprite>
        ) : (
          <Sprite rects={FURNITURE} w={SEAT_SIZE.w} h={SEAT_SIZE.h} />
        )}
        {!sipping && <span className="steam-wrap" style={{ left: 26 * PX, top: 13 * PX - 4 }}><i className="steam" /><i className="steam s2" /></span>}
        {st.guyMode === 'code' && !sipping && <span key={glyphKey} className="glyph" style={{ left: 18 * PX, top: 5 * PX }}>{GLYPHS[glyphKey % GLYPHS.length]}</span>}
      </div>

      {!sitting && (
        <div className="guy" style={{ left: st.guyX, transform: walkFrame ? 'translateY(-4px)' : undefined }} aria-hidden="true">
          <Sprite rects={WALK[walkFrame]} w={WALK_SIZE.w} h={WALK_SIZE.h} />
        </div>
      )}

      {flying && <span className="stick" style={{ left: flying.x, bottom: flying.y, transform: `rotate(${flying.r}deg)` }} />}
      {st.stickGround !== null && !duck.stick && <span className="stick" style={{ left: st.stickGround, bottom: FLOOR }} />}

      <button type="button" className="duck-btn" aria-label="Pet the duck" style={{ left: st.duckX }} onClick={pet}>
        <span className="shadow" style={{ transform: `scaleX(${hop ? 0.8 : 1})` }} />
        <span className="duck-body" style={{ transform: `scaleX(${st.duckDir})` }}>
          <span className="duck-motion" style={{ transform: duckTransform }}>
            <Sprite rects={duckRects(duck)} w={DUCK_SIZE.w} h={DUCK_SIZE.h} />
          </span>
        </span>
        {t < st.quackUntil && <span className="quack">{st.quack}</span>}
        {petting && [[22, -14, 16, 0], [40, -6, 12, 0.45], [8, -4, 11, 0.9]].map(([l, tp, sz, d], i) => (
          <span key={`${st.petKey}-${i}`} className="fx heart" style={{ left: l, top: tp, fontSize: sz, animationDelay: `${d}s` }}>♥</span>
        ))}
        {m === 'sleep' && !petting && (
          <>
            <span className="fx zz" style={{ left: 36, top: -6 }}>z</span>
            <span className="fx zz" style={{ left: 48, top: -16, fontSize: 10, animationDelay: '1.2s' }}>z</span>
          </>
        )}
      </button>
    </div>
  );
}
