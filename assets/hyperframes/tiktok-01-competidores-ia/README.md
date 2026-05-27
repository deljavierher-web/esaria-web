# TikTok 01 — Competidores ya usan IA

**Tema:** La brecha competitiva — quien no automatiza se queda atrás  
**Duración:** 41s  
**Voz:** es-ES-AlvaroNeural (Microsoft Edge TTS)  
**Formato:** 1080×1920 (vertical TikTok/Reels/Shorts)

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `script.txt` | Guion completo del vídeo |
| `caption.txt` | Descripción lista para copiar/pegar con hashtags |
| `renders/tiktok-01-competidores-ia.mp4` | Vídeo final renderizado |
| `renders/frames/` | Frames PNG generados (10 segmentos) |

## Cómo regenerar

```bash
# 1. Generar audio
edge-tts --voice es-ES-AlvaroNeural --file script.txt --write-media renders/audio.mp3

# 2. Ejecutar el script de frames (Python + Pillow)
python3 generate_frames.py

# 3. Montar vídeo final
ffmpeg -f concat -i renders/frames/concat.txt -c:v libx264 -pix_fmt yuv420p renders/video_noaudio.mp4
ffmpeg -i renders/video_noaudio.mp4 -i renders/audio.mp3 -c:v copy -c:a aac -shortest renders/tiktok-01-competidores-ia.mp4
```
