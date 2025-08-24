const logger = require('../utils/logger');

class Cliente {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nome = data.nome || '';
    this.email = data.email || '';
    this.saldo = data.saldo || 0;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  // Método para criar uma instância a partir de dados do banco
  static fromDatabase(data) {
    return new Cliente({
      id: data.id,
      nome: data.nome,
      email: data.email,
      saldo: data.saldo,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }

  // Método para converter para objeto simples
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      saldo: this.saldo,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Método para validar se o cliente tem saldo suficiente
  temSaldoSuficiente(valor) {
    return this.saldo >= valor;
  }

  // Método para calcular novo saldo após depósito
  calcularSaldoAposDeposito(valor) {
    return this.saldo + valor;
  }

  // Método para calcular novo saldo após saque
  calcularSaldoAposSaque(valor) {
    return this.saldo - valor;
  }
}

module.exports = Cliente;
