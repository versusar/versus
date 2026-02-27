// === VERSUS — Storage v3: Gamification + Monetization ===

// =============================================
// CONFIG
// =============================================
const VERSUS_CONFIG = {
USE_SUPABASE: false,
SUPABASE_URL: ‘’,
SUPABASE_ANON_KEY: ‘’,
WORKER_URL: ‘’,

// Monetization
FREE_DAILY_QUESTIONS: 10,       // free questions per day before paywall
AD_EVERY_N_QUESTIONS: 5,        // show ad slot every N questions
SHARE_UNLOCK_BONUS: 5,          // bonus questions earned per share
};

// =============================================
// XP & LEVELING SYSTEM
// =============================================
const XP_CONFIG = {
VOTE: 10,                // XP per vote
STREAK_BONUS: 5,         // extra XP per streak day (multiplied by streak count)
DAILY_COMPLETE: 50,      // bonus for finishing daily challenge
SHARE: 25,               // XP for sharing
MAJORITY: 5,             // bonus if you voted with majority
AGAINST_GRAIN: 15,       // bigger bonus for minority (rewards boldness)
ACHIEVEMENT: 100,        // XP per achievement unlocked
};

const LEVELS = [
{ name: “Rookie”, emoji: “🐣”, xpNeeded: 0 },
{ name: “Opinionated”, emoji: “🗣️”, xpNeeded: 100 },
{ name: “Hot Taker”, emoji: “🔥”, xpNeeded: 300 },
{ name: “Debate Bro”, emoji: “⚔️”, xpNeeded: 600 },
{ name: “Trend Setter”, emoji: “📈”, xpNeeded: 1000 },
{ name: “Influence Lord”, emoji: “👑”, xpNeeded: 1800 },
{ name: “Versus Elite”, emoji: “💎”, xpNeeded: 3000 },
{ name: “Versus Legend”, emoji: “⚡”, xpNeeded: 5000 },
{ name: “Versus God”, emoji: “🌟”, xpNeeded: 10000 },
];

// =============================================
// ACHIEVEMENTS
// =============================================
const ACHIEVEMENTS = {
first_vote:       { name: “First Take”,       emoji: “🎯”, desc: “Cast your first vote”, condition: (s) => s.totalVotes >= 1 },
ten_votes:        { name: “Getting Warmed Up”, emoji: “🔟”, desc: “Cast 10 votes”, condition: (s) => s.totalVotes >= 10 },
fifty_votes:      { name: “On a Roll”,         emoji: “5️⃣0️⃣”, desc: “Cast 50 votes”, condition: (s) => s.totalVotes >= 50 },
hundred_votes:    { name: “Centurion”,         emoji: “💯”, desc: “Cast 100 votes”, condition: (s) => s.totalVotes >= 100 },
five_hundred:     { name: “Versus Addict”,     emoji: “🤯”, desc: “Cast 500 votes”, condition: (s) => s.totalVotes >= 500 },
streak_3:         { name: “Three-Peat”,        emoji: “3️⃣”, desc: “3-day streak”, condition: (s) => s.bestStreak >= 3 },
streak_7:         { name: “Week Warrior”,      emoji: “🗓️”, desc: “7-day streak”, condition: (s) => s.bestStreak >= 7 },
streak_30:        { name: “Monthly Monster”,   emoji: “📅”, desc: “30-day streak”, condition: (s) => s.bestStreak >= 30 },
all_categories:   { name: “Well Rounded”,      emoji: “🌈”, desc: “Vote in all 10 categories”, condition: (s) => s.categoriesPlayed >= 10 },
night_owl:        { name: “Night Owl”,         emoji: “🦉”, desc: “Vote after midnight”, condition: (s) => s.nightVotes >= 1 },
early_bird:       { name: “Early Bird”,        emoji: “🐦”, desc: “Vote before 7 AM”, condition: (s) => s.earlyVotes >= 1 },
contrarian:       { name: “Contrarian”,        emoji: “😈”, desc: “Vote against majority 10 times”, condition: (s) => s.minorityVotes >= 10 },
sheep:            { name: “Mainstream”,         emoji: “🐑”, desc: “Vote with majority 10 times”, condition: (s) => s.majorityVotes >= 10 },
sharer:           { name: “Influencer”,        emoji: “📤”, desc: “Share 5 results”, condition: (s) => s.shares >= 5 },
daily_complete:   { name: “Daily Grind”,       emoji: “✅”, desc: “Complete a daily challenge”, condition: (s) => s.dailiesCompleted >= 1 },
five_dailies:     { name: “Dedicated”,         emoji: “🏅”, desc: “Complete 5 daily challenges”, condition: (s) => s.dailiesCompleted >= 5 },
globe_trotter:    { name: “Globe Trotter”,     emoji: “🌍”, desc: “Play a regional pack”, condition: (s) => s.regionsPlayed >= 1 },
speed_demon:      { name: “Speed Demon”,       emoji: “⚡”, desc: “Answer 10 questions in under 60 seconds”, condition: (s) => s.speedRounds >= 1 },
level_5:          { name: “Rising Star”,       emoji: “⭐”, desc: “Reach Level 5”, condition: (s) => s.level >= 5 },
level_max:        { name: “Maxed Out”,         emoji: “🏆”, desc: “Reach max level”, condition: (s) => s.level >= LEVELS.length },
};

