'use strict'

/*
	 Index: Contendrá el llamado a cada ruta (Controlador),
	 es decir, cualquier controlador creado en la carpeta
	 'controllers' vendrá a parar acá para que realice su
	 función sin necesidad de saturar el fichero app.js.
*/
const express = require('express');

const app = express();

app.use(require('./user.js'));
app.use(require('./follow.js'));
app.use(require('./publication.js'));

module.exports = app;
