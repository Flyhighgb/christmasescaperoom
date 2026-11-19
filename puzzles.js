// Puzzle rules for "The Midnight Workshop".
// All answers are checked here on the server so every player shares one truth.

const BELLS = ['red', 'gold', 'green', 'blue', 'silver'];
const MELODY = ['blue', 'green', 'silver', 'blue', 'green', 'gold', 'red', 'gold'];
const TOYS = ['horse', 'drum', 'kite', 'teddy'];
const CABINET = [2, 1, 0, 3]; // Pip=kite, Bramble=drum, Tansy=horse, Juniper=teddy
const PRESENT = '4253'; // red 4, gold 2, blue 5, purple 3
const DOOR_WORD = 'CINNAMON';
const FINAL_WORD = 'TOGETHER';
const TILE_START = [2, 1, 3, 1, 0, 2, 3, 3, 1];

// Which scene each puzzle lives in (an action only works once its scene is open).
const SCENE_OF = {
  present: 'parlour', door: 'parlour',
  bells: 'workshop', tiles: 'workshop', cabinet: 'workshop', hatch: 'workshop',
  gears: 'attic', final: 'attic',
};

const PUZZLES = [
  { id: 'present', scene: 'parlour', title: 'The locked present', hints: [
    'The gift tag on the present under the tree shows four coloured dots. Where else in the room do you see those colours?',
    'Count the round baubles on the Christmas tree, one colour at a time, in the same order as the dots on the tag.',
    'Red 4, Gold 2, Blue 5, Purple 3. The code is 4 2 5 3.' ] },
  { id: 'door', scene: 'parlour', title: 'The workshop door', hints: [
    "Read Grandpa's letter on the desk. The door opens for his favourite spice, but the word is hidden under red scribbles.",
    'The present gave you a red glass lens. Open the letter and move the lens over the scribbles to see through them.',
    'The hidden word is CINNAMON.' ] },
  { id: 'bells', scene: 'workshop', title: 'The bell melody', hints: [
    "Grandpa's melody was torn into pieces. Look in 'Your pocket' at the bottom of the screen. Each player holds different pieces, so share them out loud!",
    'Each piece is numbered with snowflakes, from one to four. Put them in order and ring the bells to match. That is eight notes in a row.',
    'Blue, Green, Silver, Blue, Green, Gold, Red, Gold.' ] },
  { id: 'tiles', scene: 'workshop', title: 'The scrambled painting', hints: [
    'The painting on the workshop wall has been scrambled. Click a square to turn it a quarter turn.',
    'Start with the corners: the moon belongs at the top right, and the snowy ground and banner run along the bottom.',
    'Line up the hills, roofs and the banner. When all nine squares are the right way up, the frame swings open.' ] },
  { id: 'cabinet', scene: 'workshop', title: 'The toy cabinet', hints: [
    "The elves' ledger on the workbench has clues about which elf made which toy. Use the grid in the ledger to tick and cross things off together.",
    'Neither Pip nor Juniper made the horse, and Bramble is scared of horses. So Tansy made the horse. What does that tell you about the teddy?',
    'Pip: Kite. Bramble: Drum. Tansy: Rocking horse. Juniper: Teddy bear. Then pull the handle.' ] },
  { id: 'gears', scene: 'attic', title: 'The clock mechanism', hints: [
    'The Great Clock is missing two gears from its insides. Some of your puzzles gave you gears.',
    'Open the glass case under the clock and click each empty spindle to fit the brass gear and the silver gear.' ] },
  { id: 'final', scene: 'attic', title: 'The engraved plaque', hints: [
    'The engraving under the clock is written in code. The cipher wheel on the stand can decode it.',
    "The workshop painting's banner said: star under F. Turn the inner wheel until the star sits under F, then find each engraved letter on the inner ring and read the letter just outside it.",
    'The word is TOGETHER.' ] },
];

function freshGame() {
  return {
    scenes: ['parlour'],
    inv: [],
    solved: {},
    hints: {},
    pz: {
      present: [0, 0, 0, 0],
      bellSeq: [],
      tiles: TILE_START.slice(),
      grid: new Array(16).fill(0),
      dials: [0, 0, 0, 0],
      gears: [false, false],
      wheel: 0,
    },
  };
}

const clean = (s) => String(s || '').toUpperCase().replace(/[^A-Z]/g, '');

// Returns { fx: [...effects to broadcast], log: 'text', err: 'text for actor only' }
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
  const wrong = (pid, logText) => { out.fx.push({ fx: 'wrong', p: pid, by: player.id }); out.log = logText; };

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
      else wrong('present', `${name} tried ${game.pz.present.join('')} on the present. It stays shut.`);
      return out;
    }
    case 'door': {
      if (game.solved.door) return out;
      const w = clean(m.word);
      if (!w) return out;
      if (w === DOOR_WORD) { solve('door', `${name} spoke the word. The workshop door creaks open!`); game.scenes.push('workshop'); }
      else wrong('door', `${name} tried "${w}" on the workshop door.`);
      return out;
    }
    case 'bell': {
      if (!open('bells') || !BELLS.includes(m.c)) return out;
      out.fx.push({ fx: 'bell', c: m.c, by: player.id });
      if (game.solved.bells) return out;
      game.pz.bellSeq.push(m.c);
      if (game.pz.bellSeq.length > 8) game.pz.bellSeq = game.pz.bellSeq.slice(-8);
      if (game.pz.bellSeq.join() === MELODY.join()) solve('bells', `The melody rings out! The music box springs open with a brass gear inside.`, 'brassGear');
      return out;
    }
    case 'tile': {
      if (!open('tiles') || game.solved.tiles) return out;
      const i = m.i | 0; if (i < 0 || i > 8) return out;
      game.pz.tiles[i] = (game.pz.tiles[i] + 1) % 4;
      if (game.pz.tiles.every((r) => r === 0)) solve('tiles', `${name} fixed the painting! The frame swings open to reveal a silver gear. The banner reads "★ under F".`, 'silverGear');
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
      else wrong('cabinet', `${name} pulled the cabinet handle. Locked tight.`);
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
    case 'gear': {
      if (!open('gears') || game.solved.gears) return out;
      const i = m.i | 0; if (i < 0 || i > 1) return out;
      const need = i === 0 ? 'brassGear' : 'silverGear';
      if (game.pz.gears[i]) return out;
      if (!game.inv.includes(need)) { out.err = i === 0 ? 'This spindle needs a large brass gear.' : 'This spindle needs a small silver gear.'; return out; }
      game.inv = game.inv.filter((x) => x !== need);
      game.pz.gears[i] = true;
      out.fx.push({ fx: 'gear', i, by: player.id });
      out.log = `${name} fitted the ${i === 0 ? 'brass' : 'silver'} gear into the clock.`;
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
      else wrong('final', `${name} whispered "${w}" to the clock. Nothing happens.`);
      return out;
    }
  }
  return out;
}

module.exports = { PUZZLES, BELLS, MELODY, TOYS, freshGame, act };
