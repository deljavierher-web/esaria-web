const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const config = require("../config");
const logger = require("../services/logger");
const leadStorage = require("../services/leadStorage");
const whatsappClient = require("../services/whatsappClient");

const router = express.Router();
const dataDir = path.join(__dirname, "..", "..", "data");
const leadsFile = path.join(dataDir, "leads.json");
const publicDir = path.join(__dirname, "..", "public");

router.get("/", (_req, res) => res.sendFile(path.join(publicDir, "admin.html")));
router.get("/admin.html", (_req, res) => res.sendFile(path.join(publicDir, "admin.html")));

router.get("/api/leads", async (req, res, next) => {
  try {
    const all = await readJson(leadsFile, []);
    const state = (req.query.state || "").toString();
    const q = (req.query.q || "").toString().toLowerCase();
    const limit = Math.min(Number(req.query.limit) || 200, 500);

    let filtered = all;
    if (state) filtered = filtered.filter((l) => l.state === state);
    if (q) {
      filtered = filtered.filter((l) =>
        [l.from, l.phone, l.name, l.profileName, l.sector, l.negocio, l.problema, l.lastMessage]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    const sorted = filtered.sort((a, b) =>
      String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))
    );

    res.json({
      total: filtered.length,
      grandTotal: all.length,
      leads: sorted.slice(0, limit)
    });
  } catch (err) {
    next(err);
  }
});

router.get("/api/stats", async (_req, res, next) => {
  try {
    const all = await readJson(leadsFile, []);
    const byState = {};
    const bySector = {};
    for (const l of all) {
      byState[l.state || "unknown"] = (byState[l.state || "unknown"] || 0) + 1;
      if (l.sector) bySector[l.sector] = (bySector[l.sector] || 0) + 1;
    }
    res.json({ total: all.length, byState, bySector });
  } catch (err) {
    next(err);
  }
});

router.get("/api/conversation/:phone", async (req, res, next) => {
  try {
    const conv = await leadStorage.getConversation(req.params.phone);
    const lead = await leadStorage.getLeadByFrom(req.params.phone);
    res.json({ lead, ...conv });
  } catch (err) {
    next(err);
  }
});

router.post("/api/reply", express.json({ limit: "200kb" }), async (req, res, next) => {
  try {
    const { to, text } = req.body || {};
    if (!to || !text) return res.status(400).json({ error: "to_and_text_required" });
    if (String(text).length > 1000) return res.status(400).json({ error: "text_too_long" });

    const sent = await whatsappClient.sendTextMessage(to, text);
    if (sent && sent.skipped) {
      return res.status(503).json({ error: "whatsapp_not_configured", reason: sent.reason });
    }
    const outboundId = sent.messages && sent.messages[0] ? sent.messages[0].id : undefined;

    await leadStorage.saveOutboundMessage({
      id: outboundId,
      from: config.whatsapp.phoneNumberId,
      to,
      type: "text",
      text,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      source: "admin",
      deliveryStatus: outboundId ? "accepted" : "unknown"
    });

    logger.info("Admin reply sent", { to: maskPhone(to) });
    res.json({ ok: true, id: outboundId });
  } catch (err) {
    logger.error("Admin reply failed", { error: err.message });
    next(err);
  }
});

router.post("/api/mark-human", express.json(), async (req, res, next) => {
  try {
    const { phone, reason } = req.body || {};
    if (!phone) return res.status(400).json({ error: "phone_required" });

    const existing = await leadStorage.getLeadByFrom(phone);
    if (!existing) return res.status(404).json({ error: "lead_not_found" });

    const updated = await leadStorage.upsertLead({
      ...existing,
      state: "requires_human",
      requiresHumanReason: reason || existing.requiresHumanReason || "admin_marked"
    });

    res.json({ ok: true, lead: updated });
  } catch (err) {
    next(err);
  }
});

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

function maskPhone(value = "") {
  const t = String(value);
  return t.length > 4 ? `${t.slice(0, 3)}***${t.slice(-2)}` : t;
}

module.exports = router;
