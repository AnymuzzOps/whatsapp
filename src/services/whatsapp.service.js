const axios = require('axios');
const env = require('../config/env');
const { MAIN_MENU_MESSAGE } = require('../constants/messages');

function getMessagesUrl() {
  return `https://graph.facebook.com/${env.whatsappGraphApiVersion}/${env.whatsappPhoneNumberId}/messages`;
}

async function sendTextMessage(to, text) {
  if (!env.whatsappToken || !env.whatsappPhoneNumberId) {
    console.warn('WhatsApp Cloud API no está configurada. Mensaje no enviado.');
    return { sent: false, reason: 'missing_whatsapp_env' };
  }

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  };

  try {
    const response = await axios.post(getMessagesUrl(), payload, {
      headers: {
        Authorization: `Bearer ${env.whatsappToken}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error enviando mensaje por WhatsApp:', error.response?.data || error.message);
    return { sent: false, error: error.message };
  }
}

async function sendMenuMessage(to) {
  return sendTextMessage(to, MAIN_MENU_MESSAGE);
}

module.exports = {
  sendTextMessage,
  sendMenuMessage,
};
