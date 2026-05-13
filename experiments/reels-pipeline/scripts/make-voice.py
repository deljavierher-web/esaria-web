#!/usr/bin/env python3
"""
Genera voz en off para el reel de EsarIA.

Variables de entorno:
  TTS_ENGINE    gemini | macos | kokoro | piper | auto   (default: auto)
  MACOS_VOICE   voz macOS (default: Reed (Español (España)))
  GEMINI_VOICE  voz Gemini (default: Charon)
  GEMINI_SPEED  normal | fast — ajusta el ritmo via prompt  (default: normal)

Archivo .env requerido para motor gemini:
  GEMINI_API_KEY=...
  GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview

Orden modo auto: gemini (si hay key) → kokoro → piper → macos
"""
import io
import os
import sys
import subprocess
import wave

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP_DIR  = os.path.join(BASE_DIR, 'tmp')
os.makedirs(TMP_DIR, exist_ok=True)

# ── Variables de entorno ───────────────────────────────────────────────────────
TTS_ENGINE   = os.environ.get('TTS_ENGINE',   'auto')
MACOS_VOICE  = os.environ.get('MACOS_VOICE',  'Reed (Español (España))')
GEMINI_VOICE = os.environ.get('GEMINI_VOICE', 'Charon')
# GEMINI_SPEED: normal | fast  (default: normal)
GEMINI_SPEED = os.environ.get('GEMINI_SPEED', 'normal')

# ── Prompts de estilo por velocidad ───────────────────────────────────────────
_STYLE_NORMAL = (
    "Narrador profesional para una agencia B2B de automatización. "
    "Voz adulta, seria pero cercana. "
    "No sonar como anuncio exagerado ni como TikTok juvenil. "
    "Acento español de España. Ritmo medio. Tono claro, comercial y de confianza."
)

_STYLE_FAST = (
    "Narrador profesional para una agencia B2B de automatización. "
    "Voz adulta, seria pero cercana, dinámica y directa. "
    "Ritmo ágil: velocidad un 15-20% superior al promedio, pausas breves y naturales entre frases, "
    "sin silencios prolongados. Habla con fluidez y energía moderada, como un buen locutor de "
    "vídeo corporativo corto. No sonar acelerado ni nervioso: mantener claridad y dicción perfecta. "
    "Acento español de España. Tono claro, eficiente y de confianza."
)

STYLE_PROMPT = _STYLE_FAST if GEMINI_SPEED == 'fast' else _STYLE_NORMAL

GUION = (
    "Dos mil veintiséis y siguen contestando WhatsApps a mano. "
    "Horarios, precios, citas, seguimientos. Lo mismo todos los días. "
    "Clínicas, talleres y gimnasios pierden horas que no recuperan. "
    "Esaría lo automatiza. "
    "Esaría. Automatización útil para negocios reales."
)

WAV_OUT  = os.path.join(TMP_DIR, 'voice.wav')
AIFF_TMP = os.path.join(TMP_DIR, 'voice.aiff')

PIPER_BIN   = os.path.join(BASE_DIR, 'assets', 'piper', 'piper')
PIPER_MODEL = os.path.join(BASE_DIR, 'assets', 'piper', 'es_ES-sharvard-medium.onnx')


# ── Helpers ────────────────────────────────────────────────────────────────────

def _load_env() -> dict:
    """Lee .env y devuelve dict. No loggea valores."""
    env_path = os.path.join(BASE_DIR, '.env')
    if not os.path.isfile(env_path):
        return {}
    env: dict = {}
    with open(env_path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, _, val = line.partition('=')
            env[key.strip()] = val.strip().strip('"').strip("'")
    return env


def _save_audio(data: bytes, mime_type: str, path: str) -> None:
    """Guarda audio como WAV, convirtiendo PCM si es necesario."""
    if 'wav' in mime_type.lower():
        with open(path, 'wb') as f:
            f.write(data)
        return

    # PCM raw → WAV con header
    rate = 24000
    if 'rate=' in mime_type:
        try:
            rate = int(mime_type.split('rate=')[-1].split(';')[0].strip())
        except ValueError:
            pass

    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)   # 16-bit signed
        wf.setframerate(rate)
        wf.writeframes(data)

    with open(path, 'wb') as f:
        f.write(buf.getvalue())


# ── Motor: Gemini TTS ─────────────────────────────────────────────────────────

def use_gemini() -> bool:
    """Genera voz con Google Gemini TTS. API key cargada desde .env."""
    env = _load_env()

    api_key = env.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY', '')
    model   = (env.get('GEMINI_TTS_MODEL')
               or os.environ.get('GEMINI_TTS_MODEL', 'gemini-2.5-flash-preview-tts'))

    if not api_key:
        _warn_or_exit(
            "[TTS] GEMINI_API_KEY no encontrada en .env ni en entorno.",
            "[TTS] Crea experiments/reels-pipeline/.env con GEMINI_API_KEY=..."
        )
        return False

    try:
        from google import genai          # type: ignore
        from google.genai import types    # type: ignore
    except ImportError:
        _warn_or_exit(
            "[TTS] google-genai no instalado.",
            "[TTS] Instala: .venv/bin/pip install google-genai"
        )
        return False

    print(f"[TTS] Motor: Gemini  modelo={model}  voz={GEMINI_VOICE}")

    try:
        client = genai.Client(api_key=api_key)

        # Estilo en el contenido (compatible con todos los modelos TTS)
        prompt = (
            f"[Instrucciones de narración: {STYLE_PROMPT}]\n\n"
            f"{GUION}"
        )

        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=GEMINI_VOICE
                        )
                    )
                )
            )
        )

        part      = response.candidates[0].content.parts[0]
        audio_raw = part.inline_data.data
        mime      = part.inline_data.mime_type or ''

        _save_audio(audio_raw, mime, WAV_OUT)

        size_kb = os.path.getsize(WAV_OUT) // 1024
        print(f"[TTS] Guardado: {WAV_OUT}  ({size_kb} KB | mime: {mime or 'audio/wav'})")
        return True

    except Exception as exc:
        # Evitar que la API key aparezca en el traceback
        msg = str(exc)
        if api_key and api_key in msg:
            msg = msg.replace(api_key, '[REDACTED]')
        print(f"[TTS] Error Gemini: {msg}")
        if TTS_ENGINE == 'gemini':
            sys.exit(1)
        return False


