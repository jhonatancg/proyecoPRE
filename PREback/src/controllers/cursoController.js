const db = require('../config/database');

const crearCurso = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'El nombre es obligatorio',
            })
        }

        const [existe] = await db.query(
            'SELECT id FROM cursos WHERE nombre = ? AND estado = 1',
            [nombre]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe este curso con ese nombre"
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO cursos(nombre) VALUES (?)',
            [nombre]
        );

        res.status(201).json({
            success: true,
            mensaje: "Curso creado exitosamente",
            data: {
                id: resultado.insertId,
                nombre
            }
        })
    } catch (error) {
        console.error('Error al crear el curso');
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear el curso',
            error: error.message
        })
    }
};

const obtenerCursos = async (req, res) => {
    try {
        const [cursos] = await db.query('SELECT * FROM cursos WHERE estado = 1 ORDER BY id DESC');
        res.json({
            success: true,
            count: cursos.length,
            data: cursos
        })
    } catch (error) {
        console.error('Error al obtener cursos');
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener cursos',
            error: error.message
        })
    }
};

const modificarCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'El nombre es obligatorio para modificar'
            });
        }

        const [cursoExistente] = await db.query('SELECT id FROM cursos WHERE id=?', [id]);

        if (cursoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Curso no encontrado"
            });
        }

        const [duplicado] = await db.query(
            'SELECT id FROM cursos WHERE nombre = ? AND id != ? AND estado = 1',
            [nombre, id]
        );

        if (duplicado.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe otro curso con ese nombre"
            });
        }

        await db.query(
            'UPDATE cursos set nombre=? WHERE id=?',
            [nombre, id]
        );

        res.status(200).json({
            success: true,
            mensaje: "Curso modificado exitosamente",
            data: {
                id,
                nombre
            }
        })
    } catch (error) {
        console.error('Error al modificar el curso');
        res.status(500).json({
            success: false,
            mensaje: 'Error al modificar el curso',
            error: error.message
        })
    }
};

const eliminarCurso = async (req, res) => {
    try {
        const { id } = req.params;

        const [cursoExistente] = await db.query('SELECT id FROM cursos WHERE id=?', [id]);

        if (cursoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Curso no encontrado"
            });
        }

        await db.query(
            'UPDATE cursos SET estado = 0 WHERE id = ?',
            [id]
        );

        res.status(200).json({
            success: true,
            mensaje: "Curso desactivado exitosamente (Borrado Lógico)",

        })
    } catch (error) {
        console.error('Error al eliminar el curso');
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar el curso',
            error: error.message
        })
    }
};

module.exports = {
    crearCurso,
    obtenerCursos,
    modificarCurso,
    eliminarCurso
}