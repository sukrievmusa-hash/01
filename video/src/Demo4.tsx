import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import tl from './tl.json';

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

const TEAL = '#0F766E';
const INK = '#0B2E2B';
const PAPER = '#121417';
const LIGHT = '#F3EFE6';
const YEL = '#F5C542';
const AMBER = '#F59E0B';
const RED = '#E5484D';
const FONT = 'Inter, "DejaVu Sans", "Noto Color Emoji", sans-serif';

const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const arrive = (f: number, at: number, d = 14) => interpolate(f, [at, at + d], [0, 1], { ...cl, easing: Easing.out(Easing.exp) });
const pop = (f: number, at: number, d = 12) => interpolate(f, [at, at + d], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.8)) });
const both = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
const src = (n: string) => staticFile(`shots/${n}.png`);

// ---------- board ----------
const SW = 470;
const K = SW / 390;
const SH = Math.round(844 * K);
const BEZ = 18;
const EX = { cx: 1200, cy: 1010, w: 1400, h: 1300 };
const MP = { x: 875, y: 1070 }, CP = { x: 1525, y: 1070 };
const STP = { cx: 1200, cy: 2520, w: 1400, h: 800 };
const BW = 2400, BH = 3000;
const ANCHOR_Y = 880;
const OV = { x: 1200, y: 1380, z: 0.42 };
const ZP = 1.27;
const Z2 = ZP * 1.2;
type Key = { f: number; x: number; y: number; z: number; d?: number };
const KEYS: Key[] = [
  { f: 0, x: MP.x, y: MP.y - 150, z: 1.45 },
  { f: CUE('hook', 5), x: MP.x - 20, y: MP.y - 190, z: 1.7 },
  { f: CUE('hook', 7), x: MP.x + 10, y: MP.y - 120, z: 1.5 },
  { f: CUE('hook', 12), x: CP.x, y: CP.y, z: ZP, d: 15 },
  { f: LT('s1'), x: MP.x, y: MP.y, z: ZP, d: 15 },
  { f: CUE('s1', 5), x: MP.x, y: MP.y + 50, z: Z2 },
  { f: LT('s2'), x: MP.x, y: MP.y - 60, z: ZP * 1.1 },
  { f: CUE('s2', 4), x: MP.x + 10, y: MP.y + 40, z: Z2 },
  { f: LT('s3'), x: MP.x, y: MP.y - 140, z: Z2 },
  { f: CUE('s3', 4), x: MP.x - 10, y: MP.y - 90, z: Z2 * 1.08 },
  { f: LT('s3b'), x: MP.x, y: MP.y + 20, z: ZP * 1.1 },
  { f: CUE('s3b', 4), x: MP.x, y: MP.y + 50, z: Z2 },
  { f: LT('s4'), x: MP.x, y: MP.y, z: ZP, d: 14 },
  { f: CUE('s4', 2), x: MP.x, y: MP.y - 30, z: Z2 },
  { f: CUE('s4', 8), x: MP.x + 10, y: MP.y - 130, z: ZP * 1.12 },
  { f: LT('s5'), x: MP.x, y: MP.y - 180, z: Z2 },
  { f: CUE('s5', 3), x: MP.x, y: MP.y + 10, z: Z2 },
  { f: CUE('s5', 5), x: CP.x, y: CP.y - 40, z: ZP, d: 15 },
  { f: LT('client'), x: CP.x, y: CP.y - 120, z: Z2 },
  { f: CUE('client', 5), x: CP.x, y: CP.y, z: ZP * 1.1 },
  { f: CUE('client', 9), x: CP.x + 10, y: CP.y - 60, z: Z2 },
  { f: LT('remind'), x: CP.x, y: CP.y, z: ZP, d: 12 },
  { f: CUE('remind', 7), x: CP.x, y: CP.y - 160, z: Z2 },
  { f: LT('cta'), x: 1200, y: MP.y, z: 0.8, d: 15 },
  { f: CUE('cta', 5), x: STP.cx, y: STP.cy, z: 0.72, d: 16 },
  { f: CUE('cta', 8), x: OV.x, y: OV.y, z: OV.z, d: 18 },
];
// cumulative of velocity t^1.2 (1-t)^2 -> peak at 37.5%
const EASE_T: number[] = (() => {
  const n = 200, v: number[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n; v.push(Math.pow(t, 1.2) * Math.pow(1 - t, 2)); }
  const c = [0]; for (let i = 1; i <= n; i++) c.push(c[i - 1] + (v[i] + v[i - 1]) / 2);
  return c.map((x) => x / c[n]);
})();
const ease = (t: number) => { const u = Math.max(0, Math.min(1, t)) * 200, i = Math.floor(u); return i >= 200 ? 1 : EASE_T[i] + (EASE_T[i + 1] - EASE_T[i]) * (u - i); };
const HOLD = Math.log(1.02) / FPS; // +2% per second push-in
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
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  let z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * p);
  if (dist > 500 && Math.min(a.z, b.z) > 0.5) z *= 1 - 0.22 * Math.sin(Math.PI * p) * Math.min(1, dist / 1200);
  return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, z };
};
const camera = (fr: number) => {
  const c = cam0(fr), p = cam0(fr - 1);
  // screen-space velocity for motion blur (px per frame)
  const vx = (c.x - p.x) * c.z, vy = (c.y - p.y) * c.z, vz = Math.abs(Math.log(c.z / p.z)) * 900;
  return { ...c, rot: 0, bx: Math.min(18, Math.abs(vx) * 0.22 + vz * 0.12), by: Math.min(18, Math.abs(vy) * 0.22 + vz * 0.12) };
};

