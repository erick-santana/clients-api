const Database = require('../config/database');
const logger = require('../utils/logger');
const { nowUTC3, nowUTC3ISOString, nowUTC3MySQLString } = require('../utils/dateUtils');

async function debugInsert() {
  const db = new Database();
  
  try {
    await db.connect();
    
    logger.info('=== Debug de Inserção de Datas ===');
    
    // Testar funções de data
    const dataAtual = new Date();
    const dataUTC3 = nowUTC3();
    const dataUTC3ISO = nowUTC3ISOString();
    const dataUTC3MySQL = nowUTC3MySQLString();
    
    logger.info(`Data atual: ${dataAtual.toISOString()}`);
    logger.info(`Data UTC-3: ${dataUTC3.toISOString()}`);
    logger.info(`Data UTC-3 ISO: ${dataUTC3ISO}`);
    logger.info(`Data UTC-3 MySQL: "${dataUTC3MySQL}"`);
    
    // Tentar inserir com data explícita
    const result = await db.run(
      'INSERT INTO clientes (nome, email, saldo, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      ['Debug Test', 'debug@test.com', 0, dataUTC3MySQL, dataUTC3MySQL]
    );
    
    logger.info(`Cliente inserido com ID: ${result.id}`);
    
    // Verificar se foi inserido corretamente
    const cliente = await db.get('SELECT id, nome, created_at, updated_at FROM clientes WHERE id = ?', [result.id]);
    logger.info(`Cliente recuperado:`, cliente);
    
    // Tentar inserir com data como Date object
    const result2 = await db.run(
      'INSERT INTO clientes (nome, email, saldo, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      ['Debug Test 2', 'debug2@test.com', 0, dataUTC3, dataUTC3]
    );
    
    logger.info(`Cliente 2 inserido com ID: ${result2.id}`);
    
    // Verificar se foi inserido corretamente
    const cliente2 = await db.get('SELECT id, nome, created_at, updated_at FROM clientes WHERE id = ?', [result2.id]);
    logger.info(`Cliente 2 recuperado:`, cliente2);
    
  } catch (error) {
    logger.error('Erro no debug:', error);
  } finally {
    await db.disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  debugInsert();
}

module.exports = debugInsert;

