const { spawn } = require('child_process');
const logger = require('../utils/logger');

async function restartServer() {
  try {
    logger.info('=== Reiniciando Servidor ===');
    
    // Parar processo atual (se existir)
    logger.info('🛑 Parando processo atual...');
    const killProcess = spawn('pkill', ['-f', 'node src/server.js']);
    
    killProcess.on('close', (code) => {
      logger.info(`Processo anterior finalizado com código: ${code}`);
      
      // Aguardar um pouco
      setTimeout(() => {
        logger.info('🚀 Iniciando novo servidor...');
        
        // Iniciar novo servidor
        const newServer = spawn('node', ['src/server.js'], {
          stdio: 'inherit',
          cwd: process.cwd()
        });
        
        newServer.on('error', (error) => {
          logger.error('❌ Erro ao iniciar servidor:', error);
        });
        
        newServer.on('close', (code) => {
          logger.info(`Servidor finalizado com código: ${code}`);
        });
        
        // Aguardar um pouco para o servidor inicializar
        setTimeout(() => {
          logger.info('✅ Servidor reiniciado com sucesso');
          logger.info('🔗 Teste a API em: http://localhost:8080/api/clientes');
        }, 3000);
        
      }, 2000);
    });
    
  } catch (error) {
    logger.error('❌ Erro ao reiniciar servidor:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  restartServer();
}

module.exports = restartServer;

