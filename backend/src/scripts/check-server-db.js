const db = require('../config/databaseInstance');
const logger = require('../utils/logger');

async function checkServerDB() {
  try {
    logger.info('=== Verificação do Banco no Servidor ===');
    
    // Verificar se o banco está conectado
    logger.info('🔍 Verificando status da conexão...');
    
    // Tentar uma consulta simples
    try {
      const result = await db.get('SELECT COUNT(*) as total FROM clientes');
      logger.info(`✅ Banco conectado - Total de clientes: ${result.total}`);
    } catch (error) {
      logger.error('❌ Banco não conectado:', error.message);
      
      // Tentar conectar
      logger.info('🔌 Tentando conectar ao banco...');
      await db.connect();
      logger.info('✅ Banco conectado com sucesso');
      
      // Testar novamente
      const result = await db.get('SELECT COUNT(*) as total FROM clientes');
      logger.info(`✅ Consulta funcionando - Total de clientes: ${result.total}`);
    }
    
  } catch (error) {
    logger.error('❌ Erro na verificação:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkServerDB();
}

module.exports = checkServerDB;

