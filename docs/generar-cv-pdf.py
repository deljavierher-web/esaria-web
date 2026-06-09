#!/usr/bin/env python3
import subprocess
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
HTML_FILE = BASE_DIR / "cv-javier-delgado.html"
PDF_FILE = BASE_DIR / "cv-javier-delgado.pdf"

CHROME_PATHS = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
]

def find_chrome():
    for path in CHROME_PATHS:
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

def main():
    print("[INFO] Buscando motor de renderizado PDF...")
    chrome_path = find_chrome()
    
    if chrome_path:
        print(f"[INFO] Utilizando navegador: {chrome_path}")
        cmd = [
            chrome_path,
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            "--run-all-compositor-stages-before-draw",
            f"--print-to-pdf={PDF_FILE}",
            f"file://{HTML_FILE.resolve()}",
        ]
        try:
            print("[INFO] Generando PDF con Chrome Headless...")
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if r.returncode == 0 and PDF_FILE.exists():
                print(f"[OK] PDF generado con éxito en: {PDF_FILE}")
                # Intentamos abrir el archivo PDF automáticamente
                subprocess.run(["open", str(PDF_FILE)])
                return
            else:
                print(f"[ERROR] Chrome falló al exportar: {r.stderr}")
        except Exception as e:
            print(f"[ERROR] Error al ejecutar Chrome headless: {e}")
    else:
        print("[AVISO] No se encontró Google Chrome u otro navegador compatible.")
    
    # Fallback: Weasyprint
    try:
        print("[INFO] Intentando weasyprint como fallback...")
        from weasyprint import HTML
        HTML(filename=str(HTML_FILE)).write_pdf(str(PDF_FILE))
        print(f"[OK] PDF generado con weasyprint en: {PDF_FILE}")
        subprocess.run(["open", str(PDF_FILE)])
        return
    except ImportError:
        print("[AVISO] weasyprint tampoco está instalado (pip install weasyprint).")
    except Exception as e:
        print(f"[ERROR] weasyprint falló: {e}")

    # Fallback 2: Abrir el HTML directamente para impresión manual
    print("\n[INFO] Abriendo el archivo HTML en tu navegador...")
    print("Por favor, pulsa Cmd+P en tu navegador y selecciona 'Guardar como PDF' para generar el archivo.")
    try:
        subprocess.run(["open", str(HTML_FILE)])
    except Exception as e:
        print(f"[ERROR] No se pudo abrir el navegador: {e}")

if __name__ == "__main__":
    main()
