const { appendLead } = require('../services/googleSheets.service');
const { setState, updateState, clearState } = require('../store/conversationState.store');
const { parseNumberedOption } = require('../utils/messageParser');
const { isValidEmail } = require('../utils/validators');

const FLOW = 'crear_empresa';
const QUESTIONS = [
  '¿Qué necesitas hacer?\n1. Crear empresa desde cero\n2. Elegir tipo de sociedad\n3. Inicio de actividades\n4. Orientación general',
  '¿Ya tienes definido el nombre de la empresa?\n1. Sí\n2. No',
  '¿A qué rubro se dedicará la empresa?',
  '¿Cuántos socios tendrá?\n1. Solo yo\n2. Dos socios\n3. Tres o más\n4. No lo tengo claro',
  'Indícame tu nombre completo.',
  'Indícame tu correo electrónico.',
];
const NEEDS = { 1: 'Crear empresa desde cero', 2: 'Elegir tipo de sociedad', 3: 'Inicio de actividades', 4: 'Orientación general' };
const YES_NO = { 1: 'Sí', 2: 'No' };
const PARTNERS = { 1: 'Solo yo', 2: 'Dos socios', 3: 'Tres o más', 4: 'No lo tengo claro' };

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
      tipo_solicitud: 'Crear empresa',
      detalle: JSON.stringify(data),
      estado: 'nuevo',
    });
  } catch (error) {
    console.error('Solicitud de creación de empresa no pudo guardarse:', error.message);
  }

  clearState(phone);
  return `Perfecto. Hemos registrado tu solicitud ✅

El equipo revisará tu caso y te orientará sobre los pasos para crear tu empresa e iniciar actividades.`;
}

async function handle(phone, text, state) {
  const step = state.currentStep;
  const data = { ...(state.data || {}) };

  if (step === 0) data.necesidad = parseNumberedOption(text, NEEDS);
  if (step === 1) data.nombreDefinido = parseNumberedOption(text, YES_NO);
  if (step === 2) data.rubro = text.trim();
  if (step === 3) data.socios = parseNumberedOption(text, PARTNERS);
  if (step === 4) data.nombre = text.trim();
  if (step === 5) {
    if (!isValidEmail(text)) return 'El correo parece inválido. Por favor escribe un correo electrónico válido.';
    data.correo = text.trim();
    return finish(phone, data);
  }

  updateState(phone, { currentStep: step + 1, data });
  return QUESTIONS[step + 1];
}

module.exports = { start, handle };
