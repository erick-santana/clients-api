const express = require('express');
const { createController } = require('../controllers/clienteController');

const createRoutes = (clienteController = null) => {
  const router = express.Router();
  
  // Usar controller fornecido ou criar um padrão
  const controller = clienteController || createController();

  // Rotas para clientes
  router.get('/', controller.listarTodos);
  router.get('/:id', controller.buscarPorId);
  router.post('/', controller.criar);
  router.put('/:id', controller.atualizar);
  router.delete('/:id', controller.deletar);

  // Rotas para operações financeiras
  router.post('/:id/depositar', controller.depositar);
  router.post('/:id/sacar', controller.sacar);

  return router;
};

module.exports = createRoutes;
