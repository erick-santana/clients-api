const crypto = require('crypto');
const logger = require('../utils/logger');

class IdempotencyManager {
  constructor() {
    // Cache em memória para idempotency keys (em produção, usar Redis)
    this.idempotencyCache = new Map();
    this.CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas
  }

  /**
   * Gera uma chave de idempotência baseada no conteúdo da requisição
   */
  generateIdempotencyKey(method, path, body, userId = null) {
    const content = JSON.stringify({
      method: method.toUpperCase(),
      path,
      body: body || {},
      userId
    });
    
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Verifica se uma operação já foi executada
   */
  async checkIdempotency(key) {
    const cached = this.idempotencyCache.get(key);
    
    if (cached) {
      const now = Date.now();
      if (now - cached.timestamp < this.CACHE_TTL) {
        logger.debug(`Idempotency key encontrada: ${key}`);
        return cached.response;
      } else {
        // Remover entrada expirada
        this.idempotencyCache.delete(key);
      }
    }
    
    return null;
  }

  /**
   * Armazena o resultado de uma operação
   */
  async storeIdempotency(key, response) {
    this.idempotencyCache.set(key, {
      response,
      timestamp: Date.now()
    });
    
    logger.debug(`Idempotency key armazenada: ${key}`);
  }

  /**
   * Middleware para verificar idempotência
   */
  middleware() {
    return (req, res, next) => {
      // Apenas para métodos que modificam dados
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        return next();
      }

      // Verificar se há header de idempotência
      const idempotencyKey = req.headers['idempotency-key'];
      
      if (!idempotencyKey) {
        return next();
      }

      // Gerar chave baseada no conteúdo
      const generatedKey = this.generateIdempotencyKey(
        req.method,
        req.path,
        req.body,
        req.user?.username
      );

      // Verificar se já foi executada
      this.checkIdempotency(generatedKey)
        .then(cachedResponse => {
          if (cachedResponse) {
            logger.info(`Retornando resposta idempotente para: ${req.path}`);
            return res.status(cachedResponse.status).json(cachedResponse.data);
          }
          
          // Armazenar resposta original para futuras requisições
          const originalSend = res.send;
          res.send = function(data) {
            idempotencyManager.storeIdempotency(generatedKey, {
              status: res.statusCode,
              data: JSON.parse(data)
            });
            originalSend.call(this, data);
          };
          
          next();
        })
        .catch(error => {
          logger.error('Erro ao verificar idempotência:', error);
          next();
        });
    };
  }

  /**
   * Limpar cache expirado
   */
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.idempotencyCache.entries()) {
      if (now - value.timestamp >= this.CACHE_TTL) {
        this.idempotencyCache.delete(key);
      }
    }
  }
}

// Instância singleton
const idempotencyManager = new IdempotencyManager();

// Limpeza automática a cada hora
setInterval(() => {
  idempotencyManager.cleanup();
}, 60 * 60 * 1000);

module.exports = idempotencyManager;
