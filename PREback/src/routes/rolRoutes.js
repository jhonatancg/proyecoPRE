const express = require('express');
const router = express.Router();

const {
    crearRol,
    obtenerRoles,
    modificarRol,
    eliminarRol
} = require('../controllers/rolController');

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de roles del sistema
 */

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Crear un nuevo rol
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Administrador
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *       400:
 *         description: Rol duplicado o datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', crearRol);

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Obtener todos los roles activos
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Lista de roles
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', obtenerRoles);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Modificar un rol existente
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Docente
 *     responses:
 *       200:
 *         description: Rol modificado exitosamente
 *       400:
 *         description: Nombre duplicado o inválido
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', modificarRol);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Eliminar un rol (borrado lógico)
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       200:
 *         description: Rol eliminado exitosamente
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', eliminarRol);

module.exports = router;
