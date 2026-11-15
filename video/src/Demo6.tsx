import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import tl from './tl6.json';

const FPS = 30;
type Word = { w: string; s: number; e: number };
type Line = { text: string; hl: string[]; kind: string; t0: number; dur: number; words: Word[] };
const LINES = tl.lines as Line[];
const END = Math.ceil(tl.total * FPS);
const IDX: Record<string, number> = {};
LINES.forEach((l, i) => (IDX[l.kind] = i));
const LT = (k: string) => Math.round(LINES[IDX[k]].t0 * FPS);
const CUE = (k: string, i: number) => {
  const l = LINES[IDX[k]];
  return Math.round((l.t0 + l.words[Math.min(i, l.words.length - 1)].s) * FPS);
};
const LEND = (k: string) => Math.round((LINES[IDX[k]].t0 + LINES[IDX[k]].dur) * FPS);

const BG = '#121417', PANEL = '#1B1E23', LINE = '#2C3038', LIGHT = '#F3EFE6', YEL = '#F5C542', RED = '#E5484D', TEAL = '#0F766E';
const FONT = 'Inter, "DejaVu Sans", "Noto Color Emoji", sans-serif';
const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const arrive = (f: number, at: number, d = 14) => interpolate(f, [at, at + d], [0, 1], { ...cl, easing: Easing.out(Easing.exp) });
const pop = (f: number, at: number, d = 12) => interpolate(f, [at, at + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.8)) });
const lin = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], cl);


// ---- phone geometry: real Telegram screenshots 800x1340 ----
const PW = 560, K = PW / 800, PH = Math.round(1340 * K), PX = 260, PY = 380;
const px = (x: number) => PX + x * K, py = (y: number) => PY + y * K;
const tLaunch = CUE('s1', 7);
const SCREENS: { at: number; img: string }[] = [
  { at: 0, img: 'b1_launch' },
  { at: tLaunch + 8, img: 'b2_ask' },
  { at: LT('s2'), img: 'b3_price' },
  { at: LT('own'), img: 'b4_owner_blur' },
];
const PHONE_IN = LT('s1') - 6, PHONE_OUT = LT('res') - 2;
type R = [number, number, number, number];
const RINGS: { a: number; b: number; r: R }[] = [
  { a: CUE('s1', 12), b: LT('s2'), r: [140, 790, 725, 865] },
  { a: CUE('s2', 2), b: CUE('s2', 5), r: [18, 80, 712, 445] },
  { a: CUE('s2', 5), b: LT('s3'), r: [30, 182, 712, 265] },
  { a: CUE('s3', 1), b: CUE('s3', 4), r: [395, 460, 792, 505] },
  { a: CUE('s3', 4), b: LT('s4'), r: [18, 512, 738, 712] },
  { a: CUE('s4', 1), b: LT('bad'), r: [18, 782, 708, 905] },
  { a: CUE('own', 4), b: LT('res'), r: [18, 212, 708, 380] },
];
const ctr = (r: R) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

