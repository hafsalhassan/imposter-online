// ============================================================
//  game.js — Clue Chat, Hold-to-Reveal & Turn-based Imposter Game
// ============================================================
function initGame() {
  'use strict';

  // ── Global Scope Variables for Game Instance ───────────────
  let roomRef = null;
  let currentRoom = null;
  let myWord = null;
  let myRole = null;
  let selectedVote = null;
  let kickTarget = null;
  let typingTimeout = null;
  let cachedWordRound = null;
  let lastRenderedRound = null;
  let wasMyTurn = false;
  let isTallying = false;
  let soundEnabled = true;

  try {
    soundEnabled = localStorage.getItem('syncroom_sound') !== 'off';
  } catch (e) {}

  // ── Safe Avatar Svg Getter (Flat Gaming Animal Avatars) ───
  function getSafeAvatarSvg(avatarId) {
    if (typeof getAvatarSvg === 'function') {
      try { return getAvatarSvg(avatarId); } catch (e) {}
    }
    if (typeof ANIMAL_AVATARS !== 'undefined' && Array.isArray(ANIMAL_AVATARS)) {
      const match = ANIMAL_AVATARS.find(a => a.id === avatarId);
      if (match) return match.svg;
      if (ANIMAL_AVATARS[0]) return ANIMAL_AVATARS[0].svg;
    }
    return `<svg viewBox="0 0 100 100" fill="#5B5AF7"><circle cx="50" cy="50" r="48" fill="#EEF2FF"/><circle cx="50" cy="40" r="20" fill="#5B5AF7"/><ellipse cx="50" cy="80" rx="30" ry="20" fill="#5B5AF7"/></svg>`;
  }

  // ── Theme & Sound Helpers ─────────────────────────────────
  function getEffectiveTheme() {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark' || attr === 'light') return attr;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function syncThemeButton() {
    const btn = document.getElementById('btn-theme-toggle');
    if (!btn) return;
    const isDark = getEffectiveTheme() === 'dark';
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }

  function toggleTheme() {
    const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('syncroom_theme', next); } catch (e) {}
    syncThemeButton();
  }

  function syncSoundButton() {
    const btn = document.getElementById('btn-sound-toggle');
    if (!btn) return;
    btn.textContent = soundEnabled ? '🔊' : '🔇';
    btn.title = soundEnabled ? 'Mute turn alert' : 'Unmute turn alert';
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    try { localStorage.setItem('syncroom_sound', soundEnabled ? 'on' : 'off'); } catch (e) {}
    syncSoundButton();
    showToast(soundEnabled ? 'Turn sound enabled' : 'Sound muted', 'info');
  }

  function playTurnChime() {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);       // D5
      osc.frequency.setValueAtTime(880.0, now + 0.08); // A5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  const TOTAL_DEFAULT_ROUNDS = 2;

  const urlParams = new URLSearchParams(window.location.search);
  const ROOM_CODE = (urlParams.get('room') || '').toUpperCase().trim();

  if (!ROOM_CODE) {
    window.location.href = 'index.html';
    return;
  }

  // Immediately display room code in header, invite card & title
  const headerCodeEl = document.getElementById('header-room-code');
  if (headerCodeEl) {
    headerCodeEl.textContent = ROOM_CODE;
    headerCodeEl.onclick = shareRoom;
  }
  const lobbyInviteEl = document.getElementById('lobby-invite-code');
  if (lobbyInviteEl) lobbyInviteEl.textContent = ROOM_CODE;
  document.title = `Sync Room — ${ROOM_CODE}`;

  // Dedicated session storage key per room to avoid multi-tab collisions on same browser
  const tabPlayerKey = `syncroom_pid_${ROOM_CODE}`;
  let PLAYER_ID = urlParams.get('pid') || sessionStorage.getItem(tabPlayerKey) || sessionStorage.getItem('syncroom_player_id');
  if (!PLAYER_ID) {
    PLAYER_ID = 'p_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  }
  sessionStorage.setItem(tabPlayerKey, PLAYER_ID);
  sessionStorage.setItem('syncroom_player_id', PLAYER_ID);

  syncThemeButton();
  syncSoundButton();
  attachStaticListeners();
  listenRoom();
  keepOnline();

  // ── Firebase Helpers ──────────────────────────────────────
  function roomPath(subpath) {
    return subpath ? `rooms/${ROOM_CODE}/${subpath}` : `rooms/${ROOM_CODE}`;
  }
  function dbSet(path, val)    { return db.ref(path).set(val); }
  function dbUpdate(path, val) { return db.ref(path).update(val); }
  function dbGet(path)         { return db.ref(path).once('value'); }

  // ── Room Listener ─────────────────────────────────────────
  function listenRoom() {
    roomRef = db.ref(roomPath());
    roomRef.on('value', async snap => {
      if (!snap.exists()) {
        kicked();
        return;
      }
      currentRoom = snap.val();

      // If user joined with URL but isn't yet recorded in players
      if (!currentRoom.players || !currentRoom.players[PLAYER_ID] || !currentRoom.players[PLAYER_ID].name) {
        const savedName = localStorage.getItem('syncroom_name');
        if (savedName && currentRoom.state === 'lobby') {
          const savedAvatar = localStorage.getItem('syncroom_avatar') || 'fox';
          await db.ref(roomPath('players/' + PLAYER_ID)).update({
            name: savedName,
            avatar: savedAvatar,
            score: 0,
            isOnline: true,
            joinedAt: Date.now()
          });
          return;
        } else if (!savedName && currentRoom.state === 'lobby') {
          window.location.href = 'index.html?room=' + ROOM_CODE;
          return;
        }
      }

      render(currentRoom);
    });

    // Only trigger kick if the player was previously in the room with a name and is now removed
    db.ref(roomPath('players/' + PLAYER_ID)).on('value', snap => {
      if (currentRoom && currentRoom.players && !snap.exists()) {
        const wasInRoom = Object.keys(currentRoom.players).includes(PLAYER_ID);
        if (wasInRoom) {
          kicked();
        }
      }
    });
  }

  function keepOnline() {
    const playerRef = db.ref(roomPath('players/' + PLAYER_ID));
    playerRef.once('value').then(snap => {
      if (snap.exists() && snap.val()?.name) {
        const onlineRef = db.ref(roomPath('players/' + PLAYER_ID + '/isOnline'));
        onlineRef.set(true);
        onlineRef.onDisconnect().set(false);
      }
    });
  }

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
    const el = document.getElementById('screen-' + name);
    if (el) {
      el.classList.remove('hidden');
      el.classList.add('active');
    }
  }

  // ── Render Director ───────────────────────────────────────
  function render(room) {
    if (!room || !room.state) return;

    // Reset per-round cached word and role when in lobby or round changes
    if (room.state === 'lobby') {
      myWord = null;
      myRole = null;
      selectedVote = null;
      cachedWordRound = null;
      wasMyTurn = false;
      isTallying = false;
    }
    if (lastRenderedRound !== null && room.round !== lastRenderedRound) {
      myWord = null;
      myRole = null;
      selectedVote = null;
      cachedWordRound = null;
      wasMyTurn = false;
      isTallying = false;
    }
    lastRenderedRound = room.round;

    switch (room.state) {
      case 'lobby':   renderLobby(room);   break;
      case 'arena':   renderArena(room);   break;
      case 'voting':  renderVoting(room);  break;
      case 'results': renderResults(room); break;
      case 'ended':   renderEnded(room);   break;
    }
  }

  // ──────────────────────────────────────────────────────────
  // 1. LOBBY
  // ──────────────────────────────────────────────────────────
  function renderLobby(room) {
    showScreen('lobby');

    const players   = room.players || {};
    const playerArr = objectToArray(players);
    const isHost    = room.hostId === PLAYER_ID;
    const count     = playerArr.length;

    document.getElementById('lobby-player-count').textContent = count + ' joined';
    
    // Host exclusive controls
    const hostPanel = document.getElementById('host-exclusive-panel');
    if (hostPanel) hostPanel.classList.toggle('hidden', !isHost);

    // Sync Imposter Mode & Clue Rounds Radios
    if (room.imposterMode) {
      const modeRadio = document.querySelector(`input[name="imposter-mode"][value="${room.imposterMode}"]`);
      if (modeRadio) modeRadio.checked = true;
    }
    if (room.totalClueRounds) {
      const roundRadio = document.querySelector(`input[name="clue-rounds"][value="${room.totalClueRounds}"]`);
      if (roundRadio) roundRadio.checked = true;
    }

    document.getElementById('host-start-wrap').classList.toggle('hidden', !isHost);
    document.getElementById('guest-waiting').classList.toggle('hidden', isHost);

    const btnStart = document.getElementById('btn-start');
    btnStart.disabled = count < 3;

    const listEl = document.getElementById('lobby-players');
    listEl.innerHTML = '';
    playerArr.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'player-item';
      const isMe    = p.id === PLAYER_ID;
      const isHost2 = p.id === room.hostId;
      const avatarSvg = getSafeAvatarSvg(p.avatar);
      const pts = p.score || 0;

      item.innerHTML = `
        <div class="avatar-bubble">${avatarSvg}</div>
        <div class="player-info">
          <div class="player-name">
            ${esc(p.name)}
            ${isMe    ? '<span class="me-badge">You</span>'   : ''}
            ${isHost2 ? '<span class="host-badge">Host</span>' : ''}
          </div>
          <div class="player-meta">${p.isOnline ? '● Online' : '○ Away'} · Player #${i + 1}</div>
        </div>
        <div class="player-actions">
          ${pts > 0 ? `<span class="player-score-pill">${pts} pts</span>` : ''}
          ${isHost && !isMe ? `<button class="kick-btn" data-id="${p.id}" data-name="${esc(p.name)}" title="Remove">✕</button>` : ''}
        </div>`;
      listEl.appendChild(item);
    });

    listEl.querySelectorAll('.kick-btn').forEach(btn => {
      btn.addEventListener('click', () => openKickModal(btn.dataset.id, btn.dataset.name));
    });
  }

  // ──────────────────────────────────────────────────────────
  // 2. GAME ARENA (Word Hold-to-Reveal + Turn Clues)
  // ──────────────────────────────────────────────────────────
  async function renderArena(room) {
    try {
      showScreen('arena');

      // Fetch secret word & role (always freshly checked per round)
      await fetchMyWordAndRole();

      // Round badge
      const gameNumber  = room.round || 1;
      const roundNumber = room.clueRound || 1;
      const totalRounds = room.totalClueRounds || TOTAL_DEFAULT_ROUNDS;
      document.getElementById('arena-round-badge').textContent = `Game #${gameNumber} · Clue ${roundNumber}/${totalRounds}`;

      // Host controls in arena
      const isHost = room.hostId === PLAYER_ID;
      document.getElementById('btn-host-force-vote').classList.toggle('hidden', !isHost);
      document.getElementById('btn-host-skip-turn').classList.toggle('hidden', !isHost);

      const players = room.players || {};

      // Setup Turn Order Stepper
      const rawOrder = room.turnOrder || [];
      let order = Array.isArray(rawOrder) ? [...rawOrder] : Object.values(rawOrder);

      if (!order || order.length === 0) {
        order = Object.keys(players).filter(k => players[k] && players[k].name);
      }

      const currentTurnIndex = Number(room.currentTurnIndex || 0) % (order.length || 1);
      const currentTurnPlayerId = order[currentTurnIndex];

      const turnProgressEl = document.getElementById('turn-progress-label');
      if (turnProgressEl) turnProgressEl.textContent = `${currentTurnIndex + 1} / ${order.length}`;

      const stripEl = document.getElementById('turn-players-strip');
      stripEl.innerHTML = '';

      let activeChipEl = null;
      order.forEach((pid, idx) => {
        const p = players[pid];
        if (!p) return;
        const chip = document.createElement('div');
        const isCurrentTurn = pid === currentTurnPlayerId;
        const isPastTurn    = idx < currentTurnIndex;
        const avatarSvg     = getSafeAvatarSvg(p.avatar);

        chip.className = 'turn-chip' +
          (isCurrentTurn ? ' active-turn' : '') +
          (isPastTurn ? ' completed-turn' : '');

        chip.innerHTML = `
          <span class="avatar-bubble" style="width:22px;height:22px;display:inline-flex">${avatarSvg}</span>
          <span>${isPastTurn ? '✓ ' : '#' + (idx + 1) + ' '}<strong>${esc(p.name)}</strong>${pid === PLAYER_ID ? ' (You)' : ''}</span>
        `;
        stripEl.appendChild(chip);
        if (isCurrentTurn) activeChipEl = chip;
      });

      if (activeChipEl && typeof activeChipEl.scrollIntoView === 'function') {
        try {
          activeChipEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } catch (e) {}
      }

      // Render Clues in Chat with Round Dividers & Player Avatars
      const chatEl = document.getElementById('clue-chat-messages');
      const rawClues = room.clues || [];
      const clues = Array.isArray(rawClues) ? rawClues : Object.values(rawClues);
      if (clues.length === 0) {
        chatEl.innerHTML = `<div class="chat-empty">Clue Round ${roundNumber} starting. Drop a short clue about your secret word!</div>`;
      } else {
        chatEl.innerHTML = '';
        let lastClueRound = null;
        clues.forEach(c => {
          if (c.round && c.round !== lastClueRound) {
            const divider = document.createElement('div');
            divider.className = 'chat-round-divider';
            divider.textContent = `Clue Round ${c.round}`;
            chatEl.appendChild(divider);
            lastClueRound = c.round;
          }

          const bubble = document.createElement('div');
          const isMine = c.playerId === PLAYER_ID;
          const senderPlayer = players[c.playerId] || {};
          const senderAvatar = c.avatar || senderPlayer.avatar || 'fox';
          const avatarSvg = getSafeAvatarSvg(senderAvatar);

          bubble.className = 'clue-bubble ' + (isMine ? 'mine' : 'theirs');
          bubble.innerHTML = `
            <div class="clue-sender-meta ${isMine ? 'justify-end' : ''}">
              <div class="avatar-bubble" style="width:18px;height:18px;display:inline-flex">${avatarSvg}</div>
              <span class="font-bold">${esc(c.playerName)}</span>
            </div>
            <div class="clue-text">${esc(c.text)}</div>
          `;
          chatEl.appendChild(bubble);
        });
        chatEl.scrollTop = chatEl.scrollHeight;
      }

      // Live typing indicator with Avatar & 3-dot animation
      const typingBar = document.getElementById('typing-indicator-bar');
      const typingPlayerId = room.typingPlayerId;
      if (typingPlayerId && typingPlayerId !== PLAYER_ID && players[typingPlayerId]) {
        typingBar.classList.remove('hidden');
        const typingAv = document.getElementById('typing-avatar');
        if (typingAv) typingAv.innerHTML = getSafeAvatarSvg(players[typingPlayerId].avatar);
        document.getElementById('typing-player-name').textContent = `${players[typingPlayerId].name} is typing a clue...`;
      } else {
        typingBar.classList.add('hidden');
      }

      // Turn banner & input state
      const isMyTurn = (currentTurnPlayerId === PLAYER_ID);
      if (isMyTurn && !wasMyTurn) {
        playTurnChime();
      }
      wasMyTurn = isMyTurn;

      const clueInput = document.getElementById('clue-input');
      const sendBtn   = document.getElementById('btn-send-clue');
      const statusBanner = document.getElementById('turn-status-banner');

      if (isMyTurn) {
        statusBanner.innerHTML = `<span style="color:var(--accent);font-weight:700">👉 YOUR TURN!</span>`;
        clueInput.disabled = false;
        clueInput.readOnly = false;
        clueInput.placeholder = "Type your clue and hit Enter...";
        sendBtn.disabled = false;
        sendBtn.classList.remove('disabled');
      } else {
        const activeName = players[currentTurnPlayerId]?.name || 'next player';
        statusBanner.innerHTML = `<span>⏳ <strong>${esc(activeName)}</strong>'s turn</span>`;
        clueInput.disabled = true;
        clueInput.readOnly = true;
        clueInput.placeholder = `Waiting for ${activeName}...`;
        sendBtn.disabled = true;
        sendBtn.classList.add('disabled');
      }
    } catch (renderErr) {
      console.error('Error in renderArena:', renderErr);
    }
  }

  // ──────────────────────────────────────────────────────────
  // FETCH WORD & ROLE (Clean Secret Card per Round)
  // ──────────────────────────────────────────────────────────
  async function fetchMyWordAndRole() {
    const currentRound = currentRoom?.round || 1;
    if (cachedWordRound === currentRound && myWord !== null && myRole !== null) return;

    const wordSnap = await dbGet(roomPath('words/' + PLAYER_ID));
    const roleSnap = await dbGet(roomPath('roles/' + PLAYER_ID));
    myWord = wordSnap.val();
    myRole = roleSnap.val();
    cachedWordRound = currentRound;

    const wordTextEl = document.getElementById('arena-word-text');
    const wordEnEl   = document.getElementById('arena-word-en');
    const roleTag    = document.getElementById('arena-role-tag');
    const revealedTag = document.getElementById('arena-revealed-tag');

    if (roleTag) {
      roleTag.className = 'role-badge-tag hidden';
      roleTag.textContent = '';
    }

    const currentMode = currentRoom?.imposterMode || 'similar';

    if (currentMode === 'blind') {
      if (myRole === 'imposter') {
        if (revealedTag) revealedTag.textContent = 'YOUR ROLE';
        if (wordTextEl) {
          wordTextEl.textContent = 'IMPOSTER';
          wordTextEl.style.color = 'var(--danger)';
        }
        if (wordEnEl) wordEnEl.textContent = 'You have NO word! Blend in and guess.';
      } else {
        if (revealedTag) revealedTag.textContent = 'YOUR SECRET WORD';
        if (wordTextEl) {
          wordTextEl.textContent = myWord || '–';
          wordTextEl.style.color = 'var(--text)';
        }
        if (wordEnEl) wordEnEl.textContent = '';
      }
    } else {
      // SIMILAR WORD MODE:
      // Roles are completely hidden so nobody knows who has which word!
      if (revealedTag) revealedTag.textContent = 'YOUR SECRET WORD';
      if (wordTextEl) {
        wordTextEl.textContent = myWord || '–';
        wordTextEl.style.color = 'var(--text)';
      }
      if (wordEnEl) wordEnEl.textContent = '';
    }
  }

  // ──────────────────────────────────────────────────────────
  // 3. VOTING
  // ──────────────────────────────────────────────────────────
  function renderVoting(room) {
    showScreen('voting');

    const players   = room.players || {};
    const playerArr = objectToArray(players);
    const votes     = room.votes  || {};
    const myVote    = votes[PLAYER_ID];

    if (myVote) selectedVote = myVote;

    // Clue Summary
    const clueSummaryEl = document.getElementById('voting-clues-summary');
    const rawClues = room.clues || [];
    const clues = Array.isArray(rawClues) ? rawClues : Object.values(rawClues);
    clueSummaryEl.innerHTML = clues.map(c => `
      <div class="voting-clue-row">
        <strong>${esc(c.playerName)}:</strong>
        <span style="flex:1">"${esc(c.text)}"</span>
        <span class="text-muted text-xs">R${c.round}</span>
      </div>
    `).join('') || '<div class="text-muted">No clues logged.</div>';

    // Vote List
    const listEl = document.getElementById('vote-list');
    listEl.innerHTML = '';

    playerArr.forEach(p => {
      const isMe = p.id === PLAYER_ID;
      const hasVoted = !!votes[p.id];
      const avatarSvg = getSafeAvatarSvg(p.avatar);

      const item = document.createElement('div');
      item.className = 'vote-item' +
        (isMe                    ? ' disabled'  : '') +
        (selectedVote === p.id   ? ' selected'  : '');
      item.dataset.targetId = p.id;

      item.innerHTML = `
        <div class="vote-radio"></div>
        <div class="avatar-bubble" style="width:34px;height:34px">${avatarSvg}</div>
        <div class="vote-name">${esc(p.name)}${isMe ? ' <span class="me-badge">You</span>' : ''}</div>
        ${hasVoted ? '<span class="vote-submitted">✓ voted</span>' : ''}`;

      if (!isMe && !myVote) {
        item.addEventListener('click', () => selectVote(p.id));
      }
      listEl.appendChild(item);
    });

    const voteCount  = Object.keys(votes).length;
    const totalCount = playerArr.length;
    const pct = totalCount > 0 ? Math.min(100, Math.round((voteCount / totalCount) * 100)) : 0;
    const progressEl = document.getElementById('vote-progress-fill');
    if (progressEl) progressEl.style.width = pct + '%';

    document.getElementById('vote-status').textContent = `${voteCount} / ${totalCount} voted`;

    const castBtn = document.getElementById('btn-cast-vote');
    castBtn.disabled = !selectedVote || !!myVote;
    castBtn.textContent = myVote ? '✓ Vote Submitted' : 'Submit Vote →';

    // Show extra round option
    document.getElementById('extra-round-wrap').classList.remove('hidden');

    // Host controls in voting
    const isHost = (room.hostId === PLAYER_ID);
    const forceTallyBtn = document.getElementById('btn-host-force-tally');
    if (forceTallyBtn) forceTallyBtn.classList.toggle('hidden', !isHost);

    // Host tallies when everyone voted
    if (isHost && voteCount >= totalCount && totalCount > 0 && !isTallying) {
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

  // ──────────────────────────────────────────────────────────
  // 4. RESULTS
  // ──────────────────────────────────────────────────────────
  function renderResults(room) {
    showScreen('results');

    const results = room.results || {};
    const players = room.players || {};
    const roles   = room.roles || {};
    const votes   = room.votes || {};

    const roundBadgeEl = document.getElementById('results-round-badge');
    if (roundBadgeEl) roundBadgeEl.textContent = `Game #${room.round || 1} Results`;

    const elim    = players[results.eliminatedId] || {};
    const revCard = document.getElementById('reveal-card');

    if (results.isTie) {
      revCard.className = 'reveal-card not-imposter';
      document.getElementById('reveal-name').textContent = 'Tie Vote (No Elimination)';
      document.getElementById('reveal-verdict').textContent = '🕵️ Imposter escaped undetected!';
    } else if (results.wasImposter) {
      revCard.className = 'reveal-card is-imposter';
      document.getElementById('reveal-name').textContent = elim.name || 'Imposter';
      document.getElementById('reveal-verdict').textContent = '🕵️ Was Caught! (Imposter eliminated)';
    } else {
      revCard.className = 'reveal-card not-imposter';
      document.getElementById('reveal-name').textContent = elim.name || 'Innocent';
      document.getElementById('reveal-verdict').textContent = '✅ Was NOT the Imposter (Innocent eliminated)';
    }

    // Word Comparison (supports library words & custom host words)
    const pair = results.wordId && results.wordId !== 'custom' ? getWordById(results.wordId) : null;
    const mainWordDisplay = results.mainWord || pair?.word || room.currentWordText || '–';
    const imposterWordDisplay = results.similarWord || pair?.similarWord || '';

    document.getElementById('result-main-word').textContent = mainWordDisplay;
    if (room.imposterMode === 'similar' && imposterWordDisplay) {
      document.getElementById('result-imposter-word').textContent = imposterWordDisplay;
    } else {
      document.getElementById('result-imposter-word').innerHTML = `<em>No Word (Blind Imposter)</em>`;
    }

    // Vote Breakdown ("Who Voted For Whom")
    const breakdownEl = document.getElementById('vote-breakdown-list');
    if (breakdownEl) {
      const voterEntries = Object.entries(votes);
      if (voterEntries.length === 0) {
        breakdownEl.innerHTML = '<div class="text-xs text-muted">No votes recorded.</div>';
      } else {
        breakdownEl.innerHTML = voterEntries.map(([voterId, targetId]) => {
          const voter  = players[voterId] || { name: 'Player' };
          const target = players[targetId] || { name: 'Player' };
          const hitImposter = roles[targetId] === 'imposter';
          return `
            <div class="vote-breakdown-row">
              <div class="flex items-center gap-2">
                <div class="avatar-bubble" style="width:22px;height:22px">${getSafeAvatarSvg(voter.avatar)}</div>
                <span><strong>${esc(voter.name)}</strong>${roles[voterId] === 'imposter' ? ' 🕵️' : ''}</span>
              </div>
              <span class="vote-breakdown-arrow">voted →</span>
              <div class="flex items-center gap-2">
                <span><strong>${esc(target.name)}</strong>${hitImposter ? ' 🎯' : ''}</span>
                <div class="avatar-bubble" style="width:22px;height:22px">${getSafeAvatarSvg(target.avatar)}</div>
              </div>
            </div>`;
        }).join('');
      }
    }

    const scoreChanges = results.scoreChanges || {};
    const scListEl     = document.getElementById('score-changes-list');
    scListEl.innerHTML = '';
    objectToArray(players).forEach(p => {
      const delta  = scoreChanges[p.id] || 0;
      const isImposter = (roles[p.id] === 'imposter');
      const playerVote = votes[p.id];
      const votedForImposter = playerVote && (roles[playerVote] === 'imposter') && !isImposter;

      let reason = '';
      if (delta > 0) {
        if (isImposter) {
          reason = '🕵️ Imposter survived undetected (+3)';
        } else if (votedForImposter) {
          reason = '✓ Correctly voted for imposter (+2)';
        }
      } else {
        if (isImposter && results.wasImposter) {
          reason = 'Caught by players (0)';
        } else {
          reason = 'Voted wrong (0)';
        }
      }

      const item = document.createElement('div');
      item.className = 'score-change-item';
      item.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="avatar-bubble" style="width:28px;height:28px">${getSafeAvatarSvg(p.avatar)}</div>
          <div class="score-change-name">${esc(p.name)}${isImposter ? ' <span class="badge badge-danger" style="padding:1px 6px;font-size:.65rem">Imposter</span>' : ''}</div>
        </div>
        <div>
          <div class="score-change-delta ${delta > 0 ? 'positive' : 'zero'}">${delta > 0 ? '+' + delta : '0'}</div>
          <div class="score-change-reason">${reason}</div>
        </div>`;
      scListEl.appendChild(item);
    });

    renderLeaderboard(players, 'leaderboard-list');

    const isHost = room.hostId === PLAYER_ID;
    document.getElementById('host-result-controls').classList.toggle('hidden', !isHost);
    document.getElementById('guest-result-waiting').classList.toggle('hidden', isHost);
  }

  // ──────────────────────────────────────────────────────────
  // 5. GAME OVER
  // ──────────────────────────────────────────────────────────
  function renderEnded(room) {
    showScreen('ended');
    renderLeaderboard(room.players || {}, 'final-leaderboard');
  }

  // ──────────────────────────────────────────────────────────
  // ACTIONS: START GAME & TURN FLOW
  // ──────────────────────────────────────────────────────────
  async function startGame() {
    if (!currentRoom || currentRoom.hostId !== PLAYER_ID) return;
    const players   = currentRoom.players || {};
    const playerArr = objectToArray(players);
    if (playerArr.length < 3) {
      showToast('Need at least 3 active players to start!', 'warning');
      return;
    }

    // Read Host Choices
    const catSelect = document.getElementById('host-category-select');
    const selectedCategory = catSelect ? catSelect.value : 'ALL';

    const modeRadio = document.querySelector('input[name="imposter-mode"]:checked');
    const imposterMode = modeRadio ? modeRadio.value : (currentRoom.imposterMode || 'similar');

    const roundsRadio = document.querySelector('input[name="clue-rounds"]:checked');
    const totalClueRounds = roundsRadio ? Number(roundsRadio.value) : (currentRoom.totalClueRounds || TOTAL_DEFAULT_ROUNDS);

    // Optional Custom Word check
    const customMainEl    = document.getElementById('custom-main-word');
    const customSimilarEl = document.getElementById('custom-similar-word');
    const customMain      = customMainEl ? customMainEl.value.trim() : '';
    const customSimilar   = customSimilarEl ? customSimilarEl.value.trim() : '';

    const rawUsed = currentRoom.usedWordIds || [];
    const usedWordIds = Array.isArray(rawUsed) ? rawUsed : Object.values(rawUsed);
    let pickedWordObj;
    let updatedUsedWordIds = [...usedWordIds];

    if (customMain) {
      pickedWordObj = {
        id: 'custom',
        word: customMain,
        similarWord: customSimilar || customMain
      };
      if (customMainEl) customMainEl.value = '';
      if (customSimilarEl) customSimilarEl.value = '';
    } else {
      pickedWordObj = pickNextWordWithUsed(selectedCategory, usedWordIds);
      updatedUsedWordIds.push(pickedWordObj.id);
    }

    const round = (currentRoom.round || 0) + 1;

    // Imposter calculation (strictly 1 imposter for small groups < 8)
    const imposterCount = playerArr.length >= 8 ? 2 : 1;
    const shuffled      = shuffleArr([...playerArr]);
    const imposters     = shuffled.slice(0, imposterCount).map(p => p.id);

    // Freshly shuffled turn order per round
    const turnOrder = shuffleArr(playerArr.map(p => p.id));

    const rolesUpdate = {};
    const wordsUpdate = {};
    playerArr.forEach(p => {
      const isImposter = imposters.includes(p.id);
      rolesUpdate[p.id] = isImposter ? 'imposter' : 'player';

      if (isImposter) {
        if (imposterMode === 'similar') {
          wordsUpdate[p.id] = pickedWordObj.similarWord || pickedWordObj.word;
        } else {
          wordsUpdate[p.id] = "YOU ARE THE IMPOSTER";
        }
      } else {
        wordsUpdate[p.id] = pickedWordObj.word;
      }
    });

    myWord = null;
    myRole = null;
    selectedVote = null;
    cachedWordRound = null;
    wasMyTurn = false;
    isTallying = false;

    await dbSet(roomPath('roles'), rolesUpdate);
    await dbSet(roomPath('words'), wordsUpdate);
    await dbSet(roomPath('votes'), null);
    await dbSet(roomPath('clues'), []);
    await dbSet(roomPath('results'), null);

    await dbUpdate(roomPath(), {
      state:              'arena',
      round,
      imposterMode,
      usedWordIds:        updatedUsedWordIds,
      clueRound:          1,
      totalClueRounds,
      turnOrder,
      currentTurnIndex:   0,
      currentWordId:      pickedWordObj.id,
      currentWordText:    pickedWordObj.word,
      currentSimilarText: pickedWordObj.similarWord || '',
      typingPlayerId:     null,
    });
  }

  async function sendClue(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('clue-input');
    const text  = input.value.trim();
    if (!text) return;

    const rawOrder = currentRoom.turnOrder || [];
    let order = Array.isArray(rawOrder) ? rawOrder : Object.values(rawOrder);
    if (!order || order.length === 0) {
      order = Object.keys(currentRoom.players || {});
    }

    const currentIndex = Number(currentRoom.currentTurnIndex || 0) % (order.length || 1);

    if (order[currentIndex] !== PLAYER_ID) {
      showToast('Wait! It is not your turn yet.', 'warning');
      return;
    }

    input.value = '';
    input.disabled = true;
    updateCharCounter();

    // Clear typing status
    await dbSet(roomPath('typingPlayerId'), null);

    const clueItem = {
      playerId:   PLAYER_ID,
      playerName: currentRoom.players[PLAYER_ID]?.name || 'Player',
      avatar:     currentRoom.players[PLAYER_ID]?.avatar || 'fox',
      text,
      round:      currentRoom.clueRound || 1,
      timestamp:  Date.now(),
    };

    const rawClues = currentRoom.clues || [];
    const clues = Array.isArray(rawClues) ? [...rawClues] : Object.values(rawClues);
    clues.push(clueItem);

    // Advance turn
    let nextIndex = currentIndex + 1;
    let nextClueRound = currentRoom.clueRound || 1;
    let nextState = 'arena';

    if (nextIndex >= order.length) {
      if (nextClueRound < (currentRoom.totalClueRounds || TOTAL_DEFAULT_ROUNDS)) {
        nextClueRound++;
        nextIndex = 0;
      } else {
        nextState = 'voting';
      }
    }

    await dbUpdate(roomPath(), {
      clues,
      currentTurnIndex: nextIndex,
      clueRound:        nextClueRound,
      state:            nextState,
      typingPlayerId:   null,
    });
  }

  // Host skips stuck turn
  async function hostSkipTurn() {
    if (!currentRoom || currentRoom.hostId !== PLAYER_ID) return;
    const rawOrder = currentRoom.turnOrder || [];
    const order = Array.isArray(rawOrder) ? rawOrder : Object.values(rawOrder);
    const currentIndex = Number(currentRoom.currentTurnIndex || 0);

    let nextIndex = currentIndex + 1;
    let nextClueRound = currentRoom.clueRound || 1;
    let nextState = 'arena';

    if (nextIndex >= order.length) {
      if (nextClueRound < (currentRoom.totalClueRounds || TOTAL_DEFAULT_ROUNDS)) {
        nextClueRound++;
        nextIndex = 0;
      } else {
        nextState = 'voting';
      }
    }

    showToast('Skipped turn to next player', 'info');
    await dbUpdate(roomPath(), {
      currentTurnIndex: nextIndex,
      clueRound:        nextClueRound,
      state:            nextState,
      typingPlayerId:   null,
    });
  }

  async function backToLobby() {
    if (!currentRoom) return;
    myWord = null;
    myRole = null;
    selectedVote = null;
    cachedWordRound = null;
    await dbUpdate(roomPath(), {
      state: 'lobby',
      votes: null,
      clues: [],
      results: null,
      currentTurnIndex: 0,
      clueRound: 1,
      typingPlayerId: null
    });
  }

  async function leaveRoom() {
    if (confirm('Exit to the home page? You can rejoin anytime with the room code.')) {
      if (ROOM_CODE && PLAYER_ID) {
        try {
          await dbSet(roomPath(`players/${PLAYER_ID}/isOnline`), false);
        } catch (e) {}
      }
      window.location.href = 'index.html';
    }
  }

  function updateCharCounter() {
    const input = document.getElementById('clue-input');
    const counter = document.getElementById('clue-char-count');
    if (input && counter) {
      counter.textContent = `${input.value.length}/60`;
    }
  }

  // Live typing broadcaster
  function onClueInputTyping() {
    updateCharCounter();
    clearTimeout(typingTimeout);
    dbSet(roomPath('typingPlayerId'), PLAYER_ID);
    typingTimeout = setTimeout(() => {
      dbSet(roomPath('typingPlayerId'), null);
    }, 2500);
  }

  // Request Extra Clue Round (if tied / unsure)
  async function requestExtraRound() {
    if (!currentRoom) return;
    const currentTotal = currentRoom.totalClueRounds || TOTAL_DEFAULT_ROUNDS;
    const newTotal = currentTotal + 1;

    showToast(`Adding Extra Clue Round ${newTotal}!`, 'success');

    await dbUpdate(roomPath(), {
      state:            'arena',
      clueRound:        newTotal,
      totalClueRounds:  newTotal,
      currentTurnIndex: 0,
      votes:            null,
    });
  }

  async function forceVote() {
    if (!currentRoom || currentRoom.hostId !== PLAYER_ID) return;
    await dbUpdate(roomPath(), { state: 'voting' });
  }

  async function castVote() {
    if (!selectedVote) return;
    await dbSet(roomPath('votes/' + PLAYER_ID), selectedVote);
    document.getElementById('btn-cast-vote').textContent = '✓ Vote Submitted';
    document.getElementById('btn-cast-vote').disabled    = true;
  }

  async function tallyVotes(room) {
    if (isTallying) return;
    isTallying = true;

    try {
      const votes   = room.votes   || {};
      const players = room.players || {};
      const roles   = room.roles   || {};

      const tally = {};
      Object.values(votes).forEach(targetId => {
        tally[targetId] = (tally[targetId] || 0) + 1;
      });

      const sortedVotes = Object.entries(tally).sort((a, b) => b[1] - a[1]);
      const topVote = sortedVotes[0];
      const secondVote = sortedVotes[1];

      const isTie = !topVote || (topVote && secondVote && (topVote[1] === secondVote[1]));

      const eliminatedId = isTie ? null : topVote?.[0];
      const wasImposter  = eliminatedId ? (roles[eliminatedId] === 'imposter') : false;

      const scoreChanges = {};
      const updates      = {};

      Object.keys(players).forEach(pid => { scoreChanges[pid] = 0; });

      // 1. Any regular player who voted for the REAL imposter gets +2 points
      Object.entries(votes).forEach(([voterId, targetId]) => {
        const isVoterRegular = roles[voterId] !== 'imposter';
        const isTargetImposter = roles[targetId] === 'imposter';
        if (isVoterRegular && isTargetImposter) {
          scoreChanges[voterId] = (scoreChanges[voterId] || 0) + 2;
        }
      });

      // 2. If the imposter survived, imposter gets +3 points
      if (!wasImposter) {
        Object.entries(roles).forEach(([pid, role]) => {
          if (role === 'imposter') {
            scoreChanges[pid] = (scoreChanges[pid] || 0) + 3;
          }
        });
      }

      Object.keys(players).forEach(pid => {
        updates[`players/${pid}/score`] =
          (players[pid].score || 0) + (scoreChanges[pid] || 0);
      });

      updates['results'] = {
        eliminatedId,
        wasImposter,
        wordId:       room.currentWordId,
        mainWord:     room.currentWordText || '',
        similarWord:  room.currentSimilarText || '',
        scoreChanges,
        votes:        tally,
        isTie,
      };
      updates['state'] = 'results';

      await dbUpdate(roomPath(), updates);
    } catch (err) {
      isTallying = false;
      console.error('Error tallying votes:', err);
    }
  }

  async function nextRound() {
    if (!currentRoom || currentRoom.hostId !== PLAYER_ID) return;
    myWord = null;
    myRole = null;
    selectedVote = null;
    cachedWordRound = null;
    await dbUpdate(roomPath(), {
      state: 'lobby',
      votes: null,
      clues: [],
      results: null,
      currentTurnIndex: 0,
      clueRound: 1,
      typingPlayerId: null
    });
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

  // ──────────────────────────────────────────────────────────
  // 🔒 SECURE HOLD-TO-REVEAL WORD LOGIC (Touch, Mouse, Spacebar)
  // ──────────────────────────────────────────────────────────
  function setupHoldToReveal() {
    const card = document.getElementById('hold-word-card');
    if (!card) return;
    const hiddenEl = document.getElementById('word-peek-hidden');
    const shownEl  = document.getElementById('word-peek-shown');

    function onHoldStart(e) {
      if (e && e.cancelable) e.preventDefault();
      card.classList.add('pressing');
      hiddenEl.classList.add('hidden');
      shownEl.classList.remove('hidden');
    }

    function onHoldEnd() {
      card.classList.remove('pressing');
      shownEl.classList.add('hidden');
      hiddenEl.classList.remove('hidden');
    }

    card.addEventListener('touchstart', onHoldStart, { passive: false });
    card.addEventListener('touchend', onHoldEnd);
    card.addEventListener('touchcancel', onHoldEnd);

    card.addEventListener('mousedown', onHoldStart);
    card.addEventListener('mouseup', onHoldEnd);
    card.addEventListener('mouseleave', onHoldEnd);

    // Spacebar hold-to-peek when in Arena & not typing in an input
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.repeat) {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;
        const arenaActive = document.getElementById('screen-arena')?.classList.contains('active');
        if (arenaActive) {
          e.preventDefault();
          onHoldStart();
        }
      }
    });
    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;
        onHoldEnd();
      }
    });
  }

  // ──────────────────────────────────────────────────────────
  // STATIC LISTENERS
  // ──────────────────────────────────────────────────────────
  function attachStaticListeners() {
    setupHoldToReveal();

    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) soundBtn.addEventListener('click', toggleSound);

    const rulesBtn = document.getElementById('btn-how-to-play');
    if (rulesBtn) rulesBtn.addEventListener('click', () => document.getElementById('rules-modal')?.classList.remove('hidden'));

    const rulesClose = document.getElementById('rules-close');
    if (rulesClose) rulesClose.addEventListener('click', () => document.getElementById('rules-modal')?.classList.add('hidden'));

    const rulesGotIt = document.getElementById('rules-got-it');
    if (rulesGotIt) rulesGotIt.addEventListener('click', () => document.getElementById('rules-modal')?.classList.add('hidden'));

    const rulesModal = document.getElementById('rules-modal');
    if (rulesModal) rulesModal.addEventListener('click', (e) => {
      if (e.target === rulesModal) rulesModal.classList.add('hidden');
    });

    const copyCodeBtn = document.getElementById('btn-copy-code');
    if (copyCodeBtn) copyCodeBtn.addEventListener('click', () => {
      copyTextToClipboard(ROOM_CODE).then(() => showToast(`Copied code: ${ROOM_CODE}`, 'success'));
    });

    const shareBtn = document.getElementById('btn-share');
    if (shareBtn) shareBtn.addEventListener('click', shareRoom);

    const leaveBtn = document.getElementById('btn-leave-room');
    if (leaveBtn) leaveBtn.addEventListener('click', leaveRoom);

    const startBtn = document.getElementById('btn-start');
    if (startBtn) startBtn.addEventListener('click', startGame);

    // Custom Word Toggle
    const customToggleBtn = document.getElementById('btn-toggle-custom-word');
    if (customToggleBtn) {
      customToggleBtn.addEventListener('click', () => {
        const box = document.getElementById('custom-word-box');
        if (box) {
          box.classList.toggle('hidden');
          customToggleBtn.textContent = box.classList.contains('hidden')
            ? '✨ + Use Custom Word for This Round'
            : '✨ − Hide Custom Word';
        }
      });
    }

    // Imposter Mode & Clue Rounds Radios
    document.querySelectorAll('input[name="imposter-mode"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (currentRoom?.hostId === PLAYER_ID) {
          dbUpdate(roomPath(), { imposterMode: radio.value });
        }
      });
    });

    document.querySelectorAll('input[name="clue-rounds"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (currentRoom?.hostId === PLAYER_ID) {
          dbUpdate(roomPath(), { totalClueRounds: Number(radio.value) });
        }
      });
    });

    // Skip Turn & Back to Lobby
    const skipBtn = document.getElementById('btn-host-skip-turn');
    if (skipBtn) skipBtn.addEventListener('click', hostSkipTurn);

    const backLobbyBtn = document.getElementById('btn-arena-back-lobby');
    if (backLobbyBtn) backLobbyBtn.addEventListener('click', backToLobby);

    // Clue Form & Typing
    const clueForm = document.getElementById('clue-form');
    if (clueForm) clueForm.addEventListener('submit', sendClue);

    const clueInput = document.getElementById('clue-input');
    if (clueInput) clueInput.addEventListener('input', onClueInputTyping);

    // Force Vote & Extra Round
    const forceVoteBtn = document.getElementById('btn-host-force-vote');
    if (forceVoteBtn) forceVoteBtn.addEventListener('click', forceVote);

    const extraRoundBtn = document.getElementById('btn-request-extra-round');
    if (extraRoundBtn) extraRoundBtn.addEventListener('click', requestExtraRound);

    const forceTallyBtn = document.getElementById('btn-host-force-tally');
    if (forceTallyBtn) forceTallyBtn.addEventListener('click', () => {
      if (currentRoom) tallyVotes(currentRoom);
    });

    // Voting
    const castVoteBtn = document.getElementById('btn-cast-vote');
    if (castVoteBtn) castVoteBtn.addEventListener('click', castVote);

    // Results
    const nextRoundBtn = document.getElementById('btn-next-round');
    if (nextRoundBtn) nextRoundBtn.addEventListener('click', nextRound);

    const endGameBtn = document.getElementById('btn-end-game');
    if (endGameBtn) endGameBtn.addEventListener('click', endGame);

    // Kick modal
    const kickCancelBtn = document.getElementById('kick-cancel');
    if (kickCancelBtn) kickCancelBtn.addEventListener('click', closeKickModal);

    const kickConfirmBtn = document.getElementById('kick-confirm');
    if (kickConfirmBtn) {
      kickConfirmBtn.addEventListener('click', () => {
        if (kickTarget) kickPlayer(kickTarget);
        closeKickModal();
      });
    }

    const kickModal = document.getElementById('kick-modal');
    if (kickModal) {
      kickModal.addEventListener('click', e => {
        if (e.target === kickModal) closeKickModal();
      });
    }
  }

  // ──────────────────────────────────────────────────────────
  // UTILITIES
  // ──────────────────────────────────────────────────────────
  function openKickModal(id, name) {
    kickTarget = id;
    document.getElementById('kick-modal-name').textContent = `Remove "${name}" from the room?`;
    document.getElementById('kick-modal').classList.remove('hidden');
  }

  function closeKickModal() {
    document.getElementById('kick-modal').classList.add('hidden');
    kickTarget = null;
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
      } catch (err) {}
      document.body.removeChild(textarea);
      return Promise.resolve();
    }
  }

  function shareRoom() {
    const baseUrl = window.location.origin + window.location.pathname.replace(/game\.html.*$/, '');
    const url = baseUrl + 'index.html?room=' + ROOM_CODE;
    copyTextToClipboard(url).then(() => {
      showToast(`Invite link copied! Room: ${ROOM_CODE}`, 'success');
    });
    if (navigator.share) {
      navigator.share({ title: 'Sync Room — ' + ROOM_CODE, text: `Join my Sync Room! Code: ${ROOM_CODE}`, url }).catch(() => {});
    }
  }

  function renderLeaderboard(players, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const sorted = objectToArray(players).sort((a, b) => (b.score || 0) - (a.score || 0));
    const medals = ['gold', 'silver', 'bronze'];

    el.innerHTML = sorted.map((p, i) => {
      const rankClass = i < 3 ? medals[i] : '';
      const rankLabel = i < 3 ? ['🥇','🥈','🥉'][i] : (i + 1) + '.';
      const isMe      = p.id === PLAYER_ID;
      const avatarSvg = getSafeAvatarSvg(p.avatar);
      return `
        <div class="lb-item">
          <div class="lb-rank ${rankClass}">${rankLabel}</div>
          <div class="avatar-bubble" style="width:30px;height:30px">${avatarSvg}</div>
          <div class="lb-info">
            <div class="lb-name">${esc(p.name)}${isMe ? ' <span class="me-badge">You</span>' : ''}</div>
          </div>
          <div class="lb-score">${p.score || 0} pts</div>
        </div>`;
    }).join('');
  }

  function kicked() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('main-content').innerHTML = `
      <div class="kicked-screen animate-in" style="padding:40px 20px;text-align:center">
        <div style="font-size:3rem;margin-bottom:12px">👋</div>
        <h2>You've been removed</h2>
        <p class="text-sub">The host removed you from this room or the room was closed.</p>
        <a class="btn btn-primary mt-4" href="index.html">← Back to Home</a>
      </div>`;
  }

  function objectToArray(obj) {
    if (!obj) return [];
    return Object.entries(obj)
      .filter(([id, val]) => val && typeof val === 'object' && val.name && String(val.name).trim().length > 0)
      .map(([id, val]) => ({ id, ...val }));
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function shuffleArr(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function showToast(msg, type = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' toast--' + type : '');
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