// =============================================
// MAIN STORAGE
// =============================================
const VersusStorage = {
PREFIX: ‘versus_’,

get(key) {
try {
const val = localStorage.getItem(this.PREFIX + key);
return val ? JSON.parse(val) : null;
} catch { return null; }
},

set(key, val) {
try {
localStorage.setItem(this.PREFIX + key, JSON.stringify(val));
} catch (e) { console.warn(‘Storage full:’, e); }
},

// — Profile —
getProfile() {
let p = this.get(‘profile’);
if (!p) {
p = {
id: ‘user_’ + Math.random().toString(36).substr(2, 9),
created: Date.now(),
xp: 0,
level: 1,
levelName: LEVELS[0].name,
levelEmoji: LEVELS[0].emoji,
streak: 0,
bestStreak: 0,
totalVotes: 0,
lastVoteDate: null,
shares: 0,
majorityVotes: 0,
minorityVotes: 0,
nightVotes: 0,
earlyVotes: 0,
categoriesPlayed: 0,
categoriesSet: [],
regionsPlayed: 0,
dailiesCompleted: 0,
speedRounds: 0,
achievements: [],
dailyVotesToday: 0,
dailyDate: null,
bonusQuestions: 0, // earned via sharing
};
this.set(‘profile’, p);
}
// Migration: add missing fields for existing users
if (p.xp === undefined) p.xp = p.totalVotes * 10;
if (p.achievements === undefined) p.achievements = [];
if (p.dailyVotesToday === undefined) p.dailyVotesToday = 0;
if (p.bonusQuestions === undefined) p.bonusQuestions = 0;
return p;
},

updateProfile(updates) {
const p = this.getProfile();
Object.assign(p, updates);
this.set(‘profile’, p);
return p;
},

// — XP & Leveling —
addXP(amount, reason) {
const p = this.getProfile();
p.xp += amount;

```
// Check level up
let newLevel = 1;
for (let i = LEVELS.length - 1; i >= 0; i--) {
  if (p.xp >= LEVELS[i].xpNeeded) {
    newLevel = i + 1;
    break;
  }
}

const leveledUp = newLevel > p.level;
p.level = newLevel;
p.levelName = LEVELS[newLevel - 1].name;
p.levelEmoji = LEVELS[newLevel - 1].emoji;
this.set('profile', p);

return { xpGained: amount, reason, totalXP: p.xp, level: newLevel, leveledUp, levelName: p.levelName, levelEmoji: p.levelEmoji };
```

},

getLevelProgress() {
const p = this.getProfile();
const currentLevelData = LEVELS[p.level - 1];
const nextLevelData = LEVELS[p.level] || null;

```
if (!nextLevelData) return { progress: 100, currentXP: p.xp, needed: 0, label: 'MAX LEVEL' };

const xpIntoLevel = p.xp - currentLevelData.xpNeeded;
const xpForLevel = nextLevelData.xpNeeded - currentLevelData.xpNeeded;
const progress = Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100));

return { progress, currentXP: p.xp, needed: nextLevelData.xpNeeded, xpForLevel, xpIntoLevel, label: `${xpIntoLevel}/${xpForLevel} XP` };
```

},

// — Achievements —
checkAchievements() {
const p = this.getProfile();
const newlyUnlocked = [];

```
for (const [key, ach] of Object.entries(ACHIEVEMENTS)) {
  if (!p.achievements.includes(key) && ach.condition(p)) {
    p.achievements.push(key);
    newlyUnlocked.push({ key, ...ach });
    // Bonus XP for achievement
    p.xp += XP_CONFIG.ACHIEVEMENT;
  }
}

if (newlyUnlocked.length > 0) {
  this.set('profile', p);
}

return newlyUnlocked;
```

},

getAchievements() {
const p = this.getProfile();
return Object.entries(ACHIEVEMENTS).map(([key, ach]) => ({
key,
…ach,
unlocked: p.achievements.includes(key),
}));
},

// — Daily Limit & Monetization —
getDailyStatus() {
const p = this.getProfile();
const today = new Date().toDateString();

```
// Reset daily count if new day
if (p.dailyDate !== today) {
  p.dailyVotesToday = 0;
  p.dailyDate = today;
  this.set('profile', p);
}

const freeLeft = Math.max(0, VERSUS_CONFIG.FREE_DAILY_QUESTIONS - p.dailyVotesToday + p.bonusQuestions);
const shouldShowPaywall = p.dailyVotesToday >= VERSUS_CONFIG.FREE_DAILY_QUESTIONS && p.bonusQuestions <= 0;
const shouldShowAd = p.dailyVotesToday > 0 && p.dailyVotesToday % VERSUS_CONFIG.AD_EVERY_N_QUESTIONS === 0;

return {
  votesToday: p.dailyVotesToday,
  freeLeft,
  shouldShowPaywall,
  shouldShowAd,
  bonusQuestions: p.bonusQuestions,
};
```

},

incrementDailyVotes() {
const p = this.getProfile();
const today = new Date().toDateString();
if (p.dailyDate !== today) {
p.dailyVotesToday = 0;
p.dailyDate = today;
}
p.dailyVotesToday++;

```
// Consume bonus questions after free limit
if (p.dailyVotesToday > VERSUS_CONFIG.FREE_DAILY_QUESTIONS && p.bonusQuestions > 0) {
  p.bonusQuestions--;
}

this.set('profile', p);
```

},

addBonusQuestions(count) {
const p = this.getProfile();
p.bonusQuestions = (p.bonusQuestions || 0) + count;
this.set(‘profile’, p);
},

// — Vote Tracking —
getVotes() { return this.get(‘votes’) || {}; },

saveVote(questionText, side, category, withMajority) {
const votes = this.getVotes();
votes[questionText] = { side, timestamp: Date.now() };
this.set(‘votes’, votes);

```
const p = this.getProfile();
const today = new Date().toDateString();
const lastDate = p.lastVoteDate ? new Date(p.lastVoteDate).toDateString() : null;
const hour = new Date().getHours();

// Streak
let streak = p.streak;
if (lastDate === today) { /* same day */ }
else if (lastDate === new Date(Date.now() - 86400000).toDateString()) { streak++; }
else { streak = 1; }

// Time-based tracking
if (hour >= 0 && hour < 5) p.nightVotes = (p.nightVotes || 0) + 1;
if (hour >= 5 && hour < 7) p.earlyVotes = (p.earlyVotes || 0) + 1;

// Category tracking
if (category && !p.categoriesSet.includes(category)) {
  p.categoriesSet.push(category);
  p.categoriesPlayed = p.categoriesSet.length;
}

// Majority/minority tracking
if (withMajority === true) p.majorityVotes = (p.majorityVotes || 0) + 1;
if (withMajority === false) p.minorityVotes = (p.minorityVotes || 0) + 1;

this.updateProfile({
  totalVotes: p.totalVotes + 1,
  streak,
  bestStreak: Math.max(streak, p.bestStreak),
  lastVoteDate: Date.now(),
  nightVotes: p.nightVotes,
  earlyVotes: p.earlyVotes,
  categoriesSet: p.categoriesSet,
  categoriesPlayed: p.categoriesPlayed,
  majorityVotes: p.majorityVotes,
  minorityVotes: p.minorityVotes,
});

this.incrementDailyVotes();

// Award XP
let xpEarned = XP_CONFIG.VOTE;
xpEarned += streak * XP_CONFIG.STREAK_BONUS;
if (withMajority === false) xpEarned += XP_CONFIG.AGAINST_GRAIN;
else if (withMajority === true) xpEarned += XP_CONFIG.MAJORITY;

const xpResult = this.addXP(xpEarned, 'vote');

// Check achievements
const newAchievements = this.checkAchievements();

// Supabase sync
if (VERSUS_CONFIG.USE_SUPABASE) {
  VersusCloud.submitVote(questionText, side).catch(() => {});
}

return { xpResult, newAchievements, streak };
```

},

recordShare() {
const p = this.getProfile();
p.shares = (p.shares || 0) + 1;
this.set(‘profile’, p);
this.addXP(XP_CONFIG.SHARE, ‘share’);
this.addBonusQuestions(VERSUS_CONFIG.SHARE_UNLOCK_BONUS);
return this.checkAchievements();
},

hasVoted(questionText) {
const votes = this.getVotes();
return votes[questionText] || null;
},

getVoteCounts(questionText, seedA, seedB) {
const localVotes = this.get(‘globalVotes’) || {};
const qVotes = localVotes[questionText] || { a: 0, b: 0 };
const totalA = seedA + qVotes.a;
const totalB = seedB + qVotes.b;
const total = totalA + totalB;
return {
a: Math.round((totalA / total) * 100),
b: Math.round((totalB / total) * 100),
totalVotes: total,
};
},

addGlobalVote(questionText, side) {
const globalVotes = this.get(‘globalVotes’) || {};
if (!globalVotes[questionText]) globalVotes[questionText] = { a: 0, b: 0 };
globalVotes[questionText][side]++;
this.set(‘globalVotes’, globalVotes);
},

getStats() {
const p = this.getProfile();
return { …p };
},

reset() {
Object.keys(localStorage).filter(k => k.startsWith(this.PREFIX)).forEach(k => localStorage.removeItem(k));
},
};

// =============================================
// CLOUD LAYER (same as before)
// =============================================
const VersusCloud = {
async submitVote(questionText, side) {
if (!VERSUS_CONFIG.USE_SUPABASE) return false;
try {
const p = VersusStorage.getProfile();
const res = await fetch(`${VERSUS_CONFIG.SUPABASE_URL}/rest/v1/votes`, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘apikey’: VERSUS_CONFIG.SUPABASE_ANON_KEY,
‘Authorization’: `Bearer ${VERSUS_CONFIG.SUPABASE_ANON_KEY}`,
‘Prefer’: ‘return=minimal’,
},
body: JSON.stringify({ question_text: questionText, side, user_id: p.id, region: VersusStorage.get(‘region’) || ‘global’ }),
});
return res.ok;
} catch { return false; }
},
};
