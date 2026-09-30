# Correções da revisão global — s09-diferenciais (versão HORIZONTAL, src/scenes/s09-diferenciais.js)

Tempos são GLOBAIS (subtraia o início da cena para obter o tempo local).

## 1. [MINOR] 84.0–88.2
**Problema:** Ao cair para α .45, as linhas secundárias riscadas 'não aconselha.' e 'não entrega e some.' (56 px, #A99CC4) ficam com contraste muito baixo, e são os dois diferenciais literais da marca.

**Correção:** Escurecer os blocos para α .6 em vez de .45 ('assume,' e 'fica,' continuam como no roteiro) e aplicar piso de α .65 nas linhas secundárias.

*Como foi confirmado:* Em 85.75 e 87.0 'não aconselha.' mal se distingue do fundo.

## 2. [MINOR] 86.6–86.8 e 87.9–88.1 (rótulos em 86–91.5)
**Problema:** Os rótulos 'SUA EMPRESA' / 'OS MECCA' (≈16 px) trocam de lado com fade. Em ~88.0 'OS MECCA' fica atravessado pelo fio em gradiente e na mesma linha de 'SUA EMPRESA', e lê-se 'OS MECCA SUA EMPRESA'.

**Correção:** Em s09-diferenciais.js (l.876–886), eliminar a troca e posicionar cada rótulo radialmente para fora do fio: labB = B + normalize(B − A)·(rB + 22) e labA = A + normalize(A − B)·(rA + 26), com opacidade constante. Subir os rótulos para mono de 22 px com tracking .12em e 'OS MECCA' para #E249B0 a 100%.

*Como foi confirmado:* No recorte de 88.0, 'ECCA' fica cortado pelo fio e alinhado a 'SUA EMPRESA'.

## 3. [MINOR] 84.4–85.0
**Problema:** A caixa-fantasma aparece como um retângulo cinza preenchido com borda tracejada e parece um placeholder quebrado. A rima com os cards da S03 não se lê.

**Correção:** Desenhar a caixa sem fill (ou fill #64748B α .08), com borda tracejada slate de 1,5 px e o line art do 'post' da S03 (montanha e sol) dentro, em slate α .6, com ~120×80 px.

*Como foi confirmado:* Nos quadros 84.6 e 84.75 a caixa é um retângulo cinza chapado sem conteúdo.

## 4. [MINOR] 88.27–88.33
**Problema:** Os blocos B1/B2 saem com x −60 e opacidade em mecca.in e somem de uma vez no último quadro (pop).

**Correção:** Em s09-diferenciais.js (l.305–306), usar 'power1.in' na opacidade e manter mecca.in só no x.

*Como foi confirmado:* É o mesmo padrão de curva confirmado na S03 (23.87→23.90).

## Nota global — mask
MÁSCARAS (nota global 1): enquanto a máscara de entrada desacelera, descendentes/cedilhas ficam cortadas (ex.: 'O mercado te dá' decapitado em 14.03). No wrapper da máscara desta cena use padding-bottom ≈ .28em / margin-bottom −.28em (e padding-top ≈ .12em para acentos em caixa alta), AJUSTANDO o deslocamento inicial (yPercent) para que o texto comece totalmente escondido abaixo da máscara ampliada (nenhum pedaço aparecendo no quadro anterior à entrada).

## Nota global — push
PUSH DE CÂMERA (nota global 2): o push lento com origem no centro tira o eyebrow e a coluna de texto da margem x=192. Tire o eyebrow do wrapper que recebe o push e aplique o push com transformOrigin na margem esquerda (ex.: '192px 540px'), para a margem ficar fixa. Mantenha primeiro/último quadro dos handoffs.

## Nota global — carcass
CARCAÇA DO ÍCONE (nota global 5 — S07/S08/S09 precisam usar EXATAMENTE a mesma função): hoje a carcaça (arcos do ícone) gira sem parar a −12°/s e em 82–85 s o logo fica de cabeça para baixo. Nova regra COMPARTILHADA, calculada a partir do tempo GLOBAL gt (2º argumento de onFrame): ângulo_carcaça(gt) = 0 para gt < 72; para gt ≥ 72: 18° · sin(2π·(gt − 72)/4) · smooth(72, 72.6, gt) (h.smooth). Isso dá 0° exatos em 76.0 e 82.0 (cortes) com velocidade contínua. Sol e planetas continuam girando como estão; só a carcaça oscila.

## Nota global — pop
POP NO FIM DOS FADES (nota global 4): saídas por opacidade com mecca.in terminam com salto de ~55%→0 num quadro. Regra: mecca.in só em transformações; em autoAlpha/opacity use 'power1.in' ou 'sine.in'. Revise todas as saídas desta cena.
