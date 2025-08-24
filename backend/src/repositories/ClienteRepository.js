const Cliente = require('../models/Cliente');
const logger = require('../utils/logger');

class ClienteRepository {
  constructor(dbInstance = null) {
    this.db = dbInstance || require('../config/databaseInstance');
  }

  async findAll() {
    try {
      const clientesData = await this.db.all('SELECT * FROM clientes ORDER BY created_at DESC');
      return clientesData.map(clienteData => Cliente.fromDatabase(clienteData));
    } catch (error) {
      logger.error('Erro ao buscar todos os clientes:', error);
      throw new Error('Erro ao buscar clientes');
    }
  }

  async findById(id) {
    try {
      const clienteData = await this.db.get('SELECT * FROM clientes WHERE id = ?', [id]);
      return clienteData ? Cliente.fromDatabase(clienteData) : null;
    } catch (error) {
      logger.error('Erro ao buscar cliente por ID:', error);
      throw new Error('Erro ao buscar cliente');
    }
  }

  async findByEmail(email) {
    try {
      const clienteData = await this.db.get('SELECT * FROM clientes WHERE email = ?', [email]);
      return clienteData ? Cliente.fromDatabase(clienteData) : null;
    } catch (error) {
      logger.error('Erro ao buscar cliente por email:', error);
      throw new Error('Erro ao buscar cliente');
    }
  }

  async create(clienteData) {
    try {
      // Verificar se email já existe
      const clienteExistente = await this.findByEmail(clienteData.email);
      if (clienteExistente) {
        throw new Error('Email já cadastrado');
      }

      const result = await this.db.run(
        'INSERT INTO clientes (nome, email, saldo) VALUES (?, ?, ?)',
        [clienteData.nome, clienteData.email, clienteData.saldo || 0]
      );

      // Retornar instância do cliente criado
      return new Cliente({
        id: result.id,
        nome: clienteData.nome,
        email: clienteData.email,
        saldo: clienteData.saldo || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  async update(id, clienteData) {
    try {
      // Verificar se cliente existe
      const clienteExistente = await this.findById(id);
      if (!clienteExistente) {
        throw new Error('Cliente não encontrado');
      }

      // Verificar se email já existe (exceto para o próprio cliente)
      if (clienteData.email && clienteData.email !== clienteExistente.email) {
        const clienteComEmail = await this.findByEmail(clienteData.email);
        if (clienteComEmail && clienteComEmail.id !== parseInt(id)) {
          throw new Error('Email já cadastrado');
        }
      }

      const result = await this.db.run(
        'UPDATE clientes SET nome = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [clienteData.nome, clienteData.email, id]
      );

      if (result.changes === 0) {
        throw new Error('Cliente não encontrado');
      }

      // Retornar cliente atualizado
      return new Cliente({
        id: parseInt(id),
        nome: clienteData.nome,
        email: clienteData.email,
        saldo: clienteExistente.saldo,
        created_at: clienteExistente.created_at,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await this.db.run('DELETE FROM clientes WHERE id = ?', [id]);
      
      if (result.changes === 0) {
        throw new Error('Cliente não encontrado');
      }

      return { id: parseInt(id) };
    } catch (error) {
      logger.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }

  async depositar(id, valor) {
    try {
      // Verificar se cliente existe
      const cliente = await this.findById(id);
      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      const novoSaldo = cliente.calcularSaldoAposDeposito(valor);
      const result = await this.db.run(
        'UPDATE clientes SET saldo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [novoSaldo, id]
      );

      if (result.changes === 0) {
        throw new Error('Erro ao atualizar saldo');
      }

      // Retornar cliente com saldo atualizado
      return new Cliente({
        ...cliente.toJSON(),
        saldo: novoSaldo,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao realizar depósito:', error);
      throw error;
    }
  }

  async sacar(id, valor) {
    try {
      // Verificar se cliente existe
      const cliente = await this.findById(id);
      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      // Verificar se há saldo suficiente
      if (!cliente.temSaldoSuficiente(valor)) {
        throw new Error('Saldo insuficiente');
      }

      const novoSaldo = cliente.calcularSaldoAposSaque(valor);
      const result = await this.db.run(
        'UPDATE clientes SET saldo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [novoSaldo, id]
      );

      if (result.changes === 0) {
        throw new Error('Erro ao atualizar saldo');
      }

      // Retornar cliente com saldo atualizado
      return new Cliente({
        ...cliente.toJSON(),
        saldo: novoSaldo,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao realizar saque:', error);
      throw error;
    }
  }
}

module.exports = ClienteRepository;
