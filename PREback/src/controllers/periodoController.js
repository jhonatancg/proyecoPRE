const db = require('../config/database');

const crearPeriodo = async (req, res) => {
    try {
        const { nombre, anio, fecha_inicio, fecha_fin, situacion } = req.body;

        if (!nombre?.trim() || !anio || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                mensaje: 'Todos los campos son obligatorios',
            })
        }

        if (new Date(fecha_inicio) > new Date(fecha_fin)) {
            return res.status(400).json({
                success: false,
                mensaje: 'La fecha de inicio no puede ser mayor que la fecha de fin',
            });
        }

        const [existe] = await db.query(
            'SELECT id FROM periodos_academicos WHERE nombre = ? AND anio = ? AND estado = 1',
            [nombre, anio]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe un periodo académico con ese nombre y año"
            });
        }

        const situacionFinal = (situacion && situacion.trim() !== "") ? situacion : null;

        const [resultado] = await db.query(
            `INSERT INTO periodos_academicos(nombre, anio, fecha_inicio, fecha_fin, situacion) VALUES (?, ?, ?, ?, ?)`,
            [nombre, anio, fecha_inicio, fecha_fin, situacionFinal]
        );

        res.status(201).json({
            success: true,
            mensaje: 'Periodo académico creado exitosamente',
            data: {
                id: resultado.insertId,
                nombre,
                anio,
                fecha_inicio,
                fecha_fin,
                situacion: situacionFinal
            },
        });
    } catch (error) {
        console.error('Error al crear el periodo académico');
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear el periodo académico',
            error: error.message,
        })
    }
};

const obtenerPeriodos = async (req, res) => {
    try {
        const [periodos_academicos] = await db.query('SELECT * FROM periodos_academicos WHERE estado = 1 ORDER BY id DESC');
        res.json({
            success: true,
            count: periodos_academicos.length,
            data: periodos_academicos
        })
    } catch (error) {
        console.error('Error al obtener periodos');
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener periodos',
            error: error.message
        })
    }
};

const modificarPeriodo = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, anio, fecha_inicio, fecha_fin, situacion } = req.body;

        if (!nombre?.trim() || !anio || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                mensaje: 'Todos los campos son obligatorios',
            })
        }

        if (new Date(fecha_inicio) > new Date(fecha_fin)) {
            return res.status(400).json({
                success: false,
                mensaje: 'La fecha de inicio no puede ser mayor que la fecha de fin',
            });
        }

        const [periodoExistente] = await db.query('SELECT id FROM periodos_academicos WHERE id=?', [id]);

        if (periodoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Periodo no encontrado"
            });
        }

        const [duplicado] = await db.query(
            `SELECT id FROM periodos_academicos WHERE nombre = ? AND anio = ? AND id != ? AND estado = 1`,
            [nombre, anio, id]
        );

        if (duplicado.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe otro periodo académico con ese nombre y año"
            });
        }

        const situacionFinal = (situacion && situacion.trim() !== "") ? situacion : null;

        await db.query(
            `UPDATE periodos_academicos SET nombre = ?, anio = ?, fecha_inicio = ?, fecha_fin = ?, situacion = ? WHERE id = ?`,
            [nombre, anio, fecha_inicio, fecha_fin, situacionFinal, id]
        );

        res.status(200).json({
            success: true,
            mensaje: 'Periodo académico modificado exitosamente',
            data: {
                id,
                nombre,
                anio,
                fecha_inicio,
                fecha_fin
            }
        })
    } catch (error) {
        console.error('Error al modificar el periodo académico');
        res.status(500).json({
            success: false,
            mensaje: 'Error al modificar el periodo académico',
            error: error.message
        })
    }
};

const eliminarPeriodo = async (req, res) => {
    try {
        const { id } = req.params;

        const [periodoExistente] = await db.query('SELECT id FROM periodos_academicos WHERE id = ?', [id]);

        if (periodoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Periodo académico no encontrado"
            });
        }

        await db.query(
            'UPDATE periodos_academicos SET estado = 0 WHERE id = ?',
            [id]
        );

        res.status(200).json({
            success: true,
            mensaje: "Periodo académico desactivado exitosamente (Borrado lógico)",

        })
    } catch (error) {
        console.error('Error al eliminar el periodo académico');
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar el periodo académico',
            error: error.message
        })
    }
};

module.exports = {
    crearPeriodo,
    obtenerPeriodos,
    modificarPeriodo,
    eliminarPeriodo
}