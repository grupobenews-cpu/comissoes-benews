(() => {
/*
 * S10 (VERTICAL 1080×1920) — ASSINATURA · "Quando a máquina engrena, ela não para mais."  (global 92–100 s, D 8, tail 0)
 *
 * Mesma timeline, easings, textos e cues da horizontal (src/scenes/s10-assinatura.js); só muda a composição
 * (storyboard/vertical/VERTICAL_SPEC.md §2 · S10 e §3, corte 92,0 e fim 100,0).
 *
 * 0,0    DROP FINAL: flash lilás RADIAL (screen, centro (540,690), r 900), onda de choque a partir de (540,690),
 *        a máquina de fundo (7 engrenagens + ícone
 *        central) ENCAIXA do raio 420 para 330 em volta de CE (540,780) e gira; 3 órbitas grandes de eixo maior
 *        VERTICAL (300×1000 · 240×800 · 180×600) se desenham com riders. O Ponto sai de (540,690) (controle
 *        (900,760)) e vira o '.' de 'mais.' em (912, 1015,5), r 20→12.
 * 1–4    NÃO PARA: engrenagens 30→300°/s, riders ×1→×4, warp. A partir de 2,0 o Ponto orbita a frase
 *        (elipse (540,780) 520×330, −6°; metade de trás passa ATRÁS do texto; na metade da frente o caminho
 *        ganha folga radial local para manter ≥ 24 px dos glifos — §1.2 — em vez de rasar o '.' e o 'p').
 *        Anéis grandes e riders nunca riscam os glifos: onde cruzam a tagline ou o comentário vão para o canvas de
 *        trás (e, junto ao comentário, esmaecem para α × .3).
 * 4–4,5  CONVERGÊNCIA: a tagline sai para o centro, máquina e órbitas colapsam em CE; a órbita do Ponto
 *        encolhe até 100×116 em volta de (205,6, 780) (= horizontal revisada 112×130 × .895, com a borda direita
 *        achatada para rx 89,5: ≥ 24 px antes do 'M'). Até 4,36 o Ponto e o rastro passam ATRÁS das letras que saem.
 * 4,5    lockup (.895: ícone 170 + wordmark 626, centrado em x 540, y 780) CHEGA no golpe, como na horizontal
 *        revisada (arcos 4,40–4,55, pupila 4,45–4,55, wordmark 4,45–4,70 expo.out + 1,06→1) · 5,0 verbos (2 linhas,
 *        apagados em α .6, cada um termina de acender no tick) + CTA + URL (Inter 600 40) · 6,5–7,0 espiral ·
 *        7,0 CLIQUE FINAL (Ponto encaixa em (281,1, 814,3), núcleo #7C3AED).
 * 6,5+   partículas do fundo redesenhadas pela cena (réplica exata do motor em 1080×1920) e apagadas sob o
 *        cartão final: thumbnail limpo.
 *
 * Primeiro quadro (= último da S09): só o Ponto fundido em (540,690), r 20, glow ×2; bg warp .5, speed 2.
 * Último quadro (thumbnail): lockup completo com o ponto #7C3AED no encaixe, verbos acesos, CTA, URL,
 *   órbita fina com rider; bg padrão com glowA/B 1,1.
 *
 * Tudo que é canvas (Ponto, rastros, órbitas, riders, ondas, glows) é função analítica de lt.
 */
MECCA.scene({
  id: 's10-assinatura',
  build({ root, tl, h, P, bg, onFrame, cue, W, H }) {
    const SEL = '[data-scene="s10-assinatura"]';
    const TAU = Math.PI * 2, DEG = Math.PI / 180;
    const { clamp, lerp, hexA, smooth } = h;
    const E = (n) => gsap.parseEase(n);
    const eP3o = E('power3.out'), eP3i = E('power3.in'), eP2o = E('power2.out');
    const eP2io = E('power2.inOut'), eMIO = E('mecca.inOut'), eMIn = E('mecca.in');
    const seg = (t, a, b) => clamp((t - a) / (b - a));
    const f2 = (v) => (+v).toFixed(2);

    // ------------------------------------------------------------------ layout vertical (spec §2 · S10)
    const CX = 540;                                       // eixo de centragem
    const CE = { x: 540, y: 780 };                        // centro da máquina / das órbitas / da convergência
    const A0 = { x: 540, y: 690 };                        // ponto fundido herdado da S09 (corte 92,0)
    const LS = 0.895;                                     // escala do lockup em relação à horizontal
    const DOT_R = 12;                                     // Ponto no '.' de 'mais.' (spec: r 20→12)
    const SOCK_R = 170 * 10 / 228;                        // 7,46: ponto do ícone de 170 px

    // ------------------------------------------------------------------ CSS local
    h.el('style', {
      text: `
${SEL} .s10-layer { position:absolute; left:0; top:0; width:${W}px; height:${H}px; }
${SEL} .s10-abs { position:absolute; }
${SEL} .s10-line { position:absolute; left:0; top:0; white-space:nowrap; line-height:1.2; }
${SEL} .s10-probe { display:inline-block; width:0; height:0; vertical-align:baseline; }
${SEL} .s10-mono { font-family:var(--f-mono); font-weight:500; text-transform:none; white-space:nowrap; }
${SEL} .s10-verbs { letter-spacing:.3em; color:rgba(167,139,250,.6); }
${SEL} .s10-verbs .c { display:inline-block; }
${SEL} .s10-caret { position:absolute; left:0; top:0; width:3px; height:31px; border-radius:1px; background:#A78BFA; opacity:0; }
${SEL} .s10-cta { position:absolute; left:240px; top:1078px; width:600px; height:104px; border-radius:52px;
  background:#7C3AED; box-shadow:0 0 46px rgba(124,58,237,.5), inset 0 1px 0 rgba(255,255,255,.22);
  display:flex; align-items:center; justify-content:center; gap:19px; overflow:hidden;
  font-family:var(--f-body); font-weight:600; font-size:40px; line-height:1; color:#FBF8FF; white-space:nowrap; }
${SEL} .s10-cta .lbl { display:inline-block; letter-spacing:-.01em; position:relative; }
${SEL} .s10-cta .arr { display:inline-block; width:40px; height:40px; position:relative; }
${SEL} .s10-cta .arr svg { display:block; }
${SEL} .s10-shine { position:absolute; top:-34px; left:0; width:140px; height:172px;
  background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.25) 50%, rgba(255,255,255,0)); }
${SEL} .s10-url { font-family:var(--f-body); font-weight:600; letter-spacing:.005em; white-space:nowrap; }
${SEL} .t-display em { background-image:var(--grad); }
`,
    }, root);

    // ------------------------------------------------------------------ camadas (de trás para frente)
    // partículas ambientes do fundo (réplica exata das do motor em 1080×1920) — assumem no lugar de bg.particles a
    // partir de 6,5 para poderem ser apagadas sob o lockup (thumbnail limpo); ficam abaixo de tudo da cena
    const partC = h.canvas(root);
    root.insertBefore(partC.canvas, root.firstChild);
    const cp = partC.ctx;
    const back = h.canvas(root);                          // glow do lockup, metades de trás, Ponto atrás da frase
    const cb = back.ctx;
    const machSvg = h.svg('svg', { class: 'fill', width: W, height: H, viewBox: `0 0 ${W} ${H}`, fill: 'none' }, root);
    const textL = h.el('div', { cls: 's10-layer' }, root);
    const L1 = h.el('div', { cls: 's10-layer' }, textL);  // "Quando a máquina / engrena," (push)
    const L2 = h.el('div', { cls: 's10-layer' }, textL);  // "ela não / para mais." (push)
    const lockL = h.el('div', { cls: 's10-layer' }, root);
    const lockPulse = h.el('div', { cls: 's10-layer' }, lockL); // ícone + wordmark (pulso no clique final)
    const front = h.canvas(root);                         // metades da frente, riders, ondas, Ponto
    const cf = front.ctx;

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
    // métricas de tinta (Space Grotesk 700)
    const mctx = document.createElement('canvas').getContext('2d');
    const sgMetrics = (txt, size) => { mctx.font = `700 ${size}px "Space Grotesk"`; return mctx.measureText(txt); };
    const capH = (size) => sgMetrics('H', size).actualBoundingBoxAscent;

    // ================================================================== COMENTÁRIO "// cada máquina tem o seu ritmo"
    const CMT = '// cada máquina tem o seu ritmo';
    const cmt = h.text(CMT, { x: 90, y: 257, size: 26, cls: 't-mono s10-mono', ls: '0.08em', nowrap: true, parent: textL });
    const cmtChars = h.split(cmt, { type: 'chars' }).chars;
    const cmtIdx = [];
    { let si = 0; cmtChars.forEach(() => { while (CMT[si] === ' ') si++; cmtIdx.push(si++); }); }
    const cmtT = (i) => 0.5 + cmtIdx[i] * 0.025;          // digitação a 0,025 s/char (espaços contam)
    const cmtRight = cmtChars.map((c) => h.rect(c).right);
    const cmtBase = baselineOf(cmt);
    const cmtR = h.rect(cmt);
    gsap.set(cmtChars, { autoAlpha: 0 });
    cmtChars.forEach((c, i) => tl.set(c, { autoAlpha: 1 }, cmtT(i)));
    const CMT_END = cmtT(cmtChars.length - 1);
    const caret = h.el('div', { cls: 's10-caret' }, textL);
    const CARET_HOLD = CMT_END + 0.25, CARET_OFF = 6.5;
    function caretAlpha(t) {
      if (t < 0.5 || t >= CARET_OFF) return 0;
      if (t < CARET_HOLD) return 1;
      const u = t - Math.floor(t);
      const blink = u < 0.5 ? h.smooth(0, 0.06, u) * (1 - h.smooth(0.42, 0.5, u)) : 0;
      return Math.max(blink, 1 - h.smooth(CARET_HOLD, CARET_HOLD + 0.08, t));
    }

    // ================================================================== TAGLINE (ADAPTAÇÃO: 4 linhas, centradas em x 540)
    const TL = [
      { html: 'Quando a máquina', size: 96, bl: 540, layer: L1 },
      { html: '<em>engrena,</em>', size: 96, bl: 645, layer: L1 },
      { html: 'ela não', size: 170, bl: 850, layer: L2 },
      { html: 'para mais.', size: 170, bl: 1030, layer: L2 },
    ];
    TL.forEach((o) => {
      o.el = line(o.layer, o.html, { size: o.size, baseline: o.bl });
      o.sp = h.split(o.el, { type: 'words,chars' });
      centerX(o.el, CX);
    });
    const S1words = [...TL[0].sp.words, ...TL[1].sp.words];
    const S2words = [...TL[2].sp.words, ...TL[3].sp.words];

    // o '.' de 'mais.' (medido ANTES de qualquer transform): centro visual do glifo = casa do Ponto
    const dotChar = TL[3].sp.chars[TL[3].sp.chars.length - 1];
    const mm = sgMetrics('.', 170);
    const dcr = h.rect(dotChar);
    const base2 = baselineOf(TL[3].el);
    const P0 = { x: dcr.x + (mm.actualBoundingBoxRight - mm.actualBoundingBoxLeft) / 2, y: base2 - (mm.actualBoundingBoxAscent - mm.actualBoundingBoxDescent) / 2 };
    const DOT_INK_R = (mm.actualBoundingBoxRight + mm.actualBoundingBoxLeft) / 2;
    const wMais = S2words[S2words.length - 1];
    const wmr = h.rect(wMais);
    const exitOff = (chars) => chars.map((c) => { const r = h.rect(c); return { dx: (CE.x - r.cx) * 0.4, dy: (CE.y - r.cy) * 0.4 }; });
    TL.forEach((o) => { o.ex = exitOff(o.sp.chars); o.r = h.rect(o.el); });
    // caixas de tinta das linhas (para o halo do Ponto quando ele passa ATRÁS do texto)
    const inkBoxes = TL.map((o) => {
      const txt = o.el.textContent;
      const m = sgMetrics(txt, o.size);
      const cs = o.sp.chars;
      return { x0: h.rect(cs[0]).x, x1: h.rect(cs[cs.length - 1]).right, y0: o.bl - m.actualBoundingBoxAscent, y1: o.bl + m.actualBoundingBoxDescent };
    });
    // caixas de tinta por palavra (antes dos transforms) — folga do Ponto na metade da frente da órbita
    const wordRaw = [];
    TL.forEach((o, li) => o.sp.words.forEach((w) => {
      const r = h.rect(w);
      const m = sgMetrics(w.textContent.trim(), o.size);
      wordRaw.push({ li, x0: r.x, x1: r.right, y0: o.bl - m.actualBoundingBoxAscent, y1: o.bl + m.actualBoundingBoxDescent });
    }));
    const textCover = (x, y) => {
      let c = 0;
      for (const b of inkBoxes) {
        const k = smooth(b.x0 - 12, b.x0 + 12, x) * (1 - smooth(b.x1 - 12, b.x1 + 12, x)) *
          smooth(b.y0 - 12, b.y0 + 12, y) * (1 - smooth(b.y1 - 12, b.y1 + 12, y));
        if (k > c) c = k;
      }
      return c;
    };
    // na convergência (4,0–4,3) cada char encolhe para .6 e anda .4·(CE − c): somado, é uma escala EXATA em torno de
    // CE por (1 − .4·e), e = mecca.in (com o stagger das bordas, cada char está entre e = 0 e o e sem stagger).
    // A cobertura desfaz o push da linha e varre esse intervalo de e (4 amostras + rampa de 12 px) — generosa de
    // propósito: sob a tinta o trecho vai para trás das letras; fora dela, ir para o canvas de trás não muda nada.
    const exitCover = (x, y, t) => {
      const e = 0.4 * eMIn(seg(t, 4.0, 4.3));
      let c = 0;
      inkBoxes.forEach((b, li) => {
        const pk = li < 2 ? { k: 1.02, ox: 540, oy: 560 } : { k: s2At(t), ox: O2.x, oy: O2.y };
        const ux = pk.ox + (x - pk.ox) / pk.k, uy = pk.oy + (y - pk.oy) / pk.k;
        for (const f of [0, 1 / 3, 2 / 3, 1]) {
          const k = e * f, px = (ux - k * CE.x) / (1 - k), py = (uy - k * CE.y) / (1 - k);
          const v = smooth(b.x0 - 12, b.x0 + 12, px) * (1 - smooth(b.x1 - 12, b.x1 + 12, px)) *
            smooth(b.y0 - 12, b.y0 + 12, py) * (1 - smooth(b.y1 - 12, b.y1 + 12, py));
          if (v > c) c = v;
        }
      });
      return c;
    };
    // comentário '// cada máquina tem o seu ritmo' (só a parte já digitada, +8 px de folga, rampa de 8 px): no 9:16
    // as órbitas grandes de eixo vertical cruzam a linha dele — ali elas passam POR TRÁS e esmaecem (α × .3)
    const CMT_PAD = 8, CMT_RAMP = 8, CMT_DIM = 0.7;
    let cmtX1 = -1;                                       // borda direita da tinta digitada no quadro atual (onFrame)
    const cmtTyped = (t) => { let n = 0; while (n < cmtChars.length && cmtT(n) <= t + 1e-6) n++; return n; };
    const cmtCover = (x, y) => {
      if (cmtX1 < 0) return 0;
      const x0 = cmtR.x - CMT_PAD, x1 = cmtX1 + CMT_PAD, y0 = cmtR.y - CMT_PAD, y1 = cmtR.bottom + CMT_PAD;
      return smooth(x0 - CMT_RAMP, x0 + CMT_RAMP, x) * (1 - smooth(x1 - CMT_RAMP, x1 + CMT_RAMP, x)) *
        smooth(y0 - CMT_RAMP, y0 + CMT_RAMP, y) * (1 - smooth(y1 - CMT_RAMP, y1 + CMT_RAMP, y));
    };

    // entradas: palavras escalam 1,25→1 com fade (0,5 s, power4.out); 'mais.' cresce A PARTIR do Ponto.
    // ADAPTAÇÃO (spec §2 S10 / §5.1-12): cada palavra escala a partir do centro da PRÓPRIA linha (x 540, meio da
    // cap-height) — a linha inteira 'pousa' em direção ao centro, sem sobreposição entre vizinhas.
    const originLine = (w, o) => {
      const r = h.rect(w);
      const oy = o.bl - capH(o.size) / 2;
      gsap.set(w, { transformOrigin: `${f2(CX - r.x)}px ${f2(oy - r.y)}px` });
    };
    TL[0].sp.words.forEach((w) => originLine(w, TL[0]));
    TL[1].sp.words.forEach((w) => originLine(w, TL[1]));
    TL[2].sp.words.forEach((w) => originLine(w, TL[2]));
    TL[3].sp.words.slice(0, -1).forEach((w) => originLine(w, TL[3]));
    gsap.set(wMais, { transformOrigin: `${f2(P0.x - wmr.x)}px ${f2(P0.y - wmr.y)}px` });
    tl.fromTo(S1words, { scale: 1.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power4.out', stagger: 0.06 }, 0);
    const W2 = S2words.slice(0, -1);
    tl.fromTo(W2, { scale: 1.25, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power4.out', stagger: 0.08 }, 0.5);
    tl.fromTo(wMais, { scale: 1.12, opacity: 0, x: 4 }, { scale: 1, opacity: 1, x: 0, duration: 0.5, ease: 'power4.out' }, 0.5 + W2.length * 0.08);
    // o '.' é transparente até 2,0 (é o Ponto); depois o glifo fica e o Ponto sai orbitando
    gsap.set(dotChar, { opacity: 0 });
    tl.to(dotChar, { opacity: 1, duration: 0.12, ease: 'power1.out' }, 2.0);
    // push lento (linhas 3–4: 1→1,03 com origem (540,950); linhas 1–2: 1→1,02 com origem (540,560))
    const O2 = { x: 540, y: 950 };
    gsap.set(L1, { transformOrigin: '540px 560px' });
    tl.fromTo(L1, { scale: 1 }, { scale: 1.02, duration: 4.0, ease: 'none' }, 0);
    gsap.set(L2, { transformOrigin: `${O2.x}px ${O2.y}px` });
    tl.fromTo(L2, { scale: 1 }, { scale: 1.03, duration: 3.5, ease: 'none' }, 0.5);
    const s2At = (t) => 1 + 0.03 * seg(t, 0.5, 4.0);
    // saída 4,0–4,5: chars scale →.6 + fade em direção ao centro, das bordas para dentro (.008) — por linha
    const EXST = { each: 0.008, from: 'edges' };
    TL.forEach((o) => {
      const cs = o.sp.chars, ex = o.ex;
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
      // COLAPSO em CE
      tl.to(st, { R: 0, s: 0.2, duration: 0.4, ease: 'mecca.in' }, 4.0);
      tl.to(st, { a: 0, duration: 0.4, ease: 'sine.in' }, 4.0);
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
    tl.to(mi, { s: 0.15, duration: 0.4, ease: 'mecca.in' }, 4.0);
    tl.to(mi, { a: 0, duration: 0.4, ease: 'sine.in' }, 4.0);
    // ângulo das engrenagens (graus): 30°/s até 1,0; 30→300°/s (power2.in) até 4,0; 300°/s no colapso
    function gearAng(t) {
      if (t < 1) return 30 * t;
      if (t < 4) { const u = (t - 1) / 3; return 30 + 30 * (t - 1) + 270 * u * u * u; }
      return 390 + 300 * (t - 4);
    }

    // ================================================================== ÓRBITAS GRANDES + RIDERS (0–4,4)
    // ADAPTAÇÃO: eixo maior na VERTICAL (emolduram a tela alta). Um anel alto é um círculo girado em torno do eixo
    // vertical: a metade 'de trás' é a esquerda (cos < 0), a 'da frente' a direita.
    const ORB = [
      { rx: 300, ry: 1000, rot: -6 * DEG, color: P.magenta, per: 5.0, ph: 0.35, a0: 2.2 },
      { rx: 240, ry: 800, rot: -3 * DEG, color: P.lavender, per: 4.0, ph: 2.6, a0: 4.1 },
      { rx: 180, ry: 600, rot: -9 * DEG, color: P.lilac, per: 3.0, ph: 4.6, a0: 0.4 },
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
    const eSinIn = E('sine.in');
    const collapseA = (t) => 1 - eSinIn(seg(t, 4.0, 4.4));   // alpha: sem o salto final do mecca.in
    const backWide = (a) => Math.sin(a) < 0;              // elipse larga: metade de cima atrás
    const backTall = (a) => Math.cos(a) < 0;              // elipse alta: metade esquerda atrás

    // ================================================================== LOCKUP (4,5+) — horizontal oficial em .895
    const ISZ = 170;
    const IB = { x: 126, y: 695 };                        // bbox do ícone 126–296 × 695–865
    const IC = { x: IB.x + ISZ / 2, y: IB.y + ISZ / 2 };  // (211, 780)
    const ISC = ISZ / 228;
    const SOCK = { x: IB.x + 208 * ISC, y: IB.y + 160 * ISC };   // encaixe (281,1, 814,3)
    const LC = { x: 540, y: 780 };                        // centro do lockup (origem do pulso)
    const LG = { x: 328, y: 780 - 626 * 170 / 803 / 2, w: 626, h: 626 * 170 / 803 };   // wordmark 328–954 × 713,75–846,25
    const icWrap = h.el('div', { cls: 's10-abs', style: { left: IB.x + 'px', top: IB.y + 'px', width: ISZ + 'px', height: ISZ + 'px' } }, lockPulse);
    const icon = h.icon({ size: ISZ, parent: icWrap });
    icon.svg.style.display = 'block';
    const lgWrap = h.el('div', { cls: 's10-abs', style: { left: LG.x + 'px', top: f2(LG.y) + 'px', width: LG.w + 'px', height: f2(LG.h) + 'px' } }, lockPulse);
    const logo = h.logo({ width: LG.w, parent: lgWrap });
    logo.svg.style.display = 'block';
    // borda esquerda da tinta do 'M' (o halo do Ponto recua perto dela)
    let M_LEFT = LG.x + 5 * LS;
    try { M_LEFT = LG.x + logo.mecca.getBBox().x * LG.w / 803; } catch (e) { /* mantém a estimativa */ }

    // O lockup CHEGA no golpe (reverse + impact em 4,5), como na horizontal revisada:
    // arcos 4,40–4,55, pupila 4,45–4,55, wordmark 4,45–4,70.
    gsap.set([icon.arcOuter, icon.arcInner], { visibility: 'hidden' });
    // o arco nasce com drawSVG 0%: com linecap redondo isso seria um ponto violeta ao lado do encaixe
    // (parece o ponto do ícone chegando cedo). Ele só fica visível no quadro seguinte, já com traço.
    const ARC_T = 4.40, ARC_D = 0.15;
    tl.set([icon.arcOuter, icon.arcInner], { visibility: 'inherit' }, ARC_T + 1 / 60);
    tl.fromTo(icon.arcOuter, { drawSVG: '0%' }, { drawSVG: '100%', duration: ARC_D, ease: 'mecca.out' }, ARC_T);
    tl.fromTo(icon.arcInner, { drawSVG: '0%' }, { drawSVG: '100%', duration: ARC_D, ease: 'mecca.out' }, ARC_T);
    gsap.set(icon.pupil, { svgOrigin: '114 114', scale: 0 });
    tl.to(icon.pupil, { scale: 1, duration: 0.10, ease: 'mecca.back' }, 4.45);
    // o ponto do ícone fica oculto até o clique final (7,0)
    gsap.set(icon.dot, { visibility: 'hidden', attr: { fill: P.ink } });
    tl.set(icon.dot, { visibility: 'inherit' }, 7.0);
    tl.to(icon.dot, { attr: { fill: P.violet }, duration: 0.18, ease: 'power1.out' }, 7.0);
    // wordmark: clip-path inset(0 100% 0 0) → inset(0) em 4,45–4,70 (expo.out) + assenta de 1,06 → 1
    // (origem no centro do lockup: a borda esquerda nunca invade o ícone)
    const WM_T = 4.45, WM_D = 0.25, WM_S0 = 1.06;
    const eExpo = E('expo.out');
    gsap.set(lgWrap, { clipPath: 'inset(0% 100% 0% 0%)', transformOrigin: `${f2(LC.x - LG.x)}px ${f2(LC.y - LG.y)}px` });
    tl.to(lgWrap, { clipPath: 'inset(0% 0% 0% 0%)', duration: WM_D, ease: 'expo.out' }, WM_T);
    tl.fromTo(lgWrap, { scale: WM_S0 }, { scale: 1, duration: WM_D, ease: 'expo.out' }, WM_T);
    const wipeAt = (t) => eExpo(seg(t, WM_T, WM_T + WM_D));
    const wmScaleAt = (t) => lerp(WM_S0, 1, eExpo(seg(t, WM_T, WM_T + WM_D)));
    // pulso do lockup no clique (1→1,02→1)
    gsap.set(lockPulse, { transformOrigin: `${LC.x}px ${LC.y}px` });
    tl.to(lockPulse, { scale: 1.02, duration: 0.12, ease: 'power2.out' }, 7.0);
    tl.to(lockPulse, { scale: 1, duration: 0.4, ease: 'power2.inOut' }, 7.12);
    const kPulse = (t) => (t < 7.0 ? 1 : t < 7.12 ? 1 + 0.02 * eP2o(seg(t, 7.0, 7.12)) : t < 7.52 ? 1.02 - 0.02 * eP2io(seg(t, 7.12, 7.52)) : 1);
    const sockAt = (t) => { const k = kPulse(t); return { x: LC.x + k * (SOCK.x - LC.x), y: LC.y + k * (SOCK.y - LC.y) }; };
    // glow radial violeta atrás do lockup
    const lg = { a: 0 };
    tl.to(lg, { a: 0.35, duration: 0.6, ease: 'power2.out' }, 4.40);

    // ================================================================== VERBOS (ADAPTAÇÃO: 2 linhas)
    // linha 1 "ENGRENAR · MONTAR · CALIBRAR ·" (centrada pelas palavras; o 3º '·' fica pendurado depois de
    // CALIBRAR e acende com OPERAR, como na horizontal) · linha 2 "OPERAR · GIRAR"
    const VERBS = ['ENGRENAR', 'MONTAR', 'CALIBRAR', 'OPERAR', 'GIRAR'];
    const VLS = 26 * 0.3;                                 // tracking .3em a 26 px
    const wordHtml = (i) => `<span class="w" data-w="${i}">` + [...VERBS[i]].map((ch) => `<span class="c">${ch}</span>`).join('') + '</span>';
    const SEP = ' <span class="c sep">·</span> ';
    const vhtml1 = wordHtml(0) + SEP + wordHtml(1) + SEP + wordHtml(2) + ' <span class="c sep">·</span>';
    const vhtml2 = wordHtml(3) + SEP + wordHtml(4);
    const vDiv1 = line(lockL, vhtml1, { cls: 's10-mono s10-verbs', size: 26, baseline: 950 });
    const vDiv2 = line(lockL, vhtml2, { cls: 's10-mono s10-verbs', size: 26, baseline: 994 });
    {                                                     // linha 1: centra pelas palavras (sem o '·' pendurado)
      vDiv1.style.left = '0px';
      const cs = vDiv1.querySelectorAll('.w[data-w="0"] .c, .w[data-w="2"] .c');
      const x0 = h.rect(cs[0]).x, x1 = h.rect(cs[cs.length - 1]).right - VLS;
      vDiv1.style.left = f2(CX - (x0 + x1) / 2) + 'px';
    }
    centerX(vDiv2, CX, VLS);
    const vChars = [...vDiv1.querySelectorAll('.c'), ...vDiv2.querySelectorAll('.c')];
    const vSeps = [...vDiv1.querySelectorAll('.sep'), ...vDiv2.querySelectorAll('.sep')];
    const vWords = VERBS.map((_, i) => [...(i < 3 ? vDiv1 : vDiv2).querySelectorAll(`.w[data-w="${i}"] .c`)]);
    const vr1 = h.rect(vDiv1), vr2 = h.rect(vDiv2);
    const vWordsSpan = [h.rect(vWords[0][0]).x, h.rect(vWords[2][vWords[2].length - 1]).right - VLS];
    // estado apagado legível (α .6); os chars entram com stagger .01 a partir de 5,0
    gsap.set(vChars, { color: 'rgba(167,139,250,0.6)' });
    tl.fromTo(vChars, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out', stagger: 0.01 }, 5.0);
    // onda de brilho: cada verbo passa a ink com glow e fica aceso. A varredura começa em T − 0,12 e o ÚLTIMO
    // caractere acende exatamente no tick (T); o glow de cada char dá um flash no instante em que ele acende.
    // ENGRENAR (T = 5,0) acende junto com a própria entrada da linha (mesmo stagger .01).
    const V_T = [5.0, 5.5, 6.0, 6.5, 7.0];
    const V_LEAD = 0.12, V_CD = 0.06;
    const SH0 = '0 0 0px rgba(196,181,253,0)', SH_REST = '0 0 10px rgba(167,139,250,0.55)';
    vWords.forEach((cs, i) => {
      const T = V_T[i];
      const n = cs.length;
      const t0 = i ? T - V_LEAD : T;
      const cd = i ? V_CD : 0.12;
      const st = i ? (V_LEAD - V_CD) / (n - 1) : 0.01;
      const peak = `0 0 ${i === 4 ? 22 : 16}px rgba(196,181,253,0.95)`;
      tl.to(cs, { color: P.ink, duration: cd, ease: 'power1.out', stagger: st }, t0);
      tl.fromTo(cs, { textShadow: SH0 }, { textShadow: peak, duration: cd, ease: 'power2.out', stagger: st }, t0);
      tl.to(cs, { textShadow: SH_REST, duration: 0.45, ease: 'power2.inOut', stagger: st }, t0 + cd);
      if (i) tl.to(vSeps[i - 1], { color: 'rgba(167,139,250,0.85)', duration: V_LEAD, ease: 'power1.out' }, t0);
    });

    // ================================================================== CTA "Abrir minha máquina →" (600×104, centro (540,1130))
    const cta = h.el('div', { cls: 's10-cta' }, lockL);
    const shine = h.el('div', { cls: 's10-shine' }, cta);
    const ctaLbl = h.el('span', { cls: 'lbl', text: 'Abrir minha máquina' }, cta);
    const arr = h.el('span', { cls: 'arr' }, cta);
    const arrSvg = h.svg('svg', { width: 40, height: 40, viewBox: '0 0 34 34', fill: 'none' }, arr);
    h.svg('path', { d: 'M4 17.5H29M20 8.5L29 17.5L20 26.5', stroke: P.ink, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arrSvg);
    const ctaLblW = h.rect(ctaLbl).w;
    gsap.set(shine, { skewX: -22, x: -230 });
    tl.fromTo(cta, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'mecca.back' }, 5.0);
    tl.fromTo(shine, { x: -230 }, { x: 740, duration: 0.5, ease: 'power2.inOut', immediateRender: false }, 6.0);
    [5.5, 6.0, 6.5, 7.0, 7.5].forEach((b) => tl.to(arr, { x: 8, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1 }, b));

    // ================================================================== URL
    // a única ação real do vídeo (revisão da horizontal): Inter 600 40 px ink, centrada em x 540 com o miolo das
    // minúsculas em y ≈ 1270 (o 'bl 1270' da spec; baseline 1282), entra COM o botão em 5,0 (fade + y 10→0,
    // sem digitação) e fica 3 s completa na tela
    const url = line(lockL, 'meccanismo.com.br', { cls: 's10-url', size: 40, color: P.ink, baseline: 1282 });
    centerX(url, CX, 40 * 0.005);
    const urlR = h.rect(url);
    tl.fromTo(url, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'mecca.out' }, 5.0);

    // ================================================================== ÓRBITA FINA DO HOLD (em volta do lockup)
    const HO = { x: 540, y: 780, rx: 470, ry: 150, rot: -6 * DEG, a0: -0.35 };
    const ho = { p: 0, ra: 0 };
    tl.to(ho, { p: 1, duration: 0.9, ease: 'power2.inOut' }, 5.5);
    tl.to(ho, { ra: 1, duration: 0.4, ease: 'power2.out' }, 6.0);
    // ângulo do rider no fim (t = 8): frente-baixo da órbita, ≈ (806, 879) — no vão entre o wordmark (tinta até
    // y ≈ 818) e a linha 1 dos verbos (topo ≈ 931), longe do 'o' final (no 9:16 o 0,35 da horizontal parava em
    // (990, 776), rente ao 'o' e à borda da área segura: lia como ponto final de 'Meccanismo')
    const HO_PH = 1.0;
    const hoAng = (t) => HO_PH + TAU * (t - 8) / 4;
    // janelas (com folga) das duas linhas de verbos: a órbita passa ATRÁS deles
    const VK = [
      { x: vr1.x - 22, y: vr1.y - 4, w: vr1.w + 44 - VLS, h: vr1.h + 10 },
      { x: vr2.x - 22, y: vr2.y - 4, w: vr2.w + 44 - VLS, h: vr2.h + 10 },
    ];

    // ================================================================== EFEITOS (estado tweenável → canvas)
    const wave = { r: 0, a: 0 };
    tl.fromTo(wave, { r: 0, a: 0.8 }, { r: 1300, a: 0, duration: 0.9, ease: 'power2.out', immediateRender: false }, 0);
    const burst = { a: 0 };
    // pico do clarão da convergência EXATAMENTE em 4,5 (cues 'reverse' + 'impact'), anel nasce no mesmo quadro
    tl.fromTo(burst, { a: 0 }, { a: 0.55, duration: 0.1, ease: 'power2.in', immediateRender: false }, 4.4);
    tl.to(burst, { a: 0, duration: 0.45, ease: 'power2.out' }, 4.5);
    const cring = { r: 30, a: 0 };
    tl.fromTo(cring, { r: 30, a: 0.5 }, { r: 640, a: 0, duration: 0.7, ease: 'power2.out', immediateRender: false }, 4.5);
    const fring = { r: 0, a: 0 };
    tl.fromTo(fring, { r: 0, a: 0.8 }, { r: 90, a: 0, duration: 0.5, ease: 'power2.out', immediateRender: false }, 7.0);
    // flash do DROP: brilho RADIAL em screen centrado no impacto (o ponto fundido, 540,690), #C4B5FD α .5 no centro
    // → 0 em r 900 (nada de véu chapado/leitoso). O 1º quadro fica limpo (match cut com a S09): o pico cai no
    // quadro seguinte.
    h.flash(tl, root, 1 / 30, { color: P.lilac, peak: 0.5, dur: 0.4, cx: A0.x, cy: A0.y, r: 900 });

    // ================================================================== PARTÍCULAS DO FUNDO SEM SUJAR O LOCKUP (6,5+)
    // O motor não mascara bg.particles; a partir de 6,5 a cena zera bg.particles e redesenha EXATAMENTE as mesmas
    // partículas do motor em 1080×1920 (mesma semente, movimento, cintilar e vinheta) no canvas mais de baixo — e
    // apaga, em 6,5–7,0, as que caem nos bboxes do cartão final +8 px (ícone, wordmark, verbos, CTA, URL, comentário).
    const PARTS = (() => {
      const r = h.rng(20260929), arr = [];
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
    const PT_T = 6.5, PT_FADE = 0.5;
    tl.set(bg, { particles: 0 }, PT_T);
    const PBOX = [
      { x0: IB.x, y0: IB.y, x1: IB.x + ISZ, y1: IB.y + ISZ },                   // ícone
      { x0: LG.x, y0: LG.y, x1: LG.x + LG.w, y1: LG.y + LG.h },                 // wordmark
      { x0: vr1.x, y0: vr1.y, x1: vr1.right, y1: vr1.bottom },                  // verbos (linha 1)
      { x0: vr2.x, y0: vr2.y, x1: vr2.right, y1: vr2.bottom },                  // verbos (linha 2)
      { x0: 240, y0: 1078, x1: 840, y1: 1182 },                                 // CTA
      { x0: urlR.x, y0: urlR.y, x1: urlR.right, y1: urlR.bottom },              // URL
      { x0: cmtR.x, y0: cmtR.y, x1: cmtR.right, y1: cmtR.bottom },              // comentário
    ];
    const eSinIO = E('sine.inOut');
    function partMask(x, y) {
      let m = 1;
      for (const b of PBOX) {
        const dx = Math.max(b.x0 - x, 0, x - b.x1), dy = Math.max(b.y0 - y, 0, y - b.y1);
        m = Math.min(m, h.smooth(8, 20, Math.hypot(dx, dy)));
      }
      return m;
    }
    // O motor soma as partículas (lighter) ANTES da vinheta; aqui elas são compostas por cima do fundo pronto.
    // Para o resultado ser o mesmo (sem degrau em 6,5), cada partícula é pintada com a cor/alpha que, em source-over
    // sobre o fundo local Bv, dá exatamente Bv + contribuição do motor. Bv = réplica analítica dos radiais + vinheta
    // do motor no formato vertical (radiais em W·0,06 / W·1,02 / W·0,5; vinheta de H·0,35 a H·1,05 em (W/2, H/2)).
    const rgbOf = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const C_BG = rgbOf(P.bg), C_VI = rgbOf(P.violet), C_MA = rgbOf(P.magenta), C_VG = [10, 4, 20];
    function bgAt(x, y, t) {
      const s1 = Math.sin(t * 0.21), s2 = Math.cos(t * 0.17), s3 = Math.sin(t * 0.13 + 1.2);
      const mag = clamp(0.5 + bg.hue * 0.5);
      const c = C_BG.slice();
      const rad = (cx, cy, r, col, a) => {
        if (a <= 0) return;
        const k = a * Math.max(0, 1 - Math.hypot(x - cx, y - cy) / r);
        for (let i = 0; i < 3; i++) c[i] = c[i] * (1 - k) + col[i] * k;
      };
      rad(W * 0.06 + s1 * 60 + bg.driftX * 0.2, H * -0.08 + s2 * 40 + bg.driftY * 0.2, 1100, C_VI, 0.2 * bg.glowA);
      rad(W * 1.02 + s2 * 50 + bg.driftX * 0.2, H * -0.04 + s3 * 40 + bg.driftY * 0.2, 980, C_MA, 0.13 * bg.glowB * (0.6 + mag * 0.8));
      rad(W * 0.5 + s3 * 80 + bg.driftX * 0.15, H * 1.18 + bg.driftY * 0.15, 900, C_VI, 0.12 * bg.glowC);
      return c;
    }
    function fillComp(x, y, r, col, a, Bv) {
      // quer: Bv + col·a (aditivo). source-over com (c', a'): c'·a' + Bv·(1 − a')  ⇒  c' = Bv + col·a / a'
      let ap = 0;
      for (let i = 0; i < 3; i++) ap = Math.max(ap, (col[i] * a) / Math.max(1, 255 - Bv[i]));
      if (ap < 1e-4) return;
      ap = Math.min(1, ap);
      const cc = [0, 1, 2].map((i) => Math.round(clamp(Bv[i] + (col[i] * a) / ap, 0, 255)));
      cp.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},${ap})`;
      cp.beginPath(); cp.arc(x, y, r, 0, TAU); cp.fill();
    }
    const PCOL = {};
    function drawParticles(lt, gt) {
      cp.setTransform(1, 0, 0, 1, 0, 0); cp.clearRect(0, 0, W, H);
      if (lt < PT_T - 0.01 || bg.particles > 1e-3) return;   // até 6,5 quem desenha é o motor
      const kM = eSinIO(seg(lt, PT_T, PT_T + PT_FADE));
      const tt = gt * bg.speed;
      const R0 = H * 0.35, R1 = H * 1.05;
      cp.save();
      cp.globalCompositeOperation = 'lighter';               // halo + núcleo somam como no motor
      for (const p of PARTS) {
        let x = (p.x + p.vx * tt * p.z + bg.driftX * p.z) % W; if (x < 0) x += W;
        let y = (p.y + p.vy * tt * p.z + bg.driftY * p.z) % H; if (y < 0) y += H;
        const tw = 0.45 + 0.55 * Math.sin(p.tw + gt * p.tws);
        const a0 = 0.55 * tw * p.z;
        if (a0 < 0.02) continue;
        const v = bg.vignette * clamp((Math.hypot(x - W / 2, y - H / 2) - R0) / (R1 - R0));
        const a = a0 * (1 - v) * lerp(1, partMask(x, y), kM);
        if (a < 0.001) continue;
        const B0 = bgAt(x, y, gt);
        const Bv = [0, 1, 2].map((i) => B0[i] * (1 - v) + C_VG[i] * v);
        const col = PCOL[p.c] || (PCOL[p.c] = rgbOf(p.c));
        const rr = p.size * (0.7 + p.z * 0.6);
        fillComp(x, y, rr, col, a, Bv);
        if (p.size > 2.2) fillComp(x, y, rr * 4, col, a * 0.15, Bv);
      }
      cp.restore();
    }

    // ================================================================== FUNDO (idêntico à horizontal)
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
    const CTRL = { x: 900, y: 760 };                      // arco do tiro até o '.' (passa por cima, à direita)
    // órbita da frase (spec): centro CE, 520×330, −6°
    const ERX = 520, ERY = 330, EROT = -6 * DEG;
    // órbita em volta do ícone: a da horizontal revisada (112×130, centro 6 px à esquerda do centro do ícone) × .895
    // = 100,2×116,4 em volta de OC (205,6, 780), com a borda DIREITA achatada (rx 89,5 na metade cos > 0; contínua em
    // cos = 0, onde a tangente é horizontal nos dois lados). Borda direita em x 295,1: o núcleo (285,1–305,1) desliza
    // rente à borda do anel do ícone e fica ≥ 24 px antes do 'M' (tinta a partir de x ≈ 332,8, §1.2) — não lê mais
    // como '·Meccanismo' nos golpes 5,0/6,0. À esquerda o núcleo fica em x ≥ 95,4 (área segura) e embaixo a 25 px da
    // linha 1 dos verbos.
    const ORB_RX = 112 * LS, ORB_RY = 130 * LS, ORB_RX_R = 89.5;
    const orbRx = (a) => (Math.cos(a) > 0 ? ORB_RX_R : ORB_RX);
    const OC = { x: IC.x - 6 * LS, y: IC.y };
    const OCC_END = 4.36;                                 // até aqui (linhas 2–4 já em α 0) o Ponto passa atrás das letras que saem
    const qb = (a, c, b, k) => { const u = 1 - k; return { x: u * u * a.x + 2 * u * k * c.x + k * k * b.x, y: u * u * a.y + 2 * u * k * c.y + k * k * b.y }; };
    const DOT = (t) => { const s = s2At(t); return { x: O2.x + s * (P0.x - O2.x), y: O2.y + s * (P0.y - O2.y) }; };
    // FOLGA (§1.2: ≥ 24 px entre o Ponto e qualquer glifo que ele não substitui). A elipse nominal da spec passa
    // rente ao '.' de 'mais.' (lia 'mais:') e pela barriga do 'p' de 'para' a cada volta. Na metade da FRENTE o
    // caminho ganha um afastamento radial local mínimo (fator ≥ 1 sobre a elipse nominal, a partir de CE) que
    // mantém o Ponto a r + 24 px das caixas de tinta das palavras (com o push máximo de 1,03 incluído); suavizado
    // em ângulo. A metade de trás (atrás do texto) segue exatamente a elipse nominal.
    const wordBoxes = wordRaw.map((b) => {
      const push = b.li < 2 ? { k: 1.02, ox: 540, oy: 560 } : { k: 1.03, ox: O2.x, oy: O2.y };
      const pk = (v, c) => c + push.k * (v - c);
      return { x0: Math.min(b.x0, pk(b.x0, push.ox)), x1: Math.max(b.x1, pk(b.x1, push.ox)), y0: Math.min(b.y0, pk(b.y0, push.oy)), y1: Math.max(b.y1, pk(b.y1, push.oy)) };
    });
    const CLEAR = 12.6 + 24;                              // r máx. na frente (11 × 1,14) + 24 px
    const distBoxes = (x, y) => {
      let d = 1e9;
      for (const b of wordBoxes) {
        const dx = Math.max(b.x0 - x, 0, x - b.x1), dy = Math.max(b.y0 - y, 0, y - b.y1);
        d = Math.min(d, Math.hypot(dx, dy));
      }
      return d;
    };
    const NB = 720;
    const bulge = new Float64Array(NB);
    {
      const raw = new Float64Array(NB);
      for (let i = 0; i < NB; i++) {
        const a = (i / NB) * TAU;
        raw[i] = 1;
        if (Math.sin(a) <= 0) continue;                   // só a metade da frente
        for (let s = 1; s <= 1.6; s += 0.004) {
          const q = h.ellipsePt(CE.x, CE.y, ERX * s, ERY * s, EROT, a);
          raw[i] = s;
          if (distBoxes(q.x, q.y) >= CLEAR) break;
        }
      }
      // dilata ±6° e suaviza (cosseno elevado ±14°) para uma curva de desvio contínua
      const dil = new Float64Array(NB), DW = Math.round(NB * 6 / 360), SW = Math.round(NB * 14 / 360);
      for (let i = 0; i < NB; i++) { let m = 1; for (let j = -DW; j <= DW; j++) m = Math.max(m, raw[(i + j + NB) % NB]); dil[i] = m; }
      for (let i = 0; i < NB; i++) {
        let acc = 0, ws = 0;
        for (let j = -SW; j <= SW; j++) { const w = 0.5 + 0.5 * Math.cos(Math.PI * j / (SW + 1)); acc += w * dil[(i + j + NB) % NB]; ws += w; }
        bulge[i] = Math.max(raw[i], acc / ws);
      }
    }
    const bulgeAt = (a) => {
      const x = ((((a / TAU) % 1) + 1) % 1) * NB, i = Math.floor(x) % NB, f = x - Math.floor(x);
      return bulge[i] + (bulge[(i + 1) % NB] - bulge[i]) * f;
    };
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
    const PHI_T = Math.atan2(SOCK.y - OC.y, SOCK.x - OC.x);
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
        // sai do '.' numa elipse um pouco maior que encolhe até a da frase (a altura encolhe mais devagar);
        // o alvo é a elipse nominal com a folga local da metade da frente (bulgeAt)
        const Fb = lerp(1, bulgeAt(ph), h.smooth(2.0, 2.3, t));
        const f = lerp(F0, 1, eP2io(seg(t, 2.0, 2.4))) * Fb;
        const fy = lerp(F0, 1, Math.pow(seg(t, 2.0, 2.6), 2)) * Fb;
        const q = h.ellipsePt(CE.x, CE.y, ERX * f, ERY * fy, EROT, ph);
        return { x: q.x, y: q.y, back: Math.sin(ph) < 0, ph };
      }
      if (t < 4.5) {
        const k = eMIO(seg(t, 4.0, 4.5)), Fb = bulgeAt(ph);
        const q = h.ellipsePt(lerp(CE.x, OC.x, k), lerp(CE.y, OC.y, k), lerp(ERX * Fb, orbRx(ph), k), lerp(ERY * Fb, ORB_RY, k), lerp(EROT, 0, k), ph);
        const back = t < 4.25 && Math.sin(ph) < 0;
        // enquanto a tagline ainda some (até OCC_END), o trecho da frente que cruza as letras vai para trás delas
        return { x: q.x, y: q.y, back, occ: !back && t < OCC_END && exitCover(q.x, q.y, t) > 0.5, ph };
      }
      if (t < 6.5) return { x: OC.x + orbRx(ph) * Math.cos(ph), y: OC.y + ORB_RY * Math.sin(ph), back: false, ph };
      if (t < 7.0) {
        const k = eP3i(seg(t, 6.5, 7.0));
        return { x: lerp(OC.x, SOCK.x, k) + orbRx(ph) * (1 - k) * Math.cos(ph), y: lerp(OC.y, SOCK.y, k) + ORB_RY * (1 - k) * Math.sin(ph), back: false, ph };
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
      else if (t < 7.0) r = lerp(10, SOCK_R, eP3i(seg(t, 6.5, 7.0)));
      else r = SOCK_R;
      // perspectiva na órbita da frase: cresce na frente; atrás nunca fica abaixo de r 11 (não pode parecer rider)
      const dAmt = h.smooth(2.0, 2.3, t) * (1 - h.smooth(4.0, 4.4, t));
      if (dAmt > 0 && p) r *= 1 + 0.14 * Math.max(0, Math.sin(p.ph)) * dAmt;
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
      const lay = (q) => (q.back ? 2 : q.occ ? 1 : 0);    // 2 atrás · 1 da frente, sob as letras · 0 na frente
      let i0 = 0;
      while (i0 < N) {
        const ly = lay(pts[i0]);
        let i1 = i0;
        while (i1 < N && lay(pts[i1 + 1]) === ly) i1++;
        const j1 = Math.min(N, i1 + 1);
        const c = ly ? cb : cf, k = ly === 2 ? 0.75 : 1;
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
        if (t < 7.12) drawTrail(t, SOCK_R);
        // o glow some (o núcleo agora é o ponto #7C3AED do próprio ícone)
        const a = 1.25 * Math.exp(-(t - 7.0) * 7.5);
        if (a > 0.01) {
          const R = SOCK_R * (5 + (t - 7.0) * 10);
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
      const c = p.back || p.occ ? cb : cf;
      const k = p.back ? 0.85 : 1;
      drawTrail(t, r);
      const g = glowAt(t);
      // metade de trás: halo largo (a luz 'vaza' em volta das letras quando o Ponto passa atrás delas) e, nos vãos
      // entre as linhas, onde ele aparece inteiro, o glow reforça — é o herói, não um rider
      if (p.back) {
        const gapK = 1 - textCover(p.x, p.y);
        const R = r * 7;
        const gr = cb.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
        gr.addColorStop(0, hexA(P.lavender, 0.14 + 0.18 * gapK));
        gr.addColorStop(0.35, hexA(P.lavender, 0.05 + 0.07 * gapK));
        gr.addColorStop(1, hexA(P.lavender, 0));
        cb.fillStyle = gr; cb.beginPath(); cb.arc(p.x, p.y, R, 0, TAU); cb.fill();
      }
      // perto do 'M' do wordmark o halo recua (o ponto passa rente ao logo sem 'manchar' a letra)
      const nearM = t >= WM_T ? 1 - h.smooth(6, 40, M_LEFT - (p.x + r)) : 0;
      h.glowDot(c, p.x, p.y, r, P.lavender, clamp(0.6 * g * k * (1 - 0.5 * nearM), 0, 1));
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
    // underText: trechos da metade da FRENTE que cruzam as linhas da tagline vão para o canvas de trás (com o α da
    // frente) — no 9:16 os anéis altos atravessam o bloco de texto e nenhum traço pode riscar os glifos
    function strokeEllipse(cx, cy, rx, ry, rot, a0, span, aF, aB, lw, color, isBack = backWide, underText = false) {
      if (span <= 0.001 || (aF <= 0.002 && aB <= 0.002)) return;
      const steps = Math.max(8, Math.ceil(240 * span / TAU));
      const pb = new Path2D(), pf = new Path2D(), pu = new Path2D();
      const dims = [];
      let last = null;
      for (let i = 0; i < steps; i++) {
        const a = a0 + span * i / steps, b = a0 + span * (i + 1) / steps;
        const p1 = h.ellipsePt(cx, cy, rx, ry, rot, a), p2 = h.ellipsePt(cx, cy, rx, ry, rot, b);
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        let lay = isBack((a + b) / 2) ? 'b' : 'f';
        const cc = underText ? cmtCover(mx, my) : 0;
        if (lay === 'f' && underText && Math.max(textCover(mx, my), cc) > 0.5) lay = 'u';
        if (cc > 0.005) {                                 // junto ao comentário: segmento avulso, esmaecido
          dims.push({ p1, p2, c: lay === 'f' ? cf : cb, a: (lay === 'b' ? aB : aF) * (1 - CMT_DIM * cc) });
          last = null;
          continue;
        }
        const path = lay === 'b' ? pb : lay === 'u' ? pu : pf;
        if (last !== lay) path.moveTo(p1.x, p1.y);
        path.lineTo(p2.x, p2.y);
        last = lay;
      }
      cb.lineWidth = lw;
      cb.strokeStyle = hexA(color, aB); cb.stroke(pb);
      if (underText) { cb.strokeStyle = hexA(color, aF); cb.stroke(pu); }
      cf.strokeStyle = hexA(color, aF); cf.lineWidth = lw; cf.stroke(pf);
      for (const d of dims) {
        d.c.lineWidth = lw; d.c.lineCap = 'butt'; d.c.strokeStyle = hexA(color, d.a);
        d.c.beginPath(); d.c.moveTo(d.p1.x, d.p1.y); d.c.lineTo(d.p2.x, d.p2.y); d.c.stroke();
      }
    }
    function drawRider(o, t, amt, kc) {
      if (amt <= 0.002 || kc <= 0.001) return;
      const ang = (tt) => o.ph + TAU * tau(tt) / o.per;
      const at = (a) => h.ellipsePt(CE.x, CE.y, o.rx * kc, o.ry * kc, o.rot, a);
      const NS = 12, DT = 1 / 75;                         // rastro de 12 posições (mais longo quanto mais rápido)
      for (let j = NS - 1; j >= 1; j--) {
        const a1 = ang(Math.max(0, t - j * DT)), a2 = ang(Math.max(0, t - (j - 1) * DT));
        const q1 = at(a1), q2 = at(a2);
        const bk = backTall(a2);
        const mx = (q1.x + q2.x) / 2, my = (q1.y + q2.y) / 2, cc = cmtCover(mx, my);
        const c = bk || Math.max(textCover(mx, my), cc) > 0.5 ? cb : cf;
        const u = 1 - j / NS;
        c.strokeStyle = hexA(o.color, 0.6 * u * (bk ? 0.5 : 1) * amt * (1 - CMT_DIM * cc));
        c.lineWidth = 0.6 + 4.2 * u;
        c.lineCap = 'round';
        c.beginPath(); c.moveTo(q1.x, q1.y); c.lineTo(q2.x, q2.y); c.stroke();
      }
      const a = ang(t), p = at(a), bk = backTall(a), cc = cmtCover(p.x, p.y);
      h.glowDot(bk || Math.max(textCover(p.x, p.y), cc) > 0.5 ? cb : cf, p.x, p.y, 5, o.color, (bk ? 0.5 : 1) * amt * (1 - CMT_DIM * cc));
    }

    // ================================================================== onFrame
    onFrame((lt, gt) => {
      // seek direto para t = 0 exato não renderiza o set de posição 0 (GSAP): garante o estado do corte
      if (lt < 1e-4) Object.assign(bg, BG_IN);
      drawParticles(lt, gt);
      { const n = cmtTyped(lt); cmtX1 = n ? cmtRight[n - 1] : -1; }   // cobertura do comentário neste quadro

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

      cb.setTransform(1, 0, 0, 1, 0, 0); cb.clearRect(0, 0, W, H);
      cf.setTransform(1, 0, 0, 1, 0, 0); cf.clearRect(0, 0, W, H);
      cb.globalCompositeOperation = 'source-over';
      cf.globalCompositeOperation = 'source-over';

      // --- órbita fina do hold (primeiro no canvas da frente: o recorte dos verbos só atinge ela)
      if (ho.p > 0.001) {
        strokeEllipse(HO.x, HO.y, HO.rx, HO.ry, HO.rot, HO.a0, ho.p * TAU, 0.12, 0.07, 1.2, P.lavender);
        cf.save();
        cf.globalCompositeOperation = 'destination-out';
        for (const vk of VK) {
          const gk = cf.createLinearGradient(vk.x, 0, vk.x + vk.w, 0);
          gk.addColorStop(0, 'rgba(0,0,0,0)'); gk.addColorStop(0.06, 'rgba(0,0,0,1)');
          gk.addColorStop(0.94, 'rgba(0,0,0,1)'); gk.addColorStop(1, 'rgba(0,0,0,0)');
          cf.fillStyle = gk; cf.fillRect(vk.x, vk.y, vk.w, vk.h);
        }
        cf.restore();
      }

      // --- glow radial violeta atrás do lockup (respira)
      if (lg.a > 0.002) {
        const breath = 1 + 0.12 * Math.sin(TAU * (lt - 4.5) / 2) + (lt >= 7.0 ? 0.35 * Math.exp(-(lt - 7.0) * 5) : 0);
        const GRr = 720 * LS;
        cb.save();
        cb.translate(LC.x, LC.y + 10 * LS); cb.scale(1, 0.4);
        const g = cb.createRadialGradient(0, 0, 0, 0, 0, GRr);
        g.addColorStop(0, hexA(P.violet, lg.a * breath));
        g.addColorStop(0.5, hexA(P.violet, lg.a * breath * 0.35));
        g.addColorStop(1, hexA(P.violet, 0));
        cb.fillStyle = g; cb.beginPath(); cb.arc(0, 0, GRr, 0, TAU); cb.fill();
        cb.restore();
      }

      // --- 3 órbitas grandes + riders (0–4,4)
      const kc = collapseK(lt);
      if (kc > 0.001) {
        const fa = collapseA(lt);
        for (const o of ORB) {
          strokeEllipse(CE.x, CE.y, o.rx * kc, o.ry * kc, o.rot, o.a0, o.st.p * TAU, 0.3 * fa, 0.15 * fa, 1.5, P.lavender, backTall, true);
          drawRider(o, lt, rid.a * fa, kc);
        }
      }

      // --- onda de choque do DROP (a partir do ponto fundido)
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

      // --- implosão/explosão da convergência em CE — atrás do lockup, que já chegou no golpe
      if (burst.a > 0.002) {
        const R = 190;
        const g = cb.createRadialGradient(CE.x, CE.y, 0, CE.x, CE.y, R);
        g.addColorStop(0, hexA(P.lilac, burst.a));
        g.addColorStop(0.25, hexA(P.lavender, burst.a * 0.4));
        g.addColorStop(1, hexA(P.violet, 0));
        cb.fillStyle = g; cb.beginPath(); cb.arc(CE.x, CE.y, R, 0, TAU); cb.fill();
      }
      if (cring.a > 0.002) {
        cb.strokeStyle = hexA(P.lavender, cring.a); cb.lineWidth = 2;
        cb.beginPath(); cb.arc(CE.x, CE.y, cring.r, 0, TAU); cb.stroke();
      }

      // --- luz na borda da revelação do wordmark
      const wp = wipeAt(lt);
      if (wp > 0.001 && wp < 0.999) {
        const ws = wmScaleAt(lt), wy = (y) => LC.y + ws * (y - LC.y);
        const x = LC.x + ws * (LG.x + LG.w * wp - LC.x);
        const a = 0.85 * h.smooth(0, 0.04, wp) * (1 - h.smooth(0.7, 0.98, wp));
        const y0 = wy(IB.y + 5 * LS), y1 = wy(IB.y + 185 * LS);
        const gv = cf.createLinearGradient(0, y0, 0, y1);
        gv.addColorStop(0, hexA(P.lilac, 0)); gv.addColorStop(0.5, hexA(P.lilac, a)); gv.addColorStop(1, hexA(P.lilac, 0));
        cf.fillStyle = gv; cf.fillRect(x - 1, y0, 2, y1 - y0);
        const gh = cf.createLinearGradient(x - 26 * LS, 0, x + 6 * LS, 0);
        gh.addColorStop(0, hexA(P.violet, 0)); gh.addColorStop(1, hexA(P.lavender, a * 0.35));
        cf.fillStyle = gh; cf.fillRect(x - 26 * LS, wy(LG.y), 32 * LS, wy(LG.y + LG.h) - wy(LG.y));
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

      // --- caret do comentário: fixo durante a digitação; depois pisca a 1 Hz (aceso na 1ª metade de cada
      //     segundo, fades curtos) e apaga de vez após o último piscar antes do clique (6,5) — o hold fica calmo
      const ca = caretAlpha(lt);
      if (ca > 0.002) {
        let n = 0;
        while (n < cmtChars.length && cmtT(n) <= lt + 1e-6) n++;
        const x = n ? cmtRight[n - 1] + 4 : 90;
        caret.style.transform = `translate(${f2(x)}px, ${f2(cmtBase - 25)}px)`;
        caret.style.opacity = (0.9 * ca).toFixed(3);
      } else caret.style.opacity = '0';
    });

    // ================================================================== SOM (idêntico à horizontal)
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
      P0: { x: +P0.x.toFixed(1), y: +P0.y.toFixed(1) }, DOT_INK_R: +DOT_INK_R.toFixed(1), base2: +base2.toFixed(1),
      lines: TL.map((o, i) => ({ box: [Math.round(o.r.x), Math.round(o.r.right)], w: Math.round(o.r.w), ink: [Math.round(inkBoxes[i].x0), Math.round(inkBoxes[i].x1), Math.round(inkBoxes[i].y0), Math.round(inkBoxes[i].y1)] })),
      cmt: [Math.round(cmtR.x), Math.round(cmtR.right), Math.round(cmtR.y), Math.round(cmtR.bottom), +cmtBase.toFixed(1)],
      verbs1: [Math.round(vr1.x), Math.round(vr1.right), Math.round(vr1.y), Math.round(vr1.bottom)], verbsWords: vWordsSpan.map((v) => +v.toFixed(1)),
      verbs2: [Math.round(vr2.x), Math.round(vr2.right), Math.round(vr2.y), Math.round(vr2.bottom)],
      url: [Math.round(urlR.x), Math.round(urlR.right), Math.round(urlR.w)], ctaLbl: +ctaLblW.toFixed(1),
      PHI0: +(PHI0 / DEG).toFixed(1), F0: +F0.toFixed(3), dPhi: +(dPhi / DEG).toFixed(1), cyc7: +cyc[NF].toFixed(3),
      SOCK: { x: +SOCK.x.toFixed(1), y: +SOCK.y.toFixed(1) }, M_LEFT: +M_LEFT.toFixed(1),
    });
  },
});
})();
