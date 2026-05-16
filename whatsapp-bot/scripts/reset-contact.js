const fs = require("fs/promises");
const path = require("path");

const contact = process.argv[2];

if (!contact) {
  console.error("Uso: npm run reset:contact -- <telefono>");
  process.exit(1);
}

const dataDir = path.join(__dirname, "..", "data");
const leadsFile = path.join(dataDir, "leads.json");
const contactDir = path.join(dataDir, "conversations", safeContactId(contact));
const archiveDir = path.join(dataDir, "archive", `${safeContactId(contact)}-${timestamp()}`);

async function main() {
  let archived = false;

  if (await exists(contactDir)) {
    await fs.mkdir(path.dirname(archiveDir), { recursive: true });
    await fs.rename(contactDir, archiveDir);
    archived = true;
  }

  const leads = await readJson(leadsFile, []);
  const remaining = leads.filter((lead) => lead.from !== contact);
  await writeJson(leadsFile, remaining);

  console.log(JSON.stringify({
    contact: mask(contact),
    archived,
    archiveDir: archived ? archiveDir : null,
    leadRemoved: remaining.length !== leads.length
  }, null, 2));
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(file, data) {
  const tempFile = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await fs.rename(tempFile, file);
}

function safeContactId(value = "") {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function mask(value = "") {
  const text = String(value || "");
  return text.length > 4 ? `${text.slice(0, 3)}***${text.slice(-2)}` : text;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
