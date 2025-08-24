const Cliente = require('../../../src/models/Cliente');

describe('Cliente Model', () => {
  describe('Constructor', () => {
    it('deve criar uma instância com dados fornecidos', () => {
      const dados = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@teste.com',
        saldo: 1000.50,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-02T00:00:00.000Z'
      };

      const cliente = new Cliente(dados);

      expect(cliente.id).toBe(1);
      expect(cliente.nome).toBe('João Silva');
      expect(cliente.email).toBe('joao@teste.com');
      expect(cliente.saldo).toBe(1000.50);
      expect(cliente.created_at).toBe('2023-01-01T00:00:00.000Z');
      expect(cliente.updated_at).toBe('2023-01-02T00:00:00.000Z');
    });

    it('deve criar uma instância com valores padrão quando dados não fornecidos', () => {
      const cliente = new Cliente();

      expect(cliente.id).toBeNull();
      expect(cliente.nome).toBe('');
      expect(cliente.email).toBe('');
      expect(cliente.saldo).toBe(0);
      expect(cliente.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(cliente.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('deve criar uma instância com dados parciais', () => {
      const dados = {
        nome: 'Maria Santos',
        email: 'maria@teste.com'
      };

      const cliente = new Cliente(dados);

      expect(cliente.id).toBeNull();
      expect(cliente.nome).toBe('Maria Santos');
      expect(cliente.email).toBe('maria@teste.com');
      expect(cliente.saldo).toBe(0);
      expect(cliente.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(cliente.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('fromDatabase', () => {
    it('deve criar uma instância a partir de dados do banco', () => {
      const dadosBanco = {
        id: 5,
        nome: 'Pedro Costa',
        email: 'pedro@teste.com',
        saldo: 2500.75,
        created_at: '2023-01-01T10:00:00.000Z',
        updated_at: '2023-01-01T15:30:00.000Z'
      };

      const cliente = Cliente.fromDatabase(dadosBanco);

      expect(cliente).toBeInstanceOf(Cliente);
      expect(cliente.id).toBe(5);
      expect(cliente.nome).toBe('Pedro Costa');
      expect(cliente.email).toBe('pedro@teste.com');
      expect(cliente.saldo).toBe(2500.75);
      expect(cliente.created_at).toBe('2023-01-01T10:00:00.000Z');
      expect(cliente.updated_at).toBe('2023-01-01T15:30:00.000Z');
    });
  });

  describe('toJSON', () => {
    it('deve retornar objeto JSON com todos os atributos', () => {
      const dados = {
        id: 3,
        nome: 'Ana Oliveira',
        email: 'ana@teste.com',
        saldo: 1500.25,
        created_at: '2023-01-01T08:00:00.000Z',
        updated_at: '2023-01-01T12:00:00.000Z'
      };

      const cliente = new Cliente(dados);
      const json = cliente.toJSON();

      expect(json).toEqual({
        id: 3,
        nome: 'Ana Oliveira',
        email: 'ana@teste.com',
        saldo: 1500.25,
        created_at: '2023-01-01T08:00:00.000Z',
        updated_at: '2023-01-01T12:00:00.000Z'
      });
    });
  });

  describe('temSaldoSuficiente', () => {
    it('deve retornar true quando saldo é suficiente', () => {
      const cliente = new Cliente({ saldo: 1000 });

      expect(cliente.temSaldoSuficiente(500)).toBe(true);
      expect(cliente.temSaldoSuficiente(1000)).toBe(true);
    });

    it('deve retornar false quando saldo é insuficiente', () => {
      const cliente = new Cliente({ saldo: 1000 });

      expect(cliente.temSaldoSuficiente(1500)).toBe(false);
      expect(cliente.temSaldoSuficiente(1001)).toBe(false);
    });

    it('deve retornar true quando saldo é zero e valor é zero', () => {
      const cliente = new Cliente({ saldo: 0 });

      expect(cliente.temSaldoSuficiente(0)).toBe(true);
    });

    it('deve retornar false quando saldo é zero e valor é maior que zero', () => {
      const cliente = new Cliente({ saldo: 0 });

      expect(cliente.temSaldoSuficiente(1)).toBe(false);
    });
  });

  describe('calcularSaldoAposDeposito', () => {
    it('deve calcular corretamente o saldo após depósito', () => {
      const cliente = new Cliente({ saldo: 1000 });

      expect(cliente.calcularSaldoAposDeposito(500)).toBe(1500);
      expect(cliente.calcularSaldoAposDeposito(0)).toBe(1000);
      expect(cliente.calcularSaldoAposDeposito(1000)).toBe(2000);
    });

    it('deve calcular corretamente com saldo zero', () => {
      const cliente = new Cliente({ saldo: 0 });

      expect(cliente.calcularSaldoAposDeposito(100)).toBe(100);
      expect(cliente.calcularSaldoAposDeposito(0)).toBe(0);
    });

    it('deve calcular corretamente com valores decimais', () => {
      const cliente = new Cliente({ saldo: 100.50 });

      expect(cliente.calcularSaldoAposDeposito(50.25)).toBe(150.75);
    });
  });

  describe('calcularSaldoAposSaque', () => {
    it('deve calcular corretamente o saldo após saque', () => {
      const cliente = new Cliente({ saldo: 1000 });

      expect(cliente.calcularSaldoAposSaque(500)).toBe(500);
      expect(cliente.calcularSaldoAposSaque(0)).toBe(1000);
      expect(cliente.calcularSaldoAposSaque(1000)).toBe(0);
    });

    it('deve calcular corretamente com saldo zero', () => {
      const cliente = new Cliente({ saldo: 0 });

      expect(cliente.calcularSaldoAposSaque(0)).toBe(0);
    });

    it('deve calcular corretamente com valores decimais', () => {
      const cliente = new Cliente({ saldo: 100.75 });

      expect(cliente.calcularSaldoAposSaque(50.25)).toBe(50.50);
    });
  });
});
