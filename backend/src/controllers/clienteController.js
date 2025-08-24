const ClienteService = require('../services/ClienteService');
const { AppError } = require('../middleware/errorHandler');

const defaultClienteService = new ClienteService();

const createController = (clienteService = defaultClienteService) => {
  const listarTodos = async (req, res, next) => {
    try {
      const clientes = await clienteService.listarTodos();
      res.json({ success: true, data: clientes });
    } catch (error) {
      next(new AppError('Erro ao listar clientes', 500));
    }
  };

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
      if (error.statusCode) {
        return next(error);
      }
      next(new AppError('Erro ao atualizar cliente', 500));
    }
  };

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

  const depositar = async (req, res, next) => {
    try {
      const cliente = await clienteService.depositar(req.params.id, req.body);
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

  const sacar = async (req, res, next) => {
    try {
      const cliente = await clienteService.sacar(req.params.id, req.body);
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

  return { listarTodos, buscarPorId, criar, atualizar, deletar, depositar, sacar };
};

const defaultController = createController();

module.exports = {
  ...defaultController,
  createController
};
