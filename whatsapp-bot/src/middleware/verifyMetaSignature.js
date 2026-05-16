const crypto = require("crypto");
const config = require("../config");
const logger = require("../services/logger");

function verifyMetaSignature(req, res, next) {
  if (req.method !== "POST") return next();

  const appSecret = config.whatsapp.appSecret;

  if (!appSecret) {
    if (config.whatsapp.requireSignature) {
      logger.warn("WHATSAPP_APP_SECRET not set; rejecting webhook POST");
      return res.status(401).json({ error: "signature_required_but_secret_missing" });
    }
    logger.warn("WHATSAPP_APP_SECRET not set; signature check skipped");
    return next();
  }

  const header = req.get("x-hub-signature-256") || "";
  const rawBody = req.rawBody;

  if (!header || !header.startsWith("sha256=") || !rawBody) {
    logger.warn("Missing or invalid Meta signature header");
    return res.status(401).json({ error: "invalid_signature" });
  }

  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const provided = header.slice("sha256=".length);

  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");

  if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
    logger.warn("Meta signature mismatch");
    return res.status(401).json({ error: "invalid_signature" });
  }

  return next();
}

module.exports = verifyMetaSignature;
