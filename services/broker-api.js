const { IQOptionClient } = require('@tradecodehub/client-sdk-js');

class BrokerAPI {
    constructor(brokerType = 'iqoption') {
        this.client = new IQOptionClient({ broker: brokerType });
        this.isConnected = false;
        this.balance = 0;
        this.balanceType = 'PRACTICE';
        this.email = '';
        this.password = '';
        this.logCallback = null;
    }

    setCredentials(email, password) {
        this.email = email;
        this.password = password;
    }
    
    setLogCallback(callback) {
        this.logCallback = callback;
    }

    async connect() {
        if (this.isConnected) return true;

        if (!this.email || !this.password) {
            this.logCallback('❌ Credenciales no configuradas.');
            return false;
        }

        try {
            this.logCallback(`Conectando a ${this.client.broker.toUpperCase()}...`);
            
            const result = await this.client.connect(this.email, this.password);

            if (result.success) {
                this.isConnected = true;
                this.logCallback('✅ Conectado exitosamente.');
                
                const balance = await this.client.getBalance(this.balanceType);
                this.balance = balance.amount;
                
                this.logCallback(`Balance inicial (${this.balanceType}): $${this.balance.toFixed(2)}`);
                
                return true;
            } else {
                this.logCallback(`❌ Error de conexión: ${result.message}`);
                return false;
            }
        } catch (error) {
            this.logCallback(`❌ Error crítico de conexión: ${error.message}`);
            return false;
        }
    }

    async disconnect() {
        if (!this.isConnected) return;
        await this.client.disconnect();
        this.isConnected = false;
        this.balance = 0;
        this.logCallback('🔌 Desconectado.');
    }

    checkConnection() {
        return this.isConnected;
    }

    async getBalance() {
        if (!this.isConnected) return 0;
        const balance = await this.client.getBalance(this.balanceType);
        this.balance = balance.amount;
        return this.balance;
    }
    
    async changeBalance(type = 'PRACTICE') {
        if (!this.isConnected) {
            this.logCallback('No conectado para cambiar el balance.');
            return false;
        }
        
        this.balanceType = type.toUpperCase();
        this.logCallback(`Cambiando a cuenta ${this.balanceType}...`);
        
        const newBalance = await this.client.getBalance(this.balanceType);
        this.balance = newBalance.amount;
        
        this.logCallback(`Balance actual en ${this.balanceType}: $${this.balance.toFixed(2)}`);
        return true;
    }

    async getCandles(asset, timeframe, count) {
        if (!this.isConnected) {
            throw new Error('No conectado al broker');
        }

        try {
            const candles = await this.client.getCandles(asset, timeframe, count);
            return candles;
        } catch (error) {
            this.logCallback(`Error obteniendo velas: ${error.message}`);
            throw error;
        }
    }

    async buy(amount, asset, direction, timeframe) {
        if (!this.isConnected) {
            throw new Error('No conectado al broker');
        }

        try {
            const result = await this.client.buy(amount, asset, direction, timeframe, this.balanceType);
            if (result.success) {
                this.logCallback(`📊 Operación iniciada: ${direction.toUpperCase()} ${asset} $${amount} (${timeframe}min)`);
                return result.id;
            } else {
                throw new Error(`Error al iniciar operación: ${result.message}`);
            }
        } catch (error) {
            this.logCallback(`Error ejecutando operación: ${error.message}`);
            throw error;
        }
    }

    async checkWin(operationId) {
        if (!this.isConnected) {
            throw new Error('No conectado al broker');
        }

        try {
            const result = await this.client.checkWin(operationId);
            return result;
        } catch (error) {
            this.logCallback(`Error verificando resultado: ${error.message}`);
            throw error;
        }
    }

    async getAssetInfo(asset) {
        if (!this.isConnected) {
            throw new Error('No conectado al broker');
        }

        try {
            const info = await this.client.getAssetInfo(asset);
            return info;
        } catch (error) {
            this.logCallback(`Error obteniendo info del activo: ${error.message}`);
            throw error;
        }
    }
}

module.exports = BrokerAPI;
