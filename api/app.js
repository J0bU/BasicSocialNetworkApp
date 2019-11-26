'use strict'
//Delaración constante express que permitirá trabajar con el servidor local.
const express = require('express');
//Declaración constante body-parser que permitirá trabajar con archivos.json y parsearlos para JS.
const bodyParser = require('body-parser');


//Import config.
require('./config/config');

//Declaración de la constante app que invocará a express.
const app = express();

//Sección para cargar middlewares.
//Middleware: método que se ejecuta antes de que llegue a un controlador en cada petición.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); //Información lo convertirá en un tipo JSON.


//Sección para cargar rutas desde index.js que contendrá las demás rutas.
let userRouter = require('./routes/user');
app.use('/api', userRouter); //'api/home'
//Por último se trae la creación del Router y finalizará con dos servicios en las rutas
// localhost:ttt/api/home
// localhost:ttt/api/prueba


//Sección para cors.


module.exports = app;