const { validateCliente, validateOperacao } = require('../../../src/validators/clienteValidator');

describe('ClienteValidator', () => {
  describe('validateCliente', () => {
    it('deve validar dados de cliente válidos', () => {
      const dadosCliente = {
        nome: 'João Silva',
        email: 'joao.silva@teste.com',
        saldo: 1000.50
      };

      const resultado = validateCliente(dadosCliente);

      expect(resultado).toEqual(dadosCliente);
    });

    it('deve validar dados de cliente sem saldo (usar padrão)', () => {
      const dadosCliente = {
        nome: 'Maria Santos',
        email: 'maria.santos@teste.com'
      };

      const resultado = validateCliente(dadosCliente);

      expect(resultado).toEqual({
        nome: 'Maria Santos',
        email: 'maria.santos@teste.com',
        saldo: 0
      });
    });

    it('deve rejeitar nome muito curto', () => {
      const dadosCliente = {
        nome: 'A',
        email: 'teste@teste.com',
        saldo: 100
      };

      expect(() => validateCliente(dadosCliente)).toThrow('Nome deve ter pelo menos 2 caracteres');
    });

    it('deve rejeitar nome vazio', () => {
      const dadosCliente = {
        nome: '',
        email: 'teste@teste.com',
        saldo: 100
      };

      expect(() => validateCliente(dadosCliente)).toThrow('"nome" is not allowed to be empty');
    });

    it('deve aceitar nome com espaços', () => {
      const dadosCliente = {
        nome: 'João Silva',
        email: 'teste@teste.com',
        saldo: 100
      };

      const resultado = validateCliente(dadosCliente);
      expect(resultado).toEqual(dadosCliente);
    });

    it('deve rejeitar email inválido', () => {
      const dadosCliente = {
        nome: 'João Silva',
        email: 'email-invalido',
        saldo: 100
      };

      expect(() => validateCliente(dadosCliente)).toThrow('Email deve ser válido');
    });

    it('deve rejeitar email vazio', () => {
      const dadosCliente = {
        nome: 'João Silva',
        email: '',
        saldo: 100
      };

      expect(() => validateCliente(dadosCliente)).toThrow('"email" is not allowed to be empty');
    });

    it('deve rejeitar email sem @', () => {
      const dadosCliente = {
        nome: 'João Silva',
        email: 'joao.teste.com',
        saldo: 100
      };

      expect(() => validateCliente(dadosCliente)).toThrow('Email deve ser válido');
    });

    it('deve rejeitar email sem domínio', () => {
      const dadosCliente = {
        nome: 'João Silva',
        email: 'joao@',
        saldo: 100
      };

      expect(() => validateCliente(dadosCliente)).toThrow('Email deve ser válido');
    });

    it('deve rejeitar saldo negativo', () => {
      const dadosCliente = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        saldo: -100
      };

      expect(() => validateCliente(dadosCliente)).toThrow('Saldo não pode ser negativo');
    });

    it('deve aceitar saldo zero', () => {
      const dadosCliente = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        saldo: 0
      };

      const resultado = validateCliente(dadosCliente);

      expect(resultado).toEqual(dadosCliente);
    });

    it('deve aceitar saldo decimal', () => {
      const dadosCliente = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        saldo: 100.50
      };

      const resultado = validateCliente(dadosCliente);

      expect(resultado).toEqual(dadosCliente);
    });

    it('deve rejeitar múltiplos erros simultaneamente', () => {
      const dadosCliente = {
        nome: 'A',
        email: 'email-invalido',
        saldo: -100
      };

      expect(() => validateCliente(dadosCliente)).toThrow('Nome deve ter pelo menos 2 caracteres, Email deve ser válido, Saldo não pode ser negativo');
    });

    it('deve aceitar nomes com acentos e caracteres especiais', () => {
      const dadosCliente = {
        nome: 'João Silva dos Santos',
        email: 'joao.silva@teste.com',
        saldo: 1000
      };

      const resultado = validateCliente(dadosCliente);

      expect(resultado).toEqual(dadosCliente);
    });

    it('deve aceitar emails com subdomínios', () => {
      const dadosCliente = {
        nome: 'João Silva',
        email: 'joao.silva@empresa.teste.com',
        saldo: 1000
      };

      const resultado = validateCliente(dadosCliente);

      expect(resultado).toEqual(dadosCliente);
    });
  });

  describe('validateOperacao', () => {
    it('deve validar operação com valor positivo', () => {
      const dadosOperacao = {
        valor: 500.50
      };

      const resultado = validateOperacao(dadosOperacao);

      expect(resultado).toEqual(dadosOperacao);
    });

    it('deve rejeitar operação com valor zero', () => {
      const dadosOperacao = {
        valor: 0
      };

      expect(() => validateOperacao(dadosOperacao)).toThrow('Valor deve ser positivo');
    });

    it('deve rejeitar valor negativo', () => {
      const dadosOperacao = {
        valor: -100
      };

      expect(() => validateOperacao(dadosOperacao)).toThrow('Valor deve ser positivo');
    });

    it('deve rejeitar valor ausente', () => {
      const dadosOperacao = {};

      expect(() => validateOperacao(dadosOperacao)).toThrow('Valor é obrigatório');
    });

    it('deve rejeitar valor null', () => {
      const dadosOperacao = {
        valor: null
      };

      expect(() => validateOperacao(dadosOperacao)).toThrow('"valor" must be a number');
    });

    it('deve rejeitar valor undefined', () => {
      const dadosOperacao = {
        valor: undefined
      };

      expect(() => validateOperacao(dadosOperacao)).toThrow('Valor é obrigatório');
    });

    it('deve aceitar valor string numérica', () => {
      const dadosOperacao = {
        valor: '100'
      };

      const resultado = validateOperacao(dadosOperacao);
      expect(resultado).toEqual({ valor: 100 });
    });

    it('deve aceitar valor decimal', () => {
      const dadosOperacao = {
        valor: 100.75
      };

      const resultado = validateOperacao(dadosOperacao);

      expect(resultado).toEqual(dadosOperacao);
    });

    it('deve aceitar valor inteiro', () => {
      const dadosOperacao = {
        valor: 100
      };

      const resultado = validateOperacao(dadosOperacao);

      expect(resultado).toEqual(dadosOperacao);
    });

    it('deve aceitar valor muito alto', () => {
      const dadosOperacao = {
        valor: 999999.99
      };

      const resultado = validateOperacao(dadosOperacao);

      expect(resultado).toEqual(dadosOperacao);
    });
  });
});
