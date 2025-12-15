const express = require('express');
const router = express.Router();

const {
    crearCurso,
    obtenerCursos,
    modificarCurso,
    eliminarCurso
} = require('../controllers/cursoController');

/**
 * @swagger
 * tags:
 *   name: Cursos
 *   description: Gestión de cursos
 */

/**
 * @swagger
 * /cursos:
 *   post:
 *     summary: Crear un nuevo curso
 *     tags: [Cursos]
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
 *                 example: Matemática
 *     responses:
 *       201:
 *         description: Curso creado exitosamente
 *       400:
 *         description: Error de validación o curso duplicado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', crearCurso);

/**
 * @swagger
 * /cursos:
 *   get:
 *     summary: Obtener todos los cursos activos
 *     tags: [Cursos]
 *     responses:
 *       200:
 *         description: Lista de cursos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', obtenerCursos);

/**
 * @swagger
 * /cursos/{id}:
 *   put:
 *     summary: Modificar un curso existente
 *     tags: [Cursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del curso
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
 *                 example: Matemática Avanzada
 *     responses:
 *       200:
 *         description: Curso modificado exitosamente
 *       400:
 *         description: Error de validación o curso duplicado
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', modificarCurso);

/**
 * @swagger
 * /cursos/{id}:
 *   delete:
 *     summary: Eliminar un curso (borrado lógico)
 *     tags: [Cursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del curso
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Curso desactivado exitosamente
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', eliminarCurso);

module.exports = router;
