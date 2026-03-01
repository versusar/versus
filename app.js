// © 2026 VersuAR. All Rights Reserved.
// Unauthorized copying, modification, or distribution is strictly prohibited.

// === VERSUS — Full App Logic ===
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const app = document.getElementById('app');
const APP_URL = 'https://versusar.github.io/versus/';

let state;

const CG = [
  'linear-gradient(135deg,#FF6B35,#FF9A76)', 'linear-gradient(135deg,#7B2FF7,#B388FF)',
  'linear-gradient(135deg,#00D4AA,#00F5D4)', 'linear-gradient(135deg,#FF3CAC,#FF85C8)',
  'linear-gradient(135deg,#FFD93D,#FFE88A)', 'linear-gradient(135deg,#3A86FF,#83B4FF)',
  'linear-gradient(135deg,#F72585,#FF5DA2)', 'linear-gradient(135deg,#FF9E00,#FFCA58)',
  'linear-gradient(135deg,#8338EC,#C77DFF)', 'linear-gradient(135deg,#06D6A0,#73E8C4)'
];

function initApp() {
  state = {
    screen: 'splash', 
    questions: [], 
    currentQ: 0, 
    selected: null, 
    showResults: false,
    activeCategory: 'all', 
    region: VS.get('region') || null, 
    profile: VS.getProfile(),
    xpPopup: null, 
    achievementPopup: null, 
    showAd: false,
    gameStartTime: null, 
    questionsAnsweredThisRound: 0, 
    lbTab: 'xp',
    onboardStep: 0
  };
  render();
}

// === Bottom Nav ===
function bottomNav(active) {
  return `<div class="bottom-nav">
    <button class="bnav-btn ${active === 'home' ? 'active' : ''}" data-nav="home"><span class="bnav-icon">🏠</span><span class="bnav-label">Home</span></button>
    <button class="bnav-btn ${active === 'leaderboard' ? 'active' : ''}" data-nav="leaderboard"><span class="bnav-icon">🏆</span><span class="bnav-label">Ranks</span></button>
    <button class="bnav-btn ${active === 'stats' ? 'active' : ''}" data-nav="stats"><span class="bnav-icon">📊</span><span class="bnav-label">Stats</span></button>
    <button class="bnav-btn ${active === 'profile' ? 'active' : ''}" data-nav="profile"><span class="bnav-icon">👤</span><span class="bnav-label">Profile</span></button>
  </div>`;
}

function bindNav() {
  $$('.bnav-btn').forEach(b => b.addEventListener('click', () => { state.screen = b.dataset.nav; render(); }));
}

// === Splash ===
function renderSplash() {
  app.innerHTML = `<div class="splash"><div class="splash-icon">⚡</div><h1 class="splash-title">VERSUS</h1><p class="splash-sub">Pick a side. See where you stand.</p><div class="splash-loader"></div></div>`;
  const isNew = !VS.get('onboarded');
  setTimeout(() => {
    if (isNew) { state.screen = 'onboard'; }
    else { state.screen = state.region ? 'home' : 'region'; }
    render();
  }, 2200);
}

// === Onboarding ===
function renderOnboard() {
  const step = state.onboardStep || 0;
  const steps = [
    {
      emoji: '⚡',
      title: 'Welcome to Versus',
      sub: 'The daily opinion game',
      body: `<div style="text-align:left;max-width:300px;margin:0 auto;">
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px;"><span style="font-size:28px;">🗳️</span><div><b style="color:#fff;font-size:15px;">Pick a side</b><p style="color:rgba(255,255,255,.7);font-size:13px;margin-top:2px;">Hot takes, debates, and spicy questions across 10+ categories</p></div></div>
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px;"><span style="font-size:28px;">🌍</span><div><b style="color:#fff;font-size:15px;">See where the world stands</b><p style="color:rgba(255,255,255,.7);font-size:13px;margin-top:2px;">Instantly see what % of people agree with you — globally</p></div></div>
        <div style="display:flex;align-items:flex-start;gap:12px;"><span style="font-size:28px;">🏆</span><div><b style="color:#fff;font-size:15px;">Level up & compete</b><p style="color:rgba(255,255,255,.7);font-size:13px;margin-top:2px;">Earn XP, unlock badges, climb the leaderboard, flex your streak</p></div></div>
      </div>`,
      btn: "Let's Go →"
    },
    {
      emoji: '🎯',
      title: 'Make it yours',
      sub: 'What topics interest you?',
      body: `<div style="text-align:left;max-width:300px;margin:0 auto;">
        <p style="color:rgba(255,255,255,.75);font-size:13px;margin-bottom:16px;">Pick your favorites to see them first:</p>
        <div id="interestGrid" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">
          ${Object.keys(CATEGORIES).map(c => `<button class="interest-tag" data-cat="${c}">${c}</button>`).join('')}
        </div>
      </div>`,
      btn: "Start Playing ⚡"
    }
  ];

  const s = steps[step];
  app.innerHTML = `<div class="onboard-container" style="background:var(--grad-a); min-height:100vh; padding:40px 24px; text-align:center; color:white;">
    <div style="font-size:56px;margin-bottom:8px;">${s.emoji}</div>
    <h1 style="font-family:var(--font-display); font-size:28px;">${s.title}</h1>
    <p style="margin:6px 0 24px;">${s.sub}</p>
    ${s.body}
    <button id="onboardNext" class="paywall-btn primary" style="margin-top:28px;">${s.btn}</button>
  </div>`;

  $('#onboardNext').addEventListener('click', () => {
    if (step < steps.length - 1) { state.onboardStep = step + 1; render(); }
    else { VS.set('onboarded', true); state.screen = 'region'; render(); }
  });
}

