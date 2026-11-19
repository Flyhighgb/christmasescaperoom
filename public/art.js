// Hand-built SVG illustrations for The Midnight Workshop.
// Palette: midnight navy, candle amber, holly red, pine green, brass gold, frost cream.
(function () {
  const A = {};
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const r1 = (a, b) => a + rnd() * (b - a);

  A.C = {
    red: '#d7263d', gold: '#f2b632', blue: '#2f7fe0', purple: '#9b4fd6', green: '#2fae6b', silver: '#c9d3df',
    night: '#0d1830', cream: '#f7eedc', brass: '#d8a845', pine: '#1d5a43',
  };

  // ---------- shared defs (injected once into the page) ----------
  A.defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <radialGradient id="gShade" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>
    <radialGradient id="gWarm" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc56b" stop-opacity=".75"/><stop offset=".4" stop-color="#ff9e3d" stop-opacity=".25"/><stop offset="1" stop-color="#ff9e3d" stop-opacity="0"/></radialGradient>
    <radialGradient id="gCool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#cfe4ff" stop-opacity=".55"/><stop offset="1" stop-color="#cfe4ff" stop-opacity="0"/></radialGradient>
    <radialGradient id="gVig" cx=".5" cy=".45" r=".78"><stop offset=".55" stop-color="#05070f" stop-opacity="0"/><stop offset="1" stop-color="#05070f" stop-opacity=".62"/></radialGradient>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#081128"/><stop offset=".6" stop-color="#1a2f5e"/><stop offset="1" stop-color="#3d5a8f"/></linearGradient>
    <linearGradient id="gBrass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7d98a"/><stop offset=".5" stop-color="#d0a03f"/><stop offset="1" stop-color="#8a6420"/></linearGradient>
    <linearGradient id="gSilver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#b9c4d2"/><stop offset="1" stop-color="#6c7a8c"/></linearGradient>
    <linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5532"/><stop offset="1" stop-color="#5a321b"/></linearGradient>
    <linearGradient id="gWoodDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5e3820"/><stop offset="1" stop-color="#3a2111"/></linearGradient>
    <linearGradient id="gPaper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf4e3"/><stop offset="1" stop-color="#ead9b6"/></linearGradient>
    <linearGradient id="gPine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b5a3f"/><stop offset=".5" stop-color="#23704f"/><stop offset="1" stop-color="#164a34"/></linearGradient>
    <linearGradient id="gFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff5a1a"/><stop offset=".6" stop-color="#ffb13b"/><stop offset="1" stop-color="#fff0b0"/></linearGradient>
    ${['red', 'gold', 'green', 'blue', 'silver'].map((c) => {
      const base = { red: ['#ff7b86', '#d7263d', '#7d0f1e'], gold: ['#ffe9a3', '#f2b632', '#8c5f0c'], green: ['#8ff0b9', '#2fae6b', '#145c37'], blue: ['#9cc9ff', '#2f7fe0', '#153f7a'], silver: ['#ffffff', '#c9d3df', '#6b7889'] }[c];
      return `<linearGradient id="bell-${c}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${base[2]}"/><stop offset=".3" stop-color="${base[1]}"/><stop offset=".45" stop-color="${base[0]}"/><stop offset=".7" stop-color="${base[1]}"/><stop offset="1" stop-color="${base[2]}"/></linearGradient>`;
    }).join('')}
    <filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="fBigGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="fShadow" x="-20%" y="-20%" width="140%" height="160%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b"/>
      <feDiffuseLighting in="b" surfaceScale="4" diffuseConstant="1.18" lighting-color="#fff" result="d"><feDistantLight azimuth="225" elevation="52"/></feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1" result="lit"/>
      <feSpecularLighting in="b" surfaceScale="4" specularConstant=".55" specularExponent="18" lighting-color="#fff1d0" result="s"><feDistantLight azimuth="225" elevation="52"/></feSpecularLighting>
      <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
      <feComposite in="lit" in2="s2" operator="arithmetic" k2="1" k3="1" result="obj"/>
      <feComposite in="obj" in2="SourceAlpha" operator="in" result="objc"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="sb"/><feOffset in="sb" dx="6" dy="12" result="so"/>
      <feComponentTransfer in="so" result="sh"><feFuncA type="linear" slope=".5"/></feComponentTransfer>
      <feMerge><feMergeNode in="sh"/><feMergeNode in="objc"/></feMerge>
    </filter>
    <filter id="fBevel" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="b"/>
      <feDiffuseLighting in="b" surfaceScale="5" diffuseConstant="1.2" lighting-color="#fff" result="d"><feDistantLight azimuth="225" elevation="50"/></feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1" result="lit"/>
      <feSpecularLighting in="b" surfaceScale="5" specularConstant=".6" specularExponent="16" lighting-color="#fff1d0" result="s"><feDistantLight azimuth="225" elevation="50"/></feSpecularLighting>
      <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
      <feComposite in="lit" in2="s2" operator="arithmetic" k2="1" k3="1" result="obj"/>
      <feComposite in="obj" in2="SourceAlpha" operator="in"/>
    </filter>
    <filter id="fBlur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
    <linearGradient id="gFloorShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".35" stop-color="#000" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
    <linearGradient id="gSkirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="gCeil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="gRay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9b8" stop-opacity=".22"/><stop offset="1" stop-color="#ffe9b8" stop-opacity="0"/></linearGradient>
    <linearGradient id="gRayCool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe4ff" stop-opacity=".2"/><stop offset="1" stop-color="#cfe4ff" stop-opacity="0"/></linearGradient>
    <linearGradient id="gCopper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc39a"/><stop offset=".5" stop-color="#c46a35"/><stop offset="1" stop-color="#7a3a17"/></linearGradient>
    <filter id="fRough"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n"/><feColorMatrix in="n" type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .08"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/><feBlend in="SourceGraphic" mode="multiply"/></filter>
  </defs></svg>`;

  // ---------- small helpers ----------
  A.gearPath = (r, teeth, th = r * 0.18, hole = r * 0.32) => {
    let d = '';
    const n = teeth * 2;
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const tooth = Math.floor(i / 2) % 2 === 0;
      const rr = tooth ? r + th : r;
      d += (i ? 'L' : 'M') + (Math.cos(a) * rr).toFixed(1) + ' ' + (Math.sin(a) * rr).toFixed(1);
    }
    d += 'Z';
    d += `M${hole} 0A${hole} ${hole} 0 1 0 ${-hole} 0A${hole} ${hole} 0 1 0 ${hole} 0Z`;
    return d;
  };
  A.gear = (r, teeth, fill, extra = '') => `<path d="${A.gearPath(r, teeth)}" fill="${fill}" fill-rule="evenodd" stroke="#00000055" stroke-width="2" ${extra}/>` +
    `<circle r="${r * 0.62}" fill="none" stroke="#00000033" stroke-width="3"/>` +
    [0, 1, 2, 3, 4, 5].map((k) => { const a = k * Math.PI / 3; return `<circle cx="${(Math.cos(a) * r * 0.47).toFixed(1)}" cy="${(Math.sin(a) * r * 0.47).toFixed(1)}" r="${r * 0.08}" fill="#00000033"/>`; }).join('');

  const bauble = (x, y, c, r = 17) => `<g class="bauble" transform="translate(${x} ${y})">
    <rect x="-5" y="${-r - 6}" width="10" height="8" rx="2" fill="#e2c46a"/><circle cx="0" cy="${-r - 8}" r="3" fill="none" stroke="#e2c46a" stroke-width="1.5"/>
    <circle r="${r}" fill="${c}"/><circle r="${r}" fill="url(#gShade)"/>
    <ellipse cx="${-r * 0.35}" cy="${-r * 0.38}" rx="${r * 0.3}" ry="${r * 0.17}" fill="#fff" opacity=".75" transform="rotate(-35 ${-r * 0.35} ${-r * 0.38})"/></g>`;

  const fairy = (pts, cls = 'twinkle') => pts.map(([x, y], i) =>
    `<circle cx="${x}" cy="${y}" r="9" fill="#ffd98a" opacity=".35" filter="url(#fGlow)" class="${cls}" style="animation-delay:${(i * 0.37) % 2.2}s"/><circle cx="${x}" cy="${y}" r="3.6" fill="#fff6d6" class="${cls}" style="animation-delay:${(i * 0.37) % 2.2}s"/>`).join('');

  const windowSnow = (x, y, w, h, n) => {
    let s = '';
    for (let i = 0; i < n; i++) s += `<circle class="wsnow" cx="${r1(x, x + w).toFixed(0)}" cy="${(y - 20).toFixed(0)}" r="${r1(1.2, 3.4).toFixed(1)}" fill="#fff" style="--fall:${h + 40}px;animation-duration:${r1(5, 11).toFixed(1)}s;animation-delay:-${r1(0, 11).toFixed(1)}s;opacity:${r1(.5, 1).toFixed(2)}"/>`;
    return s;
  };
  const stars = (x, y, w, h, n) => { let s = ''; for (let i = 0; i < n; i++) s += `<circle class="twinkle" cx="${r1(x, x + w).toFixed(0)}" cy="${r1(y, y + h).toFixed(0)}" r="${r1(.6, 1.8).toFixed(1)}" fill="#fff" style="animation-delay:${r1(0, 3).toFixed(1)}s;animation-duration:${r1(2, 4).toFixed(1)}s"/>`; return s; };

  // A little hotspot wrapper. Everything clickable in a scene goes through this.
  const hs = (id, label, inner) => `<g class="hs" data-hs="${id}" data-label="${label}" tabindex="0" role="button" aria-label="${label}">${inner}</g>`;

  const garland = (x1, x2, y, sag) => {
    const mid = (x1 + x2) / 2;
    let leaves = '';
    for (let t = 0; t <= 1.0001; t += 0.035) {
      const x = x1 + (x2 - x1) * t; const yy = y + Math.sin(t * Math.PI) * sag;
      leaves += `<ellipse cx="${x.toFixed(0)}" cy="${(yy + r1(-6, 6)).toFixed(0)}" rx="13" ry="6" fill="${rnd() > .5 ? '#1f6b4a' : '#2a8259'}" transform="rotate(${r1(-50, 50).toFixed(0)} ${x.toFixed(0)} ${yy.toFixed(0)})"/>`;
    }
    const lights = []; for (let t = 0.06; t < 1; t += 0.11) lights.push([x1 + (x2 - x1) * t, y + Math.sin(t * Math.PI) * sag + 6]);
    return `<path d="M${x1} ${y} Q${mid} ${y + sag * 2} ${x2} ${y}" stroke="#174d36" stroke-width="10" fill="none"/>${leaves}${fairy(lights)}`;
  };

  // Perspective floorboards converging on a vanishing point, plus shading for depth.
  const plankFloor = (y0, h, c1, c2) => {
    const vx = 800, vy = y0 - 640, k = (y0 - vy) / (900 - vy);
    let s = `<rect y="${y0}" width="1600" height="${h}" fill="${c1}"/>`;
    const n = 7, rows = [];
    for (let j = 0; j <= n; j++) rows.push(y0 + h * Math.pow(j / n, 1.45));
    const boards = [];
    for (let i = -26; i <= 26; i++) boards.push(vx + i * 96);
    const xAt = (xb, y) => vx + (xb - vx) * (y - vy) / (900 - vy);
    for (let i = 0; i < boards.length - 1; i++) {
      for (let j = 0; j < n; j++) {
        const ya = rows[j], yb = rows[j + 1];
        const shade = ((i * 7 + j * 3) % 5) / 5;
        s += `<path d="M${xAt(boards[i], ya).toFixed(0)} ${ya.toFixed(0)} L${xAt(boards[i + 1], ya).toFixed(0)} ${ya.toFixed(0)} L${xAt(boards[i + 1], yb).toFixed(0)} ${yb.toFixed(0)} L${xAt(boards[i], yb).toFixed(0)} ${yb.toFixed(0)}Z" fill="#fff" opacity="${(shade * 0.05).toFixed(3)}"/>`;
        if ((i + j * 2) % 3 === 0) s += `<line x1="${xAt(boards[i], ya).toFixed(0)}" x2="${xAt(boards[i + 1], ya).toFixed(0)}" y1="${ya.toFixed(0)}" y2="${ya.toFixed(0)}" stroke="${c2}" stroke-width="2"/>`;
      }
      s += `<line x1="${xAt(boards[i], y0).toFixed(0)}" y1="${y0}" x2="${boards[i].toFixed(0)}" y2="900" stroke="${c2}" stroke-width="2.5"/>`;
    }
    s += `<rect y="${y0}" width="1600" height="${h}" fill="url(#gFloorShade)"/>`;
    s += `<rect y="${y0}" width="1600" height="26" fill="url(#gSkirt)"/>`;
    return s;
  };
  const ceiling = () => `<rect width="1600" height="160" fill="url(#gCeil)" pointer-events="none"/>`;
  // Out-of-focus foreground decorations that drift with the mouse (parallax).
  const fgBokeh = (spots) => `<g class="fg" pointer-events="none">${spots.map(([x, y, r, c, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}" filter="url(#fBlur6)"/>`).join('')}</g>`;
  const fgBranch = (x, y, flip, lights = true) => `<g class="fg" pointer-events="none"><g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)" filter="url(#fBlur6)" opacity=".95">
      <path d="M-40 -20 Q120 40 300 10" stroke="#3a2416" stroke-width="12" fill="none"/>
      ${Array.from({ length: 26 }, (_, i) => { const t = i / 25; const px = -30 + t * 320, py = -14 + Math.sin(t * 3) * 18 + 30 * t * (1 - t); return `<ellipse cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" rx="46" ry="14" fill="${i % 2 ? '#123d2b' : '#185238'}" transform="rotate(${(i % 2 ? 35 : -30) + i * 3} ${px.toFixed(0)} ${py.toFixed(0)})"/>`; }).join('')}
      ${lights ? [[40, 10], [120, 34], [200, 30], [270, 18]].map(([lx, ly]) => `<circle cx="${lx}" cy="${ly}" r="16" fill="#ffd98a" opacity=".85"/>`).join('') : ''}
      <circle cx="160" cy="44" r="20" fill="#d7263d"/></g></g>`;
  const dust = (x, y, w, h, n) => { let d = ''; for (let i = 0; i < n; i++) d += `<circle class="mote" cx="${r1(x, x + w).toFixed(0)}" cy="${r1(y, y + h).toFixed(0)}" r="${r1(1, 2.6).toFixed(1)}" fill="#fff3d0" style="animation-delay:-${r1(0, 12).toFixed(1)}s;animation-duration:${r1(9, 16).toFixed(1)}s"/>`; return `<g pointer-events="none" opacity=".6">${d}</g>`; };
  const _unusedPlank = (y, h, c1, c2) => {
    let s = `<rect y="${y}" width="1600" height="${h}" fill="${c1}"/>`;
    for (let i = 0; i < 6; i++) s += `<line x1="0" x2="1600" y1="${y + i * h / 6}" y2="${y + i * h / 6}" stroke="${c2}" stroke-width="2"/>`;
    for (let i = 0; i < 26; i++) { const row = i % 6; const x = (i * 263) % 1600; s += `<line x1="${x}" x2="${x}" y1="${y + row * h / 6}" y2="${y + (row + 1) * h / 6}" stroke="${c2}" stroke-width="2"/>`; }
    return s;
  };

  // ---------- PARLOUR ----------
  A.parlour = () => {
    seed = 11;
    const tierPts = [[150, 330, 92], [228, 462, 132], [338, 602, 172], [458, 736, 212]];
    const cx = 1200;
    const tiers = tierPts.map(([top, bot, hw], i) => {
      const scallop = [];
      const n = 5 + i;
      for (let k = 0; k <= n; k++) scallop.push([cx - hw + (2 * hw * k) / n, bot + (k % 2 ? 10 : 0)]);
      let d = `M${cx} ${top} L${cx + hw} ${bot} `;
      for (let k = n; k >= 0; k--) d += `Q${scallop[k][0] + hw / n} ${bot + 16} ${scallop[k][0]} ${bot} `;
      d += 'Z';
      return `<path d="${d}" fill="url(#gPine)"/><path d="M${cx} ${top} L${cx - hw * 0.15} ${bot - 4} L${cx - hw} ${bot} Z" fill="#0f3a28" opacity=".45"/>`;
    }).join('');
    const treeLights = [];
    tierPts.forEach(([top, bot, hw], i) => { for (let k = 1; k < 6 + i; k++) { const t = k / (6 + i); treeLights.push([cx - hw * 0.85 + hw * 1.7 * t, bot - 26 - Math.sin(t * Math.PI) * 18 + (i * 3)]); } });

    const baubles = [
      [1172, 298, 'red'], [1272, 428, 'red'], [1112, 548, 'red'], [1312, 672, 'red'],
      [1222, 392, 'gold'], [1178, 662, 'gold'],
      [1222, 262, 'blue'], [1140, 440, 'blue'], [1292, 548, 'blue'], [1078, 700, 'blue'], [1238, 598, 'blue'],
      [1252, 326, 'purple'], [1182, 486, 'purple'], [1360, 700, 'purple'],
    ].map(([x, y, c]) => bauble(x, y, A.C[c])).join('');

    const stocking = (x, fill, cuff, flip) => `<g transform="translate(${x} 428) ${flip ? 'scale(-1 1)' : ''}"><path d="M-22 0 H22 V70 Q22 92 44 98 Q60 104 56 122 Q50 138 26 132 Q-12 124 -22 92 Z" fill="${fill}"/><path d="M-22 0 H22 V70 Q22 92 44 98 Q60 104 56 122" fill="none" stroke="#00000030" stroke-width="3"/><rect x="-27" y="-4" width="54" height="24" rx="8" fill="${cuff}"/><circle cx="0" cy="-8" r="4" fill="#d8a845"/></g>`;

    return `<svg viewBox="0 0 1600 900" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241020"/><stop offset=".6" stop-color="#4a1d27"/><stop offset="1" stop-color="#5e2a27"/></linearGradient>
      <pattern id="pPaper" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M40 14 l7 12 -7 12 -7 -12z M0 54 l7 12 -7 12 -7 -12z M80 54 l7 12 -7 12 -7 -12z" fill="#f6d9a8" opacity=".07"/><rect x="36" width="8" height="80" fill="#f6d9a8" opacity=".03"/></pattern>
      <clipPath id="pWin"><rect x="132" y="152" width="246" height="290" rx="3"/></clipPath>
      <linearGradient id="pDoorLight" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffcf7a"/><stop offset="1" stop-color="#b8642b"/></linearGradient>
      <linearGradient id="pStone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a6a61"/><stop offset="1" stop-color="#4e423c"/></linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#pWall)"/>
    <rect width="1600" height="600" fill="url(#pPaper)"/>
    <rect y="600" width="1600" height="190" fill="#2a1311" opacity=".7"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${30 + i * 200}" y="626" width="160" height="140" rx="6" fill="none" stroke="#6b3a26" stroke-opacity=".35" stroke-width="3"/>`).join('')}
    <rect y="594" width="1600" height="10" fill="#7a432a"/>
    ${plankFloor(790, 110, '#3a2216', '#24150d')}
    <ellipse cx="750" cy="660" rx="620" ry="420" fill="url(#gWarm)" class="firelight" opacity=".55"/>

    <!-- window -->
    <g>
      <rect x="112" y="132" width="286" height="330" rx="10" fill="#3b2216"/>
      <g clip-path="url(#pWin)">
        <rect x="132" y="152" width="246" height="290" fill="url(#gSky)"/>
        ${stars(132, 152, 246, 160, 26)}
        <circle cx="320" cy="205" r="34" fill="url(#gCool)"/><circle cx="320" cy="205" r="22" fill="#fdf3d0"/><circle cx="312" cy="200" r="4" fill="#e9dcae"/><circle cx="326" cy="213" r="3" fill="#e9dcae"/>
        <path d="M132 380 Q200 330 270 360 T378 350 V442 H132Z" fill="#a9c1e0"/>
        <path d="M132 410 Q230 370 378 400 V442 H132Z" fill="#e8f1ff"/>
        <path d="M180 378 l14 -14 14 14 v18 h-28z" fill="#2c3550"/><rect x="190" y="382" width="7" height="7" fill="#ffd27a" class="twinkle-slow"/>
        <path d="M300 368 l18 -18 18 18 v22 h-36z" fill="#2c3550"/><rect x="312" y="374" width="8" height="8" fill="#ffd27a"/>
        ${[[150, 400], [250, 395], [356, 392]].map(([x, y]) => `<path d="M${x} ${y} l-12 18 h24z M${x} ${y - 12} l-9 16 h18z" fill="#1f3d3a"/>`).join('')}
        ${windowSnow(132, 152, 246, 290, 40)}
      </g>
      <rect x="250" y="152" width="8" height="290" fill="#3b2216"/><rect x="132" y="292" width="246" height="8" fill="#3b2216"/>
      <path d="M132 152 q30 6 40 30 q-20 -6 -40 6z M378 152 q-34 4 -44 26 q22 -8 44 2z M132 442 q26 -10 50 0 z" fill="#fff" opacity=".35"/>
      <rect x="100" y="456" width="310" height="18" rx="4" fill="#5e3820"/><rect x="100" y="452" width="310" height="8" rx="3" fill="#f3f6ff" opacity=".9"/>
      <path d="M86 110 H170 Q150 260 168 420 Q150 470 120 476 Q90 470 86 440Z" fill="#8f1d2c"/><path d="M110 120 Q100 280 118 460" stroke="#6d1220" stroke-width="6" fill="none"/>
      <path d="M424 110 H340 Q360 260 342 420 Q360 470 390 476 Q420 470 424 440Z" fill="#8f1d2c"/><path d="M400 120 Q410 280 392 460" stroke="#6d1220" stroke-width="6" fill="none"/>
      <rect x="70" y="100" width="370" height="16" rx="8" fill="#c99a3f"/>
    </g>

    <!-- desk -->
    <g filter="url(#fShadow)">
      <rect x="80" y="610" width="410" height="24" rx="5" fill="url(#gWood)"/>
      <rect x="98" y="634" width="374" height="110" fill="#4a2814"/>
      <rect x="114" y="648" width="160" height="38" rx="4" fill="#5c331b"/><rect x="296" y="648" width="160" height="38" rx="4" fill="#5c331b"/>
      <circle cx="194" cy="667" r="5" fill="#d8a845"/><circle cx="376" cy="667" r="5" fill="#d8a845"/>
      <rect x="104" y="740" width="20" height="78" fill="#3e2211"/><rect x="446" y="740" width="20" height="78" fill="#3e2211"/>
    </g>
    <g>
      <rect x="410" y="586" width="44" height="24" rx="4" fill="url(#gBrass)"/><rect x="420" y="520" width="24" height="70" rx="3" fill="#f7ecd2"/>
      <ellipse cx="432" cy="486" rx="40" ry="50" fill="url(#gWarm)" class="flicker-glow"/>
      <path d="M432 492 q-10 16 0 28 q10 -12 0 -28z" fill="url(#gFlame)" class="candle-flame"/>
      <path d="M118 610 h40 v-26 q-20 -10 -40 0z" fill="#1d2433"/><path d="M146 590 q30 -70 70 -100 q-20 40 -64 102z" fill="#f4efe2"/>
    </g>
    ${hs('letter', "Grandpa's letter", `
      <rect x="180" y="480" width="180" height="150" fill="#000" opacity="0"/>
      <g transform="rotate(-7 260 556)">
        <rect x="196" y="498" width="140" height="112" rx="3" fill="url(#gPaper)" filter="url(#fShadow)"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="210" x2="${300 + (i % 2) * 18}" y1="${516 + i * 12}" y2="${516 + i * 12}" stroke="#5a4636" stroke-width="2" opacity=".55"/>`).join('')}
        <path d="M222 590 q10 -12 18 0 t18 0 t18 0 t18 0 M226 596 q12 8 22 -2 t22 2 t20 -4" stroke="${A.C.red}" stroke-width="3" fill="none"/>
        <circle cx="318" cy="596" r="8" fill="#a3172a"/>
      </g>`)}

    <!-- wreath -->
    <g transform="translate(750 196)">
      ${Array.from({ length: 28 }, (_, i) => { const a = i / 28 * Math.PI * 2; return `<ellipse cx="${(Math.cos(a) * 62).toFixed(0)}" cy="${(Math.sin(a) * 62).toFixed(0)}" rx="22" ry="11" fill="${i % 2 ? '#1f6b4a' : '#2a8259'}" transform="rotate(${(a * 180 / Math.PI + 60).toFixed(0)} ${(Math.cos(a) * 62).toFixed(0)} ${(Math.sin(a) * 62).toFixed(0)})"/>`; }).join('')}
      ${Array.from({ length: 9 }, (_, i) => { const a = i / 9 * Math.PI * 2 + .3; return `<circle cx="${(Math.cos(a) * 60).toFixed(0)}" cy="${(Math.sin(a) * 60).toFixed(0)}" r="6" fill="${A.C.red}"/>`; }).join('')}
      <path d="M0 64 l-30 -18 q-8 14 0 26z M0 64 l30 -18 q8 14 0 26z" fill="#c22436"/><path d="M-4 66 l-18 40 h12z M4 66 l18 40 h-12z" fill="#a3172a"/><circle cx="0" cy="64" r="8" fill="#e2384b"/>
    </g>

    <!-- fireplace -->
    <g>
      <rect x="556" y="420" width="388" height="378" fill="url(#pStone)"/>
      ${Array.from({ length: 22 }, (_, i) => { const row = Math.floor(i / 4); const col = i % 4; const x = 566 + col * 94 + (row % 2) * 40; return x < 900 ? `<rect x="${x}" y="${432 + row * 60}" width="${r1(70, 88).toFixed(0)}" height="50" rx="10" fill="#000" opacity="${r1(.06, .16).toFixed(2)}"/>` : ''; }).join('')}
      <path d="M616 798 V566 Q616 498 686 498 H814 Q884 498 884 566 V798Z" fill="#140906"/>
      <ellipse cx="750" cy="720" rx="150" ry="120" fill="url(#gWarm)" class="flicker-glow"/>
      <g class="fire">
        <path class="flame fl1" d="M680 770 Q660 700 700 650 Q706 690 722 700 Q716 640 752 590 Q760 650 790 680 Q800 650 796 630 Q840 690 820 770Z" fill="#ff6a1f"/>
        <path class="flame fl2" d="M694 770 Q684 714 716 680 Q722 708 736 714 Q736 666 760 640 Q768 690 786 704 Q810 730 806 770Z" fill="#ffae3b"/>
        <path class="flame fl3" d="M716 770 Q712 730 736 710 Q744 734 756 736 Q760 706 772 696 Q790 740 784 770Z" fill="#fff0b3"/>
        ${Array.from({ length: 8 }, (_, i) => `<circle class="ember" cx="${r1(700, 800).toFixed(0)}" cy="740" r="${r1(1.5, 3).toFixed(1)}" fill="#ffcf6a" style="animation-delay:${r1(0, 3).toFixed(1)}s;--dx:${r1(-30, 30).toFixed(0)}px"/>`).join('')}
      </g>
      <rect x="660" y="760" width="190" height="24" rx="12" fill="#5a3320" transform="rotate(-6 750 772)"/><rect x="650" y="770" width="200" height="26" rx="13" fill="#6e3f25" transform="rotate(5 750 782)"/>
      <circle cx="846" cy="788" r="11" fill="#a37451"/><circle cx="846" cy="788" r="6" fill="none" stroke="#6e3f25" stroke-width="2"/>
      <rect x="532" y="396" width="436" height="32" rx="5" fill="url(#gWood)" filter="url(#fShadow)"/>
      <rect x="532" y="396" width="436" height="6" rx="3" fill="#a46b42"/>
      <rect x="536" y="790" width="428" height="18" fill="#3f342f"/>
    </g>

    ${hs('cards', 'Christmas cards on the mantelpiece', `
      <rect x="548" y="340" width="150" height="58" fill="#000" opacity="0"/><rect x="804" y="340" width="150" height="58" fill="#000" opacity="0"/>
      ${[[560, -8, '#c22436'], [600, 4, '#f7eedc'], [645, -4, '#1f6b4a'], [815, 6, '#2f5fb0'], [858, -6, '#f7eedc'], [900, 5, '#c22436']].map(([x, r, c], i) => `<g transform="rotate(${r} ${x + 18} 396)" filter="url(#fShadow)"><path d="M${x} 396 L${x + 6} 350 L${x + 40} 350 L${x + 36} 396Z" fill="${c}"/><path d="M${x + 6} 350 L${x + 40} 350" stroke="#00000033" stroke-width="2"/>${c === '#f7eedc' ? `<path d="M${x + 22} 360 l3 7 7 0 -6 4 2 7 -6 -4 -6 4 2 -7 -6 -4 7 0z" fill="#d7263d"/>` : `<circle cx="${x + 22}" cy="${372}" r="7" fill="#fff" opacity=".85"/><path d="M${x + 22} 362 v20 M${x + 13} 372 h18" stroke="#fff" stroke-width="2" opacity=".6"/>`}</g>`).join('')}`)}
    ${stocking(620, '#c22436', '#f7eedc')}${stocking(750, '#1f6b4a', '#f7eedc')}${stocking(880, '#f7eedc', '#c22436', true)}
    ${garland(540, 960, 404, 16)}
    <!-- mantel clock, stopped -->
    <g transform="translate(750 340)" filter="url(#fShadow)">
      <path d="M-46 56 V-6 Q-46 -50 0 -54 Q46 -50 46 -6 V56Z" fill="url(#gWoodDark)"/>
      <circle r="30" fill="#f7eedc" stroke="url(#gBrass)" stroke-width="5"/>
      ${Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<circle cx="${(Math.sin(a) * 23).toFixed(1)}" cy="${(-Math.cos(a) * 23).toFixed(1)}" r="${i % 3 ? 1.4 : 2.4}" fill="#3a2a1e"/>`; }).join('')}
      <line x1="0" y1="0" x2="-1" y2="-15" stroke="#1d140e" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="0" y1="0" x2="-2.5" y2="-24" stroke="#1d140e" stroke-width="2" stroke-linecap="round"/>
      <circle r="2.5" fill="#d8a845"/>
    </g>

    <!-- tree -->
    <ellipse cx="1200" cy="788" rx="230" ry="26" fill="#000" opacity=".35"/>
    <rect x="1182" y="720" width="36" height="66" fill="#4a2a17"/>
    <g filter="url(#fBevel)">${tiers}</g>
    ${garland(1130, 1270, 300, 12).replace(/<ellipse[^>]*>/g, '')}
    ${fairy(treeLights)}
    ${baubles}
    <g transform="translate(1200 148)"><g class="star-top">
      <circle r="44" fill="url(#gWarm)"/>
      <path d="M0 -34 L9 -11 L33 -10 L14 5 L21 29 L0 15 L-21 29 L-14 5 L-33 -10 L-9 -11Z" fill="#ffd45c" stroke="#e09e1d" stroke-width="2" filter="url(#fGlow)"/>
    </g></g>
    <path d="M1010 784 Q1200 730 1390 784 Q1200 820 1010 784Z" fill="#a3172a"/><path d="M1020 784 Q1200 760 1380 784" stroke="#f7eedc" stroke-width="5" stroke-dasharray="4 10" fill="none"/>
    <!-- decorative present -->
    <g filter="url(#fShadow)"><rect x="1050" y="738" width="90" height="70" rx="4" fill="#1f6b4a"/><rect x="1088" y="738" width="14" height="70" fill="#f7eedc"/><rect x="1050" y="766" width="90" height="12" fill="#f7eedc"/></g>
    <!-- the locked present -->
    ${hs('present', 'A locked present', `
      <g filter="url(#fShadow)">
        <rect x="1262" y="712" width="132" height="98" rx="5" fill="#c22436"/>
        <rect x="1262" y="712" width="132" height="98" rx="5" fill="url(#gShade)" opacity=".5"/>
        <rect x="1320" y="712" width="16" height="98" fill="#f2b632"/>
        <g id="pLid" class="lid">
          <rect x="1254" y="694" width="148" height="26" rx="5" fill="#d7263d"/><rect x="1320" y="694" width="16" height="26" fill="#f2b632"/>
          <path d="M1328 694 q-40 -40 -44 -6 q4 16 44 6z M1328 694 q40 -40 44 -6 q-4 16 -44 6z" fill="#f2b632" stroke="#c48b16" stroke-width="2"/>
          <circle cx="1328" cy="692" r="7" fill="#e7a51d"/>
        </g>
        <g id="pPadlock"><rect x="1312" y="744" width="32" height="28" rx="5" fill="url(#gBrass)"/><path d="M1318 746 v-10 a10 10 0 0 1 20 0 v10" stroke="#b6862e" stroke-width="5" fill="none"/><circle cx="1328" cy="758" r="4" fill="#5b3b0e"/></g>
        <path d="M1394 726 l22 22" stroke="#d9c38a" stroke-width="2"/>
        <g transform="rotate(12 1430 760)"><rect x="1408" y="744" width="46" height="34" rx="4" fill="#f7eedc"/><circle cx="1418" cy="754" r="5" fill="${A.C.red}"/><circle cx="1432" cy="754" r="5" fill="${A.C.gold}"/><circle cx="1418" cy="768" r="5" fill="${A.C.blue}"/><circle cx="1432" cy="768" r="5" fill="${A.C.purple}"/><circle cx="1446" cy="750" r="2.5" fill="#999"/></g>
      </g>`)}

    <!-- door -->
    ${hs('door', 'The workshop door', `
      <rect x="1424" y="240" width="166" height="570" fill="#2a160d"/>
      <g id="pDoorOpen" style="display:none">
        <rect x="1440" y="258" width="134" height="550" fill="url(#pDoorLight)"/>
        <ellipse cx="1507" cy="600" rx="120" ry="260" fill="url(#gWarm)" class="flicker-glow"/>
        <path d="M1440 258 L1478 232 V832 L1440 808Z" fill="#5a3019"/>
        <text x="1520" y="540" text-anchor="middle" font-family="Fraunces, serif" font-size="22" fill="#3a1d0c" font-weight="700">Workshop</text>
        <path d="M1500 560 h30 l-8 -8 m8 8 l-8 8" stroke="#3a1d0c" stroke-width="3" fill="none"/>
      </g>
      <g id="pDoorClosed" filter="url(#fBevel)">
        <rect x="1440" y="258" width="134" height="550" fill="url(#gWood)"/>
        <rect x="1456" y="280" width="102" height="200" rx="6" fill="none" stroke="#3e2211" stroke-width="5"/>
        <rect x="1456" y="510" width="102" height="270" rx="6" fill="none" stroke="#3e2211" stroke-width="5"/>
        <g transform="translate(1507 380) scale(.5)">${Array.from({ length: 20 }, (_, i) => { const a = i / 20 * Math.PI * 2; return `<ellipse cx="${(Math.cos(a) * 60).toFixed(0)}" cy="${(Math.sin(a) * 60).toFixed(0)}" rx="24" ry="12" fill="${i % 2 ? '#1f6b4a' : '#2a8259'}" transform="rotate(${(a * 180 / Math.PI + 60).toFixed(0)} ${(Math.cos(a) * 60).toFixed(0)} ${(Math.sin(a) * 60).toFixed(0)})"/>`; }).join('')}<path d="M0 62 l-26 -16 q-8 12 0 22z M0 62 l26 -16 q8 12 0 22z" fill="#c22436"/></g>
        <circle cx="1552" cy="560" r="9" fill="url(#gBrass)"/>
        <g transform="translate(1507 610)"><rect x="-44" y="-18" width="88" height="44" rx="8" fill="url(#gBrass)" stroke="#8a6420" stroke-width="2"/><path d="M-26 -16 v-14 a26 26 0 0 1 52 0 v14" stroke="#b6862e" stroke-width="7" fill="none"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${-38 + i * 9.6}" y="-6" width="8" height="20" rx="1.5" fill="#f7eedc"/>`).join('')}</g>
      </g>`)}

    ${dust(500, 300, 600, 400, 22)}
    ${ceiling()}
    ${fgBranch(-60, 40, false)}${fgBranch(1660, 60, true)}
    ${fgBokeh([[1560, 860, 40, '#ffb347', .35], [40, 870, 30, '#ff8a3d', .3], [1500, 120, 22, '#ffd98a', .3]])}
    <path d="M0 0H1600V900H0Z" fill="url(#gVig)" pointer-events="none"/>
    </svg>`;
  };

  // ---------- WORKSHOP ----------
  A.bellShape = (c, extra = '') => `<g ${extra}>
    <path d="M0 -60 C27 -60 35 -30 37 0 C39 26 45 40 58 48 L-58 48 C-45 40 -39 26 -37 0 C-35 -30 -27 -60 0 -60Z" fill="url(#bell-${c})" stroke="#00000040" stroke-width="2"/>
    <ellipse cx="0" cy="48" rx="58" ry="9" fill="url(#bell-${c})" stroke="#00000040" stroke-width="2"/>
    <circle cx="0" cy="62" r="10" fill="url(#bell-${c})" stroke="#00000040" stroke-width="2"/>
    <path d="M-12 -40 Q-22 0 -26 34" stroke="#fff" stroke-opacity=".45" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="-8" y="-74" width="16" height="16" rx="5" fill="#8a6420"/></g>`;

  A.workshop = (bellX) => {
    seed = 23;
    const toys = `
      <g transform="translate(330 140)"><rect x="-10" y="0" width="20" height="44" rx="4" fill="#c22436"/><circle cy="-8" r="10" fill="#f2d3b0"/><rect x="-11" y="-26" width="22" height="16" rx="3" fill="#1d2433"/><rect x="-10" y="44" width="8" height="18" fill="#1d2433"/><rect x="2" y="44" width="8" height="18" fill="#1d2433"/></g>
      <g transform="translate(410 160)"><rect x="-26" y="10" width="52" height="30" rx="4" fill="#2f7fe0"/><rect x="0" y="-8" width="22" height="20" fill="#2f7fe0"/><rect x="-20" y="0" width="8" height="12" fill="#1d2433"/><circle cx="-14" cy="44" r="8" fill="#1d2433"/><circle cx="14" cy="44" r="8" fill="#1d2433"/></g>
      <g transform="translate(470 168)"><circle r="20" fill="#f2b632"/><circle r="20" fill="url(#gShade)"/><path d="M-20 0 h40" stroke="#c22436" stroke-width="4"/></g>`;
    const bells = ['red', 'gold', 'green', 'blue', 'silver'].map((c, i) => `<g transform="translate(${bellX[i]} 308)"><line x1="0" y1="-62" x2="0" y2="-30" stroke="#3a2111" stroke-width="3"/><g transform="translate(0 30) scale(.55)"><g class="bell-swing" id="wb-${c}" filter="url(#fBevel)">${A.bellShape(c)}</g></g></g>`).join('');
    return `<svg viewBox="0 0 1600 900" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#21140e"/><stop offset=".7" stop-color="#3f2716"/><stop offset="1" stop-color="#4c2f1a"/></linearGradient>
      <clipPath id="wWin"><path d="M612 420 V200 Q612 100 740 100 Q868 100 868 200 V420Z"/></clipPath>
    </defs>
    <rect width="1600" height="900" fill="url(#wWall)"/>
    ${Array.from({ length: 20 }, (_, i) => `<rect x="${i * 80}" y="0" width="78" height="800" fill="#000" opacity="${r1(0, .12).toFixed(2)}"/><line x1="${i * 80}" x2="${i * 80}" y1="0" y2="800" stroke="#1a0f08" stroke-width="3"/>`).join('')}
    ${plankFloor(800, 100, '#2e1b10', '#1a0f08')}
    <ellipse cx="800" cy="300" rx="700" ry="520" fill="url(#gWarm)" opacity=".45" class="firelight"/>
    <g transform="translate(-40 0)"><!-- window -->
    <path d="M598 432 V198 Q598 86 740 86 Q882 86 882 198 V432Z" fill="#2a170c"/>
    <g clip-path="url(#wWin)"><rect x="600" y="90" width="280" height="340" fill="url(#gSky)"/>${stars(612, 100, 256, 180, 30)}
      <path d="M612 360 Q700 300 868 340 V420 H612Z" fill="#c9daf2"/><path d="M612 390 Q760 350 868 380 V420 H612Z" fill="#eef4ff"/>
      ${[[650, 340], [700, 352], [820, 330]].map(([x, y]) => `<path d="M${x} ${y} l-14 26 h28z M${x} ${y - 14} l-10 20 h20z" fill="#1f3d3a"/>`).join('')}
      ${windowSnow(612, 100, 256, 320, 46)}</g>
    <path d="M740 100 V420 M612 260 H868" stroke="#2a170c" stroke-width="8"/>
    <rect x="586" y="428" width="308" height="16" rx="4" fill="#5e3820"/>
    <!-- lamp -->
    <line x1="740" y1="0" x2="740" y2="54" stroke="#1a0f08" stroke-width="3"/>
    <ellipse cx="740" cy="110" rx="200" ry="140" fill="url(#gWarm)" class="flicker-glow" opacity=".8"/>
    <path d="M700 54 h80 l24 40 h-128z" fill="#2f4a3a"/><ellipse cx="740" cy="96" rx="20" ry="8" fill="#fff3c4" filter="url(#fGlow)"/></g>
    <!-- shelf with toys -->
    <rect x="290" y="208" width="230" height="14" rx="3" fill="url(#gWood)"/>${toys}

    <!-- bell rack -->
    ${hs('bells', 'The bell rack', `
      <rect x="60" y="230" width="490" height="400" fill="#000" opacity="0"/>
      <rect x="70" y="236" width="470" height="20" rx="5" fill="url(#gWood)" filter="url(#fShadow)"/>
      <rect x="80" y="236" width="18" height="380" fill="url(#gWoodDark)"/><rect x="512" y="236" width="18" height="380" fill="url(#gWoodDark)"/>
      ${bells}
      <rect x="60" y="604" width="490" height="22" rx="5" fill="url(#gWood)" filter="url(#fShadow)"/>
      <g transform="translate(305 560)" filter="url(#fShadow)">
        <rect x="-80" y="0" width="160" height="44" rx="5" fill="#7a2030"/><rect x="-80" y="0" width="160" height="44" rx="5" fill="url(#gShade)" opacity=".4"/>
        <g id="wMbLid" class="lid"><rect x="-86" y="-16" width="172" height="20" rx="5" fill="#922538"/><rect x="-14" y="-14" width="28" height="12" rx="2" fill="url(#gBrass)"/></g>
        <path d="M-60 22 h120" stroke="url(#gBrass)" stroke-width="3"/>
        <g transform="translate(92 22)"><rect x="0" y="-3" width="20" height="6" fill="url(#gBrass)"/><rect x="16" y="-12" width="6" height="24" rx="3" fill="url(#gBrass)"/></g>
      </g>
      <g transform="translate(150 480) rotate(-6)"><rect x="-56" y="-40" width="112" height="80" rx="3" fill="url(#gPaper)"/>${[0, 1, 2, 3, 4].map((i) => `<line x1="-46" x2="46" y1="${-24 + i * 9}" y2="${-24 + i * 9}" stroke="#5a4636" stroke-width="1.2"/>`).join('')}<path d="M56 -40 l-14 18 l10 10 l-8 14 l12 12 l-10 14 l10 12" stroke="#d9c7a4" stroke-width="3" fill="none"/><text x="-4" y="30" text-anchor="middle" font-family="Fraunces, serif" font-size="12" fill="#5a4636" font-style="italic">torn melody</text></g>
    `)}

    <!-- painting -->
    ${hs('tiles', 'A scrambled painting', `<g transform="translate(-66 0)">
      <g filter="url(#fShadow)">
        <rect x="936" y="104" width="272" height="272" rx="6" fill="url(#gBrass)"/>
        <rect x="950" y="118" width="244" height="244" fill="#0d1830"/>
        <g id="wPainting" transform="translate(950 118) scale(${244 / 600})"></g>
        <rect x="950" y="118" width="244" height="244" fill="none" stroke="#7a5418" stroke-width="3"/>
      </g>
      </g>
    `)}

    <!-- ladder + hatch -->
    ${hs('hatch', 'A hatch in the ceiling', `
      <rect x="1150" y="0" width="150" height="820" fill="#000" opacity="0"/>
      <rect x="1158" y="0" width="140" height="44" fill="#1a0f08"/>
      <g id="wHatchClosed"><rect x="1164" y="4" width="128" height="34" rx="3" fill="url(#gWoodDark)"/><path d="M1164 20 h128" stroke="#1a0f08" stroke-width="2"/><g transform="translate(1228 22)"><circle r="10" fill="url(#gBrass)"/><path d="M0 -5 L1.5 -1.5 L5 -1.5 L2.2 .8 L3.2 4.5 L0 2.4 L-3.2 4.5 L-2.2 .8 L-5 -1.5 L-1.5 -1.5Z" fill="#3a2410"/></g></g>
      <g id="wHatchOpen" style="display:none"><rect x="1164" y="4" width="128" height="40" fill="#0b1226"/>${stars(1170, 6, 116, 34, 8)}<path d="M1164 40 L1150 120 L1180 120 L1190 40Z" fill="url(#gWoodDark)"/><text x="1228" y="72" text-anchor="middle" font-family="Fraunces, serif" font-size="18" fill="#ffd98a" font-weight="700">Attic ↑</text></g>
      <rect x="1190" y="40" width="12" height="780" fill="url(#gWood)"/><rect x="1256" y="40" width="12" height="780" fill="url(#gWood)"/>
      ${Array.from({ length: 12 }, (_, i) => `<rect x="1194" y="${90 + i * 62}" width="70" height="10" rx="3" fill="#7a4a2c"/>`).join('')}
    `)}

    <!-- workbench -->
    <g filter="url(#fShadow)">
      <rect x="520" y="586" width="620" height="30" rx="5" fill="url(#gWood)"/>
      <rect x="540" y="616" width="24" height="200" fill="#3e2211"/><rect x="1096" y="616" width="24" height="200" fill="#3e2211"/>
      <rect x="540" y="716" width="580" height="16" fill="#3e2211"/>
    </g>
    ${hs('album', "Grandpa's photo album", `
      <rect x="950" y="520" width="140" height="70" fill="#000" opacity="0"/>
      <g filter="url(#fShadow)"><path d="M958 584 L976 548 L1086 548 L1072 584Z" fill="#2f5fb0"/><path d="M958 584 L976 548 L1086 548 L1072 584Z" fill="url(#gShade)" opacity=".5"/>
      <path d="M972 584 L986 556 L1066 556 L1056 584Z" fill="#f7eedc" opacity=".2"/><path d="M990 560 L1048 560 L1042 578 L984 578Z" fill="#f7eedc"/><path d="M996 574 l10 -8 8 6 10 -10 12 12z" fill="#2f7fe0" opacity=".7"/>
      <path d="M958 584 L1072 584 L1072 590 L958 590Z" fill="#1d3b70"/></g>`)}
    <g transform="translate(900 572)"><path d="M0 0 l40 -10 l4 6 l-40 10z" fill="#8a8f99"/><rect x="-30" y="-2" width="34" height="12" rx="4" fill="#7a2030"/></g>
    ${hs('ledger', "The elves' ledger", `
      <g transform="translate(720 560)">
        <path d="M-130 26 Q-60 6 0 22 Q60 6 130 26 L120 -40 Q60 -54 0 -40 Q-60 -54 -120 -40Z" fill="#7a2030"/>
        <path d="M-116 18 Q-60 0 -2 16 L-2 -36 Q-60 -50 -110 -36Z" fill="url(#gPaper)"/>
        <path d="M116 18 Q60 0 2 16 L2 -36 Q60 -50 110 -36Z" fill="url(#gPaper)"/>
        ${[0, 1, 2, 3].map((i) => `<path d="M-100 ${-28 + i * 11} Q-60 ${-36 + i * 11} -14 ${-26 + i * 11}" stroke="#5a4636" stroke-width="1.5" fill="none" opacity=".6"/><path d="M14 ${-26 + i * 11} Q60 ${-36 + i * 11} 100 ${-28 + i * 11}" stroke="#5a4636" stroke-width="1.5" fill="none" opacity=".6"/>`).join('')}
        <path d="M-2 -38 v58" stroke="#5a3a2a" stroke-width="2"/>
        <path d="M40 -40 v52 l6 -6 l6 6 v-52" fill="${A.C.red}"/>
      </g>`)}

    <!-- toy cabinet -->
    ${hs('cabinet', 'The toy cabinet', `
      <g filter="url(#fShadow)">
        <rect x="1312" y="250" width="232" height="560" rx="8" fill="url(#gWoodDark)"/>
        <path d="M1312 250 h232 l-14 -26 h-204z" fill="#6b3d22"/>
        <rect x="1330" y="276" width="196" height="300" rx="4" fill="#1b2a3a"/>
        <rect x="1330" y="276" width="196" height="300" rx="4" fill="url(#gCool)" opacity=".25"/>
        ${[0, 1, 2].map((i) => `<rect x="1330" y="${370 + i * 100}" width="196" height="8" fill="#4a2a15"/>`).join('')}
        <g opacity=".85">
          <g transform="translate(1380 352) scale(.6)">${'HORSE'}</g>
        </g>
        <path d="M1428 276 v300" stroke="#4a2a15" stroke-width="6"/>
        <path d="M1340 286 l40 0 l-40 60z" fill="#fff" opacity=".07"/>
        <rect x="1330" y="600" width="196" height="190" rx="4" fill="#5a331c"/>
        <g id="wCabDials">${[0, 1, 2, 3].map((i) => `<g transform="translate(${1356 + i * 48} 650)"><circle r="18" fill="url(#gBrass)" stroke="#6b4a14" stroke-width="2"/><circle r="11" fill="#f7eedc"/><path d="M0 -14 v6" stroke="#3a2410" stroke-width="3"/></g>`).join('')}</g>
        <rect x="1376" y="712" width="104" height="18" rx="9" fill="url(#gBrass)"/>
        <g id="wCabOpen" style="display:none"><rect x="1330" y="600" width="196" height="190" rx="4" fill="#120a05"/><path d="M1330 600 l-30 14 v164 l30 12z" fill="#6b3d22"/><circle cx="1428" cy="700" r="50" fill="url(#gWarm)"/></g>
      </g>`)}

    ${hs('toParlour', 'Back to the parlour', `<g transform="translate(270 850)"><rect x="-44" y="-26" width="200" height="52" rx="26" fill="#0d1830" opacity=".75" stroke="#ffd98a" stroke-opacity=".6"/><path d="M-20 0 h28 m-28 0 l12 -12 m-12 12 l12 12" stroke="#ffd98a" stroke-width="4" fill="none" stroke-linecap="round"/><text x="22" y="7" font-family="Nunito, sans-serif" font-size="20" font-weight="800" fill="#ffe7b0">Parlour</text></g>`)}
    <g class="rays" pointer-events="none"><path d="M600 120 L840 120 L1100 800 L380 800Z" fill="url(#gRayCool)"/></g>
    ${dust(460, 160, 700, 600, 26)}
    ${ceiling()}
    ${fgBokeh([[1580, 70, 36, '#ffd98a', .35], [60, 120, 26, '#ffb347', .3], [1540, 880, 46, '#ff9e3d', .3]])}
    ${fgBranch(1680, 20, true)}
    <path d="M0 0H1600V900H0Z" fill="url(#gVig)" pointer-events="none"/>
    </svg>`;
  };

  // ---------- ATTIC ----------
  A.attic = () => {
    seed = 41;
    const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    return `<svg viewBox="0 0 1600 900" class="scene-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="aWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a2e"/><stop offset="1" stop-color="#2a2230"/></linearGradient>
      <radialGradient id="aFace" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e9f1ff" stop-opacity=".95"/><stop offset=".8" stop-color="#b9cbea" stop-opacity=".9"/><stop offset="1" stop-color="#8ea6cf" stop-opacity=".9"/></radialGradient>
      <clipPath id="aRound"><circle cx="1330" cy="300" r="96"/></clipPath>
    </defs>
    <rect width="1600" height="900" fill="url(#aWall)"/>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 100}" y="0" width="98" height="820" fill="#000" opacity="${r1(.02, .14).toFixed(2)}"/>`).join('')}
    ${plankFloor(810, 90, '#2a1c16', '#160e0a')}
    <ellipse cx="800" cy="380" rx="520" ry="420" fill="url(#gCool)" opacity=".5"/>
    <path d="M0 0 L520 0 L0 380Z" fill="#1a1210"/><path d="M1600 0 L1080 0 L1600 380Z" fill="#1a1210"/>
    <path d="M0 360 L500 0 M1600 360 L1100 0" stroke="#3e2a1e" stroke-width="34"/>
    <path d="M0 360 L500 0 M1600 360 L1100 0" stroke="#5a3a26" stroke-width="10"/>
    <rect x="0" y="40" width="1600" height="26" fill="#3e2a1e"/>

    <!-- Great clock -->
    <g transform="translate(800 352)">
      <circle r="290" fill="url(#gCool)" class="clock-glow"/>
      <circle r="262" fill="#2d2a33" stroke="url(#gBrass)" stroke-width="16" filter="url(#fBevel)"/>
      <circle r="238" fill="url(#aFace)"/>
      ${Array.from({ length: 60 }, (_, i) => { const a = i / 60 * Math.PI * 2; const r0 = i % 5 ? 222 : 212; return `<line x1="${(Math.sin(a) * r0).toFixed(1)}" y1="${(-Math.cos(a) * r0).toFixed(1)}" x2="${(Math.sin(a) * 232).toFixed(1)}" y2="${(-Math.cos(a) * 232).toFixed(1)}" stroke="#2a2f45" stroke-width="${i % 5 ? 2 : 5}"/>`; }).join('')}
      ${numerals.map((n, i) => { const a = i / 12 * Math.PI * 2; return `<text x="${(Math.sin(a) * 180).toFixed(1)}" y="${(-Math.cos(a) * 180 + 12).toFixed(1)}" text-anchor="middle" font-family="Fraunces, serif" font-size="36" font-weight="700" fill="#2a2f45">${n}</text>`; }).join('')}
      <g opacity=".22">${[0, 1, 2].map((k) => `<g class="spin-slow" style="animation-duration:${30 + k * 12}s"><g transform="translate(${[-60, 70, 0][k]} ${[-40, 30, 90][k]})">${A.gear([70, 50, 40][k], [14, 10, 8][k], '#41506e')}</g></g>`).join('')}</g>
      <g id="aHour" class="clock-hand"><path d="M-8 20 L0 -120 L8 20Z" fill="#1d2233"/></g>
      <g id="aMin" class="clock-hand" style="transform:rotate(-6deg)"><path d="M-5 26 L0 -196 L5 26Z" fill="#1d2233"/></g>
      <circle r="14" fill="url(#gBrass)"/>
    </g>

    <!-- plaque -->
    ${hs('final', 'An engraved brass plaque', `
      <g filter="url(#fShadow)"><rect x="600" y="650" width="400" height="58" rx="10" fill="url(#gBrass)" stroke="#7a5418" stroke-width="3"/>
      <text x="800" y="690" text-anchor="middle" font-family="Fraunces, serif" font-size="34" font-weight="700" letter-spacing="10" fill="#4a3210" opacity=".22">OJBZOCZM</text><g opacity=".7" pointer-events="none">${[[680, 676, 70], [770, 682, 60], [850, 674, 74], [920, 683, 50]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="20" fill="#eef6ff" opacity=".55"/>`).join('')}${[700, 790, 880].map((x) => `<path transform="translate(${x} 680)" d="M0 -12 V12 M-10 -6 L10 6 M-10 6 L10 -6" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`).join('')}</g>
      ${[612, 988].map((x) => `<circle cx="${x}" cy="679" r="4" fill="#7a5418"/>`).join('')}</g>`)}

    <!-- mechanism case -->
    ${hs('gears', 'The clock mechanism', `
      <g filter="url(#fShadow)"><rect x="660" y="722" width="280" height="96" rx="8" fill="url(#gWoodDark)"/><rect x="674" y="732" width="252" height="76" rx="4" fill="#0f1422"/>
      <g transform="translate(708 770)"><g class="spin-slow mech" style="animation-duration:12s">${A.gear(22, 9, 'url(#gBrass)')}</g></g>
      ${[[770, 26], [836, 22], [892, 19]].map(([x, r], i) => `<g id="aSlot${i}"><circle cx="${x}" cy="770" r="8" fill="#555"/><circle cx="${x}" cy="770" r="${r}" fill="none" stroke="#ffffff33" stroke-dasharray="5 5"/></g>`).join('')}
      <g id="aGear0" style="display:none" transform="translate(770 770)"><g class="spin-slow mech-r" style="animation-duration:9s">${A.gear(24, 11, 'url(#gBrass)')}</g></g>
      <g id="aGear1" style="display:none" transform="translate(836 770)"><g class="spin-slow mech" style="animation-duration:7s">${A.gear(20, 9, 'url(#gSilver)')}</g></g>
      <g id="aGear2" style="display:none" transform="translate(892 770)"><g class="spin-slow mech-r" style="animation-duration:5s">${A.gear(17, 8, 'url(#gCopper)')}</g></g>
      <rect x="674" y="732" width="252" height="76" rx="4" fill="url(#gCool)" opacity=".18"/></g>`)}

    ${hs('watch', "Grandpa's pocket watch", `
      <rect x="990" y="620" width="160" height="200" fill="#000" opacity="0"/>
      <g filter="url(#fShadow)"><ellipse cx="1070" cy="664" rx="78" ry="16" fill="#6b3d22"/><rect x="996" y="664" width="148" height="10" fill="#4e2b17"/>
      <path d="M1012 672 L1004 816 M1128 672 L1136 816 M1070 676 L1070 816" stroke="#4e2b17" stroke-width="9"/></g>
      <g filter="url(#fShadow)"><path d="M1094 650 q30 -6 34 8" stroke="url(#gBrass)" stroke-width="3" fill="none" stroke-dasharray="4 3"/>
      <ellipse cx="1066" cy="650" rx="26" ry="12" fill="url(#gBrass)"/><ellipse cx="1066" cy="648" rx="20" ry="8" fill="#f7eedc"/><rect x="1062" y="634" width="8" height="7" rx="2" fill="url(#gBrass)"/></g>`)}

    <!-- cipher wheel -->
    ${hs('wheel', 'A cipher wheel on a stand', `
      <rect x="210" y="390" width="260" height="440" fill="#000" opacity="0"/>
      <g filter="url(#fShadow)">
        <path d="M290 820 l26 -200 h48 l26 200z" fill="url(#gWoodDark)"/><rect x="246" y="806" width="188" height="20" rx="6" fill="url(#gWood)"/>
        <g transform="translate(340 520)"><circle r="120" fill="url(#gBrass)" stroke="#7a5418" stroke-width="4"/><circle r="94" fill="#f7eedc"/><circle r="64" fill="#2b2f45"/>
        ${Array.from({ length: 26 }, (_, i) => { const a = i / 26 * Math.PI * 2; return `<text x="${(Math.sin(a) * 107).toFixed(1)}" y="${(-Math.cos(a) * 107 + 5).toFixed(1)}" text-anchor="middle" font-family="Fraunces, serif" font-size="14" font-weight="700" fill="#4a3210">${String.fromCharCode(65 + i)}</text>`; }).join('')}
        <g>${Array.from({ length: 26 }, (_, i) => { const a = i / 26 * Math.PI * 2; return `<text x="${(Math.sin(a) * 79).toFixed(1)}" y="${(-Math.cos(a) * 79 + 5).toFixed(1)}" text-anchor="middle" font-family="Fraunces, serif" font-size="13" font-weight="700" fill="#3a2f2a">${String.fromCharCode(65 + i)}</text>`; }).join('')}</g>
        <path d="M0 -40 L9 -12 L38 -12 L15 5 L23 32 L0 16 L-23 32 L-15 5 L-38 -12 L-9 -12Z" fill="#ffd45c"/></g>
      </g>`)}

    <!-- round window + telescope -->
    ${hs('telescope', 'A brass telescope', `
      <rect x="1210" y="180" width="300" height="660" fill="#000" opacity="0"/>
      <circle cx="1330" cy="300" r="110" fill="#2a1c16"/>
      <g clip-path="url(#aRound)"><rect x="1220" y="190" width="220" height="220" fill="url(#gSky)"/>${stars(1234, 200, 200, 200, 40)}<circle cx="1380" cy="250" r="30" fill="#fdf3d0" filter="url(#fGlow)"/><circle cx="1392" cy="242" r="26" fill="#1a2f5e"/>${windowSnow(1220, 190, 220, 220, 24)}</g>
      <path d="M1330 190 v220 M1220 300 h220" stroke="#2a1c16" stroke-width="8"/>
      <circle cx="1330" cy="300" r="104" fill="none" stroke="#5a3a26" stroke-width="10"/>
      <g transform="translate(1300 660)"><path d="M-60 160 L0 0 L60 160 M0 0 V160" stroke="#3e2a1e" stroke-width="10" fill="none"/>
      <g transform="rotate(-32)"><rect x="-30" y="-16" width="170" height="32" rx="8" fill="url(#gBrass)"/><rect x="-60" y="-11" width="40" height="22" rx="5" fill="#8a6420"/><rect x="130" y="-21" width="22" height="42" rx="6" fill="#b88d34"/></g></g>`)}

    ${hs('toWorkshop', 'Down to the workshop', `<g transform="translate(1440 850)"><rect x="-70" y="-26" width="200" height="52" rx="26" fill="#0d1830" opacity=".75" stroke="#ffd98a" stroke-opacity=".6"/><path d="M-44 -12 v24 m0 0 l-11 -11 m11 11 l11 -11" stroke="#ffd98a" stroke-width="4" fill="none" stroke-linecap="round"/><text x="-20" y="7" font-family="Nunito, sans-serif" font-size="20" font-weight="800" fill="#ffe7b0">Workshop</text></g>`)}
    <g class="rays" pointer-events="none"><path d="M1260 240 L1400 240 L1300 820 L900 820Z" fill="url(#gRayCool)"/></g>
    ${dust(900, 260, 500, 500, 22)}
    ${fgBokeh([[30, 860, 44, '#cfe4ff', .25], [1590, 40, 30, '#cfe4ff', .25], [60, 60, 24, '#ffd98a', .25]])}
    <path d="M0 0H1600V900H0Z" fill="url(#gVig)" pointer-events="none"/>
    </svg>`;
  };

  // ---------- PAINTING (600x600) for the tile puzzle ----------
  A.painting = () => {
    seed = 99;
    return `<rect width="600" height="600" fill="url(#gSky)"/>
      ${stars(0, 0, 600, 320, 70)}
      <circle cx="470" cy="110" r="90" fill="url(#gCool)"/>
      <circle cx="470" cy="110" r="54" fill="#fdf3d0"/><circle cx="494" cy="96" r="50" fill="#14254c"/>
      <path d="M0 380 Q140 290 300 340 T600 310 V600 H0Z" fill="#7d97c2"/>
      <path d="M0 430 Q180 360 360 410 T600 400 V600 H0Z" fill="#c5d6ef"/>
      <!-- bunting -->
      <path d="M-10 26 Q190 120 410 20" stroke="#5a3a26" stroke-width="4" fill="none"/>
      ${Array.from({ length: 9 }, (_, i) => { const t = (i + .5) / 9; const x = -10 + 420 * t; const y = (1 - t) * (1 - t) * 26 + 2 * (1 - t) * t * 120 + t * t * 20; return `<path d="M${(x - 16).toFixed(0)} ${(y - 2).toFixed(0)} L${(x + 16).toFixed(0)} ${(y + 1).toFixed(0)} L${x.toFixed(0)} ${(y + 34).toFixed(0)}Z" fill="${['#d7263d', '#f2b632', '#2fae6b', '#2f7fe0'][i % 4]}"/>`; }).join('')}
      <!-- snowman -->
      <g transform="translate(300 330)">
        <circle cx="0" cy="62" r="46" fill="#ffffff"/><circle cx="0" cy="0" r="32" fill="#ffffff"/><circle cx="0" cy="-46" r="24" fill="#ffffff"/>
        <rect x="-20" y="-86" width="40" height="30" rx="3" fill="#1d2233"/><rect x="-30" y="-60" width="60" height="8" rx="3" fill="#1d2233"/>
        <circle cx="-8" cy="-50" r="3.5" fill="#1d2233"/><circle cx="8" cy="-50" r="3.5" fill="#1d2233"/><path d="M0 -44 l22 6 l-22 2z" fill="#f08a3f"/>
        <path d="M-30 -24 Q0 -10 30 -24 L30 -16 Q0 -2 -30 -16Z" fill="#d7263d"/><path d="M20 -18 l8 30 l-12 0z" fill="#d7263d"/>
        <circle cx="0" cy="-4" r="4" fill="#1d2233"/><circle cx="0" cy="12" r="4" fill="#1d2233"/>
        <path d="M-30 0 L-70 -30 M-56 -20 l-6 -14 M30 0 L72 -26 M58 -17 l4 -14" stroke="#5a3a26" stroke-width="5" stroke-linecap="round"/>
      </g>
      <!-- reindeer on the hill -->
      <g transform="translate(470 330)" fill="#2a2234">
        <ellipse cx="0" cy="0" rx="34" ry="16"/><rect x="-26" y="8" width="6" height="34"/><rect x="-12" y="8" width="6" height="34"/><rect x="12" y="8" width="6" height="34"/><rect x="24" y="8" width="6" height="34"/>
        <path d="M26 -6 L44 -34 L54 -30 L40 -2Z"/><ellipse cx="52" cy="-36" rx="12" ry="8"/>
        <path d="M46 -42 l-10 -26 m4 10 l-12 -6 m18 22 l6 -28 m-3 12 l10 -8" stroke="#2a2234" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="63" cy="-36" r="4" fill="#d7263d"/>
      </g>
      <!-- village -->
      <g>
        <rect x="90" y="250" width="56" height="190" fill="#3c3446"/><path d="M84 252 L118 196 L152 252Z" fill="#7a2030"/>
        <circle cx="118" cy="296" r="22" fill="#f7eedc" stroke="#d8a845" stroke-width="3"/>${[0, 1, 2, 3].map((q) => `<circle cx="${118 + [0, 16, 0, -16][q]}" cy="${296 + [-16, 0, 16, 0][q]}" r="2" fill="#2a2234"/>`).join('')}<path d="M118 296 L118 314" stroke="#2a2234" stroke-width="2.5" stroke-linecap="round"/><path d="M118 296 L108 305" stroke="#2a2234" stroke-width="4" stroke-linecap="round"/>
        <rect x="108" y="350" width="20" height="30" fill="#ffd27a"/>
        ${[[170, 400, 80], [260, 420, 70], [30, 420, 60], [340, 440, 66]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${w * .7}" fill="#4a3a52"/><path d="M${x - 6} ${y} L${x + w / 2} ${y - w * .45} L${x + w + 6} ${y}Z" fill="#f7fbff"/><rect x="${x + w * .2}" y="${y + w * .2}" width="${w * .2}" height="${w * .2}" fill="#ffd27a"/><rect x="${x + w * .6}" y="${y + w * .2}" width="${w * .2}" height="${w * .2}" fill="#ffd27a"/>`).join('')}
      </g>
      ${[[40, 470], [130, 486], [420, 470], [560, 480]].map(([x, y]) => `<path d="M${x} ${y - 70} l-30 54 h60z M${x} ${y - 40} l-36 56 h72z" fill="#1d5a43"/><path d="M${x} ${y - 70} l-12 22 h24z" fill="#fff"/>`).join('')}
      <path d="M0 520 Q300 480 600 520 V600 H0Z" fill="#f7fbff"/>
      <!-- banner -->
      <g transform="translate(300 540)">
        <path d="M-210 -34 H210 L190 0 L210 34 H-210 L-190 0Z" fill="#c22436"/>
        <path d="M-176 -26 H176 V26 H-176Z" fill="#f7eedc"/>
        <text x="0" y="13" text-anchor="middle" font-family="Fraunces, serif" font-size="38" font-weight="800" fill="#7a1222">★ under F</text>
      </g>
      <path d="M0 0H600V600H0Z" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="6"/>`;
  };

  // ---------- small icons ----------
  A.icon = {
    lens: `<svg viewBox="0 0 80 80"><circle cx="34" cy="34" r="22" fill="#ff3b4e" opacity=".55" stroke="url(#gBrass)" stroke-width="7"/><path d="M50 50 L70 70" stroke="#6b3d22" stroke-width="10" stroke-linecap="round"/><path d="M24 24 q6 -6 14 -4" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/></svg>`,
    brassGear: `<svg viewBox="-50 -50 100 100"><g class="spin-slow" style="animation-duration:14s">${A.gear(32, 12, 'url(#gBrass)')}</g></svg>`,
    silverGear: `<svg viewBox="-50 -50 100 100"><g class="spin-slow" style="animation-duration:10s">${A.gear(28, 9, 'url(#gSilver)')}</g></svg>`,
    starKey: `<svg viewBox="0 0 80 80"><path d="M22 6 L27 18 L40 18 L30 26 L34 39 L22 31 L10 39 L14 26 L4 18 L17 18Z" fill="#ffd45c" stroke="#c48b16" stroke-width="2"/><rect x="19" y="36" width="7" height="38" rx="3" fill="url(#gBrass)"/><rect x="26" y="58" width="12" height="6" fill="url(#gBrass)"/><rect x="26" y="67" width="8" height="6" fill="url(#gBrass)"/></svg>`,
  };
  A.itemName = { lens: 'Red glass lens', brassGear: 'Brass gear', silverGear: 'Silver gear', starKey: 'Star-shaped key' };

  A.toy = {
    horse: `<svg viewBox="0 0 100 100"><path d="M10 82 Q50 100 90 82" stroke="#8a5532" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M28 80 L34 56 M70 80 L64 56" stroke="#5a321b" stroke-width="6"/><ellipse cx="50" cy="52" rx="26" ry="12" fill="#d7263d"/><path d="M68 48 L78 22 Q86 18 90 28 L84 34 L80 50Z" fill="#d7263d"/><path d="M76 22 Q66 26 64 40" stroke="#f2b632" stroke-width="5" fill="none"/><circle cx="83" cy="27" r="2.5" fill="#1d2433"/><path d="M24 50 Q12 52 12 66" stroke="#f2b632" stroke-width="5" fill="none"/></svg>`,
    drum: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="40" rx="32" ry="10" fill="#f7eedc"/><path d="M18 40 V74 Q50 88 82 74 V40 Q50 54 18 40Z" fill="#2f7fe0"/><path d="M18 46 L34 74 L50 50 L66 76 L82 46" stroke="#f2b632" stroke-width="4" fill="none"/><ellipse cx="50" cy="40" rx="32" ry="10" fill="none" stroke="#d7263d" stroke-width="5"/><path d="M30 26 L58 8 M70 26 L44 6" stroke="#8a5532" stroke-width="4" stroke-linecap="round"/><circle cx="58" cy="8" r="4" fill="#f7eedc"/><circle cx="44" cy="6" r="4" fill="#f7eedc"/></svg>`,
    kite: `<svg viewBox="0 0 100 100"><path d="M50 6 L78 36 L50 72 L22 36Z" fill="#f2b632"/><path d="M50 6 L78 36 L50 36Z M50 36 L22 36 L50 72Z" fill="#d7263d"/><path d="M50 6 V72 M22 36 H78" stroke="#7a1222" stroke-width="2"/><path d="M50 72 Q40 82 52 88 Q62 94 50 100" stroke="#5a4636" stroke-width="2" fill="none"/><path d="M44 82 l6 4 l-6 4z M56 90 l-6 4 l6 4z" fill="#2fae6b"/></svg>`,
    teddy: `<svg viewBox="0 0 100 100"><circle cx="30" cy="22" r="10" fill="#a8703f"/><circle cx="70" cy="22" r="10" fill="#a8703f"/><circle cx="30" cy="22" r="5" fill="#e3b98a"/><circle cx="70" cy="22" r="5" fill="#e3b98a"/><ellipse cx="50" cy="72" rx="26" ry="24" fill="#a8703f"/><ellipse cx="50" cy="74" rx="14" ry="13" fill="#e3b98a"/><circle cx="50" cy="38" r="22" fill="#b97d48"/><ellipse cx="50" cy="45" rx="10" ry="8" fill="#e3b98a"/><circle cx="50" cy="42" r="3.5" fill="#2a1a10"/><circle cx="42" cy="34" r="2.6" fill="#2a1a10"/><circle cx="58" cy="34" r="2.6" fill="#2a1a10"/><path d="M38 58 L50 64 L62 58 L60 66 L50 62 L40 66Z" fill="#d7263d"/></svg>`,
  };
  A.toyName = { horse: 'Rocking horse', drum: 'Drum', kite: 'Kite', teddy: 'Teddy bear' };

  A.robin = `<svg viewBox="0 0 100 100"><ellipse cx="52" cy="58" rx="32" ry="28" fill="#7a5236"/><path d="M28 58 Q30 82 52 86 Q40 70 44 52Z" fill="#e2552f"/><circle cx="40" cy="38" r="20" fill="#7a5236"/><path d="M26 44 Q30 64 46 62 Q38 52 40 40Z" fill="#e2552f"/><circle cx="34" cy="34" r="4" fill="#1a1210"/><circle cx="33" cy="33" r="1.4" fill="#fff"/><path d="M20 38 l-12 4 l12 3z" fill="#e9b949"/><path d="M80 52 L98 40 L94 62Z" fill="#5a3a26"/><path d="M50 84 v10 M58 84 v10" stroke="#e9b949" stroke-width="3"/><path d="M54 50 Q70 46 80 60 Q66 66 54 60Z" fill="#5a3a26"/></svg>`;

  // ---------- landing illustration ----------
  A.landing = () => {
    seed = 5;
    return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" class="landing-svg">
      <rect width="1600" height="900" fill="url(#gSky)"/>
      ${stars(0, 0, 1600, 520, 160)}
      <circle cx="1400" cy="150" r="140" fill="url(#gCool)"/><circle cx="1400" cy="150" r="62" fill="#fdf3d0"/><circle cx="1378" cy="130" r="9" fill="#ebdfb2"/><circle cx="1420" cy="170" r="6" fill="#ebdfb2"/><circle cx="1410" cy="120" r="5" fill="#ebdfb2"/>
      <path d="M0 640 Q260 520 560 600 T1100 570 T1600 600 V900 H0Z" fill="#41598a"/>
      <path d="M0 700 Q300 610 640 680 T1260 650 T1600 690 V900 H0Z" fill="#9fb6da"/>
      ${[[120, 700, 1.4], [220, 690, 1], [1460, 700, 1.3], [1560, 710, 1.6], [760, 700, .8]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -150 l-46 80 h92z M0 -110 l-56 90 h112z M0 -66 l-66 96 h132z" fill="#173d34"/><path d="M0 -150 l-16 28 h32z M-30 -100 l-14 18 h24z" fill="#fff"/></g>`).join('')}
      <!-- cottage -->
      <g transform="translate(1110 690)">
        <ellipse cx="0" cy="40" rx="300" ry="40" fill="#000" opacity=".2"/>
        <rect x="-180" y="-120" width="360" height="170" fill="#5a3326"/>
        <path d="M-210 -114 L0 -260 L210 -114Z" fill="#2e2030"/><path d="M-222 -110 L0 -268 L222 -110 L200 -100 L0 -244 L-200 -100Z" fill="#f7fbff"/>
        <rect x="90" y="-250" width="44" height="80" fill="#4a2c22"/><rect x="84" y="-256" width="56" height="14" fill="#f7fbff"/>
        ${[0, 1, 2, 3].map((i) => `<circle class="smoke" cx="112" cy="-270" r="${14 + i * 4}" fill="#cfd8ea" opacity=".35" style="animation-delay:${i * 1.2}s"/>`).join('')}
        <rect x="-140" y="-80" width="80" height="70" rx="4" fill="#ffcf6a" class="window-glow"/><path d="M-100 -80 v70 M-140 -45 h80" stroke="#5a3326" stroke-width="6"/>
        <rect x="60" y="-80" width="80" height="70" rx="4" fill="#ffcf6a" class="window-glow" style="animation-delay:1s"/><path d="M100 -80 v70 M60 -45 h80" stroke="#5a3326" stroke-width="6"/>
        <ellipse cx="-100" cy="-45" rx="80" ry="60" fill="url(#gWarm)"/><ellipse cx="100" cy="-45" rx="80" ry="60" fill="url(#gWarm)"/>
        <path d="M-34 50 V-40 Q-34 -70 0 -70 Q34 -70 34 -40 V50Z" fill="#7a2030"/><circle cx="20" cy="4" r="4" fill="#f2b632"/>
        <g transform="translate(0 -36) scale(.3)">${Array.from({ length: 18 }, (_, i) => { const a = i / 18 * Math.PI * 2; return `<ellipse cx="${(Math.cos(a) * 60).toFixed(0)}" cy="${(Math.sin(a) * 60).toFixed(0)}" rx="26" ry="13" fill="${i % 2 ? '#1f6b4a' : '#2a8259'}" transform="rotate(${(a * 180 / Math.PI + 60).toFixed(0)} ${(Math.cos(a) * 60).toFixed(0)} ${(Math.sin(a) * 60).toFixed(0)})"/>`; }).join('')}</g>
        ${fairy(Array.from({ length: 14 }, (_, i) => [-196 + i * 30, -104 + Math.sin(i / 13 * Math.PI) * 10]))}
      </g>
      <path d="M0 790 Q400 740 800 780 T1600 770 V900 H0Z" fill="#eef4ff"/>
    </svg>`;
  };

  // Cabinet preview silhouettes (decorative): replace placeholder.
  const _ws = A.workshop;
  A.workshop = (bx) => _ws(bx).replace('<g transform="translate(1380 352) scale(.6)">HORSE</g>',
    `<g transform="translate(1340 300) scale(.7)">${A.toy.horse.replace('<svg viewBox="0 0 100 100">', '').replace('</svg>', '')}</g>
     <g transform="translate(1440 300) scale(.7)">${A.toy.drum.replace('<svg viewBox="0 0 100 100">', '').replace('</svg>', '')}</g>
     <g transform="translate(1340 400) scale(.7)">${A.toy.kite.replace('<svg viewBox="0 0 100 100">', '').replace('</svg>', '')}</g>
     <g transform="translate(1440 400) scale(.7)">${A.toy.teddy.replace('<svg viewBox="0 0 100 100">', '').replace('</svg>', '')}</g>
     <g transform="translate(1385 492) scale(.7)" opacity=".7">${A.toy.horse.replace('<svg viewBox="0 0 100 100">', '').replace('</svg>', '')}</g>`);


  // ---------- extra items ----------
  A.icon.doorKey = `<svg viewBox="0 0 80 80"><circle cx="22" cy="40" r="14" fill="none" stroke="url(#gBrass)" stroke-width="7"/><rect x="34" y="36" width="40" height="8" rx="3" fill="url(#gBrass)"/><rect x="58" y="44" width="6" height="12" fill="url(#gBrass)"/><rect x="68" y="44" width="6" height="9" fill="url(#gBrass)"/><path d="M14 30 q4 -6 12 -4" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/></svg>`;
  A.icon.copperGear = `<svg viewBox="-50 -50 100 100"><g class="spin-slow" style="animation-duration:8s">${A.gear(26, 8, 'url(#gCopper)')}</g></svg>`;
  A.itemName.doorKey = 'Brass door key';
  A.itemName.copperGear = 'Copper gear';

  // ---------- Christmas card faces ----------
  A.card = {
    star: `<path d="M50 14 L60 38 L86 39 L65 55 L73 80 L50 65 L27 80 L35 55 L14 39 L40 38Z" fill="#f2b632" stroke="#c48b16" stroke-width="3"/>`,
    bell: `<path d="M50 18 C66 18 70 34 71 50 C72 64 76 70 84 74 L16 74 C24 70 28 64 29 50 C30 34 34 18 50 18Z" fill="#f2b632" stroke="#a8761a" stroke-width="3"/><circle cx="50" cy="80" r="7" fill="#c48b16"/><path d="M38 20 q12 -14 24 0" stroke="#d7263d" stroke-width="6" fill="none"/>`,
    bauble: `<rect x="44" y="14" width="12" height="10" rx="2" fill="#d8a845"/><circle cx="50" cy="56" r="30" fill="#2f7fe0"/><path d="M22 50 Q50 40 78 50 M22 62 Q50 72 78 62" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/><ellipse cx="38" cy="42" rx="8" ry="5" fill="#fff" opacity=".7"/>`,
    cane: `<path d="M64 88 V34 A16 16 0 0 0 32 34" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M64 88 V34 A16 16 0 0 0 32 34" stroke="#d7263d" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="7 9"/>`,
    snowman: `<circle cx="50" cy="70" r="20" fill="#fff" stroke="#c9d3df" stroke-width="2"/><circle cx="50" cy="38" r="15" fill="#fff" stroke="#c9d3df" stroke-width="2"/><rect x="38" y="12" width="24" height="14" rx="2" fill="#1d2233"/><rect x="32" y="24" width="36" height="5" rx="2" fill="#1d2233"/><circle cx="45" cy="36" r="2" fill="#1d2233"/><circle cx="55" cy="36" r="2" fill="#1d2233"/><path d="M50 40 l12 3 l-12 2z" fill="#f08a3f"/><path d="M36 50 h28" stroke="#d7263d" stroke-width="5"/>`,
    gingerbread: `<path d="M50 14 a12 12 0 0 1 12 12 a12 12 0 0 1 -3 8 h16 a7 7 0 0 1 0 14 h-13 l10 30 a7 7 0 0 1 -13 5 l-9 -20 l-9 20 a7 7 0 0 1 -13 -5 l10 -30 h-13 a7 7 0 0 1 0 -14 h16 a12 12 0 0 1 -3 -8 a12 12 0 0 1 12 -12z" fill="#b8733a"/><circle cx="45" cy="24" r="2" fill="#2a1a10"/><circle cx="55" cy="24" r="2" fill="#2a1a10"/><path d="M45 30 q5 4 10 0" stroke="#fff" stroke-width="2" fill="none"/><circle cx="50" cy="44" r="3" fill="#d7263d"/><circle cx="50" cy="54" r="3" fill="#2fae6b"/>`,
    stocking: `<path d="M36 16 H64 V58 Q64 72 78 76 Q90 80 86 90 Q82 98 66 94 Q36 88 36 66Z" fill="#d7263d"/><rect x="32" y="12" width="36" height="14" rx="5" fill="#fff"/><path d="M40 40 h20 M40 50 h20" stroke="#fff" stroke-width="3" opacity=".6"/>`,
    holly: `<path d="M50 54 C40 30 20 34 14 24 C20 42 10 46 18 56 C28 50 38 58 50 54Z" fill="#1f7a4f"/><path d="M50 54 C60 30 80 34 86 24 C80 42 90 46 82 56 C72 50 62 58 50 54Z" fill="#2fae6b"/><circle cx="44" cy="62" r="8" fill="#d7263d"/><circle cx="56" cy="62" r="8" fill="#d7263d"/><circle cx="50" cy="72" r="8" fill="#e2384b"/>`,
  };

  // ---------- photo for spot-the-difference (440x320). b = true for the altered copy ----------
  A.SPOTS = [[376, 167, 26], [90, 62, 28], [274, 163, 26], [190, 268, 44], [380, 58, 36]];
  A.photo = (b) => `
    <defs><linearGradient id="phSky${b ? 'B' : 'A'}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1a3a"/><stop offset="1" stop-color="#3d5a8f"/></linearGradient></defs>
    <rect width="440" height="320" fill="url(#phSky${b ? 'B' : 'A'})"/>
    ${[[30, 30], [150, 40], [210, 20], [300, 50], [250, 90], [130, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join('')}
    ${b ? '' : '<circle cx="380" cy="58" r="24" fill="#fdf3d0"/><circle cx="372" cy="52" r="4" fill="#ebdfb2"/>'}
    <path d="M0 214 Q220 186 440 214 V320 H0Z" fill="#eef4ff"/>
    <rect x="170" y="130" width="130" height="96" fill="#7a3e2a"/>
    <path d="M158 132 L235 80 L312 132Z" fill="#3b2a3a"/><path d="M154 134 L235 76 L316 134 L306 138 L235 88 L164 138Z" fill="#fff"/>
    <rect x="270" y="88" width="18" height="30" fill="#4a2c22"/><rect x="266" y="84" width="26" height="8" fill="#fff"/>
    <rect x="184" y="150" width="28" height="26" fill="#ffd27a"/><path d="M198 150 v26 M184 163 h28" stroke="#7a3e2a" stroke-width="3"/>
    <rect x="260" y="150" width="28" height="26" fill="${b ? '#1d2233' : '#ffd27a'}"/><path d="M274 150 v26 M260 163 h28" stroke="#7a3e2a" stroke-width="3"/>
    <path d="M222 226 V188 Q235 176 248 188 V226Z" fill="#a3172a"/>
    <path d="M90 70 l-34 60 h68z M90 100 l-42 66 h84z M90 134 l-50 74 h100z" fill="#1f6b4a"/><rect x="82" y="208" width="16" height="18" fill="#5a3320"/>
    ${b ? '' : '<path d="M90 46 L95 58 L108 58 L98 66 L102 79 L90 71 L78 79 L82 66 L72 58 L85 58Z" fill="#ffd45c"/>'}
    <circle cx="96" cy="120" r="5" fill="#d7263d"/><circle cx="78" cy="160" r="5" fill="#2f7fe0"/><circle cx="104" cy="186" r="5" fill="#f2b632"/>
    <circle cx="360" cy="238" r="28" fill="#fff" stroke="#c9d3df" stroke-width="2"/><circle cx="360" cy="196" r="20" fill="#fff" stroke="#c9d3df" stroke-width="2"/><circle cx="360" cy="164" r="15" fill="#fff" stroke="#c9d3df" stroke-width="2"/>
    <rect x="348" y="136" width="24" height="16" fill="#1d2233"/><rect x="342" y="150" width="36" height="5" fill="#1d2233"/>
    <circle cx="355" cy="161" r="2" fill="#1d2233"/><circle cx="365" cy="161" r="2" fill="#1d2233"/>
    ${b ? '' : '<path d="M362 166 L392 170 L362 173Z" fill="#f08a3f"/>'}
    <path d="M342 182 h36" stroke="#d7263d" stroke-width="6"/>
    <g transform="translate(190 268)"><path d="M-46 14 Q-56 14 -54 4 M-46 14 H44 Q56 14 54 2" stroke="#5a3a26" stroke-width="4" fill="none"/><rect x="-40" y="-14" width="80" height="22" rx="5" fill="${b ? '#2f7fe0' : '#d7263d'}"/><path d="M-30 -14 v22 M0 -14 v22 M30 -14 v22" stroke="#00000033" stroke-width="3"/></g>
    ${[24, 44, 64, 404, 424].map((x) => `<rect x="${x}" y="236" width="8" height="34" fill="#8a5532"/>`).join('')}<path d="M18 246 H72 M398 246 H436" stroke="#8a5532" stroke-width="5"/>
  `;

  // ---------- pocket watch (viewBox -200 -230 400 460) ----------
  A.watch = (h, m) => {
    const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
    return `<path d="M0 -205 q60 -20 120 10" stroke="url(#gBrass)" stroke-width="6" fill="none" stroke-dasharray="10 6"/>
      <circle cx="0" cy="-196" r="16" fill="none" stroke="url(#gBrass)" stroke-width="7"/><rect x="-16" y="-186" width="32" height="24" rx="6" fill="url(#gBrass)"/>
      <circle r="176" fill="url(#gBrass)" stroke="#7a5418" stroke-width="5" filter="url(#fBevel)"/>
      <circle r="150" fill="#fbf4e3" stroke="#a77a24" stroke-width="3"/>
      ${Array.from({ length: 60 }, (_, i) => { const a = i / 60 * Math.PI * 2; const r0 = i % 5 ? 138 : 128; return `<line x1="${(Math.sin(a) * r0).toFixed(1)}" y1="${(-Math.cos(a) * r0).toFixed(1)}" x2="${(Math.sin(a) * 144).toFixed(1)}" y2="${(-Math.cos(a) * 144).toFixed(1)}" stroke="#3a2a1e" stroke-width="${i % 5 ? 1.5 : 4}"/>`; }).join('')}
      ${Array.from({ length: 12 }, (_, i) => { const a = (i + 1) / 12 * Math.PI * 2; return `<text x="${(Math.sin(a) * 104).toFixed(1)}" y="${(-Math.cos(a) * 104 + 11).toFixed(1)}" text-anchor="middle" font-family="Fraunces, serif" font-size="30" font-weight="800" fill="#3a2a1e">${i + 1}</text>`; }).join('')}
      <g class="watch-hand" style="transform:rotate(${ha}deg)"><path d="M-8 16 L0 -78 L8 16Z" fill="#1d2233"/></g>
      <g class="watch-hand" style="transform:rotate(${ma}deg)"><path d="M-5 20 L0 -122 L5 20Z" fill="#7a1222"/></g>
      <circle r="10" fill="url(#gBrass)"/>`;
  };

  // ---------- Elsie, Grandpa's elf apprentice (viewBox 0 0 220 360) ----------
  A.elsie = `<svg viewBox="0 0 220 360" class="elsie-svg" aria-hidden="true">
    <defs>
      <linearGradient id="eTunic" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#14583a"/><stop offset=".42" stop-color="#2fa36a"/><stop offset="1" stop-color="#0f4029"/></linearGradient>
      <radialGradient id="eSkin" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffe6d3"/><stop offset=".65" stop-color="#f4c09e"/><stop offset="1" stop-color="#d9946f"/></radialGradient>
      <linearGradient id="eHat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f04a5c"/><stop offset="1" stop-color="#8f1d2c"/></linearGradient>
      <linearGradient id="eHair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2793a"/><stop offset="1" stop-color="#8a3a15"/></linearGradient>
      <linearGradient id="eFur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d6e0ee"/></linearGradient>
      <pattern id="eStripe" width="20" height="16" patternUnits="userSpaceOnUse"><rect width="20" height="16" fill="#fff"/><rect width="20" height="8" fill="#d7263d"/></pattern>
    </defs>
    <ellipse cx="110" cy="350" rx="74" ry="9" fill="#000" opacity=".4"/>
    <g class="e-body">
      <rect x="84" y="250" width="20" height="88" rx="6" fill="url(#eStripe)"/><rect x="116" y="250" width="20" height="88" rx="6" fill="url(#eStripe)"/>
      <path d="M104 334 H78 Q58 334 54 320 Q66 326 76 322 L104 322Z" fill="#1f6b4a"/><circle cx="54" cy="318" r="5" fill="#f2b632"/>
      <path d="M116 334 H142 Q162 334 166 320 Q154 326 144 322 L116 322Z" fill="#1f6b4a"/><circle cx="166" cy="318" r="5" fill="#f2b632"/>
      <path d="M72 150 Q110 138 148 150 L178 262 Q110 282 42 262Z" fill="url(#eTunic)"/>
      <path d="M42 262 l10 12 10 -10 12 12 12 -10 12 12 12 -10 12 12 12 -10 12 12 12 -10 10 10 L178 262 Q110 282 42 262Z" fill="url(#eFur)"/>
      <rect x="58" y="204" width="104" height="15" rx="4" fill="#2a1a12"/><rect x="100" y="201" width="20" height="21" rx="3" fill="none" stroke="#f2b632" stroke-width="4"/>
      <path d="M58 166 Q40 196 56 214 L70 208 Q60 192 76 170Z" fill="#1f7a4f"/><circle cx="62" cy="214" r="10" fill="url(#eSkin)"/>
      <g class="e-wave"><path d="M144 162 Q176 150 186 112 L172 106 Q164 136 140 148Z" fill="#1f7a4f"/><circle cx="182" cy="104" r="11" fill="url(#eSkin)"/><path d="M174 116 l18 -4" stroke="url(#eFur)" stroke-width="8" stroke-linecap="round"/></g>
      <path d="M78 146 Q110 166 142 146 Q132 160 110 162 Q88 160 78 146Z" fill="url(#eFur)"/>
      <g class="e-head">
        <path d="M74 100 L34 80 Q48 104 76 116Z" fill="url(#eSkin)"/><path d="M146 100 L186 80 Q172 104 144 116Z" fill="url(#eSkin)"/>
        <path d="M70 92 Q60 140 76 168 Q82 150 80 120Z" fill="url(#eHair)"/><path d="M150 92 Q160 140 144 168 Q138 150 140 120Z" fill="url(#eHair)"/>
        <circle cx="76" cy="168" r="6" fill="#2fae6b"/><circle cx="144" cy="168" r="6" fill="#2fae6b"/>
        <circle cx="110" cy="104" r="42" fill="url(#eSkin)"/>
        <path d="M70 92 Q84 66 110 66 Q138 66 150 92 Q132 80 118 86 Q100 76 86 88 Q78 84 70 92Z" fill="url(#eHair)"/>
        <g class="e-eyes"><ellipse cx="95" cy="104" rx="6" ry="8" fill="#2a1a10"/><ellipse cx="125" cy="104" rx="6" ry="8" fill="#2a1a10"/><circle cx="97" cy="101" r="2.4" fill="#fff"/><circle cx="127" cy="101" r="2.4" fill="#fff"/></g>
        <path d="M86 92 q8 -6 16 -2 M118 90 q8 -4 16 2" stroke="#8a3a15" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="84" cy="120" r="9" fill="#ff7b86" opacity=".45"/><circle cx="136" cy="120" r="9" fill="#ff7b86" opacity=".45"/>
        ${[[80, 114], [86, 118], [134, 114], [140, 118]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#b8643a"/>`).join('')}
        <path d="M107 114 q3 4 6 0" stroke="#c97a5a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <g class="e-mouth"><path d="M98 124 Q110 138 122 124 Q110 130 98 124Z" fill="#a3172a"/></g>
        <path d="M66 82 Q80 10 176 26 Q150 34 150 54 Q156 70 150 80Z" fill="url(#eHat)"/>
        <rect x="62" y="70" width="96" height="20" rx="10" fill="url(#eFur)"/>
        <g class="e-bell"><circle cx="178" cy="28" r="10" fill="#f2b632" stroke="#c48b16" stroke-width="2"/><circle cx="178" cy="32" r="2.5" fill="#7a5418"/></g>
      </g>
    </g>
  </svg>`;

  // ---------- kid job: hidden mice ----------
  // [x, y] = where the mouse's feet sit on the 1600x900 stage. 0-2 parlour, 3-5 workshop, 6-8 attic.
  A.MICE = [[250, 104], [985, 800], [1505, 246], [500, 210], [800, 430], [880, 722], [330, 44], [1330, 406], [1070, 814]];
  A.mouse = (found) => `<svg viewBox="0 0 80 60" class="mouse-svg" aria-hidden="true">
    <path d="M62 44 Q78 40 76 26 Q75 18 68 20" stroke="#9a8f98" stroke-width="3" fill="none" stroke-linecap="round" class="m-tail"/>
    <ellipse cx="44" cy="44" rx="22" ry="14" fill="#a99fab"/><ellipse cx="40" cy="40" rx="14" ry="7" fill="#c3bac5" opacity=".7"/>
    <g class="m-head"><circle cx="20" cy="22" r="9" fill="#a99fab"/><circle cx="20" cy="22" r="5" fill="#f6b8c4"/><circle cx="36" cy="20" r="9" fill="#a99fab"/><circle cx="36" cy="20" r="5" fill="#f6b8c4"/>
      <ellipse cx="24" cy="36" rx="15" ry="12" fill="#b7adb9"/><path d="M10 38 L4 40 Q8 44 14 42Z" fill="#b7adb9"/><circle cx="6" cy="40" r="3" fill="#e2687e"/>
      <circle cx="20" cy="32" r="3" fill="#1d1418"/><circle cx="21" cy="31" r="1" fill="#fff"/>
      <path d="M8 38 l-8 -4 M8 41 l-8 1 M10 43 l-7 5" stroke="#6d6470" stroke-width="1"/></g>
    <path d="M30 56 h8 M48 56 h8" stroke="#e2687e" stroke-width="3" stroke-linecap="round"/>
    ${found ? '<g transform="translate(44 4)"><path d="M0 6 C0 -2 12 -2 12 6 C12 12 4 16 0 20 C-4 16 -12 12 -12 6 C-12 -2 0 -2 0 6Z" fill="#ff4d6d" stroke="#fff" stroke-width="2"/></g><path d="M18 44 q6 4 12 0" stroke="#d7263d" stroke-width="5" fill="none" stroke-linecap="round"/>' : ''}
  </svg>`;
  A.MOUSE_CLUES = {
    parlour: "Squeak! Grandpa's favourite spice is the one in Christmas buns. It begins with C!",
    workshop: 'Squeak squeak! Tansy made the rocking horse, and Pip made the kite!',
    attic: 'Squeak! On the brass plaque, O means T and Z means E!',
  };

  // ---------- Grandpa Tobias ----------
  A.grandpa = `<svg viewBox="0 0 220 380" class="grandpa-svg" aria-hidden="true">
    <defs>
      <linearGradient id="gpCoat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a3424"/><stop offset=".45" stop-color="#7d5a3c"/><stop offset="1" stop-color="#3a281b"/></linearGradient>
      <radialGradient id="gpSkin" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffe2cc"/><stop offset=".7" stop-color="#f0b996"/><stop offset="1" stop-color="#d08a66"/></radialGradient>
      <linearGradient id="gpBeard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfd8e6"/></linearGradient>
      <pattern id="gpTweed" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 10 L10 0 M-2 2 L2 -2 M8 12 L12 8" stroke="#00000022" stroke-width="2"/></pattern>
      <radialGradient id="gpGlow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".85"/><stop offset=".5" stop-color="#ffb347" stop-opacity=".25"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="110" cy="368" rx="70" ry="9" fill="#000" opacity=".35"/>
    <g class="gp-legs"><rect class="gp-leg1" x="84" y="290" width="22" height="70" rx="8" fill="#2e2a33"/><rect class="gp-leg2" x="114" y="290" width="22" height="70" rx="8" fill="#26222a"/>
      <path d="M78 356 h32 q6 0 6 8 v4 h-42 q-2 -12 4 -12Z" fill="#3a2214"/><path d="M110 356 h32 q6 0 6 8 v4 h-42 q-2 -12 4 -12Z" fill="#311d11"/></g>
    <path d="M62 150 Q110 132 158 150 L172 306 Q110 318 48 306Z" fill="url(#gpCoat)"/><path d="M62 150 Q110 132 158 150 L172 306 Q110 318 48 306Z" fill="url(#gpTweed)"/>
    <path d="M110 150 V306" stroke="#2a1c12" stroke-width="3"/>${[180, 214, 248, 282].map((y) => `<circle cx="120" cy="${y}" r="5" fill="#c9a24a"/>`).join('')}
    <path d="M58 160 Q34 210 44 262 L62 260 Q56 214 76 176Z" fill="#5c4230"/><circle cx="52" cy="266" r="11" fill="url(#gpSkin)"/>
    <g class="gp-lantern"><path d="M162 160 Q186 206 182 246 L166 248 Q168 210 150 178Z" fill="#5c4230"/><circle cx="174" cy="252" r="11" fill="url(#gpSkin)"/>
      <circle cx="176" cy="300" r="70" fill="url(#gpGlow)" class="gp-glow"/>
      <path d="M176 254 v12" stroke="#2a1c12" stroke-width="3"/><path d="M164 268 h24 l-4 8 h-16z" fill="#2b2b30"/>
      <rect x="164" y="276" width="24" height="34" rx="4" fill="#ffcf6a" stroke="#2b2b30" stroke-width="4"/><path d="M176 280 q-5 10 0 20 q5 -10 0 -20Z" fill="#ff8a2a"/><rect x="161" y="310" width="30" height="7" rx="2" fill="#2b2b30"/></g>
    <path d="M70 142 Q110 168 152 142 L158 162 Q110 184 64 162Z" fill="#2f8a57"/><path d="M128 160 l10 56 l-16 2 l-4 -54Z" fill="#287a4c"/>${[176, 190, 204].map((y) => `<path d="M124 ${y} h14" stroke="#d7263d" stroke-width="3"/>`).join('')}
    <g class="gp-head">
      <circle cx="110" cy="100" r="40" fill="url(#gpSkin)"/>
      <circle cx="70" cy="104" r="9" fill="url(#gpSkin)"/><circle cx="150" cy="104" r="9" fill="url(#gpSkin)"/>
      <path d="M72 106 Q66 160 110 174 Q154 160 148 106 Q140 128 110 128 Q80 128 72 106Z" fill="url(#gpBeard)"/>
      <path d="M90 126 Q110 118 130 126 Q120 136 110 132 Q100 136 90 126Z" fill="#fff"/>
      <ellipse cx="110" cy="114" rx="9" ry="7" fill="#eb9c86"/>
      <circle cx="94" cy="98" r="11" fill="#ffffff22" stroke="#c9a24a" stroke-width="3"/><circle cx="126" cy="98" r="11" fill="#ffffff22" stroke="#c9a24a" stroke-width="3"/><path d="M105 98 h10" stroke="#c9a24a" stroke-width="3"/>
      <g class="gp-eyes"><circle cx="94" cy="99" r="3.4" fill="#2a1a10"/><circle cx="126" cy="99" r="3.4" fill="#2a1a10"/></g>
      <path d="M82 84 q12 -8 22 -2 M116 82 q12 -6 22 2" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="84" cy="114" r="7" fill="#ff7b86" opacity=".35"/><circle cx="136" cy="114" r="7" fill="#ff7b86" opacity=".35"/>
      <path d="M68 78 Q72 50 110 48 Q150 50 154 78 Q160 82 166 80 Q160 92 110 86 Q64 88 68 78Z" fill="#5a4a3a"/><path d="M68 78 Q72 50 110 48 Q150 50 154 78 Q160 82 166 80 Q160 92 110 86 Q64 88 68 78Z" fill="url(#gpTweed)"/>
      <path d="M74 80 Q110 90 162 80" stroke="#3a2e22" stroke-width="3" fill="none"/>
    </g>
  </svg>`;

  window.ART = A;
})();
