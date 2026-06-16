const { HUMAN_HANDOFF_MESSAGE } = require('../constants/messages');
const { setState, updateState } = require('../store/conversationState.store');

function start(phone) {
  setState(phone, {
    currentFlow: 'pendiente_humano',
    currentStep: 0,
    data: { estado: 'pendiente_humano' },
  });
  return HUMAN_HANDOFF_MESSAGE;
}

function handle(phone, text) {
  updateState(phone, {
    currentFlow: 'pendiente_humano',
    data: { ultimaConsulta: text, estado: 'pendiente_humano' },
  });
  return 'Gracias. Dejamos tu mensaje registrado para que una persona del equipo lo revise.';
}

module.exports = {
  start,
  handle,
};
