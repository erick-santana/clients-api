const ClienteService = require('../../../src/services/ClienteService');
const Cliente = require('../../../src/models/Cliente');

// Mock do repository
const mockRepository = {
  findAll: jest.fn(),
  findAllPaginated: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  depositar: jest.fn(),
  sacar: jest.fn()
};

// Mock dos validators
jest.mock('../../../src/validators/clienteValidator', () => ({
  validateCliente: jest.fn(),
  validateOperacao: jest.fn()
}));

// Mock do logger
jest.mock('../../../src/utils/logger', () => ({
  error: jest.fn()
}));

const { validateCliente, validateOperacao } = require('../../../src/validators/clienteValidator');

describe('ClienteService', () => {
  let service;

  beforeEach(() => {
    service = new ClienteService(mockRepository);
    jest.clearAllMocks();
  });

  describe('listarTodos', () => {
    it('deve retornar lista de clientes paginada quando sucesso', async () => {
      const clientes = [
        new Cliente({ id: 1, nome: 'João', email: 'joao@teste.com', saldo: 1000 }),
        new Cliente({ id: 2, nome: 'Maria', email: 'maria@teste.com', saldo: 2000 })
      ];

      mockRepository.findAllPaginated.mockResolvedValue({
        clientes,
        total: 2
      });

      const resultado = await service.listarTodos(1, 10);

      expect(mockRepository.findAllPaginated).toHaveBeenCalledWith(10, 0, null);
      expect(resultado.success).toBe(true);
      expect(resultado.data).toHaveLength(2);
      expect(resultado.data[0]).toEqual(clientes[0].toJSON());
      expect(resultado.data[1]).toEqual(clientes[1].toJSON());
      expect(resultado.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      });
    });

    it('deve retornar lista de clientes com busca quando sucesso', async () => {
      const clientes = [
        new Cliente({ id: 1, nome: 'João', email: 'joao@teste.com', saldo: 1000 })
      ];

      mockRepository.findAllPaginated.mockResolvedValue({
        clientes,
        total: 1
      });

      const resultado = await service.listarTodos(1, 10, 'João');

      expect(mockRepository.findAllPaginated).toHaveBeenCalledWith(10, 0, 'João');
      expect(resultado.success).toBe(true);
      expect(resultado.data).toHaveLength(1);
    });

    it('deve lançar erro quando repository falha', async () => {
      const erro = new Error('Erro de banco');
      mockRepository.findAllPaginated.mockRejectedValue(erro);

      await expect(service.listarTodos(1, 10)).rejects.toThrow('Erro ao listar clientes');
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar cliente quando encontrado', async () => {
      const cliente = new Cliente({ id: 1, nome: 'João', email: 'joao@teste.com', saldo: 1000 });
      mockRepository.findById.mockResolvedValue(cliente);

      const resultado = await service.buscarPorId(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(cliente.toJSON());
    });

    it('deve lançar erro quando cliente não encontrado', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.buscarPorId(999)).rejects.toThrow('Cliente não encontrado');
    });

    it('deve propagar erro do repository', async () => {
      const erro = new Error('Erro de banco');
      mockRepository.findById.mockRejectedValue(erro);

      await expect(service.buscarPorId(1)).rejects.toThrow('Erro de banco');
    });
  });

  describe('criar', () => {
    it('deve criar cliente com sucesso', async () => {
      const dadosCliente = { nome: 'João', email: 'joao@teste.com', saldo: 1000 };
      const dadosValidados = { nome: 'João', email: 'joao@teste.com', saldo: 1000 };
      const cliente = new Cliente({ id: 1, ...dadosValidados });

      validateCliente.mockReturnValue(dadosValidados);
      mockRepository.create.mockResolvedValue(cliente);

      const resultado = await service.criar(dadosCliente);

      expect(validateCliente).toHaveBeenCalledWith(dadosCliente);
      expect(mockRepository.create).toHaveBeenCalledWith(dadosValidados);
      expect(resultado).toEqual(cliente.toJSON());
    });

    it('deve propagar erro de validação', async () => {
      const dadosCliente = { nome: 'A', email: 'invalido' };
      const erroValidacao = new Error('Dados inválidos');

      validateCliente.mockImplementation(() => {
        throw erroValidacao;
      });

      await expect(service.criar(dadosCliente)).rejects.toThrow('Dados inválidos');
    });

    it('deve propagar erro do repository', async () => {
      const dadosCliente = { nome: 'João', email: 'joao@teste.com' };
      const dadosValidados = { nome: 'João', email: 'joao@teste.com' };
      const erro = new Error('Email já cadastrado');

      validateCliente.mockReturnValue(dadosValidados);
      mockRepository.create.mockRejectedValue(erro);

      await expect(service.criar(dadosCliente)).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('atualizar', () => {
    it('deve atualizar cliente com sucesso', async () => {
      const dadosCliente = { nome: 'João Silva', email: 'joao.silva@teste.com' };
      const dadosValidados = { nome: 'João Silva', email: 'joao.silva@teste.com' };
      const cliente = new Cliente({ id: 1, ...dadosValidados });

      validateCliente.mockReturnValue(dadosValidados);
      mockRepository.update.mockResolvedValue(cliente);

      const resultado = await service.atualizar(1, dadosCliente);

      expect(validateCliente).toHaveBeenCalledWith(dadosCliente);
      expect(mockRepository.update).toHaveBeenCalledWith(1, dadosValidados);
      expect(resultado).toEqual(cliente.toJSON());
    });

    it('deve propagar erro de validação', async () => {
      const dadosCliente = { nome: 'A', email: 'invalido' };
      const erroValidacao = new Error('Dados inválidos');

      validateCliente.mockImplementation(() => {
        throw erroValidacao;
      });

      await expect(service.atualizar(1, dadosCliente)).rejects.toThrow('Dados inválidos');
    });

    it('deve propagar erro do repository', async () => {
      const dadosCliente = { nome: 'João', email: 'joao@teste.com' };
      const dadosValidados = { nome: 'João', email: 'joao@teste.com' };
      const erro = new Error('Cliente não encontrado');

      validateCliente.mockReturnValue(dadosValidados);
      mockRepository.update.mockRejectedValue(erro);

      await expect(service.atualizar(1, dadosCliente)).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('deletar', () => {
    it('deve deletar cliente com sucesso', async () => {
      const resultado = { message: 'Cliente deletado com sucesso' };
      mockRepository.delete.mockResolvedValue(resultado);

      const response = await service.deletar(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(response).toEqual(resultado);
    });

    it('deve propagar erro do repository', async () => {
      const erro = new Error('Cliente não encontrado');
      mockRepository.delete.mockRejectedValue(erro);

      await expect(service.deletar(999)).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('depositar', () => {
    it('deve realizar depósito com sucesso', async () => {
      const dadosOperacao = { valor: 500 };
      const dadosValidados = { valor: 500 };
      const cliente = new Cliente({ id: 1, nome: 'João', saldo: 1500 });

      validateOperacao.mockReturnValue(dadosValidados);
      mockRepository.depositar.mockResolvedValue(cliente);

      const resultado = await service.depositar(1, dadosOperacao);

      expect(validateOperacao).toHaveBeenCalledWith(dadosOperacao);
      expect(mockRepository.depositar).toHaveBeenCalledWith(1, 500);
      expect(resultado).toEqual(cliente.toJSON());
    });

    it('deve propagar erro de validação', async () => {
      const dadosOperacao = { valor: -100 };
      const erroValidacao = new Error('Valor deve ser positivo');

      validateOperacao.mockImplementation(() => {
        throw erroValidacao;
      });

      await expect(service.depositar(1, dadosOperacao)).rejects.toThrow('Valor deve ser positivo');
    });

    it('deve propagar erro do repository', async () => {
      const dadosOperacao = { valor: 500 };
      const dadosValidados = { valor: 500 };
      const erro = new Error('Cliente não encontrado');

      validateOperacao.mockReturnValue(dadosValidados);
      mockRepository.depositar.mockRejectedValue(erro);

      await expect(service.depositar(999, dadosOperacao)).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('sacar', () => {
    it('deve realizar saque com sucesso', async () => {
      const dadosOperacao = { valor: 500 };
      const dadosValidados = { valor: 500 };
      const cliente = new Cliente({ id: 1, nome: 'João', saldo: 500 });

      validateOperacao.mockReturnValue(dadosValidados);
      mockRepository.sacar.mockResolvedValue(cliente);

      const resultado = await service.sacar(1, dadosOperacao);

      expect(validateOperacao).toHaveBeenCalledWith(dadosOperacao);
      expect(mockRepository.sacar).toHaveBeenCalledWith(1, 500);
      expect(resultado).toEqual(cliente.toJSON());
    });

    it('deve propagar erro de validação', async () => {
      const dadosOperacao = { valor: -100 };
      const erroValidacao = new Error('Valor deve ser positivo');

      validateOperacao.mockImplementation(() => {
        throw erroValidacao;
      });

      await expect(service.sacar(1, dadosOperacao)).rejects.toThrow('Valor deve ser positivo');
    });

    it('deve propagar erro do repository', async () => {
      const dadosOperacao = { valor: 500 };
      const dadosValidados = { valor: 500 };
      const erro = new Error('Saldo insuficiente');

      validateOperacao.mockReturnValue(dadosValidados);
      mockRepository.sacar.mockRejectedValue(erro);

      await expect(service.sacar(1, dadosOperacao)).rejects.toThrow('Saldo insuficiente');
    });
  });
});
