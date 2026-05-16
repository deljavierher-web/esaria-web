const BaseProvider = require("./baseProvider");

class DeepSeekProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.name = "deepseek";
    this.baseUrl = config.apiBaseUrl || "https://api.deepseek.com";
    this.model = config.model;
    this.apiKey = config.apiKey;
  }

  async generateReply(input) {
    if (!this.model || !this.apiKey) {
      throw new Error("AI_MODEL and AI_API_KEY are required for DeepSeek");
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        messages: this.buildNeutralMessages(input),
        temperature: 0.2
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(`DeepSeek request failed: ${response.status}`);
    }

    return {
      provider: this.name,
      text: data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : ""
    };
  }
}

module.exports = DeepSeekProvider;
