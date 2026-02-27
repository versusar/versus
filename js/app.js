// === VERSUS — Main Application v2 ===
// Now with region selector + 10 categories + regional packs

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const app = document.getElementById('app');

// State
let state = {
  screen: 'splash',
  questions: [],
  currentQ: 0,
  selected: null,
  showResults: false,
  activeCategory: 'all',
  region: VersusStorage.get('region') || null,
  profile: VersusStorage.getProfile(),
  shareMsg: '',
};

// Gradient map for categories
const CAT_GRADIENTS = [
  'linear-gradient(135deg, #FF6B35, #FF9A76)',
  'linear-gradient(135deg, #7B2FF7, #B388FF)',
  'linear-gradient(135deg, #00D4AA, #00F5D4)',
  'linear-gradient(135deg, #FF3CAC, #FF85C8)',
  'linear-gradient(135deg, #FFD93D, #FFE88A)',
  'linear-gradient(135deg, #3A86FF, #83B4FF)',
  'linear-gradient(135deg, #F72585, #FF5DA2)',
  'linear-gradient(135deg, #FF9E00, #FFCA58)',
  'linear-gradient(135deg, #8338EC, #C77DFF)',
  'linear-gradient(135deg, #06D6A0, #73E8C4)',
];

// === RENDER: SPLASH ===
function renderSplash() {
  app.innerHTML = `
    <div class="splash">
      <div class="splash-icon">⚡</div>
      <h1 class="splash-title">VERSUS</h1>
      <p class="splash-sub">Pick a side. See where you stand.</p>
      <div class="splash-loader"></div>
    </div>
  `;
  setTimeout(() => {
    state.screen = state.region ? 'home' : 'region';
    render();
  }, 2200);
}

// === RENDER: REGION SELECTOR ===
function renderRegionSelect() {
  const regions = getRegionKeys();
  const regionCards = regions.map((r, i) => {
    const flag = r.split(' ')[0];
    const name = r.split(' ').slice(1).join(' ');
    return `
      <button class="cat-card" style="background:${CAT_GRADIENTS[i % CAT_GRADIENTS.length]}; animation: fadeIn 0.4s ease-out ${i * 0.06}s both;" data-region="${r}">
        <div class="emoji" style="font-size:36px;">${flag}</div>
        <div class="name">${name}</div>
        <div class="count">10 local questions</div>
      </button>
    `;
  }).join('');

  app.innerHTML = `
    <div class="home">
      <div class="home-header">
        <h1>⚡ VERSUS</h1>
        <p>Where in the world are you?</p>
      </div>
      <div style="padding: 24px 20px 0;">
        <h2 class="section-title">Pick Your Region</h2>
        <p style="font-family: var(--font-body); font-size: 13px; color: var(--gray); margin: -8px 0 16px 4px;">
          Get local debates + all global questions
        </p>
        <div class="cat-grid">
          ${regionCards}
        </div>
      </div>
      <div style="padding: 20px 20px 0; text-align: center;">
        <button id="skipRegion" style="background:none; border:none; font-family: var(--font-body); font-size: 14px; color: var(--gray); cursor:pointer; text-decoration: underline; padding: 12px;">
          Skip — just show global questions
        </button>
      </div>
      <div class="footer">© 2026 Versus · All Rights Reserved</div>
    </div>
  `;

  $$('.cat-card').forEach(btn => {
    btn.addEventListener('click', () => {
      state.region = btn.dataset.region;
      VersusStorage.set('region', state.region);
      state.screen = 'home';
      render();
    });
  });

  $('#skipRegion').addEventListener('click', () => {
    state.region = 'global';
    VersusStorage.set('region', 'global');
    state.screen = 'home';
    render();
  });
}

