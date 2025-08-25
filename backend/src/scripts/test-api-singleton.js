const request = require('supertest');
const createApp = require('../server');
const db = require('../config/databaseInstance');
const logger = require('../utils/logger');

async function testAPISingleton() {
  const { app } = createApp();
  
  try {
    logger.info('=== Teste da API com Singleton ===');
    
    // Verificar se o banco está conectado
    logger.info('🔍 Verificando status da conexão singleton...');
    
    try {
      const result = await db.get('SELECT COUNT(*) as total FROM clientes');
      logger.info(`✅ Banco singleton conectado - Total de clientes: ${result.total}`);
    } catch (error) {
      logger.error('❌ Banco singleton não conectado:', error.message);
      
      // Tentar conectar
      logger.info('🔌 Tentando conectar ao banco singleton...');
      await db.connect();
      logger.info('✅ Banco singleton conectado com sucesso');
      
      // Testar novamente
      const result = await db.get('SELECT COUNT(*) as total FROM clientes');
      logger.info(`✅ Consulta funcionando - Total de clientes: ${result.total}`);
    }
    
    // Testar health check
    logger.info('🧪 Testando health check...');
    const healthResponse = await request(app).get('/health');
    logger.info(`✅ Health check: ${healthResponse.status} - ${JSON.stringify(healthResponse.body)}`);
    
    // Testar listagem de clientes
    logger.info('🧪 Testando listagem de clientes...');
    const listResponse = await request(app).get('/api/clientes');
    logger.info(`✅ Listagem: ${listResponse.status} - ${listResponse.body.success ? 'Sucesso' : 'Erro'}`);
    
    if (listResponse.body.success) {
      logger.info(`✅ Dados: ${listResponse.body.data.length} clientes encontrados`);
      logger.info(`✅ Paginação: ${listResponse.body.pagination.total} total, ${listResponse.body.pagination.totalPages} páginas`);
    } else {
      logger.error(`❌ Erro na listagem: ${JSON.stringify(listResponse.body)}`);
    }
    
  } catch (error) {
    logger.error('❌ Erro no teste da API singleton:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testAPISingleton();
}

module.exports = testAPISingleton;

