# Съёмка реальных экранов https://sukrievmusa-hash.github.io/12/ (390x844, dpr 3).
# Все запросы к supabase.co перехватываются заглушкой: заявок и статистики Мусы не создаём.
import os, json
from playwright.sync_api import sync_playwright
BASE = 'https://sukrievmusa-hash.github.io/12/'
OUT = '/home/claude/01/video/public/shots'; os.makedirs(OUT, exist_ok=True)
blocked = []
def stub(route):
    blocked.append(route.request.url[:80]); route.fulfill(status=200, content_type='application/json', body='{"ok":true,"status":"unknown"}')
boxes = {}
def box(pg, sel, name):
    b = pg.locator(sel).first.bounding_box(); boxes[name] = [round(b['x']+b['width']/2), round(b['y']+b['height']/2), round(b['width']), round(b['height'])]
def shot(pg, name):
    pg.wait_for_timeout(350); pg.screenshot(path=f'{OUT}/{name}.png'); print('shot', name)
with sync_playwright() as p:
    br = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'], proxy={'server': os.environ['HTTPS_PROXY']})
    ctx = br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True, locale='ru-RU', timezone_id='Asia/Almaty')
    ctx.route('**://*.supabase.co/**', stub)
    pg = ctx.new_page()
    pg.goto(BASE + '#/tests/math'); pg.wait_for_selector('.vcard'); pg.evaluate("localStorage.clear()"); pg.goto(BASE + '#/tests/math'); pg.reload(); pg.wait_for_selector('.vcard')
    shot(pg, 'e1_tests_math')
    box(pg, '[data-s="physics"]', 'tab_physics')
    pg.click('[data-s="physics"]'); pg.wait_for_selector('.tabs .on[data-s="physics"]')
    shot(pg, 'e2_tests_phys')
    box(pg, '[data-v="1"]', 'v1')
    pg.click('[data-v="1"]'); pg.wait_for_selector('#timer'); pg.wait_for_timeout(100)
    shot(pg, 'e3_task')
    print('timer', pg.inner_text('#timer'))
    box(pg, '[data-o="1"]', 'opt1')
    pg.click('[data-o="1"]'); pg.wait_for_timeout(200)
    shot(pg, 'e4_task_ans')
    # демо-прохождение: подставляем ответы (часть верных) и завершаем, чтобы снять реальный экран результата и разбора
    pg.evaluate("""() => {
      const run = JSON.parse(localStorage.getItem('synaq_run'));
      const qs = window.SynaqGen.buildVariant(run.subject, run.variant).questions; const a = {};
      qs.forEach((q,i)=>{ const bad = i%3===2;
        if(q.type==='single'||q.type==='context') a[i] = bad ? (q.answer+1)%q.options.length : q.answer;
        else if(q.type==='match') a[i] = q.answer.map((v,k)=> bad&&k===0 ? (v+1)%q.right.length : v);
        else a[i] = bad ? [q.answer[0]] : q.answer; });
      run.answers = a; run.startedAt = Date.now() - 52*60000; localStorage.setItem('synaq_run', JSON.stringify(run));
    }""")
    pg.reload(); pg.wait_for_selector('#finish'); pg.click('#finish'); pg.click('#yes'); pg.wait_for_selector('.score-hero')
    pg.evaluate("window.scrollTo(0,0)")
    shot(pg, 'e5_result')
    print('score', pg.inner_text('.ring'), '|', pg.inner_text('.muted'))
    pg.click('[data-f="err"]'); pg.wait_for_timeout(200)
    y = pg.evaluate("document.querySelector('.rv:not([hidden])').getBoundingClientRect().top + window.scrollY - 70")
    pg.evaluate(f"window.scrollTo(0,{y})")
    shot(pg, 'e6_review')
    json.dump(boxes, open('boxes.json','w'))
    print(boxes); print('blocked supabase calls:', len(blocked), set(blocked))
    br.close()
