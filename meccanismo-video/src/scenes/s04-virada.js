(() => {
/*
 * S04 — A VIRADA · "Não somos agência. Somos o meccanismo."  (global 24–34 s, D 10, tail 0)
 *
 * O Ponto (bala) risca "agência." e "consultoria.", as palavras caem, silêncio, e no DROP (global 30,0)
 * a marca aparece: "Somos o meccanismo." + ícone que se desenha; o Ponto encaixa no ícone (logo completo,
 * núcleo #7C3AED), os arcos giram uma volta, duas órbitas contornam o ícone e o Ponto mergulha no V da pupila.
 *
 * Primeiro quadro (= último da S03): sem texto, só o Ponto em (990,690) r 14; bg dim .5, vignette .75, glowA/B .6, particles .5.
 * Último quadro (= primeiro da S05): sem texto, ícone já passou da câmera, Ponto em (1520,463) r 6 núcleo #FBF8FF;
 *   bg warp 1, speed 3, dim 0, glow 1, vignette .55.
 *
 * Tudo que é canvas (Ponto, rastro, órbitas, riders, ondas) é função analítica de lt.
 */
MECCA.scene({
  id: 's04-virada',
  build({ root, tl, h, P, bg, onFrame, cue }) {
    const SEL = '[data-scene="s04-virada"]';
    const TAU = Math.PI * 2;
    const { clamp, lerp, hexA } = h;
    const E = (n) => gsap.parseEase(n);
    const eIO = E('mecca.inOut'), eXO = E('expo.out'), eP4i = E('power4.in'), eP3i = E('power3.in');
    const eP2i = E('power2.in'), eP2o = E('power2.out'), eP2io = E('power2.inOut');
    const seg = (t, a, b) => clamp((t - a) / (b - a));
    const f3 = (v) => (+v).toFixed(3);

    // ------------------------------------------------------------------ CSS local
    h.el('style', {
      text: `
${SEL} .s4-layer { position:absolute; left:0; top:0; width:1920px; height:1080px; }
${SEL} .s4-abs { position:absolute; white-space:nowrap; }
${SEL} .s4-mask { overflow:hidden; padding:.2em .14em .34em; margin:-.2em -.14em -.34em; }
${SEL} .s4-txt { line-height:1.2; white-space:nowrap; }
${SEL} .s4-probe { display:inline-block; width:0; height:0; vertical-align:baseline; }
${SEL} .s4-ib { display:inline-block; }
${SEL} .s4-nismo { color:#F5F3FF; }
${SEL} .s4-strike { position:absolute; height:16px; border-radius:8px;
  background:linear-gradient(90deg,#C026D3,#7C3AED);
  box-shadow:0 0 18px rgba(192,38,211,.55), 0 0 42px rgba(124,58,237,.35); }
${SEL} .s4-strike-glow { position:absolute; left:0; right:0; top:-2px; bottom:-2px; border-radius:10px;
  background:linear-gradient(90deg,#E249B0,#A78BFA); box-shadow:0 0 30px rgba(226,73,176,.85); opacity:0; }
${SEL} .eyebrow { letter-spacing:.22em; }
`,
    }, root);

    // ------------------------------------------------------------------ camadas
    // 'câmera': tudo o que treme no DROP fica dentro de camL; o flash fica no root (sem shake) e cobre o quadro inteiro
    const camL = h.el('div', { cls: 's4-layer' }, root);
    const back = h.canvas(camL);                          // atrás do ícone: aura, metade de trás das órbitas
    const cb = back.ctx;
    const textL = h.el('div', { cls: 's4-layer' }, camL);
    const negWrap = h.el('div', { cls: 's4-layer' }, textL);   // negações (tensão 1→1,04)
    const postWrap = h.el('div', { cls: 's4-layer' }, textL);  // pós-drop (push lento)
    const iconSvg = h.svg('svg', { class: 'fill', width: 1920, height: 1080, viewBox: '0 0 1920 1080', fill: 'none' }, camL);
    const front = h.canvas(camL);                         // frente: órbitas (frente), ondas, Ponto
    const cf = front.ctx;

    // ------------------------------------------------------------------ helper de linha (posiciona pela baseline)
    function line(parent, html, o) {
      const wrap = h.el('div', { cls: 's4-abs' }, parent);
      wrap.style.left = o.x + 'px';
      wrap.style.top = '0px';
      wrap.style.fontSize = o.size + 'px';
      const mask = h.el('div', { cls: 's4-mask' }, wrap);
      const txt = h.el('div', { cls: (o.cls || 't-display') + ' s4-txt', html }, mask);
      if (o.weight) txt.style.fontWeight = o.weight;
      if (o.color) txt.style.color = o.color;
      if (o.ls != null) txt.style.letterSpacing = o.ls;
      const probe = h.el('span', { cls: 's4-probe' }, txt);
      const off = h.rect(probe).y - h.rect(wrap).y;
      probe.remove();
      const top = o.baseline - off;
      wrap.style.top = top.toFixed(2) + 'px';
      const sp = h.split(txt, { type: 'chars' });
      return { wrap, mask, txt, chars: sp.chars, top };
    }

    // SplitText clona elementos aninhados (deixa uma cópia vazia antes): pega a cópia que contém os chars
    const pick = (scope, sel) => [...scope.querySelectorAll(sel)].find((e) => e.querySelector('.char')) || scope.querySelector(sel);

    // ================================================================== EYEBROW
    const eb = h.eyebrow('A VIRADA — MECCANISMO', { x: 192, y: 120, anchor: 'cl', size: 22, parent: textL });
    const ebLbl = eb.querySelector('.lbl');
    const ebDash = eb.querySelector('.dash');
    const ebChars = h.split(ebLbl, { type: 'chars' }).chars;
    const ebBase = ebChars.slice(0, 7);                  // A VIRADA
    const ebAdd = ebChars.slice(7);                       // — MECCANISMO (digitado no drop)
    gsap.set(ebChars, { autoAlpha: 0 });
    gsap.set(ebDash, { scaleX: 0, transformOrigin: '0% 50%' });
    tl.to(ebDash, { scaleX: 1, duration: 0.3, ease: 'mecca.out' }, 0.0);
    ebBase.forEach((c, i) => tl.set(c, { autoAlpha: 1 }, 0.1 + i * 0.025));
    ebAdd.forEach((c, i) => tl.set(c, { autoAlpha: 1 }, 6.0 + i * 0.025));
    [...ebChars].reverse().forEach((c, i) => tl.set(c, { autoAlpha: 0 }, 9.5 + i * 0.015));
    tl.to(ebDash, { scaleX: 0, duration: 0.15, ease: 'mecca.in' }, 9.8);

    // ================================================================== NEGAÇÕES
    const smallHTML = '<span class="s4-ib s4-nao">Não</span> <span class="s4-ib s4-somos"><span class="s4-s">s</span>omos</span>';
    const L1s = line(negWrap, smallHTML, { x: 192, baseline: 232, size: 64, weight: 500, color: P.lilac });
    const L1b = line(negWrap, 'agência.', { x: 192, baseline: 470, size: 260, weight: 700, color: P.ink });
    const L2s = line(negWrap, smallHTML, { x: 192, baseline: 590, size: 64, weight: 500, color: P.lilac });
    const L2b = line(negWrap, 'consultoria.', { x: 192, baseline: 830, size: 260, weight: 700, color: P.ink });

    // medidas dos dois 'somos' ANTES de qualquer transform (para a fusão em 5,0)
    const FUS = [[L1s, 232], [L2s, 590]].map(([L, base]) => {
      const w = pick(L.txt, '.s4-somos'), s = pick(L.txt, '.s4-s');
      return { w, s, base, r: h.rect(w), ws: h.rect(s).w };
    });

    // fim visual de cada palavra (o "." final) → comprimento do risco e parada do Ponto
    const S1end = Math.round(h.rect(L1b.txt).right);
    const S2end = Math.round(h.rect(L2b.txt).right);
    const SX0 = 180;                                      // início dos riscos
    const SY1 = 379, SY2 = 739;

    function mkStrike(L, y) {
      const wr = h.rect(L.wrap);
      const st = h.el('div', { cls: 's4-strike' }, L.wrap);
      const x1 = L === L1b ? S1end : S2end;
      Object.assign(st.style, { left: (SX0 - wr.x) + 'px', top: (y - 8 - wr.y) + 'px', width: (x1 - SX0) + 'px' });
      const glow = h.el('div', { cls: 's4-strike-glow' }, st);
      gsap.set(st, { scaleX: 0, transformOrigin: '0% 50%' });
      return { st, glow };
    }
    const K1 = mkStrike(L1b, SY1);
    const K2 = mkStrike(L2b, SY2);

    // slams por máscara
    const slam = (L, at) => tl.fromTo(L.txt, { yPercent: 130 }, { yPercent: 0, duration: 0.35, ease: 'expo.out' }, at);
    slam(L1s, 0.0); slam(L1b, 0.05);
    slam(L2s, 1.45); slam(L2b, 1.5);

    // riscos (0,25 s expo.out) — a palavra vai para muted α .45
    tl.to(K1.st, { scaleX: 1, duration: 0.25, ease: 'expo.out' }, 1.0);
    tl.to(L1b.txt, { color: P.muted, opacity: 0.45, duration: 0.3, ease: 'power2.out' }, 1.0);
    tl.to(K2.st, { scaleX: 1, duration: 0.25, ease: 'expo.out' }, 2.5);
    tl.to(L2b.txt, { color: P.muted, opacity: 0.45, duration: 0.3, ease: 'power2.out' }, 2.5);

    // riscos pulsam de brilho a cada batida (tensão crescente)
    const pulse = (K, at, a) => tl.fromTo(K.glow, { opacity: a }, { opacity: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, at);
    pulse(K1, 1.0, 0.9);
    [[2.5, 0.6], [3.0, 0.7], [3.5, 0.85], [4.0, 1]].forEach(([b, a]) => { pulse(K1, b, a); pulse(K2, b, a); });

    // TENSÃO: wrapper 1→1,04 (com respiro mínimo antes, para nada ficar parado), shake nas palavras riscadas
    const NO = { x: 192, y: 530 };                        // origem do scale das negações
    gsap.set(negWrap, { transformOrigin: `${NO.x}px ${NO.y}px` });
    tl.fromTo(negWrap, { scale: 1 }, { scale: 1.008, duration: 2.15, ease: 'none' }, 0.35);
    tl.to(negWrap, { scale: 1.04, duration: 2.0, ease: 'power2.in' }, 2.5);
    tl.to(negWrap, { scale: 1, duration: 0.4, ease: 'mecca.inOut' }, 5.0);
    h.shake(tl, L1b.wrap, 2.5, { amp: 3, n: 16, dur: 2.0, seed: 41 });
    h.shake(tl, L2b.wrap, 2.5, { amp: 3, n: 16, dur: 2.0, seed: 73 });
    function sNeg(t) {                                    // mesmo valor que os tweens acima (para o Ponto)
      if (t < 0.35) return 1;
      if (t < 2.5) return 1 + 0.008 * (t - 0.35) / 2.15;
      if (t < 4.5) return 1.008 + 0.032 * eP2i(seg(t, 2.5, 4.5));
      if (t < 5.0) return 1.04;
      return 1.04 - 0.04 * eIO(seg(t, 5.0, 5.4));
    }

    // QUEDAS: reação seca no cue (kick: y −10, giro 4°, 0,06 s power2.out, todas as letras juntas) e depois a
    // gravidade (y +700, giro ±14–40°, power2.in) em cascata curta. dur conta a partir do cue (kick incluso);
    // o fade começa em 0,5×dur e termina em fadeEnd×dur → tudo some até ≈4,97 (o STOP de 5,0 cai no vazio).
    const KICK = 0.06;
    function fall(chars, at, dur, seed, stagger, fadeEnd = 0.85) {
      const r = h.rng(seed);
      chars.forEach((c, i) => {
        const sgn = r() < 0.5 ? -1 : 1;
        const rot = sgn * (14 + r() * 26);
        const dx = (r() * 2 - 1) * 36;
        const t0 = at + i * stagger;
        gsap.set(c, { transformOrigin: '50% 60%' });
        tl.to(c, { y: -10, rotation: sgn * 4, duration: KICK, ease: 'power2.out' }, at);
        tl.fromTo(c, { y: -10, x: 0 }, { y: 700, x: dx, duration: dur - KICK, ease: 'power2.in', immediateRender: false }, t0 + KICK);
        // giro aparece antes da queda acelerar
        tl.fromTo(c, { rotation: sgn * 4 }, { rotation: rot, duration: dur - KICK, ease: 'sine.in', immediateRender: false }, t0 + KICK);
        tl.to(c, { opacity: 0, duration: dur * (fadeEnd - 0.5), ease: 'none' }, t0 + dur * 0.5);
      });
    }
    tl.set([L1b.mask, L2b.mask], { overflow: 'visible' }, 4.5);
    fall(L1b.chars, 4.5, 0.42, 11, 0.008);                // agência.     → some em ≈4,93
    fall(L2b.chars, 4.5, 0.42, 29, 0.008);                // consultoria. → some em ≈4,95
    const strikeFall = (K, delay, kickRot, rot) => {       // o risco reage junto (giro pequeno: a barra tem 1000–1400 px)
      tl.to(K.st, { y: -10, rotation: kickRot, duration: KICK, ease: 'power2.out' }, 4.5);
      tl.fromTo(K.st, { y: -10, rotation: kickRot }, { y: 700, rotation: rot, duration: 0.42 - KICK, ease: 'power2.in', immediateRender: false }, 4.5 + KICK + delay);
      tl.to(K.st, { opacity: 0, duration: 0.42 * 0.35, ease: 'none' }, 4.5 + delay + 0.42 * 0.5);
    };
    strikeFall(K1, 0.015, -0.5, -3.5);
    strikeFall(K2, 0.03, 0.4, 2.5);
    tl.set([L1s.mask, L2s.mask], { overflow: 'visible' }, 4.75);
    fall([...L1s.txt.querySelectorAll('.s4-nao .char')], 4.75, 0.25, 53, 0.006);   // some em ≈4,97
    fall([...L2s.txt.querySelectorAll('.s4-nao .char')], 4.75, 0.25, 67, 0.006);

    // ================================================================== PÓS-DROP
    const SO = line(postWrap,
      '<span class="s4-ib s4-Somos"><span class="s4-S">S</span><span class="s4-omos">omos</span></span> <span class="s4-ib s4-o">o</span>',
      { x: 192, baseline: 400, size: 88, weight: 500, color: P.lilac });
    const ME = line(postWrap, '<em>mecca</em><span class="s4-nismo">nismo.</span>', { x: 192, baseline: 620, size: 180, weight: 700, color: P.ink2 });
    const EN_LS = 0.18, EN_SIZE = 32;
    const EN = line(postWrap, 'ENGENHARIA DE CRESCIMENTO', { x: 192, baseline: 740, size: EN_SIZE, cls: 't-mono', weight: 500, color: P.lavender, ls: EN_LS + 'em' });

    // --- fusão dos dois 'somos' → 'Somos' (5,0–5,4). A troca 's'→'S' acontece DENTRO da palavra que viaja, no
    // trecho rápido da convergência (5,1–5,2, crossfade 0,1 s): um 'S' embutido sobre o 's' aparece enquanto o 's'
    // some, e o 'omos' anda w('S') − w('s') no mesmo intervalo (sem vão 'S omos'). Em 5,4 a palavra que viajou
    // ('S'+'omos', 64 px × 88/64) coincide ao pixel com o 'Somos' novo (88 px) → troca seca.
    const newS = pick(SO.txt, '.s4-S'), newOmos = pick(SO.txt, '.s4-omos'), newO = pick(SO.txt, '.s4-o');
    const omosX = h.rect(newOmos).x;
    const newSx = h.rect(newS).x;
    const K88 = 88 / 64;
    const SW0 = 5.1, SWD = 0.1;                            // janela da troca s→S
    FUS.forEach(({ w, s, base, r }, i) => {
      const sC = s.querySelector('.char') || s;
      // offsets locais medidos agora (o slam já deixou a linha em yPercent 130; r é de antes → só diferenças)
      const rw = h.rect(w), scR = h.rect(sC);
      const offX = scR.x - rw.x, offY = scR.y - rw.y;
      w.style.position = 'relative';
      const S = h.el('div', { text: 'S', style: { position: 'absolute', left: offX.toFixed(2) + 'px', top: offY.toFixed(2) + 'px' } }, w);
      const omosC = [...w.querySelectorAll('.char')].filter((c) => !s.contains(c));
      const omosOff = h.rect(omosC[0]).x - rw.x;
      const sBase = (base - r.y) - offY;                  // baseline dentro da caixa do 's'/'S'
      const tx = newSx;                                   // borda esquerda final da palavra = borda do 'S' novo
      const dS = (omosX - tx) / K88 - omosOff;            // deslocamento local do 'omos' (≈ w('S') − w('s') a 64 px)
      const org = `0px ${(base - r.y).toFixed(2)}px`;
      gsap.set(w, { transformOrigin: org });
      gsap.set(S, { opacity: 0, scale: 0.8, transformOrigin: `0px ${sBase.toFixed(2)}px` });
      gsap.set(sC, { transformOrigin: `0px ${sBase.toFixed(2)}px` });
      tl.to(w, { x: tx - r.x, y: 400 - base, scale: K88, duration: 0.4, ease: 'mecca.inOut' }, 5.0);
      // crossfade curto com leve morph de escala (o 's' cresce enquanto some, o 'S' termina de crescer)
      tl.to(sC, { opacity: 0, scale: 1.2, duration: SWD, ease: 'sine.inOut' }, SW0);
      tl.to(S, { opacity: 1, scale: 1, duration: SWD, ease: 'sine.inOut' }, SW0);
      tl.to(omosC, { x: dS, duration: SWD, ease: 'sine.inOut' }, SW0);
      // a cópia de baixo (L2) se dissolve na de cima enquanto se aproxima e some antes de encostar
      // (sem 'somos/somos' dobrado); a de cima segue inteira até casar com o 'Somos' novo em 5,4 (troca seca)
      if (i === 1) tl.to(w, { opacity: 0, duration: 0.2, ease: 'power1.in' }, 5.02);
      else tl.set(w, { opacity: 0 }, 5.4);
    });
    gsap.set([newS, newOmos, newO], { opacity: 0 });
    tl.set([newS, newOmos], { opacity: 1 }, 5.4);
    tl.fromTo(newO, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out', immediateRender: false }, 5.5);

    // push lento do bloco pós-drop, ancorado na margem esquerda (x 192): a coluna de texto não sai da margem.
    // O eyebrow fica fora deste wrapper (textL), sem push. O '.' vai de 1265 a ≈1281 (ícone começa em 1320).
    gsap.set(postWrap, { transformOrigin: '192px 540px' });
    tl.fromTo(postWrap, { scale: 1 }, { scale: 1.015, duration: 4.0, ease: 'none' }, 5.5);

    // --- DROP: 'meccanismo.' scale 1,35→1 + blur 16→0 (0,3 s expo.out, origem à esquerda)
    gsap.set(ME.wrap, { transformOrigin: '0% 55%', autoAlpha: 0 });
    tl.set(ME.wrap, { autoAlpha: 1 }, 6.0);            // o quadro do hit já traz a palavra (grande e borrada)
    tl.fromTo(ME.wrap, { scale: 1.35, filter: 'blur(16px)' }, { scale: 1, filter: 'blur(0px)', duration: 0.3, ease: 'expo.out', immediateRender: false }, 6.0);
    tl.set(ME.wrap, { filter: 'none' }, 6.32);

    // shimmer do gradiente de 'mecca' (8,0–9,4): glint estreito (≤ 1 caractere) em lilás #C4B5FD, pico α .35,
    // correndo sobre o degradê da marca sem desfazer a divisão 'mecca' (gradiente) / 'nismo.' (ink)
    const emEl = pick(ME.txt, 'em');
    const emR = h.rect(emEl);
    const emChars = [...emEl.querySelectorAll('.char')].map((c) => ({ c, ox: h.rect(c).x - emR.x, w: h.rect(c).w }));
    const BAND = Math.round(Math.min(...emChars.map((o) => o.w)));   // largura do caractere mais estreito ('c')
    // O glint (inclinado 100deg) mora num tile de 2×BAND: a pegada horizontal visível, em qualquer altura, é BAND e
    // fica no miolo do tile, então as duas bordas do tile (e seus cantos) têm α 0 exato — sem 'placa' de bordas duras.
    // Perfil em sino de cosseno (inclinação 0 nas pontas e no pico): lê como realce suave, sem aresta nem crista.
    const GANG = 100, ga = (GANG * Math.PI) / 180;
    const GTW = 2 * BAND;
    const chH = Math.max(...emChars.map(({ c }) => h.rect(c).h));
    const gLen = GTW * Math.abs(Math.sin(ga)) + chH * Math.abs(Math.cos(ga));   // linha do gradiente CSS no tile
    const gHalf = ((BAND / 2) * Math.abs(Math.sin(ga))) / gLen;               // meia banda, em fração da linha
    const gStops = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].map((k) =>
      `rgba(196,181,253,${(0.35 * (1 + Math.cos(Math.PI * k)) / 2).toFixed(3)}) ${(100 * (0.5 + k * gHalf)).toFixed(2)}%`).join(', ');
    // deslocamento horizontal da faixa entre o meio e o topo/base da caixa do caractere (inclinação de 10°)
    const GSL = Math.ceil((chH / 2) * Math.abs(Math.cos(ga) / Math.sin(ga)));
    emChars.forEach(({ c }) => {
      c.style.backgroundImage = `linear-gradient(${GANG}deg, ${gStops}), linear-gradient(90deg, #C026D3, #7C3AED)`;
      c.style.backgroundSize = `${GTW}px 100%, ${emR.w.toFixed(1)}px 100%`;
      c.style.backgroundRepeat = 'no-repeat';
    });
    // shim.x = centro do glint (coordenadas de 'mecca', na meia altura); começa e termina com a faixa inteira fora
    // das letras, inclusive a ponta inclinada (± GSL)
    const SH0 = -BAND / 2 - GSL, SH1 = emR.w + BAND / 2 + GSL;
    const shim = { x: SH0 };
    tl.fromTo(shim, { x: SH0 }, { x: SH1, duration: 1.4, ease: 'sine.inOut' }, 8.0);

    // --- ENGENHARIA DE CRESCIMENTO (a definição de categoria): a linha inteira entra em 6,5 (fade + y 12→0,
    // 0,3 s, sem digitação) + hairline 7,5–8,0; saída em 9,5 (apaga da direita para a esquerda com a hairline)
    const enR = h.rect(EN.txt);
    gsap.set(EN.wrap, { autoAlpha: 0 });
    tl.fromTo(EN.wrap, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'mecca.out', immediateRender: false }, 6.5);
    [...EN.chars].reverse().forEach((c, i) => tl.set(c, { autoAlpha: 0 }, 9.5 + i * 0.012));
    const hlSvg = h.svg('svg', { class: 'fill', width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, postWrap);
    const hl = h.svg('line', {
      x1: 192, y1: 760.5, x2: (enR.right - EN_LS * EN_SIZE).toFixed(1), y2: 760.5,
      stroke: P.lavender, 'stroke-opacity': 0.5, 'stroke-width': 1,
    }, hlSvg);
    tl.fromTo(hl, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.5, ease: 'mecca.out' }, 7.5);
    // recolhe rumo à origem (x 192), no mesmo ritmo do apagamento dos chars (direita → esquerda)
    tl.to(hl, { drawSVG: '0% 0%', duration: EN.chars.length * 0.012 + 0.012, ease: 'none' }, 9.5);

    // --- saída de 'Somos o' + 'meccanismo.' (9,5–9,85): chars yPercent −120, stagger .012, mecca.in.
    // Ordem da direita para a esquerda (como o eyebrow e ENGENHARIA…): o texto recua à frente do ícone que cresce
    // no mergulho, em vez de ser atravessado por ele.
    const outChars = [...SO.chars, ...ME.chars].map((c) => ({ c, x: h.rect(c).cx })).sort((a, b) => b.x - a.x).map((o) => o.c);
    tl.to(outChars, { yPercent: -120, duration: 0.16, stagger: 0.012, ease: 'mecca.in' }, 9.5);

    // ================================================================== ÍCONE (400 px, centrado em 1520,540)
    const IC = { x: 1520, y: 540 };
    const ISC = 400 / 228;
    const SOCK = { x: 1320 + 208 * ISC, y: 340 + 160 * ISC };   // (1685,621)
    const VPT = { x: 1320 + 114 * ISC, y: 340 + 70 * ISC };     // (1520,463)
    const zoomG = h.svg('g', {}, iconSvg);
    const iconPos = h.svg('g', { transform: `translate(1320 340) scale(${ISC.toFixed(6)})` }, zoomG);
    const iconPulse = h.svg('g', {}, iconPos);
    const icon = h.icon({ size: 400 });
    while (icon.svg.firstChild) iconPulse.appendChild(icon.svg.firstChild);
    const arcsG = h.svg('g', {}, icon.g);
    icon.g.insertBefore(arcsG, icon.g.firstChild);
    arcsG.appendChild(icon.arcOuter);
    arcsG.appendChild(icon.arcInner);
    icon.dot.style.display = 'none';                     // o Ponto ocupa o encaixe

    // mergulho: a pupila troca o violeta chapado por um gradiente radial centrado no V (114,70 no viewBox):
    // #7C3AED na borda interna (paredes do V) → #4C1D95 na externa. Enquanto a escala é 1 os stops são iguais
    // (e o fill volta a ser a cor chapada), então nada muda antes do zoom.
    // O arco externo (a outra forma grande que passa pela câmera) ganha o mesmo sombreamento, mais suave.
    const pgDefs = h.svg('defs', {}, iconSvg);
    function radialShade(r, hold) {
      const id = h.uid('s4sh');
      const g = h.svg('radialGradient', { id, gradientUnits: 'userSpaceOnUse', cx: 114, cy: 70, r }, pgDefs);
      h.svg('stop', { offset: 0, 'stop-color': P.violet }, g);
      h.svg('stop', { offset: hold, 'stop-color': P.violet }, g);
      return { id, out: h.svg('stop', { offset: 1, 'stop-color': P.violet }, g) };
    }
    const shPupil = radialShade(84, 0.12);
    const shArc = radialShade(170, 0.3);

    gsap.set([icon.arcOuter, icon.arcInner], { visibility: 'hidden' });
    // visibilidade 1/60 s depois do início do drawSVG: um traço de comprimento 0 com linecap redondo apareceria
    // como um ponto violeta solto no quadro do DROP
    tl.set(icon.arcOuter, { visibility: 'visible' }, 6.02);
    tl.fromTo(icon.arcOuter, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'mecca.out' }, 6.0);
    tl.set(icon.arcInner, { visibility: 'visible' }, 6.12);
    tl.fromTo(icon.arcInner, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.7, ease: 'mecca.out' }, 6.1);
    gsap.set(icon.pupil, { svgOrigin: '114 114', scale: 0 });
    tl.to(icon.pupil, { scale: 1, duration: 0.6, ease: 'mecca.back' }, 6.2);
    // pulso no encaixe (7,0)
    gsap.set(iconPulse, { svgOrigin: '114 114' });
    tl.to(iconPulse, { scale: 1.04, duration: 0.12, ease: 'power2.out' }, 7.0);
    tl.to(iconPulse, { scale: 1, duration: 0.33, ease: 'power2.inOut' }, 7.12);
    const kPulse = (t) => (t < 7.0 ? 1 : t < 7.12 ? 1 + 0.04 * eP2o(seg(t, 7.0, 7.12)) : t < 7.45 ? 1.04 - 0.04 * eP2io(seg(t, 7.12, 7.45)) : 1);
    // arcos + Ponto giram +360° (8,0–9,5); pupila fixa
    gsap.set(arcsG, { svgOrigin: '114 114' });
    tl.to(arcsG, { rotation: 360, duration: 1.5, ease: 'mecca.inOut' }, 8.0);
    const rotAt = (t) => TAU * eIO(seg(t, 8.0, 9.5));

    // câmera do mergulho em torno do V (9,5–10,0): curva exponencial (família expo.in, um pouco mais íngreme)
    // 1→250 — ≈3× em 9,75, ≈37× em 9,9, ≈69× em 9,933 e ≈130× em 9,967. As paredes violeta da pupila saem do
    // quadro sozinhas (sem dissolve) e o ícone cresce pouco em 9,5–9,7, enquanto o texto ainda está saindo.
    // Órbitas, riders e aura (canvas, cujo lineWidth escala junto) esmaecem antes, em 9,5–9,75.
    const ZS = 250, ZK = 14, Z0 = Math.pow(2, -ZK);
    const zoomAt = (p) => 1 + (ZS - 1) * (Math.pow(2, ZK * (p - 1)) - Z0) / (1 - Z0);
    const cam = { p: 0, deco: 1 };
    tl.to(cam, { p: 1, duration: 0.5, ease: 'none' }, 9.5);
    tl.to(cam, { deco: 0, duration: 0.25, ease: 'power1.out' }, 9.5);

    // aura atrás do ícone, anéis e ondas (estado tweenável, desenhado no canvas)
    const aura = { a: 0 };
    tl.to(aura, { a: 0.34, duration: 0.15, ease: 'power2.out' }, 6.0);
    tl.to(aura, { a: 0.16, duration: 0.85, ease: 'power2.inOut' }, 6.15);
    tl.to(aura, { a: 0.3, duration: 0.08, ease: 'power2.out' }, 7.0);
    tl.to(aura, { a: 0.16, duration: 0.5, ease: 'power2.inOut' }, 7.08);
    const wave = { r: 0, a: 0 };
    tl.fromTo(wave, { r: 0, a: 0.8 }, { r: 1300, a: 0, duration: 0.9, ease: 'power2.out', immediateRender: false }, 6.0);
    const ring = { r: 17, a: 0 };
    tl.fromTo(ring, { r: 17, a: 0.8 }, { r: 80, a: 0, duration: 0.4, ease: 'power2.out', immediateRender: false }, 7.0);
    const orb = { pA: 0, pB: 0, rid: 0 };
    tl.to(orb, { pA: 1, duration: 0.8, ease: 'power2.inOut' }, 8.0);
    tl.to(orb, { pB: 1, duration: 0.75, ease: 'power2.inOut' }, 8.05);
    tl.to(orb, { rid: 1, duration: 0.45, ease: 'power2.out' }, 8.35);

    // ================================================================== DROP: flash, shake, fundo
    h.flash(tl, root, 6.0, { color: '#C4B5FD', peak: 0.35, dur: 0.35 });
    h.shake(tl, camL, 6.0, { amp: 12, n: 6, dur: 0.45, seed: 30 });

    // ================================================================== FUNDO
    const BG_IN = { glowA: 0.6, glowB: 0.6, glowC: 1, grid: 0, particles: 0.5, driftX: 0, driftY: 0, speed: 1, warp: 0, vignette: 0.75, dim: 0.5, hue: 0, grain: 1 };
    tl.set(bg, BG_IN, 0);
    tl.to(bg, { warp: 0.35, duration: 1.5, ease: 'sine.in' }, 3.0);
    tl.to(bg, { warp: 0, duration: 0.2, ease: 'power2.out' }, 5.0);
    tl.to(bg, { dim: 0, duration: 0.2, ease: 'power2.out' }, 6.0);
    tl.to(bg, { vignette: 0.55, duration: 0.4, ease: 'power2.out' }, 6.0);
    tl.to(bg, { particles: 1, duration: 0.6, ease: 'power2.out' }, 6.0);
    tl.to(bg, { glowA: 1.8, glowB: 1.8, glowC: 1.35, duration: 0.1, ease: 'power2.out' }, 6.0);
    tl.to(bg, { glowA: 1.2, glowB: 1.2, glowC: 1, duration: 1.4, ease: 'power2.out' }, 6.1);
    tl.to(bg, { glowA: 1.0, glowB: 1.0, duration: 1.5, ease: 'sine.inOut' }, 7.5);
    tl.to(bg, { warp: 1, speed: 3, duration: 0.45, ease: 'power2.in' }, 9.5);

    // ================================================================== PONTO (função pura de lt)
    const P0 = { x: 990, y: 690 };
    const CEN = { x: 960, y: 560 };
    const qb = (a, c, b, k) => { const u = 1 - k; return { x: u * u * a.x + 2 * u * k * c.x + k * k * b.x, y: u * u * a.y + 2 * u * k * c.y + k * k * b.y }; };
    const neg = (p, t) => { const s = sNeg(t); return { x: NO.x + s * (p.x - NO.x), y: NO.y + s * (p.y - NO.y) }; };
    const A1 = { x: SX0, y: SY1 }, B1 = { x: S1end, y: SY1 };
    const A2 = { x: SX0, y: SY2 }, B2 = { x: S2end, y: SY2 };
    const C0 = { x: 560, y: 700 };                       // entrada: varre para a esquerda e sobe até o risco 1
    // 1,9–2,4: desce pela direita do '.' de 'agência.' e corre pelo corredor livre entre 'Não somos' (ink até y 590)
    // e as ascendentes de 'consultoria.' (l/t a partir de y 645; c/o/n só a partir de y 700, por isso desce à esquerda)
    // e entra por fora da coluna até (180,739)
    const arcPath = MotionPathPlugin.arrayToRawPath(
      [B1, { x: 1282, y: 486 }, { x: 1150, y: 613 }, { x: 760, y: 620 }, { x: 380, y: 638 }, { x: 165, y: 670 }, A2], { curviness: 1 });
    MotionPathPlugin.cacheRawPathMeasurements(arcPath);
    const B2end = neg(B2, 4.5);                          // posição da ponta do risco 2 no fim da tensão
    const flyPath = MotionPathPlugin.arrayToRawPath(
      [CEN, { x: 1170, y: 330 }, { x: 1480, y: 246 }, { x: 1752, y: 372 }, SOCK], { curviness: 1.2 });
    MotionPathPlugin.cacheRawPathMeasurements(flyPath);

    function sockAt(t) {                                  // encaixe acompanhando pulso + giro do ícone
      const k = kPulse(t), a = rotAt(t);
      const dx = SOCK.x - IC.x, dy = SOCK.y - IC.y, ca = Math.cos(a), sa = Math.sin(a);
      return { x: IC.x + k * (dx * ca - dy * sa), y: IC.y + k * (dx * sa + dy * ca) };
    }
    function pos(t) {
      if (t < 0.25) return P0;
      if (t < 0.75) return qb(P0, C0, neg(A1, t), eIO(seg(t, 0.25, 0.75)));
      if (t < 1.0) return neg(A1, t);
      if (t < 1.25) return neg({ x: SX0 + (S1end - SX0) * eXO(seg(t, 1.0, 1.25)), y: SY1 }, t);
      if (t < 1.9) return neg(B1, t);
      if (t < 2.4) { const q = MotionPathPlugin.getPositionOnPath(arcPath, eIO(seg(t, 1.9, 2.4))); return neg({ x: q.x, y: q.y }, t); }
      if (t < 2.5) return neg(A2, t);
      if (t < 2.75) return neg({ x: SX0 + (S2end - SX0) * eXO(seg(t, 2.5, 2.75)), y: SY2 }, t);
      if (t < 4.5) return neg(B2, t);
      if (t < 5.0) return B2end;
      if (t < 6.0) { const k = eP4i(seg(t, 5.0, 6.0)); return { x: lerp(B2end.x, CEN.x, k), y: lerp(B2end.y, CEN.y, k) }; }
      if (t < 6.5) return CEN;
      if (t < 7.0) { const p = MotionPathPlugin.getPositionOnPath(flyPath, eP2i(seg(t, 6.5, 7.0))); return { x: p.x, y: p.y }; }
      if (t < 9.5) return sockAt(t);
      if (t < 9.75) { const k = eP3i(seg(t, 9.5, 9.75)); return { x: lerp(SOCK.x, VPT.x, k), y: lerp(SOCK.y, VPT.y, k) }; }
      return VPT;
    }
    function radius(t) {
      if (t < 5.0) return 14;
      if (t < 6.0) return lerp(14, 6, eP4i(seg(t, 5.0, 6.0)));
      if (t < 6.5) return 6;
      if (t < 7.0) return lerp(6, 17.5, eP2i(seg(t, 6.5, 7.0)));
      if (t < 9.5) return 17.5 * kPulse(t);
      if (t < 9.75) return lerp(17.5, 6, eP3i(seg(t, 9.5, 9.75)));
      return 6;
    }
    // 0 = núcleo #FBF8FF, 1 = núcleo #7C3AED (encaixado)
    const coreMix = (t) => (t < 7.0 ? 0 : t < 9.5 ? eP2o(seg(t, 7.0, 7.12)) : 1 - seg(t, 9.5, 9.75));
    function glowAt(t) {
      let g = 1;
      if (t >= 5.0 && t < 6.0) g = lerp(1, 2.5, eP4i(seg(t, 5.0, 6.0)));
      // pós-drop o Ponto fica sobre o branco de 'nismo': mantém o glow reforçado até decolar (6,5) e decai no voo
      else if (t >= 6.0 && t < 6.5) g = lerp(2.5, 2.0, eP2o(seg(t, 6.0, 6.5)));
      else if (t >= 6.5 && t < 6.85) g = lerp(2.0, 1, eP2o(seg(t, 6.5, 6.85)));
      else if (t >= 7.0 && t < 9.5) g = lerp(1, 0.55, seg(t, 7.0, 7.4));
      else if (t >= 9.5 && t < 9.75) g = lerp(0.55, 1, seg(t, 9.5, 9.75));
      // pulsos de brilho nas batidas (riscos, tensão) e no encaixe
      for (const [b, a] of [[1.0, 0.9], [2.5, 0.7], [3.0, 0.5], [3.5, 0.65], [4.0, 0.8], [7.0, 1.4]]) {
        if (t >= b && t < b + 0.6) g += a * Math.exp(-(t - b) * 8) * (1 - seg(t, b + 0.45, b + 0.6));
      }
      return g;
    }
    // posição exibida: acompanha shake/scale das palavras riscadas enquanto está preso ao risco 2
    function livePos(t) {
      const p = pos(t);
      if (t >= 2.5 && t < 4.5) {
        const s = sNeg(t);
        return { x: p.x + s * gsap.getProperty(L2b.wrap, 'x'), y: p.y + s * gsap.getProperty(L2b.wrap, 'y') };
      }
      return p;
    }
    function mixHex(a, b, k) {
      const A0 = parseInt(a.slice(1), 16), B0 = parseInt(b.slice(1), 16);
      const ch = (sh) => Math.round(lerp((A0 >> sh) & 255, (B0 >> sh) & 255, k));
      return '#' + [16, 8, 0].map((sh) => ch(sh).toString(16).padStart(2, '0')).join('');
    }
    // rastro (> 600 px/s): fita afunilada ao longo das últimas 8 posições, #C026D3 (cabeça) → #7C3AED (cauda)
    function drawTrail(c, t, head, rr) {
      const dt = 1 / 120;
      const q = pos(Math.max(0, t - dt)), p = pos(t);
      const speed = Math.hypot(p.x - q.x, p.y - q.y) / dt;
      const amt = h.smooth(600, 1000, speed);
      if (amt <= 0) return;
      const N = 24, WIN = 8 / 60;
      const pts = [head];
      for (let i = 1; i <= N; i++) pts.push(pos(Math.max(0, t - (i / N) * WIN)));
      const tail = pts[N];
      if (Math.hypot(head.x - tail.x, head.y - tail.y) < 3) return;
      const L = [], R = [];
      let nx = 0, ny = -1;
      for (let i = 0; i <= N; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
        const dx = b.x - a.x, dy = b.y - a.y, dl = Math.hypot(dx, dy);
        if (dl > 0.01) { nx = -dy / dl; ny = dx / dl; }
        const w = rr * 0.92 * Math.pow(1 - i / N, 0.9);
        L.push([pts[i].x + nx * w, pts[i].y + ny * w]);
        R.push([pts[i].x - nx * w, pts[i].y - ny * w]);
      }
      const g = c.createLinearGradient(head.x, head.y, tail.x, tail.y);
      g.addColorStop(0, hexA('#C026D3', 0.72 * amt));
      g.addColorStop(0.35, hexA('#9D30E0', 0.34 * amt));
      g.addColorStop(1, hexA('#7C3AED', 0));
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(L[0][0], L[0][1]);
      for (let i = 1; i <= N; i++) c.lineTo(L[i][0], L[i][1]);
      for (let i = N; i >= 0; i--) c.lineTo(R[i][0], R[i][1]);
      c.closePath();
      c.fill();
    }
    function drawPonto(c, t) {
      const p = livePos(t);
      const r = radius(t);
      drawTrail(c, t, p, r);
      h.glowDot(c, p.x, p.y, r, P.lavender, clamp(0.6 * glowAt(t), 0, 1));
      const g = glowAt(t);
      if (g > 1.05) {                                     // carga: halo extra largo (glow ×2,5)
        const R = r * 5 * g;
        const gr = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
        gr.addColorStop(0, hexA(P.lavender, clamp(0.22 * (g - 1), 0, 0.5)));
        gr.addColorStop(1, hexA(P.lavender, 0));
        c.fillStyle = gr; c.beginPath(); c.arc(p.x, p.y, R, 0, TAU); c.fill();
      }
      // separação do núcleo sobre as letras brancas (ponto de carga 960,560 cai dentro de 'nismo' após o drop)
      const sep = t < 6.0 ? 0 : t < 6.55 ? 1 : 1 - seg(t, 6.55, 6.75);
      if (sep > 0.001) {
        const gs = c.createRadialGradient(p.x, p.y, r, p.x, p.y, r + 7);
        gs.addColorStop(0, hexA(P.bg, 0.8 * sep));
        gs.addColorStop(1, hexA(P.bg, 0));
        c.fillStyle = gs; c.beginPath(); c.arc(p.x, p.y, r + 7, 0, TAU); c.fill();
        c.strokeStyle = hexA(P.lavender, 0.9 * sep); c.lineWidth = 1.5;
        c.beginPath(); c.arc(p.x, p.y, r + 2.5, 0, TAU); c.stroke();
      }
      c.fillStyle = mixHex(P.ink, P.violet, coreMix(t));
      c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.fill();
      return p;
    }

    // ================================================================== ÓRBITAS
    const ROT = -14 * Math.PI / 180;
    const ORBITS = [
      { rx: 320, ry: 96, key: 'pA', a0: Math.PI * 0.62, color: P.magenta, per: 2, ph: Math.PI * 0.62 },
      { rx: 280, ry: 84, key: 'pB', a0: Math.PI * 1.55, color: P.lavender, per: 4, ph: Math.PI * 1.55 },
    ];
    // as extremidades esquerdas das órbitas (x≈1210–1250) cairiam sobre o 'o.' de 'meccanismo.':
    // o trecho com x < XF1 esmaece até sumir em XF0 (lê como profundidade, sem cruzar o texto)
    const XF0 = 1290, XF1 = 1372;
    const xFade = (x) => h.smooth(XF0, XF1, x);
    const xGrad = (c, color, a) => {
      const g = c.createLinearGradient(XF0, 0, XF1, 0);
      g.addColorStop(0, hexA(color, 0)); g.addColorStop(1, hexA(color, a));
      return g;
    };
    function strokeOrbit(o, prog, fade) {
      if (prog <= 0.001 || fade <= 0.001) return;
      const span = prog * TAU;
      const steps = Math.max(2, Math.ceil(160 * prog));
      const paths = { b: new Path2D(), f: new Path2D() };
      let last = null;
      for (let i = 0; i < steps; i++) {
        const a = o.a0 + span * i / steps, b2 = o.a0 + span * (i + 1) / steps;
        const lay = Math.sin((a + b2) / 2) < 0 ? 'b' : 'f';
        const p1 = h.ellipsePt(IC.x, IC.y, o.rx, o.ry, ROT, a), p2 = h.ellipsePt(IC.x, IC.y, o.rx, o.ry, ROT, b2);
        if (last !== lay) paths[lay].moveTo(p1.x, p1.y);
        paths[lay].lineTo(p2.x, p2.y);
        last = lay;
      }
      // lineCap explícito: drawRider deixa 'round' no contexto, e herdar isso do quadro anterior tornava as pontas
      // das órbitas dependentes da ordem dos seeks. 'butt': os trechos de trás/frente se encontram sem sobrepor
      // (sem pontinho mais claro nas emendas)
      cb.lineCap = cf.lineCap = 'butt';
      cb.strokeStyle = xGrad(cb, P.lavender, 0.11 * fade); cb.lineWidth = 1.5; cb.stroke(paths.b);
      cf.strokeStyle = xGrad(cf, P.lavender, 0.22 * fade); cf.lineWidth = 1.5; cf.stroke(paths.f);
    }
    function drawRider(o, lt, amt) {
      if (amt <= 0.001) return;
      const ang = o.ph + TAU * (lt - 8.0) / o.per;
      const p = h.ellipsePt(IC.x, IC.y, o.rx, o.ry, ROT, ang);
      const behind = Math.sin(ang) < 0;
      const c = behind ? cb : cf;
      const k = (behind ? 0.5 : 1) * amt * xFade(p.x);
      // cauda curta ao longo da órbita
      const TL = 0.55, NS = 10;
      for (let i = NS; i >= 1; i--) {
        const a1 = ang - TL * i / NS, a2 = ang - TL * (i - 1) / NS;
        const q1 = h.ellipsePt(IC.x, IC.y, o.rx, o.ry, ROT, a1), q2 = h.ellipsePt(IC.x, IC.y, o.rx, o.ry, ROT, a2);
        const bb = Math.sin(a2) < 0;
        const cc = bb ? cb : cf;
        const ka = 0.5 * (1 - i / NS) * (bb ? 0.5 : 1) * amt * xFade(Math.min(q1.x, q2.x));
        if (ka <= 0.002) continue;
        cc.strokeStyle = hexA(o.color, ka);
        cc.lineWidth = 3 * (1 - i / NS) + 0.5;
        cc.lineCap = 'round';
        cc.beginPath(); cc.moveTo(q1.x, q1.y); cc.lineTo(q2.x, q2.y); cc.stroke();
      }
      if (k > 0.002) h.glowDot(c, p.x, p.y, 5, o.color, k);
    }

    // ================================================================== onFrame
    onFrame((lt) => {
      // um seek direto para t = 0 exato não renderiza o set de posição 0 (GSAP): garante o estado do corte
      if (lt < 1e-4) Object.assign(bg, BG_IN);
      const s = zoomAt(cam.p), deco = cam.deco;
      zoomG.setAttribute('transform', `translate(${VPT.x.toFixed(2)} ${VPT.y.toFixed(2)}) scale(${f3(s)}) translate(${(-VPT.x).toFixed(2)} ${(-VPT.y).toFixed(2)})`);
      // sombreamento da pupila (escala 1→3) e desfoque proporcional à escala: 0 px em 8× → 12 px em 40×
      const kSh = h.smooth(1, 3, s);
      icon.pupil.setAttribute('fill', kSh > 0.001 ? `url(#${shPupil.id})` : P.violet);
      icon.arcOuter.setAttribute('stroke', kSh > 0.001 ? `url(#${shArc.id})` : P.violet);
      shPupil.out.setAttribute('stop-color', mixHex(P.violet, P.violetDarker, kSh));
      shArc.out.setAttribute('stop-color', mixHex(P.violet, P.violetDarker, kSh));
      const zb = 12 * clamp((s - 8) / 32);
      iconSvg.style.filter = zb > 0.01 ? `blur(${zb.toFixed(2)}px)` : 'none';

      cb.setTransform(1, 0, 0, 1, 0, 0); cb.clearRect(0, 0, 1920, 1080);
      cf.setTransform(1, 0, 0, 1, 0, 0); cf.clearRect(0, 0, 1920, 1080);

      // --- mundo do ícone (com câmera)
      if (deco > 0.001) {
        const tx = VPT.x * (1 - s), ty = VPT.y * (1 - s);
        cb.setTransform(s, 0, 0, s, tx, ty);
        cf.setTransform(s, 0, 0, s, tx, ty);
        if (aura.a > 0.001) {
          const g = cb.createRadialGradient(IC.x, IC.y, 0, IC.x, IC.y, 330);
          g.addColorStop(0, hexA(P.violet, aura.a * deco));
          g.addColorStop(0.55, hexA(P.violet, aura.a * 0.35 * deco));
          g.addColorStop(1, hexA(P.violet, 0));
          cb.fillStyle = g; cb.beginPath(); cb.arc(IC.x, IC.y, 330, 0, TAU); cb.fill();
        }
        for (const o of ORBITS) {
          strokeOrbit(o, orb[o.key], deco);
          drawRider(o, lt, orb.rid * deco);
        }
        cb.setTransform(1, 0, 0, 1, 0, 0);
        cf.setTransform(1, 0, 0, 1, 0, 0);
      }

      // --- onda de choque do DROP (a partir de 960,560)
      if (wave.a > 0.002) {
        cf.strokeStyle = hexA(P.lavender, wave.a); cf.lineWidth = 3;
        cf.beginPath(); cf.arc(CEN.x, CEN.y, wave.r, 0, TAU); cf.stroke();
        const r2 = wave.r * 0.82;
        cf.strokeStyle = hexA(P.magenta, wave.a * 0.45); cf.lineWidth = 1.5;
        cf.beginPath(); cf.arc(CEN.x, CEN.y, r2, 0, TAU); cf.stroke();
        const bl = cf.createRadialGradient(CEN.x, CEN.y, 0, CEN.x, CEN.y, Math.max(1, wave.r * 0.6));
        bl.addColorStop(0, hexA(P.lilac, wave.a * 0.28));
        bl.addColorStop(1, hexA(P.lilac, 0));
        cf.fillStyle = bl; cf.beginPath(); cf.arc(CEN.x, CEN.y, Math.max(1, wave.r * 0.6), 0, TAU); cf.fill();
      }

      // --- Ponto
      const p = drawPonto(cf, lt);

      // --- anel de choque do encaixe
      if (ring.a > 0.002) {
        cf.strokeStyle = hexA(P.lavender, ring.a); cf.lineWidth = 2;
        cf.beginPath(); cf.arc(p.x, p.y, ring.r, 0, TAU); cf.stroke();
      }

      // --- shimmer de 'mecca'
      for (const { c, ox } of emChars) c.style.backgroundPosition = `${(shim.x - BAND - ox).toFixed(1)}px 0px, ${(-ox).toFixed(1)}px 0px`;
    });

    // ================================================================== SOM
    cue(0, 'impact', 'slam', 0.8);
    cue(1, 'whoosh', 'risco 1', 0.5);
    cue(1, 'click', 'risco 1', 0.9);
    cue(1.5, 'impact', 'slam 2', 0.8);
    cue(2.5, 'whoosh', 'risco 2', 0.5);
    cue(2.5, 'click', 'risco 2', 0.9);
    cue(4.5, 'glitch', 'palavras caem', 0.5);
    cue(4.75, 'click', "'Não' cai", 0.4);
    cue(5, 'stop', 'silêncio', 1);
    cue(5.5, 'tick', "' o'", 0.8);
    cue(6, 'impact', 'DROP', 1.0);
    cue(6, 'sub-drop', 'DROP', 1.0);
    cue(7, 'click', 'ponto encaixa no logo', 0.9);
    cue(7, 'chime', 'encaixe', 0.6);
    cue(8, 'whoosh', 'arcos giram', 0.4);
    cue(9.75, 'whoosh', 'mergulho', 1.0);
    cue(10, 'reverse', 'pico no corte', 0.7);

    // medidas úteis para revisão
    root.dataset.s4 = JSON.stringify({ S1end, S2end, emW: Math.round(emR.w), enRight: Math.round(enR.right), meRight: Math.round(h.rect(ME.txt).right) });
  },
});
})();
