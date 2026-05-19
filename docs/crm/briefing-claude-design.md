# Briefing para Claude (claude.ai) — Rediseño CRM EsarIA

Este documento es lo que vas a pegar/adjuntar en una conversación con **claude.ai** (Claude Design, con Artifacts). El objetivo es que te devuelva un **mockup moderno** (HTML+CSS+JS estático con datos demo) que luego Claude Code convertirá en funcional sobre la base existente.

---

## 1. Cómo usarlo

1. Abre claude.ai en navegador → conversación nueva.
2. Adjunta como archivos:
   - `prospecting/app/index.html`
   - `prospecting/app/style.css`
   - `prospecting/app/app.js`
   - `assets/brand/logo/esaria-logo-horizontal.svg`
   - `assets/brand/logo/esaria-logo-horizontal-dark.svg`
   - `assets/brand/README.md` (paleta y guía)
3. Pega el **PROMPT** (sección 6) tal cual.
4. Itera con Claude hasta que el mockup te guste. Pídele que entregue **un único Artifact HTML** que se vea bien tal cual.
5. Cuando termines, guarda el HTML resultante en:
   `docs/crm/mockup-claude-design.html`
6. Pásamelo a mí (Claude Code) y lo convierto en funcional sobre el CRM real.

---

## 2. Contexto de marca EsarIA

**Quiénes somos:** EsarIA — marca local de automatización e IA práctica para pequeñas empresas de Valladolid.

**Tono visual:** profesional, claro, minimalista, sobrio, B2B limpio. No vender humo, no consultora gigante.

**Evitar:** estética cyberpunk, robots, cerebros, bombillas, engranajes, circuitos exagerados, gradientes neón, glassmorphism agresivo.

**Sí buscar:** UI tipo Linear, Notion, Pipedrive, Attio, Folk, Vercel dashboard. Densidad informativa cuidada, microinteracciones discretas, jerarquía visual fuerte, mucho espacio en blanco controlado.

### Paleta oficial

| Uso | Hex |
|---|---|
| Dark (texto, header) | `#0F172A` |
| Texto principal | `#1E293B` |
| Subtle / secundario | `#64748B` |
| Border | `#E2E8F0` |
| Background | `#F8FAFC` |
| White | `#FFFFFF` |
| Accent (acción principal) | `#6366F1` (indigo-500) |
| Accent hover | `#4F46E5` |

### Estados semánticos

- Éxito / reunión: verde `#16A34A` sobre `#F0FDF4`
- Aviso / llamado: ámbar `#D97706` sobre `#FFFBEB`
- Error / alta prioridad: rojo `#DC2626` sobre `#FEF2F2`
- Info / nuevo: azul `#2563EB` sobre `#EFF6FF`
- Neutral / descartado: gris `#64748B` sobre `#F1F5F9`

### Tipografía

System UI stack (San Francisco / Segoe UI). Si quieres meter una webfont, usa **Inter** (Google Fonts). Pesos: 400, 500, 600, 700.

---

## 3. Qué hace el CRM (funcionalidad que YA tiene)

App vanilla HTML/CSS/JS (sin framework, sin build). Datos persistidos en localStorage. Maneja leads de prospección para llamadas en frío de EsarIA.

**Vistas existentes:**
- Tarjetas (grid)
- Tabla compacta
- Kanban por estado (drag & drop)

**Filtros:** búsqueda libre con operadores (`sector:dental estado:Nuevo`), select de sector / prioridad / estado / tag, ordenamiento múltiple, persistencia en localStorage.

**Acciones por lead:**
- Ver detalle en modal
- Editar (formulario inline en el modal)
- Eliminar
- Registrar llamada con resultado (Contactado, No contesta, Volver a llamar, etc.) + notas + fecha → genera historial
- Copiar teléfono / email / guion de llamada / mensaje WhatsApp
- Abrir WhatsApp prerellenado
- Tags personalizables

**Acciones globales:**
- + Nuevo lead
- Selección múltiple → cambiar estado / prioridad en lote, añadir tag, eliminar en lote
- Importar / Exportar JSON
- Exportar CSV
- Importar leads reales desde fichero del usuario
- Resetear app

**Estadísticas en header:** Total / Alta prioridad / Reunión agendada / Llamados hoy.

---

## 4. Modelo de datos (campo a campo)

Cada lead es un objeto con estos campos. El mockup DEBE respetarlos para que la conversión a funcional sea directa:

