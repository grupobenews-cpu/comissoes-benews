(() => {
/*
 * S05 — POR DENTRO · VERSÃO VERTICAL 9:16 (1080×1920)
 * "A gente entra por dentro do seu negócio, monta as engrenagens que faltam — e fica operando o motor com você."
 * (global 34–42 s, D 8, tail 0)
 *
 * Mesma coreografia, tempos, easings e cues da horizontal (src/scenes/s05-por-dentro.js); só o layout muda
 * (storyboard/vertical/VERTICAL_SPEC.md §2 S05 e §3):
 *   - eyebrow ENGENHARIA DE CRESCIMENTO em (90,270), 26 px, fora do push;
 *   - texto SG 700 80 em x 90, 7 linhas (ADAPTAÇÃO: as 6 da horizontal viram 7), baselines 380…960;
 *   - linha "Time embarcado: os mecca." (SG 600 56 px, x 90, bl 1055 — no lugar do antigo chip) em 5,0, que apresenta
 *     o termo (revisão global, item 1; equivale ao SG 600 44 px / bl 790 da horizontal);
 *   - máquina do cliente no palco: geometria horizontal com p' = (540,1280) + 1,1·(p − (1447,520)), raios × 1,1
 *     (fases e ω idênticas: a transformação preserva ângulos).
 *
 * Primeiro quadro (= último da S04, corte 34,0): bg padrão com warp 1 / speed 3; Ponto no V da pupila
 *   (540, 1115,1) r 6, núcleo #FBF8FF, glow padrão; nada mais.
 * Último quadro (= primeiro da S06, corte 42,0): só a elipse hairline lavanda α .3, 1,5 px — centro (250,1110),
 *   rx 120, ry 360, 0° (ADAPTAÇÃO: VERTICAL, a futura linha do tempo) — e o Ponto no ponto mais ALTO (250,750) r 10;
 *   máquina α 0; bg padrão; sem texto.
 *
 * Tudo o que é canvas e todas as transformações das engrenagens são funções puras de lt (calculadas em onFrame).
 */
MECCA.scene({
  id: 's05-por-dentro',
  build({ root, tl, h, P, bg, onFrame, cue, W, H }) {
    const SID = 's05-por-dentro';
    const SEL = `[data-scene="${SID}"]`;
    const TAU = Math.PI * 2, DEG = Math.PI / 180;
    const { clamp, lerp, hexA, smooth } = h;
    const E = (n) => gsap.parseEase(n);
    const eOut = E('mecca.out'), eIO = E('mecca.inOut'), eBack = E('mecca.back'), eGear = E('mecca.gear');
    const eP3io = E('power3.inOut'), eP2io = E('power2.inOut'), eP2o = E('power2.out');
    const seg = (t, a, b) => clamp((t - a) / (b - a));
    const f2 = (v) => (+v).toFixed(2);

    // ================================================================== layout vertical (spec §2 S05)
    const MX = 90;                                       // margem esquerda de texto
    const K = 1.1;                                       // escala da máquina (e dos efeitos em volta dela) vs. horizontal
    const HO = { x: 1447, y: 520 }, VO = { x: 540, y: 1280 };
    const T = (x, y) => ({ x: VO.x + K * (x - HO.x), y: VO.y + K * (y - HO.y) });   // espaço horizontal → vertical

    // ================================================================== CSS local
    h.el('style', {
      text: `
${SEL} .s5-layer { position:absolute; left:0; top:0; width:${W}px; height:${H}px; }
${SEL} .s5-abs { position:absolute; white-space:nowrap; }
${SEL} .s5-mask { overflow:hidden; padding:.12em .12em .28em; margin:-.12em -.12em -.28em; }
${SEL} .s5-txt { line-height:1.2; white-space:nowrap; }
${SEL} .s5-probe { display:inline-block; width:0; height:0; vertical-align:baseline; }
${SEL} .s5-txt em { --g0:#C026D3; --g1:#7C3AED; background:linear-gradient(90deg,var(--g0),var(--g1)); -webkit-background-clip:text; background-clip:text; color:transparent; }
`,
    }, root);

    // ================================================================== camadas (de baixo para cima)
    const textL = h.el('div', { cls: 's5-layer' }, root);
    const back = h.canvas(root);                         // planta técnica, metade de trás da órbita, mecca atrás
    const bx = back.ctx;
    const svgM = h.svg('svg', { class: 'fill', width: W, height: H, viewBox: `0 0 ${W} ${H}`, fill: 'none' }, root);
    const front = h.canvas(root);                        // metade da frente, mecca, Ponto, faíscas, ondas
    const fx = front.ctx;

    // ================================================================== TEXTO
    const pushW = h.el('div', { cls: 's5-layer' }, textL);   // push lento 1 → 1,02
    const titleW = h.el('div', { cls: 's5-layer' }, pushW);  // saída x −40 + fade
    const blocks = [0, 1, 2, 3].map(() => h.el('div', { cls: 's5-layer' }, titleW));

    function line(parent, html, baseline, size = 80, weight = 700) {
      const wrap = h.el('div', { cls: 's5-abs' }, parent);
      wrap.style.left = MX + 'px'; wrap.style.top = '0px'; wrap.style.fontSize = size + 'px';
      const mask = h.el('div', { cls: 's5-mask' }, wrap);
      const txt = h.el('div', { cls: 't-display s5-txt', html }, mask);
      txt.style.fontWeight = String(weight);
      const probe = h.el('span', { cls: 's5-probe' }, txt);
      const off = h.rect(probe).y - h.rect(wrap).y;
      probe.remove();
      wrap.style.top = (baseline - off).toFixed(2) + 'px';
      return { wrap, mask, txt };
    }
    // ADAPTAÇÃO: 7 linhas (quebras obrigatórias da spec); stagger de linha .08 dentro do bloco
    const LINES = [
      [0, 'A gente entra', 380], [0, '<em>por dentro</em> do seu', 470], [0, 'negócio,', 560],
      [1, '<em>monta</em> as engrenagens', 670], [1, 'que faltam —', 760],
      [2, 'e <em>fica operando</em>', 870], [2, 'o motor com você.', 960],
    ].map(([b, html, base]) => Object.assign(line(blocks[b], html, base), { b, base }));

    // máscara ampliada (.12em em cima, .28em embaixo): o texto parte de 1,2em + .28em = 123 % abaixo → 130 % (nada aparece antes da entrada)
    const MASK_Y0 = 130;
    const BT = [0.5, 2.0, 4.0];
    const inBlock = [0, 0, 0];
    LINES.forEach((L) => {
      const k = inBlock[L.b]++;
      tl.fromTo(L.txt, { yPercent: MASK_Y0 }, { yPercent: 0, duration: 0.6, ease: 'mecca.out' }, BT[L.b] + k * 0.08);
    });
    // escurecimento das linhas lidas: α .7 (não .5) e os <em> trocam o gradiente por #C4B5FD (0,3 s) — ver onFrame
    const DIM = [[blocks[0], 2.0], [blocks[1], 4.0]];
    DIM.forEach(([b, t0]) => tl.to(b, { opacity: 0.7, duration: 0.3, ease: 'power2.out' }, t0));
    const DIM_EM = DIM.map(([b, t0]) => ({ ems: [...b.querySelectorAll('em')], t0 }));

    // 'Time embarcado: os mecca.' — apresenta o termo (substitui o chip): SG 600 56 px (apoio em display da spec; 44/60 da
    //   horizontal ≈ 56/80), x 90, bl 1055 — tinta y ≈ 1016–1055, dentro da faixa do antigo chip (y 1000–1060), com o mesmo
    //   respiro de um salto de bloco; sem descendentes. Máscara 0,4 s mecca.out em 5,0; sai com o bloco em 7,5
    const TEAM = line(blocks[3], 'Time embarcado: <em>os mecca</em>.', 1055, 56, 600);
    const teamR0 = h.rect(TEAM.txt);                     // medida antes da máscara (yPercent)
    tl.fromTo(TEAM.txt, { yPercent: MASK_Y0 }, { yPercent: 0, duration: 0.4, ease: 'mecca.out' }, 5.0);

    // eyebrow digitado (0,025 s/char) e apagado de trás para frente · (90,270) 26 px, classe padrão (.26em), fora do push
    const eb = h.eyebrow('ENGENHARIA DE CRESCIMENTO', { x: MX, y: 270, anchor: 'cl', size: 26, parent: textL });
    const ebLbl = eb.querySelector('.lbl');
    const ebDash = eb.querySelector('.dash');
    const ebRight = h.rect(ebLbl).right;
    const ebChars = h.split(ebLbl, { type: 'chars' }).chars;
    gsap.set(ebChars, { autoAlpha: 0 });
    gsap.set(ebDash, { scaleX: 0, transformOrigin: '0% 50%' });
    tl.to(ebDash, { scaleX: 1, duration: 0.3, ease: 'mecca.out' }, 0.5);
    ebChars.forEach((c, i) => tl.set(c, { autoAlpha: 1 }, 0.55 + i * 0.025));
    [...ebChars].reverse().forEach((c, i) => tl.set(c, { autoAlpha: 0 }, 7.5 + i * 0.018));
    tl.to(ebDash, { scaleX: 0, duration: 0.14, ease: 'mecca.in' }, 7.79);

    // medidas do texto antes do push (conferência com a spec)
    const lineW = LINES.map((L) => h.rect(L.txt));

    // push lento (origem (90,670)) e saída do texto
    gsap.set(pushW, { transformOrigin: `${MX}px 670px` });
    tl.fromTo(pushW, { scale: 1 }, { scale: 1.02, duration: 6.5, ease: 'none', immediateRender: false }, 1.0);
    tl.to(titleW, { x: -40, duration: 0.3, ease: 'mecca.in' }, 7.5);
    tl.to(titleW, { opacity: 0, duration: 0.2, ease: 'sine.inOut' }, 7.5);   // 7,5–7,7: some antes de os mecca subirem pela coluna; sem salto no início nem no fim

    // ================================================================== MÁQUINA (geometria)
    const DEPTH = 18 * K;                                // altura de dente comum (19,8)
    const GD = {
      a: Object.assign(T(1180, 600), { r: 90 * K, n: 12, old: true }),
      b: Object.assign(T(1320, 519), { r: 90 * K, n: 12 }),
      c: Object.assign(T(1500, 585), { r: 120 * K, n: 16 }),
      d: Object.assign(T(1578, 450), { r: 60 * K, n: 8 }),
      e: Object.assign(T(1714, 426), { r: 90 * K, n: 12, old: true }),
    };
    // Gd engrena com Gc E com Ge: centro = interseção dos dois círculos de distância r1 + r2 − DEPTH
    (() => {
      const A = GD.c, B = GD.e, r1 = A.r + GD.d.r - DEPTH, r2 = B.r + GD.d.r - DEPTH;
      const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
      const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, r1 * r1 - a * a));
      const ux = dx / d, uy = dy / d, px = A.x + a * ux, py = A.y + a * uy;
      const c1 = { x: px - hh * uy, y: py + hh * ux }, c2 = { x: px + hh * uy, y: py - hh * ux };
      const ref = T(1578, 450);
      const pk = Math.hypot(c1.x - ref.x, c1.y - ref.y) < Math.hypot(c2.x - ref.x, c2.y - ref.y) ? c1 : c2;
      GD.d.x = pk.x; GD.d.y = pk.y;
    })();
    // fases: θB = ψ + 180° + 180°/NB − (NA/NB)·(θA − ψ)   (ψ = direção A→B) — iguais às da horizontal
    const phaseFrom = (A, B) => {
      const psi = Math.atan2(B.y - A.y, B.x - A.x) / DEG;
      return psi + 180 + 180 / B.n - (A.n / B.n) * (A.th - psi);
    };
    GD.a.th = 7;
    GD.b.th = phaseFrom(GD.a, GD.b);
    GD.c.th = phaseFrom(GD.b, GD.c);
    GD.d.th = phaseFrom(GD.c, GD.d);
    GD.e.th = phaseFrom(GD.d, GD.e);
    const KW = { a: 4 / 3, b: -4 / 3, c: 1, d: -2, e: 4 / 3 };   // ω relativo ao motor (Gc +60°/s)
    const MC = T(1450, 520);                             // centro da máquina (recuo de saída) ≈ (543,1280)

    // ângulo acumulado do motor: ω 0 → 60°/s em 0,6 s (power2.out: ω = W·(1 − (1−u)³)) a partir de 4,0
    //   θ = ∫ω = W·T·(u − (1 − (1−u)⁴)/4); depois da rampa, W·T·¾ + W·(t − 4,6)
    function motorA(t) {
      if (t <= 4) return 0;
      const Tr = 0.6, Wm = 60;
      if (t < 4 + Tr) { const u = (t - 4) / Tr; return Wm * Tr * (u - (1 - Math.pow(1 - u, 4)) / 4); }
      return Wm * Tr * (3 / 4) + Wm * (t - 4 - Tr);
    }
    // engrenagens velhas "travadas": tremem sem conseguir girar
    const JAM = { a: [1.0, 2.0], e: [1.5, 2.5] };
    function jam(key, t) {
      let v = 0;
      for (const b of JAM[key] || []) if (t > b) { const u = t - b; v += 2.2 * Math.sin(u * 38) * Math.exp(-u * 9); }
      return v;
    }

    // ================================================================== MÁQUINA (SVG)
    const defs = h.svg('defs', {}, svgM);
    const gid = h.uid('s5vgrad');
    const lg = h.svg('linearGradient', { id: gid, x1: 0, y1: 0, x2: 1, y2: 0.3 }, defs);
    h.svg('stop', { offset: 0, 'stop-color': P.magenta }, lg);
    h.svg('stop', { offset: 1, 'stop-color': P.violet }, lg);
    const machine = h.svg('g', {}, svgM);
    const NSS = 'non-scaling-stroke';
    const circD = (cx, cy, r) => `M${f2(cx + r)} ${f2(cy)}A${f2(r)} ${f2(r)} 0 1 0 ${f2(cx - r)} ${f2(cy)}A${f2(r)} ${f2(r)} 0 1 0 ${f2(cx + r)} ${f2(cy)}Z`;

    function mkGear(key) {
      const G = GD[key];
      const outer = h.svg('g', {}, machine);
      const rot = h.svg('g', {}, outer);
      const hubR = G.r * 0.2;
      const nh = G.n >= 16 ? 6 : G.n >= 12 ? 5 : 4;
      const hc = G.r * 0.5, hr = G.r * (G.n >= 12 ? 0.14 : 0.13);
      let d = h.gearPath({ teeth: G.n, r: G.r, depth: DEPTH / G.r, hole: 0, tip: 0.34, base: 0.58 });
      d += ' ' + circD(0, 0, hubR);
      for (let i = 0; i < nh; i++) { const a = TAU * i / nh + Math.PI / nh; d += ' ' + circD(hc * Math.cos(a), hc * Math.sin(a), hr); }
      const body = h.svg('path', {
        d, 'fill-rule': 'evenodd', fill: G.old ? P.bg2 : P.surface,
        stroke: G.old ? P.slate : `url(#${gid})`, 'stroke-opacity': G.old ? 0.6 : 1, 'stroke-width': f2((G.old ? 2 : 2.5) * K),
        'stroke-linejoin': 'round', 'vector-effect': NSS,
      }, rot);
      // anel interno (entre furos e raiz), só nas engrenagens maiores
      let ring = null;
      if (G.n >= 12) {
        const rr = (hc + hr + (G.r - DEPTH)) / 2;
        ring = h.svg('circle', { r: f2(rr), fill: 'none', stroke: G.old ? P.slate : P.lavender, 'stroke-opacity': G.old ? 0.35 : 0.3, 'stroke-width': 1, 'vector-effect': NSS }, outer);
      }
      // marca de rotação: pequeno entalhe radial no corpo (lê o giro mesmo de longe)
      const notch = h.svg('line', {
        x1: f2(hubR + 3 * K), y1: 0, x2: f2(hc - hr - 3 * K), y2: 0,
        stroke: G.old ? P.slate : P.lavender, 'stroke-opacity': G.old ? 0.5 : 0.55, 'stroke-width': f2(1.5 * K), 'stroke-linecap': 'round', 'vector-effect': NSS,
      }, rot);
      const axle = h.svg('circle', {
        r: f2(hubR * 0.58), fill: G.old ? P.bg2 : P.surface2, stroke: G.old ? P.slate : P.lavender,
        'stroke-opacity': G.old ? 0.6 : 0.8, 'stroke-width': f2(1.5 * K), 'vector-effect': NSS,
      }, outer);
      return { key, G, outer, rot, body, ring, notch, axle, hubR };
    }
    // ordem: velhas por baixo, novas por cima
    const GEAR = { a: mkGear('a'), e: mkGear('e'), b: mkGear('b'), c: mkGear('c'), d: mkGear('d') };

    // ================================================================== PONTO (0–2,0): diagnóstico
    // V da pupila (540, 1115,1) → (400, 1038) → Gb → Gc → Gd → (543, 983), onde se divide nos 4 mecca
    const V0 = { x: 540, y: 1115.1 };
    const WP = [V0, T(1320, 300), { x: GD.b.x, y: GD.b.y }, { x: GD.c.x, y: GD.c.y }, { x: GD.d.x, y: GD.d.y }, T(1450, 250)];
    const WT = [0, 0.5, 0.9, 1.3, 1.7, 2.0];
    const WV = [0, 1.9, 1.0, 1.0, 1.1, 0];              // velocidade (segmentos/s) em cada nó: desacelera nos vazios
    const SEGS = [];
    for (let i = 0; i < WP.length - 1; i++) {
      const p0 = WP[Math.max(0, i - 1)], p1 = WP[i], p2 = WP[i + 1], p3 = WP[Math.min(WP.length - 1, i + 2)];
      SEGS.push([p1, { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }, { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }, p2]);
    }
    const bez = (S, u) => {
      const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
      return { x: a * S[0].x + b * S[1].x + c * S[2].x + d * S[3].x, y: a * S[0].y + b * S[1].y + c * S[2].y + d * S[3].y };
    };
    function sParam(t) {                                // Hermite monotônico no tempo
      if (t <= 0) return 0;
      for (let i = 0; i < WT.length - 1; i++) {
        if (t <= WT[i + 1]) {
          const dt = WT[i + 1] - WT[i], u = (t - WT[i]) / dt;
          const h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
          return h00 * i + h01 * (i + 1) + dt * (h10 * WV[i] + h11 * WV[i + 1]);
        }
      }
      return WP.length - 1;
    }
    function pontoPos(t) {
      if (t <= 0) return WP[0];
      if (t >= 2.0) return WP[WP.length - 1];
      const s = clamp(sParam(t), 0, SEGS.length - 1e-9);
      const i = Math.floor(s);
      return bez(SEGS[i], s - i);
    }
    const pontoR = (t) => 6 + 4 * eP2io(seg(t, 0, 0.5));

    // ================================================================== MECCA (2,0 →)
    const SPLIT = WP[WP.length - 1];
    const FORM_W = 180;                                  // giro da formação (°/s)
    const TH0 = [80, -10, -100, -190];                   // ângulos iniciais m1..m4, 90° entre eles
    function formPos(k, t) {
      const R = 40 * K * eBack(seg(t, 2.0, 2.3));
      const a = (TH0[k] + FORM_W * Math.max(0, t - 2.0)) * DEG;
      return { x: SPLIT.x + R * Math.cos(a), y: SPLIT.y + R * Math.sin(a) };
    }
    const seat = (key) => ({ x: GD[key].x, y: GD[key].y });
    // voos (0,4 s, power3.inOut): chegam na batida · controles m1 (398,1082) m2 (660,1115) m3 (574,1181) m4 (788,968)
    const FL = [
      { t0: 2.1, t1: 2.5, to: seat('b'), c: T(1318, 340) },   // m1 → Gb
      { t0: 2.6, t1: 3.0, to: seat('c'), c: T(1556, 370) },   // m2 → Gc (motor)
      { t0: 3.1, t1: 3.5, to: seat('d'), c: T(1478, 430) },   // m3 → Gd
      { t0: 3.1, t1: 3.5, to: seat('e'), c: T(1672, 236) },   // m4 → toca Ge
    ];
    const ZAP = { t0: 3.5, t1: 3.8, from: seat('e'), to: seat('a'), c: T(1450, 150) };   // m4: Ge → toca Ga · controle (543,873)
    const LAND = { b: 2.5, c: 3.0, d: 3.5 };
    const MK = { b: 0, c: 1, d: 2 };
    const RECOL = { e: 3.5, a: 3.8 };                    // mecca 4 toca: slate → lavanda (0,4 s)
    const qb = (a, c, b, k) => { const u = 1 - k; return { x: u * u * a.x + 2 * u * k * c.x + k * k * b.x, y: u * u * a.y + 2 * u * k * c.y + k * k * b.y }; };

    // posição "de máquina" (antes da órbita)
    function meccaRaw(k, t) {
      if (t < 2.0) return pontoPos(t);
      const f = FL[k];
      if (t < f.t0) return formPos(k, t);
      if (t < f.t1) return qb(formPos(k, t), f.c, f.to, eP3io(seg(t, f.t0, f.t1)));
      if (k === 3) {
        if (t < ZAP.t0) return f.to;
        if (t < ZAP.t1) return qb(ZAP.from, ZAP.c, ZAP.to, eP2io(seg(t, ZAP.t0, ZAP.t1)));
        return ZAP.to;
      }
      return f.to;
    }
    const hubOf = [seat('b'), seat('c'), seat('d'), seat('a')];

    // ================================================================== ÓRBITA
    // ORB0: órbita dos mecca em volta da máquina (543,1280), rx 418, ry 143, −14°, período 4 s.
    // ORB1 (ADAPTAÇÃO): elipse VERTICAL (250,1110), rx 120, ry 360, 0° — a futura linha do tempo da S06.
    const ORB0 = { cx: MC.x, cy: MC.y, rx: 380 * K, ry: 130 * K, rot: -14 * DEG };
    const ORB1 = { cx: 250, cy: 1110, rx: 120, ry: 360, rot: 0 };
    const TOPA = -Math.PI / 2;                           // ponto mais ALTO da elipse final → (250,750)
    const OMEGA = TAU / 4;                               // período 4 s
    const PH0 = [225, 45, 315, 135].map((d) => d * DEG); // m1 Gb, m2 Gc, m3 Gd, m4 Ga → fases 0/90/180/270
    const OUT0 = 7.5, OUT1 = 7.95;                       // saída (termina antes do último quadro)
    function orbAt(t) {
      const u = eIO(seg(t, OUT0, OUT1));
      return { cx: lerp(ORB0.cx, ORB1.cx, u), cy: lerp(ORB0.cy, ORB1.cy, u), rx: lerp(ORB0.rx, ORB1.rx, u), ry: lerp(ORB0.ry, ORB1.ry, u), rot: lerp(ORB0.rot, ORB1.rot, u), u };
    }
    const orbAng0 = (k, t) => PH0[k] + OMEGA * (t - 4.5);
    // alvo de convergência: o −π/2 (topo) mais próximo do ângulo em 7,5
    const CONV = PH0.map((p, k) => { const a = orbAng0(k, OUT0); return a + (((TOPA - a) % TAU) + TAU + Math.PI) % TAU - Math.PI; });
    function orbAng(k, t) {
      const a = orbAng0(k, t);
      if (t <= OUT0) return a;
      return lerp(a, CONV[k], eIO(seg(t, OUT0, 7.88)));
    }
    const depthA = (ang) => 0.75 + 0.25 * clamp(Math.sin(ang) * 4, -1, 1);   // metade de trás α .5

    // estado de máquina (recuo de saída + tranco do motor)
    const MX0 = 7.45, MX1 = 7.9;                        // recuo de saída
    function machineT(t) {
      const u = seg(t, MX0, MX1);
      const ks = eIO(u), ka = u * u;                     // escala 1 → .5 (mecca.inOut) · alfa 1 → 0 (power1.in: sem salto no fim)
      let dx = 0, dy = 0;
      if (t >= 4.0 && t < 4.45) {
        const w = t - 4.0, env = Math.exp(-w * 10) * (1 - seg(t, 4.3, 4.45));
        dx = 4 * K * Math.sin(w * 97) * env; dy = 3 * K * Math.sin(w * 131 + 1.3) * env;
      }
      return { s: 1 - 0.5 * ks, a: 1 - ka, dx, dy };
    }
    const mApply = (p, M) => ({ x: MC.x + (p.x - MC.x) * M.s + M.dx, y: MC.y + (p.y - MC.y) * M.s + M.dy });

    // posição de tela de cada mecca + profundidade (1 frente, <1 atrás) + peso no canvas de trás
    const ENTER0 = 4.5, ENTER1 = 5.1;
    function meccaAt(k, t) {
      if (t < ENTER0) {
        const p = mApply(meccaRaw(k, t), machineT(t));
        return { x: p.x, y: p.y, a: 1, backW: 0 };
      }
      const O = orbAt(t), ang = orbAng(k, t);
      const q = h.ellipsePt(O.cx, O.cy, O.rx, O.ry, O.rot, ang);
      let dA = depthA(ang), isBack = Math.sin(ang) < 0;
      if (t > OUT0) dA = lerp(dA, 1, O.u);
      // na saída todos convergem para o topo (metade "de trás"): passam para a frente enquanto a máquina some
      const bw = isBack ? (t > OUT0 ? 1 - O.u : 1) : 0;
      if (t < ENTER1) {
        const e = eIO(seg(t, ENTER0, ENTER1));
        const hb = hubOf[k];
        return { x: lerp(hb.x, q.x, e), y: lerp(hb.y, q.y, e), a: lerp(1, dA, e), backW: bw * e };
      }
      return { x: q.x, y: q.y, a: dA, backW: bw };
    }
    const meccaXY = (k, t) => { const m = meccaAt(k, t); return { x: m.x, y: m.y }; };

    // ================================================================== estado das engrenagens (função de lt)
    function gearState(key, t) {
      const G = GD[key];
      const A = motorA(t);
      if (G.old) {
        const ap = key === 'a' ? [0.05, 0.85] : [0.15, 0.95];
        const k = eOut(seg(t, ap[0], ap[1]));
        return { x: G.x, y: G.y, s: 0.9 + 0.1 * k, o: k, ang: G.th + jam(key, t) + KW[key] * A };
      }
      const TL = LAND[key], Ts = TL - 0.19;              // engate cheio cai na batida (mecca.gear chega a 1 em ~42 %)
      if (t < Ts) return { o: 0 };
      const e = eGear(seg(t, Ts, Ts + 0.45));
      const c = t < TL ? meccaRaw(MK[key], t) : seat(key);
      return { x: c.x, y: c.y, s: Math.max(0.001, e), o: clamp(e * 6), ang: G.th - 90 * (1 - e) + KW[key] * A };
    }
    const EM_DIM = P.lilac;                           // #C4B5FD
    const hex2rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const mixHex = (a, b, k) => {
      const A = hex2rgb(a), B = hex2rgb(b);
      return '#' + [0, 1, 2].map((i) => Math.round(lerp(A[i], B[i], k)).toString(16).padStart(2, '0')).join('');
    };
    const recolK = (key, t) => eP2o(seg(t, RECOL[key], RECOL[key] + 0.4));

    function updateGears(t, M) {
      machine.setAttribute('transform', `translate(${f2(MC.x + M.dx)} ${f2(MC.y + M.dy)}) scale(${M.s.toFixed(4)}) translate(${f2(-MC.x)} ${f2(-MC.y)})`);
      machine.setAttribute('opacity', M.a.toFixed(3));
      for (const key of ['a', 'e', 'b', 'c', 'd']) {
        const g = GEAR[key], st = gearState(key, t);
        if (st.o <= 0.001) { g.outer.setAttribute('visibility', 'hidden'); continue; }
        g.outer.setAttribute('visibility', 'visible');
        g.outer.setAttribute('transform', `translate(${f2(st.x)} ${f2(st.y)}) scale(${st.s.toFixed(4)})`);
        g.outer.setAttribute('opacity', st.o.toFixed(3));
        g.rot.setAttribute('transform', `rotate(${st.ang.toFixed(3)})`);
        if (g.G.old) {
          const k = recolK(key, t);
          const col = mixHex(P.slate, P.lavender, k);
          g.body.setAttribute('stroke', col);
          g.body.setAttribute('stroke-opacity', lerp(0.6, 1, k).toFixed(3));
          g.axle.setAttribute('stroke', col);
          g.axle.setAttribute('stroke-opacity', lerp(0.6, 0.8, k).toFixed(3));
          g.notch.setAttribute('stroke', col);
          if (g.ring) { g.ring.setAttribute('stroke', col); g.ring.setAttribute('stroke-opacity', lerp(0.35, 0.3, k).toFixed(3)); }
        }
      }
      // cubo do motor acende (#7C3AED) em 4,0
      const hk = eP2o(seg(t, 4.0, 4.3));
      GEAR.c.axle.setAttribute('fill', mixHex(P.surface2, P.violet, hk));
      GEAR.c.axle.setAttribute('stroke', mixHex(P.lavender, P.lilac, hk));
    }

    // ================================================================== desenho: utilidades
    const MAG = hex2rgb(P.magenta), VIO = hex2rgb(P.violet), PINK = hex2rgb(P.pink);
    const mixA = (A, B, k, a) => `rgba(${Math.round(lerp(A[0], B[0], k))},${Math.round(lerp(A[1], B[1], k))},${Math.round(lerp(A[2], B[2], k))},${a})`;

    // fita afunilada pelas amostras (pts[0] = cabeça); comprimento limitado
    function ribbon(c, pts, w0, amt, colA = MAG, colB = VIO, maxLen = 340) {
      if (amt <= 0.002 || pts.length < 2) return;
      const P2 = [pts[0]];
      let acc = 0;
      for (let i = 1; i < pts.length; i++) {
        const a = P2[P2.length - 1], b = pts[i];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        if (acc + d > maxLen) { const k = (maxLen - acc) / d; P2.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }); break; }
        acc += d; P2.push(b);
      }
      const head = P2[0], tail = P2[P2.length - 1];
      if (Math.hypot(tail.x - head.x, tail.y - head.y) < 3) return;
      const N = P2.length - 1, L = [], R = [];
      let nx = 0, ny = -1;
      for (let i = 0; i <= N; i++) {
        const a = P2[Math.max(0, i - 1)], b = P2[Math.min(N, i + 1)];
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
        if (len > 1e-3) { nx = -dy / len; ny = dx / len; }
        const w = w0 * Math.pow(1 - i / N, 0.9) + 0.3;
        L.push([P2[i].x + nx * w, P2[i].y + ny * w]); R.push([P2[i].x - nx * w, P2[i].y - ny * w]);
      }
      const g = c.createLinearGradient(head.x, head.y, tail.x, tail.y);
      g.addColorStop(0, mixA(colA, colB, 0, 0.72 * amt));
      g.addColorStop(0.45, mixA(colA, colB, 0.5, 0.34 * amt));
      g.addColorStop(1, mixA(colA, colB, 1, 0));
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(L[0][0], L[0][1]);
      for (let i = 1; i <= N; i++) c.lineTo(L[i][0], L[i][1]);
      for (let i = N; i >= 0; i--) c.lineTo(R[i][0], R[i][1]);
      c.closePath(); c.fill();
    }
    function drawPontoDot(c, p, r, a = 1) {
      if (a <= 0.002) return;
      h.glowDot(c, p.x, p.y, r, P.lavender, 0.6 * a);
      c.fillStyle = hexA(P.ink, a);
      c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.fill();
    }
    function drawMeccaDot(c, p, r, a = 1, lav = 0) {
      if (a <= 0.002) return;
      h.glowDot(c, p.x, p.y, r, lav > 0.5 ? P.lavender : P.pink, (lav > 0.5 ? 0.6 : 0.5) * a);
      // halo rosa #E249B0 α .5 colado ao núcleo (identidade dos mecca)
      const hk = a * (1 - lav);
      if (hk > 0.002) {
        const g = c.createRadialGradient(p.x, p.y, r * 0.8, p.x, p.y, r * 2.9);
        g.addColorStop(0, hexA(P.pink, 0.5 * hk)); g.addColorStop(1, hexA(P.pink, 0));
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, r * 2.9, 0, TAU); c.fill();
      }
      c.fillStyle = hexA(P.ink, a);
      c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.fill();
    }
    function ringAt(c, x, y, r, a, col = P.lavender, lw = 2) {
      if (a <= 0.002 || r <= 0) return;
      c.strokeStyle = hexA(col, a); c.lineWidth = lw;
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke();
    }
    // arco da órbita repartido entre metade de trás (canvas de trás) e da frente
    function strokeOrbitArc(O, a0, a1, aF, aB) {
      let s = a0;
      let guard = 0;
      while (s < a1 - 1e-6 && guard++ < 8) {
        const nb = (Math.floor(s / Math.PI + 1e-9) + 1) * Math.PI;
        const e = Math.min(a1, nb);
        const isBack = Math.sin((s + e) / 2) < 0;
        const c = isBack ? bx : fx;
        const a = isBack ? aB : aF;
        if (a > 0.002) {
          c.strokeStyle = hexA(P.lavender, a); c.lineWidth = 1.5;
          c.beginPath(); c.ellipse(O.cx, O.cy, O.rx, O.ry, O.rot, s, e); c.stroke();
        }
        s = e;
      }
    }

    // ================================================================== desenho: planta técnica (canvas de trás, espaço da máquina)
    const SLOTS = [['b', 0.3], ['c', 0.36], ['d', 0.42]];
    const XT = { b: 0.9, c: 1.3, d: 1.7 };
    const CHAIN = ['a', 'b', 'c', 'd', 'e'];
    function xScale(TX, t) {
      if (t < TX) return 0;
      const u = (t - TX) / 0.25;
      if (u < 0.5) return eOut(u / 0.5);
      if (u < 1) return 1 - 0.2 * eIO((u - 0.5) / 0.5);
      return 0.8 * (1 + 0.07 * Math.sin(TAU * 2 * (t - TX - 0.25)));
    }
    function drawBlueprint(c, t) {
      const fadeAll = 1 - 0.5 * seg(t, 4.0, 5.0);
      // linhas de construção entre centros (tracejado fino), desenhadas em cadeia 0,3–1,0
      const q = eOut(seg(t, 0.3, 1.0));
      if (q > 0.001) {
        c.save();
        c.setLineDash([3, 7]); c.lineDashOffset = -t * 10;
        c.strokeStyle = hexA(P.lavender, 0.2 * fadeAll); c.lineWidth = K;
        const total = CHAIN.length - 1, upto = q * total;
        c.beginPath();
        for (let i = 0; i < total; i++) {
          if (upto <= i) break;
          const A = GD[CHAIN[i]], B = GD[CHAIN[i + 1]], k = Math.min(1, upto - i);
          c.moveTo(A.x, A.y); c.lineTo(lerp(A.x, B.x, k), lerp(A.y, B.y, k));
        }
        c.stroke();
        c.restore();
        // marcas de centro
        c.strokeStyle = hexA(P.lavender, 0.4 * q * fadeAll); c.lineWidth = K;
        for (const key of CHAIN) {
          const G = GD[key], m = 7 * K;
          c.beginPath(); c.moveTo(G.x - m, G.y); c.lineTo(G.x + m, G.y); c.moveTo(G.x, G.y - m); c.lineTo(G.x, G.y + m); c.stroke();
        }
      }
      // encaixes vazios: círculo primitivo tracejado (lavanda α .35, dash 4/6), desenhado 0,3–1,0
      for (const [key, t0] of SLOTS) {
        const G = GD[key], rp = G.r - DEPTH / 2;
        const p = eOut(seg(t, t0, t0 + 0.58));
        const Ts = LAND[key] - 0.19;
        const a = 0.35 * (1 - seg(t, Ts, Ts + 0.2));
        if (p <= 0.001 || a <= 0.002) continue;
        const pinkK = 0.55 * seg(t, XT[key], XT[key] + 0.25);
        c.save();
        c.setLineDash([4, 6]); c.lineDashOffset = -t * 12;
        c.strokeStyle = hexA(mixHex(P.lavender, P.pink, pinkK), a); c.lineWidth = 1.5 * K;
        c.beginPath(); c.arc(G.x, G.y, rp, -Math.PI / 2, -Math.PI / 2 + TAU * p); c.stroke();
        // raiz/topo do dente em hairline mais apagado (medidas da peça que falta)
        c.setLineDash([2, 8]);
        c.strokeStyle = hexA(P.lavender, a * 0.35); c.lineWidth = K;
        c.beginPath(); c.arc(G.x, G.y, G.r, -Math.PI / 2, -Math.PI / 2 + TAU * p); c.stroke();
        c.restore();
      }
      // '×' rosa em cada vazio: pulsa 0→1→.8 quando o Ponto passa, some quando a peça chega
      for (const [key] of SLOTS) {
        const G = GD[key], s = xScale(XT[key], t);
        const Ts = LAND[key] - 0.19;
        const a = 1 - seg(t, Ts, Ts + 0.12);
        if (s <= 0.001 || a <= 0.002) continue;
        const m = 12 * K * s;
        c.save();
        c.lineCap = 'round'; c.lineWidth = 3.5 * K;
        c.shadowColor = hexA(P.pink, 0.9 * a); c.shadowBlur = 14;
        c.strokeStyle = hexA(P.pink, a);
        c.beginPath(); c.moveTo(G.x - m, G.y - m); c.lineTo(G.x + m, G.y + m); c.moveTo(G.x + m, G.y - m); c.lineTo(G.x - m, G.y + m); c.stroke();
        c.restore();
      }
    }

    // ================================================================== desenho: efeitos no espaço da máquina (canvas da frente)
    function drawMachineFx(c, t) {
      // pings do diagnóstico
      for (const key of ['b', 'c', 'd']) {
        const TX = XT[key], u = seg(t, TX, TX + 0.35);
        if (u > 0 && u < 1) ringAt(c, GD[key].x, GD[key].y, K * lerp(12, 48, eP2o(u)), 0.5 * (1 - u), P.pink, 1.5 * K);
      }
      // anéis de faísca no engate (r → r + 40, α .6 → 0, 0,35 s) + estilhaços radiais
      for (const key of ['b', 'c', 'd']) {
        const G = GD[key], TL = LAND[key], u = seg(t, TL, TL + 0.35);
        if (u <= 0 || u >= 1) continue;
        const e = eP2o(u);
        ringAt(c, G.x, G.y, G.r + 40 * K * e, 0.6 * (1 - u), P.lavender, 2 * K);
        c.save();
        c.lineCap = 'round'; c.lineWidth = 2 * K;
        const n = 10, ph = key.charCodeAt(0) * 0.7;
        for (let i = 0; i < n; i++) {
          const a = ph + TAU * i / n;
          const r0 = G.r + K * (4 + 26 * e), r1 = G.r + K * (10 + 44 * e);
          c.strokeStyle = hexA(i % 2 ? P.pink : P.lilac, 0.85 * (1 - u));
          c.beginPath(); c.moveTo(G.x + r0 * Math.cos(a), G.y + r0 * Math.sin(a)); c.lineTo(G.x + r1 * Math.cos(a), G.y + r1 * Math.sin(a)); c.stroke();
        }
        c.restore();
      }
      // toque do mecca 4 nas velhas (recalibra)
      for (const key of ['e', 'a']) {
        const G = GD[key], TR = RECOL[key], u = seg(t, TR, TR + 0.4);
        if (u <= 0 || u >= 1) continue;
        ringAt(c, G.x, G.y, lerp(20 * K, G.r + 30 * K, eP2o(u)), 0.55 * (1 - u), P.lavender, 1.5 * K);
        ringAt(c, G.x, G.y, lerp(10 * K, G.r * 0.6, eP2o(u)), 0.4 * (1 - u), P.pink, K);
      }
      // motor: cubo aceso (glow que respira) + onda r 132 → 242
      const hk = eP2o(seg(t, 4.0, 4.3));
      if (hk > 0.001) {
        const G = GD.c, br = 0.85 + 0.15 * Math.sin(TAU * 2 * (t - 4.0));
        const R = 64 * K;
        const g = c.createRadialGradient(G.x, G.y, 0, G.x, G.y, R);
        g.addColorStop(0, hexA(P.violet, 0.75 * hk * br));
        g.addColorStop(0.35, hexA(P.violet, 0.3 * hk * br));
        g.addColorStop(1, hexA(P.violet, 0));
        c.fillStyle = g; c.beginPath(); c.arc(G.x, G.y, R, 0, TAU); c.fill();
      }
      {
        const u = seg(t, 4.0, 4.5);
        if (u > 0 && u < 1) {
          const e = eP2o(u);
          ringAt(c, GD.c.x, GD.c.y, K * lerp(120, 220, e), 0.6 * (1 - u), P.lavender, 2.5 * K);
          ringAt(c, GD.c.x, GD.c.y, K * lerp(120, 190, e), 0.35 * (1 - u), P.magenta, 1.5 * K);
        }
      }
    }

    // aura violeta atrás do trem (saudável a partir do motor) — canvas de trás, espaço da máquina
    function drawAura(c, t) {
      const a = 0.14 * eP2o(seg(t, 4.0, 4.6)) * (1 + 0.12 * Math.sin(TAU * 0.5 * (t - 4.0)));
      if (a <= 0.002) return;
      const R = 440 * K, cy = MC.y + 20 * K;
      const g = c.createRadialGradient(MC.x, cy, 0, MC.x, cy, R);
      g.addColorStop(0, hexA(P.violet, a));
      g.addColorStop(0.6, hexA(P.violet, a * 0.35));
      g.addColorStop(1, hexA(P.violet, 0));
      c.fillStyle = g; c.beginPath(); c.arc(MC.x, cy, R, 0, TAU); c.fill();
    }

    // ================================================================== desenho: órbita + mecca + Ponto
    function drawOrbit(t) {
      if (t < 4.8) return;
      const O = orbAt(t);
      if (O.u >= 0.9999) {
        // estado exato do corte 42,0 = 1º quadro da S06: elipse inteira α .3, 1,5 px (mesmo traçado da S06)
        bx.save();
        bx.strokeStyle = hexA(P.lavender, 0.3); bx.lineWidth = 1.5;
        bx.beginPath(); bx.ellipse(ORB1.cx, ORB1.cy, ORB1.rx, ORB1.ry, 0, 1.5 * Math.PI, 0.5 * Math.PI, true); bx.stroke();
        bx.beginPath(); bx.ellipse(ORB1.cx, ORB1.cy, ORB1.rx, ORB1.ry, 0, -0.5 * Math.PI, 0.5 * Math.PI, false); bx.stroke();
        bx.restore();
        return;
      }
      const p = eIO(seg(t, 4.8, 5.8));
      const aF = 0.3, aB = 0.3 * lerp(0.5, 1, O.u);
      if (p >= 0.999) { strokeOrbitArc(O, Math.PI, 3 * Math.PI, aF, aB); return; }
      for (let k = 0; k < 4; k++) {
        const a1 = orbAng(k, t);
        const a0 = a1 - p * Math.PI / 2;
        const off = Math.floor(a0 / TAU) * TAU;
        strokeOrbitArc(O, a0 - off, a1 - off, aF, aB);
      }
    }
    // n amostras de rastro a cada dt, com 3 sub-amostras entre elas (curva lisa mesmo em alta velocidade)
    function trailPts(fn, t, n, dt, tMin) {
      const pts = [], m = n * 3;
      for (let i = 0; i <= m; i++) pts.push(fn(Math.max(tMin, t - i * dt / 3)));
      return pts;
    }
    function drawMeccas(t) {
      if (t < 2.0) return;
      const born = seg(t, 2.0, 2.08);
      const merge = smooth(7.74, 7.9, t);             // os 4 viram um só Ponto
      for (let k = 0; k < 4; k++) {
        const m = meccaAt(k, t);
        const p = { x: m.x, y: m.y };
        const q = meccaXY(k, t - 1 / 60);
        const speed = Math.hypot(p.x - q.x, p.y - q.y) * 60;
        const amt = smooth(120, 420, speed);
        const r = lerp(7, 10, merge);
        const alpha = born * (1 - merge);
        const pts = trailPts((tt) => meccaXY(k, tt), t, 6, 1 / 36, 2.0);
        const layers = [[fx, 1 - m.backW], [bx, m.backW]];
        for (const [c, w] of layers) {
          if (w <= 0.001) continue;
          const a = alpha * m.a * w;
          ribbon(c, pts, r * 0.9, amt * a, t > 7.4 ? MAG : PINK, VIO);
          drawMeccaDot(c, p, r, a, merge);
        }
      }
      // Ponto reunido no ponto mais ALTO da órbita (vira o topo da linha do tempo vertical da S06)
      if (merge > 0.001) {
        const O = orbAt(t);
        const pp = (tt) => { const o = orbAt(tt); return h.ellipsePt(o.cx, o.cy, o.rx, o.ry, o.rot, TOPA); };
        const p = pp(t);
        const q = pp(t - 1 / 60);
        const speed = Math.hypot(p.x - q.x, p.y - q.y) * 60;
        const amt = smooth(600, 1000, speed);
        ribbon(fx, trailPts(pp, t, 8, 1 / 60, OUT0), 9, amt * merge);
        drawPontoDot(fx, O.u >= 0.9999 ? { x: ORB1.cx, y: ORB1.cy - ORB1.ry } : p, 10, merge);
      }
    }
    function drawPonto(t) {
      if (t >= 2.14) return;
      const a = 1 - seg(t, 2.0, 2.14);
      const p = pontoPos(t), q = pontoPos(Math.max(0, t - 1 / 60));
      const speed = Math.hypot(p.x - q.x, p.y - q.y) * 60;
      const amt = smooth(600, 900, speed);
      const r = t < 2.0 ? pontoR(t) : lerp(10, 7, seg(t, 2.0, 2.14));
      ribbon(fx, trailPts(pontoPos, t, 8, 1 / 60, 0), r * 0.9, amt * a);
      drawPontoDot(fx, p, r, a);
      // divisão: flash + anel
      const u = seg(t, 2.0, 2.4);
      if (u > 0 && u < 1) {
        ringAt(fx, SPLIT.x, SPLIT.y, K * lerp(10, 72, eP2o(u)), 0.7 * (1 - u), P.lilac, 2);
      }
    }
    function drawSplitGlow(t) {
      const u = seg(t, 2.0, 2.45);
      if (u <= 0 || u >= 1) return;
      const R = K * lerp(30, 120, eP2o(u)), a = 0.35 * (1 - u);
      const g = fx.createRadialGradient(SPLIT.x, SPLIT.y, 0, SPLIT.x, SPLIT.y, R);
      g.addColorStop(0, hexA(P.pink, a)); g.addColorStop(1, hexA(P.pink, 0));
      fx.fillStyle = g; fx.beginPath(); fx.arc(SPLIT.x, SPLIT.y, R, 0, TAU); fx.fill();
    }

    // ================================================================== FUNDO (idêntico à horizontal)
    const BG_IN = { glowA: 1, glowB: 1, glowC: 1, grid: 0, particles: 1, driftX: 0, driftY: 0, speed: 3, warp: 1, vignette: 0.55, dim: 0, hue: 0, grain: 1 };
    tl.set(bg, { glowA: 1, glowB: 1, glowC: 1, grid: 0, particles: 1, driftX: 0, driftY: 0, vignette: 0.55, dim: 0, hue: 0, grain: 1 }, 0);
    tl.fromTo(bg, { warp: 1, speed: 3 }, { warp: 0, speed: 1, duration: 0.6, ease: 'expo.out', immediateRender: false }, 0);
    // motor liga: leve bloom do radial de baixo, volta ao padrão bem antes do corte
    tl.to(bg, { glowC: 1.3, duration: 0.15, ease: 'power2.out' }, 4.0);
    tl.to(bg, { glowC: 1, duration: 1.4, ease: 'sine.inOut' }, 4.15);

    // ================================================================== onFrame
    onFrame((lt) => {
      if (lt < 1 / 60) Object.assign(bg, BG_IN);        // estado exato do corte (34,0) no quadro t = 0
      const M = machineT(lt);
      updateGears(lt, M);

      for (const c of [bx, fx]) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); }

      // --- espaço da máquina
      const mt = [M.s, 0, 0, M.s, MC.x + M.dx - MC.x * M.s, MC.y + M.dy - MC.y * M.s];
      if (M.a > 0.001) {
        bx.save(); bx.setTransform(...mt); bx.globalAlpha = M.a;
        drawAura(bx, lt);
        drawBlueprint(bx, lt);
        bx.restore();
        fx.save(); fx.setTransform(...mt); fx.globalAlpha = M.a;
        drawMachineFx(fx, lt);
        fx.restore();
      }

      // --- espaço da tela
      drawOrbit(lt);
      drawSplitGlow(lt);
      drawPonto(lt);
      drawMeccas(lt);

      // <em> das linhas escurecidas: gradiente #C026D3→#7C3AED → #C4B5FD sólido (0,3 s, power2.out)
      for (const D of DIM_EM) {
        const k = eP2o(seg(lt, D.t0, D.t0 + 0.3));
        const g0 = mixHex(P.magenta, EM_DIM, k), g1 = mixHex(P.violet, EM_DIM, k);
        for (const e of D.ems) { e.style.setProperty('--g0', g0); e.style.setProperty('--g1', g1); }
      }
    });

    // ================================================================== SOM (idêntico à horizontal)
    cue(0, 'impact', 'chegada', 0.6);
    cue(0.9, 'tick', 'diagnóstico', 0.4);
    cue(1.3, 'tick', 'diagnóstico', 0.4);
    cue(1.7, 'tick', 'diagnóstico', 0.4);
    cue(2, 'chime', 'divide em 4 mecca', 0.5);
    cue(2.5, 'click', 'engrenagem montada', 0.7);
    cue(3, 'click', 'engrenagem montada', 0.7);
    cue(3.5, 'click', 'engrenagem montada', 0.7);
    cue(4, 'impact', 'motor liga', 0.8);
    cue(4, 'sub-drop', 'motor liga', 0.4);
    cue(5, 'click', 'chip', 0.4);   // entrada de 'Time embarcado: os mecca.' (nota igual à da horizontal)
    cue(7.75, 'whoosh', 'máquina recua, órbita vira plano de voo', 0.5);

    // medidas para revisão (conferência com a spec vertical)
    const r1 = (v) => Math.round(v * 10) / 10;
    root.dataset.s5 = JSON.stringify({
      lines: lineW.map((r) => [r1(r.x), r1(r.right), r1(r.w)]),
      team: [r1(teamR0.x), r1(teamR0.y), r1(teamR0.right), r1(teamR0.bottom)],
      ebRight: r1(ebRight),
      gd: CHAIN.map((k) => [r1(GD[k].x), r1(GD[k].y), r1(GD[k].r)]),
      phases: CHAIN.map((k) => r1(GD[k].th)),
      mc: [r1(MC.x), r1(MC.y)], split: [r1(SPLIT.x), r1(SPLIT.y)], wp1: [r1(WP[1].x), r1(WP[1].y)],
      ctrl: FL.map((f) => [r1(f.c.x), r1(f.c.y)]).concat([[r1(ZAP.c.x), r1(ZAP.c.y)]]),
    });
  },
});
})();
