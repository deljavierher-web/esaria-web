#!/usr/bin/env node
/**
 * build-timed-html.js
 * Lee la duración real de tmp/voice.wav, distribuye los timings
 * de forma proporcional a la longitud de cada frase y genera
 * tmp/reel-timed.html con GSAP timings calculados.
 *
 * Reglas de transición:
 *   - Sin solapamiento: la escena anterior termina de salir ANTES de que entre la siguiente.
 *   - autoAlpha (opacity+visibility) garantiza que escenas ocultas no se vean.
 *   - sc4 anima los task-items en stagger para evitar sobrecarga visual.
 *   - sc5 (hero) se queda en pantalla; CTA entra en los últimos CTA_TAIL segundos.
 */
'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const BASE_DIR = path.dirname(__dirname);
const TMP_DIR  = path.join(BASE_DIR, 'tmp');
const WAV_PATH = path.join(TMP_DIR, 'voice.wav');
const OUT_HTML = path.join(TMP_DIR, 'reel-timed.html');
const OUT_JSON = path.join(TMP_DIR, 'timing.json');

fs.mkdirSync(TMP_DIR, { recursive: true });

// ── 1. Duración real del audio ────────────────────────────────────────────────
if (!fs.existsSync(WAV_PATH)) {
  console.error(`[HTML] Error: ${WAV_PATH} no existe. Ejecuta make-voice.py primero.`);
  process.exit(1);
}

const ffOut = execSync(
  `ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1 "${WAV_PATH}"`
).toString().trim();
const audioDur = parseFloat(ffOut.split('=')[1]);
if (isNaN(audioDur) || audioDur < 1) {
  console.error('[HTML] No se pudo leer la duración del audio.');
  process.exit(1);
}
console.log(`[HTML] Duración audio: ${audioDur.toFixed(2)}s`);

// ── 2. Constantes de timing ───────────────────────────────────────────────────
const BRAND_INTRO = 1.5;   // intro de marca antes del primer slide
const ENTER       = 0.45;  // duración animación de entrada
const EXIT        = 0.35;  // duración animación de salida
const GAP         = EXIT;  // próxima escena entra cuando la anterior ya está completamente oculta
const CTA_TAIL    = 1.8;   // CTA visible los últimos N segundos del audio

// ── 3. Escenas (chars = proxy de duración de voz) ─────────────────────────────
const SLIDES = [
  { id: 'sc1', chars: 60, minDur: 1.8 },   // "2026 y siguen contestando WhatsApps a mano"
  { id: 'sc2', chars: 42, minDur: 1.5 },   // "Horarios, precios, citas, seguimientos"
  { id: 'sc3', chars: 58, minDur: 2.0 },   // "Clínicas, talleres y gimnasios pierden horas"
  { id: 'sc4', chars: 40, minDur: 2.4 },   // lista de tareas (stagger: 4 items)
  { id: 'sc5', chars: 52, minDur: 2.5 },   // "EsarIA. Automatización útil para negocios reales."
];

const nTransitions = SLIDES.length - 1;            // 4 gaps entre sc1→sc5
const ctaEnterAt   = audioDur - CTA_TAIL;
// Tiempo neto para contenido de escenas (descontando gaps entre ellas)
const available    = ctaEnterAt - BRAND_INTRO - nTransitions * GAP;
const totalChars   = SLIDES.reduce((a, s) => a + s.chars, 0);

// Duración proporcional a chars, respetando mínimos
SLIDES.forEach(s => {
  const prop = (s.chars / totalChars) * available;
  s.dur = Math.max(s.minDur, prop);
});

// Escalar hacia abajo si la suma supera el tiempo disponible
let sumDur = SLIDES.reduce((a, s) => a + s.dur, 0);
if (sumDur > available) {
  const sumMin = SLIDES.reduce((a, s) => a + s.minDur, 0);
  const scale  = (available - sumMin) / (sumDur - sumMin);
  SLIDES.forEach(s => { s.dur = s.minDur + (s.dur - s.minDur) * scale; });
}

