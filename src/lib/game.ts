// Duck runner: a small canvas game. The duck hops over cacti, flaps once in the air for a
// double jump, and eats snacks for score multipliers. Seasons and day/night cycle as you go.
// Best score is kept in localStorage, so it persists per browser.
import { duckRects, toRects, PAL, type DuckFrame, type Rect } from './sprites';

type Season = { name: string; sky: string; far: string; mid: string; near: string; ground: string; top: string; part: string; kind: 'fall' | 'fly' | 'snow' };
const SEASONS: Season[] = [
  { name: 'spring', sky: '#BFE6F5', far: '#A9D8B8', mid: '#7FC08E', near: '#5AA56C', ground: '#4E8F5C', top: '#6DB27A', part: '#F9A8D4', kind: 'fall' },
  { name: 'summer', sky: '#8ED3F2', far: '#9ED3A3', mid: '#6BB872', near: '#4E9E58', ground: '#3F8649', top: '#5DA865', part: '#FDE047', kind: 'fly' },
  { name: 'autumn', sky: '#F7D7A8', far: '#E3B98A', mid: '#D08B4E', near: '#B5683A', ground: '#7A4A28', top: '#9C6236', part: '#F97316', kind: 'fall' },
  { name: 'winter', sky: '#DCE8F2', far: '#E9F0F6', mid: '#CBD8E6', near: '#B3C4D6', ground: '#DDE6EF', top: '#F8FAFC', part: '#FFFFFF', kind: 'snow' },
];
const NIGHT = [14, 23, 38];
const DUSK = [242, 140, 91];
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = (a: number[]) => `rgb(${a.join(',')})`;
const shade = (h: string, night: number, k = 0.6) => rgb(mix(hex(h), NIGHT, night * k));
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const smooth = (x: number) => x * x * (3 - 2 * x);

// ---- sprites (character grids, same format as the hero scene) ----
Object.assign(PAL, {
  '1': '#2B7D47', '2': '#3A9658', '3': '#1F5F36', // cactus
  '4': '#C68642', '5': '#F5D8A0', // bread
  '6': '#FACC15', '7': '#E8A90C', '8': '#65A30D', // corn
  '9': '#FB923C', '0': '#FDBA74', // shrimp
});
const CACTUS = toRects([
  '..121..', '..121..', '1.121..', '1.121.1', '11121.1', '..12111', '..121..', '..121..', '..121..', '..121..', '..321..', '..333..',
]);
type Snack = 'bread' | 'corn' | 'shrimp';
const SNACKS: Record<Snack, { mult: number; rects: Rect[]; color: string }> = {
  bread: { mult: 2, color: '#F5D8A0', rects: toRects(['.4444..', '455554.', '455554.', '455554.', '455554.', '.4444..']) },
  corn: { mult: 3, color: '#FACC15', rects: toRects(['..676..', '.67676.', '.76767.', '.67676.', '8.767.8', '.88888.']) },
  shrimp: { mult: 5, color: '#FB923C', rects: toRects(['..9999.', '.900009', '90.....', '90.....', '.99.9..', '..999..']) },
};

const PX = 4; // duck pixel size
const DUCK = 14 * PX;
const GRAV = 2100, JUMP = 680, FLAP = 560;
const BEST_KEY = 'duck-runner-best';

type Obstacle = { x: number; n: number; s: number }; // n cacti in a group, s = pixel scale
type Item = { x: number; y: number; kind: Snack; bob: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; s: number; g: number };
type Float = { x: number; y: number; text: string; life: number };

function drawRects(ctx: CanvasRenderingContext2D, rects: Rect[], x: number, y: number, px: number) {
  for (const [rx, ry, w, f] of rects) { ctx.fillStyle = f; ctx.fillRect(x + rx * px, y + ry * px, w * px, px); }
}
const store = {
  get: () => { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } },
  set: (v: number) => { try { localStorage.setItem(BEST_KEY, String(Math.floor(v))); } catch { /* private mode */ } },
};

