const aiClient = require("../ai/aiClient");
const leadStorage = require("./leadStorage");
const logger = require("./logger");

const fallbackReply = "Gracias, he recibido tu mensaje. Te responderemos lo antes posible.";
const humanRequestPattern = /\b(humano|persona|ll[aá]mame|llamarme|quiero hablar|hablar contigo|contacta conmigo|contactad conmigo)\b/i;

const sectors = [
  { key: "clinica", pattern: /\b(cl[ií]nica|dentista|fisioterapia|fisio|podolog[ií]a|salud)\b/i },
  { key: "taller", pattern: /\b(taller|mec[aá]nico|coches|veh[ií]culos|reparaci[oó]n)\b/i },
  { key: "gimnasio", pattern: /\b(gimnasio|gym|fitness|entrenamiento|centro deportivo)\b/i },
  { key: "comercio", pattern: /\b(comercio|tienda|retail|boutique|zapater[ií]a|florister[ií]a)\b/i },
  { key: "hosteleria", pattern: /\b(hosteler[ií]a|bar|restaurante|cafeter[ií]a|hotel|reservas)\b/i }
];

async function processIncomingMessage(message, options = {}) {
  const normalized = {
    id: message.id,
    from: message.from,
    profileName: message.profileName || "",
    type: message.type || "unknown",
    text: message.text || "",
    timestamp: message.timestamp || Math.floor(Date.now() / 1000).toString(),
    source: options.source || "unknown",
    raw: message.raw || null
  };
  const existingLead = await leadStorage.getLeadByFrom(normalized.from);

  if (normalized.type !== "text") {
    const savedMessage = await leadStorage.saveMessage(normalized);

    if (savedMessage.duplicate) {
      logger.info("Duplicate message ignored", { messageId: normalized.id, from: mask(normalized.from) });
      return {
        ok: true,
        duplicate: true,
        message: normalized,
        lead: existingLead || { from: normalized.from, state: "first_contact" },
        reply: "",
        ai: { provider: "none", used: false }
      };
    }

    logger.info("Unsupported message type handled", { messageId: normalized.id, type: normalized.type, from: mask(normalized.from) });

    return {
      ok: true,
      message: normalized,
      lead: existingLead || { from: normalized.from, state: "first_contact" },
      reply: "Ahora mismo puedo ayudarte mejor si me escribes el caso en texto. ¿Qué tarea repetitiva te gustaría automatizar?",
      ai: { provider: "none", used: false }
    };
  }

  const detectedLead = detectBasicLeadData(normalized, existingLead);

  const savedMessage = await leadStorage.saveMessage(normalized);

  if (savedMessage.duplicate) {
    logger.info("Duplicate message ignored", { messageId: normalized.id, from: mask(normalized.from) });
    return {
      ok: true,
      duplicate: true,
      message: normalized,
      lead: existingLead || detectedLead,
      reply: "",
      ai: { provider: "none", used: false }
    };
  }

  const lead = await leadStorage.upsertLead(detectedLead);
  logger.info("Incoming message processed", { messageId: normalized.id, from: mask(normalized.from), state: lead.state });

  let reply = fallbackReply;
  let ai = { provider: "fallback", used: false };

  if (lead.state === "requires_human") {
    reply = humanRequestPattern.test(normalized.text)
      ? "Perfecto, lo dejo marcado para revisión humana. ¿Cuál es el mejor horario para contactarte?"
      : "Gracias, queda anotado para revisión humana. Te contactaremos en cuanto sea posible.";
    return {
      ok: true,
      message: normalized,
      lead,
      reply,
      ai
    };
  }

  if (lead.volumen && /^\s*\d{1,4}\s*$/.test(normalized.text) && /reservas|citas|mensajes|llamadas|whatsapp|correo/i.test(lead.problema || "")) {
    reply = `Con unas ${lead.volumen} reservas, ya tiene sentido revisar una automatización sencilla para ${lead.problema}. ¿Quieres que lo dejemos preparado para revisión humana?`;
    return {
      ok: true,
      message: normalized,
      lead,
      reply,
      ai
    };
  }

  try {
    const response = await aiClient.generateReply({
      message: normalized,
      lead,
      nextQuestion: getNextQuestion(lead)
    });

    if (response && response.text) {
      reply = response.text;
      ai = { provider: response.provider, model: response.model || "", used: true };
    }
  } catch (error) {
    logger.warn("AI provider failed; fallback reply used", { error: error.message });
  }

  return {
    ok: true,
    message: normalized,
    lead,
    reply,
    ai
  };
}

