#!/bin/bash

# Script para iniciar ambiente de produção do frontend
# Uso: ./scripts/prod.sh

set -e

echo "🚀 Iniciando ambiente de produção do frontend..."

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

# Verificar se o backend está rodando
echo "🔍 Verificando se o backend está disponível..."
if ! curl -f http://localhost:8080/health &> /dev/null; then
    echo "⚠️  Backend não está rodando na porta 8080"
    echo "   Certifique-se de que o backend está iniciado antes de continuar"
fi

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

# Verificar logs do frontend
echo "🔍 Verificando logs do frontend..."
docker compose -f docker-compose.yml logs frontend | tail -10

# Verificar se o frontend está respondendo
echo "🔍 Verificando se o frontend está respondendo..."
if curl -f http://localhost:80 &> /dev/null; then
    echo "✅ Frontend está respondendo na porta 80"
else
    echo "⚠️  Frontend não está respondendo na porta 80"
fi

if curl -f https://localhost:443 &> /dev/null; then
    echo "✅ Frontend está respondendo na porta 443 (HTTPS)"
else
    echo "⚠️  Frontend não está respondendo na porta 443 (HTTPS)"
fi

echo "✅ Ambiente de produção do frontend iniciado!"
echo ""
echo "📋 Serviços disponíveis:"
echo "   🌐 Frontend HTTP: http://localhost:80"
echo "   🔒 Frontend HTTPS: https://localhost:443"
echo ""
echo "📚 Comandos úteis:"
echo "   docker compose -f docker-compose.yml logs -f    # Ver logs em tempo real"
echo "   docker compose -f docker-compose.yml down       # Parar ambiente"
echo "   docker compose -f docker-compose.yml restart    # Reiniciar ambiente"
echo ""
echo "🔧 Para testar frontend:"
echo "   curl http://localhost:80"
echo "   curl -k https://localhost:443"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Configure o domínio e certificados SSL para produção"
echo "   - Atualize as variáveis de ambiente conforme necessário"
echo "   - Configure o CloudFront para CDN se necessário"
