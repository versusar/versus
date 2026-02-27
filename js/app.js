// === VERSUS — App v3: Gamified + Monetized ===

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const app = document.getElementById(‘app’);

let state = {
screen: ‘splash’,
questions: [],
currentQ: 0,
selected: null,
showResults: false,
activeCategory: ‘all’,
region: VersusStorage.get(‘region’) || null,
profile: VersusStorage.getProfile(),
xpPopup: null,     // { xp, leveledUp, levelName, emoji }
achievementPopup: null, // { name, emoji, desc }
showPaywall: false,
showAd: false,
gameStartTime: null,
questionsAnsweredThisRound: 0,
};

const CAT_GRADIENTS = [
‘linear-gradient(135deg, #FF6B35, #FF9A76)’, ‘linear-gradient(135deg, #7B2FF7, #B388FF)’,
‘linear-gradient(135deg, #00D4AA, #00F5D4)’, ‘linear-gradient(135deg, #FF3CAC, #FF85C8)’,
‘linear-gradient(135deg, #FFD93D, #FFE88A)’, ‘linear-gradient(135deg, #3A86FF, #83B4FF)’,
‘linear-gradient(135deg, #F72585, #FF5DA2)’, ‘linear-gradient(135deg, #FF9E00, #FFCA58)’,
‘linear-gradient(135deg, #8338EC, #C77DFF)’, ‘linear-gradient(135deg, #06D6A0, #73E8C4)’,
];

// =============================================
// SPLASH
// =============================================
function renderSplash() {
app.innerHTML = `<div class="splash"><div class="splash-icon">⚡</div><h1 class="splash-title">VERSUS</h1><p class="splash-sub">Pick a side. See where you stand.</p><div class="splash-loader"></div></div>`;
setTimeout(() => { state.screen = state.region ? ‘home’ : ‘region’; render(); }, 2200);
}

// =============================================
// REGION SELECT
// =============================================
function renderRegionSelect() {
const regions = getRegionKeys();
app.innerHTML = `<div class="home"> <div class="home-header"><h1>⚡ VERSUS</h1><p>Where in the world are you?</p></div> <div style="padding:24px 20px 0;"> <h2 class="section-title">Pick Your Region</h2> <p style="font-family:var(--font-body);font-size:13px;color:var(--gray);margin:-8px 0 16px 4px;">Get local debates + all global questions</p> <div class="cat-grid"> ${regions.map((r, i) =>`<button class="cat-card" style="background:${CAT_GRADIENTS[i % CAT_GRADIENTS.length]};animation:fadeIn .4s ease-out ${i * .06}s both;" data-region="${r}"><div class="emoji" style="font-size:36px;">${r.split(’ ‘)[0]}</div><div class="name">${r.split(’ ‘).slice(1).join(’ ‘)}</div><div class="count">10 local questions</div></button>`).join('')} </div> </div> <div style="padding:20px;text-align:center;"><button id="skipRegion" style="background:none;border:none;font-family:var(--font-body);font-size:14px;color:var(--gray);cursor:pointer;text-decoration:underline;padding:12px;">Skip — just global questions</button></div> <div class="footer">© 2026 Versus · All Rights Reserved</div> </div>`;
$$(’.cat-card’).forEach(b => b.addEventListener(‘click’, () => { state.region = b.dataset.region; VersusStorage.set(‘region’, state.region); const p = VersusStorage.getProfile(); p.regionsPlayed = (p.regionsPlayed||0)+1; VersusStorage.set(‘profile’, p); state.screen = ‘home’; render(); }));
$(’#skipRegion’).addEventListener(‘click’, () => { state.region = ‘global’; VersusStorage.set(‘region’, ‘global’); state.screen = ‘home’; render(); });
}

// =============================================
// HOME
// =============================================
function renderHome() {
const p = VersusStorage.getProfile();
const lp = VersusStorage.getLevelProgress();
const daily = VersusStorage.getDailyStatus();
const catEntries = Object.entries(CATEGORIES);
const totalQs = state.region && state.region !== ‘global’ ? ALL_QUESTIONS.length + getRegionalQuestions(state.region).length : ALL_QUESTIONS.length;

const regionBadge = state.region && state.region !== ‘global’ ? `<div style="display:flex;justify-content:center;margin-top:10px;"><button id="changeRegion" style="background:rgba(255,255,255,.2);border:none;border-radius:20px;padding:5px 14px;color:#fff;font-size:12px;font-family:var(--font-body);font-weight:600;cursor:pointer;">${state.region.split(' ')[0]} ${state.region.split(' ').slice(1).join(' ')} · Change</button></div>` : ‘’;

const regionalCard = state.region && state.region !== ‘global’ ? `<button class="cat-card" style="background:linear-gradient(135deg,#1A1A2E,#3D3D5C);animation:fadeIn .4s ease-out ${catEntries.length*.06}s both;grid-column:1/-1;" data-cat="${state.region}" data-regional="true"><div style="display:flex;align-items:center;gap:12px;"><div class="emoji" style="font-size:36px;">${state.region.split(' ')[0]}</div><div><div class="name" style="font-size:16px;">${state.region.split(' ').slice(1).join(' ')} Edition</div><div class="count">${getRegionalQuestions(state.region).length} local debates</div></div></div></button>` : ‘’;

app.innerHTML = `
<div class="home">
<div class="home-header">
<h1>⚡ VERSUS</h1>
<p>Pick a side. See where the world stands.</p>
<!-- LEVEL & XP BAR -->
<div class="level-card">
<div class="level-top">
<span class="level-badge">${p.levelEmoji} ${p.levelName}</span>
<span class="level-label">Lv.${p.level}</span>
</div>
<div class="xp-bar-track"><div class="xp-bar-fill" style="width:${lp.progress}%"></div></div>
<div class="xp-bar-label">${lp.label} to next level</div>
</div>
<!-- STATS ROW -->
<div class="stats-row">
<div class="stat-pill">🗳 ${p.totalVotes}</div>
<div class="stat-pill">🔥 ${p.streak} streak</div>
<div class="stat-pill">⭐ ${p.xp} XP</div>
</div>
${regionBadge}
</div>

```
  <!-- DAILY CHALLENGE -->
  <div style="padding:24px 20px 0;">
    <button class="daily-btn" id="playAll">
      <div class="label">⚡ TODAY'S MIX</div>
      <div class="title">Play All Categories</div>
      <div class="desc">${daily.freeLeft} free questions left today · ${totalQs} total</div>
      <div class="arrow">→</div>
    </button>
  </div>

  <!-- NAV BUTTONS -->
  <div style="padding:16px 20px 0;display:flex;gap:10px;">
    <button class="nav-pill" id="goStats">🏆 Stats & Badges</button>
    <button class="nav-pill" id="goDaily">📋 Daily 5</button>
  </div>

  <!-- CATEGORIES -->
  <div style="padding:20px 20px 0;">
    <h2 class="section-title">Categories</h2>
    <div class="cat-grid">
      ${catEntries.map(([cat, qs], i) => `<button class="cat-card" style="background:${CAT_GRADIENTS[i % CAT_GRADIENTS.length]};animation:fadeIn .4s ease-out ${i*.06}s both;" data-cat="${cat}"><div class="emoji">${cat.split(' ')[0]}</div><div class="name">${cat.split(' ').slice(1).join(' ')}</div><div class="count">${qs.length} Qs</div></button>`).join('')}
      ${regionalCard}
    </div>
  </div>

  <div class="footer">© 2026 Versus · All Rights Reserved</div>
</div>`;
```

// Events
$(’#playAll’).addEventListener(‘click’, () => startGame(‘all’));
$(’#goStats’).addEventListener(‘click’, () => { state.screen = ‘stats’; render(); });
$(’#goDaily’).addEventListener(‘click’, () => startGame(‘daily5’));
$$(’.cat-card’).forEach(b => b.addEventListener(‘click’, () => { b.dataset.regional === ‘true’ ? startGame(‘regional’) : startGame(b.dataset.cat); }));
const crb = document.getElementById(‘changeRegion’);
if (crb) crb.addEventListener(‘click’, () => { state.screen = ‘region’; render(); });
}

// =============================================
// STATS & ACHIEVEMENTS
// =============================================
function renderStats() {
const p = VersusStorage.getProfile();
const lp = VersusStorage.getLevelProgress();
const achievements = VersusStorage.getAchievements();
const unlocked = achievements.filter(a => a.unlocked);
const locked = achievements.filter(a => !a.unlocked);

app.innerHTML = `
<div class="game" style="background:var(--bg);">
<div class="top-bar">
<button class="back-btn" id="backBtn">←</button>
<div style="font-weight:800;font-size:16px;color:var(--dark);">Stats & Badges</div>
<div style="width:28px;"></div>
</div>

```
  <div style="padding:16px 20px;overflow-y:auto;flex:1;">
    <!-- Level Card -->
    <div style="background:linear-gradient(135deg,#FF6B35,#FF3CAC,#7B2FF7);border-radius:24px;padding:24px;text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">${p.levelEmoji}</div>
      <div style="font-size:22px;font-weight:800;color:#fff;margin-top:4px;">${p.levelName}</div>
      <div style="font-size:13px;color:rgba(255,255,255,.8);font-family:var(--font-body);">Level ${p.level}</div>
      <div style="background:rgba(255,255,255,.2);border-radius:20px;height:8px;margin:12px 20px 0;overflow:hidden;">
        <div style="height:100%;width:${lp.progress}%;background:#fff;border-radius:20px;transition:width .5s;"></div>
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,.7);font-family:var(--font-body);margin-top:6px;">${lp.label}</div>
    </div>

    <!-- Stats Grid -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;">
      <div class="stat-card"><div class="stat-num">${p.totalVotes}</div><div class="stat-label">Votes</div></div>
      <div class="stat-card"><div class="stat-num">${p.xp}</div><div class="stat-label">Total XP</div></div>
      <div class="stat-card"><div class="stat-num">${p.bestStreak}</div><div class="stat-label">Best Streak</div></div>
      <div class="stat-card"><div class="stat-num">${p.majorityVotes||0}</div><div class="stat-label">Mainstream</div></div>
      <div class="stat-card"><div class="stat-num">${p.minorityVotes||0}</div><div class="stat-label">Contrarian</div></div>
      <div class="stat-card"><div class="stat-num">${p.categoriesPlayed||0}/10</div><div class="stat-label">Categories</div></div>
    </div>

    <!-- Achievements -->
    <h3 style="font-size:16px;font-weight:800;color:var(--dark);margin-bottom:12px;">🏆 Badges (${unlocked.length}/${achievements.length})</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
      ${unlocked.map(a => `<div class="badge-card unlocked"><div style="font-size:28px;">${a.emoji}</div><div class="badge-name">${a.name}</div><div class="badge-desc">${a.desc}</div></div>`).join('')}
      ${locked.map(a => `<div class="badge-card locked"><div style="font-size:28px;filter:grayscale(1);opacity:.4;">🔒</div><div class="badge-name" style="opacity:.5;">${a.name}</div><div class="badge-desc" style="opacity:.4;">${a.desc}</div></div>`).join('')}
    </div>
  </div>
</div>`;
```

$(’#backBtn’).addEventListener(‘click’, () => { state.screen = ‘home’; render(); });
}

// =============================================
// GAME
// =============================================
function renderGame() {
const q = state.questions[state.currentQ];
if (!q) { state.screen = ‘home’; render(); return; }

const p = VersusStorage.getProfile();
const daily = VersusStorage.getDailyStatus();
const progress = ((state.currentQ + (state.showResults ? 1 : 0)) / state.questions.length) * 100;

// Check paywall
if (daily.shouldShowPaywall && !state.showResults) {
renderPaywall(); return;
}

// Check ad slot
if (daily.shouldShowAd && !state.showAd && !state.showResults && state.questionsAnsweredThisRound > 0 && state.questionsAnsweredThisRound % VERSUS_CONFIG.AD_EVERY_N_QUESTIONS === 0) {
renderAdSlot(); return;
}

// Previous vote check
const prevVote = VersusStorage.hasVoted(q.q);
if (prevVote && !state.selected) { state.selected = prevVote.side; state.showResults = true; }

let optAClass = ‘option-btn a’, optBClass = ‘option-btn b’;
let barA = ‘’, barB = ‘’, pctA = ‘’, pctB = ‘’, actions = ‘’, note = ‘’, xpToast = ‘’;

if (state.showResults) {
const counts = VersusStorage.getVoteCounts(q.q, q.seed[0], q.seed[1]);
optAClass += ’ voted’ + (state.selected === ‘a’ ? ’ selected’ : ‘’);
optBClass += ’ voted’ + (state.selected === ‘b’ ? ’ selected’ : ‘’);
barA = `<div class="result-bar a" style="width:${counts.a}%"></div>`;
barB = `<div class="result-bar b" style="width:${counts.b}%"></div>`;
pctA = `<span class="pct a">${counts.a}%</span>`;
pctB = `<span class="pct b">${counts.b}%</span>`;

```
const withMaj = (counts.a > counts.b && state.selected === 'a') || (counts.b > counts.a && state.selected === 'b');
actions = `<div class="actions"><button class="share-btn" id="shareBtn">📤 Share (+${VERSUS_CONFIG.SHARE_UNLOCK_BONUS} Qs)</button><button class="next-btn" id="nextBtn">${state.currentQ < state.questions.length - 1 ? 'Next →' : '🔄 Replay'}</button></div>`;
note = `<div class="result-note">${withMaj ? "🎯 With the majority!" : "😈 Against the grain! +15 XP"}</div>`;
```

}

// XP popup
if (state.xpPopup) {
xpToast = `<div class="xp-toast">${state.xpPopup.leveledUp ? `<div class="levelup-burst">🎉 LEVEL UP!</div><div style="font-size:18px;font-weight:800;color:#fff;margin-top:4px;">${state.xpPopup.emoji} ${state.xpPopup.levelName}</div>`:`<span class="xp-amount">+${state.xpPopup.xp} XP</span>`}</div>`;
}

// Achievement popup
let achToast = ‘’;
if (state.achievementPopup) {
achToast = `<div class="achievement-toast"><div style="font-size:36px;">${state.achievementPopup.emoji}</div><div style="font-weight:800;color:#fff;font-size:14px;">Badge Unlocked!</div><div style="font-weight:700;color:var(--yellow);font-size:16px;">${state.achievementPopup.name}</div><div style="font-size:12px;color:rgba(255,255,255,.7);font-family:var(--font-body);">${state.achievementPopup.desc} · +100 XP</div></div>`;
}

app.innerHTML = ` <div class="game"> <div class="top-bar"> <button class="back-btn" id="backBtn">←</button> <div class="top-right"> <span class="streak-badge">🔥 ${p.streak}</span> <span class="xp-badge">${p.levelEmoji} ${p.xp} XP</span> <span class="q-counter">${state.currentQ + 1}/${state.questions.length}</span> </div> </div> <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div> <div style="text-align:center;margin-top:16px;"><span class="cat-pill">${q.category}</span></div> <div class="question-area"> <h2 class="question-text">${q.q}</h2> <button class="${optAClass}" style="${state.showResults ? 'padding:20px;' : ''}" id="optA" ${state.showResults ? 'disabled' : ''}>${barA}<div class="option-inner"><span>${q.a}</span>${pctA}</div></button> <div class="vs-divider">VS</div> <button class="${optBClass}" style="${state.showResults ? 'padding:20px;' : ''}" id="optB" ${state.showResults ? 'disabled' : ''}>${barB}<div class="option-inner"><span>${q.b}</span>${pctB}</div></button> ${actions}${note} </div> ${xpToast}${achToast} </div>`;

// Events
$(’#backBtn’).addEventListener(‘click’, () => { state.screen = ‘home’; render(); });
if (!state.showResults) {
$(’#optA’).addEventListener(‘click’, () => handleVote(‘a’));
$(’#optB’).addEventListener(‘click’, () => handleVote(‘b’));
}
if (state.showResults) {
$(’#shareBtn’).addEventListener(‘click’, handleShare);
$(’#nextBtn’).addEventListener(‘click’, nextQuestion);
}

// Clear popups after display
if (state.xpPopup) setTimeout(() => { state.xpPopup = null; }, 2000);
if (state.achievementPopup) setTimeout(() => { state.achievementPopup = null; }, 3000);
}

// =============================================
// PAYWALL
// =============================================
function renderPaywall() {
app.innerHTML = `
<div class="game" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px;">
<div style="font-size:64px;margin-bottom:16px;">🔒</div>
<h2 style="font-size:24px;font-weight:800;color:var(--dark);margin-bottom:8px;">Daily Limit Reached!</h2>
<p style="font-family:var(--font-body);color:var(--gray);font-size:14px;margin-bottom:24px;">You’ve used your ${VERSUS_CONFIG.FREE_DAILY_QUESTIONS} free questions today. Come back tomorrow or unlock more!</p>

```
  <button class="paywall-btn primary" id="pwShare">📤 Share to Unlock +${VERSUS_CONFIG.SHARE_UNLOCK_BONUS} Questions (Free)</button>
  <button class="paywall-btn secondary" id="pwTip">☕ Tip $2 — Unlimited Today</button>
  <button class="paywall-btn secondary" id="pwPremium">⚡ Go Premium — Unlimited Forever</button>
  <button class="paywall-btn ghost" id="pwBack">← Back to Home</button>

  <p style="font-family:var(--font-body);color:var(--gray);font-size:11px;margin-top:24px;">Premium coming soon! For now, share to keep playing.</p>
</div>`;
```

$(’#pwShare’).addEventListener(‘click’, () => {
const text = `⚡ I'm playing VERSUS — daily opinion battles! Pick a side and see where you stand 👉`;
if (navigator.share) {
navigator.share({ title: ‘Versus ⚡’, text }).then(() => {
VersusStorage.addBonusQuestions(VERSUS_CONFIG.SHARE_UNLOCK_BONUS);
VersusStorage.recordShare();
render();
}).catch(() => {});
} else {
navigator.clipboard.writeText(text);
VersusStorage.addBonusQuestions(VERSUS_CONFIG.SHARE_UNLOCK_BONUS);
VersusStorage.recordShare();
render();
}
});
$(’#pwTip’).addEventListener(‘click’, () => { window.open(‘https://buymeacoffee.com/YOUR_USERNAME’, ‘_blank’); });
$(’#pwPremium’).addEventListener(‘click’, () => { window.open(‘https://buymeacoffee.com/YOUR_USERNAME’, ‘_blank’); });
$(’#pwBack’).addEventListener(‘click’, () => { state.screen = ‘home’; render(); });
}

// =============================================
// AD SLOT
// =============================================
function renderAdSlot() {
state.showAd = true;
app.innerHTML = ` <div class="game" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px;"> <!-- AD SLOT: Replace this with Google AdSense or your sponsor content --> <div class="ad-container"> <div class="ad-label">SPONSORED</div> <div class="ad-content"> <div style="font-size:48px;margin-bottom:12px;">📢</div> <p style="font-weight:700;color:var(--dark);font-size:16px;">Your Ad Here</p> <p style="font-family:var(--font-body);color:var(--gray);font-size:12px;margin-top:4px;">Contact us for sponsored placements</p> </div> </div> <button class="next-btn" style="margin-top:24px;width:100%;max-width:300px;" id="adContinue">Continue Playing →</button> <p style="font-family:var(--font-body);color:var(--gray);font-size:11px;margin-top:12px;">Ads help keep Versus free</p> </div>`;

$(’#adContinue’).addEventListener(‘click’, () => { state.showAd = false; render(); });
}

// =============================================
// GAME LOGIC
// =============================================
function startGame(category) {
state.activeCategory = category;
state.questionsAnsweredThisRound = 0;
state.gameStartTime = Date.now();
state.showAd = false;
let qs;
if (category === ‘daily5’) {
const all = state.region && state.region !== ‘global’ ? getAllWithRegion(state.region) : […ALL_QUESTIONS];
qs = shuffleArray(all).slice(0, 5);
} else if (category === ‘all’) {
qs = state.region && state.region !== ‘global’ ? shuffleArray(getAllWithRegion(state.region)) : shuffleArray(ALL_QUESTIONS);
} else if (category === ‘regional’) {
qs = shuffleArray(getRegionalQuestions(state.region));
} else if (CATEGORIES[category]) {
qs = shuffleArray(CATEGORIES[category].map(q => ({ …q, category })));
} else { qs = shuffleArray(ALL_QUESTIONS); }
state.questions = qs;
state.currentQ = 0;
state.selected = null;
state.showResults = false;
state.screen = ‘game’;
render();
}

function handleVote(side) {
if (state.selected) return;
state.selected = side;
state.showResults = true;
state.questionsAnsweredThisRound++;

const q = state.questions[state.currentQ];
const counts = VersusStorage.getVoteCounts(q.q, q.seed[0], q.seed[1]);
const withMajority = (counts.a > counts.b && side === ‘a’) || (counts.b > counts.a && side === ‘b’);

VersusStorage.addGlobalVote(q.q, side);
const result = VersusStorage.saveVote(q.q, side, q.category, withMajority);

// Speed demon check
if (state.questionsAnsweredThisRound >= 10) {
const elapsed = (Date.now() - state.gameStartTime) / 1000;
if (elapsed < 60) {
const p = VersusStorage.getProfile();
p.speedRounds = (p.speedRounds || 0) + 1;
VersusStorage.set(‘profile’, p);
}
}

// Daily challenge complete
if (state.activeCategory === ‘daily5’ && state.currentQ === state.questions.length - 1) {
const p = VersusStorage.getProfile();
p.dailiesCompleted = (p.dailiesCompleted || 0) + 1;
VersusStorage.set(‘profile’, p);
VersusStorage.addXP(XP_CONFIG.DAILY_COMPLETE, ‘daily’);
}

// Set popups
state.xpPopup = result.xpResult;
if (result.newAchievements.length > 0) {
state.achievementPopup = result.newAchievements[0];
}

state.profile = VersusStorage.getProfile();
render();
}

function nextQuestion() {
if (state.currentQ < state.questions.length - 1) {
state.currentQ++;
state.selected = null;
state.showResults = false;
} else {
if (state.activeCategory === ‘daily5’) { state.screen = ‘home’; render(); return; }
startGame(state.activeCategory); return;
}
render();
}

function handleShare() {
const q = state.questions[state.currentQ];
const counts = VersusStorage.getVoteCounts(q.q, q.seed[0], q.seed[1]);
const myChoice = state.selected === ‘a’ ? q.a : q.b;
const myPct = state.selected === ‘a’ ? counts.a : counts.b;
const text = `⚡ VERSUS: "${q.q}"\n\nI picked "${myChoice}" — ${myPct}% agree!\n\nPlay now 👉`;

const afterShare = () => {
const newAch = VersusStorage.recordShare();
const btn = $(’#shareBtn’);
if (btn) { btn.textContent = `✅ +${VERSUS_CONFIG.SHARE_UNLOCK_BONUS} Qs Unlocked!`; setTimeout(() => { if (btn) btn.textContent = ‘📤 Share’; }, 2000); }
if (newAch.length > 0) { state.achievementPopup = newAch[0]; render(); }
};

if (navigator.share) {
navigator.share({ title: ‘Versus ⚡’, text }).then(afterShare).catch(() => {});
} else {
navigator.clipboard.writeText(text).then(afterShare);
}
}

// =============================================
// ROUTER
// =============================================
function render() {
switch (state.screen) {
case ‘splash’: renderSplash(); break;
case ‘region’: renderRegionSelect(); break;
case ‘home’: renderHome(); break;
case ‘game’: renderGame(); break;
case ‘stats’: renderStats(); break;
default: renderHome();
}
}

render();
