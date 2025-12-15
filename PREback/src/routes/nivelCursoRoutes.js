const express = require('express');
const router = express.Router();

const {
    crearNivelCurso,
    obtenerNivelCursos,
    obtenerCursosPorNivelId,
    eliminarNivelCurso
} = require('../controllers/nivelCursoController');

/**
 * @swagger
 * tags:
 *   name: NivelCurso
 *   description: Gestión de cursos asignados a niveles
 */

/**
 * @swagger
 * /nivel-curso:
 *   post:
 *     summary: Asignar un curso a un nivel
 *     tags: [NivelCurso]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nivel_id
 *               - curso_id
 *             properties:
 *               nivel_id:
 *                 type: integer
 *                 example: 1
 *               curso_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Curso asignado al nivel correctamente
 *       400:
 *         description: Error de validación
 */
router.post('/', crearNivelCurso);

/**
 * @swagger
 * /nivel-curso:
 *   get:
 *     summary: Listar todos los cursos asignados a niveles
 *     tags: [NivelCurso]
 *     responses:
 *       200:
 *         description: Lista de nivel-curso
 */
router.get('/', obtenerNivelCursos);

/**
 * @swagger
 * /nivel-curso/nivel/{nivel_id}:
 *   get:
 *     summary: Obtener cursos por nivel
 *     tags: [NivelCurso]
 *     parameters:
 *       - in: path
 *         name: nivel_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *     responses:
 *       200:
 *         description: Cursos del nivel
 *       404:
 *         description: Nivel no encontrado
 */
router.get('/nivel/:nivel_id', obtenerCursosPorNivelId);

/**
 * @swagger
 * /nivel-curso/{id}:
 *   delete:
 *     summary: Eliminar curso de un nivel (borrado lógico)
 *     tags: [NivelCurso]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Curso eliminado del nivel
 *       404:
 *         description: Registro no encontrado
 */
router.delete('/:id', eliminarNivelCurso);

module.exports = router;
