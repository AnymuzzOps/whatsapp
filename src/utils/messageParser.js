const { normalizeText } = require('./formatters');

const GLOBAL_COMMANDS = {
  MENU: 'menu',
  CANCELAR: 'cancelar',
  HUMANO: 'humano',
};

function parseGlobalCommand(text = '') {
  const normalized = normalizeText(text);
  if (['menu', 'menú', 'inicio'].map(normalizeText).includes(normalized)) return GLOBAL_COMMANDS.MENU;
  if (normalized === 'cancelar') return GLOBAL_COMMANDS.CANCELAR;
  if (['humano', 'persona', 'ejecutivo', 'asesor'].includes(normalized)) return GLOBAL_COMMANDS.HUMANO;
  return null;
}

function parseMenuOption(text = '') {
  const normalized = normalizeText(text);
  if (/^1\b/.test(normalized) || normalized.includes('asesoria') || normalized.includes('contab')) return 'asesoria_contable';
  if (/^2\b/.test(normalized) || normalized.includes('tribut') || normalized.includes('iva') || normalized.includes('f29') || normalized.includes('renta')) return 'consulta_tributaria';
  if (/^3\b/.test(normalized) || normalized.includes('crear') || normalized.includes('empresa') || normalized.includes('sociedad')) return 'crear_empresa';
  if (/^4\b/.test(normalized) || normalized.includes('document') || normalized.includes('factura') || normalized.includes('boleta')) return 'documentos';
  if (/^5\b/.test(normalized) || normalized.includes('agendar') || normalized.includes('reunion') || normalized.includes('hora')) return 'agendar_reunion';
  if (/^6\b/.test(normalized) || normalized.includes('humano') || normalized.includes('persona') || normalized.includes('ejecutivo')) return 'humano';
  return null;
}

function parseNumberedOption(text = '', options = {}) {
  const normalized = normalizeText(text);
  const numberMatch = normalized.match(/^\d+/);
  if (numberMatch && options[numberMatch[0]]) return options[numberMatch[0]];

  return Object.entries(options).find(([, label]) => normalizeText(label).includes(normalized) || normalized.includes(normalizeText(label)))?.[1] || text;
}

function extractIncomingMessage(body = {}) {
  const value = body.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  const contact = value?.contacts?.[0];

  if (!message) return null;

  return {
    from: message.from,
    contactName: contact?.profile?.name || null,
    text: message.text?.body || message.button?.text || message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '',
    type: message.type,
    timestamp: message.timestamp,
    messageId: message.id,
    mediaId: message.document?.id || message.image?.id || message.video?.id || message.audio?.id || null,
    raw: message,
  };
}

module.exports = {
  GLOBAL_COMMANDS,
  parseGlobalCommand,
  parseMenuOption,
  parseNumberedOption,
  extractIncomingMessage,
};
