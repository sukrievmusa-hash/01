import os, json, re, sys
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright
sys.path.insert(0,'/home/claude/jzscripts')
OUT = '/home/claude/jzreg/shots'; os.makedirs(OUT, exist_ok=True)
REF = 'qvguiecmgleynqorexcs'
EMAIL='alikhan@mail.kz'
USER = {"id": "u9", "aud": "authenticated", "role": "authenticated", "email": EMAIL, "app_metadata": {}, "user_metadata": {}, "created_at": "2026-11-14T08:00:00Z"}
SESSION = {"access_token": "demo", "refresh_token": "demo", "token_type": "bearer", "expires_in": 3600*24*365, "expires_at": 1893456000, "user": USER}
BIZ = {"id": "b9", "owner_id": "u9", "name": "Барбершоп «Алихан»", "slug": "barbershop-alikhan", "category": "Барбершоп", "timezone": "Asia/Almaty",
       "plan": "business", "trial_until": "2026-11-28T00:00:00Z", "paid_until": "2026-11-28T00:00:00Z", "phone": "+77011234567", "address": "г. Тараз, ул. Толе би, 10",
       "slot_step": 30, "tg_chat_id": None, "is_blocked": False, "description": "", "prepay_enabled": False, "created_at": "2026-11-14T08:01:00Z"}
STAFF = [{"id": "s9", "business_id": "b9", "name": "Алихан", "title": "", "is_active": True, "sort": 1, "created_at": "2026-11-14T08:01:00Z"}]
HOURS = [{"id": f"h{d}", "business_id": "b9", "staff_id": "s9", "weekday": d, "start_time": "10:00", "end_time": "20:00"} for d in range(1, 8)]
ST = {'biz': False, 'services': []}
log = set()
def J(route, obj, status=200):
    route.fulfill(status=status, content_type='application/json', body=json.dumps(obj, ensure_ascii=False))
def handle(route):
    req = route.request; u = urlparse(req.url); path = u.path
    if ST.get('client') and '/rest/v1/' in path and '/rpc/' not in path:
        r = route.fetch(url=req.url.replace('barbershop-alihan', 'demo'))
        return route.fulfill(response=r, body=r.text().replace('Барбершоп «Демо»', 'Барбершоп «Алихан»'))
    if '/functions/v1/' in path:
        log.add('fn '+path); return J(route, {"ok": True})
    if '/auth/v1/' in path:
        log.add('auth '+path)
        if 'logout' in path: return J(route, {})
        return J(route, USER if path.endswith('/user') else SESSION)
    m = re.search(r'/rest/v1/rpc/([a-z_]+)', path)
    if m:
        n = m.group(1); log.add('rpc '+n)
        if ST.get('client'):
            print('CLIENT rpc', n, req.post_data)
            body = (req.post_data or '').replace('barbershop-alihan', 'demo')
            r = route.fetch(post_data=body)
            txt = r.text().replace('Барбершоп «Демо»', 'Барбершоп «Алихан»').replace('г. Алматы, пр. Абая, 1', 'г. Тараз, ул. Толе би, 10')
            return route.fulfill(response=r, body=txt)
        if n == 'check_slug': return J(route, True)
        if n == 'create_business': ST['biz'] = True; return J(route, "b9")
        return J(route, None)
    m = re.search(r'/rest/v1/([a-z_]+)', path)
    if m:
        t = m.group(1); log.add(req.method+' '+t)
        if req.method != 'GET':
            if t == 'services':
                body = json.loads(req.post_data or '{}')
                if not isinstance(body, list): body = [body]
                rows_ = []
                for b_ in body:
                    row = {"id": f"v{len(ST['services'])+1}", "business_id": "b9", "is_active": True, "sort": len(ST['services'])+1, **b_}
                    ST['services'].append(row); rows_.append(row)
                return J(route, rows_ if 'vnd.pgrst.object' not in (req.headers.get('accept') or '') else rows_[0], 201)
            return J(route, [])
        rows = {'businesses': [BIZ] if ST['biz'] else [], 'platform_settings': [{"id": 1, "support_contact": "", "trial_days": 14}],
                'plans': [{"code": "start", "title": "Старт", "price": 1500, "staff_limit": 1, "ai": False, "ai_limit": 0, "sort": 1}, {"code": "business", "title": "Бизнес", "price": 7000, "staff_limit": 10, "ai": False, "ai_limit": 0, "sort": 2}],
                'staff': STAFF, 'services': ST['services'], 'staff_services': [{"business_id": "b9", "staff_id": "s9", "service_id": s['id']} for s in ST['services']],
                'working_hours': HOURS}.get(t, [])
        if 'vnd.pgrst.object' in (req.headers.get('accept') or ''):
            return J(route, rows[0] if rows else None)
        return J(route, rows)
    route.continue_()

