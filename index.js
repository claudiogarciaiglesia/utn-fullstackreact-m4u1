const util = require('util');

// Configuracion de express
const express = require('express');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;


// Configuracion mysql
const mysql = require('mysql');
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'gestion_pagos'
});

conexion.connect((error) => {
    if (error) {
        throw error;
    }

    console.log('Connection with database established.');
});

const qy = util.promisify(conexion.query).bind(conexion); // permite uso de async await con mysql

// GET para mostrar lista de







app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT}`);
});
