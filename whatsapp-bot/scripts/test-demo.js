const port = process.env.PORT || 3000;

async function main() {
  const start = Date.now();
  const response = await fetch(`http://localhost:${port}/demo-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "34600000000",
      name: "Demo",
      text: "Hola, soy Javier. Mi email es demo@example.com"
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(data);
    process.exit(1);
  }

  data.latencyMs = Date.now() - start;
  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
