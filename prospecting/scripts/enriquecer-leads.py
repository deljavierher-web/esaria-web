#!/usr/bin/env python3
"""
EsarIA — Enriquecer leads reales con análisis comercial.

Lee leads-reales.json y completa los campos de análisis según el sector:
  - problema_visible
  - oportunidad_automatizacion
  - prioridad
  - facilidad_contacto
  - tipo_reunion_recomendada
  - mensaje_llamada_personalizado
  - mensaje_whatsapp_personalizado

Uso:
  python3 enriquecer-leads.py
  python3 enriquecer-leads.py leads/reales/leads-reales.json
"""

import json
import sys
import os
from pathlib import Path

BASE   = Path(__file__).parent.parent
INPUT  = BASE / 'leads' / 'reales' / 'leads-reales.json'
OUTPUT = INPUT  # Sobrescribe el mismo archivo

# ---------------------------------------------------------------------------
# Base de conocimiento por sector
# ---------------------------------------------------------------------------
ANALISIS = {
    'Clínica dental': {
        'problema':    'Gestión manual de citas por teléfono y cancelaciones de última hora sin aviso',
        'oportunidad': 'Sistema de citas online 24h + recordatorios automáticos + respuesta a FAQ por WhatsApp',
        'prioridad':   'Alta',
        'apertura':    'He visto que las citas se gestionan principalmente por teléfono',
        'propuesta':   'reducir cancelaciones y liberar tiempo del equipo en la agenda',
        'tipo_reunion':'Presencial',
    },
    'Fisioterapia': {
        'problema':    'Agenda por WhatsApp o teléfono con tiempo perdido en coordinación manual',
        'oportunidad': 'Sistema de citas online + recordatorios automáticos + FAQ por WhatsApp',
        'prioridad':   'Alta',
        'apertura':    'He visto que la agenda se gestiona por WhatsApp',
        'propuesta':   'automatizar citas y recordatorios para dedicar más tiempo a los pacientes',
        'tipo_reunion':'Presencial',
    },
    'Oftalmología': {
        'problema':    'Citas por teléfono y seguimiento manual de revisiones periódicas',
        'oportunidad': 'Citas online + recordatorios de revisión + FAQ sobre seguros y precios por WhatsApp',
        'prioridad':   'Alta',
        'apertura':    'He visto que las revisiones se coordinan manualmente',
        'propuesta':   'automatizar citas y recordatorios de próxima revisión',
        'tipo_reunion':'Presencial',
    },
    'Taller mecánico': {
        'problema':    'Los clientes llaman para saber el estado del coche y no hay avisos automáticos',
        'oportunidad': 'Avisos de estado de reparación por WhatsApp + presupuestos digitales + recordatorios de ITV',
        'prioridad':   'Alta',
        'apertura':    'He visto que recibís muchas llamadas preguntando por el estado del coche',
        'propuesta':   'avisar automáticamente a los clientes y reducir interrupciones en el taller',
        'tipo_reunion':'Presencial',
    },
    'Chapa y pintura': {
        'problema':    'Sin sistema de seguimiento del estado de la reparación ni avisos automáticos al cliente',
        'oportunidad': 'Avisos de estado + presupuestos digitales + recordatorios de entrega por WhatsApp',
        'prioridad':   'Media',
        'apertura':    'He visto que el seguimiento de reparaciones se hace por llamadas',
        'propuesta':   'avisar automáticamente al cliente durante el proceso de reparación',
        'tipo_reunion':'Presencial',
    },
    'Gimnasio': {
        'problema':    'Alta tasa de bajas y captación de nuevos socios sin seguimiento sistemático',
        'oportunidad': 'Seguimiento de leads + onboarding automático + recordatorios de renovación antes de la baja',
        'prioridad':   'Alta',
        'apertura':    'He visto que la captación de socios se hace principalmente por redes sociales',
        'propuesta':   'automatizar el seguimiento de leads y reducir bajas con recordatorios anticipados',
        'tipo_reunion':'Presencial',
    },
    'Crossfit': {
        'problema':    'Reservas de clases manuales por WhatsApp y sin proceso de retención de socios',
        'oportunidad': 'Reservas online + recordatorios de renovación + seguimiento de leads interesados',
        'prioridad':   'Media',
        'apertura':    'He visto que las reservas se gestionan por WhatsApp',
        'propuesta':   'automatizar reservas y retener socios con seguimientos automáticos',
        'tipo_reunion':'Presencial',
    },
    'Academia': {
        'problema':    'Matriculación manual y sin seguimiento sistematizado de interesados que no se matriculan',
        'oportunidad': 'Automatización de matriculación + seguimiento de leads + recordatorios de inicio de curso',
        'prioridad':   'Media',
        'apertura':    'He visto que la captación de alumnos se gestiona manualmente',
        'propuesta':   'automatizar el seguimiento de interesados y el proceso de matriculación',
        'tipo_reunion':'Videollamada',
    },
    'Comercio': {
        'problema':    'Muchas consultas por WhatsApp sin respuesta organizada ni catálogo digital actualizado',
        'oportunidad': 'Respuesta automática a WhatsApp + catálogo digital compartible + avisos a clientes habituales',
        'prioridad':   'Media',
        'apertura':    'He visto que recibís muchas consultas por WhatsApp e Instagram',
        'propuesta':   'organizar las consultas automáticamente para no perder ventas cuando estáis ocupados',
        'tipo_reunion':'Presencial',
    },
    'Óptica': {
        'problema':    'Sin sistema de recordatorio de revisiones ni seguimiento de clientes con graduación pendiente',
        'oportunidad': 'Recordatorios de revisión anual + FAQ de precios y seguros + citas online',
        'prioridad':   'Media',
        'apertura':    'He visto que los recordatorios de revisión se gestionan manualmente',
        'propuesta':   'automatizar recordatorios y recuperar clientes que no vuelven a revisar la graduación',
        'tipo_reunion':'Presencial',
    },
    'Peluquería': {
        'problema':    'Citas gestionadas por teléfono o WhatsApp sin recordatorios automáticos',
        'oportunidad': 'Sistema de citas online + recordatorios de cita + aviso de servicios nuevos a clientes habituales',
        'prioridad':   'Media',
        'apertura':    'He visto que las citas se gestionan manualmente por WhatsApp',
        'propuesta':   'automatizar citas y recordatorios para reducir ausencias y llamadas',
        'tipo_reunion':'Presencial',
    },
    'Estética': {
        'problema':    'Sin seguimiento de clientes habituales ni recordatorios de próximo tratamiento',
        'oportunidad': 'Citas online + recordatorios de seguimiento + avisos de bonos próximos a caducar',
        'prioridad':   'Media',
        'apertura':    'He visto que la gestión de citas y bonos se hace manualmente',
        'propuesta':   'automatizar citas y recordatorios de tratamientos para fidelizar clientes',
        'tipo_reunion':'Presencial',
    },
}

