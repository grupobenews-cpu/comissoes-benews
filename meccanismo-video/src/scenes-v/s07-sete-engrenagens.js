(() => {
/*
 * S07 (VERTICAL 1080×1920) — Uma máquina. Sete engrenagens. Um só mecanismo.  (global 54–76 s, D = 22 s, tail 0)
 *
 * Mesma timeline, easings e cues da horizontal (src/scenes/s07-sete-engrenagens.js); só muda a composição
 * (storyboard/vertical/VERTICAL_SPEC.md §2 · S07):
 *
 * 0,0–1,5   o círculo da S06 (540,1100) r300 viaja para a direita e cresce: vira a engrenagem gigante
 *           recortada pela DIREITA, centro (1320,1100), raio primitivo 579,3 (gs 1,4446); o Ponto estaciona em (676,1100).
 * 2–14      7 estações: a engrenagem gira 51,43° e empurra a coluna de texto 520 px para cima (cremalheira vertical);
 *           o bloco ativo tem topo em y 963 e o anterior fica em 443 (α .55); os chips saem do Ponto.
 * 16–18     recuo: a engrenagem vira o SOL do planetário (máquina-base m 1,1 em (540,1150)).
 * 18–21,5   tudo engrena; o Ponto orbita r 429. "Uma máquina. / Sete engrenagens. / Um só mecanismo." no topo.
 * 21,5–22   a máquina vai para (540,1180) m .6 e o Ponto volta ao cubo (match cut com a S08).
 *
 * Geometria: a máquina inteira é a MESMA montagem da horizontal, construída em torno de (1400,560) ("espaço da
 * máquina"), com transform translate(mx my) scale(ms) translate(−1400 −560). No vertical ela fica fixa em
 * (540,1150) m 1,1 até 21,5 — as posições/escalas da engrenagem gigante (em px do quadro) são convertidas
 * para o espaço da máquina por MX().
 */
MECCA.scene({
  id: 's07-sete-engrenagens',
  build({ root, tl, D, h, P, bg, onFrame, cue, W, H }) {
    const ID = 's07-sete-engrenagens';
    const SEL = `[data-scene="${ID}"]`;
    const LAST = D - 1 / 30;              // último quadro renderizado
    const DEG = Math.PI / 180;
    const STEP = 360 / 7;                 // 51,43° por estação
    const TS = [2, 4, 6, 8, 10, 12, 14];  // downbeats das estações
    const EIO = gsap.parseEase('mecca.inOut');
    // cremalheira/escape (T−0,5→T+0,2) — MESMA curva da horizontal: cruza o alvo em T−0,03, o overshoot de ~1,4%
    // tem o ápice exatamente no downbeat T e assenta até T+0,13. Com o passo de 520 px: pico ≈64 px/quadro (antes ≈199).
    const RACK = CustomEase.create('s07v.rack', 'M0,0 C0.3,0 0.38,1.035 0.7,1.016 0.82,1.0 0.9,1 1,1');
    // viagem do círculo (0→1 s): parte do repouso (continua a S06) mas já anda desde o 1º quadro — sem o
    // "hold" de ~0,4 s do mecca.inOut. Mesma curva da horizontal; pico ≈55 px/quadro no centro (780 px de viagem).
    const LAUNCH = CustomEase.create('s07v.launch', 'M0,0 C0.25,0 0.3,1 1,1');
    const P2O = gsap.parseEase('power2.out');
    const { clamp, lerp, hexA } = h;

    // ------------------------------------------------------------------ layout vertical (spec §2 · S07)
    const M0 = { x: 540, y: 1150, s: 1.1 };          // máquina-base do fechamento: (540,1150) m 1,1
    const M1 = { x: 540, y: 1180, s: 0.6 };          // corte 76,0: (540,1180) m .6
    const K = 579.3 / 401;                            // 1,4446: escala da engrenagem gigante (passo de 520 px)
    const G_IN = { x: 540, y: 1100, s: 1 };           // círculo herdado da S06 (r 300)
    const G_ST = { x: 1320, y: 1100, s: K };          // engrenagem gigante (estações)
    // px do quadro → espaço da máquina (com a máquina parada em M0)
    const MX = (g) => ({ x: 1400 + (g.x - M0.x) / M0.s, y: 560 + (g.y - M0.y) / M0.s, s: g.s / M0.s });
    const GM_IN = MX(G_IN), GM_ST = MX(G_ST);
    const PARK = { x: 676, y: 1100 };                 // Ponto estacionado nas estações
    const ARRIVE_X = G_ST.x - 401 * K;                // 740,7: ponto mais à esquerda do círculo r 401·K
    const PC = { x: M0.x, y: M0.y };                  // centro da órbita do Ponto no fechamento
    const ORB_R = 390 * M0.s;                         // 429
    const Y_A = 963, PITCH = 520;                     // topo do bloco ativo · passo da cremalheira
    const COUNT_BL = 70;                              // baseline do contador "0k / 07" (relativa a y_A; spec: +40)
    const COLX = 90;                                  // margem esquerda do texto
    const CLIP_B = 1480;                              // base do recorte da coluna (polygon)
    // topo do recorte (y 320) com máscara suave até y 400: o bloco que sai pela cremalheira se dissolve em vez de
    // ser fatiado por uma aresta dura logo abaixo do eyebrow (270). O bloco anterior parado (topo 443, contador
    // apagado, nome com cap em ~y 545) fica inteiro abaixo de 400 — nada muda no estado estável.
    const MASK_T = 320, MASK_B = 400;
    const NUM_R = 330;                                // raio dos números (espaço da engrenagem)
    const HUBK_END = 110 / (156 * 200 / 228);        // pupila de 110 px (espaço da máquina) → 121 px no quadro

    const STATIONS = [
      { name: 'Vendas', ape: 'Engrenagem do fechamento', chips: ['PLAYBOOK DE VENDAS', 'PROSPECÇÃO ATIVA (SDR)', 'CRM OPERADO'] },
      { name: 'Marketing', ape: 'Engrenagem da demanda', chips: ['TRÁFEGO PAGO', 'CONTEÚDO & SOCIAL', 'SEO'] },
      { name: 'Comercial', ape: 'Engrenagem das<br>regras do jogo', chips: ['PRICING & MARGEM', 'CANAIS & PARCERIAS', 'RETENÇÃO & CS'] },
      { name: 'Fiscal', ape: 'Engrenagem da<br>conformidade eficiente', chips: ['PLANEJAMENTO TRIBUTÁRIO', 'COMPLIANCE FISCAL', 'EMISSÃO DE <span style="text-transform:none">NF-e</span>'] },
      { name: 'Logística', ape: 'Engrenagem da entrega', chips: ['ESTOQUE & COMPRAS', 'FRETES', 'FULFILLMENT & EXPEDIÇÃO'] },
      { name: 'Sistemas', ape: 'Engrenagem do<br>sistema nervoso', chips: ['PROCESSOS & <span style="text-transform:none">SOPs</span>', 'ERP / CRM', 'BI & DASHBOARDS'] },
      { name: 'Tecnologia', ape: 'Engrenagem digital', chips: ['SOFTWARE SOB MEDIDA', 'SITES & E-COMMERCE', 'IA APLICADA'] },
    ];

    // ------------------------------------------------------------------ CSS local
    h.el('style', {
      html: `
${SEL} .s7-col { position:absolute; left:0; top:0; width:${W}px; height:${H}px;
  clip-path: polygon(60px 320px, 700px 320px, 700px 1000px, 960px 1000px, 960px 1480px, 60px 1480px);
  -webkit-mask-image: linear-gradient(to bottom, transparent ${MASK_T}px, #000 ${MASK_B}px);
  mask-image: linear-gradient(to bottom, transparent ${MASK_T}px, #000 ${MASK_B}px); }
${SEL} .s7-rack, ${SEL} .s7-blk { position:absolute; left:0; top:0; width:${W}px; height:${H}px; }
${SEL} .s7-count { position:absolute; left:${COLX}px; top:0; font-family:var(--f-mono); font-weight:500; font-size:28px;
  letter-spacing:.14em; color:var(--lavender); white-space:nowrap; line-height:1.2; }
${SEL} .s7-ape { position:absolute; left:${COLX}px; top:0; font-family:var(--f-body); font-weight:500; font-size:40px;
  color:var(--lilac); white-space:nowrap; line-height:1.25; letter-spacing:-0.01em; }
${SEL} .s7-blk .chip { height:56px; padding:0 14px 0 15px; gap:10px; font-size:28px; font-weight:500; letter-spacing:.06em;
  text-transform:uppercase; border-radius:13px; line-height:1; color:#C4B5FD; border-color:rgba(196,181,253,.58); background:rgba(26,11,46,.86); }
${SEL} .s7-blk .chip .lb { margin-right:-.06em; }  /* sem o tracking depois do último glifo */
${SEL} .s7-blk .chip .pip { width:8px; height:8px; flex:none; background:var(--lavender); box-shadow:0 0 10px rgba(167,139,250,.9); }
${SEL} .s7-num { font-family:var(--f-bricolage); font-weight:800; font-size:${(80 / M0.s).toFixed(3)}px; letter-spacing:-0.03em; fill:#A78BFA; }
${SEL} .s7-pl { font-family:var(--f-display); font-weight:600; font-size:${(26 / M0.s).toFixed(3)}px; letter-spacing:-0.03em; fill:#FBF8FF; }
${SEL} .s7-close { position:absolute; left:0; top:0; width:${W}px; height:${H}px; }
${SEL} .s7-close .line-mask { padding-bottom:.14em; margin-bottom:-.14em; }
${SEL} .s7-close em { background-repeat:no-repeat; }
`,
    }, root);

    // ------------------------------------------------------------------ utilidades
    // posiciona um elemento absoluto para que a linha de base da sua 1ª linha caia em y (coordenadas do pai)
    function atBaseline(el, y) {
      const probe = h.el('span', { style: { display: 'inline-block', width: '0px', height: '0px', verticalAlign: 'baseline' } });
      el.insertBefore(probe, el.firstChild);
      const off = h.rect(probe).y - h.rect(el).y;
      probe.remove();
      el.style.top = (y - off) + 'px';
    }
    // engrenagem com raio de pé/topo livres (ri = ro → círculo): permite "nascer" os dentes do círculo
    function gearD(ri, ro, n, tip = 0.3, base = 0.54) {
      const st = (Math.PI * 2) / n;
      const f = (v) => v.toFixed(2);
      const pt = (a, r) => `${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}`;
      let d = '';
      for (let i = 0; i < n; i++) {
        const a0 = i * st - st / 2;
        const b0 = a0 + st * 0.5 * (1 - base), t0 = a0 + st * 0.5 * (1 - tip);
        const t1 = a0 + st * 0.5 * (1 + tip), b1 = a0 + st * 0.5 * (1 + base);
        d += (i === 0 ? `M${pt(a0, ri)}` : '') +
          ` A${f(ri)} ${f(ri)} 0 0 1 ${pt(b0, ri)} L${pt(t0, ro)} A${f(ro)} ${f(ro)} 0 0 1 ${pt(t1, ro)}` +
          ` L${pt(b1, ri)} A${f(ri)} ${f(ri)} 0 0 1 ${pt(a0 + st, ri)}`;
      }
      return d + 'Z';
    }
    function sectorD(r0, r1, a0, a1) {
      const p = (a, r) => `${(Math.cos(a * DEG) * r).toFixed(2)} ${(Math.sin(a * DEG) * r).toFixed(2)}`;
      return `M${p(a0, r1)} A${r1} ${r1} 0 0 1 ${p(a1, r1)} L${p(a1, r0)} A${r0} ${r0} 0 0 0 ${p(a0, r0)}Z`;
    }

    // giro contínuo a partir de 18,0 (rampa de 0,3 s até 36°/s no sol)
    const spinAt = (t) => { const u = t - 18; return u <= 0 ? 0 : u < 0.3 ? (36 * u * u) / 0.6 : 36 * (u - 0.15); };
    // fase escolhida para que, no ÚLTIMO quadro, sol (mod 1 dente) e planetas estejam nos ângulos canônicos (0°)
    // — a S08 parte desse estado sem salto. A carcaça segue a função global carcAngle(gt) (ver abaixo).
    const SPIN_END = spinAt(D - 1 / 30);
    const SUN_OFF = -(SPIN_END % (360 / 28));

    // ------------------------------------------------------------------ estado geométrico (tweenado na tl, aplicado no onFrame)
    // gx/gy/gs no ESPAÇO DA MÁQUINA; mx/my/ms = transform da máquina no quadro
    const S0 = {
      gx: GM_IN.x, gy: GM_IN.y, gs: GM_IN.s,  // centro/escala da engrenagem
      pr: 300, k: 0,                          // raio (fase círculo) e quantidade de dente 0..1
      th: 0,                                  // ângulo das estações (graus, horário)
      hubS: 0, hubK: GM_ST.s,                 // pop do cubo-ícone (288,9 px no quadro) e redução para a pupila
      mx: M0.x, my: M0.y, ms: M0.s,           // transformação da máquina inteira (saída)
      shim: 0, orbA: 0, shock: 0,
      wave: 0,                                // onda de choque do DROP B (0,0–0,6)
    };
    const S = Object.assign({}, S0);
    tl.set(S, Object.assign({}, S0), 0);

    // ------------------------------------------------------------------ SVG da máquina
    const svg = h.svg('svg', { class: 'fill', width: W, height: H, viewBox: `0 0 ${W} ${H}` }, root);
    const defs = h.svg('defs', {}, svg);
    const gid = h.uid('s7grad'), hid = h.uid('s7hub');
    const lg = h.svg('linearGradient', { id: gid, x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    h.svg('stop', { offset: 0, 'stop-color': P.magenta }, lg);
    h.svg('stop', { offset: 1, 'stop-color': P.violet }, lg);
    const rg = h.svg('radialGradient', { id: hid }, defs);
    h.svg('stop', { offset: 0, 'stop-color': P.violet, 'stop-opacity': 0.5 }, rg);
    h.svg('stop', { offset: 0.5, 'stop-color': P.violet, 'stop-opacity': 0.14 }, rg);
    h.svg('stop', { offset: 1, 'stop-color': P.violet, 'stop-opacity': 0 }, rg);

    const machine = h.svg('g', {}, svg);
    const planetsG = h.svg('g', {}, machine);          // planetas por baixo do sol
    const gearG = h.svg('g', {}, machine);
    const gearRot = h.svg('g', {}, gearG);
    const NS = 'non-scaling-stroke';
    const body = h.svg('path', { fill: P.bg2, 'fill-opacity': 0, stroke: P.lavender, 'stroke-opacity': 0, 'stroke-width': 2, 'stroke-linejoin': 'round', 'vector-effect': NS }, gearRot);
    const gradP = h.svg('path', { fill: 'none', stroke: `url(#${gid})`, 'stroke-width': 3, 'vector-effect': NS }, gearRot);
    const ringIn = h.svg('circle', { r: 300, fill: 'none', stroke: P.lavender, 'stroke-opacity': 0.3, 'stroke-width': 1, 'vector-effect': NS }, gearRot);
    const ringHub = h.svg('circle', { r: 128, fill: 'none', stroke: P.lavender, 'stroke-opacity': 0.3, 'stroke-width': 1, 'vector-effect': NS }, gearRot);
    const spokesG = h.svg('g', {}, gearRot);
    const spokes = [], rivets = [];
    for (let k = 1; k <= 7; k++) {
      const a = (180 - STEP * k + STEP / 2) * DEG;
      spokes.push(h.svg('line', {
        x1: (Math.cos(a) * 128).toFixed(2), y1: (Math.sin(a) * 128).toFixed(2),
        x2: (Math.cos(a) * 300).toFixed(2), y2: (Math.sin(a) * 300).toFixed(2),
        stroke: P.lavender, 'stroke-opacity': 0.26, 'stroke-width': 1, 'vector-effect': NS,
      }, spokesG));
      rivets.push(h.svg('circle', { cx: (Math.cos(a) * 300).toFixed(2), cy: (Math.sin(a) * 300).toFixed(2), r: 3.5, fill: P.lavender, 'fill-opacity': 0.55 }, spokesG));
    }
    // janela da estação ativa (fixa às 9 horas)
    const wid = h.uid('s7win');
    const wg = h.svg('radialGradient', { id: wid, gradientUnits: 'userSpaceOnUse', cx: 0, cy: 0, r: 384 }, defs);
    h.svg('stop', { offset: 0.78, 'stop-color': P.lavender, 'stop-opacity': 0 }, wg);
    h.svg('stop', { offset: 1, 'stop-color': P.lavender, 'stop-opacity': 0.16 }, wg);
    const win = h.svg('path', { d: sectorD(300, 384, 180 - STEP / 2, 180 + STEP / 2), fill: `url(#${wid})` }, gearG);
    const glowW = h.svg('g', {}, gearG);
    const glow = h.svg('circle', { r: 230, fill: `url(#${hid})` }, glowW);

    // números 01–07 (em pé) — 80 px no quadro (72,7 no espaço da máquina m 1,1)
    const numsG = h.svg('g', {}, machine);
    const nums = [];
    for (let k = 1; k <= 7; k++) {
      const g = h.svg('g', {}, numsG);
      const t = h.svg('text', { class: 's7-num', 'text-anchor': 'middle', 'dominant-baseline': 'central', y: 2 }, g);
      t.textContent = '0' + k;
      nums.push({ g, t });
    }

    // cubo: ícone 200 px SEM ponto, sempre na orientação canônica (quem gira é o anel r128 do mancal)
    const hubG = h.svg('g', {}, machine);
    const hubIn = h.svg('g', { transform: 'translate(-100 -100)' }, hubG);
    const hub = h.icon({ size: 200, parent: hubIn });
    hub.dot.remove();
    const hubArcs = h.svg('g', {}, hub.g);
    hub.g.insertBefore(hubArcs, hub.pupil);
    hubArcs.appendChild(hub.arcOuter);
    hubArcs.appendChild(hub.arcInner);

    // carcaça: arcos do ícone de 710 px centrados em (1400,560) — 781 px no quadro com m 1,1
    const carcG = h.svg('g', { transform: 'translate(1045 205)' }, machine);
    const carc = h.icon({ size: 710, parent: carcG });
    carc.pupil.remove();
    carc.dot.remove();

    // planetas
    const PL = STATIONS.map((st, i) => {
      const ang = -90 + i * STEP;
      const g = h.svg('g', {}, planetsG);
      const rot = h.svg('g', {}, g);
      const d = h.gearPath({ teeth: 16, r: 78, depth: 0.13, hole: 0 });
      h.svg('path', { d, fill: i % 2 ? P.surface2 : P.surface, stroke: P.lavender, 'stroke-width': 1.5, 'stroke-linejoin': 'round', 'vector-effect': NS }, rot);
      const ring = h.svg('circle', { r: 50, fill: 'none', stroke: P.lavender, 'stroke-opacity': 0.18, 'stroke-width': 1, 'vector-effect': NS }, rot);
      const hl = h.svg('path', { d, fill: 'none', stroke: P.magenta, 'stroke-width': 3, 'stroke-linejoin': 'round', opacity: 0, 'vector-effect': NS }, rot);
      const label = h.svg('text', { class: 's7-pl', 'text-anchor': 'middle', 'dominant-baseline': 'central', y: 1 }, g);
      label.textContent = st.name;
      return { g, rot, ring, hl, label, ang, prox: { d: 0 } };
    });

    // ------------------------------------------------------------------ canvas (Ponto, rastro, onda, órbita)
    const { ctx } = h.canvas(root);

    // ------------------------------------------------------------------ coluna de texto (cremalheira vertical, passo 520)
    const col = h.el('div', { cls: 's7-col' }, root);
    const rack = h.el('div', { cls: 's7-rack' }, col);
    const blocks = STATIONS.map((st, i) => {
      // o bloco i fica em top 520·i; o conteúdo é posicionado em relação a y_A (coordenadas do bloco ativo)
      const blk = h.el('div', { cls: 's7-blk', style: { top: (PITCH * i) + 'px' } }, rack);
      const count = h.el('div', { cls: 's7-count', text: `0${i + 1} / 07` }, blk);
      atBaseline(count, Y_A + COUNT_BL);   // desceu de +40: agrupa com o próprio nome, longe dos chips escurecidos acima
      const name = h.text(st.name, { x: COLX, y: 0, size: 104, nowrap: true, parent: blk });
      atBaseline(name, Y_A + 175);
      const ape = h.el('div', { cls: 's7-ape', html: st.ape }, blk);
      atBaseline(ape, Y_A + 232);
      const chips = st.chips.map((label, j) => {
        const c = h.chip(`<span class="lb">${label.replace(/&/g, '&amp;')}</span>`, { x: 0, y: 0, parent: blk });
        const w = h.rect(c).w;
        const top = Y_A + 310 + j * 66;          // um por linha: tops +310 / +376 / +442
        c.style.left = COLX + 'px';
        c.style.top = top + 'px';
        const cx = COLX + w / 2, cy = top + 28;
        // trajetória saindo do Ponto (676,1100), em coordenadas de transform (0,0 = posição final).
        // Ponto médio (sx·.5, 48) como na horizontal; só o 3º chip (base em 1461) tem o mergulho achatado
        // para não ser cortado pela base do recorte (y 1480) durante o voo (a curva passa ~9 px além do ponto médio).
        const sx = PARK.x - cx, sy = PARK.y - cy;
        const myp = Math.min(48, CLIP_B - 15 - (top + 56));
        return { el: c, sx, sy, mxp: sx * 0.5, myp };
      });
      const cs = h.split(count, { type: 'chars' });
      return { blk, count, cs, name, ape, chips };
    });

    // ------------------------------------------------------------------ fechamento (texto, SG 700 96, x 90)
    const close = h.el('div', { cls: 's7-close' }, root);
    const L1 = h.text('Uma máquina.', { x: COLX, y: 0, size: 96, nowrap: true, parent: close });
    const L2 = h.text('Sete engrenagens.', { x: COLX, y: 0, size: 96, nowrap: true, parent: close });
    const L3 = h.text('<em>Um só</em> mecanismo.', { x: COLX, y: 0, size: 96, nowrap: true, parent: close });
    atBaseline(L1, 420); atBaseline(L2, 530); atBaseline(L3, 640);
    const sp1 = h.split(L1, { type: 'lines', mask: 'lines' });
    const sp2 = h.split(L2, { type: 'lines', mask: 'lines' });
    const sp3 = h.split(L3, { type: 'lines', mask: 'lines' });
    // o SplitText (deepSlice) pode clonar o <em>: aplica o shimmer em todos os que têm texto
    const ems = [...L3.querySelectorAll('em')].filter((e) => e.textContent.trim());
    ems.forEach((em) => {
      em.style.backgroundImage = 'linear-gradient(100deg, rgba(251,248,255,0) 40%, rgba(251,248,255,.92) 50%, rgba(251,248,255,0) 60%), linear-gradient(90deg, #c026d3, #7c3aed)';
      em.style.backgroundSize = '300% 100%, 100% 100%';
      em.style.backgroundPosition = '100% 0, 0 0';
    });

    // ------------------------------------------------------------------ eyebrow (TOPO no vertical: (90,270), 26 px)
    const eb = h.eyebrow('O ALCANCE · A MÁQUINA INTEIRA', { x: COLX, y: 270, anchor: 'cl', size: 26, parent: root });
    const ebDash = eb.querySelector('.dash');
    const ebSp = h.split(eb.querySelector('.lbl'), { type: 'chars' });

    // ================================================================== TIMELINE
    // fundo no corte de entrada (54,0: grid .2)
    const BG_IN = { glowA: 1, glowB: 1, glowC: 1, grid: 0.2, particles: 1, driftX: 0, driftY: 0, speed: 1, warp: 0, vignette: 0.55, dim: 0, hue: 0, grain: 1 };
    tl.set(bg, Object.assign({}, BG_IN), 0);

    // estados iniciais — aplicados já no build (a tl local NÃO renderiza sets no instante exato t = 0,
    // porque o _tTime inicial dela já é 0) e também na tl (para seeks para trás).
    const init = (targets, vars) => { gsap.set(targets, vars); tl.set(targets, Object.assign({}, vars), 0); };
    init(body, { attr: { 'fill-opacity': 0, 'stroke-opacity': 0 } });
    init(gradP, { opacity: 1 });
    init([ringIn, ringHub, ...spokes], { drawSVG: '0%' });
    init(rivets, { opacity: 0 });
    init(win, { opacity: 0 });
    init(glowW, { opacity: 0 });
    init(nums.map((n) => n.t), { opacity: 0, scale: 0, fill: P.lavender, transformOrigin: '50% 50%' });
    init(hubArcs, { opacity: 1 });
    init(carc.svg, { autoAlpha: 0 });
    init([carc.arcOuter, carc.arcInner], { drawSVG: '0%' });
    PL.forEach((p) => { init(p.g, { autoAlpha: 0 }); init(p.prox, { d: 0 }); init(p.label, { opacity: 0 }); init(p.hl, { opacity: 0 }); init(p.ring, { opacity: 1 }); });
    init(rack, { y: PITCH });
    blocks.forEach((B) => {
      init(B.blk, { opacity: 0, y: 0 });
      init(B.count, { opacity: 1 });
      init(B.cs.chars, { rotationX: -90, opacity: 0, transformPerspective: 300, transformOrigin: '50% 50%' });
      init(B.name, { scale: 1, transformOrigin: '0% 100%' });
      B.chips.forEach((c) => init(c.el, { x: c.sx, y: c.sy, scale: 0.6, opacity: 0 }));
    });
    init([...sp1.lines, ...sp2.lines, ...sp3.lines], { yPercent: 125 });
    init(close, { scale: 1, transformOrigin: `${COLX}px 530px` });
    init(ebSp.chars, { autoAlpha: 0 });
    init(ebDash, { scaleX: 0, transformOrigin: '0% 50%' });
    init(eb, { x: 0 });

    // 0,0–1,0 — o círculo viaja (540,1100) r300 → (1320,1100) r579,3 (pr 300→401 e gs 1→1,4446, LAUNCH: sem hold)
    tl.to(S, { gx: GM_ST.x, gy: GM_ST.y, gs: GM_ST.s, pr: 401, duration: 1, ease: LAUNCH }, 0);
    tl.to(body, { attr: { 'fill-opacity': 0.8 }, duration: 0.9, ease: 'power1.inOut' }, 0.4);
    // DROP B (54,0): onda de choque r 300→700 (lavanda 2 px, α .5→0, 0,6 s) e o traço engrossa 3→5 px e volta a 3 até 0,4.
    // O quadro t = 0 continua idêntico ao último da S06 (match cut): tudo isso aparece a partir do quadro seguinte.
    tl.to(S, { wave: 1, duration: 0.6, ease: 'none' }, 0);
    // (começa em 0,002 porque o motor faz seek em t + 1e-4: o quadro 0 fica com os 3 px exatos da S06)
    tl.to(gradP, { attr: { 'stroke-width': 5 }, duration: 1 / 30 - 0.002, ease: 'none' }, 0.002);
    tl.to(gradP, { attr: { 'stroke-width': 3 }, duration: 0.4 - 1 / 30, ease: 'power1.inOut' }, 1 / 30);
    cue(0, 'whoosh', 'círculo viaja', 0.4);

    // 1,0–1,5 — nascem os dentes; gradiente → lavanda; números; cubo
    tl.to(S, { k: 1, duration: 0.5, ease: 'mecca.back' }, 1);
    tl.to(gradP, { opacity: 0, duration: 0.5, ease: 'power1.inOut' }, 1);
    tl.to(body, { attr: { 'stroke-opacity': 0.5 }, duration: 0.5, ease: 'power1.inOut' }, 1);
    tl.to([ringIn, ringHub], { drawSVG: '100%', duration: 0.6, ease: 'mecca.out' }, 1.05);
    tl.to(spokes, { drawSVG: '100%', duration: 0.4, ease: 'mecca.out', stagger: 0.03 }, 1.15);
    tl.to(rivets, { opacity: 1, duration: 0.25, stagger: 0.03 }, 1.4);
    tl.to(nums.map((n) => n.t), { opacity: 0.6, scale: 1, duration: 0.45, ease: 'mecca.back', stagger: 0.05 }, 1);
    tl.to(S, { hubS: 1, duration: 0.55, ease: 'mecca.back' }, 1.25);
    tl.to(glowW, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 1.25);
    tl.to(win, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 1.5);
    cue(1, 'impact', 'dentes nascem', 0.8);
    cue(1.25, 'chime', 'cubo', 0.3);

    // eyebrow no topo — digitação
    tl.to(ebDash, { scaleX: 1, duration: 0.3, ease: 'mecca.out' }, 0.5);
    tl.to(ebSp.chars, { autoAlpha: 1, duration: 0.01, ease: 'none', stagger: 0.025 }, 0.62);
    tl.to(eb, { x: 10, duration: 15.5, ease: 'none' }, 0.5);
    tl.to(ebSp.chars, { autoAlpha: 0, duration: 0.01, ease: 'none', stagger: { each: 0.009, from: 'end' } }, 16);
    tl.to(ebDash, { scaleX: 0, duration: 0.15, ease: 'mecca.in' }, 16.15);

    // ciclo de estações
    TS.forEach((T, i) => {
      const k = i + 1, B = blocks[i];
      tl.to(S, { th: STEP * k, duration: 0.7, ease: RACK }, T - 0.5);
      tl.to(rack, { y: -PITCH * i, duration: 0.7, ease: RACK }, T - 0.5);
      tl.to(B.blk, { opacity: 1, duration: 0.35, ease: 'power1.out' }, T - 0.5);
      tl.to(B.cs.chars, { rotationX: 0, opacity: 1, duration: 0.25, ease: 'mecca.snap', stagger: 0.02 }, T - 0.1);
      tl.to(B.name, { scale: 1.03, duration: k < 7 ? 4 : 2.25, ease: 'none' }, T);
      B.chips.forEach((c, j) => {
        const t0 = T + j * 0.05;
        tl.to(c.el, { motionPath: { path: [{ x: c.sx, y: c.sy }, { x: c.mxp, y: c.myp }, { x: 0, y: 0 }], curviness: 1.2, fromCurrent: false }, duration: 0.45, ease: 'mecca.out' }, t0);
        tl.to(c.el, { scale: 1, duration: 0.45, ease: 'mecca.out' }, t0);
        tl.to(c.el, { opacity: 1, duration: 0.1, ease: 'none' }, t0);
      });
      tl.to(nums[i].t, { fill: P.ink, opacity: 1, scale: 1.15, duration: 0.3, ease: 'mecca.back' }, T);
      if (i > 0) tl.to(nums[i - 1].t, { fill: P.lavender, opacity: 0.6, scale: 1, duration: 0.3, ease: 'power2.out' }, T);
      if (k < 7) {
        // dim desacoplado do início da cremalheira (T+1,5): fica α 1 até T+2,0 para ganhar leitura; α .55 (chips legíveis)
        tl.to(B.blk, { opacity: 0.55, duration: 0.4, ease: 'power1.inOut' }, T + 2);
        tl.to(B.count, { opacity: 0, duration: 0.3, ease: 'power1.in' }, T + 2 - 0.5);
      }
      if (k < 6) tl.to(B.blk, { opacity: 0, duration: 0.6, ease: 'power1.in' }, T + 4 - 0.5);
      cue(T, 'click', STATIONS[i].name, 1.0);
    });
    cue(2, 'impact', 'Vendas', 0.35);
    cue(14, 'impact', 'Tecnologia', 0.6);

    // 16,0–17,0 — RECUO: a engrenagem vai para (540,1150), gs 1,4446 → .341 (= .31 no espaço da máquina)
    // mecca.in só no y; opacidade em power1.in (sem o "pop" de ~55%→0 no fim do fade)
    tl.to(blocks[5].blk, { y: -60, duration: 0.3, ease: 'mecca.in' }, 16);
    tl.to(blocks[5].blk, { opacity: 0, duration: 0.3, ease: 'power1.in' }, 16);
    tl.to(blocks[6].blk, { y: -60, duration: 0.25, ease: 'mecca.in' }, 16.25);
    tl.to(blocks[6].blk, { opacity: 0, duration: 0.25, ease: 'power1.in' }, 16.25);
    tl.to(nums.map((n) => n.t), { opacity: 0, duration: 0.3, ease: 'power1.in' }, 16);
    tl.to([ringIn, ringHub, spokesG, win], { opacity: 0, duration: 0.3, ease: 'power1.in' }, 16);
    tl.to(hubArcs, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 16);
    tl.to(S, { gx: 1400, gy: 560, gs: 0.31, duration: 1, ease: 'mecca.inOut' }, 16);
    tl.to(S, { hubK: HUBK_END, duration: 1, ease: 'mecca.inOut' }, 16);
    tl.to(S, { th: 360 + SUN_OFF, duration: 1, ease: 'mecca.inOut' }, 16);
    tl.to(body, { attr: { 'fill-opacity': 1 }, duration: 0.4, ease: 'power1.out' }, 16);
    tl.to(bg, { grid: 0, duration: 1, ease: 'mecca.inOut' }, 16);
    cue(16, 'whoosh', 'recuo', 0.45);

    // 16,5–17,25 — 7 PLANETAS
    PL.forEach((p, i) => {
      const t0 = 16.5 + i * 0.06;
      tl.set(p.g, { autoAlpha: 1 }, t0);
      // pousam dentro da janela 16,5–17,25 (último: 16,86 + 0,39 = 17,25)
      tl.to(p.prox, { d: 198, duration: 0.39, ease: 'mecca.back' }, t0);
      tl.to(p.label, { opacity: 1, duration: 0.3, ease: 'power1.out' }, t0 + 0.25);
      // o nome (SG 600 26 px, até 129 px) é mais largo que o anel r 50 (Ø 110 no quadro): o anel apaga enquanto
      // o nome está visível e volta junto com a saída dos nomes (21,5–21,8), a tempo do corte 76,0
      tl.to(p.ring, { opacity: 0, duration: 0.3, ease: 'power1.out' }, t0 + 0.25);
      tl.to(p.ring, { opacity: 1, duration: 0.3, ease: 'power1.inOut' }, 21.5);
    });
    cue(16.5, 'whoosh', 'planetas', 0.6);

    // 17,0–17,75 — carcaça
    tl.set(carc.svg, { autoAlpha: 1 }, 17);
    tl.to([carc.arcOuter, carc.arcInner], { drawSVG: '100%', duration: 0.75, ease: 'mecca.out' }, 17);
    cue(17, 'whoosh', 'carcaça', 0.5);

    // texto do fechamento
    tl.to(sp1.lines, { yPercent: 0, duration: 0.6, ease: 'mecca.out' }, 17);
    tl.to(sp2.lines, { yPercent: 0, duration: 0.6, ease: 'mecca.out' }, 17.5);
    tl.to(sp3.lines, { yPercent: 0, duration: 0.6, ease: 'mecca.out' }, 18);
    tl.to(close, { scale: 1.025, duration: 4.5, ease: 'none' }, 17);
    tl.to(S, { shim: 1, duration: 1.5, ease: 'power2.inOut' }, 19);

    // 18,0 — TUDO ENGRENA
    tl.to(S, { orbA: 0.24, duration: 0.6, ease: 'power1.out' }, 17.6);
    tl.to(S, { shock: 1, duration: 0.9, ease: 'none' }, 18);
    tl.to(body, { attr: { 'stroke-opacity': 0.85 }, duration: 0.3, ease: 'power2.out' }, 18);
    PL.forEach((p, i) => {
      tl.to(p.hl, { opacity: 1, duration: 0.08, ease: 'none' }, 18 + i * 0.12);
      tl.to(p.hl, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 18 + i * 0.12 + 0.1);
    });
    tl.to(bg, { particles: 1.3, duration: 0.6, ease: 'power2.out' }, 18);
    cue(18, 'impact', 'tudo engrena', 1.0);
    cue(18, 'chime', 'tudo engrena', 0.7);

    // 21,5–22,0 — saída: a máquina vai para (540,1180) m .6 (termina exatamente no último quadro)
    const OUT = LAST - 21.5;
    tl.to([...sp1.lines, ...sp2.lines, ...sp3.lines], { yPercent: -125, duration: 0.21, ease: 'mecca.in', stagger: 0.02 }, 21.5);
    tl.to(PL.map((p) => p.label), { opacity: 0, duration: 0.3, ease: 'power1.in' }, 21.5);
    tl.to(S, { mx: M1.x, my: M1.y, ms: M1.s, duration: OUT, ease: 'mecca.inOut' }, 21.5);
    tl.to(S, { orbA: 0, duration: OUT, ease: 'power1.in' }, 21.5);
    tl.to(body, { attr: { 'stroke-opacity': 0.5 }, duration: OUT, ease: 'mecca.inOut' }, 21.5);
    tl.to(bg, { particles: 1, duration: OUT, ease: 'mecca.inOut' }, 21.5);
    cue(21.75, 'whoosh', 'máquina recua', 0.5);

    // ================================================================== Ponto (analítico, para o rastro)
    // recuo (mesma fórmula da horizontal): o Ponto abre em espiral a partir do estacionamento (676,1100) em volta
    // do centro final (540,1150) até r 429, acelerando até 120°/s (período 3 s) em 18,0. A engrenagem recua POR
    // BAIXO dele (16,1–16,7) — assim ele nunca atravessa o texto de "Tecnologia" que ainda está saindo — e um
    // "salto" suave (−90·sen²(πu), nulo em 16,0 e 17,0) o faz passar por cima do cubo em vez de cruzar a pupila.
    const PHI0 = Math.atan2(PARK.y - PC.y, PARK.x - PC.x);   // −20,2°
    const RHO0 = Math.hypot(PARK.x - PC.x, PARK.y - PC.y);   // 144,9
    const LIFT = 90;
    function orbitPos(t) {
      const u = t - 16;
      const rho = u < 1 ? lerp(RHO0, ORB_R, EIO(clamp(u))) : ORB_R;
      const phi = u < 2 ? 30 * u * u : 120 + 120 * (u - 2);
      const a = PHI0 + phi * DEG;
      const lift = u > 0 && u < 1 ? LIFT * Math.sin(Math.PI * u) ** 2 : 0;
      return { x: PC.x + rho * Math.cos(a), y: PC.y + rho * Math.sin(a) - lift };
    }
    // ponto mais à esquerda do círculo em viagem (0–1 s): centro e raio no quadro com o mesmo easing
    function leftmost(e) {
      const gx = lerp(G_IN.x, G_ST.x, e), gs = lerp(G_IN.s, G_ST.s, e), pr = lerp(300, 401, e);
      return gx - pr * gs;
    }
    function pontoPos(t) {
      if (t <= 0) return { x: leftmost(0), y: 1100 };
      if (t < 1) return { x: leftmost(LAUNCH(t)), y: 1100 };   // mesmo easing do círculo (ponto mais à esquerda)
      if (t < 1.5) return { x: lerp(ARRIVE_X, PARK.x, EIO((t - 1) / 0.5)), y: PARK.y };
      if (t < 16) return { x: PARK.x, y: PARK.y };
      const o = orbitPos(t);
      if (t < 21.5) return o;
      const e = EIO(clamp((t - 21.5) / OUT));
      return { x: lerp(o.x, M1.x, e), y: lerp(o.y, M1.y, e) };
    }
    function pulse(u) { // 0→1→0 em 0,45 s
      if (u < 0 || u > 0.45) return 0;
      return u < 0.1 ? P2O(u / 0.1) : 1 - EIO((u - 0.1) / 0.35);
    }
    // micro-acento entre estações: r 10→13→10 em 0,2 s (em T+0,5, T+1,0 e T+1,5)
    function blip(u) {
      if (u < 0 || u > 0.2) return 0;
      return u < 0.06 ? P2O(u / 0.06) : 1 - EIO((u - 0.06) / 0.14);
    }
    function pontoR(t) {
      let p = 0, q = 0;
      for (const T of TS) {
        p = Math.max(p, pulse(t - T));
        q = Math.max(q, blip(t - T - 0.5), blip(t - T - 1), blip(t - T - 1.5));
      }
      return 10 + Math.max(6 * p, 3 * q);
    }
    // tick de catraca da engrenagem gigante em T+1,0: ±1,5° em 0,12 s (volta a 0 — o passo de 51,43° não muda)
    function ratchet(t) {
      for (const T of TS) {
        const u = t - T - 1;
        if (u > 0 && u < 0.12) return 1.5 * Math.sin((2 * Math.PI * u) / 0.12);
      }
      return 0;
    }
    // CARCAÇA — função COMPARTILHADA S07/S08/S09 (nota global 5), no tempo GLOBAL gt:
    // 0 antes de 72 s; depois 18°·sin(2π(gt−72)/4)·smooth(72, 72.6, gt) → 0° exatos nos cortes 76,0 e 82,0
    const carcAngle = (gt) => (gt < 72 ? 0 : 18 * Math.sin((2 * Math.PI * (gt - 72)) / 4) * h.smooth(72, 72.6, gt));
    // desenho PADRÃO do Ponto (idêntico ao da S06): h.glowDot lavanda α .6 + núcleo #FBF8FF.
    // Respiração leve do alfa (±.08, período 2 s) só entre 0,5 e 21,5 — volta a exatamente .6 nos cortes.
    function drawPonto(x, y, r, lt) {
      const env = h.smooth(0.5, 1.5, lt) * (1 - h.smooth(20.5, 21.5, lt));
      const a = 0.6 + 0.08 * env * Math.sin((lt - 0.5) * Math.PI);
      h.glowDot(ctx, x, y, r, P.lavender, a);
      ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }

    // ================================================================== onFrame
    let lastKey = '';
    onFrame((lt, gt) => {
      // no quadro exato t = 0 a tl local ainda não renderizou o set do fundo: garante o estado do corte (54,0)
      if (lt < 1 / 60) Object.assign(bg, BG_IN);
      // perfil da engrenagem (círculo → dentes)
      const ro = S.pr + 19 * S.k, ri = S.pr - 14.6 * S.k;
      const key = ro.toFixed(2) + '|' + ri.toFixed(2);
      if (key !== lastKey) { const d = gearD(ri, ro, 28); body.setAttribute('d', d); gradP.setAttribute('d', d); lastKey = key; }

      // rotação contínua a partir de 18,0 (rampa de 0,3 s até 36°/s)
      const spin = spinAt(lt);
      const th = S.th + spin + ratchet(lt);

      machine.setAttribute('transform', `translate(${S.mx.toFixed(2)} ${S.my.toFixed(2)}) scale(${S.ms.toFixed(4)}) translate(-1400 -560)`);
      gearG.setAttribute('transform', `translate(${S.gx.toFixed(2)} ${S.gy.toFixed(2)}) scale(${S.gs.toFixed(5)})`);
      gearRot.setAttribute('transform', `rotate(${th.toFixed(3)})`);
      hubG.setAttribute('transform', `translate(${S.gx.toFixed(2)} ${S.gy.toFixed(2)}) scale(${(S.hubS * S.hubK).toFixed(4)})`);
      glow.setAttribute('opacity', (0.82 + 0.18 * Math.sin(lt * Math.PI * 0.5)).toFixed(3));

      for (let i = 0; i < 7; i++) {
        const a = (180 - STEP * (i + 1) + th) * DEG;
        const nx = S.gx + NUM_R * S.gs * Math.cos(a);
        nums[i].g.setAttribute('transform', `translate(${nx.toFixed(2)} ${(S.gy + NUM_R * S.gs * Math.sin(a)).toFixed(2)})`);
        // números perto da borda direita / do trilho de botões somem: α × smooth(1040, 970, x no quadro)
        const nxs = S.mx + (nx - 1400) * S.ms;
        nums[i].g.setAttribute('opacity', h.smooth(1040, 970, nxs).toFixed(3));
        const p = PL[i];
        const pa = p.ang * DEG, d = p.prox.d;
        p.g.setAttribute('transform', `translate(${(S.gx + d * Math.cos(pa)).toFixed(2)} ${(S.gy + d * Math.sin(pa)).toFixed(2)})`);
        // fase de engrenamento com o sol: θB = ψ + 180 + 180/NB − (NA/NB)(θA − ψ)
        const rotB = p.ang + 180 + 180 / 16 - (28 / 16) * (th - p.ang) + 90 * (1 - d / 198);
        p.rot.setAttribute('transform', `rotate(${rotB.toFixed(3)})`);
      }
      carc.g.setAttribute('transform', `rotate(${carcAngle(gt).toFixed(3)} 114 114)`);
      const bpos = `${((1 - S.shim) * 100).toFixed(2)}% 0, 0 0`;
      for (const em of ems) em.style.backgroundPosition = bpos;

      // ---------------- canvas
      ctx.clearRect(0, 0, W, H);
      const mc = { x: S.mx, y: S.my };      // centro da máquina (1400,560) no quadro
      if (S.orbA > 0.003) {
        ctx.save();
        ctx.strokeStyle = hexA(P.lavender, S.orbA);
        ctx.lineWidth = 1.25;
        ctx.beginPath(); ctx.arc(mc.x, mc.y, 390 * S.ms, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      // onda de choque do DROP B, centrada no ponto de partida do círculo (540,1100); α 0 no quadro t = 0 (match cut)
      if (S.wave > 0 && S.wave < 1) {
        const w = S.wave;
        ctx.save();
        ctx.strokeStyle = hexA(P.lavender, 0.5 * (1 - w) * h.smooth(0, 1 / 30, lt));
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(G_IN.x, G_IN.y, 300 + 400 * P2O(w), 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      if (S.shock > 0 && S.shock < 1) {
        const e = P2O(S.shock), a = 0.5 * (1 - S.shock);
        const r = 385 + 605 * e;                        // 385 → 990
        // a onda morre antes do texto do fechamento (base em y 640): recorte em y ≥ 690 com borda suave 690→760
        const fadeG = (c, al) => {
          const g = ctx.createLinearGradient(0, 690, 0, 760);
          g.addColorStop(0, hexA(c, 0));
          g.addColorStop(1, hexA(c, al));
          return g;
        };
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 690, W, H - 690); ctx.clip();
        ctx.strokeStyle = fadeG(P.lavender, a); ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(PC.x, PC.y, r, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = fadeG(P.magenta, a * 0.7); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(PC.x, PC.y, r * 0.93, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }

      const pp = pontoPos(lt);
      const r = pontoR(lt);
      // anel de "cuspe" em cada estação
      for (const T of TS) {
        const v = lt - T;
        if (v > 0 && v < 0.55) {
          const k = v / 0.55;
          ctx.strokeStyle = hexA(P.lilac, 0.55 * (1 - k));
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(pp.x, pp.y, 14 + 46 * P2O(k), 0, Math.PI * 2); ctx.stroke();
        }
      }
      // rastro (acima de 600 px/s): cometa afilado sobre as últimas 8 posições (amostradas a 1/60 s)
      const prev = pontoPos(lt - 1 / 30);
      const speed = Math.hypot(pp.x - prev.x, pp.y - prev.y) * 30;
      const tk = h.smooth(480, 720, speed);
      if (tk > 0.001) {
        const N = 16, pts = [pp];
        for (let j = 1; j <= N; j++) pts.push(pontoPos(lt - j / 60));
        const tail = pts[N];
        if (Math.hypot(tail.x - pp.x, tail.y - pp.y) > 2) {
          const L = [], R = [];
          for (let j = 0; j <= N; j++) {
            const a = pts[Math.max(0, j - 1)], b = pts[Math.min(N, j + 1)];
            let nx = -(b.y - a.y), ny = b.x - a.x;
            const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
            const w = r * 0.92 * Math.pow(1 - j / N, 1.15);
            L.push([pts[j].x + nx * w, pts[j].y + ny * w]);
            R.push([pts[j].x - nx * w, pts[j].y - ny * w]);
          }
          const g = ctx.createLinearGradient(pp.x, pp.y, tail.x, tail.y);
          g.addColorStop(0, hexA(P.magenta, 0.9 * tk));
          g.addColorStop(0.55, hexA(P.violet, 0.45 * tk));
          g.addColorStop(1, hexA(P.violet, 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(L[0][0], L[0][1]);
          for (let j = 1; j <= N; j++) ctx.lineTo(L[j][0], L[j][1]);
          for (let j = N; j >= 0; j--) ctx.lineTo(R[j][0], R[j][1]);
          ctx.closePath();
          ctx.fill();
        }
      }
      drawPonto(pp.x, pp.y, r, lt);
    });
  },
});
})();
