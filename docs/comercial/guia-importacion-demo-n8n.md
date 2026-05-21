# Guía de Importación Rápida de Demos en n8n — EsarIA

Con n8n, no tienes que arrastrar ningún bloque ni configurar flujos manualmente. Yo ya los he diseñado y cableado por completo para ti. 

Solo tienes que seguir estos pasos para importar el "cerebro" de las dos demos a tu cuenta de n8n, añadir tus claves API de Telegram/Google y ponerlas en marcha al instante.

---

## 🚀 PASO 1: Crear tu Bot y conseguir las claves (30 segundos)

Si aún no lo has hecho, crea el Bot de Telegram de pruebas para recibir los mensajes en tu móvil:
1. Entra en Telegram, busca al usuario **`@BotFather`** y escríbele `/newbot`.
2. Dale un nombre (ej: `Demo EsarIA`) y un usuario que termine en bot (ej: `esaria_demo_bot`).
3. **Copia el Token API** largo que te devolverá.
4. Entra al enlace de tu nuevo bot y pulsa **Iniciar** / **Start**.
5. Busca al bot **`@userinfobot`**, dale a **Iniciar** y apunta tu **Chat ID** numérico personal.

---

## 🔌 PASO 2: Importar la Demo de Gimnasios (Google Calendar ➡️ Telegram)

1. En tu espacio de n8n, haz clic en **Workflows** (menú izquierdo) y luego en **Add workflow** (arriba a la derecha).
2. Abre en tu editor de código o copia el contenido completo del archivo:
   👉 [gimnasio-calendar-telegram.json](file:///Users/javidel/Library/CloudStorage/GoogleDrive-deljavierher@gmail.com/Mi%20unidad/EsarIA/docs/comercial/workflows-n8n/gimnasio-calendar-telegram.json)
3. Haz clic en el lienzo vacío de n8n (el espacio de cuadrícula gris central) y pulsa **Ctrl + V** (o **Cmd + V** en Mac) para **pegar el código directamente**.
4. ¡BOOM! Los dos nodos (*Google Calendar Trigger* y *Telegram Bot*) aparecerán conectados mágicamente.
5. **Configurar claves y cuenta:**
   - Haz doble clic en el nodo **Google Calendar Trigger**:
     - En **Credential for Google Calendar API**, selecciona conectar tu cuenta de Google.
     - Haz clic en *Save*.
   - Haz doble clic en el nodo **Telegram Bot**:
     - En **Credential for Telegram API**, introduce el Token API largo de tu bot.
     - Reemplaza el texto `TU_CHAT_ID_AQUÍ` por tu Chat ID numérico obtenido de `@userinfobot`.
     - Haz clic en *Save*.
6. Haz clic en **Save** (arriba a la derecha) y activa el interruptor **Active** (arriba a la derecha) para ponerlo en funcionamiento de fondo.

---

## 🔧 PASO 3: Importar la Demo de Talleres (Google Sheets ➡️ Telegram)

### Preparación previa en tu Google Drive:
1. Crea una hoja de cálculo nueva en Google Drive llamada `Demo Taller EsarIA`.
2. En la fila 1, escribe estas columnas:
   - Columna A: **Cliente**
   - Columna B: **Coche**
   - Columna C: **Importe**
   - Columna D: **Estado**

### Importación en n8n:
1. Crea un nuevo Workflow en n8n: **Add workflow**.
2. Abre y copia el contenido completo del archivo:
   👉 [taller-sheets-telegram.json](file:///Users/javidel/Library/CloudStorage/GoogleDrive-deljavierher@gmail.com/Mi%20unidad/EsarIA/docs/comercial/workflows-n8n/taller-sheets-telegram.json)
3. Haz clic en el lienzo vacío de n8n y pulsa **Ctrl + V** (o **Cmd + V** en Mac).
4. Verás los nodos conectados.
5. **Configurar claves y cuenta:**
   - Haz doble clic en **Google Sheets Trigger**:
     - En **Credential for Google Sheets API**, conecta tu cuenta de Google.
     - En **Document**, selecciona tu hoja recién creada (`Demo Taller EsarIA`).
     - En **Sheet**, selecciona `Hoja 1`.
   - Haz doble clic en **Telegram Bot**:
     - Selecciona la credencial de Telegram que guardaste en el paso anterior.
     - Reemplaza `TU_CHAT_ID_AQUÍ` por tu Chat ID de Telegram.
6. Haz clic en **Save** y activa el interruptor **Active**.

---

## 🎯 PASO 4: Cómo probarlo en directo

1. **Prueba de Pilates (Gimnasio):** Añade un evento en tu Google Calendar. En menos de 1 minuto, recibirás una notificación de Telegram simulando el aviso de confirmación de reserva que el cliente final recibiría en su WhatsApp.
2. **Prueba del Seat Ibiza (Taller):** Añade una fila en tu Excel con los campos rellenos (ej: Cliente: *Manuel*, Coche: *Ford Focus*, Importe: *180*, Estado: *Listo*). En un minuto recibirás el aviso en tu móvil pidiendo confirmación de presupuesto.
