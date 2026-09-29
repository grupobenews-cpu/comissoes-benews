# Guia de implementação de cenas — vídeo Meccanismo

O vídeo é uma página HTML (`src/index.html`) animada por uma **timeline GSAP determinística**.
O render (`tools/render.mjs`) posiciona a timeline em cada quadro (`window.__seek(t)`) e tira um screenshot.
Portanto **o estado visual tem de ser função apenas do tempo**.

## Arquivos
- `src/scenes/<id>.js` — UMA cena por arquivo (é o único arquivo que você edita).
- `src/timing.js` — início/duração/tail de cada cena (do orquestrador; **não edite**).
- `src/scenes/manifest.js` — lista de arquivos de cena (do orquestrador; **não edite**).
- `src/engine.js`, `src/styles.css` — motor e estilos compartilhados (**não edite**; se precisar de CSS próprio,
  injete um `<style>` dentro do `root` da sua cena com seletores prefixados por `[data-scene="<id>"]`).
- `brief/BRIEF.md` — marca, paleta, fontes, regras de conteúdo. `storyboard/storyboard.json` — o roteiro aprovado.

## Esqueleto
```js
MECCA.scene({
  id: 's03-virada',             // precisa bater com a chave em timing.js
  build({ root, tl, D, tail, h, P, bg, onFrame, cue, BEAT, BAR }) {
    // 1) monte o DOM/SVG/canvas dentro de root (coordenadas absolutas no quadro 1920×1080)
    const title = h.text('Somos o<br><em>meccanismo.</em>', { x: 160, y: 300, size: 180, parent: root });
    const sp = h.split(title, { type: 'lines,chars', mask: 'lines' });   // split ANTES de aplicar transforms

    // 2) anime na timeline LOCAL (t = 0 é o início da cena; t = D é o fim oficial)
    tl.fromTo(sp.chars, { yPercent: 110 }, { yPercent: 0, stagger: 0.025, duration: 0.7, ease: 'mecca.out' }, 0.5);
    tl.to(title, { autoAlpha: 0, duration: 0.4, ease: 'mecca.in' }, D - 0.4);

    // 3) desenho procedural (canvas) — chamado a cada quadro enquanto a cena está visível
    const { ctx } = h.canvas(root);
    onFrame((lt) => { ctx.clearRect(0, 0, 1920, 1080); /* desenhe em função de lt */ });

    // 4) cues de som (tempo local)
    cue(0.5, 'whoosh'); cue(2.0, 'impact');
  },
});
```

## ctx
| campo | o que é |
|---|---|
| `root` | `<div>` 1920×1080 da cena. Fica visível só em `[start, start + D + tail)`. Cenas posteriores ficam por cima. |
| `tl` | timeline GSAP local. Posicione tudo com o 3º argumento (tempo absoluto local). |
| `D`, `tail` | duração oficial e segundos extras em que a cena continua visível (sobreposição de transição). |
| `onFrame(fn(lt, gt))` | desenho procedural por quadro. `lt` = tempo local. Limpe o canvas a cada chamada. |
| `cue(t, kind, note?, gain?)` | cue de som em tempo local. kinds: `impact whoosh riser tick click sub-drop glitch chime reverse stop`. Para `riser`/`reverse`, `t` é o PICO (o som cresce até ali). Para `whoosh`, `t` é o centro do movimento. |
| `bg` | estado do fundo global (tweenável): `glowA glowB glowC grid particles driftX driftY speed warp vignette dim hue grain`. Padrões: glow* 1, grid 0, particles 1, drift 0, speed 1, warp 0, vignette .55, dim 0, hue 0, grain 1. Se alterar, devolva ao valor combinado com a cena seguinte até o fim da sua janela. |
| `BEAT` = 0.5 s, `BAR` = 2 s | música a 120 BPM. Entradas de texto e impactos devem cair em múltiplos de 0,5 s. |

## Helpers `h`
- `h.text(html, {x, y, size, weight, color, width, align, anchor, lh, ls, nowrap, cls, style, parent})` → `<div>` absoluto.
  `cls` padrão `t-display` (Space Grotesk 700, tracking −0.035em). Outras: `t-bricolage`, `t-body`, `t-mono`.
  `anchor`: 2 letras (vertical t/c/b + horizontal l/c/r), ex. `'cc'` centraliza no ponto (x,y). Use `<em>` para destaque em gradiente violeta→magenta
  (`<em class="solid">` = lavanda sólido).
