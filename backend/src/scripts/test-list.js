const ClienteService = require('../services/ClienteService');
const ClienteRepository = require('../repositories/ClienteRepository');
const Database = require('../config/database');
const logger = require('../utils/logger');

async function testList() {
  const db = new Database();
  const clienteRepository = new ClienteRepository(db);
  const clienteService = new ClienteService(clienteRepository);
  
  try {
    logger.info('=== Teste de Listagem de Clientes ===');
    
    // Conectar ao banco
    await db.connect();
    logger.info('✅ Banco conectado');
    
    // Testar listagem via repository
    logger.info('🧪 Testando listagem via repository...');
    const resultRepository = await clienteRepository.findAllPaginated(10, 0, null, {});
    logger.info(`✅ Repository: ${resultRepository.clientes.length} clientes encontrados`);
    resultRepository.clientes.forEach(cliente => {
      logger.info(`  ID: ${cliente.id}, Nome: ${cliente.nome}, Email: ${cliente.email}`);
    });
    
    // Testar listagem via service
    logger.info('🧪 Testando listagem via service...');
    const resultService = await clienteService.listarTodos(1, 10, null, {});
    logger.info(`✅ Service: ${resultService.data.length} clientes encontrados`);
    logger.info(`✅ Paginação: ${resultService.pagination.total} total, ${resultService.pagination.totalPages} páginas`);
    
  } catch (error) {
    logger.error('❌ Erro no teste de listagem:', error);
  } finally {
    await db.disconnect();
    logger.info('✅ Banco desconectado');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testList();
}

module.exports = testList;

