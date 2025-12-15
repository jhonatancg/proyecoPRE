const express = require('express');
const router = express.Router();

const {
    registrarNota,
    obtenerNotasPorCurso,
    obtenerNotasPorAlumno,
    modificarNota,
    eliminarNota
} = require('../controllers/notasController');

/**
 * @swagger
 * tags:
 *   name: Notas
 *   description: Gestión de calificaciones académicas
 */

/**
 * @swagger
 * /notas:
 *   post:
 *     summary: Registrar una nota
 *     tags: [Notas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alumno_id
 *               - asignacion_curso_id
 *               - tipo_evaluacion_id
 *               - valor
 *             properties:
 *               alumno_id:
 *                 type: integer
 *                 example: 5
 *               asignacion_curso_id:
 *                 type: integer
 *                 example: 10
 *               tipo_evaluacion_id:
 *                 type: integer
 *                 example: 2
 *               valor:
 *                 type: number
 *                 example: 15
 *     responses:
 *       201:
 *         description: Nota registrada exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', registrarNota);

/**
 * @swagger
 * /notas/curso/{asignacion_curso_id}:
 *   get:
 *     summary: Obtener notas por curso asignado
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: asignacion_curso_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Lista de notas del curso
 */
router.get('/curso/:asignacion_curso_id', obtenerNotasPorCurso);

/**
 * @swagger
 * /notas/alumno/{alumno_id}:
 *   get:
 *     summary: Obtener notas por alumno (libreta)
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: alumno_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Libreta de notas del alumno
 */
router.get('/alumno/:alumno_id', obtenerNotasPorAlumno);

/**
 * @swagger
 * /notas/{id}:
 *   put:
 *     summary: Modificar una nota
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - valor
 *             properties:
 *               valor:
 *                 type: number
 *                 example: 18
 *     responses:
 *       200:
 *         description: Nota corregida exitosamente
 *       404:
 *         description: Nota no encontrada
 */
router.put('/:id', modificarNota);

/**
 * @swagger
 * /notas/{id}:
 *   delete:
 *     summary: Eliminar nota (borrado lógico)
 *     tags: [Notas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: Nota eliminada exitosamente
 *       404:
 *         description: Nota no encontrada
 */
router.delete('/:id', eliminarNota);

module.exports = router;
