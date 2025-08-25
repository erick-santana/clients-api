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
