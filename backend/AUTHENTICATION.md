# 🔐 Sistema de Autenticação

Este documento descreve o sistema de autenticação implementado na API de Clientes.

## 📋 Visão Geral

A API utiliza **JWT (JSON Web Tokens)** para autenticação. Todas as rotas da API (exceto `/api/auth` e `/health`) requerem autenticação via Bearer Token.

## 🚀 Como Usar

### 1. Login

Para obter um token de acesso, faça uma requisição POST para `/api/auth/login`:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "username": "admin",
      "role": "admin"
    },
    "expiresIn": "24h"
  },
  "message": "Login realizado com sucesso"
}
```

### 2. Usar Token em Requisições

Inclua o token no header `Authorization` de todas as requisições protegidas:

```bash
curl -X GET http://localhost:8080/api/clientes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Verificar Token

Para verificar se um token é válido:

```bash
curl -X GET http://localhost:8080/api/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 🔧 Configuração

### Desenvolvimento

Em ambiente de desenvolvimento, as credenciais são obtidas do arquivo `.env`:

```env
# Autenticação (Desenvolvimento)
AUTH_USERNAME=admin
AUTH_PASSWORD=admin123
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

### Produção

Em produção, as credenciais são obtidas do **AWS Secrets Manager**:

```env
# AWS Secrets Manager (Produção)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_SECRETS_MANAGER_AUTH_SECRET_NAME=clientes/auth-credentials
```

#### Configuração do AWS Secrets Manager

1. **Criar o secret no AWS Secrets Manager:**
   ```json
   {
     "username": "admin",
     "password": "senha-segura-producao"
   }
   ```

2. **Nome do secret:** `clientes/auth-credentials`

3. **Permissões IAM necessárias:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "secretsmanager:GetSecretValue"
         ],
         "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:clientes/auth-credentials-*"
       }
     ]
   }
   ```

## 🛡️ Segurança

### JWT Token

- **Algoritmo:** HS256
- **Expiração:** 24 horas (configurável)
- **Payload:** username, role, timestamp

### Rotas Protegidas

Todas as rotas da API (exceto as listadas abaixo) requerem autenticação:

**Rotas Públicas:**
- `POST /api/auth/login` - Login
- `GET /health` - Health check
- `GET /` - Informações da API
- `GET /api-docs` - Documentação Swagger
- `GET /api-docs.json` - Especificação OpenAPI

**Rotas Protegidas:**
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `GET /api/clientes/:id` - Buscar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente
- `POST /api/clientes/:id/depositar` - Depositar
- `POST /api/clientes/:id/sacar` - Sacar
- `GET /api/auth/verify` - Verificar token

## 🧪 Testes

Execute os testes de autenticação:

```bash
node src/scripts/test-auth.js
```

## 📝 Exemplos de Uso

### JavaScript/Node.js

```javascript
const axios = require('axios');

// 1. Login
const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
  username: 'admin',
  password: 'admin123'
});

const token = loginResponse.data.data.token;

// 2. Usar token em requisições
const clientesResponse = await axios.get('http://localhost:8080/api/clientes', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Python

```python
import requests

# 1. Login
login_response = requests.post('http://localhost:8080/api/auth/login', json={
    'username': 'admin',
    'password': 'admin123'
})

token = login_response.json()['data']['token']

# 2. Usar token em requisições
headers = {'Authorization': f'Bearer {token}'}
clientes_response = requests.get('http://localhost:8080/api/clientes', headers=headers)
```

### cURL

```bash
# 1. Login e salvar token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  jq -r '.data.token')

# 2. Usar token
curl -X GET http://localhost:8080/api/clientes \
  -H "Authorization: Bearer $TOKEN"
```

## ⚠️ Tratamento de Erros

### Erro 401 - Não Autorizado

```json
{
  "success": false,
  "error": "Token de acesso não fornecido"
}
```

### Erro 401 - Token Inválido

```json
{
  "success": false,
  "error": "Token inválido ou expirado"
}
```

### Erro 401 - Credenciais Inválidas

```json
{
  "success": false,
  "error": "Credenciais inválidas"
}
```

## 🔄 Renovação de Token

Os tokens expiram em 24 horas. Para renovar, faça um novo login:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🚨 Boas Práticas

1. **Nunca compartilhe tokens** em logs ou código
2. **Use HTTPS** em produção
3. **Configure JWT_SECRET** forte em produção
4. **Monitore tentativas de login** falhadas
5. **Implemente rate limiting** para endpoints de login
6. **Use variáveis de ambiente** para configurações sensíveis
7. **Rotacione tokens** regularmente em produção
