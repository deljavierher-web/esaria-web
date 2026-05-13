# Reel 06 - Reuniones absurdas

Reel vertical con humor sobre exceso de reuniones en empresas. Gancho irónico, tono cercano.

## Flujo usado

1. `narration.txt`
2. Gemini TTS `audio/voice.wav`
3. `prepare-reel-audio.py` para duracion y timing
4. HTML sincronizado con 6 escenas
5. Render HyperFrames

## Previsualizar

```bash
npx hyperframes preview assets/hyperframes/reel-06-reuniones-absurdas --port 3019
```

URL:

```text
http://localhost:3019/#project/reel-06-reuniones-absurdas
```

## Regenerar audio y timings

```bash
python3 assets/hyperframes/tools/prepare-reel-audio.py assets/hyperframes/reel-06-reuniones-absurdas --generate --scenes 6
```

## Renderizar

```bash
npx hyperframes render assets/hyperframes/reel-06-reuniones-absurdas --output assets/hyperframes/reel-06-reuniones-absurdas/renders/reel-06-reuniones-absurdas.mp4 --quality standard
```
