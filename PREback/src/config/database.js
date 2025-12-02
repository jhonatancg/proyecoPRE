const mysql = require("mysql2")

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error de conexion');
    } else {
        console.log('Conexion exitosa, ya esta joven');
        connection.release();
    }
})

module.exports = promisePool;