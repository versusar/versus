// © 2026 VersuAR. All Rights Reserved.
// Unauthorized copying, modification, or distribution is strictly prohibited.
// See LICENSE file for full terms.

// === VERSUS — App ===
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const app = document.getElementById('app');
const APP_URL = 'https://versusar.github.io/versus/';

let state = {
  screen: 'splash', questions: [], currentQ: 0, selected: null, showResults: false,
  activeCategory: 'all', region: VS.get('region') || null, profile: VS.getProfile(),
  xpPopup: null, achievementPopup: null, showAd: false,
  gameStartTime: null, questionsAnsweredThisRound: 0, lbTab: 'xp',
  onboardStep: 0
};

const CG = [
  'linear-gradient(135deg,#FF6B35,#FF9A76)', 'linear-gradient(135deg,#7B2FF7,#B388FF)',
  'linear-gradient(135deg,#00D4AA,#00F5D4)', 'linear-gradient(135deg,#FF3CAC,#FF85C8)',
  'linear-gradient(135deg,#FFD93D,#FFE88A)', 'linear-gradient(135deg,#3A86FF,#83B4FF)',
  'linear-gradient(135deg,#F72585,#FF5DA2)', 'linear-gradient(135deg,#FF9E00,#FFCA58)',
  'linear-gradient(135deg,#8338EC,#C77DFF)', 'linear-gradient(135deg,#06D6A0,#73E8C4)'
];

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

