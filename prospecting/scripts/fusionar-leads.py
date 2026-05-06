#!/usr/bin/env python3
"""
EsarIA — Fusionar nuevos leads en la base principal sin duplicados.

Criterios de duplicado (si coincide cualquiera, se descarta el nuevo):
  - Mismo teléfono (normalizado, sin espacios ni puntos)
  - Misma web (sin protocolo, sin www, sin trailing slash)
  - Mismo nombre_empresa (normalizado a minúsculas sin espacios extra)

Notas y estado de leads existentes se preservan siempre.

Uso:
  python3 fusionar-leads.py leads/reales/batch-20250506-120000.json
  python3 fusionar-leads.py leads/reales/batch-*.json
  python3 fusionar-leads.py nuevos.json --destino leads/reales/leads-reales.json
"""

import json
import sys
import re
import argparse
from pathlib import Path

BASE    = Path(__file__).parent.parent
DEFAULT = BASE / 'leads' / 'reales' / 'leads-reales.json'


# ---------------------------------------------------------------------------
# Normalización para comparar duplicados
# ---------------------------------------------------------------------------

def norm_tel(t: str) -> str:
    """Elimina todo excepto dígitos. Descarta si tiene menos de 6 dígitos."""
    digits = re.sub(r'\D', '', t or '')
    return digits if len(digits) >= 6 else ''


def norm_web(w: str) -> str:
    """https://www.ejemplo.com/path/ → ejemplo.com/path"""
    if not w:
        return ''
    w = w.lower().strip().rstrip('/')
    w = re.sub(r'^https?://', '', w)
    w = re.sub(r'^www\.', '', w)
    return w


def norm_nombre(n: str) -> str:
    return re.sub(r'\s+', ' ', (n or '').lower().strip())


def huella(lead: dict) -> set:
    """Devuelve un set de claves únicas del lead para comparar con existentes."""
    claves = set()
    t = norm_tel(lead.get('telefono', ''))
    if t:
        claves.add(('tel', t))
    w = norm_web(lead.get('web', ''))
    if w:
        claves.add(('web', w))
    n = norm_nombre(lead.get('nombre_empresa', ''))
    if n:
        claves.add(('nombre', n))
    return claves


def es_duplicado(nuevo: dict, huellas_existentes: set) -> bool:
    for clave in huella(nuevo):
        if clave in huellas_existentes:
            return True
    return False


# ---------------------------------------------------------------------------
# Fusión
# ---------------------------------------------------------------------------

def fusionar(existentes: list, nuevos: list) -> tuple[list, int, int]:
    huellas = set()
    for lead in existentes:
        huellas.update(huella(lead))

    añadidos = 0
    descartados = 0
    resultado = list(existentes)

    for nuevo in nuevos:
        if es_duplicado(nuevo, huellas):
            descartados += 1
        else:
            resultado.append(nuevo)
            huellas.update(huella(nuevo))
            añadidos += 1

    return resultado, añadidos, descartados


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description='EsarIA — Fusionar leads nuevos sin duplicados'
    )
    parser.add_argument(
        'origenes',
        nargs='+',
        help='Archivo(s) JSON con leads nuevos a añadir (batch o importación)'
    )
    parser.add_argument(
        '--destino',
        default=str(DEFAULT),
        help=f'Base de datos principal (default: {DEFAULT})'
    )
    args = parser.parse_args()

    destino = Path(args.destino)

    origenes = [Path(origen) for origen in args.origenes]
    for origen in origenes:
        if not origen.exists():
            print(f'[ERROR] Archivo origen no encontrado: {origen}')
            sys.exit(1)

    # Cargar existentes (puede estar vacío)
    existentes = []
    if destino.exists():
        with open(destino, encoding='utf-8') as f:
            try:
                existentes = json.load(f)
                if not isinstance(existentes, list):
                    existentes = []
            except json.JSONDecodeError:
                existentes = []

    # Fusionar todos los orígenes en una sola pasada de guardado
    resultado = existentes
    total_nuevos = 0
    total_añadidos = 0
    total_descartados = 0

    for origen in origenes:
        with open(origen, encoding='utf-8') as f:
            nuevos = json.load(f)
        if not isinstance(nuevos, list):
            print(f'[ERROR] El archivo origen no contiene un array JSON: {origen}')
            sys.exit(1)

        resultado, añadidos, descartados = fusionar(resultado, nuevos)
        total_nuevos += len(nuevos)
        total_añadidos += añadidos
        total_descartados += descartados

    # Guardar
    destino.parent.mkdir(parents=True, exist_ok=True)
    with open(destino, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)

    print(f'[OK] Fusión completada:')
    print(f'     Existentes antes : {len(existentes)}')
    print(f'     Archivos origen  : {len(origenes)}')
    print(f'     Nuevos recibidos : {total_nuevos}')
    print(f'     Añadidos         : {total_añadidos}')
    print(f'     Descartados (dup): {total_descartados}')
    print(f'     Total ahora      : {len(resultado)}')
    print(f'     Guardado en      : {destino}')
    print()
    print('Siguiente paso — enriquecer:')
    print(f'  python3 {Path(__file__).parent}/enriquecer-leads.py')


if __name__ == '__main__':
    main()
