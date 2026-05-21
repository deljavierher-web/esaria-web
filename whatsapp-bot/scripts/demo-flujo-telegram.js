const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TELEGRAM_TOKEN = '8729855087:AAEs8kwEH0Hwmn_-TBklQEL3V85MhmlMXFg';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxiURd0fomiwlRuWJn6jPa-TqEXKv4_o-T0-KR6rv7V5-Fla-nofS9WtgoOKzBh8PWQ/exec';

// Configuración de OpenCode Cloud
const OPENCODE_API_KEY = 'sk-WVLidGgUEoS8LcR8Uw9V9U7rpGaG1QNlb4F0jknqBF9YXcUsrJaNQkca3v79dJeC';
const OPENCODE_API_URL = 'https://opencode.ai/zen/go/v1/chat/completions';
const OPENCODE_MODEL = 'deepseek-v4-flash';

let lastUpdateId = 0;

// Asegurar que la carpeta scratch existe
const scratchDir = path.join(__dirname, '../scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

// Función para enviar mensaje por Telegram
async function sendMessage(chatId, text, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        ...options
      })
    });
  } catch (error) {
    console.error('Error al enviar mensaje a Telegram:', error);
  }
}

// Función para responder al callback query de Telegram
async function answerCallbackQuery(callbackQueryId, text = '') {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text
      })
    });
  } catch (error) {
    console.error('Error al responder callback query:', error);
  }
}

// Función para editar el texto de un mensaje existente en Telegram
async function editMessageText(chatId, messageId, text, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: text,
        parse_mode: 'HTML',
        ...options
      })
    });
  } catch (error) {
    console.error('Error al editar mensaje de Telegram:', error);
  }
}

// Descargar archivo desde Telegram
async function downloadTelegramFile(filePath, destPath) {
  const url = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(destPath, buffer);
}

// Transcribir audio usando ffmpeg + whisper.cpp local
async function transcribeAudioLocal(fileId, chatId) {
  await sendMessage(chatId, '📥 <i>Nota de voz recibida. Descargando y procesando localmente en tu Mac...</i>');

  try {
    // 1. Obtener file_path de Telegram
    const fileInfoUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`;
    const fileInfoResponse = await fetch(fileInfoUrl);
    const fileInfo = await fileInfoResponse.json();

    if (!fileInfo.ok) {
      throw new Error('No se pudo obtener la ruta del archivo de audio en Telegram.');
    }

    const filePath = fileInfo.result.file_path;
    const oggPath = path.join(scratchDir, 'voice.ogg');
    const wavPath = path.join(scratchDir, 'voice.wav');

    // 2. Descargar el archivo .ogg
    await downloadTelegramFile(filePath, oggPath);

    // 3. Convertir a WAV (16kHz, mono) usando ffmpeg instalado
    console.log('[Audio] Convirtiendo .ogg a .wav...');
    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${oggPath}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavPath}"`, { stdio: 'ignore' });

    // 4. Ejecutar whisper.cpp localmente (usando el nuevo binario whisper-cli oficial)
    console.log('[Audio] Transcribiendo usando whisper-cli local...');
    const whisperCmd = `/Users/javidel/whisper.cpp/build/bin/whisper-cli -m /Users/javidel/whisper.cpp/models/ggml-small.bin -f "${wavPath}" -l es -nt`;
    const output = execSync(whisperCmd, { encoding: 'utf-8' });

    const transcription = output.trim();
    console.log(`[Audio] Transcripción exitosa: "${transcription}"`);
    return transcription;

  } catch (error) {
    console.error('Error en la transcripción local:', error);
    throw new Error(`Error en transcripción local: ${error.message}`);
  }
}

// Procesar texto en lenguaje natural usando la API de OpenCode
async function parseAppointmentWithOpenCode(text) {
  console.log(`[OpenCode] Procesando texto con ${OPENCODE_MODEL}: "${text}"`);
  
  const systemPrompt = `Eres un asistente de IA experto en extracción de datos. Tu tarea es extraer la información de reservas de citas a partir del texto en español provisto por el usuario.
Debes responder ÚNICAMENTE con un objeto JSON válido con los siguientes campos:
- "name": El nombre del cliente (ej. "Javier"). Si no se especifica explícitamente pero hay un nombre claro, úsalo.
- "service": El tipo de clase o servicio (ej. "boxeo", "pilates", "yoga", "nutrición").
- "date": La fecha en formato DD/MM/YYYY. Si el usuario dice "el 28 de mayo" o "el 30 de mayo", usa el año actual (2026). Por ejemplo: "30/05/2026".
- "time": La hora de la cita en formato HH:MM (formato 24 horas, ej. "18:00", "19:30"). Si dice "a las 6 de la tarde" o "a las 7 y media de la tarde", conviértelo a "18:00" o "19:30".

Fecha de referencia actual para calcular fechas: Jueves 21 de Mayo de 2026.
No añadas explicaciones, introducciones, ni bloques de código markdown, responde exclusivamente con el JSON plano.`;

  const payload = {
    model: OPENCODE_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ],
    temperature: 0
  };

  try {
    const response = await fetch(OPENCODE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCODE_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Error de API OpenCode (${response.status}): ${errText}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content.trim();
    console.log(`[OpenCode] Respuesta cruda: "${content}"`);

    // Intentar buscar y extraer el objeto JSON en la respuesta del modelo
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo encontrar un JSON estructurado en la respuesta de OpenCode.');
    }

    const appointment = JSON.parse(jsonMatch[0]);
    return appointment;

  } catch (error) {
    console.error('Error al procesar con OpenCode:', error);
    throw error;
  }
}

