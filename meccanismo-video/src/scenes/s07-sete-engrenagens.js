/*
 * S07 — Uma máquina. Sete engrenagens. Um só mecanismo.  (global 54–76 s, D = 22 s, tail 0)
 *
 * 0,0–1,5   o círculo da S06 viaja para a direita, ganha dentes e vira a engrenagem gigante (escape de relógio).
 * 2–14      7 estações (uma por compasso): a engrenagem gira 51,43° e empurra a coluna de texto 360 px (cremalheira);
 *           o Ponto, estacionado em (1180,540), pulsa e cospe os 3 chips de serviço.
 * 16–18     recuo: a engrenagem vira o SOL de um planetário, 7 planetas nomeados, carcaça = arcos do ícone.
 * 18–21,5   tudo engrena; o Ponto orbita a máquina. "Uma máquina. / Sete engrenagens. / Um só mecanismo."
 * 21,5–22   a máquina encolhe para (1300,580) ×.55 e o Ponto volta ao cubo (match cut com a S08).
 */
MECCA.scene({
  id: 's07-sete-engrenagens',
  build({ root, tl, D, h, P, bg, onFrame, cue }) {
    const ID = 's07-sete-engrenagens';
    const SEL = `[data-scene="${ID}"]`;
    const LAST = D - 1 / 30;              // último quadro renderizado
    const DEG = Math.PI / 180;
    const STEP = 360 / 7;                 // 51,43° por estação
    const TS = [2, 4, 6, 8, 10, 12, 14];  // downbeats das estações
    const EIO = gsap.parseEase('mecca.inOut');
    const P2O = gsap.parseEase('power2.out');
    const { clamp, lerp, hexA } = h;

    const STATIONS = [
      { name: 'Vendas', ape: 'Engrenagem do fechamento', chips: ['PLAYBOOK DE VENDAS', 'PROSPECÇÃO ATIVA (SDR)', 'CRM OPERADO'] },
      { name: 'Marketing', ape: 'Engrenagem da demanda', chips: ['TRÁFEGO PAGO', 'CONTEÚDO & SOCIAL', 'SEO'] },
      { name: 'Comercial', ape: 'Engrenagem das regras do jogo', chips: ['PRICING & MARGEM', 'CANAIS & PARCERIAS', 'RETENÇÃO & CS'] },
      { name: 'Fiscal', ape: 'Engrenagem da conformidade eficiente', chips: ['PLANEJAMENTO TRIBUTÁRIO', 'COMPLIANCE FISCAL', 'EMISSÃO DE NF-E'] },
      { name: 'Logística', ape: 'Engrenagem da entrega', chips: ['ESTOQUE & COMPRAS', 'FRETES', 'FULFILLMENT & EXPEDIÇÃO'] },
      { name: 'Sistemas', ape: 'Engrenagem do sistema nervoso', chips: ['PROCESSOS & SOPS', 'ERP / CRM', 'BI & DASHBOARDS'] },
      { name: 'Tecnologia', ape: 'Engrenagem digital', chips: ['SOFTWARE SOB MEDIDA', 'SITES & E-COMMERCE', 'IA APLICADA'] },
    ];

    // ------------------------------------------------------------------ CSS local
    h.el('style', {
      html: `
${SEL} .s7-col { position:absolute; left:0; top:0; width:1920px; height:1080px;
  clip-path: polygon(150px 72px, 1160px 72px, 1160px 430px, 1400px 430px, 1400px 800px, 150px 800px); }
${SEL} .s7-rack, ${SEL} .s7-blk { position:absolute; left:0; top:0; width:1920px; height:1080px; }
${SEL} .s7-count { position:absolute; left:192px; top:0; font-family:var(--f-mono); font-weight:500; font-size:24px;
  letter-spacing:.14em; color:var(--lavender); white-space:nowrap; line-height:1.2; }
${SEL} .s7-ape { position:absolute; left:192px; top:0; font-family:var(--f-body); font-weight:500; font-size:38px;
  color:var(--lilac); white-space:nowrap; line-height:1.2; letter-spacing:-0.01em; }
${SEL} .s7-blk .chip { height:44px; padding:0 16px 0 18px; gap:10px; font-size:18px; font-weight:500; letter-spacing:.14em;
  text-transform:uppercase; border-radius:10px; line-height:1; border-color:rgba(167,139,250,.34); background:rgba(26,11,46,.86); }
${SEL} .s7-blk .chip .pip { width:7px; height:7px; flex:none; background:var(--lavender); box-shadow:0 0 8px rgba(167,139,250,.9); }
${SEL} .s7-num { font-family:var(--f-bricolage); font-weight:800; font-size:56px; letter-spacing:-0.03em; fill:#A78BFA; }
${SEL} .s7-pl { font-family:var(--f-display); font-weight:600; font-size:18px; letter-spacing:-0.01em; fill:#FBF8FF; }
${SEL} .s7-close { position:absolute; left:0; top:0; width:1920px; height:1080px; }
${SEL} .s7-close .line-mask { padding-bottom:.14em; margin-bottom:-.14em; }
${SEL} .s7-close em { background-repeat:no-repeat; }
`,
    }, root);

    // ------------------------------------------------------------------ utilidades
    // posiciona um elemento absoluto para que a sua linha de base caia em y (coordenadas do pai)
    function atBaseline(el, y) {
      const probe = h.el('span', { style: { display: 'inline-block', width: '0px', height: '0px', verticalAlign: 'baseline' } }, el);
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
    // fase escolhida para que, no ÚLTIMO quadro, sol (mod 1 dente), planetas e carcaça estejam nos ângulos canônicos (0°)
    // — a S08 parte desse estado sem salto
    const SPIN_END = spinAt(D - 1 / 30);
    const SUN_OFF = -(SPIN_END % (360 / 28));

    // ------------------------------------------------------------------ estado geométrico (tweenado na tl, aplicado no onFrame)
    const S0 = {
      gx: 960, gy: 540, gs: 1,  // centro/escala da engrenagem
      pr: 300, k: 0,            // raio (fase círculo) e quantidade de dente 0..1
      th: 0,                    // ângulo das estações (graus, horário)
      hubS: 0, hubK: 1,         // pop do cubo-ícone e redução para a pupila de 110 px
      mx: 1400, my: 560, ms: 1, // transformação da máquina inteira (saída)
      shim: 0, orbA: 0, shock: 0,
    };
    const S = Object.assign({}, S0);
    tl.set(S, Object.assign({}, S0), 0);

    // ------------------------------------------------------------------ SVG da máquina
    const svg = h.svg('svg', { class: 'fill', width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, root);
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

    // números 01–07 (em pé)
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

    // carcaça: arcos do ícone de 710 px centrados em (1400,560)
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
      h.svg('circle', { r: 50, fill: 'none', stroke: P.lavender, 'stroke-opacity': 0.18, 'stroke-width': 1, 'vector-effect': NS }, rot);
      const hl = h.svg('path', { d, fill: 'none', stroke: P.magenta, 'stroke-width': 3, 'stroke-linejoin': 'round', opacity: 0, 'vector-effect': NS }, rot);
      const label = h.svg('text', { class: 's7-pl', 'text-anchor': 'middle', 'dominant-baseline': 'central', y: 1 }, g);
      label.textContent = st.name;
      return { g, rot, hl, label, ang, prox: { d: 0 } };
    });

    // ------------------------------------------------------------------ canvas (Ponto, rastro, onda, órbita)
    const { ctx } = h.canvas(root);

    // ------------------------------------------------------------------ coluna de texto (cremalheira)
    const col = h.el('div', { cls: 's7-col' }, root);
    const rack = h.el('div', { cls: 's7-rack' }, col);
    const blocks = STATIONS.map((st, i) => {
      const blk = h.el('div', { cls: 's7-blk', style: { top: (360 * i) + 'px' } }, rack);
      const count = h.el('div', { cls: 's7-count', text: `0${i + 1} / 07` }, blk);
      atBaseline(count, 400);
      const name = h.text(st.name, { x: 192, y: 0, size: 150, nowrap: true, parent: blk });
      atBaseline(name, 575);
      const ape = h.el('div', { cls: 's7-ape', text: st.ape }, blk);
      atBaseline(ape, 635);
      let x = 192, row = 0;
      const chips = st.chips.map((label) => {
        const c = h.chip(label.replace(/&/g, '&amp;'), { x: 0, y: 0, parent: blk });
        const w = h.rect(c).w;
        if (x > 192 && x + w > 192 + 940) { row++; x = 192; }
        const top = 668 + row * 56;
        c.style.left = x + 'px';
        c.style.top = top + 'px';
        const cx = x + w / 2, cy = top + 22;
        x += w + 12;
        // trajetória saindo do Ponto (1180,540), em coordenadas de transform (0,0 = posição final)
        const sx = 1180 - cx, sy = 540 - cy;
        return { el: c, sx, sy, mxp: sx * 0.5, myp: 48 };
      });
      const cs = h.split(count, { type: 'chars' });
      return { blk, count, cs, name, ape, chips };
    });

    // ------------------------------------------------------------------ fechamento (texto)
    const close = h.el('div', { cls: 's7-close' }, root);
    const L1 = h.text('Uma máquina.', { x: 192, y: 0, size: 88, nowrap: true, parent: close });
    const L2 = h.text('Sete engrenagens.', { x: 192, y: 0, size: 88, nowrap: true, parent: close });
    const L3 = h.text('Um só <em>mecanismo.</em>', { x: 192, y: 0, size: 88, nowrap: true, parent: close });
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

    // ------------------------------------------------------------------ eyebrow (rodapé)
    const eb = h.eyebrow('O ALCANCE · A MÁQUINA INTEIRA', { x: 192, y: 1000, anchor: 'cl', parent: root });
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
    PL.forEach((p) => { init(p.g, { autoAlpha: 0 }); init(p.prox, { d: 0 }); init(p.label, { opacity: 0 }); init(p.hl, { opacity: 0 }); });
    init(rack, { y: 360 });
    blocks.forEach((B) => {
      init(B.blk, { opacity: 0, y: 0 });
      init(B.count, { opacity: 1 });
      init(B.cs.chars, { rotationX: -90, opacity: 0, transformPerspective: 300, transformOrigin: '50% 50%' });
      init(B.name, { scale: 1, transformOrigin: '0% 100%' });
      B.chips.forEach((c) => init(c.el, { x: c.sx, y: c.sy, scale: 0.6, opacity: 0 }));
    });
    init([...sp1.lines, ...sp2.lines, ...sp3.lines], { yPercent: 125 });
    init(close, { scale: 1, transformOrigin: '192px 530px' });
    init(ebSp.chars, { autoAlpha: 0 });
    init(ebDash, { scaleX: 0, transformOrigin: '0% 50%' });
    init(eb, { x: 0 });

    // 0,0–1,0 — o círculo viaja (960,540) r300 → (1640,540) r401
    tl.to(S, { gx: 1640, pr: 401, duration: 1, ease: 'mecca.inOut' }, 0);
    tl.to(body, { attr: { 'fill-opacity': 0.8 }, duration: 0.9, ease: 'power1.inOut' }, 0.4);
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

    // eyebrow no rodapé — digitação
    tl.to(ebDash, { scaleX: 1, duration: 0.3, ease: 'mecca.out' }, 0.5);
    tl.to(ebSp.chars, { autoAlpha: 1, duration: 0.01, ease: 'none', stagger: 0.025 }, 0.62);
    tl.to(eb, { x: 10, duration: 15.5, ease: 'none' }, 0.5);
    tl.to(ebSp.chars, { autoAlpha: 0, duration: 0.01, ease: 'none', stagger: { each: 0.009, from: 'end' } }, 16);
    tl.to(ebDash, { scaleX: 0, duration: 0.15, ease: 'mecca.in' }, 16.15);

    // ciclo de estações
    TS.forEach((T, i) => {
      const k = i + 1, B = blocks[i];
      tl.to(S, { th: STEP * k, duration: 0.5, ease: 'mecca.gear' }, T - 0.35);
      tl.to(rack, { y: -360 * i, duration: 0.5, ease: 'mecca.gear' }, T - 0.35);
      tl.to(B.blk, { opacity: 1, duration: 0.3, ease: 'power1.out' }, T - 0.35);
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
        // dim desacoplado do início da cremalheira (T+1,65): fica α 1 até T+2,0 para ganhar leitura
        tl.to(B.blk, { opacity: 0.4, duration: 0.4, ease: 'power1.inOut' }, T + 2);
        tl.to(B.count, { opacity: 0, duration: 0.3, ease: 'mecca.in' }, T + 2 - 0.35);
      }
      if (k < 6) tl.to(B.blk, { opacity: 0, duration: 0.5, ease: 'power1.in' }, T + 4 - 0.35);
      cue(T, 'click', STATIONS[i].name, 1.0);
    });
    cue(2, 'impact', 'Vendas', 0.35);
    cue(14, 'impact', 'Tecnologia', 0.6);

    // 16,0–17,0 — RECUO
    tl.to(blocks[5].blk, { y: -60, opacity: 0, duration: 0.3, ease: 'mecca.in' }, 16);
    tl.to(blocks[6].blk, { y: -60, opacity: 0, duration: 0.25, ease: 'mecca.in' }, 16.25);
    tl.to(nums.map((n) => n.t), { opacity: 0, duration: 0.3, ease: 'mecca.in' }, 16);
    tl.to([ringIn, ringHub, spokesG, win], { opacity: 0, duration: 0.3, ease: 'mecca.in' }, 16);
    tl.to(hubArcs, { opacity: 0, duration: 0.4, ease: 'mecca.in' }, 16);
    tl.to(S, { gx: 1400, gy: 560, gs: 0.31, duration: 1, ease: 'mecca.inOut' }, 16);
    tl.to(S, { hubK: 110 / (156 * 200 / 228), duration: 1, ease: 'mecca.inOut' }, 16);
    tl.to(S, { th: 360 + SUN_OFF, duration: 1, ease: 'mecca.inOut' }, 16);
    tl.to(body, { attr: { 'fill-opacity': 1 }, duration: 0.4, ease: 'power1.out' }, 16);
    tl.to(bg, { grid: 0, duration: 1, ease: 'mecca.inOut' }, 16);

    // 16,5–17,25 — 7 PLANETAS
    PL.forEach((p, i) => {
      const t0 = 16.5 + i * 0.06;
      tl.set(p.g, { autoAlpha: 1 }, t0);
      // pousam dentro da janela 16,5–17,25 (último: 16,86 + 0,39 = 17,25)
      tl.to(p.prox, { d: 198, duration: 0.39, ease: 'mecca.back' }, t0);
      tl.to(p.label, { opacity: 1, duration: 0.3, ease: 'power1.out' }, t0 + 0.25);
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

    // 21,5–22,0 — saída: a máquina encolhe para (1300,580) ×.55 (termina exatamente no último quadro)
    const OUT = LAST - 21.5;
    tl.to([...sp1.lines, ...sp2.lines, ...sp3.lines], { yPercent: -125, duration: 0.21, ease: 'mecca.in', stagger: 0.02 }, 21.5);
    tl.to(PL.map((p) => p.label), { opacity: 0, duration: 0.3, ease: 'mecca.in' }, 21.5);
    tl.to(S, { mx: 1300, my: 580, ms: 0.55, duration: OUT, ease: 'mecca.inOut' }, 21.5);
    tl.to(S, { orbA: 0, duration: OUT, ease: 'power1.in' }, 21.5);
    tl.to(body, { attr: { 'stroke-opacity': 0.5 }, duration: OUT, ease: 'mecca.inOut' }, 21.5);
    tl.to(bg, { particles: 1, duration: OUT, ease: 'mecca.inOut' }, 21.5);
    cue(21.75, 'whoosh', 'máquina recua', 0.5);

    // ================================================================== Ponto (analítico, para o rastro)
    const PC = { x: 1400, y: 560 };
    const PHI0 = Math.atan2(540 - PC.y, 1180 - PC.x);
    const RHO0 = Math.hypot(1180 - PC.x, 540 - PC.y);
    function orbitPos(t) {
      const u = t - 16;
      const rho = u < 1 ? lerp(RHO0, 390, EIO(clamp(u))) : 390;
      const phi = u < 2 ? 30 * u * u : 120 + 120 * (u - 2);   // acelera até 120°/s (período 3 s) em 18,0
      const a = PHI0 + phi * DEG;
      return { x: PC.x + rho * Math.cos(a), y: PC.y + rho * Math.sin(a) };
    }
    function pontoPos(t) {
      if (t <= 0) return { x: 660, y: 540 };
      if (t < 1) return { x: lerp(660, 1239, EIO(t)), y: 540 };
      if (t < 1.5) return { x: lerp(1239, 1180, EIO((t - 1) / 0.5)), y: 540 };
      if (t < 16) return { x: 1180, y: 540 };
      const o = orbitPos(t);
      if (t < 21.5) return o;
      const e = EIO(clamp((t - 21.5) / OUT));
      return { x: lerp(o.x, 1300, e), y: lerp(o.y, 580, e) };
    }
    function pulse(u) { // 0→1→0 em 0,45 s
      if (u < 0 || u > 0.45) return 0;
      return u < 0.1 ? P2O(u / 0.1) : 1 - EIO((u - 0.1) / 0.35);
    }
    function pontoR(t) {
      let p = 0;
      for (const T of TS) p = Math.max(p, pulse(t - T));
      return 10 + 6 * p;
    }
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
    onFrame((lt) => {
      // no quadro exato t = 0 a tl local ainda não renderizou o set do fundo: garante o estado do corte (54,0)
      if (lt < 1 / 60) Object.assign(bg, BG_IN);
      // perfil da engrenagem (círculo → dentes)
      const ro = S.pr + 19 * S.k, ri = S.pr - 14.6 * S.k;
      const key = ro.toFixed(2) + '|' + ri.toFixed(2);
      if (key !== lastKey) { const d = gearD(ri, ro, 28); body.setAttribute('d', d); gradP.setAttribute('d', d); lastKey = key; }

      // rotação contínua a partir de 18,0 (rampa de 0,3 s até 36°/s)
      const spin = spinAt(lt);
      const th = S.th + spin;

      machine.setAttribute('transform', `translate(${S.mx.toFixed(2)} ${S.my.toFixed(2)}) scale(${S.ms.toFixed(4)}) translate(-1400 -560)`);
      gearG.setAttribute('transform', `translate(${S.gx.toFixed(2)} ${S.gy.toFixed(2)}) scale(${S.gs.toFixed(4)})`);
      gearRot.setAttribute('transform', `rotate(${th.toFixed(3)})`);
      hubG.setAttribute('transform', `translate(${S.gx.toFixed(2)} ${S.gy.toFixed(2)}) scale(${(S.hubS * S.hubK).toFixed(4)})`);
      glow.setAttribute('opacity', (0.82 + 0.18 * Math.sin(lt * Math.PI * 0.5)).toFixed(3));

      for (let i = 0; i < 7; i++) {
        const a = (180 - STEP * (i + 1) + th) * DEG;
        const nx = S.gx + 330 * S.gs * Math.cos(a);
        nums[i].g.setAttribute('transform', `translate(${nx.toFixed(2)} ${(S.gy + 330 * S.gs * Math.sin(a)).toFixed(2)})`);
        // números que chegam à borda direita somem (nada de fragmentos de glifo cortados pelo quadro)
        nums[i].g.setAttribute('opacity', h.smooth(1880, 1810, nx).toFixed(3));
        const p = PL[i];
        const pa = p.ang * DEG, d = p.prox.d;
        p.g.setAttribute('transform', `translate(${(S.gx + d * Math.cos(pa)).toFixed(2)} ${(S.gy + d * Math.sin(pa)).toFixed(2)})`);
        // fase de engrenamento com o sol: θB = ψ + 180 + 180/NB − (NA/NB)(θA − ψ)
        const rotB = p.ang + 180 + 180 / 16 - (28 / 16) * (th - p.ang) + 90 * (1 - d / 198);
        p.rot.setAttribute('transform', `rotate(${rotB.toFixed(3)})`);
      }
      carc.g.setAttribute('transform', `rotate(${(-(spin - SPIN_END) / 3).toFixed(3)} 114 114)`);
      const bpos = `${((1 - S.shim) * 100).toFixed(2)}% 0, 0 0`;
      for (const em of ems) em.style.backgroundPosition = bpos;

      // ---------------- canvas
      ctx.clearRect(0, 0, 1920, 1080);
      const mc = { x: S.mx + (PC.x - 1400) * S.ms, y: S.my + (PC.y - 560) * S.ms };
      if (S.orbA > 0.003) {
        ctx.save();
        ctx.strokeStyle = hexA(P.lavender, S.orbA);
        ctx.lineWidth = 1.25;
        ctx.beginPath(); ctx.arc(mc.x, mc.y, 390 * S.ms, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      if (S.shock > 0 && S.shock < 1) {
        const e = P2O(S.shock), a = 0.5 * (1 - S.shock);
        const r = 350 + 550 * e;
        // a onda morre antes da coluna de texto (x ≤ 937): recorte em x ≥ 960 com borda suave 960→1030
        const fadeG = (col, al) => {
          const g = ctx.createLinearGradient(960, 0, 1030, 0);
          g.addColorStop(0, hexA(col, 0));
          g.addColorStop(1, hexA(col, al));
          return g;
        };
        ctx.save();
        ctx.beginPath(); ctx.rect(960, 0, 960, 1080); ctx.clip();
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
