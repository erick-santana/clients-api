const ClienteService = require('../services/ClienteService');
const { AppError } = require('../middleware/errorHandler');
const { validateFiltros } = require('../validators/filtrosValidator');

const defaultClienteService = new ClienteService();

const createController = (clienteService = defaultClienteService) => {
     /**
    * @swagger
    * /api/clientes:
    *   get:
    *     summary: Listar todos os clientes
    *     description: Retorna uma lista paginada de todos os clientes cadastrados
    *     tags: [Clientes]
    *     security:
    *       - BearerAuth: []
    *     parameters:
    *       - in: query
    *         name: page
    *         schema:
    *           type: integer
    *           default: 1
    *         description: Número da página
    *       - in: query
    *         name: limit
    *         schema:
    *           type: integer
    *           default: 10
    *         description: Número de itens por página
    *       - in: query
    *         name: search
    *         schema:
    *           type: string
    *         description: Termo de busca (nome ou email)
    *     responses:
    *       200:
    *         description: Lista de clientes retornada com sucesso
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/PaginatedResponse'
    *       401:
    *         description: Não autorizado
    *       500:
    *         description: Erro interno do servidor
    */
  const listarTodos = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search;
      
      // Filtros avançados
      const filtros = {
        saldoMin: req.query.saldoMin !== undefined ? parseFloat(req.query.saldoMin) : undefined,
        saldoMax: req.query.saldoMax !== undefined ? parseFloat(req.query.saldoMax) : undefined,
        dataInicio: req.query.dataInicio || undefined,
        dataFim: req.query.dataFim || undefined,
        ordenarPor: req.query.ordenarPor || 'created_at',
        ordenacao: req.query.ordenacao || 'desc'
      };

      // Validar filtros
      const filtrosValidados = validateFiltros(filtros);

      const result = await clienteService.listarTodos(page, limit, search, filtrosValidados);
      res.json(result);
    } catch (error) {
      if (error.statusCode) {
        return next(error);
      }
      next(new AppError('Erro ao listar clientes', 500));
    }
  };



  /**
   * @swagger
   * /api/clientes/{id}:
   *   get:
   *     summary: Buscar cliente por ID
   *     description: Retorna os dados de um cliente específico pelo ID
   *     tags: [Clientes]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do cliente
   *         example: 1
   *     responses:
   *       200:
   *         description: Cliente encontrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Cliente'
   *                 message:
   *                   type: string
   *                   example: Cliente encontrado
   *       404:
   *         description: Cliente não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  const buscarPorId = async (req, res, next) => {
    try {
      const cliente = await clienteService.buscarPorId(req.params.id);
      res.json({ success: true, data: cliente });
    } catch (error) {
      if (error.message === 'Cliente não encontrado') {
        return next(new AppError(error.message, 404));
      }
      next(new AppError('Erro ao buscar cliente', 500));
    }
  };

  /**
   * @swagger
   * /api/clientes:
   *   post:
   *     summary: Criar novo cliente
   *     description: Cria um novo cliente no sistema
   *     tags: [Clientes]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nome
   *               - email
   *             properties:
   *               nome:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *                 description: Nome completo do cliente
   *                 example: João Silva
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email único do cliente
   *                 example: joao.silva@example.com
   *               saldo:
   *                 type: number
   *                 minimum: 0
   *                 description: Saldo inicial da conta
   *                 example: 1000.00
   *     responses:
   *       201:
   *         description: Cliente criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Cliente'
   *                 message:
   *                   type: string
   *                   example: Cliente criado com sucesso
   *       400:
   *         description: Dados inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Email já cadastrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  const criar = async (req, res, next) => {
    try {
      const cliente = await clienteService.criar(req.body);
      res.status(201).json({ success: true, data: cliente });
    } catch (error) {
      if (error.message === 'Email já cadastrado') {
        return next(new AppError(error.message, 409));
      }
      if (error.statusCode) {
        return next(error);
      }
      next(new AppError('Erro ao criar cliente', 500));
    }
  };

  /**
   * @swagger
   * /api/clientes/{id}:
   *   put:
   *     summary: Atualizar cliente
   *     description: Atualiza os dados de um cliente existente
   *     tags: [Clientes]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do cliente
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nome:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *                 description: Nome completo do cliente
   *                 example: João Silva Atualizado
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email único do cliente
   *                 example: joao.atualizado@example.com
   *     responses:
   *       200:
   *         description: Cliente atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Cliente'
   *                 message:
   *                   type: string
   *                   example: Cliente atualizado com sucesso
   *       400:
   *         description: Dados inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Cliente não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Email já cadastrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  const atualizar = async (req, res, next) => {
    try {
      const cliente = await clienteService.atualizar(req.params.id, req.body);
      res.json({ success: true, data: cliente });
    } catch (error) {
      if (error.message === 'Cliente não encontrado') {
        return next(new AppError(error.message, 404));
      }
      if (error.message === 'Email já cadastrado') {
        return next(new AppError(error.message, 409));
      }
      if (error.message.includes('saldo não pode ser alterado')) {
        return next(new AppError(error.message, 400));
      }
      if (error.statusCode) {
        return next(error);
      }
      next(new AppError('Erro ao atualizar cliente', 500));
    }
  };

  /**
   * @swagger
   * /api/clientes/{id}:
   *   delete:
   *     summary: Deletar cliente
   *     description: Remove um cliente do sistema
   *     tags: [Clientes]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do cliente
   *         example: 1
   *     responses:
   *       200:
   *         description: Cliente deletado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Cliente deletado com sucesso
   *       404:
   *         description: Cliente não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  const deletar = async (req, res, next) => {
    try {
      const resultado = await clienteService.deletar(req.params.id);
      res.json({ success: true, message: resultado.message });
    } catch (error) {
      if (error.message === 'Cliente não encontrado') {
        return next(new AppError(error.message, 404));
      }
      if (error.statusCode) {
        return next(error);
      }
      next(new AppError('Erro ao deletar cliente', 500));
    }
  };

  /**
   * @swagger
   * /api/clientes/{id}/depositar:
   *   post:
   *     summary: Realizar depósito
   *     description: Realiza um depósito na conta do cliente
   *     tags: [Operações Bancárias]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do cliente
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Operacao'
   *     responses:
   *       200:
   *         description: Depósito realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Cliente'
   *                 message:
   *                   type: string
   *                   example: Depósito realizado com sucesso
   *       400:
   *         description: Dados inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Cliente não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  const depositar = async (req, res, next) => {
    try {
      // Extrair idempotency key do header
      const idempotencyKey = req.headers['idempotency-key'];
      
      const cliente = await clienteService.depositar(req.params.id, req.body, idempotencyKey);
      res.json({ success: true, data: cliente });
    } catch (error) {
      if (error.message === 'Cliente não encontrado') {
        return next(new AppError(error.message, 404));
      }
      if (error.statusCode) {
        return next(error);
      }
      next(new AppError('Erro ao realizar depósito', 500));
    }
  };

  /**
   * @swagger
   * /api/clientes/{id}/sacar:
   *   post:
   *     summary: Realizar saque
   *     description: Realiza um saque na conta do cliente
   *     tags: [Operações Bancárias]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do cliente
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Operacao'
   *     responses:
   *       200:
   *         description: Saque realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Cliente'
   *                 message:
   *                   type: string
   *                   example: Saque realizado com sucesso
   *       400:
   *         description: Saldo insuficiente ou dados inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Cliente não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  const sacar = async (req, res, next) => {
    try {
      // Extrair idempotency key do header
      const idempotencyKey = req.headers['idempotency-key'];
      
      const cliente = await clienteService.sacar(req.params.id, req.body, idempotencyKey);
      res.json({ success: true, data: cliente });
    } catch (error) {
      if (error.message === 'Cliente não encontrado') {
        return next(new AppError(error.message, 404));
      }
      if (error.message === 'Saldo insuficiente') {
        return next(new AppError(error.message, 400));
      }
      if (error.statusCode) {
        return next(error);
      }
      next(new AppError('Erro ao realizar saque', 500));
    }
  };

  /**
   * @swagger
   * /api/clientes/{id}/operacoes:
   *   get:
   *     summary: Buscar histórico de operações
   *     description: Retorna o histórico de operações bancárias de um cliente
   *     tags: [Operações Bancárias]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do cliente
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Número de itens por página
   *     responses:
   *       200:
   *         description: Histórico de operações retornado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       tipo:
   *                         type: string
   *                         enum: [deposito, saque]
   *                       valor:
   *                         type: number
   *                       saldo_anterior:
   *                         type: number
   *                       saldo_posterior:
   *                         type: number
   *                       created_at:
   *                         type: string
   *                       status:
   *                         type: string
   *                         enum: [pendente, concluida, falhou]
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     total:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *       404:
   *         description: Cliente não encontrado
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  const getHistoricoOperacoes = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      
      const result = await clienteService.getHistoricoOperacoes(req.params.id, page, limit);
      res.json(result);
    } catch (error) {
      if (error.message === 'Cliente não encontrado') {
        return next(new AppError(error.message, 404));
      }
      if (error.statusCode) {
        return next(error);
      }
      next(new AppError('Erro ao buscar histórico de operações', 500));
    }
  };

  return { listarTodos, buscarPorId, criar, atualizar, deletar, depositar, sacar, getHistoricoOperacoes };
};

const defaultController = createController();

module.exports = {
  ...defaultController,
  createController
};
