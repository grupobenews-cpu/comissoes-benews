# Correções da revisão global — s06-plano-de-voo (versão HORIZONTAL, src/scenes/s06-plano-de-voo.js)

Tempos são GLOBAIS (subtraia o início da cena para obter o tempo local).

## 1. [MAJOR] 41.9–42.3
**Problema:** O Ponto chega da S05 em alta velocidade, para seco em (≈178,598) às ~41.93 e fica parado até ~42.2. O impact de 42.0 ('abre o plano de voo') cai num quadro imóvel, com só um halo tênue depois.

**Correção:** Em orbitAngle(), começar em ω = π rad/s desde t=0 (sem a rampa S(t/0,5)) ou usar rampa linear de no máximo 0,1 s. Colocar um acento em t=0: halo r 10→48 com α .6→0 em 0,3 s, riders entrando com mecca.back em 0.0 e pulso de bg.grid.

*Como foi confirmado:* Extraí 41.85–42.4 a 30 fps. O Ponto fica na mesma posição do quadro ~41.93 até ~42.2, só com o eyebrow digitando.

## 2. [MINOR] 50.5–53.4
**Problema:** Cerca de 3 s quase estáticos no groove. O chime de 50.5 só inicia um círculo de r 22, e os pulsos dos nós (r 10→15) quase não aparecem.

**Correção:** Pulsos dos nós com scale 1→2 e anel r 10→40, α .6→0, só em 51.5 e 52.0 (onde há cue). Ponto em giro com r 22→34, rastro e pulso no chime de 50.5. Push lento de 1→1,02 no grupo da linha do tempo entre 50.0 e 53.4.

*Como foi confirmado:* O quadro 52.5 está idêntico às batidas vizinhas, sem acento visível.

## 3. [MINOR] 53.6–53.8
**Problema:** No morph linha→círculo, a polyline se cruza e forma um laço na ponta direita.

**Correção:** Interpolar cada ponto em coordenadas polares em torno de (960,540), com raio e ângulo em lerp a partir da projeção atual, em vez de lerp cartesiano até π − i·2π/63.

*Como foi confirmado:* No quadro 53.70 aparece um laço fechado à direita do arco.

## Nota global — push
PUSH DE CÂMERA (nota global 2): o push lento com origem no centro tira o eyebrow e a coluna de texto da margem x=192. Tire o eyebrow do wrapper que recebe o push e aplique o push com transformOrigin na margem esquerda (ex.: '192px 540px'), para a margem ficar fixa. Mantenha primeiro/último quadro dos handoffs.

## Nota global — pop
POP NO FIM DOS FADES (nota global 4): saídas por opacidade com mecca.in terminam com salto de ~55%→0 num quadro. Regra: mecca.in só em transformações; em autoAlpha/opacity use 'power1.in' ou 'sine.in'. Revise todas as saídas desta cena.

## Nota global — audio6
ÁUDIO (nota global 6b): os pulsos visuais de 51.75 e 52.25 não têm cue; acrescente ticks (cue(9.75,'tick','pulso',0.3), cue(10.25,'tick','pulso',0.3)) ou deixe só os pulsos de 51.5 e 52.0 — escolha o que casar com a correção do ritmo da S06.
