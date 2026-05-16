const fs = require("fs/promises");
const path = require("path");

const contact = process.argv[2];

if (!contact) {
  console.error("Uso: npm run inspect:contact -- <telefono>");
  process.exit(1);
}

const dataDir = path.join(__dirname, "..", "data");
const contactDir = path.join(dataDir, "conversations", safeContactId(contact));

async function main() {
  const profile = await readJson(path.join(contactDir, "profile.json"), null);
  const messages = await readJson(path.join(contactDir, "messages.json"), []);
  const statuses = await readJson(path.join(contactDir, "statuses.json"), []);

  console.log(JSON.stringify({
    contact: mask(contact),
    exists: Boolean(profile || messages.length || statuses.length),
    profile: profile ? {
      name: profile.name,
      sector: profile.sector,
      negocio: profile.negocio,
      problema: profile.problema,
      volumen: profile.volumen,
      state: profile.state,
      updatedAt: profile.updatedAt
    } : null,
    messages: messages.slice(-20).map((message) => ({
      direction: message.direction || "inbound",
      type: message.type,
      text: message.text,
      deliveryStatus: message.deliveryStatus,
      savedAt: message.savedAt
    })),
    statuses: statuses.slice(-20).map((status) => ({
      status: status.status,
      savedAt: status.savedAt
    }))
  }, null, 2));
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function safeContactId(value = "") {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function mask(value = "") {
  const text = String(value || "");
  return text.length > 4 ? `${text.slice(0, 3)}***${text.slice(-2)}` : text;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
