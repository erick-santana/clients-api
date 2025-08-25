const Database = require('../config/database');
const logger = require('../utils/logger');

async function testConnection() {
  const db = new Database();
  
  try {
    logger.info('=== Teste de Conexão com Banco ===');
    
    // Testar conexão
    await db.connect();
    logger.info('✅ Conexão estabelecida com sucesso');
    
    // Testar consulta simples
    const result = await db.get('SELECT COUNT(*) as total FROM clientes');
    logger.info(`✅ Consulta executada: ${result.total} clientes encontrados`);
    
    // Testar listagem de clientes
    const clientes = await db.all('SELECT id, nome, email FROM clientes LIMIT 3');
    logger.info('✅ Listagem de clientes:');
    clientes.forEach(cliente => {
      logger.info(`  ID: ${cliente.id}, Nome: ${cliente.nome}, Email: ${cliente.email}`);
    });
    
    // Testar exclusão (se houver clientes)
    if (clientes.length > 0) {
      const clienteParaExcluir = clientes[0];
      logger.info(`🧪 Testando exclusão do cliente ID: ${clienteParaExcluir.id}`);
      
      const deleteResult = await db.run('DELETE FROM clientes WHERE id = ?', [clienteParaExcluir.id]);
      logger.info(`✅ Exclusão executada: ${deleteResult.changes} registros afetados`);
      
      // Verificar se foi excluído
      const clienteAposExclusao = await db.get('SELECT id FROM clientes WHERE id = ?', [clienteParaExcluir.id]);
      if (!clienteAposExclusao) {
        logger.info('✅ Cliente excluído com sucesso');
      } else {
        logger.error('❌ Cliente não foi excluído');
      }
    }
    
  } catch (error) {
    logger.error('❌ Erro no teste de conexão:', error);
  } finally {
    await db.disconnect();
    logger.info('✅ Conexão fechada');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testConnection();
}

module.exports = testConnection;

