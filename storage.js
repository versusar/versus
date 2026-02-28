// === VERSUS — Storage & Config ===

const VERSUS_CONFIG = {
  USE_SUPABASE: false,
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  FREE_DAILY_QUESTIONS: 10,
  AD_EVERY_N_QUESTIONS: 5,
  SHARE_UNLOCK_BONUS: 5,
  ADMIN_PIN: '1234',
};

const XP_CONFIG = {VOTE:10,STREAK_BONUS:5,DAILY_COMPLETE:50,SHARE:25,MAJORITY:5,AGAINST_GRAIN:15,ACHIEVEMENT:100};

const LEVELS = [
  {name:"Rookie",emoji:"🐣",xp:0},
  {name:"Opinionated",emoji:"🗣️",xp:100},
  {name:"Hot Taker",emoji:"🔥",xp:300},
  {name:"Debate Bro",emoji:"⚔️",xp:600},
  {name:"Trend Setter",emoji:"📈",xp:1000},
  {name:"Influence Lord",emoji:"👑",xp:1800},
  {name:"Versus Elite",emoji:"💎",xp:3000},
  {name:"Versus Legend",emoji:"⚡",xp:5000},
  {name:"Versus God",emoji:"🌟",xp:10000},
];

const ACHIEVEMENTS = {
  first_vote:{name:"First Take",emoji:"🎯",desc:"Cast your first vote",cond:s=>s.totalVotes>=1},
  ten_votes:{name:"Warmed Up",emoji:"🔟",desc:"Cast 10 votes",cond:s=>s.totalVotes>=10},
  fifty_votes:{name:"On a Roll",emoji:"🎲",desc:"Cast 50 votes",cond:s=>s.totalVotes>=50},
  hundred_votes:{name:"Centurion",emoji:"💯",desc:"Cast 100 votes",cond:s=>s.totalVotes>=100},
  five_hundred:{name:"Addict",emoji:"🤯",desc:"Cast 500 votes",cond:s=>s.totalVotes>=500},
  streak_3:{name:"Three-Peat",emoji:"🏀",desc:"3-day streak",cond:s=>s.bestStreak>=3},
  streak_7:{name:"Week Warrior",emoji:"📅",desc:"7-day streak",cond:s=>s.bestStreak>=7},
  streak_30:{name:"Monthly Monster",emoji:"🗓️",desc:"30-day streak",cond:s=>s.bestStreak>=30},
  all_categories:{name:"Well Rounded",emoji:"🌈",desc:"Play all 10 categories",cond:s=>s.categoriesPlayed>=10},
  night_owl:{name:"Night Owl",emoji:"🦉",desc:"Vote after midnight",cond:s=>s.nightVotes>=1},
  early_bird:{name:"Early Bird",emoji:"🐦",desc:"Vote before 7 AM",cond:s=>s.earlyVotes>=1},
  contrarian:{name:"Contrarian",emoji:"😈",desc:"Against majority 10x",cond:s=>s.minorityVotes>=10},
  sheep:{name:"Mainstream",emoji:"🐑",desc:"With majority 10x",cond:s=>s.majorityVotes>=10},
  sharer:{name:"Influencer",emoji:"📤",desc:"Share 5 results",cond:s=>s.shares>=5},
  daily_complete:{name:"Daily Grind",emoji:"✅",desc:"Complete a daily challenge",cond:s=>s.dailiesCompleted>=1},
  five_dailies:{name:"Dedicated",emoji:"🏅",desc:"Complete 5 dailies",cond:s=>s.dailiesCompleted>=5},
  globe_trotter:{name:"Globe Trotter",emoji:"🌍",desc:"Play a regional pack",cond:s=>s.regionsPlayed>=1},
  speed_demon:{name:"Speed Demon",emoji:"⚡",desc:"10 Qs in 60 seconds",cond:s=>s.speedRounds>=1},
  level_5:{name:"Rising Star",emoji:"⭐",desc:"Reach Level 5",cond:s=>s.level>=5},
  level_max:{name:"Maxed Out",emoji:"🏆",desc:"Reach max level",cond:s=>s.level>=LEVELS.length},
};

