# Correções da revisão global — s04-virada (versão HORIZONTAL, src/scenes/s04-virada.js)

Tempos são GLOBAIS (subtraia o início da cena para obter o tempo local).

## 1. [MINOR] 28.5–29.2
**Problema:** As quedas de 'agência.'/'consultoria.' e dos 'Não' usam power2.in por 0,6 s. A reação ao glitch de 28.5 atrasa e, em 29.0 (STOP da música), as letras ainda estão caindo, o que dilui o silêncio.

**Correção:** Em fall(): acrescentar um kick no cue (y −10, rotação 4°, 0,06 s, power2.out) e depois a gravidade. Reduzir dur de 0,6 para 0,42 (o 'Não' de 0,4 para 0,25), com o fade de opacidade começando em 0,5×dur, para tudo sumir até ~28.97.

*Como foi confirmado:* Achado de timing do crítico, coerente com as curvas descritas. Em 29.3 ainda restam só os 'somos', o que confirma que a limpeza termina tarde.

## 2. [MINOR] 29.27–29.33
**Problema:** O crossfade 's'→'S' de 'Somos' mostra os dois glifos semitransparentes com um vão: lê-se 'S omos'.

**Correção:** Fazer a troca na parte rápida da convergência (≈5.1–5.2 local), com crossfade de no máximo 0,1 s, e animar o x de 'omos' pela diferença w('S') − w('s') no mesmo tween. Outra opção é trocar por roll vertical mascarado (yPercent) em vez de alpha.

*Como foi confirmado:* No quadro 29.3 aparece um 's' cinza separado de 'omos' lilás.

## 3. [MINOR] 30.5–33.4
**Problema:** 'ENGENHARIA DE CRESCIMENTO', a única definição de categoria da marca, aparece em mono de 28 px com tracking .32em e é digitada, ficando completa só ~1,9 s.

**Correção:** Subir para mono de 32 px com tracking .18em e entrar a linha inteira em 30.5 (fade + y 12→0, 0,3 s, sem digitação), mantendo a hairline e a saída em 33.5.

*Como foi confirmado:* Nos quadros 32.0 e 32.5 o rótulo se lê em 1080p, mas é o menor elemento da revelação.

## 4. [MINOR] 32.2–32.8
**Problema:** O shimmer sobre 'mecca' é largo e claro, e desfaz a divisão gradiente 'mecca' / ink 'nismo' no quadro principal da virada.

**Correção:** Estreitar a banda do shimmer para no máximo a largura de um caractere, cor #E249B0 ou #C4B5FD com pico de opacidade .35 e ease sine.inOut.

*Como foi confirmado:* Em 32.5 'mecca' aparece clareado, quase na cor de 'nismo'.

## 5. [MINOR] 33.65–33.85
**Problema:** No mergulho na pupila, o ícone vira um violeta #7C3AED chapado que cobre boa parte do quadro, sem sombreamento. Parece um quadro de cor sólida.

**Correção:** Durante o zoom, trocar o fill da pupila por gradiente radial (#7C3AED na borda interna → #4C1D95 na externa) e aplicar blur proporcional à escala (0→12 px a partir de scale 8).

*Como foi confirmado:* No quadro 33.77 formas violeta chapadas cobrem ~70% da tela.

## Nota global — push
PUSH DE CÂMERA (nota global 2): o push lento com origem no centro tira o eyebrow e a coluna de texto da margem x=192. Tire o eyebrow do wrapper que recebe o push e aplique o push com transformOrigin na margem esquerda (ex.: '192px 540px'), para a margem ficar fixa. Mantenha primeiro/último quadro dos handoffs.

## Nota global — pop
POP NO FIM DOS FADES (nota global 4): saídas por opacidade com mecca.in terminam com salto de ~55%→0 num quadro. Regra: mecca.in só em transformações; em autoAlpha/opacity use 'power1.in' ou 'sine.in'. Revise todas as saídas desta cena.
