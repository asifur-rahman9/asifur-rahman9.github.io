// Pixel-art sprites as character grids. Each char maps to a colour; '.' is empty.
// Grids are converted once into run-length <rect> lists for cheap SVG rendering.

export const PAL: Record<string, string> = {
  H: '#1A1416', h: '#3A2E2E', // hair
  S: '#D8A27A', s: '#B9825C', // skin, skin shadow
  E: '#1B1B1F', R: '#9C5B45', // eye, mouth
  B: '#5A3D2B', b: '#452E20', L: '#73513A', D: '#E6E9EF', // dark brown hoodie, shadow, light, drawstring
  P: '#4A6A9A', p: '#34507A', // jeans
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
  '...H.HH.H.....',
  '...HHhHHhH....',
  '..HhHHhHHHH...',
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

// ---------- seated at a desk (32 x 26): armchair, developer, table, MacBook, mug ----------
Object.assign(PAL, {
  A: '#AFC0D2', a: '#8A9BB0', O: '#5A3426', // armchair cushion, shade, wooden legs
  r: '#B0574D', // mouth
  N: '#8E5A44', n: '#6E4234', V: '#5E6B7C', // table top, edge, pedestal
});
const W32 = 30, H26 = 26; // composite width/height in sprite pixels
const blank = () => Array.from({ length: H26 }, () => Array<string>(W32).fill('.'));
const paint = (g: string[][], rows: string[], dx = 0, dy = 0) =>
  rows.forEach((row, y) => row.split('').forEach((ch, x) => { if (ch !== '.' && g[y + dy] && x + dx < W32) g[y + dy][x + dx] = ch; }));

const CHAIR = [
  ...Array(11).fill(''),
  'AAa', 'AAa', 'AAa', 'AAa', 'AAa', 'AAa', 'AAa', 'AAa', 'AAa',
  'AAAAAAAAAAAA',
  'aaaaaaaaaaaa',
  '.O........O.', '.O........O.', '.O........O.', '.O........O.',
];
// three-quarter view toward the laptop: small head, no smile, hoodie, jeans, white sneakers
const PERSON = [
  '',
  '.....H.HH.H',
  '....HHHHHHHH',
  '...HHhHHhHHHH',
  '..HHhHHHhHHhH',
  '..HHhHHSHSSHH',
  '..HHHsSSESES',
  '..hHHsSSSSSS',
  '...HHSSSSSSSS',
  '...hHSSSSSrS',
  '.....sSSSrs',
  '......sSs',
  '...LLBBBBL',
  '...BBBDBDBB',
  '...BBBDBDBB',
  '...BBBBBBBB',
  '...BBBbbbBB',
  '...bbbbbbbb',
  '...PPPPPPPPPPP',
  '...ppPPPPPPPPP',
  '..........PPPP',
  '..........PPPP',
  '..........PPPP',
  '..........pPPp',
  '..........KKKKK',
  '..........kkkkk',
];
const TABLE = [
  ...Array(17).fill(''),
  'NNNNNNNNNNNNNNNN',
  '.nnnnnnnnnnnnnn.',
  '.......VV', '.......VV', '.......VV', '.......VV', '.......VV', '.......VV',
  '....VVVVVVVV',
];
const DESK_MUG = [...Array(13).fill(''), '.WCW', '.WWWW', '.WWWW', '.www'];
const LAPTOP = [
  ...Array(10).fill(''),
  '.........m', '.........m', '........m', '........m', '........m', '........m',
  'MMMMMMMMm',
];

function scene(withPerson: boolean): string[] {
  const g = blank();
  paint(g, CHAIR);
  if (withPerson) paint(g, PERSON);
  paint(g, TABLE, 14);
  paint(g, DESK_MUG, 25);
  if (withPerson) paint(g, LAPTOP, 16);
  return g.map((r) => r.join(''));
}

// far arm (darker, behind) and near arm (lighter) both reach the keyboard
const FAR_ARM: Pix[] = [[11, 13, 'b'], [12, 13, 'b'], [13, 14, 'b'], [14, 14, 'b'], [15, 14, 'b'], [16, 14, 'b'], [17, 14, 'b'], [18, 14, 'b']];
const NEAR_ARM: Pix[] = [[11, 14, 'L'], [12, 14, 'L'], [13, 15, 'L'], [14, 15, 'L'], [15, 15, 'L'], [16, 15, 'L']];
const ARM_TYPE_A: Pix[] = [...FAR_ARM, [19, 15, 'S'], ...NEAR_ARM, [17, 15, 'S']];
const ARM_TYPE_B: Pix[] = [...FAR_ARM, [19, 14, 'S'], ...NEAR_ARM, [18, 15, 'S']];
const ARM_WINDUP: Pix[] = [...FAR_ARM, [19, 15, 'S'], [11, 11, 'L'], [12, 10, 'L'], [12, 9, 'L'], [12, 8, 'L'], [12, 7, 'S'], [11, 6, 'T'], [10, 5, 'T'], [9, 4, 'T'], [8, 3, 'T']];
const ARM_RELEASE: Pix[] = [...FAR_ARM, [19, 15, 'S'], [11, 11, 'L'], [12, 10, 'L'], [13, 9, 'L'], [14, 8, 'L'], [15, 7, 'S']];
// sip: near arm lifts the desk mug to his mouth; far hand stays on the keyboard
const ARM_SIP: Pix[] = [...FAR_ARM, [19, 15, 'S'], [11, 13, 'L'], [11, 12, 'L'], [12, 11, 'S'],
  [11, 8, 'W'], [12, 8, 'W'], [13, 8, 'W'], [11, 9, 'W'], [12, 9, 'W'], [13, 9, 'W'], [11, 10, 'w'], [12, 10, 'w'], [13, 10, 'w'],
  ...[26, 27, 28, 29].flatMap((x) => [13, 14, 15, 16].map((y) => [x, y, '.'] as Pix))];
const BLINK: Pix[] = [[8, 6, 's'], [10, 6, 's']];

export const SEAT_SIZE = { w: W32, h: H26 };
/** where the stick leaves his hand on release, in sprite pixels */
export const RELEASE_HAND = { x: 15, y: 7 };
export const FURNITURE = toRects(scene(false));
export type SitPose = 'typeA' | 'typeB' | 'windup' | 'release' | 'sip';
const ARMS: Record<SitPose, Pix[]> = { typeA: ARM_TYPE_A, typeB: ARM_TYPE_B, windup: ARM_WINDUP, release: ARM_RELEASE, sip: ARM_SIP };
const SEATED = scene(true);
const cache = new Map<string, Rect[]>();
export function sitRects(pose: SitPose, blink: boolean): Rect[] {
  const key = pose + blink;
  if (!cache.has(key)) cache.set(key, toRects(SEATED, [...ARMS[pose], ...(blink ? BLINK : [])]));
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
