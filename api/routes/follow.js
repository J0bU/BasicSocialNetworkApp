'use strict'

const express = require('express');

//Destructuración útil para las funciones por controlador.
let {
	saveFollow,
  deleteFollow,
  getFollowingUsers,
  getFollowedUsers,
  getMyFollows
} = require('../controllers/follow.js');

//Middleware encargado de verificación de imágenes.
const multipart = require('connect-multiparty');
//Se indica el directorio de subida de archivos.
// const ensureUpload = multipart({ uploadDir: './uploads/publications.js' });

const { ensureAuth } = require('../middlewares/authenticated');

let api = express.Router();

	
api.post('/saveFollow',[ensureAuth] ,saveFollow);
api.delete('/deleteFollow/:id', [ensureAuth], deleteFollow);
api.get('/getFollowingUsers/:id?/:page?', [ensureAuth], getFollowingUsers);
api.get('/getFollowedUsers/:id?/:page?', [ensureAuth], getFollowedUsers);
api.get('/getMyFollows/:followed?', [ensureAuth], getMyFollows);


module.exports = api;