const { appendLead } = require('../services/googleSheets.service');
const { setState, updateState, clearState } = require('../store/conversationState.store');
const { parseNumberedOption } = require('../utils/messageParser');
const { isValidEmail, isOmittedRut } = require('../utils/validators');

const FLOW = 'asesoria_contable';
const QUESTIONS = [
  'Perfecto. ¿Qué tipo de cliente eres?\n1. Persona natural\n2. Pyme\n3. Sociedad\n4. Emprendedor/a inicial\n5. No estoy seguro/a',
  'Indícame tu nombre completo.',
  'Indícame el nombre de tu empresa, si corresponde. Si no tienes empresa, escribe NO.',
  'Indícame tu RUT o RUT empresa. Si prefieres entregarlo después, escribe OMITIR.',
  '¿Cuál es tu correo electrónico?',
  '¿Cuál es tu giro o actividad?',
  '¿Qué servicio necesitas principalmente?\n1. Contabilidad mensual\n2. Declaración de IVA / Formulario 29\n3. Renta anual\n4. Remuneraciones\n5. Regularización contable\n6. Otro',
  '¿Tienes contabilidad atrasada?\n1. Sí\n2. No\n3. No estoy seguro/a',
];

const CLIENT_TYPES = { 1: 'Persona natural', 2: 'Pyme', 3: 'Sociedad', 4: 'Emprendedor/a inicial', 5: 'No estoy seguro/a' };
const SERVICES = { 1: 'Contabilidad mensual', 2: 'Declaración de IVA / Formulario 29', 3: 'Renta anual', 4: 'Remuneraciones', 5: 'Regularización contable', 6: 'Otro' };
const LATE_ACCOUNTING = { 1: 'Sí', 2: 'No', 3: 'No estoy seguro/a' };

function start(phone) {
  setState(phone, { currentFlow: FLOW, currentStep: 0, data: {} });
  return QUESTIONS[0];
}

async function finish(phone, data) {
  try {
    await appendLead({
      telefono: phone,
      nombre: data.nombre,
      empresa: data.empresa,
      rut: data.rut,
      correo: data.correo,
      tipo_solicitud: 'Asesoría contable',
      detalle: JSON.stringify(data),
      estado: 'nuevo',
    });
  } catch (error) {
    console.error('Lead de asesoría contable no pudo guardarse:', error.message);
  }

  clearState(phone);
  return `Gracias. Hemos registrado tu solicitud ✅

Una persona del equipo de MyR Consultores revisará tus antecedentes y te contactará para orientarte.

Recuerda no enviar claves personales, claves del SII ni contraseñas por este medio.`;
}

async function handle(phone, text, state) {
  const step = state.currentStep;
  const data = { ...(state.data || {}) };

  if (step === 0) data.tipoCliente = parseNumberedOption(text, CLIENT_TYPES);
  if (step === 1) data.nombre = text.trim();
  if (step === 2) data.empresa = text.trim().toLowerCase() === 'no' ? '' : text.trim();
  if (step === 3) data.rut = isOmittedRut(text) ? 'OMITIR' : text.trim();
  if (step === 4) {
    if (!isValidEmail(text)) return 'El correo parece inválido. Por favor escribe un correo electrónico válido.';
    data.correo = text.trim();
  }
  if (step === 5) data.giro = text.trim();
  if (step === 6) data.servicioPrincipal = parseNumberedOption(text, SERVICES);
  if (step === 7) {
    data.contabilidadAtrasada = parseNumberedOption(text, LATE_ACCOUNTING);
    return finish(phone, data);
  }

  updateState(phone, { currentStep: step + 1, data });
  return QUESTIONS[step + 1];
}

module.exports = { start, handle };
