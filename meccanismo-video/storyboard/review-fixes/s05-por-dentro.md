# Correções da revisão global — s05-por-dentro (versão HORIZONTAL, src/scenes/s05-por-dentro.js)

Tempos são GLOBAIS (subtraia o início da cena para obter o tempo local).

## 1. [MAJOR] 39.0–41.5
**Problema:** 'Os mecca' só é apresentado no chip mono de 20 px 'TIME EMBARCADO · OS MECCA', enquanto a atenção está no trem de engrenagens. O termo volta como sujeito na S06, na S08 e na S09, e quem é novo não sabe o que é.

**Correção:** Substituir o chip por uma linha de texto em 39.0: Space Grotesk 600, 44 px, x 192, baseline ≈790, 'Time embarcado: os mecca.', com 'os mecca' em <em> gradiente. Entrada por máscara (0,4 s, mecca.out) e saída junto com o bloco em 7.5 local.

*Como foi confirmado:* Nos quadros 39.5 e 40.5 o chip é o menor elemento da tela, bem menor que as linhas de 60 px.

## 2. [MINOR] 36.0–41.5
**Problema:** Quando as linhas 1 e 2 caem para α .5, as palavras em gradiente 'por dentro' e 'monta' viram roxo escuro sobre roxo, e justamente a expressão-chave perde contraste.

**Correção:** Escurecer para α .7 em vez de .5. Durante o escurecimento, trocar o fill dos <em> escurecidos de gradiente para color #C4B5FD (tween de 0,3 s), ou manter os <em> em α 1 e escurecer só as palavras comuns.

*Como foi confirmado:* Em 39.5 'por dentro' e 'monta' estão bem mais apagados que o resto da linha escurecida.

## Nota global — mask
MÁSCARAS (nota global 1): enquanto a máscara de entrada desacelera, descendentes/cedilhas ficam cortadas (ex.: 'O mercado te dá' decapitado em 14.03). No wrapper da máscara desta cena use padding-bottom ≈ .28em / margin-bottom −.28em (e padding-top ≈ .12em para acentos em caixa alta), AJUSTANDO o deslocamento inicial (yPercent) para que o texto comece totalmente escondido abaixo da máscara ampliada (nenhum pedaço aparecendo no quadro anterior à entrada).

## Nota global — pop
POP NO FIM DOS FADES (nota global 4): saídas por opacidade com mecca.in terminam com salto de ~55%→0 num quadro. Regra: mecca.in só em transformações; em autoAlpha/opacity use 'power1.in' ou 'sine.in'. Revise todas as saídas desta cena.
