# 🏦 Sistema de Gerenciamento de Clientes

Sistema completo de gerenciamento de clientes com **Backend Node.js** e **Frontend Angular**, seguindo as melhores práticas de segurança, arquitetura e deploy independente com Docker.

## 🚀 Deploy na AWS

Este projeto foi estruturado para **deploy na AWS** utilizando serviços gerenciados com foco em **segurança e boas práticas**:

### 🏗️ **Arquitetura de Segurança:**

#### **🔒 Isolamento de Rede:**
- **VPC** - Rede privada isolada
- **Subnets** - Separação pública/privada
- **Security Groups** - Controle de tráfego
- **NACLs** - Filtros de rede adicionais

#### **🔐 Autenticação e Autorização:**
- **Cognito User Pools** - Autenticação de usuários
- **Cognito Identity Pools** - Autorização de recursos
- **IAM** - Controle de acesso granular
- **MFA** - Autenticação multifator

#### **🔑 Criptografia e Segredos:**
- **KMS** - Gerenciamento de chaves de criptografia
- **Secrets Manager** - Armazenamento seguro de credenciais
- **Certificate Manager** - Certificados SSL/TLS
- **Encryption at Rest** - Criptografia em repouso

#### **🛡️ Proteção de Aplicação:**
- **WAF** - Firewall de aplicação web
- **Shield** - Proteção contra DDoS
- **GuardDuty** - Detecção de ameaças
- **Inspector** - Avaliação de vulnerabilidades

#### **📊 Monitoramento e Auditoria:**
- **CloudWatch** - Monitoramento e logs
- **CloudTrail** - Auditoria de API
- **Security Hub** - Centralização de segurança
- **Config** - Auditoria de conformidade

### 🚀 **Serviços Principais:**
- **Backend**: ECS/Fargate com RDS MySQL
- **Frontend**: S3 + CloudFront
- **Cache**: ElastiCache Redis
- **Monitoramento**: CloudWatch
- **Segurança**: KMS, Cognito, WAF, GuardDuty

## 🚀 Tecnologias

### Backend
- **Node.js** + **Express.js**
- **MySQL** (banco de dados - RDS em produção)
- **Joi** (validação de dados)
- **Winston** (logging)
- **Jest** + **Supertest** (testes)
- **Helmet** (segurança)

### Frontend
- **Angular 17** (framework)
- **Angular Material** (UI components)
- **RxJS** (programação reativa)
- **TypeScript** (tipagem estática)
- **SCSS** (estilos)
- **NgRx** (estado - opcional)

### AWS Services
- **ECS/Fargate** (container orchestration)
- **RDS MySQL** (banco de dados gerenciado)
- **S3** (armazenamento de arquivos)
- **CloudFront** (CDN para frontend)
- **ElastiCache Redis** (cache - opcional)
- **CloudWatch** (monitoramento e logs)
- **IAM** (gerenciamento de acesso)

### AWS Security & Best Practices
- **VPC** (Virtual Private Cloud) - Isolamento de rede
- **KMS** (Key Management Service) - Gerenciamento de chaves de criptografia
- **Cognito** (User Pools & Identity Pools) - Autenticação e autorização
- **WAF** (Web Application Firewall) - Proteção contra ataques web
- **Shield** (DDoS Protection) - Proteção contra ataques DDoS
- **Secrets Manager** - Gerenciamento seguro de segredos
- **Certificate Manager** - Certificados SSL/TLS
- **Config** - Auditoria e conformidade
- **GuardDuty** - Detecção de ameaças
- **CloudTrail** - Log de auditoria de API
- **Security Hub** - Centralização de segurança
- **Inspector** - Avaliação de vulnerabilidades
- **Macie** - Proteção de dados sensíveis

### Desenvolvimento Local
- **MySQL** (banco de dados local)
- **Redis** (cache local)
- **Docker Compose** (orquestração local)
- **Docker** (containerização)

## 📁 Estrutura do Projeto

