(() => {
/*
 * S06 (VERTICAL 9:16, 1080×1920) — O plano de voo: quatro tempos (global 42–54 s, D = 12 s, tail 0)
 *
 * Mesma coreografia, tempos, easings e cues da horizontal (src/scenes/s06-plano-de-voo.js).
 * ADAPTAÇÃO (VERTICAL_SPEC §2 S06): a órbita herdada da S05 chega VERTICAL (centro (250,1110),
 * rx 120, ry 360) e, em 2,5–3,0, se LEVANTA e vira a linha do tempo vertical x 250, y 580→1440.
 * O Ponto é a sonda que desce pelos 4 tempos (nós em y 580 / 820 / 1060 / 1300): números à
 * esquerda da linha (saem de trás dela para a esquerda), nomes e descrições à direita (x 290).
 * No fim o Ponto gira sozinho num círculo (r 22 → 34 no chime de 8,5) apoiado na ponta de baixo
 * da linha (250,1440), e a linha se enrola num círculo (540,1100) r 300, sentido horário, pela
 * metade de cima — que a S07 transforma em engrenagem.
 *
 * Tudo o que é canvas (órbita, linha, nós, Ponto, riders) é função analítica de lt;
 * o texto é DOM animado na timeline local. Um "push" de câmera lento (1 → 1,006 em 0–8,0,
 * → ≈1,024 em 8,0–11,4, → 1 no fim) com origem na margem esquerda (90,960) é aplicado
 * igualmente ao grupo da linha do tempo (DOM, CSS scale) e aos canvases (setTransform);
 * o eyebrow fica fora do push (preso em (90,270)).
 */
MECCA.scene({
  id: 's06-plano-de-voo',
  build({ root, tl, D, h, P, bg, onFrame, cue, W, H }) {
    const SID = 's06-plano-de-voo';
    const END = D - 1 / 30;               // último quadro renderizado da cena
    const { clamp, lerp, smooth, hexA } = h;
    const TAU = Math.PI * 2;
    const EIO = gsap.parseEase('mecca.inOut');
    const EOUT = gsap.parseEase('mecca.out');
    const EP2IN = gsap.parseEase('power2.in');
    const EBACK = gsap.parseEase('mecca.back');
    const EP3 = gsap.parseEase('power3.inOut');
    const ESIO = gsap.parseEase('sine.inOut');
    const seg = (t, a, b, e) => { const k = clamp((t - a) / (b - a)); return e ? e(k) : k; };

    // ------------------------------------------------------------------ constantes de layout (spec vertical)
    const MX = 90;                                   // margem esquerda de texto
    const LINE_X = 250, LY0 = 580, LY1 = 1440, LLEN = LY1 - LY0;   // linha do tempo vertical
    const NY = [580, 820, 1060, 1300];               // nós (y_k)
    const TT = [3.0, 4.5, 6.0, 7.5];
    const NAMES = ['Diagnóstico', 'Engenharia', 'Operação', 'Escala'];
    // mesmo texto da horizontal; quebras obrigatórias da spec (<br>, nowrap)
    const DESCS = [
      'Abrimos a máquina e achamos qual<br>engrenagem travou o crescimento.',
      'Montamos o que falta: processo,<br>time, ferramenta e número.',
      'Os mecca assumem as rotinas<br>e operam por dentro.',
      'Tudo engrenado e medido,<br>o crescimento vira previsível.',
    ];
    const TX = 290;                                   // coluna de nomes/descrições
    const NAME_SZ = 72, NAME_DY = 26;                 // nome: SG 700 72, bl y_k + 26
    const DESC_SZ = 40, DESC_DY = 92;                 // descrição: Inter 500 40, 1ª bl y_k + 92 (passo 52)
    const NUM_SZ = 110, NUM_DY = 39, NUM_R = 222;     // número: Bricolage 800 110, direita em x 222, bl y_k + 39
    const MASK_L = 70, MASK_R = 242, MASK_HH = 75;    // máscara dos números: x 70–242, y_k ± 75
    const NUM_SHIFT = 170;                            // número sai de trás da linha: x +170 → 0
    const SEP_DY = -60, SEP_X1 = 990;                 // separador hairline em y_k − 60, x 290→990
    const EB_Y = 270;
    const T_SZ = 150, T_BL = [470, 620];              // "Quatro" / "tempos" antes do FLIP
    const HDR_SZ = 72, HDR_BL = 380;                  // header depois do FLIP
    const SUB_SZ = 56, SUB_BL = 710, SUB_SZ2 = 40, SUB_BL2 = 436;
    const CAM_O = { x: MX, y: 960 };                  // origem do push: margem esquerda fixa (x 90)

    // ------------------------------------------------------------------ CSS local
    h.el('style', {
      html: `
[data-scene="${SID}"] .s06-layer { position:absolute; left:0; top:0; width:${W}px; height:${H}px; }
[data-scene="${SID}"] .s06-mask { position:absolute; overflow:hidden; }
[data-scene="${SID}"] .s06-num { background: linear-gradient(90deg, #C026D3, #7C3AED); -webkit-background-clip: text; background-clip: text; color: transparent; padding-right: 0.06em; }
[data-scene="${SID}"] svg.s06-svg { position:absolute; left:0; top:0; width:${W}px; height:${H}px; overflow:visible; pointer-events:none; }
[data-scene="${SID}"] .s06-scan { position:absolute; width:2.5px; height:90px; border-radius:2px; background:#A78BFA; box-shadow: 0 0 12px rgba(167,139,250,0.95), 0 0 2px #FBF8FF; }
[data-scene="${SID}"] .s06-caret { position:absolute; width:13px; height:24px; background:#A78BFA; }
[data-scene="${SID}"] .s06-sub em { display:inline-block; }
`,
    }, root);

    // ------------------------------------------------------------------ camadas
    const back = h.canvas(root);                         // separadores, órbita/linha, nós, riders
    const wrap = h.el('div', { cls: 's06-layer' }, root); // todo o texto (sofre o push de câmera)
    const front = h.canvas(root);                         // Ponto + rastro
    const layer = (parent) => h.el('div', { cls: 's06-layer' }, parent);

    // posiciona um bloco de texto pela linha de base (mede o deslocamento real da fonte)
    function baseOff(e) {
      const m = document.createElement('span');
      m.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;';
      e.insertBefore(m, e.firstChild);
      const off = h.rect(m).y - h.rect(e).y;
      m.remove();
      return off;
    }
    function placeBase(e, baseline) {
      e.style.top = '0px';
      const off = baseOff(e);
      e.style.top = (baseline - off) + 'px';
      return off;
    }

    // ------------------------------------------------------------------ header
    // eyebrow FORA do wrapper do push (fica preso na margem, em (90,270)); abaixo do canvas do Ponto
    const ebWrap = h.el('div', { cls: 's06-layer' }, root);
    root.insertBefore(ebWrap, front.canvas);
    const eb = h.eyebrow('O PLANO DE VOO', { x: MX, y: EB_Y, anchor: 'cl', size: 26, parent: ebWrap });
    const ebDash = eb.querySelector('.dash');
    const ebLbl = eb.querySelector('.lbl');

    // "Quatro" / "tempos": duas palavras empilhadas (150 px) que fazem FLIP para o header de 72 px
    const titleWrap = layer(wrap);
    const wQ = h.text('Quatro', { x: MX, y: 0, size: T_SZ, nowrap: true, lh: 1.2, parent: titleWrap });
    const wQOff = placeBase(wQ, T_BL[0]);
    const wT = h.text('tempos', { x: MX, y: 0, size: T_SZ, nowrap: true, lh: 1.2, parent: titleWrap });
    const wTOff = placeBase(wT, T_BL[1]);
    // x de "tempos" no header "Quatro tempos" de 72 px (medido; spec ≈ 327)
    const probe = h.text('Quatro <span>tempos</span>', { x: MX, y: 0, size: HDR_SZ, nowrap: true, parent: titleWrap });
    const TEMPOS_X = h.rect(probe.querySelector('span')).x;
    probe.remove();

    const subWrap = layer(wrap);
    const sub = h.text('até a máquina <em>girar sozinha</em>.', {
      x: MX, y: 0, size: SUB_SZ, weight: 500, color: P.lilac, nowrap: true, lh: 1.25, ls: '-0.02em', cls: 't-display s06-sub', parent: subWrap,
    });
    const subOff = placeBase(sub, SUB_BL);

    // ------------------------------------------------------------------ os 4 tempos (linhas)
    const cols = NY.map((y, i) => {
      const c = { i, y, T: TT[i] };
      // número: alinhado à direita em x 222, dentro da máscara x 70–242 (sai de trás da linha)
      c.mask = h.el('div', { cls: 's06-mask', style: { left: MASK_L + 'px', top: (y - MASK_HH) + 'px', width: (MASK_R - MASK_L) + 'px', height: (2 * MASK_HH) + 'px' } }, wrap);
      c.num = h.text('0' + (i + 1), { x: 0, y: 0, size: NUM_SZ, cls: 't-bricolage s06-num', nowrap: true, lh: 1, parent: c.mask });
      placeBase(c.num, NUM_DY + MASK_HH);
      const nw = h.rect(c.num).w - 0.06 * NUM_SZ;       // largura sem o padding do gradiente
      c.num.style.left = (NUM_R - MASK_L - nw) + 'px';
      c.numS = (y - LY0) * 63 / LLEN;                    // índice (na polyline) da altura do número

      c.nameBL = y + NAME_DY;
      c.nameWrap = layer(wrap);
      c.name = h.text(NAMES[i], { x: TX, y: 0, size: NAME_SZ, nowrap: true, lh: 1.25, parent: c.nameWrap });
      placeBase(c.name, c.nameBL);
      c.nr = h.rect(c.name);
      c.svg = h.svg('svg', { class: 's06-svg', viewBox: `0 0 ${W} ${H}`, width: W, height: H }, c.nameWrap);

      c.descWrap = layer(wrap);
      c.desc = h.text(DESCS[i], { x: TX, y: 0, size: DESC_SZ, cls: 't-body', weight: 500, color: P.lilac, nowrap: true, lh: 1.3, parent: c.descWrap });
      placeBase(c.desc, y + DESC_DY);
      return c;
    });

    // ------------------------------------------------------------------ eyebrow: digitação + cursor
    const ebSp = SplitText.create(ebLbl, { type: 'chars', charsClass: 'char' });
    const ebChars = ebSp.chars;
    const ebStr = 'O PLANO DE VOO';
    const typeT = [];
    { let k = 0; for (let j = 0; j < ebStr.length; j++) if (ebStr[j] !== ' ') typeT[k++] = 0.1 + 0.025 * j; }
    const caretX = ebChars.map(ch => h.rect(ch).right);
    const caret0 = h.rect(ebChars[0]).x;
    const caret = h.el('div', { cls: 's06-caret', style: { left: caret0 + 'px', top: (EB_Y - 12) + 'px' } }, ebWrap);
    gsap.set(ebDash, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(ebChars, { opacity: 0 });
    gsap.set(caret, { opacity: 0, x: 0 });
    tl.to(ebDash, { scaleX: 1, duration: 0.3, ease: 'mecca.out' }, 0);
    tl.set(caret, { opacity: 1, immediateRender: false }, 0.06);
    ebChars.forEach((ch, k) => {
      tl.set(ch, { opacity: 1, immediateRender: false }, typeT[k]);
      tl.set(caret, { x: caretX[k] - caret0 + 2, immediateRender: false }, typeT[k]);
    });
    [[0.7, 0], [0.95, 1], [1.2, 0], [1.45, 1], [1.7, 0]].forEach(([t, o]) => tl.set(caret, { opacity: o, immediateRender: false }, t));

    // ------------------------------------------------------------------ título + subtítulo (entrada e FLIP)
    const qSp = h.split(wQ, { type: 'lines,chars', mask: 'lines' });
    const tSp = h.split(wT, { type: 'lines,chars', mask: 'lines' });
    tl.fromTo([...qSp.chars, ...tSp.chars], { yPercent: 110 }, { yPercent: 0, duration: 0.5, stagger: 0.02, ease: 'mecca.out' }, 0.5);
    const sSp = h.split(sub, { type: 'lines,words', mask: 'lines' });
    tl.fromTo(sSp.words, { yPercent: 110 }, { yPercent: 0, duration: 0.6, stagger: 0.04, ease: 'mecca.out' }, 1.0);

    // FLIP (2,5–3,0): cada palavra vai para o seu lugar no header "Quatro tempos" (72 px, bl 380).
    // Como na horizontal, escala e subida das duas palavras (e do subtítulo) andam juntas:
    // 2,5–3,0, 0,5 s, mecca.inOut — as linhas de base pousam juntas em 3,0.
    // ADAPTAÇÃO de trajetória (só o x de "tempos"): em linha reta ele atravessaria "Quatro" em
    // ≈ 2,75–2,95. O x é animado DENTRO da palavra escalada (na máscara da linha), então o
    // deslocamento na tela é s(t)·x: com power2.out em 0,4 s "tempos" primeiro sai para a direita
    // (ainda embaixo) e, quando sobe, já está na formação do header na escala corrente — as duas
    // palavras encolhem como um bloco até a origem (90, bl 380). Folga mínima medida entre os
    // glifos ≈ 14 px (final ≈ 16), borda direita de "tempos" ≤ 957.
    gsap.set(wQ, { transformOrigin: `0px ${wQOff}px` });
    gsap.set(wT, { transformOrigin: `0px ${wTOff}px` });
    gsap.set(sub, { transformOrigin: `0px ${subOff}px` });
    const tLine = tSp.lines[0].parentNode;            // máscara da linha de "tempos" (filha de wT)
    tl.to(wQ, { scale: HDR_SZ / T_SZ, y: HDR_BL - T_BL[0], duration: 0.5, ease: 'mecca.inOut' }, 2.5);
    tl.to(wT, { scale: HDR_SZ / T_SZ, y: HDR_BL - T_BL[1], duration: 0.5, ease: 'mecca.inOut' }, 2.5);
    tl.fromTo(tLine, { x: 0 }, { x: (TEMPOS_X - MX) * T_SZ / HDR_SZ, duration: 0.4, ease: 'power2.out' }, 2.5);
    tl.to(sub, { scale: SUB_SZ2 / SUB_SZ, y: SUB_BL2 - SUB_BL, duration: 0.5, ease: 'mecca.inOut' }, 2.5);

    // ------------------------------------------------------------------ os 4 tempos
    cols.forEach((c) => {
      const T = c.T;
      // número sai de trás da linha para a esquerda
      tl.fromTo(c.num, { x: NUM_SHIFT }, { x: 0, duration: 0.45, ease: 'expo.out' }, T);
      // descrição (linhas y 16→0 + fade)
      c.dSp = h.split(c.desc, { type: 'lines' });
      // a descrição 04 tem a janela mais curta (8,0–11,5): entrada mais rápida para ganhar tempo de leitura
      const last = c.i === 3;
      tl.fromTo(c.dSp.lines, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: last ? 0.3 : 0.4, stagger: last ? 0.04 : 0.06, ease: 'mecca.out' }, T + 0.5);
    });

    // 01 — Diagnóstico: linha de varredura revela o nome
    {
      const c = cols[0], w = c.nr.w;
      const clipA = 'inset(-30% 106% -45% -6%)', clipB = 'inset(-30% -6% -45% -6%)';
      const scan = h.el('div', { cls: 's06-scan', style: { left: (c.nr.x - 0.06 * w - 1) + 'px', top: (c.nameBL - 0.25 * NAME_SZ - 45) + 'px' } }, c.nameWrap);
      gsap.set(scan, { opacity: 0, x: 0 });
      tl.fromTo(c.name, { clipPath: clipA }, { clipPath: clipB, duration: 0.35, ease: 'power2.inOut' }, c.T);
      tl.fromTo(scan, { x: 0 }, { x: 1.12 * w, duration: 0.35, ease: 'power2.inOut', immediateRender: false }, c.T);
      tl.fromTo(scan, { opacity: 0 }, { opacity: 1, duration: 0.06, ease: 'none', immediateRender: false }, c.T);
      tl.to(scan, { opacity: 0, duration: 0.2, ease: 'power1.in' }, c.T + 0.35);   // fade: nunca mecca.in em opacidade
    }

    // 02 — Engenharia: chars caem + marcas de corte em L (16 px, folga 12)
    {
      const c = cols[1];
      const sp = h.split(c.name, { type: 'chars' });
      tl.fromTo(sp.chars, { y: -38 }, { y: 0, duration: 0.5, stagger: 0.025, ease: 'mecca.back' }, c.T);
      tl.fromTo(sp.chars, { opacity: 0 }, { opacity: 1, duration: 0.18, stagger: 0.025, ease: 'none' }, c.T);
      const L = 16, G = 12, bl = c.nameBL;
      const x0 = c.nr.x - G, x1 = c.nr.right + G, y0 = bl - 0.70 * NAME_SZ - G, y1 = bl + 0.21 * NAME_SZ + 9;
      const corners = [
        `M${x0} ${y0 + L} L${x0} ${y0} L${x0 + L} ${y0}`,
        `M${x1 - L} ${y0} L${x1} ${y0} L${x1} ${y0 + L}`,
        `M${x1} ${y1 - L} L${x1} ${y1} L${x1 - L} ${y1}`,
        `M${x0 + L} ${y1} L${x0} ${y1} L${x0} ${y1 - L}`,
      ].map(d => h.svg('path', { d, fill: 'none', stroke: P.lavender, 'stroke-width': 2, 'stroke-linecap': 'square', opacity: 0.85 }, c.svg));
      tl.fromTo(corners, { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 0.35, stagger: 0.05, ease: 'mecca.out' }, c.T + 0.12);
      // um traço de comprimento zero com ponta quadrada ainda pinta um pontinho: cada canto só fica
      // visível quando começa a se desenhar
      gsap.set(corners, { autoAlpha: 0 });
      corners.forEach((p, j) => tl.set(p, { autoAlpha: 0.85, immediateRender: false }, c.T + 0.12 + 0.05 * j));
    }

    // 03 — Operação: chars sobem + mini engrenagem (r 18, 8 dentes) 28 px depois do nome, com 3 pontinhos
    const gear3 = {};
    {
      const c = cols[2];
      const sp = h.split(c.name, { type: 'lines,chars', mask: 'lines' });
      tl.fromTo(sp.chars, { yPercent: 110 }, { yPercent: 0, duration: 0.5, stagger: 0.025, ease: 'mecca.out' }, c.T);
      const GR = 18;
      const gx = c.nr.right + 28 + GR, gy = c.y;
      gear3.x = gx; gear3.y = gy;
      const dotCols = [P.lilac, P.lavender, P.magenta];
      gear3.backDots = dotCols.map(col => h.svg('circle', { cx: gx, cy: gy, r: 3, fill: col, opacity: 0 }, c.svg));
      gear3.pop = h.svg('g', { transform: `translate(${gx} ${gy}) scale(0)`, opacity: 0 }, c.svg);
      h.gear(gear3.pop, { x: 0, y: 0, r: GR, teeth: 8, depth: 0.3, hole: 0.34, tip: 0.36, base: 0.62, fill: 'rgba(36,16,56,0.9)', stroke: P.lavender, strokeWidth: 2 });
      gear3.frontDots = dotCols.map(col => h.svg('circle', { cx: gx, cy: gy, r: 3, fill: col, opacity: 0 }, c.svg));
    }

    // 04 — Escala: nome cresce da base + escadinha de 4 degraus de 16 × 10, 24 px depois de "Escala"
    {
      const c = cols[3];
      const sp = h.split(c.name, { type: 'chars' });
      gsap.set(sp.chars, { transformOrigin: '50% 100%' });
      tl.fromTo(sp.chars, { scaleY: 0 }, { scaleY: 1, duration: 0.45, stagger: 0.04, ease: 'mecca.back' }, c.T);
      const sx = c.nr.right + 24, st = 10, sw = 16, bl = c.nameBL;
      const d = `M${sx} ${bl} h${sw} v${-st} h${sw} v${-st} h${sw} v${-st} h${sw} v${-st} h${sw}`;
      const stair = h.svg('path', { d, fill: 'none', stroke: P.lavender, 'stroke-width': 2, 'stroke-linecap': 'square', 'stroke-linejoin': 'miter' }, c.svg);
      const tx = sx + 5 * sw, ty = bl - 4 * st;
      const tip = h.svg('circle', { cx: tx, cy: ty, r: 4.5, fill: P.magenta }, c.svg);
      tl.fromTo(stair, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.45, ease: 'mecca.out' }, c.T + 0.28);
      tl.fromTo(tip, { scale: 0 }, { scale: 1, svgOrigin: `${tx} ${ty}`, duration: 0.3, ease: 'mecca.back' }, c.T + 0.62);
    }

    // 'girar sozinha' acende quando o Ponto passa a girar sozinho (8,5)
    const subEm = sub.querySelector('em');
    const glowOff = 'drop-shadow(0px 0px 0px rgba(192,38,211,0))', glowOn = 'drop-shadow(0px 0px 12px rgba(192,38,211,0.95))';
    gsap.set(subEm, { filter: glowOff });
    tl.fromTo(subEm, { filter: glowOff }, { filter: glowOn, duration: 0.25, ease: 'mecca.out', immediateRender: false }, 8.5);
    tl.fromTo(subEm, { filter: glowOn }, { filter: glowOff, duration: 0.9, ease: 'sine.inOut', immediateRender: false }, 8.75);

    // nomes anteriores vão para α .7
    for (let i = 0; i < 3; i++) tl.to(cols[i].name, { opacity: 0.7, duration: 0.3, ease: 'sine.inOut' }, TT[i + 1]);

    // ------------------------------------------------------------------ saída (11,40–11,72)
    // A linha começa a enrolar em 11,4 (power3.inOut).
    // 1) Os números entram na linha (para a DIREITA) ENQUANTO ela ainda está reta: x → +170 + fade,
    //    0,15 s, power2.in, stagger .02 a partir do 04 (tudo fora em 11,61); a borda da máscara
    //    acompanha a linha (updateNumMasks).
    // 2) O resto do texto apaga rápido (0,2 s, stagger .02) na ordem da horizontal (03, 02, 01),
    //    depois 'Escala', header e eyebrow; a descrição 04 (janela de leitura mais curta) sai por último.
    const X0 = 11.4;
    [3, 2, 1, 0].forEach((ci, k) => {
      const c = cols[ci];
      tl.to(c.num, { x: NUM_SHIFT, duration: 0.15, ease: 'power2.in', immediateRender: false }, X0 + 0.02 * k);
      tl.to(c.num, { opacity: 0, duration: 0.15, ease: 'none' }, X0 + 0.02 * k);
    });
    const exitGroups = [
      [cols[2].nameWrap, cols[2].descWrap],
      [cols[1].nameWrap, cols[1].descWrap],
      [cols[0].nameWrap, cols[0].descWrap],
      [cols[3].nameWrap],
      [titleWrap, subWrap],
      [ebWrap],
      [cols[3].descWrap],
    ];
    exitGroups.forEach((g, i) => {
      tl.to(g, { y: -12, duration: 0.2, ease: 'mecca.in' }, X0 + 0.02 * i);
      tl.to(g, { opacity: 0, duration: 0.2, ease: 'power1.out' }, X0 + 0.02 * i);
    });

    // ------------------------------------------------------------------ push de câmera
    // Origem na margem esquerda (90,960): a coluna x 90 não sai do lugar. Mesmo perfil da horizontal (uma
    // curva só, sem quinas de velocidade): 0–8,0 quase imperceptível (1 → 1,006, linear); 8,0–11,4 o push
    // do groove, acelerando suavemente a partir da mesma velocidade; 11,4–fim volta a 1 (mecca.inOut)
    // escondido no enrolar da linha, para o último quadro casar com a S07.
    // ADAPTAÇÃO: o ganho do groove é +0,02 como na horizontal, limitado para que a linha de texto mais
    // longa (descrição 01, até x ≈ 969) fique ≤ 900 px a partir da margem com o push (spec §1.2, x ≤ 990).
    const TXT_R = Math.max(...cols.map(c => Math.max(h.rect(c.desc).right, c.nr.right)));
    const PUSH_T0 = 8.0, PUSH_T1 = 11.4, PUSH_A = 0.006;
    const PUSH_B = Math.min(0.02, 900 / (TXT_R - MX) - 1 - PUSH_A), PUSH_PEAK = 1 + PUSH_A + PUSH_B;
    const pushK = (PUSH_A / PUSH_T0) * (PUSH_T1 - PUSH_T0) / PUSH_B;          // inclinação inicial normalizada do 2º trecho
    function pushScale(t) {
      if (t <= PUSH_T0) return 1 + PUSH_A * t / PUSH_T0;
      const x = clamp((t - PUSH_T0) / (PUSH_T1 - PUSH_T0));
      return 1 + PUSH_A + PUSH_B * (pushK * x + (1 - pushK) * x * x);
    }
    gsap.set(wrap, { transformOrigin: `${CAM_O.x}px ${CAM_O.y}px` });
    tl.fromTo(wrap, { scale: 1 }, { scale: PUSH_PEAK, duration: PUSH_T1, ease: (q) => (pushScale(q * PUSH_T1) - 1) / (PUSH_PEAK - 1) }, 0);
    tl.fromTo(wrap, { scale: PUSH_PEAK }, { scale: 1, duration: END - PUSH_T1, ease: 'mecca.inOut', immediateRender: false }, PUSH_T1);

    // ------------------------------------------------------------------ fundo
    const BG_IN = { glowA: 1, glowB: 1, glowC: 1, grid: 0, particles: 1, driftX: 0, driftY: 0, speed: 1, warp: 0, vignette: 0.55, dim: 0, hue: 0, grain: 1 };
    tl.set(bg, Object.assign({}, BG_IN), 0);
    // pulso da malha no impacto de abertura (0 → 1 → .15), depois a entrada combinada 0,5–1,5 até .35
    tl.to(bg, { grid: 1, duration: 0.1, ease: 'power2.out' }, 0);
    tl.to(bg, { grid: 0.15, duration: 0.4, ease: 'sine.out' }, 0.1);
    tl.to(bg, { grid: 0.35, duration: 1.0, ease: 'sine.inOut' }, 0.5);
    tl.to(bg, { grid: 0.2, duration: END - 11.5, ease: 'mecca.inOut' }, 11.5);

    // ------------------------------------------------------------------ som (idêntico à horizontal)
    cue(0, 'impact', 'abre o plano de voo', 0.6);
    cue(2.75, 'whoosh', 'órbita deita', 0.4);
    cue(3, 'click', 'tempo 01', 0.8);
    cue(3, 'impact', 'tempo 01', 0.4);
    cue(4.5, 'click', 'tempo 02', 0.8);
    cue(6, 'click', 'tempo 03', 0.8);
    cue(6.5, 'chime', 'mini engrenagem', 0.3);
    cue(7.5, 'click', 'tempo 04', 0.8);
    cue(7.5, 'impact', 'tempo 04', 0.5);
    cue(8.5, 'chime', 'gira sozinha', 0.6);
    cue(9.5, 'tick', 'pulsos', 0.35);
    cue(10, 'tick', 'pulsos', 0.35);
    cue(11.75, 'whoosh', 'linha → círculo', 0.6);

    // ================================================================== geometria analítica (função de lt)
    const S = u => u * u * u - u * u * u * u / 2;   // ∫ smoothstep

    // órbita VERTICAL que se levanta (2,5–3,0): rx 120→0, ry 360→430, centro (250,1110)→(250,1010)
    function ellipseAt(t) {
      const k = seg(t, 2.5, 3.0, EIO);
      return { cx: LINE_X, cy: 1110 - 100 * k, rx: 120 * (1 - k), ry: 360 + 70 * k, k };
    }
    // ângulo percorrido pelo Ponto na elipse: já sai a 180°/s em t = 0 (período 2 s, sem rampa — o impacto
    // de abertura cai num quadro em movimento), cruzeiro até 1,5 e freia 1,5–2,5 (ω·(1 − smoothstep)) → 1 volta
    const ORB_C = 1.5, ORB_D = 1.0;
    function orbitAngle(t) {
      const w = Math.PI;
      if (t <= 0) return 0;
      if (t <= ORB_C) return w * t;
      if (t <= ORB_C + ORB_D) { const u = (t - ORB_C) / ORB_D; return w * (ORB_C + ORB_D * (u - S(u))); }
      return TAU;
    }
    const TOP = -Math.PI / 2;   // começa no topo da elipse, sentido horário (ângulo crescente)
    // y do Ponto sobre a linha
    const LEGS = [[4.1, 4.5, 580, 820], [5.6, 6.0, 820, 1060], [7.1, 7.5, 1060, 1300], [8.0, 8.5, 1300, 1440]];
    function lineY(t) {
      let y = LY0;
      for (const [a, b, y0, y1] of LEGS) {
        if (t >= b) { y = y1; continue; }
        if (t > a) y = lerp(y0, y1, EIO((t - a) / (b - a)));
        break;
      }
      return y;
    }
    // Ponto girando sozinho: nasce no círculo r 22 com centro (250,1418) (spec), apoiado na ponta de baixo da
    // linha (250,1440), e no chime de 8,5 abre para r 34 (8,5–9,1, mecca.out), como na horizontal. ≈1 volta/s,
    // sentido horário, rampa de 0,2 s; entra na ponta da linha (8,5) e sai dela para o enrolar (11,4).
    // ADAPTAÇÃO: a descrição 04 começa em x 290, 40 px à direita do eixo. Com o centro no eixo, r 34 levaria
    // o Ponto a ~4 px do "o" de "o crescimento" (com r 22 são ~12 px). Por isso o círculo cresce para o lado
    // livre (esquerda): a borda direita fica em x 272 (a mesma do r 22) e o círculo continua passando pela
    // ponta da linha — centro (250 − (r − 22), 1440 − √(r² − (r − 22)²)): (250,1418) → (238, 1408,2).
    const CR0 = 22, CR1 = 34, C0 = 8.5, RAMP = 0.2;
    const OMEGA = TAU * 3 / (11.4 - C0 - RAMP / 2);
    const circR = t => lerp(CR0, CR1, seg(t, C0, C0 + 0.6, EOUT));
    const circC = t => { const r = circR(t), dx = r - CR0; return { x: LINE_X - dx, y: LY1 - Math.sqrt(r * r - dx * dx) }; };
    const circA0 = t => { const c = circC(t); return Math.atan2(LY1 - c.y, LINE_X - c.x); };   // ângulo da ponta da linha (π/2 com r 22)
    function circAngle(t) {
      const tau = t - C0;
      if (tau <= 0) return 0;
      if (tau <= RAMP) return OMEGA * RAMP * S(tau / RAMP);
      return OMEGA * (tau - RAMP / 2);
    }
    function circPos(t) {
      const a = circA0(t) + circAngle(t), c = circC(t), r = circR(t);
      return { x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) };
    }
    // polyline linha → círculo (i ∈ [0,63]): (250, 580 + i·860/63) → (540 + 300·cos(π + i·2π/63), 1100 + 300·sin(π + i·2π/63))
    // Lerp cartesiano, como na spec. A correção da horizontal (lerp POLAR, contra o laço na ponta direita)
    // não se aplica aqui: com a linha vertical à esquerda do centro (540,1100) e o enrolar horário, este
    // morph não se cruza em nenhum p (conferido a cada .01), e o lerp polar é que dobraria a curva, porque
    // a linha, vista do centro, corre no sentido anti-horário e o círculo de chegada no horário.
    const RC = { x: 540, y: 1100 }, RR = 300;
    const morphP = t => seg(t, 11.4, END, EP3);
    function linePt(s, p) {
      const y0 = LY0 + s * LLEN / 63;
      const a = Math.PI + s * TAU / 63;
      return { x: lerp(LINE_X, RC.x + RR * Math.cos(a), p), y: lerp(y0, RC.y + RR * Math.sin(a), p) };
    }
    function pontoPos(t) {
      if (t < 2.5) {
        const e = ellipseAt(t), th = TOP + orbitAngle(t);
        return { x: e.cx + e.rx * Math.cos(th), y: e.cy + e.ry * Math.sin(th) };
      }
      if (t < 3.0) { const e = ellipseAt(t); return { x: e.cx, y: e.cy - e.ry }; }
      if (t < C0) return { x: LINE_X, y: lineY(t) };
      const c = circPos(t);
      if (t < 11.4) return c;
      const tip = linePt(63, morphP(t));
      const w = smooth(11.4, 11.52, t);
      return { x: lerp(c.x, tip.x, w), y: lerp(c.y, tip.y, w) };
    }
    const flow = t => 22 * Math.max(0, t - 2.5);  // tracejado escorrendo em direção ao Ponto (para cima)

    const hex2rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const MAG = hex2rgb(P.magenta), VIO = hex2rgb(P.violet);
    const mixA = (k, a) => `rgba(${Math.round(lerp(MAG[0], VIO[0], k))},${Math.round(lerp(MAG[1], VIO[1], k))},${Math.round(lerp(MAG[2], VIO[2], k))},${a})`;

    // ================================================================== desenho
    const bx = back.ctx, fx = front.ctx;

    // separadores hairline α .05 em y_k − 60, de x 290 a 990 (substituem as guias verticais da horizontal)
    function drawGuides(c, t) {
      const out = 1 - seg(t, 11.4, 11.7);
      if (out <= 0) return;
      c.save();
      c.lineWidth = 1;
      c.strokeStyle = hexA(P.lavender, 0.05 * out);
      for (let i = 0; i < 4; i++) {
        const g = seg(t, TT[i], TT[i] + 0.6, EOUT);
        if (g <= 0) continue;
        const y = NY[i] + SEP_DY + 0.5;
        c.beginPath(); c.moveTo(TX, y); c.lineTo(lerp(TX, SEP_X1, g), y); c.stroke();
      }
      c.restore();
    }

    function drawTrack(c, t) {
      c.save();
      if (t < 3.0) {
        const e = ellipseAt(t), k = e.k;
        const a = lerp(0.3, 0.35, k);
        const backF = lerp(1 - 0.5 * seg(t, 0.3, 1.0, EIO), 1, k);   // metade de trás (esquerda) α ×.5
        const rx = Math.max(e.rx, 0.01);
        c.lineWidth = 1.5;
        const dashed = k > 0.0005;
        if (dashed) { c.setLineDash([16 - 10 * k, 10 * k]); c.lineDashOffset = flow(t); }
        // metade de trás: do topo, pela esquerda, até a base (vira a linha do tempo)
        c.strokeStyle = hexA(P.lavender, a * backF);
        c.beginPath(); c.ellipse(e.cx, e.cy, rx, e.ry, 0, 1.5 * Math.PI, 0.5 * Math.PI, true); c.stroke();
        // metade da frente: do topo, pela direita, até a base (some ao deitar sobre a de trás)
        if (k < 0.999) {
          if (dashed) c.lineDashOffset = flow(t);
          c.strokeStyle = hexA(P.lavender, a * (1 - k));
          c.beginPath(); c.ellipse(e.cx, e.cy, rx, e.ry, 0, -0.5 * Math.PI, 0.5 * Math.PI, false); c.stroke();
        }
        c.restore();
        return;
      }
      const p = morphP(t);
      const ys = t < C0 ? lineY(t) : LY1;
      const sSolid = (ys - LY0) * 63 / LLEN;
      // à frente do Ponto (abaixo): tracejado lavanda
      if (ys < LY1 - 0.01) {
        c.lineWidth = 1.5;
        c.setLineDash([6, 10]);
        c.lineDashOffset = (ys - LY0) + flow(t);
        c.strokeStyle = hexA(P.lavender, 0.35);
        c.beginPath(); c.moveTo(LINE_X, ys); c.lineTo(LINE_X, LY1); c.stroke();
        c.setLineDash([]);
      }
      // atrás do Ponto (acima): sólido em gradiente 3 px — #C026D3 em cima → #7C3AED embaixo;
      // no morph as pontas do gradiente vão para (240,1100) → (840,1100) (horizontal no último quadro)
      if (sSolid > 0.001) {
        const gr = c.createLinearGradient(lerp(LINE_X, RC.x - RR, p), lerp(LY0, RC.y, p), lerp(LINE_X, RC.x + RR, p), lerp(LY1, RC.y, p));
        gr.addColorStop(0, P.magenta); gr.addColorStop(1, P.violet);
        c.strokeStyle = gr; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath();
        if (p >= 0.99999) c.arc(RC.x, RC.y, RR, 0, TAU);
        else if (p <= 0) { c.moveTo(LINE_X, LY0); c.lineTo(LINE_X, ys); }
        else {
          for (let s = 0; s < sSolid; s += 0.25) { const q = linePt(s, p); if (s === 0) c.moveTo(q.x, q.y); else c.lineTo(q.x, q.y); }
          const q = linePt(sSolid, p); c.lineTo(q.x, q.y);
        }
        c.stroke();
      }
      c.restore();
    }

    // halo que expande (mesmo desenho dos nós): r 10 → rMax, α a0 → 0, com u ∈ [0,1]
    function drawHalo(c, x, y, u, rMax = 48, a0 = 0.6) {
      if (u <= 0 || u >= 1) return;
      const hr = 10 + (rMax - 10) * EOUT(u);
      const ha = a0 * (1 - u);
      const rg = c.createRadialGradient(x, y, 0, x, y, hr);
      rg.addColorStop(0, hexA(P.violet, 0)); rg.addColorStop(0.7, hexA(P.violet, 0.18 * ha)); rg.addColorStop(1, hexA(P.lavender, 0.3 * ha));
      c.fillStyle = rg; c.beginPath(); c.arc(x, y, hr, 0, TAU); c.fill();
      c.strokeStyle = hexA(P.lavender, ha); c.lineWidth = 2;
      c.beginPath(); c.arc(x, y, hr, 0, TAU); c.stroke();
    }

    // Groove 8,5–11,4: acentos só onde há cue. 9,5 e 10,0 (ticks): os 4 nós pulsam juntos (scale 1 → 2 → 1,
    // anel r 10 → 40, α .6 → 0). Entre os dois ticks um brilho corre a linha inteira de cima para baixo
    // (580 → 1440, 9,5–10,0) e chega ao Ponto girando no segundo tick: o plano alimenta a máquina que gira sozinha.
    const PULSES = [9.5, 10.0];
    const SW0 = 9.5, SW1 = 10.0, SW_TAIL = 160, SW_HEAD = 12;   // cauda ∝ comprimento da linha (280 × 860/1536)
    // 0 → 1 (power2.out) de T − 1/30 a T + 0,06 (o quadro do tick já mostra o ataque), 1 → 0 em 0,3 s (sine.inOut)
    const PB0 = 1 / 30, PB1 = 0.06, PB2 = 0.3;
    function pulseBump(t, T) {
      if (t <= T - PB0 || t >= T + PB1 + PB2) return 0;
      if (t < T + PB1) { const u = (t - T + PB0) / (PB0 + PB1); return 1 - (1 - u) * (1 - u); }
      return 1 - ESIO((t - T - PB1) / PB2);
    }
    function drawSweep(c, t) {
      const yh = LY0 + (t - SW0) / (SW1 - SW0) * LLEN;
      if (yh < LY0 || yh - SW_TAIL > LY1) return;
      const y0 = Math.max(LY0, yh - SW_TAIL), y1 = Math.min(LY1, yh + SW_HEAD);
      if (y1 <= y0) return;
      const fade = 1 - seg(yh, LY1 - 40, LY1 + SW_TAIL);   // a cauda entra no Ponto e se apaga
      c.save();
      const g = c.createLinearGradient(0, yh - SW_TAIL, 0, yh + SW_HEAD);
      g.addColorStop(0, 'rgba(251,248,255,0)'); g.addColorStop(0.9, `rgba(251,248,255,${0.95 * fade})`); g.addColorStop(1, 'rgba(251,248,255,0)');
      const g2 = c.createLinearGradient(0, yh - SW_TAIL, 0, yh + SW_HEAD);
      g2.addColorStop(0, hexA(P.lavender, 0)); g2.addColorStop(0.9, hexA(P.lavender, 0.4 * fade)); g2.addColorStop(1, hexA(P.lavender, 0));
      c.lineCap = 'butt';
      c.strokeStyle = g2; c.lineWidth = 12; c.beginPath(); c.moveTo(LINE_X, y0); c.lineTo(LINE_X, y1); c.stroke();
      c.strokeStyle = g; c.lineWidth = 3; c.beginPath(); c.moveTo(LINE_X, y0); c.lineTo(LINE_X, y1); c.stroke();
      c.restore();
    }

    function drawNodes(c, t) {
      const p = morphP(t);
      const out = 1 - seg(t, 11.45, 11.85, EP2IN);   // power2.in: o nó chega a ~1,6 px no último quadro (sem 'pop')
      c.save();
      for (let i = 0; i < 4; i++) {
        const T = TT[i];
        if (t < T) continue;
        const pos = linePt((NY[i] - LY0) * 63 / LLEN, p);
        drawHalo(c, pos.x, pos.y, seg(t, T, T + 0.7));                    // halo de chegada
        let ps = 1;
        for (const PT of PULSES) {                                         // pulsos 9,5 e 10,0
          ps += pulseBump(t, PT);
          const u = seg(t, PT - PB0, PT + 0.5);
          if (u > 0 && u < 1) {
            c.strokeStyle = hexA(P.lavender, 0.6 * (1 - u)); c.lineWidth = 2;
            c.beginPath(); c.arc(pos.x, pos.y, 10 + 30 * EOUT(u), 0, TAU); c.stroke();
          }
        }
        const r = 10 * EBACK(seg(t, T, T + 0.3)) * ps * out;
        if (r <= 0.05) continue;
        if (ps > 1.01) h.glowDot(c, pos.x, pos.y, r, P.lavender, 0.5 * (ps - 1));   // brilho do pulso
        c.fillStyle = P.violet;
        c.beginPath(); c.arc(pos.x, pos.y, r, 0, TAU); c.fill();
        c.strokeStyle = P.lavender; c.lineWidth = 2 * Math.min(1, r / 10);
        c.beginPath(); c.arc(pos.x, pos.y, r, 0, TAU); c.stroke();
      }
      c.restore();
    }

    // riders da órbita (0–2,8), a +120° e +240° do Ponto: entram no impacto de abertura já nos seus lugares,
    // com pop de escala mecca.back (0,0–0,45) e um anel pequeno cada. α nasce em 0 (1º quadro = último da S05).
    function drawRiders(c, t) {
      const a = seg(t, 0, 0.08) * (1 - seg(t, 2.45, 2.8));
      if (a <= 0.001) return;
      const e = ellipseAt(t), th = TOP + orbitAngle(t);
      const pop = EBACK(seg(t, 0, 0.45)), ru = seg(t, 0.02, 0.5);
      [[TAU / 3, P.magenta, 5], [-TAU / 3, P.lavender, 4]].forEach(([off, col, r]) => {
        const ang = th + off;
        const x = e.cx + e.rx * Math.cos(ang), y = e.cy + e.ry * Math.sin(ang);
        const ga = a * (0.75 + 0.25 * Math.cos(ang));      // metade de trás (esquerda) com α ×.5
        if (pop > 0.01) h.glowDot(c, x, y, r * pop, col, ga);
        if (ru > 0 && ru < 1) {
          c.strokeStyle = hexA(col, 0.5 * (1 - ru) * ga); c.lineWidth = 1.5;
          c.beginPath(); c.arc(x, y, r + 22 * EOUT(ru), 0, TAU); c.stroke();
        }
      });
    }

    // órbita pequena do Ponto no fim da linha (r 22 → 34 a partir do chime de 8,5) + esteira do giro
    function drawCircleTrack(c, t) {
      if (t < C0) return;
      const a = 0.32 * seg(t, C0, C0 + 0.3) * (1 - seg(t, 11.3, 11.5));
      if (a <= 0.001) return;
      const ca = circAngle(t), cc = circC(t), cr = circR(t), A0 = circA0(t);
      const ang = Math.min(TAU, ca);
      c.save();
      c.strokeStyle = hexA(P.lavender, a); c.lineWidth = 1.2;
      c.beginPath(); c.arc(cc.x, cc.y, cr, A0, A0 + Math.max(0.001, ang)); c.stroke();
      // esteira do giro: fita de até 250° atrás do Ponto, afinando (7 → 1 px) e apagando (magenta → violeta)
      const span = Math.min(ca, (250 / 360) * TAU);
      const wa = (a / 0.32);
      if (span > 0.01) {
        const N = 40;
        c.lineCap = 'butt';
        for (let pass = 0; pass < 2; pass++) {          // 0: halo largo e fraco · 1: fita
          for (let j = 0; j < N; j++) {
            const f0 = j / N, f1 = (j + 1) / N, fall = Math.pow(1 - f0, 1.4);
            c.strokeStyle = mixA(f0, (pass ? 0.85 : 0.16) * fall * wa);
            c.lineWidth = lerp(7, 1, f0) * (pass ? 1 : 2.6);
            c.beginPath(); c.arc(cc.x, cc.y, cr, A0 + ca - span * f1, A0 + ca - span * f0 + 0.004); c.stroke();
          }
        }
      }
      // 10,0: o brilho que correu a linha chega ao Ponto — anel em volta do giro.
      // ADAPTAÇÃO: a coluna de texto (descrição 04) começa em x 290, a 40 px do eixo; o anel (r 40 → 74)
      // apaga na horizontal a partir de x 262 (α → 0 em x 286), como se passasse por trás da coluna.
      const u = seg(t, SW1, SW1 + 0.45);
      if (u > 0 && u < 1) {
        const ra = 0.55 * (1 - u);
        const rg = c.createLinearGradient(262, 0, 286, 0);
        rg.addColorStop(0, hexA(P.lavender, ra)); rg.addColorStop(1, hexA(P.lavender, 0));
        c.strokeStyle = rg; c.lineWidth = 2;
        c.beginPath(); c.arc(cc.x, cc.y, cr + 6 + 34 * EOUT(u), 0, TAU); c.stroke();
      }
      c.restore();
    }

    // Acentos do Ponto: impacto de abertura (t = 0) e chime 'gira sozinha' (8,5).
    // Abertura: halo r 10 → 48, α .6 → 0 em 0,3 s + anel fino de choque, presos no ponto do impacto
    // (250,750) (topo da elipse, onde o Ponto está no corte de 42,0).
    // O α sobe em 1 quadro (smooth 0 → 1/30) para o quadro t = 0 continuar idêntico ao último da S05.
    const IMP = { x: LINE_X, y: 1110 - 360 };
    function drawImpact(c, t) {
      if (t > 0 && t < 0.6) {
        const k = smooth(0, 1 / 30, t);
        c.save();
        c.globalAlpha = k;
        drawHalo(c, IMP.x, IMP.y, seg(t, 0, 0.3));
        const u = seg(t, 0, 0.55);
        c.strokeStyle = hexA(P.lavender, 0.35 * (1 - u)); c.lineWidth = 1.5;
        c.beginPath(); c.arc(IMP.x, IMP.y, 10 + 86 * EOUT(u), 0, TAU); c.stroke();
        c.restore();
      }
      // ADAPTAÇÃO (chime 8,5): o halo (r 10 → 48, centro (250,1440)) chegaria a x 298 e riscaria a perna
      // esquerda do "o" de "o crescimento" (descrição 04, x ≥ 293). Recebe o mesmo apagamento horizontal do
      // anel de 10,0: α inteiro até x 262, → 0 em x 286, como se passasse por trás da coluna. O apagamento
      // (destination-out, preso ao retângulo do halo) só atinge o halo: é o 1º desenho do canvas da frente
      // neste quadro (o impacto de abertura acaba em 0,6 e o Ponto é desenhado depois).
      if (t > C0 && t < C0 + 0.5) {
        const HR = 48 + 2;
        c.save();
        c.beginPath(); c.rect(LINE_X - HR, LY1 - HR, 2 * HR, 2 * HR); c.clip();
        drawHalo(c, LINE_X, LY1, seg(t, C0, C0 + 0.5));
        c.globalCompositeOperation = 'destination-out';
        const fg = c.createLinearGradient(262, 0, 286, 0);
        fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,1)');
        c.fillStyle = fg;
        c.fillRect(262, LY1 - HR, LINE_X + HR - 262, 2 * HR);
        c.restore();
      }
    }
    const pontoR = t => 10 * (1 + 0.5 * pulseBump(t, C0));      // pulso do núcleo no chime (10 → 15 → 10)

    // Na saída (linha → círculo) a ponta chega a milhares de px/s: 8 quadros de rastro virariam uma
    // barra enorme. Ali o rastro é limitado a 180 px de arco e recolhe até o Ponto em 11,70–11,90.
    const TRAIL_CAP = 180;
    function drawPonto(c, t) {
      const p = pontoPos(t);
      const q = pontoPos(t - 1 / 30);
      const speed = Math.hypot(p.x - q.x, p.y - q.y) * 30;
      const exiting = t >= 11.4;
      const collapse = exiting ? 1 - seg(t, 11.7, 11.9, ESIO) : 1;
      const lmax = exiting ? TRAIL_CAP * collapse : Infinity;
      const ta = smooth(500, 800, speed) * collapse;
      if (ta > 0.001 && lmax > 2) {
        // fita afinada pelas últimas 8 posições (amostradas a cada 1/4 de quadro), cortada no
        // comprimento de arco lmax; α decrescente, cor #C026D3 → #7C3AED
        const SUB = 4;
        const pts = [p];
        let acc = 0;
        for (let k = 1; k <= 8 * SUB; k++) {
          const a = pts[pts.length - 1], b = pontoPos(t - k / (30 * SUB));
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d < 1e-4) continue;
          if (acc + d >= lmax) { const f = (lmax - acc) / d; pts.push({ x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f) }); acc = lmax; break; }
          acc += d; pts.push(b);
        }
        const L = [], R = [];
        let nx = 0, ny = -1, run = 0;
        for (let k = 0; k < pts.length; k++) {
          const a = pts[Math.max(0, k - 1)], b = pts[Math.min(pts.length - 1, k + 1)];
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
          if (len > 1e-3) { nx = -dy / len; ny = dx / len; }
          if (k > 0) run += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
          const w = lerp(14, 1.2, acc > 0 ? run / acc : 1) / 2;
          L.push([pts[k].x + nx * w, pts[k].y + ny * w]); R.push([pts[k].x - nx * w, pts[k].y - ny * w]);
        }
        const tail = pts[pts.length - 1];
        if (Math.hypot(tail.x - p.x, tail.y - p.y) > 2) {
          c.save();
          const gr = c.createLinearGradient(p.x, p.y, tail.x, tail.y);
          gr.addColorStop(0, mixA(0, 0.7 * ta)); gr.addColorStop(0.45, mixA(0.5, 0.35 * ta)); gr.addColorStop(1, mixA(1, 0));
          c.fillStyle = gr;
          c.beginPath();
          c.moveTo(L[0][0], L[0][1]);
          for (let k = 1; k < L.length; k++) c.lineTo(L[k][0], L[k][1]);
          for (let k = R.length - 1; k >= 0; k--) c.lineTo(R[k][0], R[k][1]);
          c.closePath(); c.fill();
          c.restore();
        }
      }
      // mesmo desenho do Ponto das outras cenas: glowDot lavanda (α .6) + núcleo #FBF8FF r 10
      const pr = pontoR(t);
      h.glowDot(c, p.x, p.y, pr, P.lavender, 0.6);
      c.fillStyle = P.ink;
      c.beginPath(); c.arc(p.x, p.y, pr, 0, TAU); c.fill();
    }

    // Na saída a borda direita da máscara dos números acompanha a linha (que começa a enrolar em 11,4):
    // os números entram exatamente na linha, sem aresta invisível. Antes disso, borda fixa em x 242.
    function updateNumMasks(t) {
      const p = morphP(t);
      const gap = lerp(LINE_X - MASK_R, 1.5, seg(t, 11.4, 11.46));   // 8 px → borda esquerda da linha
      for (const c of cols) {
        const edge = linePt(c.numS, p).x - gap;
        c.mask.style.width = Math.max(0, edge - MASK_L).toFixed(2) + 'px';
      }
    }

    function updateGearDots(t) {
      // mini engrenagem: pop (mecca.back, 0,4 s) e giro de 90°/s a partir de 6,5
      const gs = EBACK(seg(t, 6.5, 6.9));
      gear3.pop.setAttribute('transform', `translate(${gear3.x} ${gear3.y}) scale(${gs.toFixed(4)}) rotate(${(90 * Math.max(0, t - 6.5)).toFixed(3)})`);
      gear3.pop.setAttribute('opacity', seg(t, 6.5, 6.6).toFixed(3));
      const e = seg(t, 6.5, 6.95, EOUT);
      for (let j = 0; j < 3; j++) {
        const ang = TAU * (t - 6.5) / 2.0 + j * TAU / 3;
        const x = gear3.x + 40 * e * Math.cos(ang), y = gear3.y + 13 * e * Math.sin(ang);
        const frontSide = Math.sin(ang) >= 0;
        const b = gear3.backDots[j], f = gear3.frontDots[j];
        b.setAttribute('cx', x.toFixed(2)); b.setAttribute('cy', y.toFixed(2));
        f.setAttribute('cx', x.toFixed(2)); f.setAttribute('cy', y.toFixed(2));
        b.setAttribute('opacity', frontSide ? 0 : (0.5 * e).toFixed(3));
        f.setAttribute('opacity', frontSide ? e.toFixed(3) : 0);
      }
    }

    onFrame((lt) => {
      if (lt < 1 / 60) Object.assign(bg, BG_IN);   // garante o estado do corte (42,0) no quadro exato t = 0
      const s = gsap.getProperty(wrap, 'scale');
      for (const c of [bx, fx]) {
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.clearRect(0, 0, W, H);
        c.setTransform(s, 0, 0, s, CAM_O.x * (1 - s), CAM_O.y * (1 - s));
      }
      drawGuides(bx, lt);
      drawTrack(bx, lt);
      drawSweep(bx, lt);
      drawCircleTrack(bx, lt);
      drawNodes(bx, lt);
      drawRiders(bx, lt);
      drawImpact(fx, lt);
      drawPonto(fx, lt);
      updateGearDots(lt);
      updateNumMasks(lt);
    });
  },
});
})();
