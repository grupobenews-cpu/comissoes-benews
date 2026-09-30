# Meccanismo em 9:16: especificação da versão vertical (1080 × 1920)

Versão para Reels, Stories, TikTok e Shorts. A timeline, a narração, a trilha, os textos, as entradas e saídas e os cues de som são os mesmos da versão 16:9. O que muda é a composição, redesenhada para o celular.

- Fonte da verdade da versão horizontal: `src/scenes/*.js` (implementado), `storyboard/storyboard.json` e `docs/SCENE_GUIDE.md`.
- Arquivos verticais: `src/scenes-v/<id>.js`, com os mesmos ids e o mesmo `timing.js`. Abrir com `src/index.html?format=v`.
- Verificação: `node tools/snap.mjs --format v --scene <id> --every 0.5` e `node tools/cutcheck.mjs --format v`.
- Unidades: px no quadro 1080 × 1920, tempos em segundos LOCAIS da cena (salvo indicação). "bl" significa linha de base (baseline) e "tl" significa canto superior esquerdo.
- As larguras de texto citadas foram medidas no Chromium com as fontes do projeto (Space Grotesk 700 com tracking −0,035em, salvo indicação). Elas servem para conferência. Se a medida real divergir em mais de 4 px, vale a regra de posição (baseline e x) e o dev informa a divergência.

---

## 1. Regras globais

### 1.1 Áreas do quadro

| zona | limites | o que pode entrar |
|---|---|---|
| Área segura de informação | x 90–990, y 250–1480 | todo texto, rótulo, chip, CTA e o Ponto quando for "ponto final" de palavra |
| Faixa de UI do topo | y < 250 | só fundo e elementos decorativos (grid, partículas, órbitas) |
| Faixa de UI da base | y > 1480 (crítico > 1520) | só decorativos, como engrenagens, órbitas, rastros e arcos que sangram |
| Trilho de botões | x > 960 e y 1000–1700 | nada informativo; órbitas e engrenagens decorativas podem passar |
| Palco (elemento visual) | x 90–990, y 980–1480, centro nominal (540, 1230) | máquina, engrenagens, ícone, anéis, sistema binário. Pode sangrar para as laterais e até y 1700 |
| Zona de texto | x 90–990, y 300–1000 | títulos empilhados no terço superior e central |

Composição-padrão: eyebrow no topo, texto empilhado na zona de texto, alinhado à esquerda em x 90, e elemento visual no palco, centrado em x 540. Três exceções:
- S03 usa cards empilhados.
- S07 põe a engrenagem gigante recortada pela direita.
- S10 tem tagline e lockup centrados em x 540.

### 1.2 Margens

- Margem esquerda de texto: **x 90**, que substitui o x 192 da horizontal. O ajuste óptico de −12 px a 330 px vira −7 px a 200 px, ou seja, "máquina." fica em x 83.
- Limite direito: **x 990**. A largura máxima de linha é **900 px, já incluindo o push**: largura × escala máxima do push ≤ 900. Exemplo: uma linha de 860 px com push de 1,03 chega a 886 px e passa.
- Topo: nenhum texto acima de y 250. O eyebrow é o elemento mais alto e tem centro em y 270.
- Base: nenhum texto abaixo de y 1480. Descendentes podem chegar a 1490.
- Espaço mínimo de 24 px entre o Ponto (r + glow núcleo) e qualquer glifo que ele não esteja substituindo.

### 1.3 Eyebrow

- `h.eyebrow(label, { x: 90, y: 270, anchor: 'cl', size: 26, parent })`, na classe `.eyebrow`: JetBrains Mono 500, tracking .26em, traço de 56 × 2 px e gap de 18. O centro vertical fica em **y 270** e o traço começa em x 90.
- Digitação, apagamento e tempos iguais aos da horizontal (digita a 0,025 s/char e apaga de trás para frente a 0,02 s/char).
- Larguras a 26 px, com traço e gap somando 74 px:

| eyebrow | termina em |
|---|---|
| O PROBLEMA | x 388 |
| A VIRADA — MECCANISMO | x 634 |
| ENGENHARIA DE CRESCIMENTO | x 723 |
| O PLANO DE VOO | x 477 |
| O ALCANCE · A MÁQUINA INTEIRA | x 812 |
| O QUE GIRA POR DENTRO | x 634 |
| A GENTE ASSUME, OPERA E FICA | x 790 |

- Na S07 o eyebrow **sobe para o topo**, em (90, 270). No 16:9 ele ficava no rodapé porque o topo recebia a estação anterior. No vertical, a coluna de estações é recortada abaixo de y 320, então o topo fica livre.
- Na S10, o comentário `// cada máquina tem o seu ritmo` ocupa o lugar do eyebrow: JetBrains Mono 500 26 px, minúsculas, tracking .08em, #A78BFA, tl em (90, 257), com centro em ≈ 270 e 548 px de largura.

### 1.4 Escala tipográfica (vertical)

| nível | fonte | tamanho | lh / passo de baseline | onde aparece |
|---|---|---|---|---|
| H1 herói | Space Grotesk 700 | 140–200 | 1,0–1,05 × tamanho | máquina. 200 · engenharia. 160 · agência./consultoria. 160 · duas caixas. 150 · As duas/somem/na hora H. 150 · Quatro/tempos 150 · Cresceu, 150 · ela não/para mais. 170 · meccanismo. 140 |
| H2 | Space Grotesk 700 | 104–120 | 1,15 | Algumas giram; 120 · nomes das 7 estações 104 · A gente assume, / fica, / pele no jogo — 110 |
| H3 | Space Grotesk 700 | 96 | 1,1 | Toda empresa / é uma · Não falta esforço — / falta · O mercado te dá · títulos dos cards · fechamento da S07 · título da S08 · Quando a máquina / engrena, |
| Declaração | Space Grotesk 700 | 72–80 | 1,125 | frase da S05 (80) · nomes dos 4 tempos (72) · header "Quatro tempos" (72) · a gente cresce junto. (72) |
| Apoio em display | Space Grotesk 500/600 | 56–96 | — | Não somos 72 · Somos o 96 · até a máquina girar sozinha. 56 (header 40) · não aconselha. / não entrega e some. / A gente tem / sócio de resultado. 64 · header da S03 60 |
| Apoio | Inter 500 #C4B5FD | 40 | 1,25–1,3 | descrições dos 4 tempos · apelidos das estações · CTA (Inter 600 40) |
| Labels / chips | JetBrains Mono 500 CAIXA ALTA | 26–30 | — | eyebrows 26 · labels das caixas 26 (.2em) · chips 26 (.14em, altura 56) · contador 0k / 07 28 · legenda da S08 26 · SUA EMPRESA / OS MECCA 26 · verbos 26 (.3em) · ENGENHARIA DE CRESCIMENTO 30 (.32em) · URL 30 |
| Números | Bricolage Grotesque 800 | 80–110 | — | 01–04 da S06 110 (gradiente) · 01–07 na engrenagem da S07 80 |

Regras de quebra:
- Em títulos, cada linha tem no máximo 900 px (≈ 13–14 caracteres a 130 px, 16 a 110 e 18 a 96).
- Decida quebras pela largura MEDIDA (tabelas desta spec, conferidas no Chromium com as fontes do projeto). A estimativa "nº de caracteres × tamanho × 0,56" superestima o Space Grotesk 700 com tracking −0,035em em 5–25 % e, se usada sozinha, quebraria linhas que cabem (ver a Revisão técnica).
- Quebre nos pontos naturais indicados cena a cena. As quebras abaixo são **obrigatórias**, para os dois devs de cada corte verem a mesma coisa.
- Cores, `<em>` em gradiente, palavras muted e riscos seguem a horizontal.

### 1.5 O palco

- O centro nominal é (540, 1230), com o elemento visual centrado em x 540.
- Máquinas e ícones ocupam no máximo x 140–940 de largura útil. Órbitas, rastros e ondas podem sangrar.
- Escalas de referência:
  - ícone da virada: 440 px;
  - máquina da S05: 1,1 × horizontal;
  - planetário do fechamento da S07: m 1,1;
  - rotinas: m ,6;
  - diferenciais: m ,5.
- "m" é a escala da **máquina-base** da S07 horizontal no fechamento:
  - sol: engrenagem de 28 dentes, tip r 130, root r 119,8 (`gearD(401 − 14.6, 401 + 19, 28)` × .31);
  - pupila de 110 px de largura (`HUBK = 110 / (156·200/228)`);
  - 7 planetas r 78 (16 dentes, depth .13) à distância 198, nos ângulos −90° + k·51,43°;
  - carcaça: arcos do ícone de 710 px (r 330, traço 49,8 = 16 × 710/228), sem pupila e sem ponto.
- A máquina em (cx, cy) com escala m é `translate(cx cy) scale(m) translate(−1400 −560)` aplicado à mesma montagem da S07/S08 horizontal, que é construída em torno de (1400, 560).

### 1.6 Fundo

