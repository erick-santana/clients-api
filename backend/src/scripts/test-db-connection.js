const db = require('../config/databaseInstance');
const logger = require('../utils/logger');

async function testDBConnection() {
  try {
    logger.info('=== Teste de Conexão com Banco ===');
    
    // Verificar se o banco está conectado
    logger.info('🔍 Verificando status da conexão...');
    
    try {
      const result = await db.get('SELECT COUNT(*) as total FROM clientes');
      logger.info(`✅ Banco conectado - Total de clientes: ${result.total}`);
      
      // Testar listagem completa
      const clientes = await db.all('SELECT id, nome, email, saldo, created_at, updated_at FROM clientes');
      logger.info(`✅ Listagem completa: ${clientes.length} clientes`);
      
      clientes.forEach(cliente => {
        logger.info(`  ID: ${cliente.id}, Nome: ${cliente.nome}, Email: ${cliente.email}, Saldo: ${cliente.saldo}`);
        logger.info(`    Created: ${cliente.created_at}, Updated: ${cliente.updated_at}`);
      });
      
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
    logger.error('❌ Erro no teste de conexão:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testDBConnection();
}

module.exports = testDBConnection;

