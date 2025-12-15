const db = require('../config/database');

const crearTipoEvaluacion = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'El nombre del tipo de evaluación es obligatorio',
            });
        }

        const [existe] = await db.query(
            'SELECT id FROM tipos_evaluacion WHERE nombre = ? AND estado = 1',
            [nombre]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe un tipo de evaluación con ese nombre"
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO tipos_evaluacion (nombre) VALUES (?)',
            [nombre]
        );

        res.status(201).json({
            success: true,
            mensaje: "Tipo de evaluación creado exitosamente",
            data: {
                id: resultado.insertId,
                nombre
            }
        });

    } catch (error) {
        console.error('Error al crear tipo de evaluación');
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear el registro',
            error: error.message
        });
    }
};

const obtenerTiposEvaluacion = async (req, res) => {
    try {
        const [tipos] = await db.query('SELECT * FROM tipos_evaluacion WHERE estado = 1 ORDER BY nombre ASC');

        res.json({
            success: true,
            count: tipos.length,
            data: tipos
        });
    } catch (error) {
        console.error('Error al obtener tipos de evaluación:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener la lista',
            error: error.message
        });
    }
};

const modificarTipoEvaluacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'El nombre es obligatorio'
            });
        }

        const [existente] = await db.query('SELECT id FROM tipos_evaluacion WHERE id = ?', [id]);

        if (existente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Tipo de evaluación no encontrado"
            });
        }

        const [duplicado] = await db.query(
            'SELECT id FROM tipos_evaluacion WHERE nombre = ? AND id != ? AND estado = 1',
            [nombre, id]
        );

        if (duplicado.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe otro tipo de evaluación con ese nombre"
            });
        }

        await db.query('UPDATE tipos_evaluacion SET nombre = ? WHERE id = ?', [nombre, id]);

        res.json({
            success: true,
            mensaje: "Tipo de evaluación modificado exitosamente"
        });

    } catch (error) {
        console.error('Error al modificar:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al modificar el registro',
            error: error.message
        });
    }
};

const eliminarTipoEvaluacion = async (req, res) => {
    try {
        const { id } = req.params;

        const [existente] = await db.query('SELECT id FROM tipos_evaluacion WHERE id = ?', [id]);

        if (existente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Registro no encontrado"
            });
        }


        await db.query('UPDATE tipos_evaluacion SET estado = 0 WHERE id = ?', [id]);

        res.json({
            success: true,
            mensaje: "Tipo de evaluación eliminado correctamente"
        });

    } catch (error) {
        console.error('Error al eliminar:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar el registro',
            error: error.message
        });
    }
};

module.exports = {
    crearTipoEvaluacion,
    obtenerTiposEvaluacion,
    modificarTipoEvaluacion,
    eliminarTipoEvaluacion
};