const { generateToken, getCredentials, comparePassword } = require('../config/auth');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validar se username e password foram fornecidos
    if (!username || !password) {
      return next(new AppError('Username e password são obrigatórios', 400));
    }

    // Obter credenciais (do .env em desenvolvimento, AWS Secrets Manager em produção)
    const credentials = await getCredentials();

    // Verificar se as credenciais estão corretas
    if (username !== credentials.username) {
      logger.warn(`Tentativa de login com username inválido: ${username}`);
      return next(new AppError('Credenciais inválidas', 401));
    }

    // Em desenvolvimento, comparar senha diretamente
    // Em produção, seria feito hash da senha
    if (password !== credentials.password) {
      logger.warn(`Tentativa de login com senha inválida para usuário: ${username}`);
      return next(new AppError('Credenciais inválidas', 401));
    }

    // Gerar token JWT
    const token = generateToken({
      username: credentials.username,
      role: 'admin',
      timestamp: new Date().toISOString()
    });

    logger.info(`Login bem-sucedido para usuário: ${username}`);

    res.json({
      success: true,
      data: {
        token,
        user: {
          username: credentials.username,
          role: 'admin'
        },
        expiresIn: '24h'
      },
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    logger.error('Erro no login:', error);
    if (error.message.includes('AWS Secrets Manager')) {
      return next(new AppError('Erro na configuração de autenticação', 500));
    }
    return next(new AppError('Erro interno do servidor', 500));
  }
};

const verifyAuth = async (req, res, next) => {
  try {
    // Se chegou até aqui, o token é válido (middleware já verificou)
    res.json({
      success: true,
      data: {
        user: req.user,
        message: 'Token válido'
      }
    });
  } catch (error) {
    logger.error('Erro na verificação de autenticação:', error);
    return next(new AppError('Erro interno do servidor', 500));
  }
};

module.exports = {
  login,
  verifyAuth
};
