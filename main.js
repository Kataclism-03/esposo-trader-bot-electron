const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// --- CONFIGURACIÓN ---
const USUARIOS_DB = path.join(__dirname, 'data', 'usuarios_registrados.json');
const VERSION_ACTUAL = "3.0.0";

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
        height: 300,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false,
        title: "Registro - Esposo Trader Bot"
    });

    currentWindow.loadFile('renderer/registro.html');
    
    currentWindow.on('closed', () => {
        currentWindow = null;
    });
}

function showLoginWindow() {
    if (currentWindow) currentWindow.close();
    
    currentWindow = new BrowserWindow({
        width: 300,
        height: 200,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false,
        title: "Login - Esposo Trader Bot"
    });

    currentWindow.loadFile('renderer/login.html');
    
    currentWindow.on('closed', () => {
        currentWindow = null;
    });
}

function showBotWindow() {
    if (currentWindow) currentWindow.close();
    
    currentWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: true,
        title: "Esposo Trader Bot v" + VERSION_ACTUAL
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

ipcMain.handle('guardar-usuario', (event, correo) => {
    const usuarios = fs.existsSync(USUARIOS_DB) ? 
        JSON.parse(fs.readFileSync(USUARIOS_DB, 'utf8')) : {};
    
    usuarios[correo] = true;
    fs.writeFileSync(USUARIOS_DB, JSON.stringify(usuarios, null, 2));
    
    // Notificar a Telegram
    const TelegramService = require('./services/telegram');
    TelegramService.notificarTelegram(`Nuevo registro: ${correo}`);
    
    return true;
});

ipcMain.handle('verificar-usuario', (event, correo) => {
    if (fs.existsSync(USUARIOS_DB)) {
        const usuarios = JSON.parse(fs.readFileSync(USUARIOS_DB, 'utf8'));
        return usuarios[correo] || false;
    }
    return false;
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

app.whenReady().then(createWindow);

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