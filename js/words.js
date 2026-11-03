// ============================================================
//  words.js — Word Library (Single Word per round, Blind Imposter)
// ============================================================

const WORD_LIBRARY = [
  { id: 1, word: "Puttu", category: "Food", difficulty: "easy" },
  { id: 2, word: "Kathakali", category: "Culture", difficulty: "medium" },
  { id: 3, word: "Elephant", category: "Animals", difficulty: "easy" },
  { id: 4, word: "Astrolabe", category: "Objects", difficulty: "hard" },
  { id: 5, word: "Munnar", category: "Places", difficulty: "medium" },
  { id: 6, word: "Sadya", category: "Food", difficulty: "easy" },
  { id: 7, word: "Theyyam", category: "Culture", difficulty: "medium" },
  { id: 8, word: "Alappuzha", category: "Places", difficulty: "easy" },
  { id: 9, word: "Tiger", category: "Animals", difficulty: "easy" },
  { id: 10, word: "Biryani", category: "Food", difficulty: "easy" },
  { id: 11, word: "Onam", category: "Culture", difficulty: "easy" },
  { id: 12, word: "Appam", category: "Food", difficulty: "easy" },
  { id: 13, word: "Kovalam", category: "Places", difficulty: "easy" },
  { id: 14, word: "Dosa", category: "Food", difficulty: "easy" },
  { id: 15, word: "Boat Race", category: "Culture", difficulty: "easy" }
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
  let used = JSON.parse(localStorage.getItem(storageKey) || '[]');

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
  const pick = shuffled[0];

  used.push(pick.id);
  localStorage.setItem(storageKey, JSON.stringify(used));
  return pick;
}

function getWordById(id) {
  return WORD_LIBRARY.find(w => w.id === id) || null;
}
