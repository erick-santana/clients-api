const Database = require('../config/database');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

async function recreateTable() {
  const db = new Database();
  
  try {
    await db.connect();
    
    logger.info('Recriando tabela clientes com timezone UTC-3...');
    
    // Verificar se existe tabela de operações_log e remover foreign key
    try {
      await db.run('ALTER TABLE operacoes_log DROP FOREIGN KEY operacoes_log_ibfk_1');
      logger.info('Foreign key removida da tabela operacoes_log');
    } catch (error) {
      logger.info('Tabela operacoes_log não existe ou não tem foreign key');
    }
    
    // Dropar tabela existente
    await db.run('DROP TABLE IF EXISTS clientes');
    logger.info('Tabela clientes removida');
    
    // Recriar tabela com estrutura correta
    await db.run(`
      CREATE TABLE clientes (
        id CHAR(36) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        saldo DECIMAL(17,2) DEFAULT 0.00,
        created_at TIMESTAMP NULL,
        updated_at TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    logger.info('Tabela clientes recriada com sucesso');
    
    // Inserir dados de exemplo com timezone UTC-3
    const { nowUTC3MySQLString } = require('../utils/dateUtils');
    const dataUTC3MySQL = nowUTC3MySQLString();
    
    await db.run(`
      INSERT INTO clientes (id, nome, email, saldo, created_at, updated_at) VALUES 
      (?, 'João Silva', 'joao@example.com', 1000.00, ?, ?),
      (?, 'Maria Santos', 'maria@example.com', 2500.00, ?, ?),
      (?, 'Pedro Oliveira', 'pedro@example.com', 500.00, ?, ?)
    `, [uuidv4(), dataUTC3MySQL, dataUTC3MySQL, uuidv4(), dataUTC3MySQL, dataUTC3MySQL, uuidv4(), dataUTC3MySQL, dataUTC3MySQL]);
    
    logger.info('Dados de exemplo inseridos com timezone UTC-3');
    
    // Verificar dados inseridos
    const clientes = await db.all('SELECT id, nome, email, saldo, created_at, updated_at FROM clientes');
    logger.info('Dados na tabela:');
    clientes.forEach(cliente => {
      logger.info(`ID: ${cliente.id}, Nome: ${cliente.nome}, Created: ${cliente.created_at}, Updated: ${cliente.updated_at}`);
    });
    
  } catch (error) {
    logger.error('Erro ao recriar tabela:', error);
  } finally {
    await db.disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  recreateTable();
}

module.exports = recreateTable;
