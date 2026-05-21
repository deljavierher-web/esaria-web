# Guía de Demo Funcional (Make + Calendar + WhatsApp) — EsarIA

Esta guía describe cómo montar y enseñar una demostración técnica en directo durante la fase de diagnóstico o presentación de la propuesta.
El objetivo no es mostrar cómo se programa, sino hacer visible el "momento ajá" donde el cliente dice: *"Ostras, ojalá tuviera esto funcionando ahora mismo"*.

**Duración de la demo:** Máximo 3 minutos.
**Regla de oro:** Enseña el *resultado*, nunca el *cableado* de Make.

---

## 1. Arquitectura de la Demo Mínima Viable

No necesitas invertir dinero para montar esta demo. Usa cuentas gratuitas.

**Herramientas necesarias:**
1. **Google Forms / Tally / Calendly:** Para simular la entrada de datos (el cliente que pide la cita o el taller que marca el presupuesto como "listo").
2. **Google Calendar / Google Sheets:** Donde se registra la información a modo de "base de datos visual" fácil de entender para el cliente.
3. **Make (cuenta gratuita):** El motor invisible que conecta todo.
4. **WhatsApp Business (o API de prueba):** Para que tú mismo recibas el mensaje en tu móvil durante la demo. *Truco: puedes usar el módulo de Telegram o un SMS gratuito en Make si no tienes WhatsApp API conectado, la magia visual es la misma.*

---

## 2. Escenario A — Demo para Gimnasios / Centros Deportivos (Gestión de Reservas)

*Este es el flujo perfecto para venderles la eliminación del caos de mensajes en recepción.*

### El montaje técnico (Make)
1. **Trigger:** Añades un evento en un Google Calendar de prueba llamado "Reserva Pilates" a las 18:00h, añadiendo el teléfono ficticio (el tuyo) en la descripción.
2. **Acción 1:** Make detecta el nuevo evento.
3. **Acción 2:** Make envía un WhatsApp automático al teléfono del evento.

### El guion de la demo frente al cliente
> *"Para que veas a qué me refiero con que el trabajo se haga solo, mira este ejemplo. Imagina que es lunes por la mañana y apuntas en tu agenda que 'María' (que soy yo para esta prueba) viene a la clase de pilates de las 6 de la tarde."*
> 
> *(Añades el evento manualmente en Google Calendar, que es una pantalla que el dueño del gimnasio conoce perfectamente).*
> 
> *"Ya está apuntado. Tú sigues a lo tuyo, atendiendo a la gente en recepción. En lugar de tener que acordarte de mandarle un mensaje a María para confirmar... mira mi móvil."*
> 
> *(Sacas tu móvil y enseñas la notificación de WhatsApp).*
> 
> *"Automáticamente, María recibe esto: 'Hola María, confirmada tu clase de pilates hoy a las 18:00h. Si no puedes venir, avísanos respondiendo a este mensaje para dejarle el hueco a otro compañero'. Tú no has tocado el teléfono. Todo el día a día fluye solo."*

---

## 3. Escenario B — Demo para Talleres (Aviso de presupuesto listo)

*Este flujo ataca el dolor de llamar uno a uno a los clientes para que den el visto bueno a una reparación.*

### El montaje técnico (Make)
1. **Trigger:** Rellenas un Google Form interno (que simula ser la herramienta del taller) con tres campos: Matrícula, Nombre, Teléfono (el tuyo) y Precio.
2. **Acción 1:** Make guarda los datos en un Google Sheets (simulando su registro).
3. **Acción 2:** Make envía un WhatsApp automático al teléfono.

### El guion de la demo frente al cliente
> *"Sé que uno de los mayores cuellos de botella es llamar a los clientes para decirles que el presupuesto está hecho. Mira cómo sería vuestro nuevo día a día."*
> 
> *(Abres el formulario sencillo en el portátil).*
> 
> *"Imagina que el mecánico termina de mirar el Seat Ibiza. Simplemente pone aquí la matrícula, el precio, y le da a 'Enviar'."*
> 
> *(Pulsas Enviar).*
> 
> *"Tú ya has terminado tu trabajo con ese coche. No tienes que coger el teléfono. Al momento, mira lo que le llega al dueño del coche a su WhatsApp."*
> 
> *(Enseñas tu móvil).*
> 
> *"Le llega: 'Hola, ya tenemos revisado el Seat Ibiza. El presupuesto de la reparación son 250€. Responde SÍ a este mensaje para que nos pongamos manos a la obra o pásate por el taller si quieres que lo veamos juntos'. De esta forma, el cliente os responde rápido por escrito, queda registrado y vosotros seguís trabajando en el taller sin perder tiempo al teléfono."*

---

## 4. Checklist para antes de la reunión

- [ ] ¿Tengo el teléfono de prueba bien configurado en Make (sin código de país duplicado)?
- [ ] ¿He hecho una prueba en el coche 5 minutos antes de entrar al negocio para asegurar que Make no está en pausa?
- [ ] ¿Tengo las pestañas preparadas (Calendar / Forms) sin que se vea nada de la pantalla de Make ni esquemas técnicos?
- [ ] ¿Tengo el móvil a mano y en sonido/vibración para que se note cuando llega el mensaje?

**Recuerda:** La demo falla el 10% de las veces por problemas de conexión. Si falla, ríete, di *"las cosas del directo"*, y explica el resultado verbalmente. El concepto es tan visual que lo entenderán igual.
