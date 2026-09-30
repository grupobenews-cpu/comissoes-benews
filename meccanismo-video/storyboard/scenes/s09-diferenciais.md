# Cena 9/10: s09-diferenciais

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
### s09-diferenciais — A gente assume, fica e tem pele no jogo
- início global: 82 s · duração: 10 s · tail (sobreposição após o fim): 0 s
- objetivo: Os diferenciais como manifesto, cada um demonstrado fisicamente:
- assume, não aconselha: o Ponto toma o motor;
- fica, não entrega e some: a caixa-fantasma some e o Ponto continua;
- pele no jogo: sócio de resultado, no sistema binário SUA EMPRESA / OS MECCA;
- cresceu, a gente cresce junto: o binário cresce junto.

**Texto na tela** (tempos relativos à cena):
- [0.5–9.5 s] «A GENTE ASSUME, OPERA E FICA» — estilo: h.eyebrow 22 px em (192,120) — animação: Digitação.
- [0.5–6 s] «A gente assume, / não aconselha.» — estilo: 'A gente assume,' em Space Grotesk 700, 110 px, ink, x 192, baseline 250 ('assume,' em <em>). 'não aconselha.' em Space Grotesk 600, 56 px, #A99CC4, x 192, baseline 320. — animação: Linha a em 0,5, com o verbo batendo: scale 1,25→1, 0,25 s, expo.out, origem à esquerda. Linha b em 1,0 por máscara. Em 1,5, h.strike sobre 'aconselha' (espessura 6, gradiente, 0,25 s). Em 2,0, o bloco cai para α .45 ('assume,' fica em .7). Saída em 6,0–6,3 (x −60, fade, mecca.in).
- [2–6 s] «A gente fica, / não entrega e some.» — estilo: 'A gente fica,' em 110 px, baseline 450 ('fica,' em <em>). 'não entrega e some.' em 56 px, #A99CC4, baseline 520. — animação: Linha a em 2,0 com o mesmo bater do verbo. Linha b em 2,5. Em 3,0, risco sobre 'entrega e some'. Em 3,5 o bloco cai para α .45, mas 'fica,' CONTINUA em α 1. Saída em 6,0–6,3.
- [3.5–9.5 s] «A gente tem / pele no jogo — / sócio de resultado.» — estilo: 'A gente tem' em Space Grotesk 500, 56 px, #C4B5FD, baseline 610. 'pele no jogo —' em Space Grotesk 700, 110 px, <em> gradiente, com glow rosa, baseline 720. 'sócio de resultado.' em Space Grotesk 700, 56 px, ink, baseline 795. Tudo em x 192. — animação: 'A gente tem' e 'pele no jogo —' em 3,5, por máscara, com o verbo batendo. 'sócio de resultado.' em 4,0, com sublinhado em gradiente de 3 px se desenhando (4,0–4,5). 'pele no jogo' pulsa text-shadow 0 0 24px #E249B0 (α .55↔0) em cada batida de 4,0 a 6,0. Em 7,0 o bloco cai para α .55. Saída em 9,5–9,8.
- [6.5–9.5 s] «Cresceu, / a gente cresce junto.» — estilo: 'Cresceu,' em Space Grotesk 700, 150 px, <em> gradiente, x 192, baseline 330 (≈588 px). 'a gente cresce junto.' em Space Grotesk 700, 72 px, ink, x 192, baseline 430. — animação: Máscara em 6,5 (linha 2 com +0,1 s). 'Cresceu,' CRESCE junto: +3% de escala em cada batida de 7,0 a 9,0 (0,18 s, mecca.back, origem esquerda-base), até 1,12. Saída em 9,5–9,8.

**Layout:** PRIMEIRO QUADRO: igual ao último da S08 (máquina em (1440,560) com scale .45; D1 com rx 220 e ry 70; D2 com rx 320 e ry 100, rot −14°; Ponto em (1750,483); sem texto).

Texto em coluna à esquerda, x 192–1100:
- baselines 250/320, 450/520 e 610/720/795;
- depois de 6,5, 'Cresceu' ocupa as baselines 330/430.

Área de demonstração à direita, centrada em (1440,560), com extensão x ≈ 1125–1760.