function detectBasicLeadData(message, existingLead = {}) {
  existingLead = existingLead || {};
  const text = message.text || "";
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phone = text.match(/(?:\+?34\s?)?(?:[6-9]\d{2}[\s.-]?\d{3}[\s.-]?\d{3})/);
  const name = text.match(/(?:me llamo|soy|mi nombre es)\s+([a-zA-ZÀ-ÿ\s]{2,40})/i);
  const sector = detectSector(text) || existingLead.sector || "";
  const negocio = detectBusiness(text, sector) || existingLead.negocio || "";
  const problema = detectProblem(text) || existingLead.problema || "";
  const urgencia = detectUrgency(text) || existingLead.urgencia || "";
  const volumen = detectVolume(text, { ...existingLead, problema }) || existingLead.volumen || "";
  const state = detectState(text, { ...existingLead, sector, negocio, problema, urgencia, volumen });

  return {
    from: message.from,
    profileName: message.profileName,
    email: email ? email[0] : "",
    phone: phone ? phone[0].replace(/[\s.-]/g, "") : message.from,
    name: name ? name[1].trim() : message.profileName,
    sector,
    negocio,
    problema,
    urgencia,
    volumen,
    resumen: buildSummary({ sector, negocio, problema, urgencia, volumen }),
    state,
    requiresHumanReason: state === "requires_human" ? detectHumanReason(text, existingLead) : existingLead.requiresHumanReason || "",
    lastMessage: text,
    lastSource: message.source
  };
}

function detectSector(text) {
  const match = sectors.find((sector) => sector.pattern.test(text));
  return match ? match.key : "";
}

function detectBusiness(text, sector) {
  if (sector && /\b(tengo|llevo|gestiono|tenemos)\b/i.test(text)) return sector;

  const business = text.match(/(?:tengo|llevo|gestiono|mi negocio es|tenemos)\s+(?:una|un|el|la)?\s*([a-zA-ZÀ-ÿ\s]{3,50}?)(?:\s+y\s+|,|\.|$)/i);
  if (business) return business[1].trim();
  return sector || "";
}

function detectProblem(text) {
  const problem = text.match(/(?:problema|necesito automatizar|quiero automatizar|quiero reducir|me cuesta|pierdo tiempo|tardo mucho|muchos mensajes|muchas llamadas|citas|reservas|recordatorios|whatsapp|seguimiento)(.*)/i);
  return problem ? problem[0].trim().slice(0, 180) : "";
}

function detectUrgency(text) {
  if (/\b(urgente|cuanto antes|hoy|mañana|esta semana|ya)\b/i.test(text)) return "alta";
  if (/\b(este mes|pronto|en unas semanas)\b/i.test(text)) return "media";
  return "";
}

function detectVolume(text, lead) {
  const explicit = text.match(/\b(\d{1,4})\s*(?:reservas|citas|mensajes|llamadas)\b/i);
  if (explicit) return explicit[1];

  if (/^\s*\d{1,4}\s*$/.test(text) && /reservas|citas|mensajes|llamadas|whatsapp|correo/i.test(lead.problema || "")) {
    return text.trim();
  }

  return "";
}

function detectState(text, lead) {
  if (lead.state === "requires_human") return "requires_human";
  if (humanRequestPattern.test(text)) return "requires_human";
  if (lead.sector && lead.problema) return "qualified";
  if (lead.sector || lead.negocio || lead.problema || lead.email) return "collecting_info";
  return "first_contact";
}

function detectHumanReason(text, existingLead) {
  if (existingLead.requiresHumanReason) return existingLead.requiresHumanReason;
  if (/ll[aá]mame|llamarme/i.test(text)) return "requested_call";
  if (/humano|persona|quiero hablar|hablar contigo/i.test(text)) return "requested_human";
  return "manual_review";
}

function buildSummary(lead) {
  const parts = [];
  if (lead.sector) parts.push(`Sector: ${lead.sector}`);
  if (lead.negocio) parts.push(`Negocio: ${lead.negocio}`);
  if (lead.problema) parts.push(`Problema: ${lead.problema}`);
  if (lead.volumen) parts.push(`Volumen aproximado: ${lead.volumen}`);
  if (lead.urgencia) parts.push(`Urgencia: ${lead.urgencia}`);
  return parts.join(". ");
}

function getNextQuestion(lead) {
  if (!lead.sector) return "¿Qué tipo de negocio tienes?";
  if (!lead.problema) return "¿Qué tarea repetitiva te gustaría reducir primero?";
  if (!lead.urgencia) return "¿Te gustaría revisarlo esta semana o más adelante?";
  return "¿Quieres que lo revisemos con más detalle?";
}

function mask(value = "") {
  return value.length > 4 ? `${value.slice(0, 3)}***${value.slice(-2)}` : value;
}

module.exports = {
  processIncomingMessage,
  detectBasicLeadData
};