```
case_itau_nodejs/
├── 📁 backend/                   # Backend Node.js (AWS Ready)
│   ├── 📁 src/                  # Código fonte
│   │   ├── 📁 config/           # Configurações
│   │   ├── 📁 controllers/      # Controladores
│   │   ├── 📁 models/           # Modelos de dados
│   │   ├── 📁 repositories/     # Camada de acesso a dados
│   │   ├── 📁 services/         # Lógica de negócio
│   │   ├── 📁 middleware/       # Middlewares
│   │   ├── 📁 validators/       # Validações
│   │   ├── 📁 routes/           # Rotas da API
│   │   ├── 📁 utils/            # Utilitários
│   │   └── server.js            # Servidor principal
│   ├── 📁 tests/                # Testes automatizados
│   │   ├── 📁 unit/             # Testes unitários
│   │   └── 📁 integration/      # Testes de integração
│   ├── 📁 database/             # Arquivos do banco de dados
│   │   └── 📁 init/             # Scripts de inicialização MySQL
│   ├── 📁 logs/                 # Logs da aplicação
│   ├── 📁 scripts/              # Scripts de automação
│   ├── package.json             # Dependências do backend
│   ├── jest.config.js           # Configuração do Jest
│   ├── .eslintrc.js             # Configuração do ESLint
│   ├── Dockerfile               # Container do backend
│   ├── Dockerfile.dev           # Container de desenvolvimento
│   ├── docker-compose.yml       # Orquestração produção (AWS)
│   ├── docker-compose.dev.yml   # Orquestração desenvolvimento (LocalStack)
│   └── env.example              # Exemplo de variáveis de ambiente
├── 📁 frontend/                  # Frontend Angular (S3 + CloudFront)
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 components/   # Componentes
│   │   │   ├── 📁 services/     # Serviços
│   │   │   ├── 📁 interceptors/ # Interceptors HTTP
│   │   │   ├── 📁 models/       # Modelos TypeScript
│   │   │   └── 📁 shared/       # Componentes compartilhados
│   │   ├── 📁 environments/     # Configurações de ambiente
│   │   └── 📁 assets/           # Recursos estáticos
│   ├── package.json             # Dependências do frontend
│   ├── angular.json             # Configuração do Angular
│   ├── Dockerfile               # Container do frontend
│   └── Dockerfile.dev           # Container de desenvolvimento
├── .gitignore                    # Controle de versionamento
└── README.md                     # Documentação
```

## 🏗️ Arquitetura

### Backend - Arquitetura em Camadas
- **Modelo (Cliente)**: Entidade de dados com lógica de negócio
- **Repository (ClienteRepository)**: Acesso a dados e operações CRUD
- **Service (ClienteService)**: Lógica de negócio e validações
- **Controller (ClienteController)**: Gerencia requisições HTTP e respostas

### Frontend - Arquitetura Angular
- **Components**: Interface do usuário
- **Services**: Comunicação com API e lógica de negócio
- **Interceptors**: Headers de segurança e tratamento de erros
- **Models**: Tipos TypeScript para dados
- **Guards**: Proteção de rotas (futuro)

## 🔒 Segurança

### Backend
- ✅ Headers de segurança (Helmet)
- ✅ Validação de entrada (Joi)
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Sanitização de dados
- ✅ Logs estruturados

### Frontend
- ✅ HTTPS obrigatório
- ✅ Headers de segurança
- ✅ Content Security Policy
- ✅ Sanitização de dados
- ✅ Interceptors de segurança
- ✅ Validação de entrada

### Comunicação
- ✅ HTTPS/TLS
- ✅ Headers de autenticação
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Validação de entrada/saída

## 🧪 Testes

A aplicação possui uma estrutura completa de testes automatizados usando Jest e Supertest, separados em **testes unitários** e **testes de integração**:

### Estrutura de Testes

```
tests/
├── unit/                    # Testes unitários
│   ├── models/
│   │   └── Cliente.test.js  # Testes do modelo Cliente
│   ├── repositories/
│   │   └── ClienteRepository.test.js  # Testes do repositório
│   ├── services/
│   │   └── ClienteService.test.js     # Testes do service
│   └── validators/
│       └── clienteValidator.test.js   # Testes dos validators
└── integration/             # Testes de integração
    └── cliente.integration.test.js    # Testes da API completa
```

### Comandos de Teste

```bash
# Executar todos os testes (unitários + integração)
npm test

# Executar apenas testes unitários
npm run test:unit

# Executar apenas testes de integração
npm run test:integration

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes unitários com cobertura
npm run test:unit:coverage

# Executar testes de integração com cobertura
npm run test:integration:coverage
```

