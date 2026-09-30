/*
 * S03 — "O mercado te dá duas caixas."
 * As duas caixas do mercado (agência / consultoria) solidificam, mostram o que entregam
 * (a peça, o slide), fecham e somem. "As duas somem na hora H." — a energia cai e só
 * sobra o Ponto, que é o ponto final de 'caixas.', do header e de 'H.'.
 *
 * Primeiro quadro (= último da S02): dois retângulos tracejados, eyebrow, Ponto (1625,690) r 16.
 * Último quadro: sem texto, só o Ponto (990,690) r 14; bg dim .5, vignette .75, glowA/B .6, particles .5.
 */
MECCA.scene({
  id: 's03-duas-caixas',
  build({ root, tl, D, h, P, bg, onFrame, cue }) {
    const ID = 's03-duas-caixas';
    const SEL = `[data-scene="${ID}"]`;
    const { lerp, clamp, hexA } = h;
    const TAU = Math.PI * 2;

    h.el('style', {
      text: `
      ${SEL} .mk { overflow: hidden; padding: 0.1em 0.16em 0.12em 0; }
      ${SEL} .mk > .in { display: block; }
      ${SEL} .ib { display: inline-block; }
      ${SEL} .dot { color: transparent; }
      ${SEL} .lil { color: ${P.lilac}; }
      ${SEL} .mut { color: ${P.muted}; }
      ${SEL} .blm { display: inline-block; width: 0; height: 0; }
      ${SEL} .caret { position: absolute; width: 3px; height: 26px; background: ${P.lavender}; border-radius: 1px; }
    `,
    }, root);

    // ------------------------------------------------------------------ fundo: estado do corte 14,0
    tl.set(bg, { glowA: 1, glowB: 1, glowC: 1, grid: 0, particles: 1, driftX: 0, driftY: 0, speed: 1, warp: 0, vignette: 0.55, dim: 0, hue: 0, grain: 1 }, 0);

    // ------------------------------------------------------------------ camadas
    const svgL = h.svg('svg', { class: 'fill', width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, root);
    const defs = h.svg('defs', {}, svgL);
    const txt = h.el('div', { style: { position: 'absolute', inset: '0' } }, root);
    const { ctx: cx } = h.canvas(root);           // Ponto (acima de tudo)

    const eb = h.eyebrow('O PROBLEMA', { x: 192, y: 120, size: 22, anchor: 'cl', parent: root });

    // ------------------------------------------------------------------ medição tipográfica
    const mctx = document.createElement('canvas').getContext('2d');
    function dotInk(size) {
      mctx.font = `700 ${size}px "Space Grotesk"`;
      const m = mctx.measureText('.');
      return { cx: (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2, cy: (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2 };
    }
    // Linha mascarada posicionada pela BASELINE (mede a baseline real com um marcador inline-block vazio)
    function line(html, { x, base, size, color = P.ink, parent = txt }) {
      const outer = h.text(`<div class="in">${html}<span class="blm"></span></div>`, { x, y: 0, size, color, lh: 1.2, nowrap: true, parent });
      outer.classList.add('mk');
      const inner = outer.firstElementChild;
      const mk = inner.querySelector('.blm');
      const b = h.rect(mk).y - h.rect(outer).y;
      mk.remove();
      const L = { outer, inner, b, size, left: x, top: base - b, base };
      outer.style.top = L.top + 'px';
      return L;
    }
    const setLeft = (L, x) => { L.left = x; L.outer.style.left = x + 'px'; };
    const setBase = (L, base) => { L.base = base; L.top = base - L.b; L.outer.style.top = L.top + 'px'; };
    const dotCenter = (L) => { const d = L.inner.querySelector('.dot'); const ink = dotInk(L.size); return { x: h.rect(d).x + ink.cx, y: L.base + ink.cy }; };

    // ------------------------------------------------------------------ T1: "O mercado te dá / duas caixas."
    const P0 = { x: 1625, y: 690 };                 // Ponto herdado da S02
    const A = line('O mercado te dá', { x: 192, base: 420, size: 96 });
    const B = line('<span class="lil">duas</span> caixas<span class="dot">.</span>', { x: 192, base: 700, size: 260 });
    {
      // alinha o '.' de 'caixas.' exatamente sob o Ponto (ajuste de poucos px)
      const d = dotCenter(B);
      const dx = P0.x - d.x, dy = P0.y - d.y;
      setLeft(A, A.left + dx); setLeft(B, B.left + dx); setBase(B, B.base + dy);
    }

    // header de uma linha: 44 px, centrado em x 960, baseline 196
    const HD = line('<span class="hA">O mercado te dá</span> <span class="hB"><span class="lil">duas</span> caixas<span class="dot">.</span></span>', { x: 0, base: 196, size: 44 });
    setLeft(HD, Math.round(960 - h.rect(HD.inner).w / 2));
    const hA = h.rect(HD.inner.querySelector('.hA'));
    const hB = h.rect(HD.inner.querySelector('.hB'));
    const PH = dotCenter(HD);                         // Ponto no header (r 4)
    const HR = h.rect(HD.outer);
    const HC = { x: HR.cx, y: HR.cy };               // origem do push do header
    const PUSH_H = 0.015;

    // ------------------------------------------------------------------ T2: "As duas somem / na hora H."
    const P2 = { x: 990, y: 690 };
    const w2 = h.el('div', { style: { position: 'absolute', inset: '0' } }, txt);
    const L1 = line('<span class="ib r">As duas</span> <span class="ib sm mut">somem</span>', { x: 192, base: 500, size: 180, parent: w2 });
    const L2 = line('<span class="ib r">na hora H</span><span class="dot">.</span>', { x: 192, base: 700, size: 180, parent: w2 });
    {
      const d = dotCenter(L2);
      const dx = P2.x - d.x, dy = P2.y - d.y;
      setLeft(L1, L1.left + dx); setLeft(L2, L2.left + dx); setBase(L2, L2.base + dy);
    }
    gsap.set(w2, { transformOrigin: `${P2.x}px ${P2.y}px` });

    // ------------------------------------------------------------------ cards
    const rr = (x, y, w, hh, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + hh - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + hh}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + hh - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
    const sheenId = h.uid('s3sheen');
    {
      const g = h.svg('linearGradient', { id: sheenId, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      h.svg('stop', { offset: 0, 'stop-color': P.lilac, 'stop-opacity': 0.07 }, g);
      h.svg('stop', { offset: 0.45, 'stop-color': P.lilac, 'stop-opacity': 0 }, g);
    }
    function makeCard(x) {
      const cxm = x + 377;
      const g = h.svg('g', {}, svgL);
      const d = rr(x, 250, 754, 600, 28);
      const fill = h.svg('path', { d, fill: P.surface, 'fill-opacity': 0, stroke: 'none' }, g);
      const sheen = h.svg('path', { d, fill: `url(#${sheenId})`, opacity: 0, stroke: 'none' }, g);
      const border = h.svg('path', { d, fill: 'none', stroke: 'rgba(167,139,250,0.3)', 'stroke-width': 1.5, 'stroke-dasharray': '8 10', 'vector-effect': 'non-scaling-stroke' }, g);
      // "shimmer": dois cometas correndo pela borda (cauda violeta → magenta → cabeça clara)
      const beams = [];
      const layers = [[420, P.violet, 0.3, 2], [230, P.magenta, 0.5, 2], [100, P.pink, 0.6, 2], [30, P.lilac, 0.85, 2.2]];
      for (let k = 0; k < 2; k++) {
        const set = layers.map(([len, col, a, w]) => ({ len, a, el: h.svg('path', { d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', opacity: 0, 'vector-effect': 'non-scaling-stroke' }, g) }));
        beams.push(set);
      }
      gsap.set(g, { svgOrigin: `${cxm} 550` });
      const per = border.getTotalLength();
      return { g, fill, sheen, border, beams, per, st: { fill: 0, gap: 10, sa: 0.3, beam: 0 } };
    }
    const C1 = makeCard(192), C2 = makeCard(972);

    // ------------------------------------------------------------------ ilustrações (line art lavanda 2 px)
    const mk = (tag, attrs, parent) => h.svg(tag, Object.assign({ fill: 'none', stroke: P.lavender, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, attrs), parent);
    function buildPost(g) {
      return [
        mk('path', { d: rr(240, 372, 260, 188, 14) }, g),
        mk('path', { d: rr(256, 388, 228, 112, 8) }, g),
        mk('polyline', { points: '257,486 316,434 350,466 394,422 483,492' }, g),
        mk('circle', { cx: 446, cy: 414, r: 12 }, g),
        mk('line', { x1: 256, y1: 524, x2: 436, y2: 524, 'stroke-width': 1.5 }, g),
        mk('line', { x1: 256, y1: 544, x2: 376, y2: 544, 'stroke-width': 1.5 }, g),
        mk('path', { d: 'M470 543 C461 537 459 530 463 526.5 C466 524 469 525.5 470 528 C471 525.5 474 524 477 526.5 C481 530 479 537 470 543 Z', 'stroke-width': 1.6 }, g),
      ];
    }
    function buildSlide(g) {
      return [
        mk('path', { d: rr(1020, 372, 320, 180, 10) }, g),
        mk('line', { x1: 1044, y1: 400, x2: 1134, y2: 400, 'stroke-width': 1.5 }, g),
        mk('line', { x1: 1044, y1: 530, x2: 1316, y2: 530, 'stroke-width': 1.5, opacity: 0.6 }, g),
        mk('path', { d: rr(1066, 482, 36, 48, 3) }, g),
        mk('path', { d: rr(1122, 448, 36, 82, 3) }, g),
        mk('path', { d: rr(1178, 410, 36, 120, 3) }, g),
        mk('polyline', { points: '1046,485 1084,462 1140,428 1196,390 1248,400 1300,386', 'stroke-width': 1.5 }, g),
        mk('path', { d: 'M1288.7 381.9 L1300 386 L1292.3 395.2', 'stroke-width': 1.5 }, g),
      ];
    }
    function makeIllu(builder, bb, seed) {
      const outer = h.svg('g', {}, svgL);          // subida de 16 px (tl)
      const float = h.svg('g', {}, outer);         // flutuação (onFrame)
      const orig = h.svg('g', {}, float);
      const els = builder(orig);
      // 5 tiras horizontais (clip-path) — só aparecem no fatiamento
      const r = h.rng(seed);
      const strips = [];
      for (let i = 0; i < 5; i++) {
        const y0 = bb.y + (i * bb.h) / 5, y1 = bb.y + ((i + 1) * bb.h) / 5;
        const cid = h.uid('s3clip');
        const cp = h.svg('clipPath', { id: cid, clipPathUnits: 'userSpaceOnUse' }, defs);
        h.svg('rect', { x: bb.x - 120, y: y0, width: bb.w + 240, height: y1 - y0 }, cp);
        const wrap = h.svg('g', { opacity: 0 }, float);
        const clip = h.svg('g', { 'clip-path': `url(#${cid})` }, wrap);
        const shift = h.svg('g', {}, clip);
        builder(shift);
        gsap.set(wrap, { svgOrigin: `${bb.x + bb.w / 2} ${(y0 + y1) / 2}` });
        strips.push({ wrap, shift, dx: (i % 2 ? 1 : -1) * (16 + r() * 8) });
      }
      return { outer, float, orig, els, strips };
    }
    const POST = makeIllu(buildPost, { x: 236, y: 368, w: 268, h: 196 }, 31);
    const SLIDE = makeIllu(buildSlide, { x: 1016, y: 368, w: 328, h: 188 }, 57);

    // ------------------------------------------------------------------ textos dos cards
    // cada card tem seu próprio contêiner de texto: quando a caixa fecha, o conteúdo é esmagado junto
    const CW1 = h.el('div', { style: { position: 'absolute', inset: '0' } }, txt);
    const CW2 = h.el('div', { style: { position: 'absolute', inset: '0' } }, txt);
    gsap.set(CW1, { transformOrigin: '569px 550px' });
    gsap.set(CW2, { transformOrigin: '1349px 550px' });
    function label(text, x, parent) {
      const e = h.text(text, { x, y: 300, size: 22, cls: 't-mono', ls: '0.2em', lh: 1, nowrap: true, color: P.lavender, parent });
      const r = h.rect(e);
      const sp = h.split(e, { type: 'chars' });
      const caret = h.el('div', { cls: 'caret', style: { left: x + 'px', top: '298px' } }, parent);
      return { e, chars: sp.chars, caret, w: r.w };
    }
    const LB1 = label('CAIXA 1 — AGÊNCIA', 240, CW1);
    const LB2 = label('CAIXA 2 — CONSULTORIA', 1020, CW2);
    const T11 = line('Executa a peça', { x: 240, base: 690, size: 84, parent: CW1 });
    const T12 = line('<span class="ib e">e</span> <span class="ib sm">some.</span>', { x: 240, base: 790, size: 84, color: P.muted, parent: CW1 });
    const T21 = line('Entrega o slide', { x: 1020, base: 690, size: 84, parent: CW2 });
    const T22 = line('<span class="ib e">e</span> <span class="ib sm">some.</span>', { x: 1020, base: 790, size: 84, color: P.muted, parent: CW2 });
    const some1 = h.split(T12.inner.querySelector('.sm'), { type: 'chars' }).chars;
    const some2 = h.split(T22.inner.querySelector('.sm'), { type: 'chars' }).chars;
    const somem = h.split(L1.inner.querySelector('.sm'), { type: 'chars' }).chars;
    // eyebrow NÃO é dividido em chars (fica idêntico ao da S02 no corte); a saída "apaga de trás para frente" com clip-path em steps
    const ebLbl = eb.querySelector('.lbl');
    const ebW = h.rect(ebLbl).w;
    const ebN = ebLbl.textContent.length;
    const ebDash = eb.querySelector('.dash');

    // ================================================================== COREOGRAFIA
    // 0,0 — slam de T1 (máscara, 0,5 s, mecca.out, stagger .12)
    tl.fromTo([A.inner, B.inner], { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'mecca.out', stagger: 0.12 }, 0);

    // 1,0–1,5 — FLIP para o header (mecca.inOut) + crossfade
    gsap.set([A.outer, B.outer], { transformOrigin: '0px 0px' });
    const sA = 44 / 96, sB = 44 / 260;
    tl.to(A.outer, { x: hA.x - A.left, y: 196 - A.top - sA * A.b, scale: sA, duration: 0.5, ease: 'mecca.inOut' }, 1.0);
    // 'duas caixas.' encolhe e desliza para a direita antes de subir: assim não atravessa 'O mercado te dá'
    const FB = { dx: hB.x - B.left, dy: 196 - B.top - sB * B.b, ex: 'expo.out', ey: 'power2.inOut', es: 'power3.out' };
    tl.to(B.outer, { x: FB.dx, duration: 0.5, ease: FB.ex }, 1.0);
    tl.to(B.outer, { y: FB.dy, duration: 0.5, ease: FB.ey }, 1.0);
    tl.to(B.outer, { scale: sB, duration: 0.5, ease: FB.es }, 1.0);
    tl.to([A.outer, B.outer], { autoAlpha: 0, duration: 0.06, ease: 'none' }, 1.47);
    tl.fromTo(HD.outer, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06, ease: 'none' }, 1.47);
    gsap.set(HD.outer, { transformOrigin: '50% 50%' });
    tl.to(HD.outer, { scale: 1 + PUSH_H, duration: 4.0, ease: 'none' }, 1.5);
    // 5,5–5,8 — header sai
    tl.to(HD.inner, { yPercent: -110, duration: 0.3, ease: 'mecca.in' }, 5.5);

    // caixas: solidificam (1,0 / 1,5)
    function openBox(C, LB, t1, t2, ILL, at, textAt) {
      tl.to(C.st, { fill: 0.9, duration: 0.3, ease: 'power2.out' }, at);
      tl.to(C.st, { gap: 0, duration: 0.45, ease: 'mecca.out' }, at);
      tl.to(C.st, { sa: 0.5, duration: 0.3, ease: 'power2.out' }, at);
      tl.to(C.st, { beam: 1, duration: 0.6, ease: 'power1.inOut' }, at + 0.5);
      // label digitado (0,3 s) com caret
      const n = LB.chars.length;
      tl.fromTo(LB.chars, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001, stagger: 0.3 / n }, textAt);
      tl.fromTo(LB.caret, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, duration: 0.001 }, textAt);
      tl.to(LB.caret, { x: LB.w, duration: 0.3, ease: `steps(${n})` }, textAt);
      tl.set(LB.caret, { autoAlpha: 0 }, textAt + 0.5);
      tl.set(LB.caret, { autoAlpha: 1 }, textAt + 0.75);
      tl.set(LB.caret, { autoAlpha: 0 }, textAt + 1.0);
      // ilustração: DrawSVG 0→100% (0,5 s)
      tl.fromTo(ILL.els, { drawSVG: '0%', autoAlpha: 0 }, { drawSVG: '100%', autoAlpha: 1, duration: 0.5, ease: 'mecca.out', stagger: 0.035 }, at);
      // títulos por máscara (stagger .12)
      tl.fromTo([t1.inner, t2.inner], { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'mecca.out', stagger: 0.12 }, textAt);
    }
    // caixa 1: o texto entra 0,25 s depois (espera o FLIP do título passar por cima do card)
    openBox(C1, LB1, T11, T12, POST, 1.0, 1.25);
    openBox(C2, LB2, T21, T22, SLIDE, 1.5, 1.5);

    // 'e some.' pisca em steps (1→.3→1→.3→1, 0,3 s)
    function blink(el, at) {
      tl.set(el, { opacity: 0.3 }, at);
      tl.set(el, { opacity: 1 }, at + 0.075);
      tl.set(el, { opacity: 0.3 }, at + 0.15);
      tl.set(el, { opacity: 1 }, at + 0.225);
    }
    blink(T12.inner, 3.0);
    blink(T22.inner, 3.5);

    // fechamento das caixas (4,5 / 5,0)
    function closeBox(C, CW, LB, t1, t2, some, ILL, at) {
      tl.to(C.st, { beam: 0, duration: 0.25, ease: 'power1.in' }, at - 0.25);
      tl.to([C.g, CW], { scaleY: 0.01, duration: 0.3, ease: 'mecca.in' }, at);
      tl.to(C.st, { sa: 0.95, duration: 0.3, ease: 'mecca.in' }, at);
      tl.to([C.g, CW], { scaleX: 0, duration: 0.15, ease: 'mecca.in' }, at + 0.3);
      // 'some.' evapora
      gsap.set(some, { filter: 'blur(0px)' });
      tl.to(some, { y: -24, filter: 'blur(6px)', autoAlpha: 0, duration: 0.3, ease: 'power2.out', stagger: 0.03 }, at);
      // o resto sai por máscara
      tl.to(t1.inner, { yPercent: -110, duration: 0.3, ease: 'mecca.in' }, at);
      tl.to(t2.inner.querySelector('.e'), { yPercent: -110, duration: 0.3, ease: 'mecca.in' }, at + 0.04);
      // label se apaga de trás para frente
      tl.to(LB.chars.slice().reverse(), { autoAlpha: 0, duration: 0.001, stagger: 0.012 }, at);
      // a ilustração fica sozinha e sobe 16 px
      tl.to(ILL.outer, { y: -16, duration: 0.6, ease: 'mecca.inOut' }, at);
    }
    closeBox(C1, CW1, LB1, T11, T12, some1, POST, 4.5);
    closeBox(C2, CW2, LB2, T21, T22, some2, SLIDE, 5.0);

    // 5,5–5,8 — fatiamento em 5 tiras
    function slice(ILL, at, seed) {
      tl.set(ILL.orig, { autoAlpha: 0 }, at);
      tl.set(ILL.strips.map(s => s.wrap), { autoAlpha: 1 }, at);
      const r = h.rng(seed);
      ILL.strips.forEach((s, i) => {
        tl.to(s.shift, { x: s.dx, duration: 0.12, ease: 'power4.out' }, at);
        const t0 = at + 0.1 + r() * 0.05;            // somem: a tira achata primeiro e depois recolhe (scale → 0)
        tl.to(s.wrap, { scaleY: 0, duration: 0.14, ease: 'mecca.in' }, t0);
        tl.to(s.wrap, { scaleX: 0, duration: 0.2, ease: 'mecca.in' }, t0);
      });
    }
    slice(POST, 5.5, 5);
    slice(SLIDE, 5.5, 9);

    // 6,0 — SLAM de T2 + shake
    tl.fromTo([L1.inner, L2.inner], { yPercent: 100 }, { yPercent: 0, duration: 0.35, ease: 'expo.out', stagger: 0.1 }, 6.0);
    h.shake(tl, root, 6.0, { amp: 6, n: 8, dur: 0.4, seed: 603 });
    tl.fromTo(w2, { scale: 1 }, { scale: 1.03, duration: 3.5, ease: 'none' }, 6.0);
    // 9,5–9,85 — 'somem' some letra por letra; 9,6–9,9 o resto sai
    gsap.set(somem, { transformOrigin: '50% 62%' });
    tl.to(somem, { scaleY: 0, duration: 0.15, ease: 'mecca.in', stagger: 0.07 }, 9.5);
    tl.to(L1.inner.querySelector('.r'), { autoAlpha: 0, y: -10, duration: 0.3, ease: 'mecca.in' }, 9.6);
    tl.to(L2.inner.querySelector('.r'), { autoAlpha: 0, y: -10, duration: 0.3, ease: 'mecca.in' }, 9.6);

    // eyebrow sai junto com T2 (9,5–9,8): apaga de trás para frente e o traço recolhe
    tl.fromTo(ebLbl, { clipPath: 'inset(-12px 0px -12px -12px)' }, { clipPath: `inset(-12px ${ebW.toFixed(2)}px -12px -12px)`, duration: 0.02 * ebN, ease: `steps(${ebN})`, immediateRender: false }, 9.5);
    gsap.set(ebDash, { transformOrigin: '0% 50%' });
    tl.to(ebDash, { scaleX: 0, duration: 0.14, ease: 'mecca.in' }, 9.66);

    // 9,0–9,9 — a energia cai
    tl.to(bg, { dim: 0.5, vignette: 0.75, glowA: 0.6, glowB: 0.6, particles: 0.5, duration: 0.9, ease: 'power2.inOut' }, 9.0);

    // ================================================================== PONTO (função pura do tempo)
    const FX = gsap.parseEase(FB.ex), FY = gsap.parseEase(FB.ey), FS = gsap.parseEase(FB.es);
    const E_FLY = gsap.parseEase('power3.inOut');
    const HE = { x: HC.x + (PH.x - HC.x) * (1 + PUSH_H), y: HC.y + (PH.y - HC.y) * (1 + PUSH_H) };  // '.' do header ao fim do push
    // solta-se do header caindo reto (sem raspar no 's'), contorna o slide pela esquerda e pousa no '.' de 'H.'
    const K1 = { x: HE.x + 3, y: HE.y + 90 }, K2 = { x: 620, y: 360 };
    const cb = (a, c1, c2, b, k) => { const u = 1 - k; return u * u * u * a + 3 * u * u * k * c1 + 3 * u * k * k * c2 + k * k * k * b; };
    function pontoPos(t) {
      if (t < 1.0) return { x: P0.x, y: P0.y, r: 16 };
      if (t < 1.5) {
        // acompanha exatamente o '.' de 'caixas.' durante o FLIP (mesmas eases de x, y e escala)
        const u = (t - 1.0) / 0.5, ks = FS(u), sc = 1 + (sB - 1) * ks;
        const x = B.left + FB.dx * FX(u) + (P0.x - B.left) * sc;
        const y = B.top + FB.dy * FY(u) + (P0.y - B.top) * sc;
        const w = h.smooth(0.8, 1, u);              // funde nos últimos quadros com o '.' medido do header
        return { x: lerp(x, PH.x, w), y: lerp(y, PH.y, w), r: lerp(16, 4, ks) };
      }
      if (t < 5.5) { const s = 1 + PUSH_H * clamp((t - 1.5) / 4); return { x: HC.x + (PH.x - HC.x) * s, y: HC.y + (PH.y - HC.y) * s, r: 4 * s }; }
      if (t < 6.0) { const k = E_FLY((t - 5.5) / 0.5); return { x: cb(HE.x, K1.x, K2.x, P2.x, k), y: cb(HE.y, K1.y, K2.y, P2.y, k), r: lerp(4 * (1 + PUSH_H), 14, k) }; }
      return { x: P2.x, y: P2.y, r: 14 };
    }
    function mixHex(a, b, k) {
      const A0 = parseInt(a.slice(1), 16), B0 = parseInt(b.slice(1), 16);
      const ch = (sh) => Math.round(lerp((A0 >> sh) & 255, (B0 >> sh) & 255, k));
      return '#' + [16, 8, 0].map(sh => ch(sh).toString(16).padStart(2, '0')).join('');
    }
    function drawPonto(c, t) {
      const p = pontoPos(t);
      // pulso único em 9,5 (e respiração leve enquanto está pousado)
      const pk = t >= 9.5 ? Math.sin(Math.PI * clamp((t - 9.5) / 0.36)) : 0;
      const breathe = (t > 1.6 && t < 5.4 ? 0.12 * Math.sin(TAU * (t - 1.6) / 2) * h.smooth(1.6, 2.0, t) * (1 - h.smooth(5.0, 5.4, t)) : 0) +
        (t > 6.4 && t < 9.4 ? 0.14 * Math.sin(TAU * (t - 6.4) / 2) * h.smooth(6.4, 6.9, t) * (1 - h.smooth(8.9, 9.4, t)) : 0);
      const r = p.r * (1 + 0.28 * pk);
      const glow = 1 + breathe + 1.1 * pk;
      // rastro acima de 600 px/s
      const dt = 1 / 120;
      const q = pontoPos(Math.max(0, t - dt));
      const speed = Math.hypot(p.x - q.x, p.y - q.y) / dt;
      const trail = h.smooth(600, 1000, speed);
      if (trail > 0) {
        // rastro das últimas 8 posições (8/60 s), amostrado denso para virar um cometa contínuo
        const N = 64, WIN = 8 / 60;
        for (let j = N; j >= 1; j--) {
          const pp = pontoPos(Math.max(0, t - (j / N) * WIN));
          const u = 1 - j / N;                       // 0 = ponta da cauda, →1 = junto ao núcleo
          c.fillStyle = hexA(mixHex(P.violet, P.magenta, u), 0.13 * (0.15 + u) * trail);
          c.beginPath(); c.arc(pp.x, pp.y, pp.r * (0.3 + 0.65 * u), 0, TAU); c.fill();
        }
      }
      h.glowDot(c, p.x, p.y, r, P.lavender, clamp(0.6 * glow, 0, 1));
      c.fillStyle = P.ink;
      c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.fill();
      // anel do pulso
      if (t >= 9.5 && t < 9.92) {
        const k = (t - 9.5) / 0.42;
        const e = 1 - Math.pow(1 - k, 3);
        c.strokeStyle = hexA(P.lavender, 0.55 * (1 - k));
        c.lineWidth = 1.5;
        c.beginPath(); c.arc(p.x, p.y, 16 + 74 * e, 0, TAU); c.stroke();
      }
    }

    // ================================================================== onFrame
    const f4 = (v) => v.toFixed(3);
    function applyCard(C, lt, t0) {
      const s = C.st;
      C.fill.setAttribute('fill-opacity', f4(s.fill));
      C.sheen.setAttribute('opacity', f4(s.fill / 0.9));
      C.border.setAttribute('stroke', `rgba(167,139,250,${f4(s.sa)})`);
      C.border.setAttribute('stroke-dasharray', s.gap < 0.02 ? 'none' : `8 ${f4(s.gap)}`);
      const on = s.beam > 0.001;
      C.beams.forEach((set, k) => {
        const head = ((lt - t0) * C.per / 3.2 + k * C.per / 2) % C.per;
        set.forEach(L => {
          if (!on) { L.el.setAttribute('opacity', 0); return; }
          L.el.setAttribute('opacity', f4(L.a * s.beam));
          L.el.setAttribute('stroke-dasharray', `${L.len} ${f4(C.per - L.len)}`);
          L.el.setAttribute('stroke-dashoffset', f4(-(head - L.len)));
        });
      });
    }
    onFrame((lt) => {
      applyCard(C1, lt, 1.0);
      applyCard(C2, lt, 1.5);
      // ilustrações flutuam (±4 px, seno de 2 s) — em contrafase
      const fl = lt > 1.5 ? 4 * Math.sin(TAU * (lt - 1.5) / 2) : 0;
      POST.float.setAttribute('transform', `translate(0 ${f4(fl)})`);
      SLIDE.float.setAttribute('transform', `translate(0 ${f4(-fl)})`);
      // 'somem' tremula (α .85–1) e depois some letra a letra
      somem.forEach((ch, i) => {
        let a = 1;
        if (lt >= 6.0) {
          const fr = Math.floor(lt * 15);
          const r = h.rng(fr * 131 + i * 17 + 7);
          a = 0.85 + 0.15 * r();
        }
        const k = clamp((lt - (9.5 + 0.07 * i)) / 0.15);
        ch.style.opacity = f4(a * (1 - k * k));
      });
      // Ponto
      cx.clearRect(0, 0, 1920, 1080);
      drawPonto(cx, lt);
    });

    // ================================================================== som
    cue(0, 'impact', 'slam T1', 0.7);
    cue(1, 'click', 'caixa 1', 0.5);
    cue(1, 'whoosh', 'caixa 1 (FLIP do header)', 0.35);
    cue(1.5, 'click', 'caixa 2', 0.5);
    cue(3, 'glitch', 'pisca', 0.15);
    cue(3.5, 'glitch', 'pisca', 0.15);
    cue(4.5, 'click', 'caixa 1 fecha', 0.7);
    cue(4.5, 'sub-drop', 'caixa 1 fecha', 0.35);
    cue(5, 'click', 'caixa 2 fecha', 0.7);
    cue(5.5, 'glitch', 'fatiamento', 0.7);
    cue(6, 'impact', "'As duas somem na hora H.'", 1.0);
    cue(9, 'sub-drop', 'energia cai', 0.5);
    cue(9.5, 'glitch', "'somem' some", 0.3);
  },
});
