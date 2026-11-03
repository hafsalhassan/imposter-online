// ============================================================
//  words.js — Word Library (Single Word per round, Blind Imposter)
// ============================================================

const WORD_LIBRARY = [
  // User's specific core items
  { id: 1, word: "Puttu", category: "Food", difficulty: "easy" },
  { id: 2, word: "Kathakali", category: "Culture", difficulty: "medium" },
  { id: 3, word: "Elephant", category: "Animals", difficulty: "easy" },
  { id: 4, word: "Astrolabe", category: "Objects", difficulty: "hard" },
  { id: 5, word: "Munnar", category: "Places", difficulty: "medium" },

  // Food
  { id: 6, word: "Sadya", category: "Food", difficulty: "easy" },
  { id: 7, word: "Biryani", category: "Food", difficulty: "easy" },
  { id: 8, word: "Appam", category: "Food", difficulty: "easy" },
  { id: 9, word: "Dosa", category: "Food", difficulty: "easy" },
  { id: 10, word: "Parotta", category: "Food", difficulty: "easy" },
  { id: 11, word: "Payasam", category: "Food", difficulty: "easy" },
  { id: 12, word: "Fish Curry", category: "Food", difficulty: "easy" },
  { id: 13, word: "Unniyappam", category: "Food", difficulty: "medium" },
  { id: 14, word: "Banana Chips", category: "Food", difficulty: "easy" },
  { id: 15, word: "Pazham Pori", category: "Food", difficulty: "easy" },
  { id: 16, word: "Idiyappam", category: "Food", difficulty: "easy" },
  { id: 17, word: "Kappa & Meen", category: "Food", difficulty: "easy" },

  // Culture
  { id: 18, word: "Theyyam", category: "Culture", difficulty: "medium" },
  { id: 19, word: "Onam", category: "Culture", difficulty: "easy" },
  { id: 20, word: "Boat Race (Vallamkali)", category: "Culture", difficulty: "easy" },
  { id: 21, word: "Thrissur Pooram", category: "Culture", difficulty: "medium" },
  { id: 22, word: "Vishu", category: "Culture", difficulty: "easy" },
  { id: 23, word: "Mohiniyattam", category: "Culture", difficulty: "medium" },
  { id: 24, word: "Kalaripayattu", category: "Culture", difficulty: "medium" },
  { id: 25, word: "Pulikali", category: "Culture", difficulty: "easy" },
  { id: 26, word: "Chenda Melam", category: "Culture", difficulty: "easy" },
  { id: 27, word: "Thiruvathira", category: "Culture", difficulty: "medium" },
  { id: 28, word: "Chakyar Koothu", category: "Culture", difficulty: "hard" },

  // Animals
  { id: 29, word: "Tiger", category: "Animals", difficulty: "easy" },
  { id: 30, word: "Peacock", category: "Animals", difficulty: "easy" },
  { id: 31, word: "Hornbill", category: "Animals", difficulty: "medium" },
  { id: 32, word: "Monkey", category: "Animals", difficulty: "easy" },
  { id: 33, word: "Leopard", category: "Animals", difficulty: "medium" },
  { id: 34, word: "King Cobra", category: "Animals", difficulty: "medium" },
  { id: 35, word: "Spotted Deer", category: "Animals", difficulty: "easy" },
  { id: 36, word: "Malabar Giant Squirrel", category: "Animals", difficulty: "hard" },
  { id: 37, word: "Otter", category: "Animals", difficulty: "medium" },
  { id: 38, word: "Wild Boar", category: "Animals", difficulty: "easy" },

  // Places
  { id: 39, word: "Alappuzha", category: "Places", difficulty: "easy" },
  { id: 40, word: "Kovalam", category: "Places", difficulty: "easy" },
  { id: 41, word: "Wayanad", category: "Places", difficulty: "easy" },
  { id: 42, word: "Fort Kochi", category: "Places", difficulty: "easy" },
  { id: 43, word: "Varkala Cliff", category: "Places", difficulty: "easy" },
  { id: 44, word: "Athirappilly Falls", category: "Places", difficulty: "medium" },
  { id: 45, word: "Bekal Fort", category: "Places", difficulty: "medium" },
  { id: 46, word: "Kumarakom", category: "Places", difficulty: "medium" },
  { id: 47, word: "Vagamon", category: "Places", difficulty: "medium" },
  { id: 48, word: "Silent Valley", category: "Places", difficulty: "hard" },

  // Objects
  { id: 49, word: "Nilavilakku (Oil Lamp)", category: "Objects", difficulty: "medium" },
  { id: 50, word: "Chinese Fishing Net", category: "Objects", difficulty: "medium" },
  { id: 51, word: "Oola Kuda (Palm Umbrella)", category: "Objects", difficulty: "medium" },
  { id: 52, word: "Uruli (Bronze Vessel)", category: "Objects", difficulty: "medium" },
  { id: 53, word: "Vallam (Canoe)", category: "Objects", difficulty: "easy" },
  { id: 54, word: "Kindi (Water Vessel)", category: "Objects", difficulty: "hard" },
  { id: 55, word: "Charkha", category: "Objects", difficulty: "medium" },
  { id: 56, word: "Coconut Scraper", category: "Objects", difficulty: "easy" },
  { id: 57, word: "Puttu Maker", category: "Objects", difficulty: "easy" }
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Anti-repeat Word Picker with Category Filter
function pickNextWord(roomCode, categoryFilter) {
  const storageKey = `imposter_used_${roomCode}`;
  let used = [];
  try {
    used = JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (e) {
    used = [];
  }

  let pool = WORD_LIBRARY;
  if (categoryFilter && categoryFilter !== 'ALL') {
    pool = WORD_LIBRARY.filter(w => w.category.toLowerCase() === categoryFilter.toLowerCase());
    if (pool.length === 0) pool = WORD_LIBRARY;
  }

  let remaining = pool.filter(w => !used.includes(w.id));

  if (remaining.length === 0) {
    used = used.filter(id => !pool.some(w => w.id === id));
    remaining = [...pool];
  }

  const shuffled = shuffleArray(remaining);
  const pick = shuffled[0] || WORD_LIBRARY[0];

  used.push(pick.id);
  try {
    localStorage.setItem(storageKey, JSON.stringify(used));
  } catch (e) {}

  return pick;
}

function getWordById(id) {
  return WORD_LIBRARY.find(w => w.id === id) || null;
}
