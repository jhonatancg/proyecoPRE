const express = require('express');
const router = express.Router();

const {
    crearUsuario,
    obtenerUsuario,
    modificarUsuario,
    eliminarUsuario
} = require('../controllers/usuarioController');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios del sistema
 */

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
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
 *       400:
 *         description: Error de validación o duplicado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', crearUsuario);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener todos los usuarios activos
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios activos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', obtenerUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Modificar un usuario existente
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *           example: 1
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
 *                 example: Juan Pérez
 *               usuario:
 *                 type: string
 *                 example: jperez
 *               password:
 *                 type: string
 *                 description: Opcional. Solo enviar si se desea cambiar.
 *                 example: nueva123
 *     responses:
 *       200:
 *         description: Usuario modificado exitosamente
 *       400:
 *         description: Error de validación o duplicado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', modificarUsuario);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario (borrado lógico)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Usuario desactivado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', eliminarUsuario);

module.exports = router;