// ---------- generic pieces ----------
const Abs: React.FC<{ x: number; y: number; w?: number | string; h?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, fontFamily: FONT, ...style }}>{children}</div>
);

const Panel: React.FC<{ p: { cx: number; cy: number; w: number; h: number }; title: string; n?: string; tone?: string; f: number; at: number }> = ({ p, title, n, tone = TEAL, f, at }) => {
  const s = pop(f, at, 16);
  return (
    <div style={{ position: 'absolute', left: p.cx - p.w / 2, top: p.cy - p.h / 2, width: p.w, height: p.h, opacity: s, transform: `scale(${0.9 + 0.1 * s})` }}>
      <div style={{ position: 'absolute', inset: 0, background: '#1B1E23', border: '3px solid #2C3038', borderRadius: 50, boxShadow: '0 30px 80px rgba(0,0,0,.55)' }} />
      <div style={{ position: 'absolute', left: 44, top: -42, display: 'flex', alignItems: 'center', gap: 16, background: tone, border: `6px solid ${INK}`, borderRadius: 44, padding: '10px 34px 10px 12px', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#fff', whiteSpace: 'nowrap' }}>
        {n && <span style={{ width: 62, height: 62, borderRadius: 31, background: '#fff', color: INK, display: 'grid', placeItems: 'center', fontSize: 40 }}>{n}</span>}
        {title}
      </div>
    </div>
  );
};

const Card: React.FC<{ p: { cx: number; cy: number; w: number; h: number }; img: string; f: number; at: number; hot: number }> = ({ p, img, f, at, hot }) => {
  const s = pop(f, at, 14);
  const glow = arrive(f, hot, 10);
  return (
    <div style={{ position: 'absolute', left: p.cx - p.w / 2, top: p.cy - p.h / 2, width: p.w, height: p.h, opacity: s, transform: `scale(${(0.9 + 0.1 * s) * (1 + 0.03 * glow)})`, border: `7px solid ${glow > 0.5 ? AMBER : INK}`, borderRadius: 40, overflow: 'hidden', boxShadow: `12px 12px 0 ${INK}`, background: '#fff' }}>
      <Img src={src(img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

// cursor + ripple, in css px of a 390x844 screen
const Tap: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  if (f < at - 14 || f > at + 12) return null;
  const app = arrive(f, at - 14, 12);
  const press = f >= at && f < at + 5;
  const r = interpolate(f, [at, at + 12], [8, 60], cl);
  const ro = interpolate(f, [at, at + 12], [0.9, 0], cl);
  const op = interpolate(f, [at - 14, at - 8, at + 6, at + 12], [0, 1, 1, 0], cl);
  return (
    <>
      {f >= at && <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, border: `5px solid ${AMBER}`, opacity: ro }} />}
      <svg style={{ position: 'absolute', left: x - 6 + (1 - app) * 60, top: y - 3 + (1 - app) * 90, overflow: 'visible', opacity: op }} width={56} height={70}>
        <g transform={`scale(${press ? 0.62 : 0.75})`}>
          <path d="M6 4 L6 70 L24 54 L36 82 L50 76 L38 48 L62 48 Z" fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g>
      </svg>
    </>
  );
};

// ---------- mock messenger UIs (generic styling) ----------
const Bubble: React.FC<{ f: number; at: number; me?: boolean; bg?: string; children: React.ReactNode; time?: string; tail?: React.ReactNode }> = ({ f, at, me, bg, children, time, tail }) => {
  const a = arrive(f, at, 10);
  if (a <= 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: me ? 'flex-end' : 'flex-start', margin: '6px 10px', opacity: a, transform: `translateY(${(1 - a) * 18}px) scale(${0.96 + 0.04 * a})`, transformOrigin: me ? 'right bottom' : 'left bottom' }}>
      <div style={{ maxWidth: 290, background: bg || (me ? '#DCF8C6' : '#fff'), borderRadius: me ? '14px 4px 14px 14px' : '4px 14px 14px 14px', padding: '9px 12px 6px', fontSize: 17, lineHeight: 1.33, color: '#111B21', boxShadow: '0 1px 1px rgba(0,0,0,.12)' }}>
        {children}
        {time && <div style={{ fontSize: 11, color: '#667781', textAlign: 'right', marginTop: 2 }}>{time}</div>}
      </div>
      {tail}
    </div>
  );
};

const StatusBar: React.FC<{ dark?: boolean; time: string }> = ({ dark, time }) => (
  <div style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', fontSize: 14, fontWeight: 700, color: dark ? '#fff' : '#111' }}>
    <span>{time}</span><span style={{ letterSpacing: 2 }}>▮▮▮ ◔</span>
  </div>
);

const WAHead: React.FC<{ name: string; sub: string; av: string; avBg: string }> = ({ name, sub, av, avBg }) => (
  <div style={{ background: '#075E54', color: '#fff' }}>
    <StatusBar dark time="13:48" />
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 12px' }}>
      <span style={{ fontSize: 20 }}>←</span>
      <div style={{ width: 38, height: 38, borderRadius: 19, background: avBg, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 17 }}>{av}</div>
      <div><div style={{ fontWeight: 700, fontSize: 17 }}>{name}</div><div style={{ fontSize: 12, opacity: 0.85 }}>{sub}</div></div>
    </div>
  </div>
);

const LinkPreview: React.FC = () => (
  <div>
    <div style={{ background: '#F0F2F5', borderRadius: 8, overflow: 'hidden', marginBottom: 6, borderLeft: `4px solid ${TEAL}` }}>
      <div style={{ height: 70, background: `linear-gradient(135deg, ${TEAL}, #134E4A)`, color: '#fff', padding: '10px 12px', fontWeight: 800, fontSize: 16 }}>Барбершоп «Демо»<div style={{ fontSize: 11, fontWeight: 500, opacity: 0.85 }}>Онлайн-запись · Jazylam</div></div>
      <div style={{ padding: '6px 10px', fontSize: 12, color: '#54656F' }}>jazylam.kz</div>
    </div>
    <span style={{ color: '#027EB5', textDecoration: 'underline' }}>jazylam.kz/book.html?b=demo</span>
    <div style={{ marginTop: 4 }}>Запишитесь тут, выберите время 👇</div>
  </div>
);

const WAInput: React.FC<{ text?: string; caret?: boolean }> = ({ text, caret }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '8px 8px 18px', display: 'flex', gap: 8, alignItems: 'center', background: '#F0F2F5' }}>
    <div style={{ flex: 1, minHeight: 42, borderRadius: 21, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 14, color: text ? '#111' : '#8696A0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      {text || 'Сообщение'}{caret && <span style={{ width: 2, height: 20, background: '#00A884', marginLeft: 2 }} />}
    </div>
    <div style={{ width: 42, height: 42, borderRadius: 21, background: '#00A884', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 18 }}>➤</div>
  </div>
);

const ChatBg: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <div style={{ position: 'absolute', inset: 0, background: color, backgroundImage: 'radial-gradient(rgba(0,0,0,.035) 2px, transparent 2.5px)', backgroundSize: '22px 22px' }}>{children}</div>
);

