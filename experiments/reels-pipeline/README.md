# EsarIA Reels Pipeline

Pipeline local para generar vídeos verticales (1080×1920) listos para Instagram Reels y TikTok. Sin APIs de pago, sin dependencias cloud.

## Qué hace

```
templates/reel-demo.html   ← animación GSAP
        ↓ Playwright (grabación browser)
tmp/video.mp4              ← vídeo base
        +
scripts/make-voice.py      ← TTS (Kokoro o macOS say)
tmp/voice.wav              ← audio
        ↓ ffmpeg
output/reel-demo.mp4       ← resultado final
```

## Requisitos previos

- **Node.js** ≥ 18 (tienes 25.9)
- **Python 3** (tienes 3.14)
- **ffmpeg** (tienes 8.1 via Homebrew)

## Instalación — primera vez

### 1. Instalar Playwright + Chromium

```bash
cd experiments/reels-pipeline
npm install
npm run setup   # descarga Chromium (~350 MB, única vez)
```

### 2. TTS con Kokoro (opcional, mejor calidad)

Kokoro puede no tener wheels para Python 3.14 todavía.
Si funciona, lo usará automáticamente; si no, usará `macOS say`.

```bash
cd experiments/reels-pipeline
python3 -m venv .venv
source .venv/bin/activate
pip install kokoro soundfile numpy
deactivate
```

## Generar el reel

```bash
cd experiments/reels-pipeline
bash scripts/make-reel.sh
```

O paso a paso:

```bash
python3 scripts/make-voice.py     # genera tmp/voice.wav
node scripts/render-video.js      # genera tmp/video.mp4 (~20s de espera)
bash scripts/compose-video.sh     # genera output/reel-demo.mp4
```

## Previsualizar

```bash
open output/reel-demo.mp4
```

## TTS: opciones y calidad

| Motor          | Calidad voz    | Instalación     | Estado            |
|----------------|----------------|-----------------|-------------------|
| Kokoro (e/es)  | ★★★★☆ Natural  | pip (venv)      | Opcional          |
| macOS Flo es_ES| ★★★☆☆ Buena    | Incluida en Mac | **Fallback activo** |
| macOS Mónica   | ★★☆☆☆ Aceptable| Incluida en Mac | Fallback secundario |

El script elige automáticamente en ese orden.

## Cambiar el guion de voz

Edita la variable `GUION` en [scripts/make-voice.py](scripts/make-voice.py):

```python
GUION = "Tu nuevo texto aquí."
```

Luego ejecuta `python3 scripts/make-voice.py` para regenerar el audio.

## Cambiar los textos visuales

Edita los `div.slide` en [templates/reel-demo.html](templates/reel-demo.html).
Los tiempos de animación están en el `<script>` al final del HTML (objeto `tl`).

## Cambiar los tiempos de animación

En `reel-demo.html`, busca el bloque `gsap.timeline()`.
Cada número es el tiempo en segundos en que empieza cada acción:

```javascript
.to('#slide1', { opacity: 1, ... }, 1.8)   // aparece a los 1.8s
.to('#slide1', { opacity: 0, ... }, 4.5)   // desaparece a los 4.5s
```

## Dónde queda el MP4

```
experiments/reels-pipeline/output/reel-demo.mp4
```

## Estructura de archivos

```
experiments/reels-pipeline/
├── README.md
├── package.json
├── requirements.txt
├── scripts/
│   ├── render-video.js    ← Playwright → tmp/video.mp4
│   ├── make-voice.py      ← TTS → tmp/voice.wav
│   ├── compose-video.sh   ← ffmpeg → output/reel-demo.mp4
│   └── make-reel.sh       ← pipeline completo
├── templates/
│   └── reel-demo.html     ← animación GSAP (editable)
├── assets/                ← recursos estáticos opcionales
├── output/                ← MP4 final (ignorado por git)
└── tmp/                   ← archivos temporales (ignorados por git)
```

## Limitaciones conocidas

- La primera ejecución descarga Chromium (~350 MB).
- El render tarda ~20s (graba 16s de animación en tiempo real).
- GSAP se carga desde CDN: requiere internet en el render.
- Kokoro en Python 3.14 puede no tener wheels; en ese caso usa `say`.
- Los subtítulos visuales no están sincronizados automáticamente con el audio (la sincronía es aproximada).

## Próxima mejora sugerida

Sincronización automática: usar `ffprobe` para medir la duración real del audio generado y ajustar los timings de GSAP antes de renderizar.
