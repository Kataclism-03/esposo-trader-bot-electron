// Configuración centralizada de la aplicación

const config = {
    // Información de la aplicación
    app: {
        name: "Esposo Trader Bot",
        version: "3.0.0",
        description: "Bot de Trading para IQ Option y Exnova"
    },

    // Configuración de Telegram
    telegram: {
        botToken: "8343863048:AAFQ-jvOGHhlcf5yPCuLQUgJOu1EkivrFNc",
        chatId: "-1002735181980",
        supportLink: "https://t.me/Tu_usuario_de_telegram"
    },

    // Enlaces de afiliados
    affiliate: {
        iqOption: "https://affiliate.iqbroker.com/redir/?aff=378181&aff_model=revenue&afftrack=TUESPOSOTRADER",
        exnova: "https://exnova.com/lp/start-trading/?aff=378181&aff_model=revenue&afftrack=TUESPOSOTRADER"
    },

    // Configuración por defecto de trading
    trading: {
        defaultAsset: "EURUSD",
        defaultTimeframe: 5, // minutos
        defaultAmount: 1.0,
        maxConsecutiveLosses: 3,
        defaultStopLoss: 10.0,
        defaultTakeProfit: 5.0,
        
        // Indicadores técnicos
        indicators: {
            maFastPeriod: 5,
            maSlowPeriod: 34,
            signalPeriod: 5
        },

        // Martingala
        martingale: {
            enabled: true,
            multiplier: 2
        }
    },

    // Configuración de archivos
    files: {
        usersDatabase: "usuarios_registrados.json"
    },

    // Configuración de brokers
    brokers: {
        iqoption: {
            name: "IQ Option",
            apiUrl: "https://iqoption.com/api",
            wsUrl: "wss://iqoption.com/echo/websocket"
        },
        exnova: {
            name: "Exnova", 
            apiUrl: "https://exnova.com/api",
            wsUrl: "wss://exnova.com/echo/websocket"
        }
    }
};

module.exports = config;