- `h.split(el, opts)` → instância SplitText (`.lines .words .chars`). Use `mask: 'lines'` para revelar de baixo. Já corrige o gradiente de `<em>`.
- `h.eyebrow(label, {x, y, size, dot, anchor, parent})` → label mono CAIXA ALTA com traço (ou ponto magenta com `dot:true`). Não coloque “—” no texto; o traço já existe.
- `h.chip(label, {x, y, size, parent})` → chip mono com borda lavanda. Classes CSS: `.card`, `.card.hot`, `.btn`, `.btn.ghost`, `.glow`, `.glow-m`.
- `h.icon({size, color, parent})` → `{svg, g, arcOuter, arcInner, pupil, dot}` — o ícone oficial em partes (viewBox 228×228, centro 114,114).
  Anime com `drawSVG` nos arcos, `scale/transformOrigin` na pupila, `motionPath` no ponto etc.
- `h.logo({width, parent})` → `{svg, mecca, nismo}` — wordmark oficial (803×170).
- `h.gear(svgParent, {x, y, r, teeth, depth, hole, tip, base, fill, stroke, strokeWidth})` → `{g, rot, path}`; gire `rot` com
  `tl.to(g.rot, {rotation: 360, svgOrigin: '0 0', ease: 'none', duration})`. `h.gearPath(opts)` devolve só o `d`.
  Engrenagens acopladas: distância entre centros ≈ r1 + r2 − (r1·depth), velocidades angulares inversamente proporcionais ao nº de dentes, sentidos opostos.
- `h.svg(tag, attrs, parent)`, `h.el(tag, {cls, html, text, style, attrs}, parent)` — criação de nós.
- `h.canvas(parent)` → `{canvas, ctx}` full-frame. `h.orbit(ctx, {cx, cy, rx, ry, rot, color, alpha, lineWidth, dash, from, to})`,
  `h.ellipsePt(cx, cy, rx, ry, rot, ang)`, `h.glowDot(ctx, x, y, r, color, alpha)`.
- `h.strike(tl, el, at, {color, thickness, top, dur})` → risco animado sobre um texto.
- `h.flash(tl, root, at, {color, peak, dur, blend})`, `h.shake(tl, target, at, {amp, n, dur, seed})`.
- `h.rng(seed)` (aleatório determinístico), `h.clamp h.lerp h.smooth h.hexA`, `h.P` (paleta), `h.W h.H`.

Easings: `mecca.out` (entrada), `mecca.in` (saída), `mecca.inOut`, `mecca.snap`, `mecca.back` (overshoot leve),
`mecca.gear` (engate mecânico com overshoot) + todos os do GSAP (`expo.out`, `power4.inOut`, `back.out(1.6)`, `elastic.out(1,0.5)`...).
Plugins: SplitText, DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin, CustomEase.

## Regras de determinismo (obrigatórias)
- Proibido: `Math.random`, `Date`, `performance.now`, `requestAnimationFrame`, `setTimeout/setInterval`, `tl.call`/`onComplete` com efeitos
  colaterais, CSS `animation/transition`, `<video>`, imagens externas, fetch.
- Tudo que se move: tween em `tl` OU desenho em `onFrame` calculado a partir de `lt`.
- Não use `repeat: -1`; para loops, calcule a duração exata (ex.: `repeat: Math.ceil(D / periodo)`) ou use `onFrame`.
- Não anime a mesma propriedade do mesmo elemento com tweens sobrepostos no tempo.
- Não crie DOM dentro de `onFrame` (só desenhe em canvas ou altere estilos pré-criados).

## Qualidade visual
- Área segura: 96 px nas laterais, 72 px em cima/embaixo. Nada de texto cortado, sobreposto ou encostado na borda.
- Hierarquia: títulos Space Grotesk 700 (110–220 px), apoio Inter 30–44 px `#C4B5FD`, labels JetBrains Mono 18–26 px tracking largo.
- Cores só da paleta (`P`). Fundo global já existe (não pinte um fundo opaco de tela inteira, a menos que a transição exija).
- Movimento com intenção: entradas com `mecca.out` ~0.6–0.9 s, saídas mais rápidas (0.3–0.5 s) com `mecca.in`. Staggers curtos (0.02–0.06).
  Evite coisas paradas por mais de ~1,5 s: dê micro-movimento contínuo (drift, rotação lenta, pulsação de glow).
- Desempenho: < ~800 nós DOM por cena; filtros (`blur`, `drop-shadow`) só em elementos pequenos; canvas < 5 ms por quadro.
- Texto: exatamente o do storyboard, PT-BR com acentos corretos. Nunca chamar a Meccanismo de agência/consultoria.
  Nada de números ilustrativos (ver BRIEF).

## Verificação (faça sempre)
```bash
node tools/snap.mjs --scene <id> --every 0.5          # folha de contato: out/snaps/<id>/sheet.png
node tools/snap.mjs --scene <id> --times 0,2.25,5.5   # quadros específicos (tempos locais)
```
Abra `sheet.png` e os PNGs com a ferramenta Read (ela mostra a imagem) e confira: texto legível e dentro da área segura,
nada vazando/sobreposto sem intenção, primeiro e último quadro batendo com o que o storyboard pede para a transição,
sem “ERROS/AVISOS” no final da saída. Itere até ficar com acabamento de estúdio.
