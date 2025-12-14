const db = require('../config/database');

const crearAlumno = async (req, res) => {
    try {
        const { nombres, apellidos, dni_ce, genero } = req.body;

        if (!nombres?.trim() || !apellidos?.trim() || !genero?.trim() || !dni_ce?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'Todos los campos son obligatorios',
            })
        }

        const [existe] = await db.query(
            'SELECT id FROM alumnos WHERE dni_ce = ? AND estado = 1',
            [dni_ce]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                success: false,
                mensaje: "Ya existe este alumno"
            });
        }

        const codigo_carnet = `QR-${dni_ce.trim()}`;

        const [resultado] = await db.query(
            'INSERT INTO alumnos(nombres,apellidos,dni_ce,genero,codigo_carnet) VALUES (?,?,?,?,?)',
            [nombres, apellidos, dni_ce, genero, codigo_carnet]
        );

        res.status(201).json({
            success: true,
            mensaje: "Alumno creado exitosamente",
            data: {
                id: resultado.insertId,
                nombres,
                apellidos,
                dni_ce,
                genero,
                codigo_carnet
            }
        })
    } catch (error) {
        console.error('Error al crear el alumno');
        res.status(500).json({
            success: false,
            mensaje: 'Error al crear el alumno',
            error: error.message
        })
    }
};

const obtenerAlumnos = async (req, res) => {
    try {
        const [alumnos] = await db.query('SELECT * FROM alumnos WHERE estado = 1 ORDER BY id DESC');
        res.json({
            success: true,
            count: alumnos.length,
            data: alumnos
        })
    } catch (error) {
        console.error('Error al obtener alumnos');
        res.status(500).json({
            success: false,
            mensaje: 'Error al obtener alumnos',
            error: error.message
        })
    }
};

const modificarAlumno = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombres, apellidos, dni_ce } = req.body;

        if (!nombres?.trim() || !apellidos?.trim()) {
            return res.status(400).json({
                success: false,
                mensaje: 'Los nombres y apellidos son obligatorios',
            })
        }

        const [alumnoExistente] = await db.query('SELECT id FROM alumnos WHERE id=? AND estado=1', [id]);

        if (alumnoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Alumno no encontrado"
            });
        }

        if (dni_ce && dni_ce.trim() !== "") {

            const [duplicado] = await db.query(
                'SELECT id FROM alumnos WHERE dni_ce=? AND id != ? AND estado = 1',
                [dni_ce, id]
            );

            if (duplicado.length > 0) {
                return res.status(400).json({
                    success: false,
                    mensaje: "Ya existe este alumno"
                });
            }

            const codigo_carnet = `QR-${dni_ce.trim()}`;

            await db.query(
                'UPDATE alumnos set nombres=?, apellidos=?, dni_ce=?,codigo_carnet=? WHERE id=?',
                [nombres, apellidos, dni_ce, codigo_carnet, id]
            );

        } else {
            await db.query(
                'UPDATE alumnos set nombres=?, apellidos=? WHERE id=?',
                [nombres, apellidos, id]
            );
        }

        res.status(200).json({
            success: true,
            mensaje: "Alumno modificado exitosamente",
            data: {
                id,
                nombres,
                apellidos,
            }
        })
    } catch (error) {
        console.error('Error al modificar alumno');
        res.status(500).json({
            success: false,
            mensaje: 'Error al modificar alumno',
            error: error.message
        })
    }
};

const eliminarAlumno = async (req, res) => {
    try {
        const { id } = req.params;

        const [alumnoExistente] = await db.query('SELECT id FROM alumnos WHERE id=? AND estado=1', [id]);

        if (alumnoExistente.length === 0) {
            return res.status(404).json({
                success: false,
                mensaje: "Alumno no encontrado"
            });
        }

        await db.query(
            'UPDATE alumnos SET estado = 0 WHERE id = ?',
            [id]
        );

        res.status(200).json({
            success: true,
            mensaje: "Alumno desactivado exitosamente (Borrado Lógico)",

        })
    } catch (error) {
        console.error('Error al eliminar al alumno');
        res.status(500).json({
            success: false,
            mensaje: 'Error al eliminar al alumno',
            error: error.message
        })
    }
};

module.exports = {
    crearAlumno,
    obtenerAlumnos,
    modificarAlumno,
    eliminarAlumno
}