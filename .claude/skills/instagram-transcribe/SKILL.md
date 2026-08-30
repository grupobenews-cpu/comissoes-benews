---
name: instagram-transcribe
description: Baixa um Reel/vídeo do Instagram (ou outra URL de vídeo suportada pelo yt-dlp) e transcreve a fala em áudio para texto. Use sempre que o usuário trouxer um link do Instagram (instagram.com/reel/, /p/, /tv/) e pedir para "transcrever", "descrever o conteúdo falado", "o que ele fala no vídeo" etc.
---

# Transcrever vídeo do Instagram

Procedimento testado e funcional para baixar o áudio de um Reel/post do Instagram e
transcrever a fala, sem depender de ferramentas externas de rede além do que já está
disponível no ambiente (proxy configurado). Roda inteiramente via Bash.

Duas variantes foram testadas (ambas produzem a mesma transcrição). **Preferir a
Variante A** (mais simples, baixa menos dado, não depende de ffmpeg no PATH).

## Variante A (preferida): yt-dlp + faster-whisper

1. **Instalar dependências** (idempotente):
   ```bash
   pip install --quiet yt-dlp faster-whisper
   ```

2. **Baixar só o áudio** (muito mais leve que baixar o vídeo inteiro; ~600KB vs ~9MB
   num reel de ~1min40s):
   ```bash
   mkdir -p <scratchpad>/reel && cd <scratchpad>/reel
   yt-dlp -f bestaudio -o "audio.%(ext)s" "<URL_DO_REEL>"
   ```
   Pode aparecer um warning cosmético "Install ffmpeg to fix this automatically" —
   ignorar, o `faster-whisper` decodifica o `.m4a` direto via PyAV, sem precisar de
   ffmpeg instalado. `yt-dlp -j` retorna metadados (caption, uploader, likes) sem
   baixar nada, se só isso for necessário.

3. **Transcrever com faster-whisper** (CTranslate2 + quantização int8; mais leve que
   o pacote `openai-whisper`, que puxa PyTorch inteiro):
   ```bash
   python3 -c "
   from faster_whisper import WhisperModel
   model = WhisperModel('small', device='cpu', compute_type='int8')
   segments, info = model.transcribe('audio.m4a', language='pt')
   for s in segments:
       print(s.text.strip())
   "
   ```

4. Apresentar ao usuário o texto transcrito (limpo, em parágrafos), e opcionalmente
   a legenda/caption original do post como contexto extra.

## Variante B (alternativa): yt-dlp + ffmpeg + openai-whisper

Usar só se a Variante A falhar por algum motivo (ex. formato de áudio problemático).

1. `pip install --quiet yt-dlp imageio-ffmpeg openai-whisper`
2. Symlink do ffmpeg estático no PATH (apt-get costuma falhar por 404 no mirror):
   ```bash
   FFMPEG=$(python3 -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())")
   ln -sf "$FFMPEG" /usr/local/bin/ffmpeg
   ```
3. Baixar vídeo completo: `yt-dlp -o "video.%(ext)s" "<URL_DO_REEL>"`
4. Extrair áudio: `ffmpeg -y -i video.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 audio.wav`
5. Transcrever: `python3 -m whisper audio.wav --model small --language Portuguese --output_format txt --output_dir .`

## Notas

- Se o post for privado ou exigir login, `yt-dlp` vai falhar — informar o usuário que
  não é possível acessar conteúdo que exige autenticação no Instagram.
- Instagram pode retornar "empty media response" em requisições muito seguidas
  (rate limit leve) — esperar alguns segundos e tentar de novo costuma resolver.
- Para vídeos mais longos (>5min), considerar `model='base'`/`'medium'` só se a
  precisão do `small` não for suficiente; modelos maiores demoram bem mais em CPU.
- Todo o trabalho deve ficar no diretório de scratchpad da sessão, nunca em `/tmp` direto.
- Ambas as variantes funcionam igual para outras URLs suportadas por yt-dlp
  (TikTok, YouTube, Twitter/X etc.), não só Instagram.
