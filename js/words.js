// ============================================================
//  words.js — Word Library (Single Word or Similar Pair, Host Choice)
// ============================================================

const WORD_LIBRARY = [
  // User's specific core items (with matching similar words)
  { id: 1, word: "Puttu", similarWord: "Idiyappam", category: "Food", difficulty: "easy" },
  { id: 2, word: "Kathakali", similarWord: "Theyyam", category: "Culture", difficulty: "medium" },
  { id: 3, word: "Elephant", similarWord: "Rhinoceros", category: "Animals", difficulty: "easy" },
  { id: 4, word: "Astrolabe", similarWord: "Sextant", category: "Objects", difficulty: "hard" },
  { id: 5, word: "Munnar", similarWord: "Wayanad", category: "Places", difficulty: "medium" },

  // Food
  { id: 6, word: "Sadya", similarWord: "Biryani", category: "Food", difficulty: "easy" },
  { id: 7, word: "Biryani", similarWord: "Fried Rice", category: "Food", difficulty: "easy" },
  { id: 8, word: "Appam", similarWord: "Dosa", category: "Food", difficulty: "easy" },
  { id: 9, word: "Dosa", similarWord: "Uttapam", category: "Food", difficulty: "easy" },
  { id: 10, word: "Parotta", similarWord: "Chapati", category: "Food", difficulty: "easy" },
  { id: 11, word: "Payasam", similarWord: "Halwa", category: "Food", difficulty: "easy" },
  { id: 12, word: "Fish Curry", similarWord: "Chicken Curry", category: "Food", difficulty: "easy" },
  { id: 13, word: "Unniyappam", similarWord: "Neyyappam", category: "Food", difficulty: "medium" },
  { id: 14, word: "Banana Chips", similarWord: "Jackfruit Chips", category: "Food", difficulty: "easy" },
  { id: 15, word: "Pazham Pori", similarWord: "Uzhunnu Vada", category: "Food", difficulty: "easy" },
  { id: 16, word: "Idiyappam", similarWord: "Noodles", category: "Food", difficulty: "easy" },
  { id: 17, word: "Kappa & Meen", similarWord: "Puttu & Kadala", category: "Food", difficulty: "easy" },

  // Culture
  { id: 18, word: "Theyyam", similarWord: "Padayani", category: "Culture", difficulty: "medium" },
  { id: 19, word: "Onam", similarWord: "Vishu", category: "Culture", difficulty: "easy" },
  { id: 20, word: "Boat Race (Vallamkali)", similarWord: "Kallada Jalolsavam", category: "Culture", difficulty: "easy" },
  { id: 21, word: "Thrissur Pooram", similarWord: "Nenmara Vallangi Vela", category: "Culture", difficulty: "medium" },
  { id: 22, word: "Vishu", similarWord: "Deepavali", category: "Culture", difficulty: "easy" },
  { id: 23, word: "Mohiniyattam", similarWord: "Bharatanatyam", category: "Culture", difficulty: "medium" },
  { id: 24, word: "Kalaripayattu", similarWord: "Karate", category: "Culture", difficulty: "medium" },
  { id: 25, word: "Pulikali", similarWord: "Theyyam", category: "Culture", difficulty: "easy" },
  { id: 26, word: "Chenda Melam", similarWord: "Panchavadyam", category: "Culture", difficulty: "easy" },
  { id: 27, word: "Thiruvathira", similarWord: "Margamkali", category: "Culture", difficulty: "medium" },
  { id: 28, word: "Chakyar Koothu", similarWord: "Koodiyattam", category: "Culture", difficulty: "hard" },

  // Animals
  { id: 29, word: "Tiger", similarWord: "Leopard", category: "Animals", difficulty: "easy" },
  { id: 30, word: "Peacock", similarWord: "Swan", category: "Animals", difficulty: "easy" },
  { id: 31, word: "Hornbill", similarWord: "Toucan", category: "Animals", difficulty: "medium" },
  { id: 32, word: "Monkey", similarWord: "Chimpanzee", category: "Animals", difficulty: "easy" },
  { id: 33, word: "Leopard", similarWord: "Cheetah", category: "Animals", difficulty: "medium" },
  { id: 34, word: "King Cobra", similarWord: "Viper", category: "Animals", difficulty: "medium" },
  { id: 35, word: "Spotted Deer", similarWord: "Sambar Deer", category: "Animals", difficulty: "easy" },
  { id: 36, word: "Malabar Giant Squirrel", similarWord: "Flying Squirrel", category: "Animals", difficulty: "hard" },
  { id: 37, word: "Otter", similarWord: "Beaver", category: "Animals", difficulty: "medium" },
  { id: 38, word: "Wild Boar", similarWord: "Bison", category: "Animals", difficulty: "easy" },

  // Places
  { id: 39, word: "Alappuzha", similarWord: "Kumarakom", category: "Places", difficulty: "easy" },
  { id: 40, word: "Kovalam", similarWord: "Varkala", category: "Places", difficulty: "easy" },
  { id: 41, word: "Wayanad", similarWord: "Idukki", category: "Places", difficulty: "easy" },
  { id: 42, word: "Fort Kochi", similarWord: "Mattancherry", category: "Places", difficulty: "easy" },
  { id: 43, word: "Varkala Cliff", similarWord: "Cherai Beach", category: "Places", difficulty: "easy" },
  { id: 44, word: "Athirappilly Falls", similarWord: "Meenmutty Falls", category: "Places", difficulty: "medium" },
  { id: 45, word: "Bekal Fort", similarWord: "Palakkad Fort", category: "Places", difficulty: "medium" },
  { id: 46, word: "Kumarakom", similarWord: "Ashtamudi", category: "Places", difficulty: "medium" },
  { id: 47, word: "Vagamon", similarWord: "Ponmudi", category: "Places", difficulty: "medium" },
  { id: 48, word: "Silent Valley", similarWord: "Eravikulam", category: "Places", difficulty: "hard" },

  // Objects
  { id: 49, word: "Nilavilakku (Oil Lamp)", similarWord: "Thookkuvilakku", category: "Objects", difficulty: "medium" },
  { id: 50, word: "Chinese Fishing Net", similarWord: "Cast Net", category: "Objects", difficulty: "medium" },
  { id: 51, word: "Oola Kuda (Palm Umbrella)", similarWord: "Bamboo Hat", category: "Objects", difficulty: "medium" },
  { id: 52, word: "Uruli (Bronze Vessel)", similarWord: "Kindy", category: "Objects", difficulty: "medium" },
  { id: 53, word: "Vallam (Canoe)", similarWord: "Chundan Vallam", category: "Objects", difficulty: "easy" },
  { id: 54, word: "Kindi (Water Vessel)", similarWord: "Koppa", category: "Objects", difficulty: "hard" },
  { id: 55, word: "Charkha", similarWord: "Loom", category: "Objects", difficulty: "medium" },
  { id: 56, word: "Coconut Scraper", similarWord: "Aruvamanai", category: "Objects", difficulty: "easy" },
  { id: 57, word: "Puttu Maker", similarWord: "Idli Steamer", category: "Objects", difficulty: "easy" }
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Anti-repeat Word Picker with Category Filter and Synced Used Word IDs
function pickNextWordWithUsed(categoryFilter, usedWordIds) {
  const used = Array.isArray(usedWordIds) ? usedWordIds : Object.values(usedWordIds || {});
  let pool = WORD_LIBRARY;
  if (categoryFilter && categoryFilter !== 'ALL') {
    pool = WORD_LIBRARY.filter(w => w.category.toLowerCase() === categoryFilter.toLowerCase());
    if (pool.length === 0) pool = WORD_LIBRARY;
  }

  let remaining = pool.filter(w => !used.includes(w.id));

  // If all words in category are exhausted, cycle and restart
  if (remaining.length === 0) {
    remaining = [...pool];
  }

  const shuffled = shuffleArray(remaining);
  return shuffled[0] || WORD_LIBRARY[0];
}

function pickNextWord(roomCode, categoryFilter) {
  const storageKey = `imposter_used_${roomCode}`;
  let used = [];
  try {
    used = JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (e) {
    used = [];
  }

  const pick = pickNextWordWithUsed(categoryFilter, used);

  used.push(pick.id);
  try {
    localStorage.setItem(storageKey, JSON.stringify(used));
  } catch (e) {}

  return pick;
}

function getWordById(id) {
  return WORD_LIBRARY.find(w => w.id === id) || null;
}
