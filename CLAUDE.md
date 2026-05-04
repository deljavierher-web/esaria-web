# CLAUDE.md — Protocolo EsarIA

## Objetivo del proyecto

EsarIA es una marca local de automatización e IA práctica para pequeñas empresas de Valladolid.

Prioridad:
- Profesionalidad
- Claridad
- Minimalismo
- Soluciones prácticas
- No vender humo
- No sonar como una gran consultora

## Reglas generales

- Responde en español.
- Sé directo y práctico.
- Evita explicaciones largas si no se piden.
- No modifiques archivos fuera del proyecto.
- No borres archivos sin pedir confirmación.
- Haz backup antes de cambios grandes o reorganizaciones.
- No rehagas algo desde cero si se puede ajustar.
- Si una tarea es de bajo riesgo, ejecútala directamente.
- Si puede romper estructura, rutas, assets o diseño, explica antes qué vas a tocar.

## Eficiencia de tokens

- No hagas preámbulos largos.
- No repitas el problema.
- No des resúmenes enormes.
- Usa comandos agrupados cuando sea seguro.
- Lee solo los archivos necesarios.
- No abras 20 archivos para un cambio simple.
- Si ya conoces la estructura del proyecto, no vuelvas a inspeccionarla salvo que haya cambiado.
- Al terminar, resume solo:
  - archivos modificados
  - archivos creados
  - comando para probar
  - riesgos o pendientes reales

## Reglas de edición

Antes de modificar:
1. Identifica archivos afectados.
2. Si el cambio afecta a varias carpetas, crea backup.
3. Haz cambios mínimos.
4. Verifica rutas.
5. No toques index.html salvo que se pida expresamente.

## Carpeta de trabajo

La carpeta raíz del proyecto es:

```
/Users/javidel/Library/CloudStorage/GoogleDrive-deljavierher@gmail.com/Mi unidad/EsarIA
```

- Trabaja siempre dentro de esta carpeta.
- No modifiques archivos fuera de ella.

## Web

- La landing principal está en index.html.
- Puedes modificar index.html cuando el usuario lo pida explícitamente.
- No rediseñar la landing si solo se pide corregir logo, responsive, rutas o enlaces.
- Mantener estilo B2B limpio, sobrio y profesional.
- Evitar estética cyberpunk, robots, cerebros, bombillas, engranajes o circuitos exagerados.

## Publicación en la web — flujo obligatorio

Después de cualquier modificación de index.html:

1. NO hagas commit ni push automáticamente.
2. Muestra un resumen corto de los cambios realizados.
3. Pregunta exactamente:
   "¿Quieres que publique estos cambios en la web pública?"
4. Solo si el usuario responde afirmativamente (sí, publica, adelante, confirmo), ejecuta:

```bash
git status
git add .
git commit -m "update website"
git push
```

5. Tras el push, indica:
   "Cloudflare Pages actualizará https://esaria.es automáticamente en unos segundos."

Este flujo es obligatorio. No lo omitas aunque el cambio sea pequeño.

## Marca

Assets principales:
- assets/brand/logo/
- assets/brand/icon/
- assets/brand/social/
- assets/brand/favicon/
- assets/brand/previews/

Paleta:
- #0F172A
- #6D5EF3
- #F8FAFC
- #FFFFFF
- #64748B
- #E2E8F0

Mantener la identidad visual existente salvo que se pida rediseño.

## Redes sociales

Estructura actual:
- assets/social-posts/instagram/post-01-presentacion-esaria/
- assets/social-posts/instagram/post-02-citas-manuales/
- assets/social-posts/instagram/post-03-4-tareas/
- assets/social-posts/instagram/post-04-que-es-automatizar/
- assets/social-posts/instagram/post-05-bucle-whatsapp-reel/
- assets/social-posts/instagram/post-06-ejemplo-clinica/
- assets/social-posts/instagram/stories-destacadas/
- assets/social-posts/instagram/previews/master-preview.html

Cada post debe mantener:
- source/
- exports/
- caption.txt cuando corresponda
- preview.html

No exportar todos los PNG a una carpeta común si hay nombres repetidos.
Usar exports/ dentro de cada post.

## Regla para vídeos y Reels

Cuando generes un vídeo para redes sociales —Instagram Reels, TikTok, YouTube Shorts o similar— debes entregar siempre:

1. Archivo fuente editable del vídeo.
2. MP4 renderizado o comando exacto para renderizarlo.
3. Un archivo `caption.txt` dentro de la carpeta del vídeo.

El archivo `caption.txt` debe incluir:
- descripción lista para copiar y pegar en Instagram/TikTok
- CTA claro
- 3-5 hashtags relevantes
- tono profesional, cercano y sin vender humo
- sin prometer resultados garantizados
- sin decir que EsarIA tiene clientes o casos reales si no está demostrado
- si el vídeo es educativo, cerrar con una pregunta para generar comentarios

Formato recomendado de carpeta:

```
assets/hyperframes/nombre-del-reel/
  index.html
  README.md
  caption.txt
  renders/
```

Ejemplo de caption:

```
"Automatizar un negocio no va de poner robots ni complicarlo todo.

Va de dejar de repetir tareas que consumen tiempo cada semana: citas, WhatsApps, recordatorios, formularios o seguimiento de clientes.

La clave no es usar IA porque sí.
La clave es ahorrar tiempo en procesos reales.

¿Qué tarea repites cada semana en tu negocio? 👇

#AutomatizaciónIA #Pymes #NegociosLocales #Valladolid #EsarIA"
```

Al final de cada tarea de vídeo, responde siempre con:
- archivos creados
- comando para previsualizar
- comando para renderizar
- ruta del MP4
- ruta del caption.txt

## Contenido y tono

No decir:
- que EsarIA ya tiene clientes si no está demostrado
- que hay resultados garantizados
- métricas concretas sin fuente
- “somos líderes”
- “revolucionamos tu negocio”

Sí decir:
- diagnóstico inicial
- revisar procesos
- automatización útil
- tareas repetitivas
- soluciones sencillas
- negocios locales
- Valladolid

## Modelos y esfuerzo

Usa el modelo más barato que sirva con calidad:
- Haiku: mover/copiar/renombrar archivos, find/replace, scripts simples, organizar carpetas.
- Sonnet: desarrollo normal, SVG/HTML/CSS, prompts, estrategia de contenido, debugging moderado.
- Opus: solo arquitectura, bugs difíciles, decisiones importantes o si Sonnet falla.

Esfuerzo:
- Bajo: 1 archivo o cambio mecánico.
- Medio: 2-5 archivos.
- Alto: muchas carpetas, debugging, rediseños.
- Nunca usar esfuerzo máximo de primeras.

## Verificación

Para cambios de archivos:
- comprobar que los archivos existen
- comprobar rutas relativas
- comprobar que index.html no se modificó si no debía
- si hay scripts, indicar cómo ejecutarlos

## Respuesta final

Formato breve:
- Hecho
- Archivos creados/modificados
- Cómo probarlo
- Pendientes reales
