# Correções da revisão global — s03-duas-caixas (versão HORIZONTAL, src/scenes/s03-duas-caixas.js)

Tempos são GLOBAIS (subtraia o início da cena para obter o tempo local).

## 1. [MAJOR] 14.0–14.25
**Problema:** O impact 'slam T1' de 14.0 cai num quadro sem texto. 'O mercado te dá' só aparece em ~14.03–14.07, e 'duas caixas.' entra em ~14.17 e assenta em ~14.23. O golpe visual chega 6 a 8 quadros depois do som. Durante o slam, os retângulos tracejados dos cards também atravessam 'caixas'.

**Correção:** Trocar a entrada para slam real: tl.fromTo([B.inner, A.inner], {yPercent:110}, {yPercent:0, duration:0.18, ease:'expo.out', stagger:0.03}, 0), com 'duas caixas.' primeiro. Somar scale 1.08→1 no wrapper (0,25 s, expo.out) e h.shake(root, amp 4, 0,2 s) em 0. Entre 0 e 1.0 local, baixar o stroke tracejado dos cards para α .12, voltando a .3 em 1.0.

*Como foi confirmado:* A 30 fps, de 13.95 a 14.4: o quadro de 14.0 está vazio, a frase aparece cortada em 14.03 e 'duas caixas.' só fica completa em ~14.23.

## 2. [MAJOR] 15.0–15.4
**Problema:** FLIP embolado. 'O mercado te dá' e 'duas caixas.' seguem caminhos separados, e 'duas caixas.' ainda grande passa por cima de 'Executa a peça' e da área da caixa 2, enquanto o label digita e o texto da caixa 1 sobe. A frase fica partida por ~0,4 s, no click e whoosh de 15.0.

**Correção:** Antecipar o FLIP para 0.75–1.1 local (14.75–15.1, mecca.inOut), movendo as duas linhas como um grupo só (ou crossfade das linhas grandes para o header, sem trajetórias separadas). Só então, em 1.1, iniciar a máscara de 'Executa a peça', a digitação do label e a solidificação do fill da caixa 1. A caixa 2 continua em 1.5.

*Como foi confirmado:* Nos quadros de 15.03 a 15.4, 'duas caixas.' sobrepõe 'Executa a peça' (15.03) e atravessa a caixa 2 (15.1–15.3) separada de 'O mercado te dá'.

## 3. [MAJOR] 18.5–18.8 / 19.0–19.35
**Problema:** Os cliques de 'caixa 1 fecha' (18.5, com sub-drop) e 'caixa 2 fecha' (19.0) vêm antes do golpe visual. closeBox() começa na batida com scaleY em mecca.in, e a caixa só achata entre ~18.67 e 18.8 (a caixa 2 entre ~19.2 e 19.33), cerca de 0,25–0,3 s depois do som.

**Correção:** Em closeBox(), trocar o scaleY para power3.out com 0,18 s e o scaleX para 0,12 s, começando no 'at'. Assim o achatamento nasce no clique. Outra opção é manter a curva e chamar closeBox em 4.2 e 4.7 local, para o scaleY terminar exatamente em 4.5 e 5.0. A evaporação de 'some.' continua em 4.5 e 5.0.

*Como foi confirmado:* Extraí 18.45–19.45 a 30 fps. Em 18.6 a caixa 1 está intacta, em 18.73 encolhendo e em 18.8 vira uma linha. A caixa 2 ainda está achatando em 19.27.

## 4. [MINOR] 20.0–23.5 (cards 16.0–19.0)
**Problema:** As ilustrações dos cards (post e slide) ficam pequenas e presas ao canto superior esquerdo, com ~400×250 px vazios em cada card.

**Correção:** Escalar as duas ilustrações ~1,4× (post ≈364×263, slide ≈448×252), com topos alinhados em y 360, mantendo stroke de 2 px com vector-effect: non-scaling-stroke.

*Como foi confirmado:* No quadro 18.47 os ícones ocupam só o canto esquerdo dos cards.

## 5. [MINOR] 15.5 (1 quadro)
**Problema:** Queda de brilho de 1 quadro no header 'O mercado te dá duas caixas.'. O crossfade simétrico A/B→HD deixa os dois a α .5 em 1.50.

**Correção:** Em s03-duas-caixas.js (~l.245–246): tl.set(HD.outer, {autoAlpha:1}, 1.47) e tl.set([A.outer, B.outer], {autoAlpha:0}, 1.5), no lugar do crossfade.

*Como foi confirmado:* Medi a região do header: a luma média cai de 45 para 39 exatamente no quadro de 15.5 e volta a 45 no seguinte.

## 6. [MINOR] 23.87→23.90
**Problema:** Pop no fim da saída de 'As duas somem / na hora H.': o texto ainda está visível no penúltimo quadro e some de uma vez, porque a opacidade usa mecca.in.

**Correção:** Em s03-duas-caixas.js (l.330–331), separar os tweens: y continua em mecca.in e autoAlpha passa a 'power1.in' (ou 'sine.in'), para o último quadro visível ficar abaixo de ~10%.

*Como foi confirmado:* Pixels claros (>120) na área do texto: 69.186 em 23.85 e 631 em 23.88, um salto de um quadro.

## Nota global — mask
MÁSCARAS (nota global 1): enquanto a máscara de entrada desacelera, descendentes/cedilhas ficam cortadas (ex.: 'O mercado te dá' decapitado em 14.03). No wrapper da máscara desta cena use padding-bottom ≈ .28em / margin-bottom −.28em (e padding-top ≈ .12em para acentos em caixa alta), AJUSTANDO o deslocamento inicial (yPercent) para que o texto comece totalmente escondido abaixo da máscara ampliada (nenhum pedaço aparecendo no quadro anterior à entrada).

## Nota global — pop
POP NO FIM DOS FADES (nota global 4): saídas por opacidade com mecca.in terminam com salto de ~55%→0 num quadro. Regra: mecca.in só em transformações; em autoAlpha/opacity use 'power1.in' ou 'sine.in'. Revise todas as saídas desta cena.
