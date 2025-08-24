require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');

// Importações locais
const securityMiddleware = require('./middleware/security');
const { errorHandler } = require('./middleware/errorHandler');
const clienteRoutes = require('./routes/clienteRoutes');
const db = require('./config/databaseInstance');
const logger = require('./utils/logger');

const createApp = (clienteController = null) => {
  const app = express();
  const PORT = process.env.PORT || 8080;

  // Middleware de segurança
  securityMiddleware(app);

  // Middleware de logging
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));

  // Middleware para parsing de JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rotas da API
  app.use('/api/clientes', clienteRoutes(clienteController));

  // Rota de health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'clientes-api'
    });
  });

  // Rota raiz
  app.get('/', (req, res) => {
    res.json({
      message: 'API de Clientes - Itaú',
      version: '1.0.0',
      endpoints: {
        clientes: '/api/clientes',
        health: '/health'
      }
    });
  });

  // Middleware de tratamento de erros (deve ser o último)
  app.use(errorHandler);

  // Função para inicializar o servidor
  const startServer = async () => {
    try {
      // Conectar ao banco de dados
      await db.connect();
      logger.info('Conectado ao banco de dados');

      // Executar migrações
      const migrate = require('./database/migrate');
      await migrate();
      logger.info('Migrações executadas com sucesso');

      // Iniciar servidor
      const server = app.listen(PORT, () => {
        logger.info(`Servidor rodando na porta ${PORT}`);
      });

      // Graceful shutdown
      const gracefulShutdown = async (signal) => {
        logger.info(`Recebido ${signal}. Iniciando graceful shutdown...`);
        
        server.close(async () => {
          logger.info('Servidor HTTP fechado');
          
          try {
            await db.disconnect();
            logger.info('Conexão com banco de dados fechada');
            process.exit(0);
          } catch (error) {
            logger.error('Erro ao fechar conexão com banco:', error);
            process.exit(1);
          }
        });
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
      logger.error('Erro ao inicializar servidor:', error);
      process.exit(1);
    }
  };

  return { app, startServer };
};

// Se este arquivo for executado diretamente, iniciar o servidor
if (require.main === module) {
  const { startServer } = createApp();
  startServer();
}

module.exports = createApp;
