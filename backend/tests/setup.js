// Configurações globais para testes
process.env.NODE_ENV = 'test';
process.env.MYSQL_HOST = 'localhost';
process.env.MYSQL_PORT = '3306';
process.env.MYSQL_USER = 'clientes_user';
process.env.MYSQL_PASSWORD = 'clientes_password';
process.env.MYSQL_DATABASE = 'clientes_test';
process.env.LOG_LEVEL = 'error';
process.env.JWT_SECRET = 'test-secret-key';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';
