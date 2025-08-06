// Servicios/broker-api.js

const { ClientSdk, LoginPasswordAuthMethod, BalanceType } = require('@tradecodehub/client-sdk-js');
const config = require('../config/config');

class BrokerAPI {
    constructor(brokerConfig) {
        this.sdk = null;
        this.logCallback = null;
        this.brokerConfig = brokerConfig;
    }

    setCredentials(email, password) {
        this.email = email;
        this.password = password;
    }

    setLogCallback(callback) {
        this.logCallback = callback;
    }

    async connect() {
        this.logCallback("Conectando con el bróker a través del Client SDK...");
        try {
            this.sdk = await ClientSdk.create(
                this.brokerConfig.wsUrl,
                this.brokerConfig.connectionId,
                new LoginPasswordAuthMethod(this.brokerConfig.apiUrl, this.email, this.password)
            );
            this.logCallback("Conexión exitosa.");
            return true;
        } catch (error) {
            this.logCallback(`Error de conexión: ${error.message}`);
            throw new Error("Fallo en la autenticación del bróker.");
        }
    }

    async disconnect() {
        if (this.sdk) {
            await this.sdk.shutdown();
            this.logCallback("Conexión con el bróker cerrada.");
            this.sdk = null;
        }
    }

    // --- FUNCIONES DE TRADING ---

    async getBalances() {
        if (!this.sdk) {
            throw new Error("SDK no está conectado.");
        }
        const balances = await this.sdk.balances();
        return balances.getBalances();
    }

    async getQuotesForActive(activeId) {
        if (!this.sdk) {
            throw new Error("SDK no está conectado.");
        }
        const quotes = await this.sdk.quotes();
        const currentQuote = await quotes.getCurrentQuoteForActive(activeId);
        return currentQuote;
    }
    
    async getCandles(activeName, timeframe, count) {
        if (!this.sdk) {
            throw new Error("SDK no está conectado.");
        }
        try {
            const candles = await this.sdk.candles().getCandles(activeName, timeframe, count);
            return candles;
        } catch (error) {
            this.logCallback(`Error al obtener velas: ${error.message}`);
            throw error;
        }
    }

    async buyBlitzOption(activeId, direction, amount) {
        if (!this.sdk) {
            throw new Error("SDK no está conectado.");
        }

        try {
            const balances = await this.sdk.balances();
            const realBalance = balances.getBalances().find(b => b.type === BalanceType.Real);

            if (!realBalance) {
                this.logCallback("Error: No se encontró un saldo real para operar.");
                return null;
            }

            const blitzOptions = await this.sdk.blitzOptions();
            const actives = blitzOptions.getActives();
            const active = actives.find(a => a.id === activeId);

            if (!active) {
                this.logCallback("Error: Activo no encontrado.");
                return null;
            }

            const option = await blitzOptions.buy(
                active,
                direction, // Por ejemplo: BlitzOptionsDirection.Call
                active.expirationTimes[0],
                amount,
                realBalance
            );

            this.logCallback(`Compra de opción Blitz exitosa. ID: ${option.id}`);
            return option;
        } catch (error) {
            this.logCallback(`Error al comprar opción Blitz: ${error.message}`);
            return null;
        }
    }
}

module.exports = BrokerAPI;
