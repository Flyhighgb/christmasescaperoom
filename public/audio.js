// Synthesised sound for The Midnight Workshop (no audio files needed).
(function () {
  let ctx = null, master = null, musicGain = null, musicTimer = null;
  const S = { muted: false, music: true };
  try { const saved = JSON.parse(localStorage.getItem('mw-audio') || '{}'); Object.assign(S, saved); } catch (e) {}
  const save = () => { try { localStorage.setItem('mw-audio', JSON.stringify(S)); } catch (e) {} };

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = S.muted ? 0 : 0.8;
    const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
    if (S.music) startMusic();
    return true;
  }

  function tone(freq, t0, dur, vol, type = 'sine', dest = master) {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  // Bell: inharmonic partials with long decay.
  function bellAt(freq, t0, vol = 0.35, dest = master) {
    [[1, 1, 2.6], [2.0, 0.5, 1.6], [2.76, 0.35, 1.2], [5.4, 0.16, 0.6], [0.5, 0.25, 2.2]].forEach(([m, v, d]) => tone(freq * m, t0, d, vol * v, 'sine', dest));
  }
  const NOTE = { red: 523.25, gold: 587.33, green: 659.25, blue: 783.99, silver: 880.0 };

  const API = {
    state: S,
    unlock() { ensure(); },
    bell(c) { if (!ensure()) return; bellAt(NOTE[c] || 600, ctx.currentTime); },
    click() { if (!ensure()) return; tone(1400, ctx.currentTime, 0.05, 0.08, 'triangle'); },
    tick() { if (!ensure()) return; tone(2200, ctx.currentTime, 0.03, 0.05, 'square'); },
    wrong() { if (!ensure()) return; const t = ctx.currentTime; tone(160, t, 0.25, 0.25, 'triangle'); tone(120, t + 0.12, 0.35, 0.22, 'triangle'); },
    pop() { if (!ensure()) return; const t = ctx.currentTime; const o = ctx.createOscillator(); const g = ctx.createGain(); o.frequency.setValueAtTime(500, t); o.frequency.exponentialRampToValueAtTime(1100, t + 0.08); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2); },
    chime() { if (!ensure()) return; const t = ctx.currentTime; [784, 988, 1175, 1568].forEach((f, i) => bellAt(f, t + i * 0.09, 0.22)); },
    whoosh() {
      if (!ensure()) return; const t = ctx.currentTime; const len = 0.6;
      const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate); const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / d.length);
      const src = ctx.createBufferSource(); src.buffer = buf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
      f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(2400, t + len);
      const g = ctx.createGain(); g.gain.value = 0.18; src.connect(f); f.connect(g); g.connect(master); src.start(t);
    },
    fanfare() {
      if (!ensure()) return; const t = ctx.currentTime;
      // twelve bongs then a sparkling chord
      for (let i = 0; i < 12; i++) bellAt(196, t + i * 0.55, 0.32);
      [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => bellAt(f, t + 6.8 + i * 0.07, 0.2));
    },
    setMuted(m) { S.muted = m; save(); if (ensure()) master.gain.setTargetAtTime(m ? 0 : 0.8, ctx.currentTime, 0.05); },
    setMusic(on) { S.music = on; save(); if (!ensure()) return; on ? startMusic() : stopMusic(); },
  };

  // Gentle music-box loop on a pentatonic scale, with a soft pad underneath.
  const SCALE = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  const PHRASES = [[2, 4, 5, 4, 2, 1, 2, 0], [3, 5, 6, 5, 4, 2, 3, -1], [5, 4, 2, 4, 5, 7, 6, 4], [2, 1, 0, 1, 2, 4, 2, -1]];
  function startMusic() {
    if (musicTimer || !ctx) return;
    let step = 0, phrase = 0;
    const beat = 0.42;
    let next = ctx.currentTime + 0.1;
    musicTimer = setInterval(() => {
      while (next < ctx.currentTime + 0.5) {
        const n = PHRASES[phrase][step];
        if (n >= 0) { bellAt(SCALE[n] * 2, next, 0.12, musicGain); }
        if (step === 0) { [SCALE[phrase % 2 ? 1 : 0] / 2, SCALE[2] / 2].forEach((f) => tone(f, next, beat * 8, 0.05, 'sine', musicGain)); }
        step++; if (step >= 8) { step = 0; phrase = (phrase + 1) % PHRASES.length; }
        next += beat;
      }
    }, 120);
  }
  function stopMusic() { clearInterval(musicTimer); musicTimer = null; }

  window.SFX = API;
})();
