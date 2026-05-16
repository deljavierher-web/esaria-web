const config = require("../config");
const MockProvider = require("./providers/mockProvider");
const OllamaProvider = require("./providers/ollamaProvider");
const DeepSeekProvider = require("./providers/deepseekProvider");
const OpenCodeGoProvider = require("./providers/opencodeGoProvider");

function createProvider() {
  switch (config.ai.provider) {
    case "mock":
      return new MockProvider(config.ai);
    case "ollama":
      return new OllamaProvider(config.ai);
    case "deepseek":
      return new DeepSeekProvider(config.ai);
    case "opencode_go":
      return new OpenCodeGoProvider(config.ai);
    default:
      throw new Error(`Unsupported AI_PROVIDER: ${config.ai.provider}`);
  }
}

async function generateReply(input) {
  const provider = createProvider();
  return provider.generateReply(input);
}

module.exports = {
  generateReply
};
