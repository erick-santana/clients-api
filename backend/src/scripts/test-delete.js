const ClienteRepository = require('../repositories/ClienteRepository');
const Database = require('../config/database');
const logger = require('../utils/logger');

async function testDelete() {
  const db = new Database();
  const clienteRepository = new ClienteRepository(db);
  
  try {
    logger.info('=== Teste de Exclusão de Cliente ===');
    
    // Conectar ao banco
    await db.connect();
    logger.info('✅ Banco conectado');
    
    // Listar clientes
    const clientes = await db.all('SELECT id, nome, email FROM clientes LIMIT 3');
    logger.info(`✅ Encontrados ${clientes.length} clientes`);
    
    if (clientes.length > 0) {
      const clienteParaExcluir = clientes[0];
      logger.info(`🧪 Testando exclusão do cliente ID: ${clienteParaExcluir.id} - ${clienteParaExcluir.nome}`);
      
      // Testar exclusão via repository
      const resultado = await clienteRepository.delete(clienteParaExcluir.id);
      logger.info(`✅ Exclusão via repository: ${JSON.stringify(resultado)}`);
      
      // Verificar se foi excluído
      const clienteAposExclusao = await db.get('SELECT id FROM clientes WHERE id = ?', [clienteParaExcluir.id]);
      if (!clienteAposExclusao) {
        logger.info('✅ Cliente excluído com sucesso do banco');
      } else {
        logger.error('❌ Cliente não foi excluído do banco');
      }
    }
    
  } catch (error) {
    logger.error('❌ Erro no teste de exclusão:', error);
  } finally {
    await db.disconnect();
    logger.info('✅ Banco desconectado');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testDelete();
}

module.exports = testDelete;