### Tipos de Teste

#### Testes Unitários
- **Objetivo**: Testar componentes isoladamente
- **Cobertura**: Modelos, Repositórios, Services, Validators
- **Características**: Rápidos, isolados, com mocks
- **Localização**: `tests/unit/`

#### Testes de Integração
- **Objetivo**: Testar fluxos completos da API
- **Cobertura**: Endpoints HTTP, banco de dados real
- **Características**: Mais lentos, testam integração real
- **Localização**: `tests/integration/`

## 🐳 Deploy com Docker

### Ambiente de Desenvolvimento

```bash
# Iniciar ambiente de desenvolvimento
./scripts/dev.sh

# Ou manualmente:
docker-compose -f docker-compose.dev.yml up -d
```

**Acessos:**
- Frontend: http://localhost:4200
- Backend: http://localhost:8080
- API Docs: http://localhost:8080/api-docs

### Ambiente de Produção

```bash
# Iniciar ambiente de produção
./scripts/prod.sh

# Ou manualmente:
docker-compose up -d
```

**Acessos:**
- Frontend: http://localhost
- Backend: http://localhost:8080
- HTTPS: https://localhost (se configurado)

### Comandos Docker

```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f [service]

# Parar serviços
docker-compose down

# Rebuild e reiniciar
docker-compose up --build -d

# Limpar tudo
docker-compose down -v
docker system prune -f
```

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Git

### Desenvolvimento Local

#### Backend com MySQL

```bash
# 1. Clone o repositório
git clone <repository-url>
cd case_itau_nodejs/backend

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp env.example .env

# 4. Iniciar ambiente de desenvolvimento (MySQL + Redis)
./scripts/dev.sh

# 5. Ou executar localmente
npm run dev
```

#### Frontend (Angular)

```bash
# 1. Clone o repositório
git clone <repository-url>
cd case_itau_nodejs/frontend

# 2. Instalar dependências
npm install

# 3. Iniciar em desenvolvimento
npm start

# 4. Ou build para produção
npm run build

# 5. Executar testes
./scripts/test.sh              # Todos os testes
./scripts/test.sh coverage     # Testes com cobertura
./scripts/test.sh services     # Testes de serviços
./scripts/test.sh components   # Testes de componentes
./scripts/test.sh interceptors # Testes de interceptors

# 6. Docker Compose
./scripts/dev.sh               # Desenvolvimento
./scripts/prod.sh              # Produção
```

### Deploy na AWS

#### Backend (ECS/Fargate)

```bash
cd case_itau_nodejs/backend

# 1. Configurar variáveis de ambiente AWS
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export RDS_HOSTNAME=your-rds-endpoint.region.rds.amazonaws.com
export RDS_PASSWORD=your_rds_password

# 2. Configurar serviços de segurança (Automático)
./scripts/setup-aws-security.sh

# Ou configurar manualmente:
# VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications ResourceType=vpc,Tags=[{Key=Name,Value=clientes-vpc}]

# KMS para criptografia
aws kms create-key --description "Cliente API encryption key" --key-usage ENCRYPT_DECRYPT

# Cognito User Pool
aws cognito-idp create-user-pool --pool-name clientes-user-pool --policies PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}

# Secrets Manager para credenciais
aws secretsmanager create-secret --name clientes/db-credentials --description "Database credentials" --secret-string '{"username":"admin","password":"secure-password"}'

# 3. Deploy com Docker
./scripts/prod.sh

# 4. Ou deploy no ECS
aws ecs create-cluster --cluster-name clientes-cluster
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster clientes-cluster --service-name clientes-service --task-definition clientes-task
```

#### Frontend (S3 + CloudFront)

```bash
cd case_itau_nodejs/frontend

# 1. Build para produção
npm run build

# 2. Upload para S3
aws s3 sync dist/clientes-app s3://your-bucket-name

# 3. Configurar CloudFront (via console AWS)
```

## 📚 Documentação da API

### Swagger/OpenAPI

A API possui documentação completa usando Swagger/OpenAPI 3.0:

