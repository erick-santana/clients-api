const { verifyToken } = require('../config/auth');
const { AppError } = require('./errorHandler');

const authenticateToken = (req, res, next) => {
  try {
    // Obter o token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return next(new AppError('Token de acesso não fornecido', 401));
    }

    // Verificar o token
    const decoded = verifyToken(token);
    
    // Adicionar informações do usuário ao request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.message === 'Token inválido') {
      return next(new AppError('Token inválido ou expirado', 401));
    }
    return next(new AppError('Erro na autenticação', 500));
  }
};

module.exports = {
  authenticateToken
};
