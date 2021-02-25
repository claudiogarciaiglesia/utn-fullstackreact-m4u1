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

// POST para cargar nuevos clientes

app.post('/clientes', async (req, res) => {
    try {
        if ((!req.body.nombre) || (req.body.nombre.length < 3)) {
            throw new Error('El nombre debe tener mas de 3 caracteres');
        };

        let query = `INSERT INTO clientes (nombre) VALUES ("${req.body.nombre}")`;
        let queryRes = await qy(query);

        let newId = queryRes.insertId;
        query = `SELECT * FROM clientes WHERE id = "${newId}"`;
        queryRes = await qy(query);

        res.status(201);
        res.send(queryRes[0]);

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

// POST para cargar nuevos trabajos y asigarles un cliente
app.post('/trabajos', async (req, res) => {
    try {
        if ((!req.body.descripcion) || (req.body.descripcion.length < 3)) {
            throw new Error('La descripcion debe tener mas de 3 caracteres');
        };

        if (!req.body.id_clientes) {
            throw new Error('No se envio el ID del cliente asociado');
        };

        let query = `SELECT * FROM clientes WHERE id = "${req.body.id_clientes}"`;
        let queryRes = await qy(query);

        if (queryRes.length === 0) {
            throw new Error('No se encontro el ID del cliente asociado')
        };

        query = `INSERT INTO trabajos (descripcion, id_clientes) VALUES ("${req.body.descripcion}", "${req.body.id_clientes}")`;
        queryRes = await qy(query);

        let newId = queryRes.insertId;
        query = `SELECT * FROM trabajos WHERE id = "${newId}"`;
        queryRes = await qy(query);

        res.status(201);
        res.send(queryRes[0]);

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

// GET para mostrar lista de todos los clientes
app.get('/clientes', async (req, res) => {
    try {

        let query = `SELECT * FROM clientes`;
        let queryRes = await qy(query);

        res.send(queryRes);

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

// GET para mostrar lista de todos los trabajos
app.get('/trabajos', async (req, res) => {
    try {

        let query = `SELECT * FROM trabajos`;
        let queryRes = await qy(query);

        res.send(queryRes);

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});


// GET para mostrar lista de trabajos filtrados por cliente, finalizado, sin finalizar, pagado e impago
app.get('/trabajos/:id_clientes?/:finalizado?/:pagado?', async (req, res) => {
    try {

        console.log(req.params);

        let { id_clientes, finalizado, pagado } = req.params;

        id_clientes = `"${id_clientes}"`;
        finalizado = !!finalizado && `"${finalizado}"`;
        pagado = !!pagado && `"${pagado}"`;


        console.log(id_clientes + finalizado + pagado);

        const conditions = `id_clientes = ${id_clientes} ${!!finalizado ? " AND finalizado = " + finalizado : ""} ${!!pagado ? " AND pagado = " + pagado : ""} `;

        // const columns = `id_clientes${ !!finalizado && ', finalizado' } ${ !!pagado && ', pagado' } `;
        // const values = ``;

        let query = `SELECT * FROM trabajos WHERE ${conditions} `;
        let queryRes = await qy(query);

        console.log(query);
        res.send(queryRes);
        // res.send('ok test' + id_clientes + finalizado + pagado);

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

// PUT para modificar clientes
app.put('/clientes/:id', async (req, res) => {
    try {

        if (!req.body.nombre) {
            throw new Error('No se envio el nombre');
        };

        let query = `UPDATE clientes SET nombre = "${req.body.nombre}" WHERE id = "${req.params.id}"`;
        let queryRes = await qy(query);

        query = `SELECT * FROM clientes WHERE id = "${req.params.id}"`;
        queryRes = await qy(query);

        res.send(queryRes[0]);

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});


// PUT para modificar descripcion de trabajos
app.put('/trabajos/:id/descripcion', async (req, res) => {
    try {

        if (!req.body.descripcion) {
            throw new Error('No se envio la descripcion');
        };

        let query = `UPDATE trabajos SET descripcion = "${req.body.descripcion}" WHERE id = "${req.params.id}"`;
        let queryRes = await qy(query);

        query = `SELECT * FROM trabajos WHERE id = "${req.params.id}"`;
        queryRes = await qy(query);

        res.send(queryRes[0]);

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

// PUT para modificar finalizacion de trabajos
app.put('/trabajos/:id/finalizado', async (req, res) => {
    try {

        if ((req.body.finalizado !== "0") && (req.body.finalizado !== "1")) {
            throw new Error('El estado de finalizacion debe ser 0 o 1');
        };

        let query = `UPDATE trabajos SET finalizado = "${req.body.finalizado}" WHERE id = "${req.params.id}"`;
        let queryRes = await qy(query);

        query = `SELECT * FROM trabajos WHERE id = "${req.params.id}"`;
        queryRes = await qy(query);

        res.send(queryRes[0]);

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

// PUT para modificar pago de trabajos
app.put('/trabajos/:id/pagado', async (req, res) => {
    try {

        if ((req.body.pagado !== "0") && (req.body.pagado !== "1")) {
            throw new Error('El estado de finalizacion debe ser 0 o 1');
        };

        let query = `UPDATE trabajos SET pagado = "${req.body.pagado}" WHERE id = "${req.params.id}"`;
        let queryRes = await qy(query);

        query = `SELECT * FROM trabajos WHERE id = "${req.params.id}"`;
        queryRes = await qy(query);

        res.send(queryRes[0]);

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    }
});

// DELETE para borrar clientes 
app.delete('/clientes/:id', async (req, res) => {
    try {

        let query = `DELETE FROM trabajos WHERE id_clientes = "${req.params.id}"`;
        let queryRes = await qy(query);

        query = `DELETE FROM clientes WHERE id = "${req.params.id}"`;
        queryRes = await qy(query);

        res.status(204);
        res.send();

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    };


});


// DELETE para borrar trabajos
app.delete('/trabajos/:id', async (req, res) => {
    try {

        let query = `DELETE FROM trabajos WHERE id = "${req.params.id}"`;
        let queryRes = await qy(query);

        res.status(204);
        res.send();

    } catch (e) {
        console.log(e.message);
        res.status(413).send({ "Error": e.message });
    };

});



app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT} `);
});
