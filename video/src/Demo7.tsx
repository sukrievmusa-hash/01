import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import tl from './tl7.json';

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


// ---- phone: recreated Telegram chat (texts verbatim from Musa's screenshots) ----
const PW = 600, PH = 1240, PX = 240, PY = 290;
const TG = { bg: '#0E1621', head: '#17212B', bot: '#182533', me: '#2B5278', time: '#7D8E9E', link: '#6AB3F3', kb: '#1C2733', key: '#2E3B49' };
const FS = 26, LH = 35, BW = 480, CPL = 30;
const INPUT_H = 84, KB_H = 400;
type Msg = { who: 'me' | 'bot'; text: string; at: number; time?: string; tFrom?: number; tTo?: number; owner?: boolean };
const sendAfter = (t: number) => t + 3;
const M: Msg[] = [];
const tLaunch = CUE('start', 2);
M.push({ who: 'me', text: '/start', at: tLaunch + 4, time: '07:53' });
M.push({ who: 'bot', text: 'Здравствуйте! Я ИИ-ассистент Мусы (MUSA). Расскажу, чем он занимается, и передам ему ваш вопрос. Что вас интересует?', at: CUE('start', 4), time: '07:53' });
const p1a = LT('pizza') - 4, p1b = CUE('pizza', 4) + 4;
M.push({ who: 'me', text: 'У меня есть своя пиццерия, что вы можете предложить?', at: sendAfter(p1b), tFrom: p1a, tTo: p1b });
const p2a = CUE('pizza', 6), p2b = CUE('pizza', 9) + 2;
M.push({ who: 'me', text: 'Есть примеры?', at: sendAfter(p2b), tFrom: p2a, tTo: p2b, time: '07:56' });
M.push({ who: 'bot', text: '…Jazylam (jazylam.kz) и тренажер ЕНТ Talap (sukrievmusa-hash.github.io/raff). Ещё есть демо сайта (sukrievmusa-hash.github.io/vizedka). Примера именно для пиццерии у меня нет, но бот с меню и заявками для пиццерии делается по той же схеме. Хотите, Муса покажет, как это будет выглядеть для вашей пиццерии?', at: CUE('ex', 0), time: '07:56' });
const q1a = LT('priceq') - 6, q1b = CUE('priceq', 4) + 2;
M.push({ who: 'me', text: 'Во сколько обойдётся?', at: sendAfter(q1b), tFrom: q1a, tTo: q1b, time: '07:57' });
M.push({ who: 'bot', text: 'Бот с меню и приёмом заказов стоит от 50 000 ₸, срок 4–7 дней. Если нужен и сайт с меню, то это уже пакет «Старт» от 89 000 ₸ (лендинг, WhatsApp, домен и хостинг). Точную сумму Муса назовёт после короткого обсуждения и зафиксирует письменно до старта. Сколько заказов в день у вас сейчас примерно?', at: LT('pricea'), time: '07:57' });
const c1a = LT('contact') - 14, c1b = CUE('contact', 1);
M.push({ who: 'me', text: 'Как связаться?', at: sendAfter(c1b), tFrom: c1a, tTo: c1b, time: '07:57' });
M.push({ who: 'bot', text: 'Связаться с Мусой можно по телефону или в WhatsApp: 8 707 526 94 42, wa.me/77075269442. Я передам ему ваш вопрос, и он свяжется с вами лично. Как вас зовут и в какое время удобно созвониться?', at: CUE('contact', 3), time: '07:57' });
const n1a = LT('name') - 6, n1b = CUE('name', 4) + 4;
M.push({ who: 'me', text: 'Артём номер •••••••••', at: sendAfter(n1b), tFrom: n1a, tTo: n1b, time: '07:57' });
M.push({ who: 'bot', text: 'Спасибо, Артём! Я передал ваш номер ••••••••• Мусе, он свяжется с вами для обсуждения и договора.', at: CUE('name', 6), time: '07:58' });
M.push({ who: 'bot', owner: true, text: '✅ Готовый клиент!\nКлиент: ••••••••\nЗаказ: Заявка на бот/сайт, цена не согласована (от 50 000 ₸); бизнес клиента уточнить; контакт: Артём, •••••••••\n\nПереписка:\n👤 Во сколько обойдётся?\n🤖 Бот с меню и приёмом заказов стоит от 50 000 ₸…', at: CUE('owner', 5), time: '07:58' });
const KB_IN = p1a - 10;
const PHONE_IN = LT('start') - 8, PHONE_OUT = LT('res') - 2;

