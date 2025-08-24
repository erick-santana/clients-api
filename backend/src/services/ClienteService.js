const ClienteRepository = require('../repositories/ClienteRepository');
const { validateCliente, validateOperacao } = require('../validators/clienteValidator');
const logger = require('../utils/logger');

class ClienteService {
  constructor(clienteRepository = null) {
    this.clienteRepository = clienteRepository || new ClienteRepository();
  }

  async listarTodos() {
    try {
      const clientes = await this.clienteRepository.findAll();
      return clientes.map(cliente => cliente.toJSON());
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
      // Validar dados de entrada
      const clienteData = validateCliente(dadosCliente);
      
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

  async depositar(id, dadosOperacao) {
    try {
      // Validar dados da operação
      const { valor } = validateOperacao(dadosOperacao);
      
      // Realizar depósito via repository
      const cliente = await this.clienteRepository.depositar(id, valor);
      return cliente.toJSON();
    } catch (error) {
      logger.error('Erro ao realizar depósito:', error);
      throw error;
    }
  }

  async sacar(id, dadosOperacao) {
    try {
      // Validar dados da operação
      const { valor } = validateOperacao(dadosOperacao);
      
      // Realizar saque via repository
      const cliente = await this.clienteRepository.sacar(id, valor);
      return cliente.toJSON();
    } catch (error) {
      logger.error('Erro ao realizar saque:', error);
      throw error;
    }
  }
}

module.exports = ClienteService;
