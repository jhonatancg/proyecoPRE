const express = require('express');
const router = express.Router();

const {
    crearMatricula,
    obtenerMatriculas,
    modificarMatricula,
    eliminarMatricula
} = require('../controllers/matriculaController');

const {
    verificarToken,
    verificarAdmin,
    verificarDocente,
} = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Matrículas
 *   description: Gestión de matrículas de alumnos
 */

/**
 * @swagger
 * /matriculas:
 *   post:
 *     summary: Registrar una nueva matrícula
 *     tags: [Matrículas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alumno_id
 *               - seccion_id
 *               - periodo_id
 *               - situacion
 *             properties:
 *               alumno_id:
 *                 type: integer
 *                 example: 1
 *               seccion_id:
 *                 type: integer
 *                 example: 2
 *               periodo_id:
 *                 type: integer
 *                 example: 3
 *               situacion:
 *                 type: string
 *                 example: ACTIVO
 *     responses:
 *       201:
 *         description: Matrícula registrada exitosamente
 *       400:
 *         description: Error de validación o matrícula duplicada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', verificarToken, verificarAdmin, crearMatricula);

/**
 * @swagger
 * /matriculas:
 *   get:
 *     summary: Obtener todas las matrículas activas
 *     tags: [Matrículas]
 *     responses:
 *       200:
 *         description: Lista de matrículas
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', verificarToken, verificarDocente, obtenerMatriculas);

/**
 * @swagger
 * /matriculas/{id}:
 *   put:
 *     summary: Modificar una matrícula
 *     tags: [Matrículas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la matrícula
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
 *               - seccion_id
 *               - situacion
 *             properties:
 *               seccion_id:
 *                 type: integer
 *                 example: 4
 *               situacion:
 *                 type: string
 *                 example: RETIRADO
 *     responses:
 *       200:
 *         description: Matrícula modificada exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Matrícula no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', verificarToken, verificarAdmin, modificarMatricula);

/**
 * @swagger
 * /matriculas/{id}:
 *   delete:
 *     summary: Eliminar una matrícula (borrado lógico)
 *     tags: [Matrículas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la matrícula
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Matrícula eliminada exitosamente
 *       404:
 *         description: Matrícula no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', verificarToken, verificarAdmin, eliminarMatricula);

module.exports = router;
