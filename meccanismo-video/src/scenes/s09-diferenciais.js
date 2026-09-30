(() => {
/*
 * S09 — A gente assume, fica e tem pele no jogo.  (global 82–92 s, D = 10 s, tail 0)
 *
 * 0,0        match cut com a S08: máquina (sol + 7 planetas + carcaça) em (1440,560) ×.45, girando
 *            (carcaça: oscilação ±18° COMPARTILHADA com S07/S08, função do tempo global — 0° no corte de 82,0);
 *            D1 (220×70) e D2 (320×100) em hairline lavanda α .3, rot −14°; Ponto em D2 a 0°
 *            (≈1750,483), r 10, no desenho padrão global (glowDot α .6·br, br contínuo com a S08);
 *            sem texto; fundo padrão.
 * 0,5–1,0    ASSUME: o Ponto mergulha no V da pupila (1440,546), power3.in.
 * 1,0        ENCAIXE: pupila pisca violeta→lilás→violeta, onda r 60→180; sol 36 → 90 → 72°/s.
 * 2,0–3,5    FICA: o Ponto sai do cubo e orbita D2 (1 volta/s) deixando um anel-rastro que acumula α
 *            (.15 → .6, flash ao fechar a volta em 3,3). 2,5 a caixa-fantasma (120×80, tracejada slate)
 *            desliza até a ponta esquerda de D1 (180°) e sobe pela metade de trás; 3,0 é arremessada
 *            para FORA (esquerda/baixo) e vira 24 partículas que derivam para longe da máquina.
 * 3,5–4,0    PELE NO JOGO: planetas recolhem, sol e carcaça somem, a pupila vira a esfera A (MorphSVG);
 *            o Ponto desacelera para a órbita de B; D1 some (3,8–4,3), D2 fica a α .15 até 6,5.
 *            4,0 binário a 72°/s, fio em gradiente, rótulos.
 * 6,5–9,5    CRESCE JUNTO: baricentro sobe (560→480), órbitas crescem, corpos crescem a cada batida
 *            (junto com 'Cresceu,'), ondas elípticas em 7,0/7,5/8,0/8,5; rastros em espiral a partir de 8,3.
 * 9,5–10,0   pré-drop: o binário implode num ponto único (r 20, glow ×2) que vai para (960,500);
 *            bg.warp 0→.5 e speed 1→2 — match cut com a S10.
 * Rastros: sempre fitas afuniladas contínuas (um polígono por camada, gradiente ao longo do caminho).
 */
MECCA.scene({
  id: 's09-diferenciais',
  build({ root, tl, D, h, P, bg, onFrame, cue }) {
    const ID = 's09-diferenciais';
    const SEL = `[data-scene="${ID}"]`;
    const LAST = D - 1 / 30;               // último quadro renderizado
    const DEG = Math.PI / 180;
    const TAU = Math.PI * 2;
    const ROT = -14 * DEG;                 // inclinação das órbitas
    const { clamp, lerp, hexA, smooth } = h;
    const pe = (n) => gsap.parseEase(n);
    const EOUT = pe('mecca.out'), EIN = pe('mecca.in'), EIO = pe('mecca.inOut'), EBACK = pe('mecca.back');
    const P3I = pe('power3.in'), P2I = pe('power2.in'), P2O = pe('power2.out'), P2IO = pe('power2.inOut');
    const P1IO = pe('power1.inOut'), P3IO = pe('power3.inOut'), P1I = pe('power1.in');

    const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const lerpRGB = (A, B, k) => [lerp(A[0], B[0], k), lerp(A[1], B[1], k), lerp(A[2], B[2], k)];
    const rgba = (c, a) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
    const hexOf = (c) => '#' + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
    // 0 → 1 → 0 (ataque power2.out, soltura mecca.inOut)
    const bump = (t, t0, att, rel) => {
      const x = t - t0;
      if (x <= 0 || x >= att + rel) return 0;
      return x < att ? P2O(x / att) : 1 - EIO((x - att) / rel);
    };
    function simpson(f, a, b, n = 32) {
      if (b <= a) return 0;
      const s = (b - a) / n;
      let acc = f(a) + f(b);
      for (let i = 1; i < n; i++) acc += f(a + i * s) * (i % 2 ? 4 : 2);
      return acc * s / 3;
    }

    // ================================================================== continuidade com a S08
    // (a S08 termina com a máquina girando a +36°/s; aqui partimos exatamente do ângulo do último quadro dela)
    const T8 = 6 - 1 / 30;
    const sInt = (t, a, b) => {
      if (t <= a) return 0;
      const L = b - a;
      if (t >= b) return L * 0.5 + (t - b);
      const u = (t - a) / L;
      return L * (u * u * u - (u * u * u * u) / 2);
    };
    const Phi8 = (t) => t + 0.25 * (sInt(t, 3, 4) - sInt(t, 5, 5.75));
    const SPIN0 = 36 * (Phi8(T8) + 1 / 30);                                   // sol a 232,875° no último quadro da S08
    // brilho do Ponto: continuação exata do br(t) da S08 (lá: 1 − .12·(.5 − .5·cos(tπ)), t local da S08 = 6 + t aqui)
    const BR = (t) => 1 - 0.12 * (0.5 - 0.5 * Math.cos((6 + t) * Math.PI));
    const GLOW = (t) => 0.82 + 0.18 * Math.sin((T8 + t + 22) * Math.PI * 0.5);  // glow do cubo
    // carcaça (arcos do ícone): regra COMPARTILHADA S07/S08/S09, função do tempo GLOBAL gt —
    // 0° até 72 s; depois oscila ±18° com período de 4 s (0° exatos nos cortes de 76,0 e 82,0), sem nunca virar o logo
    const carcAngle = (gt) => (gt < 72 ? 0 : 18 * Math.sin(TAU * (gt - 72) / 4) * smooth(72, 72.6, gt));

    // sol: 36°/s → 90°/s (1,0–1,3, power2.out) → 72°/s (1,3–2,0)
    const W1 = (s) => 36 + 54 * P2O(clamp((s - 1) / 0.3));
    const W2 = (s) => 90 - 18 * P2IO(clamp((s - 1.3) / 0.7));
    const I1 = simpson(W1, 1, 1.3, 48), I2 = simpson(W2, 1.3, 2, 48);
    function spin(t) {
      if (t <= 1) return SPIN0 + 36 * t;
      if (t <= 1.3) return SPIN0 + 36 + simpson(W1, 1, t, 24);
      if (t <= 2) return SPIN0 + 36 + I1 + simpson(W2, 1.3, t, 24);
      return SPIN0 + 36 + I1 + I2 + 72 * (t - 2);
    }

    // ------------------------------------------------------------------ CSS local
    h.el('style', {
      html: `
${SEL} .s9-blk { position:absolute; left:0; top:0; width:1920px; height:1080px; }
${SEL} .s9-m { position:absolute; left:0; top:0; overflow:hidden; padding:.3em 1.25em .36em .14em; white-space:nowrap; }
${SEL} .s9-i { position:relative; white-space:nowrap; line-height:1; }
${SEL} .s9-i em { background:linear-gradient(90deg, #C026D3, #7C3AED); -webkit-background-clip:text; background-clip:text; color:transparent; }
${SEL} .s9-v, ${SEL} .s9-k, ${SEL} .s9-sr { display:inline-block; }
${SEL} .s9-pj { position:relative; }
${SEL} .s9-gl { position:absolute; left:0; top:0; color:transparent; white-space:nowrap; }
${SEL} .s9-ul { position:absolute; left:0; height:3px; border-radius:3px; background:linear-gradient(90deg, #C026D3, #7C3AED);
  transform-origin:0 50%; box-shadow:0 0 10px rgba(192,38,211,.55); }
${SEL} .s9-lab { position:absolute; left:0; top:0; font-family:var(--f-mono); font-weight:500; font-size:22px; letter-spacing:.12em;
  padding-left:.12em; text-transform:uppercase; white-space:nowrap; line-height:1; }
${SEL} .s9-lab > span { display:inline-block; }
`,
    }, root);

    // ================================================================== MÁQUINA (réplica exata do fechamento da S08)
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

    // canvas de trás (metade de trás das órbitas, halo do corpo A)
    const back = h.canvas(root).ctx;

    const svg = h.svg('svg', { class: 'fill', width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, root);
    const defs = h.svg('defs', {}, svg);
    const hid = h.uid('s9hub');
    const rg = h.svg('radialGradient', { id: hid }, defs);
    h.svg('stop', { offset: 0, 'stop-color': P.violet, 'stop-opacity': 0.5 }, rg);
    h.svg('stop', { offset: 0.5, 'stop-color': P.violet, 'stop-opacity': 0.14 }, rg);
    h.svg('stop', { offset: 1, 'stop-color': P.violet, 'stop-opacity': 0 }, rg);
    // preenchimento da pupila: começa violeta sólido (as duas paradas iguais) e vira a esfera A
    const pgid = h.uid('s9pup');
    const pg = h.svg('radialGradient', { id: pgid, cx: 0.5, cy: 0.5, r: 0.5, fx: 0.36, fy: 0.3 }, defs);
    const pgS0 = h.svg('stop', { offset: 0, 'stop-color': P.violet }, pg);
    const pgS1 = h.svg('stop', { offset: 1, 'stop-color': P.violet }, pg);
    const NS = 'non-scaling-stroke';

    const machine = h.svg('g', { transform: 'translate(1440 560) scale(0.45) translate(-1400 -560)' }, svg);
    const planetsG = h.svg('g', {}, machine);
    const gearG = h.svg('g', { transform: 'translate(1400 560) scale(0.31)' }, machine);
    const gearRot = h.svg('g', {}, gearG);
    h.svg('path', {
      d: gearD(401 - 14.6, 401 + 19, 28), fill: P.bg2, 'fill-opacity': 1, stroke: P.lavender, 'stroke-opacity': 0.5,
      'stroke-width': 2, 'stroke-linejoin': 'round', 'vector-effect': NS,
    }, gearRot);
    const glowW = h.svg('g', {}, gearG);
    const glow = h.svg('circle', { r: 230, fill: `url(#${hid})` }, glowW);
    const HUBK = 110 / (156 * 200 / 228);
    const hubG = h.svg('g', { transform: `translate(1400 560) scale(${HUBK.toFixed(4)})` }, machine);
    const hubIn = h.svg('g', { transform: 'translate(-100 -100)' }, hubG);
    const hub = h.icon({ size: 200, parent: hubIn });
    hub.dot.remove(); hub.arcOuter.remove(); hub.arcInner.remove();
    hub.pupil.setAttribute('fill', `url(#${pgid})`);
    const carcG = h.svg('g', { transform: 'translate(1045 205)' }, machine);
    const carc = h.icon({ size: 710, parent: carcG });
    carc.pupil.remove(); carc.dot.remove();
    const STEP = 360 / 7;
    const PL = [];
    for (let i = 0; i < 7; i++) {
      const ang = -90 + i * STEP;
      const g = h.svg('g', { transform: `translate(${(1400 + 198 * Math.cos(ang * DEG)).toFixed(2)} ${(560 + 198 * Math.sin(ang * DEG)).toFixed(2)})` }, planetsG);
      const rot = h.svg('g', {}, g);
      const d = h.gearPath({ teeth: 16, r: 78, depth: 0.13, hole: 0 });
      h.svg('path', { d, fill: i % 2 ? P.surface2 : P.surface, stroke: P.lavender, 'stroke-width': 1.5, 'stroke-linejoin': 'round', 'vector-effect': NS }, rot);
      h.svg('circle', { r: 50, fill: 'none', stroke: P.lavender, 'stroke-opacity': 0.18, 'stroke-width': 1, 'vector-effect': NS }, rot);
      PL.push({ g, rot, ang });
    }
    // ícone → tela: 110/156 × .45 (a esfera A de r 40 px = círculo de r 126 no viewBox 228 do ícone)
    const K_ICON = (110 / 156) * 0.45;
    const RC = 40 / K_ICON;
    const CIRCLE_D = `M${(114 + RC).toFixed(2)} 114 A${RC.toFixed(2)} ${RC.toFixed(2)} 0 1 1 ${(114 - RC).toFixed(2)} 114 ` +
      `A${RC.toFixed(2)} ${RC.toFixed(2)} 0 1 1 ${(114 + RC).toFixed(2)} 114 Z`;

    // canvas da frente (órbitas, Ponto, caixa-fantasma, fio, ondas)
    const ctx = h.canvas(root).ctx;

    // ================================================================== TEXTO
    function baseOff(el) {
      const probe = h.el('span', { style: { display: 'inline-block', width: '0px', height: '0px', verticalAlign: 'baseline' } });
      el.insertBefore(probe, el.firstChild);
      const off = h.rect(probe).y - h.rect(el).y;
      probe.remove();
      return off;
    }
    // linha com máscara própria: o contêiner corta, o interior sobe (y) — baseline posicionada em "base"
    function mkLine(parent, html, { size, weight = 700, color = P.ink, base, x = 192 }) {
      const outer = h.el('div', { cls: 's9-m' }, parent);
      outer.style.fontSize = size + 'px';
      outer.style.left = (x - 0.14 * size) + 'px';
      const inner = h.el('div', { cls: 't-display s9-i', html }, outer);
      inner.style.fontWeight = String(weight);
      inner.style.color = color;
      const ro = h.rect(outer), ri = h.rect(inner);
      const padTop = ri.y - ro.y;
      outer.style.top = (base - padTop - baseOff(inner)) + 'px';
      return { outer, inner, size, base, hide: ro.h - padTop + 0.08 * size, lift: -(padTop + ri.h + 0.1 * size) };
    }

    // bloco 1 — A gente assume, / não aconselha.
    const B1 = h.el('div', { cls: 's9-blk' }, root);
    const L1a = mkLine(B1, '<span class="s9-ag">A gente </span><em class="s9-v">assume,</em>', { size: 110, base: 250 });
    const L1b = mkLine(B1, 'não <span class="s9-k">aconselha</span>.', { size: 56, weight: 600, color: P.muted, base: 320 });
    // bloco 2 — A gente fica, / não entrega e some.
    const B2 = h.el('div', { cls: 's9-blk' }, root);
    const L2a = mkLine(B2, '<span class="s9-ag">A gente </span><em class="s9-v">fica,</em>', { size: 110, base: 450 });
    const L2b = mkLine(B2, 'não <span class="s9-k">entrega e some</span>.', { size: 56, weight: 600, color: P.muted, base: 520 });
    // bloco 3 — A gente tem / pele no jogo — / sócio de resultado.
    const B3 = h.el('div', { cls: 's9-blk' }, root);
    const L3a = mkLine(B3, 'A gente tem', { size: 56, weight: 500, color: P.lilac, base: 610 });
    const L3b = mkLine(B3, '<span class="s9-v s9-pj"><span class="s9-gl">pele no jogo —</span><em>pele no jogo —</em></span>', { size: 110, base: 720 });
    const L3c = mkLine(B3, '<span class="s9-sr">sócio de resultado</span>.', { size: 56, base: 795 });
    // bloco 4 — Cresceu, / a gente cresce junto.
    const B4 = h.el('div', { cls: 's9-blk' }, root);
    const L4a = mkLine(B4, '<em class="s9-v">Cresceu,</em>', { size: 150, base: 330 });
    const L4b = mkLine(B4, 'a gente cresce junto.', { size: 72, base: 430 });

    // o verbo ganha a sua própria máscara (mesma baseline, mesmo x): ele BATE no tempo sem ser cortado
    // pela subida da linha — a máscara dele só serve para a saída
    function detachVerb(L, block) {
      const v = L.inner.querySelector('.s9-v');
      const x = h.rect(v).x;
      const html = v.outerHTML;
      v.remove();
      const Lv = mkLine(block, html, { size: L.size, base: L.base, x });
      return { Lv, v: Lv.inner.querySelector('.s9-v') };
    }
    const ag1 = L1a.inner.querySelector('.s9-ag'), ag2 = L2a.inner.querySelector('.s9-ag');
    const { Lv: L1v, v: v1 } = detachVerb(L1a, B1);
    const { Lv: L2v, v: v2 } = detachVerb(L2a, B2);
    const v3 = L3b.inner.querySelector('.s9-v'), gl3 = L3b.inner.querySelector('.s9-gl');
    L3b.outer.style.paddingRight = '2.4em';   // folga para o bater (scale 1,25) não ser cortado pela máscara
    const v4 = L4a.inner.querySelector('.s9-v');

    // riscos (espessura 6, gradiente) sobre 'aconselha' e 'entrega e some'
    function strikeTop(span, size) { return (baseOff(span) - 0.25 * size - 3).toFixed(1) + 'px'; }
    const k1 = L1b.inner.querySelector('.s9-k'), k2 = L2b.inner.querySelector('.s9-k');
    const GRAD = 'linear-gradient(90deg, #C026D3, #7C3AED)';
    const st1 = h.strike(tl, k1, 1.5, { color: GRAD, thickness: 6, top: strikeTop(k1, 56), dur: 0.25 });
    const st2 = h.strike(tl, k2, 3.0, { color: GRAD, thickness: 6, top: strikeTop(k2, 56), dur: 0.25 });
    for (const s of [st1, st2]) s.style.boxShadow = '0 0 14px rgba(192,38,211,.6)';

    // sublinhado de 'sócio de resultado' (3 px, gradiente)
    const sr = L3c.inner.querySelector('.s9-sr');
    const ul = h.el('div', { cls: 's9-ul' }, L3c.inner);
    ul.style.top = (baseOff(L3c.inner) + 9).toFixed(1) + 'px';
    ul.style.width = h.rect(sr).w.toFixed(1) + 'px';

    // eyebrow
    const eb = h.eyebrow('A GENTE ASSUME, OPERA E FICA', { x: 192, y: 120, anchor: 'cl', parent: root });
    const ebDash = eb.querySelector('.dash');
    const ebSp = h.split(eb.querySelector('.lbl'), { type: 'chars' });

    // rótulos do binário (posicionados a cada quadro)
    const labA = h.el('div', { cls: 's9-lab', html: '<span>SUA EMPRESA</span>' }, root);
    const labB = h.el('div', { cls: 's9-lab', html: '<span>OS MECCA</span>' }, root);
    labA.style.color = P.lilac; labB.style.color = P.pink;                  // OS MECCA em #E249B0 a 100%
    // halo escuro (cor da base) sob as letras: as hairlines das órbitas não atravessam a leitura
    labA.style.textShadow = '0 0 4px rgba(22,10,39,.9), 0 0 10px rgba(22,10,39,.6)';
    labB.style.textShadow = '0 0 4px rgba(22,10,39,.9), 0 0 12px rgba(226,73,176,.4)';
    const labAi = labA.firstChild, labBi = labB.firstChild;
    const LAB_A = h.rect(labA), LAB_B = h.rect(labB);            // caixas dos rótulos (antes de qualquer transform)

    // ================================================================== TIMELINE (DOM + fundo)
    const BG0 = { glowA: 1, glowB: 1, glowC: 1, grid: 0, particles: 1, driftX: 0, driftY: 0, speed: 1, warp: 0, vignette: 0.55, dim: 0, hue: 0, grain: 1 };
    tl.set(bg, Object.assign({}, BG0), 0);

    const init = (targets, vars) => { gsap.set(targets, vars); tl.set(targets, Object.assign({}, vars), 0); };
    const LINES = [L1a, L1b, L2a, L2b, L3a, L3b, L3c, L4a, L4b];
    LINES.forEach((L) => init(L.inner, { y: L.hide }));
    init([L1v.inner, L2v.inner], { y: 0 });
    init([v1, v2, v3], { scale: 1.25, opacity: 0, transformOrigin: '0% 80%' });
    init(v4, { scale: 1, transformOrigin: '0% 82%' });
    init([ag1, ag2, L1b.inner, L2b.inner], { opacity: 1 });
    init(B1, { x: 0, opacity: 1, scale: 1, transformOrigin: '192px 285px' });
    init(B2, { x: 0, opacity: 1, scale: 1, transformOrigin: '192px 485px' });
    init(B3, { opacity: 1, y: 0, scale: 1, transformOrigin: '192px 700px' });
    init(B4, { opacity: 1, y: 0, scale: 1, transformOrigin: '192px 380px' });
    init(ul, { scaleX: 0, opacity: 1 });
    init(ebSp.chars, { autoAlpha: 0 });
    init(ebDash, { scaleX: 0, transformOrigin: '0% 50%' });
    init(eb, { x: 0 });
    init([labAi, labBi], { opacity: 0, y: 8 });

    // eyebrow — digitação (0,5) e apagamento de trás para frente (9,5)
    const NCH = ebSp.chars.length;
    tl.to(ebDash, { scaleX: 1, duration: 0.3, ease: 'mecca.out' }, 0.5);
    tl.to(ebSp.chars, { autoAlpha: 1, duration: 0.01, ease: 'none', stagger: 0.025 }, 0.62);
    tl.to(ebSp.chars, { autoAlpha: 0, duration: 0.01, ease: 'none', stagger: { each: 0.011, from: 'end' } }, 9.5);
    tl.to(ebDash, { scaleX: 0, duration: 0.12, ease: 'mecca.in' }, 9.5 + NCH * 0.011);

    const reveal = (L, at, dur = 0.6) => tl.to(L.inner, { y: 0, duration: dur, ease: 'mecca.out' }, at);
    const hit = (v, at) => {
      tl.to(v, { opacity: 1, duration: 0.05, ease: 'none' }, at);
      tl.to(v, { scale: 1, duration: 0.25, ease: 'expo.out' }, at);
    };

    // bloco 1 — ASSUME
    reveal(L1a, 0.5, 0.5); hit(v1, 0.5);    // a linha sobe na batida (máscara 0,5 s) e o verbo bate em cima dela
    reveal(L1b, 1.0);
    // o bloco cai para α .6 ('assume,' em .7); a linha secundária riscada tem piso de .65 (contraste do diferencial)
    tl.to(ag1, { opacity: 0.6, duration: 0.4, ease: 'power2.out' }, 2.0);
    tl.to(L1b.inner, { opacity: 0.65, duration: 0.4, ease: 'power2.out' }, 2.0);
    tl.to(v1, { opacity: 0.7, duration: 0.4, ease: 'power2.out' }, 2.0);
    tl.to(B1, { scale: 1.02, duration: 5.5, ease: 'none' }, 0.5);
    // bloco 2 — FICA
    reveal(L2a, 2.0, 0.5); hit(v2, 2.0);
    reveal(L2b, 2.5);
    tl.to(ag2, { opacity: 0.6, duration: 0.4, ease: 'power2.out' }, 3.5);          // 'fica,' continua em α 1
    tl.to(L2b.inner, { opacity: 0.65, duration: 0.4, ease: 'power2.out' }, 3.5);
    tl.to(B2, { scale: 1.02, duration: 4.0, ease: 'none' }, 2.0);
    // saída dos blocos 1 e 2 (6,0–6,3): mecca.in só no x; a opacidade em power1.in (sem "pop" no último quadro)
    tl.to([B1, B2], { x: -60, duration: 0.3, ease: 'mecca.in' }, 6.0);
    tl.to([B1, B2], { opacity: 0, duration: 0.3, ease: 'power1.in' }, 6.0);
    // bloco 3 — PELE NO JOGO
    reveal(L3a, 3.5, 0.5); reveal(L3b, 3.5, 0.5); hit(v3, 3.5);   // 'pele no jogo —' também por máscara
    reveal(L3c, 4.0);
    tl.to(ul, { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }, 4.0);
    tl.to(B3, { scale: 1.02, duration: 6.0, ease: 'none' }, 3.5);
    tl.to(B3, { opacity: 0.55, duration: 0.5, ease: 'power2.out' }, 7.0);
    // bloco 4 — CRESCE JUNTO
    reveal(L4a, 6.5); reveal(L4b, 6.6);
    [7.0, 7.5, 8.0, 8.5].forEach((b, i) => tl.to(v4, { scale: 1 + 0.03 * (i + 1), duration: 0.18, ease: 'mecca.back' }, b));
    tl.to(B4, { scale: 1.02, duration: 3.0, ease: 'none' }, 6.5);
    // saída (9,5–9,8): cada bloco sobe 20 px com fade (sem mexer nas máscaras → as linhas nunca se encostam);
    // o sublinhado de 'sócio de resultado' some primeiro (9,5–9,65)
    tl.to(ul, { opacity: 0, duration: 0.15, ease: 'power1.in' }, 9.5);
    tl.to(B4, { y: -20, duration: 0.28, ease: 'mecca.in' }, 9.5);
    tl.to(B4, { opacity: 0, duration: 0.28, ease: 'power1.in' }, 9.5);
    tl.to(B3, { y: -20, duration: 0.28, ease: 'mecca.in' }, 9.52);
    tl.to(B3, { opacity: 0, duration: 0.28, ease: 'power1.in' }, 9.52);
    // rótulos
    tl.to([labAi, labBi], { opacity: 1, y: 0, duration: 0.45, ease: 'mecca.out', stagger: 0.06 }, 4.0);
    tl.to([labAi, labBi], { opacity: 0, duration: 0.2, ease: 'power1.in' }, 9.5);
    // pupila → esfera A
    tl.to(hub.pupil, { morphSVG: CIRCLE_D, duration: 0.5, ease: 'mecca.inOut' }, 3.5);

    // ------------------------------------------------------------------ cues
    cue(0.5, 'impact', "'assume'", 0.7);
    cue(1.0, 'click', 'Ponto assume o motor', 0.9);
    cue(1.5, 'whoosh', 'risco', 0.3);
    cue(2.0, 'impact', "'fica'", 0.7);
    cue(3.0, 'glitch', 'caixa some', 0.35);
    cue(3.0, 'whoosh', 'risco', 0.3);
    cue(3.5, 'impact', "'pele no jogo'", 0.8);
    cue(4.0, 'chime', 'sócio de resultado', 0.5);
    cue(6.5, 'impact', "'Cresceu'", 0.6);
    cue(7.0, 'tick', 'cresce', 0.3);
    cue(7.5, 'tick', 'cresce', 0.3);
    cue(8.0, 'tick', 'cresce', 0.3);
    cue(8.5, 'tick', 'cresce', 0.3);
    cue(10.0, 'riser', 'pico no corte', 1.0);

    // ================================================================== GEOMETRIA (função pura do tempo)
    const TGT = h.ellipsePt(1440, 560, 320, 100, ROT, 0);    // Ponto no 1º quadro (D2, 0°) ≈ (1750,483)
    const VPT = { x: 1440, y: 546 };                           // V da pupila
    const CTRL = { x: 1590, y: 352 };                          // arco do mergulho
    const BEATS_G = [7.0, 7.5, 8.0, 8.5];
    const steps = (t) => { let s = 0; for (const b of BEATS_G) s += 0.25 * EBACK(clamp((t - b) / 0.18)); return s; };
    const growO = (t) => P1IO(clamp((t - 6.5) / 3));
    const uImp = (t) => clamp((t - 9.5) / 0.32);
    const kImp = (t) => 1 - P3I(uImp(t));

    // fase do Ponto/B: 2,3 em D2 a 180°; 1 volta/s; 3,5–4,0 desacelera para 72°/s (chega a 0° em 4,0)
    const TH0 = Math.PI;
    const wTrans = (s) => TAU * (1 - 0.8 * EIO(clamp((s - 3.5) / 0.5)));
    const I_T = simpson(wTrans, 3.5, 4.0, 64);
    const WB = 72 * DEG;
    // implosão: ω = WB·(1 + 29·u), u = (t − 9,5)/0,32 → espirala para dentro cada vez mais rápido (≈1 volta).
    // Integral em forma fechada (e inversa exata), usada também para amostrar os rastros por ângulo.
    const KQ = 29 / (2 * 0.32);                      // θ/WB = x + KQ·x² para x = t − 9,5 ≤ 0,32
    const E_IMP = 0.32 + KQ * 0.32 * 0.32;           // = 4,96 (em unidades de WB)
    const TH4 = TH0 + TAU * 1.2 + I_T;               // θ em 4,0
    function thetaB(t) {
      if (t <= 3.5) return TH0 + TAU * (t - 2.3);
      if (t <= 4.0) return TH0 + TAU * 1.2 + simpson(wTrans, 3.5, t, 24);
      if (t <= 9.5) return TH4 + WB * (t - 4.0);
      const x = t - 9.5;
      if (x <= 0.32) return TH4 + WB * (5.5 + x + KQ * x * x);
      return TH4 + WB * (5.5 + E_IMP + 30 * (x - 0.32));
    }
    function timeOfTheta(th) {                       // inversa de thetaB para t ≥ 4,0
      const d = (th - TH4) / WB;
      if (d <= 5.5) return 4.0 + d;
      const e = d - 5.5;
      if (e <= E_IMP) return 9.5 + (-1 + Math.sqrt(1 + 4 * KQ * e)) / (2 * KQ);
      return 9.82 + (e - E_IMP) / 30;
    }
    function bary(t) {
      const y1 = lerp(560, 480, growO(t));
      const m = P3IO(clamp((t - 9.6) / (LAST - 9.6)));
      return { x: lerp(1440, 960, m), y: lerp(y1, 500, m) };
    }
    function orbB(t) {
      if (t < 3.5) return { rx: 320, ry: 100 };
      const e = EIO(clamp((t - 3.5) / 0.5)), g = 1 + 0.25 * growO(t), k = kImp(t);
      return { rx: lerp(320, 200, e) * g * k, ry: lerp(100, 70, e) * g * k };
    }
    function orbA(t) {
      const amp = EIO(clamp((t - 3.5) / 0.5)), g = 1 + 0.4 * growO(t), k = kImp(t);
      return { rx: 40 * g * amp * k, ry: 14 * g * amp * k };
    }
    function Bpos(t) {
      const c = bary(t), o = orbB(t), th = thetaB(t);
      const q = h.ellipsePt(c.x, c.y, o.rx, o.ry, ROT, th);
      return { x: q.x, y: q.y, th };
    }
    function Apos(t) {
      const c = bary(t), o = orbA(t);
      return h.ellipsePt(c.x, c.y, o.rx, o.ry, ROT, thetaB(t) + Math.PI);
    }
    function radA(t) {
      if (t < 9.5) return 40 + 12 * steps(t);
      return lerp(52, 20, P2I(uImp(t)));
    }
    const inside = (t) => smooth(1.0, 1.15, t) * (1 - smooth(1.85, 2.05, t));
    // estado do Ponto (= corpo B depois de 4,0)
    function ponto(t) {
      if (t < 0.5) return { x: TGT.x, y: TGT.y, r: 10, wf: 1, gm: 1 };
      if (t < 1.0) {
        const u = P3I((t - 0.5) / 0.5), v = 1 - u;
        return {
          x: v * v * TGT.x + 2 * v * u * CTRL.x + u * u * VPT.x,
          y: v * v * TGT.y + 2 * v * u * CTRL.y + u * u * VPT.y,
          r: 10 - 4 * smooth(0.8, 1.0, t), wf: 1, gm: 1,
        };
      }
      if (t < 2.0) return { x: VPT.x, y: VPT.y, r: 6, wf: 1, gm: 1 + 0.5 * inside(t) };
      const B = Bpos(t);
      const dep = smooth(-0.22, 0.22, Math.sin(B.th));
      if (t < 2.3) {
        const e = EOUT((t - 2.0) / 0.3);
        return { x: lerp(VPT.x, B.x, e), y: lerp(VPT.y, B.y, e), r: lerp(6, 10, e), wf: lerp(1, dep, smooth(0.3, 1, e)), gm: 1 };
      }
      if (t < 4.0) {
        const k = EIO(clamp((t - 3.5) / 0.5));
        return { x: B.x, y: B.y, r: 10 + k, wf: lerp(dep, 1, k), gm: 1 };
      }
      if (t < 9.5) return { x: B.x, y: B.y, r: 11 + 4 * steps(t), wf: 1, gm: 1 };
      const u = uImp(t);
      return { x: B.x, y: B.y, r: lerp(15, 20, smooth(0, 1, u)), wf: 1, gm: 1 + smooth(0.4, 1, u) };
    }

    // caixa-fantasma: desliza da esquerda até a ponta esquerda de D1 (180°) e sobe pela metade de trás/esquerda
    // (φ crescente, sempre por FORA da carcaça); em 3,0 é arremessada para FORA (esquerda/baixo, longe da máquina)
    // e vira 24 partículas que derivam 60–120 px para longe
    const phiBox = (t) => Math.PI + 9 * DEG * EIO(clamp((t - 2.5) / 0.5));
    const BOXDX = -12;                                   // folga da carcaça (a hairline de D1 passa pela caixa)
    const boxRide = (t) => { const q = h.ellipsePt(1440, 560, 220, 70, ROT, phiBox(t)); return { x: q.x + BOXDX, y: q.y }; };
    const BOX3 = boxRide(3.0);
    const FL = (() => { const x = -0.86, y = 0.5, L = Math.hypot(x, y); return { x: x / L, y: y / L }; })();   // arremesso
    const BOXROT = ROT * 0.5;
    function boxPos(t) {
      if (t <= 3.0) {
        const q = boxRide(t);
        const ent = EOUT(clamp((t - 2.5) / 0.45));
        return { x: q.x - 170 * (1 - ent), y: q.y };
      }
      const dt = t - 3.0;
      const k = 320 * dt + 1400 * dt * dt;
      return { x: BOX3.x + FL.x * k, y: BOX3.y + FL.y * k };
    }
    const PR = h.rng(9091);
    const BOXP = [];
    for (let i = 0; i < 24; i++) {
      const s = ((i + PR() * 0.7) / 24) * 400;   // perímetro do retângulo 120×80
      let lx, ly;
      if (s < 120) { lx = -60 + s; ly = -40; } else if (s < 200) { lx = 60; ly = -40 + (s - 120); } else if (s < 320) { lx = 60 - (s - 200); ly = 40; } else { lx = -60; ly = 40 - (s - 320); }
      const cr = Math.cos(BOXROT), sr = Math.sin(BOXROT);
      const ox = lx * cr - ly * sr, oy = lx * sr + ly * cr;
      const L = Math.hypot(ox, oy) || 1;
      const ja = (PR() - 0.5) * 0.9;
      const dx = ox / L, dy = oy / L;
      BOXP.push({
        ox, oy, dx: dx * Math.cos(ja) - dy * Math.sin(ja), dy: dx * Math.sin(ja) + dy * Math.cos(ja),
        drift: 60 + PR() * 60, spread: 12 + PR() * 30, sz: 4 + PR() * 3, col: i % 3 === 0 ? P.lilac : P.slate,
      });
    }

    // ================================================================== DESENHO
    function arcDepth(G, a0, a1, alpha, lw, color, backMul = 0.5) {
      if (alpha <= 0.002 || a1 <= a0 || G.rx < 0.5) return;
      let s = a0;
      let guard = 0;
      while (s < a1 - 1e-6 && guard++ < 16) {
        const k = Math.floor(s / Math.PI + 1e-9);
        const e = Math.min(a1, (k + 1) * Math.PI);
        const front = Math.sin((s + e) / 2) > 0;
        const c = front ? ctx : back;
        c.save();
        c.translate(G.cx, G.cy); c.rotate(ROT);
        c.strokeStyle = hexA(color, alpha * (front ? 1 : backMul));
        c.lineWidth = lw;
        c.beginPath(); c.ellipse(0, 0, G.rx, G.ry, 0, s, e); c.stroke();
        c.restore();
        s = e;
      }
    }
    // Ponto no desenho padrão global (idêntico ao da S08): glowDot lavanda α .6·br + núcleo #FBF8FF.
    // Halos e núcleo separados: no crossfade de estilo (implosão) só os halos se misturam; o núcleo é pintado uma vez.
    function haloPonto(c, x, y, r, br, a, gm = 1) {
      if (a <= 0.003 || r <= 0.05) return;
      h.glowDot(c, x, y, r, P.lavender, clamp(0.6 * br * a * gm));
    }
    // halo do Ponto fundido no mesmo desenho que a S10 usa no seu 1º quadro (r 20, g 2)
    function haloFused(c, x, y, r, g, a) {
      if (a <= 0.003 || r <= 0.05) return;
      h.glowDot(c, x, y, r, P.lavender, clamp(0.6 * g) * a);
      if (g > 1.02) {
        const R = r * 5 * g;
        const gr = c.createRadialGradient(x, y, 0, x, y, R);
        gr.addColorStop(0, hexA(P.lavender, clamp(0.24 * (g - 1), 0, 0.5) * a));
        gr.addColorStop(1, hexA(P.lavender, 0));
        c.fillStyle = gr; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      }
    }
    function coreDot(c, x, y, r, a) {
      if (a <= 0.003 || r <= 0.05) return;
      c.fillStyle = hexA(P.ink, clamp(a)); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
    const MAG = rgb(P.magenta), VIO = rgb(P.violet), PINK = rgb(P.pink), LIL = rgb(P.lilac), LAV = rgb(P.lavender), INK = rgb(P.ink);

    // FITA: rastro como UM polígono afunilado contínuo por camada (sem segmentos sobrepostos → sem "contas").
    // pts[0] = cabeça. W/COL/AL: largura, cor [r,g,b] e α por amostra. layerOf(i) → {c, k} do trecho i→i+1 (ou null).
    // center: gradiente cônico em volta do centro da órbita (cor/α seguem o ângulo — serve para espirais de até ~330°);
    // sem center: gradiente linear cabeça→cauda, com uma parada por amostra projetada no eixo.
    function ribbon(pts, W, COL, AL, layerOf, center) {
      const N = pts.length - 1;
      if (N < 1) return;
      const Lx = new Array(N + 1), Ly = new Array(N + 1), Rx = new Array(N + 1), Ry = new Array(N + 1);
      let nx = 0, ny = -1;
      for (let i = 0; i <= N; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
        const dx = b.x - a.x, dy = b.y - a.y, dl = Math.hypot(dx, dy);
        if (dl > 1e-3) { nx = -dy / dl; ny = dx / dl; }
        const w = W[i] / 2;
        Lx[i] = pts[i].x + nx * w; Ly[i] = pts[i].y + ny * w;
        Rx[i] = pts[i].x - nx * w; Ry[i] = pts[i].y - ny * w;
      }
      let ang = null;
      if (center) {
        ang = new Array(N + 1);
        for (let i = 0; i <= N; i++) {
          let a = Math.atan2(pts[i].y - center.y, pts[i].x - center.x);
          if (i > 0) { while (a > ang[i - 1] + Math.PI) a -= TAU; while (a < ang[i - 1] - Math.PI) a += TAU; }
          ang[i] = a;
        }
      }
      let i0 = 0;
      while (i0 < N) {
        const ly = layerOf(i0);
        let i1 = i0 + 1;
        while (i1 < N && layerOf(i1) === ly) i1++;
        if (ly && ly.k > 0.002) {
          const c = ly.c;
          let g = null;
          if (center) {
            // o movimento é horário (θ crescente) → a cauda tem o menor ângulo; o gradiente começa um pouco antes dela
            // (margem transparente) e as paradas vão em ordem crescente de ângulo
            const ord = [];
            for (let i = 0; i <= N; i++) ord.push(i);
            ord.sort((p, q) => ang[p] - ang[q]);
            const a0 = ang[ord[0]] - 0.25;
            g = c.createConicGradient(a0, center.x, center.y);
            g.addColorStop(0, rgba(COL[ord[0]], 0));
            for (const i of ord) g.addColorStop(clamp((ang[i] - a0) / TAU), rgba(COL[i], clamp(AL[i] * ly.k)));
          } else {
            const p0 = pts[i0], p1 = pts[i1];
            const ax = p1.x - p0.x, ay = p1.y - p0.y, al = ax * ax + ay * ay;
            if (al > 0.25) {
              g = c.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
              let last = 0;
              for (let i = i0; i <= i1; i++) {
                const o = clamp(Math.max(last, ((pts[i].x - p0.x) * ax + (pts[i].y - p0.y) * ay) / al));
                last = o;
                g.addColorStop(o, rgba(COL[i], clamp(AL[i] * ly.k)));
              }
            }
          }
          if (g) {
            c.fillStyle = g;
            c.beginPath(); c.moveTo(Lx[i0], Ly[i0]);
            for (let i = i0 + 1; i <= i1; i++) c.lineTo(Lx[i], Ly[i]);
            for (let i = i1; i >= i0; i--) c.lineTo(Rx[i], Ry[i]);
            c.closePath(); c.fill();
          }
        }
        i0 = i1;
      }
    }
    // rastro padrão do Ponto (> 600 px/s): janela das últimas 8 posições (8/60 s), magenta → violeta, afunilado
    function drawTrail(c, t, r, a) {
      if (a <= 0.003) return;
      const N = 20, pts = [], W = [], COL = [], AL = [];
      for (let i = 0; i <= N; i++) {
        const f = i / N;
        pts.push(ponto(Math.max(0, t - f * 8 / 60)));
        W.push(2 * r * 0.85 * Math.pow(1 - f, 0.8));
        COL.push(lerpRGB(MAG, VIO, Math.min(1, f * 1.3)));
        AL.push(0.85 * a * Math.pow(1 - f, 1.2));
      }
      const L = { c, k: 1 };
      ribbon(pts, W, COL, AL, () => L, null);
    }
    // rastro longo em espiral dos corpos do binário: amostrado por ÂNGULO (uniforme), no referencial do baricentro
    // atual — cabeça = corpo, cauda = θ − Φ. orb(s) dá a órbita histórica; off = 0 (B) ou π (A).
    // core > 0: segunda passada — núcleo fino e claro dentro da fita (mesmo caminho, sem sobreposição de segmentos)
    function spiralTrail(c, t, orb, off, Phi, w0, c0, c1, a, core = 0) {
      if (a <= 0.003 || Phi < 0.02) return;
      const cB = bary(t), th = thetaB(t);
      const N = Math.max(24, Math.min(96, Math.ceil(Phi / (3 * DEG))));
      const pts = [], W = [], COL = [], AL = [], W2 = [], COL2 = [], AL2 = [];
      for (let i = 0; i <= N; i++) {
        const f = i / N;
        const thi = th - Phi * f;
        const s = i === 0 ? t : timeOfTheta(thi);
        const o = orb(s);
        pts.push(h.ellipsePt(cB.x, cB.y, o.rx, o.ry, ROT, thi + off));
        W.push(Math.max(0.4, w0 * Math.pow(1 - f, 0.75)));
        COL.push(lerpRGB(c0, c1, Math.min(1, f * 1.15)));
        AL.push(a * Math.pow(1 - f, 1.1));
        if (core > 0) {
          W2.push(Math.max(0.3, w0 * 0.32 * Math.pow(1 - f, 0.6)));
          COL2.push(lerpRGB(lerpRGB(c0, INK, 0.35), c0, Math.min(1, f * 1.6)));
          AL2.push(core * Math.pow(1 - f, 1.7));
        }
      }
      const L = { c, k: 1 };
      ribbon(pts, W, COL, AL, () => L, cB);
      if (core > 0) ribbon(pts, W2, COL2, AL2, () => L, cB);
    }
    // caixa-fantasma = o card 'post' da S03 em miniatura: contorno tracejado slate (quase sem fill) e, dentro,
    // o mesmo line art (moldura da imagem, montanha, sol e duas linhas de legenda) em slate α .6.
    // Coordenadas da S03 (card 240..500 × 372..560, centro (370,466)) → caixa 120×80 (sx .44, sy .425)
    const PX = (x) => (x - 370) * 0.44, PY = (y) => (y - 466) * 0.425;
    const POST_IMG = { x: PX(256), y: PY(388), w: 228 * 0.44, h: 112 * 0.425 };
    const POST_MTN = [[257, 486], [316, 434], [350, 466], [394, 422], [483, 492]].map(([x, y]) => [PX(x), PY(y)]);
    const POST_SUN = { x: PX(446), y: PY(414), r: 5 };
    const POST_TXT = [[PX(256), PX(436), PY(524)], [PX(256), PX(376), PY(544)]];
    function drawBox(c, x, y, a, col, t) {
      c.save();
      c.translate(x, y); c.rotate(BOXROT);
      c.beginPath(); c.roundRect(-60, -40, 120, 80, 10);
      c.fillStyle = hexA(P.slate, 0.08 * a); c.fill();
      c.setLineDash([6, 6]); c.lineDashOffset = -t * 24;
      c.strokeStyle = hexA(col, a); c.lineWidth = 1.5; c.stroke();
      c.setLineDash([]);
      c.lineJoin = 'round'; c.lineCap = 'round';
      c.strokeStyle = hexA(col, 0.6 * a); c.lineWidth = 1.25;
      c.beginPath(); c.roundRect(POST_IMG.x, POST_IMG.y, POST_IMG.w, POST_IMG.h, 4); c.stroke();
      c.beginPath(); POST_MTN.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.stroke();
      c.beginPath(); c.arc(POST_SUN.x, POST_SUN.y, POST_SUN.r, 0, TAU); c.stroke();
      c.lineWidth = 1;
      c.beginPath(); for (const [x0, x1, ly] of POST_TXT) { c.moveTo(x0, ly); c.lineTo(x1, ly); } c.stroke();
      c.restore();
    }
    const env = (x) => (x < 0 ? 0 : x < 0.06 ? P2O(x / 0.06) : Math.exp(-(x - 0.06) / 0.14));

    // ================================================================== onFrame
    onFrame((lt, gt) => {
      const t = lt;

      // ---------------- fundo: padrão → (9,5 → último quadro) warp .5, speed 2
      const wv = P2I(clamp((t - 9.5) / (LAST - 9.5)));
      Object.assign(bg, BG0, { warp: 0.5 * wv, speed: 1 + wv });

      // ---------------- máquina
      const sp = spin(t), th = sp;
      const cP = EIN(clamp((t - 3.5) / 0.3));   // planetas recolhem
      const cS = EIN(clamp((t - 3.6) / 0.3));   // o sol some
      const cC = EIN(clamp((t - 3.5) / 0.35));  // carcaça
      const kick = bump(t, 1.0, 0.06, 0.5);
      const ms = 0.45 * (1 + 0.03 * kick);
      machine.setAttribute('transform', `translate(1440 560) scale(${ms.toFixed(4)}) translate(-1400 -560)`);
      gearRot.setAttribute('transform', `rotate(${th.toFixed(3)})`);
      gearG.setAttribute('transform', `translate(1400 560) scale(${(0.31 * (1 - cS)).toFixed(4)})`);
      gearG.setAttribute('opacity', (1 - smooth(0.6, 1, cS)).toFixed(3));
      for (const p of PL) {
        const rr = 198 * (1 - cP);
        const x = 1400 + rr * Math.cos(p.ang * DEG), y = 560 + rr * Math.sin(p.ang * DEG);
        p.g.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(1 - 0.75 * cP).toFixed(4)})`);
        p.g.setAttribute('opacity', (1 - smooth(0.55, 1, cP)).toFixed(3));
        const rotB = p.ang + 180 + 180 / 16 - (28 / 16) * (th - p.ang);
        p.rot.setAttribute('transform', `rotate(${rotB.toFixed(3)})`);
      }
      carc.g.setAttribute('transform', `rotate(${carcAngle(gt).toFixed(3)} 114 114)`);
      carcG.setAttribute('transform', `translate(1400 560) scale(${(1 + 0.12 * cC).toFixed(4)}) translate(-355 -355)`);
      carcG.setAttribute('opacity', (1 - P1I(clamp((t - 3.5) / 0.35))).toFixed(3));   // fade em power1.in (escala segue mecca.in)
      glow.setAttribute('opacity', GLOW(t).toFixed(3));

      // pupila: pisca no encaixe; vira a esfera A (#C4B5FD → #6D28D9)
      const blink = bump(t, 1.0, 0.08, 0.35);
      const mA = EIO(clamp((t - 3.5) / 0.5));
      pgS0.setAttribute('stop-color', rgba(lerpRGB(lerpRGB(VIO, LIL, blink), LIL, mA), 1));
      pgS1.setAttribute('stop-color', rgba(lerpRGB(lerpRGB(VIO, LIL, blink), rgb(P.violetDeep), mA), 1));
      const A = Apos(t), rA = radA(t);
      const sA = rA / 40;
      hubG.setAttribute('transform', `translate(${(1400 + (A.x - 1440) / 0.45).toFixed(2)} ${(560 + (A.y - 560) / 0.45).toFixed(2)}) scale(${(HUBK * sA).toFixed(4)})`);
      const aA = 1 - smooth(0.72, 1, uImp(t));
      hubG.setAttribute('opacity', aA.toFixed(3));

      // ---------------- texto: glow rosa de 'pele no jogo —' pulsa em cada batida de 4,0 a 6,0
      let pulse = 0;
      for (let b = 4.0; b <= 6.001; b += 0.5) pulse = Math.max(pulse, env(t - b));
      const ga = 0.1 + 0.45 * pulse;
      gl3.style.textShadow = `0 0 24px ${hexA(P.pink, ga.toFixed(3))}, 0 0 46px ${hexA(P.pink, (ga * 0.45).toFixed(3))}`;

      // ---------------- canvas
      back.clearRect(0, 0, 1920, 1080);
      ctx.clearRect(0, 0, 1920, 1080);

      // D1 / D2 (hairline α .3 → .15 em 3,5–4,0), piscam no encaixe. D1 some em 3,8–4,3 (a órbita de B passa
      // pelo tamanho dela); D2 fica a α .15 até 6,5 e some em 6,5–7,5
      const dBase = lerp(0.3, 0.15, EIO(clamp((t - 3.5) / 0.5))) + 0.2 * bump(t, 1.0, 0.05, 0.6);
      arcDepth({ cx: 1440, cy: 560, rx: 220, ry: 70 }, 0, TAU, dBase * (1 - smooth(3.8, 4.3, t)), 1.25, P.lavender);
      arcDepth({ cx: 1440, cy: 560, rx: 320, ry: 100 }, 0, TAU, dBase * (1 - smooth(6.5, 7.5, t)), 1.25, P.lavender);

      // anel-rastro do Ponto em D2 (FICA): o traço fica e o α acumula de .15 a .6; ao fechar a volta (3,3) um flash
      if (t > 2.3) {
        const G = { cx: 1440, cy: 560, rx: 320, ry: 100 };
        const ts = Math.min(t, 3.5);
        const a0 = thetaB(2.3), a1 = thetaB(ts);
        const lap = bump(t, 3.3, 0.05, 0.4);
        const ra = (lerp(0.15, 0.6, smooth(2.3, 3.4, ts)) + 0.3 * lap) * lerp(1, 0.3, EIO(clamp((t - 3.5) / 0.5))) * (1 - smooth(6.5, 7.5, t));
        const rcol = lap > 0.02 ? hexOf(lerpRGB(LIL, INK, 0.45 * lap)) : P.lilac;
        arcDepth(G, a0, Math.min(a1, a0 + TAU), ra, 2, rcol, 0.55);
        if (a1 > a0 + TAU) arcDepth(G, a0 + TAU, a1, ra * 0.7, 2, rcol, 0.55);
        if (lap > 0.02) {                           // o anel completo "acende" num halo largo e some
          arcDepth(G, 0, TAU, 0.16 * lap, 7, P.lavender, 0.5);
        }
        // "cometa": o último quarto de volta brilha — uma fita contínua (frente/trás), rosa na cabeça
        if (t < 3.75) {
          const ca = 1 - smooth(3.45, 3.75, t);
          const thN = thetaB(t);
          const span = Math.min(Math.PI / 2, thN - a0);
          if (span > 0.02 && ca > 0.003) {
            const ob = orbB(t), N = 36;
            const pts = [], W = [], COL = [], AL = [], TH = [];
            for (let i = 0; i <= N; i++) {
              const f = i / N, a = thN - span * f;
              TH.push(a);
              pts.push(h.ellipsePt(1440, 560, ob.rx, ob.ry, ROT, a));
              W.push(Math.max(0.5, 3.2 * Math.pow(1 - f, 0.7)));
              COL.push(lerpRGB(PINK, LAV, smooth(0.15, 0.45, f)));
              AL.push(0.6 * ca * Math.pow(1 - f, 1.6));
            }
            const FR = { c: ctx, k: 1 }, BK = { c: back, k: 0.5 };
            ribbon(pts, W, COL, AL, (i) => (Math.sin((TH[i] + TH[i + 1]) / 2) > 0 ? FR : BK), { x: 1440, y: 560 });
          }
        }
      }

      // órbitas do binário (B: a hairline nasce de D2 e encolhe; A: miniatura)
      const cB = bary(t), oB = orbB(t), oA = orbA(t);
      const oal = smooth(3.55, 4.1, t) * (1 - smooth(9.5, 9.78, t));
      arcDepth({ cx: cB.x, cy: cB.y, rx: oB.rx, ry: oB.ry }, 0, TAU, 0.32 * oal, 1.25, P.lavender);
      arcDepth({ cx: cB.x, cy: cB.y, rx: oA.rx, ry: oA.ry }, 0, TAU, 0.28 * oal, 1, P.lilac);

      // encaixe (1,0): onda curta r 60 → 180 + clarão no V
      if (t > 1.0 && t < 1.55) {
        const u = (t - 1.0) / 0.55, e = P2O(u);
        ctx.strokeStyle = hexA(P.lilac, 0.6 * (1 - u)); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(VPT.x, VPT.y, 60 + 120 * e, 0, TAU); ctx.stroke();
        ctx.strokeStyle = hexA(P.magenta, 0.35 * (1 - u)); ctx.lineWidth = 1.25;
        ctx.beginPath(); ctx.arc(VPT.x, VPT.y, (60 + 120 * e) * 0.86, 0, TAU); ctx.stroke();
      }
      if (t > 1.0 && t < 1.4) {
        const u = (t - 1.0) / 0.4;
        h.glowDot(ctx, VPT.x, VPT.y, 9 + 9 * P2O(u), P.lilac, 0.85 * (1 - u) * (1 - u));
      }
      // o motor sob o comando do Ponto: brilho quente no cubo
      const ins = inside(t);
      if (ins > 0.003) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(1440, 556, 0, 1440, 556, 64);
        g.addColorStop(0, hexA(P.lavender, 0.28 * ins));
        g.addColorStop(1, hexA(P.lavender, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(1440, 556, 64, 0, TAU); ctx.fill();
        ctx.restore();
      }

      // caixa-fantasma (2,5–3,0) e as 24 partículas (3,0–3,4)
      if (t >= 2.5 && t < 3.12) {
        const q = boxPos(t);
        const a = EOUT(clamp((t - 2.5) / 0.3)) * (1 - smooth(3.0, 3.1, t));
        if (t > 2.86 && t < 3.06) {          // glitch antes de sumir (o deslocamento só empurra para FORA)
          const fr = Math.round(t * 30);
          const r = h.rng(fr * 131 + 7);
          const dx = -r() * 12, dy = (r() - 0.5) * 5;
          drawBox(ctx, q.x + dx, q.y + dy, a, P.slate, t);
          drawBox(ctx, q.x + dx * 0.6 - 6, q.y - dy, a * 0.5, P.pink, t);
        } else drawBox(ctx, q.x, q.y, a, P.slate, t);
      }
      // 3,0–3,4: 24 partículas (slate/lilás, 4–7 px) derivam 60–120 px para fora da máquina e somem
      if (t >= 3.0 && t < 3.42) {
        const dt = t - 3.0, u = clamp(dt / 0.4);
        const e = P2O(u);
        const a = Math.pow(1 - u, 1.1);
        for (const p of BOXP) {
          const x = BOX3.x + p.ox + FL.x * p.drift * e + p.dx * p.spread * e;
          const y = BOX3.y + p.oy + FL.y * p.drift * e + p.dy * p.spread * e;
          const s = p.sz * (1 - 0.45 * u);
          ctx.fillStyle = hexA(p.col, 0.95 * a);
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }

      // halo do corpo A (atrás da esfera)
      const haloA = smooth(3.6, 4.0, t) * aA;
      if (haloA > 0.003) {
        const R = rA * 2.3;
        const g = back.createRadialGradient(A.x, A.y, rA * 0.6, A.x, A.y, R);
        g.addColorStop(0, hexA(P.violet, 0.42 * haloA));
        g.addColorStop(1, hexA(P.violet, 0));
        back.fillStyle = g; back.beginPath(); back.arc(A.x, A.y, R, 0, TAU); back.fill();
      }

      // "lock" do binário (4,0): anel suave saindo do baricentro
      if (t > 4.0 && t < 4.6) {
        const u = (t - 4.0) / 0.6, e = P2O(u);
        ctx.save(); ctx.translate(cB.x, cB.y); ctx.rotate(ROT);
        ctx.strokeStyle = hexA(P.lilac, 0.35 * (1 - u)); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(0, 0, 60 + 170 * e, (60 + 170 * e) * 0.35, 0, 0, TAU); ctx.stroke();
        ctx.restore();
      }
      // ondas elípticas do CRESCE JUNTO (7,0 / 7,5 / 8,0 / 8,5)
      BEATS_G.forEach((w0, i) => {
        const u = (t - w0) / 0.9;
        if (u <= 0 || u >= 1) return;
        const rx = lerp(250, 420, P2O(u));
        ctx.save(); ctx.translate(cB.x, cB.y); ctx.rotate(ROT);
        ctx.strokeStyle = hexA(i % 2 ? P.pink : P.lavender, 0.45 * (1 - u)); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(0, 0, rx, rx * 0.35, 0, 0, TAU); ctx.stroke();
        ctx.restore();
      });

      // Ponto / corpo B
      const pn = ponto(t);
      const B = pn;

      // fio entre A e B (3,8 → 9,7)
      if (t >= 3.8 && t < 9.8) {
        const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy);
        const gap0 = rA + 4, gap1 = B.r + 4;
        if (L > gap0 + gap1 + 2) {
          const ux = dx / L, uy = dy / L;
          const sx = A.x + ux * gap0, sy = A.y + uy * gap0;
          const ex = B.x - ux * gap1, ey = B.y - uy * gap1;
          const grow = EOUT(clamp((t - 3.8) / 0.35));
          const fa = 1 - smooth(9.62, 9.78, t);
          const gx = lerp(sx, ex, grow), gy = lerp(sy, ey, grow);
          const gr = ctx.createLinearGradient(sx, sy, ex, ey);
          gr.addColorStop(0, P.magenta); gr.addColorStop(1, P.violet);
          ctx.save(); ctx.lineCap = 'round'; ctx.globalAlpha = fa;
          ctx.strokeStyle = gr; ctx.globalAlpha = 0.22 * fa; ctx.lineWidth = 8;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(gx, gy); ctx.stroke();
          ctx.globalAlpha = fa; ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(192,38,211,0.85)'; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(gx, gy); ctx.stroke();
          ctx.restore();
          // pulsos de troca pelo fio (sócios): um por batida, alternando o sentido
          for (let i = 0; i < 10; i++) {
            const b0 = 4.5 + i * 0.5;
            const u = (t - b0) / 0.42;
            if (u <= 0 || u >= 1 || b0 > 9.0) continue;
            const k = i % 2 ? P2IO(u) : 1 - P2IO(u);
            h.glowDot(ctx, lerp(sx, ex, k), lerp(sy, ey, k), 2.6, i % 2 ? P.lilac : P.pink, 0.9 * Math.sin(Math.PI * u) * fa);
          }
        }
      }

      // rastros em espiral (8,3 → implosão): fitas contínuas amostradas por ângulo, no referencial do baricentro.
      // Antes de 9,5: os últimos 0,9 s de órbita (≈65°), crescendo junto com as órbitas; na implosão o mesmo
      // intervalo vira uma espiral de até 320° que se fecha no ponto de fusão. O de A corre ATRÁS da esfera A.
      const trW = smooth(8.3, 8.7, t) * (1 - smooth(9.82, 9.93, t));
      if (trW > 0.003) {
        const Phi = Math.min(thetaB(t) - thetaB(t - 0.9), 320 * DEG);
        spiralTrail(ctx, t, orbB, 0, Phi, pn.r * 0.9, PINK, VIO, 0.5 * trW, 0.6 * trW);
        spiralTrail(back, t, orbA, Math.PI, Phi, lerp(6, 10, smooth(9.5, 9.7, t)), LIL, VIO, 0.5 * trW * aA);
      }

      // Ponto (com peso de profundidade: na metade de trás de D2 passa atrás da máquina)
      const prev = ponto(Math.max(0, t - 1 / 30));
      const speed = Math.hypot(pn.x - prev.x, pn.y - prev.y) * 30;
      const trk = smooth(480, 720, speed);
      const br = BR(t);
      const fs = smooth(0.5, 1, uImp(t));        // fusão: o halo do Ponto vira o da S10 (glowDot + halo largo)
      for (const [c, w] of [[ctx, pn.wf], [back, (1 - pn.wf) * 0.6]]) {
        if (w <= 0.003) continue;
        drawTrail(c, t, pn.r, trk * w * (1 - trW));
        if (fs < 1) haloPonto(c, pn.x, pn.y, pn.r, br, w * (1 - fs), pn.gm);
        if (fs > 0) haloFused(c, pn.x, pn.y, pn.r, pn.gm, w * fs);
        coreDot(c, pn.x, pn.y, pn.r, w);          // núcleo #FBF8FF uma única vez, por cima dos halos
      }
      // fusão (9,82): anel de energia
      if (t > 9.82 && t < 9.955) {
        const u = (t - 9.82) / 0.13;
        ctx.strokeStyle = hexA(P.lilac, 0.6 * (1 - u)); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(pn.x, pn.y, 22 + 70 * P2O(u), 0, TAU); ctx.stroke();
      }

      // ---------------- rótulos: sempre RADIALMENTE PARA FORA do fio (nunca trocam de lado, opacidade constante)
      // OS MECCA: B + û·(rB + 22); SUA EMPRESA: A − û·(rA + 26), û = normalize(B − A). O ponto calculado é a borda
      // interna do rótulo: o centro anda mais o "raio" da caixa na direção û (suporte elíptico → movimento suave).
      // O fio vai de A a B, então os rótulos ficam no prolongamento dele, do lado de fora dos corpos.
      if (t >= 3.9 && t < 9.8) {
        const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
        const ux = dx / L, uy = dy / L;
        const labAt = (px, py, r, gap, vx, vy, box) => {
          const d = r + gap + Math.hypot(vx * box.w * 0.5, vy * box.h * 0.5);
          return { x: px + vx * d, y: py + vy * d };
        };
        // área segura à direita (x ≤ 1824): com B na ponta direita da órbita crescida (≈8,8–9,45) o rótulo radial
        // passaria ~20 px da margem. Em vez de espremê-lo contra B, a direção gira suavemente até 35° para CIMA nessa
        // janela (continua do lado oposto ao fio); o min() é só rede de segurança.
        const mUp = 0.62 * smooth(8.55, 8.95, t) * (1 - smooth(9.3, 9.56, t));
        const cu = Math.cos(mUp), su = Math.sin(mUp);
        const lb = labAt(B.x, B.y, B.r, 22, ux * cu + uy * su, -ux * su + uy * cu, LAB_B);
        lb.x = Math.min(lb.x, 1824 - LAB_B.w * 0.5);
        const la = labAt(A.x, A.y, rA, 26, -ux, -uy, LAB_A);
        const bx = lb.x, by = lb.y, ax = la.x, ay = la.y;
        labA.style.transform = `translate(${ax.toFixed(2)}px, ${ay.toFixed(2)}px) translate(-50%, -50%)`;
        labB.style.transform = `translate(${bx.toFixed(2)}px, ${by.toFixed(2)}px) translate(-50%, -50%)`;
        labA.style.opacity = '1'; labB.style.opacity = '1';
      } else { labA.style.opacity = '0'; labB.style.opacity = '0'; }
    });
  },
});
})();
