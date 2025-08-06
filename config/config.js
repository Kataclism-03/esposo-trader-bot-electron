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
  },
  // La URL de tu lista de afiliados (ahora con IDs de usuario)
  affiliateListUrl: 'https://gist.githubusercontent.com/TuUsuario/UnaCadenaLargaDeNumeros/raw/OtraCadena/usuarios-afiliados.json'
};
