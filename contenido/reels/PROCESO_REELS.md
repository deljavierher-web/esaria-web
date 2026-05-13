# Proceso correcto para Reels EsarIA

Este es el flujo que hay que seguir antes de renderizar un Reel final.

## Orden obligatorio

1. Escribir primero el guion de voz en `narration.txt`.
2. Generar audio con Gemini TTS usando el script local del Reel.
3. Transcribir el WAV con `whisper-cli` local.
4. Crear un plan de tiempos por escena según la duración real del audio.
5. Ajustar `data-duration`, transiciones y entradas del `index.html` con ese plan.
6. Validar con `npx hyperframes lint` e `inspect`.
7. Renderizar el MP4 final.

## Comando recomendado

```bash
python3 assets/hyperframes/tools/prepare-reel-audio.py assets/hyperframes/NOMBRE-DEL-REEL --generate --scenes 5
```

Esto genera:

- `audio/voice.wav`
- `audio/voice.transcript.json`
- `audio/timing-plan.json`
- `audio/timing-plan.md`

## Whisper

El proyecto usa `whisper-cli` local.

Si tienes un modelo descargado, úsalo así:

```bash
WHISPER_MODEL=/ruta/a/ggml-small.bin python3 assets/hyperframes/tools/prepare-reel-audio.py assets/hyperframes/NOMBRE-DEL-REEL --generate --scenes 5
```

Si no se define `WHISPER_MODEL`, el script intenta encontrar un modelo `ggml-*.bin`. Si solo encuentra el modelo de pruebas de Homebrew, lo usa como fallback para timings básicos, pero la transcripción puede ser peor.

## Regla de edición

No crear el HTML definitivo antes de saber la duración real del audio. El audio manda; las escenas se ajustan después.

## Regla visual

En composiciones con varias escenas, ocultar siempre la escena saliente cuando el wipe cubre la pantalla. No basta con mostrar la siguiente escena, porque las capas se acumulan y los textos se sobreponen.