// === OPTIMIZED: Region Select ===
function renderRegionSelect() {
  const regions = getRegionKeys();
  app.innerHTML = `<div class="home"><div class="home-header"><h1>⚡ VERSUS</h1><p>Where in the world are you?</p></div>
    <div class="cat-grid" style="padding:24px;">
      ${regions.map((r, i) => `
        <button class="cat-card" style="background:${CG[i % CG.length]}" data-region="${r}">
          <div class="emoji">${r.split(' ')[0]}</div>
          <div class="name">${r.split(' ').slice(1).join(' ')}</div>
        </button>`).join('')}
    </div>
    <div style="text-align:center; margin-bottom: 20px;">
      <button id="skipRegion" style="color:var(--gray);background:none;border:none;text-decoration:underline;cursor:pointer;">Skip — Global Only</button>
    </div></div>`;
  
  $$('.cat-card').forEach(b => b.addEventListener('click', () => {
    state.region = b.dataset.region; 
    VS.set('region', state.region);
    state.screen = 'home'; 
    render();
  }));
  $('#skipRegion').addEventListener('click', () => { 
    state.region = 'global'; 
    VS.set('region', 'global'); 
    state.screen = 'home'; 
    render(); 
  });
}

// === Home ===
function renderHome() {
  const p = VS.getProfile(), lp = VS.getLevelProgress(), ce = Object.entries(CATEGORIES);
  const regionLabel = state.region && state.region !== 'global' ? state.region : 'Global';
  
  // Dynamic pool count for 'Play All'
  const totalQs = (state.region && state.region !== 'global') 
    ? ALL_QUESTIONS.length + getRegionalQuestions(state.region).length 
    : ALL_QUESTIONS.length;
  
  app.innerHTML = `<div class="home" style="padding-bottom:100px;">
    <div class="home-header">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h1>⚡ VERSUS</h1>
        <button id="changeRegion" style="font-size:12px; background:rgba(255,255,255,0.1); border:none; color:white; padding:4px 8px; border-radius:10px;">📍 ${regionLabel}</button>
      </div>
      <div class="level-card">
        <div class="level-top"><span class="level-badge">${p.levelEmoji} ${p.levelName}</span><span class="level-label">Lv.${p.level}</span></div>
        <div class="xp-bar-track"><div class="xp-bar-fill" style="width:${lp.progress}%"></div></div>
        <div class="xp-bar-label">${lp.label} to next level</div>
      </div>
      <div class="stats-row"><div class="stat-pill">🗳 ${p.totalVotes}</div><div class="stat-pill">🔥 ${p.streak} streak</div><div class="stat-pill">⭐ ${p.xp} XP</div></div>
    </div>
    <div style="padding:20px;">
      <button class="daily-btn" id="playAll"><div class="title">⚡ Play All Categories</div><div class="desc">${totalQs} total questions</div></button>
      <div class="cat-grid" style="margin-top:20px;">
        ${ce.map(([c, qs], i) => `<button class="cat-card" style="background:${CG[i % CG.length]}" data-cat="${c}"><div class="emoji">${c.split(' ')[0]}</div><div class="name">${c.split(' ').slice(1).join(' ')}</div></button>`).join('')}
      </div>
    </div>
    <div class="footer" style="padding:40px; text-align:center; opacity:0.4;">© 2026 Versus</div>
    ${bottomNav('home')}</div>`;

  $('#playAll').addEventListener('click', () => startGame('all'));
  $('#changeRegion').addEventListener('click', () => { state.screen = 'region'; render(); });
  $$('.cat-card').forEach(b => b.addEventListener('click', () => startGame(b.dataset.cat)));
  
  let taps = 0;
  $('.footer').addEventListener('click', () => {
    taps++;
    if (taps >= 5) window.location.href = 'admin.html';
    setTimeout(() => taps = 0, 3000);
  });
  bindNav();
}

