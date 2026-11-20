# Озвучка v6: весь текст ОДНИМ запросом edge-tts, паузы >0.12 с сжимаются, реплики раскладываются по faster-whisper.
import asyncio, os, sys, time, subprocess, json, re, wave
import numpy as np
import certifi
certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
import edge_tts
from faster_whisper import WhisperModel
LINES = json.load(open('script.json'))
TEXT = ' '.join(l['text'] for l in LINES)
SR = 24000
async def go():
    await edge_tts.Communicate(TEXT, 'ru-RU-SvetlanaNeural', rate='+14%', proxy=os.environ.get('HTTPS_PROXY')).save('all.mp3')
for k in range(8):
    try: asyncio.run(go()); break
    except Exception as e:
        print('retry', k, type(e).__name__); time.sleep(6 + k * 6)
else: sys.exit('tts failed')
subprocess.run(['ffmpeg','-v','error','-y','-i','all.mp3','-ac','1','-ar',str(SR),'all.wav'],check=True)
w = wave.open('all.wav'); s = np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
idx = np.where(np.abs(s)>0.01)[0]; s = s[idx[0]:idx[-1]+int(0.02*SR)]
env = np.convolve(np.abs(s),np.ones(240)/240,'same')>0.006
keep = np.ones(len(s),bool); MX=int(0.12*SR); i0=None
for k in range(len(s)+1):
    q = env[k] if k<len(s) else True
    if not q and i0 is None: i0=k
    if q and i0 is not None:
        if k-i0>MX: keep[i0+MX//2:k-MX//2]=False
        i0=None
s = s[keep]
o = wave.open('voice.wav','wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(s,-1,1)*32767).astype(np.int16).tobytes()); o.close()
x16 = np.interp(np.arange(int(len(s)*16000/SR))*SR/16000,np.arange(len(s)),s).astype(np.float32)
asr = WhisperModel('small', device='cpu', compute_type='int8')
segs,_ = asr.transcribe(x16,language='ru',word_timestamps=True,condition_on_previous_text=False,initial_prompt=TEXT)
ws=[(g.word.strip(),g.start,g.end) for sg in segs for g in sg.words]
json.dump(ws,open('asr.json','w'),ensure_ascii=False)
print(len(s)/SR, ' '.join(w[0] for w in ws))
