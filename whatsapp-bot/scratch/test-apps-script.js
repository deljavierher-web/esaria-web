async function test() {
  const url = 'https://script.google.com/macros/s/AKfycbxiURd0fomiwlRuWJn6jPa-TqEXKv4_o-T0-KR6rv7V5-Fla-nofS9WtgoOKzBh8PWQ/exec';
  const payload = {
    name: 'Prueba EsarIA Node',
    service: 'Demo Automatizacion',
    date: '25/05/2026',
    time: '10:00'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    const text = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
