const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const TelegramService = require('./Servicios/telegram');
const BrokerAPI = require('./Servicios/broker-api');
const TradingBot = require('./Servicios/trading-bot');
const SignalGenerator = require('./Servicios/signals');

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

// --- Instancias de la lógica del bot ---
let brokerApi = new BrokerAPI();
let signalGenerator = null;
let tradingBot = null;
let userCredentials = { email: '', password: '' };

function createWindow() {
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
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    currentWindow.loadFile('Rendedor/registro.html');
    
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

    currentWindow.loadFile('Rendedor/login.html');
    
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

    currentWindow.loadFile('Rendedor/bot.html');
    
    currentWindow.on('closed', () => {
        currentWindow = null;
    });
}

// --- Callbacks para el bot ---
const logCallback = (message) => {
    if (currentWindow) {
        currentWindow.webContents.send('bot-log', message);
    }
};

const uiCallback = (status) => {
    if (currentWindow) {
        currentWindow.webContents.send('bot-status-update', status);
    }
};

// --- Handlers IPC ---
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
    
    await TelegramService.notificarRegistro(correo);
    
    return true;
});

ipcMain.handle('verificar-usuario', async (event, correo, password) => {
    if (fs.existsSync(USUARIOS_DB)) {
        const usuarios = JSON.parse(fs.readFileSync(USUARIOS_DB, 'utf8'));
        const usuario = usuarios[correo];
        
        if (usuario) {
            usuario.lastLogin = new Date().toISOString();
            fs.writeFileSync(USUARIOS_DB, JSON.stringify(usuarios, null, 2));
            
            userCredentials.email = correo;
            userCredentials.password = password;
            
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

// --- Handlers para el bot de trading ---
ipcMain.handle('start-bot', async (event, tradingConfig) => {
    if (!tradingBot || !tradingBot.isRunning) {
        brokerApi.setCredentials(userCredentials.email, userCredentials.password);
        brokerApi.setLogCallback(logCallback);
        
        signalGenerator = new SignalGenerator(tradingConfig, brokerApi);

        const initialSignals = await signalGenerator.generateSignals();
        
        tradingBot = new TradingBot(tradingConfig, brokerApi, initialSignals, logCallback, uiCallback);
        await tradingBot.start();
        return true;
    }
    return false;
});

ipcMain.handle('stop-bot', async () => {
    if (tradingBot && tradingBot.isRunning) {
        await tradingBot.stop();
        return true;
    }
    return false;
});

ipcMain.handle('get-bot-status', () => {
    if (tradingBot) {
        return { isRunning: tradingBot.isRunning };
    }
    return { isRunning: false };
});

ipcMain.handle('generate-signals', async (event, tradingConfig) => {
    if (signalGenerator) {
        signalGenerator.config = tradingConfig;
        const signals = await signalGenerator.generateSignals();
        return signals;
    }
    return [];
});

ipcMain.handle('get-trading-config', () => {
    return config.trading;
});

ipcMain.handle('get-brokers-config', () => {
    return config.brokers;
});

ipcMain.handle('quit-app', () => {
    if (tradingBot && tradingBot.isRunning) {
        tradingBot.stop().finally(() => app.quit());
    } else {
        app.quit();
    }
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
    if (currentWindow) {
        currentWindow.webContents.send('bot-error', `Error crítico: ${error.message}`);
    }
    TelegramService.notificarError(`Error crítico: ${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
    if (currentWindow) {
        currentWindow.webContents.send('bot-error', `Error de promesa: ${reason}`);
    }
});
