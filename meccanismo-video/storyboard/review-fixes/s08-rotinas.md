# Correções da revisão global — s08-rotinas (versão HORIZONTAL, src/scenes/s08-rotinas.js)

Tempos são GLOBAIS (subtraia o início da cena para obter o tempo local).

## 1. [MAJOR] 76.5–81.6
**Problema:** A palavra 'rotinas' não aparece em nenhum lugar, então 'É o que os mecca rodam enquanto você dorme.' fica sem antecedente. A legenda das 4 classes está em mono de 20 px no canto inferior esquerdo, a ~600 px dos anéis que identifica, e deixa uma zona morta entre a manchete e a legenda.

**Correção:** (a) Trocar o eyebrow por 'AS ROTINAS · O QUE GIRA POR DENTRO'. (b) Subir a legenda para mono de 26 px, com o título 'ROTINAS' em #A78BFA acima, e posicioná-la logo abaixo da manchete (x 192, baselines ≈470/520/570/620/670). Bolinhas com r 6. Ligar cada item ao seu anel com um leader line hairline lavanda α .25, que acende junto com o item (1.5 / 2.0 / 2.5 / 3.0 local).

*Como foi confirmado:* Nos quadros 78.0 e 80.0 a legenda é mínima e fica no rodapé, longe dos anéis, e não há 'rotinas' na tela.

## Nota global — mask
MÁSCARAS (nota global 1): enquanto a máscara de entrada desacelera, descendentes/cedilhas ficam cortadas (ex.: 'O mercado te dá' decapitado em 14.03). No wrapper da máscara desta cena use padding-bottom ≈ .28em / margin-bottom −.28em (e padding-top ≈ .12em para acentos em caixa alta), AJUSTANDO o deslocamento inicial (yPercent) para que o texto comece totalmente escondido abaixo da máscara ampliada (nenhum pedaço aparecendo no quadro anterior à entrada).

## Nota global — push
PUSH DE CÂMERA (nota global 2): o push lento com origem no centro tira o eyebrow e a coluna de texto da margem x=192. Tire o eyebrow do wrapper que recebe o push e aplique o push com transformOrigin na margem esquerda (ex.: '192px 540px'), para a margem ficar fixa. Mantenha primeiro/último quadro dos handoffs.

## Nota global — carcass
CARCAÇA DO ÍCONE (nota global 5 — S07/S08/S09 precisam usar EXATAMENTE a mesma função): hoje a carcaça (arcos do ícone) gira sem parar a −12°/s e em 82–85 s o logo fica de cabeça para baixo. Nova regra COMPARTILHADA, calculada a partir do tempo GLOBAL gt (2º argumento de onFrame): ângulo_carcaça(gt) = 0 para gt < 72; para gt ≥ 72: 18° · sin(2π·(gt − 72)/4) · smooth(72, 72.6, gt) (h.smooth). Isso dá 0° exatos em 76.0 e 82.0 (cortes) com velocidade contínua. Sol e planetas continuam girando como estão; só a carcaça oscila.

## Nota global — pop
POP NO FIM DOS FADES (nota global 4): saídas por opacidade com mecca.in terminam com salto de ~55%→0 num quadro. Regra: mecca.in só em transformações; em autoAlpha/opacity use 'power1.in' ou 'sine.in'. Revise todas as saídas desta cena.
