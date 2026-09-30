# Cena 7/10: s07-sete-engrenagens

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

## Cena ANTERIOR (contexto para a transição de entrada — outra pessoa implementa)
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

## Cena SEGUINTE (contexto para a transição de saída — outra pessoa implementa)
### s08-rotinas — O que gira por dentro
- início global: 76 s · duração: 6 s · tail (sobreposição após o fim): 0 s
- objetivo: Operação contínua: as 4 classes de rotina (diárias, semanais, mensais e verificações) giram sem parar em volta da máquina. 'É o que os mecca rodam enquanto você dorme.' Sem números.

**Texto na tela** (tempos relativos à cena):
- [0.5–5.5 s] «O QUE GIRA POR DENTRO» — estilo: h.eyebrow 22 px em (192,120) — animação: Digitação.
- [0.5–5.5 s] «É o que os mecca rodam / enquanto você dorme.» — estilo: Space Grotesk 700, 84 px, ink, x 192, baselines 260 / 355 ('os mecca' em <em> gradiente). Linha 1 com ≈913 px. — animação: Máscara por linha (linha 2 em 1,0), 0,6 s, mecca.out. O '.' de 'dorme.' respira: opacity .6↔1, período de 2 s. Saída em 5,5–5,8, mecca.in.
- [1.5–5.5 s] «● DIÁRIAS» — estilo: JetBrains Mono 500, 20 px, tracking .2em, #C4B5FD, x 192, baseline 850, bolinha #C4B5FD — animação: Desliza 20 px da esquerda com fade, 0,4 s, mecca.out.
- [2–5.5 s] «● SEMANAIS» — estilo: Mesmo estilo, baseline 888, bolinha #A78BFA — animação: Idem.
- [2.5–5.5 s] «● MENSAIS» — estilo: Mesmo estilo, baseline 926, bolinha #7C3AED — animação: Idem.
- [3–5.5 s] «◆ VERIFICAÇÕES & CONFERÊNCIAS» — estilo: Mesmo estilo, baseline 964, losango #C026D3 — animação: Idem.

**Layout:** PRIMEIRO QUADRO: igual ao último da S07 (máquina em (1300,580) com scale .55, girando; Ponto no cubo; sem texto).

Texto no topo-esquerdo, de y 170 a 375. Legenda no rodapé-esquerdo, de x 192 a ≈652, y 830–970.

Anéis de rotina com centro (1300,580), rot −14°, ry = .32·rx:

| anel | rx |
|---|---|
| Diárias | 250 |
| Semanais | 320 |
| Mensais | 390 |
| Verificações | 460 |

Extensão total dos anéis: x ≈ 850–1750, y ≈ 395–765.

**Visuais:** Quatro anéis de partículas girando em velocidades diferentes em volta da máquina (h.orbit hairline α .2 e partículas no canvas, com jitter determinístico de ±1,5 px):

| anel | partículas | ω | aparência |
|---|---|---|---|
| Diárias | 40 | 120°/s | #C4B5FD, r 2,4, rastro de 5 amostras |
| Semanais | 28 | 60°/s | #A78BFA, r 2,8 |
| Mensais | 16 | 30°/s | #7C3AED, r 3,4, com halo |
| Verificações | 12 losangos de 8 px | 18°/s | #C026D3; cada um pisca #E249B0 ao passar por θ = 90° (a conferência) |

Modo noite: fundo escurece e os anéis brilham. Os 4 mecca (núcleo branco, halo rosa) saltam de anel em anel operando.

**Coreografia:** 0,0–5,5: a máquina segue girando. Sol +36°/s × escala, planetas −63°/s, carcaça −12°/s.

1,5 / 2,0 / 2,5 / 3,0: cada anel acende junto com a sua linha da legenda.
- As partículas nascem na posição do Ponto (1300,580) e se espalham até seus lugares no anel em 0,6 s (mecca.out).
- O traço fino do anel se desenha no mesmo intervalo.

3,0
- O Ponto se divide nos 4 mecca (burst de 0,3 s).
- Em cada batida de 3,5 a 5,5, cada mecca salta para o anel vizinho (arco curto de 0,3 s, mecca.inOut, com rastro).

3,0–4,0: MODO NOITE
- bg.dim 0→.35, glowA/B 1→.5, vignette .55→.75.
- A máquina vai a α .5.
- As partículas ficam 30% mais claras e a velocidade sobe ×1→1,25.

5,0–5,75: a noite se desfaz. bg volta ao padrão, a máquina volta a α 1 e a velocidade volta a ×1.

**Transição de saída:** As rotinas se recolhem em duas órbitas e a máquina desliza para a área de demonstração da S09. Tail 0.

5,5–6,0:
- Texto e legenda saem.
- Os anéis Diárias e Semanais fazem fade.
- O anel Mensais vira D1 e o anel Verificações vira D2, ambos com centro (1440,560) e rot −14°:
  - D1: rx 220, ry 70;
  - D2: rx 320, ry 100;
  - só a hairline, α .3, sem partículas.
- A máquina vai para (1440,560) com scale .45 (relativa ao fechamento da S07).
- Os 4 mecca convergem num Ponto em D2 no ângulo 0° (≈1750,483).

ÚLTIMO QUADRO:
- Máquina em (1440,560) com scale .45, girando.
- D1 e D2 em hairline.
- Ponto em (1750,483) com r 10.
- bg padrão.
- Sem texto.

**Cues de som** (tempo local): 0.5s whoosh (.3); 1.5s tick (diárias .45); 2s tick (semanais .45); 2.5s tick (mensais .45); 3s chime (verificações + 4 mecca .5); 3.5s sub-drop (noite .4); 4s tick (saltos .35); 5s tick (.35); 5.75s whoosh (.4)

