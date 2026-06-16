function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
}

function isOmittedRut(value = '') {
  return ['omitir', 'omitire', 'prefiero entregarlo despues'].includes(
    String(value).trim().toLowerCase(),
  );
}

module.exports = {
  isValidEmail,
  isOmittedRut,
};
