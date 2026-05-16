const telegramClient = require("../src/services/telegramClient");

async function main() {
  const enabled = telegramClient.isEnabled();

  if (!enabled) {
    await telegramClient.notifyIncomingMessage(
      { from: "34600000000", profileName: "Demo", type: "text", text: "Hola" },
      { lead: { name: "Demo", state: "first_contact" } }
    );
  }

  console.log(JSON.stringify({ ok: true, enabled }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
