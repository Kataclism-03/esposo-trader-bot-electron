const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const config = require('./config/config');
const axios = require('axios');
const BrokerAPI = require('./Servicios/broker-api');
const TradingBot = require('./Servicios/trading-bot');
const SignalGenerator = require('./Servicios/signals');

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

let tradingBot = null;
let userCredentials = null;
const selectedBrokerConfig = config.brokers.iqoption;
const brokerApi = new BrokerAPI(selectedBrokerConfig);

ipcMain.handle('check-affiliate-by-id', async (event, userId) => {
    try {
        const url = config.affiliateListUrl;
        const response = await axios.get(url);
        const usuariosAfiliados = response.data;
        
        if (!Array.isArray(usuariosAfiliados)) {
            throw new Error('El formato de la lista de afiliados no es válido.');
        }

        return usuariosAfiliados.includes(userId);
    } catch (error) {
        console.error('Error al verificar afiliado por ID:', error);
        logCallback(`❌ Error al descargar o verificar la lista de afiliados: ${error.message}`);
        return false;
    }
});

ipcMain.handle('login-broker', async (event, credentials) => {
    logCallback("Intentando conectar con el bróker...");
    
    userCredentials = credentials;
    
    brokerApi.setCredentials(userCredentials.email, userCredentials.password);
    brokerApi.setLogCallback(logCallback);

    try {
        const isConnected = await brokerApi.connect();
        if (isConnected) {
            logCallback("Conexión con el bróker exitosa. ¡Listo para operar!");
            const profile = await brokerApi.getProfile(); // Asegúrate de que este método exista en broker-api.js
            if (profile && profile.userId) {
                return profile.userId;
            }
        }
        return false;
    } catch (error) {
        logCallback(`❌ Error al conectar con el bróker: ${error.message}`);
        return false;
    }
});

ipcMain.handle('start-bot', async (event, tradingConfig) => {
    if (!tradingBot || !tradingBot.isRunning) {
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

ipcMain.handle('quit-app', () => {
    if (tradingBot && tradingBot.isRunning) {
        tradingBot.stop().finally(() => {
            brokerApi.disconnect().finally(() => app.quit());
        });
    } else {
        brokerApi.disconnect().finally(() => app.quit());
    }
});

ipcMain.handle('show-bot', () => {
    if (mainWindow) {
        mainWindow.loadFile(path.join(__dirname, 'frontend', 'bot.html'));
    }
});

ipcMain.handle('open-external-link', async (event, url) => {
    shell.openExternal(url);
});
