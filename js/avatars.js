// ============================================================
//  avatars.js — Kerala-themed Avatars (Vector SVGs)
// ============================================================

const KERALA_AVATARS = [
  {
    id: "chetan-meesha",
    name: "ചേട്ടൻ (Meesha)",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#F1ECE7"/>
      <!-- Neck -->
      <rect x="42" y="65" width="16" height="20" fill="#995E39" rx="4"/>
      <!-- Shirt Collar -->
      <path d="M30 85 Q50 92 70 85 L72 100 L28 100 Z" fill="#4F46E5"/>
      <!-- Face -->
      <ellipse cx="50" cy="48" rx="22" ry="24" fill="#A86B43"/>
      <!-- Eyes -->
      <ellipse cx="42" cy="46" rx="2.5" ry="3.5" fill="#1F2937"/>
      <ellipse cx="58" cy="46" rx="2.5" ry="3.5" fill="#1F2937"/>
      <circle cx="43" cy="44.5" r="1" fill="#FFFFFF"/>
      <circle cx="59" cy="44.5" r="1" fill="#FFFFFF"/>
      <!-- Eyebrows -->
      <path d="M38 40 Q43 38 47 41" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M53 41 Q57 38 62 40" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Big Kerala Mustache (Meesha) -->
      <path d="M38 56 Q50 54 50 60 Q50 54 62 56 Q66 60 60 63 Q50 63 50 61 Q50 63 40 63 Q34 60 38 56 Z" fill="#111827"/>
      <!-- Curly Hair -->
      <path d="M28 42 Q25 24 50 24 Q75 24 72 42 Q70 30 50 30 Q30 30 28 42 Z" fill="#111827"/>
      <circle cx="34" cy="27" r="5" fill="#111827"/>
      <circle cx="44" cy="23" r="5.5" fill="#111827"/>
      <circle cx="55" cy="23" r="5.5" fill="#111827"/>
      <circle cx="65" cy="26" r="5" fill="#111827"/>
      <!-- Ears -->
      <circle cx="28" cy="48" r="4" fill="#A86B43"/>
      <circle cx="72" cy="48" r="4" fill="#A86B43"/>
    </svg>`
  },
  {
    id: "chechi-mullappoov",
    name: "ചേച്ചി (Mullappoov)",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FDF4ED"/>
      <!-- Neck -->
      <rect x="43" y="65" width="14" height="20" fill="#B0754D" rx="4"/>
      <!-- Kerala Kasavu Saree neck -->
      <path d="M30 85 Q50 94 70 85 L72 100 L28 100 Z" fill="#FBF9F3"/>
      <path d="M30 85 Q50 94 70 85" stroke="#D97706" stroke-width="3" fill="none"/>
      <!-- Bun (Konda) with Jasmine flowers (Mullappoov) -->
      <circle cx="68" cy="36" r="12" fill="#111827"/>
      <!-- Jasmine flowers dots -->
      <circle cx="64" cy="26" r="3" fill="#FFFFFF"/>
      <circle cx="70" cy="28" r="3.2" fill="#FFFFFF"/>
      <circle cx="76" cy="32" r="3" fill="#FFFFFF"/>
      <circle cx="78" cy="38" r="3.2" fill="#FFFFFF"/>
      <circle cx="76" cy="44" r="3" fill="#FFFFFF"/>
      <!-- Center dot red in flower -->
      <circle cx="70" cy="28" r="1" fill="#F59E0B"/>
      <circle cx="76" cy="38" r="1" fill="#F59E0B"/>
      <!-- Face -->
      <ellipse cx="48" cy="49" rx="20" ry="23" fill="#BC8157"/>
      <!-- Round Bindi (Pottu) -->
      <circle cx="48" cy="41" r="2.5" fill="#DC2626"/>
      <!-- Eyes & Kajal -->
      <ellipse cx="41" cy="48" rx="3" ry="2.5" fill="#111827"/>
      <ellipse cx="55" cy="48" rx="3" ry="2.5" fill="#111827"/>
      <circle cx="42" cy="47" r="0.9" fill="#FFFFFF"/>
      <circle cx="56" cy="47" r="0.9" fill="#FFFFFF"/>
      <!-- Smile -->
      <path d="M43 59 Q48 64 53 59" stroke="#991B1B" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Front Hair parting -->
      <path d="M28 45 Q40 33 48 36 Q56 33 68 45 Q64 27 48 27 Q32 27 28 45 Z" fill="#111827"/>
      <!-- Jimikki Kammal (Earrings) -->
      <circle cx="28" cy="52" r="2" fill="#F59E0B"/>
      <path d="M26 55 Q28 58 30 55 Z" fill="#F59E0B"/>
      <circle cx="68" cy="52" r="2" fill="#F59E0B"/>
      <path d="M66 55 Q68 58 70 55 Z" fill="#F59E0B"/>
    </svg>`
  },
  {
    id: "mallu-beard",
    name: "താടിക്കാരൻ (Beard)",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#EEF2F6"/>
      <!-- Neck -->
      <rect x="42" y="65" width="16" height="20" fill="#8C522E" rx="4"/>
      <!-- T-shirt -->
      <path d="M28 85 Q50 90 72 85 L75 100 L25 100 Z" fill="#0D9488"/>
      <!-- Face -->
      <ellipse cx="50" cy="47" rx="21" ry="23" fill="#9C5E37"/>
      <!-- Modern Hair Cut -->
      <path d="M29 38 Q28 22 50 20 Q72 22 71 38 Q67 27 50 27 Q33 27 29 38 Z" fill="#111827"/>
      <!-- Full Beard -->
      <path d="M32 48 Q30 70 50 73 Q70 70 68 48 Q67 65 50 68 Q33 65 32 48 Z" fill="#111827"/>
      <!-- Mustache joining beard -->
      <path d="M38 53 Q50 51 62 53 Q56 58 50 57 Q44 58 38 53 Z" fill="#111827"/>
      <!-- Modern Specs -->
      <rect x="36" y="42" width="12" height="9" rx="2.5" stroke="#1F2937" stroke-width="2" fill="none"/>
      <rect x="52" y="42" width="12" height="9" rx="2.5" stroke="#1F2937" stroke-width="2" fill="none"/>
      <line x1="48" y1="46" x2="52" y2="46" stroke="#1F2937" stroke-width="2"/>
      <!-- Eyes inside specs -->
      <circle cx="42" cy="46.5" r="2.2" fill="#111827"/>
      <circle cx="58" cy="46.5" r="2.2" fill="#111827"/>
    </svg>`
  },
  {
    id: "hijab-girl",
    name: "തട്ടമിട്ട കുട്ടി (Hijab)",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#F7F3EE"/>
      <!-- Hijab Outer -->
      <ellipse cx="50" cy="52" rx="29" ry="34" fill="#0284C7"/>
      <!-- Dress -->
      <path d="M25 84 Q50 94 75 84 L78 100 L22 100 Z" fill="#0369A1"/>
      <!-- Face opening in hijab -->
      <ellipse cx="50" cy="50" rx="18" ry="21" fill="#C68A62"/>
      <!-- Hijab inner drape -->
      <path d="M32 48 Q50 32 68 48 Q62 37 50 37 Q38 37 32 48 Z" fill="#0369A1"/>
      <!-- Big expressive Eyes -->
      <ellipse cx="43" cy="49" rx="3.5" ry="3" fill="#111827"/>
      <ellipse cx="57" cy="49" rx="3.5" ry="3" fill="#111827"/>
      <circle cx="44.5" cy="47.5" r="1.2" fill="#FFFFFF"/>
      <circle cx="58.5" cy="47.5" r="1.2" fill="#FFFFFF"/>
      <!-- Thin Eyebrows -->
      <path d="M39 44 Q43 42 47 44" stroke="#111827" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M53 44 Q57 42 61 44" stroke="#111827" stroke-width="1.8" stroke-linecap="round"/>
      <!-- Sweet Smile -->
      <path d="M45 58 Q50 62 55 58" stroke="#881337" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>`
  },
  {
    id: "chandanakuri-mundu",
    name: "ചന്ദനക്കുറി (Traditional)",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FFFBEB"/>
      <!-- Neck -->
      <rect x="42" y="65" width="16" height="20" fill="#995E39" rx="4"/>
      <!-- Jubba / Melmundu -->
      <path d="M28 85 Q50 92 72 85 L75 100 L25 100 Z" fill="#F8FAFC"/>
      <path d="M35 88 L45 100" stroke="#D97706" stroke-width="3"/>
      <!-- Face -->
      <ellipse cx="50" cy="47" rx="21" ry="23" fill="#A86B43"/>
      <!-- Chandana Kuri (Sandal paste mark) -->
      <rect x="45" y="36" width="10" height="2" rx="1" fill="#FEF08A"/>
      <rect x="43" y="39" width="14" height="2" rx="1" fill="#FEF08A"/>
      <circle cx="50" cy="42" r="1.5" fill="#DC2626"/>
      <!-- Eyes -->
      <ellipse cx="43" cy="47" rx="2.5" ry="3.5" fill="#1F2937"/>
      <ellipse cx="57" cy="47" rx="2.5" ry="3.5" fill="#1F2937"/>
      <!-- Trimmed Mustache -->
      <path d="M41 57 Q50 55 59 57 Q50 61 41 57 Z" fill="#111827"/>
      <!-- Neat Side Parting Hair -->
      <path d="M29 42 Q28 23 50 23 Q72 23 71 42 Q68 30 50 30 Q32 30 29 42 Z" fill="#111827"/>
    </svg>`
  },
  {
    id: "curly-bob",
    name: "മോഡേൺ മല്ലു (Curly Bob)",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#FDF2F8"/>
      <!-- Neck -->
      <rect x="43" y="65" width="14" height="20" fill="#B0754D" rx="4"/>
      <!-- Kurti -->
      <path d="M28 85 Q50 92 72 85 L75 100 L25 100 Z" fill="#DB2777"/>
      <!-- Voluminous Curly Bob Hair (Behind) -->
      <circle cx="32" cy="48" r="12" fill="#111827"/>
      <circle cx="68" cy="48" r="12" fill="#111827"/>
      <circle cx="30" cy="38" r="10" fill="#111827"/>
      <circle cx="70" cy="38" r="10" fill="#111827"/>
      <!-- Face -->
      <ellipse cx="50" cy="48" rx="19" ry="22" fill="#BC8157"/>
      <!-- Small Round Pottu -->
      <circle cx="50" cy="41" r="1.8" fill="#111827"/>
      <!-- Round Specs -->
      <circle cx="43" cy="48" r="6" stroke="#4B5563" stroke-width="1.8" fill="none"/>
      <circle cx="57" cy="48" r="6" stroke="#4B5563" stroke-width="1.8" fill="none"/>
      <line x1="49" y1="48" x2="51" y2="48" stroke="#4B5563" stroke-width="1.8"/>
      <!-- Eyes -->
      <circle cx="43" cy="48" r="2" fill="#111827"/>
      <circle cx="57" cy="48" r="2" fill="#111827"/>
      <!-- Smile -->
      <path d="M45 59 Q50 63 55 59" stroke="#BE123C" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>`
  },
  {
    id: "appoopan",
    name: "അപ്പൂപ്പൻ (Elder)",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#F3F4F6"/>
      <!-- Neck -->
      <rect x="42" y="65" width="16" height="20" fill="#995E39" rx="4"/>
      <!-- White Jubba / Shirt -->
      <path d="M28 85 Q50 90 72 85 L75 100 L25 100 Z" fill="#E5E7EB"/>
      <!-- Face -->
      <ellipse cx="50" cy="48" rx="21" ry="24" fill="#A86B43"/>
      <!-- White/Grey Hair on sides -->
      <path d="M29 45 Q28 26 50 26 Q72 26 71 45 Q68 33 50 33 Q32 33 29 45 Z" fill="#E5E7EB"/>
      <!-- Kind Eyes with Smile lines -->
      <ellipse cx="43" cy="46" rx="2" ry="2" fill="#1F2937"/>
      <ellipse cx="57" cy="46" rx="2" ry="2" fill="#1F2937"/>
      <path d="M38 46 Q35 48 37 51" stroke="#8C522E" stroke-width="1.2" fill="none"/>
      <path d="M62 46 Q65 48 63 51" stroke="#8C522E" stroke-width="1.2" fill="none"/>
      <!-- White Majestic Mustache -->
      <path d="M38 56 Q50 54 50 60 Q50 54 62 56 Q66 60 60 63 Q50 63 50 61 Q50 63 40 63 Q34 60 38 56 Z" fill="#F9FAFB" stroke="#D1D5DB" stroke-width="0.8"/>
      <!-- Gold Rim Specs -->
      <rect x="37" y="42" width="11" height="8" rx="2" stroke="#D97706" stroke-width="1.5" fill="none"/>
      <rect x="52" y="42" width="11" height="8" rx="2" stroke="#D97706" stroke-width="1.5" fill="none"/>
      <line x1="48" y1="45" x2="52" y2="45" stroke="#D97706" stroke-width="1.5"/>
    </svg>`
  },
  {
    id: "genz-mallu",
    name: "യുവത്വം (Cool Guy)",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#ECFDF5"/>
      <!-- Neck -->
      <rect x="42" y="65" width="16" height="20" fill="#995E39" rx="4"/>
      <!-- Hoodie -->
      <path d="M28 85 Q50 92 72 85 L75 100 L25 100 Z" fill="#059669"/>
      <!-- Face -->
      <ellipse cx="50" cy="47" rx="20" ry="23" fill="#A86B43"/>
      <!-- Trendy Spiky/Fade Hair -->
      <path d="M29 38 Q30 20 45 17 Q55 18 68 25 Q71 38 67 29 Q50 25 32 32 Z" fill="#111827"/>
      <!-- Sunglasses (Cool Mallu look) -->
      <path d="M36 43 L48 43 L46 51 Q41 53 37 51 Z" fill="#111827"/>
      <path d="M52 43 L64 43 L63 51 Q59 53 54 51 Z" fill="#111827"/>
      <line x1="48" y1="45" x2="52" y2="45" stroke="#111827" stroke-width="2"/>
      <line x1="39" y1="45" x2="43" y2="50" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round"/>
      <line x1="55" y1="45" x2="59" y2="50" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round"/>
      <!-- Confident Smile -->
      <path d="M45 59 Q50 63 56 58" stroke="#111827" stroke-width="2" stroke-linecap="round" fill="none"/>
    </svg>`
  }
];

function getAvatarSvg(avatarId) {
  const match = KERALA_AVATARS.find(a => a.id === avatarId);
  return match ? match.svg : KERALA_AVATARS[0].svg;
}
