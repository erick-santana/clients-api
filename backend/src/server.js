require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

// Importações locais
const securityMiddleware = require('./middleware/security');
const { errorHandler } = require('./middleware/errorHandler');
const clienteRoutes = require('./routes/clienteRoutes');
const authRoutes = require('./routes/authRoutes');
const healthController = require('./controllers/healthController');
const { authenticateToken } = require('./middleware/auth');
const idempotencyManager = require('./config/idempotency');
const swaggerSpecs = require('./config/swagger');
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

  // Documentação da API (Swagger)
  const specs = swaggerSpecs;
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API de Clientes - Documentação',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true
    }
  }));

  // Rota para especificação OpenAPI em JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  // Rotas de autenticação (não protegidas)
  app.use('/api/auth', authRoutes);

  // Middleware de idempotência para operações bancárias
  app.use('/api/clientes/*/depositar', idempotencyManager.middleware());
  app.use('/api/clientes/*/sacar', idempotencyManager.middleware());

  // Middleware de autenticação para todas as outras rotas
  app.use('/api', authenticateToken);

  // Rotas da API (protegidas)
  app.use('/api/clientes', clienteRoutes(clienteController));

  // Rota de health check (não protegida)
  app.get('/health', healthController.healthCheck);

  // Rota raiz
  app.get('/', (req, res) => {
    res.json({
      message: 'API de Clientes - Itaú',
      version: '1.0.0',
      authentication: {
        login: '/api/auth/login',
        verify: '/api/auth/verify'
      },
      documentation: {
        swagger: '/api-docs',
        openapi: '/api-docs.json'
      },
      endpoints: {
        auth: '/api/auth',
        clientes: '/api/clientes (protegido)',
        health: '/health'
      },
      note: 'Todas as rotas da API (exceto /api/auth e /health) requerem autenticação via Bearer Token'
    });
  });

  // Middleware de tratamento de erros (deve ser o último)
  app.use(errorHandler);

  // Função para inicializar o servidor
  const startServer = async () => {
    try {
      logger.info('Iniciando servidor...');
      
      // Conectar ao banco de dados
      logger.info('Conectando ao banco de dados...');
      await db.connect();
      logger.info('Conectado ao banco de dados com sucesso');

      // Verificar se a conexão está funcionando
      try {
        const testResult = await db.get('SELECT COUNT(*) as total FROM clientes');
        logger.info(`Teste de conexão: ${testResult.total} clientes encontrados`);
      } catch (testError) {
        logger.error('Erro no teste de conexão:', testError);
        throw new Error('Falha no teste de conexão com o banco');
      }

      // Iniciar servidor
      logger.info(`Iniciando servidor na porta ${PORT}...`);
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
          } catch (error) {
            logger.error('Erro ao fechar conexão com banco:', error);
          }
          process.exit(0);
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
