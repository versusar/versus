// © 2026 VersuAR. All Rights Reserved.
// Unauthorized copying, modification, or distribution is strictly prohibited.
// See LICENSE file for full terms.

// === VERSUS — Questions Database v2 ===
// 10 global categories + 8 regional packs = 230+ questions

const CATEGORIES = {
  "🔥 Trending": [
    { q: "AI will replace most jobs in 10 years", a: "Agree", b: "No Way", seed: [62, 38] },
    { q: "TikTok is more influential than Google", a: "Facts", b: "Cap", seed: [57, 43] },
    { q: "Remote work is better than office life", a: "100%", b: "Office Wins", seed: [71, 29] },
    { q: "Crypto is the future of money", a: "To the Moon", b: "It's a Scam", seed: [48, 52] },
    { q: "Social media does more harm than good", a: "Sadly Yes", b: "Nah It's Great", seed: [64, 36] },
    { q: "AI-generated art is real art", a: "Art is Art", b: "Not Real Art", seed: [41, 59] },
    { q: "Phones should be banned in schools", a: "Ban Them", b: "Let Kids Choose", seed: [58, 42] },
    { q: "Influencers are the new celebrities", a: "Already Are", b: "Not the Same", seed: [66, 34] },
    { q: "Cancel culture has gone too far", a: "Way Too Far", b: "Accountability", seed: [54, 46] },
    { q: "We're too dependent on our phones", a: "Way Too Much", b: "It's Fine", seed: [82, 18] },
    { q: "Lab-grown meat will replace real meat", a: "It's Coming", b: "Never", seed: [43, 57] },
    { q: "Self-driving cars everywhere by 2030", a: "Inevitable", b: "Not That Fast", seed: [44, 56] },
    { q: "Digital detoxes actually work", a: "Life Changing", b: "Temporary Fix", seed: [47, 53] },
    { q: "AI chatbots will replace therapists", a: "Could Happen", b: "Never", seed: [28, 72] },
    { q: "You'd let AI plan your entire wedding", a: "Why Not", b: "Absolutely Not", seed: [29, 71] },
  ],
  "🍕 Food & Lifestyle": [
    { q: "Is cereal a soup?", a: "Obviously Yes", b: "Absolutely Not", seed: [34, 66] },
    { q: "Pineapple on pizza", a: "Delicious", b: "Criminal", seed: [42, 58] },
    { q: "Give up coffee forever for $50K?", a: "Pay Me", b: "Keep Your Money", seed: [39, 61] },
    { q: "Breakfast for dinner is elite", a: "Top Tier", b: "Overrated", seed: [76, 24] },
    { q: "Water is wet", a: "Duh", b: "Actually No", seed: [55, 45] },
    { q: "Hot dog is a sandwich", a: "Technically Yes", b: "How Dare You", seed: [38, 62] },
    { q: "Ketchup on eggs", a: "A Must", b: "Disgusting", seed: [47, 53] },
    { q: "5-second rule is valid", a: "Always", b: "That's Gross", seed: [52, 48] },
    { q: "Boneless wings are just nuggets", a: "Literally Same", b: "They're Different", seed: [61, 39] },
    { q: "Avocado toast is overpriced", a: "Highway Robbery", b: "Worth It", seed: [64, 36] },
    { q: "Cold showers are superior", a: "Refreshing", b: "Torture", seed: [35, 65] },
    { q: "Ranch goes on everything", a: "On Everything", b: "Overrated", seed: [53, 47] },
    { q: "Midnight snacking is self-care", a: "Absolutely", b: "Bad Habit", seed: [59, 41] },
    { q: "Gym at 5 AM or 10 PM?", a: "5 AM Grind", b: "Night Owl", seed: [43, 57] },
    { q: "One food forever for $1M/year", a: "Easy Money", b: "Not Worth It", seed: [56, 44] },
  ],
  "💰 Money & Career": [
    { q: "$1M but never travel again?", a: "Show Me Money", b: "No Deal", seed: [35, 65] },
    { q: "Side hustles are necessary in 2026", a: "Essential", b: "Overblown", seed: [73, 27] },
    { q: "College degree is worth the debt", a: "Still Worth It", b: "Waste of Money", seed: [41, 59] },
    { q: "Toxic boss for $500K/yr?", a: "I'd Survive", b: "Never", seed: [47, 53] },
    { q: "Renting is smarter than buying now", a: "Rent Gang", b: "Build Equity", seed: [52, 48] },
    { q: "Tipping culture needs to end", a: "Just Pay People", b: "Keep Tipping", seed: [67, 33] },
    { q: "Quiet quitting = setting boundaries", a: "Exactly", b: "It's Slacking", seed: [71, 29] },
    { q: "Company loyalty is dead", a: "Long Dead", b: "Still Matters", seed: [76, 24] },
    { q: "Financial literacy mandatory in school", a: "100%", b: "Enough Classes", seed: [89, 11] },
    { q: "Hustle culture is toxic", a: "Burnout City", b: "It's Motivation", seed: [62, 38] },
    { q: "$10M but no internet ever again", a: "I'll Adjust", b: "Keep It", seed: [33, 67] },
    { q: "25 is too late to switch careers", a: "Never Too Late", b: "It's Risky", seed: [84, 16] },
    { q: "Everyone should learn to code", a: "Essential", b: "Not for Everyone", seed: [44, 56] },
    { q: "50% pay cut for dream job?", a: "Heartbeat", b: "Bills Don't Care", seed: [38, 62] },
    { q: "Rich & famous or rich & anonymous?", a: "Famous", b: "Anonymous", seed: [31, 69] },
  ],
  "🎬 Pop Culture": [
    { q: "Marvel movies peaked already", a: "They're Done", b: "Best Yet to Come", seed: [61, 39] },
    { q: "Drake or Kendrick?", a: "Drizzy", b: "K-Dot", seed: [43, 57] },
    { q: "Reality TV is 100% scripted", a: "Obviously", b: "Some Is Real", seed: [78, 22] },
    { q: "Streaming killed the music industry", a: "100%", b: "It Evolved It", seed: [45, 55] },
    { q: "Gaming is a real sport", a: "Respect It", b: "Not a Sport", seed: [67, 33] },
    { q: "Reboots and sequels need to stop", a: "Please Stop", b: "Some Are Great", seed: [58, 42] },
    { q: "Anime > Western animation", a: "Way Better", b: "Both Great", seed: [49, 51] },
    { q: "Movie theaters are dying", a: "Sadly Yes", b: "They'll Survive", seed: [53, 47] },
    { q: "Pop music peaked in the 2000s", a: "Golden Era", b: "Now Is Better", seed: [51, 49] },
    { q: "K-Pop is the biggest genre worldwide", a: "No Doubt", b: "Not Quite", seed: [46, 54] },
    { q: "Podcasts are replacing radio", a: "Already Have", b: "Radio Lives", seed: [68, 32] },
    { q: "Nostalgia = most powerful marketing", a: "Gets Me Every Time", b: "I See Through It", seed: [72, 28] },
    { q: "Vinyl sounds better than digital", a: "Night and Day", b: "Placebo", seed: [42, 58] },
    { q: "Book was better than the movie", a: "Always", b: "Movies Can Win", seed: [63, 37] },
    { q: "Stand-up comedy golden age?", a: "Absolutely", b: "It's Declining", seed: [55, 45] },
  ],
  "⚽ Sports": [
    { q: "Messi is the GOAT, debate over", a: "Messi Forever", b: "Ronaldo Clear", seed: [54, 46] },
    { q: "The NFL is rigged", a: "Suspicious...", b: "Fair Game", seed: [38, 62] },
    { q: "Women's sports deserve equal pay", a: "Absolutely", b: "Market Decides", seed: [63, 37] },
    { q: "Basketball > Football", a: "Hoops", b: "Gridiron", seed: [46, 54] },
    { q: "Olympics should add esports", a: "Overdue", b: "Keep It Classic", seed: [58, 42] },
    { q: "LeBron or Jordan?", a: "King James", b: "MJ Forever", seed: [41, 59] },
    { q: "Soccer is boring to watch", a: "So Boring", b: "You Don't Get It", seed: [37, 63] },
    { q: "Analytics ruined sports", a: "Killed the Vibe", b: "Made It Smarter", seed: [43, 57] },
    { q: "Student athletes should be paid more", a: "Way More", b: "NIL Is Enough", seed: [68, 32] },
    { q: "Home field advantage is real", a: "Massive", b: "Overblown", seed: [72, 28] },
    { q: "F1 or NASCAR?", a: "Formula 1", b: "NASCAR", seed: [64, 36] },
    { q: "Golf is a real sport", a: "Absolutely", b: "It's a Game", seed: [55, 45] },
    { q: "Refs should be replaced by AI", a: "Please", b: "Human Element", seed: [47, 53] },
    { q: "Trash talk is part of the game", a: "Essential", b: "Unsportsmanlike", seed: [71, 29] },
    { q: "Swimming is the hardest sport", a: "Most Demanding", b: "Others Harder", seed: [39, 61] },
  ],
  "🌍 Global & Politics": [
    { q: "Universal basic income should happen", a: "Long Overdue", b: "Bad Idea", seed: [56, 44] },
    { q: "Space exploration is worth the cost", a: "Invest More", b: "Fix Earth First", seed: [49, 51] },
    { q: "Social media regulated like tobacco", a: "Yes Please", b: "Free Speech", seed: [52, 48] },
    { q: "4-day work week will be standard", a: "Inevitable", b: "Wishful Thinking", seed: [68, 32] },
    { q: "Climate change is #1 global threat", a: "No Question", b: "Overhyped", seed: [61, 39] },
    { q: "Voting should be mandatory", a: "For Everyone", b: "Authoritarian", seed: [45, 55] },
    { q: "Billionaires shouldn't exist", a: "Cap Wealth", b: "They Earned It", seed: [57, 43] },
    { q: "Nuclear energy is the solution", a: "Go Nuclear", b: "Too Risky", seed: [53, 47] },
    { q: "Privacy is dead in the digital age", a: "Already Gone", b: "Fight Back", seed: [58, 42] },
    { q: "Democracy is the best system", a: "Best We Have", b: "It's Flawed", seed: [61, 39] },
    { q: "Education should be free worldwide", a: "Absolutely", b: "Someone Pays", seed: [74, 26] },
    { q: "Countries should have open borders", a: "Free Movement", b: "Need Borders", seed: [34, 66] },
    { q: "English should be the global language", a: "Already Is", b: "Preserve Diversity", seed: [39, 61] },
    { q: "War is ever justified", a: "Sometimes", b: "Never", seed: [52, 48] },
    { q: "World government will happen someday", a: "Eventually", b: "Never", seed: [36, 64] },
  ],
  "🧠 General Knowledge": [
    { q: "Humans only use 10% of their brain", a: "I Believe It", b: "That's a Myth", seed: [44, 56] },
    { q: "Time travel will be possible someday", a: "Eventually", b: "Never", seed: [53, 47] },
    { q: "We live in a simulation", a: "Probably", b: "Touch Grass", seed: [41, 59] },
    { q: "Books are always better than movies", a: "Always", b: "Depends", seed: [37, 63] },
    { q: "Aliens have already visited Earth", a: "They're Here", b: "Not Yet", seed: [39, 61] },
    { q: "Déjà vu is a glitch in the matrix", a: "100%", b: "Brain Science", seed: [48, 52] },
    { q: "Rather know when or how you die?", a: "When", b: "How", seed: [54, 46] },
    { q: "Free will is an illusion", a: "We're Programmed", b: "We Choose", seed: [42, 58] },
    { q: "Math is discovered, not invented", a: "Discovered", b: "Invented", seed: [51, 49] },
    { q: "Parallel universes exist", a: "Has to Be", b: "Sci-Fi", seed: [57, 43] },
    { q: "Dreams have hidden meanings", a: "Deep Truths", b: "Random Neurons", seed: [53, 47] },
    { q: "Humans are still evolving", a: "Definitely", b: "We've Peaked", seed: [68, 32] },
    { q: "The ocean is scarier than space", a: "Way Scarier", b: "Space Worse", seed: [62, 38] },
    { q: "Common sense is actually common", a: "Nope", b: "Most Have It", seed: [73, 27] },
    { q: "You could survive a zombie apocalypse", a: "I'd Make It", b: "I'm Toast", seed: [45, 55] },
  ],
  "🎭 Culture & Identity": [
    { q: "Your zodiac sign matters", a: "Stars Know", b: "Nonsense", seed: [39, 61] },
    { q: "Introvert or extrovert?", a: "Introvert Gang", b: "Extrovert Energy", seed: [62, 38] },
    { q: "Tattoos are unprofessional", a: "Outdated View", b: "Depends on Job", seed: [71, 29] },
    { q: "Marriage is outdated", a: "Old Tradition", b: "Still Beautiful", seed: [38, 62] },
    { q: "Social media shows the real you", a: "Highlight Reel", b: "It's Authentic", seed: [81, 19] },
    { q: "Money can buy happiness", a: "Up to a Point", b: "It Really Can", seed: [62, 38] },
    { q: "28 is old", a: "Practically Ancient", b: "Still Young", seed: [22, 78] },
    { q: "Your 20s are the best years", a: "Peak Life", b: "Gets Better", seed: [44, 56] },
    { q: "True love exists", a: "It's Real", b: "It's Fantasy", seed: [67, 33] },
    { q: "Dogs or cats?", a: "Dog Person", b: "Cat Person", seed: [57, 43] },
    { q: "Pyjamas all day is a lifestyle", a: "Living Dream", b: "Get Dressed", seed: [64, 36] },
    { q: "Nature or nurture shapes you more", a: "Born This Way", b: "Environment", seed: [43, 57] },
    { q: "Revenge is ever justified", a: "Sometimes", b: "Rise Above", seed: [46, 54] },
    { q: "Cultural appropriation vs appreciation", a: "There's a Line", b: "All Sharing", seed: [56, 44] },
    { q: "Tradition or progress?", a: "Keep Traditions", b: "Always Progress", seed: [41, 59] },
  ],
  "🎵 Music, Movies & Entertainment": [
    { q: "Beyoncé or Taylor Swift?", a: "Queen Bey", b: "Swifties Rise", seed: [48, 52] },
    { q: "Practical effects > CGI", a: "Always Better", b: "CGI Is Amazing", seed: [61, 39] },
    { q: "Autotune ruined music", a: "Killed Talent", b: "It's a Tool", seed: [47, 53] },
    { q: "Horror is the best movie genre", a: "Nothing Beats It", b: "Overrated", seed: [44, 56] },
    { q: "Live concerts or studio recordings?", a: "Live Energy", b: "Studio Perfection", seed: [58, 42] },
    { q: "The Oscars still matter", a: "Prestige", b: "Out of Touch", seed: [34, 66] },
    { q: "Hip-hop is the most influential genre ever", a: "Changed Everything", b: "Rock Says Hi", seed: [56, 44] },
    { q: "Subtitles or dubbed?", a: "Subs Always", b: "Dubs Are Fine", seed: [72, 28] },
    { q: "Short-form content is killing creativity", a: "Destroying Art", b: "New Art Form", seed: [51, 49] },
    { q: "The villain makes or breaks the movie", a: "100% True", b: "Hero Matters More", seed: [67, 33] },
    { q: "Albums are dead, it's all singles now", a: "Singles Era", b: "Albums Forever", seed: [53, 47] },
    { q: "90s music > current music", a: "Golden Era", b: "Nostalgia Goggles", seed: [55, 45] },
    { q: "Biopics are lazy filmmaking", a: "So Lazy", b: "Great Stories", seed: [42, 58] },
    { q: "Playlists > personal album collections", a: "Playlists Win", b: "Albums Have Soul", seed: [49, 51] },
    { q: "A remake has never topped the original", a: "Never Ever", b: "Some Did", seed: [58, 42] },
  ],
  "📜 History": [
    { q: "History is written by the winners", a: "Always Has Been", b: "More Complex", seed: [64, 36] },
    { q: "Moon landing = humanity's greatest achievement", a: "Peak Humanity", b: "Other Things Top It", seed: [57, 43] },
    { q: "We've learned from history's mistakes", a: "Some Lessons", b: "We Repeat Everything", seed: [31, 69] },
    { q: "Ancient civilizations were more advanced than we think", a: "Way More", b: "We Overestimate", seed: [62, 38] },
    { q: "Printing press or internet — bigger impact?", a: "Printing Press", b: "Internet", seed: [38, 62] },
    { q: "Cleopatra lived closer to the iPhone than the pyramids", a: "Mind Blown", b: "I Knew That", seed: [71, 29] },
    { q: "Napoleon was average height for his time", a: "Propaganda Won", b: "Still Short Energy", seed: [59, 41] },
    { q: "The Dark Ages weren't actually that dark", a: "Misunderstood", b: "Pretty Dark", seed: [46, 54] },
    { q: "The Roman Empire could have survived", a: "If Things Changed", b: "Inevitable Fall", seed: [43, 57] },
    { q: "Pirates were more democratic than most governments", a: "Surprisingly True", b: "Still Criminals", seed: [52, 48] },
    { q: "WWI was more impactful than WWII", a: "Changed Everything", b: "WWII Was Bigger", seed: [41, 59] },
    { q: "Return historical artifacts to origin countries", a: "Absolutely", b: "Museums Preserve Them", seed: [63, 37] },
    { q: "The Cold War never really ended", a: "Still Going", b: "It's Over", seed: [55, 45] },
    { q: "Genghis Khan shaped the modern world most", a: "Underrated Impact", b: "Others More", seed: [47, 53] },
    { q: "History classes focus too much on wars", a: "Way Too Much", b: "Wars Shape Everything", seed: [58, 42] },
  ],
};

