const express = require('express');
const router = express.Router();

const {
    crearUsuario,
    obtenerUsuario,
    modificarUsuario,
    eliminarUsuario,
    login
} = require('../controllers/usuarioController');

const {
    verificarToken,
    verificarAdmin
} = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios del sistema
 */

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - password
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', login);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario (ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_completo
 *               - usuario
 *               - password
 *             properties:
 *               nombre_completo:
 *                 type: string
 *                 example: Juan Pérez
 *               usuario:
 *                 type: string
 *                 example: jperez
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       403:
 *         description: Acceso denegado
 */
router.post('/', crearUsuario);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener usuarios activos (ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/', verificarToken, verificarAdmin, obtenerUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Modificar usuario (ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_completo
 *               - usuario
 *             properties:
 *               nombre_completo:
 *                 type: string
 *               usuario:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: Opcional
 *     responses:
 *       200:
 *         description: Usuario modificado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', verificarToken, verificarAdmin, modificarUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario (borrado lógico, ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', verificarToken, verificarAdmin, eliminarUsuario);

module.exports = router;
