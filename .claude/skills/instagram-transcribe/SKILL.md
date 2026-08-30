---
name: instagram-transcribe
description: Baixa um Reel/vídeo do Instagram (ou outra URL de vídeo suportada pelo yt-dlp) e transcreve a fala em áudio para texto. Use sempre que o usuário trouxer um link do Instagram (instagram.com/reel/, /p/, /tv/) e pedir para "transcrever", "descrever o conteúdo falado", "o que ele fala no vídeo" etc.
---

# Transcrever vídeo do Instagram

Procedimento testado e funcional para baixar o áudio de um Reel/post do Instagram e
transcrever a fala, sem depender de ferramentas externas de rede além do que já está
disponível no ambiente (proxy configurado). Roda inteiramente via Bash.

## Passo a passo

1. **Instalar dependências** (idempotente — rodar sempre, é rápido se já instalado):
   ```bash
   pip install --quiet yt-dlp imageio-ffmpeg openai-whisper
   ```

2. **Garantir que `ffmpeg` está no PATH** (o ambiente normalmente não tem ffmpeg via apt
   funcional — `apt-get install ffmpeg` costuma falhar por dependências 404 no mirror.
   `imageio-ffmpeg` traz um binário estático que resolve isso):
   ```bash
   FFMPEG=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
   ln -sf "$FFMPEG" /usr/local/bin/ffmpeg
   ```

3. **Baixar o vídeo** para o diretório de scratchpad da sessão:
   ```bash
   mkdir -p <scratchpad>/reel && cd <scratchpad>/reel
   yt-dlp -o "video.%(ext)s" "<URL_DO_REEL>"
   ```
   Isso também retorna metadados úteis de graça (title, description/caption, uploader,
   like_count, comment_count) — pode usar `-j` para extrair só o JSON se precisar só da
   legenda, sem baixar o vídeo.

4. **Extrair o áudio em WAV mono 16kHz** (formato ideal pro whisper):
   ```bash
   ffmpeg -y -i video.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 audio.wav
   ```

5. **Transcrever com Whisper** (modelo `small` é um bom equilíbrio velocidade/qualidade
   para vídeos curtos de Reels; usar `--language Portuguese` quando o conteúdo for em
   português para evitar detecção errada de idioma):
   ```bash
   python3 -m whisper audio.wav --model small --language Portuguese \
     --output_format txt --output_dir .
   ```
   A transcrição com timestamps aparece no stdout e também é salva em `audio.txt`.

6. Apresentar ao usuário o texto transcrito (limpo, sem timestamps, em parágrafos),
   e opcionalmente a legenda/caption original do post como contexto extra.

## Notas

- Se o post for privado ou exigir login, `yt-dlp` vai falhar — informar o usuário que
  não é possível acessar conteúdo que exige autenticação no Instagram.
- Para vídeos mais longos (>5min), considerar `--model base` ou `--model medium` só se
  a precisão do `small` não for suficiente; modelos maiores demoram bastante mais em CPU.
- Todo o trabalho deve ficar no diretório de scratchpad da sessão, nunca em `/tmp` direto.
- Isso funciona igual para outras URLs suportadas por yt-dlp (TikTok, YouTube, Twitter/X etc.),
  não só Instagram.
