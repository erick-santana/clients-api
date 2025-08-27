const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:8080';

// Função para gerar idempotency key
const generateIdempotencyKey = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Função para fazer login e obter token
const getAuthToken = async () => {
  const response = await axios.post(`${BASE_URL}/api/auth/login`, {
    username: 'admin',
    password: 'admin123'
  });
  return response.data.data.token;
};

async function testTransactionsAndIdempotency() {
  try {
    console.log('🧪 Testando Transações e Idempotência...\n');

    // 1. Login para obter token
    console.log('1️⃣ Fazendo login...');
    const token = await getAuthToken();
    console.log('✅ Login realizado');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Buscar cliente para teste
    console.log('\n2️⃣ Buscando cliente para teste...');
    const clientesResponse = await axios.get(`${BASE_URL}/api/clientes`, { headers });
    const cliente = clientesResponse.data.data[0];
    console.log(`✅ Cliente encontrado: ${cliente.nome} (Saldo: ${cliente.saldo})`);

    // 3. Testar idempotência em depósito
    console.log('\n3️⃣ Testando idempotência em depósito...');
    const idempotencyKey = generateIdempotencyKey();
    const depositoHeaders = {
      ...headers,
      'idempotency-key': idempotencyKey
    };

    // Primeira requisição
    console.log('   Primeira requisição de depósito...');
    const deposito1 = await axios.post(
      `${BASE_URL}/api/clientes/${cliente.id}/depositar`,
      { valor: 100.00 },
      { headers: depositoHeaders }
    );
    const saldoAposDeposito1 = deposito1.data.data.saldo;
    console.log(`   Saldo após primeiro depósito: ${saldoAposDeposito1}`);

    // Segunda requisição (deve retornar o mesmo resultado)
    console.log('   Segunda requisição de depósito (idempotente)...');
    const deposito2 = await axios.post(
      `${BASE_URL}/api/clientes/${cliente.id}/depositar`,
      { valor: 100.00 },
      { headers: depositoHeaders }
    );
    const saldoAposDeposito2 = deposito2.data.data.saldo;
    console.log(`   Saldo após segundo depósito: ${saldoAposDeposito2}`);

    if (saldoAposDeposito1 === saldoAposDeposito2) {
      console.log('✅ Idempotência funcionando: saldos iguais');
    } else {
      console.log('❌ Idempotência falhou: saldos diferentes');
    }

    // 4. Testar idempotência em saque
    console.log('\n4️⃣ Testando idempotência em saque...');
    const idempotencyKeySaque = generateIdempotencyKey();
    const saqueHeaders = {
      ...headers,
      'idempotency-key': idempotencyKeySaque
    };

    // Primeira requisição
    console.log('   Primeira requisição de saque...');
    const saque1 = await axios.post(
      `${BASE_URL}/api/clientes/${cliente.id}/sacar`,
      { valor: 50.00 },
      { headers: saqueHeaders }
    );
    const saldoAposSaque1 = saque1.data.data.saldo;
    console.log(`   Saldo após primeiro saque: ${saldoAposSaque1}`);

    // Segunda requisição (deve retornar o mesmo resultado)
    console.log('   Segunda requisição de saque (idempotente)...');
    const saque2 = await axios.post(
      `${BASE_URL}/api/clientes/${cliente.id}/sacar`,
      { valor: 50.00 },
      { headers: saqueHeaders }
    );
    const saldoAposSaque2 = saque2.data.data.saldo;
    console.log(`   Saldo após segundo saque: ${saldoAposSaque2}`);

    if (saldoAposSaque1 === saldoAposSaque2) {
      console.log('✅ Idempotência funcionando: saldos iguais');
    } else {
      console.log('❌ Idempotência falhou: saldos diferentes');
    }

    // 5. Testar operações sem idempotência (devem ser diferentes)
    console.log('\n5️⃣ Testando operações sem idempotência...');
    
    // Primeira operação sem idempotency key
    console.log('   Primeira operação sem idempotency key...');
    const operacao1 = await axios.post(
      `${BASE_URL}/api/clientes/${cliente.id}/depositar`,
      { valor: 25.00 },
      { headers }
    );
    const saldoAposOperacao1 = operacao1.data.data.saldo;
    console.log(`   Saldo após primeira operação: ${saldoAposOperacao1}`);

    // Segunda operação sem idempotency key
    console.log('   Segunda operação sem idempotency key...');
    const operacao2 = await axios.post(
      `${BASE_URL}/api/clientes/${cliente.id}/depositar`,
      { valor: 25.00 },
      { headers }
    );
    const saldoAposOperacao2 = operacao2.data.data.saldo;
    console.log(`   Saldo após segunda operação: ${saldoAposOperacao2}`);

    if (saldoAposOperacao1 !== saldoAposOperacao2) {
      console.log('✅ Operações sem idempotência funcionando: saldos diferentes');
    } else {
      console.log('❌ Operações sem idempotência falharam: saldos iguais');
    }

    // 6. Testar operação com saldo insuficiente
    console.log('\n6️⃣ Testando operação com saldo insuficiente...');
    try {
      await axios.post(
        `${BASE_URL}/api/clientes/${cliente.id}/sacar`,
        { valor: 1000000000000000.00 }, // Valor extremamente alto
        { headers }
      );
      console.log('❌ Erro: Deveria ter falhado com saldo insuficiente');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Operação com saldo insuficiente rejeitada corretamente');
      } else {
        console.log('❌ Erro inesperado:', error.message);
      }
    }

    console.log('\n🎉 Todos os testes de transações e idempotência concluídos!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testTransactionsAndIdempotency();
}

module.exports = testTransactionsAndIdempotency;
