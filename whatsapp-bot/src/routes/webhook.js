const express = require("express");
const config = require("../config");
const logger = require("../services/logger");
const whatsappClient = require("../services/whatsappClient");
const leadStorage = require("../services/leadStorage");
const messageProcessor = require("../services/messageProcessor");
const telegramClient = require("../services/telegramClient");

const router = express.Router();

router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token && token === config.whatsapp.verifyToken) {
    logger.info("Meta webhook verified");
    return res.status(200).send(challenge);
  }

  logger.warn("Invalid Meta webhook verification attempt");
  return res.sendStatus(403);
});

router.post("/", async (req, res, next) => {
  try {
    const messages = whatsappClient.extractIncomingMessages(req.body);
    const statuses = whatsappClient.extractStatuses(req.body);
    const summary = whatsappClient.summarizeWebhook(req.body);

    res.sendStatus(200);

    for (const status of statuses) {
      await leadStorage.saveStatus(status);
    }

    if (summary.statuses > 0 && summary.messages === 0) {
      logger.info("WhatsApp status event ignored", summary);
      return;
    }

    logger.info("WhatsApp webhook received", summary);

    for (const message of messages) {
      try {
        const result = await messageProcessor.processIncomingMessage(message, { source: "whatsapp" });
        await telegramClient.notifyIncomingMessage(message, result);

        if (result.reply && message.from) {
          const sent = await whatsappClient.sendTextMessage(message.from, result.reply);
          const outboundId = sent.messages && sent.messages[0] ? sent.messages[0].id : undefined;

          await leadStorage.saveOutboundMessage({
            id: outboundId,
            from: config.whatsapp.phoneNumberId,
            to: message.from,
            profileName: message.profileName,
            type: "text",
            text: result.reply,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            replyToMessageId: message.id,
            ai: result.ai,
            leadState: result.lead ? result.lead.state : "",
            deliveryStatus: outboundId ? "accepted" : "unknown"
          });
        }
      } catch (error) {
        logger.error("Webhook message processing failed", { messageId: message.id, error: error.message });
      }
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
