#!/usr/bin/env python3
"""
Genera 3 muestras de pronunciación para comparar cómo Gemini TTS lee "EsarIA".
Usa TTS_ENGINE=gemini, GEMINI_VOICE=Iapetus, GEMINI_SPEED=fast.

Salida: output/voice-tests/pronunciation/
  esaria-original.wav   → "EsarIA"
  esaria-acento.wav     → "Esária"
  es-aria-separado.wav  → "Es aria"
"""
import io
import os
import sys
import wave

BASE_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR   = os.path.join(BASE_DIR, 'output', 'voice-tests', 'pronunciation')
os.makedirs(OUT_DIR, exist_ok=True)

GEMINI_VOICE = os.environ.get('GEMINI_VOICE', 'Iapetus')
GEMINI_SPEED = os.environ.get('GEMINI_SPEED', 'fast')

_STYLE_FAST = (
    "Narrador profesional para una agencia B2B de automatización. "
    "Voz adulta, seria pero cercana, dinámica y directa. "
    "Ritmo ágil: velocidad un 15-20% superior al promedio, pausas breves y naturales entre frases, "
    "sin silencios prolongados. Habla con fluidez y energía moderada, como un buen locutor de "
    "vídeo corporativo corto. No sonar acelerado ni nervioso: mantener claridad y dicción perfecta. "
    "Acento español de España. Tono claro, eficiente y de confianza."
)
_STYLE_NORMAL = (
    "Narrador profesional para una agencia B2B de automatización. "
    "Voz adulta, seria pero cercana. "
    "No sonar como anuncio exagerado ni como TikTok juvenil. "
    "Acento español de España. Ritmo medio. Tono claro, comercial y de confianza."
)
STYLE_PROMPT = _STYLE_FAST if GEMINI_SPEED == 'fast' else _STYLE_NORMAL

VARIANTS = [
    ("esaria-original.wav",    "En EsarIA automatizamos esos procesos para que tú puedas centrarte en vender y atender mejor."),
    ("esaria-acento.wav",      "En Esária automatizamos esos procesos para que tú puedas centrarte en vender y atender mejor."),
    ("es-aria-separado.wav",   "En Es aria automatizamos esos procesos para que tú puedas centrarte en vender y atender mejor."),
]


def _load_env() -> dict:
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
    if 'wav' in mime_type.lower():
        with open(path, 'wb') as f:
            f.write(data)
        return

    rate = 24000
    if 'rate=' in mime_type:
        try:
            rate = int(mime_type.split('rate=')[-1].split(';')[0].strip())
        except ValueError:
            pass

    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(rate)
        wf.writeframes(data)

    with open(path, 'wb') as f:
        f.write(buf.getvalue())


def generate_sample(filename: str, text: str, api_key: str, model: str) -> None:
    from google import genai
    from google.genai import types

    out_path = os.path.join(OUT_DIR, filename)
    prompt = f"[Instrucciones de narración: {STYLE_PROMPT}]\n\n{text}"

    print(f"  → {filename}")

    try:
        client   = genai.Client(api_key=api_key)
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

        _save_audio(audio_raw, mime, out_path)
        size_kb = os.path.getsize(out_path) // 1024
        print(f"     Guardado ({size_kb} KB)")

    except Exception as exc:
        msg = str(exc)
        if api_key and api_key in msg:
            msg = msg.replace(api_key, '[REDACTED]')
        print(f"     ERROR: {msg}")
        sys.exit(1)


def run() -> None:
    env     = _load_env()
    api_key = env.get('GEMINI_API_KEY') or os.environ.get('GEMINI_API_KEY', '')
    model   = (env.get('GEMINI_TTS_MODEL')
               or os.environ.get('GEMINI_TTS_MODEL', 'gemini-2.5-flash-preview-tts'))

    if not api_key:
        print("[ERROR] GEMINI_API_KEY no encontrada en .env")
        sys.exit(1)

    try:
        from google import genai  # noqa
    except ImportError:
        print("[ERROR] google-genai no instalado. Ejecuta: .venv/bin/pip install google-genai")
        sys.exit(1)

    print(f"=== Prueba de pronunciación  voz={GEMINI_VOICE}  speed={GEMINI_SPEED}  modelo={model} ===")
    print(f"Salida: {OUT_DIR}\n")

    for filename, text in VARIANTS:
        generate_sample(filename, text, api_key, model)

    print(f"\n=== Muestras listas ===")
    print(f"\nEscuchar:")
    for filename, _ in VARIANTS:
        path = os.path.join(OUT_DIR, filename)
        print(f"  afplay \"{path}\"")


if __name__ == '__main__':
    run()
