const db = require('../config/database');
const { enviarMensaje } = require('../services/whatsappService');

const registrarAsistencia = async (req, res) => {
    try {
        const { dni } = req.body;

        if (!dni) {
            return res.status(400).json({
                success: false,
                mensaje: 'Lectura inválida: No se detectó un DNI en el QR',
            });
        }
        const [alumnoFound] = await db.query(
            'SELECT id, nombres, apellidos, cel_apoderado FROM alumnos WHERE dni_ce = ? AND estado = 1',
            [dni]
        );
        if (alumnoFound.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Alumno no encontrado en el sistema"
            });
        }

        const alumno = alumnoFound[0];
        const alumno_id = alumno.id;

        const [existe] = await db.query(
            'SELECT id FROM asistencias WHERE alumno_id = ? AND fecha = CURDATE() AND estado = 1',
            [alumno_id]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: `El alumno ${alumno.nombres} ya registró asistencia hoy.`
            });
        }

        // --- INICIO DE MODIFICACIÓN DE HORARIOS ---
        const ahora = new Date();
        const horaLimite = new Date();

        // Verificamos si es turno mañana (antes de las 12:00 PM) o tarde
        if (ahora.getHours() < 12) {
            // Horario Mañana: Límite 7:02 AM
            horaLimite.setHours(7, 2, 0);
        } else {
            // Horario Tarde: Límite 4:10 PM (16:10)
            horaLimite.setHours(16, 10, 0);
        }

        const situacionFinal = (ahora > horaLimite) ? 'TARDE' : 'PUNTUAL';
        // --- FIN DE MODIFICACIÓN DE HORARIOS ---

        const horaRegistro = ahora.toLocaleTimeString('es-PE', { hour12: false });
        const fechaRegistro = ahora.toLocaleDateString('es-PE');

        const [resultado] = await db.query(
            'INSERT INTO asistencias (alumno_id, fecha, hora_entrada, situacion) VALUES (?, CURDATE(), CURTIME(), ?)',
            [alumno_id, situacionFinal]
        );

        if (alumno.cel_apoderado) {
            const icono = situacionFinal === 'PUNTUAL' ? '✅' : '⚠️';
            const textoMensaje = `Hola, informamos que el alumno *${alumno.nombres} ${alumno.apellidos}* ha asistido a la academia.\n\n📅 Fecha: ${fechaRegistro}\n⏰ Hora: ${horaRegistro}\n${icono} Estado: *${situacionFinal}*`;

            // Enviamos sin await para no demorar la respuesta al frontend
            enviarMensaje(alumno.cel_apoderado, textoMensaje);
        }

        res.status(201).json({
            success: true,
            mensaje: `Asistencia Registrada: ${situacionFinal}`,
            data: {
                id: resultado.insertId,
                alumno: `${alumno.nombres} ${alumno.apellidos}`,
                situacion: situacionFinal,
                hora: horaRegistro
            }
        });

    } catch (error) {
        console.error('Error al registrar asistencia:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error interno al procesar QR',
            error: error.message
        });
    }
};

const obtenerAsistencias = async (req, res) => {
    try {
        const query = `
            SELECT 
                asi.id, 
                asi.fecha, 
                asi.hora_entrada, 
                asi.situacion,
                alu.nombres AS alumno_nombres, 
                alu.apellidos AS alumno_apellidos,
                alu.dni
            FROM asistencias asi
            INNER JOIN alumnos alu ON asi.alumno_id = alu.id
            WHERE asi.estado = 1
            ORDER BY asi.fecha DESC, asi.hora_entrada DESC
        `;

        const [asistencias] = await db.query(query);

        res.json({
            success: true,
            count: asistencias.length,
            data: asistencias
        });

    } catch (error) {
        console.error('Error al obtener asistencias:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener el reporte de asistencias',
            error: error.message
        });
    }
};

