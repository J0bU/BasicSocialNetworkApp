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

//---- MÉTODO DE PRUEBA PUBLICACIONES.
function probando(req, res){

	return res.status(200).json({
		ok: true,
		message: 'Controlador de publicaciones'
	});
};

// ----------- Método encargado de generar publicaciones por usuario actualmente logueado -----
function savePublication(req, res){

	// Obtención de los parámetros
	let params = req.body;

	if(!params.text) return res.status(404).json({ok:false, message: 'Debes envíar un texto'});

	let publication = new Publication({
		text: params.text,
		file: null,
		//Fecha actual de la creación de la publicación.
		create_at: moment().unix(),
		// Usuario que está creando la publicación (Usuario logueado actualmente).
		user: req.userToken._id
	});

	publication.save((error, newPublication) => {

		if (error) return res.status(500).json({ok: false, statusCode: 500, error: error });
    	
    	if(!newPublication) return res.status(404).json({ok:false, statusCode:404, message: 'No se ha guardado la publicación.'});

    	return res.json({
    		ok: true,
    		statusCode: 200,
    		follow: newPublication
    	});
	});

};

//------------Método encargado de devolver todas las publicaciones de los usuarios que sigo actualmente---------
/*
 1. Tomará el id del usuario actualmente logueado.
 2. Realizar un find de los usuarios seguidos.
 3. Realizar la búsqueda de las publicaciones de los usuarios seguidos.

*/

function getPublications(req, res){	

	let page = 1;

	if(req.params.page) page = req.params.page;
	
	let itemsPerPage = 4;
	let idUser = req.userToken._id;

	//Búsqueda del usuario que está logueado actualmente para obtener cada uno de sus seguidores.
	Follow.find({user: idUser}).populate({path:'followed'}).exec((error, userResult) => {

		if (error) return res.status(500).json({ok: false, statusCode: 500, error: error });

		let follows_clean = [];

		userResult.forEach(element => {
			//Se agregan a un arreglo cada uno de los seguidores que tiene el usuario logueado.
			follows_clean.push(element.followed);
		});

		//Se busca cada publicación por el id de los usuarios seguidos
		//Buscará todos los usuarios cuyo contenido está dentro del arreglo follows_clean.
		Publication.find({user: {"$in": follows_clean} }).sort().populate({path:'user'}).paginate(page, itemsPerPage, (error, publications,total) => {
			
			if (error) return res.status(500).json({ok: false, statusCode: 500, error: error });

			if(!publications) return res.status(404).json({ok:false, statusCode: 404, message: 'No hay publlicaciones'});

			return res.json({
				ok:true,
				statusCode:200, 
				total_items: total,
				page: page,
				pages: Math.ceil(total/itemsPerPage),
				publications
				
			});
		});
	});

};

//-------- Método para devolver una publicación en base a su id -----
function getPublication(req, res){

	let publicationId = req.params.id;

	Publication.findById(publicationId, (error, publication) =>{

		if (error) return res.status(500).json({ok: false, statusCode: 500, error: error });

		if(!publication) return res.status(404).json({ok:false, statusCode: 404, message: 'No existe la publicación'});

		return res.json({
			ok: true,
			statusCode: 200,
			publication
		});
	});
};

//------------- Método para eliminar una publicación ---------
function deletePublication(req, res){

	let publicationId = req.params.id;

	Publication.find({user: req.userToken._id, _id: publicationId }).deleteOne((error, publicationRemoved) => {

		if(error) return res.status(500).json({ok:false, statusCode:500, error});

		if(publicationRemoved.n === 0) return res.status(404).json({ok:false, statusCode:404, message: 'No se logró eliminar la imagen'});
		
		return res.json({ok:true, statusCode:200, message: 'Se eliminó la imagen'});
	});
};

//---------Subir archivos de imagen_avatar_usuario-----
function uploadImage(req, res) {

	//Obtenemos el id del usuario que traerá el token.
	let identityUserId = req.userToken._id;
	let idPublication = req.params.id;
	
	if (req.files || Object.keys(req.files).length !== 0) {
	  
	  //Se obtiene la ruta en donde se están almacenando las imágenes
	  let filePath = req.files.image.path;
	  
	  let fileSplit = req.files.image.path.split('\\');
	  
	  //Se genera un arreglo con las divisiones de cada una de las rutas
	  //además se obtiene el nombre del archivo.
	  let fileName = fileSplit[2];
	  
	  let extSplit = fileName.split('\.');
	  
	  let fileExt = extSplit[1];
	  
	  //Extensiones válidas
	  let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
	  
	  if(extensionesValidas.indexOf(fileExt) >= 0){

		Publication.findOne({'user': req.userToken._id, '_id': idPublication}).exec((error, publication) => {

			if(publication) {

				Publication.findByIdAndUpdate(idPublication, {file: fileName}, {new: true}, (error, publicationUpdate) => {
		  
				if (error) return res.status(500).json({ok: false,statusCode: 500,error: error});
			  
				if (!publicationUpdate) return res.status(404).json({ok: false,statusCode: 404,message: 'No se actualizó ninguna publicación.'});
		  
				return res.json({
					ok: true,
					statusCode: 200,
					user: publicationUpdate
				});
		  
			  });
			}else{
				return removeFilesOfUploads(res,filePath, 'No tienes permiso para actualizar esta publicación.');
			}
		});
  
	  }else{
  
		return removeFilesOfUploads(res,filePath, `Las extensiones permitidas son; ${extensionesValidas.join(',')}`);
	  }
  
	}else{
	  
	  return res.status(412).json({
		  ok: false,
		  statusCode: 412,
		  message: 'No se subió ningún archivo'
	  });
	}
  
  };
  
  function removeFilesOfUploads(res, file_path, message){
	fs.unlink(file_path, (error) => {
	  return res.status(200).json({
		ok: false,
		message
	  });
	});
  }
  //-----Función encargada de obtener la imágen del usuario ingresado----
  
  function getImageFile(req, res) {
  
	let imageFile = req.params.imageFile;
	let pathFile = './uploads/publications/' + imageFile;
  
	fs.exists(pathFile, (exists) => {
	  if (exists) {
		  res.sendFile(path.resolve(pathFile));
	  } else {
		res.status(412).json({
			ok: false,
			statusCode: 412,
			message: 'No existe la imagen'
		});
	  }
	});
  };

module.exports = {
	probando,
	savePublication,
	getPublications,
	getPublication,
	deletePublication,
	uploadImage,
	getImageFile

};