GENERICO = {
    'problema':    'Procesos manuales que consumen tiempo del equipo sin aportar valor añadido',
    'oportunidad': 'Automatización de comunicaciones con clientes y gestión de consultas frecuentes',
    'prioridad':   'Media',
    'apertura':    'He visto cómo gestionáis la comunicación con clientes',
    'propuesta':   'automatizar las tareas repetitivas para que el equipo se centre en lo importante',
    'tipo_reunion':'Presencial',
}

# Aliases para normalizar sectores escritos de formas distintas
SECTOR_ALIASES = {
    'clinica dental':    'Clínica dental',
    'clínica dental':    'Clínica dental',
    'dentista':          'Clínica dental',
    'clínicas dentales': 'Clínica dental',
    'fisio':             'Fisioterapia',
    'fisioterapia':      'Fisioterapia',
    'taller':            'Taller mecánico',
    'taller mecánico':   'Taller mecánico',
    'taller mecanico':   'Taller mecánico',
    'mecánico':          'Taller mecánico',
    'gym':               'Gimnasio',
    'gimnasio':          'Gimnasio',
    'crossfit':          'Crossfit',
    'academia':          'Academia',
    'comercio':          'Comercio',
    'tienda':            'Comercio',
    'optica':            'Óptica',
    'óptica':            'Óptica',
    'peluqueria':        'Peluquería',
    'peluquería':        'Peluquería',
    'estetica':          'Estética',
    'estética':          'Estética',
    'oftalmologia':      'Oftalmología',
    'oftalmología':      'Oftalmología',
}


def resolver_sector(raw: str) -> dict:
    k = raw.lower().strip()
    canonical = SECTOR_ALIASES.get(k, raw.title())
    return ANALISIS.get(canonical, ANALISIS.get(raw.title(), GENERICO))


def calcular_facilidad_contacto(lead: dict) -> str:
    ciudad_ok = 'valladolid' in (lead.get('ciudad') or '').lower()
    tiene_tel  = bool((lead.get('telefono') or '').strip())
    if ciudad_ok and tiene_tel:
        return 'Alta'
    if tiene_tel or ciudad_ok:
        return 'Media'
    return 'Baja'


