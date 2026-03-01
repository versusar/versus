// © 2026 VersuAR. All Rights Reserved.
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

const VS = {
  get(k) { return JSON.parse(localStorage.getItem('versus_' + k)); },
  set(k, v) { localStorage.setItem('versus_' + k, JSON.stringify(v)); },
  
  getProfile() {
    let p = this.get('profile');
    if (!p) {
      p = { username: null, xp: 0, level: 1, levelName: LEVELS[0].name, levelEmoji: LEVELS[0].emoji, totalVotes: 0, shares: 0, dailyVotes: 0, lastDailyReset: Date.now() };
      this.set('profile', p);
    }
    return p;
  },

  addXP(amt) {
    const p = this.getProfile();
    p.xp += amt;
    let nl = 1;
    LEVELS.forEach((l, i) => { if (p.xp >= l.xp) nl = i + 1; });
    const leveledUp = nl > p.level;
    p.level = nl;
    p.levelName = LEVELS[nl-1].name;
    p.levelEmoji = LEVELS[nl-1].emoji;
    this.set('profile', p);
    return { xp: amt, totalXP: p.xp, level: nl, leveledUp, levelName: p.levelName, emoji: p.levelEmoji };
  },

  getVoteCounts(qText, sA, sB) {
    const gv = this.get('globalVotes') || {};
    const qv = gv[qText] || { a: 0, b: 0 };
    const tA = sA + qv.a;
    const tB = sB + qv.b;
    const total = tA + tB;
    return { a: Math.round((tA / total) * 100), b: Math.round((tB / total) * 100) };
  },

  recordVote(qText, side, withMaj) {
    const gv = this.get('globalVotes') || {};
    if (!gv[qText]) gv[qText] = { a: 0, b: 0 };
    gv[qText][side]++;
    this.set('globalVotes', gv);

    const p = this.getProfile();
    p.totalVotes++;
    this.set('profile', p);

    let xpE = XP_CONFIG.VOTE;
    if (withMaj) xpE += XP_CONFIG.MAJORITY;
    return this.addXP(xpE);
  },

  recordShare() {
    const p = this.getProfile();
    p.shares++;
    this.set('profile', p);
    return this.addXP(XP_CONFIG.SHARE);
  }
};

window.VS = VS; // Critical Fix: Makes VS available to app.js
