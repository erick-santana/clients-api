const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const securityMiddleware = (app) => {
  // CORS - Configuração básica
  app.use(cors({
    origin: ['http://localhost:4200'],
    credentials: true
  }));

  // Compressão
  app.use(compression());

  // Rate Limiting Global
  const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requisições por IP
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Muitas requisições. Tente novamente em alguns minutos.',
        details: 'Limite de requisições excedido. Aguarde antes de fazer novas requisições.'
      }
    },
    standardHeaders: true, // Retorna rate limit info nos headers
    legacyHeaders: false, // Desabilita headers legados
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Muitas requisições. Tente novamente em alguns minutos.',
          details: 'Limite de requisições excedido. Aguarde antes de fazer novas requisições.',
          retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 / 60) // minutos
        }
      });
    }
  });

  // Rate Limiting para Autenticação (mais restritivo)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas de login por IP
    message: {
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
        details: 'Limite de tentativas de login excedido por questões de segurança.'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'AUTH_RATE_LIMIT_EXCEEDED',
          message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
          details: 'Limite de tentativas de login excedido por questões de segurança.',
          retryAfter: 15 // minutos
        }
      });
    }
  });

  // Rate Limiting para Operações Bancárias (mais restritivo)
  const bankingLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 operações bancárias por minuto por IP
    message: {
      success: false,
      error: {
        code: 'BANKING_RATE_LIMIT_EXCEEDED',
        message: 'Muitas operações bancárias. Tente novamente em 1 minuto.',
        details: 'Limite de operações bancárias excedido por questões de segurança.'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'BANKING_RATE_LIMIT_EXCEEDED',
          message: 'Muitas operações bancárias. Tente novamente em 1 minuto.',
          details: 'Limite de operações bancárias excedido por questões de segurança.',
          retryAfter: 1 // minuto
        }
      });
    }
  });

  // Aplicar rate limiting global
  app.use(globalLimiter);

  // Aplicar rate limiting específico para autenticação
  app.use('/api/auth', authLimiter);

  // Aplicar rate limiting específico para operações bancárias
  app.use('/api/clientes/*/depositar', bankingLimiter);
  app.use('/api/clientes/*/sacar', bankingLimiter);

  // Sanitização de dados básica
  app.use((req, res, next) => {
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }
    next();
  });
};

module.exports = securityMiddleware;
