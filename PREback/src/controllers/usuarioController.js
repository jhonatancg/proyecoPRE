const db = require('../config/database');
const bcrypt = require('bcryptjs');

const crearUsuario = async (req, res) => {
    try {
        const { nombre_completo, usuario, password } = req.body;

        if (!nombre_completo?.trim() || !usuario?.trim() || !password?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'Todos los campos son obligatorios',
            })
        }

        const [existe] = await db.query(
            'SELECT id FROM usuarios WHERE (nombre_completo = ? OR usuario=?) AND estado = 1',
            [nombre_completo, usuario]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe un usuario con ese nombre o ese usuario de sistema."
            });
        }

        const passwordHash = await bcrypt.hash(password.trim(), 10);

        const [resultado] = await db.query(
            'INSERT INTO usuarios(nombre_completo,usuario,password) VALUES (?,?,?)',
            [nombre_completo, usuario, passwordHash]
        );

        res.status(201).json({
            success: true,
            mensaje: "Usuario creado exitosamente",
            data: {
                id: resultado.insertId,
                nombre_completo,
                usuario
            }
        })
    } catch (error) {
        console.error('Error al crear el usuario');
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear el usuario',
            error: error.message
        })
    }
};

const obtenerUsuario = async (req, res) => {
    try {
        const [usuarios] = await db.query('SELECT id, nombre_completo, usuario FROM usuarios WHERE estado = 1 ORDER BY id DESC');
        res.json({
            success: true,
            count: usuarios.length,
            data: usuarios
        })
    } catch (error) {
        console.error('Error al obtener los usuarios');
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener los usuarios',
            error: error.message
        })
    }
};

const modificarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, usuario, password } = req.body;

        if (!nombre_completo?.trim() || !usuario?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'Nombre y usuario son obligatorios',
            })
        }

        const [usuarioExistente] = await db.query('SELECT id FROM usuarios WHERE id=? AND estado=1', [id]);

        if (usuarioExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Usuario no encontrado"
            });
        }

        const [duplicado] = await db.query(
            'SELECT id FROM usuarios WHERE (nombre_completo = ? OR usuario=?) AND id != ? AND estado = 1',
            [nombre_completo, usuario, id]
        );

        if (duplicado.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe este usuario"
            });
        }

        if (password && password.trim() !== "") {
            const passwordHash = await bcrypt.hash(password.trim(), 10);

            await db.query(
                'UPDATE usuarios set nombre_completo=?, usuario=?, password=? WHERE id=?',
                [nombre_completo, usuario, passwordHash, id]
            );
        } else {
            await db.query(
                'UPDATE usuarios set nombre_completo=?, usuario=? WHERE id=?',
                [nombre_completo, usuario, id]
            );
        }

        res.status(200).json({
            success: true,
            mensaje: "Usuario modificado exitosamente",
            data: {
                id,
                nombre_completo,
                usuario
            }
        })
    } catch (error) {
        console.error('Error al modificar el usuario');
        res.status(500).json({
            success: false,
            mensaje: 'Error al modificar el usuario',
            error: error.message
        })
    }
};

const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const [usuarioExistente] = await db.query('SELECT id FROM usuarios WHERE id=? AND estado=1', [id]);

        if (usuarioExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Usuario no encontrado"
            });
        }

        await db.query(
            'UPDATE usuarios SET estado = 0 WHERE id = ?',
            [id]
        );

        res.status(200).json({
            success: true,
            mensaje: "Usuario desactivado exitosamente (Borrado Lógico)",

        })
    } catch (error) {
        console.error('Error al eliminar el usuario');
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar el usuario',
            error: error.message
        })
    }
};

module.exports = {
    crearUsuario,
    obtenerUsuario,
    modificarUsuario,
    eliminarUsuario
}