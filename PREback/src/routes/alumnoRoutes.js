const express = require('express');
const router = express.Router();

const {
    crearAlumno,
    obtenerAlumnos,
    obtenerAlumnoPorId,
    modificarAlumno,
    eliminarAlumno
} = require('../controllers/alumnoController');

/**
 * @swagger
 * tags:
 *   name: Alumnos
 *   description: Gestión de alumnos
 */

/**
 * @swagger
 * /api/alumnos:
 *   post:
 *     summary: Crear un alumno
 *     tags: [Alumnos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombres
 *               - apellidos
 *               - dni_ce
 *               - genero
 *               - apoderado
 *               - cel_apoderado
 *             properties:
 *               nombres:
 *                 type: string
 *                 example: Juan
 *               apellidos:
 *                 type: string
 *                 example: Pérez López
 *               dni_ce:
 *                 type: string
 *                 example: 74581236
 *               genero:
 *                 type: string
 *                 example: M
 *               celular:
 *                 type: string
 *                 example: 987654321
 *               apoderado:
 *                 type: string
 *                 example: María López
 *               cel_apoderado:
 *                 type: string
 *                 example: 999888777
 *     responses:
 *       201:
 *         description: Alumno creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', crearAlumno);

/**
 * @swagger
 * /api/alumnos:
 *   get:
 *     summary: Obtener lista de alumnos activos
 *     tags: [Alumnos]
 *     responses:
 *       200:
 *         description: Lista de alumnos
 */
router.get('/', obtenerAlumnos);
router.get('/:id', obtenerAlumnoPorId);

/**
 * @swagger
 * /api/alumnos/{id}:
 *   put:
 *     summary: Modificar un alumno
 *     tags: [Alumnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 8
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombres
 *               - apellidos
 *             properties:
 *               nombres:
 *                 type: string
 *                 example: Juan Carlos
 *               apellidos:
 *                 type: string
 *                 example: Pérez Gómez
 *               dni_ce:
 *                 type: string
 *                 example: 74581236
 *               celular:
 *                 type: string
 *                 example: 987654321
 *               apoderado:
 *                 type: string
 *                 example: María Gómez
 *               cel_apoderado:
 *                 type: string
 *                 example: 999888777
 *     responses:
 *       200:
 *         description: Alumno modificado exitosamente
 *       404:
 *         description: Alumno no encontrado
 */
router.put('/:id', modificarAlumno);

/**
 * @swagger
 * /api/alumnos/{id}:
 *   delete:
 *     summary: Eliminar alumno (borrado lógico)
 *     tags: [Alumnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 8
 *     responses:
 *       200:
 *         description: Alumno desactivado exitosamente
 *       404:
 *         description: Alumno no encontrado
 */
router.delete('/:id', eliminarAlumno);

module.exports = router;
