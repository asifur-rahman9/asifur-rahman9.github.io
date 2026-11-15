// Pixel-art sprites as character grids. Each char maps to a colour; '.' is empty.
// Grids are converted once into run-length <rect> lists for cheap SVG rendering.

export const PAL: Record<string, string> = {
  H: '#2A1B12', h: '#4A3222', // hair
  S: '#D8A27A', s: '#B9825C', // skin, skin shadow
  E: '#1B1B1F', R: '#9C5B45', // eye, mouth
  B: '#4F6BA8', b: '#3B5288', L: '#6A86C2', D: '#E6E9EF', // hoodie, shadow, light, drawstring
  P: '#2F3B52', p: '#232D40', // jeans
  K: '#ECEEF2', k: '#9AA1AB', // sneakers
  M: '#C9CED6', m: '#8E959F', // MacBook aluminium
  T: '#8B5A2B', // stick
  W: '#F2F4F8', w: '#C4CBD6', C: '#6B3F22', // mug, mug shade, coffee
};

export type Rect = [x: number, y: number, w: number, fill: string];
export type Pix = [x: number, y: number, ch: string];

/** Run-length encode rows of a grid (plus optional single-pixel overlays) into rects. */
export function toRects(rows: string[], overlay: Pix[] = []): Rect[] {
  const g = rows.map((r) => r.split(''));
  const extra: Rect[] = [];
  for (const [x, y, ch] of overlay) {
    if (y >= 0 && y < g.length && x >= 0 && x < (g[y]?.length ?? 0)) g[y][x] = ch;
    else extra.push([x, y, 1, PAL[ch]]); // pixels outside the grid (raised arm, stick)
  }
  const out: Rect[] = [];
  g.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.' || !PAL[ch]) { x++; continue; }
      let w = 1;
      while (row[x + w] === ch) w++;
      out.push([x, y, w, PAL[ch]]);
      x += w;
    }
  });
  return [...out, ...extra];
}

// ---------- walking (14 x 29), facing right, MacBook carried at the hip ----------
const WALK_TOP = [
  '....HHHHH.....',
  '...HHhHHHH....',
  '..HHHHHHHHH...',
  '..HHHHHHSSS...',
  '..HHHSSSSES...',
  '..HHsSSSSSSS..',
  '...HsSSSSRS...',
  '....sSSSSS....',
  '.....sSs......',
  '...BBBBBBB....',
  '..BLBBDBDBBb..',
  '..BLBBDBDBBb..',
  '..BLBBBBLLBb..',
  '..BLBBBBLLBb..',
  '..BLBbbbLLBb..',
  '..BLBbBBbSSb..',
  '..bBBMMMMMMMM.',
  '...bbmmmmmmmm.',
];
const LEGS_APART = [
  '...PPPPPPP....',
  '...PPPpPPP....',
  '..PPP..PPP....',
  '..PPP...PPP...',
  '.PPP....PPP...',
  '.PPp.....PPP..',
  '.PPp.....PPp..',
  'PPP.......PPP.',
  'PPp.......PPp.',
  'KKK.......KKKK',
  'kkk.......kkkk',
];
const LEGS_PASS = [
  '...PPPPPPP....',
  '....PPpPP.....',
  '....PPpPP.....',
  '....PPpPP.....',
  '....PPpPP.....',
  '....PPpPP.....',
  '....PPpPP.....',
  '....PPPPP.....',
  '....PPpPP.....',
  '....KKKKKK....',
  '....kkkkkk....',
];
export const WALK = [toRects([...WALK_TOP, ...LEGS_APART]), toRects([...WALK_TOP, ...LEGS_PASS])];
export const WALK_SIZE = { w: 14, h: 29 };

// ---------- sitting cross-legged (21 x 20) with the MacBook open on his lap ----------
const SIT_BASE = [
  '.....HHHHH...........',
  '....HHhHHHH..........',
  '...HHHHHHHHH.........',
  '...HHHHHHHSSS........',
  '...HHHHSSSSES........',
  '...HHHsSSSSSSS.......',
  '....HHsSSSSRS........',
  '.....HsSSSSS.........',
  '......sSs............',
  '....BBBBBBBB.......m.',
  '...BLBBDBDBBB......m.',
  '...BLBBDBDBBBB....m..',
  '...BLBBBBBBBBB....m..',
  '...BLBBBBBBBBB....m..',
  '...BLBBBBBBBB.....m..',
  '..bBBBBBBBBMMMMMMMm..',
  '.PPPPPPPPPPPPPPPPPP..',
  'PPPPpppppppPPPPPPPP..',
  'KKKPPPPPPPPPPPPKKKK..',
  'kkk............kkkk..',
];
const ARM_TYPE_A: Pix[] = [[10, 11, 'L'], [11, 11, 'L'], [11, 12, 'L'], [12, 12, 'L'], [12, 13, 'L'], [13, 13, 'L'], [14, 14, 'S'], [15, 14, 'S'], [17, 14, 'S']];
const ARM_TYPE_B: Pix[] = [[10, 11, 'L'], [11, 11, 'L'], [11, 12, 'L'], [12, 12, 'L'], [12, 13, 'L'], [13, 13, 'L'], [14, 13, 'S'], [16, 14, 'S'], [17, 14, 'S']];
const ARM_WINDUP: Pix[] = [[4, 9, 'L'], [3, 8, 'L'], [4, 8, 'L'], [3, 7, 'L'], [2, 6, 'L'], [3, 6, 'L'], [2, 5, 'L'], [1, 4, 'S'], [2, 4, 'S'], [0, 3, 'T'], [-1, 2, 'T'], [-2, 1, 'T'], [15, 14, 'S']];
const ARM_RELEASE: Pix[] = [[11, 10, 'L'], [12, 9, 'L'], [12, 10, 'L'], [13, 8, 'L'], [13, 9, 'L'], [14, 7, 'L'], [14, 8, 'L'], [15, 6, 'L'], [16, 5, 'S'], [16, 6, 'S'], [15, 14, 'S']];
const ARM_SIP: Pix[] = [[10, 10, 'L'], [11, 10, 'L'], [11, 9, 'L'], [12, 9, 'L'], [12, 8, 'S'],
  [12, 5, 'W'], [13, 5, 'W'], [12, 6, 'W'], [13, 6, 'C'], [12, 7, 'W'], [13, 7, 'W'], [14, 6, 'W'], [15, 14, 'S']];
