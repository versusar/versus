/**
 * VERSUS DATA ENGINE v1.0
 * Includes: Sub-Region Hierarchy, Regional Audio Mapping, and Seeded Questions.
 */

const GEOGRAPHY_DATA = {
    "Africa": {
        "Western Africa": { tag: "afrobeat", prompt: "Nollywood vs Hollywood?" },
        "Northern Africa": { tag: "arabic", prompt: "Couscous vs Tajine?" },
        "Central Africa": { tag: "rumba", prompt: "Best grilling style?" },
        "Eastern Africa": { tag: "benga", prompt: "Coffee origins: Ethiopia or elsewhere?" },
        "Southern Africa": { tag: "amapiano", prompt: "Braai vs BBQ?" }
    },
    "Asia": {
        "South East Asia": { tag: "lofi", prompt: "Street food: Bangkok or Saigon?" },
        "East Asia": { tag: "kpop", prompt: "Robots in daily life?" },
        "South Asia": { tag: "bollywood", prompt: "Cricket vs Football?" },
        "Central Asia": { tag: "folk", prompt: "Nomadic vs City life?" }
    },
    "Middle East": {
        "Gulf States": { tag: "oriental", prompt: "Modern Skyscrapers vs Heritage?" },
        "Levant": { tag: "instrumental", prompt: "Hummus: Creamy or Chunky?" },
        "Anatolia": { tag: "turkish", prompt: "Tea vs Coffee culture?" }
    },
    "Americas": {
        "North America": { tag: "hiphop", prompt: "iPhone vs Android?" },
        "South America": { tag: "samba", prompt: "Messi vs Ronaldo?" },
        "Central America": { tag: "reggaeton", prompt: "Best surf beaches?" },
        "Caribbean": { tag: "reggae", prompt: "Island time vs Hustle?" }
    },
    "Europe": {
        "Western Europe": { tag: "electronic", prompt: "Work-life balance vs Career?" },
        "Northern Europe": { tag: "metal", prompt: "Winter vs Summer?" },
        "Southern Europe": { tag: "acoustic", prompt: "Siesta: Essential or Lazy?" },
        "Eastern Europe": { tag: "techno", prompt: "Traditional vs Modern architecture?" }
    }
};

const ALL_QUESTIONS = [
    // --- GLOBAL POOL ---
    { q: "Work from Home or Office?", a: "WFH", b: "Office", category: "Lifestyle", seed: [542, 310] },
    { q: "Is AI a threat to humanity?", a: "Yes", b: "No", category: "Tech", seed: [1200, 890] },
    { q: "Pizza with Pineapple?", a: "Masterpiece", b: "Crime", category: "Food", seed: [450, 480] },
    { q: "Travel: City or Nature?", a: "City Lights", b: "Wilderness", category: "Travel", seed: [700, 720] },
    { q: "Books or Movies?", a: "Reading", b: "Watching", category: "Entertainment", seed: [400, 600] },

    // --- REGIONAL POOL (Tagged for logic) ---
    { q: "Jollof Rice: Nigeria or Ghana?", a: "Nigeria", b: "Ghana", category: "Food", region: "Western Africa", seed: [5000, 4999] },
    { q: "Best Pho location?", a: "Hanoi", b: "Saigon", category: "Food", region: "South East Asia", seed: [1200, 1150] },
    { q: "Dubai or Doha for a weekend?", a: "Dubai", b: "Doha", category: "Travel", region: "Gulf States", seed: [800, 300] },
    { q: "Morning drink?", a: "Espresso", b: "Matcha", category: "Food", region: "Europe", seed: [2000, 500] }
];

// === DATA UTILITIES ===

/**
 * Returns sub-regions based on continent
 */
function getSubRegions(continent) {
    return Object.keys(GEOGRAPHY_DATA[continent] || {});
}

/**
 * Gets the Jamendo tag for a specific region
 */
function getMusicTag(subRegion) {
    for (const continent in GEOGRAPHY_DATA) {
        if (GEOGRAPHY_DATA[continent][subRegion]) {
            return GEOGRAPHY_DATA[continent][subRegion].tag;
        }
    }
    return "techhouse"; // Default fallback
}

/**
 * Filters questions based on user's location
 */
function getQuestionsForUser(subRegion, category = 'all') {
    let pool = ALL_QUESTIONS.filter(q => {
        // Show global questions OR questions matching user's sub-region
        const regionMatch = !q.region || q.region === subRegion;
        const catMatch = category === 'all' || q.category === category;
        return regionMatch && catMatch;
    });
    
    return shuffleArray(pool);
}

// Helper to shuffle the deck
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Export for use in app.js
window.VERSUS_DATA = {
    geography: GEOGRAPHY_DATA,
    allQuestions: ALL_QUESTIONS,
    getMusicTag,
    getSubRegions,
    getQuestionsForUser
};
