// Servicios/broker-api.js

const { ClientSdk, LoginPasswordAuthMethod, BalanceType } = require('@tradecodehub/client-sdk-js');
const config = require('../config/config');

class BrokerAPI {
    constructor() {
        this.sdk = null;
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
        this.logCallback("Conectando con el bróker a través del Client SDK...");
        try {
            this.sdk = await ClientSdk.create(
                config.brokers.wsUrl,
                config.brokers.connectionId,
                new LoginPasswordAuthMethod(config.brokers.apiUrl, this.email, this.password)
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

    // Agrega más funciones para otras operaciones de trading según tu lógica
    // como buyTurboOption, buyBinaryOption, etc.
}

module.exports = BrokerAPI;
