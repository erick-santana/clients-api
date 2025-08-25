const request = require('supertest');
const createApp = require('../server');
const db = require('../config/databaseInstance');
const logger = require('../utils/logger');

async function testAPI() {
  const { app } = createApp();
  
  try {
    logger.info('=== Teste da API ===');
    
    // Conectar ao banco de dados
    logger.info('🔌 Conectando ao banco de dados...');
    await db.connect();
    logger.info('✅ Banco de dados conectado');
    
    // Testar health check
    logger.info('🧪 Testando health check...');
    const healthResponse = await request(app).get('/health');
    logger.info(`✅ Health check: ${healthResponse.status} - ${JSON.stringify(healthResponse.body)}`);
    
    // Testar listagem de clientes
    logger.info('🧪 Testando listagem de clientes...');
    const listResponse = await request(app).get('/api/clientes');
    logger.info(`✅ Listagem: ${listResponse.status} - ${listResponse.body.success ? 'Sucesso' : 'Erro'}`);
    
    if (listResponse.body.success && listResponse.body.data && listResponse.body.data.length > 0) {
      const clienteParaExcluir = listResponse.body.data[0];
      logger.info(`🧪 Testando exclusão do cliente ID: ${clienteParaExcluir.id}`);
      
      const deleteResponse = await request(app).delete(`/api/clientes/${clienteParaExcluir.id}`);
      logger.info(`✅ Exclusão: ${deleteResponse.status} - ${JSON.stringify(deleteResponse.body)}`);
      
      // Verificar se foi excluído
      const verifyResponse = await request(app).get(`/api/clientes/${clienteParaExcluir.id}`);
      logger.info(`✅ Verificação: ${verifyResponse.status} - ${verifyResponse.body.success ? 'Cliente ainda existe' : 'Cliente excluído'}`);
    }
    
  } catch (error) {
    logger.error('❌ Erro no teste da API:', error);
  } finally {
    // Desconectar do banco
    try {
      await db.disconnect();
      logger.info('✅ Banco de dados desconectado');
    } catch (error) {
      logger.error('❌ Erro ao desconectar banco:', error);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