const VS = {
  P: 'versus_',
  get(k) { try { const v = localStorage.getItem(this.P + k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set(k, v) { try { localStorage.setItem(this.P + k, JSON.stringify(v)); } catch (e) { console.warn('Storage:', e); } },

  getProfile() {
    let p = this.get('profile');
    if (!p) {
      p = {
        id: 'user_' + Math.random().toString(36).substr(2, 9), created: Date.now(), username: '',
        xp: 0, level: 1, levelName: LEVELS[0].name, levelEmoji: LEVELS[0].emoji,
        streak: 0, bestStreak: 0, totalVotes: 0, lastVoteDate: null, shares: 0,
        majorityVotes: 0, minorityVotes: 0, nightVotes: 0, earlyVotes: 0,
        categoriesPlayed: 0, categoriesSet: [], regionsPlayed: 0,
        dailiesCompleted: 0, speedRounds: 0, achievements: [],
        dailyVotesToday: 0, dailyDate: null, bonusQuestions: 0
      };
      this.set('profile', p);
    }
    // Migration for older profiles
    if (p.username === undefined) p.username = '';
    if (p.achievements === undefined) p.achievements = [];
    if (p.dailyVotesToday === undefined) p.dailyVotesToday = 0;
    if (p.bonusQuestions === undefined) p.bonusQuestions = 0;
    return p;
  },

  updateProfile(u) { const p = this.getProfile(); Object.assign(p, u); this.set('profile', p); return p; },
  setUsername(n) { const p = this.getProfile(); p.username = n.trim().substring(0, 20); this.set('profile', p); return p; },

  addXP(amt) {
    const p = this.getProfile();
    p.xp += amt;
    let nl = 1;
    for (let i = LEVELS.length - 1; i >= 0; i--) { if (p.xp >= LEVELS[i].xp) { nl = i + 1; break; } }
    const up = nl > p.level;
    p.level = nl; p.levelName = LEVELS[nl - 1].name; p.levelEmoji = LEVELS[nl - 1].emoji;
    this.set('profile', p);
    return { xp: amt, totalXP: p.xp, level: nl, leveledUp: up, levelName: p.levelName, emoji: p.levelEmoji };
  },

  getLevelProgress() {
    const p = this.getProfile(), c = LEVELS[p.level - 1], n = LEVELS[p.level] || null;
    if (!n) return { progress: 100, label: 'MAX LEVEL' };
    const into = p.xp - c.xp, forLvl = n.xp - c.xp;
    return { progress: Math.min(100, Math.round((into / forLvl) * 100)), label: into + '/' + forLvl + ' XP' };
  },

  checkAchievements() {
    const p = this.getProfile(), newA = [];
    for (const [k, a] of Object.entries(ACHIEVEMENTS)) {
      if (!p.achievements.includes(k) && a.cond(p)) {
        p.achievements.push(k); newA.push({ key: k, ...a }); p.xp += XP_CONFIG.ACHIEVEMENT;
      }
    }
    if (newA.length > 0) this.set('profile', p);
    return newA;
  },

  getAchievements() {
    const p = this.getProfile();
    return Object.entries(ACHIEVEMENTS).map(([k, a]) => ({ key: k, ...a, unlocked: p.achievements.includes(k) }));
  },

  getDailyStatus() {
    const p = this.getProfile(), today = new Date().toDateString();
    if (p.dailyDate !== today) { p.dailyVotesToday = 0; p.dailyDate = today; this.set('profile', p); }
    const fl = Math.max(0, VERSUS_CONFIG.FREE_DAILY_QUESTIONS - p.dailyVotesToday + p.bonusQuestions);
    return {
      votesToday: p.dailyVotesToday, freeLeft: fl,
      shouldShowPaywall: p.dailyVotesToday >= VERSUS_CONFIG.FREE_DAILY_QUESTIONS && p.bonusQuestions <= 0,
      shouldShowAd: p.dailyVotesToday > 0 && p.dailyVotesToday % VERSUS_CONFIG.AD_EVERY_N_QUESTIONS === 0,
    };
  },

  incrementDailyVotes() {
    const p = this.getProfile(), today = new Date().toDateString();
    if (p.dailyDate !== today) { p.dailyVotesToday = 0; p.dailyDate = today; }
    p.dailyVotesToday++;
    if (p.dailyVotesToday > VERSUS_CONFIG.FREE_DAILY_QUESTIONS && p.bonusQuestions > 0) p.bonusQuestions--;
    this.set('profile', p);
  },

  addBonusQuestions(c) { const p = this.getProfile(); p.bonusQuestions = (p.bonusQuestions || 0) + c; this.set('profile', p); },
  getVotes() { return this.get('votes') || {}; },

  saveVote(qText, side, category, withMaj) {
    const votes = this.getVotes(); votes[qText] = { side, timestamp: Date.now() }; this.set('votes', votes);
    const p = this.getProfile(), today = new Date().toDateString(),
      lastDate = p.lastVoteDate ? new Date(p.lastVoteDate).toDateString() : null, hour = new Date().getHours();
    let streak = p.streak;
    if (lastDate === today) { /* same day */ }
    else if (lastDate === new Date(Date.now() - 86400000).toDateString()) streak++;
    else streak = 1;
    if (hour >= 0 && hour < 5) p.nightVotes = (p.nightVotes || 0) + 1;
    if (hour >= 5 && hour < 7) p.earlyVotes = (p.earlyVotes || 0) + 1;
    if (category && !p.categoriesSet.includes(category)) { p.categoriesSet.push(category); p.categoriesPlayed = p.categoriesSet.length; }
    if (withMaj === true) p.majorityVotes = (p.majorityVotes || 0) + 1;
    if (withMaj === false) p.minorityVotes = (p.minorityVotes || 0) + 1;
    this.updateProfile({
      totalVotes: p.totalVotes + 1, streak, bestStreak: Math.max(streak, p.bestStreak),
      lastVoteDate: Date.now(), nightVotes: p.nightVotes, earlyVotes: p.earlyVotes,
      categoriesSet: p.categoriesSet, categoriesPlayed: p.categoriesPlayed,
      majorityVotes: p.majorityVotes, minorityVotes: p.minorityVotes
    });
    this.incrementDailyVotes();
    let xpE = XP_CONFIG.VOTE + streak * XP_CONFIG.STREAK_BONUS;
    if (withMaj === false) xpE += XP_CONFIG.AGAINST_GRAIN;
    else if (withMaj === true) xpE += XP_CONFIG.MAJORITY;
    const xpR = this.addXP(xpE);
    const newA = this.checkAchievements();
    return { xpResult: xpR, newAchievements: newA, streak };
  },

  recordShare() {
    const p = this.getProfile(); p.shares = (p.shares || 0) + 1; this.set('profile', p);
    this.addXP(XP_CONFIG.SHARE); this.addBonusQuestions(VERSUS_CONFIG.SHARE_UNLOCK_BONUS);
    return this.checkAchievements();
  },

  hasVoted(q) { return (this.getVotes())[q] || null; },

  getVoteCounts(q, sA, sB) {
    const gv = this.get('globalVotes') || {}, qv = gv[q] || { a: 0, b: 0 },
      tA = sA + qv.a, tB = sB + qv.b, t = tA + tB;
    return { a: Math.round((tA / t) * 100), b: Math.round((tB / t) * 100), totalVotes: t };
  },

  addGlobalVote(q, side) {
    const gv = this.get('globalVotes') || {}; if (!gv[q]) gv[q] = { a: 0, b: 0 }; gv[q][side]++; this.set('globalVotes', gv);
  },

  reset() { Object.keys(localStorage).filter(k => k.startsWith(this.P)).forEach(k => localStorage.removeItem(k)); },
};
