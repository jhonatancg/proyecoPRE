const db = require('../config/database');

const crearRol = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'El nombre del rol es obligatorio',
            });
        }

        const [existe] = await db.query(
            'SELECT id FROM roles WHERE nombre = ? AND estado = 1',
            [nombre]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe un rol con ese nombre"
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO roles (nombre) VALUES (?)',
            [nombre]
        );

        res.status(201).json({
            success: true,
            mensaje: "Rol creado exitosamente",
            data: {
                id: resultado.insertId,
                nombre
            }
        });

    } catch (error) {
        console.error('Error al crear el rol:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear el rol',
            error: error.message
        });
    }
};

const obtenerRoles = async (req, res) => {
    try {
        const [roles] = await db.query('SELECT * FROM roles WHERE estado = 1 ORDER BY id ASC');

        res.json({
            success: true,
            count: roles.length,
            data: roles
        });
    } catch (error) {
        console.error('Error al obtener roles:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener los roles',
            error: error.message
        });
    }
};

const modificarRol = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'El nombre es obligatorio'
            });
        }

        const [rolExistente] = await db.query('SELECT id FROM roles WHERE id = ?', [id]);

        if (rolExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Rol no encontrado"
            });
        }

        const [duplicado] = await db.query(
            'SELECT id FROM roles WHERE nombre = ? AND id != ? AND estado = 1',
            [nombre, id]
        );

        if (duplicado.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe otro rol con ese nombre"
            });
        }

        await db.query('UPDATE roles SET nombre = ? WHERE id = ?', [nombre, id]);

        res.json({
            success: true,
            mensaje: "Rol modificado exitosamente"
        });

    } catch (error) {
        console.error('Error al modificar el rol:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al modificar el rol',
            error: error.message
        });
    }
};

const eliminarRol = async (req, res) => {
    try {
        const { id } = req.params;

        const [rolExistente] = await db.query('SELECT id FROM roles WHERE id = ?', [id]);

        if (rolExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Rol no encontrado"
            });
        }

        await db.query('UPDATE roles SET estado = 0 WHERE id = ?', [id]);

        res.json({
            success: true,
            mensaje: "Rol eliminado exitosamente"
        });

    } catch (error) {
        console.error('Error al eliminar el rol:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar el rol',
            error: error.message
        });
    }
};

module.exports = {
    crearRol,
    obtenerRoles,
    modificarRol,
    eliminarRol
};