// ========================
// REGIONAL QUESTION PACKS
// ========================
const REGIONS = {
  "🇺🇸 United States": [
    { q: "In-N-Out or Chick-fil-A?", a: "In-N-Out", b: "Chick-fil-A", seed: [46, 54] },
    { q: "East Coast or West Coast?", a: "East Coast", b: "West Coast", seed: [47, 53] },
    { q: "The American Dream is still alive", a: "Alive & Well", b: "Long Gone", seed: [38, 62] },
    { q: "Tipping should be abolished in the US", a: "End It", b: "Keep Tipping", seed: [61, 39] },
    { q: "NYC or LA?", a: "New York", b: "Los Angeles", seed: [55, 45] },
    { q: "College football > NFL", a: "CFB Hits Different", b: "NFL Is King", seed: [43, 57] },
    { q: "US healthcare system is broken", a: "Completely", b: "Needs Reform Not Broken", seed: [74, 26] },
    { q: "Thanksgiving is the best holiday", a: "Nothing Beats It", b: "Overrated", seed: [58, 42] },
    { q: "Student loan forgiveness should happen", a: "Forgive It All", b: "Pay What You Owe", seed: [56, 44] },
    { q: "Texas or California?", a: "Lone Star", b: "Golden State", seed: [48, 52] },
  ],
  "🇬🇧 United Kingdom": [
    { q: "Tea or coffee?", a: "Tea Forever", b: "Coffee Convert", seed: [67, 33] },
    { q: "London is overrated", a: "Massively", b: "It's the Best", seed: [52, 48] },
    { q: "Premier League is the best league", a: "Obviously", b: "La Liga/Serie A", seed: [64, 36] },
    { q: "Chips > fries", a: "Proper Chips", b: "Fries Are Better", seed: [71, 29] },
    { q: "The monarchy should be abolished", a: "Past Its Time", b: "Keep the Crown", seed: [48, 52] },
    { q: "British humour is the best", a: "Unmatched", b: "Bit Dry Innit", seed: [63, 37] },
    { q: "North or South England?", a: "Up North", b: "Down South", seed: [49, 51] },
    { q: "NHS is the UK's greatest achievement", a: "Absolutely", b: "Needs Fixing", seed: [58, 42] },
    { q: "Greggs is elite", a: "National Treasure", b: "Just a Bakery", seed: [72, 28] },
    { q: "Cream first or jam first on scone?", a: "Cream First", b: "Jam First", seed: [45, 55] },
  ],
  "🇳🇬 Nigeria & West Africa": [
    { q: "Jollof: Nigeria or Ghana?", a: "Naija Jollof", b: "Ghana Jollof", seed: [58, 42] },
    { q: "Afrobeats is the biggest genre globally", a: "Undeniable", b: "Not Yet", seed: [63, 37] },
    { q: "Wizkid or Davido?", a: "Starboy", b: "OBO", seed: [51, 49] },
    { q: "Nollywood > Hollywood", a: "Our Stories", b: "Hollywood Still", seed: [44, 56] },
    { q: "Lagos is the real capital of Africa", a: "No Debate", b: "That's Bold", seed: [57, 43] },
    { q: "African parents are the strictest", a: "No Contest", b: "Asian Parents Tho", seed: [53, 47] },
    { q: "Owambe parties are the world's best", a: "Unmatched", b: "Other Cultures Too", seed: [68, 32] },
    { q: "Suya is the world's best street food", a: "Nothing Compares", b: "Other Street Food", seed: [61, 39] },
    { q: "Tech will make Africa a superpower", a: "Watch Us Rise", b: "Long Road Ahead", seed: [55, 45] },
    { q: "NEPA/light is the biggest Nigerian struggle", a: "Daily Pain", b: "Traffic Is Worse", seed: [52, 48] },
  ],
  "🇮🇳 India & South Asia": [
    { q: "Cricket is the greatest sport ever", a: "No Debate", b: "Football Exists", seed: [67, 33] },
    { q: "Bollywood or Hollywood?", a: "Bollywood", b: "Hollywood", seed: [52, 48] },
    { q: "Arranged marriages can work", a: "They Do", b: "Love Marriage Only", seed: [54, 46] },
    { q: "Sachin or Virat?", a: "Sachin Forever", b: "King Kohli", seed: [48, 52] },
    { q: "Biryani: Hyderabad or Lucknow?", a: "Hyderabadi", b: "Lucknowi", seed: [56, 44] },
    { q: "Indian street food is the best globally", a: "Unbeatable", b: "Other Countries Too", seed: [71, 29] },
    { q: "IIT/IIM pressure is too much", a: "Way Too Much", b: "Builds Character", seed: [63, 37] },
    { q: "Chai > every other drink", a: "Always Chai", b: "Coffee Better", seed: [65, 35] },
    { q: "India will be a superpower by 2040", a: "Believe It", b: "Long Way to Go", seed: [49, 51] },
    { q: "Diwali is the best festival on Earth", a: "Nothing Compares", b: "Other Festivals", seed: [62, 38] },
  ],
  "🇧🇷 Latin America": [
    { q: "Football is a religion, not a sport", a: "Amen", b: "Calm Down", seed: [72, 28] },
    { q: "Reggaeton is the global sound", a: "Runs the World", b: "Oversaturated", seed: [58, 42] },
    { q: "Tacos or arepas?", a: "Tacos", b: "Arepas", seed: [52, 48] },
    { q: "Telenovelas > Hollywood dramas", a: "More Passion", b: "Too Dramatic", seed: [49, 51] },
    { q: "Carnival in Rio is the best party on Earth", a: "Nothing Beats It", b: "Other Festivals", seed: [64, 36] },
    { q: "Maradona or Pelé?", a: "El Diego", b: "O Rei", seed: [47, 53] },
    { q: "Bad Bunny is this generation's biggest artist", a: "Globally", b: "In Latin Music Maybe", seed: [55, 45] },
    { q: "Family lunch on Sunday is non-negotiable", a: "Sacred", b: "Sometimes Skip", seed: [78, 22] },
    { q: "Latin America has the best biodiversity", a: "Unmatched", b: "Africa/Asia Too", seed: [61, 39] },
    { q: "Empanadas are the perfect food", a: "Perfection", b: "Other Foods Compete", seed: [66, 34] },
  ],
  "🇯🇵 East Asia": [
    { q: "Anime is the highest art form", a: "Unmatched", b: "One of Many", seed: [53, 47] },
    { q: "K-drama or J-drama?", a: "K-Drama", b: "J-Drama", seed: [62, 38] },
    { q: "Ramen or pho?", a: "Ramen", b: "Pho", seed: [51, 49] },
    { q: "Asian work culture needs reform", a: "Desperately", b: "Produces Results", seed: [69, 31] },
    { q: "K-Pop idols work harder than anyone", a: "No Question", b: "Others Too", seed: [57, 43] },
    { q: "Manga > American comics", a: "Not Even Close", b: "Comics Are Great", seed: [58, 42] },
    { q: "Japanese convenience stores are the best", a: "Life-Changing", b: "Just a Store", seed: [74, 26] },
    { q: "Samsung or Sony?", a: "Samsung", b: "Sony", seed: [52, 48] },
    { q: "East Asian beauty standards are too strict", a: "Way Too Much", b: "Every Culture", seed: [61, 39] },
    { q: "Sushi is overrated", a: "Fight Me", b: "Pure Perfection", seed: [28, 72] },
  ],
  "🇦🇺 Australia & Oceania": [
    { q: "Vegemite is delicious", a: "Aussie Classic", b: "Absolutely Not", seed: [52, 48] },
    { q: "Australia = best quality of life", a: "No Doubt", b: "Other Places", seed: [58, 42] },
    { q: "AFL or NRL?", a: "AFL", b: "NRL", seed: [53, 47] },
    { q: "Drop bears are real", a: "Stay Alert", b: "Nice Try", seed: [34, 66] },
    { q: "Melbourne or Sydney?", a: "Melbourne", b: "Sydney", seed: [51, 49] },
    { q: "Flat white > latte", a: "Superior", b: "Same Thing", seed: [63, 37] },
    { q: "Everything in Australia is trying to kill you", a: "Literally", b: "Exaggerated", seed: [56, 44] },
    { q: "Bunnings snag is the best value meal", a: "Unbeatable", b: "Just a Sausage", seed: [71, 29] },
    { q: "New Zealand is Australia's sibling", a: "Basically", b: "Completely Different", seed: [38, 62] },
    { q: "The Ashes > any other cricket series", a: "Peak Cricket", b: "World Cup More", seed: [47, 53] },
  ],
  "🇪🇺 Europe": [
    { q: "Football is the only real sport", a: "Beautiful Game", b: "Other Sports Exist", seed: [61, 39] },
    { q: "Mediterranean diet is the healthiest", a: "Science Says Yes", b: "Other Diets Too", seed: [66, 34] },
    { q: "European public transport > everywhere", a: "Levels Above", b: "Some Compete", seed: [72, 28] },
    { q: "Paris is overrated", a: "Tourist Trap", b: "Still Magical", seed: [49, 51] },
    { q: "Europeans have better work-life balance", a: "Way Better", b: "Depends on Country", seed: [68, 32] },
    { q: "Italian food is the best cuisine", a: "Nothing Beats It", b: "French/Asian/Other", seed: [58, 42] },
    { q: "Champions League > World Cup", a: "Better Football", b: "World Cup Special", seed: [43, 57] },
    { q: "Scandinavian countries have it figured out", a: "Model Societies", b: "Not Perfect", seed: [57, 43] },
    { q: "One language for all of Europe", a: "Practical", b: "Protect Languages", seed: [24, 76] },
    { q: "European summers > everywhere else", a: "Unbeatable", b: "Tropical Wins", seed: [46, 54] },
  ],
};