#### **🌐 Acesso à Documentação:**
- **Swagger UI**: `http://localhost:8080/api-docs`
- **OpenAPI JSON**: `http://localhost:8080/api-docs.json`
- **Documentação Estática**: `./backend/docs/index.html`

#### **📋 Endpoints Documentados:**

| Método | Endpoint | Descrição | Tag |
|--------|----------|-----------|-----|
| GET | `/api/clientes` | Listar todos os clientes (paginado) | Clientes |
| GET | `/api/clientes/:id` | Buscar cliente por ID | Clientes |
| POST | `/api/clientes` | Criar novo cliente | Clientes |
| PUT | `/api/clientes/:id` | Atualizar cliente | Clientes |
| DELETE | `/api/clientes/:id` | Deletar cliente | Clientes |
| POST | `/api/clientes/:id/depositar` | Realizar depósito | Operações Bancárias |
| POST | `/api/clientes/:id/sacar` | Realizar saque | Operações Bancárias |
| GET | `/health` | Health Check | Sistema |

#### **🔧 Comandos de Documentação:**
```bash
cd backend

# Gerar documentação estática
npm run docs:generate

# Servir documentação estática
npm run docs:serve
```

### Exemplos de Uso

```bash
# Listar clientes
curl -X GET http://localhost:8080/api/v1/clientes

# Criar cliente
curl -X POST http://localhost:8080/api/v1/clientes \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","email":"joao@teste.com","saldo":1000}'

# Realizar depósito
curl -X POST http://localhost:8080/api/v1/clientes/1/depositar \
  -H "Content-Type: application/json" \
  -d '{"valor":500}'
```

## 🛠️ Comandos Úteis

### Backend

```bash
cd backend

# Desenvolvimento
npm run dev                # Servidor em modo desenvolvimento
npm test                   # Executar testes
npm run test:unit         # Testes unitários
npm run test:integration  # Testes de integração
npm run lint              # Verificar código
npm run migrate           # Executar migrações

# Docker
./scripts/dev.sh          # Ambiente de desenvolvimento (MySQL + Redis)
./scripts/prod.sh         # Ambiente de produção (AWS)

# AWS Security
./scripts/setup-aws-security.sh  # Configurar infraestrutura de segurança AWS

# Frontend
./scripts/dev.sh          # Ambiente de desenvolvimento Angular
./scripts/prod.sh         # Ambiente de produção Angular
./scripts/test.sh         # Executar testes do frontend

# Documentação
npm run docs:generate      # Gerar documentação estática
npm run docs:serve         # Servir documentação estática
```

### Frontend

```bash
cd frontend

# Desenvolvimento
npm start                 # Servidor de desenvolvimento
npm run build            # Build de produção
npm test                 # Executar testes
npm run lint             # Verificar código
```

### Desenvolvimento Local

```bash
# Testar backend
curl http://localhost:8080/health

# Conectar ao MySQL
mysql -h localhost -P 3306 -u clientes_user -p clientes_dev

# Testar Redis
redis-cli -h localhost -p 6379 ping
```

### AWS (Produção)

```bash
# Configurar infraestrutura de segurança (primeira vez)
./scripts/setup-aws-security.sh

# Deploy no ECS
aws ecs update-service --cluster clientes-cluster --service clientes-service --force-new-deployment

# Verificar logs no CloudWatch
aws logs describe-log-groups --log-group-name-prefix /ecs/clientes

# Backup do RDS
aws rds create-db-snapshot --db-instance-identifier clientes-db --db-snapshot-identifier clientes-backup-$(date +%Y%m%d)

# Gerenciar chaves KMS
aws kms list-keys
aws kms describe-key --key-id alias/clientes-key

# Gerenciar Cognito
aws cognito-idp list-user-pools --max-items 10
aws cognito-idp list-users --user-pool-id us-east-1_XXXXXXXXX

# Verificar Secrets Manager
aws secretsmanager list-secrets
aws secretsmanager get-secret-value --secret-id clientes/db-credentials

# Monitorar segurança
aws guardduty list-detectors
aws securityhub get-findings --max-items 10

# Verificar VPC
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=clientes-vpc"
aws ec2 describe-security-groups --filters "Name=vpc-id,Values=vpc-xxxxxxxxx"
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Backend (.env)
NODE_ENV=development
PORT=8080
DATABASE_PATH=./database/clientes.db
LOG_LEVEL=info

# Frontend (environment.ts)
apiUrl: 'https://localhost:8080/api/v1'
apiTimeout: 30000
enableDebug: true
```

