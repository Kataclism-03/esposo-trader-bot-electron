// Script de construcción para generar ejecutables multiplataforma

const builder = require('electron-builder');
const path = require('path');

const config = {
    appId: 'com.esposotrader.bot',
    productName: 'Esposo Trader Bot',
    directories: {
        output: 'dist'
    },
    files: [
        'main.js',
        'renderer/**/*',
        'services/**/*',
        'config/**/*',
        'data/**/*',
        'package.json',
        'node_modules/**/*'
    ],
    extraFiles: [
        {
            from: 'README.md',
            to: 'README.md'
        },
        {
            from: 'INSTRUCCIONES_DE_USO.md',
            to: 'INSTRUCCIONES_DE_USO.md'
        },
        {
            from: '.env.example',
            to: '.env.example'
        }
    ],
    win: {
        target: [
            {
                target: 'nsis',
                arch: ['x64']
            },
            {
                target: 'portable',
                arch: ['x64']
            }
        ],
        icon: 'assets/icon.ico'
    },
    mac: {
        target: [
            {
                target: 'dmg',
                arch: ['x64', 'arm64']
            }
        ],
        icon: 'assets/icon.icns'
    },
    linux: {
        target: [
            {
                target: 'AppImage',
                arch: ['x64']
            },
            {
                target: 'deb',
                arch: ['x64']
            }
        ],
        icon: 'assets/icon.png'
    },
    nsis: {
        oneClick: false,
        allowElevation: true,
        allowToChangeInstallationDirectory: true,
        installerIcon: 'assets/icon.ico',
        uninstallerIcon: 'assets/icon.ico',
        installerHeaderIcon: 'assets/icon.ico',
        createDesktopShortcut: true,
        createStartMenuShortcut: true
    }
};

async function build() {
    try {
        console.log('🚀 Iniciando proceso de construcción...');
        
        // Construir para la plataforma actual
        await builder.build({
            targets: builder.Platform.current().createTarget(),
            config: config
        });
        
        console.log('✅ Construcción completada exitosamente!');
        console.log('📦 Los archivos ejecutables están en la carpeta: dist/');
        
    } catch (error) {
        console.error('❌ Error durante la construcción:', error);
        process.exit(1);
    }
}

// Función para construir para todas las plataformas
async function buildAll() {
    try {
        console.log('🌍 Construyendo para todas las plataformas...');
        
        await builder.build({
            targets: builder.Platform.WINDOWS.createTarget('nsis', builder.Arch.x64)
                .concat(builder.Platform.MAC.createTarget('dmg', builder.Arch.x64))
                .concat(builder.Platform.LINUX.createTarget('AppImage', builder.Arch.x64)),
            config: config
        });
        
        console.log('✅ Construcción multiplataforma completada!');
        
    } catch (error) {
        console.error('❌ Error durante la construcción:', error);
        process.exit(1);
    }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--all')) {
    buildAll();
} else {
    build();
}

module.exports = { build, buildAll };