const BLINK: Pix[] = [[11, 4, 's']];

export const SIT_SIZE = { w: 21, h: 20 };
export type SitPose = 'typeA' | 'typeB' | 'windup' | 'release' | 'sip';
const ARMS: Record<SitPose, Pix[]> = { typeA: ARM_TYPE_A, typeB: ARM_TYPE_B, windup: ARM_WINDUP, release: ARM_RELEASE, sip: ARM_SIP };
const cache = new Map<string, Rect[]>();
export function sitRects(pose: SitPose, blink: boolean): Rect[] {
  const key = pose + blink;
  if (!cache.has(key)) cache.set(key, toRects(SIT_BASE, [...ARMS[pose], ...(blink ? BLINK : [])]));
  return cache.get(key)!;
}

// ---------- coffee mug (7 x 5) ----------
export const MUG = toRects(['.WWWW..', '.WCCWWW', '.WWWW.W', '.WWWwWW', '..www..']);

// ---------- call duck (14 x 14), facing right ----------
// White feathers with soft grey shading, orange beak and feet, pink cheek.
Object.assign(PAL, {
  U: '#FAFBFD', u: '#D6DDE8', v: '#AEB8C7', // feathers, shade, belly shade
  Y: '#F7A928', y: '#E0801A', Q: '#FB8C3C', // beak, beak shade, feet
  X: '#15171C', Z: '#F6A5C0', // eye, cheek
});

const DUCK_BODY = [
  '.......UUUU...',
  '......UUUUUU..',
  '......UUUUXU..',
  '......UUUUUUYY',
  '......uUUZUUy.',
  '.......uUUUU..',
  '.U....UUUUU...',
  'UUUUUUUUUUUU..',
  '.UUuuuuuvUUU..',
  '.UUUuuuvUUUU..',
  '..uUUUUUUUUu..',
  '...vvvvvvvv...',
];
const FEET: Record<'stand' | 'stepA' | 'stepB' | 'none', string[]> = {
  stand: ['.....Q...Q....', '....QQ..QQ....'],
  stepA: ['....Q.....Q...', '...QQ.....QQ..'],
  stepB: ['.....Q..Q.....', '....QQ.QQ.....'],
  none: ['..............', '..............'],
};
// wing raised above the back (flap frame); the folded wing is drawn into the body
const WING_UP: Pix[] = [
  [4, 3, 'U'], [5, 3, 'U'], [3, 4, 'U'], [4, 4, 'U'], [5, 4, 'u'], [3, 5, 'U'], [4, 5, 'U'], [5, 5, 'u'], [4, 6, 'U'], [5, 6, 'U'],
  [3, 8, 'U'], [4, 8, 'U'], [5, 8, 'U'], [6, 8, 'U'], [7, 8, 'U'], [8, 8, 'U'], [4, 9, 'U'], [5, 9, 'U'], [6, 9, 'U'], [7, 9, 'U'],
];
const EYES = {
  open: [] as Pix[],
  happy: [[9, 3, 'X'], [11, 3, 'X'], [10, 2, 'X']] as Pix[], // ^ shape
  sleep: [[10, 2, 'v'], [9, 2, 'v']] as Pix[],
};
const STICK_IN_BEAK: Pix[] = [9, 10, 11, 12, 13, 14, 15, 16].map((x) => [x, 4, 'T'] as Pix);

export type DuckFrame = { feet: keyof typeof FEET; wing: 'folded' | 'up'; eyes: keyof typeof EYES; stick: boolean };
export const DUCK_SIZE = { w: 14, h: 14 };
const duckCache = new Map<string, Rect[]>();
export function duckRects(f: DuckFrame): Rect[] {
  const key = `${f.feet}|${f.wing}|${f.eyes}|${f.stick}`;
  if (!duckCache.has(key)) {
    duckCache.set(key, toRects([...DUCK_BODY, ...FEET[f.feet]], [
      ...(f.wing === 'up' ? WING_UP : []), ...EYES[f.eyes], ...(f.stick ? STICK_IN_BEAK : []),
    ]));
  }
  return duckCache.get(key)!;
}
