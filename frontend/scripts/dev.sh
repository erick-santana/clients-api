#!/bin/bash

# Script para iniciar ambiente de desenvolvimento do frontend
# Uso: ./scripts/dev.sh

set -e

echo "🚀 Iniciando ambiente de desenvolvimento do frontend..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instale primeiro: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Instale primeiro: https://docs.docker.com/compose/install/"
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker compose -f docker-compose.dev.yml down

# Construir e iniciar containers
echo "🔨 Construindo e iniciando containers..."
docker compose -f docker-compose.dev.yml up --build -d

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Verificar status dos containers
echo "📊 Status dos containers:"
docker compose -f docker-compose.dev.yml ps

# Verificar logs do frontend
echo "🔍 Verificando logs do frontend..."
docker compose -f docker-compose.dev.yml logs frontend-dev | tail -10

echo "✅ Ambiente de desenvolvimento do frontend iniciado!"
echo ""
echo "📋 Serviços disponíveis:"
echo "   🌐 Frontend Angular: http://localhost:4200"
echo ""
echo "📚 Comandos úteis:"
echo "   docker compose -f docker-compose.dev.yml logs -f    # Ver logs em tempo real"
echo "   docker compose -f docker-compose.dev.yml down       # Parar ambiente"
echo "   docker compose -f docker-compose.dev.yml restart    # Reiniciar ambiente"
echo ""
echo "🔧 Para testar frontend:"
echo "   curl http://localhost:4200"
echo "   npm test                                            # Executar testes unitários"
echo "   npm run test:coverage                               # Testes com cobertura"
