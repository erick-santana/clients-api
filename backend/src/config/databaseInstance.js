const Database = require('./database');

// Instância singleton do banco de dados
const db = new Database();

module.exports = db;
