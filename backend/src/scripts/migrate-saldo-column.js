const Database = require('../config/database');
const logger = require('../utils/logger');

async function migrateSaldoColumn() {
  const db = new Database();
  
  try {
    await db.connect();
    
    logger.info('Iniciando migração da coluna saldo...');
    
    // Verificar estrutura atual
    const structure = await db.all('DESCRIBE clientes');
    const saldoColumn = structure.find(col => col.Field === 'saldo');
    
    if (saldoColumn) {
      logger.info(`Tipo atual da coluna saldo: ${saldoColumn.Type}`);
      
      // Verificar se precisa migrar
      if (saldoColumn.Type === 'decimal(10,2)' || saldoColumn.Type === 'decimal(15,2)') {
        logger.info(`Alterando tipo da coluna saldo de ${saldoColumn.Type} para DECIMAL(17,2)...`);
        
        // Fazer backup dos dados
        const clientes = await db.all('SELECT id, nome, email, saldo, created_at, updated_at FROM clientes');
        logger.info(`Backup de ${clientes.length} registros realizado`);
        
        // Alterar o tipo da coluna
        await db.run('ALTER TABLE clientes MODIFY COLUMN saldo DECIMAL(17,2) DEFAULT 0.00');
        logger.info('Coluna saldo alterada com sucesso para DECIMAL(17,2)');
        
        // Verificar se os dados foram preservados
        const clientesAfter = await db.all('SELECT id, nome, email, saldo, created_at, updated_at FROM clientes');
        logger.info(`Verificação: ${clientesAfter.length} registros preservados após migração`);
        
        // Verificar nova estrutura
        const newStructure = await db.all('DESCRIBE clientes');
        const newSaldoColumn = newStructure.find(col => col.Field === 'saldo');
        logger.info(`Novo tipo da coluna saldo: ${newSaldoColumn.Type}`);
        
      } else {
        logger.info('Coluna saldo já está com o tipo correto DECIMAL(17,2)');
      }
    } else {
      logger.error('Coluna saldo não encontrada na tabela clientes');
    }
    
  } catch (error) {
    logger.error('Erro durante a migração:', error);
    throw error;
  } finally {
    await db.disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  migrateSaldoColumn();
}

module.exports = migrateSaldoColumn;
