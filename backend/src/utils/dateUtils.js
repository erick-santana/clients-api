/**
 * Utilitários para manipulação de datas no timezone UTC-3 (horário de Brasília)
 */

/**
 * Converte uma data para UTC-3 (horário de Brasília)
 * @param {Date} date - Data a ser convertida
 * @returns {Date} Data em UTC-3
 */
function toUTC3(date = new Date()) {
  // Criar uma nova data baseada na data fornecida
  const utcDate = new Date(date);
  // Aplicar offset de -3 horas (UTC-3)
  const utc3Offset = 3 * 60 * 60 * 1000; // 3 horas em milissegundos
  return new Date(utcDate.getTime() - utc3Offset);
}

/**
 * Converte uma data UTC-3 para ISO string
 * @param {Date} date - Data em UTC-3
 * @returns {string} Data em formato ISO string
 */
function toUTC3ISOString(date = new Date()) {
  return toUTC3(date).toISOString();
}

/**
 * Obtém a data atual em UTC-3
 * @returns {Date} Data atual em UTC-3
 */
function nowUTC3() {
  return toUTC3(new Date());
}

/**
 * Obtém a data atual em UTC-3 como ISO string
 * @returns {string} Data atual em UTC-3 como ISO string
 */
function nowUTC3ISOString() {
  return toUTC3ISOString(new Date());
}

/**
 * Converte uma data para string MySQL no formato UTC-3
 * @param {Date} date - Data a ser convertida
 * @returns {string} Data no formato MySQL (YYYY-MM-DD HH:mm:ss)
 */
function toUTC3MySQLString(date = new Date()) {
  const utc3Date = toUTC3(date);
  // Formatar manualmente para evitar problemas de timezone
  const year = utc3Date.getUTCFullYear();
  const month = String(utc3Date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utc3Date.getUTCDate()).padStart(2, '0');
  const hours = String(utc3Date.getUTCHours()).padStart(2, '0');
  const minutes = String(utc3Date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(utc3Date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Obtém a data atual em UTC-3 como string MySQL
 * @returns {string} Data atual em formato MySQL UTC-3
 */
function nowUTC3MySQLString() {
  return toUTC3MySQLString(new Date());
}

/**
 * Formata uma data para exibição no formato brasileiro
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada (dd/mm/yyyy HH:mm:ss)
 */
function formatToBrazilianDate(date) {
  const d = new Date(date);
  return d.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Formata uma data para exibição apenas da data (sem hora)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada (dd/mm/yyyy)
 */
function formatToBrazilianDateOnly(date) {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

module.exports = {
  toUTC3,
  toUTC3ISOString,
  nowUTC3,
  nowUTC3ISOString,
  toUTC3MySQLString,
  nowUTC3MySQLString,
  formatToBrazilianDate,
  formatToBrazilianDateOnly
};
