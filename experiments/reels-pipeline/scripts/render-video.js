/**
 * Renderiza la animación HTML con Playwright y exporta tmp/video.mp4
 * Usa la grabación nativa de CDP (WebM → MP4 vía ffmpeg).
 */
'use strict';

const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');
const { execSync } = require('child_process');

const BASE_DIR  = path.dirname(__dirname);
const TMP_DIR   = path.join(BASE_DIR, 'tmp');
const VIDEO_MP4 = path.join(TMP_DIR, 'video.mp4');

// Usar reel-timed.html si existe (generado por build-timed-html.js), sino el template fijo
const TIMED_HTML   = path.join(TMP_DIR, 'reel-timed.html');
const STATIC_HTML  = path.join(BASE_DIR, 'templates', 'reel-demo.html');
const HTML_PATH    = fs.existsSync(TIMED_HTML) ? TIMED_HTML : STATIC_HTML;

// Leer duración de animación desde timing.json si existe, sino usar valor por defecto
const TIMING_JSON  = path.join(TMP_DIR, 'timing.json');
const ANIM_SECS    = fs.existsSync(TIMING_JSON)
  ? JSON.parse(fs.readFileSync(TIMING_JSON, 'utf8')).animDur
  : 16;

const W = 1080;
const H = 1920;

(async () => {
  fs.mkdirSync(TMP_DIR, { recursive: true });

  // Limpiar WebM previos
  for (const f of fs.readdirSync(TMP_DIR).filter(n => n.endsWith('.webm'))) {
    fs.unlinkSync(path.join(TMP_DIR, f));
  }

  console.log('[Render] Lanzando Chromium...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: TMP_DIR, size: { width: W, height: H } }
  });

  const page = await context.newPage();
  const fileUrl = `file://${HTML_PATH}`;

  console.log(`[Render] Cargando: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  console.log(`[Render] Grabando animación (${ANIM_SECS}s)...`);
  await page.waitForTimeout(ANIM_SECS * 1000);

  // Cerrar contexto para que Playwright finalice el WebM
  await context.close();
  await browser.close();
  console.log('[Render] Animación capturada.');

  // Encontrar el WebM generado
  const webmFiles = fs.readdirSync(TMP_DIR)
    .filter(n => n.endsWith('.webm'))
    .sort();

  if (!webmFiles.length) {
    console.error('[Render] ERROR: no se encontró ningún archivo .webm en tmp/');
    process.exit(1);
  }

  const webmPath = path.join(TMP_DIR, webmFiles[webmFiles.length - 1]);
  console.log(`[Render] Convirtiendo ${path.basename(webmPath)} → video.mp4 ...`);

  execSync([
    'ffmpeg', '-y',
    '-i', `"${webmPath}"`,
    '-vf', `scale=${W}:${H},setsar=1:1`,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    `"${VIDEO_MP4}"`
  ].join(' '), { stdio: 'inherit' });

  console.log(`[Render] Vídeo listo: ${VIDEO_MP4}`);
})().catch(err => {
  console.error('[Render] Error:', err.message);
  process.exit(1);
});
