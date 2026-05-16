const BaseProvider = require("./baseProvider");

class MockProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.name = "mock";
  }

  async generateReply() {
    return {
      provider: this.name,
      text: "Respuesta de prueba del bot de EsarIA. El proveedor de IA definitivo aun no esta configurado."
    };
  }
}

module.exports = MockProvider;
