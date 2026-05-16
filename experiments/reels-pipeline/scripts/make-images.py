#!/usr/bin/env python3
"""
Genera imágenes para cada escena del reel usando Pollinations.ai (gratis, sin API key).

Uso:
  python scripts/make-images.py                        # usa escenas por defecto
  python scripts/make-images.py escenas.json           # escenas personalizadas

Formato de escenas.json:
  [
    {"id": "sc1", "prompt": "dark blue office with smartphone...", "width": 1080, "height": 1920},
    ...
  ]

Salida:
  tmp/images/sc1.png ... scN.png
  tmp/images.json  —  manifiesto para build-timed-html.js
"""

import json
import os
import sys
import time
import urllib.request
import urllib.parse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP_DIR = os.path.join(BASE_DIR, 'tmp')
IMG_DIR = os.path.join(TMP_DIR, 'images')

# ── Escenas por defecto ────────────────────────────────────────────────────────
# Los prompts están optimizados para Reels 1080x1920 con estilo EsarIA:
# fondo #0F172A, acento #6366F1, minimalista, corporativo B2B, sin texto

DEFAULT_SCENES = [
    {
        "id": "sc1",
        "prompt": (
            "Professional B2B scene: a modern office desk at night, "
            "a smartphone on the table with WhatsApp notification bubbles overflowing, "
            "dim blue lighting, dark navy atmosphere, cinematic, "
            "minimalist corporate style, purple accent glow. "
            "No text, no letters, no words, no logos."
        ),
    },
    {
        "id": "sc2",
        "prompt": (
            "Abstract visualization of repetitive tasks: multiple identical "
            "calendar pages floating, clock hands spinning, messages piling up. "
            "Dark navy blue background, subtle purple geometric shapes, "
            "clean modern corporate aesthetic. "
            "No text, no letters, no words, no logos."
        ),
    },
    {
        "id": "sc3",
        "prompt": (
            "Three small business storefronts in a row: a clinic with a cross, "
            "a mechanic workshop with tools silhouette, a gym with subtle weights. "
            "Dark atmosphere, time slipping away visualized as fading light. "
            "Minimalist vector illustration style, navy and purple palette. "
            "No text, no letters, no words, no logos."
        ),
    },
    {
        "id": "sc4",
        "prompt": (
            "Clean infographic-style composition: four horizontal empty slots "
            "with subtle purple dot bullets on the left, placeholder spaces "
            "for task items. Dark navy background, elegant minimal design, "
            "corporate B2B style. Abstract and professional. "
            "No text, no letters, no words, no logos."
        ),
    },
    {
        "id": "sc5",
        "prompt": (
            "Hero image: a bright purple geometric shape emerging from "
            "darkness, clean rays of light spreading outward from center. "
            "Inspirational but corporate, triumph and solution feeling. "
            "Navy to purple gradient, powerful minimalist composition. "
            "No text, no letters, no words, no logos."
        ),
    },
]

# ── Default params ─────────────────────────────────────────────────────────────
DEFAULT_WIDTH = 1080
DEFAULT_HEIGHT = 1920
DEFAULT_MODEL = "flux"  # flux | sdxl | flux-realism | flux-anime


def load_scenes(path: str | None = None) -> list[dict]:
    """Carga escenas desde JSON o usa las por defecto."""
    if path and os.path.isfile(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    scenes_path = os.path.join(BASE_DIR, "scenes.json")
    if os.path.isfile(scenes_path):
        with open(scenes_path, encoding="utf-8") as f:
            return json.load(f)

    print("[IMG] Usando escenas por defecto (edita scenes.json para personalizar)")
    return DEFAULT_SCENES


def download_image(prompt: str, out_path: str,
                   width: int = DEFAULT_WIDTH,
                   height: int = DEFAULT_HEIGHT,
                   model: str = DEFAULT_MODEL) -> bool:
    """Descarga una imagen de Pollinations.ai. Retorna True si éxito."""
    encoded = urllib.parse.quote(prompt, safe="")
    url = (
        f"https://image.pollinations.ai/prompt/{encoded}"
        f"?width={width}&height={height}&model={model}&nologo=true"
    )

    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "EsarIA-Reels/1.0"})
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()

            if len(data) < 1000:
                print(f"  [WARN] Imagen demasiado pequeña ({len(data)}B), reintento {attempt+1}/3")
                time.sleep(2)
                continue

            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with open(out_path, "wb") as f:
                f.write(data)
            return True

        except Exception as e:
            print(f"  [WARN] Error descarga ({attempt+1}/3): {e}")
            time.sleep(2)

    return False


def main():
    scenes_path = sys.argv[1] if len(sys.argv) > 1 else None
    scenes = load_scenes(scenes_path)
    manifest = {"images": [], "dir": IMG_DIR}

    os.makedirs(IMG_DIR, exist_ok=True)

    print(f"[IMG] Generando {len(scenes)} imágenes con Pollinations.ai (model={DEFAULT_MODEL})")
    print(f"[IMG] Resolución: {DEFAULT_WIDTH}x{DEFAULT_HEIGHT}")
    print()

    for i, scene in enumerate(scenes):
        sid = scene["id"]
        prompt = scene["prompt"]
        width = scene.get("width", DEFAULT_WIDTH)
        height = scene.get("height", DEFAULT_HEIGHT)
        model = scene.get("model", DEFAULT_MODEL)

        out_path = os.path.join(IMG_DIR, f"{sid}.png")

        print(f"  [{i+1}/{len(scenes)}] {sid}")
        print(f"        prompt: {prompt[:100]}...")

        if download_image(prompt, out_path, width, height, model):
            size_kb = os.path.getsize(out_path) // 1024
            print(f"        -> {out_path} ({size_kb} KB)")
            manifest["images"].append({
                "id": sid,
                "path": out_path,
                "size_kb": size_kb,
            })
        else:
            print(f"        -> FALLÓ")
            manifest["images"].append({
                "id": sid,
                "path": None,
                "error": "download_failed",
            })

    # Guardar manifiesto
    manifest_path = os.path.join(TMP_DIR, "images.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    ok = sum(1 for img in manifest["images"] if img["path"])
    print(f"\n[IMG] {ok}/{len(scenes)} imágenes generadas. Manifiesto: {manifest_path}")


if __name__ == "__main__":
    main()
