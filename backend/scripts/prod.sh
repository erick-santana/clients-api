#!/bin/bash

# Script para iniciar ambiente de produção (Backend apenas)
set -e

echo "🚀 Iniciando ambiente de produção..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "⚠️  AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY devem estar configuradas"
    echo "   Configure as variáveis de ambiente ou crie um arquivo .env"
fi

if [ -z "$RDS_HOSTNAME" ] || [ -z "$RDS_PASSWORD" ]; then
    echo "⚠️  Variáveis do RDS devem estar configuradas"
    echo "   RDS_HOSTNAME, RDS_DB_NAME, RDS_USERNAME, RDS_PASSWORD"
fi

# Criar diretórios necessários
mkdir -p database logs

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker compose -f docker-compose.yml down

# Construir e iniciar containers
echo "🔨 Construindo e iniciando containers..."
docker compose -f docker-compose.yml up --build -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 15

# Verificar status dos containers
echo "📊 Status dos containers:"
docker compose -f docker-compose.yml ps

# Verificar health check
echo "🔍 Verificando health check..."
curl -f http://localhost:8080/health || echo "❌ Health check falhou"

echo "✅ Ambiente de produção iniciado!"
echo ""
echo "📋 Serviços disponíveis:"
echo "   🌐 Backend API: http://localhost:8080"
echo "   📊 Health Check: http://localhost:8080/health"
echo ""
echo "📚 Comandos úteis:"
echo "   docker compose -f docker-compose.yml logs -f    # Ver logs em tempo real"
echo "   docker compose -f docker-compose.yml down       # Parar ambiente"
echo "   docker compose -f docker-compose.yml restart    # Reiniciar ambiente"
echo ""
echo "🔧 Para monitoramento:"
echo "   curl http://localhost:8080/health"
echo "   docker compose -f docker-compose.yml logs backend"