// ── 4. Calcular timestamps: sin solapamiento ──────────────────────────────────
// cursor = cuando la anterior ha terminado de salir por completo
let cursor = BRAND_INTRO;
SLIDES.forEach((s, i) => {
  s.enterAt = cursor;
  s.exitAt  = s.enterAt + s.dur;                    // salida empieza aquí
  if (i < SLIDES.length - 1) cursor = s.exitAt + GAP; // siguiente entra tras el GAP
});
// sc5 se queda en pantalla (no tiene salida)

const animDur = audioDur + 0.8;  // buffer de render

// ── 5. Log ────────────────────────────────────────────────────────────────────
console.log('[HTML] Timings calculados:');
SLIDES.forEach(s => {
  const exitInfo = s.id === 'sc5' ? 'stays' : `exit=${s.exitAt.toFixed(2)}s  gone=${(s.exitAt+EXIT).toFixed(2)}s`;
  console.log(`  ${s.id}: enter=${s.enterAt.toFixed(2)}s  dur=${s.dur.toFixed(2)}s  ${exitInfo}`);
});
console.log(`  CTA:  enter=${ctaEnterAt.toFixed(2)}s`);
console.log(`  Anim: ${animDur.toFixed(2)}s`);

// ── 6. Escribir timing.json ───────────────────────────────────────────────────
fs.writeFileSync(OUT_JSON, JSON.stringify({ audioDur, animDur, ctaEnterAt }, null, 2));

// ── 7. Template HTML ──────────────────────────────────────────────────────────
const T = (n) => n.toFixed(3);
const [sc1, sc2, sc3, sc4, sc5] = SLIDES;

// Timing stagger sc4: el label aparece con el contenedor,
// cada task-item entra 0.2s después del anterior
const SC4_STAGGER_START = T(sc4.enterAt + 0.3);  // primer item entra 0.3s después del contenedor

