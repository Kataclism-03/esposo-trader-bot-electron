// Servicios/signals.js

const BrokerAPI = require('./broker-api');
const { BlitzOptionsDirection } = require('@tradecodehub/client-sdk-js');

class SignalGenerator {
    constructor(config, brokerApi) {
        this.config = config;
        this.brokerApi = brokerApi;
        this.activo = config.activo || 'EURUSD';
        this.tiempo = config.tiempo || 5;
        this.maFast = config.maFast || 5;
        this.maSlow = config.maSlow || 34;
        this.signalPeriod = config.signalPeriod || 5;
    }

    calcularMediasMoviles(datos) {
        const precios = datos.map(d => d.close);
        const smaFast = this.calcularSMA(precios, this.maFast);
        const smaSlow = this.calcularSMA(precios, this.maSlow);
        
        const buffer1 = [];
        for (let i = 0; i < smaFast.length; i++) {
            if (smaFast[i] !== null && smaSlow[i] !== null) {
                buffer1.push(smaFast[i] - smaSlow[i]);
            } else {
                buffer1.push(null);
            }
        }
        
        const buffer2 = this.calcularSMA(buffer1, this.signalPeriod);
        
        return { buffer1, buffer2 };
    }

    calcularSMA(datos, periodo) {
        const sma = [];
        
        for (let i = 0; i < datos.length; i++) {
            if (i < periodo - 1) {
                sma.push(null);
            } else {
                let suma = 0;
                for (let j = i - periodo + 1; j <= i; j++) {
                    suma += datos[j];
                }
                sma.push(suma / periodo);
            }
        }
        
        return sma;
    }

    generarSenal(buffer1, buffer2) {
        const len = buffer1.length;
        
        if (len < 2 || buffer1[len - 1] === null || buffer1[len - 2] === null ||
            buffer2[len - 1] === null || buffer2[len - 2] === null) {
            return null;
        }

        if (buffer1[len - 1] > buffer2[len - 1] && buffer1[len - 2] <= buffer2[len - 2]) {
            return BlitzOptionsDirection.Call;
        }
        
        if (buffer1[len - 1] < buffer2[len - 1] && buffer1[len - 2] >= buffer2[len - 2]) {
            return BlitzOptionsDirection.Put;
        }

        return null;
    }

    async generateSignals() {
        try {
            const candles = await this.brokerApi.getCandles(this.activo, this.tiempo, 200);

            if (!candles || candles.length === 0) {
                console.warn('No se pudieron obtener velas para generar señales.');
                return [];
            }
            
            const { buffer1, buffer2 } = this.calcularMediasMoviles(candles);
            const direccion = this.generarSenal(buffer1, buffer2);
            
            if (direccion) {
                const signalTime = Date.now();
                
                return [{
                    time: signalTime,
                    direction: direccion,
                    activo: this.activo,
                    formattedTime: new Date(signalTime).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }];
            }
            
            return [];
            
        } catch (error) {
            console.error('Error al generar señales:', error.message);
            return [];
        }
    }
}

module.exports = SignalGenerator;