# ── Motor: Kokoro TTS ─────────────────────────────────────────────────────────

def use_kokoro() -> bool:
    """Kokoro TTS (requiere .venv312 con kokoro instalado)."""
    try:
        from kokoro import KPipeline   # type: ignore
        import soundfile as sf          # type: ignore
        import numpy as np              # type: ignore

        print("[TTS] Motor: Kokoro  voz=ef_dora (es_ES)")
        pipeline = KPipeline(lang_code='e')
        chunks = []
        for _gs, _ps, audio in pipeline(GUION, voice='ef_dora', speed=0.93):
            chunks.append(audio)

        sf.write(WAV_OUT, np.concatenate(chunks), 24000)
        print(f"[TTS] Guardado: {WAV_OUT}")
        return True

    except ImportError:
        _warn_or_exit("[TTS] Kokoro no disponible.", "[TTS] Instala: bash scripts/setup-kokoro.sh")
        return False
    except Exception as exc:
        _warn_or_exit(f"[TTS] Kokoro falló: {exc}", "")
        return False


# ── Motor: Piper TTS ──────────────────────────────────────────────────────────

def use_piper() -> bool:
    """Piper TTS (requiere binario y modelo en assets/piper/)."""
    if not os.path.isfile(PIPER_BIN) or not os.path.isfile(PIPER_MODEL):
        _warn_or_exit(
            "[TTS] Piper no configurado.",
            "[TTS] Instala: bash scripts/setup-piper.sh --download"
        )
        return False

    print(f"[TTS] Motor: Piper  modelo=es_ES-sharvard-medium")
    guion_file = os.path.join(TMP_DIR, 'guion.txt')
    with open(guion_file, 'w', encoding='utf-8') as f:
        f.write(GUION)

    with open(guion_file) as stdin_f:
        subprocess.run(
            [PIPER_BIN, '--model', PIPER_MODEL, '--output_file', WAV_OUT],
            stdin=stdin_f, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )

    print(f"[TTS] Guardado: {WAV_OUT}")
    return True


# ── Motor: macOS say ──────────────────────────────────────────────────────────

def use_macos_say() -> bool:
    """macOS say con voz española. Usa MACOS_VOICE o detecta automáticamente."""
    available = subprocess.run(['say', '-v', '?'], capture_output=True, text=True).stdout
    voice = MACOS_VOICE if MACOS_VOICE in available else _detect_spanish_voice(available)

    cmd = ['say', '-o', AIFF_TMP]
    if voice:
        cmd += ['-v', voice]
        print(f"[TTS] Motor: macOS say  voz={voice}")
    else:
        print("[TTS] Motor: macOS say  (voz del sistema — puede sonar en inglés)")

    cmd.append(GUION)
    subprocess.run(cmd, check=True)
    subprocess.run([
        'ffmpeg', '-y', '-i', AIFF_TMP,
        '-ar', '44100', '-ac', '1', '-c:a', 'pcm_s16le', WAV_OUT
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    if os.path.exists(AIFF_TMP):
        os.remove(AIFF_TMP)

    print(f"[TTS] Guardado: {WAV_OUT}")
    return True


def _detect_spanish_voice(available: str) -> str | None:
    priority = [
        'Reed (Español (España))', 'Sandy (Español (España))',
        'Shelley (Español (España))', 'Eddy (Español (España))',
        'Flo (Español (España))', 'Mónica', 'Paulina',
    ]
    for v in priority:
        if v in available:
            return v
    for line in available.split('\n'):
        if 'es_ES' in line:
            return line.split()[0]
    return None


def _warn_or_exit(*msgs: str) -> None:
    for m in msgs:
        if m:
            print(m)
    if TTS_ENGINE not in ('auto', ''):
        sys.exit(1)


# ── Selector principal ────────────────────────────────────────────────────────

def run() -> None:
    print(f"=== TTS  engine={TTS_ENGINE}  gemini_voice={GEMINI_VOICE}  macos_voice={MACOS_VOICE} ===")

    if TTS_ENGINE == 'gemini':
        use_gemini()

    elif TTS_ENGINE == 'kokoro':
        use_kokoro()

    elif TTS_ENGINE == 'piper':
        use_piper()

    elif TTS_ENGINE == 'macos':
        use_macos_say()

    else:  # auto
        env = _load_env()
        has_gemini_key = bool(env.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY'))

        if has_gemini_key:
            if use_gemini():
                return
        if not use_kokoro():
            if not use_piper():
                use_macos_say()

    print("=== Voz lista ===")


if __name__ == '__main__':
    run()