// size estimates (camera only; layout is real flow)
const lines = (t: string) => t.split('\n').reduce((a, p) => a + Math.max(1, Math.ceil(p.length / CPL)), 0);
const bw = (m: Msg) => Math.min(BW, Math.max(...m.text.split('\n').map((p) => p.length)) * 14.2 + 36 + 70);
const bh = (m: Msg) => lines(m.text + '        ') * LH + 26;
const chatBottom = (f: number) => (f >= KB_IN ? PH - KB_H - INPUT_H : PH - INPUT_H);
const sx = (x: number) => PX + x, sy = (y: number) => PY + y;

type Key = { f: number; x: number; y: number; z: number; d?: number };
const KEYS: Key[] = (() => {
  const k: Key[] = [{ f: 0, x: 540, y: 900, z: 1.0 }, { f: PHONE_IN + 2, x: 540, y: sy(PH / 2), z: 0.98, d: 14 }];
  k.push({ f: tLaunch - 10, x: sx(PW / 2), y: sy(PH - 60), z: 1.6 });
  for (const m of M) {
    if (m.tFrom != null) k.push({ f: m.tFrom, x: sx(PW / 2), y: sy(PH - KB_H - 10), z: 1.5 });
    if (m.who === 'bot') k.push({ f: m.at - 16, x: sx(16 + 60), y: sy(chatBottom(m.at) - 40), z: 1.9 });
    const w = bw(m), h = bh(m), bot = chatBottom(m.at) - 10;
    const z = Math.min(2.1, 960 / w, 1200 / h);
    const cx = m.who === 'me' ? PW - 16 - w / 2 : 16 + w / 2;
    k.push({ f: m.at, x: sx(cx), y: sy(bot - h / 2), z, d: 10 });
  }
  k.push({ f: LT('res'), x: 540, y: 960, z: 1.0, d: 12 });
  k.push({ f: LT('cta'), x: 540, y: 960, z: 1.0, d: 12 });
  k.sort((a, b) => a.f - b.f);
  return k.filter((x, i) => i === 0 || x.f > k[i - 1].f + 3);
})();
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


