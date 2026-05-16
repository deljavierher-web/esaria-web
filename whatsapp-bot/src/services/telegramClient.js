const config = require("../config");
const leadStorage = require("./leadStorage");
const logger = require("./logger");
const whatsappClient = require("./whatsappClient");

let offset = 0;
let polling = false;

function isEnabled() {
  return Boolean(config.telegram.enabled && config.telegram.botToken && config.telegram.adminChatId);
}

function startPolling() {
  if (!isEnabled()) {
    logger.info("Telegram integration disabled");
    return;
  }

  if (polling) return;

  polling = true;
  logger.info("Telegram integration enabled");
  poll();
}

async function notifyIncomingMessage(message, result) {
  if (!isEnabled()) return;

  const lead = result.lead || {};
  const text = [
    "Nuevo WhatsApp en EsarIA",
    `De: ${lead.name || message.profileName || "Sin nombre"} (${mask(message.from)})`,
    `Estado: ${lead.state || "sin_estado"}`,
    lead.sector ? `Sector: ${lead.sector}` : "",
    `Mensaje: ${message.text || `[${message.type}]`}`,
    "",
    `Ver: /contact ${message.from}`,
    `Responder: /reply ${message.from} tu mensaje`
  ].filter(Boolean).join("\n");

  await sendAdminMessage(text);
}

async function sendAdminMessage(text) {
  if (!isEnabled()) return { skipped: true };
  return telegramRequest("sendMessage", {
    chat_id: config.telegram.adminChatId,
    text: text.slice(0, 3500)
  });
}

async function poll() {
  if (!polling) return;

  try {
    const response = await telegramRequest("getUpdates", {
      offset,
      timeout: 20,
      allowed_updates: ["message"]
    });

    for (const update of response.result || []) {
      offset = update.update_id + 1;
      await handleUpdate(update);
    }
  } catch (error) {
    logger.warn("Telegram polling failed", { error: error.message });
  } finally {
    setTimeout(poll, 1500);
  }
}

async function handleUpdate(update) {
  const message = update.message;
  if (!message || !message.text) return;

  const chatId = String(message.chat.id);
  if (chatId !== String(config.telegram.adminChatId)) {
    logger.warn("Telegram unauthorized chat ignored", { chatId: mask(chatId) });
    return;
  }

  const text = message.text.trim();

  if (text === "/start" || text === "/help") {
    await sendAdminMessage([
      "Comandos EsarIA:",
      "/leads - últimos leads",
      "/contact <telefono> - ver conversación",
      "/reply <telefono> <mensaje> - responder por WhatsApp",
      "/human <telefono> - marcar para revisión humana"
    ].join("\n"));
    return;
  }

  if (text === "/leads") {
    const leads = await leadStorage.listLeads(8);
    await sendAdminMessage(leads.length ? leads.map(formatLead).join("\n\n") : "No hay leads todavía.");
    return;
  }

  if (text.startsWith("/contact ")) {
    const contact = text.split(/\s+/)[1];
    await sendAdminMessage(await formatContact(contact));
    return;
  }

  if (text.startsWith("/reply ")) {
    const match = text.match(/^\/reply\s+(\S+)\s+([\s\S]+)/);
    if (!match) {
      await sendAdminMessage("Uso: /reply <telefono> <mensaje>");
      return;
    }

    const [, contact, reply] = match;
    const sent = await whatsappClient.sendTextMessage(contact, reply);
    const outboundId = sent.messages && sent.messages[0] ? sent.messages[0].id : undefined;

    await leadStorage.saveOutboundMessage({
      id: outboundId,
      from: config.whatsapp.phoneNumberId,
      to: contact,
      type: "text",
      text: reply,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      source: "telegram",
      deliveryStatus: outboundId ? "accepted" : "unknown"
    });

    await sendAdminMessage(`Respuesta enviada a ${mask(contact)}.`);
    return;
  }

  if (text.startsWith("/human ")) {
    const contact = text.split(/\s+/)[1];
    const lead = await leadStorage.getLeadByFrom(contact);
    await leadStorage.upsertLead({
      from: contact,
      profileName: lead ? lead.profileName : "",
      name: lead ? lead.name : "",
      state: "requires_human",
      requiresHumanReason: "marked_from_telegram"
    });
    await sendAdminMessage(`Contacto ${mask(contact)} marcado para revisión humana.`);
    return;
  }

  await sendAdminMessage("No entiendo ese comando. Usa /help.");
}

async function formatContact(contact) {
  const conversation = await leadStorage.getConversation(contact);

  if (!conversation.profile && conversation.messages.length === 0) {
    return `No hay conversación para ${mask(contact)}.`;
  }

  const profile = conversation.profile || {};
  const messages = conversation.messages.slice(-8).map((message) => {
    const direction = message.direction === "outbound" ? "EsarIA" : "Cliente";
    return `${direction}: ${message.text || `[${message.type}]`}`;
  });

  return [
    `Contacto ${mask(contact)}`,
    `Nombre: ${profile.name || ""}`,
    `Estado: ${profile.state || ""}`,
    profile.sector ? `Sector: ${profile.sector}` : "",
    profile.problema ? `Problema: ${profile.problema}` : "",
    "",
    ...messages
  ].filter(Boolean).join("\n");
}

function formatLead(lead) {
  return [
    `${lead.name || "Sin nombre"} (${mask(lead.from)})`,
    `Estado: ${lead.state || ""}`,
    lead.sector ? `Sector: ${lead.sector}` : "",
    lead.lastMessage ? `Último: ${lead.lastMessage}` : ""
  ].filter(Boolean).join("\n");
}

async function telegramRequest(method, payload) {
  const timeoutMs = method === "getUpdates" ? 35000 : 15000;
  const response = await fetch(`https://api.telegram.org/bot${config.telegram.botToken}/${method}`, {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.ok === false) {
    throw new Error(`Telegram ${method} failed: ${response.status}`);
  }

  return data;
}

function mask(value = "") {
  const text = String(value || "");
  return text.length > 4 ? `${text.slice(0, 3)}***${text.slice(-2)}` : text;
}

module.exports = {
  isEnabled,
  notifyIncomingMessage,
  sendAdminMessage,
  startPolling
};