- **Idêntico à horizontal**: mesmos valores de `bg` em todos os cortes (tabela da §3) e mesmas curvas dentro de cada cena.
- As cenas não pintam fundo opaco. O motor já redistribui os radiais proporcionalmente a W e H: glowA no topo-esquerdo, glowB no topo-direito e glowC embaixo, em y ≈ 2266, fraco no palco.
- A vinheta do motor é calculada sobre H e fica mais leve nas laterais do vertical. **Não compense** nas cenas.
- O grid (malha de 48 px) e o warp (centro (540, 960)) já funcionam em 1080 × 1920.
- CSS local das cenas: toda camada `width:1920px;height:1080px` vira `width:1080px;height:1920px`. SVGs levam `viewBox="0 0 1080 1920"`. Nunca use 1920 ou 1080 fixos. Use `h.W` e `h.H`.

### 1.7 O Ponto (desenho padrão, igual à horizontal)

- Desenho: `h.glowDot(ctx, x, y, r, '#A78BFA', .6)` + núcleo #FBF8FF de raio r.
- Rastro acima de 600 px/s, com a mesma lógica.
- Quando o Ponto é o "ponto final" de uma palavra, o glifo "." fica transparente. O raio escala com o corpo do texto (≈ 0,065–0,075 em), com os valores fixos abaixo.
- Nos cortes, posição e raio são os da tabela da §3, **ao pixel**. Os desenvolvedores ajustam o x da linha para que o "." medido caia no ponto da tabela, com tolerância de ±2 px. Nunca é o contrário.
- Pousos em "." são dados ANTES do push. Enquanto o Ponto ocupa o ".", ele recebe a mesma escala e a mesma origem do push da linha (como na horizontal). Quando a origem do push é o próprio "." (S03 T2), o Ponto fica parado.

---

## 2. Layout cena a cena

As entradas e saídas, easings, durações e staggers são os da horizontal, salvo quando a linha diz **ADAPTAÇÃO**.

### S01 · Toda empresa é uma máquina (0–6)

**Primeiro quadro:**
- fundo #120720: dim .35, glow 0, particles 0;
- sem texto;
- Ponto com escala 0 em **(540, 960)**, que é o centro do quadro.

**Texto:**
- Eyebrow "O PROBLEMA" em (90, 270).
- "Toda empresa": SG 700 96, x 90, **bl 740** (603 px), entra em 1,0.
- "é uma": SG 700 96, x 90, **bl 840**, entra em 1,5. **ADAPTAÇÃO:** a frase do 16:9 "Toda empresa é uma" quebra em 2 linhas.
- "máquina.": SG 700 **200**, `<em>` em gradiente, x 83, **bl 1100**, largura 831 (x 83–914). O "." é transparente, com tinta centrada em (890,7, 1084).

**Push:** 1→1,03 entre 1,0 e 5,5, com origem em (90, 1100).

**Ponto:**
- Nasce r 8 em (540, 960).
- Na antecipação de 2,0 sobe 64 px, para (540, 896), acima do "u" (altura-x em y 1002).
- Voa de 2,5 a 3,0 por (LAND.x − 20, 800) e pousa apoiado na baseline, com **r 14**, em **(890,7, 1087)** antes do push.
- Squash igual ao da horizontal.

**Grid editorial:**
- 8 verticais em x = 90 + 128,57·k (k = 0…7), de y 160 a 1760.
- 2 horizontais em y 160 e 1760, de x 90 a 990.
- rgba(255,255,255,.05), com o mesmo desenho, atenuação e saída da horizontal.

**Órbita:**
- Centro (500, 1040), rx 500, ry 120, rot −6°, lavanda α .3, 1,5 px, em dois canvases.
- Riders magenta r 5 e lavanda r 4 a partir de 4,0, com período de 4 s.

**Saída (5,5–5,9):**
- O texto sai por máscara para cima.
- A órbita encolhe em direção a **(540, 1238)**.
- O rider magenta vai para **(540, 1130)** e o lavanda para **(540, 1346)**, os dois com r 5→14.
- O Ponto sai do "." por baixo da baseline, com controle quadrático em (780, 1200), e sobe até **(600, 960)** com r 22→10. Ele chega em 5,9, quando os chars de "máquina." já saíram.

**Último quadro:** ver o corte de 6,0 na §3.

### S02 · Algumas giram; a maioria range (6–14)

**Engrenagens:** h.gear com 12 dentes, depth .2, hole .22, **r 120**, stroke #A78BFA 2,5 e fill #1A0B2E α .85.
- **G1 em (540, 1130)** e **G2 em (540, 1346)**. A distância entre centros é 216 = 120 + 120 − 24.
- Ângulo inicial: G1 0°, G2 15°.
- Ponto de engrenamento em **(540, 1238)**.
- Os discos r 14 da S01 viram engrenagens com escala 0,117→1, com mecca.back (G2 com +0,1 s de atraso).

**Planta técnica, em escala 1,2 da horizontal:**
- Círculos primitivos tracejados com r 108.
- Linha entre centros com 5 ticks em y 1166 / 1202 / 1238 / 1274 / 1310. O tick central tem meia-largura 14 e os outros 8.
- Miras de ±22 com anel r 6.
- Callout rosa com r 70 em (540, 1238) e lente de interferência na interseção dos círculos de ponta.
- Faíscas saindo de (540, 1238), com raio de 24 a 55.

**Bloco A (0,0–3,8):**
- "Algumas giram;": SG 700 **120**, x 90, **bl 640** (827 px). "giram" em #C4B5FD.
- "a maioria range.": SG 700 120, x 90, **bl 780** (859 px). "range" em #E249B0.
- Push de 1→1,02 com origem em (90, 710).
- Órbita de "giram": centro **(732, 609)**, rx 200, ry 64, rot −6°, período de 2 s.

**Bloco B (4,0–7,65):**
- "Não falta esforço —": SG 700 96, x 90, **bl 600** (846 px).
- "falta": SG 700 96, x 90, **bl 720**.
- "engenharia.": SG 700 **160**, `<em>` em gradiente, x 90, **bl 900** (859 px). O "." é transparente, com centro em **(931,3, 886,5)**.
- Push de 1→1,02 com origem em (90, 760).

**Ponto:**
- Parte de (600, 960) e entra na órbita de "giram" até 0,6.
- Depois do desabamento (3,5–3,95) fica em **HOVER (800, 960)**, à direita de G1.
- Entre 4,1 e 4,5 voa em arco (controle 110 px acima) até o "." de "engenharia.", com **r 12** (squash elástico).

**ADAPTAÇÃO do morph (7,45–7,95).** As engrenagens empilhadas viram as caixas empilhadas da S03, em duas fases:
1. **7,45–7,65:**
   - Os dentes recolhem para o primitivo em 0,2 s.
   - As duas formas só ALARGAM até 860 px de largura. G1 fica dentro de y 1030–1230 e G2 dentro de y 1246–1446.
   - O texto sai no mesmo intervalo (7,40–7,65).
2. **7,65–7,95:** G1 sobe e cresce até a caixa 1 e G2 cresce até a caixa 2, com mecca.inOut.

Nenhum contorno pode entrar em y < 940 antes de 7,66. As caixas-alvo são as do corte de 14,0.

**Saída do Ponto:** de 7,45 a 7,9 vai do "." de "engenharia." até **(912,5, 757,5)**, com r 12→10. A planta técnica some e bg.grid volta a 0.

### S03 · O mercado te dá duas caixas (14–24)

**Primeiro quadro:** igual ao corte de 14,0.

**T1, slam em 0,0:**
- "O mercado te dá": SG 700 96, x 90, **bl 600**.
- "duas caixas.": SG 700 **150**, x 90, **bl 770** (839 px). "duas" em #C4B5FD. O "." transparente fica em (912,5, 757,5), que é o Ponto com r 10.

**Header, FLIP em 1,0–1,5:**
- "O mercado te dá duas caixas.": SG 700 **60**, centrado em x 540, **bl 372** (790 px, x 145–935).
- O Ponto vira o "." do header em **(928,4, 367)** com **r 5**.
- Push do header de 1→1,02.

**Cards (ADAPTAÇÃO: empilhados):**

| | caixa 1 (Agência) | caixa 2 (Consultoria) |
|---|---|---|
| retângulo | x 110–970, y 430–930, r 28 | x 110–970, y 960–1460, r 28 |
| label mono 26 .2em #A78BFA | "CAIXA 1 — AGÊNCIA", tl (158, 480) | "CAIXA 2 — CONSULTORIA", tl (158, 1010) |
| ilustração | "peça" 260×188, tl (670, 470), em escala 1:1 da horizontal: área de imagem 228×112, sol r 12, barras em +152/+172 | "slide" 320×180, tl (610, 1000), em escala 1:1 da horizontal |
| título SG 700 96 | "Executa a peça", x 158, bl 790 | "Entrega o slide", x 158, bl 1320 |
| "e some." SG 700 96 #A99CC4 | x 158, bl 882 | x 158, bl 1412 |
| centro do colapso (scaleY) | y 680 | y 1210 |

- A borda direita dos cards (x 970) entra 10 px no trilho de botões entre y 1000 e 1460. É só o contorno tracejado e o shimmer, decorativos, e fica assim para manter o handoff de 14,0. Nenhum texto ou ilustração passa de x 930.

