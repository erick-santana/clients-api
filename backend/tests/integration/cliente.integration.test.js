const request = require('supertest');
const createApp = require('../../src/server');
const Database = require('../../src/config/database');
const ClienteRepository = require('../../src/repositories/ClienteRepository');
const ClienteService = require('../../src/services/ClienteService');
const { createController } = require('../../src/controllers/clienteController');
const migrate = require('../../src/database/migrate');

describe('API de Clientes', () => {
  let db;
  let clienteRepository;
  let clienteService;
  let clienteController;
  let app;

  beforeAll(async () => {
    db = new Database();
    await db.connect();
    await migrate(db);
    clienteRepository = new ClienteRepository(db);
    clienteService = new ClienteService(clienteRepository);
    clienteController = createController(clienteService);
    const { app: testApp } = createApp(clienteController);
    app = testApp;
  });

  beforeEach(async () => {
    try {
      await db.run('DELETE FROM clientes');
    } catch (error) {
      // Ignora erro se tabela não existir ainda
    }
  });

  afterAll(async () => {
    // await db.disconnect();
  });

  describe('POST /api/clientes', () => {
    it('deve criar um novo cliente com dados válidos', async () => {
      const clienteData = {
        nome: 'João Silva',
        email: 'joao.silva@teste.com',
        saldo: 1000.00
      };

      const response = await request(app)
        .post('/api/clientes')
        .send(clienteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe(clienteData.nome);
      expect(response.body.data.email).toBe(clienteData.email);
      expect(response.body.data.saldo).toBe(clienteData.saldo);
      expect(response.body.data.id).toBeDefined();
    });

    it('deve rejeitar cliente com email duplicado', async () => {
      const clienteData = {
        nome: 'João Silva',
        email: 'joao.silva@teste.com',
        saldo: 1000.00
      };

      // Criar primeiro cliente
      await request(app)
        .post('/api/clientes')
        .send(clienteData)
        .expect(201);

      // Tentar criar segundo cliente com mesmo email
      const response = await request(app)
        .post('/api/clientes')
        .send(clienteData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Email já cadastrado');
    });

    it('deve rejeitar dados inválidos', async () => {
      const clienteData = {
        nome: 'A', // Nome muito curto
        email: 'email-invalido', // Email inválido
        saldo: -100 // Saldo negativo
      };

      const response = await request(app)
        .post('/api/clientes')
        .send(clienteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Nome deve ter pelo menos 2 caracteres');
      expect(response.body.error).toContain('Email deve ser válido');
      expect(response.body.error).toContain('Saldo não pode ser negativo');
    });
  });

  describe('GET /api/clientes', () => {
    it('deve listar todos os clientes', async () => {
      const clientesData = [
        { nome: 'João Silva', email: 'joao@teste.com', saldo: 1000 },
        { nome: 'Maria Santos', email: 'maria@teste.com', saldo: 2000 }
      ];

      // Criar clientes
      for (const clienteData of clientesData) {
        await request(app)
          .post('/api/clientes')
          .send(clienteData)
          .expect(201);
      }

      const response = await request(app)
        .get('/api/clientes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      // Como a query ordena por created_at DESC, o último criado aparece primeiro
      expect(response.body.data[0].nome).toBe('Maria Santos');
      expect(response.body.data[1].nome).toBe('João Silva');
    });
  });

  describe('GET /api/clientes/:id', () => {
    it('deve retornar cliente específico', async () => {
      const clienteData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        saldo: 1000
      };

      const createResponse = await request(app)
        .post('/api/clientes')
        .send(clienteData)
        .expect(201);

      const clienteId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/clientes/${clienteId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(clienteId);
      expect(response.body.data.nome).toBe(clienteData.nome);
    });

    it('deve retornar 404 para cliente inexistente', async () => {
      const response = await request(app)
        .get('/api/clientes/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Cliente não encontrado');
    });
  });

  describe('PUT /api/clientes/:id', () => {
    it('deve atualizar cliente existente', async () => {
      const clienteData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        saldo: 1000
      };

      const createResponse = await request(app)
        .post('/api/clientes')
        .send(clienteData)
        .expect(201);

      const clienteId = createResponse.body.data.id;

      const updateData = {
        nome: 'João Silva Atualizado',
        email: 'joao.atualizado@teste.com'
      };

      const response = await request(app)
        .put(`/api/clientes/${clienteId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe(updateData.nome);
      expect(response.body.data.email).toBe(updateData.email);
    });
  });

  describe('POST /api/clientes/:id/depositar', () => {
    it('deve realizar depósito com sucesso', async () => {
      const clienteData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        saldo: 1000
      };

      const createResponse = await request(app)
        .post('/api/clientes')
        .send(clienteData)
        .expect(201);

      const clienteId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/clientes/${clienteId}/depositar`)
        .send({ valor: 500 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.saldo).toBe(1500);
    });

    it('deve rejeitar depósito com valor inválido', async () => {
      const clienteData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        saldo: 1000
      };

      const createResponse = await request(app)
        .post('/api/clientes')
        .send(clienteData)
        .expect(201);

      const clienteId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/clientes/${clienteId}/depositar`)
        .send({ valor: -100 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Valor deve ser positivo');
    });
  });

  describe('POST /api/clientes/:id/sacar', () => {
    it('deve realizar saque com saldo suficiente', async () => {
      const clienteData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        saldo: 1000
      };

      const createResponse = await request(app)
        .post('/api/clientes')
        .send(clienteData)
        .expect(201);

      const clienteId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/clientes/${clienteId}/sacar`)
        .send({ valor: 500 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.saldo).toBe(500);
    });

    it('deve rejeitar saque com saldo insuficiente', async () => {
      const clienteData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        saldo: 1000
      };

      const createResponse = await request(app)
        .post('/api/clientes')
        .send(clienteData)
        .expect(201);

      const clienteId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/clientes/${clienteId}/sacar`)
        .send({ valor: 1500 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Saldo insuficiente');
    });
  });

  describe('DELETE /api/clientes/:id', () => {
    it('deve deletar cliente existente', async () => {
      const clienteData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        saldo: 1000
      };

      const createResponse = await request(app)
        .post('/api/clientes')
        .send(clienteData)
        .expect(201);

      const clienteId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/clientes/${clienteId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deletado com sucesso');

      // Verificar se cliente foi realmente deletado
      const getResponse = await request(app)
        .get(`/api/clientes/${clienteId}`)
        .expect(404);

      expect(getResponse.body.error).toContain('Cliente não encontrado');
    });
  });
});
