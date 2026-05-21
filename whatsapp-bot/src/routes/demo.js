const express = require("express");
const messageProcessor = require("../services/messageProcessor");
const telegramClient = require("../services/telegramClient");

const router = express.Router();

// Ruta de demo original (recibe mensaje entrante y simula respuesta de la IA)
router.post("/", async (req, res, next) => {
  try {
    const text = req.body.text || req.body.message || "";
    const from = req.body.from || "demo-user";
    const profileName = req.body.name || "Demo";

    const result = await messageProcessor.processIncomingMessage(
      {
        id: `demo-${Date.now()}`,
        from,
        profileName,
        type: "text",
        text,
        timestamp: Math.floor(Date.now() / 1000).toString(),
        raw: req.body
      },
      { source: "demo" }
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Demo A: Gimnasios (Simulación de Google Calendar -> Telegram Bot)
router.post("/gym", async (req, res, next) => {
  try {
    const name = req.body.name || "María Carmen";
    const date = req.body.date || new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

    const messageText = [
      "🔔 AVISO DE RESERVA (Simulación Google Calendar ➡️ Telegram)",
      "",
      `Hola ${name}, te confirmamos que tu sesión de Pilates está agendada para el día ${date} en nuestro centro.`,
      "",
      "Recuerda que puedes cancelar con 24 horas de antelación para que otro compañero pueda aprovechar el hueco. ¡Te esperamos!"
    ].join("\n");

    const telegramResult = await telegramClient.sendAdminMessage(messageText);

    res.json({
      ok: true,
      type: "gym_demo",
      sentTo: "Telegram",
      message: messageText,
      telegramResult
    });
  } catch (error) {
    next(error);
  }
});

// Demo B: Talleres (Simulación de Google Sheets -> Telegram Bot)
router.post("/taller", async (req, res, next) => {
  try {
    const name = req.body.name || "Manuel";
    const car = req.body.car || "Ford Focus";
    const price = req.body.price || "180";

    const messageText = [
      "🚗 TALLER MECÁNICO (Simulación Google Sheets ➡️ Telegram)",
      "",
      `Hola ${name}, te informamos de que el presupuesto para tu ${car} ya está listo y asciende a ${price}€.`,
      "",
      "Por favor, confírmanos si damos luz verde a la reparación respondiendo a este mensaje. ¡Gracias!"
    ].join("\n");

    const telegramResult = await telegramClient.sendAdminMessage(messageText);

    res.json({
      ok: true,
      type: "taller_demo",
      sentTo: "Telegram",
      message: messageText,
      telegramResult
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
