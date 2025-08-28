const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Clientes',
      version: '1.0.0',
      description: `API RESTful para gerenciamento de clientes com operações bancárias

## 🔒 Rate Limiting

A API implementa rate limiting em múltiplas camadas para garantir segurança e estabilidade:

### **Limites Globais:**
- **100 requisições por IP** a cada 15 minutos

### **Limites Específicos:**
- **Autenticação**: 5 tentativas de login por IP a cada 15 minutos
- **Operações Bancárias**: 10 operações por IP a cada 1 minuto

### **Headers de Rate Limiting:**
- \`X-RateLimit-Limit\`: Limite de requisições
- \`X-RateLimit-Remaining\`: Requisições restantes
- \`X-RateLimit-Reset\`: Timestamp de reset do limite

### **Respostas de Rate Limiting:**
- **Status**: 429 Too Many Requests
- **Código**: RATE_LIMIT_EXCEEDED, AUTH_RATE_LIMIT_EXCEEDED, BANKING_RATE_LIMIT_EXCEEDED

## 🔐 Segurança

- **Autenticação**: JWT Bearer Token obrigatório
- **Idempotência**: Header idempotency-key obrigatório para operações bancárias
- **Validação**: Validação rigorosa de entrada de dados
- **Sanitização**: Sanitização automática de dados
- **CORS**: Configurado para origens específicas`,
      contact: {
        name: 'Equipe de Desenvolvimento',
        email: 'dev@example.com',
        url: 'https://github.com/erick-santana/clients-api'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.clientes.com',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      schemas: {
        Cliente: {
          type: 'object',
          required: ['nome', 'email'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único do cliente',
              example: 1
            },
            nome: {
              type: 'string',
              description: 'Nome completo do cliente',
              minLength: 2,
              maxLength: 100,
              example: 'João Silva'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único do cliente',
              example: 'joao.silva@example.com'
            },
            saldo: {
              type: 'number',
              format: 'float',
              description: 'Saldo atual da conta',
              minimum: 0,
              example: 1000.50
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação do cliente',
              example: '2025-08-24T10:00:00Z'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Data da última atualização',
              example: '2025-08-24T10:00:00Z'
            }
          }
        },
        Operacao: {
          type: 'object',
          required: ['valor'],
          properties: {
            valor: {
              type: 'number',
              format: 'float',
              description: 'Valor da operação (depósito ou saque)',
              minimum: 0.01,
              example: 500.00
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se a operação foi bem-sucedida',
              example: true
            },
            data: {
              description: 'Dados da resposta (pode ser um objeto, array ou null)'
            },
            message: {
              type: 'string',
              description: 'Mensagem descritiva da operação',
              example: 'Cliente criado com sucesso'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se a operação foi bem-sucedida',
              example: true
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Cliente'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'Página atual',
                  example: 1
                },
                limit: {
                  type: 'integer',
                  description: 'Itens por página',
                  example: 10
                },
                total: {
                  type: 'integer',
                  description: 'Total de itens',
                  example: 25
                },
                totalPages: {
                  type: 'integer',
                  description: 'Total de páginas',
                  example: 3
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Mensagem de erro',
              example: 'Cliente não encontrado'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Campo com erro'
                  },
                  message: {
                    type: 'string',
                    description: 'Mensagem de erro do campo'
                  }
                }
              }
            }
          }
        }
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Clientes',
        description: 'Operações relacionadas ao gerenciamento de clientes'
      },
      {
        name: 'Operações Bancárias',
        description: 'Operações de depósito e saque'
      },
      {
        name: 'Sistema',
        description: 'Endpoints do sistema (health check, etc.)'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
