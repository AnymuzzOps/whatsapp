const env = require('../config/env');

function getDateParts(date = new Date()) {
  return {
    fecha: date.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }),
    hora: date.toLocaleTimeString('es-CL', { timeZone: 'America/Santiago', hour12: false }),
  };
}

function buildLeadRow(data = {}) {
  const { fecha, hora } = getDateParts();

  return {
    fecha: data.fecha || fecha,
    hora: data.hora || hora,
    telefono: data.telefono || data.phone || '',
    nombre: data.nombre || '',
    empresa: data.empresa || '',
    rut: data.rut || '',
    correo: data.correo || '',
    tipo_solicitud: data.tipo_solicitud || '',
    detalle: data.detalle || '',
    estado: data.estado || 'nuevo',
    origen: 'WhatsApp Bot',
  };
}

async function appendLead(data = {}) {
  const lead = buildLeadRow(data);

  if (!env.googleSheetsEnabled) {
    console.info('Lead capturado (Google Sheets desactivado):', lead);
    return { saved: false, reason: 'GOOGLE_SHEETS_ENABLED=false', lead };
  }

  if (!env.googleSheetsId || !env.googleServiceAccountEmail || !env.googlePrivateKey) {
    console.warn('Google Sheets está activado, pero faltan variables de entorno. Lead no enviado:', lead);
    return { saved: false, reason: 'missing_google_sheets_env', lead };
  }

  // MVP: la estructura del lead ya está preparada. En la siguiente iteración se puede
  // conectar aquí la API de Google Sheets con una cuenta de servicio.
  console.info('Google Sheets activado. Lead preparado para envío:', lead);
  return { saved: false, reason: 'google_sheets_integration_pending', lead };
}

module.exports = {
  appendLead,
};
