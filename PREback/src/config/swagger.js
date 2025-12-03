const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Sistema Escolar',
            version: '1.0.0',
            description: 'Documentación de la API para el sistema de gestión escolar (Node.js + MySQL)',
            contact: {
                name: 'Soporte Técnico',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Servidor de Desarrollo',
            },
        ],
    },
    // AQUÍ LE DECIMOS DÓNDE BUSCAR LA DOCUMENTACIÓN (En tus rutas)
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;