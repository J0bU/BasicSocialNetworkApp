'use strict'

/*
	################### SISTEMA FOLLOW ####################
	Sistema de seguimiento: dará la posiblidad a los usuarios de
	seguirse y no seguirse entre ellos, además proporcionará un 
	listado de los usuarios que siguen a otros y los usuarios
	seguidos por un perfil en particular.
*/

const path = require('path'); //Manejar la ruta del path.
const fs = require('fs');     //Manejar FileSystem.
const moment = require('moment'); //Manejar fechas.
const mongoosePaginate = require('mongoose-pagination'); //Manejar paginación.


// ---- Importación de modelos creados con Mongoose ----
const User = require('../models/user.js');
const Follow = require('../models/follow.js');

function saveFollow(req, res){

	// Se capturan los valores que vienen de body
	let params = req.body;
	// Se crea el nuevo objeto Follow al que se asignará información.
	let follow = new Follow({
		user : req.userToken._id,
		followed: params.followed
	/*
	También puede ser reemplazado por lo siguiente:
		let follow = new Follow();
		follow.user = req.userToken._id;
		follow.followed = params.followed;
	*/
	});

	//Se guardará en la colección de seguidos la información.
	follow.save((error, newFollow) => {

		if (error) return res.status(500).json({ok: false, statusCode: 500, error: error });
    	
    	if(!newFollow) return res.status(404).json({ok:false, statusCode:404, message: 'No se ha guardado el follow'});

    	return res.json({
    		ok: true,
    		statusCode: 200,
    		follow: newFollow
    	});
	});

};

// ------- Método encargado para dejar de seguir un usuario ----
function deleteFollow(req, res){

	let userId = req.userToken._id;
	let followId = req.params.id;

	//find(): Tomará los parámetros como nombres del esquema creado.
	Follow.find({'user': userId, 'followed': followId}).deleteOne( error => {
		if (error) return res.status(500).json({ok: false, statusCode: 500, error: error });

		return res.json({
			ok: true,
			statusCode: 200,
			message: 'El follow se ha eliminado'
		});

	});

};

// ------ Listar resultado paginado de los usuarios que sigo ----
function getFollowingUsers(req, res){
	
	let userId = req.userToken._id;

	//Si llega el id del usuario por petición.
	if(req.params.id) userId = req.params.id;

	let page = 1; //Página por defecto.
	if(req.params.page) page = req.params.page;

	let itemsPerPage = 4; //Elementos por página por defecto.

	//Se busca todos los follows en donde el usuario sea
	//el que se pasa por parámetro o el logueado actualmente.
	Follow.find({'user': userId}).populate({path: 'followed'})
	.paginate(page, itemsPerPage, (error, follows, total) => {

    if (error) return res.status(500).json({ok: false,statusCode: 500,error: error});

    if (follows.length === 0) {
        return res.status(404).json({
            ok: false,
            statusCode: 404,
            message: "No estás siguiendo a nadie aún."
        });
    }

    res.json({
        ok: true,
        statusCode: 200,
        follows,
        total,
        pages: Math.ceil(total / itemsPerPage)
    });

  });
};

// ------ Listar resultado paginado de los usuarios que me siguen---
function getFollowedUsers(req, res){
	let userId = req.userToken._id;

	//Si llega el id del usuario por petición.
	if(req.params.id) userId = req.params.id;

	let page = 1; //Página por defecto.
	if(req.params.page) page = req.params.page;

	let itemsPerPage = 4; //Elementos por página por defecto.

	//Se busca todos los follows en donde el usuario sea
	//el que se pasa por parámetro o el logueado actualmente.
	Follow.find({'followed': userId}).populate( 'user')
	.paginate(page, itemsPerPage, (error, follows, total) => {

    if (error) return res.status(500).json({ok: false,statusCode: 500,error: error});

    if (follows === 0) {
      return res.status(404).json({
          ok: false,
          statusCode: 404,
          message: "No te sigue ningún usuario."
      });
    }

    res.json({
      ok: true,
      statusCode: 200,
      follows,
      total,
      pages: Math.ceil(total / itemsPerPage)
    });

  });
};

// ------ Función encargada de mostrar todos los usuarios ----

function getMyFollows(req, res){

	let userId = req.userToken._id;

	let find = Follow.find({user:userId});

	if(req.params.followed)
		find = Follow.find({followed:req.params.followed});

	find.populate('user followed')
	.exec((error, followsDB) => {

    if(error){
       return  res.status(500).json({
            ok: false,
            statusCode: 500,
            error: error
        });
    }

    if(followsDB.length === 0)
    	return res.status(404).json({
    		ok: false,
    		statusCode: 404,
    		message: 'Aún no estás activo en la acción de seguidores.'
    	});

    Follow.countDocuments({user: userId}, (error, conteo) => {
        
        res.json({
            ok: true,
            statusCode: 200,
            follows: followsDB,
            total: conteo
        });

    });

	});

};


module.exports = {
	saveFollow,
	deleteFollow,
	getFollowingUsers,
	getFollowedUsers,
	getMyFollows
}

