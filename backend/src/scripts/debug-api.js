const request = require('supertest');
const createApp = require('../server');
const logger = require('../utils/logger');

async function debugAPI() {
  try {
    logger.info('=== Debug da API ===');
    
    // Testar se o app está sendo criado corretamente
    logger.info('🧪 Criando app...');
    const { app } = createApp();
    logger.info('✅ App criado com sucesso');
    
    // Testar health check
    logger.info('🧪 Testando health check...');
    const healthResponse = await request(app).get('/health');
    logger.info(`✅ Health check: ${healthResponse.status}`);
    
    // Testar listagem com logs detalhados
    logger.info('🧪 Testando listagem de clientes...');
    
    try {
      const listResponse = await request(app).get('/api/clientes');
      logger.info(`✅ Status: ${listResponse.status}`);
      logger.info(`✅ Headers: ${JSON.stringify(listResponse.headers)}`);
      logger.info(`✅ Body: ${JSON.stringify(listResponse.body, null, 2)}`);
      
      if (listResponse.body.success) {
        logger.info('🎉 API funcionando perfeitamente!');
      } else {
        logger.error('❌ API retornou erro');
        logger.error(`Erro: ${listResponse.body.error}`);
        if (listResponse.body.stack) {
          logger.error(`Stack: ${listResponse.body.stack}`);
        }
      }
    } catch (apiError) {
      logger.error('❌ Erro na requisição da API:', apiError.message);
      logger.error('Stack:', apiError.stack);
    }
    
  } catch (error) {
    logger.error('❌ Erro geral:', error.message);
    logger.error('Stack:', error.stack);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  debugAPI();
}

module.exports = debugAPI;
