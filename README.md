# 🎭 Sync Room — Imposter Game

A real-time multiplayer Imposter word game built for Kerala office teams.  
Play via browser — no app install needed.

> **The app is called "Sync Room"** to look like a productivity tool in the office! 😄

---

## 🚀 Quick Setup (5 minutes)

### Step 1 — Fork this repository

Click **Fork** on GitHub to get your own copy.

### Step 2 — Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → Name it anything (e.g., `syncroom-game`)
3. Disable Google Analytics (optional) → **Create project**
4. In the left sidebar → **Build** → **Realtime Database**
5. Click **Create Database** → Choose location → Start in **test mode**
6. Click **Project Settings** (gear icon) → **General** tab
7. Under **Your apps**, click **</> Web** → Register app → Copy the `firebaseConfig` object

### Step 3 — Add your Firebase config

Open `js/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey:            "your-actual-api-key",
  authDomain:        "your-project.firebaseapp.com",
  databaseURL:       "https://your-project-default-rtdb.firebaseio.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef"
};
```

### Step 4 — Enable GitHub Pages

1. In your forked repo → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Commit & push your firebase-config.js change to `main`
4. GitHub Actions will deploy automatically (takes ~1 minute)
5. Your game is live at: `https://yourusername.github.io/repo-name`

---

## 🎮 How to Play

1. **Host** opens the site → clicks **Create Room** → enters their name
2. **Host** shares the room link (or room code) with friends
3. **Players** open the link → enter their name → join
4. **Host** picks timer duration → clicks **Start Round**
5. Each player **taps their word card** to see their secret word (visible 5 sec)
6. Everyone **discusses** — try to figure out who the imposter is
7. When timer ends → **vote** for who you think the imposter is
8. Most-voted player is **eliminated** → reveal if they were the imposter
9. **Scoring:** Correct voters get **+2 pts** · Imposter survives → gets **+3 pts**
10. Play multiple rounds — leaderboard tracks scores!

---

## 📱 Mobile

Works great on mobile! Players can open on their phones while you play.

For the best experience, tap **Add to Home Screen** in your browser — it'll open like an app.

---

## 🏢 Office Mode

The app is designed to look like a "Team Sync Tool" — not a game. Use the **Dock →** button on desktop to pin it as a slim 300px sidebar so colleagues won't notice. 😅

---

## 🔧 Customization

**Add more words:** Edit `js/words.js` — follow the existing format.

**Change timer defaults:** Edit `TIMER_OPTIONS` in `js/game.js`.

**Change app name:** Edit the `<title>` in HTML files and `name` in `manifest.json`.

---

## 📦 Tech Stack

- **Frontend:** Pure HTML + CSS + JavaScript (no build step)
- **Backend:** Firebase Realtime Database (free tier)
- **Hosting:** GitHub Pages (free)
- **PWA:** Add to Home Screen support

---

## 🆓 Free Tier Limits

Firebase Spark (free) plan: 100 simultaneous connections, 1 GB storage, 10 GB/month transfer.  
More than enough for office use!

---

Made with ❤️ for Kerala office teams.
