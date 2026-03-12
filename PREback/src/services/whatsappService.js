const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('Iniciando servicio de WhatsApp...');

// VARIABLE DE CONTROL: Para evitar que el mensaje de éxito salga 3 veces
let yaMostroMensaje = false;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Estabilidad para Linux/Windows
        headless: true // Sin navegador visual
    }
});

// 1. Generación de QR
client.on('qr', (qr) => {
    yaMostroMensaje = false;
    console.log('------------------------------------------------');
    console.log('ESCANEA ESTE QR CON TU WHATSAPP (Dispositivos Vinculados):');
    qrcode.generate(qr, { small: true });
    console.log('------------------------------------------------');
});

// 2. Confirmación de Autenticación
client.on('authenticated', () => {
    if (!yaMostroMensaje) {
        console.log('✅ QR Escaneado correctamente. Autenticación exitosa.');
        yaMostroMensaje = true;
    }
});

// 3. Pantalla de carga
client.on('loading_screen', (porcentaje, mensaje) => {
    console.log(`⏳ Cargando WhatsApp: ${porcentaje}% - ${mensaje}`);
});

// 4. LISTO PARA USAR
client.on('ready', () => {
    console.log('🚀 Cliente de WhatsApp listo para enviar mensajes!');
});

// 5. Errores y Desconexión
client.on('auth_failure', msg => {
    console.error('❌ Error de autenticación:', msg);
});

client.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp se desconectó. Razón:', reason);
    yaMostroMensaje = false;
});

// Función para pausar (Delay)
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para enviar mensaje
const enviarMensaje = async (numero, texto) => {
    try {
        if (!numero) return false;

        // Limpieza de número (Perú)
        const numeroLimpio = numero.replace(/\D/g, '');
        const chatId = `51${numeroLimpio}@c.us`;

        // 🚨 SIMULACIÓN DE HUMANO: "Escribiendo..."
        const chat = await client.getChatById(chatId);
        await chat.sendStateTyping(); // Aparece "Escribiendo..." en el cel del padre

        // Espera aleatoria entre 3 y 5 segundos mientras "escribe"
        const tiempoEscritura = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
        await esperar(tiempoEscritura);

        // Intentamos enviar
        await client.sendMessage(chatId, texto);
        console.log(`📩 Mensaje enviado a ${numeroLimpio}`);
        return true;

    } catch (error) {
        console.error(`Error enviando WhatsApp a ${numero}:`, error.message);
        return false;
    }
};

// Iniciar el cliente
client.initialize();

module.exports = { enviarMensaje };