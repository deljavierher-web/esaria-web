# CRM EsarIA — Contexto completo para rediseño

> Este documento contiene **todo lo que Claude necesita saber** para rediseñar mi CRM. Está pensado para subirse a un Project de Claude.ai junto a los 3 archivos fuente (`index.html`, `style.css`, `app.js`) y el logo SVG.

---

## 1. Marca EsarIA

**Qué es:** marca local de automatización e IA práctica para pequeñas empresas de Valladolid (España).

**Tono visual:** profesional, sobrio, B2B limpio, minimalista. No vender humo, no consultora gigante, no cyberpunk, no robots, no cerebros, no glassmorphism agresivo, no gradientes neón.

**Referencias visuales válidas:** Linear, Attio, Folk, Pipedrive moderno, Notion, Vercel dashboard, Stripe Dashboard.

### Paleta oficial (respétala estrictamente)

| Uso | Hex |
|---|---|
| Dark (texto fuerte / header) | `#0F172A` |
| Texto principal | `#1E293B` |
| Subtle / secundario | `#64748B` |
| Border | `#E2E8F0` |
| Background | `#F8FAFC` |
| White | `#FFFFFF` |
| Accent (acción principal) | `#6366F1` (indigo-500) |
| Accent hover | `#4F46E5` |

### Estados semánticos (badges pill con fondo pastel)

| Concepto | Color | Fondo |
|---|---|---|
| Alta prioridad / error | `#DC2626` | `#FEF2F2` |
| Llamado / aviso | `#D97706` | `#FFFBEB` |
| Reunión / éxito | `#16A34A` | `#F0FDF4` |
| Nuevo / info | `#2563EB` | `#EFF6FF` |
| Investigado | `#7C3AED` | `#F5F3FF` |
| Descartado / neutral | `#64748B` | `#F1F5F9` |
| Sector | `#1D4ED8` | `#EFF6FF` |
| Tag custom | `#059669` | `#ECFDF5` |

### Tipografía

Inter (Google Fonts) o system UI stack. Pesos 400, 500, 600, 700.

---

## 2. Qué hace el CRM (funcionalidad actual)

