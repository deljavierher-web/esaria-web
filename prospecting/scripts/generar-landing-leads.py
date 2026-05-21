#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Landing Pages Personalizadas — EsarIA
===================================================
Lee leads-reales.json y compila un index.html interactivo
ultra-personalizado por negocio.

Uso:
  python generar-landing-leads.py "Talleres Markos"
  python generar-landing-leads.py --all
  python generar-landing-leads.py --sector "Gimnasio"
  python generar-landing-leads.py --list
"""

import json
import os
import re
import sys
import unicodedata
from html import escape as esc
from pathlib import Path

# ── Configuración ────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
LEADS_FILE = PROJECT_ROOT / "prospecting" / "leads" / "reales" / "leads-reales.json"
OUTPUT_DIR = PROJECT_ROOT / "docs" / "comercial" / "demos"
WA_NUMBER = "34614918261"  # ← Número de WhatsApp de Javier


# ── Utilidades ───────────────────────────────────────────────
def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()
    text = re.sub(r'[^\w\s-]', '', text.lower())
    return re.sub(r'[-\s]+', '-', text).strip('-')[:60]


def nombre_corto(nombre):
    n = re.sub(r'\s*\(.*?\)', '', nombre)
    n = n.split('|')[0].strip()
    n = re.sub(r'\s+en\s+\w+$', '', n, flags=re.IGNORECASE)
    return n.strip() or nombre


def iniciales(nombre):
    words = nombre_corto(nombre).split()
    return ''.join(w[0].upper() for w in words[:2]) if words else '?'


def cargar_leads():
    with open(LEADS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def buscar_lead(leads, query):
    q = query.lower().strip()
    for lead in leads:
        if lead['nombre_empresa'].lower() == q:
            return lead
    for lead in leads:
        if q in lead['nombre_empresa'].lower():
            return lead
    return None


# ── Configuración por Sector ─────────────────────────────────
def get_sector_config(sector):
    configs = {
        'Gimnasio': {
            'emoji': '🏋️',
            'backend_title': 'Agenda de Clases — Hoy',
            'buttons': [
                {
                    'id': 'btn-reservar',
                    'label': '📅 Reservar clase de las 19:30',
                    'userMsg': 'Me gustaría reservar la clase de CrossFit de las 19:30',
                    'botResponses': [
                        '¡Perfecto! Déjame comprobarlo... 🔍',
                        '✅ <b>Reserva confirmada</b><br><br>📋 Clase: CrossFit PRO<br>⏰ Hora: 19:30<br>📍 Sala principal<br><br>¡Nos vemos! 💪'
                    ],
                    'backendAction': 'reserve_class'
                },
                {
                    'id': 'btn-tarifas',
                    'label': '💰 Consultar tarifas',
                    'userMsg': '¿Cuáles son las tarifas del gimnasio?',
                    'botResponses': [
                        '¡Claro! Aquí tienes nuestras tarifas:',
                        '🏋️ <b>Plan Básico</b>: 39€/mes<br>🔥 <b>Plan Premium</b>: 59€/mes<br>⭐ <b>Plan VIP</b>: 79€/mes<br><br>Todos incluyen acceso libre. ¿Te apuntas a una clase de prueba gratis? 😊'
                    ],
                    'backendAction': None
                }
            ],
            'backend_html': '''
                <div class="bp-row" id="class-0700"><span class="bp-time">07:00</span><span class="bp-name">CrossFit Open</span><span class="bp-slots" id="s-0700">12/15</span></div>
                <div class="bp-row" id="class-0830"><span class="bp-time">08:30</span><span class="bp-name">CrossFit WOD</span><span class="bp-slots" id="s-0830">14/15</span></div>
                <div class="bp-row" id="class-1000"><span class="bp-time">10:00</span><span class="bp-name">Funcional</span><span class="bp-slots" id="s-1000">8/12</span></div>
                <div class="bp-row" id="class-1700"><span class="bp-time">17:00</span><span class="bp-name">CrossFit WOD</span><span class="bp-slots" id="s-1700">10/15</span></div>
                <div class="bp-row bp-target" id="class-1930"><span class="bp-time">19:30</span><span class="bp-name">CrossFit PRO</span><span class="bp-slots" id="s-1930">14/15</span></div>
                <div class="bp-row" id="class-2100"><span class="bp-time">21:00</span><span class="bp-name">Open Box</span><span class="bp-slots" id="s-2100">5/10</span></div>
            ''',
            'backend_actions': {
                'reserve_class': [
                    {'id': 's-1930', 'prop': 'textContent', 'val': 'COMPLETO 15/15'},
                    {'id': 's-1930', 'prop': 'className', 'val': 'bp-slots full'},
                    {'id': 'class-1930', 'prop': 'addclass', 'val': 'bp-updated'}
                ]
            }
        },
        'Taller mecánico': {
            'emoji': '🔧',
            'backend_title': 'Panel del Taller — Vehículos',
            'buttons': [
                {
                    'id': 'btn-estado',
                    'label': '🚗 ¿Cómo va mi coche?',
                    'userMsg': 'Hola, quería saber cómo va la reparación de mi Seat León',
                    'botResponses': [
                        'Déjame consultar el estado... 🔍',
                        '✅ <b>¡Buenas noticias!</b><br><br>Tu Seat León (1234-ABC) ya está <b>listo para recogida</b>.<br><br>📍 Puedes pasar a recogerlo de 8:00 a 19:00.<br>¿Necesitas algo más? 😊'
                    ],
                    'backendAction': 'car_ready'
                },
                {
                    'id': 'btn-presu',
                    'label': '📋 Ver presupuesto',
                    'userMsg': '¿Me podéis enviar el presupuesto del coche?',
                    'botResponses': [
                        'Aquí tienes el presupuesto detallado:',
                        '📋 <b>Presupuesto #2024-089</b><br><br>• Pastillas de freno: 85€<br>• Discos delanteros: 120€<br>• Mano de obra: 60€<br>• <b>Total: 265€</b> (IVA incl.)<br><br>✅ ¿Lo aprobamos para empezar?'
                    ],
                    'backendAction': 'show_budget'
                }
            ],
            'backend_html': '''
                <div class="bp-car" id="car-1">
                    <div class="bp-car-head"><span>🚗</span><span class="bp-car-name">Seat León — 1234 ABC</span></div>
                    <div class="bp-car-status"><span class="bp-dot diag"></span><span class="bp-stext" id="car-1-st">En Diagnóstico</span></div>
                </div>
                <div class="bp-car" id="car-2">
                    <div class="bp-car-head"><span>🚙</span><span class="bp-car-name">VW Golf — 5678 DEF</span></div>
                    <div class="bp-car-status"><span class="bp-dot repair"></span><span class="bp-stext">Reparando</span></div>
                </div>
                <div class="bp-car" id="car-3">
                    <div class="bp-car-head"><span>🚐</span><span class="bp-car-name">Ford Focus — 9012 GHI</span></div>
                    <div class="bp-car-status"><span class="bp-dot wait"></span><span class="bp-stext">Esperando Piezas</span></div>
                </div>
                <div class="bp-budget hidden" id="budget-panel">
                    <div class="bp-budget-title">📋 Presupuesto #2024-089</div>
                    <div class="bp-budget-row">Pastillas de freno <span>85€</span></div>
                    <div class="bp-budget-row">Discos delanteros <span>120€</span></div>
                    <div class="bp-budget-row">Mano de obra <span>60€</span></div>
                    <div class="bp-budget-total">Total: 265€ <span class="bp-check">✅ Aprobado</span></div>
                </div>
            ''',
            'backend_actions': {
                'car_ready': [
                    {'id': 'car-1-st', 'prop': 'textContent', 'val': '✅ Listo para Recogida'},
                    {'id': 'car-1-st', 'prop': 'className', 'val': 'bp-stext ready'},
                    {'id': 'car-1', 'prop': 'addclass', 'val': 'bp-updated'}
                ],
                'show_budget': [
                    {'id': 'budget-panel', 'prop': 'removeclass', 'val': 'hidden'},
                    {'id': 'budget-panel', 'prop': 'addclass', 'val': 'bp-updated'}
                ]
            }
        },
        'Clínica dental': {
            'emoji': '🦷',
            'backend_title': 'Agenda de Citas — Hoy',
            'buttons': [
                {
                    'id': 'btn-cita',
                    'label': '📅 Pedir cita para revisión',
                    'userMsg': 'Hola, quería pedir cita para una revisión dental',
                    'botResponses': [
                        'Déjame mirar la agenda... 📋',
                        '✅ <b>Cita reservada</b><br><br>📅 Jueves 12:30<br>👨‍⚕️ Revisión completa<br>📍 Consulta 2<br><br>Te enviaremos un recordatorio el día antes. ¡Hasta pronto! 😊'
                    ],
                    'backendAction': 'book_dental'
                },
                {
                    'id': 'btn-precio',
                    'label': '💰 ¿Cuánto cuesta una limpieza?',
                    'userMsg': '¿Cuánto cuesta una limpieza dental?',
                    'botResponses': [
                        '¡Buena pregunta! Aquí tienes los precios:',
                        '🦷 <b>Limpieza dental</b>: 45€<br>✨ <b>Blanqueamiento</b>: desde 199€<br>🔍 <b>Revisión completa</b>: Gratuita<br><br>¿Quieres que te reserve una cita? 😊'
                    ],
                    'backendAction': None
                }
            ],
            'backend_html': '''
                <div class="bp-row" id="cita-0900"><span class="bp-time">09:00</span><span class="bp-name">María G. — Ortodoncia</span><span class="bp-slots conf">Confirmada</span></div>
                <div class="bp-row" id="cita-0930"><span class="bp-time">09:30</span><span class="bp-name">Pedro L. — Limpieza</span><span class="bp-slots conf">Confirmada</span></div>
                <div class="bp-row" id="cita-1030"><span class="bp-time">10:30</span><span class="bp-name">Ana R. — Revisión</span><span class="bp-slots conf">Confirmada</span></div>
                <div class="bp-row" id="cita-1130"><span class="bp-time">11:30</span><span class="bp-name">—</span><span class="bp-slots free">Disponible</span></div>
                <div class="bp-row bp-target" id="cita-1230"><span class="bp-time">12:30</span><span class="bp-name" id="cita-1230-name">—</span><span class="bp-slots free" id="cita-1230-st">Disponible</span></div>
                <div class="bp-row" id="cita-1600"><span class="bp-time">16:00</span><span class="bp-name">Luis M. — Empaste</span><span class="bp-slots conf">Confirmada</span></div>
                <div class="bp-row" id="cita-1700"><span class="bp-time">17:00</span><span class="bp-name">—</span><span class="bp-slots free">Disponible</span></div>
            ''',
            'backend_actions': {
                'book_dental': [
                    {'id': 'cita-1230-name', 'prop': 'textContent', 'val': 'Nuevo Paciente — Revisión'},
                    {'id': 'cita-1230-st', 'prop': 'textContent', 'val': '✅ Reservada'},
                    {'id': 'cita-1230-st', 'prop': 'className', 'val': 'bp-slots conf'},
                    {'id': 'cita-1230', 'prop': 'addclass', 'val': 'bp-updated'}
                ]
            }
        },
        'Fisioterapia': {
            'emoji': '💆',
            'backend_title': 'Agenda de Sesiones — Semana',
            'buttons': [
                {
                    'id': 'btn-sesion',
                    'label': '📅 Reservar sesión',
                    'userMsg': 'Quería reservar una sesión de fisioterapia para esta semana',
                    'botResponses': [
                        'Déjame comprobar disponibilidad... 📋',
                        '✅ <b>Sesión reservada</b><br><br>📅 Miércoles 17:00<br>💆 Sesión de 45 min<br>📍 Sala 1<br><br>Recuerda traer ropa cómoda. ¡Te esperamos! 😊'
                    ],
                    'backendAction': 'book_physio'
                },
                {
                    'id': 'btn-cambiar',
                    'label': '🔄 Cambiar mi cita',
                    'userMsg': 'Necesito cambiar mi cita del viernes a otro día',
                    'botResponses': [
                        'Sin problema, déjame mirar opciones...',
                        '✅ <b>Cita modificada</b><br><br>❌ Viernes 10:00 → cancelada<br>✅ Jueves 18:00 → confirmada<br><br>¿Te viene bien? 😊'
                    ],
                    'backendAction': 'move_physio'
                }
            ],
            'backend_html': '''
                <div class="bp-row" id="phy-lun"><span class="bp-time">Lunes</span><span class="bp-name">10:00 — Carlos P.</span><span class="bp-slots conf">Confirmada</span></div>
                <div class="bp-row" id="phy-mar"><span class="bp-time">Martes</span><span class="bp-name">11:30 — Ana M.</span><span class="bp-slots conf">Confirmada</span></div>
                <div class="bp-row bp-target" id="phy-mie"><span class="bp-time">Miércoles</span><span class="bp-name" id="phy-mie-name">17:00 — Disponible</span><span class="bp-slots free" id="phy-mie-st">Libre</span></div>
                <div class="bp-row" id="phy-jue"><span class="bp-time">Jueves</span><span class="bp-name" id="phy-jue-name">18:00 — Disponible</span><span class="bp-slots free" id="phy-jue-st">Libre</span></div>
                <div class="bp-row" id="phy-vie"><span class="bp-time">Viernes</span><span class="bp-name" id="phy-vie-name">10:00 — Laura S.</span><span class="bp-slots conf" id="phy-vie-st">Confirmada</span></div>
            ''',
            'backend_actions': {
                'book_physio': [
                    {'id': 'phy-mie-name', 'prop': 'textContent', 'val': '17:00 — Nuevo Paciente'},
                    {'id': 'phy-mie-st', 'prop': 'textContent', 'val': '✅ Reservada'},
                    {'id': 'phy-mie-st', 'prop': 'className', 'val': 'bp-slots conf'},
                    {'id': 'phy-mie', 'prop': 'addclass', 'val': 'bp-updated'}
                ],
                'move_physio': [
                    {'id': 'phy-vie-name', 'prop': 'textContent', 'val': '10:00 — Cancelada'},
                    {'id': 'phy-vie-st', 'prop': 'textContent', 'val': '❌ Cancelada'},
                    {'id': 'phy-vie-st', 'prop': 'className', 'val': 'bp-slots cancel'},
                    {'id': 'phy-jue-name', 'prop': 'textContent', 'val': '18:00 — Laura S.'},
                    {'id': 'phy-jue-st', 'prop': 'textContent', 'val': '✅ Confirmada'},
                    {'id': 'phy-jue-st', 'prop': 'className', 'val': 'bp-slots conf'},
                    {'id': 'phy-jue', 'prop': 'addclass', 'val': 'bp-updated'},
                    {'id': 'phy-vie', 'prop': 'addclass', 'val': 'bp-updated'}
                ]
            }
        },
        'Academia': {
            'emoji': '📚',
            'backend_title': 'Cursos y Matrículas',
            'buttons': [
                {
                    'id': 'btn-info',
                    'label': '📝 Información de cursos',
                    'userMsg': 'Me interesa saber qué cursos tenéis disponibles',
                    'botResponses': [
                        '¡Claro! Estos son nuestros cursos activos:',
                        '📚 <b>Inglés B2</b> — L/X 18:00 (6 plazas)<br>📚 <b>Francés A1</b> — M/J 17:00 (10 plazas)<br>📚 <b>Alemán B1</b> — L/X 19:30 (3 plazas)<br>📚 <b>Refuerzo ESO</b> — M/J 16:00 (8 plazas)<br><br>¿Te interesa alguno? 😊'
                    ],
                    'backendAction': None
                },
                {
                    'id': 'btn-matricula',
                    'label': '✍️ Matricularme en Inglés B2',
                    'userMsg': 'Quiero matricularme en el curso de Inglés B2',
                    'botResponses': [
                        'Perfecto, déjame comprobar plazas... 📋',
                        '✅ <b>¡Matrícula confirmada!</b><br><br>📚 Curso: Inglés B2<br>📅 Lunes y Miércoles 18:00-19:30<br>📍 Aula 3<br>💰 Primera clase de prueba gratis<br><br>¡Te esperamos el próximo lunes! 🎉'
                    ],
                    'backendAction': 'enroll_course'
                }
            ],
            'backend_html': '''
                <div class="bp-row bp-target" id="curso-b2"><span class="bp-time">L/X 18:00</span><span class="bp-name">Inglés B2</span><span class="bp-slots" id="curso-b2-st">6 plazas</span></div>
                <div class="bp-row" id="curso-fr"><span class="bp-time">M/J 17:00</span><span class="bp-name">Francés A1</span><span class="bp-slots">10 plazas</span></div>
                <div class="bp-row" id="curso-de"><span class="bp-time">L/X 19:30</span><span class="bp-name">Alemán B1</span><span class="bp-slots">3 plazas</span></div>
                <div class="bp-row" id="curso-eso"><span class="bp-time">M/J 16:00</span><span class="bp-name">Refuerzo ESO</span><span class="bp-slots">8 plazas</span></div>
            ''',
            'backend_actions': {
                'enroll_course': [
                    {'id': 'curso-b2-st', 'prop': 'textContent', 'val': '5 plazas'},
                    {'id': 'curso-b2', 'prop': 'addclass', 'val': 'bp-updated'}
                ]
            }
        },
        'Ópticas': {
            'emoji': '👓',
            'backend_title': 'Agenda de Revisiones',
            'buttons': [
                {
                    'id': 'btn-revision',
                    'label': '👁️ Pedir cita para revisión',
                    'userMsg': 'Quería pedir cita para una revisión de la vista',
                    'botResponses': [
                        'Déjame comprobar la agenda... 📋',
                        '✅ <b>Cita confirmada</b><br><br>📅 Viernes 11:00<br>👁️ Revisión visual completa<br>⏱️ Duración: 30 minutos<br><br>Trae tus gafas actuales si las tienes. ¡Te esperamos! 😊'
                    ],
                    'backendAction': 'book_optic'
                },
                {
                    'id': 'btn-gafas',
                    'label': '📦 ¿Están mis gafas listas?',
                    'userMsg': '¿Ya están listas mis gafas nuevas?',
                    'botResponses': [
                        'Déjame consultar tu pedido... 🔍',
                        '✅ <b>¡Sí, ya están listas!</b><br><br>📦 Pedido #456 — Gafas progresivas<br>🏪 Puedes recogerlas en horario de tienda<br>⏰ L-V: 10:00–20:00<br><br>¡Te quedan genial! 😎'
                    ],
                    'backendAction': 'glasses_ready'
                }
            ],
            'backend_html': '''
                <div class="bp-row" id="opt-0930"><span class="bp-time">09:30</span><span class="bp-name">Carmen L. — Graduación</span><span class="bp-slots conf">Confirmada</span></div>
                <div class="bp-row" id="opt-1030"><span class="bp-time">10:30</span><span class="bp-name">Manuel R. — Lentillas</span><span class="bp-slots conf">Confirmada</span></div>
                <div class="bp-row bp-target" id="opt-1100"><span class="bp-time">11:00</span><span class="bp-name" id="opt-1100-name">—</span><span class="bp-slots free" id="opt-1100-st">Disponible</span></div>
                <div class="bp-row" id="opt-1200"><span class="bp-time">12:00</span><span class="bp-name">—</span><span class="bp-slots free">Disponible</span></div>
                <div class="bp-sep">Pedidos</div>
                <div class="bp-car" id="pedido-456">
                    <div class="bp-car-head"><span>📦</span><span class="bp-car-name">Pedido #456 — Gafas progresivas</span></div>
                    <div class="bp-car-status"><span class="bp-dot wait"></span><span class="bp-stext" id="pedido-456-st">En fabricación</span></div>
                </div>
            ''',
            'backend_actions': {
                'book_optic': [
                    {'id': 'opt-1100-name', 'prop': 'textContent', 'val': 'Nuevo — Revisión visual'},
                    {'id': 'opt-1100-st', 'prop': 'textContent', 'val': '✅ Reservada'},
                    {'id': 'opt-1100-st', 'prop': 'className', 'val': 'bp-slots conf'},
                    {'id': 'opt-1100', 'prop': 'addclass', 'val': 'bp-updated'}
                ],
                'glasses_ready': [
                    {'id': 'pedido-456-st', 'prop': 'textContent', 'val': '✅ Lista para recogida'},
                    {'id': 'pedido-456-st', 'prop': 'className', 'val': 'bp-stext ready'},
                    {'id': 'pedido-456', 'prop': 'addclass', 'val': 'bp-updated'}
                ]
            }
        }
    }
    # Crossfit usa el mismo flujo que Gimnasio
    configs['Crossfit'] = dict(configs['Gimnasio'])
    configs['Crossfit']['emoji'] = '🏋️‍♂️'
    return configs.get(sector, configs['Gimnasio'])


# ── CSS ──────────────────────────────────────────────────────
CSS = r"""
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0F172A;color:#F8FAFC;line-height:1.6;overflow-x:hidden}
a{color:#8B7CF6;text-decoration:none;transition:color .2s}
a:hover{color:#A78BFA}

/* ─ Navbar ─ */
.navbar{position:fixed;top:0;left:0;right:0;z-index:100;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;background:rgba(15,23,42,.85);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06)}
.nav-logo{font-size:1.4rem;font-weight:800;background:linear-gradient(135deg,#6D5EF3,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-.02em}
.nav-links{display:flex;gap:1.5rem}
.nav-links a{color:#94A3B8;font-size:.875rem;font-weight:500;transition:color .2s}
.nav-links a:hover{color:#F8FAFC}

/* ─ Hero ─ */
.hero{min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8rem 2rem 4rem;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-40%;left:-20%;width:80vw;height:80vw;background:radial-gradient(circle,rgba(109,94,243,.12) 0%,transparent 70%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:-30%;right:-10%;width:60vw;height:60vw;background:radial-gradient(circle,rgba(139,124,246,.08) 0%,transparent 70%);pointer-events:none}
.badge{display:inline-flex;align-items:center;gap:.5rem;padding:.4rem 1rem;border-radius:100px;background:rgba(109,94,243,.15);color:#A78BFA;font-size:.8rem;font-weight:600;letter-spacing:.02em;margin-bottom:1.5rem;border:1px solid rgba(109,94,243,.2)}
.hero h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:800;line-height:1.15;max-width:800px;letter-spacing:-.03em;margin-bottom:1rem}
.hero h1 .hl{background:linear-gradient(135deg,#6D5EF3,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero .sub{color:#94A3B8;font-size:1.1rem;max-width:600px;margin:0 auto 2rem}
.rating-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1.2rem;border-radius:12px;background:rgba(255,255,255,.05);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.08);font-size:.95rem;color:#E2E8F0}
.rating-badge .stars{color:#FBBF24}

/* ─ Sections ─ */
.section{padding:5rem 2rem}
.section-light{background:#F8FAFC;color:#1E293B}
.sec-head{text-align:center;margin-bottom:3rem}
.sec-head h2{font-size:clamp(1.6rem,3.5vw,2.4rem);font-weight:700;letter-spacing:-.02em;margin-bottom:.75rem}
.sec-head h2.dark{color:#1E293B}
.sec-head p{color:#64748B;font-size:1.05rem;max-width:550px;margin:0 auto}
.sec-head p.light{color:#94A3B8}

/* ─ Simulator Container ─ */
.sim-wrap{display:grid;grid-template-columns:380px 1fr;gap:2rem;max-width:1100px;margin:0 auto;align-items:start}

/* ─ WhatsApp Phone ─ */
.wa-phone{border-radius:24px;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.08);background:#ECE5DD;max-width:380px;display:flex;flex-direction:column;height:580px}
.wa-hdr{background:linear-gradient(135deg,#075E54,#128C7E);padding:.75rem 1rem;display:flex;align-items:center;gap:.75rem}
.wa-back{color:white;font-size:1.2rem;background:none;border:none;cursor:default;padding:0;line-height:1}
.wa-av{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#6D5EF3,#A78BFA);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:.85rem;flex-shrink:0}
.wa-info{flex:1}
.wa-nm{color:white;font-weight:600;font-size:.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}
.wa-on{color:rgba(255,255,255,.75);font-size:.75rem}
.wa-msgs{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.5rem;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c8c8' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}
.wa-msg{max-width:85%;padding:.5rem .75rem;border-radius:8px;font-size:.9rem;line-height:1.4;position:relative;animation:msgIn .3s ease-out;word-wrap:break-word;color:#1E293B}
.wa-msg.recv{background:white;align-self:flex-start;border-top-left-radius:2px;box-shadow:0 1px 1px rgba(0,0,0,.08)}
.wa-msg.sent{background:#DCF8C6;align-self:flex-end;border-top-right-radius:2px;box-shadow:0 1px 1px rgba(0,0,0,.08)}
.wa-msg .wa-t{display:block;text-align:right;font-size:.65rem;color:#8696A0;margin-top:2px}
.wa-msg.sent .wa-t{color:#6B8A6E}
.wa-typing{background:white;align-self:flex-start;padding:.6rem .9rem;border-radius:8px;border-top-left-radius:2px;display:flex;gap:4px;animation:msgIn .3s ease-out}
.wa-typing span{width:7px;height:7px;background:#90959A;border-radius:50%;animation:typeDot 1.4s infinite}
.wa-typing span:nth-child(2){animation-delay:.2s}
.wa-typing span:nth-child(3){animation-delay:.4s}
.wa-btns{padding:.75rem;display:flex;flex-direction:column;gap:.5rem;background:#F0F0F0;border-top:1px solid #DDD}
.wa-btn{padding:.65rem 1rem;border-radius:10px;border:1.5px solid #6D5EF3;background:white;color:#6D5EF3;font-weight:600;font-size:.85rem;cursor:pointer;transition:all .2s;text-align:left}
.wa-btn:hover:not(:disabled){background:#6D5EF3;color:white;transform:translateY(-1px);box-shadow:0 4px 12px rgba(109,94,243,.3)}
.wa-btn:disabled{opacity:.45;cursor:not-allowed;border-color:#CBD5E1;color:#94A3B8}

/* ─ Backend Panel ─ */
.bp{border-radius:16px;background:rgba(255,255,255,.03);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);overflow:hidden}
.bp-hdr{padding:.75rem 1.25rem;display:flex;align-items:center;gap:.6rem;border-bottom:1px solid rgba(255,255,255,.06);font-weight:600;font-size:.9rem;background:rgba(255,255,255,.03)}
.bp-dot-live{width:8px;height:8px;border-radius:50%;background:#22C55E;box-shadow:0 0 6px rgba(34,197,94,.5);animation:pulse 2s infinite}
.bp-body{padding:1rem}
.bp-row{display:grid;grid-template-columns:70px 1fr auto;gap:.5rem;align-items:center;padding:.65rem .75rem;border-radius:8px;margin-bottom:.4rem;transition:all .4s ease;font-size:.85rem}
.bp-row:hover{background:rgba(255,255,255,.04)}
.bp-time{color:#A78BFA;font-weight:600;font-size:.8rem;font-variant-numeric:tabular-nums}
.bp-name{color:#E2E8F0;font-weight:500}
.bp-slots{padding:.2rem .6rem;border-radius:6px;font-size:.75rem;font-weight:600;text-align:center;min-width:70px}
.bp-slots:not(.conf):not(.free):not(.full):not(.cancel){background:rgba(100,116,139,.15);color:#94A3B8}
.bp-slots.conf{background:rgba(34,197,94,.12);color:#4ADE80}
.bp-slots.free{background:rgba(59,130,246,.12);color:#60A5FA}
.bp-slots.full{background:rgba(239,68,68,.15);color:#F87171;animation:popIn .4s ease}
.bp-slots.cancel{background:rgba(239,68,68,.1);color:#F87171}
.bp-updated{animation:rowGlow .8s ease}
.bp-target{border-left:2px solid rgba(109,94,243,.4)}

/* Taller specific */
.bp-car{padding:.75rem;border-radius:10px;background:rgba(255,255,255,.03);margin-bottom:.5rem;border:1px solid rgba(255,255,255,.05);transition:all .4s ease}
.bp-car-head{display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem;font-size:.95rem}
.bp-car-name{font-weight:600;color:#E2E8F0}
.bp-car-status{display:flex;align-items:center;gap:.5rem;padding-left:1.5rem}
.bp-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.bp-dot.diag{background:#FBBF24;box-shadow:0 0 6px rgba(251,191,36,.4)}
.bp-dot.repair{background:#3B82F6;box-shadow:0 0 6px rgba(59,130,246,.4)}
.bp-dot.wait{background:#94A3B8}
.bp-dot.ready{background:#22C55E;box-shadow:0 0 6px rgba(34,197,94,.5)}
.bp-stext{font-size:.85rem;color:#94A3B8;font-weight:500}
.bp-stext.ready{color:#4ADE80;font-weight:600}
.bp-budget{padding:.75rem;border-radius:10px;background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.15);margin-top:.75rem;transition:all .4s ease}
.bp-budget.hidden{display:none}
.bp-budget-title{font-weight:700;margin-bottom:.5rem;font-size:.9rem;color:#E2E8F0}
.bp-budget-row{display:flex;justify-content:space-between;padding:.25rem 0;font-size:.85rem;color:#94A3B8;border-bottom:1px solid rgba(255,255,255,.04)}
.bp-budget-total{display:flex;justify-content:space-between;padding:.5rem 0 0;font-weight:700;font-size:.95rem;color:#4ADE80}
.bp-check{font-size:.85rem}
.bp-sep{text-align:center;padding:.75rem 0 .4rem;font-size:.75rem;color:#64748B;text-transform:uppercase;letter-spacing:.06em;font-weight:600}

/* ─ Calculator ─ */
.calc-wrap{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}
.sliders{display:flex;flex-direction:column;gap:2rem}
.slider-group label{display:block;font-weight:600;font-size:.9rem;color:#334155;margin-bottom:.75rem}
.slider-row{display:flex;align-items:center;gap:1rem}
.slider-row input[type=range]{flex:1;-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;outline:none;background:linear-gradient(to right,#6D5EF3 var(--p,50%),#E2E8F0 var(--p,50%))}
.slider-row input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;background:white;border:3px solid #6D5EF3;border-radius:50%;cursor:pointer;box-shadow:0 2px 8px rgba(109,94,243,.3);transition:transform .2s,box-shadow .2s}
.slider-row input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.15);box-shadow:0 2px 14px rgba(109,94,243,.5)}
.slider-row input[type=range]::-moz-range-thumb{width:22px;height:22px;background:white;border:3px solid #6D5EF3;border-radius:50%;cursor:pointer}
.slider-row input[type=range]::-moz-range-track{height:6px;background:#E2E8F0;border-radius:3px}
.sv{min-width:60px;text-align:center;padding:.3rem .6rem;border-radius:8px;background:white;font-weight:700;font-size:.9rem;color:#6D5EF3;border:1px solid #E2E8F0;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.results{display:flex;flex-direction:column;gap:1.25rem}
.r-card{padding:1.5rem;border-radius:16px;background:white;border:1px solid #E2E8F0;box-shadow:0 4px 16px rgba(0,0,0,.04);display:flex;align-items:center;gap:1.25rem;transition:transform .2s,box-shadow .2s}
.r-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}
.r-icon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0}
.r-icon.time{background:linear-gradient(135deg,rgba(109,94,243,.12),rgba(167,139,250,.12))}
.r-icon.money{background:linear-gradient(135deg,rgba(34,197,94,.12),rgba(74,222,128,.12))}
.r-icon.cancel{background:linear-gradient(135deg,rgba(251,191,36,.12),rgba(253,224,71,.12))}
.r-val{font-size:2rem;font-weight:800;color:#0F172A;letter-spacing:-.02em;transition:transform .3s;line-height:1}
.r-val.pop{animation:valPop .4s ease}
.r-label{font-size:.8rem;color:#64748B;font-weight:500;margin-top:.15rem}

/* ─ Proposal ─ */
.proposal{text-align:center;max-width:700px;margin:0 auto}
.p-card{padding:3rem;border-radius:24px;background:rgba(255,255,255,.04);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.08);box-shadow:0 20px 50px rgba(0,0,0,.2)}
.p-card h2{font-size:clamp(1.4rem,3vw,2rem);font-weight:700;margin-bottom:2rem;letter-spacing:-.02em}
.p-card h2 .hl{background:linear-gradient(135deg,#6D5EF3,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.p-feats{text-align:left;max-width:440px;margin:0 auto 2rem;display:flex;flex-direction:column;gap:.75rem}
.p-feat{font-size:1rem;padding:.6rem 1rem;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.05)}
.p-feat.free{background:rgba(109,94,243,.1);border-color:rgba(109,94,243,.2);color:#A78BFA;font-weight:600}
.cta{display:inline-flex;align-items:center;gap:.75rem;padding:1rem 2.5rem;border-radius:14px;background:linear-gradient(135deg,#6D5EF3,#7C3AED);color:white;font-weight:700;font-size:1.1rem;border:none;cursor:pointer;transition:all .3s;box-shadow:0 4px 20px rgba(109,94,243,.35);text-decoration:none}
.cta:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(109,94,243,.5);color:white}
.cta:active{transform:translateY(0)}
.cta-icon{font-size:1.3rem}

/* ─ Footer ─ */
.footer{text-align:center;padding:3rem 2rem;border-top:1px solid rgba(255,255,255,.06)}
.footer-logo{font-size:1.2rem;font-weight:800;background:linear-gradient(135deg,#6D5EF3,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.5rem}
.footer p{color:#64748B;font-size:.85rem}

/* ─ Animations ─ */
@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes typeDot{0%,60%,100%{transform:translateY(0);opacity:.6}30%{transform:translateY(-4px);opacity:1}}
@keyframes rowGlow{0%{background:rgba(109,94,243,0)}30%{background:rgba(109,94,243,.15)}100%{background:rgba(109,94,243,.04)}}
@keyframes popIn{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes valPop{0%{transform:scale(1)}50%{transform:scale(1.12);color:#6D5EF3}100%{transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
.fade-up{opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .6s ease}
.fade-up.visible{opacity:1;transform:translateY(0)}

/* ─ Responsive ─ */
@media(max-width:900px){
 .sim-wrap{grid-template-columns:1fr;justify-items:center}
 .wa-phone{max-width:100%;width:100%}
 .calc-wrap{grid-template-columns:1fr;gap:2rem}
 .nav-links{display:none}
}
@media(max-width:600px){
 .hero{padding:6rem 1.25rem 3rem}
 .section{padding:3rem 1.25rem}
 .p-card{padding:2rem 1.5rem}
 .wa-phone{height:500px}
 .r-card{padding:1rem;gap:1rem}
 .r-val{font-size:1.6rem}
}
"""


# ── JavaScript ───────────────────────────────────────────────
JS_TEMPLATE = r"""
(function(){
'use strict';

/* ── Chat Flow Data ── */
const FLOW = __FLOW_JSON__;
const ACTIONS = __ACTIONS_JSON__;
const NOMBRE = '__NOMBRE_CORTO__';

/* ── State ── */
let busy = false;

/* ── DOM ── */
const chat = document.getElementById('wa-msgs');
const btnsWrap = document.getElementById('wa-btns');

/* ── Init ── */
function init() {
  renderButtons();
  addMsg('¡Hola! 👋 Soy el asistente de <b>' + NOMBRE + '</b>. ¿En qué puedo ayudarte?', 'recv');
  observeFadeUps();
  initCalc();
}

/* ── Buttons ── */
function renderButtons() {
  btnsWrap.innerHTML = FLOW.map(function(b, i) {
    return '<button class="wa-btn" data-i="' + i + '">' + b.label + '</button>';
  }).join('');
  btnsWrap.querySelectorAll('.wa-btn').forEach(function(el) {
    el.addEventListener('click', function() { handleBtn(+el.dataset.i); });
  });
}

/* ── Handle Button Click ── */
async function handleBtn(i) {
  if (busy) return;
  busy = true;
  const b = FLOW[i];
  const btn = btnsWrap.querySelector('[data-i="' + i + '"]');
  if (btn) { btn.disabled = true; btn.classList.add('used'); }

  addMsg(b.userMsg, 'sent');
  await wait(700);
  showTyping();

  for (let r = 0; r < b.botResponses.length; r++) {
    await wait(1200);
    hideTyping();
    addMsg(b.botResponses[r], 'recv');
    if (r < b.botResponses.length - 1) { await wait(400); showTyping(); }
  }

  if (b.backendAction) execAction(b.backendAction);
  busy = false;
}

/* ── Messages ── */
function addMsg(html, type) {
  var d = document.createElement('div');
  d.className = 'wa-msg ' + type;
  var now = new Date();
  var t = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  var tick = type === 'sent' ? ' ✓✓' : '';
  d.innerHTML = '<p>' + html + '</p><span class="wa-t">' + t + tick + '</span>';
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

function showTyping() {
  var d = document.createElement('div');
  d.className = 'wa-typing'; d.id = 'typing-ind';
  d.innerHTML = '<span></span><span></span><span></span>';
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
function hideTyping() {
  var el = document.getElementById('typing-ind');
  if (el) el.remove();
}
function wait(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

/* ── Backend Actions ── */
function execAction(actionId) {
  var list = ACTIONS[actionId];
  if (!list) return;
  list.forEach(function(a) {
    var el = document.getElementById(a.id);
    if (!el) return;
    if (a.prop === 'addclass') { el.classList.add(a.val); }
    else if (a.prop === 'removeclass') { el.classList.remove(a.val); }
    else { el[a.prop] = a.val; }
  });
}

/* ── Calculator ── */
function initCalc() {
  var s1 = document.getElementById('sl1');
  var s2 = document.getElementById('sl2');
  var s3 = document.getElementById('sl3');
  if (!s1) return;

  function calc() {
    var m = +s1.value, mins = +s2.value, rate = +s3.value;
    document.getElementById('sv1').textContent = m;
    document.getElementById('sv2').textContent = mins + ' min';
    document.getElementById('sv3').textContent = rate + '€';
    updSlider(s1); updSlider(s2); updSlider(s3);

    var hours = (m * mins * 22) / 60;
    var money = hours * rate;
    var cancels = Math.round(m * 0.15 * 264);

    animVal('rv-hours', hours.toFixed(1) + 'h');
    animVal('rv-money', Math.round(money).toLocaleString('es-ES') + '€');
    animVal('rv-cancels', cancels.toLocaleString('es-ES'));
  }

  function updSlider(sl) {
    var pct = ((+sl.value - +sl.min) / (+sl.max - +sl.min)) * 100;
    sl.style.setProperty('--p', pct + '%');
  }

  function animVal(id, val) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = val;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  }

  [s1, s2, s3].forEach(function(s) {
    s.addEventListener('input', calc);
    updSlider(s);
  });
  calc();
}

/* ── Scroll Animations ── */
function observeFadeUps() {
  var els = document.querySelectorAll('.fade-up');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function(e) { e.classList.add('visible'); });
    return;
  }
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  els.forEach(function(e) { obs.observe(e); });
}

/* ── Boot ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else { init(); }

})();
"""


# ── Compilar HTML ────────────────────────────────────────────
def compilar_html(lead, config):
    nc = esc(nombre_corto(lead['nombre_empresa']))
    ini = esc(iniciales(lead['nombre_empresa']))
    ne = esc(lead['nombre_empresa'])
    sector = esc(lead.get('sector', ''))
    ciudad = esc(lead.get('ciudad', 'Valladolid'))
    rating = lead.get('rating', '')
    resenas = lead.get('num_resenas', '')
    oportunidad = esc(lead.get('oportunidad_automatizacion', ''))
    emoji = config['emoji']
    web = lead.get('web', '')

    # Rating HTML
    if rating and resenas:
        rating_html = f'''<div class="rating-badge"><span class="stars">{'⭐' * min(int(float(rating)), 5)}</span> {esc(str(rating))} — {esc(str(resenas))} reseñas en Google</div>'''
    else:
        rating_html = ''

    # WhatsApp CTA
    wa_msg = f"Hola Javier, he visto la demo interactiva de {nombre_corto(lead['nombre_empresa'])} y me interesa que hablemos sobre el piloto de 15 días. ¿Cuándo podemos hablar?"
    wa_url = f"https://wa.me/{WA_NUMBER}?text={wa_msg.replace(' ', '%20').replace('á', '%C3%A1').replace('é', '%C3%A9').replace('í', '%C3%AD').replace('ó', '%C3%B3').replace('ú', '%C3%BA').replace('ñ', '%C3%B1').replace('¿', '%C2%BF')}"

    # Chat flow JSON
    flow_json = json.dumps(config['buttons'], ensure_ascii=False)
    actions_json = json.dumps(config['backend_actions'], ensure_ascii=False)

    # Build JS
    js = JS_TEMPLATE.replace('__FLOW_JSON__', flow_json)
    js = js.replace('__ACTIONS_JSON__', actions_json)
    js = js.replace('__NOMBRE_CORTO__', nc.replace("'", "\\'"))

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Demo EsarIA — {ne}</title>
<meta name="description" content="Descubre cómo EsarIA puede automatizar {nc} en {ciudad}. Demo interactiva personalizada.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
{CSS}
</style>
</head>
<body>

<!-- Navbar -->
<nav class="navbar">
  <div class="nav-logo">EsarIA</div>
  <div class="nav-links">
    <a href="#simulador">Demo</a>
    <a href="#calculadora">Ahorro</a>
    <a href="#propuesta">Propuesta</a>
  </div>
</nav>

<!-- Hero -->
<section class="hero" id="hero">
  <div class="badge">{emoji} {esc(sector)} · {ciudad}</div>
  <h1>Mira lo que EsarIA puede hacer por <span class="hl">{nc}</span></h1>
  <p class="sub">{oportunidad}</p>
  {rating_html}
</section>

<!-- Sección A: Simulador -->
<section class="section" id="simulador">
  <div class="sec-head fade-up">
    <h2>Prueba el Asistente en Tiempo Real</h2>
    <p class="light">Haz clic en los botones del chat y observa cómo se actualiza todo al instante</p>
  </div>
  <div class="sim-wrap fade-up">
    <!-- WhatsApp -->
    <div class="wa-phone">
      <div class="wa-hdr">
        <span class="wa-back">←</span>
        <div class="wa-av">{ini}</div>
        <div class="wa-info">
          <div class="wa-nm">{nc}</div>
          <div class="wa-on">en línea</div>
        </div>
      </div>
      <div class="wa-msgs" id="wa-msgs"></div>
      <div class="wa-btns" id="wa-btns"></div>
    </div>
    <!-- Backend Panel -->
    <div class="bp">
      <div class="bp-hdr">
        <span class="bp-dot-live"></span>
        {esc(config['backend_title'])}
      </div>
      <div class="bp-body" id="bp-body">
        {config['backend_html']}
      </div>
    </div>
  </div>
</section>

<!-- Sección B: Calculadora ROI -->
<section class="section section-light" id="calculadora">
  <div class="sec-head fade-up">
    <h2 class="dark">¿Cuánto tiempo y dinero puedes ahorrar?</h2>
    <p>Mueve los deslizadores y calcula tu ahorro real con EsarIA</p>
  </div>
  <div class="calc-wrap fade-up">
    <div class="sliders">
      <div class="slider-group">
        <label>Mensajes/llamadas manuales al día</label>
        <div class="slider-row">
          <input type="range" id="sl1" min="5" max="100" value="20">
          <div class="sv" id="sv1">20</div>
        </div>
      </div>
      <div class="slider-group">
        <label>Minutos por cada gestión</label>
        <div class="slider-row">
          <input type="range" id="sl2" min="2" max="15" value="5">
          <div class="sv" id="sv2">5 min</div>
        </div>
      </div>
      <div class="slider-group">
        <label>Tu hora laboral (€)</label>
        <div class="slider-row">
          <input type="range" id="sl3" min="10" max="50" value="20">
          <div class="sv" id="sv3">20€</div>
        </div>
      </div>
    </div>
    <div class="results">
      <div class="r-card">
        <div class="r-icon time">⏱️</div>
        <div>
          <div class="r-val" id="rv-hours">36.7h</div>
          <div class="r-label">Horas ahorradas al mes</div>
        </div>
      </div>
      <div class="r-card">
        <div class="r-icon money">💰</div>
        <div>
          <div class="r-val" id="rv-money">733€</div>
          <div class="r-label">Dinero ahorrado al mes</div>
        </div>
      </div>
      <div class="r-card">
        <div class="r-icon cancel">📅</div>
        <div>
          <div class="r-val" id="rv-cancels">792</div>
          <div class="r-label">Cancelaciones evitadas al año</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Sección C: Propuesta Piloto -->
<section class="section" id="propuesta">
  <div class="proposal fade-up">
    <div class="p-card">
      <h2><span class="hl">{nc}</span>, esto es lo que podemos hacer juntos</h2>
      <div class="p-feats">
        <div class="p-feat">✅ Configuración inicial del asistente WhatsApp</div>
        <div class="p-feat">✅ Integración con tu agenda y sistema actual</div>
        <div class="p-feat">✅ 15 días de prueba real con tus clientes</div>
        <div class="p-feat">✅ Informe de resultados al final del piloto</div>
        <div class="p-feat free">💰 100% gratuito · Sin compromiso · Sin permanencia</div>
      </div>
      <a href="{wa_url}" class="cta" target="_blank" rel="noopener">
        <span class="cta-icon">💬</span>
        Me interesa probar la Demo
      </a>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="footer-logo">EsarIA</div>
  <p>Automatización útil para negocios locales — Valladolid</p>
  <p><a href="https://esaria.es" target="_blank">esaria.es</a></p>
</footer>

<script>
{js}
</script>
</body>
</html>"""
    return html


# ── Main ─────────────────────────────────────────────────────
def generar_para_lead(lead):
    sector = lead.get('sector', 'Gimnasio')
    config = get_sector_config(sector)
    slug = slugify(lead['nombre_empresa'])
    out_dir = OUTPUT_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / 'index.html'
    html = compilar_html(lead, config)
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"  ✅ {lead['nombre_empresa']}")
    print(f"     → {out_file.relative_to(PROJECT_ROOT)}")
    return out_file


def main():
    args = sys.argv[1:]
    if not args:
        print("Uso:")
        print('  python generar-landing-leads.py "Nombre Empresa"')
        print('  python generar-landing-leads.py --all')
        print('  python generar-landing-leads.py --sector "Gimnasio"')
        print('  python generar-landing-leads.py --list')
        sys.exit(1)

    leads = cargar_leads()
    print(f"📂 {len(leads)} leads cargados\n")

    if args[0] == '--list':
        sectores = {}
        for l in leads:
            s = l.get('sector', '?')
            sectores.setdefault(s, []).append(l['nombre_empresa'])
        for s, nombres in sorted(sectores.items()):
            print(f"\n{'─' * 40}")
            print(f"  {s} ({len(nombres)} leads)")
            print(f"{'─' * 40}")
            for n in nombres:
                print(f"  • {n}")
        sys.exit(0)

    if args[0] == '--all':
        seen = set()
        count = 0
        for lead in leads:
            key = lead['nombre_empresa']
            if key in seen:
                continue
            seen.add(key)
            generar_para_lead(lead)
            count += 1
        print(f"\n🎉 {count} landing pages generadas en {OUTPUT_DIR.relative_to(PROJECT_ROOT)}/")
        sys.exit(0)

    if args[0] == '--sector' and len(args) > 1:
        sector = args[1]
        count = 0
        seen = set()
        for lead in leads:
            if lead.get('sector', '').lower() == sector.lower():
                key = lead['nombre_empresa']
                if key in seen:
                    continue
                seen.add(key)
                generar_para_lead(lead)
                count += 1
        if count == 0:
            print(f"❌ No se encontraron leads del sector '{sector}'")
            sys.exit(1)
        print(f"\n🎉 {count} landing pages generadas para sector '{sector}'")
        sys.exit(0)

    # Buscar por nombre
    query = ' '.join(args)
    lead = buscar_lead(leads, query)
    if not lead:
        print(f"❌ No se encontró ningún lead con '{query}'")
        print("   Usa --list para ver todos los leads disponibles")
        sys.exit(1)

    generar_para_lead(lead)
    print(f"\n🎉 Landing page generada correctamente")


if __name__ == '__main__':
    main()