**T2, slam em 6,0.** **ADAPTAÇÃO:** 3 linhas.
- "As duas": SG 700 150, x **110**, **bl 820**.
- "somem": SG 700 150, #A99CC4, x **110**, **bl 975**. Some letra por letra em 9,5.
- "na hora H.": SG 700 150, x **110**, **bl 1130** (674 px, x 110–784). O "." é transparente, com centro em **(767,5, 1117,5)**.
- Push de 1→1,03 (6,0–9,5) com origem **no "." (767,5, 1117,5)**, como na horizontal (origem em P2): o Ponto fica parado dentro do "." durante o push. As linhas começam em x 110 para que, no fim do push, a margem esquerda chegue a x 90,3 (767,5 − 657,5 × 1,03) e não passe da área segura.

**Ponto:**
- Fica em (912,5, 757,5) com r 10 até 1,0.
- Vai para o "." do header entre 1,0 e 1,5 (r 10→5).
- Entre 5,5 e 6,0 se solta do header, cai reto e contorna pela esquerda, por (560, 560) e (300, 900), até **(767,5, 1117,5)** com r 12.

**Queda de energia (9,0–10,0):** igual à horizontal.

### S04 · A virada (24–34)

**Primeiro quadro:** igual ao corte de 24,0.

**Eyebrow:** "A VIRADA" em (90, 270), digitado em 0,0. " — MECCANISMO" é digitado em 6,0. Sai em 9,5.

**Negações:**
- "Não somos": SG 500 **72** #C4B5FD, x 90, **bl 470**. "somos" fica em x 231–445.
- "agência.": SG 700 **160**, x 90, **bl 650** (x 90–705,5).
- "Não somos": SG 500 72, x 90, **bl 770**.
- "consultoria.": SG 700 160, x 90, **bl 940** (x 90–952).

**Riscos (espessura 10, gradiente):**
1. de (78, 594) a (705,5, 594) em 1,0;
2. de (78, 884) a (952, 884) em 2,5.

**Ponto nos riscos:**
- Entre 0,25 e 0,75 vai de (767,5, 1117,5) até (78, 594), com controle em (400, 1000).
- Corre na ponta do risco 1 e para em (705,5, 594).
- Entre 1,9 e 2,4 desce pela direita do "." de "agência." e corre pelo corredor entre o 2º "Não somos" (baseline 770, sem descendentes) e as ascendentes de "consultoria." (a partir de y ≈ 825), o mesmo corredor da horizontal: (790, 660) → (730, 792) → (470, 797) → (200, 805) → (66, 830) → (78, 884). O trajeto antigo, em y ≈ 705, passava a 6 px da descendente do "g" e do topo do "N".
- Corre no risco 2 e para em (952, 884).
- Todas essas coordenadas são anteriores à escala de tensão. O Ponto recebe a mesma escala (`sNeg` da horizontal) em torno da origem abaixo.

**Tensão, quedas e STOP:** iguais à horizontal (1→1,008→1,04→1 e shake de 3 px). A origem da escala das negações é **(90, 705)**, ou seja, a margem esquerda no meio do bloco (a horizontal usa (192, 530)). Com 1,04, a borda direita de "consultoria." chega a x 986,5 (989,5 com o shake). As quedas seguem com y +700.

**Fusão dos "somos" (5,0–5,4):** os dois "somos", em (231, bl 470) e (231, bl 770), convergem para **"Somos o"**: SG 500 **96**, x 90, **bl 540**. " o" aparece em 5,5.

**Pós-drop:**
- "meccanismo.": SG 700 **140**, x 90, **bl 700** (x 90–924). "mecca" em `<em>` e "nismo." em #F5F3FF.
- DROP de "meccanismo." igual ao da horizontal (scale 1,35→1, blur 16→0, 0,3 s expo.out, origem 0% 55%). Nos 2–3 primeiros quadros depois de 6,0 a palavra, borrada, passa de x 990 (1,35 × 834 = 1126 px). Isso é permitido porque é o quadro de impacto. Em 6,1 a escala já é ≤ 1,04 (x ≤ 958).
- Push lento do bloco pós-drop: 1→1,015 entre 5,5 e 9,5, com origem **no "." de "meccanismo." (909,4, 688,5)**, como na horizontal (âncora no "."): a borda direita não avança.
- "ENGENHARIA DE CRESCIMENTO": mono 30, .32em, #A78BFA, x 90, **bl 800** (690 px de avanço, tinta até x 770). Hairline lavanda α .5, 1 px, em **y 820,5**, de x 90 a **770,4** (fim da tinta: avanço − 0,32 × 30, como na horizontal).

**Ponto carregando (5,0–6,0):** em **(540, 900)**, com r 14→6 e glow ×2,5. A onda de choque do drop sai de (540, 900), com r 0→1300.

**Ícone oficial:**
- h.icon **440 px** sem ponto, centro **(540, 1200)**, bbox x 320–760 e y 980–1420 (escala 1,9298).
- Encaixe **(721,4, 1288,8)**, com r **19,3**.
- **V da pupila em (540, 1115,1)**.

**Voo até o encaixe (6,5–7,0):** (540, 900) → (760, 860) → (900, 1000) → (880, 1200) → (721,4, 1288,8), curviness 1,2, r 6→19,3. Em 7,0 o núcleo passa a #7C3AED.

**Órbitas do ícone (8,0–8,8):**
- centro (540, 1200), rot −14°;
- rx **350** / **308**, ry .3·rx;
- riders magenta (2 s) e lavanda (4 s).

**Mergulho (9,5–10,0):**
- Zoom 1→250 com origem no V **(540, 1115,1)**.
- O Ponto volta a núcleo #FBF8FF r 6 e vai até o V de 9,5 a 9,75.
- No último quadro o ícone está **totalmente fora do quadro ou com α 0**: nada de restos violeta, para o corte ser exato.

### S05 · Por dentro (34–42)

**Primeiro quadro:** igual ao corte de 34,0.

**Eyebrow:** "ENGENHARIA DE CRESCIMENTO" em (90, 270), 26 px, fixo e fora do push, como na horizontal. Traço entra em 0,5, chars digitados a partir de 0,55 (0,025 s/char), apagados de trás para frente a partir de 7,5 (0,018 s/char), traço sai em 7,79. Termina em x 723.

**Texto:** SG 700 **80**, x 90, com `<em>` iguais aos da horizontal. **ADAPTAÇÃO:** as 6 linhas viram 7.

| bloco (entrada) | linha | baseline | largura |
|---|---|---|---|
| B1 (0,5) | "A gente entra" | 380 | 488 |
| B1 | "*por dentro* do seu" | 470 | 643 |
| B1 | "negócio," | 560 | 313 |
| B2 (2,0) | "*monta* as engrenagens" | 670 | 827 |
| B2 | "que faltam —" | 760 | 475 |
| B3 (4,0) | "e *fica operando*" | 870 | 564 |
| B3 | "o motor com você." | 960 | 666 |

- Stagger de linha de .08 dentro do bloco. B1 cai para α .5 em 2,0 e B2 em 4,0.
- Chip "TIME EMBARCADO · OS MECCA": `.chip` padrão (tracking .02em, como na horizontal) em 26 px, tl **(90, 1000)** (medido: 471 × 60, x 90–561, y 1000–1060), pop em 5,0.
- Push de 1→1,02 com origem em (90, 670).

**Máquina do cliente:** geometria da horizontal com a transformação `p' = (540, 1280) + 1,1·(p − (1447, 520))` e raios × 1,1. A altura de dente comum fica em 19,8. As fases e ω são idênticos, porque a transformação preserva ângulos.

| eng. | centro | r | dentes | estado inicial |
|---|---|---|---|---|
| Ga | (246,3, 1368,0) | 99 | 12 | velha, em slate |
| Gb | (400,3, 1278,9) | 99 | 12 | FALTA |
| Gc (motor) | (598,3, 1351,5) | 132 | 16 | FALTA |
| Gd | (690,2, 1198,8), pela interseção com Gc e Ge | 66 | 8 | FALTA |
| Ge | (833,7, 1176,6) | 99 | 12 | velha, em slate |

- A máquina ocupa x 147–933 e y 1078–1484.
- **Diagnóstico:** V (540, 1115,1) → (400, 1038) em 0,5 → Gb em 0,9 → Gc em 1,3 → Gd em 1,7 → **(543, 983)** em 2,0, onde se divide nos 4 mecca.
- Controles dos voos:
  - m1 (398, 1082);
  - m2 (660, 1115);
  - m3 (574, 1181);
  - m4 (788, 968);
  - zap de Ge para Ga: controle (543, 873).
- **Órbita dos mecca:** centro **(543, 1280)**, rx **418**, ry **143**, rot −14°, período de 4 s. O recuo acontece em torno de (543, 1280).

**Saída (7,5–8,0):**
- O texto sai.
- O trem encolhe para (543, 1280) com escala .5 e α→0.
- Os 4 mecca convergem num Ponto.
- **ADAPTAÇÃO:** a órbita faz tween para uma elipse **VERTICAL**, com centro **(250, 1110)**, rx **120**, ry **360** e rot 0°. O Ponto fica no ponto mais ALTO, em **(250, 750)**, com **r 10**. É a futura linha do tempo vertical.

