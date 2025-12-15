const express = require('express');
const router = express.Router();

const {
    crearAsignacion,
    obtenerAsignaciones,
    obtenerCursosPorDocente,
    modificarAsignacion,
    eliminarAsignacion
} = require('../controllers/asignacionCursoController');

/**
 * @swagger
 * tags:
 *   name: Asignaciones
 *   description: Gestión de asignación de cursos a docentes
 */

/**
 * @swagger
 * /asignaciones:
 *   post:
 *     summary: Asignar un curso a una sección y docente
 *     tags: [Asignaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nivel_curso_id
 *               - seccion_id
 *               - docente_id
 *               - periodo_id
 *             properties:
 *               nivel_curso_id:
 *                 type: integer
 *                 example: 1
 *               seccion_id:
 *                 type: integer
 *                 example: 2
 *               docente_id:
 *                 type: integer
 *                 example: 3
 *               periodo_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Asignación creada correctamente
 *       400:
 *         description: Error de validación
 */
router.post('/', crearAsignacion);

/**
 * @swagger
 * /asignaciones:
 *   get:
 *     summary: Listar todas las asignaciones activas
 *     tags: [Asignaciones]
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 */
router.get('/', obtenerAsignaciones);

/**
 * @swagger
 * /asignaciones/docente/{docente_id}:
 *   get:
 *     summary: Obtener cursos asignados a un docente
 *     tags: [Asignaciones]
 *     parameters:
 *       - in: path
 *         name: docente_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Cursos del docente
 *       404:
 *         description: Docente no encontrado
 */
router.get('/docente/:docente_id', obtenerCursosPorDocente);

/**
 * @swagger
 * /asignaciones/{id}:
 *   put:
 *     summary: Reasignar docente a una asignación
 *     tags: [Asignaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - docente_id
 *             properties:
 *               docente_id:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       200:
 *         description: Docente reasignado correctamente
 *       404:
 *         description: Asignación no encontrada
 */
router.put('/:id', modificarAsignacion);

/**
 * @swagger
 * /asignaciones/{id}:
 *   delete:
 *     summary: Eliminar asignación (borrado lógico)
 *     tags: [Asignaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asignación eliminada correctamente
 *       404:
 *         description: Asignación no encontrada
 */
router.delete('/:id', eliminarAsignacion);

module.exports = router;
