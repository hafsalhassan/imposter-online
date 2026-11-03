// ============================================================
//  room.js — Landing page logic: create / join rooms
// ============================================================

(function () {
  'use strict';

  // ── Init Kerala Avatar Picker ────────────────────────────────
  function initAvatarPicker() {
    const container = document.getElementById('avatar-picker');
    if (!container || typeof KERALA_AVATARS === 'undefined') return;

    let savedAvatar = localStorage.getItem('syncroom_avatar') || KERALA_AVATARS[0].id;
    document.getElementById('selected-avatar-id').value = savedAvatar;

    container.innerHTML = '';
    KERALA_AVATARS.forEach(avatar => {
      const el = document.createElement('div');
      el.className = 'avatar-choice-item' + (avatar.id === savedAvatar ? ' selected' : '');
      el.title = avatar.name;
      el.innerHTML = avatar.svg;
      el.addEventListener('click', () => {
        document.querySelectorAll('.avatar-choice-item').forEach(i => i.classList.remove('selected'));
        el.classList.add('selected');
        document.getElementById('selected-avatar-id').value = avatar.id;
        localStorage.setItem('syncroom_avatar', avatar.id);
      });
      container.appendChild(el);
    });
  }

  // ── Helpers ──────────────────────────────────────────────────
  function genRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
    let code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function genPlayerId() {
    return 'p_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now().toString(36).slice(-4);
  }

  function getOrCreatePlayerId() {
    // Check sessionStorage first so multiple tabs on same browser get unique players!
    let id = sessionStorage.getItem('syncroom_player_id');
    if (!id) {
      id = genPlayerId();
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
      btn.dataset.label = btn.textContent;
      btn.innerHTML = '<span class="spinner spinner--sm"></span>';
      btn.disabled = true;
    } else {
      btn.textContent = btn.dataset.label || btn.textContent;
      btn.disabled = false;
    }
  }

  // ── Recent rooms ─────────────────────────────────────────────
  function loadRecentRooms() {
    const list = JSON.parse(localStorage.getItem('syncroom_recent') || '[]');
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
        <span class="recent-arrow">→</span>`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('player-name').value = name;
        document.getElementById('room-code-input').value = code;
      });
      listEl.appendChild(a);
    });
  }

  function saveRecentRoom(code, name) {
    let list = JSON.parse(localStorage.getItem('syncroom_recent') || '[]');
    list = list.filter(r => r.code !== code);
    list.unshift({ code, name, ts: Date.now() });
    localStorage.setItem('syncroom_recent', JSON.stringify(list.slice(0, 5)));
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
    if (!name) { err.classList.add('show'); return null; }
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

    // Generate unique room code (retry if exists)
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
      hostId:        playerId,
      state:         'lobby',
      round:         0,
      timerDuration: 180,
      timerEnd:      null,
      currentWordId: null,
      createdAt:     now,
    });

    const avatarId = document.getElementById('selected-avatar-id')?.value || 'chetan-meesha';

    await db.ref('rooms/' + code + '/players/' + playerId).set({
      name,
      avatar:    avatarId,
      score:     0,
      isOnline:  true,
      joinedAt:  now,
    });

    saveRecentRoom(code, name);
    localStorage.setItem('syncroom_name', name);
    window.location.href = 'game.html?room=' + code;
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
    const playerId = getOrCreatePlayerId();

    setLoading(btn, true);
    roomErr.classList.remove('show');

    const snap = await db.ref('rooms/' + rawCode).once('value');
    if (!snap.exists()) {
      roomErr.classList.add('show');
      roomErr.textContent = 'Room not found. Check the code.';
      setLoading(btn, false);
      return;
    }

    const room = snap.val();
    if (room.state !== 'lobby') {
      roomErr.classList.add('show');
      roomErr.textContent = 'This game is already in progress.';
      setLoading(btn, false);
      return;
    }

    const avatarId = document.getElementById('selected-avatar-id')?.value || 'chetan-meesha';

    await db.ref('rooms/' + rawCode + '/players/' + playerId).set({
      name,
      avatar:   avatarId,
      score:    0,
      isOnline: true,
      joinedAt: Date.now(),
    });

    saveRecentRoom(rawCode, name);
    localStorage.setItem('syncroom_name', name);
    window.location.href = 'game.html?room=' + rawCode;
  }

  // ── Check if landing with ?room= param (direct link) ─────────
  function checkDirectLink() {
    const params = new URLSearchParams(window.location.search);
    const room   = params.get('room');
    if (room) {
      document.getElementById('room-code-input').value = room.toUpperCase();
      // Pre-fill name if saved
      const saved = localStorage.getItem('syncroom_name');
      if (saved) document.getElementById('player-name').value = saved;
    }
  }

  // ── Room code input: auto-uppercase + auto-join on 4 chars ───
  document.getElementById('room-code-input').addEventListener('input', function () {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });

  // ── Event listeners ───────────────────────────────────────────
  document.getElementById('btn-create').addEventListener('click', createRoom);
  document.getElementById('btn-join').addEventListener('click', () => joinRoom());

  document.getElementById('room-code-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') joinRoom();
  });

  document.getElementById('player-name').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const code = document.getElementById('room-code-input').value.trim();
      if (code.length === 4) joinRoom();
      else createRoom();
    }
  });

  // ── Init ──────────────────────────────────────────────────────
  initAvatarPicker();
  checkDirectLink();
  loadRecentRooms();

  // Pre-fill name if saved
  const savedName = localStorage.getItem('syncroom_name');
  if (savedName && !document.getElementById('player-name').value) {
    document.getElementById('player-name').value = savedName;
  }
})();
