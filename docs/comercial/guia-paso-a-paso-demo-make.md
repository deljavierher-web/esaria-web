# Paso a Paso: Tu Demo Funcional en 5 Minutos (Make + Telegram) — EsarIA

Esta guía paso a paso te explica exactamente cómo dejar montados los dos escenarios de demostración utilizando **Telegram** como canal de pruebas (que es gratuito y se configura en 1 minuto) y cómo presentarlo comercialmente sin que pierda ni un ápice de impacto.

---

## 🚀 PASO 1: Crear tu "Canal de Pruebas" en Telegram (30 segundos)

Para que Make envíe mensajes a tu móvil de prueba, necesitamos un "bot" de Telegram. Se crea de forma gratuita y al instante:

1. Abre **Telegram** en tu móvil o PC.
2. Busca al usuario **`@BotFather`** (tiene un tick azul de cuenta verificada).
3. Escríbele el comando: `/newbot`
4. Te preguntará un nombre para tu bot. Escribe: `Demo EsarIA`
5. Te preguntará un nombre de usuario que termine en "bot". Escribe por ejemplo: `demo_esaria_bot` (o uno similar si este ya está cogido).
6. **¡Listo!** Te enviará un mensaje con el **Token de la API** (una cadena larga de números y letras parecida a esta: `784930219:AAHfdk2...`). **Copia ese Token**, lo usaremos ahora en Make.
7. Abre tu nuevo bot (haciendo clic en el enlace que te da @BotFather, ej: `t.me/demo_esaria_bot`) y pulsa **Iniciar** / **Start**.
8. **Obtener tu Chat ID (A dónde enviar el mensaje):**
   - Busca en Telegram al usuario **`@userinfobot`**.
   - Pulsa **Iniciar**.
   - Te responderá con un número largo (ej: `123456789`). Ese es tu **Chat ID** personal. Apúntalo.

---

## 📅 PASO 2: Escenario A — Demo para Gimnasios (Google Calendar ➡️ Telegram)

Este escenario simula que, al agendar una cita en el calendario del negocio, el cliente recibe un recordatorio automático.

