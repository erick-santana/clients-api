const ClienteRepository = require('../repositories/ClienteRepository');
const { validateCliente, validateOperacao } = require('../validators/clienteValidator');
const logger = require('../utils/logger');

class ClienteService {
  constructor(clienteRepository = null) {
    this.clienteRepository = clienteRepository || new ClienteRepository();
  }

  async listarTodos(page = 1, limit = 10, search = null, filtros = {}) {
    try {
      const offset = (page - 1) * limit;
      const result = await this.clienteRepository.findAllPaginated(limit, offset, search, filtros);
      
      const totalPages = Math.ceil(result.total / limit);
      
      return {
        success: true,
        data: result.clientes.map(cliente => cliente.toJSON()),
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Erro ao listar clientes:', error);
      throw new Error('Erro ao listar clientes');
    }
  }



  async buscarPorId(id) {
    try {
      const cliente = await this.clienteRepository.findById(id);
      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }
      return cliente.toJSON();
    } catch (error) {
      logger.error('Erro ao buscar cliente:', error);
      throw error;
    }
  }

  async criar(dadosCliente) {
    try {
      // Validar dados de entrada
      const clienteData = validateCliente(dadosCliente);
      
      // Criar cliente via repository
      const cliente = await this.clienteRepository.create(clienteData);
      return cliente.toJSON();
    } catch (error) {
      logger.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  async atualizar(id, dadosCliente) {
    try {
      // Remover campos que não devem ser atualizados
      const { id: _, created_at, updated_at, ...dadosParaAtualizar } = dadosCliente;
      
      // Validar dados de entrada
      const clienteData = validateCliente(dadosParaAtualizar);
      
      // Atualizar cliente via repository
      const cliente = await this.clienteRepository.update(id, clienteData);
      return cliente.toJSON();
    } catch (error) {
      logger.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }

  async deletar(id) {
    try {
      await this.clienteRepository.delete(id);
      return { message: 'Cliente deletado com sucesso' };
    } catch (error) {
      logger.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }

  async depositar(id, dadosOperacao, idempotencyKey = null) {
    try {
      // Validar dados da operação
      const { valor } = validateOperacao(dadosOperacao);
      
      // Realizar depósito via repository com idempotência
      const cliente = await this.clienteRepository.depositar(id, valor, idempotencyKey);
      return cliente.toJSON();
    } catch (error) {
      logger.error('Erro ao realizar depósito:', error);
      throw error;
    }
  }

  async sacar(id, dadosOperacao, idempotencyKey = null) {
    try {
      // Validar dados da operação
      const { valor } = validateOperacao(dadosOperacao);
      
      // Realizar saque via repository com idempotência
      const cliente = await this.clienteRepository.sacar(id, valor, idempotencyKey);
      return cliente.toJSON();
    } catch (error) {
      logger.error('Erro ao realizar saque:', error);
      throw error;
    }
  }

  async getHistoricoOperacoes(id, page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      const result = await this.clienteRepository.getHistoricoOperacoes(id, limit, offset);
      
      return {
        success: true,
        data: result.operacoes,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      };
    } catch (error) {
      logger.error('Erro ao buscar histórico de operações:', error);
      throw error;
    }
  }
}

module.exports = ClienteService;
