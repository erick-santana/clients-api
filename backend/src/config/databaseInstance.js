const Database = require('./database');
const logger = require('../utils/logger');

// Instância singleton do banco de dados
const db = new Database();

// Função para garantir que o banco esteja conectado
const ensureConnection = async () => {
  try {
    if (!db.connection) {
      logger.info('Conectando instância singleton do banco...');
      await db.connect();
      logger.info('Instância singleton do banco conectada');
    }
  } catch (error) {
    logger.error('Erro ao conectar instância singleton:', error);
    throw error;
  }
};

// Sobrescrever métodos para garantir conexão
const originalGet = db.get.bind(db);
const originalAll = db.all.bind(db);
const originalRun = db.run.bind(db);

db.get = async (sql, params = []) => {
  await ensureConnection();
  return originalGet(sql, params);
};

db.all = async (sql, params = []) => {
  await ensureConnection();
  return originalAll(sql, params);
};

db.run = async (sql, params = []) => {
  await ensureConnection();
  return originalRun(sql, params);
};

module.exports = db;
