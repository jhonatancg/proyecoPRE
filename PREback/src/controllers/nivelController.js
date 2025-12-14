const db = require('../config/database');

const crearNivel = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'El nombre es obligatorio',
            })
        }

        const [existe] = await db.query(
            'SELECT id FROM niveles WHERE nombre = ? AND estado = 1',
            [nombre]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe un nivel con ese nombre"
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO niveles(nombre) VALUES (?)',
            [nombre]
        );

        res.status(201).json({
            success: true,
            mensaje: "Nivel creado exitosamente",
            data: {
                id: resultado.insertId,
                nombre
            }
        })
    } catch (error) {
        console.error('Error al crear el nivel');
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear el nivel',
            error: error.message
        })
    }
};

const obtenerNiveles = async (req, res) => {
    try {
        const [niveles] = await db.query('SELECT * FROM niveles WHERE estado = 1 ORDER BY id DESC');
        res.json({
            success: true,
            count: niveles.length,
            data: niveles
        })
    } catch (error) {
        console.error('Error al obtener niveles');
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener niveles',
            error: error.message
        })
    }
};

const modificarNivel = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'El nombre es obligatorio para modificar'
            });
        }

        const [niveExistente] = await db.query('SELECT id FROM niveles WHERE id=?', [id]);

        if (niveExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Nivel no encontrado"
            });
        }

        const [duplicado] = await db.query(
            'SELECT id FROM niveles WHERE nombre = ? AND id != ? AND estado = 1',
            [nombre, id]
        );

        if (duplicado.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe otro nivel con ese nombre"
            });
        }

        await db.query(
            'UPDATE niveles set nombre=? WHERE id=?',
            [nombre, id]
        );

        res.status(200).json({
            success: true,
            mensaje: "Nivel modificado exitosamente",
            data: {
                id,
                nombre
            }
        })
    } catch (error) {
        console.error('Error al modificar el nivel');
        res.status(500).json({
            success: false,
            mensaje: 'Error al modificar el nivel',
            error: error.message
        })
    }
};

const eliminarNivel = async (req, res) => {
    try {
        const { id } = req.params;

        const [niveExistente] = await db.query('SELECT id FROM niveles WHERE id=?', [id]);

        if (niveExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Nivel no encontrado"
            });
        }

        await db.query(
            'UPDATE niveles SET estado = 0 WHERE id = ?',
            [id]
        );

        res.status(200).json({
            success: true,
            mensaje: "Nivel desactivado exitosamente (Borrado Lógico)",

        })
    } catch (error) {
        console.error('Error al eliminar el nivel');
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar el nivel',
            error: error.message
        })
    }
};

module.exports = {
    crearNivel,
    obtenerNiveles,
    modificarNivel,
    eliminarNivel
}