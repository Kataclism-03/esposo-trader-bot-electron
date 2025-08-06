# Esposo Trader Bot - Versión Electron

Bot de trading automático para IQ Option y Exnova desarrollado con Electron y JavaScript.

## Características

- ✅ Interfaz de usuario estilo tkinter (familiar y simple)
- ✅ Soporte para IQ Option y Exnova
- ✅ Sistema de señales basado en medias móviles
- ✅ Trading automático con martingala
- ✅ Notificaciones por Telegram
- ✅ Stop Loss y Take Profit
- ✅ Sistema de registro y login
- ✅ Gestión de riesgo avanzada

## Requisitos del Sistema

- Node.js 16+
- Yarn package manager
- Sistema operativo: Windows, macOS o Linux

## Instalación

1. Instalar dependencias:
```bash
yarn install
```

2. Configurar variables de entorno (crear archivo .env en la raíz):
```env
IQ_EMAIL=tu_email@ejemplo.com
IQ_PASSWORD=tu_password
```

## Ejecución

### Modo Desarrollo
```bash
yarn start
```

### Compilar para Distribución
```bash
yarn build
```

Esto creará los ejecutables en la carpeta `dist/`.

## Configuración

### Telegram
Para recibir notificaciones, configura el bot de Telegram en `config/config.js`:
- `botToken`: Token del bot de Telegram
- `chatId`: ID del chat donde recibir notificaciones

### Trading
Parámetros configurables en la interfaz:
- Activo a operar (por defecto: EURUSD)
- Tiempo de las velas (por defecto: 5 minutos)
- Monto inicial
- Stop Loss y Take Profit
- Configuración de medias móviles

## Uso

1. **Registro**: La primera vez, regístrate usando los enlaces de afiliado
2. **Login**: Ingresa con tu correo registrado
3. **Conexión**: Selecciona el broker (IQ Option o Exnova) y conecta
4. **Configuración**: Ajusta los parámetros de trading según tus preferencias
5. **Señales**: Genera señales de trading basadas en análisis técnico
6. **Trading**: Inicia el bot automático o opera manualmente

## Estructura del Proyecto

```
/
├── main.js                 # Proceso principal de Electron
├── config/
│   └── config.js          # Configuración centralizada
├── renderer/              # Interfaz de usuario
│   ├── registro.html      # Pantalla de registro
│   ├── login.html         # Pantalla de login
│   ├── bot.html          # Interfaz principal del bot
│   └── styles.css        # Estilos tkinter-like
├── services/             # Lógica de negocio
│   ├── broker-api.js     # Integración con brokers
│   ├── trading-bot.js    # Motor de trading
│   ├── signals.js        # Generador de señales
│   └── telegram.js       # Notificaciones Telegram
└── data/                # Datos locales
    └── usuarios_registrados.json
```

## Brokers Soportados

### IQ Option
- URL: https://iqoption.com
- API compatible con el bot original
- Cuenta demo y real disponibles

### Exnova  
- URL: https://exnova.com
- Misma API que IQ Option
- Cuenta demo y real disponibles

## Indicadores Técnicos

El bot utiliza un sistema de medias móviles:
- **MA Rápida**: Por defecto 5 períodos
- **MA Lenta**: Por defecto 34 períodos  
- **Período de Señal**: Por defecto 5 períodos

Las señales se generan cuando la MA rápida cruza la MA lenta.

## Gestión de Riesgo

- **Martingala**: Duplica la apuesta después de cada pérdida
- **Stop Loss**: Detiene el bot al alcanzar pérdida máxima
- **Take Profit**: Detiene el bot al alcanzar ganancia objetivo
- **Límite de pérdidas consecutivas**: Máximo 3 pérdidas seguidas

## Notificaciones Telegram

El bot envía notificaciones para:
- Nuevos registros
- Operaciones ganadoras/perdedoras
- Stop Loss alcanzado
- Take Profit alcanzado
- Errores críticos

## Licencia

MIT License - Uso libre para fines educativos y comerciales.

## Soporte

Para soporte técnico, contacta: https://t.me/Tu_usuario_de_telegram

## Descargo de Responsabilidad

Este software es para fines educativos. El trading conlleva riesgos financieros. Usa este bot bajo tu propia responsabilidad.