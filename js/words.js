// Word library for Imposter Online
// Each pair: { id, category, main (Malayalam), mainEn (English label), imposter (Malayalam), imposterEn (English label) }
// The 'main' word goes to regular players; 'imposter' word goes to the imposter.
// Words in same category, close but not identical — tricky enough.

const WORD_LIBRARY = [
  // ── Kerala Food (30 pairs) ──────────────────────────────────
  { id:1,  category:"Kerala Food",      main:"സദ്യ",              mainEn:"Sadya",                imposter:"അവിയൽ",             imposterEn:"Avial" },
  { id:2,  category:"Kerala Food",      main:"പുട്ട്",             mainEn:"Puttu",                imposter:"ഇഡ്ഡലി",            imposterEn:"Idli" },
  { id:3,  category:"Kerala Food",      main:"അപ്പം",              mainEn:"Appam",                imposter:"ദോശ",               imposterEn:"Dosa" },
  { id:4,  category:"Kerala Food",      main:"കപ്പ",               mainEn:"Kappa / Tapioca",      imposter:"ചേന",               imposterEn:"Chena / Yam" },
  { id:5,  category:"Kerala Food",      main:"ഇഞ്ചിക്കറി",        mainEn:"Inji Curry",           imposter:"പുളിഞ്ചി",          imposterEn:"Pulincurry" },
  { id:6,  category:"Kerala Food",      main:"കഞ്ഞി",              mainEn:"Kanji / Rice Gruel",   imposter:"ഉലുവ കഞ്ഞി",       imposterEn:"Uluva Kanji" },
  { id:7,  category:"Kerala Food",      main:"ചക്ക",               mainEn:"Jackfruit",            imposter:"ഏത്തക്ക",           imposterEn:"Plantain" },
  { id:8,  category:"Kerala Food",      main:"ഉഴുന്ന് വട",        mainEn:"Uzhunnu Vada",         imposter:"മസാല വട",          imposterEn:"Masala Vada" },
  { id:9,  category:"Kerala Food",      main:"നെയ്‌ചോർ",          mainEn:"Nei Chor",             imposter:"ഘി റൈസ്",          imposterEn:"Ghee Rice" },
  { id:10, category:"Kerala Food",      main:"ഫിഷ് കറി",          mainEn:"Fish Curry",           imposter:"ഫിഷ് മൊയ്‌ലി",    imposterEn:"Fish Moilee" },
  { id:11, category:"Kerala Food",      main:"പഴം പൊരി",          mainEn:"Pazham Pori",          imposter:"ഉണ്ണിയപ്പം",       imposterEn:"Unniyappam" },
  { id:12, category:"Kerala Food",      main:"കടല കറി",           mainEn:"Kadala Curry",         imposter:"പയർ കറി",          imposterEn:"Payar Curry" },
  { id:13, category:"Kerala Food",      main:"തോരൻ",              mainEn:"Thoran",               imposter:"മേഴുക്കുപുരട്ടി", imposterEn:"Mezhukkupuratti" },
  { id:14, category:"Kerala Food",      main:"പായസം",             mainEn:"Payasam",              imposter:"പ്രഥമൻ",           imposterEn:"Pradhaman" },
  { id:15, category:"Kerala Food",      main:"കൊഴുക്കട്ട",        mainEn:"Kozhukatta",           imposter:"ഇഡിയപ്പം",         imposterEn:"Idiyappam" },
  { id:16, category:"Kerala Food",      main:"ഓലൻ",               mainEn:"Olan",                 imposter:"ഇഞ്ചിക്കറി",      imposterEn:"Inji Curry" },
  { id:17, category:"Kerala Food",      main:"കേരള ബിരിയാണി",   mainEn:"Kerala Biryani",        imposter:"മലബാർ ബിരിയാണി", imposterEn:"Malabar Biryani" },
  { id:18, category:"Kerala Food",      main:"ആപ്പം-സ്‌റ്റൂ",    mainEn:"Appam with Stew",      imposter:"ആപ്പം-കടല",        imposterEn:"Appam with Kadala" },
  { id:19, category:"Kerala Food",      main:"ശർക്കര വരട്ടി",    mainEn:"Sharkkara Varatti",     imposter:"ഗോതമ്പ് ഹൽ‌വ",   imposterEn:"Wheat Halwa" },
  { id:20, category:"Kerala Food",      main:"കൂർക്ക",             mainEn:"Chinese Potato",       imposter:"കാച്ചിൽ",          imposterEn:"Purple Yam" },
  { id:21, category:"Kerala Food",      main:"പരിപ്പ് വട",        mainEn:"Parippu Vada",         imposter:"ഉഴുന്ന് വട",       imposterEn:"Uzhunnu Vada" },
  { id:22, category:"Kerala Food",      main:"കമ്പിൽ ഇറച്ചി",    mainEn:"Beef Fry",             imposter:"ചിക്കൻ ഫ്രൈ",     imposterEn:"Chicken Fry" },
  { id:23, category:"Kerala Food",      main:"ഇലഞ്ഞി പായസം",    mainEn:"Elanji Payasam",       imposter:"ചക്ക പ്രഥമൻ",      imposterEn:"Chakka Pradhaman" },
  { id:24, category:"Kerala Food",      main:"ഉപ്പുമാവ്",         mainEn:"Uppumavu",             imposter:"പൊറോട്ട",          imposterEn:"Porotta" },
  { id:25, category:"Kerala Food",      main:"പൊടിയടി",          mainEn:"Podiyadi (pounded rice)",imposter:"കഞ്ഞിവെള്ളം",   imposterEn:"Kanji Water" },
  { id:26, category:"Kerala Food",      main:"ദോശ",               mainEn:"Dosa",                 imposter:"ഉത്തപ്പം",          imposterEn:"Uttapam" },
  { id:27, category:"Kerala Food",      main:"ആടിന്‍ ഇറച്ചി",  mainEn:"Mutton Curry",          imposter:"ബീഫ് കറി",         imposterEn:"Beef Curry" },
  { id:28, category:"Kerala Food",      main:"നെല്ല്",             mainEn:"Paddy",                imposter:"അരി",               imposterEn:"Rice" },
  { id:29, category:"Kerala Food",      main:"കേരള ചായ",         mainEn:"Kerala Chai",           imposter:"ഇഞ്ചി ചായ",       imposterEn:"Ginger Tea" },
  { id:30, category:"Kerala Food",      main:"മുത്തരി",            mainEn:"Muthhari (Red Rice)",  imposter:"കൈ‌ക്കൊള്ളി",     imposterEn:"Kurinji Rice" },

  // ── Festivals (15 pairs) ────────────────────────────────────
  { id:31, category:"Festivals",        main:"ഓണം",               mainEn:"Onam",                 imposter:"വിഷു",              imposterEn:"Vishu" },
  { id:32, category:"Festivals",        main:"പൂക്കളം",            mainEn:"Pookalam",             imposter:"രംഗോളി",            imposterEn:"Rangoli" },
  { id:33, category:"Festivals",        main:"ഓണക്കോടി",         mainEn:"Onam New Dress",        imposter:"വിഷു കൈനീട്ടം",   imposterEn:"Vishu Kaineetam" },
  { id:34, category:"Festivals",        main:"തൃശൂർ പൂരം",        mainEn:"Thrissur Pooram",      imposter:"ആറ്റുകാൽ പൊങ്കാല",imposterEn:"Attukal Pongala" },
  { id:35, category:"Festivals",        main:"ദീപാവലി",           mainEn:"Deepavali",             imposter:"ക്രിസ്മസ്",        imposterEn:"Christmas" },
  { id:36, category:"Festivals",        main:"ക്രിസ്മസ്",         mainEn:"Christmas",             imposter:"ഈസ്റ്റർ",          imposterEn:"Easter" },
  { id:37, category:"Festivals",        main:"ഈദ്",               mainEn:"Eid ul Fitr",           imposter:"ബക്രീദ്",          imposterEn:"Bakrid / Eid ul Adha" },
  { id:38, category:"Festivals",        main:"കളിയാട്ടം",         mainEn:"Kaliyattam",            imposter:"തെയ്യം",           imposterEn:"Theyyam" },
  { id:39, category:"Festivals",        main:"കണിക്കൊന്ന",        mainEn:"Kani Konna (Cassia)",  imposter:"ഇരിഞ്ഞ",          imposterEn:"Irinja flower" },
  { id:40, category:"Festivals",        main:"ചിങ്ങം",            mainEn:"Chingam (1st month)",  imposter:"കർക്കിടകം",        imposterEn:"Karkidakam (rainy month)" },
  { id:41, category:"Festivals",        main:"ഉൽസവം",            mainEn:"Temple Festival",        imposter:"ജാഥ",               imposterEn:"Procession" },
  { id:42, category:"Festivals",        main:"ഗജമേള",            mainEn:"Gajamelam",             imposter:"പഞ്ചവാദ്യം",       imposterEn:"Panchavadyam" },
  { id:43, category:"Festivals",        main:"വിഷുക്കൈനീട്ടം",   mainEn:"Vishu Kaineetam",       imposter:"ഓണ സദ്യ",         imposterEn:"Onam Sadya" },
  { id:44, category:"Festivals",        main:"നൃത്തോൽസവം",       mainEn:"Dance Festival",        imposter:"സംഗീതോൽസവം",      imposterEn:"Music Festival" },
  { id:45, category:"Festivals",        main:"ആഘോഷം",            mainEn:"Celebration",           imposter:"ചടങ്ങ്",           imposterEn:"Ceremony" },

  // ── Kerala Places (20 pairs) ────────────────────────────────
  { id:46, category:"Kerala Places",    main:"ആലപ്പുഴ",           mainEn:"Alappuzha",             imposter:"കൊല്ലം",           imposterEn:"Kollam" },
  { id:47, category:"Kerala Places",    main:"മൂന്നാർ",           mainEn:"Munnar",                imposter:"വയനാട്",           imposterEn:"Wayanad" },
  { id:48, category:"Kerala Places",    main:"കോഴിക്കോട്",        mainEn:"Kozhikode",            imposter:"കണ്ണൂർ",           imposterEn:"Kannur" },
  { id:49, category:"Kerala Places",    main:"തൃശൂർ",             mainEn:"Thrissur",              imposter:"പാലക്കാട്",        imposterEn:"Palakkad" },
  { id:50, category:"Kerala Places",    main:"കോവളം",             mainEn:"Kovalam Beach",         imposter:"വർക്കല",           imposterEn:"Varkala Beach" },
  { id:51, category:"Kerala Places",    main:"ഗുരുവായൂർ",        mainEn:"Guruvayur",            imposter:"ശബരിമല",           imposterEn:"Sabarimala" },
  { id:52, category:"Kerala Places",    main:"ബേക്കൽ",            mainEn:"Bekal Fort",            imposter:"പാലക്കാട് കോട്ട", imposterEn:"Palakkad Fort" },
  { id:53, category:"Kerala Places",    main:"ഇടുക്കി",           mainEn:"Idukki",               imposter:"വയനാട്",           imposterEn:"Wayanad" },
  { id:54, category:"Kerala Places",    main:"കൊച്ചി",            mainEn:"Kochi",                imposter:"എറണാകുളം",         imposterEn:"Ernakulam" },
  { id:55, category:"Kerala Places",    main:"തിരുവനന്തപുരം",    mainEn:"Thiruvananthapuram",    imposter:"കൊച്ചി",           imposterEn:"Kochi" },
  { id:56, category:"Kerala Places",    main:"കോട്ടയം",           mainEn:"Kottayam",             imposter:"ആലുവ",              imposterEn:"Aluva" },
  { id:57, category:"Kerala Places",    main:"മലപ്പുറം",          mainEn:"Malappuram",            imposter:"തൃശൂർ",            imposterEn:"Thrissur" },
  { id:58, category:"Kerala Places",    main:"കാസർഗോഡ്",         mainEn:"Kasaragod",            imposter:"കണ്ണൂർ",           imposterEn:"Kannur" },
  { id:59, category:"Kerala Places",    main:"പത്തനംതിട്ട",       mainEn:"Pathanamthitta",        imposter:"ആലപ്പുഴ",          imposterEn:"Alappuzha" },
  { id:60, category:"Kerala Places",    main:"ഒറ്റപ്പാലം",       mainEn:"Ottapalam",            imposter:"ഷൊർണൂർ",          imposterEn:"Shoranur" },
  { id:61, category:"Kerala Places",    main:"ലക്ഷദ്വീപ്",       mainEn:"Lakshadweep",          imposter:"ആൻഡമാൻ",          imposterEn:"Andaman" },
  { id:62, category:"Kerala Places",    main:"ചാലക്കുടി",        mainEn:"Chalakudy",             imposter:"ആലുവ",              imposterEn:"Aluva" },
  { id:63, category:"Kerala Places",    main:"വേമ്പനാട്",         mainEn:"Vembanad Lake",        imposter:"അഷ്ടമുടി",         imposterEn:"Ashtamudi Lake" },
  { id:64, category:"Kerala Places",    main:"മണ്ണാർക്കാട്",     mainEn:"Mannarkkad",            imposter:"നിലമ്പൂർ",         imposterEn:"Nilambur" },
  { id:65, category:"Kerala Places",    main:"ഡീഡ്",              mainEn:"Devikulam",             imposter:"ബോഡിനായ്‌ക്കനൂർ",imposterEn:"Bodinayakanur" },

  // ── Kerala Culture (15 pairs) ───────────────────────────────
  { id:66, category:"Kerala Culture",   main:"കഥകളി",             mainEn:"Kathakali",             imposter:"കൂടിയാട്ടം",       imposterEn:"Koodiyattam" },
  { id:67, category:"Kerala Culture",   main:"മോഹിനിയാട്ടം",     mainEn:"Mohiniyattam",          imposter:"ഭരതനാട്യം",        imposterEn:"Bharatanatyam" },
  { id:68, category:"Kerala Culture",   main:"വള്ളംകളി",          mainEn:"Boat Race",             imposter:"ചുണ്ടൻ",           imposterEn:"Chundan Vallam" },
  { id:69, category:"Kerala Culture",   main:"കൈകൊട്ടിക്കളി",   mainEn:"Kaikottikali",          imposter:"തിരുവാതിര",         imposterEn:"Thiruvathira" },
  { id:70, category:"Kerala Culture",   main:"കളരിപ്പയറ്റ്",     mainEn:"Kalaripayattu",         imposter:"സിലംബം",           imposterEn:"Silambam" },
  { id:71, category:"Kerala Culture",   main:"ഒത്ത്",             mainEn:"Vedic Chanting",        imposter:"ഭജന",               imposterEn:"Bhajana" },
  { id:72, category:"Kerala Culture",   main:"തുള്ളൽ",            mainEn:"Thullal",               imposter:"ഓട്ടൻ തുള്ളൽ",    imposterEn:"Ottan Thullal" },
  { id:73, category:"Kerala Culture",   main:"പഞ്ചായത്ത്",        mainEn:"Panchayath",            imposter:"മുൻസിപ്പാലിറ്റി", imposterEn:"Municipality" },
  { id:74, category:"Kerala Culture",   main:"ആശ്ലേഷം",          mainEn:"Greeting",              imposter:"നമസ്‌കാരം",        imposterEn:"Namaskaram" },
  { id:75, category:"Kerala Culture",   main:"ഐതിഹ്യം",          mainEn:"Legend / Folklore",     imposter:"പഴഞ്ചൊല്ല്",       imposterEn:"Proverb" },
  { id:76, category:"Kerala Culture",   main:"ഗ്രന്ഥശാല",        mainEn:"Library",               imposter:"വായനശാല",          imposterEn:"Reading Room" },
  { id:77, category:"Kerala Culture",   main:"IFFK",              mainEn:"IFFK Film Festival",    imposter:"IFFI",              imposterEn:"IFFI" },
  { id:78, category:"Kerala Culture",   main:"ചന്ദനക്കുടം",      mainEn:"Chandanakudam Festival",imposter:"തിരണ്ട് കല്യാണം",  imposterEn:"Tirandu Kalyanam" },
  { id:79, category:"Kerala Culture",   main:"കവി",               mainEn:"Poet",                  imposter:"എഴുത്തുകാരൻ",      imposterEn:"Writer" },
  { id:80, category:"Kerala Culture",   main:"ആദിവാസി",          mainEn:"Tribal Culture",        imposter:"നാടൻ",              imposterEn:"Village Folk" },

  // ── Nature (15 pairs) ───────────────────────────────────────
  { id:81, category:"Nature",           main:"കായൽ",              mainEn:"Backwaters",            imposter:"തോട്",              imposterEn:"Canal" },
  { id:82, category:"Nature",           main:"തെങ്ങ്",             mainEn:"Coconut Tree",          imposter:"കമുക്",             imposterEn:"Areca Nut Tree" },
  { id:83, category:"Nature",           main:"ആന",                mainEn:"Elephant",              imposter:"കടുവ",              imposterEn:"Tiger" },
  { id:84, category:"Nature",           main:"മഴ",                mainEn:"Rain",                  imposter:"ചാറ്റൽ മഴ",        imposterEn:"Drizzle" },
  { id:85, category:"Nature",           main:"ഇടി",               mainEn:"Thunder",               imposter:"മിന്നൽ",           imposterEn:"Lightning" },
  { id:86, category:"Nature",           main:"ഞാറ്",              mainEn:"Paddy Seedling",        imposter:"നെൽ‌കൃഷി",         imposterEn:"Paddy Farming" },
  { id:87, category:"Nature",           main:"മഞ്ഞ്",             mainEn:"Mist / Fog",            imposter:"തണ്ണീർ",            imposterEn:"Dew" },
  { id:88, category:"Nature",           main:"പെരിയാർ",           mainEn:"Periyar River",         imposter:"ഭരതപ്പുഴ",          imposterEn:"Bharathapuzha" },
  { id:89, category:"Nature",           main:"കടൽ",               mainEn:"Sea",                   imposter:"കടൽ‌ക്കര",         imposterEn:"Seashore" },
  { id:90, category:"Nature",           main:"കടലാസ്",            mainEn:"Paper",                 imposter:"ഇല",                imposterEn:"Leaf" },
  { id:91, category:"Nature",           main:"തേക്ക്",             mainEn:"Teak",                  imposter:"ഈന്തൽ",            imposterEn:"Rosewood" },
  { id:92, category:"Nature",           main:"ഉൾക്കടൽ",          mainEn:"Deep Sea",              imposter:"ആഴക്കടൽ",          imposterEn:"Ocean Depths" },
  { id:93, category:"Nature",           main:"മലനാട്",            mainEn:"Highland Region",       imposter:"ഇടനാട്",           imposterEn:"Midland Region" },
  { id:94, category:"Nature",           main:"ഒഴുക്ക്",           mainEn:"River Flow",            imposter:"ഉറവ",               imposterEn:"Spring / Source" },
  { id:95, category:"Nature",           main:"കുരങ്ങ്",           mainEn:"Monkey",                imposter:"ചേനക്കോഴി",        imposterEn:"Wild Fowl" },

  // ── Office Life (20 pairs) ──────────────────────────────────
  { id:96,  category:"Office Life",     main:"Meeting",           mainEn:"Meeting",               imposter:"Standup",           imposterEn:"Standup Call" },
  { id:97,  category:"Office Life",     main:"Deadline",          mainEn:"Deadline",              imposter:"Sprint",            imposterEn:"Sprint" },
  { id:98,  category:"Office Life",     main:"Leave",             mainEn:"Leave",                 imposter:"WFH",               imposterEn:"Work From Home" },
  { id:99,  category:"Office Life",     main:"Appraisal",         mainEn:"Appraisal",             imposter:"Increment",         imposterEn:"Salary Increment" },
  { id:100, category:"Office Life",     main:"Presentation",      mainEn:"Presentation",          imposter:"Demo",              imposterEn:"Demo" },
  { id:101, category:"Office Life",     main:"Coffee Break",      mainEn:"Coffee Break",          imposter:"Lunch Break",       imposterEn:"Lunch Break" },
  { id:102, category:"Office Life",     main:"Manager",           mainEn:"Manager",               imposter:"Team Lead",         imposterEn:"Team Lead" },
  { id:103, category:"Office Life",     main:"Salary Slip",       mainEn:"Salary Slip",           imposter:"Tax Form",          imposterEn:"Tax Form" },
  { id:104, category:"Office Life",     main:"Zoom Call",         mainEn:"Zoom Call",             imposter:"Google Meet",       imposterEn:"Google Meet" },
  { id:105, category:"Office Life",     main:"Bug",               mainEn:"Bug (Software)",        imposter:"Issue",             imposterEn:"Issue / Ticket" },
  { id:106, category:"Office Life",     main:"Onboarding",        mainEn:"Onboarding",            imposter:"Induction",         imposterEn:"Induction Training" },
  { id:107, category:"Office Life",     main:"KPI",               mainEn:"KPI",                   imposter:"OKR",               imposterEn:"OKR" },
  { id:108, category:"Office Life",     main:"Offsite",           mainEn:"Team Offsite",          imposter:"Team Outing",       imposterEn:"Team Outing" },
  { id:109, category:"Office Life",     main:"Resignation",       mainEn:"Resignation",           imposter:"Notice Period",     imposterEn:"Notice Period" },
  { id:110, category:"Office Life",     main:"Probation",         mainEn:"Probation Period",      imposter:"Confirmation",      imposterEn:"Confirmation Letter" },
  { id:111, category:"Office Life",     main:"Retro",             mainEn:"Retrospective",         imposter:"Review",            imposterEn:"Sprint Review" },
  { id:112, category:"Office Life",     main:"Slack",             mainEn:"Slack",                 imposter:"Teams",             imposterEn:"Microsoft Teams" },
  { id:113, category:"Office Life",     main:"CTC",               mainEn:"CTC",                   imposter:"In-hand",           imposterEn:"In-hand Salary" },
  { id:114, category:"Office Life",     main:"Feedback",          mainEn:"Feedback",              imposter:"360 Review",        imposterEn:"360 Degree Review" },
  { id:115, category:"Office Life",     main:"WFH",               mainEn:"Work From Home",        imposter:"Hybrid",            imposterEn:"Hybrid Work Model" },

  // ── Malayalam Cinema (15 pairs) ─────────────────────────────
  { id:116, category:"Malayalam Cinema",main:"മോഹൻലാൽ",           mainEn:"Mohanlal",              imposter:"മമ്മൂട്ടി",         imposterEn:"Mammootty" },
  { id:117, category:"Malayalam Cinema",main:"ദൃശ്യം",            mainEn:"Drishyam",              imposter:"ഒ.എം.ജി",          imposterEn:"OMG" },
  { id:118, category:"Malayalam Cinema",main:"ഫഹദ് ഫാസിൽ",       mainEn:"Fahadh Faasil",         imposter:"ദുൽഖർ",            imposterEn:"Dulquer Salmaan" },
  { id:119, category:"Malayalam Cinema",main:"ടോവിനോ",            mainEn:"Tovino Thomas",         imposter:"ആസിഫ്",            imposterEn:"Asif Ali" },
  { id:120, category:"Malayalam Cinema",main:"2018",              mainEn:"2018 (movie)",           imposter:"ജോജോ",             imposterEn:"Jojo (movie)" },
  { id:121, category:"Malayalam Cinema",main:"ലൂസിഫർ",           mainEn:"Lucifer",               imposter:"ആർക്ക്",           imposterEn:"Aarkku" },
  { id:122, category:"Malayalam Cinema",main:"ശോഭന",             mainEn:"Shobana",               imposter:"മഞ്ജു വാര്യർ",     imposterEn:"Manju Warrier" },
  { id:123, category:"Malayalam Cinema",main:"ജഗദീഷ്",           mainEn:"Jagadish",              imposter:"ഇന്നസെന്റ്",       imposterEn:"Innocent" },
  { id:124, category:"Malayalam Cinema",main:"KPAC ലളിത",         mainEn:"KPAC Lalitha",          imposter:"ശ്രീലക്ഷ്മി",      imposterEn:"Sreelekha" },
  { id:125, category:"Malayalam Cinema",main:"പ്രിയദർശൻ",        mainEn:"Priyadarshan",          imposter:"ഷ്യാമപ്രസാദ്",    imposterEn:"Shyamaprasad" },
  { id:126, category:"Malayalam Cinema",main:"ആദ്യ ഷോ",          mainEn:"First Show",            imposter:"ജൂബിലി",           imposterEn:"Jubilee Run" },
  { id:127, category:"Malayalam Cinema",main:"നവതരംഗം",          mainEn:"New Wave Cinema",       imposter:"സമാന്തര ചലച്ചിത്രം",imposterEn:"Parallel Cinema" },
  { id:128, category:"Malayalam Cinema",main:"ദേശീയ അവാർഡ്",    mainEn:"National Film Award",   imposter:"കേരള അവാർഡ്",      imposterEn:"Kerala State Award" },
  { id:129, category:"Malayalam Cinema",main:"ഹൊറർ",             mainEn:"Horror Film",           imposter:"ത്രില്ലർ",          imposterEn:"Thriller Film" },
  { id:130, category:"Malayalam Cinema",main:"കൊമേഡി",           mainEn:"Comedy Film",           imposter:"ഫ്യൂൺ",            imposterEn:"Fun Film" },

  // ── Music (10 pairs) ────────────────────────────────────────
  { id:131, category:"Music",           main:"യേശുദാസ്",          mainEn:"Yesudas",               imposter:"ജയചന്ദ്രൻ",        imposterEn:"Jayachandran" },
  { id:132, category:"Music",           main:"ഒ.എൻ.വി",          mainEn:"O.N.V Kurup",           imposter:"ശ്രീകുമാരൻ തമ്പി", imposterEn:"Sreekumaran Thampi" },
  { id:133, category:"Music",           main:"ഓണപ്പാട്ട്",       mainEn:"Onappattu",             imposter:"നാടൻ‍പാട്ട്",       imposterEn:"Folk Song" },
  { id:134, category:"Music",           main:"ചേന്ദ",             mainEn:"Chenda (Drum)",         imposter:"തകിൽ",              imposterEn:"Thakil Drum" },
  { id:135, category:"Music",           main:"ഹാർമോണിയം",        mainEn:"Harmonium",             imposter:"തബല",               imposterEn:"Tabla" },
  { id:136, category:"Music",           main:"ഗസൽ",              mainEn:"Ghazal",                imposter:"ഖവ്വാലി",          imposterEn:"Qawwali" },
  { id:137, category:"Music",           main:"കർണ്ണാടിക്",       mainEn:"Carnatic Music",        imposter:"ഹിന്ദുസ്ഥാനി",    imposterEn:"Hindustani Music" },
  { id:138, category:"Music",           main:"ഗിറ്റാർ",           mainEn:"Guitar",                imposter:"വയലിൻ",            imposterEn:"Violin" },
  { id:139, category:"Music",           main:"ചലച്ചിത്ര ഗാനം",  mainEn:"Film Song",             imposter:"ലളിത ഗാനം",        imposterEn:"Light Music" },
  { id:140, category:"Music",           main:"ഗായകൻ",            mainEn:"Singer",                imposter:"ഗായിക",             imposterEn:"Female Singer" },

  // ── Sports (10 pairs) ───────────────────────────────────────
  { id:141, category:"Sports",          main:"ക്രിക്കറ്റ്",       mainEn:"Cricket",               imposter:"ഫുട്ബോൾ",          imposterEn:"Football" },
  { id:142, category:"Sports",          main:"വോളിബോൾ",          mainEn:"Volleyball",            imposter:"കബഡി",              imposterEn:"Kabaddi" },
  { id:143, category:"Sports",          main:"ഒളിമ്പിക്സ്",      mainEn:"Olympics",              imposter:"ഏഷ്യൻ ഗെയിംസ്",  imposterEn:"Asian Games" },
  { id:144, category:"Sports",          main:"IPL",               mainEn:"IPL Cricket",           imposter:"ടി-20",             imposterEn:"T20 World Cup" },
  { id:145, category:"Sports",          main:"കേരള ബ്ലാസ്‌റ്റേഴ്‌സ്",mainEn:"Kerala Blasters",  imposter:"ഗോകുലം",           imposterEn:"Gokulam FC" },
  { id:146, category:"Sports",          main:"ചെസ്സ്",            mainEn:"Chess",                 imposter:"കരം",               imposterEn:"Carrom" },
  { id:147, category:"Sports",          main:"ഗ്രൗണ്ട്",         mainEn:"Sports Ground",         imposter:"സ്‌റ്റേഡിയം",      imposterEn:"Stadium" },
  { id:148, category:"Sports",          main:"ഓട്ടം",             mainEn:"Running",               imposter:"നടത്തം",           imposterEn:"Walking" },
  { id:149, category:"Sports",          main:"ഗോൾ",              mainEn:"Goal",                  imposter:"സിക്‌സർ",          imposterEn:"Sixer" },
  { id:150, category:"Sports",          main:"ക്യാപ്ടൻ",         mainEn:"Captain",               imposter:"വൈസ് ക്യാപ്ടൻ",  imposterEn:"Vice Captain" },

  // ── Transport (10 pairs) ────────────────────────────────────
  { id:151, category:"Transport",       main:"KSRTC",             mainEn:"KSRTC Bus",             imposter:"സ്വകാര്യ ബസ്",    imposterEn:"Private Bus" },
  { id:152, category:"Transport",       main:"ഓട്ടോ",             mainEn:"Auto Rickshaw",         imposter:"ടാക്സി",           imposterEn:"Taxi" },
  { id:153, category:"Transport",       main:"കൊച്ചി മെട്രോ",    mainEn:"Kochi Metro",           imposter:"ബെംഗളൂരു മെട്രോ",imposterEn:"Bangalore Metro" },
  { id:154, category:"Transport",       main:"ഫെറി",              mainEn:"Ferry Boat",            imposter:"ഹൗസ്‌ബോട്ട്",    imposterEn:"Houseboat" },
  { id:155, category:"Transport",       main:"ട്രെയിൻ",           mainEn:"Train",                 imposter:"ബസ്",              imposterEn:"Bus" },
];

// ── Fisher-Yates Shuffle ────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Anti-Repeat Word Picker ─────────────────────────────────
// Stores used word IDs in localStorage per room.
// Resets only when all 155 pairs are exhausted.
function pickNextWordPair(roomCode) {
  const storageKey = `imposter_used_${roomCode}`;
  let used = JSON.parse(localStorage.getItem(storageKey) || '[]');
  let remaining = WORD_LIBRARY.filter(w => !used.includes(w.id));

  if (remaining.length === 0) {
    used = [];
    remaining = [...WORD_LIBRARY];
  }

  const shuffled = shuffleArray(remaining);
  const pick = shuffled[0];

  used.push(pick.id);
  localStorage.setItem(storageKey, JSON.stringify(used));
  return pick;
}

// ── Get word pair by ID (for results display) ───────────────
function getWordPairById(id) {
  return WORD_LIBRARY.find(w => w.id === id) || null;
}