App vanilla HTML/CSS/JS sin frameworks, sin build. Funciona abriendo el `index.html` directamente (file://). Datos en localStorage. Gestiona leads de prospección para llamadas en frío.

### Vistas
- **Tarjetas** (default): grid responsive.
- **Tabla** compacta.
- **Kanban** por estado con drag & drop entre columnas.

### Filtros y búsqueda
- Búsqueda libre + **operadores**: `sector:dental estado:Nuevo prioridad:Alta tag:vip ciudad:Valladolid decisor:ana`.
- Selects: sector / prioridad / estado / tag / orden.
- Ordenamiento: recomendado (prioridad+estado), prioridad, estado, nombre, sector, última llamada.
- Persistencia de filtros y vista en localStorage.

### Acciones por lead
- Ver detalle en modal.
- Editar (formulario inline en el modal con todos los campos).
- Eliminar (con confirmación).
- **Registrar llamada** con fecha + resultado + notas → guarda en historial y auto-actualiza estado.
- Copiar teléfono / email / guion / mensaje WhatsApp.
- Abrir WhatsApp prerellenado.
- **Tags personalizables** (chips editables: añadir/quitar con ×).

### Acciones globales
- Botón **+ Nuevo lead**.
- **Selección múltiple** con bulk bar flotante: cambiar estado, cambiar prioridad, añadir tag, eliminar.
- Importar / Exportar JSON.
- Exportar CSV (compatible Excel, con BOM).
- Resetear app (vuelve a datos demo).

### Estadísticas en header
Total · Alta prioridad · Reunión agendada · Llamados hoy.

### Atajos teclado
- `Cmd/Ctrl + K` → enfocar búsqueda.
- `Cmd/Ctrl + Shift + N` → nuevo lead.
- `Esc` → cerrar modal.

---

## 3. Modelo de datos (cada lead)

⚠️ **Importante: respeta exactamente estos nombres de campo en los datos demo del mockup**, para que la conversión a funcional sea directa.

```js
{
  _uid: "lead-abc123",                   // ID interno (autogenerado)
  id: "DEMO-001",                        // ID externo opcional
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
  confianza_decisor: "Alta",             // Alta | Media | Baja
  fuente_decisor: "Google Maps + LinkedIn",
  evidencia_decisor: "Texto libre",
  candidatos_decisor: [
    { nombre, cargo, confianza, fuente, evidencia }
  ],

  fuente_datos: "Origen del lead",
  problema_visible: "Texto libre",
  oportunidad_automatizacion: "Texto libre",
  prioridad: "Alta",                     // Alta | Media | Baja
  facilidad_contacto: "Alta",            // Alta | Media | Baja
  tipo_reunion_recomendada: "Presencial",// Presencial | Videollamada | Telefonica

  mensaje_llamada_personalizado: "Guion personalizado para llamar",
  mensaje_whatsapp_personalizado: "Mensaje WhatsApp personalizado",
  guion_recepcion_personalizado: "Si la recepcion contesta (opcional)",

  estado: "Nuevo",
  // Estados: Nuevo | Investigado | Llamado | Reunion agendada | Descartado

  notas: "Notas internas multilinea",
  tags: ["vip", "valladolid", "dental"],

  historial: [
    {
      fecha: "2026-05-14T10:30",
      resultado: "No contesta",
      notas: "Llamada a las 10:30. Intentar de nuevo manana."
    }
  ]
}
```

### Estados (camino feliz)
`Nuevo → Investigado → Llamado → Reunion agendada` · alternativa: `Descartado`.

### Resultados de llamada
Contactado · No contesta · Ocupado · Volver a llamar · Reunion agendada · No interesado.

---

## 4. Restricciones del mockup

✅ **Sí:**
- Vanilla HTML/CSS/JS puro.
- Inter o system fonts.
- SVG inline o Lucide para iconos.
- Datos demo plausibles: 10-12 pymes de Valladolid (clínica dental, fisio, taller mecánico, gimnasio, academia, peluquería, asesoría, óptica, hostelería, veterinaria).
- Densidad informativa estilo Linear/Attio.
- Hover sutil, focus ring indigo, sombras suaves.

❌ **No:**
- React, Vue, Angular, Svelte ni ningún framework.
- Tailwind por CDN en el resultado final (puedes usarlo durante iteración si quieres, pero al cerrar, dame CSS plano).
- Font Awesome.
- Librerías de gráficos.
- Imágenes externas (excepto el logo).
- Modo oscuro (light mode impecable primero).
- Métricas inventadas tipo "+ 245% revenue", "AI Insights", "1.2M usuarios". EsarIA aún no tiene clientes — los placeholders deben ser honestos.
- Ilustraciones tipo Undraw / personajes 3D / robots.

---

## 5. Pantallas y estados que el mockup DEBE incluir

(Todos visibles en el mismo Artifact, aunque sea con un selector "Ver estado X").

1. **Layout principal:** header + filters bar + main view.
2. **Header:** logo EsarIA + estadísticas (Total, Alta, Reunión, Llamados hoy).
3. **Filters bar:** búsqueda con placeholder de operadores, 5 selects, toggle Tarjetas/Tabla/Kanban, botones (+ Nuevo, Importar JSON, Exportar JSON, Exportar CSV, Restablecer).
4. **Vista Tarjetas:** grid responsive, cards con todo el contenido (ver §6).
5. **Vista Tabla:** filas densas con checkbox + columnas (Empresa, Sector, Ciudad, Decisor, Prioridad, Estado, Teléfono, Última llamada, Acciones).
6. **Vista Kanban:** 5 columnas de estado con cards arrastrables visualmente.
7. **Bulk action bar:** aparece cuando hay selección. Muestra "N seleccionados" + acciones (cambiar estado, prioridad, añadir tag, eliminar, limpiar selección).
8. **Modal Ver Lead:** toolbar (Editar / Eliminar) + secciones: Tags editables, Empresa, Análisis, Contacto, Guion de llamada, WhatsApp, Historial, Estado y notas.
9. **Modal Editar Lead:** mismos campos como inputs con botones Cancelar / Guardar.
10. **Sección Historial dentro del modal:** lista de llamadas registradas + formulario (fecha, resultado, notas, botón Añadir).
11. **Modal de confirmación** (para eliminar).
12. **Toast** de feedback (esquina inferior derecha).
13. **Empty state** cuando no hay resultados.

---

## 6. Anatomía de una tarjeta de lead

Cada tarjeta debe mostrar de un vistazo:

```
┌─────────────────────────────────────────┐
│ [checkbox]                              │
│ Nombre Empresa                          │
│ [Sector] [Prioridad] [Estado] [tag][tag]│
│                                         │
│ Ciudad · Decisor: Nombre · 📞 hace 2 d  │
│                                         │
│ │ Problema visible (2 líneas truncado)  │
│                                         │
│ [Ver/Editar] [Registrar llamada]        │
│ [Copiar tel] [WhatsApp] [Web]           │
└─────────────────────────────────────────┘
```

---

## 7. Logo

Texto "EsarIA" en `#0F172A` peso 700 + un símbolo geométrico minimalista a la izquierda en color accent `#6366F1`. Si en el SVG que te he subido te encaja, úsalo tal cual. Si no, recréalo respetando ese concepto.

---

## 8. Lo que pasará después

Cuando me devuelvas el Artifact HTML único:
1. Lo guardaré en `docs/crm/mockup-claude-design.html`.
2. Claude Code lo convertirá en funcional sobre el CRM real, conservando: localStorage, lógica de filtros con operadores, historial, kanban con drag&drop real, bulk actions, atajos de teclado, persistencia, import/export.
3. Mantendrá compatibilidad con los leads ya guardados de los usuarios actuales.

Por eso necesito que el **modelo de datos sea exactamente el de §3** y que las **interacciones funcionales coincidan con §2**.