// === Onboarding (2-step intro for new users) ===
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
        <p style="color:rgba(255,255,255,.75);font-size:13px;margin-bottom:16px;">You'll get all topics, but pick your favorites to see them first:</p>
        <div id="interestGrid" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">
          ${Object.keys(CATEGORIES).map(c => `<button class="interest-tag" data-cat="${c}" style="padding:8px 14px;border-radius:20px;border:2px solid rgba(255,255,255,.3);background:transparent;color:#fff;font-size:13px;font-weight:700;font-family:var(--font-body);cursor:pointer;transition:all .2s;">${c}</button>`).join('')}
        </div>
        <p style="color:rgba(255,255,255,.5);font-size:11px;margin-top:12px;text-align:center;">Tap any that interest you — or skip and explore everything</p>
      </div>`,
      btn: "Start Playing ⚡"
    }
  ];

  const s = steps[step];
  app.innerHTML = `<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#FF6B35 0%,#FF3CAC 40%,#7B2FF7 70%,#00D4AA 100%);padding:40px 24px;text-align:center;">
    <div style="font-size:56px;margin-bottom:8px;">${s.emoji}</div>
    <h1 style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-1px;">${s.title}</h1>
    <p style="color:rgba(255,255,255,.85);font-size:14px;font-family:var(--font-body);margin:6px 0 24px;">${s.sub}</p>
    ${s.body}
    <button id="onboardNext" style="margin-top:28px;padding:16px 48px;border:none;border-radius:20px;background:#fff;color:var(--dark);font-size:16px;font-weight:800;font-family:var(--font-display);cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.15);">${s.btn}</button>
    <div style="display:flex;gap:8px;margin-top:20px;">
      ${steps.map((_, i) => `<div style="width:${i === step ? '24px' : '8px'};height:8px;border-radius:4px;background:${i === step ? '#fff' : 'rgba(255,255,255,.3)'};transition:all .3s;"></div>`).join('')}
    </div>
    ${step > 0 ? '<button id="onboardBack" style="margin-top:12px;background:none;border:none;color:rgba(255,255,255,.6);font-size:13px;font-family:var(--font-body);cursor:pointer;">← Back</button>' : ''}
  </div>`;

  // Interest tag selection
  if (step === 1) {
    const selected = new Set();
    $$('.interest-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const cat = tag.dataset.cat;
        if (selected.has(cat)) {
          selected.delete(cat);
          tag.style.background = 'transparent';
          tag.style.borderColor = 'rgba(255,255,255,.3)';
        } else {
          selected.add(cat);
          tag.style.background = 'rgba(255,255,255,.25)';
          tag.style.borderColor = '#fff';
        }
      });
    });
  }

  $('#onboardNext').addEventListener('click', () => {
    if (step < steps.length - 1) {
      state.onboardStep = step + 1;
      render();
    } else {
      VS.set('onboarded', true);
      state.screen = 'region';
      render();
    }
  });

  const back = document.getElementById('onboardBack');
  if (back) back.addEventListener('click', () => { state.onboardStep = step - 1; render(); });
}

// === Region Select ===
function renderRegionSelect() {
  const regions = getRegionKeys();
  app.innerHTML = `<div class="home"><div class="home-header"><h1>⚡ VERSUS</h1><p>Where in the world are you?</p></div>
    <div style="padding:24px 20px 0;"><h2 class="section-title">Pick Your Region</h2>
    <p style="font-family:var(--font-body);font-size:13px;color:var(--gray);margin:-8px 0 16px 4px;">Get local debates + all global questions</p>
    <div class="cat-grid">${regions.map((r, i) => `<button class="cat-card" style="background:${CG[i % CG.length]};animation:fadeIn .4s ease-out ${i * .06}s both;" data-region="${r}"><div class="emoji" style="font-size:36px;">${r.split(' ')[0]}</div><div class="name">${r.split(' ').slice(1).join(' ')}</div><div class="count">10 local Qs</div></button>`).join('')}</div></div>
    <div style="padding:20px;text-align:center;"><button id="skipRegion" style="background:none;border:none;font-family:var(--font-body);font-size:14px;color:var(--gray);cursor:pointer;text-decoration:underline;padding:12px;">Skip — global only</button></div></div>`;
  $$('.cat-card').forEach(b => b.addEventListener('click', () => {
    state.region = b.dataset.region; VS.set('region', state.region);
    const p = VS.getProfile(); p.regionsPlayed = (p.regionsPlayed || 0) + 1; VS.set('profile', p);
    state.screen = 'home'; render();
  }));
  $('#skipRegion').addEventListener('click', () => { state.region = 'global'; VS.set('region', 'global'); state.screen = 'home'; render(); });
}

// === Home ===
function renderHome() {
  const p = VS.getProfile(), lp = VS.getLevelProgress(), daily = VS.getDailyStatus(), ce = Object.entries(CATEGORIES);
  const totalQs = state.region && state.region !== 'global' ? ALL_QUESTIONS.length + getRegionalQuestions(state.region).length : ALL_QUESTIONS.length;
  const rb = state.region && state.region !== 'global' ? `<div style="display:flex;justify-content:center;margin-top:10px;"><button id="changeRegion" style="background:rgba(255,255,255,.2);border:none;border-radius:20px;padding:5px 14px;color:#fff;font-size:12px;font-family:var(--font-body);font-weight:600;cursor:pointer;">${state.region.split(' ')[0]} ${state.region.split(' ').slice(1).join(' ')} · Change</button></div>` : '';
  const rc = state.region && state.region !== 'global' ? `<button class="cat-card" style="background:linear-gradient(135deg,#1A1A2E,#3D3D5C);animation:fadeIn .4s ease-out ${ce.length * .06}s both;grid-column:1/-1;" data-cat="${state.region}" data-regional="true"><div style="display:flex;align-items:center;gap:12px;"><div class="emoji" style="font-size:36px;">${state.region.split(' ')[0]}</div><div><div class="name" style="font-size:16px;">${state.region.split(' ').slice(1).join(' ')} Edition</div><div class="count">${getRegionalQuestions(state.region).length} local debates</div></div></div></button>` : '';
  const uname = p.username ? `<div style="font-size:12px;color:rgba(255,255,255,.7);font-family:var(--font-body);margin-top:4px;">@${p.username}</div>` : `<button id="setNameBtn" style="margin-top:6px;background:rgba(255,255,255,.25);border:none;border-radius:12px;padding:4px 14px;color:#fff;font-size:11px;font-weight:700;font-family:var(--font-body);cursor:pointer;">Set Username</button>`;

  app.innerHTML = `<div class="home" style="padding-bottom:80px;">
    <div class="home-header"><h1>⚡ VERSUS</h1><p>Pick a side. See where the world stands.</p>${uname}
    <div class="level-card"><div class="level-top"><span class="level-badge">${p.levelEmoji} ${p.levelName}</span><span class="level-label">Lv.${p.level}</span></div>
    <div class="xp-bar-track"><div class="xp-bar-fill" style="width:${lp.progress}%"></div></div>
    <div class="xp-bar-label">${lp.label} to next level</div></div>
    <div class="stats-row"><div class="stat-pill">🗳 ${p.totalVotes}</div><div class="stat-pill">🔥 ${p.streak} streak</div><div class="stat-pill">⭐ ${p.xp} XP</div></div>${rb}</div>
    <div style="padding:24px 20px 0;"><button class="daily-btn" id="playAll"><div class="label">⚡ TODAY'S MIX</div><div class="title">Play All Categories</div><div class="desc">${daily.freeLeft} free left · ${totalQs} total</div><div class="arrow">→</div></button></div>
    <div style="padding:16px 20px 0;display:flex;gap:10px;"><button class="nav-pill" id="goDaily">📋 Daily 5</button></div>
    <div style="padding:20px 20px 0;"><h2 class="section-title">Categories</h2>
    <div class="cat-grid">${ce.map(([c, qs], i) => `<button class="cat-card" style="background:${CG[i % CG.length]};animation:fadeIn .4s ease-out ${i * .06}s both;" data-cat="${c}"><div class="emoji">${c.split(' ')[0]}</div><div class="name">${c.split(' ').slice(1).join(' ')}</div><div class="count">${qs.length} Qs</div></button>`).join('')}${rc}</div></div>
    <div class="footer">© 2026 Versus</div>
    ${bottomNav('home')}</div>`;

  $('#playAll').addEventListener('click', () => startGame('all'));
  $('#goDaily').addEventListener('click', () => startGame('daily5'));
  $$('.cat-card').forEach(b => b.addEventListener('click', () => { b.dataset.regional === 'true' ? startGame('regional') : startGame(b.dataset.cat); }));
  const cr = document.getElementById('changeRegion'); if (cr) cr.addEventListener('click', () => { state.screen = 'region'; render(); });
  const sn = document.getElementById('setNameBtn'); if (sn) sn.addEventListener('click', showUsernameModal);
  let taps = 0; const ft = document.querySelector('.footer');
  if (ft) ft.addEventListener('click', () => { taps++; if (taps >= 5) { window.location.href = 'admin.html'; } setTimeout(() => { taps = 0; }, 3000); });
  bindNav();
}

// === Username Modal ===
function showUsernameModal() {
  const ov = document.createElement('div'); ov.className = 'modal-overlay';
  ov.innerHTML = `<div class="modal-box"><div style="font-size:40px;">👤</div><h2 style="font-size:20px;font-weight:800;color:var(--dark);margin-top:8px;">Claim Your Spot</h2><p style="font-family:var(--font-body);font-size:13px;color:var(--gray);margin-top:4px;">Pick a username for the leaderboard</p><input class="modal-input" id="unameInput" placeholder="YourName" maxlength="20" autocomplete="off"><button class="next-btn" style="width:100%;padding:14px;" id="saveUname">Save</button><button style="background:none;border:none;color:var(--gray);font-size:13px;font-family:var(--font-body);cursor:pointer;margin-top:12px;" id="skipUname">Skip</button></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  $('#skipUname').addEventListener('click', () => ov.remove());
  $('#saveUname').addEventListener('click', () => { const n = $('#unameInput').value.trim(); if (n.length >= 2) { VS.setUsername(n); ov.remove(); render(); } });
  $('#unameInput').focus();
}

