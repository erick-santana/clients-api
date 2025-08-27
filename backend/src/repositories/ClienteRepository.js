const Cliente = require('../models/Cliente');
const logger = require('../utils/logger');
const { nowUTC3, nowUTC3ISOString } = require('../utils/dateUtils');
const { v4: uuidv4 } = require('uuid');

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

  async findAllPaginated(limit = 10, offset = 0, search = null, filtros = {}) {
    try {
      let query = 'SELECT * FROM clientes';
      let countQuery = 'SELECT COUNT(*) as total FROM clientes';
      let params = [];
      let whereConditions = [];

      // Adicionar filtro de busca se fornecido
      if (search) {
        whereConditions.push('(nome LIKE ? OR email LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      // Filtros de saldo
      if (filtros.saldoMin !== undefined) {
        whereConditions.push('saldo >= ?');
        params.push(filtros.saldoMin);
      }

      if (filtros.saldoMax !== undefined) {
        whereConditions.push('saldo <= ?');
        params.push(filtros.saldoMax);
      }

      // Filtros de data
      if (filtros.dataInicio) {
        whereConditions.push('DATE(created_at) >= ?');
        params.push(filtros.dataInicio);
      }

      if (filtros.dataFim) {
        whereConditions.push('DATE(created_at) <= ?');
        params.push(filtros.dataFim);
      }

      // Adicionar WHERE se houver condições
      if (whereConditions.length > 0) {
        const whereClause = ' WHERE ' + whereConditions.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
      }

      // Ordenação
      const ordenarPor = filtros.ordenarPor || 'created_at';
      const ordenacao = filtros.ordenacao || 'desc';
      
      // Validar campo de ordenação para prevenir SQL injection
      const camposValidos = ['nome', 'email', 'saldo', 'created_at', 'id'];
      const campoOrdenacao = camposValidos.includes(ordenarPor) ? ordenarPor : 'created_at';
      const direcaoOrdenacao = ['asc', 'desc'].includes(ordenacao.toLowerCase()) ? ordenacao.toUpperCase() : 'DESC';
      
      query += ` ORDER BY ${campoOrdenacao} ${direcaoOrdenacao}`;

      query += ` LIMIT ${limit} OFFSET ${offset}`;

      // Executar queries
      const [clientesData, totalResult] = await Promise.all([
        this.db.all(query, params),
        this.db.get(countQuery, params)
      ]);

      return {
        clientes: clientesData.map(clienteData => Cliente.fromDatabase(clienteData)),
        total: totalResult.total
      };
    } catch (error) {
      logger.error('Erro ao buscar clientes paginados:', error);
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

      // Sempre usar saldo 0 para novos clientes
      const saldoInicial = 0;

      // Usar data atual em UTC-3 como objeto Date
      const dataUTC3 = nowUTC3();

      // Gerar UUID para o novo cliente
      const clienteId = uuidv4();

      const result = await this.db.run(
        'INSERT INTO clientes (id, nome, email, saldo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [clienteId, clienteData.nome, clienteData.email, saldoInicial, dataUTC3, dataUTC3]
      );

      // Retornar instância do cliente criado
      return new Cliente({
        id: clienteId,
        nome: clienteData.nome,
        email: clienteData.email,
        saldo: saldoInicial,
        created_at: nowUTC3ISOString(),
        updated_at: nowUTC3ISOString()
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
        if (clienteComEmail) {
          throw new Error('Email já cadastrado');
        }
      }

      // Usar data atual em UTC-3 como objeto Date
      const dataUTC3 = nowUTC3();

      const result = await this.db.run(
        'UPDATE clientes SET nome = ?, email = ?, updated_at = ? WHERE id = ?',
        [clienteData.nome, clienteData.email, dataUTC3, id]
      );

      if (result.changes === 0) {
        throw new Error('Erro ao atualizar cliente');
      }

      // Retornar cliente atualizado
      return new Cliente({
        ...clienteExistente.toJSON(),
        nome: clienteData.nome,
        email: clienteData.email,
        updated_at: nowUTC3ISOString()
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

  async depositar(id, valor, idempotencyKey = null) {
    let transactionStarted = false;
    
    try {
      // Verificar se cliente existe
      const cliente = await this.findById(id);
      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      // Verificar se operação já foi executada (idempotência)
      if (idempotencyKey) {
        const operacaoExistente = await this.db.get(
          'SELECT * FROM operacoes WHERE idempotency_key = ? AND status = "concluida"',
          [idempotencyKey]
        );
        
        if (operacaoExistente) {
          logger.info(`Operação idempotente encontrada: ${idempotencyKey}`);
          // Retornar cliente com saldo da operação anterior
          const clienteAtualizado = await this.findById(id);
          return clienteAtualizado;
        }
      }

      // Iniciar transação
      await this.db.beginTransaction();
      transactionStarted = true;

      // Lock otimista: verificar saldo novamente
      const clienteAtual = await this.db.get(
        'SELECT saldo FROM clientes WHERE id = ? FOR UPDATE',
        [id]
      );

      if (!clienteAtual) {
        throw new Error('Cliente não encontrado');
      }

      const saldoAnterior = parseFloat(clienteAtual.saldo);
      const novoSaldo = saldoAnterior + valor;
      
      // Usar data atual em UTC-3 como objeto Date
      const dataUTC3 = nowUTC3();
      const operacaoId = uuidv4();

      // Registrar operação
      await this.db.run(
        `INSERT INTO operacoes (id, cliente_id, tipo, valor, saldo_anterior, saldo_posterior, idempotency_key, status) 
         VALUES (?, ?, 'deposito', ?, ?, ?, ?, 'pendente')`,
        [operacaoId, id, valor, saldoAnterior, novoSaldo, idempotencyKey]
      );

      // Atualizar saldo do cliente
      const result = await this.db.run(
        'UPDATE clientes SET saldo = ?, updated_at = ? WHERE id = ?',
        [novoSaldo, dataUTC3, id]
      );

      if (result.changes === 0) {
        throw new Error('Erro ao atualizar saldo');
      }

      // Marcar operação como concluída
      await this.db.run(
        'UPDATE operacoes SET status = "concluida" WHERE id = ?',
        [operacaoId]
      );

      // Commit da transação
      await this.db.commitTransaction();
      transactionStarted = false;

      logger.info(`Depósito realizado: Cliente ${id}, Valor: ${valor}, Saldo anterior: ${saldoAnterior}, Novo saldo: ${novoSaldo}`);

      // Retornar cliente com saldo atualizado
      return new Cliente({
        ...cliente.toJSON(),
        saldo: novoSaldo,
        updated_at: nowUTC3ISOString()
      });
    } catch (error) {
      // Rollback em caso de erro
      if (transactionStarted) {
        try {
          await this.db.rollbackTransaction();
          logger.info('Transação revertida devido a erro');
        } catch (rollbackError) {
          logger.error('Erro ao fazer rollback:', rollbackError);
        }
      }
      
      logger.error('Erro ao realizar depósito:', error);
      throw error;
    }
  }

  async sacar(id, valor, idempotencyKey = null) {
    let transactionStarted = false;
    
    try {
      // Verificar se cliente existe
      const cliente = await this.findById(id);
      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      // Verificar se operação já foi executada (idempotência)
      if (idempotencyKey) {
        const operacaoExistente = await this.db.get(
          'SELECT * FROM operacoes WHERE idempotency_key = ? AND status = "concluida"',
          [idempotencyKey]
        );
        
        if (operacaoExistente) {
          logger.info(`Operação idempotente encontrada: ${idempotencyKey}`);
          // Retornar cliente com saldo da operação anterior
          const clienteAtualizado = await this.findById(id);
          return clienteAtualizado;
        }
      }

      // Iniciar transação
      await this.db.beginTransaction();
      transactionStarted = true;

      // Lock otimista: verificar saldo novamente
      const clienteAtual = await this.db.get(
        'SELECT saldo FROM clientes WHERE id = ? FOR UPDATE',
        [id]
      );

      if (!clienteAtual) {
        throw new Error('Cliente não encontrado');
      }

      const saldoAnterior = parseFloat(clienteAtual.saldo);
      
      // Verificar se há saldo suficiente
      if (saldoAnterior < valor) {
        throw new Error('Saldo insuficiente');
      }

      const novoSaldo = saldoAnterior - valor;
      
      // Usar data atual em UTC-3 como objeto Date
      const dataUTC3 = nowUTC3();
      const operacaoId = uuidv4();

      // Registrar operação
      await this.db.run(
        `INSERT INTO operacoes (id, cliente_id, tipo, valor, saldo_anterior, saldo_posterior, idempotency_key, status) 
         VALUES (?, ?, 'saque', ?, ?, ?, ?, 'pendente')`,
        [operacaoId, id, valor, saldoAnterior, novoSaldo, idempotencyKey]
      );

      // Atualizar saldo do cliente
      const result = await this.db.run(
        'UPDATE clientes SET saldo = ?, updated_at = ? WHERE id = ?',
        [novoSaldo, dataUTC3, id]
      );

      if (result.changes === 0) {
        throw new Error('Erro ao atualizar saldo');
      }

      // Marcar operação como concluída
      await this.db.run(
        'UPDATE operacoes SET status = "concluida" WHERE id = ?',
        [operacaoId]
      );

      // Commit da transação
      await this.db.commitTransaction();
      transactionStarted = false;

      logger.info(`Saque realizado: Cliente ${id}, Valor: ${valor}, Saldo anterior: ${saldoAnterior}, Novo saldo: ${novoSaldo}`);

      // Retornar cliente com saldo atualizado
      return new Cliente({
        ...cliente.toJSON(),
        saldo: novoSaldo,
        updated_at: nowUTC3ISOString()
      });
    } catch (error) {
      // Rollback em caso de erro
      if (transactionStarted) {
        try {
          await this.db.rollbackTransaction();
          logger.info('Transação revertida devido a erro');
        } catch (rollbackError) {
          logger.error('Erro ao fazer rollback:', rollbackError);
        }
      }
      
      logger.error('Erro ao realizar saque:', error);
      throw error;
    }
  }

  // Buscar histórico de operações de um cliente
  async getHistoricoOperacoes(clienteId, limit = 50, offset = 0) {
    try {
      // Converter parâmetros para números para garantir compatibilidade com MySQL
      const limitNum = parseInt(limit) || 50;
      const offsetNum = parseInt(offset) || 0;
      
      logger.debug(`[ClienteRepository] getHistoricoOperacoes - clienteId: ${clienteId}, limit: ${limitNum}, offset: ${offsetNum}`);
      
      // Usar LIMIT e OFFSET como strings para evitar problemas de tipo
      const operacoes = await this.db.all(
        `SELECT id, tipo, valor, saldo_anterior, saldo_posterior, created_at, status
         FROM operacoes 
         WHERE cliente_id = ? 
         ORDER BY created_at DESC 
         LIMIT ${limitNum} OFFSET ${offsetNum}`,
        [clienteId]
      );

      const total = await this.db.get(
        'SELECT COUNT(*) as count FROM operacoes WHERE cliente_id = ?',
        [clienteId]
      );

      return {
        operacoes: operacoes.map(op => ({
          id: op.id,
          tipo: op.tipo,
          valor: parseFloat(op.valor),
          saldo_anterior: parseFloat(op.saldo_anterior),
          saldo_posterior: parseFloat(op.saldo_posterior),
          created_at: op.created_at,
          status: op.status
        })),
        total: total.count
      };
    } catch (error) {
      logger.error('Erro ao buscar histórico de operações:', error);
      throw new Error('Erro ao buscar histórico de operações');
    }
  }
}

module.exports = ClienteRepository;
