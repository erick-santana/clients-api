const request = require('supertest');
const createApp = require('../server');
const logger = require('../utils/logger');

async function testAPIFixed() {
  const { app } = createApp();
  
  try {
    logger.info('=== Teste da API Corrigida ===');
    
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
      
      // Mostrar dados dos clientes
      listResponse.body.data.forEach(cliente => {
        logger.info(`  ID: ${cliente.id}, Nome: ${cliente.nome}, Email: ${cliente.email}, Saldo: ${cliente.saldo}`);
      });
    } else {
      logger.error(`❌ Erro na listagem: ${JSON.stringify(listResponse.body)}`);
    }
    
    // Testar busca por ID (se houver clientes)
    if (listResponse.body.success && listResponse.body.data.length > 0) {
      const primeiroCliente = listResponse.body.data[0];
      logger.info(`🧪 Testando busca por ID: ${primeiroCliente.id}`);
      
      const buscaResponse = await request(app).get(`/api/clientes/${primeiroCliente.id}`);
      logger.info(`✅ Busca por ID: ${buscaResponse.status} - ${buscaResponse.body.success ? 'Sucesso' : 'Erro'}`);
      
      if (buscaResponse.body.success) {
        logger.info(`✅ Cliente encontrado: ${buscaResponse.body.data.nome}`);
      }
    }
    
  } catch (error) {
    logger.error('❌ Erro no teste da API corrigida:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testAPIFixed();
}

module.exports = testAPIFixed;

