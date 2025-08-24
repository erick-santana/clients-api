const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/clientes.db');
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          logger.error('Erro ao conectar com o banco de dados:', err);
          reject(err);
        } else {
          logger.info('Conectado ao banco de dados SQLite');
          resolve();
        }
      });
    });
  }

  async disconnect() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            // Ignora erro se o banco já estiver fechado
            if (err.code === 'SQLITE_MISUSE') {
              logger.info('Banco já estava fechado');
              resolve();
            } else {
              logger.error('Erro ao fechar conexão com banco:', err);
              reject(err);
            }
          } else {
            logger.info('Conexão com banco fechada');
            resolve();
          }
        });
        this.db = null;
      } else {
        resolve();
      }
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Banco de dados não conectado'));
        return;
      }
      
      this.db.run(sql, params, function(err) {
        if (err) {
          logger.error('Erro na execução da query:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Banco de dados não conectado'));
        return;
      }
      
      this.db.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Erro na consulta:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Banco de dados não conectado'));
        return;
      }
      
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Erro na consulta múltipla:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

// Exporta a classe para permitir múltiplas instâncias
module.exports = Database;
