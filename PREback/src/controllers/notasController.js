const db = require('../config/database');

const registrarNota = async (req, res) => {
    try {
        const { alumno_id, asignacion_curso_id, tipo_evaluacion_id, valor } = req.body;

        if (!alumno_id || !asignacion_curso_id || !tipo_evaluacion_id || valor === undefined) {
            return res.status(400).json({
                success: false,
                mensaje: 'Todos los campos son obligatorios',
            });
        }

        if (valor < 0 || valor > 20) {
            return res.status(400).json({
                success: false,
                mensaje: 'La nota debe estar entre 0 y 20',
            });
        }

        const [existe] = await db.query(
            'SELECT id FROM notas WHERE alumno_id = ? AND asignacion_curso_id = ? AND tipo_evaluacion_id = ? AND estado = 1',
            [alumno_id, asignacion_curso_id, tipo_evaluacion_id]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Este alumno ya tiene una calificación registrada para este tipo de evaluación en este curso"
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO notas (alumno_id, asignacion_curso_id, tipo_evaluacion_id, valor, fecha) VALUES (?, ?, ?, ?, CURDATE())',
            [alumno_id, asignacion_curso_id, tipo_evaluacion_id, valor]
        );

        res.status(201).json({
            success: true,
            mensaje: "Nota registrada exitosamente",
            data: {
                id: resultado.insertId,
                valor,
                fecha: new Date()
            }
        });

    } catch (error) {
        console.error('Error al registrar nota:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al registrar la calificación',
            error: error.message
        });
    }
};

const obtenerNotasPorCurso = async (req, res) => {
    try {
        const { asignacion_curso_id } = req.params;

        const query = `
            SELECT 
                n.id,
                a.nombres,
                a.apellidos,
                te.nombre AS tipo_evaluacion,
                n.valor,
                n.fecha
            FROM notas n
            INNER JOIN alumnos a ON n.alumno_id = a.id
            INNER JOIN tipos_evaluacion te ON n.tipo_evaluacion_id = te.id
            WHERE n.asignacion_curso_id = ? AND n.estado = 1
            ORDER BY a.apellidos ASC, te.nombre ASC
        `;

        const [notas] = await db.query(query, [asignacion_curso_id]);

        res.json({
            success: true,
            asignacion_curso_id,
            data: notas
        });

    } catch (error) {
        console.error('Error al obtener notas del curso:');
        res.status(500).json({ success: false, mensaje: 'Error al listar notas', error: error.message });
    }
};

const obtenerNotasPorAlumno = async (req, res) => {
    try {
        const { alumno_id } = req.params;

        const query = `
            SELECT 
                c.nombre AS curso,
                n.valor,
                te.nombre AS evaluacion,
                p.nombre AS periodo
            FROM notas n
            INNER JOIN asignaciones_cursos ac ON n.asignacion_curso_id = ac.id
            INNER JOIN nivel_curso nc ON ac.nivel_curso_id = nc.id
            INNER JOIN cursos c ON nc.curso_id = c.id
            INNER JOIN tipos_evaluacion te ON n.tipo_evaluacion_id = te.id
            INNER JOIN periodos_academicos p ON ac.periodo_id = p.id
            WHERE n.alumno_id = ? AND n.estado = 1
            ORDER BY p.id DESC, c.nombre ASC
        `;

        const [libreta] = await db.query(query, [alumno_id]);

        res.json({
            success: true,
            alumno_id,
            data: libreta
        });

    } catch (error) {
        console.error('Error al obtener libreta:');
        res.status(500).json({ success: false, mensaje: 'Error al obtener notas', error: error.message });
    }
};

const modificarNota = async (req, res) => {
    try {
        const { id } = req.params;
        const { valor } = req.body;

        if (valor === undefined) {
            return res.status(400).json({ success: false, mensaje: 'El valor de la nota es obligatorio' });
        }

        if (valor < 0 || valor > 20) {
            return res.status(400).json({ success: false, mensaje: 'La nota debe estar entre 0 y 20' });
        }

        const [existe] = await db.query('SELECT id FROM notas WHERE id = ?', [id]);
        if (existe.length === 0) {
            return res.status(404).json({ success: false, mensaje: "Nota no encontrada" });
        }

        await db.query('UPDATE notas SET valor = ? WHERE id = ?', [valor, id]);

        res.json({ success: true, mensaje: "Nota corregida exitosamente" });

    } catch (error) {
        console.error('Error al modificar nota:');
        res.status(500).json({ success: false, mensaje: 'Error al modificar', error: error.message });
    }
};

const eliminarNota = async (req, res) => {
    try {
        const { id } = req.params;
        const [existe] = await db.query('SELECT id FROM notas WHERE id = ?', [id]);

        if (existe.length === 0) {
            return res.status(404).json({ success: false, mensaje: "Nota no encontrada" });
        }

        await db.query('UPDATE notas SET estado = 0 WHERE id = ?', [id]);

        res.json({ success: true, mensaje: "Nota eliminada exitosamente" });

    } catch (error) {
        console.error('Error al eliminar nota:');
        res.status(500).json({ success: false, mensaje: 'Error al eliminar', error: error.message });
    }
};

module.exports = {
    registrarNota,
    obtenerNotasPorCurso,
    obtenerNotasPorAlumno,
    modificarNota,
    eliminarNota
};