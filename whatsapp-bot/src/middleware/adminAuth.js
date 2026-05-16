const express = require("express");
const crypto = require("crypto");
const config = require("../config");
const logger = require("../services/logger");
const { createRateLimiter } = require("./rateLimit");

const loginLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  name: "admin-login"
});

function adminAuth(req, res, next) {
  const expected = config.admin.token;

  if (!expected) {
    if (!global.__adminAuthWarned) {
      logger.warn("ADMIN_TOKEN not set; /admin is unprotected. Set ADMIN_TOKEN in .env to enable auth.");
      global.__adminAuthWarned = true;
    }
    return next();
  }

  if (req.path === "/login" && req.method === "POST") {
    return loginLimiter(req, res, () => handleLogin(req, res, expected));
  }

  if (req.path === "/logout") {
    res.clearCookie("admin_session", { path: "/admin" });
    return res.redirect("/admin/");
  }

  const provided =
    req.get("x-admin-token") ||
    (req.query && req.query.token) ||
    parseCookieToken(req.get("cookie"));

  if (provided && safeEqual(provided, expected)) return next();

  if (req.path === "/" || req.path === "" || req.path.endsWith(".html")) {
    return res.status(401).type("html").send(renderLogin(req));
  }

  return res.status(401).json({ error: "unauthorized" });
}

function handleLogin(req, res, expected) {
  return express.urlencoded({ extended: false })(req, res, () => {
    const submitted = (req.body && req.body.token) || "";
    if (!safeEqual(submitted, expected)) {
      logger.warn("Admin login failed", {
        ip: maskIp(req.ip),
        ua: (req.get("user-agent") || "").slice(0, 80)
      });
      return res.status(401).type("html").send(renderLogin(req, true));
    }

    logger.info("Admin login OK", { ip: maskIp(req.ip) });

    const secureFlag = isSecureRequest(req) ? "; Secure" : "";
    res.setHeader("Set-Cookie",
      `admin_session=${encodeURIComponent(expected)}; Path=/admin; Max-Age=43200; HttpOnly; SameSite=Strict${secureFlag}`
    );
    return res.redirect("/admin/");
  });
}

function isSecureRequest(req) {
  if (req.secure) return true;
  return (req.get("x-forwarded-proto") || "").split(",")[0].trim() === "https";
}

function parseCookieToken(cookie) {
  if (!cookie) return "";
  const match = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function maskIp(ip) {
  if (!ip) return "unknown";
  const parts = String(ip).split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.x.x`;
  return String(ip).slice(0, 8) + "***";
}

function renderLogin(_req, failed = false) {
  return `<!doctype html><meta charset="utf-8"><title>EsarIA admin</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<style>body{font-family:system-ui;background:#0F172A;color:#F8FAFC;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px}
form{background:#1e293b;padding:32px;border-radius:12px;display:flex;flex-direction:column;gap:12px;width:100%;max-width:340px}
input{padding:12px;border:1px solid #334155;background:#0F172A;color:#F8FAFC;border-radius:6px;font-size:16px}
button{padding:12px;background:#6D5EF3;color:#fff;border:0;border-radius:6px;cursor:pointer;font-weight:600;font-size:15px}
.err{color:#fca5a5;font-size:13px;margin:0}
.hint{color:#64748b;font-size:11px;margin:8px 0 0 0;text-align:center}</style>
<form method="POST" action="/admin/login" autocomplete="off">
  <h2 style="margin:0">EsarIA admin</h2>
  ${failed ? '<p class="err">Token incorrecto</p>' : ''}
  <input name="token" type="password" placeholder="Admin token" autofocus required>
  <button>Entrar</button>
  <p class="hint">Acceso restringido</p>
</form>`;
}

module.exports = adminAuth;
