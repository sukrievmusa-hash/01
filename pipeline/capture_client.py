# Съёмка экранов клиентской записи. Сервер (Supabase) полностью подменён демо-данными: ничего не создаётся.
import os, json, re, datetime as dt
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
OUT = os.environ.get('SHOTS', '/home/claude/work/shots'); os.makedirs(OUT, exist_ok=True)
REF = 'qvguiecmgleynqorexcs'
TZ = dt.timezone(dt.timedelta(hours=5))
today = dt.datetime.now(TZ).date()
D = lambda i: (today + dt.timedelta(days=i)).isoformat()
BIZ = {"id": "b1", "slug": "demo-nails", "name": "Студия маникюра «Айым»", "category": "Маникюр", "address": "г. Тараз, ул. Желтоксан, 5",
       "phone": "+77010000000", "description": "", "timezone": "Asia/Almaty", "active": True, "is_demo": True, "chat": False, "bot_username": None,
       "ai": False, "max_days_ahead": 30, "prepay_enabled": False, "photos": [],
       "staff": [{"id": "s1", "name": "Айым", "title": "Мастер маникюра"}],
       "services": [{"id": "v1", "name": "Маникюр + покрытие", "duration_min": 90, "price": 8000, "description": "", "staff_ids": ["s1"]},
                    {"id": "v2", "name": "Маникюр без покрытия", "duration_min": 60, "price": 4500, "description": "", "staff_ids": ["s1"]},
                    {"id": "v3", "name": "Педикюр", "duration_min": 90, "price": 7000, "description": "", "staff_ids": ["s1"]}]}
START = dt.datetime.combine(today + dt.timedelta(days=1), dt.time(15, 0), TZ).astimezone(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
def slots(date):
    out = []
    for h, m in [(10,0),(11,30),(13,0),(15,0),(16,30),(18,0)]:
        out.append({"t": dt.datetime.combine(dt.date.fromisoformat(date), dt.time(h, m), TZ).astimezone(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'), "staff_id": "s1"})
    return out
BOOKING = {"token": "demo-token", "starts_at": START, "status": "booked", "service_name": "Маникюр + покрытие", "staff_name": "Айым", "price": 8000,
           "client_name": "Алия", "bot_username": "demo_bot", "tg": False, "can_cancel": True,
           "business": {"name": BIZ["name"], "address": BIZ["address"], "phone": BIZ["phone"], "timezone": "Asia/Almaty", "prepay_enabled": False}}
hits = []
def J(route, obj): route.fulfill(status=200, content_type='application/json', body=json.dumps(obj, ensure_ascii=False))
def handle(route):
    req = route.request; path = urlparse(req.url).path
    m = re.search(r'/rest/v1/rpc/([a-z_]+)', path)
    hits.append(req.method + ' ' + path)
    if not m: return J(route, [])
    n = m.group(1)
    if n == 'get_public_business': return J(route, BIZ)
    if n == 'get_free_days': return J(route, [D(i) for i in range(1, 14) if i % 7 != 6])
    if n == 'get_slots': return J(route, slots(json.loads(req.post_data)['p_date']))
    if n == 'create_booking': return J(route, {"token": "demo-token"})
    if n == 'get_booking': return J(route, BOOKING)
    return J(route, None)
boxes = {}
def box(pg, sel, name):
    b = pg.locator(sel).first.bounding_box(); boxes[name] = [round(b['x']+b['width']/2), round(b['y']+b['height']/2), round(b['width']), round(b['height'])]
def shot(pg, name):
    pg.wait_for_timeout(350); pg.screenshot(path=f'{OUT}/{name}.png'); print('shot', name)
with sync_playwright() as p:
    br = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'], proxy={'server': os.environ['HTTPS_PROXY']})
    ctx = br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, is_mobile=True, has_touch=True, locale='ru-RU', timezone_id='Asia/Almaty')
    ctx.route(f'https://{REF}.supabase.co/**', handle)
    pg = ctx.new_page()
    pg.goto('https://jazylam.kz/book.html?b=demo-nails', wait_until='networkidle'); pg.wait_for_timeout(900)
    shot(pg, 'c1_services'); box(pg, 'button.opt >> nth=0', 'service')
    pg.locator('button.opt').first.click(); pg.wait_for_timeout(1200)
    shot(pg, 'c2_time'); box(pg, '.slot >> nth=3', 'slot')
    pg.locator('.slot').nth(3).click(); pg.wait_for_timeout(700)
    shot(pg, 'c3_form_empty'); box(pg, 'input[name=name]', 'name'); box(pg, 'input[name=phone]', 'phone')
    pg.locator('input[name=name]').click(); pg.keyboard.type('Алия', delay=40)
    pg.locator('input[name=phone]').click(); pg.keyboard.type('7015550101', delay=40); pg.wait_for_timeout(300)
    pg.locator('input[name=phone]').blur(); pg.evaluate('window.scrollTo(0,0)')
    shot(pg, 'c3_form'); box(pg, 'button[type=submit]', 'submit')
    boxes['scroll_form'] = pg.evaluate('scrollY')
    pg.locator('button[type=submit]').click(); pg.wait_for_url('**/my.html*', timeout=8000); pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(900)
    shot(pg, 'c4_done'); box(pg, '.btn-tg', 'tg')
    pg.screenshot(path=f'{OUT}/c4_done_full.png', full_page=True)
    print(sorted(set(hits)))
    json.dump(boxes, open(f'{OUT}/boxes.json', 'w'), ensure_ascii=False, indent=1); print(boxes)
    br.close()
