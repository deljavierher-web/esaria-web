# Reel 05 - Pucela caos

Reel vertical con gancho humorístico local sobre desorden operativo en pequeñas empresas.

## Flujo usado

1. `narration.txt`
2. Gemini TTS `audio/voice.wav`
3. `prepare-reel-audio.py` para duración y timing
4. HTML sincronizado con 6 escenas
5. Render HyperFrames

## Previsualizar

```bash
npx hyperframes preview assets/hyperframes/reel-05-pucela-caos --port 3018
```

URL:

```text
http://localhost:3018/#project/reel-05-pucela-caos
```

## Regenerar audio y timings

```bash
python3 assets/hyperframes/tools/prepare-reel-audio.py assets/hyperframes/reel-05-pucela-caos --generate --scenes 6
```

## Renderizar

```bash
npx hyperframes render assets/hyperframes/reel-05-pucela-caos --output assets/hyperframes/reel-05-pucela-caos/renders/reel-05-pucela-caos.mp4 --quality standard
```