const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>EsarIA Reel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1080px;
      height: 1920px;
      background: #0F172A;
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
      color: #F8FAFC;
      overflow: hidden;
      position: relative;
    }

    .bg-glow {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background:
        radial-gradient(ellipse 800px 600px at 50% 25%, rgba(99,102,241,0.07) 0%, transparent 70%),
        radial-gradient(ellipse 500px 400px at 80% 80%, rgba(99,102,241,0.04) 0%, transparent 60%);
      pointer-events: none;
    }

    .brand {
      position: absolute;
      top: 96px; left: 80px; right: 80px;
      display: flex; align-items: center; gap: 20px;
    }
    .brand-name { font-size: 62px; font-weight: 800; letter-spacing: -2.5px; color: #F8FAFC; }
    .brand-name .accent { color: #6366F1; }
    .brand-sep { width: 2px; height: 44px; background: #1E293B; border-radius: 1px; }
    .brand-tag { font-size: 26px; font-weight: 400; color: #475569; letter-spacing: 0.3px; }

    .accent-line {
      position: absolute;
      top: 188px; left: 80px;
      width: 0; height: 3px;
      background: linear-gradient(90deg, #6366F1 0%, rgba(99,102,241,0) 100%);
      border-radius: 2px;
    }

    /* Todos los slides ocultos por defecto via GSAP autoAlpha */
    .slide {
      position: absolute;
      left: 80px; right: 80px;
      visibility: hidden;
      opacity: 0;
    }

    .slide-label {
      font-size: 26px; font-weight: 600; color: #6366F1;
      letter-spacing: 3px; text-transform: uppercase; margin-bottom: 36px;
    }

    .slide-title {
      font-size: 92px; font-weight: 800; line-height: 1.04;
      letter-spacing: -3.5px; color: #F8FAFC;
    }
    .slide-title .accent { color: #6366F1; }

    .slide-body {
      font-size: 48px; font-weight: 400; color: #64748B;
      margin-top: 28px; line-height: 1.3; letter-spacing: -1px;
    }

    #sc1 { top: 640px; }

    #sc2 { top: 700px; }
    #sc2 .slide-title { font-size: 84px; letter-spacing: -3px; }

    #sc3 { top: 600px; }

    #sc4 { top: 580px; }
    .task-list { display: flex; flex-direction: column; gap: 20px; margin-top: 32px; }
    .task-item {
      display: flex; align-items: center; gap: 20px;
      font-size: 58px; font-weight: 700; letter-spacing: -1.5px; color: #F8FAFC;
      visibility: hidden; opacity: 0;
    }
    .task-dot { width: 12px; height: 12px; background: #6366F1; border-radius: 50%; flex-shrink: 0; }

    #sc5 {
      top: 730px;
      text-align: center;
      left: 0; right: 0;
      padding: 0 80px;
    }
    #sc5 .slide-label { text-align: center; }
    #sc5 .brand-hero {
      font-size: 120px; font-weight: 800; letter-spacing: -5px;
      color: #F8FAFC; line-height: 1.0; display: block;
    }
    #sc5 .action-hero {
      font-size: 88px; font-weight: 800; letter-spacing: -3px;
      color: #F8FAFC; line-height: 1.04; display: block; margin-top: 8px;
    }
    #sc5 .action-hero .accent { color: #6366F1; }

    #cta {
      position: absolute;
      bottom: 200px; left: 80px; right: 80px;
      visibility: hidden; opacity: 0;
    }
    .cta-pill {
      display: inline-flex; align-items: center;
      background: #6366F1; color: #FFFFFF;
      font-size: 46px; font-weight: 700;
      padding: 30px 60px; border-radius: 120px;
      letter-spacing: -0.5px; margin-bottom: 24px;
    }
    .cta-sub { font-size: 32px; color: #475569; font-weight: 400; padding-left: 8px; }

    #footer {
      position: absolute;
      bottom: 80px; left: 80px; right: 80px;
      display: flex; justify-content: space-between; align-items: center;
      visibility: hidden; opacity: 0;
    }
    .footer-url { font-size: 30px; font-weight: 600; color: #334155; }
    .footer-tag { font-size: 26px; color: #6366F1; font-weight: 500; }
  </style>
</head>
<body>
  <div class="bg-glow"></div>

  <div class="brand" id="brand">
    <div class="brand-name">Esar<span class="accent">IA</span></div>
    <div class="brand-sep"></div>
    <div class="brand-tag">Automatización para pymes</div>
  </div>
  <div class="accent-line" id="accentLine"></div>

  <div class="slide" id="sc1">
    <div class="slide-label">2026</div>
    <div class="slide-title">
      ¿Y siguen<br>
      <span class="accent">contestando</span><br>
      a mano?
    </div>
  </div>

  <div class="slide" id="sc2">
    <div class="slide-label">Todos los días</div>
    <div class="slide-title">
      <span class="accent">Horarios,</span><br>
      <span class="accent">precios,</span><br>
      <span class="accent">citas</span>
    </div>
    <div class="slide-body">lo mismo una y otra vez</div>
  </div>

  <div class="slide" id="sc3">
    <div class="slide-label">¿A quién le pasa?</div>
    <div class="slide-title">
      Clínicas,<br>
      talleres,<br>
      <span class="accent">gimnasios</span>
    </div>
    <div class="slide-body">pierden horas que no recuperan</div>
  </div>

  <div class="slide" id="sc4">
    <div class="slide-label">¿En qué?</div>
    <div class="task-list">
      <div class="task-item"><div class="task-dot"></div>Responder WhatsApps</div>
      <div class="task-item"><div class="task-dot"></div>Confirmar citas</div>
      <div class="task-item"><div class="task-dot"></div>Dar presupuestos</div>
      <div class="task-item"><div class="task-dot"></div>Hacer seguimientos</div>
    </div>
  </div>

  <div class="slide" id="sc5">
    <div class="slide-label">La solución</div>
    <span class="brand-hero">EsarIA</span>
    <span class="action-hero"><span class="accent">Automatización</span> útil<br>para negocios reales</span>
  </div>

  <div id="cta">
    <div class="cta-pill">esaria.es</div>
    <div class="cta-sub">Automatización útil para negocios reales</div>
  </div>

  <div id="footer">
    <div class="footer-url">esaria.es</div>
    <div class="footer-tag">Valladolid</div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script>
    // Estado inicial: todo invisible con autoAlpha (opacity=0 + visibility=hidden)
    gsap.set('.slide',                    { autoAlpha: 0, y: 55, scale: 0.97 });
    gsap.set(['#cta', '#footer'],         { autoAlpha: 0 });
    gsap.set('#brand',                    { autoAlpha: 0 });
    gsap.set('#accentLine',               { width: 0 });
    // task-items ocultos individualmente para el stagger
    gsap.set('#sc4 .task-item',           { autoAlpha: 0, x: -20 });

    const E  = { enter: 'power3.out', exit: 'power2.in' };
    const tl = gsap.timeline();

    // Brand entry
    tl.to('#brand',      { autoAlpha: 1, y: 0, duration: 0.7, ease: E.enter }, 0.2)
      .to('#accentLine', { width: 240,   duration: 0.6, ease: 'power2.out'  }, 0.6)
      .to('#footer',     { autoAlpha: 1, duration: 0.5, ease: 'none'        }, 1.0)

    // sc1: entra — sale completamente — pausa GAP — sc2 entra
      .to('#sc1', { autoAlpha: 1, y: 0, scale: 1, duration: ${ENTER}, ease: E.enter }, ${T(sc1.enterAt)})
      .to('#sc1', { autoAlpha: 0, y: -35,          duration: ${EXIT},  ease: E.exit  }, ${T(sc1.exitAt)})

    // sc2: entra — sale
      .to('#sc2', { autoAlpha: 1, y: 0, scale: 1, duration: ${ENTER}, ease: E.enter }, ${T(sc2.enterAt)})
      .to('#sc2', { autoAlpha: 0, y: -35,          duration: ${EXIT},  ease: E.exit  }, ${T(sc2.exitAt)})

    // sc3: entra — sale
      .to('#sc3', { autoAlpha: 1, y: 0, scale: 1, duration: ${ENTER}, ease: E.enter }, ${T(sc3.enterAt)})
      .to('#sc3', { autoAlpha: 0, y: -35,          duration: ${EXIT},  ease: E.exit  }, ${T(sc3.exitAt)})

    // sc4: contenedor entra → task-items en stagger → sale
      .to('#sc4',            { autoAlpha: 1, y: 0, scale: 1, duration: ${ENTER}, ease: E.enter  }, ${T(sc4.enterAt)})
      .to('#sc4 .task-item', { autoAlpha: 1, x: 0, duration: 0.22, stagger: 0.18, ease: E.enter }, ${SC4_STAGGER_START})
      .to('#sc4',            { autoAlpha: 0, y: -35,          duration: ${EXIT},  ease: E.exit   }, ${T(sc4.exitAt)})

    // sc5: hero — entra y se queda
      .to('#sc5', { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: E.enter }, ${T(sc5.enterAt)})

    // CTA: entra cuando el audio dice "Diagnóstico gratuito"
      .to('#cta', { autoAlpha: 1, y: 0, duration: 0.7, ease: E.enter }, ${T(ctaEnterAt)})
    ;
  </script>
</body>
</html>`;

fs.writeFileSync(OUT_HTML, html, 'utf8');
console.log(`[HTML] Guardado: ${OUT_HTML}`);