// === Leaderboard ===
function renderLeaderboard() {
  const p = VS.getProfile(), tab = state.lbTab || 'xp';
  const fakeUsers = [
    { name: 'VoteMaster99', xp: 4200, level: 7, ln: 'Versus Elite', streak: 12, votes: 380 },
    { name: 'HotTakeQueen', xp: 3100, level: 7, ln: 'Versus Elite', streak: 8, votes: 290 },
    { name: 'DebateLord', xp: 2400, level: 6, ln: 'Influence Lord', streak: 15, votes: 210 },
    { name: 'OpinionKing', xp: 1800, level: 5, ln: 'Trend Setter', streak: 6, votes: 160 },
    { name: 'ContrarianX', xp: 1200, level: 4, ln: 'Debate Bro', streak: 4, votes: 110 },
    { name: 'CasualVoter', xp: 600, level: 3, ln: 'Hot Taker', streak: 3, votes: 55 },
  ];
  const me = { name: p.username || 'You', xp: p.xp, level: p.level, ln: p.levelName, streak: p.bestStreak, votes: p.totalVotes, isMe: true };
  const all = [...fakeUsers, me].sort((a, b) => tab === 'streak' ? b.streak - a.streak : tab === 'votes' ? b.votes - a.votes : b.xp - a.xp);
  const rows = all.map((u, i) => {
    const rank = i + 1, medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
    const val = tab === 'xp' ? u.xp + ' XP' : tab === 'streak' ? '🔥 ' + u.streak : u.votes;
    return `<div class="lb-row ${u.isMe ? 'me' : ''} ${rank <= 3 ? 'top3' : ''}"><div class="lb-rank">${medal}</div><div class="lb-info"><div class="lb-name">${u.name}${u.isMe ? ' (you)' : ''}</div><div class="lb-detail">Lv.${u.level} · ${u.ln}</div></div><div class="lb-xp">${val}</div></div>`;
  }).join('');

  app.innerHTML = `<div class="game" style="background:var(--bg);">
    <div class="top-bar"><div style="font-weight:800;font-size:18px;color:var(--dark);">🏆 Leaderboard</div></div>
    <div style="display:flex;gap:6px;padding:8px 20px;">
      <button class="lb-tab ${tab === 'xp' ? 'active' : ''}" data-tab="xp">⭐ XP</button>
      <button class="lb-tab ${tab === 'streak' ? 'active' : ''}" data-tab="streak">🔥 Streak</button>
      <button class="lb-tab ${tab === 'votes' ? 'active' : ''}" data-tab="votes">🗳 Votes</button>
    </div>
    <div style="padding:8px 20px;overflow-y:auto;flex:1;padding-bottom:80px;">${rows}</div>
    ${!p.username ? '<div style="padding:12px 20px;"><button class="next-btn" style="width:100%;padding:14px;" id="lbSetName">Set Username to Claim Your Rank</button></div>' : ''}
    ${bottomNav('leaderboard')}</div>`;
  $$('.lb-tab').forEach(t => t.addEventListener('click', () => { state.lbTab = t.dataset.tab; render(); }));
  const lsn = document.getElementById('lbSetName'); if (lsn) lsn.addEventListener('click', showUsernameModal);
  bindNav();
}

