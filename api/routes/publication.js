'use strict'

const express = require('express');

//Destructuración útil para las funciones por controlador.
let {
	probando
} = require('../controllers/publication.js');

//Middleware encargado de verificación de imágenes.
const multipart = require('connect-multiparty');
//Se indica el directorio de subida de archivos.
const ensureUpload = multipart({ uploadDir: './uploads/publications.js' });

const { ensureAuth } = require('../middlewares/authenticated');

let api = express.Router();

api.post('/pruebaPublicaton',[ensureAuth], probando);


module.exports = api;