// === RENDER: HOME ===
function renderHome() {
  const stats = VersusStorage.getStats();
  const catEntries = Object.entries(CATEGORIES);

  const totalQs = state.region && state.region !== 'global'
    ? ALL_QUESTIONS.length + getRegionalQuestions(state.region).length
    : ALL_QUESTIONS.length;

  let statsHTML = '';
  if (stats.totalVotes > 0) {
    statsHTML = `
      <div class="stats-row">
        <div class="stat-pill">🗳 ${stats.totalVotes} votes</div>
        <div class="stat-pill">🔥 ${stats.streak} streak</div>
        ${stats.bestStreak > 1 ? `<div class="stat-pill">🏆 ${stats.bestStreak} best</div>` : ''}
      </div>
    `;
  }

  // Region indicator
  let regionBadge = '';
  if (state.region && state.region !== 'global') {
    const flag = state.region.split(' ')[0];
    regionBadge = `
      <div style="display:flex; justify-content:center; margin-top:10px;">
        <button id="changeRegion" style="background:rgba(255,255,255,0.2); border:none; border-radius:20px; padding:5px 14px; color:#fff; font-size:12px; font-family:var(--font-body); font-weight:600; cursor:pointer;">
          ${flag} ${state.region.split(' ').slice(1).join(' ')} · Change
        </button>
      </div>
    `;
  }

  let catsHTML = catEntries.map(([cat, qs], i) => {
    const emoji = cat.split(' ')[0];
    const name = cat.split(' ').slice(1).join(' ');
    return `
      <button class="cat-card" style="background:${CAT_GRADIENTS[i % CAT_GRADIENTS.length]}; animation: fadeIn 0.4s ease-out ${i * 0.06}s both;" data-cat="${cat}">
        <div class="emoji">${emoji}</div>
        <div class="name">${name}</div>
        <div class="count">${qs.length} questions</div>
      </button>
    `;
  }).join('');

  // Regional card
  let regionalCard = '';
  if (state.region && state.region !== 'global') {
    const regQs = getRegionalQuestions(state.region);
    const flag = state.region.split(' ')[0];
    const name = state.region.split(' ').slice(1).join(' ');
    regionalCard = `
      <button class="cat-card" style="background: linear-gradient(135deg, #1A1A2E, #3D3D5C); animation: fadeIn 0.4s ease-out ${catEntries.length * 0.06}s both; grid-column: 1 / -1;" data-cat="${state.region}" data-regional="true">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="emoji" style="font-size:36px;">${flag}</div>
          <div>
            <div class="name" style="font-size:16px;">${name} Edition</div>
            <div class="count">${regQs.length} local debates</div>
          </div>
        </div>
      </button>
    `;
  }

  app.innerHTML = `
    <div class="home">
      <div class="home-header">
        <h1>⚡ VERSUS</h1>
        <p>Pick a side. See where the world stands.</p>
        ${statsHTML}
        ${regionBadge}
      </div>

      <div style="padding: 24px 20px 0;">
        <button class="daily-btn" id="playAll">
          <div class="label">⚡ TODAY'S MIX</div>
          <div class="title">Play All Categories</div>
          <div class="desc">${totalQs} questions ${state.region && state.region !== 'global' ? '(including local)' : 'across every topic'}</div>
          <div class="arrow">→</div>
        </button>
      </div>

      <div style="padding: 24px 20px 0;">
        <h2 class="section-title">Categories</h2>
        <div class="cat-grid">
          ${catsHTML}
          ${regionalCard}
        </div>
      </div>

      <div class="footer">© 2026 Versus · All Rights Reserved</div>
    </div>
  `;

  // Events
  $('#playAll').addEventListener('click', () => startGame('all'));

  $$('.cat-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      const isRegional = btn.dataset.regional === 'true';
      if (isRegional) {
        startGame('regional');
      } else {
        startGame(cat);
      }
    });
  });

  const changeBtn = document.getElementById('changeRegion');
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      state.screen = 'region';
      render();
    });
  }
}