export function mountGame(host: HTMLElement): () => void {
  const canvas = host.querySelector('canvas')!;
  const ctx = canvas.getContext('2d')!;
  host.querySelector('.game-fallback')?.remove();
  let W = 0, H = 0;

  const G = {
    state: 'ready' as 'ready' | 'run' | 'over', t: 0, overAt: 0, dist: 0, score: 0, best: store.get(), newBest: false,
    y: 0, vy: 0, flapped: false, flapT: -9, landT: -9,
    obs: [] as Obstacle[], items: [] as Item[], parts: [] as Particle[], floats: [] as Float[],
    spawnIn: 1.2, itemIn: 1.8, mult: 1, multLeft: 0, multName: '', shake: 0, speed: 0,
  };
  const groundY = () => H - 50;
  const duckX = () => Math.max(40, W * 0.1);

  function resize() {
    const r = host.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    draw();
  }

  function burst(x: number, y: number, c: string, n: number, spread = 160, g = 500, s = 3) {
    for (let i = 0; i < n; i++) {
      const life = rand(0.35, 0.8);
      G.parts.push({ x, y, vx: rand(-spread, spread), vy: rand(-spread * 1.3, -spread * 0.2), life, max: life, c, s, g });
    }
  }

  function start() {
    Object.assign(G, { state: 'run', t: 0, dist: 0, score: 0, newBest: false, y: 0, vy: 0, flapped: false, obs: [], items: [], floats: [], spawnIn: 1.1, itemIn: 1.6, mult: 1, multLeft: 0, multName: '', shake: 0 });
  }
  function press() {
    if (G.state === 'ready') return start();
    if (G.state === 'over') { if (performance.now() - G.overAt > 450) start(); return; }
    if (G.y <= 0) { G.vy = JUMP; G.flapped = false; burst(duckX() + 14, groundY(), 'rgba(80,60,40,.5)', 5, 80, 300, 2); }
    else if (!G.flapped) { // ducks get one flap in the air
      G.vy = FLAP; G.flapped = true; G.flapT = G.t;
      burst(duckX() + 10, groundY() - G.y - 20, '#FFFFFF', 7, 90, 120, 3);
    }
  }

  function crash() {
    G.state = 'over'; G.overAt = performance.now(); G.shake = 0.35;
    burst(duckX() + 20, groundY() - G.y - 20, '#FFFFFF', 14, 200, 600, 3);
    if (G.score > G.best) { G.best = Math.floor(G.score); G.newBest = true; store.set(G.best); }
  }

  function update(dt: number) {
    for (const p of G.parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; }
    G.parts = G.parts.filter((p) => p.life > 0);
    for (const f of G.floats) { f.life -= dt; f.y -= 40 * dt; }
    G.floats = G.floats.filter((f) => f.life > 0);
    G.shake = Math.max(0, G.shake - dt);
    if (G.state !== 'run') { G.dist += 30 * dt; return; } // background keeps drifting

    G.t += dt;
    // speed ramps with score and scales down on narrow screens so cacti stay readable
    G.speed = (330 + Math.min(360, G.score * 0.55)) * Math.min(1, Math.max(0.62, W / 1100));
    G.dist += G.speed * dt;

    // duck physics
    const wasAir = G.y > 0;
    G.vy -= GRAV * dt; G.y += G.vy * dt;
    if (G.y <= 0) {
      G.y = 0; G.vy = 0;
      if (wasAir) { G.landT = G.t; burst(duckX() + 20, groundY(), 'rgba(80,60,40,.45)', 6, 90, 300, 2); }
    }

    G.multLeft -= dt;
    if (G.multLeft <= 0) { G.mult = 1; G.multLeft = 0; G.multName = ''; }
    G.score += dt * 10 * G.mult;

    // spawn cactus groups with gaps that stay jumpable at any speed
    G.spawnIn -= dt;
    if (G.spawnIn <= 0) {
      const n = Math.random() < 0.55 ? 1 : Math.random() < 0.75 ? 2 : 3;
      G.obs.push({ x: W + 20, n, s: Math.random() < 0.5 ? 4 : 5 });
      G.spawnIn = rand(0.75, 1.5) * (520 / G.speed) + 0.35;
    }
    G.itemIn -= dt;
    if (G.itemIn <= 0) {
      const r = Math.random();
      const kind: Snack = r < 0.55 ? 'bread' : r < 0.85 ? 'corn' : 'shrimp';
      G.items.push({ x: W + 20, y: kind === 'shrimp' ? rand(120, 170) : rand(40, 140), kind, bob: rand(0, 6) });
      G.itemIn = rand(1.3, 2.6);
    }
    for (const o of G.obs) o.x -= G.speed * dt;
    for (const it of G.items) it.x -= G.speed * dt;
    G.obs = G.obs.filter((o) => o.x > -120);
    G.items = G.items.filter((it) => it.x > -40);

    // collisions (forgiving hitboxes)
    const dx = duckX(), dTop = G.y + DUCK - 12, dL = dx + 10, dR = dx + DUCK - 8;
    for (const o of G.obs) {
      const cw = 7 * o.s, ch = 12 * o.s;
      for (let i = 0; i < o.n; i++) {
        const cx = o.x + i * (cw - o.s);
        if (dR > cx + o.s * 2 && dL < cx + cw - o.s * 2 && G.y < ch - 6) return crash();
      }
    }
    G.items = G.items.filter((it) => {
      const iy = it.y + Math.sin(G.t * 4 + it.bob) * 4;
      const hit = dR > it.x && dL < it.x + 28 && G.y < iy + 24 && dTop > iy;
      if (!hit) return true;
      const m = SNACKS[it.kind].mult;
      if (m >= G.mult || G.multLeft <= 0) { G.mult = m; G.multName = it.kind; }
      G.multLeft = 5; G.score += 5 * m;
      burst(it.x + 14, groundY() - iy - 12, SNACKS[it.kind].color, 12, 140, 400, 3);
      G.floats.push({ x: it.x, y: groundY() - iy - 20, text: `x${m}`, life: 0.8 });
      return false;
    });
  }

  // smooth layered hills: sum of sines, scrolled at a parallax factor
  function hills(color: string, base: number, amp: number, freq: number, par: number, seed: number) {
    const off = G.dist * par;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W + 8; x += 8) {
      const u = (x + off) * freq;
      const h = Math.sin(u + seed) * 0.55 + Math.sin(u * 2.3 + seed * 2) * 0.3 + Math.sin(u * 0.45 + seed * 3) * 0.6;
      ctx.lineTo(x, base - amp * (0.5 + h * 0.45));
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }

  function draw() {
    if (!W) return;
    const gy = groundY();
    const DAY = 300, ph = (G.score % DAY) / DAY, se = SEASONS[Math.floor(G.score / DAY) % 4];
    const nf = ph < 0.42 ? 0 : ph < 0.55 ? smooth((ph - 0.42) / 0.13) : ph < 0.88 ? 1 : 1 - smooth((ph - 0.88) / 0.12);
    const dusk = Math.max(0, 1 - Math.abs(ph - 0.48) / 0.07) * 0.5 + Math.max(0, 1 - Math.abs(ph - 0.93) / 0.05) * 0.35;

    ctx.save();
    if (G.shake > 0) ctx.translate(rand(-4, 4) * (G.shake / 0.35), rand(-3, 3) * (G.shake / 0.35));

    // sky
    ctx.fillStyle = rgb(mix(mix(hex(se.sky), NIGHT, nf), DUSK, dusk));
    ctx.fillRect(-10, -10, W + 20, H + 20);
    // stars
    if (nf > 0.05) {
      ctx.fillStyle = `rgba(242,244,247,${nf * 0.9})`;
      for (let i = 0; i < 40; i++) ctx.fillRect(((i * 197) % 1000) / 1000 * W, ((i * 71) % 100) / 100 * (gy - 90), 2, 2);
    }
    // sun / moon
    const isDay = ph < 0.5, fr = isDay ? ph / 0.5 : (ph - 0.5) / 0.5;
    const sx = W * (0.08 + fr * 0.84), sy = gy - 30 - Math.sin(Math.PI * fr) * (gy - 70);
    ctx.fillStyle = isDay ? 'rgba(253,230,138,.35)' : 'rgba(229,231,235,.2)';
    ctx.beginPath(); ctx.arc(sx, sy, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isDay ? '#FDE68A' : '#E5E7EB';
    ctx.beginPath(); ctx.arc(sx, sy, 13, 0, Math.PI * 2); ctx.fill();
    // clouds (day)
    if (nf < 0.95) {
      ctx.fillStyle = `rgba(255,255,255,${0.85 * (1 - nf)})`;
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 380 - G.dist * 0.08) % (W + 300) + W + 300) % (W + 300) - 150, cy = 26 + ((i * 53) % 60);
        ctx.fillRect(cx, cy + 8, 96, 14); ctx.fillRect(cx + 16, cy, 48, 10); ctx.fillRect(cx + 40, cy - 6, 30, 8);
      }
    }
    // hills: far, mid, near
    hills(shade(se.far, nf), gy - 40, 90, 0.004, 0.12, 1.3);
    hills(shade(se.mid, nf), gy - 14, 70, 0.007, 0.3, 4.1);
    hills(shade(se.near, nf), gy + 6, 44, 0.012, 0.55, 7.7);
    // ground with scrolling grass tufts
    ctx.fillStyle = shade(se.ground, nf, 0.55); ctx.fillRect(-10, gy, W + 20, H - gy + 10);
    ctx.fillStyle = shade(se.top, nf, 0.55); ctx.fillRect(-10, gy, W + 20, 5);
    ctx.fillStyle = shade(se.near, nf, 0.7);
    const toff = G.dist % 46;
    for (let x = -toff; x < W; x += 46) { ctx.fillRect(x, gy - 3, 2, 3); ctx.fillRect(x + 4, gy - 5, 2, 5); ctx.fillRect(x + 8, gy - 2, 2, 2); }
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    const poff = (G.dist * 1) % 90;
    for (let x = -poff; x < W; x += 90) ctx.fillRect(x + 20, gy + 18, 6, 3);
    // season particles
    for (let i = 0; i < 18; i++) {
      const tt = G.dist / 60 + G.t;
      let px: number, py: number, op = 0.85, s = 3;
      if (se.kind === 'fly') {
        px = ((i * 113 + Math.sin(tt * 0.5 + i) * 30) % W + W) % W; py = gy - 30 - ((i * 37) % 120) + Math.sin(tt + i) * 6;
        op = nf * (0.5 + 0.5 * Math.sin(tt * 3 + i)); ctx.fillStyle = se.part;
      } else {
        const spd = se.kind === 'snow' ? 18 : 30;
        px = ((i * 151 - G.dist * 0.2 + Math.sin(tt * 0.8 + i) * 20) % W + W) % W; py = ((i * 41 + tt * spd) % (gy + 20)) - 10;
        s = se.kind === 'snow' ? 3 : 4; ctx.fillStyle = se.part;
      }
      ctx.globalAlpha = op; ctx.fillRect(px, py, s, s); ctx.globalAlpha = 1;
    }

    // snacks
    for (const it of G.items) {
      const iy = gy - it.y - 24 + Math.sin(G.t * 4 + it.bob) * 4;
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(it.x + 14, iy + 12, 20, 0, Math.PI * 2); ctx.fill();
      drawRects(ctx, SNACKS[it.kind].rects, it.x, iy, 4);
    }
    // cacti
    for (const o of G.obs) {
      for (let i = 0; i < o.n; i++) drawRects(ctx, CACTUS, o.x + i * (7 * o.s - o.s), gy - 12 * o.s, o.s);
    }

    // duck
    const dx = duckX(), air = G.y > 0, step = Math.floor(G.t * 10) % 2;
    const flapping = air && (G.t - G.flapT < 0.35 ? Math.floor(G.t / 0.06) % 2 === 0 : G.vy > 0 && Math.floor(G.t / 0.1) % 2 === 0);
    const frame: DuckFrame = {
      feet: G.state === 'over' ? 'stand' : air ? 'stand' : G.state === 'run' ? (step ? 'stepA' : 'stepB') : 'stand',
      wing: flapping ? 'up' : 'folded',
      eyes: G.state === 'over' ? 'sleep' : 'open',
      stick: false,
    };
    const squash = G.t - G.landT < 0.12 ? 0.88 : 1;
    const tilt = G.state === 'over' ? 0.35 : air ? -Math.max(-0.25, Math.min(0.25, G.vy / 2400)) : G.state === 'run' ? Math.sin(G.t * 20) * 0.06 : Math.sin(performance.now() / 400) * 0.04;
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.beginPath(); ctx.ellipse(dx + DUCK / 2, gy + 2, 16 * Math.max(0.5, 1 - G.y / 300), 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(dx + DUCK / 2, gy - G.y);
    ctx.rotate(tilt); ctx.scale(1 / squash, squash);
    drawRects(ctx, duckRects(frame), -DUCK / 2, -DUCK, PX);
    ctx.restore();

    // particles and floating text
    for (const p of G.parts) { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s); }
    ctx.globalAlpha = 1;
    ctx.font = '700 14px Silkscreen, "IBM Plex Mono", monospace';
    for (const f of G.floats) { ctx.globalAlpha = Math.min(1, f.life * 2); ctx.fillStyle = '#FFFFFF'; ctx.fillText(f.text, f.x, f.y); }
    ctx.globalAlpha = 1;
    ctx.restore();

    // HUD
    const dark = nf > 0.5 || se.kind === 'fall' && se.name === 'autumn' && nf > 0.3;
    ctx.font = '500 13px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = dark ? '#E5EAF2' : '#1F2733';
    const pad = (n: number) => String(Math.floor(n)).padStart(5, '0');
    ctx.fillText(`${se.name}   score ${pad(G.score)}   best ${pad(G.best)}`, W - 18, 26);
    ctx.textAlign = 'left';
    if (G.state === 'run' && G.mult > 1) {
      const label = `${G.multName} x${G.mult}  ${Math.ceil(G.multLeft)}s`;
      ctx.font = '600 13px "IBM Plex Mono", monospace';
      const w = ctx.measureText(label).width + 20;
      ctx.fillStyle = '#8AB4FF'; ctx.beginPath(); ctx.roundRect(16, 12, w, 24, 12); ctx.fill();
      ctx.fillStyle = '#0E1422'; ctx.fillText(label, 26, 29);
    }
    if (G.state !== 'run') {
      const lines = G.state === 'ready'
        ? ['click, tap or press space to start', 'tap again in the air to flap']
        : [G.newBest ? `new best! ${Math.floor(G.best)}` : `ouch, cactus. score ${Math.floor(G.score)}`, 'click or press space to try again'];
      ctx.font = '600 15px "IBM Plex Mono", monospace';
      const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 36;
      const bx = W / 2 - w / 2, by = H * 0.28;
      ctx.fillStyle = 'rgba(14,20,34,.82)'; ctx.beginPath(); ctx.roundRect(bx, by, w, 62, 10); ctx.fill();
      ctx.textAlign = 'center';
      ctx.fillStyle = G.newBest && G.state === 'over' ? '#FDE68A' : '#F2F4F7'; ctx.fillText(lines[0], W / 2, by + 26);
      ctx.font = '500 12.5px "IBM Plex Mono", monospace'; ctx.fillStyle = '#AEB8C8'; ctx.fillText(lines[1], W / 2, by + 47);
      ctx.textAlign = 'left';
    }
  }

  // loop, paused when off screen or in a background tab
  let raf = 0, last = 0, visible = false;
  const loop = (now: number) => {
    const dt = Math.max(0, Math.min(0.033, (now - last) / 1000 || 0)); // never step backwards
    last = now;
    update(dt); draw();
    raf = requestAnimationFrame(loop);
  };
  const play = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? play() : stop(); });
  io.observe(host);
  const onVis = () => (document.hidden ? stop() : play());
  document.addEventListener('visibilitychange', onVis);

  const onPointer = (e: PointerEvent) => { e.preventDefault(); press(); };
  const onKey = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') { e.preventDefault(); press(); } };
  host.addEventListener('pointerdown', onPointer);
  host.addEventListener('keydown', onKey);
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  return () => {
    stop(); io.disconnect(); ro.disconnect();
    document.removeEventListener('visibilitychange', onVis);
    host.removeEventListener('pointerdown', onPointer);
    host.removeEventListener('keydown', onKey);
  };
}
