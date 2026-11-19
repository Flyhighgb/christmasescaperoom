// Puzzle rules for "The Midnight Workshop".
// All answers are checked here on the server so every player shares one truth.

const BELLS = ['red', 'gold', 'green', 'blue', 'silver'];
const MELODY = ['blue', 'green', 'silver', 'blue', 'green', 'gold', 'red', 'gold'];
const CABINET = [2, 1, 0, 3]; // Pip=kite, Bramble=drum, Tansy=horse, Juniper=teddy
const PRESENT = '4253'; // red 4, gold 2, blue 5, purple 3
const DOOR_WORD = 'CINNAMON';
const FINAL_WORD = 'TOGETHER';
const TILE_START = [2, 1, 3, 1, 0, 2, 3, 3, 1];
const CARD_ICONS = ['star', 'bell', 'bauble', 'cane', 'snowman', 'gingerbread', 'stocking', 'holly'];
const SPOT_COUNT = 5;
const WATCH = { h: 7, m: 30 };
const GEAR_ITEMS = ['brassGear', 'silverGear', 'copperGear'];
const GEAR_NAMES = ['brass', 'silver', 'copper'];

// Which scene each puzzle lives in (an action only works once its scene is open).
const SCENE_OF = {
  present: 'parlour', memory: 'parlour', door: 'parlour',
  bells: 'workshop', tiles: 'workshop', spot: 'workshop', cabinet: 'workshop', hatch: 'workshop',
  watch: 'attic', gears: 'attic', final: 'attic',
};

const PUZZLES = [
  { id: 'present', scene: 'parlour', title: 'The locked present', hints: [
    'The gift tag on the present under the tree shows four coloured dots. Where else in the room do you see those colours?',
    'Count the round baubles on the Christmas tree, one colour at a time, in the same order as the dots on the tag.',
    'Red 4, Gold 2, Blue 5, Purple 3. The code is 4 2 5 3.' ] },
  { id: 'memory', scene: 'parlour', title: 'The Christmas cards', hints: [
    'Click the Christmas cards on the mantelpiece. Turn over two at a time and try to find matching pairs.',
    'Work as a team: one person calls out what a card shows, so everyone remembers where it is.',
    'Keep going until all eight pairs are matched. Grandpa hid the door key behind the last pair!' ] },
  { id: 'door', scene: 'parlour', title: 'The workshop door', hints: [
    "The door has two locks: a keyhole and a word lock. Read Grandpa's letter on the desk. The word is his favourite spice, hidden under red scribbles.",
    'The present gave you a red glass lens. Open the letter and move the lens over the scribbles. The key comes from the Christmas cards.',
    'The hidden word is CINNAMON. You also need the brass door key from the Christmas cards.' ] },
  { id: 'bells', scene: 'workshop', title: 'The bell melody', hints: [
    "Grandpa's melody was torn into pieces. Look in 'Your pocket' at the bottom of the screen. Each player holds different pieces, so share them out loud!",
    'Each piece is numbered with snowflakes, from one to four. Put them in order and ring the bells to match. That is eight notes in a row.',
    'Blue, Green, Silver, Blue, Green, Gold, Red, Gold.' ] },
  { id: 'tiles', scene: 'workshop', title: 'The scrambled painting', hints: [
    'The painting on the workshop wall has been scrambled. Click a square to turn it a quarter turn.',
    'Use the snowman, the bunting, the moon and the banner to work out which way up each square goes.',
    'When all nine squares are the right way up the painting is fixed. Remember the banner AND the time on the village clock!' ] },
  { id: 'spot', scene: 'workshop', title: 'The photo album', hints: [
    "Open Grandpa's photo album on the workbench. The two photos look the same but there are five differences.",
    'Look closely at the snowman, the tree, the windows, the sledge and the sky.',
    "The snowman's nose, the star on the tree, a lit window, the sledge colour and the moon." ] },
  { id: 'cabinet', scene: 'workshop', title: 'The toy cabinet', hints: [
    "The elves' ledger on the workbench has clues about which elf made which toy. Use the grid in the ledger to tick and cross things off together.",
    'Neither Pip nor Juniper made the horse, and Bramble is scared of horses. So Tansy made the horse. What does that tell you about the teddy?',
    'Pip: Kite. Bramble: Drum. Tansy: Rocking horse. Juniper: Teddy bear. Then pull the handle.' ] },
  { id: 'watch', scene: 'attic', title: "Grandpa's pocket watch", hints: [
    "The pocket watch on the side table won't open. Grandpa always set it to the village clock.",
    "Look at the village clock tower in the painting downstairs in the workshop. What time does it show?",
    'Set the watch to half past seven (7:30), then open it.' ] },
  { id: 'gears', scene: 'attic', title: 'The clock mechanism', hints: [
    'The Great Clock is missing three gears. Different puzzles gave you each one.',
    'The brass gear comes from the bells, the silver gear from the photo album, and the copper gear from the pocket watch. Click each empty spindle to fit them.' ] },
  { id: 'final', scene: 'attic', title: 'The engraved plaque', hints: [
    'The engraving under the clock is written in code. The cipher wheel on the stand can decode it.',
    "The workshop painting's banner said: star under F. Turn the inner wheel until the star sits under F, then find each engraved letter on the inner ring and read the letter just outside it.",
    'The word is TOGETHER.' ] },
];

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function freshGame() {
  return {
    scenes: ['parlour'],
    inv: [],
    solved: {},
    hints: {},
    pz: {
      present: [0, 0, 0, 0],
      mem: { deck: shuffle(CARD_ICONS.concat(CARD_ICONS)), up: [], done: [], lock: false },
      bellSeq: [],
      tiles: TILE_START.slice(),
      spot: new Array(SPOT_COUNT).fill(false),
      grid: new Array(16).fill(0),
      dials: [0, 0, 0, 0],
      watch: { h: 12, m: 0 },
      gears: [false, false, false],
      wheel: 0,
    },
  };
}