// === Game ===
function renderGame() {
  const q = state.questions[state.currentQ];
  if (!q) { state.screen = 'home'; render(); return; }
  const c = VS.getVoteCounts(q.q, q.seed[0], q.seed[1]);
  const prog = ((state.currentQ + (state.showResults ? 1 : 0)) / state.questions.length) * 100;

  app.innerHTML = `<div class="game">
    <div class="top-bar">
      <button onclick="state.screen='home';render();" style="border:none;background:none;font-size:24px;">←</button>
      <div class="top-right"><span class="streak-badge">🔥 ${state.profile.streak}</span><span class="q-counter">${state.currentQ + 1}/${state.questions.length}</span></div>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:${prog}%"></div></div>
    <div class="question-area">
      <span class="cat-pill">${q.category}</span>
      <h2 class="question-text">${q.q}</h2>
      <button class="option-btn a ${state.selected === 'a' ? 'selected' : ''}" id="optA" ${state.showResults ? 'disabled' : ''}>
        <div class="result-bar a" style="width:${state.showResults ? c.a : 0}%"></div>
        <div class="option-inner"><span>${q.a}</span> ${state.showResults ? `<b>${c.a}%</b>` : ''}</div>
      </button>
      <button class="option-btn b ${state.selected === 'b' ? 'selected' : ''}" id="optB" ${state.showResults ? 'disabled' : ''}>
        <div class="result-bar b" style="width:${state.showResults ? c.b : 0}%"></div>
        <div class="option-inner"><span>${q.b}</span> ${state.showResults ? `<b>${c.b}%</b>` : ''}</div>
      </button>
      ${state.showResults ? `<div class="actions">
        <button class="share-btn" id="shareBtn">📤 Share</button>
        <button class="next-btn" id="nextBtn">Next →</button>
      </div>` : ''}
    </div>
    ${state.xpPopup ? `<div class="xp-toast">+${state.xpPopup.xp} XP</div>` : ''}
  </div>`;

  if (!state.showResults) {
    $('#optA').addEventListener('click', () => handleVote('a'));
    $('#optB').addEventListener('click', () => handleVote('b'));
  } else {
    $('#shareBtn').addEventListener('click', handleShare);
    $('#nextBtn').addEventListener('click', nextQuestion);
  }
}

// === Leaderboard ===
function renderLeaderboard() {
  const p = VS.getProfile();
  app.innerHTML = `<div class="game" style="padding:20px;">
    <div class="top-bar"><h1 style="font-family:var(--font-display);">🏆 Leaderboard</h1></div>
    <div class="lb-row me" style="background:white; padding:20px; border-radius:15px; display:flex; justify-content:space-between; margin-top:20px; border:2px solid var(--primary);">
      <div class="lb-info">
        <div class="lb-name">${p.username || 'You (Anonymous)'}</div>
        <div class="lb-detail">${p.levelName} · Level ${p.level}</div>
      </div>
      <div class="lb-xp">${p.xp} XP</div>
    </div>
    <div style="text-align:center; margin-top:40px; color:var(--gray); font-family:var(--font-body);">Global rankings coming in next update!</div>
    ${bottomNav('leaderboard')}</div>`;
  bindNav();
}

