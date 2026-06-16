const axios = require('axios');
const env = require('../config/env');

async function downloadMediaFromWhatsApp(mediaId) {
  if (!mediaId) throw new Error('mediaId es requerido para descargar archivos.');
  if (!env.whatsappToken) throw new Error('WHATSAPP_TOKEN no configurado.');

  // Base preparada para una futura descarga real desde WhatsApp Cloud API.
  const metadata = await axios.get(
    `https://graph.facebook.com/${env.whatsappGraphApiVersion}/${mediaId}`,
    { headers: { Authorization: `Bearer ${env.whatsappToken}` } },
  );

  const file = await axios.get(metadata.data.url, {
    responseType: 'arraybuffer',
    headers: { Authorization: `Bearer ${env.whatsappToken}` },
  });

  return Buffer.from(file.data);
}

async function uploadFileToDrive(fileBuffer, fileName, folderName = 'WhatsApp MyR Consultores') {
  // Stub intencional: dejar listo el contrato para integrar Google Drive API.
  console.info('Google Drive upload pendiente de implementación real:', {
    fileName,
    folderName,
    bytes: fileBuffer?.length || 0,
  });
  return { uploaded: false, fileName, folderName };
}

module.exports = {
  downloadMediaFromWhatsApp,
  uploadFileToDrive,
};