const clean = (s) => String(s || '').toUpperCase().replace(/[^A-Z]/g, '');

// Returns { fx: [...effects to broadcast], log: 'text', err: 'text for actor only', later: {ms, m} }
function act(game, player, m) {
  const out = { fx: [] };
  const name = player.name;
  const open = (pid) => game.scenes.includes(SCENE_OF[pid]);
  const solve = (pid, logText, reward) => {
    game.solved[pid] = Date.now();
    if (reward) game.inv.push(reward);
    out.fx.push({ fx: 'solve', p: pid, by: player.id, reward });
    out.log = logText;
  };
  const wrong = (pid, logText, msg) => { out.fx.push({ fx: 'wrong', p: pid, by: player.id, msg }); out.log = logText; };

  switch (m.a) {
    case 'digit': {
      if (!open('present') || game.solved.present) return out;
      const i = m.i | 0; if (i < 0 || i > 3) return out;
      game.pz.present[i] = (game.pz.present[i] + (m.d > 0 ? 1 : 9)) % 10;
      return out;
    }
    case 'openPresent': {
      if (!open('present') || game.solved.present) return out;
      if (game.pz.present.join('') === PRESENT) solve('present', `${name} opened the present and found a red glass lens!`, 'lens');
      else wrong('present', `${name} tried ${game.pz.present.join('')} on the present. It stays shut.`, `${game.pz.present.join(' ')} doesn't open it`);
      return out;
    }
    case 'card': {
      const mem = game.pz.mem;
      if (!open('memory') || game.solved.memory || mem.lock) return out;
      const i = m.i | 0; if (i < 0 || i >= mem.deck.length) return out;
      if (mem.done.includes(i) || mem.up.includes(i)) return out;
      mem.up.push(i);
      out.fx.push({ fx: 'flip', by: player.id });
      if (mem.up.length === 2) {
        const [a, b] = mem.up;
        if (mem.deck[a] === mem.deck[b]) {
          mem.done.push(a, b); mem.up = [];
          out.fx.push({ fx: 'pair', by: player.id });
          if (mem.done.length === mem.deck.length) solve('memory', `${name} matched the last pair! Behind the cards hangs a brass door key.`, 'doorKey');
        } else {
          mem.lock = true;
          out.fx.push({ fx: 'nopair', by: player.id });
          out.later = { ms: 1200, m: { a: 'memHide' } };
        }
      }
      return out;
    }
    case 'memHide': { game.pz.mem.up = []; game.pz.mem.lock = false; return out; }
    case 'door': {
      if (game.solved.door) return out;
      const w = clean(m.word);
      if (!w) return out;
      if (w !== DOOR_WORD) { wrong('door', `${name} tried "${w}" on the workshop door.`, `"${w}" isn't the word`); return out; }
      if (!game.inv.includes('doorKey')) { wrong('door', `${name} found the right word, but the keyhole is still locked.`, 'Right word! But the keyhole is still locked. Find the key!'); return out; }
      game.inv = game.inv.filter((x) => x !== 'doorKey');
      solve('door', `${name} turned the key and spoke the word. The workshop door creaks open!`);
      game.scenes.push('workshop');
      return out;
    }
    case 'bell': {
      if (!open('bells') || !BELLS.includes(m.c)) return out;
      out.fx.push({ fx: 'bell', c: m.c, by: player.id });
      if (game.solved.bells) return out;
      game.pz.bellSeq.push(m.c);
      if (game.pz.bellSeq.length >= MELODY.length) {
        if (game.pz.bellSeq.join() === MELODY.join()) solve('bells', 'The melody rings out! The music box springs open with a brass gear inside.', 'brassGear');
        else { game.pz.bellSeq = []; wrong('bells', `${name} played a tune, but it wasn't Grandpa's melody.`, "That's not Grandpa's tune. Start again!"); }
      }
      return out;
    }
    case 'clearBells': { if (!game.solved.bells) game.pz.bellSeq = []; return out; }
    case 'tile': {
      if (!open('tiles') || game.solved.tiles) return out;
      const i = m.i | 0; if (i < 0 || i > 8) return out;
      game.pz.tiles[i] = (game.pz.tiles[i] + 1) % 4;
      if (game.pz.tiles.every((r) => r === 0)) solve('tiles', `${name} fixed the painting! The banner reads "★ under F", and the village clock shows half past seven.`);
      return out;
    }
    case 'spot': {
      if (!open('spot') || game.solved.spot) return out;
      const i = m.i | 0; if (i < 0 || i >= SPOT_COUNT || game.pz.spot[i]) return out;
      game.pz.spot[i] = true;
      out.fx.push({ fx: 'spotted', i, by: player.id });
      if (game.pz.spot.every(Boolean)) solve('spot', `${name} spotted the fifth difference! A silver gear slides out of the album's spine.`, 'silverGear');
      return out;
    }
    case 'grid': {
      if (!open('cabinet')) return out;
      const i = m.i | 0; if (i < 0 || i > 15) return out;
      game.pz.grid[i] = (game.pz.grid[i] + 1) % 3;
      return out;
    }
    case 'dial': {
      if (!open('cabinet') || game.solved.cabinet) return out;
      const i = m.i | 0; if (i < 0 || i > 3) return out;
      game.pz.dials[i] = (game.pz.dials[i] + (m.d > 0 ? 1 : 3)) % 4;
      return out;
    }
    case 'cabinet': {
      if (!open('cabinet') || game.solved.cabinet) return out;
      if (game.pz.dials.join() === CABINET.join()) solve('cabinet', `${name} pulled the handle. The cabinet opens and a little star-shaped key drops out!`, 'starKey');
      else wrong('cabinet', `${name} pulled the cabinet handle. Locked tight.`, "The handle won't budge");
      return out;
    }
    case 'hatch': {
      if (!open('hatch') || game.solved.hatch) return out;
      if (game.inv.includes('starKey')) {
        game.inv = game.inv.filter((x) => x !== 'starKey');
        solve('hatch', `${name} turned the star key. The attic hatch swings down!`);
        game.scenes.push('attic');
      } else out.err = 'The hatch is locked. The keyhole is shaped like a little star.';
      return out;
    }
    case 'watchH': {
      if (!open('watch') || game.solved.watch) return out;
      const w = game.pz.watch; w.h = ((w.h - 1 + (m.d > 0 ? 1 : 11)) % 12) + 1;
      return out;
    }
    case 'watchM': {
      if (!open('watch') || game.solved.watch) return out;
      const w = game.pz.watch; w.m = (w.m + (m.d > 0 ? 5 : 55)) % 60;
      return out;
    }
    case 'openWatch': {
      if (!open('watch') || game.solved.watch) return out;
      const w = game.pz.watch;
      if (w.h === WATCH.h && w.m === WATCH.m) solve('watch', `${name} set the watch to 7:30 and it clicked open. Inside: a copper gear!`, 'copperGear');
      else wrong('watch', `${name} tried ${w.h}:${String(w.m).padStart(2, '0')} on the pocket watch.`, `${w.h}:${String(w.m).padStart(2, '0')} isn't right`);
      return out;
    }
    case 'gear': {
      if (!open('gears') || game.solved.gears) return out;
      const i = m.i | 0; if (i < 0 || i > 2) return out;
      const need = GEAR_ITEMS[i];
      if (game.pz.gears[i]) return out;
      if (!game.inv.includes(need)) { out.err = `This spindle needs the ${GEAR_NAMES[i]} gear.`; return out; }
      game.inv = game.inv.filter((x) => x !== need);
      game.pz.gears[i] = true;
      out.fx.push({ fx: 'gear', i, by: player.id });
      out.log = `${name} fitted the ${GEAR_NAMES[i]} gear into the clock.`;
      if (game.pz.gears.every(Boolean)) solve('gears', 'Tick... tock... The Great Clock shudders back to life! Now it needs the secret word.');
      return out;
    }
    case 'wheel': {
      if (!open('final')) return out;
      game.pz.wheel = (game.pz.wheel + (m.d > 0 ? 1 : 25)) % 26;
      return out;
    }
    case 'final': {
      if (!open('final') || game.solved.final) return out;
      if (!game.solved.gears) { out.err = "The clock's insides are empty. It can't hear you yet."; return out; }
      const w = clean(m.word);
      if (!w) return out;
      if (w === FINAL_WORD) solve('final', `${name} spoke the word. BONG! The Great Clock strikes midnight. Merry Christmas!`);
      else wrong('final', `${name} whispered "${w}" to the clock. Nothing happens.`, `"${w}" isn't the word`);
      return out;
    }
  }
  return out;
}

module.exports = { PUZZLES, BELLS, MELODY, freshGame, act };