const obtenerAsistenciasHoy = async (req, res) => {
    try {
        const query = `
            SELECT 
                asi.id, 
                asi.hora_entrada, 
                asi.situacion,
                alu.nombres, 
                alu.apellidos
            FROM asistencias asi
            INNER JOIN alumnos alu ON asi.alumno_id = alu.id
            WHERE asi.estado = 1 AND asi.fecha = CURDATE()
            ORDER BY asi.hora_entrada DESC
        `;

        const [asistencias] = await db.query(query);

        res.json({
            success: true,
            fecha: new Date(),
            count: asistencias.length,
            data: asistencias
        });

    } catch (error) {
        console.error('Error al obtener asistencias de hoy:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener asistencias del día',
            error: error.message
        });
    }
};

const eliminarAsistencia = async (req, res) => {
    try {
        const { id } = req.params;

        const [existe] = await db.query('SELECT id FROM asistencias WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ success: false, mensaje: "Registro no encontrado" });
        }

        await db.query('UPDATE asistencias SET estado = 0 WHERE id = ?', [id]);

        res.json({
            success: true,
            mensaje: "Registro de asistencia eliminado"
        });

    } catch (error) {
        console.error('Error al eliminar asistencia:', error);
        res.status(500).json({ success: false, mensaje: 'Error al eliminar', error: error.message });
    }
};

// --- NUEVA FUNCIÓN PARA REENVIAR NOTIFICACIONES PENDIENTES ---
const reenviarNotificacionesHoy = async (req, res) => {
    try {
        console.log('🔄 Iniciando reenvío masivo de notificaciones de HOY...');

        // 1. Obtenemos todas las asistencias válidas de hoy
        const [asistenciasHoy] = await db.query(`
            SELECT 
                a.id, 
                a.hora_entrada, 
                a.situacion, 
                al.nombres, 
                al.apellidos, 
                al.cel_apoderado 
            FROM asistencias a
            INNER JOIN alumnos al ON a.alumno_id = al.id
            WHERE a.fecha = CURDATE() AND a.estado = 1
        `);

        if (asistenciasHoy.length === 0) {
            return res.json({ success: true, mensaje: 'No hay asistencias registradas hoy para reenviar.' });
        }

        let enviados = 0;
        let errores = 0;
        const fechaLegible = new Date().toLocaleDateString('es-PE');

        // 2. Iteramos y enviamos con pausa de seguridad
        for (const registro of asistenciasHoy) {

            if (registro.cel_apoderado) {
                const icono = registro.situacion === 'PUNTUAL' ? '✅' : '⚠️';
                const horaLegible = registro.hora_entrada; // Usamos la hora que ya está en BD

                const textoMensaje = `Hola, informamos que el alumno *${registro.nombres} ${registro.apellidos}* ha asistido a la academia.\n\n📅 Fecha: ${fechaLegible}\n⏰ Hora: ${horaLegible}\n${icono} Estado: *${registro.situacion}*`;

                console.log(`📤 Reenviando a: ${registro.nombres} (${registro.cel_apoderado})...`);

                // Enviar mensaje
                const exito = await enviarMensaje(registro.cel_apoderado, textoMensaje);

                if (exito) enviados++;
                else errores++;

                // ⚠️ PAUSA DE 2 SEGUNDOS para evitar bloqueo por spam
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        res.json({
            success: true,
            mensaje: `Proceso finalizado. Se intentó notificar a ${asistenciasHoy.length} alumnos.`,
            detalles: {
                total_registros_hoy: asistenciasHoy.length,
                mensajes_enviados: enviados,
                mensajes_fallidos: errores
            }
        });

    } catch (error) {
        console.error('Error en reenvío masivo:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al procesar el reenvío',
            error: error.message
        });
    }
};

module.exports = {
    registrarAsistencia,
    obtenerAsistencias,
    obtenerAsistenciasHoy,
    eliminarAsistencia,
    reenviarNotificacionesHoy
};