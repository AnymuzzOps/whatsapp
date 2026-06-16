function normalizeText(text = '') {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatDateParts(date = new Date()) {
  return {
    fecha: date.toLocaleDateString('es-CL', { timeZone: 'America/Santiago' }),
    hora: date.toLocaleTimeString('es-CL', { timeZone: 'America/Santiago', hour12: false }),
  };
}

function stringifyDetails(data = {}) {
  return Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ');
}

module.exports = {
  normalizeText,
  formatDateParts,
  stringifyDetails,
};