### S06 · O plano de voo (42–54)

**Primeiro quadro:** igual ao corte de 42,0.

**Eyebrow:** "O PLANO DE VOO" em (90, 270), digitado em 0,0.

**Título antes do FLIP:**
- "Quatro": SG 700 **150**, x 90, **bl 470**.
- "tempos": SG 700 150, x 90, **bl 620**.
- "até a máquina girar sozinha.": SG 500 **56** #C4B5FD, tracking **−0,02em** (o da horizontal), x 90, **bl 710** (725 px). "girar sozinha" em `<em>`.

**Header depois do FLIP (2,5–3,0):**
- "Quatro tempos": SG 700 **72**, x 90, **bl 380**. Cada palavra faz FLIP para o seu lugar: "Quatro" para x 90 e "tempos" para x ≈ 327.
- Subtítulo: SG 500 **40**, tracking −0,02em, x 90, **bl 436** (518 px). O FLIP é a escala 56→40 da horizontal (lá 60→26).

**Riders:** de 0,0 a 1,5 o Ponto percorre a elipse (período de 2 s, sentido horário, começando no topo), com 2 riders a +120° e +240°.

**A órbita se levanta (2,5–3,0). ADAPTAÇÃO: linha do tempo VERTICAL.**
- rx 120→0.
- ry 360→430.
- Centro (250, 1110)→(250, 1010).
- A elipse vira a linha **x 250, de y 580 a y 1440**.
- O Ponto desliza até (250, 580).

