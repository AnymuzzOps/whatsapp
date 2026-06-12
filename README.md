# Bot WhatsApp Contable - MyR Consultores

Backend en **Node.js + Express** para un bot de WhatsApp automatizado por **flujos definidos**, sin IA generativa y preparado para **WhatsApp Business Platform / WhatsApp Cloud API**.

El sistema está diseñado para **MyR Consultores**, empresa chilena de asesoría contable y tributaria enfocada en pymes, emprendedores, creación de empresas, IVA/F29, renta, remuneraciones y regularización contable.

> Este bot no entrega asesoría tributaria compleja como si fuera contador. Clasifica solicitudes, captura antecedentes mínimos y deriva casos delicados a una persona del equipo. Nunca solicita claves del SII, claves tributarias, contraseñas ni datos sensibles innecesarios.

## 1. Descripción del proyecto

El bot recibe mensajes entrantes desde WhatsApp Cloud API mediante un webhook, procesa el texto o tipo de mensaje según el estado de conversación del usuario, responde con menús y preguntas secuenciales, y guarda prospectos o solicitudes en Google Sheets.

Características principales:

- Uso exclusivo de WhatsApp Cloud API. No usa WhatsApp Web ni librerías no oficiales como `whatsapp-web.js`.
- Flujos conversacionales determinísticos por menús y estados.
- Store inicial en memoria, preparado para migrar a base de datos.
- Integración con Google Sheets para leads y solicitudes.
- Base preparada para Google Drive y Google Calendar.
- Comandos globales: `MENÚ`, `INICIO`, `CANCELAR`, `HUMANO`.
- Validación simple de correo electrónico.
- Advertencias para no enviar claves, contraseñas ni información sensible.

## 2. Requisitos

- Node.js 18 o superior.
- Cuenta de Meta for Developers con WhatsApp Business Platform / WhatsApp Cloud API configurada.
- Un número de WhatsApp Business habilitado en Cloud API.
- Una hoja de Google Sheets compartida con una cuenta de servicio.
- Un túnel HTTPS para desarrollo local, por ejemplo ngrok, Cloudflare Tunnel o similar.

## 3. Instalación

```bash
npm install
cp .env.example .env
```

Edita el archivo `.env` con las credenciales reales de WhatsApp y Google.

## 4. Variables de entorno

```env
PORT=3000
WHATSAPP_TOKEN=EAAG...
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_VERIFY_TOKEN=myr_webhook_verify_token
WHATSAPP_GRAPH_API_VERSION=v21.0
GOOGLE_SHEETS_ID=1abcDEF...
GOOGLE_SERVICE_ACCOUNT_EMAIL=bot-sheets@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ADMIN_EMAIL=admin@myrconsultores.cl
```

Notas:

- `WHATSAPP_VERIFY_TOKEN` es un valor definido por ti y debe coincidir con el token configurado en Meta para verificar el webhook.
- `WHATSAPP_GRAPH_API_VERSION` deja configurable la versión de Graph API usada en las llamadas HTTP.
- `GOOGLE_PRIVATE_KEY` debe conservar los saltos de línea como `\n` si se declara en una sola línea.
- No imprimas tokens ni claves privadas en consola.

## 5. Cómo ejecutar en desarrollo

```bash
npm run dev
```

Para producción o ejecución simple:

```bash
npm start
```

Endpoint de salud:

```bash
curl http://localhost:3000/health
```

## 6. Cómo probar el webhook

### Verificación GET de Meta

```bash
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=myr_webhook_verify_token&hub.challenge=12345"
```

Si el token coincide, el servidor responde `12345`.

### Prueba local POST simulada

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [
      {
        "changes": [
          {
            "value": {
              "contacts": [
                { "profile": { "name": "Cliente Demo" }, "wa_id": "56912345678" }
              ],
              "messages": [
                {
                  "from": "56912345678",
                  "id": "wamid.demo",
                  "timestamp": "1710000000",
                  "type": "text",
                  "text": { "body": "hola" }
                }
              ]
            }
          }
        ]
      }
    ]
  }'
```

Si no tienes configurado `WHATSAPP_TOKEN` o `WHATSAPP_PHONE_NUMBER_ID`, el servicio omitirá el envío real y mostrará una advertencia local sin exponer secretos.

## 7. Cómo configurar WhatsApp Cloud API

1. Crea o ingresa a una app en [Meta for Developers](https://developers.facebook.com/).
2. Agrega el producto **WhatsApp**.
3. Obtén:
   - Token de acceso.
   - Phone Number ID.
   - WhatsApp Business Account ID, si lo necesitas para administración.
4. Publica este backend en una URL HTTPS.
5. Configura el webhook con:
   - Callback URL: `https://tu-dominio.com/webhook`
   - Verify token: el mismo valor de `WHATSAPP_VERIFY_TOKEN`.
6. Suscribe los eventos de mensajes entrantes.
7. Asegúrate de que el número usado esté permitido para pruebas o que la app esté en modo productivo.

El envío de mensajes se realiza con:

```txt
POST https://graph.facebook.com/{WHATSAPP_GRAPH_API_VERSION}/{WHATSAPP_PHONE_NUMBER_ID}/messages
```

## 8. Cómo configurar Google Sheets

1. Crea un proyecto en Google Cloud.
2. Habilita la API de Google Sheets.
3. Crea una cuenta de servicio.
4. Genera una clave privada JSON.
5. Copia en `.env`:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
6. Crea una hoja de cálculo y comparte el documento con el correo de la cuenta de servicio como editor.
7. Copia el ID de la hoja en `GOOGLE_SHEETS_ID`.
8. Crea una pestaña llamada `Leads`.

