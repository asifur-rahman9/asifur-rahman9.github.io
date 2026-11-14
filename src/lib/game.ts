// @ts-nocheck -- ported as-is from the original vanilla JS runner game.
// Renders the scene as positioned spans into `el`; returns a cleanup function.
export function mountGame(el: HTMLElement): () => void {
  const G = { running: false, over: false, gy: 0, gvy: 0, obs: [], items: [], score: 0, best: 0, spawnIn: .9, itemIn: 1.6, mult: 1, multLeft: 0, multName: '' };
  const seasons = [
    { name: 'spring', sky: '#BFE3F7', hill: '#7FBF7F', hill2: '#5E9E62', ground: '#4E8A55', part: '#F9A8D4', kind: 'fall' },
    { name: 'summer', sky: '#8FD0F5', hill: '#5FA65F', hill2: '#468A4A', ground: '#3F7A3A', part: '#FDE047', kind: 'fly' },
    { name: 'autumn', sky: '#F6D6A8', hill: '#C77B3A', hill2: '#A5612C', ground: '#7A4A22', part: '#F97316', kind: 'fall' },
    { name: 'winter', sky: '#DDE7EF', hill: '#F1F5F9', hill2: '#CBD5E1', ground: '#E2E8F0', part: '#FFFFFF', kind: 'snow' }
  ];
  const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (A, B, t) => A.map((v, i) => Math.round(v + (B[i] - v) * t));
  const css = (A) => `rgb(${A.join(',')})`;
  const NIGHT = hx('#0E1726');
  const pad = (n) => String(Math.floor(n)).padStart(4, '0');
  const FOOD = {
    fish: '<rect x="0" y="1" width="1" height="2" fill="#7DD3FC"/><rect x="0" y="4" width="1" height="1" fill="#7DD3FC"/><rect x="1" y="2" width="5" height="3" fill="#7DD3FC"/><rect x="6" y="3" width="1" height="1" fill="#7DD3FC"/><rect x="5" y="3" width="1" height="1" fill="#0B0F14"/><rect x="2" y="1" width="2" height="1" fill="#38BDF8"/>',
    chicken: '<rect x="0" y="0" width="4" height="4" fill="#D97706"/><rect x="1" y="4" width="2" height="1" fill="#D97706"/><rect x="1" y="1" width="1" height="1" fill="#F59E0B"/><rect x="4" y="2" width="3" height="1" fill="#F2F4F7"/><rect x="7" y="1" width="1" height="1" fill="#F2F4F7"/><rect x="7" y="3" width="1" height="1" fill="#F2F4F7"/>',
    shrimp: '<rect x="2" y="0" width="4" height="1" fill="#FB923C"/><rect x="1" y="1" width="2" height="1" fill="#FB923C"/><rect x="5" y="1" width="2" height="1" fill="#FDBA74"/><rect x="0" y="2" width="2" height="2" fill="#FB923C"/><rect x="1" y="4" width="2" height="1" fill="#FB923C"/><rect x="3" y="4" width="1" height="2" fill="#FDBA74"/><rect x="6" y="0" width="1" height="1" fill="#0B0F14"/>'
  };
  const CACTUS = '<rect x="2" y="0" width="3" height="10" fill="#4ADE80"/><rect x="3" y="1" width="1" height="8" fill="#22A04B"/><rect x="0" y="3" width="1" height="3" fill="#4ADE80"/><rect x="1" y="5" width="1" height="1" fill="#4ADE80"/><rect x="6" y="2" width="1" height="3" fill="#4ADE80"/><rect x="5" y="4" width="1" height="1" fill="#4ADE80"/>';
  function runner(gy, sc) {
    const air = gy > 0, frame = Math.floor(sc / 1.2) % 2;
    const F = '#B07A45';
    const legsA = '<rect x="3" y="9" width="1" height="3"/><rect x="5" y="9" width="1" height="3"/><rect x="8" y="9" width="1" height="3"/><rect x="10" y="9" width="1" height="3"/>';
    const legsB = '<rect x="2" y="9" width="1" height="3"/><rect x="4" y="9" width="1" height="2"/><rect x="9" y="9" width="1" height="2"/><rect x="11" y="9" width="1" height="3"/>';
    const legsJ = '<rect x="1" y="9" width="2" height="1"/><rect x="10" y="9" width="2" height="1"/>';
    return `<svg width="48" height="36" viewBox="0 0 16 12" shape-rendering="crispEdges" style="display:block;overflow:visible">
      <rect x="0" y="1" width="1" height="2" fill="${F}"/><rect x="1" y="2" width="1" height="3" fill="${F}"/>
      <rect x="2" y="5" width="9" height="4" fill="${F}"/><rect x="4" y="5" width="4" height="1" fill="#8F5F33"/><rect x="4" y="8" width="5" height="1" fill="#EAD7B7"/>
      <rect x="9" y="3" width="1" height="3" fill="${F}"/><rect x="10" y="1" width="5" height="4" fill="${F}"/><rect x="10" y="1" width="2" height="3" fill="#6B4423"/>
      <rect x="14" y="3" width="2" height="2" fill="#EAD7B7"/><rect x="15" y="3" width="1" height="1" fill="#111"/><rect x="9" y="5" width="2" height="1" fill="#7AA2F7"/>
      <rect x="12" y="2" width="1" height="1" fill="#0B0F14"/><rect x="13" y="2" width="2" height="1" fill="#0B0F14"/><rect x="13" y="2" width="1" height="1" fill="#5CC8FF"/>
      <g fill="${F}">${air ? legsJ : (frame ? legsB : legsA)}</g></svg>`;
  }
  function drawGame() {
    const sc = G.score, DAY = 250, ph = (sc % DAY) / DAY, se = seasons[Math.floor(sc / DAY) % 4];
    const sm = (x) => x * x * (3 - 2 * x);
    const nf = ph < .42 ? 0 : ph < .55 ? sm((ph - .42) / .13) : ph < .88 ? 1 : 1 - sm((ph - .88) / .12);
    const dusk = Math.max(0, 1 - Math.abs(ph - .48) / .07) * .5 + Math.max(0, 1 - Math.abs(ph - .93) / .05) * .35;
    const sky = css(mix(mix(hx(se.sky), NIGHT, nf), hx('#F28C5B'), dusk));
    const isDay = ph < .5, fr = isDay ? ph / .5 : (ph - .5) / .5, tt = sc / 10;
    let h = '';
    for (let i = 0; i < 16; i++) h += `<span class="abs" style="left:${(i * 61) % 96 + 2}%;top:${(i * 37) % 50 + 6}%;width:3px;height:3px;background:#F2F4F7;opacity:${(nf * (.55 + .45 * ((i % 3) / 2))).toFixed(2)}"></span>`;
    h += `<span class="abs" style="left:${8 + fr * 80}%;bottom:${Math.round(100 + Math.sin(Math.PI * fr) * 80)}px;width:24px;height:24px;border-radius:50%;background:${isDay ? '#FDE68A' : '#E5E7EB'};box-shadow:0 0 18px ${isDay ? 'rgba(253,230,138,.7)' : 'rgba(229,231,235,.35)'}"></span>`;
    h += `<span class="abs" style="left:-6%;bottom:40px;width:50%;height:78px;border-radius:50% 50% 0 0;background:${css(mix(hx(se.hill2), NIGHT, nf * .6))}"></span>`;
    h += `<span class="abs" style="right:-12%;bottom:40px;width:64%;height:108px;border-radius:50% 50% 0 0;background:${css(mix(hx(se.hill), NIGHT, nf * .6))}"></span>`;
    for (let i = 0; i < 14; i++) {
      let l, t, s = 4, op = .9;
      if (se.kind === 'fly') { l = (((i * 71) % 100 + Math.sin(tt * .5 + i) * 6) + 100) % 100; t = 48 + (i * 13) % 26 + Math.sin(tt + i * 2) * 4; s = 3; op = nf * (.5 + .5 * Math.sin(tt * 3 + i)); }
      else { const spd = se.kind === 'snow' ? 6 + (i % 4) * 2 : 10 + (i % 5) * 3; l = (((i * 71) % 100 + Math.sin(tt * .8 + i) * 4) + 100) % 100; t = ((i * 29 + tt * spd) % 115) - 10; s = se.kind === 'snow' ? 3 + (i % 2) : 4 + (i % 2); }
      h += `<span class="abs" style="left:${l}%;top:${t}%;width:${s}px;height:${s}px;background:${se.part};opacity:${op}"></span>`;
    }
    h += `<span class="abs" style="left:0;right:0;bottom:0;height:40px;background:${css(mix(hx(se.ground), NIGHT, nf * .55))}"></span>`;
    h += `<span class="abs" style="left:0;right:0;bottom:40px;height:2px;background:${css(mix(mix(hx(se.ground), [0, 0, 0], .25), NIGHT, nf * .55))}"></span>`;
    h += `<span class="abs" style="top:16px;right:20px;font-size:13px;color:${nf > .5 ? '#C9D1DC' : '#1F2733'}">${se.name} · score ${pad(sc)} · best ${pad(G.best)}</span>`;
    if (G.running && G.mult > 1) h += `<span class="abs" style="top:14px;left:20px;padding:2px 10px;border-radius:999px;background:var(--accent);color:#0B0F14;font-size:13px;font-weight:600">${G.multName} x${G.mult} · ${Math.ceil(G.multLeft)}s</span>`;
    const tilt = G.gy > 0 ? (G.gvy > 0 ? 'rotate(-14deg) scale(1.05,.95)' : 'rotate(10deg)') : 'none';
    h += `<span class="abs" aria-hidden="true" style="left:8%;bottom:${41 + Math.round(G.gy)}px;width:48px;height:36px;transform-origin:50% 100%;transform:${tilt}">${runner(G.gy, sc)}</span>`;
    G.obs.forEach((o) => h += `<span class="abs" style="left:${o.x}%;bottom:41px;width:${o.w}px;height:${o.h}px"><svg width="100%" height="100%" viewBox="0 0 7 10" preserveAspectRatio="none" shape-rendering="crispEdges" style="display:block">${CACTUS}</svg></span>`);
    G.items.forEach((it) => h += `<span class="abs" style="left:${it.x}%;bottom:${41 + it.y}px"><svg width="24" height="18" viewBox="0 0 8 6" shape-rendering="crispEdges" style="display:block">${FOOD[it.kind]}</svg></span>`);
    if (!G.running) h += `<span class="abs" style="left:50%;top:70px;transform:translateX(-50%);padding:8px 14px;border-radius:8px;background:rgba(11,15,20,.78);white-space:nowrap;font-size:15px;color:#F2F4F7">${G.over ? 'ouch, cactus. click or press space to retry' : 'click or press space to start'}</span>`;
    
    el.style.background = sky;
    el.innerHTML = h;
  }
  let last = null, raf = null, visible = true;
  function tick(t) {
    if (!G.running) return;
    if (last == null) last = t;
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    if (!visible) { raf = requestAnimationFrame(tick); return; }
    G.gy += G.gvy * dt; G.gvy -= 1900 * dt; if (G.gy <= 0) { G.gy = 0; G.gvy = 0; }
    G.multLeft -= dt; if (G.multLeft <= 0) { G.mult = 1; G.multLeft = 0; G.multName = ''; }
    G.score += dt * 10 * G.mult;
    const speed = 38 + Math.min(40, G.score / 12);
    G.items = G.items.map((it) => ({ ...it, x: it.x - speed * dt })).filter((it) => it.x > -10);
    G.itemIn -= dt;
    if (G.itemIn <= 0) { const r = Math.random(); G.items.push({ x: 102, y: 30 + Math.round(Math.random() * 80), kind: r < .55 ? 'fish' : r < .85 ? 'chicken' : 'shrimp' }); G.itemIn = 1.4 + Math.random() * 1.6; }
    const mults = { fish: 2, chicken: 3, shrimp: 5 };
    G.items = G.items.filter((it) => {
      if (it.x < 13.4 && it.x + 2.8 > 8.4 && G.gy < it.y + 18 && G.gy + 36 > it.y) {
        if (mults[it.kind] >= G.mult || G.multLeft <= 0) { G.mult = mults[it.kind]; G.multName = it.kind; }
        G.multLeft = 5; G.score += 5 * mults[it.kind]; return false;
      }
      return true;
    });
    G.obs = G.obs.map((o) => ({ ...o, x: o.x - speed * dt })).filter((o) => o.x > -10);
    G.spawnIn -= dt;
    if (G.spawnIn <= 0) { const w = 18 + Math.round(Math.random() * 6); G.obs.push({ x: 102, w, h: 27 + Math.round(Math.random() * 15), wp: w / 8 }); G.spawnIn = .8 + Math.random() * .9; }
    if (G.obs.some((o) => o.x < 13 && o.x + o.wp > 8.6 && G.gy < o.h - 4)) {
      G.running = false; G.over = true; G.best = Math.max(G.best, G.score); drawGame(); return;
    }
    drawGame();
    raf = requestAnimationFrame(tick);
  }
  function jump() {
    if (!G.running) {
      Object.assign(G, { running: true, over: false, gy: 0, gvy: 0, obs: [], items: [], score: 0, spawnIn: .9, itemIn: 1.6, mult: 1, multLeft: 0, multName: '' });
      last = null; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); return;
    }
    if (G.gy <= 0) G.gvy = 620;
  }
  el.onclick = jump;
  el.onkeydown = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); jump(); } };
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; });
    io.observe(el);
  drawGame();
  return () => { G.running = false; cancelAnimationFrame(raf); io.disconnect(); el.onclick = null; el.onkeydown = null; };
}