const DayChip: React.FC<{ t: string }> = ({ t }) => (
  <div style={{ width: 'fit-content', margin: '10px auto 4px', padding: '3px 10px', borderRadius: 8, background: 'rgba(255,255,255,.85)', fontSize: 12, color: '#54656F' }}>{t}</div>
);

const TGHead: React.FC<{ sub: string; time: string }> = ({ sub, time }) => (
  <div style={{ background: '#fff', borderBottom: '1px solid #E4E9ED' }}>
    <StatusBar time={time} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px 10px' }}>
      <span style={{ fontSize: 20, color: '#3390EC' }}>←</span>
      <div style={{ width: 40, height: 40, borderRadius: 20, background: TEAL, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18 }}>J</div>
      <div><div style={{ fontWeight: 700, fontSize: 17, color: '#000' }}>Jazylam</div><div style={{ fontSize: 13, color: '#8A9AA9' }}>{sub}</div></div>
    </div>
  </div>
);

const TGButtons: React.FC<{ pressed: boolean }> = ({ pressed }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, width: 290, marginTop: 4 }}>
    {['✅ Приду', '✖ Отменить'].map((l, i) => (
      <div key={l} style={{ padding: '9px 0', borderRadius: 10, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#fff', background: i === 0 && pressed ? 'rgba(15,118,110,.85)' : 'rgba(0,0,0,.22)' }}>{l}</div>
    ))}
  </div>
);

const Notif: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const a = arrive(f, at, 12);
  return (
    <div style={{ position: 'absolute', left: 10, right: 10, top: 40, transform: `translateY(${(a - 1) * 140}px)`, opacity: a, background: 'rgba(255,255,255,.96)', borderRadius: 20, padding: '12px 14px', boxShadow: '0 8px 30px rgba(0,0,0,.35)', display: 'flex', gap: 10 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: TEAL, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18, flex: 'none' }}>J</div>
      <div style={{ fontSize: 14, color: '#111', lineHeight: 1.3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><b>Jazylam</b><span style={{ color: '#888', fontSize: 12 }}>сейчас</span></div>
        <b>🆕 Новая онлайн-запись</b><br />Ерлан · Мужская стрижка<br />Завтра, 15:00
      </div>
    </div>
  );
};

const LockScreen: React.FC<{ f: number; at: number }> = ({ f, at }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #1E3A5F 0%, #0B2E2B 70%)', color: '#fff', textAlign: 'center' }}>
    <StatusBar dark time="13:52" />
    <div style={{ marginTop: 70, fontSize: 18, opacity: 0.85 }}>суббота, 14 ноября</div>
    <div style={{ fontSize: 92, fontWeight: 300, letterSpacing: -2, lineHeight: 1 }}>13:52</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 200 }}><Notif f={f} at={at} /></div>
  </div>
);

