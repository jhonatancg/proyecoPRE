require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const nivelRoutes = require('./routes/nivelRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const alumnoRoutes = require('./routes/alumnoRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const seccionRoutes = require('./routes/seccionRoutes');
const periodoRoutes = require('./routes/periodoRoutes');
const matriculaRoutes = require('./routes/matriculaRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const usuarioRolRoutes = require('./routes/usuarioRolRoutes');
const rolRoutes = require('./routes/rolRoutes');
const asignacionCursoRoutes = require('./routes/asignacionCursoRoutes');
const nivelCursoRoutes = require('./routes/nivelCursoRoutes');
const evaluacionRoutes = require('./routes/evaluacionRoutes');
const notasRoutes = require('./routes/notasRoutes');

require('./services/whatsappService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/niveles', nivelRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/secciones', seccionRoutes);
app.use('/api/periodos', periodoRoutes);
app.use('/api/matriculas', matriculaRoutes);
app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/usuarioRol', usuarioRolRoutes);
app.use('/api/rol', rolRoutes);
app.use('/api/asignacionCurso', asignacionCursoRoutes);
app.use('/api/nivelCurso', nivelCursoRoutes);
app.use('/api/evaluacion', evaluacionRoutes);
app.use('/api/notas', notasRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'Api de proyecto PRE(backend), ya funciona tu server joven'
    })
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`📚 Swagger: http://192.168.18.26:${PORT}/api-docs`);
});