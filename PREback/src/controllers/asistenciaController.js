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

        // --- CAMBIO AQUÍ: Definimos la hora actual ANTES de validar duplicados ---
        const ahora = new Date();
        const esTurnoManana = ahora.getHours() < 12;

        let queryDuplicado = '';

        // Validamos duplicado SEGÚN EL TURNO ACTUAL
        if (esTurnoManana) {
            // Si es de mañana, verificamos si ya tiene un registro antes de las 12:00
            queryDuplicado = "SELECT id FROM asistencias WHERE alumno_id = ? AND fecha = CURDATE() AND estado = 1 AND hora_entrada < '12:00:00'";
        } else {
            // Si es de tarde, verificamos si ya tiene un registro después de las 12:00
            queryDuplicado = "SELECT id FROM asistencias WHERE alumno_id = ? AND fecha = CURDATE() AND estado = 1 AND hora_entrada >= '12:00:00'";
        }

        const [existe] = await db.query(queryDuplicado, [alumno_id]);

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: `El alumno ${alumno.nombres} ya registró asistencia en el turno ${esTurnoManana ? 'MAÑANA' : 'TARDE'}.`
            });
        }
        // --- FIN CAMBIO VALIDACIÓN ---


        // --- LÓGICA DE HORARIOS Y TARDANZAS ---
        const horaLimite = new Date();

        // Verificamos si es turno mañana o tarde para definir el límite
        if (esTurnoManana) {
            // Horario Mañana: Límite 7:02 AM
            horaLimite.setHours(7, 2, 0);
        } else {
            // Horario Tarde: Límite 4:10 PM (16:10)
            horaLimite.setHours(16, 10, 0);
        }

        const situacionFinal = (ahora > horaLimite) ? 'TARDE' : 'PUNTUAL';

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

const obtenerAsistenciaPorAula = async (req, res) => {
    try {
        const { nivel_id, seccion_id, fecha } = req.params;

        console.log('--- SOLICITUD DE REPORTE ---');
        console.log(`1. Parámetros recibidos: Nivel=${nivel_id}, Sección=${seccion_id}, Fecha=${fecha}`);

        if (!nivel_id || !seccion_id || !fecha) {
            return res.status(400).json({ success: false, mensaje: "Faltan parámetros" });
        }

        // Esta consulta busca ALUMNOS MATRICULADOS y cruza con ASISTENCIA
        const query = `
            SELECT 
                alu.id AS alumno_id,
                alu.nombres,
                alu.apellidos,
                alu.dni_ce,
                COALESCE(asi.hora_entrada, '-') AS hora_entrada, 
                COALESCE(asi.situacion, 'FALTA') AS situacion,
                sec.nombre AS nombre_seccion,
                niv.nombre AS nombre_nivel
            FROM matriculas mat
            INNER JOIN alumnos alu ON mat.alumno_id = alu.id
            INNER JOIN secciones sec ON mat.seccion_id = sec.id
            INNER JOIN niveles niv ON sec.nivel_id = niv.id
            LEFT JOIN asistencias asi ON alu.id = asi.alumno_id AND asi.fecha = ? AND asi.estado = 1
            WHERE 
                sec.nivel_id = ? 
                AND mat.seccion_id = ? 
                AND mat.estado = 1
            ORDER BY alu.apellidos ASC
        `;

        const [asistencias] = await db.query(query, [fecha, nivel_id, seccion_id]);

        console.log(`2. Alumnos encontrados en esa aula: ${asistencias.length}`);

        if (asistencias.length === 0) {
            console.log('⚠️ ADVERTENCIA: No se encontraron alumnos.');
            console.log('   - Verifica que existan filas en la tabla "matriculas" para la seccion_id:', seccion_id);
            console.log('   - Verifica que esas matrículas tengan estado = 1');
        } else {
            console.log('✅ Datos enviados al frontend correctamente.');
        }

        res.json({
            success: true,
            count: asistencias.length,
            data: asistencias
        });

    } catch (error) {
        console.error('❌ Error CRÍTICO en obtenerAsistenciaPorAula:', error);
        res.status(500).json({ success: false, mensaje: 'Error del servidor', error: error.message });
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

                const textoMensaje = `Hola, por problemas de red, recién se está enviando la notificación de asistencia. El alumno *${registro.nombres} ${registro.apellidos}* asistió con normalidad esta mañana.\n\n📅 Fecha: ${fechaLegible}\n⏰ Hora: ${horaLegible}\n${icono} Estado: *${registro.situacion}*`;

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
    obtenerAsistenciaPorAula,
    eliminarAsistencia,
    reenviarNotificacionesHoy
};