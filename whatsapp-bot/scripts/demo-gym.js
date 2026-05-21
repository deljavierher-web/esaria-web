const port = process.env.PORT || 3000;

async function main() {
  const start = Date.now();
  const response = await fetch(`http://localhost:${port}/demo-message/gym`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "María Carmen",
      date: new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Error al disparar la demo de gimnasio:", data);
    process.exit(1);
  }

  data.latencyMs = Date.now() - start;
  console.log("¡Demo de Gimnasio (Google Calendar) disparada con éxito!");
  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