**Linha:** tracejada à frente do Ponto (lavanda α .35, dash 6/10) e sólida atrás dele (gradiente de 3 px, de #C026D3 em cima para #7C3AED embaixo).

**Os 4 tempos:** nós em **(250, 580)**, **(250, 820)**, **(250, 1060)** e **(250, 1300)** (y_k), com r 10, fill #7C3AED, anel lavanda de 2 px e halo 10→48.

| elemento | regra |
|---|---|
| número "0k" | Bricolage 800 **110**, gradiente, alinhado à direita em x 222, bl y_k + 39. **ADAPTAÇÃO:** "sobe de trás da linha" vira "sai de trás da linha para a esquerda": máscara x 70–242, y y_k − 75…y_k + 75, com x +170→0, 0,45 s, expo.out |
| nome | SG 700 **72**, x 290, bl y_k + 26 (Diagnóstico 390 · Engenharia 366 · Operação 312 · Escala 207 px) |
| descrição | Inter 500 **40** #C4B5FD, x 290, lh 1,3 (passo 52), 1ª bl y_k + 92, 2ª bl y_k + 144. Sempre 2 linhas, com as quebras **obrigatórias** (`<br>`, nowrap) da tabela abaixo |
| separador | hairline α .05 em y_k − 60, de x 290 a 990 (substitui as guias verticais) |
| 02 · marcas de corte | L de 16 px em volta do nome, com folga de 12 |
| 03 · mini engrenagem | r 18, 8 dentes, 28 px depois do nome, centro na altura y_k; 3 pontinhos r 3 em rx 40 / ry 13 |
| 04 · escadinha | 4 degraus de 16 × 10 px, 24 px depois de "Escala" |

Descrições (mesmo texto da horizontal; só a quebra é nova; larguras medidas a 40 px):

| tempo | linha 1 | linha 2 | fim da linha mais longa |
|---|---|---|---|
| 01 | "Abrimos a máquina e achamos qual" (679) | "engrenagem travou o crescimento." (667) | x 969 (y < 1000) |
| 02 | "Montamos o que falta: processo," (627) | "time, ferramenta e número." (519) | x 917 |
| 03 | "Os mecca assumem as rotinas" (583) | "e operam por dentro." (403) | x 873 |
| 04 | "Tudo engrenado e medido," (513) | "o crescimento vira previsível." (559) | x 849 |

As quebras são fixas para não depender de reflow: a 01 com largura 690 ficava a 11 px de virar 3 linhas. Os tempos 03 e 04 (y ≥ 1060) terminam antes de x 960, fora do trilho de botões.

**Tempos das pernas:**

| perna | intervalo | trecho em y |
|---|---|---|
| 1 | 4,1–4,5 | 580→820 |
| 2 | 5,6–6,0 | 820→1060 |
| 3 | 7,1–7,5 | 1060→1300 |
| 4 | 8,0–8,5 | 1300→1440 (fim) |

**Gira sozinha (8,5–11,5):** círculo r 22 com centro **(250, 1418)**, 1 volta/s. Os nós pulsam em 9,5 / 9,75 / 10,0 / 10,25.

**Push de câmera:** 1→1,025→1 com origem em (540, 960).

**Saída (11,4–12,0):**
- Números saem para dentro da linha, ou seja, para a direita.
- Os textos saem na ordem da horizontal.
- bg.grid .35→.2.
- A polyline de 64 pontos (i = 0…63) leva o ponto i de (250, 580 + i·860/63) até **(540 + 300·cos(π + i·2π/63), 1100 + 300·sin(π + i·2π/63))**, com power3.inOut. O topo da linha (i = 0) vai para o ponto mais à ESQUERDA do círculo, (240, 1100), e a linha se enrola no sentido horário, primeiro pela metade de cima. A base (i = 63) também chega a (240, 1100) e fecha o laço.
- O Ponto, na ponta de baixo (i = 63), fecha o laço em **(240, 1100)** com **r 10**.
- Gradiente do traço durante o morph (como na horizontal, que interpola as pontas do gradiente): início lerp((250, 580) → (240, 1100)) e fim lerp((250, 1440) → (840, 1100)), com o mesmo p do morph, de #C026D3 para #7C3AED. No último quadro o traço é todo sólido, 3 px, com gradiente linear horizontal de x 240 a x 840.

### S07 · Sete engrenagens (54–76)

**Primeiro quadro:** igual ao corte de 54,0.

**ADAPTAÇÃO: engrenagem gigante recortada pela DIREITA, cremalheira vertical (como no 16:9), com o passo recalculado.**

**Engrenagem:** a MESMA geometria da horizontal (pr 401, dentes ro = pr + 19 e ri = pr − 14,6, anel r 300, mancal r 128, janela r 300–384, números no raio 330, cubo de 200 px) dentro de `gearG` com escala **gs = k = 1,4446** (= 579,3 / 401, o fator que dá passo de 520 px por estação). No quadro vertical isso resulta em:
- centro **(1320, 1100)**, 28 dentes;
- raio primitivo **579,3**, tip **606,7**, root **558,2**;
- fill #1A0B2E α .8, stroke lavanda α .5;
- anel interno r 433,4, mancal r 184,9, 7 raios;
- janela da estação entre r 433,4 e 554,7;
- a borda esquerda (ponta do dente às 9 horas, porque 28/7 = 4 dentes por estação) fica em **x 713,3**.
- O cubo (ícone de 288,9 px) fica fora do quadro até o recuo. Isso é esperado.

**Números 01–07:**
- Bricolage 800 **80** (tracking −0,03em, ≈ 84 px de largura), #A78BFA α .6, no raio 476,7, sempre em pé.
- O número ativo fica às 9 horas, em **(843,3, 1100)**, em ink com escala 1,15.
- Regra de borda da horizontal adaptada ao quadro vertical: opacidade × `smooth(1040, 970, nx)`. Os vizinhos inativos, em (1022,8, 727,3) e (1022,8, 1472,7), ficam em α ≈ .09, e nada legível entra no trilho de botões.

**Chegada (0,0–1,5):**
- De 0 a 1,0 o círculo vai de (540, 1100), r 300, para (1320, 1100), r 579,3: pr 300→401 (como na horizontal) e gs 1→1,4446, os dois com mecca.inOut, junto com o centro. O Ponto segue o ponto mais à esquerda até (740,7, 1100).
- De 1,0 a 1,5 nascem os dentes e o Ponto estaciona em **(676, 1100)**.

**Cremalheira:**
- Passo **520 px** por estação, que é o arco de 51,43° no raio primitivo 579,3.
- Contêiner recortado por `polygon(60 320, 700 320, 700 1000, 960 1000, 960 1480, 60 1480)`. A saliência deixa os chips saírem do Ponto.
- Bloco ativo com topo em **y_A = 963**. O bloco anterior fica em 443, com α .4.
- Estado inicial do rack: y +520.
- Na estação k, o rack está em y −520·(k − 1), com o mesmo easing e os mesmos tempos (T − 0,35 → T + 0,15).

**Bloco de estação (relativo a y_A, tudo em x 90, largura útil até x 650):**

| item | estilo | posição |
|---|---|---|
| contador "0k / 07" | mono 28, .14em, #A78BFA | bl +40 |
| nome | SG 700 **104** (máx. 509 px, Tecnologia; tinta até x 616,6 com a escala 1,03 da horizontal) | bl +175. A cap-height centra em y ≈ 1102, na altura do Ponto. Com 110 px, "Tecnologia" × 1,03 chegava a x 647, só 13–19 px do Ponto (r 10–16) em 676. 104 px garante os 24 px da §1.2 |
| apelido | Inter 500 **40** #C4B5FD, tracking −0,01em (horizontal), lh 1,25 | bl +232 e (+282). A linha única mais longa é "Engrenagem do fechamento", com 530 px (x 90–620). Quebras obrigatórias: "Engrenagem das / regras do jogo", "Engrenagem da / conformidade eficiente", "Engrenagem do / sistema nervoso". Os outros cabem em 1 linha |
| chips | mono 26, .14em, altura 56, **um por linha** | tops +310 / +376 / +442. Base em +498, ou seja, 1461 no bloco ativo. O mais largo ("PLANEJAMENTO TRIBUTÁRIO" / "FULFILLMENT & EXPEDIÇÃO", 443 px de texto) fica com ≈ 500 px, x 90–590 |

- Os chips SAEM DO PONTO (676, 1100) com a mesma trajetória relativa da horizontal: `sx = 676 − cx`, `sy = 1100 − cy`, ponto médio (sx·.5, 48).
- **Eyebrow:** "O ALCANCE · A MÁQUINA INTEIRA" no **topo**, em (90, 270), com a mesma digitação, deriva de +10 px e saída em 16,0.

**Recuo (16,0–17,0):**
- A engrenagem vai para **(540, 1150)**, com gs 1,4446 → **.341** (= .31 da horizontal × 1,1), ou seja, sol com tip r 143,2 (.2357 em relação ao desenho vertical).
- A pupila do cubo fica com 121 px de largura.
- Números, anéis e raios somem de 16,0 a 16,3.

**Planetário do fechamento: máquina-base com m 1,1, centro (540, 1150).**
- Planetas com r 85,8 à distância 217,8, nos centros:

| planeta | centro |
|---|---|
| Vendas | (540, 932,2) |
| Marketing | (710,3, 1014,2) |
| Comercial | (752,3, 1198,5) |
| Fiscal | (634,5, 1346,2) |
| Logística | (445,5, 1346,2) |
| Sistemas | (327,7, 1198,5) |
| Tecnologia | (369,7, 1014,2) |

- Nomes dos planetas em SG 600 **26**, ink, em pé.
- Carcaça: arcos do ícone de 781 px, com tl (149,5, 759,5), r 363 e traço 54,8. Ela sangra até y ≈ 1540, o que é decorativo e permitido.
- O Ponto orbita com r **429** em volta de (540, 1150), período de 3 s.
- Onda de choque em 18,0, com r 385→990.

**Texto do fechamento (SG 700 96, x 90):**
- "Uma máquina." bl **420** (612 px);
- "Sete engrenagens." bl **530** (813 px);
- "Um só *mecanismo.*" bl **640** (803 px).
- Push de 1→1,025 com origem em (90, 530).

**Saída (21,5–21,967):**
- A máquina vai de (540, 1150) m 1,1 para **(540, 1180) m .6**, sem parar de girar.
- O Ponto vai para o cubo (540, 1180).
- As velocidades seguem as da horizontal: sol +36°/s, planetas −63°/s, carcaça −12°/s, com a mesma rampa `spinAt` e o mesmo `SUN_OFF`.

### S08 · O que gira por dentro (76–82)

**Primeiro quadro:** igual ao corte de 76,0.

**Eyebrow:** "O QUE GIRA POR DENTRO" em (90, 270).

**Título: SG 700 96, x 90.** **ADAPTAÇÃO:** 3 linhas.
- "É o que *os mecca*": bl **430** (746 px);
- "rodam enquanto": bl **535** (720 px);
- "você dorme.": bl **640** (533 px). O "." respira.
- As linhas 1 e 2 entram em 0,5 (stagger .08) e a linha 3 em 1,0.
- Push de 1→1,025 (0,5–5,5) com origem **(90, 640)**, a margem esquerda na baseline da última linha (a horizontal usa '0% 100%'). A borda direita chega a x 857.

**Legenda (mono 26, .2em, #C4B5FD, x 90):**

| linha | baseline | entra em |
|---|---|---|
| ● DIÁRIAS | 760 | 1,5 |
| ● SEMANAIS | 806 | 2,0 |
| ● MENSAIS | 852 | 2,5 |
| ◆ VERIFICAÇÕES & CONFERÊNCIAS | 898 | 3,0 |

● e ◆ são os marcadores CSS da horizontal (`.s8-bul` e `.s8-dia`, nas cores de cada anel), não caracteres do texto. A linha mais longa tem 608 px (x 90–698).

**Anéis:** centro **(540, 1180)**, que é o mesmo da máquina (m .6), rot −14°, ry .32·rx.

| anel | rx |
|---|---|
| Diárias | 270 |
| Semanais | 350 |
| Mensais | 425 |
| Verificações | 500 |

- Partículas, cores, ω, modo noite, divisão nos 4 mecca e saltos são iguais aos da horizontal. As partículas nascem do Ponto em (540, 1180).
- A extensão fica em x ≈ 44–1036 e y ≈ 983–1377. A sangria lateral é decorativa.

**Saída (5,5–6,0):**
- Texto e legenda saem.
- Diárias e Semanais fazem fade.
- Mensais vira **D1** e Verificações vira **D2**, com centro **(540, 1270)**.
- A máquina vai para **(540, 1270) m .5**.
- Os mecca convergem no Ponto em **(884,5, 1184,1)**, que é D2 a 0°.

### S09 · Diferenciais (82–92)

**Primeiro quadro:** igual ao corte de 82,0.

**Eyebrow:** "A GENTE ASSUME, OPERA E FICA" em (90, 270).

**Texto (x 90):**

| bloco | linha | estilo | baseline | largura |
|---|---|---|---|---|
| B1 | "A gente *assume,*" | SG 700 **110** | 410 | 813 |
| B1 | "não ~~aconselha~~." | SG 600 **64** #A99CC4 | 480 | 434 |
| B2 | "A gente *fica,*" | 110 | 600 | 620 |
| B2 | "não ~~entrega e some~~." | 64 | 670 | 585 |
| B3 | "A gente tem" | SG 500 64 #C4B5FD | 770 | 350 |
| B3 | "*pele no jogo —*" | 110, com glow rosa | 885 | 721 |
| B3 | "sócio de resultado." | SG 700 64, com sublinhado | 960 | 549 |
| B4 (6,5) | "*Cresceu,*" | SG 700 **150** | 500 | 587 (1,12× = 657) |
| B4 | "a gente cresce junto." | SG 700 **72** | 600 | 684 |

Os tempos, verbos que batem (1,25→1, origem 0% 80%), riscos, α e crescimentos são os da horizontal. As espessuras dos riscos são 6 (110 px) e 5 (64 px).

Origens do push de 1→1,02 de cada bloco (na margem esquerda, no meio das baselines do bloco, como na horizontal): B1 **(90, 445)** · B2 **(90, 635)** · B3 **(90, 865)** · B4 **(90, 550)**. Pior caso: "A gente assume," × 1,02 = 829 px (x ≤ 920). "Cresceu," × 1,12 × 1,02 = 671 px. No quadro em que o verbo fica opaco (0,05 s), a escala dele já está em ≤ 1,06, e a borda fica em x ≤ 930.

**Área de demonstração: centro (540, 1270), com a máquina em m .5.**
- **V da pupila em (540, 1254,4)**.
- Mergulho do Ponto de 0,5 a 1,0, com controle em (820, 1000).
- O Ponto orbita D2 (1 volta/s) a partir de 2,0, deixando anéis-rastro.
- Caixa-fantasma de **130 × 88**, raio 11, slate e tracejada. Entra em D1 no ângulo 180°, em ≈ (302, 1329), e em 3,0 é arremessada para a esquerda e para baixo.

**Binário (a partir de 4,0, a 72°/s, rot −14°):**
- A em órbita de **44 × 16**, com r **44**;
- B, o Ponto, em órbita de **222 × 78**, com r **12**;
- baricentro inicial em **(540, 1270)**;
- fio de 2 px em gradiente;
- rótulos em mono 26: "SUA EMPRESA" em #C4B5FD, 56 px abaixo de A; "OS MECCA" em #E249B0, 32 px acima de B.

**Cresce junto (6,5–9,5):**
- Baricentro de (540, 1270) para **(540, 1190)**.
- Órbita de A de 44×16 para 62×22; órbita de B de 222×78 para 278×97.
- r de A de 44 para 58; r de B de 12 para 17.
- Ondas elípticas com rx 278→466 e ry .35·rx, em 7,0 / 7,5 / 8,0 / 8,5.

**Saída (9,5–10,0):** o binário implode e o ponto fundido vai para **(540, 690)**, com r 20 e glow ×2. bg.warp 0→.5 e speed 1→2.

### S10 · Assinatura (92–100)

**Primeiro quadro:** igual ao corte de 92,0.

**Comentário:** `// cada máquina tem o seu ritmo` com tl (90, 257), digitado a partir de 0,5.

**Tagline, centrada em x 540. ADAPTAÇÃO: 4 linhas.**

| linha | estilo | baseline | largura | entra em |
|---|---|---|---|---|
| "Quando a máquina" | SG 700 **96** | 540 | 806 | 0,0 (palavra a palavra, stagger .06) |
| "*engrena,*" | SG 700 96 | 645 | 383 | 0,0 (mesma sequência) |
| "ela não" | SG 700 **170** | 850 | 548 | 0,5 |
| "para mais." | SG 700 170 | 1030 | x 149–931 | 0,5 |

- O "." de "mais." é transparente até 2,0, com centro em **(912, 1015,5)**.
- Dois pushes, como na horizontal:
  - linhas 1–2 (o L1 da horizontal, "Quando a máquina engrena,"): 1→1,02 de 0,0 a 4,0, com origem **(540, 560)**;
  - linhas 3–4 (o L2, "ela não para mais."): 1→1,03 de 0,5 a 4,0, com origem **(540, 950)**. O Ponto no "." acompanha essa escala até 2,0 (`s2At` da horizontal).
  - Borda máxima: "Quando a máquina" × 1,02 → x 129–951; "para mais." × 1,03 → x 148–940.
- Entradas: palavras 1,25→1 com fade (0,5 s, power4.out), stagger .06 nas linhas 1–2 e .08 nas linhas 3–4, e "mais." crescendo a partir do Ponto (1,12→1, x +4), como na horizontal. **ADAPTAÇÃO:** as origens por palavra da horizontal (calibradas para uma linha de 1920) são trocadas pelo centro da própria linha (x 540, meio da cap-height), exceto em "mais.", cuja origem continua no ".". As palavras "pousam" em direção ao centro sem se sobrepor. Quando α ≥ .6, a escala é ≤ 1,10 e a linha mais larga ocupa ≤ 887 px (x ≥ 96).

**Ponto:**
- Entre 0,0 e 0,5 vai de (540, 690) para o "." de "mais.", com r 20→**12** e glow ×2→1, passando por cima, com controle em (900, 760).
- A partir de 2,0 orbita a frase numa elipse com centro **(540, 780)**, rx **520**, ry **330**, rot −6°. A metade de trás passa atrás do texto. O período cai de 1,5 s para 0,75 s.

**Máquina de fundo (α .18):**
- 7 engrenagens (r 110, 14 dentes) em volta de **CE (540, 780)**, que encaixam do raio 420 para 330.
- Ícone central sem ponto, com 180 px e α .25.

**Órbitas grandes. ADAPTAÇÃO: eixo maior na vertical, para emoldurar a tela alta.** Todas com centro CE e com os mesmos riders e rastros.

| órbita | rx | ry | rot |
|---|---|---|---|
| 1 | 300 | 1000 | −6° |
| 2 | 240 | 800 | −3° |
| 3 | 180 | 600 | −9° |

**Convergência (4,0–4,5):** tudo colapsa em CE (540, 780). O Ponto é puxado para uma órbita de **104 × 118** em volta do centro do ícone **(211, 780)**.

**Lockup oficial horizontal (sem empilhar), em escala .895, centrado em x 540, com centro vertical em y 780:**
- ícone h.icon **170 px**, bbox x 126–296 e y 695–865;
- wordmark h.logo **626 px**, bbox x 328–954 e y 713,75–846,25;
- glow radial violeta α .35 atrás;
- **encaixe final em (281,1, 814,3), com r 7,46**.

**Verbos (mono 26, .3em, centrados). ADAPTAÇÃO: 2 linhas, com a mesma onda de brilho por verbo.**
- "ENGRENAR · MONTAR · CALIBRAR ·" em bl **950**. A linha é centrada pelas palavras (655 px, x 212,5–867,5), e o 3º separador "·" fica pendurado depois de CALIBRAR, até x ≈ 915. Os 4 separadores da horizontal são mantidos, e esse acende em 6,5 junto com OPERAR, como lá.
- "OPERAR · GIRAR" em bl **994** (328 px).

**CTA:** pílula de **600 × 104** centrada em **(540, 1130)** (y 1078–1182), com o rótulo "Abrir minha máquina" (Inter 600 **40**, tracking −0,01em, 400 px) seguido da seta em SVG da horizontal (34 → 40 px, que não é um caractere). Brilho, nudge e pop iguais aos da horizontal.

**URL:** "meccanismo.com.br" em mono **30**, tracking .08em (o da horizontal), #C4B5FD, centrada, **bl 1270** (347 px).

**Clique final e hold:**
- Espiral de 6,5 a 7,0 até (281,1, 814,3). Em 7,0, o clique: núcleo #7C3AED, anel r 0→90.
- De 7,0 a 8,0, hold com órbita fina de centro (540, 780), rx 470, ry 150, rot −6°, α .12 e rider r 3 (4 s).

**Último quadro (thumbnail):** lockup completo, verbos acesos, CTA, URL, órbita com rider e bg padrão com glowA/B 1,1.

---

## 3. Tabela de handoffs (último quadro da cena que sai = primeiro quadro da que entra)

Convenções válidas para todos os cortes:
- O Ponto usa o desenho padrão (§1.7), salvo indicação.
- "sem texto" quer dizer nenhum nó de texto visível.
- O estado do bg lista TODOS os campos. A cena que entra faz `tl.set(bg, {...}, 0)` com esses valores.
- **BG padrão** = glowA 1, glowB 1, glowC 1, particles 1, grid 0, warp 0, speed 1, vignette .55, dim 0, hue 0, driftX 0, driftY 0, grain 1. Nas linhas abaixo, "BG padrão com X" muda só os campos citados.

| corte (global) | Ponto | objetos compartilhados | eyebrow / texto | bg |
|---|---|---|---|---|
| **6,0** S01→S02 | **(600, 960)**, r 10 | disco #C026D3 r 14 em **(540, 1130)** (vira G1); disco #A78BFA r 14 em **(540, 1346)** (vira G2); discos sólidos sem glow. Órbita com rx 0 (invisível) e grid editorial com α 0 | "O PROBLEMA" em (90, 270), 26 px, completo e estático. A S01 entrega a versão em chars e a S02 começa idêntica (troca em 4,0, como na horizontal). Nenhum outro texto | BG padrão |
| **14,0** S02→S03 | **(912,5, 757,5)**, r 10 | retângulo 1 com x 110–970, y 430–930, r 28; retângulo 2 com x 110–970, y 960–1460, r 28. Stroke rgba(167,139,250,.3), 1,5 px, dash 8/10, sem fill, `vector-effect: non-scaling-stroke`. O caminho começa em (x + r, y) no sentido horário (mesmo construtor `rr` da horizontal), para a fase do tracejado ser idêntica | "O PROBLEMA" em (90, 270). Nenhum outro texto | BG padrão |
| **24,0** S03→S04 | **(767,5, 1117,5)**, r 12 | nenhum | sem eyebrow, sem texto | glowA .6, glowB .6, glowC 1, particles .5, grid 0, warp 0, speed 1, vignette .75, dim .5, hue 0, driftX 0, driftY 0, grain 1 |
| **34,0** S04→S05 | **(540, 1115,1)** (o V da pupila), r 6, núcleo #FBF8FF (não violeta), glow padrão | nenhum: ícone e órbitas fora do quadro ou com α 0 | sem eyebrow, sem texto | BG padrão com **warp 1, speed 3** |
| **42,0** S05→S06 | **(250, 750)**, r 10 | elipse hairline lavanda #A78BFA α .3, 1,5 px, centro **(250, 1110)**, rx **120**, ry **360**, rot 0°, sem riders. Máquina com α 0 | sem eyebrow, sem texto | BG padrão |
| **54,0** S06→S07 | **(240, 1100)**, r 10 | círculo sólido com centro **(540, 1100)** e r **300**, traço de 3 px em gradiente linear horizontal de #C026D3 (x 240) para #7C3AED (x 840), sem fill | sem eyebrow, sem texto | BG padrão com **grid .2** |
| **76,0** S07→S08 | **(540, 1180)**, r 10, sobre a pupila | máquina-base em **(540, 1180), m .6**: sol com tip r 78, 7 planetas r 46,8 à distância 118,8, pupila de 66 px, carcaça de 426 px (r ≈ 198), α 1, sem nomes nos planetas. Ângulos iguais aos da horizontal no mesmo instante: sol ≡ 0 (mód. 12,857°), planetas 0° e carcaça 0°, com `spinAt`/`SUN_OFF` da S07. Girando a +36 / −63 / −12 °/s | sem texto | BG padrão |
| **82,0** S08→S09 | **(884,5, 1184,1)**, r 10 (D2 a 0°: `ellipsePt(540, 1270, 355, 111, −14°, 0)`) | máquina-base em **(540, 1270), m .5**, girando, com os ângulos da horizontal no mesmo instante: sol 232,875°, planetas θB = ψ + 191,25° − 1,75·(θ − ψ), carcaça −77,625°. **D1**: centro (540, 1270), rx **245**, ry **78**, rot −14°. **D2**: centro (540, 1270), rx **355**, ry **111**, rot −14°. As duas em hairline de 1,25 px lavanda α .3, com a metade de trás α .15 no canvas de trás, sem partículas | sem texto | BG padrão |
| **92,0** S09→S10 | ponto fundido em **(540, 690)**, **r 20**: `glowDot(r 20, #A78BFA, α 1)` + halo radial com R = 200 (r·5·g, g = 2) em lavanda α .24→0 + núcleo #FBF8FF r 20 | nenhum (fio, rótulos, D1/D2 e máquina com α 0) | sem texto | BG padrão com **warp .5, speed 2** |
| **100,0** (fim) | encaixado em (281,1, 814,3), r 7,46, núcleo #7C3AED | lockup completo | como descrito na S10 | BG padrão com glowA 1,1, glowB 1,1 |

Checagem de sanidade de cada corte:
- Rode `node tools/cutcheck.mjs --format v`. A diferença de pixel entre `cut_T_a` e `cut_T_b` deve ser só ruído de grão.
- Quem entra também confere o próprio quadro 0 em modo solo (`--scene <id>`).

---

## 4. Regras de continuidade (vertical = horizontal)

1. **Tempos.** `timing.js` é o mesmo: starts 0/6/14/24/34/42/54/76/82/92, tail 0 em todas as cenas. Toda entrada, saída, pulso e troca de cor acontece no MESMO tempo local da versão horizontal. Onde uma linha horizontal virou duas ou três, as linhas extras entram junto com a original (stagger ≤ .08) ou no próximo múltiplo de 0,5 s já previsto (S08, linha 3 em 1,0).
2. **Textos.** São exatamente os mesmos caracteres da horizontal implementada, em PT-BR com acentos, incluindo as descrições curtas da S06 e os chips da S07. Mudam só as quebras de linha listadas na §2. Nunca chame a Meccanismo de agência ou de consultoria.
3. **Sincronia com a narração** (tempos locais). A tipografia segue a mesma relação com a fala:

   | cena | falas (tempo local) |
   |---|---|
   | S01 | "Toda empresa é uma máquina." 1,00 |
   | S02 | "Algumas giram. A maioria…" 0,10 · "…range." 2,65 · "Não falta esforço. Falta engenharia." 4,05 |
   | S03 | "O mercado te dá duas caixas." 0,10 · "A agência… A consultoria…" 1,95 · "As duas somem na hora H." 6,95 |
   | S04 | "Não somos agência." 0,10 · "Não somos consultoria." 1,80 · "Somos o…" 4,75 · "…Meccanismo." 6,10 · "Engenharia de crescimento." 7,45 |
   | S05 | tese 0,35 |
   | S06 | "Quatro tempos…" 0,25 · Diagnóstico 3,05 · Engenharia 4,55 · Operação 6,05 · Escala 7,55 · "Tudo engrenado…" 8,55 · "E a gente opera a máquina inteira." 11,75 (atravessa o corte) |
   | S07 | nomes das estações em 2,2 / 4,2 / … / 14,2 · "Uma máquina. Sete engrenagens. Um só mecanismo." 17,05 |
   | S08 | 0,60 e "Todo dia. Toda semana. Todo mês." 3,25 |
   | S09 | 0,55 / 2,75 / 4,90 / 7,65 |
   | S10 | 0,30 e "Meccanismo. Abra a sua máquina." 4,75 |

4. **Cues de som: idênticos.** Copie literalmente as chamadas `cue(t, kind, note, gain)` de `src/scenes/<id>.js` para `src/scenes-v/<id>.js`. É proibido acrescentar, remover ou mover cues. Referência:
   - **S01:** 0 tick .6 · 1,0 click .3 · 1,5 click .3 · 2,0 impact .6 · 3,0 click .8 · 4,0 chime .25 · 5,75 whoosh .7
   - **S02:** 0 whoosh .3 · 0,5 glitch .4 · 1,0 glitch .25 · 1,5 click .35 · 2,0 glitch .25 · 2,5 click .35 · 3,0 glitch .25 · 3,5 whoosh .3 · 4,0 impact .5 · 4,0 glitch .5 · 4,5 click .6 · 5,0 tick .4 · 5,5 tick .3 · 7,75 whoosh .5
   - **S03:** 0 impact .7 · 1 click .5 · 1 whoosh .35 · 1,5 click .5 · 3 glitch .15 · 3,5 glitch .15 · 4,5 click .7 · 4,5 sub-drop .35 · 5 click .7 · 5,5 glitch .7 · 6 impact 1,0 · 9 sub-drop .5 · 9,5 glitch .3
   - **S04:** 0 impact .8 · 1 whoosh .5 · 1 click .9 · 1,5 impact .8 · 2,5 whoosh .5 · 2,5 click .9 · 4,5 glitch .5 · 4,75 click .4 · 5 stop 1 · 5,5 tick .8 · 6 impact 1,0 · 6 sub-drop 1,0 · 7 click .9 · 7 chime .6 · 8 whoosh .4 · 9,75 whoosh 1,0 · 10 reverse .7
   - **S05:** 0 impact .6 · 0,9 / 1,3 / 1,7 tick .4 · 2 chime .5 · 2,5 / 3 / 3,5 click .7 · 4 impact .8 · 4 sub-drop .4 · 5 click .4 · 7,75 whoosh .5
   - **S06:** 0 impact .6 · 2,75 whoosh .4 · 3 click .8 · 3 impact .4 · 4,5 click .8 · 6 click .8 · 6,5 chime .3 · 7,5 click .8 · 7,5 impact .5 · 8,5 chime .6 · 9,5 tick .35 · 10 tick .35 · 11,75 whoosh .6
   - **S07:** 0 whoosh .4 · 1 impact .8 · 1,25 chime .3 · 2/4/6/8/10/12/14 click 1,0 · 2 impact .35 · 14 impact .6 · 16,5 whoosh .6 · 17 whoosh .5 · 18 impact 1,0 · 18 chime .7 · 21,75 whoosh .5
   - **S08:** 0,5 whoosh .3 · 1,5 / 2 / 2,5 tick .45 · 3 chime .5 · 3,5 sub-drop .4 · 4 tick .35 · 5 tick .35 · 5,75 whoosh .4
   - **S09:** 0,5 impact .7 · 1 click .9 · 1,5 whoosh .3 · 2 impact .7 · 3 glitch .35 · 3 whoosh .3 · 3,5 impact .8 · 4 chime .5 · 6,5 impact .6 · 7 / 7,5 / 8 / 8,5 tick .3 · 10 riser 1,0
   - **S10:** 0 impact 1,0 · 0 sub-drop .8 · 0,5 impact .7 · 2 whoosh .3 · 3 whoosh .3 · 4,5 reverse .8 · 4,5 impact .9 · 5 tick .4 · 5 click .6 · 5,5 / 6 / 6,5 tick .4 · 7 click 1,0 · 7 chime 1,0
5. **Os eventos visuais que os cues marcam** (pousos, encaixes, rangidos, cliques de estação, drops) acontecem no mesmo quadro da horizontal, só em outra posição. Uma adaptação de coreografia nunca desloca um evento no tempo.
6. **Determinismo e qualidade.** Valem as mesmas regras do SCENE_GUIDE: nada de Math.random ou Date, nada de DOM criado em onFrame, menos de ~800 nós, canvas abaixo de 5 ms. Em modo solo cada cena tem de funcionar sozinha, o que exige o `tl.set(bg)` do corte de entrada.
7. **Desempate.** Se algo não estiver especificado aqui, vale a horizontal implementada, escalada pelo fator do elemento correspondente:
   - 1,1 na máquina da S05 e no planetário;
   - 1,4446 na engrenagem da S07 (= 579,3 / 401);
   - 1,1 no ícone da S04 (440 / 400);
   - ≈ 1,11 nos diferenciais;
   - .895 no lockup.

   Nada pode alterar os valores da tabela de handoffs.

---

## 5. Revisão técnica

Revisão feita contra `src/scenes/*.js` (horizontal implementada), `docs/SCENE_GUIDE.md` e `storyboard/storyboard.json`. Todas as larguras citadas foram **medidas no Chromium do projeto** (Playwright com `assets/fonts.css`), e os centros de "." foram medidos pela tinta do glifo.

### 5.1 O que foi mudado

**Handoffs (a)**
1. **Corte 24,0 e S03 T2.** O push de 1→1,03 de "As duas / somem / na hora H." tinha origem em (90, 975), mas o Ponto fica parado no "." (a horizontal usa origem em P2, o próprio "."). Com a origem antiga, o "." sairia 20 px do Ponto. Agora a origem é o "." em **(767,5, 1117,5)**, e as três linhas começam em **x 110**, de modo que, no fim do push, a margem chega a x 90,3. O Ponto do corte 24,0 e o início do voo da S04 passam de (747,5, 1117,5) para **(767,5, 1117,5)**, nos dois lados.
2. **Corte 34,0.** Unificado em **(540, 1115,1)** na tabela, na S04 e na S05 (antes estava 1115 em dois lugares e 1115,1 em outro). O valor vem de 980 + 70 × 440/228.
3. **Tabela de bg.** "drift 0" e "padrão" viraram estados explícitos: foi criada a definição **BG padrão**, e toda linha lista driftX e driftY. Os valores conferem com os `BG_IN` / `tl.set(bg)` de cada cena horizontal.
4. **Corte 54,0.** A saída da S06 dizia que "o topo da linha vai para o lado de cima do círculo". Pela fórmula, o i = 0 vai para o ponto mais à ESQUERDA (240, 1100). O texto foi corrigido, e foi especificada a interpolação do gradiente do traço (vertical → horizontal x 240–840), que é o que a tabela e a S07 esperam.
5. **Raio do Ponto** declarado dos dois lados em 42,0 (r 10 na saída da S05) e em 54,0 (r 10 na saída da S06).
6. **Corte 82,0.** A posição do Ponto agora traz a fórmula (`ellipsePt(540, 1270, 355, 111, −14°, 0)`). D1/D2 foram conferidos: são a horizontal (220 × 70 e 320 × 100) × 1,11, e não .32·rx.

**Geometria**
7. **S07.** O fator de escala da engrenagem estava inconsistente. O texto dizia "× 1,4464", mas 579,3 / 401 = 1,4446. Tip 607 e root 559 também não batiam com o desenho da horizontal (pr + 19 / pr − 14,6). Agora a spec manda desenhar a geometria horizontal dentro de `gearG` com **gs 1,4446** (tip 606,7, root 558,2, anel 433,4, mancal 184,9, janela 433,4–554,7, números no raio 476,7, borda x 713,3) e fazer o recuo para **gs .341** (= .31 × 1,1; sol com tip 143,2). A chegada é descrita como pr 300→401 + gs 1→1,4446. O §4.7 foi corrigido para 1,4446.
8. **§1.5.** O traço da carcaça de 710 px passou de 51,4 para **49,8** (16 × 710/228). O 54,8 da carcaça de 781 px já estava certo.
9. **S04.** A spec não dava a origem da escala de tensão (1→1,04): agora é **(90, 705)**, com a borda de "consultoria." em x 986,5 (989,5 com o shake). O push pós-drop (1→1,015) ganhou origem no "." de "meccanismo." **(909,4, 688,5)**, como na horizontal. A hairline de ENGENHARIA vai até **x 770,4, y 820,5** (fim da tinta, como na horizontal) e não mais até 780. As coordenadas do Ponto nos riscos passam a ser declaradas antes da escala `sNeg`.
10. **S04, desvio do Ponto entre os riscos.** O trajeto antigo, em y ≈ 705, passava a ~6 px da descendente do "g" de "agência." e do topo do 2º "Não somos". Foi trocado pelo mesmo corredor da horizontal (entre "Não somos" e as ascendentes de "consultoria."): (790, 660) → (730, 792) → (470, 797) → (200, 805) → (66, 830) → (78, 884).
11. **Origens de push que faltavam:** S08 (90, 640); S09 B1 (90, 445), B2 (90, 635), B3 (90, 865), B4 (90, 550). Na S10 havia um push único, mas a horizontal tem dois: agora são linhas 1–2 (1→1,02, 0–4,0, origem (540, 560)) e linhas 3–4 (1→1,03, 0,5–4,0, origem (540, 950)).
12. **S10, entrada por palavra (1,25→1).** As origens por palavra da horizontal foram calibradas para 1920 px e, numa linha de 806 px centrada, jogariam palavras para fora de x 90–990. **ADAPTAÇÃO:** cada palavra escala a partir do centro da própria linha. "mais." mantém a origem no ".". Tempos, easing e stagger não mudam.
13. **§1.7.** Nova regra: pousos em "." são dados antes do push, e o Ponto acompanha o push da linha enquanto está no ".".

**Área segura (c) e tamanhos (d)**
14. **S07, nomes das estações:** 110 → **104 px** (continua ≥ 96). Com 110 × 1,03, "Tecnologia" ia até x 647, a 13–19 px do Ponto estacionado em (676, 1100), abaixo dos 24 px da §1.2. Com 104 px vai até x 616,6.
15. **S07, números 01–07:** a regra de borda da horizontal (números perto da borda direita somem) foi adaptada para `smooth(1040, 970, nx)`. Os vizinhos em (1022,8, 727,3 / 1472,7) ficam em α ≈ .09 e não põem nada legível no trilho de botões.
16. **S03:** foi registrado que a borda direita dos cards (x 970) entra 10 px no trilho de botões. É um contorno decorativo e fica assim para preservar o handoff de 14,0. Nenhum texto passa de x 930.
17. **S04, DROP 1,35→1:** os 2–3 quadros borrados em que "meccanismo." passa de x 990 foram documentados como exceção de quadro de impacto (a escala fica ≤ 1,035 em 6,1).

**Larguras e quebras (b)**
18. **S06, subtítulo:** a horizontal usa tracking −0,02em, e as larguras estavam calculadas com −0,035em. Os valores foram corrigidos: 56 px = **725** (não 702) e 40 px = **518** (não 501).
19. **S06, descrições:** foram incluídos os quatro textos com **quebras obrigatórias** (`<br>`). A 01, com largura 690, ficava a 11 px de virar 3 linhas, e as quebras naturais de 03 e 04 deixavam "e" e "o" soltos no fim da linha. Todas as linhas dos tempos 03 e 04 terminam em x ≤ 873.
20. **S05, chip:** 546 × 58 virou **471 × 60**. É o `.chip` padrão com tracking .02em da horizontal, e não .14em, que é o tracking dos chips da S07.
21. **S06, SG 72 e S07:** as larguras dos nomes, apelidos (Inter 40, −0,01em) e chips foram conferidas. Os limites de cada coluna estão na própria tabela.

**Textos (f)**
22. **S05:** faltava o eyebrow "ENGENHARIA DE CRESCIMENTO", que existe na horizontal (aparecia só na tabela de eyebrows). Ele foi adicionado com os tempos da horizontal (0,5 / 0,55 / 7,5 / 7,79).
23. **S10, verbos:** a quebra em 2 linhas apagava o 3º separador "·" (entre CALIBRAR e OPERAR). Ele foi mantido como pontuação pendurada no fim da linha 1 e acende em 6,5, como na horizontal.
24. **S10:** o "→" do CTA é a seta em SVG da horizontal, não um caractere. A URL ganhou o tracking .08em da horizontal (347 px).
25. **S08:** ficou registrado que ● e ◆ são marcadores CSS, não texto.

### 5.2 O que foi conferido e ficou como estava

- **Handoffs 6,0 / 14,0 / 42,0 / 76,0 / 82,0 / 92,0 / 100,0:** as posições e os raios batem ao pixel dos dois lados. Os dois retângulos de 14,0 batem com a tabela de cards da S03. O Ponto de 14,0, (912,5, 757,5), é o "." de "duas caixas." (medido: 90 + 822,5, 770 − 12,5). A máquina m .6 (sol 78, planetas 46,8 a 118,8, pupila 66, carcaça 426) e o planetário m 1,1 (7 centros recalculados) estão corretos. O lockup de .895 confere: encaixe (281,1, 814,3) e r 7,46 = 10 × 170/228.
- **Todos os centros de "." da spec batem com a medição (±0,5 px):** máquina. (890,7, 1084) · engenharia. (931,3, 886,5) · duas caixas. (912,5, 757,5) · header (928,4, 367) · na hora H. (agora 767,5, 1117,5) · para mais. (912, 1015,5). A geometria da S05 também foi conferida: a transformação da horizontal dá os centros da tabela, incluindo Gd (690,2, 1198,8) pela interseção.
- **Estimativa × medição:** pela regra "caracteres × tamanho × 0,56", estas linhas passariam de 900 px: máquina. (896 × 1,03), Algumas giram; (941), a maioria range. (1075), Não falta esforço — (1021), engenharia. (986), duas caixas. (1008), header da S03 (941), consultoria. (1075), monta as engrenagens (896 × 1,02), Sete engrenagens. (914), A gente assume, (924) e para mais. (952). **Medidas, elas têm 831 / 827 / 859 / 846 / 859 / 839 / 790 / 862 / 827 / 813 / 813 / 782 px e, com o push, ficam todas ≤ 897 px.** A estimativa superestima o SG 700 com −0,035em em 5–25 %. Por isso as quebras não foram mudadas: a própria spec (introdução) define a medida real como referência, e quebrar essas linhas mudaria os pousos do Ponto em cinco handoffs. No mono, a estimativa × 0,8 SUBESTIMA com tracking ≥ .26em (eyebrow de 648 contra 603 estimados; verbos com 655 contra 582). Os valores medidos cabem.
- **Tamanhos mínimos:** todos os títulos (H1–H3) ficam ≥ 96. Os textos de 56–80 px (declaração da S05, que na horizontal tem 60; header da S06; nomes dos tempos; linhas de apoio da S09) são apoio, não título, e ficam ≥ 40. Os labels ficam ≥ 26 (planetas 26, chips 26, contador 28, legenda 26, rótulos 26, eyebrows 26).
- **Viabilidade (e):** as 10 cenas saem da horizontal correspondente trocando constantes de layout (origens, eixos, passo da cremalheira, clip). As adaptações de coreografia (morph empilhado na S02, linha do tempo vertical na S05/S06, rack vertical com passo de 520 na S07, verbos em 2 linhas na S10) mantêm os mesmos tempos, easings e cues.
- **Textos:** conferidos caractere a caractere contra `h.text`, `h.eyebrow`, `h.chip`, `STATIONS`, `NAMES` e `DESCS` da horizontal. Só mudam quebras de linha.
