const ClienteRepository = require('../../../src/repositories/ClienteRepository');
const Cliente = require('../../../src/models/Cliente');

// Mock do banco de dados
const mockDb = {
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn()
};

// Mock do logger
jest.mock('../../../src/utils/logger', () => ({
  error: jest.fn()
}));

describe('ClienteRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new ClienteRepository(mockDb);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('deve retornar lista de clientes quando sucesso', async () => {
      const dadosClientes = [
        { id: 1, nome: 'João', email: 'joao@teste.com', saldo: 1000, created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: 2, nome: 'Maria', email: 'maria@teste.com', saldo: 2000, created_at: '2023-01-01', updated_at: '2023-01-01' }
      ];

      mockDb.all.mockResolvedValue(dadosClientes);

      const resultado = await repository.findAll();

      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM clientes ORDER BY created_at DESC');
      expect(resultado).toHaveLength(2);
      expect(resultado[0]).toBeInstanceOf(Cliente);
      expect(resultado[1]).toBeInstanceOf(Cliente);
      expect(resultado[0].nome).toBe('João');
      expect(resultado[1].nome).toBe('Maria');
    });

    it('deve lançar erro quando falha na consulta', async () => {
      const erro = new Error('Erro de banco');
      mockDb.all.mockRejectedValue(erro);

      await expect(repository.findAll()).rejects.toThrow('Erro ao buscar clientes');
    });
  });

  describe('findById', () => {
    it('deve retornar cliente quando encontrado', async () => {
      const dadosCliente = { id: 1, nome: 'João', email: 'joao@teste.com', saldo: 1000, created_at: '2023-01-01', updated_at: '2023-01-01' };
      mockDb.get.mockResolvedValue(dadosCliente);

      const resultado = await repository.findById(1);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM clientes WHERE id = ?', [1]);
      expect(resultado).toBeInstanceOf(Cliente);
      expect(resultado.id).toBe(1);
      expect(resultado.nome).toBe('João');
    });

    it('deve retornar null quando cliente não encontrado', async () => {
      mockDb.get.mockResolvedValue(null);

      const resultado = await repository.findById(999);

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM clientes WHERE id = ?', [999]);
      expect(resultado).toBeNull();
    });

    it('deve lançar erro quando falha na consulta', async () => {
      const erro = new Error('Erro de banco');
      mockDb.get.mockRejectedValue(erro);

      await expect(repository.findById(1)).rejects.toThrow('Erro ao buscar cliente');
    });
  });

  describe('findByEmail', () => {
    it('deve retornar cliente quando encontrado', async () => {
      const dadosCliente = { id: 1, nome: 'João', email: 'joao@teste.com', saldo: 1000, created_at: '2023-01-01', updated_at: '2023-01-01' };
      mockDb.get.mockResolvedValue(dadosCliente);

      const resultado = await repository.findByEmail('joao@teste.com');

      expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM clientes WHERE email = ?', ['joao@teste.com']);
      expect(resultado).toBeInstanceOf(Cliente);
      expect(resultado.email).toBe('joao@teste.com');
    });

    it('deve retornar null quando email não encontrado', async () => {
      mockDb.get.mockResolvedValue(null);

      const resultado = await repository.findByEmail('inexistente@teste.com');

      expect(resultado).toBeNull();
    });
  });

  describe('create', () => {
    it('deve criar cliente com sucesso', async () => {
      const dadosCliente = { nome: 'João', email: 'joao@teste.com', saldo: 1000 };
      const resultadoInsert = { id: 1 };
      
      mockDb.get.mockResolvedValue(null); // findByEmail retorna null
      mockDb.run.mockResolvedValue(resultadoInsert);

      const resultado = await repository.create(dadosCliente);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO clientes (nome, email, saldo) VALUES (?, ?, ?)',
        ['João', 'joao@teste.com', 1000]
      );
      expect(resultado).toBeInstanceOf(Cliente);
      expect(resultado.id).toBe(1);
      expect(resultado.nome).toBe('João');
      expect(resultado.email).toBe('joao@teste.com');
      expect(resultado.saldo).toBe(1000);
    });

    it('deve usar saldo padrão quando não fornecido', async () => {
      const dadosCliente = { nome: 'João', email: 'joao@teste.com' };
      const resultadoInsert = { id: 1 };
      
      mockDb.get.mockResolvedValue(null);
      mockDb.run.mockResolvedValue(resultadoInsert);

      const resultado = await repository.create(dadosCliente);

      expect(mockDb.run).toHaveBeenCalledWith(
        'INSERT INTO clientes (nome, email, saldo) VALUES (?, ?, ?)',
        ['João', 'joao@teste.com', 0]
      );
      expect(resultado.saldo).toBe(0);
    });

    it('deve lançar erro quando email já existe', async () => {
      const dadosCliente = { nome: 'João', email: 'joao@teste.com' };
      const clienteExistente = { id: 1, nome: 'João', email: 'joao@teste.com' };
      
      mockDb.get.mockResolvedValue(clienteExistente);

      await expect(repository.create(dadosCliente)).rejects.toThrow('Email já cadastrado');
    });

    it('deve lançar erro quando falha na inserção', async () => {
      const dadosCliente = { nome: 'João', email: 'joao@teste.com' };
      
      mockDb.get.mockResolvedValue(null);
      mockDb.run.mockRejectedValue(new Error('Erro de banco'));

      await expect(repository.create(dadosCliente)).rejects.toThrow('Erro de banco');
    });
  });

  describe('update', () => {
    it('deve atualizar cliente com sucesso', async () => {
      const clienteExistente = { id: 1, nome: 'João', email: 'joao@teste.com', saldo: 1000 };
      const dadosAtualizacao = { nome: 'João Silva', email: 'joao.silva@teste.com' };
      const resultadoUpdate = { changes: 1 };
      
      mockDb.get.mockResolvedValueOnce(clienteExistente); // findById
      mockDb.get.mockResolvedValueOnce(null); // findByEmail (email diferente)
      mockDb.run.mockResolvedValue(resultadoUpdate);

      const resultado = await repository.update(1, dadosAtualizacao);

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE clientes SET nome = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['João Silva', 'joao.silva@teste.com', 1]
      );
      expect(resultado).toBeInstanceOf(Cliente);
      expect(resultado.id).toBe(1);
      expect(resultado.nome).toBe('João Silva');
      expect(resultado.email).toBe('joao.silva@teste.com');
    });

    it('deve lançar erro quando cliente não encontrado', async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(repository.update(999, { nome: 'João' })).rejects.toThrow('Cliente não encontrado');
    });

    it('deve lançar erro quando email já existe em outro cliente', async () => {
      const clienteExistente = { id: 1, nome: 'João', email: 'joao@teste.com' };
      const clienteComEmail = { id: 2, nome: 'Maria', email: 'maria@teste.com' };
      const dadosAtualizacao = { nome: 'João', email: 'maria@teste.com' };
      
      mockDb.get.mockResolvedValueOnce(clienteExistente); // findById
      mockDb.get.mockResolvedValueOnce(clienteComEmail); // findByEmail

      await expect(repository.update(1, dadosAtualizacao)).rejects.toThrow('Email já cadastrado');
    });

    it('deve permitir manter o mesmo email do cliente', async () => {
      const clienteExistente = { id: 1, nome: 'João', email: 'joao@teste.com', saldo: 1000 };
      const dadosAtualizacao = { nome: 'João Silva', email: 'joao@teste.com' };
      const resultadoUpdate = { changes: 1 };
      
      mockDb.get.mockResolvedValue(clienteExistente);
      mockDb.run.mockResolvedValue(resultadoUpdate);

      const resultado = await repository.update(1, dadosAtualizacao);

      expect(resultado.nome).toBe('João Silva');
      expect(resultado.email).toBe('joao@teste.com');
    });
  });

  describe('delete', () => {
    it('deve deletar cliente com sucesso', async () => {
      const resultadoDelete = { changes: 1 };
      mockDb.run.mockResolvedValue(resultadoDelete);

      const resultado = await repository.delete(1);

      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM clientes WHERE id = ?', [1]);
      expect(resultado).toEqual({ id: 1 });
    });

    it('deve lançar erro quando cliente não encontrado', async () => {
      const resultadoDelete = { changes: 0 };
      mockDb.run.mockResolvedValue(resultadoDelete);

      await expect(repository.delete(999)).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('depositar', () => {
    it('deve realizar depósito com sucesso', async () => {
      const cliente = { id: 1, nome: 'João', email: 'joao@teste.com', saldo: 1000, created_at: '2023-01-01', updated_at: '2023-01-01' };
      const resultadoUpdate = { changes: 1 };
      
      mockDb.get.mockResolvedValue(cliente);
      mockDb.run.mockResolvedValue(resultadoUpdate);

      const resultado = await repository.depositar(1, 500);

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE clientes SET saldo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [1500, 1]
      );
      expect(resultado).toBeInstanceOf(Cliente);
      expect(resultado.saldo).toBe(1500);
    });

    it('deve lançar erro quando cliente não encontrado', async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(repository.depositar(999, 100)).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('sacar', () => {
    it('deve realizar saque com sucesso', async () => {
      const cliente = { id: 1, nome: 'João', email: 'joao@teste.com', saldo: 1000, created_at: '2023-01-01', updated_at: '2023-01-01' };
      const resultadoUpdate = { changes: 1 };
      
      mockDb.get.mockResolvedValue(cliente);
      mockDb.run.mockResolvedValue(resultadoUpdate);

      const resultado = await repository.sacar(1, 500);

      expect(mockDb.run).toHaveBeenCalledWith(
        'UPDATE clientes SET saldo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [500, 1]
      );
      expect(resultado).toBeInstanceOf(Cliente);
      expect(resultado.saldo).toBe(500);
    });

    it('deve lançar erro quando saldo insuficiente', async () => {
      const cliente = { id: 1, nome: 'João', email: 'joao@teste.com', saldo: 100, created_at: '2023-01-01', updated_at: '2023-01-01' };
      
      mockDb.get.mockResolvedValue(cliente);

      await expect(repository.sacar(1, 500)).rejects.toThrow('Saldo insuficiente');
    });

    it('deve lançar erro quando cliente não encontrado', async () => {
      mockDb.get.mockResolvedValue(null);

      await expect(repository.sacar(999, 100)).rejects.toThrow('Cliente não encontrado');
    });
  });
});
