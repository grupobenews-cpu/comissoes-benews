# Cena 6/10: s06-plano-de-voo

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
### s06-plano-de-voo — O plano de voo: quatro tempos
- início global: 42 s · duração: 12 s · tail (sobreposição após o fim): 0 s
- objetivo: O método em 4 tempos: Diagnóstico, Engenharia, Operação e Escala. A órbita se deita e vira a linha do tempo; o Ponto é a sonda. No fim, o Ponto gira sozinho e a linha se fecha em círculo.

**Texto na tela** (tempos relativos à cena):
- [0–11.5 s] «O PLANO DE VOO» — estilo: h.eyebrow 22 px em (192,120) — animação: Digitação a partir de 0,0.
- [0.5–11.5 s] «Quatro tempos» — estilo: Space Grotesk 700, 180 px, ink, x 192, baseline 380 (≈1210 px). Depois vira header de 56 px com baseline 200. — animação: Chars stagger .02, 0,5 s, mecca.out. FLIP para header em 2,5–3,0 (mecca.inOut). Saída em 11,5.
- [1–11.5 s] «até a máquina girar sozinha.» — estilo: Space Grotesk 500, 60 px, #C4B5FD, x 192, baseline 470 ('girar sozinha' em <em>). Depois vira header de 26 px com baseline 240. — animação: Máscara. FLIP em 2,5–3,0. Saída em 11,5.
- [3–11.5 s] «01 · Diagnóstico — Abrimos a máquina e achamos qual engrenagem travou o crescimento.» — estilo: Número '01' em Bricolage 800, 120 px, gradiente, x 192, baseline 540. Nome em Space Grotesk 700, 56 px, ink, x 192, baseline 660. Descrição em Inter 500, 28 px, #C4B5FD, largura 360, lh 1,35, 1ª baseline 712. — animação: O número sobe de trás da linha (máscara com base em y 572, yPercent 100→0, 0,45 s, expo.out). O nome é revelado por uma linha de varredura (2 px lavanda, altura 70, 0,35 s, clip). A descrição entra em 3,5 (linhas com y 16→0 e fade, stagger .06, 0,4 s).
- [4.5–11.5 s] «02 · Engenharia — Montamos o que falta: processo, time, ferramenta e número.» — estilo: Mesmos estilos, x 582 — animação: Número sobe. Os chars do nome caem de y −30 (mecca.back, stagger .025) e 4 marcas de corte em L de 12 px se desenham em volta. Descrição em 5,0.
- [6–11.5 s] «03 · Operação — Os mecca assumem as rotinas e operam por dentro.» — estilo: Mesmos estilos, x 972 — animação: Número sobe. Os chars do nome sobem. Uma mini engrenagem (r 14, 8 dentes, lavanda) aparece 24 px depois do nome, na altura de y 642, e gira a 90°/s, com 3 pontinhos (r 2,5, #C4B5FD / #A78BFA / #C026D3) orbitando (rx 30, ry 10). Descrição em 6,5.
- [7.5–11.5 s] «04 · Escala — Tudo engrenado e medido, o crescimento vira previsível.» — estilo: Mesmos estilos, x 1362 (a descrição termina em x ≤ 1722) — animação: Número sobe. O nome cresce a partir da base (scaleY 0→1, origin 50% 100%, stagger .04) e uma escadinha de 3 degraus (hairline lavanda) se desenha depois da palavra. Descrição em 8,0.

**Layout:** PRIMEIRO QUADRO: igual ao último da S05 (elipse com centro (960,600), rx 780, ry 120; Ponto em (180,600) com r 10; sem texto).

Depois de 3,0:
- Header no topo-esquerdo: eyebrow em y 120, 'Quatro tempos' com baseline 200, subtítulo com baseline 240.
- Linha do tempo em y 580, de x 192 a 1728.
- 4 colunas com passo de 390 (x 192 / 582 / 972 / 1362). Guias hairline α .05 de y 440 a 900.
- Nós em (192,580), (582,580), (972,580) e (1362,580).
- Números acima da linha, nomes e descrições abaixo.

**Visuais:** Clima de planta técnica: bg.grid .35.

A linha do tempo fica tracejada à frente do Ponto (lavanda α .35, dash 6/10) e sólida atrás dele (gradiente de 3 px).

Nós: r 10, fill #7C3AED, anel lavanda de 2 px, halo que expande.

O Ponto é a sonda. No fim ele gira num círculo pequeno no fim da linha: a máquina gira sozinha.

**Coreografia:** 0,0–1,5
- bg.grid 0→.35 (0,5–1,5).
- O Ponto percorre a elipse (período 2 s, começando em 180°), com 2 riders (#C026D3 r 5 e #A78BFA r 4) a 120° e 240°.

2,5–3,0: A ÓRBITA SE DEITA
- ry 120→0, rx 780→768, centro (960,600)→(960,580), mecca.inOut. A elipse vira a linha de x 192 a 1728.
- Os riders somem.
- O Ponto desliza até (192,580).
- Header FLIP.

TEMPOS em 3,0 / 4,5 / 6,0 / 7,5:
- O Ponto viaja até o nó (de T−0,4 a T, mecca.inOut) e o trecho percorrido fica sólido.
- No tempo T:
  - o nó aparece (r 0→10, mecca.back, 0,3 s);
  - halo r 10→48 com α .6→0;
  - o número sobe;
  - a micro-animação do nome roda.
- Em T+0,5 entra a descrição.
- As colunas anteriores ficam em α 1; os nomes anteriores vão para α .7.

8,0–8,5: o Ponto vai até o fim da linha (1728,580) e o último trecho fica sólido.

8,5–11,5: o Ponto gira num círculo r 22 com centro (1706,580), 1 volta/s.

9,5 / 9,75 / 10,0 / 10,25: os 4 nós pulsam em sequência (scale 1→1,5→1, 0,2 s).

**Transição de saída:** A linha do tempo se fecha em círculo, que na S07 ganha dentes. Tail 0.

11,5–12,0:
- Números afundam na linha. Nomes, descrições, header e eyebrow saem (0,3 s, mecca.in, stagger .03).
- bg.grid .35→.2.
- A linha é uma polyline de 64 pontos. O ponto i vai de (192 + i·1536/63, 580) para (960 + 300·cos(π − i·2π/63), 540 + 300·sin(π − i·2π/63)), de 11,4 a 12,0 (power3.inOut). A linha fica toda sólida em gradiente de 3 px.
- O Ponto vai na ponta e fecha o laço em (660,540).

ÚLTIMO QUADRO:
- Círculo sólido (gradiente #C026D3→#7C3AED, 3 px) com centro (960,540) e r 300.
- Ponto em (660,540) com r 10.
- bg.grid .2.
- Sem texto.

**Cues de som** (tempo local): 0s impact (.6); 2.75s whoosh (órbita deita .4); 3s click (tempo 01 .8 (+impact .4)); 4.5s click (tempo 02 .8); 6s click (tempo 03 .8); 6.5s chime (mini engrenagem .3); 7.5s click (tempo 04 .8 (+impact .5)); 8.5s chime (gira sozinha .6); 9.5s tick (pulsos .35); 10s tick (.35); 11.75s whoosh (linha → círculo .6)

## Cena ANTERIOR (contexto para a transição de entrada — outra pessoa implementa)
### s05-por-dentro — A gente entra por dentro
- início global: 34 s · duração: 8 s · tail (sobreposição após o fim): 0 s
- objetivo: O que a Meccanismo faz. Entra por dentro do negócio, monta as engrenagens que faltam e fica operando o motor. O Ponto se divide nos 4 mecca (time embarcado), que instalam as peças que faltam. O trem de engrenagens gira saudável pela primeira vez.

**Texto na tela** (tempos relativos à cena):
- [0.5–7.5 s] «ENGENHARIA DE CRESCIMENTO» — estilo: h.eyebrow 22 px #A78BFA em (192,120) — animação: Digitação. Saída em 7,5.
- [0.5–7.5 s] «A gente entra / por dentro do seu negócio,» — estilo: Space Grotesk 700, 60 px, ink, x 192, baselines 290 / 360, largura máx. 880 ('por dentro' em <em> gradiente) — animação: Máscara por linha (0,6 s, mecca.out, stagger .08). Em 2,0 cai para α .5 (0,3 s). Saída em 7,5–7,8: x −40, fade, mecca.in.
- [2–7.5 s] «monta as engrenagens / que faltam —» — estilo: Space Grotesk 700, 60 px, ink, x 192, baselines 460 / 530 ('monta' em <em>) — animação: Máscara por linha. Em 4,0 cai para α .5.
- [4–7.5 s] «e fica operando o motor / com você.» — estilo: Space Grotesk 700, 60 px, ink, x 192, baselines 630 / 700 ('fica operando' em <em>) — animação: Máscara por linha.
- [5–7.5 s] «TIME EMBARCADO · OS MECCA» — estilo: h.chip 20 px, tl em (192,760) — animação: Pop: scale .85→1 e fade, 0,3 s, mecca.back.

**Layout:** PRIMEIRO QUADRO: igual ao último da S04 (fundo com warp 1 e speed 3, Ponto em (1520,463) com r 6, nada mais).

Texto à esquerda, de x 192 a ≈1070.

À direita, a máquina do cliente: trem de 5 engrenagens (h.gear, mesma altura de dente; distância entre centros = r1 + r2 − 0,2·r1).

| engrenagem | centro | r | dentes | estado inicial |
|---|---|---|---|---|
| Ga | (1180,600) | 90 | 12 | existente, stroke slate #64748B α .6, fill #1A0B2E |
| Gb | (1320,519) | 90 | 12 | FALTA |
| Gc | (1500,585) | 120 | 16 | FALTA, é o motor |
| Gd | (1578,450) | 60 | 8 | FALTA |
| Ge | (1714,426) | 90 | 12 | existente, slate |

As faltantes aparecem como círculos primitivos tracejados, lavanda α .35, dash 4/6.

A máquina ocupa x 1090–1804 e y 336–705.

Órbita dos mecca: centro (1450,520), rx 380, ry 130, rot −14°.

**Visuais:** Interior em planta técnica. Duas engrenagens velhas em slate e três encaixes vazios tracejados, com um '×' rosa no centro de cada vazio.

O Ponto faz o diagnóstico e depois explode em 4 mecca: núcleo #FBF8FF com r 7 e halo #E249B0 α .5. Os mecca trazem as engrenagens novas (fill #241038, stroke gradiente #C026D3→#7C3AED, 2,5 px) e recalibram as velhas (slate → lavanda).

O motor liga e o trem inteiro gira. Os 4 mecca ficam em órbita com rastros.

**Coreografia:** 0,0–0,6: bg.warp 1→0, speed 3→1 (expo.out).

0,0–1,0: a máquina aparece.
- Ga e Ge: scale .9→1, α 0→1.
- Encaixes tracejados: DrawSVG de 0,3 a 1,0.

0,0–0,5: o Ponto (r 6→10) vai de (1520,463) até (1320,300).

0,5–2,0: DIAGNÓSTICO
- O Ponto percorre um MotionPath pelos centros vazios: Gb em 0,9, Gc em 1,3, Gd em 1,7.
- Em cada um, um '×' rosa #E249B0 pulsa (scale 0→1→.8, 0,25 s).
- Termina em (1450,250) em 2,0.

2,0: o Ponto se DIVIDE em 4 mecca (burst de 0,3 s com mecca.back, 90° entre eles, raio 40).

2,5 / 3,0 / 3,5: os mecca 1, 2 e 3 voam (0,4 s, power3.inOut) até Gb, Gc e Gd.
- Cada engrenagem nasce do mecca: scale 0→1 e rotação −90°→fase correta, mecca.gear, 0,45 s, terminando na batida.
- A fase segue θB = ψ + 180° + 180°/NB − (NA/NB)·(θA − ψ) em relação à vizinha já posta, para dente cair em vão.
- Anel de faísca r→r + 40, α .6→0, 0,35 s.

3,5–4,0: o mecca 4 toca Ga e Ge. O stroke delas vai de slate para #A78BFA (0,4 s).

4,0: MOTOR
- Gc: ω 0→+60°/s em 0,6 s (power2.out). Hub de Gc acende #7C3AED.
- As demais engrenagens pela razão de dentes: Gb −80°/s, Ga +80°/s, Gd −120°/s, Ge +80°/s.
- Onda saindo de Gc: r 120→220, α .6→0, 0,5 s.

4,5–7,5: os 4 mecca entram na órbita (1450,520; rx 380, ry 130, rot −14°).
- Período de 4 s, fases 0/90/180/270°.
- Rastros de 6 amostras.
- Na metade de trás passam atrás das engrenagens, com α .5.

De 1,0 a 7,5, push lento do texto (1→1,02).

**Transição de saída:** A máquina do cliente recua e a órbita vira o plano de voo. Tail 0.

7,5–8,0:
- O texto sai.
- O trem de engrenagens encolhe para o próprio centro (scale 1→.5, α→0, mecca.in).
- Os 4 mecca convergem num único Ponto.
- A órbita faz tween de (1450,520; rx 380; ry 130; −14°) para (960,600; rx 780; ry 120; 0°), mecca.inOut, com o Ponto no ponto mais à esquerda.

ÚLTIMO QUADRO:
- Só a elipse hairline lavanda α .3 com centro (960,600), rx 780, ry 120, rot 0.
- Ponto em (180,600) com r 10.
- bg padrão, grid 0.
- Sem texto.

**Cues de som** (tempo local): 0s impact (chegada .6); 0.9s tick (diagnóstico .4); 1.3s tick (.4); 1.7s tick (.4); 2s chime (divide em 4 mecca .5); 2.5s click (engrenagem montada .7); 3s click (.7); 3.5s click (.7); 4s impact (motor liga .8); 4s sub-drop (.4); 5s click (chip .4); 7.75s whoosh (.5)

## Cena SEGUINTE (contexto para a transição de saída — outra pessoa implementa)
### s07-sete-engrenagens — Uma máquina. Sete engrenagens. Um só mecanismo.
- início global: 54 s · duração: 22 s · tail (sobreposição após o fim): 0 s
- objetivo: Os serviços. Cada uma das 7 engrenagens aparece no downbeat de um compasso com nome, apelido e 3 serviços-chave. A coluna de texto é uma cremalheira movida pela engrenagem gigante. O fechamento monta a máquina inteira: os 7 planetas em volta de um sol com a pupila no cubo e uma carcaça feita dos arcos do ícone. 'Uma máquina. Sete engrenagens. Um só mecanismo.'

**Texto na tela** (tempos relativos à cena):
- [0.5–16 s] «O ALCANCE · A MÁQUINA INTEIRA» — estilo: h.eyebrow 22 px #A78BFA em (192,1000), âncora cl (rodapé, porque o topo recebe a estação anterior) — animação: Digitação. Saída em 16,0–16,3.
- [2–6 s] «01 / 07 · Vendas · Engrenagem do fechamento · [PLAYBOOK DE VENDAS] [PROSPECÇÃO ATIVA (SDR)] [CRM OPERADO]» — estilo: Bloco de estação, ativo com o topo em y 360:
- contador '01 / 07' em JetBrains Mono 500, 24 px, #A78BFA, baseline 400;
- nome em Space Grotesk 700, 150 px, ink, baseline 575;
- apelido em Inter 500, 38 px, #C4B5FD, baseline 635;
- chips h.chip (JetBrains Mono 500, 18 px, CAIXA ALTA, tracking .14em, altura 44, gap 12) numa linha a partir de x 192, com topo em y 668; se a linha passar de 940 px, quebra para y 724. — animação: Cremalheira: o bloco sobe de +360 para 0 em T−0,35→T+0,15 (mecca.gear), α 0→1. Os chips SAEM DO PONTO: MotionPath de (1180,540) até a posição final, curviness 1,2, scale .6→1, stagger .05, 0,45 s, mecca.out, a partir de T. Em T+2, o bloco sobe para −360 com α →.4, e o contador vai a α 0. Em T+4, sobe para −720 com α →0.
- [4–8 s] «02 / 07 · Marketing · Engrenagem da demanda · [TRÁFEGO PAGO] [CONTEÚDO & SOCIAL] [SEO]» — estilo: Mesmo bloco de estação — animação: Mesmo ciclo, com T = 4,0.
- [6–10 s] «03 / 07 · Comercial · Engrenagem das regras do jogo · [PRICING & MARGEM] [CANAIS & PARCERIAS] [RETENÇÃO & CS]» — estilo: Mesmo bloco de estação — animação: T = 6,0.
- [8–12 s] «04 / 07 · Fiscal · Engrenagem da conformidade eficiente · [PLANEJAMENTO TRIBUTÁRIO] [COMPLIANCE FISCAL] [EMISSÃO DE NF-E]» — estilo: Mesmo bloco de estação — animação: T = 8,0.
- [10–14 s] «05 / 07 · Logística · Engrenagem da entrega · [ESTOQUE & COMPRAS] [FRETES] [FULFILLMENT & EXPEDIÇÃO]» — estilo: Mesmo bloco de estação — animação: T = 10,0.
- [12–16 s] «06 / 07 · Sistemas · Engrenagem do sistema nervoso · [PROCESSOS & SOPS] [ERP / CRM] [BI & DASHBOARDS]» — estilo: Mesmo bloco de estação — animação: T = 12,0. Sai junto com todos em 16,0–16,3 (y −60, α→0).
- [14–16.5 s] «07 / 07 · Tecnologia · Engrenagem digital · [SOFTWARE SOB MEDIDA] [SITES & E-COMMERCE] [IA APLICADA]» — estilo: Mesmo bloco de estação — animação: T = 14,0. Fica ativo até 16,25. Saída em 16,25–16,5 (y −60, α→0, mecca.in).
- [17–21.5 s] «Uma máquina.» — estilo: Space Grotesk 700, 88 px, ink, x 192, baseline 420 — animação: Máscara, 0,6 s, mecca.out. Saída em 21,5–21,75 por máscara para cima.
- [17.5–21.5 s] «Sete engrenagens.» — estilo: Space Grotesk 700, 88 px, ink, x 192, baseline 530 (≈745 px) — animação: Máscara.
- [18–21.5 s] «Um só mecanismo.» — estilo: Space Grotesk 700, 88 px, x 192, baseline 640, 'mecanismo.' em <em> gradiente — animação: Máscara. Shimmer do gradiente em 19,0–20,5.

**Layout:** PRIMEIRO QUADRO: igual ao último da S06 (círculo em gradiente com centro (960,540) e r 300; Ponto em (660,540) com r 10; grid .2).

Engrenagem gigante (h.gear):
- centro (1640,540), r 420, 28 dentes (4 por estação), depth .08, raio primitivo ≈ 401;
- fill #1A0B2E α .8, stroke #A78BFA α .5, 2 px;
- anel interno r 300 hairline e 7 raios hairline;
- borda esquerda em x 1220; o resto é recortado pela direita.

Números '01'–'07' na engrenagem:
- Bricolage 800, 56 px, #A78BFA α .6, no raio 330, sempre em pé (contra-rotação);
- número k no ângulo 180° − 51,43°·k + θ (ângulos em sentido horário, 0° = +x);
- o número ativo fica às 9 horas, em (1310,540), com ink e scale 1,15.

Cubo: h.icon de 200 px SEM ponto, no centro da engrenagem.

O Ponto fica 'estacionado' em (1180,540).

Coluna de texto (cremalheira):
- clip x 150–1160, y 72–800;
- bloco ativo com topo em y 360;
- bloco anterior em y 0 (nome com baseline 215), α .4.

Fechamento:
- sol em (1400,560);
- carcaça = arcos do ícone (h.icon de 710 px centrado em (1400,560), só arcOuter + arcInner, raio 330, stroke ≈ 50);
- texto à esquerda, x 192–937.

**Visuais:** Uma engrenagem gigante recortada gira como um escape de relógio, uma estação (51,43°) por compasso. O lado esquerdo dela sobe e empurra a coluna de texto para cima (cremalheira). O passo de 360 px corresponde ao arco de 51,43° no raio primitivo de 401.

A cada estação, o Ponto pulsa e cospe os 3 chips de serviço.

No fechamento, a engrenagem encolhe e vira o SOL de um planetário:
- 7 planetas nomeados;
- pupila no cubo;
- carcaça feita dos arcos do ícone;
- o Ponto orbita tudo.
A máquina lembra o logo, mas continua sem o ponto.

**Coreografia:** 0,0–1,0: o círculo viaja de (960,540) r 300 para (1640,540) r 401 (mecca.inOut). O Ponto acompanha o ponto mais à esquerda, chegando a (1239,540).

1,0–1,5
- MorphSVG do círculo para h.gearPath (r 420, 28 dentes, depth .08), mecca.back.
- O stroke faz crossfade de gradiente para lavanda α .5.
- Os números fazem pop (stagger .05).
- O cubo-ícone escala 0→1 (1,25, mecca.back).
- O Ponto vai para (1180,540).

CICLO DE ESTAÇÃO (T = 2, 4, 6, 8, 10, 12, 14):
- T−0,35→T+0,15: a engrenagem gira de θ = 51,43·(k−1) para 51,43·k em sentido horário (mecca.gear: overshoot e assentamento). A coluna de texto translada −360 px com o mesmo easing e o mesmo intervalo: é a cremalheira.
- T−0,1: o contador vira como split-flap (0,25 s).
- T: número ativo em ink com scale 1,15; o anterior volta a α .6. O Ponto pulsa (r 10→16→10) e solta os chips.

16,0–17,0: RECUO
- Números, raios e anel interno fazem fade (16,0–16,3).
- A engrenagem vai de (1640,540) com r 420 para (1400,560) com r 130 (scale .31, mecca.inOut).
- Os arcos do cubo-ícone somem e fica só a pupila, com 110 px de largura, no centro do sol.
- bg.grid .2→0.

16,5–17,25: 7 PLANETAS
- h.gear com r 78, 16 dentes, depth .13, sem furo.
- Fill alternado #241038 / #2D1149, stroke #A78BFA 1,5 px.
- Saem do centro do sol até a distância 198, nos ângulos −90° + (k−1)·51,43° (stagger .06, mecca.back).
- Posições:

  | planeta | centro |
  |---|---|
  | Vendas | (1400,362) |
  | Marketing | (1555,437) |
  | Comercial | (1593,604) |
  | Fiscal | (1486,738) |
  | Logística | (1314,738) |
  | Sistemas | (1207,604) |
  | Tecnologia | (1245,437) |

- Cada planeta leva o seu nome em pé no centro (Space Grotesk 600, 18 px, ink).
- Fase de cada planeta pela fórmula de engrenamento com o sol.

17,0–17,75: a carcaça (arcos do ícone de 710 px) se desenha com DrawSVG 0→100% (mecca.out).

18,0: TUDO ENGRENA
- Sol +36°/s (horário), planetas −63°/s, carcaça −12°/s.
- Onda de choque r 350→900, α .5→0.
- Um destaque magenta percorre os planetas de um em um (0,12 s cada).
- O Ponto passa a orbitar a máquina num círculo r 390 em volta de (1400,560), período de 3 s, com rastro.
- bg.particles 1→1,3.

**Transição de saída:** A máquina completa encolhe e se afasta para dar espaço às rotinas. Tail 0.

21,5–22,0:
- O texto sai.
- Os nomes dos planetas fazem fade.
- A máquina inteira (sol, planetas e carcaça) vai de (1400,560) com scale 1 para (1300,580) com scale .55 (mecca.inOut), sem parar de girar.
- O Ponto sai da órbita e vai para o cubo (1300,580), com r 10.
- bg.particles volta a 1.

ÚLTIMO QUADRO:
- Máquina em (1300,580), scale .55 (carcaça r ≈ 181), girando nas mesmas velocidades, sem nomes.
- Ponto em (1300,580) sobre a pupila.
- bg padrão, grid 0.
- Sem texto.

**Cues de som** (tempo local): 0s whoosh (.4); 1s impact (dentes nascem .8); 1.25s chime (.3); 2s click (Vendas 1.0 (+impact .35)); 4s click (Marketing 1.0); 6s click (Comercial 1.0); 8s click (Fiscal 1.0); 10s click (Logística 1.0); 12s click (Sistemas 1.0); 14s click (Tecnologia 1.0); 14s impact (.6); 16.5s whoosh (planetas .6); 17s whoosh (carcaça .5); 18s impact (tudo engrena 1.0); 18s chime (.7); 21.75s whoosh (.5)

