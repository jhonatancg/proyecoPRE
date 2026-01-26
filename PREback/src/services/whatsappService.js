const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicializamos el cliente con estrategia de guardado de sesión
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox'] // Necesario si lo despliegas en Linux/Docker
    }
});

// Generar QR en la terminal para iniciar sesión
client.on('qr', (qr) => {
    console.log('ESCANEA ESTE QR CON TU WHATSAPP PARA CONECTAR EL BOT:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp listo y conectado!');
});

client.on('auth_failure', msg => {
    console.error('❌ Error de autenticación en WhatsApp:', msg);
});

// Función para enviar mensaje
const enviarMensaje = async (numero, texto) => {
    try {
        // Formatear número: Perú es 51. WhatsApp Web usa formato: 51999999999@c.us
        // Quitamos espacios o guiones si los hubiera
        const numeroLimpio = numero.replace(/\D/g, '');

        // Validar si tiene 9 dígitos (celular Perú)
        if (numeroLimpio.length === 9) {
            const chatId = `51${numeroLimpio}@c.us`;
            await client.sendMessage(chatId, texto);
            console.log(`📩 Mensaje enviado a ${numeroLimpio}`);
            return true;
        } else {
            console.log(`⚠️ Número inválido: ${numero}`);
            return false;
        }
    } catch (error) {
        console.error('Error enviando WhatsApp:', error);
        return false;
    }
};

// Iniciar el cliente
client.initialize();

module.exports = { enviarMensaje };