# Checklist de viabilidad técnica — EsarIA

Usar antes de enviar una propuesta o prometer una automatización.

Objetivo: evitar comprometerse con algo que luego depende de permisos, herramientas cerradas, datos sensibles o integraciones que no existen.

---

## 1. Proceso a automatizar

- [ ] El proceso está explicado paso a paso.
- [ ] Hay un inicio claro: formulario, WhatsApp, email, llamada, agenda, pedido.
- [ ] Hay un resultado claro: cita creada, cliente avisado, tarea registrada, presupuesto enviado.
- [ ] Se sabe quién interviene en cada paso.
- [ ] Se sabe qué ocurre si algo falla.
- [ ] El proceso se repite con frecuencia suficiente para justificar automatizarlo.

Frase de control:

> Si el proceso cambia cada vez, primero hay que ordenarlo; después automatizarlo.

---

## 2. Herramientas actuales

- [ ] Qué agenda usan.
- [ ] Qué correo usan.
- [ ] Si usan WhatsApp normal o WhatsApp Business.
- [ ] Si tienen CRM, Excel, Google Sheets, Notion u otra base de datos.
- [ ] Si tienen formularios actuales.
- [ ] Si tienen web y quién la gestiona.
- [ ] Si usan software sectorial cerrado.

Anotar:

```text
Herramientas actuales:
- Agenda:
- WhatsApp:
- Email:
- CRM/hoja:
- Web/formulario:
- Otros:
```

---

## 3. Accesos y permisos

- [ ] El cliente puede dar acceso a las herramientas necesarias.
- [ ] Los accesos se dan con cuentas del cliente, no con cuentas personales de EsarIA.
- [ ] Se puede crear un usuario específico para EsarIA si hace falta.
- [ ] Hay forma de revocar accesos al terminar.
- [ ] No se comparten contraseñas por WhatsApp si se puede evitar.
- [ ] Se usará un gestor de contraseñas o método seguro.

Regla:

> La automatización debe quedar bajo control del cliente, no atada a cuentas personales tuyas.

---

## 4. Datos y RGPD

- [ ] Qué datos se van a tratar.
- [ ] Si hay datos sensibles: salud, menores, información financiera, DNI.
- [ ] Dónde se guardan los datos.
- [ ] Quién puede acceder a ellos.
- [ ] Cuánto tiempo se conservan.
- [ ] Si se envían datos a herramientas externas.
- [ ] Si hace falta revisar el caso con asesoría/legal.

Evitar en fase inicial:

- Datos sanitarios detallados.
- Automatizaciones que tomen decisiones sensibles.
- Envíos masivos sin base legal clara.
- Guardar información innecesaria.

---

## 5. Integraciones

- [ ] La herramienta tiene API o integración oficial.
- [ ] Make/n8n/Zapier puede conectarse sin apaños frágiles.
- [ ] Hay límites de uso o coste por volumen.
- [ ] Se puede probar con datos ficticios.
- [ ] Hay alternativa si la integración principal falla.

Preguntas clave:

- ¿La herramienta permite automatizar esto de forma oficial?
- ¿Hace falta una cuenta de pago?
- ¿El cliente acepta ese coste?
- ¿Qué pasa si WhatsApp, email o agenda cambia sus límites?

---

## 6. Riesgos antes de presupuestar

Marcar cualquier punto que aumente el riesgo:

- [ ] El cliente no sabe explicar bien el proceso.
- [ ] Hay muchas excepciones.
- [ ] Depende de una herramienta cerrada sin API.
- [ ] Hay datos sensibles.
- [ ] Hay mucho volumen desde el primer día.
- [ ] El cliente espera resultados comerciales garantizados.
- [ ] El cliente quiere empezar sin probar.
- [ ] Nadie del negocio quiere responsabilizarse del proceso.

Si hay 2 o más riesgos, proponer primero una prueba pequeña.

---

## 7. Decisión

Elegir una opción antes de enviar propuesta:

- [ ] Viable como proyecto simple.
- [ ] Viable solo con prueba piloto.
- [ ] Viable, pero requiere herramientas de pago.
- [ ] No viable ahora.
- [ ] Hay que pedir más información.

Resumen final:

```text
Proceso:
Herramientas:
Riesgo principal:
Costes externos:
Recomendación:
```
