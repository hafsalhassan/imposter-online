// ============================================================
//  avatars.js — Flat Minimal Gaming Animal Avatars
// ============================================================

if (typeof window.ANIMAL_AVATARS === 'undefined') {
  window.ANIMAL_AVATARS = [
  {
    id: "fox",
    name: "Fox 🦊",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FEE2E2"/>
      <!-- Ears -->
      <polygon points="25,25 40,45 20,45" fill="#EA580C"/>
      <polygon points="75,25 60,45 80,45" fill="#EA580C"/>
      <polygon points="26,30 36,44 23,44" fill="#FEF3C7"/>
      <polygon points="74,30 64,44 77,44" fill="#FEF3C7"/>
      <!-- Face -->
      <polygon points="50,75 22,42 78,42" fill="#F97316"/>
      <!-- White Cheeks -->
      <polygon points="50,75 22,42 38,55" fill="#FFFFFF"/>
      <polygon points="50,75 78,42 62,55" fill="#FFFFFF"/>
      <!-- Nose -->
      <circle cx="50" cy="72" r="3.5" fill="#18181B"/>
      <!-- Eyes -->
      <ellipse cx="38" cy="48" rx="3" ry="4" fill="#18181B"/>
      <ellipse cx="62" cy="48" rx="3" ry="4" fill="#18181B"/>
      <circle cx="39" cy="46.5" r="1.2" fill="#FFFFFF"/>
      <circle cx="63" cy="46.5" r="1.2" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: "panda",
    name: "Panda 🐼",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#F4F4F5"/>
      <!-- Ears -->
      <circle cx="28" cy="28" r="11" fill="#18181B"/>
      <circle cx="72" cy="28" r="11" fill="#18181B"/>
      <!-- Face -->
      <circle cx="50" cy="52" r="28" fill="#FFFFFF"/>
      <!-- Eye Patches -->
      <ellipse cx="37" cy="48" rx="7.5" ry="9" fill="#18181B" transform="rotate(-15 37 48)"/>
      <ellipse cx="63" cy="48" rx="7.5" ry="9" fill="#18181B" transform="rotate(15 63 48)"/>
      <!-- Eyes inside patches -->
      <circle cx="38" cy="47" r="2.8" fill="#FFFFFF"/>
      <circle cx="62" cy="47" r="2.8" fill="#FFFFFF"/>
      <circle cx="38" cy="47" r="1.8" fill="#18181B"/>
      <circle cx="62" cy="47" r="1.8" fill="#18181B"/>
      <!-- Nose & Mouth -->
      <ellipse cx="50" cy="59" rx="4" ry="2.8" fill="#18181B"/>
      <path d="M46 64 Q50 67 54 64" stroke="#18181B" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "lion",
    name: "Lion 🦁",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FEF3C7"/>
      <!-- Mane -->
      <circle cx="50" cy="50" r="32" fill="#D97706"/>
      <!-- Ears -->
      <circle cx="30" cy="30" r="7" fill="#F59E0B"/>
      <circle cx="70" cy="30" r="7" fill="#F59E0B"/>
      <!-- Face -->
      <circle cx="50" cy="50" r="23" fill="#FBBF24"/>
      <!-- Eyes -->
      <circle cx="42" cy="46" r="3" fill="#18181B"/>
      <circle cx="58" cy="46" r="3" fill="#18181B"/>
      <circle cx="43" cy="45" r="1" fill="#FFFFFF"/>
      <circle cx="59" cy="45" r="1" fill="#FFFFFF"/>
      <!-- Snout -->
      <polygon points="50,56 46,51 54,51" fill="#78350F"/>
      <ellipse cx="50" cy="60" rx="6" ry="4" fill="#FDE68A"/>
      <circle cx="50" cy="57" r="2.5" fill="#78350F"/>
    </svg>`
  },
  {
    id: "tiger",
    name: "Tiger 🐯",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FFEDD5"/>
      <!-- Ears -->
      <circle cx="28" cy="28" r="9" fill="#EA580C"/>
      <circle cx="72" cy="28" r="9" fill="#EA580C"/>
      <circle cx="28" cy="28" r="5" fill="#FEF3C7"/>
      <circle cx="72" cy="28" r="5" fill="#FEF3C7"/>
      <!-- Face -->
      <circle cx="50" cy="52" r="26" fill="#F97316"/>
      <!-- Stripes on forehead -->
      <path d="M50 30 L50 38" stroke="#18181B" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M43 33 L46 38" stroke="#18181B" stroke-width="2" stroke-linecap="round"/>
      <path d="M57 33 L54 38" stroke="#18181B" stroke-width="2" stroke-linecap="round"/>
      <!-- Cheeks -->
      <ellipse cx="44" cy="62" rx="6" ry="5" fill="#FFFFFF"/>
      <ellipse cx="56" cy="62" rx="6" ry="5" fill="#FFFFFF"/>
      <polygon points="50,60 46,56 54,56" fill="#EA580C"/>
      <!-- Eyes -->
      <circle cx="39" cy="48" r="3" fill="#18181B"/>
      <circle cx="61" cy="48" r="3" fill="#18181B"/>
      <circle cx="40" cy="47" r="1" fill="#FFFFFF"/>
      <circle cx="62" cy="47" r="1.8" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: "bear",
    name: "Bear 🐻",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#EDE9FE"/>
      <!-- Ears -->
      <circle cx="28" cy="28" r="9" fill="#78350F"/>
      <circle cx="72" cy="28" r="9" fill="#78350F"/>
      <circle cx="28" cy="28" r="5" fill="#B45309"/>
      <circle cx="72" cy="28" r="5" fill="#B45309"/>
      <!-- Face -->
      <circle cx="50" cy="52" r="26" fill="#92400E"/>
      <!-- Snout -->
      <ellipse cx="50" cy="60" rx="9" ry="7" fill="#FDE68A"/>
      <ellipse cx="50" cy="57" rx="4" ry="2.8" fill="#18181B"/>
      <!-- Eyes -->
      <circle cx="40" cy="47" r="2.8" fill="#18181B"/>
      <circle cx="60" cy="47" r="2.8" fill="#18181B"/>
      <circle cx="41" cy="46" r="1" fill="#FFFFFF"/>
      <circle cx="61" cy="46" r="1" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: "koala",
    name: "Koala 🐨",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#E0F2FE"/>
      <!-- Big Fuzzy Ears -->
      <circle cx="24" cy="34" r="13" fill="#94A3B8"/>
      <circle cx="76" cy="34" r="13" fill="#94A3B8"/>
      <circle cx="24" cy="34" r="8" fill="#F1F5F9"/>
      <circle cx="76" cy="34" r="8" fill="#F1F5F9"/>
      <!-- Face -->
      <circle cx="50" cy="52" r="25" fill="#CBD5E1"/>
      <!-- Big Oval Nose -->
      <ellipse cx="50" cy="56" rx="6" ry="10" fill="#18181B"/>
      <!-- Eyes -->
      <circle cx="38" cy="46" r="2.8" fill="#18181B"/>
      <circle cx="62" cy="46" r="2.8" fill="#18181B"/>
      <circle cx="39" cy="45" r="1" fill="#FFFFFF"/>
      <circle cx="63" cy="45" r="1" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: "owl",
    name: "Owl 🦉",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#ECFDF5"/>
      <!-- Ear Tufts -->
      <polygon points="32,25 42,40 25,40" fill="#6B21A8"/>
      <polygon points="68,25 58,40 75,40" fill="#6B21A8"/>
      <!-- Body/Face -->
      <ellipse cx="50" cy="54" rx="26" ry="24" fill="#7E22CE"/>
      <!-- Big Owl Eye Circles -->
      <circle cx="39" cy="49" r="9" fill="#FFFFFF"/>
      <circle cx="61" cy="49" r="9" fill="#FFFFFF"/>
      <circle cx="39" cy="49" r="5" fill="#F59E0B"/>
      <circle cx="61" cy="49" r="5" fill="#F59E0B"/>
      <circle cx="39" cy="49" r="3" fill="#18181B"/>
      <circle cx="61" cy="49" r="3" fill="#18181B"/>
      <circle cx="40" cy="47.5" r="1" fill="#FFFFFF"/>
      <circle cx="62" cy="47.5" r="1" fill="#FFFFFF"/>
      <!-- Beak -->
      <polygon points="50,60 46,53 54,53" fill="#F59E0B"/>
    </svg>`
  },
  {
    id: "rabbit",
    name: "Rabbit 🐰",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FDF2F8"/>
      <!-- Long Ears -->
      <ellipse cx="40" cy="26" rx="6" ry="16" fill="#F8FAFC"/>
      <ellipse cx="60" cy="26" rx="6" ry="16" fill="#F8FAFC"/>
      <ellipse cx="40" cy="26" rx="3.5" ry="12" fill="#F472B6"/>
      <ellipse cx="60" cy="26" rx="3.5" ry="12" fill="#F472B6"/>
      <!-- Face -->
      <circle cx="50" cy="56" r="23" fill="#FFFFFF"/>
      <!-- Pink Nose -->
      <ellipse cx="50" cy="58" rx="2.5" ry="2" fill="#EC4899"/>
      <!-- Eyes -->
      <ellipse cx="41" cy="50" rx="2.5" ry="3.5" fill="#18181B"/>
      <ellipse cx="59" cy="50" rx="2.5" ry="3.5" fill="#18181B"/>
      <circle cx="42" cy="49" r="1" fill="#FFFFFF"/>
      <circle cx="60" cy="49" r="1" fill="#FFFFFF"/>
      <!-- Cheeks -->
      <circle cx="34" cy="58" r="3.5" fill="#FBCFE8"/>
      <circle cx="66" cy="58" r="3.5" fill="#FBCFE8"/>
    </svg>`
  }
  ];
}

var ANIMAL_AVATARS = window.ANIMAL_AVATARS;

function getAvatarSvg(avatarId) {
  if (typeof ANIMAL_AVATARS === 'undefined' || !Array.isArray(ANIMAL_AVATARS)) return '';
  const match = ANIMAL_AVATARS.find(a => a.id === avatarId);
  return match ? match.svg : ANIMAL_AVATARS[0].svg;
}
