// The Midnight Workshop: tiny static + WebSocket server.
// Run:  npm install && npm start   (then open http://localhost:3000)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const { PUZZLES, freshGame, act } = require('./puzzles');

const PORT = process.env.PORT || 3000;
const PUB = path.join(__dirname, 'public');
const SAVE = process.env.SAVE_FILE || path.join(__dirname, '.rooms.json');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
};

const server = http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); return res.end(); }
  if (p === '/health') { res.writeHead(200); return res.end('ok'); }
  if (p === '/' || !path.extname(p)) p = '/index.html';
  const f = path.normalize(path.join(PUB, p));
  if (!f.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(d);
  });
});

// ---------- rooms ----------
const COLORS = ['#e8414f', '#f4b63f', '#3fb27f', '#4f9bf0', '#b36bf0', '#f07fb6', '#43c6c9', '#f08a3f'];
const CODE_CHARS = 'BCDFGHJKLMNPQRSTVWXZ';
const rooms = new Map(); // code -> room
const sockets = new Map(); // code -> Set(ws)

function newCode() {
  let c;
  do { c = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join(''); } while (rooms.has(c));
  return c;
}
function newRoom() {
  const code = newCode();
  const room = { code, created: Date.now(), startedAt: null, finishedAt: null, players: {}, order: 0, game: freshGame(), log: [], chat: [], touched: Date.now() };
  rooms.set(code, room);
  return room;
}
function publicState(room) {
  return {
    code: room.code, startedAt: room.startedAt, finishedAt: room.finishedAt, now: Date.now(),
    players: Object.values(room.players).map(({ id, name, color, order, online, scene, view }) => ({ id, name, color, order, online, scene, view })),
    game: room.game, log: room.log.slice(-40), chat: room.chat.slice(-40), puzzles: PUZZLES,
  };
}
function send(ws, msg) { if (ws.readyState === 1) ws.send(JSON.stringify(msg)); }
function broadcast(code, msg, except) {
  const set = sockets.get(code); if (!set) return;
  const s = JSON.stringify(msg);
  for (const ws of set) if (ws !== except && ws.readyState === 1) ws.send(s);
}
let saveTimer = null;
function pushState(room) {
  room.touched = Date.now();
  broadcast(room.code, { t: 'state', s: publicState(room) });
  clearTimeout(saveTimer); saveTimer = setTimeout(saveRooms, 1500);
}
function addLog(room, text) { if (text) room.log.push({ t: Date.now(), text }); if (room.log.length > 200) room.log.splice(0, 100); }
const clip = (s, n) => String(s || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, n);

function saveRooms() {
  try {
    const data = [...rooms.values()].map((r) => ({ ...r, players: Object.fromEntries(Object.entries(r.players).map(([k, p]) => [k, { ...p, online: false }])) }));
    fs.writeFileSync(SAVE, JSON.stringify(data));
  } catch (e) { /* saving is best-effort */ }
}
function loadRooms() {
  try {
    for (const r of JSON.parse(fs.readFileSync(SAVE, 'utf8'))) rooms.set(r.code, r);
    console.log(`Restored ${rooms.size} room(s).`);
  } catch { /* no save yet */ }
}
loadRooms();
// Forget rooms nobody has touched for 3 days.
setInterval(() => {
  const cutoff = Date.now() - 3 * 864e5;
  for (const [c, r] of rooms) if (r.touched < cutoff && !(sockets.get(c) || new Set()).size) rooms.delete(c);
}, 36e5);

// ---------- websocket ----------
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 8 * 1024 });