def calcular_prioridad(lead: dict, base: dict) -> str:
    ciudad_ok = 'valladolid' in (lead.get('ciudad') or '').lower()
    tiene_tel  = bool((lead.get('telefono') or '').strip())
    sector_ok  = base.get('prioridad') == 'Alta'
    if ciudad_ok and tiene_tel and sector_ok:
        return 'Alta'
    if ciudad_ok and tiene_tel:
        return 'Media'
    return 'Baja'


def generar_mensajes(lead: dict, base: dict) -> tuple:
    decisor  = lead.get('decisor_nombre') or 'responsable'
    empresa  = lead.get('nombre_empresa', 'vuestra empresa')
    apertura = base.get('apertura', 'He visto cómo trabajáis')
    propuesta = base.get('propuesta', 'mejorar la eficiencia')

    llamada = (
        f"Hola {decisor}, soy Javier de EsarIA. {apertura}. "
        f"Lo que hacemos es {propuesta}. ¿Te puedo comentar en 2 minutos?"
    )

    whatsapp = (
        f"Hola {decisor}, soy Javier de EsarIA, acabo de llamarte.\n\n"
        f"Trabajamos con negocios como {empresa} para {propuesta}.\n\n"
        f"¿Le viene bien esta semana 20 minutos para un diagnóstico gratuito? Sin compromiso.\n\n"
        f"Un saludo,\nJavier — EsarIA"
    )

    return llamada, whatsapp


def generar_guion_recepcion(lead: dict) -> str:
    decisor = (lead.get('decisor_nombre') or '').strip()
    sector = (lead.get('sector') or '').lower()

    if decisor:
        return f"Hola, buenos días. ¿Podría hablar un momento con {decisor}? Soy Javier, de EsarIA."
    if 'clínica' in sector or 'clinica' in sector or 'dental' in sector or 'fisioterapia' in sector:
        return "Hola, buenos días. ¿Podría hablar un momento con la persona que lleva la gestión de la clínica?"
    if 'taller' in sector:
        return "Hola, buenos días. ¿Está el dueño o la persona que lleva el taller?"
    if 'gimnasio' in sector or 'crossfit' in sector:
        return "Hola, buenos días. ¿Podría hablar con la persona responsable del centro?"
    if 'academia' in sector:
        return "Hola, buenos días. ¿Podría hablar con la persona que lleva la dirección de la academia?"
    if 'comercio' in sector or 'tienda' in sector:
        return "Hola, buenos días. ¿Está la persona que lleva la tienda?"
    return "Hola, buenos días. ¿Podría hablar con la persona responsable del negocio?"


def enriquecer_lead(lead: dict) -> tuple[dict, bool]:
    """Devuelve (lead enriquecido, modificado: bool)."""
    sector_raw = lead.get('sector', '')
    base = resolver_sector(sector_raw)
    modificado = False

    campos = {
        'problema_visible':           base['problema'],
        'oportunidad_automatizacion': base['oportunidad'],
        'facilidad_contacto':         calcular_facilidad_contacto(lead),
        'tipo_reunion_recomendada':   base['tipo_reunion'],
    }
    campos['prioridad'] = calcular_prioridad(lead, base)

    llamada, whatsapp = generar_mensajes(lead, base)
    campos['mensaje_llamada_personalizado']  = llamada
    campos['mensaje_whatsapp_personalizado'] = whatsapp
    campos['guion_recepcion_personalizado'] = generar_guion_recepcion(lead)

    for clave, valor in campos.items():
        if not lead.get(clave):
            lead[clave] = valor
            modificado = True

    return lead, modificado


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else INPUT

    if not path.exists():
        print(f'[ERROR] No se encuentra: {path}')
        sys.exit(1)

    with open(path, encoding='utf-8') as f:
        leads = json.load(f)

    if not isinstance(leads, list):
        print('[ERROR] El archivo no contiene una lista de leads.')
        sys.exit(1)

    if not leads:
        print('[AVISO] El archivo está vacío. Añade leads con buscar-leads.py primero.')
        sys.exit(0)

    total, modificados = len(leads), 0
    for i, lead in enumerate(leads):
        leads[i], cambio = enriquecer_lead(lead)
        if cambio:
            modificados += 1

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)

    print(f'[OK] {total} leads procesados, {modificados} enriquecidos.')
    print(f'     Guardado en: {path}')
    print()
    print('Siguiente paso — abrir la app e importar el JSON:')
    print(f'  open {BASE}/app/index.html')


if __name__ == '__main__':
    main()
