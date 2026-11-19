// Synthesised sound for The Midnight Workshop (no audio files needed).
// Music: traditional (public-domain) carols arranged for celesta, bass, pad and sleigh bells.
(function () {
  let ctx = null, out = null, master = null, musicGain = null, musicTimer = null, noiseBuf = null;
  const S = { muted: false, music: true, musicVol: 0.5, sfxVol: 0.8 };
  try { const saved = JSON.parse(localStorage.getItem('mw-audio2') || '{}'); Object.assign(S, saved); } catch (e) {}
  const save = () => { try { localStorage.setItem('mw-audio2', JSON.stringify(S)); } catch (e) {} };

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    // out (mute) <- master (sound effects volume) and musicGain (music volume)
    out = ctx.createGain(); out.gain.value = S.muted ? 0 : 1;
    master = ctx.createGain(); master.gain.value = S.sfxVol; master.connect(out);
    const comp = ctx.createDynamicsCompressor(); out.connect(comp); comp.connect(ctx.destination);
    // a little room reverb for warmth
    const verb = ctx.createConvolver(); verb.buffer = impulse(2.2); const vg = ctx.createGain(); vg.gain.value = 0.22;
    musicGain = ctx.createGain(); musicGain.gain.value = S.musicVol;
    musicGain.connect(out); musicGain.connect(verb); verb.connect(vg); vg.connect(out);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    if (S.music) startMusic();
    return true;
  }
  function impulse(sec) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    return b;
  }

  function tone(freq, t0, dur, vol, type = 'sine', dest = master, attack = 0.008) {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  // Bell: inharmonic partials with long decay.
  function bellAt(freq, t0, vol = 0.35, dest = master) {
    [[1, 1, 2.6], [2.0, 0.5, 1.6], [2.76, 0.35, 1.2], [5.4, 0.16, 0.6], [0.5, 0.25, 2.2]].forEach(([m, v, d]) => tone(freq * m, t0, d, vol * v, 'sine', dest));
  }
  // Celesta: bright, sweet, short.
  function celesta(freq, t0, dur, vol) {
    tone(freq, t0, Math.max(0.6, dur * 1.6), vol, 'sine', musicGain, 0.004);
    tone(freq * 2, t0, 0.5, vol * 0.28, 'sine', musicGain, 0.003);
    tone(freq * 4.01, t0, 0.18, vol * 0.08, 'sine', musicGain, 0.002);
  }
  function sleigh(t0, vol) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
    src.connect(f); f.connect(g); g.connect(musicGain); src.start(t0); src.stop(t0 + 0.15);
  }
  const NOTE = { red: 523.25, gold: 587.33, green: 659.25, blue: 783.99, silver: 880.0 };

  // ---------- carols ----------
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const freqOf = (n) => { const m = /^([A-G])(#|b)?(\d)$/.exec(n); const midi = 12 * (+m[3] + 1) + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return 440 * Math.pow(2, (midi - 69) / 12); };
  const chordNotes = (c) => { const minor = c.endsWith('m'); const root = c.replace('m', ''); const r = freqOf(root + '3'); return [r, r * Math.pow(2, (minor ? 3 : 4) / 12), r * Math.pow(2, 7 / 12)]; };
  // Each song: bars of "Note:beats" (R = rest), with one chord per bar.
  const SONGS = [
    { name: 'Jingle Bells', bpm: 138, beats: 4, up: 1, sleigh: true, bars: [
      ['B4:1 B4:1 B4:2', 'G'], ['B4:1 B4:1 B4:2', 'G'], ['B4:1 D5:1 G4:1.5 A4:.5', 'G'], ['B4:4', 'G'],
      ['C5:1 C5:1 C5:1.5 C5:.5', 'C'], ['C5:1 B4:1 B4:1 B4:.5 B4:.5', 'G'], ['B4:1 A4:1 A4:1 B4:1', 'A'], ['A4:2 D5:2', 'D'],
      ['B4:1 B4:1 B4:2', 'G'], ['B4:1 B4:1 B4:2', 'G'], ['B4:1 D5:1 G4:1.5 A4:.5', 'G'], ['B4:4', 'G'],
      ['C5:1 C5:1 C5:1.5 C5:.5', 'C'], ['C5:1 B4:1 B4:1 B4:.5 B4:.5', 'G'], ['D5:1 D5:1 C5:1 A4:1', 'D'], ['G4:4', 'G']] },
    { name: 'Deck the Halls', bpm: 126, beats: 4, up: 1, bars: [
      ['G4:1.5 F4:.5 E4:1 D4:1', 'C'], ['C4:1 D4:1 E4:1 C4:1', 'C'], ['D4:.5 E4:.5 F4:.5 D4:.5 E4:1.5 D4:.5', 'G'], ['C4:1 B3:1 C4:2', 'C'],
      ['G4:1.5 F4:.5 E4:1 D4:1', 'C'], ['C4:1 D4:1 E4:1 C4:1', 'C'], ['D4:.5 E4:.5 F4:.5 D4:.5 E4:1.5 D4:.5', 'G'], ['C4:1 B3:1 C4:2', 'C'],
      ['D4:1.5 E4:.5 F4:1 D4:1', 'G'], ['E4:1.5 F4:.5 G4:1 D4:1', 'C'], ['E4:.5 F#4:.5 G4:1 A4:.5 B4:.5 C5:1', 'D'], ['B4:1 A4:1 G4:2', 'G'],
      ['G4:1.5 F4:.5 E4:1 D4:1', 'C'], ['C4:1 D4:1 E4:1 C4:1', 'C'], ['A4:.5 A4:.5 A4:.5 A4:.5 G4:1.5 F4:.5', 'F'], ['E4:1 D4:1 C4:2', 'C']] },
    { name: 'We Wish You a Merry Christmas', bpm: 160, beats: 3, up: 1, bars: [
      ['R:2 D4:1', null], ['G4:1 G4:.5 A4:.5 G4:.5 F#4:.5', 'G'], ['E4:1 E4:1 E4:1', 'C'], ['A4:1 A4:.5 B4:.5 A4:.5 G4:.5', 'A'], ['F#4:1 D4:1 D4:1', 'D'],
      ['B4:1 B4:.5 C5:.5 B4:.5 A4:.5', 'E'], ['G4:1 E4:1 D4:.5 D4:.5', 'C'], ['E4:1 A4:1 F#4:1', 'D'], ['G4:3', 'G']] },
    { name: 'Good King Wenceslas', bpm: 112, beats: 4, up: 1, bars: [
      ['G4:1 G4:1 G4:1 A4:1', 'G'], ['G4:1 G4:1 D4:2', 'G'], ['E4:1 D4:1 E4:1 F#4:1', 'C'], ['G4:2 G4:2', 'G'],
      ['G4:1 G4:1 G4:1 A4:1', 'G'], ['G4:1 G4:1 D4:2', 'G'], ['E4:1 D4:1 E4:1 F#4:1', 'C'], ['G4:2 G4:2', 'G'],
      ['D5:1 C5:1 B4:1 A4:1', 'G'], ['B4:1 A4:1 G4:2', 'D'], ['E4:1 D4:1 E4:1 F#4:1', 'C'], ['G4:2 G4:2', 'G'],
      ['D4:1 D4:1 E4:1 F#4:1', 'D'], ['G4:1 G4:1 A4:2', 'D'], ['D5:1 C5:1 B4:1 A4:1', 'G'], ['G4:2 C5:2', 'C'], ['G4:4', 'G']] },
  ];
  // Flatten into timed events.
  const TRACK = []; let tBeat = 0;
  for (const song of SONGS) {
    const spb = 60 / song.bpm;
    for (const [mel, chord] of song.bars) {
      let b = 0;
      if (chord) {
        TRACK.push({ t: tBeat, k: 'bass', f: chordNotes(chord)[0] / 2, d: song.beats * spb });
        TRACK.push({ t: tBeat, k: 'pad', fs: chordNotes(chord), d: song.beats * spb });
        for (let i = 1; i < song.beats; i++) TRACK.push({ t: tBeat + i * spb, k: 'bass2', f: chordNotes(chord)[i % 2 ? 2 : 1] / 2, d: spb });
      }
      for (const tok of mel.split(' ')) {
        const [n, len] = tok.split(':'); const beats = parseFloat(len);
        if (n !== 'R') TRACK.push({ t: tBeat + b * spb, k: 'mel', f: freqOf(n) * Math.pow(2, song.up), d: beats * spb });
        b += beats;
      }
      if (song.sleigh) for (let i = 0; i < song.beats * 2; i++) TRACK.push({ t: tBeat + i * spb / 2, k: 'sleigh', v: i % 2 ? 0.03 : 0.06 });
      tBeat += song.beats * spb;
    }
    tBeat += 2.5; // breath between carols
  }
  TRACK.sort((a, b) => a.t - b.t);
  const LOOP = tBeat;

  function startMusic() {
    if (musicTimer || !ctx) return;
    let base = ctx.currentTime + 0.2, idx = 0;
    musicTimer = setInterval(() => {
      const horizon = ctx.currentTime + 0.6;
      while (true) {
        if (idx >= TRACK.length) { idx = 0; base += LOOP; }
        const ev = TRACK[idx]; const at = base + ev.t;
        if (at > horizon) break;
        if (at > ctx.currentTime - 0.05) {
          if (ev.k === 'mel') celesta(ev.f, at, ev.d, 0.2);
          else if (ev.k === 'bass') tone(ev.f, at, ev.d * 0.9, 0.16, 'triangle', musicGain, 0.01);
          else if (ev.k === 'bass2') tone(ev.f, at, ev.d * 0.8, 0.07, 'triangle', musicGain, 0.01);
          else if (ev.k === 'pad') ev.fs.forEach((f) => tone(f, at, ev.d, 0.025, 'sine', musicGain, 0.25));
          else if (ev.k === 'sleigh') sleigh(at, ev.v);
        }
        idx++;
      }
    }, 100);
  }
  function stopMusic() { clearInterval(musicTimer); musicTimer = null; }

  const API = {
    state: S,
    unlock() { ensure(); },
    bell(c) { if (!ensure()) return; bellAt(NOTE[c] || 600, ctx.currentTime); },
    click() { if (!ensure()) return; tone(1400, ctx.currentTime, 0.05, 0.08, 'triangle'); },
    tick() { if (!ensure()) return; tone(2200, ctx.currentTime, 0.03, 0.05, 'square'); },
    flip() { if (!ensure()) return; const t = ctx.currentTime; tone(900, t, 0.06, 0.06, 'triangle'); tone(1300, t + 0.04, 0.06, 0.05, 'triangle'); },
    wrong() { if (!ensure()) return; const t = ctx.currentTime; tone(311, t, 0.25, 0.18, 'triangle'); tone(233, t + 0.16, 0.45, 0.2, 'triangle'); },
    correct() { if (!ensure()) return; const t = ctx.currentTime; [659.25, 783.99, 1046.5].forEach((f, i) => bellAt(f, t + i * 0.08, 0.2)); },
    pop() { if (!ensure()) return; const t = ctx.currentTime; const o = ctx.createOscillator(); const g = ctx.createGain(); o.frequency.setValueAtTime(500, t); o.frequency.exponentialRampToValueAtTime(1100, t + 0.08); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2); },
    chime() { if (!ensure()) return; const t = ctx.currentTime; [784, 988, 1175, 1568].forEach((f, i) => bellAt(f, t + i * 0.09, 0.22)); },
    whoosh() {
      if (!ensure()) return; const t = ctx.currentTime; const len = 0.6;
      const src = ctx.createBufferSource(); src.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
      f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2400, t + len);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      src.connect(f); f.connect(g); g.connect(master); src.start(t); src.stop(t + len);
    },
    fanfare() {
      if (!ensure()) return; const t = ctx.currentTime;
      for (let i = 0; i < 12; i++) bellAt(196, t + i * 0.55, 0.32);
      [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => bellAt(f, t + 6.8 + i * 0.07, 0.2));
    },
    setMuted(m) { S.muted = m; save(); if (ensure()) out.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.05); },
    setMusicVol(v) { S.musicVol = Math.max(0, Math.min(1, v)); save(); if (ensure()) musicGain.gain.setTargetAtTime(S.musicVol, ctx.currentTime, 0.05); },
    setSfxVol(v) { S.sfxVol = Math.max(0, Math.min(1, v)); save(); if (ensure()) master.gain.setTargetAtTime(S.sfxVol, ctx.currentTime, 0.05); },
    squeak() { if (!ensure()) return; const t = ctx.currentTime; [0, 0.11].forEach((d) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(1800, t + d); o.frequency.exponentialRampToValueAtTime(3200, t + d + 0.06); o.frequency.exponentialRampToValueAtTime(2200, t + d + 0.09); g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.09, t + d + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.1); o.connect(g); g.connect(master); o.start(t + d); o.stop(t + d + 0.12); }); },
    setMusic(on) { S.music = on; save(); if (!ensure()) return; on ? startMusic() : stopMusic(); },
  };

  window.SFX = API;
})();
