# Cena 2/10: s02-range

## Motivos visuais globais (valem para todas as cenas)
CAMADA DE FUNDO PERSISTENTE (motor, desenhada por baixo de todas as cenas; as cenas não pintam fundo opaco):
- Base #160A27.
- Três radiais suaves: glowA violeta #7C3AED no topo-esquerdo, glowB magenta #C026D3 no topo-direito, glowC violeta embaixo ao centro. Todos derivam lentamente.
- Malha de pontos (bg.grid) só nos momentos 'planta técnica': S02 4,5–7,5; S06; S07 até 16,0.
- Partículas ambientes (bg.particles 1).
- Linhas de velocidade radiais (bg.warp) só nos mergulhos: S04→S05 e S09→S10.
- Vinheta .55 e grain 1.
- Estados de bg nos cortes (valor exato no último quadro da cena que sai = primeiro quadro da que entra):
  - 6,0: padrão.
  - 14,0: padrão, grid 0.
  - 24,0: dim .5, vignette .75, glowA/B .6, particles .5.
  - 34,0: warp 1, speed 3, dim 0, glow 1.
  - 42,0: padrão.
  - 54,0: grid .2.
  - 76,0: padrão, grid 0.
  - 82,0: padrão.
  - 92,0: warp .5, speed 2.
  - Fim em 100,0: padrão com glowA/B 1,1.

O PONTO (fio condutor único) = o ponto orbital do ícone = 'os mecca'.
- Desenho padrão em canvas de cada cena: núcleo #FBF8FF com r 10 e h.glowDot lavanda #A78BFA (alpha .6, raio ×3).
- Acima de 600 px/s, rastro com as últimas 8 posições, alpha decrescente e cor de #C026D3 para #7C3AED.
- Cada cena recebe e entrega o Ponto na posição e raio declarados no primeiro e no último quadro. Sequência de papéis:
  1. Nasce no escuro (S01) e vira o ponto final de 'máquina.'.
  2. Satélite de 'giram' e ponto final de 'engenharia.' (S02).
  3. Ponto final de 'caixas.' e de 'H.', o único que sobra quando tudo some (S03).
  4. A bala que risca 'agência' e 'consultoria' e ENCAIXA no ícone no drop (S04): logo completo, cor #7C3AED.
  5. Sai do ícone e mergulha no V da pupila (entra por dentro).
  6. Divide-se nos 4 mecca que montam as engrenagens (S05).
  7. Sonda da linha do tempo (S06).
  8. Estação de onde saem os serviços (S07).
  9. Os 4 mecca saltando entre os anéis de rotina (S08).
  10. Assume o motor, fica orbitando e vira o corpo 'OS MECCA' do binário (S09).
  11. Órbita da tagline e ENCAIXE FINAL no ícone do lockup (S10).
- Entre S04 9,5 e S10 7,0 o ícone aparece SEM o ponto (icon.dot oculto): os mecca estão fora, operando.

REGRAS DE ENGRENAGEM (locais, por cena):
- Engrenagens acopladas usam a mesma altura de dente.
- Distância entre centros = r1 + r2 − profundidade do dente.
- Velocidades ω2 = −ω1·N1/N2.
- Fase inicial para dente cair em vão: θB = ψ + 180° + 180°/NB − (NA/NB)·(θA − ψ), com ψ = direção A→B.
- Nada de fase global entre cenas: cada cena parte do ângulo que ela mesma declara.
- Engrenagens 'doentes' têm stroke slate #64748B α .6. As 'saudáveis' têm stroke lavanda #A78BFA ou gradiente #C026D3→#7C3AED.

ÓRBITAS:
- Elipses finas, hairline de 1–1,5 px, lavanda #A78BFA com α .2–.35.
- Inclinação padrão −14°. Órbitas que abraçam texto usam −6°; a linha do tempo, 0°.
- Riders: pontos r 4–6 em #C026D3 / #A78BFA / #C4B5FD / #E249B0.
- A metade de trás passa atrás do objeto (canvas de trás) e com α ×.5.

