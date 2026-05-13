# EsarIA Reels Pipeline

Pipeline local para generar vídeos verticales (1080×1920) listos para Instagram Reels y TikTok.

## Flujo

```
make-voice.py          → tmp/voice.wav          (TTS: Gemini / Kokoro / macOS say)
build-timed-html.js    → tmp/reel-timed.html     (timings calculados desde el audio)
render-video.js        → tmp/video.mp4           (Playwright graba el HTML)
compose-video.sh       → output/reel-demo.mp4   (ffmpeg: vídeo + audio)
                       → contenido/reels/finales/reel-SLUG-FECHA.mp4  (copia en Drive)
                       → contenido/reels/audios/audio-SLUG-FECHA.wav  (copia del audio)
```

## Generar un reel

```bash
cd experiments/reels-pipeline

# Reel básico (slug = esaria)
TTS_ENGINE=gemini GEMINI_VOICE=Iapetus GEMINI_SPEED=fast bash scripts/make-reel.sh

# Reel con slug descriptivo
REEL_SLUG=whatsapp-clinicas TTS_ENGINE=gemini GEMINI_VOICE=Iapetus GEMINI_SPEED=fast bash scripts/make-reel.sh
```

El MP4 queda en dos sitios:
- `experiments/reels-pipeline/output/reel-demo.mp4` — copia de trabajo local
- `contenido/reels/finales/reel-SLUG-YYYY-MM-DD-HHMM.mp4` — copia en Drive lista para subir

## Variables de entorno

| Variable | Valores | Default |
|---|---|---|
| `TTS_ENGINE` | `gemini`, `kokoro`, `piper`, `macos`, `auto` | `auto` |
| `REEL_SLUG` | nombre libre, sin espacios | `esaria` |
| `GEMINI_VOICE` | `Iapetus`, `Charon`, … | `Charon` |
| `GEMINI_SPEED` | `fast`, `normal` | `normal` |
| `MACOS_VOICE` | nombre de voz macOS | `Reed (Español (España))` |

## Dónde van los archivos

```
experiments/reels-pipeline/
├── output/reel-demo.mp4          ← MP4 interno (ignorado por git)
└── tmp/                          ← archivos temporales (ignorados por git)

contenido/reels/
├── finales/    ← MP4 listos para subir a Instagram/TikTok (ignorado por git)
├── borradores/ ← versiones de prueba (ignorado por git)
├── audios/     ← voces aprobadas (ignorado por git)
├── previews/   ← capturas o previews (ignorado por git)
└── guiones/    ← guiones en texto/markdown (versionado en git)
```

## Requisitos

- **Node.js** ≥ 18
- **Python 3**
- **ffmpeg** (`brew install ffmpeg`)
- **Playwright + Chromium**: `npm install && npm run setup`

Para Gemini TTS, crea `experiments/reels-pipeline/.env`:
```
GEMINI_API_KEY=tu_api_key_aqui
```

## Instalación inicial

```bash
cd experiments/reels-pipeline
npm install
npm run setup   # descarga Chromium (~350 MB, única vez)
```

## Motores TTS disponibles

| Motor | Calidad | Notas |
|---|---|---|
| Gemini (`gemini`) | ★★★★★ | Requiere API key en `.env`. Límite: 10 req/día (tier gratuito) |
| Kokoro (`kokoro`) | ★★★★☆ | Requiere `.venv312` con kokoro instalado |
| macOS say (`macos`) | ★★★☆☆ | Sin instalación. Fallback final |

Modo `auto`: prueba Gemini → Kokoro → Piper → macOS say.

## Cambiar el guion

Edita `GUION` en [scripts/make-voice.py](scripts/make-voice.py).
El texto enviado al TTS puede usar "Esária" (pronunciación correcta); los textos visuales usan "EsarIA".

## Paso a paso (manual)

```bash
python3 scripts/make-voice.py       # genera tmp/voice.wav
node scripts/build-timed-html.js    # genera tmp/reel-timed.html con timings reales
node scripts/render-video.js        # graba la animación (~16-20s)
bash scripts/compose-video.sh       # mezcla vídeo + audio
```
