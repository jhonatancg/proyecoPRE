const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Middleware para verificar que el usuario está logueado (Tiene Token válido)
 */
const verificarToken = (req, res, next) => {
    try {
        // 1. Obtener token del header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({
                success: false,
                mensaje: 'Acceso denegado. No se proporcionó token de autenticación.'
            });
        }

        // 2. Verificar token
        // IMPORTANTE: Usa la misma clave secreta que pusiste en usuarioController.js
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Guardar los datos del usuario en la request para usarlos luego
        req.usuario = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                mensaje: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                mensaje: 'Token inválido.'
            });
        }
        return res.status(500).json({
            success: false,
            mensaje: 'Error al verificar la sesión',
            error: error.message
        });
    }
};

/**
 * Middleware para verificar si es ADMIN (Director)
 * Consulta la base de datos para ver si tiene el ROL con ID 1 (o nombre 'ADMIN')
 */
const verificarAdmin = async (req, res, next) => {
    try {
        // req.usuario existe gracias a verificarToken que se ejecuta antes
        const usuarioId = req.usuario.id;

        // Consultamos la tabla intermedia usuario_rol y roles
        // Asumiendo que en tu tabla 'roles', el rol de Administrador se llama 'ADMIN' o 'DIRECTOR'
        const query = `
            SELECT r.nombre 
            FROM roles r
            INNER JOIN usuario_rol ur ON r.id = ur.rol_id
            WHERE ur.usuario_id = ? AND ur.estado = 1 AND r.estado = 1
        `;

        const [roles] = await db.query(query, [usuarioId]);

        // Verificamos si alguno de sus roles es ADMIN
        const esAdmin = roles.some(rol => rol.nombre.toUpperCase() === 'ADMIN' || rol.nombre.toUpperCase() === 'DIRECTOR');

        if (!esAdmin) {
            return res.status(403).json({
                success: false,
                mensaje: 'Acceso denegado. Se requieren permisos de Administrador.'
            });
        }

        next();

    } catch (error) {
        console.error('Error al verificar rol:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al verificar permisos',
            error: error.message
        });
    }
};

/**
 * Middleware para verificar si es DOCENTE
 */
const verificarDocente = async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;

        const query = `
            SELECT r.nombre 
            FROM roles r
            INNER JOIN usuario_rol ur ON r.id = ur.rol_id
            WHERE ur.usuario_id = ? AND ur.estado = 1
        `;

        const [roles] = await db.query(query, [usuarioId]);

        // Verificamos si tiene rol DOCENTE o ADMIN (El admin suele tener acceso a todo)
        const tienePermiso = roles.some(rol =>
            rol.nombre.toUpperCase() === 'DOCENTE' ||
            rol.nombre.toUpperCase() === 'ADMIN'
        );

        if (!tienePermiso) {
            return res.status(403).json({
                success: false,
                mensaje: 'Acceso denegado. Solo para Docentes.'
            });
        }

        next();

    } catch (error) {
        console.error('Error al verificar rol docente:', error);
        res.status(500).json({ success: false, mensaje: 'Error de permisos' });
    }
};

const verificarAlumno = async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;

        const query = `
            SELECT r.nombre 
            FROM roles r
            INNER JOIN usuario_rol ur ON r.id = ur.rol_id
            WHERE ur.usuario_id = ? AND ur.estado = 1
        `;

        const [roles] = await db.query(query, [usuarioId]);

        // Verificamos si tiene rol ALUMNO
        // (Opcional: Si quieres que el ADMIN también pueda entrar a rutas de alumno, agrega la condición OR)
        const tienePermiso = roles.some(rol =>
            rol.nombre.toUpperCase() === 'ALUMNO' ||
            rol.nombre.toUpperCase() === 'ADMIN'
        );

        if (!tienePermiso) {
            return res.status(403).json({
                success: false,
                mensaje: 'Acceso denegado. Solo para Alumnos.'
            });
        }

        next();

    } catch (error) {
        console.error('Error al verificar rol alumno:', error);
        res.status(500).json({ success: false, mensaje: 'Error de permisos' });
    }
};


module.exports = {
    verificarToken,
    verificarAdmin,
    verificarDocente,
    verificarAlumno
};