TIPOGRAFIA E ESTILO COMUNS:
- Margem de texto padrão x 192. Eyebrow h.eyebrow (JetBrains Mono 500, 22 px, CAIXA ALTA, tracking .22em, #A78BFA, com traço automático) em (192,120), âncora 'cl', exceto quando a cena disser outra posição. Troca de eyebrow: apaga de trás para frente (0,02 s/char) e digita o novo (0,025 s/char).
- Títulos em Space Grotesk 700 (classe t-display, tracking −0,035em) na cor ink #FBF8FF.
- Destaque <em> com gradiente da marca (linear 90deg #C026D3→#7C3AED), só em palavras positivas ou de marca.
- Palavras negativas em muted #A99CC4. Apoio em Inter 500, #C4B5FD. Números em Bricolage Grotesque 800. Chips com h.chip (mono 18–20 px, borda lavanda).
- Riscos com h.strike em gradiente magenta→violeta, só em 'agência', 'consultoria', 'aconselha' e 'entrega e some'.
- Glow (drop-shadow/glowDot) só em elementos pequenos: Ponto, riders, botão, núcleo do ícone. Áreas grandes usam os radiais do fundo.
- Entradas: máscara (yPercent 110→0) com mecca.out, 0,5–0,7 s. Saídas: mecca.in, 0,25–0,4 s. Staggers de 0,02–0,06.
- Nenhum texto fica parado sem micro-movimento: push lento de 1→1,02–1,03, respiração de glow ou giro de engrenagem.
- No máximo ~10 palavras em destaque por vez: linhas anteriores caem para α .4–.55.
- Proibido chamar a Meccanismo de agência ou consultoria. Essas palavras só aparecem como rótulo das caixas do mercado e riscadas.
- Sem números ilustrativos e sem nomes de clientes. Só números estruturais: 01–04, 0k / 07, 'Quatro', 'Sete', 4 classes de rotina.

CONTINUIDADE: tail 0 em todas as cenas. Todo corte é match cut: o último quadro da cena N é idêntico ao primeiro da cena N+1, conforme o 'PRIMEIRO QUADRO' do layout de cada cena e o 'ÚLTIMO QUADRO' do transition_out.

## ESTA CENA (implemente exatamente isto)
### s02-range — Algumas giram; a maioria range
- início global: 6 s · duração: 8 s · tail (sobreposição após o fim): 0 s
- objetivo: O problema como fenômeno físico: duas engrenagens emperram e rangem. 'Não falta esforço — falta engenharia.' A planta técnica mostra o erro (interferência entre os dentes).

**Texto na tela** (tempos relativos à cena):
- [0–8 s] «O PROBLEMA» — estilo: h.eyebrow 22 px #A78BFA em (192,120) âncora cl — animação: Já visível no quadro 0 (continuidade da S01). Continua na S03.
- [0–3.5 s] «Algumas giram; / a maioria range.» — estilo: Space Grotesk 700, 150 px, #FBF8FF. Linha 1 em x 192, baseline 430 ('giram' em #C4B5FD). Linha 2 em x 192, baseline 610 ('range' em pink #E249B0). — animação: Linha 1 em 0,0 com palavras por máscara (0,5 s, mecca.out). Linha 2 em 0,5 com entrada rápida (0,25 s, expo.out). Os chars de 'range' tremem ±6 px em y e ±4° em cada rangido. Saída em 3,5–3,8: os chars DESABAM (y +80, rotação ±20° via h.rng(2), power2.in, stagger .01).
- [4–7.5 s] «Não falta esforço —» — estilo: Space Grotesk 700, 96 px, #FBF8FF, x 192, baseline 380 — animação: Máscara, 0,4 s, mecca.out. Saída em 7,5–7,8: yPercent 0→−110, mecca.in.
- [4.5–7.5 s] «falta engenharia.» — estilo: 'falta' em Space Grotesk 700, 96 px, ink, x 192, baseline 500. 'engenharia.' em Space Grotesk 700, 220 px, <em> gradiente, x 192, baseline 760 (≈1182 px, até x≈1374). O '.' é transparente: o Ponto ocupa o lugar. — animação: 'falta' por máscara. 'engenharia.' com chars em stagger .02, 0,35 s, expo.out. Shimmer do gradiente (background-position) de 6,0 a 7,5. Saída em 7,5–7,8, mecca.in.

**Layout:** PRIMEIRO QUADRO: idêntico ao último da S01 (discos em (1600,300) e (1600,480), Ponto em (1000,540) com r 10, eyebrow).

Engrenagens (h.gear):
- G1: centro (1600,300), r 100, 12 dentes, depth .2, hole .22.
- G2: centro (1600,480), mesmas medidas.
- Distância entre centros de 180 (= 100 + 100 − 20): acopladas.
- Stroke #A78BFA 2,5 px e fill #1A0B2E α .85.
- Ângulo inicial: G1 0°, G2 15° (meio dente, ou seja, engrenadas).
- Ponto de engrenamento em (1600,390).

O texto ocupa x 192–1374. As engrenagens ficam em x 1500–1700 e y 200–580, sem sobreposição.

**Visuais:** Duas engrenagens em line art, que depois emperram. Faíscas rosa #E249B0 saem do ponto de contato.

Planta técnica em hairline lavanda:
- círculos primitivos tracejados;
- linha entre centros com ticks;
- miras;
- lente de interferência rosa, que mostra os dentes invadindo o vizinho.

O Ponto orbita 'giram' e depois vira o ponto final de 'engenharia.'.

**Coreografia:** 0,0–0,5
- Os discos viram G1/G2 (scale .14→1, mecca.back, 0,5 s; G2 começa +0,1 s depois).
- Giro saudável: G1 +120°/s, G2 −120°/s.
- O Ponto entra numa órbita em volta de 'giram': elipse no centro do bbox da palavra, rx = largura/2 + 48, ry 78, rot −6°, hairline lavanda α .3. Período de 2 s.

0,5: 'range'. G2 fica 7° fora de fase e as duas desaceleram até 0 em 0,35 s (power3.out).

Rangidos em 1,0 / 1,5 / 2,0 / 2,5 / 3,0:
- G1 faz keyframes [+5°, −3°, +2°, 0] em 0,14 s; G2 faz o mesmo com o sinal oposto.
- 5 faíscas #E249B0 (r 3) saem de (1600,390): raio de 20 a 46 px, fade de 0,3 s, ângulos via h.rng(índice da batida).

3,5–3,8: bloco A desaba e a órbita de 'giram' colapsa. O Ponto vai para (1100,640).

4,0: tranco forte de ±9°, com 10 faíscas e h.shake(root, amp 3, 0,25 s).

4,5: 'falta engenharia.'. O Ponto pousa como o '.' de 'engenharia.', com r 16.

4,5–6,0: PLANTA TÉCNICA
- bg.grid 0→.25.
- Círculos primitivos tracejados r 90, 1 px, rgba(167,139,250,.5), dash 4/6. DrawSVG de 4,5 a 5,0.
- Linha entre os centros com 5 ticks e miras de ±18 px nos centros (5,0).
- Lente de interferência: interseção dos círculos de ponta, preenchida com #E249B0 α .25 (5,0–5,5).

6,0–7,5
- A lente pulsa (α .25↔.45) a cada batida.
- As engrenagens continuam travadas, só com vibração de ±1,5°.
- Push lento do texto (1→1,02).

7,5–8,0: MORPH
- A rotação vai para o múltiplo de 30° mais próximo.
- MorphSVG de 0,5 s (mecca.inOut):
  - G1 vira um retângulo arredondado de x 192 a 946, y 250 a 850, raio 28;
  - G2 vira um retângulo de x 972 a 1726, y 250 a 850;
  - ambos com stroke rgba(167,139,250,.3), 1,5 px, dash 8/10, sem fill.
- A planta técnica some e bg.grid volta a 0.
- O Ponto sai do '.' e voa para (1625,690).

**Transição de saída:** Morph: as duas engrenagens emperradas viram as duas caixas do mercado. Tail 0.

ÚLTIMO QUADRO:
- Dois retângulos tracejados (x 192–946 e 972–1726, y 250–850, r 28, stroke rgba(167,139,250,.3), dash 8/10).
- Eyebrow 'O PROBLEMA'.
- Ponto em (1625,690) com r 16.
- bg padrão, grid 0.
- Nenhum outro texto.

**Cues de som** (tempo local): 0s whoosh (.3); 0.5s glitch (trava .4); 1s glitch (rangido .25); 1.5s click (.35); 2s glitch (.25); 2.5s click (.35); 3s glitch (.25); 3.5s whoosh (letras desabam .3); 4s impact (esforço .5 (+glitch .5)); 4.5s click (Ponto pousa .6); 5s tick (caneta técnica .4); 5.5s tick (.3); 7.75s whoosh (morph .5)

## Cena ANTERIOR (contexto para a transição de entrada — outra pessoa implementa)
### s01-toda-empresa — Toda empresa é uma máquina
- início global: 0 s · duração: 6 s · tail (sobreposição após o fim): 0 s
- objetivo: Gancho frio: apresentar o mundo escuro, o Ponto (os mecca) e a premissa da marca 'Toda empresa é uma máquina.'.

**Texto na tela** (tempos relativos à cena):
- [0.5–6 s] «O PROBLEMA» — estilo: h.eyebrow JetBrains Mono 500 22 px #A78BFA, tracking .22em, com traço, em (192,120) âncora cl — animação: Digitação a 0,025 s/char a partir de 0,5. Continua visível até o fim e segue idêntica na S02.
- [1–5.5 s] «Toda empresa é uma» — estilo: Space Grotesk 700, 88 px, #FBF8FF, x 192, baseline 400 (linha ≈ 809 px) — animação: Palavras por máscara (yPercent 110→0, 0,5 s, mecca.out): 'Toda empresa' em 1,0 e 'é uma' em 1,5. Saída em 5,5–5,8: chars yPercent 0→−110, stagger .015, mecca.in.
- [2–5.5 s] «máquina.» — estilo: Space Grotesk 700, 330 px, <em> gradiente #C026D3→#7C3AED, x 180, baseline 740 (≈1370 px, até x≈1550). O glifo '.' fica com color transparent: o Ponto ocupa o lugar dele. — animação: Chars yPercent 105→0, stagger .025, 0,55 s expo.out; o wrapper faz scaleX 1,06→1 no mesmo intervalo. Saída igual à linha de cima (5,5–5,8).

**Layout:** PRIMEIRO QUADRO: tela só com o fundo em #120720 (glowA/B/C = 0, particles 0), sem texto; Ponto com escala 0 em (960,540).

Composição:
- Bloco tipográfico alinhado à esquerda, com contraste de escala 88 × 330 px.
- Grid editorial: 13 linhas verticais hairline rgba(255,255,255,.05) em x = 192 + 128·k (k = 0…12), de y 72 a 1008, mais duas horizontais em y 72 e 1008.
- Órbita que abraça 'máquina.': centro (930,640), rx 820, ry 170, rot −6°, lavanda α .3, 1,5 px. Usa dois canvases: o de trás fica abaixo do texto e o da frente acima.
- Posição do '.' de 'máquina.': medir em build() com getBoundingClientRect do último char após o split. Fallback ≈ (1520,725).

**Visuais:** Fundo escuro que acende devagar.

O Ponto:
- núcleo #FBF8FF com glow lavanda;
- pulsa a cada batida;
- vira o ponto final da frase.

Grid editorial fino. A órbita elíptica em volta de 'máquina.' tem dois riders: magenta #C026D3 com r 5 e lavanda #A78BFA com r 4. Eles são as peças da máquina, que na S02 viram engrenagens.

**Coreografia:** 0,0
- bg.glowA/B/C 0→1 (0,0–3,0, sine.inOut). bg.particles 0→1 (0,0–4,0).
- O Ponto nasce em (960,540) com r 8 (scale 0→1, 0,3 s, mecca.back).
- Pulso a cada batida 0,5 / 1,0 / 1,5 / 2,0: scale 1→1,5→1 em 0,25 s.

0,5–1,5: grid editorial desenha com DrawSVG de cima para baixo (stagger .03, 0,8 s, mecca.inOut). As horizontais crescem do centro.

1,0 / 1,5: entram as palavras de H2.

2,0: entra 'máquina.'.

2,5–3,0: o Ponto voa em arco até a posição do '.' (MotionPath, curviness 1,5, mecca.inOut).

3,0: pouso.
- Squash scaleX 1,5 / scaleY 0,6 → 1 (elastic.out(1,.5), 0,4 s).
- r passa a 22.

3,0–4,5: a órbita se desenha (from 0→1, mecca.inOut).

4,0: surgem os dois riders (período 4 s, fases 0° e 180°, rider magenta começando em 0°).

1,0–5,5: push lento no grupo de texto (scale 1→1,03, linear).

5,0: grid editorial → α .03.

**Transição de saída:** Colapso para dentro do mecanismo. Tail 0.

5,5–6,0:
- O texto sai por máscara para cima.
- A órbita encolhe (rx 820→0, ry 170→0) em direção a (1600,390), power3.in.
- O rider magenta voa até (1600,300) e o lavanda até (1600,480), ambos com r 5→14 (power3.inOut).
- O Ponto sai do '.' e vai para (1000,540), com r 22→10.
- O grid editorial vai a α 0.

ÚLTIMO QUADRO:
- Fundo padrão (glow 1, particles 1, grid 0, warp 0).
- Eyebrow 'O PROBLEMA' em (192,120).
- Disco #C026D3 com r 14 em (1600,300) e disco #A78BFA com r 14 em (1600,480).
- Ponto em (1000,540) com r 10.
- Nenhum outro texto.

**Cues de som** (tempo local): 0s tick (primeira batida no escuro, ganho .6); 1s click (.3); 1.5s click (.3); 2s impact ('máquina.' .6); 3s click (Ponto pousa como ponto final .8); 4s chime (riders .25); 5.75s whoosh (colapso .7)

## Cena SEGUINTE (contexto para a transição de saída — outra pessoa implementa)
### s03-duas-caixas — O mercado te dá duas caixas
- início global: 14 s · duração: 10 s · tail (sobreposição após o fim): 0 s
- objetivo: Mostrar as duas soluções do mercado. Caixa 1 (agência) executa a peça e some; caixa 2 (consultoria) entrega o slide e some. As duas somem na hora H e a energia cai: só sobra o Ponto.

**Texto na tela** (tempos relativos à cena):
- [0–9.5 s] «O PROBLEMA» — estilo: h.eyebrow 22 px em (192,120) — animação: Já visível no quadro 0. Saída junto com T2 (9,5–9,8).
- [0–5.5 s] «O mercado te dá / duas caixas.» — estilo: 'O mercado te dá' em Space Grotesk 700, 96 px, ink, x 192, baseline 420. 'duas caixas.' em Space Grotesk 700, 260 px, ink ('duas' em #C4B5FD), x 192, baseline 700 (≈1455 px). Depois de 1,0 as duas linhas viram um header de uma linha: Space Grotesk 700, 44 px, centrado em x 960, baseline 196. — animação: Slam por máscara (0,5 s, mecca.out; linhas com stagger .12). FLIP em 1,0–1,5 (mecca.inOut): as linhas grandes encolhem e sobem para o header, com crossfade. O header sai em 5,5–5,8.
- [1–4.5 s] «CAIXA 1 — AGÊNCIA» — estilo: JetBrains Mono 500, 22 px, tracking .2em, #A78BFA, tl em (240,300) — animação: Digitação (0,3 s). Sai quando a caixa fecha.
- [1–4.5 s] «Executa a peça / e some.» — estilo: Space Grotesk 700, 84 px, ink, x 240, baselines 690 / 790. 'e some.' em muted #A99CC4. — animação: Máscara por linha, stagger .12, 0,5 s. Em 3,0, 'e some.' pisca em steps (1→.3→1→.3→1, 0,3 s). Em 4,5, 'some.' EVAPORA (y −24, blur 0→6 px, α→0, stagger .03 por char, 0,3 s) e o resto sai por máscara.
- [1.5–5 s] «CAIXA 2 — CONSULTORIA» — estilo: JetBrains Mono 500, 22 px, #A78BFA, tl em (1020,300) — animação: Digitação (0,3 s).
- [1.5–5 s] «Entrega o slide / e some.» — estilo: Space Grotesk 700, 84 px, ink, x 1020, baselines 690 / 790. 'e some.' em #A99CC4. — animação: Igual à caixa 1. Pisca em 3,5. 'some.' evapora em 5,0.
- [6–9.5 s] «As duas somem / na hora H.» — estilo: Space Grotesk 700, 180 px, ink, x 192. Linha 1 com baseline 500 (≈1257 px), com 'somem' em #A99CC4. Linha 2 com baseline 700 (≈809 px). O '.' de 'H.' é transparente: é o Ponto. — animação: SLAM: yPercent 100→0, 0,35 s, expo.out, linhas com stagger .1. h.shake(root, amp 6). Em 6,0–9,5, push lento (1→1,03) e os chars de 'somem' tremulam (α .85–1). Em 9,5–9,85, as letras de 'somem' somem uma a uma (s-o-m-e-m, stagger .07, scaleY→0 e fade de 0,15 s). O resto sai em 9,6–9,9 (fade com y −10).

**Layout:** PRIMEIRO QUADRO: igual ao último da S02 (dois retângulos tracejados, eyebrow, Ponto em (1625,690) com r 16).

Split editorial em dois cards:
- Card 1: x 192–946, y 250–850, raio 28.
- Card 2: x 972–1726, y 250–850, raio 28.

Conteúdo dos cards:
- Labels mono no topo, em y 300.
- Ilustrações em line art:
  - 'peça' (um post): tl (240,372), 260×188, raio 14. Tem área de imagem de 228×112 com montanha (polyline) e sol (r 12), mais duas barras de texto hairline em y 524 e 544 (larguras 180 e 120).
  - 'slide' (16:9): tl (1020,372), 320×180. Tem barra de título hairline, 3 barras de largura 36 com alturas 48 / 82 / 120 e base em y 530, e uma linha de tendência hairline.
- Títulos com baselines 690 / 790.

O header 'O mercado te dá duas caixas.' fica centrado com baseline 196, acima dos cards.

**Visuais:** Os cards solidificam:
- fill #241038 α .9;
- borda lavanda sólida rgba(167,139,250,.5);
- line art lavanda de 2 px.

As ilustrações flutuam. Ao fechar, as caixas colapsam, os objetos ficam sozinhos flutuando e depois se fatiam em tiras. No fim a energia cai e só sobra o Ponto no escuro.

**Coreografia:** 0,0: slam de T1. O Ponto é o '.' de 'caixas.' (≈1625,690).

1,0–1,5: FLIP de T1 para o header. O Ponto vira o '.' do header, com r 4.

1,0 — caixa 1 solidifica:
- fill α 0→.9 (0,3 s);
- dash 8/10 → sólido;
- label digitado;
- ilustração com DrawSVG 0→100% (0,5 s);
- títulos por máscara.

1,5: caixa 2, com a mesma coreografia.

1,5–4,5: as ilustrações flutuam (±4 px, seno de 2 s) e as bordas fazem shimmer.

4,5 — caixa 1 fecha:
- o retângulo faz scaleY 1→.01 em torno de y 550 (0,3 s) e depois scaleX →0 (0,15 s), mecca.in;
- os textos saem;
- a peça fica sozinha e sobe 16 px.

5,0: caixa 2 fecha e o slide fica sozinho.

5,5–5,8
- Peça e slide são fatiados em 5 tiras horizontais (clip-path): deslocam ±24 px em 0,12 s e somem (scale 0, 0,2 s).
- O header sai.
- O Ponto se solta do header e vai para (990,690) até 6,0.

6,0: slam de T2 com shake. O Ponto é o '.' de 'H.', com r 14.

9,0–10,0: a energia cai.
- bg.dim 0→.5
- vignette .55→.75
- glowA/B 1→.6
- particles 1→.5

9,5–9,9: 'somem' some letra por letra e o resto de T2 sai. Só o Ponto fica aceso, pulsando uma vez em 9,5.

**Transição de saída:** Blackout motivado: tudo some e o Ponto final é o único sobrevivente. Tail 0.

ÚLTIMO QUADRO:
- Sem texto.
- Só o Ponto em (990,690), com r 14.
- bg: dim .5, vignette .75, glowA/B .6, particles .5, grid 0.

**Cues de som** (tempo local): 0s impact (slam T1 .7); 1s click (caixa 1 .5 (+whoosh .35)); 1.5s click (caixa 2 .5); 3s glitch (pisca .15); 3.5s glitch (.15); 4.5s click (caixa 1 fecha .7); 4.5s sub-drop (.35); 5s click (caixa 2 fecha .7); 5.5s glitch (fatiamento .7); 6s impact ('As duas somem na hora H.' 1.0); 9s sub-drop (energia cai .5); 9.5s glitch ('somem' some .3)

