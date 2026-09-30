(() => {
/*
 * S01 (VERTICAL 9:16, 1080×1920) — "Toda empresa é uma máquina."  (0–6 s, tail 0)
 * Mesma coreografia, tempos, easings e cues da horizontal (src/scenes/s01-toda-empresa.js);
 * layout conforme storyboard/vertical/VERTICAL_SPEC.md §2 S01 + corte 6,0 (§3).
 *
 * Gancho frio: o mundo escuro acende, o Ponto (os mecca) nasce no centro do quadro, a frase entra
 * ("Toda empresa / é uma / máquina." — ADAPTAÇÃO: a linha de cima quebra em 2) e o Ponto vira o
 * ponto final de "máquina.". Uma órbita abraça a palavra; dois riders nascem nela e, no colapso
 * final, viram os discos empilhados que a S02 vertical transforma em engrenagens (G1/G2).
 *
 * Tudo é função de lt: tweens na timeline local + desenho de canvas calculado em onFrame.
 */
MECCA.scene({
  id: 's01-toda-empresa',
  build({ root, tl, D, h, P, bg, onFrame, cue, W, H }) {
    const SID = 's01-toda-empresa';
    const { clamp, lerp, hexA } = h;
    const TAU = Math.PI * 2;
    const E = (n) => gsap.parseEase(n);
    const mOut = E('mecca.out'), mInOut = E('mecca.inOut'), mBack = E('mecca.back');
    const p3In = E('power3.in'), p3InOut = E('power3.inOut'), p2In = E('power2.in');
    const elastic = E('elastic.out(1,0.5)'), expoOut = E('expo.out');
    const seg = (t, a, b) => clamp((t - a) / (b - a));

    // ------------------------------------------------------------------ tempos-chave (iguais à horizontal)
    const T_FLY0 = 2.5, T_LAND = 3.0;          // voo do Ponto até o "."
    const T_ORB0 = 3.0, T_ORB1 = 4.5;          // órbita se desenha
    const T_RID = 4.0, RID_PERIOD = 4;         // riders
    const T_OUT0 = 5.5, T_OUT1 = 5.9;          // colapso (termina antes do último quadro 5,967)
    const T_POUT0 = 5.6;                       // o Ponto sai do "." 0,1 s depois (quando o "." sairia pela máscara)
    const PUSH0 = 1.0, PUSH1 = 5.5, PUSH = 0.03;

    // ------------------------------------------------------------------ layout vertical (VERTICAL_SPEC §2 S01)
    const X_TXT = 90;                          // margem esquerda de texto
    const X_MAQ = 83;                          // "máquina." com ajuste óptico −7 px a 200 px
    const BL1 = 740, BL2 = 840, BL3 = 1100;    // baselines: "Toda empresa" · "é uma" · "máquina."
    const SIZE_H3 = 96, SIZE_H1 = 200;
    const DOT_X = 890.7;                       // centro medido da tinta do "." (referência da spec)

    // ------------------------------------------------------------------ fundo (corte de entrada)
    tl.set(bg, { grid: 0, warp: 0, speed: 1, vignette: 0.55, hue: 0, driftX: 0, driftY: 0, grain: 1 }, 0);
    // PRIMEIRO QUADRO: fundo em #120720 (base #160A27 escurecida por dim .35), glows e partículas em 0.
    tl.fromTo(bg, { glowA: 0, glowB: 0, glowC: 0, dim: 0.35 },
      { glowA: 1, glowB: 1, glowC: 1, dim: 0, duration: 3.0, ease: 'sine.inOut', immediateRender: false }, 0);
    tl.fromTo(bg, { particles: 0 }, { particles: 1, duration: 4.0, ease: 'sine.inOut', immediateRender: false }, 0);
    // O quadro 0 é capturado com o master já em t=0 (sem re-render dos tweens): o estado do fundo
    // também é imposto analiticamente em onFrame (mesmas curvas), garantindo o 1º quadro exato.
    const sineIO = E('sine.inOut');
    const applyBg = (lt) => {
      const g = sineIO(seg(lt, 0, 3));
      bg.glowA = g; bg.glowB = g; bg.glowC = g; bg.dim = 0.35 * (1 - g);
      bg.particles = sineIO(seg(lt, 0, 4));
      bg.grid = 0; bg.warp = 0; bg.speed = 1; bg.vignette = 0.55; bg.hue = 0; bg.driftX = 0; bg.driftY = 0; bg.grain = 1;
    };

    // ------------------------------------------------------------------ CSS local
    h.el('style', {
      html: `
      [data-scene="${SID}"] .s01-layer { position:absolute; left:0; top:0; width:${W}px; height:${H}px; }
      [data-scene="${SID}"] .s01-l2 em { background: linear-gradient(90deg, #C026D3, #7C3AED); -webkit-background-clip:text; background-clip:text; color:transparent; }
      [data-scene="${SID}"] .s01-caret { position:absolute; width:14px; height:24px; background:#A78BFA; border-radius:1px; top:50%; margin-top:-12px; opacity:0; }
    `,
    }, root);

    // ------------------------------------------------------------------ grid editorial (SVG)
    // 8 verticais em x = 90 + 128,57·k (k = 0…7), de y 160 a 1760; 2 horizontais em y 160 e 1760, de x 90 a 990.
    const GY0 = 160, GY1 = 1760, GX0 = 90, GX1 = 990;
    const gridSvg = h.svg('svg', { class: 'fill', viewBox: `0 0 ${W} ${H}`, width: W, height: H }, root);
    const gridG = h.svg('g', {}, gridSvg);
    const GRID_X = [...Array(8)].map((_, k) => GX0 + (GX1 - GX0) / 7 * k);
    const HAIR = 'rgba(255,255,255,0.05)';
    const vlines = GRID_X.map(x => h.svg('line', { x1: x + 0.5, y1: GY0, x2: x + 0.5, y2: GY1, stroke: HAIR, 'stroke-width': 1 }, gridG));
    const hlines = [GY0, GY1].map(y => h.svg('line', { x1: GX0, y1: y + 0.5, x2: GX1 + 1, y2: y + 0.5, stroke: HAIR, 'stroke-width': 1 }, gridG));
    const GCX = (GX0 + GX1 + 1) / 2, GHALF = (GX1 + 1 - GX0) / 2;   // as horizontais crescem do centro

    // ------------------------------------------------------------------ canvases + texto
    const back = h.canvas(root);           // abaixo do texto: metade de trás da órbita, pontas do grid, rastro
    const group = h.el('div', { cls: 's01-layer' }, root);
    const front = h.canvas(root);          // acima do texto: metade da frente, riders, Ponto
    const cb = back.ctx, cf = front.ctx;

    // ADAPTAÇÃO: "Toda empresa é uma" quebra em 2 linhas (SG 700 96, x 90, bl 740 / 840)
    const l1a = h.text('Toda empresa', { x: X_TXT, y: 0, size: SIZE_H3, color: P.ink, lh: 1.3, nowrap: true, parent: group });
    const l1b = h.text('é uma', { x: X_TXT, y: 0, size: SIZE_H3, color: P.ink, lh: 1.3, nowrap: true, parent: group });
    // lh 1.0: a caixa da máscara (≈ baseline −168 … +52 px) cobre acento/pingo do i e a perna do q,
    // e a saída para cima é cortada ACIMA da palavra, sem invadir a linha de cima.
    const l2 = h.text('<em>máquina.</em>', { x: X_MAQ, y: 0, size: SIZE_H1, lh: 1.0, nowrap: true, cls: 't-display s01-l2', parent: group });

    // posiciona pela LINHA DE BASE (sonda inline-block de altura 0 alinhada ao baseline)
    const baselineOf = (elm) => {
      const pr = h.el('span', { style: { display: 'inline-block', width: '0px', height: '0px', verticalAlign: 'baseline' } }, elm);
      const y = h.rect(pr).y; pr.remove(); return y;
    };
    const placeBaseline = (elm, target) => {
      const cur = baselineOf(elm);
      elm.style.top = (parseFloat(elm.style.top || '0') + (target - cur)) + 'px';
    };
    placeBaseline(l1a, BL1);
    placeBaseline(l1b, BL2);
    placeBaseline(l2, BL3);

    const sp1a = h.split(l1a, { type: 'lines,words,chars', mask: 'lines' });
    const sp1b = h.split(l1b, { type: 'lines,words,chars', mask: 'lines' });
    const sp2 = h.split(l2, { type: 'lines,chars', mask: 'lines' });

    // "." de "máquina." fica invisível: o Ponto ocupa o lugar dele
    const dotChar = sp2.chars[sp2.chars.length - 1];
    // O disco do Ponto (r 14) fica APOIADO na linha de base (base do disco = baseline 1100 + 1),
    // no x medido do glifo "." (o glifo real é maior que 28 px; usar o centro dele deixaria o disco suspenso).
    const R_LAND = 14, BASE = BL3 + 1;   // +1 px: overshoot óptico de forma redonda (como o bojo do "a")
    let P0 = { x: DOT_X, y: BASE - R_LAND };  // (890,7, 1087) — referência da spec
    try {
      const rc = h.rect(dotChar);
      const mc = document.createElement('canvas').getContext('2d');
      mc.font = `700 ${SIZE_H1}px "Space Grotesk"`;
      const m = mc.measureText('.');
      const cx = rc.x + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
      // medida real (tolerância da spec ±2 px em relação a 890,7); fora disso, fica a referência da spec
      if (dotChar.textContent.trim() === '.' && isFinite(cx) && Math.abs(cx - DOT_X) <= 2) P0 = { x: cx, y: BASE - R_LAND };
    } catch (e) { /* referência da spec */ }
    dotChar.style.opacity = '0';

    // ------------------------------------------------------------------ eyebrow (digitado)
    const eb = h.eyebrow('O PROBLEMA', { x: 90, y: 270, anchor: 'cl', size: 26, parent: root });
    const ebDash = eb.querySelector('.dash');
    const ebLbl = eb.querySelector('.lbl');
    const spE = h.split(ebLbl, { type: 'chars' });
    const caret = h.el('span', { cls: 's01-caret' }, eb);
    // slots de digitação (o espaço conta como um tempo de 0,025 s)
    const LABEL = 'O PROBLEMA';
    const slotOf = []; { let ci = 0; for (let i = 0; i < LABEL.length; i++) if (LABEL[i] !== ' ') slotOf[ci++] = i; }
    const T_TYPE = 0.5, CPS = 0.025;
    const ebR = h.rect(eb);
    const caretX = [h.rect(ebLbl).x - ebR.x];                       // antes do 1º char
    spE.chars.forEach(c => { const r = h.rect(c); caretX.push(r.right - ebR.x); });

    tl.fromTo(ebDash, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.35, ease: 'mecca.out' }, 0.4);
    tl.fromTo(spE.chars, { autoAlpha: 0 }, {
      autoAlpha: 1, duration: 0.001, ease: 'none', immediateRender: true,
      stagger: (i) => slotOf[i] * CPS,
    }, T_TYPE);

    // ------------------------------------------------------------------ grid: desenho + atenuação
    tl.fromTo(vlines, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.8, stagger: 0.03, ease: 'mecca.inOut' }, 0.5);
    tl.fromTo(hlines, { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 0.95, ease: 'mecca.inOut' }, 0.5);
    tl.fromTo(gridG, { opacity: 1 }, { opacity: 0.6, duration: 0.5, ease: 'sine.inOut', immediateRender: false }, 5.0);   // .05 → .03
    tl.fromTo(gridG, { opacity: 0.6 }, { opacity: 0, duration: 0.4, ease: 'mecca.in', immediateRender: false }, T_OUT0);

    // ------------------------------------------------------------------ texto: entradas / push / saída
    // mesmas entradas da horizontal: "Toda empresa" em 1,0 e "é uma" em 1,5 (palavras, stagger .06)
    tl.fromTo(sp1a.words, { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'mecca.out', stagger: 0.06 }, 1.0);
    tl.fromTo(sp1b.words, { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'mecca.out', stagger: 0.06 }, 1.5);

    tl.fromTo(sp2.chars, { yPercent: 105 }, { yPercent: 0, duration: 0.55, ease: 'expo.out', stagger: 0.025 }, 2.0);
    tl.fromTo(l2, { scaleX: 1.06, transformOrigin: '0% 70%' }, { scaleX: 1, duration: 0.55 + 0.025 * (sp2.chars.length - 1), ease: 'expo.out' }, 2.0);

    const OX = X_TXT, OY = BL3;   // origem do push: margem esquerda × baseline de "máquina." = (90, 1100)
    tl.fromTo(group, { scale: 1, transformOrigin: `${OX}px ${OY}px` }, { scale: 1 + PUSH, duration: PUSH1 - PUSH0, ease: 'none' }, PUSH0);

    // saída: a linha de cima (agora 2 linhas) sai como UMA sequência de chars (mesmo stagger da horizontal)
    tl.fromTo([...sp1a.chars, ...sp1b.chars], { yPercent: 0 }, { yPercent: -110, duration: 0.2, ease: 'mecca.in', stagger: 0.012, immediateRender: false }, T_OUT0);
    tl.fromTo(sp2.chars, { yPercent: 0 }, { yPercent: -110, duration: 0.25, ease: 'mecca.in', stagger: 0.015, immediateRender: false }, T_OUT0);

    // ------------------------------------------------------------------ o Ponto (função pura de lt)
    const pushS = (lt) => 1 + PUSH * clamp((lt - PUSH0) / (PUSH1 - PUSH0));
    const dotAt = (lt) => { const s = pushS(lt); return { x: OX + s * (P0.x - OX), y: OY + s * (P0.y - OY) }; };
    const BIRTH = { x: W / 2, y: H / 2 };          // (540, 960): centro do quadro
    const LAND = dotAt(T_LAND);
    const END = { x: 600, y: 960 };                // corte 6,0
    const FLY0 = { x: BIRTH.x, y: BIRTH.y - 64 };  // (540, 896): posição após a antecipação (ver liftY)
    // ápice do arco quase sobre o pouso: o Ponto passa POR CIMA/à direita do "a" e desce
    // praticamente na vertical sobre o lugar do "." (combina com o squash vertical do pouso).
    const MID = { x: LAND.x - 20, y: 800 };

    // arco do voo via MotionPath (curviness 1,5); fallback: Bézier quadrática
    let flightAt;
    try {
      const MPP = MotionPathPlugin;
      const raw = MPP.arrayToRawPath([FLY0, MID, LAND], { curviness: 1.5 });
      MPP.cacheRawPathMeasurements(raw);
      const test = MPP.getPositionOnPath(raw, 0.5);
      if (!test || !isFinite(test.x)) throw new Error('mp');
      flightAt = (p) => { const q = MPP.getPositionOnPath(raw, clamp(p)); return { x: q.x, y: q.y }; };
    } catch (e) {
      const C = { x: 2 * MID.x - (FLY0.x + LAND.x) / 2, y: 2 * MID.y - (FLY0.y + LAND.y) / 2 };
      flightAt = (u) => ({ x: (1 - u) * (1 - u) * FLY0.x + 2 * (1 - u) * u * C.x + u * u * LAND.x, y: (1 - u) * (1 - u) * FLY0.y + 2 * (1 - u) * u * C.y + u * u * LAND.y });
    }
    // saída: mergulha ABAIXO da linha de base (longe das letras que sobem pela máscara)
    // e só sobe até (600, 960) quando "quina" já saiu.
    const OUT0 = dotAt(T_POUT0);
    const OUTC = { x: 780, y: 1200 };   // controle quadrático da spec

    // antecipação: no impacto de "máquina." (2,0) o Ponto recua para cima e toma distância do "u"
    const LIFT = 64, T_LIFT = 2.0;
    const liftY = (lt) => BIRTH.y - LIFT * mOut(seg(lt, T_LIFT, T_LIFT + 0.45));
    function pontoPos(lt) {
      if (lt < T_FLY0) return { x: BIRTH.x, y: liftY(lt) };
      if (lt < T_LAND) return flightAt(mInOut(seg(lt, T_FLY0, T_LAND)));
      if (lt < T_POUT0) return dotAt(lt);
      const u = p3InOut(seg(lt, T_POUT0, T_OUT1));
      const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      return { x: a * OUT0.x + b * OUTC.x + c * END.x, y: a * OUT0.y + b * OUTC.y + c * END.y };
    }
    const PULSES = [0.5, 1.0, 1.5, 2.0];
    const BREATHS = [3.5, 4.0, 4.5, 5.0];
    function pontoState(lt) {
      const p = pontoPos(lt);
      let r, scale = 1, sx = 1, sy = 1, glow = 1;
      if (lt < T_FLY0) {
        r = 8;
        scale = lt <= 0 ? 0 : mBack(seg(lt, 0, 0.3));
        for (const b of PULSES) if (lt >= b && lt < b + 0.25) scale *= 1 + 0.5 * Math.sin(Math.PI * (lt - b) / 0.25);
      } else if (lt < T_LAND) {
        r = lerp(8, R_LAND * pushS(lt), mInOut(seg(lt, T_FLY0, T_LAND)));
      } else if (lt < T_POUT0) {
        // no "." o Ponto recebe a mesma escala do push da linha (§1.7)
        r = R_LAND * pushS(lt);
        const e = elastic(seg(lt, T_LAND, T_LAND + 0.4));
        sx = lerp(1.5, 1, e); sy = lerp(0.6, 1, e);
        for (const b of BREATHS) if (lt >= b && lt < b + 0.4) { const w = Math.sin(Math.PI * (lt - b) / 0.4); scale *= 1 + 0.06 * w; glow += 0.6 * w; }
        // squash apoiado na linha de base: a base do disco não sai do chão
        p.y += r * (1 - sy);
      } else {
        r = lerp(R_LAND * pushS(T_POUT0), 10, p3InOut(seg(lt, T_POUT0, T_OUT1)));
      }
      return { x: p.x, y: p.y, r, scale, sx, sy, glow };
    }

    function drawPonto(c, cTrail, s) {
      const rr = s.r * s.scale;
      if (rr < 0.05) return;
      // velocidade (da trajetória pura, sem o deslocamento do squash) → rastro + estiramento
      const dt = 1 / 120;
      const p1 = pontoPos(s.t), q = pontoPos(Math.max(0, s.t - dt));
      const vx = (p1.x - q.x) / dt, vy = (p1.y - q.y) / dt;
      const speed = Math.hypot(vx, vy);
      const trail = h.smooth(600, 1000, speed);
      // o rastro vai no canvas de TRÁS (abaixo do texto): nunca mancha um glifo
      if (trail > 0) drawTrail(cTrail, s.t, rr, trail);
      const stretch = 1 + clamp(speed / 7000, 0, 0.35);
      const rot = speed > 40 ? Math.atan2(vy, vx) : 0;
      c.save();
      c.translate(s.x, s.y);
      c.rotate(rot);
      c.scale(s.sx * stretch, s.sy / stretch);
      h.glowDot(c, 0, 0, rr, P.lavender, clamp(0.6 * s.glow, 0, 1));
      c.fillStyle = P.ink;
      c.beginPath(); c.arc(0, 0, rr, 0, TAU); c.fill();
      c.restore();
    }
    // rastro de luz ao longo das últimas 8 posições (janela de 8 quadros a 30 fps).
    // 1) amostra densa no TEMPO (160 pontos) → 2) reamostra por COMPRIMENTO DE ARCO (1 carimbo a cada 3 px)
    // → 3) carimba discos translúcidos de raio e α decrescentes (cabeça ≈ 0,6·r), cor #C026D3 → #7C3AED.
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
      c.save();
      // passada larga: halo de α baixo (borda suave, "luz" em volta do traço)
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
      // fio quente perto da cabeça (brilho de luz, rosa → magenta)
      for (let k = Math.floor(n * 0.5); k >= 0; k--) {
        const u = k / n, v = u / 0.5, w = w0 * 0.34 * (1 - v);
        if (w < 0.3) continue;
        c.fillStyle = rgba(TR_HOT, TR_HEAD, v, 0.09 * amt * (1 - v));
        c.beginPath(); c.arc(stX[k], stY[k], w, 0, TAU); c.fill();
      }
      c.restore();
    }

    // ondas de choque (anéis finos): nascimento, batidas e pouso
    // (o anel do pouso acompanha o raio do Ponto: horizontal r 22 → 24…130; vertical r 14 → ×14/22)
    const KR = R_LAND / 22;
    const RINGS = [
      { t: 0.0, at: () => BIRTH, r0: 6, r1: 80, a: 0.5, dur: 0.8 },
      // os pulsos seguem o Ponto (na batida 2,0 ele já sobe na antecipação: o anel sobe junto)
      ...PULSES.map(b => ({ t: b, at: (lt) => pontoPos(lt), r0: 10, r1: 46, a: 0.22, dur: 0.45 })),
      { t: T_LAND, at: () => ({ x: LAND.x, y: LAND.y }), r0: 24 * KR, r1: 130 * KR, a: 0.65, dur: 0.65 },
    ];
    function drawRings(c, lt) {
      for (const R of RINGS) {
        const u = (lt - R.t) / R.dur;
        if (u <= 0 || u >= 1) continue;
        const p = R.at(lt);
        const rad = lerp(R.r0, R.r1, expoOut(u));
        c.strokeStyle = hexA(P.lavender, R.a * Math.pow(1 - u, 1.6));
        c.lineWidth = 1.5;
        c.beginPath(); c.arc(p.x, p.y, rad, 0, TAU); c.stroke();
      }
    }

    // ------------------------------------------------------------------ órbita + riders
    // DESVIO da spec (§2 S01 diz centro (500, 1040), rx 500): com rx 500 a elipse tangencia a borda
    // esquerda (x ≈ 2,6) e o rider lavanda nasce cortado em 4,0. Com centro (520, 1040) e rx 470 ela
    // fica em x 52–988 (≥ 52 px de margem), continua passando pelo "." (≈ 9 px do centro do Ponto,
    // antes 10,5) e contorna o "m" como antes. ry, rot, α e o colapso para (540, 1238) não mudam.
    const ORB = { cx: 520, cy: 1040, rx: 470, ry: 120, rot: -6 * Math.PI / 180 };
    const COLL = { x: 540, y: 1238 };   // ponto de engrenamento de G1/G2 na S02 vertical
    const orbitAt = (lt) => {
      const e = p3In(seg(lt, T_OUT0, T_OUT1));
      return { cx: lerp(ORB.cx, COLL.x, e), cy: lerp(ORB.cy, COLL.y, e), rx: ORB.rx * (1 - e), ry: ORB.ry * (1 - e), rot: ORB.rot };
    };
    // a órbita começa a se desenhar a partir do ponto dela mais próximo do Ponto pousado
    let TH0 = 0;
    { let best = 1e9; for (let d = 0; d < 360; d++) { const a = d * Math.PI / 180; const q = h.ellipsePt(ORB.cx, ORB.cy, ORB.rx, ORB.ry, ORB.rot, a); const dd = Math.hypot(q.x - LAND.x, q.y - LAND.y); if (dd < best) { best = dd; TH0 = a; } } }

    // desenha o intervalo [a,b] da elipse; metade de trás (sen θ < 0) no canvas de trás com α ×.5
    function arcSplit(o, a, b, alpha) {
      if (o.rx < 0.5 || b <= a) return;
      const n0 = Math.floor(a / Math.PI) - 1, n1 = Math.ceil(b / Math.PI) + 1;
      for (let n = n0; n <= n1; n++) {
        const s0 = Math.max(a, n * Math.PI), s1 = Math.min(b, (n + 1) * Math.PI);
        if (s1 <= s0) continue;
        const isFront = ((n % 2) + 2) % 2 === 0;
        const c = isFront ? cf : cb;
        c.strokeStyle = hexA(P.lavender, alpha * (isFront ? 1 : 0.5));
        c.lineWidth = 1.5;
        c.beginPath(); c.ellipse(o.cx, o.cy, o.rx, o.ry, o.rot, s0, s1, false); c.stroke();
      }
    }

    // corte 6,0: disco magenta r 14 em (540, 1130) → G1; disco lavanda r 14 em (540, 1346) → G2
    const RIDERS = [
      { col: P.magenta, r: 5, ph: 0, target: { x: 540, y: 1130 } },
      { col: P.lavender, r: 4, ph: Math.PI, target: { x: 540, y: 1346 } },
    ];
    function riderTheta(lt, ph) {
      const tt = lt - T_RID;
      return ph - TAU * tt / RID_PERIOD - Math.PI * p2In(seg(lt, T_OUT0, T_OUT1));   // sentido do desenho; acelera no colapso
    }
    // glow reforçado (raio ×6, α .6) para os riders se destacarem das partículas ambientes
    // (mesmo tamanho/cores); `glow` > 1 nas batidas 4,5 e 5,0 (pulso).
    function drawRider(c, x, y, r, col, a, glow) {
      if (r < 0.05 || a <= 0) return;
      if (glow > 0.001) {
        const gr = r * 6 * (1 + 0.25 * Math.max(0, glow - 1));
        const g = c.createRadialGradient(x, y, 0, x, y, gr);
        g.addColorStop(0, hexA(col, clamp(0.6 * a * glow)));
        g.addColorStop(0.28, hexA(col, clamp(0.2 * a * glow)));
        g.addColorStop(1, hexA(col, 0));
        c.fillStyle = g; c.beginPath(); c.arc(x, y, gr, 0, TAU); c.fill();
      }
      c.fillStyle = hexA(col, a);
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      if (glow > 0.001) { c.fillStyle = hexA('#FFFFFF', clamp(0.85 * a * Math.min(glow, 1.2))); c.beginPath(); c.arc(x, y, r * 0.45, 0, TAU); c.fill(); }
    }
    const RIDER_BEATS = [4.5, 5.0];
    const riderPulse = (lt) => { let w = 0; for (const b of RIDER_BEATS) if (lt >= b && lt < b + 0.4) w = Math.max(w, Math.sin(Math.PI * (lt - b) / 0.4)); return w; };

    // ------------------------------------------------------------------ desenho por quadro
    onFrame((lt) => {
      applyBg(lt);
      cb.clearRect(0, 0, W, H);
      cf.clearRect(0, 0, W, H);

      // pontas luminosas do grid enquanto as linhas se desenham
      GRID_X.forEach((x, k) => {
        const u = seg(lt, 0.5 + 0.03 * k, 1.3 + 0.03 * k);
        if (u <= 0 || u >= 1) return;
        const y = GY0 + (GY1 - GY0) * mInOut(u);
        cb.fillStyle = hexA(P.lilac, 0.5 * Math.sin(Math.PI * u));
        cb.beginPath(); cb.arc(x + 0.5, y, 1.8, 0, TAU); cb.fill();
      });
      {
        const u = seg(lt, 0.5, 1.45);
        if (u > 0 && u < 1) {
          const half = GHALF * mInOut(u);
          cb.fillStyle = hexA(P.lilac, 0.5 * Math.sin(Math.PI * u));
          for (const y of [GY0 + 0.5, GY1 + 0.5]) for (const x of [GCX - half, GCX + half]) { cb.beginPath(); cb.arc(x, y, 1.8, 0, TAU); cb.fill(); }
        }
      }

      // órbita
      if (lt >= T_ORB0) {
        const o = orbitAt(lt);
        const pd = mInOut(seg(lt, T_ORB0, T_ORB1));
        const L = TAU * pd;
        arcSplit(o, TH0 - L, TH0, 0.3 + 0.25 * p3In(seg(lt, T_OUT0, T_OUT1)));
        // "caneta" na ponta enquanto desenha
        if (pd > 0 && pd < 1) {
          const hp = h.ellipsePt(o.cx, o.cy, o.rx, o.ry, o.rot, TH0 - L);
          const behind = Math.sin(TH0 - L) < 0;
          const c = behind ? cb : cf;
          const w = Math.sin(Math.PI * seg(lt, T_ORB0, T_ORB1));
          h.glowDot(c, hp.x, hp.y, 2.4, P.lilac, (behind ? 0.5 : 1) * w);
        }
      }

      // riders
      if (lt >= T_RID) {
        const o = orbitAt(lt);
        const k = p3InOut(seg(lt, T_OUT0, T_OUT1));
        const appear = mBack(seg(lt, T_RID, T_RID + 0.45));
        for (const R of RIDERS) {
          const th = riderTheta(lt, R.ph);
          const sn = Math.sin(th);
          const q = h.ellipsePt(o.cx, o.cy, o.rx, o.ry, o.rot, th);
          const x = lerp(q.x, R.target.x, k), y = lerp(q.y, R.target.y, k);
          const depthR = 1 + 0.12 * sn;
          const r = lerp(R.r * depthR * appear, 14, k);
          // α mínimo .8 também na metade de trás (ela já passa atrás do texto, no canvas de trás)
          const a = lerp(0.9 + 0.1 * sn, 1, k) * clamp(appear * 1.5);
          const c = (sn < 0 && k < 0.5) ? cb : cf;
          drawRider(c, x, y, r, R.col, a, (1 - k) * (1 + 0.9 * riderPulse(lt)));
          // anel de chegada (chime)
          const ua = (lt - T_RID) / 0.6;
          if (ua >= 0 && ua < 1) {
            c.strokeStyle = hexA(R.col, 0.45 * Math.pow(1 - ua, 1.5));
            c.lineWidth = 1.25;
            c.beginPath(); c.arc(x, y, lerp(4, 30, expoOut(ua)), 0, TAU); c.stroke();
          }
        }
      }

      // Ponto
      drawRings(cf, lt);
      const s = pontoState(lt); s.t = lt;
      drawPonto(cf, cb, s);

      // cursor do eyebrow: segue a digitação e pisca duas vezes antes de sumir
      const typed = spE.chars.reduce((n, _, i) => n + (lt >= T_TYPE + slotOf[i] * CPS ? 1 : 0), 0);
      const tEnd = T_TYPE + slotOf[slotOf.length - 1] * CPS;
      let vis = 0;
      if (lt >= T_TYPE - 0.05 && lt < tEnd + 0.05) vis = 1;
      else if (lt >= tEnd + 0.05 && lt < tEnd + 0.8) vis = Math.floor((lt - tEnd - 0.05) / 0.125) % 2 === 1 ? 1 : 0;
      caret.style.opacity = String(vis * 0.85);
      caret.style.left = caretX[typed] + 'px';
    });

    // ------------------------------------------------------------------ som (idêntico à horizontal)
    cue(0, 'tick', 'primeira batida no escuro', 0.6);
    cue(1.0, 'click', 'Toda empresa', 0.3);
    cue(1.5, 'click', 'é uma', 0.3);
    cue(2.0, 'impact', 'máquina.', 0.6);
    cue(3.0, 'click', 'Ponto pousa como ponto final', 0.8);
    cue(4.0, 'chime', 'riders', 0.25);
    cue(5.75, 'whoosh', 'colapso', 0.7);
  },
});
})();
