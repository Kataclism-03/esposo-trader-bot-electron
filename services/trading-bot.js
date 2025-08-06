// Servicios/trading-bot.js

const TelegramService = require('./telegram');
const BrokerAPI = require('./broker-api');
const { BalanceType, BlitzOptionsDirection } = require('@tradecodehub/client-sdk-js');

class TradingBot {
    constructor(config, brokerApi, signals, logCallback, uiCallback) {
        this.config = config;
        this.brokerApi = brokerApi;
        this.signals = [...signals];
        this.logCallback = logCallback;
        this.uiCallback = uiCallback;
        
        this.isRunning = false;
        this.perdidasConsecutivas = 0;
        this.montoActual = config.montoInicial;
        
        this.maxPerdidasConsecutivas = 3;
        
        this.balanceInicial = 0;
        this.balanceActual = 0;
        this.totalOperaciones = 0;

        this.logCallback('🤖 Bot de trading inicializado');
    }

    async start() {
        if (this.isRunning) {
            throw new Error('El bot ya está ejecutándose');
        }

        this.logCallback('🚀 Iniciando bot de trading...');
        
        const balances = await this.brokerApi.getBalances();
        const balance = balances.find(b => b.type === BalanceType.Real);

        if (!balance) {
            this.logCallback('❌ No se encontró un saldo real para operar. Bot detenido.');
            return;
        }

        this.balanceInicial = balance.amount;
        this.balanceActual = this.balanceInicial;

        this.isRunning = true;

        this.uiCallback({
            balance: this.balanceActual,
            operaciones: this.totalOperaciones,
            perdidasConsecutivas: this.perdidasConsecutivas
        });
        
        this.mainLoop();
    }

    async stop() {
        this.isRunning = false;
        this.logCallback('⏹️ Deteniendo bot de trading...');
    }

    mainLoop() {
        if (!this.isRunning) return;

        if (this.verificarStopLoss()) return;
        if (this.verificarTakeProfit()) return;
        if (this.verificarLimitePerdidasConsecutivas()) return;

        const ahora = Date.now();
        const senalesToExecute = this.signals.filter(signal => {
            const tiempoEjecucion = signal.time;
            const diferencia = Math.abs(tiempoEjecucion - ahora);
            return diferencia <= (this.config.tiempo * 60 * 1000 * 0.1); 
        });

        senalesToExecute.forEach(signal => {
            this.ejecutarOperacion(signal);
            const index = this.signals.indexOf(signal);
            if (index > -1) {
                this.signals.splice(index, 1);
            }
        });

        if (this.isRunning) {
            setTimeout(() => this.mainLoop(), 1000);
        }
    }

    verificarStopLoss() {
        if (this.balanceActual <= this.balanceInicial - this.config.stopLoss) {
            const perdida = this