// receipt page: real screenshot (390 x 1000 css), scrollable, with row highlights
const Receipt: React.FC<{ f: number; scroll: number; hl: number }> = ({ f, scroll, hl }) => {
  const rows = [301, 330, 358, 387, 415];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#F4F6F8' }}>
      <div style={{ position: 'absolute', left: 0, top: -scroll, width: 390, height: 1000 }}>
        <Img src={src('r1_receipt_full')} style={{ width: 390, height: 1000 }} />
        {hl >= 0 && hl < rows.length && (
          <div style={{ position: 'absolute', left: 24, width: 342, top: rows[hl] - 15, height: 30, border: `3px solid ${AMBER}`, borderRadius: 8, background: 'rgba(245,158,11,.12)' }} />
        )}
      </div>
    </div>
  );
};

// ---------- phone with a timeline of screens ----------
type Scr = { at: number; mode?: 'slide' | 'fade' | 'none'; draw: (f: number) => React.ReactNode };
const Phone: React.FC<{ x: number; y: number; f: number; screens: Scr[]; label: string; shakeAt?: number; overlay?: (f: number) => React.ReactNode }> = ({ x, y, f, screens, label, shakeAt, overlay }) => {
  let k = 0;
  screens.forEach((s, i) => { if (f >= s.at) k = i; });
  const cur = screens[k], prev = k > 0 ? screens[k - 1] : null;
  const mode = cur.mode || 'fade';
  const t = k > 0 && mode !== 'none' ? both(f, cur.at, cur.at + 9) : 1;
  const shake = shakeAt != null && f >= shakeAt && f < shakeAt + 22 ? Math.sin((f - shakeAt) * 2.4) * 10 * (1 - (f - shakeAt) / 22) : 0;
  const L = (n: React.ReactNode, tr: string, op = 1) => (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 390, height: 844, transform: tr, opacity: op, overflow: 'hidden' }}>{n}</div>
  );
  return (
    <>
      <Abs x={x - SW / 2} y={y - SH / 2 - BEZ - 100} w={SW} style={{ textAlign: 'center', fontSize: 48, fontWeight: 800, color: LIGHT }}>{label}</Abs>
      <div style={{ position: 'absolute', left: x - SW / 2 - BEZ, top: y - SH / 2 - BEZ, width: SW + BEZ * 2, height: SH + BEZ * 2, borderRadius: 74, background: '#0F172A', boxShadow: `12px 12px 0 ${INK}`, transform: `translateX(${shake}px) rotate(${shake * 0.15}deg)` }}>
        <div style={{ position: 'absolute', left: BEZ, top: BEZ, width: SW, height: SH, borderRadius: 56, overflow: 'hidden', background: '#fff' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 390, height: 844, transform: `scale(${K})`, transformOrigin: '0 0', fontFamily: FONT }}>
            {prev && t < 1 && L(prev.draw(f), mode === 'slide' ? `translateX(${-t * 100}%)` : 'none')}
            {L(cur.draw(f), mode === 'slide' && t < 1 ? `translateX(${(1 - t) * 100}%)` : `scale(${1 + 0.02 * (1 - t)})`, mode === 'fade' ? t : 1)}
            {overlay && overlay(f)}
          </div>
        </div>
      </div>
    </>
  );
};

