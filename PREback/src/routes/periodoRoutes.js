const express = require('express');
const router = express.Router();

const {
    crearPeriodo,
    obtenerPeriodos,
    modificarPeriodo,
    eliminarPeriodo
} = require('../controllers/periodoController');

/**
 * @swagger
 * tags:
 *   name: Periodos Académicos
 *   description: Gestión de periodos académicos
 */

/**
 * @swagger
 * /periodos:
 *   post:
 *     summary: Crear un periodo académico
 *     tags: [Periodos Académicos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - anio
 *               - fecha_inicio
 *               - fecha_fin
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: 2025-I
 *               anio:
 *                 type: integer
 *                 example: 2025
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 example: 2025-03-01
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 example: 2025-07-30
 *               situacion:
 *                 type: string
 *                 example: Activo
 *     responses:
 *       201:
 *         description: Periodo académico creado exitosamente
 *       400:
 *         description: Error de validación o periodo duplicado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', crearPeriodo);

/**
 * @swagger
 * /periodos:
 *   get:
 *     summary: Obtener todos los periodos académicos activos
 *     tags: [Periodos Académicos]
 *     responses:
 *       200:
 *         description: Lista de periodos académicos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', obtenerPeriodos);

/**
 * @swagger
 * /periodos/{id}:
 *   put:
 *     summary: Modificar un periodo académico
 *     tags: [Periodos Académicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del periodo académico
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
 *               - anio
 *               - fecha_inicio
 *               - fecha_fin
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: 2025-II
 *               anio:
 *                 type: integer
 *                 example: 2025
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 example: 2025-08-01
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-15
 *               situacion:
 *                 type: string
 *                 example: Activo
 *     responses:
 *       200:
 *         description: Periodo académico modificado exitosamente
 *       400:
 *         description: Error de validación o periodo duplicado
 *       404:
 *         description: Periodo académico no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', modificarPeriodo);

/**
 * @swagger
 * /periodos/{id}:
 *   delete:
 *     summary: Eliminar un periodo académico (borrado lógico)
 *     tags: [Periodos Académicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del periodo académico
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Periodo académico desactivado exitosamente
 *       404:
 *         description: Periodo académico no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', eliminarPeriodo);

module.exports = router;
