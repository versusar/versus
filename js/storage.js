// === VERSUS — Storage v2: Local + Supabase Live ===
// Works offline with localStorage, syncs to Supabase when available

// =============================================
// CONFIGURATION — Fill these in to go live
// =============================================
const VERSUS_CONFIG = {
  // Set to true once you've set up Supabase
  USE_SUPABASE: false,

  // Your Supabase project URL (from Settings → API)
  SUPABASE_URL: '',

  // Your Supabase ANON key (safe for client-side, from Settings → API)
  SUPABASE_ANON_KEY: '',

  // Your Cloudflare Worker URL (once deployed)
  WORKER_URL: '',
};

// =============================================
// LOCAL STORAGE LAYER
// =============================================
const VersusStorage = {
  PREFIX: 'versus_',

  get(key) {
    try {
      const val = localStorage.getItem(this.PREFIX + key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },

  set(key, val) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(val));
    } catch (e) { console.warn('Storage full:', e); }
  },

  // --- User Profile ---
  getProfile() {
    let profile = this.get('profile');
    if (!profile) {
      profile = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        created: Date.now(),
        streak: 0,
        bestStreak: 0,
        totalVotes: 0,
        lastVoteDate: null,
      };
      this.set('profile', profile);
    }
    return profile;
  },

  updateProfile(updates) {
    const profile = this.getProfile();
    Object.assign(profile, updates);
    this.set('profile', profile);
    return profile;
  },

  // --- Vote Tracking ---
  getVotes() {
    return this.get('votes') || {};
  },

  saveVote(questionText, side) {
    const votes = this.getVotes();
    votes[questionText] = { side, timestamp: Date.now() };
    this.set('votes', votes);

    const profile = this.getProfile();
    const today = new Date().toDateString();
    const lastDate = profile.lastVoteDate ? new Date(profile.lastVoteDate).toDateString() : null;

    let streak = profile.streak;
    if (lastDate === today) {
      // Same day
    } else if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
      streak++;
    } else {
      streak = 1;
    }

    this.updateProfile({
      totalVotes: profile.totalVotes + 1,
      streak,
      bestStreak: Math.max(streak, profile.bestStreak),
      lastVoteDate: Date.now(),
    });

    // Sync to Supabase if enabled
    if (VERSUS_CONFIG.USE_SUPABASE) {
      VersusCloud.submitVote(questionText, side).catch(() => {});
    }

    return { votes, profile: this.getProfile() };
  },

  hasVoted(questionText) {
    const votes = this.getVotes();
    return votes[questionText] || null;
  },

  // --- Vote Counts (local simulation + cloud) ---
  getVoteCounts(questionText, seedA, seedB) {
    const localVotes = this.get('globalVotes') || {};
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
    const globalVotes = this.get('globalVotes') || {};
    if (!globalVotes[questionText]) {
      globalVotes[questionText] = { a: 0, b: 0 };
    }
    globalVotes[questionText][side]++;
    this.set('globalVotes', globalVotes);
  },

  // --- Stats ---
  getStats() {
    const profile = this.getProfile();
    const votes = this.getVotes();
    const voteList = Object.values(votes);
    return {
      totalVotes: profile.totalVotes,
      streak: profile.streak,
      bestStreak: profile.bestStreak,
      favorSideA: voteList.filter(v => v.side === 'a').length,
      favorSideB: voteList.filter(v => v.side === 'b').length,
      memberSince: profile.created,
    };
  },

  reset() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  },
};

// =============================================
// SUPABASE CLOUD LAYER
// =============================================
const VersusCloud = {
  // Submit a vote to Supabase
  async submitVote(questionText, side) {
    if (!VERSUS_CONFIG.USE_SUPABASE) return false;

    try {
      const profile = VersusStorage.getProfile();
      const region = VersusStorage.get('region') || 'global';

      const res = await fetch(`${VERSUS_CONFIG.SUPABASE_URL}/rest/v1/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': VERSUS_CONFIG.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${VERSUS_CONFIG.SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          question_text: questionText,
          side: side,
          user_id: profile.id,
          region: region,
        }),
      });
      return res.ok;
    } catch (e) {
      console.warn('Cloud vote failed (offline?):', e);
      return false;
    }
  },

  // Fetch live vote counts from Supabase
  async getVoteCounts(questionText) {
    if (!VERSUS_CONFIG.USE_SUPABASE) return null;

    try {
      const encoded = encodeURIComponent(questionText);
      const res = await fetch(
        `${VERSUS_CONFIG.SUPABASE_URL}/rest/v1/votes?question_text=eq.${encoded}&select=side`,
        {
          headers: {
            'apikey': VERSUS_CONFIG.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${VERSUS_CONFIG.SUPABASE_ANON_KEY}`,
          },
        }
      );
      const data = await res.json();
      const a = data.filter(v => v.side === 'a').length;
      const b = data.filter(v => v.side === 'b').length;
      return { a, b, total: a + b };
    } catch {
      return null;
    }
  },

  // Fetch fresh daily questions from Cloudflare Worker
  async fetchDailyQuestions(region) {
    if (!VERSUS_CONFIG.WORKER_URL) return null;

    try {
      const res = await fetch(
        `${VERSUS_CONFIG.WORKER_URL}/questions?region=${encodeURIComponent(region)}`
      );
      const data = await res.json();

      // Convert Supabase format to app format
      return data.map(q => ({
        q: q.question,
        a: q.option_a,
        b: q.option_b,
        seed: [q.seed_a + (q.count_a || 0), q.seed_b + (q.count_b || 0)],
        category: q.category,
        cloud_id: q.id,
      }));
    } catch {
      return null;
    }
  },
};

// =============================================
// DYNAMIC QUESTION LOADER
// =============================================
// Call this on app init to merge cloud + static questions
async function loadQuestions(region) {
  // Always start with static questions
  let questions = region && region !== 'global'
    ? getAllWithRegion(region)
    : [...ALL_QUESTIONS];

  // Try to fetch cloud questions
  if (VERSUS_CONFIG.USE_SUPABASE && VERSUS_CONFIG.WORKER_URL) {
    try {
      const cloudQs = await VersusCloud.fetchDailyQuestions(region || 'global');
      if (cloudQs && cloudQs.length > 0) {
        // Add cloud questions, deduplicating by question text
        const existingTexts = new Set(questions.map(q => q.q));
        for (const cq of cloudQs) {
          if (!existingTexts.has(cq.q)) {
            questions.push(cq);
            existingTexts.add(cq.q);
          }
        }
        console.log(`Loaded ${cloudQs.length} cloud questions`);
      }
    } catch (e) {
      console.warn('Cloud question fetch failed:', e);
    }
  }

  return questions;
}