const Shot: React.FC<{ n: string }> = ({ n }) => <Img src={src(n)} style={{ width: 390, height: 844, objectFit: 'cover', objectPosition: 'top' }} />;

const Toast: React.FC<{ f: number; at: number; text: string }> = ({ f, at, text }) => {
  const a = arrive(f, at, 8) * (1 - arrive(f, at + 40, 8));
  if (a <= 0) return null;
  return <div style={{ position: 'absolute', left: 40, right: 40, top: 560, transform: `translateY(${(1 - a) * 20}px)`, opacity: a, background: 'rgba(17,27,33,.92)', color: '#fff', borderRadius: 24, padding: '12px 16px', textAlign: 'center', fontSize: 15, fontWeight: 600 }}>{text}</div>;
};

// ---------- captions ----------
const chunksOf = (ws: Word[]) => {
  const out: number[][] = [];
  let cur: number[] = [];
  ws.forEach((w, i) => {
    if (w.w === '—') { if (cur.length) { out.push(cur); cur = []; } return; }
    cur.push(i);
    if (cur.length === 3 || /[.,:!?»]$/.test(w.w)) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
};
const Captions: React.FC<{ frame: number }> = ({ frame }) => {
  const t = frame / FPS;
  let k = 0;
  LINES.forEach((l, i) => { if (t >= l.t0 - 0.05) k = i; });
  const line = LINES[k];
  const lt = t - line.t0;
  if (lt > line.dur + 0.4) return null;
  let cur = -1;
  line.words.forEach((w, i) => { if (lt >= w.s - 0.03 && w.w !== '—') cur = i; });
  if (cur < 0) return null;
  const chunk = chunksOf(line.words).find((c) => c.includes(cur));
  if (!chunk) return null;
  const st = Math.round((line.t0 + line.words[chunk[0]].s) * FPS);
  const e = arrive(frame, st, 6);
  const hl = new Set(line.hl.flatMap((h) => h.toLowerCase().split(' ')));
  const clean = (s: string) => s.replace(/[.,:!?—«»]/g, '').toLowerCase();
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: 1600, display: 'flex', justifyContent: 'center', opacity: e, transform: `translateY(${(1 - e) * 20}px)` }}>
      <div style={{ background: 'rgba(18,20,23,.88)', borderRadius: 22, padding: '14px 26px', display: 'flex', gap: 18, alignItems: 'center', boxShadow: '0 12px 40px rgba(0,0,0,.5)' }}>
      {chunk.map((i) => {
        const on = i === cur;
        const h = hl.has(clean(line.words[i].w));
        return (
          <span key={i} style={{ fontFamily: FONT, fontWeight: 800, fontSize: 70, lineHeight: 1.1, letterSpacing: '-0.02em', color: h ? '#141414' : '#fff', background: h ? YEL : 'transparent', borderRadius: 12, padding: h ? '0 12px' : 0, opacity: on || h || i < cur ? 1 : 0.55 }}>
            {line.words[i].w.replace(/[.,:«»]/g, '').toLowerCase()}
          </span>
        );
      })}
      </div>
    </div>
  );
};


const typedFrames = (ff: number, at: number, d: number, pref: string) => {
  if (ff < at) return null;
  const k = Math.min(2, Math.floor((ff - at) / (d / 3)));
  return `${pref}_${k}`;
};