### Configuración en Make (Clic a Clic):
1. Entra en [Make.com](https://www.make.com/) y haz clic en **Create a new scenario** (arriba a la derecha).
2. Haz clic en el gran botón **`+`** del centro y busca **Google Calendar**.
3. Selecciona el evento iniciador (Trigger): **Watch Events** (Ver eventos).
4. **Conecta tu Google Calendar:**
   - Haz clic en *Add* y conecta tu cuenta de Gmail de forma normal.
   - En **Calendar**, selecciona tu calendario principal (suele ser tu email o "Primary").
   - En **Watch elements**, selecciona *By Created Time* (Por hora de creación).
   - Haz clic en *OK*.
5. Pasa el cursor por la derecha del módulo de Google Calendar y haz clic en **Add another module** (Añadir otro módulo).
6. Busca y selecciona **Telegram Bot**.
7. Selecciona la acción: **Send a Text Message or Reply** (Enviar un mensaje de texto).
8. **Conecta tu Bot de Telegram:**
   - Haz clic en *Add*.
   - Pega el **Token de la API** que te dio `@BotFather` en el paso 1. Haz clic en *Save*.
9. **Configura el mensaje a enviar:**
   - **Chat ID:** Pega aquí el número de Chat ID largo que obtuviste de `@userinfobot`.
   - **Text:** Copia y pega exactamente este texto sin jerga técnica:
     ```text
     🔔 AVISO DE RESERVA (Simulación)

     Hola, te confirmamos que tu sesión de Pilates está agendada para el día {{1.start}} en nuestro centro. 

     Recuerda que puedes cancelar con 24 horas de antelación para que otro compañero pueda aprovechar el hueco. ¡Te esperamos!
     ```
     *(Nota: Haz clic en `{{1.start}}` desde la lista de variables flotantes que te ofrece Make para que ponga la hora real de la cita).*
   - Haz clic en *OK*.
10. Activa el escenario haciendo clic en el interruptor **Scheduling: ON** (abajo a la izquierda).

---

## 🔧 PASO 3: Escenario B — Demo para Talleres (Google Sheets ➡️ Telegram)

Este escenario simula que, cuando el mecánico anota en un Excel/formulario que un presupuesto está listo, el cliente recibe el aviso de recogida de forma automática.

### Preparación previa:
1. Entra en tu Google Drive y crea una hoja de cálculo nueva llamada `Demo Taller EsarIA`.
2. En la primera fila (fila 1), escribe estas columnas:
   - Columna A: **Cliente**
   - Columna B: **Coche**
   - Columna C: **Importe**
   - Columna D: **Estado** (aquí escribiremos "Listo" para simular la alerta).

### Configuración en Make (Clic a Clic):
1. Crea un escenario nuevo en Make: **Create a new scenario**.
2. Haz clic en el **`+`** y busca **Google Sheets**.
3. Selecciona el Trigger: **Watch Rows** (Ver filas).
4. **Conecta tu Google Sheets:**
   - Conecta tu cuenta de Gmail.
   - En **Spreadsheet**, selecciona `Demo Taller EsarIA`.
   - En **Sheet**, selecciona `Hoja 1`.
   - En **Table contains headers**, selecciona *Yes*.
   - Haz clic en *OK*.
5. Añade un segundo módulo a la derecha buscando **Telegram Bot**.
6. Selecciona la acción: **Send a Text Message or Reply**.
7. Selecciona la conexión que ya creaste en el paso anterior.
8. **Configura el mensaje a enviar:**
   - **Chat ID:** Pega de nuevo tu Chat ID de Telegram.
   - **Text:** Copia y pega este texto:
     ```text
     🚗 TALLER MECÁNICO (Simulación)

     Hola {{1.Cliente}}, te informamos de que el presupuesto para tu {{1.Coche}} ya está listo y asciende a {{1.Importe}}€.

     Por favor, confírmanos si damos luz verde a la reparación respondiendo a este mensaje.
     ```
     *(Nota: Asegúrate de arrastrar las variables `{{1.Cliente}}`, `{{1.Coche}}` e `{{1.Importe}}` desde los campos de Google Sheets detectados).*
   - Haz clic en *OK*.
9. Activa el escenario haciendo clic en **Scheduling: ON**.

---

## 🗣️ PASO 4: El Guion Comercial Perfecto Usando Telegram

Dado que la demo la vas a enseñar enviando el mensaje a tu propio Telegram, debes justificar el uso de esta app de forma profesional e inteligente para que el cliente siga viendo el valor en **WhatsApp** (que es lo que él quiere para su negocio).

### Cómo introducir la demo en la reunión:
> *"Para que veas cómo funciona esto en la vida real, te he preparado una simulación en directo. Lo ideal para tu negocio es que los avisos le lleguen a tus clientes por **WhatsApp**, que es lo que todo el mundo usa.*
> 
> *Para esta prueba rápida de hoy, he conectado la agenda con mi propio móvil a través de **Telegram**, que es una aplicación idéntica y nos permite hacer la simulación al instante y de forma 100% segura sin tocar tus sistemas ni tus datos personales.*
> 
> *Mira, voy a apuntar una cita ficticia en este calendario de prueba..."*

### Mientras se ejecuta el flujo:
> *"Apuntamos aquí: 'Cita Pilates - Lunes a las 18:00h'. Y ahora, fíjate en mi pantalla del móvil. Sin que yo haya tenido que coger el teléfono, escribir el mensaje ni buscar al cliente... ¡Listo! Aquí tengo la notificación en tiempo real con el recordatorio exacto de la cita.*
> 
> *Esto es lo que tus clientes recibirán directamente en su WhatsApp en el momento en que les des la cita, ahorrándote a ti o a tu recepcionista decenas de mensajes manuales al día y evitando que la gente se olvide de venir."*
