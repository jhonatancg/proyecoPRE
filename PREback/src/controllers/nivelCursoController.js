const db = require('../config/database');

const crearNivelCurso = async (req, res) => {
    try {
        const { nivel_id, curso_id } = req.body;

        if (!nivel_id || !curso_id) {
            return res.status(400).json({
                success: false,
                mensaje: 'Nivel y Curso son obligatorios'
            });
        }

        const [existe] = await db.query(
            'SELECT id FROM nivel_curso WHERE nivel_id = ? AND curso_id = ? AND estado = 1',
            [nivel_id, curso_id]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Este curso ya está agregado a este nivel"
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO nivel_curso (nivel_id, curso_id) VALUES (?, ?)',
            [nivel_id, curso_id]
        );

        res.status(201).json({
            success: true,
            mensaje: "Curso agregado al nivel correctamente",
            data: {
                id: resultado.insertId,
                nivel_id,
                curso_id
            }
        });

    } catch (error) {
        console.error('Error al crear nivel_curso:');
        res.status(500).json({
            success: false,
            mensaje: 'Error al asignar curso al nivel',
            error: error.message
        });
    }
};

const obtenerNivelCursos = async (req, res) => {
    try {
        const query = `
            SELECT 
                nc.id, 
                n.nombre AS nivel, 
                c.nombre AS curso
            FROM nivel_curso nc
            INNER JOIN niveles n ON nc.nivel_id = n.id
            INNER JOIN cursos c ON nc.curso_id = c.id
            WHERE nc.estado = 1
            ORDER BY n.id ASC, c.nombre ASC
        `;

        const [lista] = await db.query(query);

        res.json({
            success: true,
            count: lista.length,
            data: lista
        });

    } catch (error) {
        console.error('Error al obtener lista:');
        res.status(500).json({ success: false, mensaje: 'Error al listar', error: error.message });
    }
};

const obtenerCursosPorNivelId = async (req, res) => {
    try {
        const { nivel_id } = req.params;

        const query = `
            SELECT 
                nc.id AS nivel_curso_id, 
                c.id AS curso_id,
                c.nombre AS curso_nombre
            FROM nivel_curso nc
            INNER JOIN cursos c ON nc.curso_id = c.id
            WHERE nc.nivel_id = ? AND nc.estado = 1
            ORDER BY c.nombre ASC
        `;

        const [cursos] = await db.query(query, [nivel_id]);

        res.json({
            success: true,
            nivel_id,
            data: cursos
        });

    } catch (error) {
        console.error('Error al obtener cursos del nivel');
        res.status(500).json({ success: false, mensaje: 'Error al obtener cursos', error: error.message });
    }
};

const eliminarNivelCurso = async (req, res) => {
    try {
        const { id } = req.params;

        const [existe] = await db.query('SELECT id FROM nivel_curso WHERE id = ?', [id]);

        if (existe.length === 0) {
            return res.status(404).json({ success: false, mensaje: "Registro no encontrado" });
        }

        await db.query('UPDATE nivel_curso SET estado = 0 WHERE id = ?', [id]);

        res.json({ success: true, mensaje: "Curso eliminado del nivel correctamente" });

    } catch (error) {
        console.error('Error al eliminar:');
        res.status(500).json({ success: false, mensaje: 'Error al eliminar', error: error.message });
    }
};

module.exports = {
    crearNivelCurso,
    obtenerNivelCursos,
    obtenerCursosPorNivelId,
    eliminarNivelCurso
};