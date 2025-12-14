const express = require('express');
const router = express.Router();

const {
    crearAlumno,
    obtenerAlumnos,
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
 * /alumnos:
 *   post:
 *     summary: Crear un nuevo alumno
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
 *             properties:
 *               nombres:
 *                 type: string
 *                 example: Juan Carlos
 *               apellidos:
 *                 type: string
 *                 example: Pérez Gómez
 *               dni_ce:
 *                 type: string
 *                 example: 12345678
 *               genero:
 *                 type: string
 *                 example: M
 *     responses:
 *       201:
 *         description: Alumno creado exitosamente
 *       400:
 *         description: Error de validación o alumno duplicado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', crearAlumno);

/**
 * @swagger
 * /alumnos:
 *   get:
 *     summary: Obtener todos los alumnos activos
 *     tags: [Alumnos]
 *     responses:
 *       200:
 *         description: Lista de alumnos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', obtenerAlumnos);

/**
 * @swagger
 * /alumnos/{id}:
 *   put:
 *     summary: Modificar un alumno existente
 *     tags: [Alumnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del alumno
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
 *                 description: Opcional. Solo enviar si se desea modificar
 *                 example: 87654321
 *     responses:
 *       200:
 *         description: Alumno modificado exitosamente
 *       400:
 *         description: Error de validación o alumno duplicado
 *       404:
 *         description: Alumno no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', modificarAlumno);

/**
 * @swagger
 * /alumnos/{id}:
 *   delete:
 *     summary: Eliminar un alumno (borrado lógico)
 *     tags: [Alumnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del alumno
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Alumno desactivado exitosamente
 *       404:
 *         description: Alumno no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', eliminarAlumno);

module.exports = router;