const LINK = 'jazylam.kz/book.html?b=barbershop-alihan';
const IGView: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: '#fff', color: '#111' }}>
    <StatusBar time="19:05" />
    <div style={{ padding: '4px 16px 10px', fontSize: 19, fontWeight: 800 }}>barber.alikhan</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '4px 16px' }}>
      <div style={{ width: 86, height: 86, borderRadius: 43, background: 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)', padding: 4 }}><div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#059669', display: 'grid', placeItems: 'center', fontSize: 36 }}>💈</div></div>
      {[['24', 'публикации'], ['318', 'подписчиков'], ['95', 'подписок']].map(([v, l]) => <div key={l} style={{ textAlign: 'center' }}><b style={{ fontSize: 17 }}>{v}</b><div style={{ fontSize: 12 }}>{l}</div></div>)}
    </div>
    <div style={{ padding: '10px 16px', fontSize: 15, lineHeight: 1.4 }}><b>Барбершоп «Алихан»</b><br />Мужские стрижки · Тараз ✂️<br />Запись онлайн 👇<br /><span style={{ color: '#00376B', fontWeight: 700, fontSize: 13 }}>🔗 {LINK}</span></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '4px 16px' }}>{['Подписаться', 'Сообщение'].map((t, i) => <div key={t} style={{ textAlign: 'center', padding: 8, borderRadius: 8, fontWeight: 700, fontSize: 14, background: i ? '#EFEFEF' : '#0095F6', color: i ? '#111' : '#fff' }}>{t}</div>)}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, marginTop: 14 }}>{Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ height: 128, background: ['#CBD5E1', '#94A3B8', '#E2E8F0', '#64748B'][i % 4] }} />)}</div>
    <div style={{ position: 'absolute', right: 14, bottom: 24, background: 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)', color: '#fff', borderRadius: 18, padding: '6px 14px', fontSize: 14, fontWeight: 800 }}>Instagram</div>
  </div>
);

const Mystery: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: '#15181D', display: 'grid', placeItems: 'center', textAlign: 'center', color: '#9AA0A6', fontFamily: FONT }}>
    <div><div style={{ fontSize: 200, fontWeight: 900, color: YEL, lineHeight: 1 }}>?</div><div style={{ fontSize: 26, fontWeight: 700, marginTop: 10 }}>что увидит клиент</div></div>
  </div>
);

const Hi: React.FC<{ on: boolean; x: number; y: number; w: number; h: number }> = ({ on, x, y, w, h }) => (on ? <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, border: `4px solid ${AMBER}`, borderRadius: 10, boxShadow: '0 0 0 6px rgba(245,158,11,.25)' }} /> : null);

const STEPS = ['Нажать «Попробовать»', 'Почта и пароль', 'Название и телефон', 'Типовые услуги', 'Ссылка в профиль'];