// === Profile ===
function renderProfile() {
  const p = VS.getProfile(), lp = VS.getLevelProgress();
  app.innerHTML = `<div class="game" style="background:var(--bg);">
    <div style="padding:16px 20px;overflow-y:auto;flex:1;padding-bottom:80px;">
    <div style="background:linear-gradient(135deg,#FF6B35,#FF3CAC,#7B2FF7);border-radius:24px;padding:24px;text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;">${p.levelEmoji}</div>
      <div style="font-size:22px;font-weight:800;color:#fff;margin-top:4px;">${p.username || 'Anonymous'}</div>
      <div style="font-size:13px;color:rgba(255,255,255,.8);font-family:var(--font-body);">${p.levelName} · Level ${p.level}</div>
      <div style="background:rgba(255,255,255,.2);border-radius:20px;height:8px;margin:12px 20px 0;overflow:hidden;"><div style="height:100%;width:${lp.progress}%;background:#fff;border-radius:20px;"></div></div>
      <div style="font-size:11px;color:rgba(255,255,255,.7);font-family:var(--font-body);margin-top:6px;">${lp.label}</div>
      <button style="margin-top:12px;background:rgba(255,255,255,.25);border:none;border-radius:12px;padding:6px 16px;color:#fff;font-size:12px;font-weight:700;font-family:var(--font-body);cursor:pointer;" id="editName">${p.username ? 'Edit Username' : 'Set Username'}</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;">
      <div class="stat-card"><div class="stat-num">${p.totalVotes}</div><div class="stat-label">Votes</div></div>
      <div class="stat-card"><div class="stat-num">${p.xp}</div><div class="stat-label">XP</div></div>
      <div class="stat-card"><div class="stat-num">${p.bestStreak}</div><div class="stat-label">Best Streak</div></div>
      <div class="stat-card"><div class="stat-num">${p.majorityVotes || 0}</div><div class="stat-label">Mainstream</div></div>
      <div class="stat-card"><div class="stat-num">${p.minorityVotes || 0}</div><div class="stat-label">Contrarian</div></div>
      <div class="stat-card"><div class="stat-num">${p.categoriesPlayed || 0}/10</div><div class="stat-label">Categories</div></div>
    </div></div>${bottomNav('profile')}</div>`;
  $('#editName').addEventListener('click', showUsernameModal);
  bindNav();
}

