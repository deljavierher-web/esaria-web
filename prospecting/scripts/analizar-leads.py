#!/usr/bin/env python3
"""
EsarIA — Analizar leads y generar mensajes personalizados
Lee leads.json y enriquece cada lead con análisis comercial.

Uso:
  python3 analizar-leads.py
  python3 analizar-leads.py ../leads/leads.json
  python3 analizar-leads.py entrada.json salida.json
"""

import json
import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LEADS_JSON = os.path.join(BASE_DIR, '..', 'leads', 'leads.json')

ANALISIS_SECTOR = {
    'clínica dental': {
        'problema_visible': 'Gestión manual de citas por teléfono y cancelaciones de última hora',
        'oportunidad': 'Sistema de citas online 24h + recordatorios automáticos + respuesta a FAQ por WhatsApp',
        'prioridad': 'Alta',
        'apertura_llamada': 'He visto que las citas se gestionan principalmente por teléfono',
        'propuesta': 'reducir cancelaciones y liberar tiempo del equipo en la agenda'
    },
    'fisioterapia': {
        'problema_visible': 'Agenda por WhatsApp o teléfono con tiempo perdido en coordinación',
        'oportunidad': 'Sistema de citas online + recordatorios automáticos + FAQ por WhatsApp',
        'prioridad': 'Alta',
        'apertura_llamada': 'He visto que la agenda se gestiona por WhatsApp',
        'propuesta': 'automatizar citas y recordatorios para dedicar más tiempo a los pacientes'
    },
    'oftalmología': {
        'problema_visible': 'Citas por teléfono y seguimiento manual de revisiones',
        'oportunidad': 'Citas online + recordatorios de revisión + FAQ sobre seguros y precios',
        'prioridad': 'Alta',
        'apertura_llamada': 'He visto que las revisiones se coordinan manualmente',
        'propuesta': 'automatizar citas y recordatorios de próxima revisión'
    },
    'taller mecánico': {
        'problema_visible': 'Los clientes llaman para saber el estado del coche y no hay avisos automáticos',
        'oportunidad': 'Avisos de estado de reparación + presupuestos por WhatsApp + recordatorios de ITV',
        'prioridad': 'Media',
        'apertura_llamada': 'He visto que recibís muchas llamadas preguntando por el estado del coche',
        'propuesta': 'avisar automáticamente a los clientes y reducir interrupciones en el taller'
    },
    'chapa y pintura': {
        'problema_visible': 'Sin sistema de seguimiento del estado de la reparación ni avisos al cliente',
        'oportunidad': 'Avisos de estado + presupuestos por WhatsApp + recordatorios de entrega',
        'prioridad': 'Media',
        'apertura_llamada': 'He visto que el seguimiento de reparaciones se hace por llamadas',
        'propuesta': 'avisar automáticamente al cliente durante el proceso de reparación'
    },
    'gimnasio': {
        'problema_visible': 'Alta tasa de bajas y captación de nuevos socios sin seguimiento',
        'oportunidad': 'Seguimiento de leads + onboarding automático + recordatorios de renovación',
        'prioridad': 'Alta',
        'apertura_llamada': 'He visto que la captación de socios se hace principalmente por redes',
        'propuesta': 'automatizar el seguimiento de leads y reducir bajas con recordatorios'
    },
    'crossfit': {
        'problema_visible': 'Reservas de clases manuales y sin proceso de retención de socios',
        'oportunidad': 'Reservas online + recordatorios de renovación + seguimiento de bajas',
        'prioridad': 'Media',
        'apertura_llamada': 'He visto que las reservas se gestionan por WhatsApp',
        'propuesta': 'automatizar reservas y retener socios con seguimientos automáticos'
    },
    'academia': {
        'problema_visible': 'Matriculación manual y sin seguimiento sistematizado de interesados',
        'oportunidad': 'Automatización de matriculación + seguimiento de leads + recordatorios de inicio de curso',
        'prioridad': 'Media',
        'apertura_llamada': 'He visto que la captación de alumnos se gestiona manualmente',
        'propuesta': 'automatizar el seguimiento de interesados y el proceso de matriculación'
    },
    'comercio': {
        'problema_visible': 'Muchas consultas por WhatsApp sin respuesta organizada ni catálogo digital',
        'oportunidad': 'Respuesta automática a WhatsApp + catálogo digital + avisos a clientes habituales',
        'prioridad': 'Baja',
        'apertura_llamada': 'He visto que recibís muchas consultas por WhatsApp e Instagram',
        'propuesta': 'responder automáticamente consultas frecuentes y no perder ventas por mensajes sin contestar'
    },
    'tienda': {
        'problema_visible': 'Consultas por WhatsApp sin gestión organizada y catálogo solo en redes',
        'oportunidad': 'Respuesta automática a consultas + catálogo digital compartible por WhatsApp',
        'prioridad': 'Baja',
        'apertura_llamada': 'He visto que gestionáis las consultas principalmente por WhatsApp',
        'propuesta': 'automatizar respuestas frecuentes y tener un catálogo siempre disponible'
    },
    'restaurante': {
        'problema_visible': 'Reservas por teléfono o sin sistema + sin gestión de lista de espera',
        'oportunidad': 'Reservas online + confirmación automática + recordatorio de reserva',
        'prioridad': 'Media',
        'apertura_llamada': 'He visto que las reservas se gestionan por teléfono',
        'propuesta': 'automatizar reservas y recordatorios para reducir no-shows'
    },
    'peluquería': {
        'problema_visible': 'Citas por WhatsApp o llamada sin recordatorio automático',
        'oportunidad': 'Sistema de citas online + recordatorios automáticos + gestión de huecos libres',
        'prioridad': 'Media',
        'apertura_llamada': 'He visto que las citas se piden principalmente por WhatsApp',
        'propuesta': 'automatizar citas y recordatorios para reducir ausencias y gestionar la agenda'
    }
}

