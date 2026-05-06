#!/usr/bin/env python3
"""
EsarIA — Importar leads desde CSV o JSON
Valida campos obligatorios y normaliza el formato.

Uso:
  python3 importar-leads.py archivo.csv
  python3 importar-leads.py archivo.json
  python3 importar-leads.py archivo.csv ../leads/leads.json
"""

import json
import csv
import sys
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LEADS_JSON = os.path.join(BASE_DIR, '..', 'leads', 'leads.json')

CAMPOS_OBLIGATORIOS = ['nombre_empresa', 'sector', 'ciudad', 'telefono', 'fuente_datos']

DEFAULTS = {
    'id': '',
    'nombre_empresa': '',
    'sector': '',
    'ciudad': 'Valladolid',
    'telefono': '',
    'email': '',
    'web': '',
    'instagram': '',
    'linkedin': '',
    'direccion': '',
    'decisor_nombre': '',
    'decisor_cargo': '',
    'fuente_datos': '',
    'problema_visible': '',
    'oportunidad_automatizacion': '',
    'prioridad': 'Media',
    'facilidad_contacto': 'Media',
    'tipo_reunion_recomendada': 'Presencial',
    'mensaje_llamada_personalizado': '',
    'mensaje_whatsapp_personalizado': '',
    'estado': 'Nuevo',
    'notas': ''
}

VALORES_VALIDOS = {
    'prioridad': ['Alta', 'Media', 'Baja'],
    'facilidad_contacto': ['Alta', 'Media', 'Baja'],
    'tipo_reunion_recomendada': ['Presencial', 'Videollamada'],
    'estado': ['Nuevo', 'Investigado', 'Llamado', 'Reunión agendada', 'Descartado']
}


def generar_id(index):
    return f"LEAD-{datetime.now().strftime('%Y%m')}-{index:03d}"


def validar(lead, index):
    nombre = lead.get('nombre_empresa', f'Lead #{index+1}')
    errores = [f"  - {c}" for c in CAMPOS_OBLIGATORIOS if not lead.get(c, '').strip()]
    if errores:
        print(f"[AVISO] {nombre} tiene campos obligatorios vacíos:")
        for e in errores:
            print(e)


def normalizar(lead, index):
    result = dict(DEFAULTS)
    result.update({k: str(v).strip() for k, v in lead.items() if v is not None})
    if not result['id']:
        result['id'] = generar_id(index + 1)
    for campo, validos in VALORES_VALIDOS.items():
        if result[campo] not in validos:
            result[campo] = DEFAULTS[campo]
    return result


def cargar_csv(ruta):
    with open(ruta, newline='', encoding='utf-8-sig') as f:
        return [dict(r) for r in csv.DictReader(f)]


def cargar_json(ruta):
    with open(ruta, encoding='utf-8') as f:
        return json.load(f)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    entrada = sys.argv[1]
    salida = sys.argv[2] if len(sys.argv) > 2 else LEADS_JSON

    if not os.path.exists(entrada):
        print(f"[ERROR] No se encuentra: {entrada}")
        sys.exit(1)

    if entrada.endswith('.csv'):
        raw = cargar_csv(entrada)
        print(f"[OK] {len(raw)} leads leídos desde CSV")
    elif entrada.endswith('.json'):
        raw = cargar_json(entrada)
        print(f"[OK] {len(raw)} leads leídos desde JSON")
    else:
        print("[ERROR] Usa .csv o .json")
        sys.exit(1)

    existentes = []
    if os.path.exists(salida):
        existentes = cargar_json(salida)
        print(f"[INFO] {len(existentes)} leads ya existentes en {salida}")

    ids_existentes = {l['id'] for l in existentes}
    nuevos = []

    for i, lead in enumerate(raw):
        norm = normalizar(lead, len(existentes) + i)
        validar(norm, i)
        if norm['id'] not in ids_existentes:
            nuevos.append(norm)
        else:
            print(f"[SKIP] {norm['id']} ya existe")

    final = existentes + nuevos
    os.makedirs(os.path.dirname(salida), exist_ok=True)
    with open(salida, 'w', encoding='utf-8') as f:
        json.dump(final, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] {len(nuevos)} leads nuevos añadidos")
    print(f"[OK] Total en {salida}: {len(final)} leads")


if __name__ == '__main__':
    main()
