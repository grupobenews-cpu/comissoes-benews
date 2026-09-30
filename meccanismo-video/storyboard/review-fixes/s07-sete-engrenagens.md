# Correções da revisão global — s07-sete-engrenagens (versão HORIZONTAL, src/scenes/s07-sete-engrenagens.js)

Tempos são GLOBAIS (subtraia o início da cena para obter o tempo local).

## 1. [MAJOR] 55.8, 57.8, 59.8, 61.8, 63.8, 65.8, 67.8 (±0,1 s)
**Problema:** Estroboscópio na cremalheira. A coluna de texto (nome de 150 px + chips) sobe 360 px com mecca.gear e quase todo o deslocamento cai em 2–3 quadros (até ~130 px/quadro), sem motion blur. O nome 'salta' em vez de deslizar, e os dentes da engrenagem gigante parecem pular. Acontece nas 7 estações.

**Correção:** Estender a translação da coluna e o giro da engrenagem para T−0,5→T+0,2 (0,7 s) com uma curva de velocidade de pico ≤ ~60 px/quadro, por exemplo CustomEase 'M0,0 C0.45,0 0.35,1.06 0.62,1.02 0.8,0.995 0.9,1 1,1' (overshoot pequeno). Manter o assentamento no downbeat.

*Como foi confirmado:* Extraí 57.6–58.0 a 30 fps. 'Vendas' e 'Marketing' pulam entre 57.77 e 57.87 em saltos grandes, sem quadros intermediários suaves.

## 2. [MAJOR] 55.8–70.2
**Problema:** Os 3 chips de serviço de cada estação, o núcleo do 'o que faz', estão em mono de 18 px com tracking .14em e ficam ilegíveis quando o bloco cai para α .4 em T+2.

**Correção:** Chips em mono de 22 px, tracking .06em, texto #C4B5FD e borda mais clara. No escurecimento de T+2, usar α .55 em vez de .4 para o bloco anterior. Se a linha passar de 940 px, quebrar para a segunda linha, que já está prevista em y 724.

*Como foi confirmado:* Nos quadros 56.5, 58.5 e 63.0 os chips ativos são minúsculos, e os da estação anterior (α .4) mal se veem.

## 3. [MINOR] 54.0–54.5
**Problema:** O começo do DROP B (54.0) cai num quadro com só um círculo de 3 px e o Ponto. O círculo fica parado até ~54.4 antes de viajar.

**Correção:** Começar a viagem do círculo para (1640,540) exatamente em 54.0 (mecca.inOut, sem hold). Em 54.0, disparar uma onda de choque (r 300→700, lavanda 2 px, α .5→0, 0,6 s) e engrossar o stroke de 3 para 5 px, voltando a 3 px até 54.4.

*Como foi confirmado:* Nos quadros 54.0 e 54.5 a tela só tem o círculo fino e o Ponto.

## 4. [MINOR] 56.3–57.6 (e o mesmo trecho de cada estação até 67.6)
**Problema:** Entre as trocas de estação, ~1,5 s de imagem quase congelada, em plena seção de maior energia da música.

**Correção:** Acrescentar micro-acentos na grade: o Ponto pulsa (r 10→13→10, 0,2 s) em T+0,5, T+1,0 e T+1,5, e a engrenagem gigante dá um tick de catraca de ±1,5° (0,12 s) em T+1,0, sem mudar o passo de 51,43°.

*Como foi confirmado:* Os quadros 56.5 e 57.5 são praticamente idênticos.

## 5. [MINOR] 57.8–70.0
**Problema:** O contador 'NN / 07' da estação ativa fica colado aos chips escurecidos da estação anterior e longe do próprio nome. Visualmente, ele se agrupa com o bloco de cima.

**Correção:** Descer o contador da baseline 400 para 435 dentro do bloco, mantendo o passo de 360 px.

*Como foi confirmado:* Em 58.5 e 63.0, '02 / 07' e '04 / 07' ficam logo abaixo dos chips da estação anterior.

## 6. [MINOR] 62.0–64.0 e 66.0–68.0
**Problema:** O uppercase dos chips deforma siglas: 'EMISSÃO DE NF-E' (o correto é NF-e) e 'PROCESSOS & SOPS' (o correto é SOPs).

**Correção:** Envolver as siglas em <span style="text-transform:none">NF-e</span> e <span style="text-transform:none">SOPs</span>.

*Como foi confirmado:* Nos quadros 63.0 e 67.0 aparecem 'EMISSÃO DE NF-E' e 'PROCESSOS & SOPS'. O site grafa 'NF-e' e 'SOPs'.

## 7. [MINOR] 71.0–75.6
**Problema:** 'Um só mecanismo.' (com um c, fiel ao site) leva o mesmo gradiente da marca usado em 'mecca' na revelação e parece o nome da marca escrito errado.

**Correção:** Manter o texto, mas pintar 'mecanismo.' em ink #FBF8FF e passar o gradiente para 'Um só'.

*Como foi confirmado:* No quadro 73.0 'mecanismo.' aparece no gradiente magenta→violeta.

## 8. [MINOR] 70.27→70.30 e 70.47→70.50
**Problema:** Pop no fim do fade: o número '07' e o bloco 'Tecnologia' saem com opacidade em mecca.in e somem de uma vez a partir de ~55–60%.

**Correção:** Em s07-sete-engrenagens.js (l.326–328), usar 'power1.in' (ou 'none') na opacidade dos números e de blocks[6] e deixar mecca.in só no y.

*Como foi confirmado:* Medição do crítico QA, coerente com o mesmo padrão confirmado em 23.87→23.90 na S03.

## 9. [MINOR] 54.5–70.3
**Problema:** O eyebrow do rodapé 'O ALCANCE · A MÁQUINA INTEIRA' termina em y ≈1011, 3 px fora da área segura de 72 px.

**Correção:** Mudar a âncora do eyebrow de y 1000 para 990.

*Como foi confirmado:* No quadro 56.5 o eyebrow está no limite inferior do grid.

## Nota global — carcass
CARCAÇA DO ÍCONE (nota global 5 — S07/S08/S09 precisam usar EXATAMENTE a mesma função): hoje a carcaça (arcos do ícone) gira sem parar a −12°/s e em 82–85 s o logo fica de cabeça para baixo. Nova regra COMPARTILHADA, calculada a partir do tempo GLOBAL gt (2º argumento de onFrame): ângulo_carcaça(gt) = 0 para gt < 72; para gt ≥ 72: 18° · sin(2π·(gt − 72)/4) · smooth(72, 72.6, gt) (h.smooth). Isso dá 0° exatos em 76.0 e 82.0 (cortes) com velocidade contínua. Sol e planetas continuam girando como estão; só a carcaça oscila.

## Nota global — pop
POP NO FIM DOS FADES (nota global 4): saídas por opacidade com mecca.in terminam com salto de ~55%→0 num quadro. Regra: mecca.in só em transformações; em autoAlpha/opacity use 'power1.in' ou 'sine.in'. Revise todas as saídas desta cena.

## Nota global — audio7
ÁUDIO (nota global 6a): acrescente cue(16.0, 'whoosh', 'recuo', 0.45) — o recuo da engrenagem gigante na virada DROP B → B' está sem som.
