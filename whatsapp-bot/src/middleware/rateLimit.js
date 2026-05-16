const logger = require("../services/logger");

function createRateLimiter({ windowMs, max, name = "rate" }) {
  const hits = new Map();
  let lastSweep = Date.now();

  return function rateLimit(req, res, next) {
    const now = Date.now();

    if (now - lastSweep > windowMs) {
      for (const [key, entry] of hits) {
        if (now - entry.start > windowMs) hits.delete(key);
      }
      lastSweep = now;
    }

    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const key = String(ip);
    const entry = hits.get(key);

    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { count: 1, start: now });
      return next();
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.start + windowMs - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      logger.warn(`Rate limit hit (${name})`, { ip: maskIp(key), count: entry.count });
      return res.status(429).json({ error: "rate_limited", retryAfter });
    }

    return next();
  };
}

function maskIp(ip) {
  if (!ip || ip === "unknown") return ip;
  const parts = String(ip).split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.x.x`;
  return ip.slice(0, 8) + "***";
}

module.exports = { createRateLimiter };
