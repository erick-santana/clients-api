const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.connection = null;
    this.config = {
      host: process.env.RDS_HOSTNAME || process.env.MYSQL_HOST || 'localhost',
      port: process.env.RDS_PORT || process.env.MYSQL_PORT || 3306,
      user: process.env.RDS_USERNAME || process.env.MYSQL_USER || 'clientes_user',
      password: process.env.RDS_PASSWORD || process.env.MYSQL_PASSWORD || 'clientes_password',
      database: process.env.RDS_DB_NAME || process.env.MYSQL_DATABASE || 'clientes_dev',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '-03:00', // UTC-3 (horário de Brasília)
      dateStrings: false
    };
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(this.config);
      
      // Configurar timezone da sessão para UTC-3
      await this.connection.execute("SET time_zone = '-03:00'");
      await this.connection.execute("SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'");
      
      logger.info('Conectado ao banco de dados MySQL com timezone UTC-3');
      
      // Criar tabela clientes se não existir
      await this.initializeTables();
    } catch (error) {
      logger.error('Erro ao conectar com o banco de dados:', error);
      throw error;
    }
  }

  async initializeTables() {
    try {
      logger.info('Inicializando tabelas...');
      
      // Criar tabela de clientes
      await this.run(`
        CREATE TABLE IF NOT EXISTS clientes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          saldo DECIMAL(10,2) DEFAULT 0.00,
          created_at TIMESTAMP NULL,
          updated_at TIMESTAMP NULL,
          INDEX idx_email (email),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      // Verificar se há dados na tabela
      const rows = await this.all('SELECT COUNT(*) as count FROM clientes');
      if (rows[0].count === 0) {
        // Usar data atual em UTC-3 para dados de exemplo
        const dataAtual = new Date();
        const dataUTC3 = new Date(dataAtual.getTime() - (3 * 60 * 60 * 1000));
        const dataUTC3String = dataUTC3.toISOString().slice(0, 19).replace('T', ' ');
        
        // Inserir dados de exemplo com data explícita em UTC-3
        await this.run(`
          INSERT INTO clientes (nome, email, saldo, created_at, updated_at) VALUES 
          ('João Silva', 'joao@example.com', 1000.00, ?, ?),
          ('Maria Santos', 'maria@example.com', 2500.00, ?, ?),
          ('Pedro Oliveira', 'pedro@example.com', 500.00, ?, ?)
        `, [dataUTC3String, dataUTC3String, dataUTC3String, dataUTC3String, dataUTC3String, dataUTC3String]);
        
        logger.info('Dados de exemplo inseridos com timezone UTC-3');
      }
      
      logger.info('Tabelas inicializadas com sucesso');
    } catch (error) {
      logger.error('Erro ao inicializar tabelas:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await this.connection.end();
        logger.info('Conexão com banco fechada');
      }
    } catch (error) {
      logger.error('Erro ao fechar conexão com banco:', error);
      throw error;
    }
  }

  async run(sql, params = []) {
    try {
      if (!this.connection) {
        throw new Error('Banco de dados não conectado');
      }
      
      const [result] = await this.connection.execute(sql, params);
      return { 
        id: result.insertId, 
        changes: result.affectedRows 
      };
    } catch (error) {
      logger.error('Erro na execução da query:', error);
      throw error;
    }
  }

  async get(sql, params = []) {
    try {
      if (!this.connection) {
        throw new Error('Banco de dados não conectado');
      }
      
      const [rows] = await this.connection.execute(sql, params);
      return rows[0] || null;
    } catch (error) {
      logger.error('Erro na consulta:', error);
      throw error;
    }
  }

  async all(sql, params = []) {
    try {
      if (!this.connection) {
        throw new Error('Banco de dados não conectado');
      }
      
      const [rows] = await this.connection.execute(sql, params);
      return rows;
    } catch (error) {
      logger.error('Erro na consulta múltipla:', error);
      throw error;
    }
  }
}

// Exporta a classe para permitir múltiplas instâncias
module.exports = Database;
