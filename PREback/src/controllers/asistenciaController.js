const db = require('../config/database');

const registrarAsistencia = async (req, res) => {
    try {
        const { alumno_id, situacion } = req.body;

        if (!alumno_id) {
            return res.status(400).json({
                success: false,
                mensaje: 'El ID del alumno es obligatorio (Lectura QR fallida)',
            });
        }

        const [existe] = await db.query(
            'SELECT id FROM asistencia WHERE alumno_id = ? AND fecha = CURDATE() AND estado = 1',
            [alumno_id]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "El alumno ya registró su asistencia el día de hoy"
            });
        }

        const situacionFinal = situacion || 'Presente';

        const [resultado] = await db.query(
            'INSERT INTO asistencia (alumno_id, fecha, hora_entrada, situacion) VALUES (?, CURDATE(), CURTIME(), ?)',
            [alumno_id, situacionFinal]
        );

        res.status(201).json({
            success: true,
            mensaje: "Asistencia registrada correctamente",
            data: {
                id: resultado.insertId,
                alumno_id,
                situacion: situacionFinal,
                fecha: new Date(),
                hora: new Date().toLocaleTimeString()
            }
        });

    } catch (error) {
        console.error('Error al registrar asistencia:');
        res.status(500).json({
            success: false,
            mensaje: 'Error en el servidor al registrar asistencia',
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
            FROM asistencia asi
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
            FROM asistencia asi
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

        const [existe] = await db.query('SELECT id FROM asistencia WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ success: false, mensaje: "Registro no encontrado" });
        }

        await db.query('UPDATE asistencia SET estado = 0 WHERE id = ?', [id]);

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