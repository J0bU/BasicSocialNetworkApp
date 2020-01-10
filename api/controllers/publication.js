'use strict'
/*
	############ SISTEMA PUBLICACIONES ############
	Controlador encargado de manejar la lógica de publicaciones,
*/

const path = require('path'); //Manejar la ruta del path.
const fs = require('fs');     //Manejar FileSystem.
const moment = require('moment'); //Manejar fechas.
const mongoosePaginate = require('mongoose-pagination'); //Manejar paginación.

// ---- Importación de modelos creados con Mongoose ----
const Publication = require('../models/publication.js');
const User = require('../models/user.js');
const Follow = require('../models/follow.js');


function probando(req, res){

	return res.status(200).json({
		ok: true,
		message: 'Controlador de publicaciones'
	});
};

module.exports = {
	probando
};