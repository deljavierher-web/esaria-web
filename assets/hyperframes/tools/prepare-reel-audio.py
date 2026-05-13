#!/usr/bin/env python3
"""Audio-first workflow for EsarIA HyperFrames reels.

Usage:
  python3 assets/hyperframes/tools/prepare-reel-audio.py assets/hyperframes/reel-04-tiempo-invisible --generate --scenes 5

What it does:
  1. Optionally runs the reel-local scripts/generate-audio.py.
  2. Measures audio duration with ffprobe.
  3. Transcribes audio with local whisper-cli.
  4. Writes timing suggestions for scene durations.
"""
import argparse
import glob
import json
import os
import re
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
BREW_TEST_MODEL = Path("/opt/homebrew/opt/whisper-cpp/share/whisper-cpp/for-tests-ggml-tiny.bin")


def run(cmd, cwd=ROOT):
    return subprocess.run(cmd, cwd=cwd, check=True, text=True, capture_output=True)


def find_python():
    venv_python = ROOT / "experiments" / "reels-pipeline" / ".venv" / "bin" / "python"
    if venv_python.exists():
        return str(venv_python)
    return shutil.which("python3") or "python3"


def find_whisper_model():
    env_model = os.environ.get("WHISPER_MODEL")
    if env_model and Path(env_model).exists():
        return Path(env_model), False

    candidates = []
    candidates += [Path(p) for p in glob.glob(str(ROOT / "**" / "ggml-*.bin"), recursive=True)]
    candidates += [Path(p) for p in glob.glob(str(Path.home() / "**" / "ggml-*.bin"), recursive=True)]
    candidates = [p for p in candidates if p.exists() and "for-tests" not in p.name]

    if candidates:
        preferred = sorted(candidates, key=lambda p: ("small" not in p.name, "base" not in p.name, len(str(p))))
        return preferred[0], False

    if BREW_TEST_MODEL.exists():
        return BREW_TEST_MODEL, True

    raise SystemExit("No encuentro modelo Whisper. Define WHISPER_MODEL=/ruta/a/ggml-small.bin")


def audio_duration(audio_path):
    result = run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(audio_path)
    ])
    return float(result.stdout.strip())


def scene_count_from_html(index_path):
    text = index_path.read_text(encoding="utf-8")
    ids = set(re.findall(r'id="s(\d+)"\s+class="scene"', text))
    return len(ids) or 1


def transcribe(reel_dir, audio_path, model_path):
    whisper = shutil.which("whisper-cli")
    if not whisper:
        raise SystemExit("whisper-cli no está en PATH")

    out_base = reel_dir / "audio" / "voice.transcript"
    cmd = [
        whisper,
        "-m", str(model_path),
        "-f", str(audio_path),
        "-l", "es",
        "-oj",
        "-of", str(out_base),
        "-np",
    ]
    subprocess.run(cmd, cwd=ROOT, check=True)
    return Path(str(out_base) + ".json")


def segment_text(segment):
    return (segment.get("text") or "").strip()


def get_segments(transcript_path):
    data = json.loads(transcript_path.read_text(encoding="utf-8"))
    segments = data.get("transcription") or data.get("segments") or []
    normalized = []
    for seg in segments:
        start = seg.get("timestamps", {}).get("from") if isinstance(seg.get("timestamps"), dict) else seg.get("start")
        end = seg.get("timestamps", {}).get("to") if isinstance(seg.get("timestamps"), dict) else seg.get("end")
        text = segment_text(seg)
        if isinstance(start, str):
            start = timestamp_to_seconds(start)
        if isinstance(end, str):
            end = timestamp_to_seconds(end)
        if start is None or end is None:
            continue
        normalized.append({"start": float(start), "end": float(end), "text": text})
    return normalized


def timestamp_to_seconds(value):
    parts = value.replace(",", ".").split(":")
    if len(parts) == 3:
        h, m, s = parts
        return int(h) * 3600 + int(m) * 60 + float(s)
    if len(parts) == 2:
        m, s = parts
        return int(m) * 60 + float(s)
    return float(value)


def words(text):
    return re.findall(r"[\wáéíóúüñÁÉÍÓÚÜÑ]+", text)


