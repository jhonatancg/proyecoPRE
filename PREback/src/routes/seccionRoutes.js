const express = require('express');
const router = express.Router();

const {
    crearSeccion,
    obtenerSeccion,
    modificarSeccion,
    eliminarSeccion
} = require('../controllers/seccionController');

/**
 * @swagger
 * tags:
 *   name: Secciones
 *   description: Gestión de secciones
 */

/**
 * @swagger
 * /secciones:
 *   post:
 *     summary: Crear una nueva sección
 *     tags: [Secciones]
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
 *                 example: A
 *     responses:
 *       201:
 *         description: Sección creada exitosamente
 *       400:
 *         description: Error de validación o sección duplicada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', crearSeccion);

/**
 * @swagger
 * /secciones:
 *   get:
 *     summary: Obtener todas las secciones activas
 *     tags: [Secciones]
 *     responses:
 *       200:
 *         description: Lista de secciones
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', obtenerSeccion);

/**
 * @swagger
 * /secciones/{id}:
 *   put:
 *     summary: Modificar una sección existente
 *     tags: [Secciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la sección
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
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: B
 *     responses:
 *       200:
 *         description: Sección modificada exitosamente
 *       400:
 *         description: Error de validación o sección duplicada
 *       404:
 *         description: Sección no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', modificarSeccion);

/**
 * @swagger
 * /secciones/{id}:
 *   delete:
 *     summary: Eliminar una sección (borrado lógico)
 *     tags: [Secciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la sección
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Sección desactivada exitosamente
 *       404:
 *         description: Sección no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', eliminarSeccion);

module.exports = router;
