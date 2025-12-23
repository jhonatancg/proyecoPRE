const db = require('../config/database');

const asignarRol = async (req, res) => {
    try {
        const { usuario_id, rol_id } = req.body;

        if (!usuario_id || !rol_id) {
            return res.status(400).json({
                success: false,
                mensaje: 'Usuario y Rol son obligatorios'
            });
        }

        const [existe] = await db.query(
            'SELECT id FROM usuario_roles WHERE usuario_id = ? AND rol_id = ? AND estado = 1',
            [usuario_id, rol_id]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "El usuario ya tiene asignado este rol"
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO usuario_roles (usuario_id, rol_id) VALUES (?, ?)',
            [usuario_id, rol_id]
        );

        res.status(201).json({
            success: true,
            mensaje: "Rol asignado correctamente",
            data: {
                id: resultado.insertId,
                usuario_id,
                rol_id
            }
        });

    } catch (error) {
        console.error('Error al asignar rol:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al asignar el rol',
            error: error.message
        });
    }
};

const obtenerRolesPorUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const query = `
            SELECT 
                ur.id, 
                ur.usuario_id,
                r.nombre AS nombre_rol,
                ur.estado
            FROM usuario_roles ur
            INNER JOIN roles r ON ur.rol_id = r.id
            WHERE ur.usuario_id = ? AND ur.estado = 1
        `;

        const [roles] = await db.query(query, [usuario_id]);

        res.json({
            success: true,
            usuario_id,
            roles: roles
        });

    } catch (error) {
        console.error('Error al obtener roles del usuario:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener roles',
            error: error.message
        });
    }
};

const eliminarRolUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const [existe] = await db.query('SELECT id FROM usuario_roles WHERE id = ?', [id]);

        if (existe.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Asignación no encontrada"
            });
        }

        await db.query('UPDATE usuario_roles SET estado = 0 WHERE id = ?', [id]);

        res.json({
            success: true,
            mensaje: "Rol desasignado correctamente"
        });

    } catch (error) {
        console.error('Error al quitar rol:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar la asignación',
            error: error.message
        });
    }
};

module.exports = {
    asignarRol,
    obtenerRolesPorUsuario,
    eliminarRolUsuario
};