/*
 * S10 — ASSINATURA · "Quando a máquina engrena, ela não para mais."  (global 92–100 s, D 8, tail 0)
 *
 * 0,0    DROP FINAL: flash lilás, onda de choque a partir de (960,500), a máquina de fundo (7 engrenagens + ícone
 *        central) ENCAIXA do raio 420 para 330 em volta de (960,560) e gira; 3 órbitas grandes se desenham com
 *        riders. O Ponto sai de (960,500) e vira o '.' de 'mais.'.
 * 1–4    NÃO PARA: engrenagens 30→300°/s, riders ×1→×4, warp. A partir de 2,0 o Ponto orbita a frase
 *        (elipse (960,560) 820×130, −4°; metade de trás passa ATRÁS do texto).
 * 4–4,5  CONVERGÊNCIA: a tagline sai para o centro, máquina e órbitas colapsam em (960,560); a órbita do Ponto
 *        encolhe até virar o círculo r 130 em volta do ícone do lockup (592,420).
 * 4,5    lockup · 5,0 verbos + CTA · 5,5 URL · 6,5–7,0 espiral · 7,0 CLIQUE FINAL (Ponto encaixa em (670,458),
 *        núcleo #7C3AED, logo completo).
 *
 * Primeiro quadro (= último da S09): só o Ponto fundido em (960,500), r 20, glow ×2; bg warp .5, speed 2.
 * Último quadro (thumbnail): lockup completo com o ponto #7C3AED no encaixe, verbos acesos, CTA, URL,
 *   órbita fina com rider; bg padrão com glowA/B 1,1.
 *
 * Tudo que é canvas (Ponto, rastros, órbitas, riders, ondas, glows) é função analítica de lt.
 */
