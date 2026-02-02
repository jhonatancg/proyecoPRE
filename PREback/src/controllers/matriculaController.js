const db = require('../config/database');

const crearMatricula = async (req, res) => {
    try {
        // CAMBIO 1: Ya no pedimos nivel_id en el body
        const { alumno_id, periodo_id, seccion_id, situacion } = req.body;

        if (!alumno_id || !seccion_id || !periodo_id || !situacion) {
            return res.status(400).json({
                success: false,
                mensaje: 'Faltan datos obligatorios (alumno, sección, periodo o situación)',
            });
        }

        // Validar si ya existe matrícula
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

        // CAMBIO 2: Quitamos nivel_id del INSERT
        const [resultado] = await db.query(
            'INSERT INTO matriculas (alumno_id, seccion_id, periodo_id, fecha_matricula, situacion) VALUES (?,?,?, NOW(), ?)',
            [alumno_id, seccion_id, periodo_id, situacion]
        );

        res.status(201).json({
            success: true,
            mensaje: "Matrícula registrada exitosamente",
            data: {
                id: resultado.insertId,
                alumno_id,
                // nivel_id, // Ya no lo devolvemos directo porque no se guarda
                seccion_id,
                periodo_id,
                situacion
            }
        });

    } catch (error) {
        console.error('Error al crear la matrícula:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al registrar la matrícula',
            error: error.message
        });
    }
};

const obtenerMatriculas = async (req, res) => {
    try {
        // CAMBIO 3: El JOIN para obtener el nivel ahora pasa por la sección
        const query = `
            SELECT 
                m.id, 
                m.fecha_matricula, 
                m.situacion,
                a.nombres AS alumno_nombres, 
                a.apellidos AS alumno_apellidos,
                s.nombre AS seccion,
                n.nombre AS nivel,   -- Obtenemos el nivel a través de la sección
                p.nombre AS periodo,
                p.anio AS anio_academico
            FROM matriculas m
            INNER JOIN alumnos a ON m.alumno_id = a.id
            INNER JOIN secciones s ON m.seccion_id = s.id  -- Primero unimos con secciones
            INNER JOIN niveles n ON s.nivel_id = n.id      -- Luego la sección nos lleva al nivel
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
        console.error('Error al obtener matrículas:', error);
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener las matrículas',
            error: error.message
        });
    }
};

// ... modificarMatricula y eliminarMatricula quedan IGUALES (solo usan ID) ...
const modificarMatricula = async (req, res) => {
    try {
        const { id } = req.params;
        const { seccion_id, situacion } = req.body;

        if (!seccion_id || !situacion) {
            return res.status(400).json({ success: false, mensaje: 'Faltan datos' });
        }

        await db.query(
            'UPDATE matriculas SET seccion_id = ?, situacion = ? WHERE id = ?',
            [seccion_id, situacion, id]
        );

        res.status(200).json({ success: true, mensaje: "Matrícula modificada" });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: 'Error al modificar', error: error.message });
    }
};

const eliminarMatricula = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE matriculas SET estado = 0 WHERE id = ?', [id]);
        res.status(200).json({ success: true, mensaje: "Matrícula eliminada" });
    } catch (error) {
        res.status(500).json({ success: false, mensaje: 'Error al eliminar', error: error.message });
    }
};

module.exports = {
    crearMatricula,
    obtenerMatriculas,
    modificarMatricula,
    eliminarMatricula
};