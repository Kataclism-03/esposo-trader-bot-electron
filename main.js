// main.js

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const TelegramService = require('./Servicios/telegram');
const BrokerAPI = require('./Servicios/broker-api'); // Asegúrate de que esta línea esté presente
const TradingBot = require('./Servicios/trading-bot');
const SignalGenerator = require('./Servicios/signals');

// ... (El resto de tu código es igual)

// --- Handlers para el bot de trading ---
ipcMain.handle('start-bot', async (event, tradingConfig) => {
    if (!tradingBot || !tradingBot.isRunning) {
        logCallback("Intentando conectar con el bróker...");
        brokerApi.setCredentials(userCredentials.email, userCredentials.password);
        brokerApi.setLogCallback(logCallback);
        
        try {
            const isConnected = await brokerApi.connect();
            if (!isConnected) {
                logCallback("No se pudo conectar al bróker. Deteniendo el inicio del bot.");
                return false;
            }
        } catch (error) {
            logCallback(`Error al conectar con el bróker: ${error.message}`);
            return false;
        }

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
        logCallback("Deteniendo el bot...");
        await tradingBot.stop();
        logCallback("Desconectando del bróker...");
        await brokerApi.disconnect();
        tradingBot = null;
        return true;
    }
    return false;
});

// ... (El resto de tu código es igual)

ipcMain.handle('quit-app', () => {
    if (tradingBot && tradingBot.isRunning) {
        tradingBot.stop().finally(() => {
            brokerApi.disconnect().finally(() => app.quit());
        });
    } else {
        brokerApi.disconnect().finally(() => app.quit());
    }
});

// ... (El resto de tu código es igual)