### Banco de Dados

O sistema usa SQLite por padrão. Para migrar:

```bash
npm run migrate
```

## 🔒 Configuração de Segurança AWS

### **🚀 Configuração Automática:**

Para configurar toda a infraestrutura de segurança AWS automaticamente:

```bash
cd backend
./scripts/setup-aws-security.sh
```

Este script irá criar:
- ✅ **VPC** com subnets públicas e privadas
- ✅ **Security Groups** para ALB, ECS e RDS
- ✅ **KMS Keys** para criptografia
- ✅ **Cognito User Pool** para autenticação
- ✅ **Secrets Manager** para credenciais
- ✅ **GuardDuty** para detecção de ameaças
- ✅ **Security Hub** para centralização de segurança
- ✅ **CloudTrail** para auditoria

### **📋 Arquivos de Configuração:**

- `aws-security-config.example.json` - Exemplo de configuração
- `aws-security-config.json` - Configuração gerada (não versionado)
- `env.example` - Variáveis de ambiente de segurança

## 🔒 Boas Práticas de Segurança

### **🔐 Autenticação e Autorização:**
- **Cognito User Pools** para autenticação de usuários
- **JWT Tokens** com expiração curta
- **Refresh Tokens** para renovação segura
- **MFA** obrigatório para usuários administrativos
- **Políticas de senha** fortes (mínimo 8 caracteres, maiúsculas, minúsculas, números, símbolos)

### **🔑 Gerenciamento de Segredos:**
- **AWS Secrets Manager** para credenciais de banco
- **KMS** para criptografia de dados sensíveis
- **IAM Roles** em vez de Access Keys
- **Rotação automática** de credenciais
- **Princípio do menor privilégio** para todas as permissões

### **🌐 Segurança de Rede:**
- **VPC** com subnets públicas e privadas
- **Security Groups** restritivos
- **WAF** para proteção contra ataques web
- **HTTPS** obrigatório em todas as comunicações
- **VPN** ou **AWS Direct Connect** para acesso administrativo

### **📊 Monitoramento e Auditoria:**
- **CloudTrail** habilitado em todas as regiões
- **CloudWatch** para monitoramento em tempo real
- **GuardDuty** para detecção de ameaças
- **Security Hub** para centralização de alertas
- **Logs centralizados** com retenção adequada

### **🛡️ Proteção de Dados:**
- **Criptografia em repouso** para todos os dados
- **Criptografia em trânsito** (TLS 1.2+)
- **Backup automático** com criptografia
- **Classificação de dados** sensíveis
- **Retenção de dados** conforme políticas

## 📊 Monitoramento

### Logs
- **Backend**: Winston com níveis configuráveis
- **Frontend**: Console logs em desenvolvimento
- **Docker**: Logs centralizados

### Health Checks
- **Backend**: `/health`
- **Frontend**: `/health`
- **Docker**: Health checks automáticos

### Métricas
- **Performance**: Tempo de resposta
- **Disponibilidade**: Uptime dos serviços
- **Erros**: Rate de erro e tipos

## 🧪 Testes

### Backend (Jest)
```bash
cd backend
npm test                    # Todos os testes
npm run test:unit          # Testes unitários
npm run test:integration   # Testes de integração
npm run test:coverage      # Testes com cobertura
```

### Frontend (Karma + Jasmine)
```bash
cd frontend
./scripts/test.sh          # Todos os testes
./scripts/test.sh coverage # Testes com cobertura
./scripts/test.sh services # Testes de serviços
./scripts/test.sh components # Testes de componentes
./scripts/test.sh interceptors # Testes de interceptors
```

### Cobertura de Testes
- **Backend**: >90% de cobertura
- **Frontend**: >80% de cobertura
- **Relatórios**: HTML, JSON, LCOV

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte, envie um email para suporte@exemplo.com ou abra uma issue no GitHub.

---

**Desenvolvido com ❤️ seguindo as melhores práticas de desenvolvimento e segurança.**