ANALISIS_DEFAULT = {
    'problema_visible': 'Procesos de gestión manuales que consumen tiempo del equipo',
    'oportunidad': 'Automatización de tareas repetitivas: comunicación con clientes, seguimientos y recordatorios',
    'prioridad': 'Media',
    'apertura_llamada': 'He visto vuestro negocio y he detectado procesos que se podrían automatizar',
    'propuesta': 'ahorrar tiempo en tareas repetitivas de gestión y comunicación con clientes'
}


def buscar_analisis(sector):
    sector_lower = sector.lower().strip()
    for clave, datos in ANALISIS_SECTOR.items():
        if clave in sector_lower or sector_lower in clave:
            return datos
    return ANALISIS_DEFAULT


def generar_mensaje_llamada(lead, analisis):
    nombre = lead.get('decisor_nombre', '').split()[0] if lead.get('decisor_nombre') else '[NOMBRE]'
    empresa = lead.get('nombre_empresa', '[EMPRESA]')
    apertura = analisis['apertura_llamada']
    propuesta = analisis['propuesta']
    reunion = 'pasarme por allí' if lead.get('tipo_reunion_recomendada') == 'Presencial' else 'quedar por videollamada'

    return (
        f"Hola {nombre}, soy Javier de EsarIA. {apertura} en {empresa}. "
        f"Tenemos una solución para {propuesta}. "
        f"¿Te puedo comentar en 2 minutos? Si te parece bien, me gustaría {reunion} esta semana "
        f"para enseñarte exactamente qué detectamos en vuestro caso. Son 20 minutos, sin compromiso."
    )


def generar_mensaje_whatsapp(lead, analisis):
    nombre = lead.get('decisor_nombre', '').split()[0] if lead.get('decisor_nombre') else '[NOMBRE]'
    propuesta = analisis['propuesta']
    reunion = '20 minutos en persona' if lead.get('tipo_reunion_recomendada') == 'Presencial' else '20 minutos por videollamada'

    return (
        f"Hola {nombre} 👋 Soy Javier de EsarIA, acabo de llamarte.\n\n"
        f"Trabajamos con negocios locales para {propuesta}.\n\n"
        f"¿Le viene bien esta semana {reunion} para un diagnóstico gratuito? Sin compromiso.\n\n"
        f"Un saludo,\nJavier — EsarIA"
    )


def analizar(lead):
    analisis = buscar_analisis(lead.get('sector', ''))

    if not lead.get('problema_visible'):
        lead['problema_visible'] = analisis['problema_visible']

    if not lead.get('oportunidad_automatizacion'):
        lead['oportunidad_automatizacion'] = analisis['oportunidad']

    if not lead.get('prioridad') or lead['prioridad'] == 'Media':
        lead['prioridad'] = analisis['prioridad']

    if not lead.get('mensaje_llamada_personalizado'):
        lead['mensaje_llamada_personalizado'] = generar_mensaje_llamada(lead, analisis)

    if not lead.get('mensaje_whatsapp_personalizado'):
        lead['mensaje_whatsapp_personalizado'] = generar_mensaje_whatsapp(lead, analisis)

    return lead


def main():
    entrada = sys.argv[1] if len(sys.argv) > 1 else LEADS_JSON
    salida = sys.argv[2] if len(sys.argv) > 2 else entrada

    if not os.path.exists(entrada):
        print(f"[ERROR] No se encuentra: {entrada}")
        sys.exit(1)

    with open(entrada, encoding='utf-8') as f:
        leads = json.load(f)

    print(f"[OK] {len(leads)} leads cargados desde {entrada}")

    analizados = 0
    for lead in leads:
        lead_orig = dict(lead)
        lead = analizar(lead)
        if lead != lead_orig:
            analizados += 1
            print(f"  [+] {lead['id']} — {lead['nombre_empresa']}: enriquecido")

    with open(salida, 'w', encoding='utf-8') as f:
        json.dump(leads, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] {analizados} leads enriquecidos")
    print(f"[OK] Guardado en: {salida}")


if __name__ == '__main__':
    main()