```js
{
  _uid: "lead-xxx",
  id: "ID externo opcional",
  nombre_empresa: "Clinica Dental Sonrisa",
  sector: "Clinica dental",
  ciudad: "Valladolid",
  direccion: "Calle Mayor, 10, 47001 Valladolid",
  telefono: "+34 600 000 000",
  email: "contacto@empresa.com",
  web: "https://...",
  instagram: "@empresa",
  linkedin: "https://linkedin.com/...",

  decisor_nombre: "Ana Garcia",
  decisor_cargo: "Directora / Propietaria",
  confianza_decisor: "Alta",       // Alta | Media | Baja
  fuente_decisor: "Google Maps + LinkedIn",
  evidencia_decisor: "Texto libre",
  candidatos_decisor: [{ nombre, cargo, confianza, fuente, evidencia }],

  fuente_datos: "Origen del lead",
  problema_visible: "Texto libre",
  oportunidad_automatizacion: "Texto libre",
  prioridad: "Alta",               // Alta | Media | Baja
  facilidad_contacto: "Alta",      // Alta | Media | Baja
  tipo_reunion_recomendada: "Presencial | Videollamada | Telefonica",

  mensaje_llamada_personalizado: "Guion para llamar",
  mensaje_whatsapp_personalizado: "Mensaje WhatsApp",
  guion_recepcion_personalizado: "Si la recepcion contesta (opcional)",

  estado: "Nuevo",                 // Nuevo | Investigado | Llamado | Reunion agendada | Descartado
  notas: "Notas internas multilinea",
  tags: ["vip", "valladolid", "dental"],

  historial: [
    { fecha: "2026-05-14T10:30", resultado: "No contesta", notas: "..." }
  ]
}
```

**Estados:** `Nuevo → Investigado → Llamado → Reunion agendada` (camino feliz) / `Descartado`.
**Resultados de llamada:** Contactado · No contesta · Ocupado · Volver a llamar · Reunion agendada · No interesado.

---

## 5. Lo que NO queremos del mockup

- Frameworks (React, Vue, etc.). **Vanilla puro**.
- Tailwind por CDN está OK si te ayuda a iterar rápido, pero el resultado final lo convertiré a CSS plano.
- Dependencias externas pesadas. Iconos: usa Lucide o SVG inline. Nada de Font Awesome.
- Falsos datos exagerados (gráficos de revenue de millones, "AI Insights" inventados). EsarIA aún no tiene clientes reales; sé honesto en los placeholders.
- Modo oscuro NO es prioridad — primero light mode impecable.
- Animaciones excesivas.
- Ilustraciones tipo "undraw" / personajes 3D / robots.

---

## 6. PROMPT PARA CLAUDE.AI

Copia esto literal en claude.ai después de adjuntar los archivos:

