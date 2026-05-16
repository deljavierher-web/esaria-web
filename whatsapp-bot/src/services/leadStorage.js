const fs = require("fs/promises");
const path = require("path");

const dataDir = path.join(__dirname, "..", "..", "data");
const messagesFile = path.join(dataDir, "messages.json");
const leadsFile = path.join(dataDir, "leads.json");
const statusesFile = path.join(dataDir, "statuses.json");
const conversationsDir = path.join(dataDir, "conversations");
let storageQueue = Promise.resolve();

function withStorageLock(operation) {
  const next = storageQueue.then(operation, operation);
  storageQueue = next.catch(() => {});
  return next;
}

async function readJson(file, fallback) {
  try {
    const content = await fs.readFile(file, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tempFile = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await fs.rename(tempFile, file);
}

async function saveMessage(message) {
  return withStorageLock(() => saveMessageUnlocked(message));
}

async function saveMessageUnlocked(message) {
  const messages = await readJson(messagesFile, []);

  if (messages.some((item) => item.id && item.id === message.id)) {
    return { duplicate: true, message: messages.find((item) => item.id === message.id) };
  }

  const record = {
    ...message,
    savedAt: new Date().toISOString()
  };

  messages.push(record);
  await writeJson(messagesFile, messages);
  await saveConversationMessage(record);
  return record;
}

async function saveOutboundMessage(message) {
  const id = message.id || `outbound-${Date.now()}`;
  return saveMessage({
    ...message,
    id,
    direction: "outbound",
    source: message.source || "whatsapp"
  });
}

async function saveStatus(status) {
  return withStorageLock(() => saveStatusUnlocked(status));
}

async function saveStatusUnlocked(status) {
  const statuses = await readJson(statusesFile, []);
  const record = {
    ...status,
    savedAt: new Date().toISOString()
  };

  statuses.push(record);
  await writeJson(statusesFile, statuses);
  await saveConversationStatus(record);
  await updateMessageStatusUnlocked(status.id, status.status);
  return record;
}

async function updateMessageStatus(messageId, status) {
  return withStorageLock(() => updateMessageStatusUnlocked(messageId, status));
}

async function updateMessageStatusUnlocked(messageId, status) {
  if (!messageId || !status) return null;

  const messages = await readJson(messagesFile, []);
  const index = messages.findIndex((message) => message.id === messageId);

  if (index < 0) return null;

  messages[index] = {
    ...messages[index],
    deliveryStatus: status,
    deliveryStatusAt: new Date().toISOString()
  };

  await writeJson(messagesFile, messages);
  return messages[index];
}

async function getLeadByFrom(from) {
  const leads = await readJson(leadsFile, []);
  return leads.find((item) => item.from === from) || null;
}

async function listLeads(limit = 10) {
  const leads = await readJson(leadsFile, []);
  return leads
    .slice()
    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))
    .slice(0, limit);
}

async function getConversation(contactId) {
  const dir = getConversationDir(contactId);

  return {
    profile: await readJson(path.join(dir, "profile.json"), null),
    messages: await readJson(path.join(dir, "messages.json"), []),
    statuses: await readJson(path.join(dir, "statuses.json"), [])
  };
}

async function upsertLead(lead) {
  return withStorageLock(() => upsertLeadUnlocked(lead));
}

async function upsertLeadUnlocked(lead) {
  const leads = await readJson(leadsFile, []);
  const index = leads.findIndex((item) => item.from === lead.from);
  const now = new Date().toISOString();

  if (index >= 0) {
    leads[index] = {
      ...leads[index],
      ...removeEmptyValues(lead),
      updatedAt: now
    };
    await writeJson(leadsFile, leads);
    await saveConversationProfile(leads[index]);
    return leads[index];
  }

  const record = {
    ...removeEmptyValues(lead),
    createdAt: now,
    updatedAt: now
  };

  leads.push(record);
  await writeJson(leadsFile, leads);
  await saveConversationProfile(record);
  return record;
}

async function saveConversationMessage(message) {
  const contactId = getContactId(message);
  if (!contactId) return;

  const file = path.join(getConversationDir(contactId), "messages.json");
  const messages = await readJson(file, []);

  if (!messages.some((item) => item.id && item.id === message.id)) {
    messages.push(message);
    await writeJson(file, messages);
  }
}

async function saveConversationStatus(status) {
  const contactId = status.recipientId;
  if (!contactId) return;

  const file = path.join(getConversationDir(contactId), "statuses.json");
  const statuses = await readJson(file, []);
  statuses.push(status);
  await writeJson(file, statuses);
}

async function saveConversationProfile(lead) {
  if (!lead.from) return;

  const file = path.join(getConversationDir(lead.from), "profile.json");
  await writeJson(file, lead);
}

function getContactId(message) {
  if (message.direction === "outbound") return message.to;
  return message.from;
}

function getConversationDir(contactId) {
  return path.join(conversationsDir, safeContactId(contactId));
}

function safeContactId(value = "") {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function removeEmptyValues(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

module.exports = {
  getConversation,
  getLeadByFrom,
  listLeads,
  saveMessage,
  saveOutboundMessage,
  saveStatus,
  upsertLead
};
