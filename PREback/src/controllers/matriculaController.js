const db = require('../config/database');

const crearMatricula = async (req, res) => {
    try {
        const { alumno_id, seccion_id, periodo_id, situacion } = req.body;

        if (!alumno_id || !seccion_id || !periodo_id || !situacion) {
            return res.status(400).json({
                success: false,
                mensaje: 'Faltan datos obligatorios (alumno, sección, periodo o situación)',
            });
        }

        const [existe] = await db.query(
            'SELECT id FROM matriculas WHERE alumno_id = ? AND periodo_id = ? AND estado = 1',
            [alumno_id, periodo_id]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "El alumno ya está matriculado en este periodo académico"
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO matriculas (alumno_id, seccion_id, periodo_id, fecha_matricula, situacion) VALUES (?, ?, ?, NOW(), ?)',
            [alumno_id, seccion_id, periodo_id, situacion]
        );

        res.status(201).json({
            success: true,
            mensaje: "Matrícula registrada exitosamente",
            data: {
                id: resultado.insertId,
                alumno_id,
                seccion_id,
                periodo_id,
                situacion
            }
        });

    } catch (error) {
        console.error('Error al crear la matrícula:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al registrar la matrícula',
            error: error.message
        });
    }
};

const obtenerMatriculas = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.id, 
                m.fecha_matricula, 
                m.situacion,
                a.nombres AS alumno_nombres, 
                a.apellidos AS alumno_apellidos,
                s.nombre AS seccion,
                p.nombre AS periodo,
                p.anio AS anio_academico
            FROM matriculas m
            INNER JOIN alumnos a ON m.alumno_id = a.id
            INNER JOIN secciones s ON m.seccion_id = s.id
            INNER JOIN periodos_academicos p ON m.periodo_id = p.id
            WHERE m.estado = 1
            ORDER BY m.id DESC
        `;

        const [matriculas] = await db.query(query);

        res.json({
            success: true,
            count: matriculas.length,
            data: matriculas
        });

    } catch (error) {
        console.error('Error al obtener matrículas');
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener las matrículas',
            error: error.message
        });
    }
};

const modificarMatricula = async (req, res) => {
    try {
        const { id } = req.params;
        const { seccion_id, situacion } = req.body;

        if (!seccion_id || !situacion) {
            return res.status(400).json({
                success: false,
                mensaje: 'Sección y situación son obligatorios para modificar'
            });
        }

        const [matriculaExistente] = await db.query('SELECT id FROM matriculas WHERE id = ?', [id]);

        if (matriculaExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Matrícula no encontrada"
            });
        }

        await db.query(
            'UPDATE matriculas SET seccion_id = ?, situacion = ? WHERE id = ?',
            [seccion_id, situacion, id]
        );

        res.status(200).json({
            success: true,
            mensaje: "Matrícula modificada exitosamente"
        });

    } catch (error) {
        console.error('Error al modificar la matrícula:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al modificar la matrícula',
            error: error.message
        });
    }
};

const eliminarMatricula = async (req, res) => {
    try {
        const { id } = req.params;

        const [matriculaExistente] = await db.query('SELECT id FROM matriculas WHERE id = ?', [id]);

        if (matriculaExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Matrícula no encontrada"
            });
        }

        await db.query('UPDATE matriculas SET estado = 0 WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            mensaje: "Matrícula eliminada exitosamente"
        });

    } catch (error) {
        console.error('Error al eliminar matrícula:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar la matrícula',
            error: error.message
        });
    }
};

module.exports = {
    crearMatricula,
    obtenerMatriculas,
    modificarMatricula,
    eliminarMatricula
};