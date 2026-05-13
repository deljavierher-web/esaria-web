#!/usr/bin/env python3
"""
EsarIA — Buscar leads por sector y ciudad usando datos públicos.

MODO A (API): Si existe GOOGLE_PLACES_API_KEY en .env, usa Google Places API.
MODO B (semi-auto): Abre búsquedas preparadas en el navegador e instrucciones
                    para pegar/importar resultados manualmente.

Uso:
  python3 buscar-leads.py --sector "clínicas dentales" --ciudad "Valladolid" --limite 20
  python3 buscar-leads.py --sector "talleres mecánicos" --ciudad "Valladolid"
  python3 buscar-leads.py --sector "gimnasios" --ciudad "Valladolid" --limite 10
"""

import argparse
import json
import os
import sys
import subprocess
import urllib.parse
import datetime
import uuid
from pathlib import Path

# ---------------------------------------------------------------------------
# Rutas
# ---------------------------------------------------------------------------
BASE       = Path(__file__).parent.parent
ENV_FILE   = BASE.parent / '.env'
OUTPUT     = BASE / 'leads' / 'reales' / 'leads-reales.json'
FUSIONAR   = BASE / 'scripts' / 'fusionar-leads.py'

# ---------------------------------------------------------------------------
# Cargar .env (si existe) sin dependencias externas
# ---------------------------------------------------------------------------
def load_env(path: Path) -> dict:
    env = {}
    if not path.exists():
        return env
    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, _, v = line.partition('=')
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env

# ---------------------------------------------------------------------------
# Google Places Text Search API
# Documentación: https://developers.google.com/maps/documentation/places/web-service/text-search
# Solo datos públicos: nombre, teléfono publicado, web, dirección, rating.
# ---------------------------------------------------------------------------
PLACES_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json'

def buscar_con_api(query: str, api_key: str, limite: int) -> list:
    try:
        import urllib.request
    except ImportError:
        print('[ERROR] urllib no disponible.')
        return []

    resultados = []
    page_token = None

    while len(resultados) < limite:
        params = {'query': query, 'key': api_key, 'language': 'es'}
        if page_token:
            params['pagetoken'] = page_token

        url = PLACES_URL + '?' + urllib.parse.urlencode(params)
        try:
            with urllib.request.urlopen(url, timeout=15) as resp:
                data = json.loads(resp.read().decode())
        except Exception as e:
            print(f'[ERROR] Llamada a Places API fallida: {e}')
            break

        if data.get('status') not in ('OK', 'ZERO_RESULTS'):
            print(f"[ERROR] Places API: {data.get('status')} — {data.get('error_message', '')}")
            break

        for place in data.get('results', []):
            if len(resultados) >= limite:
                break
            detail = obtener_detalle(place['place_id'], api_key)
            resultados.append(detail)

        page_token = data.get('next_page_token')
        if not page_token:
            break

        import time
        time.sleep(2)  # Places API requiere un breve delay entre páginas

    return resultados


def obtener_detalle(place_id: str, api_key: str) -> dict:
    import urllib.request
    fields = 'name,formatted_phone_number,website,formatted_address,rating,user_ratings_total,business_status'
    params = {'place_id': place_id, 'fields': fields, 'key': api_key, 'language': 'es'}
    url = DETAILS_URL + '?' + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = json.loads(resp.read().decode())
        r = data.get('result', {})
    except Exception:
        r = {}

    return {
        'nombre_empresa': r.get('name', ''),
        'telefono':       r.get('formatted_phone_number', ''),
        'web':            r.get('website', ''),
        'direccion':      r.get('formatted_address', ''),
        'rating':         str(r.get('rating', '')),
        'num_resenas':    str(r.get('user_ratings_total', '')),
        'place_id':       place_id,
    }


