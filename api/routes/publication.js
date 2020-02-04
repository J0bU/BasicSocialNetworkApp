'use strict'

const express = require('express');

//Destructuración útil para las funciones por controlador.
let {
	probando,
	savePublication,
	getPublications,
	getPublication,
	deletePublication,
	uploadImage,
	getImageFile
} = require('../controllers/publication.js');

//Middleware encargado de verificación de imágenes.
const multipart = require('connect-multiparty');
//Se indica el directorio de subida de archivos.
const ensureUpload = multipart({ uploadDir: './uploads/publications' });

const { ensureAuth } = require('../middlewares/authenticated');

let api = express.Router();

api.post('/pruebaPublicaton',[ensureAuth], probando);
api.post('/savePublication', [ensureAuth], savePublication);
api.get('/getPublications/:page?', [ensureAuth], getPublications);
api.get('/getPublication/:id', [ensureAuth], getPublication);
api.delete('/deletePublication/:id', [ensureAuth], deletePublication);
api.post('/uploadImagePub/:id', [ensureAuth, ensureUpload],uploadImage );
api.get('/getImagePub/:imageFile', ensureAuth, getImageFile);


module.exports = api;