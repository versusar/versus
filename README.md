# ⚡ Versus — Daily Opinion Battles

**Pick a side. See where the world stands.**

A progressive web app (PWA) with 230+ daily polarizing questions across 10 global categories and 8 regional packs. Vote, see live results, and share your takes.

---

## 🚀 Quick Deploy to GitHub Pages (Free, 5 min)

### Step 1: Create New Repository
1. Go to [github.com/new](https://github.com/new)
2. Name it: `versus`
3. Make it **Public**
4. Check **"Add a README file"**
5. Click **Create repository**

### Step 2: Upload Files
1. Click **"Add file"** → **"Upload files"**
2. Drag ALL files from this zip (keep folder structure):
   ```
   index.html
   manifest.json
   sw.js
   css/style.css
   js/questions.js
   js/storage.js
   js/app.js
   icons/icon-192.png
   icons/icon-512.png
   ```
3. Click **"Commit changes"**

> ⚠️ Do NOT upload the `backend/` folder to GitHub Pages — that's for your server setup later.

### Step 3: Enable GitHub Pages
1. Repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / Folder: **/ (root)**
4. Click **Save**
5. Wait 2 min → visit `https://YOURUSERNAME.github.io/versus/`

### Step 4: Install on iPhone
1. Open the URL in **Safari**
2. Tap **Share** → **Add to Home Screen**
3. Done — it works like a native app!

---

## 📱 What's Included

### 10 Global Categories (150 questions)
| Category | Topics |
|----------|--------|
| 🔥 Trending | AI, TikTok, crypto, phones, cancel culture |
| 🍕 Food & Lifestyle | Cereal debates, coffee, gym, cold showers |
| 💰 Money & Career | Side hustles, college debt, tipping, hustle culture |
| 🎬 Pop Culture | Marvel, Drake vs Kendrick, gaming, K-Pop |
| ⚽ Sports | GOAT debates, NFL, esports, analytics |
| 🌍 Global & Politics | UBI, climate, borders, 4-day work week |
| 🧠 General Knowledge | Simulation theory, aliens, déjà vu, free will |
| 🎭 Culture & Identity | Zodiac, introvert/extrovert, love, dogs vs cats |
| 🎵 Music, Movies & Entertainment | Beyoncé vs Taylor, Oscars, horror, albums |
| 📜 History | Moon landing, Roman Empire, pirates, Cold War |

### 8 Regional Packs (80 questions)
🇺🇸 US · 🇬🇧 UK · 🇳🇬 Nigeria/West Africa · 🇮🇳 India/South Asia · 🇧🇷 Latin America · 🇯🇵 East Asia · 🇦🇺 Australia · 🇪🇺 Europe

### Features
- Region selector with localized content
- Persistent votes (survives browser close)
- Animated results with percentage bars
- Streak tracking
- Native share (iOS share sheet)
- Offline support (PWA)
- Add to Home Screen

---

## 🔧 Backend Setup: Auto-Updating Questions (Free)

This gives you a self-updating app that fetches trending news daily and generates fresh questions automatically.

### Architecture
```
[News APIs] → [Cloudflare Worker] → [Supabase DB] → [Your App]
     ↓              (daily cron)        (stores Qs)     (reads Qs)
  Reddit, NewsAPI    Free tier           Free tier       Free (GitHub Pages)
```

### Step 1: Supabase Setup (Free)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project (free tier = 500MB, 50K rows)
3. Go to **SQL Editor** → **New Query**
4. Paste the entire contents of `backend/supabase-schema.sql`
5. Click **Run** — this creates all tables, indexes, and functions
6. Go to **Settings** → **API** and copy:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key (keep this private!)

### Step 2: Configure Your App
Open `js/storage.js` and update the config at the top:
```javascript
const VERSUS_CONFIG = {
  USE_SUPABASE: true,
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  WORKER_URL: 'https://versus-api.YOUR_SUBDOMAIN.workers.dev',
};
```

### Step 3: Seed Static Questions
```bash
cd backend
SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=your-key node seed-questions.js
```

### Step 4: Cloudflare Worker (Free)
1. Sign up at [workers.cloudflare.com](https://workers.cloudflare.com) (free = 100K req/day)
2. Install Wrangler: `npm install -g wrangler`
3. Login: `wrangler login`
4. From the `backend/` folder:
   ```bash
   wrangler init versus-worker
   # Replace worker.js with the one in backend/worker.js
   # Replace wrangler.toml with the one in backend/wrangler.toml
   ```
5. Add secrets:
   ```bash
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_SERVICE_KEY
   wrangler secret put NEWS_API_KEY  # optional, from newsapi.org
   ```
6. Deploy: `wrangler deploy`
7. Your API is live at `https://versus-api.YOUR_SUBDOMAIN.workers.dev`

### Step 5: Get a NewsAPI Key (Optional, Free)
1. Go to [newsapi.org](https://newsapi.org)
2. Sign up (free = 100 requests/day, plenty for daily generation)
3. Copy your API key
4. Add it: `wrangler secret put NEWS_API_KEY`

### How It Works
- Every day at 6 AM UTC, the Worker runs automatically
- It fetches trending headlines from NewsAPI + Reddit
- Converts them into Versus-style questions using pattern matching
- Stores them in Supabase with `is_approved: false`
- You approve them in Supabase dashboard (Table Editor → questions → toggle is_approved)
- Your app automatically shows approved questions

### Approving Questions
1. Go to Supabase Dashboard → Table Editor → `questions`
2. Filter by `is_approved = false`
3. Review each question, edit if needed
4. Toggle `is_approved` to `true`
5. They appear in the app instantly

---

## 💰 Monetization Playbook

### Phase 1: Launch (Free, Day 1)
- Add Ko-fi / Buy Me a Coffee tip jar link
- Add email signup (free Mailchimp or ConvertKit)
- Share on social media, Reddit, Product Hunt

### Phase 2: Growth (Free-$20/mo)
- **Sponsored questions**: "Nike vs Adidas?" — brands pay for this data
- **Affiliate links**: Questions about products → Amazon affiliate links
- **Google AdSense**: Ad interstitials between questions
- **Premium stats**: Free users see %, paid users see demographic breakdowns

### Phase 3: Scale ($20-100/mo)
- **Brand partnerships**: Monthly sponsored category takeovers
- **Data insights**: Anonymized trend reports for marketers
- **API access**: Let developers build on your vote data
- **White-label**: Sell customized versions to brands
- **Merch**: Viral moments → "Team Cereal Is Soup" merch via Printful

---

## 📁 File Structure

```
versus/
├── index.html              # Main app entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (offline support)
├── css/
│   └── style.css           # All styles + animations
├── js/
│   ├── questions.js        # 230 questions + 8 regional packs
│   ├── storage.js          # Local + Supabase storage layer
│   └── app.js              # App logic, screens, routing
├── icons/
│   ├── icon-192.png        # PWA icon
│   └── icon-512.png        # PWA icon (large)
└── backend/                # Server infrastructure (don't deploy to GH Pages)
    ├── supabase-schema.sql # Database schema — run in Supabase SQL Editor
    ├── worker.js           # Cloudflare Worker — auto question generator
    ├── wrangler.toml       # Worker config
    └── seed-questions.js   # Bulk import static questions to Supabase
```

---

## 📄 License

© 2026 [Your Name]. All rights reserved.
Proprietary software. You own all intellectual property rights.
