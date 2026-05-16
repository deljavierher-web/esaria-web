const fs = require("fs/promises");
const path = require("path");
const messageProcessor = require("../src/services/messageProcessor");
const leadStorage = require("../src/services/leadStorage");

const dataDir = path.join(__dirname, "..", "data");
const messagesFile = path.join(dataDir, "messages.json");
const leadsFile = path.join(dataDir, "leads.json");
const statusesFile = path.join(dataDir, "statuses.json");

async function main() {
  const before = await counts();
  const runId = Date.now();

  const generic = await processMessage({
    id: `test-generic-${runId}`,
    from: `test-generic-${runId}`,
    profileName: "Test Generico",
    type: "text",
    text: "Hola, quiero saber como funciona",
    timestamp: now()
  });

  assert(generic.ok, "generic message failed");
  assert(generic.lead.state === "first_contact", "generic state should be first_contact");
  assert(generic.ai.used, "generic should use AI");

  const restaurant = await processMessage({
    id: `test-restaurant-${runId}`,
    from: `test-restaurant-${runId}`,
    profileName: "Test Restaurante",
    type: "text",
    text: "Tengo un restaurante y recibo muchas reservas por WhatsApp",
    timestamp: now()
  });

  assert(restaurant.ok, "restaurant message failed");
  assert(restaurant.lead.sector === "hosteleria", "restaurant should map to hosteleria");
  assert(restaurant.lead.state === "qualified", "restaurant should be qualified");
  assert(restaurant.ai.used, "restaurant should use AI");

  const human = await processMessage({
    id: `test-human-${runId}`,
    from: `test-human-${runId}`,
    profileName: "Test Humano",
    type: "text",
    text: "Quiero hablar contigo, llámame",
    timestamp: now()
  });

  assert(human.ok, "human message failed");
  assert(human.lead.state === "requires_human", "human should require human");
  assert(!human.ai.used, "human should not use AI");

  const humanFollowUp = await processMessage({
    id: `test-human-followup-${runId}`,
    from: `test-human-${runId}`,
    profileName: "Test Humano",
    type: "text",
    text: "Me viene bien por la tarde",
    timestamp: now()
  });

  assert(humanFollowUp.lead.state === "requires_human", "requires_human should persist");
  assert(!humanFollowUp.ai.used, "requires_human follow-up should not use AI");

  const duplicate = await processMessage({
    id: `test-duplicate-${runId}`,
    from: `test-duplicate-${runId}`,
    profileName: "Test Duplicado",
    type: "text",
    text: "Tengo una clínica y muchas citas manuales",
    timestamp: now()
  });
  const duplicateAgain = await processMessage({
    id: `test-duplicate-${runId}`,
    from: `test-duplicate-${runId}`,
    profileName: "Test Duplicado",
    type: "text",
    text: "Tengo una clínica y muchas citas manuales",
    timestamp: now()
  });

  assert(duplicate.ok, "duplicate first message failed");
  assert(duplicateAgain.duplicate, "duplicate should be ignored");

  const image = await processMessage({
    id: `test-image-${runId}`,
    from: `test-image-${runId}`,
    profileName: "Test Imagen",
    type: "image",
    text: "",
    timestamp: now()
  });

  assert(image.ok, "image message failed");
  assert(!image.ai.used, "non-text should not use AI");

  const status = await leadStorage.saveStatus({
    id: `test-status-${runId}`,
    recipientId: `test-generic-${runId}`,
    status: "delivered",
    timestamp: now(),
    raw: { status: "delivered" }
  });

  assert(status.status === "delivered", "status should be saved");

  const after = await counts();
  const restaurantConversation = await readJson(
    path.join(dataDir, "conversations", safeContactId(`test-restaurant-${runId}`), "messages.json"),
    []
  );
  const restaurantProfile = await readJson(
    path.join(dataDir, "conversations", safeContactId(`test-restaurant-${runId}`), "profile.json"),
    null
  );

  assert(after.messages >= before.messages + 6, "messages should increase for non-duplicate inputs");
  assert(after.leads >= before.leads + 4, "leads should increase for new text contacts");
  assert(after.statuses >= before.statuses + 1, "statuses should increase");
  assert(restaurantConversation.length >= 1, "conversation messages should be stored per contact");
  assert(restaurantProfile && restaurantProfile.sector === "hosteleria", "conversation profile should be stored per contact");

  console.log(JSON.stringify({
    ok: true,
    provider: restaurant.ai.provider,
    model: restaurant.ai.model,
    before,
    after,
    checks: [
      "generic",
      "restaurant_sector",
      "requires_human",
      "requires_human_persistence",
      "duplicate",
      "non_text",
      "status_saved",
      "conversation_files"
    ]
  }, null, 2));
}

async function processMessage(message) {
  return messageProcessor.processIncomingMessage(message, { source: "test" });
}

async function counts() {
  const [messages, leads, statuses] = await Promise.all([
    readJson(messagesFile),
    readJson(leadsFile),
    readJson(statusesFile)
  ]);

  return { messages: messages.length, leads: leads.length, statuses: statuses.length };
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function now() {
  return Math.floor(Date.now() / 1000).toString();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function safeContactId(value = "") {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "_");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
