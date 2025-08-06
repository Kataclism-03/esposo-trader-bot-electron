// main.js

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const TelegramService = require('./Servicios/telegram');
const BrokerAPI = require('./Servicios/broker-api');
const TradingBot = require('./Servicios/trading-bot');
const SignalGenerator = require('./Servicios/signals');

// --- Ventana principal ---
let mainWindow;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'frontend', 'login.html'));
    
    // Abrir DevTools (solo en modo de desarrollo)
    // mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// --- Función para enviar logs a la ventana de la UI ---
let logCallback = (message) => {
    if (mainWindow) {
        mainWindow.webContents.send('log-message', message);
    }
};

let uiCallback = (data) => {
    if (mainWindow) {
        mainWindow.webContents.send('ui-update', data);
    }
};

// --- Variables globales para el bot de trading ---
let tradingBot = null;
let userCredentials = null; // Almacenará las credenciales después del login
const selectedBrokerConfig = config.brokers.iqoption; // Selecciona la corretora
const brokerApi = new BrokerAPI(selectedBrokerConfig); // Inicialización sin credenciales

// --- Manejador para el login en el bróker (NUEVO) ---
ipcMain.handle('login-broker', async (event, credentials) => {
    logCallback("Intentando conectar con el bróker a través de Electron...");
    
    // Almacena las credenciales globalmente
    userCredentials = credentials;
    
    brokerApi.setCredentials(userCredentials.email, userCredentials.password);
    brokerApi.setLogCallback(logCallback);

    try {
        const isConnected = await brokerApi.connect();
        if (isConnected) {
            logCallback("Conexión con el bróker exitosa. ¡Listo para operar!");
            return true;
        }
    } catch (error) {
        logCallback(`❌ Error al conectar con el bróker: ${error.message}`);
        return false;
    }
});

// --- Manejador para iniciar el bot (MODIFICADO) ---
ipcMain.handle('start-bot', async (event, tradingConfig) => {
    if (!tradingBot || !tradingBot.isRunning) {
        // Asegúrate de que el usuario haya iniciado sesión primero
        if (!userCredentials) {
            logCallback("❌ Error: No se ha iniciado sesión en el bróker.");
            return false;
        }
        
        logCallback("Iniciando el bot...");

        const signalGenerator = new SignalGenerator(tradingConfig, brokerApi);
        const initialSignals = await signalGenerator.generateSignals();
        
        tradingBot = new TradingBot(tradingConfig, brokerApi, initialSignals, logCallback, uiCallback);
        await tradingBot.start();
        return true;
    }
    return false;
});

// --- Manejador para detener el bot (sin cambios) ---
ipcMain.handle('stop-bot', async () => {
    if (tradingBot && tradingBot.isRunning) {
        logCallback("Deteniendo el bot...");
        await tradingBot.stop();
        logCallback("Desconectando del bróker...");
        await brokerApi.disconnect();
        tradingBot = null;
        return true;
    }
    return false;
});

// --- Manejador para salir de la aplicación (sin cambios) ---
ipcMain.handle('quit-app', () => {
    if (tradingBot && tradingBot.isRunning) {
        tradingBot.stop().finally(() => {
            brokerApi.disconnect().finally(() => app.quit());
        });
    } else {
        brokerApi.disconnect().finally(() => app.quit());
    }
});

// --- Manejador para cambiar de ventana ---
ipcMain.handle('show-bot', () => {
    if (mainWindow) {
        mainWindow.loadFile(path.join(__dirname, 'frontend', 'bot.html'));
    }
});

ipcMain.handle('open-external-link', async (event, url) => {
    shell.openExternal(url);
});
