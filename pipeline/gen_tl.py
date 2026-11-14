import json,re
L=json.load(open('script_t.json'))
GAP=0.2;t=0.2
for l in L:
    words=l['text'].split()
    asr=[a for a in l.get('asr',[]) if re.sub(r'\W','',a[0])]
    nz=lambda x:re.sub(r'[^а-яёa-z0-9]','',x.lower())
    ws=[];j=0
    for w in words:
        if j>=len(asr): break
        st=asr[j][1];acc=nz(asr[j][0]);j+=1
        while len(acc)<len(nz(w))-1 and j<len(asr) and len(words)-len(ws)-1<len(asr)-j:
            acc+=nz(asr[j][0]);j+=1
        ws.append({'w':w,'s':st,'e':asr[j-1][2]})
    if len(ws)!=len(words):
        tot=sum(len(w)+1 for w in words);acc=0;ws=[]
        for w in words:
            s=acc/tot*l['dur'];acc+=len(w)+1;ws.append({'w':w,'s':s,'e':acc/tot*l['dur']})
    l['words']=ws;l['t0']=round(t,3);t+=l['dur']+GAP
    l.pop('asr',None)
out={'lines':L,'total':round(t+1.8,2)}
json.dump(out,open('tl_src.json','w'),ensure_ascii=False)
json.dump(out,open('tl.json','w'),ensure_ascii=False)
print(out['total'],[len(l['words'])==len(l['text'].split()) for l in L])