MECCA.scene({
  id: 's10-assinatura',
  build({ root, tl, h, P, bg, onFrame, cue }) {
    const SEL = '[data-scene="s10-assinatura"]';
    const TAU = Math.PI * 2, DEG = Math.PI / 180;
    const { clamp, lerp, hexA } = h;
    const E = (n) => gsap.parseEase(n);
    const eP3o = E('power3.out'), eP3i = E('power3.in'), eP2o = E('power2.out');
    const eP2io = E('power2.inOut'), eMIO = E('mecca.inOut'), eMIn = E('mecca.in'), eMOut = E('mecca.out');
    const seg = (t, a, b) => clamp((t - a) / (b - a));
    const f2 = (v) => (+v).toFixed(2);

    // ------------------------------------------------------------------ CSS local
    h.el('style', {
      text: `
${SEL} .s10-layer { position:absolute; left:0; top:0; width:1920px; height:1080px; }
${SEL} .s10-abs { position:absolute; }
${SEL} .s10-line { position:absolute; left:0; top:0; white-space:nowrap; line-height:1.2; }
${SEL} .s10-probe { display:inline-block; width:0; height:0; vertical-align:baseline; }
${SEL} .s10-mono { font-family:var(--f-mono); font-weight:500; text-transform:none; white-space:nowrap; }
${SEL} .s10-verbs { letter-spacing:.3em; color:rgba(167,139,250,.35); }
${SEL} .s10-verbs .c { display:inline-block; }
${SEL} .s10-caret { position:absolute; left:0; top:0; width:3px; height:26px; border-radius:1px; background:#A78BFA; opacity:0; }
${SEL} .s10-cta { position:absolute; left:700px; top:694px; width:520px; height:92px; border-radius:46px;
  background:#7C3AED; box-shadow:0 0 40px rgba(124,58,237,.5), inset 0 1px 0 rgba(255,255,255,.22);
  display:flex; align-items:center; justify-content:center; gap:16px; overflow:hidden;
  font-family:var(--f-body); font-weight:600; font-size:34px; line-height:1; color:#FBF8FF; white-space:nowrap; }
${SEL} .s10-cta .lbl { display:inline-block; letter-spacing:-.01em; position:relative; }
${SEL} .s10-cta .arr { display:inline-block; width:34px; height:34px; position:relative; }
${SEL} .s10-cta .arr svg { display:block; }
${SEL} .s10-shine { position:absolute; top:-30px; left:0; width:120px; height:152px;
  background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.25) 50%, rgba(255,255,255,0)); }
${SEL} .s10-flash { position:absolute; left:0; top:0; width:1920px; height:1080px; background:#C4B5FD;
  mix-blend-mode:screen; opacity:0; pointer-events:none; }
`,
    }, root);

    // ------------------------------------------------------------------ camadas (de trás para frente)
    const back = h.canvas(root);                          // glow do lockup, metades de trás, Ponto atrás da frase
    const cb = back.ctx;
    const machSvg = h.svg('svg', { class: 'fill', width: 1920, height: 1080, viewBox: '0 0 1920 1080', fill: 'none' }, root);
    const textL = h.el('div', { cls: 's10-layer' }, root);
    const L1 = h.el('div', { cls: 's10-layer' }, textL);  // "Quando a máquina engrena," (push)
    const L2 = h.el('div', { cls: 's10-layer' }, textL);  // "ela não para mais." (push)
    const lockL = h.el('div', { cls: 's10-layer' }, root);
    const lockPulse = h.el('div', { cls: 's10-layer' }, lockL); // ícone + wordmark (pulso no clique final)
    const front = h.canvas(root);                         // metades da frente, riders, ondas, Ponto
    const cf = front.ctx;
    const flashEl = h.el('div', { cls: 's10-flash' }, root);

    // ------------------------------------------------------------------ helpers de texto (posiciona pela baseline)
    function line(parent, html, o) {
      const d = h.el('div', { cls: `${o.cls || 't-display'} s10-line`, html }, parent);
      d.style.fontSize = o.size + 'px';
      if (o.color) d.style.color = o.color;
      if (o.ls != null) d.style.letterSpacing = o.ls;
      const probe = h.el('span', { cls: 's10-probe' }, d);
      const off = h.rect(probe).y - h.rect(d).y;
      probe.remove();
      d.style.top = f2(o.baseline - off) + 'px';
      return d;
    }
    // centra pela caixa de avanço (desconta o letter-spacing do último caractere)
    function centerX(d, cx, trail = 0) {
      d.style.left = '0px';
      const w = h.rect(d).w;
      d.style.left = f2(cx - (w - trail) / 2) + 'px';
    }
    const baselineOf = (d) => { const pr = h.el('span', { cls: 's10-probe' }, d); const y = h.rect(pr).y; pr.remove(); return y; };

    // ================================================================== COMENTÁRIO "// cada máquina tem o seu ritmo"
    const CMT = '// cada máquina tem o seu ritmo';
    const cmt = h.text(CMT, { x: 192, y: 108, size: 22, cls: 't-mono s10-mono', ls: '0.08em', nowrap: true, parent: textL });
    const cmtChars = h.split(cmt, { type: 'chars' }).chars;
    const cmtIdx = [];
    { let si = 0; cmtChars.forEach(() => { while (CMT[si] === ' ') si++; cmtIdx.push(si++); }); }
    const cmtT = (i) => 0.5 + cmtIdx[i] * 0.025;          // digitação a 0,025 s/char (espaços contam)
    const cmtRight = cmtChars.map((c) => h.rect(c).right);
    const cmtBase = baselineOf(cmt);
    gsap.set(cmtChars, { autoAlpha: 0 });
    cmtChars.forEach((c, i) => tl.set(c, { autoAlpha: 1 }, cmtT(i)));
    const CMT_END = cmtT(cmtChars.length - 1);
    const caret = h.el('div', { cls: 's10-caret' }, textL);

    // ================================================================== TAGLINE
    const CE = { x: 960, y: 560 };                        // centro da máquina / das órbitas / da convergência
    const T1 = line(L1, 'Quando a máquina <em>engrena,</em>', { size: 124, baseline: 440 });
    const S1 = h.split(T1, { type: 'words,chars' });
    centerX(T1, 960);
    const T2 = line(L2, 'ela não para mais.', { size: 190, baseline: 680 });
    const S2 = h.split(T2, { type: 'words,chars' });
    centerX(T2, 960);

    // o '.' de 'mais.' (medido ANTES de qualquer transform): centro visual do glifo = casa do Ponto
    const dotChar = S2.chars[S2.chars.length - 1];
    const mctx = document.createElement('canvas').getContext('2d');
    mctx.font = '700 190px "Space Grotesk"';
    const mm = mctx.measureText('.');
    const dcr = h.rect(dotChar);
    const base2 = baselineOf(T2);
    const P0 = { x: dcr.x + (mm.actualBoundingBoxRight - mm.actualBoundingBoxLeft) / 2, y: base2 - (mm.actualBoundingBoxAscent - mm.actualBoundingBoxDescent) / 2 };
    const DOT_R = (mm.actualBoundingBoxRight + mm.actualBoundingBoxLeft) / 2;
    const wMais = S2.words[S2.words.length - 1];
    const wmr = h.rect(wMais);
    const exitOff = (chars) => chars.map((c) => { const r = h.rect(c); return { dx: (CE.x - r.cx) * 0.4, dy: (CE.y - r.cy) * 0.4 }; });
    const ex1 = exitOff(S1.chars), ex2 = exitOff(S2.chars);
    const t1r = h.rect(T1), t2r = h.rect(T2);

    // entradas: palavras escalam 1,25→1 com fade (0,5 s, power4.out, stagger .06); 'mais.' cresce A PARTIR do Ponto
    gsap.set(wMais, { transformOrigin: `${f2(P0.x - wmr.x)}px ${f2(P0.y - wmr.y)}px` });
    tl.fromTo(S1.words, { scale: 1.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power4.out', stagger: 0.06 }, 0);
    tl.fromTo(S2.words, { scale: 1.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power4.out', stagger: 0.06 }, 0.5);
    // o '.' é transparente até 2,0 (é o Ponto); depois o glifo fica e o Ponto sai orbitando
    gsap.set(dotChar, { opacity: 0 });
    tl.to(dotChar, { opacity: 1, duration: 0.12, ease: 'power1.out' }, 2.0);
    // push lento (linha 2: 1→1,03; linha 1: 1→1,02)
    const O2 = { x: 960, y: 610 };
    gsap.set(L1, { transformOrigin: '960px 400px' });
    tl.fromTo(L1, { scale: 1 }, { scale: 1.02, duration: 4.0, ease: 'none' }, 0);
    gsap.set(L2, { transformOrigin: `${O2.x}px ${O2.y}px` });
    tl.fromTo(L2, { scale: 1 }, { scale: 1.03, duration: 3.5, ease: 'none' }, 0.5);
    const s2At = (t) => 1 + 0.03 * seg(t, 0.5, 4.0);
    // saída 4,0–4,5: chars scale →.6 + fade em direção ao centro, das bordas para dentro (.008)
    const EXST = { each: 0.008, from: 'edges' };
    [[S1.chars, ex1], [S2.chars, ex2]].forEach(([cs, ex]) => {
      tl.to(cs, { scale: 0.6, x: (i) => ex[i].dx, y: (i) => ex[i].dy, duration: 0.3, ease: 'mecca.in', stagger: EXST }, 4.0);
      tl.to(cs, { opacity: 0, duration: 0.3, ease: 'none', stagger: EXST }, 4.0);
    });

    // ================================================================== MÁQUINA DE FUNDO (0–4,4)
    const NG = 7, GR = 110;
    const gearsG = h.svg('g', { opacity: 0.18 }, machSvg);
    const gears = [];
    for (let i = 0; i < NG; i++) {
      const G = h.gear(gearsG, { x: 0, y: 0, r: GR, teeth: 14, depth: 0.16, hole: 0.3, tip: 0.3, base: 0.54, fill: hexA(P.violet, 0.22), stroke: P.lavender, strokeWidth: 2.5 });
      h.svg('circle', { r: f2(GR * 0.56), stroke: P.lavender, 'stroke-width': 1.5, 'stroke-opacity': 0.7, 'vector-effect': 'non-scaling-stroke' }, G.rot);
      for (let k = 0; k < 6; k++) {                      // raios do cubo
        const a = k * 60 * DEG;
        h.svg('line', { x1: f2(Math.cos(a) * GR * 0.3), y1: f2(Math.sin(a) * GR * 0.3), x2: f2(Math.cos(a) * GR * 0.56), y2: f2(Math.sin(a) * GR * 0.56), stroke: P.lavender, 'stroke-width': 1.5, 'stroke-opacity': 0.55, 'vector-effect': 'non-scaling-stroke' }, G.rot);
      }
      const st = { R: 420, a: 0, s: 1 };
      gears.push({ G, st, ang: (-90 + i * 360 / NG) * DEG, dir: i % 2 ? -1 : 1, ph: i * 11 });
      // ENCAIXE 420→330 (mecca.gear, stagger .04)
      tl.fromTo(st, { R: 420 }, { R: 330, duration: 0.7, ease: 'mecca.gear' }, i * 0.04);
      tl.fromTo(st, { a: 0 }, { a: 1, duration: 0.25, ease: 'power2.out' }, i * 0.04);
      // COLAPSO em (960,560)
      tl.to(st, { R: 0, s: 0.2, duration: 0.4, ease: 'mecca.in' }, 4.0);
      tl.to(st, { a: 0, duration: 0.4, ease: 'power2.in' }, 4.0);
    }
    // ícone central sem ponto (180 px, α .25)
    const cIcon = h.icon({ size: 180 });
    const cIconG = h.svg('g', { opacity: 0 }, machSvg);
    const cIconPos = h.svg('g', {}, cIconG);
    while (cIcon.svg.firstChild) cIconPos.appendChild(cIcon.svg.firstChild);
    const cArcs = h.svg('g', {}, cIcon.g);
    cIcon.g.insertBefore(cArcs, cIcon.g.firstChild);
    cArcs.appendChild(cIcon.arcOuter);
    cArcs.appendChild(cIcon.arcInner);
    cIcon.dot.style.display = 'none';
    const mi = { a: 0, s: 0.7 };
    tl.fromTo(mi, { a: 0, s: 0.7 }, { a: 0.25, s: 1, duration: 0.6, ease: 'mecca.out' }, 0);
    tl.to(mi, { a: 0, s: 0.15, duration: 0.4, ease: 'mecca.in' }, 4.0);
    // ângulo das engrenagens (graus): 30°/s até 1,0; 30→300°/s (power2.in) até 4,0; 300°/s no colapso
    function gearAng(t) {
      if (t < 1) return 30 * t;
      if (t < 4) { const u = (t - 1) / 3; return 30 + 30 * (t - 1) + 270 * u * u * u; }
      return 390 + 300 * (t - 4);
    }

    // ================================================================== ÓRBITAS GRANDES + RIDERS (0–4,4)
    const ORB = [
      { rx: 1000, ry: 300, rot: -6 * DEG, color: P.magenta, per: 5.0, ph: 0.35, a0: 2.2 },
      { rx: 800, ry: 240, rot: -3 * DEG, color: P.lavender, per: 4.0, ph: 2.6, a0: 4.1 },
      { rx: 600, ry: 180, rot: -9 * DEG, color: P.lilac, per: 3.0, ph: 4.6, a0: 0.4 },
    ];
    ORB.forEach((o, i) => {
      o.st = { p: 0 };
      tl.to(o.st, { p: 1, duration: 0.6, ease: 'power2.inOut' }, i * 0.06);
    });
    const rid = { a: 0 };
    tl.to(rid, { a: 1, duration: 0.3, ease: 'power2.out' }, 0.3);
    // tempo efetivo dos riders: ×1 até 1,0; ×1→×4 (power2.in) até 4,0; ×4 depois
    function tau(t) {
      if (t < 1) return Math.max(0, t);
      if (t < 4) { const u = (t - 1) / 3; return t + 3 * u * u * u; }
      return 7 + 4 * (t - 4);
    }
    const collapseK = (t) => 1 - eMIn(seg(t, 4.0, 4.4));

    // ================================================================== LOCKUP (4,5+)
    const IC = { x: 592, y: 420 };                        // centro do ícone (bbox 497–687 × 325–515)
    const ISC = 190 / 228;
    const SOCK = { x: 497 + 208 * ISC, y: 325 + 160 * ISC };   // encaixe (670.3, 458.3)
    const LC = { x: 960, y: 420 };                        // centro do lockup (origem do pulso)
    const icWrap = h.el('div', { cls: 's10-abs', style: { left: '497px', top: '325px', width: '190px', height: '190px' } }, lockPulse);
    const icon = h.icon({ size: 190, parent: icWrap });
    icon.svg.style.display = 'block';
    const lgWrap = h.el('div', { cls: 's10-abs', style: { left: '723px', top: '346px', width: '700px', height: f2(700 * 170 / 803) + 'px' } }, lockPulse);
    const logo = h.logo({ width: 700, parent: lgWrap });
    logo.svg.style.display = 'block';

    gsap.set([icon.arcOuter, icon.arcInner], { visibility: 'hidden' });
    tl.set(icon.arcOuter, { visibility: 'inherit' }, 4.5);
    tl.fromTo(icon.arcOuter, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'mecca.out' }, 4.5);
    tl.set(icon.arcInner, { visibility: 'inherit' }, 4.55);
    tl.fromTo(icon.arcInner, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'mecca.out' }, 4.55);
    gsap.set(icon.pupil, { svgOrigin: '114 114', scale: 0 });
    tl.to(icon.pupil, { scale: 1, duration: 0.5, ease: 'mecca.back' }, 4.55);
    // o ponto do ícone fica oculto até o clique final (7,0)
    gsap.set(icon.dot, { visibility: 'hidden', attr: { fill: P.ink } });
    tl.set(icon.dot, { visibility: 'inherit' }, 7.0);
    tl.to(icon.dot, { attr: { fill: P.violet }, duration: 0.18, ease: 'power1.out' }, 7.0);
    // wordmark: clip-path inset(0 100% 0 0) → inset(0), 0,6 s, mecca.out, a partir de 4,6
    gsap.set(lgWrap, { clipPath: 'inset(0% 100% 0% 0%)' });
    tl.to(lgWrap, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'mecca.out' }, 4.6);
    const wipeAt = (t) => eMOut(seg(t, 4.6, 5.2));
    // pulso do lockup no clique (1→1,02→1)
    gsap.set(lockPulse, { transformOrigin: `${LC.x}px ${LC.y}px` });
    tl.to(lockPulse, { scale: 1.02, duration: 0.12, ease: 'power2.out' }, 7.0);
    tl.to(lockPulse, { scale: 1, duration: 0.4, ease: 'power2.inOut' }, 7.12);
    const kPulse = (t) => (t < 7.0 ? 1 : t < 7.12 ? 1 + 0.02 * eP2o(seg(t, 7.0, 7.12)) : t < 7.52 ? 1.02 - 0.02 * eP2io(seg(t, 7.12, 7.52)) : 1);
    const sockAt = (t) => { const k = kPulse(t); return { x: LC.x + k * (SOCK.x - LC.x), y: LC.y + k * (SOCK.y - LC.y) }; };
    // glow radial violeta atrás do lockup
    const lg = { a: 0 };
    tl.to(lg, { a: 0.35, duration: 0.6, ease: 'power2.out' }, 4.45);

    // ================================================================== VERBOS
    const VERBS = ['ENGRENAR', 'MONTAR', 'CALIBRAR', 'OPERAR', 'GIRAR'];
    let vhtml = '';
    VERBS.forEach((v, i) => {
      if (i) vhtml += ' <span class="c sep">·</span> ';
      vhtml += `<span class="w" data-w="${i}">` + [...v].map((ch) => `<span class="c">${ch}</span>`).join('') + '</span>';
    });
    const vDiv = line(lockL, vhtml, { cls: 's10-mono s10-verbs', size: 24, baseline: 610 });
    centerX(vDiv, 960, 24 * 0.3);
    const vChars = [...vDiv.querySelectorAll('.c')];
    const vSeps = [...vDiv.querySelectorAll('.sep')];
    const vWords = VERBS.map((_, i) => [...vDiv.querySelectorAll(`.w[data-w="${i}"] .c`)]);
    const vr = h.rect(vDiv);
    gsap.set(vChars, { color: 'rgba(167,139,250,0.35)' });
    tl.fromTo(vChars, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out', stagger: 0.01 }, 5.0);
    // onda de brilho: cada verbo passa a ink com glow e fica aceso
    const V_T = [5.0, 5.5, 6.0, 6.5, 7.0];
    vWords.forEach((cs, i) => {
      const T = V_T[i];
      tl.to(cs, { color: P.ink, duration: 0.22, ease: 'power2.out', stagger: 0.025 }, T);
      tl.fromTo(cs, { textShadow: '0 0 0px rgba(196,181,253,0)' },
        { textShadow: `0 0 ${i === 4 ? 22 : 16}px rgba(196,181,253,0.95)`, duration: 0.14, ease: 'power2.out', stagger: 0.025 }, T);
      tl.to(cs, { textShadow: '0 0 10px rgba(167,139,250,0.55)', duration: 0.5, ease: 'power2.inOut', stagger: 0.025 }, T + 0.14);
      if (i) tl.to(vSeps[i - 1], { color: 'rgba(167,139,250,0.8)', duration: 0.3, ease: 'power2.out' }, T);
    });

    // ================================================================== CTA "Abrir minha máquina →"
    const cta = h.el('div', { cls: 's10-cta' }, lockL);
    const shine = h.el('div', { cls: 's10-shine' }, cta);
    h.el('span', { cls: 'lbl', text: 'Abrir minha máquina' }, cta);
    const arr = h.el('span', { cls: 'arr' }, cta);
    const arrSvg = h.svg('svg', { width: 34, height: 34, viewBox: '0 0 34 34', fill: 'none' }, arr);
    h.svg('path', { d: 'M4 17.5H29M20 8.5L29 17.5L20 26.5', stroke: P.ink, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arrSvg);
    gsap.set(shine, { skewX: -22, x: -200 });
    tl.fromTo(cta, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'mecca.back' }, 5.0);
    tl.fromTo(shine, { x: -200 }, { x: 640, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, 6.0);
    [5.5, 6.0, 6.5, 7.0, 7.5].forEach((b) => tl.to(arr, { x: 8, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1 }, b));

    // ================================================================== URL
    const url = line(lockL, 'meccanismo.com.br', { cls: 's10-mono', size: 26, color: P.lilac, ls: '0.08em', baseline: 860 });
    const urlChars = h.split(url, { type: 'chars' }).chars;
    centerX(url, 960, 26 * 0.08);
    gsap.set(urlChars, { autoAlpha: 0 });
    urlChars.forEach((c, i) => tl.set(c, { autoAlpha: 1 }, 5.5 + i * 0.03));

    // ================================================================== ÓRBITA FINA DO HOLD (em volta do lockup)
    const HO = { x: 960, y: 440, rx: 560, ry: 170, rot: -6 * DEG, a0: -0.35 };
    const ho = { p: 0, ra: 0 };
    tl.to(ho, { p: 1, duration: 0.9, ease: 'power2.inOut' }, 5.5);
    tl.to(ho, { ra: 1, duration: 0.4, ease: 'power2.out' }, 6.0);
    const HO_PH = 0.35;                                    // ângulo do rider no fim (t = 8): frente, à direita do wordmark
    const hoAng = (t) => HO_PH + TAU * (t - 8) / 4;
    // janela (com folga) dos verbos: a órbita passa ATRÁS deles
    const VK = { x: vr.x - 22, y: vr.y - 4, w: vr.w + 44 - 24 * 0.3, h: vr.h + 10 };

    // ================================================================== EFEITOS (estado tweenável → canvas)
    const wave = { r: 0, a: 0 };
    tl.fromTo(wave, { r: 0, a: 0.8 }, { r: 1300, a: 0, duration: 0.9, ease: 'power2.out', immediateRender: false }, 0);
    const burst = { a: 0 };
    tl.fromTo(burst, { a: 0 }, { a: 0.55, duration: 0.1, ease: 'power2.out', immediateRender: false }, 4.32);
    tl.to(burst, { a: 0, duration: 0.45, ease: 'power2.out' }, 4.42);
    const cring = { r: 30, a: 0 };
    tl.fromTo(cring, { r: 30, a: 0.5 }, { r: 640, a: 0, duration: 0.7, ease: 'power2.out', immediateRender: false }, 4.42);
    const fring = { r: 0, a: 0 };
    tl.fromTo(fring, { r: 0, a: 0.8 }, { r: 90, a: 0, duration: 0.5, ease: 'power2.out', immediateRender: false }, 7.0);
    // flash do DROP: o 1º quadro fica limpo (match cut com a S09) e o pico .5 cai no quadro seguinte
    tl.fromTo(flashEl, { opacity: 0 }, { opacity: 0.5, duration: 1 / 30, ease: 'none', immediateRender: false }, 0);
    tl.to(flashEl, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 1 / 30);

    // ================================================================== FUNDO
    const BG_IN = { glowA: 1, glowB: 1, glowC: 1, grid: 0, particles: 1, driftX: 0, driftY: 0, speed: 2, warp: 0.5, vignette: 0.55, dim: 0, hue: 0, grain: 1 };
    tl.set(bg, BG_IN, 0);
    tl.to(bg, { warp: 0, speed: 1, duration: 0.5, ease: 'power2.out' }, 0);
    tl.to(bg, { glowA: 1.4, glowB: 1.4, duration: 0.12, ease: 'power2.out' }, 0);
    tl.to(bg, { glowA: 1.1, glowB: 1.1, duration: 1.1, ease: 'power2.inOut' }, 0.12);
    tl.to(bg, { warp: 0.45, speed: 2.5, duration: 3.0, ease: 'power2.in' }, 1.0);
    tl.to(bg, { warp: 0, speed: 1, duration: 0.5, ease: 'power2.out' }, 4.0);
    tl.to(bg, { glowA: 1.4, glowB: 1.4, duration: 0.1, ease: 'power2.out' }, 7.0);
    tl.to(bg, { glowA: 1.1, glowB: 1.1, duration: 0.6, ease: 'power2.inOut' }, 7.1);

    // ================================================================== O PONTO (função pura de lt)
    const A0 = { x: 960, y: 500 };
    const CTRL = { x: 1400, y: 420 };                     // arco do tiro até o '.' (passa entre as duas linhas)
    const ERX = 820, ERY = 130, EROT = -4 * DEG;           // órbita da frase
    const ORB_R = 130;                                     // órbita circular em volta do ícone
    const qb = (a, c, b, k) => { const u = 1 - k; return { x: u * u * a.x + 2 * u * k * c.x + k * k * b.x, y: u * u * a.y + 2 * u * k * c.y + k * k * b.y }; };
    const DOT = (t) => { const s = s2At(t); return { x: O2.x + s * (P0.x - O2.x), y: O2.y + s * (P0.y - O2.y) }; };
    // ponto de partida da órbita (o '.' em 2,0) em coordenadas locais da elipse
    const D2 = DOT(2.0);
    const lx = D2.x - CE.x, ly = D2.y - CE.y;
    const ux = lx * Math.cos(EROT) + ly * Math.sin(EROT), uy = -lx * Math.sin(EROT) + ly * Math.cos(EROT);
    const PHI0 = Math.atan2(uy / ERY, ux / ERX);
    const F0 = Math.hypot(ux / ERX, uy / ERY);
    // frequência angular (voltas/s): arranca em 2,0; período 1,5→0,75 s até 4,0; puxado para 1 volta/s; acelera na espiral
    function freq(t) {
      if (t < 2.0) return 0;
      if (t < 4.0) return (1 / (1.5 - 0.375 * (t - 2.0))) * h.smooth(2.0, 2.3, t);
      if (t < 4.5) return lerp(1 / 0.75, 1.0, eP2io(seg(t, 4.0, 4.5)));
      if (t < 6.5) return 1.0;
      return lerp(1.0, 1.5, eP3i(seg(t, 6.5, 7.0)));
    }
    const FT0 = 2.0, FT1 = 7.0, FDT = 1 / 600;
    const NF = Math.round((FT1 - FT0) / FDT);
    const cyc = new Float64Array(NF + 1);
    for (let i = 1; i <= NF; i++) cyc[i] = cyc[i - 1] + 0.5 * (freq(FT0 + (i - 1) * FDT) + freq(FT0 + i * FDT)) * FDT;
    const cycles = (t) => {
      if (t <= FT0) return 0;
      if (t >= FT1) return cyc[NF];
      const x = (t - FT0) / FDT, i = Math.floor(x), f = x - i;
      return cyc[i] + (cyc[Math.min(NF, i + 1)] - cyc[i]) * f;
    };
    // correção de fase distribuída em 4,5–7,0 para chegar ao encaixe vindo de fora (direção centro→encaixe)
    const PHI_T = Math.atan2(SOCK.y - IC.y, SOCK.x - IC.x);
    const phiRaw = (t) => PHI0 + TAU * cycles(t);
    let dPhi = PHI_T - phiRaw(7.0);
    dPhi = ((dPhi % TAU) + TAU * 1.5) % TAU - Math.PI;
    const phi = (t) => phiRaw(t) + dPhi * eP2io(seg(t, 4.5, 7.0));

    function pos(t) {
      if (t <= 0) return { x: A0.x, y: A0.y, back: false, ph: 0 };
      if (t < 0.5) { const q = qb(A0, CTRL, P0, eP3o(t / 0.5)); return { x: q.x, y: q.y, back: false, ph: 0 }; }
      if (t < 2.0) { const q = DOT(t); return { x: q.x, y: q.y, back: false, ph: 0 }; }
      const ph = phi(t);
      if (t < 4.0) {
        const f = lerp(F0, 1, eP2io(seg(t, 2.0, 2.4)));
        const q = h.ellipsePt(CE.x, CE.y, ERX * f, ERY * f, EROT, ph);
        return { x: q.x, y: q.y, back: Math.sin(ph) < 0, ph };
      }
      if (t < 4.5) {
        const k = eMIO(seg(t, 4.0, 4.5));
        const q = h.ellipsePt(lerp(CE.x, IC.x, k), lerp(CE.y, IC.y, k), lerp(ERX, ORB_R, k), lerp(ERY, ORB_R, k), lerp(EROT, 0, k), ph);
        return { x: q.x, y: q.y, back: t < 4.25 && Math.sin(ph) < 0, ph };
      }
      if (t < 6.5) return { x: IC.x + ORB_R * Math.cos(ph), y: IC.y + ORB_R * Math.sin(ph), back: false, ph };
      if (t < 7.0) {
        const k = eP3i(seg(t, 6.5, 7.0));
        const R = ORB_R * (1 - k);
        return { x: lerp(IC.x, SOCK.x, k) + R * Math.cos(ph), y: lerp(IC.y, SOCK.y, k) + R * Math.sin(ph), back: false, ph };
      }
      const s = sockAt(t);
      return { x: s.x, y: s.y, back: false, ph };
    }
    function radAt(t, p) {
      let r;
      if (t < 0.5) r = lerp(20, DOT_R, eP3o(t / 0.5));
      else if (t < 2.0) r = DOT_R;
      else if (t < 2.4) r = lerp(DOT_R, 11, eP2io(seg(t, 2.0, 2.4)));
      else if (t < 4.0) r = 11;
      else if (t < 4.5) r = lerp(11, 10, seg(t, 4.0, 4.5));
      else if (t < 6.5) r = 10;
      else if (t < 7.0) r = lerp(10, 190 * 10 / 228, eP3i(seg(t, 6.5, 7.0)));
      else r = 190 * 10 / 228;
      // perspectiva na órbita da frase: maior na frente, menor atrás
      const dAmt = h.smooth(2.0, 2.3, t) * (1 - h.smooth(4.0, 4.4, t));
      if (dAmt > 0 && p) r *= 1 + 0.14 * Math.sin(p.ph) * dAmt;
      return r;
    }
    function glowAt(t) {
      let g = t < 0.5 ? lerp(2, 1, eP2o(t / 0.5)) : 1;    // glow ×2 herdado da S09
      if (t >= 0.5 && t < 2.0) g += 0.14 * Math.sin(TAU * (t - 0.5));    // respira no lugar do '.'
      for (const [b, a] of [[0.5, 0.7], [2.0, 0.45], [4.5, 0.35]]) {
        if (t >= b && t < b + 0.6) g += a * Math.exp(-(t - b) * 7) * (1 - seg(t, b + 0.4, b + 0.6));
      }
      return g;
    }
    function mixHex(a, b, k) {
      const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
      const ch = (sh) => Math.round(lerp((A >> sh) & 255, (B >> sh) & 255, k));
      return '#' + [16, 8, 0].map((sh) => ch(sh).toString(16).padStart(2, '0')).join('');
    }
    // rastro: fita afunilada (#C026D3 cabeça → #7C3AED cauda); cada trecho vai para o canvas do seu lado (frente/trás)
    function drawTrail(t, rr) {
      const orbitMode = t >= 2.0 && t < 7.12;
      const WIN = orbitMode ? 0.1 : 8 / 60;
      const N = 24;
      const pts = [];
      for (let i = 0; i <= N; i++) pts.push(pos(Math.max(0, t - (i / N) * WIN)));
      const head = pts[0], tail = pts[N];
      if (Math.hypot(head.x - tail.x, head.y - tail.y) < 4) return;
      let amt = 1;
      if (!orbitMode) {
        const q = pos(Math.max(0, t - 1 / 120));
        amt = h.smooth(600, 1000, Math.hypot(head.x - q.x, head.y - q.y) * 120);
      }
      if (amt <= 0.01) return;
      const L = [], R = [];
      let nx = 0, ny = -1;
      for (let i = 0; i <= N; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
        const dx = b.x - a.x, dy = b.y - a.y, dl = Math.hypot(dx, dy);
        if (dl > 0.01) { nx = -dy / dl; ny = dx / dl; }
        const w = rr * 0.9 * Math.pow(1 - i / N, 0.85);
        L.push([pts[i].x + nx * w, pts[i].y + ny * w]);
        R.push([pts[i].x - nx * w, pts[i].y - ny * w]);
      }
      const alphaAt = (i) => 0.78 * amt * Math.pow(1 - i / N, 1.25);
      const colAt = (i) => mixHex(P.magenta, P.violet, Math.min(1, (i / N) * 1.6));
      let i0 = 0;
      while (i0 < N) {
        const bk = pts[i0].back;
        let i1 = i0;
        while (i1 < N && pts[i1 + 1].back === bk) i1++;
        const j1 = Math.min(N, i1 + 1);
        const c = bk ? cb : cf, k = bk ? 0.55 : 1;
        const pa = pts[i0], pb = pts[j1];
        if (Math.hypot(pa.x - pb.x, pa.y - pb.y) > 0.5) {
          const g = c.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
          g.addColorStop(0, hexA(colAt(i0), alphaAt(i0) * k));
          g.addColorStop(1, hexA(colAt(j1), alphaAt(j1) * k));
          c.fillStyle = g;
          c.beginPath();
          c.moveTo(L[i0][0], L[i0][1]);
          for (let i = i0 + 1; i <= j1; i++) c.lineTo(L[i][0], L[i][1]);
          for (let i = j1; i >= i0; i--) c.lineTo(R[i][0], R[i][1]);
          c.closePath();
          c.fill();
        }
        i0 = j1;
      }
    }
    function drawPonto(t) {
      if (t >= 7.0) {
        const s = sockAt(t);
        if (t < 7.12) drawTrail(t, 190 * 10 / 228);
        // o glow some (o núcleo agora é o ponto #7C3AED do próprio ícone)
        const a = 1.25 * Math.exp(-(t - 7.0) * 7.5);
        if (a > 0.01) {
          const R = 8.33 * (5 + (t - 7.0) * 10);
          const g = cf.createRadialGradient(s.x, s.y, 0, s.x, s.y, R);
          g.addColorStop(0, hexA(P.lavender, Math.min(1, 0.55 * a)));
          g.addColorStop(0.3, hexA(P.lavender, 0.18 * a));
          g.addColorStop(1, hexA(P.lavender, 0));
          cf.fillStyle = g; cf.beginPath(); cf.arc(s.x, s.y, R, 0, TAU); cf.fill();
        }
        return s;
      }
      const p = pos(t);
      const r = radAt(t, p);
      const c = p.back ? cb : cf;
      const k = p.back ? 0.62 : 1;
      drawTrail(t, r);
      const g = glowAt(t);
      h.glowDot(c, p.x, p.y, r, P.lavender, clamp(0.6 * g * k, 0, 1));
      if (g > 1.02) {                                     // carga: halo extra largo
        const R = r * 5 * g;
        const gr = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
        gr.addColorStop(0, hexA(P.lavender, clamp(0.24 * (g - 1) * k, 0, 0.5)));
        gr.addColorStop(1, hexA(P.lavender, 0));
        c.fillStyle = gr; c.beginPath(); c.arc(p.x, p.y, R, 0, TAU); c.fill();
      }
      c.fillStyle = hexA(P.ink, k);
      c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.fill();
      return p;
    }

    // ================================================================== desenho de órbitas
    function strokeEllipse(cx, cy, rx, ry, rot, a0, span, aF, aB, lw, color) {
      if (span <= 0.001 || (aF <= 0.002 && aB <= 0.002)) return;
      const steps = Math.max(8, Math.ceil(200 * span / TAU));
      const pb = new Path2D(), pf = new Path2D();
      let last = null;
      for (let i = 0; i < steps; i++) {
        const a = a0 + span * i / steps, b = a0 + span * (i + 1) / steps;
        const lay = Math.sin((a + b) / 2) < 0 ? 'b' : 'f';
        const p1 = h.ellipsePt(cx, cy, rx, ry, rot, a), p2 = h.ellipsePt(cx, cy, rx, ry, rot, b);
        const path = lay === 'b' ? pb : pf;
        if (last !== lay) path.moveTo(p1.x, p1.y);
        path.lineTo(p2.x, p2.y);
        last = lay;
      }
      cb.strokeStyle = hexA(color, aB); cb.lineWidth = lw; cb.stroke(pb);
      cf.strokeStyle = hexA(color, aF); cf.lineWidth = lw; cf.stroke(pf);
    }
    function drawRider(o, t, amt, kc) {
      if (amt <= 0.002 || kc <= 0.001) return;
      const ang = (tt) => o.ph + TAU * tau(tt) / o.per;
      const at = (a) => h.ellipsePt(CE.x, CE.y, o.rx * kc, o.ry * kc, o.rot, a);
      const NS = 12, DT = 1 / 75;                         // rastro de 12 posições (mais longo quanto mais rápido)
      for (let j = NS - 1; j >= 1; j--) {
        const a1 = ang(Math.max(0, t - j * DT)), a2 = ang(Math.max(0, t - (j - 1) * DT));
        const q1 = at(a1), q2 = at(a2);
        const bk = Math.sin(a2) < 0;
        const c = bk ? cb : cf;
        const u = 1 - j / NS;
        c.strokeStyle = hexA(o.color, 0.6 * u * (bk ? 0.5 : 1) * amt);
        c.lineWidth = 0.6 + 4.2 * u;
        c.lineCap = 'round';
        c.beginPath(); c.moveTo(q1.x, q1.y); c.lineTo(q2.x, q2.y); c.stroke();
      }
      const a = ang(t), p = at(a), bk = Math.sin(a) < 0;
      h.glowDot(bk ? cb : cf, p.x, p.y, 5, o.color, (bk ? 0.5 : 1) * amt);
    }

    // ================================================================== onFrame
    onFrame((lt) => {
      // seek direto para t = 0 exato não renderiza o set de posição 0 (GSAP): garante o estado do corte
      if (lt < 1e-4) Object.assign(bg, BG_IN);

      // --- máquina de fundo (SVG)
      const ga = gearAng(lt);
      for (const g of gears) {
        const x = CE.x + g.st.R * Math.cos(g.ang), y = CE.y + g.st.R * Math.sin(g.ang);
        g.G.g.setAttribute('transform', `translate(${f2(x)} ${f2(y)}) scale(${g.st.s.toFixed(4)})`);
        g.G.rot.setAttribute('transform', `rotate(${(g.ph + g.dir * ga).toFixed(3)})`);
        g.G.g.style.opacity = g.st.a.toFixed(3);
      }
      cIconPos.setAttribute('transform', `translate(${CE.x} ${CE.y}) scale(${(mi.s * 180 / 228).toFixed(4)}) translate(-114 -114)`);
      cIconG.setAttribute('opacity', mi.a.toFixed(3));
      cArcs.setAttribute('transform', `rotate(${(-ga * 0.25).toFixed(2)} 114 114)`);

      cb.setTransform(1, 0, 0, 1, 0, 0); cb.clearRect(0, 0, 1920, 1080);
      cf.setTransform(1, 0, 0, 1, 0, 0); cf.clearRect(0, 0, 1920, 1080);
      cb.globalCompositeOperation = 'source-over';
      cf.globalCompositeOperation = 'source-over';

      // --- órbita fina do hold (primeiro no canvas da frente: o recorte dos verbos só atinge ela)
      if (ho.p > 0.001) {
        strokeEllipse(HO.x, HO.y, HO.rx, HO.ry, HO.rot, HO.a0, ho.p * TAU, 0.12, 0.07, 1.2, P.lavender);
        cf.save();
        cf.globalCompositeOperation = 'destination-out';
        const gk = cf.createLinearGradient(VK.x, 0, VK.x + VK.w, 0);
        gk.addColorStop(0, 'rgba(0,0,0,0)'); gk.addColorStop(0.06, 'rgba(0,0,0,1)');
        gk.addColorStop(0.94, 'rgba(0,0,0,1)'); gk.addColorStop(1, 'rgba(0,0,0,0)');
        cf.fillStyle = gk; cf.fillRect(VK.x, VK.y, VK.w, VK.h);
        cf.restore();
      }

      // --- glow radial violeta atrás do lockup (respira)
      if (lg.a > 0.002) {
        const breath = 1 + 0.12 * Math.sin(TAU * (lt - 4.5) / 2) + (lt >= 7.0 ? 0.35 * Math.exp(-(lt - 7.0) * 5) : 0);
        cb.save();
        cb.translate(LC.x, LC.y + 10); cb.scale(1, 0.4);
        const g = cb.createRadialGradient(0, 0, 0, 0, 0, 720);
        g.addColorStop(0, hexA(P.violet, lg.a * breath));
        g.addColorStop(0.5, hexA(P.violet, lg.a * breath * 0.35));
        g.addColorStop(1, hexA(P.violet, 0));
        cb.fillStyle = g; cb.beginPath(); cb.arc(0, 0, 720, 0, TAU); cb.fill();
        cb.restore();
      }

      // --- 3 órbitas grandes + riders (0–4,4)
      const kc = collapseK(lt);
      if (kc > 0.001) {
        const fa = Math.pow(kc, 0.6);
        for (const o of ORB) {
          strokeEllipse(CE.x, CE.y, o.rx * kc, o.ry * kc, o.rot, o.a0, o.st.p * TAU, 0.3 * fa, 0.15 * fa, 1.5, P.lavender);
          drawRider(o, lt, rid.a * fa, kc);
        }
      }

      // --- onda de choque do DROP (a partir de 960,500)
      if (wave.a > 0.002 && wave.r > 2) {
        cf.strokeStyle = hexA(P.lavender, wave.a); cf.lineWidth = 3;
        cf.beginPath(); cf.arc(A0.x, A0.y, wave.r, 0, TAU); cf.stroke();
        cf.strokeStyle = hexA(P.magenta, wave.a * 0.45); cf.lineWidth = 1.5;
        cf.beginPath(); cf.arc(A0.x, A0.y, wave.r * 0.82, 0, TAU); cf.stroke();
        const rb = Math.max(1, wave.r * 0.6);
        const bl = cf.createRadialGradient(A0.x, A0.y, 0, A0.x, A0.y, rb);
        bl.addColorStop(0, hexA(P.lilac, wave.a * 0.25));
        bl.addColorStop(1, hexA(P.lilac, 0));
        cf.fillStyle = bl; cf.beginPath(); cf.arc(A0.x, A0.y, rb, 0, TAU); cf.fill();
      }

      // --- implosão/explosão da convergência em (960,560)
      if (burst.a > 0.002) {
        const R = 190;
        const g = cf.createRadialGradient(CE.x, CE.y, 0, CE.x, CE.y, R);
        g.addColorStop(0, hexA(P.lilac, burst.a));
        g.addColorStop(0.25, hexA(P.lavender, burst.a * 0.4));
        g.addColorStop(1, hexA(P.violet, 0));
        cf.fillStyle = g; cf.beginPath(); cf.arc(CE.x, CE.y, R, 0, TAU); cf.fill();
      }
      if (cring.a > 0.002) {
        cf.strokeStyle = hexA(P.lavender, cring.a); cf.lineWidth = 2;
        cf.beginPath(); cf.arc(CE.x, CE.y, cring.r, 0, TAU); cf.stroke();
      }

      // --- luz na borda da revelação do wordmark
      const wp = wipeAt(lt);
      if (wp > 0.001 && wp < 0.999) {
        const x = 723 + 700 * wp;
        const a = 0.85 * h.smooth(0, 0.04, wp) * (1 - h.smooth(0.7, 0.98, wp));
        const gv = cf.createLinearGradient(0, 330, 0, 510);
        gv.addColorStop(0, hexA(P.lilac, 0)); gv.addColorStop(0.5, hexA(P.lilac, a)); gv.addColorStop(1, hexA(P.lilac, 0));
        cf.fillStyle = gv; cf.fillRect(x - 1, 330, 2, 180);
        const gh = cf.createLinearGradient(x - 26, 0, x + 6, 0);
        gh.addColorStop(0, hexA(P.violet, 0)); gh.addColorStop(1, hexA(P.lavender, a * 0.35));
        cf.fillStyle = gh; cf.fillRect(x - 26, 346, 32, 148);
      }

      // --- rider da órbita fina do hold
      if (ho.ra > 0.002) {
        const a = hoAng(lt);
        const p = h.ellipsePt(HO.x, HO.y, HO.rx, HO.ry, HO.rot, a);
        const bk = Math.sin(a) < 0;
        const c = bk ? cb : cf;
        for (let j = 8; j >= 1; j--) {                   // cauda curtinha
          const q1 = h.ellipsePt(HO.x, HO.y, HO.rx, HO.ry, HO.rot, a - 0.05 * j), q2 = h.ellipsePt(HO.x, HO.y, HO.rx, HO.ry, HO.rot, a - 0.05 * (j - 1));
          c.strokeStyle = hexA(P.lilac, 0.35 * (1 - j / 8) * ho.ra * (bk ? 0.5 : 1)); c.lineWidth = 2; c.lineCap = 'round';
          c.beginPath(); c.moveTo(q1.x, q1.y); c.lineTo(q2.x, q2.y); c.stroke();
        }
        h.glowDot(c, p.x, p.y, 3, P.lilac, ho.ra * (bk ? 0.55 : 1));
      }

      // --- o Ponto
      const pp = drawPonto(lt);

      // --- anel do clique final
      if (fring.a > 0.002 && fring.r > 0.5) {
        cf.strokeStyle = hexA(P.lavender, fring.a); cf.lineWidth = 2;
        cf.beginPath(); cf.arc(pp.x, pp.y, fring.r, 0, TAU); cf.stroke();
      }

      // --- caret do comentário (pisca no tempo da música)
      if (lt >= 0.5) {
        let n = 0;
        while (n < cmtChars.length && cmtT(n) <= lt + 1e-6) n++;
        const x = n ? cmtRight[n - 1] + 4 : 192;
        const on = lt < CMT_END + 0.25 || (lt / 0.5) % 1 < 0.5;
        caret.style.transform = `translate(${f2(x)}px, ${f2(cmtBase - 21)}px)`;
        caret.style.opacity = on ? '0.9' : '0';
      } else caret.style.opacity = '0';
    });

    // ================================================================== SOM
    cue(0, 'impact', 'DROP final', 1.0);
    cue(0, 'sub-drop', 'DROP final', 0.8);
    cue(0.5, 'impact', 'segunda linha', 0.7);
    cue(2, 'whoosh', 'Ponto sai orbitando', 0.3);
    cue(3, 'whoosh', 'órbita acelera', 0.3);
    cue(4.5, 'reverse', 'pico na convergência', 0.8);
    cue(4.5, 'impact', 'lockup', 0.9);
    cue(5, 'tick', 'ENGRENAR', 0.4);
    cue(5, 'click', 'CTA', 0.6);
    cue(5.5, 'tick', 'MONTAR', 0.4);
    cue(6, 'tick', 'CALIBRAR', 0.4);
    cue(6.5, 'tick', 'OPERAR', 0.4);
    cue(7, 'click', 'ponto encaixa', 1.0);
    cue(7, 'chime', 'GIRAR', 1.0);

    // medidas úteis para revisão
    root.dataset.s10 = JSON.stringify({
      P0: { x: +P0.x.toFixed(1), y: +P0.y.toFixed(1) }, DOT_R: +DOT_R.toFixed(1), base2: +base2.toFixed(1),
      L1: [Math.round(t1r.x), Math.round(t1r.right)], L2: [Math.round(t2r.x), Math.round(t2r.right)],
      verbs: [Math.round(vr.x), Math.round(vr.right), Math.round(vr.y), Math.round(vr.bottom)],
      PHI0: +(PHI0 / DEG).toFixed(1), F0: +F0.toFixed(3), dPhi: +(dPhi / DEG).toFixed(1), cyc7: +cyc[NF].toFixed(3),
      SOCK: { x: +SOCK.x.toFixed(1), y: +SOCK.y.toFixed(1) },
    });
  },
});