// === Stats / Badges ===
function renderStats() {
  const achs = VS.getAchievements(), ul = achs.filter(a => a.unlocked), ll = achs.filter(a => !a.unlocked);
  app.innerHTML = `<div class="game" style="background:var(--bg);">
    <div style="padding:16px 20px;overflow-y:auto;flex:1;padding-bottom:80px;">
    <h2 style="font-size:20px;font-weight:800;color:var(--dark);margin-bottom:16px;">📊 Badges (${ul.length}/${achs.length})</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
      ${ul.map(a => `<div class="badge-card unlocked"><div style="font-size:28px;">${a.emoji}</div><div class="badge-name">${a.name}</div><div class="badge-desc">${a.desc}</div></div>`).join('')}
      ${ll.map(a => `<div class="badge-card locked"><div style="font-size:28px;filter:grayscale(1);opacity:.4;">🔒</div><div class="badge-name" style="opacity:.5;">${a.name}</div><div class="badge-desc" style="opacity:.4;">${a.desc}</div></div>`).join('')}
    </div></div>${bottomNav('stats')}</div>`;
  bindNav();
}

// === Game ===
function renderGame() {
  const q = state.questions[state.currentQ]; if (!q) { state.screen = 'home'; render(); return; }
  const p = VS.getProfile(), daily = VS.getDailyStatus();
  const prog = ((state.currentQ + (state.showResults ? 1 : 0)) / state.questions.length) * 100;
  if (daily.shouldShowPaywall && !state.showResults) { renderPaywall(); return; }
  if (daily.shouldShowAd && !state.showAd && !state.showResults && state.questionsAnsweredThisRound > 0 && state.questionsAnsweredThisRound % VERSUS_CONFIG.AD_EVERY_N_QUESTIONS === 0) { renderAdSlot(); return; }
  const pv = VS.hasVoted(q.q); if (pv && !state.selected) { state.selected = pv.side; state.showResults = true; }

  let oA = 'option-btn a', oB = 'option-btn b', bA = '', bB = '', pA = '', pB = '', acts = '', note = '', xpT = '', achT = '';
  if (state.showResults) {
    const c = VS.getVoteCounts(q.q, q.seed[0], q.seed[1]);
    oA += ' voted' + (state.selected === 'a' ? ' selected' : ''); oB += ' voted' + (state.selected === 'b' ? ' selected' : '');
    bA = `<div class="result-bar a" style="width:${c.a}%"></div>`; bB = `<div class="result-bar b" style="width:${c.b}%"></div>`;
    pA = `<span class="pct a">${c.a}%</span>`; pB = `<span class="pct b">${c.b}%</span>`;
    const wM = (c.a > c.b && state.selected === 'a') || (c.b > c.a && state.selected === 'b');
    acts = `<div class="actions"><button class="share-btn" id="shareBtn">📤 Share</button><button class="next-btn" id="nextBtn">${state.currentQ < state.questions.length - 1 ? 'Next →' : '🔄 Replay'}</button></div>`;
    note = `<div class="result-note">${wM ? "🎯 With the majority!" : "😈 Against the grain! +15 XP"}</div>`;
  }
  if (state.xpPopup) xpT = `<div class="xp-toast">${state.xpPopup.leveledUp ? `<div class="levelup-burst">🎉 LEVEL UP!</div><div style="font-size:18px;font-weight:800;color:#fff;margin-top:4px;">${state.xpPopup.emoji} ${state.xpPopup.levelName}</div>` : `<span class="xp-amount">+${state.xpPopup.xp} XP</span>`}</div>`;
  if (state.achievementPopup) achT = `<div class="achievement-toast"><div style="font-size:36px;">${state.achievementPopup.emoji}</div><div style="font-weight:800;color:#fff;font-size:14px;">Badge Unlocked!</div><div style="font-weight:700;color:var(--yellow);font-size:16px;">${state.achievementPopup.name}</div><div style="font-size:12px;color:rgba(255,255,255,.7);font-family:var(--font-body);">${state.achievementPopup.desc} · +100 XP</div></div>`;

  app.innerHTML = `<div class="game"><div class="top-bar"><button class="back-btn" id="backBtn">←</button><div class="top-right"><span class="streak-badge">🔥 ${p.streak}</span><span class="xp-badge">${p.levelEmoji} ${p.xp}</span><span class="q-counter">${state.currentQ + 1}/${state.questions.length}</span></div></div>
    <div class="progress-track"><div class="progress-fill" style="width:${prog}%"></div></div>
    <div style="text-align:center;margin-top:16px;"><span class="cat-pill">${q.category}</span></div>
    <div class="question-area"><h2 class="question-text">${q.q}</h2>
    <button class="${oA}" id="optA" ${state.showResults ? 'disabled' : ''}>${bA}<div class="option-inner"><span>${q.a}</span>${pA}</div></button>
    <div class="vs-divider">VS</div>
    <button class="${oB}" id="optB" ${state.showResults ? 'disabled' : ''}>${bB}<div class="option-inner"><span>${q.b}</span>${pB}</div></button>
    ${acts}${note}</div>${xpT}${achT}</div>`;

  $('#backBtn').addEventListener('click', () => { state.screen = 'home'; render(); });
  if (!state.showResults) { $('#optA').addEventListener('click', () => handleVote('a')); $('#optB').addEventListener('click', () => handleVote('b')); }
  if (state.showResults) { $('#shareBtn').addEventListener('click', handleShare); $('#nextBtn').addEventListener('click', nextQuestion); }
  if (state.xpPopup) setTimeout(() => { state.xpPopup = null; }, 2000);
  if (state.achievementPopup) setTimeout(() => { state.achievementPopup = null; }, 3000);
}

