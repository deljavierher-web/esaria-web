const express = require("express");
const messageProcessor = require("../services/messageProcessor");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const text = req.body.text || req.body.message || "";
    const from = req.body.from || "demo-user";
    const profileName = req.body.name || "Demo";

    const result = await messageProcessor.processIncomingMessage(
      {
        id: `demo-${Date.now()}`,
        from,
        profileName,
        type: "text",
        text,
        timestamp: Math.floor(Date.now() / 1000).toString(),
        raw: req.body
      },
      { source: "demo" }
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
