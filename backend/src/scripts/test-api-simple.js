const request = require('supertest');
const createApp = require('../server');
const logger = require('../utils/logger');

async function testAPISimple() {
  const { app } = createApp();
  
  try {
    logger.info('=== Teste Simples da API ===');
    
    // Testar listagem de clientes
    logger.info('🧪 Testando listagem de clientes...');
    const listResponse = await request(app).get('/api/clientes');
    
    logger.info(`Status: ${listResponse.status}`);
    logger.info(`Body: ${JSON.stringify(listResponse.body, null, 2)}`);
    
    if (listResponse.body.success) {
      logger.info('✅ API funcionando corretamente!');
    } else {
      logger.error('❌ API com erro');
    }
    
  } catch (error) {
    logger.error('❌ Erro no teste:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testAPISimple();
}

module.exports = testAPISimple;