// === Paywall ===
function renderPaywall() {
  app.innerHTML = `<div class="game" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px;">
    <div style="font-size:64px;margin-bottom:16px;">🔒</div><h2 style="font-size:24px;font-weight:800;color:var(--dark);margin-bottom:8px;">Daily Limit Reached!</h2>
    <p style="font-family:var(--font-body);color:var(--gray);font-size:14px;margin-bottom:24px;">Come back tomorrow or unlock more!</p>
    <button class="paywall-btn primary" id="pwShare">📤 Share to Unlock +${VERSUS_CONFIG.SHARE_UNLOCK_BONUS} Qs</button>
    <button class="paywall-btn ghost" id="pwBack">← Back to Home</button></div>`;
  $('#pwShare').addEventListener('click', () => {
    shareApp();
    VS.addBonusQuestions(VERSUS_CONFIG.SHARE_UNLOCK_BONUS);
    VS.recordShare();
    render();
  });
  $('#pwBack').addEventListener('click', () => { state.screen = 'home'; render(); });
}

// === Ad Slot ===
function renderAdSlot() {
  state.showAd = true;
  app.innerHTML = `<div class="game" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 24px;">
    <div class="ad-container"><div class="ad-label">SPONSORED</div><div style="font-size:48px;margin-bottom:12px;">📢</div><p style="font-weight:700;color:var(--dark);">Your Ad Here</p></div>
    <button class="next-btn" style="margin-top:24px;width:100%;max-width:300px;" id="adContinue">Continue →</button></div>`;
  $('#adContinue').addEventListener('click', () => { state.showAd = false; render(); });
}