Columnas sugeridas para la pestaña `Leads`:

| Columna | Nombre |
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

Si Google Sheets falla o no está configurado, el bot registra el error en consola, pero continúa respondiendo al usuario.

## 9. Estructura de carpetas

```txt
bot-whatsapp-contable/
├── src/
│   ├── server.js
│   ├── config/
│   │   └── env.js
│   ├── routes/
│   │   └── whatsapp.routes.js
│   ├── controllers/
│   │   └── whatsapp.controller.js
│   ├── services/
│   │   ├── whatsapp.service.js
│   │   ├── googleSheets.service.js
│   │   ├── googleDrive.service.js
│   │   ├── calendarService.js
│   │   └── notification.service.js
│   ├── flows/
│   │   ├── mainMenu.flow.js
│   │   ├── asesoriaContable.flow.js
│   │   ├── consultaTributaria.flow.js
│   │   ├── crearEmpresa.flow.js
│   │   ├── documentos.flow.js
│   │   ├── agendarReunion.flow.js
│   │   └── humano.flow.js
│   ├── store/
│   │   └── conversationState.store.js
│   ├── utils/
│   │   ├── messageParser.js
│   │   ├── validators.js
│   │   └── formatters.js
│   └── constants/
│       └── messages.js
├── .env.example
├── package.json
└── README.md
```

## 10. Flujos disponibles

### Menú principal

Se muestra cuando el usuario escribe `hola`, `menu`, `menú`, `inicio`, o cuando es su primer mensaje sin estado activo.

Opciones:

1. Quiero asesoría contable.
2. Necesito ayuda tributaria.
3. Quiero crear una empresa.
4. Soy cliente y quiero enviar documentos.
5. Quiero agendar una reunión.
6. Hablar con una persona.

El parser reconoce números y textos similares como `asesoría`, `contabilidad`, `IVA`, `crear empresa`, `documentos`, `reunión` o `humano`.

### Flujo 1: Asesoría contable

Captura tipo de cliente, nombre, empresa, RUT opcional, correo, giro, servicio requerido y contabilidad atrasada. Guarda el registro en Google Sheets como `Asesoría contable`.

### Flujo 2: Consulta tributaria

Clasifica el tema, captura una descripción breve, nombre y contacto. Guarda el registro como `Consulta tributaria` y deriva la revisión a una persona del equipo antes de entregar una respuesta.

### Flujo 3: Crear empresa

Captura necesidad, si ya tiene nombre definido, rubro, cantidad de socios, nombre y correo. Guarda el registro como `Crear empresa`.

### Flujo 4: Enviar documentos

Solicita nombre o empresa, acepta mensajes de tipo documento, imagen, video, audio o texto, contabiliza archivos recibidos y finaliza cuando el usuario escribe `LISTO`. Guarda el registro como `Recepción de documentos`.

La descarga real de archivos y subida a Drive queda preparada en `src/services/googleDrive.service.js` mediante:

- `downloadMediaFromWhatsApp(mediaId)`
- `uploadFileToDrive(fileBuffer, fileName, folderName)`

### Flujo 5: Agendar reunión

Captura nombre, correo, motivo y preferencia de día u horario. Guarda el registro como `Solicitud de reunión`.

La integración real con Google Calendar queda preparada en `src/services/calendarService.js`.

### Flujo 6: Hablar con una persona

Cambia el estado del usuario a `pendiente_humano` y solicita que describa brevemente lo que necesita. Incluye advertencia para no enviar claves del SII, contraseñas ni datos sensibles.

## 11. Comandos globales

El usuario puede escribir en cualquier momento:

- `MENU`, `MENÚ` o `INICIO`: limpia el flujo actual y muestra el menú principal.
- `CANCELAR`: limpia el flujo actual y responde que el proceso fue cancelado.
- `HUMANO`: cambia el estado a `pendiente_humano` y deriva a una persona.

## 12. Plantillas de WhatsApp

Este proyecto no implementa campañas ni mensajes proactivos. En WhatsApp Cloud API, los mensajes enviados fuera de la ventana de atención de 24 horas o recordatorios proactivos requieren **plantillas aprobadas por WhatsApp/Meta**.

Ejemplos futuros que requerirían plantillas:

- Recordatorio mensual para envío de documentos.
- Aviso de vencimiento de IVA/F29.
- Confirmación proactiva de reunión fuera de la ventana de atención.
- Seguimiento de propuesta comercial.

## 13. Seguridad y buenas prácticas

- No pedir claves del SII, claves tributarias, contraseñas ni datos bancarios.
- No registrar tokens ni claves privadas en consola.
- Usar variables de entorno.
- En consultas tributarias, capturar la solicitud y derivar a revisión humana.
- Mantener el store en memoria solo para desarrollo o primera versión; en producción se recomienda base de datos.
- Manejar errores de servicios externos sin cortar la conversación del usuario.

## 14. Próximas mejoras sugeridas

- Panel administrativo para revisar leads, estados y conversaciones.
- Base de datos PostgreSQL para estados persistentes y auditoría.
- Google Drive real para almacenar archivos recibidos desde WhatsApp.
- Google Calendar real para crear eventos y enviar confirmaciones.
- Notificaciones internas por correo al equipo de MyR Consultores.
- Plantillas de recordatorio mensual para clientes.
- Capa de IA interna solo para clasificar consultas, no para responder directamente asesorías tributarias.