# ---------------------------------------------------------------------------
# Mapeo sector → datos de análisis
# ---------------------------------------------------------------------------
SECTOR_MAP = {
    'clínica dental':    'Clínica dental',
    'clinica dental':    'Clínica dental',
    'dentista':          'Clínica dental',
    'clínicas dentales': 'Clínica dental',
    'fisioterapia':      'Fisioterapia',
    'fisioterapeuta':    'Fisioterapia',
    'taller mecánico':   'Taller mecánico',
    'talleres mecánicos':'Taller mecánico',
    'taller mecanico':   'Taller mecánico',
    'mecánico':          'Taller mecánico',
    'gimnasio':          'Gimnasio',
    'gimnasios':         'Gimnasio',
    'gym':               'Gimnasio',
    'crossfit':          'Crossfit',
    'academia':          'Academia',
    'academias':         'Academia',
    'comercio':          'Comercio',
    'tienda':            'Comercio',
    'óptica':            'Óptica',
    'optica':            'Óptica',
    'peluquería':        'Peluquería',
    'peluqueria':        'Peluquería',
    'estetica':          'Estética',
    'estética':          'Estética',
    'oftalmología':      'Oftalmología',
    'oftalmologia':      'Oftalmología',
}

def normalizar_sector(sector_raw: str) -> str:
    k = sector_raw.lower().strip()
    return SECTOR_MAP.get(k, sector_raw.title())


# ---------------------------------------------------------------------------
# Construir lead a partir de resultado de API
# ---------------------------------------------------------------------------
def construir_lead(raw: dict, sector_norm: str, ciudad: str, query: str) -> dict:
    ahora = datetime.datetime.now().strftime('%Y-%m-%d')
    place_id = raw.get('place_id', '')
    return {
        'id':                         generar_id(place_id),
        'nombre_empresa':             raw.get('nombre_empresa', ''),
        'sector':                     sector_norm,
        'ciudad':                     ciudad,
        'telefono':                   raw.get('telefono', ''),
        'email':                      '',
        'web':                        raw.get('web', ''),
        'instagram':                  '',
        'linkedin':                   '',
        'direccion':                  raw.get('direccion', ''),
        'decisor_nombre':             '',
        'decisor_cargo':              '',
        'fuente_datos':               f'Google Places API — búsqueda: "{query}" — {ahora}',
        'place_id':                   raw.get('place_id', ''),
        'rating':                     raw.get('rating', ''),
        'num_resenas':                raw.get('num_resenas', ''),
        'fecha_captura':              ahora,
        'problema_visible':           '',
        'oportunidad_automatizacion': '',
        'prioridad':                  '',
        'facilidad_contacto':         '',
        'tipo_reunion_recomendada':   'Presencial',
        'mensaje_llamada_personalizado':  '',
        'mensaje_whatsapp_personalizado': '',
        'estado':                     'Nuevo',
        'notas':                      '',
    }


def generar_id(place_id: str = '') -> str:
    """ID estable y único: usa place_id de Google (globalmente único) o UUID4."""
    if place_id:
        return f'PLACE-{place_id}'
    return f'LEAD-{uuid.uuid4().hex[:12].upper()}'


# ---------------------------------------------------------------------------
# Modo semi-automático: abrir búsquedas y dar instrucciones
# ---------------------------------------------------------------------------
def modo_semi_auto(sector: str, ciudad: str, limite: int):
    queries = [
        f'{sector} {ciudad}',
        f'{sector} cerca de {ciudad}',
    ]

    print()
    print('=' * 60)
    print('  MODO SEMI-AUTOMÁTICO — Sin API key configurada')
    print('=' * 60)
    print()
    print('Se abrirán búsquedas en Google Maps y en Google.')
    print('Sigue estos pasos:')
    print()
    print('  1. En Google Maps → busca los negocios')
    print('  2. Para cada resultado, anota en un CSV:')
    print('       nombre_empresa, telefono, web, direccion, fuente_datos')
    print('  3. Guarda el CSV en:')
    print(f'     {BASE}/leads/reales/nuevos.csv')
    print('  4. Importa con:')
    print(f'     python3 {BASE}/scripts/importar-leads.py \\')
    print(f'       {BASE}/leads/reales/nuevos.csv \\')
    print(f'       {OUTPUT}')
    print()
    print('Búsquedas preparadas (se abrirán ahora en el navegador):')
    print()

    urls_maps = []
    urls_google = []
    for q in queries:
        encoded = urllib.parse.quote_plus(q)
        maps_url = f'https://www.google.com/maps/search/{encoded}'
        google_url = f'https://www.google.com/search?q={encoded}'
        urls_maps.append(maps_url)
        urls_google.append(google_url)
        print(f'  Google Maps : {maps_url}')
        print(f'  Google      : {google_url}')
        print()

    respuesta = input('¿Abrir en el navegador ahora? [s/N]: ').strip().lower()
    if respuesta in ('s', 'si', 'sí', 'y', 'yes'):
        for url in urls_maps[:1]:
            try:
                subprocess.run(['open', url])
            except Exception:
                print(f'  Abre manualmente: {url}')

    print()
    print('Después de recopilar los datos, guárdalos en un CSV con estas columnas:')
    print('  nombre_empresa,sector,ciudad,telefono,web,direccion,fuente_datos')
    print()
    print(f'Sector a usar en el CSV: "{normalizar_sector(sector)}"')
    print(f'Ciudad:                  "{ciudad}"')
    print(f'Fuente de datos ejemplo: "Google Maps — búsqueda manual — {datetime.datetime.now().strftime("%Y-%m-%d")}"')
    print()
    print('Cuando tengas el CSV, ejecuta:')
    print(f'  python3 scripts/importar-leads.py leads/reales/nuevos.csv {OUTPUT}')
    print('Luego enriquece:')
    print(f'  python3 scripts/enriquecer-leads.py')
    print()


