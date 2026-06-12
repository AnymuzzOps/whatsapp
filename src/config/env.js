const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: process.env.PORT || 3000,
  whatsappToken: process.env.WHATSAPP_TOKEN,
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
  whatsappGraphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION || 'v21.0',
  googleSheetsId: process.env.GOOGLE_SHEETS_ID,
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
  adminEmail: process.env.ADMIN_EMAIL,
};

module.exports = env;
