# Meccanismo — vídeo institucional em motion design

Vídeo 100% animado (1920×1080, 30 fps, trilha original a 120 BPM + narração em voz feminina pt-BR) apresentando a Meccanismo:
posicionamento (“Não somos agência. Não somos consultoria. Somos o meccanismo.”), o problema,
o método em 4 tempos, as 7 engrenagens (serviços), a operação contínua, os diferenciais e o CTA.
Conteúdo, paleta e tipografia extraídos de www.meccanismo.com.br (ver `brief/`).

## Entregáveis (`out/`)
- `meccanismo.mp4` — vídeo final com trilha (H.264 + AAC).
- `soundtrack.wav` — trilha sonora isolada.
- `cues.json` — mapa de cenas e sincronização de som.

## Como funciona
A animação é uma página HTML (`src/index.html`) controlada por uma timeline GSAP determinística.
O render abre a página no Chromium headless, posiciona a timeline em cada quadro e captura a tela;
o ffmpeg codifica os quadros (com motion blur por supersampling temporal) e a trilha é sintetizada
em Python a partir dos cues registrados pelas cenas.

```
src/
  index.html, engine.js, styles.css   motor, fundo global, helpers
  timing.js                           início/duração de cada cena
  scenes/*.js                         uma cena por arquivo
  assets/                             logo/ícone oficiais, fontes locais
storyboard/storyboard.json            roteiro aprovado (cenas, textos, tempos, cues, mapa musical)
tools/
  snap.mjs     quadros estáticos / folha de contato para revisão
  render.mjs   render paralelo → MP4
  audio.py     trilha sonora + efeitos sincronizados (+ ducking pela locução)
  voice.py     posiciona a locução (audio/vo/*.mp3 + audio/vo/plan.json) na linha do tempo
  arrangement.json  arranjo musical por compasso
```

## Narração
Locução gerada com ElevenLabs (voz “Catarina Cordeiro”, pt-BR) via Magnific; os clipes ficam em `audio/vo/`
e o texto/tempo de cada frase em `audio/vo/plan.json`. A música e os efeitos abaixam automaticamente sob a voz.

## Pré-visualizar
Abra `src/index.html` num navegador (barra de play/scrub; espaço = play/pause, ←/→ = quadro a quadro).

## Renderizar
Requisitos: Node 18+ com `playwright` (Chromium), Python 3 com `numpy scipy imageio-ffmpeg pillow`.
```bash
node tools/render.mjs --workers 3 --mb 4 --out out/meccanismo-video-only.mp4   # vídeo (gera out/cues.json)
python3 tools/voice.py --out out/voice.wav                                         # locução posicionada
python3 tools/finalize.py                                                          # trilha + voz, -14 LUFS, mux → out/meccanismo.mp4
```
