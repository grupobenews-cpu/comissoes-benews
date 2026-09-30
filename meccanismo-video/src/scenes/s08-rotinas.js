(() => {
/*
 * S08 — O que gira por dentro.  (global 76–82 s, D = 6 s, tail 0)
 *
 * 0,0        match cut com a S07: máquina (sol + 7 planetas + carcaça) em (1300,580) ×.55, girando; Ponto no cubo.
 * 0,5–1,6    eyebrow "AS ROTINAS · O QUE GIRA POR DENTRO" digitado + "É o que os mecca rodam / enquanto você dorme."
 *            por máscara.
 * 1,5–3,0    os 4 anéis de rotina acendem (um por batida) junto com a legenda ROTINAS (mono 26 px logo abaixo da
 *            manchete, baselines 470/520/570/620/670): cada item puxa um leader line hairline até a ponta esquerda
 *            do seu anel (onde o traço do anel começa a se desenhar); as partículas saem do Ponto.
 * 3,0        o Ponto se divide nos 4 mecca; 3,0–4,0 modo noite (fundo escurece, anéis brilham, ×1,25).
 * 3,5–5,0    a cada batida os mecca saltam para o anel vizinho.  5,0–5,75 a noite se desfaz.
 * 5,5–6,0    os 4 anéis se recolhem em D1/D2 em volta de (1440,560); a máquina vai a ×.45; os mecca
 *            convergem no Ponto em (1750,483) — match cut com a S09.
 *
 * ÚLTIMO QUADRO (t = D − 1/30), para quem casa a S09:
 *   máquina = mesma montagem da S07 (sol r 420×.31 com 28 dentes, 7 planetas r 78 a 198, pupila 110 px, carcaça 710 px)
 *   com transform translate(1440 560) scale(.45) translate(−1400 −560), α 1, girando (sol +36°/s, planetas −63°/s);
 *   ângulos nesse quadro: sol θ = 232,875° (= 1,446° além de um dente canônico), planeta ψ: θB = ψ + 191,25° − 1,75·(θ − ψ).
 *   Carcaça: oscilação COMPARTILHADA S07/S08/S09, função do tempo GLOBAL — carcAngle(gt) = 18°·sin(2π(gt − 72)/4)·
 *   smooth(72, 72,6, gt) (0 antes de 72): 0° exatos nos cortes 76,0 e 82,0 (+0,942° neste quadro), velocidade contínua.
 *   D1: centro (1440,560) rx 220 ry 70, D2: rx 320 ry 100, rot −14°, hairline 1,25 px lavanda α .3
 *   (metade de trás no canvas de trás com α .15).  Ponto em (1750,483), r 10.  Fundo padrão.  Sem texto.
 */
MECCA.scene({
  id: 's08-rotinas',
  build({ root, tl, D, h, P, bg, onFrame, cue }) {
    const ID = 's08-rotinas';
    const SEL = `[data-scene="${ID}"]`;
    const LAST = D - 1 / 30;               // último quadro renderizado
    const DEG = Math.PI / 180;
    const TAU = Math.PI * 2;
    const ROT = -14 * DEG;                 // inclinação das órbitas
    const { clamp, lerp, hexA, smooth } = h;
    const EIO = gsap.parseEase('mecca.inOut');
    const EOUT = gsap.parseEase('mecca.out');
    const P2O = gsap.parseEase('power2.out');

    // ------------------------------------------------------------------ tempo "da máquina" (velocidade ×1 → ×1,25 → ×1)
    // m(t) = 1 + .25·(S(3→4) − S(5→5,75)), S = smoothstep.  Φ(t) = ∫ m  (forma fechada → determinístico)
    const sInt = (t, a, b) => {
      if (t <= a) return 0;
      const L = b - a;
      if (t >= b) return L * 0.5 + (t - b);
      const u = (t - a) / L;
      return L * (u * u * u - (u * u * u * u) / 2);
    };
    const Phi = (t) => t + 0.25 * (sInt(t, 3, 4) - sInt(t, 5, 5.75));
    const nightK = (t) => smooth(3, 4, t) - smooth(5, 5.75, t);
    // carcaça (arcos do ícone): regra COMPARTILHADA S07/S08/S09, função do tempo GLOBAL gt (2º argumento do onFrame)
    // 0 antes de 72 s; depois 18°·sin(2π(gt−72)/4)·smooth(72, 72.6, gt) → 0° exatos nos cortes 76,0 e 82,0
    const carcAngle = (gt) => (gt < 72 ? 0 : 18 * Math.sin((2 * Math.PI * (gt - 72)) / 4) * h.smooth(72, 72.6, gt));
    // saída 5,5 → último quadro
    const exitE = (t) => EIO(clamp((t - 5.5) / (LAST - 5.5)));

    // ------------------------------------------------------------------ CSS local
    h.el('style', {
      html: `
${SEL} .s8-title em { background: linear-gradient(90deg, #C026D3, #7C3AED); -webkit-background-clip: text; background-clip: text; color: transparent; }
${SEL} .s8-title .line-mask { padding: .16em 0 .28em; margin: -.16em 0 -.28em; }
${SEL} .s8-leg { position:absolute; left:192px; top:0; font-family:var(--f-mono); font-weight:500; font-size:26px;
  letter-spacing:.2em; color:#C4B5FD; white-space:nowrap; text-transform:uppercase; line-height:1.2; }
${SEL} .s8-leg-h { color:#A78BFA; }
${SEL} .s8-bul { display:inline-block; width:12px; height:12px; border-radius:50%; margin-right:18px; vertical-align:3.5px; }
${SEL} .s8-dia { display:inline-block; width:10px; height:10px; margin:0 19px 0 1px; vertical-align:4.5px; transform:rotate(45deg); }
`,
    }, root);

    // posiciona um elemento absoluto para que a linha de base da 1ª linha caia em y
    function atBaseline(el, y) {
      const probe = h.el('span', { style: { display: 'inline-block', width: '0px', height: '0px', verticalAlign: 'baseline' } });
      el.insertBefore(probe, el.firstChild);
      const off = h.rect(probe).y - h.rect(el).y;
      probe.remove();
      el.style.top = (y - off) + 'px';
    }
    const lerpRGB = (A, B, k) => [lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)];
    const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
    const INK = rgb(P.ink);

    // ================================================================== MÁQUINA (réplica exata do fechamento da S07)
    // engrenagem com raio de pé/topo livres (mesmo perfil da S07)
    function gearD(ri, ro, n, tip = 0.3, base = 0.54) {
      const st = TAU / n;
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

    // canvas de trás (metade de trás das órbitas passa atrás da máquina)
    const back = h.canvas(root).ctx;

    const svg = h.svg('svg', { class: 'fill', width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, root);
    const defs = h.svg('defs', {}, svg);
    const hid = h.uid('s8hub');
    const rg = h.svg('radialGradient', { id: hid }, defs);
    h.svg('stop', { offset: 0, 'stop-color': P.violet, 'stop-opacity': 0.5 }, rg);
    h.svg('stop', { offset: 0.5, 'stop-color': P.violet, 'stop-opacity': 0.14 }, rg);
    h.svg('stop', { offset: 1, 'stop-color': P.violet, 'stop-opacity': 0 }, rg);
    const NS = 'non-scaling-stroke';

    const machine = h.svg('g', {}, svg);
    const planetsG = h.svg('g', {}, machine);
    // sol (engrenagem gigante da S07 recolhida: r 420 × .31)
    const gearG = h.svg('g', { transform: 'translate(1400 560) scale(0.31)' }, machine);
    const gearRot = h.svg('g', {}, gearG);
    h.svg('path', {
      d: gearD(401 - 14.6, 401 + 19, 28), fill: P.bg2, 'fill-opacity': 1, stroke: P.lavender, 'stroke-opacity': 0.5,
      'stroke-width': 2, 'stroke-linejoin': 'round', 'vector-effect': NS,
    }, gearRot);
    const glowW = h.svg('g', {}, gearG);
    const glow = h.svg('circle', { r: 230, fill: `url(#${hid})` }, glowW);
    // cubo: só a pupila (110 px), em pé
    const HUBK = 110 / (156 * 200 / 228);
    const hubG = h.svg('g', { transform: `translate(1400 560) scale(${HUBK.toFixed(4)})` }, machine);
    const hubIn = h.svg('g', { transform: 'translate(-100 -100)' }, hubG);
    const hub = h.icon({ size: 200, parent: hubIn });
    hub.dot.remove(); hub.arcOuter.remove(); hub.arcInner.remove();
    // carcaça: arcos do ícone de 710 px centrados em (1400,560)
    const carcG = h.svg('g', { transform: 'translate(1045 205)' }, machine);
    const carc = h.icon({ size: 710, parent: carcG });
    carc.pupil.remove(); carc.dot.remove();
    // 7 planetas (r 78, 16 dentes, depth .13) a 198 do sol
    const STEP = 360 / 7;
    const PL = [];
    for (let i = 0; i < 7; i++) {
      const ang = -90 + i * STEP;
      const g = h.svg('g', { transform: `translate(${(1400 + 198 * Math.cos(ang * DEG)).toFixed(2)} ${(560 + 198 * Math.sin(ang * DEG)).toFixed(2)})` }, planetsG);
      const rot = h.svg('g', {}, g);
      const d = h.gearPath({ teeth: 16, r: 78, depth: 0.13, hole: 0 });
      h.svg('path', { d, fill: i % 2 ? P.surface2 : P.surface, stroke: P.lavender, 'stroke-width': 1.5, 'stroke-linejoin': 'round', 'vector-effect': NS }, rot);
      h.svg('circle', { r: 50, fill: 'none', stroke: P.lavender, 'stroke-opacity': 0.18, 'stroke-width': 1, 'vector-effect': NS }, rot);
      PL.push({ rot, ang });
    }

    // canvas da frente (anéis, partículas, mecca, Ponto)
    const ctx = h.canvas(root).ctx;

    // ================================================================== TEXTO
    const eb = h.eyebrow('AS ROTINAS · O QUE GIRA POR DENTRO', { x: 192, y: 120, anchor: 'cl', parent: root });
    const ebDash = eb.querySelector('.dash');
    const ebSp = h.split(eb.querySelector('.lbl'), { type: 'chars' });

    const title = h.text('É o que <em>os mecca</em> rodam<br>enquanto você dorme<span class="s8-dot">.</span>',
      { x: 192, y: 0, size: 84, lh: '95px', nowrap: true, cls: 't-display s8-title', parent: root });
    atBaseline(title, 260);
    const tSp = h.split(title, { type: 'lines', mask: 'lines' });
    // coluna flex depois do split: as margens negativas das máscaras não colapsam (baselines 260 / 355)
    Object.assign(title.style, { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' });
    // (o SplitText clona o <span> vazio; o "." visível é o que tem texto)
    const tDot = [...title.querySelectorAll('.s8-dot')].find((e) => e.textContent === '.');

    // legenda ROTINAS: mono 26 px logo abaixo da manchete (título #A78BFA na baseline 470, itens 520/570/620/670)
    const LEG = [
      { label: 'DIÁRIAS', color: '#C4B5FD', y: 520, t: 1.5, dia: false },
      { label: 'SEMANAIS', color: '#A78BFA', y: 570, t: 2.0, dia: false },
      { label: 'MENSAIS', color: '#7C3AED', y: 620, t: 2.5, dia: false },
      { label: 'VERIFICAÇÕES &amp; CONFERÊNCIAS', color: '#C026D3', y: 670, t: 3.0, dia: true },
    ];
    const LEG_O = { x: 192, y: 570 };        // origem do push da legenda (margem esquerda fixa)
    const legWrap = h.el('div', { style: { position: 'absolute', left: '0px', top: '0px', width: '1920px', height: '1080px' } }, root);
    const legHead = h.el('div', { cls: 's8-leg s8-leg-h', html: 'ROTINAS' }, legWrap);
    atBaseline(legHead, 470);
    LEG.forEach((L) => {
      L.el = h.el('div', { cls: 's8-leg', html: `<span class="${L.dia ? 's8-dia' : 's8-bul'}"></span>${L.label}` }, legWrap);
      atBaseline(L.el, L.y);
      L.bul = L.el.firstChild;
      L.bul.style.background = L.color;
      // início do leader line: fim da tinta do rótulo (sem o tracking final) + folga, na altura média das maiúsculas
      L.x1 = h.rect(L.el).right - 0.2 * 26 + 16;
      L.cy = L.y - 9.5;
    });

    // ================================================================== TIMELINE (DOM + fundo)
    const BG0 = { glowA: 1, glowB: 1, glowC: 1, grid: 0, particles: 1, driftX: 0, driftY: 0, speed: 1, warp: 0, vignette: 0.55, dim: 0, hue: 0, grain: 1 };
    tl.set(bg, Object.assign({}, BG0), 0);

    // estados iniciais: aplicados no build e também na tl (seeks para trás)
    const init = (targets, vars) => { gsap.set(targets, vars); tl.set(targets, Object.assign({}, vars), 0); };
    init(ebSp.chars, { autoAlpha: 0 });
    init(ebDash, { scaleX: 0, transformOrigin: '0% 50%' });
    // push lento com origem na margem esquerda (x 192 fixo) — nada de drift horizontal no eyebrow/legenda
    init(eb, { scale: 1, transformOrigin: '0% 50%' });
    init(tSp.lines, { yPercent: 150 });
    init(title, { scale: 1, transformOrigin: '0% 100%' });
    [legHead, ...LEG.map((L) => L.el)].forEach((e) => init(e, { x: -20, opacity: 0 }));
    LEG.forEach((L) => init(L.bul, { scale: 1, transformOrigin: '50% 50%' }));
    init(legWrap, { scale: 1, transformOrigin: `${LEG_O.x}px ${LEG_O.y}px` });

    // eyebrow — digitação (0,5) e apagamento de trás para frente (5,5)
    const NCH = ebSp.chars.length;
    tl.to(ebDash, { scaleX: 1, duration: 0.3, ease: 'mecca.out' }, 0.5);
    tl.to(ebSp.chars, { autoAlpha: 1, duration: 0.01, ease: 'none', stagger: 0.025 }, 0.62);
    tl.to(eb, { scale: 1.015, duration: 5, ease: 'none' }, 0.5);
    // apagamento de trás para frente: o rótulo ficou longo (AS ROTINAS · …), então 0,012 s/char para caber em
    // 5,5 → ≈5,83 (mesma cadência da S09); o traço recolhe logo depois e some antes do último quadro
    tl.to(ebSp.chars, { autoAlpha: 0, duration: 0.01, ease: 'none', stagger: { each: 0.012, from: 'end' } }, 5.5);
    tl.to(ebDash, { scaleX: 0, duration: 0.1, ease: 'mecca.in' }, Math.min(5.84, 5.5 + NCH * 0.012));

    // título — máscara por linha (linha 2 em 1,0), push lento, saída 5,5–5,8
    tl.to(tSp.lines[0], { yPercent: 0, duration: 0.6, ease: 'mecca.out' }, 0.5);
    tl.to(tSp.lines[1], { yPercent: 0, duration: 0.6, ease: 'mecca.out' }, 1.0);
    tl.to(title, { scale: 1.025, duration: 5, ease: 'none' }, 0.5);
    tl.to(tSp.lines, { yPercent: -150, duration: 0.27, ease: 'mecca.in', stagger: 0.03 }, 5.5);

    // legenda — o título ROTINAS entra um instante antes de DIÁRIAS; cada item desliza 20 px com fade junto com
    // o seu anel. Saída: transformação em mecca.in, opacidade em power1.in (sem "pop" no fim do fade).
    const LEG_EL = [legHead, ...LEG.map((L) => L.el)];
    tl.to(legHead, { x: 0, opacity: 1, duration: 0.4, ease: 'mecca.out' }, 1.45);
    LEG.forEach((L) => {
      tl.to(L.el, { x: 0, opacity: 1, duration: 0.4, ease: 'mecca.out' }, L.t);
      tl.fromTo(L.bul, { scale: 2.2 }, { scale: 1, duration: 0.55, ease: 'mecca.back', immediateRender: false }, L.t);
    });
    LEG_EL.forEach((e, i) => {
      tl.to(e, { x: -16, duration: 0.21, ease: 'mecca.in' }, 5.5 + i * 0.03);
      tl.to(e, { opacity: 0, duration: 0.21, ease: 'power1.in' }, 5.5 + i * 0.03);
    });
    tl.to(legWrap, { scale: 1.015, duration: 4, ease: 'none' }, 1.5);

    // ------------------------------------------------------------------ cues
    cue(0.5, 'whoosh', 'título', 0.3);
    cue(1.5, 'tick', 'diárias', 0.45);
    cue(2.0, 'tick', 'semanais', 0.45);
    cue(2.5, 'tick', 'mensais', 0.45);
    cue(3.0, 'chime', 'verificações + 4 mecca', 0.5);
    cue(3.5, 'sub-drop', 'noite', 0.4);
    cue(4.0, 'tick', 'saltos', 0.35);
    cue(5.0, 'tick', 'saltos', 0.35);
    cue(5.75, 'whoosh', 'recolhe em D1/D2', 0.4);

    // ================================================================== ANÉIS DE ROTINA
    const C0 = { x: 1300, y: 580 };
    const RINGS = [
      { rx: 250, n: 40, w: 120, col: '#C4B5FD', r: 2.4, t0: 1.5, trail: 5, to: 0 },
      { rx: 320, n: 28, w: 60, col: '#A78BFA', r: 2.8, t0: 2.0, to: 1 },
      { rx: 390, n: 16, w: 30, col: '#7C3AED', r: 3.4, t0: 2.5, halo: true, to: 0 },
      { rx: 460, n: 12, w: 18, col: '#C026D3', r: 4, t0: 3.0, diamond: true, to: 1 },
    ];
    const DOUT = [{ rx: 220, ry: 70 }, { rx: 320, ry: 100 }];   // D1, D2 (centro 1440,560)
    // fase: um losango passa pela "conferência" (θ = 90°) logo depois de assentar (≈3,75 s)
    RINGS[3].ph0 = (90 - 18 * Phi(3.75)) * DEG;
    RINGS[0].ph0 = 0.21; RINGS[1].ph0 = 0.47; RINGS[2].ph0 = 0.13;
    const rnd = h.rng(8088);
    RINGS.forEach((R) => {
      R.c = rgb(R.col);
      R.parts = [];
      for (let i = 0; i < R.n; i++) {
        R.parts.push({ i, delay: rnd() * 0.1, jx: rnd() * TAU, jy: rnd() * TAU, fx: 1.4 + rnd() * 1.6, fy: 1.2 + rnd() * 1.6, tw: rnd() * TAU });
      }
    });

    // geometria de cada anel em t (na saída: Diárias/Mensais → D1, Semanais/Verificações → D2)
    function ringGeo(k, t) {
      const R = RINGS[k], e = exitE(t), T = DOUT[R.to];
      return {
        cx: lerp(C0.x, 1440, e), cy: lerp(C0.y, 560, e),
        rx: lerp(R.rx, T.rx, e), ry: lerp(R.rx * 0.32, T.ry, e),
      };
    }
    function ellPt(G, phi) { return h.ellipsePt(G.cx, G.cy, G.rx, G.ry, ROT, phi); }

    // posição de uma partícula (inclui o espalhamento a partir do Ponto)
    function partPos(k, p, t) {
      const R = RINGS[k];
      const u = (t - R.t0 - p.delay) / 0.5;
      const e = EOUT(clamp(u));
      const phi = R.ph0 + (p.i / R.n) * TAU + R.w * DEG * Phi(t);
      const G = ringGeo(k, t);
      const q = ellPt(G, phi);
      const jx = 1.5 * Math.sin(t * p.fx + p.jx), jy = 1.5 * Math.sin(t * p.fy + p.jy);
      return { x: lerp(C0.x, q.x + jx, e), y: lerp(C0.y, q.y + jy, e), phi, e, u };
    }

    // hairline elíptica dividida em metade de trás (canvas de trás, α×.5) e metade da frente
    function arcSplit(G, a0, a1, alpha, lw, color) {
      if (alpha <= 0.002 || a1 <= a0) return;
      const segs = [[back, Math.PI, TAU, 0.5], [back, -Math.PI, 0, 0.5], [back, Math.PI * 3, Math.PI * 4, 0.5],
        [ctx, 0, Math.PI, 1], [ctx, TAU, Math.PI * 3, 1], [ctx, -TAU, -Math.PI, 1]];
      for (const [c, s0, s1, am] of segs) {
        const f = Math.max(a0, s0), g = Math.min(a1, s1);
        if (g <= f) continue;
        c.save();
        c.translate(G.cx, G.cy); c.rotate(ROT);
        c.strokeStyle = hexA(color, alpha * am);
        c.lineWidth = lw;
        c.beginPath(); c.ellipse(0, 0, G.rx, G.ry, 0, f, g); c.stroke();
        c.restore();
      }
    }

    // ================================================================== LEADER LINES (legenda → anel)
    // cada item da legenda puxa uma hairline lavanda α .25 até a ponta esquerda do seu anel (φ = π, onde o traço do
    // anel começa a se desenhar): trecho horizontal na altura do item + diagonal a 45° até a ponta. As quatro diagonais
    // ficam paralelas (nunca se cruzam) e os trechos horizontais passam por cima do rótulo longo de VERIFICAÇÕES.
    // Desenha em 0,45 s (mecca.out) no tempo do item e "acende" (α .25 → .6 → .25); na saída retrai para o rótulo.
    const EIN = gsap.parseEase('mecca.in');
    const P1I = gsap.parseEase('power1.in');
    function leaderPts(k, t) {
      const L = LEG[k];
      const sc = gsap.getProperty(legWrap, 'scaleX');
      const lx = gsap.getProperty(L.el, 'x');
      const S = { x: LEG_O.x + (L.x1 + lx - LEG_O.x) * sc, y: LEG_O.y + (L.cy - LEG_O.y) * sc };
      const A = ellPt(ringGeo(k, Math.min(t, 5.5)), Math.PI);   // na saída o traço só retrai (não segue o anel)
      const B = { x: Math.max(S.x, A.x - Math.abs(A.y - S.y)), y: S.y };
      return [S, B, A];
    }
    // traça a fração f do comprimento da polilinha (a partir do 1º ponto) e devolve a ponta
    function polyPart(c, pts, f) {
      let tot = 0;
      for (let i = 1; i < pts.length; i++) tot += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      let rem = tot * clamp(f);
      let tip = pts[0];
      c.beginPath(); c.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length && rem > 0; i++) {
        const a = pts[i - 1], b = pts[i];
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        const u = d > 0 ? Math.min(1, rem / d) : 1;
        tip = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
        c.lineTo(tip.x, tip.y);
        rem -= d;
      }
      c.stroke();
      return tip;
    }
    function drawLeaders(t) {
      LEG.forEach((L, k) => {
        if (t < L.t) return;
        const pin = EOUT(clamp((t - L.t) / 0.45));
        const ux = clamp((t - 5.5 - (k + 1) * 0.03) / 0.21);     // sai junto com o seu item (o título ROTINAS é o 0)
        const keep = 1 - EIN(ux);                                 // geometria: mecca.in
        const fade = 1 - P1I(ux);                                 // opacidade: power1.in
        const lit = Math.exp(-Math.max(0, t - L.t - 0.3) * 3.5) * smooth(L.t, L.t + 0.12, t);
        const a = (0.25 + 0.35 * lit) * fade;
        if (a <= 0.003) return;
        const pts = leaderPts(k, t);
        ctx.save();
        ctx.strokeStyle = hexA(P.lavender, a); ctx.lineWidth = 1.25; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        const tip = polyPart(ctx, pts, pin * keep);
        ctx.restore();
        if (pin < 1) h.glowDot(ctx, tip.x, tip.y, 2, P.lavender, 0.8 * (1 - pin) * fade);   // cabeça do traço
        const pa = smooth(0.85, 1, pin * keep) * fade;                                     // pino na ponta do anel
        if (pa > 0.003) h.glowDot(ctx, pts[2].x, pts[2].y, 2.6, L.color, (0.55 + 0.45 * lit) * pa);
      });
    }

    // ================================================================== OS 4 MECCA
    const JUMPS = [3.5, 4.0, 4.5, 5.0], JD = 0.3, BOOST = 0.38;
    const SEQ = [[0, 1, 2, 3, 2], [1, 0, 1, 2, 3], [2, 3, 2, 1, 0], [3, 2, 1, 0, 1]];
    const WM = 40 * DEG;
    const TGT = h.ellipsePt(1440, 560, 320, 100, ROT, 0);          // Ponto final em D2, ângulo 0° (≈1750,483)
    const CONV0 = 5.5, CONV1 = 5.85;
    // em 3,3 (fim do burst) os mecca estão a 45°/135°/225°/315° (os de trás fora da silhueta da máquina)
    const MPH0 = [45, 135, 225, 315].map((a) => a * DEG - WM * Phi(3.3));
    function meccaPhi(k, t) {
      let b = 0;
      for (const J of JUMPS) b += BOOST * EIO(clamp((t - J) / JD));
      return MPH0[k] + WM * Phi(t) + b;
    }
    function meccaRing(k, t) {
      let idx = 0;
      for (let j = 0; j < JUMPS.length; j++) if (t >= JUMPS[j]) idx = j + 1;
      const phi = meccaPhi(k, t);
      let G, hop = 0, jmp = 0;
      if (idx > 0 && t < JUMPS[idx - 1] + JD) {
        const u = (t - JUMPS[idx - 1]) / JD, e = EIO(u);
        const A = ringGeo(SEQ[k][idx - 1], t), B = ringGeo(SEQ[k][idx], t);
        G = { cx: A.cx, cy: A.cy, rx: lerp(A.rx, B.rx, e), ry: lerp(A.ry, B.ry, e) };
        jmp = Math.sin(Math.PI * u);
        hop = -26 * jmp;
      } else G = ringGeo(SEQ[k][idx], t);
      const q = ellPt(G, phi);
      return { x: q.x, y: q.y + hop, phi, jmp };
    }
    // convergência (CONV0 → CONV1) em coordenadas da ELIPSE, não em xy: a fase vai até 0° pelo caminho mais curto
    // (múltiplo de 2π mais próximo da fase em CONV0) e o anel de cada mecca (centro/rx/ry) vira D2 — eles chegam
    // deslizando pela órbita, e a metade de trás continua atrás da máquina.
    const D2G = { cx: 1440, cy: 560, rx: 320, ry: 100 };
    const wrapPI = (a) => { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
    const CONV_PHI = [0, 1, 2, 3].map((k) => { const f = meccaPhi(k, CONV0); return f - wrapPI(f); });
    const ECONV = gsap.parseEase('power2.inOut');     // pico de velocidade 2× a média (mecca.inOut daria 5×)
    // posição + peso de frente (1 = canvas da frente)
    function meccaPos(k, t) {
      if (t >= CONV0) {
        const e = ECONV(clamp((t - CONV0) / (CONV1 - CONV0)));
        const A = ringGeo(SEQ[k][JUMPS.length], t);
        const G = { cx: lerp(A.cx, D2G.cx, e), cy: lerp(A.cy, D2G.cy, e), rx: lerp(A.rx, D2G.rx, e), ry: lerp(A.ry, D2G.ry, e) };
        const phi = lerp(meccaPhi(k, t), CONV_PHI[k], e);
        const q = ellPt(G, phi);
        // profundidade pela fase até o fim; nos últimos graus (φ ≈ 0, em x ≈ 1750, longe da silhueta da máquina)
        // passa ao canvas da frente para fundir no Ponto
        const wf = lerp(smooth(-0.22, 0.22, Math.sin(phi)), 1, smooth(0.85, 1, e));
        return { x: q.x, y: q.y, wf, jmp: 0 };
      }
      const m = meccaRing(k, t);
      const depth = smooth(-0.22, 0.22, Math.sin(m.phi));
      if (t < 3.3) {
        const e = EOUT(clamp((t - 3) / 0.3));
        return { x: lerp(C0.x, m.x, e), y: lerp(C0.y, m.y, e), wf: lerp(1, depth, smooth(0.5, 1, e)), jmp: 0 };
      }
      return { x: m.x, y: m.y, wf: depth, jmp: m.jmp };
    }

    // ================================================================== DESENHO
    // desenho padrão do Ponto (igual às demais cenas): glowDot lavanda α .6 + núcleo #FBF8FF de raio r
    function drawPonto(c, x, y, r, br, a = 1) {
      h.glowDot(c, x, y, r, P.lavender, 0.6 * br * a);
      c.fillStyle = hexA(P.ink, a); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
    function drawMecca(c, x, y, r, a) {
      if (a <= 0.003) return;
      c.save();
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(x, y, 0, x, y, r * 6.5);
      g.addColorStop(0, hexA(P.pink, 0.85 * a));
      g.addColorStop(0.3, hexA(P.pink, 0.32 * a));
      g.addColorStop(1, hexA(P.pink, 0));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 6.5, 0, TAU); c.fill();
      c.restore();
      c.fillStyle = hexA(P.ink, a); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
    const MAG = rgb(P.magenta), VIO = rgb(P.violet);
    function drawTrail(c, k, t, r, a) {
      if (a <= 0.003) return;
      c.save();
      c.lineCap = 'round';
      let A = meccaPos(k, t);
      const N = 8, LMAX = 120;          // 8 amostras, no máximo ~120 px de rastro
      let len = 0;
      for (let j = 1; j <= N; j++) {
        const tb = t - j / 60;
        if (tb < 3) break;
        let B = meccaPos(k, tb);
        const d = Math.hypot(B.x - A.x, B.y - A.y);
        const cut = len + d > LMAX;
        if (cut) { const u = (LMAX - len) / d; B = { x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u) }; }
        const f = 1 - j / (N + 1);
        c.strokeStyle = rgba(lerpRGB(MAG, VIO, j / N), 0.85 * f * a);
        c.lineWidth = 2 * r * 0.85 * f;
        c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y); c.stroke();
        if (cut) break;
        len += d;
        A = B;
      }
      c.restore();
    }
    function pulse(u) { // 0 → 1 → 0 em 0,45 s
      if (u < 0 || u > 0.45) return 0;
      return u < 0.1 ? P2O(u / 0.1) : 1 - EIO((u - 0.1) / 0.35);
    }
    function diamond(c, x, y, s) {
      c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s, y); c.lineTo(x, y + s); c.lineTo(x - s, y); c.closePath();
    }
    const PINK = rgb(P.pink);

    // ================================================================== onFrame
    onFrame((lt, gt) => {
      const t = lt;
      const nk = nightK(t);
      const ex = exitE(t);
      const PH = Phi(t);

      // ---------------- fundo (função pura do tempo): padrão → noite → padrão
      Object.assign(bg, BG0, { glowA: 1 - 0.5 * nk, glowB: 1 - 0.5 * nk, vignette: 0.55 + 0.2 * nk, dim: 0.35 * nk });

      // ---------------- máquina (continua a rotação da S07: sol +36°/s, planetas −63°/s; a carcaça oscila)
      // a S07 termina (t7 = 22 − 1/30) com o sol num ângulo canônico (0 mod 1 dente) e planetas idem;
      // aqui a rotação continua a partir dali (+1 quadro no t = 0)
      const spin = 36 * (PH + 1 / 30);
      const th = spin;
      const mx = lerp(1300, 1440, ex), my = lerp(580, 560, ex), ms = lerp(0.55, 0.45, ex);
      machine.setAttribute('transform', `translate(${mx.toFixed(2)} ${my.toFixed(2)}) scale(${ms.toFixed(4)}) translate(-1400 -560)`);
      machine.setAttribute('opacity', (1 - 0.5 * nk).toFixed(4));
      gearRot.setAttribute('transform', `rotate(${th.toFixed(3)})`);
      for (const p of PL) {
        const rotB = p.ang + 180 + 180 / 16 - (28 / 16) * (th - p.ang);
        p.rot.setAttribute('transform', `rotate(${rotB.toFixed(3)})`);
      }
      carc.g.setAttribute('transform', `rotate(${carcAngle(gt).toFixed(3)} 114 114)`);   // oscilação ±18° compartilhada
      glow.setAttribute('opacity', (0.82 + 0.18 * Math.sin((t + 22) * Math.PI * 0.5)).toFixed(3));

      // ---------------- texto: o "." de "dorme." respira (.6 ↔ 1, período 2 s)
      tDot.style.opacity = t < 1.6 ? '1' : (0.8 + 0.2 * Math.cos((t - 1.6) * Math.PI)).toFixed(3);

      // ---------------- canvas
      back.clearRect(0, 0, 1920, 1080);
      ctx.clearRect(0, 0, 1920, 1080);
      const bright = 1 + 0.3 * nk;                 // noite: partículas 30% mais claras

      // leader lines da legenda (por baixo dos anéis e das partículas)
      drawLeaders(t);

      // hairlines dos anéis (desenham a partir da ponta esquerda, 0,6 s, mecca.out)
      RINGS.forEach((R, k) => {
        if (t < R.t0) return;
        const pDraw = EOUT(clamp((t - R.t0) / 0.6));
        const G = ringGeo(k, t);
        const lit = Math.exp(-Math.max(0, t - R.t0 - 0.35) * 3.2) * smooth(R.t0, R.t0 + 0.3, t);   // "acende"
        let a = 0.2 + 0.12 * nk + 0.22 * lit;
        if (k <= 1) a *= 1 - smooth(5.5, 5.82, t);     // Diárias/Semanais: fade
        else a = lerp(a, 0.3, ex);                                                 // Mensais → D1, Verificações → D2
        arcSplit(G, Math.PI - Math.PI * pDraw, Math.PI + Math.PI * pDraw, a, 1.25, P.lavender);   // hairline lavanda (h.orbit)
        // cabeças luminosas do traço
        if (pDraw < 1) {
          const ha = (1 - pDraw) * 0.9;
          for (const s of [-1, 1]) {
            const q = ellPt(G, Math.PI + s * Math.PI * pDraw);
            h.glowDot(Math.sin(Math.PI + s * Math.PI * pDraw) >= 0 ? ctx : back, q.x, q.y, 2.2, R.col, ha);
          }
        }
      });

      // partículas
      const partFade = 1 - smooth(5.52, 5.88, t);
      RINGS.forEach((R, k) => {
        if (t < R.t0) return;
        for (const p of R.parts) {
          const s = partPos(k, p, t);
          if (s.u <= 0) continue;
          const born = clamp(s.u * 5);
          const tw = 0.82 + 0.18 * Math.sin(t * 5 + p.tw);
          const a = clamp(0.95 * born * tw * partFade * bright, 0, 1);
          if (a <= 0.003) continue;
          const wfDepth = smooth(-0.18, 0.18, Math.sin(s.phi));
          const wf = lerp(1, wfDepth, s.e);
          const col = lerpRGB(R.c, INK, 0.3 * nk);
          for (const [c, w] of [[ctx, wf], [back, (1 - wf) * 0.5]]) {
            if (w <= 0.003) continue;
            const aa = a * w;
            // rastro (Diárias: 5 amostras)
            if (R.trail) {
              c.save(); c.lineCap = 'round';
              let A = s;
              for (let j = 1; j <= R.trail; j++) {
                const B = partPos(k, p, t - j / 40);
                if (B.u <= 0) break;
                const f = 1 - j / (R.trail + 1);
                c.strokeStyle = rgba(col, aa * 0.55 * f);
                c.lineWidth = R.r * 1.5 * f;
                c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(B.x, B.y); c.stroke();
                A = B;
              }
              c.restore();
            }
            if (R.diamond) {
              // conferência: pisca #E249B0 ao passar por θ = 90°
              const d = wrapPI(s.phi - Math.PI / 2);
              const fl = Math.exp(-(d / 0.13) * (d / 0.13)) * s.e;
              const dc = lerpRGB(lerpRGB(R.c, PINK, fl), INK, 0.3 * nk + 0.25 * fl);
              const sz = 4 * (1 + 0.7 * fl);
              if (fl > 0.02) {
                c.save();
                c.globalCompositeOperation = 'lighter';
                const g = c.createRadialGradient(s.x, s.y, 0, s.x, s.y, 42);
                g.addColorStop(0, hexA(P.pink, 0.85 * fl * aa));
                g.addColorStop(0.45, hexA(P.pink, 0.28 * fl * aa));
                g.addColorStop(1, hexA(P.pink, 0));
                c.fillStyle = g; c.beginPath(); c.arc(s.x, s.y, 42, 0, TAU); c.fill();
                // brilho em cruz (a "conferência")
                const L = 30 * fl;
                const gx = c.createLinearGradient(s.x - L, 0, s.x + L, 0);
                gx.addColorStop(0, hexA(P.pink, 0)); gx.addColorStop(0.5, hexA(P.pink, 0.9 * fl * aa)); gx.addColorStop(1, hexA(P.pink, 0));
                c.fillStyle = gx; c.fillRect(s.x - L, s.y - 1, 2 * L, 2);
                const gy = c.createLinearGradient(0, s.y - L * 0.7, 0, s.y + L * 0.7);
                gy.addColorStop(0, hexA(P.pink, 0)); gy.addColorStop(0.5, hexA(P.pink, 0.9 * fl * aa)); gy.addColorStop(1, hexA(P.pink, 0));
                c.fillStyle = gy; c.fillRect(s.x - 1, s.y - L * 0.7, 2, 1.4 * L);
                c.restore();
              }
              if (d > 0 && d < 0.3 && s.e > 0.99) {        // anel de "check" logo depois da passagem
                const k2 = d / 0.3;
                c.strokeStyle = hexA(P.pink, 0.7 * (1 - k2) * aa);
                c.lineWidth = 1.75;
                c.beginPath(); c.arc(s.x, s.y, 6 + 26 * P2O(k2), 0, TAU); c.stroke();
              }
              c.fillStyle = rgba(dc, aa);
              diamond(c, s.x, s.y, sz); c.fill();
            } else {
              if (R.halo) {
                c.save();
                c.globalCompositeOperation = 'lighter';
                const g = c.createRadialGradient(s.x, s.y, 0, s.x, s.y, R.r * 5.5);
                g.addColorStop(0, hexA(P.violet, 0.9 * aa));
                g.addColorStop(0.35, hexA(P.violet, 0.3 * aa));
                g.addColorStop(1, hexA(P.violet, 0));
                c.fillStyle = g; c.beginPath(); c.arc(s.x, s.y, R.r * 5.5, 0, TAU); c.fill();
                c.restore();
              }
              c.fillStyle = rgba(col, aa);
              c.beginPath(); c.arc(s.x, s.y, R.r, 0, TAU); c.fill();
            }
          }
        }
      });

      // ---------------- o Ponto (0 → 3,0 no cubo; 5,7 → fim em D2)
      const br = 1 - 0.12 * (0.5 - 0.5 * Math.cos(t * Math.PI)); // = 1 no corte com a S07
      if (t < 3.2) {
        let pr = 10;
        for (const T of [1.5, 2.0, 2.5]) pr = Math.max(pr, 10 + 5 * pulse(t - T));
        let pa = 1;
        if (t >= 3) { const u = (t - 3) / 0.2; pr = 10 + 5 * P2O(clamp(u * 2)); pa = 1 - smooth(0, 1, u); }
        // anel de emissão a cada anel que nasce
        for (const T of [1.5, 2.0, 2.5]) {
          const v = t - T;
          if (v > 0 && v < 0.55) {
            const k2 = v / 0.55;
            ctx.strokeStyle = hexA(P.lilac, 0.55 * (1 - k2)); ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(C0.x, C0.y, 14 + 46 * P2O(k2), 0, TAU); ctx.stroke();
          }
        }
        if (pa > 0.003) drawPonto(ctx, C0.x, C0.y, pr, br, pa);
      }
      // burst (3,0): onda dupla lavanda/magenta
      if (t > 3 && t < 3.5) {
        const k2 = (t - 3) / 0.5, e = P2O(k2), a = 0.6 * (1 - k2);
        ctx.strokeStyle = hexA(P.lavender, a); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(C0.x, C0.y, 14 + 110 * e, 0, TAU); ctx.stroke();
        ctx.strokeStyle = hexA(P.magenta, a * 0.7); ctx.lineWidth = 1.25;
        ctx.beginPath(); ctx.arc(C0.x, C0.y, (14 + 110 * e) * 0.9, 0, TAU); ctx.stroke();
      }

      // ---------------- os 4 mecca (3,0 → 5,85)
      if (t >= 3 && t < 5.95) {
        const ma = smooth(3, 3.06, t) * (1 - smooth(5.74, 5.86, t));
        for (let k = 0; k < 4; k++) {
          const m = meccaPos(k, t);
          const prev = meccaPos(k, Math.max(3, t - 1 / 30));
          const speed = Math.hypot(m.x - prev.x, m.y - prev.y) * 30;
          const trk = smooth(480, 720, speed) * (t > 3.02 ? 1 : 0);
          const r = 5.5 * (1 + 0.28 * m.jmp);
          for (const [c, w] of [[ctx, m.wf], [back, (1 - m.wf) * 0.6]]) {
            if (w <= 0.003) continue;
            drawTrail(c, k, t, r, trk * ma * w);
            drawMecca(c, m.x, m.y, r, ma * w);
          }
          // pouso: ping curto ao terminar cada salto
          for (const J of JUMPS) {
            const v = t - (J + JD);
            if (v > 0 && v < 0.35 && t < CONV0) {
              const k2 = v / 0.35;
              ctx.strokeStyle = hexA(P.pink, 0.5 * (1 - k2) * ma * m.wf); ctx.lineWidth = 1.25;
              ctx.beginPath(); ctx.arc(m.x, m.y, 7 + 16 * P2O(k2), 0, TAU); ctx.stroke();
            }
          }
        }
      }
      if (t >= 5.7) {
        const pa = smooth(5.7, 5.84, t);
        const pr = 10 + 3.5 * Math.sin(Math.PI * clamp((t - 5.8) / 0.15));
        drawPonto(ctx, TGT.x, TGT.y, pr, br, pa);
      }

      // ---------------- legenda: bolinhas respiram no ritmo do seu anel; o losango pisca a cada conferência
      LEG.forEach((L, k) => {
        if (t < L.t) return;
        let g;
        if (k < 3) { const per = [1, 2, 4][k]; g = 0.5 + 0.5 * Math.cos(TAU * (t - L.t) / per); }
        else {
          g = 0;
          const R = RINGS[3];
          for (const p of R.parts) {
            const phi = R.ph0 + (p.i / R.n) * TAU + R.w * DEG * PH;
            const d = wrapPI(phi - Math.PI / 2);
            g = Math.max(g, Math.exp(-(d / 0.13) * (d / 0.13)));
          }
          L.bul.style.background = rgba(lerpRGB(RINGS[3].c, PINK, g), 1);
        }
        L.bul.style.boxShadow = `0 0 ${(6 + 10 * g).toFixed(1)}px ${hexA(k === 3 ? P.pink : L.color, (0.35 + 0.5 * g).toFixed(3))}`;
      });
    });
  },
});
})();
