import numpy as np, wave, json
SR=44100
tl=json.load(open("tl.json")); T=tl["total"]; N=int(T*SR)
def rd(f):
    w=wave.open(f);sr=w.getframerate();x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    if sr!=SR: x=np.interp(np.arange(int(len(x)*SR/sr))*sr/SR,np.arange(len(x)),x)
    return x
vo=np.zeros(N)
x=rd("voice.wav");vo[:len(x)]=x[:N]
t=np.arange(N)/SR; bpm=128; beat=60/bpm
mus=np.zeros(N)
# kick
for b in np.arange(0,T,beat):
    s=int(b*SR);n=int(0.25*SR);tt=np.arange(n)/SR
    k=np.sin(2*np.pi*(50+90*np.exp(-tt*30))*tt)*np.exp(-tt*12);mus[s:s+n]+=k[:N-s]*0.9
# hats
rng=np.random.default_rng(1)
for b in np.arange(beat/2,T,beat):
    s=int(b*SR);n=int(0.05*SR);h=rng.standard_normal(n)*np.exp(-np.arange(n)/SR*90);h=np.diff(h,prepend=0)
    mus[s:s+n]+=h[:N-s]*0.12
# bass (A minor: A F C G)
roots=[55,43.65,65.41,49.0]
for bi,b in enumerate(np.arange(0,T,beat/2)):
    s=int(b*SR);n=int(beat/2*SR);tt=np.arange(n)/SR;f=roots[int(b/(beat*4))%4]
    x=(np.sign(np.sin(2*np.pi*f*tt))*0.5+np.sin(2*np.pi*f*tt))*np.exp(-tt*6);mus[s:s+n]+=x[:N-s]*0.22
# pad
for i,f in enumerate([220,261.6,329.6]):
    mus+=np.sin(2*np.pi*f*t+i)*0.025*(0.6+0.4*np.sin(2*np.pi*t/8))
# whoosh at scene changes
sfx=np.zeros(N)
for l in tl["lines"][1:]:
    s=int((l["t0"]-0.25)*SR);n=int(0.35*SR);nz=rng.standard_normal(n)
    env=np.sin(np.linspace(0,np.pi,n))**2;x=np.convolve(nz,np.ones(8)/8,'same')*env
    sfx[s:s+n]+=x[:N-s]*0.18
# ducking
e=np.convolve(np.abs(vo),np.ones(2205)/2205,'same');duck=1-0.65*np.clip(e/0.05,0,1)
duck=np.convolve(duck,np.ones(4410)/4410,'same')
fade=np.clip((T-t)/1.0,0,1)
mix=vo*1.0+mus*duck*0.45*fade+sfx*0.8
mix=mix/np.max(np.abs(mix))*0.95
w=wave.open("mix9.wav","wb");w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype(np.int16).tobytes());w.close()