const Abs: React.FC<{ x: number; y: number; w?: number | string; h?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, fontFamily: FONT, ...style }}>{children}</div>
);
const LINK = /(jazylam\.kz|sukrievmusa-hash\.github\.io\/\w+|wa\.me\/\d+)/;
const Rich: React.FC<{ t: string }> = ({ t }) => (
  <>{t.split(LINK).map((p, i) => (LINK.test(p) ? <span key={i} style={{ color: TG.link, textDecoration: 'underline' }}>{p}</span> : <span key={i}>{p}</span>))}</>
);
const Bubble: React.FC<{ m: Msg; f: number }> = ({ m, f }) => {
  const s = pop(f, m.at, 9);
  const me = m.who === 'me';
  return (
    <div style={{ alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: BW, transform: `scale(${0.85 + 0.15 * s}) translateY(${(1 - s) * 30}px)`, opacity: Math.min(1, s * 1.5), transformOrigin: me ? 'right bottom' : 'left bottom',
      background: me ? TG.me : TG.bot, color: '#fff', borderRadius: me ? '22px 22px 6px 22px' : '22px 22px 22px 6px', padding: '12px 18px', fontSize: FS, lineHeight: `${LH}px`, whiteSpace: 'pre-wrap', border: m.owner ? `3px solid ${YEL}` : undefined }}>
      <Rich t={m.text} />
      <span style={{ float: 'right', marginLeft: 14, marginTop: 8, fontSize: 18, lineHeight: '20px', color: me ? '#A8C5E6' : TG.time }}>{m.time ?? ''}{me ? ' ✓✓' : ''}</span>
    </div>
  );
};
const Dots: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ alignSelf: 'flex-start', background: TG.bot, borderRadius: '22px 22px 22px 6px', padding: '18px 22px', display: 'flex', gap: 8 }}>
    {[0, 1, 2].map((i) => <i key={i} style={{ width: 12, height: 12, borderRadius: 6, background: '#9fb3c8', opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f / 4 - i) * 1.2)) }} />)}
  </div>
);
const botTyping = (f: number) => M.some((m) => m.who === 'bot' && f >= m.at - 16 && f < m.at);
const typing = (f: number) => M.find((m) => m.tFrom != null && f >= m.tFrom && f < m.at);
const ROWS = ['йцукенгшщзхъ', 'фывапролджэ', 'ячсмитьбю'];
const Keyboard: React.FC<{ f: number }> = ({ f }) => {
  const m = typing(f);
  let ch = '';
  if (m && f <= m.tTo!) { const n = Math.ceil(m.text.length * lin(f, m.tFrom!, m.tTo!)); ch = (m.text[n - 1] || '').toLowerCase(); }
  const sendHit = m && f > m.tTo! && f < m.at + 2;
  const kw = (PW - 16) / 12;
  const Key: React.FC<{ c: string; w?: number; label?: string }> = ({ c, w = kw, label }) => {
    const on = c === ch || (c === ' ' && ch === ' ');
    return <div style={{ width: w - 6, height: 74, margin: 3, borderRadius: 10, background: on ? '#5E7A95' : TG.key, color: '#fff', fontSize: 30, fontWeight: 500, display: 'grid', placeItems: 'center', transform: on ? 'translateY(-6px)' : undefined, boxShadow: on ? '0 6px 0 #0006' : undefined }}>{label ?? c}</div>;
  };
  return (
    <div style={{ position: 'absolute', left: 0, bottom: 0, width: PW, height: KB_H, background: TG.kb, padding: '20px 8px', boxSizing: 'border-box' }}>
      {ROWS.map((r, i) => <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>{r.split('').map((c) => <Key key={c} c={c} />)}</div>)}
      <div style={{ display: 'flex', justifyContent: 'center' }}><Key c="?" label="?123" w={kw * 2} /><Key c=" " label="Русский" w={kw * 7} /><Key c="." w={kw} /><Key c="\n" label="⏎" w={kw * 2} /></div>
      {sendHit && <div />}
    </div>
  );
};
const Phone: React.FC<{ f: number }> = ({ f }) => {
  const kb = arrive(f, KB_IN, 8);
  const cb = chatBottom(f);
  const shown = M.filter((m) => f >= m.at);
  const m = typing(f);
  const draft = m ? m.text.slice(0, Math.ceil(m.text.length * lin(f, m.tFrom!, m.tTo!))) : '';
  const sendPress = m && f > m.tTo!;
  const started = f >= tLaunch;
  const cursor = Math.floor(f / 8) % 2 === 0;
  return (
    <div style={{ position: 'absolute', left: PX - 14, top: PY - 14, width: PW + 28, height: PH + 28, borderRadius: 60, background: '#05070A', border: `4px solid ${LINE}`, boxShadow: '0 40px 100px rgba(0,0,0,.6)' }}>
      <div style={{ position: 'absolute', left: 14, top: 14, width: PW, height: PH, borderRadius: 46, overflow: 'hidden', background: TG.bg, fontFamily: FONT }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.04) 2px, transparent 2.5px)', backgroundSize: '34px 34px' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 140, background: TG.head, display: 'flex', alignItems: 'flex-end', padding: '0 24px 20px', gap: 18, boxSizing: 'border-box', zIndex: 2 }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, background: 'linear-gradient(135deg,#F3D9B1,#C9A27A)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 30, color: '#5a3d1c' }}>M</div>
          <div><div style={{ color: '#fff', fontWeight: 700, fontSize: 32 }}>MUSA Ассистент</div><div style={{ color: botTyping(f) ? TG.link : TG.time, fontSize: 24 }}>{botTyping(f) ? 'печатает…' : 'бот'}</div></div>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 150, width: PW, height: cb - 150 - 10 + (1 - kb) * 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12, padding: '0 16px', boxSizing: 'border-box', overflow: 'hidden' }}>
          {shown.map((mm, i) => <Bubble key={i} m={mm} f={f} />)}
          {botTyping(f) && <Dots f={f} />}
        </div>
        <div style={{ position: 'absolute', left: 0, top: cb, width: PW, height: INPUT_H, background: TG.head, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14, boxSizing: 'border-box' }}>
          {!started || f < tLaunch + 2 ? (
            <div style={{ flex: 1, height: 60, borderRadius: 30, background: '#5B8DEF', color: '#fff', fontWeight: 700, fontSize: 28, display: 'grid', placeItems: 'center', transform: `scale(${interpolate(f, [tLaunch - 2, tLaunch + 1, tLaunch + 4], [1, 0.92, 1], cl)})` }}>Запустить бота</div>
          ) : (
            <>
              <div style={{ flex: 1, fontSize: 28, color: draft ? '#fff' : TG.time, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip', direction: 'rtl', textAlign: 'left' }}><span style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}>{draft || 'Сообщение'}{m && cursor ? '|' : ''}</span></div>
              <div style={{ width: 58, height: 58, borderRadius: 29, background: draft ? '#5B8DEF' : '#2E3B49', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 28, transform: sendPress ? 'scale(0.85)' : undefined }}>➤</div>
            </>
          )}
        </div>
        <div style={{ position: 'absolute', left: 0, top: PH - KB_H * kb, width: PW, height: KB_H }}>{kb > 0 && <div style={{ position: 'relative', width: PW, height: KB_H }}><Keyboard f={f} /></div>}</div>
      </div>
    </div>
  );
};
const Tap: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  const e = Easing.out(Easing.cubic)(lin(f, at - 12, at - 1));
  const X = x + (1 - e) * 120, Y = y + (1 - e) * 160;
  const vis = interpolate(f, [at - 14, at - 10, at + 8, at + 14], [0, 1, 1, 0], cl);
  const ring = lin(f, at, at + 14);
  if (vis <= 0) return null;
  return (<>
    <div style={{ position: 'absolute', left: x - 50 * ring - 6, top: y - 50 * ring - 6, width: (50 * ring + 6) * 2, height: (50 * ring + 6) * 2, borderRadius: '50%', border: `5px solid ${YEL}`, opacity: ring > 0 ? 1 - ring : 0 }} />
    <svg width={64} height={64} viewBox="0 0 24 24" style={{ position: 'absolute', left: X - 6, top: Y - 4, opacity: vis, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.5))' }}><path d="M5 3l14 8-6 1.8L10.5 19z" fill={LIGHT} stroke="#111" strokeWidth={1.2} strokeLinejoin="round" /></svg>
  </>);
};
const Clock: React.FC<{ f: number }> = ({ f }) => {
  const last = [...M].reverse().find((m) => f >= m.at && m.time);
  const t = last ? last.time! : '07:53';
  const a = arrive(f, PHONE_IN, 10) * (1 - lin(f, LT('res') - 6, LT('res')));
  return (
    <Abs x={36} y={90} style={{ opacity: a, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(18,20,23,.9)', border: `3px solid ${LINE}`, borderRadius: 28, padding: '8px 22px' }}>
      <span style={{ fontWeight: 900, fontSize: 58, color: YEL }}>{t}</span>
      <span style={{ fontWeight: 800, fontSize: 24, color: LIGHT, lineHeight: 1.1, whiteSpace: 'pre-line' }}>{'время\nв чате'}</span>
    </Abs>
  );
};
const Label: React.FC<{ f: number }> = ({ f }) => {
  const own = f >= CUE('owner', 5) - 4;
  const a = arrive(f, PHONE_IN, 10) * (1 - lin(f, PHONE_OUT - 6, PHONE_OUT));
  return (
    <Abs x={520} y={90} w={524} style={{ opacity: a, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      <span style={{ background: 'rgba(18,20,23,.92)', borderRadius: 16, padding: '4px 14px', fontWeight: 800, fontSize: 28, color: own ? YEL : LIGHT, whiteSpace: 'nowrap' }}>{own ? 'это видит только владелец' : 'тестовая переписка'}</span>
      <span style={{ background: 'rgba(18,20,23,.92)', borderRadius: 14, padding: '3px 12px', fontWeight: 700, fontSize: 20, color: '#aab', whiteSpace: 'nowrap' }}>воссоздано по скриншотам · номера скрыты</span>
    </Abs>
  );
};
const Hook: React.FC<{ f: number }> = ({ f }) => {
  const a = arrive(f, 0, 8) * (1 - lin(f, PHONE_IN - 4, PHONE_IN + 4));
  if (a <= 0) return null;
  const q = pop(f, 4, 10);
  return (
    <Abs x={0} y={0} w={1080} h={1920} style={{ opacity: a }}>
      <div style={{ position: 'absolute', left: 110, top: 640, width: 860, padding: '44px 40px', background: PANEL, border: `3px solid ${LINE}`, borderRadius: 50, boxShadow: '0 30px 80px rgba(0,0,0,.55)' }}>
        <div style={{ fontWeight: 800, fontSize: 34, color: '#9aa0a8', marginBottom: 24 }}>иллюстрация</div>
        <div style={{ display: 'inline-block', background: TG.me, color: '#fff', fontWeight: 700, fontSize: 56, padding: '18px 34px', borderRadius: '34px 34px 8px 34px' }}>Во сколько обойдётся?</div>
        <div style={{ marginTop: 28, display: 'inline-block', background: RED, color: '#fff', fontWeight: 900, fontSize: 46, padding: '8px 28px', borderRadius: 22, opacity: lin(f, 16, 26) }}>без ответа · ты занят</div>
      </div>
      <div style={{ position: 'absolute', right: 70, top: 460, fontWeight: 900, fontSize: 280, color: YEL, transform: `scale(${q}) rotate(10deg)`, lineHeight: 1 }}>?</div>
    </Abs>
  );
};
const Result: React.FC<{ f: number }> = ({ f }) => {
  const a = arrive(f, LT('res') - 2, 12) * (1 - lin(f, LT('cta') - 12, LT('cta') - 3));
  if (a <= 0) return null;
  const n = Math.round(5 * Easing.out(Easing.cubic)(lin(f, CUE('res', 0), CUE('res', 0) + 24)));
  const mark = lin(f, CUE('res', 0) + 24, CUE('res', 0) + 38);
  return (
    <Abs x={0} y={0} w={1080} h={1920} style={{ opacity: a }}>
      <div style={{ position: 'absolute', left: 90, top: 500, width: 900, padding: '40px 30px 50px', background: PANEL, border: `3px solid ${LINE}`, borderRadius: 56, textAlign: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: 340, color: LIGHT, lineHeight: 1.05 }}>{n}</div>
        <div style={{ height: 14, width: 300 * mark, background: YEL, margin: '-6px auto 18px', borderRadius: 7 }} />
        <div style={{ fontWeight: 900, fontSize: 64, color: LIGHT }}>минут до заявки</div>
        <div style={{ marginTop: 26, fontWeight: 800, fontSize: 40, color: YEL }}>07:53 → 07:58 по времени в чате</div>
      </div>
    </Abs>
  );
};
const Cta: React.FC<{ f: number }> = ({ f }) => {
  const a = arrive(f, LT('cta') - 2, 10);
  if (a <= 0) return null;
  const s = pop(f, LT('cta') + 4, 14), b = pop(f, CUE('cta', 4), 12);
  return (
    <Abs x={0} y={0} w={1080} h={1920} style={{ opacity: a }}>
      <div style={{ position: 'absolute', left: 60, top: 600, width: 960, textAlign: 'center', transform: `scale(${0.9 + 0.1 * s})` }}>
        <div style={{ fontWeight: 900, fontSize: 60, color: LIGHT, marginBottom: 34 }}>проверь сам — напиши боту</div>
        <div style={{ display: 'inline-block', background: YEL, color: '#111', fontWeight: 900, fontSize: 88, whiteSpace: 'nowrap', padding: '24px 50px', borderRadius: 44 }}>MUSA Ассистент</div>
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


export const Demo7: React.FC = () => {
  const f = useCurrentFrame();
  const c = cam0(f), p = cam0(f - 1);
  const vx = Math.abs(c.x - p.x) * c.z, vy = Math.abs(c.y - p.y) * c.z, vz = Math.abs(Math.log(c.z / p.z)) * 900;
  const bl = Math.min(10, (vx + vy) * 0.15 + vz * 0.08);
  const phoneA = arrive(f, PHONE_IN, 12) * (1 - lin(f, PHONE_OUT - 4, PHONE_OUT + 6));
  const dots = 'radial-gradient(rgba(243,239,230,.09) 2px, transparent 2.5px)';
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${540 - c.x * c.z}px, ${960 - c.y * c.z}px) scale(${c.z})`, filter: bl > 0.6 ? `blur(${bl}px)` : undefined }}>
        <div style={{ position: 'absolute', left: -800, top: -800, width: 2700, height: 3500, backgroundImage: dots, backgroundSize: '56px 56px' }} />
        <Hook f={f} />
        {phoneA > 0 && (
          <div style={{ opacity: phoneA }}>
            <Phone f={f} />
            <Tap f={f} at={tLaunch} x={sx(PW / 2)} y={sy(PH - INPUT_H / 2)} />
          </div>
        )}
        <Result f={f} />
        <Cta f={f} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,.55) 100%)', pointerEvents: 'none' }} />
      <Clock f={f} />
      <Label f={f} />
      <Subs f={f} />
      <Audio src={staticFile('mix7.wav')} />
    </AbsoluteFill>
  );
};
