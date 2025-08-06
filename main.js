const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const TelegramService = require('./services/telegram');

// --- CONFIGURACIÓN ---
const USUARIOS_DB = path.join(__dirname, 'data', config.files.usersDatabase);
const VERSION_ACTUAL = config.app.version;

// Crear directorio data si no existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

let mainWindow;
let currentWindow = null;

function createWindow() {
    // Verificar si existe el archivo de usuarios para determinar qué ventana abrir
    if (!fs.existsSync(USUARIOS_DB)) {
        showRegistroWindow();
    } else {
        showLoginWindow();
    }
}

function showRegistroWindow() {
    if (currentWindow) currentWindow.close();
    
    currentWindow = new BrowserWindow({
        width: 400,
        height: 350,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false,
        title: `Registro - ${config.app.name}`,
        icon: path.join(__dirname, 'assets', 'icon.png') // Opcional
    });

    currentWindow.loadFile('renderer/registro.html');
    
    currentWindow.on('closed', () => {
        currentWindow = null;
    });
}

function showLoginWindow() {
    if (currentWindow) currentWindow.close();
    
    currentWindow = new BrowserWindow({
        width: 320,
        height: 220,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false,
        title: `Login - ${config.app.name}`
    });

    currentWindow.loadFile('renderer/login.html');
    
    currentWindow.on('closed', () => {
        currentWindow = null;
    });
}

function showBotWindow() {
    if (currentWindow) currentWindow.close();
    
    currentWindow = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: true,
        title: `${config.app.name} v${VERSION_ACTUAL}`,
        minWidth: 800,
        minHeight: 600
    });

    currentWindow.loadFile('renderer/bot.html');
    
    currentWindow.on('closed', () => {
        currentWindow = null;
    });
}

// IPC Handlers
ipcMain.handle('cargar-usuarios', () => {
    if (fs.existsSync(USUARIOS_DB)) {
        const data = fs.readFileSync(USUARIOS_DB, 'utf8');
        return JSON.parse(data);
    }
    return {};
});

ipcMain.handle('guardar-usuario', async (event, correo) => {
    const usuarios = fs.existsSync(USUARIOS_DB) ? 
        JSON.parse(fs.readFileSync(USUARIOS_DB, 'utf8')) : {};
    
    usuarios[correo] = {
        email: correo,
        registeredAt: new Date().toISOString(),
        lastLogin: null
    };
    
    fs.writeFileSync(USUARIOS_DB, JSON.stringify(usuarios, null, 2));
    
    // Notificar a Telegram
    await TelegramService.notificarRegistro(correo);
    
    return true;
});

ipcMain.handle('verificar-usuario', async (event, correo) => {
    if (fs.existsSync(USUARIOS_DB)) {
        const usuarios = JSON.parse(fs.readFileSync(USUARIOS_DB, 'utf8'));
        const usuario = usuarios[correo];
        
        if (usuario) {
            // Actualizar último login
            usuario.lastLogin = new Date().toISOString();
            fs.writeFileSync(USUARIOS_DB, JSON.stringify(usuarios, null, 2));
            return true;
        }
    }
    return false;
});

ipcMain.handle('get-config', () => {
    return config;
});

ipcMain.handle('get-affiliate-links', () => {
    return config.affiliate;
});

ipcMain.handle('open-external', (event, url) => {
    shell.openExternal(url);
});

ipcMain.handle('show-registro', () => {
    showRegistroWindow();
});

ipcMain.handle('show-login', () => {
    showLoginWindow();
});

ipcMain.handle('show-bot', () => {
    showBotWindow();
});

// Handlers para el bot de trading
ipcMain.handle('get-trading-config', () => {
    return config.trading;
});

ipcMain.handle('get-brokers-config', () => {
    return config.brokers;
});

// Handler para cerrar la aplicación
ipcMain.handle('quit-app', () => {
    app.quit();
});

// Eventos de la aplicación
app.whenReady().then(() => {
    createWindow();
    
    console.log(`${config.app.name} v${config.app.version} iniciado`);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
    // Opcionalmente notificar por Telegram
    TelegramService.notificarError(`Error crítico: ${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
});