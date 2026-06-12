const axios = require('axios');
const env = require('../config/env');
const { MAIN_MENU_MESSAGE } = require('../constants/messages');

function getGraphUrl(path) {
  return `https://graph.facebook.com/${env.whatsappGraphApiVersion}/${path}`;
}

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${env.whatsappToken}`,
    'Content-Type': 'application/json',
  };
}

async function sendTextMessage(to, text) {
  if (!env.whatsappToken || !env.whatsappPhoneNumberId) {
    console.warn('WhatsApp Cloud API no está configurada. Mensaje omitido en entorno local.');
    return null;
  }

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { preview_url: false, body: text },
  };

  const response = await axios.post(
    getGraphUrl(`${env.whatsappPhoneNumberId}/messages`),
    payload,
    { headers: getAuthHeaders() },
  );

  return response.data;
}

async function sendMenuMessage(to) {
  return sendTextMessage(to, MAIN_MENU_MESSAGE);
}

async function markMessageAsRead(messageId) {
  if (!env.whatsappToken || !env.whatsappPhoneNumberId || !messageId) return null;

  const payload = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  };

  try {
    const response = await axios.post(
      getGraphUrl(`${env.whatsappPhoneNumberId}/messages`),
      payload,
      { headers: getAuthHeaders() },
    );
    return response.data;
  } catch (error) {
    console.error('No fue posible marcar el mensaje como leído:', error.response?.data || error.message);
    return null;
  }
}

module.exports = {
  sendTextMessage,
  sendMenuMessage,
  markMessageAsRead,
};