// === RENDER: GAME ===
function renderGame() {
  const q = state.questions[state.currentQ];
  if (!q) return renderHome();

  const progress = ((state.currentQ + (state.showResults ? 1 : 0)) / state.questions.length) * 100;
  const profile = VersusStorage.getProfile();

  // Check previous votes
  const prevVote = VersusStorage.hasVoted(q.q);
  if (prevVote && !state.selected) {
    state.selected = prevVote.side;
    state.showResults = true;
  }

  let optAClass = 'option-btn a';
  let optBClass = 'option-btn b';
  let optAStyle = '', optBStyle = '';
  let pctAHTML = '', pctBHTML = '';
  let barAHTML = '', barBHTML = '';
  let actionsHTML = '', noteHTML = '';

  if (state.showResults) {
    const counts = VersusStorage.getVoteCounts(q.q, q.seed[0], q.seed[1]);
    const pctA = counts.a, pctB = counts.b;

    optAClass += ' voted' + (state.selected === 'a' ? ' selected' : '');
    optBClass += ' voted' + (state.selected === 'b' ? ' selected' : '');
    optAStyle = 'padding:20px;';
    optBStyle = 'padding:20px;';

    barAHTML = `<div class="result-bar a" style="width:${pctA}%"></div>`;
    barBHTML = `<div class="result-bar b" style="width:${pctB}%"></div>`;
    pctAHTML = `<span class="pct a">${pctA}%</span>`;
    pctBHTML = `<span class="pct b">${pctB}%</span>`;

    const withMajority = (pctA > pctB && state.selected === 'a') || (pctB > pctA && state.selected === 'b');
    const nextLabel = state.currentQ < state.questions.length - 1 ? 'Next →' : '🔄 Replay';

    actionsHTML = `
      <div class="actions">
        <button class="share-btn" id="shareBtn">📤 Share</button>
        <button class="next-btn" id="nextBtn">${nextLabel}</button>
      </div>
    `;
    noteHTML = `
      <div class="result-note">${withMajority ? "🎯 You're with the majority!" : "😈 Going against the grain!"}</div>
      <div class="total-votes">${counts.totalVotes.toLocaleString()} total votes</div>
    `;
  }

  app.innerHTML = `
    <div class="game">
      <div class="top-bar">
        <button class="back-btn" id="backBtn">←</button>
        <div class="top-right">
          <span class="streak-badge">🔥 ${profile.streak}</span>
          <span class="q-counter">${state.currentQ + 1}/${state.questions.length}</span>
        </div>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${progress}%"></div>
      </div>
      <div style="text-align:center; margin-top:16px;">
        <span class="cat-pill">${q.category}</span>
      </div>
      <div class="question-area">
        <h2 class="question-text">${q.q}</h2>

        <button class="${optAClass}" style="${optAStyle}" id="optA" ${state.showResults ? 'disabled' : ''}>
          ${barAHTML}
          <div class="option-inner"><span>${q.a}</span>${pctAHTML}</div>
        </button>

        <div class="vs-divider">VS</div>

        <button class="${optBClass}" style="${optBStyle}" id="optB" ${state.showResults ? 'disabled' : ''}>
          ${barBHTML}
          <div class="option-inner"><span>${q.b}</span>${pctBHTML}</div>
        </button>

        ${actionsHTML}
        ${noteHTML}
      </div>
    </div>
  `;

  // Events
  $('#backBtn').addEventListener('click', () => { state.screen = 'home'; render(); });

  if (!state.showResults) {
    $('#optA').addEventListener('click', () => handleVote('a'));
    $('#optB').addEventListener('click', () => handleVote('b'));
  }
  if (state.showResults) {
    $('#shareBtn').addEventListener('click', handleShare);
    $('#nextBtn').addEventListener('click', nextQuestion);
  }
}

// === GAME LOGIC ===
function startGame(category) {
  state.activeCategory = category;
  let qs;
  if (category === 'all') {
    qs = state.region && state.region !== 'global'
      ? shuffleArray(getAllWithRegion(state.region))
      : shuffleArray(ALL_QUESTIONS);
  } else if (category === 'regional') {
    qs = shuffleArray(getRegionalQuestions(state.region));
  } else if (CATEGORIES[category]) {
    qs = shuffleArray(CATEGORIES[category].map(q => ({ ...q, category })));
  } else {
    qs = shuffleArray(ALL_QUESTIONS);
  }
  state.questions = qs;
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
  VersusStorage.saveVote(q.q, side);
  VersusStorage.addGlobalVote(q.q, side);
  state.profile = VersusStorage.getProfile();
  render();
}

function nextQuestion() {
  if (state.currentQ < state.questions.length - 1) {
    state.currentQ++;
    state.selected = null;
    state.showResults = false;
  } else {
    startGame(state.activeCategory);
    return;
  }
  render();
}

function handleShare() {
  const q = state.questions[state.currentQ];
  const counts = VersusStorage.getVoteCounts(q.q, q.seed[0], q.seed[1]);
  const myChoice = state.selected === 'a' ? q.a : q.b;
  const myPct = state.selected === 'a' ? counts.a : counts.b;
  const text = `⚡ VERSUS: "${q.q}"\n\nI picked "${myChoice}" — ${myPct}% agree!\n\nPlay now 👉`;

  if (navigator.share) {
    navigator.share({ title: 'Versus ⚡', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const btn = $('#shareBtn');
      if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📤 Share'; }, 1500); }
    });
  }
}

// === ROUTER ===
function render() {
  switch (state.screen) {
    case 'splash': renderSplash(); break;
    case 'region': renderRegionSelect(); break;
    case 'home': renderHome(); break;
    case 'game': renderGame(); break;
    default: renderHome();
  }
}

// === INIT ===
render();
