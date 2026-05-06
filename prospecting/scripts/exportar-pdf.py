#!/usr/bin/env python3
"""
EsarIA — Exportar guion de llamada en frío a PDF

Intenta generar el PDF con los métodos disponibles en el sistema:
  1. weasyprint (pip install weasyprint)
  2. Chrome / Chromium headless
  3. Fallback: abre el HTML en el navegador con instrucciones para imprimir a PDF

Uso:
  python3 exportar-pdf.py
"""

import subprocess
import sys
import os
from pathlib import Path

BASE = Path(__file__).parent.parent
HTML = BASE / "pdf" / "guion-llamada-frio-esaria.html"
PDF  = BASE / "pdf" / "guion-llamada-frio-esaria.pdf"

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
]


def find_chrome():
    for path in CHROME_CANDIDATES:
        if os.path.exists(path):
            return path
    for cmd in ["google-chrome", "chromium", "chromium-browser"]:
        try:
            r = subprocess.run(["which", cmd], capture_output=True, text=True)
            if r.returncode == 0 and r.stdout.strip():
                return r.stdout.strip()
        except Exception:
            pass
    return None


def via_weasyprint(html, pdf):
    try:
        from weasyprint import HTML as WP
        WP(filename=str(html)).write_pdf(str(pdf))
        return True
    except ImportError:
        return False
    except Exception as e:
        print(f"  [AVISO] weasyprint falló: {e}")
        return False


def via_chrome(html, pdf, chrome):
    cmd = [
        chrome,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={pdf}",
        f"file://{html.resolve()}",
    ]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=45)
        return r.returncode == 0 and pdf.exists()
    except Exception as e:
        print(f"  [AVISO] Chrome headless falló: {e}")
        return False


def abrir_en_navegador(html):
    try:
        subprocess.run(["open", str(html)])
        return True
    except Exception:
        return False


def main():
    if not HTML.exists():
        print(f"[ERROR] No se encuentra: {HTML}")
        print("Ejecuta primero el script de creación del PDF HTML.")
        sys.exit(1)

    print(f"[INFO] HTML fuente : {HTML}")
    print(f"[INFO] PDF destino : {PDF}")
    print()

    # 1. weasyprint
    print("[1/3] Probando weasyprint...")
    if via_weasyprint(HTML, PDF):
        print(f"[OK] PDF generado con weasyprint → {PDF}")
        subprocess.run(["open", str(PDF)])
        return

    # 2. Chrome headless
    print("[2/3] Probando Chrome headless...")
    chrome = find_chrome()
    if chrome:
        print(f"  Navegador: {chrome}")
        if via_chrome(HTML, PDF, chrome):
            print(f"[OK] PDF generado con Chrome → {PDF}")
            subprocess.run(["open", str(PDF)])
            return
    else:
        print("  Chrome no encontrado.")

    # 3. Fallback manual
    print()
    print("[3/3] Generación automática no disponible.")
    print("──────────────────────────────────────────")
    print("Para generar el PDF manualmente:")
    print(f"  1. Abre en el navegador:")
    print(f"     open '{HTML}'")
    print("  2. Pulsa Cmd+P (macOS)")
    print("  3. Destino → Guardar como PDF")
    print(f"  4. Nombre: guion-llamada-frio-esaria.pdf")
    print(f"  5. Guarda en: {PDF.parent}")
    print()

    abierto = abrir_en_navegador(HTML)
    if abierto:
        print("[OK] HTML abierto en el navegador. Usa Cmd+P para imprimir a PDF.")

    print()
    print("Para instalar weasyprint (recomendado):")
    print("  pip3 install weasyprint")
    print("  python3 exportar-pdf.py")


if __name__ == "__main__":
    main()
