const fs = require("fs");
const os = require("os");
const path = require("path");
const BaseProvider = require("./baseProvider");

class OpenCodeGoProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.name = "opencode_go";
    this.baseUrl = config.apiBaseUrl || "https://opencode.ai/zen/go/v1";
    this.model = config.model;
    this.apiKey = config.apiKey || readLocalOpenCodeGoKey();
  }

  async generateReply(input) {
    if (!this.model || !this.apiKey) {
      throw new Error("AI_MODEL and OpenCode Go credentials are required");
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      signal: AbortSignal.timeout(35000),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        messages: this.buildNeutralMessages(input),
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(`OpenCode Go request failed: ${response.status}`);
    }

    const choice = data.choices && data.choices[0];
    const message = choice && choice.message ? choice.message : {};
    let text = (message.content || "").trim();

    if (!text && choice && choice.finish_reason === "length") {
      throw new Error("OpenCode Go ran out of tokens before producing content (raise max_tokens)");
    }

    if (!text) {
      throw new Error("OpenCode Go returned an empty response");
    }

    return {
      provider: this.name,
      model: data.model || this.model,
      text
    };
  }
}

function readLocalOpenCodeGoKey() {
  try {
    const authPath = path.join(os.homedir(), ".local", "share", "opencode", "auth.json");
    const auth = JSON.parse(fs.readFileSync(authPath, "utf8"));
    return auth["opencode-go"] && auth["opencode-go"].key ? auth["opencode-go"].key : "";
  } catch {
    return "";
  }
}

module.exports = OpenCodeGoProvider;
