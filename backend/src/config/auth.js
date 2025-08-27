const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Configurações de autenticação
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Credenciais padrão para desenvolvimento
const DEFAULT_USERNAME = process.env.AUTH_USERNAME || 'admin';
const DEFAULT_PASSWORD = process.env.AUTH_PASSWORD || 'admin123';

// Função para gerar token JWT
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Função para verificar token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
};

// Função para hash de senha
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Função para comparar senha
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Função para obter credenciais (AWS Secrets Manager em produção, .env em desenvolvimento)
const getCredentials = async () => {
  // Em produção, usar AWS Secrets Manager
  if (process.env.NODE_ENV === 'production') {
    try {
      const { getAuthCredentials } = require('./aws-secrets');
      return await getAuthCredentials();
    } catch (error) {
      console.error('Erro ao obter credenciais do AWS Secrets Manager:', error);
      throw new Error('Erro na configuração de autenticação');
    }
  }
  
  // Em desenvolvimento, usa variáveis de ambiente ou valores padrão
  return {
    username: DEFAULT_USERNAME,
    password: DEFAULT_PASSWORD
  };
};

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  getCredentials
};
