const { appendLead } = require('../services/googleSheets.service');
const { setState, updateState, clearState } = require('../store/conversationState.store');
const { parseNumberedOption } = require('../utils/messageParser');
const { isValidEmail } = require('../utils/validators');
const { stringifyDetails } = require('../utils/formatters');

const FLOW = 'agendar_reunion';
const QUESTIONS = [
  'Indícame tu nombre completo.',
  'Indícame tu correo electrónico.',
  '¿Cuál es el motivo de la reunión?\n1. Asesoría contable\n2. Consulta tributaria\n3. Crear empresa\n4. Revisión de documentos\n5. Otro',
  '¿Qué día u horario prefieres? Ejemplo: lunes en la tarde, miércoles en la mañana, etc.',
];
const REASONS = { 1: 'Asesoría contable', 2: 'Consulta tributaria', 3: 'Crear empresa', 4: 'Revisión de documentos', 5: 'Otro' };

function start(phone) {
  setState(phone, { currentFlow: FLOW, currentStep: 0, data: {} });
  return QUESTIONS[0];
}

async function finish(phone, data) {
  try {
    await appendLead({
      telefono: phone,
      nombre: data.nombre,
      correo: data.correo,
      tipo_solicitud: 'Solicitud de reunión',
      detalle: stringifyDetails(data),
      estado: 'pendiente_confirmacion',
    });
  } catch (error) {
    console.error('Solicitud de reunión no pudo guardarse:', error.message);
  }

  clearState(phone);
  return `Gracias. Hemos recibido tu solicitud de reunión ✅

El equipo revisará disponibilidad y te contactará para confirmar el horario.`;
}

async function handle(phone, text, state) {
  const step = state.currentStep;
  const data = { ...(state.data || {}) };

  if (step === 0) data.nombre = text.trim();
  if (step === 1) {
    if (!isValidEmail(text)) return 'El correo parece inválido. Por favor escribe un correo electrónico válido.';
    data.correo = text.trim();
  }
  if (step === 2) data.motivo = parseNumberedOption(text, REASONS);
  if (step === 3) {
    data.preferencia = text.trim();
    return finish(phone, data);
  }

  updateState(phone, { currentStep: step + 1, data });
  return QUESTIONS[step + 1];
}

module.exports = { start, handle };
