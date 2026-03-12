const { enviarMensaje } = require('./whatsappService'); // Asegúrate de que el nombre del archivo coincida

const colaMensajes = [];
let procesando = false;
let mensajesEnviadosLote = 0; // Contador para saber cuántos mensajes van en el lote actual

// Función para pausar la ejecución (Delay)
const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const procesarCola = async () => {
    // Si ya está enviando mensajes o la cola está vacía, no hace nada
    if (procesando || colaMensajes.length === 0) return;

    procesando = true;

    while (colaMensajes.length > 0) {

        // ------------------------------------------------------------------------
        // REGLA 1: ESPERAR HASTA LAS 8:00 AM PARA EMPEZAR A ENVIAR
        // ------------------------------------------------------------------------
        const ahora = new Date();
        if (ahora.getHours() < 8) {
            const ochoAM = new Date();
            ochoAM.setHours(8, 0, 0, 0); // Configuramos el reloj a las 08:00:00 de hoy
            const msFaltantes = ochoAM.getTime() - ahora.getTime();

            console.log(`[WhatsApp Queue] Es muy temprano. Pausando envíos por ${Math.round(msFaltantes / 60000)} minutos hasta las 8:00 AM...`);
            await esperar(msFaltantes);
            console.log(`[WhatsApp Queue] ¡Son las 8:00 AM! Despertando motor de envíos...`);
        }
        // ------------------------------------------------------------------------

        // Toma el primer mensaje de la lista
        const { numero, texto } = colaMensajes.shift();

        try {
            console.log(`[WhatsApp Queue] Enviando mensaje a ${numero}... (Mensajes en espera: ${colaMensajes.length})`);

            // Envía el mensaje real
            await enviarMensaje(numero, texto);
            mensajesEnviadosLote++; // Sumamos 1 al contador del lote

            // Si aún quedan mensajes por enviar en la cola, aplicamos las pausas Anti-Spam
            if (colaMensajes.length > 0) {

                // ------------------------------------------------------------------------
                // REGLA 2: ENVÍO POR LOTES (CHUNKING) Y PAUSAS ANTI-BAN
                // ------------------------------------------------------------------------
                if (mensajesEnviadosLote >= 15) {
                    // Pausa LARGA: entre 2 a 4 minutos (120,000 a 240,000 ms) al llegar a 15 mensajes
                    const descansoLargo = Math.floor(Math.random() * (240000 - 120000 + 1)) + 120000;
                    console.log(`⏳ [ANTI-BAN] Lote de 15 alcanzado. Descansando ${Math.round(descansoLargo / 60000)} minutos para simular comportamiento humano...`);
                    await esperar(descansoLargo);
                    mensajesEnviadosLote = 0; // Reiniciamos el contador para el próximo lote

                } else {
                    // Pausa CORTA normal entre cada mensaje (10 a 18 segundos)
                    const delayNormal = Math.floor(Math.random() * (18000 - 10000 + 1)) + 10000;
                    console.log(`[WhatsApp Queue] Esperando ${delayNormal / 1000} segundos para el siguiente envío...`);
                    await esperar(delayNormal);
                }
            }

        } catch (error) {
            console.error(`[WhatsApp Queue] Error enviando a ${numero}:`, error.message);
        }
    }

    // Al vaciar toda la cola, reseteamos los estados
    procesando = false;
    mensajesEnviadosLote = 0;
    console.log('[WhatsApp Queue] Todos los mensajes en la cola han sido enviados con éxito.');
};

// Esta es la función que se llamará desde el controlador
const agregarACola = (numero, texto) => {
    colaMensajes.push({ numero, texto });
    procesarCola(); // Inicia el proceso si no estaba corriendo
};

module.exports = { agregarACola };