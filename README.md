# Bot WhatsApp MyR - MVP

Primera versión MVP de un bot de WhatsApp automatizado por flujos para **MyR Consultores**, empresa de asesoría contable y tributaria en Chile.

Este proyecto usa **WhatsApp Business Platform / WhatsApp Cloud API oficial**, **Node.js**, **Express**, **Axios** y **Dotenv**. No usa IA generativa, WhatsApp Web, `whatsapp-web.js` ni librerías no oficiales.

## Alcance

Incluye:

- Webhook de WhatsApp Cloud API.
- Menú principal.
- Flujos por opciones.
- Estados de conversación en memoria.
- Función `appendLead(data)` preparada para Google Sheets y desactivada por defecto.
- Comandos globales `MENU`, `CANCELAR` y `HUMANO`.
- Endpoint `GET /health` para probar localmente.

No incluye todavía:

- Google Drive.
- Google Calendar.
- Campañas.
- Plantillas proactivas.
- Panel administrativo.
- Base de datos.
- IA.

## Instalación

```bash
npm install
cp .env.example .env
```

## Configuración de `.env`

```env
PORT=3000
WHATSAPP_TOKEN=TU_TOKEN_DE_ACCESO
WHATSAPP_PHONE_NUMBER_ID=TU_IDENTIFICADOR_DE_NUMERO
WHATSAPP_VERIFY_TOKEN=myr_webhook_verify_token
WHATSAPP_GRAPH_API_VERSION=v21.0

GOOGLE_SHEETS_ENABLED=false
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

Importante:

- No compartas públicamente `WHATSAPP_TOKEN`.
- No subas `.env` a Git.
- No coloques credenciales reales dentro del código.
- `WHATSAPP_VERIFY_TOKEN` puede ser cualquier texto definido por ti, pero debe coincidir con el token configurado en Meta.

## Ejecutar en desarrollo

```bash
npm run dev
```

Ejecutar sin nodemon:

```bash
npm start
```

## Probar localmente

Health check:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "bot-whatsapp-myr"
}
```

## Probar con ngrok

Levanta el servidor:

```bash
npm run dev
```

En otra terminal:

```bash
ngrok http 3000
```

Ngrok entregará una URL HTTPS similar a:

```txt
https://TU_URL_NGROK.ngrok-free.app
```

En Meta debes configurar:

```txt
Callback URL: https://TU_URL_NGROK.ngrok-free.app/webhook
Verify Token: el mismo valor de WHATSAPP_VERIFY_TOKEN
```

## Webhook

### Verificación de Meta

Endpoint:

```txt
GET /webhook
```

Lee los parámetros:

- `hub.mode`
- `hub.verify_token`
- `hub.challenge`

Si `hub.verify_token` coincide con `WHATSAPP_VERIFY_TOKEN`, responde `hub.challenge`. Si no coincide, responde `403`.

Prueba manual:

```bash
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=myr_webhook_verify_token&hub.challenge=12345"
```

### Recepción de mensajes

Endpoint:

```txt
POST /webhook
```

Extrae desde el payload de WhatsApp:

- Número del usuario.
- Nombre del contacto, si viene disponible.
- Tipo de mensaje.
- Texto recibido.
- ID del mensaje.
- Timestamp.

## Datos necesarios desde Meta

Para probar con el número de prueba de Meta necesitas:

- Token de acceso.
- Identificador de número de teléfono (`WHATSAPP_PHONE_NUMBER_ID`).
- Identificador de cuenta de WhatsApp Business.
- Número de prueba de WhatsApp.
- Tu número personal agregado como destinatario de prueba, si la app sigue en modo desarrollo.

Luego envía un mensaje al número de prueba desde WhatsApp y revisa que Meta entregue el evento al webhook configurado.

## Menú principal

Si el usuario escribe `hola`, `menu`, `menú`, `inicio`, `ayuda` o envía su primer mensaje, el bot responde:

```txt
Hola 👋 Soy el asistente virtual de MyR Consultores.

Te ayudaré a orientar tu solicitud para que nuestro equipo pueda responderte de forma más rápida y ordenada.

Selecciona una opción:

Quiero asesoría contable
Necesito ayuda tributaria
Quiero crear una empresa
Soy cliente y quiero enviar documentos
Quiero agendar una reunión
Hablar con una persona
```

El usuario puede responder con número o texto parecido:

- `1`, `asesoría`, `contabilidad`
- `2`, `tributaria`, `iva`, `f29`, `impuestos`
- `3`, `crear empresa`, `empresa`
- `4`, `documentos`, `enviar documentos`
- `5`, `reunión`, `agendar`
- `6`, `humano`, `persona`, `asesor`

## Comandos globales

Disponibles en cualquier momento:

- `MENU`, `MENÚ`, `INICIO`: limpia el estado actual y muestra el menú principal.
- `CANCELAR`: limpia el estado actual y responde: `Proceso cancelado. Si necesitas otra cosa, escribe MENÚ.`
- `HUMANO`: cambia el estado a `pendiente_humano` y deriva a una persona del equipo.

## Flujos disponibles

1. **Asesoría contable:** captura tipo de cliente, nombre, empresa, RUT opcional, correo, giro, servicio principal y contabilidad atrasada.
2. **Consulta tributaria:** clasifica la consulta y la deja registrada para revisión humana.
3. **Crear empresa:** captura necesidad, rubro, socios, nombre y correo.
4. **Enviar documentos:** solicita nombre/empresa, acepta texto, imágenes y documentos, cuenta archivos y finaliza con `LISTO`.
5. **Agendar reunión:** captura nombre, correo, motivo y disponibilidad preferida.
6. **Hablar con una persona:** guarda el estado como `pendiente_humano`.

## Google Sheets

`src/services/googleSheets.service.js` contiene `appendLead(data)`.

Por defecto:

```env
GOOGLE_SHEETS_ENABLED=false
```

En ese modo, los leads se muestran en consola y no se lanza error. Esto permite probar el bot completo sin configurar Google Sheets.

La estructura preparada para cada lead es:

- fecha
- hora
- teléfono
- nombre
- empresa
- rut
- correo
- tipo_solicitud
- detalle
- estado
- origen = WhatsApp Bot

## Seguridad

- El bot no pide claves del SII, claves tributarias, contraseñas ni datos bancarios.
- El bot no responde asesorías tributarias complejas como si fuera contador.
- Las consultas tributarias se registran para revisión del equipo de MyR Consultores.
- Los mensajes sensibles recuerdan no enviar claves ni información confidencial.

## Estructura del proyecto

```txt
bot-whatsapp-myr/
├── src/
│   ├── server.js
│   ├── config/env.js
│   ├── routes/whatsapp.routes.js
│   ├── controllers/whatsapp.controller.js
│   ├── services/
│   │   ├── whatsapp.service.js
│   │   └── googleSheets.service.js
│   ├── flows/
│   ├── store/conversationState.store.js
│   ├── utils/
│   │   ├── messageParser.js
│   │   └── validators.js
│   └── constants/messages.js
├── .env.example
├── package.json
└── README.md
```
