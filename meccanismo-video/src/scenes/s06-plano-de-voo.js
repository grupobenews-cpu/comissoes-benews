(() => {
/*
 * S06 — O plano de voo: quatro tempos (global 42–54 s, D = 12 s, tail 0)
 *
 * A órbita herdada da S05 se deita e vira a linha do tempo; o Ponto é a sonda que
 * visita os 4 tempos (Diagnóstico, Engenharia, Operação, Escala). No fim o Ponto gira
 * sozinho e a linha se enrola num círculo (que a S07 transforma em engrenagem).
 *
 * Tudo o que é canvas (órbita, linha, nós, Ponto, riders) é função analítica de lt;
 * o texto é DOM animado na timeline local. Um "push" de câmera lento (1 → 1,006 em 0–8,0,
 * → 1,026 em 8,0–11,4, → 1 no fim) com origem na margem esquerda (192,540) é aplicado
 * igualmente ao grupo da linha do tempo (DOM, CSS scale) e aos canvases (setTransform);
 * o eyebrow fica fora do push (preso em (192,120)).
 */
MECCA.scene({
  id: 's06-plano-de-voo',
  build({ root, tl, D, h, P, bg, onFrame, cue }) {
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

    // ------------------------------------------------------------------ constantes de layout
    const LINE_Y = 580, LX0 = 192, LX1 = 1728, LLEN = LX1 - LX0;
    const COLX = [192, 582, 972, 1362];
    const TT = [3.0, 4.5, 6.0, 7.5];
    const NAMES = ['Diagnóstico', 'Engenharia', 'Operação', 'Escala'];
    const DESCS = [
      'Abrimos a máquina e achamos qual engrenagem travou o crescimento.',
      'Montamos o que falta: processo, time, ferramenta e número.',
      'Os mecca assumem as rotinas e operam por dentro.',
      'Tudo engrenado e medido, o crescimento vira previsível.',
    ];
    const MASK_TOP = 420, MASK_BOT = 572, MASK_H = MASK_BOT - MASK_TOP;   // máscara dos números (base em y 572)
    const CAM_O = { x: 192, y: 540 };                                      // origem do push: margem esquerda fixa

    // ------------------------------------------------------------------ CSS local
    h.el('style', {
      html: `
[data-scene="${SID}"] .s06-layer { position:absolute; left:0; top:0; width:1920px; height:1080px; }
[data-scene="${SID}"] .s06-mask { position:absolute; overflow:hidden; }
[data-scene="${SID}"] .s06-num { background: linear-gradient(90deg, #C026D3, #7C3AED); -webkit-background-clip: text; background-clip: text; color: transparent; padding-right: 0.06em; }
[data-scene="${SID}"] svg.s06-svg { position:absolute; left:0; top:0; width:1920px; height:1080px; overflow:visible; pointer-events:none; }
[data-scene="${SID}"] .s06-scan { position:absolute; width:2px; height:70px; border-radius:2px; background:#A78BFA; box-shadow: 0 0 10px rgba(167,139,250,0.95), 0 0 2px #FBF8FF; }
[data-scene="${SID}"] .s06-caret { position:absolute; width:11px; height:20px; background:#A78BFA; }
[data-scene="${SID}"] .s06-sub em { display:inline-block; }
`,
    }, root);

    // ------------------------------------------------------------------ camadas
    const back = h.canvas(root);                         // guias, órbita/linha, nós, riders
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
    // eyebrow FORA do wrapper do push (fica preso na margem, em (192,120)); abaixo do canvas do Ponto
    const ebWrap = h.el('div', { cls: 's06-layer' }, root);
    root.insertBefore(ebWrap, front.canvas);
    const eb = h.eyebrow('O PLANO DE VOO', { x: 192, y: 120, anchor: 'cl', size: 22, parent: ebWrap });
    const ebDash = eb.querySelector('.dash');
    const ebLbl = eb.querySelector('.lbl');

    const titleWrap = layer(wrap);
    const title = h.text('Quatro tempos', { x: 192, y: 0, size: 180, nowrap: true, lh: 1.2, parent: titleWrap });
    const titleOff = placeBase(title, 380);

    const subWrap = layer(wrap);
    const sub = h.text('até a máquina <em>girar sozinha</em>.', {
      x: 192, y: 0, size: 60, weight: 500, color: P.lilac, nowrap: true, lh: 1.25, ls: '-0.02em', cls: 't-display s06-sub', parent: subWrap,
    });
    const subOff = placeBase(sub, 470);
    const subR = h.rect(sub).right;   // fim do subtitulo grande (para o vao da orbita sob o texto)

    // ------------------------------------------------------------------ colunas
    const cols = COLX.map((x, i) => {
      const c = { i, x, T: TT[i] };
      c.mask = h.el('div', { cls: 's06-mask', style: { left: (x - 16) + 'px', top: MASK_TOP + 'px', width: '260px', height: MASK_H + 'px' } }, wrap);
      c.num = h.text('0' + (i + 1), { x: 16, y: 0, size: 120, cls: 't-bricolage s06-num', nowrap: true, lh: 1, parent: c.mask });
      placeBase(c.num, 540 - MASK_TOP);
      const nr = h.rect(c.num);
      c.numS = (nr.cx - LX0) * 63 / LLEN;   // posição (em índice da polyline) do centro do número

      c.nameWrap = layer(wrap);
      c.name = h.text(NAMES[i], { x, y: 0, size: 56, nowrap: true, lh: 1.25, parent: c.nameWrap });
      c.nameOff = placeBase(c.name, 660);
      c.nr = h.rect(c.name);
      c.svg = h.svg('svg', { class: 's06-svg', viewBox: '0 0 1920 1080', width: 1920, height: 1080 }, c.nameWrap);

      c.descWrap = layer(wrap);
      c.desc = h.text(DESCS[i], { x, y: 0, size: 28, cls: 't-body', weight: 500, color: P.lilac, width: 360, lh: 1.35, parent: c.descWrap });
      placeBase(c.desc, 712);
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
    const caret = h.el('div', { cls: 's06-caret', style: { left: caret0 + 'px', top: (120 - 10) + 'px' } }, ebWrap);
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
    const tSp = h.split(title, { type: 'lines,chars', mask: 'lines' });
    tl.fromTo(tSp.chars, { yPercent: 110 }, { yPercent: 0, duration: 0.5, stagger: 0.02, ease: 'mecca.out' }, 0.5);
    const sSp = h.split(sub, { type: 'lines,words', mask: 'lines' });
    tl.fromTo(sSp.words, { yPercent: 110 }, { yPercent: 0, duration: 0.6, stagger: 0.04, ease: 'mecca.out' }, 1.0);

    gsap.set(title, { transformOrigin: `0px ${titleOff}px` });
    gsap.set(sub, { transformOrigin: `0px ${subOff}px` });
    tl.to(title, { scale: 56 / 180, y: 200 - 380, duration: 0.5, ease: 'mecca.inOut' }, 2.5);
    tl.to(sub, { scale: 26 / 60, y: 240 - 470, duration: 0.5, ease: 'mecca.inOut' }, 2.5);

    // ------------------------------------------------------------------ os 4 tempos
    cols.forEach((c) => {
      const T = c.T;
      // número sobe de trás da linha
      tl.fromTo(c.num, { y: MASK_H }, { y: 0, duration: 0.45, ease: 'expo.out' }, T);
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
      const scan = h.el('div', { cls: 's06-scan', style: { left: (c.x - 0.06 * w - 1) + 'px', top: (660 - 0.25 * 56 - 35) + 'px' } }, c.nameWrap);
      gsap.set(scan, { opacity: 0, x: 0 });
      tl.fromTo(c.name, { clipPath: clipA }, { clipPath: clipB, duration: 0.35, ease: 'power2.inOut' }, c.T);
      tl.fromTo(scan, { x: 0 }, { x: 1.12 * w, duration: 0.35, ease: 'power2.inOut', immediateRender: false }, c.T);
      tl.fromTo(scan, { opacity: 0 }, { opacity: 1, duration: 0.06, ease: 'none', immediateRender: false }, c.T);
      tl.to(scan, { opacity: 0, duration: 0.2, ease: 'power1.in' }, c.T + 0.35);   // fade: nunca mecca.in em opacidade
    }

    // 02 — Engenharia: chars caem + marcas de corte em L
    {
      const c = cols[1];
      const sp = h.split(c.name, { type: 'chars' });
      tl.fromTo(sp.chars, { y: -30 }, { y: 0, duration: 0.5, stagger: 0.025, ease: 'mecca.back' }, c.T);
      tl.fromTo(sp.chars, { opacity: 0 }, { opacity: 1, duration: 0.18, stagger: 0.025, ease: 'none' }, c.T);
      const L = 12;
      const x0 = c.nr.x - 14, x1 = c.nr.right + 12, y0 = 660 - 0.72 * 56 - 9, y1 = 660 + 0.24 * 56 + 4;
      const corners = [
        `M${x0} ${y0 + L} L${x0} ${y0} L${x0 + L} ${y0}`,
        `M${x1 - L} ${y0} L${x1} ${y0} L${x1} ${y0 + L}`,
        `M${x1} ${y1 - L} L${x1} ${y1} L${x1 - L} ${y1}`,
        `M${x0 + L} ${y1} L${x0} ${y1} L${x0} ${y1 - L}`,
      ].map(d => h.svg('path', { d, fill: 'none', stroke: P.lavender, 'stroke-width': 1.5, 'stroke-linecap': 'square', opacity: 0.85 }, c.svg));
      tl.fromTo(corners, { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 0.35, stagger: 0.05, ease: 'mecca.out' }, c.T + 0.12);
    }

    // 03 — Operação: chars sobem + mini engrenagem com 3 pontinhos
    const gear3 = {};
    {
      const c = cols[2];
      const sp = h.split(c.name, { type: 'lines,chars', mask: 'lines' });
      tl.fromTo(sp.chars, { yPercent: 110 }, { yPercent: 0, duration: 0.5, stagger: 0.025, ease: 'mecca.out' }, c.T);
      const gx = c.nr.right + 24 + 14, gy = 642;
      gear3.x = gx; gear3.y = gy;
      const dotCols = [P.lilac, P.lavender, P.magenta];
      gear3.backDots = dotCols.map(col => h.svg('circle', { cx: gx, cy: gy, r: 2.5, fill: col, opacity: 0 }, c.svg));
      gear3.pop = h.svg('g', { transform: `translate(${gx} ${gy}) scale(0)`, opacity: 0 }, c.svg);
      h.gear(gear3.pop, { x: 0, y: 0, r: 14, teeth: 8, depth: 0.3, hole: 0.34, tip: 0.36, base: 0.62, fill: 'rgba(36,16,56,0.9)', stroke: P.lavender, strokeWidth: 1.5 });
      gear3.frontDots = dotCols.map(col => h.svg('circle', { cx: gx, cy: gy, r: 2.5, fill: col, opacity: 0 }, c.svg));
    }

    // 04 — Escala: nome cresce da base + escadinha de 3 degraus
    {
      const c = cols[3];
      const sp = h.split(c.name, { type: 'chars' });
      gsap.set(sp.chars, { transformOrigin: '50% 100%' });
      tl.fromTo(sp.chars, { scaleY: 0 }, { scaleY: 1, duration: 0.45, stagger: 0.04, ease: 'mecca.back' }, c.T);
      const sx = c.nr.right + 18, st = 13, sw = 13;
      const d = `M${sx} 660 h${sw} v${-st} h${sw} v${-st} h${sw} v${-st} h${sw}`;
      const stair = h.svg('path', { d, fill: 'none', stroke: P.lavender, 'stroke-width': 1.5, 'stroke-linecap': 'square', 'stroke-linejoin': 'miter' }, c.svg);
      const tip = h.svg('circle', { cx: sx + 4 * sw, cy: 660 - 3 * st, r: 3.5, fill: P.magenta }, c.svg);
      tl.fromTo(stair, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.45, ease: 'mecca.out' }, c.T + 0.28);
      tl.fromTo(tip, { scale: 0 }, { scale: 1, svgOrigin: `${sx + 4 * sw} ${660 - 3 * st}`, duration: 0.3, ease: 'mecca.back' }, c.T + 0.62);
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
    // A linha começa a enrolar em 11,4 (power3.inOut: p ≈ .04 em 11,55, .12 em 11,6).
    // 1) Os números afundam na linha ENQUANTO ela ainda está reta: y → base da máscara + fade,
    //    0,15 s, power2.in, stagger .02 a partir da col 4 (tudo fora em 11,61).
    // 2) O resto do texto apaga rápido (0,2 s, stagger .02) na ordem em que a curva cruza as
    //    colunas (03, 02, 01), depois 'Escala', header e eyebrow; a descrição 04 (fora do caminho
    //    da curva e com a janela de leitura mais curta) sai por último.
    const X0 = 11.4;
    [3, 2, 1, 0].forEach((ci, k) => {
      const c = cols[ci];
      tl.to(c.num, { y: MASK_H, duration: 0.15, ease: 'power2.in', immediateRender: false }, X0 + 0.02 * k);
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
    // Origem na margem esquerda (192,540): a coluna x 192 não sai do lugar. Perfil (uma curva só, sem
    // quinas de velocidade): 0–8,0 quase imperceptível (1 → 1,006, linear); 8,0–11,4 o push do groove
    // (1,006 → 1,026 = +0,02), acelerando suavemente a partir da mesma velocidade; 11,4–fim volta a 1
    // (mecca.inOut) escondido no enrolar da linha, para o último quadro casar com a S07.
    const PUSH_T0 = 8.0, PUSH_T1 = 11.4, PUSH_A = 0.006, PUSH_B = 0.02, PUSH_PEAK = 1 + PUSH_A + PUSH_B;
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

    // ------------------------------------------------------------------ som
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

    // órbita que se deita (2,5–3,0)
    function ellipseAt(t) {
      const k = seg(t, 2.5, 3.0, EIO);
      return { cx: 960, cy: 600 - 20 * k, rx: 780 - 12 * k, ry: 120 * (1 - k), k };
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
    // x do Ponto sobre a linha
    const LEGS = [[4.1, 4.5, 192, 582], [5.6, 6.0, 582, 972], [7.1, 7.5, 972, 1362], [8.0, 8.5, 1362, 1728]];
    function lineX(t) {
      let x = LX0;
      for (const [a, b, x0, x1] of LEGS) {
        if (t >= b) { x = x1; continue; }
        if (t > a) x = lerp(x0, x1, EIO((t - a) / (b - a)));
        break;
      }
      return x;
    }
    // Ponto girando sozinho: nasce no círculo r 22 com centro (1706,580) e, no chime de 8,5, abre para r 34
    // (8,5–9,1, mecca.out). O centro recua junto (1728 − r) para o círculo continuar tangente ao fim da linha
    // (1728,580): é ali que o Ponto entra (8,5) e de onde sai para o enrolar (11,4). ≈1 volta/s, rampa de 0,2 s.
    const CY = 580, CR0 = 22, CR1 = 34, C0 = 8.5, RAMP = 0.2;
    const OMEGA = TAU * 3 / (11.4 - C0 - RAMP / 2);
    const circR = t => lerp(CR0, CR1, seg(t, C0, C0 + 0.6, EOUT));
    const circC = t => ({ x: LX1 - circR(t), y: CY });
    function circAngle(t) {
      const tau = t - C0;
      if (tau <= 0) return 0;
      if (tau <= RAMP) return OMEGA * RAMP * S(tau / RAMP);
      return OMEGA * (tau - RAMP / 2);
    }
    // polyline linha → círculo (s ∈ [0,63]), interpolada em coordenadas POLARES em torno de (960,540):
    // cada ponto parte da sua projeção polar na linha reta (r0, a0) e vai para (300, π − s·2π/63).
    // Como a0 e a1 decrescem com s, o ângulo é monótono ao longo da curva e o vão angular é < 2π até p = 1:
    // a polyline nunca se cruza (fim do laço que o lerp cartesiano fazia na ponta direita em ~11,7).
    // Raio e ângulo em lerp; só os pontos longe do centro (r0 > 300: as pontas) adiantam um pouco o raio
    // (pr = p + .9·p(1 − p)·w), para a ponta, que varre por cima, não sair do quadro (com pr = p ela passaria
    // de y < 0 por volta de p ≈ .4). Perto do polo o lerp fica puro, que é onde a curva ondula menos.
    const morphP = t => seg(t, 11.4, END, EP3);
    const MC = { x: 960, y: 540 }, MR = 300, R0MAX = Math.hypot(LX1 - MC.x, LINE_Y - MC.y);
    function linePt(s, p) {
      const x0 = LX0 + s * LLEN / 63;
      if (p <= 0) return { x: x0, y: LINE_Y };
      const dx = x0 - MC.x, dy = LINE_Y - MC.y;
      const r0 = Math.hypot(dx, dy), a0 = Math.atan2(dy, dx);
      const a1 = Math.PI - s * TAU / 63;
      if (p >= 1) return { x: MC.x + MR * Math.cos(a1), y: MC.y + MR * Math.sin(a1) };
      const pr = p + 0.9 * p * (1 - p) * clamp((r0 - MR) / (R0MAX - MR));
      const r = lerp(r0, MR, pr), a = lerp(a0, a1, p);
      return { x: MC.x + r * Math.cos(a), y: MC.y + r * Math.sin(a) };
    }
    function circPos(t) {
      const a = circAngle(t), c = circC(t), r = circR(t);
      return { x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) };
    }
    function pontoPos(t) {
      if (t < 2.5) {
        const e = ellipseAt(t), th = Math.PI + orbitAngle(t);
        return { x: e.cx + e.rx * Math.cos(th), y: e.cy + e.ry * Math.sin(th) };
      }
      if (t < 3.0) { const e = ellipseAt(t); return { x: e.cx - e.rx, y: e.cy }; }
      if (t < C0) return { x: lineX(t), y: LINE_Y };
      const c = circPos(t);
      if (t < 11.4) return c;
      const tip = linePt(63, morphP(t));
      const w = smooth(11.4, 11.52, t);
      return { x: lerp(c.x, tip.x, w), y: lerp(c.y, tip.y, w) };
    }
    const flow = t => 22 * Math.max(0, t - 2.5);  // tracejado escorrendo em direção ao Ponto

    const hex2rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const MAG = hex2rgb(P.magenta), VIO = hex2rgb(P.violet);
    const mixA = (k, a) => `rgba(${Math.round(lerp(MAG[0], VIO[0], k))},${Math.round(lerp(MAG[1], VIO[1], k))},${Math.round(lerp(MAG[2], VIO[2], k))},${a})`;

    // ================================================================== desenho
    const bx = back.ctx, fx = front.ctx;

    function drawGuides(c, t) {
      const out = 1 - seg(t, 11.4, 11.7);
      if (out <= 0) return;
      c.save();
      c.lineWidth = 1;
      c.strokeStyle = hexA(P.lavender, 0.05 * out);
      for (let i = 0; i < 4; i++) {
        const g = seg(t, TT[i], TT[i] + 0.6, EOUT);
        if (g <= 0) continue;
        const x = COLX[i] + 0.5;
        c.beginPath(); c.moveTo(x, LINE_Y - 140 * g); c.lineTo(x, LINE_Y + 320 * g); c.stroke();
      }
      c.restore();
    }

    // Vão da metade de trás sob o subtítulo grande (1,0–2,8): o 'q' e o 'g' (baseline 470) descem
    // até y ≈ 483 e a elipse passa em y 480. A órbita some por trás do texto: fator de α que vai a
    // ~0 na faixa y ≤ 490 entre o início do texto e o seu fim (+ rampa de 60 px), e volta a 1
    // abaixo de y 510 (a curva sai da faixa suavemente, sem aresta dura).
    const gapAmt = t => seg(t, 0.85, 1.1) * (1 - seg(t, 2.5, 2.8));
    function gapF(x, y, g) {
      if (g <= 0) return 1;
      const v = 1 - smooth(490, 510, y);
      const hz = 1 - smooth(subR + 6, subR + 66, x);
      return 1 - 0.92 * g * v * hz;
    }
    // metade de trás como polyline com α por trecho (mantém o tracejado contínuo via lineDashOffset)
    function strokeBackHalf(c, e, baseA, g, dashOff) {
      const N = 180, ry = Math.max(e.ry, 0.01);
      let acc = 0, runA = -1;
      let px = e.cx - e.rx, py = e.cy;
      for (let j = 1; j <= N; j++) {
        const th = Math.PI + (j / N) * Math.PI;
        const qx = e.cx + e.rx * Math.cos(th), qy = e.cy + ry * Math.sin(th);
        const aq = Math.round(baseA * gapF((px + qx) / 2, (py + qy) / 2, g) * 400) / 400;
        if (aq !== runA) {
          if (runA >= 0) c.stroke();
          runA = aq;
          c.strokeStyle = hexA(P.lavender, aq);
          if (dashOff != null) c.lineDashOffset = dashOff + acc;   // tracejado continua entre trechos
          c.beginPath(); c.moveTo(px, py);
        }
        c.lineTo(qx, qy);
        acc += Math.hypot(qx - px, qy - py);
        px = qx; py = qy;
      }
      if (runA >= 0) c.stroke();
    }

    function drawTrack(c, t) {
      c.save();
      if (t < 3.0) {
        const e = ellipseAt(t), k = e.k;
        const a = lerp(0.3, 0.35, k);
        const backF = lerp(1 - 0.5 * seg(t, 0.3, 1.0, EIO), 1, k);   // metade de trás (em cima) α ×.5
        c.lineWidth = 1.5;
        const dashed = k > 0.0005;
        if (dashed) { c.setLineDash([16 - 10 * k, 10 * k]); c.lineDashOffset = flow(t); }
        const g = gapAmt(t);
        if (g > 0) strokeBackHalf(c, e, a * backF, g, dashed ? flow(t) : null);
        else {
          c.strokeStyle = hexA(P.lavender, a * backF);
          c.beginPath(); c.ellipse(e.cx, e.cy, e.rx, Math.max(e.ry, 0.01), 0, Math.PI, TAU); c.stroke();
        }
        if (dashed) c.lineDashOffset = flow(t);
        if (k < 0.999) {
          c.strokeStyle = hexA(P.lavender, a * (1 - k));
          c.beginPath(); c.ellipse(e.cx, e.cy, e.rx, Math.max(e.ry, 0.01), 0, Math.PI, 0, true); c.stroke();
        }
        c.restore();
        return;
      }
      const p = morphP(t);
      const xs = t < C0 ? lineX(t) : LX1;
      const sSolid = (xs - LX0) * 63 / LLEN;
      // à frente do Ponto: tracejado lavanda
      if (xs < LX1 - 0.01) {
        c.lineWidth = 1.5;
        c.setLineDash([6, 10]);
        c.lineDashOffset = (xs - LX0) + flow(t);
        c.strokeStyle = hexA(P.lavender, 0.35);
        c.beginPath(); c.moveTo(xs, LINE_Y); c.lineTo(LX1, LINE_Y); c.stroke();
        c.setLineDash([]);
      }
      // atrás do Ponto: sólido em gradiente 3 px
      if (sSolid > 0.001) {
        const gr = c.createLinearGradient(lerp(LX0, 660, p), 0, lerp(LX1, 1260, p), 0);
        gr.addColorStop(0, P.magenta); gr.addColorStop(1, P.violet);
        c.strokeStyle = gr; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath();
        if (p >= 0.99999) c.arc(960, 540, 300, 0, TAU);
        else if (p <= 0) { c.moveTo(LX0, LINE_Y); c.lineTo(xs, LINE_Y); }
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
    // anel r 10 → 40, α .6 → 0). Entre os dois ticks um brilho corre a linha inteira (192 → 1728, 9,5–10,0)
    // e chega ao Ponto girando no segundo tick: o plano alimenta a máquina que gira sozinha.
    const PULSES = [9.5, 10.0];
    const SW0 = 9.5, SW1 = 10.0, SW_TAIL = 280;
    // 0 → 1 (power2.out) de T − 1/30 a T + 0,06 (o quadro do tick já mostra o ataque), 1 → 0 em 0,3 s (sine.inOut)
    const PB0 = 1 / 30, PB1 = 0.06, PB2 = 0.3;
    function pulseBump(t, T) {
      if (t <= T - PB0 || t >= T + PB1 + PB2) return 0;
      if (t < T + PB1) { const u = (t - T + PB0) / (PB0 + PB1); return 1 - (1 - u) * (1 - u); }
      return 1 - ESIO((t - T - PB1) / PB2);
    }
    function drawSweep(c, t) {
      const xh = LX0 + (t - SW0) / (SW1 - SW0) * LLEN;
      if (xh < LX0 || xh - SW_TAIL > LX1) return;
      const x0 = Math.max(LX0, xh - SW_TAIL), x1 = Math.min(LX1, xh + 14);
      if (x1 <= x0) return;
      const fade = 1 - seg(xh, LX1 - 40, LX1 + SW_TAIL);   // a cauda entra no Ponto e se apaga
      c.save();
      const g = c.createLinearGradient(xh - SW_TAIL, 0, xh + 14, 0);
      g.addColorStop(0, 'rgba(251,248,255,0)'); g.addColorStop(0.9, `rgba(251,248,255,${0.95 * fade})`); g.addColorStop(1, 'rgba(251,248,255,0)');
      const g2 = c.createLinearGradient(xh - SW_TAIL, 0, xh + 14, 0);
      g2.addColorStop(0, hexA(P.lavender, 0)); g2.addColorStop(0.9, hexA(P.lavender, 0.4 * fade)); g2.addColorStop(1, hexA(P.lavender, 0));
      c.lineCap = 'butt';
      c.strokeStyle = g2; c.lineWidth = 12; c.beginPath(); c.moveTo(x0, LINE_Y); c.lineTo(x1, LINE_Y); c.stroke();
      c.strokeStyle = g; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, LINE_Y); c.lineTo(x1, LINE_Y); c.stroke();
      c.restore();
    }

    function drawNodes(c, t) {
      const p = morphP(t);
      const out = 1 - seg(t, 11.45, 11.85, EP2IN);   // power2.in: o nó chega a ~1,6 px no último quadro (sem 'pop')
      c.save();
      for (let i = 0; i < 4; i++) {
        const T = TT[i];
        if (t < T) continue;
        const pos = linePt((COLX[i] - LX0) * 63 / LLEN, p);
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

    // riders da órbita (0–2,8): entram no impacto de abertura já nos seus lugares (±120° do Ponto),
    // com pop de escala mecca.back (0,0–0,45) e um anel pequeno cada. α nasce em 0 (1º quadro = último da S05).
    function drawRiders(c, t) {
      const a = seg(t, 0, 0.08) * (1 - seg(t, 2.45, 2.8));
      if (a <= 0.001) return;
      const e = ellipseAt(t), th = Math.PI + orbitAngle(t);
      const pop = EBACK(seg(t, 0, 0.45)), ru = seg(t, 0.02, 0.5);
      [[TAU / 3, P.magenta, 5], [-TAU / 3, P.lavender, 4]].forEach(([off, col, r]) => {
        const ang = th + off;
        const x = e.cx + e.rx * Math.cos(ang), y = e.cy + e.ry * Math.sin(ang);
        const depth = 0.75 + 0.25 * Math.sin(ang);        // metade de trás com α ×.5
        const ga = a * depth * gapF(x, y, gapAmt(t));      // some por trás do subtítulo
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
      const ca = circAngle(t), cc = circC(t), cr = circR(t);
      const ang = Math.min(TAU, ca);
      c.save();
      c.strokeStyle = hexA(P.lavender, a); c.lineWidth = 1.2;
      c.beginPath(); c.arc(cc.x, cc.y, cr, 0, Math.max(0.001, ang)); c.stroke();
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
            c.beginPath(); c.arc(cc.x, cc.y, cr, ca - span * f1, ca - span * f0 + 0.004); c.stroke();
          }
        }
      }
      // 10,0: o brilho que correu a linha chega ao Ponto — anel em volta do giro
      const u = seg(t, SW1, SW1 + 0.45);
      if (u > 0 && u < 1) {
        c.strokeStyle = hexA(P.lavender, 0.55 * (1 - u)); c.lineWidth = 2;
        c.beginPath(); c.arc(cc.x, cc.y, cr + 6 + 34 * EOUT(u), 0, TAU); c.stroke();
      }
      c.restore();
    }

    // Acentos do Ponto: impacto de abertura (t = 0) e chime 'gira sozinha' (8,5).
    // Abertura: halo r 10 → 48, α .6 → 0 em 0,3 s + anel fino de choque, presos no ponto do impacto (180,600).
    // O α sobe em 1 quadro (smooth 0 → 1/30) para o quadro t = 0 continuar idêntico ao último da S05.
    function drawImpact(c, t) {
      if (t > 0 && t < 0.6) {
        const k = smooth(0, 1 / 30, t);
        c.save();
        c.globalAlpha = k;
        drawHalo(c, 180, 600, seg(t, 0, 0.3));
        const u = seg(t, 0, 0.55);
        c.strokeStyle = hexA(P.lavender, 0.35 * (1 - u)); c.lineWidth = 1.5;
        c.beginPath(); c.arc(180, 600, 10 + 86 * EOUT(u), 0, TAU); c.stroke();
        c.restore();
      }
      if (t > C0 && t < C0 + 0.5) {
        c.save();
        drawHalo(c, LX1, LINE_Y, seg(t, C0, C0 + 0.5));
        c.restore();
      }
    }
    const pontoR = t => 10 * (1 + 0.5 * pulseBump(t, C0));      // pulso do núcleo no chime (10 → 15 → 10)

    // Na saída (linha → círculo) a ponta chega a ~7000 px/s: 8 quadros de rastro virariam uma barra
    // de ~1000 px. Ali o rastro é limitado a 180 px de arco e recolhe até o Ponto em 11,70–11,90.
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

    // Na saída a base da máscara dos números acompanha a linha (que começa a enrolar em 11,4):
    // os números afundam exatamente na linha, sem aresta invisível. Antes disso, base fixa em 572.
    function updateNumMasks(t) {
      const p = morphP(t);
      const gap = lerp(LINE_Y - MASK_BOT, 1.5, seg(t, 11.4, 11.46));   // 8 px → borda de cima da linha
      for (const c of cols) {
        const base = linePt(c.numS, p).y - gap;
        c.mask.style.height = Math.max(0, base - MASK_TOP).toFixed(2) + 'px';
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
        const x = gear3.x + 30 * e * Math.cos(ang), y = gear3.y + 10 * e * Math.sin(ang);
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
        c.clearRect(0, 0, 1920, 1080);
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
