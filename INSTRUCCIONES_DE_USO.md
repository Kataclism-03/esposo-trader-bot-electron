# 🚀 INSTRUCCIONES DE USO - ESPOSO TRADER BOT

## 📋 GUÍA PASO A PASO

### 1. INSTALACIÓN INICIAL

1. **Instalar Node.js** (si no lo tienes):
   - Descargar desde: https://nodejs.org/
   - Versión recomendada: LTS (Long Term Support)

2. **Instalar Yarn** (si no lo tienes):
   ```bash
   npm install -g yarn
   ```

3. **Instalar dependencias del bot**:
   ```bash
   cd ruta_del_bot
   yarn install
   ```

### 2. CONFIGURACIÓN PREVIA

1. **Crear archivo de configuración**:
   - Copia el archivo `.env.example` y renómbralo a `.env`
   - Edita el archivo `.env` con tus credenciales:
   ```env
   IQ_EMAIL=tu_email@ejemplo.com
   IQ_PASSWORD=tu_password_del_broker
   ```

2. **Verificar configuración de Telegram** (opcional):
   - Las notificaciones ya están configuradas
   - Si quieres cambiar el chat, edita `config/config.js`

### 3. EJECUCIÓN DEL BOT

#### Opción A: Modo Desarrollo
```bash
yarn start
```

#### Opción B: Compilar ejecutable
```bash
yarn build
```
Esto creará un archivo ejecutable en la carpeta `dist/`

### 4. PRIMER USO

#### 🆕 REGISTRO (Primera vez)
1. Al abrir el bot, aparecerá la ventana de registro
2. Haz clic en los enlaces de IQ Option o Exnova
3. Regístrate en el broker usando esos enlaces
4. Ingresa tu email en el campo correspondiente
5. Haz clic en "Confirmar Registro"

#### 🔑 LOGIN (Usos posteriores)
1. Ingresa tu email registrado
2. Haz clic en "Ingresar"

### 5. CONFIGURACIÓN DEL BOT

#### 🎯 Selección de Broker
- **IQ Option**: Broker original, muy estable
- **Exnova**: Alternative, misma API que IQ Option

#### ⚙️ Parámetros de Trading
- **Activo**: Por defecto EURUSD (puedes cambiarlo)
- **Tiempo**: 5 minutos (recomendado para principiantes)
- **Monto Inicial**: $1.00 (ajusta según tu capital)
- **Martingala**: Activa por defecto (duplica después de pérdida)
- **Stop Loss**: $10 (máxima pérdida permitida)
- **Take Profit**: $5 (ganancia objetivo)

#### 📊 Indicadores Técnicos
- **MA Rápida**: 5 períodos
- **MA Lenta**: 34 períodos  
- **Período Señal**: 5 períodos

### 6. OPERACIÓN DEL BOT

#### Paso 1: Conectar al Broker
1. Selecciona tu broker (IQ Option o Exnova)
2. Haz clic en "🔌 Conectar a Broker"
3. Espera confirmación de conexión

#### Paso 2: Generar Señales
1. Haz clic en "📊 Generar Señales"
2. El bot analizará el mercado
3. Verás las señales en la lista
4. Ejemplo: "EURUSD - CALL - 14:25"

#### Paso 3: Iniciar Trading Automático
1. Haz clic en "🚀 Iniciar Bot"
2. El bot ejecutará operaciones automáticamente
3. Monitorea el log del sistema
4. Observa el balance y estadísticas

#### Paso 4: Detener el Bot
1. Haz clic en "⏹️ Detener Bot" cuando quieras parar
2. El bot completará las operaciones en curso
3. Puedes generar nuevas señales y reiniciar

### 7. INTERPRETACIÓN DE RESULTADOS

#### 📈 Panel de Estado
- **Balance Inicial**: Tu balance al iniciar
- **Balance Actual**: Balance en tiempo real
- **Operaciones**: Número total de operaciones
- **Pérdidas Consecutivas**: Contador de pérdidas seguidas

#### 📋 Log del Sistema
- **✅ WIN**: Operación ganadora
- **❌ LOSS**: Operación perdedora  
- **⛔️ Stop Loss**: Límite de pérdida alcanzado
- **🎯 Take Profit**: Objetivo de ganancia alcanzado
- **⚠️ Warning**: Advertencias importantes

### 8. NOTIFICACIONES TELEGRAM

El bot envía notificaciones automáticas para:
- ✅ Operaciones ganadoras
- ❌ Operaciones perdedoras
- 🆕 Nuevos registros
- ⛔️ Stop Loss alcanzado
- 🎯 Take Profit alcanzado
- 🔴 Errores críticos

### 9. CONSEJOS PARA MEJORES RESULTADOS

#### 💡 Gestión de Capital
- Empieza con montos pequeños ($1-$5)
- No arriesgues más del 2% de tu capital por operación
- Usa Stop Loss conservador al principio

#### 📊 Análisis de Mercado
- Opera en horarios de mayor volatilidad
- Evita noticias económicas importantes
- Observa patrones antes de aumentar montos

#### ⚠️ Gestión de Riesgo
- No desactives el Stop Loss
- Martingala: úsala con precaución
- Toma descansos, no operes 24/7

### 10. SOLUCIÓN DE PROBLEMAS

#### ❌ Error de Conexión al Broker
- Verifica tus credenciales en el archivo `.env`
- Comprueba tu conexión a internet
- Reinicia el bot y vuelve a intentar

#### 📊 No se Generan Señales
- Cambia a un activo más volátil (EURUSD, GBPUSD)
- Ajusta los parámetros de los indicadores
- Espera un momento diferente del día

#### 💰 Bot No Ejecuta Operaciones
- Verifica que tengas balance suficiente
- Comprueba que las señales no sean muy antiguas
- Reinicia la conexión al broker

#### 📱 No Llegan Notificaciones Telegram
- Las notificaciones están preconfiguradas
- Verifica tu conexión a internet
- El bot funciona aunque no lleguen notificaciones

### 11. ARCHIVO DE CONFIGURACIÓN AVANZADA

Si eres usuario avanzado, puedes editar `config/config.js`:

```javascript
// Cambiar configuración de trading
trading: {
    defaultAsset: "GBPUSD",        // Cambiar activo
    defaultTimeframe: 1,           // Cambiar a 1 minuto
    defaultStopLoss: 20.0,         // Aumentar Stop Loss
    maxConsecutiveLosses: 5        // Permitir más pérdidas
}
```

### 12. SOPORTE TÉCNICO

- 💬 Telegram: https://t.me/Tu_usuario_de_telegram
- 📧 Email: Consulta el canal de Telegram
- 🐛 Errores: Reporta problemas con capturas de pantalla

---

## ⚠️ DESCARGO DE RESPONSABILIDAD

- Este bot es para fines educativos
- El trading conlleva riesgos financieros altos
- Nunca inviertas dinero que no puedas permitirte perder
- Los resultados pasados no garantizan resultados futuros
- Usa el bot bajo tu propia responsabilidad

---

## ✅ CHECKLIST ANTES DE OPERAR

- [ ] Credenciales configuradas en `.env`
- [ ] Conexión al broker exitosa
- [ ] Señales generadas correctamente
- [ ] Stop Loss configurado conservadoramente
- [ ] Monto inicial apropiado para tu capital
- [ ] Horario de trading adecuado
- [ ] Mental preparado para pérdidas

¡Buena suerte y que tengas operaciones exitosas! 🚀💰