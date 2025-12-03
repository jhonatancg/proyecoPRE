const express = require('express');
const router = express.Router();

const {
    crearNivel,
    obtenerNiveles,
    modificarNivel,
    eliminarNivel
} = require('../controllers/nivelController');

/**
 * @swagger
 * tags:
 *   name: Niveles
 *   description: Gestión de niveles
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Nivel:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         estado:
 *           type: integer
 *       example:
 *         id: 1
 *         nombre: "Inicial"
 *         estado: 1
 */

/**
 * @swagger
 * /niveles:
 *   post:
 *     summary: Crear un nuevo nivel
 *     tags: [Niveles]
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
 *             example:
 *               nombre: "Secundaria"
 *     responses:
 *       201:
 *         description: Nivel creado exitosamente
 *       400:
 *         description: Error en los datos enviados
 */
router.post('/', crearNivel);

/**
 * @swagger
 * /niveles:
 *   get:
 *     summary: Obtener todos los niveles activos
 *     tags: [Niveles]
 *     responses:
 *       200:
 *         description: Lista de niveles
 */
router.get('/', obtenerNiveles);

/**
 * @swagger
 * /niveles/{id}:
 *   put:
 *     summary: Modificar un nivel existente
 *     tags: [Niveles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del nivel
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
 *             example:
 *               nombre: "Primaria"
 *     responses:
 *       200:
 *         description: Nivel actualizado correctamente
 *       404:
 *         description: Nivel no encontrado
 *       400:
 *         description: Nombre duplicado
 */
router.put('/:id', modificarNivel);

/**
 * @swagger
 * /niveles/{id}:
 *   delete:
 *     summary: Desactivar (borrado lógico) un nivel
 *     tags: [Niveles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del nivel
 *     responses:
 *       200:
 *         description: Nivel desactivado correctamente
 *       404:
 *         description: Nivel no encontrado
 *       400:
 *         description: No se puede eliminar por tener alumnos
 */
router.delete('/:id', eliminarNivel);

module.exports = router;
