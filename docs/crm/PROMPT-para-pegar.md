# PROMPT — copiar y pegar tal cual en Claude.ai

Pega esto **después de haber subido los archivos** al chat o al Project.

---

```
Hola Claude. Vas a rediseñar la interfaz de mi CRM "EsarIA".

He subido al proyecto:
- contexto-completo-para-claude.md (lee esto PRIMERO, contiene marca, paleta, modelo de datos y funcionalidades)
- index.html, style.css, app.js (la app actual funcional)
- esaria-logo-horizontal.svg (el logo)

OBJETIVO:
Crear un mockup visual moderno y profesional del CRM, en un único Artifact HTML autocontenido, que respete EXACTAMENTE:
- La paleta EsarIA del documento de contexto.
- El modelo de datos de los leads (mismos nombres de campo).
- Todas las funcionalidades y pantallas listadas.

REFERENCIAS VISUALES: Linear, Attio, Folk, Pipedrive moderno, Vercel dashboard. Sobrio, profesional, B2B. Nada de cyberpunk, robots, glassmorphism agresivo o gradientes neón.

ENTREGABLE: un único Artifact HTML con CSS embebido en <style>. JavaScript solo el mínimo para mostrar interactividad visual (cambiar vistas, abrir/cerrar modales, alternar empty state). No hace falta lógica real ni persistencia — yo conectaré la funcionalidad después.

PANTALLAS A INCLUIR (todas visibles, aunque sea con tabs o selector):
1. Header con logo + 4 estadísticas (Total, Alta prioridad, Reunión agendada, Llamados hoy).
2. Barra de filtros: búsqueda con operadores, selects (sector, prioridad, estado, tag, orden), toggle Tarjetas/Tabla/Kanban, botones (+ Nuevo, Importar JSON, Exportar JSON, Exportar CSV).
3. Vista Tarjetas — grid de leads con badges, decisor, problema, última llamada, acciones.
4. Vista Tabla — filas densas con checkbox y todas las columnas.
5. Vista Kanban — 5 columnas de estado (Nuevo, Investigado, Llamado, Reunion agendada, Descartado).
6. Bulk action bar visible con selección activa.
7. Modal Ver Lead — toolbar + tags editables + secciones (Empresa, Análisis, Contacto, Guion llamada, WhatsApp, Historial de llamadas, Estado y notas).
8. Modal Editar Lead — mismos campos como inputs/textareas/selects + Cancelar y Guardar.
9. Modal Confirmación (eliminar lead).
10. Toast.
11. Empty state.

DATOS DEMO: 10-12 pymes plausibles de Valladolid (clínica dental, fisio, taller, gimnasio, academia, peluquería, asesoría, óptica, hostelería, veterinaria). Datos ficticios pero creíbles. NO inventes métricas, clientes existentes ni cifras de facturación — EsarIA aún no tiene clientes reales. Algún lead con historial de llamadas para que se vea cómo queda.

RESTRICCIONES TÉCNICAS:
- Vanilla HTML/CSS/JS. NO React, NO Vue, NO Tailwind CDN en el resultado final.
- Iconos: Lucide o SVG inline. NO Font Awesome.
- Tipografía: Inter (Google Fonts) o system UI.
- Sin librerías externas de gráficos. Sin imágenes externas (excepto el logo).
- El HTML debe verse igual abierto con file:// (sin servidor).
- Light mode solamente (sin modo oscuro de momento).

ESTILO:
- Bordes 8-10px, sombras suaves.
- Badges pill con fondo pastel del color semántico.
- Hover sutil (sombra ligera + cambio de borde).
- Focus ring indigo en inputs.
- Header y filters sticky.
- Densidad informativa al estilo Linear/Attio.

Por favor empieza ya. Si tienes dudas concretas, hazlas en una sola pregunta y avanza.
```
