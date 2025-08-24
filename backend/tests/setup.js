// Configurações globais para testes
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.LOG_LEVEL = 'error';
process.env.JWT_SECRET = 'test-secret-key';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';
