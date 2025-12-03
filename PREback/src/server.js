require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const nivelRoutes = require('./routes/nivelRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/niveles', nivelRoutes);

app.get('/', (req, res) => {
    res.json({
        mensaje: 'Api de proyecto PRE(backend), ya funciona tu server joven'
    })
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
    console.log(`📚 Documentación Swagger en http://localhost:${PORT}/api-docs`);
})