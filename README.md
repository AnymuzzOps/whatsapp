# Bot WhatsApp MVP - MyR Consultores

MVP de backend en **Node.js + Express** para un bot de WhatsApp por flujos para **MyR Consultores**, empresa chilena de asesoría contable y tributaria.

El bot usa **WhatsApp Business Platform / WhatsApp Cloud API**. No usa WhatsApp Web, `whatsapp-web.js`, IA generativa, campañas ni recordatorios automáticos.

## Alcance del MVP

Incluye:

- Webhook de WhatsApp Cloud API.
- Menú principal.
- Flujos simples por opciones.
- Estados de conversación en memoria.
- Guardado de leads en Google Sheets.
- Comandos globales `MENU`, `CANCELAR` y `HUMANO`.

No incluye todavía:

- Google Drive.
- Google Calendar.
- Panel administrativo.
- Base de datos.
- IA.
- Recordatorios automáticos.
- Campañas.
- Plantillas proactivas.

## Requisitos

- Node.js 18 o superior.
- Cuenta de Meta for Developers con WhatsApp Cloud API.
- Una hoja de Google Sheets.
- Una cuenta de servicio de Google con acceso de edición a la hoja.
- Una URL HTTPS pública para configurar el webhook en Meta.

## Instalación

```bash
npm install
cp .env.example .env
```

Completa `.env` con tus credenciales reales.

## Variables de entorno

```env
PORT=3000
WHATSAPP_TOKEN=EAAG...
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_VERIFY_TOKEN=myr_webhook_verify_token
WHATSAPP_GRAPH_API_VERSION=v21.0
GOOGLE_SHEETS_ID=1abcDEF...
GOOGLE_SERVICE_ACCOUNT_EMAIL=bot-sheets@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> No subas `.env` al repositorio y no imprimas tokens en consola.

## Ejecución

Desarrollo:

```bash
npm run dev
```

Producción/local simple:

```bash
npm start
```

Health check:

```bash
curl http://localhost:3000/health
```

## Webhook de WhatsApp

El proyecto expone:

- `GET /webhook`: verificación del webhook de Meta.
- `POST /webhook`: recepción de mensajes entrantes.

Prueba de verificación:

```bash
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=myr_webhook_verify_token&hub.challenge=12345"
```

Si el token coincide, responde `12345`.

## Configuración en Meta

1. Crea una app en Meta for Developers.
2. Agrega el producto WhatsApp.
3. Obtén `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID`.
4. Publica este backend en una URL HTTPS.
5. Configura el webhook con:
   - Callback URL: `https://tu-dominio.com/webhook`
   - Verify token: el valor de `WHATSAPP_VERIFY_TOKEN`.
6. Suscribe los eventos de mensajes.

El envío de mensajes usa Graph API:

```txt
POST https://graph.facebook.com/{WHATSAPP_GRAPH_API_VERSION}/{WHATSAPP_PHONE_NUMBER_ID}/messages
```

## Google Sheets

La función `appendLead(data)` guarda prospectos en una pestaña llamada `Leads`.

Columnas sugeridas:

| Columna | Campo |
| --- | --- |
| A | fecha |
| B | hora |
| C | teléfono |
| D | nombre |
| E | empresa |
| F | rut |
| G | correo |
| H | tipo_solicitud |
| I | detalle |
| J | estado |
| K | origen |

Pasos:

1. Crea una hoja de cálculo.
2. Crea una pestaña `Leads`.
3. Comparte la hoja con el correo de la cuenta de servicio (`GOOGLE_SERVICE_ACCOUNT_EMAIL`).
4. Copia el ID de la hoja en `GOOGLE_SHEETS_ID`.
5. Copia la llave privada en `GOOGLE_PRIVATE_KEY`, manteniendo los saltos como `\n`.

Si Google Sheets falla, el bot registra el error y continúa respondiendo al usuario.

## Menú principal

El usuario puede escribir `hola`, `menu`, `menú`, `inicio` o enviar su primer mensaje para ver:

```txt
1. Quiero asesoría contable
2. Necesito ayuda tributaria
3. Quiero crear una empresa
4. Soy cliente y quiero enviar documentos
5. Quiero agendar una reunión
6. Hablar con una persona
```

El parser reconoce números y textos simples como `asesoría`, `contabilidad`, `tributaria`, `IVA`, `crear empresa`, `documentos`, `reunión` o `humano`.

## Flujos disponibles

- **Asesoría contable:** captura datos básicos del prospecto, servicio requerido y contabilidad atrasada.
- **Consulta tributaria:** clasifica el tema, captura consulta y contacto, y deriva a revisión humana.
- **Crear empresa:** captura necesidad, rubro, socios, nombre y correo.
- **Enviar documentos:** solicita nombre/empresa, cuenta archivos recibidos y finaliza con `LISTO`.
- **Agendar reunión:** captura nombre, correo, motivo y disponibilidad preferida.
- **Hablar con una persona:** deja el estado como `pendiente_humano`.

## Comandos globales

- `MENU`, `MENÚ` o `INICIO`: limpia el flujo actual y muestra el menú.
- `CANCELAR`: limpia el flujo actual y cancela el proceso.
- `HUMANO`: deriva a una persona del equipo.

## Seguridad

- El bot no entrega asesorías tributarias complejas como si fuera contador.
- Las consultas delicadas se registran para revisión humana.
- El bot no solicita claves del SII, claves tributarias, contraseñas ni datos bancarios.
- Los flujos sensibles incluyen advertencias para no enviar información confidencial.

## Estructura

```txt
src/
├── config/env.js
├── constants/messages.js
├── controllers/whatsapp.controller.js
├── flows/
├── routes/whatsapp.routes.js
├── server.js
├── services/
│   ├── googleSheets.service.js
│   └── whatsapp.service.js
├── store/conversationState.store.js
└── utils/
```
