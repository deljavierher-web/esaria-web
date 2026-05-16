const express = require("express");
const config = require("./config");
const logger = require("./services/logger");
const telegramClient = require("./services/telegramClient");
const webhookRoutes = require("./routes/webhook");
const demoRoutes = require("./routes/demo");
const adminRoutes = require("./routes/admin");
const verifyMetaSignature = require("./middleware/verifyMetaSignature");
const { createRateLimiter } = require("./middleware/rateLimit");
const adminAuth = require("./middleware/adminAuth");

const app = express();

app.set("trust proxy", true);

const jsonParser = express.json({
  limit: "1mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
});

app.get("/", (_req, res) => res.redirect("/admin/"));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "esaria-whatsapp-bot",
    aiProvider: config.ai.provider,
    storageType: config.storage.type
  });
});

const webhookLimiter = createRateLimiter({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  name: "webhook"
});

const demoLimiter = createRateLimiter({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.demoMax,
  name: "demo"
});

app.use("/webhook", webhookLimiter, jsonParser, verifyMetaSignature, webhookRoutes);
app.use("/demo-message", demoLimiter, jsonParser, demoRoutes);
const adminLimiter = createRateLimiter({
  windowMs: config.rateLimit.windowMs,
  max: 120,
  name: "admin"
});

app.use("/admin", adminLimiter, adminAuth, adminRoutes);

app.use((err, req, res, next) => {
  logger.error("Unhandled error", err);
  res.status(500).json({ error: "internal_error" });
});

app.listen(config.port, () => {
  logger.info(`WhatsApp bot listening on port ${config.port}`);
  telegramClient.startPolling();
});
