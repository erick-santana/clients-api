const AWS = require('aws-sdk');

// Configurar AWS SDK
const configureAWS = () => {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, usar configurações da AWS
    AWS.config.update({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
  } else {
    // Em desenvolvimento, usar configurações locais (se necessário)
    AWS.config.update({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }
};

// Cliente do Secrets Manager
const getSecretsManagerClient = () => {
  configureAWS();
  return new AWS.SecretsManager();
};

// Função para obter segredos do AWS Secrets Manager
const getSecret = async (secretName) => {
  try {
    const secretsManager = getSecretsManagerClient();
    
    const params = {
      SecretId: secretName
    };

    const data = await secretsManager.getSecretValue(params).promise();
    
    if (data.SecretString) {
      return JSON.parse(data.SecretString);
    } else {
      throw new Error('Secret não encontrado ou formato inválido');
    }
  } catch (error) {
    console.error('Erro ao obter secret do AWS Secrets Manager:', error);
    throw error;
  }
};

// Função específica para obter credenciais de autenticação
const getAuthCredentials = async () => {
  const secretName = process.env.AWS_SECRETS_MANAGER_AUTH_SECRET_NAME || 'clientes/auth-credentials';
  
  try {
    const secret = await getSecret(secretName);
    
    if (!secret.username || !secret.password) {
      throw new Error('Credenciais incompletas no secret');
    }
    
    return {
      username: secret.username,
      password: secret.password
    };
  } catch (error) {
    console.error('Erro ao obter credenciais de autenticação:', error);
    throw error;
  }
};

module.exports = {
  configureAWS,
  getSecretsManagerClient,
  getSecret,
  getAuthCredentials
};