wss.on('connection', (ws) => {
  ws.alive = true;
  ws.on('pong', () => { ws.alive = true; });
  let room = null, player = null, lastCur = 0, msgs = 0;
  const rate = setInterval(() => { msgs = 0; }, 1000);

  ws.on('message', (raw) => {
    if (++msgs > 80) return; // flood guard
    let m; try { m = JSON.parse(raw); } catch { return; }

    if (m.t === 'create' || m.t === 'join') {
      if (room) return;
      const name = clip(m.name, 18) || 'Elf';
      const pid = clip(m.pid, 40) || Math.random().toString(36).slice(2);
      if (m.t === 'create') room = newRoom();
      else {
        room = rooms.get(clip(m.code, 8).toUpperCase());
        if (!room) { room = null; return send(ws, { t: 'err', msg: "We couldn't find that room code. Check it and try again." }); }
      }
      player = room.players[pid];
      if (!player) {
        if (Object.keys(room.players).length >= 12) { room = null; return send(ws, { t: 'err', msg: 'That room is full (12 players).' }); }
        player = room.players[pid] = { id: pid, name, color: COLORS[room.order % COLORS.length], order: room.order++, scene: 'parlour', view: null };
        addLog(room, `${name} joined the room.`);
      } else player.name = name;
      player.online = true;
      ws.pid = pid;
      if (!sockets.has(room.code)) sockets.set(room.code, new Set());
      sockets.get(room.code).add(ws);
      send(ws, { t: 'joined', you: pid, code: room.code });
      return pushState(room);
    }
    if (!room || !player) return;

    switch (m.t) {
      case 'start':
        if (!room.startedAt) { room.startedAt = Date.now(); addLog(room, `${player.name} started the adventure. The clock is ticking!`); pushState(room); }
        break;
      case 'cur': {
        const now = Date.now(); if (now - lastCur < 30) return; lastCur = now;
        broadcast(room.code, { t: 'cur', id: player.id, x: +m.x || 0, y: +m.y || 0, s: clip(m.s, 12) }, ws);
        break;
      }
      case 'where': {
        const scene = clip(m.scene, 12);
        if (scene && room.game.scenes.includes(scene)) player.scene = scene;
        player.view = m.view ? clip(m.view, 12) : null;
        pushState(room);
        break;
      }
      case 'lens':
        broadcast(room.code, { t: 'lens', id: player.id, x: +m.x || 0, y: +m.y || 0, on: !!m.on }, ws);
        break;
      case 'ping':
        broadcast(room.code, { t: 'fx', fx: 'ping', x: +m.x || 0, y: +m.y || 0, s: clip(m.s, 12), e: clip(m.e, 4), by: player.id });
        break;
      case 'chat': {
        const text = clip(m.text, 200); if (!text) return;
        room.chat.push({ t: Date.now(), id: player.id, name: player.name, color: player.color, text });
        if (room.chat.length > 100) room.chat.splice(0, 50);
        pushState(room);
        broadcast(room.code, { t: 'fx', fx: 'chat', by: player.id });
        break;
      }
      case 'hint': {
        const pz = room.game.solved[m.p] ? null : PUZZLES.find((p) => p.id === m.p);
        if (!pz) return;
        const n = room.game.hints[pz.id] || 0;
        if (n >= pz.hints.length) return;
        room.game.hints[pz.id] = n + 1;
        addLog(room, `${player.name} asked Robin for a hint about ${pz.title.toLowerCase()}.`);
        pushState(room);
        broadcast(room.code, { t: 'fx', fx: 'hint', p: pz.id, by: player.id });
        break;
      }
      case 'act': {
        if (!room.startedAt || room.finishedAt) return;
        const out = act(room.game, player, m);
        if (out.err) send(ws, { t: 'toast', msg: out.err });
        addLog(room, out.log);
        if (room.game.solved.final && !room.finishedAt) room.finishedAt = Date.now();
        pushState(room);
        for (const fx of out.fx) broadcast(room.code, { t: 'fx', ...fx });
        if (out.later) {
          const g = room.game;
          setTimeout(() => { if (room.game !== g) return; act(g, player, out.later.m); pushState(room); }, out.later.ms);
        }
        break;
      }
      case 'reset': {
        room.game = freshGame(); room.startedAt = null; room.finishedAt = null; room.log = [];
        for (const p of Object.values(room.players)) { p.scene = 'parlour'; p.view = null; }
        addLog(room, `${player.name} reset the room for another go.`);
        pushState(room);
        broadcast(room.code, { t: 'fx', fx: 'reset' });
        break;
      }
    }
  });

  ws.on('close', () => {
    clearInterval(rate);
    if (!room || !player) return;
    const set = sockets.get(room.code); if (set) set.delete(ws);
    // Only mark offline if no other socket for this player remains.
    const stillHere = set && [...set].some((s) => s.pid === player.id);
    if (!stillHere) player.online = false;
    pushState(room);
  });
});

setInterval(() => {
  for (const ws of wss.clients) { if (!ws.alive) { ws.terminate(); continue; } ws.alive = false; ws.ping(); }
}, 25000);

process.on('SIGTERM', () => { saveRooms(); process.exit(0); });
process.on('SIGINT', () => { saveRooms(); process.exit(0); });

server.listen(PORT, () => console.log(`🎄 The Midnight Workshop is running on http://localhost:${PORT}`));
