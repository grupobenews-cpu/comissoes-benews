(() => {
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
      ${SEL} .mk { overflow: hidden; padding: 0.12em 0.16em 0.28em 0; margin-bottom: -0.28em; }
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
      // posições inteiras (left/top): a rasterização do texto em left/top fracionário varia com o histórico de buscas
      const L = { outer, inner, b, size, left: 0, top: 0, base };
      setLeft(L, x); setBase(L, base);
      return L;
    }
    function setLeft(L, x) { L.left = Math.round(x); L.outer.style.left = L.left + 'px'; }
    function setBase(L, base) { L.top = Math.round(base - L.b); L.base = L.top + L.b; L.outer.style.top = L.top + 'px'; }
    const dotCenter = (L) => { const d = L.inner.querySelector('.dot'); const ink = dotInk(L.size); return { x: h.rect(d).x + ink.cx, y: L.base + ink.cy }; };

    // Máscaras: a caixa .mk tem .28em livres embaixo (descendentes/cedilhas não são cortadas enquanto a entrada
    // desacelera) e .12em em cima (acentos). Deslocamento que esconde o texto por inteiro abaixo da máscara ampliada:
    // (1,2 + 0,28)/1,2 = 123,3 % → 125 %. Para cima, (1,2 + 0,12)/1,2 = 110 %.
    const Y_IN = 125, Y_OUT = -110;

    // ------------------------------------------------------------------ T1: "O mercado te dá / duas caixas."
    // GF = grupo do FLIP (as duas linhas viajam JUNTAS, com a mesma transformação); GS = grupo do slam (escala em torno do Ponto)
    const P0 = { x: 1625, y: 690 };                 // Ponto herdado da S02
    const GF = h.el('div', { style: { position: 'absolute', inset: '0' } }, txt);
    const GS = h.el('div', { style: { position: 'absolute', inset: '0' } }, GF);
    const A = line('O mercado te dá', { x: 192, base: 420, size: 96, parent: GS });
    const B = line('<span class="lil">duas</span> caixas<span class="dot">.</span>', { x: 192, base: 700, size: 260, parent: GS });
    {
      // alinha o '.' de 'caixas.' exatamente sob o Ponto (ajuste de poucos px)
      const d = dotCenter(B);
      const dx = P0.x - d.x, dy = P0.y - d.y;
      setLeft(A, A.left + dx); setLeft(B, B.left + dx); setBase(B, B.base + dy);
    }

    // header de uma linha: 44 px, centrado em x 960, baseline 196
    const HD = line('<span class="hA">O mercado te dá</span> <span class="hB"><span class="lil">duas</span> caixas<span class="dot">.</span></span>', { x: 0, base: 196, size: 44 });
    setLeft(HD, Math.round(960 - h.rect(HD.inner).w / 2));
    const hAel = HD.inner.querySelector('.hA'), hBel = HD.inner.querySelector('.hB');
    const hB = h.rect(hBel);
    const PH = dotCenter(HD);                         // Ponto no header (r 4)
    const HR = h.rect(HD.outer);
    const HC = { x: HR.cx, y: HR.cy };               // origem do push do header
    const PUSH_H = 0.02;
    // FLIP em grupo: uma única semelhança (escala + translação, origem 0 0) leva 'duas caixas.' EXATAMENTE sobre o
    // 'duas caixas.' do header (44/260). 'O mercado te dá' viaja no mesmo grupo e dissolve; o do header surge ao lado.
    const FLIP = { t0: 0.75, t1: 1.1, s: 44 / 260 };
    FLIP.x = hB.x - FLIP.s * B.left;
    FLIP.y = HD.base - FLIP.s * B.base;
    const MP = { x: FLIP.s * P0.x + FLIP.x, y: FLIP.s * P0.y + FLIP.y };   // onde o '.' de 'caixas.' pousa

    // ------------------------------------------------------------------ T2: "As duas somem / na hora H."
    // (sem nós de texto soltos ao lado de elementos com tween: o espaço fica DENTRO do span, como &nbsp;)
    const P2 = { x: 990, y: 690 };
    const w2 = h.el('div', { style: { position: 'absolute', inset: '0' } }, txt);
    const L1 = line('<span class="ib r">As duas&nbsp;</span><span class="ib sm mut">somem</span>', { x: 192, base: 500, size: 180, parent: w2 });
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
    // Desenho original em 260×188 / 320×180 (tl 240,372 / 1020,372), ampliado por geometria (não por transform):
    // o traço continua com 2 px (1,5 px nas hairlines) e o DrawSVG mede o comprimento real.
    // peça ×252/188 (≈349×252) e slide ×1,4 (448×252): mesma altura, topos em y 360, base comum em y 612.
    const mk = (tag, attrs, parent) => h.svg(tag, Object.assign({ fill: 'none', stroke: P.lavender, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, attrs), parent);
    const ILL_TOP = 360;
    const POST_K = 252 / 188, SLIDE_K = 1.4;
    function scaler(x0, y0, k) {                    // (x0,y0) = tl do desenho original → (x0, ILL_TOP)
      const r2 = (v) => Math.round(v * 100) / 100;
      const X = (x) => r2(x0 + (x - x0) * k), Y = (y) => r2(ILL_TOP + (y - y0) * k), S = (v) => r2(v * k);
      const pts = (arr) => { const o = []; for (let i = 0; i < arr.length; i += 2) o.push(`${X(arr[i])},${Y(arr[i + 1])}`); return o.join(' '); };
      // caminho com comandos absolutos M/L/C/Z: [cmd, x, y, x, y, ...]
      const path = (arr) => { let s = '', i = 0; while (i < arr.length) { if (typeof arr[i] === 'string') { s += (s ? ' ' : '') + arr[i++]; continue; } s += ` ${X(arr[i])} ${Y(arr[i + 1])}`; i += 2; } return s; };
      const box = (x, y, w, hh, r) => rr(X(x), Y(y), S(w), S(hh), S(r));
      return { X, Y, S, pts, path, box };
    }
    function buildPost(g) {
      const s = scaler(240, 372, POST_K);
      return [
        mk('path', { d: s.box(240, 372, 260, 188, 14) }, g),
        mk('path', { d: s.box(256, 388, 228, 112, 8) }, g),
        mk('polyline', { points: s.pts([257, 486, 316, 434, 350, 466, 394, 422, 483, 492]) }, g),
        mk('circle', { cx: s.X(446), cy: s.Y(414), r: s.S(12) }, g),
        mk('line', { x1: s.X(256), y1: s.Y(524), x2: s.X(436), y2: s.Y(524), 'stroke-width': 1.5 }, g),
        mk('line', { x1: s.X(256), y1: s.Y(544), x2: s.X(376), y2: s.Y(544), 'stroke-width': 1.5 }, g),
        mk('path', { d: s.path(['M', 470, 543, 'C', 461, 537, 459, 530, 463, 526.5, 'C', 466, 524, 469, 525.5, 470, 528, 'C', 471, 525.5, 474, 524, 477, 526.5, 'C', 481, 530, 479, 537, 470, 543, 'Z']), 'stroke-width': 1.6 }, g),
      ];
    }
    function buildSlide(g) {
      const s = scaler(1020, 372, SLIDE_K);
      return [
        mk('path', { d: s.box(1020, 372, 320, 180, 10) }, g),
        mk('line', { x1: s.X(1044), y1: s.Y(400), x2: s.X(1134), y2: s.Y(400), 'stroke-width': 1.5 }, g),
        mk('line', { x1: s.X(1044), y1: s.Y(530), x2: s.X(1316), y2: s.Y(530), 'stroke-width': 1.5, opacity: 0.6 }, g),
        mk('path', { d: s.box(1066, 482, 36, 48, 3) }, g),
        mk('path', { d: s.box(1122, 448, 36, 82, 3) }, g),
        mk('path', { d: s.box(1178, 410, 36, 120, 3) }, g),
        mk('polyline', { points: s.pts([1046, 485, 1084, 462, 1140, 428, 1196, 390, 1248, 400, 1300, 386]), 'stroke-width': 1.5 }, g),
        mk('path', { d: s.path(['M', 1288.7, 381.9, 'L', 1300, 386, 'L', 1292.3, 395.2]), 'stroke-width': 1.5 }, g),
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
    const illBB = (x0, w, hh, k) => ({ x: x0 - 4, y: ILL_TOP - 4, w: w * k + 8, h: hh * k + 8 });
    const POST = makeIllu(buildPost, illBB(240, 260, 188, POST_K), 31);
    const SLIDE = makeIllu(buildSlide, illBB(1020, 320, 180, SLIDE_K), 57);

    // ------------------------------------------------------------------ textos dos cards
    // CW  = contêiner recortado (clip-path) pelo retângulo que colapsa — o texto NÃO é escalado junto com a caixa.
    // PW  = wrapper interno com o push lento (1→1,02): micro-movimento sem brigar com o recorte.
    // 'some.' fica numa camada à parte, sem recorte: evapora para fora da caixa que se fecha.
    const full = { position: 'absolute', inset: '0' };
    function textBox(cxm) {
      const CW = h.el('div', { style: full }, txt);
      const PW = h.el('div', { style: full }, CW);
      const SW = h.el('div', { style: full }, txt);
      const PS = h.el('div', { style: full }, SW);
      gsap.set([PW, PS], { transformOrigin: `${cxm}px 550px` });
      return { CW, PW, PS, cxm };
    }
    const X1 = textBox(569), X2 = textBox(1349);
    function label(text, x, parent) {
      const e = h.text(text, { x, y: 300, size: 22, cls: 't-mono', ls: '0.2em', lh: 1, nowrap: true, color: P.lavender, parent });
      const r = h.rect(e);
      const sp = h.split(e, { type: 'chars' });
      // posição do cursor depois de k chars digitados: logo após a caixa do char k−1 (que já inclui o tracking) + folga
      const stops = [0, ...sp.chars.map(ch => h.rect(ch).right - r.x + 4)];
      const caret = h.el('div', { cls: 'caret', style: { left: x + 'px', top: '298px' } }, parent);
      return { e, chars: sp.chars, caret, w: r.w, stops };
    }
    // 'e some.' = duas linhas mascaradas lado a lado: 'e ' (recortada com a caixa) + 'some.' (camada livre)
    function eSome(x, X) {
      const a = line('<span class="ib e">e&nbsp;</span>', { x, base: 790, size: 84, color: P.muted, parent: X.PW });
      const wE = h.rect(a.inner.querySelector('.e')).w;
      const b = line('<span class="ib sm">some.</span>', { x: x + wE, base: 790, size: 84, color: P.muted, parent: X.PS });
      return { a, b, chars: h.split(b.inner.querySelector('.sm'), { type: 'chars' }).chars };
    }
    const LB1 = label('CAIXA 1 — AGÊNCIA', 240, X1.PW);
    const LB2 = label('CAIXA 2 — CONSULTORIA', 1020, X2.PW);
    const T11 = line('Executa a peça', { x: 240, base: 690, size: 84, parent: X1.PW });
    const T12 = eSome(240, X1);
    const T21 = line('Entrega o slide', { x: 1020, base: 690, size: 84, parent: X2.PW });
    const T22 = eSome(1020, X2);
    const somem = h.split(L1.inner.querySelector('.sm'), { type: 'chars' }).chars;
    // eyebrow NÃO é dividido em chars (fica idêntico ao da S02 no corte); a saída "apaga de trás para frente" com clip-path em steps
    const ebLbl = eb.querySelector('.lbl');
    const ebW = h.rect(ebLbl).w;
    const ebN = ebLbl.textContent.length;
    const ebDash = eb.querySelector('.dash');

    // DETERMINISMO: o GSAP lê a matriz de transform de um elemento HTML no 1º render de um tween de transform.
    // Se esse 1º render acontecer com o root em display:none (1ª busca dentro da cena, busca fora de ordem, render
    // com --from), ele tira o nó do lugar para medir e o devolve com insertBefore(nextElementSibling), o que pode
    // trocar a ordem com nós de texto. Aqui, com o root ainda em layout, todos os transforms ficam em cache.
    [root, ...root.querySelectorAll('*')].forEach(el => { if (el instanceof HTMLElement && el.tagName !== 'STYLE') gsap.getProperty(el, 'x'); });

    // ================================================================== COREOGRAFIA
    // 0,0 — SLAM de T1: 'duas caixas.' primeiro (o golpe cai no 1º quadro depois do corte), escala 1,08→1 em torno
    // do Ponto (o '.' de 'caixas.' não sai de baixo dele) e tremor curto. O quadro 0 continua = último da S02.
    tl.fromTo([B.inner, A.inner], { yPercent: Y_IN }, { yPercent: 0, duration: 0.18, ease: 'expo.out', stagger: 0.03 }, 0);
    gsap.set(GS, { transformOrigin: `${P0.x}px ${P0.y}px` });
    tl.fromTo(GS, { scale: 1.08 }, { scale: 1, duration: 0.25, ease: 'expo.out' }, 0);
    h.shake(tl, root, 0, { amp: 4, n: 5, dur: 0.2, seed: 301 });
    // os tracejados dos cards recuam (α .3 → .12) enquanto T1 ocupa a tela; voltam em 1,0
    tl.to([C1.st, C2.st], { sa: 0.12, duration: 0.2, ease: 'power2.out' }, 0);
    tl.to(C2.st, { sa: 0.3, duration: 0.3, ease: 'power2.out' }, 1.0);   // (o C1 sobe direto para .5 no openBox)

    // 0,75–1,1 — FLIP em GRUPO para o header (mecca.inOut): uma só transformação para as duas linhas.
    // 'duas caixas.' pousa exatamente sobre o do header; 'O mercado te dá' dissolve no caminho e o do header surge.
    gsap.set(GF, { transformOrigin: '0px 0px' });
    const FD = FLIP.t1 - FLIP.t0;
    tl.to(GF, { x: FLIP.x, y: FLIP.y, scale: FLIP.s, duration: FD, ease: 'mecca.inOut' }, FLIP.t0);
    tl.to(A.outer, { autoAlpha: 0, duration: 0.2, ease: 'sine.in' }, FLIP.t0);
    tl.fromTo(hAel, { autoAlpha: 0 }, { autoAlpha: 1, duration: FLIP.t1 - 0.93, ease: 'power1.out' }, 0.93);
    // troca seca (sem crossfade, sem queda de brilho): no quadro de 1,1 o grupo já está na pose final
    tl.set(hBel, { autoAlpha: 0 }, 0);
    tl.set(hBel, { autoAlpha: 1 }, FLIP.t1 - 0.01);
    tl.set(B.outer, { autoAlpha: 0 }, FLIP.t1 - 0.01);
    gsap.set(HD.outer, { transformOrigin: '50% 50%' });
    tl.to(HD.outer, { scale: 1 + PUSH_H, duration: 5.5 - FLIP.t1, ease: 'none' }, FLIP.t1);
    // 5,5–5,8 — header sai
    tl.to(HD.inner, { yPercent: Y_OUT, duration: 0.3, ease: 'mecca.in' }, 5.5);

    // caixas: solidificam. Caixa 1: a borda fica sólida no clique de 1,0 e o conteúdo (fill, label, traço, títulos)
    // entra em 1,1, depois que o FLIP do header terminou. Caixa 2: tudo em 1,5.
    function openBox(C, X, LB, t1, t2, ILL, at, closeAt, borderAt = at) {
      tl.to(C.st, { fill: 0.9, duration: 0.3, ease: 'power2.out' }, at);
      tl.to(C.st, { gap: 0, duration: 0.45, ease: 'mecca.out' }, borderAt);
      tl.to(C.st, { sa: 0.5, duration: 0.3, ease: 'power2.out' }, borderAt);
      tl.to(C.st, { beam: 1, duration: 0.6, ease: 'power1.inOut' }, at + 0.5);
      // label digitado (0,3 s): o char k aparece em at + k·0,3/n; o cursor (x no onFrame) fica logo depois do último visível
      const n = LB.chars.length;
      tl.fromTo(LB.chars, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001, stagger: 0.3 / n }, at);
      tl.fromTo(LB.caret, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, at);
      tl.set(LB.caret, { autoAlpha: 0 }, at + 0.5);
      tl.set(LB.caret, { autoAlpha: 1 }, at + 0.75);
      tl.set(LB.caret, { autoAlpha: 0 }, at + 1.0);
      // ilustração: DrawSVG 0→100% (0,5 s)
      tl.fromTo(ILL.els, { drawSVG: '0%', autoAlpha: 0 }, { drawSVG: '100%', autoAlpha: 1, duration: 0.5, ease: 'mecca.out', stagger: 0.035 }, at);
      // títulos por máscara (stagger .12) — 'e ' e 'some.' são duas linhas que entram juntas
      tl.fromTo(t1.inner, { yPercent: Y_IN }, { yPercent: 0, duration: 0.5, ease: 'mecca.out' }, at);
      tl.fromTo([t2.a.inner, t2.b.inner], { yPercent: Y_IN }, { yPercent: 0, duration: 0.5, ease: 'mecca.out' }, at + 0.12);
      // push lento do conteúdo textual (1→1,02 até o fechamento, continuando no mesmo ritmo durante a saída)
      const k = (closeAt + 0.45 - at) / (closeAt - at);
      tl.fromTo([X.PW, X.PS], { scale: 1 }, { scale: 1 + 0.02 * k, duration: closeAt + 0.45 - at, ease: 'none' }, at);
    }
    openBox(C1, X1, LB1, T11, T12, POST, FLIP.t1, 4.5, 1.0);
    openBox(C2, X2, LB2, T21, T22, SLIDE, 1.5, 5.0);

    // 'e some.' pisca em steps (1→.3→1→.3→1, 0,3 s)
    function blink(els, at) {
      tl.set(els, { opacity: 0.3 }, at);
      tl.set(els, { opacity: 1 }, at + 0.075);
      tl.set(els, { opacity: 0.3 }, at + 0.15);
      tl.set(els, { opacity: 1 }, at + 0.225);
    }
    blink([T12.a.inner, T12.b.inner], 3.0);
    blink([T22.a.inner, T22.b.inner], 3.5);

    // fechamento das caixas (4,5 / 5,0) — só o retângulo escala; o texto é RECORTADO por ele (clip-path no onFrame).
    // O achatamento NASCE no clique (power3.out, 0,18 s) e a linha recolhe logo em seguida (0,12 s).
    function closeBox(C, X, LB, t1, t2, ILL, at) {
      tl.to(C.st, { beam: 0, duration: 0.25, ease: 'power1.in' }, at - 0.25);
      tl.to(C.g, { scaleY: 0.01, duration: 0.18, ease: 'power3.out' }, at);
      tl.to(C.st, { sa: 0.95, duration: 0.18, ease: 'power3.out' }, at);
      tl.to(C.g, { scaleX: 0, duration: 0.12, ease: 'mecca.in' }, at + 0.18);
      // 'some.' evapora para fora da caixa (a máscara da linha é liberada para o blur/subida não serem cortados)
      gsap.set(t2.chars, { filter: 'blur(0px)' });
      tl.set(t2.b.outer, { overflow: 'visible' }, at);
      tl.to(t2.chars, { y: -24, filter: 'blur(6px)', autoAlpha: 0, duration: 0.3, ease: 'power2.out', stagger: 0.03 }, at);
      // o resto sai por máscara
      tl.to(t1.inner, { yPercent: Y_OUT, duration: 0.3, ease: 'mecca.in' }, at);
      tl.to(t2.a.inner, { yPercent: Y_OUT, duration: 0.3, ease: 'mecca.in' }, at + 0.04);
      // label se apaga de trás para frente
      tl.to(LB.chars.slice().reverse(), { autoAlpha: 0, duration: 0.001, stagger: 0.012 }, at);
      // a ilustração fica sozinha e sobe 16 px
      tl.to(ILL.outer, { y: -16, duration: 0.6, ease: 'mecca.inOut' }, at);
    }
    closeBox(C1, X1, LB1, T11, T12, POST, 4.5);
    closeBox(C2, X2, LB2, T21, T22, SLIDE, 5.0);

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
    tl.fromTo([L1.inner, L2.inner], { yPercent: Y_IN }, { yPercent: 0, duration: 0.35, ease: 'expo.out', stagger: 0.1 }, 6.0);
    h.shake(tl, root, 6.0, { amp: 6, n: 8, dur: 0.4, seed: 603 });
    tl.fromTo(w2, { scale: 1 }, { scale: 1.03, duration: 3.5, ease: 'none' }, 6.0);
    // 9,5–9,85 — 'somem' some letra por letra; 9,6–9,9 o resto sai
    gsap.set(somem, { transformOrigin: '50% 62%' });
    tl.to(somem, { scaleY: 0, duration: 0.15, ease: 'mecca.in', stagger: 0.07 }, 9.5);
    // (y em mecca.in; a opacidade em power1.in e 0,28 s: o último quadro visível, 9,867, fica abaixo de 10 %, sem pop)
    const rest2 = [L1.inner.querySelector('.r'), L2.inner.querySelector('.r')];
    tl.to(rest2, { y: -10, duration: 0.3, ease: 'mecca.in' }, 9.6);
    tl.to(rest2, { autoAlpha: 0, duration: 0.28, ease: 'power1.in' }, 9.6);

    // eyebrow sai junto com T2 (9,5–9,8): apaga de trás para frente e o traço recolhe
    tl.fromTo(ebLbl, { clipPath: 'inset(-12px 0px -12px -12px)' }, { clipPath: `inset(-12px ${ebW.toFixed(2)}px -12px -12px)`, duration: 0.02 * ebN, ease: `steps(${ebN})`, immediateRender: false }, 9.5);
    gsap.set(ebDash, { transformOrigin: '0% 50%' });
    tl.to(ebDash, { scaleX: 0, duration: 0.14, ease: 'mecca.in' }, 9.66);

    // 9,0–9,9 — a energia cai
    tl.to(bg, { dim: 0.5, vignette: 0.75, glowA: 0.6, glowB: 0.6, particles: 0.5, duration: 0.9, ease: 'power2.inOut' }, 9.0);

    // ================================================================== PONTO (função pura do tempo)
    const E_FLIP = gsap.parseEase('mecca.inOut');
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
    // início do trecho de movimento que contém t (as amostras do rastro nunca voltam antes dele)
    const segStart = (t) => (t < 1.0 ? 0 : t < 5.5 ? 1.0 : 5.5);
    // fita afunilada (polígono contínuo) ao longo das amostras: sem discos soltos, sem "contas"
    function ribbon(c, pts, ws, fill) {
      const m = pts.length, Lp = [], Rp = [];
      for (let i = 0; i < m; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(m - 1, i + 1)];
        let dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d < 1e-6) { dx = 1; dy = 0; } else { dx /= d; dy /= d; }
        Lp.push([pts[i].x - dy * ws[i], pts[i].y + dx * ws[i]]);
        Rp.push([pts[i].x + dy * ws[i], pts[i].y - dx * ws[i]]);
      }
      c.beginPath();
      c.moveTo(Lp[0][0], Lp[0][1]);
      for (let i = 1; i < m; i++) c.lineTo(Lp[i][0], Lp[i][1]);
      for (let i = m - 1; i >= 0; i--) c.lineTo(Rp[i][0], Rp[i][1]);
      c.closePath();
      c.fillStyle = fill; c.fill();
    }
    function drawTrail(c, t, p, amount) {
      const WIN = 8 / 60, N = 48;
      const t0 = Math.max(t - WIN, segStart(t));
      if (t - t0 < 1 / 240) return;
      // enquanto o Ponto é glifo de 'caixas.' (FLIP), o rastro é só um fio discreto (raio ≤ 3 px)
      const glyph = t < 1.5;
      const pts = [], ws = [];
      for (let j = 0; j <= N; j++) {
        const tt = t0 + ((t - t0) * j) / N;
        const q = j === N ? p : pontoPos(tt);
        const u = 1 - (t - tt) / WIN;                // 0 = ponta da cauda (8/60 s atrás), 1 = núcleo
        pts.push(q);
        ws.push(Math.min(q.r * 0.8, glyph ? 3 : 99) * Math.pow(clamp(u), 0.85));
      }
      const tail = pts[0], uT = clamp(1 - (t - t0) / WIN);
      if (Math.hypot(p.x - tail.x, p.y - tail.y) < 2) return;
      const k = amount * (glyph ? 0.55 : 1);
      const mk = (a0, a1, c0, c1) => {
        const g = c.createLinearGradient(tail.x, tail.y, p.x, p.y);
        g.addColorStop(0, hexA(mixHex(c0, c1, uT), a0 * uT * k));
        g.addColorStop(1, hexA(c1, a1 * k));
        return g;
      };
      // halo largo e suave + núcleo magenta → violeta (a cor esfria para a cauda)
      ribbon(c, pts, ws.map(w => w * 2.2), mk(0.14, 0.2, P.violet, P.lavender));
      ribbon(c, pts, ws, mk(0.5, 0.75, P.violet, P.magenta));
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
      const q = pontoPos(Math.max(segStart(t), t - dt));
      const speed = Math.hypot(p.x - q.x, p.y - q.y) / Math.max(1e-6, t - Math.max(segStart(t), t - dt));
      const trail = h.smooth(600, 1000, speed);
      if (trail > 0) drawTrail(c, t, p, trail);
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
    // texto do card recortado pelo retângulo que colapsa (mesma escala/origem do C.g: y 550, x no centro do card)
    function applyClip(C, X) {
      const sy = gsap.getProperty(C.g, 'scaleY'), sx = gsap.getProperty(C.g, 'scaleX');
      if (sy > 0.9999 && sx > 0.9999) { X.CW.style.clipPath = 'none'; return; }
      const top = 550 - 300 * sy, bot = 1080 - (550 + 300 * sy);
      const l = X.cxm - 377 * sx, r = 1920 - (X.cxm + 377 * sx);
      X.CW.style.clipPath = `inset(${top.toFixed(2)}px ${r.toFixed(2)}px ${bot.toFixed(2)}px ${l.toFixed(2)}px)`;
    }
    // cursor da digitação: logo depois do último char VISÍVEL (lido do estado já renderizado pela timeline)
    function applyCaret(LB) {
      let k = 0;
      for (const ch of LB.chars) if (ch.style.visibility !== 'hidden' && parseFloat(ch.style.opacity || '1') > 0.5) k++; else break;
      LB.caret.style.transform = `translateX(${LB.stops[k].toFixed(2)}px)`;
    }
    onFrame((lt) => {
      applyCard(C1, lt, 1.0);
      applyCard(C2, lt, 1.5);
      applyClip(C1, X1);
      applyClip(C2, X2);
      applyCaret(LB1);
      applyCaret(LB2);
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

    // DETERMINISMO (2): transforms sempre 2D nos alvos HTML desta cena. Com force3D 'auto' o GSAP usa translate3d
    // no meio de um tween; o Chrome promove o elemento a camada composta e a rasterização do texto num quadro
    // seguinte passa a depender de qual quadro foi buscado antes (diferenças sub-pixel na ordem das buscas).
    const htmlTargets = new Set(tl.getChildren(true, true, false).flatMap(t => t.targets()).filter(el => el instanceof HTMLElement));
    gsap.set([...htmlTargets], { force3D: false });

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
})();
