import json, re
L = json.load(open('script.json')); A = json.load(open('asr.json'))
nz = lambda x: re.sub(r'[^а-яёa-z0-9]','',x.lower().replace('ё','е'))
j = 0; out = []
for l in L:
    ws = []
    for w in l['text'].split():
        tgt = nz(w); acc = ''; st = None; en = None
        if not tgt: continue
        while j < len(A) and len(acc) < len(tgt):
            if not nz(A[j][0]): j += 1; continue
            if st is None: st = A[j][1]
            acc += nz(A[j][0]); en = A[j][2]; j += 1
        ws.append({'w': w, 's': st, 'e': en})
    ws = [x for x in ws]
    l["words"] = ws
    out.append(l)
for i, l in enumerate(out):
    l['t0'] = round(max(0, l['words'][0]['s'] - 0.03), 3)
    end = l['words'][-1]['e']
    l['dur'] = round(end - l['t0'], 3)
    for w in l['words']: w['s'] = round(w['s'] - l['t0'], 3); w['e'] = round(w['e'] - l['t0'], 3)
total = round(out[-1]['t0'] + out[-1]['dur'] + 1.0, 2)
json.dump({'lines': out, 'total': total}, open('tl.json', 'w'), ensure_ascii=False)
prev = 0
for l in out:
    print(l['kind'], l['t0'], round(l['t0']-prev,2), [(w['w'], w['s']) for w in l['words']][:3]); prev = l['t0'] + l['dur']
print('total', total)
