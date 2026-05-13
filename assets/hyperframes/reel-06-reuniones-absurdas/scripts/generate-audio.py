#!/usr/bin/env python3
import io
import os
import wave

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", ".."))
PIPELINE_ENV = os.path.join(ROOT_DIR, "experiments", "reels-pipeline", ".env")
NARRATION = os.path.join(BASE_DIR, "narration.txt")
OUT_DIR = os.path.join(BASE_DIR, "audio")
OUT_WAV = os.path.join(OUT_DIR, "voice.wav")


def load_env(path):
    values = {}
    if not os.path.isfile(path):
        return values
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def save_audio(data, mime_type, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if "wav" in mime_type.lower():
        with open(path, "wb") as f:
            f.write(data)
        return

    rate = 24000
    if "rate=" in mime_type:
        try:
            rate = int(mime_type.split("rate=")[-1].split(";")[0].strip())
        except ValueError:
            pass

    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(rate)
        wf.writeframes(data)

    with open(path, "wb") as f:
        f.write(buf.getvalue())


def main():
    from google import genai
    from google.genai import types

    env = load_env(PIPELINE_ENV)
    api_key = env.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
    model = env.get("GEMINI_TTS_MODEL") or os.environ.get("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts")
    voice = os.environ.get("GEMINI_VOICE", "Iapetus")

    if not api_key:
        raise SystemExit("GEMINI_API_KEY no encontrada en experiments/reels-pipeline/.env ni en entorno")

    with open(NARRATION, encoding="utf-8") as f:
        script = f.read().strip()

    style = (
        "Narrador profesional español para un Reel B2B con humor irónico sobre reuniones. "
        "Tono cercano, algo sarcástico pero elegante, como un colega hablando claro. "
        "Sin sonar a anuncio agresivo ni a monologuista de bar. "
        "Ritmo ágil, pausas breves. Duración objetivo: 24 segundos. "
        "Pronuncia Esaría con acento español claro."
    )

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=model,
        contents=f"[Instrucciones de narración: {style}]\n\n{script}",
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice)
                )
            ),
        ),
    )

    part = response.candidates[0].content.parts[0]
    save_audio(part.inline_data.data, part.inline_data.mime_type or "", OUT_WAV)
    print(OUT_WAV)


if __name__ == "__main__":
    main()