V da pupila (cubo da máquina) em ≈(1440,546).

**Visuais:** A máquina pequena com o anel D1/D2 em volta.

- ASSUME: o Ponto mergulha no V da pupila e a máquina acelera.
- FICA: o Ponto orbita D2 deixando rastros-anel que se acumulam. Uma caixa-fantasma tracejada slate de 120×80 (rima com a S03) passa em D1 e se desfaz em partículas no 'some'.
- PELE NO JOGO: a máquina colapsa na pupila e a pupila vira o corpo A 'SUA EMPRESA'. O Ponto vira o corpo B 'OS MECCA'. Os dois formam um sistema binário ligado por um fio em gradiente com glow.
- CRESCE JUNTO: órbitas e corpos crescem juntos, com ondas saindo do baricentro.

**Coreografia:** 0,5–1,0: o Ponto sai de D2 e mergulha no V (1440,546) (power3.in).

1,0: ENCAIXE
- A pupila pisca #7C3AED→#C4B5FD→#7C3AED.
- A máquina acelera: sol de 36 para 90°/s (0,3 s, power2.out), assentando em 72°/s (0,7 s). Planetas pela razão de dentes.
- Onda curta r 60→180.

2,0
- O Ponto sai do cubo para D2 (0,3 s) e passa a orbitá-la com período de 1 s.
- A cada volta deixa um anel-rastro com α acumulando de .15 a .5 (fica).

2,5: caixa-fantasma entra
- Retângulo 120×80, raio 10, stroke #64748B 1,5 px, dash 6/6.
- Entra pela esquerda sobre D1 no ângulo 180° e viaja pela elipse.

3,0: 'some'. A caixa se solta pela tangente e vira 24 partículas slate que somem em 0,4 s.

3,5–4,0: PELE NO JOGO
- Os planetas recolhem para o sol e o sol some (0,3 s, mecca.in). A carcaça faz fade.
- A pupila faz MorphSVG para um círculo r 40 com fill radial #C4B5FD→#6D28D9: corpo A.
- D1/D2 vão para α .15.
- A partir de 4,0, sistema binário em volta do baricentro (1440,560), a 72°/s:
  - A em órbita de 40×14;
  - B (o Ponto, r 11) em órbita de 200×70;
  - θB = θA + 180°;
  - rot −14°.
