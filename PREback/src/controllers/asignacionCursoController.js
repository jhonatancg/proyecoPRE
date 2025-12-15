const db = require('../config/database');

const crearAsignacion = async (req, res) => {
    try {
        const { nivel_curso_id, seccion_id, docente_id, periodo_id } = req.body;

        if (!nivel_curso_id || !seccion_id || !docente_id || !periodo_id) {
            return res.status(400).json({
                success: false,
                mensaje: 'Todos los campos son obligatorios (curso, sección, docente, periodo)'
            });
        }

        const [existe] = await db.query(
            'SELECT id FROM asignaciones_cursos WHERE nivel_curso_id = ? AND seccion_id = ? AND periodo_id = ? AND estado = 1',
            [nivel_curso_id, seccion_id, periodo_id]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Este curso ya está asignado a esa sección en este periodo."
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO asignaciones_cursos (nivel_curso_id, seccion_id, docente_id, periodo_id) VALUES (?, ?, ?, ?)',
            [nivel_curso_id, seccion_id, docente_id, periodo_id]
        );

        res.status(201).json({
            success: true,
            mensaje: "Curso asignado al docente correctamente",
            data: {
                id: resultado.insertId,
                nivel_curso_id,
                seccion_id,
                docente_id
            }
        });

    } catch (error) {
        console.error('Error al asignar curso:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear la asignación',
            error: error.message
        });
    }
};


const obtenerAsignaciones = async (req, res) => {
    try {
        const query = `
            SELECT 
                ac.id,
                u.nombre_completo AS docente,
                c.nombre AS curso,
                n.nombre AS nivel,
                s.nombre AS seccion,
                p.nombre AS periodo,
                p.anio
            FROM asignaciones_cursos ac
            INNER JOIN usuarios u ON ac.docente_id = u.id
            INNER JOIN secciones s ON ac.seccion_id = s.id
            INNER JOIN periodos_academicos p ON ac.periodo_id = p.id
            INNER JOIN nivel_curso nc ON ac.nivel_curso_id = nc.id
            INNER JOIN cursos c ON nc.curso_id = c.id
            INNER JOIN niveles n ON nc.nivel_id = n.id
            WHERE ac.estado = 1
            ORDER BY s.nombre ASC, c.nombre ASC
        `;

        const [asignaciones] = await db.query(query);

        res.json({
            success: true,
            count: asignaciones.length,
            data: asignaciones
        });

    } catch (error) {
        console.error('Error al obtener asignaciones:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al listar las asignaciones',
            error: error.message
        });
    }
};

const obtenerCursosPorDocente = async (req, res) => {
    try {
        const { docente_id } = req.params;

        const query = `
            SELECT 
                ac.id AS asignacion_id,
                c.nombre AS curso,
                n.nombre AS nivel,
                s.nombre AS seccion,
                p.nombre AS periodo
            FROM asignaciones_cursos ac
            INNER JOIN secciones s ON ac.seccion_id = s.id
            INNER JOIN periodos_academicos p ON ac.periodo_id = p.id
            INNER JOIN nivel_curso nc ON ac.nivel_curso_id = nc.id
            INNER JOIN cursos c ON nc.curso_id = c.id
            INNER JOIN niveles n ON nc.nivel_id = n.id
            WHERE ac.docente_id = ? AND ac.estado = 1
            ORDER BY p.id DESC, s.nombre ASC
        `;

        const [cursos] = await db.query(query, [docente_id]);

        res.json({
            success: true,
            docente_id,
            count: cursos.length,
            data: cursos
        });

    } catch (error) {
        console.error('Error al obtener cursos del docente:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener los cursos del docente',
            error: error.message
        });
    }
};

const modificarAsignacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { docente_id } = req.body;

        if (!docente_id) {
            return res.status(400).json({ success: false, mensaje: 'El ID del docente es obligatorio' });
        }

        const [existe] = await db.query('SELECT id FROM asignaciones_cursos WHERE id = ?', [id]);

        if (existe.length === 0) {
            return res.status(404).json({ success: false, mensaje: "Asignación no encontrada" });
        }

        await db.query(
            'UPDATE asignaciones_cursos SET docente_id = ? WHERE id = ?',
            [docente_id, id]
        );

        res.json({ success: true, mensaje: "Docente reasignado correctamente" });

    } catch (error) {
        console.error('Error al modificar asignación:', error);
        res.status(500).json({ success: false, mensaje: 'Error al modificar', error: error.message });
    }
};

const eliminarAsignacion = async (req, res) => {
    try {
        const { id } = req.params;
        const [existe] = await db.query('SELECT id FROM asignaciones_cursos WHERE id = ?', [id]);

        if (existe.length === 0) {
            return res.status(404).json({ success: false, mensaje: "Asignación no encontrada" });
        }

        await db.query('UPDATE asignaciones_cursos SET estado = 0 WHERE id = ?', [id]);

        res.json({ success: true, mensaje: "Asignación eliminada correctamente" });

    } catch (error) {
        console.error('Error al eliminar asignación:', error);
        res.status(500).json({ success: false, mensaje: 'Error al eliminar', error: error.message });
    }
};

module.exports = {
    crearAsignacion,
    obtenerAsignaciones,
    obtenerCursosPorDocente,
    modificarAsignacion,
    eliminarAsignacion
};