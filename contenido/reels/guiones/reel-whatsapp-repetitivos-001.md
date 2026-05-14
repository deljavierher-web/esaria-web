---
título: Tu negocio pierde horas contestando WhatsApps repetitivos
slug: whatsapp-repetitivos-001
fecha: 2026-05-06
objetivo: Mostrar a pequeñas empresas locales que pierden tiempo en mensajes repetitivos de WhatsApp y ofrecer automatización como solución real
público: Clínicas, talleres, gimnasios y comercios locales en Valladolid y España
duración objetivo: 14–17 segundos
motor TTS: gemini (voz Iapetus, velocidad fast)
estado: producción
---

## Texto de voz (enviado al TTS)

```
¿Cuántos WhatsApps contestas al día diciendo siempre lo mismo?
¿Horarios? ¿Precios? ¿Tienen cita disponible?
Clínicas, talleres y gimnasios pierden horas en eso cada semana.
En Esária lo automatizamos.
Pide tu diagnóstico gratuito.
```

> Nota: se usa "Esária" en lugar de "EsarIA" para correcta pronunciación del TTS.
> En visuales aparece siempre "EsarIA".

## Escenas visuales

| Escena | Label | Texto principal | Nota |
|--------|-------|----------------|------|
| sc1 — Gancho | El problema | ¿Cuántos **WhatsApps** al día? | Acento violeta en "WhatsApps" |
| sc2 — Ejemplo | Lo mismo de siempre | "¿Horarios?" / "¿Precios?" | Subtexto: "¿Tienen cita disponible?" |
| sc3 — Quién | ¿A quién le pasa? | Clínicas, talleres, **gimnasios** | Acento violeta en "gimnasios". Body: "pierden horas cada semana" |
| sc4 — Lista | ¿En qué? | 4 items en stagger | Responder WhatsApps / Confirmar citas / Dar presupuestos / Hacer seguimientos |
| sc5 — Hero | La solución | EsarIA / lo **automatiza** | Se queda en pantalla hasta el CTA |
| CTA | — | Diagnóstico gratuito | Pill violeta · "Sin compromiso · esaria.es" |

## CTA

**Diagnóstico gratuito · esaria.es**

## Comando de generación

```bash
cd experiments/reels-pipeline
REEL_SLUG=whatsapp-repetitivos-001 TTS_ENGINE=gemini GEMINI_VOICE=Iapetus GEMINI_SPEED=fast bash scripts/make-reel.sh
```

## Salida esperada

- MP4: `contenido/reels/finales/reel-whatsapp-repetitivos-001-FECHA.mp4`
- Audio: `contenido/reels/audios/audio-whatsapp-repetitivos-001-FECHA.wav`
