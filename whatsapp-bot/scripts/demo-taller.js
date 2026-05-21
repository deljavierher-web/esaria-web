const port = process.env.PORT || 3000;

async function main() {
  const start = Date.now();
  const response = await fetch(`http://localhost:${port}/demo-message/taller`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Manuel",
      car: "Ford Focus",
      price: "180"
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Error al disparar la demo de taller:", data);
    process.exit(1);
  }

  data.latencyMs = Date.now() - start;
  console.log("¡Demo de Taller (Google Sheets) disparada con éxito!");
  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
