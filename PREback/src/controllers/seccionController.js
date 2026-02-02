const db = require('../config/database');

const crearSeccion = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'El nombre es obligatorio',
            })
        }

        const [existe] = await db.query(
            'SELECT id FROM secciones WHERE nombre = ? AND estado = 1',
            [nombre]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe una seccion con ese nombre"
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO secciones (nombre) VALUES (?)',
            [nombre]
        );

        res.status(201).json({
            success: true,
            mensaje: "Seccion creada exitosamente",
            data: {
                id: resultado.insertId,
                nombre
            }
        })
    } catch (error) {
        console.error('Error al crear la seccion');
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear la seccion',
            error: error.message
        })
    }
};

const obtenerSeccion = async (req, res) => {
    try {
        // Hacemos JOIN para obtener el 'nivel_id'
        const query = `
            SELECT 
                s.id, 
                s.nombre, 
                s.nivel_id,   -- ESTE CAMPO ES OBLIGATORIO PARA EL FILTRO
                n.nombre AS nombre_nivel
            FROM secciones s
            INNER JOIN niveles n ON s.nivel_id = n.id
            WHERE s.estado = 1 
            ORDER BY s.id DESC
        `;

        const [secciones] = await db.query(query);

        res.json({
            success: true,
            count: secciones.length,
            data: secciones
        });
    } catch (error) {
        console.error('Error al obtener secciones:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener secciones',
            error: error.message
        });
    }
};

const modificarSeccion = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'El nombre es obligatorio para modificar'
            });
        }

        const [seccionExistente] = await db.query('SELECT id FROM secciones WHERE id=?', [id]);

        if (seccionExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Seccion no encontrada"
            });
        }

        const [duplicado] = await db.query(
            'SELECT id FROM secciones WHERE nombre = ? AND id != ? AND estado = 1',
            [nombre, id]
        );

        if (duplicado.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe otra seccion con ese nombre"
            });
        }

        await db.query(
            'UPDATE secciones set nombre=? WHERE id=?',
            [nombre, id]
        );

        res.status(200).json({
            success: true,
            mensaje: "Seccion modificada exitosamente",
            data: {
                id,
                nombre
            }
        })
    } catch (error) {
        console.error('Error al modificar la seccion');
        res.status(500).json({
            success: false,
            mensaje: 'Error al modificar la seccion',
            error: error.message
        })
    }
};

const eliminarSeccion = async (req, res) => {
    try {
        const { id } = req.params;

        const [seccionExistente] = await db.query('SELECT id FROM secciones WHERE id=?', [id]);

        if (seccionExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Seccion no encontrada"
            });
        }

        await db.query(
            'UPDATE secciones SET estado = 0 WHERE id = ?',
            [id]
        );

        res.status(200).json({
            success: true,
            mensaje: "Seccion desactivada exitosamente (Borrado Lógico)",

        })
    } catch (error) {
        console.error('Error al eliminar la seccion');
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar la seccion',
            error: error.message
        })
    }
};

module.exports = {
    crearSeccion,
    obtenerSeccion,
    modificarSeccion,
    eliminarSeccion
}