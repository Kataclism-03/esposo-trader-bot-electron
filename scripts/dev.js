// Script para ejecutar la aplicación en modo desarrollo
const { spawn } = require('child_process');
const path = require('path');

function runDev() {
    console.log('🚀 Iniciando Esposo Trader Bot en modo desarrollo...');
    console.log('📍 Directorio:', process.cwd());
    
    const electron = spawn('electron', ['.', '--no-sandbox', '--enable-logging'], {
        stdio: 'inherit',
        cwd: process.cwd()
    });

    electron.on('close', (code) => {
        console.log(`\n⏹️ Aplicación cerrada con código: ${code}`);
    });

    electron.on('error', (err) => {
        console.error('❌ Error al ejecutar la aplicación:', err);
    });

    // Manejar cierre del proceso
    process.on('SIGINT', () => {
        console.log('\n🛑 Deteniendo aplicación...');
        electron.kill();
        process.exit();
    });
}

if (require.main === module) {
    runDev();
}

module.exports = runDev;