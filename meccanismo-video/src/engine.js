/*
 * MECCA engine — timeline determinística para o vídeo Meccanismo.
 *
 * Cada cena é registrada com MECCA.scene({ id, build(ctx) }) e recebe:
 *   ctx.root   <div> da cena (1920×1080, visível só dentro da janela da cena)
 *   ctx.tl     timeline GSAP LOCAL (t=0 é o início da cena)
 *   ctx.D      duração oficial da cena (s)      ctx.tail  segundos extras visíveis após D (transição)
 *   ctx.h      helpers (ver abaixo)             ctx.P     paleta
 *   ctx.onFrame(fn(localT, globalT))  desenho procedural chamado a cada quadro enquanto a cena está visível
 *   ctx.cue(localT, kind, note?, gain?)  registra um cue de som (impact|whoosh|riser|tick|click|sub-drop|glitch|chime|reverse|stop)
 *   ctx.bg     estado do fundo global (tweenável via ctx.tl)
 *
 * O estado visual em qualquer tempo t é função apenas de t: window.__seek(t) posiciona tudo.
 * NÃO use Math.random, Date, requestAnimationFrame ou callbacks com efeitos acumulativos dentro das cenas.
 */
(function () {
  'use strict';
  const W = 1920, H = 1080;
  const params = new URLSearchParams(location.search);
  const RENDER = params.has('render');
  const SOLO = params.get('solo') ? params.get('solo').split(',') : null;
  const NOGRAIN = params.has('nograin');
  if (RENDER) document.body.classList.add('render');

  gsap.registerPlugin(SplitText, DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin, CustomEase);
  gsap.config({ autoSleep: 9e9, force3D: false, nullTargetWarn: false });
  gsap.ticker.lagSmoothing(0);
  gsap.defaults({ ease: 'power3.out', duration: 0.8 });

  // Easings da casa
  CustomEase.create('mecca.out', 'M0,0 C0.12,0.9 0.24,1 1,1');
  CustomEase.create('mecca.in', 'M0,0 C0.66,0 0.9,0.2 1,1');
  CustomEase.create('mecca.inOut', 'M0,0 C0.8,0 0.2,1 1,1');
  CustomEase.create('mecca.snap', 'M0,0 C0.3,0 0.05,1 1,1');
  CustomEase.create('mecca.back', 'M0,0 C0.2,0.8 0.32,1.18 0.56,1.06 0.76,0.98 0.86,1 1,1');
  CustomEase.create('mecca.gear', 'M0,0 C0.4,0 0.18,1.12 0.55,1.04 0.75,0.99 0.9,1 1,1');

  const P = {
    bgDeep: '#120720', bg: '#160A27', bg2: '#1A0B2E', surface: '#241038', surface2: '#2D1149',
    violet: '#7C3AED', violetDeep: '#6D28D9', violetDarker: '#4C1D95', lavender: '#A78BFA', lilac: '#C4B5FD',
    magenta: '#C026D3', pink: '#E249B0', ink: '#FBF8FF', ink2: '#F5F3FF', muted: '#A99CC4', slate: '#64748B',
    line: 'rgba(255,255,255,0.1)', lineViolet: 'rgba(167,139,250,0.22)',
  };
  const BPM = 120, BEAT = 60 / BPM, BAR = BEAT * 4;

  // ---------------------------------------------------------------- utilidades
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (a, b, v) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k); };
  const hexA = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  function el(tag, opts = {}, parent) {
    const e = document.createElement(tag);
    if (opts.cls) e.className = opts.cls;
    if (opts.html != null) e.innerHTML = opts.html;
    if (opts.text != null) e.textContent = opts.text;
    if (opts.style) Object.assign(e.style, opts.style);
    if (opts.attrs) for (const k in opts.attrs) e.setAttribute(k, opts.attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const SVGNS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs = {}, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  let uidN = 0;
  const uid = (p = 'u') => `${p}${++uidN}`;

  // ---------------------------------------------------------------- stage
  const stage = document.getElementById('stage');
  const bgCanvas = el('canvas', { cls: 'layer', attrs: { width: W, height: H } }, stage);
  const scenesLayer = el('div', { cls: 'layer' }, stage);
  const grainCanvas = el('canvas', { cls: 'layer', attrs: { width: W, height: H }, style: { mixBlendMode: 'overlay', opacity: '0.5', pointerEvents: 'none' } }, stage);
  const bgx = bgCanvas.getContext('2d');
  const gx = grainCanvas.getContext('2d');

  // Estado do fundo global (tweenável pelas cenas)
  const bg = {
    glowA: 1,        // intensidade do radial violeta (topo-esquerdo)
    glowB: 1,        // intensidade do radial magenta (topo-direito)
    glowC: 1,        // radial violeta de baixo
    grid: 0.0,       // opacidade da malha de pontos (0..1)
    particles: 1,    // densidade/alpha das partículas ambientes
    driftX: 0, driftY: 0, // parallax global (px)
    speed: 1,        // multiplicador do drift das partículas
    warp: 0,         // 0..1 linhas de velocidade radiais (transições)
    vignette: 0.55,  // força da vinheta
    dim: 0,          // 0..1 escurecimento geral
    hue: 0,          // -1..1 mistura para magenta (+) ou violeta profundo (−)
    grain: 1,
  };

  // Partículas ambientes determinísticas
  const PARTS = (() => {
    const r = rng(20260929);
    const arr = [];
    for (let i = 0; i < 170; i++) {
      arr.push({
        x: r() * W, y: r() * H, z: 0.25 + r() * 0.95,
        vx: (r() - 0.5) * 9, vy: -3 - r() * 10,
        size: 0.6 + r() * 1.9, tw: r() * Math.PI * 2, tws: 0.6 + r() * 1.8,
        c: r() < 0.62 ? '#C4B5FD' : r() < 0.6 ? '#A78BFA' : '#E249B0',
      });
    }
    return arr;
  })();

  function drawBg(t) {
    const c = bgx;
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.fillStyle = P.bg;
    c.fillRect(0, 0, W, H);
    const radial = (x, y, r, col, a) => {
      if (a <= 0) return;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, hexA(col, a));
      g.addColorStop(1, hexA(col, 0));
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
    };
    const s1 = Math.sin(t * 0.21), s2 = Math.cos(t * 0.17), s3 = Math.sin(t * 0.13 + 1.2);
    const mag = clamp(0.5 + bg.hue * 0.5);
    radial(W * 0.06 + s1 * 60 + bg.driftX * 0.2, H * -0.08 + s2 * 40 + bg.driftY * 0.2, 1100, P.violet, 0.2 * bg.glowA);
    radial(W * 1.02 + s2 * 50 + bg.driftX * 0.2, H * -0.04 + s3 * 40 + bg.driftY * 0.2, 980, P.magenta, 0.13 * bg.glowB * (0.6 + mag * 0.8));
    radial(W * 0.5 + s3 * 80 + bg.driftX * 0.15, H * 1.18 + bg.driftY * 0.15, 900, P.violet, 0.12 * bg.glowC);

    // malha de pontos
    if (bg.grid > 0.001) {
      const step = 48;
      const ox = ((bg.driftX * 0.5) % step + step) % step, oy = ((bg.driftY * 0.5) % step + step) % step;
      c.fillStyle = hexA('#A78BFA', 0.2 * bg.grid);
      for (let y = oy - step; y < H + step; y += step) {
        for (let x = ox - step; x < W + step; x += step) {
          const dx = (x - W / 2) / W, dy = (y - H / 2) / H;
          const fall = 1 - clamp(Math.sqrt(dx * dx + dy * dy) * 1.25);
          if (fall <= 0) continue;
          c.globalAlpha = fall;
          c.fillRect(x - 1, y - 1, 2, 2);
        }
      }
      c.globalAlpha = 1;
    }

    // linhas de velocidade (warp)
    if (bg.warp > 0.001) {
      const r = rng(77);
      c.save();
      c.translate(W / 2, H / 2);
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 140; i++) {
        const ang = r() * Math.PI * 2;
        const base = 120 + r() * 900;
        const ph = (base + t * (900 + r() * 1400) * bg.warp) % 1200;
        const len = (60 + r() * 260) * bg.warp;
        const x1 = Math.cos(ang) * ph, y1 = Math.sin(ang) * ph * 0.62;
        const x2 = Math.cos(ang) * (ph + len), y2 = Math.sin(ang) * (ph + len) * 0.62;
        c.strokeStyle = hexA(r() < 0.5 ? '#A78BFA' : '#C026D3', 0.35 * bg.warp * clamp(ph / 400));
        c.lineWidth = 1 + r() * 1.5;
        c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
      }
      c.restore();
    }

    // partículas
    if (bg.particles > 0.001) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      const tt = t * bg.speed;
      for (const p of PARTS) {
        let x = (p.x + p.vx * tt * p.z + bg.driftX * p.z) % W; if (x < 0) x += W;
        let y = (p.y + p.vy * tt * p.z + bg.driftY * p.z) % H; if (y < 0) y += H;
        const tw = 0.45 + 0.55 * Math.sin(p.tw + t * p.tws);
        const a = 0.55 * tw * p.z * bg.particles;
        if (a < 0.02) continue;
        const rr = p.size * (0.7 + p.z * 0.6);
        c.fillStyle = hexA(p.c, a);
        c.beginPath(); c.arc(x, y, rr, 0, Math.PI * 2); c.fill();
        if (p.size > 2.2) { c.fillStyle = hexA(p.c, a * 0.15); c.beginPath(); c.arc(x, y, rr * 4, 0, Math.PI * 2); c.fill(); }
      }
      c.restore();
    }

    // vinheta + dim
    const vg = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
    vg.addColorStop(0, 'rgba(10,4,20,0)');
    vg.addColorStop(1, `rgba(10,4,20,${bg.vignette})`);
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
    if (bg.dim > 0) { c.fillStyle = `rgba(10,4,20,${clamp(bg.dim)})`; c.fillRect(0, 0, W, H); }
  }

  // Grão de filme (determinístico por quadro)
  const GRAIN = (() => {
    const tiles = [];
    const r = rng(1234);
    for (let k = 0; k < 4; k++) {
      const cv = document.createElement('canvas'); cv.width = cv.height = 256;
      const cx = cv.getContext('2d');
      const img = cx.createImageData(256, 256);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 128 + (r() - 0.5) * 120;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
      }
      cx.putImageData(img, 0, 0);
      tiles.push(cv);
    }
    return tiles;
  })();
  function drawGrain(frame) {
    gx.clearRect(0, 0, W, H);
    if (NOGRAIN || bg.grain <= 0) return;
    const tile = GRAIN[frame % GRAIN.length];
    const r = rng(frame * 7919 + 13);
    const ox = Math.floor(r() * 256), oy = Math.floor(r() * 256);
    gx.globalAlpha = 0.16 * bg.grain;
    for (let y = -oy; y < H; y += 256) for (let x = -ox; x < W; x += 256) gx.drawImage(tile, x, y);
    gx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- marca
  const B = window.MECCA_BRAND;
  function icon(opts = {}) {
    const size = opts.size || 228;
    const id = uid('ig');
    const s = svg('svg', { viewBox: B.icon.viewBox, width: size, height: size, fill: 'none', overflow: 'visible' });
    const defs = svg('defs', {}, s);
    const lg = svg('linearGradient', { id, x1: '68.5', y1: '196.75', x2: '201.738', y2: '196.75', gradientUnits: 'userSpaceOnUse' }, defs);
    svg('stop', { 'stop-color': P.magenta }, lg);
    svg('stop', { offset: '1', 'stop-color': P.violet }, lg);
    const g = svg('g', {}, s);
    const color = opts.color || P.violet;
    const arcOuter = svg('path', { d: B.icon.arcOuter, stroke: color, 'stroke-width': 16, 'stroke-linecap': 'round' }, g);
    const arcInner = svg('path', { d: B.icon.arcInner, stroke: `url(#${id})`, 'stroke-width': 16, 'stroke-linecap': 'round', opacity: 0.8 }, g);
    const pupil = svg('path', { d: B.icon.pupil, fill: color }, g);
    const dot = svg('circle', { cx: B.icon.dot.cx, cy: B.icon.dot.cy, r: B.icon.dot.r, fill: color }, g);
    if (opts.parent) opts.parent.appendChild(s);
    return { svg: s, g, arcOuter, arcInner, pupil, dot, center: { x: 114, y: 114 } };
  }
  function logo(opts = {}) {
    const width = opts.width || 803;
    const id = uid('lg');
    const s = svg('svg', { viewBox: B.logo.viewBox, width, height: width * 170 / 803, fill: 'none', overflow: 'visible' });
    const defs = svg('defs', {}, s);
    const lg = svg('linearGradient', { id, x1: '0', y1: '83.36', x2: '419', y2: '86.64', gradientUnits: 'userSpaceOnUse' }, defs);
    svg('stop', { 'stop-color': P.magenta }, lg);
    svg('stop', { offset: '1', 'stop-color': P.violet }, lg);
    const mecca = svg('path', { d: B.logo.mecca, fill: `url(#${id})` }, s);
    const nismo = svg('path', { d: B.logo.nismo, fill: P.ink2 }, s);
    if (opts.parent) opts.parent.appendChild(s);
    return { svg: s, mecca, nismo };
  }

  // Engrenagem SVG: devolve o atributo d
  // teeth: nº de dentes · r: raio externo · depth: profundidade do dente (fração de r)
  // base/tip: largura do dente na base/topo (fração do passo) · hole: furo central (fração de r, 0 = sem furo)
  function gearPath({ teeth = 12, r = 100, depth = 0.16, hole = 0.34, tip = 0.3, base = 0.54 } = {}) {
    const ro = r, ri = r * (1 - depth);
    const step = (Math.PI * 2) / teeth;
    const pt = (a, rr) => `${(Math.cos(a) * rr).toFixed(2)} ${(Math.sin(a) * rr).toFixed(2)}`;
    let d = '';
    for (let i = 0; i < teeth; i++) {
      const a0 = i * step - step / 2;
      const aBase0 = a0 + step * 0.5 * (1 - base);
      const aTip0 = a0 + step * 0.5 * (1 - tip);
      const aTip1 = a0 + step * 0.5 * (1 + tip);
      const aBase1 = a0 + step * 0.5 * (1 + base);
      d += (i === 0 ? `M${pt(a0, ri)}` : '') +
        ` A${ri} ${ri} 0 0 1 ${pt(aBase0, ri)}` +
        ` L${pt(aTip0, ro)} A${ro} ${ro} 0 0 1 ${pt(aTip1, ro)}` +
        ` L${pt(aBase1, ri)}` +
        ` A${ri} ${ri} 0 0 1 ${pt(a0 + step, ri)}`;
    }
    d += 'Z';
    if (hole > 0) {
      const hr = r * hole;
      d += ` M${hr} 0 A${hr} ${hr} 0 1 0 ${-hr} 0 A${hr} ${hr} 0 1 0 ${hr} 0Z`;
    }
    return d;
  }
  function gear(parent, o = {}) {
    const g = svg('g', { transform: `translate(${o.x || 0} ${o.y || 0})` }, parent);
    const rot = svg('g', {}, g);
    const p = svg('path', {
      d: gearPath(o), fill: o.fill || 'none', stroke: o.stroke || P.lavender, 'stroke-width': o.strokeWidth ?? 2,
      'fill-rule': 'evenodd', 'vector-effect': 'non-scaling-stroke',
    }, rot);
    return { g, rot, path: p };
  }

  // Canvas full-frame dentro de um pai
  function canvas(parent) {
    const cv = el('canvas', { cls: 'fill', attrs: { width: W, height: H } }, parent);
    return { canvas: cv, ctx: cv.getContext('2d') };
  }
  function glowDot(c, x, y, r, color, a = 1) {
    const g = c.createRadialGradient(x, y, 0, x, y, r * 5);
    g.addColorStop(0, hexA(color, 0.55 * a));
    g.addColorStop(0.25, hexA(color, 0.18 * a));
    g.addColorStop(1, hexA(color, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 5, 0, Math.PI * 2); c.fill();
    c.fillStyle = hexA('#FFFFFF', 0.9 * a); c.beginPath(); c.arc(x, y, r * 0.55, 0, Math.PI * 2); c.fill();
    c.fillStyle = hexA(color, a); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  // ponto numa elipse rotacionada
  function ellipsePt(cx, cy, rx, ry, rot, ang) {
    const x = Math.cos(ang) * rx, y = Math.sin(ang) * ry;
    const cr = Math.cos(rot), sr = Math.sin(rot);
    return { x: cx + x * cr - y * sr, y: cy + x * sr + y * cr };
  }
  function orbit(c, o) {
    c.save();
    c.translate(o.cx, o.cy); c.rotate(o.rot || 0);
    c.strokeStyle = hexA(o.color || '#A78BFA', o.alpha ?? 0.3);
    c.lineWidth = o.lineWidth || 1.5;
    if (o.dash) c.setLineDash(o.dash);
    c.beginPath();
    const a0 = o.from ?? 0, a1 = o.to ?? Math.PI * 2;
    c.ellipse(0, 0, o.rx, o.ry, 0, a0, a1);
    c.stroke();
    c.restore();
  }

  // Texto posicionado. anchor: 'tl' | 'tc' | 'cc' | 'tr' | 'cl' | 'cr' | 'bc' ...
  function text(html, o = {}) {
    const e = el('div', { cls: o.cls || 't-display', html }, o.parent);
    e.style.position = 'absolute';
    e.style.left = (o.x ?? 0) + 'px';
    e.style.top = (o.y ?? 0) + 'px';
    if (o.size) e.style.fontSize = o.size + 'px';
    if (o.weight) e.style.fontWeight = o.weight;
    if (o.color) e.style.color = o.color;
    if (o.width) e.style.width = o.width + 'px';
    if (o.lh) e.style.lineHeight = o.lh;
    if (o.ls != null) e.style.letterSpacing = o.ls;
    if (o.align) e.style.textAlign = o.align;
    if (o.nowrap) e.style.whiteSpace = 'nowrap';
    if (o.style) Object.assign(e.style, o.style);
    const a = o.anchor || 'tl';
    const xp = a[1] === 'c' ? -50 : a[1] === 'r' ? -100 : 0;
    const yp = a[0] === 'c' ? -50 : a[0] === 'b' ? -100 : 0;
    gsap.set(e, { xPercent: xp, yPercent: yp });
    return e;
  }
  function eyebrow(label, o = {}) {
    const e = el('div', { cls: 'eyebrow', html: `${o.dot ? '<span class="dot"></span>' : '<span class="dash"></span>'}<span class="lbl">${label}</span>` }, o.parent);
    e.style.position = 'absolute'; e.style.left = (o.x ?? 0) + 'px'; e.style.top = (o.y ?? 0) + 'px';
    if (o.size) e.style.fontSize = o.size + 'px';
    if (o.color) e.style.color = o.color;
    const a = o.anchor || 'tl';
    gsap.set(e, { xPercent: a[1] === 'c' ? -50 : a[1] === 'r' ? -100 : 0, yPercent: a[0] === 'c' ? -50 : a[0] === 'b' ? -100 : 0 });
    return e;
  }
  function chip(label, o = {}) {
    const e = el('div', { cls: 'chip', html: `<span class="pip"></span>${label}` }, o.parent);
    if (o.x != null) { e.style.position = 'absolute'; e.style.left = o.x + 'px'; e.style.top = (o.y ?? 0) + 'px'; }
    if (o.size) e.style.fontSize = o.size + 'px';
    return e;
  }
  // SplitText + correção do gradiente: cada pedaço dentro de <em>/.grad-text recebe o gradiente
  // do pai, com tamanho/posição calculados para que o degradê continue contínuo entre letras.
  function split(elm, o = {}) {
    const s = SplitText.create(elm, Object.assign({ type: 'lines,words,chars', linesClass: 'line', wordsClass: 'word', charsClass: 'char' }, o));
    fixGradient(elm);
    return s;
  }
  function fixGradient(scope) {
    const sc = (stage.getBoundingClientRect().width / W) || 1;
    const hosts = [...scope.querySelectorAll('em, .grad-text')];
    if (scope.matches && scope.matches('em, .grad-text')) hosts.push(scope);
    for (const em of hosts) {
      let parts = em.querySelectorAll('.char');
      if (!parts.length) parts = em.querySelectorAll('.word');
      if (!parts.length) continue;
      const cs = getComputedStyle(em);
      const img = cs.backgroundImage;
      if (!img || img === 'none') continue;
      const er = em.getBoundingClientRect();
      parts.forEach(p => {
        const r = p.getBoundingClientRect();
        Object.assign(p.style, {
          backgroundImage: img,
          backgroundSize: `${er.width / sc}px ${Math.max(r.height, 1) / sc}px`,
          backgroundPosition: `${-(r.left - er.left) / sc}px 0px`,
          backgroundRepeat: 'no-repeat',
          webkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          paddingBottom: '0.08em', marginBottom: '-0.08em',
        });
      });
      em.style.backgroundImage = 'none';
    }
  }
  // Risco animado sobre um elemento de texto (ex.: "Não somos agência.")
  function strike(tl, target, at, o = {}) {
    const line = el('div', { style: { position: 'absolute', left: '-2%', width: '104%', top: o.top || '54%', height: (o.thickness || 8) + 'px', background: o.color || P.magenta, borderRadius: '8px', transformOrigin: '0 50%', boxShadow: `0 0 18px ${hexA(o.color || P.magenta, 0.8)}` } }, target);
    if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
    gsap.set(line, { scaleX: 0 });
    tl.to(line, { scaleX: 1, duration: o.dur || 0.35, ease: 'mecca.snap' }, at);
    return line;
  }
  // Flash de quadro inteiro
  function flash(tl, root, at, o = {}) {
    const f = el('div', { style: { position: 'absolute', inset: '0', background: o.color || '#FBF8FF', opacity: 0, pointerEvents: 'none', zIndex: 50, mixBlendMode: o.blend || 'screen' } }, root);
    tl.fromTo(f, { opacity: o.peak ?? 0.85 }, { opacity: 0, duration: o.dur || 0.45, ease: 'power2.out', immediateRender: false }, at);
    tl.set(f, { opacity: 0 }, 0);
    return f;
  }
  // Tremor determinístico
  function shake(tl, target, at, o = {}) {
    const amp = o.amp || 10, n = o.n || 8, dur = o.dur || 0.4;
    const r = rng(o.seed || 99);
    const kf = [];
    for (let i = 0; i < n; i++) { const k = 1 - i / n; kf.push({ x: (r() - 0.5) * 2 * amp * k, y: (r() - 0.5) * 2 * amp * k, duration: dur / (n + 1), ease: 'none' }); }
    kf.push({ x: 0, y: 0, duration: dur / (n + 1), ease: 'none' });
    tl.to(target, { keyframes: kf }, at);
  }

  // Retângulo de um elemento em coordenadas do palco 1920×1080 (independe da escala do preview)
  function rect(e) {
    const sr = stage.getBoundingClientRect();
    const sc = sr.width / W || 1;
    const r = e.getBoundingClientRect();
    const x = (r.left - sr.left) / sc, y = (r.top - sr.top) / sc, w = r.width / sc, hh = r.height / sc;
    return { x, y, w, h: hh, left: x, top: y, right: x + w, bottom: y + hh, cx: x + w / 2, cy: y + hh / 2 };
  }

  const helpers = { rect, fixGradient, rng, clamp, lerp, smooth, hexA, el, svg, uid, icon, logo, gearPath, gear, canvas, glowDot, ellipsePt, orbit, text, eyebrow, chip, split, strike, flash, shake, W, H, P, BEAT, BAR };

  // ---------------------------------------------------------------- cenas
  const defs = [];
  const records = [];
  const cues = [];
  const errors = [];
  const master = gsap.timeline({ paused: true });
  let DURATION = 0;

  function register(def) { defs.push(def); }

  function build() {
    const timing = window.MECCA_TIMING || {};
    DURATION = Math.max(0, ...Object.values(timing).map(t => t.start + t.duration));
    const list = defs.map(d => Object.assign({}, d, timing[d.id] || {}, { build: d.build, id: d.id }))
      .filter(d => typeof d.start === 'number')
      .sort((a, b) => a.start - b.start);
    list.forEach((d, i) => {
      if (SOLO && !SOLO.some(s => d.id.startsWith(s))) return;
      const tail = d.tail || 0;
      const root = el('div', { cls: 'scene', attrs: { 'data-scene': d.id } }, scenesLayer);
      root.style.zIndex = d.z != null ? d.z : 10 + i;
      const tl = gsap.timeline();
      const hooks = [];
      const ctx = {
        root, tl, D: d.duration, tail, start: d.start, W, H, P, h: helpers, bg, BEAT, BAR,
        onFrame: fn => hooks.push(fn),
        cue: (t, kind, note, gain) => cues.push({ t: +(d.start + t).toFixed(4), kind, note: note || '', gain: gain ?? 1, scene: d.id }),
      };
      try { d.build(ctx); } catch (e) { errors.push(`${d.id}: ${e && e.stack || e}`); console.error(d.id, e); }
      tl.set({}, {}, d.duration + tail);
      master.add(tl, d.start);
      records.push({ id: d.id, root, start: d.start, end: d.start + d.duration + tail, hooks });
    });
    if (!DURATION) DURATION = master.duration();
  }

  let lastFrame = -1;
  function seek(t, fps = 30) {
    master.seek(t, false);
    const last = records[records.length - 1];
    for (const r of records) {
      const on = t >= r.start && (t < r.end || (r === last && t <= r.end + 1e-6));
      r.root.classList.toggle('is-on', on);
      if (on) for (const fn of r.hooks) { try { fn(t - r.start, t); } catch (e) { if (errors.length < 50) errors.push(`${r.id} onFrame: ${e.message}`); } }
    }
    drawBg(t);
    const frame = Math.round(t * fps);
    if (frame !== lastFrame) { drawGrain(frame); lastFrame = frame; }
  }

  // ---------------------------------------------------------------- boot
  async function loadScripts(list) {
    for (const src of list) {
      await new Promise((res) => {
        const s = document.createElement('script');
        s.src = src; s.onload = res;
        s.onerror = () => { errors.push(`falha ao carregar ${src}`); res(); };
        document.head.appendChild(s);
      });
    }
  }
  async function loadFonts() {
    const specs = [
      '400 40px "Space Grotesk"', '500 40px "Space Grotesk"', '600 40px "Space Grotesk"', '700 40px "Space Grotesk"',
      '500 40px "Bricolage Grotesque"', '700 40px "Bricolage Grotesque"', '800 40px "Bricolage Grotesque"',
      '400 40px "Inter"', '500 40px "Inter"', '600 40px "Inter"', '700 40px "Inter"',
      '400 40px "JetBrains Mono"', '500 40px "JetBrains Mono"', '600 40px "JetBrains Mono"', '700 40px "JetBrains Mono"',
    ];
    const sample = 'AÁÃÂÇÉÊÍÓÔÕÚáãâçéêíóôõú→·—“”';
    await Promise.all(specs.map(s => document.fonts.load(s, sample).catch(() => null)));
    await document.fonts.ready;
  }

  const ready = (async () => {
    await loadFonts();
    await loadScripts((window.MECCA_SCENES || []).map(f => `scenes/${f}`));
    build();
    seek(Number(params.get('t') || 0));
    return true;
  })();

  window.MECCA = { scene: register, P, helpers, bg, master };
  window.__ready = ready;
  window.__seek = (t, fps) => { seek(t, fps); return true; };
  window.__meta = () => ({ duration: DURATION, errors, cues: cues.slice().sort((a, b) => a.t - b.t), scenes: records.map(r => ({ id: r.id, start: r.start, end: r.end })) });

  // ---------------------------------------------------------------- preview interativo
  if (!RENDER) {
    const ui = el('div', { attrs: { id: 'ui' } }, document.body);
    const btn = el('button', { text: '▶ play' }, ui);
    const range = el('input', { attrs: { type: 'range', min: 0, max: 1000, value: 0, step: 1 } }, ui);
    const sceneName = el('span', { cls: 'scene-name' }, ui);
    const time = el('span', { cls: 'time', text: '0.00s' }, ui);
    const audio = new Audio('../out/soundtrack.wav');
    audio.preload = 'auto';
    let playing = false, t0 = 0, tStart = 0, cur = 0;
    const fit = () => {
      const s = Math.min(window.innerWidth / W, (window.innerHeight - 56) / H);
      stage.style.transform = `scale(${s})`;
      stage.style.left = ((window.innerWidth - W * s) / 2) + 'px';
      stage.style.top = Math.max(0, (window.innerHeight - 56 - H * s) / 2) + 'px';
    };
    window.addEventListener('resize', fit); fit();
    const show = t => {
      cur = Math.max(0, Math.min(DURATION, t));
      seek(cur);
      range.value = String(Math.round(cur / (DURATION || 1) * 1000));
      time.textContent = `${cur.toFixed(2)}s / ${DURATION.toFixed(0)}s`;
      const r = records.filter(r => cur >= r.start && cur < r.end).pop();
      sceneName.textContent = r ? r.id : '';
    };
    const loop = () => {
      if (!playing) return;
      const t = tStart + (performance.now() - t0) / 1000;
      if (t >= DURATION) { playing = false; btn.textContent = '▶ play'; show(DURATION); audio.pause(); return; }
      show(t);
      requestAnimationFrame(loop);
    };
    const toggle = () => {
      playing = !playing; btn.textContent = playing ? '❚❚ pause' : '▶ play';
      if (playing) {
        if (cur >= DURATION - 0.05) cur = 0;
        tStart = cur; t0 = performance.now();
        try { audio.currentTime = cur; audio.play().catch(() => {}); } catch (e) {}
        requestAnimationFrame(loop);
      } else audio.pause();
    };
    btn.onclick = toggle;
    range.oninput = () => { const was = playing; playing = false; audio.pause(); btn.textContent = '▶ play'; show(range.value / 1000 * DURATION); if (was) toggle(); };
    window.addEventListener('keydown', e => {
      if (e.code === 'Space') { e.preventDefault(); toggle(); }
      if (e.code === 'ArrowRight') show(cur + (e.shiftKey ? 2 : 1 / 30));
      if (e.code === 'ArrowLeft') show(cur - (e.shiftKey ? 2 : 1 / 30));
    });
    ready.then(() => show(Number(params.get('t') || 0)));
  }
})();