export const Demo4: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camera(f);

  // master cues
  const tryTap = CUE('s1', 6);
  const emailAt = CUE('s2', 1), pwAt = CUE('s2', 2), createTap = CUE('s2', 4) + 4;
  const nameAt = CUE('s3', 1), slugAt = CUE('s3', 4);
  const phoneAt = LT('s3b'), staffAt = CUE('s3b', 1), bizTap = CUE('s3b', 5);
  const typTap = CUE('s4', 3);
  const shareTap = CUE('s5', 1) + 4, copyTap = CUE('s5', 3);
  const linkTap = CUE('client', 2), bookAt = linkTap + 6, masAt = CUE('client', 9);
  const remAt = LT('remind') + 4;
  const STEP_AT = [LT('s1'), LT('s2'), LT('s3'), LT('s4'), LT('s5')];
  const DONE_AT = [tryTap, createTap, bizTap, typTap, copyTap];

  const masterScreens: Scr[] = [
    { at: -1, draw: () => <Shot n="r0_land" /> },
    { at: tryTap + 6, mode: 'slide', draw: (ff) => <Shot n={typedFrames(ff, pwAt, 12, 'r1_pw') || typedFrames(ff, emailAt, 12, 'r1_email') || 'r1_signup'} /> },
    { at: createTap + 8, mode: 'slide', draw: (ff) => (
      <div style={{ position: 'absolute', inset: 0 }}>
        <Shot n={ff >= slugAt - 2 ? 'r2_name_slug' : typedFrames(ff, nameAt, 15, 'r2_name') || 'r2_onb'} />
        <Hi on={ff >= slugAt && ff < LT('s3b') && Math.floor((ff - slugAt) / 7) % 2 === 0} x={14} y={354} w={362} h={84} />
      </div>
    ) },
    { at: phoneAt, mode: 'none', draw: (ff) => <Shot n={ff >= staffAt + 14 ? 'r2_filled' : typedFrames(ff, staffAt, 12, 'r2_staff') || typedFrames(ff, phoneAt, 10, 'r2_phone') || 'r2_name_slug'} /> },
    { at: bizTap + 8, mode: 'slide', draw: (ff) => <Shot n={ff < LT('s4') + 10 ? 'r3_services' : 'r3_services_clean'} /> },
    { at: typTap + 6, mode: 'fade', draw: (ff) => <Shot n={ff < CUE('s4', 11) ? 'r4_list' : 'r4_list_clean'} /> },
    { at: shareTap + 6, mode: 'fade', draw: (ff) => <Shot n={ff >= copyTap + 2 ? 'r5_copied' : 'r5_share'} /> },
  ];
  const masterTaps = (ff: number) => (
    <>
      <Tap f={ff} at={tryTap} x={195} y={493} />
      <Tap f={ff} at={createTap} x={195} y={587} />
      <Tap f={ff} at={bizTap} x={195} y={707} />
      <Tap f={ff} at={typTap} x={200} y={430} />
      <Tap f={ff} at={shareTap} x={306} y={30} />
      <Tap f={ff} at={copyTap} x={195} y={557} />
    </>
  );
  const tgClient = (ff: number) => (
    <ChatBg color="#DCE6EE">
      <TGHead sub="бот" time="15:00" />
      <DayChip t="14 ноября" />
      <Bubble f={ff} at={remAt + 8} bg="#fff" time="15:00" tail={<TGButtons pressed={false} />}><b>⏰ Напоминаем о записи</b><br />Барбершоп «Алихан»<br />Мужская стрижка<br />завтра, 15:00 · Алихан</Bubble>
    </ChatBg>
  );
  const clientScreens: Scr[] = [
    { at: -1, draw: () => <Mystery /> },
    { at: CUE('s5', 5) - 4, mode: 'fade', draw: () => <IGView /> },
    { at: bookAt, mode: 'slide', draw: (ff) => <Shot n={ff >= masAt + 6 ? 'r6_slots' : 'r6_book'} /> },
    { at: remAt, mode: 'slide', draw: tgClient },
  ];
  const clientTaps = (ff: number) => (
    <>
      <Tap f={ff} at={linkTap} x={170} y={250} />
      <Tap f={ff} at={masAt} x={160} y={208} />
    </>
  );

  // focus
  const near = cam.z > 0.9;
  const side = Math.max(0, Math.min(1, (cam.x - 1060) / 280));
  const dimM = near ? `brightness(${1 - 0.6 * side}) blur(${(side * 4).toFixed(1)}px)` : 'none';
  const dimC = near ? `brightness(${1 - 0.6 * (1 - side)}) blur(${((1 - side) * 4).toFixed(1)}px)` : 'none';

  let step = 0; STEP_AT.forEach((t, i) => { if (f >= t) step = i + 1; });
  const stepPop = 1 + 0.25 * Math.max(0, 1 - (f - STEP_AT[Math.max(0, step - 1)]) / 8);
  const cntA = arrive(f, LT('s1') - 6, 10) * (1 - arrive(f, LT('client'), 8));
  const hookA = arrive(f, CUE('hook', 5) - 2, 8) * (1 - arrive(f, LT('s1') - 8, 8));
  const resA = arrive(f, LT('cta') - 2, 10) * (1 - arrive(f, CUE('cta', 5), 8));
  const resN = Math.round(interpolate(f, [LT('cta') - 2, LT('cta') + 22], [0, 5], cl));
  const ctaA = pop(f, CUE('cta', 8), 16);
  const hdrA = pop(f, LT('cta') - 20, 16);

  return (
    <AbsoluteFill style={{ background: PAPER, overflow: 'hidden' }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}><filter id="mb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={`${cam.bx.toFixed(2)} ${cam.by.toFixed(2)}`} /></filter></svg>
      <AbsoluteFill style={{ filter: cam.bx + cam.by > 0.6 ? 'url(#mb)' : undefined }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: BW, height: BH, transformOrigin: '0 0', transform: `translate(540px, ${ANCHOR_Y}px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)` }}>
        <div style={{ position: 'absolute', left: -4000, top: -4000, width: BW + 8000, height: BH + 8000, backgroundImage: 'radial-gradient(rgba(243,239,230,.09) 4px, transparent 4.5px)', backgroundSize: '70px 70px' }} />
        <Abs x={250} y={-120} w={1900} h={200} style={{ display: 'flex', alignItems: 'center', gap: 40, opacity: hdrA }}>
          <div style={{ width: 170, height: 170, borderRadius: 46, background: TEAL, border: `8px solid ${INK}`, display: 'grid', placeItems: 'center', color: '#fff', fontSize: 110, fontWeight: 900 }}>J</div>
          <div style={{ fontSize: 150, fontWeight: 900, color: LIGHT, letterSpacing: '-0.04em' }}>Jazylam<span style={{ color: TEAL }}>.kz</span></div>
        </Abs>
        <Panel p={EX} title="Регистрация за 5 шагов" f={f} at={-30} />
        <div style={{ filter: dimM }}><Phone x={MP.x} y={MP.y} f={f} screens={masterScreens} label="Ты (мастер)" overlay={masterTaps} /></div>
        <div style={{ filter: dimC }}><Phone x={CP.x} y={CP.y} f={f} screens={clientScreens} label="Клиент" overlay={clientTaps} shakeAt={remAt + 8} /></div>

        <Panel p={STP} title="Итог" f={f} at={-30} />
        {STEPS.map((s, i) => {
          const done = arrive(f, DONE_AT[i] + 3, 8);
          const y = STP.cy - STP.h / 2 + 90 + i * 135;
          return (
            <Abs key={s} x={STP.cx - STP.w / 2 + 80} y={y} w={STP.w - 160} h={110} style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
              <div style={{ width: 96, height: 96, borderRadius: 48, background: done > 0.5 ? YEL : '#2C3038', color: done > 0.5 ? '#141414' : LIGHT, display: 'grid', placeItems: 'center', fontSize: 54, fontWeight: 900, transform: `scale(${1 + 0.2 * done * (1 - done)})` }}>{done > 0.5 ? '✓' : i + 1}</div>
              <div style={{ fontSize: 62, fontWeight: 800, color: done > 0.5 ? LIGHT : '#6B7078' }}>{s}</div>
            </Abs>
          );
        })}
      </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 44%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }} />
      {hookA > 0 && (
        <div style={{ position: 'absolute', right: 24, top: 18, opacity: hookA, transform: `scale(${0.85 + 0.15 * hookA})`, transformOrigin: 'right top', background: 'rgba(18,20,23,.94)', borderRadius: 24, padding: '6px 20px', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 16px 50px rgba(0,0,0,.6)' }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: YEL, lineHeight: 1 }}>5</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#9AA0A6', lineHeight: 1.1 }}>шагов<br />до записи</div>
        </div>
      )}
      {cntA > 0 && (
        <div style={{ position: 'absolute', right: 24, top: 18, opacity: cntA, background: 'rgba(18,20,23,.94)', borderRadius: 24, padding: '6px 20px', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 16px 50px rgba(0,0,0,.6)' }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 1, transform: `scale(${stepPop})` }}>{step}<span style={{ color: '#6B7078', fontSize: 40 }}>/5</span></div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#9AA0A6', lineHeight: 1.1 }}>шаг</div>
        </div>
      )}
      {resA > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', opacity: resA }}>
          <div style={{ background: 'rgba(18,20,23,.94)', borderRadius: 40, padding: '40px 70px', textAlign: 'center', fontFamily: FONT, transform: `scale(${0.9 + 0.1 * resA})`, boxShadow: '0 30px 90px rgba(0,0,0,.6)' }}>
            <div style={{ fontSize: 300, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{resN}</div>
            <div style={{ display: 'inline-block', marginTop: 10, fontSize: 56, fontWeight: 800, color: '#141414', background: YEL, borderRadius: 14, padding: '4px 20px' }}>шагов</div>
            <div style={{ fontSize: 38, fontWeight: 600, color: '#9AA0A6', marginTop: 18 }}>и страница записи работает</div>
          </div>
        </div>
      )}
      {ctaA > 0 && (
        <div style={{ position: 'absolute', left: 90, right: 90, top: 1540, transform: `scale(${ctaA})`, background: TEAL, border: `8px solid ${INK}`, borderRadius: 50, padding: '26px 0', textAlign: 'center', fontFamily: FONT }}>
          <div style={{ fontSize: 104, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>jazylam.kz</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: YEL, marginTop: 10 }}>14 дней бесплатно · ссылка в профиле</div>
        </div>
      )}
      {f < CUE('cta', 8) && <Captions frame={f} />}
      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};