boxes = {}
def box(pg, sel, name):
    b = pg.locator(sel).first.bounding_box(); boxes[name] = [round(b['x']+b['width']/2), round(b['y']+b['height']/2)]
n = [0]
def shot(pg, name, full=False):
    pg.wait_for_timeout(250); pg.screenshot(path=f'{OUT}/{name}.png', full_page=full); print('shot', name)
def typeinto(pg, sel, text, prefix):
    loc = pg.locator(sel).first; loc.click(); pg.wait_for_timeout(150)
    steps = [len(text)//3, 2*len(text)//3, len(text)]
    done = 0
    for i, k in enumerate(steps):
        pg.keyboard.type(text[done:k], delay=15); done = k; pg.wait_for_timeout(400 if i==2 else 120)
        shot(pg, f'{prefix}_{i}')

with sync_playwright() as p:
    br = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'], proxy={'server': os.environ['HTTPS_PROXY']})
    ctx = br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True, locale='ru-RU', timezone_id='Asia/Almaty')
    ctx.route(f'https://{REF}.supabase.co/**', handle)
    pg = ctx.new_page()
    pg.on('console', lambda m: print('console:', m.type, m.text[:200]) if m.type == 'error' else None)
    pg.goto('https://jazylam.kz/', wait_until='networkidle'); pg.wait_for_timeout(800)
    shot(pg, 'r0_land')
    box(pg, 'a[href="app.html#signup"]:visible >> nth=1', 'land_try')
    print(pg.locator('a[href="app.html#signup"]:visible').first.inner_text())
    pg.locator('a[href="app.html#signup"]:visible').nth(1).click()
    pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(900)
    shot(pg, 'r1_signup')
    box(pg, 'input[name=email]', 'email'); box(pg, 'input[name=password]', 'pw')
    typeinto(pg, 'input[name=email]', EMAIL, 'r1_email')
    typeinto(pg, 'input[name=password]', 'barber2026', 'r1_pw')
    box(pg, '#ab', 'create')
    pg.locator('#ab').click(); pg.wait_for_timeout(1500)
    shot(pg, 'r2_onb')
    box(pg, 'input[name=name]', 'name')
    typeinto(pg, 'input[name=name]', 'Барбершоп «Алихан»', 'r2_name')
    pg.wait_for_timeout(900); shot(pg, 'r2_name_slug')
    pg.select_option('select[name=category]', label='Барбершоп') if 'Барбершоп' in pg.locator('select[name=category]').inner_text() else None
    box(pg, 'input[name=phone]', 'phone'); typeinto(pg, 'input[name=phone]', '7011234567', 'r2_phone')
    box(pg, 'input[name=staff]', 'staff'); typeinto(pg, 'input[name=staff]', 'Алихан', 'r2_staff')
    pg.locator('input[name=staff]').blur(); pg.wait_for_timeout(300); shot(pg, 'r2_filled')
    box(pg, '#of button.btn-pri', 'createbiz'); boxes['scroll_onb'] = pg.evaluate('scrollY')
    pg.locator('#of button.btn-pri').click(); pg.wait_for_timeout(1800)
    shot(pg, 'r3_services'); print('url', pg.url)
    pg.wait_for_timeout(3500); shot(pg, 'r3_services_clean')
    tb = pg.get_by_text('Добавить типовые услуги').first; box(pg, 'text=Добавить типовые услуги', 'typical')
    tb.click(); pg.wait_for_timeout(1500); shot(pg, 'r4_list'); pg.wait_for_timeout(3500); shot(pg, 'r4_list_clean')
    box(pg, '#shareBtn', 'share'); pg.click('#shareBtn'); pg.wait_for_timeout(900); shot(pg, 'r5_share')
    box(pg, '#shCopy', 'copy')
    ctx.grant_permissions(['clipboard-read', 'clipboard-write'], origin='https://jazylam.kz')
    pg.click('#shCopy'); pg.wait_for_timeout(250); shot(pg, 'r5_copied')
    print(sorted(log))
    ST['client'] = True
    ctx2 = br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True, locale='ru-RU', timezone_id='Asia/Almaty')
    ctx2.route(f'https://{REF}.supabase.co/**', handle)
    cp = ctx2.new_page()
    cp.goto('https://jazylam.kz/book.html?b=barbershop-alihan', wait_until='networkidle'); cp.wait_for_timeout(900)
    cp.add_style_tag(content='p:has(+ *), header p{}'); cp.evaluate("() => { for (const p of document.querySelectorAll('p')) if (p.textContent.includes('демонстрационная')) p.style.display='none'; }")
    shot(cp, 'r6_book')
    for t in ['Мужская стрижка','Алихан']:
        cp.get_by_text(t).first.click(); cp.wait_for_timeout(900)
    shot(cp, 'r6_slots')
    json.dump(boxes, open(f'{OUT}/boxes.json', 'w'), ensure_ascii=False, indent=1)
    br.close()
