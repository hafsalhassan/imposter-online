// ============================================================
//  game.js — Full game logic for Sync Room / Imposter Game
// ============================================================
(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────
  const TIMER_OPTIONS = [
    { seconds: 60,  label: '1 min'   },
    { seconds: 120, label: '2 min'   },
    { seconds: 180, label: '3 min'   },
    { seconds: 300, label: '5 min'   },
    { seconds: 420, label: '7 min'   },
    { seconds: 0,   label: 'No limit'},
  ];

  const AVATAR_COLORS = [
    '#6366F1','#10B981','#F59E0B','#EF4444',
    '#8B5CF6','#06B6D4','#F97316','#EC4899',
    '#14B8A6','#84CC16',
  ];

  // ── State ────────────────────────────────────────────────
  const ROOM_CODE = new URLSearchParams(window.location.search).get('room');
  const PLAYER_ID = getOrCreatePlayerId();

  let roomRef;
  let currentRoom   = null;   // latest snapshot val
  let myWord        = null;   // fetched once
  let myRole        = null;   // 'player' | 'imposter'
  let selectedVote  = null;
  let timerInterval = null;
  let wordRevealTimer = null;
  let peekTimer     = null;
  let kickTarget    = null;
  let selectedTimerSec = 180;
  let readyConfirmed  = false;

  // ── Init ─────────────────────────────────────────────────
  if (!ROOM_CODE) { window.location.href = 'index.html'; return; }

  document.getElementById('header-room-code').textContent = ROOM_CODE;
  attachStaticListeners();
  listenRoom();
  keepOnline();

  // ── Firebase helpers ──────────────────────────────────────
  function roomPath(subpath) {
    return subpath ? `rooms/${ROOM_CODE}/${subpath}` : `rooms/${ROOM_CODE}`;
  }

  function dbSet(path, val)    { return db.ref(path).set(val); }
  function dbUpdate(path, val) { return db.ref(path).update(val); }
  function dbGet(path)         { return db.ref(path).once('value'); }

  // ── Listen to room (main loop) ─────────────────────────
  function listenRoom() {
    roomRef = db.ref(roomPath());
    roomRef.on('value', snap => {
      if (!snap.exists()) { kicked(); return; }
      currentRoom = snap.val();
      render(currentRoom);
    });

    // Listen for being kicked
    db.ref(roomPath('players/' + PLAYER_ID)).on('value', snap => {
      if (currentRoom && !snap.exists()) { kicked(); }
    });
  }

  // ── Keep player online ───────────────────────────────────
  function keepOnline() {
    const onlineRef = db.ref(roomPath('players/' + PLAYER_ID + '/isOnline'));
    onlineRef.set(true);
    onlineRef.onDisconnect().set(false);
  }

  // ── Render ───────────────────────────────────────────────
  function render(room) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    switch (room.state) {
      case 'lobby':        renderLobby(room);       break;
      case 'word_reveal':  renderWordReveal(room);  break;
      case 'discussion':   renderDiscussion(room);  break;
      case 'voting':       renderVoting(room);      break;
      case 'results':      renderResults(room);     break;
      case 'ended':        renderEnded(room);        break;
    }

    updateDockedPanel(room);
  }

  // ────────────────────────────────────────────────────────
  // LOBBY
  // ────────────────────────────────────────────────────────
  function renderLobby(room) {
    showScreen('lobby');

    const players    = room.players || {};
    const playerArr  = objectToArray(players);
    const isHost     = room.hostId === PLAYER_ID;
    const count      = playerArr.length;

    document.getElementById('lobby-player-count').textContent = count + ' joined';
    document.getElementById('host-settings').classList.toggle('hidden', !isHost);
    document.getElementById('host-start-wrap').classList.toggle('hidden', !isHost);
    document.getElementById('guest-waiting').classList.toggle('hidden', isHost);

    // Start button state
    const btnStart = document.getElementById('btn-start');
    btnStart.disabled = count < 3;

    // Render players
    const listEl = document.getElementById('lobby-players');
    listEl.innerHTML = '';
    playerArr.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'player-item';
      const initial = (p.name || '?')[0].toUpperCase();
      const color   = AVATAR_COLORS[i % AVATAR_COLORS.length];
      const isMe    = p.id === PLAYER_ID;
      const isHost2 = p.id === room.hostId;

      item.innerHTML = `
        <div class="player-avatar" style="background:${color}">${initial}</div>
        <div class="player-info">
          <div class="player-name">
            ${esc(p.name)}
            ${isMe   ? '<span class="me-badge">You</span>'   : ''}
            ${isHost2 ? '<span class="host-badge">Host</span>' : ''}
          </div>
          <div class="player-meta">${p.isOnline ? '● Online' : '○ Away'}</div>
        </div>
        <div class="player-actions">
          ${isHost && !isMe ? `<button class="kick-btn" data-id="${p.id}" data-name="${esc(p.name)}" title="Remove">✕</button>` : ''}
        </div>`;
      listEl.appendChild(item);
    });

    // Kick buttons
    listEl.querySelectorAll('.kick-btn').forEach(btn => {
      btn.addEventListener('click', () => openKickModal(btn.dataset.id, btn.dataset.name));
    });
  }

  // ────────────────────────────────────────────────────────
  // WORD REVEAL
  // ────────────────────────────────────────────────────────
  function renderWordReveal(room) {
    showScreen('word-reveal');

    const round = room.round || 1;
    document.getElementById('round-badge').textContent   = 'Round ' + round;

    // Fetch my word & role once per round
    fetchMyWordAndRole(room);

    // Ready state
    const readyMap  = room.ready || {};
    const players   = room.players || {};
    const total     = Object.keys(players).length;
    const readyCount= Object.keys(readyMap).length;
    document.getElementById('ready-status').textContent =
      `${readyCount} / ${total} ready`;

    // Category (no spoiler)
    const pair = room.currentWordId ? getWordPairById(room.currentWordId) : null;
    document.getElementById('category-display').textContent =
      pair ? '📂 Category: ' + pair.category : '';

    // If already confirmed ready, disable button
    if (readyMap[PLAYER_ID]) {
      document.getElementById('btn-ready').textContent = '✓ Ready!';
      document.getElementById('btn-ready').disabled = true;
    }

    // Host auto-advances when everyone is ready
    if (room.hostId === PLAYER_ID && readyCount >= total && total > 0) {
      startDiscussion();
    }
  }

  async function fetchMyWordAndRole(room) {
    if (myWord !== null) return; // already fetched this round

    const wordSnap = await dbGet(roomPath('words/' + PLAYER_ID));
    const roleSnap = await dbGet(roomPath('roles/' + PLAYER_ID));

    myWord = wordSnap.val();
    myRole = roleSnap.val();

    // Show role hint
    document.getElementById('imposter-hint').classList.toggle('hidden', myRole !== 'imposter');
    document.getElementById('player-hint').classList.toggle('hidden',   myRole !== 'player');
  }

  // ────────────────────────────────────────────────────────
  // DISCUSSION
  // ────────────────────────────────────────────────────────
  function renderDiscussion(room) {
    showScreen('discussion');

    const round = room.round || 1;
    document.getElementById('disc-round-badge').textContent = 'Round ' + round;

    // Players grid
    const players   = room.players || {};
    const playerArr = objectToArray(players);
    const gridEl    = document.getElementById('discussion-players');
    gridEl.innerHTML = '';
    playerArr.forEach((p, i) => {
      const color   = AVATAR_COLORS[i % AVATAR_COLORS.length];
      const initial = (p.name || '?')[0].toUpperCase();
      const chip    = document.createElement('div');
      chip.className = 'player-chip';
      chip.innerHTML = `
        <div class="player-avatar" style="background:${color};width:32px;height:32px;font-size:.8rem">${initial}</div>
        <div class="player-chip-name">${esc(p.name)}</div>`;
      gridEl.appendChild(chip);
    });

    // Category hint
    const pair = room.currentWordId ? getWordPairById(room.currentWordId) : null;
    document.getElementById('disc-category').textContent =
      pair ? '📂 Category: ' + pair.category : '';

    // Host controls
    document.getElementById('btn-end-discussion').classList.toggle('hidden', room.hostId !== PLAYER_ID);

    // Timer
    startTimerDisplay(room.timerEnd, room.timerDuration);
  }

  // ────────────────────────────────────────────────────────
  // VOTING
  // ────────────────────────────────────────────────────────
  function renderVoting(room) {
    showScreen('voting');
    stopTimer();

    const players   = room.players || {};
    const playerArr = objectToArray(players);
    const votes     = room.votes  || {};
    const myVote    = votes[PLAYER_ID];

    if (myVote) selectedVote = myVote;

    const listEl = document.getElementById('vote-list');
    listEl.innerHTML = '';

    playerArr.forEach((p, i) => {
      const isMe = p.id === PLAYER_ID;
      const hasVoted = !!votes[p.id];

      const item = document.createElement('div');
      item.className = 'vote-item' +
        (isMe                    ? ' disabled'  : '') +
        (selectedVote === p.id   ? ' selected'  : '');
      item.dataset.targetId = p.id;

      const color   = AVATAR_COLORS[i % AVATAR_COLORS.length];
      const initial = (p.name || '?')[0].toUpperCase();

      item.innerHTML = `
        <div class="vote-radio"></div>
        <div class="player-avatar" style="background:${color};width:32px;height:32px;font-size:.8rem">${initial}</div>
        <div class="vote-name">${esc(p.name)}${isMe ? ' <span class="me-badge">You</span>' : ''}</div>
        ${hasVoted ? '<span class="vote-submitted">✓ voted</span>' : ''}`;

      if (!isMe && !myVote) {
        item.addEventListener('click', () => selectVote(p.id));
      }
      listEl.appendChild(item);
    });

    // Vote status
    const voteCount  = Object.keys(votes).length;
    const totalCount = playerArr.length;
    document.getElementById('vote-status').textContent =
      `${voteCount} / ${totalCount} voted`;

    // Enable cast button if selection made and not yet voted
    const castBtn = document.getElementById('btn-cast-vote');
    castBtn.disabled = !selectedVote || !!myVote;
    if (myVote) castBtn.textContent = '✓ Vote Cast';

    // Host tallies when all voted
    if (room.hostId === PLAYER_ID && voteCount >= totalCount) {
      tallyVotes(room);
    }
  }

  function selectVote(targetId) {
    selectedVote = targetId;
    document.querySelectorAll('.vote-item').forEach(el => {
      el.classList.toggle('selected', el.dataset.targetId === targetId);
    });
    document.getElementById('btn-cast-vote').disabled = false;
  }

  // ────────────────────────────────────────────────────────
  // RESULTS
  // ────────────────────────────────────────────────────────
  function renderResults(room) {
    showScreen('results');
    stopTimer();

    const results = room.results || {};
    const players = room.players || {};
    const round   = room.round || 1;

    document.getElementById('results-round-badge').textContent = `Round ${round} Results`;

    // Eliminated card
    const elim      = players[results.eliminatedId] || {};
    const revCard   = document.getElementById('reveal-card');
    revCard.className = 'reveal-card ' + (results.wasImposter ? 'is-imposter' : 'not-imposter');
    document.getElementById('reveal-name').textContent    = elim.name || '?';
    document.getElementById('reveal-verdict').textContent = results.wasImposter
      ? '🕵️ Was the Imposter!' : '✅ Was NOT the Imposter';

    // Word reveal
    const pair = results.wordId ? getWordPairById(results.wordId) : null;
    if (pair) {
      document.getElementById('result-main-word').innerHTML =
        `${pair.main} <span style="font-size:.75rem;font-weight:400;color:var(--text-muted)">(${pair.mainEn})</span>`;
      document.getElementById('result-imposter-word').innerHTML =
        `${pair.imposter} <span style="font-size:.75rem;font-weight:400;color:var(--text-muted)">(${pair.imposterEn})</span>`;
    }

    // Score changes
    const scoreChanges = results.scoreChanges || {};
    const scListEl     = document.getElementById('score-changes-list');
    scListEl.innerHTML = '';
    objectToArray(players).forEach(p => {
      const delta  = scoreChanges[p.id] || 0;
      const reason = delta > 0
        ? (results.wasImposter
            ? (results.eliminatedId === p.id ? '' : '✓ Correct vote')
            : (results.eliminatedId === p.id ? '🕵️ Survived undetected' : ''))
        : '';
      const item = document.createElement('div');
      item.className = 'score-change-item';
      item.innerHTML = `
        <div class="score-change-name">${esc(p.name)}</div>
        <div>
          <div class="score-change-delta ${delta > 0 ? 'positive' : 'zero'}">${delta > 0 ? '+' + delta : '–'}</div>
          <div class="score-change-reason">${reason}</div>
        </div>`;
      scListEl.appendChild(item);
    });

    // Leaderboard
    renderLeaderboard(players, 'leaderboard-list');

    // Host controls
    document.getElementById('host-result-controls').classList.toggle('hidden', room.hostId !== PLAYER_ID);
    document.getElementById('guest-result-waiting').classList.toggle('hidden', room.hostId === PLAYER_ID);
  }

  // ────────────────────────────────────────────────────────
  // ENDED
  // ────────────────────────────────────────────────────────
  function renderEnded(room) {
    showScreen('ended');
    stopTimer();
    renderLeaderboard(room.players || {}, 'final-leaderboard');
  }

  // ────────────────────────────────────────────────────────
  // HOST ACTIONS
  // ────────────────────────────────────────────────────────
  async function startGame() {
    if (!currentRoom || currentRoom.hostId !== PLAYER_ID) return;
    const players   = currentRoom.players || {};
    const playerArr = objectToArray(players);
    if (playerArr.length < 3) { showToast('Need at least 3 players!', 'warning'); return; }

    const pair = pickNextWordPair(ROOM_CODE);
    const round = (currentRoom.round || 0) + 1;

    // Determine imposter count
    const imposterCount = playerArr.length >= 10 ? 2 : 1;
    const shuffled      = shuffleArr([...playerArr]);
    const imposters     = shuffled.slice(0, imposterCount).map(p => p.id);

    // Assign roles & words
    const rolesUpdate = {};
    const wordsUpdate = {};
    playerArr.forEach(p => {
      const isImposter = imposters.includes(p.id);
      rolesUpdate[p.id] = isImposter ? 'imposter' : 'player';
      wordsUpdate[p.id] = isImposter
        ? (pair.imposter + ' (' + pair.imposterEn + ')')
        : (pair.main     + ' (' + pair.mainEn     + ')');
    });

    // Clear ready, votes, results from previous round
    await dbSet(roomPath('roles'),   rolesUpdate);
    await dbSet(roomPath('words'),   wordsUpdate);
    await dbSet(roomPath('ready'),   null);
    await dbSet(roomPath('votes'),   null);
    await dbSet(roomPath('results'), null);

    // Reset per-player myWord/myRole cache
    myWord = null;
    myRole = null;
    readyConfirmed = false;

    await dbUpdate(roomPath(), {
      state:         'word_reveal',
      round,
      currentWordId: pair.id,
      timerDuration: selectedTimerSec,
      timerEnd:      null,
    });
  }

  async function startDiscussion() {
    if (!currentRoom || currentRoom.hostId !== PLAYER_ID) return;
    const duration = selectedTimerSec;
    const timerEnd = duration > 0 ? Date.now() + duration * 1000 : null;
    await dbUpdate(roomPath(), { state: 'discussion', timerEnd });
  }

  async function startVoting() {
    if (!currentRoom || currentRoom.hostId !== PLAYER_ID) return;
    await dbUpdate(roomPath(), { state: 'voting', timerEnd: null });
  }

  async function tallyVotes(room) {
    // Find most-voted player
    const votes   = room.votes   || {};
    const players = room.players || {};
    const roles   = room.roles   || {};
    const pair    = getWordPairById(room.currentWordId);

    const tally = {};
    Object.values(votes).forEach(targetId => {
      tally[targetId] = (tally[targetId] || 0) + 1;
    });

    const eliminatedId = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0];
    const wasImposter  = roles[eliminatedId] === 'imposter';

    // Score changes
    const scoreChanges = {};
    const updates      = {};

    Object.keys(players).forEach(pid => {
      scoreChanges[pid] = 0;
    });

    if (wasImposter) {
      // Correct voters get +2
      Object.entries(votes).forEach(([voterId, targetId]) => {
        if (targetId === eliminatedId && roles[voterId] !== 'imposter') {
          scoreChanges[voterId] = (scoreChanges[voterId] || 0) + 2;
        }
      });
    } else {
      // Imposter(s) survive — get +3
      Object.entries(roles).forEach(([pid, role]) => {
        if (role === 'imposter') {
          scoreChanges[pid] = (scoreChanges[pid] || 0) + 3;
        }
      });
    }

    // Apply scores
    Object.keys(players).forEach(pid => {
      updates[`players/${pid}/score`] =
        (players[pid].score || 0) + (scoreChanges[pid] || 0);
    });

    updates['results'] = {
      eliminatedId,
      wasImposter,
      wordId:       room.currentWordId,
      scoreChanges,
      votes:        tally,
    };
    updates['state'] = 'results';

    await dbUpdate(roomPath(), updates);
  }

  async function nextRound() {
    if (!currentRoom || currentRoom.hostId !== PLAYER_ID) return;
    myWord = null;
    myRole = null;
    readyConfirmed = false;
    selectedVote   = null;
    await dbUpdate(roomPath(), { state: 'lobby', timerEnd: null });
  }

  async function endGame() {
    if (!currentRoom || currentRoom.hostId !== PLAYER_ID) return;
    await dbUpdate(roomPath(), { state: 'ended' });
  }

  async function kickPlayer(targetId) {
    if (!currentRoom || currentRoom.hostId !== PLAYER_ID) return;
    await db.ref(roomPath('players/' + targetId)).remove();
    showToast('Player removed.', 'success');
  }

  // ────────────────────────────────────────────────────────
  // PLAYER ACTIONS
  // ────────────────────────────────────────────────────────
  function revealWord() {
    if (!myWord) return;

    const card = document.getElementById('word-card');
    card.classList.add('flipped');

    // Parse word display
    const { word, wordEn } = parseWord(myWord);
    document.getElementById('word-display').textContent    = word;
    document.getElementById('word-en-display').textContent = wordEn;

    // Countdown
    let countdown = 5;
    document.getElementById('word-hide-countdown').textContent = `Hiding in ${countdown}s`;
    clearInterval(wordRevealTimer);
    wordRevealTimer = setInterval(() => {
      countdown--;
      document.getElementById('word-hide-countdown').textContent =
        countdown > 0 ? `Hiding in ${countdown}s` : 'Hidden';
      if (countdown <= 0) {
        clearInterval(wordRevealTimer);
        card.classList.remove('flipped');
      }
    }, 1000);
  }

  async function markReady() {
    if (readyConfirmed) return;
    readyConfirmed = true;
    await dbSet(roomPath('ready/' + PLAYER_ID), true);
    document.getElementById('btn-ready').textContent = '✓ Ready!';
    document.getElementById('btn-ready').disabled    = true;
  }

  async function castVote() {
    if (!selectedVote) return;
    await dbSet(roomPath('votes/' + PLAYER_ID), selectedVote);
    document.getElementById('btn-cast-vote').textContent = '✓ Vote Cast';
    document.getElementById('btn-cast-vote').disabled    = true;
  }

  function peekWord() {
    if (!myWord) { showToast('Word not loaded yet.', 'warning'); return; }
    const { word, wordEn } = parseWord(myWord);
    document.getElementById('peek-word-display').textContent = word;
    document.getElementById('peek-word-en').textContent      = wordEn;

    const modal = document.getElementById('peek-modal');
    modal.classList.remove('hidden');

    let countdown = 5;
    document.getElementById('peek-hide-countdown').textContent = `Closing in ${countdown}s`;
    clearInterval(peekTimer);
    peekTimer = setInterval(() => {
      countdown--;
      document.getElementById('peek-hide-countdown').textContent =
        countdown > 0 ? `Closing in ${countdown}s` : 'Closed';
      if (countdown <= 0) {
        clearInterval(peekTimer);
        modal.classList.add('hidden');
      }
    }, 1000);
  }

  function closePeek() {
    clearInterval(peekTimer);
    document.getElementById('peek-modal').classList.add('hidden');
  }

  // ────────────────────────────────────────────────────────
  // TIMER
  // ────────────────────────────────────────────────────────
  function startTimerDisplay(timerEnd, duration) {
    stopTimer();
    if (!timerEnd) {
      // No-limit mode
      document.getElementById('timer-display').textContent = '∞';
      document.getElementById('timer-progress').style.width = '100%';
      return;
    }

    function tick() {
      const remaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
      const mins      = Math.floor(remaining / 60);
      const secs      = remaining % 60;
      const display   = `${mins}:${secs.toString().padStart(2, '0')}`;
      const pct       = duration > 0 ? (remaining / duration) * 100 : 100;

      const timerEl    = document.getElementById('timer-display');
      const progressEl = document.getElementById('timer-progress');
      const dockedEl   = document.getElementById('docked-timer');

      timerEl.textContent  = display;
      if (dockedEl) dockedEl.textContent = display;
      progressEl.style.width = pct + '%';

      const urgent  = remaining <= 30;
      const warning = remaining <= 60 && remaining > 30;

      timerEl.className    = 'timer-display' + (urgent ? ' urgent' : warning ? ' warning' : '');
      progressEl.className = 'progress-bar'  + (urgent ? ' urgent' : warning ? ' warning' : '');
      if (dockedEl) dockedEl.className = 'docked-timer' + (urgent ? ' urgent' : '');

      if (remaining === 0) {
        stopTimer();
        // Host transitions to voting
        if (currentRoom && currentRoom.hostId === PLAYER_ID) {
          startVoting();
        }
      }
    }

    tick();
    timerInterval = setInterval(tick, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // ────────────────────────────────────────────────────────
  // KICK MODAL
  // ────────────────────────────────────────────────────────
  function openKickModal(id, name) {
    kickTarget = id;
    document.getElementById('kick-modal-name').textContent = `Remove "${name}" from the room?`;
    document.getElementById('kick-modal').classList.remove('hidden');
  }

  function closeKickModal() {
    document.getElementById('kick-modal').classList.add('hidden');
    kickTarget = null;
  }

  // ────────────────────────────────────────────────────────
  // SHARE
  // ────────────────────────────────────────────────────────
  function shareRoom() {
    const url = window.location.origin + window.location.pathname + '?room=' + ROOM_CODE;
    if (navigator.share) {
      navigator.share({ title: 'Join my Sync Room', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => showToast('Link copied!', 'success'));
    }
  }

  // ────────────────────────────────────────────────────────
  // DOCK MODE
  // ────────────────────────────────────────────────────────
  function toggleDock() {
    document.body.classList.toggle('docked');
  }

  function updateDockedPanel(room) {
    const stateLabel = document.getElementById('docked-state-label');
    const wordBtn    = document.getElementById('docked-word-btn');
    const voteBtn    = document.getElementById('docked-vote-btn');
    const meta       = document.getElementById('docked-meta');

    const players = room.players || {};
    const count   = Object.keys(players).length;
    meta.textContent = `Rnd ${room.round || 1} · ${count} 👤`;

    wordBtn.classList.add('hidden');
    voteBtn.classList.add('hidden');

    switch (room.state) {
      case 'lobby':
        stateLabel.textContent = 'Lobby — Waiting';
        document.getElementById('docked-timer').textContent = '--:--';
        break;
      case 'word_reveal':
        stateLabel.textContent = 'Reveal your word';
        wordBtn.classList.remove('hidden');
        break;
      case 'discussion':
        stateLabel.textContent = 'Discussion';
        wordBtn.classList.remove('hidden');
        break;
      case 'voting':
        stateLabel.textContent = 'Voting';
        voteBtn.classList.remove('hidden');
        break;
      case 'results':
        stateLabel.textContent = 'Results';
        break;
      case 'ended':
        stateLabel.textContent = 'Game Over';
        break;
    }
  }

  // ────────────────────────────────────────────────────────
  // LEADERBOARD
  // ────────────────────────────────────────────────────────
  function renderLeaderboard(players, containerId) {
    const el      = document.getElementById(containerId);
    const sorted  = objectToArray(players).sort((a, b) => (b.score || 0) - (a.score || 0));
    const medals  = ['gold', 'silver', 'bronze'];

    el.innerHTML = sorted.map((p, i) => {
      const rankClass = i < 3 ? medals[i] : '';
      const rankLabel = i < 3 ? ['🥇','🥈','🥉'][i] : (i + 1) + '.';
      const isMe      = p.id === PLAYER_ID;
      return `
        <div class="lb-item">
          <div class="lb-rank ${rankClass}">${rankLabel}</div>
          <div class="lb-info">
            <div class="lb-name">${esc(p.name)}${isMe ? ' <span class="me-badge">You</span>' : ''}</div>
          </div>
          <div>
            <div class="lb-score">${p.score || 0}</div>
            <div class="lb-score-label">pts</div>
          </div>
        </div>`;
    }).join('');
  }

  // ────────────────────────────────────────────────────────
  // KICKED
  // ────────────────────────────────────────────────────────
  function kicked() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('main-content').innerHTML = `
      <div class="kicked-screen animate-in">
        <div style="font-size:3rem">👋</div>
        <h2>You've been removed</h2>
        <p class="text-sub">The host removed you from this room.</p>
        <a class="btn btn-primary mt-4" href="index.html">← Back to Home</a>
      </div>`;
  }

  // ────────────────────────────────────────────────────────
  // STATIC EVENT LISTENERS
  // ────────────────────────────────────────────────────────
  function attachStaticListeners() {
    // Header
    document.getElementById('btn-share').addEventListener('click', shareRoom);
    document.getElementById('btn-dock').addEventListener('click', toggleDock);
    document.getElementById('btn-undock').addEventListener('click', toggleDock);

    // Lobby
    document.getElementById('btn-start').addEventListener('click', startGame);

    // Timer options
    document.getElementById('timer-options').addEventListener('click', e => {
      const opt = e.target.closest('.timer-opt');
      if (!opt) return;
      document.querySelectorAll('.timer-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      selectedTimerSec = parseInt(opt.dataset.seconds, 10);
      if (currentRoom) {
        dbUpdate(roomPath(), { timerDuration: selectedTimerSec });
      }
    });

    // Word reveal
    document.getElementById('word-card').addEventListener('click', revealWord);
    document.getElementById('btn-ready').addEventListener('click', markReady);

    // Discussion
    document.getElementById('btn-peek').addEventListener('click', peekWord);
    document.getElementById('btn-end-discussion').addEventListener('click', startVoting);

    // Voting
    document.getElementById('btn-cast-vote').addEventListener('click', castVote);

    // Results
    document.getElementById('btn-next-round').addEventListener('click', nextRound);
    document.getElementById('btn-end-game').addEventListener('click', endGame);

    // Kick modal
    document.getElementById('kick-cancel').addEventListener('click', closeKickModal);
    document.getElementById('kick-confirm').addEventListener('click', () => {
      if (kickTarget) kickPlayer(kickTarget);
      closeKickModal();
    });
    document.getElementById('kick-modal').addEventListener('click', e => {
      if (e.target === document.getElementById('kick-modal')) closeKickModal();
    });

    // Peek modal
    document.getElementById('peek-close').addEventListener('click', closePeek);
    document.getElementById('peek-modal').addEventListener('click', e => {
      if (e.target === document.getElementById('peek-modal')) closePeek();
    });

    // Docked word/vote buttons
    document.getElementById('docked-word-btn').addEventListener('click', () => {
      toggleDock();
      setTimeout(peekWord, 300);
    });
    document.getElementById('docked-vote-btn').addEventListener('click', () => {
      toggleDock();
    });
  }

  // ────────────────────────────────────────────────────────
  // UTILITIES
  // ────────────────────────────────────────────────────────
  function showScreen(name) {
    const el = document.getElementById('screen-' + name);
    if (el) el.classList.add('active');
  }

  function objectToArray(obj) {
    if (!obj) return [];
    return Object.entries(obj).map(([id, val]) => ({ id, ...val }));
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getOrCreatePlayerId() {
    let id = localStorage.getItem('syncroom_player_id');
    if (!id) { id = 'p_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36); localStorage.setItem('syncroom_player_id', id); }
    return id;
  }

  function shuffleArr(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function parseWord(wordStr) {
    // Format stored: "word (English)" or just "word"
    const match = wordStr.match(/^(.+?)\s*\((.+)\)$/);
    if (match) return { word: match[1].trim(), wordEn: match[2].trim() };
    return { word: wordStr, wordEn: '' };
  }

  function showToast(msg, type = '') {
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' toast--' + type : '');
    el.textContent = msg;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

})();
