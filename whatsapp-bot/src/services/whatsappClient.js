const config = require("../config");
const logger = require("./logger");

function extractIncomingMessages(payload) {
  const messages = [];
  const entries = payload.entry || [];

  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const contactsByWaId = new Map((value.contacts || []).map((contact) => [contact.wa_id, contact]));

      for (const item of value.messages || []) {
        const contact = contactsByWaId.get(item.from) || {};
        messages.push({
          id: item.id,
          from: item.from,
          profileName: contact.profile ? contact.profile.name : "",
          type: item.type,
          text: item.text ? item.text.body : "",
          timestamp: item.timestamp,
          raw: item
        });
      }
    }
  }

  return messages;
}

function extractStatuses(payload) {
  const statuses = [];

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};

      for (const item of value.statuses || []) {
        statuses.push({
          id: item.id,
          recipientId: item.recipient_id,
          status: item.status,
          timestamp: item.timestamp,
          conversation: item.conversation || null,
          pricing: item.pricing || null,
          raw: item
        });
      }
    }
  }

  return statuses;
}

function summarizeWebhook(payload) {
  let messages = 0;
  let statuses = 0;
  const statusTypes = [];

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      messages += (value.messages || []).length;
      statuses += (value.statuses || []).length;
      statusTypes.push(...(value.statuses || []).map((status) => status.status).filter(Boolean));
    }
  }

  return { messages, statuses, statusTypes };
}

async function sendTextMessage(to, body) {
  if (!config.whatsapp.accessToken || !config.whatsapp.phoneNumberId) {
    logger.warn("WhatsApp credentials missing; message not sent", { to: maskPhone(to) });
    return { skipped: true, reason: "missing_whatsapp_credentials" };
  }

  const url = `https://graph.facebook.com/v20.0/${config.whatsapp.phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${config.whatsapp.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    logger.error("WhatsApp send failed", { status: response.status, data: sanitizeGraphResponse(data) });
    throw new Error("whatsapp_send_failed");
  }

  logger.info("WhatsApp message sent", { to: maskPhone(to) });
  return data;
}

function sanitizeGraphResponse(data) {
  if (!data || !data.error) return data;

  return {
    error: {
      message: data.error.message,
      type: data.error.type,
      code: data.error.code,
      error_subcode: data.error.error_subcode || null,
      fbtrace_id: data.error.fbtrace_id ? "[present]" : null
    }
  };
}

function maskPhone(value = "") {
  const text = String(value || "");
  return text.length > 4 ? `${text.slice(0, 3)}***${text.slice(-2)}` : text;
}

module.exports = {
  extractIncomingMessages,
  extractStatuses,
  summarizeWebhook,
  sendTextMessage
};
