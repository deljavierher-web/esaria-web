async function testOllama() {
  const url = 'http://127.0.0.1:11434/api/chat';
  
  // Usar phi4-mini:latest o qwen2.5:1.5b
  const payload = {
    model: 'phi4-mini:latest',
    messages: [
      {
        role: 'system',
        content: `Eres un asistente de IA experto en extracción de datos. Tu tarea es extraer información de reservas de citas del texto provisto por el usuario.
Debes responder ÚNICAMENTE con un objeto JSON válido con los siguientes campos:
- "name": El nombre del cliente.
- "service": El tipo de clase o servicio (ej. "boxeo", "pilates", "yoga").
- "date": La fecha en formato DD/MM/YYYY.
- "time": La hora de la cita en formato HH:MM (formato 24 horas, ej. "18:00").

Fecha de referencia actual para calcular fechas relativas: Jueves 21 de Mayo de 2026.
No añadas texto de introducción ni bloques de código markdown, responde solo con el JSON.`
      },
      {
        role: 'user',
        content: 'Javier tiene una cita de clase de boxeo a las 6 de la tarde el 28 de mayo'
      }
    ],
    stream: false,
    options: {
      temperature: 0
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    console.log('Ollama Response:', result.message.content);
  } catch (error) {
    console.error('Error con Ollama:', error);
  }
}

testOllama();