// Procesar un mensaje o audio individual
async function handleMessage(message) {
  const chatId = message.chat.id;
  let text = '';

  // 1. Si es audio (nota de voz), transcribir primero
  if (message.voice) {
    try {
      text = await transcribeAudioLocal(message.voice.file_id, chatId);
      if (!text || text.trim() === '') {
        await sendMessage(chatId, '⚠️ <i>El audio parece estar vacío o no he podido transcribirlo. Por favor, inténtalo de nuevo hablando más claro.</i>');
        return;
      }
      await sendMessage(chatId, `✍️ <b>Transcripción:</b> <i>"${text}"</i>`);
    } catch (error) {
      await sendMessage(chatId, `❌ <b>Error al transcribir el audio localmente:</b>\n<code>${error.message}</code>`);
      return;
    }
  } else if (message.text) {
    text = message.text.trim();
  } else {
    // Otro tipo de mensaje
    return;
  }

  // Comandos básicos
  if (text.toLowerCase() === '/start') {
    await sendMessage(
      chatId,
      `¡Hola <b>${message.from.first_name || 'cliente'}</b>! Bienvenido a la demo de automatización híbrida de <b>EsarIA</b>. 🤖✨\n\n` +
      `¡Máxima optimización de recursos!\n` +
      `• 🎙️ **Transcripción de audio local:** Usando Whisper.cpp en tu Mac (se abre y cierra al instante sin consumir memoria persistente).\n` +
      `• 🧠 **Inteligencia en la nube:** Usando DeepSeek v4 Flash de tu cuenta de OpenCode (sin consumir RAM de tu Mac).\n\n` +
      `🗣️ <b>¿Cómo probarlo?</b>\n` +
      `• Escríbeme algo libre como: <i>"Una cita de boxeo para Javier el 30 de mayo a las 7 y media de la tarde"</i>\n` +
      `• O mejor aún, **envíame una nota de voz (audio)** diciéndome exactamente eso mismo.\n\n` +
      `¡Pruébalo en directo!`
    );
    return;
  }

  // 2. Procesar el texto con OpenCode para extraer la cita estructurada
  await sendMessage(chatId, `🧠 <i>Procesando cita con OpenCode Cloud (${OPENCODE_MODEL})...</i>`);

  try {
    const appointment = await parseAppointmentWithOpenCode(text);

    // Rellenar nombre por defecto si no lo extrajo
    if (!appointment.name || appointment.name.toLowerCase().includes('desconocido') || appointment.name === '') {
      appointment.name = message.from.first_name || 'Cliente';
    }

    // Validar campos esenciales
    if (!appointment.date || !appointment.time || !appointment.service) {
      await sendMessage(
        chatId,
        `⚠️ <b>No he podido extraer todos los detalles necesarios de la cita.</b>\n\n` +
        `• <b>Cliente detectado:</b> ${appointment.name || 'No detectado'}\n` +
        `• <b>Servicio detectado:</b> ${appointment.service || 'No detectado'}\n` +
        `• <b>Fecha detectada:</b> ${appointment.date || 'No detectada'}\n` +
        `• <b>Hora detectada:</b> ${appointment.time || 'No detectada'}\n\n` +
        `Por favor, indícame claramente el servicio, la fecha y la hora en tu mensaje.`
      );
      return;
    }

    // 3. Enviar a Google Apps Script
    await sendMessage(chatId, `⏳ Agendando en tu Google Calendar (calendario <b>Demo EsarIA</b>) y en tu Hoja de Cálculo...`);

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment)
    });

    const result = await response.json();

    if (result.status === 'success') {
      await sendMessage(
        chatId,
        `✅ <b>¡Cita agendada con éxito!</b> 🎉\n\n` +
        `👤 <b>Cliente:</b> ${appointment.name}\n` +
        `🥊 <b>Servicio:</b> ${appointment.service}\n` +
        `📅 <b>Fecha:</b> ${appointment.date}\n` +
        `⏰ <b>Hora:</b> ${appointment.time} h\n\n` +
        `📂 <i>Se ha insertado la fila en tu Hoja y el evento en el calendario "Demo EsarIA". ¡Whisper local + DeepSeek Cloud en perfecta armonía!</i> 🚀`
      );
      console.log(`[Éxito] Cita registrada para ${appointment.name}`);

      // Simular el envío de solicitud de reseña de Google Maps tras 10 segundos
      setTimeout(async () => {
        await sendMessage(
          chatId,
          `🔔 <b>[DEMO: Simulación de Feedback Automático]</b>\n` +
          `<i>Este mensaje se envía de forma automática 1 hora después de finalizar la clase para medir la satisfacción del cliente.</i>\n\n` +
          `¡Hola <b>${appointment.name}</b>! Esperamos que hayas disfrutado de tu clase de <b>${appointment.service}</b> hoy. 😊\n\n` +
          `¿Qué tal ha sido tu experiencia?`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '¡Sí, me ha encantado! ⭐⭐⭐⭐⭐', callback_data: `rev_yes:${appointment.name}:${appointment.service}` },
                  { text: 'Podría mejorar 💬', callback_data: 'rev_no' }
                ]
              ]
            }
          }
        );
        console.log(`[Demo] Encuesta de feedback automática enviada para ${appointment.name}`);
      }, 10000); // Espera de 10 segundos para que se aprecie la demo en tiempo real
    } else {
      throw new Error(result.message || 'Error del servidor Apps Script');
    }

  } catch (error) {
    console.error('Error al registrar la cita:', error);
    await sendMessage(
      chatId,
      `❌ <b>Hubo un error al procesar tu solicitud:</b>\n\n` +
      `Detalle: <code>${error.message}</code>\n\n` +
      `Por favor, verifica la conexión o tu API Key de OpenCode.`
    );
  }
}

