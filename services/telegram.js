const axios = require('axios');

// --- CONFIGURACIÓN TELEGRAM ---
const TELEGRAM_BOT_TOKEN = "8343863048:AAFQ-jvOGHhlcf5yPCuLQUgJOu1EkivrFNc";
const TELEGRAM_CHAT_ID = "-1002735181980";
const TELEGRAM_SUPPORT_LINK = "https://t.me/Tu_usuario_de_telegram";

class TelegramService {
    static async notificarTelegram(mensaje) {
        try {
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            const data = {
                chat_id: TELEGRAM_CHAT_ID,
                text: mensaje,
                parse_mode: 'HTML'
            };
            
            await axios.post(url, data);
            console.log('Notificación enviada a Telegram:', mensaje);
        } catch (error) {
            console.error('Error al enviar notificación a Telegram:', error.message);
        }
    }

    static async notificarRegistro(correo) {
        const mensaje = `🆕 <b>Nuevo Registro</b>\n📧 ${correo}\n⏰ ${new Date().toLocaleString()}`;
        await this.notificarTelegram(mensaje);
    }

    static async notificarOperacion(tipo, resultado, monto, balance) {
        let emoji = tipo === 'win' ? '✅' : '❌';
        let accion = tipo === 'win' ? 'WIN' : 'LOSS';
        
        const mensaje = `${emoji} <b>${accion}</b>\n💰 Monto: $${monto.toFixed(2)}\n📊 Resultado: $${resultado.toFixed(2)}\n💳 Balance: $${balance.toFixed(2)}\n⏰ ${new Date().toLocaleString()}`;
        await this.notificarTelegram(mensaje);
    }

    static async notificarStopLoss(perdida, balanceInicial, balanceFinal) {
        const mensaje = `⛔️ <b>STOP LOSS ALCANZADO</b>\n💸 Pérdida: $${perdida.toFixed(2)}\n📈 Balance inicial: $${balanceInicial.toFixed(2)}\n📉 Balance final: $${balanceFinal.toFixed(2)}\n⏰ ${new Date().toLocaleString()}`;
        await this.notificarTelegram(mensaje);
    }

    static async notificarTakeProfit(ganancia, balanceInicial, balanceFinal) {
        const mensaje = `🎯 <b>TAKE PROFIT ALCANZADO</b>\n💰 Ganancia: $${ganancia.toFixed(2)}\n📈 Balance inicial: $${balanceInicial.toFixed(2)}\n📊 Balance final: $${balanceFinal.toFixed(2)}\n⏰ ${new Date().toLocaleString()}`;
        await this.notificarTelegram(mensaje);
    }

    static async notificarError(error) {
        const mensaje = `🔴 <b>ERROR CRÍTICO</b>\n❗️ ${error}\n⏰ ${new Date().toLocaleString()}`;
        await this.notificarTelegram(mensaje);
    }

    static async notificarLimitePerdidasConsecutivas(perdidas) {
        const mensaje = `⚠️ <b>LÍMITE DE PÉRDIDAS CONSECUTIVAS</b>\n📉 Pérdidas: ${perdidas}\n🛑 Bot detenido automáticamente\n⏰ ${new Date().toLocaleString()}`;
        await this.notificarTelegram(mensaje);
    }

    static getSupportLink() {
        return TELEGRAM_SUPPORT_LINK;
    }
}

module.exports = TelegramService;
