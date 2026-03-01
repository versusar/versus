// === App (Phase 2) ===
// © 2026 VersuAR. All Rights Reserved.
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const app = document.getElementById(‘app’);
const APP_URL = ‘https://versusar.github.io/versus/’;
const WORKER_URL = ‘https://versus-daily.versusarapp.workers.dev’;

let state = {
screen: ‘splash’, questions: [], currentQ: 0, selected: null, showResults: false,
activeCategory: ‘all’, region: VS.get(‘region’) || null, profile: VS.getProfile(),
xpPopup: null, achievementPopup: null, showAd: false,
gameStartTime: null, questionsAnsweredThisRound: 0, lbTab: ‘xp’,
onboardStep: 0, dailyQs: null, dailyLoaded: false, musicPlaying: false
};

// === Worker Daily Questions ===
async function loadDailyQuestions() {
if (state.dailyLoaded) return state.dailyQs;
try {
const res = await fetch(WORKER_URL + ‘/today’);
if (!res.ok) throw new Error(‘fetch failed’);
const data = await res.json();
state.dailyQs = data.map(q => ({
q: q.question, a: q.option_a, b: q.option_b,
category: q.category, seed: [q.seed_a, q.seed_b]
}));
state.dailyLoaded = true;
return state.dailyQs;
} catch (e) {
console.warn(‘Daily fetch failed:’, e);
state.dailyLoaded = true;
state.dailyQs = null;
return null;
}
}

