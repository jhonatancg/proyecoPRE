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

        const ahora = new Date();
        const horaLimite = new Date();
        horaLimite.setHours(19, 15, 0);

        const situacionFinal = (ahora > horaLimite) ? 'TARDE' : 'PUNTUAL';

        const horaRegistro = ahora.toLocaleTimeString('es-PE', { hour12: false });
        const fechaRegistro = ahora.toLocaleDateString('es-PE');

        const [resultado] = await db.query(
            'INSERT INTO asistencias (alumno_id, fecha, hora_entrada, situacion) VALUES (?, CURDATE(), CURTIME(), ?)',
            [alumno_id, situacionFinal]
        );

        if (alumno.cel_apoderado) {
            const icono = situacionFinal === 'PUNTUAL' ? '✅' : '⚠️';
            const textoMensaje = `Hola, informamos que el alumno *${alumno.nombres} ${alumno.apellidos}* ha ingresado al colegio.\n\n📅 Fecha: ${fechaRegistro}\n⏰ Hora: ${horaRegistro}\n${icono} Estado: *${situacionFinal}*`;

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

module.exports = {
    registrarAsistencia,
    obtenerAsistencias,
    obtenerAsistenciasHoy,
    eliminarAsistencia
};