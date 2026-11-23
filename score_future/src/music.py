import numpy as np, wave
SR=44100; D=29.0; N=int(SR*D)
t=np.arange(N)/SR
L=np.zeros(N); R=np.zeros(N)
rng=np.random.default_rng(7)
def f(n): return 440*2**((n-69)/12)
def env(n, a, r, sustain=True):
    e=np.ones(n); a=int(a*SR); r=int(r*SR)
    if a: e[:a]=np.linspace(0,1,a)
    if r: e[-r:]*=np.linspace(1,0,r)
    return e
def add(sig, start, gain=1.0, pan=0.0):
    i=int(start*SR); j=min(N,i+len(sig)); s=sig[:j-i]*gain
    L[i:j]+=s*(1-pan)/1.0*0.5*(1+(-pan if pan<0 else 0)+1) if False else s*np.cos((pan+1)*np.pi/4)
    R[i:j]+=s*np.sin((pan+1)*np.pi/4)
def tone(freq, dur, harm=(1,.5,.25,.12), decay=None):
    tt=np.arange(int(dur*SR))/SR
    s=sum(a*np.sin(2*np.pi*freq*(k+1)*tt + 0.3*k) for k,a in enumerate(harm))
    if decay: s*=np.exp(-tt/decay)
    return s
def pad(notes, start, dur, gain):
    for n in notes:
        for det in (-0.12,0.12):
            s=tone(f(n+det), dur, harm=(1,.35,.15,.06))*env(int(dur*SR),.6,.8)
            add(s,start,gain,pan=det*4)
# --- S1 hook: low drone + hits
pad([45,52,57],0,3.4,0.05)
for ht in (0.9,1.7):
    tt=np.arange(int(1.4*SR))/SR
    boom=np.sin(2*np.pi*(55+60*np.exp(-tt*18))*tt)*np.exp(-tt*3.2)
    add(boom,ht,0.55)
    add(tone(f(69),1.4,decay=.5),ht,0.10)
# --- whoosh helper
def whoosh(start, dur=0.6, gain=0.18):
    n=int(dur*SR); x=rng.standard_normal(n)
    # crude band sweep: moving-average lowpass with changing window, envelope swell
    out=np.zeros(n); k=np.linspace(40,4,n).astype(int); c=np.cumsum(np.r_[0,x])
    idx=np.arange(n); lo=np.maximum(0,idx-k); out=(c[idx+1]-c[lo])/(idx+1-lo)
    e=np.sin(np.linspace(0,np.pi,n))**2
    add(out*e,start-dur*0.6,gain)
for w in (3.2,20.5,24.5): whoosh(w,0.8,0.35)
# --- progression for S2..S5 (C major, uplifting): C G Am F, 2 s each
prog=[[48,55,60,64],[43,55,59,62],[45,57,60,64],[41,53,57,60]]
tt0=3.2; i=0
while tt0<24.5:
    pad(prog[i%4],tt0,2.3,0.045); tt0+=2.0; i+=1
# --- beat from 5.6 to 24.5 at 105 BPM
bpm=105; beat=60/bpm; bt=5.6
while bt<24.4:
    tt=np.arange(int(.35*SR))/SR
    kick=np.sin(2*np.pi*(48+90*np.exp(-tt*30))*tt)*np.exp(-tt*9)
    add(kick,bt,0.42)
    hn=int(.06*SR); hat=rng.standard_normal(hn); hat=np.diff(np.r_[0,hat])*np.exp(-np.arange(hn)/SR*60)
    add(hat,bt+beat/2,0.05,pan=0.3)
    bt+=beat
# --- climbing plucks at each tier arrival (bottom → top), rising scale
starts=[0,1.95,3.9,5.85,7.8,9.75,11.7]
notes=[60,62,64,67,69,72,76]
for k,(s,n) in enumerate(zip(starts,notes)):
    at=5.6+s+(0.45 if k>0 else 0.15)
    if k>0: whoosh(5.6+s+0.3,0.5,0.12)
    for o,g in ((0,.22),(12,.08)):
        add(tone(f(n+o),1.6,harm=(1,.4,.2,.1,.05),decay=.35),at,g,pan=-0.2+0.06*k)
# top tier: big bright chord + shimmer
for n in (60,64,67,72,76,79):
    add(tone(f(n),3.0,harm=(1,.3,.1),decay=1.4)*env(int(3*SR),.02,.6),5.6+11.7+0.5,0.06)
for k in range(10):
    add(tone(f(84+[0,4,7,12][k%4]),.4,harm=(1,.2),decay=.12),5.6+11.7+0.6+k*0.12,0.05,pan=(-1)**k*0.5)
# --- ending: swell chord C – F – C
pad([48,55,60,64,67,72],24.5,4.5,0.06)
for n in (72,76,79,84):
    add(tone(f(n),3,harm=(1,.3),decay=1.2),24.8,0.05)
# --- simple stereo reverb (feedback combs)
def comb(x, d, g):
    y=x.copy(); d=int(d*SR)
    for i in range(d,len(y),d): y[i:i+d]+=g*y[i-d:i][:len(y[i:i+d])]
    return y
Lr=0.6*L+0.4*(comb(L,.037,.45)+comb(L,.053,.4))/2
Rr=0.6*R+0.4*(comb(R,.041,.45)+comb(R,.059,.4))/2
mix=np.stack([Lr,Rr],1)
fade=np.ones(N); fn=int(1.2*SR); fade[-fn:]=np.linspace(1,0,fn)**1.5; fade[:int(.02*SR)]=np.linspace(0,1,int(.02*SR))
mix*=fade[:,None]
mix=np.tanh(mix/np.abs(mix).max()*1.3)/np.tanh(1.3)*0.7
with wave.open('music.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix*32767).astype('<i2').tobytes())
print('ok', mix.shape)
