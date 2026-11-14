import json, subprocess, wave, numpy as np, re, sys
from faster_whisper import WhisperModel
L = json.load(open('script.json')); M = open('marked.txt').read().strip().split('\n')
asr = WhisperModel('small', device='cpu', compute_type='int8')
rate = sys.argv[1] if len(sys.argv) > 1 else '+8%'
rng = np.random.default_rng(7); SR = 24000
def tts(text, out):
    text = text.replace('\u0301','')
    subprocess.run(['python3','-I','/home/claude/jzscripts/etts.py',text,'ru-RU-SvetlanaNeural',out+'.mp3',rate],check=True)
    subprocess.run(['ffmpeg','-v','error','-y','-i',out+'.mp3','-ac','1','-ar',str(SR),out+'.wav'],check=True)
    w = wave.open(out+'.wav'); s = np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    idx = np.where(np.abs(s)>0.01)[0]; s = s[max(idx[0]-240,0):idx[-1]+1200]
    # cap internal pauses at ~0.32 s (keep natural comma breaths, cut edge's long ones)
    env = np.convolve(np.abs(s),np.ones(240)/240,'same')>0.006
    keep = np.ones(len(s),bool); i0=None; MX=int(0.32*SR)
    for k in range(len(s)+1):
        q = env[k] if k<len(s) else True
        if not q and i0 is None: i0=k
        if q and i0 is not None:
            if k-i0>MX: keep[i0+MX//2:k-MX//2]=False
            i0=None
    return s[keep]
for i,(l,m) in enumerate(zip(L,M)):
    parts=[]
    for ci,chunk in enumerate(m.split('//')):
        c = chunk.strip()
        # single slash = breath: make it a comma where there is no punctuation
        c = re.sub(r'(?<![,.:!?»])\s*/\s*', ', ', c); c = re.sub(r'\s*/\s*', ' ', c)
        s = tts(c, f'c{i:02d}_{ci}')
        if parts: parts.append(np.zeros(int(SR*rng.uniform(0.42,0.55))))
        parts.append(s)
    s = np.concatenate(parts)
    o = wave.open(f'vo{i:02d}.wav','wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(s,-1,1)*32767).astype(np.int16).tobytes()); o.close()
    x16 = np.interp(np.arange(int(len(s)*16000/SR))*SR/16000,np.arange(len(s)),s).astype(np.float32)
    segs,_ = asr.transcribe(x16,language='ru',word_timestamps=True,condition_on_previous_text=False)
    ws=[w for g in segs for w in g.words]
    l['dur']=len(s)/SR; l['asr']=[(w.word.strip(),w.start,w.end) for w in ws]
    print(i, round(l['dur'],2), '|', ''.join(w.word for w in ws), flush=True)
json.dump(L,open('script_t.json','w'),ensure_ascii=False)