// === Share (fixed) ===
function shareApp(customText) {
  const text = customText || `⚡ VERSUS — the daily opinion game. Pick a side, see where you stand.\n\nPlay now 👉 ${APP_URL}`;
  try {
    if (navigator.share) {
      navigator.share({ title: 'Versus ⚡', text, url: APP_URL }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  } catch (e) {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  try {
    navigator.clipboard.writeText(text + '\n' + APP_URL);
  } catch (e) {
    // Last resort: create a temporary textarea
    const ta = document.createElement('textarea');
    ta.value = text + '\n' + APP_URL;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

// === Game Logic ===
function startGame(cat) {
  state.activeCategory = cat; state.questionsAnsweredThisRound = 0; state.gameStartTime = Date.now(); state.showAd = false;
  let qs;
  if (cat === 'daily5') { qs = shuffleArray(state.region && state.region !== 'global' ? getAllWithRegion(state.region) : [...ALL_QUESTIONS]).slice(0, 5); }
  else if (cat === 'all') { qs = shuffleArray(state.region && state.region !== 'global' ? getAllWithRegion(state.region) : [...ALL_QUESTIONS]); }
  else if (cat === 'regional') { qs = shuffleArray(getRegionalQuestions(state.region)); }
  else if (CATEGORIES[cat]) { qs = shuffleArray(CATEGORIES[cat].map(q => ({ ...q, category: cat }))); }
  else { qs = shuffleArray([...ALL_QUESTIONS]); }
  state.questions = qs; state.currentQ = 0; state.selected = null; state.showResults = false; state.screen = 'game'; render();
}

function handleVote(side) {
  if (state.selected) return;
  state.selected = side; state.showResults = true; state.questionsAnsweredThisRound++;
  const q = state.questions[state.currentQ], c = VS.getVoteCounts(q.q, q.seed[0], q.seed[1]);
  const wM = (c.a > c.b && side === 'a') || (c.b > c.a && side === 'b');
  VS.addGlobalVote(q.q, side);
  const r = VS.saveVote(q.q, side, q.category, wM);
  if (state.questionsAnsweredThisRound >= 10) { const el = (Date.now() - state.gameStartTime) / 1000; if (el < 60) { const p = VS.getProfile(); p.speedRounds = (p.speedRounds || 0) + 1; VS.set('profile', p); } }
  if (state.activeCategory === 'daily5' && state.currentQ === state.questions.length - 1) { const p = VS.getProfile(); p.dailiesCompleted = (p.dailiesCompleted || 0) + 1; VS.set('profile', p); VS.addXP(XP_CONFIG.DAILY_COMPLETE); }
  state.xpPopup = r.xpResult;
  if (r.newAchievements.length > 0) state.achievementPopup = r.newAchievements[0];
  state.profile = VS.getProfile();
  if (state.profile.totalVotes === 10 && !state.profile.username) setTimeout(showUsernameModal, 1500);
  render();
}

function nextQuestion() {
  if (state.currentQ < state.questions.length - 1) { state.currentQ++; state.selected = null; state.showResults = false; }
  else { if (state.activeCategory === 'daily5') { state.screen = 'home'; render(); return; } startGame(state.activeCategory); return; }
  render();
}

function handleShare() {
  const q = state.questions[state.currentQ], c = VS.getVoteCounts(q.q, q.seed[0], q.seed[1]);
  const myC = state.selected === 'a' ? q.a : q.b, myP = state.selected === 'a' ? c.a : c.b;
  const text = `⚡ VERSUS: "${q.q}"\n\nI picked "${myC}" — ${myP}% agree with me!\n\nWhat would you pick? Play now 👉 ${APP_URL}`;

  const afterShare = () => {
    const na = VS.recordShare();
    const btn = $('#shareBtn');
    if (btn) { btn.textContent = '✅ Shared!'; setTimeout(() => { if (btn) btn.textContent = '📤 Share'; }, 2000); }
    if (na.length > 0) { state.achievementPopup = na[0]; render(); }
  };

  try {
    if (navigator.share) {
      navigator.share({ title: 'Versus ⚡', text, url: APP_URL }).then(afterShare).catch(() => {
        fallbackCopy(text);
        afterShare();
      });
    } else {
      fallbackCopy(text);
      afterShare();
    }
  } catch (e) {
    fallbackCopy(text);
    afterShare();
  }
}

// === Router ===
function render() {
  switch (state.screen) {
    case 'splash': renderSplash(); break;
    case 'onboard': renderOnboard(); break;
    case 'region': renderRegionSelect(); break;
    case 'home': renderHome(); break;
    case 'game': renderGame(); break;
    case 'stats': renderStats(); break;
    case 'leaderboard': renderLeaderboard(); break;
    case 'profile': renderProfile(); break;
    default: renderHome();
  }
}
render();
