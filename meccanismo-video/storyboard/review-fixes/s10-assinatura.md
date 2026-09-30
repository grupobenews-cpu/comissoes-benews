# Correções da revisão global — s10-assinatura (versão HORIZONTAL, src/scenes/s10-assinatura.js)

Tempos são GLOBAIS (subtraia o início da cena para obter o tempo local).

## 1. [MAJOR] 96.5–96.95
**Problema:** O pico do reverse e o impact 0.9 'lockup' em 96.5 caem num quadro com só o brilho do burst e o Ponto. O ícone se desenha até ~97.0 e o wordmark só fica completo em ~96.95, então a entrega da marca chega ~0,45 s depois do golpe sonoro.

**Correção:** Em s10-assinatura.js (l.244–256): arcOuter e arcInner com DrawSVG de 4.40 a 4.55 local, pupila com scale 0→1 de 4.45 a 4.55 (mecca.back) e wordmark com clip inset de 4.45 a 4.70 (0,25 s, expo.out) mais scale 1.06→1. Assim o lockup está completo por volta de 96.53.

*Como foi confirmado:* Extraí 96.45–97.05 a 30 fps. Em 96.5 há só o burst e o Ponto. 'Mecc' aparece em ~96.63 e 'Meccanismo' completo em ~96.95.

## 2. [MAJOR] 97.0–100.0
**Problema:** A URL 'meccanismo.com.br', a única ação real num vídeo, está em JetBrains Mono de 26 px e é o menor texto do cartão final.

**Correção:** URL em Inter 600 de 40 px, ink #FBF8FF, centrada em y ≈860, entrando com o botão em 97.0 por fade + y 10→0 (sem digitação), para ficar completa por 3 s.

*Como foi confirmado:* No quadro 99.75 a URL aparece bem menor que a linha de verbos e o botão.

## 3. [MINOR] 97.0–100.0
**Problema:** Na linha ENGRENAR · MONTAR · CALIBRAR · OPERAR · GIRAR, os verbos apagados ficam em α .35 (quase ilegíveis), e cada verbo só termina de acender 5 a 7 quadros depois do tick.

**Correção:** Subir o estado apagado para α .6. Começar a varredura de cada verbo em T−0,12, para o último caractere acender exatamente no tick (97.5, 98.0, 98.5, 99.0), ou acender a palavra inteira em T com um flash de glow de 0,1 s.

*Como foi confirmado:* Achado de timing do crítico. No quadro 99.75 a linha está toda acesa, e antes disso os verbos estão apagados.

## 4. [MINOR] 95.4–95.6 e ≈97.0
**Problema:** Colisões do Ponto. Em ~95.4 o rastro em gradiente da órbita da tagline corta a descendente do 'p' de 'para'. Em ~97.03 o Ponto da órbita de convergência passa colado antes do 'M' e lê-se '·Meccanismo'.

**Correção:** Aumentar o ry da elipse da tagline para ~165 (a metade de baixo passa abaixo de y ≈730) ou desenhar Ponto e rastro no canvas de trás quando caírem no bbox do texto. Na convergência, reduzir o raio da órbita de 130 para 110 (x máx. ≈702) ou usar elipse rx 105 / ry 130.

*Como foi confirmado:* Nos quadros 95.4–95.55 o traço roxo cruza 'para' e 'mais'. No quadro ~97.03 o Ponto aparece imediatamente antes do 'M' do wordmark.

## 5. [MINOR] 99.4–100.0 (inclui o último quadro)
**Problema:** Uma partícula de fundo fica sobre o ombro do último 'R' de 'OPERAR' em (≈1262,588) e suja o thumbnail final.

**Correção:** A partir de 6.5 local, zerar a opacidade das bg.particles cujo ponto caia nos bboxes do lockup (+8 px): ícone, wordmark, linha de verbos, CTA e URL.

*Como foi confirmado:* No recorte ampliado do último quadro há um ponto lilás logo acima do 'R' de OPERAR.

## Nota global — flash10
FLASH (nota global 3): o flash do drop em 92.0 é um overlay chapado que deixa a imagem leitosa por 5–6 quadros. Troque por brilho radial em mix-blend-mode screen centrado no impacto (~(960,500)), #C4B5FD α ~.5 no centro caindo a 0 em r ≈ 900 px (o helper h.flash do motor já faz isso: h.flash(tl, root, t, {color:'#C4B5FD', peak:.5, dur:.4, cx:960, cy:500, r:900})).

## Nota global — pop
POP NO FIM DOS FADES (nota global 4): saídas por opacidade com mecca.in terminam com salto de ~55%→0 num quadro. Regra: mecca.in só em transformações; em autoAlpha/opacity use 'power1.in' ou 'sine.in'. Revise todas as saídas desta cena.
