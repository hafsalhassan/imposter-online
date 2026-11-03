// ============================================================
//  game.js — Clue Chat, Hold-to-Reveal & Turn-based Imposter Game
// ============================================================
(function () {
  'use strict';

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
    // Universal SVG fallback
    return `<svg viewBox="0 0 100 100" fill="#6366F1"><circle cx="50" cy="50" r="48" fill="#EEF2FF"/><circle cx="50" cy="40" r="20" fill="#6366F1"/><ellipse cx="50" cy="80" rx="30" ry="20" fill="#6366F1"/></svg>`;
  }

  const TOTAL_DEFAULT_ROUNDS = 2; // 2 clue rounds before voting

  const urlParams = new URLSearchParams(window.location.search);
  const ROOM_CODE = urlParams.get('room');
  // First check URL param for PID (100% reliable across tabs & devices!)
  const PLAYER_ID = urlParams.get('pid') || getOrCreatePlayerId();

  let roomRef;
  let currentRoom   = null;
  let myWord        = null;
  let myRole        = null;
  let selectedVote  = null;
  let kickTarget    = null;
  let typingTimeout = null;

  if (!ROOM_CODE) { window.location.href = 'index.html'; return; }

  // Ensure PID is stored
  sessionStorage.setItem('syncroom_player_id', PLAYER_ID);

  document.getElementById('header-room-code').textContent = ROOM_CODE;
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
    roomRef.on('value', snap => {
      if (!snap.exists()) { kicked(); return; }
      currentRoom = snap.val();
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
      // Only keep online if player actually exists with a name!
      if (snap.exists() && snap.val()?.name) {
        const onlineRef = db.ref(roomPath('players/' + PLAYER_ID + '/isOnline'));
        onlineRef.set(true);
        onlineRef.onDisconnect().set(false);
      }
    });
  }

  // ── Setup Lobby Profile & Avatar Picker ───────────────────
  function setupLobbyAvatarPicker() {
    const container = document.getElementById('lobby-avatar-picker');
    if (!container || typeof ANIMAL_AVATARS === 'undefined') return;

    const myPlayer = currentRoom?.players?.[PLAYER_ID];
    const myCurrentAvatar = myPlayer?.avatar || localStorage.getItem('syncroom_avatar') || ANIMAL_AVATARS[0].id;

    // Pre-fill name input
    const nameInput = document.getElementById('lobby-edit-name-input');
    if (nameInput && myPlayer?.name && !nameInput.value) {
      nameInput.value = myPlayer.name;
    }

    container.innerHTML = '';
    ANIMAL_AVATARS.forEach(avatar => {
      const el = document.createElement('div');
      el.className = 'avatar-choice-item' + (avatar.id === myCurrentAvatar ? ' selected' : '');
      el.title = avatar.name;
      el.innerHTML = avatar.svg;
      el.addEventListener('click', async () => {
        document.querySelectorAll('#lobby-avatar-picker .avatar-choice-item').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        localStorage.setItem('syncroom_avatar', avatar.id);
        await dbUpdate(roomPath('players/' + PLAYER_ID), { avatar: avatar.id });
      });
      container.appendChild(el);
    });
  }

  async function saveEditedName() {
    const nameInput = document.getElementById('lobby-edit-name-input');
    const newName = nameInput.value.trim();
    if (!newName) {
      showToast('Name cannot be empty', 'warning');
      return;
    }
    localStorage.setItem('syncroom_name', newName);
    await dbUpdate(roomPath('players/' + PLAYER_ID), { name: newName });
    showToast('Name updated!', 'success');
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
    setupLobbyAvatarPicker();

    const players   = room.players || {};
    const playerArr = objectToArray(players);
    const isHost    = room.hostId === PLAYER_ID;
    const count     = playerArr.length;

    document.getElementById('lobby-player-count').textContent = count + ' joined';
    
    // Host exclusive controls
    const hostPanel = document.getElementById('host-exclusive-panel');
    if (hostPanel) hostPanel.classList.toggle('hidden', !isHost);

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
      const avatarSvg = getAvatarSvg(p.avatar);

      item.innerHTML = `
        <div class="avatar-bubble">${avatarSvg}</div>
        <div class="player-info">
          <div class="player-name">
            ${esc(p.name)}
            ${isMe   ? '<span class="me-badge">You</span>'   : ''}
            ${isHost2 ? '<span class="host-badge">Host</span>' : ''}
          </div>
          <div class="player-meta">${p.isOnline ? '● Online' : '○ Away'} · Order #${i + 1}</div>
        </div>
        <div class="player-actions">
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

      // Fetch secret word & role
      await fetchMyWordAndRole();

      // Round badge
      const roundNumber = room.clueRound || 1;
      const totalRounds = room.totalClueRounds || TOTAL_DEFAULT_ROUNDS;
      document.getElementById('arena-round-badge').textContent = `Round ${roundNumber} of ${totalRounds}`;

      // Host controls in arena
      const isHost = room.hostId === PLAYER_ID;
      document.getElementById('btn-host-force-vote').classList.toggle('hidden', !isHost);
      document.getElementById('btn-host-skip-turn').classList.toggle('hidden', !isHost);

      const players = room.players || {};

      // Setup Turn Order Strip
      const rawOrder = room.turnOrder || [];
      let order = Array.isArray(rawOrder) ? [...rawOrder] : Object.values(rawOrder);

      // Fallback: If turnOrder is missing or empty, build it from player keys
      if (!order || order.length === 0) {
        order = Object.keys(players).filter(k => players[k] && players[k].name);
      }

      const currentTurnIndex = Number(room.currentTurnIndex || 0) % (order.length || 1);
      const currentTurnPlayerId = order[currentTurnIndex];

      const stripEl = document.getElementById('turn-players-strip');
      stripEl.innerHTML = '';

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
          <span class="avatar-bubble" style="width:22px;height:22px;display:inline-block">${avatarSvg}</span>
          <span>#${idx + 1} <strong>${esc(p.name)}</strong>${pid === PLAYER_ID ? ' (You)' : ''}</span>
        `;
        stripEl.appendChild(chip);
      });

      // Render Clues in Chat
      const chatEl = document.getElementById('clue-chat-messages');
      const rawClues = room.clues || [];
      const clues = Array.isArray(rawClues) ? rawClues : Object.values(rawClues);
      if (clues.length === 0) {
        chatEl.innerHTML = `<div class="chat-empty">Round 1 beginning. Give a one-word or short clue about your secret word!</div>`;
      } else {
        chatEl.innerHTML = '';
        clues.forEach(c => {
          const bubble = document.createElement('div');
          const isMine = c.playerId === PLAYER_ID;
          bubble.className = 'clue-bubble ' + (isMine ? 'mine' : 'theirs');
          bubble.innerHTML = `
            <div class="clue-sender-meta">
              <span>${esc(c.playerName)}</span>
              <span>· Round ${c.round}</span>
            </div>
            <div class="clue-text">${esc(c.text)}</div>
          `;
          chatEl.appendChild(bubble);
        });
        chatEl.scrollTop = chatEl.scrollHeight;
      }

      // Live typing indicator
      const typingBar = document.getElementById('typing-indicator-bar');
      const typingPlayerId = room.typingPlayerId;
      if (typingPlayerId && typingPlayerId !== PLAYER_ID && players[typingPlayerId]) {
        typingBar.classList.remove('hidden');
        document.getElementById('typing-player-name').textContent = `${players[typingPlayerId].name} is typing a clue...`;
      } else {
        typingBar.classList.add('hidden');
      }

      // Turn banner & input state
      const isMyTurn = (currentTurnPlayerId === PLAYER_ID);
      const clueInput = document.getElementById('clue-input');
      const sendBtn   = document.getElementById('btn-send-clue');
      const statusBanner = document.getElementById('turn-status-banner');

      if (isMyTurn) {
        statusBanner.innerHTML = `<span style="color:var(--accent);font-weight:700">👉 YOUR TURN! Type your clue below:</span>`;
        clueInput.disabled = false;
        clueInput.readOnly = false;
        clueInput.placeholder = "Type your clue here and press Enter...";
        sendBtn.disabled = false;
        sendBtn.classList.remove('disabled');
      } else {
        const activeName = players[currentTurnPlayerId]?.name || 'next player';
        statusBanner.innerHTML = `<span>⏳ Waiting for <strong>${esc(activeName)}</strong> to type clue...</span>`;
        clueInput.disabled = true;
        clueInput.readOnly = true;
        clueInput.placeholder = `Waiting for ${activeName}'s clue...`;
        sendBtn.disabled = true;
        sendBtn.classList.add('disabled');
      }
    } catch (renderErr) {
      console.error('Error in renderArena:', renderErr);
    }
  }
  }

  // ──────────────────────────────────────────────────────────
  // FETCH WORD & ROLE (Clean Secret Card)
  // ──────────────────────────────────────────────────────────
  async function fetchMyWordAndRole() {
    if (myWord !== null) return;
    const wordSnap = await dbGet(roomPath('words/' + PLAYER_ID));
    const roleSnap = await dbGet(roomPath('roles/' + PLAYER_ID));
    myWord = wordSnap.val();
    myRole = roleSnap.val();

    const wordTextEl = document.getElementById('arena-word-text');
    const wordEnEl   = document.getElementById('arena-word-en');
    const roleTag    = document.getElementById('arena-role-tag');
    const revealedTag = document.getElementById('arena-revealed-tag');

    roleTag.className = 'role-badge-tag hidden';
    roleTag.textContent = '';

    if (myRole === 'imposter') {
      revealedTag.textContent = 'YOUR ROLE';
      wordTextEl.textContent = 'IMPOSTER';
      wordTextEl.style.color = 'var(--danger)';
      wordEnEl.textContent = 'You have NO word! Fake your clues & blend in.';
    } else {
      revealedTag.textContent = 'YOUR SECRET WORD';
      wordTextEl.textContent = myWord || '–';
      wordTextEl.style.color = 'var(--text)';
      wordEnEl.textContent = '';
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

    // Mini Clue Summary
    const clueSummaryEl = document.getElementById('voting-clues-summary');
    const clues = room.clues || [];
    clueSummaryEl.innerHTML = clues.map(c => `
      <div><strong>${esc(c.playerName)}:</strong> "${esc(c.text)}" <span style="color:var(--text-muted);font-size:.7rem">(R${c.round})</span></div>
    `).join('') || '<div class="text-muted">No clues logged.</div>';

    // Vote List
    const listEl = document.getElementById('vote-list');
    listEl.innerHTML = '';

    playerArr.forEach((p, i) => {
      const isMe = p.id === PLAYER_ID;
      const hasVoted = !!votes[p.id];
      const avatarSvg = getAvatarSvg(p.avatar);

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
    document.getElementById('vote-status').textContent = `${voteCount} / ${totalCount} voted`;

    const castBtn = document.getElementById('btn-cast-vote');
    castBtn.disabled = !selectedVote || !!myVote;
    if (myVote) castBtn.textContent = '✓ Vote Submitted';

    // Show extra round option for host or any player
    document.getElementById('extra-round-wrap').classList.remove('hidden');

    // Host tallies when everyone voted
    if (room.hostId === PLAYER_ID && voteCount >= totalCount && totalCount > 0) {
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

    const elim      = players[results.eliminatedId] || {};
    const revCard   = document.getElementById('reveal-card');
    revCard.className = 'reveal-card ' + (results.wasImposter ? 'is-imposter' : 'not-imposter');
    document.getElementById('reveal-name').textContent    = elim.name || 'No consensus';
    document.getElementById('reveal-verdict').textContent = results.wasImposter
      ? '🕵️ Was the Imposter!' : '✅ Was NOT the Imposter';

    const pair = results.wordId ? getWordById(results.wordId) : null;
    if (pair) {
      document.getElementById('result-main-word').innerHTML = pair.word;
      document.getElementById('result-imposter-word').innerHTML = `<em>No Word (Blind Imposter)</em>`;
    }

    const scoreChanges = results.scoreChanges || {};
    const scListEl     = document.getElementById('score-changes-list');
    scListEl.innerHTML = '';
    objectToArray(players).forEach(p => {
      const delta  = scoreChanges[p.id] || 0;
      const reason = delta > 0
        ? (results.wasImposter
            ? (results.eliminatedId === p.id ? '' : '✓ Voted for imposter (+2)')
            : (results.eliminatedId === p.id ? '🕵️ Imposter survived undetected (+3)' : ''))
        : '';
      const item = document.createElement('div');
      item.className = 'score-change-item';
      item.innerHTML = `
        <div class="score-change-name">${esc(p.name)}</div>
        <div>
          <div class="score-change-delta ${delta > 0 ? 'positive' : 'zero'}">${delta > 0 ? '+' + delta : '0'}</div>
          <div class="score-change-reason">${reason}</div>
        </div>`;
      scListEl.appendChild(item);
    });

    renderLeaderboard(players, 'leaderboard-list');

    document.getElementById('host-result-controls').classList.toggle('hidden', room.hostId !== PLAYER_ID);
    document.getElementById('guest-result-waiting').classList.toggle('hidden', room.hostId === PLAYER_ID);
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
    // Only include real active players with valid names
    const playerArr = objectToArray(players);
    if (playerArr.length < 3) {
      showToast('Need at least 3 active players to start!', 'warning');
      return;
    }

    // Read Host Choices
    const catSelect = document.getElementById('host-category-select');
    const selectedCategory = catSelect ? catSelect.value : 'ALL';

    const modeRadio = document.querySelector('input[name="imposter-mode"]:checked');
    const imposterMode = modeRadio ? modeRadio.value : 'similar'; // 'similar' or 'blind'

    // Pick Word using selected Category from new JSON format
    const pickedWordObj = pickNextWord(ROOM_CODE, selectedCategory);
    const round = (currentRoom.round || 0) + 1;

    // Imposter calculation
    const imposterCount = playerArr.length >= 10 ? 2 : 1;
    const shuffled      = shuffleArr([...playerArr]);
    const imposters     = shuffled.slice(0, imposterCount).map(p => p.id);

    // Turn order strictly from valid player IDs
    const turnOrder = playerArr.map(p => p.id);

    const rolesUpdate = {};
    const wordsUpdate = {};
    playerArr.forEach(p => {
      const isImposter = imposters.includes(p.id);
      rolesUpdate[p.id] = isImposter ? 'imposter' : 'player';

      if (isImposter) {
        wordsUpdate[p.id] = "YOU ARE THE IMPOSTER";
      } else {
        wordsUpdate[p.id] = pickedWordObj.word;
      }
    });

    myWord = null;
    myRole = null;
    selectedVote = null;

    await dbSet(roomPath('roles'), rolesUpdate);
    await dbSet(roomPath('words'), wordsUpdate);
    await dbSet(roomPath('votes'), null);
    await dbSet(roomPath('clues'), []);

    await dbUpdate(roomPath(), {
      state:            'arena',
      round,
      clueRound:        1,
      totalClueRounds:  TOTAL_DEFAULT_ROUNDS,
      turnOrder,
      currentTurnIndex: 0,
      currentWordId:    pickedWordObj.id,
      currentWordText:  pickedWordObj.word,
      typingPlayerId:   null,
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

    // Clear typing status
    await dbSet(roomPath('typingPlayerId'), null);

    const clueItem = {
      playerId:   PLAYER_ID,
      playerName: currentRoom.players[PLAYER_ID]?.name || 'Player',
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
      // Completed one full round of clues
      if (nextClueRound < (currentRoom.totalClueRounds || TOTAL_DEFAULT_ROUNDS)) {
        nextClueRound++;
        nextIndex = 0;
      } else {
        // All clue rounds finished -> Proceed to voting!
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
    await dbUpdate(roomPath(), { state: 'lobby' });
  }

  // Live typing broadcaster
  function onClueInputTyping() {
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

    // Check if there is a tie for the most votes
    const isTie = topVote && secondVote && (topVote[1] === secondVote[1]);

    const eliminatedId = isTie ? null : topVote?.[0];
    const wasImposter  = eliminatedId ? (roles[eliminatedId] === 'imposter') : false;

    const scoreChanges = {};
    const updates      = {};

    Object.keys(players).forEach(pid => { scoreChanges[pid] = 0; });

    if (wasImposter) {
      // Regular players who voted correctly get +2
      Object.entries(votes).forEach(([voterId, targetId]) => {
        if (targetId === eliminatedId && roles[voterId] !== 'imposter') {
          scoreChanges[voterId] = (scoreChanges[voterId] || 0) + 2;
        }
      });
    } else {
      // Imposter survived (or tie where imposter wasn't caught) -> Imposter gets +3
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
      scoreChanges,
      votes:        tally,
      isTie,
    };
    updates['state'] = 'results';

    await dbUpdate(roomPath(), updates);
  }

  async function nextRound() {
    if (!currentRoom || currentRoom.hostId !== PLAYER_ID) return;
    myWord = null;
    myRole = null;
    selectedVote = null;
    await dbUpdate(roomPath(), { state: 'lobby' });
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
  // 🔒 SECURE HOLD-TO-REVEAL WORD LOGIC
  // ──────────────────────────────────────────────────────────
  function setupHoldToReveal() {
    const card = document.getElementById('hold-word-card');
    const hiddenEl = document.getElementById('word-peek-hidden');
    const shownEl  = document.getElementById('word-peek-shown');

    function onHoldStart(e) {
      if (e.cancelable) e.preventDefault();
      card.classList.add('pressing');
      hiddenEl.classList.add('hidden');
      shownEl.classList.remove('hidden');
    }

    function onHoldEnd() {
      card.classList.remove('pressing');
      shownEl.classList.add('hidden');
      hiddenEl.classList.remove('hidden');
    }

    // Touch events for mobile
    card.addEventListener('touchstart', onHoldStart, { passive: false });
    card.addEventListener('touchend', onHoldEnd);
    card.addEventListener('touchcancel', onHoldEnd);

    // Mouse events for desktop
    card.addEventListener('mousedown', onHoldStart);
    card.addEventListener('mouseup', onHoldEnd);
    card.addEventListener('mouseleave', onHoldEnd);
  }

  // ──────────────────────────────────────────────────────────
  // STATIC LISTENERS
  // ──────────────────────────────────────────────────────────
  function attachStaticListeners() {
    setupHoldToReveal();

    document.getElementById('btn-share').addEventListener('click', shareRoom);

    document.getElementById('btn-start').addEventListener('click', startGame);

    // Save Name in Lobby
    const saveNameBtn = document.getElementById('btn-save-name');
    if (saveNameBtn) saveNameBtn.addEventListener('click', saveEditedName);

    // Skip Turn & Back to Lobby
    const skipBtn = document.getElementById('btn-host-skip-turn');
    if (skipBtn) skipBtn.addEventListener('click', hostSkipTurn);

    const backLobbyBtn = document.getElementById('btn-arena-back-lobby');
    if (backLobbyBtn) backLobbyBtn.addEventListener('click', backToLobby);

    // Clue Form & Typing
    document.getElementById('clue-form').addEventListener('submit', sendClue);
    document.getElementById('clue-input').addEventListener('input', onClueInputTyping);

    // Force Vote & Extra Round
    document.getElementById('btn-host-force-vote').addEventListener('click', forceVote);
    document.getElementById('btn-request-extra-round').addEventListener('click', requestExtraRound);

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

  function shareRoom() {
    const baseUrl = window.location.origin + window.location.pathname.replace('game.html','');
    const url = baseUrl + 'index.html?room=' + ROOM_CODE;
    if (navigator.share) {
      navigator.share({ title: 'Join Sync Room', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => showToast('Invite link copied!', 'success'));
    }
  }

  function renderLeaderboard(players, containerId) {
    const el      = document.getElementById(containerId);
    const sorted  = objectToArray(players).sort((a, b) => (b.score || 0) - (a.score || 0));
    const medals  = ['gold', 'silver', 'bronze'];

    el.innerHTML = sorted.map((p, i) => {
      const rankClass = i < 3 ? medals[i] : '';
      const rankLabel = i < 3 ? ['🥇','🥈','🥉'][i] : (i + 1) + '.';
      const isMe      = p.id === PLAYER_ID;
      const avatarSvg = getAvatarSvg(p.avatar);
      return `
        <div class="lb-item">
          <div class="lb-rank ${rankClass}">${rankLabel}</div>
          <div class="avatar-bubble" style="width:28px;height:28px;margin-right:6px">${avatarSvg}</div>
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

  function kicked() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('main-content').innerHTML = `
      <div class="kicked-screen animate-in" style="padding:40px 20px;text-align:center">
        <div style="font-size:3rem;margin-bottom:12px">👋</div>
        <h2>You've been removed</h2>
        <p class="text-sub">The host removed you from this room.</p>
        <a class="btn btn-primary mt-4" href="index.html">← Back to Home</a>
      </div>`;
  }

  function objectToArray(obj) {
    if (!obj) return [];
    // ONLY include real players who have a valid name! Exclude ghost accounts!
    return Object.entries(obj)
      .filter(([id, val]) => val && typeof val === 'object' && val.name && val.name.trim().length > 0)
      .map(([id, val]) => ({ id, ...val }));
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getOrCreatePlayerId() {
    let id = sessionStorage.getItem('syncroom_player_id');
    if (!id) {
      id = localStorage.getItem('syncroom_player_id');
    }
    if (!id) {
      id = 'p_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now().toString(36).slice(-4);
      sessionStorage.setItem('syncroom_player_id', id);
    }
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
