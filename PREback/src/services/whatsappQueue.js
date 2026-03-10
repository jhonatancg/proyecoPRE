const { enviarMensaje } = require('./whatsappService'); // Asegúrate de que el nombre del archivo coincida

const colaMensajes = [];
let procesando = false;

// Función para pausar la ejecución (Delay)
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const procesarCola = async () => {
    // Si ya está enviando mensajes o la cola está vacía, no hace nada
    if (procesando || colaMensajes.length === 0) return;

    procesando = true;

    while (colaMensajes.length > 0) {
        // Toma el primer mensaje de la lista
        const { numero, texto } = colaMensajes.shift();

        try {
            console.log(`[WhatsApp Queue] Enviando mensaje a ${numero}... (Mensajes en espera: ${colaMensajes.length})`);

            // Envía el mensaje real
            await enviarMensaje(numero, texto);

            // 🚨 PROTECCIÓN ANTI-SPAM: Pausa aleatoria entre 6 y 12 segundos
            const delayAleatorio = Math.floor(Math.random() * (12000 - 6000 + 1)) + 6000;
            console.log(`[WhatsApp Queue] Esperando ${delayAleatorio / 1000} segundos para el siguiente envío...`);
            await esperar(delayAleatorio);

        } catch (error) {
            console.error(`[WhatsApp Queue] Error enviando a ${numero}:`, error.message);
        }
    }

    procesando = false;
    console.log('[WhatsApp Queue] Todos los mensajes en la cola han sido enviados con éxito.');
};

// Esta es la función que se llamará desde el controlador
const agregarACola = (numero, texto) => {
    colaMensajes.push({ numero, texto });
    procesarCola(); // Inicia el proceso si no estaba corriendo
};

module.exports = { agregarACola };