# Reel 04 - Tiempo invisible

Reel vertical para Instagram/TikTok sobre diagnóstico previo a la automatización.

## Concepto

Idea central: antes de automatizar, conviene medir el tiempo invisible que se pierde en pequeñas tareas repetidas.

Duración: 24,3 segundos.
Formato: 1080x1920.
Estilo: sobrio, B2B, limpio, con paleta EsarIA.

## Previsualizar

```bash
npx hyperframes preview assets/hyperframes/reel-04-tiempo-invisible --port 3017
```

URL de estudio:

```text
http://localhost:3017/#project/reel-04-tiempo-invisible
```

## Renderizar

```bash
npx hyperframes render assets/hyperframes/reel-04-tiempo-invisible --output assets/hyperframes/reel-04-tiempo-invisible/renders/reel-04-tiempo-invisible.mp4 --quality standard
```

## Regenerar audio Gemini

```bash
"experiments/reels-pipeline/.venv/bin/python" assets/hyperframes/reel-04-tiempo-invisible/scripts/generate-audio.py
```

El guion editable está en `narration.txt` y el WAV generado queda en `audio/voice.wav`.
