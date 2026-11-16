import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import tl from './tl9.json';

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


// ---- phone geometry ----
const PW = 560, K = PW / 390, PH = Math.round(844 * K), PX = 260, PY = 300;
const px = (cx: number) => PX + cx * K, py = (cy: number) => PY + cy * K;
const T = { service: [195, 276], slot: [195, 527], submit: [195, 742], cost: [195, 387] };
const tService = CUE('p', 0), tSlot = CUE('p', 1), tSubmit = CUE('p', 5);
const SCREENS: { at: number; img: string }[] = [
  { at: 0, img: 'c1_services' },
  { at: tService + 7, img: 'c2_time' },
  { at: tSlot + 7, img: 'c3_form_empty' },
  { at: CUE('p', 2), img: 'c3_form' },
  { at: tSubmit + 8, img: 'c4_done' },
];
const PHONE_IN = LT('p') - 6, PHONE_OUT = LT('n') - 4;

// ---- camera ----
type Key = { f: number; x: number; y: number; z: number; d?: number };
const KEYS: Key[] = [
  { f: 0, x: 540, y: 960, z: 1.0 },
  { f: CUE('h', 1), x: 540, y: 880, z: 1.12, d: 12 },
  { f: LT('a'), x: 540, y: 960, z: 1.0, d: 10 },
  { f: CUE('a', 4), x: 540, y: 1000, z: 1.12, d: 10 },
  { f: CUE('l', 5), x: 540, y: 1060, z: 1.12, d: 10 },
  { f: LT('b'), x: 540, y: 960, z: 1.05, d: 10 },
  { f: CUE('b', 3), x: 540, y: 800, z: 1.12, d: 10 },
  { f: LT('p') - 4, x: 540, y: 900, z: 1.0, d: 12 },
  { f: CUE('p', 0), x: 540, y: py(330), z: 1.24, d: 10 },
  { f: CUE('p', 1), x: 540, y: py(500), z: 1.26, d: 10 },
  { f: CUE('p', 2), x: 540, y: py(430), z: 1.18, d: 10 },
  { f: CUE('p', 5), x: 540, y: py(600), z: 1.24, d: 10 },
  { f: LT('r'), x: 540, y: 900, z: 1.1, d: 10 },
  { f: CUE('r', 1), x: 540, y: py(420), z: 1.26, d: 10 },
  { f: LT('n') - 2, x: 540, y: 960, z: 1.0, d: 10 },
  { f: LT('c') - 2, x: 540, y: 960, z: 1.0, d: 10 },
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
  const mv = lin(f, at - 12, at - 1);
  const e = Easing.out(Easing.cubic)(mv);
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

const Frame: React.FC<{ children: React.ReactNode; label?: string; tilt?: number }> = ({ children, label }) => (
  <div style={{ position: 'absolute', left: PX - 16, top: PY - 16, width: PW + 32, height: PH + 32, borderRadius: 78, background: '#0A0B0D', border: `4px solid ${LINE}`, boxShadow: '0 40px 100px rgba(0,0,0,.6)' }}>
    <div style={{ position: 'absolute', left: 16, top: 16, width: PW, height: PH, borderRadius: 62, overflow: 'hidden', background: '#fff' }}>{children}</div>
    {label && <div style={{ position: 'absolute', left: 0, right: 0, top: -64, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: LIGHT, opacity: 0.85 }}>{label}</div>}
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

const Counter: React.FC<{ f: number }> = ({ f }) => {
  const marks = [tService, tSlot, tSubmit];
  const n = marks.filter((m) => f >= m).length;
  const last = n ? marks[n - 1] : 0;
  const s = n ? 1 + 0.25 * Math.max(0, 1 - (f - last) / 10) : 1;
  const show = arrive(f, PHONE_IN, 10) * (1 - lin(f, LT('n') - 6, LT('n') - 2));
  if (show <= 0) return null;
  return (
    <Abs x={40} y={96} style={{ opacity: show, display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(18,20,23,.9)', border: `3px solid ${LINE}`, borderRadius: 30, padding: '10px 26px 10px 22px' }}>
      <span style={{ fontWeight: 900, fontSize: 92, color: YEL, transform: `scale(${s})`, minWidth: 60, textAlign: 'center' }}>{n}</span>
      <span style={{ fontWeight: 800, fontSize: 30, color: LIGHT, lineHeight: 1.1, whiteSpace: 'pre-line' }}>{'нажатий\nдо записи'}</span>
    </Abs>
  );
};

const DemoTag: React.FC<{ f: number }> = ({ f }) => (
  <Abs x={PX + PW - 120} y={PY - 74} style={{ opacity: arrive(f, PHONE_IN, 10) * (1 - lin(f, PHONE_OUT - 6, PHONE_OUT)), background: 'rgba(245,197,66,.15)', border: `2px solid ${YEL}`, color: YEL, borderRadius: 18, padding: '4px 16px', fontWeight: 800, fontSize: 26 }}>демо-данные</Abs>
);

// ---- hook: макет сообщений в директ ----
const MSGS = [
  { t: 'Сколько стоит?', at: -8, y: 470 },
  { t: 'Есть окна завтра?', at: 20, y: 690 },
  { t: 'Почём маникюр?', at: CUE('a', 0), y: 910 },
  { t: 'Сколько стоит?', at: CUE('a', 4), y: 1130 },
];
const Hook: React.FC<{ f: number }> = ({ f }) => {
  const end = LT('b') + 10;
  const out = 1 - lin(f, CUE('b', 3) - 2, CUE('b', 3) + 6);
  if (out <= 0) return null;
  const dim = 1 - 0.55 * lin(f, CUE('l', 5), CUE('l', 5) + 8);
  const red = pop(f, CUE('l', 5), 10);
  return (
    <Abs x={0} y={0} w={1080} h={1920} style={{ opacity: out }}>
      <div style={{ position: 'absolute', left: 90, top: 330, width: 900, textAlign: 'center', fontWeight: 800, fontSize: 40, color: '#9aa0a8' }}>макет · сообщения в директ</div>
      {MSGS.map((m, i) => {
        const a = pop(f, m.at, 10);
        if (a <= 0) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: 90, top: m.y, minWidth: 420, padding: '24px 40px', background: i === 0 ? LIGHT : '#2A2F37', color: i === 0 ? '#111' : LIGHT, borderRadius: 56, borderBottomLeftRadius: 14, fontWeight: 900, fontSize: 80, whiteSpace: 'nowrap', transform: `scale(${0.7 + 0.3 * a})`, transformOrigin: 'left center', opacity: a * dim, boxShadow: '0 20px 50px rgba(0,0,0,.5)' }}>{m.t}</div>
        );
      })}
      <div style={{ position: 'absolute', left: 90, top: 1340, transform: `scale(${red}) rotate(-4deg)`, background: RED, color: '#fff', fontWeight: 900, fontSize: 56, padding: '14px 36px', borderRadius: 30, whiteSpace: 'nowrap', boxShadow: '0 18px 40px rgba(0,0,0,.5)' }}>клиент ушёл к другому?</div>
    </Abs>
  );
};

const LinkChip: React.FC<{ f: number }> = ({ f }) => {
  const at = CUE('b', 3);
  const a = pop(f, at, 10) * (1 - lin(f, LT('p') - 9, LT('p') - 4));
  if (a <= 0) return null;
  return (
    <Abs x={90} y={620} w={900} style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${a}) rotate(-3deg)`, background: YEL, color: '#111', fontWeight: 900, fontSize: 72, padding: '22px 44px', borderRadius: 36, boxShadow: '0 24px 60px rgba(0,0,0,.55)', whiteSpace: 'pre-line', textAlign: 'center' }}>{'🔗 ссылка на запись\nв профиле'}</div>
    </Abs>
  );
};

const PriceRing: React.FC<{ f: number }> = ({ f }) => {
  const at = LT('p');
  const a = arrive(f, at, 8) * (1 - lin(f, tService + 6, tService + 12));
  if (a <= 0) return null;
  return <div style={{ position: 'absolute', left: px(30), top: py(236), width: 330 * K, height: 56 * K, borderRadius: 24, border: `6px solid ${YEL}`, opacity: a, boxShadow: `0 0 40px ${YEL}88` }} />;
};

const CostRing: React.FC<{ f: number }> = ({ f }) => {
  const at = CUE('r', 1);
  const a = arrive(f, at, 8) * (1 - lin(f, LT('n') - 8, LT('n') - 4));
  if (a <= 0) return null;
  return <div style={{ position: 'absolute', left: px(24), top: py(T.cost[1] - 15), width: 342 * K, height: 30 * K, borderRadius: 18, border: `6px solid ${YEL}`, opacity: a, boxShadow: `0 0 40px ${YEL}88` }} />;
};

const SelfChip: React.FC<{ f: number }> = ({ f }) => {
  const a = pop(f, CUE('r', 1), 10) * (1 - lin(f, LT('n') - 8, LT('n') - 4));
  if (a <= 0) return null;
  return <Abs x={PX + 50} y={PY + 120} style={{ transform: `scale(${a}) rotate(-5deg)`, background: TEAL, color: '#fff', fontWeight: 900, fontSize: 60, padding: '10px 34px', borderRadius: 28, boxShadow: '0 18px 40px rgba(0,0,0,.5)' }}>цену увидел сам</Abs>;
};

const Result: React.FC<{ f: number }> = ({ f }) => {
  const a = arrive(f, LT('n') - 2, 10) * (1 - lin(f, LT('c') - 10, LT('c') - 3));
  if (a <= 0) return null;
  const n = Math.round(3 * Easing.out(Easing.cubic)(lin(f, CUE('n', 0), CUE('n', 0) + 18)));
  const mark = lin(f, CUE('n', 0) + 18, CUE('n', 0) + 30);
  const chip = pop(f, CUE('n', 2), 12);
  return (
    <Abs x={0} y={0} w={1080} h={1920} style={{ opacity: a }}>
      <div style={{ position: 'absolute', left: 90, top: 470, width: 900, padding: '40px 30px 50px', background: PANEL, border: `3px solid ${LINE}`, borderRadius: 56, boxShadow: '0 30px 80px rgba(0,0,0,.55)', textAlign: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: 340, color: LIGHT, lineHeight: 1.05 }}>{n}</div>
        <div style={{ height: 14, width: 300 * mark, background: YEL, margin: '-6px auto 18px', borderRadius: 7 }} />
        <div style={{ fontWeight: 900, fontSize: 64, color: LIGHT }}>нажатия на запись</div>
        <div style={{ marginTop: 36, transform: `scale(${chip})`, display: 'inline-block', background: TEAL, color: '#fff', fontWeight: 900, fontSize: 52, whiteSpace: 'nowrap', padding: '14px 36px', borderRadius: 30 }}>0 вопросов в директ</div>
        <div style={{ marginTop: 30, fontWeight: 600, fontSize: 30, color: '#9aa0a8', opacity: chip }}>демо: один мастер, одна услуга</div>
      </div>
    </Abs>
  );
};

const Cta: React.FC<{ f: number }> = ({ f }) => {
  const a = arrive(f, LT('c') - 2, 8);
  if (a <= 0) return null;
  const s = pop(f, LT('c'), 10), b = pop(f, CUE('c', 3), 10);
  const pulse = 1 + 0.04 * Math.sin((f - LT('c')) / 4);
  return (
    <Abs x={0} y={0} w={1080} h={1920} style={{ opacity: a }}>
      <div style={{ position: 'absolute', left: 90, top: 520, width: 900, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', transform: `scale(${s * pulse})`, background: '#FF2D3D', color: '#fff', fontWeight: 900, fontSize: 100, padding: '24px 60px', borderRadius: 60, boxShadow: '0 24px 60px rgba(229,72,77,.5)', whiteSpace: 'nowrap' }}>＋ Подпишись</div>
        <div style={{ marginTop: 70 }}>
          <div style={{ display: 'inline-block', background: YEL, color: '#111', fontWeight: 900, fontSize: 120, padding: '22px 56px', borderRadius: 44, boxShadow: '0 24px 60px rgba(0,0,0,.5)', opacity: pop(f, CUE('c', 2), 10) }}>jazylam.kz</div>
        </div>
        <div style={{ marginTop: 36, fontWeight: 900, fontSize: 60, color: LIGHT }}>ссылка в профиле</div>
        <div style={{ marginTop: 30, transform: `scale(${b})`, display: 'inline-block', border: `4px solid ${YEL}`, color: YEL, fontWeight: 900, fontSize: 46, whiteSpace: 'nowrap', padding: '12px 36px', borderRadius: 30 }}>14 дней бесплатно · без карты</div>
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
    if (cur.length && cur.map((x) => x.w).concat(w.w).join(' ').length > 17) { out.push({ a: cur[0].s, b: 0, ws: cur }); cur = []; }
    cur.push(w);
    const brk = /[.,:!?»]$/.test(w.w) || cur.length >= 3 || cur.map((x) => x.w).join(' ').length > 17 || i === l.words.length - 1;
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
      <div style={{ background: 'rgba(18,20,23,.88)', borderRadius: 30, padding: '14px 30px', display: 'flex', gap: 18, fontWeight: 900, fontSize: 80, color: LIGHT, maxWidth: 1000 }}>
        {c.ws.map((w, i) => {
          const h = hl.includes(norm(w.w));
          return <span key={i} style={h ? { background: YEL, color: '#111', borderRadius: 14, padding: '0 14px' } : undefined}>{w.w.replace(/[«»]/g, '').replace(/[.,:!?]$/, '')}</span>;
        })}
      </div>
    </Abs>
  );
};


export const Demo9: React.FC = () => {
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
        <LinkChip f={f} />
        {phoneA > 0 && (
          <div style={{ opacity: phoneA, transform: `translateY(${(1 - arrive(f, PHONE_IN, 10)) * 160}px)` }}>
            <Frame label="клиент"><Screens f={f} /></Frame>
            <DemoTag f={f} />
            <PriceRing f={f} />
            <CostRing f={f} />
            <Tap f={f} at={tService} from={[300, 120]} to={T.service} />
            <Tap f={f} at={tSlot} from={[300, 400]} to={T.slot} />
            <Tap f={f} at={tSubmit} from={[300, 600]} to={T.submit} />
            <SelfChip f={f} />
          </div>
        )}
        <Result f={f} />
        <Cta f={f} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.6) 100%)', pointerEvents: 'none' }} />
      <Counter f={f} />
      <Subs f={f} />
      <Audio src={staticFile('mix9.wav')} />
    </AbsoluteFill>
  );
};