- Fio de 2 px entre A e B, gradiente #C026D3→#7C3AED, com glow.
- Rótulos: 'SUA EMPRESA' (mono 16 #C4B5FD, 50 px abaixo de A) e 'OS MECCA' (mono 16 #E249B0, 28 px acima de B), entrando em 4,0.

6,5–9,5: CRESCE JUNTO
- Baricentro y 560→480 (3,0 s, power1.inOut).
- Órbita de A 40→56 e de B 200→250.
- Raio de A 40→52 e de B 11→15.
- Rastros em espiral nos últimos 1,2 s.
- Ondas elípticas saindo do baricentro em 7,0 / 7,5 / 8,0 / 8,5: rx 250→420, α .45→0, 0,9 s, power2.out.

**Transição de saída:** Pré-drop: o binário implode num ponto único de energia. Tail 0.

9,5–10,0:
- O texto sai.
- O binário espirala para dentro (órbitas →0, power3.in). A e B se fundem num ponto núcleo #FBF8FF com r 20 e glow ×2, que vai para (960,500).
- Fio e rótulos fazem fade.
- bg.warp 0→.5, speed 1→2.

ÚLTIMO QUADRO:
- Só o ponto fundido em (960,500) com r 20 e glow forte.
- bg: warp .5, speed 2, resto no padrão.
- Sem texto.

**Cues de som** (tempo local): 0.5s impact ('assume' .7); 1s click (Ponto assume o motor .9); 1.5s whoosh (risco .3); 2s impact ('fica' .7); 3s glitch (caixa some .35 (+whoosh risco .3)); 3.5s impact ('pele no jogo' .8); 4s chime (sócio de resultado .5); 6.5s impact ('Cresceu' .6); 7s tick (cresce .3); 7.5s tick (.3); 8s tick (.3); 8.5s tick (.3); 10s riser (pico no corte 1.0)

## Cena ANTERIOR (contexto para a transição de entrada — outra pessoa implementa)
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

## Cena SEGUINTE (contexto para a transição de saída — outra pessoa implementa)
### s10-assinatura — Quando a máquina engrena, ela não para mais
- início global: 92 s · duração: 8 s · tail (sobreposição após o fim): 0 s
- objetivo: Clímax e assinatura. A tagline sobre a máquina acelerando, depois a convergência para o lockup oficial, o CTA 'Abrir minha máquina →', meccanismo.com.br e o ciclo ENGRENAR · MONTAR · CALIBRAR · OPERAR · GIRAR. O Ponto volta para casa: encaixa no ícone e o logo fica completo.

**Texto na tela** (tempos relativos à cena):
- [0.5–8 s] «// cada máquina tem o seu ritmo» — estilo: JetBrains Mono 500, 22 px, #A78BFA, minúsculas (h.text com cls t-mono, sem uppercase), tl em (192,108) — animação: Digitação a 0,025 s/char.
- [0–4 s] «Quando a máquina engrena,» — estilo: Space Grotesk 700, 124 px, ink, centrado em x 960, baseline 440 (≈1563 px), 'engrena,' em <em> — animação: Palavras escalam 1,25→1 com fade (0,5 s, power4.out, stagger .06). Saída em 4,0–4,5: chars scale →.6 e fade em direção ao centro, stagger das bordas para dentro (.008).
- [0.5–4 s] «ela não para mais.» — estilo: Space Grotesk 700, 190 px, ink, centrado em x 960, baseline 680 (≈1530 px). O '.' de 'mais.' é transparente até 2,0: é o Ponto. — animação: Palavras escalam 1,25→1 (0,5 s, power4.out, stagger .06). Push lento de 1→1,03. Saída igual à linha de cima.
- [4.5–8 s] «Meccanismo (lockup: ícone + wordmark)» — estilo: h.icon de 190 px SEM ponto até 7,0, com bbox x 497–687 e y 325–515 (centro (592,420)). h.logo de 700 px com bbox x 723–1423 e y 346–494 ('Mecca' em gradiente, 'nismo' em #F5F3FF). Glow radial violeta α .35 atrás do lockup. — animação: Arcos do ícone com DrawSVG 0→100% (0,5 s, mecca.out). Pupila scale 0→1 (mecca.back). Wordmark revelado por clip-path inset(0 100% 0 0)→inset(0), 0,6 s, mecca.out, a partir de 4,6.
- [5–8 s] «ENGRENAR · MONTAR · CALIBRAR · OPERAR · GIRAR» — estilo: JetBrains Mono 500, 24 px, tracking .3em, centrado em x 960, baseline 610 (≈886 px). Começa em #A78BFA α .35. — animação: Chars aparecem com stagger .01. Onda de brilho: cada verbo passa a ink #FBF8FF com glow e fica aceso. ENGRENAR em 5,0, MONTAR em 5,5, CALIBRAR em 6,0, OPERAR em 6,5, GIRAR em 7,0.
- [5–8 s] «Abrir minha máquina →» — estilo: Botão pílula de 520×92 centrado em (960,740), fill #7C3AED, box-shadow 0 0 40px rgba(124,58,237,.5), texto Inter 600 34 px #FBF8FF — animação: Pop: scale .85→1 com fade, 0,4 s, mecca.back. Brilho atravessa o botão em 6,0 (faixa diagonal branca α .25, 0,5 s). A seta '→' dá um nudge de +8 px em cada batida de 5,5 a 7,5 (yoyo de 0,25 s).
- [5.5–8 s] «meccanismo.com.br» — estilo: JetBrains Mono 500, 26 px, #C4B5FD, minúsculas, centrado em x 960, baseline 860 — animação: Digitação (stagger .03).

**Layout:** PRIMEIRO QUADRO: igual ao último da S09 (ponto fundido em (960,500) com r 20; warp .5; speed 2; sem texto).

De 0,0 a 4,0:
- Tagline centrada (baselines 440 / 680).
- Atrás dela, uma máquina a α .18: 7 engrenagens (r 110, 14 dentes) em volta de (960,560), com o ícone central sem ponto (180 px, α .25).
- 3 órbitas grandes com centro (960,560):

  | rx | ry | rot |
  |---|---|---|
  | 1000 | 300 | −6° |
  | 800 | 240 | −3° |
  | 600 | 180 | −9° |

Depois de 4,5, lockup centrado:
- ícone em x 497–687;
- wordmark em x 723–1423;
- verbos com baseline 610;
- CTA centrado em (960,740);
- URL com baseline 860.

Encaixe final do ponto: (670,458), r 8,3 (= (208,160) × 190/228 + (497,325)).

**Visuais:** Drop final:
- flash;
- onda de choque;
- a máquina de fundo engata e acelera;
- órbitas com riders e rastros;
- o Ponto deixa de ser o ponto final de 'mais.' e passa a orbitar a frase: literalmente não para.

Depois tudo converge para o lockup oficial. O Ponto orbita o ícone e, no último tempo, encaixa em casa, mudando de branco para #7C3AED. O último quadro é limpo e serve de thumbnail.

**Coreografia:** 0,0: DROP FINAL (global 92,0)
- h.flash(#C4B5FD, pico .5, 0,35 s).
- Onda de choque a partir de (960,500): r 0→1300, lavanda 3 px.
- bg.warp .5→0 e speed 2→1 (0–0,5).
- glowA/B 1→1,4→1,1.
- As 7 engrenagens de fundo ENCAIXAM do raio 420 para 330 em volta de (960,560) (mecca.gear, stagger .04) e começam a girar a 30°/s, em sentidos alternados.
- As órbitas se desenham (0,6 s) com riders #C026D3 / #A78BFA / #C4B5FD e rastros de 12 posições.

0,0–0,5: o Ponto sai de (960,500) e vira o '.' de 'mais.' (≈1712,670), com r 20→14.

1,0–4,0: NÃO PARA
- Engrenagens de 30°/s para 300°/s (power2.in).
- Riders ×1→×4, rastros mais longos.
- bg.warp 0→.45 e speed 1→2,5.
- A partir de 2,0 o Ponto sai do '.' e orbita a frase numa elipse com centro (960,560), rx 820, ry 130, rot −4°. O período cai de 1,5 s para 0,75 s até 4,0, com rastro em gradiente.

4,0–4,5: CONVERGÊNCIA
- A tagline sai.
- Engrenagens e órbitas colapsam em (960,560) (0,4 s, mecca.in).
- warp →0, speed →1.
- O Ponto é puxado para uma órbita circular r 130 em volta de (592,420), 1 volta/s, com rastro.

4,5: lockup. 5,0: verbos e CTA. 5,5: URL.

6,5–7,0: o Ponto espirala para dentro (raio 130→0 em volta do encaixe, power3.in) até (670,458).

7,0: CLIQUE FINAL
- O Ponto encaixa: r 8,3, cor de núcleo #FBF8FF para #7C3AED (glow some).
- Anel r 0→90, lavanda, α .8→0, 0,5 s.
- GIRAR acende.
- Pulso do lockup (scale 1→1,02→1).
- glowA/B 1,1→1,4→1,1.

7,0–8,0: hold.
- Uma órbita fina (rx 560, ry 170, centro (960,440), α .12) com um rider minúsculo (r 3, período 4 s) continua girando em volta do lockup.
- O glow do lockup respira.

**Transição de saída:** Fim do vídeo. Não há corte.

ÚLTIMO QUADRO (thumbnail):
- Lockup completo com o ponto #7C3AED no encaixe.
- Verbos acesos.
- CTA.
- URL.
- Órbita fina com rider.
- bg padrão com glowA/B 1,1.

**Cues de som** (tempo local): 0s impact (DROP final 1.0); 0s sub-drop (.8); 0.5s impact (segunda linha .7); 2s whoosh (Ponto sai orbitando .3); 3s whoosh (.3); 4.5s reverse (pico na convergência .8); 4.5s impact (lockup .9); 5s tick (ENGRENAR .4); 5s click (CTA .6); 5.5s tick (MONTAR .4); 6s tick (CALIBRAR .4); 6.5s tick (OPERAR .4); 7s click (ponto encaixa 1.0); 7s chime (GIRAR 1.0)

