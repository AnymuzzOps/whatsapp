const { appendLead } = require('../services/googleSheets.service');
const { setState, updateState, clearState } = require('../store/conversationState.store');
const { parseNumberedOption } = require('../utils/messageParser');
const { stringifyDetails } = require('../utils/formatters');

const FLOW = 'consulta_tributaria';
const QUESTIONS = [
  '¿Sobre qué tema necesitas ayuda?\n1. IVA / Formulario 29\n2. Declaración de renta\n3. Boletas o facturas\n4. Inicio de actividades\n5. Término de giro\n6. Regularización tributaria\n7. Otro',
  'Cuéntanos brevemente tu consulta.\n\nNo envíes claves del SII, contraseñas ni datos bancarios por este medio.',
  'Indícame tu nombre.',
  'Indícame tu correo o teléfono de contacto.',
];
const TOPICS = { 1: 'IVA / Formulario 29', 2: 'Declaración de renta', 3: 'Boletas o facturas', 4: 'Inicio de actividades', 5: 'Término de giro', 6: 'Regularización tributaria', 7: 'Otro' };

function start(phone) {
  setState(phone, { currentFlow: FLOW, currentStep: 0, data: {} });
  return QUESTIONS[0];
}

async function finish(phone, data) {
  try {
    await appendLead({
      telefono: phone,
      nombre: data.nombre,
      correo: data.contacto,
      tipo_solicitud: 'Consulta tributaria',
      detalle: stringifyDetails(data),
      estado: 'pendiente_revision_humana',
    });
  } catch (error) {
    console.error('Consulta tributaria no pudo guardarse:', error.message);
  }

  clearState(phone);
  return `Gracias. Tu consulta fue registrada ✅

Por tratarse de una materia tributaria, será revisada por una persona del equipo antes de entregarte una respuesta.

Por favor no envíes claves del SII, contraseñas ni información sensible por este medio.`;
}

async function handle(phone, text, state) {
  const step = state.currentStep;
  const data = { ...(state.data || {}) };

  if (step === 0) data.tema = parseNumberedOption(text, TOPICS);
  if (step === 1) data.consulta = text.trim();
  if (step === 2) data.nombre = text.trim();
  if (step === 3) {
    data.contacto = text.trim();
    return finish(phone, data);
  }

  updateState(phone, { currentStep: step + 1, data });
  return QUESTIONS[step + 1];
}

module.exports = { start, handle };
