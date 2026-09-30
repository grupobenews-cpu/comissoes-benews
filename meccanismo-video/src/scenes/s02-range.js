(() => {
/*
 * S02 — "Algumas giram; a maioria range."  (6–14 s, tail 0)
 * O problema como fenômeno físico: os dois discos herdados da S01 viram engrenagens,
 * giram saudáveis por meio segundo, emperram (G2 7° fora de fase) e rangem a cada batida.
 * "Não falta esforço — falta engenharia." A planta técnica mostra o erro (interferência
 * entre os dentes). No fim, as engrenagens emperradas viram as duas caixas do mercado (S03).
 *
 * Tudo é função de lt: tweens na timeline local + desenho de canvas / transforms em onFrame.
 */
MECCA.scene({
  id: 's02-range',
  build({ root, tl, D, h, P, bg, onFrame, cue }) {
    const SID = 's02-range';
    const { clamp, lerp, hexA } = h;
    const TAU = Math.PI * 2, DEG = Math.PI / 180;
    const E = (n) => gsap.parseEase(n);
    const mInOut = E('mecca.inOut'), p3Out = E('power3.out'), p3In = E('power3.in');
    const p2InOut = E('power2.inOut'), elastic = E('elastic.out(1,0.5)'), backOut = E('back.out(2.2)');
    const seg = (t, a, b) => clamp((t - a) / (b - a));
    const sm = (a, b, v) => h.smooth(a, b, v);

    // ------------------------------------------------------------------ tempos-chave
    const T_LOCK = 0.5;                          // 'range': G2 escorrega 7° e tudo trava
    const RATTLES = [1.0, 1.5, 2.0, 2.5, 3.0];   // rangidos
    const T_FALL = 3.5;                          // bloco A desaba
    const T_JOLT = 4.0;                          // tranco forte
    const T_LAND = 4.5;                          // Ponto pousa como '.' de 'engenharia.'
    const T_BP0 = 4.5, T_BP1 = 5.0, T_LENS = 5.0; // planta técnica
    const T_PUSHB0 = 4.0, T_PUSHB1 = 7.5;        // push do bloco B desde a entrada (nada parado 4,4–6,0)
    const T_TXO = 7.4;                           // saída do texto: termina ≈7,65, antes de o contorno chegar à área do texto (≈7,69)
    const T_OUT = 7.45;                          // o Ponto sai do '.' junto com o morph
    const T_M0 = 7.45, T_M1 = 7.95;              // morph (termina antes do último quadro 7,967)

    // ------------------------------------------------------------------ fundo (corte de entrada: padrão)
    tl.set(bg, { glowA: 1, glowB: 1, glowC: 1, grid: 0, particles: 1, driftX: 0, driftY: 0, speed: 1, warp: 0, vignette: 0.55, dim: 0, hue: 0, grain: 1, immediateRender: false }, 0);
    tl.fromTo(bg, { grid: 0 }, { grid: 0.25, duration: 1.0, ease: 'sine.inOut', immediateRender: false }, T_BP0);
    tl.fromTo(bg, { grid: 0.25 }, { grid: 0, duration: 0.45, ease: 'sine.inOut', immediateRender: false }, T_M0);

    // ------------------------------------------------------------------ CSS local
    h.el('style', {
      html: `
      [data-scene="${SID}"] .s02-layer { position:absolute; left:0; top:0; width:1920px; height:1080px; }
      [data-scene="${SID}"] .s02-giram { color: #C4B5FD; }
      [data-scene="${SID}"] .s02-range { color: #E249B0; }
      /* máscaras ampliadas embaixo (.28em): descendentes/cedilhas (g, ç, ';') não são cortadas enquanto a entrada
         desacelera nem quando 'range' treme. Sem acentos em caixa alta nesta cena: o topo fica como está (as saídas
         para cima continuam escondendo tudo com −110 %). */
      [data-scene="${SID}"] .line-mask { padding-bottom: 0.28em; margin-bottom: -0.28em; }
    `,
    }, root);
    // Deslocamento inicial que esconde o texto por inteiro abaixo da máscara ampliada:
    //  palavras (altura .98em): topo da tinta ≥ .12em abaixo do topo da linha → (0,98 + 0,28 − 0,12)/0,98 = 116 % → 125 %
    //  chars de <em> (altura .98em + padding .08em = 1,06em): (1,26 − 0,12)/1,06 = 108 % → 120 %
    const Y_IN = 125, Y_IN_EM = 120;

    // ------------------------------------------------------------------ camadas
    const back = h.canvas(root);                                     // metade de trás da órbita / Ponto atrás de 'giram' / rastro
    const svg = h.svg('svg', { class: 'fill', viewBox: '0 0 1920 1080', width: 1920, height: 1080 }, root);
    const textLayer = h.el('div', { cls: 's02-layer' }, root);
    const front = h.canvas(root);                                    // metade da frente, faíscas, Ponto
    const cb = back.ctx, cf = front.ctx;

    // ------------------------------------------------------------------ eyebrow (continuidade S01 → S03, estático)
    // A S01 entrega o eyebrow dividido em chars (digitação) e a S03 o recebe inteiro: as duas versões
    // diferem em sub-pixel. Começa com a versão dividida (idêntica à S01) e troca pela inteira (idêntica à S03)
    // no tranco de 4,0, quando o root inteiro treme.
    const ebA = h.eyebrow('O PROBLEMA', { x: 192, y: 120, anchor: 'cl', parent: textLayer });
    h.split(ebA.querySelector('.lbl'), { type: 'chars' });
    const ebB = h.eyebrow('O PROBLEMA', { x: 192, y: 120, anchor: 'cl', parent: textLayer });
    gsap.set(ebB, { opacity: 0 });
    tl.set(ebA, { opacity: 0 }, T_JOLT);
    tl.set(ebB, { opacity: 1 }, T_JOLT);

    // ------------------------------------------------------------------ texto
    const baselineOf = (elm) => {
      const pr = h.el('span', { style: { display: 'inline-block', width: '0px', height: '0px', verticalAlign: 'baseline' } }, elm);
      const y = h.rect(pr).y; pr.remove(); return y;
    };
    // posiciona pela linha de base medida DEPOIS do split (sonda dentro da linha)
    const placeBaseline = (elm, sp, target) => {
      const cur = baselineOf(sp.lines[0]);
      elm.style.top = (parseFloat(elm.style.top || '0') + (target - cur)) + 'px';
    };

    // Bloco A
    const blockA = h.el('div', { cls: 's02-layer' }, textLayer);
    // só a palavra leva a cor: ';' e '.' ficam em ink (o '.' rosa competia com o Ponto-como-ponto-final)
    const lA1 = h.text('Algumas <span class="s02-giram">giram</span>;', { x: 192, y: 0, size: 150, color: P.ink, nowrap: true, parent: blockA });
    const lA2 = h.text('a maioria <span class="s02-range">range</span>.', { x: 192, y: 0, size: 150, color: P.ink, nowrap: true, parent: blockA });
    const spA1 = h.split(lA1, { type: 'lines,words,chars', mask: 'lines' });
    const spA2 = h.split(lA2, { type: 'lines,words,chars', mask: 'lines' });
    placeBaseline(lA1, spA1, 430);
    placeBaseline(lA2, spA2, 610);

    // Bloco B
    const blockB = h.el('div', { cls: 's02-layer' }, textLayer);
    const lB1 = h.text('Não falta esforço —', { x: 192, y: 0, size: 96, color: P.ink, nowrap: true, parent: blockB });
    const lB2 = h.text('falta', { x: 192, y: 0, size: 96, color: P.ink, nowrap: true, parent: blockB });
    const lB3 = h.text('<em>engenharia.</em>', { x: 192, y: 0, size: 220, nowrap: true, parent: blockB });
    const spB1 = h.split(lB1, { type: 'lines,words', mask: 'lines' });
    const spB2 = h.split(lB2, { type: 'lines,words', mask: 'lines' });
    const spB3 = h.split(lB3, { type: 'lines,chars', mask: 'lines' });
    placeBaseline(lB1, spB1, 380);
    placeBaseline(lB2, spB2, 500);
    placeBaseline(lB3, spB3, 760);

    // medidas (antes de qualquer transform)
    const union = (els) => {
      const rs = els.map(e => h.rect(e));
      const x0 = Math.min(...rs.map(r => r.x)), x1 = Math.max(...rs.map(r => r.right));
      return { x: x0, right: x1, w: x1 - x0 };
    };
    const giramChars = [...lA1.querySelectorAll('.s02-giram .char')];   // g i r a m
    const rangeChars = [...lA2.querySelectorAll('.s02-range .char')];   // r a n g e
    const mc = document.createElement('canvas').getContext('2d');
    // órbita de 'giram': centro no bbox (tinta) da palavra, rx = largura/2 + 16, ry 108, −6°
    // (revisão: com rx = largura/2 + 48 / ry 78 as pontas pousavam no ';' e logo depois de 'Algumas' → 'giram;:' /
    //  'Algumas.'). Mais alta e mais estreita: a metade da frente passa abaixo das descendentes, a de trás acima do pingo do 'i'.
    // 2ª revisão: com centro no bbox e ry 100 o arco de cima (baixado à esquerda pela rotação de −6°) passava a 5–7 px do
    // pingo do 'i' (≈1,83–1,90: 'gïram'). Centro 8 px acima e ry +8: o ponto mais baixo da elipse não muda (folga de
    // 'range' e das descendentes igual), o arco de cima sobe 16 px → ≥ 18 px de folga (borda a borda) do pingo do 'i'.
    const ORB_RY = 108, ORB_DY = 8;
    let ORB = { cx: 1002, cy: 391 - ORB_DY, rx: 209, ry: ORB_RY };
    try {
      const u = union(giramChars);
      mc.font = '700 150px "Space Grotesk"';
      const m = mc.measureText('giram');
      const cy = 430 + (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2;
      if (isFinite(u.x) && u.w > 100 && isFinite(cy)) ORB = { cx: u.x + u.w / 2, cy: cy - ORB_DY, rx: u.w / 2 + 16, ry: ORB_RY };
    } catch (e) { /* fallback */ }
    const ROT = -6 * DEG;
    // Oclusor = a linha 'Algumas giram;' como uma placa: caixas de TINTA de cada glifo (+ o vão entre palavras, na
    // altura-x). Com o ';' colado ao 'm', as pontas da elipse cruzam a linha de texto de qualquer jeito: nessas
    // passagens o Ponto vai POR TRÁS da linha (canvas de trás, com fade), nunca vira pontuação ao lado de um glifo.
    // Coordenadas sem o push (o Ponto é levado de volta ao espaço sem escala antes do teste).
    const OCC = [];
    try {
      mc.font = '700 150px "Space Grotesk"';
      const xh = mc.measureText('x').actualBoundingBoxAscent;
      let prev = null;
      spA1.chars.forEach((c) => {
        const ch = c.textContent;
        if (!ch.trim()) return;
        const rc = h.rect(c), m = mc.measureText(ch);
        // o pingo do 'i' não conta: é uma marca pequena e solta que o Ponto só sobrevoa (contá-lo fazia o Ponto piscar)
        const asc = /[ij]/.test(ch) ? xh : m.actualBoundingBoxAscent;
        const b = { x0: rc.x - m.actualBoundingBoxLeft, x1: rc.x + m.actualBoundingBoxRight, y0: 430 - asc, y1: 430 + m.actualBoundingBoxDescent };
        if (!(isFinite(b.x0) && isFinite(b.x1) && isFinite(b.y0) && isFinite(b.y1))) return;
        if (prev && b.x0 - prev.x1 > 6) OCC.push({ x0: prev.x1, x1: b.x0, y0: 430 - xh, y1: 430 });   // espaço entre palavras
        OCC.push(b); prev = b;
      });
    } catch (e) { /* sem oclusor: o Ponto só usa a profundidade */ }

    // '.' de 'engenharia.' é transparente: o Ponto ocupa o lugar dele
    const dotChar = spB3.chars[spB3.chars.length - 1];
    let DOT = { x: 1342, y: 742 };
    try {
      const rc = h.rect(dotChar);
      mc.font = '700 220px "Space Grotesk"';
      const m = mc.measureText('.');
      const cx = rc.x + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
      const cy = 760 + (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2;
      if (dotChar.textContent.trim() === '.' && isFinite(cx) && isFinite(cy) && cx > 1100 && cx < 1500) DOT = { x: cx, y: cy };
    } catch (e) { /* fallback */ }
    dotChar.style.opacity = '0';

    // shimmer do gradiente em 'engenharia.': faixa clara que atravessa a palavra (background-position via --s02sh)
    // (o SplitText clona o <em>; a variável do shimmer vai no contêiner, herdada por todos os chars)
    const emEl = lB3;
    const emW = union(spB3.chars).w;
    const SHW = 520;
    spB3.chars.forEach((c, i) => {
      if (c === dotChar) { c.style.backgroundImage = 'none'; return; }
      const img = c.style.backgroundImage, size = c.style.backgroundSize, pos = c.style.backgroundPosition;
      if (!img || img === 'none') return;
      const off = parseFloat(pos) || 0;   // já negativo
      const wEm = (size.split(' ')[0]) || `${emW}px`;
      // altura 100% (inclui o padding-bottom): o fixGradient usa a altura da caixa e cortava o descendente do 'g'
      c.style.backgroundImage = `linear-gradient(100deg, rgba(251,248,255,0) 0%, rgba(251,248,255,0) 38%, rgba(251,248,255,0.62) 50%, rgba(251,248,255,0) 62%, rgba(251,248,255,0) 100%), ${img}`;
      c.style.backgroundSize = `${SHW}px 100%, ${wEm} 100%`;
      c.style.backgroundPosition = `calc(var(--s02sh, -9999px) + ${off}px) 0px, ${pos}`;
      c.style.backgroundRepeat = 'no-repeat, no-repeat';
    });
    emEl.style.setProperty('--s02sh', `${-SHW - 40}px`);

    // ------------------------------------------------------------------ BLOCO A: entradas, rangidos, desabamento
    const PUSHA_O = { x: 192, y: 520 }, PUSHB_O = { x: 192, y: 620 };
    const pushA = (lt) => 1 + 0.02 * seg(lt, 0, T_FALL);
    const pushB = (lt) => 1 + 0.02 * seg(lt, T_PUSHB0, T_PUSHB1);
    tl.fromTo(blockA, { scale: 1, transformOrigin: `${PUSHA_O.x}px ${PUSHA_O.y}px` }, { scale: 1.02, duration: T_FALL, ease: 'none' }, 0);

    // pontuação solta (';' '.') vira "palavra" própria no split: entra junto com a palavra anterior
    const wordGroups = (words) => { let g = -1; return words.map((w) => { if (!/^[;.,:!?]+$/.test(w.textContent.trim())) g++; return Math.max(0, g); }); };
    const gA1 = wordGroups(spA1.words), gA2 = wordGroups(spA2.words);
    tl.fromTo(spA1.words, { yPercent: Y_IN }, { yPercent: 0, duration: 0.5, ease: 'mecca.out', stagger: (i) => 0.08 * gA1[i] }, 0);
    tl.fromTo(spA2.words, { yPercent: Y_IN }, { yPercent: 0, duration: 0.25, ease: 'expo.out', stagger: (i) => 0.03 * gA2[i] }, T_LOCK);
    // opacidade curta no começo da máscara: o pingo do 'i' de 'giram' (acima da altura-x, sem ascendentes
    // vizinhos) nunca aparece sozinho sob a linha. (Linha 2, expo.out, passa por essa janela em < ½ quadro.)
    tl.fromTo(spA1.words, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power2.in', stagger: (i) => 0.08 * gA1[i] }, 0);

    // os chars de 'range' tremem ±6 px / ±4° a cada rangido (mesma duração dos keyframes das engrenagens)
    RATTLES.forEach((tr, k) => {
      const r = h.rng(40 + k);
      rangeChars.forEach((c) => {
        const ay = (r() < 0.5 ? -1 : 1) * (3 + 3 * r());
        const ar = (r() < 0.5 ? -1 : 1) * (2 + 2 * r());
        tl.to(c, {
          keyframes: [
            { y: ay, rotation: ar, duration: 0.035, ease: 'sine.out' },
            { y: -0.6 * ay, rotation: -0.6 * ar, duration: 0.035, ease: 'sine.inOut' },
            { y: 0.35 * ay, rotation: 0.35 * ar, duration: 0.035, ease: 'sine.inOut' },
            { y: 0, rotation: 0, duration: 0.035, ease: 'sine.in' },
          ],
        }, tr);
      });
    });

    // 3,5–3,8: os chars DESABAM (y +80, ±20° via h.rng(2), power2.in, stagger .01) — as duas linhas juntas
    const masksA = [...lA1.querySelectorAll('.line-mask'), ...lA2.querySelectorAll('.line-mask')];
    tl.set(masksA, { overflow: 'visible' }, T_FALL);
    {
      const r = h.rng(2);
      [spA1.chars, spA2.chars].forEach((chars) => {
        const rot = chars.map(() => (r() < 0.5 ? -1 : 1) * (10 + 10 * r()));
        const dx = chars.map(() => (r() - 0.5) * 16);
        tl.fromTo(chars, { y: 0, x: 0, rotation: 0, opacity: 1 }, {
          y: 80, x: (i) => dx[i], rotation: (i) => rot[i], opacity: 0,
          duration: 0.24, ease: 'power2.in', stagger: 0.01, immediateRender: false,
        }, T_FALL);
      });
    }

    // ------------------------------------------------------------------ BLOCO B
    tl.fromTo(spB1.words, { yPercent: Y_IN }, { yPercent: 0, duration: 0.4, ease: 'mecca.out', stagger: 0.04 }, T_JOLT);
    tl.fromTo(spB2.words, { yPercent: Y_IN }, { yPercent: 0, duration: 0.4, ease: 'mecca.out' }, T_LAND);
    // 'engenharia.' nasce do '.' para a esquerda: o 'a' vizinho do Ponto sobe no pouso (4,5) e a onda corre até o 'e'
    // (o '.' é transparente e fica fora da onda)
    const engChars = spB3.chars.filter(c => c !== dotChar);
    tl.fromTo(engChars, { yPercent: Y_IN_EM }, { yPercent: 0, duration: 0.35, ease: 'expo.out', stagger: { each: 0.02, from: 'end' } }, T_LAND);
    tl.fromTo(engChars, { opacity: 0 }, { opacity: 1, duration: 0.06, ease: 'power2.in', stagger: { each: 0.02, from: 'end' } }, T_LAND);
    tl.fromTo(blockB, { scale: 1, transformOrigin: `${PUSHB_O.x}px ${PUSHB_O.y}px` }, { scale: 1.02, duration: T_PUSHB1 - T_PUSHB0, ease: 'none' }, T_PUSHB0);
    tl.fromTo(emEl, { '--s02sh': `${-SHW - 40}px` }, { '--s02sh': `${emW + 40}px`, duration: 1.3, ease: 'sine.inOut', immediateRender: false }, 6.0);
    // saída 7,40–7,65 (mecca.in): some antes de o contorno do morph alcançar a área do texto
    tl.fromTo(spB1.words, { yPercent: 0 }, { yPercent: -110, duration: 0.2, ease: 'mecca.in', stagger: 0.012, immediateRender: false }, T_TXO);
    tl.fromTo(spB2.words, { yPercent: 0 }, { yPercent: -110, duration: 0.2, ease: 'mecca.in', immediateRender: false }, T_TXO + 0.01);
    tl.fromTo(spB3.chars, { yPercent: 0 }, { yPercent: -110, duration: 0.2, ease: 'mecca.in', stagger: 0.004, immediateRender: false }, T_TXO + 0.01);

    // ------------------------------------------------------------------ engrenagens (SVG)
    const GC = [{ x: 1600, y: 300, disc: P.magenta }, { x: 1600, y: 480, disc: P.lavender }];
    const CONTACT = { x: 1600, y: 390 };
    const defs = h.svg('defs', {}, svg);
    const fillLayer = h.svg('g', {}, svg);
    const discLayer = h.svg('g', {}, svg);
    const lensLayer = h.svg('g', {}, svg);
    const strokeLayer = h.svg('g', {}, svg);
    const bpLayer = h.svg('g', {}, svg);
    const finalLayer = h.svg('g', {}, svg);
    const GEAR = { teeth: 12, r: 100, depth: 0.2, hole: 0.22 };
    const dFill = h.gearPath(GEAR);                        // com furo (evenodd)
    const dStroke = h.gearPath(Object.assign({}, GEAR, { hole: 0 }));   // contorno externo: é o que vira caixa
    const gears = GC.map((c) => {
      const fillG = h.svg('g', {}, fillLayer);
      const fillP = h.svg('path', { d: dFill, fill: P.bg2, 'fill-opacity': 0, 'fill-rule': 'evenodd' }, fillG);
      const disc = h.svg('circle', { cx: c.x, cy: c.y, r: 14, fill: c.disc }, discLayer);
      const strokeG = h.svg('g', {}, strokeLayer);
      // stroke-width / stroke-opacity / stroke-dasharray: calculados em onFrame a partir de lt (nada de tween de attr
      // que, no rewind, voltava a valores "pré-tween" inexistentes e apagava o contorno). Valores iniciais explícitos.
      const strokeP = h.svg('path', { d: dStroke, fill: 'none', stroke: P.lavender, 'stroke-width': 2.5, 'stroke-opacity': 1, 'stroke-dasharray': 'none', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke', opacity: 0 }, strokeG);
      const hole = h.svg('circle', { cx: 0, cy: 0, r: GEAR.r * GEAR.hole, fill: 'none', stroke: P.lavender, 'stroke-width': 2.5, 'vector-effect': 'non-scaling-stroke', opacity: 0 }, strokeG);
      return { c, fillG, fillP, disc, strokeG, strokeP, hole };
    });

    // escala dos discos → engrenagens (.14 → 1, mecca.back; G2 +0,1 s)
    const GS = { s0: 0.14, s1: 0.14 };
    tl.fromTo(GS, { s0: 0.14 }, { s0: 1, duration: 0.5, ease: 'mecca.back' }, 0);
    tl.fromTo(GS, { s1: 0.14 }, { s1: 1, duration: 0.5, ease: 'mecca.back' }, 0.1);
    gears.forEach((g, i) => {
      const t0 = i * 0.1;
      tl.fromTo(g.disc, { attr: { r: 14 }, opacity: 1 }, { attr: { r: 7 }, opacity: 0, duration: 0.3, ease: 'power2.in' }, t0 + 0.02);
      tl.fromTo(g.strokeP, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' }, t0);
      tl.fromTo(g.hole, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out' }, t0 + 0.05);
      tl.fromTo(g.fillP, { attr: { 'fill-opacity': 0 } }, { attr: { 'fill-opacity': 0.85 }, duration: 0.3, ease: 'power1.out' }, t0);
    });

    // rotação (graus) — função pura de lt
    const kf = (t, t0, vals, segd) => {
      const u = (t - t0) / segd;
      if (u < 0 || u >= vals.length) return 0;
      const i = Math.floor(u), f = u - i;
      const a = i === 0 ? 0 : vals[i - 1], b = vals[i];
      return a + (b - a) * f * f * (3 - 2 * f);
    };
    const osc = (t, f1, f2) => 0.6 * Math.sin(TAU * f1 * t) + 0.4 * Math.sin(TAU * f2 * t + 0.7);
    const theta1Base = (t) => (t < T_LOCK ? 120 * t : 60 + 14 * p3Out(seg(t, T_LOCK, T_LOCK + 0.35)));   // 120°/s → desacelera até 0 (velocidade contínua)
    const slip = (t) => 7 * backOut(seg(t, T_LOCK, T_LOCK + 0.2));                                        // G2 7° fora de fase
    const shakeDeg = (t) => {
      let d = 0;
      for (const tr of RATTLES) d += kf(t, tr, [5, -3, 2, 0], 0.035);
      d += kf(t, T_JOLT, [9, -6, 4, -2, 0], 0.05);
      d += 0.45 * osc(t, 9.1, 13.7) * sm(0.85, 1.0, t) * (1 - sm(5.8, 6.0, t));        // tensão contínua (travadas)
      d += 1.5 * osc(t, 7.3, 12.1) * sm(6.0, 6.1, t) * (1 - sm(7.3, T_M0, t));         // vibração ±1,5°
      return d;
    };
    const TH1_END = 74, TH2_END = 15 - 74 + 7;                       // 74° e −52° em 7,45
    const SNAP1 = Math.round(TH1_END / 30) * 30, SNAP2 = Math.round(TH2_END / 30) * 30;   // 60° e −60°
    // a engrenagem tem simetria de 30°: exibir θ − SNAP é idêntico e termina em 0 (retângulo alinhado)
    function gearAngles(t) {
      const b1 = theta1Base(t), b2 = 15 - b1 + slip(t);
      const s = shakeDeg(t);
      let a1 = b1 + s - SNAP1, a2 = b2 - s - SNAP2;
      if (t >= T_M0) { const k = 1 - p3Out(seg(t, T_M0, T_M0 + 0.25)); a1 = (TH1_END - SNAP1) * k; a2 = (TH2_END - SNAP2) * k; }
      return [a1, a2];
    }

    // ------------------------------------------------------------------ lente de interferência (entre fill e contorno)
    const LX = Math.sqrt(100 * 100 - 90 * 90);
    const lensD = `M${1600 - LX} 390 A100 100 0 0 0 ${1600 + LX} 390 A100 100 0 0 0 ${1600 - LX} 390 Z`;
    const hatchId = h.uid('s02hatch');
    const hp = h.svg('pattern', { id: hatchId, patternUnits: 'userSpaceOnUse', width: 5, height: 5, patternTransform: 'rotate(45)' }, defs);
    h.svg('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: P.pink, 'stroke-width': 1, 'stroke-opacity': 0.55 }, hp);
    const lensG = h.svg('g', { opacity: 0 }, lensLayer);
    const lensFill = h.svg('path', { d: lensD, fill: P.pink, 'fill-opacity': 0.25 }, lensG);
    h.svg('path', { d: lensD, fill: `url(#${hatchId})` }, lensG);
    h.svg('path', { d: lensD, fill: 'none', stroke: P.pink, 'stroke-width': 1, 'stroke-opacity': 0.8 }, lensG);
    gsap.set(lensG, { svgOrigin: '1600 390' });   // origem fixada uma vez (re-parse no tween dava 1599,99997 conforme o histórico)
    tl.fromTo(lensG, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'mecca.out' }, T_LENS);
    [6.0, 6.5, 7.0].forEach((b) => {
      tl.fromTo(lensFill, { attr: { 'fill-opacity': 0.25 } }, { attr: { 'fill-opacity': 0.45 }, duration: 0.07, ease: 'power2.out', immediateRender: false }, b);
      tl.fromTo(lensFill, { attr: { 'fill-opacity': 0.45 } }, { attr: { 'fill-opacity': 0.25 }, duration: 0.38, ease: 'sine.inOut', immediateRender: false }, b + 0.07);
    });
    tl.fromTo(lensG, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: 'power1.inOut', immediateRender: false }, T_M0);

    // ------------------------------------------------------------------ planta técnica (hairlines lavanda)
    const BP = 'rgba(167,139,250,0.5)';
    const bpG = h.svg('g', {}, bpLayer);
    const pitch = GC.map((c, i) => {
      const mid = h.uid('s02pm');
      const m = h.svg('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1920, height: 1080 }, defs);
      // a "caneta" parte do ponto de engrenamento: G1 de baixo (90°), G2 de cima (−90°)
      const mcirc = h.svg('circle', { cx: c.x, cy: c.y, r: 90, fill: 'none', stroke: '#fff', 'stroke-width': 8, transform: `rotate(${i === 0 ? 90 : -90} ${c.x} ${c.y})` }, m);
      const dc = h.svg('circle', { cx: c.x, cy: c.y, r: 90, fill: 'none', stroke: BP, 'stroke-width': 1, 'stroke-dasharray': '4 6', mask: `url(#${mid})` }, bpG);
      return { mcirc, dc };
    });
    pitch.forEach((p, i) => {
      tl.fromTo(p.mcirc, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.5, ease: 'mecca.inOut' }, T_BP0);
      // tracejado "gira" com a engrenagem (sentidos opostos)
      tl.fromTo(p.dc, { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': i === 0 ? -30 : 30 }, duration: T_M0 + 0.3 - T_BP0, ease: 'none' }, T_BP0);
    });
    const cLine = h.svg('line', { x1: 1600, y1: 300, x2: 1600, y2: 480, stroke: BP, 'stroke-width': 1 }, bpG);
    const ticks = [330, 360, 390, 420, 450].map((y) => {
      const hw = y === 390 ? 12 : 7;
      return h.svg('line', { x1: 1600 - hw, y1: y, x2: 1600 + hw, y2: y, stroke: BP, 'stroke-width': 1 }, bpG);
    });
    const cross = [];
    GC.forEach((c) => {
      cross.push(h.svg('line', { x1: c.x - 18, y1: c.y, x2: c.x + 18, y2: c.y, stroke: BP, 'stroke-width': 1 }, bpG));
      cross.push(h.svg('line', { x1: c.x, y1: c.y - 18, x2: c.x, y2: c.y + 18, stroke: BP, 'stroke-width': 1 }, bpG));
    });
    const crossRings = GC.map((c) => h.svg('circle', { cx: c.x, cy: c.y, r: 5, fill: 'none', stroke: BP, 'stroke-width': 1 }, bpG));
    // anel de detalhe (callout) em volta da zona de interferência
    const callout = h.svg('circle', { cx: CONTACT.x, cy: CONTACT.y, r: 58, fill: 'none', stroke: P.pink, 'stroke-opacity': 0.5, 'stroke-width': 1, transform: `rotate(180 ${CONTACT.x} ${CONTACT.y})` }, bpG);
    tl.fromTo(callout, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.45, ease: 'mecca.inOut' }, T_LENS);
    tl.fromTo(cLine, { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 0.4, ease: 'mecca.out' }, T_BP1);
    tl.fromTo(ticks, { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 0.25, ease: 'mecca.out', stagger: { each: 0.04, from: 'center' } }, T_BP1 + 0.06);
    tl.fromTo(cross, { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 0.35, ease: 'mecca.out', stagger: 0.03 }, T_BP1);
    tl.fromTo(crossRings, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.35, ease: 'mecca.out' }, T_BP1 + 0.1);
    tl.fromTo(bpG, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: 'power1.inOut', immediateRender: false }, T_M0);

    // ------------------------------------------------------------------ MORPH: engrenagens → as duas caixas
    // Morph por pontos correspondentes (controle total da topologia): os dentes recolhem para o
    // círculo primitivo (0,2 s) enquanto o contorno cresce até a caixa (0,5 s, mecca.inOut).
    const BOX = [{ x0: 192, x1: 946 }, { x0: 972, x1: 1726 }].map(b => Object.assign(b, { y0: 250, y1: 850, r: 28 }));
    // mesma construção de caminho da S03 (início em (x+r, y), sentido horário) → tracejado idêntico no corte
    const rr = (x, y, w, hh, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + hh - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + hh}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + hh - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
    const finals = BOX.map(b => h.svg('path', {
      d: rr(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, b.r), fill: 'none',
      stroke: 'rgba(167,139,250,0.3)', 'stroke-width': 1.5, 'stroke-dasharray': '8 10', 'vector-effect': 'non-scaling-stroke', opacity: 0,
    }, finalLayer));
    // correspondência por DIREÇÃO: amostra k em θk = φ + 2πk/N, a partir do centro da engrenagem (contorno
    // dentado → círculo primitivo) e do centro da caixa (retângulo arredondado). φ = direção do início da caixa,
    // então a amostra 0 cai exatamente no início do caminho canônico (x+r, y).
    const NM = 720;
    const G_STEP = TAU / GEAR.teeth, G_RI = GEAR.r * (1 - GEAR.depth), G_RO = GEAR.r, G_TIP = 0.3, G_BASE = 0.54;
    const gv = [0.5 * (1 - G_BASE), 0.5 * (1 - G_TIP), 0.5 * (1 + G_TIP), 0.5 * (1 + G_BASE)].map(f => f * G_STEP);
    const segR = (th, a0, r0, a1, r1) => {   // raio do segmento reto (a0,r0)→(a1,r1) na direção th
      const P0x = Math.cos(a0) * r0, P0y = Math.sin(a0) * r0, Vx = Math.cos(a1) * r1 - P0x, Vy = Math.sin(a1) * r1 - P0y;
      const dx = Math.cos(th), dy = Math.sin(th);
      const s2 = -(dx * P0y - dy * P0x) / (dx * Vy - dy * Vx);
      return Math.hypot(P0x + s2 * Vx, P0y + s2 * Vy);
    };
    function gearR(th) {           // raio do contorno de h.gearPath (mesmos parâmetros) na direção th
      const v = (((th + G_STEP / 2) % G_STEP) + G_STEP) % G_STEP;
      if (v < gv[0] || v >= gv[3]) return G_RI;
      if (v < gv[1]) return segR(v, gv[0], G_RI, gv[1], G_RO);
      if (v < gv[2]) return G_RO;
      return segR(v, gv[2], G_RO, gv[3], G_RI);
    }
    function boxR(th, hw, hh, r) {  // raio do retângulo arredondado (centrado na origem) na direção th
      const dx = Math.cos(th), dy = Math.sin(th);
      const t0 = Math.min(hw / Math.max(Math.abs(dx), 1e-9), hh / Math.max(Math.abs(dy), 1e-9));
      const px = t0 * dx, py = t0 * dy;
      if (Math.abs(px) > hw - r && Math.abs(py) > hh - r) {
        const cx = Math.sign(px) * (hw - r), cy = Math.sign(py) * (hh - r);
        const dc = dx * cx + dy * cy;
        return dc + Math.sqrt(Math.max(0, dc * dc - (cx * cx + cy * cy) + r * r));
      }
      return t0;
    }
    const MORPH = gears.map((g, i) => {
      const b = BOX[i], c = GC[i];
      const hw = (b.x1 - b.x0) / 2, hh = (b.y1 - b.y0) / 2;
      const bcx = b.x0 + hw - c.x, bcy = b.y0 + hh - c.y;          // centro da caixa em coords. locais
      const phi = Math.atan2(-hh, (b.r - hw));                     // direção de (x0+r, y0) vista do centro da caixa
      const th = [], box = [];
      for (let k = 0; k < NM; k++) {
        const a = phi + TAU * k / NM;
        const rb = boxR(a, hw, hh, b.r);
        th.push(a); box.push([Math.cos(a) * rb, Math.sin(a) * rb]);   // relativo ao centro da caixa
      }
      return { th, box, bcx, bcy, state: 'gear' };
    });
    // Progresso do morph separado em 3 eixos (validado numericamente: as duas formas intermediárias nunca se
    // cruzam depois que os dentes recolhem, e só alcançam a área do texto ≈7,69, quando ele já saiu):
    //  cx — deslocamento horizontal do centro (mecca.inOut): as formas primeiro se afastam lado a lado;
    //  cy — deslocamento vertical, atrasado (cx²): G1 desliza para a esquerda antes de descer;
    //  s  — forma/tamanho (círculo → caixa), só cresce quando a separação horizontal já comporta a largura.
    const M_A = 0.23;
    const sineIO = E('sine.inOut');
    function morphE(lt) {
      const u = seg(lt, T_M0, T_M1);
      const cx = mInOut(u);
      return { u, et: p3Out(seg(lt, T_M0, T_M0 + 0.2)), cx, cy: cx * cx, s: Math.pow(clamp((cx - M_A) / (1 - M_A)), 1.3) };
    }
    function morphD(M, e, rdeg) {
      const R = rdeg * DEG, ox = M.bcx * e.cx, oy = M.bcy * e.cy;
      let d = '';
      for (let k = 0; k < NM; k++) {
        const a = M.th[k];
        const rg = lerp(gearR(a - R), 90, e.et);
        const x = ox + lerp(Math.cos(a) * rg, M.box[k][0], e.s), y = oy + lerp(Math.sin(a) * rg, M.box[k][1], e.s);
        d += (k ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
      }
      return d + 'Z';
    }
    gears.forEach((g, i) => {
      tl.fromTo(g.fillP, { attr: { 'fill-opacity': 0.85 } }, { attr: { 'fill-opacity': 0 }, duration: 0.2, ease: 'power1.inOut', immediateRender: false }, T_M0);
      tl.fromTo(g.hole, { opacity: 1, attr: { r: 22 } }, { opacity: 0, attr: { r: 8 }, duration: 0.22, ease: 'mecca.in', immediateRender: false }, T_M0);
      // troca pelo caminho canônico (mesma geometria) — último quadro limpo para a S03
      tl.set(g.strokeP, { opacity: 0 }, T_M1);
      tl.set(finals[i], { opacity: 1 }, T_M1);
    });

    // ------------------------------------------------------------------ tranco
    h.shake(tl, root, T_JOLT, { amp: 3, n: 6, dur: 0.25, seed: 22 });

    // ------------------------------------------------------------------ determinismo do DOM (histórico de seek)
    // Tweens que ainda não renderizaram não tocam o estilo inline; depois de renderizados e revertidos deixam valores
    // neutros (transform: translate(0,0), opacity: 1…) que mudam o antialiasing do raster. Gravar esses valores neutros
    // já no build deixa o DOM idêntico em qualquer ordem de seek (verificado: seek(13,96)→seek(t) == seek(0)→seek(t)).
    gsap.set(root, { x: 0, y: 0 });
    gsap.set([...spA1.chars, ...spA2.chars], { x: 0, y: 0, rotation: 0, opacity: 1 });
    gsap.set(dotChar, { yPercent: 0 });
    gsap.set(ebA, { opacity: 1 });
    gsap.set(bpG, { opacity: 1 });
    gsap.set(finals, { opacity: 0 });

    // ------------------------------------------------------------------ faíscas (canvas da frente)
    const BURSTS = [
      { t: T_LOCK + 0.05, n: 3, seed: 1, r0: 14, r1: 34, life: 0.26, flash: 0.7 },
      ...RATTLES.map(t => ({ t, n: 5, seed: Math.round(t / 0.5), r0: 20, r1: 46, life: 0.3, flash: 1 })),
      { t: T_JOLT, n: 10, seed: 8, r0: 20, r1: 78, life: 0.4, flash: 1.5 },
    ].map((B) => {
      const r = h.rng(B.seed);
      B.sparks = [...Array(B.n)].map(() => {
        const side = r() < 0.5 ? 0 : Math.PI;
        return { a: side + (r() - 0.5) * 1.5, len: 0.7 + 0.3 * r(), dl: r() * 0.04 };
      });
      return B;
    });
    function drawSparks(c, lt) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (const B of BURSTS) {
        const uf = (lt - B.t) / 0.22;
        if (uf >= 0 && uf < 1) h.glowDot(c, CONTACT.x, CONTACT.y, 4 * B.flash, P.pink, 0.9 * Math.pow(1 - uf, 1.5));
        for (const s of B.sparks) {
          const u = (lt - B.t - s.dl) / B.life;
          if (u < 0 || u >= 1) continue;
          const e = p3Out(u);
          const rr = B.r0 + (B.r1 * s.len - B.r0) * e;
          const tail = Math.max(B.r0 * 0.6, rr - 16 * (1 - u) - 3);
          const ca = Math.cos(s.a), sa = Math.sin(s.a);
          const a = Math.pow(1 - u, 1.2);
          c.strokeStyle = hexA(P.pink, 0.8 * a);
          c.lineWidth = 2;
          c.lineCap = 'round';
          c.beginPath(); c.moveTo(CONTACT.x + ca * tail, CONTACT.y + sa * tail); c.lineTo(CONTACT.x + ca * rr, CONTACT.y + sa * rr); c.stroke();
          const g = c.createRadialGradient(CONTACT.x + ca * rr, CONTACT.y + sa * rr, 0, CONTACT.x + ca * rr, CONTACT.y + sa * rr, 12);
          g.addColorStop(0, hexA(P.pink, 0.45 * a)); g.addColorStop(1, hexA(P.pink, 0));
          c.fillStyle = g; c.beginPath(); c.arc(CONTACT.x + ca * rr, CONTACT.y + sa * rr, 12, 0, TAU); c.fill();
          c.fillStyle = hexA(P.ink, a);
          c.beginPath(); c.arc(CONTACT.x + ca * rr, CONTACT.y + sa * rr, 3, 0, TAU); c.fill();
        }
      }
      c.restore();
    }

    // ------------------------------------------------------------------ órbita de 'giram' + o Ponto (função pura de lt)
    const START = { x: 1000, y: 540 }, HOVER = { x: 1100, y: 640 }, END = { x: 1625, y: 690 };
    // período 2 s. Ângulo com velocidade NÃO uniforme: φ = θ + (K/2)·sen 2θ, θ = Θ0 − π·lt. Mais rápido nas pontas
    // (onde ele passa por trás da linha de texto) e mais lento em cima/embaixo: velocidade na tela quase constante
    // (sem "estacionar" nas pontas, que era o que criava a pontuação falsa). Θ0: em 0,6 o Ponto chega à órbita pela
    // frente, embaixo (φ ≈ 1,75), já andando para a direita sob 'giram' (a entrada nunca raspa no 'g').
    const ORB_K = 0.35, TH0 = 3.7246, OMEGA = -Math.PI;
    const T_ENTER = 0.6, T_COL = 0.32, T_DEP = 0.45;
    const orbitAt = (lt) => {
      const s = pushA(Math.min(lt, T_FALL));
      const k = 1 - p3In(seg(lt, T_FALL, T_FALL + T_COL));
      return { cx: PUSHA_O.x + (ORB.cx - PUSHA_O.x) * s, cy: PUSHA_O.y + (ORB.cy - PUSHA_O.y) * s, rx: ORB.rx * s * k, ry: ORB.ry * s * k, s };
    };
    const orbAng = (lt) => { const th = TH0 + OMEGA * lt; return th + 0.5 * ORB_K * Math.sin(2 * th); };
    // distância da borda de um disco (x, y, r) — em coordenadas do palco, com o push s em torno de PUSHA_O — ao oclusor
    function occGap(x, y, r, s) {
      if (!OCC.length) return 1e9;
      const ux = PUSHA_O.x + (x - PUSHA_O.x) / s, uy = PUSHA_O.y + (y - PUSHA_O.y) / s, ur = r / s;
      let best = 1e9;
      for (const b of OCC) {
        const dx = Math.max(b.x0 - ux, 0, ux - b.x1), dy = Math.max(b.y0 - uy, 0, uy - b.y1);
        const d = Math.hypot(dx, dy) - ur;
        if (d < best) best = d;
      }
      return Math.max(0, best) * s;
    }
    // px: o Ponto some ao encostar na linha de texto. À esquerda (entrada sob o 'g', vão depois de 'Algumas') fade 0–22 px.
    // À direita o vizinho é o ';': o fade começa mais longe e zera 6 px antes de encostar (6–30 px), para não sobrar um
    // quadro de Ponto semitransparente colado sob a perna do 'm' (≈0,97 / 2,97). A mistura esquerda→direita (por x, em
    // volta do centro da órbita) só acontece longe da linha de texto (folga ≥ 30 px), onde os dois fades valem 1.
    const OCC_FADE = 22, OCC_FADE_R = 30, OCC_DEAD_R = 6;
    const occW = (lt) => 1 - sm(T_FALL, T_FALL + 0.2, lt);          // o oclusor deixa de valer quando as letras desabam
    const dotAt = (lt) => { const s = pushB(lt); return { x: PUSHB_O.x + s * (DOT.x - PUSHB_O.x), y: PUSHB_O.y + s * (DOT.y - PUSHB_O.y) }; };
    const quad = (a, c, b, u) => ({ x: (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * c.x + u * u * b.x, y: (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * c.y + u * u * b.y });
    const T_FLY0 = 4.1;
    const LAND = dotAt(T_LAND);
    const C1 = { x: lerp(HOVER.x, LAND.x, 0.45), y: Math.min(HOVER.y, LAND.y) - 110 };
    const OUT0 = dotAt(T_OUT);
    const C2 = { x: lerp(OUT0.x, END.x, 0.5), y: Math.min(OUT0.y, END.y) - 120 };
    const T_OUT1 = 7.9;

    function pontoPos(lt) {
      lt = Math.max(0, lt);
      if (lt < T_FALL + T_DEP) {
        const o = orbitAt(lt), a = orbAng(lt);
        const q = h.ellipsePt(o.cx, o.cy, o.rx, o.ry, ROT, a);
        const d = Math.sin(a);
        if (lt < T_ENTER) { const e = p2InOut(lt / T_ENTER); return { x: lerp(START.x, q.x, e), y: lerp(START.y, q.y, e), depth: d * e }; }
        if (lt < T_FALL) return { x: q.x, y: q.y, depth: d };
        const e = mInOut(seg(lt, T_FALL, T_FALL + T_DEP));
        return { x: lerp(q.x, HOVER.x, e), y: lerp(q.y, HOVER.y, e), depth: d * (1 - e) };
      }
      if (lt < T_FLY0) return { x: HOVER.x, y: HOVER.y, depth: 0 };
      if (lt < T_LAND) { const q = quad(HOVER, C1, LAND, p2InOut(seg(lt, T_FLY0, T_LAND))); return { x: q.x, y: q.y, depth: 0 }; }
      if (lt < T_OUT) { const q = dotAt(lt); return { x: q.x, y: q.y, depth: 0 }; }
      const q = quad(OUT0, C2, END, mInOut(seg(lt, T_OUT, T_OUT1)));
      return { x: q.x, y: q.y, depth: 0 };
    }
    const BEATS = [5.0, 5.5, 6.0, 6.5, 7.0];
    function pontoState(lt) {
      const p = pontoPos(lt);
      let r = 10, sx = 1, sy = 1, glow = 1, alpha = 1, front = true;
      if (lt < T_FLY0) {
        r = 10 * (1 + 0.12 * p.depth);
        const u = seg(lt, T_JOLT, T_JOLT + 0.3);
        if (u > 0 && u < 1) { const w = Math.sin(Math.PI * u); r *= 1 + 0.35 * w; glow += 0.8 * w; }
      } else if (lt < T_LAND) {
        r = lerp(10, 16, p2InOut(seg(lt, T_FLY0, T_LAND)));
      } else {
        r = 16;
        const e = elastic(seg(lt, T_LAND, T_LAND + 0.4));
        sx = lerp(1.5, 1, e); sy = lerp(0.6, 1, e);
        if (lt < T_OUT) for (const b of BEATS) if (lt >= b && lt < b + 0.4) { const w = Math.sin(Math.PI * (lt - b) / 0.4); r *= 1 + 0.05 * w; glow += 0.5 * w; }
      }
      // órbita de 'giram': metade de trás (sen φ < 0) no canvas de trás, abaixo do texto, com α ×.55; nas pontas o
      // Ponto passa POR TRÁS da linha de texto (some ao encostar no oclusor — nunca fica ao lado de um glifo)
      if (lt < T_FALL + T_DEP) {
        const d = p.depth;
        const ad = d >= 0 ? 1 : lerp(1, 0.55, sm(0, 0.35, -d));
        const w = occW(lt);
        let gap = 1e9, vis = 1;
        if (w > 0) {
          const o = orbitAt(lt), kR = sm(o.cx - 40, o.cx + 60, p.x);
          gap = occGap(p.x, p.y, r, o.s);
          vis = 1 - w * (1 - sm(OCC_DEAD_R * kR, lerp(OCC_FADE, OCC_FADE_R, kR), gap));
        }
        alpha = ad * vis;
        front = d >= 0 && gap > 0.5;
      }
      return { x: p.x, y: p.y, depth: p.depth, r, sx, sy, glow, alpha, front, t: lt };
    }

    // Rastro = o MESMO cometa da S01 (fita contínua, sem contas): janela de 8 quadros a 30 fps.
    // 1) amostra densa no TEMPO (160 pontos) → 2) reamostra por COMPRIMENTO DE ARCO (1 carimbo a cada 3 px)
    // → 3) carimba discos translúcidos de raio e α decrescentes (cabeça ≈ 0,6·r → 0 na cauda), cor #C026D3 → #7C3AED.
    // O espaçamento de 3 px é muito menor que o raio: o perfil é contínuo, sem segmentos visíveis.
    const TR_M = 160, TR_WIN = 8 / 30, TR_STEP = 3, TR_MAX = 700;
    const trX = new Float64Array(TR_M + 1), trY = new Float64Array(TR_M + 1), trC = new Float64Array(TR_M + 1);
    const stX = new Float64Array(TR_MAX + 1), stY = new Float64Array(TR_MAX + 1);
    const rgbOf = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const TR_HEAD = rgbOf('#C026D3'), TR_TAIL = rgbOf('#7C3AED'), TR_HOT = rgbOf('#E249B0');
    const rgba = (c0, c1, u, a) => `rgba(${Math.round(lerp(c0[0], c1[0], u))},${Math.round(lerp(c0[1], c1[1], u))},${Math.round(lerp(c0[2], c1[2], u))},${a.toFixed(4)})`;
    function drawTrail(c, t, rr, amt) {
      for (let i = 0; i <= TR_M; i++) {
        const q = pontoPos(Math.max(0, t - (i / TR_M) * TR_WIN));
        trX[i] = q.x; trY[i] = q.y;
        trC[i] = i ? trC[i - 1] + Math.hypot(q.x - trX[i - 1], q.y - trY[i - 1]) : 0;
      }
      const Ltot = trC[TR_M];
      if (Ltot < 4) return;
      const n = Math.min(TR_MAX, Math.ceil(Ltot / TR_STEP));
      let j = 0;
      for (let k = 0; k <= n; k++) {
        const sArc = Ltot * k / n;
        while (j < TR_M - 1 && trC[j + 1] < sArc) j++;
        const sl = trC[j + 1] - trC[j];
        const f = sl > 1e-9 ? (sArc - trC[j]) / sl : 0;
        stX[k] = trX[j] + (trX[j + 1] - trX[j]) * f;
        stY[k] = trY[j] + (trY[j + 1] - trY[j]) * f;
      }
      const w0 = rr * 0.6;
      // passada larga: halo de α baixo (borda suave em volta do traço)
      for (let k = n; k >= 0; k -= 2) {
        const u = k / n, w = w0 * Math.pow(1 - u, 0.8);
        if (w < 0.3) continue;
        c.fillStyle = rgba(TR_HEAD, TR_TAIL, u, 0.045 * amt * (1 - u));
        c.beginPath(); c.arc(stX[k], stY[k], w * 2.3 + 2, 0, TAU); c.fill();
      }
      // miolo: carimbos densos que afinam e esmaecem até a cauda
      for (let k = n; k >= 0; k--) {
        const u = k / n, w = w0 * Math.pow(1 - u, 0.85);
        if (w < 0.3) continue;
        c.fillStyle = rgba(TR_HEAD, TR_TAIL, Math.pow(u, 0.8), 0.11 * amt * Math.pow(1 - u, 0.6));
        c.beginPath(); c.arc(stX[k], stY[k], w, 0, TAU); c.fill();
      }
      // fio quente perto da cabeça (rosa → magenta)
      for (let k = Math.floor(n * 0.5); k >= 0; k--) {
        const u = k / n, v = u / 0.5, w = w0 * 0.34 * (1 - v);
        if (w < 0.3) continue;
        c.fillStyle = rgba(TR_HOT, TR_HEAD, v, 0.09 * amt * (1 - v));
        c.beginPath(); c.arc(stX[k], stY[k], w, 0, TAU); c.fill();
      }
    }
    // mesmo desenho do Ponto da S01: glowDot lavanda + núcleo #FBF8FF; rastro (canvas de TRÁS, abaixo do texto) acima de 600 px/s
    function drawPonto(c, s, alpha) {
      const rr = s.r;
      if (rr < 0.05 || alpha <= 0.001) return;
      const dt = 1 / 120;
      const q = pontoPos(Math.max(0, s.t - dt));
      const vx = (s.x - q.x) / dt, vy = (s.y - q.y) / dt;
      const speed = Math.hypot(vx, vy);
      const trail = h.smooth(600, 1000, speed);
      if (trail > 0) { cb.save(); cb.globalAlpha = alpha; drawTrail(cb, s.t, rr, trail); cb.restore(); }
      const stretch = 1 + clamp(speed / 7000, 0, 0.35);
      const rot = speed > 40 ? Math.atan2(vy, vx) : 0;
      c.save();
      c.globalAlpha = alpha;
      c.translate(s.x, s.y);
      c.rotate(rot);
      c.scale(s.sx * stretch, s.sy / stretch);
      h.glowDot(c, 0, 0, rr, P.lavender, clamp(0.6 * s.glow, 0, 1));
      c.fillStyle = P.ink;
      c.beginPath(); c.arc(0, 0, rr, 0, TAU); c.fill();
      c.restore();
    }

    // órbita (hairline α .3): arco da frente no canvas da frente SÓ onde passa livre da linha de texto; o resto
    // (inclusive os trechos das pontas que cruzam 'g'/';') no canvas de trás, abaixo do texto. Metade de trás com
    // α ×.5 (transição suave pela profundidade). Desenhada em trechos contíguos agrupados por (canvas, α).
    const ORB_SEG = 144;
    function drawOrbit(lt) {
      if (lt >= T_FALL + T_COL) return;
      const o = orbitAt(lt);
      if (o.rx < 0.5) return;
      const a = 0.3 * sm(0.15, 0.65, lt) * (1 - sm(T_FALL + 0.1, T_FALL + T_COL, lt));
      if (a <= 0.001) return;
      const w = occW(lt);
      const runs = [];
      for (let k = 0; k < ORB_SEG; k++) {
        const a0 = TAU * k / ORB_SEG, a1 = TAU * (k + 1) / ORB_SEG, am = 0.5 * (a0 + a1);
        const d = Math.sin(am);
        const pm = h.ellipsePt(o.cx, o.cy, o.rx, o.ry, ROT, am);
        const clear = w <= 0 || occGap(pm.x, pm.y, 1.5, o.s) > 2;
        const fr = d > 0 && clear;
        const al = Math.round(a * (d >= 0 ? 1 : lerp(1, 0.5, sm(0, 0.3, -d))) * 400) / 400;
        const last = runs[runs.length - 1];
        if (last && last.fr === fr && last.al === al) last.a1 = a1;
        else runs.push({ fr, al, a0, a1 });
      }
      for (const R of runs) h.orbit(R.fr ? cf : cb, { cx: o.cx, cy: o.cy, rx: o.rx, ry: o.ry, rot: ROT, color: P.lavender, alpha: R.al, lineWidth: 1.5, from: R.a0, to: R.a1 });
    }

    // ponta da "caneta técnica" nos círculos primitivos enquanto desenham
    function drawPens(lt) {
      const u = seg(lt, T_BP0, T_BP0 + 0.5);
      if (u <= 0 || u >= 1) return;
      const e = mInOut(u);
      GC.forEach((c, i) => {
        const a0 = i === 0 ? Math.PI / 2 : -Math.PI / 2;
        const a = a0 + TAU * e;
        h.glowDot(cf, c.x + Math.cos(a) * 90, c.y + Math.sin(a) * 90, 2.2, P.lilac, Math.sin(Math.PI * u));
      });
    }

    // ------------------------------------------------------------------ desenho por quadro
    onFrame((lt) => {
      // engrenagens
      const [a1, a2] = gearAngles(lt);
      const sc = [GS.s0, GS.s1], an = [a1, a2];
      const me = morphE(lt);
      // traço do contorno (função pura de lt): 2,5 px α1 sólido → 1,5 px α.3 tracejado 8/10 (= caixas da S03)
      const kw = mInOut(me.u), gap = 10 * sineIO(seg(lt, T_M1 - 0.3, T_M1));
      const sw = lerp(2.5, 1.5, kw).toFixed(3), so = lerp(1, 0.3, kw).toFixed(3);
      const dash = gap > 1e-4 ? `8 ${gap.toFixed(3)}` : 'none';
      gears.forEach((g, i) => {
        const M = MORPH[i];
        // durante o morph, preenchimento e furo acompanham o centro da forma (não ficam para trás)
        const ox = lt >= T_M0 ? M.bcx * me.cx : 0, oy = lt >= T_M0 ? M.bcy * me.cy : 0;
        const tr = `translate(${GC[i].x} ${GC[i].y}) scale(${sc[i]}) rotate(${an[i]})`;
        g.fillG.setAttribute('transform', `translate(${GC[i].x + ox} ${GC[i].y + oy}) scale(${sc[i]}) rotate(${an[i]})`);
        g.strokeP.setAttribute('stroke-width', sw);
        g.strokeP.setAttribute('stroke-opacity', so);
        g.strokeP.setAttribute('stroke-dasharray', dash);
        g.hole.setAttribute('cx', ox.toFixed(2));
        g.hole.setAttribute('cy', oy.toFixed(2));
        if (lt >= T_M0) {
          // no morph a rotação residual vai "assada" nos pontos (a caixa nunca gira)
          g.strokeG.setAttribute('transform', `translate(${GC[i].x} ${GC[i].y})`);
          g.strokeP.setAttribute('d', morphD(M, me, an[i]));
          M.state = 'morph';
        } else {
          g.strokeG.setAttribute('transform', tr);
          if (M.state !== 'gear') { g.strokeP.setAttribute('d', dStroke); M.state = 'gear'; }
        }
      });

      cb.clearRect(0, 0, 1920, 1080);
      cf.clearRect(0, 0, 1920, 1080);
      drawOrbit(lt);
      drawSparks(cf, lt);
      drawPens(lt);

      // Ponto: canvas de trás (abaixo do texto) na metade de trás da órbita e ao cruzar a linha de texto
      const s = pontoState(lt);
      drawPonto(s.front ? cf : cb, s, s.alpha);
    });

    // ------------------------------------------------------------------ som
    cue(0, 'whoosh', 'discos viram engrenagens', 0.3);
    cue(0.5, 'glitch', 'trava', 0.4);
    cue(1.0, 'glitch', 'rangido', 0.25);
    cue(1.5, 'click', 'rangido', 0.35);
    cue(2.0, 'glitch', 'rangido', 0.25);
    cue(2.5, 'click', 'rangido', 0.35);
    cue(3.0, 'glitch', 'rangido', 0.25);
    cue(3.5, 'whoosh', 'letras desabam', 0.3);
    cue(4.0, 'impact', 'esforço', 0.5);
    cue(4.0, 'glitch', 'esforço', 0.5);
    cue(4.5, 'click', 'Ponto pousa', 0.6);
    cue(5.0, 'tick', 'caneta técnica', 0.4);
    cue(5.5, 'tick', 'caneta técnica', 0.3);
    cue(7.75, 'whoosh', 'morph', 0.5);
  },
});
})();
