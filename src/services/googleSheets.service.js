const { google } = require('googleapis');
const env = require('../config/env');
const { formatDateParts, stringifyDetails } = require('../utils/formatters');

const DEFAULT_RANGE = 'Leads!A:K';

function getPrivateKey() {
  return env.googlePrivateKey?.replace(/\\n/g, '\n');
}

function isConfigured() {
  return Boolean(env.googleSheetsId && env.googleServiceAccountEmail && env.googlePrivateKey);
}

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: env.googleServiceAccountEmail,
    key: getPrivateKey(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

async function appendLead(data = {}) {
  const { fecha, hora } = formatDateParts();
  const row = [
    data.fecha || fecha,
    data.hora || hora,
    data.telefono || data.phone || '',
    data.nombre || '',
    data.empresa || '',
    data.rut || '',
    data.correo || '',
    data.tipo_solicitud || data.tipoSolicitud || '',
    data.detalle || stringifyDetails(data.detalles || data.data || {}),
    data.estado || 'nuevo',
    'WhatsApp Bot',
  ];

  if (!isConfigured()) {
    console.warn('Google Sheets no está configurado. Lead no enviado a la hoja:', {
      telefono: row[2],
      tipo_solicitud: row[7],
    });
    return { skipped: true, row };
  }

  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: env.googleSheetsId,
      range: DEFAULT_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });

    return response.data;
  } catch (error) {
    console.error('Error al guardar lead en Google Sheets:', error.message);
    throw error;
  }
}

module.exports = {
  appendLead,
};
