const TelegramService = require('./telegram');

class TradingBot {
    constructor(config, signals, logCallback, uiCallback) {
        this.config = config;
        this.signals = [...signals]; // Copia de las señales
        this.logCallback = logCallback;
        this.uiCallback = uiCallback;
        
        // Estado del bot
        this.isRunning = false;
        this.perdidasConsecutivas = 0;
        this.montoActual = config.montoInicial;
        this.balanceInicial = 1000.00; // Simular balance inicial
        this.balanceActual = this.balanceInicial;
        this.totalOperaciones = 0;
        
        // Configuración
        this.maxPerdidasConsecutivas = 3;
        
        this.logCallback('🤖 Bot de trading inicializado');
    }

    async start() {
        if (this.isRunning) {
            throw new Error('El bot ya está ejecutándose');
        }

        this.isRunning = true;
        this.logCallback('🚀 Iniciando bot de trading...');
        
        // Actualizar UI inicial
        this.uiCallback({
            balance: this.balanceActual,
            operaciones: this.totalOperaciones,
            perdidasConsecutivas: this.perdidasConsecutivas
        });
        
        // Iniciar el bucle principal del bot
        this.mainLoop();
    }

    async stop() {
        this.isRunning = false;
        this.logCallback('⏹️ Deteniendo bot de trading...');
    }

    mainLoop() {
        if (!this.isRunning) return;

        // Verificar condiciones de stop
        if (this.verificarStopLoss()) return;
        if (this.verificarTakeProfit()) return;
        if (this.verificarLimitePerdidasConsecutivas()) return;

        // Buscar señales para ejecutar
        const ahora = Date.now();
        const senalesToExecute = this.signals.filter(signal => {
            const tiempoEjecucion = signal.time;
            const diferencia = Math.abs(tiempoEjecucion - ahora);
            return diferencia <= (this.config.tiempo * 60 * 1000 * 0.1); // 10% del tiempo de la vela
        });

        // Ejecutar señales encontradas
        senalesToExecute.forEach(signal => {
            this.ejecutarOperacion(signal);
            // Remover señal ejecutada
            const index = this.signals.indexOf(signal);
            if (index > -1) {
                this.signals.splice(index, 1);
            }
        });

        // Programar siguiente iteración
        if (this.isRunning) {
            setTimeout(() => this.mainLoop(), 1000);
        }
    }

    verificarStopLoss() {
        if (this.balanceActual <= this.balanceInicial - this.config.stopLoss) {
            const perdida = this.balanceInicial - this.balanceActual;
            this.logCallback(`⛔️ Stop-Loss alcanzado. Bot detenido. Pérdida: $${perdida.toFixed(2)}`);
            TelegramService.notificarStopLoss(perdida, this.balanceInicial, this.balanceActual);
            this.isRunning = false;
            return true;
        }
        return false;
    }

    verificarTakeProfit() {
        if (this.balanceActual >= this.balanceInicial + this.config.takeProfit) {
            const ganancia = this.balanceActual - this.balanceInicial;
            this.logCallback(`✅ Take-Profit alcanzado. Bot detenido. Ganancia: $${ganancia.toFixed(2)}`);
            TelegramService.notificarTakeProfit(ganancia, this.balanceInicial, this.balanceActual);
            this.isRunning = false;
            return true;
        }
        return false;
    }

    verificarLimitePerdidasConsecutivas() {
        if (this.perdidasConsecutivas >= this.maxPerdidasConsecutivas) {
            this.logCallback(`❌ Límite de ${this.maxPerdidasConsecutivas} pérdidas consecutivas alcanzado. Bot detenido.`);
            TelegramService.notificarLimitePerdidasConsecutivas(this.perdidasConsecutivas);
            this.isRunning = false;
            return true;
        }
        return false;
    }

    calcularMontoOperacion() {
        if (this.config.martingalaActiva && this.perdidasConsecutivas > 0) {
            this.montoActual = this.config.montoInicial * Math.pow(2, this.perdidasConsecutivas);
        } else {
            this.montoActual = this.config.montoInicial;
        }

        // Verificar si tenemos capital suficiente
        if (this.montoActual > this.balanceActual) {
            this.logCallback('⚠️ Capital insuficiente. Reiniciando monto de martingala.');
            this.montoActual = this.config.montoInicial;
            this.perdidasConsecutivas = 0;
        }

        return this.montoActual;
    }

    async ejecutarOperacion(signal) {
        const monto = this.calcularMontoOperacion();
        
        this.logCallback(`📈 Ejecutando operación ${signal.direction.toUpperCase()} en ${signal.activo} con $${monto.toFixed(2)}`);
        
        try {
            // Simular operación (en implementación real, aquí sería la llamada a la API del broker)
            const resultado = await this.simularOperacion(signal.direction, monto);
            
            this.totalOperaciones++;
            this.balanceActual = resultado.nuevoBalance;
            
            if (resultado.ganancia > 0) {
                // Operación ganadora
                this.perdidasConsecutivas = 0;
                this.logCallback(`✅ Operación ganadora! Ganancia: $${resultado.ganancia.toFixed(2)} | Balance: $${this.balanceActual.toFixed(2)}`);
                TelegramService.notificarOperacion('win', resultado.ganancia, monto, this.balanceActual);
            } else {
                // Operación perdedora
                this.perdidasConsecutivas++;
                this.logCallback(`❌ Operación perdedora. Pérdida: $${Math.abs(resultado.ganancia).toFixed(2)} | Balance: $${this.balanceActual.toFixed(2)} | Pérdidas consecutivas: ${this.perdidasConsecutivas}`);
                TelegramService.notificarOperacion('loss', resultado.ganancia, monto, this.balanceActual);
            }
            
            // Actualizar UI
            this.uiCallback({
                balance: this.balanceActual,
                operaciones: this.totalOperaciones,
                perdidasConsecutivas: this.perdidasConsecutivas
            });
            
        } catch (error) {
            this.logCallback(`❗ Error al ejecutar operación: ${error.message}`);
            TelegramService.notificarError(`Error en operación: ${error.message}`);
        }
    }

    async simularOperacion(direccion, monto) {
        // Simular tiempo de ejecución de la operación
        await new Promise(resolve => setTimeout(resolve, this.config.tiempo * 60 * 1000 / 10)); // 1/10 del tiempo real para demo
        
        // Simular resultado (70% de probabilidad de ganar para demo)
        const probabilidadGanar = 0.7;
        const esGanadora = Math.random() < probabilidadGanar;
        
        let ganancia;
        let nuevoBalance;
        
        if (esGanadora) {
            // Operación ganadora (payout típico de 80%)
            ganancia = monto * 0.8;
            nuevoBalance = this.balanceActual + ganancia;
        } else {
            // Operación perdedora
            ganancia = -monto;
            nuevoBalance = this.balanceActual - monto;
        }
        
        return {
            ganancia,
            nuevoBalance,
            direccion,
            monto
        };
    }
}

module.exports = TradingBot;