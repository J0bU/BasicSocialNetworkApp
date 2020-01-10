'use strict'

const express = require('express');
const {
    home,
    prueba,
    registerUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile
} = require('../controllers/users'); //Se traen las funciones creadas en usuarios.

//Middleware encargado de verificación de imágenes.
const multipart = require('connect-multiparty');
//Se indica el directorio de subida de archivos.
const ensureUpload = multipart({ uploadDir: './uploads/users' });

const { ensureAuth } = require('../middlewares/authenticated');

let api = express.Router();

api.post('/registerUser', registerUser); //Se creará un servicio en /registerUser
api.post('/loginUser', loginUser);
api.get('/getUser/:id', ensureAuth, getUser);
api.get('/getUsers/:page?', ensureAuth, getUsers); //Caracter ?: argumento opcional.
api.get('/getCounters/:id?', ensureAuth, getCounters);
api.put('/updateUser/:id', ensureAuth, updateUser);
api.post('/uploadImage/:id', [ensureAuth, ensureUpload], uploadImage);
api.get('/getImageUser/:imageFile', ensureAuth, getImageFile);

module.exports = api;