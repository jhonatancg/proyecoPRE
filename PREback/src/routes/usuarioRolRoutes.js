const express = require('express');
const router = express.Router();

const {
    asignarRol,
    obtenerRolesPorUsuario,
    eliminarRolUsuario
} = require('../controllers/usuarioRolController');

/**
 * @swagger
 * tags:
 *   name: Usuario-Rol
 *   description: Asignación y gestión de roles por usuario
 */

/**
 * @swagger
 * /usuario-roles:
 *   post:
 *     summary: Asignar un rol a un usuario
 *     tags: [Usuario-Rol]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario_id
 *               - rol_id
 *             properties:
 *               usuario_id:
 *                 type: integer
 *                 example: 3
 *               rol_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Rol asignado correctamente
 *       400:
 *         description: El usuario ya tiene el rol o datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', asignarRol);

/**
 * @swagger
 * /usuario-roles/usuario/{usuario_id}:
 *   get:
 *     summary: Obtener roles asignados a un usuario
 *     tags: [Usuario-Rol]
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       200:
 *         description: Lista de roles del usuario
 *       500:
 *         description: Error interno del servidor
 */
router.get('/usuario/:usuario_id', obtenerRolesPorUsuario);

/**
 * @swagger
 * /usuario-roles/{id}:
 *   delete:
 *     summary: Quitar un rol a un usuario (borrado lógico)
 *     tags: [Usuario-Rol]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la asignación usuario-rol
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Rol desasignado correctamente
 *       404:
 *         description: Asignación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', eliminarRolUsuario);

module.exports = router;
