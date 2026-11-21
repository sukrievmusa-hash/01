# Генерирует video/src/DemoEnt2.tsx из DemoEnt1.tsx (шаблон v6) под тему «Ошибся — но почему?»
s = open('/home/claude/01/video/src/DemoEnt1.tsx').read()
def rep(a, b):
    global s
    assert a in s, a[:60]
    s = s.replace(a, b)
rep("tlent1", "tlent2"); rep("DemoEnt1", "DemoEnt2"); rep("mix_ent1.wav", "mix_ent2.wav")
rep("const T = { tab: [282, 224], v1: [104, 515] };\nconst tTab = CUE('p', 0), tV = CUE('p', 1), tTimer = CUE('p', 2);",
    "const T = { tab: [282, 224], v1: [104, 515], opt: [195, 423], fin: [320, 88], yes: [195, 436] };\nconst tTab = CUE('p', 0), tV = CUE('p', 1), tOpt = CUE('p', 2), tFin = CUE('p', 3), tYes = CUE('p', 3) + 15;")
rep("""  { at: tV + 7, img: 'e3_task' },
  { at: LT('r'), img: 'e5_result' },
  { at: CUE('r', 4), img: 'e6_review' },""", """  { at: tV + 7, img: 'e3_task' },
  { at: tOpt + 7, img: 'e4_task_ans' },
  { at: tFin + 7, img: 'e4b_confirm' },
  { at: tYes + 7, img: 'e5_result' },
  { at: CUE('r', 2) - 4, img: 'e6_review' },""")
a = s.index("  { f: LT('p') - 4"); b = s.index("  { f: LT('n') - 2")
s = s[:a] + """  { f: LT('p') - 4, x: 540, y: 900, z: 1.0, d: 12 },
  { f: CUE('p', 0), x: 540, y: py(260), z: 1.2, d: 10 },
  { f: CUE('p', 1), x: 540, y: py(470), z: 1.22, d: 10 },
  { f: CUE('p', 2), x: 540, y: py(430), z: 1.24, d: 10 },
  { f: CUE('p', 3), x: 540, y: py(190), z: 1.26, d: 10 },
  { f: tYes + 2, x: 540, y: py(380), z: 1.2, d: 10 },
  { f: LT('r'), x: 540, y: 900, z: 1.1, d: 10 },
  { f: CUE('r', 2), x: 540, y: py(330), z: 1.22, d: 10 },
  { f: CUE('r', 4), x: 540, y: py(380), z: 1.2, d: 10 },
""" + s[b:]
rep("const marks = [tTab, tV];", "const marks = [tTab, tV, tOpt, tFin, tYes];")
rep("'нажатия\\nдо старта'", "'нажатий\\nдо разбора'")
a = s.index("// ---- hook"); b = s.index("const LinkChip")
hook = """// ---- hook: ✗ Неверно / почему? (макет) ----
const Hook: React.FC<{ f: number }> = ({ f }) => {
  const out = 1 - lin(f, LT('b') + 3, LT('b') + 10);
  if (out <= 0) return null;
  const chipQ = pop(f, CUE('h', 2), 10);
  const chipA = pop(f, CUE('a', 3), 10) * (1 - 0.5 * lin(f, LT('l'), LT('l') + 8));
  const chipR = pop(f, CUE('l', 4), 10);
  const bump = 1 + 0.1 * Math.max(0, 1 - f / 8);
  return (
    <Abs x={0} y={0} w={1080} h={1920} style={{ opacity: out }}>
      <div style={{ position: 'absolute', left: 0, top: 110, width: 1080, textAlign: 'center', fontWeight: 900, fontSize: 420, color: RED, lineHeight: 1, transform: `scale(${bump})` }}>✗</div>
      <div style={{ position: 'absolute', left: 0, top: 560, width: 1080, textAlign: 'center', fontWeight: 900, fontSize: 120, color: LIGHT }}>Неверно</div>
      <div style={{ position: 'absolute', left: 120, top: 760, width: 840, padding: '26px 0 34px', background: PANEL, border: `3px solid ${LINE}`, borderLeft: `18px solid ${RED}`, borderRadius: 48, textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,.55)' }}>
        <div style={{ fontWeight: 900, fontSize: 60, color: '#9aa0a8' }}>задание №3 · 0 из 1</div>
        <div style={{ fontWeight: 900, fontSize: 80, color: LIGHT, marginTop: 10 }}>твой ответ: <span style={{ textDecoration: 'line-through', color: RED }}>D</span></div>
        <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 1.2, color: YEL, transform: `scale(${0.6 + 0.4 * chipQ})`, opacity: chipQ }}>почему?</div>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 1180, width: 1080, textAlign: 'center', fontWeight: 800, fontSize: 34, color: '#9aa0a8' }}>макет · задание с ошибкой</div>
      <div style={{ position: 'absolute', left: 0, top: 1250, width: 1080, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${chipA}) rotate(-3deg)`, background: '#2A2F37', border: `4px solid ${YEL}`, color: YEL, fontWeight: 900, fontSize: 60, padding: '14px 36px', borderRadius: 30, whiteSpace: 'nowrap', opacity: chipA > 0 ? 1 : 0 }}>смотришь только балл</div>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 1380, width: 1080, display: 'flex', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${chipR}) rotate(3deg)`, background: RED, color: '#fff', fontWeight: 900, fontSize: 64, padding: '14px 40px', borderRadius: 30, whiteSpace: 'nowrap', boxShadow: '0 18px 40px rgba(0,0,0,.5)', opacity: chipR > 0 ? 1 : 0 }}>🔁 та же ошибка</div>
      </div>
    </Abs>
  );
};

"""
s = s[:a] + hook + s[b:]
rep("'⏱ пробный ЕНТ\\nна время'", "'🧠 разбор\\nсразу'")
a = s.index("            <Ring f={f} at={tTimer}"); b = s.index("          </div>\n        )}\n        <Result")
s = s[:a] + """            <Ring f={f} at={CUE('r', 2)} end={CUE('r', 4)} x={34} y={293} w={326} h={52} r={20} />
            <Ring f={f} at={CUE('r', 4)} end={LT('n') - 6} x={34} y={348} w={326} h={66} r={20} />
            <Tap f={f} at={tTab} from={[330, 120]} to={T.tab} />
            <Tap f={f} at={tV} from={[300, 400]} to={T.v1} />
            <Tap f={f} at={tOpt} from={[300, 300]} to={T.opt} />
            <Tap f={f} at={tFin} from={[250, 300]} to={T.fin} />
            <Tap f={f} at={tYes} from={[320, 150]} to={T.yes} />
""" + s[b:]
rep("Math.round(50 *", "Math.round(40 *")
rep("один вариант: 40 заданий, максимум 50 баллов", "разбор открывается после теста")
rep(">баллов</div>", ">заданий</div>")
rep("⏱ 70 минут на таймере", "💡 у каждого — решение")
open('/home/claude/01/video/src/DemoEnt2.tsx', 'w').write(s)
r = open('/home/claude/01/video/src/Root.tsx').read()
if 'DemoEnt2' not in r:
    r = r.replace("import { DemoEnt1 }", "import { DemoEnt2 } from './DemoEnt2';\nimport tlent2 from './tlent2.json';\nimport { DemoEnt1 }")
    r = r.replace('  <Composition id="DemoEnt1"', '  <Composition id="DemoEnt2" component={DemoEnt2} durationInFrames={Math.ceil(tlent2.total * 30)} fps={30} width={1080} height={1920} />\n  <Composition id="DemoEnt1"')
    open('/home/claude/01/video/src/Root.tsx', 'w').write(r)
