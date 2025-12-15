const express = require('express');
const router = express.Router();

const {
    registrarAsistencia,
    obtenerAsistencias,
    obtenerAsistenciasHoy,
    eliminarAsistencia
} = require('../controllers/asistenciaController');

/**
 * @swagger
 * tags:
 *   name: Asistencias
 *   description: Registro y control de asistencias por QR
 */

/**
 * @swagger
 * /asistencias:
 *   post:
 *     summary: Registrar asistencia de un alumno (lectura QR)
 *     tags: [Asistencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alumno_id
 *             properties:
 *               alumno_id:
 *                 type: integer
 *                 example: 12
 *               situacion:
 *                 type: string
 *                 example: Presente
 *     responses:
 *       201:
 *         description: Asistencia registrada correctamente
 *       400:
 *         description: Asistencia ya registrada o datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', registrarAsistencia);

/**
 * @swagger
 * /asistencias:
 *   get:
 *     summary: Obtener todas las asistencias
 *     tags: [Asistencias]
 *     responses:
 *       200:
 *         description: Lista de asistencias
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', obtenerAsistencias);

/**
 * @swagger
 * /asistencias/hoy:
 *   get:
 *     summary: Obtener asistencias registradas el día de hoy
 *     tags: [Asistencias]
 *     responses:
 *       200:
 *         description: Lista de asistencias del día
 *       500:
 *         description: Error interno del servidor
 */
router.get('/hoy', obtenerAsistenciasHoy);

/**
 * @swagger
 * /asistencias/{id}:
 *   delete:
 *     summary: Eliminar un registro de asistencia (borrado lógico)
 *     tags: [Asistencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del registro de asistencia
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Registro eliminado correctamente
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', eliminarAsistencia);

module.exports = router;