type Key = { f: number; x: number; y: number; z: number; d?: number };
const PC = py(670);
const KEYS: Key[] = [
  { f: 0, x: 540, y: 900, z: 1.0 },
  { f: LT('s1'), x: 540, y: PC, z: 1.0, d: 14 },
  { f: CUE('s1', 6), x: 540, y: py(1080), z: 1.3 },
  { f: CUE('s1', 10), x: 540, y: py(760), z: 1.25 },
  { f: LT('s2'), x: 540, y: py(330), z: 1.22, d: 14 },
  { f: CUE('s2', 5), x: 540, y: py(260), z: 1.32 },
  { f: LT('s3'), x: 540, y: py(520), z: 1.2 },
  { f: CUE('s3', 4), x: 540, y: py(610), z: 1.3 },
  { f: LT('s4'), x: 540, y: py(840), z: 1.28 },
  { f: LT('bad'), x: 540, y: PC, z: 1.02, d: 14 },
  { f: LT('own'), x: 540, y: py(330), z: 1.22, d: 14 },
  { f: CUE('own', 6), x: 540, y: py(420), z: 1.3 },
  { f: LT('res'), x: 540, y: 960, z: 1.0, d: 12 },
  { f: LT('cta'), x: 540, y: 960, z: 1.0, d: 12 },
];
const EASE_T: number[] = (() => {
  const n = 200, v: number[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n; v.push(Math.pow(t, 1.2) * Math.pow(1 - t, 2)); }
  const c = [0]; for (let i = 1; i <= n; i++) c.push(c[i - 1] + (v[i] + v[i - 1]) / 2);
  return c.map((x) => x / c[n]);
})();
const ease = (t: number) => { const u = Math.max(0, Math.min(1, t)) * 200, i = Math.floor(u); return i >= 200 ? 1 : EASE_T[i] + (EASE_T[i + 1] - EASE_T[i]) * (u - i); };
const HOLD = Math.log(1.02) / FPS;
const dur = (k: Key) => k.d ?? 12;
const held = (k: Key, fr: number) => ({ x: k.x, y: k.y, z: k.z * Math.exp(HOLD * Math.max(0, fr - k.f - dur(k))) });
const cam0 = (fr: number) => {
  let i = 0;
  while (i < KEYS.length - 1 && fr >= KEYS[i + 1].f) i++;
  const b = KEYS[i];
  if (i === 0) return held({ ...b, d: 0 }, fr);
  const a = held(KEYS[i - 1], b.f);
  const p = ease((fr - b.f) / dur(b));
  if (p >= 1) return held(b, fr);
  return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, z: Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * p) };
};