```
Hola Claude. Quiero que rediseñes la interfaz de mi CRM. Te paso los archivos actuales (index.html, style.css, app.js) y el logo de mi marca EsarIA.

CONTEXTO:
EsarIA es una marca local de automatización e IA práctica para pequeñas empresas de Valladolid. Tono: profesional, sobrio, B2B limpio. Nada de cyberpunk, robots, gradientes neón o glassmorphism agresivo. Referencias visuales: Linear, Attio, Folk, Pipedrive moderno, Notion, Vercel dashboard.

PALETA OFICIAL (respétala):
- Dark #0F172A · Texto #1E293B · Subtle #64748B · Border #E2E8F0 · Background #F8FAFC · White #FFFFFF
- Accent #6366F1 (indigo) · Accent hover #4F46E5
- Estados: rojo #DC2626/#FEF2F2 (alta), ámbar #D97706/#FFFBEB (llamado), verde #16A34A/#F0FDF4 (reunión), azul #2563EB/#EFF6FF (nuevo), gris #64748B/#F1F5F9 (descartado).

TIPOGRAFÍA: Inter (Google Fonts) o system UI.

QUÉ NECESITO:

Un Artifact HTML único, autocontenido, con CSS embebido en <style>. JavaScript solo el mínimo para mostrar diferentes estados de UI (cambiar vistas, abrir modal, etc.) — no hace falta lógica real, eso lo añado yo después.

DEBE INCLUIR (todas estas pantallas/estados visibles, no me sirve solo una):

1. Header: logo EsarIA + estadísticas (Total, Alta prioridad, Reuniones, Llamados hoy).
2. Barra de filtros: búsqueda con placeholder explicando operadores (sector:, estado:, prioridad:, tag:), selects de sector/prioridad/estado/tag/orden, toggle entre vistas (Tarjetas / Tabla / Kanban), botones de acción (+ Nuevo lead, Importar, Exportar JSON, Exportar CSV).
3. Vista Tarjetas (default): grid de leads. Cada tarjeta muestra nombre empresa, badges (sector + prioridad + estado + tags), ciudad, decisor, problema visible (2 líneas), indicador "última llamada hace X", botones de acción (Ver, Registrar llamada, Copiar tel, WhatsApp, Web).
4. Vista Tabla: filas densas con checkbox, empresa, sector, ciudad, decisor, prioridad, estado, teléfono, última llamada, acciones.
5. Vista Kanban: 5 columnas (Nuevo, Investigado, Llamado, Reunion agendada, Descartado) con cards arrastrables visualmente (no hace falta drag funcional).
6. Bulk action bar (visible cuando hay leads seleccionados): "N seleccionados", cambiar estado, cambiar prioridad, añadir tag, eliminar.
7. Modal de detalle de lead con todas las secciones: Empresa (datos contacto + decisor), Análisis (problema + oportunidad), Tags editables (chips con × para quitar e input para añadir), Guion de llamada, Mensaje WhatsApp, Historial de llamadas (lista de entradas con fecha + resultado + notas + botón eliminar), Estado y notas. Botones Editar y Eliminar en toolbar superior del modal.
8. Modal en modo edición: mismos campos pero todos como inputs/textareas/selects, con botones Cancelar y Guardar.
9. Modal "Registrar llamada": fecha, resultado (select), notas, botón Añadir.
10. Toast de confirmación.
11. Empty state cuando no hay resultados.

MODELO DE DATOS de cada lead (úsalo tal cual en tus datos demo):
- _uid, nombre_empresa, sector, ciudad, direccion, telefono, email, web, instagram, linkedin
- decisor_nombre, decisor_cargo, confianza_decisor, fuente_decisor
- fuente_datos, problema_visible, oportunidad_automatizacion
- prioridad (Alta/Media/Baja), facilidad_contacto, tipo_reunion_recomendada
- mensaje_llamada_personalizado, mensaje_whatsapp_personalizado, guion_recepcion_personalizado
- estado (Nuevo/Investigado/Llamado/Reunion agendada/Descartado), notas, tags[], historial[]

USA 8-12 leads demo de pymes de Valladolid (clínica dental, fisio, taller mecánico, gimnasio, academia, hostelería, peluquería, asesoría, óptica). Datos plausibles pero claramente ficticios — no inventes métricas, clientes existentes ni cifras de facturación.

RESTRICCIONES:
- Vanilla HTML/CSS/JS. NO React, NO Vue.
- Iconos: SVG inline o Lucide. NO Font Awesome.
- Sin librerías de gráficos. Sin imágenes externas (excepto el logo).
- Sin modo oscuro de momento.
- El HTML resultante tiene que verse igual abierto con file:// (sin servidor).
- Densidad informativa al estilo Linear/Attio. Cada lead se debe ver de un vistazo.

ESTILO:
- Bordes 8-10px, sombras suaves (no dramáticas).
- Badges tipo pill con fondo pastel del color semántico.
- Hover sutil en cards (sombra ligeramente mayor + borde).
- Inputs con focus ring indigo.
- Header sticky. Filters sticky bajo el header.

Por favor entrégame TODO en un único Artifact "HTML". Después iteraremos sobre detalles. Empieza ya.
```

---

## 7. Tras recibir el mockup

Cuando Claude.ai te dé el HTML:

1. Guárdalo en `docs/crm/mockup-claude-design.html` (o pásamelo pegado).
2. Dime: "convierte este mockup en funcional, conservando los datos y la lógica del CRM actual".
3. Yo me encargaré de:
   - Migrar los estilos al `style.css` real.
   - Mantener TODA la lógica funcional (localStorage, filtros con operadores, historial, kanban drag&drop, bulk, etc.).
   - Mantener compatibilidad con leads ya guardados.
   - Conservar backup del estado actual antes de tocar nada.

---

## 8. Plan B si claude.ai no acepta adjuntar archivos

Si no puedes adjuntar, pega el contenido de los 3 ficheros (`index.html`, `style.css`, `app.js`) dentro de tres bloques de código en el chat, antes del prompt, con encabezados:

```
=== ARCHIVO: index.html (actual) ===
<...contenido...>

=== ARCHIVO: style.css (actual) ===
<...contenido...>

=== ARCHIVO: app.js (actual, resumen — campos del lead arriba) ===
<...contenido o solo el modelo de datos...>
```

Y describe el logo en texto: "Logo: 'EsarIA' en texto + un símbolo de chip/circuito minimalista en color indigo #6366F1".
