const BaseProvider = require("./baseProvider");

class OllamaProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.name = "ollama";
    this.baseUrl = config.apiBaseUrl || "http://localhost:11434";
    this.model = config.model;
  }

  async generateReply(input) {
    if (!this.model) {
      throw new Error("AI_MODEL is required for Ollama");
    }

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: this.buildNeutralMessages(input),
        stream: false
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    return {
      provider: this.name,
      text: data.message && data.message.content ? data.message.content : ""
    };
  }
}

module.exports = OllamaProvider;
