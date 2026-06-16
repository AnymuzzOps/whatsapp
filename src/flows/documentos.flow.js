const { appendLead } = require('../services/googleSheets.service');
const { setState, updateState, clearState } = require('../store/conversationState.store');
const { normalizeText } = require('../utils/messageParser');

const FLOW = 'documentos';

function start(phone) {
  setState(phone, {
    currentFlow: FLOW,
    currentStep: 0,
    data: { fileCount: 0 },
  });

  return `Perfecto. Puedes enviar tus documentos por este chat.

Antes de enviarlos, indícame el nombre de tu empresa o tu nombre completo.`;
}

async function finish(phone, data) {
  try {
    await appendLead({
      telefono: phone,
      nombre: data.nombreEmpresa,
      empresa: data.nombreEmpresa,
      tipo_solicitud: 'Recepción de documentos',
      detalle: JSON.stringify({ cantidadArchivos: data.fileCount || 0 }),
      estado: 'documentos recibidos',
    });
  } catch (error) {
    console.error('Recepción de documentos no pudo guardarse:', error.message);
  }

  clearState(phone);
  return `Gracias. Hemos registrado la recepción de tus documentos ✅

El equipo los revisará y te contactará si falta algún antecedente.`;
}

async function handle(phone, text, state, incomingMessage = {}) {
  const data = { fileCount: 0, ...(state.data || {}) };

  if (state.currentStep === 0) {
    data.nombreEmpresa = text.trim();
    updateState(phone, { currentStep: 1, data });
    return `Ahora puedes enviar facturas, boletas, cartolas, comprobantes, liquidaciones, contratos u otros respaldos.

Cuando termines de enviar todo, escribe LISTO.`;
  }

  if (normalizeText(text) === 'listo') return finish(phone, data);

  if (['document', 'image', 'video', 'audio'].includes(incomingMessage.type)) {
    data.fileCount = (data.fileCount || 0) + 1;
    updateState(phone, { data });
    return 'Documento recibido ✅ Puedes seguir enviando más archivos o escribir LISTO cuando termines.';
  }

  updateState(phone, { data });
  return 'Mensaje recibido. Puedes seguir enviando documentos o escribir LISTO cuando termines.';
}

module.exports = { start, handle };
