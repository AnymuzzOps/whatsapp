const env = require('../config/env');

async function notifyAdmin(subject, payload = {}) {
  // Base para futura integración con correo, Slack o CRM.
  if (!env.adminEmail) return { skipped: true };
  console.info(`Notificación interna pendiente para ${env.adminEmail}: ${subject}`, payload);
  return { queued: false, adminEmail: env.adminEmail };
}

module.exports = {
  notifyAdmin,
};