// Manejar las interacciones de los botones (callback_query)
async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  // Responder a Telegram inmediatamente para quitar el estado de carga del botón
  await answerCallbackQuery(callbackQuery.id);

  if (data.startsWith('rev_yes')) {
    // Extraer datos si es necesario (rev_yes:nombre:servicio)
    const parts = data.split(':');
    const name = parts[1] || 'Cliente';
    const service = parts[2] || 'Clase';

    // Enlace oficial de opiniones de Google Perfil de Negocio para EsarIA (abre directamente la caja de 5 estrellas)
    const GOOGLE_REVIEWS_URL = 'https://g.page/r/CcbBfg3H5u0BEBM/review';

    // Actualizamos el mensaje original para guiar al usuario
    await editMessageText(
      chatId,
      messageId,
      `❤️ <b>¡Qué alegría, ${name}!</b> Nos alegra muchísimo saber que has disfrutado de tu clase de <b>${service}</b>.\n\n` +
      `Como somos un negocio local en Valladolid, las opiniones en Google Maps son vitales para nosotros. 🚀\n\n` +
      `¿Nos regalas 10 segundos para dejarnos una valoración de 5 estrellas en nuestro perfil? Tu apoyo directo nos ayuda a seguir creciendo. 👇\n\n` +
      `👉 <b><a href="${GOOGLE_REVIEWS_URL}">Haz clic aquí para escribir tu reseña ⭐⭐⭐⭐⭐</a></b>\n\n` +
      `¡Muchísimas gracias por tu confianza! 🙏✨`
    );
    console.log(`[Demo] Cliente ${name} seleccionó reseña positiva. Enlace enviado.`);

  } else if (data === 'rev_no') {
    // Si la opinión es negativa o regular, la canalizamos internamente para no dañar la reputación pública
    await editMessageText(
      chatId,
      messageId,
      `😔 <b>Vaya, sentimos que tu experiencia no haya sido perfecta.</b>\n\n` +
      `Para nosotros lo más importante es mejorar día a día. Nos gustaría saber qué ha fallado o qué podemos hacer mejor en tu próxima sesión.\n\n` +
      `✍️ Escríbenos directamente por aquí tus comentarios y sugerencias. ¡Te leemos con atención!`
    );
    console.log(`[Demo] Cliente seleccionó feedback constructivo. Canalizado internamente.`);
  }
}

// Bucle principal de Polling
async function poll() {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        
        // Procesar mensajes normales
        if (update.message) {
          await handleMessage(update.message);
        }
        
        // Procesar clics en botones interactivos
        if (update.callback_query) {
          await handleCallbackQuery(update.callback_query);
        }
      }
    }
  } catch (error) {
    console.error('Error en el polling de Telegram:', error);
  }

  // Volver a consultar
  setTimeout(poll, 1000);
}

// Iniciar
console.log('----------------------------------------------------');
console.log('🤖 Bot de Demostración EsarIA - Arquitectura Híbrida Activa');
console.log(`Telegram Bot: @DemoEsarBot`);
console.log(`OpenCode Cloud: ${OPENCODE_MODEL}`);
console.log(`Whisper local: /Users/javidel/whisper.cpp/build/bin/whisper-cli`);
console.log(`ffmpeg local: /opt/homebrew/bin/ffmpeg`);
console.log('Listo. Envía un mensaje en lenguaje natural o audio de prueba.');
console.log('----------------------------------------------------');

poll();
