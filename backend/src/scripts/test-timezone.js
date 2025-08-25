const Database = require('../config/database');
const logger = require('../utils/logger');
const { nowUTC3, nowUTC3ISOString, nowUTC3MySQLString, formatToBrazilianDate } = require('../utils/dateUtils');

async function testTimezone() {
  const db = new Database();
  
  try {
    await db.connect();
    
    logger.info('=== Teste de Timezone UTC-3 ===');
    
    // Testar funções de data
    const dataAtual = new Date();
    const dataUTC3 = nowUTC3();
    const dataUTC3ISO = nowUTC3ISOString();
    const dataUTC3MySQL = nowUTC3MySQLString();
    const dataBrasil = formatToBrazilianDate(dataAtual);
    
    logger.info(`Data atual (sistema): ${dataAtual.toISOString()}`);
    logger.info(`Data UTC-3 (função): ${dataUTC3.toISOString()}`);
    logger.info(`Data UTC-3 ISO: ${dataUTC3ISO}`);
    logger.info(`Data UTC-3 MySQL: ${dataUTC3MySQL}`);
    logger.info(`Data Brasil (formatada): ${dataBrasil}`);
    
    // Verificar dados na tabela
    const clientes = await db.all('SELECT id, nome, created_at, updated_at FROM clientes ORDER BY id DESC LIMIT 3');
    logger.info('\n=== Dados na Tabela ===');
    clientes.forEach(cliente => {
      const createdBrasil = formatToBrazilianDate(cliente.created_at);
      const updatedBrasil = formatToBrazilianDate(cliente.updated_at);
      logger.info(`ID: ${cliente.id}, Nome: ${cliente.nome}`);
      logger.info(`  Created (raw): ${cliente.created_at}`);
      logger.info(`  Created (BR): ${createdBrasil}`);
      logger.info(`  Updated (raw): ${cliente.updated_at}`);
      logger.info(`  Updated (BR): ${updatedBrasil}`);
      logger.info('---');
    });
    
    // Testar diferença de timezone
    const diffHours = (dataAtual.getTime() - dataUTC3.getTime()) / (1000 * 60 * 60);
    logger.info(`\nDiferença de timezone: ${diffHours} horas`);
    
    if (Math.abs(diffHours - 3) < 0.1) {
      logger.info('✅ Timezone UTC-3 funcionando corretamente!');
    } else {
      logger.error('❌ Problema com timezone UTC-3!');
    }
    
  } catch (error) {
    logger.error('Erro no teste de timezone:', error);
  } finally {
    await db.disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testTimezone();
}

module.exports = testTimezone;

