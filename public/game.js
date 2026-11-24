// The Midnight Workshop: game client.
(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  document.body.insertAdjacentHTML('afterbegin', ART.defs);
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><symbol id="paintingSym" viewBox="0 0 600 600">${ART.painting()}</symbol></defs></svg>`);

  // ---------- constants ----------
  const BELLS = ['red', 'gold', 'green', 'blue', 'silver'];
  const BELL_X = [150, 228, 305, 382, 460];
  const HEX = { red: '#d7263d', gold: '#f2b632', green: '#2fae6b', blue: '#2f7fe0', silver: '#c9d3df', purple: '#9b4fd6' };
  const FRAGS = [{ n: 1, notes: ['blue', 'green'] }, { n: 2, notes: ['silver', 'blue'] }, { n: 3, notes: ['green', 'gold'] }, { n: 4, notes: ['red', 'gold'] }];
  const TOYS = ['horse', 'drum', 'kite', 'teddy'];
  const ELVES = ['Pip', 'Bramble', 'Tansy', 'Juniper'];
  const SCENES = { parlour: 'The Parlour', workshop: "Grandpa's Workshop", attic: 'The Clock Tower' };
  const VIEW_NAMES = { cards: 'the Christmas cards', album: 'the photo album', watch: 'the pocket watch', pocket: 'their pocket', present: 'the present', letter: 'the letter', door: 'the door', bells: 'the bells', tiles: 'the painting', ledger: 'the ledger', cabinet: 'the cabinet', gears: 'the clock mechanism', wheel: 'the cipher wheel', final: 'the plaque', telescope: 'the telescope' };
  const GAME_MS = 90 * 60 * 1000;
  const ROOM_ORDER = ['parlour', 'workshop', 'attic'];
  // Where the "camera" flies to when walking between rooms (forward = deeper into the house).
  const DOORWAY = { 'parlour>workshop': '94% 58%', 'workshop>attic': '76% 2%', 'workshop>parlour': '20% 94%', 'attic>workshop': '90% 96%', 'parlour>attic': '50% 50%', 'attic>parlour': '50% 50%' };
  const LEDGER_CLUES = ['Neither Pip nor Juniper made the rocking horse.', 'Bramble is scared of horses, even wooden ones.', 'The teddy bear was made by either Tansy or Juniper.', "Pip can't stand loud noises and has never made a drum.", 'Juniper works next to the elf who made the kite.'];
  const TAG_DOTS = ['red', 'gold', 'blue', 'purple'];
  const ENGRAVING = 'OJBZOCZM';
  const SOLVE_TEXT = { present: 'The present is open!', memory: 'All the pairs are matched!', door: 'The workshop door is open!', bells: "That's Grandpa's tune!", tiles: 'The painting is fixed!', spot: 'All five differences found!', cabinet: 'The cabinet is open!', hatch: 'The attic hatch is open!', watch: 'The watch clicks open!', gears: 'The Great Clock is ticking!', final: 'Midnight!' };
  const PRAISE = ['Brilliant!', 'You did it!', 'Grandpa would be so proud!', 'Amazing teamwork!', 'Ooh, clever!', 'Yes! Well done!'];
  const OOPS = ["Hmm, not quite. Have another think!", "Nearly! Try again.", "Oops! That's not it. Keep going!"];

  // ---------- local state ----------
  let pid = store.get('mw-pid', '');
  if (!pid) { pid = 'p' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); store.set('mw-pid', pid); }
  let S = null, skew = 0, screen = null, scene = 'parlour', view = null, k = 1;
  let joinMsg = null, myName = store.get('mw-name', '');
  let unread = 0, lastChatLen = 0, lastLogLen = 0, finaleRunning = false, lastSolvedSeen = null;
  const tileCum = [0, 0, 0, 0, 0, 0, 0, 0, 0]; let tileLast = null;
  let wheelCum = 0, wheelLast = null;
  const myCur = { x: 800, y: 450 };
  const cursors = new Map(); // id -> {el,x,y,tx,ty,s,t}
  const lenses = new Map(); // id -> {x,y,on,color}

  // ---------- networking ----------
  let ws = null, wsReady = false, queue = [], backoff = 800;
  function connect() {
    ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws');
    ws.onopen = () => { wsReady = true; backoff = 800; $('#conn').hidden = true; if (joinMsg) ws.send(JSON.stringify(joinWire())); queue.forEach((m) => ws.send(m)); queue = []; };
    ws.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch (_) { return; } onMsg(m); };
    ws.onclose = () => { wsReady = false; if (joinMsg && joinMsg.t === 'join') $('#conn').hidden = false; setTimeout(connect, backoff); backoff = Math.min(backoff * 1.6, 8000); };
  }
  // Every device keeps a copy of the game, so if the server restarts the room can be rebuilt.
  function saveSnap() {
    if (!S || !S.startedAt) return;
    store.set('mw-snap', JSON.stringify({ code: S.code, startedAt: S.startedAt, finishedAt: S.finishedAt, pausedAt: S.pausedAt, host: S.host, game: S.game }));
  }
  function joinWire() {
    const j = { ...joinMsg };
    if (j.t === 'join') { try { const sn = JSON.parse(store.get('mw-snap', 'null')); if (sn && sn.code === j.code) j.snap = sn; } catch (e) {} }
    return j;
  }
  function send(m) { const s = JSON.stringify(m); if (wsReady) ws.send(s); else if (m.t !== 'cur' && m.t !== 'lens') queue.push(s); }
  const act = (m) => send({ t: 'act', ...m });
  const sendWhere = () => send({ t: 'where', scene, view });

  function onMsg(m) {
    switch (m.t) {
      case 'joined':
        joinMsg = { t: 'join', code: m.code, name: myName, pid };
        store.set('mw-room', m.code);
        history.replaceState(null, '', '?room=' + m.code);
        break;
      case 'err': joinMsg = null; if (screen === 'loading') showLanding(); showErr(m.msg); break;
      case 'state': {
        const first = !S;
        S = m.s; skew = S.now - Date.now(); saveSnap();
        if (first) lastLogLen = S.log.length;
        route();
        break;
      }
      case 'cur': onCursor(m); break;
      case 'lens': lenses.set(m.id, { x: m.x, y: m.y, on: m.on }); drawLenses(); break;
      case 'toast': toast(m.msg); SFX.click(); break;
      case 'fx': onFx(m); break;
    }
  }

  // ---------- helpers ----------
  const me = () => (S ? S.players.find((p) => p.id === pid) : null);
  const playerById = (id) => (S ? S.players.find((p) => p.id === id) : null);
  const solved = (p) => !!(S && S.game.solved[p]);
  const has = (item) => !!(S && S.game.inv.includes(item));
  const puzzleTitle = (id) => ((S && S.puzzles.find((p) => p.id === id)) || { title: id }).title;
  function toast(text, cls = '') { const t = h(`<div class="toast ${cls}">${esc(text)}</div>`); $('#toasts').append(t); setTimeout(() => t.remove(), 4600); }
  function showErr(msg) { const e = $('.err'); if (e) e.textContent = msg; else toast(msg); }
  const initials = (n) => esc((n || '?').trim().charAt(0).toUpperCase());
  const avatar = (p, extra = '') => `<div class="avatar ${extra}" style="background:${p.color}">${initials(p.name)}${extra.includes('where') ? '' : ''}</div>`;
  const fmt = (ms) => { const s = Math.floor(Math.abs(ms) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  // Split clues: each online player gets a different share of a list (solo players get everything).
  function myShare(len) {
    const online = S.players.filter((p) => p.online).sort((a, b) => a.order - b.order);
    const n = Math.max(1, online.length), idx = Math.max(0, online.findIndex((p) => p.id === pid));
    return { mine: Array.from({ length: len }, (_, i) => i % n === idx), n };
  }
  const isHost = () => !!S && (S.host === pid || !(playerById(S.host) || {}).online);
  const roomMice = (room) => { const i = ROOM_ORDER.indexOf(room) * 3; return S.game.mice ? S.game.mice.slice(i, i + 3).filter(Boolean).length : 0; };
  function introSeen() { return store.get('mw-intro-' + S.code + '-' + S.startedAt, '') === '1'; }

  // ---------- routing ----------
  function route() {
    if (!S) return;
    if (!S.startedAt) { finaleRunning = false; return showLobby(); }
    if (S.finishedAt && !finaleRunning && screen !== 'victory') return showGame();
    if (screen === 'victory') return updateVictory();
    if (!introSeen() && screen !== 'game') return showIntro();
    showGame();
  }

  // ---------- snow (landing / lobby / victory) ----------
  (function snow() {
    const c = $('#snow'), x = c.getContext('2d');
    let W, H, flakes = [];
    const resize = () => { W = c.width = innerWidth * devicePixelRatio; H = c.height = innerHeight * devicePixelRatio; };
    resize(); addEventListener('resize', resize);
    for (let i = 0; i < 140; i++) flakes.push({ x: Math.random(), y: Math.random(), r: Math.random() * 2.4 + .6, s: Math.random() * .6 + .3, w: Math.random() * 6 });
    (function tick(t) {
      if (!document.body.classList.contains('in-game')) {
        x.clearRect(0, 0, W, H); x.fillStyle = '#fff';
        for (const f of flakes) {
          f.y += f.s * 0.0012; if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
          const px = (f.x + Math.sin(t / 2000 + f.w) * 0.01) * W, py = f.y * H;
          x.globalAlpha = 0.35 + f.r / 5; x.beginPath(); x.arc(px, py, f.r * devicePixelRatio, 0, 6.283); x.fill();
        }
      }
      requestAnimationFrame(tick);
    })(0);
  })();

  // ---------- LANDING ----------
  function showLanding() {
    screen = 'landing'; document.body.classList.remove('in-game');
    const params = new URLSearchParams(location.search);
    const code = (params.get('room') || '').toUpperCase().slice(0, 4);
    $('#app').innerHTML = `
      <div class="landing">${ART.landing()}
        <div class="hero">
          <div class="kicker">A Christmas escape room for everyone</div>
          <h1 class="title">The Midnight<em>Workshop</em></h1>
          <p class="tagline">Grandpa's Great Clock has stopped at one minute to midnight. Solve his puzzles together and save Christmas morning!</p>
          <div class="card">
            <label for="nm">Your name</label>
            <input id="nm" class="field" maxlength="18" placeholder="e.g. Auntie Sue" value="${esc(myName)}" autocomplete="nickname">
            <div style="height:14px"></div>
            ${code ? '' : '<button class="btn gold" id="create" style="width:100%">Create a new room</button><div class="or">or join your family</div>'}
            <div class="row"><input id="code" class="field code-field" maxlength="4" placeholder="CODE" value="${esc(code)}" autocomplete="off" autocapitalize="characters"><button class="btn green" id="join">Join</button></div>
            ${code ? '<div class="or">or</div><button class="btn ghost" id="create" style="width:100%">Start a different room</button>' : ''}
            <div class="err"></div>
          </div>
          <div class="fineprint">Best on a laptop or tablet. Sit together, or chat on a video call while you play.</div>
          <a class="teams-link" href="/work-teams">🎁 Playing with your work team? Here's how</a>
        </div>
      </div>`;
    const nm = $('#nm');
    const go = (t) => {
      const name = nm.value.trim();
      if (!name) { showErr('Pop your name in first!'); nm.focus(); return; }
      myName = name; store.set('mw-name', name); SFX.unlock();
      if (t === 'create') { joinMsg = { t: 'create', name, pid }; }
      else {
        const c = $('#code').value.trim().toUpperCase();
        if (c.length !== 4) { showErr('Room codes have 4 letters.'); return; }
        joinMsg = { t: 'join', code: c, name, pid };
      }
      send(joinWire());
    };
    $('#create').onclick = () => go('create');
    $('#join').onclick = () => go('join');
    $('#code').addEventListener('keydown', (e) => { if (e.key === 'Enter') go('join'); });
    nm.addEventListener('keydown', (e) => { if (e.key === 'Enter') (code ? go('join') : go('create')); });
    if (!myName) nm.focus();
  }

  // ---------- LOBBY ----------
  function showLobby() {
    document.body.classList.remove('in-game');
    if (screen !== 'lobby') {
      screen = 'lobby'; view = null;
      const link = `${location.origin}/?room=${S.code}`;
      $('#app').innerHTML = `
        <div class="lobby"><div class="card">
          <div class="kicker">Your room code</div>
          <div class="code-big">${S.code.split('').map((c) => `<span>${c}</span>`).join('')}</div>
          <div class="share"><code>${esc(link)}</code><button class="btn gold small" id="copy">Copy link</button></div>
          <div class="players" id="lobbyPlayers"></div>
          <div class="tips">
            <div class="tip"><b>🗣️</b>Talk to each other! Some clues are only on <i>your</i> screen.</div>
            <div class="tip"><b>🧝</b>Elsie the elf will tell you what to do, and gives hints if you get stuck.</div>
            <div class="tip"><b>⏳</b>You have 90 minutes before midnight. No rush, it's Christmas!</div>
          </div>
          <button class="btn" id="begin" style="width:100%;font-size:20px;padding:18px">Begin the adventure</button>
          <p class="fineprint">Wait until everyone's here, then anyone can press Begin.</p>
        </div></div>`;
      $('#copy').onclick = async () => {
        try { await navigator.clipboard.writeText(link); toast('Link copied! Send it to your family.'); }
        catch (e) { prompt('Copy this link:', link); }
      };
      $('#begin').onclick = () => { SFX.unlock(); SFX.chime(); send({ t: 'start' }); };
    }
    $('#lobbyPlayers').innerHTML = S.players.slice().sort((a, b) => a.order - b.order).map((p) => `<div class="pchip ${p.online ? '' : 'offline'}">${avatar(p)}${esc(p.name)}${p.id === pid ? ' <span style="opacity:.6">(you)</span>' : ''}</div>`).join('');
  }

  // ---------- INTRO (animated opening scene) ----------
  function showIntro() {
    if (screen === 'intro') return;
    screen = 'intro'; document.body.classList.remove('in-game');
    const pages = [
      'Christmas Eve. <em>11:59 pm.</em><br>Snow has buried Grandpa Tobias\'s cottage right up to the windowsills.',
      'Up in the attic stands the <em>Great Clock</em>, the old toymaker\'s masterpiece. Every year it strikes midnight, and Christmas morning arrives.',
      'But tonight the clock has <em>stopped</em>. Grandpa has set off through the snow to fetch help, leaving behind a letter… and a house full of puzzles.',
      'His apprentice, <em>Elsie the elf</em>, is waiting inside to help you. Listen to her when you\'re not sure what to do!',
      'Some clues only appear on <em>your</em> screen, so talk to each other!<br>Restart the Great Clock, and <em>save Christmas!</em>',
    ];
    $('#app').innerHTML = `<div class="intro" data-p="0">
      <div class="intro-art">${ART.landing()}
        <svg class="intro-over" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
          <g class="attic-glow"><circle cx="1110" cy="515" r="80" fill="url(#gWarm)"/><circle cx="1110" cy="515" r="20" fill="#ffcf6a" stroke="#4a2c22" stroke-width="5"/><path d="M1110 495 v40 M1090 515 h40" stroke="#4a2c22" stroke-width="4"/></g>
          <g class="steps">${Array.from({ length: 12 }, (_, i) => `<ellipse cx="${1060 - i * 78}" cy="${752 + (i % 2) * 8}" rx="9" ry="4" fill="#7286ad" style="transition-delay:${(i * 0.45).toFixed(2)}s"/>`).join('')}</g>
          <g transform="translate(1100 752)"><g class="gp-walk"><g transform="scale(.45) translate(-110 -370)"><g class="gp-bob walking">${ART.grandpa.replace('<svg ', '<svg width="220" height="380" ')}</g></g></g></g>
        </svg>
      </div>
      <div class="intro-elsie walking">${ART.elsie}</div>
      <div class="intro-text">${pages.map((p, i) => `<div class="page" data-i="${i}" style="${i ? 'display:none' : ''}">${p}</div>`).join('')}</div>
      <div class="controls"><div class="dots">${pages.map((_, i) => `<i data-i="${i}"></i>`).join('')}</div><button class="btn ghost small" id="skip">Skip</button><button class="btn gold small" id="next">Next</button></div></div>`;
    let i = 0, timer;
    const show = () => {
      $('.intro').dataset.p = i;
      if (i === 3) setTimeout(() => { const e = $('.intro-elsie'); if (e) e.classList.add('stopped'); }, 2300);
      $$('.intro .page').forEach((el) => { el.style.display = +el.dataset.i === i ? '' : 'none'; el.classList.remove('on'); });
      $$('.intro .dots i').forEach((d) => d.classList.toggle('on', +d.dataset.i === i));
      requestAnimationFrame(() => requestAnimationFrame(() => { const el = $(`.intro .page[data-i="${i}"]`); if (el) el.classList.add('on'); }));
      $('#next').textContent = i === pages.length - 1 ? "Let's go!" : 'Next';
      clearTimeout(timer); timer = setTimeout(next, i === 2 ? 8500 : 6500);
      SFX.unlock();
    };
    const done = () => { clearTimeout(timer); store.set('mw-intro-' + S.code + '-' + S.startedAt, '1'); screen = null; route(); };
    const next = () => { if (i >= pages.length - 1) return done(); i++; show(); };
    $('#next').onclick = next; $('#skip').onclick = done;
    show();
  }

  // ---------- GAME ----------
  function showGame() {
    document.body.classList.add('in-game');
    if (screen !== 'game') buildGame();
    updateGame();
  }

  function buildGame() {
    screen = 'game';
    scene = (me() && S.game.scenes.includes(me().scene)) ? me().scene : 'parlour';
    view = null;
    $('#app').innerHTML = `
    <div class="game">
      <header class="hud">
        <div class="brand">The Midnight Workshop<small id="sceneLabel"></small></div>
        <div class="timer" id="timer" title="Time until midnight"><svg class="tclock" viewBox="-12 -12 24 24"><circle r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M0 0V-6M0 0L4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>60:00</span></div>
        <button class="room-chip" id="roomChip" title="Copy invite link">ROOM ${S.code}</button>
        <div class="spacer"></div>
        <div class="players" id="hudPlayers"></div>
        <button class="icon-btn" id="btnChat" title="Chat">💬<span class="badge" id="chatBadge" hidden>0</span></button>
        <button class="icon-btn" id="btnMusic" title="Music and sound">🎵</button>
        <button class="icon-btn" id="btnSound" title="Sound">🔊</button>
        <button class="icon-btn" id="btnHost" title="Host controls">⚙️</button>
        ${document.fullscreenEnabled ? '<button class="icon-btn" id="btnFull" title="Full screen">⛶</button>' : ''}
        <div class="vol-pop" id="volPop" hidden>
          <label class="vrow"><span>Music</span><input type="range" min="0" max="100" id="volMusic"></label>
          <label class="vrow"><span>Sound effects</span><input type="range" min="0" max="100" id="volSfx"></label>
          <button class="btn ghost small" id="musicToggle" style="width:100%"></button>
        </div>
      </header>
      <main class="viewport" id="viewport">
        <div class="stage" id="stage">
          ${ROOM_ORDER.map((r) => `<div class="scene" data-scene="${r}">${r === 'workshop' ? ART.workshop(BELL_X) : ART[r]()}<div class="mice">${ART.MICE.map(([x, y], i) => Math.floor(i / 3) === ROOM_ORDER.indexOf(r) ? `<button class="mouse" data-mouse="${i}" style="left:${x - 30}px;top:${y - 44}px" aria-label="A little mouse"></button>` : '').join('')}</div></div>`).join('')}
          <div class="paused" id="paused" hidden><div class="pcard"><div class="big">⏸</div><h3>Paused</h3><p id="pausedBy"></p><button class="btn gold" id="resumeBtn" hidden>Carry on</button></div></div>
          <div class="scene-name" id="sceneName"></div>
          <div class="modal-layer" id="modalLayer"></div>
          <div id="fxLayer" style="position:absolute;inset:0;pointer-events:none;z-index:42"></div>
          <div class="elsie" id="elsie" title="Elsie">${ART.elsie}</div>
          <div class="bubble" id="bubble" hidden><b>Elsie</b><p id="bubbleText"></p><button class="bubble-x" aria-label="Hide">×</button></div>
          <div class="verdict" id="verdict" hidden></div>
          <div class="cursors" id="cursors"></div>
          <div class="tooltip" id="tip"></div>
        </div>
      </main>
      <footer class="hud bottom">
        <div class="satchel"><span class="lbl">Satchel</span><div id="slots" style="display:flex;gap:8px"></div></div>
        <button class="pocket-btn" id="pocketBtn" hidden title="Your torn melody pieces"><span class="lbl">Pocket</span><span class="scrapmini">🎼</span></button>
        <div class="feed" id="feed"></div>
        <div class="emojis" title="Point things out to everyone">${['👀', '💡', '❓', '🎉', '❤️'].map((e) => `<button data-e="${e}">${e}</button>`).join('')}</div>
        <button class="robin-btn" id="btnHint">${elsieFace()}<span>Ask Elsie for a hint</span></button>
      </footer>
      <aside class="panel" id="hintPanel"><header>${elsieFace()}<h4>Elsie's hints</h4><button class="icon-btn" data-close>×</button></header><div class="body" id="hintBody"></div></aside>
      <aside class="panel" id="hostPanel"><header><span style="font-size:26px">⚙️</span><h4>Host controls</h4><button class="icon-btn" data-close>×</button></header><div class="body" id="hostBody"></div></aside>
      <div class="rotate"><div><div class="phone">📱</div><b>Turn your phone sideways</b><p>The workshop is much easier to explore in landscape.</p></div></div>
      <aside class="panel" id="chatPanel"><header><h4>Chat</h4><button class="icon-btn" data-close>×</button></header><div class="body"><div class="chatlog" id="chatLog"></div></div>
        <form class="chatform" id="chatForm"><input class="field" id="chatIn" maxlength="200" placeholder="Say something…" autocomplete="off"><button class="btn gold small">Send</button></form></aside>
    </div>`;
    const stage = $('#stage');
    lastChatLen = S.chat.length;
    tileLast = null; wheelLast = null;

    // scale stage to fit
    const fit = () => {
      const vp = $('#viewport'); if (!vp) return;
      const w = vp.clientWidth, hh = vp.clientHeight;
      k = Math.min(w / 1600, hh / 900);
      stage.style.transform = `translate(${(w - 1600 * k) / 2}px, ${(hh - 900 * k) / 2}px) scale(${k})`;
      stage.classList.toggle('small', k < 0.6);
    };
    fit(); addEventListener('resize', fit); new ResizeObserver(fit).observe($('#viewport'));

    // pointer → shared cursor
    let lastSent = 0;
    const toStage = (e) => { const r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }; };
    stage.addEventListener('pointermove', (e) => {
      const p = toStage(e); myCur.x = p.x; myCur.y = p.y;
      stage.style.setProperty('--px', ((p.x / 1600 - 0.5) * 2).toFixed(3)); stage.style.setProperty('--py', ((p.y / 900 - 0.5) * 2).toFixed(3));
      const now = performance.now();
      if (now - lastSent > 45) { lastSent = now; send({ t: 'cur', x: Math.round(p.x), y: Math.round(p.y), s: scene }); }
      const hsEl = e.target.closest && e.target.closest('.hs');
      const tip = $('#tip');
      if (hsEl && !view) { tip.textContent = hsEl.dataset.label; tip.style.left = p.x + 'px'; tip.style.top = p.y + 'px'; tip.classList.add('show'); }
      else tip.classList.remove('show');
    });
    stage.addEventListener('pointerdown', (e) => { const p = toStage(e); myCur.x = p.x; myCur.y = p.y; SFX.unlock(); });
    stage.addEventListener('click', (e) => {
      const hsEl = e.target.closest('.hs');
      if (hsEl && !view) { onHotspot(hsEl.dataset.hs); }
    });
    stage.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('hs')) { e.preventDefault(); onHotspot(e.target.dataset.hs); } });
    $('#modalLayer').addEventListener('click', (e) => { if (e.target.id === 'modalLayer') closeModal(); });

    // HUD buttons
    $('#roomChip').onclick = async () => { const link = `${location.origin}/?room=${S.code}`; try { await navigator.clipboard.writeText(link); toast('Invite link copied!'); } catch (e) { prompt('Invite link:', link); } };
    const syncAudioBtns = () => {
      $('#btnSound').classList.toggle('off', SFX.state.muted); $('#btnSound').textContent = SFX.state.muted ? '🔇' : '🔊'; $('#btnMusic').classList.toggle('off', !SFX.state.music);
      $('#musicToggle').textContent = SFX.state.music ? 'Turn the music off' : 'Turn the music on';
      $('#volMusic').value = Math.round(SFX.state.musicVol * 100); $('#volSfx').value = Math.round(SFX.state.sfxVol * 100);
    };
    $('#btnSound').onclick = () => { SFX.setMuted(!SFX.state.muted); syncAudioBtns(); };
    $('#btnMusic').onclick = (e) => { e.stopPropagation(); SFX.unlock(); $('#volPop').hidden = !$('#volPop').hidden; syncAudioBtns(); };
    $('#volPop').onclick = (e) => e.stopPropagation();
    document.addEventListener('click', () => { const vp = $('#volPop'); if (vp) vp.hidden = true; });
    $('#musicToggle').onclick = () => { SFX.setMusic(!SFX.state.music); syncAudioBtns(); };
    $('#volMusic').oninput = (e) => { SFX.setMusicVol(e.target.value / 100); if (!SFX.state.music && +e.target.value > 0) SFX.setMusic(true); syncAudioBtns(); };
    $('#volSfx').oninput = (e) => { SFX.setSfxVol(e.target.value / 100); };
    $('#volSfx').onchange = () => SFX.pop();
    syncAudioBtns();
    if ($('#btnFull')) $('#btnFull').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); };
    $('#btnHost').onclick = () => { if (togglePanel('#hostPanel')) renderHost(); SFX.pop(); };
    $('#resumeBtn').onclick = () => send({ t: 'host', a: 'resume' });
    $$('.mouse').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); if (S.game.mice && S.game.mice[+b.dataset.mouse]) return; SFX.squeak(); act({ a: 'mouse', i: +b.dataset.mouse }); }));
    const togglePanel = (id) => { const p = $(id); const on = !p.classList.contains('on'); $$('.panel').forEach((x) => x.classList.remove('on')); p.classList.toggle('on', on); return on; };
    $('#btnHint').onclick = () => { togglePanel('#hintPanel'); renderHints(); SFX.pop(); };
    $('#btnChat').onclick = () => { if (togglePanel('#chatPanel')) { unread = 0; renderChat(); setTimeout(() => $('#chatIn').focus(), 300); } };
    $$('.panel [data-close]').forEach((b) => (b.onclick = () => b.closest('.panel').classList.remove('on')));
    $('#chatForm').onsubmit = (e) => { e.preventDefault(); const v = $('#chatIn').value.trim(); if (v) send({ t: 'chat', text: v }); $('#chatIn').value = ''; };
    $('#pocketBtn').onclick = () => openModal('pocket');
    $$('.emojis button').forEach((b) => (b.onclick = () => send({ t: 'ping', x: Math.round(myCur.x), y: Math.round(myCur.y), s: scene, e: b.dataset.e })));
    document.addEventListener('keydown', (e) => {
      if (screen !== 'game' || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      if (e.key === 'Escape' && view) closeModal();
      const idx = ['1', '2', '3', '4', '5'].indexOf(e.key);
      if (idx >= 0) send({ t: 'ping', x: Math.round(myCur.x), y: Math.round(myCur.y), s: scene, e: ['👀', '💡', '❓', '🎉', '❤️'][idx] });
    });

    $('#elsie').onclick = () => { SFX.pop(); const b = $('#bubble'); if (!b.hidden) b.hidden = true; else { elsieBusyUntil = 0; elsieLast = ''; updateElsie(); } };
    $('.bubble-x').onclick = () => { $('#bubble').hidden = true; };
    goScene(scene, true);
    sendWhere();
    requestAnimationFrame(cursorLoop);
  }

  function goScene(s, silent) {
    if (!S.game.scenes.includes(s)) return;
    const changed = s !== scene, from = scene;
    scene = s;
    const oldEl = $(`.scene[data-scene="${from}"]`), newEl = $(`.scene[data-scene="${s}"]`);
    if (changed && !silent && oldEl && newEl) {
      // Walk through the doorway: the old room rushes towards you, the new one settles into place.
      const fwd = ROOM_ORDER.indexOf(s) > ROOM_ORDER.indexOf(from);
      const origin = DOORWAY[`${from}>${s}`] || '50% 50%';
      oldEl.style.transformOrigin = origin; newEl.style.transformOrigin = fwd ? '50% 50%' : DOORWAY[`${s}>${from}`] || '50% 50%';
      newEl.style.transition = 'none'; newEl.style.transform = fwd ? 'scale(.86)' : 'scale(1.35)'; void newEl.offsetWidth;
      newEl.style.transition = ''; newEl.style.transform = '';
      oldEl.classList.add(fwd ? 'leave-fwd' : 'leave-back');
      setTimeout(() => oldEl.classList.remove('leave-fwd', 'leave-back'), 1100);
    }
    $$('.scene').forEach((el) => el.classList.toggle('on', el.dataset.scene === s));
    const nm = $('#sceneName'); nm.textContent = SCENES[s]; nm.classList.add('show'); clearTimeout(nm._t); nm._t = setTimeout(() => nm.classList.remove('show'), 2200);
    $('#sceneLabel').textContent = SCENES[s];
    if (changed && !silent) { SFX.whoosh(); sendWhere(); }
    if (changed) { elsieLast = ''; elsieBusyUntil = 0; setTimeout(updateElsie, 700); }
    for (const [id, c] of cursors) c.el.style.display = c.s === scene ? '' : 'none';
  }

  function onHotspot(id) {
    SFX.click();
    switch (id) {
      case 'door': return solved('door') ? goScene('workshop') : openModal('door');
      case 'toParlour': return goScene('parlour');
      case 'toWorkshop': return goScene('workshop');
      case 'hatch': return solved('hatch') ? goScene('attic') : act({ a: 'hatch' });
      default: if (MODALS[id]) openModal(id);
    }
  }

  function updateGame() {
    if (screen !== 'game') return;
    const g = S.game;
    if (!g.scenes.includes(scene)) goScene('parlour', true);

    // players
    $('#hudPlayers').innerHTML = S.players.slice().sort((a, b) => a.order - b.order).map((p) => {
      const where = p.online ? `${SCENES[p.scene] || ''}${p.view && VIEW_NAMES[p.view] ? ' · looking at ' + VIEW_NAMES[p.view] : ''}` : 'Away';
      return `<div class="avatar ${p.online ? '' : 'away'}" style="background:${p.color}">${initials(p.name)}<div class="where"><b>${esc(p.name)}</b>${p.id === pid ? ' (you)' : ''}<br>${esc(where)}</div></div>`;
    }).join('');

    // satchel
    const slots = $('#slots'); const prev = slots.dataset.items || '';
    const items = g.inv.slice();
    slots.innerHTML = Array.from({ length: Math.max(4, items.length) }, (_, i) => i).map((i) => items[i] ? `<div class="slot ${prev.split(',').includes(items[i]) ? '' : 'new'}" data-name="${ART.itemName[items[i]]}">${ART.icon[items[i]]}</div>` : '<div class="slot"></div>').join('');
    slots.dataset.items = items.join(',');

    // pocket
    $('#pocketBtn').hidden = !(g.scenes.includes('workshop') && !g.solved.bells);

    // feed (and toasts for others' discoveries)
    const last = S.log[S.log.length - 1];
    $('#feed').innerHTML = last ? `<b>●</b> ${esc(last.text)}` : '';
    lastLogLen = S.log.length;

    applySceneState();
    if (view && MODALS[view] && MODALS[view].update) MODALS[view].update($('#modalLayer .modal'));
    if ($('#hintPanel').classList.contains('on')) renderHints();
    renderChat();
    tickTimer();
    updateElsie();
    if (S.finishedAt && !finaleRunning && screen === 'game') { if (Date.now() + skew - S.finishedAt < 10000) runFinale(); else showVictory(); }
  }

  function applySceneState() {
    const g = S.game;
    // parlour
    $('#pDoorOpen').style.display = g.solved.door ? '' : 'none';
    $('#pDoorClosed').style.display = g.solved.door ? 'none' : '';
    $('#pLid').classList.toggle('open', !!g.solved.present);
    $('#pPadlock').style.display = g.solved.present ? 'none' : '';
    $('[data-hs="letter"]').classList.toggle('nudge', has('lens') && !g.solved.door);
    $('[data-hs="door"]').classList.toggle('nudge', !!g.solved.door && !g.scenes.includes('attic') && scene === 'parlour');
    // workshop
    $('#wMbLid').classList.toggle('open', !!g.solved.bells);
    $('#wHatchOpen').style.display = g.solved.hatch ? '' : 'none';
    $('#wHatchClosed').style.display = g.solved.hatch ? 'none' : '';
    $('[data-hs="hatch"]').classList.toggle('nudge', has('starKey') || (!!g.solved.hatch && scene === 'workshop' && !g.solved.gears));
    $('#wCabOpen').style.display = g.solved.cabinet ? '' : 'none';
    $('#wCabDials').style.display = g.solved.cabinet ? 'none' : '';
    $('#wPainting').innerHTML = g.pz.tiles.map((r, i) => { const c = i % 3, rr = Math.floor(i / 3); return `<g transform="translate(${c * 200} ${rr * 200}) rotate(${r * 90} 100 100)"><svg width="200" height="200" viewBox="${c * 200} ${rr * 200} 200 200"><use href="#paintingSym" width="600" height="600"/></svg></g>`; }).join('');
    // attic
    $('#aGear0').style.display = g.pz.gears[0] ? '' : 'none';
    $('#aGear1').style.display = g.pz.gears[1] ? '' : 'none';
    $('#aGear2').style.display = g.pz.gears[2] ? '' : 'none';
    $('#aSlot2').style.display = g.pz.gears[2] ? 'none' : '';
    $('#aSlot0').style.display = g.pz.gears[0] ? 'none' : '';
    $('#aSlot1').style.display = g.pz.gears[1] ? 'none' : '';
    $('[data-scene="attic"]').classList.toggle('ticking', !!g.solved.gears);
    $('[data-hs="gears"]').classList.toggle('nudge', (has('brassGear') || has('silverGear') || has('copperGear')) && scene === 'attic');
    if (g.solved.final) { $('#aHour').style.transform = 'rotate(0deg)'; $('#aMin').style.transform = 'rotate(0deg)'; }
    else { $('#aHour').style.transform = 'rotate(-0.5deg)'; $('#aMin').style.transform = 'rotate(-6deg)'; }
    // hidden mice
    $$('.mouse').forEach((b) => {
      const f = !!(g.mice && g.mice[+b.dataset.mouse]);
      if (b.dataset.f !== String(f)) { b.dataset.f = String(f); b.innerHTML = ART.mouse(f); b.classList.toggle('found', f); }
    });
    // pause
    const pz = $('#paused');
    pz.hidden = !S.pausedAt || !!S.finishedAt;
    if (S.pausedAt) {
      const host = playerById(S.host);
      $('#pausedBy').textContent = isHost() ? 'Take a break! Press the button when everyone is ready.' : `${host ? host.name : 'The host'} has paused the game. Hang on!`;
      $('#resumeBtn').hidden = !isHost();
    }
    if ($('#hostPanel').classList.contains('on')) renderHost();
  }

  // ---------- host controls ----------
  function renderHost() {
    const g = S.game, host = playerById(S.host);
    const body = $('#hostBody'); if (!body) return;
    if (!isHost()) { body.innerHTML = `<p class="muted">Only ${esc(host ? host.name : 'the host')} (who made the room) can use these. If they leave, anyone can.</p>`; return; }
    const open = S.puzzles.filter((p) => g.scenes.includes(p.scene) && !g.solved[p.id]);
    if (g.scenes.includes('workshop') && !g.solved.hatch) open.push({ id: 'hatch', title: 'The attic hatch' });
    body.innerHTML = `
      <div class="hostcard"><h5>The clock</h5>${S.pausedAt ? '<button class="btn gold small" data-h="resume">▶ Carry on</button>' : '<button class="btn ghost small" data-h="pause">⏸ Pause the game</button>'}<p class="muted">Pausing stops the timer and the puzzles for everyone.</p></div>
      <div class="hostcard"><h5>Skip a puzzle</h5><p class="muted">For when everyone's really stuck. Elsie's hints are free too!</p>
        ${open.length ? open.map((p) => `<button class="btn ghost small skipbtn" data-skip="${p.id}">Skip: ${esc(p.title)}</button>`).join('') : '<p class="muted">Nothing to skip right now.</p>'}</div>
      <div class="hostcard"><h5>Start again from a room</h5><p class="muted">Everything before that room is done for you. Handy if something goes wrong.</p>
        <div class="row" style="flex-wrap:wrap;gap:8px">${ROOM_ORDER.map((r) => `<button class="btn ghost small" data-restart="${r}">${SCENES[r]}</button>`).join('')}</div></div>`;
    $$('[data-h]', body).forEach((b) => (b.onclick = () => send({ t: 'host', a: b.dataset.h })));
    $$('[data-skip]', body).forEach((b) => (b.onclick = () => { if (confirm(`Skip "${b.textContent.replace('Skip: ', '')}" for everyone?`)) send({ t: 'host', a: 'skip', p: b.dataset.skip }); }));
    $$('[data-restart]', body).forEach((b) => (b.onclick = () => { if (confirm(`Start again from ${b.textContent}? Everyone goes back to that room.`)) send({ t: 'host', a: 'restart', room: b.dataset.restart }); }));
  }

  // timer
  function tickTimer() {
    const el = $('#timer'); if (!el || !S || !S.startedAt) return;
    const end = S.finishedAt || S.pausedAt || (Date.now() + skew);
    const left = GAME_MS - (end - S.startedAt);
    el.querySelector('span').textContent = left >= 0 ? fmt(left) : '+' + fmt(left);
    el.classList.toggle('over', left < 0);
  }
  setInterval(tickTimer, 500);

  // ---------- cursors ----------
  const cursorSvg = (c) => `<svg viewBox="0 0 34 34"><path d="M4 3 L29 15 L17 18.5 L12 31Z" fill="${c}" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
  function onCursor(m) {
    const p = playerById(m.id); if (!p || m.id === pid) return;
    let c = cursors.get(m.id);
    if (!c) {
      const el = h(`<div class="cursor">${cursorSvg(p.color)}<span style="background:${p.color}">${esc(p.name)}</span></div>`);
      const layer = $('#cursors'); if (!layer) return;
      layer.append(el);
      c = { el, x: m.x, y: m.y, tx: m.x, ty: m.y, s: m.s, t: 0 };
      cursors.set(m.id, c);
    }
    c.tx = m.x; c.ty = m.y; c.s = m.s; c.t = performance.now();
    c.el.style.display = c.s === scene ? '' : 'none';
  }
  function cursorLoop() {
    if (screen !== 'game') { cursors.clear(); return; }
    const now = performance.now();
    for (const [id, c] of cursors) {
      const p = playerById(id);
      if (!p || !p.online) { c.el.remove(); cursors.delete(id); continue; }
      c.x += (c.tx - c.x) * 0.25; c.y += (c.ty - c.y) * 0.25;
      c.el.style.transform = `translate(${c.x - 4}px, ${c.y - 3}px)`;
      c.el.classList.toggle('idle', now - c.t > 6000);
    }
    requestAnimationFrame(cursorLoop);
  }

  // ---------- effects ----------
  function sparkles(x, y, n = 26) {
    const layer = $('#fxLayer'); if (!layer) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 220;
      const s = h(`<div class="sparkle" style="left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;animation-delay:${Math.random() * .2}s"></div>`);
      layer.append(s); setTimeout(() => s.remove(), 1500);
    }
  }
  function ringSceneBell(c) {
    const b = document.getElementById('wb-' + c); if (b) { b.classList.remove('ring'); void b.getBBox(); b.classList.add('ring'); }
    const mb = $(`#mb-${c}`); if (mb) { mb.classList.remove('ring'); void mb.getBBox(); mb.classList.add('ring'); }
  }
  function onFx(m) {
    if (screen !== 'game') { if (m.fx === 'reset') { screen = null; route(); } return; }
    switch (m.fx) {
      case 'solve': {
        SFX.correct(); setTimeout(SFX.chime, 300);
        sparkles(800, 420, 40);
        const who = m.by === pid ? 'You' : (playerById(m.by) || {}).name || 'Someone';
        if (m.p !== 'final' && m.skipped) verdict(true, SOLVE_TEXT[m.p] || 'Skipped!', `${who} skipped ${(m.p === 'hatch' ? 'the attic hatch' : puzzleTitle(m.p)).toLowerCase()}`);
        else if (m.p !== 'final') {
          verdict(true, SOLVE_TEXT[m.p] || 'Correct!', `${who === 'You' ? 'You' : who} solved ${puzzleTitle(m.p).toLowerCase()}${m.reward ? ` and found: ${ART.itemName[m.reward]}` : ''}`);
          elsieReact(PRAISE[Math.floor(Math.random() * PRAISE.length)] + (m.reward ? ` We found the ${ART.itemName[m.reward].toLowerCase()}!` : ''));
        }
        if (m.p === 'final') runFinale();
        if (m.p === 'door') setTimeout(() => { if (scene === 'parlour' && !view) toast('The door to the workshop is open. Click it to go through!'); }, 1200);
        if (m.p === 'hatch') setTimeout(() => toast('The attic hatch is open. Climb the ladder!'), 900);
        break;
      }
      case 'wrong': {
        SFX.wrong();
        if (m.by === pid) { verdict(false, 'Not quite!', m.msg || 'Try again'); elsieReact(OOPS[Math.floor(Math.random() * OOPS.length)]); }
        else toast(`${(playerById(m.by) || {}).name || 'Someone'} tried ${puzzleTitle(m.p).toLowerCase()}: ${m.msg || 'not quite'}`);
        const md = $('#modalLayer .modal');
        if (md && view === m.p) { md.classList.remove('shake'); void md.offsetWidth; md.classList.add('shake'); }
        break;
      }
      case 'bell': if (m.by !== pid) { SFX.bell(m.c); ringSceneBell(m.c); } break;
      case 'gear': SFX.tick(); setTimeout(SFX.tick, 200); if (!solved('gears')) verdict(true, 'Gear fitted!', `${['Brass', 'Silver', 'Copper'][m.i]} gear in place`); break;
      case 'flip': if (m.by !== pid) SFX.flip(); break;
      case 'pair': SFX.correct(); sparkles(800, 450, 14); break;
      case 'nopair': setTimeout(SFX.flip, 900); break;
      case 'spotted': SFX.correct(); if (!solved('spot')) verdict(true, 'Spotted one!', `${S.game.pz.spot.filter(Boolean).length} of 5 differences found`); break;
      case 'ping': {
        if (m.s !== scene) return;
        const p = playerById(m.by) || { color: '#fff' };
        const el = h(`<div class="ping" style="left:${m.x}px;top:${m.y}px;--c:${p.color}">${esc(m.e)}</div>`);
        $('#fxLayer').append(el); setTimeout(() => el.remove(), 1900); SFX.pop();
        break;
      }
      case 'hint': SFX.pop(); if (m.by !== pid) toast(`🧝 ${(playerById(m.by) || {}).name || 'Someone'} got a hint from Elsie about ${puzzleTitle(m.p).toLowerCase()}.`); if ($('#hintPanel').classList.contains('on')) renderHints(); break;
      case 'chat': if (m.by !== pid && !$('#chatPanel').classList.contains('on')) { unread++; SFX.pop(); const b = $('#chatBadge'); b.hidden = false; b.textContent = unread; } break;
      case 'mouse': {
        SFX.squeak();
        const who = m.by === pid ? 'You' : (playerById(m.by) || {}).name || 'Someone';
        const el = $(`.mouse[data-mouse="${m.i}"]`); if (el) { const r = ART.MICE[m.i]; sparkles(r[0], r[1] - 20, 16); }
        if (m.n >= 3) {
          verdict(true, 'All three mice found!', 'They squeak a secret clue…');
          setTimeout(() => { elsieBusyUntil = Date.now() + 12000; elsieSay(`The mice told me a secret! ${ART.MOUSE_CLUES[m.room]}`, 14000); setTimeout(() => { elsieLast = ''; updateElsie(); }, 14500); }, 1500);
        } else verdict(true, `${who} found a mouse!`, `${m.n} of 3 mice found in this room`);
        break;
      }
      case 'restart':
        closeModal(); finaleRunning = false;
        toast(`${(playerById(m.by) || {}).name || 'The host'} started again from ${SCENES[m.room]}.`);
        setTimeout(() => goScene(m.room), 50);
        break;
      case 'reset': screen = null; route(); break;
    }
  }

  // ---------- big feedback stamp ----------
  function verdict(ok, title, sub) {
    const v = $('#verdict'); if (!v) return;
    v.className = 'verdict ' + (ok ? 'ok' : 'no');
    v.innerHTML = `<div class="vbadge">${ok ? '✓' : '✗'}</div><div class="vtext"><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;
    v.hidden = false; void v.offsetWidth; v.classList.add('show');
    if (ok) sparkles(800, 380, 30);
    clearTimeout(v._t); v._t = setTimeout(() => { v.classList.remove('show'); setTimeout(() => { v.hidden = true; }, 400); }, ok ? 2400 : 2000);
  }

  // ---------- Elsie, the guide ----------
  function elsieFace() { return ART.elsie.replace('viewBox="0 0 220 360"', 'viewBox="44 14 132 132"').replace(/id="e(\w+)"/g, 'id="f$1"').replace(/url\(#e(\w+)\)/g, 'url(#f$1)'); }
  let elsieLast = '', elsieTyping = null, elsieHideT = null, elsieBusyUntil = 0;
  function elsieSay(text, ms = 14000) {
    const b = $('#bubble'), p = $('#bubbleText'), el = $('#elsie'); if (!b) return;
    b.hidden = !!view; p.textContent = '';
    clearInterval(elsieTyping); clearTimeout(elsieHideT);
    el.classList.add('talking');
    let i = 0;
    elsieTyping = setInterval(() => { i += 2; p.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(elsieTyping); el.classList.remove('talking'); } }, 28);
    elsieHideT = setTimeout(() => { b.hidden = true; }, ms);
  }
  function elsieReact(text) { elsieBusyUntil = Date.now() + 4000; elsieSay(text, 4000); setTimeout(() => { elsieLast = ''; updateElsie(); }, 4200); }
  function objective() {
    const g = S.game, sv = (p) => !!g.solved[p];
    if (scene === 'parlour') {
      if (!sv('present') && !sv('memory')) return "Hi, I'm Elsie! Grandpa's locked everything up. Start with the present under the tree: its tag got torn, so each of you sees different coloured dots. Share them! Kids: three little mice are hiding in every room. Find them and they'll tell you a secret!";
      if (!sv('present')) return 'The present under the tree has a number lock. Everyone has a different bit of the gift tag, so read your dots out loud, then count those baubles on the tree!';
      if (!sv('memory')) return 'Grandpa hid something behind his Christmas cards on the mantelpiece. Turn them over and find all the matching pairs!';
      if (!sv('door')) return has('doorKey') ? "We've got the key! Now read Grandpa's letter on the desk through the red lens to find the secret word for the door." : "Read Grandpa's letter on the desk. Try looking at it through that red lens!";
      return 'The workshop door is open! Come on, through the door on the right!';
    }
    if (scene === 'workshop') {
      if (!sv('bells')) return "This is Grandpa's workshop! His bell melody was torn up and shared between you. Check your pocket, read your pieces out loud, and ring the bells in order.";
      if (!sv('tiles')) return "Someone's scrambled Grandpa's painting! Turn the squares until the picture's right, and remember what it shows.";
      if (!sv('spot')) return "Grandpa's photo album is on the workbench. Two photos, five differences. Can you spot them all?";
      if (!sv('cabinet')) return "The elves' ledger on the workbench says who made which toy, but each of you can only read some of the clues. Read yours out, work it out together, then set the dials on the toy cabinet. Kids: have you found the three workshop mice?";
      if (!sv('hatch')) return 'That little star key must fit the hatch in the ceiling! Click the ladder to climb up.';
      return 'The hatch is open! Climb the ladder up to the clock tower!';
    }
    if (scene === 'attic') {
      if (!sv('watch')) return "The Great Clock! It's missing three gears. Grandpa's pocket watch on the side table might hold one. He always set it by the village clock in his painting.";
      if (!sv('gears')) return 'We need all three gears: brass, silver and copper. Open the glass case under the clock and fit them in!';
      if (!sv('final')) return "It's ticking! Now the plaque needs a secret word. Frost covers it, and each of you can see different letters, so put them together. Then use the cipher wheel to decode it. Remember the banner in the painting?";
      return 'You did it! Merry Christmas!';
    }
    return '';
  }
  function updateElsie() {
    if (screen !== 'game' || Date.now() < elsieBusyUntil) return;
    const o = objective();
    if (o && o !== elsieLast) { elsieLast = o; elsieSay(o); }
  }

  // ---------- hints & chat ----------
  function renderHints() {
    const g = S.game;
    const list = S.puzzles.filter((p) => g.scenes.includes(p.scene) && !g.solved[p.id]);
    list.sort((a, b) => (b.scene === scene) - (a.scene === scene));
    const total = Object.values(g.hints).reduce((a, b) => a + b, 0);
    const mice = ROOM_ORDER.filter((r) => g.scenes.includes(r)).map((r) => { const n = roomMice(r); return `<p>🐭 <b>${SCENES[r]}:</b> ${n} of 3 mice found${n >= 3 ? `<br><span class="answer" style="display:block;margin-top:4px">${esc(ART.MOUSE_CLUES[r])}</span>` : ''}</p>`; }).join('');
    $('#hintBody').innerHTML = `<p class="muted" style="margin-top:0">Hints are shared with everyone. ${total ? `You've used ${total} so far.` : 'Try a bit first, then ask if you get stuck!'}</p>` +
      `<div class="hintcard kidjob"><h5>Kid job: find the mice</h5><p class="muted" style="margin-top:0">Three little mice are hiding in every room. Find all three and they squeak a secret clue!</p>${mice}</div>` +
      (list.length ? list.map((p) => {
        const n = g.hints[p.id] || 0;
        return `<div class="hintcard"><h5>${esc(p.title)} <span class="muted" style="font-size:13px">· ${esc(SCENES[p.scene])}</span></h5>
          ${p.hints.slice(0, n).map((t, i) => `<p class="${i === p.hints.length - 1 ? 'answer' : ''}">${esc(t)}</p>`).join('')}
          ${n < p.hints.length ? `<button class="btn ghost small" data-hint="${p.id}">${n === p.hints.length - 1 ? 'Show me the answer' : n ? 'Another hint please' : 'Give me a hint'}</button>` : ''}</div>`;
      }).join('') : '<p>Nothing to hint about right now!</p>');
    $$('#hintBody [data-hint]').forEach((b) => (b.onclick = () => send({ t: 'hint', p: b.dataset.hint })));
  }
  function renderChat() {
    const log = $('#chatLog'); if (!log) return;
    if ($('#chatPanel').classList.contains('on')) { unread = 0; $('#chatBadge').hidden = true; }
    if (log.childElementCount === S.chat.length && lastChatLen === S.chat.length) return;
    lastChatLen = S.chat.length;
    log.innerHTML = S.chat.length ? S.chat.map((m) => `<div class="msg"><b style="color:${m.color}">${esc(m.name)}</b>${esc(m.text)}</div>`).join('') : '<p class="muted">No messages yet. Say hello!</p>';
    log.parentElement.scrollTop = 1e6;
  }

  // ---------- modals ----------
  function openModal(id) {
    const M = MODALS[id]; if (!M) return;
    view = id;
    $('#tip').classList.remove('show');
    if ($('#bubble')) $('#bubble').hidden = true;
    const layer = $('#modalLayer');
    layer.innerHTML = '';
    const el = h(`<div class="modal" data-m="${id}"><button class="close" aria-label="Close">×</button><h3>${M.title}</h3><div class="mbody">${M.build()}</div></div>`);
    layer.append(el);
    el.querySelector('.close').onclick = closeModal;
    if (M.bind) M.bind(el);
    if (M.update) M.update(el);
    requestAnimationFrame(() => layer.classList.add('on'));
    SFX.pop();
    sendWhere();
  }
  function closeModal() {
    if (!view) return;
    view = null;
    const layer = $('#modalLayer'); layer.classList.remove('on');
    setTimeout(() => { if (!view) layer.innerHTML = ''; }, 320);
    sendWhere();
  }
  const banner = (t) => `<div class="solved-banner">✓ ${t}</div>`;
  const foundBox = (item, text) => `<div class="found">${ART.icon[item]}<div>${text}</div></div>`;

  // word-lock helper
  function wordInputs(el, n, onSubmit) {
    const ins = $$('.word input', el);
    ins.forEach((inp, i) => {
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/[^a-z]/gi, '').slice(-1).toUpperCase(); if (inp.value && ins[i + 1]) ins[i + 1].focus(); SFX.tick(); });
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !inp.value && ins[i - 1]) { ins[i - 1].focus(); ins[i - 1].value = ''; e.preventDefault(); }
        if (e.key === 'Enter') onSubmit(ins.map((x) => x.value).join(''));
        if (e.key === 'ArrowLeft' && ins[i - 1]) ins[i - 1].focus();
        if (e.key === 'ArrowRight' && ins[i + 1]) ins[i + 1].focus();
      });
      inp.addEventListener('paste', (e) => { e.preventDefault(); const t = (e.clipboardData.getData('text') || '').replace(/[^a-z]/gi, '').toUpperCase(); t.split('').slice(0, n - i).forEach((ch, j) => { ins[i + j].value = ch; }); });
    });
    return () => ins.map((x) => x.value).join('');
  }
  const wordHtml = (n) => `<div class="word">${Array.from({ length: n }, () => '<input maxlength="2" autocomplete="off" autocapitalize="characters" spellcheck="false">').join('')}</div>`;

  // seeded random for scribbles
  function seeded(sd) { return () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; }

  const MODALS = {
    present: {
      title: 'The locked present',
      build: () => `<div class="mrow">
          <div class="tagwrap"><svg class="tag-big" viewBox="0 0 320 240"><path d="M10 120 Q0 30 60 20" stroke="#d9c38a" stroke-width="3" fill="none"/><path d="M40 40 L300 30 L310 220 L50 230 L20 130Z" fill="#f7eedc" stroke="#cdb88a" stroke-width="3"/><circle cx="44" cy="128" r="9" fill="#2a1f18"/>
            <text x="170" y="78" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="24" fill="#5a4636">For my clever ones.</text>
            <g id="tagDots"></g>
            <text x="170" y="200" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="20" fill="#5a4636">Count carefully! x</text></svg><p class="splitnote" id="tagNote"></p></div>
          <div class="mcol" id="presentCol"></div></div>`,
      update(el) {
        const col = $('#presentCol', el);
        // Each player can only see their own torn piece of the tag.
        const sh = myShare(4);
        $('#tagDots', el).innerHTML = TAG_DOTS.map((c, i) => { const x = 100 + i * 56; return sh.mine[i] || solved('present') ? `<circle cx="${x}" cy="135" r="20" fill="${HEX[c]}"/><circle cx="${x}" cy="135" r="20" fill="url(#gShade)"/>` : `<circle cx="${x}" cy="135" r="20" fill="none" stroke="#b7a37a" stroke-width="2.5" stroke-dasharray="5 5"/><text x="${x}" y="144" text-anchor="middle" font-family="Fraunces, serif" font-size="24" font-weight="800" fill="#b7a37a">?</text>`; }).join('');
        $('#tagNote', el).textContent = sh.n > 1 && !solved('present') ? `🧩 The tag is torn! You can only see ${sh.mine.some(Boolean) ? 'some of the dots' : 'none of the dots'}. The others have the rest, so read yours out loud.` : '';
        if (solved('present')) {
          if (col.dataset.state === 'done') return; col.dataset.state = 'done';
          col.innerHTML = `${banner('The lid pops open!')}${foundBox('lens', 'Inside, wrapped in tissue paper: <b>a red glass lens</b>. Grandpa always said red glass sees through red ink…')}`;
          return;
        }
        if (col.dataset.state !== 'lock') {
          col.dataset.state = 'lock';
          col.innerHTML = `<p class="lede">A brass padlock with four number dials holds the ribbon tight. The gift tag has four coloured dots on it…</p>
            <div class="dials">${[0, 1, 2, 3].map((i) => `<div class="dial"><button data-i="${i}" data-d="1" aria-label="Up">▲</button><div class="num" id="pd${i}">0</div><button data-i="${i}" data-d="-1" aria-label="Down">▼</button></div>`).join('')}</div>
            <button class="btn gold" id="tryPresent">Try to open it</button>`;
          $$('.dial button', col).forEach((b) => (b.onclick = () => { SFX.tick(); act({ a: 'digit', i: +b.dataset.i, d: +b.dataset.d }); }));
          $('#tryPresent', col).onclick = () => act({ a: 'openPresent' });
        }
        S.game.pz.present.forEach((d, i) => { const n = $('#pd' + i, col); if (n.textContent !== String(d)) { n.textContent = d; n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); } });
      },
    },

    letter: {
      title: "Grandpa's letter",
      build() {
        const r = seeded(1225);
        let scribbles = '';
        for (let i = 0; i < 44; i++) {
          let x = 30 + r() * 500, y = 20 + r() * 100;
          let d = `M${x.toFixed(0)} ${y.toFixed(0)}`;
          for (let j = 0; j < 5; j++) { const nx = 20 + r() * 520, ny = 15 + r() * 110; d += ` Q${(x + (r() - .5) * 140).toFixed(0)} ${(y + (r() - .5) * 120).toFixed(0)} ${nx.toFixed(0)} ${ny.toFixed(0)}`; x = nx; y = ny; }
          scribbles += `<path d="${d}" stroke="${r() > .3 ? '#d42a3a' : '#e25566'}" stroke-width="${(3 + r() * 4).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
        }
        return `<div class="letter">
          <p>My dearest grandchildren,</p>
          <p>If you're reading this, the Great Clock in the attic has stopped at one minute to midnight, and without it Christmas morning can never arrive! I've gone to fetch help, but the snow is terribly deep. You must set the clock going again.</p>
          <p>The workshop door will only open for <b>my favourite spice</b>. I wrote it down for you below, but that mischievous cat knocked over my red ink…</p>
          <svg class="scribble" id="scrib" viewBox="0 0 560 140" preserveAspectRatio="xMidYMid meet">
            <defs><clipPath id="lensClip"></clipPath></defs>
            <text x="280" y="96" text-anchor="middle" font-family="Fraunces, serif" font-weight="900" font-size="72" letter-spacing="8" fill="#d42a3a">CINNAMON</text>
            ${scribbles}
            <g clip-path="url(#lensClip)"><rect width="560" height="140" fill="#ef3e52"/><text x="280" y="96" text-anchor="middle" font-family="Fraunces, serif" font-weight="900" font-size="72" letter-spacing="8" fill="#3a0610">CINNAMON</text></g>
            <g id="lensRings"></g>
          </svg>
          <div class="lens-hint" id="lensHint"></div>
          <p class="sig">With all my love, Grandpa Tobias</p></div>`;
      },
      bind(el) {
        const svg = $('#scrib', el);
        let last = 0;
        const local = (e) => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
        const move = (e) => {
          if (!has('lens')) return;
          const p = local(e);
          lenses.set(pid, { x: p.x, y: p.y, on: true }); drawLenses();
          const now = performance.now(); if (now - last > 50) { last = now; send({ t: 'lens', x: Math.round(p.x), y: Math.round(p.y), on: true }); }
        };
        svg.addEventListener('pointermove', move);
        svg.addEventListener('pointerdown', move);
        svg.addEventListener('pointerleave', () => { lenses.set(pid, { x: 0, y: 0, on: false }); drawLenses(); send({ t: 'lens', x: 0, y: 0, on: false }); });
        drawLenses();
      },
      update(el) {
        $('#lensHint', el).textContent = has('lens') ? '🔴 Move your red lens over the scribbles to see through the ink!' : solved('door') ? '' : 'If only you had something red to look through…';
      },
    },

    door: {
      title: 'The workshop door',
      build: () => `<div class="mrow"><div class="mcol" id="doorCol"></div>
        <svg viewBox="0 0 260 420" style="width:250px;flex:none;filter:drop-shadow(0 20px 30px #0008)"><rect x="10" y="10" width="240" height="400" rx="10" fill="url(#gWood)"/><rect x="34" y="34" width="192" height="150" rx="8" fill="none" stroke="#3e2211" stroke-width="7"/><rect x="34" y="210" width="192" height="176" rx="8" fill="none" stroke="#3e2211" stroke-width="7"/><text x="130" y="100" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="19" fill="#f2d8a8">Only my</text><text x="130" y="126" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="19" fill="#f2d8a8">favourite spice</text><text x="130" y="152" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="19" fill="#f2d8a8">may enter.</text><circle cx="214" cy="300" r="12" fill="url(#gBrass)"/></svg></div>`,
      update(el) {
        const col = $('#doorCol', el);
        if (solved('door')) {
          if (col.dataset.state === 'done') return; col.dataset.state = 'done';
          col.innerHTML = `${banner('The lock clicks open!')}<p class="lede" style="margin-top:20px">A warm smell of sawdust and cinnamon drifts out of Grandpa's workshop.</p><button class="btn gold" id="goWs">Go into the workshop →</button>`;
          $('#goWs', col).onclick = () => { closeModal(); goScene('workshop'); };
          return;
        }
        if (col.dataset.state !== 'lock') {
          col.dataset.state = 'lock';
          col.innerHTML = `<p class="lede">A heavy oak door with <b>two locks</b>: a keyhole, and a brass lock of eight letter tiles. Carved into the wood: <i>"Only my favourite spice may enter."</i></p><div class="keystate" id="keyState"></div>${wordHtml(8)}<button class="btn gold" id="tryDoor">Turn the key and speak the word</button>`;
          const get = wordInputs(col, 8, (w) => act({ a: 'door', word: w }));
          $('#tryDoor', col).onclick = () => act({ a: 'door', word: get() });
        }
        $('#keyState', col).innerHTML = has('doorKey') ? `${ART.icon.doorKey}<span>The brass door key from your satchel fits the keyhole!</span>` : `<span class="lockicon">🔒</span><span>Keyhole: locked. You need a key.</span>`;
      },
    },

    bells: {
      title: 'The bell rack',
      build: () => `<div class="bellwrap">
        <svg class="bells-svg" viewBox="0 0 760 470">
          <rect x="20" y="30" width="720" height="26" rx="8" fill="url(#gWood)"/><rect x="30" y="30" width="20" height="300" fill="url(#gWoodDark)"/><rect x="710" y="30" width="20" height="300" fill="url(#gWoodDark)"/>
          ${BELLS.map((c, i) => `<g transform="translate(${110 + i * 135} 56)"><line x1="0" y1="0" x2="0" y2="40" stroke="#3a2111" stroke-width="4"/><g class="bellhit" data-c="${c}" transform="translate(0 112)"><g id="mb-${c}" class="bell-swing">${ART.bellShape(c)}</g></g></g>`).join('')}
          <g transform="translate(380 390)">
            <rect x="-120" y="0" width="240" height="64" rx="8" fill="#7a2030"/><rect x="-120" y="0" width="240" height="64" rx="8" fill="url(#gShade)" opacity=".4"/>
            <g id="mbGear" style="display:none" transform="translate(0 -40)"><circle r="60" fill="url(#gWarm)"/><g class="spin-slow" style="animation-duration:8s">${ART.gear(30, 12, 'url(#gBrass)')}</g></g>
            <g id="mbLid" class="lid"><rect x="-128" y="-24" width="256" height="28" rx="7" fill="#922538"/><rect x="-20" y="-20" width="40" height="16" rx="3" fill="url(#gBrass)"/></g>
            <path d="M-90 32 h180" stroke="url(#gBrass)" stroke-width="4"/>
          </g>
        </svg>
        <div class="side">
          <div class="staff"><h4>Melody so far</h4><div class="notes" id="seq"></div><button class="btn ghost small" id="clearBells" style="margin-top:10px;color:#7a1222;box-shadow:inset 0 0 0 1.5px #c9b48c">Start again</button></div>
          <div class="pieces" id="myPieces"></div>
        </div></div>`,
      bind(el) {
        $$('.bellhit', el).forEach((b) => (b.onclick = () => { const c = b.dataset.c; SFX.bell(c); ringSceneBell(c); act({ a: 'bell', c }); }));
        $('#clearBells', el).onclick = () => { SFX.click(); act({ a: 'clearBells' }); };
      },
      update(el) {
        const g = S.game;
        $('#seq', el).innerHTML = g.solved.bells ? '<b style="color:#1f7a4f">♪ The melody is complete!</b>' : (g.pz.bellSeq.length ? g.pz.bellSeq.map((c) => `<div class="note" style="background:${HEX[c]}"></div>`).join('') + `<span style="opacity:.6;margin-left:6px">${g.pz.bellSeq.length} / 8</span>` : '<span style="opacity:.6">Ring 8 bells…</span>');
        $('#clearBells', el).hidden = !!g.solved.bells;
        $('#mbLid', el).classList.toggle('open', !!g.solved.bells);
        $('#mbGear', el).style.display = g.solved.bells ? '' : 'none';
        $('#myPieces', el).innerHTML = g.solved.bells ? foundBox('brassGear', 'The music box opened! Inside was <b>a brass gear</b>.') : piecesHtml();
      },
    },

    pocket: {
      title: 'Your pocket',
      build: () => `<p class="lede">Grandpa's melody for the bell rack was torn into four pieces, and they've been shared out between everyone in the room. Read yours out loud, and listen for the others!</p><div id="pocketBody" style="max-width:560px"></div>`,
      update(el) { $('#pocketBody', el).innerHTML = piecesHtml(true); },
    },

    tiles: {
      title: 'The scrambled painting',
      build: () => `<div class="mrow"><div class="tiles" id="tiles">${Array.from({ length: 9 }, (_, i) => { const c = i % 3, r = Math.floor(i / 3); return `<button data-i="${i}" aria-label="Tile ${i + 1}"><svg viewBox="${c * 200} ${r * 200} 200 200"><use href="#paintingSym" width="600" height="600"/></svg></button>`; }).join('')}</div>
        <div class="mcol" id="tilesCol"></div></div>`,
      bind(el) { $$('#tiles button', el).forEach((b) => (b.onclick = () => { if (solved('tiles')) return; SFX.tick(); act({ a: 'tile', i: +b.dataset.i }); })); tileLast = null; },
      update(el) {
        const rots = S.game.pz.tiles;
        if (!tileLast) { rots.forEach((r, i) => (tileCum[i] = r)); }
        else rots.forEach((r, i) => { tileCum[i] += (r - tileLast[i] + 4) % 4; });
        tileLast = rots.slice();
        $$('#tiles button svg', el).forEach((s, i) => (s.style.transform = `rotate(${tileCum[i] * 90}deg)`));
        const done = solved('tiles');
        $('#tiles', el).classList.toggle('done', done);
        const col = $('#tilesCol', el);
        if (done) { if (col.dataset.state !== 'done') { col.dataset.state = 'done'; col.innerHTML = `${banner('The picture is whole again!')}<p class="lede" style="margin-top:18px">Grandpa's painting of the village on Christmas Eve. Two things to remember: <b>what the banner says</b>, and <b>the time on the village clock</b>.</p>`; } }
        else if (col.dataset.state !== 'play') { col.dataset.state = 'play'; col.innerHTML = '<p class="lede">Someone has twisted the squares of Grandpa\'s favourite painting. Click a square to turn it. Everyone can help at once!</p><p class="muted">Tip: look for the moon, the bunting, the snowman and the banner at the bottom.</p>'; }
      },
    },

    ledger: {
      title: "The elves' toy ledger",
      build: () => `<div class="book">
        <div class="pg"><h4>Christmas Eve</h4>
          <p style="margin-top:0">Four elves each made one toy for the sleigh. I locked the toys away, and set the cabinet's dials so each elf matches the toy they made. —T.</p>
          <ol id="lclues"></ol><p class="splitnote" id="lnote"></p></div>
        <div class="pg"><h4>Working out</h4><p class="muted" style="color:#7a6a58;margin:0 0 12px;font-size:17px">Tap a box for ✗, tap again for ✓. Everyone shares this page.</p>
          <div class="grid" id="lgrid"><div></div>${TOYS.map((t) => `<div class="h" title="${ART.toyName[t]}">${ART.toy[t]}</div>`).join('')}
            ${ELVES.map((e, r) => `<div class="rh">${e}</div>${TOYS.map((t, c) => `<button data-i="${r * 4 + c}" aria-label="${e} made the ${ART.toyName[t]}"></button>`).join('')}`).join('')}</div></div></div>`,
      bind(el) { $$('#lgrid button', el).forEach((b) => (b.onclick = () => { SFX.tick(); act({ a: 'grid', i: +b.dataset.i }); })); },
      update(el) {
        $$('#lgrid button', el).forEach((b, i) => { const v = S.game.pz.grid[i]; b.textContent = ['', '✗', '✓'][v]; b.classList.toggle('yes', v === 2); });
        // The page got smudged: each player can read different clues.
        const sh = myShare(LEDGER_CLUES.length);
        const html = LEDGER_CLUES.map((c, i) => sh.mine[i] ? `<li>${esc(c)}</li>` : '<li class="smudge">Smudged on your page. Ask the others!</li>').join('');
        if ($('#lclues', el).innerHTML !== html) $('#lclues', el).innerHTML = html;
        $('#lnote', el).textContent = sh.n > 1 ? '🧩 Everyone can read different clues. Read yours out loud!' : '';
      },
    },

    cabinet: {
      title: 'The toy cabinet',
      build: () => '<div id="cabBody"></div>',
      update(el) {
        const body = $('#cabBody', el);
        if (solved('cabinet')) {
          if (body.dataset.state === 'done') return; body.dataset.state = 'done';
          body.innerHTML = `${banner('Click! The cabinet swings open.')}${foundBox('starKey', 'A <b>star-shaped key</b> drops out! There\'s a star-shaped keyhole on the hatch in the ceiling…')}`;
          return;
        }
        if (body.dataset.state !== 'lock') {
          body.dataset.state = 'lock';
          body.innerHTML = `<p class="lede">A glass-fronted cabinet full of toys. Four brass dials sit under four name plates. A note reads: <i>"Set each elf to the toy they made."</i></p>
            <div class="cab">${ELVES.map((e, i) => `<div class="dial"><button data-i="${i}" data-d="1">▲</button><div class="face" id="cf${i}"></div><button data-i="${i}" data-d="-1">▼</button><div class="plate">${e}</div><div class="toyname" id="cn${i}"></div></div>`).join('')}</div>
            <div style="text-align:center"><button class="btn gold" id="pull">Pull the handle</button></div>`;
          $$('.cab .dial button', body).forEach((b) => (b.onclick = () => { SFX.tick(); act({ a: 'dial', i: +b.dataset.i, d: +b.dataset.d }); }));
          $('#pull', body).onclick = () => act({ a: 'cabinet' });
        }
        S.game.pz.dials.forEach((d, i) => { const f = $('#cf' + i, body); const t = TOYS[d]; if (f.dataset.t !== t) { f.dataset.t = t; f.innerHTML = ART.toy[t]; $('#cn' + i, body).textContent = ART.toyName[t]; } });
      },
    },

    gears: {
      title: 'The clock mechanism',
      build: () => `<div class="mrow"><svg viewBox="0 0 640 420" style="width:640px;flex:none" id="mechSvg">
          <rect x="0" y="0" width="640" height="420" rx="18" fill="#0f1422"/><rect x="0" y="0" width="640" height="420" rx="18" fill="url(#gCool)" opacity=".15"/>
          <g transform="translate(110 250)"><g class="spin-slow mech" style="animation-duration:14s">${ART.gear(80, 16, 'url(#gBrass)')}</g></g>
          ${[[290, 170, 78, 'Large spindle', 'url(#gBrass)', 15], [452, 258, 56, 'Middle spindle', 'url(#gSilver)', 11], [566, 128, 42, 'Small spindle', 'url(#gCopper)', 9]].map(([x, y, r, lbl, fill, teeth], i) => `
          <g class="slot" data-i="${i}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="${r + 14}" fill="#ffffff08" stroke="#ffffff40" stroke-width="3" stroke-dasharray="10 8"/><circle cx="${x}" cy="${y}" r="10" fill="#666"/><text x="${x}" y="${y + r + 46}" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="19" fill="#a9b6d3" class="slotlbl">${lbl}</text>
            <g class="placed" style="display:none" transform="translate(${x} ${y})"><g class="spin-slow ${i % 2 ? 'mech' : 'mech-r'}" style="animation-duration:${8 - i * 2}s">${ART.gear(r * 0.8, teeth, fill)}</g></g></g>`).join('')}
        </svg><div class="mcol" id="mechCol"></div></div>`,
      bind(el) { $$('#mechSvg .slot', el).forEach((s) => (s.onclick = () => act({ a: 'gear', i: +s.dataset.i }))); },
      update(el) {
        const g = S.game;
        $$('#mechSvg .slot', el).forEach((s, i) => { $('.placed', s).style.display = g.pz.gears[i] ? '' : 'none'; $('.slotlbl', s).style.display = g.pz.gears[i] ? 'none' : ''; });
        $('#mechSvg', el).classList.toggle('ticking', !!g.solved.gears);
        const left = 3 - g.pz.gears.filter(Boolean).length;
        $('#mechCol', el).innerHTML = g.solved.gears ? `${banner('Tick… tock… tick… tock!')}<p class="lede" style="margin-top:18px">The Great Clock shudders back to life! But its hands won't move to midnight until someone speaks the word on the brass plaque.</p>`
          : `<p class="lede">Behind the glass, Grandpa's clockwork is still. ${left === 1 ? 'One spindle stands' : `${left} spindles stand`} empty: brass, silver and copper.</p><p class="muted">${has('brassGear') || has('silverGear') || has('copperGear') ? 'Click an empty spindle to fit a gear from your satchel.' : 'You need to find the gears that go here.'}</p>`;
      },
    },

    cards: {
      title: 'The Christmas cards',
      build: () => `<div class="mrow" style="align-items:flex-start"><div class="cards" id="cards">${Array.from({ length: 16 }, (_, i) => `<button class="card" data-i="${i}" aria-label="Card ${i + 1}"><span class="cin"><span class="cback"></span><span class="cface"><svg viewBox="0 0 100 100"></svg></span></span></button>`).join('')}</div>
        <div class="mcol" id="cardsCol"></div></div>`,
      bind(el) { $$('#cards .card', el).forEach((b) => (b.onclick = () => { SFX.flip(); act({ a: 'card', i: +b.dataset.i }); })); },
      update(el) {
        const mem = S.game.pz.mem;
        $$('#cards .card', el).forEach((b, i) => {
          const up = mem.up.includes(i) || mem.done.includes(i);
          b.classList.toggle('up', up); b.classList.toggle('done', mem.done.includes(i));
          const face = $('.cface svg', b); const want = up ? mem.deck[i] : '';
          if (face.dataset.icon !== want) { face.dataset.icon = want; if (want) face.innerHTML = ART.card[want]; }
        });
        const col = $('#cardsCol', el);
        const pairs = mem.done.length / 2;
        if (solved('memory')) { if (col.dataset.state !== 'done') { col.dataset.state = 'done'; col.innerHTML = `${banner('All eight pairs!')}${foundBox('doorKey', 'Behind the last card hangs <b>a brass door key</b>. It must fit the workshop door!')}`; } }
        else { col.dataset.state = 'play'; col.innerHTML = `<p class="lede">Grandpa's Christmas cards, all face down. Turn over two at a time to find matching pairs. Everyone can play!</p><p class="pairs"><b>${pairs}</b> of 8 pairs found</p>`; }
      },
    },

    album: {
      title: "Grandpa's photo album",
      build: () => `<p class="lede" style="margin-bottom:14px">Two photos of the cottage from two different Christmases. They look the same… but there are <b>5 differences</b>. Click on a difference in either photo.</p>
        <div class="album"><svg class="photo" id="phA" viewBox="0 0 440 320">${ART.photo(false)}<g class="marks"></g></svg><svg class="photo" id="phB" viewBox="0 0 440 320">${ART.photo(true)}<g class="marks"></g></svg></div>
        <div id="albumCol" style="margin-top:16px"></div>`,
      bind(el) {
        $$('.photo', el).forEach((svg) => svg.addEventListener('click', (e) => {
          if (solved('spot')) return;
          const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse());
          const hit = ART.SPOTS.findIndex(([x, y, r]) => Math.hypot(p.x - x, p.y - y) <= r);
          if (hit >= 0 && !S.game.pz.spot[hit]) act({ a: 'spot', i: hit });
          else if (hit < 0) { SFX.click(); const miss = document.createElementNS('http://www.w3.org/2000/svg', 'text'); miss.setAttribute('x', p.x); miss.setAttribute('y', p.y + 10); miss.setAttribute('class', 'miss'); miss.textContent = '✗'; $('.marks', svg).append(miss); setTimeout(() => miss.remove(), 700); }
        }));
      },
      update(el) {
        const found = S.game.pz.spot;
        $$('.photo .marks', el).forEach((g) => { g.querySelectorAll('.ring').forEach((r) => r.remove()); found.forEach((f, i) => { if (!f) return; const [x, y, r] = ART.SPOTS[i]; g.insertAdjacentHTML('beforeend', `<circle class="ring" cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#2fae6b" stroke-width="5"/>`); }); });
        const n = found.filter(Boolean).length;
        const col = $('#albumCol', el);
        col.innerHTML = solved('spot') ? `<div class="mrow">${banner('All five found!')}${foundBox('silverGear', 'A <b>silver gear</b> slides out of the album\'s spine!')}</div>` : `<p class="pairs"><b>${n}</b> of 5 differences found</p>`;
      },
    },

    watch: {
      title: "Grandpa's pocket watch",
      build: () => `<div class="mrow"><svg viewBox="-200 -230 400 440" style="width:430px;flex:none" id="watchSvg"></svg>
        <div class="mcol" id="watchCol"></div></div>`,
      update(el) {
        const w = S.game.pz.watch;
        $('#watchSvg', el).innerHTML = ART.watch(w.h, w.m);
        const col = $('#watchCol', el);
        if (solved('watch')) { if (col.dataset.state !== 'done') { col.dataset.state = 'done'; col.innerHTML = `${banner('Click! The lid springs open.')}${foundBox('copperGear', 'Inside the watch: <b>a copper gear</b>!')}`; } return; }
        if (col.dataset.state === 'play') return;
        col.dataset.state = 'play';
        col.innerHTML = `<p class="lede">Grandpa's gold pocket watch, stopped. Engraved on the back: <i>"Set me by the village clock, and I'll open for you."</i></p>
          <div class="watchctl"><div><span>Hour hand</span><button class="btn ghost small" data-w="watchH" data-d="-1">◀</button><button class="btn ghost small" data-w="watchH" data-d="1">▶</button></div>
          <div><span>Minute hand</span><button class="btn ghost small" data-w="watchM" data-d="-1">◀</button><button class="btn ghost small" data-w="watchM" data-d="1">▶</button></div></div>
          <button class="btn gold" id="openWatch">Open the watch</button>`;
        $$('[data-w]', col).forEach((b) => (b.onclick = () => { SFX.tick(); act({ a: b.dataset.w, d: +b.dataset.d }); }));
        $('#openWatch', col).onclick = () => act({ a: 'openWatch' });
      },
    },

    wheel: {
      title: 'The cipher wheel',
      build() {
        const outer = Array.from({ length: 26 }, (_, i) => { const a = i / 26 * Math.PI * 2; return `<text x="${(300 + Math.sin(a) * 258).toFixed(1)}" y="${(300 - Math.cos(a) * 258 + 11).toFixed(1)}" text-anchor="middle" font-family="Fraunces, serif" font-size="30" font-weight="900" fill="#4a3210">${String.fromCharCode(65 + i)}</text>`; }).join('');
        const inner = Array.from({ length: 26 }, (_, i) => { const a = i / 26 * Math.PI * 2; return `<text x="${(300 + Math.sin(a) * 200).toFixed(1)}" y="${(300 - Math.cos(a) * 200 + 10).toFixed(1)}" text-anchor="middle" font-family="Fraunces, serif" font-size="27" font-weight="800" fill="#1d2233" transform="rotate(${(i / 26 * 360).toFixed(1)} ${(300 + Math.sin(a) * 200).toFixed(1)} ${(300 - Math.cos(a) * 200).toFixed(1)})">${String.fromCharCode(65 + i)}</text>`; }).join('');
        const ticks = Array.from({ length: 26 }, (_, i) => { const a = (i + .5) / 26 * 360; return `<line x1="300" y1="72" x2="300" y2="58" stroke="#8a6420" stroke-width="2" transform="rotate(${a} 300 300)"/>`; }).join('');
        return `<div class="mrow"><svg class="wheel-svg" viewBox="0 0 600 600">
          <circle cx="300" cy="300" r="296" fill="url(#gBrass)" stroke="#7a5418" stroke-width="5"/>${ticks}${outer}
          <g class="wheel-inner" id="winner"><circle cx="300" cy="300" r="228" fill="#f7eedc" stroke="#8a6420" stroke-width="5"/>${inner}
            <circle cx="300" cy="300" r="164" fill="#2b2f45"/>
            <path transform="translate(300 128) scale(.9)" d="M0 -26 L7 -8 L26 -8 L11 4 L16 23 L0 12 L-16 23 L-11 4 L-26 -8 L-7 -8Z" fill="#ffd45c" stroke="#c48b16" stroke-width="2"/>
            ${Array.from({ length: 6 }, (_, i) => `<path d="M300 300 L300 156" stroke="#ffffff18" stroke-width="2" transform="rotate(${i * 60} 300 300)"/>`).join('')}
          </g>
          <circle cx="300" cy="300" r="30" fill="url(#gBrass)"/></svg>
          <div class="mcol"><p class="lede">An outer ring of brass letters, and an inner ring that turns. The inner <b>A</b> is marked with a gold star ★.</p>
            <div style="display:flex;gap:16px;margin-bottom:24px"><button class="btn gold" data-d="-1">⟲ Turn</button><button class="btn gold" data-d="1">Turn ⟳</button></div>
            <p class="lede" id="wheelRead"></p></div></div>`;
      },
      bind(el) { $$('[data-d]', el).forEach((b) => (b.onclick = () => { SFX.tick(); act({ a: 'wheel', d: +b.dataset.d }); })); wheelLast = null; },
      update(el) {
        const w = S.game.pz.wheel;
        if (wheelLast === null) wheelCum = w; else { let d = (w - wheelLast + 26) % 26; if (d > 13) d -= 26; wheelCum += d; }
        wheelLast = w;
        $('#winner', el).style.transform = `rotate(${wheelCum * 360 / 26}deg)`;
        $('#wheelRead', el).innerHTML = `The star ★ is under <b style="color:#ffd98a;font-size:34px;font-family:var(--display)">${String.fromCharCode(65 + w)}</b>`;
      },
    },

    final: {
      title: 'The engraved plaque',
      build: () => `<p class="lede">A brass plaque below the Great Clock. The engraving is in some kind of code…</p>
        <div class="engraving" id="engr"></div><p class="splitnote" id="engrNote" style="text-align:center"></p>
        <div id="finalBody" style="margin-top:20px"></div>`,
      update(el) {
        // Frost covers the plaque: each player can make out different letters.
        const sh = myShare(ENGRAVING.length);
        const ehtml = ENGRAVING.split('').map((c, i) => sh.mine[i] || solved('final') ? `<span>${c}</span>` : '<span class="frost">❄</span>').join('');
        if ($('#engr', el).innerHTML !== ehtml) $('#engr', el).innerHTML = ehtml;
        $('#engrNote', el).textContent = sh.n > 1 && !solved('final') ? '🧩 Frost covers the plaque, and everyone can make out different letters. Put them together!' : '';
        const body = $('#finalBody', el);
        if (solved('final')) { body.innerHTML = banner('BONG! The clock strikes midnight!'); return; }
        if (!solved('gears')) { if (body.dataset.state !== 'wait') { body.dataset.state = 'wait'; body.innerHTML = '<p class="muted" style="font-size:22px">Underneath it says: <i>"Speak my word when my heart is ticking."</i> The clock is silent. Its insides must be broken.</p>'; } return; }
        if (body.dataset.state === 'word') return; body.dataset.state = 'word';
        body.innerHTML = `<p class="lede">The clock is ticking now. Underneath the code: <i>"Speak my word when my heart is ticking."</i></p>${wordHtml(8)}<button class="btn" id="tryFinal">Speak to the clock</button>`;
        const get = wordInputs(body, 8, (w) => act({ a: 'final', word: w }));
        $('#tryFinal', body).onclick = () => act({ a: 'final', word: get() });
      },
    },

    telescope: {
      title: 'The telescope',
      build: () => `<div class="mrow"><svg viewBox="0 0 400 400" style="width:380px;flex:none"><defs><clipPath id="tsc"><circle cx="200" cy="200" r="180"/></clipPath></defs><g clip-path="url(#tsc)"><rect width="400" height="400" fill="url(#gSky)"/>${Array.from({ length: 60 }, (_, i) => `<circle class="twinkle" cx="${(i * 97) % 400}" cy="${(i * 53) % 260}" r="${1 + (i % 3) * .6}" fill="#fff" style="animation-delay:${(i % 7) * .4}s"/>`).join('')}<path d="M0 300 Q120 250 220 280 T400 270 V400 H0Z" fill="#c9daf2"/><g fill="#2c3550"><rect x="60" y="290" width="40" height="30"/><rect x="250" y="280" width="50" height="34"/></g><rect x="70" y="298" width="8" height="8" fill="#ffd27a"/><rect x="262" y="290" width="10" height="10" fill="#ffd27a"/><circle cx="160" cy="306" r="5" fill="#ffd27a" class="twinkle"/></g><circle cx="200" cy="200" r="180" fill="none" stroke="url(#gBrass)" stroke-width="18"/></svg>
        <div class="mcol"><p class="lede">Far below, the village sleeps under the snow. Down on the lane, a tiny lantern bobs along through the drifts.</p><p class="lede">Grandpa Tobias is on his way home! Better have that clock ticking by the time he gets here.</p></div></div>`,
    },
  };

  function piecesHtml(big) {
    const sh = myShare(FRAGS.length), n = sh.n;
    const mine = FRAGS.filter((_, i) => sh.mine[i]);
    const others = n > 1 ? `<p class="muted">${n === 2 ? 'The other player has' : `The other ${n - 1} players have`} the rest. Ask them!</p>` : '<p class="muted">You\'re playing solo, so you hold every piece.</p>';
    return `<h4 style="${big ? 'color:var(--gold-soft)' : ''}">Your torn pieces</h4>` + (mine.length ? mine.map((f) => `<div class="scrap"><span class="flakes">${'❄'.repeat(f.n)}</span>${f.notes.map((c) => `<div class="note" style="background:${HEX[c]}"></div>`).join('')}</div>`).join('') : '<p class="muted">You have no pieces. The others have them all!</p>') + others;
  }

  function drawLenses() {
    const clip = $('#lensClip'), rings = $('#lensRings'); if (!clip || !rings) return;
    let c = '', r = '';
    for (const [id, l] of lenses) {
      if (!l.on) continue;
      const p = playerById(id); if (!p) continue;
      c += `<circle cx="${l.x}" cy="${l.y}" r="54"/>`;
      r += `<circle cx="${l.x}" cy="${l.y}" r="56" fill="none" stroke="url(#gBrass)" stroke-width="7"/><circle cx="${l.x}" cy="${l.y}" r="60" fill="none" stroke="${p.color}" stroke-width="2"/>`;
    }
    clip.innerHTML = c; rings.innerHTML = r;
  }

  // ---------- FINALE & VICTORY ----------
  function runFinale() {
    if (finaleRunning) return;
    finaleRunning = true;
    closeModal();
    $$('.panel').forEach((p) => p.classList.remove('on'));
    goScene('attic');
    applySceneState();
    setTimeout(() => {
      SFX.fanfare();
      const st = $('#stage'); if (!st) return;
      const fl = h('<div class="flash"></div>'); st.append(fl); setTimeout(() => fl.remove(), 2500);
      let n = 0; const iv = setInterval(() => { sparkles(800, 352, 30); if (++n >= 6) clearInterval(iv); }, 600);
    }, 900);
    setTimeout(() => { showVictory(); }, 8200);
  }

  function showVictory() {
    if (screen === 'victory') return updateVictory();
    screen = 'victory';
    document.body.classList.remove('in-game');
    const el = h(`<div class="victory"><canvas id="fw"></canvas><div class="v-grandpa walking">${ART.grandpa}</div><div class="card">
      <div class="kicker">The Great Clock strikes midnight</div>
      <h1 class="title">Merry Christmas!</h1>
      <p class="tagline" style="margin-bottom:6px">You saved Christmas morning! Grandpa Tobias stamps the snow off his boots, sees the clock ticking, and laughs: "I knew you could do it, <i>together</i>."</p>
      <div class="stats" id="vstats"></div>
      <div class="players" id="vplayers" style="justify-content:center"></div>
      <div class="row" style="justify-content:center;margin-top:8px"><button class="btn gold" id="again">Play again</button></div>
    </div></div>`);
    $('#app').append(el);
    $('#again').onclick = () => { if (confirm('Reset the room so everyone can play again from the start?')) send({ t: 'reset' }); };
    fireworks($('#fw'));
    setTimeout(() => { const gp = $('.v-grandpa'); if (gp) gp.classList.remove('walking'); }, 2300);
    updateVictory();
  }
  function updateVictory() {
    if (!S || !S.finishedAt) { screen = null; return route(); }
    const hints = Object.values(S.game.hints).reduce((a, b) => a + b, 0);
    const t = S.finishedAt - S.startedAt;
    const vs = $('#vstats'); if (!vs) return;
    vs.innerHTML = `<div class="stat"><b>${fmt(t)}</b><span>Escape time</span></div><div class="stat"><b>${hints}</b><span>Hints from Elsie</span></div><div class="stat"><b>${t < GAME_MS ? fmt(GAME_MS - t) : '0:00'}</b><span>To spare</span></div><div class="stat"><b>${(S.game.mice || []).filter(Boolean).length}/9</b><span>Mice found</span></div>`;
    $('#vplayers').innerHTML = S.players.slice().sort((a, b) => a.order - b.order).map((p) => `<div class="pchip">${avatar(p)}${esc(p.name)}</div>`).join('');
  }
  function fireworks(c) {
    const x = c.getContext('2d'); let W, H; const parts = [];
    const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; }; resize(); addEventListener('resize', resize);
    const COLS = ['#ffd45c', '#ff5a6e', '#7fd6ff', '#8ff0b9', '#ffffff', '#c89bff'];
    let last = 0;
    (function loop(t) {
      if (!document.body.contains(c)) return;
      if (t - last > 700) {
        last = t; const cx = W * (0.15 + Math.random() * 0.7), cy = H * (0.12 + Math.random() * 0.35), col = COLS[Math.floor(Math.random() * COLS.length)];
        for (let i = 0; i < 70; i++) { const a = Math.random() * 6.283, s = 1 + Math.random() * 4; parts.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 1, c: col }); }
      }
      x.globalCompositeOperation = 'destination-out'; x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = 'lighter';
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.vx *= 0.985; p.vy *= 0.985; p.l -= 0.012;
        if (p.l <= 0) { parts.splice(i, 1); continue; }
        x.globalAlpha = p.l; x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, 2.2, 0, 6.283); x.fill();
      }
      x.globalAlpha = 1;
      requestAnimationFrame(loop);
    })(0);
  }

  // Keep free hosting awake while a room is open (a tiny request every 4 minutes).
  setInterval(() => { if (S) fetch('/health', { cache: 'no-store' }).catch(() => {}); }, 4 * 60 * 1000);

  // ---------- boot ----------
  // Phones and tablets only allow sound after a tap, so wake the audio on the first touch.
  ['touchend', 'pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, () => SFX.unlock(), { passive: true }));
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {} // iPhone: play even with the silent switch on
  connect();
  const params = new URLSearchParams(location.search);
  const urlRoom = (params.get('room') || '').toUpperCase();
  if (urlRoom && myName && store.get('mw-room', '') === urlRoom) {
    // returning player on the same device: drop straight back in
    joinMsg = { t: 'join', code: urlRoom, name: myName, pid };
    $('#app').innerHTML = '<div class="landing">' + ART.landing() + '</div>';
    screen = 'loading';
    setTimeout(() => { if (!S) showLanding(); }, 4000);
  } else showLanding();
  window.__mw = { get S() { return S; }, get scene() { return scene; }, get view() { return view; }, openModal, goScene, act };
})();
