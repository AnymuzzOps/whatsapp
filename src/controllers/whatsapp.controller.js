const env = require('../config/env');
const whatsappService = require('../services/whatsapp.service');
const stateStore = require('../store/conversationState.store');
const { CANCEL_MESSAGE } = require('../constants/messages');
const { extractIncomingMessage, parseGlobalCommand, parseMenuOption, GLOBAL_COMMANDS } = require('../utils/messageParser');
const mainMenuFlow = require('../flows/mainMenu.flow');
const asesoriaContableFlow = require('../flows/asesoriaContable.flow');
const consultaTributariaFlow = require('../flows/consultaTributaria.flow');
const crearEmpresaFlow = require('../flows/crearEmpresa.flow');
const documentosFlow = require('../flows/documentos.flow');
const agendarReunionFlow = require('../flows/agendarReunion.flow');
const humanoFlow = require('../flows/humano.flow');

const flowHandlers = {
  asesoria_contable: asesoriaContableFlow,
  consulta_tributaria: consultaTributariaFlow,
  crear_empresa: crearEmpresaFlow,
  documentos: documentosFlow,
  agendar_reunion: agendarReunionFlow,
  pendiente_humano: humanoFlow,
};

function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.whatsappVerifyToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
}

async function startSelectedFlow(phone, selectedFlow) {
  if (selectedFlow === 'humano') return humanoFlow.start(phone);
  const flow = flowHandlers[selectedFlow];
  if (!flow) return mainMenuFlow.resetToMainMenu(phone);
  return flow.start(phone);
}

async function processIncomingMessage(incomingMessage) {
  const { from: phone, text = '' } = incomingMessage;
  const currentState = stateStore.getState(phone);
  const globalCommand = parseGlobalCommand(text);

  if (globalCommand === GLOBAL_COMMANDS.MENU) {
    return mainMenuFlow.resetToMainMenu(phone);
  }

  if (globalCommand === GLOBAL_COMMANDS.CANCELAR) {
    stateStore.clearState(phone);
    return CANCEL_MESSAGE;
  }

  if (globalCommand === GLOBAL_COMMANDS.HUMANO) {
    return humanoFlow.start(phone);
  }

  if (!currentState) {
    const selectedFlow = parseMenuOption(text);
    if (selectedFlow) return startSelectedFlow(phone, selectedFlow);
    return mainMenuFlow.resetToMainMenu(phone);
  }

  if (currentState.currentFlow === 'main_menu') {
    const selectedFlow = parseMenuOption(text);
    if (selectedFlow) return startSelectedFlow(phone, selectedFlow);
    return 'No logré reconocer la opción. Por favor responde con un número del 1 al 6 o escribe MENÚ para ver las opciones.';
  }

  const flow = flowHandlers[currentState.currentFlow];
  if (!flow) return mainMenuFlow.resetToMainMenu(phone);

  return flow.handle(phone, text, currentState, incomingMessage);
}

async function receiveWebhook(req, res) {
  const incomingMessage = extractIncomingMessage(req.body);

  if (!incomingMessage) return res.sendStatus(200);

  res.sendStatus(200);

  try {
    const responseText = await processIncomingMessage(incomingMessage);
    await whatsappService.sendTextMessage(incomingMessage.from, responseText);
  } catch (error) {
    console.error('Error procesando mensaje entrante:', error.response?.data || error.message);
    try {
      await whatsappService.sendTextMessage(
        incomingMessage.from,
        'Tuvimos un problema procesando tu mensaje. Por favor intenta nuevamente o escribe HUMANO para hablar con una persona.',
      );
    } catch (sendError) {
      console.error('No fue posible enviar mensaje de error al usuario:', sendError.response?.data || sendError.message);
    }
  }
}

module.exports = {
  verifyWebhook,
  receiveWebhook,
};
