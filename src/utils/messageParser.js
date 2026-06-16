const GLOBAL_COMMANDS = {
  MENU: 'menu',
  CANCELAR: 'cancelar',
  HUMANO: 'humano',
};

function normalizeText(text = '') {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function parseGlobalCommand(text = '') {
  const normalized = normalizeText(text);
  if (['menu', 'menú', 'inicio', 'ayuda', 'hola'].map(normalizeText).includes(normalized)) return GLOBAL_COMMANDS.MENU;
  if (normalized === 'cancelar') return GLOBAL_COMMANDS.CANCELAR;
  if (['humano', 'persona', 'asesor'].includes(normalized)) return GLOBAL_COMMANDS.HUMANO;
  return null;
}

function parseMenuOption(text = '') {
  const normalized = normalizeText(text);
  if (/^1\b/.test(normalized) || normalized.includes('asesoria') || normalized.includes('contabilidad')) return 'asesoria_contable';
  if (/^2\b/.test(normalized) || normalized.includes('tributaria') || normalized.includes('iva') || normalized.includes('f29') || normalized.includes('impuestos')) return 'consulta_tributaria';
  if (/^3\b/.test(normalized) || normalized.includes('crear empresa') || normalized === 'empresa') return 'crear_empresa';
  if (/^4\b/.test(normalized) || normalized.includes('documentos') || normalized.includes('enviar documentos')) return 'documentos';
  if (/^5\b/.test(normalized) || normalized.includes('reunion') || normalized.includes('agendar')) return 'agendar_reunion';
  if (/^6\b/.test(normalized) || normalized.includes('humano') || normalized.includes('persona') || normalized.includes('asesor')) return 'humano';
  return null;
}

function parseNumberedOption(text = '', options = {}) {
  const normalized = normalizeText(text);
  const numberMatch = normalized.match(/^\d+/);
  if (numberMatch && options[numberMatch[0]]) return options[numberMatch[0]];

  const match = Object.values(options).find((label) => {
    const normalizedLabel = normalizeText(label);
    return normalizedLabel.includes(normalized) || normalized.includes(normalizedLabel);
  });

  return match || String(text).trim();
}

function extractIncomingMessage(body = {}) {
  const value = body.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  const contact = value?.contacts?.[0];

  if (!message) return null;

  return {
    from: message.from,
    contactName: contact?.profile?.name || null,
    type: message.type,
    text: message.text?.body || message.button?.text || message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '',
    messageId: message.id,
    timestamp: message.timestamp,
    mediaId: message.document?.id || message.image?.id || null,
    raw: message,
  };
}

module.exports = {
  GLOBAL_COMMANDS,
  normalizeText,
  parseGlobalCommand,
  parseMenuOption,
  parseNumberedOption,
  extractIncomingMessage,
};