// === VERSUS — Questions Database ===

const CATEGORIES = {
  "🔥 Trending": [
    { q: "AI will replace most jobs in 10 years", a: "Agree", b: "No Way", seed: [62, 38] },
    { q: "TikTok is more influential than Google", a: "Facts", b: "Cap", seed: [57, 43] }
  ],
  "🍔 Food": [
    { q: "Pineapple on pizza", a: "Masterpiece", b: "Crime", seed: [45, 55] },
    { q: "Coffee or Tea?", a: "Coffee ☕", b: "Tea 🍵", seed: [65, 35] }
  ]
};

const REGIONS = {
  "USA 🇺🇸": [
    { q: "Baseball or Football?", a: "Baseball", b: "Football", seed: [30, 70] }
  ],
  "UK 🇬🇧": [
    { q: "Tea with milk or without?", a: "With", b: "Without", seed: [85, 15] }
  ]
};

// === DYNAMIC GENERATOR ===
const ALL_QUESTIONS = [];
Object.entries(CATEGORIES).forEach(([catName, list]) => {
  list.forEach(q => {
    ALL_QUESTIONS.push({ ...q, category: catName, seed: q.seed || [50, 50] });
  });
});

function getRegionKeys() { return Object.keys(REGIONS); }

function getRegionalQuestions(regionKey) {
  return (REGIONS[regionKey] || []).map(q => ({ ...q, category: regionKey }));
}

function getAllWithRegion(regionKey) {
  return [...ALL_QUESTIONS, ...getRegionalQuestions(regionKey)];
}


// ========================
// HELPERS
// ========================
const ALL_QUESTIONS = [];
for (const [cat, qs] of Object.entries(CATEGORIES)) {
  for (const q of qs) {
    ALL_QUESTIONS.push({ ...q, category: cat });
  }
}

function getRegionKeys() { return Object.keys(REGIONS); }

function getRegionalQuestions(regionKey) {
  const qs = REGIONS[regionKey] || [];
  return qs.map(q => ({ ...q, category: regionKey }));
}

function getAllWithRegion(regionKey) {
  return [...ALL_QUESTIONS, ...getRegionalQuestions(regionKey)];
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