// === Profile ===
function renderProfile() {
  const p = VS.getProfile();
  app.innerHTML = `<div class="game" style="padding:20px; text-align:center;">
    <div style="font-size:80px; margin-top:40px;">${p.levelEmoji}</div>
    <h1 style="font-family:var(--font-display); font-size:32px; margin-top:10px;">${p.username || 'Versus Player'}</h1>
    <p style="color:var(--gray); font-family:var(--font-body);">${p.levelName} · Level ${p.level}</p>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:30px;">
      <div class="stat-card" style="background:white; padding:20px; border-radius:15px;">
        <div class="stat-num" style="font-size:24px; font-weight:800;">${p.totalVotes}</div>
        <div class="stat-label">Total Votes</div>
      </div>
      <div class="stat-card" style="background:white; padding:20px; border-radius:15px;">
        <div class="stat-num" style="font-size:24px; font-weight:800;">${p.bestStreak}</div>
        <div class="stat-label">Best Streak</div>
      </div>
    </div>
    <button id="editName" class="paywall-btn ghost" style="margin-top:20px;">Edit Username</button>
    ${bottomNav('profile')}</div>`;
  
  $('#editName').addEventListener('click', showUsernameModal);
  bindNav();
}

// === Stats ===
function renderStats() {
  const achs = VS.getAchievements ? VS.getAchievements() : [];
  app.innerHTML = `<div class="game" style="padding:20px;">
    <h1 style="font-family:var(--font-display); margin-bottom:20px;">📊 Stats & Badges</h1>
    <div class="cat-grid">
      ${achs.length > 0 ? achs.map(a => `<div class="badge-card ${a.unlocked ? 'unlocked' : 'locked'}">
        <div style="font-size:32px;">${a.unlocked ? a.emoji : '🔒'}</div>
        <div class="badge-name">${a.name}</div>
      </div>`).join('') : '<div style="padding:40px; text-align:center; width:100%; opacity:0.5;">Play more to unlock badges!</div>'}
    </div>
    ${bottomNav('stats')}</div>`;
  bindNav();
}

// === OPTIMIZED: Game Logic (Uses new questions.js functions) ===
function startGame(cat) {
  state.activeCategory = cat;
  let pool = [];

  if (cat === 'all') {
    pool = (state.region && state.region !== 'global') 
      ? getAllWithRegion(state.region) 
      : [...ALL_QUESTIONS];
  } else {
    // If specific category, get global ones + regional ones if they exist for that cat
    const globalCat = (CATEGORIES[cat] || []).map(q => ({...q, category: cat}));
    const regionalCat = (state.region && REGIONS[state.region]) 
      ? REGIONS[state.region].filter(q => q.category === cat) 
      : [];
    pool = [...globalCat, ...regionalCat];
  }
  
  if (pool.length === 0) { state.screen = 'home'; render(); return; }
  
  state.questions = shuffleArray(pool);
  state.currentQ = 0;
  state.selected = null;
  state.showResults = false;
  state.screen = 'game';
  render();
}

function handleVote(side) {
  if (state.selected) return;
  state.selected = side;
  state.showResults = true;
  
  const q = state.questions[state.currentQ];
  const c = VS.getVoteCounts(q.q, q.seed[0], q.seed[1]);
  const isMajority = (side === 'a' && c.a > c.b) || (side === 'b' && c.b > c.a);
  
  const result = VS.saveVote(q.q, side, q.category, isMajority);
  state.xpPopup = result.xpResult;
  state.profile = VS.getProfile();
  
  render();
  setTimeout(() => { state.xpPopup = null; render(); }, 2000);
}

function nextQuestion() {
  if (state.currentQ < state.questions.length - 1) {
    state.currentQ++;
    state.selected = null;
    state.showResults = false;
  } else {
    state.screen = 'home';
  }
  render();
}

function handleShare() {
  const q = state.questions[state.currentQ];
  const text = `I picked ${state.selected === 'a' ? q.a : q.b} on Versus! What about you?`;
  if (navigator.share) {
    navigator.share({ title: 'Versus ⚡', text, url: APP_URL });
  } else {
    navigator.clipboard.writeText(text + " " + APP_URL);
    alert("Copied to clipboard!");
  }
}

function showUsernameModal() {
  const n = prompt("Enter your username:", state.profile.username || "");
  if (n) {
    VS.setUsername ? VS.setUsername(n) : (state.profile.username = n, VS.set('profile', state.profile));
    render();
  }
}

// === Router ===
function render() {
  if (!state) return;
  switch (state.screen) {
    case 'splash': renderSplash(); break;
    case 'onboard': renderOnboard(); break;
    case 'region': renderRegionSelect(); break;
    case 'home': renderHome(); break;
    case 'game': renderGame(); break;
    case 'leaderboard': renderLeaderboard(); break;
    case 'profile': renderProfile(); break;
    case 'stats': renderStats(); break;
    default: renderHome();
  }
}

window.addEventListener('load', initApp);
