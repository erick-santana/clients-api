#!/bin/bash

# Script para iniciar ambiente de desenvolvimento com LocalStack e MySQL
set -e

echo "🚀 Iniciando ambiente de desenvolvimento..."

# Criar diretórios necessários
mkdir -p database logs

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker compose -f docker-compose.dev.yml down

# Remover volumes antigos (opcional - descomente se quiser limpar dados)
# docker compose -f docker-compose.dev.yml down -v

# Construir e iniciar containers
echo "🔨 Construindo e iniciando containers..."
docker compose -f docker-compose.dev.yml up --build -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos containers
echo "📊 Status dos containers:"
docker compose -f docker-compose.dev.yml ps

# Verificar logs do MySQL
echo "🔍 Verificando MySQL..."
docker compose -f docker-compose.dev.yml logs mysql-dev | tail -10

# Verificar logs do Backend
echo "🔍 Verificando Backend..."
docker compose -f docker-compose.dev.yml logs backend-dev | tail -10

echo "✅ Ambiente de desenvolvimento iniciado!"
echo ""
echo "📋 Serviços disponíveis:"
echo "   🌐 Backend API: http://localhost:8080"
echo "   🗄️  MySQL: localhost:3306"
echo "   🔴 Redis: localhost:6379"
echo ""
echo "📚 Comandos úteis:"
echo "   docker compose -f docker-compose.dev.yml logs -f    # Ver logs em tempo real"
echo "   docker compose -f docker-compose.dev.yml down       # Parar ambiente"
echo "   docker compose -f docker-compose.dev.yml restart    # Reiniciar ambiente"
echo ""
echo "🔧 Para testar serviços:"
echo "   curl http://localhost:8080/health"
echo "   mysql -h localhost -P 3306 -u clientes_user -p clientes_dev"
