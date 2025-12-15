const express = require('express');
const router = express.Router();

const {
    crearTipoEvaluacion,
    obtenerTiposEvaluacion,
    modificarTipoEvaluacion,
    eliminarTipoEvaluacion
} = require('../controllers/evaluacionController');

/**
 * @swagger
 * tags:
 *   name: TipoEvaluacion
 *   description: Gestión de tipos de evaluación académica
 */

/**
 * @swagger
 * /tipos-evaluacion:
 *   post:
 *     summary: Crear un tipo de evaluación
 *     tags: [TipoEvaluacion]
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
 *                 example: Examen Parcial
 *     responses:
 *       201:
 *         description: Tipo de evaluación creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', crearTipoEvaluacion);

/**
 * @swagger
 * /tipos-evaluacion:
 *   get:
 *     summary: Listar tipos de evaluación
 *     tags: [TipoEvaluacion]
 *     responses:
 *       200:
 *         description: Lista de tipos de evaluación
 */
router.get('/', obtenerTiposEvaluacion);

/**
 * @swagger
 * /tipos-evaluacion/{id}:
 *   put:
 *     summary: Modificar un tipo de evaluación
 *     tags: [TipoEvaluacion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
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
 *                 example: Examen Final
 *     responses:
 *       200:
 *         description: Tipo de evaluación modificado exitosamente
 *       404:
 *         description: Registro no encontrado
 */
router.put('/:id', modificarTipoEvaluacion);

/**
 * @swagger
 * /tipos-evaluacion/{id}:
 *   delete:
 *     summary: Eliminar tipo de evaluación (borrado lógico)
 *     tags: [TipoEvaluacion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Tipo de evaluación eliminado correctamente
 *       404:
 *         description: Registro no encontrado
 */
router.delete('/:id', eliminarTipoEvaluacion);

module.exports = router;