const CG = [
‘linear-gradient(135deg,#FF6B35,#FF9A76)’,‘linear-gradient(135deg,#7B2FF7,#B388FF)’,
‘linear-gradient(135deg,#00D4AA,#00F5D4)’,‘linear-gradient(135deg,#FF3CAC,#FF85C8)’,
‘linear-gradient(135deg,#FFD93D,#FFE88A)’,‘linear-gradient(135deg,#3A86FF,#83B4FF)’,
‘linear-gradient(135deg,#F72585,#FF5DA2)’,‘linear-gradient(135deg,#FF9E00,#FFCA58)’,
‘linear-gradient(135deg,#8338EC,#C77DFF)’,‘linear-gradient(135deg,#06D6A0,#73E8C4)’
];

// === PHASE 2: Background Music (Web Audio API — no files needed) ===
const MusicPlayer = {
ctx: null, gainNode: null, isPlaying: false, volume: 0.12, loopTimer: null,
notes: [261.63,293.66,329.63,392.00,440.00,523.25,587.33,659.25],
init() {
if (this.ctx) return;
try { this.ctx = new (window.AudioContext||window.webkitAudioContext)(); this.gainNode = this.ctx.createGain(); this.gainNode.gain.value = this.volume; this.gainNode.connect(this.ctx.destination); } catch(e) {}
},
playNote(freq,t,dur) {
if (!this.ctx) return;
const o=this.ctx.createOscillator(), g=this.ctx.createGain();
o.type=‘sine’; o.frequency.value=freq;
g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.25,t+0.05); g.gain.exponentialRampToValueAtTime(0.01,t+dur-0.05);
o.connect(g); g.connect(this.gainNode); o.start(t); o.stop(t+dur);
},
playLoop() {
if (!this.ctx||!this.isPlaying) return;
const now=this.ctx.currentTime, bl=60/70;
for (let i=0;i<16;i++) {
const f=this.notes[Math.floor(Math.random()*this.notes.length)]*(Math.random()>.5?.5:1);
if (Math.random()>.3) this.playNote(f,now+i*bl,bl*(Math.random()>.7?2:1)*.9);
}
if (this.isPlaying) this.loopTimer=setTimeout(()=>this.playLoop(),bl*16*1000);
},
start() { this.init(); if(!this.ctx) return; if(this.ctx.state===‘suspended’) this.ctx.resume(); this.isPlaying=true; state.musicPlaying=true; VS.set(‘musicOn’,true); this.playLoop(); },
stop() { this.isPlaying=false; state.musicPlaying=false; VS.set(‘musicOn’,false); if(this.loopTimer) clearTimeout(this.loopTimer); },
toggle() { if(this.isPlaying) this.stop(); else this.start(); return this.isPlaying; }
};

// === PHASE 2: Learning Facts ===
const LEARNING_FACTS = [
{emoji:‘🧠’,fact:“Studies show people are more likely to agree with opinions when they see others agree first — it’s called social proof!”},
{emoji:‘🌍’,fact:“On average, people overestimate how much others agree with them by about 20%.”},
{emoji:‘📊’,fact:“Your brain makes most decisions in under 7 seconds — trust your gut!”},
{emoji:‘🎯’,fact:“People who consider opposing viewpoints make better decisions overall.”},
{emoji:‘💡’,fact:“The "mere exposure effect" means we tend to prefer things simply because we’re familiar with them.”},
{emoji:‘🔬’,fact:“Psychologists found that people in groups tend to make riskier decisions — the "risky shift."”},
{emoji:‘📈’,fact:“The average person changes their mind about 3 major life opinions per decade.”},
{emoji:‘⚡’,fact:“Hot takes activate the same brain regions as gambling — the thrill of taking a stand!”},
{emoji:‘🌐’,fact:“Cross-cultural studies show food/music preferences vary wildly, but core moral values are surprisingly universal.”},
{emoji:‘🤝’,fact:“Disagreeing respectfully actually strengthens relationships more than always agreeing.”},
{emoji:‘📱’,fact:“The average person forms 35,000 micro-opinions per day — most unconsciously.”},
{emoji:‘🏆’,fact:“People who play opinion games score higher on empathy tests!”},
{emoji:‘🎲’,fact:“Your morning coffee preference says more about your personality than your zodiac sign.”},
{emoji:‘🎭’,fact:“We process food/music opinions with different brain regions than political opinions.”},
];
function getLearningFact() { return LEARNING_FACTS[Math.floor(Math.random()*LEARNING_FACTS.length)]; }

// === PHASE 2: Comeback Rewards ===
function checkComebackReward() {
const p=VS.getProfile(); if (!p.lastVoteDate) return null;
const days=Math.floor((Date.now()-p.lastVoteDate)/86400000);
if (days>=3&&days<7) return {bonus:50,msg:“We missed you! Here’s 50 bonus XP!”,emoji:‘👋’};
if (days>=7&&days<30) return {bonus:150,msg:‘Welcome back! 150 XP + 5 bonus questions!’,emoji:‘🎁’,extraQs:5};
if (days>=30) return {bonus:300,msg:‘Long time no see! 300 XP + 10 bonus questions!’,emoji:‘🎉’,extraQs:10};
return null;
}
function showComebackModal(reward) {
if (!reward) return;
VS.addXP(reward.bonus);
if (reward.extraQs) VS.addBonusQuestions(reward.extraQs);
VS.set(‘comebackShown’,Date.now());
const ov=document.createElement(‘div’); ov.className=‘modal-overlay’;
ov.innerHTML=`<div class="modal-box" style="text-align:center"><div style="font-size:56px">${reward.emoji}</div><h2 style="font-size:22px;font-weight:800;color:var(--dark);margin-top:8px">Welcome Back!</h2><p style="font-family:var(--font-body);font-size:14px;color:var(--gray);margin-top:8px">${reward.msg}</p><div style="margin-top:16px;display:flex;gap:8px;justify-content:center"><div style="background:var(--accent);color:#fff;padding:8px 16px;border-radius:20px;font-weight:700;font-size:14px">+${reward.bonus} XP</div>${reward.extraQs?`<div style="background:var(--primary);color:#fff;padding:8px 16px;border-radius:20px;font-weight:700;font-size:14px">+${reward.extraQs} Qs</div>`:''}</div><button class="next-btn" style="width:100%;padding:14px;margin-top:20px" id="comebackOk">Let's Go! ⚡</button></div>`;
document.body.appendChild(ov);
ov.onclick=e=>{if(e.target===ov)ov.remove();};
document.getElementById(‘comebackOk’).onclick=()=>{ov.remove();state.profile=VS.getProfile();render();};
}

// === PHASE 2: Notifications ===
function requestNotifications() {
if (!(‘Notification’ in window)) return;
if (Notification.permission===‘granted’){VS.set(‘notificationsOn’,true);return;}
if (Notification.permission!==‘denied’) Notification.requestPermission().then(p=>{if(p===‘granted’)VS.set(‘notificationsOn’,true);});
}
function showNotificationPrompt() {
if (!(‘Notification’ in window)||Notification.permission===‘granted’||VS.get(‘notifDismissed’)) return;
if (VS.getProfile().totalVotes<5) return;
const ov=document.createElement(‘div’); ov.className=‘modal-overlay’;
ov.innerHTML=`<div class="modal-box" style="text-align:center"><div style="font-size:48px">🔔</div><h2 style="font-size:20px;font-weight:800;color:var(--dark);margin-top:8px">Never Miss a Vote!</h2><p style="font-family:var(--font-body);font-size:13px;color:var(--gray);margin-top:4px">Get daily reminders so you never lose your streak</p><div style="display:flex;gap:8px;margin-top:16px"><button class="next-btn" style="flex:1;padding:14px" id="notifYes">🔔 Enable</button><button style="flex:1;padding:14px;background:var(--light);border:none;border-radius:16px;font-weight:700;font-size:14px;font-family:var(--font-display);color:var(--gray);cursor:pointer" id="notifNo">Not Now</button></div></div>`;
document.body.appendChild(ov);
ov.onclick=e=>{if(e.target===ov)ov.remove();};
document.getElementById(‘notifYes’).onclick=()=>{requestNotifications();ov.remove();};
document.getElementById(‘notifNo’).onclick=()=>{VS.set(‘notifDismissed’,true);ov.remove();};
}

// === PHASE 2: Weekly Recap ===
function getWeeklyRecap() {
const votes=VS.getVotes(), p=VS.getProfile(), weekAgo=Date.now()-7*86400000;
let wv=0; const cc={};
for (const [q,v] of Object.entries(votes)) {
if (v.timestamp&&v.timestamp>weekAgo) { wv++; const f=ALL_QUESTIONS.find(a=>a.q===q); if(f){const c=f.category||‘Unknown’;cc[c]=(cc[c]||0)+1;} }
}
const tc=Object.entries(cc).sort((a,b)=>b[1]-a[1])[0];
const pers=p.majorityVotes>p.minorityVotes?‘Crowd Surfer 🏄’:p.minorityVotes>p.majorityVotes?‘Rebel Soul 🤘’:‘Free Thinker 🧠’;
return {wv,tv:p.totalVotes,cats:Object.keys(cc).length,topCat:tc?tc[0]:‘None yet’,streak:p.streak,bs:p.bestStreak,maj:p.majorityVotes||0,min:p.minorityVotes||0,pers,xp:p.xp,lv:p.level,ln:p.levelName,le:p.levelEmoji};
}
function renderWeeklyRecap() {
const r=getWeeklyRecap();
const mp=r.maj+r.min>0?Math.round((r.maj/(r.maj+r.min))*100):50, cp=100-mp;
app.innerHTML=`<div class="game" style="background:var(--bg)"><div class="top-bar"><button class="back-btn" id="recapBack">←</button><div style="font-weight:800;font-size:18px;color:var(--dark)">📊 Weekly Recap</div></div>

  <div style="padding:16px 20px;overflow-y:auto;flex:1;padding-bottom:80px">
  <div style="background:linear-gradient(135deg,#3A86FF,#7B2FF7);border-radius:24px;padding:24px;text-align:center;margin-bottom:16px"><div style="font-size:48px">${r.le}</div><div style="font-size:18px;font-weight:800;color:#fff;margin-top:4px">${r.pers}</div><div style="font-size:13px;color:rgba(255,255,255,.7);font-family:var(--font-body);margin-top:4px">Your voting personality this week</div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
    <div class="stat-card"><div class="stat-num">${r.wv}</div><div class="stat-label">Votes This Week</div></div>
    <div class="stat-card"><div class="stat-num">${r.cats}</div><div class="stat-label">Categories</div></div>
    <div class="stat-card"><div class="stat-num">🔥 ${r.streak}</div><div class="stat-label">Current Streak</div></div>
    <div class="stat-card"><div class="stat-num">${r.topCat.split(' ')[0]}</div><div class="stat-label">Top Category</div></div>
  </div>
  <div style="background:#fff;border-radius:20px;padding:20px;margin-bottom:16px;box-shadow:0 2px 12px rgba(0,0,0,.06)">
    <h3 style="font-size:15px;font-weight:800;color:var(--dark);margin-bottom:12px">🎭 Voting Style</h3>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:12px;font-weight:700;color:var(--accent);width:80px">Mainstream</span><div style="flex:1;height:24px;background:var(--light);border-radius:12px;overflow:hidden"><div style="width:${mp}%;height:100%;background:linear-gradient(90deg,#3A86FF,#00D4AA);border-radius:12px;display:flex;align-items:center;justify-content:center"><span style="font-size:11px;font-weight:800;color:#fff">${mp}%</span></div></div></div>
    <div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;font-weight:700;color:#FF6B35;width:80px">Contrarian</span><div style="flex:1;height:24px;background:var(--light);border-radius:12px;overflow:hidden"><div style="width:${cp}%;height:100%;background:linear-gradient(90deg,#FF6B35,#FF3CAC);border-radius:12px;display:flex;align-items:center;justify-content:center"><span style="font-size:11px;font-weight:800;color:#fff">${cp}%</span></div></div></div>
  </div>
  <button class="daily-btn" id="recapShare"><div class="label">📤 SHARE YOUR RECAP</div><div class="title">Show off your week</div><div class="desc">Let friends see your voting personality</div><div class="arrow">→</div></button>
  </div>${bottomNav('profile')}</div>`;
  document.getElementById('recapBack').onclick=()=>{state.screen='profile';render();};
  document.getElementById('recapShare').onclick=()=>shareApp('⚡ My VERSUS Weekly Recap:\n'+r.pers+'\n'+r.wv+' votes · '+r.streak+' streak · '+mp+'% mainstream\n\nWhat\'s your style? 👉 '+APP_URL);
  bindNav();
}

// === Helpers ===
function musicToggleHTML() {
return `<button id="musicToggle" style="position:fixed;top:12px;right:12px;z-index:999;width:36px;height:36px;border-radius:50%;border:none;background:rgba(0,0,0,.15);backdrop-filter:blur(10px);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">${state.musicPlaying?'🔊':'🔇'}</button>`;
}
function bindMusicToggle() {
const b=document.getElementById(‘musicToggle’);
if(b) b.onclick=e=>{e.stopPropagation();MusicPlayer.toggle();b.textContent=state.musicPlaying?‘🔊’:‘🔇’;};
}
function showLearningMoment() {
const f=getLearningFact();
const ov=document.createElement(‘div’); ov.className=‘modal-overlay’;
ov.innerHTML=`<div class="modal-box" style="text-align:center"><div style="font-size:48px">${f.emoji}</div><h2 style="font-size:18px;font-weight:800;color:var(--dark);margin-top:8px">💡 Did You Know?</h2><p style="font-family:var(--font-body);font-size:14px;color:var(--gray);margin-top:12px;line-height:1.5">${f.fact}</p><div style="margin-top:16px;background:var(--light);border-radius:12px;padding:8px 12px;display:inline-block"><span style="font-size:12px;font-weight:700;color:var(--accent);font-family:var(--font-body)">+5 XP for learning!</span></div><button class="next-btn" style="width:100%;padding:14px;margin-top:16px" id="learnClose">Cool! 🧠</button></div>`;
document.body.appendChild(ov); VS.addXP(5);
ov.onclick=e=>{if(e.target===ov)ov.remove();};
document.getElementById(‘learnClose’).onclick=()=>ov.remove();
}

function bottomNav(active) {
return `<div class="bottom-nav">
<button class="bnav-btn ${active==='home'?'active':''}" data-nav="home"><span class="bnav-icon">🏠</span><span class="bnav-label">Home</span></button>
<button class="bnav-btn ${active==='leaderboard'?'active':''}" data-nav="leaderboard"><span class="bnav-icon">🏆</span><span class="bnav-label">Ranks</span></button>
<button class="bnav-btn ${active==='stats'?'active':''}" data-nav="stats"><span class="bnav-icon">📊</span><span class="bnav-label">Stats</span></button>
<button class="bnav-btn ${active==='profile'?'active':''}" data-nav="profile"><span class="bnav-icon">👤</span><span class="bnav-label">Profile</span></button>

  </div>`;
}
function bindNav() { $$('.bnav-btn').forEach(b=>b.onclick=()=>{state.screen=b.dataset.nav;render();}); }

// === Splash ===
function renderSplash() {
app.innerHTML=`<div class="splash"><div class="splash-icon">⚡</div><h1 class="splash-title">VERSUS</h1><p class="splash-sub">Pick a side. See where you stand.</p><div class="splash-loader"></div></div>`;
loadDailyQuestions();
setTimeout(()=>{
if (!VS.get(‘onboarded’)){state.screen=‘onboard’;render();return;}
const cb=checkComebackReward(), ls=VS.get(‘comebackShown’)||0;
state.screen=state.region?‘home’:‘region’; render();
if(cb&&Date.now()-ls>86400000) setTimeout(()=>showComebackModal(cb),500);
},2200);
}

// === Onboarding ===
function renderOnboard() {
const step=state.onboardStep||0;
const steps=[
{emoji:‘⚡’,title:‘Welcome to Versus’,sub:‘The daily opinion game’,
body:`<div style="text-align:left;max-width:300px;margin:0 auto"><div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px"><span style="font-size:28px">🗳️</span><div><b style="color:#fff;font-size:15px">Pick a side</b><p style="color:rgba(255,255,255,.7);font-size:13px;margin-top:2px">Hot takes, debates, and spicy questions across 10+ categories</p></div></div><div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px"><span style="font-size:28px">🌍</span><div><b style="color:#fff;font-size:15px">See where the world stands</b><p style="color:rgba(255,255,255,.7);font-size:13px;margin-top:2px">Instantly see what % agree with you — globally</p></div></div><div style="display:flex;align-items:flex-start;gap:12px"><span style="font-size:28px">🏆</span><div><b style="color:#fff;font-size:15px">Level up & compete</b><p style="color:rgba(255,255,255,.7);font-size:13px;margin-top:2px">Earn XP, unlock badges, climb the leaderboard</p></div></div></div>`,
btn:“Let’s Go →”},
{emoji:‘🎯’,title:‘Make it yours’,sub:‘What topics interest you?’,
body:`<div style="text-align:left;max-width:300px;margin:0 auto"><p style="color:rgba(255,255,255,.75);font-size:13px;margin-bottom:16px">Pick your favorites to see them first:</p><div id="interestGrid" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${Object.keys(CATEGORIES).map(c=>`<button class="interest-tag" data-cat="${c}" style="padding:8px 14px;border-radius:20px;border:2px solid rgba(255,255,255,.3);background:transparent;color:#fff;font-size:13px;font-weight:700;font-family:var(--font-body);cursor:pointer;transition:all .2s">${c}</button>`).join('')}</div><p style="color:rgba(255,255,255,.5);font-size:11px;margin-top:12px;text-align:center">Tap any — or skip</p></div>`,
btn:“Start Playing ⚡”}
];
const s=steps[step];
app.innerHTML=`<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#FF6B35 0%,#FF3CAC 40%,#7B2FF7 70%,#00D4AA 100%);padding:40px 24px;text-align:center"> <div style="font-size:56px;margin-bottom:8px">${s.emoji}</div><h1 style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-1px">${s.title}</h1> <p style="color:rgba(255,255,255,.85);font-size:14px;font-family:var(--font-body);margin:6px 0 24px">${s.sub}</p>${s.body} <button id="onboardNext" style="margin-top:28px;padding:16px 48px;border:none;border-radius:20px;background:#fff;color:var(--dark);font-size:16px;font-weight:800;font-family:var(--font-display);cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.15)">${s.btn}</button> <div style="display:flex;gap:8px;margin-top:20px">${steps.map((_,i)=>`<div style="width:${i===step?'24px':'8px'};height:8px;border-radius:4px;background:${i===step?'#fff':'rgba(255,255,255,.3)'};transition:all .3s"></div>`).join(’’)}</div>
${step>0?’<button id="onboardBack" style="margin-top:12px;background:none;border:none;color:rgba(255,255,255,.6);font-size:13px;font-family:var(--font-body);cursor:pointer">← Back</button>’:’’}

  </div>`;
  if(step===1){const sel=new Set();$$('.interest-tag').forEach(t=>t.onclick=()=>{const c=t.dataset.cat;if(sel.has(c)){sel.delete(c);t.style.background='transparent';t.style.borderColor='rgba(255,255,255,.3)';}else{sel.add(c);t.style.background='rgba(255,255,255,.25)';t.style.borderColor='#fff';}});}
  document.getElementById('onboardNext').onclick=()=>{if(step<steps.length-1){state.onboardStep=step+1;render();}else{VS.set('onboarded',true);state.screen='region';render();}};
  const back=document.getElementById('onboardBack');
  if(back) back.onclick=()=>{state.onboardStep=step-1;render();};
}

// === Region ===
function renderRegionSelect() {
const regions=getRegionKeys();
app.innerHTML=`<div class="home"><div class="home-header"><h1>⚡ VERSUS</h1><p>Where in the world are you?</p></div> <div style="padding:24px 20px 0"><h2 class="section-title">Pick Your Region</h2> <p style="font-family:var(--font-body);font-size:13px;color:var(--gray);margin:-8px 0 16px 4px">Get local debates + all global questions</p> <div class="cat-grid">${regions.map((r,i)=>`<button class="cat-card" style="background:${CG[i%CG.length]};animation:fadeIn .4s ease-out ${i*.06}s both" data-region="${r}"><div class="emoji" style="font-size:36px">${r.split(’ ‘)[0]}</div><div class="name">${r.split(’ ‘).slice(1).join(’ ‘)}</div><div class="count">10 local Qs</div></button>`).join('')}</div></div> <div style="padding:20px;text-align:center"><button id="skipRegion" style="background:none;border:none;font-family:var(--font-body);font-size:14px;color:var(--gray);cursor:pointer;text-decoration:underline;padding:12px">Skip — global only</button></div></div>`;
$$(’.cat-card’).forEach(b=>b.onclick=()=>{state.region=b.dataset.region;VS.set(‘region’,state.region);const p=VS.getProfile();p.regionsPlayed=(p.regionsPlayed||0)+1;VS.set(‘profile’,p);state.screen=‘home’;render();});
document.getElementById(‘skipRegion’).onclick=()=>{state.region=‘global’;VS.set(‘region’,‘global’);state.screen=‘home’;render();};
}

// === Home ===
function renderHome() {
const p=VS.getProfile(),lp=VS.getLevelProgress(),daily=VS.getDailyStatus(),ce=Object.entries(CATEGORIES);
const totalQs=state.region&&state.region!==‘global’?ALL_QUESTIONS.length+getRegionalQuestions(state.region).length:ALL_QUESTIONS.length;
const rb=state.region&&state.region!==‘global’?`<div style="display:flex;justify-content:center;margin-top:10px"><button id="changeRegion" style="background:rgba(255,255,255,.2);border:none;border-radius:20px;padding:5px 14px;color:#fff;font-size:12px;font-family:var(--font-body);font-weight:600;cursor:pointer">${state.region.split(' ')[0]} ${state.region.split(' ').slice(1).join(' ')} · Change</button></div>`:’’;
const rc=state.region&&state.region!==‘global’?`<button class="cat-card" style="background:linear-gradient(135deg,#1A1A2E,#3D3D5C);animation:fadeIn .4s ease-out ${ce.length*.06}s both;grid-column:1/-1" data-cat="${state.region}" data-regional="true"><div style="display:flex;align-items:center;gap:12px"><div class="emoji" style="font-size:36px">${state.region.split(' ')[0]}</div><div><div class="name" style="font-size:16px">${state.region.split(' ').slice(1).join(' ')} Edition</div><div class="count">${getRegionalQuestions(state.region).length} local debates</div></div></div></button>`:’’;
const uname=p.username?`<div style="font-size:12px;color:rgba(255,255,255,.7);font-family:var(--font-body);margin-top:4px">@${p.username}</div>`:`<button id="setNameBtn" style="margin-top:6px;background:rgba(255,255,255,.25);border:none;border-radius:12px;padding:4px 14px;color:#fff;font-size:11px;font-weight:700;font-family:var(--font-body);cursor:pointer">Set Username</button>`;

app.innerHTML=`${musicToggleHTML()}<div class="home" style="padding-bottom:80px"> <div class="home-header"><h1>⚡ VERSUS</h1><p>Pick a side. See where the world stands.</p>${uname} <div class="level-card"><div class="level-top"><span class="level-badge">${p.levelEmoji} ${p.levelName}</span><span class="level-label">Lv.${p.level}</span></div> <div class="xp-bar-track"><div class="xp-bar-fill" style="width:${lp.progress}%"></div></div> <div class="xp-bar-label">${lp.label} to next level</div></div> <div class="stats-row"><div class="stat-pill">🗳 ${p.totalVotes}</div><div class="stat-pill">🔥 ${p.streak} streak</div><div class="stat-pill">⭐ ${p.xp} XP</div></div>${rb}</div> <div style="padding:24px 20px 0"><button class="daily-btn" id="playAll"><div class="label">⚡ TODAY'S MIX</div><div class="title">Play All Categories</div><div class="desc">${daily.freeLeft} free left · ${totalQs} total</div><div class="arrow">→</div></button></div> <div style="padding:16px 20px 0;display:flex;gap:10px;flex-wrap:wrap"> <button class="nav-pill" id="goDaily" style="flex:none">📋 Daily 5</button> <button class="nav-pill" id="goTrending" style="flex:none;background:linear-gradient(135deg,#FF3CAC,#FF6B35);color:#fff;border-color:transparent">🔥 Trending</button> <button class="nav-pill" id="goRecap" style="flex:none;border-color:var(--secondary);color:var(--secondary)">📊 Weekly Recap</button> </div> <div style="padding:20px 20px 0"><h2 class="section-title">Categories</h2> <div class="cat-grid">${ce.map(([c,qs],i)=>`<button class="cat-card" style="background:${CG[i%CG.length]};animation:fadeIn .4s ease-out ${i*.06}s both" data-cat="${c}"><div class="emoji">${c.split(’ ‘)[0]}</div><div class="name">${c.split(’ ‘).slice(1).join(’ ’)}</div><div class="count">${qs.length} Qs</div></button>`).join('')}${rc}</div></div> <div class="footer">© 2026 Versus</div> ${bottomNav('home')}</div>`;

document.getElementById(‘playAll’).onclick=()=>startGame(‘all’);
document.getElementById(‘goDaily’).onclick=()=>startGame(‘daily5’);
document.getElementById(‘goTrending’).onclick=()=>startGame(‘trending’);
document.getElementById(‘goRecap’).onclick=()=>{state.screen=‘recap’;render();};
$$(’.cat-card’).forEach(b=>b.onclick=()=>{b.dataset.regional===‘true’?startGame(‘regional’):startGame(b.dataset.cat);});
const cr=document.getElementById(‘changeRegion’);if(cr)cr.onclick=()=>{state.screen=‘region’;render();};
const sn=document.getElementById(‘setNameBtn’);if(sn)sn.onclick=showUsernameModal;
let taps=0;const ft=document.querySelector(’.footer’);
if(ft)ft.onclick=()=>{taps++;if(taps>=5)window.location.href=‘admin.html’;setTimeout(()=>{taps=0;},3000);};
bindNav();bindMusicToggle();
setTimeout(showNotificationPrompt,2000);
}

// === Username Modal ===
function showUsernameModal() {
const ov=document.createElement(‘div’);ov.className=‘modal-overlay’;
ov.innerHTML=`<div class="modal-box"><div style="font-size:40px">👤</div><h2 style="font-size:20px;font-weight:800;color:var(--dark);margin-top:8px">Claim Your Spot</h2><p style="font-family:var(--font-body);font-size:13px;color:var(--gray);margin-top:4px">Pick a username for the leaderboard</p><input class="modal-input" id="unameInput" placeholder="YourName" maxlength="20" autocomplete="off"><button class="next-btn" style="width:100%;padding:14px" id="saveUname">Save</button><button style="background:none;border:none;color:var(--gray);font-size:13px;font-family:var(--font-body);cursor:pointer;margin-top:12px" id="skipUname">Skip</button></div>`;
document.body.appendChild(ov);
ov.onclick=e=>{if(e.target===ov)ov.remove();};
document.getElementById(‘skipUname’).onclick=()=>ov.remove();
document.getElementById(‘saveUname’).onclick=()=>{const n=document.getElementById(‘unameInput’).value.trim();if(n.length>=2){VS.setUsername(n);ov.remove();render();}};
document.getElementById(‘unameInput’).focus();
}

// === Leaderboard ===
function renderLeaderboard() {
const p=VS.getProfile(),tab=state.lbTab||‘xp’;
const fu=[{name:‘VoteMaster99’,xp:4200,level:7,ln:‘Versus Elite’,streak:12,votes:380},{name:‘HotTakeQueen’,xp:3100,level:7,ln:‘Versus Elite’,streak:8,votes:290},{name:‘DebateLord’,xp:2400,level:6,ln:‘Influence Lord’,streak:15,votes:210},{name:‘OpinionKing’,xp:1800,level:5,ln:‘Trend Setter’,streak:6,votes:160},{name:‘ContrarianX’,xp:1200,level:4,ln:‘Debate Bro’,streak:4,votes:110},{name:‘CasualVoter’,xp:600,level:3,ln:‘Hot Taker’,streak:3,votes:55}];
const me={name:p.username||‘You’,xp:p.xp,level:p.level,ln:p.levelName,streak:p.bestStreak,votes:p.totalVotes,isMe:true};
const all=[…fu,me].sort((a,b)=>tab===‘streak’?b.streak-a.streak:tab===‘votes’?b.votes-a.votes:b.xp-a.xp);
const rows=all.map((u,i)=>{const rk=i+1,md=rk===1?‘🥇’:rk===2?‘🥈’:rk===3?‘🥉’:rk;const vl=tab===‘xp’?u.xp+’ XP’:tab===‘streak’?‘🔥 ‘+u.streak:u.votes;return`<div class="lb-row ${u.isMe?'me':''} ${rk<=3?'top3':''}"><div class="lb-rank">${md}</div><div class="lb-info"><div class="lb-name">${u.name}${u.isMe?' (you)':''}</div><div class="lb-detail">Lv.${u.level} · ${u.ln}</div></div><div class="lb-xp">${vl}</div></div>`;}).join(’’);
app.innerHTML=`${musicToggleHTML()}<div class="game" style="background:var(--bg)"><div class="top-bar"><div style="font-weight:800;font-size:18px;color:var(--dark)">🏆 Leaderboard</div></div> <div style="display:flex;gap:6px;padding:8px 20px"><button class="lb-tab ${tab==='xp'?'active':''}" data-tab="xp">⭐ XP</button><button class="lb-tab ${tab==='streak'?'active':''}" data-tab="streak">🔥 Streak</button><button class="lb-tab ${tab==='votes'?'active':''}" data-tab="votes">🗳 Votes</button></div> <div style="padding:8px 20px;overflow-y:auto;flex:1;padding-bottom:80px">${rows}</div> ${!p.username?'<div style="padding:12px 20px"><button class="next-btn" style="width:100%;padding:14px" id="lbSetName">Set Username to Claim Your Rank</button></div>':''} ${bottomNav('leaderboard')}</div>`;
$$(’.lb-tab’).forEach(t=>t.onclick=()=>{state.lbTab=t.dataset.tab;render();});
const lsn=document.getElementById(‘lbSetName’);if(lsn)lsn.onclick=showUsernameModal;
bindNav();bindMusicToggle();
}

// === Profile ===
function renderProfile() {
const p=VS.getProfile(),lp=VS.getLevelProgress();
app.innerHTML=`${musicToggleHTML()}<div class="game" style="background:var(--bg)"><div style="padding:16px 20px;overflow-y:auto;flex:1;padding-bottom:80px"> <div style="background:linear-gradient(135deg,#FF6B35,#FF3CAC,#7B2FF7);border-radius:24px;padding:24px;text-align:center;margin-bottom:20px"> <div style="font-size:48px">${p.levelEmoji}</div><div style="font-size:22px;font-weight:800;color:#fff;margin-top:4px">${p.username||'Anonymous'}</div> <div style="font-size:13px;color:rgba(255,255,255,.8);font-family:var(--font-body)">${p.levelName} · Level ${p.level}</div> <div style="background:rgba(255,255,255,.2);border-radius:20px;height:8px;margin:12px 20px 0;overflow:hidden"><div style="height:100%;width:${lp.progress}%;background:#fff;border-radius:20px"></div></div> <div style="font-size:11px;color:rgba(255,255,255,.7);font-family:var(--font-body);margin-top:6px">${lp.label}</div> <button style="margin-top:12px;background:rgba(255,255,255,.25);border:none;border-radius:12px;padding:6px 16px;color:#fff;font-size:12px;font-weight:700;font-family:var(--font-body);cursor:pointer" id="editName">${p.username?'Edit Username':'Set Username'}</button> </div> <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px"> <div class="stat-card"><div class="stat-num">${p.totalVotes}</div><div class="stat-label">Votes</div></div> <div class="stat-card"><div class="stat-num">${p.xp}</div><div class="stat-label">XP</div></div> <div class="stat-card"><div class="stat-num">${p.bestStreak}</div><div class="stat-label">Best Streak</div></div> <div class="stat-card"><div class="stat-num">${p.majorityVotes||0}</div><div class="stat-label">Mainstream</div></div> <div class="stat-card"><div class="stat-num">${p.minorityVotes||0}</div><div class="stat-label">Contrarian</div></div> <div class="stat-card"><div class="stat-num">${p.categoriesPlayed||0}/10</div><div class="stat-label">Categories</div></div> </div> <button class="daily-btn" id="goRecapProfile" style="margin-bottom:12px"><div class="label">📊 WEEKLY RECAP</div><div class="title">See your voting personality</div><div class="desc">Patterns, style, and stats</div><div class="arrow">→</div></button> <div style="background:#fff;border-radius:20px;padding:16px;box-shadow:0 2px 12px rgba(0,0,0,.06)"> <h3 style="font-size:15px;font-weight:800;color:var(--dark);margin-bottom:12px">⚙️ Settings</h3> <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--light)"><span style="font-family:var(--font-body);font-size:14px;color:var(--dark)">🎵 Music</span><button id="toggleMusic" style="background:var(--accent);color:#fff;border:none;border-radius:12px;padding:4px 12px;font-size:12px;font-weight:700;font-family:var(--font-body);cursor:pointer">${state.musicPlaying?'🔊 On':'🔇 Off'}</button></div> <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0"><span style="font-family:var(--font-body);font-size:14px;color:var(--dark)">🌍 Region</span><button id="changeRegionP" style="background:var(--accent);color:#fff;border:none;border-radius:12px;padding:4px 12px;font-size:12px;font-weight:700;font-family:var(--font-body);cursor:pointer">${state.region?state.region.split(' ').slice(1).join(' ')||'Global':'Global'}</button></div> </div> </div>${bottomNav('profile')}</div>`;
document.getElementById(‘editName’).onclick=showUsernameModal;
document.getElementById(‘goRecapProfile’).onclick=()=>{state.screen=‘recap’;render();};
document.getElementById(‘toggleMusic’).onclick=()=>{MusicPlayer.toggle();render();};
document.getElementById(‘changeRegionP’).onclick=()=>{state.screen=‘region’;render();};
bindNav();bindMusicToggle();
}

// === Stats ===
function renderStats() {
const achs=VS.getAchievements(),ul=achs.filter(a=>a.unlocked),ll=achs.filter(a=>!a.unlocked);
app.innerHTML=`${musicToggleHTML()}<div class="game" style="background:var(--bg)"><div style="padding:16px 20px;overflow-y:auto;flex:1;padding-bottom:80px"> <h2 style="font-size:20px;font-weight:800;color:var(--dark);margin-bottom:16px">📊 Badges (${ul.length}/${achs.length})</h2> <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px"> ${ul.map(a=>`<div class="badge-card unlocked"><div style="font-size:28px">${a.emoji}</div><div class="badge-name">${a.name}</div><div class="badge-desc">${a.desc}</div></div>`).join('')} ${ll.map(a=>`<div class="badge-card locked"><div style="font-size:28px;filter:grayscale(1);opacity:.4">🔒</div><div class="badge-name" style="opacity:.5">${a.name}</div><div class="badge-desc" style="opacity:.4">${a.desc}</div></div>`).join('')} </div></div>${bottomNav('stats')}</div>`;
bindNav();bindMusicToggle();
}

// === GAME (ALL BUGS FIXED) ===
function renderGame() {
const q = state.questions[state.currentQ];
if (!q) { state.screen = ‘home’; render(); return; }
const p = VS.getProfile(), daily = VS.getDailyStatus();
const prog = ((state.currentQ + (state.showResults ? 1 : 0)) / state.questions.length) * 100;

// FIX: Only paywall when about to vote on NEW question, never when viewing results
if (!state.showResults && !state.selected && daily.shouldShowPaywall) { renderPaywall(); return; }
// FIX: Only show ad before voting starts on a fresh question
if (!state.showResults && !state.selected && !state.showAd && state.questionsAnsweredThisRound > 0 && state.questionsAnsweredThisRound % VERSUS_CONFIG.AD_EVERY_N_QUESTIONS === 0 && daily.shouldShowAd) { renderAdSlot(); return; }

// Check if already voted
const pv = VS.hasVoted(q.q);
if (pv && !state.selected) { state.selected = pv.side; state.showResults = true; }

let oA=‘option-btn a’, oB=‘option-btn b’, bA=’’, bB=’’, pA=’’, pB=’’, acts=’’, note=’’, xpT=’’, achT=’’, learnBtn=’’;
if (state.showResults) {
const c = VS.getVoteCounts(q.q, q.seed[0], q.seed[1]);
oA += ’ voted’+(state.selected===‘a’?’ selected’:’’);
oB += ’ voted’+(state.selected===‘b’?’ selected’:’’);
bA = `<div class="result-bar a" style="width:${c.a}%"></div>`;
bB = `<div class="result-bar b" style="width:${c.b}%"></div>`;
pA = `<span class="pct a">${c.a}%</span>`;
pB = `<span class="pct b">${c.b}%</span>`;
const wM = (c.a>c.b&&state.selected===‘a’)||(c.b>c.a&&state.selected===‘b’);
learnBtn = `<button class="learn-btn" id="learnBtn">💡 Did You Know?</button>`;
acts = `<div class="actions"><button class="share-btn" id="shareBtn">📤 Share</button><button class="next-btn" id="nextBtn">${state.currentQ<state.questions.length-1?'Next →':'🔄 Replay'}</button></div>`;
note = `<div class="result-note">${wM?"🎯 With the majority!":"😈 Against the grain! +15 XP"}</div>`;
}
if (state.xpPopup) xpT = `<div class="xp-toast">${state.xpPopup.leveledUp?`<div class="levelup-burst">🎉 LEVEL UP!</div><div style="font-size:18px;font-weight:800;color:#fff;margin-top:4px">${state.xpPopup.emoji} ${state.xpPopup.levelName}</div>`:`<span class="xp-amount">+${state.xpPopup.xp} XP</span>`}</div>`;
if (state.achievementPopup) achT = `<div class="achievement-toast"><div style="font-size:36px">${state.achievementPopup.emoji}</div><div style="font-weight:800;color:#fff;font-size:14px">Badge Unlocked!</div><div style="font-weight:700;color:var(--yellow);font-size:16px">${state.achievementPopup.name}</div><div style="font-size:12px;color:rgba(255,255,255,.7);font-family:var(--font-body)">${state.achievementPopup.desc} · +100 XP</div></div>`;

// FIX: Use proper category display name
const catDisplay = q.category || ‘General’;

app.innerHTML = `${musicToggleHTML()}<div class="game"><div class="top-bar"><button class="back-btn" id="backBtn">←</button><div class="top-right"><span class="streak-badge">🔥 ${p.streak}</span><span class="xp-badge">${p.levelEmoji} ${p.xp}</span><span class="q-counter">${state.currentQ+1}/${state.questions.length}</span></div></div> <div class="progress-track"><div class="progress-fill" style="width:${prog}%"></div></div> <div style="text-align:center;margin-top:16px"><span class="cat-pill">${catDisplay}</span></div> <div class="question-area"><h2 class="question-text">${q.q}</h2> <button class="${oA}" id="optA" ${state.showResults?'disabled':''}>${bA}<div class="option-inner"><span>${q.a}</span>${pA}</div></button> <div class="vs-divider">VS</div> <button class="${oB}" id="optB" ${state.showResults?'disabled':''}>${bB}<div class="option-inner"><span>${q.b}</span>${pB}</div></button> ${learnBtn}${acts}${note}</div>${xpT}${achT}</div>`;

// FIX: Use getElementById for reliable binding (never returns null for missing elements, just skips)
const backBtn = document.getElementById(‘backBtn’);
const optABtn = document.getElementById(‘optA’);
const optBBtn = document.getElementById(‘optB’);
const shareBtn = document.getElementById(‘shareBtn’);
const nextBtn = document.getElementById(‘nextBtn’);
const learnB = document.getElementById(‘learnBtn’);

if (backBtn) backBtn.onclick = () => { state.screen=‘home’; render(); };
if (!state.showResults) {
if (optABtn) optABtn.onclick = () => handleVote(‘a’);
if (optBBtn) optBBtn.onclick = () => handleVote(‘b’);
}
if (state.showResults) {
if (shareBtn) shareBtn.onclick = handleShare;
if (nextBtn) nextBtn.onclick = nextQuestion;
if (learnB) learnB.onclick = showLearningMoment;
}
if (state.xpPopup) setTimeout(()=>{state.xpPopup=null;},2000);
if (state.achievementPopup) setTimeout(()=>{state.achievementPopup=null;},3000);
bindMusicToggle();
}

// === Paywall ===
function renderPaywall() {
app.innerHTML=`<div class="game" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px"> <div style="font-size:64px;margin-bottom:16px">🔒</div><h2 style="font-size:24px;font-weight:800;color:var(--dark);margin-bottom:8px">Daily Limit Reached!</h2> <p style="font-family:var(--font-body);color:var(--gray);font-size:14px;margin-bottom:24px">Come back tomorrow or unlock more!</p> <button class="paywall-btn primary" id="pwShare">📤 Share to Unlock +${VERSUS_CONFIG.SHARE_UNLOCK_BONUS} Qs</button> <button class="paywall-btn ghost" id="pwHome">← Back to Home</button></div>`;
document.getElementById(‘pwShare’).onclick=()=>{shareApp();VS.addBonusQuestions(VERSUS_CONFIG.SHARE_UNLOCK_BONUS);VS.recordShare();state.screen=‘home’;render();};
document.getElementById(‘pwHome’).onclick=()=>{state.screen=‘home’;render();};
}

// === Ad Slot (FIXED: reliable button + auto-dismiss) ===
function renderAdSlot() {
state.showAd = true;
app.innerHTML=`<div class="game" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px"> <div class="ad-container"><div class="ad-label">SPONSORED</div><div style="font-size:48px;margin-bottom:12px">📢</div><p style="font-weight:700;color:var(--dark)">Ad Space Available</p><p style="font-family:var(--font-body);font-size:12px;color:var(--gray);margin-top:4px">Reach engaged opinion-havers</p></div> <button class="next-btn" style="margin-top:24px;width:100%;max-width:300px" id="adContinue">Continue →</button> <p style="font-size:11px;color:var(--gray);font-family:var(--font-body);margin-top:8px">Ad closes in 3s...</p></div>`;
const dismiss = () => { state.showAd = false; render(); };
document.getElementById(‘adContinue’).onclick = dismiss;
setTimeout(dismiss, 3000);
}

// === Share ===
function shareApp(customText) {
const text = customText || ‘⚡ VERSUS — the daily opinion game. Pick a side, see where you stand.\n\nPlay now 👉 ’ + APP_URL;
try { if(navigator.share){navigator.share({title:‘Versus ⚡’,text,url:APP_URL}).catch(()=>fallbackCopy(text));}else{fallbackCopy(text);} } catch(e){fallbackCopy(text);}
}
function fallbackCopy(text) {
try{navigator.clipboard.writeText(text+’\n’+APP_URL);}catch(e){const ta=document.createElement(‘textarea’);ta.value=text+’\n’+APP_URL;ta.style.position=‘fixed’;ta.style.opacity=‘0’;document.body.appendChild(ta);ta.select();document.execCommand(‘copy’);ta.remove();}
}

// === Game Logic ===
async function startGame(cat) {
state.activeCategory=cat; state.questionsAnsweredThisRound=0; state.gameStartTime=Date.now(); state.showAd=false;
let qs;

if (cat===‘all’||cat===‘daily5’||cat===‘trending’) {
const daily = await loadDailyQuestions();
if (cat===‘trending’) {
qs = daily&&daily.length>0 ? shuffleArray([…daily]) : shuffleArray([…ALL_QUESTIONS]).slice(0,10);
} else if (daily&&daily.length>0) {
const localQs = state.region&&state.region!==‘global’ ? getAllWithRegion(state.region) : […ALL_QUESTIONS];
if (cat===‘daily5’) { qs=shuffleArray([…daily.slice(0,3),…shuffleArray(localQs).slice(0,2)]); }
else { qs=[…shuffleArray(daily),…shuffleArray(localQs)]; }
} else {
if (cat===‘daily5’) { qs=shuffleArray(state.region&&state.region!==‘global’?getAllWithRegion(state.region):[…ALL_QUESTIONS]).slice(0,5); }
else { qs=shuffleArray(state.region&&state.region!==‘global’?getAllWithRegion(state.region):[…ALL_QUESTIONS]); }
}
}
else if (cat===‘regional’) { qs=shuffleArray(getRegionalQuestions(state.region)); }
else if (CATEGORIES[cat]) { qs=shuffleArray(CATEGORIES[cat].map(q=>({…q,category:cat}))); }
else { qs=shuffleArray([…ALL_QUESTIONS]); }

state.questions=qs; state.currentQ=0; state.selected=null; state.showResults=false; state.screen=‘game’;

// Auto-start music on first game
if (!MusicPlayer.isPlaying && VS.get(‘musicOn’)!==false && !VS.get(‘musicOff’)) MusicPlayer.start();
render();
}

function handleVote(side) {
if (state.selected) return;
state.selected=side; state.showResults=true; state.questionsAnsweredThisRound++;
const q=state.questions[state.currentQ], c=VS.getVoteCounts(q.q,q.seed[0],q.seed[1]);
const wM=(c.a>c.b&&side===‘a’)||(c.b>c.a&&side===‘b’);
VS.addGlobalVote(q.q,side);
const r=VS.saveVote(q.q,side,q.category,wM);
if(state.questionsAnsweredThisRound>=10){const el=(Date.now()-state.gameStartTime)/1000;if(el<60){const p=VS.getProfile();p.speedRounds=(p.speedRounds||0)+1;VS.set(‘profile’,p);}}
if(state.activeCategory===‘daily5’&&state.currentQ===state.questions.length-1){const p=VS.getProfile();p.dailiesCompleted=(p.dailiesCompleted||0)+1;VS.set(‘profile’,p);VS.addXP(XP_CONFIG.DAILY_COMPLETE);}
state.xpPopup=r.xpResult;
if(r.newAchievements.length>0) state.achievementPopup=r.newAchievements[0];
state.profile=VS.getProfile();
if(state.profile.totalVotes===10&&!state.profile.username) setTimeout(showUsernameModal,1500);
render();
}

function nextQuestion() {
if (state.currentQ<state.questions.length-1) { state.currentQ++; state.selected=null; state.showResults=false; }
else { if(state.activeCategory===‘daily5’){state.screen=‘home’;render();return;} startGame(state.activeCategory);return; }
render();
}

function handleShare() {
const q=state.questions[state.currentQ], c=VS.getVoteCounts(q.q,q.seed[0],q.seed[1]);
const myC=state.selected===‘a’?q.a:q.b, myP=state.selected===‘a’?c.a:c.b;
const text=‘⚡ VERSUS: “’+q.q+’”\n\nI picked “’+myC+’” — ‘+myP+’% agree with me!\n\nWhat would you pick? Play now 👉 ’+APP_URL;
const after=()=>{const na=VS.recordShare();const btn=document.getElementById(‘shareBtn’);if(btn){btn.textContent=‘✅ Shared!’;setTimeout(()=>{if(btn)btn.textContent=‘📤 Share’;},2000);}if(na.length>0){state.achievementPopup=na[0];render();}};
try{if(navigator.share){navigator.share({title:‘Versus ⚡’,text,url:APP_URL}).then(after).catch(()=>{fallbackCopy(text);after();});}else{fallbackCopy(text);after();}}catch(e){fallbackCopy(text);after();}
}

// === Router ===
function render() {
switch (state.screen) {
case ‘splash’: renderSplash(); break;
case ‘onboard’: renderOnboard(); break;
case ‘region’: renderRegionSelect(); break;
case ‘home’: renderHome(); break;
case ‘game’: renderGame(); break;
case ‘stats’: renderStats(); break;
case ‘leaderboard’: renderLeaderboard(); break;
case ‘profile’: renderProfile(); break;
case ‘recap’: renderWeeklyRecap(); break;
default: renderHome();
}
}

// Init music on first interaction if preference saved
if (VS.get(‘musicOn’)===true) document.addEventListener(‘click’,function m(){if(VS.get(‘musicOn’)===true&&!MusicPlayer.isPlaying)MusicPlayer.start();document.removeEventListener(‘click’,m);},{once:true});

render();
