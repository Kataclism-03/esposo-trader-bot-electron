module.exports = {
  brokers: {
    iqoption: {
      wsUrl: 'wss://iqoption.com/websocket/',
      apiUrl: 'https://iqoption.com/api/',
      connectionId: 'tu_connection_id_aqui' // Reemplaza con tu Connection ID
    }
  },
  martingale: {
    enabled: true,
    multiplier: 2
  },
  trading: {
    defaultAmount: 10,
    stopLoss: 50,
    takeProfit: 100
  }
};
