require("dotenv").config();

const config = {
  port: Number(process.env.PORT || 3000),
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "",
    appSecret: process.env.WHATSAPP_APP_SECRET || "",
    requireSignature: process.env.WHATSAPP_REQUIRE_SIGNATURE === "true"
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
    max: Number(process.env.RATE_LIMIT_MAX || 60),
    demoMax: Number(process.env.RATE_LIMIT_DEMO_MAX || 20)
  },
  ai: {
    provider: process.env.AI_PROVIDER || "mock",
    model: process.env.AI_MODEL || "",
    apiBaseUrl: process.env.AI_API_BASE_URL || "",
    apiKey: process.env.AI_API_KEY || ""
  },
  storage: {
    type: process.env.STORAGE_TYPE || "json"
  },
  admin: {
    token: process.env.ADMIN_TOKEN || ""
  },
  telegram: {
    enabled: process.env.TELEGRAM_ENABLED === "true",
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || ""
  }
};

module.exports = config;