def chunk_words_from_text(text, scene_count):
    text_words = words(text)
    if not text_words:
        return [""] * scene_count
    chunks = []
    total = len(text_words)
    for i in range(scene_count):
        start = round(i * total / scene_count)
        end = round((i + 1) * total / scene_count)
        chunks.append(" ".join(text_words[start:end]))
    return chunks


def build_scene_plan(segments, scene_count, duration, fallback_text=""):
    all_words = []
    for segment in segments:
        for word in words(segment["text"]):
            all_words.append({"word": word, "time": (segment["start"] + segment["end"]) / 2})

    if not all_words:
        step = duration / scene_count
        chunks = chunk_words_from_text(fallback_text, scene_count)
        return [
            {"scene": i + 1, "start": round(i * step, 2), "end": round((i + 1) * step, 2), "duration": round(step, 2), "text": chunks[i]}
            for i in range(scene_count)
        ]

    plan = []
    total_words = len(all_words)
    for i in range(scene_count):
      word_start = round(i * total_words / scene_count)
      word_end = round((i + 1) * total_words / scene_count)
      start = 0 if i == 0 else all_words[min(word_start, total_words - 1)]["time"]
      end = duration if i == scene_count - 1 else all_words[min(max(word_end, 1), total_words - 1)]["time"]
      start = max(0, start - 0.25)
      end = min(duration, end + 0.35)
      text = " ".join(w["word"] for w in all_words[word_start:word_end])
      plan.append({"scene": i + 1, "start": round(start, 2), "end": round(end, 2), "duration": round(end - start, 2), "text": text})
    return plan


def write_outputs(reel_dir, duration, transcript_path, scene_plan, model_path, fallback_model):
    out_json = reel_dir / "audio" / "timing-plan.json"
    out_md = reel_dir / "audio" / "timing-plan.md"
    payload = {
        "audio": "audio/voice.wav",
        "duration": round(duration, 3),
        "transcript": str(transcript_path.relative_to(reel_dir)),
        "whisper_model": str(model_path),
        "fallback_model": fallback_model,
        "scene_plan": scene_plan,
    }
    out_json.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Timing plan",
        "",
        f"Audio duration: {duration:.2f}s",
        f"Whisper model: `{model_path}`",
    ]
    if fallback_model:
        lines += ["", "Aviso: se ha usado el modelo de pruebas de Homebrew. Para mejor transcripción usa `WHISPER_MODEL=/ruta/a/ggml-small.bin`."]
    lines += ["", "| Scene | Start | End | Duration | Transcript chunk |", "|---|---:|---:|---:|---|"]
    for item in scene_plan:
        lines.append(f"| {item['scene']} | {item['start']} | {item['end']} | {item['duration']} | {item['text']} |")
    out_md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return out_json, out_md


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("reel_dir")
    parser.add_argument("--generate", action="store_true", help="run reel-local scripts/generate-audio.py first")
    parser.add_argument("--scenes", type=int, default=0, help="number of visual scenes/slides")
    args = parser.parse_args()

    reel_dir = (ROOT / args.reel_dir).resolve() if not Path(args.reel_dir).is_absolute() else Path(args.reel_dir)
    audio_path = reel_dir / "audio" / "voice.wav"

    if args.generate:
        generator = reel_dir / "scripts" / "generate-audio.py"
        if not generator.exists():
            raise SystemExit(f"No existe {generator}")
        subprocess.run([find_python(), str(generator)], cwd=ROOT, check=True)

    if not audio_path.exists():
        raise SystemExit(f"No existe {audio_path}. Genera primero el audio.")

    scenes = args.scenes or scene_count_from_html(reel_dir / "index.html")
    duration = audio_duration(audio_path)
    model_path, fallback_model = find_whisper_model()
    transcript_path = transcribe(reel_dir, audio_path, model_path)
    segments = get_segments(transcript_path)
    narration_path = reel_dir / "narration.txt"
    fallback_text = narration_path.read_text(encoding="utf-8") if narration_path.exists() else ""
    plan = build_scene_plan(segments, scenes, duration, fallback_text)
    out_json, out_md = write_outputs(reel_dir, duration, transcript_path, plan, model_path, fallback_model)

    print(f"Audio: {duration:.2f}s")
    print(f"Transcript: {transcript_path}")
    print(f"Timing JSON: {out_json}")
    print(f"Timing MD: {out_md}")


if __name__ == "__main__":
    main()
