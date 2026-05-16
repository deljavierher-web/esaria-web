# Bot de WhatsApp de EsarIA

Base tecnica modular para recibir mensajes desde WhatsApp Cloud API, guardarlos y preparar una capa de IA intercambiable sin elegir todavia un proveedor definitivo.

Esta carpeta no contiene claves reales, prompts finales de venta ni estrategia comercial cerrada.

## 1. Instalacion

```bash
cd whatsapp-bot
npm install
cp .env.example .env
```

Arrancar en local:

```bash
npm run dev
```

Comprobar salud del servicio:

```bash
curl http://localhost:3000/health
```

## 2. Configurar `.env`

Copia `.env.example` a `.env` y rellena solo lo necesario.

```bash
PORT=3000
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_VERIFY_TOKEN=

AI_PROVIDER=mock
AI_MODEL=
AI_API_BASE_URL=
AI_API_KEY=

STORAGE_TYPE=json
```

Para empezar, deja `AI_PROVIDER=mock`.

## 3. Probar modo demo

Con el servidor arrancado:

```bash
npm run test:demo
```

Tambien puedes probar con `curl`:

```bash
curl -X POST http://localhost:3000/demo-message \
  -H "Content-Type: application/json" \
  -d '{"from":"34600000000","name":"Demo","text":"Hola, soy Javier. Mi email es demo@example.com"}'
```

El modo demo guarda el mensaje en `data/messages.json`, actualiza `data/leads.json` y devuelve una respuesta temporal.

## 4. Conectar Meta Webhooks

En Meta Developers, dentro de la app `EsarIA Bot`, configura el webhook de WhatsApp con:

```text
Callback URL: https://TU-DOMINIO/webhook
Verify token: el valor de WHATSAPP_VERIFY_TOKEN
```

El endpoint `GET /webhook` valida `hub.mode`, `hub.verify_token` y responde con `hub.challenge`.

El endpoint `POST /webhook` recibe mensajes reales, los guarda, intenta generar respuesta y envia un mensaje de vuelta por WhatsApp Cloud API.

Para probar desde local con Meta necesitas exponer el puerto con una URL HTTPS, por ejemplo con ngrok, Cloudflare Tunnel u otra alternativa similar.

## 5. Datos necesarios de Meta

Necesitas estos valores:

- `WHATSAPP_ACCESS_TOKEN`: token temporal o permanente de WhatsApp Cloud API.
- `WHATSAPP_PHONE_NUMBER_ID`: ID del numero de telefono emisor.
- `WHATSAPP_BUSINESS_ACCOUNT_ID`: ID de la cuenta de WhatsApp Business.
- `WHATSAPP_VERIFY_TOKEN`: texto propio para verificar el webhook.

No guardes claves reales en git. Usa `.env`, que esta ignorado por `.gitignore`.

## 6. Cambiar `AI_PROVIDER`

Proveedor activo:

```bash
AI_PROVIDER=mock
```

Valores previstos:

- `mock`: respuesta de prueba sin llamadas externas.
- `ollama`: llamada local a Ollama.
- `deepseek`: llamada compatible con DeepSeek.
- `opencode_go`: llamada compatible con una API OpenCode Go/OpenAI-compatible configurada por URL.

La seleccion del modelo queda fuera del codigo. Se controla con variables de entorno.

## 7. Conectar Ollama mas adelante

Ejemplo orientativo:

```bash
AI_PROVIDER=ollama
AI_MODEL=nombre-del-modelo-local
AI_API_BASE_URL=http://localhost:11434
```

El adaptador usa `/api/chat` de Ollama. No obliga a usar ningun modelo concreto.

## 8. Conectar DeepSeek u OpenCode Go mas adelante

Para DeepSeek:

```bash
AI_PROVIDER=deepseek
AI_MODEL=nombre-del-modelo
AI_API_BASE_URL=https://api.deepseek.com
AI_API_KEY=tu_api_key
```

Para OpenCode Go o una API compatible:

```bash
AI_PROVIDER=opencode_go
AI_MODEL=nombre-del-modelo
AI_API_BASE_URL=https://tu-api-compatible/v1
AI_API_KEY=tu_api_key
```

Ambos adaptadores estan preparados para endpoints tipo `/chat/completions`. Si la API final cambia de contrato, solo habra que ajustar el provider correspondiente.

## 9. Pendiente antes de produccion

- Sustituir tokens temporales de Meta por credenciales estables y seguras.
- Anadir persistencia real si el volumen crece, por ejemplo SQLite, Postgres o una base gestionada.
- Validar firma de Meta si se requiere mayor seguridad.
- Evitar duplicados por `message.id`.
- Definir estrategia conversacional, prompts finales y criterios de derivacion humana.
- Anadir control de errores, reintentos y limites de frecuencia.
- Anadir tests automatizados para webhooks, almacenamiento y providers.
- Revisar privacidad, consentimiento y retencion de datos.

## Estructura

```text
whatsapp-bot/
  data/
    leads.json
    messages.json
  scripts/
    test-demo.js
  src/
    ai/
      aiClient.js
      providers/
        baseProvider.js
        mockProvider.js
        ollamaProvider.js
        deepseekProvider.js
        opencodeGoProvider.js
    routes/
      demo.js
      webhook.js
    services/
      leadStorage.js
      logger.js
      messageProcessor.js
      whatsappClient.js
    config.js
    server.js
```
