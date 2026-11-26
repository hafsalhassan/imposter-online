// ============================================================
//  room.js — Landing page logic: theme, rules, avatar, create / join rooms
// ============================================================

(function () {
  'use strict';

  // ── Theme Toggle ─────────────────────────────────────────────
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

  // ── Segmented Tabs (Create vs Join) ──────────────────────────
  function switchTab(mode) {
    const tabCreate   = document.getElementById('tab-create');
    const tabJoin     = document.getElementById('tab-join');
    const panelCreate = document.getElementById('panel-create');
    const panelJoin   = document.getElementById('panel-join');

    const isJoin = mode === 'join';
    tabCreate.classList.toggle('active', !isJoin);
    tabJoin.classList.toggle('active', isJoin);
    tabCreate.setAttribute('aria-selected', String(!isJoin));
    tabJoin.setAttribute('aria-selected', String(isJoin));

    panelCreate.classList.toggle('hidden', isJoin);
    panelJoin.classList.toggle('hidden', !isJoin);
  }

  // ── Init Animal Avatar Picker ────────────────────────────────
  function initAvatarPicker() {
    const container = document.getElementById('avatar-picker');
    const labelEl   = document.getElementById('selected-avatar-label');
    if (!container || typeof ANIMAL_AVATARS === 'undefined') return;

    let savedAvatar = localStorage.getItem('syncroom_avatar') || ANIMAL_AVATARS[0].id;
    const matched = ANIMAL_AVATARS.find(a => a.id === savedAvatar) || ANIMAL_AVATARS[0];
    savedAvatar = matched.id;

    document.getElementById('selected-avatar-id').value = savedAvatar;
    if (labelEl) labelEl.textContent = matched.name;

    container.innerHTML = '';
    ANIMAL_AVATARS.forEach(avatar => {
      const el = document.createElement('div');
      el.className = 'avatar-choice-item' + (avatar.id === savedAvatar ? ' selected' : '');
      el.title = avatar.name;
      el.innerHTML = avatar.svg;
      el.addEventListener('click', () => {
        document.querySelectorAll('.avatar-choice-item').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        document.getElementById('selected-avatar-id').value = avatar.id;
        if (labelEl) labelEl.textContent = avatar.name;
        try { localStorage.setItem('syncroom_avatar', avatar.id); } catch (e) {}
      });
      container.appendChild(el);
    });
  }

  // ── Helpers ──────────────────────────────────────────────────
  function genRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function getOrCreatePlayerId(roomCode) {
    if (roomCode) {
      const roomPid = sessionStorage.getItem('syncroom_pid_' + roomCode);
      if (roomPid) return roomPid;
    }
    let id = sessionStorage.getItem('syncroom_player_id');
    if (!id) {
      id = 'p_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
      sessionStorage.setItem('syncroom_player_id', id);
    }
    return id;
  }

  function showToast(msg, type = '') {
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' toast--' + type : '');
    el.textContent = msg;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  function setLoading(btn, loading) {
    if (loading) {
      btn.dataset.label = btn.innerHTML;
      btn.innerHTML = '<span class="spinner spinner--sm"></span>';
      btn.disabled = true;
    } else {
      btn.innerHTML = btn.dataset.label || btn.innerHTML;
      btn.disabled = false;
    }
  }

  // ── Recent rooms ─────────────────────────────────────────────
  function loadRecentRooms() {
    let list = [];
    try { list = JSON.parse(localStorage.getItem('syncroom_recent') || '[]'); } catch (e) {}
    const container = document.getElementById('recent-rooms');
    const listEl    = document.getElementById('recent-list');

    if (!list.length) return;
    container.classList.remove('hidden');
    listEl.innerHTML = '';

    list.slice(0, 3).forEach(({ code, name, ts }) => {
      const a = document.createElement('a');
      a.className = 'recent-item';
      a.href = '#';
      a.innerHTML = `
        <div>
          <div class="recent-code">${code}</div>
          <div class="recent-meta">As ${name} · ${timeAgo(ts)}</div>
        </div>
        <span class="recent-arrow">Join →</span>`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('player-name').value = name;
        document.getElementById('room-code-input').value = code;
        switchTab('join');
        document.getElementById('room-code-input').focus();
      });
      listEl.appendChild(a);
    });
  }

  function saveRecentRoom(code, name) {
    try {
      let list = JSON.parse(localStorage.getItem('syncroom_recent') || '[]');
      list = list.filter(r => r.code !== code);
      list.unshift({ code, name, ts: Date.now() });
      localStorage.setItem('syncroom_recent', JSON.stringify(list.slice(0, 5)));
    } catch (e) {}
  }

  function timeAgo(ts) {
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  // ── Validation ───────────────────────────────────────────────
  function validateName() {
    const name = document.getElementById('player-name').value.trim();
    const err  = document.getElementById('name-error');
    if (!name) {
      err.classList.add('show');
      document.getElementById('player-name').focus();
      return null;
    }
    err.classList.remove('show');
    return name;
  }

  // ── Create room ──────────────────────────────────────────────
  async function createRoom() {
    const name = validateName();
    if (!name) return;

    const btn      = document.getElementById('btn-create');
    const playerId = getOrCreatePlayerId();

    setLoading(btn, true);

    try {
      let code, ref, snap;
      let attempts = 0;
      do {
        code = genRoomCode();
        ref  = db.ref('rooms/' + code);
        snap = await ref.once('value');
        attempts++;
      } while (snap.exists() && attempts < 5);

      if (snap.exists()) {
        showToast('Could not create room. Try again.', 'danger');
        setLoading(btn, false);
        return;
      }

      const now = Date.now();
      await ref.set({
        hostId:          playerId,
        state:           'lobby',
        round:           0,
        imposterMode:    'similar',
        totalClueRounds: 2,
        currentWordId:   null,
        createdAt:       now,
      });

      const avatarId = document.getElementById('selected-avatar-id')?.value || 'fox';

      await db.ref('rooms/' + code + '/players/' + playerId).set({
        name,
        avatar:   avatarId,
        score:    0,
        isOnline: true,
        joinedAt: now,
      });

      saveRecentRoom(code, name);
      try {
        localStorage.setItem('syncroom_name', name);
        localStorage.setItem('syncroom_avatar', avatarId);
      } catch (e) {}
      sessionStorage.setItem('syncroom_pid_' + code, playerId);
      sessionStorage.setItem('syncroom_player_id', playerId);
      window.location.href = 'game.html?room=' + code + '&pid=' + playerId;
    } catch (err) {
      console.error('Create room error:', err);
      showToast('Connection error. Please try again.', 'danger');
      setLoading(btn, false);
    }
  }

  // ── Join room ─────────────────────────────────────────────────
  async function joinRoom(codeOverride) {
    const name = validateName();
    if (!name) return;

    const rawCode = (codeOverride || document.getElementById('room-code-input').value).trim().toUpperCase();
    const roomErr = document.getElementById('room-error');

    if (rawCode.length !== 4) {
      roomErr.classList.add('show');
      roomErr.textContent = 'Please enter a 4-letter room code.';
      return;
    }

    const btn      = document.getElementById('btn-join');
    const playerId = getOrCreatePlayerId(rawCode);

    setLoading(btn, true);
    roomErr.classList.remove('show');

    try {
      const snap = await db.ref('rooms/' + rawCode).once('value');
      if (!snap.exists()) {
        roomErr.classList.add('show');
        roomErr.textContent = 'Room not found. Check the code.';
        setLoading(btn, false);
        return;
      }

      const room = snap.val();
      const existingPlayer = room.players && room.players[playerId];

      // Block brand-new players if game already started, but allow existing players to rejoin!
      if (room.state !== 'lobby' && !existingPlayer) {
        roomErr.classList.add('show');
        roomErr.textContent = 'This game is already in progress. Ask host to return to lobby.';
        setLoading(btn, false);
        return;
      }

      const avatarId = document.getElementById('selected-avatar-id')?.value || 'fox';
      const preservedScore = existingPlayer && typeof existingPlayer.score === 'number' ? existingPlayer.score : 0;

      await db.ref('rooms/' + rawCode + '/players/' + playerId).update({
        name,
        avatar:   avatarId,
        score:    preservedScore,
        isOnline: true,
        joinedAt: existingPlayer?.joinedAt || Date.now(),
      });

      saveRecentRoom(rawCode, name);
      try {
        localStorage.setItem('syncroom_name', name);
        localStorage.setItem('syncroom_avatar', avatarId);
      } catch (e) {}
      sessionStorage.setItem('syncroom_pid_' + rawCode, playerId);
      sessionStorage.setItem('syncroom_player_id', playerId);
      window.location.href = 'game.html?room=' + rawCode + '&pid=' + playerId;
    } catch (err) {
      console.error('Join room error:', err);
      showToast('Connection error. Please try again.', 'danger');
      setLoading(btn, false);
    }
  }

  // ── Check if landing with ?room= param (direct link) ─────────
  function checkDirectLink() {
    const params = new URLSearchParams(window.location.search);
    const room   = params.get('room');
    if (room) {
      document.getElementById('room-code-input').value = room.toUpperCase();
      switchTab('join');
      const saved = localStorage.getItem('syncroom_name');
      if (saved) document.getElementById('player-name').value = saved;
    }
  }

  // ── Rules Modal ───────────────────────────────────────────────
  function openRulesModal() {
    document.getElementById('rules-modal')?.classList.remove('hidden');
  }
  function closeRulesModal() {
    document.getElementById('rules-modal')?.classList.add('hidden');
  }

  // ── Event listeners ───────────────────────────────────────────
  document.getElementById('btn-theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('btn-how-to-play')?.addEventListener('click', openRulesModal);
  document.getElementById('rules-close')?.addEventListener('click', closeRulesModal);
  document.getElementById('rules-got-it')?.addEventListener('click', closeRulesModal);
  document.getElementById('rules-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeRulesModal();
  });

  document.getElementById('tab-create')?.addEventListener('click', () => switchTab('create'));
  document.getElementById('tab-join')?.addEventListener('click', () => {
    switchTab('join');
    document.getElementById('room-code-input')?.focus();
  });

  document.getElementById('room-code-input').addEventListener('input', function () {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });

  document.getElementById('btn-create').addEventListener('click', createRoom);
  document.getElementById('btn-join').addEventListener('click', () => joinRoom());

  document.getElementById('room-code-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') joinRoom();
  });

  document.getElementById('player-name').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const joinVisible = !document.getElementById('panel-join').classList.contains('hidden');
      if (joinVisible) joinRoom();
      else createRoom();
    }
  });

  // ── Init ──────────────────────────────────────────────────────
  syncThemeButton();
  initAvatarPicker();
  checkDirectLink();
  loadRecentRooms();

  const savedName = localStorage.getItem('syncroom_name');
  if (savedName && !document.getElementById('player-name').value) {
    document.getElementById('player-name').value = savedName;
  }
})();