# ---------------------------------------------------------------------------
# Guardar resultados en archivo temporal para fusionar
# ---------------------------------------------------------------------------
def guardar_resultado(leads_nuevos: list, sector: str, ciudad: str, query: str):
    ahora = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    tmp_path = BASE / 'leads' / 'reales' / f'batch-{ahora}.json'
    with open(tmp_path, 'w', encoding='utf-8') as f:
        json.dump(leads_nuevos, f, ensure_ascii=False, indent=2)
    print(f'[OK] {len(leads_nuevos)} leads guardados en:')
    print(f'     {tmp_path}')
    print()
    print('Siguiente paso — fusionar con la base principal:')
    print(f'  python3 scripts/fusionar-leads.py {tmp_path}')
    print()
    print('Y enriquecer:')
    print(f'  python3 scripts/enriquecer-leads.py')


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description='EsarIA — Buscar leads por sector y ciudad (datos públicos)'
    )
    parser.add_argument('--sector',  required=True, help='Sector a buscar, ej: "clínicas dentales"')
    parser.add_argument('--ciudad',  required=True, help='Ciudad, ej: "Valladolid"')
    parser.add_argument('--limite',  type=int, default=20, help='Máximo de leads a obtener (default: 20)')
    args = parser.parse_args()

    sector_norm = normalizar_sector(args.sector)
    query       = f'{args.sector} {args.ciudad}'

    print()
    print(f'[EsarIA] Buscar leads — sector: "{sector_norm}" — ciudad: "{args.ciudad}"')
    print(f'[EsarIA] Límite: {args.limite} resultados')
    print()

    # Detectar API key
    env = load_env(ENV_FILE)
    api_key = env.get('GOOGLE_PLACES_API_KEY') or os.environ.get('GOOGLE_PLACES_API_KEY', '')

    if api_key:
        print('[MODO A] Google Places API detectada. Buscando...')
        print()
        raw_results = buscar_con_api(query, api_key, args.limite)
        if not raw_results:
            print('[AVISO] La API no devolvió resultados para esa búsqueda.')
            print('        Prueba con otro término o cambia el sector.')
            sys.exit(0)

        leads_nuevos = [construir_lead(r, sector_norm, args.ciudad, query) for r in raw_results]
        print(f'[OK] {len(leads_nuevos)} resultados obtenidos de la API.')
        guardar_resultado(leads_nuevos, sector_norm, args.ciudad, query)

    else:
        print('[MODO B] No se encontró GOOGLE_PLACES_API_KEY en .env.')
        print('         Activando modo semi-automático...')
        modo_semi_auto(args.sector, args.ciudad, args.limite)
        print()
        print('Para activar MODO A (automático), añade a .env:')
        print('  GOOGLE_PLACES_API_KEY=tu_clave_aqui')
        print()
        print('La clave es gratuita hasta ciertos límites en:')
        print('  https://console.cloud.google.com/')
        print('  (habilita "Places API" en el proyecto)')


if __name__ == '__main__':
    main()
