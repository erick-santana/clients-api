#!/bin/bash

# Script para executar testes do frontend Angular
# Uso: ./scripts/test.sh [opção]

set -e

echo "🧪 Executando testes do frontend Angular..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Instale primeiro: https://nodejs.org/"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado. Instale primeiro: https://nodejs.org/"
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Função para executar testes
run_tests() {
    local test_type=$1
    local test_command=$2
    
    echo "🔍 Executando $test_type..."
    echo "📋 Comando: $test_command"
    echo ""
    
    if npm run $test_command; then
        echo "✅ $test_type executados com sucesso!"
    else
        echo "❌ $test_type falharam!"
        exit 1
    fi
}

# Verificar argumentos
case "${1:-all}" in
    "all")
        echo "🎯 Executando todos os testes..."
        run_tests "Todos os testes" "test"
        ;;
    "watch")
        echo "👀 Executando testes em modo watch..."
        run_tests "Testes em modo watch" "test:watch"
        ;;
    "coverage")
        echo "📊 Executando testes com cobertura..."
        run_tests "Testes com cobertura" "test:coverage"
        ;;
    "ci")
        echo "🚀 Executando testes para CI/CD..."
        run_tests "Testes para CI/CD" "test:ci"
        ;;
    "unit")
        echo "🔧 Executando testes unitários..."
        run_tests "Testes unitários" "test:unit"
        ;;
    "services")
        echo "⚙️  Executando testes de serviços..."
        run_tests "Testes de serviços" "test:services"
        ;;
    "components")
        echo "🧩 Executando testes de componentes..."
        run_tests "Testes de componentes" "test:components"
        ;;
    "interceptors")
        echo "🔗 Executando testes de interceptors..."
        run_tests "Testes de interceptors" "test:interceptors"
        ;;
    "lint")
        echo "🔍 Executando linting..."
        if npm run lint; then
            echo "✅ Linting passou!"
        else
            echo "❌ Linting falhou!"
            exit 1
        fi
        ;;
    "lint:fix")
        echo "🔧 Corrigindo problemas de linting..."
        if npm run lint:fix; then
            echo "✅ Linting corrigido!"
        else
            echo "❌ Falha ao corrigir linting!"
            exit 1
        fi
        ;;
    "help"|"-h"|"--help")
        echo "📚 Uso: ./scripts/test.sh [opção]"
        echo ""
        echo "Opções disponíveis:"
        echo "  all          - Executar todos os testes (padrão)"
        echo "  watch        - Executar testes em modo watch"
        echo "  coverage     - Executar testes com cobertura"
        echo "  ci           - Executar testes para CI/CD"
        echo "  unit         - Executar apenas testes unitários"
        echo "  services     - Executar apenas testes de serviços"
        echo "  components   - Executar apenas testes de componentes"
        echo "  interceptors - Executar apenas testes de interceptors"
        echo "  lint         - Executar linting"
        echo "  lint:fix     - Corrigir problemas de linting"
        echo "  help         - Mostrar esta ajuda"
        echo ""
        echo "Exemplos:"
        echo "  ./scripts/test.sh              # Executar todos os testes"
        echo "  ./scripts/test.sh coverage     # Executar testes com cobertura"
        echo "  ./scripts/test.sh services     # Executar apenas testes de serviços"
        echo "  ./scripts/test.sh lint         # Executar linting"
        ;;
    *)
        echo "❌ Opção inválida: $1"
        echo "💡 Use './scripts/test.sh help' para ver as opções disponíveis"
        exit 1
        ;;
esac

echo ""
echo "🎉 Testes concluídos!"
echo ""
echo "📋 Relatórios disponíveis:"
echo "   📊 Cobertura: ./coverage/index.html"
echo "   📝 Logs: ./karma.log"
echo ""
echo "🔧 Comandos úteis:"
echo "   npm run test:watch        # Executar testes em modo watch"
echo "   npm run test:coverage     # Executar testes com cobertura"
echo "   npm run lint              # Executar linting"
echo "   npm run lint:fix          # Corrigir problemas de linting"