// ---- pieces ----
const Abs: React.FC<{ x: number; y: number; w?: number | string; h?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, fontFamily: FONT, ...style }}>{children}</div>
);
const Tap: React.FC<{ f: number; at: number; to: number[]; from: number[] }> = ({ f, at, to, from }) => {
  const e = Easing.out(Easing.cubic)(lin(f, at - 12, at - 1));
  const x = px(from[0] + (to[0] - from[0]) * e), y = py(from[1] + (to[1] - from[1]) * e);
  const vis = interpolate(f, [at - 14, at - 10, at + 10, at + 16], [0, 1, 1, 0], cl);
  const press = interpolate(f, [at - 1, at + 2, at + 6], [1, 0.8, 1], cl);
  const ring = lin(f, at, at + 14);
  if (vis <= 0) return null;
  return (
    <>
      <div style={{ position: 'absolute', left: x - 60 * ring - 6, top: y - 60 * ring - 6, width: (60 * ring + 6) * 2, height: (60 * ring + 6) * 2, borderRadius: '50%', border: `5px solid ${YEL}`, opacity: ring > 0 ? 1 - ring : 0 }} />
      <svg width={70} height={70} viewBox="0 0 24 24" style={{ position: 'absolute', left: x - 6, top: y - 4, opacity: vis, transform: `scale(${press})`, transformOrigin: '6px 4px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.5))' }}>
        <path d="M5 3l14 8-6 1.8L10.5 19z" fill={LIGHT} stroke="#111" strokeWidth={1.2} strokeLinejoin="round" />
      </svg>
    </>
  );
};
const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', left: PX - 14, top: PY - 14, width: PW + 28, height: PH + 28, borderRadius: 56, background: '#0A0B0D', border: `4px solid ${LINE}`, boxShadow: '0 40px 100px rgba(0,0,0,.6)' }}>
    <div style={{ position: 'absolute', left: 14, top: 14, width: PW, height: PH, borderRadius: 42, overflow: 'hidden', background: '#000' }}>{children}</div>
  </div>
);
const Screens: React.FC<{ f: number }> = ({ f }) => (
  <>
    {SCREENS.map((s, i) => {
      const a = i === 0 ? 1 : lin(f, s.at, s.at + 7);
      if (a <= 0) return null;
      return <Img key={s.img} src={staticFile(`shots/${s.img}.png`)} style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH, opacity: a, transform: i === 0 ? undefined : `translateX(${(1 - a) * 40}px)` }} />;
    })}
  </>
);
const Rings: React.FC<{ f: number }> = ({ f }) => (
  <>
    {RINGS.map((g, i) => {
      const a = arrive(f, g.a, 8) * (1 - lin(f, g.b - 4, g.b + 2));
      if (a <= 0) return null;
      const [x0, y0, x1, y1] = g.r;
      return <div key={i} style={{ position: 'absolute', left: px(x0) - 6, top: py(y0) - 6, width: (x1 - x0) * K + 12, height: (y1 - y0) * K + 12, borderRadius: 18, border: `5px solid ${YEL}`, opacity: a, boxShadow: `0 0 30px ${YEL}66` }} />;
    })}
  </>
);
const Label: React.FC<{ f: number }> = ({ f }) => {
  const own = f >= LT('own');
  const a = arrive(f, PHONE_IN, 10) * (1 - lin(f, PHONE_OUT - 6, PHONE_OUT));
  return (
    <Abs x={560} y={96} w={480} style={{ opacity: a, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      <span style={{ background: 'rgba(18,20,23,.9)', borderRadius: 18, padding: '4px 16px', fontWeight: 800, fontSize: 32, color: LIGHT, whiteSpace: 'nowrap' }}>{own ? 'видит только владелец' : 'клиент пишет боту'}</span>
      <span style={{ background: 'rgba(18,20,23,.9)', border: `2px solid ${YEL}`, color: YEL, borderRadius: 18, padding: '4px 14px', fontWeight: 800, fontSize: 26, whiteSpace: 'nowrap' }}>{own ? 'номера скрыты' : 'тестовая переписка'}</span>
    </Abs>
  );
};
const CLOCK: [number, string][] = [[0, '07:53'], [LT('s2'), '07:56'], [LT('s3'), '07:57'], [LT('own'), '07:58']];
const Clock: React.FC<{ f: number }> = ({ f }) => {
  let i = 0; while (i < CLOCK.length - 1 && f >= CLOCK[i + 1][0]) i++;
  const s = 1 + 0.2 * Math.max(0, 1 - (f - CLOCK[i][0]) / 10);
  const a = arrive(f, PHONE_IN, 10) * (1 - lin(f, LT('res') - 6, LT('res')));
  return (
    <Abs x={40} y={96} style={{ opacity: a, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(18,20,23,.9)', border: `3px solid ${LINE}`, borderRadius: 30, padding: '10px 26px 10px 22px' }}>
      <span style={{ fontWeight: 900, fontSize: 64, color: YEL, transform: `scale(${s})`, transformOrigin: 'left center' }}>{CLOCK[i][1]}</span>
      <span style={{ fontWeight: 800, fontSize: 26, color: LIGHT, lineHeight: 1.1, whiteSpace: 'pre-line' }}>{'время\nв чате'}</span>
    </Abs>
  );
};
const Hook: React.FC<{ f: number }> = ({ f }) => {
  const a = arrive(f, 0, 8) * (1 - lin(f, PHONE_IN - 4, PHONE_IN + 4));
  if (a <= 0) return null;
  const q = pop(f, 4, 10);
  return (
    <Abs x={0} y={0} w={1080} h={1920} style={{ opacity: a }}>
      <div style={{ position: 'absolute', left: 110, top: 600, width: 860, padding: '44px 40px', background: PANEL, border: `3px solid ${LINE}`, borderRadius: 50, boxShadow: '0 30px 80px rgba(0,0,0,.55)' }}>
        <div style={{ fontWeight: 800, fontSize: 34, color: '#9aa0a8', marginBottom: 24 }}>иллюстрация</div>
        <div style={{ display: 'inline-block', background: '#2B5278', color: '#fff', fontWeight: 700, fontSize: 56, padding: '18px 34px', borderRadius: '34px 34px 34px 8px' }}>Во сколько обойдётся?</div>
        <div style={{ marginTop: 28, display: 'inline-block', background: RED, color: '#fff', fontWeight: 900, fontSize: 46, padding: '8px 28px', borderRadius: 22, opacity: lin(f, 16, 26) }}>без ответа · ты занят</div>
      </div>
      <div style={{ position: 'absolute', right: 70, top: 420, fontWeight: 900, fontSize: 280, color: YEL, transform: `scale(${q}) rotate(10deg)`, lineHeight: 1 }}>?</div>
    </Abs>
  );
};
const Chip: React.FC<{ f: number }> = ({ f }) => {
  const a = pop(f, CUE('bad', 8), 10) * (1 - lin(f, LT('own') - 2, LT('own') + 6));
  if (a <= 0) return null;
  return <Abs x={PX + 30} y={PY + 380} style={{ transform: `scale(${a}) rotate(-5deg)`, background: RED, color: '#fff', fontWeight: 900, fontSize: 56, padding: '12px 34px', borderRadius: 28, boxShadow: '0 18px 40px rgba(0,0,0,.5)' }}>ушёл к другому…</Abs>;
};
const Result: React.FC<{ f: number }> = ({ f }) => {
  const a = arrive(f, LT('res') - 2, 12) * (1 - lin(f, LT('cta') - 12, LT('cta') - 3));
  if (a <= 0) return null;
  const n = Math.round(5 * Easing.out(Easing.cubic)(lin(f, CUE('res', 0), CUE('res', 0) + 24)));
  const mark = lin(f, CUE('res', 0) + 24, CUE('res', 0) + 38);
  const t = pop(f, CUE('res', 7), 12);
  return (
    <Abs x={0} y={0} w={1080} h={1920} style={{ opacity: a }}>
      <div style={{ position: 'absolute', left: 90, top: 470, width: 900, padding: '40px 30px 50px', background: PANEL, border: `3px solid ${LINE}`, borderRadius: 56, boxShadow: '0 30px 80px rgba(0,0,0,.55)', textAlign: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: 340, color: LIGHT, lineHeight: 1.05 }}>{n}</div>
        <div style={{ height: 14, width: 300 * mark, background: YEL, margin: '-6px auto 18px', borderRadius: 7 }} />
        <div style={{ fontWeight: 900, fontSize: 64, color: LIGHT }}>минут до заявки</div>
        <div style={{ marginTop: 26, fontWeight: 800, fontSize: 40, color: YEL }}>07:53 → 07:58 по времени в чате</div>
        <div style={{ marginTop: 30, transform: `scale(${t})`, display: 'inline-block', border: `3px solid #9aa0a8`, color: '#c9ccd1', fontWeight: 800, fontSize: 36, padding: '8px 26px', borderRadius: 22 }}>тестовая переписка</div>
      </div>
    </Abs>
  );
};
const Cta: React.FC<{ f: number }> = ({ f }) => {
  const a = arrive(f, LT('cta') - 2, 10);
  if (a <= 0) return null;
  const s = pop(f, LT('cta') + 4, 14), b = pop(f, CUE('cta', 6), 12);
  return (
    <Abs x={0} y={0} w={1080} h={1920} style={{ opacity: a }}>
      <div style={{ position: 'absolute', left: 60, top: 600, width: 960, textAlign: 'center', transform: `scale(${0.9 + 0.1 * s})` }}>
        <div style={{ fontWeight: 900, fontSize: 60, color: LIGHT, marginBottom: 34 }}>бот для твоего бизнеса</div>
        <div style={{ display: 'inline-block', background: YEL, color: '#111', fontWeight: 900, fontSize: 88, whiteSpace: 'nowrap', padding: '24px 50px', borderRadius: 44, boxShadow: '0 24px 60px rgba(0,0,0,.5)' }}>MUSA Ассистент</div>
        <div style={{ marginTop: 40, transform: `scale(${b})`, display: 'inline-block', border: `4px solid ${YEL}`, color: YEL, fontWeight: 900, fontSize: 52, whiteSpace: 'nowrap', padding: '12px 40px', borderRadius: 30 }}>Telegram · ссылка в профиле</div>
      </div>
    </Abs>
  );
};
// ---- subtitles ----
const norm = (s: string) => s.toLowerCase().replace(/[^а-яёa-z0-9]/g, '');
const chunks = (l: Line) => {
  const out: { a: number; b: number; ws: Word[] }[] = [];
  let cur: Word[] = [];
  l.words.forEach((w, i) => {
    cur.push(w);
    const brk = /[.,:!?»]$/.test(w.w) || cur.length >= 3 || i === l.words.length - 1;
    if (brk) { out.push({ a: cur[0].s, b: 0, ws: cur }); cur = []; }
  });
  out.forEach((c, i) => (c.b = i < out.length - 1 ? out[i + 1].a : l.dur + 0.3));
  return out;
};
const Subs: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const l = LINES.find((x) => t >= x.t0 - 0.05 && t < x.t0 + x.dur + 0.25);
  if (!l) return null;
  const lt = t - l.t0;
  const c = chunks(l).find((k) => lt >= k.a - 0.02 && lt < k.b);
  if (!c) return null;
  const hl = l.hl.map(norm);
  return (
    <Abs x={0} y={1590} w={1080} style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ background: 'rgba(18,20,23,.88)', borderRadius: 30, padding: '14px 30px', display: 'flex', gap: 18, fontWeight: 900, fontSize: 70, color: LIGHT, maxWidth: 1000 }}>
        {c.ws.map((w, i) => {
          const h = hl.includes(norm(w.w));
          return <span key={i} style={h ? { background: YEL, color: '#111', borderRadius: 14, padding: '0 14px' } : undefined}>{w.w.replace(/[«»]/g, '').replace(/[.,:!?]$/, '')}</span>;
        })}
      </div>
    </Abs>
  );
};


export const Demo6: React.FC = () => {
  const f = useCurrentFrame();
  const c = cam0(f), p = cam0(f - 1);
  const vx = Math.abs(c.x - p.x) * c.z, vy = Math.abs(c.y - p.y) * c.z, vz = Math.abs(Math.log(c.z / p.z)) * 900;
  const bl = Math.min(10, (vx + vy) * 0.18 + vz * 0.1);
  const phoneA = arrive(f, PHONE_IN, 12) * (1 - lin(f, PHONE_OUT - 4, PHONE_OUT + 6));
  const dots = 'radial-gradient(rgba(243,239,230,.09) 2px, transparent 2.5px)';
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${540 - c.x * c.z}px, ${960 - c.y * c.z}px) scale(${c.z})`, filter: bl > 0.6 ? `blur(${bl}px)` : undefined }}>
        <div style={{ position: 'absolute', left: -800, top: -800, width: 2700, height: 3500, backgroundImage: dots, backgroundSize: '56px 56px' }} />
        <Hook f={f} />
        {phoneA > 0 && (
          <div style={{ opacity: phoneA, transform: `translateX(${(1 - arrive(f, PHONE_IN, 12)) * -120}px)` }}>
            <Frame><Screens f={f} /></Frame>
            <Rings f={f} />
            <Tap f={f} at={tLaunch} from={[600, 900]} to={[398, 1222]} />
            <Chip f={f} />
          </div>
        )}
        <Result f={f} />
        <Cta f={f} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.6) 100%)', pointerEvents: 'none' }} />
      <Clock f={f} />
      <Label f={f} />
      <Subs f={f} />
      <Audio src={staticFile('mix6.wav')} />
    </AbsoluteFill>
  );
};
