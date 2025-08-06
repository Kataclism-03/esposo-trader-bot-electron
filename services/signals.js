class SignalGenerator {
    constructor(config) {
        this.config = config;
        this.activo = config.activo || 'EURUSD';
        this.tiempo = config.tiempo || 5;
        this.maFast = config.maFast || 5;
        this.maSlow = config.maSlow || 34;
        this.signalPeriod = config.signalPeriod || 5;
    }

    // Simular datos de velas (en una implementación real, estos vendrían de la API del broker)
    generarDatosSimulados() {
        const candles = [];
        let precio = 1.1000; // Precio inicial para EURUSD
        
        for (let i = 0; i < 200; i++) {
            // Generar movimiento aleatorio del precio
            const variacion = (Math.random() - 0.5) * 0.0020; // Variación de ±0.001
            precio += variacion;
            
            const high = precio + (Math.random() * 0.0005);
            const low = precio - (Math.random() * 0.0005);
            
            candles.push({
                time: Date.now() - ((200 - i) * this.tiempo * 60 * 1000),
                open: precio - (variacion / 2),
                high: high,
                low: low,
                close: precio,
                volume: Math.floor(Math.random() * 1000) + 500
            });
        }
        
        return candles;
    }

    calcularMediasMoviles(datos) {
        const precios = datos.map(d => d.close);
        const smaFast = this.calcularSMA(precios, this.maFast);
        const smaSlow = this.calcularSMA(precios, this.maSlow);
        
        // Calcular el buffer (diferencia entre medias)
        const buffer1 = [];
        for (let i = 0; i < smaFast.length; i++) {
            if (smaFast[i] !== null && smaSlow[i] !== null) {
                buffer1.push(smaFast[i] - smaSlow[i]);
            } else {
                buffer1.push(null);
            }
        }
        
        // Calcular la señal (media del buffer)
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

        // Señal de CALL (compra): buffer1 cruza hacia arriba del buffer2
        if (buffer1[len - 1] > buffer2[len - 1] && buffer1[len - 2] <= buffer2[len - 2]) {
            return 'call';
        }
        
        // Señal de PUT (venta): buffer1 cruza hacia abajo del buffer2
        if (buffer1[len - 1] < buffer2[len - 1] && buffer1[len - 2] >= buffer2[len - 2]) {
            return 'put';
        }

        return null;
    }

    async generateSignals() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const signals = [];
                
                // Generar señales para las próximas 10 velas
                for (let i = 0; i < 10; i++) {
                    const datos = this.generarDatosSimulados();
                    const { buffer1, buffer2 } = this.calcularMediasMoviles(datos);
                    const direccion = this.generarSenal(buffer1, buffer2);
                    
                    if (direccion) {
                        const signalTime = Date.now() + (this.tiempo * 60 * 1000 * (i + 1));
                        const formattedTime = new Date(signalTime).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        signals.push({
                            time: signalTime,
                            direction: direccion,
                            activo: this.activo,
                            formattedTime: formattedTime
                        });
                    }
                }
                
                resolve(signals);
            }, 2000); // Simular tiempo de procesamiento
        });
    }
}

module.exports = SignalGenerator;