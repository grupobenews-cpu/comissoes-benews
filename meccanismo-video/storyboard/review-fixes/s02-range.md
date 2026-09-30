# Correções da revisão global — s02-range (versão HORIZONTAL, src/scenes/s02-range.js)

Tempos são GLOBAIS (subtraia o início da cena para obter o tempo local).

## 1. [MAJOR] 6.6–6.8, 7.8–8.0, 8.6–8.8 (repete a cada volta)
**Problema:** O Ponto que orbita 'giram' encosta nos glifos vizinhos e cria pontuação falsa. Em ~6.7 ele cola no ';' e lê-se 'giram;:'. Em ~7.87 pousa depois de 'Algumas' e lê-se 'Algumas.'. A hairline da órbita atravessa o 's' e o ';'.

**Correção:** Em s02-range.js, reduzir o rx da órbita de 'giram' para largura/2 + 16 e subir o ry para ~100, para que as pontas não alcancem 'Algumas' nem ';' e a metade da frente passe abaixo das descendentes. Desenhar o Ponto (e o trecho da órbita) no canvas de trás, abaixo do texto, quando sin(φ) < 0, como já faz a órbita da S01.

*Como foi confirmado:* Extraí 6.6–6.9 e 7.8–8.1 a 30 fps. Nos quadros ~6.7 e ~7.87 o Ponto branco aparece colado ao ';' e logo depois de 'Algumas'.

## 2. [MINOR] 10.27–10.40 e 13.67–13.77
**Problema:** No voo rápido, o rastro do Ponto aparece como 6 a 8 contas roxas separadas, e não como o cometa contínuo da S01 e da S03.

**Correção:** Em drawPonto (s02-range.js), trocar os 8 círculos amostrados a 1/60 s por um traço contínuo afunilado pelas posições amostradas (≥ 24 amostras, lineCap round, largura de r até 0, gradiente #C026D3→#7C3AED), reaproveitando a função de rastro da S01.

*Como foi confirmado:* Nos quadros 10.33 e 13.70 o rastro mostra discos separados.

## Nota global — mask
MÁSCARAS (nota global 1): enquanto a máscara de entrada desacelera, descendentes/cedilhas ficam cortadas (ex.: 'O mercado te dá' decapitado em 14.03). No wrapper da máscara desta cena use padding-bottom ≈ .28em / margin-bottom −.28em (e padding-top ≈ .12em para acentos em caixa alta), AJUSTANDO o deslocamento inicial (yPercent) para que o texto comece totalmente escondido abaixo da máscara ampliada (nenhum pedaço aparecendo no quadro anterior à entrada).
